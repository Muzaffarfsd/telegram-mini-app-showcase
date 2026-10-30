const { chromium } = require('playwright');
const assert = require('node:assert/strict');

// The real bundled Telegram SDK talks to a simulated phone bridge. No messages are sent.
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:5000/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
    await context.addInitScript(() => {
      localStorage.setItem('app-language', 'ru');
      const user = { id: 12345, first_name: 'Мария', username: 'maria', language_code: 'ru' };
      sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppData: `user=${encodeURIComponent(JSON.stringify(user))}`, tgWebAppVersion: '9.0', tgWebAppPlatform: 'android' }));
      window.__nativeEvents = [];
      window.TelegramWebviewProxy = { postEvent(type, data) { window.__nativeEvents.push({ type, data: data ? JSON.parse(data) : {} }); } };
    });
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/user-projects/**', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
    await context.route('**/api/referrals/stats/**', route => route.fulfill({ contentType: 'application/json', body: '{"referralCode":"W4TTEST"}' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor({ timeout: 30000 });
    await page.getByText('@maria').waitFor({ timeout: 10000 });
    assert.equal(await page.getByText('Telegram подключён').count(), 0);
    assert.equal(await page.getByText('Telegram connected').count(), 0);
    await page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_setup_main_button' && e.data.is_visible));
    const profileButton = await page.evaluate(() => window.__nativeEvents.filter(e => e.type === 'web_app_setup_main_button' && e.data.is_visible).at(-1).data);
    assert.equal(profileButton.color.toUpperCase(), '#FFFFFF');
    assert.equal(profileButton.text_color.toUpperCase(), '#1C1C1E');
    assert.match(profileButton.text, /Пригласить/);
    await page.evaluate(() => window.TelegramGameProxy_receiveEvent('main_button_pressed'));
    await page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_open_tg_link'));

    await page.getByTestId('button-hamburger').tap();
    const menu = page.getByRole('dialog', { name: 'Навигация' });
    await menu.waitFor({ state: 'visible' });
    assert.match(await menu.evaluate(e => getComputedStyle(e).backdropFilter), /blur/);
    assert.match(await page.getByTestId('button-nav-projects').locator('span').evaluate(e => getComputedStyle(e).fontFamily), /Google Sans App/);
    await page.evaluate(() => document.fonts.ready);
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const documentNode = await cdp.send('DOM.getDocument');
    const menuText = await cdp.send('DOM.querySelector', { nodeId: documentNode.root.nodeId, selector: '[data-testid="button-nav-projects"] span' });
    const renderedFonts = await cdp.send('CSS.getPlatformFontsForNode', { nodeId: menuText.nodeId });
    assert.ok(renderedFonts.fonts.some(font => /Google Sans/i.test(font.familyName) && font.isCustomFont && font.glyphCount > 0), 'Cyrillic menu text should use the locally loaded Google Sans font');
    await cdp.detach();
    await page.getByTestId('button-nav-projects').tap();
    await page.waitForURL('**/#/projects');
    assert.equal(await page.locator('.w4m-panel').getAttribute('aria-hidden'), 'true');
    await page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_setup_secondary_button' && e.data.is_visible));
    const buttons = await page.evaluate(() => {
      const latest = type => window.__nativeEvents.filter(e => e.type === type && e.data.is_visible).at(-1)?.data;
      return { main: latest('web_app_setup_main_button'), secondary: latest('web_app_setup_secondary_button') };
    });
    for (const button of Object.values(buttons)) {
      assert.equal(button.color.toUpperCase(), '#FFFFFF');
      assert.equal(button.text_color.toUpperCase(), '#1C1C1E');
    }
    await page.evaluate(() => window.TelegramGameProxy_receiveEvent('main_button_pressed'));
    await page.waitForURL('**/#/constructor');
    await page.getByTestId('nav-showcase').tap();
    await page.waitForURL('**/#/');
    await page.waitForFunction(() => {
      const events = window.__nativeEvents.filter(e => e.type === 'web_app_setup_main_button');
      return events.length && events.at(-1).data.is_visible === false;
    });
    assert.deepEqual(errors, []);
    console.log('Telegram bridge: white buttons, dark text, invite, route changes and cleanup passed');
    await context.close();
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
