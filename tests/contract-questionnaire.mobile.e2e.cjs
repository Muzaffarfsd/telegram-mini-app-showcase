const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const base=process.env.CONTRACT_TEST_URL||'http://127.0.0.1:41755/';
const key='web4tg:order-draft:v1';
const normalize=s=>s.replace(/\s+/g,' ').trim();
async function tap(loc){await loc.scrollIntoViewIfNeeded();await loc.tap()}
async function run(engine,width){
 const browser=await engine.launch();const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:'ru-RU',serviceWorkers:'block'});
 await context.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({body:''}));
 await context.route('**/api/**',r=>r.fulfill({json:{data:[]}}));
 await context.addInitScript(()=>{localStorage.setItem('app-language','ru');localStorage.removeItem('web4tg:order-draft:v1')});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(new URL('/#/contract',base).href);await page.getByTestId('contract-questionnaire').waitFor();
  assert.equal(await page.getByTestId('contract-estimate').count(),0);
  await tap(page.getByTestId('contract-direction-flowers'));
  await page.getByTestId('contract-project-name').fill('Мой букет');
  await tap(page.getByTestId('contract-next'));
  assert.match(normalize(await page.getByTestId('contract-estimate').innerText()),/150 000 ₽/);
  await page.locator('.cq-catalog > summary').click();
  await page.locator('.cq-group').filter({hasText:'Основные'}).locator('summary').click();
  await tap(page.getByTestId('contract-extra-search'));
  assert.match(normalize(await page.getByTestId('contract-estimate').innerText()),/170 000 ₽/);
  await tap(page.getByTestId('contract-support-standard'));
  await tap(page.getByTestId('contract-next'));
  await tap(page.getByTestId('contract-next'));
  await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="order-contract-preview"]')?.textContent||'';return s.includes('Мой букет')&&s.includes('14 900')&&s.includes('170 000')});
  const doc=normalize(await page.getByTestId('order-contract-preview').textContent());assert.match(doc,/Мой букет/);assert.match(doc,/50%/);assert.match(doc,/14 900 ₽ за месяц/);assert.match(doc,/Поиск/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await tap(page.getByTestId('contract-back'));
  await tap(page.getByTestId('contract-back'));
  await tap(page.getByTestId('contract-back'));
  await tap(page.getByTestId('contract-category-services'));
  await tap(page.getByTestId('contract-direction-services'));
  await tap(page.getByTestId('contract-next'));
  assert.match(normalize(await page.getByTestId('contract-estimate').innerText()),/190 000 ₽/,'changing package retains compatible paid additions');
  assert.equal(await page.getByTestId('contract-extra-search').getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[]); console.log(`PASS ${engine.name()} ${width}: contract selection, price, support, update`);
 } finally {await context.close();await browser.close()}
}
async function saved(engine){
 const browser=await engine.launch();const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ru-RU',serviceWorkers:'block'});
 await context.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({body:''}));
 await context.route('**/api/**',r=>r.fulfill({json:{data:[]}}));
 await context.addInitScript(()=>{localStorage.setItem('app-language','ru');localStorage.setItem('web4tg:order-draft:v1',JSON.stringify({version:1,savedAt:Date.now(),draft:{step:3,templateId:'ecommerce-basic',storeCategory:'flowers',extras:['search'],projectName:'Сохранённый заказ',planId:'standard',annual:true}}))});
 const page=await context.newPage();
 try{
  await page.goto(new URL('/#/contract',base).href);await page.getByTestId('contract-questionnaire').waitFor();
  const before=await page.evaluate(key=>localStorage.getItem(key),key);
  assert.equal(await page.getByTestId('contract-estimate').count(),0,'saved selection must not apply automatically');
  await tap(page.getByTestId('contract-restore-order'));
  assert.equal(await page.getByTestId('contract-project-name').inputValue(),'Сохранённый заказ');
  await tap(page.getByTestId('contract-next'));
  assert.match(normalize(await page.getByTestId('contract-estimate').innerText()),/170 000 ₽/);
  assert.match(normalize(await page.locator('.cq-annual-note').innerText()),/149 000 ₽/);
  await tap(page.getByTestId('contract-next'));
  await tap(page.getByTestId('contract-next'));
  await page.waitForFunction(()=>/149\s000\s₽ за год/u.test(document.querySelector('[data-testid="order-contract-preview"]')?.textContent||''));
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),before,'reading a saved estimate must not alter it');
  await tap(page.getByTestId('contract-back'));
  await tap(page.getByTestId('contract-back'));
  await tap(page.getByTestId('contract-support-monthly'));
  await tap(page.getByTestId('contract-next'));
  await tap(page.getByTestId('contract-next'));
  await page.waitForFunction(()=>/14\s900\s₽ за месяц/u.test(document.querySelector('[data-testid="order-contract-preview"]')?.textContent||''));
  console.log(`PASS ${engine.name()}: explicit restore, unchanged order, annual-to-monthly choice`);
 }finally{await context.close();await browser.close()}
}
(async()=>{for(const e of [chromium,webkit]){for(const w of [320,390,768])await run(e,w);await saved(e)}})().catch(e=>{console.error(e);process.exitCode=1});
