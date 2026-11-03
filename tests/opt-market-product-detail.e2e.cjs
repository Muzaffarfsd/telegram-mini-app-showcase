// Product detail: mobile purchase, gallery, focus, layout and accessibility.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const axe = require('axe-core');
const base = (process.env.OPT_TEST_URL || 'http://127.0.0.1:53742/').replace(/\/$/, '');
const engine = process.env.OPT_ENGINE === 'webkit' ? webkit : chromium;

async function run(browser, width, height) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(`${base}/#/demos/opt-market/app`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('opt-market').waitFor();
    await page.locator('.opt-nav').getByRole('button', { name: 'Каталог' }).click();
    const productCard = page.getByRole('button', { name: 'Открыть товар: Barilla Penne Rigate' });
    await productCard.scrollIntoViewIfNeeded();
    await productCard.click();
    await page.getByRole('heading', { name: 'Barilla Penne Rigate', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no horizontal overflow');
    const illustration = page.getByRole('button', { name: 'Иллюстрация', exact: true });
    const product = page.getByRole('button', { name: 'Товар', exact: true });
    const img = page.locator('.opt-detail-image img');
    assert.equal(await illustration.getAttribute('aria-pressed'), 'true');
    await img.evaluate(el => el.decode());
    const scene = await img.getAttribute('src');
    await product.click();
    assert.equal(await product.getAttribute('aria-pressed'), 'true');
    await img.evaluate(el => el.decode());
    assert.notEqual(await img.getAttribute('src'), scene);
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    const findings = await page.evaluate(() => window.axe.run({ include: [['.opt-store'], ['.opt-portal']] }, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
    const serious = findings.violations.filter(v => ['critical','serious'].includes(v.impact)).map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }));
    assert.deepEqual(serious, [], `accessibility at ${width}`);
    const add = page.getByRole('button', { name: 'Добавить коробку', exact: true });
    await add.scrollIntoViewIfNeeded();
    const box = await add.boundingBox();
    const nav = await page.locator('.opt-nav').boundingBox();
    assert(box && nav && box.y >= 0 && box.y + box.height <= nav.y, `purchase action visible above navigation at ${width}`);
    await add.click();
    await page.getByRole('button', { name: 'Увеличить количество: Barilla Penne Rigate' }).click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('web4tg-opt-market-demo-v1') || '{}').cart?.find(x => x.id === 'real-pasta')?.qty === 2);
    let cart = JSON.parse(await page.evaluate(() => localStorage.getItem('web4tg-opt-market-demo-v1'))).cart;
    assert.equal(cart.find(x => x.id === 'real-pasta').qty, 2);
    await page.getByRole('button', { name: 'Уменьшить количество: Barilla Penne Rigate' }).click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('web4tg-opt-market-demo-v1') || '{}').cart?.find(x => x.id === 'real-pasta')?.qty === 1);
    cart = JSON.parse(await page.evaluate(() => localStorage.getItem('web4tg-opt-market-demo-v1'))).cart;
    assert.equal(cart.find(x => x.id === 'real-pasta').qty, 1);
    await page.getByRole('button', { name: 'Перейти в заказ' }).click();
    await page.getByText('Barilla Penne Rigate', { exact: true }).waitFor();
    await page.goBack();
    await page.getByRole('heading', { name: 'Barilla Penne Rigate', exact: true }).waitFor();
    await page.goBack();
    await page.getByRole('searchbox', { name: 'Поиск товара' }).waitFor();
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width}x${height}: gallery, purchase, quantity, return and accessibility passed`);
  } finally { await context.close(); }
}
(async () => { const browser = await engine.launch(); try { for (const [w,h] of [[320,568],[390,844],[430,932]]) await run(browser,w,h); } finally { await browser.close(); } })().catch(e => { console.error(e); process.exitCode = 1; });
