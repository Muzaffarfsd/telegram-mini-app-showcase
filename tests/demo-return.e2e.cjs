const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const site = process.env.DEMO_RETURN_TEST_URL || 'http://127.0.0.1:5000/';
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const registry = read('client/src/components/demos/DemoRegistry.ts');
const metadata = read('client/src/data/demoApps.ts');
const shell = read('client/src/components/DemoAppShell.tsx');
const registered = [...registry.matchAll(/^  '([^']+)': \{/gm)].map(match => match[1]);
const published = new Set([...metadata.matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1]));
const aliases = new Map([...shell.matchAll(/demoId === '([^']+)'\s*\?\s*'([^']+)'\s*:\s*demoId/g)].map(match => [match[1], match[2]]));
const routes = registered.filter(id => published.has(aliases.get(id) || id));
const roots = {
  'flower-store': 'flower-store', 'china-buyer': 'china-buyer', 'medical-center': 'medical-center',
  'lumi-studio': 'lumi-studio', 'opt-market': 'opt-market', 'apple-store': 'apple-store',
  'muraka-fashion': 'muraka-fashion', 'women-fashion': 'women-fashion',
  'nike-sneakers': 'royal-step', 'royal-step': 'royal-step', 'skincare-aura': 'demo-content',
};
assert.ok(routes.length > 0 && routes.includes('royal-step'), 'The published demo registry and alias must be detected');
for (const id of published) assert.ok(routes.includes(id), `Published demo ${id} is not covered`);

async function test() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: Number(process.env.DEMO_RETURN_WIDTH || 320), height: 740 }, isMobile: true, hasTouch: true,
    locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block',
  });
  await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
  const page = await context.newPage();
  const failures = [];

  async function inspectNav(label) {
    const button = page.getByTestId('demo-return-web4tg');
    await button.waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await button.count(), 1, `${label}: exactly one exit button`);
    const geometry = await button.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const nav = el.closest('nav');
      const navRect = nav?.getBoundingClientRect();
      const buttons = [...(nav?.querySelectorAll('button') || [])].map(item => {
        const box = item.getBoundingClientRect();
        return { label: item.getAttribute('aria-label') || item.textContent.trim(), left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
      }).filter(item => item.width && item.height);
      const collisions = [];
      for (let i = 0; i < buttons.length; i++) for (let j = i + 1; j < buttons.length; j++) {
        const a = buttons[i], b = buttons[j];
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) collisions.push([a.label, b.label]);
      }
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height,
        viewportWidth: innerWidth, viewportHeight: innerHeight,
        nav: navRect ? { left: navRect.left, right: navRect.right, top: navRect.top, bottom: navRect.bottom } : null,
        buttons, collisions,
        overflowing: navRect ? buttons.filter(item => item.left < navRect.left - 1 || item.right > navRect.right + 1 || item.top < navRect.top - 1 || item.bottom > navRect.bottom + 1) : buttons,
        withinNav: !!navRect && rect.left >= navRect.left - 1 && rect.right <= navRect.right + 1 && rect.top >= navRect.top - 1 && rect.bottom <= navRect.bottom + 1 };
    });
    assert.ok(geometry.withinNav, `${label}: button is inside the bottom navigation: ${JSON.stringify(geometry)}`);
    assert.deepEqual(geometry.collisions, [], `${label}: navigation buttons must not overlap`);
    assert.deepEqual(geometry.overflowing, [], `${label}: every navigation button must fit inside the panel`);
    assert.ok(geometry.width > 0 && geometry.height > 0 && geometry.x >= 0 && geometry.y >= 0 && geometry.right <= geometry.viewportWidth && geometry.bottom <= geometry.viewportHeight, `${label}: button is fully on screen: ${JSON.stringify(geometry)}`);
    assert.ok(geometry.width >= 44 && geometry.height >= 44, `${label}: return target must be at least 44x44 px`);
    assert.ok(await button.getAttribute('aria-label'), `${label}: icon has an accessible label`);
    const caption = button.getByText('WEB4TG', { exact: true });
    assert.equal(await caption.isVisible(), true, `${label}: WEB4TG caption is visible`);
    return button;
  }

  async function assertExit(label) {
    const button = await inspectNav(label);
    await button.tap({ timeout: 10000 });
    await page.waitForURL(url => url.hash === '#/' || url.hash === '', { timeout: 15000 });
    await page.getByTestId('home-exhibit').waitFor({ state: 'visible', timeout: 20000 });
    assert.equal(await page.getByTestId('demo-return-web4tg').count(), 0, `${label}: button is absent on the main app`);
  }

  try {
    for (const id of routes) {
      try {
        await page.goto(new URL(`/#/demos/${id}/app`, site).href, { waitUntil: 'domcontentloaded' });
        await page.getByTestId(roots[id] || 'demo-content').waitFor({ state: 'visible', timeout: 20000 });
        await inspectNav(id);
        const navigation = page.getByTestId('demo-return-web4tg').locator('xpath=ancestor::nav');
        const tabs = await navigation.locator('button').evaluateAll(buttons => buttons.map(button => button.getAttribute('aria-label') || button.textContent.trim()).filter(label => /^(корзина|профиль)$/i.test(label)));
        for (const tab of tabs) {
          await navigation.getByRole('button', { name: tab, exact: true }).tap({ timeout: 10000 });
          await inspectNav(`${id} / ${tab}`);
        }
        await assertExit(id);
        console.log(`PASS ${id}: direct entry and return to WEB4TG; tabs: ${tabs.join(', ') || 'no matching cart/profile tabs'}`);
      } catch (error) {
        const screenshot = path.join(os.tmpdir(), `web4tg-demo-return-${id}.png`);
        await page.screenshot({ path: screenshot }).catch(() => {});
        failures.push(`${id}: ${error.message}`);
        console.error(`FAIL ${id}: ${error.message} (screenshot: ${screenshot})`);
      }
    }
    try {
      await page.goto(new URL('/#/projects', site).href, { waitUntil: 'domcontentloaded' });
      await page.getByTestId('projects-showcase').waitFor({ state: 'visible', timeout: 20000 });
      assert.equal(await page.getByTestId('demo-return-web4tg').count(), 0, 'Return control must only be in demo apps');
      await page.getByTestId('card-app-flower-store').tap();
      await page.waitForURL('**/#/demos/flower-store/app');
      await assertExit('from projects');
      console.log('PASS flower-store: projects entry returns to WEB4TG home');
    } catch (error) {
      failures.push(`projects entry: ${error.message}`);
      console.error(`FAIL projects entry: ${error.message}`);
    }
    assert.deepEqual(failures, [], `${failures.length} demo return scenarios failed`);
  } finally {
    await context.close();
    await browser.close();
  }
}

test().catch(error => { console.error(error); process.exitCode = 1; });
