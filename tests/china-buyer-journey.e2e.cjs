const { assert, run, open, widthOK, btn } = require('./buyer-test-helpers.cjs');
run(
  'illustrated chapters, gestures, keyboard and the buyer-only navigation',
  async (browser, width) => {
    const ru = width === 320;
    const { page, context, nav, errors } = await open(browser, { width, ru });
    try {
      const section = page.getByRole('region', {
          name: ru ? 'Путь закупки' : 'The sourcing journey',
        }),
        art = section.locator('.yb-journey-art');
      const next = btn(section, ru ? 'Следующий этап' : 'Next step'),
        previous = btn(section, ru ? 'Предыдущий этап' : 'Previous step');
      const photo = btn(page, ru ? 'По фото' : 'Use a photo');
      const headers = ru
        ? ['Ваш байер в Китае', 'Проверка образца', 'Цена с доставкой']
        : ['Your buyer in China', 'Inspect the sample', 'The delivered price'];
      const heading = section.getByRole('heading', { level: 1 });
      assert.equal(await heading.innerText(), headers[0]);
      const top = async () => (await photo.boundingBox()).y;
      const start = await top();
      assert.ok((await page.locator('.w4-topbar:visible').count()) === 0);
      await next.click();
      assert.equal(await heading.innerText(), headers[1]);
      const visibleWork = art.locator('img[src*="worktable"]');
      assert.ok(await visibleWork.isVisible());
      await visibleWork.evaluate((img) => img.decode());
      await art.focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await heading.innerText(), headers[2]);
      assert.ok(
        Math.abs(start - (await top())) <= 2,
        'Request buttons stay in place as chapters change.',
      );
      await next.click();
      assert.equal(await heading.innerText(), headers[0]);
      assert.equal(await previous.count(), 0);
      await next.click();
      await previous.click();
      assert.equal(await heading.innerText(), headers[0]);
      await btn(
        section,
        ru ? 'Показать этап «Расчёт»' : 'Show step “Quote”',
      ).click();
      assert.equal(await heading.innerText(), headers[2]);
      const box = await art.boundingBox();
      const x = box.x + box.width * 0.38,
        y = box.y + box.height * 0.55;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 70, y + 3, { steps: 6 });
      await page.mouse.up();
      assert.equal(await heading.innerText(), headers[1]);
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x + 1, y + 49, { steps: 5 });
      await page.mouse.up();
      assert.equal(await heading.innerText(), headers[1]);
      await btn(
        section,
        ru ? 'Показать этап «Поиск»' : 'Show step “Sourcing”',
      ).click();
      assert.equal(await heading.innerText(), headers[0]);
      const badge = page.locator('.yb-mark');
      await badge.evaluate(() => document.fonts.ready);
      assert.ok(
        await badge.evaluate(() =>
          document.fonts.check('500 15px "Yangben Ink"', '样本'),
        ),
      );
      await btn(page, ru ? 'Как работает байер' : 'How sourcing works').click();
      assert.equal(await page.locator('.yb-guide article').count(), 3);
      assert.equal(await btn(page, ru ? 'Назад' : 'Back').count(), 1);
      await btn(page, ru ? 'Начать запрос' : 'Start a brief').click();
      await page.locator('#cbw-description').waitFor();
      await widthOK(page);
      await nav.getByTestId('demo-return-web4tg').click();
      await page.waitForURL((url) => !url.hash.includes('china-buyer'));
      await page
        .locator('#root.china-buyer-scroll-root')
        .waitFor({ state: 'detached' });
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  },
  [320, 950],
);
