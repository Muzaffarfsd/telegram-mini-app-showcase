const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.NIKE_TEST_URL || 'http://127.0.0.1:53744').replace(/\/$/, '');
const engine = process.env.NIKE_ENGINE === 'webkit' ? webkit : chromium;

async function run(browser, width, height) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', locale: 'ru-RU', serviceWorkers: 'block' });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}/#/demos/nike-sneakers/app`, { waitUntil: 'domcontentloaded' });
    await page.locator('.royal-step').first().waitFor();
    const nav = page.locator('.rs-nav');
    const open = async id => { await nav.getByRole('button', { name: 'Каталог' }).click(); await page.getByTestId(`royal-card-${id}`).getByRole('button', { name: /Открыть/ }).click(); await page.locator('.rsx-tools').waitFor(); };
    await open('airforce');
    await page.getByRole('button', { name: 'Сравнить', exact: true }).click();
    await page.locator('.rsx-picker summary').click();
    await page.locator('.rsx-picker input').fill('Город');
    await page.locator('.rsx-picker button[aria-label="Создать подборку"]').click();
    assert.equal(await page.locator('.rsx-picker__choice').getAttribute('aria-pressed'), 'true');
    await open('dunk');
    await page.getByRole('button', { name: 'Сравнить', exact: true }).click();
    await open('vomero');
    await page.getByRole('button', { name: 'Сравнить', exact: true }).click();
    await open('airmax');
    assert.equal(await page.getByRole('button', { name: 'Сравнить', exact: true }).isDisabled(), true, 'comparison respects three-model limit');
    await nav.getByRole('button', { name: 'Профиль' }).click();
    assert.match(await page.locator('.rsx-compare').innerText(), /Nike Air Force 1 '07/);
    assert.match(await page.locator('.rsx-compare').innerText(), /Nike Dunk Low Retro/);
    await page.locator('.rsx-collection summary').click();
    assert.match(await page.locator('.rsx-collection').innerText(), /Nike Air Force 1 '07/);
    assert.match(await page.locator('.rsx-personal .rsx-recent').innerText(), /Nike Air Max 95 OG/);
    const bounds = await page.locator('.rsx-personal').evaluate(el => ({width: el.getBoundingClientRect().width, screen: innerWidth, left: el.getBoundingClientRect().left, scrollWidth: el.scrollWidth}));
    assert(bounds.width + bounds.left <= width + 1, `personal area must fit screen: ${JSON.stringify(bounds)}`);
    assert(bounds.scrollWidth <= bounds.width + 1, `personal content must fit screen: ${JSON.stringify(bounds)}`);
    if (width === 390 && process.env.NIKE_SCREENSHOT) await page.locator('.rsx-personal').screenshot({ path: process.env.NIKE_SCREENSHOT });
    await page.locator('.rsx-collection').getByRole('button', { name: 'Удалить подборку', exact: true }).click();
    await page.getByRole('group', { name: 'Удаление подборки Город' }).getByRole('button', { name: 'Отмена' }).click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.rs-nav').getByRole('button', { name: 'Профиль' }).click();
    assert.match(await page.locator('.rsx-collection summary').innerText(), /Город/);
    assert.equal(await page.locator('.rsx-compare__product').count(), 3);
    assert.match(await page.locator('.rsx-personal .rsx-recent').innerText(), /Nike Air Max 95 OG/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no page overflow');
    await page.locator('.rsx-compare__remove').first().click();
    assert.equal(await page.locator('.rsx-compare__product').count(), 2);
    await page.locator('.rs-nav').getByRole('button', { name: 'Главная' }).click();
    assert.match(await page.locator('.rsx-recent').innerText(), /Nike Air Max 95 OG/);
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width}: сравнение, подборки, история просмотров и перезагрузка — OK`);
  } finally { await context.close(); }
}
async function blockedStorage(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await context.addInitScript(() => { const set = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === 'nike-sneakers-experience-v1') throw new Error('Storage blocked'); return set.call(this, key, value); }; });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  try {
    await page.goto(`${base}/#/demos/nike-sneakers/app`, { waitUntil: 'domcontentloaded' });
    await page.locator('.rs-nav').getByRole('button', { name: 'Каталог' }).click();
    await page.getByTestId('royal-card-airforce').getByRole('button', { name: /Открыть/ }).click();
    assert(await page.locator('.rsx-tools').getByText(/Не удалось сохранить данные/).isVisible());
    await page.locator('.rsx-picker summary').click();
    await page.locator('.rsx-picker input').fill('На прогулку');
    await page.locator('.rsx-picker button[aria-label="Создать подборку"]').click();
    assert.equal(await page.locator('.rsx-picker__choice').getAttribute('aria-pressed'), 'true');
    console.log(`${engine.name()}: отказ сохранения — предупреждение и работа в текущем сеансе OK`);
  } finally { await context.close(); }
}
(async () => { const browser = await engine.launch(); try { for (const [width, height] of [[320,568],[390,844],[430,932]]) await run(browser, width, height); await blockedStorage(browser); } finally { await browser.close(); } })().catch(error => { console.error(error); process.exitCode = 1; });
