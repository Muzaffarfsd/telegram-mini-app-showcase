const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.LUMI_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/$/, '');
const engine = process.env.LUMI_ENGINE === 'webkit' ? webkit : chromium;
async function run(browser, width, height) {
  const context = await browser.newContext({ viewport: {width,height}, isMobile:true, hasTouch:true, reducedMotion:'reduce', serviceWorkers:'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const openHome = async () => {await page.goto(`${base}/#/demos/lumi-studio/app`, {waitUntil:'domcontentloaded'}); await page.getByTestId('lumi-studio').waitFor(); await page.locator('.lumi-nav').getByRole('button',{name:'Главная'}).click();};
  try {
    await openHome();
    await page.getByRole('button',{name:'ИСТОРИЯ СТУДИИ'}).click();
    await page.locator('.lumi-story').waitFor();
    assert.equal(await page.locator('.lumi-story-chapters img').count(), 4);
    for (const img of await page.locator('.lumi-story-chapters img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
      assert((await img.evaluate(el => el.naturalWidth)) > 100, 'story image loaded');
    }
    const video = page.locator('video.lumi-story-video');
    await video.scrollIntoViewIfNeeded();
    await video.evaluate(async el => {el.muted=true; await el.play();});
    await page.waitForFunction(() => document.querySelector('video.lumi-story-video')?.currentTime > 0, null, {timeout:10000});
    assert.equal(await video.evaluate(el => el.error), null, 'video plays');
    await video.evaluate(el => el.pause());
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'story has no horizontal overflow');
    await openHome();
    await page.getByRole('button',{name:'ПОСМОТРЕТЬ СЕРТИФИКАТЫ'}).click();
    await page.getByRole('button',{name:'10 000 ₽'}).click();
    await page.getByRole('button',{name:'Графит'}).click();
    await page.getByLabel(/Имя получателя/).fill('Проверка ЛУМИ');
    await page.getByLabel(/Пожелание/).fill('Тёплые слова');
    assert.match(await page.locator('.lumi-gift-card').innerText(), /10\s?000\s?₽/);
    assert.match(await page.locator('.lumi-gift-card').innerText(), /Проверка ЛУМИ/i);
    assert(await page.locator('.lumi-gift-card').evaluate(el => el.classList.contains('theme-dark')));
    await page.getByRole('button',{name:'СОЗДАТЬ ДЕМО-СЕРТИФИКАТ'}).click();
    assert.match(await page.locator('.lumi-gift-result').innerText(), /не оплачивается, не отправляется/);
    assert.match(await page.locator('.lumi-gift-result').innerText(), /Тёплые слова/);
    assert.equal(await page.evaluate(() => JSON.stringify(localStorage).includes('Проверка ЛУМИ') || JSON.stringify(localStorage).includes('Тёплые слова')), false, 'personal gift input is not persisted');
    await page.getByRole('button',{name:'ИЗМЕНИТЬ ОФОРМЛЕНИЕ'}).click();
    await page.getByLabel(/Пожелание/).fill('Я'.repeat(180));
    await page.getByRole('button',{name:'СОЗДАТЬ ДЕМО-СЕРТИФИКАТ'}).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'long unbroken gift message does not overflow');
    await openHome();
    await page.getByRole('button',{name:'ВСЕ ОБРАЗЫ'}).click();
    const look = page.locator('.lumi-look-card').first();
    await look.locator('img').evaluate(el => el.decode());
    const expectedPrice = await look.locator('.lumi-look-meta strong').innerText();
    const expectedDuration = await look.locator('.lumi-look-meta span').innerText();
    await look.getByRole('button',{name:'ВЫБРАТЬ ОБРАЗ'}).click();
    await page.locator('[data-screen="book"]').waitFor();
    assert.match(await page.locator('[data-screen="book"]').innerText(), /Стрижка и укладка/);
    const bookingText = await page.locator('[data-screen="book"]').innerText();
    assert(bookingText.includes(expectedPrice) && bookingText.includes(expectedDuration), `look totals retained in booking: ${expectedPrice}, ${expectedDuration}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'booking has no horizontal overflow');
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width}x${height}: story images/video, gift privacy and look-to-booking totals passed`);
  } finally {await context.close();}
}
(async () => {const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]]) await run(browser,w,h);} finally {await browser.close();}})().catch(e => {console.error(e);process.exitCode=1;});
