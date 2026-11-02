const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.HOME_TEST_URL || 'http://127.0.0.1:53734/';

async function run(browserType, name, width, height, language = 'ru') {
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: language === 'ru' ? 'ru-RU' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(lang => { localStorage.setItem('app-language', lang); localStorage.setItem('app-theme', 'dark'); }, language);
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    const home = page.getByTestId('home-page');
    await home.waitFor();
    await page.getByRole('button', { name: 'Chat with Alex' }).waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await home.locator('h1').evaluate(el => getComputedStyle(el).fontFamily.includes('Google Sans App')), true, 'the home must use the agreed font');
    assert.equal(await page.evaluate(() => document.fonts.check('16px "Google Sans App"', 'Бизнес')), true, 'the Cyrillic font must actually load');
    assert.equal(await home.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'home should be white in a dark Telegram theme');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'home must fit the screen width');
    assert.equal(await home.locator('.studio-exhibit__object img').evaluate(el => getComputedStyle(el).animationName), 'none', 'reduced motion should be respected');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.studio-exhibit img')).every(el => el.complete && el.naturalWidth > 0));

    if (width === 390 && language === 'ru' && name === 'Chromium') {
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const violations = await home.evaluate(async el => (await window.axe.run(el, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })));
      assert.deepEqual(violations, [], 'home accessibility');
      await page.getByRole('button', { name: 'Chat with Alex' }).tap();
      const chat = page.getByTestId('ai-chat-panel');
      await chat.getByRole('textbox', { name: 'Сообщение' }).tap();
      await chat.getByRole('button', { name: 'Close', exact: true }).tap();
      await chat.waitFor({ state: 'hidden' });
    }

    const store = home.getByRole('button', { name: language === 'ru' ? 'Магазин' : 'Store', exact: true });
    const services = home.getByRole('button', { name: language === 'ru' ? 'Услуги' : 'Services', exact: true });
    const brand = home.getByRole('button', { name: language === 'ru' ? 'Бренд' : 'Brand', exact: true });
    const assertCaptionFits = async () => {
      const overflow = await home.locator('.studio-exhibit__copy').evaluate(el => Array.from(el.children).some(child => child.getBoundingClientRect().right > el.getBoundingClientRect().right - 8));
      assert.equal(overflow, false, 'preview text must fit without clipping on a narrow phone');
    };
    assert.equal(await store.getAttribute('aria-pressed'), 'true');
    await assertCaptionFits();
    await services.tap();
    assert.equal(await services.getAttribute('aria-pressed'), 'true');
    await assertCaptionFits();
    await home.getByText(language === 'ru' ? 'Запись онлайн.' : 'Online booking.').waitFor();
    await home.getByRole('button', { name: language === 'ru' ? 'Следующий пример' : 'Next example' }).tap();
    assert.equal(await brand.getAttribute('aria-pressed'), 'true');
    await assertCaptionFits();
    await home.getByRole('button', { name: language === 'ru' ? 'Предыдущий пример' : 'Previous example' }).tap();
    assert.equal(await services.getAttribute('aria-pressed'), 'true');
    await home.getByTestId('home-open-demo').tap();
    await page.waitForURL('**/#/demos/beauty/app');
    await page.getByText('GLOW — салон красоты и SPA').waitFor({ state: 'attached' });
    await page.goBack();
    await home.waitFor({ state: 'visible' });
    await store.tap();
    await home.getByTestId('home-open-demo').tap();
    await page.waitForURL('**/#/demos/skincare-aura/app');
    await page.getByText('Сервисы Aura').waitFor({ state: 'visible' });
    await page.goBack();
    await home.waitFor({ state: 'visible' });
    await page.getByTestId('home-start-order').tap();
    await page.waitForURL('**/#/constructor');
    await page.getByTestId('order-page').waitFor({ state: 'visible' });
    await page.getByTestId('nav-showcase').tap();
    await home.waitFor({ state: 'visible' });
    await home.getByRole('button', { name: language === 'ru' ? /Узнать о консультанте/ : /Explore the consultant/ }).tap();
    await page.waitForURL('**/#/ai-process');
    await page.getByTestId('consultant-page').waitFor({ state: 'visible' });
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${name} ${width}×${height} ${language}: previews, real demos, order and consultant passed`);
  } finally { await browser.close(); }
}

async function swipeAndMotion() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'no-preference', serviceWorkers: 'block' });
    await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    const exhibit = page.getByTestId('home-exhibit');
    await exhibit.waitFor();
    await exhibit.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    const image = exhibit.locator('.studio-exhibit__object img');
    const firstTransform = await image.evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(1100);
    const secondTransform = await image.evaluate(el => getComputedStyle(el).transform);
    assert.notEqual(firstTransform, secondTransform, 'the 3D object should move when visible');
    const cdp = await context.newCDPSession(page);
    const box = await exhibit.boundingBox();
    const x = Math.round(box.x + box.width * .65), y = Math.max(100, Math.min(700, Math.round(box.y + box.height * .45)));
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 110, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.getByRole('button', { name: 'Услуги', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Услуги', exact: true }).getAttribute('aria-pressed'), 'true', 'swipe should switch the example');
    await cdp.detach();
    await context.close();
    console.log('Normal motion and a touch swipe through real examples passed');
  } finally { await browser.close(); }
}

(async () => {
  await run(chromium, 'Chromium', 320, 568);
  await run(chromium, 'Chromium', 390, 844);
  await run(chromium, 'Chromium', 430, 932, 'en');
  await run(webkit, 'WebKit', 390, 844);
  await swipeAndMotion();
})().catch(error => { console.error(error); process.exitCode = 1; });
