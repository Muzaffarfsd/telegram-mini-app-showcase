const { chromium } = require('playwright');
const assert = require('node:assert/strict');
// Run against a local Vite server started with VITE_AI_CHAT_MODE=live; all provider calls are mocked.
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:53733/';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+pC2UAAAAASUVORK5CYII=', 'base64');

async function run(width, language) {
  const browser = await chromium.launch({ headless: true });
  const requests = [];
  try {
    const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: language === 'ru' ? 'ru-RU' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(lang => {
      localStorage.setItem('app-language', lang); localStorage.setItem('app-theme', 'dark');
      Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: undefined });
      Object.defineProperty(window, 'webkitSpeechRecognition', { configurable: true, value: undefined });
    }, language);
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', async route => {
      if (route.request().url().includes('/api/ai/chat')) {
        requests.push(route.request().postDataJSON());
        if (requests.length === 2) return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' });
        if (requests.length === 4) return route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'data: {"type":"chunk","text":"Начало ответа."}\n\n' });
        if (requests.length === 5) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          return route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'data: {"type":"done"}\n\n' }).catch(() => {});
        }
        const answer = requests.length === 1
          ? 'Для магазина подойдёт Mini App с каталогом.\n```widget\n' + JSON.stringify({ type: 'price_comparison', packages: [{ name: 'Стандарт', price: 'По запросу', features: ['Каталог'] }] }) + '\n```'
          : 'Изображение получено, обсудим ваш проект.';
        const body = `data: ${JSON.stringify({ type: 'chunk', text: answer })}\n\ndata: ${JSON.stringify({ type: 'done', persona: 'alex', personaName: 'Алекс' })}\n\n`;
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"data":[]}' });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor();
    const trigger = page.getByRole('button', { name: 'Chat with Alex' });
    await trigger.tap();
    const panel = page.getByTestId('ai-chat-panel');
    await panel.waitFor({ state: 'visible' });
    await panel.getByRole('heading', { name: language === 'ru' ? 'Привет! Я ваш ИИ-консультант' : "Hello! I'm your AI consultant" }).waitFor();
    assert.equal(await panel.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    assert.equal(await panel.evaluate(el => el.scrollWidth <= el.clientWidth), true, 'sheet must fit mobile width');
    assert.equal((await trigger.boundingBox()).width, 44, 'header button size changed');
    if (width === 390 && language === 'ru') {
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[data-testid="ai-chat-panel"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], 'chat accessibility checks');
    }
    if (width === 390 && language === 'ru' && process.env.AI_CHAT_SCREENSHOT) await page.screenshot({ path: process.env.AI_CHAT_SCREENSHOT });

    const suggestion = panel.getByRole('button', { name: language === 'ru' ? /Подобрать приложение/ : /Find an app/ });
    await suggestion.tap();
    await panel.getByText('Для магазина подойдёт Mini App с каталогом.').waitFor();
    await panel.getByText('Сравнение вариантов').waitFor();
    assert.equal(requests.length, 1);
    assert.ok(requests[0].messages.at(-1).parts[0].text.length > 10);

    await panel.getByRole('button', { name: 'More actions' }).tap();
    await panel.getByRole('button', { name: language === 'ru' ? /Поиск в диалоге/ : /Search conversation/ }).tap();
    const search = panel.getByRole('textbox', { name: language === 'ru' ? 'Поиск в диалоге' : 'Search conversation' });
    await search.fill('каталогом');
    await panel.getByText('Для магазина подойдёт Mini App с каталогом.').waitFor();
    await panel.getByRole('button', { name: language === 'ru' ? 'Закрыть поиск' : 'Close search' }).tap();

    await panel.getByRole('button', { name: language === 'ru' ? 'Вложения и возможности' : 'Attachments and tools' }).tap();
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), panel.getByRole('button', { name: 'Attach image' }).tap()]);
    await chooser.setFiles({ name: 'example.png', mimeType: 'image/png', buffer: png });
    await panel.getByAltText(language === 'ru' ? 'Прикреплённое изображение' : 'Attached image').waitFor();
    await panel.getByRole('textbox', { name: language === 'ru' ? 'Сообщение' : 'Message' }).fill('Посмотрите изображение');
    await panel.getByRole('button', { name: 'Send message' }).tap();
    await panel.getByRole('button', { name: /Повторить/ }).waitFor();
    assert.ok(requests[1].messages.at(-1).parts.some(part => part.inlineData?.mimeType === 'image/png'), 'first request must include the image');
    await panel.getByRole('button', { name: /Повторить/ }).tap();
    await panel.getByText('Изображение получено, обсудим ваш проект.').waitFor();
    assert.ok(requests[2].messages.at(-1).parts.some(part => part.inlineData?.mimeType === 'image/png'), 'retry must preserve the attached image');
    assert.equal(requests[2].messages.length, 3, 'retry should use the preceding conversation without the failed response');
    if (width === 390 && language === 'ru') {
      const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[data-testid="ai-chat-panel"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
      assert.deepEqual(violations, [], 'conversation accessibility checks');
    }
    if (width === 390 && language === 'ru' && process.env.AI_CHAT_CONVO_SCREENSHOT) await page.screenshot({ path: process.env.AI_CHAT_CONVO_SCREENSHOT });

    await panel.getByRole('button', { name: 'Voice input' }).tap();
    await panel.getByRole('status').getByText(language === 'ru' ? /Голосовой ввод недоступен/ : /Voice input isn't available/).waitFor();
    if (width === 390 && language === 'ru') {
      const input = panel.getByRole('textbox', { name: 'Сообщение' });
      await input.fill('Продолжите, пожалуйста');
      await panel.getByRole('button', { name: 'Send message' }).tap();
      await panel.getByText(/Ответ прервался/).waitFor();
      await input.fill('Новый вопрос');
      await panel.getByRole('button', { name: 'Send message' }).tap();
      await panel.getByRole('button', { name: 'Stop generation' }).tap();
      await panel.getByText('Ответ остановлен.').waitFor();
      await input.fill('Сохранить мой черновик');
      await panel.getByRole('button', { name: 'Close', exact: true }).tap();
      await panel.waitFor({ state: 'hidden' });
      await trigger.tap();
      assert.equal(await panel.getByRole('textbox', { name: 'Сообщение' }).inputValue(), 'Сохранить мой черновик');
      await panel.getByRole('textbox', { name: 'Сообщение' }).fill('');
    }
    await panel.getByRole('button', { name: 'Close', exact: true }).tap();
    await panel.waitFor({ state: 'hidden' });
    await trigger.tap();
    await page.getByText('Изображение получено, обсудим ваш проект.').waitFor();
    if (width === 390) {
      const cdp = await context.newCDPSession(page);
      const grabber = await panel.getByTestId('ai-chat-grabber').boundingBox();
      const x = Math.round(grabber.x + grabber.width / 2);
      const y = Math.round(grabber.y + grabber.height / 2);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 65 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 145 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await panel.waitFor({ state: 'hidden' });
      await cdp.detach();
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${width}px ${language}: open, suggestion, answer, search, image, error/retry, voice fallback, history and swipe passed`);
  } finally { await browser.close(); }
}

async function retryAfterReload() {
  const browser = await chromium.launch({ headless: true });
  const requests = [];
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => {
      if (route.request().url().includes('/api/ai/chat')) {
        requests.push(route.request().postDataJSON());
        if (requests.length === 1) return route.fulfill({ status: 503, body: 'unavailable' });
        return route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'data: {"type":"chunk","text":"Изображение получено."}\n\ndata: {"type":"done"}\n\n' });
      }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"data":[]}' });
    });
    const page = await context.newPage();
    await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor();
    await page.getByRole('button', { name: 'Chat with Alex' }).tap();
    let panel = page.getByTestId('ai-chat-panel');
    await panel.getByRole('button', { name: 'Вложения и возможности' }).tap();
    let chooserPromise = page.waitForEvent('filechooser');
    await panel.getByRole('button', { name: 'Attach image' }).tap();
    let chooser = await chooserPromise;
    await chooser.setFiles({ name: 'too-big.png', mimeType: 'image/png', buffer: Buffer.alloc(4 * 1024 * 1024 + 1) });
    await panel.getByText('Изображение должно быть меньше 4 МБ.').waitFor();
    await panel.getByRole('button', { name: 'Вложения и возможности' }).tap();
    chooserPromise = page.waitForEvent('filechooser');
    await panel.getByRole('button', { name: 'Attach image' }).tap();
    chooser = await chooserPromise;
    await chooser.setFiles({ name: 'example.png', mimeType: 'image/png', buffer: png });
    await panel.getByAltText('Прикреплённое изображение').waitFor();
    await panel.getByRole('textbox', { name: 'Сообщение' }).fill('Проверьте фото');
    await panel.getByRole('button', { name: 'Send message' }).tap();
    await panel.getByRole('button', { name: /Повторить/ }).waitFor();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('web4tg_ai_chat') || '[]').some(message => message.hadImage));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor();
    await page.getByRole('button', { name: 'Chat with Alex' }).tap();
    panel = page.getByTestId('ai-chat-panel');
    await panel.getByRole('button', { name: /Повторить/ }).tap();
    await panel.getByText('Изображение больше недоступно. Прикрепите его снова.').waitFor();
    assert.equal(requests.length, 1, 'retry must not silently drop the image after reload');
    await context.close();
    console.log('Oversized image feedback and retry after reload passed without storing image data');
  } finally { await browser.close(); }
}

async function motionAndShortScreen() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'no-preference', serviceWorkers: 'block' });
    await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor();
    await page.getByRole('button', { name: 'Chat with Alex' }).tap();
    const panel = page.getByTestId('ai-chat-panel');
    await panel.waitFor({ state: 'visible' });
    const motion = await panel.evaluate(async el => {
      const started = performance.now();
      const offsets = [];
      while (performance.now() - started < 900) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const transform = getComputedStyle(el).transform;
        const offset = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
        offsets.push(Math.round(offset));
        if (offsets.length > 3 && Math.abs(offset) < 1) break;
      }
      return { offsets, duration: performance.now() - started };
    });
    assert.ok(new Set(motion.offsets).size > 1, 'opening should move smoothly');
    assert.ok(Math.abs(motion.offsets.at(-1)) < 2 && motion.duration < 900, 'opening should settle quickly');
    const scrollTop = await panel.locator('.ai-chat-scroll').evaluate(el => el.scrollTop);
    assert.equal(scrollTop, 0, 'welcome should start at the top on a short phone');
    const composer = await panel.getByRole('textbox', { name: 'Сообщение' }).boundingBox();
    assert.ok(composer.y >= 0 && composer.y + composer.height <= 568, 'composer must stay visible on a short phone');
    await page.setViewportSize({ width: 320, height: 420 });
    const resized = await panel.getByRole('textbox', { name: 'Сообщение' }).boundingBox();
    assert.ok(resized.y >= 0 && resized.y + resized.height <= 420, 'composer must remain visible when the viewport shrinks');
    const cdp = await context.newCDPSession(page);
    const grabber = await panel.getByTestId('ai-chat-grabber').boundingBox();
    const x = Math.round(grabber.x + grabber.width / 2), y = Math.round(grabber.y + grabber.height / 2);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 45 }] });
    await page.waitForTimeout(300);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await panel.isVisible(), true, 'a short slow drag should not close the sheet');
    await cdp.detach();
    await context.close();
    console.log(`Normal motion settled in ${Math.round(motion.duration)}ms; short screen, resized viewport and cancelled drag passed`);
  } finally { await browser.close(); }
}

(async () => {
  for (const width of [390, 320, 430]) await run(width, 'ru');
  await run(390, 'en');
  await retryAfterReload();
  await motionAndShortScreen();
})().catch(error => { console.error(error); process.exitCode = 1; });
