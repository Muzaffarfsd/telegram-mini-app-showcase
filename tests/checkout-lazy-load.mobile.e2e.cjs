const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const site = process.env.CHECKOUT_TEST_URL || 'http://127.0.0.1:53736/';
const root = path.resolve(__dirname, '../client');
const fixtures = [
  [path.join(root, '__checkout_probe__.html'), '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="probe"></div><script type="module" src="/__checkout_probe__.tsx"></script></body></html>'],
  [path.join(root, '__checkout_probe__.tsx'), `import React from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from './src/contexts/LanguageContext';
let Checkout: any;
(window as any).__loadCheckout = async () => { Checkout = (await import('./src/components/CheckoutPage')).default; };
(window as any).__mountCheckout = () => createRoot(document.getElementById('probe')!).render(<LanguageProvider><Checkout selectedFeatures={[]} projectName="test" totalAmount={0} onBack={() => {}} onSuccess={() => {}} /></LanguageProvider>);`],
];

(async () => {
  for (const [file] of fixtures) if (fs.existsSync(file)) throw new Error(`Refusing to overwrite test fixture: ${file}`);
  const created = [];
  let browser;
  try {
    for (const [file, content] of fixtures) { fs.writeFileSync(file, content, { flag: 'wx' }); created.push(file); }
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    const providerRequests = [];
    await context.route('https://js.stripe.com/**', route => { providerRequests.push(route.request().url()); return route.fulfill({ contentType: 'text/javascript', body: 'window.Stripe = function () { return {}; };' }); });
    await context.route('https://m.stripe.network/**', route => route.abort());
    await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ contentType: 'text/javascript', body: '' }));
    await context.route('**/api/**', route => route.fulfill({ contentType: 'application/json', body: '{"data":[]}' }));
    const page = await context.newPage();
    page.on('pageerror', error => console.error('Browser error:', error.message));
    await page.goto(new URL('/#/', site).href, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('home-page').waitFor();
    await page.waitForTimeout(2500);
    assert.equal(providerRequests.length, 0, 'configured payment provider must not load on the home page');
    await page.goto(new URL('/__checkout_probe__.html', site).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__loadCheckout === 'function');
    await page.evaluate(() => window.__loadCheckout());
    await page.waitForTimeout(400);
    assert.equal(providerRequests.length, 0, 'prefetching the checkout module must not start the provider');
    await page.evaluate(() => window.__mountCheckout());
    await page.waitForFunction(() => [...document.scripts].some(script => script.src.startsWith('https://js.stripe.com/')), null, { timeout: 8000 });
    assert.equal(providerRequests.length, 1, 'opening checkout should load the provider exactly once');
    await context.close();
    console.log('Configured payment module: no provider on home or import; provider loads only when checkout opens (mocked, no payment).');
  } finally {
    if (browser) await browser.close();
    for (const file of created) fs.unlinkSync(file);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
