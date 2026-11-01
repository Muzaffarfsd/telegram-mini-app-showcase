const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const site = process.env.CONSULTANT_TEST_URL || 'http://127.0.0.1:5000/';

async function open(
  browser,
  { reduced = false, lowPower = false, noWebGL = false, block3D = false, instrument = false } = {},
) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    serviceWorkers: 'block',
  });
  await context.addInitScript(
    ({ lowPower, noWebGL, instrument }) => {
      localStorage.setItem('app-language', 'ru');
      if (lowPower) localStorage.setItem('tma-low-performance', 'true');
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 8, configurable: true });
      Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true });
      if (noWebGL)
        Object.defineProperty(window, 'WebGL2RenderingContext', { value: undefined, configurable: true });
      if (instrument && window.WebGL2RenderingContext) {
        window.__orbDraws = 0;
        const prototype = window.WebGL2RenderingContext.prototype;
        const draw = prototype.drawElements;
        prototype.drawElements = function (...args) {
          window.__orbDraws++;
          return draw.apply(this, args);
        };
      }
    },
    { lowPower, noWebGL, instrument },
  );
  await context.route('https://telegram.org/js/telegram-web-app.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: '' }),
  );
  if (block3D) await context.route('**/*AIConsultantOrb3D*', (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(new URL('/#/ai-process', site).href, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('consultant-page').waitFor({ state: 'visible', timeout: 30000 });
  return { context, page, errors };
}

async function assertFallback(browser, options, label) {
  const { context, page, errors } = await open(browser, options);
  await page.waitForTimeout(900);
  assert.equal(await page.locator('.ai2-hero-art').getAttribute('data-orb3d'), 'fallback', label);
  assert.equal(await page.getByTestId('consultant-orb-canvas').count(), 0, label);
  assert.equal(await page.getByTestId('consultant-orb-greet').count(), 0, label);
  assert.ok(
    await page.locator('.ai2-hero-art > img').evaluate((image) => image.complete && image.naturalWidth > 0),
    label,
  );
  await page.getByTestId('consultant-show-demo').tap();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="consultant-page"]')?.getAttribute('data-consultant-screen') ===
      'industries',
  );
  assert.deepEqual(errors, []);
  await context.close();
  console.log(`${label}: original artwork and navigation passed`);
}

async function assertBenefitArtwork(browser, width, height) {
  const { context, page, errors } = await open(browser, { reduced: true });
  await page.setViewportSize({ width, height });
  const list = page.locator('.ai5-benefit-list');
  await list.scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.ai5-benefit-list img')].every(
      (image) => image.complete && image.naturalWidth > 0,
    ),
  );
  const artworks = await list.locator('img').evaluateAll((images) =>
    images.map((image) => ({
      source: image.currentSrc,
      width: image.getBoundingClientRect().width,
      left: image.getBoundingClientRect().left,
      right: image.getBoundingClientRect().right,
    })),
  );
  assert.equal(artworks.length, 3, 'each benefit has its own illustration');
  assert.equal(new Set(artworks.map((image) => image.source)).size, 3, 'illustrations are distinct');
  assert.ok(artworks.every((image) => image.width >= 60 && image.left >= 0 && image.right <= width));
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  await context.close();
  console.log(`Benefits: all three illustrations load and fit at ${width}px`);
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    await assertFallback(browser, { reduced: true }, 'Reduced motion');
    await assertFallback(browser, { lowPower: true }, 'Low performance');
    await assertFallback(browser, { noWebGL: true }, 'WebGL unavailable');
    await assertFallback(browser, { block3D: true }, '3D module unavailable');
    await assertBenefitArtwork(browser, 320, 568);
    await assertBenefitArtwork(browser, 390, 844);

    const { context, page, errors } = await open(browser, { instrument: true });
    await page.waitForFunction(
      () => document.querySelector('.ai2-hero-art')?.getAttribute('data-orb3d') === 'ready',
      null,
      { timeout: 30000 },
    );
    const canvas = page.getByTestId('consultant-orb-canvas');
    assert.equal(await canvas.getAttribute('data-motion'), 'running');
    assert.ok(await canvas.evaluate((el) => el.width > 0 && el.height > 0));
    assert.equal(
      await page.getByTestId('consultant-orb-greet').getAttribute('aria-label'),
      'Поздороваться с консультантом',
    );
    await page.waitForTimeout(350);
    const before = await canvas.screenshot();
    await page.getByTestId('consultant-orb-greet').tap();
    await page.waitForTimeout(700);
    const after = await canvas.screenshot();
    const a = await sharp(before).ensureAlpha().raw().toBuffer();
    const b = await sharp(after).ensureAlpha().raw().toBuffer();
    assert.equal(a.length, b.length);
    let changed = 0;
    for (let i = 0; i < a.length; i += 4)
      if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 35)
        changed++;
    assert.ok(changed > 200, `a touch should visibly change the 3D character (${changed} pixels)`);

    const drawStart = await page.evaluate(() => window.__orbDraws);
    await page.waitForTimeout(1000);
    const drawDelta = (await page.evaluate(() => window.__orbDraws)) - drawStart;
    assert.ok(drawDelta > 5 && drawDelta <= 35, `rendering stays active and capped at 30fps: ${drawDelta}`);
    await page.evaluate(() =>
      document.getElementById('root').scrollTo(0, document.getElementById('root').scrollHeight),
    );
    await page.waitForFunction(
      () => document.querySelector('[data-testid="consultant-orb-canvas"]')?.dataset.motion === 'paused',
    );
    const pausedDraws = await page.evaluate(() => window.__orbDraws);
    await page.waitForTimeout(500);
    assert.ok(
      (await page.evaluate(() => window.__orbDraws)) - pausedDraws <= 1,
      'offscreen character must not keep rendering',
    );
    await page.evaluate(() => document.getElementById('root').scrollTo(0, 0));
    await page.waitForFunction(
      () => document.querySelector('[data-testid="consultant-orb-canvas"]')?.dataset.motion === 'running',
    );

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="consultant-orb-canvas"]')?.dataset.motion === 'paused',
    );
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(
      () => document.querySelector('[data-testid="consultant-orb-canvas"]')?.dataset.motion === 'running',
    );

    await page.getByTestId('nav-showcase').tap();
    await page.waitForFunction(() => window.location.hash === '#/');
    await page.waitForFunction(
      () => document.querySelector('[data-testid="consultant-orb-canvas"]')?.dataset.motion === 'paused',
    );
    await page.getByTestId('nav-ai').tap();
    await page.waitForFunction(
      () => document.querySelector('[data-testid="consultant-orb-canvas"]')?.dataset.motion === 'running',
    );

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(
      () =>
        !document.querySelector('[data-testid="consultant-orb-canvas"]') &&
        document.querySelector('.ai2-hero-art')?.getAttribute('data-orb3d') === 'fallback',
    );
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(
      () => document.querySelector('.ai2-hero-art')?.getAttribute('data-orb3d') === 'ready',
      null,
      { timeout: 30000 },
    );

    const canLose = await canvas.evaluate((el) =>
      Boolean(el.getContext('webgl2')?.getExtension('WEBGL_lose_context')),
    );
    if (canLose) {
      await canvas.evaluate((el) => {
        window.__orbLoss = el.getContext('webgl2').getExtension('WEBGL_lose_context');
        window.__orbLoss.loseContext();
      });
      await page.waitForFunction(
        () => document.querySelector('.ai2-hero-art')?.getAttribute('data-orb3d') === 'fallback',
      );
      await page.evaluate(() => window.__orbLoss.restoreContext());
      await page.waitForFunction(
        () => document.querySelector('.ai2-hero-art')?.getAttribute('data-orb3d') === 'ready',
        null,
        { timeout: 15000 },
      );
    }
    await page.setViewportSize({ width: 320, height: 568 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByTestId('consultant-show-demo').tap();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="consultant-page"]')?.getAttribute('data-consultant-screen') ===
        'industries',
    );
    assert.equal(
      await page.getByTestId('consultant-orb-canvas').count(),
      0,
      '3D resources released when leaving the screen',
    );
    assert.deepEqual(errors, []);
    await context.close();
    console.log(
      `3D: real WebGL, touch expression, ${drawDelta} draws/s, offscreen pause, restoration and cleanup passed`,
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
