const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const site = process.env.COMMERCE_SCROLL_URL || 'http://127.0.0.1:41755/';
const cases = [
  { id:'takt-coffee', root:'[data-testid=takt-coffee]', nav:'.tk-dock [data-tab=menu]', catalog:'.tk-catalogue', card:'.tk-menu-product .tk-card', detail:'.tk-recipe-map', back:'.tk-back' },
  { id:'furniture-studio', root:'[data-testid=furniture-store]', nav:'.fs-nav [aria-label=Каталог]', catalog:'.fs-catalog', card:'.fs-catalog .fs-card-open', detail:'.fs-product-info', back:'.fs-back' },
  { id:'flower-store', root:'[data-testid=flower-store]', nav:'.fs-nav [aria-label=Каталог]', catalog:'[data-testid=flower-catalog-v2]', card:'.fc-open-photo', detail:'[data-testid=flower-detail]', back:'.f3-detail-top button:first-child' },
  { id:'opt-market', root:'[data-testid=opt-market]', nav:'.opt-nav [aria-label=Каталог]', catalog:'.opt-product-card', card:'.opt-product-picture', detail:'.opt-detail-image', back:'.opt-back' },
];
async function swipe(cdp,x,y,dy) {
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=16;i++) {
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y+dy*i/16}]});
    await new Promise(resolve=>setTimeout(resolve,10));
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
}
async function assertSwipe(page,cdp,label,dy=-220) {
  const root=page.locator('#root');
  const before=await root.evaluate(el=>el.scrollTop);
  await swipe(cdp,195,630,dy);
  await page.waitForTimeout(250);
  const after=await root.evaluate(el=>el.scrollTop);
  assert.ok(Math.abs(after-before)>70, `${label}: vertical touch did not scroll (${before} → ${after})`);
}
async function assertRailEdges(page, railSelector, previousSelector, nextSelector) {
  const rail = page.locator(railSelector);
  await rail.scrollIntoViewIfNeeded();
  await rail.evaluate(el => { el.scrollLeft = el.scrollWidth; });
  await page.waitForFunction(selector => document.querySelector(selector)?.disabled === true, nextSelector);
  assert.equal(await page.locator(previousSelector).isDisabled(), false);
  await rail.evaluate(el => { el.scrollLeft = 0; });
  await page.waitForFunction(selector => document.querySelector(selector)?.disabled === true, previousSelector);
  assert.equal(await page.locator(nextSelector).isDisabled(), false);
}
(async()=>{
  const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  try{
    for(const item of cases){
      const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ru-RU',serviceWorkers:'block'});
      await context.addInitScript(()=>localStorage.setItem('app-language','ru'));
      const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
      try{
        await page.goto(new URL(`#/demos/${item.id}/app`,site).href);
        await page.locator(item.root).waitFor();
        const cdp=await context.newCDPSession(page);
        // Exercise the swipe while the main thread has less CPU headroom.
        await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await assertSwipe(page,cdp,`${item.id} home`);
        if (item.id === 'furniture-studio') await assertRailEdges(page, '.fhome-room-rail', '.fhome-rail-nav button:first-child', '.fhome-rail-nav button:last-child');
        await page.locator(item.nav).first().click();
        await page.locator(item.catalog).first().waitFor();
        await page.waitForTimeout(300);
        await assertSwipe(page,cdp,`${item.id} catalog`);
        const card=page.locator(item.card).first();
        await card.scrollIntoViewIfNeeded();
        const before=await page.locator('#root').evaluate(el=>el.scrollTop);
        await card.click();
        await page.locator(item.detail).first().waitFor();
        if (item.id === 'opt-market') await assertRailEdges(page, '.opt-related-track', '.opt-related-controls button:first-child', '.opt-related-controls button:last-child');
        await page.locator(item.back).first().click();
        await page.locator(item.catalog).first().waitFor();
        await page.waitForTimeout(500);
        const restored=await page.locator('#root').evaluate(el=>el.scrollTop);
        assert.ok(Math.abs(restored-before)<120,`${item.id}: catalog position was not restored (${before} → ${restored})`);
        await page.locator('#root').evaluate(el=>el.scrollTop=0);
        await assertSwipe(page,cdp,`${item.id} catalog after return`);
        assert.deepEqual(errors,[]);
        console.log(`PASS ${item.id}: touch scroll on home and catalog, detail return, touch scroll after return`);
      }finally{await context.close()}
    }
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
