const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = process.env.ORDER_TEST_URL || 'http://127.0.0.1:5000/';
const text = value => value.replace(/\s+/g, ' ').trim();
const rate = 1.0759 / 87.4478;

async function tap(locator) {
  await locator.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await locator.tap();
}

async function check(browser, width, available) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(() => { localStorage.setItem('app-language', 'ru'); localStorage.removeItem('web4tg:order-draft:v1'); });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"disabled"}' }));
  await context.route('**/api/exchange-rates/nbkr', route => route.fulfill(available
    ? { status: 200, contentType: 'application/json', body: JSON.stringify({ rubToUsd: rate, effectiveDate: '2026-11-09', source: 'NBKR', stale: false }) }
    : { status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('/#/constructor', base).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('order-page').waitFor({ timeout: 30000 });
    await page.getByText(available ? 'Курс НБКР' : 'Курс недоступен', { exact: true }).waitFor();
    await tap(page.getByTestId('template-ecommerce-basic-clothes'));
    await page.waitForFunction(() => document.querySelector('[data-testid="order-page"]')?.dataset.orderStep === '2');

    const search = page.getByTestId('recommended-feature-search');
    const price = text(await search.locator('.order-feature-cost').innerText());
    assert.match(price, /20 000 ₽/);
    if (available) assert.match(price, /≈\s*\$\s*246/);
    else assert.doesNotMatch(price, /\$\s*\d/);

    await tap(page.getByTestId('recommended-info-search'));
    const sheet = page.getByTestId('order-info-sheet');
    await sheet.waitFor({ state: 'visible' });
    const infoPrice = text(await sheet.locator('.order-info-footer-price strong').innerText());
    assert.match(infoPrice, /20 000 ₽/);
    if (available) assert.match(infoPrice, /≈\s*\$\s*246/);
    else assert.doesNotMatch(infoPrice, /\$\s*\d/);
    await tap(sheet.getByRole('button', { name: 'Закрыть описание' }));
    await sheet.waitFor({ state: 'detached' });

    await tap(search);
    assert.equal(await search.getAttribute('aria-pressed'), 'true');
    assert.match(text(await page.getByTestId('order-running-total').innerText()), /170 000 ₽/);
    const catalog = page.getByTestId('order-all-features');
    await tap(catalog.locator(':scope > summary'));
    const basic = page.locator('.order-group[data-feature-category="constructor.basicFeatures"]');
    await basic.waitFor();
    await tap(basic.locator(':scope > summary'));
    const catalogSearch = page.getByTestId('feature-search');
    await catalogSearch.waitFor();
    assert.equal(await catalogSearch.getAttribute('aria-pressed'), 'true');
    const catalogPrice = text(await catalogSearch.locator('.order-feature-cost').innerText());
    assert.match(catalogPrice, /20 000 ₽/);
    if (available) assert.match(catalogPrice, /≈\s*\$\s*246/);
    else assert.doesNotMatch(catalogPrice, /\$\s*\d/);

    const included = page.getByTestId('feature-catalog');
    assert.equal(await included.getAttribute('aria-disabled'), 'true');
    assert.equal(await included.locator('.order-feature-cost').count(), 0, 'Included feature is not displayed as an extra price');
    await tap(page.getByTestId('feature-info-catalog'));
    await sheet.waitFor({ state: 'visible' });
    assert.equal(text(await sheet.locator('.order-info-footer-price strong').innerText()), 'Включено');
    await tap(sheet.getByRole('button', { name: 'Закрыть описание' }));
    await sheet.waitFor({ state: 'detached' });

    const running = text(await page.getByTestId('order-running-total').innerText());
    const sticky = text(await page.locator('.order-sticky-copy strong').innerText());
    assert.match(running, /170 000 ₽/);
    assert.equal(sticky, running, 'The sticky and inline development estimates should agree');
    if (available) assert.match(running, /≈\s*\$\s*2 092/);
    else assert.doesNotMatch(running, /\$\s*\d/);

    await tap(page.getByTestId('order-continue'));
    await page.waitForFunction(() => document.querySelector('[data-testid="order-page"]')?.dataset.orderStep === '3');
    const finalTotal = text(await page.getByTestId('order-final-total').innerText());
    const selectedExtra = text(await page.locator('.order-review-list').nth(1).locator('li').first().innerText());
    assert.equal(finalTotal, running, 'The review should preserve the same estimate');
    assert.match(selectedExtra, /20 000 ₽/);
    if (available) {
      assert.match(finalTotal, /≈\s*\$\s*2 092/);
      assert.match(selectedExtra, /≈\s*\$\s*246/);
    } else {
      assert.doesNotMatch(finalTotal, /\$\s*\d/);
      assert.doesNotMatch(selectedExtra, /\$\s*\d/);
    }

    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors, []);
    console.log(`${width}px ${available ? 'fresh' : 'unavailable'}: recommended, catalog, included and details passed`);
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try { for (const width of [320, 390]) for (const available of [true, false]) await check(browser, width, available); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
