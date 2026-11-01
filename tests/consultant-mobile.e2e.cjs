const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const site = process.env.CONSULTANT_TEST_URL || 'http://127.0.0.1:5000/';
const screenshotDir = process.env.CONSULTANT_SCREENSHOT_DIR;
const pathFor = (route) => new URL(`/#/${route}`, site).href;
const tap = async (locator) => {
  await locator.scrollIntoViewIfNeeded();
  await locator.tap();
};
const selected = async (page, id) => page.getByTestId(id).getAttribute('aria-pressed');
const screen = async (page, name) =>
  page.waitForFunction(
    (expected) =>
      document.querySelector('[data-testid="consultant-page"]')?.getAttribute('data-consultant-screen') ===
      expected,
    name,
  );

async function open(
  browser,
  { width = 390, height = 844, lang = 'ru', native = false, motion = 'reduce', route = 'ai-process' } = {},
) {
  const context = await browser.newContext({
    viewport: { width, height },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    locale: lang === 'ru' ? 'ru-RU' : 'en-US',
    reducedMotion: motion,
    serviceWorkers: 'block',
  });
  await context.addInitScript(
    ({ lang, native }) => {
      localStorage.setItem('app-language', lang);
      window.__requestUrl = null;
      window.open = (url) => {
        window.__requestUrl = String(url);
        return null;
      };
      if (native) {
        const user = { id: 12345, first_name: 'Мария', username: 'maria', language_code: lang };
        sessionStorage.setItem(
          '__telegram__initParams',
          JSON.stringify({
            tgWebAppData: `user=${encodeURIComponent(JSON.stringify(user))}`,
            tgWebAppVersion: '9.0',
            tgWebAppPlatform: 'android',
          }),
        );
        window.__nativeEvents = [];
        window.TelegramWebviewProxy = {
          postEvent(type, data) {
            window.__nativeEvents.push({ type, data: data ? JSON.parse(data) : {} });
          },
        };
      }
    },
    { lang, native },
  );
  await context.route('https://telegram.org/js/telegram-web-app.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  );
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(pathFor(route), { waitUntil: 'domcontentloaded' });
  await page.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 30000 });
  await screen(page, 'home');
  return { context, page, errors };
}

async function snap(page, name) {
  if (!screenshotDir) return;
  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.evaluate(async () => {
    const images = [...document.querySelectorAll('[data-testid="consultant-page"] img')];
    await Promise.all(
      images
        .filter((img) => {
          const r = img.getBoundingClientRect();
          return r.bottom > 0 && r.top < innerHeight;
        })
        .map((img) => img.decode().catch(() => {})),
    );
  });
  await page.screenshot({ path: `${screenshotDir}/${name}.png` });
}

async function noOverflow(page) {
  assert.equal(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <= innerWidth &&
        document.getElementById('root').scrollWidth <= innerWidth,
    ),
    true,
    'horizontal overflow',
  );
  const clipped = await page
    .locator('.consultant-v2 :is(h1, h2, .ai2-industry strong, .ai2-primary)')
    .evaluateAll((nodes) =>
      nodes
        .filter((el) => el.getClientRects().length && el.scrollWidth > el.clientWidth + 1)
        .map((el) => el.textContent.trim()),
    );
  assert.deepEqual(clipped, [], 'headings and primary actions must not clip');
}

async function captureRequest(page, id) {
  await page.evaluate(() => {
    window.__requestUrl = null;
    if (window.Telegram?.WebApp)
      window.Telegram.WebApp.openTelegramLink = (url) => {
        window.__requestUrl = String(url);
      };
  });
  await tap(page.getByTestId(id));
  const url = new URL(await page.evaluate(() => window.__requestUrl));
  assert.equal(url.origin + url.pathname, 'https://t.me/web4tgs');
  return url.searchParams.get('text');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const loading = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    });
    await loading.addInitScript(() => localStorage.setItem('app-language', 'ru'));
    await loading.route('https://telegram.org/js/telegram-web-app.js', (route) =>
      route.fulfill({ contentType: 'text/javascript', body: '' }),
    );
    await loading.route('**/*consultant-orb*.webp*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.continue();
    });
    const lp = await loading.newPage();
    await lp.goto(pathFor('ai-process'), { waitUntil: 'domcontentloaded' });
    const skeleton = lp.getByTestId('consultant-skeleton');
    await skeleton.waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await skeleton.getAttribute('aria-busy'), 'true');
    assert.equal(
      await skeleton
        .locator('.profile-skeleton')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      'none',
    );
    await lp.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 20000 });
    await lp.waitForFunction(
      () => {
        const img = document.querySelector('.ai2-hero-art > img');
        return img?.complete && img.naturalWidth > 0;
      },
      null,
      { timeout: 10000 },
    );
    await loading.close();
    console.log('Loading: skeleton, reduced motion and artwork passed');

    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [430, 932],
    ]) {
      const { context, page, errors } = await open(browser, { width, height });
      await noOverflow(page);
      assert.equal(
        await page.locator('[data-scroll="main"]').evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(255, 255, 255)',
      );
      assert.match(
        await page.locator('.consultant-page').evaluate((el) => getComputedStyle(el).fontFamily),
        /Google Sans App/,
      );
      assert.equal(
        await page.locator('.ai2-hero-art > img').evaluate((el) => getComputedStyle(el).animationName),
        'none',
      );
      const artBounds = await page.locator('.ai2-hero-art > img').boundingBox();
      const copyBounds = await page.locator('.ai2-hero-copy').boundingBox();
      assert.ok(artBounds.y + artBounds.height <= copyBounds.y, 'hero image must not overlap the copy');
      assert.equal(
        await page.locator('.ai2-hero-art img').count(),
        1,
        'only the consultant appears beside the hero copy',
      );
      assert.match(await page.locator('.ai3-hero-greeting').innerText(), /Привет.*личный ИИ-консультант/);
      assert.doesNotMatch(await page.locator('.ai2-hero-art').innerText(), /42/);
      assert.match(await page.locator('#consultant-title').innerText(), /ИИ-консультант/);
      assert.match(await page.locator('.ai2-hero-copy').innerText(), /Telegram.*приложении/);
      assert.match(await page.locator('.ai5-benefit-list').innerText(), /Ответит на вопросы/);
      assert.match(await page.locator('.ai5-benefit-list').innerText(), /Поможет с выбором/);
      assert.match(await page.locator('.ai5-benefit-list').innerText(), /Передаст специалисту/);
      assert.equal(await page.getByText('ИИ ДЛЯ ВАШЕГО БИЗНЕСА').count(), 0);
      for (const id of ['consultant-show-demo', 'consultant-contact']) {
        const b = await page.getByTestId(id).boundingBox();
        assert.ok(b.width >= 44 && b.height >= 44, id);
      }
      const cta = await page.getByTestId('consultant-show-demo').boundingBox();
      const nav = await page.locator('nav.consultant-nav').boundingBox();
      assert.ok(cta.y + cta.height <= nav.y, 'primary action is visible above bottom navigation');
      const contact = await page.getByTestId('consultant-contact').boundingBox();
      assert.ok(contact.y + contact.height <= nav.y, 'contact action is visible above bottom navigation');
      if (width === 390) await snap(page, '01-home');
      if (width === 320) await snap(page, '320-home');
      const direct = await captureRequest(page, 'consultant-contact');
      assert.match(direct, /Направление: Обсудим/);
      assert.match(direct, /Канал: Обсудим/);
      assert.match(direct, /Тон: Обсудим/);
      await page.evaluate(() => {
        window.__requestUrl = null;
      });
      for (const id of [
        'consultant-preview-shop',
        'consultant-preview-services',
        'consultant-preview-restaurant',
      ]) {
        const box = await page.getByTestId(id).boundingBox();
        assert.ok(box.width >= 44 && box.height >= 44, id);
      }
      await tap(page.getByTestId('consultant-preview-services'));
      assert.equal(await selected(page, 'consultant-preview-services'), 'true');
      assert.match(await page.getByTestId('consultant-story-preview').innerText(), /11:00/);
      await tap(page.getByTestId('consultant-preview-restaurant'));
      assert.equal(await selected(page, 'consultant-preview-restaurant'), 'true');
      assert.match(await page.getByTestId('consultant-story-preview').innerText(), /доставк/i);
      assert.match(await page.getByTestId('consultant-story-preview').innerText(), /пример/i);
      await tap(page.getByTestId('consultant-preview-channel-chat'));
      assert.equal(await selected(page, 'consultant-preview-channel-chat'), 'true');
      assert.equal(
        await page.locator('.ai3-story-question').evaluate((el) => getComputedStyle(el).animationName),
        'none',
      );
      if (width === 390) {
        const afterBrowsing = await captureRequest(page, 'consultant-contact');
        assert.match(afterBrowsing, /Направление: Обсудим/);
        await page.evaluate(() => {
          window.__requestUrl = null;
        });
      }
      if (width === 390 || width === 320) {
        await page.locator('.ai3-story-intro').evaluate((el) => {
          const root = document.getElementById('root');
          root.scrollTo(0, root.scrollTop + el.getBoundingClientRect().top - 105);
        });
        await snap(page, width === 390 ? '08-stories' : '320-stories');
      }
      await tap(page.getByTestId('consultant-preview-open'));
      await screen(page, 'demo');
      assert.equal(
        await page.getByTestId('consultant-example-conversation').getAttribute('data-demo-channel'),
        'telegram',
      );
      assert.equal(await selected(page, 'consultant-reply-delivery'), 'true');
      assert.match(await page.getByTestId('consultant-show-business').innerText(), /доставке/);
      await tap(page.getByTestId('consultant-home-link'));
      await screen(page, 'home');
      assert.equal(await selected(page, 'consultant-preview-restaurant'), 'true');
      await tap(page.getByTestId('consultant-show-demo'));
      await screen(page, 'industries');
      await noOverflow(page);
      assert.equal(
        await page.locator('.ai2-industry.is-shop').evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(247, 248, 249)',
      );
      if (width === 390) await snap(page, '02-industries');
      if (width === 320) await snap(page, '320-industries');
      await tap(page.getByTestId('consultant-industry-shop'));
      await screen(page, 'demo');
      await tap(page.getByTestId('consultant-demo-channel-app'));
      await page.getByAltText('Пример фотографии кроссовок Nike').waitFor({ state: 'visible' });
      await page.getByTestId('consultant-reply-size').waitFor({ state: 'visible' });
      assert.equal(
        await page.getByTestId('consultant-example-conversation').getAttribute('data-demo-channel'),
        'app',
      );
      assert.match(await page.locator('.ai4-app-context').innerText(), /Nike Air Force 1/);
      await tap(page.getByTestId('consultant-app-chat-toggle'));
      assert.equal(
        await page.getByTestId('consultant-app-chat-toggle').getAttribute('aria-expanded'),
        'false',
      );
      assert.equal(await page.getByTestId('consultant-reply-size').count(), 0);
      await tap(page.getByTestId('consultant-app-chat-toggle'));
      assert.equal(
        await page.getByTestId('consultant-app-chat-toggle').getAttribute('aria-expanded'),
        'true',
      );
      assert.equal(
        await page.locator('.ai2-chat-body').evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(247, 248, 249)',
      );
      assert.match(
        await page.getByTestId('consultant-example-conversation').innerText(),
        /Что вы хотите узнать/,
      );
      await tap(page.getByTestId('consultant-reply-size'));
      const product = page.getByTestId('consultant-example-product');
      await product.waitFor({ state: 'visible' });
      assert.match(
        await page.getByTestId('consultant-example-conversation').innerText(),
        /В этом примере 42-й размер/,
      );
      await tap(product.getByRole('button', { name: 'Выбрать' }));
      assert.equal(
        await product.getByRole('button', { name: 'Выбрано в примере' }).getAttribute('aria-pressed'),
        'true',
      );
      await tap(page.getByTestId('consultant-demo-channel-chat'));
      assert.equal(await selected(page, 'consultant-demo-channel-chat'), 'true');
      assert.equal(
        await page.getByTestId('consultant-example-conversation').getAttribute('data-demo-channel'),
        'telegram',
      );
      assert.equal(await page.locator('.ai4-telegram-keyboard button').count(), 3);
      assert.equal(await page.getByAltText('Пример фотографии кроссовок Nike').count(), 1);
      const customerCount = await page.locator('.ai4-telegram-messages .ai2-message.is-customer').count();
      await tap(product.getByRole('button', { name: 'Выбрано в примере' }));
      assert.equal(
        await page.locator('.ai4-telegram-messages .ai2-message.is-customer').count(),
        customerCount,
        'inline product action must not send a chat message',
      );
      await tap(product.getByRole('button', { name: 'Выбрать' }));
      await tap(page.getByTestId('consultant-view-business'));
      assert.match(await page.locator('.ai2-story-timeline').innerText(), /нужный размер/);
      if (width === 390) {
        await page.evaluate(() => document.getElementById('root').scrollTo(0, 0));
        await snap(page, '04-business');
      }
      await tap(page.getByTestId('consultant-view-customer'));
      assert.equal(await selected(page, 'consultant-reply-size'), 'true');
      await tap(page.getByTestId('consultant-reply-human'));
      await page.getByText(/Подготовлю обращение специалисту/).waitFor({ state: 'visible' });
      assert.match(
        await page.locator('.ai4-telegram-messages .ai2-message.is-customer').last().innerText(),
        /Нужен специалист/,
        'reply keyboard sends its button text',
      );
      await tap(page.getByTestId('consultant-reply-alternative'));
      await page.getByText(/похожие варианты/i).waitFor({ state: 'visible' });
      await tap(page.getByTestId('consultant-change-industry'));
      await tap(page.getByTestId('consultant-industry-shop'));
      await screen(page, 'demo');
      assert.equal(await selected(page, 'consultant-reply-alternative'), 'true');
      await page.evaluate(() => document.getElementById('root').scrollTo(0, 0));
      if (width === 390) await snap(page, '03-dialogue');
      await tap(page.getByTestId('consultant-demo-continue'));
      await screen(page, 'inside');
      await noOverflow(page);
      assert.equal(
        await page.locator('.ai2-knowledge-card').evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(247, 248, 249)',
      );
      await tap(page.getByTestId('consultant-compare-human'));
      assert.match(await page.getByTestId('consultant-comparison-card').innerText(), /Личный опыт/);
      await tap(page.getByTestId('consultant-compare-ai'));
      assert.match(await page.getByTestId('consultant-comparison-card').innerText(), /Рядом/);
      await page.evaluate(() => document.getElementById('root').scrollTo(0, 0));
      if (width === 390) await snap(page, '05-inside');
      await tap(page.getByTestId('consultant-inside-continue'));
      await screen(page, 'configure');
      await noOverflow(page);
      assert.equal(
        await page.locator('.ai2-channel-card.is-app').evaluate((el) => getComputedStyle(el).backgroundColor),
        'rgb(247, 248, 249)',
      );
      assert.equal(
        await selected(page, 'consultant-channel-chat'),
        'false',
        'viewing a demo must not preselect a project channel',
      );
      await tap(page.getByTestId('consultant-channel-chat'));
      assert.equal(await selected(page, 'consultant-channel-chat'), 'true');
      await tap(page.getByTestId('consultant-both'));
      assert.equal(await selected(page, 'consultant-both'), 'true');
      await tap(page.getByTestId('consultant-task-questions'));
      await tap(page.getByTestId('consultant-task-handoff'));
      await tap(page.getByTestId('consultant-task-booking'));
      await tap(page.getByTestId('consultant-task-booking'));
      assert.equal(await selected(page, 'consultant-task-booking'), 'false');
      assert.match(await page.locator('.ai2-tone-preview').innerText(), /Выберите стиль/);
      await tap(page.getByTestId('consultant-tone-warm'));
      assert.match(await page.locator('.ai2-tone-preview').innerText(), /С удовольствием/);
      await tap(page.getByTestId('consultant-tone-business'));
      assert.equal(await selected(page, 'consultant-tone-business'), 'true');
      await page.locator('#consultant-project-name').fill('A&B — магазин');
      await page.evaluate(() => document.getElementById('root').scrollTo(0, 0));
      if (width === 390) await snap(page, '06-configure');
      if (width === 320) await snap(page, '320-configure');
      await tap(page.getByTestId('consultant-config-continue'));
      await screen(page, 'review');
      await noOverflow(page);
      assert.match(await page.locator('.ai2-summary').innerText(), /В Mini App и Telegram-чате/);
      assert.match(await page.locator('.ai2-summary').innerText(), /Деловой/);
      await tap(page.getByText('Что потребуется для настройки?', { exact: true }));
      assert.ok(await page.getByText(/подготовьте материалы/).isVisible());
      await page.evaluate(() => document.getElementById('root').scrollTo(0, 0));
      if (width === 390) await snap(page, '07-review');
      assert.equal(await page.evaluate(() => window.__requestUrl), null, 'no Telegram link before contact');
      const message = await captureRequest(page, 'consultant-review-contact');
      for (const text of [
        'A&B — магазин',
        'Интернет-магазин',
        'В Mini App и Telegram-чате',
        'Отвечать на вопросы',
        'Передавать специалисту',
        'Деловой',
      ])
        assert.ok(message.includes(text), text);
      assert.ok(!message.includes('Помогать с записью'));
      await tap(page.getByTestId('consultant-review-edit'));
      await screen(page, 'configure');
      assert.equal(await selected(page, 'consultant-both'), 'true');
      assert.equal(await selected(page, 'consultant-task-handoff'), 'true');
      assert.equal(await page.locator('#consultant-project-name').inputValue(), 'A&B — магазин');
      await tap(page.getByTestId('consultant-config-industry'));
      await tap(page.getByTestId('consultant-industry-services'));
      await screen(page, 'configure');
      assert.match(await page.getByTestId('consultant-config-industry').innerText(), /Услуги и запись/);
      assert.equal(await selected(page, 'consultant-both'), 'true');
      await tap(page.getByTestId('consultant-home-link'));
      await screen(page, 'home');
      await tap(page.getByTestId('consultant-show-demo'));
      await screen(page, 'industries');
      await page.getByTestId('nav-ai').tap();
      await screen(page, 'home');
      await tap(page.getByTestId('consultant-open-configure'));
      await screen(page, 'configure');
      await page.getByTestId('nav-showcase').tap();
      await page.waitForFunction(() => window.location.hash === '#/');
      await page.getByTestId('consultant-page').waitFor({ state: 'hidden' });
      await page.getByTestId('nav-ai').tap();
      await page.getByTestId('consultant-page').waitFor({ state: 'visible' });
      await screen(page, 'home');
      await tap(page.getByTestId('consultant-open-configure'));
      await screen(page, 'configure');
      assert.equal(
        await selected(page, 'consultant-both'),
        'true',
        'returning home keeps project preferences',
      );
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}×${height}: end-to-end journey, appearance and request passed`);
    }

    for (const [industry, branches] of [
      [
        'services',
        [
          ['time', '11:00'],
          ['price', 'материалам'],
          ['human', 'контекст записи'],
        ],
      ],
      [
        'restaurant',
        [
          ['menu', 'состав и ограничения'],
          ['delivery', 'какой район'],
          ['human', 'команды ресторана'],
        ],
      ],
      [
        'other',
        [
          ['choice', 'несколько вопросов'],
          ['price', 'согласованным материалам'],
          ['human', 'передам ваш вопрос'],
        ],
      ],
    ]) {
      const { context, page, errors } = await open(browser);
      await tap(page.getByTestId('consultant-show-demo'));
      await tap(page.getByTestId(`consultant-industry-${industry}`));
      await screen(page, 'demo');
      for (const [branch, expected] of branches) {
        await tap(page.getByTestId(`consultant-reply-${branch}`));
        await page
          .getByTestId('consultant-example-conversation')
          .getByText(new RegExp(expected, 'i'))
          .first()
          .waitFor({ state: 'visible' });
        assert.equal(await selected(page, `consultant-reply-${branch}`), 'true');
      }
      assert.equal(await page.getByAltText('Пример фотографии кроссовок Nike').count(), 0);
      await tap(page.getByTestId('consultant-view-business'));
      assert.ok((await page.locator('.ai2-story-timeline').innerText()).length > 100);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${industry}: relevant scenario and business perspective passed`);
    }

    const english = await open(browser, { lang: 'en', route: 'ai-agent' });
    assert.match(await english.page.locator('#consultant-title').innerText(), /AI consultant/);
    assert.match(await english.page.locator('.ai2-hero-copy').innerText(), /Telegram.*app/);
    await tap(english.page.getByTestId('consultant-show-demo'));
    await tap(english.page.getByTestId('consultant-industry-restaurant'));
    await tap(english.page.getByTestId('consultant-reply-delivery'));
    assert.match(await english.page.getByTestId('consultant-example-conversation').innerText(), /delivery/i);
    await tap(english.page.getByTestId('consultant-home-link'));
    const englishMessage = await captureRequest(english.page, 'consultant-contact');
    assert.match(englishMessage, /Restaurant & delivery/);
    assert.deepEqual(english.errors, []);
    await english.context.close();
    console.log('English and alternate route passed');

    const animated = await open(browser, { motion: 'no-preference' });
    await tap(animated.page.getByTestId('consultant-preview-services'));
    assert.equal(
      await animated.page.locator('.ai3-story-question').evaluate((el) => getComputedStyle(el).animationName),
      'ai3-story-in',
    );
    await tap(animated.page.getByTestId('consultant-show-demo'));
    await tap(animated.page.getByTestId('consultant-industry-shop'));
    await animated.page.locator('.ai2-typing').waitFor({ state: 'visible', timeout: 5000 });
    await animated.page.waitForFunction(
      () => {
        const text = document.querySelector('.ai2-message.is-assistant span')?.textContent || '';
        return text.length > 0 && text.length < 25;
      },
      null,
      { timeout: 5000 },
    );
    await tap(animated.page.getByTestId('consultant-skip-typing'));
    await tap(animated.page.getByTestId('consultant-reply-size'));
    await animated.page.locator('.ai2-typing').waitFor({ state: 'visible' });
    await tap(animated.page.getByTestId('consultant-reply-human'));
    await tap(animated.page.getByTestId('consultant-skip-typing'));
    await animated.page
      .getByTestId('consultant-example-conversation')
      .getByText(/Подготовлю обращение специалисту/)
      .waitFor({ state: 'visible' });
    assert.equal(await animated.page.getByTestId('consultant-example-product').count(), 0);
    await tap(animated.page.getByTestId('consultant-replay'));
    await animated.page.locator('.ai2-typing').waitFor({ state: 'visible' });
    await tap(animated.page.getByTestId('consultant-back'));
    await screen(animated.page, 'industries');
    assert.deepEqual(animated.errors, []);
    await animated.context.close();
    console.log('Typing: progressive text, skip, switching and replay passed');

    const native = await open(browser, { native: true });
    await native.page.waitForFunction(() =>
      window.__nativeEvents.some((e) => e.type === 'web_app_setup_main_button' && e.data.is_visible),
    );
    const button = await native.page.evaluate(
      () =>
        window.__nativeEvents
          .filter((e) => e.type === 'web_app_setup_main_button' && e.data.is_visible)
          .at(-1).data,
    );
    assert.equal(button.color.toUpperCase(), '#FFFFFF');
    assert.match(button.text, /Обсудить консультанта/);
    await tap(native.page.getByTestId('consultant-show-demo'));
    await tap(native.page.getByTestId('consultant-industry-shop'));
    await native.page.waitForTimeout(100);
    await native.page.evaluate(() => window.TelegramGameProxy_receiveEvent('back_button_pressed'));
    await screen(native.page, 'industries');
    await native.page.evaluate(() => window.TelegramGameProxy_receiveEvent('back_button_pressed'));
    await screen(native.page, 'home');
    await native.page.evaluate(() => window.TelegramGameProxy_receiveEvent('main_button_pressed'));
    await native.page.waitForFunction(() =>
      window.__nativeEvents.some((e) => e.type === 'web_app_open_tg_link'),
    );
    const path = await native.page.evaluate(
      () => window.__nativeEvents.find((e) => e.type === 'web_app_open_tg_link').data.path_full,
    );
    const nativeUrl = new URL(`https://t.me${path}`);
    assert.equal(nativeUrl.pathname, '/web4tgs');
    assert.match(nativeUrl.searchParams.get('text'), /Интернет-магазин/);
    await native.page.evaluate(() => {
      window.location.hash = '#/ai-agent';
    });
    const visibleConsultant = native.page.locator('[data-testid="consultant-page"]:visible');
    await visibleConsultant.waitFor({ state: 'visible' });
    await tap(visibleConsultant.getByTestId('consultant-show-demo'));
    await tap(visibleConsultant.getByTestId('consultant-industry-services'));
    await native.page.waitForTimeout(200);
    await native.page.evaluate(() => window.TelegramGameProxy_receiveEvent('back_button_pressed'));
    await native.page.waitForFunction(() =>
      [...document.querySelectorAll('[data-testid="consultant-page"]')].some(
        (el) => el.getClientRects().length && el.getAttribute('data-consultant-screen') === 'industries',
      ),
    );
    await tap(visibleConsultant.getByTestId('consultant-industry-services'));
    const countBefore = await native.page.evaluate(
      () => window.__nativeEvents.filter((e) => e.type === 'web_app_open_tg_link').length,
    );
    await native.page.evaluate(() => window.TelegramGameProxy_receiveEvent('main_button_pressed'));
    await native.page.waitForFunction(
      (n) => window.__nativeEvents.filter((e) => e.type === 'web_app_open_tg_link').length > n,
      countBefore,
    );
    const links = await native.page.evaluate(() =>
      window.__nativeEvents.filter((e) => e.type === 'web_app_open_tg_link'),
    );
    assert.equal(links.length, countBefore + 1, 'only the visible consultant handles the native action');
    assert.match(
      new URL(`https://t.me${links.at(-1).data.path_full}`).searchParams.get('text'),
      /Услуги и запись/,
    );
    assert.deepEqual(native.errors, []);
    await native.context.close();
    console.log('Native Telegram: button color, back and draft passed');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
