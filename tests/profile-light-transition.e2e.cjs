const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:53732/';
const destinations = [
  ['profile-referral-program', 'ReferralProgram', 'referral', 'profile-referral-page'],
  ['profile-rewards', 'GamificationHub', 'rewards', 'profile-rewards-page'],
  ['profile-earning', 'EarningPage', 'earning', 'profile-earning-page'],
  ['profile-help', 'HelpPage', 'help', 'profile-help-page'],
  ['profile-review', 'ReviewPage', 'review', 'profile-review-page'],
];
async function whitePixel(page) {
  const image = await page.screenshot();
  const { data, info } = await sharp(image).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const x = 4, y = Math.min(400, info.height - 1), offset = (y * info.width + x) * info.channels;
  return Array.from(data.subarray(offset, offset + 3));
}
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [card, chunk, hash, destination] of destinations) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: hash === 'help' ? 'reduce' : 'no-preference', serviceWorkers: 'block' });
      await context.addInitScript(() => {
        localStorage.setItem('app-language', 'ru');
        localStorage.setItem('app-theme', 'dark');
        Object.defineProperty(navigator, 'connection', { configurable: true, value: { saveData: true, effectiveType: '2g' } });
      });
      await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
      let release;
      const gate = new Promise(resolve => { release = resolve; });
      let waiting;
      const requested = new Promise(resolve => { waiting = resolve; });
      await context.route(new RegExp(`/(?:assets/${chunk}-[^/]+\\.js|src/components/${chunk}\\.tsx)(?:\\?.*)?$`), async route => { waiting(); await gate; await route.continue(); });
      try {
        const page = await context.newPage();
        await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
        await page.getByTestId('profile-page').waitFor({ timeout: 25000 });
        await page.getByTestId(card).tap();
        await Promise.race([requested, new Promise((_, reject) => setTimeout(() => reject(new Error(`${chunk} request was not intercepted`)), 12000))]);
        await page.waitForFunction(expected => location.hash === `#/${expected}`, hash);
        const bg = await page.locator('[data-scroll="main"]').evaluate(el => getComputedStyle(el).backgroundColor);
        assert.equal(bg, 'rgb(255, 255, 255)', `${hash}: the loading surface must stay white`);
        const pixel = await whitePixel(page);
        assert.ok(pixel.every(value => value >= 245), `${hash}: dark pixels behind the loading page: ${pixel}`);
        assert.equal(await page.getByTestId('profile-detail-skeleton').isVisible(), true);
        if (hash === 'referral' && process.env.PROFILE_TRANSITION_SCREENSHOT) await page.screenshot({ path: process.env.PROFILE_TRANSITION_SCREENSHOT });
        if (hash === 'help') assert.equal(await page.locator('.profile-detail-skeleton .profile-skeleton').first().evaluate(el => getComputedStyle(el).animationName), 'none');
        assert.equal(await page.locator('.w4-topbar').evaluate(el => el.classList.contains('profile-topbar')), true);
        assert.equal(await page.getByTestId('header-brand-mark').locator('rect').getAttribute('fill'), '#000000');
        assert.equal(await page.getByRole('navigation', { name: 'Главное меню' }).evaluate(el => el.classList.contains('profile-nav')), true);
        release();
        await page.getByTestId(destination).waitFor({ timeout: 20000 });
        await page.getByTestId('button-back').tap();
        await page.getByTestId('profile-page').waitFor();
        if (hash === 'referral') {
          await page.getByTestId('nav-showcase').tap();
          await page.waitForFunction(() => location.hash === '#/' && !document.documentElement.classList.contains('profile-detail-theme'));
        }
      } finally { release(); await context.close(); }
      console.log(`${hash}: white transition, light chrome, loading skeleton and return passed on a slow connection`);
    }
    const direct = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
    await direct.addInitScript(() => { localStorage.setItem('app-theme', 'dark'); });
    let unblock;
    const gate = new Promise(resolve => { unblock = resolve; });
    await direct.route(/\/(?:assets\/index-[^/]+\.js|src\/main\.tsx)(?:\?.*)?$/, async route => { await gate; await route.continue(); });
    try {
      const page = await direct.newPage();
      await page.goto(new URL('/#/help', site).href, { waitUntil: 'commit' });
      await page.locator('body').waitFor({ state: 'attached' });
      await page.waitForFunction(() => document.documentElement.classList.contains('profile-detail-theme'), null, { timeout: 5000 });
      assert.equal(await page.locator('html').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'direct profile link must be white before the app bundle loads');
      assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'direct profile link body must be white before the app bundle loads');
      unblock();
      await page.getByTestId('profile-help-page').waitFor({ timeout: 20000 });
    } finally { unblock(); await direct.close(); }
    console.log('Direct profile link: white background before the app bundle loads');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
