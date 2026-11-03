const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.APPLE_TEST_URL || 'http://127.0.0.1:53738/';

async function check(browserType) {
  const browser = await browserType.launch({headless:true});
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ru-RU',reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript',body:''}));
  const page=await context.newPage(), errors=[];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}#/projects`,{waitUntil:'domcontentloaded'});
    const card=page.getByTestId('card-app-apple-store');
    await card.waitFor({timeout:30000});
    assert.match(await card.textContent(),/Apple/i);
    await card.tap();
    await page.waitForURL('**/#/demos/apple-store/app');
    await page.getByTestId('apple-store').waitFor({timeout:30000});
    assert.equal(await page.locator('.w4-topbar').count(),1, 'shared WEB4TG header');
    await page.locator('.home-ai-surface button').waitFor({state:'visible',timeout:30000});
    assert.ok(await page.getByTestId('apple-store').isVisible());
    await page.goBack();
    await page.waitForURL('**/#/projects');
    await page.getByTestId('card-app-apple-store').waitFor();
    assert.deepEqual(errors,[]);
    console.log(`${browserType.name()}: project card, app route, header and browser return passed`);
  } finally {await context.close();await browser.close();}
}
(async()=>{await check(chromium);await check(webkit);})().catch(error=>{console.error(error);process.exitCode=1});


