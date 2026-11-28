const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.PROJECT_STORY_TEST_URL || 'http://127.0.0.1:41757/';

async function test(engine, dpr) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dpr, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  const page = await context.newPage();
  const requests = [];
  page.on('request', request => { if (request.url().includes('/project-stories/')) requests.push(request.url()); });
  try {
    await page.goto(new URL('#/projects?project=takt-coffee', site).href);
    const stage = page.locator('.project-story-gallery-stage').first();
    await stage.scrollIntoViewIfNeeded();
    await stage.locator('img').evaluate(el => el.decode());
    assert.ok(!requests.some(url => url.includes('-3x.webp')), 'the gallery must not preload 3× captures');
    await stage.tap();
    const img = page.getByTestId('project-screen-viewer').locator('img');
    await img.evaluate(el => el.decode());
    const chosen = await img.evaluate(el => ({ src: el.currentSrc, width: el.getBoundingClientRect().width }));
    assert.equal(chosen.src.includes('-3x.webp'), dpr === 3, `incorrect capture selected at ${dpr}×: ${JSON.stringify(chosen)}`);
    assert.ok(chosen.width > 0, 'viewer image should be visible');
    console.log(`PASS ${engine.name()} ${dpr}×: responsive viewer selected ${dpr === 3 ? '3×' : '2×'}; gallery did not preload 3×`);
  } finally { await context.close(); await browser.close(); }
}
(async () => { for (const engine of [chromium, webkit]) for (const dpr of [1, 2, 3]) await test(engine, dpr); })().catch(error => { console.error(error); process.exit(1); });
