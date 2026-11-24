const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const sharp = require('sharp');
const site = process.env.HOME_TEST_URL || 'http://127.0.0.1:5000/';

async function check(engine, theme, height) {
  const browser = await engine.launch();
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height }, deviceScaleFactor: 1,
      isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await ctx.addInitScript(theme => localStorage.setItem('app-theme', theme), theme);
    const page = await ctx.newPage();
    const requests = [];
    page.on('request', request => requests.push(new URL(request.url()).pathname));
    await page.goto(new URL('/#/analytics', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('home-page').waitFor();
    await page.getByTestId('button-hamburger').tap();
    const drawer = page.locator('.w4m-panel.open');
    await drawer.waitFor();
    if (theme === 'light') await page.locator('html.light').waitFor();
    assert.deepEqual(await drawer.locator('.w4m-row').evaluateAll(rows => rows.map(row => row.dataset.testid)),
      ['button-nav-home', 'button-nav-projects', 'button-nav-ai-process', 'button-nav-about', 'button-nav-constructor']);
    const cta = drawer.getByTestId('button-discuss-project');
    await cta.scrollIntoViewIfNeeded();
    const gap = await drawer.evaluate(el => {
      const [list, footer] = el.children;
      const a = list.getBoundingClientRect(), b = footer.getBoundingClientRect();
      return { top: Math.ceil(a.bottom + 2), bottom: Math.floor(b.top - 2),
        shadows: [list, footer].map(node => getComputedStyle(node).boxShadow) };
    });
    assert.deepEqual(gap.shadows, ['none', 'none']);
    if (height >= 900) {
      assert.ok(gap.bottom - gap.top > 12, 'the sample must include the space above the footer');
      const strip = await page.screenshot({ clip: { x: 14, y: gap.top, width: 300, height: gap.bottom - gap.top } });
      const pixels = await sharp(strip).removeAlpha().raw().toBuffer();
      assert.ok(pixels.every(channel => channel >= 253), 'the space between navigation and footer must be white');
    }
    await cta.tap();
    await page.getByTestId('order-page').waitFor();
    assert.ok(!requests.some(path => /\/assets\/analytics-[^/]*\.js$|\/api\/analytics\/dashboard$/.test(path)));
    console.log(engine.name(), theme, height, 'retired link, drawer surface and order action passed');
  } finally { await browser.close(); }
}

(async () => {
  await check(chromium, 'light', 920);
  await check(webkit, 'light', 844);
  await check(chromium, 'dark', 568);
})().catch(error => { console.error(error); process.exitCode = 1; });
