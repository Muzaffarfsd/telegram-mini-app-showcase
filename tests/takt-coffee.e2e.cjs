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
const tab = (p, id) => p.locator('.tk-dock [data-tab="' + id + '"]').click();
const bag = (p) => tab(p, 'bag');
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
    const card = p.getByTestId('card-app-takt-coffee');
    assert.doesNotMatch(await card.innerText(), /\bTAKT\b|ТАКТ/i);
    await card.click();
    await screen(p, 'home');
    await widthOK(p);
    await audit(p);
    assert.equal(await p.locator('.tk-dock button').count(), 5);
    assert.equal(await p.locator('.tk-catalogue').count(), 0);
    assert.equal(
      await p.locator('#tk-campaign-name').innerText(),
      'Вишнёвая мокка',
    );
    const firstAction = await p.locator('.tk-campaign-link').boundingBox();
    await p.locator('.tk-neighbour.is-next').click();
    assert.ok(
      Math.abs(
        (await p.locator('.tk-campaign-link').boundingBox()).y - firstAction.y,
      ) <= 1,
      'the campaign action stays in place when changing drinks',
    );
    assert.equal(
      await p.locator('#tk-campaign-name').innerText(),
      'Карамельный фраппе',
    );
    await p.locator('.tk-edition-pages button').last().click();
    await p.locator('.tk-feature-detail').click();
    await screen(p, 'builder');
    assert.equal(await p.locator('[data-group=beans]').count(), 0);
    await p.goBack();
    await screen(p, 'home');
    await p
      .getByRole('heading', { name: 'Персиковый чай', exact: true })
      .waitFor();
    await p.locator('.tk-edition-pages button').first().click();
    await p.locator('.tk-feature-detail').click();
    await screen(p, 'builder');
    await p.getByRole('button', { name: 'О напитке' }).click();
    assert.match(await p.locator('dialog').innerText(), /Вишнёвое пюре/);
    await p.locator('.tk-sheet-done').click();
    await p.locator('.tk-brew-next').click();
    assert.match(await p.locator('.tk-poster-title').innerText(), /со льдом/i);
    await tab(p, 'home');
    await p.locator('.tk-campaign-link').click();
    await screen(p, 'menu');
    await audit(p);
    assert.ok(
      await p.locator('.tk-product-image').evaluateAll((frames) =>
        frames.every((frame) => {
          const card = frame.getBoundingClientRect(),
            photo = frame.querySelector('img').getBoundingClientRect();
          return (
            photo.top >= card.top &&
            photo.bottom <= card.bottom + 1 &&
            photo.left >= card.left &&
            photo.right <= card.right + 1
          );
        }),
      ),
      'drink photographs fit inside their shelves without cropping',
    );
    const closeSheet = async () => {
      await p.locator('dialog .tk-sheet-done').click();
      await p.locator('dialog').waitFor({ state: 'detached' });
    };
    assert.equal(await p.locator('.tk-card').count(), 15);
    const categories = p.locator('.tk-category-tabs');
    await categories
      .getByRole('button', { name: 'Выпечка', exact: true })
      .click();
    assert.equal(await p.locator('.tk-card').count(), 2);
    const cookie = p.locator(
      '.tk-menu-product:has([data-drink=chocolate-cookie])',
    );
    await cookie.locator('.tk-quick-add').click();
    await screen(p, 'menu');
    assert.match(await p.locator('.tk-added-status').innerText(), /печенье/);
    await p.locator('.tk-added-status button').click();
    await screen(p, 'bag');
    await p.locator('.tk-line-title').click();
    await screen(p, 'bakery');
    assert.match(await p.locator('.tk-bakery-info').innerText(), /80 г/);
    await p.locator('.tk-bakery-info button').click();
    assert.equal(await p.locator('.tk-qty output').innerText(), '1');
    await p.getByRole('button', { name: 'Удалить выпечку' }).click();
    await tab(p, 'menu');
    assert.equal(
      await categories
        .getByRole('button', { name: 'Выпечка', exact: true })
        .getAttribute('aria-pressed'),
      'true',
    );
    await categories
      .getByRole('button', { name: 'Чёрный', exact: true })
      .click();
    assert.equal(await p.locator('.tk-card').count(), 3);
    await categories
      .getByRole('button', { name: 'Со льдом', exact: true })
      .click();
    assert.equal(await p.locator('.tk-card').count(), 5);
    await categories
      .getByRole('button', { name: 'Без кофе', exact: true })
      .click();
    assert.equal(await p.locator('.tk-card').count(), 3);
    const search = p.getByRole('searchbox');
    await search.fill('матча');
    assert.equal(await p.locator('.tk-card').count(), 1);
    await p.locator('.tk-card').click();
    await screen(p, 'builder');
    assert.equal(await p.locator('[data-group=beans]').count(), 0);
    await p.goBack();
    assert.equal(await search.inputValue(), 'матча');
    await search.fill('нет такого вкуса');
    await p.getByRole('button', { name: 'Показать всё меню' }).click();
    await search.fill('апельсин');
    assert.equal(
      await p.locator('.tk-card').getAttribute('data-drink'),
      'cold-brew',
    );
    await p.getByRole('button', { name: 'Очистить поиск' }).click();
    await p.locator('.tk-filter-trigger').click();
    await audit(p);
    await p.getByRole('button', { name: 'Сначала дешевле' }).click();
    await closeSheet();
    assert.equal(
      await p.locator('.tk-card').first().getAttribute('data-drink'),
      'espresso',
    );
    await p
      .locator('.tk-menu-product:has([data-drink=cocoa]) .tk-product-save')
      .click();
    await tab(p, 'profile');
    await screen(p, 'profile');
    await audit(p);
    await p.locator('.tk-guest-name').click();
    await p.locator('.tk-name-form input').fill('Айдана');
    await p.locator('.tk-name-form button').click();
    await p.locator('dialog').waitFor({ state: 'detached' });
    await p
      .locator('.tk-account-links')
      .getByRole('button', { name: /Мои рецепты/ })
      .click();
    await p.getByRole('button', { name: /Какао.*210 сом/ }).waitFor();
    await p.getByRole('button', { name: 'Удалить из рецептов' }).click();
    await tab(p, 'menu');
    assert.equal(await p.locator('.tk-bar-select').count(), 0);
    assert.doesNotMatch(
      await p.locator('.tk-app').innerText(),
      /TAKT|ТАКТ|У парка/i,
    );
    await p.locator('.tk-card[data-drink=cappuccino]').click();
    await screen(p, 'builder');
    await widthOK(p);
    await audit(p);
    assert.equal(
      await p.locator('.coffee-ingredients [data-group]').count(),
      7,
    );
    await p.locator('.coffee-stage .brew-preview[data-renderer]').waitFor();
    for (const [group, value] of [
      ['milk', 'oat'],
      ['beans', 'fruit'],
      ['shot', 'extra'],
      ['syrup', 'vanilla'],
      ['foam', 'cloud'],
      ['latteArt', 'rosetta'],
      ['sugar', 'one'],
    ]) {
      await p.locator('[data-group=' + group + ']').click();
      await p
        .locator('.coffee-options button[data-value=' + value + ']')
        .click();
      assert.equal(
        await p
          .locator('.coffee-options [data-value=' + value + ']')
          .getAttribute('aria-pressed'),
        'true',
      );
    }
    await p.locator('.tk-size-trigger').click();
    await p.locator('.tk-size button').last().click();
    await closeSheet();
    assert.match(await p.locator('.tk-brew-next').innerText(), /370/);
    await p.locator('.tk-brew-next').click();
    await screen(p, 'cup');
    await widthOK(p);
    const portrait = await p.locator('.tk-poster-cup').boundingBox();
    assert.ok(
      portrait.height >= 355,
      'the finished cup occupies the main part of the mobile poster',
    );
    assert.match(
      await p
        .locator('.tk-poster-title span')
        .first()
        .evaluate((el) => getComputedStyle(el).fontFamily),
      /Stengazeta/,
    );
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
    assert.doesNotMatch(
      await p.locator('.tk-ticket').innerText(),
      /У парка|TAKT|ТАКТ/i,
    );
    assert.match(await p.locator('.tk-ticket').innerText(), /Айдана/);
    assert.match(await p.locator('.tk-total').innerText(), /670/);
    await p.goBack();
    await screen(p, 'pickup');
    assert.equal(await p.locator('.tk-times').count(), 0);
    await p.goForward();
    await screen(p, 'receipt');
    const other = await ctx.newPage();
    await other.goto(demo);
    await screen(other, 'home');
    assert.match(await other.locator('.tk-live-order').innerText(), /Принят/);
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
    await tab(p, 'profile');
    await p
      .locator('.tk-account-links')
      .getByRole('button', { name: /Мои рецепты/ })
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
    await screen(p, 'home');
    await tab(p, 'menu');
    await screen(p, 'menu');
    await widthOK(p);
    for (const id of [
      'peach-tea',
      'cherry-mocha',
      'caramel-frappe',
      'espresso',
      'cold-brew',
      'matcha-latte',
      'cocoa',
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
      const groups = await p
        .locator('.coffee-ingredients [data-group]')
        .count();
      assert.equal(
        groups,
        {
          espresso: 3,
          americano: 4,
          'iced-latte': 6,
          'peach-tea': 3,
          'cherry-mocha': 6,
          'caramel-frappe': 6,
          'cold-brew': 3,
          'matcha-latte': 5,
          cocoa: 5,
        }[id] || 7,
      );
      await p.locator('.tk-brew-next').click();
      await screen(p, 'cup');
      await widthOK(p);
      const finalCup = p.locator('.tk-poster-cup .brew-preview[data-renderer]');
      await finalCup.waitFor();
      assert.ok(
        (await finalCup.getAttribute('data-recipe')).startsWith(id + '/'),
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
async function mixedOrder(browser) {
  const ctx = await context(browser, 390, 'en'),
    p = await ctx.newPage();
  try {
    await p.goto(demo);
    await p
      .getByRole('button', { name: 'Explore the menu', exact: true })
      .click();
    await p.locator('.tk-card[data-drink=almond-croissant]').click();
    await screen(p, 'bakery');
    await p
      .getByText('Wheat, milk, eggs and almonds.', { exact: true })
      .waitFor();
    await p.getByRole('button', { name: 'Add to bag', exact: true }).click();
    await tab(p, 'menu');
    await p
      .locator('.tk-menu-product:has([data-drink=peach-tea]) .tk-quick-add')
      .click();
    await tab(p, 'bag');
    assert.equal(await p.locator('.tk-line').count(), 2);
    assert.match(await p.locator('.tk-total').textContent(), /365 KGS/);
    await p.locator('.tk-action').click();
    await p.locator('.tk-action').click();
    await screen(p, 'receipt');
    await p.getByText(/1 × Almond croissant/).waitFor();
    await p.getByText(/1 × Peach iced tea/).waitFor();
    await p.reload();
    await screen(p, 'receipt');
    await p.locator('.tk-status-line button').click();
    await p.getByText(/1 × Almond croissant/).waitFor();
    for (let i = 0; i < 3; i++)
      await p.locator('.tk-barista-order .tk-action').click();
    await tab(p, 'profile');
    await p.getByText(/Stamps · 1 \/ 5/).waitFor();
    await tab(p, 'home');
    await p.getByRole('button', { name: /Order again/ }).click();
    assert.equal(await p.locator('.tk-line').count(), 2);
    assert.match(await p.locator('.tk-total').textContent(), /365 KGS/);
  } finally {
    await ctx.close();
  }
}
async function rewardsAndDock(browser) {
  const ctx = await context(browser, 320, 'ru');
  try {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: 320, height: 640 });
    await p.goto(demo);
    await screen(p, 'home');
    const nav = p.locator('.tk-dock');
    const inside = async (locator) =>
      locator.evaluate((el) => {
        const b = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2),
        );
      });
    assert.ok(await inside(p.locator('.tk-campaign-link')));
    for (const t of ['home', 'menu', 'bag', 'profile'])
      assert.ok(await inside(nav.locator('[data-tab=' + t + ']')));
    await p.locator('.tk-pick').first().click();
    assert.ok(
      await inside(p.locator('.tk-brew-next')),
      'builder CTA clears tabs on a short phone',
    );
    await p.locator('.tk-brew-next').click();
    assert.ok(await inside(p.locator('.tk-buy')));
    await p.locator('.tk-buy').click();
    for (let i = 1; i < 5; i++)
      await p.getByRole('button', { name: 'Увеличить количество' }).click();
    assert.equal(await nav.locator('.mf-nav-bag i').innerText(), '5');
    await p.locator('.tk-action').click();
    await p.locator('.tk-action').click();
    await p.locator('.tk-status-line button').click();
    for (let i = 0; i < 3; i++)
      await p.locator('.tk-barista-order .tk-action').click();
    await tab(p, 'profile');
    assert.match(
      await p.locator('.tk-club-card>strong').innerText(),
      /бонусов · 1/,
    );
    await p.locator('.tk-club-card').click();
    await p.locator('dialog .tk-sheet-done').click();
    await tab(p, 'menu');
    await p.locator('[data-drink=espresso]').click();
    await p.locator('.tk-brew-next').click();
    await p.locator('.tk-buy').click();
    await p.locator('.tk-action').click();
    await p.locator('.tk-redeem input').check();
    assert.match(await p.locator('.tk-total strong').innerText(), /^0 сом$/);
    await p.locator('.tk-action').click();
    await screen(p, 'receipt');
    assert.match(await p.locator('.tk-ticket-discount').innerText(), /120/);
    assert.match(await p.locator('.tk-total strong').innerText(), /^0 сом$/);
    await tab(p, 'profile');
    assert.match(await p.locator('.tk-club-card>strong').innerText(), /0 \/ 5/);
    await tab(p, 'home');
    await p.locator('.tk-live-order').click();
    await p.getByRole('button', { name: 'Отменить заказ' }).click();
    await p.getByRole('button', { name: 'Подтвердить отмену' }).click();
    await tab(p, 'profile');
    assert.match(
      await p.locator('.tk-club-card>strong').innerText(),
      /бонусов · 1/,
    );
    await p.reload();
    await screen(p, 'profile');
    assert.match(
      await p.locator('.tk-club-card>strong').innerText(),
      /бонусов · 1/,
    );
  } finally {
    await ctx.close();
  }
}
(async () => {
  const browser = await browserType.launch();
  try {
    await full(browser);
    await rewardsAndDock(browser);
    await mixedOrder(browser);
    console.log(
      engine +
        ' full order, editing, reordering, queue, saved recipes, history and storage passed',
    );
    await Promise.all([
      layout(browser, 320, 'en'),
      layout(browser, 768, 'ru'),
      layout(browser, 1280, 'en'),
    ]);
    console.log(engine + ' all thirteen drinks at 320/768/1280 px passed');
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
