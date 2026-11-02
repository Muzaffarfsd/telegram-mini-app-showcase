const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:53731/';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+pC2UAAAAASUVORK5CYII=', 'base64');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390, 430]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
      await context.addInitScript(() => {
        localStorage.setItem('app-language', 'ru');
        localStorage.setItem('web4tg_ai_chat', JSON.stringify([{ id: 'saved', role: 'user', content: 'Предыдущий настоящий диалог', timestamp: new Date().toISOString() }]));
        Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
      });
      await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
      const page = await context.newPage();
      const aiRequests = [], errors = [];
      page.on('request', request => { if (/\/api\/ai\//.test(request.url())) aiRequests.push(request.url()); });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('profile-page').waitFor();
      const trigger = page.getByRole('button', { name: 'Chat with Alex' });
      await trigger.tap();
      let panel = page.getByTestId('ai-chat-panel');
      await panel.locator('.ai-chat-demo-badge').getByText('Демо').waitFor();
      await panel.getByText(/настоящие ответы появятся после подключения ИИ/i).waitFor();
      if (width === 390) {
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        const violations = await page.evaluate(async () => (await window.axe.run(document.querySelector('[data-testid="ai-chat-panel"]'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })));
        assert.deepEqual(violations, [], 'demo accessibility checks');
      }
      assert.equal(await panel.getByText('Предыдущий настоящий диалог').count(), 0, 'live and demo histories must remain separate');
      if (width === 390 && process.env.AI_CHAT_SCREENSHOT) await page.screenshot({ path: process.env.AI_CHAT_SCREENSHOT });
      await panel.getByRole('button', { name: /Подобрать приложение/ }).tap();
      await panel.getByText('Пример ответа').first().waitFor();
      await panel.getByText(/для магазина можно выбрать приложение с каталогом/i).waitFor();
      await panel.getByRole('button', { name: 'Reply' }).first().tap();
      await page.waitForFunction(() => document.querySelector('.ai-chat-composer textarea')?.value.startsWith('> '));
      assert.match(await panel.getByRole('textbox', { name: 'Сообщение' }).inputValue(), /^> /, 'reply should prepare a draft rather than sending it');
      if (width === 390) {
        await panel.getByRole('button', { name: 'Copy' }).first().tap();
        await panel.getByText('Не удалось скопировать текст').waitFor();
        await panel.getByRole('button', { name: 'More actions' }).tap();
        await panel.getByRole('button', { name: 'Поделиться диалогом' }).tap();
        await panel.getByText('Не удалось поделиться диалогом').waitFor();
      }
      await panel.getByRole('textbox', { name: 'Сообщение' }).fill('У меня свой вопрос');
      await panel.getByRole('button', { name: 'Send message' }).tap();
      await panel.getByText(/Это пример диалога/i).waitFor();
      await panel.getByRole('button', { name: 'Вложения и возможности' }).tap();
      const [chooser] = await Promise.all([page.waitForEvent('filechooser'), panel.getByRole('button', { name: 'Attach image' }).tap()]);
      await chooser.setFiles({ name: 'example.png', mimeType: 'image/png', buffer: png });
      await panel.getByAltText('Прикреплённое изображение').waitFor();
      await panel.getByRole('button', { name: 'Send message' }).tap();
      await panel.getByText(/Фото добавлено для примера и никуда не отправлено/i).waitFor();
      await panel.getByRole('button', { name: 'Voice input' }).tap();
      await panel.getByText('Голосовой ввод появится после подключения консультанта.').waitFor();
      await panel.getByRole('button', { name: 'Close', exact: true }).tap();
      await panel.waitFor({ state: 'hidden' });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByTestId('profile-page').waitFor();
      await page.getByRole('button', { name: 'Chat with Alex' }).tap();
      panel = page.getByTestId('ai-chat-panel');
      await panel.getByText('У меня свой вопрос').waitFor();
      const saved = await page.evaluate(() => ({ demo: JSON.parse(localStorage.getItem('web4tg_ai_demo_chat') || '[]'), live: JSON.parse(localStorage.getItem('web4tg_ai_chat') || '[]') }));
      assert.ok(saved.demo.every(message => !message.imageUrl), 'photos must not be persisted in demo history');
      assert.equal(saved.live[0].content, 'Предыдущий настоящий диалог');
      assert.deepEqual(aiRequests, [], 'demo must not contact an AI API');
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}px: clearly marked demo, local examples and image, separate history, no AI requests passed`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
