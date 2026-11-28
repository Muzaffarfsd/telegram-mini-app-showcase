const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.FLOWER_TEST_URL || 'http://127.0.0.1:41755/';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const page = await context.newPage();
  try {
    await page.goto(new URL('#/demos/flower-store/app', base).href);
    await page.locator('.fs-nav [aria-label=Каталог]').click();
    await page.locator('.fc-open-photo').first().click();
    const rail = page.locator('.f3-recommend-track');
    const previous = page.getByRole('button', { name: 'Предыдущие рекомендации' });
    const next = page.getByRole('button', { name: 'Следующие рекомендации' });
    await rail.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    assert.equal(await previous.isDisabled(), true);
    assert.equal(await next.isEnabled(), true);
    const box = await rail.boundingBox();
    const x = box.x + box.width - 40, y = Math.max(80, Math.min(700, box.y + box.height * .5));
    const cdp = await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 20; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - i * 12, y }] });
      await new Promise(resolve => setTimeout(resolve, 12));
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.ok(await rail.evaluate(el => el.scrollLeft > 100), 'recommendations follow a horizontal finger drag');
    await page.waitForFunction(() => !document.querySelector('[aria-label="Предыдущие рекомендации"]').disabled);
    await rail.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    await page.waitForFunction(() => document.querySelector('[aria-label="Следующие рекомендации"]').disabled);
    assert.equal(await previous.isEnabled(), true);
    await rail.evaluate(el => { el.scrollLeft = 0; });
    await page.waitForFunction(() => document.querySelector('[aria-label="Предыдущие рекомендации"]').disabled);
    assert.equal(await next.isEnabled(), true);
    console.log('PASS flower recommendations: finger drag and both edge states');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
