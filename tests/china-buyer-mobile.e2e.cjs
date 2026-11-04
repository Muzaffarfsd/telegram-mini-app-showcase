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
    assert.equal(await page.locator('.cb-home__collage-side img').count(),3);
    assert.equal(await page.locator('.cb-home__collage-main img').count(),1);
    await bottomReachable(page,'.cb-home > .cb-disclaimer');
    await nav(page).getByRole('button',{name:'Каталог'}).tap();
    const totalItems = await page.locator('[data-testid^="buyer-item-"]').count(); assert.ok(totalItems >= 6);
    await page.getByRole('button',{name:'Обувь',exact:true}).tap();
    assert.ok((await page.locator('[data-testid^="buyer-item-"]').count()) >= 1);
    assert.equal(await page.getByTestId('buyer-item-sneaker').count(),1);
    await page.getByRole('button',{name:'Все',exact:true}).tap();
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
    await page.getByRole('button',{name:'Найти похожее'}).tap();
    assert.match(await page.locator('#cbw-description').inputValue(),/Структурный жакет/);
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
    await bottomReachable(page,'.cb-profile > .cb-disclaimer');
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
  await geometry(page);await bottomReachable(page,'.cb-home > .cb-disclaimer');
  const bar=await nav(page).boundingBox();assert.ok(bar.y + bar.height <= 764,`telegram navigation too low ${JSON.stringify(bar)}`);
  await context.close();console.log(`PASS ${type.name()} Telegram viewport 764px and safe area`);
}
async function images(browser) { const context=await browser.newContext(); try { for (const file of ['hero','bags','shoes','sourcing','city','fashion','product-blazer','product-bag','product-sneaker','product-accessory','product-home']) { const response=await context.request.get(`${base}china-buyer/${file}.webp`); assert.equal(response.status(),200,file); assert.match(response.headers()['content-type'] || '',/image\/webp/,file); assert.ok((await response.body()).length>1000,file); } console.log(`PASS ${type.name()} all 11 generated images`); } finally { await context.close(); } }
(async()=>{const browser=await type.launch({headless:true});try{for(const width of [320,390,430])await test(browser,width);await telegram(browser);await images(browser)}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
