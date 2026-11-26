const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const engine = process.env.COFFEE_ENGINE === 'webkit' ? webkit : chromium;
const base = process.env.COFFEE_TEST_URL || 'http://127.0.0.1:5271';
const url = new URL('/#/demos/takt-coffee/app', base).href;
const editions = [
  'cherry-mocha',
  'caramel-frappe',
  'peach-tea',
  'yuzu-lemonade',
  'orange-bumble',
  'raspberry-lime',
  'pistachio-latte',
  'passion-mango',
  'espresso-tonic',
  'cucumber-elderflower',
  'hibiscus-berry',
];
async function check(browser, width, lang) {
  const ru = lang === 'ru',
    mobile = width < 700;
  const ctx = await browser.newContext({
    viewport: { width, height: width === 320 ? 640 : 844 },
    hasTouch: mobile,
    isMobile: mobile,
    locale: ru ? 'ru-RU' : 'en-GB',
    serviceWorkers: 'block',
  });
  try {
    await ctx.addInitScript(
      (l) => localStorage.setItem('app-language', l),
      lang,
    );
    await ctx.route('https://telegram.org/js/telegram-web-app.js', (r) =>
      r.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    const p = await ctx.newPage(),
      errors = [],
      assetErrors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('response', (res) => {
      if (res.status() >= 400 && res.url().includes('/takt-coffee/'))
        assetErrors.push(res.url());
    });
    await p.goto(url);
    const home = p.locator('.tk-campaign'),
      nav = p.locator('.mf-nav.tk-dock');
    const tab = (id) => nav.locator('[data-tab=' + id + ']').click();
    const closeSheet = () => p.locator('dialog .tk-sheet-done').click();
    await home.waitFor();
    const next = home.locator('.tk-neighbour.is-next'),
      previous = home.locator('.tk-neighbour.is-previous');
    const action = home.locator('.tk-campaign-link');
    const initialY = await action.evaluate((el) => el.offsetTop);
    for (const id of editions) {
      assert.equal(await home.getAttribute('data-featured'), id);
      const photo = home.locator('.tk-hero-cutout');
      const allLoaded = await home.locator('img').evaluateAll((images) =>
        Promise.all(
          images.map(async (img) => {
            await img.decode();
            return (
              img.naturalWidth > 0 &&
              getComputedStyle(img).objectFit === 'contain'
            );
          }),
        ),
      );
      assert.ok(
        allLoaded.every(Boolean),
        'hero and both miniatures keep their natural proportions for ' + id,
      );
      assert.ok(await photo.isVisible());
      assert.ok(
        Math.abs((await action.evaluate((el) => el.offsetTop)) - initialY) <= 1,
        'carousel action moved on ' + id + ' at ' + width,
      );
      await next.click();
    }
    assert.equal(await home.getAttribute('data-featured'), editions[0]);
    await previous.click();
    assert.equal(await home.getAttribute('data-featured'), editions.at(-1));
    await next.click();
    if (mobile) {
      const stage = home.locator('.tk-campaign-stage');
      await stage.evaluate((el) => {
        function touch(type, x) {
          const point = { identifier: 1, target: el, clientX: x, clientY: 160 };
          const event = new Event(type, { bubbles: true });
          Object.assign(event, {
            touches: type === 'touchstart' ? [point] : [],
            changedTouches: [point],
          });
          el.dispatchEvent(event);
        }
        touch('touchstart', 200);
        touch('touchend', 95);
      });
      assert.equal(await home.getAttribute('data-featured'), 'caramel-frappe');
    }
    await tab('menu');
    await p
      .locator('.tk-category-tabs')
      .getByRole('button', { name: ru ? 'Лимонады' : 'Lemonades', exact: true })
      .click();
    assert.equal(await p.locator('.tk-card').count(), 4);
    await p.getByRole('searchbox').fill(ru ? 'юдзу' : 'yuzu');
    assert.equal(await p.locator('.tk-card').count(), 1);
    await p.locator('[data-drink=yuzu-lemonade]').click();
    const groups = p.locator('.tk-ingredient');
    assert.deepEqual(
      (
        await groups.evaluateAll((items) => items.map((el) => el.dataset.group))
      ).sort(),
      ['garnish', 'ice', 'sugar', 'water'],
    );
    assert.equal(await p.locator('.tk-builder canvas').count(), 0);
    for (const [g, v] of [
      ['water', 'still'],
      ['garnish', 'mint'],
      ['ice', 'no-ice'],
    ]) {
      await p.locator('.tk-ingredient[data-group=' + g + ']').click();
      await p.locator('dialog [data-value=' + v + ']').click();
      assert.equal(
        await p
          .locator('dialog [data-value=' + v + ']')
          .getAttribute('aria-pressed'),
        'true',
      );
      await closeSheet();
      assert.ok(
        await p
          .locator(
            '.tk-ingredient[data-group=' + g + '] .tk-changed-ingredient',
          )
          .isVisible(),
      );
    }
    await p.locator('.tk-size-trigger').click();
    await p.locator('.tk-size button').last().click();
    await closeSheet();
    assert.match(await p.locator('.tk-brew-next').innerText(), /280/);
    await p.locator('.tk-brew-next').click();
    await p.locator('.tk-poster-cup img[data-cup=yuzu-lemonade]').waitFor();
    await p.locator('.tk-finish-detail').click();
    const slip = await p.locator('.tk-order-slip').innerText();
    assert.match(slip, /450/);
    assert.match(slip, ru ? /Без газа/ : /Still/);
    assert.match(slip, ru ? /Свежая мята/ : /Fresh mint/);
    await p.goBack();
    await p.locator('.tk-buy').click();
    await p.reload();
    await p.locator('.tk-line').waitFor();
    assert.match(await p.locator('.tk-total').innerText(), /280/);
    await p.locator('.tk-line-title').click();
    await p.locator('.tk-ingredient[data-group=water]').click();
    assert.equal(
      await p.locator('[data-value=still]').getAttribute('aria-pressed'),
      'true',
    );
    await closeSheet();
    await tab('bag');
    await p.locator('.tk-action').click();
    await p.locator('.tk-action').click();
    await p.locator('.tk-ticket').waitFor();
    assert.match(
      await p.locator('.tk-ticket').innerText(),
      ru ? /Лимонад юдзу/ : /Yuzu lemonade/,
    );
    assert.match(await p.locator('.tk-ticket').innerText(), /280/);
    if (lang === 'en' && width === 390) {
      await tab('home');
      await p.getByRole('button', { name: 'After lunch', exact: true }).click();
      await p.getByRole('button', { name: 'Add pairing to bag' }).click();
      assert.equal(await p.locator('.tk-line').count(), 2);
      assert.match(await p.locator('.tk-total').innerText(), /265 KGS/);
      await tab('home');
      await p
        .getByRole('button', { name: 'Morning duet', exact: true })
        .click();
      await p.getByRole('button', { name: 'Add pairing to bag' }).click();
      assert.equal(await p.locator('.tk-line').count(), 4);
      assert.match(await p.locator('.tk-total').innerText(), /640 KGS/);
      await tab('home');
      for (const [label, id] of [
        ['Berry', 'cherry-mocha'],
        ['Nutty', 'cappuccino'],
        ['Chocolate', 'chocolate-cookie'],
      ]) {
        await p
          .locator('.coffee-tastes')
          .getByRole('button', { name: label })
          .click();
        await p.locator('.tk-card[data-drink=' + id + ']').waitFor();
        assert.ok(await p.getByRole('searchbox').inputValue());
        await tab('home');
      }
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(assetErrors, []);
    console.log(
      'PASS ' +
        width +
        ' ' +
        lang +
        ' all editions, photos, lemonade choices, restored bag and pickup',
    );
  } finally {
    await ctx.close();
  }
}
(async () => {
  const browser = await engine.launch();
  try {
    await check(browser, 320, 'ru');
    await check(browser, 390, 'en');
    await check(browser, 1280, 'ru');
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
