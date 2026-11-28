const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const site = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:41755/';
const pages = [
  ['home', '#/', '[data-testid="home-page"]'],
  ['showcase', '#/projects', '[data-testid="projects-showcase"]'],
  ['order', '#/constructor', '[data-testid="order-page"]'],
  ['profile', '#/profile', '[data-testid="profile-page"]'],
  ['consultant', '#/ai-process', '[data-testid="consultant-page"]'],
  ['about', '#/about', '[data-testid="about-page"]'],
];
async function swipe(cdp, from, to) {
  await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x:35,y:from}]});
  for (let i=1;i<=20;i++) {
    await cdp.send('Input.dispatchTouchEvent', {type:'touchMove',touchPoints:[{x:35,y:from+(to-from)*i/20}]});
    await new Promise(resolve=>setTimeout(resolve,12));
  }
  await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
}
(async()=>{
  const browser=await chromium.launch();
  try {
    for (const low of [false,true]) for (const [name,hash,selector] of pages) {
      const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ru-RU',serviceWorkers:'block'});
      await ctx.addInitScript(low=>{localStorage.setItem('app-language','ru');if(low)localStorage.setItem('tma-low-performance','true');else localStorage.removeItem('tma-low-performance');},low);
      await ctx.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
      await ctx.route('**/api/**',r=>r.fulfill({json:{data:[]}}));
      const page=await ctx.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
      try {
        await page.goto(new URL(hash,site).href);
        await page.locator(selector).first().waitFor();
        await page.evaluate(()=>document.fonts.ready);
        await page.waitForTimeout(300);
        const cdp=await ctx.newCDPSession(page);
        const start=await page.locator('#root').evaluate(el=>el.scrollTop);
        await swipe(cdp,650,310);
        const down=await page.locator('#root').evaluate(el=>el.scrollTop);
        assert.ok(down>start+80,`${name} low=${low}: downward drag did not follow the finger (${start}→${down})`);
        await swipe(cdp,310,610);
        const up=await page.locator('#root').evaluate(el=>el.scrollTop);
        assert.ok(up<down-80,`${name} low=${low}: reverse drag did not move back (${down}→${up})`);
        const defaultTransition=await page.evaluate(()=>{const e=document.createElement('span');document.getElementById('root').appendChild(e);const value=getComputedStyle(e).transitionDuration;e.remove();return value});
        assert.equal(defaultTransition,'0s',`${name}: unrelated elements should not receive a forced transition`);
        assert.deepEqual(errors,[]);
        console.log(`PASS ${name} low=${low}: down ${Math.round(down-start)}px, back ${Math.round(down-up)}px`);
      } finally {await ctx.close();}
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
