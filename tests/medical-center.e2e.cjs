// End-to-end checks for the medical-centre booking demo.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const base = (process.env.MEDICAL_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/$/, '');
const engine = process.env.MEDICAL_ENGINE === 'webkit' ? webkit : chromium;

async function run(browser, width, height) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
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
    const hasTelegramStub = await page.evaluate(() => {
      const api = window.Telegram?.WebApp?.BackButton;
      if (!api) return false;
      window.__medicalBack = {handlers: new Set(), visible: false};
      api.onClick = fn => window.__medicalBack.handlers.add(fn);
      api.offClick = fn => window.__medicalBack.handlers.delete(fn);
      api.show = () => { window.__medicalBack.visible = true; };
      api.hide = () => { window.__medicalBack.visible = false; };
      return true;
    });
    await page.locator('[data-med-book="hero"]').click();
    const dialog = page.locator('.medical-booking');
    await dialog.waitFor();
    await checkContrast();
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('role')), 'dialog', 'dialog receives focus');
    assert.equal(await dialog.getAttribute('aria-modal'), 'false', 'booking is a non-modal page');
    const headerBox = await page.locator('.w4-topbar').boundingBox();
    const dialogBox = await dialog.boundingBox();
    const navBox = await page.locator('.medical-navigation').boundingBox();
    assert(headerBox && dialogBox && headerBox.y + headerBox.height <= dialogBox.y, 'the actual WEB4TG header remains visible');
    assert(navBox && navBox.x >= 0 && navBox.x + navBox.width <= width + 1 && navBox.y >= 0 && navBox.y + navBox.height <= height + 1, 'navigation remains in viewport');
    await page.getByTestId('button-hamburger').focus();
    assert.equal(await page.getByTestId('button-hamburger').evaluate(el => document.activeElement === el), true, 'header is keyboard accessible during booking');
    if (hasTelegramStub) await page.waitForFunction(() => window.__medicalBack.handlers.size === 1 && window.__medicalBack.visible);
    await dialog.locator('.medical-booking__doctor-row').first().click();
    await checkContrast();
    await dialog.locator('.medical-booking__dates button').nth(1).click();
    await dialog.locator('.medical-booking__times button').first().click();
    const nextBox = await dialog.getByRole('button', { name: 'Продолжить' }).boundingBox();
    assert(nextBox && nextBox.y + nextBox.height <= navBox.y, 'continuation is above bottom navigation');
    await dialog.getByRole('button', { name: 'Продолжить' }).click();
    await checkContrast();
    await dialog.getByLabel('Ваше имя').fill('Тестовый пациент');
    await dialog.getByLabel('Телефон').fill('+7 900 555 44 33');
    assert(!JSON.stringify(await page.evaluate(() => history.state)).includes('Тестовый пациент'), 'contacts are not written to browser history');
    if (hasTelegramStub) await page.evaluate(() => [...window.__medicalBack.handlers][0]());
    else await page.goBack();
    await dialog.getByText('Выберите удобное', { exact: false }).waitFor();
    assert.equal(await dialog.locator('.medical-booking__times button').first().getAttribute('aria-pressed'), 'true', 'Back restores selected time');
    await page.goBack();
    await dialog.getByText('К кому вы', { exact: false }).waitFor();
    await page.goForward();
    await dialog.getByText('Выберите удобное', { exact: false }).waitFor();
    await page.goForward();
    await dialog.getByText('Почти готово').waitFor();
    assert.equal(await dialog.getByLabel('Ваше имя').inputValue(), 'Тестовый пациент', 'Forward restores the active form state');
    await page.getByTestId('button-hamburger').focus();
    await page.locator('.medical-navigation').getByRole('button', { name: 'Главная' }).click();
    await page.locator('[data-med-book="hero"]').click();
    await dialog.getByText('К кому вы', { exact: false }).waitFor();
    await page.goBack();
    await page.locator('[data-med-book="hero"]').waitFor();
    await page.goBack();
    await dialog.getByText('Почти готово').waitFor();
    await dialog.getByLabel('Ваше имя').fill('Тестовый пациент');
    await dialog.getByLabel('Телефон').fill('+7 900 555 44 33');
    await page.setViewportSize({ width, height: Math.min(height, 500) });
    const saveBox = await dialog.getByRole('button', { name: 'Сохранить демо-запись' }).boundingBox();
    assert(saveBox && saveBox.y >= 0 && saveBox.y + saveBox.height <= Math.min(height, 500), 'save remains visible with a reduced keyboard viewport');
    await page.evaluate(() => { window.__medicalEvents = []; const originalFocus = HTMLElement.prototype.focus; HTMLElement.prototype.focus = function (...args) { if (this.classList.contains('medical-booking')) window.__medicalEvents.push({ type: 'focus-call', stack: new Error().stack }); return originalFocus.apply(this, args); }; for (const name of ['pointerdown','pointerup','mousedown','mouseup','click','submit','focusin','focusout']) document.addEventListener(name, event => { const target = event.target; window.__medicalEvents.push({ type: event.type, tag: target?.tagName, class: target?.className, text: target?.textContent?.slice(0, 40), active: document.activeElement?.tagName }); }, true); });
    if (process.env.MEDICAL_SUBMIT === 'enter') await dialog.getByLabel('Телефон').press('Enter');
    else if (process.env.MEDICAL_SUBMIT === 'mouse') await dialog.getByRole('button', { name: 'Сохранить демо-запись' }).click();
    else await dialog.getByRole('button', { name: 'Сохранить демо-запись' }).tap();
    try { await dialog.getByText(/Настоящий приём не забронирован/).waitFor(); }
    catch (error) { throw new Error(`Initial booking did not finish: ${await dialog.textContent()}\nEvents: ${JSON.stringify(await page.evaluate(() => window.__medicalEvents))}\n${error.message}`); }
    await page.setViewportSize({ width, height });
    assert.match(await dialog.textContent(), /Настоящий приём не забронирован/);
    const saved = await page.evaluate(() => localStorage.getItem('medical-demo-appointments-v1'));
    assert(saved && !saved.includes('Тестовый пациент') && !saved.includes('+7 900 555 44 33') && !saved.includes('79005554433'), 'patient name and phone are not stored');
    const initial = JSON.parse(saved)[0];
    assert.deepEqual(Object.keys(initial).sort(), ['date', 'doctorId', 'duration', 'id', 'price', 'time'], 'stored records contain only appointment details');
    assert(initial && initial.date && initial.time && initial.doctorId, 'booking is stored locally');
    await dialog.getByRole('button', { name: 'Мои записи' }).click();
    const visits = dialog;
    assert.equal(await visits.locator('.medical-booking__appointment').count(), 1);
    await visits.getByRole('button', { name: 'Новая демо-запись' }).click();
    await dialog.locator('.medical-booking__doctor-row').first().click();
    await dialog.locator('.medical-booking__dates button').nth(1).click();
    assert.equal(await dialog.locator('.medical-booking__times button').first().isDisabled(), true, 'same doctor and time cannot be booked twice');
    await page.locator('.medical-navigation').getByRole('button', { name: 'Главная' }).click();
    await page.locator('[data-med-book="hero"]').waitFor();
    await page.locator('.medical-navigation').getByRole('button', { name: 'Записи' }).click();
    await visits.getByRole('button', { name: 'Перенести' }).click();
    assert.equal(await dialog.getByRole('button', { name: 'Изменить специалиста' }).count(), 0, 'rescheduling keeps specialist');
    await dialog.locator('.medical-booking__dates button').nth(2).click();
    await dialog.locator('.medical-booking__times button').nth(1).click();
    await dialog.getByRole('button', { name: 'Продолжить' }).click();
    await dialog.getByLabel('Ваше имя').fill('Другой пациент');
    await dialog.getByLabel('Телефон').fill('+7 900 555 66 77');
    await page.evaluate(() => { window.__medicalEvents = []; });
    if (process.env.MEDICAL_SUBMIT === 'enter') await dialog.getByLabel('Телефон').press('Enter');
    else if (process.env.MEDICAL_SUBMIT === 'mouse') await dialog.getByRole('button', { name: 'Сохранить демо-запись' }).click();
    else await dialog.getByRole('button', { name: 'Сохранить демо-запись' }).tap();
    try { await dialog.getByText(/Настоящий приём не забронирован/).waitFor({ timeout: 10000 }); }
    catch (error) { throw new Error(`Rescheduling did not finish: ${await dialog.textContent()}\nEvents: ${JSON.stringify(await page.evaluate(() => window.__medicalEvents))}\n${error.message}`); }
    assert.equal(await page.evaluate(() => window.__medicalEvents.some(event => event.type === 'focus-call')), false, 'dialog does not steal focus during form submission');
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
    await dialog.focus();
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
    await page.locator('.medical-navigation').getByRole('button', { name: 'Записи' }).click();
    assert.equal(await visits.locator('.medical-booking__appointment').count(), 1, 'invalid stored rows are ignored');
    assert.match(await visits.textContent(), /Специалист/, 'unknown specialist has a safe fallback');
    assert.deepEqual(errors, [], 'no uncaught JavaScript errors');
    console.log(`${engine.name()} ${width}x${height}: booking, rescheduling, deletion, privacy and keyboard passed`);
  } catch (error) { console.error('Test failed before browser cleanup:', error); throw error; }
  finally { await context.close(); }
}

(async () => {
  const browser = await engine.launch();
  const sizes = [[320, 568], [390, 844], [430, 932]].filter(([width]) => !process.env.MEDICAL_WIDTH || width === Number(process.env.MEDICAL_WIDTH));
  try { for (const [width, height] of sizes) await run(browser, width, height); }
  finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
