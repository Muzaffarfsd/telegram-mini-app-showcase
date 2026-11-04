// Option totals, collision windows, local privacy, and calendar export.
const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const engine=process.env.LUMI_ENGINE==='webkit'?webkit:chromium;
const base=(process.env.LUMI_TEST_URL||'http://127.0.0.1:53744/').replace(/\/$/,'');
const key='web4tg-lumi-demo-v1';
async function run(browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block',acceptDownloads:true});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const nav=name=>page.locator('.lumi-nav').getByRole('button',{name});
 try{
  await page.goto(`${base}/#/demos/lumi-studio/app`);await page.getByTestId('lumi-studio').waitFor();
  await nav('Услуги').click();await page.getByRole('button',{name:'Открыть услугу: Стрижка и укладка'}).click();
  await page.getByLabel('Длинные').check();await page.getByLabel('Уход для волос').check();
  await page.locator('.lumi-ed-detail').getByRole('button',{name:'Записаться'}).first().click();
  await page.locator('.lumi-choice').filter({hasText:'Алина'}).click();
  assert(await page.getByLabel('Длинные').isChecked());assert(await page.getByLabel('Уход для волос').isChecked());
  await page.locator('.lumi-date-row button').nth(1).click();await page.getByRole('button',{name:'10:00',exact:true}).click();await page.getByRole('button',{name:'Продолжить'}).click();
  await page.getByText('180 мин',{exact:true}).waitFor();
  await page.getByLabel('Ваше имя').fill('Личная информация');await page.getByLabel('Телефон').fill('+79991112233');
  await page.getByRole('button',{name:'Подтвердить запись'}).click();await page.getByRole('heading',{name:'Запись создана.'}).waitFor();
  const raw=await page.evaluate(k=>localStorage.getItem(k),key);assert(!raw.includes('Личная информация')&&!raw.includes('9991112233'));
  const rows=JSON.parse(raw);assert.equal(rows[0].durationMinutes,180);assert.deepEqual(rows[0].options,{'hair-length':'long','hair-care':'care'});
  await page.getByRole('button',{name:'Мои записи'}).click();await page.getByText('Длина волос: Длинные · Дополнительный уход: Уход для волос').waitFor();
  await page.getByText('Перед визитом').click();await page.getByText('После визита').click();await page.getByText('Пример напоминания в Telegram').click();
  await page.getByText(/сообщения не отправляются/).waitFor();
  const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Добавить в календарь'}).click();const download=await downloadPromise;const ics=await fs.readFile(await download.path(),'utf8');
  assert(ics.includes('BEGIN:VALARM')&&ics.includes('TRIGGER:-PT24H'));assert(!ics.includes('Личная информация')&&!ics.includes('Стрижка')&&!ics.includes('9991112233'));
  await nav('Главная').click();await page.locator('.lumi-hero').getByRole('button',{name:'Записаться'}).click();
  await page.locator('.lumi-choice').filter({hasText:'Окрашивание в один тон'}).click();await page.locator('.lumi-choice').filter({hasText:'Алина'}).click();await page.locator('.lumi-date-row button').nth(1).click();
  assert(await page.getByRole('button',{name:'12:30',exact:true}).isDisabled());assert(await page.getByRole('button',{name:'13:00',exact:true}).isEnabled());
  await nav('Записи').click();await page.getByRole('button',{name:'Перенести'}).click();await page.getByText(/сохраняются выбранные детали/).waitFor();
  await page.getByRole('button',{name:'13:00',exact:true}).click();await page.getByRole('button',{name:'Продолжить'}).click();await page.getByLabel('Ваше имя').fill('Демо');await page.getByLabel('Телефон').fill('+79991112233');
  await page.getByRole('button',{name:'Подтвердить перенос'}).click();await page.getByRole('heading',{name:'Запись создана.'}).waitFor();
  const moved=JSON.parse(await page.evaluate(k=>localStorage.getItem(k),key));assert.equal(moved.length,1);assert.equal(moved[0].durationMinutes,180);assert.equal(moved[0].price,rows[0].price);assert.deepEqual(moved[0].options,rows[0].options);assert.deepEqual(errors,[]);
  console.log(`${engine.name()} ${width}: options, overlap, privacy, calendar and reschedule passed`);
 }finally{await context.close()}
}
(async()=>{const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]])await run(browser,w,h)}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
