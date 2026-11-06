import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import express from 'express';
import { serveStatic } from '../server/vite';

test('static serving keeps missing bundles out of the SPA fallback and preserves storage', async () => {
  const app = express();
  serveStatic(app);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected TCP server address');
  const base = `http://127.0.0.1:${address.port}`;

  try {
    const missing = await fetch(`${base}/assets/missing-bundle-for-test.js`);
    assert.equal(missing.status, 404);
    assert.match(missing.headers.get('content-type') || '', /^text\/plain/);
    assert.equal(missing.headers.get('clear-site-data'), null);
    assert.match(missing.headers.get('cache-control') || '', /no-store/);

    const route = await fetch(`${base}/some-client-side-route`);
    assert.equal(route.status, 200);
    assert.match(route.headers.get('content-type') || '', /^text\/html/);
    assert.equal(route.headers.get('clear-site-data'), null);

    const files = await readdir(resolve('dist/assets'));
    const bundle = files.find(file => file.endsWith('.js'));
    assert.ok(bundle, 'Build a client bundle before running this test');
    const existing = await fetch(`${base}/assets/${bundle}`);
    assert.equal(existing.status, 200);
    assert.match(existing.headers.get('cache-control') || '', /immutable/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
