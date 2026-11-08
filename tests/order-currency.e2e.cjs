const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = process.env.ORDER_TEST_URL || 'http://127.0.0.1:5000/';
const normalize = text => text.replace(/\s+/g, ' ').trim();
const rows = [
  ['ecommerce-basic-clothes', '150 000 ₽', '$1 846'],
  ['ecommerce-basic-sneakers', '150 000 ₽', '$1 846'],
  ['ecommerce-basic-tech', '150 000 ₽', '$1 846'],
  ['ecommerce-basic-flowers', '150 000 ₽', '$1 846'],
  ['restaurant', '180 000 ₽', '$2 215'],
  ['services', '170 000 ₽', '$2 092'],
];

async function check(browser, width, language, state) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: language === 'ru' ? 'ru-RU' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(lang => { localStorage.setItem('app-language', lang); localStorage.removeItem('web4tg:order-draft:v1'); }, language);
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"disabled"}' }));
  await context.route('**/api/exchange-rates/nbkr', route => route.fulfill(state === 'unavailable'
    ? { status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }
    : { status: 200, contentType: 'application/json', body: JSON.stringify({ rubToUsd: 1.0759 / 87.4478, effectiveDate: '2026-11-09', source: 'NBKR', stale: state === 'stale' }) }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('/#/constructor', base).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('order-page').waitFor({ timeout: 30000 });
  const note = page.locator('.order-rate-note');
  await page.waitForFunction(({ state, language }) => {
    const text = document.querySelector('.order-rate-note')?.textContent || '';
    const expected = state === 'unavailable' ? (language === 'ru' ? 'Курс недоступен' : 'Rate unavailable') : state === 'stale' ? (language === 'ru' ? 'НБКР · сохранён' : 'NBKR · cached') : (language === 'ru' ? 'Курс НБКР' : 'NBKR rate');
    return text === expected;
  }, { state, language }, { timeout: 10000 });
  const noteText = normalize(await note.innerText());
  assert.equal(normalize(await page.locator('.order-heading h1').innerText()), language === 'ru' ? 'Стоимость приложения' : 'App pricing');
  assert.equal(normalize(await page.locator('.order-heading p').innerText()), language === 'ru' ? 'Выберите тип приложения, чтобы узнать примерную стоимость.' : 'Choose an app type to see an estimated price.');
  assert.doesNotMatch(noteText, /\d{1,2}\.\d{1,2}|2026/);
  assert.equal(await note.getAttribute('title'), null, 'The rate date must not appear in a tooltip');
  if (state === 'unavailable') {
    assert.equal(noteText, language === 'ru' ? 'Курс недоступен' : 'Rate unavailable');
  } else {
    assert.equal(noteText, state === 'fresh' ? (language === 'ru' ? 'Курс НБКР' : 'NBKR rate') : (language === 'ru' ? 'НБКР · сохранён' : 'NBKR · cached'));
  }
  for (const [id, rubles, dollars] of rows) {
    const card = page.getByTestId(`template-${id}`);
    const price = normalize(await card.locator('.order-template-price').innerText());
    assert.equal(price, `${language === 'ru' ? 'от' : 'from'} ${rubles} / ${state === 'unavailable' ? '—' : `≈ ${dollars}`}`);
  }
  const heading = page.locator('.order-direction-heading').first().locator('span').first();
  const headingGeometry = await heading.evaluate(el => ({ height: el.getBoundingClientRect().height, lineHeight: parseFloat(getComputedStyle(el).lineHeight) }));
  assert.ok(headingGeometry.height <= headingGeometry.lineHeight + 1, 'Store heading should fit on one line');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  if (state === 'unavailable') {
    const card = page.getByTestId('template-ecommerce-basic-clothes');
    await card.evaluate(el => el.scrollIntoView({block:'center',behavior:'instant'}));
    await card.tap();
    assert.equal(await page.getByTestId('order-page').getAttribute('data-order-step'), '2', 'Order remains usable when the rate is unavailable');
  }
  console.log(`${width}px ${language} ${state}: prices, copy, rate label and interaction passed`);
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390, 430]) for (const state of ['fresh', 'stale', 'unavailable']) await check(browser, width, 'ru', state);
    for (const state of ['fresh', 'stale', 'unavailable']) await check(browser, 320, 'en', state);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
