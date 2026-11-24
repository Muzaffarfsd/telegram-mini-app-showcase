const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.HOME_TEST_URL || 'http://127.0.0.1:53734/';

async function run(browserType, name, width, height, language = 'ru') {
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: language === 'ru' ? 'ru-RU' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.addInitScript(lang => { localStorage.setItem('app-language', lang); localStorage.setItem('app-theme', 'dark'); }, language);
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    const home = page.getByTestId('home-page');
    await home.waitFor();
    const stableBeforeMenuStyles = await home.evaluate(el => {
      const sheet = Array.from(document.querySelectorAll('style')).find(style => style.textContent.includes('.w4m-panel.open') && style.textContent.includes('.hb-btn'))?.sheet;
      if (!sheet) return false;
      sheet.disabled = true;
      try {
        return ['.w4m-panel', '.w4m-overlay', '.w4-topbar'].every(selector => getComputedStyle(document.querySelector(selector)).position === 'fixed')
          && el.querySelector('[data-testid="home-start-order"]').getBoundingClientRect().bottom < innerHeight;
      } finally { sheet.disabled = false; }
    });
    assert.equal(stableBeforeMenuStyles, true, 'the sidebar must not push primary actions below the first viewport');
    await page.getByRole('button', { name: 'Chat with Alex' }).waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await home.locator('h1').evaluate(el => getComputedStyle(el).fontFamily.includes('Google Sans App')), true, 'the home must use the agreed font');
    assert.equal(await page.evaluate(() => document.fonts.check('16px "Google Sans App"', 'Бизнес')), true, 'the Cyrillic font must actually load');
    assert.equal(await home.evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'home should be white in a dark Telegram theme');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'home must fit the screen width');
    assert.equal(await home.locator('.home-demo__art img').evaluate(el => getComputedStyle(el).animationName), 'none', 'reduced motion should be respected');
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.home-demo__art img')).every(el => el.complete && el.naturalWidth > 0));

    if (width === 390 && language === 'ru' && name === 'Chromium') {
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const violations = await home.evaluate(async el => (await window.axe.run(el, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })));
      assert.deepEqual(violations, [], 'home accessibility');
      await page.getByRole('button', { name: 'Chat with Alex' }).tap();
      const chat = page.getByTestId('ai-chat-panel');
      await chat.getByRole('textbox', { name: 'Сообщение' }).tap();
      await chat.getByRole('button', { name: 'Close', exact: true }).tap();
      await chat.waitFor({ state: 'hidden' });
    }

    const primary = home.getByRole('button', { name: language === 'ru' ? 'Смотреть витрину' : 'Explore apps', exact: true });
    const order = home.getByTestId('home-start-order');
    for (const action of [primary, order]) {
      const box = await action.boundingBox();
      assert.ok(box && box.y >= 0 && box.y + box.height <= height - 70, 'primary actions are visible on entry');
    }
    const gallery = home.getByTestId('home-exhibit');
    const topics = gallery.locator('.home-demo__projects button');
    const screens = gallery.locator('.home-demo__switch button');
    assert.equal(await topics.count(), 6);
    await topics.last().tap();
    await screens.last().tap();
    assert.equal(await topics.last().getAttribute('aria-pressed'), 'true');
    assert.equal(await screens.last().getAttribute('aria-pressed'), 'true');
    await gallery.locator('img[data-view="product"][data-ready="true"]').waitFor();
    await gallery.getByTestId('home-open-demo').tap();
    await page.getByTestId('lumi-studio').waitFor();
    await page.goBack();
    await home.waitFor({ state:'visible' });
    await home.locator('.hs-demo__tabs button').last().tap();
    assert.equal(await home.locator('.hs-demo__tabs button').last().getAttribute('aria-pressed'), 'true');
    await home.locator('.hs-faq summary').first().tap();
    await home.locator('.hs-faq details[open] p').waitFor();
    await order.tap();
    await page.getByTestId('order-page').waitFor();
    await page.getByTestId('nav-showcase').tap();
    await primary.tap();
    await page.getByTestId('projects-showcase').waitFor();
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`${name} ${width}×${height} ${language}: first screen, gallery, demo, FAQ, estimate and showcase passed`);
  } finally { await browser.close(); }
}

(async () => {
  await run(chromium, 'Chromium', 320, 568);
  await run(chromium, 'Chromium', 390, 844);
  await run(chromium, 'Chromium', 430, 932, 'en');
  await run(webkit, 'WebKit', 390, 844);
  await run(chromium, 'Chromium', 1024, 800, 'en');
})().catch(error => { console.error(error); process.exitCode = 1; });
