const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.HOME_TEST_URL || 'http://127.0.0.1:53734/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('home-page').waitFor();
    await page.getByTestId('nav-constructor').tap();
    await page.getByTestId('order-page').waitFor({ state: 'visible' });
    await page.getByTestId('nav-showcase').tap();
    await page.getByTestId('home-page').waitFor({ state: 'visible' });
    await page.evaluate(async () => {
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      document.getElementById('root').scrollTop = 450;
    });
    await page.waitForTimeout(160);
    const scroll = await page.evaluate(() => document.getElementById('root').scrollTop);
    assert.ok(scroll > 300, `the app must not pull the page back after the user begins to scroll: ${scroll}`);
    await context.close();
    console.log('Navigation resets once and does not override the next user scroll.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
