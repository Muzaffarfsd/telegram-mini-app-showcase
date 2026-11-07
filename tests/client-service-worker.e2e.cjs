const { chromium } = require('playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

// Isolated local origin: no real users, backend data or production mutations.
const sw = fs.readFileSync(path.join(__dirname, '../client/public/sw.js'));
let orders = 0;
let assetRequests = 0;
const server = http.createServer((req, res) => {
  if (req.url === '/sw.js') { res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'no-cache' }); return res.end(sw); }
  if (req.url === '/api/private') { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' }); return res.end(JSON.stringify({ session: req.headers['x-telegram-init-data'] || 'guest' })); }
  if (req.url === '/api/orders') { orders++; res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end('{}'); }
  if (req.url === '/assets/public.js') { assetRequests++; res.writeHead(200, { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=0' }); return res.end('/* public */'); }
  res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>Local security harness</title>');
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  try {
    const page = await context.newPage();
    await page.goto(origin);
    await page.evaluate(async () => {
      const cache = await caches.open('data-v12');
      await cache.put('/api/private', new Response('old-user-data'));
      await new Promise((resolve, reject) => {
        const request = indexedDB.open('syncQueue', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('pendingRequests', { autoIncrement: true });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('pendingRequests', 'readwrite');
          tx.objectStore('pendingRequests').add({ url: location.origin + '/api/orders', method: 'POST', headers: { 'x-telegram-init-data': 'old-test-session' }, body: {} });
          tx.oncomplete = () => { db.close(); resolve(); };
        };
      });
      await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    assert.equal(await page.evaluate(async () => (await caches.keys()).includes('data-v12')), false);
    const sessions = await page.evaluate(async () => {
      const result = [];
      for (const value of ['session-A', 'session-B']) result.push(await (await fetch('/api/private', { headers: { 'x-telegram-init-data': value }, cache: 'no-store' })).json());
      return result;
    });
    assert.deepEqual(sessions, [{ session: 'session-A' }, { session: 'session-B' }]);
    await context.setOffline(true);
    const offline = await page.evaluate(async () => {
      const results = [];
      for (const [url, method] of [['/api/private', 'GET'], ['/api/orders', 'POST']]) {
        try { const response = await fetch(url, { method, headers: { 'x-telegram-init-data': 'session-B' }, cache: 'no-store' }); results.push({ unexpected: true, status: response.status }); }
        catch { results.push({ failed: true }); }
      }
      return results;
    });
    assert.deepEqual(offline, [{ failed: true }, { failed: true }]);
    await context.setOffline(false);
    await page.waitForTimeout(200);
    assert.equal(orders, 0, 'Neither legacy nor failed writes may be replayed');
    await page.evaluate(async () => {
      for (let i = 0; i < 2; i++) await fetch('/assets/public.js', { cache: 'no-store' });
    });
    assert.equal(assetRequests, 1, 'Public static assets retain offline caching');
    const apiKeys = await page.evaluate(async () => {
      const keys = [];
      for (const name of await caches.keys()) for (const request of await (await caches.open(name)).keys()) if (new URL(request.url).pathname.startsWith('/api/')) keys.push(request.url);
      return keys;
    });
    assert.deepEqual(apiKeys, []);
    console.log('PASS: real Chromium worker purges private caches/old queue, does not cache API data or replay writes, and still caches public assets.');
  } finally {
    await context.close();
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
