// End-to-end checks for the medical-centre booking demo.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.MEDICAL_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/$/, '');
const engine = process.env.MEDICAL_ENGINE === 'webkit' ? webkit : chromium;

async function run(browser, width, height) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}/#/demos/medical-center/app`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('medical-center').waitFor();
    if (width === 390 && engine === chromium) await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
    async function checkContrast() {
      if (width !== 390 || engine !== chromium) return;
      const violations = await page.evaluate(async () => (await window.axe.run('.medical-booking', { runOnly: { type: 'rule', values: ['color-contrast'] } })).violations.map(item => ({ id: item.id, nodes: item.nodes.map(node => ({ target: node.target, message: node.failureSummary })) })));
      assert.deepEqual(violations, [], 'booking text meets contrast requirements');
    }
    await page.evaluate(() => localStorage.removeItem('medical-demo-appointments-v1'));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'page has no horizontal overflow');
    await page.locator('.med-hero-action button').click();
    const dialog = page.getByRole('dialog', { name: 'Запись к специалисту' });
    await dialog.waitFor();
    await checkContrast();
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('role')), 'dialog', 'dialog receives focus');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null), true, 'keyboard focus stays in dialog');
    await dialog.locator('.medical-booking__doctor-row').first().click();
    await checkContrast();
    await dialog.locator('.medical-booking__dates button').nth(1).click();
    await dialog.locator('.medical-booking__times button').first().click();
    await dialog.getByRole('button', { name: 'Продолжить' }).click();
    await checkContrast();
    await dialog.getByLabel('Ваше имя').fill('Тестовый пациент');
    await dialog.getByLabel('Телефон').fill('+7 900 555 44 33');
    await dialog.getByRole('button', { name: 'Сохранить демо-запись' }).click();
    await dialog.getByText(/Настоящий приём не забронирован/).waitFor();
    assert.match(await dialog.textContent(), /Настоящий приём не забронирован/);
    const saved = await page.evaluate(() => localStorage.getItem('medical-demo-appointments-v1'));
    assert(saved && !saved.includes('Тестовый пациент') && !saved.includes('900') && !saved.includes('555'), 'patient name and phone are not stored');
    const initial = JSON.parse(saved)[0];
    assert(initial && initial.date && initial.time && initial.doctorId, 'booking is stored locally');
    await dialog.getByRole('button', { name: 'Мои записи' }).click();
    const visits = page.getByRole('dialog', { name: 'Мои демо-записи' });
    assert.equal(await visits.locator('.medical-booking__appointment').count(), 1);
    await visits.getByRole('button', { name: 'Новая демо-запись' }).click();
    await dialog.locator('.medical-booking__doctor-row').first().click();
    await dialog.locator('.medical-booking__dates button').nth(1).click();
    assert.equal(await dialog.locator('.medical-booking__times button').first().isDisabled(), true, 'same doctor and time cannot be booked twice');
    await dialog.getByRole('button', { name: 'Назад' }).click();
    await dialog.getByRole('button', { name: 'Назад' }).click();
    await page.waitForFunction(() => document.activeElement?.getAttribute('data-med-book') === 'hero');
    const navBox = await page.locator('.med-nav').boundingBox();
    assert(navBox && navBox.x >= 0 && navBox.x + navBox.width <= width + 1 && navBox.y >= 0 && navBox.y + navBox.height <= height + 1, `navigation remains in viewport: ${JSON.stringify(navBox)}`);
    await page.locator('.med-nav').getByRole('button', { name: 'Записи' }).click();
    await visits.getByRole('button', { name: 'Перенести' }).click();
    assert.equal(await dialog.getByRole('button', { name: 'Изменить специалиста' }).count(), 0, 'rescheduling keeps specialist');
    await dialog.locator('.medical-booking__dates button').nth(2).click();
    await dialog.locator('.medical-booking__times button').nth(1).click();
    await dialog.getByRole('button', { name: 'Продолжить' }).click();
    await dialog.getByLabel('Ваше имя').fill('Другой пациент');
    await dialog.getByLabel('Телефон').fill('+7 900 555 66 77');
    await dialog.getByRole('button', { name: 'Сохранить демо-запись' }).click();
    try { await dialog.getByText(/Настоящий приём не забронирован/).waitFor({ timeout: 10000 }); }
    catch (error) { throw new Error(`Rescheduling did not finish: ${await dialog.textContent()}\n${error.message}`); }
    const moved = JSON.parse(await page.evaluate(() => localStorage.getItem('medical-demo-appointments-v1')));
    assert.equal(moved.length, 1, 'rescheduling updates instead of duplicating');
    assert.equal(moved[0].id, initial.id);
    assert.equal(moved[0].doctorId, initial.doctorId);
    assert.notEqual(moved[0].date, initial.date);
    await dialog.getByRole('button', { name: 'Мои записи' }).click();
    await visits.getByRole('button', { name: 'Удалить', exact: true }).click();
    await visits.getByRole('button', { name: 'Да, удалить' }).click();
    await visits.getByText('Пока нет записей').waitFor();
    assert.equal(JSON.parse(await page.evaluate(() => localStorage.getItem('medical-demo-appointments-v1'))).length, 0, 'deletion persists');
    assert.match(await visits.textContent(), /Пока нет записей/);
    await page.keyboard.press('Escape');
    await visits.waitFor({ state: 'hidden' });
    assert.equal(await page.getByRole('dialog').count(), 0, 'Escape closes the flow');
    await page.evaluate(({ date, time }) => localStorage.setItem('medical-demo-appointments-v1', JSON.stringify([
      { id: 'bad-date', doctorId: 'anna', date: '2026-99-99', time, duration: 45, price: 3500 },
      { id: 'bad-day', doctorId: 'anna', date: '2026-02-30', time, duration: 45, price: 3500 },
      { id: 'bad-price', doctorId: 'anna', date, time, duration: 45, price: -1 },
      { id: 'bad-duration', doctorId: 'anna', date, time, duration: 999999, price: 3500 },
      { id: 'missing-doctor', doctorId: 'unknown', date, time, duration: 45, price: 3500 },
    ])), { date: initial.date, time: initial.time });
    await page.locator('.med-nav').getByRole('button', { name: 'Записи' }).click();
    assert.equal(await visits.locator('.medical-booking__appointment').count(), 1, 'invalid stored rows are ignored');
    assert.match(await visits.textContent(), /Специалист/, 'unknown specialist has a safe fallback');
    assert.deepEqual(errors, [], 'no uncaught JavaScript errors');
    console.log(`${engine.name()} ${width}x${height}: booking, rescheduling, deletion, privacy and keyboard passed`);
  } finally { await context.close(); }
}

(async () => {
  const browser = await engine.launch();
  const sizes = [[320, 568], [390, 844], [430, 932]].filter(([width]) => !process.env.MEDICAL_WIDTH || width === Number(process.env.MEDICAL_WIDTH));
  try { for (const [width, height] of sizes) await run(browser, width, height); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
