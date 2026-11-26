const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium, webkit } = require('playwright');
require('tsx/cjs');
const { demoApps } = require('../client/src/data/demoApps.ts');

const site = process.env.SCROLL_TEST_URL || 'http://127.0.0.1:5000/';
const cases = [
  ['#/', '[data-testid="home-page"]', false],
  ['#/projects', '.projects-showcase', false],
  ['#/constructor', '[data-testid="order-page"]', false],
  ['#/profile', '[data-testid="profile-page"]', false],
  ['#/about', '[data-testid="about-page"]', false],
  ['#/ai-process', '[data-testid="consultant-page"]', false],
  ['#/demos/muraka-fashion/app', '[data-testid="muraka-fashion"]', true],
  ['#/demos/women-fashion/app', '[data-testid="women-fashion"]', true],
  ['#/demos/jewelry-store/app', '[data-testid="jewelry-store"]', true],
  ['#/demos/flower-store/app', '[data-testid="flower-store"]', false],
  ['#/demos/takt-coffee/app', '[data-testid="takt-coffee"]', true],
  ['#/demos/china-buyer/app', '[data-testid="china-buyer"]', false],
  ['#/demos/medical-center/app', '[data-testid="medical-center"]', false],
  ['#/demos/lumi-studio/app', '[data-testid="lumi-studio"]', false],
  ['#/demos/opt-market/app', '[data-testid="opt-market"]', false],
  ['#/demos/nike-sneakers/app', '[data-testid="royal-step"]', false],
  ['#/demos/skincare-aura/app', '[data-testid="demo-content"]', false],
  ['#/demos/furniture-studio/app', '[data-testid="furniture-store"]', false],
  ['#/demos/apple-store/app', '.as-store', true],
];

async function swipe(cdp, start, end) {
  const points = (x, y) => [{ x, y }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(...start) });
  for (let i = 1; i <= 24; i++) {
    const x = start[0] + (end[0] - start[0]) * i / 24;
    const y = start[1] + (end[1] - start[1]) * i / 24;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(x, y) });
    await new Promise(resolve => setTimeout(resolve, 12));
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function checkChatScroll(page, cdp) {
  await page.getByRole('button', { name: 'Chat with Alex' }).press('Enter');
  const panel = page.getByTestId('ai-chat-panel');
  const messages = panel.locator('.ai-chat-scroll');
  const composer = panel.getByRole('textbox');
  await composer.waitFor();
  // Wait for the open animation and the initial scroll to the newest message.
  await composer.click({ trial: true });
  await page.waitForFunction(() => document.querySelector('.ai-chat-scroll')?.scrollTop > 200);
  const initialTop = await messages.evaluate(el => el.scrollTop);
  const backgroundTop = await page.locator('#root').evaluate(el => el.scrollTop);
  const composerY = (await composer.boundingBox()).y;
  const bounds = await messages.boundingBox();
  const x = bounds.x + bounds.width / 2;
  await swipe(cdp, [x, bounds.y + bounds.height * 0.3], [x, bounds.y + bounds.height * 0.7]);
  await page.waitForFunction(y => document.querySelector('.ai-chat-scroll').scrollTop < y - 60, initialTop);
  assert.ok(Math.abs((await composer.boundingBox()).y - composerY) < 2, 'chat input shifted during a message swipe');
  assert.ok(Math.abs(await page.locator('#root').evaluate(el => el.scrollTop) - backgroundTop) < 2, 'chat swipe moved the background');
  await panel.getByRole('button', { name: /^(Close|Закрыть)$/ }).press('Enter');
  await panel.waitFor({ state: 'hidden' });
}

async function installShowcaseTelegramHost(ctx, initialHeight = 710, reportInsets = true) {
  const sdk = path.join(path.dirname(require.resolve('@twa-dev/sdk')), 'telegram-web-apps.js');
  await ctx.route('https://telegram.org/js/telegram-web-app.js', route =>
    route.fulfill({ contentType: 'text/javascript', path: sdk }));
  await ctx.addInitScript(({ height, reportInsets }) => {
    sessionStorage.setItem('__telegram__initParams', JSON.stringify({ tgWebAppPlatform: 'ios', tgWebAppVersion: '8.0' }));
    const replies = {
      web_app_request_viewport: ['viewport_changed', { height, is_expanded: true, is_state_stable: true }],
      web_app_request_safe_area: ['safe_area_changed', { top: 59, bottom: 34, left: 0, right: 0 }],
      web_app_request_content_safe_area: ['content_safe_area_changed', { top: 48, bottom: 44, left: 0, right: 0 }],
    };
    window.TelegramWebviewProxy = { postEvent(name, data) {
      if (!reportInsets && (name === 'web_app_request_safe_area' || name === 'web_app_request_content_safe_area')) return;
      if (name === 'web_app_open_tg_link') window.showcaseShareLink = JSON.parse(data).path_full;
      if (replies[name]) setTimeout(() => window.Telegram.WebView.receiveEvent(...replies[name]), 0);
    } };
  }, { height: initialHeight, reportInsets });
}

async function checkCoffeeHost(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  try {
    await installShowcaseTelegramHost(ctx, 844);
    const p = await ctx.newPage();
    const fashion=await ctx.newPage();
    await fashion.goto(new URL('#/demos/muraka-fashion/app',site).href);
    const original=fashion.locator('.mf-nav');await original.waitFor();
    const geometry=el=>{const r=el.getBoundingClientRect();return {bottom:r.bottom,height:r.height,width:r.width}};
    await fashion.evaluate(()=>document.fonts.ready);const originalHome=await original.evaluate(geometry);
    await p.goto(new URL('#/demos/takt-coffee/app', site).href);
    const dock=p.locator('.mf-nav.tk-dock');await dock.waitFor();
    const dockEdge=()=>dock.evaluate(el=>el.getBoundingClientRect().bottom);
    await p.evaluate(()=>document.fonts.ready);const coffeeHome=await dock.evaluate(geometry);assert.equal(coffeeHome.bottom,originalHome.bottom);assert.equal(coffeeHome.height,originalHome.height);assert.ok(Math.abs(coffeeHome.width-originalHome.width)<1.5,'the original compact footprint is preserved');
    const initialHistory = await p.evaluate(() => history.length);
    await dock.locator('[data-tab=menu]').tap();
    await p.locator('.tk-filter-trigger').click();
    assert.equal(await p.evaluate(() => history.length), initialHistory + 2, 'a touch activation creates one entry for the catalogue and one for sorting');
    const edge = () => p.locator('dialog[open]').evaluate(el => el.getBoundingClientRect().bottom);
    assert.ok(await edge() <= 844, 'the picker stays inside the native viewport');
    await p.locator('dialog .tk-sheet-done').click();
    await p.locator('dialog').waitFor({state:'detached'});
    await dock.locator('[data-tab=home]').tap();
    const cdp = await ctx.newCDPSession(p);
    const menuTab = await dock.locator('[data-tab=menu]').boundingBox();
    const center = [menuTab.x + menuTab.width / 2, menuTab.y + menuTab.height / 2];
    await swipe(cdp, center, [center[0] + 32, center[1]]);
    assert.equal(await p.locator('.tk-app').getAttribute('data-screen'), 'home', 'dragging on a tab must not activate it');
    const campaign = await p.locator('.tk-campaign-stage').boundingBox();
    const middle = [campaign.x + campaign.width / 2, campaign.y + campaign.height / 2];
    await swipe(cdp, [middle[0] + 52, middle[1]], [middle[0] - 52, middle[1]]);
    await p.waitForFunction(() =>
      document.querySelector('.tk-campaign')?.getAttribute('data-featured') === 'caramel-frappe' &&
      document.querySelector('.tk-edition-pages [aria-pressed="true"]')?.getAttribute('aria-label') === document.getElementById('tk-campaign-name')?.textContent,
    );
    assert.equal(await p.locator('.tk-app').getAttribute('data-screen'), 'home', 'swiping the campaign selects the next drink without opening it');
    await p.locator('.coffee-signature-window').evaluate(el => el.scrollIntoView({block:'center'}));
    const hero = await p.locator('.coffee-signature-window').boundingBox();
    await swipe(cdp, [hero.x + hero.width - 24, hero.y + hero.height / 2], [hero.x + 20, hero.y + hero.height / 2]);
    await p.waitForFunction(() => Number(document.querySelector('.coffee-signature-window').dataset.first) > 0);
    assert.equal(await p.locator('.tk-app').getAttribute('data-screen'), 'home', 'swiping does not select a drink');
    await dock.locator('[data-tab=menu]').tap();
    await p.locator('.tk-filter-trigger').click();
    await p.evaluate(() => window.Telegram.WebView.receiveEvent('viewport_changed', { height: 780, is_expanded: true, is_state_stable: true }));
    await fashion.evaluate(()=>window.Telegram.WebView.receiveEvent('viewport_changed',{height:780,is_expanded:true,is_state_stable:true}));
    await Promise.all([p,fashion].map(page=>page.waitForFunction(()=>getComputedStyle(document.documentElement).getPropertyValue('--tg-viewport-height').trim()==='780px')));
    const resizedEdge=await dockEdge();await fashion.waitForFunction(edge=>Math.abs(document.querySelector('.mf-nav').getBoundingClientRect().bottom-edge)<0.1,resizedEdge);
    assert.ok(Math.abs(await dockEdge()-(await original.evaluate(geometry)).bottom)<0.5,'the dock follows the same resized viewport as the original');
    assert.ok(await edge()<=780,'sorting remains inside the resized viewport');
    await p.locator('dialog .tk-sheet-done').click();
    await p.locator('[data-drink=cappuccino]').click();
    await p.locator('.tk-recipe-map .tk-ingredient').first().waitFor();
    await p.locator('#root').evaluate(el=>el.scrollTo(0,el.scrollHeight));
    assert.ok(Math.abs(await dockEdge()-(await original.evaluate(geometry)).bottom)<0.5,'the builder stays anchored during scroll');
    await fashion.close();
  } finally { await ctx.close(); }
}

async function checkCompactCoffee(browser) {
  const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, hasTouch: true, isMobile: true, colorScheme: 'dark', serviceWorkers: 'block' });
  try {
    await installShowcaseTelegramHost(ctx, 640);
    const p = await ctx.newPage();
    await p.goto(new URL('#/demos/takt-coffee/app', site).href);
    await p.locator('.tk-campaign-link').waitFor();
    await p.evaluate(() => document.fonts.ready);
    const action = await p.locator('.tk-campaign-link').boundingBox();
    const dock = await p.locator('.tk-dock').boundingBox();
    assert.ok(action.y + action.height <= dock.y, 'the home menu action clears the coffee tabs on a short Telegram viewport');
    assert.equal(await p.locator('.tk-app').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)', 'the coffee store stays light in dark Telegram');
    await p.locator('.tk-campaign-link').tap();
    await p.locator('.tk-catalogue').waitFor();
  } finally { await ctx.close(); }
}

async function checkShowcaseButtonOverlay(browser, width, height, reportInsets = true) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  try {
    await installShowcaseTelegramHost(ctx, height, reportInsets);
    const page = await ctx.newPage();
    await page.goto(new URL('#/projects', site).href);
    await page.getByTestId('projects-showcase').waitFor();
    await page.waitForFunction(() => window.Telegram.WebApp.MainButton.isVisible && window.Telegram.WebApp.SecondaryButton.isVisible);
    // A host-owned row can cover the web content without changing either
    // viewport height. Give it a real hit surface, independent of app CSS.
    await page.evaluate(() => {
      const overlay = document.createElement('div');
      overlay.id = 'host-actions';
      overlay.style.cssText = 'position:fixed;inset:auto 0 0;height:98px;z-index:2147483647;background:white';
      document.body.append(overlay);
    });
    const geometry = () => page.evaluate(() => {
      const nav = document.querySelector('nav.projects-nav');
      const host = document.querySelector('#host-actions').getBoundingClientRect();
      return { gap: host.top - nav.getBoundingClientRect().bottom,
        reachable: [...nav.querySelectorAll('button')].every(button => {
          const box = button.getBoundingClientRect();
          return button.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
        }) };
    });
    const overlay = await geometry();
    assert.ok(overlay.gap >= 6 && overlay.reachable, 'native buttons cover app navigation: ' + JSON.stringify(overlay));
    // In the gap between the tab bar and host row, the scrolled card itself
    // must remain visible and receive the hit, even when both rows are fixed.
    const behindDock = await page.evaluate(async () => {
      const navBox = document.querySelector('nav.projects-nav').getBoundingClientRect();
      const y = Math.ceil(navBox.bottom) + 3;
      const card = document.querySelectorAll('.ps-card')[3];
      const rect = card.getBoundingClientRect();
      document.getElementById('root').scrollTop += rect.y + rect.height / 2 - y;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return card.contains(document.elementFromPoint(innerWidth / 2, y));
    });
    assert.ok(behindDock, 'the floating nav must not leave a full-width blank block behind it');
    // Same physical row, but now the WebView reports the space it consumes.
    await page.evaluate(h => window.Telegram.WebView.receiveEvent('viewport_changed',
      { height: h - 64, is_expanded: true, is_state_stable: true }), height);
    const resized = await geometry();
    assert.ok(resized.reachable && resized.gap >= 6 && resized.gap < 34, 'native row was deducted twice: ' + JSON.stringify(resized));
    await page.evaluate(h => {
      window.Telegram.WebView.receiveEvent('viewport_changed', { height: h, is_expanded: true, is_state_stable: true });
      Object.defineProperty(window.visualViewport, 'height', { configurable: true, value: h - 64 });
      window.visualViewport.dispatchEvent(new Event('resize'));
    }, height);
    await page.waitForFunction(h => document.documentElement.style.getPropertyValue('--projects-visual-bottom') === (h - 64) + 'px', height);
    const visualOnly = await geometry();
    assert.ok(visualOnly.reachable && visualOnly.gap >= 6 && visualOnly.gap < 34);
    await page.evaluate(() => window.Telegram.WebView.receiveEvent('secondary_button_pressed'));
    await page.waitForFunction(() => window.showcaseShareLink?.startsWith('/share/url?'));
    await page.locator('#root').evaluate(root => { root.scrollTop = root.scrollHeight; });
    await page.waitForFunction(() => {
      const button = document.querySelector('.ps-order');
      const rect = button.getBoundingClientRect();
      return rect.bottom <= document.querySelector('nav.projects-nav').getBoundingClientRect().top
        && button.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    });
    if (reportInsets) await page.getByTestId('nav-constructor').tap();
    else await page.evaluate(() => window.Telegram.WebView.receiveEvent('main_button_pressed'));
    await page.getByTestId('order-page').waitFor();
    console.log('PASS native overlay + resize + share', width, height, { reportInsets, overlay, resized, visualOnly });
  } finally { await ctx.close(); }
}

async function checkShowcaseEnd(page, cdp) {
  await page.waitForFunction(() => window.Telegram.WebApp.MainButton.isVisible && window.Telegram.WebApp.SecondaryButton.isVisible);
  const geometry = () => page.evaluate(() => {
    const root = document.getElementById('root');
    return [root.clientHeight, root.scrollTop, document.querySelector('nav.projects-nav').getBoundingClientRect().top];
  });
  const initial = await geometry();
  for (const height of [674, 633, 598, 683]) {
    await page.evaluate(async h => {
      window.Telegram.WebView.receiveEvent('viewport_changed', { height: h, is_expanded: true, is_state_stable: false });
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, height);
    assert.deepEqual(await geometry(), initial, 'the dock and the scroll area must stay still while Telegram animates');
  }
  // Resize the native sheet during the trip. Exercise the SDK events and
  // actual finger drags all the way down instead of jumping next to the CTA.
  await page.evaluate(() => {
    const bridge = window.Telegram.WebView;
    bridge.receiveEvent('viewport_changed', { height: 684, is_expanded: true, is_state_stable: true });
    bridge.receiveEvent('content_safe_area_changed', { top: 48, bottom: 48, left: 0, right: 0 });
  });
  await page.waitForFunction(() => window.Telegram.WebApp.viewportHeight === 684);
  const root = page.locator('#root');
  // Starting a drag on the black action must scroll without importing the demo.
  const firstAction = page.getByTestId('card-app-muraka-fashion').locator('.ps-open');
  await firstAction.scrollIntoViewIfNeeded();
  const actionBox = await firstAction.boundingBox();
  const topBefore = await root.evaluate(el => el.scrollTop);
  const demoRequests = [];
  const onRequest = request => {
    if (/\/assets\/(MurakaFashion|DemoAppShell)-[^/]+\.js/.test(new URL(request.url()).pathname)) demoRequests.push(request.url());
  };
  page.on('request', onRequest);
  const actionX = actionBox.x + actionBox.width / 2;
  const actionY = actionBox.y + actionBox.height / 2;
  await swipe(cdp, [actionX, actionY], [actionX, actionY - 130]);
  await page.waitForFunction(top => document.getElementById('root').scrollTop > top + 40, topBefore);
  page.off('request', onRequest);
  assert.deepEqual(demoRequests, []);
  assert.equal(new URL(page.url()).hash, '#/projects');
  for (let i = 0; i < 14; i++) {
    if (await root.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop < 2)) break;
    const x = i % 2 ? 95 : 280;
    await swipe(cdp, [x, 515], [x, 175]);
  }
  assert.ok(await root.evaluate(el => el.scrollHeight - el.clientHeight - el.scrollTop < 2), 'swiping cards must reach the end');
  const order = await page.locator('.ps-order').boundingBox();
  const nav = await page.locator('nav.projects-nav').boundingBox();
  const scrollBox = await root.boundingBox();
  assert.ok(scrollBox.y + scrollBox.height >= nav.y + nav.height, 'the list must remain visible behind the floating tab bar');
  assert.ok(nav.y + nav.height <= 684 - 48 + 1, 'navigation must fit inside the visible Telegram viewport');
  assert.ok(order.y >= 0 && order.y + order.height + 16 <= nav.y, 'order button is obscured at the end of the showcase');
  const topAtEnd = await root.evaluate(el => el.scrollTop);
  const centerY = order.y + order.height / 2;
  await swipe(cdp, [180, centerY], [180, centerY + 85]);
  assert.equal(new URL(page.url()).hash, '#/projects', 'a drag starting on the CTA must not order an app');
  assert.ok(await root.evaluate(el => el.scrollTop) < topAtEnd - 20, 'a drag on the CTA must scroll the page');
  await swipe(cdp, [180, 425], [180, 175]);
  await page.waitForFunction(() => {
    const el = document.getElementById('root');
    return el.scrollHeight - el.clientHeight - el.scrollTop < 2;
  });
  await page.touchscreen.tap(order.x + order.width / 2, order.y + order.height / 2);
  await page.getByTestId('order-page').waitFor();
}

async function checkShowcaseArtwork(browser) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  let releaseImages;
  const gate = new Promise(resolve => { releaseImages = resolve; });
  const oldLayers = [];
  try {
    await ctx.route('**/*', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.resourceType() === 'image') {
        if (/\/showcase\/(covers|screens)\//.test(url.pathname)) oldLayers.push(url.pathname);
        if (/\/assets\/.*\.webp$/.test(url.pathname)) await gate;
      }
      await route.fallback();
    });
    const page = await ctx.newPage();
    await page.goto(new URL('#/projects', site).href, { waitUntil: 'domcontentloaded' });
    const cards = page.locator('.ps-card');
    await cards.first().waitFor();
    assert.equal(await cards.count(), demoApps.length);
    const baked = cards.locator('.ps-art:not(.ps-art-furniture)');
    const furniture = cards.locator('.ps-art-furniture');
    assert.equal(await furniture.count(), 1, 'the furniture handset has a live screen');
    assert.equal(await furniture.locator('.ps-device-display img').count(), 1);
    const state = await baked.evaluateAll(nodes => ({
      requested: nodes.filter(node => node.firstElementChild.hasAttribute('src')).length,
      sheets: new Set(nodes.map(node => getComputedStyle(node).backgroundImage)).size,
      positions: new Set(nodes.map(node => getComputedStyle(node).backgroundPosition)).size,
    }));
    assert.ok(state.requested <= 4, 'only nearby detail images should be requested on entry');
    assert.equal(state.sheets, 1, 'previews share one decoded sheet');
    assert.equal(state.positions, demoApps.length - 1, 'each precomposed card needs a different thumbnail');
    const previews = await baked.evaluateAll(nodes => Promise.all(nodes.map(async node => {
      const background = getComputedStyle(node).backgroundImage;
      if (!background.startsWith('url("data:image/webp;base64,')) return false;
      const preview = new Image();
      preview.src = background.slice(5, -2);
      await preview.decode();
      return preview.naturalWidth > 0 && getComputedStyle(node.firstElementChild).opacity === '0';
    })));
    assert.ok(previews.every(Boolean), 'every card needs its complete offline preview while detail images are held');
    await cards.last().scrollIntoViewIfNeeded();
    const art = cards.last().locator('.ps-art');
    const size = await art.boundingBox();
    releaseImages();
    await cards.last().locator('.ps-art-ready').waitFor();
    assert.deepEqual(await art.boundingBox(), size, 'decoding the detail must not move the image');
    await cards.first().scrollIntoViewIfNeeded();
    await cards.first().locator('.ps-art-ready').waitFor();
    assert.ok(oldLayers.every(url => /\/furniture-studio[^/]*\.(webp|png)$/.test(url)), 'only the live furniture handset loads separate layers');
    console.log('PASS complete previews on cold open and scroll before detail images arrive');
  } finally { releaseImages(); await ctx.close(); }
}

async function checkShowcaseGeometry(browser, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  let releaseSdk, releaseRoute;
  const sdk = new Promise(resolve => { releaseSdk = resolve; });
  const chunk = new Promise(resolve => { releaseRoute = resolve; });
  try {
    await ctx.route('https://telegram.org/js/telegram-web-app.js', async route => {
      await sdk;
      await route.fulfill({ contentType:'text/javascript', body:'' });
    });
    await ctx.route(/\/assets\/ProjectsPage-[^/]+\.js$/, async route => { await chunk; await route.fallback(); });
    const page = await ctx.newPage();
    await page.goto(new URL('#/projects', site).href, { waitUntil:'commit' });
    const boxes = async selector => {
      const items = page.locator(selector);
      await items.first().waitFor();
      return items.evaluateAll(nodes => nodes.slice(0,2).map(node => {
        const { x,y,width,height } = node.getBoundingClientRect();
        return [x,y,width,height].map(Math.round);
      }));
    };
    const initial = await boxes('#projects-static-shell .projects-load-card');
    releaseSdk();
    assert.deepEqual(await boxes('[data-testid=projects-skeleton] .projects-load-card'), initial);
    releaseRoute();
    assert.deepEqual(await boxes('.ps-card'), initial, 'first two cards must match both loading layouts');
    console.log('PASS stable showcase geometry', width, JSON.stringify(initial));
  } finally { releaseSdk(); releaseRoute(); await ctx.close(); }
}

async function run() {
  const coveredDemos = cases.filter(([hash]) => hash.startsWith('#/demos/')).map(([hash]) => hash.split('/')[2]);
  assert.deepEqual(coveredDemos.sort(), demoApps.map(demo => demo.id).sort(), 'every published demo needs a swipe case');
  const safari = await webkit.launch({ headless: true });
  try {
    await checkShowcaseGeometry(safari, 320);
    await checkShowcaseGeometry(safari, 390);
  } finally { await safari.close(); }
  const browser = await chromium.launch({ headless: true });
  try {
    await checkCoffeeHost(browser);
    await checkCompactCoffee(browser);
    await checkShowcaseGeometry(browser, 320);
    await checkShowcaseGeometry(browser, 390);
    await checkShowcaseArtwork(browser);
    await checkShowcaseButtonOverlay(browser, 320, 700);
    await checkShowcaseButtonOverlay(browser, 390, 844);
    await checkShowcaseButtonOverlay(browser, 390, 844, false);
    for (const [hash, selector, hasHistory] of cases) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, locale: 'ru-RU', serviceWorkers: 'block' });
      try {
        if (hash === '#/projects') await installShowcaseTelegramHost(ctx);
        else await ctx.route('https://telegram.org/js/telegram-web-app.js', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
        await ctx.route('**/api/**', r => r.fulfill({ json: { data: [] } }));
        if (hash === '#/profile') {
          await ctx.addInitScript(() => {
            const history = Array.from({ length: 36 }, (_, index) => ({
              id: 'scroll-test-' + index,
              role: index % 2 === 0 ? 'user' : 'assistant',
              content: 'Conversation history for touch scrolling, message ' + index,
              timestamp: new Date(1700000000000 + index * 60000).toISOString(),
            }));
            for (const key of ['web4tg_ai_demo_chat', 'web4tg_ai_chat']) localStorage.setItem(key, JSON.stringify(history));
          });
        }
        const page = await ctx.newPage();
        await page.goto(new URL(hash, site).href);
        await page.locator(selector).first().waitFor();
        const cdp = await ctx.newCDPSession(page);
        await page.evaluate(() => {
          const root = document.getElementById('root');
          const stats = window.scrollTest = { start: root.scrollTop, writes: 0, events: 0, lastEvent: 0 };
          const replace = history.replaceState.bind(history);
          history.replaceState = (...args) => { stats.writes++; return replace(...args); };
          root.addEventListener('scroll', () => { stats.events++; stats.lastEvent = performance.now(); }, { passive: true });
        });
        const startY = hash === '#/projects' ? 520 : 650;
        await swipe(cdp, [195, startY], [195, startY - 335]);
        await page.waitForFunction(() => window.scrollTest.events > 0 && performance.now() - window.scrollTest.lastEvent > 220);
        if (hasHistory) await page.waitForFunction(() => window.scrollTest.writes > 0, undefined, { timeout: 3000 });
        const stats = await page.evaluate(() => ({ ...window.scrollTest, top: document.getElementById('root').scrollTop }));
        assert.ok(stats.top - stats.start > 80, hash + ' did not follow a vertical drag');
        if (hasHistory) assert.equal(stats.writes, 1, hash + ' must save a single settled position');
        else assert.equal(stats.writes, 0, hash + ' must keep history untouched during a drag');
        assert.equal(await page.locator('.w4m-panel.open').count(), 0, hash + ' opened the menu during a vertical drag');
        if (hash === '#/') {
          const beforeEdge = await page.locator('#root').evaluate(el => el.scrollTop);
          await swipe(cdp, [8, 520], [8, 340]);
          await page.waitForFunction(y => document.getElementById('root').scrollTop > y + 60, beforeEdge);
          assert.equal(await page.locator('.w4m-panel.open').count(), 0, 'a vertical swipe at the edge must scroll');
          await swipe(cdp, [8, 480], [210, 480]);
          await page.locator('.w4m-panel.open').waitFor();
        }
        if (hash === '#/profile') await checkChatScroll(page, cdp);
        if (hash === '#/projects') await checkShowcaseEnd(page, cdp);
        console.log(hash, JSON.stringify(stats));
      } finally { await ctx.close(); }
    }
  } finally { await browser.close(); }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
