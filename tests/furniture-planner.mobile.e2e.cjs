const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const sharp = require('sharp');

// Start the local Vite server first; never sends a Telegram message or submits an order.
const site = process.env.PLANNER_TEST_URL || 'http://127.0.0.1:41755/';
const key = 'web4tg-furniture-planner-v1';
const layout = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
const item = value => value.items.find(entry => entry.productId === 'rivet-revolve-sofa');
async function waitSaved(page, predicate) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const state = await layout(page);
    if (state && predicate(state)) return state;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('Timed out waiting for the saved furniture layout');
}
async function openHome(page) {
  await page.goto(new URL('/#/demos/furniture-studio/app', site).href, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid=furniture-store]').waitFor();
}
async function openPlanner(page) {
  await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).click();
  await page.locator('[data-testid=furniture-planner]').waitFor();
  await page.locator('.fpl-stage canvas:visible').waitFor({ timeout: 45000 });
  await page.waitForFunction(() => !Array.from(document.querySelectorAll('.fpl-status')).some(e => e.textContent.includes('Загружаем')), null, { timeout: 45000 });
  await waitSaved(page, value => value.items.length >= 1);
}
async function dragSofa(page, context) {
  const canvas = page.locator('.fpl-stage canvas:visible');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  const x = box.x + box.width * 0.5;
  const cdp = await context.newCDPSession(page);
  try {
    // A ray can land between individual cushions. Try several points along
    // the centre of the visible sofa, and still require actual state change.
    for (const fraction of [0.30, 0.27, 0.33, 0.37]) {
      const y = box.y + box.height * fraction;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + i * 4, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(450);
      const current = await layout(page);
      if (current && item(current)?.x > 0.2) return;
    }
  } finally {
    await cdp.detach();
  }
}
async function checkPinch(page, context) {
  const canvas = page.locator('.fpl-stage canvas:visible');
  const beforeLayout = await layout(page);
  const before = await sharp(await canvas.screenshot()).ensureAlpha().raw().toBuffer();
  const box = await canvas.boundingBox();
  const x = box.x + box.width * 0.20, y = box.y + box.height * 0.90;
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x - 30, y, id: 1 }, { x: x + 30, y, id: 2 }] });
  for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 30 - i * 8, y, id: 1 }, { x: x + 30 + i * 8, y, id: 2 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  const after = await sharp(await canvas.screenshot()).ensureAlpha().raw().toBuffer();
  let changed = 0;
  for (let i = 0; i < Math.min(before.length, after.length); i += 4) if (Math.abs(before[i] - after[i]) + Math.abs(before[i + 1] - after[i + 1]) + Math.abs(before[i + 2] - after[i + 2]) > 20) changed++;
  assert.ok(changed > 1000, 'two-finger pinch should zoom the visible plan');
  assert.deepEqual(await layout(page), beforeLayout, 'pinch must not move or save furniture');
  await page.getByRole('button', { name: 'Сбросить вид плана' }).click();
}
async function checkCollisionFeedback(page, context, initial) {
  const box = await page.locator('.fpl-stage canvas:visible').boundingBox();
  const x = box.x + box.width * 0.5, y = box.y + box.height * 0.32;
  const cdp = await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= 20; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + i * 8 }] });
  await page.getByText(/Другой предмет занимает это место|Здесь недостаточно места/).waitFor();
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  await page.getByRole('button', { name: 'Отменить действие' }).click();
  await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && Math.abs(entry.z - item(initial).z) < 0.001));
  assert.deepEqual(await layout(page), initial, 'undo should restore the layout after an obstructed drag');
}
async function exercise(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'ru-RU' });
  const page = await context.newPage();
  const errors = [], missingModels = [], requestedUrls = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requestedUrls.push(request.url()));
  page.on('response', response => { if (response.url().includes('/furniture/') && response.status() >= 400) missingModels.push(`${response.status()} ${response.url()}`); });
  try {
    await openHome(page);
    await openPlanner(page);
    assert.equal(await page.locator('#root').evaluate(root => root.inert), true, 'store should be inert while the planner is open');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Закрыть планировщик');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => !!document.activeElement?.closest('.fpl')), true, 'keyboard focus stays in the planner');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Закрыть планировщик');
    await page.locator('.fpl').evaluate(node => { node.scrollTop = 0; });
    const initial = await layout(page);
    assert.equal(initial.items.length, 3, 'initial room should contain sofa, chair and table');
    assert.deepEqual(initial.room, { width: 4.8, depth: 4 });
    assert.ok(!requestedUrls.some(url => /lebombo_1k\.hdr|painted-plaster\.jpg|linen-color\.jpg/.test(url)), 'perspective-only materials must not block the initial floor plan');
    assert.equal(await page.getByRole('button', { name: 'Вид сверху', exact: true }).getAttribute('aria-pressed'), 'true');
    await checkPinch(page, context);
    if (width === 390) await checkCollisionFeedback(page, context, initial);
    await dragSofa(page, context);
    const dragged = await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.x > 0.2));
    assert.ok(item(dragged).x > item(initial).x, 'touch drag should move sofa');
    await page.locator('.fpl-stage canvas:visible').focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(({ key, previous }) => {
      const state = JSON.parse(localStorage.getItem(key));
      return state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.x > previous + 0.05);
    }, { key, previous: item(dragged).x }, { timeout: 15000 });
    const moved = await layout(page);
    assert.ok(item(moved).x > item(dragged).x, 'keyboard alternative should change position');
    await page.keyboard.press('Shift+ArrowRight');
    const rotated = await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.rotation > 0.2));
    assert.ok(Math.abs(item(rotated).rotation - Math.PI / 12) < 0.001);
    await page.getByRole('button', { name: 'Отменить действие' }).click();
    await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.rotation === 0));
    await page.getByRole('button', { name: 'Повторить действие' }).click();
    await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.rotation > 0.2));
    const environmentLoaded = page.waitForResponse(response => response.url().includes('lebombo_1k.hdr') && response.status() === 200, { timeout: 30000 });
    await page.getByRole('button', { name: 'Интерьер', exact: true }).click();
    await environmentLoaded;
    assert.equal(await page.getByRole('button', { name: 'Интерьер', exact: true }).getAttribute('aria-pressed'), 'true');
    if (width === 390) {
      const canvas = page.locator('.fpl-stage canvas:visible');
      const beforeView = await canvas.screenshot();
      const beforeLayout = await layout(page);
      await page.getByRole('button', { name: 'Вид из комнаты', exact: true }).click();
      await page.getByRole('button', { name: 'Общий вид', exact: true }).waitFor();
      const insideView = await canvas.screenshot();
      assert.notDeepEqual(insideView, beforeView, 'inside viewpoint should change the rendered room');
      assert.deepEqual(await layout(page), beforeLayout, 'changing viewpoint must not move furniture');
      await page.getByRole('button', { name: 'Общий вид', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Вид сверху', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Вид сверху', exact: true }).getAttribute('aria-pressed'), 'true');

    // A smaller room cannot silently crop or discard existing pieces.
    const beforeShrink = await layout(page);
    await page.getByLabel('Ширина, м').fill('2');
    await page.getByLabel('Глубина, м').fill('2');
    await page.getByRole('button', { name: 'Применить', exact: true }).click();
    await page.getByText('Предметы не помещаются. Сначала переместите или удалите их.').waitFor();
    assert.deepEqual(await layout(page), beforeShrink);

    // Move towards the table until the collision guard rejects an attempted step.
    await page.locator('.fpl-items button').first().click();
    let collision = false;
    for (let n = 0; n < 30; n++) {
      await page.locator('.fpl-stage canvas:visible').focus();
      await page.keyboard.press('ArrowDown');
      if (await page.getByText(/Другой предмет занимает это место|Здесь недостаточно места: проверьте границы/).isVisible()) { collision = true; break; }
    }
    assert.ok(collision, 'collision should be rejected');

    // Expand the room, then open another real product while preserving this plan.
    await page.getByLabel('Ширина, м').fill('7');
    await page.getByLabel('Глубина, м').fill('7');
    await page.getByRole('button', { name: 'Применить', exact: true }).click();
    const expanded = await waitSaved(page, state => state.room.width === 7 && state.room.depth === 7);
    await page.getByRole('button', { name: 'Закрыть планировщик' }).click();
    await page.locator('.fhome').waitFor();
    assert.equal(await page.locator('#root').evaluate(root => root.inert), false, 'store must be interactive after closing the planner');
    await page.getByRole('button',{name:'В каталог',exact:true}).first().click();
    await page.getByRole('button',{name:'Открыть Westview',exact:true}).click();
    await page.getByRole('button', { name:'Добавить в мою комнату',exact:true }).click();
    await page.locator('[data-testid=furniture-planner]').waitFor();
    const withWestview = await waitSaved(page, state => state.items.some(entry => entry.productId === 'stone-beam-westview'));
    for (const old of expanded.items) assert.deepEqual(withWestview.items.find(entry => entry.id === old.id), old, 'existing piece must be preserved');
    assert.match(await page.locator('.fpl-items button[aria-pressed=true]').innerText(), /Westview/);
    await page.getByRole('button', { name: 'Закрыть планировщик' }).click();
    await page.locator('.fs-product').waitFor();
    assert.match(await page.locator('.fs-product').innerText(), /Westview/);
    assert.deepEqual(errors, []);
    assert.deepEqual(missingModels, []);
    console.log(`PASS planner ${width}px: touch, controls, collision, persistence, product handoff, navigation`);
  } finally { await context.close(); }
}
async function fallback(browser) {
  const context = await browser.newContext({ viewport: { width: 320, height: 844 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
      if (['webgl', 'webgl2', 'experimental-webgl'].includes(kind)) return null;
      return original.call(this, kind, ...args);
    };
  });
  const page = await context.newPage();
  try {
    await openHome(page);
    await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).click();
    await page.getByRole('button',{name:'Интерьер',exact:true}).click();
    await page.getByText('3D недоступно на этом устройстве. Сохранённый план останется на устройстве.').waitFor();
    await page.getByRole('button', { name: 'Закрыть планировщик' }).click();
    await page.locator('.fhome').waitFor();
    console.log('PASS planner: WebGL fallback and return');
  } finally { await context.close(); }
}
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try { for (const width of [320, 390]) await exercise(browser, width); await fallback(browser); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
