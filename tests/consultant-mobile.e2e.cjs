const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.CONSULTANT_TEST_URL || 'http://127.0.0.1:5000/';

async function open(browser, width, lang = 'ru', native = false) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: lang === 'ru' ? 'ru-RU' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(({ lang, native }) => {
    localStorage.setItem('app-language', lang);
    if (native) {
      const user = { id: 12345, first_name: 'Мария', username: 'maria', language_code: lang };
      sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppData: `user=${encodeURIComponent(JSON.stringify(user))}`, tgWebAppVersion: '9.0', tgWebAppPlatform: 'android' }));
      window.__nativeEvents = [];
      window.TelegramWebviewProxy = { postEvent(type, data) { window.__nativeEvents.push({ type, data: data ? JSON.parse(data) : {} }); } };
    }
  }, { lang, native });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('/#/ai-process', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('consultant-page').waitFor({ timeout: 30000 });
  await page.waitForFunction(() => [...document.querySelectorAll('.consultant-page img')].every(image => image.complete && image.naturalWidth > 0));
  return { context, page, errors };
}
async function tap(locator) { await locator.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await locator.tap(); }

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const loading = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await loading.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await loading.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await loading.route('**/*consultant-orb*.webp*', async route => { await new Promise(resolve => setTimeout(resolve, 1200)); await route.continue(); });
    const loadingPage = await loading.newPage(); await loadingPage.goto(new URL('/#/ai-process', site).href, { waitUntil: 'domcontentloaded' });
    const skeleton = loadingPage.getByTestId('consultant-skeleton'); await skeleton.waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await skeleton.getAttribute('aria-busy'), 'true');
    assert.equal(await skeleton.locator('.profile-skeleton').first().evaluate(el => getComputedStyle(el).animationName), 'none');
    await loadingPage.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 20000 });
    await loading.close(); console.log('Loading: skeleton and reduced motion passed');

    for (const width of [320, 390, 430]) {
      const { context, page, errors } = await open(browser, width);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await page.locator('[data-scroll="main"]').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
      assert.match(await page.locator('.consultant-page').evaluate(el => getComputedStyle(el).fontFamily), /Google Sans App/);
      assert.equal(await page.locator('.consultant-hero-art img').evaluate(el => getComputedStyle(el).animationName), 'none');
      assert.match(await page.locator('#consultant-title').innerText(), /ИИ-консультант/);
      assert.equal(await page.getByText('ИИ ДЛЯ ВАШЕГО БИЗНЕСА').count(), 0);
      for (const selector of ['consultant-show-demo', 'consultant-channel-app', 'consultant-channel-chat', 'consultant-contact']) {
        const box = await page.getByTestId(selector).boundingBox(); assert.ok(box.width >= 44 && box.height >= 44, selector);
      }
      if (width === 390 && process.env.CONSULTANT_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.CONSULTANT_SCREENSHOT_DIR}/consultant-hero.png` });
      await page.getByTestId('consultant-show-demo').tap();
      assert.equal(await page.getByTestId('consultant-compare-ai').getAttribute('aria-pressed'), 'true');
      await tap(page.getByTestId('consultant-compare-human'));
      assert.match(await page.getByTestId('consultant-comparison-card').innerText(), /Личный опыт/);
      await tap(page.getByTestId('consultant-compare-ai'));
      assert.match(await page.getByTestId('consultant-comparison-card').innerText(), /Рядом, даже когда/);
      if (width === 390 && process.env.CONSULTANT_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.CONSULTANT_SCREENSHOT_DIR}/consultant-comparison.png` });
      await tap(page.getByTestId('consultant-to-example'));
      await page.getByTestId('consultant-channel-app').waitFor({ state: 'visible' });
      assert.equal(await page.getByTestId('consultant-channel-app').getAttribute('aria-pressed'), 'true');
      await tap(page.getByTestId('consultant-example-conversation'));
      await page.getByAltText('Пример фотографии кроссовок Nike').waitFor({ state: 'visible' });
      assert.match(await page.getByTestId('consultant-example-conversation').innerText(), /42 размер/);
      const product = page.getByTestId('consultant-example-product');
      await product.waitFor({ state: 'visible' });
      await tap(product.getByRole('button', { name: 'Выбрать' }));
      assert.equal(await product.getByRole('button', { name: 'Выбрано в примере' }).getAttribute('aria-pressed'), 'true');
      await tap(page.getByTestId('consultant-channel-chat'));
      assert.equal(await page.getByTestId('consultant-channel-chat').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.getByTestId('consultant-channel-app').getAttribute('aria-pressed'), 'false');
      await tap(page.getByTestId('consultant-example-booking'));
      await page.getByText('Хочу записаться. С чего начать?').waitFor({ state: 'visible' });
      assert.match(await page.getByTestId('consultant-example-conversation').innerText(), /записаться/i);
      assert.equal(await page.getByText('Пример диалога. Ответы настраиваются под ваш бизнес.').isVisible(), true);
      if (width === 390 && process.env.CONSULTANT_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.CONSULTANT_SCREENSHOT_DIR}/consultant-example.png` });
      await page.evaluate(() => { window.__requestUrl = null; window.open = url => { window.__requestUrl = url; return null; }; if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink = url => { window.__requestUrl = url; }; });
      assert.equal(await page.evaluate(() => window.__requestUrl), null);
      await tap(page.getByTestId('consultant-contact'));
      const url = new URL(await page.evaluate(() => window.__requestUrl));
      assert.equal(url.origin + url.pathname, 'https://t.me/web4tgs');
      assert.match(url.searchParams.get('text'), /В Telegram-чате/); assert.match(url.searchParams.get('text'), /Запись/);
      await tap(page.getByTestId('consultant-both'));
      assert.equal(await page.getByTestId('consultant-both').getAttribute('aria-pressed'), 'true');
      await tap(page.getByTestId('consultant-contact'));
      const bothUrl = new URL(await page.evaluate(() => window.__requestUrl));
      assert.match(bothUrl.searchParams.get('text'), /В Mini App и Telegram-чате/);
      await tap(page.getByText('Что нужно подготовить?', { exact: true }));
      assert.equal(await page.getByText(/соберите материалы/).isVisible(), true);
      assert.deepEqual(errors, []); await context.close();
      console.log(`${width}px: artwork, both channels, example and Telegram request passed`);
    }

    const english = await open(browser, 390, 'en');
    assert.match(await english.page.locator('#consultant-title').innerText(), /AI consultant/);
    await tap(english.page.getByTestId('consultant-channel-chat'));
    await tap(english.page.getByTestId('consultant-example-question'));
    await english.page.getByText('How can I learn about delivery?').waitFor({ state: 'visible' });
    assert.match(await english.page.getByTestId('consultant-example-conversation').innerText(), /delivery/i);
    assert.deepEqual(english.errors, []); await english.context.close(); console.log('English: content and interactions passed');

    const native = await open(browser, 390, 'ru', true);
    await native.page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_setup_main_button' && e.data.is_visible));
    const button = await native.page.evaluate(() => window.__nativeEvents.filter(e => e.type === 'web_app_setup_main_button' && e.data.is_visible).at(-1).data);
    assert.equal(button.color.toUpperCase(), '#FFFFFF'); assert.match(button.text, /Обсудить консультанта/);
    await tap(native.page.getByTestId('consultant-channel-chat'));
    await native.page.evaluate(() => window.TelegramGameProxy_receiveEvent('main_button_pressed'));
    await native.page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_open_tg_link'));
    const path = await native.page.evaluate(() => window.__nativeEvents.find(e => e.type === 'web_app_open_tg_link').data.path_full);
    const nativeUrl = new URL(`https://t.me${path}`);
    assert.equal(nativeUrl.pathname, '/web4tgs'); assert.match(nativeUrl.searchParams.get('text'), /В Telegram-чате/);
    assert.deepEqual(native.errors, []); await native.context.close(); console.log('Native Telegram button: selected channel and destination passed');

    const animatedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'no-preference', serviceWorkers: 'block' });
    await animatedContext.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await animatedContext.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    const animatedPage = await animatedContext.newPage(); await animatedPage.goto(new URL('/#/ai-process', site).href, { waitUntil: 'domcontentloaded' });
    await animatedPage.getByTestId('consultant-page').waitFor({ timeout: 30000 });
    await animatedPage.getByTestId('consultant-example-conversation').evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await animatedPage.locator('.consultant-typing').waitFor({ state: 'visible', timeout: 5000 });
    await animatedPage.waitForFunction(() => { const text = document.querySelector('.consultant-message.is-assistant > span:last-child')?.textContent?.trim() || ''; return text.length > 0 && text.length < 25; }, null, { timeout: 5000 });
    await animatedPage.getByText('Пример диалога показан').waitFor({ state: 'attached', timeout: 10000 });
    assert.equal(await animatedPage.getByAltText('Пример фотографии кроссовок Nike').isVisible(), true);
    assert.match(await animatedPage.getByTestId('consultant-example-conversation').innerText(), /средство для ухода/);
    await animatedContext.close(); console.log('Animation: typing indicator, progressive text and photo passed');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
