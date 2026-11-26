const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const site = process.env.ORDER_TEST_URL || 'http://127.0.0.1:41755/';
const normal = text => text.replace(/\s+/g, ' ').trim();

async function tap(locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.tap();
}
async function run(engine, language, width, rateAvailable) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: language === 'ru' ? 'ru-RU' : 'en-US', serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript(lang => { localStorage.setItem('app-language', lang); localStorage.removeItem('web4tg:order-draft:v1'); }, language);
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.route('**/api/exchange-rates/nbkr', route => route.fulfill(rateAvailable
    ? { status: 200, contentType: 'application/json', body: JSON.stringify({ rubToUsd: 1.0759 / 87.4478, effectiveDate: '2026-11-09', source: 'NBKR', stale: false }) }
    : { status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }));
  try {
    await page.goto(new URL('/#/constructor', site).href);
    await page.getByTestId('order-page').waitFor();
    await tap(page.getByTestId('template-ecommerce-basic-clothes'));
    await tap(page.getByTestId('order-continue'));
    await page.getByTestId('order-breakdown').waitFor();
    assert.match(normal(await page.getByTestId('order-final-total').innerText()), /150 000 ₽/, 'base package is the total without extras');
    assert.match(normal(await page.getByTestId('order-extra-features').textContent()), language === 'ru' ? /Дополнительные функции не выбраны/ : /No additional features selected/);
    await tap(page.getByTestId('order-back'));
    await tap(page.getByTestId('recommended-feature-search'));
    await tap(page.getByTestId('order-all-features').locator(':scope > summary'));
    await tap(page.locator('.order-group[data-feature-category="constructor.aiAutomationCategory"] > summary'));
    await tap(page.getByTestId('feature-ai-chatbot'));
    await tap(page.getByTestId('order-continue'));
    await page.getByTestId('order-breakdown').waitFor();
    const development = page.getByTestId('order-final-total');
    const initialTotal = normal(await development.innerText());
    assert.match(initialTotal, /219 000 ₽/, 'base and both extras must sum to 219 000 ₽');
    if (rateAvailable) assert.match(initialTotal, /≈\s*\$\s*2 694/);
    else assert.doesNotMatch(initialTotal, /\$\s*\d/);
    const included = page.getByTestId('order-included-features');
    const extras = page.getByTestId('order-extra-features');
    await included.waitFor();
    await extras.waitFor();
    const includedText = normal(await included.textContent());
    const extrasText = normal(await extras.textContent());
    assert.match(includedText, language === 'ru' ? /Каталог/ : /Catalog/);
    assert.doesNotMatch(includedText, /25 000 ₽/, 'included feature price must not be added again');
    assert.match(extrasText, language === 'ru' ? /Поиск/ : /Search/);
    assert.match(extrasText, /20 000 ₽/);
    assert.match(extrasText, language === 'ru' ? /AI Чат-бот/i : /AI Chatbot/i);
    assert.match(extrasText, /49 000 ₽/);
    assert.ok(normal(await page.getByTestId('order-cost-conditions').textContent()).length > 30, 'the estimate conditions should be disclosed');
    await tap(page.locator('.order-support > summary'));
    await tap(page.getByTestId('order-plan-standard'));
    assert.match(normal(await page.getByTestId('order-support-total').innerText()), /14 900 ₽/);
    assert.equal(normal(await development.innerText()), initialTotal, 'monthly support is separate from development');
    await tap(page.getByRole('button', { name: language === 'ru' ? 'В год' : 'Yearly', exact: true }));
    assert.match(normal(await page.getByTestId('order-support-total').innerText()), /149 000 ₽/);
    assert.equal(normal(await development.innerText()), initialTotal, 'annual support is separate from development');
    await tap(page.getByRole('button', { name: language === 'ru' ? 'Изменить параметры' : 'Edit details' }));
    await tap(page.getByTestId('recommended-feature-search'));
    await tap(page.getByTestId('order-continue'));
    assert.match(normal(await page.getByTestId('order-final-total').innerText()), /199 000 ₽/, 'removing search must recalculate the estimate');
    assert.match(normal(await page.getByTestId('order-support-total').innerText()), /149 000 ₽/, 'the annual support choice survives editing');
    assert.doesNotMatch(normal(await page.getByTestId('order-extra-features').textContent()), language === 'ru' ? /Поиск/ : /Search/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'no horizontal overflow');
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()} ${language} ${width}: itemized estimate, inclusion, conversion and separate support`);
  } finally { await context.close(); await browser.close(); }
}
(async () => {
  await run(chromium, 'ru', 320, true);
  await run(chromium, 'en', 390, false);
  await run(webkit, 'ru', 390, false);
  await run(webkit, 'en', 320, true);
})().catch(error => { console.error(error); process.exitCode = 1; });
