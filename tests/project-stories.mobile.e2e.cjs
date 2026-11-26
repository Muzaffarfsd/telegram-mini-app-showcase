const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const base = process.env.PROJECT_STORY_TEST_URL || 'http://127.0.0.1:41755/';
const ids = ['muraka-fashion','takt-coffee','women-fashion','nike-sneakers','apple-store','furniture-studio','flower-store','lumi-studio','opt-market','jewelry-store','medical-center','china-buyer','skincare-aura'];

async function check(engine, width) {
  const browser = await engine.launch();
  const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'block' });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL('#/projects', base).href);
    await page.getByTestId('projects-showcase').waitFor();
    await page.getByRole('button', { name: 'Услуги', exact: true }).tap();
    const button = page.getByTestId('story-lumi-studio');
    await button.scrollIntoViewIfNeeded();
    const before = await page.locator('#root').evaluate(el => el.scrollTop);
    await button.tap();
    await page.getByTestId('project-story').waitFor();
    assert.equal(new URL(page.url()).hash, '#/projects?project=lumi-studio');
    await page.goBack();
    await page.getByTestId('projects-showcase').waitFor();
    await page.waitForFunction(expected => Math.abs(document.getElementById('root').scrollTop - expected) < 5, before);
    assert.equal(await page.getByRole('button', { name: 'Услуги', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.getByTestId('story-lumi-studio').tap();
    await page.getByTestId('project-story-open').tap();
    await page.getByTestId('lumi-studio').waitFor();
    await page.getByTestId('demo-return-web4tg').tap();
    await page.getByTestId('project-story').waitFor();
    assert.equal(new URL(page.url()).hash, '#/projects?project=lumi-studio');
    await page.getByTestId('project-story-back').tap();
    await page.getByTestId('projects-showcase').waitFor();
    assert.equal(new URL(page.url()).hash, '#/projects');
    for (const id of ids) {
      await page.goto(new URL(`#/projects?project=${id}`, base).href);
      const story = page.getByTestId('project-story');
      await story.waitFor();
      await page.waitForFunction(expected => document.querySelector('[data-testid="project-story"]')?.getAttribute('data-project') === expected, id);
      assert.equal(await story.getAttribute('data-project'), id);
      assert.ok(await story.locator('h1').innerText());
      assert.ok(await story.locator('.project-story-hero-copy p').innerText(), id + ' business need');
      assert.ok(await story.locator('.project-story-value-list li').count() >= 3, id + ' business value');
      assert.ok(await story.locator('.project-story-steps li').count() >= 2);
      assert.ok(await story.locator('.project-story-features li').count() >= 2);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, id + ' horizontal overflow');
      const images = story.locator('.project-story-gallery img');
      assert.equal(await images.count(), 3, id + ' should show three real screens');
      for (let i=0;i<await images.count();i++) {
        const image = images.nth(i); await image.scrollIntoViewIfNeeded();
        await image.evaluate(async el => {
          await el.decode();
          if (el.naturalWidth < 780 || el.naturalHeight < 1688) throw Error(`Project screen is not high-density: ${el.naturalWidth}×${el.naturalHeight}`);
          if (!el.currentSrc.includes('v=20261127-hd')) throw Error('Project screen is missing its updated asset version');
        });
      }
      if (id === 'takt-coffee') {
        await story.locator('.project-story-gallery-stage').first().tap();
        const dialog = story.locator('dialog[open]');
        await dialog.waitFor();
        await dialog.getByRole('button', { name: 'Закрыть' }).tap();
        await dialog.waitFor({ state: 'hidden' });
      }
    }
    await page.goto(new URL('#/projects?project=takt-coffee', base).href);
    await page.waitForFunction(() => document.querySelector('[data-testid="project-story"]')?.getAttribute('data-project') === 'takt-coffee');
    await page.getByTestId('project-story-order').scrollIntoViewIfNeeded();
    await page.getByTestId('project-story-order').tap();
    await page.getByTestId('order-project-reference').waitFor();
    assert.equal(await page.getByTestId('template-restaurant').getAttribute('aria-pressed'), 'true');
    await page.goto(new URL('#/projects', base).href);
    await page.locator('.ps-filters button').first().tap();
    await page.getByTestId('card-app-takt-coffee').tap();
    await page.getByTestId('takt-coffee').waitFor();
    await page.getByTestId('demo-return-web4tg').tap();
    await page.waitForURL(url => url.hash === '#/');
    assert.deepEqual(errors, []);
    console.log(`PASS ${engine.name()} ${width}: 13 project stories, images, back, saved filter/scroll, project return`);
  } finally { await context.close(); await browser.close(); }
}
(async () => { await check(chromium, 320); await check(webkit, 390); })().catch(error => { console.error(error); process.exit(1); });
