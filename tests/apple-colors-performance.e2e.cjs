// Regression: selecting a finish must change the actual product image and cart image.
// Run against the local Vite server or set APPLE_TEST_URL for a deployed preview.
const { chromium, webkit } = require('playwright');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
require('tsx/cjs');
const { appleCatalog2026 } = require('../client/src/components/demos/appleCatalog2026.ts');
const base = process.env.APPLE_TEST_URL || 'http://127.0.0.1:53738/';
const multi = appleCatalog2026.filter(item => item.colors.length > 1);
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const sourceWithoutWidth = value => {
  try { const url = new URL(value, base); url.searchParams.delete('wid'); url.searchParams.delete('hei'); url.searchParams.delete('fmt'); if (url.pathname.startsWith('/apple-store/products/')) url.pathname=url.pathname.replace(/-\d+\.webp$/, '.webp'); return url.toString(); }
  catch { return value; }
};
async function loaded(page, previous) {
  await page.waitForFunction(prev => { const img = document.querySelector('.as-product-gallery > img'); return img && img.complete && img.naturalWidth > 0 && (!prev || img.currentSrc !== prev); }, previous || null, { timeout: 30000 });
  return page.locator('.as-product-gallery > img');
}
async function openCatalog(page) {
  await page.locator('.as-nav').getByRole('button', { name:'Каталог' }).tap();
  await page.locator('.as-catalog').waitFor();
  // Allow the app's deferred catalog scroll restoration to finish before tapping.
  await page.waitForTimeout(400);
}
async function openItem(page, item) {
  await openCatalog(page);
  const card = page.getByTestId('as-card-' + item.id);
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await card.getByRole('button', { name:/Открыть/ }).evaluate(button => button.click());
  await page.locator('.as-product').getByRole('heading', {name:item.name, exact:true, level:1}).waitFor();
  await loaded(page);
}
async function verifyItem(page, item, includeHistoryAndCart) {
  console.log(`Checking ${item.id}`);
  await openItem(page,item);
  const group=page.locator('.as-product-configuration .as-choice').first();
  const buttons=group.locator('.as-choice-buttons button');
  const names=await buttons.allTextContents();
  for (const color of item.colors) assert.ok(names.includes(color), `${item.id}: цвет ${color} отсутствует`);
  assert.ok(names.length > 1, `${item.id}: выбор цвета исчез`);
  const first=buttons.first();
  assert.equal(await first.getAttribute('aria-pressed'),'true',`${item.id}: первый цвет не выбран`);
  let img=await loaded(page);
  const defaultSrc=await img.evaluate(el=>el.currentSrc);
  const defaultHash=hash(await img.screenshot({animations:'disabled'}));
  const defaultThumbs=await page.locator('.as-gallery-strip img').evaluateAll(a=>a.map(x=>x.getAttribute('src')));
  const seen=new Map([[item.colors[0],defaultSrc]]);
  let previous=defaultSrc;
  for (let index=1;index<item.colors.length;index++) {
    const color=item.colors[index],button=group.getByRole('button',{name:color,exact:true});
    assert.equal(await button.isEnabled(),true,`${item.id}: цвет ${color} недоступен`);
    await button.scrollIntoViewIfNeeded();
    await button.tap();
    assert.equal(await button.getAttribute('aria-pressed'),'true',`${item.id}: цвет ${color} не выбран`);
    img=await loaded(page,previous);
    const current=await img.evaluate(el=>el.currentSrc);
    assert.notEqual(sourceWithoutWidth(current),sourceWithoutWidth(defaultSrc),`${item.id}: картинка не меняется для ${color}`);
    const screenshotHash=hash(await img.screenshot({animations:'disabled'}));
    assert.notEqual(screenshotHash,defaultHash,`${item.id}: картинка визуально не меняется для ${color}`);
    for(const [otherName,other] of seen) assert.notEqual(sourceWithoutWidth(current),sourceWithoutWidth(other),`${item.id}: одинаковая картинка для ${otherName} и ${color}`);
    seen.set(color,current); previous=current;
    const thumbs=page.locator('.as-gallery-strip button');
    if (await thumbs.count()) {
      assert.equal(await thumbs.first().getAttribute('aria-pressed'),'true',`${item.id}: цвет не сбросил позицию галереи`);
      const thumbSrc=await thumbs.first().locator('img').getAttribute('src');
      const mainSrc=await img.getAttribute('src');
      assert.equal(sourceWithoutWidth(thumbSrc),sourceWithoutWidth(mainSrc),`${item.id}: первая миниатюра другого цвета`);
      const now=await thumbs.locator('img').evaluateAll(a=>a.map(x=>x.getAttribute('src')));
      assert.ok(!now.some(src=>defaultThumbs.includes(src)),`${item.id}: галерея ${color} содержит прежние ракурсы`);
    }
  }
  // Switch after navigating the gallery, so stale photo state cannot survive.
  const thumbs=page.locator('.as-gallery-strip button');
  if (await thumbs.count()>1) { await thumbs.last().scrollIntoViewIfNeeded(); await thumbs.last().tap(); }
  await first.scrollIntoViewIfNeeded(); await first.tap();
  img=await loaded(page,previous);
  assert.equal(sourceWithoutWidth(await img.evaluate(el=>el.currentSrc)),sourceWithoutWidth(defaultSrc),`${item.id}: исходный цвет не восстановился`);
  if (includeHistoryAndCart) {
    const selected=buttons.nth(1); await selected.scrollIntoViewIfNeeded(); await selected.tap();
    img=await loaded(page,defaultSrc); const selectedSrc=await img.getAttribute('src'), selectedColor=item.colors[1];
    await page.getByRole('button',{name:/В КОРЗИНУ/}).scrollIntoViewIfNeeded();
    await page.getByRole('button',{name:/В КОРЗИНУ/}).tap();
    const dialog=page.getByRole('dialog'); await dialog.waitFor();
    assert.match(await dialog.textContent(),new RegExp(selectedColor));
    const cartImage=await dialog.locator('.as-cart-image img').first().getAttribute('src');
    assert.equal(sourceWithoutWidth(cartImage),sourceWithoutWidth(selectedSrc),`${item.id}: картинка корзины не соответствует выбранному цвету`);
    await dialog.getByRole('button',{name:'Закрыть'}).tap(); await dialog.waitFor({state:'hidden'});
    await page.goBack(); await page.locator('.as-catalog').waitFor(); await page.goForward(); await page.locator('.as-product').waitFor();
    assert.equal(await group.getByRole('button',{name:selectedColor,exact:true}).getAttribute('aria-pressed'),'true',`${item.id}: цвет не восстановился после навигации`);
    assert.equal(sourceWithoutWidth(await page.locator('.as-product-gallery > img').getAttribute('src')),sourceWithoutWidth(selectedSrc),`${item.id}: картинка не восстановилась после навигации`);
  }
}
async function verifyResponsive(page) {
  await openCatalog(page);
  const card=page.locator('.as-catalog .as-card-picture img').first();
  await card.waitFor();
  await page.waitForFunction(()=>{let e=document.querySelector('.as-catalog .as-card-picture img');return e?.complete && e.naturalWidth>0},{timeout:30000});
  const src=await card.evaluate(el=>el.currentSrc);
  if (/storeimages\.cdn-apple\.com/.test(src)) {
    const width=Number(new URL(src).searchParams.get('wid'));
    assert.ok(width>0 && width<=480,`Каталог на мобильном загружает слишком большую картинку: ${width}`);
  }
  const item=multi[0];
  await page.getByTestId('as-card-'+item.id).getByRole('button',{name:/Открыть/}).tap();
  await page.locator('.as-product').waitFor();
  const thumb=page.locator('.as-gallery-strip img').first();
  if(await thumb.count()){
    await thumb.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>{let e=document.querySelector('.as-gallery-strip img');return e?.complete && e.naturalWidth>0},{timeout:30000});
    const thumbSrc=await thumb.evaluate(el=>el.currentSrc);
    if (/storeimages\.cdn-apple\.com/.test(thumbSrc)) {
      const width=Number(new URL(thumbSrc).searchParams.get('wid'));
      assert.ok(width>0 && width<=320,`Миниатюра загружает большой оригинал: ${width}`);
    }
  }
}
async function run(engine,items) {
 const browser=await engine.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:'ru-RU',reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
 const page=await context.newPage(), errors=[]; page.on('pageerror',e=>errors.push(e.message));
 try {
   await page.goto(`${base}#/demos/apple-store/app`,{waitUntil:'domcontentloaded'}); await page.getByTestId('apple-store').waitFor({timeout:30000});
   for(const item of items) {
     try { await verifyItem(page,item,item.id==='iphone-18-pro-max'); }
     catch (error) { console.log('State at failure:', (await page.locator('.as-content').allTextContents()).map(x=>x.slice(0,200))); await page.screenshot({path:'work-apple-test-failure.png'}); throw error; }
   }
   await verifyResponsive(page); assert.deepEqual(errors,[]);
   console.log(`${engine.name()}: ${items.length} models, every advertised color, restoration, cart, history, and mobile image sizing passed`);
 } finally {await context.close();await browser.close();}
}
(async()=>{
 assert.ok(multi.length>=5,'Missing multi-color product fixtures');
 await run(chromium,multi);
 const sample=multi.filter(x=>['iphone-18-pro-max','ipad-mini-a20','macbook-air-2026'].includes(x.id));
 assert.equal(sample.length,3); await run(webkit,sample);
})().catch(e=>{console.error(e);process.exitCode=1});
