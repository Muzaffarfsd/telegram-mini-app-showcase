// Mobile regression for the refreshed Apple demo. Set APPLE_TEST_URL for a running preview.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.APPLE_TEST_URL || 'http://127.0.0.1:53738/';
const cards = p => p.locator('.as-catalog [data-testid^="as-card-"]');

async function run(engine, width, height) {
  const browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}#/demos/apple-store/app`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('apple-store').waitFor({ timeout: 30000 });
    await page.locator('.as-nav').getByRole('button', { name: 'Каталог' }).tap();
    await page.locator('.as-catalog').waitFor();
    const total = await cards(page).count();
    assert.ok(total > 17, `Expected an expanded catalog, got ${total}`);

    // Each offered category must lead to a non-empty subset and be reversible.
    const categories = await page.locator('.as-chips button').allTextContents();
    assert.ok(categories.includes('iPhone') && categories.includes('Mac'), `Category chips missing: ${categories}`);
    for (const category of categories.filter(name => name !== 'Все')) {
      const chip = page.locator('.as-chips').getByRole('button', { name: category, exact: true });
      await chip.scrollIntoViewIfNeeded();
      await chip.tap();
      const count = await cards(page).count();
      assert.ok(count > 0 && count < total, `${category} returned ${count} of ${total} products`);
    }
    const allChip = page.locator('.as-chips').getByRole('button', { name: 'Все', exact: true });
    await allChip.scrollIntoViewIfNeeded();
    await allChip.tap();
    assert.equal(await cards(page).count(), total);

    // Validate every displayed catalog image, including lazy images outside the viewport.
    const sources = await page.locator('.as-catalog .as-card-picture img').evaluateAll(images => images.map(image => image.currentSrc || image.src));
    assert.equal(sources.length, total);
    const failures = await page.evaluate(async urls => {
      const results = await Promise.all(urls.map(url => new Promise(resolve => {
        const image = new Image();
        image.onload = () => resolve(image.naturalWidth > 0 && image.naturalHeight > 0 ? null : url);
        image.onerror = () => resolve(url);
        image.src = url;
      })));
      return results.filter(Boolean);
    }, sources);
    assert.deepEqual(failures, [], `Broken product images: ${failures.join(', ')}`);

    await page.evaluate(() => { const root = document.querySelector('#root'); root.scrollTop = root.scrollHeight; });
    await page.waitForTimeout(200);
    const geometry = await page.evaluate(() => ({
      nav: document.querySelector('.as-nav').getBoundingClientRect().toJSON(),
      last: [...document.querySelectorAll('.as-catalog .as-card')].at(-1)?.getBoundingClientRect().toJSON(),
    }));
    assert.ok(geometry.last && geometry.last.bottom <= geometry.nav.top + 1, `Last card hidden behind navigation: ${JSON.stringify(geometry)}`);

    const search = page.getByRole('searchbox', { name: 'Поиск по каталогу' });
    await search.scrollIntoViewIfNeeded();
    await search.fill('iPhone 18');
    const matches = await cards(page).count();
    assert.ok(matches > 0, 'Search for iPhone 18 returned no results');
    // Pro has no lifestyle frame; the UI must not invent one.
    const pro = page.getByTestId('as-card-iphone-18-pro');
    await pro.scrollIntoViewIfNeeded();
    await pro.getByRole('button', { name: /Открыть/ }).tap();
    await page.locator('.as-product').waitFor();
    assert.match(await page.locator('.as-product h1').textContent(), /iPhone 18 Pro/i);
    assert.equal(await page.getByRole('button', { name: 'В жизни', exact: true }).count(), 0, 'Unverified lifestyle photo was presented as real');
    await page.getByRole('button', { name: 'Увеличить фотографию товара' }).tap();
    let dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await dialog.getByRole('button', { name: 'Следующая фотография' }).count(), 0);
    await dialog.getByRole('button', { name: 'Закрыть' }).tap();
    await dialog.waitFor({ state: 'hidden' });
    await page.goBack();
    await page.locator('.as-catalog').waitFor();
    assert.equal(await search.inputValue(), 'iPhone 18');
    assert.equal(await cards(page).count(), matches);

    // Pro Max explicitly identifies its generated illustration.
    const proMax = page.getByTestId('as-card-iphone-18-pro-max');
    await proMax.scrollIntoViewIfNeeded();
    await proMax.getByRole('button', { name: /Открыть/ }).tap();
    await page.locator('.as-product').waitFor();
    assert.match(await page.locator('.as-product h1').textContent(), /iPhone 18 Pro Max/i);
    const productImage = page.locator('.as-product-gallery > img');
    await productImage.waitFor();
    await page.waitForFunction(() => { const img = document.querySelector('.as-product-gallery > img'); return img?.complete && img.naturalWidth > 0; });
    const source = await productImage.getAttribute('src');
    assert.ok(source, 'Missing product image source');
    const lifestyle = page.getByRole('button', { name: 'В жизни', exact: true });
    await lifestyle.tap();
    assert.equal(await lifestyle.getAttribute('aria-pressed'), 'true');
    await page.waitForFunction(previous => { const img = document.querySelector('.as-product-gallery > img'); return img?.getAttribute('src') !== previous && img.complete && img.naturalWidth > 0; }, source);
    assert.match(await page.locator('.as-product').textContent(), /СГЕНЕРИРОВАННАЯ ИЛЛЮСТРАЦИЯ/i);
    await page.getByRole('button', { name: 'Товар', exact: true }).tap();
    assert.equal(await productImage.getAttribute('src'), source);

    // Browser back keeps the user's search; forward returns to the same product.
    await page.goBack();
    await page.locator('.as-catalog').waitFor();
    assert.equal(await search.inputValue(), 'iPhone 18');
    assert.equal(await cards(page).count(), matches);
    await page.goForward();
    await page.locator('.as-product').waitFor();
    await page.getByRole('button', { name: /В КОРЗИНУ/ }).tap();
    dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.match(await dialog.textContent(), /iPhone 18/i);
    await dialog.getByRole('button', { name: /ОФОРМИТЬ ДЕМО-ЗАКАЗ/ }).tap();
    await page.locator('.as-checkout').waitFor();
    await page.getByRole('button', { name: /ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/ }).tap();
    const name = page.locator('input[autocomplete=name]');
    await page.waitForFunction(() => document.activeElement?.getAttribute('autocomplete') === 'name');
    assert.equal(await name.getAttribute('aria-invalid'), 'true');
    await name.fill('Тест');
    await page.getByRole('button', { name: /ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/ }).tap();
    const phone = page.locator('input[autocomplete=tel]');
    await page.waitForFunction(() => document.activeElement?.getAttribute('autocomplete') === 'tel');
    await phone.fill('9001234567');
    await page.getByRole('button', { name: /ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ/ }).tap();
    await page.locator('.as-success').waitFor();
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width}x${height}: ${total} products, category filters, images, scroll, search, product, zoom, history and demo checkout passed`);
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  await run(chromium, 320, 568);
  await run(chromium, 390, 844);
  await run(webkit, 320, 568);
  await run(webkit, 430, 932);
})().catch(error => { console.error(error); process.exitCode = 1; });
