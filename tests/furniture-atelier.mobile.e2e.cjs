const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:5271/';
const url = new URL('/#/demos/furniture-studio/app', base).href;

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      locale: 'ru-RU',
      serviceWorkers: 'block',
    });
    // Exercise the room decoder under the same restriction on dynamic JavaScript as the hosted app.
    if (['localhost', '127.0.0.1'].includes(new URL(url).hostname)) {
      await context.route('**/*', async (route) => {
        if (route.request().resourceType() !== 'document') return route.continue();
        const res = await route.fetch();
        return route.fulfill({
          response: res,
          headers: {
            ...res.headers(),
            'content-security-policy':
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data: blob:; connect-src 'self' blob: ws: wss:; worker-src 'self' blob:",
          },
        });
      });
    }
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(url);
    await page.locator('.fhome-cover h1').waitFor();
    const button = (name) => page.getByRole('button', { name, exact: true });
    await button('Все модели').click();
    assert.equal(await page.locator('.fs-grid .fs-card-open').count(), 30);
    await page.locator('#fs-search').fill('диван 200');
    assert.match(await page.locator('.fs-grid').innerText(), /Ribe/);
    await page.locator('#fs-search').fill('круглый стол');
    assert.match(await page.locator('.fs-grid').innerText(), /Ian/);
    await page.locator('#fs-search').fill('');
    await page.locator('.fs-grid .fs-card-open').first().click();
    await button('Увеличить фотографию').click();
    await page.locator('.fs-zoom-dialog').waitFor();
    await page.goBack();
    await page.locator('.fs-zoom-dialog').waitFor({ state: 'detached' });
    assert.equal(await page.locator('.fs-store').getAttribute('data-screen'), 'product');
    assert.equal(await page.locator('.fs-nav').isVisible(), false);
    await button('Добавить в подборку').click();
    await page.locator('.fs-sheet').waitFor();
    await page.getByRole('button', { name: /ОФОРМИТЬ ДЕМО-ЗАКАЗ/i }).click();
    const finish = page.getByRole('button', { name: /ЗАВЕРШИТЬ ДЕМО-ЗАКАЗ/i });
    await finish.scrollIntoViewIfNeeded();
    const hit = await finish.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    });
    assert(hit);
    await finish.tap();
    await page.locator('[data-screen="success"]').waitFor();
    await page.getByRole('button', { name: 'Главная', exact: true }).click();
    await page.getByRole('button', { name: /Компактная студия/ }).click();
    await page.locator('canvas.measured-plan').waitFor();
    const plan = () => page.evaluate(() => JSON.parse(localStorage.getItem('web4tg-room-draft:studio')));
    await page.waitForFunction(() => !!localStorage.getItem('web4tg-room-draft:studio'));
    const original = await plan();
    assert.equal(original.items.length, 5);
    await button('Сохранить вариант').click();
    await page.waitForFunction(() =>
      Object.keys(localStorage).some((k) => k.startsWith('web4tg-furniture-project:'))
    );
    const shared = await page.getByRole('link', { name: 'Обсудить расстановку' }).getAttribute('href');
    const link = new URL(shared).searchParams.get('text').split('\n').at(-1);
    const second = await browser.newContext({
      viewport: { width: 390, height: 844 },
      locale: 'ru-RU',
      serviceWorkers: 'block',
    });
    const copy = await second.newPage();
    await copy.goto(link);
    await copy.locator('.measured-plan').waitFor();
    const ids = await copy.locator('.fpl-items button').allTextContents();
    assert.equal(ids.length, 5);
    await copy.getByRole('button', { name: 'Скачать план' }).scrollIntoViewIfNeeded();
    const download = copy.waitForEvent('download');
    await copy.getByRole('button', { name: 'Скачать план' }).click();
    assert.equal((await download).suggestedFilename(), 'WEB4TG-floor-plan.png');
    await second.close();
    await button('Интерьер').click();
    await page.waitForFunction(
      () =>
        document.querySelector('.fpl-stage canvas:not(.measured-plan)') &&
        !document.querySelector('.fpl-unavailable') &&
        !Array.from(document.querySelectorAll('.fpl-status')).some((e) =>
          e.textContent.includes('Загружаем и измеряем')
        ),
      {},
      { timeout: 45000 }
    );
    await button('День').click();
    await button('Вечер').waitFor();
    await button('Вид сверху').click();
    await button('Запомнить вариант A').click();
    await page.locator('#fpl-product').selectOption('rivet-adrienne-chair');
    await button('Заменить выбранный предмет').click();
    assert.match(await page.locator('.fpl-items [aria-pressed=true]').innerText(), /Adrienne/);
    await button('Показать вариант A').click();
    assert.match(await page.locator('.fpl-items [aria-pressed=true]').innerText(), /Sloane/);
    await button('Весь комплект в подборку').click();
    await page.locator('.fs-sheet').waitFor();
    assert.equal(await page.locator('.fs-cart-item').count(), 5);
    await page.keyboard.press('Escape');
    await page.locator('.fs-sheet').waitFor({ state: 'detached' });
    if (await page.locator('.fpl').isVisible()) await button('Закрыть планировщик').click();
    await button('Профиль').click();
    const projects = page.locator('.fs-account-projects');
    await projects.getByRole('button', { name: 'Переименовать' }).click();
    await projects.getByLabel('Название варианта').fill('Тестовый интерьер');
    await projects.getByRole('button', { name: 'Сохранить', exact: true }).click();
    await projects.getByText('Тестовый интерьер', { exact: true }).waitFor();
    await projects.getByRole('button', { name: 'Удалить', exact: true }).click();
    await projects.getByRole('button', { name: 'Восстановить' }).click();
    await projects.getByText('Тестовый интерьер', { exact: true }).waitFor();
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      'PASS catalogue, search, modal history, touch checkout, five-piece room, share, drawing, 3D, lighting and set handoff'
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
