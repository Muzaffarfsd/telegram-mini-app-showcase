const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:41755/';
const cases = [
  {id:'muraka-fashion',root:'[data-testid="muraka-fashion"]',nav:'.mf-nav',filter:'.mf-filter-trigger',sheet:'.mf-filter-body',rail:'.mf-chips',product:'.mf-card-open',zoom:'.mf-gallery-zoom',image:'.mf-gallery-image-viewport.is-zoomed'},
  {id:'women-fashion',root:'[data-testid="women-fashion"]',nav:'.mf-nav',filter:'.mf-filter-trigger',sheet:'.mf-filter-body',rail:'.mf-chips',product:'.mf-card-open',zoom:'.mf-gallery-zoom',image:'.mf-gallery-image-viewport.is-zoomed'},
  {id:'jewelry-store',root:'[data-testid="jewelry-store"]',nav:'.mf-nav',filter:'.mf-filter-trigger',sheet:'.mf-filter-body',rail:'.mf-chips',product:'.mf-card-open',zoom:'.mf-gallery-zoom',image:'.mf-gallery-image-viewport.is-zoomed'},
  {id:'nike-sneakers',root:'[data-testid="royal-step"]',nav:'.rs-nav',filter:'.rs-filter-btn',sheet:'.rs-filter-sheet'},
  {id:'apple-store',root:'.as-store',nav:'.as-nav',filter:'.as-catalog-tools > button',sheet:'.as-sheet-body',rail:'.as-chips',product:'.as-card-picture',zoom:'.as-photo-open',image:'.as-inline-photo.is-zoomed'},
];
async function swipe(cdp, from, to, page, target) {
  let samples=[];
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});
  for(let i=1;i<=18;i++){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/18,y:from.y+(to.y-from.y)*i/18}]});
    if (target) samples.push(await target.evaluate(el=>el.scrollTop));
    await new Promise(resolve=>setTimeout(resolve,8));
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  return samples;
}
async function load(page,item){await page.goto(new URL(`#/demos/${item.id}/app`,base).href);await page.locator(item.root).waitFor();await page.waitForTimeout(300);}
async function check(browser,item){
 const context=await browser.newContext({viewport:{width:390,height:640},isMobile:true,hasTouch:true,serviceWorkers:'block'});
 const page=await context.newPage(),cdp=await context.newCDPSession(page),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try {
  await load(page,item);
  const root=page.locator('#root');
  const down=await swipe(cdp,{x:180,y:490},{x:180,y:210},page,root);
  assert.ok(down.at(-1)>100,`${item.id}: downward scroll`);
  assert.ok(down.filter((n,i)=>i && n>down[i-1]).length>=4,`${item.id}: follows finger while scrolling down`);
  await page.waitForTimeout(500);
  const before=await root.evaluate(el=>el.scrollTop);
  const up=await swipe(cdp,{x:180,y:220},{x:180,y:440},page,root);
  assert.ok(up.at(-1)<before-60,`${item.id}: upward scroll`);
  assert.ok(up.filter((n,i)=>i && n<up[i-1]).length>=3,`${item.id}: follows finger while scrolling up`);
  await load(page,item);await page.locator(item.nav).getByRole('button',{name:'Каталог',exact:true}).click();
  if(item.rail){const rail=page.locator(item.rail).first();await rail.waitFor();await rail.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));const box=await rail.boundingBox(),old=await rail.evaluate(el=>el.scrollLeft),max=await rail.evaluate(el=>el.scrollWidth-el.clientWidth);if(max>10){await swipe(cdp,{x:box.x+box.width*.8,y:box.y+box.height*.5},{x:box.x+box.width*.2,y:box.y+box.height*.5});assert.ok(await rail.evaluate(el=>el.scrollLeft)>old+5,`${item.id}: horizontal rail`);}}
  await load(page,item);await page.locator(item.nav).getByRole('button',{name:'Каталог',exact:true}).click();
  const filter=page.locator(item.filter).first();await filter.waitFor();await filter.click();const sheet=page.locator(item.sheet);await sheet.waitFor();const metrics=await sheet.evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight}));
  if(metrics.scroll>metrics.height+10){const box=await sheet.boundingBox(),old=await sheet.evaluate(el=>el.scrollTop);await swipe(cdp,{x:box.x+box.width*.5,y:box.y+box.height*.75},{x:box.x+box.width*.5,y:box.y+box.height*.25});assert.ok(await sheet.evaluate(el=>el.scrollTop)>old+10,`${item.id}: vertical sheet`);}
  if(item.zoom){await page.reload();await page.locator(item.root).waitFor();await page.locator(item.nav).getByRole('button',{name:'Каталог',exact:true}).click();await page.locator(item.product).first().click();await page.locator(item.zoom).click();const view=page.locator(item.image);await view.waitFor();await page.waitForTimeout(100);const box=await view.boundingBox(),old=await view.evaluate(el=>el.scrollTop);await swipe(cdp,{x:box.x+box.width*.35,y:box.y+box.height*.65},{x:box.x+box.width*.35,y:box.y+box.height*.35});assert.notEqual(await view.evaluate(el=>el.scrollTop),old,`${item.id}: zoomed photo gesture`);}
  assert.deepEqual(errors,[]);console.log(`PASS ${item.id}: vertical finger tracking both ways and nested rail/sheet`);
 }finally{await context.close()}
}
(async()=>{const browser=await chromium.launch();try{for(const item of cases)await check(browser,item)}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
