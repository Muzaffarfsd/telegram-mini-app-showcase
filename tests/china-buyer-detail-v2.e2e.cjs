const {chromium,webkit}=require('playwright');const assert=require('node:assert/strict');
const base=(process.env.BUYER_TEST_URL||'http://127.0.0.1:53744/').replace(/\/?$/,'/');const engine=process.env.BUYER_ENGINE==='webkit'?webkit:chromium;
async function run(browser,width){const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});await context.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({contentType:'text/javascript',body:''}));const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));try{
 await p.goto(`${base}#/demos/china-buyer/app`);await p.getByTestId('china-buyer').waitFor();await p.locator('.cb-nav').getByRole('button',{name:'Каталог'}).click();await p.getByRole('button',{name:'Открыть Структурный жакет'}).first().click();const detail=p.getByTestId('buyer-product-detail');await detail.waitFor();
 const thumbs=detail.locator('.bpd-thumbs button');assert.equal(await thumbs.count(),3);const before=await detail.locator('.bpd-image-button img').getAttribute('src');await thumbs.nth(1).click();const after=await detail.locator('.bpd-image-button img').getAttribute('src');assert.ok(after);if(before===after)assert.match(await detail.locator('.bpd-gallery-note').textContent(),/одного изображения/);
 await detail.getByRole('button',{name:/Увеличить изображение/}).click();assert.equal(await detail.getByRole('button',{name:/Уменьшить изображение/}).getAttribute('aria-pressed'),'true');
 await detail.getByRole('button',{name:'В избранное: Структурный жакет'}).click();assert.equal(await detail.getByRole('button',{name:'Убрать из избранного: Структурный жакет'}).getAttribute('aria-pressed'),'true');
 await detail.getByLabel('Размер или посадка').fill('M');await detail.getByLabel('Цвет',{exact:true}).fill('Бордовый');await detail.getByLabel(/Что ещё важно/).fill('Свободный крой');await detail.getByRole('button',{name:'Найти похожее'}).click();assert.equal(await p.locator('#cbw-size').inputValue(),'M');assert.equal(await p.locator('#cbw-color').inputValue(),'Бордовый');assert.match(await p.locator('#cbw-description').inputValue(),/Структурный жакет/);assert.match(await p.locator('#cbw-description').inputValue(),/Свободный крой/);
 await p.locator('#cbw-url').fill('https://example.com/item');await p.locator('#cbw-budget').fill('20000');await p.locator('input:focus,textarea:focus').evaluateAll(es=>es.forEach(e=>e.blur()));await p.locator('.cb-nav').getByRole('button',{name:'Каталог'}).click();await p.getByRole('button',{name:'Открыть Структурный жакет'}).first().click();await detail.getByLabel('Цвет',{exact:true}).fill('Чёрный');await detail.getByLabel(/Что ещё важно/).fill('Нужны фото швов');await detail.getByRole('button',{name:'Найти похожее'}).click();assert.equal(await p.locator('#cbw-url').inputValue(),'https://example.com/item');assert.equal(await p.locator('#cbw-budget').inputValue(),'20000');assert.equal(await p.locator('#cbw-size').inputValue(),'M');assert.equal(await p.locator('#cbw-color').inputValue(),'Чёрный');assert.match(await p.locator('#cbw-description').inputValue(),/Свободный крой/);assert.match(await p.locator('#cbw-description').inputValue(),/Нужны фото швов/);await p.locator('input:focus,textarea:focus').evaluateAll(es=>es.forEach(e=>e.blur()));await p.locator('.cb-nav').getByRole('button',{name:'Каталог'}).click();await p.getByRole('button',{name:'Открыть Структурный жакет'}).first().click();const candidate=detail.locator('.bpd-related__track button').first();assert.ok(await candidate.count()>0);const aria=await candidate.getAttribute('aria-label');await candidate.click();assert.ok(await p.getByTestId('buyer-product-detail').getByRole('heading',{level:1}).isVisible(),aria);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),true);assert.deepEqual(errors,[]);console.log(`PASS ${process.env.BUYER_ENGINE||'chromium'} ${width}: gallery, zoom, favorite, preference handoff and recommendations`);
 }finally{await context.close()}}

const galleryCases=[
 ['tailoring',['product-blazer.webp','v2-blazer-angle.webp','v2-blazer-detail.webp','v2-blazer-model.webp']],
 ['bag',['product-bag.webp','v2-bag-angle.webp','v2-bag-held.webp','v2-bag-detail.webp']],
 ['sneaker',['product-sneaker.webp','v2-sneaker-angle.webp','v2-sneaker-detail.webp','v2-sneaker-top.webp']],
 ['v2-bag-burgundy',['v2-bag-burgundy.webp','v2-bag-burgundy-angle.webp','v2-bag-burgundy-model.webp','v2-bag-burgundy-detail.webp']]
];
async function galleryAudit(browser,width){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(`${base}#/demos/china-buyer/app`);await page.getByTestId('china-buyer').waitFor();
  for(const [id,files] of galleryCases){
   await page.locator('.cb-nav').getByRole('button',{name:'Каталог'}).click();
   await page.getByTestId(`buyer-item-${id}`).getByRole('button',{name:/Открыть/}).click();
   const detail=page.getByTestId('buyer-product-detail');await detail.waitFor();assert.equal(await detail.locator('.bpd-thumbs button').count(),3,`${id}: three alternative frames`);
   assert.match(await detail.locator('.bpd-gallery-note').innerText(),/Сгенерированные иллюстрации/);
   for(let i=0;i<4;i++){
    if(i>0)await detail.getByRole('button',{name:`Показать фото ${i+1} из 4`}).click();
    const img=detail.locator('.bpd-image-button img');assert.ok((await img.getAttribute('src')).endsWith(files[i]),`${id} frame ${i+1}`);
    await img.evaluate(image=>image.decode());assert.ok(await img.evaluate(image=>image.naturalWidth>0));assert.equal(await detail.locator('.bpd-thumbs button').count(),3);
   }
   await detail.getByRole('button',{name:/Увеличить изображение/}).click();assert.equal(await detail.getByRole('button',{name:/Уменьшить изображение/}).getAttribute('aria-pressed'),'true');
   await detail.getByRole('button',{name:'Показать фото 1 из 4'}).click();assert.ok((await detail.locator('.bpd-image-button img').getAttribute('src')).endsWith(files[0]));
  }
  await page.locator('.cb-nav').getByRole('button',{name:'Каталог'}).click();await page.getByTestId('buyer-item-accessory').getByRole('button',{name:/Открыть/}).click();
  const fallback=page.getByTestId('buyer-product-detail');assert.match(await fallback.locator('.bpd-gallery-note').innerText(),/одного изображения/);
  const src=await fallback.locator('.bpd-image-button img').getAttribute('src');await fallback.getByRole('button',{name:'Фрагмент изображения: показать'}).click();assert.equal(await fallback.locator('.bpd-image-button img').getAttribute('src'),src);assert.match(await fallback.locator('.bpd-image-button img').getAttribute('class'),/is-crop-1/);
  await fallback.getByRole('button',{name:'Крупнее: показать'}).click();assert.equal(await fallback.locator('.bpd-image-button img').getAttribute('src'),src);assert.match(await fallback.locator('.bpd-image-button img').getAttribute('class'),/is-crop-2/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),true);assert.deepEqual(errors,[]);
  console.log(`PASS ${process.env.BUYER_ENGINE||'chromium'} ${width}: 4 complete galleries (16 images) and honest crop fallback`);
 }finally{await context.close()}
}
(async()=>{const b=await engine.launch({headless:true});try{for(const w of [320,390,430]){await run(b,w);await galleryAudit(b,w)}}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
