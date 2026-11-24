const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');

const site = process.env.HOME_TEST_URL || 'http://127.0.0.1:5000/';

async function holdImage(page, pattern) {
  let release;
  const wait = new Promise(resolve => { release = resolve; });
  await page.route(pattern, async route => { await wait; await route.continue(); });
  return release;
}

async function check(engine, reducedMotion) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('app-language', 'en');
      // Record actual dissolves, including ones that finish before the test queries the DOM.
      window.dissolves = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        if (this.matches('.home-artwork__front')) window.dissolves.push(this.parentElement.parentElement.className);
        return animate.apply(this, args);
      };
    });
    const releaseFirst = await holdImage(page, '**/fashion-muraka-home-v2.webp');
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    const art = page.locator('.home-demo__art');
    const base = art.locator('.home-artwork__composition');
    const picture = () => base.evaluate(el => getComputedStyle(el).backgroundImage);
    await art.scrollIntoViewIfNeeded();
    assert.match(await picture(), /data:image\/webp/, 'first paint has the actual miniature');
    const box = await art.boundingBox();
    releaseFirst();
    await art.locator('img[data-ready=true]').waitFor();
    const clothing = await picture();
    assert.match(clothing, /fashion-muraka-home/);

    const releaseSneakers = await holdImage(page, '**/sneaker-no-header-home-v4.webp');
    const tabs = page.locator('.home-demo__projects button');
    await tabs.nth(2).click();
    await art.locator('img[src*="sneaker"][data-ready=false]').waitFor({ state: 'attached' });
    assert.equal(await picture(), clothing, 'keep the last complete frame during a slow request');
    await tabs.nth(4).click();
    await art.locator('img[src*="florist"][data-ready=true]').waitFor();
    releaseSneakers();
    assert.match(await picture(), /florist/);
    assert.equal((await art.boundingBox()).height, box.height);

    const journey = page.locator('.hs-demo__art');
    await journey.scrollIntoViewIfNeeded();
    await journey.locator('img[data-ready=true]').waitFor();
    const releaseProduct = await holdImage(page, '**/journey-product-v2.webp');
    await page.locator('.hs-demo__tabs button').nth(1).click();
    assert.match(await journey.locator('.home-artwork__composition').evaluate(el => el.style.backgroundImage), /journey-catalog/, 'slow shopping step retains its outgoing art');
    await page.locator('.hs-demo__tabs button').nth(2).click();
    await journey.locator('img[src*="cart"][data-ready=true]').waitFor();
    releaseProduct();

    await page.locator('.hs-solutions__art').last().scrollIntoViewIfNeeded();
    await page.locator('.hs-solutions__art img[data-ready=true]').last().waitFor();
    await art.scrollIntoViewIfNeeded();
    assert.equal(await art.getAttribute('data-entered'), 'true');
    assert.match(await picture(), /florist/, 'going back up preserves the selected artwork');
    // Use a previously unseen image so even a browser memory-cache hit cannot mask the failure.
    await page.route('**/apple-home-real-v5.webp', route => route.abort());
    await tabs.nth(3).click();
    await art.locator('img[data-ready=fallback]').waitFor({ state: 'attached' });
    assert.match(await picture(), /data:image\/webp/, 'a failed request shows the selected category miniature');
    const dissolves = await page.evaluate(() => window.dissolves);
    if (reducedMotion === 'reduce') assert.deepEqual(dissolves, []);
    else assert.ok(dissolves.some(name => name.includes('home-demo__art')) && dissolves.some(name => name.includes('hs-demo__art')), 'both interactive cards should dissolve');
    console.log(engine.name(), reducedMotion, 'passed cold load, delayed responses, rapid selection, scroll and image failure');
  } finally { await browser.close(); }
}

(async () => {
  await check(chromium, 'no-preference');
  await check(webkit, 'no-preference');
  await check(chromium, 'reduce');
})().catch(error => { console.error(error); process.exitCode = 1; });
