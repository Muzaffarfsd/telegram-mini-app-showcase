const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.OPT_TEST_URL || 'http://127.0.0.1:53742/').replace(/\/$/, '');
const engine = process.env.OPT_ENGINE === 'webkit' ? webkit : chromium;
async function run(browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 const p=await context.newPage(); const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try {
  await p.addInitScript(()=>{if(!sessionStorage.getItem('partiya-workflow-seeded')){sessionStorage.setItem('partiya-workflow-seeded','1');localStorage.setItem('web4tg-opt-market-demo-v1',JSON.stringify({cart:[{id:'real-tea',qty:1}],orders:[{id:'ДЕМО-OLD',date:'1 ноября 2026',total:8200,lines:[{id:'coffee',qty:1,unitPrice:7200,name:'Кофе из старого каталога'},{id:'real-tea',qty:1,unitPrice:1000,name:'Прежний чай'}]}]}));}});
  await p.goto(`${base}/#/demos/opt-market/app`,{waitUntil:'domcontentloaded'}); await p.getByTestId('opt-market').waitFor();
  await p.locator('.opt-nav').getByRole('button',{name:/^Каталог/}).click();
  await p.getByRole('button',{name:'Открыть товар: Lavazza Qualità Oro'}).click();
  await p.getByRole('button',{name:'В избранное: Lavazza Qualità Oro'}).click();
  await p.locator('.opt-nav').getByRole('button',{name:/^Заказ/}).click();
  const bar=p.getByRole('progressbar',{name:'Минимальная сумма заказа'});assert.equal(await bar.getAttribute('aria-valuenow'),'2520');
  await p.getByLabel('Название списка').fill('Закупка для кофейни');
  await p.getByRole('button',{name:'Сохранить',exact:true}).click();
  await p.getByText('Список сохранён на этом устройстве.').waitFor();
  await p.locator('.opt-nav').getByRole('button',{name:/^Профиль/}).click();
  await p.getByRole('button',{name:/Мои списки и избранное/i}).click();
  await p.getByRole('heading',{name:'Закупка для кофейни'}).waitFor();
  assert.equal(await p.getByRole('button',{name:'Убрать из избранного: Lavazza Qualità Oro'}).count(),1);
  await p.reload({waitUntil:'domcontentloaded'});await p.getByTestId('opt-market').waitFor();
  await p.locator('.opt-nav').getByRole('button',{name:/^Профиль/}).click();await p.getByRole('button',{name:/Мои списки и избранное/i}).click();
  const list=p.locator('.partiya-lists article').filter({hasText:'Закупка для кофейни'});
  await list.locator('summary').click();await list.getByRole('button',{name:'Увеличить количество Ahmad Tea English Breakfast'}).click();
  assert.match(await list.innerText(),/2 кор\./);
  await list.getByRole('button',{name:'Добавить в заказ'}).click();
  const storage=JSON.parse(await p.evaluate(()=>localStorage.getItem('web4tg-opt-market-demo-v1')));assert.equal(storage.cart.find(x=>x.id==='real-tea').qty,3,'list adds edited quantity to existing cart');
  await p.locator('.opt-nav').getByRole('button',{name:/^История/}).click();
  await p.getByRole('button',{name:'Проверить и повторить заказ'}).click();
  await p.getByText(/поз. недоступно и не будет добавлено/).waitFor();
  await p.getByText(/Цена изменилась/).waitFor();
  await p.getByRole('button',{name:'Добавить доступные товары'}).click();
  const after=JSON.parse(await p.evaluate(()=>localStorage.getItem('web4tg-opt-market-demo-v1')));assert.equal(after.cart.find(x=>x.id==='real-tea').qty,4);assert(!after.cart.some(x=>x.id==='coffee'),'unavailable position not added');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');assert.deepEqual(errors,[]);
  console.log(`${engine.name()} ${width}x${height}: favorites, saved lists, quantities, minimum, safe repeat and persistence passed`);
 } finally {await context.close();}
}
(async()=>{const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]])await run(browser,w,h);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
