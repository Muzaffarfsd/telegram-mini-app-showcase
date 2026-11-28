const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:41757/';
async function test(engine, width, height) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: {width,height}, isMobile:true, hasTouch:true, deviceScaleFactor:2, locale:'ru-RU', serviceWorkers:'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(site, {waitUntil:'domcontentloaded'});
    await page.getByTestId('home-page').waitFor();
    const home = await page.evaluate(() => ({content:document.querySelector('.studio-home__inner').getBoundingClientRect().width, intro:document.querySelector('.studio-intro').getBoundingClientRect().width, demo:document.querySelector('.home-demo').getBoundingClientRect().width, columns:getComputedStyle(document.querySelector('.studio-editorial')).gridTemplateColumns, overflow:document.documentElement.scrollWidth > innerWidth}));
    assert.ok(!home.overflow, `home horizontal overflow at ${width}`);
    if (width >= 720) { assert.ok(home.content >= width * .9, `home content too narrow at ${width}`); assert.notEqual(home.columns, 'none'); }
    else assert.equal(home.columns,'none');
    const switcher=page.locator('.home-demo__switch button').last(); await switcher.tap(); assert.equal(await switcher.getAttribute('aria-pressed'),'true');
    await page.getByTestId('nav-profile').tap();
    await page.getByTestId('profile-page').waitFor();
    const profile = await page.evaluate(() => { const content=document.querySelector('.profile-content'); const art=document.querySelector('.profile-home-art').getBoundingClientRect(); const copy=document.querySelector('.profile-home-art').closest('button').querySelector('.profile-setting-copy').getBoundingClientRect(); return {width:content.getBoundingClientRect().width, columns:getComputedStyle(content).gridTemplateColumns, overflow:document.documentElement.scrollWidth > innerWidth, overlapY:copy.bottom-art.top}; });
    assert.ok(!profile.overflow, `profile horizontal overflow at ${width}`);
    if (width >= 720) { assert.ok(profile.width >= width * .85, `profile content too narrow at ${width}`); assert.notEqual(profile.columns,'none'); assert.ok(profile.overlapY < 1, `illustration overlaps copy by ${profile.overlapY}px at ${width}`); } else assert.equal(profile.columns,'none');
    const disclosure=page.locator('.profile-code-details summary'); await disclosure.scrollIntoViewIfNeeded(); await disclosure.tap(); assert.ok(await page.locator('.profile-code-details').evaluate(el=>el.open));
    const language=page.locator('#profile-language'); await language.selectOption('en'); await page.waitForFunction(() => document.querySelector('.profile-page h1')?.textContent === 'Profile');
    assert.deepEqual(errors, []); console.log(`PASS ${engine.name()} ${width}×${height}: home, profile, controls and no page overflow`);
  } finally { await context.close(); await browser.close(); }
}
(async()=>{for(const engine of [chromium,webkit]) for(const [w,h] of [[320,568],[390,844],[720,1024],[768,1024],[1024,1366],[844,390]]) await test(engine,w,h)})().catch(e=>{console.error(e);process.exit(1)});
