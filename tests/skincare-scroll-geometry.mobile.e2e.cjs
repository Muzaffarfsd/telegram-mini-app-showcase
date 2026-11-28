const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:41755/';

async function swipe(cdp) {
  const points = (y) => [{x: 195, y}];
  await cdp.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:points(650)});
  for (let i=1; i<=15; i++) {
    await cdp.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:points(650 - i*25)});
    await new Promise(resolve => setTimeout(resolve, 7));
  }
  await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, serviceWorkers:'block' });
  await context.addInitScript(() => { localStorage.setItem('tma-low-performance', 'true'); });
  const page = await context.newPage();
  try {
    await page.goto(new URL('#/demos/skincare-aura/app', base).href);
    await page.getByTestId('demo-content').waitFor();
    await page.waitForFunction(() => document.documentElement.classList.contains('low-performance'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      const root = document.getElementById('root');
      window.geometrySamples = [];
      window.captureGeometry = true;
      function sample() {
        window.geometrySamples.push({top:root.scrollTop, height:root.scrollHeight});
        if (window.captureGeometry) requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    const cards = page.locator('.aura-blog-card');
    assert.equal(await cards.count(), 3);
    assert.deepEqual(await cards.evaluateAll(items => items.map(el => getComputedStyle(el).contentVisibility)), ['visible','visible','visible']);
    const cdp = await context.newCDPSession(page);
    for (let i=0; i<7; i++) { await swipe(cdp); await page.waitForTimeout(130); }
    const samples = await page.evaluate(() => { window.captureGeometry = false; return window.geometrySamples; });
    assert.ok(samples.length > 15, 'frames captured during the gesture');
    assert.ok(samples.at(-1).top > 600, 'vertical drags must move the page to the blog');
    const initialHeight = samples[0].height;
    assert.ok(samples.every(sample => Math.abs(sample.height-initialHeight) <= 1), `page height jumped during scroll: ${JSON.stringify(samples.filter(s => Math.abs(s.height-initialHeight)>1).slice(0,5))}`);
    console.log('PASS skincare: low-performance touch scrolling keeps blog and page geometry stable');
  } finally { await context.close(); await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
