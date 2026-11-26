const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:41755/';

async function exercise(engine, width, ru) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width, height: 740 }, isMobile: true, hasTouch: true, locale: ru ? 'ru-RU' : 'en-US', serviceWorkers: 'block' });
  await context.addInitScript(language => {
    localStorage.setItem('app-language', language);
    if (!sessionStorage.getItem('compare-test-started')) {
      localStorage.setItem('web4tg-furniture-store-v1', JSON.stringify({ comparison: ['rivet-revolve-chair', 'rivet-revolve-chair', 'invalid'] }));
      sessionStorage.setItem('compare-test-started', '1');
    }
  }, ru ? 'ru' : 'en');
  await context.route('**/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const label = (r, e) => ru ? r : e;
  const count = () => page.locator('.fs-compare-table thead th').count();
  const openComparison = () => page.locator('.fs-open-comparison').tap();
  async function toggleCompare(control) {
    await control.locator('xpath=ancestor::details/summary').tap();
    await control.tap();
  }
  const catalog = () => page.getByRole('button', { name: label('Каталог', 'Catalogue'), exact: true }).tap();
  try {
    await page.goto(new URL('/#/projects', base).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('card-app-furniture-studio').tap();
    await catalog();
    assert.match(await page.locator('.fs-open-comparison').textContent(), /1 \/ 3/);
    await openComparison();
    assert.equal(await count(), 2);
    await page.locator('.fs-compare-remove').tap();
    assert(await page.getByText(label('Пока ничего не выбрано', 'No pieces selected yet')).isVisible());
    await page.waitForFunction(() => document.activeElement.id === 'fs-compare-title');
    await page.getByRole('button', { name: label('В каталог', 'Browse catalogue') }).tap();
    const cards = page.locator('.fs-catalog .fs-card');
    await toggleCompare(page.locator('.fs-catalog .fs-card-compare[aria-pressed="false"]').first());
    await openComparison();
    assert.equal(await count(), 2);
    assert(await page.getByText(label('Добавьте ещё модель для сравнения.', 'Add another piece to compare.')).isVisible());
    await page.getByRole('button', { name: label('Добавить модель', 'Add a piece') }).tap();
    await page.locator('.fs-catalog').waitFor();
    await toggleCompare(cards.nth(1).locator('.fs-card-compare'));
    await toggleCompare(cards.nth(2).locator('.fs-card-compare'));
    assert(await cards.nth(3).locator('.fs-card-compare').isDisabled());
    await openComparison();
    assert.equal(await count(), 4);
    await page.waitForFunction(() => document.activeElement.id === 'fs-compare-title');
    const rows = page.locator('.fs-compare-table tbody tr');
    assert.match(await rows.filter({has:page.getByRole('rowheader',{name:label('Ширина','Width'),exact:true})}).innerText(),/203/);
    assert.match(await rows.filter({has:page.getByRole('rowheader',{name:label('Материал','Material'),exact:true})}).innerText(), /полиэстер|polyester/i);
    const geometry = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, area: document.querySelector('.fs-compare-scroll').clientWidth, table: document.querySelector('.fs-compare-scroll').scrollWidth }));
    assert(geometry.document <= geometry.viewport + 1, JSON.stringify(geometry));
    assert(geometry.table > geometry.area, JSON.stringify(geometry));
    await page.locator('.fs-compare-model img').first().evaluate(img => img.decode());
    await page.locator('.fs-compare-model img').nth(1).evaluate(img => img.decode());
    for (const button of await page.locator('.fs-compare-remove').all()) assert((await button.boundingBox()).height >= 44);
    await page.screenshot({ path: `work/furniture-compare-${width}-${ru ? 'ru' : 'en'}.png`, fullPage: true });
    await page.locator('.fs-compare-scroll').evaluate(el => { el.scrollLeft = el.scrollWidth; });
    assert(await page.locator('.fs-compare-scroll').evaluate(el => el.scrollLeft > 0));
    await page.locator('.fs-compare-model').first().tap();
    await page.locator('.fs-product').waitFor();
    assert.equal(await page.locator('.fs-product-comparison button').first().getAttribute('aria-pressed'), 'true');
    await page.locator('.fs-product-comparison button').first().tap();
    assert.equal(await page.locator('.fs-product-comparison button').first().getAttribute('aria-pressed'), 'false');
    await page.locator('.fs-product-comparison button').first().tap();
    await page.getByRole('button', { name: label('Назад', 'Back'), exact: true }).tap();
    await page.locator('.fs-compare-table').waitFor();
    await page.locator('.fs-compare-remove').first().tap();
    assert.equal(await count(), 3);
    await page.waitForFunction(() => document.activeElement.classList.contains('fs-compare-scroll'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    if (await page.getByTestId('card-app-furniture-studio').isVisible().catch(() => false)) await page.getByTestId('card-app-furniture-studio').tap();
    await catalog();
    assert.match(await page.locator('.fs-open-comparison').textContent(), /2 \/ 3/);
    await openComparison();
    assert.equal(await count(), 3);
    await page.getByRole('button', { name: label('Назад', 'Back'), exact: true }).tap();
    await page.locator('.fs-open-comparison').waitFor();
    await page.waitForFunction(() => document.activeElement?.classList.contains('fs-open-comparison'));
    await page.evaluate(() => { const original = Storage.prototype.setItem; window.__restoreStorage = () => { Storage.prototype.setItem = original; }; Storage.prototype.setItem = function(key, value) { if (key === 'web4tg-furniture-store-v1') throw new Error('quota'); return original.call(this, key, value); }; });
    await toggleCompare(page.locator('.fs-catalog .fs-card-compare[aria-pressed="false"]').first());
    await page.getByRole('alert').waitFor({ state: 'visible' });
    await page.evaluate(() => window.__restoreStorage());
    await page.getByRole('button', { name: label('Повторить', 'Retry') }).tap();
    await page.waitForFunction(() => !document.querySelector('.fs-storage-warning'));
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('web4tg-furniture-store-v1')).comparison.length), 3);
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width}px ${ru ? 'RU' : 'EN'} comparison passed`);
  } catch (error) { await page.screenshot({ path: `work/furniture-compare-error-${width}.png`, fullPage: true }); console.log('Failure state:', await page.locator('.fs-store').getAttribute('data-screen'), (await page.locator('.fs-main').evaluate(el => el.outerHTML)).slice(0, 2500), 'history:', await page.evaluate(() => JSON.stringify(history.state)), 'errors:', errors); throw error; } finally { await browser.close(); }
}
(async () => { if (process.env.COMPARE_ENGINE !== 'webkit') await exercise(chromium, 320, true); if (process.env.COMPARE_ENGINE !== 'chromium') await exercise(webkit, 390, false); })().catch(error => { console.error(error); process.exitCode = 1; });
