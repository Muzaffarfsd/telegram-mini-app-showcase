const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.ROYAL_TEST_URL || 'http://127.0.0.1:53738/';
const ids = ['airforce','dunk','vomero','airmax','p6000','cortez','airmax90','shox','v2k','airmax97','airmax1','airmaxplus','pegasus','killshot','v5rnr','jordan'];
const normal = text => text.replace(/[\s\u00a0\u202f]+/g, ' ').trim();
const nav = page => page.locator('.rs-nav');

async function contextFor(browser, width, height) {
  const context = await browser.newContext({ viewport:{width,height}, isMobile:true, hasTouch:true, locale:'ru-RU', reducedMotion:'reduce', serviceWorkers:'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript',body:''}));
  const page = await context.newPage();
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  return {context,page,errors};
}

async function assertLayout(page) {
  const geometry = await page.evaluate(() => ({ viewport:document.documentElement.clientWidth, width:document.documentElement.scrollWidth, nav:document.querySelector('.rs-nav').getBoundingClientRect().toJSON(), height:innerHeight }));
  assert.ok(geometry.width <= geometry.viewport + 1, `Horizontal overflow: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.nav.top >= 0 && geometry.nav.bottom <= geometry.height, `Navigation outside viewport: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.nav.left >= 0 && geometry.nav.right <= geometry.viewport, `Navigation outside horizontal viewport: ${JSON.stringify(geometry)}`);
}

async function runFull(browser) {
  const {context,page,errors} = await contextFor(browser,390,844);
  try {
    await page.goto(base, {waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:'Кроссовки',exact:true}).tap({timeout:30000});
    await page.getByTestId('home-open-demo').tap();
    await page.getByTestId('royal-step').waitFor({timeout:30000});
    assert.match(page.url(),/#\/demos\/nike-sneakers\/app/);
    await page.goto(`${base}#/projects`, {waitUntil:'domcontentloaded'});
    await page.getByTestId('card-app-nike-sneakers').tap({timeout:30000});
    await page.getByTestId('royal-step').waitFor({timeout:30000});
    await page.getByRole('heading',{name:/Кроссовки/}).waitFor({timeout:10000});
    assert.equal(await page.getByTestId('header-brand-mark').isVisible(), true);
    assert.equal(await page.getByTestId('button-hamburger').isVisible(), true);
    await assertLayout(page);
    await page.getByRole('button',{name:'Смотреть коллекцию'}).tap();
    assert.equal(await page.locator('[data-testid^="royal-card-"]').count(),16);
    assert.match(await page.locator('.rs-catalog__bar').innerText(),/16 моделей/);

    await page.getByRole('searchbox',{name:'Поиск моделей'}).fill('Vomero');
    assert.equal(await page.locator('[data-testid^="royal-card-"]').count(),1);
    assert.match(await page.locator('.rs-grid').innerText(),/Vomero 5/);
    await page.getByRole('searchbox',{name:'Поиск моделей'}).fill('ничего123');
    assert.equal(await page.getByText('Ничего не найдено').isVisible(),true);
    await page.getByRole('button',{name:'Сбросить фильтры'}).tap();
    await page.getByRole('button',{name:'Фильтры'}).tap();
    await page.getByRole('dialog').getByRole('button',{name:'Классика'}).tap();
    await page.getByRole('dialog').getByRole('button',{name:'39',exact:true}).tap();
    await page.getByRole('button',{name:'Показать модели'}).tap();
    assert.ok((await page.locator('[data-testid^="royal-card-"]').count()) >= 4);
    await page.getByRole('button',{name:'Фильтры'}).tap();
    await page.getByRole('dialog').getByRole('button',{name:'Сбросить'}).tap();
    await page.getByRole('button',{name:'Показать модели'}).tap();
    assert.equal(await page.locator('[data-testid^="royal-card-"]').count(),16);
    await page.getByRole('combobox',{name:'Сортировка'}).selectOption('price-up');
    assert.match(await page.locator('[data-testid^="royal-card-"]').first().innerText(),/Cortez/);
    await page.getByRole('combobox',{name:'Сортировка'}).selectOption('default');

    await page.getByRole('button',{name:"В избранное: Nike Air Force 1 '07"}).tap();
    await page.getByRole('button',{name:"Открыть Nike Air Force 1 '07"}).tap();
    assert.equal(await page.getByRole('heading',{name:"Nike Air Force 1 '07"}).isVisible(),true);
    await page.getByRole('button',{name:'Добавить в корзину'}).tap();
    assert.match(await page.getByRole('alert').innerText(),/Выберите размер/);
    for (let index=1; index<=4; index++) {
      await page.getByRole('button',{name:`Фотография ${index} из 4`}).tap();
      const photo=page.locator('.rs-product__photo img');
      await page.waitForFunction(expected => { const image=document.querySelector('.rs-product__photo img'); return image && image.complete && image.naturalWidth > 0 && image.src.includes(expected); }, `airforce-${index}.webp`);
      assert.match(await photo.getAttribute('src'),new RegExp(`airforce-${index}\\.webp`));
    }
    await page.getByRole('button',{name:'Фотография 1 из 4'}).tap();
    await page.locator('.rs-product__photo').evaluate(element => {
      const make=(x,y)=>new Touch({identifier:1,target:element,clientX:x,clientY:y});
      element.dispatchEvent(new TouchEvent('touchstart',{touches:[make(300,150)],changedTouches:[make(300,150)],bubbles:true}));
      element.dispatchEvent(new TouchEvent('touchend',{touches:[],changedTouches:[make(120,150)],bubbles:true}));
    });
    assert.match(await page.locator('.rs-product__photo img').getAttribute('src'),/airforce-2\.webp/);
    assert.equal(await page.getByText('Пример отзыва',{exact:true}).isVisible(),true);
    await page.getByRole('button',{name:'Написать отзыв'}).tap();
    await page.getByRole('button',{name:'Сохранить отзыв'}).tap();
    assert.match(await page.locator('.rs-review-form').getByRole('alert').textContent(),/Выберите оценку/);
    await page.getByRole('button',{name:'Оценка 5 из 5'}).tap();
    await page.getByLabel('Имя',{exact:true}).fill('Тест');
    await page.getByLabel('Ваш отзыв').fill('Нравятся форма и светлый цвет этой модели.');
    await page.getByRole('button',{name:'Сохранить отзыв'}).tap();
    assert.equal(await page.getByText('Нравятся форма и светлый цвет этой модели.').isVisible(),true);
    await page.getByRole('button',{name:'42',exact:true}).tap();
    await page.getByRole('button',{name:'Добавить в корзину'}).tap();
    let dialog=page.getByRole('dialog');
    assert.equal(await dialog.getByText('Размер 42 EU').isVisible(),true);
    await dialog.getByRole('button',{name:"Увеличить количество Nike Air Force 1 '07, размер 42"}).tap();
    assert.match(normal(await dialog.textContent()),/29 800 ₽/);
    await page.reload();
    await page.getByTestId('royal-step').waitFor();
    await nav(page).getByRole('button',{name:/Корзина, товаров: 2/}).tap();
    dialog=page.getByRole('dialog');
    await dialog.getByText('Размер 42 EU').waitFor();
    assert.match(normal(await dialog.textContent()),/29 800 ₽/);
    await dialog.getByRole('button',{name:'Оформить демо-заказ'}).tap();
    await page.getByRole('button',{name:'Подтвердить демо-заказ'}).tap();
    assert.equal(await page.getByText('Укажите имя.').isVisible(),true);
    assert.equal(await page.getByText('Укажите номер телефона.').isVisible(),true);
    await page.getByRole('button',{name:'Подставить пример данных'}).tap();
    await page.getByRole('button',{name:/Курьером/}).tap();
    assert.match(normal(await page.locator('.rs-summary').textContent()),/30 190 ₽/);
    await page.getByRole('button',{name:'Подтвердить демо-заказ'}).tap();
    assert.equal(await page.getByRole('heading',{name:'Демо-заказ оформлен'}).isVisible(),true);
    assert.match(normal(await page.locator('.rs-success__order').textContent()),/30 190 ₽/);
    const stored=await page.evaluate(() => localStorage.getItem('royal-step-demo-v1'));
    assert.ok(!stored.includes('900 123') && !stored.includes('Примерная') && !stored.includes('Тестовый покупатель'));
    await page.getByRole('button',{name:'Посмотреть историю'}).tap();
    assert.match(await page.locator('.rs-order-list').textContent(),/DEMO-/);
    assert.equal(await page.locator('[data-testid^="royal-card-"]').count(),1);
    await page.reload(); await page.getByTestId('royal-step').waitFor();
    try { await nav(page).getByRole('button',{name:'Профиль'}).tap({timeout:10000}); } catch (error) { console.log('NAV DEBUG',await page.evaluate(() => ({nav:document.querySelector('.rs-nav')?.getBoundingClientRect().toJSON(), root:document.querySelector('#root')?.getBoundingClientRect().toJSON(), vv:window.visualViewport && {height:visualViewport.height,offsetTop:visualViewport.offsetTop}, windowY:scrollY, innerHeight}))); throw error; }
    assert.match(await page.locator('.rs-order-list').textContent(),/DEMO-/);
    assert.equal(await page.locator('[data-testid^="royal-card-"]').count(),1);
    await nav(page).getByRole('button',{name:/Корзина, товаров: 0/}).tap();
    assert.equal(await page.getByText('Пока пусто').isVisible(),true);
    await page.getByRole('button',{name:'Перейти в каталог'}).tap();
    await assertLayout(page);

    for (const id of ids) {
      await page.getByTestId(`royal-card-${id}`).getByRole('button',{name:/Открыть/}).tap();
      await page.locator('.rs-photo-thumbs').waitFor();
      assert.equal(await page.locator('.rs-photo-thumbs button').count(),4,`${id}: 4 photographs`);
      assert.equal(await page.getByText('Пример отзыва',{exact:true}).isVisible(),true,`${id}: example review`);
      assert.ok((await page.locator('.rs-related__row small').count()) >= 1,`${id}: related prices`);
      if (id === 'airforce') assert.equal(await page.getByText('Нравятся форма и светлый цвет этой модели.').isVisible(),true);
      if (id === 'dunk') assert.equal(await page.getByText('Нравятся форма и светлый цвет этой модели.').count(),0);
      await page.getByRole('button',{name:'Назад',exact:true}).tap();
    }

    for (const id of ids) for (let n=1;n<=4;n++) {
      const response=await context.request.get(`${base}royal-step/${id}-${n}.webp`);
      assert.equal(response.status(),200,`${id}-${n}`);
      assert.match(response.headers()['content-type']||'',/image\/webp/,`${id}-${n} content type`);
    }
    await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
    const violations = await page.evaluate(async() => {
      const a=await window.axe.run(document.querySelector('[data-testid="royal-step"]'));
      const b=await window.axe.run(document.querySelector('.rs-portal'));
      return [...a.violations,...b.violations].filter(v=>v.impact==='critical'||v.impact==='serious').map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));
    });
    assert.deepEqual(violations,[]);
    assert.deepEqual(errors,[]);
    console.log('Full mobile journey: gallery, 16 products, 64 images, filters, gestures, favorites, cart, checkout and persistence passed');
  } finally { await context.close(); }
}

async function runViewport(browser,width,height) {
  const {context,page,errors}=await contextFor(browser,width,height);
  try {
    await page.goto(`${base}#/demos/nike-sneakers/app`,{waitUntil:'domcontentloaded'});
    await page.getByTestId('royal-step').waitFor({timeout:30000}); await assertLayout(page);
    await nav(page).getByRole('button',{name:'Каталог'}).tap(); await assertLayout(page);
    await page.getByRole('button',{name:'Открыть Nike Dunk Low Retro'}).tap(); await assertLayout(page);
    await page.getByRole('button',{name:'42',exact:true}).tap();
    await page.getByRole('button',{name:'Добавить в корзину'}).tap();
    assert.equal(await page.getByRole('dialog').getByText('Размер 42 EU').isVisible(),true);
    await page.getByRole('dialog').getByRole('button',{name:'Удалить Nike Dunk Low Retro, размер 42'}).tap();
    assert.equal(await page.getByText('Пока пусто').isVisible(),true);
    assert.deepEqual(errors,[]);
    console.log(`Mobile ${width}x${height}: navigation, product, size and empty basket passed`);
  } finally { await context.close(); }
}

(async()=>{
  const chrome=await chromium.launch({headless:true});
  try { await runFull(chrome); await runViewport(chrome,320,568); } finally { await chrome.close(); }
  const safari=await webkit.launch({headless:true});
  try { await runViewport(safari,430,932); } finally { await safari.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
