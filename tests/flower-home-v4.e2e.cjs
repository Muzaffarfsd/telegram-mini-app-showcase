const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.FLOWER_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/?$/, '/');
const app = `${base}#/demos/flower-store/app`;
const targets = ['Корзины', 'Вазы', 'Сборные'];
const expectedIds = ['ref-sun-basket','ref-vase','ref-pink-basket','ref-red-rose','ref-spring'];
const waitIndex = (page, n) => page.waitForFunction(n => document.querySelector('.fh4-counter strong')?.textContent === String(n).padStart(2,'0'), n, {timeout: 10000});
async function home(page) { await page.locator('.fs-nav').getByRole('button',{name:'Главная',exact:true}).click(); await page.getByTestId('flower-home-v4').waitFor(); await waitIndex(page,2); }
async function gesture(page, context, width, direction) {
 const rect=await page.locator('.fh4-track').boundingBox(), client=await context.newCDPSession(page);
 const y=rect.y+rect.height*.42, x=width*(direction==='left'?.76:.20), delta=width*.045*(direction==='left'?-1:1);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
 for(let i=1;i<=12;i++){await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+i*delta,y}]});await new Promise(r=>setTimeout(r,25));}
 await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await client.detach();
}
async function run(engine,width) {
 const browser=await engine.launch();
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 try {
  await page.goto(app,{waitUntil:'domcontentloaded'});await page.getByTestId('flower-home-v4').waitFor({timeout:30000});await waitIndex(page,2);
  const layout=await page.evaluate(()=>{const t=document.querySelector('.fh4-track'),b=t.getBoundingClientRect(),cards=[...t.children].map(n=>n.getBoundingClientRect()),nav=document.querySelector('.fs-nav').getBoundingClientRect();return{width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,visible:cards.map(r=>Math.max(0,Math.min(r.right,b.right)-Math.max(r.left,b.left))),nav:nav.toJSON(),height:innerHeight}});
  assert.equal(layout.scroll,layout.width,'page must not overflow horizontally');assert.ok(layout.visible[0]>0&&layout.visible[1]>0&&layout.visible[2]>0,'adjacent cards should be visible');assert.ok(layout.nav.left>=0&&layout.nav.right<=width&&layout.nav.bottom<=layout.height,'navigation must be in viewport');
  const slides=page.locator('.fh4-slide');assert.equal(await slides.count(),expectedIds.length);
  for(let i=0;i<expectedIds.length;i++){const src=await slides.nth(i).locator('img').getAttribute('src');assert.ok(src.includes(expectedIds[i]),`unexpected product at ${i}`);const response=await context.request.get(new URL(src,base).href);assert.equal(response.status(),200,src);assert.match(response.headers()['content-type']||'',/^image\/(png|webp)/,src);assert.ok(await page.evaluate(async src=>{const image=new Image();image.src=src;try{await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('decode timed out')),10000))]);return image.naturalWidth>0}catch{return false}},src),`image could not decode: ${src}`);}
  const previous=page.getByRole('button',{name:'Предыдущий букет'}),next=page.getByRole('button',{name:'Следующий букет'});
  await previous.click();await waitIndex(page,1);assert.equal(await previous.isDisabled(),true);await next.click();await waitIndex(page,2);
  await page.locator('.fh4-track').focus();await page.keyboard.press('ArrowRight');await waitIndex(page,3);await page.keyboard.press('ArrowLeft');await waitIndex(page,2);
  for(let i=3;i<=5;i++){await next.click();await waitIndex(page,i)}assert.equal(await next.isDisabled(),true);await previous.click();await waitIndex(page,4);
  if(engine===chromium){await previous.click();await waitIndex(page,3);await previous.click();await waitIndex(page,2);await gesture(page,context,width,'left');await waitIndex(page,3);await gesture(page,context,width,'right');await waitIndex(page,2);}
  for(const [label,category] of [['КОРЗИНАХ','Корзины'],['В ВАЗАХ','Вазы'],['СБОРНЫЕ','Сборные']]){await page.locator('.fh4-category').filter({hasText:label}).click();await page.getByTestId('flower-catalog-v2').waitFor();assert.ok(await page.locator('.fc-card').count()>0,`empty ${category} category`);assert.match(await page.locator('.fc-results h2').textContent(),new RegExp(category,'i'));await home(page);}
  const item=slides.nth(1);await item.locator('.fh4-product').click();await page.getByTestId('flower-detail').waitFor();assert.equal((await page.locator('.f3-heading h1').textContent()).trim(),'Цветочная история');assert.ok(page.url().includes('product=ref-vase'));
  assert.deepEqual(errors,[]);
  console.log(`PASS ${engine.name()} ${width}: slider controls, categories, product, image loading${engine===chromium?', touch swipe':''}`);
 } finally { await context.close();await browser.close(); }
}
(async()=>{for(const engine of [chromium,webkit])for(const width of [320,390,430])await run(engine,width)})().catch(e=>{console.error(e);process.exitCode=1});
