const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const site = process.env.ORDER_TEST_URL || 'http://127.0.0.1:5000/';
const key = 'web4tg:order-draft:v1';
const normalize = (value) => value.replace(/\s+/g, ' ').trim();
const categories = [
  ['clothes', 'Магазин одежды'], ['shoes', 'Магазин обуви'],
  ['sneakers', 'Магазин кроссовок'], ['tech', 'Магазин смартфонов и аксессуаров'],
  ['flowers', 'Магазин цветов'],
];

async function tap(locator) {
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await locator.tap();
}

async function open(browser, saved) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(({ key, saved }) => {
    localStorage.setItem('app-language', 'ru');
    if (saved) localStorage.setItem(key, JSON.stringify({ version: 1, savedAt: Date.now(), draft: saved }));
  }, { key, saved });
  await context.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(new URL('/#/constructor', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('order-page').waitFor({ timeout: 30000 });
  return { context, page, errors };
}

async function restore(page) {
  const dialog = page.getByTestId('order-draft-dialog');
  await dialog.waitFor({ state: 'visible' });
  await dialog.getByRole('button', { name: 'Восстановить' }).tap();
  await dialog.waitFor({ state: 'detached' });
}

async function checkStep(page, step) {
  await page.waitForFunction((n) => document.querySelector('[data-testid="order-page"]')?.dataset.orderStep === String(n), step);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [category, label] of categories) {
      const { context, page, errors } = await open(browser);
      assert.equal(await page.locator('.order-showcase-card').count(), 7);
      assert.equal(await page.getByTestId('template-fitness-center').count(), 0, 'fitness is not offered for new orders');
      await tap(page.getByTestId(`template-ecommerce-basic-${category}`));
      await checkStep(page, 2);
      assert.equal(await page.locator('.order-selected-app strong').innerText(), label);
      assert.match(normalize(await page.getByTestId('order-running-total').innerText()), /150 000 ₽/);
      await page.waitForFunction(({ key, category }) => {
        const draft = JSON.parse(localStorage.getItem(key) || '{}').draft;
        return draft?.templateId === 'ecommerce-basic' && draft.storeCategory === category;
      }, { key, category });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await restore(page);
      await checkStep(page, 2);
      assert.equal(await page.locator('.order-selected-app strong').innerText(), label);
      await tap(page.getByTestId('order-continue'));
      await checkStep(page, 3);
      assert.match(await page.locator('.order-review-hero').innerText(), new RegExp(label));
      assert.match(normalize(await page.getByTestId('order-final-total').innerText()), /150 000 ₽/);
      await page.evaluate(() => {
        window.__orderRequest = null;
        window.open = (url) => { window.__orderRequest = url; return null; };
        if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink = (url) => { window.__orderRequest = url; };
      });
      await tap(page.getByTestId('order-continue'));
      const url = await page.evaluate(() => window.__orderRequest);
      assert.ok(url?.startsWith('https://t.me/web4tgs?text='));
      assert.match(new URL(url).searchParams.get('text'), new RegExp(label));
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`subcategory ${category}: price, draft recovery, review and prepared message passed`);
    }

    {
      const { context, page, errors } = await open(browser);
      await tap(page.getByTestId('template-info-ecommerce-basic-sneakers'));
      assert.match(await page.locator('#order-info-title').innerText(), /Магазин кроссовок/);
      await page.getByTestId('order-info-action').tap();
      await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
      await checkStep(page, 2);
      assert.equal(await page.locator('.order-selected-app strong').innerText(), 'Магазин кроссовок');
      await tap(page.getByTestId('recommended-feature-search'));
      await tap(page.getByTestId('order-back'));
      await tap(page.getByTestId('template-ecommerce-basic-clothes'));
      await checkStep(page, 2);
      assert.equal(await page.getByTestId('recommended-feature-search').getAttribute('aria-pressed'), 'true', 'same package retains selected features');
      assert.match(normalize(await page.getByTestId('order-running-total').innerText()), /170 000 ₽/);
      assert.equal(await page.locator('.order-selected-app strong').innerText(), 'Магазин одежды');
      await tap(page.getByTestId('order-back'));
      await tap(page.getByTestId('template-restaurant'));
      const dialog = page.getByTestId('order-switch-dialog');
      await dialog.waitFor({ state: 'visible' });
      await dialog.getByRole('button', { name: 'Сменить направление' }).tap();
      await checkStep(page, 2);
      assert.match(normalize(await page.getByTestId('order-running-total').innerText()), /180 000 ₽/);
      assert.equal(await page.getByTestId('recommended-feature-delivery-basic').getAttribute('aria-pressed'), 'false');
      assert.deepEqual(errors, []);
      await context.close();
      console.log('info action and category/package switching passed');
    }

    for (const [templateId, price] of [['fitness-center', '200 000'], ['restaurant', '180 000'], ['ecommerce-basic', '150 000']]) {
      const saved = { step: 1, templateId, extras: [], projectName: 'Старый проект', planId: null, annual: false };
      const { context, page, errors } = await open(browser, saved);
      await restore(page);
      await checkStep(page, 1);
      if (templateId === 'restaurant') await tap(page.getByTestId('template-restaurant'));
      else await tap(page.getByTestId('continue-legacy-order'));
      await checkStep(page, 2);
      assert.equal(await page.locator('#order-project-name').inputValue(), 'Старый проект');
      assert.ok(normalize(await page.getByTestId('order-running-total').innerText()).includes(price));
      if (templateId === 'restaurant') assert.equal(await page.getByTestId('recommended-feature-delivery-basic').getAttribute('aria-pressed'), 'false', 'delivery remains optional');
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`legacy ${templateId}: v1 draft and original price passed`);
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
