const assert = require('node:assert/strict');
const { chromium } = require('playwright');

// Start Vite first, or set INVITE_TEST_URL.
const site = process.env.INVITE_TEST_URL || 'http://127.0.0.1:5194/';
const demos = ['flower-store', 'china-buyer', 'medical-center', 'lumi-studio', 'opt-market', 'apple-store', 'muraka-fashion', 'women-fashion', 'nike-sneakers', 'skincare-aura'];

async function scenario(browser, id, kind = 'prepared') {
  const context = await browser.newContext({ viewport: { width: 390, height: 740 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  let payload;
  await context.route('**/api/**', async route => {
    if (route.request().url().endsWith('/api/csrf-token')) return route.fulfill({ contentType: 'application/json', body: '{"csrfToken":"csrf"}' });
    if (route.request().url().endsWith('/api/telegram/prepare-invite')) {
      payload = route.request().postDataJSON();
      if (kind === 'prepare-error') return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ messageId: 'prepared-1', deepLink: `https://t.me/w4tg_bot/w4tg?startapp=demo_${id}` }) });
    }
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
  await context.addInitScript(({ kind, id }) => {
    localStorage.setItem('app-language', 'ru');
    const noop = () => {};
    const events = {};
    window.__calls = [];
    const button = () => ({ handler: null, setText: noop, setParams: noop, show: noop, hide: noop, enable: noop, disable: noop, showProgress: noop, hideProgress: noop, onClick(fn) { this.handler = fn; }, offClick(fn) { if (this.handler === fn) this.handler = null; } });
    const sdkData = kind === 'telegram-hash' ? new URLSearchParams(location.hash.slice(1)).get('tgWebAppData') : kind === 'configured-root' ? `start_param=demo_${id}&auth_date=123&hash=signed` : null;
    const tg = {
      version: kind === 'old-client' ? '7.10' : '8.0', platform: 'android', initData: sdkData || 'signed-data', initDataUnsafe: { user: { id: 12345, first_name: 'User' } }, colorScheme: 'light', themeParams: {}, viewportHeight: 740, viewportStableHeight: 740, isExpanded: true, safeAreaInset: {}, contentSafeAreaInset: {},
      MainButton: button(), SecondaryButton: button(), BackButton: { show: noop, hide: noop, onClick: noop, offClick: noop }, HapticFeedback: { impactOccurred: noop, selectionChanged: noop, notificationOccurred: noop }, ready: noop, expand: noop, requestFullscreen: noop, setHeaderColor: noop, setBackgroundColor: noop, setBottomBarColor: noop, isVersionAtLeast: () => true, disableVerticalSwipes: noop, enableVerticalSwipes: noop,
      onEvent(name, fn) { (events[name] ||= []).push(fn); }, offEvent(name, fn) { events[name] = (events[name] || []).filter(item => item !== fn); }, shareMessage(messageId) { window.__calls.push(['share', messageId]); }, openTelegramLink(url) { window.__calls.push(['fallback', url]); },
    };
    window.__sendEvent = (name, data) => [...(events[name] || [])].forEach(fn => fn(data));
    window.__clickDemoShare = () => tg.SecondaryButton.handler?.();
    window.Telegram = {};
    Object.defineProperty(window.Telegram, 'WebApp', { configurable: true, get: () => tg, set: () => {} });
  }, { kind, id });
  const page = await context.newPage();
  try {
    const destination = kind === 'telegram-hash'
      ? `/#tgWebAppData=${encodeURIComponent(`start_param=demo_${id}&auth_date=123&hash=signed`)}&tgWebAppVersion=8.0&tgWebAppPlatform=android`
      : kind === 'configured-root' ? '/#/?source=telegram' : `/?tgWebAppStartParam=demo_${id}`;
    await page.goto(new URL(destination, site).href, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(url => url.hash === `#/demos/${id}/app`, { timeout: 30000 });
    await page.waitForFunction(() => typeof window.Telegram.WebApp.SecondaryButton.handler === 'function');
    await page.evaluate(() => window.__clickDemoShare());
    if (kind === 'old-client' || kind === 'prepare-error') {
      await page.waitForFunction(() => window.__calls.some(call => call[0] === 'fallback'));
      if (kind === 'old-client') assert.equal(payload, undefined);
    } else {
      await page.waitForFunction(() => window.__calls.some(call => call[0] === 'share'));
      assert.deepEqual(payload, { language: 'ru', referral: false, demoId: id });
      if (kind === 'native-error') await page.evaluate(() => window.__sendEvent('shareMessageFailed', { error: 'MESSAGE_EXPIRED' }));
      else if (kind === 'cancel') {
        await page.evaluate(() => window.__sendEvent('shareMessageFailed', { error: 'USER_DECLINED' }));
        assert.equal(await page.evaluate(() => window.__calls.some(call => call[0] === 'fallback')), false);
      } else await page.evaluate(() => window.__sendEvent('shareMessageSent'));
    }
    if (['old-client', 'prepare-error', 'native-error'].includes(kind)) {
      await page.waitForFunction(() => window.__calls.some(call => call[0] === 'fallback'));
      const fallback = await page.evaluate(() => window.__calls.find(call => call[0] === 'fallback')[1]);
      const url = new URL(fallback);
      assert.equal(url.searchParams.get('url'), `https://t.me/w4tg_bot/w4tg?startapp=demo_${id}`);
      assert.doesNotMatch(url.searchParams.get('text') || '', /реферальн/i);
    }
    if (kind === 'telegram-hash' || kind === 'configured-root') {
      await page.evaluate(() => { location.hash = '/'; });
      await page.waitForURL(url => url.hash === '#/');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
      assert.equal(new URL(page.url()).hash, '#/');
    }
    console.log(`PASS ${id} ${kind}`);
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const id of demos) await scenario(browser, id);
    for (const kind of ['old-client', 'prepare-error', 'native-error', 'cancel', 'telegram-hash', 'configured-root']) await scenario(browser, 'nike-sneakers', kind);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
