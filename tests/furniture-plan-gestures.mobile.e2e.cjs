const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const sharp = require('sharp');

const site = process.env.PLANNER_TEST_URL || 'http://127.0.0.1:41755/';
const key = 'web4tg-furniture-planner-v1';
const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
async function changedPixels(before, after) {
  const a = await sharp(before).ensureAlpha().raw().toBuffer();
  const b = await sharp(after).ensureAlpha().raw().toBuffer();
  let count = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 20) count++;
  return count;
}
async function run(browser, width) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await context.addInitScript(key => localStorage.setItem(key, JSON.stringify({ version: 1, room: { width: 4.8, depth: 4 }, items: [{ id: 'sofa-test', productId: 'rivet-revolve-sofa', x: 0, z: 0, rotation: 0 }] })), key);
  try {
    await page.goto(new URL('/#/demos/furniture-studio/app', site).href);
    await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).click();

    await page.waitForFunction(() => !Array.from(document.querySelectorAll('.fpl-status')).some(e => e.textContent.includes('Загружаем')), null, { timeout: 45000 });
    const canvas = page.locator('.fpl-stage canvas');
    await canvas.waitFor();
    await page.waitForTimeout(1000);
    assert.equal(await page.locator('.fpl-edit-controls').count(), 0);
    const cdp = await context.newCDPSession(page);
    const rect = await canvas.boundingBox(), cx = rect.x + rect.width / 2, cy = rect.y + rect.height / 2;
    const touch = async (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
    const before = await canvas.screenshot(), original = await saved(page);
    // One finger on empty space pans horizontally without moving furniture.
    const ex = rect.x + 24, ey = rect.y + rect.height - 28;
    await touch('touchStart', [{ x: ex, y: ey, id: 1 }]);
    for (let i = 1; i <= 8; i++) await touch('touchMove', [{ x: ex + i * 8, y: ey, id: 1 }]);
    await touch('touchEnd', []);
    const panned = await canvas.screenshot();
    assert.ok(await changedPixels(before, panned) > 1200, 'one-finger horizontal pan must change the plan');
    assert.deepEqual(await saved(page), original, 'panning must never move a product');
    await page.getByRole('button', { name: 'Сбросить вид плана' }).click();
    // The area outside the room is also a pan surface, in the other direction.
    const ox = rect.x + rect.width - 8, oy = rect.y + 8;
    await touch('touchStart', [{ x: ox, y: oy, id: 1 }]);
    for (let i = 1; i <= 7; i++) await touch('touchMove', [{ x: ox - i * 8, y: oy, id: 1 }]);
    await touch('touchEnd', []);
    assert.ok(await changedPixels(before, await canvas.screenshot()) > 1200, 'empty outside area must pan in the other direction');
    assert.deepEqual(await saved(page), original, 'outside panning must not move a product');
    await page.getByRole('button', { name: 'Сбросить вид плана' }).click();

    // Two fingers starting on empty floor zoom the view without changing items.
    await touch('touchStart', [{ x: ex, y: ey, id: 1 }, { x: ex + 40, y: ey, id: 2 }]);
    for (let i = 1; i <= 7; i++) await touch('touchMove', [{ x: ex, y: ey, id: 1 }, { x: ex + 40 + i * 9, y: ey, id: 2 }]);
    await touch('touchEnd', []);
    assert.ok(await changedPixels(before, await canvas.screenshot()) > 1200, 'pinch on floor must zoom');
    assert.deepEqual(await saved(page), original, 'zoom must not change furniture');
    await page.getByRole('button', { name: 'Сбросить вид плана' }).click();

    // Start both fingers on/near the sofa and twist them together.
    await touch('touchStart', [{ x: cx - 20, y: cy, id: 1 }]);
    await touch('touchMove', [{ x: cx - 17, y: cy + 2, id: 1 }]);
    await touch('touchStart', [{ x: cx - 17, y: cy + 2, id: 1 }, { x: cx + 20, y: cy, id: 2 }]);
    for (let i = 1; i <= 8; i++) {
      const a = i * 0.045;
      await touch('touchMove', [{ x: cx - 20 * Math.cos(a), y: cy - 20 * Math.sin(a), id: 1 }, { x: cx + 20 * Math.cos(a), y: cy + 20 * Math.sin(a), id: 2 }]);
    }
    await touch('touchEnd', []);
    await page.waitForFunction(key => Math.abs(JSON.parse(localStorage.getItem(key)).items[0].rotation) > 0.2, key, { timeout: 10000 });
    const rotated = await saved(page);
    assert.ok(Math.abs(rotated.items[0].rotation) > 0.2, 'two-finger twist should rotate the sofa');
    assert.equal(rotated.items[0].x, original.items[0].x, 'placing the second finger must not move the sofa');
    assert.equal(rotated.items[0].z, original.items[0].z, 'placing the second finger must not move the sofa');
    await page.getByRole('button', { name: 'Отменить действие' }).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).items[0].rotation === 0, key);
    await page.getByRole('button', { name: 'Повторить действие' }).click();
    await page.waitForFunction(key => Math.abs(JSON.parse(localStorage.getItem(key)).items[0].rotation) > 0.2, key);
    await page.getByRole('button', { name: 'Отменить действие' }).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).items[0].rotation === 0, key);
    // Cancellation (e.g. an incoming system gesture) restores the entire item gesture.
    await touch('touchStart', [{ x: cx, y: cy, id: 1 }]);
    for (let i = 1; i <= 5; i++) await touch('touchMove', [{ x: cx + i * 6, y: cy, id: 1 }]);
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).items[0].x > 0.1, key);
    await touch('touchCancel', []);
    await page.waitForTimeout(500);
    assert.deepEqual(await saved(page), original, 'cancelled drag must restore the previous item position');
    await touch('touchStart', [{ x: cx, y: cy, id: 1 }]);
    for (let i = 1; i <= 5; i++) await touch('touchMove', [{ x: cx + i * 6, y: cy, id: 1 }]);
    await touch('touchEnd', []);
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).items[0].x > 0.1, key);
    await page.getByRole('button', { name: 'Отменить действие' }).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).items[0].x === 0, key);
    await cdp.detach();
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px: one-finger pan, two-finger zoom and twist, undo/redo`);
  } finally { await context.close(); }
}
(async () => { const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); try { for (const width of [320, 390]) await run(browser, width); } finally { await browser.close(); } })().catch(error => { console.error(error); process.exitCode = 1; });
