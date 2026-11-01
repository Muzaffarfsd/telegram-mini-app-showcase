const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const site = process.env.ORDER_TEST_URL || 'http://127.0.0.1:53723/';

async function open(browser, options = {}) {
  const context = await browser.newContext({ viewport: { width: options.width || 390, height: options.height || 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'ru-RU', reducedMotion: options.reduced ? 'reduce' : 'no-preference', serviceWorkers: 'block' });
  await context.addInitScript((native) => {
    localStorage.setItem('app-language', 'ru');
    if (native) {
      const user = { id: 12345, first_name: 'Мария', username: 'maria', language_code: 'ru' };
      sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppData: `user=${encodeURIComponent(JSON.stringify(user))}`, tgWebAppVersion: '9.0', tgWebAppPlatform: 'android' }));
      window.__nativeEvents = [];
      window.TelegramWebviewProxy = { postEvent(type, data) { window.__nativeEvents.push({ type, data: data ? JSON.parse(data) : {} }); } };
    }
  }, Boolean(options.native));
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('/#/constructor', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('order-page').waitFor({ timeout: 30000 });
  return { context, page, errors };
}

async function openTemplate(page) {
  const target = page.getByTestId('template-info-ecommerce-basic');
  await target.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await target.tap();
  await page.getByTestId('order-info-sheet').waitFor({ state: 'visible' });
}

async function sheetOffset(page) {
  return page.locator('.order-info-sheet').evaluate(el => {
    const value = getComputedStyle(el).transform;
    return value === 'none' ? 0 : new DOMMatrixReadOnly(value).m42;
  });
}

async function startTouch(page) {
  const box = await page.locator('.order-info-handle-area').boundingBox();
  assert.ok(box.height >= 43.5, `Drag target should be at least 44 CSS pixels: ${box.height}`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  return { cdp, x, y };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    {
      const { context, page, errors } = await open(browser);
      await openTemplate(page);
      const trace = await page.evaluate(() => new Promise(resolve => {
        const sheet = document.querySelector('.order-info-sheet');
        const samples = [];
        const start = performance.now();
        const frame = now => {
          const value = getComputedStyle(sheet).transform;
          samples.push({ time: now - start, y: value === 'none' ? 0 : new DOMMatrixReadOnly(value).m42 });
          if (now - start < 360) requestAnimationFrame(frame); else resolve(samples);
        };
        requestAnimationFrame(frame);
      }));
      assert.ok(new Set(trace.map(item => Math.round(item.y))).size >= 4, 'Opening should have multiple visible positions');
      assert.ok(Math.max(...trace.map(item => item.y)) > 20, 'Sheet should enter from below');
      assert.ok(Math.abs(trace.at(-1).y) < 2, 'Sheet should settle at the top of its position');

      const { cdp, x, y } = await startTouch(page);
      for (const distance of [25, 65, 95]) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + distance }] });
        await page.waitForTimeout(35);
        const held = await sheetOffset(page);
        assert.ok(Math.abs(held - distance) < 12, `Sheet should track the finger at ${distance}px: ${held}`);
      }
      assert.ok(Number(await page.locator('.order-info-backdrop').evaluate(el => getComputedStyle(el).opacity)) < 1);
      await page.waitForTimeout(150);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(340);
      assert.equal(await page.getByTestId('order-info-sheet').count(), 1, 'A small slow drag must return instead of closing');
      assert.ok(Math.abs(await sheetOffset(page)) < 2, 'Sheet should settle back after an incomplete drag');

      let box = await page.locator('.order-info-handle-area').boundingBox();
      const cancelX = box.x + box.width / 2;
      const cancelY = box.y + box.height / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cancelX, y: cancelY }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cancelX, y: cancelY + 160 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
      await page.waitForTimeout(340);
      assert.equal(await page.getByTestId('order-info-sheet').count(), 1, 'An interrupted gesture must not dismiss');
      assert.ok(Math.abs(await sheetOffset(page)) < 2, 'An interrupted gesture must settle back');

      box = await page.locator('.order-info-handle-area').boundingBox();
      const x2 = box.x + box.width / 2;
      const y2 = box.y + box.height / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x2, y: y2 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x2, y: y2 + 160 }] });
      await page.waitForTimeout(50);
      assert.ok((await sheetOffset(page)) > 130, 'Long drag should move the sheet before release');
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      assert.equal(await page.getByTestId('order-info-sheet').count(), 1, 'Dismissal should animate before removing the sheet');
      await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
      assert.equal(await page.locator('#root').evaluate(el => el.inert), false);
      assert.equal(await page.getByTestId('template-ecommerce-basic').getAttribute('aria-pressed'), 'false');
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`Touch motion: ${trace.length} opening frames sampled, finger tracking, snap-back and animated swipe dismissal passed`);
    }

    {
      const { context, page, errors } = await open(browser);
      await openTemplate(page);
      await page.waitForTimeout(70);
      const handle = page.locator('.order-info-handle-area');
      const box = await handle.boundingBox();
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      const event = { pointerId: 9, pointerType: 'touch', isPrimary: true, button: 0, clientX: x, clientY: y };
      await handle.dispatchEvent('pointerdown', event);
      const atGrab = await sheetOffset(page);
      const opacityAtGrab = Number(await page.locator('.order-info-backdrop').evaluate(el => getComputedStyle(el).opacity));
      await handle.dispatchEvent('pointermove', { ...event, clientY: y + 45 });
      await page.waitForTimeout(40);
      const whileHeld = await sheetOffset(page);
      assert.ok(Math.abs((whileHeld - atGrab) - 45) < 15, `Grabbing during the entrance must not make the sheet jump (grab ${atGrab}, held ${whileHeld})`);
      assert.ok(Number(await page.locator('.order-info-backdrop').evaluate(el => getComputedStyle(el).opacity)) <= opacityAtGrab + .01, 'Dragging down during entrance must not make the backdrop flash darker');
      await handle.dispatchEvent('pointercancel', { ...event, clientY: y + 45 });
      await page.waitForTimeout(300);
      assert.equal(await page.getByTestId('order-info-sheet').count(), 1);
      assert.ok(Math.abs(await sheetOffset(page)) < 2);
      assert.deepEqual(errors, []);
      await context.close();
      console.log('Interruptible entrance: grabbing during motion stays under the finger');
    }

    {
      const { context, page, errors } = await open(browser);
      await openTemplate(page);
      await page.waitForTimeout(340);
      const { cdp, x, y } = await startTouch(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 20 }] });
      await page.waitForTimeout(10);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 75 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.getByTestId('order-info-sheet').waitFor({ state: 'detached', timeout: 2000 });
      assert.deepEqual(errors, []);
      await context.close();
      console.log('Fast flick: a short quick downward gesture dismisses');
    }

    {
      const { context, page, errors } = await open(browser, { reduced: true });
      await openTemplate(page);
      const duration = await page.locator('.order-info-sheet').evaluate(el => parseFloat(getComputedStyle(el).animationDuration));
      assert.ok(duration < .02, 'Reduced-motion preference should remove the opening animation');
      const { cdp, x, y } = await startTouch(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 160 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
      assert.deepEqual(errors, []);
      await context.close();
      console.log('Reduced motion: immediate opening and swipe dismissal passed');
    }

    for (const [width, height] of [[320, 568], [430, 932]]) {
      const { context, page, errors } = await open(browser, { width, height });
      await openTemplate(page);
      await page.waitForTimeout(340);
      const { cdp, x, y } = await startTouch(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 90 }] });
      await page.waitForTimeout(40);
      assert.ok(Math.abs((await sheetOffset(page)) - 90) < 15, `Sheet must track touch at ${width}px`);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 165 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}×${height}: touch tracking and swipe dismissal passed`);
    }

    {
      const { context, page, errors } = await open(browser, { native: true });
      await page.waitForFunction(() => window.__nativeEvents.some(event => event.type === 'web_app_setup_main_button' && event.data.is_visible));
      await openTemplate(page);
      await page.waitForFunction(() => window.__nativeEvents.filter(event => event.type === 'web_app_setup_main_button').at(-1)?.data.is_visible === false);
      await page.waitForTimeout(340);
      await page.locator('.order-info-close').tap();
      assert.equal(await page.getByTestId('order-info-sheet').count(), 1, 'Close button should play the exit animation');
      assert.equal(await page.evaluate(() => window.__nativeEvents.filter(event => event.type === 'web_app_setup_main_button').at(-1)?.data.is_visible), false);
      await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
      await page.waitForFunction(() => window.__nativeEvents.filter(event => event.type === 'web_app_setup_main_button').at(-1)?.data.is_visible === true);
      assert.deepEqual(errors, []);
      await context.close();
      console.log('Telegram: native button stays hidden until the exit finishes');
    }

    {
      const { context, page, errors } = await open(browser);
      await page.getByTestId('template-ecommerce-basic').tap();
      await page.getByTestId('order-continue').tap();
      const next = page.getByTestId('order-continue');
      await next.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await next.tap();
      const support = page.locator('.order-support > summary');
      await support.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await support.tap();
      const info = page.getByTestId('plan-info-premium');
      await info.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await info.tap();
      await page.waitForTimeout(350);
      const body = page.locator('.order-info-content');
      const bounds = await body.boundingBox();
      const x = bounds.x + bounds.width / 2;
      const y = Math.min(bounds.y + bounds.height * .75, 720);
      const cdp = await context.newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (const distance of [25, 55, 90, 125, 160]) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - distance }] });
        await page.waitForTimeout(25);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(200);
      assert.ok(await body.evaluate(el => el.scrollTop) > 20, 'Long plan details must remain touch-scrollable');
      assert.ok(Math.abs(await sheetOffset(page)) < 2, 'Scrolling the content must not drag the whole sheet');
      assert.deepEqual(errors, []);
      await context.close();
      console.log('Touch content scrolling: long subscription details remain usable');
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
