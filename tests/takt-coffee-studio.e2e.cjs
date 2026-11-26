const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const sharp = require('sharp');

const base = process.env.COFFEE_TEST_URL || 'http://127.0.0.1:5271';
const url = new URL('/#/demos/takt-coffee/app', base).href;
async function difference(a, b) {
  const pixels = await Promise.all(
    [a, b].map((buffer) =>
      sharp(buffer)
        .resize(120, 90, { fit: 'fill' })
        .removeAlpha()
        .raw()
        .toBuffer(),
    ),
  );
  let changed = 0;
  for (let i = 0; i < pixels[0].length; i += 3) {
    if (
      Math.max(
        ...[0, 1, 2].map((k) => Math.abs(pixels[0][i + k] - pixels[1][i + k])),
      ) > 8
    )
      changed++;
  }
  return changed / (120 * 90);
}
async function check(browser, software) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    serviceWorkers: 'block',
  });
  try {
    await context.route(
      'https://telegram.org/js/telegram-web-app.js',
      (route) =>
        route.fulfill({ contentType: 'application/javascript', body: '' }),
    );
    await context.addInitScript((noGL) => {
      localStorage.setItem('app-language', 'en');
      if (noGL) {
        const get = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...args) {
          return type === 'webgl2' ? null : get.call(this, type, ...args);
        };
      }
    }, software);
    const p = await context.newPage(),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.goto(url);
    const nav = p.locator('.mf-nav.tk-dock');
    const tab = (id) => nav.locator('[data-tab=' + id + ']').click();
    assert.equal(
      await nav.locator('[aria-current=page]').getAttribute('data-tab'),
      'home',
    );
    await p.getByRole('button', { name: 'After lunch', exact: true }).click();
    await p.getByRole('button', { name: 'Add pairing to bag' }).click();
    assert.equal(await p.locator('.tk-line').count(), 2);
    assert.match(await p.locator('.tk-total').innerText(), /265 KGS/);
    await tab('home');
    await p.getByRole('button', { name: 'Morning duet', exact: true }).click();
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
    await tab('menu');
    await p.getByRole('button', { name: 'Clear search' }).click();
    await p.locator('.tk-card[data-drink=cappuccino]').click();
    const stage = p.locator('.coffee-stage .brew-preview'),
      backend = software ? 'canvas' : 'webgl';
    await p.locator('.brew-preview[data-renderer=' + backend + ']').waitFor();
    await p.evaluate(() => document.fonts.ready);
    const initial = await stage.screenshot();
    await p.clock.install();
    await p.clock.pauseAt(new Date(Date.now() + 800));
    async function choose(group, value) {
      await p.locator('[data-group=' + group + ']').dispatchEvent('click');
      await p
        .locator('.coffee-options [data-value=' + value + ']')
        .dispatchEvent('click');
    }
    for (const [group, value, effect] of [
      ['milk', 'oat', 'milk'],
      ['sugar', 'two', 'sugar'],
      ['syrup', 'caramel', 'syrup'],
      ['syrup', 'cinnamon', 'spice'],
      ['syrup', 'chocolate', 'flakes'],
      ['beans', 'fruit', 'espresso'],
      ['foam', 'cloud', 'foam'],
      ['latteArt', 'rosetta', 'art'],
    ]) {
      const before = await stage.screenshot();
      await choose(group, value);
      await p.clock.runFor(640);
      assert.equal(await stage.getAttribute('data-effect'), effect);
      assert.equal(await stage.getAttribute('data-phase'), 'active');
      const delta = await difference(before, await stage.screenshot());
      assert.ok(
        delta > 0.001,
        effect + ' frame did not change (' + delta + ')',
      );
      await p.clock.runFor(1100);
      assert.equal(await stage.getAttribute('data-phase'), 'settled');
    }
    const final = await stage.screenshot();
    assert.ok(
      (await difference(initial, final)) > 0.018,
      'the final recipe has a different visible surface',
    );
    await choose('sugar', 'one');
    assert.equal(await stage.getAttribute('data-effect'), 'settle');
    await choose('syrup', 'caramel');
    await choose('syrup', 'none');
    await p.clock.runFor(1650);
    assert.equal(await stage.getAttribute('data-phase'), 'settled');
    assert.equal(await stage.getAttribute('data-effect'), 'settle');
    await p.emulateMedia({ reducedMotion: 'reduce' });
    await choose('milk', 'whole');
    assert.equal(await stage.getAttribute('data-phase'), 'settled');
    await p.locator('.tk-brew-next').dispatchEvent('click');
    assert.match(
      await p
        .locator('.tk-poster-cup .brew-preview')
        .getAttribute('data-recipe'),
      /rosetta/,
    );
    await nav.locator('[data-tab=menu]').dispatchEvent('click');
    await p.locator('.tk-card[data-drink=iced-latte]').dispatchEvent('click');
    await p
      .locator(
        '.coffee-stage .brew-preview[data-renderer=' +
          backend +
          '][data-recipe^="iced-latte/"]',
      )
      .waitFor();
    await p.emulateMedia({ reducedMotion: 'no-preference' });
    await p.clock.runFor(35);
    await choose('ice', 'no-ice');
    await p.clock.runFor(600);
    await choose('ice', 'regular');
    await p.clock.runFor(580);
    assert.equal(await stage.getAttribute('data-effect'), 'ice');
    await p.clock.runFor(1200);
    assert.equal(await stage.getAttribute('data-phase'), 'settled');
    assert.deepEqual(errors, []);
    console.log(
      'PASS ' +
        backend +
        ' pour, falling solids, espresso, foam, latte art, ice, rapid changes, reduced motion, flavours and pair checkout',
    );
  } finally {
    await context.close();
  }
}
(async () => {
  const b = await chromium.launch();
  try {
    await check(b, false);
    await check(b, true);
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
