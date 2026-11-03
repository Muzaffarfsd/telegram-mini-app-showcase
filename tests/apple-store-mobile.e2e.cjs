const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.APPLE_TEST_URL||'http://127.0.0.1:53738/';
const cards=p=>p.locator('[data-testid^="as-card-"]');
const nav=p=>p.locator('.as-nav');
async function showCatalog(page){await nav(page).getByRole('button',{name:'Каталог'}).tap();await page.locator('.as-catalog').waitFor();}
async function assertBottom(page,selector){
 await page.evaluate(()=>{const root=document.querySelector('#root');root.scrollTop=root.scrollHeight});
 await page.waitForTimeout(200);
 const g=await page.evaluate(selector=>{const root=document.querySelector('#root').getBoundingClientRect(),nav=document.querySelector('.as-nav').getBoundingClientRect(),el=[...document.querySelectorAll(selector)].at(-1)?.getBoundingClientRect();return {root:root.toJSON(),nav:nav.toJSON(),el:el?.toJSON()};},selector);
 assert.ok(g.el&&g.el.bottom<=g.nav.top+1,`Last item hidden by nav: ${JSON.stringify(g)}`);
}
async function run(engine,width,height){
 const b=await engine.launch({headless:true}),c=await b.newContext({viewport:{width,height},isMobile:true,hasTouch:true,locale:'ru-RU',reducedMotion:'reduce',serviceWorkers:'block'});
 await c.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 const p=await c.newPage(), errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
 await p.goto(`${base}#/demos/apple-store/app`,{waitUntil:'domcontentloaded'});await p.getByTestId('apple-store').waitFor({timeout:30000});
 assert.ok(await p.locator('.as-hero h1').isVisible());
 assert.equal(await p.locator('.as-category-card').count(),6);
 await showCatalog(p); assert.equal(await cards(p).count(),17);
 await assertBottom(p,'.as-catalog .as-card');
 let search=p.getByRole('searchbox',{name:'Поиск по каталогу'});await search.fill('MacBook');assert.equal(await cards(p).count(),2);await search.fill('');
 await p.getByRole('button',{name:'Фильтр',exact:true}).tap(); let d=p.getByRole('dialog');await d.getByRole('button',{name:'AirPods',exact:true}).tap();await d.getByRole('button',{name:'До 50 000 ₽',exact:true}).tap();await d.getByRole('button',{name:'ПОКАЗАТЬ МОДЕЛИ'}).tap();await d.waitFor({state:'hidden'});assert.equal(await cards(p).count(),2);await p.getByRole('button',{name:'Убрать фильтр цены'}).tap();assert.equal(await cards(p).count(),3);
 await p.getByRole('button',{name:'Все',exact:true}).tap();assert.equal(await cards(p).count(),17);
 await p.getByTestId('as-card-iphone-pro-max').getByRole('button',{name:/Открыть/}).tap();await p.locator('.as-product').waitFor();
 assert.equal(await p.locator('.as-product-gallery img').getAttribute('alt'),'iPhone Pro Max: товар');
 await p.getByRole('button',{name:'В жизни',exact:true}).tap();assert.match(await p.locator('.as-product-gallery img').getAttribute('alt'),/в жизни/);
 await p.getByRole('button',{name:'Товар',exact:true}).tap();assert.match(await p.locator('.as-product-gallery img').getAttribute('alt'),/товар/);
 await p.getByRole('button',{name:'В избранное: iPhone Pro Max'}).tap();assert.equal(await p.getByRole('button',{name:'Убрать из избранного: iPhone Pro Max'}).getAttribute('aria-pressed'),'true');
 await p.getByRole('button',{name:'Серебристый',exact:true}).tap();await p.getByRole('button',{name:'512 ГБ',exact:true}).tap();
 await p.getByRole('button',{name:/В КОРЗИНУ/}).tap();d=p.getByRole('dialog');await d.waitFor();assert.match(await d.textContent(),/Серебристый.*512 ГБ/);
 await d.getByRole('button',{name:'Увеличить количество iPhone Pro Max'}).tap();assert.match(await d.textContent(),/2/);
 await d.getByRole('button',{name:/ОФОРМИТЬ ДЕМО-ЗАКАЗ/}).tap();await p.locator('.as-checkout').waitFor();
 await p.getByRole('button',{name:/ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/}).tap();const name=p.locator('input[autocomplete=name]');await p.waitForFunction(()=>document.activeElement?.getAttribute('autocomplete')==='name');assert.equal(await name.getAttribute('aria-invalid'),'true');
 const geometry=await name.evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),header:document.querySelector('.w4-topbar').getBoundingClientRect().toJSON(),nav:document.querySelector('.as-nav').getBoundingClientRect().toJSON()}));assert.ok(geometry.rect.top>=geometry.header.bottom&&geometry.rect.bottom<=geometry.nav.top,`Focused input hidden: ${JSON.stringify(geometry)}`);
 await name.fill('Тест');await p.getByRole('button',{name:/ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/}).tap();const phone=p.locator('input[autocomplete=tel]');await p.waitForFunction(()=>document.activeElement?.getAttribute('autocomplete')==='tel');await phone.fill('9001234567');await p.getByRole('button',{name:/ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/}).tap();await p.locator('.as-success').waitFor();assert.match(await p.locator('.as-success').textContent(),/пример покупки/);
 assert.deepEqual(errors,[]);console.log(`${engine.name()} ${width}x${height}: home, catalog, filters, bottom reachability, gallery, favorite, cart and checkout passed`);
 } finally {await c.close();await b.close();}
}
(async()=>{await run(chromium,320,568);await run(chromium,390,844);await run(webkit,320,568);await run(webkit,430,932);})().catch(e=>{console.error(e);process.exitCode=1});


