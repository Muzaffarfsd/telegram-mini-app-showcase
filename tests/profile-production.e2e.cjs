const { chromium } = require('playwright');
const sharp = require('sharp');
const assert = require('node:assert/strict');

const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:5175/';
async function assertDrawnIcon(locator, label) {
  assert.equal(await locator.count(), 1, `${label}: missing SVG`);
  assert.ok(await locator.locator('path, circle, rect, line, polyline, polygon').count() > 0, `${label}: missing icon geometry`);
  const image = await locator.screenshot();
  const { data, info } = await sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let minimum = 255, maximum = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const average = (data[i] + data[i + 1] + data[i + 2]) / 3;
    minimum = Math.min(minimum, average);
    maximum = Math.max(maximum, average);
  }
  assert.ok(maximum - minimum > 30, `${label}: icon does not contrast with its background`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390, 430]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
      await context.addInitScript(() => { localStorage.setItem('app-language', 'ru'); localStorage.setItem('tma-low-performance', 'true'); });
      await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{}' }));
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(site, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('nav-profile').tap({ timeout: 30000 });
      await page.getByTestId('profile-page').waitFor({ timeout: 20000 });
      await page.waitForFunction(() => document.documentElement.classList.contains('low-performance'));
      const background = await page.locator('.profile-page').evaluate(e => ({ color: getComputedStyle(e).backgroundColor, image: getComputedStyle(e, '::before').backgroundImage }));
      assert.deepEqual(background, { color: 'rgb(255, 255, 255)', image: 'none' }, 'profile background should stay white');
      const overlayOpacity = await page.locator('.w4m-overlay').evaluate(e => getComputedStyle(e).opacity);
      assert.equal(overlayOpacity, '0', 'closed menu should not dim page');
      const nav = page.locator('.profile-nav');
      const navShadow = await nav.evaluate(e => getComputedStyle(e).boxShadow);
      assert.ok(!navShadow.includes('0.4)'), `mobile dark shadow overrode profile design: ${navShadow}`);
      const header = page.locator('.profile-topbar');
      assert.match(await header.evaluate(e => getComputedStyle(e).backdropFilter), /blur/, 'profile header should be glass');
      assert.equal(await header.innerText(), 'WEB4TG');
      assert.match(await header.locator('span').filter({hasText:'WEB4TG'}).evaluate(e => getComputedStyle(e).fontFamily), /Syne/);
      const navFilters = await nav.evaluate(e => [getComputedStyle(e).backdropFilter, getComputedStyle(e.firstElementChild).backdropFilter]);
      assert.ok(navFilters.some(filter => /blur/.test(filter)), 'navigation should be glass, including in low-performance mode');
      assert.match(await nav.evaluate(e => getComputedStyle(e).backgroundColor), /rgba\(255, 255, 255, 0\./, 'navigation should remain translucent');
      assert.equal(await page.locator('.profile-page').evaluate(e => getComputedStyle(e).opacity), '1', 'profile content should not be faded');
      assert.equal(await page.locator('.profile-page').evaluate(e => getComputedStyle(e).filter), 'none', 'profile colors should not be filtered');
      for (const id of ['nav-showcase', 'nav-ai', 'nav-projects', 'nav-constructor']) {
        await assertDrawnIcon(page.getByTestId(id).locator('svg.lucide'), `${width}px ${id}`);
      }
      const coloredIcon = page.locator('.has-icon-art .profile-empty-icon.profile-icon-folder');
      await coloredIcon.waitFor({ timeout: 10000 });
      assert.equal(await coloredIcon.evaluate(e => getComputedStyle(e).opacity), '1', 'colored icons should not be faded');
      const iconPixels = await sharp(await coloredIcon.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      let colorful = 0;
      for (let i = 0; i < iconPixels.data.length; i += iconPixels.info.channels) {
        const r = iconPixels.data[i], g = iconPixels.data[i + 1], b = iconPixels.data[i + 2];
        if (Math.max(r, g, b) - Math.min(r, g, b) > 40) colorful++;
      }
      assert.ok(colorful > 50, 'chosen colored artwork should remain visibly colored');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (width === 390 && process.env.PROFILE_SCREENSHOT) await page.screenshot({ path: process.env.PROFILE_SCREENSHOT });
      assert.deepEqual(errors, []);
      console.log(`${width}px production: white profile, glass header and navigation, rendered icon pixels passed`);
      await context.close();
    }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(() => { localStorage.setItem('app-language', 'ru'); localStorage.setItem('tma-low-performance', 'true'); });
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{}' }));
    await context.route('**/profile-icons-selected.webp', route => route.abort());
    const page = await context.newPage();
    await page.goto(site, { waitUntil: 'domcontentloaded' }); await page.getByTestId('nav-profile').tap(); await page.getByTestId('profile-page').waitFor();
    await page.getByText('Оставить отзыв').scrollIntoViewIfNeeded();
    for (const icon of ['star', 'instagram', 'tiktok']) {
      const glyph = page.locator(`.profile-icon-${icon} svg.profile-glyph`);
      assert.equal(await glyph.count(), 1, `${icon}: SVG missing`);
      assert.equal(await glyph.evaluate(e => getComputedStyle(e).visibility), 'visible');
      assert.equal(await glyph.locator('path').count(), 1, `${icon}: SVG path missing`);
      const fill = await glyph.evaluate(e => getComputedStyle(e).fill);
      assert.notEqual(fill, 'none', `${icon}: shape should be painted`);
    }
    await page.getByRole('button', { name: /Центр помощи/ }).tap(); await page.waitForURL('**/#/help');
    console.log('Offline icon artwork: SVG fallback, social icons and help navigation passed');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
