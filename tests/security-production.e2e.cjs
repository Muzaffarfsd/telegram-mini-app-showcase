const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const base = new URL(process.env.SECURITY_BASE_URL || 'http://127.0.0.1:5199');
assert.ok(['http:', 'https:'].includes(base.protocol));
const reportDir = process.env.SECURITY_REPORT_DIR || path.join(os.tmpdir(), 'web4tg-security-browser');
fs.mkdirSync(reportDir, { recursive: true });
const registry = fs.readFileSync(path.join(__dirname, '../client/src/components/demos/DemoRegistry.ts'), 'utf8');
const metadata = fs.readFileSync(path.join(__dirname, '../client/src/data/demoApps.ts'), 'utf8');
const shell = fs.readFileSync(path.join(__dirname, '../client/src/components/DemoAppShell.tsx'), 'utf8');
const registered = [...registry.matchAll(/^  '([^']+)': \{/gm)].map(match => match[1]);
const published = new Set([...metadata.matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1]));
const aliases = new Map([...shell.matchAll(/demoId === '([^']+)'\s*\?\s*'([^']+)'\s*:\s*demoId/g)].map(match => [match[1], match[2]]));
const isActive = id => published.has(aliases.get(id) || id);
assert.ok(registered.length > 0, 'Read the actual registry; an empty scan must not pass');
const demoRoots = {
  'flower-store': 'flower-store', 'china-buyer': 'china-buyer',
  'medical-center': 'medical-center', 'lumi-studio': 'lumi-studio',
  'opt-market': 'opt-market', 'apple-store': 'apple-store',
  'muraka-fashion': 'muraka-fashion', 'women-fashion': 'women-fashion', 'jewelry-store': 'jewelry-store',
  'nike-sneakers': 'royal-step', 'royal-step': 'royal-step',
};
const routes = [
  { name: 'home', hash: '/', selector: '[data-testid="home-page"]' },
  { name: 'about', hash: '/about', selector: '[data-testid="about-page"]' },
  { name: 'constructor', hash: '/constructor', selector: '[data-testid="order-page"]' },
  { name: 'profile', hash: '/profile', selector: '[data-testid="profile-page"]' },
  { name: 'ai', hash: '/ai-process', selector: '[data-testid="consultant-page"]' },
  ...registered.map(id => ({
    name: `demo-${id}`, hash: `/demos/${id}/app`,
    active: isActive(id), demoId: id,
    selector: demoRoots[id] ? `[data-testid="${demoRoots[id]}"]` : '[data-testid="demo-content"]',
  })),
];

function safeAddress(value) {
  if (!value || ['inline', 'eval', 'wasm-eval', 'data', 'blob'].includes(value)) return value;
  try { const url = new URL(value); return `${url.origin}${url.pathname}`; } catch { return String(value).slice(0, 120); }
}

async function checkHeaders(browser) {
  const context = await browser.newContext();
  try {
    const html = await context.request.get(base.origin + '/');
    assert.equal(html.status(), 200);
    const headers = html.headers();
    const csp = headers['content-security-policy'];
    assert.ok(csp, 'Production must enforce CSP');
    const script = csp.split(';').find(value => value.trim().startsWith('script-src ')) || '';
    assert.match(script, /'self'/);
    assert.doesNotMatch(script, /'unsafe-inline'|'unsafe-eval'/);
    assert.match(csp, /script-src-attr\s+'none'/);
    assert.match(csp, /object-src\s+'none'/);
    assert.match(csp, /frame-ancestors/);
    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.ok(headers['referrer-policy']);
    for (const target of ['/.env', '/downloads/FULL_PROJECT_CODE.md', '/downloads/FULL_PROJECT_CODE.txt', '/server/index.ts', '/package.json', '/assets/security-probe.js.map']) {
      const response = await context.request.get(base.origin + target);
      assert.equal(response.status(), 404, `${target} must not disclose source or credentials`);
    }
    for (const target of ['/api/user-projects/12345', '/api/notifications']) {
      const response = await context.request.get(base.origin + target);
      assert.equal(response.status(), 401, `${target} must reject unauthenticated access`);
      assert.match(response.headers()['cache-control'] || '', /no-store/i);
    }
    const forged = await context.request.get(base.origin + '/api/user-projects/12345', {
      headers: { 'x-telegram-init-data': 'user=%7B%22id%22%3A12345%7D&auth_date=1700000000&hash=invalid' },
    });
    assert.equal(forged.status(), 401, 'Forged Telegram data must not authenticate');
    const token = await context.request.get(base.origin + '/api/csrf-token');
    assert.equal(token.status(), 200);
    assert.match(token.headers()['cache-control'] || '', /no-store/i);
    const health = await context.request.get(base.origin + '/api/health');
    assert.equal(health.status(), 200);
    return { html: 200, privatePaths: 6, unauthenticatedApi: 2, forgedTelegram: 401, health: 200 };
  } finally { await context.close(); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    const headers = await checkHeaders(browser);
    for (const route of routes) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
        locale: 'ru-RU', reducedMotion: 'reduce', serviceWorkers: 'block',
      });
      const page = await context.newPage();
      const pageErrors = [];
      const cspRequestFailures = [];
      const otherRequestFailures = [];
      const suppressed = new Set();
      let suppressedMutations = 0;
      page.on('pageerror', error => pageErrors.push(error.message.slice(0, 300)));
      page.on('requestfailed', request => {
        if (suppressed.has(request.method() + ' ' + request.url())) return;
        const failure = { url: safeAddress(request.url()), error: request.failure()?.errorText || 'failed' };
        if (/CSP|CONTENT_SECURITY|BLOCKED_BY/i.test(failure.error)) cspRequestFailures.push(failure);
        else otherRequestFailures.push(failure);
      });
      // The smoke test must not mutate backend state. Normal asset/API reads are
      // left intact, so the real enforced CSP and unauthenticated state apply.
      await context.route(base.origin + '/api/**', handler => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(handler.request().method())) {
          suppressedMutations++;
          suppressed.add(handler.request().method() + ' ' + handler.request().url());
          return handler.fulfill({ status: 204 });
        }
        return handler.continue();
      });
      await context.addInitScript(() => {
        window.__securityCspViolations = [];
        window.addEventListener('securitypolicyviolation', event => {
          window.__securityCspViolations.push({
            directive: event.effectiveDirective,
            blocked: event.blockedURI,
            disposition: event.disposition,
          });
        });
      });
      try {
        const response = await page.goto(base.origin + '/#' + route.hash, { waitUntil: 'domcontentloaded' });
        assert.equal(response?.status(), 200);
        if (route.demoId && !route.active) {
          await page.getByRole('heading', { name: 'Приложение недоступно', exact: true }).waitFor({ state: 'visible', timeout: 12000 });
        } else {
          await page.locator(route.selector).waitFor({ state: 'visible', timeout: 12000 });
          assert.ok((await page.locator(route.selector).innerText()).trim().length > 20, 'Critical UI must contain rendered content');
        }
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await page.waitForLoadState('networkidle', { timeout: 1500 }).catch(() => {});
        const csp = await page.evaluate(() => window.__securityCspViolations);
        const enforced = csp.filter(item => item.disposition === 'enforce').map(item => ({ ...item, blocked: safeAddress(item.blocked) }));
        assert.deepEqual(pageErrors, [], 'Application must render without JavaScript exceptions');
        assert.deepEqual(enforced, [], 'Application must run without enforced CSP violations');
        assert.deepEqual(cspRequestFailures, [], 'No request may be blocked by CSP');
        const result = {
          name: route.name, status: route.demoId && !route.active ? 'safe-unavailable' : 'rendered',
          pageErrors, cspViolations: enforced, suppressedMutations,
          externalNetworkWarnings: otherRequestFailures.slice(0, 5),
        };
        results.push(result);
        if (['home', 'about', 'demo-flower-store'].includes(route.name)) await page.screenshot({ path: path.join(reportDir, route.name + '.png') });
        console.log(JSON.stringify(result));
      } catch (error) {
        const csp = await page.evaluate(() => window.__securityCspViolations || []).catch(() => []);
        const failure = { name: route.name, status: 'failed', error: error.message.slice(0, 500), pageErrors, cspViolations: csp.map(item => ({ ...item, blocked: safeAddress(item.blocked) })), cspRequestFailures };
        results.push(failure);
        await page.screenshot({ path: path.join(reportDir, route.name + '-failed.png') }).catch(() => {});
        console.log(JSON.stringify(failure));
      } finally { await context.close(); }
    }
    const report = {
      origin: base.origin, headers, registeredDemos: registered.length,
      activeDemoRoutes: registered.filter(isActive).length,
      activeDemos: new Set(registered.filter(isActive).map(id => aliases.get(id) || id)).size,
      inactiveRegistryIds: registered.filter(id => !isActive(id)), results,
    };
    fs.writeFileSync(path.join(reportDir, 'report.json'), JSON.stringify(report, null, 2));
    assert.equal(results.filter(result => result.status === 'failed').length, 0, `See ${path.join(reportDir, 'report.json')}`);
    console.log(`PASS: ${results.length} routes; ${report.activeDemos} active demos; ${report.inactiveRegistryIds.length} unavailable legacy registry entries; report ${reportDir}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
