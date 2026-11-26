const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:41755/';
const url = new URL('/#/projects', base).href;

async function checkHandset(page, art) {
  const peer = page.locator('[data-project="muraka-fashion"] .ps-art');
  const scale = (await peer.boundingBox()).width / 204;
  const frame = await art.locator('.ps-device').evaluate(el => {
    const css = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const tile = el.closest('.ps-art').getBoundingClientRect();
    const row = el.closest('.ps-artwork-layer').getBoundingClientRect();
    return {
      width: parseFloat(css.width),
      height: parseFloat(css.height),
      centerX: rect.left + rect.width / 2 - tile.left,
      centerY: rect.top + rect.height / 2 - tile.top,
      tileCenterOffset: tile.top + tile.height / 2 - row.top - row.height / 2,
      tilt: getComputedStyle(el.parentElement).rotate,
    };
  });
  // Outer handset on the 204 × 272 stage in the existing clothing previews.
  const reference = { width: 100.18, height: 204.32, centerX: 121.03, centerY: 133.50 };
  for (const [key, value] of Object.entries(reference)) {
    assert.ok(Math.abs(frame[key] - value * scale) < 0.65, `handset ${key}: ${frame[key]}`);
  }
  assert.equal(frame.tilt, '2deg');
  assert.ok(Math.abs(frame.tileCenterOffset) < 0.65, 'artwork stays centred above the action row');
}

async function check(width, blocked, language = 'ru', engine = chromium, reducedMotion = 'no-preference') {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: width < 700, hasTouch: width < 700, locale: language === 'ru' ? 'ru-RU' : 'en-US', serviceWorkers: 'block', reducedMotion });
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
      assert.equal(await screen.evaluate(image => getComputedStyle(image).objectFit), 'contain');
      await checkHandset(page, art);
      assert.match(await screen.getAttribute('src'), language === 'ru' ? /furniture-studio-v9\.png$/ : /furniture-studio-v9-en\.png$/);
      await card.click();
      await page.locator('[data-testid=furniture-store]').waitFor({ timeout: 30000 });
      await page.getByRole('heading', { name: 'Sofas', exact: true }).waitFor();
    } else if (blocked.endsWith('.webp')) {
      assert.ok(await art.evaluate(element => element.classList.contains('ps-furniture-no-cover')));
      assert.ok(await art.locator('.ps-furniture-screen img').isVisible());
      await checkHandset(page, art);
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
(async () => {
  await check(320);
  await check(390);
  await check(390, undefined, 'en');
  await check(320, undefined, 'ru', webkit, 'reduce');
  await check(1280, undefined, 'en');
  await check(390, 'furniture-studio-v4.webp');
  await check(390, 'furniture-studio-v9.png');
})().catch(error => { console.error(error); process.exit(1); });
