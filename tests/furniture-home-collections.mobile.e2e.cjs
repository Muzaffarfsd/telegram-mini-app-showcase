const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');

const url = new URL('/#/demos/furniture-studio/app', process.argv[2] || 'http://127.0.0.1:5271/').href;

async function exercise(engine, ru, width) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({
      viewport: { width, height: 844 },
      isMobile: true,
      hasTouch: true,
      locale: ru ? 'ru-RU' : 'en-US',
      reducedMotion: ru ? 'no-preference' : 'reduce',
      serviceWorkers: 'block',
    });
    await context.addInitScript(
      (language) => localStorage.setItem('app-language', language),
      ru ? 'ru' : 'en',
    );
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const t = (a, b) => (ru ? a : b);
    const button = (name) => page.getByRole('button', { name, exact: true });
    const heading = async (name) => {
      await page.getByRole('heading', { name, level: 1, exact: true }).waitFor();
      await page.waitForFunction(() => {
        const slide = document.querySelector('.fhome-slide[aria-hidden=false]');
        const viewport = document.querySelector('.fhome-viewport');
        return (
          slide &&
          viewport &&
          Math.abs(slide.getBoundingClientRect().left - viewport.getBoundingClientRect().left) < 2
        );
      });
    };
    const previous = button('Previous category');
    const next = button('Next category');
    await page.goto(url);
    await heading('Sofas');
    const cover = page.locator('.fhome-slide[aria-hidden=false] .fhome-hero-image');
    const alpha = await cover.evaluate(async (img) => {
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 80;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 80, 80);
      const rgba = ctx.getImageData(0, 0, 80, 80).data;
      return [
        rgba[3],
        Array.from(rgba).filter((a, i) => i % 4 === 3 && a === 0).length,
        getComputedStyle(img).backgroundColor,
      ];
    });
    assert.equal(alpha[0], 0);
    assert(alpha[1] > 500);
    assert.equal(alpha[2], 'rgba(0, 0, 0, 0)');
    assert.equal(await page.locator('.fhome-category').count(), 11);
    assert.equal(await page.locator('.fhome-cover').getAttribute('lang'), 'en');
    async function checkType() {
      const unexpected = await page.evaluate(async () => {
        await document.fonts.ready;
        const roots = document.querySelectorAll('.fs-store, .fs-portal');
        const errors = [];
        for (const el of Array.from(roots).flatMap((root) => Array.from(root.querySelectorAll('*')))) {
          if (
            !(el instanceof HTMLElement) ||
            !el.getClientRects().length ||
            el.closest('[aria-hidden="true"]')
          )
            continue;
          if (
            !Array.from(el.childNodes).some(
              (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
            ) &&
            !(el instanceof HTMLInputElement)
          )
            continue;
          if (!getComputedStyle(el).fontFamily.split(',')[0].includes('Google Sans App'))
            errors.push(el.tagName + '.' + el.className);
        }
        if (!document.fonts.check('600 18px "Google Sans App"', 'Sofas Полка'))
          errors.push('web font unavailable');
        return errors;
      });
      assert.deepEqual(unexpected, []);
    }
    await checkType();
    await previous.tap();
    await heading('Desks');
    await next.tap();
    await heading('Sofas');

    if (engine.name() === 'chromium') {
      const cdp = await context.newCDPSession(page);
      const box = await page.locator('.fhome-viewport').boundingBox();
      async function swipe(from, to) {
        const y = box.y + box.height * 0.64;
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: from, y, id: 1 }],
        });
        for (let i = 1; i <= 8; i++) {
          await cdp.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: from + ((to - from) * i) / 8, y, id: 1 }],
          });
          await page.waitForTimeout(22);
        }
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      await swipe(width * 0.77, width * 0.24);
      await heading('Armchairs');
      await swipe(width * 0.23, width * 0.76);
      await heading('Sofas');
    } else {
      const box = await page.locator('.fhome-viewport').boundingBox();
      const y = box.y + box.height * 0.58;
      await page.mouse.move(width * 0.8, y);
      await page.mouse.down();
      await page.mouse.move(width * 0.23, y, { steps: 12 });
      await page.mouse.up();
      await heading('Armchairs');
      await previous.tap();
      await heading('Sofas');
    }

    await page.locator('.fhome-cover').focus();
    await page.keyboard.press('ArrowRight');
    await heading('Armchairs');
    assert.match(await page.locator('.fhome-picks h2').innerText(), /Armchair/);
    await button('Open Adrienne').tap();
    await page.locator('.fs-product').waitFor();
    await checkType();
    await page.locator('.fs-back').tap();
    await heading('Armchairs');
    const save = page.locator('.fhome-picks .fhome-piece-save').first();
    await save.tap();
    assert.equal(await save.getAttribute('aria-pressed'), 'true');
    await page.locator('.fhome-picks .fhome-text-link').tap();
    await page.locator('.fs-catalog').waitFor();
    await checkType();
    assert.equal(
      await page.locator('.fs-chip[aria-pressed=true]').innerText(),
      t('Кресла', 'Armchairs'),
    );
    assert.equal(await page.locator('.fs-catalog .fs-card').count(), 4);

    await page.locator('.fs-nav-button').first().tap();
    await heading('Armchairs');
    await page.locator('.fhome-category').filter({ hasText: 'Lighting' }).tap();
    await heading('Lighting');
    assert.equal(await page.evaluate(() => document.getElementById('root').scrollTop), 0);
    await page.locator('.fhome-light-story').tap();
    await page.locator('.fs-catalog').waitFor();
    assert.equal(await page.locator('.fs-chip[aria-pressed=true]').innerText(), t('Свет', 'Lighting'));
    await page.locator('.fs-nav-button').first().tap();
    const search = page.getByRole('searchbox', { name: t('Поиск мебели', 'Search furniture') });
    await search.fill('Westview');
    await search.press('Enter');
    await page.locator('.fs-catalog').waitFor();
    assert.equal(await page.locator('#fs-search').inputValue(), 'Westview');
    assert.equal(await page.locator('.fs-catalog .fs-card').count(), 1);
    await page.locator('.fs-nav-button').first().tap();
    assert((await page.locator('.fhome-arrivals .fhome-piece-open').count()) >= 4);
    assert(
      await page
        .locator('.fhome-arrivals .fhome-piece-photo')
        .evaluateAll((photos) =>
          photos.every(
            (photo) =>
              photo.getBoundingClientRect().width <=
              photo.closest('article').getBoundingClientRect().width + 1,
          ),
        ),
    );
    assert((await page.locator('.fhome-room').count()) >= 5);
    assert.equal(await page.locator('#root').evaluate((el) => el.scrollWidth), width);
    assert.deepEqual(errors, []);
    console.log(
      engine.name(),
      width,
      t('RU', 'EN'),
      'PASS hero, bidirectional gesture, wraparound, keyboard, history, favourites, search, categories and lighting',
    );
  } finally {
    await browser.close();
  }
}
(async () => {
  await exercise(chromium, true, 390);
  await exercise(webkit, false, 320);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
