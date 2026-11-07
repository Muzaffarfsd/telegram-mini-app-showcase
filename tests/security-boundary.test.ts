import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import express from 'express';
import type { Server } from 'node:http';
import { apiAccessPolicy, apiOriginPolicy, safeBodyPolicy, isPrivateStaticPath, inlineScriptHashes, contentSecurityDirectives, railwayClientAddress } from '../server/security';
import { redactMonitoringEvent } from '../server/redaction';

let server: Server;
let base: string;
const oldToken = process.env.TELEGRAM_BOT_TOKEN;
before(async () => {
  process.env.TELEGRAM_BOT_TOKEN = 'security-boundary-test-token';
  const app = express();
  app.use('/api', apiOriginPolicy, apiAccessPolicy);
  app.use(express.json({ limit: '128kb' }));
  app.use(safeBodyPolicy);
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  // Simulates a newly added demo route with no manually attached route middleware.
  app.all('/api/future-demo/private', (_req, res) => res.json({ protected: true }));
  app.post('/api/analytics/events', (_req, res) => res.json({ accepted: true }));
  server = await new Promise<Server>(resolve => { const instance = app.listen(0, '127.0.0.1', () => resolve(instance)); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing local test address');
  base = `http://127.0.0.1:${address.port}`;
});
after(async () => {
  if (oldToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = oldToken;
  await new Promise<void>(resolve => server.close(() => resolve()));
});
function signedIdentity() {
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id: 123, first_name: 'Security test' }) });
  const input = [...params].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n');
  const key = createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  params.set('hash', createHmac('sha256', key).update(input).digest('hex'));
  return params.toString();
}
test('future demo API reads and writes are private without relying on per-route authors remembering auth', async () => {
  for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']) {
    assert.equal((await fetch(`${base}/api/future-demo/private`, { method })).status, 401);
  }
  assert.equal((await fetch(`${base}/api/future-demo/private`, { headers: { 'x-telegram-init-data': signedIdentity() } })).status, 200);
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
});
test('origin policy rejects suffix and prefix spoofing, null and cross-site requests', async () => {
  for (const origin of ['https://web.telegram.org.evil.example', 'https://evil.example/https://telegram.org', 'null']) {
    const response = await fetch(`${base}/api/health`, { headers: { origin } });
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
  assert.equal((await fetch(`${base}/api/health`, { headers: { 'sec-fetch-site': 'cross-site' } })).status, 403);
  const allowed = await fetch(`${base}/api/health`, { headers: { origin: 'https://w4tg.up.railway.app' } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://w4tg.up.railway.app');
});
test('input structure rejects prototype keys and deeply nested JSON before routes use it', async () => {
  for (const body of ['{"__proto__":{"admin":true}}', '{"nested":{"constructor":{"prototype":{"admin":true}}}}', '['.repeat(30) + '0' + ']'.repeat(30)]) {
    assert.equal((await fetch(`${base}/api/analytics/events`, { method: 'POST', headers: { 'content-type': 'application/json' }, body })).status, 400);
  }
  assert.equal(({} as Record<string, unknown>).admin, undefined);
});
test('static source, credentials and backup paths are denied while normal demo assets remain valid', () => {
  for (const path of ['/.env', '/.git/config', '/downloads/FULL_PROJECT_CODE.txt', '/server/routes.ts', '/assets/main.js.map', '/data.sql', '/%2eenv', '/file.bak', '/node_modules/package.json']) assert.ok(isPrivateStaticPath(path), path);
  for (const path of ['/apple-store/generated/hero.webp', '/assets/index-a7cff193.js', '/fonts/GoogleSans.woff2', '/manifest.json', '/.well-known/security.txt']) assert.equal(isPrivateStaticPath(path), false, path);
});
test('production CSP authorizes exact bootstrap hashes and forbids arbitrary inline script, eval and framing', () => {
  const hashes = inlineScriptHashes('<script>console.log("trusted")</script><script src="/assets/index.js"></script>');
  assert.equal(hashes.length, 1);
  assert.match(hashes[0], /^'sha256-[A-Za-z0-9+/]+=*'$/);
  assert.notDeepEqual(hashes, inlineScriptHashes('<script>console.log("injected")</script>'));
  const policy = contentSecurityDirectives('nonexistent-test-file', true);
  assert.ok(!policy.scriptSrc.includes("'unsafe-inline'"));
  assert.ok(!policy.scriptSrc.includes("'unsafe-eval'"));
  assert.deepEqual(policy.scriptSrcAttr, ["'none'"]);
  assert.deepEqual(policy.objectSrc, ["'none'"]);
  assert.deepEqual(policy.baseUri, ["'none'"]);
});

test('monitoring redacts credentials in outbound bot spans, headers and URL queries', () => {
  const token = '123456789' + ':' + 'A'.repeat(35);
  const event = { spans: [{ description: `POST https://api.telegram.org/bot${token}/sendMessage` }], request: { url: 'https://example.test/api?initData=private', headers: { authorization: 'Bearer private', 'x-telegram-init-data': 'private' } } };
  const redacted = redactMonitoringEvent(event);
  assert.ok(!JSON.stringify(redacted).includes(token));
  assert.ok(!JSON.stringify(redacted).includes('private'));
  assert.equal(redacted.request.url, 'https://example.test/api');
});

test('client address normalization uses the Railway edge header only in that deployment context', () => {
  const priorEnv = process.env.NODE_ENV, priorDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  try {
    const request = () => ({ ip: '127.0.0.1', get: (name: string) => name === 'x-real-ip' ? '2001:db8::1' : undefined });
    process.env.NODE_ENV = 'production'; delete process.env.RAILWAY_PUBLIC_DOMAIN;
    const direct = request(); railwayClientAddress(direct as never, {} as never, () => {});
    assert.equal(direct.ip, '127.0.0.1');
    process.env.RAILWAY_PUBLIC_DOMAIN = 'w4tg.up.railway.app';
    const edge = request(); railwayClientAddress(edge as never, {} as never, () => {});
    assert.equal(edge.ip, '2001:db8::1');
  } finally {
    if (priorEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = priorEnv;
    if (priorDomain === undefined) delete process.env.RAILWAY_PUBLIC_DOMAIN; else process.env.RAILWAY_PUBLIC_DOMAIN = priorDomain;
  }
});
