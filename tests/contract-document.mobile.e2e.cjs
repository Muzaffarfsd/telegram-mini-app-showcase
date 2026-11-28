const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const { unzipSync, strFromU8 } = require('fflate');
const base = process.env.CONTRACT_TEST_URL || 'http://127.0.0.1:41755/';
const normalize = value => value.replace(/\s+/gu, ' ').trim();
const decodeXml = text => text.replace(/&(?:#x([\da-f]+)|#(\d+)|(amp|lt|gt|quot|apos));/gi, (_, hex, dec, named) => hex ? String.fromCodePoint(parseInt(hex, 16)) : dec ? String.fromCodePoint(Number(dec)) : ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[named.toLowerCase()]);
const tap = async locator => { await locator.scrollIntoViewIfNeeded(); await locator.tap(); };

async function run(engine, width) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block', acceptDownloads: true });
  await context.addInitScript(name => {
    localStorage.setItem('app-language', 'ru');
    window.__contractShared = [];
    if (name === 'chromium') Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
    else {
      Object.defineProperty(navigator, 'canShare', { value: data => !!data.files?.length, configurable: true });
      Object.defineProperty(navigator, 'share', { value: data => { window.__contractShared.push(data.files[0]); return Promise.resolve(); }, configurable: true });
    }
  }, engine.name());
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
  await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('/#/contract', base).href);
    await page.getByTestId('contract-questionnaire').waitFor();
    await tap(page.getByTestId('contract-direction-furniture-studio'));
    await tap(page.getByTestId('contract-next'));
    await tap(page.getByTestId('contract-next'));
    await page.getByTestId('order-contract-name').fill('ООО Проверка договора');
    await tap(page.getByTestId('contract-next'));

    const fullText = page.locator('.order-contract-full-text');
    const download = page.getByTestId('order-contract-download');
    const copy = page.getByTestId('order-contract-copy');
    await fullText.waitFor();
    assert.equal(await fullText.getAttribute('open'), null, 'the full text is initially collapsed');
    assert.equal(await page.getByTestId('order-contract-preview').isVisible(), false);
    assert.equal(await download.isVisible(), true);
    assert.equal(await copy.isVisible(), true);
    await page.waitForFunction(() => !document.querySelector('[data-testid="order-contract-download"]')?.disabled, null, { timeout: 30000 });
    await tap(fullText.locator(':scope > summary'));
    const preview = page.getByTestId('order-contract-preview');
    assert.equal(await preview.isVisible(), true);
    assert.notEqual(await preview.locator('.order-contract-contents').getAttribute('open'), null, 'contents are visible when text opens');
    const contentsButtons = preview.locator('.order-contract-contents button');
    const headings = preview.locator('section > h3');
    assert.equal(await contentsButtons.count(), await headings.count());
    assert.ok(await headings.count() > 3);
    const index = 3;
    assert.equal(normalize(await contentsButtons.nth(index).innerText()), normalize(await headings.nth(index).innerText()));
    const url = page.url();
    await tap(contentsButtons.nth(index));
    assert.equal(page.url(), url, 'contents do not change the URL');
    assert.equal(await headings.nth(index).evaluate(node => node === document.activeElement), true, 'contents move focus to the corresponding section');
    assert.equal(await preview.evaluate(node => ['auto', 'scroll'].includes(getComputedStyle(node).overflowY)), false, 'no nested document scroll');
    const paragraphs = await preview.locator('h3, p').allTextContents();
    let bytes;
    if (engine.name() === 'chromium') {
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await tap(download);
      const file = await downloadPromise;
      assert.match(file.suggestedFilename(), /\.docx$/i);
      const stream = await file.createReadStream();
      const chunks = []; for await (const chunk of stream) chunks.push(chunk);
      bytes = Buffer.concat(chunks);
    } else {
      await tap(download);
      await page.waitForFunction(() => window.__contractShared.length > 0);
      bytes = Buffer.from(await page.evaluate(async () => Array.from(new Uint8Array(await window.__contractShared[0].arrayBuffer()))));
    }
    const files = unzipSync(new Uint8Array(bytes));
    assert.ok(files['word/document.xml'] && files['[Content_Types].xml']);
    const xml = strFromU8(files['word/document.xml']);
    const documentText = normalize([...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(match => decodeXml(match[1])).join(' '));
    for (const paragraph of paragraphs.map(normalize).filter(Boolean)) assert.ok(documentText.includes(paragraph), `preview paragraph missing from DOCX: ${paragraph.slice(0, 90)}`);
    assert.ok(documentText.includes('ООО Проверка договора'));
    await tap(fullText.locator(':scope > summary'));
    assert.equal(await preview.isVisible(), false, 'full text can be closed again');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()} ${width}: document disclosure, contents navigation and DOCX`);
  } finally { await context.close(); await browser.close(); }
}
(async () => { for (const engine of [chromium, webkit]) for (const width of [320, 390]) await run(engine, width); })().catch(error => { console.error(error); process.exitCode = 1; });
