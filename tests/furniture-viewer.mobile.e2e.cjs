const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const sharp = require('sharp');

const base = process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:41755/';
const url = new URL('/#/demos/furniture-studio/app', base).href;

async function openViewer(page) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid=furniture-store]').waitFor();
  await page.getByRole('button', { name: 'Каталог', exact: true }).click();
  await page.locator('.fs-card-open').first().click();
  await page.locator('.fs-product-info').waitFor();
  const opener = page.getByRole('button', { name: '3D-обзор', exact: true });
  await opener.scrollIntoViewIfNeeded();
  const scrollTop = await page.evaluate(() => document.getElementById('root').scrollTop);
  await opener.click();
  await page.locator('.rfv[role=dialog]').waitFor();
  return scrollTop;
}
async function pixels(canvas) {
  await new Promise(resolve => setTimeout(resolve, 180));
  return sharp(await canvas.screenshot()).removeAlpha().resize(128, 128).raw().toBuffer();
}
function difference(a, b) {
  assert.equal(a.length, b.length);
  return a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0) / a.length;
}
async function gesture(cdp, type, points) {
  await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points });
}
async function exercise(width, height) {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  try {
    const initialScroll = await openViewer(page);
    const viewer = page.locator('.rfv');
    await viewer.getByRole('button', { name: 'Увеличить', exact: true }).waitFor({ timeout: 60000 });
    assert.equal(await page.locator('#root').getAttribute('inert'), '');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Закрыть 3D-обзор');
    await page.keyboard.press('Shift+Tab');
    assert.match(await page.evaluate(() => document.activeElement?.textContent || ''), /Разместить в комнате/);
    const box = await viewer.boundingBox();
    assert.ok(box.x === 0 && box.y === 0 && box.width === width && box.height === height, 'viewer should use the viewport');
    await viewer.locator('summary').click();
    const canvas = viewer.locator('canvas');
    const before = await pixels(canvas);
    const stage = await canvas.boundingBox();
    const cdp = await context.newCDPSession(page);
    const x = stage.x + stage.width * 0.5, y = stage.y + stage.height * 0.5;
    await gesture(cdp, 'touchStart', [{ x, y, id: 1 }]);
    for (let n = 1; n <= 6; n++) await gesture(cdp, 'touchMove', [{ x, y: y + n * 7, id: 1 }]);
    await gesture(cdp, 'touchEnd', []);
    const vertical = await pixels(canvas);
    assert.ok(difference(before, vertical) > 0.3, 'one-finger vertical motion should rotate the model');
    await viewer.getByRole('button', { name: 'Вернуть исходный вид' }).click();
    const reset = await pixels(canvas);
    const stage2 = await canvas.boundingBox();
    const cx = stage2.x + stage2.width / 2, cy = stage2.y + stage2.height / 2;
    await gesture(cdp, 'touchStart', [{ x: cx - 50, y: cy, id: 1 }, { x: cx + 50, y: cy, id: 2 }]);
    await gesture(cdp, 'touchMove', [{ x: cx - 62.5, y: cy, id: 1 }, { x: cx + 62.5, y: cy, id: 2 }]);
    await gesture(cdp, 'touchEnd', []);
    const pinched = await pixels(canvas);
    assert.ok(difference(reset, pinched) > 0.4, 'pinch should visibly change model size');
    await viewer.getByRole('button', { name: 'Вернуть исходный вид' }).click();
    await viewer.getByRole('button', { name: 'Увеличить', exact: true }).click();
    const buttonZoom = await pixels(canvas);
    assert.ok(difference(pinched, buttonZoom) < difference(reset, pinched) * 0.3, 'pinch should zoom without adding rotation');
    await cdp.detach();
    await viewer.getByRole('button', { name: 'Сзади', exact: true }).click();
    assert.equal(await viewer.getByRole('button', { name: 'Сзади', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.goBack();
    await viewer.waitFor({ state: 'detached' });
    assert.equal(await page.locator('#root').getAttribute('inert'), null);
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), '3D-обзор');
    await page.waitForTimeout(250);
    assert.ok(Math.abs(await page.evaluate(() => document.getElementById('root').scrollTop) - initialScroll) < 2, 'browser back preserves the product scroll position');
    await page.getByRole('button', { name: '3D-обзор', exact: true }).click();
    await page.locator('.rfv').getByRole('button', { name: 'Разместить в комнате' }).click();
    await page.locator('[data-testid=furniture-planner]').waitFor({ timeout: 60000 });
    await page.keyboard.press('Escape');
    await page.locator('.rfv[role=dialog]').waitFor({ timeout: 30000 });
    assert.equal(await page.locator('#root').getAttribute('inert'), '', 'underlying store remains inert after returning from planner');
    await page.keyboard.press('Escape');
    await page.locator('.rfv').waitFor({ state: 'detached', timeout: 30000 });
    assert.equal(await page.locator('#root').getAttribute('inert'), null, 'store is active after closing viewer');
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), '3D-обзор', 'focus returns to the viewer trigger after planner round trip');
    assert.deepEqual(errors, []);
    console.log(`PASS immersive 3D ${width}x${height}: orbit, pinch, presets, focus, history, planner handoff`);
  } finally { await browser.close(); }
}
async function retryAfterNetworkFailure() {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  const page = await context.newPage();
  const pattern = '**/B072FVHRZ3.glb';
  try {
    await page.route(pattern, route => route.abort());
    await openViewer(page);
    const viewer = page.locator('.rfv');
    await viewer.getByText('3D недоступно. Показываем фотографию.').waitFor({ timeout: 45000 });
    await page.unroute(pattern);
    await viewer.getByRole('button', { name: 'Повторить' }).click();
    await viewer.getByRole('button', { name: 'Увеличить', exact: true }).waitFor({ timeout: 60000 });
    await viewer.getByRole('button', { name: 'Закрыть 3D-обзор' }).click();
    await viewer.waitFor({ state: 'detached' });
    console.log('PASS immersive 3D: model load failure and recovery');
  } finally { await browser.close(); }
}
async function productionLikeCsp() {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  const page = await context.newPage();
  try {
    await page.route('**/*', async route => {
      const request = route.request();
      if (!request.isNavigationRequest() || new URL(request.url()).origin !== new URL(base).origin) return route.continue();
      const response = await route.fetch();
      const policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data: blob:; connect-src 'self' blob: ws: wss:; worker-src 'self' blob:";
      return route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': policy } });
    });
    await openViewer(page);
    await page.locator('.rfv').getByRole('button', { name: 'Увеличить', exact: true }).waitFor({ timeout: 60000 });
    await page.locator('.rfv').getByRole('button', { name: 'Закрыть 3D-обзор' }).click();
    console.log('PASS immersive 3D: WASM and embedded textures with production-like CSP');
  } finally { await browser.close(); }
}
async function fallback() {
  const browser = await webkit.launch();
  const context = await browser.newContext({ viewport: { width: 320, height: 700 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => {
    localStorage.setItem('app-language', 'ru');
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return /^webgl2?$|^experimental-webgl$/.test(type) ? null : original.call(this, type, ...args); };
  });
  const page = await context.newPage();
  try {
    await openViewer(page);
    const viewer = page.locator('.rfv');
    await viewer.getByText('3D недоступно. Показываем фотографию.').waitFor({ timeout: 45000 });
    assert.ok(await viewer.locator('.rfv-poster').isVisible());
    assert.ok(await viewer.getByRole('button', { name: 'Повторить' }).isVisible());
    await viewer.getByRole('button', { name: 'Закрыть 3D-обзор' }).click();
    await viewer.waitFor({ state: 'detached' });
    console.log('PASS immersive 3D: WebKit unavailable fallback, retry action, close');
  } finally { await browser.close(); }
}
(async () => { await exercise(320, 568); await exercise(390, 844); await fallback(); await retryAfterNetworkFailure(); await productionLikeCsp(); })().catch(error => { console.error(error); process.exit(1); });
