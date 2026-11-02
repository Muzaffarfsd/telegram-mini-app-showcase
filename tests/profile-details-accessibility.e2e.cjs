const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:5000/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor();
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    for (const [card, destination] of [['profile-referral-program', 'profile-referral-page'], ['profile-rewards', 'profile-rewards-page'], ['profile-earning', 'profile-earning-page'], ['profile-help', 'profile-help-page'], ['profile-review', 'profile-review-page']]) {
      await page.getByTestId(card).tap();
      await page.getByTestId(destination).waitFor();
      const violations = await page.evaluate(async id => {
        const result = await window.axe.run(document.querySelector(`[data-testid="${id}"]`));
        return result.violations.filter(item => item.impact === 'critical' || item.impact === 'serious').map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => node.target) }));
      }, destination);
      assert.deepEqual(violations, [], `${destination}: ${JSON.stringify(violations)}`);
      await page.getByTestId('button-back').tap();
      await page.getByTestId('profile-page').waitFor();
    }
    console.log('Accessibility: no serious or critical axe violations across the five profile pages at 320px');
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
