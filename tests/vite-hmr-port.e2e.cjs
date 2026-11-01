const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const vite = path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');

function availablePort() {
  return new Promise((resolve, reject) => {
    const listener = net.createServer();
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', () => {
      const port = listener.address().port;
      listener.close(error => error ? reject(error) : resolve(port));
    });
  });
}

function request(port) {
  return new Promise(resolve => {
    const req = http.get({ hostname: 'localhost', port, path: '/', timeout: 2000 }, res => { res.resume(); resolve(res.statusCode); });
    req.on('error', () => resolve(null));
    req.on('timeout', () => req.destroy());
  });
}

(async () => {
  assert.ok(fs.existsSync(vite));
  const port = await availablePort();
  const child = spawn(process.execPath, [vite, '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: root, env: { ...process.env, NODE_ENV: 'development', RAILWAY_ENVIRONMENT: '' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  child.stdout.on('data', data => { logs += data.toString(); });
  child.stderr.on('data', data => { logs += data.toString(); });
  let browser;
  try {
    let status = null;
    for (let i = 0; i < 60 && status !== 200; i++) {
      if (child.exitCode !== null) throw Error('Vite exited before the preview became ready');
      status = await request(port);
      if (status !== 200) await new Promise(resolve => setTimeout(resolve, 200));
    }
    assert.equal(status, 200, 'Preview should serve a page through localhost');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const ports = [];
    page.on('websocket', socket => { try { ports.push(new URL(socket.url()).port); } catch { /* Ignore non-URL websocket events. */ } });
    await page.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
    const response = await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200);
    for (let i = 0; i < 40 && !ports.length; i++) await page.waitForTimeout(100);
    assert.ok(ports.length > 0, 'Vite should open its live-update connection');
    assert.equal(ports[0], String(port), 'Live updates must use the actual preview port, not another local service');
    console.log('Vite: custom preview port serves HTTP and its own live-update connection');
  } catch (error) {
    if (logs.includes('EADDRINUSE')) console.error('A port conflict prevented the test server from starting.');
    throw error;
  } finally {
    if (browser) await browser.close();
    child.kill();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
