const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const site = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:41755/';
const apps = [
  { id: 'china-buyer', root: '[data-testid="china-buyer"]', target: '.yb-journey-art' },
  { id: 'lumi-studio', root: '[data-testid="lumi-studio"]', target: '.lumi-v4-hero img' },
  { id: 'medical-center', root: '[data-testid="medical-center"]', target: '.med-home-v2-portrait img' },
  { id: 'skincare-aura', root: '[data-testid="demo-content"]', target: '[data-testid="demo-content"] .overflow-x-auto' },
];
async function swipe(cdp, a, b) {
  const points = (x,y) => [{x,y}];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(...a) });
  for (let i=1; i<=20; i++) {
    const t=i/20;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t) });
    await new Promise(resolve => setTimeout(resolve, 8));
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
(async()=>{
  const browser=await chromium.launch();
  try {
    for (const app of apps) {
      const context=await browser.newContext({ viewport:{width:390,height:844}, hasTouch:true, isMobile:true, serviceWorkers:'block' });
      try {
        const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
        await page.goto(new URL('#/demos/'+app.id+'/app',site).href);
        await page.locator(app.root).first().waitFor();
        const target=page.locator(app.target).first(); await target.waitFor();
        const box=await target.boundingBox(); assert(box && box.width>100 && box.height>100,app.id+' needs a visible gesture area');
        const x=Math.min(370,Math.max(20,box.x+box.width/2));
        const start=Math.min(650, Math.max(160,box.y+box.height*.75));
        const end=Math.max(90,start-150);
        const cdp=await context.newCDPSession(page);
        const before=await page.locator('#root').evaluate(el=>el.scrollTop);
        const hash=new URL(page.url()).hash;
        await swipe(cdp,[x,start],[x,end]);
        await page.waitForFunction(y=>document.getElementById('root').scrollTop>y+65,before);
        assert.equal(new URL(page.url()).hash,hash,app.id+' vertical drag must not navigate');
        assert.equal(await page.locator(app.root).first().isVisible(),true);
        if (app.id === 'china-buyer') {
          const current = () => page.locator('.yb-chapter-tabs [aria-pressed="true"]').getAttribute('aria-label');
          const firstChapter = await current();
          await page.locator('#root').evaluate(el => { el.scrollTop = 0; });
          const art = await target.boundingBox();
          await swipe(cdp, [art.x + art.width * .8, art.y + art.height * .5], [art.x + art.width * .2, art.y + art.height * .5]);
          await page.waitForFunction(label => document.querySelector('.yb-chapter-tabs [aria-pressed="true"]')?.getAttribute('aria-label') !== label, firstChapter);
          assert.equal(await page.locator('#root').evaluate(el => el.scrollTop), 0, 'horizontal swipe must not scroll the page');
        }
        assert.deepEqual(errors,[]);
        console.log('PASS '+app.id+': vertical drag over the main image scrolls without navigation');
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
