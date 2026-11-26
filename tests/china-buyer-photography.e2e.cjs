const { assert, run, open, btn } = require('./buyer-test-helpers.cjs');

run('all 25 product galleries and 68 original images', async (browser) => {
  const { context, page, nav, errors } = await open(browser, { width: 1100 });
  try {
    await btn(nav, 'Образцы').click();
    const ids = await page
      .locator('.yb-grid article')
      .evaluateAll((cards) => cards.map((card) => card.dataset.testid));
    assert.equal(new Set(ids).size, 25);
    const seen = new Set();
    for (const id of ids) {
      await page.getByTestId(id).locator('.yb-image-link').click();
      const thumbs = page.locator('.yb-thumbs button');
      await thumbs.first().waitFor();
      const count = await thumbs.count();
      assert.ok(count === 2 || count === 4, id);
      for (let i = 0; i < count; i++) {
        await thumbs.nth(i).click();
        const [src, width, height] = await page
          .locator('.yb-detail-picture img')
          .evaluate(async (image) => {
            await image.decode();
            return [
              new URL(image.currentSrc).pathname,
              image.naturalWidth,
              image.naturalHeight,
            ];
          });
        assert.ok(
          src.startsWith(
            '/china-buyer/sourcing/products/' +
              id.replace('buyer-item-', '') +
              '/',
          ),
          src,
        );
        assert.deepEqual([width, height], [600, 600]);
        assert.ok(!seen.has(src), src);
        seen.add(src);
      }
      await page.goBack();
      await page.getByTestId(id).waitFor();
    }
    assert.equal(seen.size, 68);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
