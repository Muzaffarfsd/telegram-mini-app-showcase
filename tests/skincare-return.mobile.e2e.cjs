const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const site = process.env.SKINCARE_TEST_URL || 'http://127.0.0.1:41755/';

async function check(engine, scheme) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true, colorScheme: scheme, serviceWorkers: 'block', locale: 'ru-RU' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('#/demos/skincare-aura/app', site).href);
    await page.getByTestId('demo-content').waitFor();
    assert.equal(await page.getByTestId('button-home-main').count(), 0, 'duplicate floating return must not obscure content');
    const nav = page.locator('.demo-shell-navigation');
    await nav.waitFor();
    const back = page.getByTestId('demo-return-web4tg');
    assert.equal(await back.count(), 1);
    assert.equal(await back.isVisible(), true);
    await nav.getByTestId('nav-catalog').tap();
    await page.getByText('Каталог', { exact: true }).first().waitFor();
    await back.tap();
    await page.waitForURL(url => url.hash === '#/');
    await page.goto(new URL('#/projects?project=skincare-aura', site).href);
    await page.getByTestId('project-story-open').tap();
    await page.getByTestId('demo-content').waitFor();
    await page.getByTestId('demo-return-web4tg').tap();
    await page.waitForURL(url => url.hash === '#/projects?project=skincare-aura');
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()} ${scheme}: skincare navigation, direct return and project-story return`);
  } finally { await context.close(); await browser.close(); }
}
(async () => { for (const engine of [chromium, webkit]) for (const scheme of ['light','dark']) await check(engine, scheme); })().catch(error => { console.error(error); process.exit(1); });
