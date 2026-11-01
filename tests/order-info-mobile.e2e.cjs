const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const site = process.env.ORDER_TEST_URL || 'http://127.0.0.1:53721/';
const text = value => value.replace(/\s+/g, ' ').trim();

async function open(browser, { width = 390, height = 844, language = 'ru', native = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: language === 'ru' ? 'ru-RU' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(({ language, native }) => {
    localStorage.setItem('app-language', language);
    if (native) {
      const user = { id: 12345, first_name: 'Maria', username: 'maria', language_code: language };
      sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppData: `user=${encodeURIComponent(JSON.stringify(user))}`, tgWebAppVersion: '9.0', tgWebAppPlatform: 'android' }));
      window.__nativeEvents = [];
      window.TelegramWebviewProxy = { postEvent(type, data) { window.__nativeEvents.push({ type, data: data ? JSON.parse(data) : {} }); } };
    }
  }, { language, native });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(new URL('/#/constructor', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('order-page').waitFor({ timeout: 30000 });
  return { context, page, errors };
}

async function tap(locator) {
  await locator.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await locator.tap();
}

async function closeSheet(page) {
  await page.locator('.order-info-close').tap();
  await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
}

async function acceptSheet(page) {
  await page.getByTestId('order-info-action').tap();
  await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
}

async function swipeHandle(page, distance) {
  const handle = page.locator('.order-info-handle-area');
  const box = await handle.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const event = { pointerId: 7, pointerType: 'touch', isPrimary: true, button: 0, clientX: x, clientY: y };
  await handle.dispatchEvent('pointerdown', event);
  await handle.dispatchEvent('pointermove', { ...event, clientY: y + distance });
  await handle.dispatchEvent('pointerup', { ...event, clientY: y + distance });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, height] of [[320, 568], [390, 844], [430, 932]]) {
      const { context, page, errors } = await open(browser, { width, height });
      if (width === 320) await page.evaluate(() => document.documentElement.style.setProperty('--csab', '24px'));
      for (const id of ['ecommerce-basic', 'restaurant', 'fitness-center', 'services']) {
        const selection = page.getByTestId(`template-${id}`);
        assert.equal(await selection.getAttribute('aria-pressed'), 'false');
        const infoButton = page.getByTestId(`template-info-${id}`);
        const target = await infoButton.boundingBox();
        assert.ok(target.width >= 44 && target.height >= 44);
        await tap(infoButton);
        const sheet = page.getByTestId('order-info-sheet');
        assert.equal(await sheet.getAttribute('aria-modal'), 'true');
        assert.equal(await page.locator('#root').evaluate(el => el.inert), true);
        assert.equal(await selection.getAttribute('aria-pressed'), 'false');
        assert.ok((await sheet.locator('.order-info-description').innerText()).length > 50);
        assert.ok(await sheet.locator('.order-info-includes li').count() >= 3);
        assert.equal(await sheet.locator('img').evaluate(async img => { try { await img.decode(); return img.naturalWidth > 0; } catch { return false; } }), true);
        const footer = await sheet.locator('.order-info-action').boundingBox();
        assert.ok(footer.y >= 0 && footer.y + footer.height <= height);
        if (width === 320) assert.ok(await sheet.locator('.order-info-footer').evaluate(el => parseFloat(getComputedStyle(el).paddingBottom)) >= 40);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await swipeHandle(page, 160);
        await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
        assert.equal(await page.locator('#root').evaluate(el => el.inert), false);
        assert.equal(await selection.getAttribute('aria-pressed'), 'false');
      }
      await tap(page.getByTestId('template-info-ecommerce-basic'));
      await acceptSheet(page);
      assert.equal(await page.getByTestId('template-ecommerce-basic').getAttribute('aria-pressed'), 'true');
      await tap(page.getByTestId('order-continue'));
      assert.match(text(await page.getByTestId('order-running-total').innerText()), /150 000/);
      await tap(page.getByTestId('feature-info-search'));
      assert.match(text(await page.locator('.order-info-price').innerText()), /20 000/);
      assert.equal(await page.getByTestId('feature-search').getAttribute('aria-pressed'), 'false');
      await acceptSheet(page);
      assert.equal(await page.getByTestId('feature-search').getAttribute('aria-pressed'), 'true');
      assert.match(text(await page.getByTestId('order-running-total').innerText()), /170 000/);
      await tap(page.getByTestId('feature-info-search'));
      assert.equal(await page.getByTestId('order-info-action').innerText(), 'Убрать из заказа');
      await acceptSheet(page);
      assert.match(text(await page.getByTestId('order-running-total').innerText()), /150 000/);
      assert.deepEqual(errors, []);
      if (width !== 390) {
        if (width === 320) {
          let checkedTitles = 0;
          for (const group of await page.locator('.order-group').all()) {
            if (!await group.evaluate(el => el.open)) await tap(group.locator('summary'));
            for (const infoButton of await group.locator('[data-testid^="feature-info-"]').all()) {
              await tap(infoButton);
              const title = page.locator('#order-info-title');
              assert.equal(await title.evaluate(el => el.scrollWidth <= el.clientWidth), true, await title.innerText());
              await closeSheet(page);
              checkedTitles++;
            }
          }
          assert.equal(checkedTitles, 37);
        }
        await tap(page.getByTestId('order-continue'));
        await tap(page.locator('.order-support > summary'));
        await tap(page.getByTestId('plan-info-standard'));
        await page.evaluate(() => document.fonts.ready);
        const titleLines = await page.locator('#order-info-title').evaluate(el => { const range = document.createRange(); range.selectNodeContents(el); return range.getClientRects().length; });
        assert.equal(titleLines, 1, 'The single word Стандартный must not split across lines');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await closeSheet(page);
        await context.close();
        console.log(`${width}×${height}: descriptions, touch targets, title wrapping and selection passed`); continue;
      }

      let count = 0;
      for (const group of await page.locator('.order-group').all()) {
        if (!await group.evaluate(el => el.open)) await tap(group.locator('summary'));
        for (const infoButton of await group.locator('[data-testid^="feature-info-"]').all()) {
          count++;
          const id = (await infoButton.getAttribute('data-testid')).replace('feature-info-', '');
          const feature = page.getByTestId(`feature-${id}`);
          const wasSelected = await feature.getAttribute('aria-pressed');
          const expectedPrice = text(await feature.locator('.order-feature-price').innerText());
          const bounds = await infoButton.boundingBox();
          assert.ok(bounds.width >= 44 && bounds.height >= 44, id);
          await tap(infoButton);
          const sheet = page.getByTestId('order-info-sheet');
          assert.equal(await sheet.locator('h2').innerText(), await feature.locator('.order-feature-name').innerText());
          assert.ok((await sheet.locator('.order-info-description').innerText()).length > 35, id);
          assert.ok((await sheet.locator('.order-info-example p').innerText()).length > 25, id);
          assert.ok(text(await sheet.locator('.order-info-price').innerText()).includes(expectedPrice), id);
          assert.equal(await sheet.locator('img').evaluate(async img => { try { await img.decode(); return img.naturalWidth > 0; } catch { return false; } }), true, id);
          await closeSheet(page);
          assert.equal(await feature.getAttribute('aria-pressed'), wasSelected, id);
        }
      }
      assert.equal(count, 37);
      await tap(page.getByTestId('feature-info-payments'));
      assert.match(await page.locator('.order-info-price').innerText(), /Включено/);
      assert.match(await page.locator('.order-info-note').first().innerText(), /комиссии/);
      await acceptSheet(page);
      assert.match(text(await page.getByTestId('order-running-total').innerText()), /150 000/);
      await tap(page.getByTestId('feature-info-subscriptions'));
      assert.match(await page.locator('.order-info-note').first().innerText(), /функция для клиентов вашего приложения/i);
      assert.match(await page.locator('.order-info-note').first().innerText(), /поддержка вашего приложения/i);
      await closeSheet(page);
      await tap(page.getByTestId('feature-info-ai-chatbot'));
      await acceptSheet(page);
      assert.match(text(await page.getByTestId('order-running-total').innerText()), /199 000/);
      await tap(page.getByTestId('order-continue'));
      await tap(page.locator('.order-support > summary'));
      const plans = [
        { id: 'minimal', monthly: '9 900', annual: '99 000', saving: '19 800', count: 4, backup: /месяц/i },
        { id: 'standard', monthly: '14 900', annual: '149 000', saving: '29 800', count: 7, backup: /недел/i },
        { id: 'premium', monthly: '24 900', annual: '249 000', saving: '49 800', count: 11, backup: /каждый день/i },
      ];
      for (const { id, monthly, annual, saving, count: benefitCount, backup } of plans) {
        await tap(page.getByRole('button', { name: 'В месяц', exact: true }));
        await tap(page.getByTestId(`plan-info-${id}`));
        const planArt = page.locator('.order-info-art img');
        assert.match(await planArt.getAttribute('src'), /info-subscription-v1/);
        assert.equal(await planArt.evaluate(async img => { try { await img.decode(); return img.naturalWidth > 0; } catch { return false; } }), true);
        assert.equal(await page.locator('.order-info-includes li').count(), benefitCount);
        assert.equal(await page.locator('.order-info-includes li small').count(), benefitCount);
        assert.match(await page.locator('.order-info-includes').innerText(), backup);
        assert.match(text(await page.getByTestId('info-billing-monthly').innerText()), new RegExp(monthly));
        assert.match(text(await page.getByTestId('info-billing-annual').innerText()), new RegExp(annual));
        assert.match(text(await page.locator('.order-info-billing > p').innerText()), new RegExp(saving));
        assert.match(text(await page.locator('.order-info-price').innerText()), new RegExp(`${monthly} ₽/мес`));
        await tap(page.getByTestId('info-billing-annual'));
        assert.equal(await page.getByTestId('info-billing-annual').getAttribute('aria-pressed'), 'true');
        assert.match(text(await page.locator('.order-info-price').innerText()), new RegExp(`${annual} ₽/год`));
        assert.equal(await page.getByTestId(`order-plan-${id}`).getAttribute('aria-pressed'), 'false');
        await closeSheet(page);
        assert.equal(await page.getByRole('button', { name: 'В год', exact: true }).getAttribute('aria-pressed'), 'true');
      }
      await tap(page.getByRole('button', { name: 'В год', exact: true }));
      await tap(page.getByTestId('plan-info-standard'));
      assert.match(text(await page.locator('.order-info-price').innerText()), /149 000 ₽\/год/);
      await acceptSheet(page);
      assert.equal(await page.getByTestId('order-plan-standard').getAttribute('aria-pressed'), 'true');
      await page.evaluate(() => { window.__openedOrderUrl = null; window.open = url => { window.__openedOrderUrl = url; }; if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink = url => { window.__openedOrderUrl = url; }; });
      await tap(page.getByTestId('order-continue'));
      const draft = new URL(await page.evaluate(() => window.__openedOrderUrl)).searchParams.get('text');
      assert.match(draft, /AI Чат-бот/); assert.match(text(draft), /199 000 ₽/); assert.match(text(draft), /149 000 ₽\/год/);
      assert.deepEqual(errors, []);
      await context.close();
      console.log('390px: all 37 feature descriptions, dynamic prices, support plans and Telegram draft passed');
    }

    {
      const { context, page, errors } = await open(browser, { language: 'en' });
      await tap(page.getByTestId('template-info-ecommerce-basic'));
      assert.equal(await page.locator('#order-info-title').innerText(), 'Online Store');
      assert.match(await page.locator('.order-info-description').innerText(), /Telegram app/);
      await acceptSheet(page);
      await tap(page.getByTestId('order-continue'));
      await tap(page.getByTestId('feature-info-search'));
      assert.match(await page.locator('.order-info-example').innerText(), /customer/i);
      await page.keyboard.press('Escape');
      await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
      assert.equal(await page.getByTestId('order-info-sheet').count(), 0);
      assert.equal(await page.getByTestId('feature-search').getAttribute('aria-pressed'), 'false');
      await tap(page.getByTestId('order-continue'));
      await tap(page.locator('.order-support > summary'));
      await tap(page.getByTestId('plan-info-standard'));
      assert.equal(await page.locator('#order-info-title').innerText(), 'Standard');
      assert.match(await page.locator('.order-info-billing').innerText(), /Monthly/);
      assert.match(await page.locator('.order-info-billing').innerText(), /Yearly/);
      assert.match(await page.locator('.order-info-includes').innerText(), /Weekly Backups/);
      await tap(page.getByTestId('info-billing-annual'));
      assert.match(text(await page.locator('.order-info-price').innerText()), /149 000 ₽\/year/);
      await acceptSheet(page);
      assert.equal(await page.getByTestId('order-plan-standard').getAttribute('aria-pressed'), 'true');
      assert.deepEqual(errors, []);
      await context.close();
      console.log('English: descriptions, selection and dismissal passed');
    }

    {
      const { context, page, errors } = await open(browser, { native: true });
      const pressNative = () => page.evaluate(() => window.TelegramGameProxy_receiveEvent('main_button_pressed'));
      const latestButton = () => page.evaluate(() => window.__nativeEvents.filter(e => e.type === 'web_app_setup_main_button').at(-1)?.data);
      await page.waitForFunction(() => window.__nativeEvents.some(e => e.type === 'web_app_setup_main_button' && e.data.is_visible));
      await tap(page.getByTestId('template-info-services'));
      await page.waitForFunction(() => window.__nativeEvents.filter(e => e.type === 'web_app_setup_main_button').at(-1)?.data.is_visible === false);
      await pressNative();
      assert.equal(await page.getByTestId('order-page').getAttribute('data-order-step'), '1');
      await acceptSheet(page);
      await page.waitForFunction(() => window.__nativeEvents.filter(e => e.type === 'web_app_setup_main_button').at(-1)?.data.is_visible === true);
      assert.equal((await latestButton()).text, 'Продолжить');
      await pressNative();
      await page.waitForFunction(() => document.querySelector('[data-testid="order-page"]')?.dataset.orderStep === '2');
      await tap(page.getByTestId('feature-info-search'));
      await page.locator('.order-info-backdrop').tap({ position: { x: 8, y: 8 } });
      await page.getByTestId('order-info-sheet').waitFor({ state: 'detached' });
      assert.equal(await page.getByTestId('order-info-sheet').count(), 0);
      assert.equal(await page.getByTestId('feature-search').getAttribute('aria-pressed'), 'false');
      await pressNative();
      await page.waitForFunction(() => document.querySelector('[data-testid="order-page"]')?.dataset.orderStep === '3');
      assert.deepEqual(errors, []);
      await context.close();
      console.log('Telegram bridge: native button hidden while sheet is open and restored after dismissal');
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
