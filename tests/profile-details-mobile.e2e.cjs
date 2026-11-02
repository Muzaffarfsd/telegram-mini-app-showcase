const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');

const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:5000/';
const json = (route, data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });

async function setup(browser, { width = 390, language = 'ru', authenticated = false, csrf = 'actual', missingAccount = false, start = '' } = {}) {
  const state = { reviewAttempts: 0, taskAttempts: 0, applies: 0, posts: [], progress: [], balance: 20, connected: !missingAccount };
  const context = await browser.newContext({ viewport: { width, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: language === 'ru' ? 'ru-RU' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(({ language, authenticated, start }) => {
    localStorage.setItem('app-language', language);
    if (authenticated) {
      const user = { id: 12345, first_name: 'Мария', username: 'maria', language_code: language };
      sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppData: 'user=' + encodeURIComponent(JSON.stringify(user)) + (start ? '&start_param=' + encodeURIComponent(start) : ''), tgWebAppVersion: '9.0', tgWebAppPlatform: 'android' }));
    }
    window.__nativeEvents = [];
    window.TelegramWebviewProxy = { postEvent(type, data) { window.__nativeEvents.push({ type, data: data ? JSON.parse(data) : {} }); } };
    window.open = url => { window.__openedUrl = String(url); return null; };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copied = text; } } });
  }, { language, authenticated, start });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.route('**/api/**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    if (url.pathname === '/api/csrf-token') return json(route, csrf === 'actual' ? { csrfToken: 'csrf-test' } : csrf === 'legacy' ? { token: 'csrf-test' } : {});
    if (method === 'POST') state.posts.push({ path: url.pathname, body: req.postDataJSON(), headers: req.headers() });
    if (url.pathname.startsWith('/api/user-projects/')) return json(route, []);
    if (url.pathname.startsWith('/api/referrals/stats/')) return state.connected ? json(route, { referralCode: 'WEB4TGSELF', totalReferrals: 2, activeReferrals: 1 }) : json(route, { error: 'User not found' }, 404);
    if (url.pathname === '/api/referrals/user/init') { state.connected = true; return json(route, { referralCode: 'WEB4TGSELF' }); }
    if (url.pathname === '/api/referral/apply') {
      state.applies++;
      return state.applies === 1 ? json(route, { message: 'Код не найден.' }, 404) : json(route, { success: true });
    }
    if (url.pathname === '/api/tasks/balance') return state.connected ? json(route, { availableCoins: state.balance, tasksCompleted: state.progress.length }) : json(route, { error: 'User not found' }, 404);
    if (url.pathname === '/api/tasks/progress') return json(route, state.progress);
    if (url.pathname === '/api/tasks/complete') {
      state.taskAttempts++;
      if (state.taskAttempts === 1) return json(route, { error: 'temporary' }, 503);
      state.balance += 10;
      state.progress.push({ taskId: req.postDataJSON().task_id, completed: true, completedAt: new Date().toISOString() });
      return json(route, { success: true, coins_awarded: 10 });
    }
    if (url.pathname === '/api/reviews' && method === 'GET') return json(route, { data: [{ id: 1, name: 'Пример без автора', rating: 5, text: 'Пример', hasAuthorAccount: false }, { id: 2, name: 'Реальный клиент', rating: 4, text: 'Спасибо за работу!', hasAuthorAccount: true }] });
    if (url.pathname === '/api/reviews' && method === 'POST') {
      state.reviewAttempts++;
      return state.reviewAttempts === 1 ? json(route, { error: 'temporary' }, 503) : json(route, { success: true });
    }
    return json(route, {});
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('/#/profile', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('profile-page').waitFor({ timeout: 30000 });
  return { context, page, state, errors };
}

async function visit(page, id, destination) {
  const target = page.getByTestId(id);
  await target.scrollIntoViewIfNeeded();
  await target.tap();
  await page.getByTestId(destination).waitFor({ timeout: 20000 });
}
async function back(page) {
  await page.getByTestId('button-back').tap();
  await page.getByTestId('profile-page').waitFor({ timeout: 20000 });
}
async function checkScreen(page, testId, width, language) {
  const main = page.getByTestId(testId);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${testId}: horizontal overflow at ${width}px ${language}`);
  assert.match(await main.evaluate(el => getComputedStyle(el).fontFamily), /Google Sans App/);
  assert.equal(await page.evaluate(() => document.fonts.check('16px "Google Sans App"')), true);
  const backBox = await page.getByTestId('button-back').boundingBox();
  assert.ok(backBox.width >= 44 && backBox.height >= 44, `${testId}: back target too small`);
  const artwork = main.locator('img').first();
  assert.ok(await artwork.count(), `${testId}: missing artwork`);
  await artwork.scrollIntoViewIfNeeded();
  await artwork.evaluate(img => img.decode());
  assert.ok(await artwork.evaluate(img => img.naturalWidth > 0), `${testId}: artwork failed`);
  if (process.env.PROFILE_DETAIL_SCREENSHOTS && width === 320 && language === 'ru') {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(process.env.PROFILE_DETAIL_SCREENSHOTS, `${testId}-320.png`) });
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const sizes = process.env.PROFILE_DETAIL_FAST ? [] : [[320, 'ru'], [390, 'ru'], [430, 'ru'], [320, 'en'], [390, 'en']];
    for (const [width, language] of sizes) {
      const { page, context, errors } = await setup(browser, { width, language });
      for (const [card, destination] of [
        ['profile-referral-program', 'profile-referral-page'], ['profile-rewards', 'profile-rewards-page'],
        ['profile-earning', 'profile-earning-page'], ['profile-help', 'profile-help-page'], ['profile-review', 'profile-review-page'],
      ]) {
        await visit(page, card, destination);
        await checkScreen(page, destination, width, language);
        if (destination === 'profile-earning-page') assert.equal(await page.getByTestId('earning-daily').isDisabled(), true);
        if (destination === 'profile-review-page') assert.equal(await page.getByTestId('button-submit-review').isDisabled(), true);
        await back(page);
      }
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}px ${language}: all five pages, guest states, artwork, typography and back navigation passed`);
    }
    const { page, context, state, errors } = await setup(browser, { authenticated: true });
    const previousTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    await page.getByTestId('profile-theme').tap();
    assert.notEqual(await page.evaluate(() => document.documentElement.dataset.theme), previousTheme);
    assert.equal(await page.getByTestId('profile-page').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    await page.getByTestId('profile-add-home').tap();
    await page.waitForFunction(() => window.__nativeEvents.some(event => event.type === 'web_app_add_to_home_screen'));
    await page.getByTestId('profile-instagram').tap();
    assert.match(await page.evaluate(() => window.__openedUrl), /instagram\.com\/web4tg/);
    await page.getByTestId('profile-tiktok').tap();
    assert.match(await page.evaluate(() => window.__openedUrl), /tiktok\.com\/@web4tg/);
    await visit(page, 'profile-referral-program', 'profile-referral-page');
    await page.getByTestId('profile-referral-page').getByText('WEB4TGSELF', { exact: true }).waitFor();
    await page.getByTestId('referral-copy').tap();
    assert.equal(await page.evaluate(() => window.__copied), 'WEB4TGSELF');
    await page.getByTestId('referral-share').tap();
    await page.getByText('Открываем приглашение в Telegram.').waitFor();
    await page.getByTestId('profile-referral-page').locator('summary').filter({ hasText: 'У меня есть код друга' }).tap();
    const friend = page.locator('#referral-friend-code');
    await friend.fill('web4tgself');
    await page.getByTestId('referral-apply').tap();
    await page.getByRole('alert').filter({ hasText: 'собственный код' }).waitFor();
    assert.equal(state.applies, 0);
    await friend.fill('WEB4TGFRIEND');
    await page.getByTestId('referral-apply').tap();
    await page.getByRole('alert').filter({ hasText: 'Код не найден' }).waitFor();
    await page.getByTestId('referral-apply').tap();
    await page.getByText('Код принят. Статус появится в программе.').waitFor();
    const applied = state.posts.find(post => post.path === '/api/referral/apply');
    assert.deepEqual(applied.body, { userId: 12345, referralCode: 'WEB4TGFRIEND' });
    assert.equal(applied.headers['x-csrf-token'], 'csrf-test');
    assert.ok(applied.headers['x-telegram-init-data']);
    await back(page);

    await visit(page, 'profile-help', 'profile-help-page');
    await page.getByTestId('profile-help-page').getByRole('button', { name: 'Проекты', exact: true }).tap();
    assert.equal(await page.getByTestId('button-faq-0').count(), 0);
    await page.getByTestId('button-faq-2').tap();
    assert.equal(await page.getByTestId('button-faq-2').getAttribute('aria-expanded'), 'true');
    await page.getByText('Откройте «Мои проекты» в профиле.', { exact: false }).waitFor();
    await page.getByTestId('button-telegram-support').tap();
    const events = await page.evaluate(() => window.__nativeEvents);
    assert.ok(events.some(event => event.type === 'web_app_open_tg_link' && String(event.data.path_full).includes('web4tgs')), 'support opens the correct Telegram contact');
    await back(page);

    await visit(page, 'profile-review', 'profile-review-page');
    await page.getByText('Реальный клиент').waitFor();
    assert.equal(await page.getByText('Пример без автора').count(), 0);
    await page.getByTestId('review-rating-4').tap();
    await page.locator('#review-name').fill('Анна');
    await page.locator('#review-company').fill('Магазин');
    await page.locator('#review-text').fill('Отличная работа команды, спасибо!');
    await page.getByTestId('button-submit-review').tap();
    await page.getByRole('alert').filter({ hasText: 'Не удалось отправить отзыв' }).waitFor();
    await page.getByTestId('button-submit-review').tap();
    await page.getByRole('status').filter({ hasText: 'Спасибо за отзыв' }).waitFor();
    const review = state.posts.find(post => post.path === '/api/reviews');
    assert.deepEqual(review.body, { name: 'Анна', company: 'Магазин', rating: 4, text: 'Отличная работа команды, спасибо!' });
    assert.equal(review.headers['x-csrf-token'], 'csrf-test');
    await page.getByTestId('button-back-profile').tap();
    await page.getByTestId('profile-page').waitFor();

    await visit(page, 'profile-earning', 'profile-earning-page');
    await page.getByTestId('earning-daily').waitFor({ state: 'visible' });
    await page.getByTestId('earning-daily').tap();
    await page.getByRole('alert').filter({ hasText: 'Не удалось подтвердить' }).waitFor();
    await page.getByTestId('earning-daily').tap();
    await page.getByText('Задание выполнено. Начислено: 10 монет.').waitFor();
    await page.getByText('Получено сегодня').waitFor();
    assert.equal(await page.getByTestId('earning-daily').isDisabled(), true);
    assert.equal(state.balance, 30);
    const task = state.posts.find(post => post.path === '/api/tasks/complete');
    assert.equal(task.body.task_id, 'daily_visit');
    assert.equal(task.headers['x-csrf-token'], 'csrf-test');
    await back(page);

    await visit(page, 'profile-rewards', 'profile-rewards-page');
    assert.match(await page.locator('.pd-level-card').innerText(), /сохраняется на этом устройстве/);
    assert.deepEqual(errors, []);
    await context.close();
    console.log('Authenticated: referral copy/share/validation/retry, real Telegram contact, FAQ, review retry/submission, task retry and persisted progress passed');

    const newAccount = await setup(browser, { authenticated: true, missingAccount: true, start: 'WEB4TGFRIEND' });
    await visit(newAccount.page, 'profile-earning', 'profile-earning-page');
    await newAccount.page.getByTestId('earning-connect-profile').tap();
    await newAccount.page.getByTestId('profile-referral-page').waitFor();
    assert.equal(await newAccount.page.locator('#referral-friend-code').inputValue(), 'WEB4TGFRIEND');
    assert.equal(newAccount.state.applies, 0, 'a deep-link code is not applied without consent');
    await newAccount.page.getByTestId('referral-connect').tap();
    await newAccount.page.getByTestId('profile-referral-page').getByText('WEB4TGSELF', { exact: true }).waitFor();
    assert.equal(newAccount.state.connected, true);
    await newAccount.context.close();
    console.log('New Telegram account: deep-link suggestion and explicit profile connection passed');

    for (const csrf of ['legacy', 'missing']) {
      const check = await setup(browser, { authenticated: true, csrf });
      await visit(check.page, 'profile-review', 'profile-review-page');
      await check.page.getByTestId('review-rating-5').tap();
      await check.page.locator('#review-name').fill('Анна');
      await check.page.locator('#review-text').fill('Отличная работа команды!');
      await check.page.getByTestId('button-submit-review').tap();
      await check.page.getByRole('alert').filter({ hasText: 'Не удалось отправить отзыв' }).waitFor();
      assert.equal(check.state.posts.filter(post => post.path === '/api/reviews').length, csrf === 'legacy' ? 1 : 0);
      await check.context.close();
      console.log(`CSRF ${csrf}: ${csrf === 'legacy' ? 'accepted' : 'missing token blocks mutation'}`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
