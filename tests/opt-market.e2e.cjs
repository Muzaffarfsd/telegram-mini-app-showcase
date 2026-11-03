const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.OPT_TEST_URL || process.env.APP_TEST_URL || 'http://127.0.0.1:53742/';
const url = `${base.replace(/\/$/, '')}/#/demos/opt-market/app`;

async function run(browser, width, height) {
  const p = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded' });
    await p.getByTestId('opt-market').waitFor();
    await p.locator('.opt-hero-image').evaluate(i => i.decode());
    assert.ok((await p.locator('.opt-hero-image').getAttribute('src')).includes('hero-real-v1.webp'), 'real-product hero must load');
    const nav = await p.locator('.opt-nav').boundingBox();
    assert(nav && nav.x >= 0 && nav.x + nav.width <= width, `navigation outside viewport: ${JSON.stringify(nav)}`);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'horizontal overflow');

    await p.getByRole('button', { name: 'Выбрать товары', exact: true }).click();
    await p.getByRole('searchbox', { name: 'Поиск товара' }).waitFor();
    const catalogImages = p.locator('.opt-product-picture img');
    assert.equal(await catalogImages.count(), 12, 'all twelve product images should be present');
    await catalogImages.evaluateAll(images => images.forEach(i => { i.loading = 'eager'; }));
    await p.waitForFunction(() => [...document.querySelectorAll('.opt-product-picture img')].length === 12 && [...document.querySelectorAll('.opt-product-picture img')].every(i => i.complete && i.naturalWidth > 0));
    const search = p.getByRole('searchbox', { name: 'Поиск товара' });
    await search.fill('совсем несуществующий товар');
    await p.getByRole('heading', { name: 'Ничего не нашли' }).waitFor();
    await p.getByRole('button', { name: 'Показать все товары' }).click();
    await search.fill('кофе');
    await p.getByRole('button', { name: 'Открыть товар: Lavazza Qualità Oro' }).click();
    await p.getByRole('heading', { name: 'Lavazza Qualità Oro' }).waitFor();
    await p.goBack({ waitUntil: 'domcontentloaded' });
    await p.getByRole('searchbox', { name: 'Поиск товара' }).waitFor();
    await p.getByRole('button', { name: 'Открыть товар: Lavazza Qualità Oro' }).click();
    await p.getByRole('button', { name: 'Добавить коробку' }).click();
    await p.getByRole('button', { name: 'Перейти в заказ' }).click();
    await p.getByRole('button', { name: 'Оформить заказ' }).click();
    await p.getByRole('button', { name: 'Создать демо-заказ' }).click();
    assert.equal(await p.locator('input[aria-invalid=true]').count(), 2, 'empty fields must be rejected');
    await p.getByPlaceholder('Как к вам обращаться').fill('Алексей');
    await p.getByPlaceholder('+7 999 000-00-00').fill('+7 999 000-00-00');
    await p.getByRole('button', { name: 'Создать демо-заказ' }).click();
    await p.getByRole('heading', { name: 'Заказ собран.' }).waitFor();
    await p.getByRole('button', { name: 'Посмотреть историю' }).click();
    await p.getByRole('button', { name: 'Добавить заказ в корзину' }).click();
    await p.getByText('Lavazza Qualità Oro', { exact: true }).waitFor();
    await p.reload({ waitUntil: 'domcontentloaded' });
    await p.getByTestId('opt-market').waitFor();
    await p.locator('.opt-nav').getByRole('button', { name: /^Заказ,/ }).click();
    await p.getByText('Lavazza Qualità Oro', { exact: true }).waitFor();
    await p.getByRole('button', { name: 'Удалить Lavazza Qualità Oro' }).click();
    await p.getByRole('heading', { name: 'Здесь будет ваш заказ' }).waitFor();
    assert.deepEqual(errors, [], 'uncaught page errors');
    console.log(`${browser.browserType().name()} ${width}×${height}: navigation, search, validation, order, repeat and persistence passed`);
  } finally {
    await p.close();
  }
}

(async () => {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      for (const [width, height] of [[320, 568], [390, 844], [430, 932]]) await run(browser, width, height);
    } finally { await browser.close(); }
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
