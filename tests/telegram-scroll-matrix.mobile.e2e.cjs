const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

// Chromium generates real touch input here. This does not reproduce iOS WebKit,
// the actual Telegram host, hardware rendering, or native momentum after release.
const site = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:41755/';
const routes = [
  ['home', '#/', '[data-testid="home-page"]'],
  ['showcase', '#/projects', '[data-testid="projects-showcase"]'],
  ['order', '#/constructor', '[data-testid="order-page"]'],
  ['profile', '#/profile', '[data-testid="profile-page"]'],
  ['consultant', '#/ai-process', '[data-testid="consultant-page"]'],
  ['about', '#/about', '[data-testid="about-page"]'],
  ...[
    ['muraka-fashion','[data-testid="muraka-fashion"]'], ['women-fashion','[data-testid="women-fashion"]'],
    ['jewelry-store','[data-testid="jewelry-store"]'], ['flower-store','[data-testid="flower-store"]'],
    ['takt-coffee','[data-testid="takt-coffee"]'], ['china-buyer','[data-testid="china-buyer"]'],
    ['medical-center','[data-testid="medical-center"]'], ['lumi-studio','[data-testid="lumi-studio"]'],
    ['opt-market','[data-testid="opt-market"]'], ['nike-sneakers','[data-testid="royal-step"]'],
    ['skincare-aura','[data-testid="demo-content"]'], ['furniture-studio','[data-testid="furniture-store"]'],
    ['apple-store','.as-store'],
  ].map(([name, selector]) => [name, `#/demos/${name}/app`, selector]),
];
const configurations = [
  { name:'compact-ios-host', width:320, height:640, platform:'ios', low:true },
  { name:'iphone-ios-host', width:390, height:844, platform:'ios', low:false },
  { name:'android-host', width:412, height:839, platform:'android', low:true },
];
async function drag(cdp, x, from, to) {
  await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x,y:from}]});
  for (let i=1; i<=16; i++) {
    await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x,y:from+(to-from)*i/16}]});
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
}
(async () => {
  const browser = await chromium.launch();
  try {
    for (const config of configurations) {
      const context = await browser.newContext({viewport:{width:config.width,height:config.height}, isMobile:true, hasTouch:true, locale:'ru-RU', serviceWorkers:'block'});
      const sdk = path.join(path.dirname(require.resolve('@twa-dev/sdk')), 'telegram-web-apps.js');
      await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript', path:sdk}));
      await context.route('**/api/**', route => route.fulfill({json:{data:[]}}));
      await context.addInitScript(({height,platform,low}) => {
        localStorage.setItem('app-language', 'ru');
        if (low) localStorage.setItem('tma-low-performance', 'true');
        else localStorage.removeItem('tma-low-performance');
        sessionStorage.setItem('__telegram__initParams', JSON.stringify({tgWebAppPlatform:platform,tgWebAppVersion:'8.0'}));
        const replies = {
          web_app_request_viewport:['viewport_changed',{height,is_expanded:true,is_state_stable:true}],
          web_app_request_safe_area:['safe_area_changed',{top:20,bottom:10,left:0,right:0}],
          web_app_request_content_safe_area:['content_safe_area_changed',{top:30,bottom:15,left:0,right:0}],
        };
        window.TelegramWebviewProxy = {postEvent(name) {if (replies[name]) setTimeout(() => window.Telegram.WebView.receiveEvent(...replies[name]),0);}};
      }, config);
      try {
        const page = await context.newPage();
        const cdp = await context.newCDPSession(page);
        if (config.low) await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
        for (const [name, route, selector] of routes) {
          await page.goto(new URL(route,site).href, {waitUntil:'domcontentloaded'});
          await page.locator(selector).first().waitFor({timeout:30000});
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(250);
          const root = page.locator('#root');
          const before = await root.evaluate(el=>({top:el.scrollTop, range:el.scrollHeight-el.clientHeight}));
          assert.ok(before.range > 150, `${config.name} ${name}: page must be scrollable`);
          const x = 25, start = Math.round(config.height*.72), end = Math.round(config.height*.32);
          await drag(cdp,x,start,end);
          const down = await root.evaluate(el=>el.scrollTop);
          assert.ok(down-before.top > 80, `${config.name} ${name}: scroll did not track down: ${before.top} to ${down}`);
          await drag(cdp,x,end,start);
          const up = await root.evaluate(el=>el.scrollTop);
          assert.ok(down-up > 80, `${config.name} ${name}: scroll did not track back: ${down} to ${up}`);
          assert.equal(await page.locator(selector).first().isVisible(),true,`${config.name} ${name}: accidental navigation`);
          console.log(`PASS ${config.name} ${name}: down ${Math.round(down-before.top)}px, back ${Math.round(down-up)}px`);
        }
      } finally {await context.close();}
    }
  } finally {await browser.close();}
})().catch(error => {console.error(error); process.exitCode=1;});
