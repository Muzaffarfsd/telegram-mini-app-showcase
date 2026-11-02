const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
// Point HOME_OLD_BUILD_DIR at the previous release's built dist directory.
const oldRoot = path.resolve(process.env.HOME_OLD_BUILD_DIR || path.join(__dirname, '../../order-release-434df7a/dist'));
const newRoot = path.resolve(process.env.HOME_NEW_BUILD_DIR || path.join(__dirname, '../dist'));
const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };
let newer = false;
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const relative = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  if (relative.includes('..')) { res.writeHead(400); res.end(); return; }
  const dirs = newer ? [newRoot, oldRoot] : [oldRoot, newRoot];
  const file = dirs.map(dir => path.join(dir, relative)).find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!file) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': type[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});
(async () => {
  if (!fs.existsSync(path.join(oldRoot, 'index.html')) || !fs.existsSync(path.join(newRoot, 'index.html'))) {
    throw new Error('Build both versions and set HOME_OLD_BUILD_DIR (and optionally HOME_NEW_BUILD_DIR) to their dist directories.');
  }
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: 'ru-RU', serviceWorkers: 'allow', reducedMotion: 'reduce' });
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.locator('.showcase-page').waitFor();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.showcase-page').waitFor();
    newer = true;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByTestId('home-page').waitFor({ state: 'visible' });
    await page.waitForFunction(() => Array.from(document.querySelectorAll('.studio-exhibit img')).every(img => img.complete && img.naturalWidth > 0));
    console.log('A client controlled by the old service worker loads the new home after the server release.');
    await context.close();
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
