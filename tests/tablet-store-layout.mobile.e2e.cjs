const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = process.env.TABLET_TEST_URL || 'http://127.0.0.1:41755/';
const stores = [
  {id:'muraka-fashion',root:'[data-testid="muraka-fashion"]',nav:'.mf-nav',grid:'.mf-grid',card:'.mf-card-open',filter:'.mf-filter-trigger',sheet:'.mf-filter-body',gallery:'.mf-gallery',info:'.mf-product-info'},
  {id:'women-fashion',root:'[data-testid="women-fashion"]',nav:'.mf-nav',grid:'.mf-grid',card:'.mf-card-open',filter:'.mf-filter-trigger',sheet:'.mf-filter-body',gallery:'.mf-gallery',info:'.mf-product-info'},
  {id:'jewelry-store',root:'[data-testid="jewelry-store"]',nav:'.mf-nav',grid:'.mf-grid',card:'.mf-card-open',filter:'.mf-filter-trigger',sheet:'.mf-filter-body',gallery:'.mf-gallery',info:'.mf-product-info'},
  {id:'apple-store',root:'.as-store',nav:'.as-nav',grid:'.as-grid',card:'.as-card-picture',filter:'.as-catalog-tools > button',sheet:'.as-sheet-body',gallery:'.as-product-media',info:'.as-product-info'},
  {id:'nike-sneakers',root:'[data-testid="royal-step"]',nav:'.rs-nav',grid:'.rs-grid',card:'.rs-card__open',filter:'.rs-filter-btn',sheet:'.rs-filter-sheet',gallery:'.rs-gallery',info:'.rs-product__body'},
];
async function check(browser, engine, item, width, height) {
 const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 try {
  await page.goto(new URL(`#/demos/${item.id}/app`,base).href,{waitUntil:'domcontentloaded'});
  await page.locator(item.root).first().waitFor();
  const nav=page.locator(item.nav); await nav.getByRole('button',{name:'Каталог',exact:true}).click();
  const root=page.locator(item.root).first(), grid=page.locator(item.grid).first(); await grid.waitFor();
  const metrics=await root.evaluate((el,{grid})=>{const g=el.querySelector(grid);return {width:el.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth-innerWidth,columns:getComputedStyle(g).gridTemplateColumns.split(' ').length};},{grid:item.grid});
  assert.ok(metrics.overflow<=1,`${item.id} ${width}: page has horizontal overflow ${metrics.overflow}`);
  assert.ok(width<700 ? metrics.width<=448 : metrics.width>=width-2,`${item.id} ${width}: store width ${metrics.width}`);
  assert.equal(metrics.columns,width>=950?4:width>=700?3:2,`${item.id} ${width}: catalog columns`);
  await page.locator(item.filter).first().click();await page.locator(item.sheet).first().waitFor();
  const sheet=await page.locator(item.sheet).first().boundingBox(); assert.ok(sheet && sheet.x>=0 && sheet.x+sheet.width<=width+1,`${item.id} ${width}: filter outside viewport`);
  await page.getByRole('dialog').getByRole('button',{name:'Закрыть',exact:true}).click();await page.locator(item.sheet).first().waitFor({state:'hidden'});
  await page.locator(item.card).first().click(); const gallery=page.locator(item.gallery).first(),info=page.locator(item.info).first();await gallery.waitFor();
  const a=await gallery.boundingBox(), b=await info.boundingBox(); assert.ok(a&&b,`${item.id}: product elements`);
  if(width>=700) {assert.ok(a.x+a.width<=b.x+1,`${item.id} ${width}: overlapping product columns`);assert.ok(Math.abs(a.y-b.y)<45,`${item.id} ${width}: product columns misaligned`);}
  else assert.ok(b.y>=a.y+a.height-1,`${item.id} ${width}: mobile product order`);
  assert.deepEqual(errors,[],`${item.id}: JavaScript errors`);
  console.log(`PASS ${engine} ${item.id} ${width}x${height}: catalog, filter and product`);
 } finally {await Promise.race([context.close(),new Promise(resolve=>setTimeout(resolve,3000))]);}
}
(async()=>{for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){const browser=await type.launch();try{for(const [w,h] of [[390,844],[768,1024],[1024,768]]) for(const item of stores) await check(browser,engine,item,w,h);}finally{await Promise.race([browser.close(),new Promise(resolve=>setTimeout(resolve,3000))]);}}process.exit(0);})().catch(error=>{console.error(error);process.exit(1)});
