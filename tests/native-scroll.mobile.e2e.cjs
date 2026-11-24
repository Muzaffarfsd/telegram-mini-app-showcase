const assert = require('node:assert/strict');
const { chromium } = require('playwright');
require('tsx/cjs');
const { demoApps } = require('../client/src/data/demoApps.ts');

const site = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:5000/';
const cases = [
  ['#/', '[data-testid="home-page"]', false],
  ['#/projects', '.projects-showcase', false],
  ['#/constructor', '[data-testid="order-page"]', false],
  ['#/profile', '[data-testid="profile-page"]', false],
  ['#/about', '[data-testid="about-page"]', false],
  ['#/ai-process', '[data-testid="consultant-page"]', false],
  ['#/demos/muraka-fashion/app', '[data-testid="muraka-fashion"]', true],
  ['#/demos/women-fashion/app', '[data-testid="women-fashion"]', true],
  ['#/demos/jewelry-store/app', '[data-testid="jewelry-store"]', true],
  ['#/demos/flower-store/app', '[data-testid="flower-store"]', false],
  ['#/demos/china-buyer/app', '[data-testid="china-buyer"]', false],
  ['#/demos/medical-center/app', '[data-testid="medical-center"]', false],
  ['#/demos/lumi-studio/app', '[data-testid="lumi-studio"]', false],
  ['#/demos/opt-market/app', '[data-testid="opt-market"]', false],
  ['#/demos/nike-sneakers/app', '[data-testid="royal-step"]', false],
  ['#/demos/skincare-aura/app', '[data-testid="demo-content"]', false],
  ['#/demos/apple-store/app', '.as-store', true],
];

async function swipe(cdp, start, end) {
  const points = (x, y) => [{ x, y }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(...start) });
  for (let i = 1; i <= 24; i++) {
    const x = start[0] + (end[0] - start[0]) * i / 24;
    const y = start[1] + (end[1] - start[1]) * i / 24;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(x, y) });
    await new Promise(resolve => setTimeout(resolve, 12));
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function checkChatScroll(page, cdp) {
  await page.getByRole('button', { name: 'Chat with Alex' }).press('Enter');
  const panel = page.getByTestId('ai-chat-panel');
  const messages = panel.locator('.ai-chat-scroll');
  const composer = panel.getByRole('textbox');
  await composer.waitFor();
  // Wait for the open animation and the initial scroll to the newest message.
  await composer.click({ trial: true });
  await page.waitForFunction(() => document.querySelector('.ai-chat-scroll')?.scrollTop > 200);
  const initialTop = await messages.evaluate(el => el.scrollTop);
  const backgroundTop = await page.locator('#root').evaluate(el => el.scrollTop);
  const composerY = (await composer.boundingBox()).y;
  const bounds = await messages.boundingBox();
  const x = bounds.x + bounds.width / 2;
  await swipe(cdp, [x, bounds.y + bounds.height * 0.3], [x, bounds.y + bounds.height * 0.7]);
  await page.waitForFunction(y => document.querySelector('.ai-chat-scroll').scrollTop < y - 60, initialTop);
  assert.ok(Math.abs((await composer.boundingBox()).y - composerY) < 2, 'chat input shifted during a message swipe');
  assert.ok(Math.abs(await page.locator('#root').evaluate(el => el.scrollTop) - backgroundTop) < 2, 'chat swipe moved the background');
  await panel.getByRole('button', { name: 'Close', exact: true }).press('Enter');
  await panel.waitFor({ state: 'hidden' });
}

async function checkShowcaseEnd(page, cdp) {
  await page.evaluate(() => {
    const style = document.documentElement.style;
    style.setProperty('--tg-viewport-height', '684px');
    style.setProperty('--sab', '34px');
    style.setProperty('--csab', '48px');
    const root = document.getElementById('root');
    root.scrollTop = root.scrollHeight - root.clientHeight - 150;
  });
  await swipe(cdp, [180, 485], [180, 220]);
  await page.waitForFunction(() => {
    const root = document.getElementById('root');
    return root.scrollTop >= root.scrollHeight - root.clientHeight - 2;
  });
  const order = await page.locator('.ps-order').boundingBox();
  const nav = await page.locator('nav.projects-nav').boundingBox();
  assert.ok(nav.y + nav.height <= 684 - 48 + 1, 'navigation must fit inside the visible Telegram viewport');
  assert.ok(order.y >= 0 && order.y + order.height + 16 <= nav.y, 'order button is obscured at the end of the showcase');
  await page.touchscreen.tap(order.x + order.width / 2, order.y + order.height / 2);
  await page.getByTestId('order-page').waitFor();
}

async function run() {
  const coveredDemos = cases.filter(([hash]) => hash.startsWith('#/demos/')).map(([hash]) => hash.split('/')[2]);
  assert.deepEqual(coveredDemos.sort(), demoApps.map(demo => demo.id).sort(), 'every published demo needs a swipe case');
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [hash, selector, hasHistory] of cases) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: 'ru-RU', serviceWorkers: 'block' });
      try {
        await ctx.route('https://telegram.org/js/telegram-web-app.js', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
        await ctx.route('**/api/**', r => r.fulfill({ json: { data: [] } }));
        if (hash === '#/profile') {
          await ctx.addInitScript(() => {
            const history = Array.from({ length: 36 }, (_, index) => ({
              id: 'scroll-test-' + index,
              role: index % 2 === 0 ? 'user' : 'assistant',
              content: 'Conversation history for touch scrolling, message ' + index,
              timestamp: new Date(1700000000000 + index * 60000).toISOString(),
            }));
            for (const key of ['web4tg_ai_demo_chat', 'web4tg_ai_chat']) localStorage.setItem(key, JSON.stringify(history));
          });
        }
        const page = await ctx.newPage();
        await page.goto(new URL(hash, site).href);
        await page.locator(selector).first().waitFor();
        const cdp = await ctx.newCDPSession(page);
        await page.evaluate(() => {
          const root = document.getElementById('root');
          const stats = window.scrollTest = { start: root.scrollTop, writes: 0, events: 0, lastEvent: 0 };
          const replace = history.replaceState.bind(history);
          history.replaceState = (...args) => { stats.writes++; return replace(...args); };
          root.addEventListener('scroll', () => { stats.events++; stats.lastEvent = performance.now(); }, { passive: true });
        });
        await swipe(cdp, [195, 650], [195, 315]);
        await page.waitForFunction(() => window.scrollTest.events > 0 && performance.now() - window.scrollTest.lastEvent > 220);
        if (hasHistory) await page.waitForFunction(() => window.scrollTest.writes > 0, undefined, { timeout: 3000 });
        const stats = await page.evaluate(() => ({ ...window.scrollTest, top: document.getElementById('root').scrollTop }));
        assert.ok(stats.top - stats.start > 80, hash + ' did not follow a vertical drag');
        if (hasHistory) assert.equal(stats.writes, 1, hash + ' must save a single settled position');
        else assert.equal(stats.writes, 0, hash + ' must keep history untouched during a drag');
        assert.equal(await page.locator('.w4m-panel.open').count(), 0, hash + ' opened the menu during a vertical drag');
        if (hash === '#/') {
          const beforeEdge = await page.locator('#root').evaluate(el => el.scrollTop);
          await swipe(cdp, [8, 520], [8, 340]);
          await page.waitForFunction(y => document.getElementById('root').scrollTop > y + 60, beforeEdge);
          assert.equal(await page.locator('.w4m-panel.open').count(), 0, 'a vertical swipe at the edge must scroll');
          await swipe(cdp, [8, 480], [210, 480]);
          await page.locator('.w4m-panel.open').waitFor();
        }
        if (hash === '#/profile') await checkChatScroll(page, cdp);
        if (hash === '#/projects') await checkShowcaseEnd(page, cdp);
        console.log(hash, JSON.stringify(stats));
      } finally { await ctx.close(); }
    }
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
