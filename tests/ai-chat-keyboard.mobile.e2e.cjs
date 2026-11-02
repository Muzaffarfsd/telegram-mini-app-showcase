const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:53731/';

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(() => {
      localStorage.setItem('app-language', 'ru');
      const viewport = new EventTarget();
      viewport.height = innerHeight;
      viewport.width = innerWidth;
      viewport.offsetTop = 0;
      viewport.offsetLeft = 0;
      viewport.scale = 1;
      Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
      window.__setVisualViewport = (height, top = 0) => {
        viewport.height = height;
        viewport.offsetTop = top;
        viewport.dispatchEvent(new Event('resize'));
      };
    });
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('profile-page').waitFor();
    await page.waitForFunction(() => { const root = document.getElementById('root'); return root && root.scrollHeight > root.clientHeight + 400; });
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 250));
    const originalScroll = await page.evaluate(() => window.scrollY);
    await page.evaluate(() => { document.getElementById('root').scrollTop = 700; });
    await page.waitForTimeout(250);
    const rootScroll = await page.evaluate(() => document.getElementById('root').scrollTop);
    assert.ok(rootScroll > 0, 'test should start on a scrolled page');
    const triggerBox = await page.getByRole('button', { name: 'Chat with Alex' }).boundingBox();
    await page.touchscreen.tap(triggerBox.x + triggerBox.width / 2, triggerBox.y + triggerBox.height / 2);
    const panel = page.getByTestId('ai-chat-panel');
    await panel.waitFor({ state: 'visible' });
    const openScroll = await page.evaluate(() => document.getElementById('root').scrollTop);
    assert.ok(Math.abs(openScroll - rootScroll) < 2, `opening chat should preserve background position (${rootScroll} → ${openScroll})`);
    const originalTop = (await panel.boundingBox()).y;
    const input = panel.getByRole('textbox', { name: 'Сообщение' });
    await input.tap();
    const focused = await input.evaluate(el => ({ outline: getComputedStyle(el).outlineWidth, style: getComputedStyle(el).outlineStyle, color: getComputedStyle(el).outlineColor, shadow: getComputedStyle(el).boxShadow, fontSize: getComputedStyle(el).fontSize }));
    assert.equal(focused.style, 'none', `touch focus should not add a colored frame: ${JSON.stringify(focused)}`);
    assert.equal(focused.fontSize, '16px', 'mobile input should not trigger text zoom');
    assert.equal(await page.evaluate(() => getComputedStyle(document.getElementById('root')).overflowY), 'hidden', 'background should stay locked while the chat is open');
    for (const [height, top] of [[690, 0], [600, 0], [544, 0], [544, 30]]) {
      await page.evaluate(([h, y]) => window.__setVisualViewport(h, y), [height, top]);
      await page.waitForFunction(([h, y, originalTop]) => {
        const rect = document.querySelector('[data-testid="ai-chat-panel"]')?.getBoundingClientRect();
        return rect && Math.abs(rect.top - originalTop) < 2 && Math.abs(rect.bottom - (y + h)) < 2;
      }, [height, top, originalTop]);
      const box = await input.boundingBox();
      assert.ok(box.y >= top && box.y + box.height <= top + height + 1, 'input should stay above the simulated keyboard');
      assert.ok(Math.abs((await page.evaluate(() => window.scrollY)) - originalScroll) < 1, 'window position should not change during keyboard resize');
      assert.ok(Math.abs((await page.evaluate(() => document.getElementById('root').scrollTop)) - rootScroll) < 2, 'background should not move while typing');
    }
    await input.fill('Сообщение без скачков');
    await input.blur();
    await page.evaluate(() => window.__setVisualViewport(844, 0));
    await panel.getByRole('button', { name: 'Close', exact: true }).tap();
    await panel.waitFor({ state: 'hidden' });
    await page.waitForFunction(y => Math.abs(window.scrollY - y) < 2, originalScroll);
    assert.ok(Math.abs((await page.evaluate(() => document.getElementById('root').scrollTop)) - rootScroll) < 2, 'the original page position should be restored');
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.getElementById('root')).overflowY), 'hidden');
    assert.deepEqual(errors, []);
    await context.close();
    console.log('Touch focus has no purple outline; simulated keyboard resize, visual viewport offset and background scroll restoration passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
