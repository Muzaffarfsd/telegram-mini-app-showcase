// LUMI: independent mobile appointment, conflict, privacy, and accessibility checks.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const axePath = require.resolve('axe-core/axe.min.js');
const base = (process.env.LUMI_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/$/, '');
const engine = process.env.LUMI_ENGINE === 'webkit' ? webkit : chromium;
const key = 'web4tg-lumi-demo-v1';
const canaryName = 'Тестовая Клиентка';
const canaryPhone = '+7 999 123-45-67';

async function audit(page, screen) {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: axePath });
  const result = await page.evaluate(() => window.axe.run({include:[['.lumi']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
  const problems = result.violations.filter(v => ['serious','critical'].includes(v.impact)).map(v => ({screen,id:v.id,targets:v.nodes.map(n=>n.target)}));
  assert.deepEqual(problems, [], `accessibility: ${screen}`);
}

async function assertBookingVisible(page, button, screen) {
  const b=await button.boundingBox(), n=await page.locator('.lumi-nav').boundingBox();
  assert(b&&n&&b.y>=0&&b.y+b.height<=page.viewportSize().height, `${screen}: booking action in viewport`);
  assert(!(b.x<n.x+n.width&&b.x+b.width>n.x&&b.y<n.y+n.height&&b.y+b.height>n.y), `${screen}: navigation does not cover booking action`);
}

async function startFromHome(page, serviceName, masterName) {
  await page.locator('.lumi-nav').getByRole('button',{name:'Главная'}).click();
  await page.locator('.lumi-hero').getByRole('button',{name:'Записаться'}).click();
  await page.getByRole('heading',{name:'Выберите услугу.'}).waitFor();
  await page.locator('.lumi-choice').filter({hasText:serviceName}).click();
  await page.getByRole('heading',{name:'Выберите мастера.'}).waitFor();
  await page.locator('.lumi-choice').filter({hasText:masterName}).click();
  await page.getByRole('heading',{name:'Найдём время.'}).waitFor();
}

async function goToForm(page, time) {
  await page.getByRole('button',{name:time,exact:true}).click();
  await page.getByRole('button',{name:'Продолжить'}).click();
  await page.getByRole('heading',{name:'Проверьте запись.'}).waitFor();
}

async function fillContact(page) {
  await page.getByLabel('Ваше имя').fill(canaryName);
  await page.getByLabel('Телефон').fill(canaryPhone);
}

async function run(browser,width,height) {
  const context = await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
  const page = await context.newPage();
  const errors=[], leaked=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{const data=r.postData()||'';if(data.includes(canaryName)||data.includes(canaryPhone)||data.includes('9991234567'))leaked.push({method:r.method(),url:r.url()});});
  try {
    await page.goto(`${base}/#/demos/lumi-studio/app`,{waitUntil:'domcontentloaded'});
    await page.getByTestId('lumi-studio').waitFor();
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
    await page.getByText('Это демонстрация: расписание и цены примерные, записи не отправляются и не оплачиваются.').waitFor();
    const navBox=await page.locator('.lumi-nav').boundingBox();
    assert(navBox&&navBox.x>=0&&navBox.x+navBox.width<=width&&navBox.y+navBox.height<=height,'bottom navigation stays inside viewport');
    await page.getByRole('button',{name:'Посмотреть услуги: Волосы',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Волосы',exact:true}).getAttribute('aria-pressed'),'true','home category activates the matching filter');
    assert.equal(await page.locator('.lumi-service-card').count(),2,'home category displays all matching services');
    await page.locator('.lumi-nav').getByRole('button',{name:'Главная'}).click();
    await page.getByRole('button',{name:'Все услуги',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'Все',exact:true}).getAttribute('aria-pressed'),'true','all services clears the previous category');
    assert.equal(await page.locator('.lumi-service-card').count(),7);
    await page.locator('.lumi-nav').getByRole('button',{name:'Главная'}).click();
    if(width===320)await assertBookingVisible(page,page.locator('.lumi-hero').getByRole('button',{name:'Записаться'}),'home');
    // Telegram can expose a shorter viewport than the browser window. The
    // floating navigation must also clear its bottom safe-area inset.
    if(width===320){
      await page.evaluate(h=>{document.documentElement.style.setProperty('--tg-viewport-height',`${h-88}px`);document.body.style.setProperty('--sab','35px');},height);
      const compactNav=await page.locator('.lumi-nav').boundingBox();
      assert(compactNav&&compactNav.y+compactNav.height<=height-88-35+0.1,'navigation clears Telegram viewport and bottom safe area');
      await page.evaluate(()=>{document.documentElement.style.removeProperty('--tg-viewport-height');document.body.style.removeProperty('--sab');});
    }
    if(process.env.LUMI_CHECK_IMAGES==='1'){
      const pics=page.locator('.lumi-main img');
      await pics.evaluateAll(images=>images.forEach(img=>{img.loading='eager';}));
      await page.waitForFunction(()=>[...document.querySelectorAll('.lumi-main img')].length>=8&&[...document.querySelectorAll('.lumi-main img')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:30000});
    }
    if(width===320)await audit(page,'home');
    await page.locator('.lumi-nav').getByRole('button',{name:'Услуги'}).click();
    assert.equal(await page.locator('.lumi-service-card').count(),7);
    await page.getByRole('button',{name:'Волосы',exact:true}).click();
    assert.equal(await page.locator('.lumi-service-card').count(),2,'service category filter');
    await page.getByRole('button',{name:'Открыть услугу: Стрижка и укладка'}).click();
    await page.getByRole('heading',{name:'Стрижка и укладка'}).waitFor();
    await page.getByRole('heading',{name:'Что входит'}).waitFor();
    if(width===320)await assertBookingVisible(page,page.locator('.lumi-ed-detail').getByRole('button',{name:'Записаться'}).first(),'service');
    if(width===320)await audit(page,'service');

    await startFromHome(page,'Стрижка и укладка','Алина');
    const day=page.locator('.lumi-date-row button').nth(1);
    await day.click();
    await page.getByRole('button',{name:'10:00',exact:true}).waitFor();
    assert(await page.getByRole('button',{name:'18:30',exact:true}).isEnabled(),'90-minute service fits until 20:00');
    assert(await page.getByRole('button',{name:'19:00',exact:true}).isDisabled(),'service must finish by closing time');
    assert(await page.getByRole('button',{name:'Продолжить'}).isDisabled(),'slot required');
    await goToForm(page,'10:00');
    await page.getByRole('button',{name:'Подтвердить запись'}).click();
    assert.equal(await page.locator('.lumi-field input[aria-invalid=true]').count(),2,'name and phone validation');
    if(width===320)await audit(page,'validation');
    await fillContact(page);
    await page.getByRole('button',{name:'Подтвердить запись'}).click();
    await page.getByRole('heading',{name:'Запись создана.'}).waitFor();
    await page.getByText(/В студию ничего не отправлено, время не забронировано/).waitFor();
    let saved=await page.evaluate(k=>localStorage.getItem(k),key);
    assert(!saved.includes(canaryName)&&!saved.includes(canaryPhone)&&!saved.includes('9991234567'),'contact details must not be persisted');
    let rows=JSON.parse(saved);assert.equal(rows.length,1);assert.equal(rows[0].time,'10:00');assert.equal(rows[0].serviceId,'cut');
    const firstId=rows[0].id;const firstDate=rows[0].date;
    await page.getByRole('button',{name:'Мои записи'}).click();
    await page.getByRole('heading',{name:'Ваши записи.'}).waitFor();
    if(width===320)await audit(page,'visits');

    // The second service by the same specialist must not overlap ANY of the
    // first service's 90 minutes, and adjacent appointments are allowed.
    await startFromHome(page,'Окрашивание в один тон','Алина');
    await page.locator('.lumi-date-row button').nth(1).click();
    for(const t of ['10:00','10:30','11:00'])assert(await page.getByRole('button',{name:t,exact:true}).isDisabled(),`${t} overlaps existing appointment`);
    assert(await page.getByRole('button',{name:'11:30',exact:true}).isEnabled(),'adjacent time is allowed');
    assert(await page.getByRole('button',{name:'18:30',exact:true}).isDisabled(),'two-hour service cannot run past 20:00');
    await page.locator('.lumi-nav').getByRole('button',{name:'Записи'}).click();
    await page.getByRole('button',{name:'Перенести'}).click();
    await page.getByRole('heading',{name:'Найдём время.'}).waitFor();
    assert(await page.getByRole('button',{name:'10:00',exact:true}).isEnabled(),'rescheduling excludes its own record');
    assert(await page.getByRole('button',{name:'10:30',exact:true}).isEnabled(),'overlap with itself is allowed during rescheduling');
    await goToForm(page,'10:30');await fillContact(page);
    await page.getByRole('button',{name:'Подтвердить перенос'}).click();
    await page.getByRole('heading',{name:'Запись создана.'}).waitFor();
    rows=JSON.parse(await page.evaluate(k=>localStorage.getItem(k),key));
    assert.equal(rows.length,1,'rescheduling must update the record rather than duplicate it');
    assert.equal(rows[0].id,firstId);assert.equal(rows[0].time,'10:30');
    await page.getByRole('button',{name:'Мои записи'}).click();
    await page.locator('.lumi-nav').getByRole('button',{name:'Профиль'}).click();
    await page.getByRole('button',{name:'Расписание студии'}).click();
    await page.getByText('Пример управления записями на этом устройстве.').waitFor();
    await page.getByRole('button',{name:'Подтвердить',exact:true}).click();
    assert.equal(JSON.parse(await page.evaluate(k=>localStorage.getItem(k),key))[0].status,'confirmed','demo studio confirms the booking');
    if(width===320)await audit(page,'studio schedule');
    await page.locator('.lumi-nav').getByRole('button',{name:'Записи'}).click();
    await page.getByText('Подтверждена',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Отменить',exact:true}).click();
    await page.getByText('Отменена',{exact:true}).waitFor();
    assert.equal(JSON.parse(await page.evaluate(k=>localStorage.getItem(k),key))[0].status,'cancelled');
    await startFromHome(page,'Стрижка и укладка','Алина');
    await page.locator('.lumi-date-row button').nth(1).click();
    assert(await page.getByRole('button',{name:'10:00',exact:true}).isEnabled(),'cancelling releases the interval');

    // Simulate another tab taking a slot while this form is already open.
    await goToForm(page,'12:30');await fillContact(page);
    const other=await context.newPage();
    await other.goto(`${base}/#/demos/lumi-studio/app`,{waitUntil:'domcontentloaded'});
    await other.evaluate(({k,date})=>{const rows=JSON.parse(localStorage.getItem(k)||'[]');rows.push({id:'test-other-tab',serviceId:'cut',masterId:'alina',date,time:'13:00',status:'requested'});localStorage.setItem(k,JSON.stringify(rows));},{k:key,date:firstDate});
    await page.getByRole('button',{name:'Подтвердить запись'}).click();
    await page.getByText('Это время уже недоступно. Пожалуйста, выберите другое.').waitFor();
    rows=JSON.parse(await page.evaluate(k=>localStorage.getItem(k),key));
    assert.equal(rows.length,2,'stale form must not create an overlapping record');
    assert.deepEqual(leaked,[],'contact details must not be sent in requests');
    assert.deepEqual(errors,[],'no uncaught page errors');
    await other.close();
    console.log(`${engine.name()} ${width}x${height}: booking, overlap, closing time, rescheduling, cancel, stale-slot, demo privacy and accessibility passed`);
  } finally { await context.close(); }
}
(async()=>{const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]])await run(browser,w,h);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
