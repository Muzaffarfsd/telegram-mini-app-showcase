const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:53731/';

async function run(browserType, name) {
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
      isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block',
    });
    await context.addInitScript(() => {
      localStorage.setItem('app-language', 'ru');
      const viewport = new EventTarget();
      Object.assign(viewport, { width: innerWidth, height: innerHeight, offsetTop: 0, offsetLeft: 0, scale: 1 });
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
      window.__simulateKeyboardViewport = (height, top = 0) => {
        viewport.height = height;
        viewport.offsetTop = top;
        viewport.dispatchEvent(new Event('resize'));
        viewport.dispatchEvent(new Event('scroll'));
      };
    });
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor();
    await page.waitForFunction(() => document.getElementById('root').scrollHeight > document.getElementById('root').clientHeight + 400);
    await page.waitForTimeout(500);
    await page.evaluate(() => { document.getElementById('root').scrollTop = 600; });
    const originalRootScroll = await page.evaluate(() => document.getElementById('root').scrollTop);
    const trigger = await page.getByRole('button', { name: 'Chat with Alex' }).boundingBox();
    await page.touchscreen.tap(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2);
    const panel = page.getByTestId('ai-chat-panel');
    await panel.waitFor({ state: 'visible' });
    await page.waitForTimeout(300);
    const initial = await panel.boundingBox();
    const input = panel.getByRole('textbox', { name: 'Сообщение' });
    await input.tap();

    async function check(height, visualHeight, offset = 0, description = '') {
      await page.setViewportSize({ width: 390, height });
      await page.evaluate(([h, y]) => window.__simulateKeyboardViewport(h, y), [visualHeight, offset]);
      await page.waitForTimeout(80);
      const box = await panel.boundingBox();
      const field = await input.boundingBox();
      const visibleBottom = Math.min(height, visualHeight + offset);
      assert.ok(Math.abs(box.y - initial.y) < 2, `${name}: ${description}: window top jumped ${initial.y} → ${box.y}`);
      assert.ok(Math.abs(box.y + box.height - visibleBottom) < 2, `${name}: ${description}: window bottom should stay above keyboard (${box.y + box.height}, expected ${visibleBottom})`);
      assert.ok(field.y + field.height <= visibleBottom + 2, `${name}: ${description}: input is hidden by keyboard`);
      const rootScroll = await page.evaluate(() => document.getElementById('root').scrollTop);
      assert.ok(Math.abs(rootScroll - originalRootScroll) < 2, `${name}: ${description}: background moved ${originalRootScroll} → ${rootScroll}`);
    }

    // Visual-only resizing resembles iOS; coupled resizing reproduces Android WebView/Telegram.
    await check(844, 690, 0, 'visual viewport shrinks');
    await check(844, 600, 0, 'keyboard opens further');
    await check(844, 544, 30, 'visual viewport also pans');
    await check(690, 544, 30, 'host layout resizes asynchronously');
    await check(574, 544, 30, 'layout and visual viewport converge');
    await check(544, 544, 0, 'host layout resized completely');
    await input.blur();
    await check(544, 544, 0, 'focus leaves before keyboard closes');
    await check(690, 544, 0, 'layout expands before keyboard closes');
    await check(844, 690, 0, 'keyboard closes');
    await check(844, 844, 0, 'keyboard closed');
    await panel.getByRole('button', { name: 'Close', exact: true }).tap();
    await panel.waitFor({ state: 'hidden' });
    assert.ok(Math.abs((await page.evaluate(() => document.getElementById('root').scrollTop)) - originalRootScroll) < 2, `${name}: background position after close`);
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${name}: stable panel, composer visibility and background across keyboard/host resize passed`);
  } finally { await browser.close(); }
}

(async () => {
  await run(chromium, 'Chromium mobile');
  await run(webkit, 'WebKit mobile');
})().catch(error => { console.error(error); process.exitCode = 1; });
