// Expanded assortment and product recommendations: public, buyer-visible behaviours.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.OPT_TEST_URL || 'http://127.0.0.1:53742/').replace(/\/$/, '');
const engine = process.env.OPT_ENGINE === 'webkit' ? webkit : chromium;

async function run(browser, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(`${base}/#/demos/opt-market/app`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('opt-market').waitFor();
    await page.locator('.opt-nav').getByRole('button', { name: 'Каталог' }).click();
    const search = page.getByRole('searchbox', { name: 'Поиск товара' });
    await search.fill('нутелла');
    await search.blur();
    const nutella = page.getByRole('button', { name: 'Открыть товар: Nutella Hazelnut Spread' });
    await nutella.waitFor();
    await nutella.click();
    await page.getByRole('heading', { name: 'Nutella Hazelnut Spread', exact: true }).waitFor();
    const mainImage = page.locator('.opt-detail-image img');
    await mainImage.evaluate(img => img.decode());
    const sceneSrc = await mainImage.getAttribute('src');
    assert(sceneSrc.endsWith('-scene-v2.webp'), 'new product opens with creative image');
    await page.getByRole('button', { name: 'Товар', exact: true }).click();
    await mainImage.evaluate(img => img.decode());
    assert.notEqual(await mainImage.getAttribute('src'), sceneSrc, 'new product has separate packshot');
    assert((await page.locator('.opt-product-story').innerText()).length >= 90, 'description is informative');
    await page.getByRole('heading', { name: 'Как использовать' }).waitFor();
    await page.getByRole('heading', { name: 'Идея сочетания' }).waitFor();
    const reviews = page.locator('.opt-reviews');
    await reviews.getByText('Примеры оформления. Реальных отзывов пока нет.').waitFor();
    assert((await reviews.locator('.opt-review').count()) >= 1, 'example reviews shown as examples');
    const related = page.locator('.opt-related');
    await related.getByRole('heading', { name: 'С этим покупают' }).waitFor();
    assert((await related.locator('.opt-related-card').count()) >= 3, 'related products shown');
    const track = related.locator('.opt-related-track');
    assert(await related.getByRole('button', { name: 'Предыдущие товары' }).isDisabled(), 'previous disabled at carousel start');
    const before = await track.evaluate(el => el.scrollLeft);
    await related.getByRole('button', { name: 'Следующие товары' }).click();
    await page.waitForFunction(el => el.scrollLeft > 0, await track.elementHandle());
    assert((await track.evaluate(el => el.scrollLeft)) > before, 'carousel moves horizontally');
    await page.waitForFunction(() => !document.querySelector('[aria-label="Предыдущие товары"]').disabled);
    await related.getByRole('button', { name: 'Предыдущие товары' }).click();
    await page.waitForFunction(el => el.scrollLeft === 0, await track.elementHandle());
    const add = related.getByRole('button', { name: 'Добавить коробку: Alpro Barista Oat' });
    await add.click();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('web4tg-opt-market-demo-v1') || '{}').cart?.find(row => row.id === 'real-milk')?.qty === 1);
    const opener = related.getByRole('button', { name: 'Открыть товар: Alpro Barista Oat' });
    await opener.scrollIntoViewIfNeeded();
    await opener.click();
    await page.getByRole('heading', { name: 'Alpro Barista Oat', exact: true }).waitFor();
    await page.waitForFunction(() => document.activeElement === document.querySelector('.opt-main h1'));
    const serving = page.getByRole('button', { name: 'Подача', exact: true });
    await serving.click();
    assert.equal(await serving.getAttribute('aria-pressed'), 'true');
    assert((await mainImage.getAttribute('src')).endsWith('-scene-v3.webp'), 'existing product has extra serving image');
    await mainImage.evaluate(img => img.decode());
    await page.goBack();
    await page.getByRole('heading', { name: 'Nutella Hazelnut Spread', exact: true }).waitFor();
    await page.waitForFunction(() => document.activeElement?.getAttribute('data-opt-focus') === 'related-real-milk');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'no page-wide horizontal overflow');
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width}x${height}: search, descriptions, demo reviews, carousel, add, product-to-product Back, and 2/3 image views passed`);
  } finally { await ctx.close(); }
}
(async () => { const browser = await engine.launch(); try { for (const [w,h] of [[320,568],[390,844],[430,932]]) await run(browser,w,h); } finally { await browser.close(); } })().catch(e => { console.error(e); process.exitCode = 1; });
