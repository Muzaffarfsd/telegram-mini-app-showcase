const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const site = process.env.COFFEE_TEST_URL || 'http://127.0.0.1:41755/';

async function check(engine, width) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('#/demos/takt-coffee/app', site).href);
    await page.getByTestId('takt-coffee').waitFor();
    await page.locator('.tk-feature-detail').first().tap();
    await page.locator('.tk-recipe-map').waitFor();
    const layout = await page.locator('.tk-builder').evaluate(el => {
      const measure = node => { const rect = node.getBoundingClientRect(); return { left: rect.left, right: rect.right, animation: getComputedStyle(node).animationName }; };
      const base = el.querySelector('.tk-brew-base').getBoundingClientRect();
      const cup = el.querySelector('.tk-brew-base > .tk-cup').getBoundingClientRect();
      return { width: innerWidth, ingredients: [...el.querySelectorAll('.tk-ingredient')].map(measure), actions: [...el.querySelectorAll('.tk-brew-actions button')].map(measure), cupCenter: (cup.left + cup.right) / 2, baseCenter: (base.left + base.right) / 2 };
    });
    assert.ok(layout.ingredients.length >= 4 && layout.actions.length === 2);
    for (const rect of [...layout.ingredients, ...layout.actions]) {
      assert.ok(rect.left >= -1 && rect.right <= width + 1, `Control clips at ${width}px: ${JSON.stringify(layout)}`);
      assert.equal(rect.animation, 'none', 'Reduced motion must not run layout animations');
    }
    assert.ok(Math.abs(layout.cupCenter - layout.baseCenter) < 1, `Cup must remain centered: ${JSON.stringify(layout)}`);
    await page.locator('.tk-ingredient[data-group="syrup"]').tap();
    await page.locator('.tk-sheet[open]').waitFor();
    await page.locator('.tk-sheet[open] button[aria-label="Закрыть"]').tap();
    await page.locator('.tk-brew-next').tap();
    await page.locator('[data-testid="takt-coffee"][data-screen="cup"]').waitFor();
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()} ${width}: reduced-motion recipe controls, centered cup and flow`);
  } finally { await context.close(); await browser.close(); }
}
(async () => { for (const engine of [chromium, webkit]) for (const width of [320, 390]) await check(engine, width); })().catch(error => { console.error(error); process.exit(1); });
