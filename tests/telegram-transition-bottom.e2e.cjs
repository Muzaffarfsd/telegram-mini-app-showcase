const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const sharp = require('sharp');

// Run against local Vite after startup. Telegram's native area is simulated:
// it is outside a browser screenshot, so we separately inspect host colour calls.
const site = process.env.TRANSITION_TEST_URL || 'http://127.0.0.1:5181/';

async function run(browser, id, action) {
  const context = await browser.newContext({ viewport: { width: 390, height: 730 }, deviceScaleFactor: 1,
    isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'no-preference', serviceWorkers: 'block' });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
  await context.addInitScript(({ dark }) => {
    localStorage.setItem('app-language', 'ru');
    window.__hostCalls = [];
    const events = {}, noop = () => {};
    const button = () => ({ handler: null, show: noop, hide() { window.__hostCalls.push({ type: 'hide', hash: location.hash }); },
      enable: noop, disable: noop, onClick(fn) { this.handler = fn; }, offClick(fn) { if (this.handler === fn) this.handler = null; },
      setText: noop, setParams: noop, showProgress: noop, hideProgress: noop });
    const tg = {
      version: '8.0', platform: 'android', initData: '', initDataUnsafe: {}, themeParams: {}, colorScheme: dark ? 'dark' : 'light',
      backgroundColor: '#000000', headerColor: '#000000', bottomBarColor: '#000000', viewportHeight: 730, viewportStableHeight: 844,
      isExpanded: true, safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 }, contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
      ready: noop, expand: noop, requestFullscreen: noop, isVersionAtLeast: () => true,
      onEvent(name, fn) { (events[name] ||= []).push(fn); }, offEvent(name, fn) { events[name] = (events[name] || []).filter(f => f !== fn); },
      setBackgroundColor(color) { this.backgroundColor = color; window.__hostCalls.push({ type: 'background', color, hash: location.hash }); },
      setHeaderColor(color) { this.headerColor = color; window.__hostCalls.push({ type: 'header', color, hash: location.hash }); },
      setBottomBarColor(color) { this.bottomBarColor = color; window.__hostCalls.push({ type: 'bottom', color, hash: location.hash }); },
      MainButton: button(), SecondaryButton: button(), BackButton: button(),
      HapticFeedback: { impactOccurred: noop, selectionChanged: noop, notificationOccurred: noop },
    };
    window.Telegram = {};
    Object.defineProperty(window.Telegram, 'WebApp', { configurable: true, get: () => tg, set: noop });
    window.__nativeClick = () => tg.MainButton.handler?.();
    // Simulate Telegram restoring its previous dark bar when the native button
    // disappears and viewport expands. The viewportChanged callbacks must repair it.
    window.__expandTelegram = () => {
      tg.viewportHeight = 844;
      tg.bottomBarColor = '#000000';
      for (const fn of events.viewportChanged || []) fn({ isStateStable: true });
      return tg.bottomBarColor;
    };
  }, { dark: id === 'skincare-aura' });
  const page = await context.newPage();
  try {
    await page.goto(new URL(`/#/demos/${id}/app`, site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('demo-return-web4tg').waitFor({ state: 'visible', timeout: 25000 });
    if (id === 'skincare-aura') {
      assert.equal(await page.locator('.demo-app-shell').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(16, 17, 20)', 'the source demo stays dark');
    }
    if (action === 'menu') {
      await page.getByTestId('button-hamburger').tap();
      await page.getByTestId('button-nav-home').waitFor({ state: 'visible' });
    }
    if (action === 'order') await page.waitForFunction(() => typeof window.Telegram.WebApp.MainButton.handler === 'function');
    await page.evaluate(() => { window.__hostCalls.length = 0; });
    if (action === 'home') await page.getByTestId('demo-return-web4tg').tap();
    else if (action === 'menu') await page.getByTestId('button-nav-home').tap();
    else await page.evaluate(() => window.__nativeClick());
    const hash = action === 'order' ? '#/constructor' : '#/';
    await page.waitForURL(url => url.hash === hash, { timeout: 15000 });
    await page.waitForFunction(() => window.__hostCalls.some(call => call.type === 'hide'));
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => window.__expandTelegram()), '#ffffff', `${id}/${action}: native bottom area repaired immediately`);
    const nav = page.locator(action === 'order' ? 'nav.order-nav' : 'nav.home-nav');
    await nav.waitFor({ state: 'visible', timeout: 20000 });
    // Sample the complete bottom 114px, rather than only the navigation's CSS.
    // Black icons, product details and soft shadows occupy a small fraction;
    // a black backing or bar would make a substantial part of this region dark.
    for (let i = 0; i < 12; i++) {
      const png = await page.screenshot();
      const { data } = await sharp(png).extract({ left: 0, top: 730, width: 390, height: 114 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      let darkPixels = 0;
      for (let p = 0; p < data.length; p += 3) if (data[p] < 45 && data[p + 1] < 45 && data[p + 2] < 45) darkPixels++;
      assert.ok(darkPixels < 390 * 114 * 0.18, `${id}/${action}: large dark area in frame ${i}: ${darkPixels} pixels`);
    }
    const calls = await page.evaluate(() => window.__hostCalls);
    assert.ok(calls.some(call => call.type === 'hide'), `${id}/${action}: native buttons were hidden`);
    assert.ok(calls.some(call => call.type === 'bottom' && /^#f{3}(f{3})?$/i.test(call.color)), `${id}/${action}: native bottom was set white`);
    assert.deepEqual(calls.filter(call => call.type === 'bottom' && call.hash === hash && /^(#000(?:000)?|black)$/i.test(call.color)), [], `${id}/${action}: destination must never set native bottom black`);
    console.log(`PASS ${id}/${action}: viewport expansion, full bottom area, native colour and 12 animated frames`);
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [id, action] of [['women-fashion','home'], ['women-fashion','menu'], ['women-fashion','order'], ['nike-sneakers','home'], ['skincare-aura','home'], ['skincare-aura','order']]) await run(browser, id, action);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
