const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const axePath=require.resolve('axe-core/axe.min.js');
const base=(process.env.LUMI_TEST_URL||'http://127.0.0.1:53744/').replace(/\/$/,'');
const engine=process.env.LUMI_ENGINE==='webkit'?webkit:chromium;

async function audit(page,selector){
 if(!await page.evaluate(()=>!!window.axe))await page.addScriptTag({path:axePath});
 const result=await page.evaluate(selector=>window.axe.run({include:[[selector]]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}),selector);
 const errors=result.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));
 assert.deepEqual(errors,[],`accessibility ${selector}`);
}
async function run(browser,width){
 const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(`${base}/#/demos/lumi-studio/app`,{waitUntil:'domcontentloaded'});
  await page.getByTestId('lumi-studio').waitFor();
  await page.locator('.lumi-nav').getByRole('button',{name:'Профиль'}).click();
  await page.getByRole('button',{name:'Мастера',exact:true}).click();
  await page.locator('.lumi-artist-list').waitFor();
  assert.equal(await page.locator('.lumi-artist-card').count(),3);
  await page.getByText('НАСТРОИТЬ ВЫБОР').click();
  await page.getByLabel('Направление').selectOption({label:'Ногти'});
  await page.getByLabel('Базовая стоимость').selectOption('2500');
  assert.equal(await page.locator('.lumi-artist-card').count(),1);
  assert(await page.getByRole('button',{name:'Открыть профиль: Диана'}).isVisible());
  await page.getByLabel('Время визита').selectOption('morning');
  assert.match(await page.locator('.lumi-artist-card-body b').innerText(),/ДЕМО-ВРЕМЯ/);
  await page.getByRole('button',{name:'Сбросить фильтры'}).click();
  // Legacy visits did not save a duration. A two-hour colour appointment
  // must still hide all overlapping morning haircut slots when price-filtered.
  if(width===390){
   await page.evaluate(()=>{const rows=[];for(let i=0;i<14;i++){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+i);const date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');rows.push({id:`busy-${i}`,serviceId:'color',masterId:'alina',date,time:'10:00',status:'requested'})}localStorage.setItem('web4tg-lumi-demo-v1',JSON.stringify(rows))});
   await page.getByLabel('Направление').selectOption({label:'Волосы'});await page.getByLabel('Базовая стоимость').selectOption('4000');await page.getByLabel('Время визита').selectOption('morning');
   assert.equal(await page.locator('.lumi-artist-card').count(),0,'legacy two-hour visits block overlapping filtered morning slots');
   await page.evaluate(()=>localStorage.removeItem('web4tg-lumi-demo-v1'));await page.locator('.lumi-artist-filters').getByRole('button',{name:'Сбросить фильтры'}).click();
  }
  await page.getByPlaceholder('Мастер или направление').fill('Алина');
  assert.equal(await page.locator('.lumi-artist-card').count(),1);
  if(width===320)await audit(page,'.lumi-artist-list');
  await page.getByRole('button',{name:'Открыть профиль: Алина'}).click();
  const profile=page.locator('.lumi-artist-profile');await profile.waitFor();
  await profile.getByRole('button',{name:'Добавить в избранное: Алина'}).click();
  await profile.getByRole('button',{name:'В избранное: ФОРМА И ДВИЖЕНИЕ'}).click();
  assert.equal(await profile.getByRole('button',{name:'Убрать из избранного: ФОРМА И ДВИЖЕНИЕ'}).getAttribute('aria-pressed'),'true');
  await profile.getByRole('button',{name:'Показать иллюстрацию: ФОРМА И ДВИЖЕНИЕ'}).click();
  assert.equal(await profile.getByRole('button',{name:'Показать иллюстрацию: ФОРМА И ДВИЖЕНИЕ'}).getAttribute('aria-pressed'),'true');
  const opener=profile.getByRole('button',{name:'Открыть фотографию: Алина'});await opener.click();
  const dialog=page.getByRole('dialog',{name:'Портфолио: Алина'});await dialog.waitFor();
  assert.match(await dialog.innerText(),/2 \/ 4/);await page.keyboard.press('ArrowRight');assert.match(await dialog.innerText(),/3 \/ 4/);
  await page.keyboard.press('Escape');assert.equal(await dialog.count(),0);assert(await opener.evaluate(el=>document.activeElement===el));
  if(width===320)await audit(page,'.lumi-artist-profile');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  await profile.getByRole('button',{name:'МОЁ ИЗБРАННОЕ'}).click();
  await page.getByRole('heading',{name:'Сохранено для вас.'}).waitFor();
  assert(await page.getByRole('button',{name:'Открыть услугу для работы: ФОРМА И ДВИЖЕНИЕ'}).isVisible());
  await page.reload();await page.locator('.lumi-nav').getByRole('button',{name:'Профиль'}).click();await page.getByRole('button',{name:'Избранное',exact:true}).click();
  assert(await page.getByRole('button',{name:'Открыть услугу для работы: ФОРМА И ДВИЖЕНИЕ'}).isVisible(),'favorites persisted across reload');
  await page.getByRole('button',{name:'Убрать работу ФОРМА И ДВИЖЕНИЕ из избранного'}).click();
  await page.getByRole('button',{name:'Убрать мастера Алина из избранного'}).click();
  await page.getByRole('heading',{name:'Пока ничего не сохранено'}).waitFor();
  assert.deepEqual(errors,[],'no uncaught page errors');
  console.log(`LUMI masters ${width}px passed`);
 }finally{await context.close()}
}
(async()=>{const browser=await engine.launch({headless:true});try{for(const width of [320,390,430])await run(browser,width)}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
