const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium, webkit } = require('playwright');

const site = process.env.BOOT_TEST_URL || 'http://127.0.0.1:5000/';
const sdkPath = path.join(path.dirname(require.resolve('@twa-dev/sdk')), 'telegram-web-apps.js');
const sdk = fs.readFileSync(sdkPath, 'utf8') + '\nwindow.firstBridge = window.Telegram.WebApp;';

async function checkLaunch(browser, kind) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block',
  });
  const errors = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await context.route('https://telegram.org/js/telegram-web-app.js', async route => {
    await gate;
    if (kind === 'offline-sdk') return route.abort();
    await route.fulfill({ contentType: 'application/javascript', body: sdk });
  });
  await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
  await context.addInitScript(() => {
    window.TelegramWebviewProxy = { postEvent() {} };
    sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppPlatform: 'ios', tgWebAppVersion: '8.0' }));
  });
  try {
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const destination = new URL(site);
    if (kind === 'share') {
      destination.hash = new URLSearchParams({
        tgWebAppData: 'start_param=demo_flower-store&auth_date=101', tgWebAppVersion: '8.0', tgWebAppPlatform: 'ios',
      }).toString();
    }
    await page.goto(destination.href, { waitUntil: 'commit' });
    const shell = page.locator(kind === 'share' ? '#demo-static-shell' : '#home-static-shell');
    await shell.waitFor({ state: 'visible' });
    const firstTop = await shell.evaluate(el => {
      if (getComputedStyle(el.parentElement).opacity !== '1') throw Error('Skeleton is transparent');
      return el.firstElementChild.getBoundingClientRect().top;
    });
    assert.ok(firstTop >= 120, 'native fullscreen inset is reserved before the SDK responds');
    release();
    if (kind === 'share') {
      await page.getByTestId('flower-store').waitFor();
      assert.equal(new URL(page.url()).hash, '#/demos/flower-store/app');
      const homeImageLoaded = await page.evaluate(() => performance.getEntriesByType('resource')
        .some(resource => resource.name.endsWith('/home-editorial/fashion-muraka-home-v2.webp')));
      assert.equal(homeImageLoaded, false, 'direct demo loaded the home artwork');
    } else {
      await page.getByTestId('home-page').waitFor();
      await page.getByTestId('nav-projects').tap();
      await page.getByTestId('projects-showcase').waitFor();
    }
    if (kind !== 'offline-sdk') {
      assert.ok(await page.evaluate(() => window.firstBridge && window.Telegram.WebApp === window.firstBridge),
        'startup replaced the official SDK and lost its listeners');
    }
    assert.deepEqual(errors, []);
  } finally {
    release();
    await context.close();
  }
}

(async () => {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      for (const kind of ['home', 'share', 'offline-sdk']) {
        await checkLaunch(browser, kind);
        console.log('PASS', engine.name(), kind);
      }
    } finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
