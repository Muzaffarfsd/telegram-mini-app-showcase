const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');

const base = process.argv[2] || process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:5271/';
const url = new URL('/#/demos/furniture-studio/app', base).href;

async function exercise(engine, width, ru) {
  const browser = await engine.launch();
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: ru ? 'ru-RU' : 'en-US',
    serviceWorkers: 'block',
  });
  await context.addInitScript((lang) => localStorage.setItem('app-language', lang), ru ? 'ru' : 'en');
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const text = (r, e) => (ru ? r : e);
  const button = (r, e) => page.getByRole('button', { name: text(r, e), exact: true });
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  try {
    await page.goto(url);
    await page.getByRole('heading', { name: 'Sofas', exact: true }).waitFor();
    const cover = page.locator('.fhome-slide[aria-hidden=false] .fhome-hero-image');
    await cover.evaluate((e) => e.decode());
    assert.match(
      await cover.getAttribute('src'),
      /home\/sloane-1440\.webp$/
    );
    const active = page.locator('.fs-nav-button.is-active');
    const contrast = await active.evaluate((el) => [
      getComputedStyle(el).backgroundColor,
      getComputedStyle(el.querySelector('svg')).color,
    ]);
    assert.deepEqual(contrast, ['rgb(23, 23, 23)', 'rgb(255, 255, 255)']);
    await button('Все модели', 'All pieces').click();
    const cards = page.locator('.fs-catalog .fs-card');
    assert.equal(await cards.count(), 30);
    const row = cards.first();
    const copyBox = await row.locator('.fs-row-copy').boundingBox();
    const imageBox = await row.locator('.fs-row-photo').boundingBox();
    assert(copyBox && imageBox && copyBox.x + copyBox.width <= imageBox.x + 1);
    assert.match(await row.locator('.fs-row-photo img').getAttribute('src'), /\/studio\.webp$/);
    const alpha = await row.locator('.fs-row-photo img').evaluate(async (img) => {
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 96;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 96, 96);
      const rgba = ctx.getImageData(0, 0, 96, 96).data;
      return {
        background: getComputedStyle(img).backgroundColor,
        corner: rgba[3],
        clear: Array.from(rgba).filter((v, i) => i % 4 === 3 && v === 0).length,
        solid: Array.from(rgba).filter((v, i) => i % 4 === 3 && v === 255).length,
      };
    });
    assert.equal(alpha.background, 'rgba(0, 0, 0, 0)');
    assert.equal(alpha.corner, 0);
    assert(alpha.clear > 2000 && alpha.solid > 500, 'the actual catalogue cover is a cutout');

    await row.locator('.fs-row-add').tap();
    assert.equal(await page.locator('.fs-store').getAttribute('data-screen'), 'catalog');
    await page.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem('web4tg-furniture-store-v1') || '{}').cart?.[0]?.quantity === 1
    );
    await page.locator('.fs-filters summary').click();
    await button('В студии', 'In the studio').click();
    await button('В интерьере', 'In an interior').click();
    assert.equal(await button('В интерьере', 'In an interior').getAttribute('aria-pressed'), 'true');
    await page.locator('.fs-filters summary').click();
    const card = cards.first().locator('.fs-card-open');
    await card.locator('img').evaluate((e) => e.decode());
    assert.match(await card.locator('img').getAttribute('src'), /\/interior\.webp$/);
    await card.click();
    assert.equal(
      await page.locator('.fs-gallery-thumbs button').nth(1).getAttribute('aria-pressed'),
      'true'
    );
    await page.locator('.fs-detail-links button').last().click();
    await page.locator('#fs-review-title').waitFor();
    assert.equal(await page.locator('.fs-review-list article').count(), 0);
    await button('Написать отзыв', 'Write a review').click();
    await page.getByLabel(text('Имя', 'Name'), { exact: true }).fill('Studio QA');
    await page.getByRole('radio', { name: '4 / 5' }).check();
    const feedback = text(
      'Удобно сравнить диван в интерьере и на плане.',
      'I could compare the sofa in the room and on the floor plan.'
    );
    const field = page.getByLabel(text('Ваш отзыв', 'Your review'), { exact: true });
    await field.fill('x');
    await button('Сохранить отзыв', 'Save review').click();
    assert.equal(await field.evaluate((el) => el.validity.tooShort), true);
    await field.fill(feedback);
    await page.evaluate(() => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (k.startsWith('web4tg-furniture-review:') && !window.__testedReviewWrite) {
          window.__testedReviewWrite = true;
          throw new Error('test storage write failure');
        }
        return orig.call(this, k, v);
      };
    });
    await button('Сохранить отзыв', 'Save review').click();
    await page.locator('.fs-review-form [role="alert"]').waitFor();
    assert.equal(await field.inputValue(), feedback);
    await button('Сохранить отзыв', 'Save review').click();
    const published = page.locator('.fs-review-list article');
    assert.equal(await published.count(), 1);
    assert.match(await published.innerText(), /Studio QA/);
    assert.equal(
      await published.getByRole('img').getAttribute('aria-label'),
      text('Оценка 4 / 5', 'Rating 4 / 5')
    );
    await page.reload();
    if (await page.locator('.fhome-cover').isVisible()) {
      await button('Все модели', 'All pieces').click();
      await page.locator('.fs-catalog .fs-card-open').first().click();
    }
    if (await page.locator('.fs-catalog').isVisible())
      await page.locator('.fs-catalog .fs-card-open').first().click();
    await page.locator('.fs-review-list').getByText(feedback).waitFor();
    const other = await context.newPage();
    await other.goto(url);
    await other.locator('.fhome-slide[aria-hidden=false] .fhome-cover-link').click();
    await other.locator('#fs-details-title').waitFor();
    assert.equal(
      await other.locator('.fs-review-list article').count(),
      0,
      'reviews belong to one product'
    );
    assert.ok((await other.locator('.fs-specs dt').count()) > 0, 'the real model has sourced details');
    assert.deepEqual(errors, []);
    console.log(
      engine.name(),
      width,
      text('RU', 'EN'),
      'passes gallery, neutral controls, product-scoped review, write recovery and reload'
    );
  } finally {
    await browser.close();
  }
}
(async () => {
  await exercise(chromium, 320, true);
  await exercise(webkit, 390, false);
})().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
