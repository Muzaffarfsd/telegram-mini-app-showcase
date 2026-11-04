const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.MURAKA_TEST_URL || 'http://127.0.0.1:53738/';
const ids = ['tee-black','tee-white','tee-red','tee-graphic','jeans-blue','jeans-black','jeans-wide','jeans-grey','jacket-varsity','jacket-patchwork','jacket-bomber','jacket-denim','hoodie-grey','hoodie-black','sneaker-brown','sneaker-white','tee-stripe','tee-olive','jeans-raw','jeans-ecru','jacket-olive','jacket-racing','hoodie-green','sneaker-black'];

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

async function sharedHeader(page, contentSelector) {
  assert.equal(await page.getByTestId('header-brand-mark').count(), 1);
  assert.equal(await page.getByTestId('button-hamburger').count(), 1);
  await page.getByRole('button',{name:'Chat with Alex'}).waitFor();
  assert.equal(await page.locator('.mf-header').count(), 0);
  assert.equal((await page.locator('.w4-topbar').innerText()).includes('MURAKA'), false, 'shared header has no store wordmark');
  for (const inset of [0,54,80]) {
    await page.evaluate(inset => document.documentElement.style.setProperty('--csat', `${inset}px`), inset);
    const positions = await page.evaluate(selector => ({
      header:document.querySelector('.w4-topbar').getBoundingClientRect().bottom,
      content:document.querySelector(selector).getBoundingClientRect().top,
    }), contentSelector);
    assert.ok(positions.content >= positions.header - 1, `Content overlaps shared header: ${JSON.stringify(positions)}`);
  }
  await page.evaluate(() => document.documentElement.style.setProperty('--csat','0px'));
}

async function checkViewport(browser, width, height) {
  const {context,page,errors} = await open(browser,width,height);
  try {
    await page.evaluate(({height}) => {
      document.documentElement.style.setProperty('--tg-viewport-height', `${height - 80}px`);
      document.documentElement.style.setProperty('--tg-viewport-stable-height', `${height}px`);
      document.documentElement.style.setProperty('--csab', '34px');
    }, {height});
    await sharedHeader(page, '.mf-hero-headline');
    const hero = page.locator('.mf-hero-photo img');
    await hero.evaluate(image => image.decode());
    await bottomVisible(page, '.mf-home > .mf-demo-note');
    await page.locator('.mf-nav').getByRole('button',{name:'Каталог'}).tap();
    await sharedHeader(page, '.mf-page-intro');
    assert.equal(await page.locator('[data-testid^="mf-card-"]').count(), 24);
    await bottomVisible(page, '.mf-grid > .mf-card');
    await page.evaluate(height => { document.querySelector('#root').style.setProperty('min-height', `${height + 40}px`, 'important'); }, height);
    await page.waitForFunction(() => {
      const root=document.querySelector('#root'), nav=document.querySelector('.mf-nav');
      return parseFloat(getComputedStyle(root).getPropertyValue('--mf-scroll-clearance')) >= root.getBoundingClientRect().bottom - nav.getBoundingClientRect().top + 23;
    });
    await bottomVisible(page, '.mf-grid > .mf-card');
    await page.evaluate(() => document.querySelector('#root').style.removeProperty('min-height'));
    await page.getByTestId('mf-card-jeans-blue').getByRole('button',{name:/Открыть/}).tap();
    await sharedHeader(page, '.mf-page-back');
    await page.getByRole('button',{name:'В избранное: Джинсы Wide Denim'}).tap();
    assert.equal(await page.getByRole('button',{name:'Убрать из избранного: Джинсы Wide Denim'}).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button',{name:'Назад',exact:true}).tap();
    await page.locator('.mf-catalog').waitFor();
    assert.equal(await page.locator('[data-testid^="mf-card-"]').count(), 24);
    await page.getByTestId('mf-card-jeans-blue').getByRole('button',{name:/Открыть/}).tap();
    const gallery = page.locator('.mf-gallery-main');
    await gallery.evaluate(image => image.decode());
    assert.match(await gallery.getAttribute('src'), /jeans-blue-model\.webp/);
    await page.getByRole('button',{name:'Изделие отдельно'}).tap();
    await gallery.evaluate(image => image.decode());
    assert.match(await gallery.getAttribute('src'), /jeans-blue-product\.webp/);
    await page.getByRole('button',{name:'Образ на модели'}).tap();
    await gallery.evaluate(image => image.decode());
    assert.match(await gallery.getAttribute('src'), /jeans-blue-editorial\.webp/);
    await page.getByRole('button',{name:'Детали изделия'}).tap();
    await gallery.evaluate(image => image.decode());
    assert.match(await gallery.getAttribute('src'), /jeans-blue-detail\.webp/);
    assert.match(await page.locator('.mf-gallery-count').innerText(), /04\s*\/\s*04/);
    if (browser.browserType().name() === 'chromium') {
      await page.locator('.mf-gallery').evaluate(element => {
        const touch = (x,y) => new Touch({identifier:1,target:element,clientX:x,clientY:y});
        element.dispatchEvent(new TouchEvent('touchstart',{touches:[touch(100,140)],changedTouches:[touch(100,140)],bubbles:true}));
        element.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[touch(260,145)],bubbles:true}));
      });
      assert.match(await page.locator('.mf-gallery-count').innerText(), /03\s*\/\s*04/);
    }
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
    console.log(`${browser.browserType().name()} ${width}x${height}: layout, 24 products, four-photo gallery, cart and demo checkout passed`);
  } finally { await context.close(); }
}

async function checkAssets(browser) {
  const {context,page} = await open(browser,390,844);
  try {
    for (const id of ids) for (const kind of ['model','product','editorial','detail']) {
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
    assert.equal(await page.locator('[data-testid^="mf-card-"]').count(), 6);
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
    console.log('96 images, search and favorites persistence passed');
  } finally { await context.close(); }
}

(async()=>{
  const chrome = await chromium.launch({headless:true});
  try { await checkAssets(chrome); await checkViewport(chrome,320,568); await checkViewport(chrome,390,844); } finally { await chrome.close(); }
  const safari = await webkit.launch({headless:true});
  try { await checkViewport(safari,320,568); await checkViewport(safari,430,932); } finally { await safari.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
