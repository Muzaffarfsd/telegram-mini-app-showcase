const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.JEWELRY_TEST_URL || 'http://127.0.0.1:5195/';
const labels = ['Украшение', 'Другой ракурс', 'На модели', 'В упаковке'];

async function assertGallery(page, productId) {
  const gallery = page.locator('.mf-gallery');
  for (let index = 0; index < labels.length; index++) {
    if (index) await gallery.getByRole('button', { name: labels[index], exact: true }).click();
    assert.equal((await gallery.locator('.mf-gallery-count').innerText()).trim(), `0${index + 1} / 04`, `${productId}: incorrect ${labels[index]} view`);
    const viewport = gallery.locator('.mf-gallery-image-viewport');
    const imageCount = await viewport.locator('img').count();
    const pendingCount = await viewport.locator('.jewelry-image-pending').count();
    assert.equal(imageCount + pendingCount, 1, `${productId}: no image or pending state in view ${index + 1}`);
    if (imageCount) {
      const img = viewport.locator('img');
      await img.waitFor({ state: 'visible' });
      await page.waitForFunction(el => el.complete, await img.elementHandle());
      assert.ok(await img.evaluate(el => el.naturalWidth > 0), `${productId}: photo ${index + 1} did not load`);
    }
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block' });
      await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${base}#/demos/jewelry-store/app`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('jewelry-store').waitFor();
      assert.match(await page.locator('.mf-hero-headline').innerText(), /УКРАШЕНИЯ ДЛЯ\s+ТВОЕЙ ЖИЗНИ/);
      const nav = page.locator('.mf-nav');
      const bar = await nav.boundingBox();
      assert.ok(bar && bar.x >= 0 && bar.x + bar.width <= width, `${width}px: navigation overflow`);
      assert.ok(await page.getByTestId('demo-return-web4tg').isVisible());
      await nav.getByRole('button', { name: 'Каталог', exact: true }).click();
      const cards = page.locator('[data-testid^="mf-card-"]');
      assert.equal(await cards.count(), 20);
      await page.getByRole('button', { name: 'Фильтры', exact: true }).click();
      const filters = page.locator('.mf-sheet');
      await filters.getByRole('button', { name: 'До $2 000' }).click();
      await filters.getByRole('button', { name: 'ПОКАЗАТЬ ТОВАРЫ' }).click();
      await page.waitForFunction(() => !document.querySelector('.mf-sheet'));
      const filteredCount = await cards.count();
      assert.ok(filteredCount > 0 && filteredCount < 20, 'price filter must narrow the catalog');
      await page.getByRole('button', { name: 'Сбросить', exact: true }).click();
      await page.locator('.mf-chips').getByRole('button', { name: 'Кольца', exact: true }).click();
      assert.equal(await cards.count(), 5);
      await page.getByLabel('Поиск по коллекции').fill('T1');
      assert.equal(await cards.count(), 1);
      const ring = page.getByTestId('mf-card-tiffany-67796772');
      await ring.getByRole('button', { name: /В избранное/ }).click();
      await ring.getByRole('button', { name: /Открыть/ }).click();
      assert.match(await page.locator('.mf-product h1').innerText(), /Tiffany T T1/);
      assert.match(await page.locator('.mf-product-info a[href*="tiffany.com"]').getAttribute('href'), /^https:\/\/www\.tiffany\.com\//);
      await assertGallery(page, 'tiffany-67796772');
      await page.getByRole('button', { name: 'Увеличить фотографию товара' }).click();
      assert.ok(await page.getByRole('region', { name: /Увеличенная фотография/ }).isVisible());
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('region', { name: /Увеличенная фотография/ }).count(), 0);
      await page.getByRole('button', { name: 'В ПОДБОРКУ' }).click();
      await page.getByLabel('Название подборки').fill('Избранные украшения');
      await page.getByRole('button', { name: 'Создать', exact: true }).click();
      await page.getByRole('button', { name: 'Избранные украшения' }).click();
      assert.equal(await page.getByRole('button', { name: 'Избранные украшения' }).getAttribute('aria-pressed'), 'true');
      await page.getByRole('button', { name: /ДОБАВИТЬ В КОРЗИНУ/ }).click();
      assert.match(await page.locator('.mf-cart-item').innerText(), /Tiffany T T1/);
      await page.locator('.mf-sheet').getByRole('button', { name: /Увеличить количество/ }).click();
      assert.equal(await page.locator('.mf-qty span').innerText(), '2');
      await page.getByRole('button', { name: 'ОФОРМИТЬ ДЕМО-ЗАКАЗ' }).click();
      await page.getByLabel('Имя', { exact: true }).fill('Анна');
      await page.getByLabel('Телефон', { exact: true }).fill('79991234567');
      assert.ok(!JSON.stringify(await page.evaluate(() => history.state)).includes('79991234567'), 'history must not store contact data');
      await page.getByRole('button', { name: 'ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ' }).click();
      await page.locator('.mf-success').waitFor();
      await nav.getByRole('button', { name: 'Профиль', exact: true }).click();
      assert.ok(await page.getByTestId('mf-card-tiffany-67796772').first().isVisible());
      assert.match(await page.locator('.fw-collections').innerText(), /Избранные украшения/);
      await page.locator('.fw-orders summary').click();
      assert.match(await page.locator('.fw-order-lines').innerText(), /Tiffany T T1/);
      await page.reload();
      await page.getByTestId('jewelry-store').waitFor();
      await nav.getByRole('button', { name: 'Профиль', exact: true }).click();
      assert.match(await page.locator('.fw-collections').innerText(), /Избранные украшения/);
      assert.ok(await page.getByTestId('mf-card-tiffany-67796772').first().isVisible());
      await nav.getByRole('button', { name: 'Главная', exact: true }).click();
      await page.getByRole('button', { name: 'СМОТРЕТЬ ОБРАЗЫ' }).click();
      assert.equal(await page.locator('.mfl-index-card').count(), 3);
      await page.getByRole('button', { name: 'СОБРАТЬ ПОДБОРКУ' }).first().click();
      assert.equal(await page.locator('.mfl-product').count(), 3);
      await page.getByRole('button', { name: /Сохранить образ/ }).click();
      await page.getByRole('button', { name: /ДОБАВИТЬ В КОРЗИНУ/ }).click();
      assert.equal(await page.locator('.mf-cart-item').count(), 3);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px: horizontal overflow`);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`PASS jewelry MIRA flows at ${width}px`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
