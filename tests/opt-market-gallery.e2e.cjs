const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.OPT_TEST_URL || 'http://127.0.0.1:53742/').replace(/\/$/, '');
const engine = process.env.OPT_ENGINE === 'webkit' ? webkit : chromium;

const products = [
  'Lavazza Qualità Oro', 'Ahmad Tea English Breakfast', 'Borges Extra Virgin',
  'Barilla Penne Rigate', 'Mutti Pelati', 'Monin Vanilla', 'Alpro Barista Oat',
  'Dr. Oetker Cocoa Powder', 'AXA Гранола медовая с орехами',
  'Медовый Дом Приволжское разнотравье', 'Barilla Basilico', 'Lotus Biscoff',
];

async function main() {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    await page.goto(`${base}/#/demos/opt-market/app`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('opt-market').waitFor();
    await page.locator('.opt-nav').getByRole('button', { name: 'Каталог' }).click();
    await page.locator('.opt-product-picture img').evaluateAll(images => images.forEach(img => { img.loading = 'eager'; }));
    await page.waitForFunction(() => {
      const images = [...document.querySelectorAll('.opt-product-picture img')];
      return images.length === 12 && images.every(img => img.complete && img.naturalWidth > 0 && img.getAttribute('src').endsWith('-scene-v2.webp'));
    });
    for (const name of products) {
      await page.locator('.opt-nav').getByRole('button', { name: 'Каталог' }).click();
      const search = page.getByRole('searchbox', { name: 'Поиск товара' });
      await search.fill(name);
      await search.blur();
      await page.getByRole('button', { name: `Открыть товар: ${name}` }).click();
      await page.getByRole('heading', { name, exact: true }).waitFor();
      await page.waitForFunction(() => document.activeElement === document.querySelector('.opt-main h1'));
      const picture = page.locator('.opt-detail-image img');
      const product = page.getByRole('button', { name: 'Товар', exact: true });
      const scene = page.getByRole('button', { name: 'Иллюстрация', exact: true });
      assert.equal(await product.getAttribute('aria-pressed'), 'true', `${name} starts on the product image`);
      await picture.evaluate(img => img.decode());
      const original = await picture.getAttribute('src');
      await scene.click();
      assert.equal(await scene.getAttribute('aria-pressed'), 'true', `${name} scene is selected`);
      const creative = await picture.getAttribute('src');
      assert.notEqual(creative, original, `${name} images differ`);
      assert(creative.includes('-scene-v2.webp'), `${name} points to its creative scene`);
      await picture.evaluate(img => img.decode());
      assert(await picture.evaluate(img => img.naturalWidth > 0 && img.naturalHeight > 0), `${name} creative scene loads`);
      assert.equal(await picture.getAttribute('alt'), `Художественная иллюстрация товара ${name}`);
      await product.click();
      assert.equal(await product.getAttribute('aria-pressed'), 'true');
      assert.equal(await picture.getAttribute('src'), original, `${name} returns to product image`);
      await picture.evaluate(img => img.decode());
    }
    // A failed creative image must not leave a broken catalog card, and the
    // product page must recover when switching back to its packaging view.
    await page.route('**/real-coffee-v1-scene-v2.webp', route => route.abort());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('opt-market').waitFor();
    await page.locator('.opt-nav').getByRole('button', { name: 'Каталог' }).click();
    const cardImage = page.getByRole('button', { name: 'Открыть товар: Lavazza Qualità Oro' }).locator('img');
    await page.waitForFunction(() => {
      const img = document.querySelector('[aria-label="Открыть товар: Lavazza Qualità Oro"] img');
      return img && img.complete && img.naturalWidth > 0 && img.getAttribute('src').endsWith('real-coffee-v1.webp');
    });
    await cardImage.evaluate(img => img.decode());
    await page.getByRole('button', { name: 'Открыть товар: Lavazza Qualità Oro' }).click();
    await page.getByRole('button', { name: 'Иллюстрация', exact: true }).click();
    await page.getByRole('img', { name: 'Изображение Lavazza Qualità Oro недоступно' }).waitFor();
    await page.getByRole('button', { name: 'Товар', exact: true }).click();
    await page.locator('.opt-detail-image img').evaluate(img => img.decode());
    assert.deepEqual(errors, []);
    console.log(`${engine.name()}: ${products.length} galleries, decoding, switching, image failure recovery and screen focus passed`);
  } finally {
    await context.close();
    await browser.close();
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
