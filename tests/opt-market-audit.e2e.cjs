// Independent behavioral and accessibility regression checks for the wholesale demo.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const axe = require('axe-core');

const base = (process.env.OPT_TEST_URL || 'http://127.0.0.1:53742/').replace(/\/$/, '');
const url = `${base}/#/demos/opt-market/app`;
const engine = process.env.OPT_ENGINE === 'webkit' ? webkit : chromium;
const accessibilityProblems = [];

async function audit(page, screen) {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const result = await page.evaluate(() => window.axe.run({ include: [['.opt-store'], ['.opt-portal']] }, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  }));
  const serious = result.violations.filter(v => ['critical', 'serious'].includes(v.impact));
  accessibilityProblems.push(...serious.map(v => ({ screen, id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) })));
}

async function assertReachableAboveNav(page, locator, description) {
  await locator.scrollIntoViewIfNeeded();
  const button = await locator.boundingBox();
  const nav = await page.locator('.opt-nav').boundingBox();
  assert(button && nav && button.y >= 0 && button.y + button.height <= nav.y, `${description} must be visible and not covered by the bottom navigation: ${JSON.stringify({ button, nav })}`);
}

async function main() {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('opt-market').waitFor();
    await audit(page, 'home');

    await page.getByRole('button', { name: 'Выбрать товары', exact: true }).click();
    await page.waitForFunction(() => document.activeElement === document.querySelector('.opt-main h1'));
    await page.getByRole('button', { name: 'Бакалея', exact: true }).click();
    assert.equal(await page.locator('.opt-product-card').count(), 4, 'category limits the catalog');
    const search = page.getByRole('searchbox', { name: 'Поиск товара' });
    await search.fill('несуществующий товар');
    await page.getByRole('heading', { name: 'Ничего не нашли' }).waitFor();
    await page.getByRole('button', { name: 'Показать все товары' }).click();
    assert.equal(await page.locator('.opt-product-card').count(), 12, 'reset restores categories and search');
    await audit(page, 'catalog');
    const lastProduct = page.getByRole('button', { name: 'Открыть товар: Lotus Biscoff' });
    await lastProduct.scrollIntoViewIfNeeded();
    await lastProduct.evaluate(el => { const root = document.querySelector('#root'); root.scrollTop += el.getBoundingClientRect().top - 120; });
    const savedScroll = await page.locator('#root').evaluate(el => el.scrollTop);
    assert(savedScroll > 0, 'the catalog must scroll on a narrow viewport');
    await lastProduct.click();
    await page.getByRole('heading', { name: 'Lotus Biscoff' }).waitFor();
    await page.waitForFunction(() => document.activeElement === document.querySelector('.opt-main h1'));
    await page.goBack();
    await page.getByRole('searchbox', { name: 'Поиск товара' }).waitFor();
    // Late-loading card media may shift the restored position slightly.
    await page.waitForFunction(() => Math.abs(document.querySelector('#root').scrollTop - history.state.__opt.scrollTop) < 20);
    await page.getByRole('button', { name: 'Открыть товар: Lavazza Qualità Oro' }).click();
    await page.getByRole('heading', { name: 'Lavazza Qualità Oro' }).waitFor();
    assert.equal(await page.locator('.opt-detail-image img').evaluate(img => getComputedStyle(img).objectFit), 'contain', 'the full product image must fit within the product view');
    if (process.env.OPT_SCREENSHOT) await page.screenshot({ path: process.env.OPT_SCREENSHOT });
    await assertReachableAboveNav(page, page.getByRole('button', { name: 'Добавить коробку' }), 'product action');
    await audit(page, 'product');
    await page.goBack();
    await page.getByRole('searchbox', { name: 'Поиск товара' }).waitFor();

    // A low-value carton cannot reach checkout; increasing quantity updates the total.
    await page.getByRole('button', { name: 'Добавить коробку: Barilla Penne Rigate' }).click();
    await page.locator('.opt-nav').getByRole('button', { name: /^Заказ,/ }).click();
    await page.getByText('Минимальный заказ', { exact: false }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Оформить заказ' }).isDisabled(), true);
    await page.getByRole('button', { name: 'Увеличить количество: Barilla Penne Rigate' }).click();
    assert.equal(await page.getByRole('button', { name: 'Оформить заказ' }).isDisabled(), true);
    await page.getByRole('button', { name: 'Увеличить количество: Barilla Penne Rigate' }).click();
    assert.equal(await page.getByRole('button', { name: 'Оформить заказ' }).isEnabled(), true);
    await audit(page, 'cart');
    await page.getByRole('button', { name: 'Оформить заказ' }).click();
    await audit(page, 'checkout');
    await assertReachableAboveNav(page, page.getByRole('button', { name: 'Создать демо-заказ' }), 'checkout action');
    await page.getByRole('button', { name: 'Создать демо-заказ' }).click();
    assert.equal(await page.locator('input[aria-invalid=true]').count(), 2);
    await page.waitForFunction(() => document.activeElement === document.querySelector('input[aria-invalid=true]'));
    await audit(page, 'validation errors');
    await page.getByPlaceholder('Как к вам обращаться').fill('Тестовый покупатель');
    await page.getByPlaceholder('+7 999 000-00-00').fill('+7 999 123-45-67');
    await page.getByRole('radio', { name: 'Самовывоз' }).check();
    await page.getByRole('button', { name: 'Создать демо-заказ' }).click();
    await page.getByRole('heading', { name: 'Заказ собран.' }).waitFor();
    await audit(page, 'order confirmation');
    const saved = await page.evaluate(() => localStorage.getItem('web4tg-opt-market-demo-v1'));
    assert(!saved.includes('Тестовый покупатель') && !saved.includes('9991234567') && !saved.includes('999 123-45-67'), 'contact data must not be stored');
    const parsed = JSON.parse(saved);
    assert.equal(parsed.orders[0].lines[0].qty, 3, 'ordered quantity persists');
    assert.equal(parsed.cart.length, 0, 'cart clears after checkout');
    await page.getByRole('button', { name: 'Посмотреть историю' }).click();
    await audit(page, 'order history');
    await page.getByRole('button', { name: 'Добавить заказ в корзину' }).click();
    await page.reload();
    await page.locator('.opt-nav').getByRole('button', { name: /^Заказ,/ }).click();
    await page.getByText('Barilla Penne Rigate', { exact: true }).waitFor();
    await page.locator('.opt-nav').getByRole('button', { name: 'Профиль' }).click();
    await page.getByRole('heading', { name: 'Для вашего бизнеса.' }).waitFor();
    await audit(page, 'profile');
    assert.deepEqual(pageErrors, [], 'uncaught page errors');
    assert.deepEqual(accessibilityProblems, [], 'axe serious/critical accessibility violations');
    console.log(`${engine.name()}: filtering, minimum order, quantities, privacy, persistence and accessibility passed`);
  } finally {
    await context.close();
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
