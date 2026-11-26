const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.PLANNER_TEST_URL || 'http://127.0.0.1:41755/';
const key = 'web4tg-furniture-planner-v1';

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', locale: 'ru-RU' });
  const page = await context.newPage();
  await context.addInitScript(storageKey => { localStorage.setItem('app-language', 'ru'); localStorage.removeItem(storageKey); }, key);
  try {
    await page.goto(new URL('/#/demos/furniture-studio/app', base).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('furniture-store').waitFor();
    await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).tap();
    await page.getByRole('button', { name: /^Своя комната/ }).tap();
    await page.getByTestId('furniture-planner').waitFor();
    await page.waitForFunction(storageKey => {
      const canvas = document.querySelector('.fpl-stage canvas');
      const loading = Array.from(document.querySelectorAll('.fpl-status')).some(node => node.textContent.includes('Загружаем'));
      return canvas && !loading && localStorage.getItem(storageKey);
    }, key, { timeout: 45000 });
    await page.waitForTimeout(500);
    const readPlan = () => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    const before = await readPlan();
    const initialSofa = before.items.find(item => item.productId === 'rivet-revolve-sofa');
    assert(initialSofa, 'initial plan should contain the selected sofa');
    // Rotate and native browser Back in the same task, deliberately before the
    // debounce timer can save. The unmount must persist the latest layout.
    await page.evaluate(() => {
      document.querySelector('.fpl-stage canvas').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }));
      history.back();
    });
    await page.getByTestId('furniture-planner').waitFor({ state: 'detached' });
    await page.waitForTimeout(400);
    const after = await readPlan();
    const savedSofa = after.items.find(item => item.id === initialSofa.id);
    assert(savedSofa, 'the sofa is retained after Back');
    assert(Math.abs(savedSofa.rotation - initialSofa.rotation - Math.PI / 12) < 1e-4, 'Back persists the most recent rotation');
    await page.getByRole('button', { name: 'Открыть планировщик', exact: true }).tap();
    await page.getByRole('button', { name: /^Своя комната/ }).tap();
    await page.getByTestId('furniture-planner').waitFor();
    await page.waitForFunction(storageKey => {
      const canvas = document.querySelector('.fpl-stage canvas');
      const loading = Array.from(document.querySelectorAll('.fpl-status')).some(node => node.textContent.includes('Загружаем'));
      return canvas && !loading && JSON.parse(localStorage.getItem(storageKey)).items.length > 0;
    }, key, { timeout: 45000 });
    const reopened = await readPlan();
    assert(Math.abs(reopened.items.find(item => item.id === initialSofa.id).rotation - savedSofa.rotation) < 1e-4, 'reopened plan retains the saved orientation');
    console.log('PASS planner: browser Back preserves the last unsaved interaction');
  } finally { await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
