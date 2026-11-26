const assert = require('node:assert/strict');
const { chromium } = require('playwright');

// Start the local Vite server first; never sends a Telegram message or submits an order.
const site = process.env.PLANNER_TEST_URL || 'http://127.0.0.1:41755/';
const key = 'web4tg-furniture-planner-v1';
const layout = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
const item = value => value.items.find(entry => entry.productId === 'rivet-revolve-sofa');
async function waitSaved(page, predicate) {
  await page.waitForFunction(({ key, predicate }) => {
    const raw = localStorage.getItem(key);
    return raw && Function('state', `return (${predicate})(state)`)(JSON.parse(raw));
  }, { key, predicate: predicate.toString() }, { timeout: 15000 });
  return layout(page);
}
async function openHome(page) {
  await page.goto(new URL('/#/demos/furniture-studio/app', site).href, { waitUntil: 'domcontentloaded' });
  await page.locator('[data-testid=furniture-store]').waitFor();
}
async function openPlanner(page) {
  await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).click();
  await page.locator('[data-testid=furniture-planner]').waitFor();
  await page.getByRole('button', { name: 'Повернуть вправо на 15 градусов' }).waitFor({ timeout: 45000 });
  await page.waitForFunction(() => !Array.from(document.querySelectorAll('.fpl-status')).some(e => e.textContent.includes('Загружаем')), null, { timeout: 45000 });
  await waitSaved(page, value => value.items.length >= 1);
}
async function dragSofa(page, context) {
  const canvas = page.locator('.fpl-stage canvas');
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
async function exercise(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'ru-RU' });
  const page = await context.newPage();
  const errors = [], missingModels = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.url().includes('/furniture/') && response.status() >= 400) missingModels.push(`${response.status()} ${response.url()}`); });
  try {
    await openHome(page);
    await openPlanner(page);
    const initial = await layout(page);
    assert.equal(initial.items.length, 3, 'initial room should contain sofa, chair and table');
    assert.deepEqual(initial.room, { width: 4.8, depth: 4 });
    assert.equal(await page.getByRole('button', { name: 'Вид сверху', exact: true }).getAttribute('aria-pressed'), 'true');
    await dragSofa(page, context);
    const dragged = await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.x > 0.2));
    assert.ok(item(dragged).x > item(initial).x, 'touch drag should move sofa');
    await page.getByRole('button', { name: 'Сдвинуть вправо на 10 см' }).click();
    await page.waitForFunction(({ key, previous }) => {
      const state = JSON.parse(localStorage.getItem(key));
      return state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.x > previous + 0.05);
    }, { key, previous: item(dragged).x }, { timeout: 15000 });
    const moved = await layout(page);
    assert.ok(item(moved).x > item(dragged).x, 'move button should change position');
    await page.getByRole('button', { name: 'Повернуть вправо на 15 градусов' }).click();
    const rotated = await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.rotation > 0.2));
    assert.ok(Math.abs(item(rotated).rotation - Math.PI / 12) < 0.001);
    await page.getByRole('button', { name: 'Отменить действие' }).click();
    await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.rotation === 0));
    await page.getByRole('button', { name: 'Повторить действие' }).click();
    await waitSaved(page, state => state.items.some(entry => entry.productId === 'rivet-revolve-sofa' && entry.rotation > 0.2));
    await page.getByRole('button', { name: 'Интерьер', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Интерьер', exact: true }).getAttribute('aria-pressed'), 'true');
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
      await page.getByRole('button', { name: 'Сдвинуть вниз на 10 см' }).click();
      if (await page.getByText('Здесь недостаточно места: проверьте границы и соседние предметы.').isVisible()) { collision = true; break; }
    }
    assert.ok(collision, 'collision should be rejected');

    // Expand the room, then open another real product while preserving this plan.
    await page.getByLabel('Ширина, м').fill('7');
    await page.getByLabel('Глубина, м').fill('7');
    await page.getByRole('button', { name: 'Применить', exact: true }).click();
    const expanded = await waitSaved(page, state => state.room.width === 7 && state.room.depth === 7);
    await page.getByRole('button', { name: 'Закрыть планировщик' }).click();
    await page.locator('.fs-home').waitFor();
    await page.locator('.fs-card-open').nth(2).click();
    await page.getByRole('button', { name: /Посмотреть в комнате/ }).click();
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
    await page.getByText('3D недоступно на этом устройстве. Сохранённый план останется на устройстве.').waitFor();
    await page.getByRole('button', { name: 'Закрыть планировщик' }).click();
    await page.locator('.fs-home').waitFor();
    console.log('PASS planner: WebGL fallback and return');
  } finally { await context.close(); }
}
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try { for (const width of [320, 390]) await exercise(browser, width); await fallback(browser); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
