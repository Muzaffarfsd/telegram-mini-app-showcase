// Mobile regression for the refreshed Apple demo. Set APPLE_TEST_URL for a running preview.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parse } = require('@babel/parser');
require('tsx/cjs');
const { appleCatalog2026 } = require('../client/src/components/demos/appleCatalog2026.ts');
const { appleProductGallery2026 } = require('../client/src/components/demos/appleProductGallery2026.ts');

// Read the actual component's static creative map without evaluating component code.
const source = fs.readFileSync(path.join(__dirname, '../client/src/components/demos/AppleStore.tsx'), 'utf8');
const ast = parse(source, {sourceType:'module', plugins:['typescript','jsx']});
const creativeDeclaration = ast.program.body.filter(node => node.type === 'VariableDeclaration').flatMap(node => node.declarations).find(node => node.id.name === 'creativeGallery');
assert.equal(creativeDeclaration?.init?.type, 'ObjectExpression', 'Creative gallery is not a static object');
const creative = Object.fromEntries(creativeDeclaration.init.properties.map(property => {
  assert.equal(property.type, 'ObjectProperty');
  assert.equal(property.key.type, 'StringLiteral');
  assert.equal(property.value.type, 'ArrayExpression');
  return [property.key.value, property.value.elements.map(element => { assert.equal(element?.type, 'StringLiteral'); return element.value; })];
}));
const allGallerySources = [];
for (const item of appleCatalog2026) {
  const images = [item.image, ...(creative[item.id] || []), ...(appleProductGallery2026[item.id] || [])];
  assert.ok(item.image && new Set(images).size >= 2, item.id + ' must have at least two distinct image sources');
  allGallerySources.push(...images);
}
const uniqueGallerySources = [...new Set(allGallerySources)];
const imagesVerified = new Set();
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
    // Load all data-backed primary and gallery URLs on each engine, including local WebP.
    if (!imagesVerified.has(engine.name())) {
      const broken = await page.evaluate(async urls => {
        const checks = await Promise.all(urls.map(url => new Promise(resolve => {
          const img = new Image();
          const timer = setTimeout(() => resolve(url), 30000);
          img.onload = () => { clearTimeout(timer); resolve(img.naturalWidth > 0 && img.naturalHeight > 0 ? null : url); };
          img.onerror = () => { clearTimeout(timer); resolve(url); };
          img.src = url;
        })));
        return checks.filter(Boolean);
      }, uniqueGallerySources);
      assert.deepEqual(broken, [], 'Gallery images failed to load: ' + broken.join(', '));
      imagesVerified.add(engine.name());
      console.log(engine.name() + ': ' + appleCatalog2026.length + ' models have at least two distinct sources; ' + uniqueGallerySources.length + ' unique image sources loaded');
    }
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
        const timeout = setTimeout(() => resolve(url), 30000);
        image.onload = () => { clearTimeout(timeout); resolve(image.naturalWidth > 0 && image.naturalHeight > 0 ? null : url); };
        image.onerror = () => { clearTimeout(timeout); resolve(url); };
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
    // Every frame is individually selectable, loads, and identifies generated illustrations.
    async function exerciseGallery(id, expectedName, minFrames) {
      const card = page.getByTestId('as-card-' + id);
      await card.scrollIntoViewIfNeeded();
      await card.getByRole('button', { name: /Открыть/ }).tap();
      await page.locator('.as-product').waitFor();
      assert.match(await page.locator('.as-product h1').textContent(), expectedName);
      assert.equal(await page.getByRole('button', { name: 'Товар', exact: true }).count(), 0);
      assert.equal(await page.getByRole('button', { name: 'В жизни', exact: true }).count(), 0);
      assert.ok(await page.locator('.as-feature').count() > 0, id + ' has no verified feature presentation');
      assert.ok(await page.locator('.as-specs dl > div').count() > 0, id + ' has no verified specs');
      const thumbs = page.locator('.as-gallery-strip button');
      const count = await thumbs.count();
      assert.ok(count >= minFrames, id + ' has only ' + count + ' frames');
      const shown = page.locator('.as-product-gallery > img');
      const overflow = await thumbs.evaluateAll(buttons => buttons.some(button => {const b=button.getBoundingClientRect(), i=button.querySelector('img').getBoundingClientRect(); return i.top < b.top-0.5 || i.bottom > b.bottom+0.5 || i.left < b.left-0.5 || i.right > b.right+0.5;}));
      assert.equal(overflow, false, id + ' thumbnail image escapes its button');
      let generatedIndex = -1;
      for (let i = 0; i < count; i++) {
        const thumb = thumbs.nth(i);
        await thumb.scrollIntoViewIfNeeded();
        await thumb.tap();
        assert.equal(await thumb.getAttribute('aria-pressed'), 'true');
        const expected = await thumb.locator('img').getAttribute('src');
        await page.waitForFunction(url => {const img=document.querySelector('.as-product-gallery > img'); return img?.getAttribute('src') === url && img.complete && img.naturalWidth > 0;}, expected, {timeout:20000});
        const ai = expected.startsWith('/apple-store/creative/');
        assert.equal(await page.locator('.as-gallery-note').count(), ai ? 1 : 0, id + ' missing or incorrect AI label for ' + expected);
        if (ai) { generatedIndex = i; assert.match(await page.locator('.as-gallery-note').textContent(), /создана с помощью ИИ/i); }
      }
      const detailImage = await page.locator('.as-detail-visual img').getAttribute('src');
      const detailIsAI = detailImage.startsWith('/apple-store/creative/');
      assert.equal(await page.locator('.as-detail-note').count(), detailIsAI ? 1 : 0, id + ' incorrect presentation image label');
      if (generatedIndex >= 0) {
        await thumbs.nth(generatedIndex).scrollIntoViewIfNeeded();
        await thumbs.nth(generatedIndex).tap();
        await page.getByRole('button', { name:'Увеличить фотографию товара' }).tap();
        const aiViewer = page.getByRole('dialog');
        await aiViewer.waitFor();
        assert.match(await aiViewer.locator('.as-viewer-note').textContent(), /создана с помощью ИИ/i);
        await aiViewer.getByRole('button', { name:'Закрыть' }).tap();
        await aiViewer.waitFor({ state:'hidden' });
      }
      // Return to first image, then swipe horizontally and verify selection.
      await thumbs.first().scrollIntoViewIfNeeded();
      await thumbs.first().tap();
      await page.locator('.as-product-gallery').evaluate(el => {
        const start = new Event('touchstart', { bubbles:true });
        const end = new Event('touchend', { bubbles:true });
        Object.defineProperty(start, 'touches', { value:[{clientX:300,clientY:300}] });
        Object.defineProperty(end, 'changedTouches', { value:[{clientX:120,clientY:300}] });
        el.dispatchEvent(start); el.dispatchEvent(end);
      });
      assert.equal(await thumbs.nth(1).getAttribute('aria-pressed'), 'true', id + ' swipe did not advance');
      await thumbs.first().scrollIntoViewIfNeeded();
      await thumbs.first().tap();
      const source = await shown.getAttribute('src');
      await page.getByRole('button', { name: 'Увеличить фотографию товара' }).tap();
      const viewer = page.getByRole('dialog');
      await viewer.waitFor();
      assert.equal(await viewer.locator('.as-photo-viewport img').getAttribute('src'), source);
      await viewer.getByRole('button', { name: 'Следующая фотография' }).tap();
      assert.notEqual(await viewer.locator('.as-photo-viewport img').getAttribute('src'), source);
      await viewer.getByRole('button', { name: 'Закрыть' }).tap();
      await viewer.waitFor({ state: 'hidden' });
      return count;
    }

    await exerciseGallery('iphone-18-pro', /iPhone 18 Pro/i, 2);
    await page.goBack();
    await page.locator('.as-catalog').waitFor();
    assert.equal(await search.inputValue(), 'iPhone 18');
    assert.equal(await cards(page).count(), matches);
    const proMaxFrames = await exerciseGallery('iphone-18-pro-max', /iPhone 18 Pro Max/i, 4);
    assert.ok(proMaxFrames >= 4, 'Pro Max needs multiple photos');

    // Browser back keeps the user's search; forward returns to the same product.
    await page.goBack();
    await page.locator('.as-catalog').waitFor();
    assert.equal(await search.inputValue(), 'iPhone 18');
    assert.equal(await cards(page).count(), matches);
    await page.goForward();
    await page.locator('.as-product').waitFor();
    await page.getByRole('button', { name: /В КОРЗИНУ/ }).tap();
    let dialog = page.getByRole('dialog');
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
    // Verify products from other families with their own photographs and facts.
    for (const [term, id, expected] of [['iPad Air','ipad-air-11-m4',/iPad Air 11/i], ['Watch Ultra','watch-ultra-4',/Watch Ultra 4/i]]) {
      await page.locator('.as-nav').getByRole('button', {name:'Каталог'}).tap();
      await page.locator('.as-catalog').waitFor();
      const field = page.getByRole('searchbox', {name:'Поиск по каталогу'});
      await field.fill(term);
      await exerciseGallery(id, expected, 2);
    }
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width}x${height}: ${total} products, category filters, images, scroll, search, product, zoom, history and demo checkout passed`);
  } finally {
    await context.close();
    await browser.close();
  }
}

(async () => {
  const cases = [[chromium,320,568], [chromium,390,844], [webkit,320,568], [webkit,390,844], [webkit,430,932]];
  for (const [engine,width,height] of cases) {
    if (!process.env.APPLE_TEST_SINGLE || process.env.APPLE_TEST_SINGLE === engine.name() + ':' + width) await run(engine,width,height);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
