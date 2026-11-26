const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://127.0.0.1:41755/';
const products = [
  { name: 'Adrienne', id: 'B07QGSZ38G' },
  { name: 'Scutari', id: 'B07QZ21DDV' },
  { name: 'Ribe', id: 'B07VNL95FP' },
  { name: 'Morat', id: 'B07VNL9S77' },
  { name: 'Round Coffee Table', id: 'B07GDSF3MR' },
  { name: 'Frankie', id: 'frankie-gray', photos: 6 },
];
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript(() => { localStorage.setItem('app-language', 'ru'); localStorage.removeItem('web4tg-furniture-store-v1'); });
  try {
    await page.goto(new URL('/#/demos/furniture-studio/app', base).href, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Каталог', exact: true }).tap();
    for (const product of products) {
      await page.getByLabel('Поиск по коллекции').fill(product.name);
      const card = page.locator('.fs-catalog').getByRole('button', { name: `Открыть ${product.name}`, exact: true });
      assert.equal(await card.count(), 1, `product ${product.name}`);
      await card.tap();
      await page.locator('.fs-product-info').waitFor();
      const count = product.photos || 4;
      assert.equal(await page.locator('.fs-gallery-thumbs button').count(), count, `${count} source photos ${product.name}`);
      const photos = await page.locator('.fs-gallery-thumbs img').evaluateAll(images => Promise.all(images.map(image => new Promise(resolve => { const candidate = new Image(); candidate.onload = () => resolve(candidate.naturalWidth > 0); candidate.onerror = () => resolve(false); candidate.src = image.getAttribute('src'); }))));
      assert.deepEqual(photos, Array(count).fill(true));
      await page.getByRole('button', { name: '3D-обзор' }).tap();
      await page.locator('.rfv').getByRole('button', { name: 'Увеличить', exact: true }).waitFor({ timeout: 45000 });
      await page.locator('.rfv').getByRole('button', { name: 'Закрыть 3D-обзор' }).tap();
      await page.locator('.rfv').waitFor({ state: 'detached' });
      if (product.name === 'Adrienne') {
        const mobileModel = page.waitForResponse(response => response.url().includes(`${product.id}-lod.glb`) && response.ok());
        await page.getByRole('button', { name: /Посмотреть в комнате/ }).tap();
        await page.getByRole('button', { name: /^Своя комната/ }).tap();
        await page.locator('[data-testid=furniture-planner] .fpl-stage canvas').waitFor({ timeout: 45000 });
        await page.getByRole('button',{name:'Интерьер',exact:true}).tap();
        await mobileModel;
        await page.getByRole('button', { name: 'Закрыть планировщик' }).tap();
        await page.locator('.fs-product-info').waitFor();
      }
      await page.getByRole('button', { name: 'Назад', exact: true }).tap();
      await page.locator('.fs-catalog').waitFor();
      console.log(`PASS ${product.name}: ${count} photos and real 3D`);
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
