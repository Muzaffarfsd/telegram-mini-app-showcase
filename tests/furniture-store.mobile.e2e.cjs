const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const sharp = require('sharp');

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

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('card-app-furniture-studio').tap();
    const store = page.getByTestId('furniture-store');
    await store.waitFor();
    assert(await store.getByRole('heading', { name: 'Мебель для жизни' }).isVisible());
    await noHorizontalOverflow('store home');

    await page.getByRole('button', { name: 'Каталог', exact: true }).tap();
    await page.locator('.fs-catalog').waitFor();
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '4 модели');
    await page.getByRole('button', { name: 'Диваны', exact: true }).tap();
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '2 модели');
    await page.getByRole('button', { name: 'Кресла', exact: true }).tap();
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '1 модель');
    await page.getByRole('button', { name: 'Все', exact: true }).tap();
    const sort = page.getByLabel('Сортировка');
    await sort.selectOption('name');
    assert.deepEqual(await page.locator('.fs-card-meta button').allTextContents(), [
      'Rivet Revolve',
      'Rivet Revolve',
      'Waverly Oak',
      'Westview',
    ]);
    await page.getByLabel('Поиск по коллекции').fill('Westview');
    assert.equal((await page.locator('.fs-result').textContent()).trim(), '1 модель');
    await page.getByLabel('Очистить поиск').tap();
    await noHorizontalOverflow('catalogue');

    await page.locator('.fs-card-open').first().tap();
    await page.locator('.fs-product-info').waitFor();
    const favorite = page.locator('.fs-gallery-heart');
    await favorite.tap();
    assert.equal(await favorite.getAttribute('aria-pressed'), 'true');

    // The app's back button returns to the same sorted catalogue.
    await page.getByRole('button', { name: 'Назад', exact: true }).tap();
    await page.locator('.fs-catalog').waitFor();
    assert.equal(await sort.inputValue(), 'name');
    assert.equal(await page.locator('.fs-card-heart').first().getAttribute('aria-pressed'), 'true');
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
    await page.locator('.fs-card-open').first().tap();
    await page.locator('.fs-product-info').waitFor();
    await page.getByRole('button', { name: '3D-обзор' }).tap();
    const viewer = page.locator('.rfv');
    await viewer.waitFor();
    if (live3D) {
      const rotate = viewer.getByRole('button', { name: 'Повернуть вправо' });
      await rotate.waitFor({ timeout: 45000 });
      const canvas = viewer.locator('canvas');
      await canvas.scrollIntoViewIfNeeded();
      // Overlay controls must not introduce false pixel changes in the canvas screenshot.
      const visualStyle = await page.addStyleTag({
        content:
          '.fs-nav,.alex-fab-breathing,.fs-gallery-heart,.fs-view-toggle{visibility:hidden!important}',
      });
      await viewer.locator('.rfv-controls').evaluate((element) => {
        element.style.visibility = 'hidden';
      });
      const pixels = async () =>
        sharp(await canvas.screenshot())
          .removeAlpha()
          .resize(128, 128)
          .raw()
          .toBuffer();
      const difference = (a, b) => {
        assert.equal(a.length, b.length);
        return a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0) / a.length;
      };
      await viewer.locator('[aria-label="Вернуть исходный вид"]').dispatchEvent('click');
      const before = await pixels();
      await viewer.locator('[aria-label="Повернуть вправо"]').dispatchEvent('click');
      const rotated = await pixels();
      assert(difference(rotated, before) > 0.5, 'rotating should change the rendered 3D frame');
      await viewer
        .getByRole('button', { name: 'Посмотреть сверху', includeHidden: true })
        .dispatchEvent('click');
      const elevated = await pixels();
      assert(
        difference(elevated, rotated) > 0.5,
        'vertical angle should change the rendered frame'
      );
      await viewer
        .getByRole('button', { name: 'Увеличить', exact: true, includeHidden: true })
        .dispatchEvent('click');
      const zoomed = await pixels();
      assert(difference(zoomed, elevated) > 0.5, 'zoom should change the rendered frame');
      await viewer
        .getByRole('button', { name: 'Вернуть исходный вид', includeHidden: true })
        .dispatchEvent('click');
      const reset = await pixels();
      const resetDifference = difference(reset, before);
      const zoomDifference = difference(zoomed, before);
      assert(
        resetDifference < zoomDifference * 0.5,
        `reset should return closer to the original view (reset ${resetDifference}, changed ${zoomDifference})`
      );
      await visualStyle.evaluate((style) => style.remove());
    } else {
      await viewer.getByText('3D недоступно. Показываем фотографию.').waitFor({ timeout: 30000 });
      const poster = viewer.locator('.rfv-poster');
      assert(await poster.isVisible());
      assert(await poster.evaluate((img) => img.complete && img.naturalWidth > 0));
      assert.equal(await viewer.getByRole('button', { name: 'Повернуть вправо' }).count(), 0);
    }
    await noHorizontalOverflow('product');

    await page.getByRole('button', { name: /ДОБАВИТЬ В КОРЗИНУ/ }).tap();
    const cart = page.getByRole('dialog');
    await cart.waitFor();
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
    assert.match(await page.locator('.fs-chat-note').textContent(), /Данные формы не передаются/);
    await noHorizontalOverflow('checkout');

    // Invalid fields are identified and focus moves to the first one.
    const submit = page.getByRole('button', { name: /ЗАВЕРШИТЬ ДЕМО-ЗАКАЗ/ });
    const name = page.locator('#fs-customer');
    const phone = page.locator('#fs-phone');
    await submit.tap();
    assert.equal(await name.getAttribute('aria-invalid'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'fs-customer');
    await name.fill('Test Customer');
    await phone.fill('123');
    await submit.tap();
    assert.equal(await phone.getAttribute('aria-invalid'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'fs-phone');
    await phone.fill('+15551234567');
    await page.getByLabel('Курьер', { exact: true }).check();
    const assertNoContacts = async () => {
      const storage = await page.evaluate(() => localStorage.getItem('web4tg-furniture-store-v1'));
      assert(
        !storage.includes('Test Customer') && !storage.includes('15551234567'),
        'contact details must not be saved'
      );
      const draftText = new URL(
        await page.getByRole('link', { name: /ОБСУДИТЬ В TELEGRAM/ }).getAttribute('href')
      ).searchParams.get('text');
      assert(
        !draftText.includes('Test Customer') && !draftText.includes('15551234567'),
        'contact details must not enter the Telegram draft'
      );
    };
    await assertNoContacts();

    // Browser back should restore the cart instead of leaving the mini app.
    await page.goBack();
    await cart.waitFor();
    assert.match(await cart.locator('.fs-muted').textContent(), /2/);
    await cart.getByRole('button', { name: /ОФОРМИТЬ ДЕМО-ЗАКАЗ/ }).tap();
    assert.equal(await name.inputValue(), '');
    assert.equal(await phone.inputValue(), '');
    assert(await page.getByLabel('Самовывоз', { exact: true }).isChecked());
    await name.fill('Test Customer');
    await phone.fill('+15551234567');
    await page.getByLabel('Курьер', { exact: true }).check();
    await assertNoContacts();
    await phone.press('Enter');
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
    assert(!saved.includes('Test Customer') && !saved.includes('15551234567'));
    assert.equal(JSON.parse(saved).orderHistory[0].items[0].quantity, 2);
    await page.reload();
    await store.waitFor();
    saved = await page.evaluate(() => localStorage.getItem('web4tg-furniture-store-v1'));
    assert.equal(JSON.parse(saved).orderHistory.length, 1);
    assert.equal(JSON.parse(saved).cart[0].quantity, 2);
    assert(!saved.includes('Test Customer') && !saved.includes('15551234567'));
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
