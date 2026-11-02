const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.HOME_TEST_URL || 'http://127.0.0.1:53735/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, serviceWorkers: 'block', reducedMotion: 'no-preference' });
    await context.addInitScript(() => { localStorage.setItem('app-theme', 'dark'); localStorage.setItem('app-language', 'ru'); });
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    await context.route('**/assets/ShowcasePage-*.js', async route => { await new Promise(resolve => setTimeout(resolve, 1100)); await route.continue(); });
    const page = await context.newPage();
    const stripeRequests = [];
    page.on('request', request => { if (/https:\/\/(js\.stripe\.com|m\.stripe\.network)\//.test(request.url())) stripeRequests.push(request.url()); });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByRole('status', { name: 'Загрузка главной страницы' }).waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor), 'rgb(255, 255, 255)', 'the initial canvas must be white even in dark mode');
    await page.getByTestId('home-page').waitFor({ state: 'visible' });
    await page.getByTestId('home-exhibit').scrollIntoViewIfNeeded();
    const frameStats = await page.evaluate(async () => {
      const samples = [];
      const start = performance.now();
      let last = start;
      while (performance.now() - start < 1400) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const now = performance.now();
        samples.push(now - last);
        last = now;
      }
      samples.sort((a, b) => a - b);
      return { frames: samples.length, medianMs: samples[Math.floor(samples.length * .5)], p95Ms: samples[Math.floor(samples.length * .95)], maxMs: samples.at(-1) };
    });
    assert.ok(frameStats.frames > 20, `animation should continue responding under CPU throttling: ${JSON.stringify(frameStats)}`);
    assert.deepEqual(stripeRequests, [], 'the payment provider should not load on the home screen');
    await page.getByTestId('home-start-order').tap();
    await page.getByTestId('order-page').waitFor({ state: 'visible' });
    await page.waitForFunction(() => document.querySelector('[data-testid="home-exhibit"]')?.getAttribute('data-visible') === 'false');
    assert.equal(await page.locator('.studio-exhibit__object img').evaluate(el => getComputedStyle(el).animationPlayState), 'paused', 'offscreen animation should pause');
    await context.close();
    console.log(`White loading skeleton and hidden-tab pause passed. CPU ×4 sample: ${JSON.stringify(frameStats)}.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
