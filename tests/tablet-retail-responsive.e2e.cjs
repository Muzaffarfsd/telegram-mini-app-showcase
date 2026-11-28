const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = process.env.APP_TEST_URL || 'http://127.0.0.1:41755/';

async function exercise(browser, width, height, demo) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL(`/#/demos/${demo}/app`, base).href, { waitUntil: 'domcontentloaded' });
    if (demo === 'opt-market') {
      await page.getByTestId('opt-market').waitFor();
      await page.getByRole('button', { name: 'Выбрать товары', exact: true }).tap();
      assert.equal(await page.evaluate(() => { const root = document.getElementById('root'); return root.scrollWidth > root.clientWidth; }), false, 'catalog root has horizontal overflow');
      await page.locator('.opt-chips').getByRole('button', { name: 'Завтраки', exact: true }).tap();
      await page.locator('.opt-chips').getByRole('button', { name: 'Все', exact: true }).tap();
      await page.getByRole('searchbox', { name: 'Поиск товара' }).fill('кофе');
      await page.getByRole('button', { name: 'Открыть товар: Lavazza Qualità Oro' }).tap();
      await page.getByRole('button', { name: 'Добавить коробку', exact: true }).tap();
      await page.getByRole('button', { name: 'Перейти в заказ' }).tap();
      await page.getByRole('heading', { name: 'Ваш заказ.' }).waitFor();
    } else {
      await page.getByTestId('demo-content').waitFor();
      await page.getByTestId('nav-catalog').tap();
      await page.getByRole('searchbox', { name: 'Поиск по каталогу' }).fill('сыворотка');
      const add = page.locator('.aura-catalog-grid').getByRole('button', { name: /^Добавить .* в корзину/ }).first();
      await add.tap();
      await page.getByTestId('nav-cart').tap();
      await page.getByText('Корзина', { exact: true }).first().waitFor();
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'page has horizontal overflow');
    assert.deepEqual(errors, []);
    const actualWidth = await page.locator(demo === 'opt-market' ? '.opt-store' : '.aura').evaluate(el => el.getBoundingClientRect().width);
    assert.equal(actualWidth, Math.min(width, width >= 700 ? 900 : 448));
    console.log(`PASS ${browser.browserType().name()} ${demo} ${width}x${height}: ${actualWidth}px content, catalog, purchase and no page overflow`);
  } finally { await context.close(); }
}
(async () => { for (const engine of [chromium, webkit]) { const browser = await engine.launch(); try { for (const demo of ['opt-market', 'skincare-aura']) for (const size of [[320,568],[390,844],[820,1180],[1180,820]]) await exercise(browser, ...size, demo); } finally { await browser.close(); } } })().catch(error => { console.error(error); process.exitCode = 1; });
