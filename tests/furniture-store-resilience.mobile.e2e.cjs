const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:41755/';

async function check(engine, width, lang) {
  const browser = await engine.launch(engine === chromium ? {args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']} : {});
  const context = await browser.newContext({ viewport: { width, height: 800 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: lang === 'ru' ? 'ru-RU' : 'en-US' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript(language => {
    localStorage.setItem('app-language', language);
    window.__failFurnitureStorage = true;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'web4tg-furniture-store-v1' && window.__failFurnitureStorage) throw new DOMException('No space','QuotaExceededError');
      return original.call(this, key, value);
    };
  }, lang);
  await context.route('**/telegram-web-app.js', route => route.fulfill({contentType: 'text/javascript', body: ''}));
  await context.route('**/furniture/real-products/sofa-*.webp', route => route.abort());
  try {
    await page.goto(new URL('/#/demos/furniture-studio/app', base).href, {waitUntil:'domcontentloaded'});
    await page.getByTestId('furniture-store').waitFor();
    const warning = page.locator('.fs-store > .fs-storage-warning');
    await warning.waitFor({state:'visible'});
    assert.match(await warning.textContent(), lang === 'ru' ? /не удалось сохранить/i : /could not be saved/i);
    const fab = page.locator('.home-ai-surface .alex-fab-breathing');
    await fab.waitFor({state:'visible'});
    const box = await fab.boundingBox();
    const topbar = await page.locator('.w4-topbar').boundingBox();
    assert(box && topbar && box.y >= topbar.y && box.y + box.height <= topbar.y + topbar.height + 2, 'consultant stays inside the header');
    await fab.tap();
    const chat = page.locator('.ai-chat-sheet');
    await chat.waitFor({state:'visible'});
    await chat.getByRole('button', {name:lang==='ru'?'Закрыть':'Close'}).tap();
    await chat.waitFor({state:'hidden'});
    await page.evaluate(() => { window.__failFurnitureStorage = false; });
    await warning.getByRole('button', {name: lang === 'ru' ? 'Повторить' : 'Retry'}).tap();
    await warning.waitFor({state:'detached'});
    await page.getByRole('button', {name: lang === 'ru' ? 'Каталог' : 'Catalogue', exact:true}).tap();
    const fallback = page.locator('.fs-card').first().locator('.fs-image-fallback');
    await fallback.waitFor({state:'visible'});
    assert.match(await fallback.getAttribute('aria-label'), lang === 'ru' ? /недоступна/i : /unavailable/i);
    await page.locator('.fs-card-open').first().tap();
    const galleryError = page.locator('.fs-gallery-fallback');
    await galleryError.waitFor({state:'visible'});
    assert(await galleryError.getByRole('button', {name: lang === 'ru' ? 'Попробовать снова' : 'Try again'}).isVisible());
    await context.unroute('**/furniture/real-products/sofa-*.webp');
    await galleryError.getByRole('button', {name: lang === 'ru' ? 'Попробовать снова' : 'Try again'}).tap();
    await galleryError.waitFor({state:'detached'});
    await page.waitForFunction(() => { const image = document.querySelector('.fs-gallery-main'); return !!image && image.complete && image.naturalWidth > 0; });
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width} ${lang}: image failure, storage recovery, consultant access passed`);
  } finally { await context.close(); await browser.close(); }
}
(async () => { await check(chromium,320,'ru'); await check(webkit,390,'en'); })().catch(err => {console.error(err); process.exitCode=1});
