const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium, webkit } = require('playwright');
const { unzipSync, strFromU8 } = require('fflate');
const site = process.env.ORDER_TEST_URL || 'http://127.0.0.1:41755/';
const normalize = text => text.replace(/\s+/gu,' ').trim();
const decodeXml = text => text.replace(/&(?:#x([\da-f]+)|#(\d+)|(amp|lt|gt|quot|apos));/gi, (_, hex, dec, named) => hex ? String.fromCodePoint(parseInt(hex,16)) : dec ? String.fromCodePoint(Number(dec)) : ({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"})[named.toLowerCase()]);
async function tap(locator) { await locator.scrollIntoViewIfNeeded(); await locator.tap(); }
async function download(page, engineName) {
  const action = page.getByTestId('order-contract-download');
  await action.waitFor({state:'visible'});
  await page.waitForFunction(() => !document.querySelector('[data-testid="order-contract-download"]')?.disabled, null, {timeout:30000});
  const preview = await page.getByTestId('order-contract-preview').locator('h3, p').allTextContents();
  let bytes;
  if (engineName === 'chromium') {
    const downloadPromise = page.waitForEvent('download', {timeout:15000});
    await tap(action);
    const download = await downloadPromise;
    assert.match(download.suggestedFilename(), /\.docx$/i);
    const stream = await download.createReadStream();
    assert.ok(stream, 'browser exposes the downloaded document');
    const chunks = []; for await (const chunk of stream) chunks.push(chunk);
    bytes = Buffer.concat(chunks);
  } else {
    // Emulate the iOS share-sheet API, retaining the actual File passed to it.
    // Playwright WebKit does not prove that a native Telegram saves the file.
    const count = await page.evaluate(() => window.__contractShared.length);
    await tap(action);
    await page.waitForFunction(expected => window.__contractShared.length > expected, count);
    bytes = Buffer.from(await page.evaluate(async () => Array.from(new Uint8Array(await window.__contractShared.at(-1).arrayBuffer()))));
  }
  if (process.env.ORDER_SAVE_E2E_DOCX === '1') { fs.mkdirSync('work', {recursive:true}); fs.writeFileSync('work/contract-generated-e2e.docx', bytes); }
  const files = unzipSync(new Uint8Array(bytes));
  assert.ok(files['word/document.xml'] && files['[Content_Types].xml'], 'download is a real DOCX archive');
  const xml = strFromU8(files['word/document.xml']);
  const text = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(match => decodeXml(match[1])).join(' ');
  const normalizedDoc = normalize(text);
  for (const paragraph of preview.map(normalize).filter(Boolean)) assert.ok(normalizedDoc.includes(paragraph), `preview paragraph missing from DOCX: ${paragraph.slice(0,90)}`);
  return normalizedDoc;
}
async function run(engine,width,height) {
  const browser = await engine.launch();
  const context = await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:'ru-RU',serviceWorkers:'block',acceptDownloads:true});
  await context.addInitScript((engineName) => {
    localStorage.setItem('app-language','ru');
    localStorage.removeItem('web4tg:order-draft:v1');
    window.__contractBlobs=[];
    const create=URL.createObjectURL.bind(URL);
    URL.createObjectURL=blob=>{window.__contractBlobs.push(blob); return create(blob)};
    window.__contractShared=[];
    // On Chromium test an actual browser download. In WebKit model the native
    // file-share API and inspect the real File passed to that API.
    if (engineName === 'chromium') {
      Object.defineProperty(navigator, 'share', {value:undefined, configurable:true});
    } else {
      Object.defineProperty(navigator, 'canShare', {value: data => !!data.files?.length, configurable:true});
      Object.defineProperty(navigator, 'share', {value: data => {window.__contractShared.push(data.files[0]); return Promise.resolve();}, configurable:true});
    }
  }, engine.name());
  await context.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await context.route('**/api/exchange-rates/nbkr',r=>r.fulfill({status:503,contentType:'application/json',body:'{"error":"unavailable"}'}));
  const page=await context.newPage(), errors=[], sent=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>sent.push({url:req.url(),body:req.postData()||''}));
  try {
    await page.goto(new URL('/#/constructor',site).href,{waitUntil:'domcontentloaded'});
    await page.getByTestId('order-page').waitFor();
    await tap(page.getByTestId('template-ecommerce-basic-clothes'));
    await page.locator('#order-project-name').fill('Проверка приложения');
    await tap(page.getByTestId('recommended-feature-search'));
    await tap(page.getByTestId('order-continue'));
    assert.match(normalize(await page.getByTestId('order-final-total').innerText()),/170 000 ₽/);
    await tap(page.locator('.order-support > summary'));
    await tap(page.getByTestId('order-plan-standard'));
    await tap(page.getByTestId('order-contract-open'));
    const marker = { name:'ООО ПроверкаДоговораФлора', tax:'1234567890', address:'Тестоград, улица Первая, 41', email:'contract-check@example.invalid' };
    await page.getByTestId('order-contract-name').fill(marker.name);
    await page.getByTestId('order-contract-tax').fill(marker.tax);
    await page.getByTestId('order-contract-address').fill(marker.address);
    await page.getByTestId('order-contract-email').fill(marker.email);
    const monthly=await download(page,engine.name());
    for(const value of Object.values(marker)) assert.ok(monthly.includes(value), `customer data missing from DOCX: ${value}`);
    assert.match(monthly,/170\s000\s₽/); assert.match(monthly,/85\s000\s₽/); assert.match(monthly,/50%/);
    assert.match(monthly,/14\s900\s₽ за месяц/); assert.match(monthly,/100% стоимости каждого месяца/);
    await tap(page.getByRole('button',{name:'В год',exact:true}));
    await page.waitForFunction(() => /149\s000\s₽ за год/u.test(document.querySelector('[data-testid="order-contract-preview"]')?.textContent||''));
    const annual=await download(page,engine.name());
    assert.match(annual,/149\s000\s₽ за год/); assert.match(annual,/годовой период/i);
    assert.ok(!annual.includes('14 900 ₽ за месяц'), 'annual document must not contain the stale monthly choice');
    assert.notEqual(monthly,annual,'updated selection needs a new file');
    await tap(page.getByRole('button', { name: 'Изменить параметры' }));
    await tap(page.getByTestId('order-all-features').locator(':scope > summary'));
    await tap(page.locator('.order-group[data-feature-category=\"constructor.aiAutomationCategory\"] > summary'));
    await tap(page.getByTestId('feature-ai-chatbot'));
    await tap(page.getByTestId('order-continue'));
    await tap(page.getByTestId('order-contract-open'));
    assert.equal(await page.getByTestId('order-contract-name').inputValue(), marker.name, 'customer name should survive editing the order');
    for (const [field, expected] of [['tax',marker.tax],['address',marker.address],['email',marker.email]]) {
      assert.equal(await page.getByTestId(`order-contract-${field}`).inputValue(), expected, `customer ${field} should survive editing the order`);
    }
    const edited=await download(page,engine.name());
    assert.ok(edited.includes(marker.name),'edited document should retain customer name');
    assert.match(edited,/AI Чат-бот/i);
    assert.match(edited,/219\s000\s₽/);
    assert.notEqual(annual,edited,'changed functions need a newly generated file');
    const leak = await page.evaluate(() => ({url:location.href,local:JSON.stringify(localStorage),session:JSON.stringify(sessionStorage)}));
    for(const value of Object.values(marker)) {
      assert.ok(!JSON.stringify(leak).includes(value), `customer data persisted or put in URL: ${value}`);
      const decode = value => { try { return decodeURIComponent(value.replace(/\+/g,' ')); } catch { return value; } };
      assert.ok(!sent.some(r => (r.url + r.body).includes(value) || decode(r.url + r.body).includes(value)), `customer data sent in a request: ${value}`);
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth), true);
    assert.deepEqual(errors,[]);
    console.log(`PASS ${engine.name()} ${width}x${height}: DOCX matches preview, monthly/yearly, fresh selection, private details`);
  } finally { await context.close(); await browser.close(); }
}
(async()=>{for(const engine of [chromium,webkit]) for(const [w,h] of [[320,740],[390,844]]) await run(engine,w,h)})().catch(e=>{console.error(e);process.exitCode=1});
