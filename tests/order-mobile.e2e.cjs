const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.ORDER_TEST_URL || 'http://127.0.0.1:5000/';
const text = value => value.replace(/\s+/g, ' ').trim();

async function open(browser, width, native = false) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript((isNative) => {
    localStorage.setItem('app-language', 'ru');
    if (isNative) {
      const user = { id: 12345, first_name: 'Мария', username: 'maria', language_code: 'ru' };
      sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppData: `user=${encodeURIComponent(JSON.stringify(user))}`, tgWebAppVersion: '9.0', tgWebAppPlatform: 'android' }));
      window.__nativeEvents = [];
      window.TelegramWebviewProxy = { postEvent(type, data) { window.__nativeEvents.push({ type, data: data ? JSON.parse(data) : {} }); } };
    }
  }, native);
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('/#/constructor', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('order-page').waitFor({ timeout: 30000 });
  await page.waitForFunction(() => [...document.querySelectorAll('.order-template-art')].length === 4 && [...document.querySelectorAll('.order-template-art')].every(image => image.complete && image.naturalWidth > 0));
  return { context, page, errors };
}
async function tap(locator) {
  await locator.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await locator.tap();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const loadingContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await loadingContext.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await loadingContext.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await loadingContext.route('**/*shop-v5*.webp*', async route => { await new Promise(resolve => setTimeout(resolve, 1200)); await route.continue(); });
    const loadingPage = await loadingContext.newPage();
    await loadingPage.goto(new URL('/#/constructor', site).href, { waitUntil: 'domcontentloaded' });
    const skeleton = loadingPage.getByTestId('order-skeleton');
    await skeleton.waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await skeleton.getAttribute('aria-busy'), 'true');
    assert.equal(await skeleton.locator('.profile-skeleton').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    await loadingPage.getByTestId('order-page').waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await skeleton.count(), 0);
    await loadingContext.close();
    console.log('Loading: accessible skeleton and reduced-motion behavior passed');
    for (const width of [320, 390, 430]) {
      const { context, page, errors } = await open(browser, width);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.locator('[data-scroll="main"]').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
      assert.equal(await page.locator('.order-page').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
      assert.match(await page.locator('.order-page').evaluate(el => getComputedStyle(el).fontFamily), /Google Sans App/);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.fonts.check('16px "Google Sans App"')), true);
      const templates = [ ['ecommerce-basic','150 000'], ['restaurant','180 000'], ['fitness-center','200 000'], ['services','170 000'] ];
      for (const [id, price] of templates) {
        const card = page.getByTestId(`template-${id}`);
        assert.match(text(await card.innerText()), new RegExp(price));
        const box = await card.boundingBox(); assert.ok(box.width >= 44 && box.height >= 44);
      }
      await tap(page.getByTestId('order-continue'));
      assert.equal(await page.getByRole('alert').innerText(), 'Выберите направление приложения');
      assert.equal(await page.getByTestId('order-page').getAttribute('data-order-step'), '1');
      for (const [id] of templates) {
        await tap(page.getByTestId(`template-${id}`));
        assert.equal(await page.getByTestId(`template-${id}`).getAttribute('aria-pressed'), 'true');
      }
      await tap(page.getByTestId('template-ecommerce-basic'));
      await tap(page.getByTestId('order-continue'));
      assert.equal(await page.getByTestId('order-page').getAttribute('data-order-step'), '2');
      assert.match(text(await page.getByTestId('order-running-total').innerText()), /150 000/);
      assert.equal(await page.locator('#order-project-name').evaluate(el => getComputedStyle(el).fontSize), '16px');
      assert.deepEqual(errors, []);
      if (width !== 390) { await context.close(); console.log(`${width}px: choice, assets, white footer and layout passed`); continue; }

      await page.locator('#order-project-name').fill('Магазин №1 & Ко');
      let featureCount = 0;
      for (const group of await page.locator('.order-group').all()) {
        if (!await group.evaluate(el => el.open)) await tap(group.locator('summary'));
        for (const feature of await group.locator('.order-feature').all()) {
          featureCount++;
          const included = await feature.getAttribute('aria-disabled') === 'true';
          const before = await feature.getAttribute('aria-pressed');
          if (included) {
            assert.equal(await feature.isDisabled(), true);
            assert.equal(before, 'true');
          } else {
            await tap(feature);
            assert.equal(await feature.getAttribute('aria-pressed'), 'true');
            await tap(feature);
            assert.equal(await feature.getAttribute('aria-pressed'), 'false');
          }
        }
      }
      assert.equal(featureCount, 37);
      await tap(page.getByTestId('feature-search'));
      await tap(page.getByTestId('feature-ai-chatbot'));
      assert.match(text(await page.getByTestId('order-running-total').innerText()), /219 000/);
      await tap(page.getByTestId('order-continue'));
      assert.equal(await page.getByTestId('order-page').getAttribute('data-order-step'), '3');
      assert.match(text(await page.getByTestId('order-final-total').innerText()), /219 000/);
      assert.match(await page.locator('.order-review').innerText(), /Магазин №1 & Ко/);
      await tap(page.locator('.order-support > summary'));
      await tap(page.getByTestId('order-plan-standard'));
      assert.match(text(await page.getByTestId('order-plan-standard').innerText()), /14 900/);
      await tap(page.getByRole('button', { name: 'В год', exact: true }));
      assert.match(text(await page.getByTestId('order-plan-standard').innerText()), /149 000/);
      await page.evaluate(() => {
        window.__openedOrderUrl = null;
        window.open = url => { window.__openedOrderUrl = url; return null; };
        if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink = url => { window.__openedOrderUrl = url; };
      });
      assert.equal(await page.evaluate(() => window.__openedOrderUrl), null);
      await tap(page.getByTestId('order-continue'));
      const url = await page.evaluate(() => window.__openedOrderUrl);
      assert.ok(url && url.startsWith('https://t.me/web4tgs?text='));
      const draft = new URL(url).searchParams.get('text');
      assert.match(draft, /Магазин №1 & Ко/); assert.match(draft, /Поиск/); assert.match(draft, /AI Чат-бот/);
      assert.match(text(draft), /219 000 ₽/); assert.match(text(draft), /149 000 ₽\/год/);
      await tap(page.getByTestId('order-back'));
      await tap(page.getByTestId('order-back'));
      await tap(page.getByTestId('template-restaurant'));
      await tap(page.getByTestId('order-continue'));
      assert.match(text(await page.getByTestId('order-running-total').innerText()), /180 000/);
      assert.equal(await page.getByTestId('feature-search').getAttribute('aria-pressed'), 'false');
      assert.deepEqual(errors, []);
      await context.close();
      console.log('390px: all 37 feature controls, pricing, review, support and user-triggered Telegram draft passed');
    }

    const { context, page, errors } = await open(browser, 390, true);
    const pressNative = () => page.evaluate(() => window.TelegramGameProxy_receiveEvent('main_button_pressed'));
    await page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_setup_main_button' && e.data.is_visible));
    await pressNative();
    assert.equal(await page.getByRole('alert').innerText(), 'Выберите направление приложения');
    await tap(page.getByTestId('template-services'));
    await pressNative();
    await page.waitForFunction(() => document.querySelector('[data-testid="order-page"]')?.dataset.orderStep === '2');
    await pressNative();
    await page.waitForFunction(() => document.querySelector('[data-testid="order-page"]')?.dataset.orderStep === '3');
    await page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_setup_main_button' && /Открыть заявку/.test(e.data.text || '')));
    const nativeButton = await page.evaluate(() => window.__nativeEvents.filter(e => e.type === 'web_app_setup_main_button' && e.data.is_visible).at(-1).data);
    assert.equal(nativeButton.color.toUpperCase(), '#FFFFFF'); assert.equal(nativeButton.text_color.toUpperCase(), '#1C1C1E');
    assert.equal(await page.evaluate(() => window.__nativeEvents.some(e => e.type === 'web_app_open_tg_link')), false);
    await pressNative();
    await page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_open_tg_link'));
    const nativeLink = await page.evaluate(() => window.__nativeEvents.find(e => e.type === 'web_app_open_tg_link').data.path_full);
    const nativeUrl = new URL(`https://t.me${nativeLink}`);
    assert.equal(nativeUrl.pathname, '/web4tgs');
    assert.match(text(nativeUrl.searchParams.get('text')), /170 000 ₽/);
    assert.match(nativeUrl.searchParams.get('text'), /Услуги/);
    assert.deepEqual(errors, []);
    await context.close();
    console.log('Telegram bridge: validation, three steps, white button and user-triggered draft passed');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
