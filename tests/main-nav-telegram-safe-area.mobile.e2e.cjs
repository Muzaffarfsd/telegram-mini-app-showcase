const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium, webkit } = require('playwright');

const site = process.env.NAV_SAFE_TEST_URL || 'http://127.0.0.1:41755/';
const sdk = path.join(path.dirname(require.resolve('@twa-dev/sdk')), 'telegram-web-apps.js');
const pages = [
  ['home', '#/', '[data-testid="home-page"]'],
  ['order', '#/constructor', '[data-testid="order-page"]'],
  ['profile', '#/profile', '[data-testid="profile-page"]'],
  ['consultant', '#/ai-process', '[data-testid="consultant-page"]'],
  ['about', '#/about', '[data-testid="about-page"]'],
];

async function check(engine, name, width, height) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport:{width,height}, isMobile:true, hasTouch:true, locale:'ru-RU', serviceWorkers:'block' });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'application/javascript',path:sdk}));
  await context.route('**/api/**', route => route.fulfill({json:{data:[]}}));
  await context.addInitScript(({height,platform}) => {
    localStorage.setItem('app-language','ru');
    sessionStorage.setItem('__telegram__initParams',JSON.stringify({tgWebAppPlatform:platform,tgWebAppVersion:'8.0'}));
    const replies = {
      web_app_request_viewport:['viewport_changed',{height,is_expanded:true,is_state_stable:true}],
      web_app_request_safe_area:['safe_area_changed',{top:20,bottom:34,left:0,right:0}],
      web_app_request_content_safe_area:['content_safe_area_changed',{top:20,bottom:44,left:0,right:0}],
    };
    window.TelegramWebviewProxy = {postEvent(event) {if (replies[event]) setTimeout(()=>window.Telegram.WebView.receiveEvent(...replies[event]),0);}};
  },{height,platform:name==='webkit'?'ios':'android'});
  const page = await context.newPage();
  try {
    for (const [label, hash, selector] of pages) {
      await page.setViewportSize({width,height});
      await page.goto(new URL(hash,site).href,{waitUntil:'domcontentloaded'});
      await page.locator(selector).first().waitFor({timeout:30000});
      await page.waitForFunction(()=>window.Telegram?.WebApp?.safeAreaInset?.bottom===34 && window.Telegram?.WebApp?.contentSafeAreaInset?.bottom===44);
      await page.evaluate(h=>window.Telegram.WebView.receiveEvent('viewport_changed',{height:h,is_expanded:true,is_state_stable:true}),height);
      const nav = page.locator('nav[role="navigation"]').first();
      const bottom = () => nav.evaluate(el=>el.getBoundingClientRect().bottom);
      const expectBottom = async (expected, message) => {
        await page.waitForFunction(([expected]) => Math.abs(document.querySelector('nav[role="navigation"]').getBoundingClientRect().bottom-expected)<1.5,[expected],{timeout:5000}).catch(async () => { throw new Error(`${name} ${width}×${height} ${label}: ${message}; expected ${expected}, got ${await bottom()}`); });
        assert.ok(Math.abs((await bottom())-expected)<1.5, `${name} ${width}×${height} ${label}: ${message}`);
      };

      // With a full-size WebView, reserve the larger reported inset only once.
      await expectBottom(height-44,'respects Telegram content and system insets');
      assert.ok(await nav.locator('button').evaluateAll(buttons=>buttons.every(button=>button.getBoundingClientRect().bottom <= innerHeight-44+1)),'buttons remain clear of the host safe region');

      // A native row occupies 64 px while the CSS viewport remains full height.
      await page.evaluate(h=>window.Telegram.WebView.receiveEvent('viewport_changed',{height:h-64,is_expanded:true,is_state_stable:true}),height);
      await expectBottom(height-64,'a reduced Telegram viewport is not added to the inset');

      if (label === 'order') {
        await page.getByTestId('template-services').click();
        await page.waitForFunction(()=>document.querySelector('[data-testid="order-page"]')?.getAttribute('data-order-step')==='2');
        const action = page.getByTestId('order-continue');
        await action.waitFor({state:'visible'});
        const geometry = await page.evaluate(() => {
          const nav=document.querySelector('nav[role="navigation"]').getBoundingClientRect();
          const bar=document.querySelector('.order-sticky-bar').getBoundingClientRect();
          return {navTop:nav.top,barBottom:bar.bottom};
        });
        assert.ok(geometry.barBottom <= geometry.navTop, `order action must not overlap navigation: ${JSON.stringify(geometry)}`);
        await action.click();
        await page.waitForFunction(()=>document.querySelector('[data-testid="order-page"]')?.getAttribute('data-order-step')==='3');
        await page.locator('#root').evaluate(el=>{el.scrollTop=el.scrollHeight;});
        await page.waitForTimeout(150);
        const finalAction = page.getByTestId('order-continue');
        const visibility = await finalAction.evaluate(el => {
          const r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
          const hit=document.elementFromPoint(x,y);
          return {visible:y>=0 && y<innerHeight && el.contains(hit), y, top:r.top, bottom:r.bottom, hit:hit?.outerHTML.slice(0,120)};
        });
        assert.ok(visibility.visible,`${name} ${width}×${height}: final order action must be visible and tappable at scroll end ${JSON.stringify(visibility)}`);
      }

      // When the browser viewport itself shrinks, its height already accounts
      // for the native row; do not reserve those 64 px a second time.
      await page.setViewportSize({width,height:height-64});
      await page.evaluate(h=>window.Telegram.WebView.receiveEvent('viewport_changed',{height:h-64,is_expanded:true,is_state_stable:true}),height);
      await expectBottom(height-64-44,'resized viewport reserves only the remaining safe inset');
      console.log(`PASS ${name} ${width}×${height} ${label}: safe insets, host overlay and resized viewport`);
    }
  } finally {await context.close();await browser.close();}
}

(async()=>{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]])
    for(const [width,height] of [[320,568],[390,844],[844,390]]) await check(engine,name,width,height);
})().catch(error=>{console.error(error);process.exitCode=1});
