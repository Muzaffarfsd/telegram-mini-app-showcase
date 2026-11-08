const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

// Start Vite separately; delay the lazy home page to exercise the actual loading state.
const site = process.env.HOME_NAV_TEST_URL || 'http://127.0.0.1:5181/';
const metadata = fs.readFileSync(path.join(__dirname, '../client/src/data/demoApps.ts'), 'utf8');
const demoIds = [...metadata.matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1]);
demoIds.push('royal-step'); // The public sneaker demo also has this legacy alias.

async function checkScenario(browser, source, performance) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 740 }, isMobile: true, hasTouch: true,
    locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block',
  });
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let blocked = 0;
  await context.route('**/src/components/ShowcasePage.tsx*', async route => {
    blocked++;
    await gate;
    await route.continue().catch(() => {});
  });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
  await context.addInitScript(({ fast }) => {
    localStorage.setItem('app-language', 'ru');
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: fast ? 16 : 2 });
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: fast ? 8 : 1 });
    window.__nativeColors = [];
    const noop = () => {};
    const nativeButton = { show: noop, hide: noop, onClick: noop, offClick: noop, setText: noop, setParams: noop, enable: noop, disable: noop, showProgress: noop, hideProgress: noop };
    const webApp = {
      version: '8.0', platform: 'android', initData: '', initDataUnsafe: {}, themeParams: {}, colorScheme: 'light',
      backgroundColor: '#000000', headerColor: '#000000', bottomBarColor: '#000000',
      viewportHeight: 740, viewportStableHeight: 740, isExpanded: true,
      safeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 }, contentSafeAreaInset: { top: 0, bottom: 0, left: 0, right: 0 },
      ready: noop, expand: noop, onEvent: noop, offEvent: noop, isVersionAtLeast: () => true,
      setBackgroundColor(color) { this.backgroundColor = color; },
      setHeaderColor(color) { this.headerColor = color; },
      setBottomBarColor(color) { this.bottomBarColor = color; window.__nativeColors.push({ color, hash: location.hash }); },
      MainButton: nativeButton, SecondaryButton: nativeButton, BackButton: nativeButton,
      HapticFeedback: { impactOccurred: noop, selectionChanged: noop, notificationOccurred: noop },
    };
    window.Telegram = { WebApp: webApp };
    window.__homeNavFrames = [];
    const sample = () => {
      const nav = document.querySelector('nav.home-nav');
      if (nav && getComputedStyle(nav).visibility !== 'hidden') {
        const layer = nav.firstElementChild;
        window.__homeNavFrames.push({
          nav: getComputedStyle(nav).backgroundColor,
          layer: layer ? getComputedStyle(layer).backgroundColor : 'none',
        });
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }, { fast: performance === 'blur' });
  const page = await context.newPage();
  try {
    if (source !== 'menu') {
      await page.goto(new URL(`/#/demos/${source}/app`, site).href, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('demo-return-web4tg').waitFor({ state: 'visible', timeout: 20000 });
      await page.getByTestId('demo-return-web4tg').tap();
    } else {
      await page.goto(new URL('/#/projects', site).href, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('button-hamburger').tap();
      await page.getByTestId('button-nav-home').tap();
    }
    await page.waitForURL(url => url.hash === '#/' || url.hash === '', { timeout: 15000 });
    // Observe about half a second, including nav animation and delayed cleanup callbacks.
    await page.waitForFunction(() => window.__homeNavFrames.length >= 30, null, { timeout: 10000 });
    assert.ok(blocked > 0, `${source}/${performance}: lazy home module must be delayed`);
    const frames = await page.evaluate(() => window.__homeNavFrames);
    const dark = value => {
      const parts = value.match(/[\d.]+/g)?.map(Number) || [];
      return parts.length >= 3 && (parts[3] ?? 1) > 0.1 && Math.max(...parts.slice(0, 3)) < 100;
    };
    const darkFrames = frames.filter(frame => dark(frame.nav) || dark(frame.layer));
    assert.deepEqual(darkFrames, [], `${source}/${performance}: home navigation must stay light from the first painted frame: ${JSON.stringify(darkFrames.slice(0, 4))}`);
    const native = await page.evaluate(() => window.__nativeColors.filter(call => call.hash === '#/' || call.hash === ''));
    const nativeDark = native.filter(call => /^(#000(?:000)?|black)$/i.test(call.color));
    assert.deepEqual(nativeDark, [], `${source}/${performance}: native bottom bar must not turn black after navigating home`);
    assert.equal(await page.evaluate(() => window.Telegram.WebApp.bottomBarColor), '#ffffff', `${source}/${performance}: native bottom bar is white on home`);
    console.log(`PASS ${source}/${performance}: ${frames.length} frames stayed light while home was loading`);
  } finally {
    release();
    await context.close();
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const source of [...demoIds, 'menu']) await checkScenario(browser, source, 'blur');
    for (const source of ['women-fashion', 'menu']) await checkScenario(browser, source, 'fallback');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
