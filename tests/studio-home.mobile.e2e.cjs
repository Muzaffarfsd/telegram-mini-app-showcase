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
      await chat.getByRole('button', { name: 'Закрыть', exact: true }).tap();
      await chat.waitFor({ state: 'hidden' });
    }

    const primary = home.getByRole('button', { name: language === 'ru' ? 'Смотреть витрину' : 'Explore apps', exact: true });
    const order = home.getByTestId('home-start-order');
    const contact = home.locator('.studio-intro-actions').getByRole('link', { name: language === 'ru' ? 'Написать в Telegram' : 'Message us on Telegram' });
    assert.equal(await contact.getAttribute('href'), 'https://t.me/web4tgs');
    const [browseBox, estimateBox, contactBox] = await Promise.all([primary, order, contact].map(el => el.boundingBox()));
    assert.equal(browseBox.y, estimateBox.y, 'browse and estimate share the first row');
    assert.ok(contactBox.y >= estimateBox.y + estimateBox.height && contactBox.width >= browseBox.width + estimateBox.width, 'Telegram is a full-width action below both buttons');
    for (const icon of await home.locator('a.studio-contact img').all()) await icon.evaluate(el => el.decode());
    assert.equal(await home.locator('a.studio-contact img[alt=""]').count(), 2);
    const [header, headline] = await Promise.all([page.locator('.w4-topbar'), home.locator('h1')].map(el => el.boundingBox()));
    const headerGap = headline.y - header.y - header.height;
    assert.ok(Math.abs(headerGap - 4) <= 1, 'home content begins 4px below the original header');
    const rowInsets = await page.locator('.w4-topbar > div').evaluate(row => {
      const css = getComputedStyle(row), rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return [parseFloat(css.paddingTop) / rem, parseFloat(css.paddingBottom) / rem];
    });
    assert.ok(Math.abs(rowInsets[0] - 1.5) < .002 && Math.abs(rowInsets[1] - .25) < .002, 'home preserves the shared header padding');
    await page.getByTestId('button-hamburger').tap();
    const drawer = page.getByRole('dialog').filter({ has: page.getByTestId('button-menu-close') });
    await drawer.waitFor();
    const dismiss = drawer.getByTestId('button-menu-close');
    assert.deepEqual(await dismiss.evaluate(el => [getComputedStyle(el).backgroundColor, getComputedStyle(el.querySelector('svg')).stroke]), ['rgb(17, 17, 17)', 'rgb(255, 255, 255)']);
    const bottom = await drawer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
      const footer = el.querySelector('.w4m-footer');
      const last = footer.querySelector('a:last-child').getBoundingClientRect();
      const expected = parseFloat(getComputedStyle(footer).paddingBottom);
      return { surfaces:[el, footer].map(node => getComputedStyle(node).backgroundColor), gap:el.getBoundingClientRect().bottom - last.bottom, expected };
    });
    assert.deepEqual(bottom.surfaces, ['rgb(255, 255, 255)', 'rgb(255, 255, 255)']);
    assert.ok(Math.abs(bottom.gap - bottom.expected) <= 1, 'bottom links sit directly above the safe padding');
    await dismiss.tap();
    await drawer.waitFor({state:'hidden'});
    for (const action of [contact, primary, order]) {
      const box = await action.boundingBox();
      assert.ok(box && box.y >= 0 && box.y + box.height <= height - 70, 'primary actions are visible on entry');
    }
    const contactStyle = await contact.evaluate(el => [getComputedStyle(el).color, getComputedStyle(el).backgroundColor]);
    assert.deepEqual(contactStyle, ['rgb(255, 255, 255)', 'rgb(23, 23, 23)']);
    const contactEvents = await contact.evaluate(el => {
      const previous = window.Telegram;
      const events = [];
      function record(event) { events.push(event.defaultPrevented); event.preventDefault(); }
      window.addEventListener('click', record);
      try {
        window.Telegram = { WebApp: { openTelegramLink(url) { events.push(url); } } };
        el.click();
        window.Telegram.WebApp.openTelegramLink = () => { throw new Error('Unsupported'); };
        el.click();
        delete window.Telegram;
        el.click();
      } finally { window.Telegram = previous; window.removeEventListener('click', record); }
      return events;
    });
    assert.deepEqual(contactEvents, ['https://t.me/web4tgs', true, false, false]);
    const gallery = home.getByTestId('home-exhibit');
    await gallery.getByRole('heading', { name: language === 'ru' ? 'Выберите приложение для своего бизнеса' : 'Choose an app for your business' }).waitFor();
    assert.equal((await gallery.locator('.home-demo__open').innerText()).trim(), language === 'ru' ? 'Смотреть коллекцию' : 'Browse the collection');
    const preview = await gallery.locator('.home-demo__art').boundingBox();
    const card = await gallery.locator('.home-demo__card').boundingBox();
    assert.ok(Math.abs(preview.width - card.width) < 1, 'the app preview uses the full card width');
    const originalHeight = width <= 350 ? 270 : Math.max(280, Math.min(width * .95, 450));
    assert.ok(Math.abs(preview.height - originalHeight) < 1, 'app preview keeps the original home gallery scale');
    const topics = gallery.locator('.home-demo__projects button');
    const selectedStyle = el => {
      const button = getComputedStyle(el);
      const track = getComputedStyle(el.parentElement);
      return [button.color, button.backgroundColor, button.borderRadius, track.backgroundColor, track.borderRadius];
    };
    const homeSegment = await topics.first().evaluate(selectedStyle);
    const screens = gallery.locator('.home-demo__switch button');
    assert.equal(await topics.count(), 6);
    await topics.last().tap();
    assert.equal((await gallery.locator('.home-demo__open').innerText()).trim(), language === 'ru' ? 'Выбрать мастера' : 'Find a stylist');
    await screens.last().tap();
    assert.equal(await topics.last().getAttribute('aria-pressed'), 'true');
    assert.equal(await screens.last().getAttribute('aria-pressed'), 'true');
    await gallery.locator('img[data-view="product"][data-ready="true"]').waitFor();
    await gallery.getByTestId('home-open-demo').tap();
    await page.getByTestId('lumi-studio').waitFor();
    await page.goBack();
    await home.waitFor({ state:'visible' });
    const journey = home.locator('.hs-demo');
    const journeyHeights = [];
    for (const tab of await journey.getByRole('button').all()) {
      await tab.tap();
      assert.equal(await tab.getAttribute('aria-pressed'), 'true');
      const picture = journey.locator('img');
      await picture.scrollIntoViewIfNeeded();
      const paintedHeight = await picture.evaluate(async img => {
        await img.decode();
        const box = img.getBoundingClientRect();
        return Math.min(box.height, box.width * img.naturalHeight / img.naturalWidth);
      });
      assert.ok(paintedHeight >= 300, 'each shopping step has a large, uncropped illustration');
      journeyHeights.push((await journey.boundingBox()).height);
    }
    assert.ok(Math.max(...journeyHeights) - Math.min(...journeyHeights) <= 1, 'shopping steps keep the same card height');
    await home.locator('.hs-faq summary').first().tap();
    await home.locator('.hs-faq details[open] p').waitFor();
    const finalEstimate = home.locator('.hs-final button');
    const tinted = await home.evaluate(root => {
      const selectors = 'h1 span,h2,h3,p,button,summary,.hs-final,.hs-final a,.hs-demo,.home-demo__card,.home-demo__open,.category-segments';
      return [...root.querySelectorAll(selectors)].flatMap(el => {
        const style = getComputedStyle(el);
        return [style.color, style.backgroundColor, style.webkitTextFillColor].filter(value => {
          const channels = value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          return channels && (channels[1] !== channels[2] || channels[2] !== channels[3]);
        }).map(value => [el.className, value]);
      });
    });
    assert.deepEqual(tinted, [], 'home typography, surfaces and controls have neutral colours');
    assert.ok(await finalEstimate.evaluate(el => {
      const style = getComputedStyle(el);
      return style.color !== style.backgroundColor && style.webkitTextFillColor !== style.backgroundColor;
    }), 'the estimate label must be visible on its white button');
    await finalEstimate.tap();
    await page.getByTestId('order-page').waitFor();
    await page.getByTestId('nav-showcase').tap();
    await primary.tap();
    await page.getByTestId('projects-showcase').waitFor();
    const cardActions = await page.locator('.ps-open').allInnerTexts();
    assert.equal(cardActions.length, 13);
    assert.equal(new Set(cardActions).size, cardActions.length, 'each business shows its own customer action');
    assert.deepEqual(await page.locator('.ps-filters button[aria-pressed=true]').evaluate(selectedStyle), homeSegment);
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
