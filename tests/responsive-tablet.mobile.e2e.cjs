const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = process.env.RESPONSIVE_TEST_URL || 'http://127.0.0.1:41755/';
async function noOverflow(page, name) {
  const result = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, root: document.querySelector('#root').scrollWidth }));
  assert.ok(result.document <= result.viewport + 1 && result.root <= result.viewport + 1, `${name}: horizontal overflow ${JSON.stringify(result)}`);
}
(async () => {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1024, 768]]) {
      const context = await browser.newContext({viewport:{width,height}, deviceScaleFactor:2, isMobile:true, hasTouch:true, locale:'ru-RU', serviceWorkers:'block'});
      await context.route('https://telegram.org/js/telegram-web-app.js', r => r.fulfill({body:''}));
      await context.route('**/api/**', r => r.fulfill({json:{data:[]}}));
      await context.addInitScript(() => localStorage.setItem('app-language','ru'));
      const page = await context.newPage();
      await page.goto(new URL('#/projects',base).href);
      await page.getByTestId('projects-showcase').waitFor();
      await noOverflow(page,'showcase');
      const columns = await page.locator('.ps-collection').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(columns, width >= 700 ? 2 : 1, `showcase columns at ${width}`);
      await page.getByTestId('story-takt-coffee').tap();
      await page.getByTestId('project-story').waitFor();
      await noOverflow(page,'story');
      await page.locator('.project-story-gallery-stage').first().scrollIntoViewIfNeeded();
      await page.locator('.project-story-gallery-stage').first().tap();
      await page.getByTestId('project-screen-viewer').waitFor();
      const close = page.getByTestId('project-screen-close');
      const box = await close.boundingBox();
      assert.ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height, 'viewer close visible');
      await close.tap();
      await page.getByTestId('project-screen-viewer').waitFor({state:'hidden'});
      await page.goto(new URL('#/constructor',base).href);
      await page.getByTestId('order-page').waitFor();
      await noOverflow(page,'order');
      const orderColumns = await page.locator('.order-template-list').evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
      assert.equal(orderColumns,width >= 700 ? 2 : 1,`order columns at ${width}`);
      await page.getByTestId('template-ecommerce-basic-clothes').tap();
      await page.locator('.order-page[data-order-step="2"]').waitFor();
      await noOverflow(page,'order step 2');
      await page.getByTestId('order-back').tap();
      await page.locator('.order-page[data-order-step="1"]').waitFor();
      for (const [id, root, nav] of [['flower-store','[data-testid="flower-store"]','.fs-nav [aria-label="Каталог"]'],['lumi-studio','[data-testid="lumi-studio"]','.lumi-nav [aria-label="Услуги"]']]) {
        await page.goto(new URL(`#/demos/${id}/app`,base).href);
        await page.locator(root).first().waitFor();
        await noOverflow(page,`${id} home`);
        await page.locator(nav).first().tap();
        await page.waitForTimeout(150);
        await noOverflow(page,`${id} catalog`);
      }
      console.log(`PASS ${engine.name()} ${width}x${height}`);
      await context.close();
    }
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode=1; });
