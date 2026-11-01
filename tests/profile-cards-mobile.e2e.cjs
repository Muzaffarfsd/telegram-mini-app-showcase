const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const site = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:5000/';
const profile = new URL('/#/profile', site).href;

async function open(browser, { width = 390, language = 'ru', failArtwork = false, withUser = false } = {}) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: language === 'ru' ? 'ru-RU' : 'en-US',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  });
  await context.addInitScript(
    ({ lang, hasUser }) => {
      localStorage.setItem('app-language', lang);
      if (hasUser) {
        const user = { id: 12345, first_name: 'Мария', username: 'maria', language_code: lang };
        sessionStorage.setItem(
          '__telegram__initParams',
          JSON.stringify({
            tgWebAppData: 'user=' + encodeURIComponent(JSON.stringify(user)),
            tgWebAppVersion: '9.0',
            tgWebAppPlatform: 'ios',
          }),
        );
      }
    },
    { lang: language, hasUser: withUser },
  );
  await context.route('https://telegram.org/js/telegram-web-app.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  );
  if (failArtwork) {
    await context.route(/(?:projects|invite|rewards|tasks)-v1[^/]*\.webp(?:\?.*)?$/, (route) =>
      route.request().resourceType() === 'image' ? route.abort() : route.continue(),
    );
  }
  if (withUser) {
    await context.route('**/api/user-projects/12345', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Мой магазин', status: 'В разработке', progress: 40 },
          { id: 2, name: 'Готовое приложение', status: 'Готово', progress: 100 },
        ]),
      }),
    );
    await context.route('**/api/referrals/stats/12345', (route) =>
      route.fulfill({ contentType: 'application/json', body: '{"referralCode":"WEB4TGSELF"}' }),
    );
  }
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(profile, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('profile-page').waitFor();
  return { context, page, errors };
}

function overlaps(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [width, language] of [
      [320, 'ru'],
      [390, 'ru'],
      [430, 'ru'],
      [320, 'en'],
      [390, 'en'],
    ]) {
      const { context, page, errors } = await open(browser, { width, language });
      await page.locator('.profile-perks-grid').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => {
        const images = [
          ...document.querySelectorAll(
            '.profile-project-art, .profile-referral-feature img, .profile-perk-card img',
          ),
        ];
        return images.length === 4 && images.every((image) => image.complete && image.naturalWidth > 0);
      });
      for (const id of ['profile-referral-program', 'profile-rewards', 'profile-earning']) {
        const box = await page.getByTestId(id).boundingBox();
        assert.ok(box.width >= 44 && box.height >= 44, `${id} is a touch-sized target`);
      }
      for (const card of await page.locator('.profile-perk-card').all()) {
        const image = await card.locator('img').boundingBox();
        for (const label of await card
          .locator('.profile-perk-copy strong, .profile-perk-copy > span')
          .all()) {
          const text = await label.boundingBox();
          assert.equal(overlaps(text, image), false, `art and text overlap at ${width}px in ${language}`);
        }
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.deepEqual(errors, []);
      await context.close();
      console.log(`${width}px ${language}: card artwork, touch targets and text layout passed`);
    }

    const { context, page, errors } = await open(browser);
    for (const [id, hash] of [
      ['profile-referral-program', '#/referral'],
      ['profile-rewards', '#/rewards'],
      ['profile-earning', '#/earning'],
    ]) {
      await page.getByTestId(id).tap();
      await page.waitForFunction((expected) => location.hash === expected, hash);
      await page.getByTestId('nav-profile').tap();
      await page.waitForFunction(() => location.hash === '#/profile');
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log('Profile cards: destinations and return navigation passed');

    const member = await open(browser, { withUser: true });
    await member.page.getByText('Мой магазин').waitFor();
    assert.match(await member.page.locator('.profile-stats').innerText(), /2[\s\S]*1[\s\S]*1/);
    await member.page.getByText('Мой магазин').tap();
    assert.equal(await member.page.getByRole('progressbar', { name: 'Готовность: 40%' }).isVisible(), true);
    await member.page.locator('.profile-project-list-heading button').tap();
    await member.page.waitForFunction(() => location.hash === '#/constructor');
    assert.deepEqual(member.errors, []);
    await member.context.close();
    console.log('Existing projects: actual counts, project details and add action passed');

    const blocked = await open(browser, { failArtwork: true });
    await blocked.page.locator('.profile-perks-grid').scrollIntoViewIfNeeded();
    await blocked.page.waitForFunction(() => {
      const images = [
        ...document.querySelectorAll(
          '.profile-project-art, .profile-referral-feature img, .profile-perk-card img',
        ),
      ];
      return images.length === 4 && images.every((image) => image.complete && image.naturalWidth === 0);
    });
    const invisible = await blocked.page
      .locator('.profile-project-art, .profile-referral-feature img, .profile-perk-card img')
      .evaluateAll((images) => images.every((image) => getComputedStyle(image).visibility === 'hidden'));
    assert.equal(invisible, true, 'failed artwork does not leave broken-image placeholders');
    await blocked.page.getByTestId('profile-rewards').tap();
    await blocked.page.waitForFunction(() => location.hash === '#/rewards');
    assert.deepEqual(blocked.errors, []);
    await blocked.context.close();
    console.log('Artwork failure: readable cards and navigation remain available');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
