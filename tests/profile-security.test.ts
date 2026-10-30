import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import express from 'express';
import type { Server } from 'node:http';

// A deliberately unreachable database: these authentication tests must not access real data.
process.env.DATABASE_URL = 'postgresql://profile_test:profile_test@127.0.0.1:1/profile_test';
process.env.TELEGRAM_BOT_TOKEN = 'test-only-profile-bot-token';
const { default: projectsRouter } = await import('../server/routes/projects');
const { default: referralsRouter } = await import('../server/routes/referrals');
const { pool } = await import('../server/db');
const { generateCSRFToken, validateCSRF } = await import('../server/routes/shared');
let server: Server;
let baseUrl: string;

function initData(id: number) {
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id, first_name: 'Test' }) });
  const check = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  params.set('hash', createHmac('sha256', secret).update(check).digest('hex'));
  return params.toString();
}

before(async () => {
  const app = express(); app.use(express.json()); app.use('/api', validateCSRF); app.use(projectsRouter); app.use(referralsRouter);
  server = await new Promise<Server>(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No local address');
  baseUrl = `http://127.0.0.1:${address.port}`;
});
after(async () => { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); await pool.end(); });

test('project listing requires authenticated Telegram identity matching requested account', async () => {
  assert.equal((await fetch(`${baseUrl}/api/user-projects/123`)).status, 401);
  assert.equal((await fetch(`${baseUrl}/api/user-projects/124`, { headers: { 'x-telegram-init-data': initData(123) } })).status, 403);
  const response = await fetch(`${baseUrl}/api/user-projects/123`, { headers: { 'x-telegram-init-data': initData(123) } });
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), []);
});

test('referral endpoint rejects identity spoofing and malformed codes before touching the database', async () => {
  const send = async (body: unknown, auth = initData(123), token?: string) => fetch(`${baseUrl}/api/referral/apply`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-init-data': auth, 'x-csrf-token': token ?? await generateCSRFToken(auth, true) }, body: JSON.stringify(body) });
  assert.equal((await send({ userId: 124, referralCode: 'W4TABC' })).status, 403);
  assert.equal((await send({ userId: 123, referralCode: 'W4T!BAD' })).status, 400);
  assert.equal((await send({ userId: 123, referralCode: 'W4TABC' }, 'invalid')).status, 401);
  const tokenForAnotherSession = await generateCSRFToken(initData(125), true);
  assert.equal((await send({ userId: 123, referralCode: 'W4TABC' }, initData(123), tokenForAnotherSession)).status, 403);
  const missing = await fetch(`${baseUrl}/api/referral/apply`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-init-data': initData(123) }, body: '{}' });
  assert.equal(missing.status, 403);
});
