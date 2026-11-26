const { assert, run, open, widthOK, btn } = require('./buyer-test-helpers.cjs');
run(
  'gallery details, zoom, saved samples and sourcing handoff',
  async (browser) => {
    const {
      context,
      page: p,
      nav,
      errors,
    } = await open(browser, { width: 390 });
    try {
      await btn(p, 'Открыть Сумка Fold').first().click();
      await btn(p, 'Фактура').click();
      assert.match(
        await p.locator('.yb-detail-picture img').getAttribute('src'),
        /fold\/texture\.webp/,
      );
      await btn(p, 'Рассмотреть фото').click();
      const dialog = p.getByRole('dialog');
      await dialog.waitFor();
      await btn(dialog, 'Увеличить').click();
      assert.equal(
        await dialog.locator('.yb-zoom-frame').getAttribute('data-zoom'),
        'true',
      );
      await dialog.locator('.yb-zoom-frame').press('ArrowRight');
      assert.notEqual(
        await dialog
          .locator('.yb-zoom-frame img')
          .evaluate((el) => el.style.translate),
        '0px 0px',
      );
      await btn(dialog, 'Следующее фото').click();
      assert.match(
        await dialog.locator('.yb-zoom-frame img').getAttribute('src'),
        /fold\/front\.webp/,
      );
      await p.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.ok(
        await btn(p, 'Рассмотреть фото').evaluate(
          (el) => el === document.activeElement,
        ),
      );
      await btn(p, 'Избранное').click();
      await btn(p, 'Найти похожее').click();
      assert.match(await p.locator('.yb-references').innerText(), /Fold/);
      await p.locator('#cbw-size').fill('25 × 18');
      await p.locator('#cbw-color').fill('Синий');
      await nav.getByRole('button', { name: 'Бюро' }).click();
      await nav.getByRole('button', { name: 'Запрос' }).click();
      assert.equal(await p.locator('#cbw-color').inputValue(), 'Синий');
      await nav.getByRole('button', { name: 'Моё' }).click();
      await p.locator('.yb-desk-tabs button').nth(1).click();
      await p.getByTestId('buyer-item-fold').waitFor();
      await p.reload();
      await p.getByTestId('buyer-item-fold').waitFor();
      await p.getByTestId('buyer-item-fold').locator('.yb-fav').click();
      await btn(p, 'Открыть библиотеку').click();
      await p
        .getByTestId('buyer-item-v5-feature')
        .locator('.yb-image-link')
        .click();
      assert.equal(await p.locator('.yb-thumbs button').count(), 4);
      await p.locator('.yb-thumbs button').nth(3).click();
      assert.match(
        await p.locator('.yb-detail-picture img').getAttribute('src'),
        /v5-feature\/texture\.webp/,
      );
      await p.locator('.yb-related .yb-image-link').first().click();
      assert.ok(
        !(await p.locator('.yb-product-intro h1').innerText()).includes('бордо'),
      );
      await widthOK(p);
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  },
);
