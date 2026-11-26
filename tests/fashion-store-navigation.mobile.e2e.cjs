const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const site = process.env.STORE_NAV_TEST_URL || 'http://127.0.0.1:41755/';

async function check(engine, id, width) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'ru-RU' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL(`#/demos/${id}/app`, site).href);
    await page.getByTestId(id).waitFor();
    const nav = page.locator('nav.mf-nav');
    await nav.waitFor();
    const geometry = await nav.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const buttons = [...el.querySelectorAll(':scope > button')].map(button => {
        const box = button.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
      });
      return { position: getComputedStyle(el).position, left: rect.left, right: rect.right, bottom: rect.bottom, width: innerWidth, height: innerHeight, buttons };
    });
    assert.equal(geometry.position, 'fixed', JSON.stringify(geometry));
    assert.equal(geometry.buttons.length, 5, JSON.stringify(geometry));
    assert.ok(geometry.left >= 0 && geometry.right <= width && geometry.bottom <= 844, JSON.stringify(geometry));
    for (const box of geometry.buttons) assert.ok(box.width >= 44 && box.height >= 44 && box.left >= geometry.left - 1 && box.right <= geometry.right + 1, JSON.stringify(geometry));
    for (let i = 0; i < geometry.buttons.length; i++) for (let j = i + 1; j < geometry.buttons.length; j++) {
      const a = geometry.buttons[i], b = geometry.buttons[j];
      assert.ok(Math.min(a.right,b.right) - Math.max(a.left,b.left) <= 1 || Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top) <= 1, 'Navigation buttons overlap');
    }
    await nav.getByRole('button', { name: 'Каталог', exact: true }).tap();
    await page.locator('.mf-catalog').waitFor();
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()} ${width} ${id}: cold-open navigation layout and catalog`);
  } finally { await context.close(); await browser.close(); }
}
(async () => { for (const engine of [chromium, webkit]) for (const id of ['jewelry-store', 'muraka-fashion', 'women-fashion']) for (const width of [320,390]) await check(engine,id,width); })().catch(error => { console.error(error); process.exit(1); });
