const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:41755/';
const url = new URL('/#/projects', base).href;

async function check(width, blocked, language = 'ru') {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: language === 'ru' ? 'ru-RU' : 'en-US', serviceWorkers: 'block' });
  const page = await context.newPage();
  await context.addInitScript(language => localStorage.setItem('app-language', language), language);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  try {
    if (blocked) await page.route('**/' + blocked, route => route.abort());
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const card = page.locator('.ps-card').filter({ hasText: language === 'ru' ? 'Мебельный салон' : 'Furniture showroom' });
    await card.waitFor({ timeout: 30000 });
    await card.scrollIntoViewIfNeeded();
    const art = card.locator('.ps-art-furniture');
    await art.locator('.ps-furniture-screen img').waitFor({ state: 'attached' });
    await art.evaluate(element => new Promise(resolve => {
      if (element.classList.contains('ps-art-ready')) return resolve();
      const observer = new MutationObserver(() => { if (element.classList.contains('ps-art-ready')) { observer.disconnect(); resolve(); } });
      observer.observe(element, { attributes: true, attributeFilter: ['class'] });
      setTimeout(() => { observer.disconnect(); resolve(); }, 25000);
    }));
    assert.ok(await art.evaluate(element => element.classList.contains('ps-art-ready')), 'furniture artwork resolves');
    assert.equal(await art.getAttribute('aria-hidden'), 'true');
    if (!blocked) {
      const screen = art.locator('.ps-furniture-screen img');
      assert.ok(await screen.isVisible());
      assert.ok(await screen.evaluate(image => image.complete && image.naturalWidth === 390 && image.naturalHeight === 844));
      assert.match(await screen.getAttribute('src'), language === 'ru' ? /furniture-studio-v8\.png$/ : /furniture-studio-v8-en\.png$/);
      await card.click();
      await page.locator('[data-testid=furniture-store]').waitFor({ timeout: 30000 });
      await page.getByRole('heading', { name: 'Sofas', exact: true }).waitFor();
    } else if (blocked.endsWith('.webp')) {
      assert.ok(await art.evaluate(element => element.classList.contains('ps-furniture-no-cover')));
      assert.ok(await art.locator('.ps-furniture-screen img').isVisible());
    } else {
      assert.ok(await art.evaluate(element => element.classList.contains('ps-furniture-no-screen')));
      const fallback = art.locator('.ps-furniture-fallback');
      await fallback.waitFor({ state: 'visible' });
      await fallback.evaluate(image => image.decode());
      assert.ok(await fallback.evaluate(image => image.naturalWidth > 0));
    }
    assert.deepEqual(errors, []);
    console.log(`PASS furniture showcase ${width}px ${blocked ? 'fallback ' + blocked : 'real screen and navigation'}`);
  } finally { await browser.close(); }
}
(async () => { await check(320); await check(390); await check(390, undefined, 'en'); await check(390, 'furniture-studio-v4.webp'); await check(390, 'furniture-studio-v8.png'); })().catch(error => { console.error(error); process.exit(1); });
