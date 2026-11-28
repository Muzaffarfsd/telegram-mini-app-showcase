const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:41755/';
const high = 'Mozilla/5.0 Telegram-Android/11.3.3 (Pixel; Android 15; SDK 35; HIGH)';
async function check(browser, userAgent, memory, expected) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block', userAgent });
  await context.addInitScript(({ memory }) => {
    localStorage.setItem('app-language', 'ru');
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: memory });
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 });
  }, { memory });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('/#/demos/furniture-studio/app', base).href, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-testid=furniture-store]').waitFor();
    await page.getByRole('button', { name: 'Каталог', exact: true }).click();
    await page.locator('.fs-card-open').first().click();
    await page.getByRole('button', { name: '3D-обзор', exact: true }).click();
    await page.locator('.rfv').getByRole('button', { name: 'Увеличить', exact: true }).waitFor({ timeout: 60000 });
    const buffer = await page.locator('.rfv canvas').evaluate(canvas => ({ cssWidth: canvas.clientWidth, cssHeight: canvas.clientHeight, width: canvas.width, height: canvas.height }));
    assert.ok(Math.abs(buffer.width / buffer.cssWidth - expected) < 0.01, JSON.stringify(buffer));
    assert.deepEqual(errors, []);
    console.log(`PASS viewer ratio ${expected}: ${buffer.cssWidth}x${buffer.cssHeight} CSS -> ${buffer.width}x${buffer.height} pixels`);
  } finally { await context.close(); }
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    await check(browser, high, 8, 2);
    await check(browser, high, 4, 1.75);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
