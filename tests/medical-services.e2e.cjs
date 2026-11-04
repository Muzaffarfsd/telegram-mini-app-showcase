const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.MEDICAL_TEST_URL||'http://127.0.0.1:53744/').replace(/\/$/,'');
const engine=process.env.MEDICAL_ENGINE==='webkit'?webkit:chromium;
async function run(browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(`${base}/#/demos/medical-center/app`,{waitUntil:'domcontentloaded'});
  await page.getByTestId('medical-center').waitFor();
  await page.getByRole('navigation',{name:'Разделы медицинского центра'}).getByRole('button',{name:'Услуги'}).click();
  await page.locator('.medsvc-catalog').waitFor();
  assert.equal(await page.locator('.medsvc-list-item').count(),7,'seven bookable services');
  const search=page.getByLabel('Поиск услуги');await search.fill('кардиолог');assert.equal(await page.locator('.medsvc-list-item').count(),1,'search filters relevant service');await search.fill('');
  await page.getByRole('button',{name:'Открыть услугу: Консультация кардиолога'}).click();
  const detail=page.locator('.medsvc-detail');await detail.waitFor();
  assert.match(await detail.locator('h1').textContent(),/КАРДИОЛОГА/);
  const gallery=detail.locator('.medsvc-gallery'),thumbs=gallery.locator('.medsvc-gallery-rail button'),main=gallery.locator('.medsvc-gallery-main');
  assert.equal(await thumbs.count(),3,'three photo details');
  const rail=await gallery.locator('.medsvc-gallery-rail').boundingBox(), large=await main.boundingBox();
  assert(rail&&large&&rail.x+rail.width<=large.x&&rail.width<large.width,'three thumbnails beside main image');
  const boxes=await Promise.all([0,1,2].map(i=>thumbs.nth(i).boundingBox()));assert(boxes.every(Boolean),'thumbnails have visible dimensions');assert(Math.abs(boxes[1].y-(boxes[0].y+boxes[0].height))<=7&&Math.abs(boxes[2].y-(boxes[1].y+boxes[1].height))<=7,'thumbnails form a continuous column');assert(Math.abs(boxes[2].y+boxes[2].height-(large.y+large.height))<=2,'thumbnail column and main image align');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  const cover=await main.locator('img').getAttribute('src');const seen=new Set([cover]);
  for(let i=0;i<3;i++){await thumbs.nth(i).click();assert.equal(await thumbs.nth(i).getAttribute('aria-pressed'),'true');const image=await main.locator('img').getAttribute('src');assert(!seen.has(image),'distinct service image');seen.add(image)}
  await detail.getByRole('button',{name:'Основной кадр'}).click();assert.equal(await main.locator('img').getAttribute('src'),cover);
  await main.click();const lightbox=page.getByRole('dialog',{name:'Фотографии: Консультация кардиолога'});await lightbox.waitFor();assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Закрыть фотографии');
  await page.keyboard.press('ArrowRight');assert.notEqual(await lightbox.locator('img').getAttribute('src'),cover);await page.keyboard.press('Escape');await lightbox.waitFor({state:'hidden'});assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('medsvc-gallery-main')),true);
  const faq=detail.locator('details').first();await faq.locator('summary').click();assert.equal(await faq.getAttribute('open'),'');
  const cta=detail.locator('.medsvc-book-row button');await cta.scrollIntoViewIfNeeded();const cb=await cta.boundingBox(), nb=await page.getByRole('navigation',{name:'Разделы медицинского центра'}).boundingBox();assert(cb&&nb&&cb.y>=0&&cb.y+cb.height<=nb.y,'booking CTA remains visible above navigation');await cta.click();await page.getByRole('dialog',{name:'Запись к специалисту'}).waitFor();assert.match(await page.locator('.medical-booking__selected').textContent(),/кардиолог/i);await page.keyboard.press('Escape');await page.getByRole('dialog',{name:'Запись к специалисту'}).waitFor({state:'hidden'});
  await detail.getByRole('button',{name:'Открыть услугу: Консультация невролога'}).click();assert.match(await detail.locator('h1').textContent(),/НЕВРОЛОГА/);await detail.getByRole('button',{name:'Назад'}).click();await page.locator('.medsvc-catalog').waitFor();
  await page.getByRole('button',{name:'Открыть услугу: Консультация терапевта'}).click();await detail.getByRole('button',{name:/Открыть профиль специалиста/}).click();assert.match(await page.locator('.meddoc h1').textContent(),/Анна Морозова/);
  assert.deepEqual(errors,[],'no uncaught JS errors');
  console.log(`${engine.name()} ${width}x${height}: catalogue, search, details, gallery, FAQ and booking passed`);
 }finally{await context.close()}
}
(async()=>{const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]].filter(([width])=>!process.env.MEDICAL_WIDTH||width===Number(process.env.MEDICAL_WIDTH)))await run(browser,w,h)}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
