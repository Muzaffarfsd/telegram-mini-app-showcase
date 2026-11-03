// Browser regression: every catalog item uses a generated local image.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
require('tsx/cjs');
const { appleCatalog2026 } = require('../client/src/components/demos/appleCatalog2026.ts');
const { generatedProductPhotos } = require('../client/src/components/demos/appleGeneratedProductImages.ts');
const base = process.env.APPLE_TEST_URL || 'http://127.0.0.1:53738/';

async function run(engine) {
  const browser = await engine.launch({headless:true});
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
  const errors = [], appleImages = [];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{ if(request.resourceType()==='image' && /(^|\.|-)apple\.com$/.test(new URL(request.url()).hostname)) appleImages.push(request.url()); });
  await page.route('https://telegram.org/js/telegram-web-app.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
  try {
    for (const item of appleCatalog2026) for (const color of item.colors) {
      const photos=generatedProductPhotos(item.id,color);
      assert.ok(photos.length>0,`Missing generated illustration: ${item.id} / ${color}`);
      assert.ok(photos.every(src=>src.startsWith('/apple-store/generated/')));
    }
    await page.goto(`${base}#/demos/apple-store/app`,{waitUntil:'domcontentloaded'});
    await page.getByTestId('apple-store').waitFor({timeout:30000});
    await page.locator('.as-nav').getByRole('button',{name:'Каталог'}).tap();
    const cards=page.locator('.as-catalog [data-testid^="as-card-"]');
    await cards.first().waitFor();
    assert.equal(await cards.count(),appleCatalog2026.length);
    const paths=await cards.locator('.as-card-picture img').evaluateAll(imgs=>imgs.map(img=>img.getAttribute('src')));
    assert.equal(paths.length,appleCatalog2026.length);
    assert.ok(paths.every(src=>src.startsWith('/apple-store/generated/')),'A catalog image is not generated and local');
    const failed=await page.evaluate(async paths=>{const checks=await Promise.all(paths.map(async path=>{const r=await fetch(path);return !r.ok||!r.headers.get('content-type')?.startsWith('image/')?path:null}));return checks.filter(Boolean)},paths);
    assert.deepEqual(failed,[],'Catalog images failed to load');
    const search=page.getByRole('searchbox',{name:'Поиск по каталогу'});
    await search.fill('iPhone 18');
    assert.ok(await cards.count()>=2);
    await page.getByTestId('as-card-iphone-18-pro-max').getByRole('button',{name:/Открыть/}).evaluate(el=>el.click());
    await page.locator('.as-product h1').waitFor();
    assert.match(await page.locator('.as-gallery-note').first().innerText(),/создана с помощью ИИ/i);
    const thumbs=page.locator('.as-gallery-strip button');
    assert.ok(await thumbs.count()>=2,'Missing matching generated product angles');
    await thumbs.nth(1).evaluate(el=>el.click());
    await page.getByRole('button',{name:'Увеличить фотографию товара'}).evaluate(el=>el.click());
    const dialog=page.getByRole('dialog');await dialog.waitFor();
    assert.match(await dialog.locator('.as-viewer-note').innerText(),/создана с помощью ИИ/i);
    assert.deepEqual(appleImages,[],'Apple image request detected');
    assert.deepEqual(errors,[]);
    console.log(`${engine.name()}: ${appleCatalog2026.length} catalog products and all generated finishes; local image loading, search, gallery and viewer passed`);
  } finally { await browser.close(); }
}
(async()=>{await run(chromium);await run(webkit)})().catch(error=>{console.error(error);process.exitCode=1});
