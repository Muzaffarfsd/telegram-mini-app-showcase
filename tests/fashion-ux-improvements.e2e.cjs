const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.MURAKA_TEST_URL || 'http://127.0.0.1:53738/';
const card = page => page.locator('[data-testid^="mf-card-"]');
const rootScroll = page => page.locator('#root').evaluate(element => element.scrollTop);
const nav = page => page.locator('.mf-nav');

async function open(browser, width, height) {
  const context = await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce',locale:'ru-RU',serviceWorkers:'block'});
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript',body:''}));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}#/demos/muraka-fashion/app`, {waitUntil:'domcontentloaded'});
  await page.getByTestId('muraka-fashion').waitFor({timeout:30000});
  return {context,page,errors};
}

async function targetAtLeast(locator, min = 44) {
  const box = await locator.boundingBox();
  assert.ok(box && box.width >= min - 0.5 && box.height >= min - 0.5,
    `Target smaller than ${min}px: ${JSON.stringify(box)}`);
}

async function verifyFilters(page) {
  await nav(page).getByRole('button',{name:'Каталог'}).tap();
  assert.equal(await card(page).count(),24);
  await targetAtLeast(page.getByRole('button',{name:'Фильтры',exact:true}));
  await page.getByRole('button',{name:'Фильтры',exact:true}).tap();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('button',{name:'Размер одежды M'}).tap();
  await dialog.getByRole('button',{name:'До 10 000 ₽',exact:true}).tap();
  await dialog.getByRole('button',{name:'Чёрный',exact:true}).tap();
  await dialog.getByRole('button',{name:'ПОКАЗАТЬ ТОВАРЫ'}).tap();
  await dialog.waitFor({state:'hidden'});
  assert.equal(await card(page).count(),2, 'Size, price and color filters should combine, including multi-color products');
  assert.equal(await page.getByTestId('mf-card-tee-black').count(),1);
  assert.equal(await page.getByRole('button',{name:'Убрать фильтр размера M'}).count(),1);
  assert.equal(await page.getByRole('button',{name:'Убрать фильтр цвета Чёрный'}).count(),1);
  assert.equal(await page.getByRole('button',{name:'Убрать фильтр цены'}).count(),1);

  // Changing a draft and closing the sheet must not silently apply it.
  await page.getByRole('button',{name:/Фильтры/}).tap();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button',{name:'Размер обуви 42'}).tap();
  await dialog.getByRole('button',{name:'Закрыть'}).tap();
  await dialog.waitFor({state:'hidden'});
  assert.equal(await page.getByTestId('mf-card-tee-black').count(),1);
  assert.equal(await page.getByRole('button',{name:'Убрать фильтр размера M'}).count(),1);
  await page.getByRole('button',{name:'Убрать фильтр цвета Чёрный'}).tap();
  assert.ok(await card(page).count() > 1, 'Removing one filter should broaden results');
  assert.equal(await page.getByTestId('mf-card-tee-white').count(),1);
  await page.getByRole('button',{name:'Сбросить',exact:true}).tap();
  assert.equal(await card(page).count(),24, 'Clear applied filters should restore all products');

  await page.getByRole('button',{name:'Фильтры',exact:true}).tap();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button',{name:'Размер обуви 42'}).tap();
  await dialog.getByRole('button',{name:'10 000–20 000 ₽',exact:true}).tap();
  await dialog.getByRole('button',{name:'Белый',exact:true}).tap();
  await dialog.getByRole('button',{name:'ПОКАЗАТЬ ТОВАРЫ'}).tap();
  await dialog.waitFor({state:'hidden'});
  assert.equal(await card(page).count(),3, 'A color filter should match each component of multi-color products');
  assert.equal(await page.getByTestId('mf-card-sneaker-white').count(),1);
  await page.getByRole('button',{name:/Фильтры/}).tap();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button',{name:'СБРОСИТЬ ФИЛЬТРЫ'}).tap();
  await dialog.getByRole('button',{name:'ПОКАЗАТЬ ТОВАРЫ'}).tap();
  await dialog.waitFor({state:'hidden'});
  assert.equal(await card(page).count(),24, 'Reset inside sheet should clear all filter dimensions');
}

async function verifyCatalogReturn(page) {
  await page.getByRole('combobox',{name:'Сортировка'}).selectOption('price-up');
  const target = card(page).last().getByRole('button',{name:/Открыть/});
  await target.scrollIntoViewIfNeeded();
  const before = await rootScroll(page);
  assert.ok(before > 500, `Test must start deep in the catalog, got ${before}`);
  await target.tap();
  await page.locator('.mf-product').waitFor();
  await page.getByRole('button',{name:'Назад',exact:true}).tap();
  await page.locator('.mf-catalog').waitFor();
  await page.waitForTimeout(300);
  const after = await rootScroll(page);
  assert.ok(Math.abs(before - after) <= 3, `Catalog position was lost: before=${before}, after=${after}`);
  assert.equal(await page.getByRole('combobox',{name:'Сортировка'}).inputValue(),'price-up');
}

async function verifyErrorsAndTargets(page) {
  const item = page.getByTestId('mf-card-jeans-blue').getByRole('button',{name:/Открыть/});
  await item.scrollIntoViewIfNeeded(); await item.tap();
  await page.locator('.mf-gallery').waitFor();
  await targetAtLeast(page.locator('.mf-gallery-thumbs button').first());
  await targetAtLeast(page.getByRole('button',{name:'M',exact:true}));
  await page.getByRole('button',{name:/ДОБАВИТЬ В КОРЗИНУ/}).tap();
  assert.match(await page.getByRole('alert').innerText(),/размер/i);
  await page.getByRole('button',{name:'M',exact:true}).tap();
  await page.getByRole('button',{name:/ДОБАВИТЬ В КОРЗИНУ/}).tap();
  const cart = page.getByRole('dialog');
  await targetAtLeast(cart.getByRole('button',{name:/Увеличить количество/}));
  await targetAtLeast(cart.getByRole('button',{name:/Уменьшить количество/}));
  await cart.getByRole('button',{name:/ОФОРМИТЬ ДЕМО-ЗАКАЗ/}).tap();
  await page.getByRole('button',{name:/ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/}).tap();
  const name = page.getByLabel('Имя',{exact:true});
  const phone = page.getByLabel('Телефон',{exact:true});
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Имя');
  assert.equal(await name.getAttribute('aria-invalid'),'true');
  assert.equal(await name.getAttribute('aria-describedby'),'mf-name-error');
  assert.equal(await phone.getAttribute('aria-invalid'),'true');
  assert.equal(await phone.getAttribute('aria-describedby'),'mf-phone-error');
  assert.ok(await page.locator('#mf-name-error').isVisible());
  assert.ok(await page.locator('#mf-phone-error').isVisible());
  const geometry = await name.evaluate(element => {
    const rect = element.getBoundingClientRect(), header = document.querySelector('.w4-topbar').getBoundingClientRect(), nav = document.querySelector('.mf-nav').getBoundingClientRect();
    return {top:rect.top,bottom:rect.bottom,headerBottom:header.bottom,navTop:nav.top};
  });
  assert.ok(geometry.top >= geometry.headerBottom && geometry.bottom <= geometry.navTop,
    `Focused field is obscured by fixed UI: ${JSON.stringify(geometry)}`);
  await name.fill('Тест');
  await page.getByRole('button',{name:/ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/}).tap();
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Телефон');
  await phone.fill('9001234567');
  await page.getByRole('button',{name:/Курьером/}).tap();
  await page.getByRole('button',{name:/ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/}).tap();
  const address = page.getByLabel('Адрес доставки',{exact:true});
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Адрес доставки');
  assert.equal(await address.getAttribute('aria-invalid'),'true');
  assert.equal(await address.getAttribute('aria-describedby'),'mf-address-error');
}

async function run(browser,width,height) {
  const {context,page,errors} = await open(browser,width,height);
  try {
    await verifyFilters(page);
    await verifyCatalogReturn(page);
    await verifyErrorsAndTargets(page);
    assert.deepEqual(errors,[]);
    console.log(`${browser.browserType().name()} ${width}x${height}: filters, catalog position, form feedback and touch targets passed`);
  } finally { await context.close(); }
}

(async()=>{
  const chrome = await chromium.launch({headless:true});
  try { await run(chrome,320,568); await run(chrome,390,844); } finally { await chrome.close(); }
  const safari = await webkit.launch({headless:true});
  try { await run(safari,320,568); } finally { await safari.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });

