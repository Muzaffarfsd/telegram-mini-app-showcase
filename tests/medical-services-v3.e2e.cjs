const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.MEDICAL_TEST_URL||'http://127.0.0.1:53744/').replace(/\/$/,'');
const engine=process.env.MEDICAL_ENGINE==='webkit'?webkit:chromium;
const variants=[
  {heading:'УЗИ щитовидной железы',id:'ultrasound-thyroid',doctorId:'ultrasound',doctor:'Ольга Власова',price:2800,duration:30},
  {heading:'Электрокардиограмма',id:'ecg',doctorId:'cardio',doctor:'Дмитрий Орлов',price:1800,duration:20},
  {heading:'Чек-ап «Базовый»',id:'checkup-basic',doctorId:'anna',doctor:'Анна Морозова',price:8900,duration:60},
];
async function run(browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const item of variants){
   await page.goto(`${base}/#/demos/medical-center/app`,{waitUntil:'domcontentloaded'});
   await page.getByTestId('medical-center').waitFor();await page.evaluate(()=>localStorage.removeItem('medical-demo-appointments-v1'));
   await page.getByRole('button',{name:'Услуги',exact:true}).click();
   assert.equal(await page.locator('.medsvc-list-item').count(),7,'seven distinct services');
   await page.getByRole('button',{name:'Диагностика',exact:true}).click();assert.equal(await page.locator('.medsvc-list-item').count(),2,'two diagnostic services');
   await page.getByRole('button',{name:'Программы',exact:true}).click();assert.equal(await page.locator('.medsvc-list-item').count(),1,'one preventive programme');
   await page.getByRole('button',{name:'Консультации',exact:true}).click();assert.equal(await page.locator('.medsvc-list-item').count(),4,'four consultations');
   await page.getByRole('button',{name:'Все',exact:true}).click();
   await page.getByRole('button',{name:`Открыть услугу: ${item.heading}`}).click();
   assert.match(await page.locator('.medsvc-detail h1').innerText(),new RegExp(item.heading.replace(/[«»]/g,'[«»]?'),'i'));
   assert.equal(await page.locator('.medsvc-gallery-rail button').count(),3,'three gallery details');
   const photoKind=item.id==='ultrasound-thyroid'?'ultrasound':item.id==='checkup-basic'?'checkup':'ecg';
   for(const part of ['main','1','2']){const image=await page.request.get(`${base}/medical/generated/med-v3-${photoKind}-${part}.webp`);assert.equal(image.status(),200);assert.match(image.headers()['content-type']||'',/^image\/webp/,'new service photo is served as WebP');}
   assert.match(await page.locator('.medsvc-book-row').innerText(),new RegExp(new Intl.NumberFormat('ru-RU').format(item.price).replace(/\s/g,'\\s*')));
   assert.match(await page.locator('.medsvc-page-kicker').innerText(),new RegExp(`${item.duration} МИН`));
   assert.match(await page.locator('.medsvc-doctor').innerText(),new RegExp(item.doctor));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no page overflow');
   await page.getByRole('button',{name:'Записаться',exact:true}).click();
   const dialog=page.getByRole('dialog',{name:'Запись к специалисту'});
   await dialog.waitFor();assert.match(await dialog.locator('.medical-booking__selected').textContent(),new RegExp(item.doctor));
   assert.match(await dialog.locator('.medical-booking__selected').textContent(),new RegExp(`${item.duration} мин`));
   assert.match(await dialog.locator('.medical-booking__selected').textContent(),new RegExp(item.heading.replace(/[«»]/g,'[«»]?'),'i'));
   await dialog.locator('.medical-booking__dates button').nth(1).click();
   await dialog.locator('.medical-booking__times button:not(:disabled)').first().click();
   await dialog.getByRole('button',{name:'Продолжить',exact:true}).click();
   await dialog.getByLabel('Ваше имя').fill('Тестовый пациент');await dialog.getByLabel('Телефон').fill('+7 900 555 44 33');
   await dialog.getByRole('button',{name:'Сохранить демо-запись'}).tap();
   await dialog.getByText(/Настоящий приём не забронирован/).waitFor();
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('medical-demo-appointments-v1')||'[]'));
   assert.equal(saved.length,1);assert.equal(saved[0].serviceId,item.id);assert.equal(saved[0].doctorId,item.doctorId);assert.equal(saved[0].price,item.price);assert.equal(saved[0].duration,item.duration);
   assert.deepEqual(Object.keys(saved[0]).sort(),['date','doctorId','duration','id','price','serviceId','time']);
  }
  assert.deepEqual(errors,[],'no JavaScript errors');console.log(`${engine.name()} ${width}x${height}: diagnostics and check-up service, specialist, price, duration and privacy passed`);
 }finally{await context.close()}
}
(async()=>{const browser=await engine.launch();try{for(const [width,height] of [[320,568],[390,844],[430,932]].filter(([w])=>!process.env.MEDICAL_WIDTH||w===Number(process.env.MEDICAL_WIDTH)))await run(browser,width,height)}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
