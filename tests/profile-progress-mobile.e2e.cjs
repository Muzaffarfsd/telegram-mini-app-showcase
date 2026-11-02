const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:5000/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{}' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(site, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Открыть демо', exact: true }).tap({ timeout: 20000 });
    await page.waitForURL('**/#/demos/electronics/app');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('gamification_stats')).achievements.find(a => a.id === 'explorer-bronze').progress), 1);
    await page.goBack();
    await page.getByTestId('nav-profile').tap();
    await page.getByTestId('profile-rewards').tap();
    await page.getByTestId('profile-rewards-page').waitFor();
    const explorer = page.locator('.pd-achievement').filter({ hasText: 'Исследователь' }).first();
    assert.match(await explorer.innerText(), /1\s*\/\s*3/);
    assert.deepEqual(errors, []);
    await context.close();
    console.log('User journey: opening a demo before the rewards screen is reflected in profile progress');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
