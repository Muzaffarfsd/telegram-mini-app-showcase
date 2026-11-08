const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const site = process.env.HOME_TEST_URL || 'http://127.0.0.1:5000/';
const examples = [
  ['Уличная', '/home-editorial/fashion-muraka-home-v2.webp', '/home-editorial/fashion-muraka-product-v2.webp'],
  ['Женская', '/home-editorial/fashion-mira-no-header-home-v4.webp', '/home-editorial/fashion-mira-no-header-product-v4.webp'],
  ['Кроссовки', '/home-editorial/sneaker-no-header-home-v4.webp', '/home-editorial/sneaker-no-header-jordan-v4.webp'],
  ['Техника', '/home-editorial/apple-home-real-v5.webp', '/home-editorial/apple-burgundy-product-real-v6.webp'],
  ['Цветы', '/home-editorial/florist-home-no-header-v3.webp', '/home-editorial/florist-eustoma-product-v1.webp'],
  ['Салон', '/home-editorial/lumi-home-no-header-v2.webp', '/home-editorial/lumi-service-no-header-v2.webp'],
];

async function check(width) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    const exhibit = page.getByTestId('home-exhibit');
    await exhibit.waitFor({ timeout: 30000 });
    const imageButton = page.getByTestId('home-open-demo');
    const cdp = await context.newCDPSession(page);
    const image = imageButton.locator('img');
    const categoryButtons = exhibit.locator('.home-demo__projects button');
    const screens = exhibit.locator('.home-demo__switch button');

    async function current(index, view) {
      await image.waitFor({ state: 'attached' });
      await page.waitForFunction(({ src, view }) => {
        const element = document.querySelector('[data-testid="home-open-demo"] img');
        return element?.getAttribute('src') === src && element.getAttribute('data-view') === view;
      }, { src: examples[index][view === 'home' ? 1 : 2], view });
      assert.equal(await image.getAttribute('src'), examples[index][view === 'home' ? 1 : 2]);
      assert.equal(await image.getAttribute('data-view'), view);
      assert.equal(await categoryButtons.nth(index).getAttribute('aria-pressed'), 'true');
      assert.equal(await screens.nth(view === 'home' ? 0 : 1).getAttribute('aria-pressed'), 'true');
      assert.equal(await exhibit.isVisible(), true, 'swiping must not open a demo');
    }
    async function swipe(dx, dy = 0) {
      await imageButton.scrollIntoViewIfNeeded();
      const box = await imageButton.boundingBox();
      assert.ok(box, 'artwork is visible');
      const x = box.x + box.width / 2;
      const y = Math.max(110, Math.min(box.y + box.height / 2, 700));
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let i = 1; i <= 6; i++) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 6, y: y + dy * i / 6 }] });
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }

    await current(0, 'home');
    // Visit both screens of every demo; the last image continues to the first.
    for (let index = 0; index < examples.length; index++) {
      await swipe(-95);
      await current(index, 'product');
      await swipe(-95);
      await current((index + 1) % examples.length, 'home');
    }
    // Reverse from first home to last service and through every earlier screen.
    for (let index = examples.length - 1; index >= 0; index--) {
      await swipe(95);
      await current(index, 'product');
      await swipe(95);
      await current(index, 'home');
    }
    // Direct category and screen controls continue to work after swiping.
    await categoryButtons.nth(2).evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await categoryButtons.nth(2).tap();
    await current(2, 'home');
    await screens.nth(1).tap();
    await current(2, 'product');
    await screens.nth(0).tap();
    await current(2, 'home');

    const scrollBefore = await page.locator('#root').evaluate(el => el.scrollTop);
    await swipe(0, -95);
    await page.waitForFunction(previous => document.getElementById('root').scrollTop > previous, scrollBefore);
    await current(2, 'home');
    assert.equal(new URL(page.url()).hash, '#/', 'vertical scrolling must not open a demo');

    // A fresh page tests click navigation independently of native scroll momentum.
    await page.reload({ waitUntil: 'domcontentloaded' });
    await exhibit.waitFor();
    await current(0, 'home');
    await imageButton.scrollIntoViewIfNeeded();
    await imageButton.click();
    await page.waitForURL('**/#/demos/muraka-fashion/app');
    assert.deepEqual(errors, []);
    console.log(`${width}px: touch carousel wraps in both directions, vertical scroll, controls and demo click passed`);
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => { for (const width of [320, 390]) await check(width); })().catch(error => { console.error(error); process.exitCode = 1; });
