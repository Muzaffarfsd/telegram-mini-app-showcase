const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const site = process.env.PROJECT_STORY_TEST_URL || 'http://127.0.0.1:41755/';

async function updateInsets(page, { top, bottom, height }) {
  await page.evaluate(({ top, bottom, height }) => {
    const style = document.documentElement.style;
    for (const name of ['--sat', '--csat', '--tg-safe-area-inset-top', '--tg-content-safe-area-inset-top']) style.setProperty(name, `${top}px`);
    for (const name of ['--sab', '--csab', '--tg-safe-area-inset-bottom', '--tg-content-safe-area-inset-bottom', '--projects-safe-bottom']) style.setProperty(name, `${bottom}px`);
    for (const name of ['--tg-viewport-height', '--tg-viewport-stable-height', '--projects-viewport']) style.setProperty(name, `${height}px`);
  }, { top, bottom, height });
}

async function checkGeometry(page, expected) {
  const viewer = page.getByTestId('project-screen-viewer');
  const close = page.getByTestId('project-screen-close');
  await viewer.waitFor({ state: 'visible' });
  const geometry = await viewer.evaluate(el => {
    const box = el.getBoundingClientRect();
    const button = el.querySelector('[data-testid="project-screen-close"]').getBoundingClientRect();
    const image = el.querySelector('img');
    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right,
      buttonTop: button.top, buttonBottom: button.bottom, buttonHeight: button.height,
      loaded: image.complete && image.naturalWidth > 0,
      viewportWidth: innerWidth };
  });
  assert.ok(geometry.top >= expected.top, `viewer under native header: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.bottom <= expected.height - expected.bottom, `viewer under native bottom row: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.buttonTop >= expected.top && geometry.buttonBottom <= expected.height - expected.bottom, `close button must be inside safe area: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.buttonHeight >= 44, `close target is too small: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.left >= 0 && geometry.right <= geometry.viewportWidth, `viewer exceeds horizontal viewport: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.loaded, 'the project screen should decode');
  assert.equal(await close.evaluate(el => document.elementFromPoint(el.getBoundingClientRect().left + el.offsetWidth / 2, el.getBoundingClientRect().top + el.offsetHeight / 2) === el || el.contains(document.elementFromPoint(el.getBoundingClientRect().left + el.offsetWidth / 2, el.getBoundingClientRect().top + el.offsetHeight / 2))), true, 'close button must receive taps');
}

async function test(engine) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('#/projects?project=takt-coffee', site).href);
    const image = page.locator('.project-story-gallery-stage').first();
    await image.scrollIntoViewIfNeeded();
    await image.tap();
    const viewer = page.getByTestId('project-screen-viewer');
    await viewer.waitFor({ state: 'visible' });
    await viewer.locator('img').evaluate(el => el.decode());
    // Small portrait viewport, simulated Telegram controls and shortened native viewport.
    await updateInsets(page, { top: 76, bottom: 72, height: 548 });
    await checkGeometry(page, { top: 76, bottom: 72, height: 548 });
    const imageArea = viewer.locator('.project-screen-viewer-image');
    const canScroll = await imageArea.evaluate(el => {
      el.scrollTop = 150;
      return { range: el.scrollHeight - el.clientHeight, position: el.scrollTop };
    });
    assert.ok(canScroll.range > 0 && canScroll.position > 0, 'a full-width screen should scroll for readability');
    await checkGeometry(page, { top: 76, bottom: 72, height: 548 });
    await page.getByTestId('project-screen-close').tap();
    await viewer.waitFor({ state: 'hidden' });
    await image.tap();
    await viewer.waitFor({ state: 'visible' });
    // Insets and visible height can change while the modal remains open.
    await page.setViewportSize({ width: 844, height: 390 });
    await updateInsets(page, { top: 54, bottom: 34, height: 370 });
    await checkGeometry(page, { top: 54, bottom: 34, height: 370 });
    await page.keyboard.press('Escape');
    await viewer.waitFor({ state: 'hidden' });
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()}: close button clears Telegram overlays in portrait and landscape; Escape closes`);
  } finally { await context.close(); await browser.close(); }
}

(async () => { await test(chromium); await test(webkit); })().catch(error => { console.error(error); process.exit(1); });
