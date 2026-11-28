const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');

const base = process.env.CONTRACT_TEST_URL || 'http://127.0.0.1:41755/';
const engines = process.env.CONTRACT_TEST_ENGINE === 'webkit' ? [webkit] : process.env.CONTRACT_TEST_ENGINE === 'chromium' ? [chromium] : [chromium, webkit];
const widths = process.env.CONTRACT_TEST_WIDTH ? [Number(process.env.CONTRACT_TEST_WIDTH)] : [320, 390];
const tap = async locator => { await locator.scrollIntoViewIfNeeded(); await locator.tap(); };
const imageName = url => new URL(url).pathname.split('/').pop();
const waitFor = async (condition, message, attempts = 150) => {
  for (let i = 0; i < attempts; i++) { if (condition()) return; await new Promise(resolve => setTimeout(resolve, 100)); }
  throw new Error(message);
};
const waitForFullPreview = async (page, id) => {
  const selector = `[data-testid="contract-direction-${id}"] img`;
  await page.waitForFunction(selector => {
    const image = document.querySelector(selector);
    return image && image.getAttribute('src')?.includes('-320.webp?v=real-screens-20261128') && image.complete && image.naturalWidth >= 300;
  }, selector, { timeout: 15000 });
};

async function run(engine, width, saveData) {
  const browser = await engine.launch();
  const context = await browser.newContext({
    viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    locale: 'ru-RU', serviceWorkers: 'block', reducedMotion: 'reduce',
  });
  await context.addInitScript(dataSaving => {
    localStorage.setItem('app-language', 'ru');
    localStorage.removeItem('web4tg:contract-draft:v1');
    if (dataSaving) Object.defineProperty(navigator, 'connection', {
      configurable: true, value: { saveData: true, effectiveType: '4g', addEventListener() {}, removeEventListener() {} },
    });
  }, saveData);
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
  const requested = [], errors = [], waiting = [];
  let gateClosed = true, inFlight = 0, peakInFlight = 0;
  await context.route('**/order-contract-previews/**', async route => {
    const url = route.request().url();
    requested.push(url);
    inFlight++;
    peakInFlight = Math.max(peakInFlight, inFlight);
    try {
      if (gateClosed) await new Promise(resolve => waiting.push(resolve));
      await route.continue();
    } finally { inFlight--; }
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('/#/profile', base).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-contract').waitFor();
    await page.waitForTimeout(450);
    assert.equal(requested.length, 0, 'images are not downloaded on profile without intent to open the contract');
    await tap(page.getByTestId('profile-contract'));
    await page.getByTestId('contract-questionnaire').waitFor();
    await waitFor(() => requested.some(url => imageName(url) === 'clothes-320.webp') && requested.some(url => imageName(url) === 'sneakers-320.webp'), 'first images did not start');
    await page.waitForTimeout(300);

    const firstNames = requested.map(imageName);
    assert.ok(firstNames.includes('clothes-320.webp'), 'the first project image starts on opening the contract');
    assert.ok(firstNames.includes('sneakers-320.webp'), 'the adjacent project image starts on opening the contract');
    for (const url of requested) assert.equal(new URL(url).searchParams.get('v'), 'real-screens-20261128', 'all image requests use the current cache version');
    assert.ok(peakInFlight <= 2, `limited initial image concurrency, saw ${peakInFlight}`);
    assert.ok(new Set(requested).size <= 2, `the initial render must not start the entire gallery, saw ${new Set(requested).size}`);

    // Even while the full images are held back by the network, users should
    // see a local image preview instead of an empty card.
    for (const id of ['clothes', 'sneakers']) {
      const image = page.getByTestId(`contract-direction-${id}`).locator('img');
      assert.equal(await image.evaluate(el => el.currentSrc.startsWith('data:image/') && el.complete && el.naturalWidth > 0), true, `${id}: embedded preview is visible before the network responds`);
    }
    gateClosed = false;
    while (waiting.length) waiting.shift()();
    for (const id of ['clothes', 'sneakers']) {
      await waitForFullPreview(page, id);
    }
    if (saveData) {
      await page.waitForTimeout(600);
      assert.ok(!requested.some(url => /\/(?:takt-coffee|lumi-studio|medical-center)-320\.webp/.test(url)), 'Save-Data prevents background downloads from hidden categories');
    }

    await tap(page.getByTestId('contract-category-food'));
    const coffee = page.getByTestId('contract-direction-takt-coffee').locator('img');
    await waitForFullPreview(page, 'takt-coffee');
    assert.match(await coffee.getAttribute('src'), /takt-coffee-320\.webp\?v=real-screens-20261128/, 'the food category uses the actual coffee preview');

    await tap(page.getByTestId('contract-category-services'));
    const salon = page.getByTestId('contract-direction-lumi-studio').locator('img');
    await waitForFullPreview(page, 'lumi-studio');
    await tap(page.getByTestId('contract-category-shops'));
    const furniture = page.getByTestId('contract-direction-furniture-studio');
    await furniture.scrollIntoViewIfNeeded();
    const furnitureImage = furniture.locator('img');
    await waitForFullPreview(page, 'furniture-studio');
    assert.match(await furnitureImage.getAttribute('src'), /furniture-studio-320\.webp\?v=real-screens-20261128/, 'scroll loads the actual furniture preview');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()} ${width} saveData=${saveData}: embedded previews, limited requests and category images`);
  } finally {
    gateClosed = false;
    while (waiting.length) waiting.shift()();
    await context.close();
    await browser.close();
  }
}

async function runFailure(engine) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => {
    localStorage.setItem('app-language', 'ru');
    localStorage.removeItem('web4tg:contract-draft:v1');
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true, effectiveType: '4g', addEventListener() {}, removeEventListener() {} } });
  });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
  let failed = 0;
  await context.route('**/order-contract-previews/furniture-studio-320.webp**', route => { failed++; return route.abort('failed'); });
  const page = await context.newPage();
  try {
    await page.goto(new URL('/#/contract', base).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('contract-questionnaire').waitFor();
    const card = page.getByTestId('contract-direction-furniture-studio');
    await card.scrollIntoViewIfNeeded();
    await waitFor(() => failed > 0, 'the furniture image did not start when scrolled into view');
    await page.waitForTimeout(300);
    assert.equal(await card.locator('img').evaluate(el => el.currentSrc.startsWith('data:image/') && el.complete && el.naturalWidth > 0), true, 'a failed full image retains the embedded preview');
    await tap(card);
    assert.equal(await card.getAttribute('aria-pressed'), 'true', 'a failed image does not prevent selecting the project');
    console.log(`PASS ${engine.name()}: image failure keeps preview and choice available`);
  } finally { await context.close(); await browser.close(); }
}

async function runHighDensity(engine) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 4, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => { localStorage.setItem('app-language', 'ru'); localStorage.removeItem('web4tg:contract-draft:v1'); });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
  const page = await context.newPage();
  try {
    await page.goto(new URL('/#/contract', base).href, { waitUntil: 'domcontentloaded' });
    const image = page.getByTestId('contract-direction-clothes').locator('img');
    await image.waitFor({ state: 'attached' });
    assert.match(await image.getAttribute('data-full-src'), /clothes\.webp\?v=real-screens-20261128$/, 'high-density displays keep the larger preview');
    await page.waitForFunction(() => {
      const img = document.querySelector('[data-testid="contract-direction-clothes"] img');
      return img?.dataset.previewReady === 'true' && img.complete && img.naturalWidth === 640;
    }, null, { timeout: 15000 });
    console.log(`PASS ${engine.name()}: high-density display uses a 640 px preview`);
  } finally { await context.close(); await browser.close(); }
}

async function runStalled() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => { localStorage.setItem('app-language', 'ru'); localStorage.removeItem('web4tg:contract-draft:v1'); });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
  const held = [], started = [], failed = [];
  await context.route('**/order-contract-previews/**', async route => {
    const name = imageName(route.request().url());
    if (name === 'clothes-320.webp' || name === 'sneakers-320.webp') {
      await new Promise(resolve => held.push(resolve));
      try { await route.continue(); } catch { /* The browser cancelled the stale request. */ }
    } else await route.continue();
  });
  const page = await context.newPage();
  page.on('request', request => { if (request.url().includes('/order-contract-previews/')) started.push({ name: imageName(request.url()), at: Date.now() }); });
  page.on('requestfailed', request => { if (request.url().includes('/order-contract-previews/')) failed.push({ name: imageName(request.url()), at: Date.now() }); });
  try {
    await page.goto(new URL('/#/contract', base).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('contract-questionnaire').waitFor();
    await waitFor(() => started.length >= 2, 'the first previews did not start');
    await waitFor(() => started.some(item => !['clothes-320.webp', 'sneakers-320.webp'].includes(item.name)), 'background queue did not resume after the stalled requests', 230);
    const next = started.find(item => !['clothes-320.webp', 'sneakers-320.webp'].includes(item.name));
    assert.ok(failed.some(item => ['clothes-320.webp', 'sneakers-320.webp'].includes(item.name) && item.at <= next.at), 'a stalled image request must be cancelled before its queue slot is reused');
    for (const id of ['clothes', 'sneakers']) {
      const image = page.getByTestId(`contract-direction-${id}`).locator('img');
      assert.equal(await image.evaluate(el => el.currentSrc.startsWith('data:image/') && el.complete && el.naturalWidth > 0), true, `${id}: thumbnail stays visible on a stalled connection`);
    }
    console.log('PASS chromium: stalled previews are cancelled, queue resumes and thumbnails remain');
  } finally {
    while (held.length) held.shift()();
    await context.close();
    await browser.close();
  }
}

(async () => { for (const engine of engines) { for (const width of widths) for (const saveData of [false, true]) await run(engine, width, saveData); await runFailure(engine); await runHighDensity(engine); } if (engines.includes(chromium)) await runStalled(); })()
  .catch(error => { console.error(error); process.exitCode = 1; });
