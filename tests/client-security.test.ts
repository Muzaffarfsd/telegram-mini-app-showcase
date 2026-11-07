import test from 'node:test';
import assert from 'node:assert/strict';
import { sameOriginApiUrl } from '../client/src/lib/apiUrl';
import { offlineStorage } from '../client/src/lib/offlineStorage';
import { cacheApiResponse, getCachedApiResponse } from '../client/src/lib/telegramStorage';

const origin = 'https://app.example';

test('API URL boundary accepts same-origin API calls and rejects credential exfiltration targets', () => {
  assert.equal(sameOriginApiUrl('/api/photos?limit=5', origin), '/api/photos?limit=5');
  assert.equal(sameOriginApiUrl('https://app.example/api/profile', origin), '/api/profile');
  for (const url of [
    'https://attacker.example/api/profile', '//attacker.example/api/profile',
    'http://app.example/api/profile', 'javascript:alert(1)', '/profile',
    '/api/../admin', '/api/%2e%2e/admin', 'https://user:pass@app.example/api/profile',
    '/api/profile#fragment', '\\attacker.example/api/profile',
  ]) assert.throws(() => sameOriginApiUrl(url, origin), undefined, url);
});

test('device-wide mutation queues cannot silently replay writes under another session', async () => {
  await assert.rejects(offlineStorage.addPendingAction({ type: 'CREATE', endpoint: '/api/orders', payload: {} }));
  const storage = Object.create(offlineStorage);
  let cleared = false;
  let requests = 0;
  storage.getPendingActions = async () => [{ id: 'old', endpoint: '/api/orders' }];
  storage.clearPendingActions = async () => { cleared = true; };
  const result = await storage.syncPendingActions(async () => { requests++; return true; });
  assert.equal(requests, 0);
  assert.equal(cleared, true);
  assert.deepEqual(result, { synced: 0, failed: 1 });
});

test('generic API response helpers do not persist or return device-wide private data', async () => {
  await cacheApiResponse('/api/user/stats', { private: 'test-value' });
  assert.equal(await getCachedApiResponse('/api/user/stats'), null);
});
