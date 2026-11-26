const { assert, run, open, btn } = require('./buyer-test-helpers.cjs');

async function checkPalette(page, screen) {
  const offenders = await page.evaluate(() => {
    const colors = [
      'color',
      'backgroundColor',
      'backgroundImage',
      'borderTopColor',
      'borderBottomColor',
      'outlineColor',
      'boxShadow',
      'fill',
      'stroke',
    ];
    const bad = new Set();
    const nodes = document.querySelectorAll(
      '.yb, .yb *, .yb-dock-wrap, .yb-dock-wrap *, .yb-lightbox, .yb-lightbox *',
    );
    for (const element of nodes) {
      if (!element.getClientRects().length) continue;
      for (const pseudo of [null, '::before', '::after']) {
        const style = getComputedStyle(element, pseudo);
        if (pseudo && ['none', 'normal'].includes(style.content)) continue;
        for (const property of colors) {
          const value = style[property];
          if (!value) continue;
          for (const match of value.matchAll(/rgba?\(([^)]+)\)/g)) {
            const [red, green, blue, alpha = 1] = match[1]
              .split(/[,\s/]+/)
              .filter(Boolean)
              .map(Number);
            if (alpha > 0 && green > red + 4 && green > blue + 2)
              bad.add(element.tagName + ' ' + property + ' ' + match[0]);
          }
        }
      }
    }
    return Array.from(bad);
  });
  assert.deepEqual(offenders, [], screen);
}

run(
  'ink controls and selected, hover and focus states across the buyer flow',
  async (browser) => {
    const { page, context, nav, errors } = await open(browser);
    try {
      const ink = await page
        .locator('.yb')
        .evaluate((node) => getComputedStyle(node).color);
      const pickColor = (locator, prop) =>
        locator.evaluate((node, key) => getComputedStyle(node)[key], prop);
      const next = btn(page, 'Следующий этап');
      await next.hover();
      assert.equal(
        await pickColor(
          page.locator('.yb-chapter-tabs [aria-pressed="true"] span'),
          'backgroundColor',
        ),
        ink,
      );
      assert.equal(
        await pickColor(btn(page, 'По фото'), 'backgroundColor'),
        'rgba(0, 0, 0, 0)',
      );
      await checkPalette(page, 'home and active navigation');
      await btn(page, 'Как работает байер').click();
      assert.equal(await pickColor(btn(page, 'Начать запрос'), 'color'), ink);
      await checkPalette(page, 'illustrated guide');
      await btn(nav, 'Образцы').click();
      const category = btn(page, 'Сумки');
      await category.click();
      assert.equal(await category.getAttribute('aria-pressed'), 'true');
      assert.equal(await pickColor(category, 'borderBottomColor'), ink);
      const item = page.getByTestId('buyer-item-fold');
      await item.locator('.yb-compare-icon').click();
      await checkPalette(page, 'selected library filters and comparison');
      await item.locator('.yb-image-link').click();
      await checkPalette(page, 'sample details and selected exposure');
      await btn(nav, 'Запрос').click();
      const field = page.locator('#cbw-description');
      await btn(page, 'Для бизнеса').click();
      await field.focus();
      await field.fill('Образцы для магазина');
      await checkPalette(page, 'active form field and business request');
      await page.locator('#cbw-quantity').fill('2');
      await btn(page, 'Проверить запрос').click();
      await checkPalette(page, 'brief review');
      await btn(page, 'Сохранить запрос').click();
      await btn(page, 'Добавить предложение').click();
      await checkPalette(page, 'saved request and supplier form');
      await btn(nav, 'Моё').click();
      await checkPalette(page, 'desk');
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  },
);
