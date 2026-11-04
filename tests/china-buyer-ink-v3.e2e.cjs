const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.BUYER_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/?$/, '/');
const engineName = process.env.BUYER_ENGINE === 'webkit' ? 'webkit' : 'chromium';
const engine = engineName === 'webkit' ? webkit : chromium;

async function run(browser, width) {
  const context = await browser.newContext({ viewport: { width, height:844 }, isMobile:true, hasTouch:true, reducedMotion:'reduce', locale:'ru-RU', serviceWorkers:'block' });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType:'text/javascript', body:'' }));
  const page=await context.newPage(); const errors=[];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}#/demos/china-buyer/app`, {waitUntil:'domcontentloaded'});
    await page.getByTestId('china-buyer').waitFor();
    await page.locator('.cbv-art__seal').waitFor();
    const font = await page.evaluate(async () => {
      const chars = ['寻','找','精','选'];
      const faces=await document.fonts.load('60px "Buyer Brush"',chars.join(''));
      await document.fonts.ready;
      const canvas=document.createElement('canvas');canvas.width=100;canvas.height=100;
      const ctx=canvas.getContext('2d');ctx.font='60px "Buyer Brush"';ctx.fillStyle='#111';ctx.textBaseline='top';
      const signatures=chars.map(char=>{ctx.clearRect(0,0,100,100);ctx.fillText(char,5,5);return Array.from(ctx.getImageData(0,0,100,100).data).join(',');});
      return {loaded:faces.length>0 && faces.every(face=>face.status==='loaded'),check:document.fonts.check('60px "Buyer Brush"',chars.join('')),distinct:new Set(signatures).size};
    });
    assert.equal(font.loaded,true,`${engineName} ${width}: brush font loaded`);
    assert.equal(font.check,true,`${engineName} ${width}: font check`);
    assert.equal(font.distinct,4,`${engineName} ${width}: characters must not be identical tofu`);
    const cloud=await context.request.get(`${base}china-buyer/v3-cloud-ink.webp`);
    assert.equal(cloud.status(),200); assert.match(cloud.headers()['content-type']||'',/image\/webp/); assert.ok((await cloud.body()).length>1000);
    const mark=page.locator('.cbv-ticker i').first();
    const star=await mark.evaluate(el=>({text:el.textContent.trim(),bg:getComputedStyle(el).backgroundColor,clip:getComputedStyle(el).clipPath,width:el.getBoundingClientRect().width}));
    assert.equal(star.text,''); assert.equal(star.bg,'rgb(224, 82, 73)'); assert.notEqual(star.clip,'none'); assert.ok(star.width>=8);
    await page.locator('.cbv-cloud-divider').scrollIntoViewIfNeeded();
    await page.locator('.cbv-cloud-divider img').evaluate(img=>img.decode());
    await page.getByRole('button',{name:'Открыть коллекцию'}).click();
    const geometry=await page.evaluate(()=>{const ink=document.querySelector('.cb-catalog__ink').getBoundingClientRect();const lead=document.querySelector('.cb-catalog > .cb-lead').getBoundingClientRect();return {inkBottom:ink.bottom,leadTop:lead.top,width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth};});
    assert.ok(geometry.inkBottom<=geometry.leadTop,`${engineName} ${width}: ink overlaps description`);
    assert.ok(geometry.scrollWidth<=geometry.width+1,`${engineName} ${width}: horizontal overflow`);
    await page.getByRole('button',{name:'Открыть Структурный жакет'}).click();
    assert.equal(await page.locator('.bpd-title-seal').textContent(),'选');
    const cta=page.locator('.bpd-request');
    assert.equal(await cta.evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(168, 44, 46)');
    await cta.click();
    assert.match(await page.locator('#cbw-description').inputValue(),/Структурный жакет/);
    assert.deepEqual(errors,[]);
    console.log(`PASS ${engineName} ${width}: ink font, cloud, stars, geometry and request`);
  } finally { await context.close(); }
}
(async()=>{const browser=await engine.launch({headless:true});try {for(const width of [320,390,430]) await run(browser,width);}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
