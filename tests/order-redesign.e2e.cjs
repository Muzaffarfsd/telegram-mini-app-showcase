const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const site = process.env.ORDER_TEST_URL || 'http://127.0.0.1:5000/';
const normalize = (value) => value.replace(/\s+/g, ' ').trim();
const draftKey = 'web4tg:order-draft:v1';

async function tap(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await locator.tap();
}

async function open(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  await context.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(new URL('/#/constructor', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('order-page').waitFor({ timeout: 30000 });
  return { context, page, errors };
}

async function step(page, expected) {
  await page.waitForFunction((n) => document.querySelector('[data-testid="order-page"]')?.dataset.orderStep === String(n), expected);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390, 430]) {
      const { context, page, errors } = await open(browser, width);
      assert.equal(await page.getByTestId('order-continue').count(), 0, 'no redundant first-step CTA');
      await tap(page.getByTestId('template-ecommerce-basic-clothes'));
      await step(page, 2);
      await page.waitForFunction(() => document.activeElement === document.querySelector('.order-heading h1'));
      const sticky = await page.locator('.order-sticky-bar').boundingBox();
      const nav = await page.locator('nav.order-nav').boundingBox();
      assert.ok(sticky.x >= 0 && sticky.x + sticky.width <= width, 'sticky action fits the viewport with reduced motion');
      assert.ok(sticky.y + sticky.height <= nav.y, 'sticky action does not overlap navigation');
      await page.locator('#order-project-name').fill('Мой магазин');
      await tap(page.getByTestId('recommended-feature-search'));
      assert.match(normalize(await page.getByTestId('order-running-total').innerText()), /170 000 ₽/);
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || '{}').draft?.projectName === 'Мой магазин', draftKey);

      await page.reload({ waitUntil: 'domcontentloaded' });
      const recovery = page.getByTestId('order-draft-dialog');
      await recovery.waitFor({ state: 'visible', timeout: 30000 });
      assert.match(await recovery.innerText(), /30 дней/);
      await recovery.getByRole('button', { name: 'Восстановить' }).tap();
      await step(page, 2);
      assert.equal(await page.locator('#order-project-name').inputValue(), 'Мой магазин');
      assert.equal(await page.getByTestId('recommended-feature-search').getAttribute('aria-pressed'), 'true');
      assert.match(normalize(await page.getByTestId('order-running-total').innerText()), /170 000 ₽/);

      await tap(page.getByTestId('order-back'));
      await tap(page.getByTestId('template-restaurant'));
      const switchDialog = page.getByTestId('order-switch-dialog');
      await switchDialog.waitFor({ state: 'visible' });
      await switchDialog.getByRole('button', { name: 'Оставить прежнее' }).tap();
      await step(page, 1);
      await tap(page.getByTestId('template-ecommerce-basic-clothes'));
      await step(page, 2);
      assert.equal(await page.getByTestId('recommended-feature-search').getAttribute('aria-pressed'), 'true', 'cancel preserves extras');
      assert.match(normalize(await page.getByTestId('order-running-total').innerText()), /170 000 ₽/);

      await tap(page.getByTestId('order-back'));
      await tap(page.getByTestId('template-restaurant'));
      await switchDialog.waitFor({ state: 'visible' });
      await switchDialog.getByRole('button', { name: 'Сменить направление' }).tap();
      await step(page, 2);
      assert.equal(await page.locator('#order-project-name').inputValue(), 'Мой магазин');
      assert.match(normalize(await page.getByTestId('order-running-total').innerText()), /180 000 ₽/);
      await tap(page.getByTestId('recommended-feature-delivery-basic'));
      assert.match(normalize(await page.getByTestId('order-running-total').innerText()), /210 000 ₽/);
      await tap(page.getByTestId('order-continue'));
      await step(page, 3);
      assert.match(normalize(await page.getByTestId('order-final-total').innerText()), /210 000 ₽/);
      assert.match(await page.locator('.order-review-list').last().innerText(), /Доставка/);
      await tap(page.locator('.order-support > summary'));
      await tap(page.getByTestId('order-plan-standard'));
      assert.match(normalize(await page.getByTestId('order-support-total').innerText()), /14 900 ₽ \/ мес/);
      assert.match(normalize(await page.getByTestId('order-final-total').innerText()), /210 000 ₽/, 'support never changes one-time estimate');
      await tap(page.getByRole('button', { name: 'В год', exact: true }));
      assert.match(normalize(await page.getByTestId('order-support-total').innerText()), /149 000 ₽ \/ год/);
      await page.waitForFunction((key) => { const d = JSON.parse(localStorage.getItem(key) || '{}').draft; return d?.planId === 'standard' && d?.annual === true; }, draftKey);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await recovery.waitFor({ state: 'visible', timeout: 30000 });
      await recovery.getByRole('button', { name: 'Восстановить' }).tap();
      await step(page, 3);
      assert.match(normalize(await page.getByTestId('order-final-total').innerText()), /210 000 ₽/);
      assert.match(normalize(await page.getByTestId('order-support-total').innerText()), /149 000 ₽ \/ год/);
      await page.evaluate(() => { window.__orderRequest = null; window.open = (url) => { window.__orderRequest = url; return null; }; if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink = (url) => { window.__orderRequest = url; }; });
      assert.equal(await page.evaluate(() => window.__orderRequest), null);
      await tap(page.getByTestId('order-continue'));
      const request = await page.evaluate(() => window.__orderRequest);
      assert.ok(request?.startsWith('https://t.me/web4tgs?text='));
      const message = normalize(new URL(request).searchParams.get('text'));
      assert.match(message, /210 000 ₽/);
      assert.match(message, /149 000 ₽\/год/);
      assert.match(message, /Мой магазин/);

      await page.reload({ waitUntil: 'domcontentloaded' });
      await recovery.waitFor({ state: 'visible', timeout: 30000 });
      await recovery.getByRole('button', { name: 'Начать заново' }).tap();
      await step(page, 1);
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), draftKey), null);
      await tap(page.getByTestId('template-services'));
      await step(page, 2);
      assert.equal(await page.locator('#order-project-name').inputValue(), '');
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || '{}').draft?.templateId === 'services', draftKey);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}px: restore, switch cancel/confirm, prices, support, Telegram draft and start over passed`);
    }
    const blocked = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await blocked.addInitScript(() => {
      localStorage.setItem('app-language', 'ru');
      const originalGet = Storage.prototype.getItem;
      const originalSet = Storage.prototype.setItem;
      Storage.prototype.getItem = function (key) { if (key === 'web4tg:order-draft:v1') throw new DOMException('blocked', 'SecurityError'); return originalGet.call(this, key); };
      Storage.prototype.setItem = function (key, value) { if (key === 'web4tg:order-draft:v1') throw new DOMException('blocked', 'SecurityError'); return originalSet.call(this, key, value); };
    });
    await blocked.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
    const blockedPage = await blocked.newPage();
    await blockedPage.goto(new URL('/#/constructor', site).href, { waitUntil: 'domcontentloaded' });
    await blockedPage.getByTestId('order-page').waitFor({ timeout: 30000 });
    assert.match(await blockedPage.getByRole('status').innerText(), /нельзя сохранить/);
    await tap(blockedPage.getByTestId('template-services'));
    await step(blockedPage, 2);
    await tap(blockedPage.getByTestId('order-continue'));
    await step(blockedPage, 3);
    await blocked.close();
    console.log('Storage blocked: user is informed and can still proceed');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exit(1); });
