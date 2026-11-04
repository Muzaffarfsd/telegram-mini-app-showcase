const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.BUYER_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/?$/, '/');
const type = process.env.BUYER_ENGINE === 'webkit' ? webkit : chromium;
const nav = page => page.locator('.cb-nav');
async function geometry(page) {
  const value = await page.evaluate(() => {
    const bar = document.querySelector('.cb-nav').getBoundingClientRect();
    const buttons = [...document.querySelectorAll('.cb-nav button')].map(el => el.getBoundingClientRect().toJSON());
    const root = document.querySelector('#root').getBoundingClientRect();
    return { viewport:document.documentElement.clientWidth, width:document.documentElement.scrollWidth, height:innerHeight, bar:bar.toJSON(), buttons, root:root.toJSON() };
  });
  assert.ok(value.width <= value.viewport + 1, `horizontal overflow ${JSON.stringify(value)}`);
  assert.ok(value.bar.left >= 0 && value.bar.right <= value.viewport && value.bar.top >= 0 && value.bar.bottom <= value.height, `navigation outside visible viewport ${JSON.stringify(value)}`);
  for (const button of value.buttons) assert.ok(button.width >= 43 && button.height >= 43, `small navigation target ${JSON.stringify(button)}`);
}
async function bottomReachable(page, selector) {
  await page.locator(selector).last().waitFor();
  await page.waitForTimeout(300);
  await page.evaluate(() => {const root=document.querySelector('#root');root.scrollTop=root.scrollHeight;});
  await page.waitForTimeout(600);
  const value=await page.evaluate(sel=>{const target=[...document.querySelectorAll(sel)].at(-1).getBoundingClientRect();const bar=document.querySelector('.cb-nav').getBoundingClientRect();return {target:target.toJSON(),bar:bar.toJSON()};}, selector);
  assert.ok(value.target.bottom <= value.bar.top + 1, `${selector} behind navigation ${JSON.stringify(value)}`);
}
async function test(browser,width) {
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:'ru-RU',reducedMotion:'reduce',serviceWorkers:'block'});
  await context.route('https://telegram.org/js/telegram-web-app.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try {
    await page.goto(`${base}#/demos/china-buyer/app`,{waitUntil:'domcontentloaded'});
    await page.getByTestId('china-buyer').waitFor({timeout:30000});
    await page.locator('.home-ai-surface .alex-fab-breathing').waitFor({state:'visible',timeout:30000});
    assert.equal(await page.locator('.home-ai-surface .alex-fab-breathing').count(),1);
    assert.equal(await nav(page).getByRole('button').count(),4); await geometry(page);
    assert.equal(await page.locator('.cb5-feature img').count(),1);
    assert.equal(await page.locator('.cb5-discover [data-testid^="buyer-item-"]').count(),3);
    await bottomReachable(page,'.cb5-home > .cb-disclaimer');
    await page.getByRole('button',{name:'Как это работает'}).tap();
    assert.equal(await page.locator('.cb-process').count(),1);
    await page.getByRole('button',{name:'Назад',exact:true}).tap();
    await page.getByRole('button',{name:'Поиск и каталог'}).tap();
    const totalItems = await page.locator('[data-testid^="buyer-item-"]').count(); assert.equal(totalItems,21);
    for (const [name,count] of [['Одежда',5],['Обувь',4],['Сумки',6],['Аксессуары',3],['Для дома',3]]) {
      await page.getByRole('button',{name,exact:true}).tap();
      assert.equal(await page.locator('[data-testid^="buyer-item-"]').count(),count, name);
    }
    await page.getByRole('button',{name:'Обувь',exact:true}).tap();
    assert.equal(await page.locator('[data-testid^="buyer-item-"]').count(),4);
    assert.equal(await page.getByTestId('buyer-item-sneaker').count(),1);
    await page.getByRole('button',{name:'Все',exact:true}).tap();
    for (let i=0;i<totalItems;i++) {
      const card=page.locator('.cb-catalog .cb-card__open').nth(i);
      const label=await card.getAttribute('aria-label');
      await card.tap();
      assert.equal(await page.locator('.bpd h1').innerText(), label.replace(/^Открыть /,''));
      const decoded=await page.locator('.bpd-image-button img').evaluate(async image=>{try{await image.decode();return image.naturalWidth>0}catch{return false}});
      assert.equal(decoded,true,`image decode failed: ${label}`);
      await geometry(page);
      await page.getByRole('button',{name:'Назад',exact:true}).tap();
      assert.equal(await page.locator('.cb-catalog .cb-card__open').count(),totalItems);
    }
    const search=page.getByRole('searchbox',{name:'Поиск идей'});await search.fill('жакет');await search.blur();
    assert.equal(await page.locator('[data-testid^="buyer-item-"]').count(),1);
    assert.equal(await page.getByTestId('buyer-item-tailoring').count(),1);
    await page.getByRole('button',{name:'Очистить поиск'}).tap();
    await page.getByRole('button',{name:'В избранное: Структурный жакет'}).tap();
    await page.getByRole('button',{name:'Открыть Структурный жакет'}).tap();
    assert.equal(await page.getByRole('heading',{name:'Структурный жакет'}).isVisible(),true);
    await page.getByRole('button',{name:'Назад',exact:true}).tap();
    assert.equal(await page.locator('[data-testid^="buyer-item-"]').count(),totalItems);
    await page.getByRole('button',{name:'Открыть Структурный жакет'}).tap();
    assert.equal(await page.locator('.bpd-thumbs button').count(),3);
    const mainImage = page.locator('.bpd-image-button img');
    const oldImage = await mainImage.getAttribute('src');
    await page.locator('.bpd-thumbs button').first().tap();
    assert.notEqual(await mainImage.getAttribute('src'),oldImage);
    await page.getByRole('button',{name:'Увеличить изображение Структурный жакет'}).tap();
    assert.equal(await page.getByRole('button',{name:'Уменьшить изображение Структурный жакет'}).getAttribute('aria-pressed'),'true');
    await bottomReachable(page,'.bpd-related');
    await page.getByLabel('Размер или посадка').fill('M');
    await page.getByLabel('Цвет',{exact:true}).fill('чёрный');
    await page.getByLabel('Цвет',{exact:true}).blur();
    await page.getByRole('button',{name:'Найти похожее',exact:true}).first().tap();
    assert.match(await page.locator('#cbw-description').inputValue(),/Структурный жакет/);
    assert.equal(await page.locator('#cbw-size').inputValue(),'M');
    assert.equal(await page.locator('#cbw-color').inputValue(),'чёрный');
    assert.equal(await page.getByRole('button',{name:'Одежда',exact:true}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'Проверить запрос'}).tap();
    assert.equal(await page.getByRole('heading',{name:/Проверьте/}).isVisible(),true);
    await page.getByRole('button',{name:'Сохранить демо-заявку'}).tap();
    assert.equal(await page.getByRole('heading',{name:'Заявка подготовлена'}).isVisible(),true);
    await page.getByRole('button',{name:'Мои заявки'}).tap();
    assert.equal(await page.getByTestId('buyer-item-tailoring').count(),1);
    const details=page.locator('.cbw-history__item');await details.locator('summary').tap();
    assert.match(await details.textContent(),/Структурный жакет/);
    await page.reload(); await page.getByTestId('china-buyer').waitFor(); await nav(page).getByRole('button',{name:'Профиль'}).tap();
    assert.equal(await page.getByTestId('buyer-item-tailoring').count(),1);
    assert.equal(await page.locator('.cbw-history__item').count(),1);
    await bottomReachable(page,'.cb-profile > .cb-link');
    await geometry(page);
    assert.deepEqual(errors,[]);
    console.log(`PASS ${type.name()} ${width}px: route, nav, catalog, search, favorite, back, request and persistence`);
  } finally {await context.close();}
}
async function telegram(browser){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();
  await context.route('https://telegram.org/js/telegram-web-app.js',r=>r.fulfill({contentType:'text/javascript',body:''}));
  await page.goto(`${base}#/demos/china-buyer/app`,{waitUntil:'domcontentloaded'});await page.getByTestId('china-buyer').waitFor();
  await page.evaluate(()=>{document.documentElement.style.setProperty('--tg-viewport-height','764px');document.documentElement.style.setProperty('--sab','34px');document.documentElement.style.setProperty('--csab','50px');});
  await geometry(page);await bottomReachable(page,'.cb5-home > .cb-disclaimer');
  const bar=await nav(page).boundingBox();assert.ok(bar.y + bar.height <= 764,`telegram navigation too low ${JSON.stringify(bar)}`);
  await context.close();console.log(`PASS ${type.name()} Telegram viewport 764px and safe area`);
}
async function images(browser) { const context=await browser.newContext(); try { for (const file of ['hero','bags','shoes','sourcing','city','fashion','product-blazer','product-bag','product-sneaker','product-accessory','product-home','v2-dragon-ink','v2-objects-story','v2-buyer-work','v2-coat','v2-knit','v2-bag-sculpted','v2-bag-burgundy','v2-boots','v2-slingbacks','v2-scarf','v2-earrings','v2-teaware','v2-lamp','v2-bag-angle','v2-bag-held','v2-bag-detail','v2-blazer-angle','v2-blazer-detail','v2-blazer-model','v2-sneaker-angle','v2-sneaker-detail','v2-sneaker-top','v2-bag-burgundy-angle','v2-bag-burgundy-model','v2-bag-burgundy-detail']) { const response=await context.request.get(`${base}china-buyer/${file}.webp`); assert.equal(response.status(),200,file); assert.match(response.headers()['content-type'] || '',/image\/webp/,file); assert.ok((await response.body()).length>1000,file); } console.log(`PASS ${type.name()} all 36 generated images`); } finally { await context.close(); } }
(async()=>{const browser=await type.launch({headless:true});try{for(const width of [320,390,430])await test(browser,width);await telegram(browser);await images(browser)}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
