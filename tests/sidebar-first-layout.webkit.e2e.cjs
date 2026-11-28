const assert = require('node:assert/strict');
const { webkit } = require('playwright');

const base = process.env.SIDEBAR_TEST_URL || 'http://127.0.0.1:41755/';

(async () => {
  const browser = await webkit.launch();
  try {
    for (const [width, height] of [[320, 568], [390, 844]]) {
      for (const route of ['#/constructor', '#/about']) {
        const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
        await context.addInitScript(() => {
          localStorage.setItem('app-language', 'ru');
          const observer = new MutationObserver(() => {
            const panel = document.querySelector('.w4m-panel');
            if (!panel) return;
            observer.disconnect();
            window.__firstSidebarLayout = {
              position: getComputedStyle(panel).position,
              right: panel.getBoundingClientRect().right,
              rootHeight: document.getElementById('root').scrollHeight,
            };
          });
          observer.observe(document, { subtree: true, childList: true });
        });
        await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
        await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
        const page = await context.newPage();
        try {
          await page.goto(new URL(route, base).href);
          await page.waitForFunction(() => window.__firstSidebarLayout);
          const first = await page.evaluate(() => window.__firstSidebarLayout);
          assert.equal(first.position, 'fixed', `${route} ${width}: panel must not initially take space in the scrolling page`);
          assert.ok(first.right <= 1, `${route} ${width}: closed panel must start offscreen, right=${first.right}`);
          await page.getByTestId('button-hamburger').tap();
          await page.locator('.w4m-panel.open').waitFor();
          assert.equal(await page.locator('.w4m-panel').getAttribute('aria-hidden'), 'false');
          await page.getByTestId('button-menu-close').tap();
          await page.waitForFunction(() => document.querySelector('.w4m-panel')?.getAttribute('aria-hidden') === 'true');
          console.log(`PASS WebKit ${width} ${route}: first panel is out of flow and menu opens/closes`);
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); }
})().then(() => {
  // All contexts and the browser are already closed; do not leave Playwright's
  // transport handles keeping the test runner alive on some Windows setups.
  process.exit(0);
}).catch(error => { console.error(error); process.exit(1); });
