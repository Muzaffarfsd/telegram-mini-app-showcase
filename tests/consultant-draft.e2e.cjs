const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const site = process.env.CONSULTANT_TEST_URL || 'http://127.0.0.1:5195/';
const draftKey = 'web4tg:consultant-draft:v1';

async function tap(locator) {
  await locator.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await locator.tap();
}

async function screen(page, expected) {
  await page.waitForFunction((value) => document.querySelector('[data-testid="consultant-page"]')?.dataset.consultantScreen === value, expected);
}

async function open(browser, width, blockStorage = false) {
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(({ blockStorage }) => {
    localStorage.setItem('app-language', 'ru');
    window.__requestUrl = null;
    window.open = (url) => { window.__requestUrl = String(url); return null; };
    if (blockStorage) Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Storage unavailable'); } });
  }, { blockStorage });
  await context.route('https://telegram.org/js/telegram-web-app.js', (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(new URL('/#/ai-process', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 30000 });
  await screen(page, 'home');
  return { context, page, errors };
}

async function configure(page) {
  await tap(page.getByTestId('consultant-open-configure'));
  await screen(page, 'configure');
}

async function restore(page) {
  const dialog = page.getByTestId('consultant-draft-dialog');
  await dialog.waitFor({ state: 'visible' });
  await tap(dialog.getByRole('button', { name: 'Восстановить', exact: true }));
  await dialog.waitFor({ state: 'detached' });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390]) {
      const { context, page, errors } = await open(browser, width);

      // Looking at a demo alone must not create a saved configuration.
      await tap(page.getByTestId('consultant-show-demo'));
      await screen(page, 'industries');
      await tap(page.getByTestId('consultant-industry-restaurant'));
      await screen(page, 'demo');
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), draftKey), null);
      await tap(page.getByTestId('consultant-home-link'));
      await screen(page, 'home');

      await configure(page);
      assert.equal(await page.getByTestId('consultant-draft-dialog').count(), 0);
      await tap(page.getByTestId('consultant-config-industry'));
      await screen(page, 'industries');
      await tap(page.getByTestId('consultant-industry-services'));
      await screen(page, 'configure');
      await tap(page.getByTestId('consultant-channel-app'));
      await tap(page.getByTestId('consultant-channel-chat'));
      assert.equal(await page.getByTestId('consultant-channel-app').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.getByTestId('consultant-channel-chat').getAttribute('aria-pressed'), 'true');
      await tap(page.getByTestId('consultant-task-questions'));
      await tap(page.getByTestId('consultant-task-booking'));
      await tap(page.getByTestId('consultant-tone-warm'));
      await page.locator('#consultant-project-name').fill('Студия Анна');
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || 'null')?.draft?.projectName === 'Студия Анна', draftKey);
      const initial = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).draft, draftKey);
      assert.deepEqual(initial, { industry: 'services', industryChosen: true, channel: 'both', selectedTasks: ['questions', 'booking'], tone: 'warm', projectName: 'Студия Анна' });

      // A pending draft is protected while users browse the overview and demo.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 30000 });
      await screen(page, 'home');
      assert.equal(await page.getByTestId('consultant-draft-dialog').count(), 0);
      await page.evaluate(() => {
        window.__requestUrl = null;
        window.open = (url) => { window.__requestUrl = String(url); return null; };
        if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink = (url) => { window.__requestUrl = String(url); };
      });
      await tap(page.getByTestId('consultant-contact'));
      await restore(page);
      await screen(page, 'review');
      assert.match(await page.locator('.ai2-review-hero').innerText(), /Студия Анна/);
      assert.equal(await page.evaluate(() => window.__requestUrl), null, 'Restoring from the direct CTA must not open or send a request');
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 30000 });
      await screen(page, 'home');
      await tap(page.getByTestId('consultant-show-demo'));
      await tap(page.getByTestId('consultant-industry-shop'));
      await screen(page, 'demo');
      assert.deepEqual(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).draft, draftKey), initial);
      await tap(page.getByTestId('consultant-home-link'));
      await tap(page.getByTestId('consultant-open-review'));
      await screen(page, 'review');
      assert.equal(await page.getByTestId('consultant-draft-dialog').count(), 0, 'Review remains readable without a modal');
      await tap(page.getByTestId('consultant-review-contact'));
      await restore(page);
      assert.match(await page.locator('.ai2-review-hero').innerText(), /Студия Анна/);
      assert.match(await page.locator('.ai2-summary').innerText(), /Mini App и Telegram/);

      await page.evaluate(() => {
        window.__requestUrl = null;
        window.open = (url) => { window.__requestUrl = String(url); return null; };
        if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink = (url) => { window.__requestUrl = String(url); };
      });
      await tap(page.getByTestId('consultant-review-contact'));
      await page.waitForFunction(() => Boolean(window.__requestUrl));
      const message = await page.evaluate(() => new URL(window.__requestUrl).searchParams.get('text'));
      assert.match(message, /Студия Анна/);
      assert.match(message, /Отвечать на вопросы/);
      assert.match(message, /Помогать с записью/);

      // A pending draft can also be restored directly in the configurator.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 30000 });
      await configure(page);
      await restore(page);
      assert.equal(await page.locator('#consultant-project-name').inputValue(), 'Студия Анна');
      assert.equal(await page.getByTestId('consultant-task-questions').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.getByTestId('consultant-task-booking').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.getByTestId('consultant-tone-warm').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.getByTestId('consultant-channel-app').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.getByTestId('consultant-channel-chat').getAttribute('aria-pressed'), 'true');

      // Start over clears the old draft and the first new edit is saved.
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 30000 });
      await configure(page);
      const dialog = page.getByTestId('consultant-draft-dialog');
      await dialog.waitFor({ state: 'visible' });
      await tap(dialog.getByRole('button', { name: 'Начать заново', exact: true }));
      await dialog.waitFor({ state: 'detached' });
      assert.equal(await page.evaluate((key) => localStorage.getItem(key), draftKey), null);
      assert.equal(await page.locator('#consultant-project-name').inputValue(), '');
      await page.locator('#consultant-project-name').fill('Новый проект');
      await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || 'null')?.draft?.projectName === 'Новый проект', draftKey);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}px: demo, protected draft, restore, Telegram request and new configuration passed`);
    }

    // Selecting an industry from configure should return there, and Back should not cycle.
    {
      const { context, page, errors } = await open(browser, 390);
      await configure(page);
      await tap(page.getByTestId('consultant-config-industry'));
      await tap(page.getByTestId('consultant-industry-services'));
      await screen(page, 'configure');
      await tap(page.getByTestId('consultant-back'));
      await screen(page, 'home');
      assert.deepEqual(errors, []);
      await context.close();
      console.log('History: selecting an industry does not create a back-navigation loop');
    }

    // Unavailable browser storage must not block configuring the service.
    {
      const { context, page, errors } = await open(browser, 390, true);
      await configure(page);
      await page.getByRole('status').filter({ hasText: 'Не удалось сохранить черновик' }).waitFor({ state: 'visible' });
      await tap(page.getByTestId('consultant-channel-app'));
      await page.locator('#consultant-project-name').fill('Без хранилища');
      await tap(page.getByTestId('consultant-config-continue'));
      await screen(page, 'review');
      assert.match(await page.locator('.ai2-review-hero').innerText(), /Без хранилища/);
      assert.deepEqual(errors, []);
      await context.close();
      console.log('Unavailable storage: warning shown and configuration remains usable');
    }
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
