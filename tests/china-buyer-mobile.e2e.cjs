const { assert, run, open, widthOK, btn } = require('./buyer-test-helpers.cjs');
run(
  'bureau layout, carousel, navigation and library',
  async (browser, width) => {
    const ru = width !== 768;
    const {
      context,
      page: p,
      nav,
      errors,
    } = await open(browser, { width, ru });
    try {
      const primary = btn(p, ru ? 'По фото' : 'Use a photo');
      const box = await primary.boundingBox();
      assert.ok(box.y + box.height < (await nav.boundingBox()).y);
      const title = p.locator('.yb-feature-caption strong');
      assert.match(await title.innerText(), /Fold/);
      await btn(p, ru ? 'Следующий образец' : 'Next sample').click();
      assert.match(await title.innerText(), /Arc/);
      await btn(p, ru ? 'Предыдущий образец' : 'Previous sample').click();
      assert.match(await title.innerText(), /Fold/);
      await btn(p, ru ? 'Как работает байер' : 'How sourcing works').click();
      await p.locator('.yb-guide article').first().waitFor();
      assert.equal(await p.locator('.yb-guide article').count(), 3);
      await btn(p, ru ? 'Назад' : 'Back').click();
      await primary.waitFor();
      await btn(p, ru ? 'Найти образец' : 'Find a sample').click();
      const query = p.getByRole('searchbox');
      await query.waitFor();
      assert.ok(await query.evaluate((el) => el === document.activeElement));
      assert.equal(await p.locator('.yb-grid article').count(), 25);
      await query.fill('clay');
      assert.equal(await p.locator('.yb-grid article').count(), 1);
      await p.getByTestId('buyer-item-clay').waitFor();
      await query.fill('xyzzqq');
      await btn(p, ru ? 'Сбросить фильтры' : 'Reset filters').click();
      await btn(p, ru ? 'Сумки' : 'Bags').click();
      assert.ok((await p.locator('.yb-grid article').count()) > 2);
      const sort = p.getByRole('combobox', {
        name: ru ? 'Сортировка' : 'Sort order',
      });
      await sort.selectOption('az');
      const names = await p
        .locator('.yb-card-caption>div>button')
        .allInnerTexts();
      assert.deepEqual(
        names,
        [...names].sort((a, b) => a.localeCompare(b, ru ? 'ru' : 'en')),
      );
      const targeted = p.getByTestId('buyer-item-fold');
      await targeted.locator('.yb-image-link').click();
      await p.locator('.yb-detail').waitFor();
      await p.goBack();
      await p.locator('.yb-grid').waitFor();
      assert.equal(await sort.inputValue(), 'az');
      assert.equal(
        await btn(p, ru ? 'Сумки' : 'Bags').getAttribute('aria-pressed'),
        'true',
      );
      await widthOK(p);
      if (width === 390) {
        await btn(nav, 'Бюро').click();
        await p.evaluate(() => {
          const style = document.documentElement.style;
          style.setProperty('--tg-viewport-height', '764px');
          style.setProperty('--sab', '34px');
          style.setProperty('--csab', '50px');
          const root = document.getElementById('root');
          root.scrollTop = root.scrollHeight;
        });
        const dock = await nav.boundingBox();
        assert.ok(
          dock.y + dock.height <= 715,
          'Telegram content and bottom safe area',
        );
        const guide = await btn(p, 'От запроса до выкупа').boundingBox();
        assert.ok(
          guide.y + guide.height <= dock.y,
          'Last action clears the dock',
        );
      }
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  },
  [320, 390, 768, 1440],
);
