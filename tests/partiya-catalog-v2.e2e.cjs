const {chromium,webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.OPT_TEST_URL||'http://127.0.0.1:53744/').replace(/\/$/,'');
const engine=process.env.OPT_ENGINE==='webkit'?webkit:chromium;

async function run(browser,width,height){
 const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(`${base}/#/demos/opt-market/app`,{waitUntil:'domcontentloaded'});
  await page.getByTestId('opt-market').waitFor();
  await page.locator('.opt-nav').getByRole('button',{name:'Каталог'}).click();
  const cards=page.locator('.parti-catalog-card');
  assert.equal(await cards.count(),18,'all catalog products');
  await page.getByRole('button',{name:'Фильтры'}).click();
  await page.getByLabel('БРЕНД').selectOption({label:'Barilla'});
  assert.equal(await cards.count(),3,'brand filter groups Barilla products');
  await page.getByLabel('ФОРМАТ').selectOption({label:'Банки'});
  assert.equal(await cards.count(),1,'format composes with brand filter');
  assert.match(await cards.first().innerText(),/Basilico/);
  await page.getByLabel('ФОРМАТ').selectOption('');
  await page.getByLabel('БРЕНД').selectOption('');
  await page.getByLabel('Сортировка').selectOption('unit-low');
  const prices=await cards.locator('.parti-catalog-unit').allTextContents();
  const units=prices.map(x=>Number(x.match(/·\s*([\d\s,.]+)\s*₽/)?.[1].replace(/\s/g,'').replace(',','.')));
  assert(units.every(Number.isFinite)&&units.every((n,i)=>i===0||n>=units[i-1]),'unit prices sorted ascending');
  const search=page.getByRole('searchbox',{name:'Поиск товара'});
  await search.fill('лавацца');
  assert.equal(await cards.count(),1,'Russian alias matches');
  await page.getByRole('button',{name:'В избранное: Lavazza Qualità Oro'}).click();
  assert.equal(await page.getByRole('button',{name:'Убрать из избранного: Lavazza Qualità Oro'}).getAttribute('aria-pressed'),'true');
  await search.fill('');
  await page.getByRole('button',{name:'Только избранное'}).click();
  assert.equal(await cards.count(),1,'favorites filter');
  await page.getByRole('button',{name:'Список'}).click();
  assert.equal(await page.getByRole('button',{name:'Список'}).getAttribute('aria-pressed'),'true');
  const image=await cards.first().locator('.opt-product-picture').boundingBox(), body=await cards.first().locator('.parti-catalog-card-body').boundingBox();
  assert(image&&body&&image.x+image.width<=body.x,'compact list places picture next to details');
  await page.getByRole('button',{name:'Открыть товар: Lavazza Qualità Oro'}).click();
  await page.getByRole('heading',{name:'Lavazza Qualità Oro'}).waitFor();
  await page.goBack();
  await page.getByRole('button',{name:'Список'}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Список'}).getAttribute('aria-pressed'),'true','list view survives returning from a product');
  assert.equal(await cards.count(),1,'favorite filter survives returning from a product');
  await page.getByRole('button',{name:'Добавить коробку: Lavazza Qualità Oro'}).click();
  await page.getByRole('button',{name:'Увеличить количество: Lavazza Qualità Oro'}).click();
  assert.equal(await cards.first().locator('.opt-quantity span').innerText(),'2','quick quantity adds two cases');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByTestId('opt-market').waitFor();
  await page.locator('.opt-nav').getByRole('button',{name:'Каталог'}).click();
  await page.getByRole('button',{name:'Только избранное'}).click();
  assert.equal(await cards.count(),1,'favorite persists on this device');
  assert.equal(await cards.first().locator('.opt-quantity span').innerText(),'2','cart persists on this device');
  assert.deepEqual(errors,[]);
  console.log(`${engine.name()} ${width}x${height}: filters, sorting, quick quantities and favorites passed`);
 }finally{await context.close();}
}
(async()=>{const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]])await run(browser,w,h);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
