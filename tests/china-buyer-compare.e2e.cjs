const { assert, run, open, widthOK, btn } = require('./buyer-test-helpers.cjs');
run('comparison, single combined brief and legacy records', async (browser) => {
  const old = {
    id: 'old-001',
    createdAt: '2025-02-01T12:00:00Z',
    updatedAt: '2025-02-01T12:00:00Z',
    category: 'Обувь',
    description: 'Старая заявка на обувь',
    url: '',
    quantity: '2',
    size: '42',
    color: '',
    budget: '8500',
  };
  const {
    context,
    page: p,
    nav,
    errors,
  } = await open(browser, {
    width: 320,
    seed: {
      'china-buyer-favorites-v1': ['sneaker', 'bad-id'],
      'china-buyer-demo-requests-v1': [old],
    },
  });
  try {
    await btn(nav, 'Моё').click();
    await p.getByText('Старая заявка на обувь').click();
    assert.match(await p.locator('.yb-brief-facts').innerText(), /42/);
    await btn(nav, 'Образцы').click();
    await btn(p, 'Избранное').click();
    assert.equal(await p.locator('.yb-grid article').count(), 1);
    await p.getByTestId('buyer-item-sneaker').waitFor();
    await btn(p, 'Избранное').click();
    for (const id of ['fold', 'arc', 'clay', 'v5-feature'])
      await p
        .getByTestId('buyer-item-' + id)
        .locator('.yb-compare-icon')
        .click();
    await p
      .getByText('На сравнении уже три образца.', { exact: false })
      .waitFor();
    await btn(p, 'Закрыть').click();
    await p.getByRole('button', { name: 'Сравнить образцы' }).click();
    assert.equal(await p.locator('.yb-comparison th').count(), 3);
    await widthOK(p);
    await btn(p, 'Убрать Лампа Arc').click();
    await p.reload();
    await p.locator('.yb-comparison th').first().waitFor();
    assert.equal(await p.locator('.yb-comparison th').count(), 2);
    await btn(p, 'Собрать один запрос').click();
    await p.locator('#cbw-description').fill('Цвет от сумки, форма от чайника');
    await p.locator('#cbw-quantity').fill('3');
    await btn(p, 'Проверить запрос').click();
    await btn(p, 'Сохранить запрос').click();
    await p.locator('.yb-saved-label').waitFor();
    const records = await p.evaluate(() =>
      JSON.parse(localStorage.getItem('china-buyer-demo-requests-v1')),
    );
    assert.equal(records.length, 2);
    assert.deepEqual(records[0].sampleIds, ['fold', 'clay']);
    assert.equal(records[1].id, old.id);
    await btn(p, 'Редактировать').click();
    await p.locator('#cbw-budget').fill('12000');
    await btn(p, 'Проверить запрос').click();
    await btn(p, 'Сохранить запрос').click();
    await p.locator('.yb-saved-label').waitFor();
    assert.equal(
      await p.evaluate(
        () =>
          JSON.parse(localStorage.getItem('china-buyer-demo-requests-v1'))
            .length,
      ),
      2,
    );
    await btn(p, 'Удалить запрос').click();
    await btn(p, 'Отмена').click();
    await btn(p, 'Удалить запрос').click();
    await btn(p, 'Удалить').click();
    await p.getByText('Старая заявка на обувь').waitFor();
    await nav.getByTestId('demo-return-web4tg').click();
    await p.waitForURL((url) => !url.hash.includes('china-buyer'));
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
