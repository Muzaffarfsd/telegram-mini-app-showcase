// Reference-led LUMI gallery: mobile geometry, selection and accessible viewer.
const {chromium, webkit}=require('playwright');
const assert=require('node:assert/strict');
const base=(process.env.LUMI_TEST_URL||'http://127.0.0.1:53744/').replace(/\/$/,'');
const engine=process.env.LUMI_ENGINE==='webkit'?webkit:chromium;

async function run(browser,width,height){
  const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(`${base}/#/demos/lumi-studio/app`,{waitUntil:'domcontentloaded'});
    await page.getByTestId('lumi-studio').waitFor();
    const hero=page.locator('.lumi-v4-hero-grid');
    assert.equal(await hero.locator('.lumi-v4-hero-rail button').count(),3,'three home images');
    const rail=await hero.locator('.lumi-v4-hero-rail').boundingBox();
    const portrait=await hero.locator('.lumi-v4-hero-portrait').boundingBox();
    assert(rail&&portrait&&rail.x+rail.width<=portrait.x&&rail.width<portrait.width,'home thumbnails left of portrait');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal page overflow');

    await page.locator('.lumi-nav').getByRole('button',{name:'Услуги'}).click();
    await page.getByRole('button',{name:'Открыть услугу: Стрижка и укладка',exact:true}).click();
    await page.locator('.lumi-v4-detail h1').waitFor();
    const cta=await page.locator('.lumi-v4-book-row button').boundingBox();
    const nav=await page.locator('.lumi-nav').boundingBox();
    assert(cta&&nav&&cta.y>=0&&cta.y+cta.height<=nav.y,'booking CTA above navigation');
    const gallery=page.locator('.lumi-v4-gallery');
    const thumbs=gallery.locator('.lumi-v4-gallery-thumb');
    const main=gallery.locator('.lumi-v4-gallery-main');
    assert.equal(await thumbs.count(),3,'three service thumbnails');
    const left=await gallery.locator('.lumi-v4-gallery-rail').boundingBox();
    const large=await main.boundingBox();
    assert(left&&large&&left.x+left.width<=large.x&&left.width<large.width,'thumbnail rail left of large image');
    const cover=await main.locator('img').getAttribute('src');
    const seen=new Set([cover]);
    for(let i=0;i<3;i++){
      await thumbs.nth(i).focus();
      await page.keyboard.press('Enter');
      assert.equal(await thumbs.nth(i).getAttribute('aria-pressed'),'true',`thumbnail ${i+1} selected`);
      const selected=await main.locator('img').getAttribute('src');
      assert.notEqual(selected,cover,'selection changes main image');
      assert(!seen.has(selected),'each detail is distinct');
      seen.add(selected);
    }
    await page.getByRole('button',{name:'Вернуться к основному'}).click();
    assert.equal(await main.locator('img').getAttribute('src'),cover,'can restore cover');
    await main.focus();
    await page.keyboard.press('Enter');
    const dialog=page.getByRole('dialog',{name:'Фотография услуги Стрижка и укладка'});
    await dialog.waitFor();
    await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Закрыть просмотр фотографии');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Следующая фотография','focus wraps within dialog');
    await page.keyboard.press('ArrowRight');
    assert.notEqual(await dialog.locator('img').getAttribute('src'),cover,'arrow key changes image');
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(),0,'Escape closes viewer');
    await page.waitForFunction(()=>document.activeElement?.classList.contains('lumi-v4-gallery-main'));
    assert.deepEqual(errors,[],'no uncaught JavaScript errors');
    console.log(`${engine.name()} ${width}x${height}: gallery layout, image selection, CTA and keyboard viewer passed`);
  }finally{await context.close();}
}
(async()=>{const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]])await run(browser,w,h);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
