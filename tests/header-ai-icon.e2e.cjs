const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const sharp = require('sharp');

const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:53731/';

async function checkHeaderButton(page, label) {
  const button = page.locator('.alex-fab-breathing');
  await button.waitFor({ state: 'visible', timeout: 20000 });
  const image = button.locator('.alex-fab-header-mark');
  await image.waitFor({ state: 'visible' });
  await image.evaluate(el => el.decode());
  const sizes = await button.evaluate(el => {
    const button = el.getBoundingClientRect();
    const image = el.querySelector('.alex-fab-header-mark');
    const art = image.getBoundingClientRect();
    return {
      width: button.width, height: button.height,
      artWidth: art.width, artHeight: art.height,
      centerX: art.left + art.width / 2 - (button.left + button.width / 2),
      centerY: art.top + art.height / 2 - (button.top + button.height / 2),
      after: getComputedStyle(el, '::after').content,
      alt: image.alt, opacity: getComputedStyle(image).opacity,
      naturalWidth: image.naturalWidth,
    };
  });
  assert.equal(sizes.width, 44, `${label}: original button width changed`);
  assert.equal(sizes.height, 44, `${label}: original button height changed`);
  assert.equal(sizes.artWidth, 30);
  assert.equal(sizes.artHeight, 30);
  assert.ok(Math.abs(sizes.centerX) < 1 && Math.abs(sizes.centerY) < 1, `${label}: artwork is off center`);
  assert.ok(sizes.naturalWidth > 0 && sizes.opacity === '1');
  assert.ok(sizes.after === 'none' || sizes.after === 'normal', `${label}: old AI text still overlays the artwork`);
  assert.equal(sizes.alt, '');
  assert.equal(await button.getAttribute('aria-label'), 'Chat with Alex');

  const screenshot = await button.screenshot();
  const { data, info } = await sharp(screenshot).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let colored = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const high = Math.max(data[i], data[i + 1], data[i + 2]);
    const low = Math.min(data[i], data[i + 1], data[i + 2]);
    if (high - low > 45 && high > 100) colored++;
  }
  assert.ok(colored > 50, `${label}: artwork is missing or faded`);
  return button;
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
      let button = await checkHeaderButton(page, `${width}px profile`);
      if (width === 390 && process.env.HEADER_AI_SCREENSHOT) {
        await page.screenshot({ path: process.env.HEADER_AI_SCREENSHOT, clip: { x: 0, y: 0, width, height: 145 } });
      }
      if (width === 390) {
        await button.tap();
        const close = page.getByRole('button', { name: 'Close', exact: true });
        await close.waitFor({ state: 'visible' });
        await close.tap();
        await close.waitFor({ state: 'hidden' });
        button = await checkHeaderButton(page, 'profile after closing chat');
        await button.dispatchEvent('pointerdown', { pointerType: 'touch', button: 0 });
        await page.waitForTimeout(500);
        await button.dispatchEvent('pointerup', { pointerType: 'touch', button: 0 });
        await page.getByRole('button', { name: 'Close menu' }).waitFor({ state: 'visible' });
        assert.equal(await button.locator('.alex-fab-header-mark').count(), 0, 'close control must not show the icon');
        await button.tap();
        await checkHeaderButton(page, 'profile after closing quick menu');
      }
      await page.getByTestId('profile-help').tap();
      await page.getByTestId('profile-help-page').waitFor();
      await checkHeaderButton(page, `${width}px help`);
      await page.getByTestId('nav-constructor').tap();
      await page.waitForFunction(() => location.hash === '#/constructor');
      await checkHeaderButton(page, `${width}px order`);
      await page.getByTestId('nav-showcase').tap();
      await page.waitForFunction(() => location.hash === '#/');
      if (await page.locator('.home-ai-surface').count()) await checkHeaderButton(page, `${width}px home`);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}px: original button size, visible artwork, navigation and touch behavior passed`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
