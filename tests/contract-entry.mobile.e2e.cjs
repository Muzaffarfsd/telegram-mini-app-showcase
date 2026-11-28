const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const fs = require('node:fs');
const { unzipSync, strFromU8 } = require('fflate');
const base = process.env.CONTRACT_ENTRY_TEST_URL || 'http://127.0.0.1:41755/';
const text = value => value.replace(/\s+/gu, ' ').trim();
async function tap(locator) { await locator.scrollIntoViewIfNeeded(); await locator.tap(); }
async function openFromMenu(page) {
  await tap(page.getByTestId('button-hamburger'));
  await tap(page.getByTestId('button-nav-contract'));
  await page.getByTestId('contract-page').waitFor();
}
async function run(engine, width) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport:{width,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2, locale:'ru-RU', serviceWorkers:'block', reducedMotion:'reduce', acceptDownloads:true });
  await context.addInitScript(() => { localStorage.setItem('app-language','ru'); localStorage.removeItem('web4tg:order-draft:v1'); });
  await context.addInitScript(engineName => { if (engineName === 'webkit') { window.__agreementFile = null; Object.defineProperty(navigator,'canShare',{value:()=>true,configurable:true}); Object.defineProperty(navigator,'share',{value:data => {window.__agreementFile=data.files[0];return Promise.resolve();},configurable:true}); } else { Object.defineProperty(navigator,'share',{value:undefined,configurable:true}); } }, engine.name());
  await context.route('https://telegram.org/js/telegram-web-app.js', r => r.fulfill({body:''}));
  await context.route('**/api/**', r => r.fulfill({json:{data:[]}}));
  const page = await context.newPage(), errors=[], requests=[];
  page.on('request', request => requests.push(request.url()));
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', dialog => dialog.accept());
  try {
    await page.goto(new URL('/#/profile',base).href,{waitUntil:'domcontentloaded'});
    await page.getByTestId('profile-contract').waitFor();
    await tap(page.getByTestId('profile-contract'));
    await page.getByTestId('contract-page').waitFor();
    await page.waitForTimeout(800);
    assert.ok(!requests.some(url => /(?:orderContractExport|\/docx(?:\.js|\/)|\/dist-[A-Za-z0-9_-]+\.js)/i.test(url)), 'DOCX code must not load before opening the document');
    await tap(page.locator('.contract-general'));
    await tap(page.getByTestId('contract-next'));
    assert.match(text(await page.getByTestId('contract-page').textContent()), /Сервис пока не подключён/);
    await tap(page.locator('.order-contract-full-text > summary'));
    await page.getByTestId('contract-page').getByTestId('order-contract-preview').waitFor();
    await page.waitForFunction(() => document.querySelector('[data-testid="contract-page"] [data-testid="order-contract-preview"]')?.textContent?.includes('Предмет договора'));
    const unselected = text(await page.getByTestId('contract-page').getByTestId('order-contract-preview').textContent());
    assert.ok(!/(?:^|[^\d])0\s*₽/u.test(unselected), 'unknown price must not appear as zero');
    assert.match(unselected,/согласоват/i);
    await tap(page.getByTestId('contract-back'));
    await tap(page.getByTestId('contract-back'));
    await tap(page.getByTestId('contract-direction-clothes'));
    await page.getByTestId('contract-project-name').fill('Пример магазина');
    await tap(page.getByTestId('contract-next'));
    await tap(page.locator('.cq-catalog > summary'));
    const extra=page.getByTestId('contract-extra-search');
    const group=extra.locator('xpath=ancestor::details[contains(@class,"cq-group")]');
    await tap(group.locator(':scope > summary'));
    await tap(extra);
    await tap(page.getByTestId('contract-support-standard'));
    await tap(page.getByTestId('contract-next'));
    await page.getByTestId('contract-page').getByTestId('order-contract-name').fill('Иван Тестов');
    await tap(page.getByTestId('contract-next'));
    await page.waitForFunction(() => /170\s000\s₽/u.test(document.querySelector('[data-testid="contract-page"] [data-testid="order-contract-preview"]')?.textContent||''));
    const prepared=text(await page.getByTestId('contract-page').getByTestId('order-contract-preview').textContent());
    assert.match(prepared,/Пример магазина/); assert.match(prepared,/Иван Тестов/); assert.match(prepared,/Поиск/); assert.match(prepared,/14\s900\s₽/); assert.match(prepared,/85\s000\s₽/); assert.match(prepared,/50%/); assert.match(prepared,/100% стоимости каждого месяца/);
    const downloadButton = page.getByTestId('contract-page').getByTestId('order-contract-download');
    await page.waitForFunction(() => !document.querySelector('[data-testid=\"contract-page\"] [data-testid=\"order-contract-download\"]')?.disabled, null, {timeout:30000});
    let bytes;
    if (engine.name() === 'chromium') { const event = page.waitForEvent('download'); await tap(downloadButton); const download = await event; bytes = fs.readFileSync(await download.path()); }
    else { await tap(downloadButton); const data = await page.evaluate(async () => Array.from(new Uint8Array(await window.__agreementFile.arrayBuffer()))); bytes = Buffer.from(data); }
    const zip = unzipSync(bytes); const xml = strFromU8(zip['word/document.xml']);
    assert.match(xml,/Иван Тестов/); assert.match(xml,/Пример магазина/); assert.match(xml,/170\s000\s₽/); assert.match(xml,/14\s900\s₽/);
    const personal = await page.evaluate(() => ({url:location.href,local:JSON.stringify(localStorage),session:JSON.stringify(sessionStorage)}));
    assert.ok(!JSON.stringify(personal).includes('Иван Тестов'), 'customer name must remain out of URL and browser storage');
    await tap(page.getByTestId('contract-back'));
    await tap(page.getByTestId('contract-back'));
    await tap(page.getByTestId('contract-back'));
    await tap(page.getByTestId('contract-back'));
    await page.getByTestId('profile-contract').waitFor();
    await openFromMenu(page);
    await tap(page.getByTestId('contract-back'));
    await page.getByTestId('profile-page').waitFor();

    await page.goto(new URL('/#/constructor',base).href,{waitUntil:'domcontentloaded'});
    await page.getByTestId('order-page').waitFor();
    await tap(page.getByTestId('template-ecommerce-basic-clothes'));
    await tap(page.getByTestId('order-continue'));
    await tap(page.getByTestId('order-contract-open'));
    await page.getByTestId('order-page').getByTestId('order-contract-name').fill('ООО ПроверкаРеквизитов');
    const storedBefore = await page.evaluate(() => localStorage.getItem('web4tg:order-draft:v1'));
    assert.ok(storedBefore, 'order should be saved');
    assert.ok(!storedBefore.includes('ПроверкаРеквизитов'), 'customer details must not be stored');
    await page.evaluate(() => localStorage.removeItem('web4tg:contract-draft:v1'));
    await openFromMenu(page);
    await tap(page.getByTestId('contract-restore-order'));
    await tap(page.getByTestId('contract-next'));
    await tap(page.getByTestId('contract-next'));
    const visibleName = page.getByTestId('contract-page').getByTestId('order-contract-name');
    const nameLabel = visibleName.locator('xpath=..');
    await tap(nameLabel);
    assert.equal(await visibleName.evaluate(el => document.activeElement === el), true, 'label must focus the visible input, not a hidden order field');
    await tap(page.getByTestId('contract-next'));
    await page.waitForFunction(() => /150\s000\s₽/u.test(document.querySelector('[data-testid="contract-page"] [data-testid="order-contract-preview"]')?.textContent||''));
    assert.equal(await page.evaluate(() => localStorage.getItem('web4tg:order-draft:v1')),storedBefore,'opening agreement must not overwrite order');
    await tap(page.getByTestId('contract-back'));
    await tap(page.getByTestId('contract-back'));
    await tap(page.getByTestId('contract-back'));
    await tap(page.getByTestId('contract-back'));
    await page.getByTestId('order-page').getByTestId('order-contract-name').waitFor();
    assert.equal(await page.getByTestId('order-page').getByTestId('order-contract-name').inputValue(),'ООО ПроверкаРеквизитов','existing order customer fields should survive');
    assert.ok(!(await page.url()).includes('ПроверкаРеквизитов'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
    assert.deepEqual(errors,[]);
    console.log(`PASS ${engine.name()} ${width}: profile/menu, questionnaire, return and order privacy`);
  } finally { await context.close(); await browser.close(); }
}
(async()=>{for(const engine of [chromium,webkit]) for(const width of [320,390]) await run(engine,width)})().catch(error=>{console.error(error);process.exitCode=1});
