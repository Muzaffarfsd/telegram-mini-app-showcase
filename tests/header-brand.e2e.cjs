const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:53731/';

async function checkMark(page, name) {
  const mark = page.getByTestId('header-brand-mark');
  await mark.waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForFunction(() => performance.getEntriesByType('resource').some(entry => entry.name.includes('header-symbol-mask-v1') && entry.responseEnd > 0));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const box = await mark.boundingBox();
  assert.ok(box.width >= 48 && box.height >= 26, `${name}: symbol is too small`);
  const centerOffset = (box.x + box.width / 2) - (await page.evaluate(() => innerWidth / 2));
  assert.ok(Math.abs(centerOffset) < 1.5, `${name}: symbol is not centered (offset ${centerOffset}px)`);
  assert.equal(await mark.getAttribute('aria-label'), 'WEB4TG');
  assert.equal(await mark.locator('rect').getAttribute('fill'), '#000000');
  const screenshot = await mark.screenshot();
  const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const luminance = i => (data[i] + data[i + 1] + data[i + 2]) / 3;
  let dark = 0, light = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (luminance(i) < 65) dark++;
    if (luminance(i) > 175) light++;
  }
  assert.ok(dark > 80, `${name}: the black symbol was not drawn`);
  assert.ok(light > 80, `${name}: the transparent surroundings are not visible`);
  assert.ok(luminance(0) > 150, `${name}: a dark background was rendered around the symbol`);
  return box;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390, 430]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
      await context.addInitScript(() => { localStorage.setItem('app-language', 'ru'); localStorage.setItem('app-theme', 'dark'); });
      await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('profile-page').waitFor();
      await checkMark(page, `${width}px profile`);
      if (width === 390 && process.env.BRAND_SCREENSHOT) await page.screenshot({ path: process.env.BRAND_SCREENSHOT });
      await page.getByTestId('profile-help').tap();
      await page.getByTestId('profile-help-page').waitFor();
      await checkMark(page, `${width}px help`);
      await page.getByTestId('nav-constructor').tap();
      await page.waitForFunction(() => location.hash === '#/constructor');
      await checkMark(page, `${width}px order`);
      await page.getByTestId('nav-showcase').tap();
      await page.waitForFunction(() => location.hash === '#/');
      await checkMark(page, `${width}px home`);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}px: centered black symbol, transparent surround and visibility across profile, help, order and home passed`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
