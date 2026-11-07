import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../client/public/sw.js', import.meta.url), 'utf8');
const origin = 'https://app.example';

function worker(responseHeaders: Record<string, string> = {}) {
  const listeners = new Map<string, (event: any) => void>();
  const stores = new Map<string, Map<string, Response>>();
  const network: string[] = [];
  const windows: string[] = [];
  const messages: unknown[] = [];
  let queueCleared = false;
  let queueDeleted = false;
  const key = (value: string | Request) => new URL(typeof value === 'string' ? value : value.url, origin).href;
  const clients = new Map([
    ['trusted', { type: 'window', url: origin + '/', postMessage: (data: unknown) => messages.push(data) }],
    ['foreign', { type: 'window', url: 'https://attacker.example/', postMessage: (data: unknown) => messages.push(data) }],
  ]);
  const context = {
    URL, Request, Response, Headers, Set, Promise,
    caches: {
      keys: async () => [...stores.keys()],
      delete: async (name: string) => stores.delete(name),
      match: async (value: string | Request) => {
        for (const store of stores.values()) if (store.has(key(value))) return store.get(key(value))!.clone();
      },
      open: async (name: string) => {
        if (!stores.has(name)) stores.set(name, new Map());
        const store = stores.get(name)!;
        return {
          match: async (value: string | Request) => store.get(key(value))?.clone(),
          put: async (value: string | Request, response: Response) => { store.set(key(value), response.clone()); },
          keys: async () => [...store.keys()].map(url => new Request(url)),
          delete: async (value: string | Request) => store.delete(key(value)),
        };
      },
    },
    indexedDB: {
      open: () => {
        const request: any = {};
        queueMicrotask(() => {
          request.result = {
            objectStoreNames: { contains: () => true }, close() {},
            transaction: () => {
              const tx: any = { objectStore: () => ({ clear: () => { queueCleared = true; } }) };
              queueMicrotask(() => tx.oncomplete?.());
              return tx;
            },
          };
          request.onsuccess?.();
        });
        return request;
      },
      deleteDatabase: () => { queueDeleted = true; return {}; },
    },
    fetch: async (input: string | Request) => {
      network.push(key(input));
      return new Response('public-asset', { headers: responseHeaders });
    },
    self: {
      location: { origin },
      registration: { showNotification: async () => {} },
      skipWaiting: async () => {},
      clients: {
        claim: async () => {},
        get: async (id: string) => clients.get(id),
        matchAll: async () => [],
        openWindow: async (url: string) => { windows.push(url); },
      },
      addEventListener: (type: string, listener: (event: any) => void) => listeners.set(type, listener),
    },
  };
  vm.runInNewContext(source, context);
  return {
    stores, network, windows, messages,
    get queueCleared() { return queueCleared; },
    get queueDeleted() { return queueDeleted; },
    async dispatch(type: string, values: Record<string, unknown> = {}) {
      const pending: Promise<unknown>[] = [];
      let response: Promise<Response> | undefined;
      listeners.get(type)?.({ ...values,
        waitUntil: (promise: Promise<unknown>) => pending.push(promise),
        respondWith: (promise: Promise<Response>) => { response = Promise.resolve(promise); },
      });
      await Promise.all(pending);
      return response ? await response : undefined;
    },
  };
}

test('service worker never intercepts API reads, sensitive writes or credentialled assets', async () => {
  const sw = worker();
  sw.stores.set('api-v12', new Map([[origin + '/api/user/stats', new Response('another-user')]]));
  for (const request of [
    new Request(origin + '/api/user/stats'),
    new Request(origin + '/api/photos', { method: 'POST', headers: { 'x-telegram-init-data': 'test-session' }, body: '{}' }),
    new Request(origin + '/assets/app.js', { headers: { Authorization: 'test-auth' } }),
    new Request('https://attacker.example/assets/app.js'),
  ]) assert.equal(await sw.dispatch('fetch', { request }), undefined);
  assert.deepEqual(sw.network, []);
});

test('activation clears legacy private caches and queued credential-bearing requests', async () => {
  const sw = worker();
  for (const name of ['api-v12', 'data-v12', 'static-v12', 'unrelated-cache']) sw.stores.set(name, new Map());
  await sw.dispatch('activate');
  assert.equal(sw.stores.has('api-v12'), false);
  assert.equal(sw.stores.has('data-v12'), false);
  assert.equal(sw.stores.has('static-v12'), false);
  assert.equal(sw.stores.has('unrelated-cache'), true);
  assert.equal(sw.queueCleared, true);
  assert.equal(sw.queueDeleted, true);
});

test('public assets still cache, while no-store responses do not', async () => {
  const sw = worker();
  const request = new Request(origin + '/assets/app.js');
  assert.equal((await sw.dispatch('fetch', { request }))?.status, 200);
  await sw.dispatch('fetch', { request });
  assert.equal(sw.network.length, 1);
  const privateResponse = worker({ 'Cache-Control': 'private, no-store' });
  await privateResponse.dispatch('fetch', { request });
  await privateResponse.dispatch('fetch', { request });
  assert.equal(privateResponse.network.length, 2);
});

test('cache messages cannot populate API data or fetch arbitrary external addresses', async () => {
  const sw = worker();
  const data = { type: 'CACHE_URLS', urls: ['/assets/app.js', '/api/profile', 'https://attacker.example/a.js'] };
  await sw.dispatch('message', { source: { id: 'foreign' }, data });
  assert.equal(sw.network.length, 0);
  await sw.dispatch('message', { source: { id: 'trusted' }, data });
  assert.deepEqual(sw.network, [origin + '/assets/app.js']);
  await sw.dispatch('message', { source: { id: 'trusted' }, data: { type: 'CACHE_DEMO_DATA', demoId: '../profile', data: {} } });
  assert.equal([...sw.stores.values()].some(store => [...store.keys()].some(url => url.includes('/api/'))), false);
});

test('notification clicks cannot open a foreign origin', async () => {
  const sw = worker();
  await sw.dispatch('notificationclick', { notification: { close() {}, data: { url: 'https://attacker.example/' } } });
  assert.equal(sw.windows.length, 0);
  await sw.dispatch('notificationclick', { notification: { close() {}, data: { url: '/#/about' } } });
  assert.deepEqual(sw.windows, [origin + '/#/about']);
});
