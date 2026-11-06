import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isChunkLoadError, recoverChunkLoad } from '../client/src/utils/lazyWithRecovery';

test('recognises browser module and CSS preload errors without treating arbitrary errors as network failures', () => {
  for (const message of [
    'Failed to fetch dynamically imported module: https://example.test/assets/demo.js',
    'Importing a module script failed.',
    'error loading dynamically imported module',
    'Unable to preload CSS for /assets/demo.css',
  ]) assert.equal(isChunkLoadError(new TypeError(message)), true, message);
  assert.equal(isChunkLoadError(new Error('Cannot read properties of undefined')), false);
});

test('guards rapid reloads and caps automatic attempts for each bundle', () => {
  let bundle = 'https://example.test/assets/index-old.js';
  let reloads = 0;
  let now = 1_000_000;
  const originalNow = Date.now;
  Date.now = () => now;
  const storage = new Map<string, string>();
  Object.assign(globalThis, {
    window: { location: { pathname: '/', reload: () => { reloads++; } } },
    document: { querySelector: () => ({ src: bundle }) },
    sessionStorage: { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => storage.set(key, value) },
  });
  const error = new TypeError('Failed to fetch dynamically imported module');
  assert.equal(recoverChunkLoad(error), true);
  assert.equal(recoverChunkLoad(error), false);
  assert.equal(reloads, 1);
  now += 60_000;
  assert.equal(recoverChunkLoad(error), true);
  now += 60_000;
  assert.equal(recoverChunkLoad(error), true);
  now += 60_000;
  assert.equal(recoverChunkLoad(error), false);
  assert.equal(reloads, 3);
  bundle = 'https://example.test/assets/index-new.js';
  assert.equal(recoverChunkLoad(error), true);
  assert.equal(reloads, 4);
  Date.now = originalNow;
});

test('does not reload if session storage is unavailable', () => {
  let reloads = 0;
  Object.assign(globalThis, {
    window: { location: { pathname: '/', reload: () => { reloads++; } } },
    document: { querySelector: () => ({ src: 'https://example.test/assets/index.js' }) },
    sessionStorage: { getItem: () => { throw new Error('blocked'); } },
  });
  assert.equal(recoverChunkLoad(new TypeError('Importing a module script failed.')), false);
  assert.equal(reloads, 0);
});
