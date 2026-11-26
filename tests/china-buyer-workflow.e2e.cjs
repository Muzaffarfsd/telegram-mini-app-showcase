const {
  assert,
  run,
  open,
  widthOK,
  btn,
  photo,
} = require('./buyer-test-helpers.cjs');
run(
  'photo and link briefs, validation, draft recovery and storage failure',
  async (browser, blocked) => {
    const {
      context,
      page: p,
      nav,
      errors,
    } = await open(browser, { width: 390, ru: false, blocked });
    try {
      const chooser = p.waitForEvent('filechooser');
      await btn(p, 'Use a photo').click();
      await (await chooser).setFiles(photo);
      await p.getByAltText('Attached photo').waitFor();
      await btn(p, 'Remove photo').click();
      await btn(nav, 'Bureau').click();
      await btn(p, 'Use a link').click();
      await p.locator('#cbw-url').waitFor();
      assert.ok(
        await p
          .locator('#cbw-url')
          .evaluate((el) => el === document.activeElement),
      );
      await btn(p, 'Review brief').click();
      await p.getByRole('alert').waitFor();
      await p.locator('#cbw-url').fill('javascript:bad');
      await btn(p, 'Review brief').click();
      assert.match(await p.getByRole('alert').innerText(), /full page address/);
      await p.locator('#cbw-url').fill('https://example.com/a');
      await p.locator('#cbw-quantity').fill('0');
      await btn(p, 'Review brief').click();
      assert.match(await p.getByRole('alert').innerText(), /quantity/);
      await p.locator('#cbw-quantity').fill('1');
      await p.locator('#cbw-budget').fill('0');
      await btn(p, 'Review brief').click();
      assert.match(await p.getByRole('alert').innerText(), /rouble/);
      await p.locator('#cbw-budget').fill('');
      await btn(p, 'Review brief').click();
      await p.locator('.yb-source').waitFor();
      assert.equal(
        await p.locator('.yb-source').getAttribute('href'),
        'https://example.com/a',
      );
      await btn(p, 'Edit').click();
      await p.locator('#cbw-url').fill('');
      const file = p.getByTestId('buyer-photo-input');
      await file.setInputFiles({
        name: 'broken.png',
        mimeType: 'image/png',
        buffer: Buffer.from('broken'),
      });
      await p
        .getByText('Could not open this file.', { exact: false })
        .waitFor();
      await file.setInputFiles(photo);
      await p.getByAltText('Attached photo').waitFor();
      await btn(p, 'Remove photo').click();
      await file.setInputFiles(photo);
      await p.getByAltText('Attached photo').waitFor();
      await p.reload();
      await p.getByAltText('Attached photo').waitFor();
      await btn(p, 'Review brief').click();
      await p.getByAltText('Brief attachment').waitFor();
      await btn(p, 'Save brief').click();
      await p.locator('.yb-saved-label').waitFor();
      assert.match(
        await p.locator('.yb-saved-label').innerText(),
        blocked ? /This session/ : /Saved on this device/,
      );
      if (blocked) {
        await p
          .getByText('Device storage is unavailable.', { exact: false })
          .waitFor();
      } else {
        await p.reload();
        await p.getByAltText('Brief attachment').waitFor();
        assert.match(
          await p.locator('.yb-attachment').getAttribute('src'),
          /^data:image\/jpeg;base64,/,
        );
      }
      await btn(nav, 'My desk').click();
      await p.locator('.yb-records button').first().click();
      await p.getByAltText('Brief attachment').waitFor();
      await widthOK(p);
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
    }
  },
  [false, true],
);
