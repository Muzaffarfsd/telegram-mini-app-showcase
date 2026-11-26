const { assert, run, open, btn, widthOK } = require('./buyer-test-helpers.cjs');
run(
  'shoppable lookbook, sample preferences, inspection, personal review and material atlas',
  async (browser, ru) => {
    const { page, context, nav, errors } = await open(browser, {
      ru,
      width: ru ? 390 : 950,
    });
    const t = (a, b) => (ru ? a : b);
    try {
      await btn(page, t('Лукбук', 'Lookbook')).click();
      const book = page.locator('#yb-lookbook');
      await btn(book, t('Чайная пауза', 'A pause for tea')).click();
      assert.equal(await book.locator('.yb-shop-point').count(), 3);
      await book.locator('.yb-shop-point').nth(2).click();
      await page
        .getByRole('heading', {
          name: t('Чайная композиция', 'Tea setting'),
          exact: true,
        })
        .waitFor();
      await btn(page, t('Назад', 'Back')).click();
      await book.waitFor();
      assert.equal(
        await btn(book, t('Чайная пауза', 'A pause for tea')).getAttribute(
          'aria-pressed',
        ),
        'true',
      );
      await btn(book, t('Запросить подборку', 'Request the edit')).click();
      const refs = page.locator('.yb-references li');
      await refs.first().waitFor();
      assert.equal(await refs.count(), 3);
      await btn(nav, t('Образцы', 'Samples')).click();
      await page
        .getByTestId('buyer-item-tailoring')
        .locator('.yb-image-link')
        .click();
      const photo = page.locator('.yb-detail-picture');
      await photo.press('ArrowRight');
      assert.match(
        await photo.locator('img').getAttribute('src'),
        /reverse\.webp/,
      );
      await photo.evaluate((el) => {
        const start = Object.assign(
          new Event('touchstart', { bubbles: true }),
          { touches: [{ clientX: 190, clientY: 140 }] },
        );
        const end = Object.assign(new Event('touchend', { bubbles: true }), {
          changedTouches: [{ clientX: 110, clientY: 143 }],
        });
        el.dispatchEvent(start);
        el.dispatchEvent(end);
        el.click();
      });
      assert.match(
        await photo.locator('img').getAttribute('src'),
        /detail\.webp/,
      );
      assert.equal(await page.getByRole('dialog').count(), 0);
      await btn(page, 'M').click();
      await btn(page, t('Свой оттенок', 'Custom colour')).click();
      const custom = page.getByLabel(t('Желаемый оттенок', 'Preferred shade'));
      await custom.fill('Midnight');
      await page.locator('#yb-order-qty').fill('12');
      await btn(page, t('Найти похожее', 'Source something similar')).click();
      assert.equal(await page.locator('#cbw-size').inputValue(), 'M');
      assert.equal(await page.locator('#cbw-color').inputValue(), 'Midnight');
      assert.equal(await page.locator('#cbw-quantity').inputValue(), '12');
      await btn(page, t('Назад', 'Back')).click();
      await custom.waitFor();
      assert.equal(await custom.inputValue(), 'Midnight');
      assert.equal(await btn(page, 'M').getAttribute('aria-pressed'), 'true');
      await page.locator('.yb-passport summary').nth(1).click();
      assert.ok(
        (await page
          .locator('.yb-passport details')
          .nth(1)
          .getAttribute('open')) !== null,
      );
      await btn(
        page,
        t('Увеличить деталь образца', 'Enlarge the sample detail'),
      ).click();
      const dialog = page.getByRole('dialog');
      await dialog.waitFor();
      assert.match(
        await dialog.locator('.yb-zoom-frame img').getAttribute('src'),
        /detail\.webp/,
      );
      await btn(dialog, t('Закрыть фото', 'Close photo')).click();
      await btn(page, t('Оценить образец', 'Review this sample')).click();
      await page
        .getByRole('radio', { name: t('Оценка 4/5', 'Rate 4/5') })
        .check();
      await page
        .getByLabel(t('Впечатления об образце', 'Your impressions'))
        .fill('Check sleeve length');
      await btn(page, t('Сохранить отзыв', 'Save review')).click();
      await page.reload();
      await page.getByText('Check sleeve length', { exact: true }).waitFor();
      assert.equal(
        await page
          .locator('.yb-saved-review strong')
          .getAttribute('aria-label'),
        t('Оценка 4/5', 'Rating 4/5'),
      );
      await btn(nav, t('Бюро', 'Bureau')).click();
      await btn(page, t('Следующий образец', 'Next sample')).click();
      const frame = await page.locator('.yb-feature-pic').boundingBox();
      const macro = await page.locator('.yb-atlas-macro').boundingBox();
      assert.ok(
        Math.abs(frame.width - macro.width) < 2,
        'The selected macro fills its frame',
      );
      await btn(page, t('Предыдущий образец', 'Previous sample')).click();
      await page.locator('.yb-feature-pic').click();
      assert.match(
        await page.locator('.yb-detail-picture img').getAttribute('src'),
        /fold\/texture\.webp/,
      );
      assert.equal(await page.locator('.yb-saved-review').count(), 0);
      await widthOK(page);
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  },
  [true, false],
);
