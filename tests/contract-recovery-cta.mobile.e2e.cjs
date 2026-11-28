const assert = require('node:assert/strict');
const {chromium, webkit} = require('playwright');
const base = process.env.CONTRACT_ENTRY_TEST_URL || 'http://127.0.0.1:41755/';
const customerName = 'ООО ПроверкаПриватности';
const pagePath = new URL('/#/contract', base).href;

async function start(engine, routeSetup) {
  const browser = await engine.launch();
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ru-RU',serviceWorkers:'block'});
  await context.addInitScript(() => {localStorage.setItem('app-language','ru');localStorage.removeItem('web4tg:order-draft:v1');});
  await context.route('https://telegram.org/js/telegram-web-app.js', r=>r.fulfill({body:''}));
  await context.route('**/api/**', r=>r.fulfill({json:{data:[]}}));
  if (routeSetup) await routeSetup(context);
  const page = await context.newPage();
  await page.goto(pagePath, {waitUntil:'domcontentloaded'});
  await page.getByTestId('contract-page').waitFor();
  return {browser, context, page};
}
async function tap(locator) {await locator.scrollIntoViewIfNeeded(); await locator.tap();}

async function testExportFailure(engine) {
  const {browser,context,page}=await start(engine,ctx=>ctx.route('**/src/components/orderContractExport.ts*',r=>r.abort('failed')));
  try {
    await tap(page.getByTestId('order-contract-open'));
    const panel = page.getByTestId('contract-page').getByTestId('order-contract');
    await panel.getByRole('status').waitFor();
    const status = await panel.getByRole('status').innerText();
    assert.match(status, /Не удалось подготовить файл/);
    assert.match(status, /скопир/i);
    assert.match(status, /реквизит|данные/i, 'warn about unsaved details before reopening');
    assert.match(await panel.getByTestId('order-contract-preview').innerText(), /Предмет договора/);
    assert.equal(await panel.getByTestId('order-contract-copy').isEnabled(), true);
    const button=panel.getByTestId('order-contract-download');
    assert.equal(await button.isDisabled(), true, 'a failed dynamic import must not offer a false retry');
    assert.doesNotMatch(await button.innerText(), /Повторить/);
    await panel.getByTestId('order-contract-name').fill(customerName);
    await page.waitForFunction(name => document.querySelector('[data-testid="contract-page"] [data-testid="order-contract-preview"]')?.textContent?.includes(name), customerName);
    await page.evaluate(() => {window.__copiedContract='';Object.defineProperty(navigator,'clipboard',{value:{writeText(value){window.__copiedContract=value;return Promise.resolve();}},configurable:true});});
    await tap(panel.getByTestId('order-contract-copy'));
    const copied = await page.evaluate(() => window.__copiedContract);
    assert.ok(copied.includes(customerName) && copied.includes('Предмет договора'), 'copy includes current details and full text');
    assert.ok(!(await page.evaluate(()=>JSON.stringify(localStorage))).includes(customerName));
    console.log(`PASS ${engine.name()} DOCX outage: readable and copyable current text, clear unsaved-data warning`);
  } finally {await context.close();await browser.close();}
}
async function testNativeDiscussion(engine) {
  const {browser,context,page}=await start(engine);
  try {
    const sent=[]; page.on('request', r=>sent.push({url:r.url(),body:r.postData()||''}));
    await tap(page.getByTestId('order-contract-open'));
    await page.getByTestId('order-contract-name').fill(customerName);
    await page.evaluate(()=>{window.__discussion=[];window.Telegram=window.Telegram||{};window.Telegram.WebApp=window.Telegram.WebApp||{};window.Telegram.WebApp.openTelegramLink=url=>window.__discussion.push(url)});
    const link=page.getByTestId('contract-discuss');
    assert.equal(await link.getAttribute('href'),'https://t.me/web4tgs');
    assert.match(await page.locator('.contract-signing').innerText(),/Файл можно прикрепить к сообщению вручную/);
    await tap(link);
    assert.deepEqual(await page.evaluate(()=>window.__discussion),['https://t.me/web4tgs']);
    assert.equal(new URL(page.url()).hash,'#/contract','native handoff leaves the draft page intact');
    assert.ok(!sent.some(x=>`${x.url} ${x.body}`.includes(customerName)), 'customer name must not leave as a request');
    assert.ok(!(await page.evaluate(()=>JSON.stringify(localStorage))).includes(customerName),'customer details must not be stored');
    assert.ok(!(await page.evaluate(()=>location.href)).includes(customerName),'customer details must not appear in URL');
    console.log(`PASS ${engine.name()} native discussion: intended chat only, no submission or personal data leak`);
  } finally {await context.close();await browser.close();}
}
async function testBrowserDiscussion(engine, behavior) {
  const {browser,context,page}=await start(engine);
  try {
    await page.evaluate(behavior => {window.Telegram=window.Telegram||{}; window.Telegram.WebApp=window.Telegram.WebApp||{}; if (behavior==='throws') window.Telegram.WebApp.openTelegramLink=()=>{throw Error('unsupported')}; else window.Telegram.WebApp.openTelegramLink=undefined;},behavior);
    const target='https://t.me/web4tgs';
    await context.route('https://t.me/**',route=>route.fulfill({status:200,body:'Intercepted: no message sent'}));
    const link=page.getByTestId('contract-discuss');
    assert.equal(await link.getAttribute('href'),target);
    assert.equal(await link.getAttribute('target'),'_blank');
    assert.match(await link.getAttribute('rel'),/noopener/);
    const opened=context.waitForEvent('page',{timeout:10000});
    await tap(link);
    const popup=await opened;
    await popup.waitForLoadState('domcontentloaded');
    assert.equal(popup.url(),target);
    assert.equal(new URL(page.url()).hash,'#/contract');
    await popup.close();
    console.log(`PASS ${engine.name()} browser discussion ${behavior}: target chat, intercepted, no send`);
  } finally {await context.close();await browser.close();}
}
(async()=>{for(const engine of [chromium,webkit]){await testExportFailure(engine);await testNativeDiscussion(engine);await testBrowserDiscussion(engine,'missing');await testBrowserDiscussion(engine,'throws')}})().catch(e=>{console.error(e);process.exitCode=1});
