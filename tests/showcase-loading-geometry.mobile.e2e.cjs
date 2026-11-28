const assert = require('node:assert/strict');
const { webkit, chromium } = require('playwright');

// Run against a production build: Vite's development module names differ.
const base = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:41758/';
const closeWithin = promise => Promise.race([
  promise,
  new Promise(resolve => setTimeout(resolve, 2000)),
]);

async function check(browser, engine, width, scenario) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: scenario === 'blocked' ? 'en-US' : 'ru-RU',
    timezoneId: scenario === 'blocked' ? 'America/New_York' : 'Europe/Moscow',
    serviceWorkers: 'block',
  });
  if (scenario === 'blocked') {
    await context.addInitScript(() => {
      for (const key of ['localStorage', 'sessionStorage']) {
        Object.defineProperty(window, key, {
          configurable: true,
          get() { throw new Error('storage blocked'); },
        });
      }
    });
  } else {
    await context.addInitScript(lang => localStorage.setItem('app-language', lang), scenario === 'en' ? 'en' : 'ru');
  }

  let releaseSdk, releaseRoute;
  const sdk = new Promise(resolve => { releaseSdk = resolve; });
  const chunk = new Promise(resolve => { releaseRoute = resolve; });
  await context.route('https://telegram.org/js/telegram-web-app.js', async route => {
    await sdk;
    await route.fulfill({ contentType: 'text/javascript', body: '' });
  });
  await context.route(/\/assets\/ProjectsPage-[^/]+\.js$/, async route => {
    await chunk;
    await route.fallback();
  });

  const page = await context.newPage();
  try {
    await page.goto(new URL('#/projects', base).href, { waitUntil: 'commit' });
    if (scenario === 'large') {
      await page.addStyleTag({ content: '.projects-load-content,.projects-intro-slot{font-size:18px!important}' });
    }
    const expectedLang = ['en', 'blocked'].includes(scenario) ? 'en' : 'ru';
    const box = async selector => {
      const el = page.locator(selector).first();
      await el.waitFor();
      return el.evaluate(element => {
        const { x, y, width, height } = element.getBoundingClientRect();
        return [x, y, width, height].map(Math.round);
      });
    };
    const initial = await box('#projects-static-shell .projects-load-card');
    assert.equal(await page.locator('html').getAttribute('lang'), expectedLang, `${engine} ${width} ${scenario}: initial language`);
    releaseSdk();
    assert.deepEqual(await box('[data-testid=projects-skeleton] .projects-load-card'), initial, `${engine} ${width} ${scenario}: static to React`);
    releaseRoute();
    assert.deepEqual(await box('.ps-card'), initial, `${engine} ${width} ${scenario}: React to content`);
    console.log(`PASS ${engine} ${width} ${scenario}: ${JSON.stringify(initial)}`);
  } finally {
    releaseSdk();
    releaseRoute();
    // A Windows WebKit process can hang while closing even after a successful case.
    await closeWithin(context.close());
  }
}

(async () => {
  for (const [engine, type] of [['webkit', webkit], ['chromium', chromium]]) {
    const browser = await type.launch();
    try {
      for (const width of [320, 390]) {
        for (const scenario of ['ru', 'en', 'blocked', 'large']) {
          await check(browser, engine, width, scenario);
        }
      }
    } finally {
      await closeWithin(browser.close());
    }
  }
  process.exit(0);
})().catch(error => { console.error(error); process.exit(1); });
