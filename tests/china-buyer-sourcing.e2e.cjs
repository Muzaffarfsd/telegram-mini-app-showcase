const { assert, run, open, widthOK, btn } = require('./buyer-test-helpers.cjs');

run(
  'CIS delivery, multilingual handoff and supplier quotes',
  async (browser) => {
    const { context, page, nav, errors } = await open(browser);
    const country = () => page.getByLabel('Страна доставки', { exact: true });
    const offers = page.getByRole('region', {
      name: 'Предложения поставщиков',
    });
    const cards = offers.locator('article');
    async function offer(supplier, unit, extras) {
      await btn(offers, 'Добавить предложение').click();
      const form = offers.locator('form');
      assert.equal(
        await form.getByLabel('Валюта предложения').inputValue(),
        'KZT',
      );
      assert.equal(
        await form.getByLabel('Количество в предложении').inputValue(),
        '30',
      );
      await form
        .getByLabel('Поставщик или название предложения')
        .fill(supplier);
      await form.getByLabel('Цена за штуку').fill(unit);
      for (const [name, value] of Object.entries(extras))
        await form.getByLabel(name, { exact: true }).fill(value);
      await btn(form, 'Сохранить предложение').click();
      await form.waitFor({ state: 'hidden' });
    }
    try {
      assert.equal(await country().inputValue(), '');
      assert.equal(await country().locator('option').count(), 11);
      await country().selectOption('KZ');
      await btn(page, 'Открыть пример запроса на 30 рюкзаков').click();
      assert.equal(
        await btn(page, 'Для бизнеса').getAttribute('aria-pressed'),
        'true',
      );
      assert.equal(await page.locator('#cbw-quantity').inputValue(), '30');
      assert.equal(await country().inputValue(), 'KZ');
      assert.equal(await page.getByLabel('Валюта бюджета').inputValue(), 'KZT');
      assert.equal(await page.locator('#cbw-city').inputValue(), '');
      await page.locator('#cbw-city').fill('Алматы');
      await page.locator('#cbw-budget').fill('100000');
      await page
        .locator('#cbw-description')
        .fill('Нужны усиленные швы и образец.');
      await btn(page, 'Проверить запрос').click();
      await btn(page, 'Сохранить запрос').click();
      assert.match(
        await page.locator('.yb-brief-facts').innerText(),
        /Казахстан\s+Город доставки\s+Алматы/,
      );
      await page.evaluate(() =>
        Object.defineProperty(navigator, 'share', {
          configurable: true,
          value: async (payload) => {
            window.testBuyerMessage = payload.text;
          },
        }),
      );
      await btn(page, 'Передать байеру').click();
      const language = page.getByLabel('Язык шаблона');
      await language.selectOption('zh');
      await page.locator('.yb-handoff summary').click();
      const message = await page.getByLabel('Текст для байера').inputValue();
      for (const part of [
        '商业采购',
        '通勤双肩包',
        '30',
        'KZT',
        'Алматы',
        'Нужны усиленные швы',
        '/sourcing/products/inspection-backpack/front.webp',
      ])
        assert.ok(message.includes(part), part);
      assert.equal(
        await page.evaluate(() => window.testBuyerMessage),
        undefined,
      );
      await btn(page, 'Поделиться текстом').click();
      assert.equal(await page.evaluate(() => window.testBuyerMessage), message);
      await language.selectOption('en');
      assert.match(
        await page.getByLabel('Текст для байера').inputValue(),
        /minimum order quantity/,
      );
      await offer('Поставщик A', '1000', {
        'Доставка партии': '2000',
        'Услуги байера': '1000',
        'Прочие расходы': '0',
      });
      const compact = (txt) => txt.replace(/\s/g, '');
      assert.ok(compact(await cards.first().innerText()).includes('33000₸'));
      assert.ok(compact(await cards.first().innerText()).includes('1100₸/шт.'));
      await offer('Поставщик B', '900', {});
      assert.ok(compact(await cards.nth(1).innerText()).includes('27000₸'));
      assert.match(await cards.nth(1).innerText(), /Известная сумма/);
      assert.equal(
        await cards.nth(1).getByText('Уточнить', { exact: true }).count(),
        3,
      );
      await btn(offers, 'Изменить предложение Поставщик B').click();
      await offers.getByLabel('Валюта предложения').selectOption('CNY');
      await offers.getByLabel('Цена за штуку', { exact: true }).fill('19,50');
      await btn(offers, 'Сохранить предложение').click();
      assert.ok(compact(await cards.nth(1).innerText()).includes('585CNY'));
      await btn(page, 'Редактировать').click();
      await page.locator('#cbw-quantity').fill('40');
      await btn(page, 'Проверить запрос').click();
      await btn(page, 'Сохранить запрос').click();
      await page.reload();
      await cards.nth(1).waitFor();
      assert.match(await cards.nth(1).innerText(), /30 шт\./);
      await btn(offers, 'Удалить предложение Поставщик B').click();
      await btn(cards.nth(1), 'Отмена').click();
      await btn(offers, 'Удалить предложение Поставщик B').click();
      await btn(cards.nth(1), 'Удалить').click();
      assert.equal(await cards.count(), 1);
      await btn(nav, 'Бюро').click();
      assert.equal(await country().inputValue(), 'KZ');
      await country().selectOption('UZ');
      await btn(page, 'Описать товар').click();
      assert.equal(await country().inputValue(), 'UZ');
      assert.equal(await page.getByLabel('Валюта бюджета').inputValue(), 'UZS');
      await btn(page, 'Для себя').click();
      assert.equal(
        await btn(page, 'Для себя').getAttribute('aria-pressed'),
        'true',
      );
      await widthOK(page);
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  },
);
