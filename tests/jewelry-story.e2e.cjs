const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const base = process.env.JEWELRY_TEST_URL || 'http://127.0.0.1:5195/';
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
      await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
      if (process.env.JEWELRY_STORY_PREVIEW) await context.route('**/jewelryStoryAssets.ts*', route => route.fulfill({ contentType: 'application/javascript', body: `export const jewelryStoryImage = () => '/jewelry/tiffany-hero-candidates/hero-close-t1.png';` }));
      const page = await context.newPage();
      const failures = [];
      page.on('pageerror', error => failures.push(error.message));
      page.on('response', response => { if (response.status() >= 400 && response.url().includes('/jewelry/')) failures.push(`${response.status()} ${response.url()}`); });
      await page.goto(`${base}#/demos/jewelry-store/app`, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('jewelry-store').waitFor();
      await page.locator('.mf-nav').getByRole('button', { name: 'Каталог', exact: true }).click();
      const ids = await page.locator('[data-testid^="mf-card-"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-testid')));
      assert.equal(ids.length, 20);
      for (const id of ids) {
        await page.getByTestId(id).getByRole('button', { name: /Открыть/ }).click();
        const story = page.getByTestId('jewelry-product-story');
        await story.waitFor({state:'attached'});
        assert.equal(await story.locator('.jwl-story__chapter').count(), 2, `${id}: missing chapters`);
        assert.equal(await story.locator('figure').count(), 2, `${id}: missing editorial slots`);
        assert.ok((await story.locator('h2').first().innerText()).length > 3, `${id}: no story heading`);
        assert.ok((await story.locator('.jwl-story__lead').first().innerText()).length > 20, `${id}: no product story`);
        const gallery = page.locator('.mf-gallery');
        assert.equal(await gallery.locator('.mf-gallery-thumbs button').count(), 3, `${id}: missing photo views`);
        const labels = ['Украшение', 'Другой ракурс', 'На модели', 'В упаковке'];
        for (let index = 0; index < labels.length; index++) {
          if (index) await gallery.getByRole('button', { name: labels[index], exact: true }).click();
          assert.equal((await gallery.locator('.mf-gallery-count').innerText()).trim(), `0${index + 1} / 04`, `${id}: wrong photo index`);
          const viewport = gallery.locator('.mf-gallery-image-viewport');
          const image = viewport.locator('img');
          const imageCount = await image.count();
          assert.equal(imageCount + await viewport.locator('.jewelry-image-pending').count(), 1, `${id}: photo has no image or pending state`);
          if (imageCount) {
            await page.waitForFunction(el => el.complete, await image.elementHandle());
            assert.ok(await image.evaluate(el => el.naturalWidth > 0), `${id}: photo ${index + 1} failed to load`);
          }
        }
        if (id === 'mf-card-tiffany-67796772') {
          assert.match(await story.locator('h2').first().innerText(), /Точная линия/);
          assert.match(await story.locator('.jwl-story__note').innerText(), /мотив Tiffany T T1/i);
          assert.ok(await story.locator('h2').first().evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 33), `${width}px: story heading styling is missing`);
          assert.equal(await story.locator('.jwl-story__eyebrow').first().evaluate(el => getComputedStyle(el).display), 'flex', `${width}px: story layout styling is missing`);
          await story.screenshot({ path: `${process.env.TEMP || process.env.TMP || '.'}/jewelry-story-${width}.png` });
        }
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px ${id}: horizontal overflow`);
        await page.locator('.mf-page-back').click();
        await page.locator('.mf-catalog').waitFor();
      }
      assert.deepEqual(failures, []);
      await context.close();
      console.log(`PASS 20 jewelry product narratives at ${width}px`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
