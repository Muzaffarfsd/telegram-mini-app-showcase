const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.HOME_TEST_URL || 'http://127.0.0.1:53735/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'allow' });
    await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('home-page').waitFor();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('home-page').waitFor();
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.studio-exhibit img')).every(img => img.complete && img.naturalWidth > 0));
    await page.waitForTimeout(500);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('home-page').waitFor({ state: 'visible', timeout: 15000 });
    const title = await page.locator('.studio-intro h1').innerText();
    assert.match(title, /Ваш бизнес/);
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.studio-exhibit img')).every(img => img.complete && img.naturalWidth > 0));
    await context.close();
    console.log('Current home shell and its primary visual remain available after an online load and offline reload.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
