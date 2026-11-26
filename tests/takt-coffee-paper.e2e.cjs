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
async function verifyMotion(page) {
  const rails = [
    ['.tk-campaign', '.coffee-hero-track', '.tk-neighbour.is-next'],
    [
      '.coffee-signatures',
      '.coffee-signature-track',
      '.coffee-rail-arrows button:last-child',
    ],
    [
      '.coffee-arrivals',
      '.coffee-arc-track',
      '.coffee-rail-arrows button:last-child',
    ],
  ];
  for (const reduced of [false, true]) {
    await page.emulateMedia({
      reducedMotion: reduced ? 'reduce' : 'no-preference',
    });
    for (const [section, track, action] of rails) {
      const stage = page.locator(section);
      await stage.scrollIntoViewIfNeeded();
      const positions = await stage.evaluate(
        async (el, { track, action }) => {
          const container = el.querySelector(track);
          const x = () =>
            new DOMMatrixReadOnly(getComputedStyle(container).transform).m41;
          const points = [x()];
          el.querySelector(action).click();
          for (let i = 0; i < 28; i++) {
            await new Promise(requestAnimationFrame);
            points.push(x());
          }
          return points;
        },
        { track, action },
      );
      const end = positions.at(-1);
      assert.ok(
        Math.abs(end - positions[0]) > 24,
        section + ' changes the actual visible position',
      );
      assert.ok(
        positions.slice(-3).every((x) => Math.abs(x - end) < 1),
        section + ' settles in 28 frames',
      );
      const steps = new Set(positions.map(Math.round)).size;
      assert.ok(
        reduced ? steps <= 2 : steps >= 3,
        section + ' honours motion preference, positions ' + steps,
      );
    }
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
}
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
    const closeSheet = async () => {
      await p.locator('dialog .tk-sheet-done').click();
      await p.locator('dialog').waitFor({ state: 'detached' });
    };
    await home.locator('.coffee-hero-window[data-ready=true]').waitFor();
    const next = home.locator('.tk-neighbour.is-next'),
      previous = home.locator('.tk-neighbour.is-previous');
    const action = home.locator('.tk-campaign-link');
    const initialY = await action.evaluate((el) => el.offsetTop);
    for (const id of editions) {
      assert.equal(await home.getAttribute('data-featured'), id);
      const photo = home.locator('.tk-hero-cutout');
      const allLoaded = await home
        .locator('img[loading=eager]')
        .evaluateAll((images) =>
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
      const rect = await stage.boundingBox(),
        x = rect.x + rect.width * 0.58,
        y = rect.y + rect.height * 0.48;
      await p.waitForTimeout(280);
      await p.mouse.move(x, y);
      await p.mouse.down();
      await p.mouse.move(x - rect.width * 0.39, y, { steps: 7 });
      await p.mouse.up();
      await p.waitForFunction(
        () =>
          document.querySelector('.tk-campaign')?.dataset.featured ===
          'caramel-frappe',
      );
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
    await tab('home');
    await p.locator('.coffee-signatures').waitFor();
    assert.equal(
      await p.locator('.coffee-edits,.tk-daily,.tk-usual').count(),
      0,
    );
    const shelf = p.locator('.coffee-signature-window[data-ready=true]'),
      arc = p.locator('.coffee-arc-window[data-ready=true]');
    const first = p.locator('.coffee-signature-card').first();
    await first.locator('.coffee-signature-add').click();
    assert.equal(
      await first.locator('.coffee-signature-add b').innerText(),
      '1',
    );
    await shelf.press('ArrowRight');
    await p.locator('.coffee-signature-window[data-first="1"]').waitFor();
    await p
      .locator('.coffee-signature-product[data-drink=raspberry-lime]')
      .click();
    await p.locator('.tk-builder').waitFor();
    await p.goBack();
    await shelf.waitFor();
    assert.equal(await shelf.getAttribute('data-first'), '1');
    const surfaces = await p.evaluate(async () => {
      const imageURL = (el, pseudo) => {
        const background = getComputedStyle(el, pseudo).backgroundImage;
        return background.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
      };
      const urls = [
        imageURL(document.querySelector('.coffee-arc')),
        imageURL(document.querySelector('.coffee-card-wash'), '::before'),
      ];
      return Promise.all(
        urls.map(async (url) => {
          const im = new Image();
          im.src = url;
          await im.decode();
          return [new URL(im.src).pathname, im.naturalWidth];
        }),
      );
    });
    assert.deepEqual(surfaces, [
      ['/takt-coffee/editorial/espresso-marble.webp', 1122],
      ['/takt-coffee/editorial/opal-wash-320.webp', 320],
    ]);
    await arc.press('ArrowRight');
    await p.locator('.coffee-arc-window[data-index="1"]').waitFor();
    await p.locator('.coffee-portions button').last().click();
    assert.equal(await p.locator('.coffee-portions output').innerText(), '2');
    assert.match(await p.locator('.coffee-arc-add').innerText(), /500/);
    await p.locator('.coffee-arc-add').click();
    await p.locator('.coffee-arc-add').click();
    await p.locator('.tk-line').first().waitFor();
    assert.equal(await p.locator('.tk-line').count(), 2);
    assert.match(await p.locator('.tk-total').innerText(), /780/);
    await tab('home');
    assert.equal(await arc.getAttribute('data-index'), '1');
    await p.locator('.tk-home-extras .tk-club-card').click();
    await p.locator('dialog .tk-club-rules').waitFor();
    await closeSheet();
    await arc.press('End');
    await p.locator('.coffee-arc-window[data-index="7"]').waitFor();
    await p.locator('.coffee-arc-title').click();
    await p.locator('.tk-build-title').waitFor();
    assert.match(
      await p.locator('.tk-build-title').innerText(),
      ru ? /каркаде/i : /hibiscus/i,
    );
    if (width === 390) {
      await tab('home');
      await verifyMotion(p);
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
