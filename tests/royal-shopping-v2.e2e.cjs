const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.ROYAL_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/?$/, '/');
const route = `${base}#/demos/nike-sneakers/app`;
const norm = s => s.replace(/[\s\u00a0\u202f]+/g, ' ').trim();

async function appPage(browser,width) {
  const context = await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,locale:'ru-RU',reducedMotion:'reduce',serviceWorkers:'block'});
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript',body:''}));
  const page = await context.newPage(); const errors=[];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(route,{waitUntil:'domcontentloaded'}); await page.getByTestId('royal-step').waitFor({timeout:30000});
  return {page,context,errors};
}
async function openFirst(page) {
  await page.locator('.rs-nav').getByRole('button',{name:'Каталог'}).click();
  await page.getByRole('button',{name:"Открыть Nike Air Force 1 '07"}).first().click();
  await page.locator('.rs-photo-main img').waitFor();
}
async function checkWidth(page) {
  const sizes = await page.evaluate(() => ({view:document.documentElement.clientWidth,doc:document.documentElement.scrollWidth}));
  assert.ok(sizes.doc <= sizes.view + 1, `horizontal overflow ${JSON.stringify(sizes)}`);
}
async function run(browser,width) {
  const {page,context,errors} = await appPage(browser,width);
  try {
    await openFirst(page); await checkWidth(page);
    assert.equal(await page.locator('.rs-photo-thumbs button').count(),3);
    await page.getByRole('button',{name:'Показать фотографию 3 из 4'}).click();
    assert.match(await page.locator('.rs-photo-main img').getAttribute('src'),/airforce-3\.webp$/);
    await page.locator('.rs-photo-main').click();
    assert.match(await page.locator('.rs-zoom img').getAttribute('src'),/airforce-3\.webp$/);
    await page.getByRole('button',{name:'Следующая →'}).click();
    assert.match(await page.locator('.rs-zoom img').getAttribute('src'),/airforce-4\.webp$/);
    assert.equal(await page.getByRole('button',{name:'Следующая →'}).isDisabled(),true);
    await page.getByRole('dialog').getByRole('button',{name:'Закрыть'}).click();
    assert.equal(await page.locator('.rs-photo-thumbs button').count(),3);
    await page.getByRole('button',{name:'Гид по размеру ↗'}).click();
    assert.equal(await page.locator('.rs-size-guide').evaluate(el => el.open),true);
    assert.match(norm(await page.locator('.rs-size-guide__table').innerText()),/38 23,3/);
    await page.getByRole('button',{name:'Женская',exact:true}).click();
    assert.match(norm(await page.locator('.rs-size-guide__table').innerText()),/38 23,7/);
    await page.locator('#rs-preferred-size').selectOption('42');
    await page.getByRole('button',{name:'Сохранить',exact:true}).click();
    assert.match(await page.locator('.rs-size-guide [role=status]').innerText(),/Размер сохранён/);
    await page.reload(); await page.getByTestId('royal-step').waitFor(); await openFirst(page);
    assert.equal(await page.locator('.rs-size-grid button').filter({hasText:/^42$/}).getAttribute('aria-pressed'),'true');
    await page.getByRole('button',{name:'Добавить в корзину'}).click();
    await page.getByRole('dialog').getByLabel("Изменить размер Nike Air Force 1 '07").selectOption('43');
    assert.match(await page.getByRole('dialog').getByRole('status').innerText(),/Размер изменён/);
    await page.getByRole('dialog').getByRole('button',{name:'Оформить демо-заказ'}).click();
    await page.getByRole('button',{name:'Подставить пример данных'}).click();
    await page.getByRole('button',{name:'Подтвердить демо-заказ'}).click();
    await page.getByRole('heading',{name:'Демо-заказ оформлен'}).waitFor();
    await page.getByRole('button',{name:'Посмотреть историю'}).click();
    const order = page.locator('.rs-order-history__order').first(); await order.locator('summary').click();
    assert.match(norm(await order.innerText()),/43 EU · 1 шт/); assert.match(norm(await order.innerText()),/При заказе/);
    await order.getByRole('button',{name:'Повторить в корзине'}).click();
    assert.equal(await page.getByRole('dialog').getByLabel("Изменить размер Nike Air Force 1 '07").inputValue(),'43');
    assert.match(await page.getByRole('dialog').getByRole('status').innerText(),/Добавлено пар: 1/);
    await checkWidth(page); assert.deepEqual(errors,[]);
    console.log(`PASS ${width}px: gallery, zoom, size chart/persistence, cart change, checkout, history and repeat`);
  } finally { await context.close(); }
}
async function limit(browser,width) {
  const {page,context,errors} = await appPage(browser,width);
  try {
    await page.evaluate(()=>localStorage.setItem('royal-step-demo-v1',JSON.stringify({cart:[{id:'airforce',size:40,quantity:6},{id:'airforce',size:41,quantity:5}],favorites:[],orders:[],reviews:[]})));
    await page.reload(); await page.getByTestId('royal-step').waitFor();
    await page.locator('.rs-nav').getByRole('button',{name:/Корзина/}).click();
    const dialog = page.getByRole('dialog'); const selectors=dialog.getByLabel("Изменить размер Nike Air Force 1 '07");
    assert.equal(await selectors.count(),2); await selectors.first().selectOption('41');
    assert.match(await dialog.getByRole('status').innerText(),/не более 10/);
    assert.deepEqual(await selectors.evaluateAll(els => els.map(e => e.value)),['40','41']);
    const stored = await page.evaluate(()=>JSON.parse(localStorage.getItem('royal-step-demo-v1')));
    assert.deepEqual(stored.cart.map(v=>v.quantity),[6,5]); assert.deepEqual(errors,[]);
    console.log(`PASS ${width}px: size merge limit preserves both cart lines`);
  } finally { await context.close(); }
}
(async()=>{const browser=await chromium.launch({headless:true}); try {for(const width of [320,390,430]) {await run(browser,width); await limit(browser,width);}} finally {await browser.close();}})().catch(err=>{console.error(err);process.exitCode=1});
