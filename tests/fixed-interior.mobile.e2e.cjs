const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const site = process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:41755/';
const key = 'web4tg-fixed-interior-v1';

async function open(page) {
  await page.goto(new URL('/#/demos/furniture-studio/app', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).click();
  await page.locator('[data-testid=fixed-interior]').waitFor();
  await page.locator('.fint-block').waitFor({ state: 'hidden', timeout: 90000 });
  assert.equal(await page.locator('.fint-stage canvas').count(), 1);
}

async function run(width) {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await open(page);
    await page.screenshot({ path: `work/fixed-interior-${width}-room.png` });
    const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    assert.ok(saved.items.length > 0);
    await page.getByRole('button', { name: 'Вид сверху', exact: true }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `work/fixed-interior-${width}-plan.png` });
    const canvas = page.locator('.fint-stage canvas'), box = await canvas.boundingBox();
    const cdp = await context.newCDPSession(page);
    const start = { x: box.x + box.width * .5, y: box.y + box.height * .92 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x - 30, y: start.y - 10 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.deepEqual((await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key)).items, saved.items);
    await page.getByRole('button', { name: 'Добавить', exact: true }).click();
    await page.waitForFunction(({ key, count }) => JSON.parse(localStorage.getItem(key)).items.length === count, { key, count: saved.items.length + 1 }, { timeout: 90000 });
    const after = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    await page.getByRole('button', { name: 'Закрыть интерьер', exact: true }).click();
    await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).click();
    await page.locator('.fint-block').waitFor({ state: 'hidden', timeout: 90000 });
    assert.deepEqual((await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key)).items, after.items);
    await page.getByRole('button', { name: 'Своя комната', exact: true }).click();
    await page.locator('[data-testid=furniture-planner]').waitFor();
    assert.deepEqual(errors, []);
    console.log(`PASS fixed room ${width}: view, pan, add, save, reopen and custom-room transition`);
    await context.close();
  } finally { await browser.close(); }
}
(async () => { await run(320); await run(390); })().catch(e => { console.error(e); process.exitCode = 1; });
