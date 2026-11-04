const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');

const base = (process.env.FLOWER_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/?$/, '/');
const products = ['peony', 'tulip', 'rose', 'calla', 'hydrangea', 'spring', 'lilac', 'mixed', 'orchid', 'pink-rose', 'anemone', 'sunflower'];
const names = ['Пионовое утро', 'Белый свет', 'Винный вечер', 'Линия света', 'Голубой воздух', 'Солнечный день', 'Сиреневый час', 'Персиковый сад', 'Тихая орхидея', 'Розовый жест', 'Контраст', 'К солнцу'];

async function geometry(page) {
  const value = await page.evaluate(() => {
    const nav = document.querySelector('.fs-nav').getBoundingClientRect();
    const buttons = [...document.querySelectorAll('.fs-nav button')].map(x => x.getBoundingClientRect().toJSON());
    return {width: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth, height: innerHeight, nav: nav.toJSON(), buttons};
  });
  assert.ok(value.width <= value.viewport + 1, `horizontal overflow: ${JSON.stringify(value)}`);
  assert.ok(value.nav.left >= 0 && value.nav.right <= value.viewport && value.nav.top >= 0 && value.nav.bottom <= value.height, 'navigation outside viewport');
  for (const button of value.buttons) assert.ok(button.width >= 44 && button.height >= 44, 'navigation target too small');
}

async function test(browser, width) {
  const context = await browser.newContext({viewport: {width, height: 844}, isMobile: true, hasTouch: true, locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block'});
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript', body:''}));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const nav = name => page.locator('.fs-nav').getByRole('button', {name, exact:true});
  const heading = () => page.locator('.flower-store h1').first();
  const reveal = locator => locator.evaluate(el => { const root = document.getElementById('root'); root.scrollTop += el.getBoundingClientRect().top - 180; });
  try {
    await page.goto(`${base}#/demos/flower-store/app`, {waitUntil:'domcontentloaded'});
    await page.getByTestId('flower-store').waitFor({timeout:30000});
    assert.match(await heading().textContent(), /ЦВЕТЫ/);
    await geometry(page);
    await nav('Каталог').tap();
    assert.equal(await page.locator('.fs-card').count(), 12);

    // Each item exposes three selectable, decodable images in the actual detail UI.
    for (let i = 0; i < products.length; i++) {
      const open = page.getByRole('button', {name:`Открыть букет ${names[i]}`});
      // WebKit's automatic scrolling can miss the nested #root scroller.
      await reveal(open);
      await open.tap();
      await page.waitForFunction(name => document.querySelector('.flower-store h1')?.textContent === name, names[i]);
      assert.equal(await heading().textContent(), names[i]);
      const thumbs = page.locator('.flower-detail__thumbs button');
      assert.equal(await thumbs.count(), 3, names[i]);
      const sources = [];
      for (let frame = 0; frame < 3; frame++) {
        await thumbs.nth(frame).tap();
        const image = page.locator('.flower-detail__image img');
        sources.push(await image.getAttribute('src'));
        assert.ok(await image.evaluate(async img => { try { await img.decode(); return img.naturalWidth > 0; } catch { return false; } }), `${names[i]} image ${frame + 1}`);
      }
      assert.equal(new Set(sources).size, 3, names[i]);
      const digests = [];
      for (const src of sources) {
        const response = await context.request.get(new URL(src, base).href);
        assert.equal(response.status(), 200, src);
        assert.match(response.headers()['content-type'] || '', /image\/webp/, src);
        const bytes = await response.body();
        assert.ok(bytes.length > 1000, `${src} is empty or incomplete`);
        digests.push(createHash('sha256').update(bytes).digest('hex'));
      }
      assert.equal(new Set(digests).size, 3, `${names[i]}: displayed images must be different files`);
      await page.getByRole('button', {name:'Назад', exact:true}).tap();
      assert.equal(await page.locator('.fs-card').count(), 12);
    }

    const search = page.getByRole('searchbox', {name:'Поиск букета'});
    await search.fill('пион');
    assert.equal(await page.locator('.fs-card').count(), 1);
    assert.equal(await page.getByRole('button', {name:'Открыть букет Пионовое утро'}).count(), 1);
    await search.fill('');
    await page.getByRole('button', {name:'В избранное: Пионовое утро'}).tap();
    await nav('Избранное').tap();
    assert.equal(await page.getByRole('button', {name:'Открыть букет Пионовое утро'}).count(), 1);
    await page.getByRole('button', {name:'Открыть букет Пионовое утро'}).tap();
    const size = page.getByRole('button', {name:'L Объёмный'});
    await reveal(size); await size.tap();
    const note = page.getByLabel(/Текст открытки/);
    await reveal(note); await note.fill('С любовью и теплом');
    const add = page.getByRole('button', {name:/Добавить в корзину/});
    await reveal(add); await add.tap();
    assert.match(await page.locator('.fs-cart-item').textContent(), /РАЗМЕР L/);
    assert.match(await page.locator('.fs-cart-item').textContent(), /С любовью и теплом/);
    assert.match(await page.locator('.fs-cart-total').textContent(), /11\s?100/);
    await page.reload({waitUntil:'domcontentloaded'});
    await page.getByTestId('flower-store').waitFor();
    await page.locator('.fs-nav').getByRole('button', {name:/Корзина/}).tap();
    assert.match(await page.locator('.fs-cart-item').textContent(), /С любовью и теплом/);
    await nav('Избранное').tap();
    assert.equal(await page.getByRole('button', {name:'Открыть букет Пионовое утро'}).count(), 1);
    await geometry(page);
    assert.deepEqual(errors, []);
    console.log(`PASS ${browser.browserType().name()} ${width}px catalog, galleries, search, favorites and persistent cart`);
  } finally { await context.close(); }
}

async function history(browser) {
  const context = await browser.newContext({viewport:{width:390,height:844}, reducedMotion:'reduce'});
  const page = await context.newPage();
  try {
    await page.goto(`${base}#/demos/flower-store/app`, {waitUntil:'domcontentloaded'});
    await page.getByTestId('flower-store').waitFor();
    await page.locator('.fs-nav').getByRole('button',{name:'Каталог',exact:true}).click();
    await page.getByRole('button',{name:'Открыть букет Пионовое утро'}).click();
    for (const [direction, screen] of [['back','catalog'],['back','home'],['forward','catalog'],['forward','detail']]) {
      await (direction === 'back' ? page.goBack() : page.goForward());
      await page.waitForFunction(expected => history.state?.flowerView?.screen === expected, screen);
      const expected = screen === 'detail' ? /Пионовое утро/ : screen === 'home' ? /ЦВЕТЫ/ : /НАЙДИТЕ/;
      assert.match(await page.locator('.flower-store h1').first().textContent(), expected);
    }
    console.log(`PASS ${browser.browserType().name()} browser Back and Forward`);
  } finally { await context.close(); }
}

(async () => {
  const engines = process.env.FLOWER_ENGINE === 'webkit' ? [webkit] : process.env.FLOWER_ENGINE === 'chromium' ? [chromium] : [chromium, webkit];
  for (const engine of engines) {
    const browser = await engine.launch({headless:true});
    try { for (const width of [320, 390]) await test(browser, width); await history(browser); }
    finally { await browser.close(); }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
