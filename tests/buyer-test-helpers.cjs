const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const path = require('node:path');
const base = (process.env.BUYER_TEST_URL || 'http://127.0.0.1:5271/').replace(
  /\/?$/,
  '/',
);
const route = base + '#/demos/china-buyer/app';
const engine = process.env.BUYER_ENGINE === 'webkit' ? webkit : chromium;
function run(name, fn, cases = [undefined]) {
  (async () => {
    for (const variant of cases) {
      const browser = await engine.launch();
      try {
        await fn(browser, variant);
      } finally {
        await browser.close();
      }
    }
    console.log('PASS', process.env.BUYER_ENGINE || 'chromium', name);
  })().then(
    () => process.exit(0),
    (e) => {
      console.error(e);
      process.exit(1);
    },
  );
}
async function open(
  browser,
  {
    width = 390,
    ru = true,
    seed,
    blocked = false,
    reducedMotion = 'reduce',
  } = {},
) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 1,
    isMobile: width < 700,
    hasTouch: width < 700,
    locale: ru ? 'ru-RU' : 'en-GB',
    reducedMotion,
    serviceWorkers: 'block',
  });
  await context.route('https://telegram.org/js/telegram-web-app.js', (r) =>
    r.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  await context.addInitScript(
    ({ ru, seed, blocked }) => {
      localStorage.setItem('app-language', ru ? 'ru' : 'en');
      if (seed && !sessionStorage.getItem('yb-test-seeded')) {
        for (const [k, v] of Object.entries(seed))
          localStorage.setItem(k, JSON.stringify(v));
        sessionStorage.setItem('yb-test-seeded', '1');
      }
      if (blocked) {
        const orig = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) {
          if (k === 'china-buyer-demo-requests-v1')
            throw new DOMException('blocked', 'SecurityError');
          return orig.call(this, k, v);
        };
      }
    },
    { ru, seed, blocked },
  );
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('/china-buyer/'))
      errors.push(r.status() + ' ' + r.url());
  });
  await page.goto(route, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('china-buyer').waitFor({ timeout: 30000 });
  return {
    page,
    context,
    errors,
    nav: page.getByRole('navigation', {
      name: ru ? 'Навигация приложения' : 'App navigation',
    }),
  };
}
async function widthOK(p) {
  const data = await p.evaluate(() => [
    document.documentElement.scrollWidth,
    document.documentElement.clientWidth,
  ]);
  assert.ok(data[0] <= data[1] + 1, 'Horizontal overflow ' + data.join('/'));
}
const btn = (p, name) => p.getByRole('button', { name, exact: true });
const photo = path.resolve(
  __dirname,
  '../client/public/china-buyer/sourcing/products/clay/thumb.webp',
);
module.exports = { assert, run, open, widthOK, btn, photo };
