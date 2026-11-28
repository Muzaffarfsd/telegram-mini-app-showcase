const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');

const base = process.env.CONTRACT_TEST_URL || 'http://127.0.0.1:41755/';
const groups = {
  shops: [
    ['clothes', 'muraka-fashion', /150\s*000/],
    ['sneakers', 'nike-sneakers', /150\s*000/],
    ['tech', 'apple-store', /150\s*000/],
    ['flowers', 'flower-store', /150\s*000/],
    ['women-fashion', 'women-fashion', /150\s*000/],
    ['furniture-studio', 'furniture-studio', /по согласованию/i],
    ['opt-market', 'opt-market', /по согласованию/i],
    ['jewelry-store', 'jewelry-store', /150\s*000/],
    ['skincare-aura', 'skincare-aura', /150\s*000/],
  ],
  food: [
    ['restaurant', null, /180\s*000/],
    ['takt-coffee', 'takt-coffee', /180\s*000/],
  ],
  services: [
    ['services', null, /170\s*000/],
    ['lumi-studio', 'lumi-studio', /170\s*000/],
    ['medical-center', 'medical-center', /по согласованию/i],
    ['china-buyer', 'china-buyer', /по согласованию/i],
  ],
};
const projectIds = Object.values(groups).flat().map(item => item[1]).filter(Boolean);
const tap = async locator => { await locator.scrollIntoViewIfNeeded(); await locator.tap(); };
const norm = value => value.replace(/\s+/gu, ' ').trim();

async function run(engine, width) {
  const browser = await engine.launch();
  const context = await browser.newContext({
    viewport: { width, height: 700 }, isMobile: true, hasTouch: true,
    deviceScaleFactor: 2, locale: 'ru-RU', serviceWorkers: 'block',
  });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
  await context.addInitScript(() => { localStorage.setItem('app-language', 'ru'); localStorage.removeItem('web4tg:contract-draft:v1'); });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('/#/contract', base).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('contract-questionnaire').waitFor();
    for (const id of projectIds) assert.equal(await page.locator(`[data-project-id="${id}"]`).count(), 1, `project ${id} must occur exactly once`);
    assert.equal(projectIds.length, 13);
    for (const [category, cards] of Object.entries(groups)) {
      await tap(page.getByTestId(`contract-category-${category}`));
      const rail = page.locator(`.cq-directions[data-category="${category}"]`);
      assert.equal(await rail.isVisible(), true, `${category} rail must be visible`);
      for (const [id, , price] of cards) {
        const card = page.getByTestId(`contract-direction-${id}`);
        await card.scrollIntoViewIfNeeded();
        assert.equal(await card.isVisible(), true, `${id} must be available`);
        assert.match(norm(await card.innerText()), price, `price for ${id}`);
        const img = card.locator('img');
        if (id === 'restaurant' || id === 'services') {
          assert.equal(await img.count(), 0, `${id}: generic directions must not display an unrelated app`);
          assert.equal(await card.locator('.cq-direction-generic').isVisible(), true, `${id}: generic direction uses a neutral icon`);
        }
        if (await img.count()) {
          const fullUrl = await img.getAttribute('data-full-src');
          assert.ok(fullUrl, `${id}: the full preview has an explicit source`);
          assert.equal(new URL(fullUrl, base).searchParams.get('v'), 'real-screens-20261128', `${id}: current previews must use the new cache version`);
          await page.waitForFunction(id => {
            const image = document.querySelector(`[data-testid="contract-direction-${id}"] img`);
            return image && image.dataset.previewReady === 'true' && image.complete && image.naturalWidth >= 300 && image.currentSrc === new URL(image.dataset.fullSrc, location.href).href;
          }, id, { timeout: 20000 });
          await img.evaluate(el => el.decode());
          const geometry = await img.evaluate(el => {
            const box = el.getBoundingClientRect(), style = getComputedStyle(el);
            return { width: box.width, height: box.height, naturalWidth: el.naturalWidth, naturalHeight: el.naturalHeight, fit: style.objectFit };
          });
          assert.ok(geometry.naturalWidth > 0 && geometry.naturalHeight > 0 && geometry.width > 0 && geometry.height > 0, `${id}: image loads and is visible`);
          const distortion = Math.abs((geometry.width / geometry.height) / (geometry.naturalWidth / geometry.naturalHeight) - 1);
          assert.ok(distortion < 0.02, `${id}: image must preserve source aspect ratio`);
        }
        await tap(card);
        assert.equal(await card.getAttribute('aria-pressed'), 'true', `${id} must be selectable`);
      }
    }

    await tap(page.getByTestId('contract-category-shops'));
    const rail = page.locator('.cq-directions[data-category="shops"]');
    await rail.scrollIntoViewIfNeeded();
    await rail.evaluate(el => { el.scrollLeft = 0; });
    const dimensions = await rail.evaluate(el => ({ clientWidth: el.clientWidth, scrollWidth: el.scrollWidth }));
    assert.ok(dimensions.scrollWidth > dimensions.clientWidth + 20, 'shop cards form a genuinely scrollable horizontal rail');
    assert.equal(await rail.evaluate(el => getComputedStyle(el).scrollSnapType), 'none', 'the carousel must not force a snap after a gesture');
    await rail.evaluate(el => { el.scrollLeft = 137; });
    await page.waitForTimeout(350);
    assert.ok(Math.abs(await rail.evaluate(el => el.scrollLeft) - 137) <= 1, 'a free position must not be pulled toward a card');
    await rail.evaluate(el => { el.scrollLeft = 0; });
    const rect = await rail.boundingBox();
    const x = rect.x + rect.width * 0.73, y = rect.y + rect.height * 0.5;
    if (engine.name() === 'chromium') {
      const cdp = await context.newCDPSession(page);
      const cardRect = await page.getByTestId('contract-direction-clothes').boundingBox();
      const pressX = cardRect.x + cardRect.width / 2, pressY = cardRect.y + cardRect.height / 2;
      assert.equal(await page.evaluate(({x,y}) => !!document.elementFromPoint(x,y)?.closest('[data-testid="contract-direction-clothes"]'), {x:pressX,y:pressY}), true, 'touch starts on the visible card');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: pressX, y: pressY, id: 1 }] });
      const actualPress = await page.getByTestId('contract-direction-clothes').evaluate(el => ({transform:getComputedStyle(el).transform, opacity:getComputedStyle(el).opacity}));
      assert.equal(actualPress.transform, 'none', 'the card must not shrink beneath a touching finger');
      assert.equal(actualPress.opacity, '1', 'the card must not fade beneath a touching finger');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      // Some mobile Chromium builds delay :active until touch release, so
      // also assert the actual pressed-state rule using the DevTools CSS API.
      await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
      const documentNode = await cdp.send('DOM.getDocument');
      const cardNode = await cdp.send('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '[data-testid="contract-direction-clothes"]' });
      await cdp.send('CSS.forcePseudoState', { nodeId: cardNode.nodeId, forcedPseudoClasses: ['active'] });
      const forcedPress = await page.getByTestId('contract-direction-clothes').evaluate(el => ({transform:getComputedStyle(el).transform, opacity:getComputedStyle(el).opacity}));
      assert.equal(forcedPress.transform, 'none', 'the active CSS state must not scale the card');
      assert.equal(forcedPress.opacity, '1', 'the active CSS state must not fade the card');
      await cdp.send('CSS.forcePseudoState', { nodeId: cardNode.nodeId, forcedPseudoClasses: [] });
      const swipe = async (sx, sy, dx, dy) => {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy, id: 1 }] });
        for (let i = 1; i <= 8; i++) {
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + dx * i / 8, y: sy + dy * i / 8, id: 1 }] });
          await page.waitForTimeout(16);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      };
      await swipe(x, y, -Math.min(180, rect.width * 0.5), 0);
      await page.waitForTimeout(450);
      assert.ok(await rail.evaluate(el => el.scrollLeft) > 15, 'a horizontal touch gesture moves the card rail');
      await page.evaluate(() => { const root = document.getElementById('root'); if (root) root.scrollTop = 0; window.scrollTo(0, 0); });
      await rail.scrollIntoViewIfNeeded();
      const before = await page.evaluate(() => ({ root: document.getElementById('root')?.scrollTop || 0, window: window.scrollY }));
      const current = await rail.boundingBox();
      await swipe(current.x + current.width * 0.5, current.y + current.height * 0.5, 0, -160);
      await page.waitForTimeout(450);
      const after = await page.evaluate(() => ({ root: document.getElementById('root')?.scrollTop || 0, window: window.scrollY }));
      assert.ok(after.root > before.root + 5 || after.window > before.window + 5, 'a vertical touch gesture on the rail moves the page');
    } else {
      // Playwright's mobile WebKit exposes tap only; verify the native overflow
      // container is scrollable without claiming an emulated finger gesture.
      await rail.evaluate(el => el.scrollBy({ left: 180, behavior: 'instant' }));
      await page.waitForTimeout(300);
      assert.ok(await rail.evaluate(el => el.scrollLeft) > 15, 'the WebKit rail can scroll horizontally');
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'page has no horizontal overflow');
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()} ${width}: categories, 13 projects, proportional images, choice and scrolling`);
  } finally { await context.close(); await browser.close(); }
}

(async () => {
  const engines = process.env.CONTRACT_TEST_ENGINE === 'webkit' ? [webkit] : process.env.CONTRACT_TEST_ENGINE === 'chromium' ? [chromium] : [chromium, webkit];
  const widths = process.env.CONTRACT_TEST_WIDTH ? [Number(process.env.CONTRACT_TEST_WIDTH)] : [320, 390, 768];
  for (const engine of engines) for (const width of widths) await run(engine, width);
})().catch(error => { console.error(error); process.exitCode = 1; });
