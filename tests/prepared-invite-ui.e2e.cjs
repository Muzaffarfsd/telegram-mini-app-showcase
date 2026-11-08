const assert = require('node:assert/strict');
const { chromium } = require('playwright');

// Start Vite first, or provide INVITE_TEST_URL.
const site = process.env.INVITE_TEST_URL || 'http://127.0.0.1:5188/';

async function scenario(browser, kind) {
  const context = await browser.newContext({ viewport: { width: 390, height: 740 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  let payload;
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await context.route('**/api/**', async route => {
    const url = route.request().url();
    if (url.endsWith('/api/csrf-token')) return route.fulfill({ contentType: 'application/json', body: '{"csrfToken":"csrf"}' });
    if (url.endsWith('/api/telegram/prepare-invite')) {
      payload = route.request().postDataJSON();
      assert.equal(route.request().headers()['x-telegram-init-data'], 'signed-data');
      assert.equal(route.request().headers()['x-csrf-token'], 'csrf');
      if (kind === 'slow-navigation') await gate;
      if (kind === 'prepare-error') return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ messageId: 'prepared-1', deepLink: 'https://t.me/w4tg_bot/w4tg?startapp=W4T123' }) });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
  await context.addInitScript(({ kind }) => {
    localStorage.setItem('app-language', 'ru');
    const noop = () => {};
    window.__calls = [];
    const events = {};
    const button = {
      handler: null, setText: noop, setParams: noop, show: noop, hide: noop, enable: noop, disable: noop,
      showProgress: () => window.__calls.push(['progress']), hideProgress: () => window.__calls.push(['ready']),
      onClick(fn) { this.handler = fn; }, offClick(fn) { if (this.handler === fn) this.handler = null; },
    };
    const webApp = {
      version: kind === 'old-client' ? '7.10' : '8.0', platform: 'android', initData: 'signed-data', initDataUnsafe: { user: { id: 12345, first_name: 'User' } }, colorScheme: 'light', themeParams: {},
      viewportHeight: 740, viewportStableHeight: 740, isExpanded: true, safeAreaInset: {}, contentSafeAreaInset: {},
      MainButton: button, SecondaryButton: { ...button }, BackButton: { show: noop, hide: noop, onClick: noop, offClick: noop },
      HapticFeedback: { impactOccurred: noop, selectionChanged: noop, notificationOccurred: noop },
      ready: noop, expand: noop, requestFullscreen: noop, setHeaderColor: noop, setBackgroundColor: noop, setBottomBarColor: noop,
      isVersionAtLeast: () => true, disableVerticalSwipes: noop, enableVerticalSwipes: noop,
      onEvent(name, fn) { (events[name] ||= []).push(fn); }, offEvent(name, fn) { events[name] = (events[name] || []).filter(item => item !== fn); },
      shareMessage(id) { window.__calls.push(['share', id]); },
      openTelegramLink(url) { window.__calls.push(['fallback', url]); },
    };
    window.__sendEvent = (name, data) => [...(events[name] || [])].forEach(fn => fn(data));
    window.__clickInvite = () => webApp.MainButton.handler?.();
    window.Telegram = {};
    // The bundled SDK assigns Telegram.WebApp while loading; retain this
    // controllable native fixture for the application-facing API.
    Object.defineProperty(window.Telegram, 'WebApp', { configurable: true, get: () => webApp, set: () => {} });
  }, { kind });
  const page = await context.newPage();
  try {
    await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor({ timeout: 20000 });
    await page.waitForFunction(() => typeof window.Telegram.WebApp.MainButton.handler === 'function');
    await page.evaluate(() => { window.__clickInvite(); });
    if (kind === 'old-client' || kind === 'prepare-error') {
      await page.waitForFunction(() => window.__calls.some(call => call[0] === 'fallback'));
      assert.equal(await page.evaluate(() => window.__calls.some(call => call[0] === 'share')), false);
      if (kind === 'old-client') assert.equal(payload, undefined);
    } else if (kind === 'slow-navigation') {
      await page.waitForFunction(() => window.__calls.some(call => call[0] === 'progress'));
      await page.evaluate(() => { location.hash = '/projects'; });
      release();
      await page.waitForTimeout(500);
      assert.equal(await page.evaluate(() => window.__calls.some(call => call[0] === 'share' || call[0] === 'fallback')), false);
    } else {
      await page.waitForFunction(() => window.__calls.some(call => call[0] === 'share'));
      assert.deepEqual(payload, { language: 'ru', referral: true });
      assert.deepEqual(await page.evaluate(() => window.__calls.find(call => call[0] === 'share')), ['share', 'prepared-1']);
      await page.evaluate(error => window.__sendEvent('shareMessageFailed', { error }), kind === 'cancel' ? 'USER_DECLINED' : 'MESSAGE_EXPIRED');
      if (kind === 'cancel') {
        assert.equal(await page.evaluate(() => window.__calls.some(call => call[0] === 'fallback')), false);
        await page.evaluate(() => { window.__clickInvite(); });
        await page.waitForFunction(() => window.__calls.filter(call => call[0] === 'share').length === 2);
        await page.evaluate(() => window.__sendEvent('shareMessageSent'));
        await page.evaluate(() => { window.__clickInvite(); });
        await page.waitForFunction(() => window.__calls.filter(call => call[0] === 'share').length === 3);
        await page.evaluate(() => window.__sendEvent('shareMessageSent'));
      } else {
        await page.waitForFunction(() => window.__calls.some(call => call[0] === 'fallback'));
        const url = await page.evaluate(() => window.__calls.find(call => call[0] === 'fallback')[1]);
        assert.match(url, /W4T123/);
      }
    }
    console.log(`PASS ${kind}`);
  } finally { release(); await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try { for (const kind of ['cancel', 'native-error', 'old-client', 'prepare-error', 'slow-navigation']) await scenario(browser, kind); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
