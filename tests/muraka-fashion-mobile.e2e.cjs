const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.MURAKA_TEST_URL || 'http://127.0.0.1:53738/';
const ids = ['tee-black','tee-white','tee-red','tee-graphic','jeans-blue','jeans-black','jeans-wide','jeans-grey','jacket-varsity','jacket-patchwork','jacket-bomber','jacket-denim','hoodie-grey','hoodie-black','sneaker-brown','sneaker-white'];

async function open(browser, width, height) {
  const context = await browser.newContext({viewport:{width,height}, isMobile:true, hasTouch:true, reducedMotion:'reduce', locale:'ru-RU', serviceWorkers:'block'});
  await context.addInitScript(() => localStorage.setItem('app-language','ru'));
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript',body:''}));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}#/demos/muraka-fashion/app`, {waitUntil:'domcontentloaded'});
  await page.getByTestId('muraka-fashion').waitFor({timeout:30000});
  return {context,page,errors};
}

async function bottomVisible(page, selector) {
  await page.locator(selector).last().waitFor();
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.evaluate(() => {const root = document.querySelector('#root'); root.scrollTop = root.scrollHeight;});
  await page.waitForTimeout(500);
  const pos = await page.evaluate(selector => ({
    end: [...document.querySelectorAll(selector)].at(-1).getBoundingClientRect().bottom,
    nav: document.querySelector('.mf-nav').getBoundingClientRect().top,
  }), selector);
  assert.ok(pos.end <= pos.nav + 1, `Content is hidden by navigation: ${selector} ${JSON.stringify(pos)}`);
}

async function checkViewport(browser, width, height) {
  const {context,page,errors} = await open(browser,width,height);
  try {
    await page.evaluate(({height}) => {
      document.documentElement.style.setProperty('--tg-viewport-height', `${height - 80}px`);
      document.documentElement.style.setProperty('--tg-viewport-stable-height', `${height}px`);
      document.documentElement.style.setProperty('--csab', '34px');
    }, {height});
    const hero = page.locator('.mf-hero-photo img');
    await hero.evaluate(image => image.decode());
    await bottomVisible(page, '.mf-home > .mf-demo-note');
    await page.locator('.mf-nav').getByRole('button',{name:'Каталог'}).tap();
    assert.equal(await page.locator('[data-testid^="mf-card-"]').count(), 16);
    await bottomVisible(page, '.mf-grid > .mf-card');
    await page.evaluate(height => { document.querySelector('#root').style.setProperty('min-height', `${height + 40}px`, 'important'); }, height);
    await page.waitForFunction(() => {
      const root=document.querySelector('#root'), nav=document.querySelector('.mf-nav');
      return parseFloat(getComputedStyle(root).getPropertyValue('--mf-scroll-clearance')) >= root.getBoundingClientRect().bottom - nav.getBoundingClientRect().top + 23;
    });
    await bottomVisible(page, '.mf-grid > .mf-card');
    await page.evaluate(() => document.querySelector('#root').style.removeProperty('min-height'));
    await page.getByTestId('mf-card-jeans-blue').getByRole('button',{name:/Открыть/}).tap();
    const gallery = page.locator('.mf-gallery-main');
    await gallery.evaluate(image => image.decode());
    assert.match(await gallery.getAttribute('src'), /jeans-blue-model\.webp/);
    await page.getByRole('button',{name:'Изделие отдельно'}).tap();
    await gallery.evaluate(image => image.decode());
    assert.match(await gallery.getAttribute('src'), /jeans-blue-product\.webp/);
    await page.getByRole('button',{name:/ДОБАВИТЬ В КОРЗИНУ/}).tap();
    assert.match(await page.getByRole('alert').innerText(), /размер/i);
    await page.getByRole('button',{name:'M',exact:true}).tap();
    await page.getByRole('button',{name:/ДОБАВИТЬ В КОРЗИНУ/}).tap();
    const dialog = page.getByRole('dialog');
    assert.ok(await dialog.getByText('Размер M').isVisible());
    await dialog.getByRole('button',{name:/ОФОРМИТЬ ДЕМО-ЗАКАЗ/}).tap();
    await page.getByRole('button',{name:/ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/}).tap();
    assert.ok(await page.getByText('Укажи имя.').isVisible());
    await page.getByLabel('Имя').fill('Тест');
    await page.getByLabel('Телефон').fill('9001234567');
    await page.getByRole('button',{name:/ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/}).tap();
    assert.ok(await page.getByRole('heading',{name:/ЗАКАЗ.*ОФОРМЛЕН/s}).isVisible());
    assert.ok(!(await page.evaluate(() => localStorage.getItem('muraka-fashion-demo-v1'))).includes('9001234567'));
    assert.deepEqual(errors, []);
    console.log(`${browser.browserType().name()} ${width}x${height}: layout, 16 products, gallery, cart and demo checkout passed`);
  } finally { await context.close(); }
}

async function checkAssets(browser) {
  const {context,page} = await open(browser,390,844);
  try {
    for (const id of ids) for (const kind of ['model','product']) {
      const response = await context.request.get(`${base}muraka-fashion/${id}-${kind}.webp`);
      assert.equal(response.status(), 200, `${id}-${kind} HTTP status`);
      assert.match(response.headers()['content-type'] || '', /image\/webp/, `${id}-${kind} image format`);
    }
    const revisedShoe = await context.request.get(`${base}muraka-fashion/sneaker-brown-model-v2.webp`);
    assert.equal(revisedShoe.status(), 200, 'corrected brown sneaker image');
    const revisedGraphic = await context.request.get(`${base}muraka-fashion/tee-graphic-model-v2.webp`);
    assert.equal(revisedGraphic.status(), 200, 'corrected graphic T-shirt image');
    await page.locator('.mf-nav').getByRole('button',{name:'Каталог'}).tap();
    await page.getByRole('searchbox',{name:'Поиск по коллекции'}).fill('Джинсы');
    assert.equal(await page.locator('[data-testid^="mf-card-"]').count(), 4);
    await page.getByRole('searchbox',{name:'Поиск по коллекции'}).fill('');
    await page.getByTestId('mf-card-jeans-blue').getByRole('button',{name:/Открыть/}).tap();
    await page.getByRole('button',{name:'Написать отзыв'}).tap();
    await page.getByRole('button',{name:'Оценка 5 из 5'}).tap();
    await page.getByLabel('Имя',{exact:true}).fill('Покупатель');
    await page.getByLabel('Твой отзыв').fill('Отличная посадка и красивая ткань.');
    await page.getByRole('button',{name:'СОХРАНИТЬ ОТЗЫВ'}).tap();
    assert.ok(await page.getByText('Отличная посадка и красивая ткань.').isVisible());
    await page.reload();
    await page.getByTestId('muraka-fashion').waitFor();
    await page.locator('.mf-nav').getByRole('button',{name:'Каталог'}).tap();
    await page.getByTestId('mf-card-jeans-blue').getByRole('button',{name:/Открыть/}).tap();
    assert.ok(await page.getByText('Отличная посадка и красивая ткань.').isVisible());
    await page.locator('.mf-nav').getByRole('button',{name:'Каталог'}).tap();
    await page.getByTestId('mf-card-tee-black').getByRole('button',{name:/В избранное/}).tap();
    await page.locator('.mf-nav').getByRole('button',{name:'Профиль'}).tap();
    assert.equal(await page.locator('[data-testid^="mf-card-"]').count(), 1);
    await page.reload();
    await page.getByTestId('muraka-fashion').waitFor();
    await page.locator('.mf-nav').getByRole('button',{name:'Профиль'}).tap();
    assert.equal(await page.locator('[data-testid^="mf-card-"]').count(), 1);
    console.log('32 images, search and favorites persistence passed');
  } finally { await context.close(); }
}

(async()=>{
  const chrome = await chromium.launch({headless:true});
  try { await checkAssets(chrome); await checkViewport(chrome,320,568); await checkViewport(chrome,390,844); } finally { await chrome.close(); }
  const safari = await webkit.launch({headless:true});
  try { await checkViewport(safari,320,568); await checkViewport(safari,430,932); } finally { await safari.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
