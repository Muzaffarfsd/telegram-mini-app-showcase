const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const site = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:41755/';

async function run(browser, platform) {
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript',body:''}));
  await context.route('**/api/**', route => route.fulfill({contentType:'application/json',body:'{"data":[]}'}));
  await context.addInitScript(({platform}) => {
    const events = {}; const noop = () => {};
    const button = () => ({show:noop,hide:noop,enable:noop,disable:noop,onClick:noop,offClick:noop,setText:noop,setParams:noop,showProgress:noop,hideProgress:noop});
    const tg = {version:'8.0',platform,initData:'',initDataUnsafe:{},themeParams:{},colorScheme:'light',viewportHeight:844,viewportStableHeight:844,isExpanded:true,
      safeAreaInset:{top:20,bottom:10,left:0,right:0},contentSafeAreaInset:{top:0,bottom:0,left:0,right:0},
      ready:noop,expand:noop,requestFullscreen:noop,isVersionAtLeast:()=>true,
      onEvent(name,fn){(events[name] ||= []).push(fn)},offEvent(name,fn){events[name]=(events[name]||[]).filter(x=>x!==fn)},
      setBackgroundColor:noop,setHeaderColor:noop,bottomBarColor:'#ffffff',setBottomBarColor(color){this.bottomBarColor=color},
      MainButton:button(),SecondaryButton:button(),BackButton:button(),HapticFeedback:{impactOccurred:noop,selectionChanged:noop,notificationOccurred:noop}};
    window.Telegram = {};
    Object.defineProperty(window.Telegram,'WebApp',{configurable:true,get:()=>tg,set:noop});
    window.__viewportTest = {events,tg};
  }, {platform});
  const page = await context.newPage();
  try {
    await page.goto(new URL('/#/demos/women-fashion/app',site).href,{waitUntil:'domcontentloaded'});
    await page.getByTestId('women-fashion').waitFor({timeout:30000});
    await page.waitForTimeout(500);
    const repeatedAssignments = await page.evaluate(() => {
      const tracked = new Set(['--tg-safe-area-top','--tg-safe-area-bottom','--tg-safe-area-left','--tg-safe-area-right','--tg-viewport-height','--tg-viewport-stable-height','--vh']);
      const original = CSSStyleDeclaration.prototype.setProperty; let calls = 0;
      CSSStyleDeclaration.prototype.setProperty = function(name,...args) { if(tracked.has(name)) calls++; return original.call(this,name,...args); };
      try { for(let i=0;i<20;i++) for(const fn of window.__viewportTest.events.viewportChanged || []) fn({isStateStable:true}); }
      finally { CSSStyleDeclaration.prototype.setProperty = original; }
      return calls;
    });
    // Other active Telegram components can still assign some variables. The
    // common hook used to issue 600 writes for these unchanged notifications.
    assert.ok(repeatedAssignments <= 120, `unchanged events made ${repeatedAssignments} tracked CSS assignments`);
    await page.evaluate(() => { location.hash = '#/'; });
    await page.getByTestId('home-page').waitFor({timeout:30000});
    await page.waitForTimeout(250);
    let state = await page.evaluate(() => ({top:document.body.style.paddingTop,bottom:document.body.style.paddingBottom}));
    assert.deepEqual(state,{top:'20px',bottom:'10px'},'unmounting a demo must not clear the active Telegram safe area');
    await page.evaluate(() => {
      const {events,tg}=window.__viewportTest;
      tg.safeAreaInset={top:25,bottom:15,left:0,right:0};
      tg.viewportHeight=800; tg.viewportStableHeight=800; tg.bottomBarColor='#000000';
      for(const fn of events.viewportChanged||[]) fn({isStateStable:true});
    });
    state=await page.evaluate(() => ({top:document.body.style.paddingTop,bottom:document.body.style.paddingBottom,height:document.documentElement.style.getPropertyValue('--tg-viewport-height'),bottomBar:window.__viewportTest.tg.bottomBarColor}));
    assert.deepEqual(state,{top:'25px',bottom:'15px',height:'800px',bottomBar:'#ffffff'},'real host changes still apply and native bottom bar is repaired');
    const cdp=await context.newCDPSession(page);
    const before=await page.locator('#root').evaluate(el=>el.scrollTop);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:195,y:650}]});
    for(let i=1;i<=16;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:650-i*15}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    const after=await page.locator('#root').evaluate(el=>el.scrollTop);
    assert.ok(after-before>80,`page should follow the finger after a Telegram viewport change: ${before} -> ${after}`);
    console.log(`PASS simulated Telegram ${platform}: safe area survives navigation, actual viewport changes apply, scroll follows touch, ${repeatedAssignments} unchanged-event assignments`);
  } finally { await context.close(); }
}

(async()=>{const browser=await chromium.launch({headless:true});try{for(const platform of ['ios','android']) await run(browser,platform);}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1});
