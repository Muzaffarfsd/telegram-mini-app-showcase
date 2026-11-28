const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const site = process.env.MENU_TEST_URL || 'http://127.0.0.1:41755/';
const contact = 'https://t.me/web4tgs';
async function run(engine, lang, mode) {
  const browser = await engine.launch();
  const ctx = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:lang === 'ru' ? 'ru-RU' : 'en-US',serviceWorkers:'block'});
  await ctx.addInitScript(language => localStorage.setItem('app-language', language), lang);
  await ctx.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({body:''}));
  await ctx.route('https://t.me/**', route => route.fulfill({status:200,contentType:'text/html',body:'<title>Mock Telegram</title>'}));
  const page = await ctx.newPage();
  try {
    await page.goto(new URL('/#/',site).href, {waitUntil:'domcontentloaded'});
    await page.getByTestId('button-hamburger').first().waitFor();
    await page.evaluate(mode => {
      window.__contactCalls = [];
      if (!window.Telegram) window.Telegram = {};
      if (!window.Telegram.WebApp) window.Telegram.WebApp = {};
      if (mode === 'native') window.Telegram.WebApp.openTelegramLink = url => window.__contactCalls.push(url);
      else if (mode === 'throw') window.Telegram.WebApp.openTelegramLink = () => { throw Error('not supported'); };
      else delete window.Telegram.WebApp.openTelegramLink;
    }, mode);
    await page.getByTestId('button-hamburger').first().tap();
    const sidebar=page.locator('.w4m-panel');
    await page.waitForFunction(() => document.querySelector('.w4m-panel')?.getAttribute('aria-hidden') === 'false');
    const button=page.getByTestId('button-discuss-project');
    assert.equal(await button.getAttribute('href'),contact);
    assert.equal(await button.getAttribute('rel'),'noopener noreferrer');
    assert.match(await button.innerText(),lang === 'ru' ? /Обсудить проект/ : /Discuss a project/);
    await button.scrollIntoViewIfNeeded();
    if (mode === 'native') {
      await button.tap();
      assert.deepEqual(await page.evaluate(() => window.__contactCalls),[contact]);
    } else {
      const popupPromise=page.waitForEvent('popup', {timeout:10000});
      await button.tap();
      const popup=await popupPromise;
      await popup.waitForLoadState('domcontentloaded');
      assert.equal(popup.url(),contact);
      await popup.close();
    }
    await page.waitForFunction(() => document.querySelector('.w4m-panel')?.getAttribute('aria-hidden') === 'true');
    assert.equal(new URL(page.url()).hash,'#/','contact does not navigate into the order flow');
    assert.equal(await sidebar.getAttribute('aria-hidden'),'true');
    console.log(`PASS ${engine.name()} ${lang} ${mode}: chat link, closed menu, no auto-message`);
  } finally { await ctx.close(); await browser.close(); }
}
(async()=>{for(const engine of [chromium,webkit])for(const lang of ['ru','en'])for(const mode of ['native','missing','throw'])await run(engine,lang,mode)})().catch(error=>{console.error(error);process.exitCode=1});
