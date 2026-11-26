const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const site = process.env.PLANNER_TEST_URL || 'http://127.0.0.1:41755/';
const key = 'web4tg-furniture-planner-v1';
const initial = { version: 1, room: { width: 2, depth: 2 }, items: [
  { id: 'legacy-sofa', productId: 'rivet-revolve-sofa', x: 0, z: 0, rotation: 0 },
  { id: 'legacy-table', productId: 'hallowood-waverly-table', x: 0.9, z: 0.1, rotation: 0 },
] };
const read = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
async function open(page) {
  await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).click();
  await page.getByRole('button', { name: /^Своя комната/ }).click();
  await page.locator('.fpl-stage canvas').waitFor();
  await page.waitForFunction(() => !Array.from(document.querySelectorAll('.fpl-status')).some(node => node.textContent.includes('Загружаем')), null, { timeout: 45000 });
  await page.getByText('Сохранённая расстановка не изменена автоматически', { exact: false }).waitFor();
  await page.waitForTimeout(500);
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(({ key, initial }) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key, JSON.stringify(initial)); sessionStorage.setItem('seeded', '1'); } }, { key, initial });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('/#/demos/furniture-studio/app', site).href);
    await open(page);
    assert.deepEqual(await read(page), initial, 'measurement must preserve both saved pieces in the 2 m room');
    await page.getByRole('button', { name: 'Закрыть планировщик' }).click();
    await page.reload();
    await open(page);
    assert.deepEqual(await read(page), initial, 'reload must not drop or move the saved pieces');
    await page.getByLabel('Ширина, м').fill('6');
    await page.getByLabel('Глубина, м').fill('6');
    await page.getByRole('button', { name: 'Применить', exact: true }).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).room.width === 6, key);
    assert.deepEqual((await read(page)).items, initial.items, 'enlarging a conflicting plan must not change items');

    // Select the sofa through the scene, then move in small steps while it is
    // still overlapping: an already-invalid state must not trap the user.
    const cdp = await context.newCDPSession(page), canvas = page.locator('.fpl-stage canvas');
    const box = await canvas.boundingBox();
    let target;
    for (let fy = 0.25; fy <= 0.65 && !target; fy += 0.05) {
      for (let fx = 0.30; fx <= 0.70 && !target; fx += 0.05) {
        await page.locator('.fpl-items button').nth(1).click();
        const x = box.x + fx * box.width, y = box.y + fy * box.height;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        if ((await page.locator('.fpl-items button[aria-pressed=true]').innerText()).includes('Диван')) target = { x, y };
      }
    }
    assert(target, 'sofa should remain selectable in the scene');
    // Moving away must work in gradual increments, before the collision has
    // completely cleared, so the user can recover the arrangement by hand.
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [target] });
    for (let n = 1; n <= 6; n++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: target.x - n * 3, y: target.y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).items.find(item => item.id === 'legacy-sofa').x < -0.1, key, { timeout: 10000 });
    assert.equal((await read(page)).items.length, 2, 'manual repair must preserve both items');
    await canvas.focus();
    await page.keyboard.press('Shift+ArrowLeft');
    await page.waitForTimeout(400);
    if ((await read(page)).items.find(item => item.id === 'legacy-sofa').rotation === 0) {
      await page.keyboard.press('Shift+ArrowRight');
      await page.waitForTimeout(400);
    }
    assert.notEqual((await read(page)).items.find(item => item.id === 'legacy-sofa').rotation, 0, 'rotation remains available when recovering an old overlap');
    await cdp.detach();

    await page.getByRole('button', { name: /Стол ·/ }).click();
    await page.getByRole('button', { name: 'Удалить выбранный предмет' }).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).items.length === 1, key);
    assert.equal((await read(page)).items[0].id, 'legacy-sofa', 'the user can choose and remove the conflicting item');
    assert.deepEqual(errors, []);
    console.log('PASS recovery: preserve, reload, expand, gesture repair and explicit removal');
  } finally { await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
