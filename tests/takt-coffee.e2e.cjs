const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.COFFEE_TEST_URL || 'http://127.0.0.1:5271').replace(
  /\/$/,
  '',
);
const demo = base + '/#/demos/takt-coffee/app';
const engine = process.env.COFFEE_ENGINE || 'chromium';
const browserType = engine === 'webkit' ? webkit : chromium;
async function context(browser, width, lang) {
  const ctx = await browser.newContext({
    viewport: { width, height: 844 },
    hasTouch: width < 700,
    isMobile: width < 700,
    locale: lang === 'ru' ? 'ru-RU' : 'en-GB',
    serviceWorkers: 'block',
  });
  await ctx.addInitScript((l) => localStorage.setItem('app-language', l), lang);
  await ctx.route('https://telegram.org/js/telegram-web-app.js', (r) =>
    r.fulfill({ contentType: 'application/javascript', body: '' }),
  );
  return ctx;
}
const screen = (p, id) =>
  p.locator('[data-testid="takt-coffee"][data-screen="' + id + '"]').waitFor();
const bag = (p) => p.locator('.tk-bag').click();
async function widthOK(p) {
  const result = await p.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    root: document.querySelector('#root').scrollWidth,
    width: innerWidth,
  }));
  assert.ok(
    result.doc <= result.width + 1 && result.root <= result.width + 1,
    JSON.stringify(result),
  );
}
async function audit(p) {
  if (engine !== 'chromium' || !base.includes('127.0.0.1')) return;
  await p.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const errors = await p.evaluate(async () =>
    (
      await window.axe.run(document.querySelector('.tk-app'), {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      })
    ).violations.map((v) => [v.id, v.nodes.map((n) => n.target)]),
  );
  assert.deepEqual(errors, []);
}
async function full(browser) {
  const ctx = await context(browser, 390, 'ru'),
    p = await ctx.newPage(),
    errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  p.on('response', (r) => {
    if (r.status() >= 400 && r.url().includes('/takt-coffee/'))
      errors.push(r.status() + ' ' + r.url());
  });
  try {
    await p.goto(base + '/#/projects');
    await p.getByTestId('card-app-takt-coffee').click();
    await screen(p, 'menu');
    await widthOK(p);
    await audit(p);
    assert.ok(await p.locator('.tk-product-image').evaluateAll(frames => frames.every(frame => {
      const card = frame.getBoundingClientRect(), photo = frame.querySelector('img').getBoundingClientRect();
      return photo.top >= card.top && photo.bottom <= card.bottom + 1 && photo.left >= card.left && photo.right <= card.right + 1;
    })), 'drink photographs fit inside their shelves without cropping');
    const closeSheet = async () => {
      await p.locator('dialog .tk-sheet-done').click();
      await p.locator('dialog').waitFor({ state: 'detached' });
    };
    assert.equal(await p.locator('.tk-card').count(), 7);
    await p.locator('.tk-filter-trigger').click();
    await audit(p);
    await p.getByRole('button', { name: 'Чёрный', exact: true }).click();
    assert.equal(await p.locator('.tk-card').count(), 2);
    await p.getByRole('button', { name: 'Со льдом', exact: true }).click();
    assert.equal(await p.locator('.tk-card').count(), 1);
    await p.getByRole('button', { name: 'Все напитки', exact: true }).click();
    await closeSheet();
    const location = p.locator('.tk-menu-footer button').first();
    await location.click();
    await p.locator('.tk-bars button').nth(1).click();
    await p.locator('.tk-action').click();
    await screen(p, 'menu');
    assert.match(await location.innerText(), /У парка/);
    await location.click();
    await p.locator('.tk-bars button').first().click();
    await p.goBack();
    await screen(p, 'menu');
    assert.match(await location.innerText(), /У парка/);
    await p.locator('.tk-card[data-drink=cappuccino]').click();
    await screen(p, 'builder');
    await widthOK(p);
    await audit(p);
    assert.equal(await p.locator('.tk-recipe-map .tk-ingredient').count(),6);
    assert.ok(await p.locator('.tk-recipe-map .tk-ingredient').evaluateAll(nodes => nodes.every(el => {
      const box=el.getBoundingClientRect();return el.contains(document.elementFromPoint(box.x+box.width/2, box.y+box.height/2));
    })), 'each photographic ingredient is a separate touch target');
    for (const [group, value] of [
      ['milk', 'oat'],
      ['beans', 'fruit'],
      ['syrup', 'vanilla'],
      ['foam', 'cloud'],
      ['latteArt', 'rosetta'],
      ['sugar', 'one'],
    ]) {
      await p.locator('[data-group=' + group + ']').click();
      await p.locator('dialog button[data-value=' + value + ']').click();
      if (group === 'beans')
        await p.locator('dialog [data-value=extra]').click();
      await closeSheet();
    }
    await p.locator('.tk-size-trigger').click();
    await p.locator('.tk-size button').last().click();
    await closeSheet();
    assert.match(await p.locator('.tk-brew-next').innerText(), /370/);
    await p.locator('.tk-brew-next').click();
    await screen(p, 'cup');
    await widthOK(p);
    const portrait = await p.locator('.tk-poster-cup').boundingBox();
    assert.ok(portrait.height >= 355, 'the finished cup occupies the main part of the mobile poster');
    assert.match(await p.locator('.tk-poster-title span').first().evaluate(el=>getComputedStyle(el).fontFamily),/Stengazeta/);
    await p.getByRole('button', { name: 'Сохранить рецепт' }).click();
    await p.reload();
    await screen(p, 'cup');
    assert.equal(
      await p
        .getByRole('button', { name: 'Сохранить рецепт' })
        .getAttribute('aria-pressed'),
      'true',
    );
    await p.locator('.tk-finish-detail').click();
    assert.match(await p.locator('.tk-recipe-list').innerText(), /Розетта/);
    assert.match(
      await p.locator('.tk-recipe-list').innerText(),
      /Кубик сахара/,
    );
    await p.goBack();
    await p.locator('dialog').waitFor({ state: 'detached' });
    await p.locator('.tk-buy').click();
    await screen(p, 'bag');
    await p.getByRole('button', { name: 'Увеличить количество' }).click();
    assert.match(await p.locator('.tk-total').innerText(), /740/);
    await p.locator('.tk-line-title').click();
    await p.locator('.tk-size-trigger').click();
    await p.locator('.tk-size button').first().click();
    await closeSheet();
    await p.locator('.tk-brew-next').click();
    await p.locator('.tk-buy').click();
    await screen(p, 'bag');
    assert.equal(await p.locator('.tk-line').count(), 1);
    assert.match(await p.locator('.tk-total').innerText(), /670/);
    await p.locator('.tk-action').click();
    await screen(p, 'pickup');
    await audit(p);
    assert.equal(await p.locator('.tk-times button').count(), 6);
    await p.locator('.tk-times button').nth(2).click();
    await p.locator('.tk-action').click();
    await screen(p, 'receipt');
    const receipt = await p.locator('.tk-ticket h2').innerText();
    assert.ok(receipt.length >= 8);
    assert.match(await p.locator('.tk-ticket').innerText(), /У парка/);
    assert.match(await p.locator('.tk-total').innerText(), /670/);
    await p.goBack();
    await screen(p, 'pickup');
    assert.equal(await p.locator('.tk-times').count(), 0);
    await p.goForward();
    await screen(p, 'receipt');
    const other = await ctx.newPage();
    await other.goto(demo);
    await screen(other, 'menu');
    await other.locator('.tk-bell').click();
    await other.locator('.tk-order-link').click();
    await p.locator('.tk-status-line button').click();
    await screen(p, 'counter');
    for (const status of ['Готовится', 'Готов к выдаче', 'Выдан']) {
      await p.locator('.tk-barista-order .tk-action').click();
      await other.waitForFunction(
        (s) => document.querySelector('.tk-stage')?.textContent === s,
        status,
      );
    }
    assert.equal(await p.locator('.tk-barista-order').count(), 0);
    await other.close();
    await p.goBack();
    await screen(p, 'receipt');
    await p.getByRole('button', { name: 'Повторить заказ' }).click();
    await screen(p, 'bag');
    assert.match(await p.locator('.tk-total').innerText(), /670/);
    await p.getByRole('button', { name: 'Удалить напиток' }).click();
    await p.locator('.tk-empty .tk-action').click();
    await screen(p, 'menu');
    await p.locator('.tk-brand-trigger').click();
    await p
      .locator('dialog')
      .getByRole('button', { name: 'Мои рецепты' })
      .click();
    await p.locator('.tk-saved-open').click();
    assert.match(await p.locator('.tk-buy').innerText(), /370/);
    await p.goBack();
    await screen(p, 'saved');
    await p.getByRole('button', { name: 'Удалить из рецептов' }).click();
    assert.equal(await p.locator('.tk-empty').count(), 1);
    await p.locator('.tk-compact-logo').click();
    await p.locator('.tk-bell').click();
    assert.equal(await p.locator('.tk-order-link').count(), 1);
    await p.locator('.tk-order-link').click();
    await p.getByRole('button', { name: 'Повторить заказ' }).click();
    await p.locator('.tk-action').click();
    await p.locator('.tk-action').click();
    await screen(p, 'receipt');
    await p.getByRole('button', { name: 'Отменить заказ' }).click();
    await p.getByRole('button', { name: 'Оставить заказ' }).click();
    assert.match(await p.locator('.tk-stage').innerText(), /Принят/);
    await p.getByRole('button', { name: 'Отменить заказ' }).click();
    await p.getByRole('button', { name: 'Подтвердить отмену' }).click();
    assert.match(await p.locator('.tk-stage').innerText(), /Отменён/);
    await p.locator('.tk-status-line button').click();
    assert.equal(await p.locator('.tk-barista-order').count(), 0);
    await p.getByTestId('demo-return-web4tg').click();
    await p.waitForFunction(() => !location.hash.includes('/demos/'));
    assert.deepEqual(errors, []);
  } finally {
    await ctx.close();
  }
}
async function layout(browser, width, lang) {
  const ctx = await context(browser, width, lang),
    p = await ctx.newPage();
  try {
    await p.goto(demo);
    await screen(p, 'menu');
    await widthOK(p);
    for (const id of [
      'espresso',
      'americano',
      'iced-latte',
      'mocha',
      'latte',
      'flat-white',
      'cappuccino',
    ]) {
      await p.locator('[data-drink="' + id + '"]').click();
      await screen(p, 'builder');
      await widthOK(p);
      const groups = await p.locator('.tk-ingredient').count();
      assert.equal(
        groups,
        { espresso: 3, americano: 4, 'iced-latte': 5 }[id] || 6,
      );
      await p.locator('.tk-brew-next').click();
      await screen(p, 'cup');
      await widthOK(p);
      assert.equal(
        await p
          .locator('.tk-poster-cup img')
          .evaluate(
            (i) =>
              (i.complete && i.naturalWidth > 0) ||
              i.decode().then(() => i.naturalWidth > 0),
          ),
        true,
      );
      await p.goBack();
      await screen(p, 'builder');
      await p.goBack();
      await screen(p, 'menu');
    }
    await bag(p);
    await screen(p, 'bag');
    assert.equal(await p.locator('.tk-empty').count(), 1);
  } finally {
    await ctx.close();
  }
}
(async () => {
  const browser = await browserType.launch();
  try {
    await full(browser);
    console.log(
      engine +
        ' full order, editing, reordering, queue, saved recipes, history and storage passed',
    );
    await Promise.all([
      layout(browser, 320, 'en'),
      layout(browser, 768, 'ru'),
      layout(browser, 1280, 'en'),
    ]);
    console.log(engine + ' all seven recipes at 320/768/1280 px passed');
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
