import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { demoShareEntries, demoShareIdFromStartParam } from '../shared/demoShare';
import express from 'express';
import type { Server } from 'node:http';

process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/invite_test';
process.env.TELEGRAM_BOT_TOKEN = 'test-only-invite-token';
const { createInviteRouter } = await import('../server/routes/invite');
const { pool } = await import('../server/db');
const { generateCSRFToken, validateCSRF } = await import('../server/routes/shared');

let server: Server;
let baseUrl: string;
let lookup: (id: number) => Promise<string | null> = async () => null;
let calls: { url: string; body: any }[] = [];
let telegramStatus = 200;
let telegramPayload: unknown = { ok: true, result: { id: 'prepared-abc', expiration_date: 2000000000 } };

function initData(id: number) {
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id, first_name: 'Test' }) });
  const check = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  params.set('hash', createHmac('sha256', secret).update(check).digest('hex'));
  return params.toString();
}

async function send(body: unknown, auth = initData(123), csrf?: string) {
  return fetch(`${baseUrl}/api/telegram/prepare-invite`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-telegram-init-data': auth, 'x-csrf-token': csrf ?? await generateCSRFToken(auth, true) },
    body: JSON.stringify(body),
  });
}

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api', validateCSRF);
  app.use(createInviteRouter({
    findReferralCode: id => lookup(id),
    telegramFetch: (async (url: string | URL | Request, options?: RequestInit) => {
      calls.push({ url: String(url), body: JSON.parse(String(options?.body)) });
      return new Response(JSON.stringify(telegramPayload), { status: telegramStatus, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch,
  }));
  server = await new Promise<Server>(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No local address');
  baseUrl = `http://127.0.0.1:${address.port}`;
});
after(async () => { await new Promise<void>((resolve, reject) => server.close(e => e ? reject(e) : resolve())); await pool.end(); });

test('a verified user gets a prepared picture with a real Mini App button', async () => {
  calls = [];
  lookup = async () => { throw new Error('A general invitation must not query the DB'); };
  const response = await send({ language: 'ru', referral: false });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { messageId: 'prepared-abc', deepLink: 'https://t.me/w4tg_bot/w4tg' });
  assert.equal(calls.length, 1);
  const { body } = calls[0];
  assert.equal(body.user_id, 123);
  assert.equal(body.result.type, 'photo');
  assert.equal(body.result.photo_url, 'https://w4tg.up.railway.app/share/invite-three-stores-v1.jpg');
  assert.equal(body.result.thumbnail_url, body.result.photo_url);
  assert.equal(body.result.parse_mode, 'HTML');
  assert.match(body.result.caption, /^<b>WEB4TG<\/b>\n\n/);
  assert.match(body.result.caption, /магазин.*Telegram/);
  assert.deepEqual(body.result.reply_markup.inline_keyboard, [[{ text: 'Открыть приложение', url: 'https://t.me/w4tg_bot/w4tg', style: 'primary' }]]);
  assert.equal(body.allow_user_chats, true);
  assert.equal(body.allow_group_chats, true);
});

test('referral is resolved for the authenticated user, not from the request', async () => {
  calls = [];
  const lookedUp: number[] = [];
  lookup = async id => { lookedUp.push(id); return 'REF123'; };
  const response = await send({ language: 'en', referral: true }, initData(321));
  assert.equal(response.status, 200);
  assert.deepEqual(lookedUp, [321]);
  const data = await response.json() as any;
  assert.equal(data.deepLink, 'https://t.me/w4tg_bot/w4tg?startapp=REF123');
  assert.equal(calls[0].body.user_id, 321);
  assert.equal(calls[0].body.result.parse_mode, 'HTML');
  assert.match(calls[0].body.result.caption, /^<b>WEB4TG<\/b>\n\n/);
  assert.deepEqual(calls[0].body.result.reply_markup.inline_keyboard, [[{ text: 'Open app', url: data.deepLink, style: 'primary' }]]);
});

test('missing or unusable referral codes yield a general invitation, and database errors fail closed', async () => {
  for (const code of [null, 'bad?code']) {
    lookup = async () => code;
    const response = await send({ referral: true });
    assert.equal(response.status, 200);
    assert.equal((await response.json() as any).deepLink, 'https://t.me/w4tg_bot/w4tg');
  }
  calls = [];
  lookup = async () => { throw new Error('Database unavailable'); };
  assert.equal((await send({ referral: true })).status, 503);
  assert.equal(calls.length, 0);
});

test('each published demo gets its own server-chosen picture and Mini App deep link', async () => {
  for (const demoId of Object.keys(demoShareEntries)) {
    calls = [];
    lookup = async () => { throw new Error('Demo sharing must not query referral data'); };
    const response = await send({ language: 'ru', referral: false, demoId });
    assert.equal(response.status, 200, demoId);
    const result = await response.json() as { messageId: string; deepLink: string };
    const expected = `https://t.me/w4tg_bot/w4tg?startapp=demo_${demoId}`;
    assert.equal(result.deepLink, expected, demoId);
    assert.equal(demoShareIdFromStartParam(new URL(expected).searchParams.get('startapp')!), demoId);
    const message = calls[0].body.result;
    assert.equal(message.photo_url, `https://w4tg.up.railway.app/share/demos/${demoId}.jpg`);
    assert.equal(message.thumbnail_url, message.photo_url);
    assert.equal(message.reply_markup.inline_keyboard[0][0].url, expected);
    assert.equal(message.reply_markup.inline_keyboard[0][0].style, 'primary');
    assert.match(message.caption, /<b>.+<\/b>/);
  }
});

test('legacy sneaker alias is canonicalized and arbitrary demos or URLs are rejected', async () => {
  calls = [];
  const alias = await send({ demoId: 'royal-step' });
  assert.equal(alias.status, 200);
  assert.equal((await alias.json() as { deepLink: string }).deepLink, 'https://t.me/w4tg_bot/w4tg?startapp=demo_nike-sneakers');
  assert.equal(calls[0].body.result.photo_url, 'https://w4tg.up.railway.app/share/demos/nike-sneakers.jpg');
  assert.equal(demoShareIdFromStartParam('demo_royal-step'), 'nike-sneakers');
  for (const invalid of ['../../apple-store', 'fitness', 'unknown', 'constructor', '__proto__']) {
    calls = [];
    assert.equal((await send({ demoId: invalid })).status, 400, invalid);
    assert.equal(demoShareIdFromStartParam(`demo_${invalid}`), null);
    assert.equal(calls.length, 0);
  }
  calls = [];
  assert.equal((await send({ demoId: 'apple-store', referral: true })).status, 400);
  assert.equal(calls.length, 0);
});

test('authentication, CSRF and strict input prevent spoofing or arbitrary links', async () => {
  calls = [];
  assert.equal((await send({}, 'bad-auth')).status, 401);
  const auth = initData(123);
  assert.equal((await send({}, auth, 'bad-csrf')).status, 403);
  assert.equal((await send({ user_id: 456, url: 'https://example.org/' }, auth)).status, 400);
  assert.equal(calls.length, 0);
});

test('Telegram errors are not surfaced as credentials or false success', async () => {
  telegramStatus = 400;
  telegramPayload = { ok: false, description: 'private error detail' };
  const response = await send({ referral: false });
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: 'Could not prepare Telegram invitation' });
});
