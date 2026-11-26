const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');

const base = process.argv[2] || process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:41755/';
const url = new URL('/#/projects', base).href;

async function exercise(engine, live3D, width) {
  const browser = await engine.launch(
    engine === chromium
      ? { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
      : {}
  );
  const context = await browser.newContext({
    isMobile: true,
    hasTouch: true,
    viewport: { width, height: 740 },
    locale: 'ru-RU',
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await context.addInitScript((allowWebGL) => {
    localStorage.setItem('app-language', 'ru');
    if (!sessionStorage.getItem('furniture-test-started')) {
      localStorage.removeItem('web4tg-furniture-store-v1');
      sessionStorage.setItem('furniture-test-started', '1');
    }
    if (allowWebGL) return;
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return /^webgl2?$|^experimental-webgl$/.test(type)
        ? null
        : original.call(this, type, ...args);
    };
  }, live3D);
  await context.route('**/telegram-web-app.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' })
  );

  async function noHorizontalOverflow(stage) {
    const geometry = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      root: document.getElementById('root').scrollWidth,
    }));
    assert(
      geometry.document <= geometry.viewport + 1,
      `${stage}: document overflows ${JSON.stringify(geometry)}`
    );
    assert(
      geometry.root <= geometry.viewport + 1,
      `${stage}: root overflows ${JSON.stringify(geometry)}`
    );
  }
  async function tapFirstProduct(name) {
    const card = name
      ? page.locator('.fs-catalog .fs-card').filter({ has: page.locator('.fs-card-meta > button', { hasText: name }) }).first().locator('.fs-card-open')
      : page.locator('.fs-card-open').first();
    // The app scrolls its #root rather than the document; WebKit's automatic
    // scrollIntoView does not reliably scroll that container on a 320px screen.
    await card.evaluate((element) => {
      const root = document.getElementById('root');
      root.scrollTop += element.getBoundingClientRect().top - 180;
    });
    await card.tap();
  }

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('card-app-furniture-studio').tap();
    const store = page.getByTestId('furniture-store');
    await store.waitFor();
    assert(await store.getByRole('heading', { name: 'Вокруг стола' }).isVisible());
    await noHorizontalOverflow('store home');

    await page.getByRole('button', { name: 'Каталог', exact: true }).tap();
    await page.locator('.fs-catalog').waitFor();
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '30 моделей');
    await page.getByRole('button', { name: 'Диваны', exact: true }).tap();
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '7 моделей');
    await page.getByRole('button', { name: 'Кресла', exact: true }).tap();
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '4 модели');
    await page.getByRole('button', { name: 'Все', exact: true }).tap();
    const sort = page.getByLabel('Сортировка');
    await sort.selectOption('name');
    const ordered=await page.locator('.fs-catalog .fs-card-meta > button:not(.fs-card-compare)').allTextContents();
    assert.equal(ordered.length,30);const names=ordered.map(s=>s.replace(/^(Диван|Кресло) · /,''));assert.deepEqual(names,[...names].sort(new Intl.Collator('ru',{sensitivity:'base'}).compare));
    await page.getByLabel('Поиск по коллекции').fill('Westview');
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '1 модель');
    await page.getByLabel('Поиск по коллекции').fill('полиэстер');
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '9 моделей');
    await page.getByLabel('Очистить поиск').tap();
    await page.locator('.fs-filters summary').tap();
    await page.getByLabel('Ширина до, см').fill('200');
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '25 моделей');
    await page.getByLabel('Основной материал').selectOption('polyester');
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '6 моделей');
    await tapFirstProduct();
    await page.locator('.fs-product-info').waitFor();
    await page.getByRole('button', { name: 'Назад', exact: true }).tap();
    await page.locator('.fs-catalog').waitFor();
    await page.locator('.fs-filters summary').tap();
    assert.equal(await page.getByLabel('Ширина до, см').inputValue(), '200');
    assert.equal(await page.getByLabel('Основной материал').inputValue(), 'polyester');
    await page.getByRole('button', { name: 'Сбросить фильтры' }).tap();
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '30 моделей');
    await page.locator('.fs-filters summary').tap();
    await noHorizontalOverflow('catalogue');

    await tapFirstProduct('Rivet Revolve');
    await page.locator('.fs-product-info').waitFor();
    const favorite = page.locator('.fs-gallery-heart');
    await favorite.tap();
    assert.equal(await favorite.getAttribute('aria-pressed'), 'true');

    // The app's back button returns to the same sorted catalogue.
    await page.getByRole('button', { name: 'Назад', exact: true }).tap();
    await page.locator('.fs-catalog').waitFor();
    assert.equal(await sort.inputValue(), 'name');
    assert.equal(await page.locator('.fs-catalog .fs-card').filter({ has: page.locator('.fs-card-meta > button', { hasText: 'Rivet Revolve' }) }).first().locator('.fs-card-heart').getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: 'Профиль', exact: true }).tap();
    await page.locator('.fs-account').waitFor();
    assert.equal(await page.locator('.fs-account .fs-grid').first().locator('.fs-card').count(), 1);
    assert.match(
      await page
        .locator('.fs-account .fs-grid')
        .first()
        .locator('.fs-card-meta button')
        .textContent(),
      /Rivet Revolve/
    );
    await page.getByRole('button', { name: 'Каталог', exact: true }).tap();
    await page.locator('.fs-catalog').waitFor();
    assert.equal(await sort.inputValue(), 'name');
    await tapFirstProduct('Rivet Revolve');
    await page.locator('.fs-product-info').waitFor();
    await page.getByRole('button', { name: '3D-обзор' }).tap();
    const viewer = page.locator('.rfv');
    await viewer.waitFor();
    if (live3D) {
      await viewer.getByRole('button', { name: 'Увеличить', exact: true }).waitFor({ timeout: 45000 });
      await viewer.getByRole('button', { name: 'Сбоку', exact: true }).tap();
      assert.equal(await viewer.getByRole('button', { name: 'Сбоку', exact: true }).getAttribute('aria-pressed'), 'true');
      await viewer.locator('.rfv-precise summary').tap();
      assert(await viewer.getByRole('button', { name: 'Повернуть вправо' }).isVisible());
    } else {
      await viewer.getByText('3D недоступно. Показываем фотографию.').waitFor({ timeout: 30000 });
      const poster = viewer.locator('.rfv-poster');
      assert(await poster.isVisible());
      assert(await poster.evaluate((img) => img.complete && img.naturalWidth > 0));
      assert.equal(await viewer.getByRole('button', { name: 'Повернуть вправо' }).count(), 0);
    }
    await viewer.getByRole('button', { name: 'Закрыть 3D-обзор' }).tap();
    await viewer.waitFor({ state: 'detached' });
    await noHorizontalOverflow('product');

    await page.getByRole('button', { name: /Добавить в подборку/i }).tap();
    const cart = page.getByRole('dialog');
    await cart.waitFor();
    const quantityButton = await cart.getByRole('button', { name: /Увеличить количество/ }).boundingBox();
    assert(quantityButton.width >= 44 && quantityButton.height >= 44, 'quantity control needs a comfortable touch target');
    await noHorizontalOverflow('cart');
    await cart.getByRole('button', { name: /Увеличить количество/ }).tap();
    assert.match(await cart.locator('.fs-muted').textContent(), /2/);
    await cart.getByRole('button', { name: /ОФОРМИТЬ ДЕМО-ЗАКАЗ/ }).tap();
    await page.locator('.fs-checkout').waitFor();
    const draft = new URL(
      await page.getByRole('link', { name: /ОБСУДИТЬ В TELEGRAM/ }).getAttribute('href')
    );
    assert.equal(draft.hostname, 't.me');
    assert.equal(draft.pathname, '/web4tgs');
    assert.match(draft.searchParams.get('text'), /демо/i);
    assert.match(draft.searchParams.get('text'), /Rivet Revolve/);
    assert.match(draft.searchParams.get('text'), /× 2/);
    assert.match(await page.locator('.fs-chat-note').textContent(), /Сообщение отправляется только вами/);
    await noHorizontalOverflow('checkout');

    // Demo checkout does not ask for contact details that are never sent.
    const submit = page.getByRole('button', { name: /ЗАВЕРШИТЬ ДЕМО-ЗАКАЗ/ });
    assert.equal(await page.locator('#fs-customer, #fs-phone').count(), 0);
    await page.getByLabel('Курьер', { exact: true }).check();

    // Browser back should restore the cart instead of leaving the mini app.
    await page.goBack();
    await cart.waitFor();
    assert.match(await cart.locator('.fs-muted').textContent(), /2/);
    await cart.getByRole('button', { name: /ОФОРМИТЬ ДЕМО-ЗАКАЗ/ }).tap();
    assert(await page.getByLabel('Самовывоз', { exact: true }).isChecked());
    await page.getByLabel('Курьер', { exact: true }).check();
    await submit.tap();
    await page.locator('.fs-success').waitFor();
    assert.match(
      await page.locator('.fs-success .fs-lead').first().textContent(),
      /данные не отправлены/
    );
    assert.match(await page.locator('.fs-success').textContent(), /курьер/);
    await page.getByRole('button', { name: 'Профиль', exact: true }).tap();
    const order = page.locator('.fs-history-order').first();
    await order.evaluate((element) => {
      const root = document.getElementById('root');
      root.scrollTop += element.getBoundingClientRect().top - 180;
    });
    await page.waitForTimeout(150);
    await order.locator('summary').tap();
    assert.match(await order.textContent(), /Rivet Revolve/);
    assert.match(await order.textContent(), /× 2/);
    assert.match(await order.textContent(), /курьер/);
    const repeat = order.getByRole('button', { name: /ПОВТОРИТЬ ДЕМО-ЗАКАЗ/ });
    await repeat.evaluate((element) => {
      const root = document.getElementById('root');
      root.scrollTop += element.getBoundingClientRect().top - 300;
    });
    await page.waitForTimeout(150);
    await repeat.tap();
    await cart.waitFor();
    assert.match(await cart.locator('.fs-muted').textContent(), /2/);
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem('web4tg-furniture-store-v1') || '{}').orderHistory
          ?.length === 1
    );
    let saved = await page.evaluate(() => localStorage.getItem('web4tg-furniture-store-v1'));
    assert.equal(JSON.parse(saved).orderHistory[0].items[0].quantity, 2);
    assert.equal(JSON.parse(saved).orderHistory[0].delivery, 'courier');
    await page.reload();
    await store.waitFor();
    saved = await page.evaluate(() => localStorage.getItem('web4tg-furniture-store-v1'));
    assert.equal(JSON.parse(saved).orderHistory.length, 1);
    assert.equal(JSON.parse(saved).cart[0].quantity, 2);
    if (await cart.isVisible())
      await cart.getByRole('button', { name: 'Закрыть', exact: true }).tap();
    await page.getByTestId('demo-return-web4tg').tap();
    // A direct reload resets the in-memory return destination to WEB4TG home.
    await page.waitForFunction(() => ['#/', '#/projects'].includes(window.location.hash));
    await store.waitFor({ state: 'detached' });
    assert.deepEqual(errors, [], 'uncaught page errors');
    console.log(`${engine.name()} ${width}: ${live3D ? 'WebGL' : 'poster fallback'} passed`);
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  await exercise(chromium, true, 390);
  await exercise(webkit, false, 320);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
