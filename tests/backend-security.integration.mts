import { createRequire } from 'node:module';
import { createHmac } from 'node:crypto';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';

// Isolated PostgreSQL-compatible memory and synthetic Telegram signatures. No production data or outgoing bot messages.
const require = createRequire(`${process.cwd()}/package.json`);
const { newDb } = require('pg-mem');
const pg = require('pg');
const express = require('express');
const memory = newDb();
memory.public.none(`CREATE TABLE photos (id serial PRIMARY KEY, title varchar(255) NOT NULL, description text, object_path varchar(500) NOT NULL, thumbnail_path varchar(500), uploaded_at timestamp NOT NULL DEFAULT now(), user_id varchar(100)); INSERT INTO photos (title, object_path, user_id) VALUES ('Private owner test', '/objects/uploads/123/test', '123');`);
memory.public.none(`CREATE TABLE user_stories (id serial PRIMARY KEY, likes_count integer DEFAULT 0, fire_count integer DEFAULT 0, clap_count integer DEFAULT 0, heart_eyes_count integer DEFAULT 0, rocket_count integer DEFAULT 0, is_active boolean DEFAULT true, is_approved boolean DEFAULT false); INSERT INTO user_stories (is_approved) VALUES (false), (true); CREATE TABLE story_reactions (id serial PRIMARY KEY, story_id integer, telegram_id bigint, reaction_type varchar(20));`);
memory.public.none(`CREATE TABLE users (id serial PRIMARY KEY, telegram_id bigint UNIQUE NOT NULL, username varchar(255), first_name varchar(255), last_name varchar(255), referral_code varchar(50) UNIQUE NOT NULL, referred_by_code varchar(50), total_referrals integer NOT NULL DEFAULT 0, active_referrals integer NOT NULL DEFAULT 0, total_earnings numeric NOT NULL DEFAULT 0, pending_rewards numeric NOT NULL DEFAULT 0, tier varchar(50) DEFAULT 'Bronze' NOT NULL, level integer DEFAULT 1 NOT NULL, xp integer DEFAULT 0 NOT NULL, xp_to_next_level integer DEFAULT 100 NOT NULL, total_xp integer DEFAULT 0 NOT NULL, current_streak integer DEFAULT 1 NOT NULL, best_streak integer DEFAULT 1 NOT NULL, last_visit_date date DEFAULT now() NOT NULL, completed_tasks integer DEFAULT 0 NOT NULL, achievements jsonb DEFAULT '[]' NOT NULL, total_coins integer DEFAULT 0 NOT NULL, available_coins integer DEFAULT 0 NOT NULL, spent_coins integer DEFAULT 0 NOT NULL, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL); INSERT INTO users (telegram_id, referral_code, available_coins) VALUES (123, 'TEST123', 500);`);
const adapter = memory.adapters.createPg();
for (const Class of new Set([adapter.Pool, adapter.Client]) as Set<any>) {
  const original = Class.prototype.query;
  Class.prototype.query = function(config: any, ...args: any[]) {
    if (config && typeof config === 'object') {
      const clean = { ...config }; const arrayMode = clean.rowMode === 'array'; delete clean.rowMode; delete clean.types;
      const result = original.call(this, clean, ...args);
      return arrayMode ? Promise.resolve(result).then((r: any) => ({ ...r, rows: r.rows.map((row: any) => Object.values(row)) })) : result;
    }
    return original.call(this, config, ...args);
  };
}
pg.Pool = adapter.Pool;
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/synthetic';
process.env.TELEGRAM_BOT_TOKEN = '123456789' + ':' + 'S'.repeat(35);
process.env.TELEGRAM_WEBHOOK_SECRET = 'synthetic-webhook-secret-for-security-tests-1234567890';
process.env.ADMIN_TELEGRAM_IDS = '9001';
process.env.WEBAPP_URL = 'https://studio.example';
process.env.NODE_ENV = 'production';
delete process.env.STRIPE_SECRET_KEY;
const { pool } = await import('../server/db');
const { default: projects } = await import('../server/routes/projects');
const { default: photos } = await import('../server/routes/photos');
const { default: telegram } = await import('../server/routes/telegram');
const { default: notifications } = await import('../server/routes/notifications');
const { default: gamification } = await import('../server/routes/gamification');
const { default: analytics } = await import('../server/routes/analytics');
const { default: payments } = await import('../server/routes/payments');
const { default: ai } = await import('../server/routes/ai');
const { default: coinshop } = await import('../server/routes/coinshop');
const { default: stories } = await import('../server/routes/stories');
const { ObjectStorageService, objectStorageClient } = await import('../server/objectStorage');
const { sanitizeBodyMiddleware } = await import('../server/routes/shared');
const app = express(); app.use(express.json({ limit: '128kb' })); app.use(sanitizeBodyMiddleware);
for (const router of [projects, photos, telegram, notifications, gamification, analytics, payments, ai, coinshop, stories]) app.use(router);
const server = await new Promise<any>(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
const base = `http://127.0.0.1:${server.address().port}`;
function auth(id: number) {
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id, first_name: 'Synthetic' }) });
  const check = [...params].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => `${key}=${value}`).join('\n');
  const key = createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  params.set('hash', createHmac('sha256', key).update(check).digest('hex')); return params.toString();
}
function request(path: string, id?: number, body?: unknown, method = body === undefined ? 'GET' : 'POST', headers: Record<string,string> = {}) {
  return fetch(`${base}${path}`, { method, signal:AbortSignal.timeout(10000), headers: { ...(body === undefined ? {} : { 'content-type':'application/json' }), ...(id ? { 'x-telegram-init-data': auth(id) } : {}), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
try {
  for (const endpoint of ['/api/telegram/setup-webhook', '/api/telegram/setup-commands', '/api/telegram/setup-menu-button', '/api/notifications/send', '/api/notifications/broadcast', '/api/notifications/interactive', '/api/update-project-status', '/api/gamification/award-xp', '/api/gamification/complete-task', '/api/create-payment-intent', '/api/webhooks/referral']) {
    assert.equal((await request(endpoint, undefined, {})).status, 401, endpoint);
    assert.equal((await request(endpoint, 123, {})).status, 403, endpoint);
  }
  for (const endpoint of ['/api/telegram/webhook-info', '/api/telegram/bot-info', '/api/analytics/dashboard', '/api/analytics/summary', '/api/analytics/ab-stats']) assert.equal((await request(endpoint, 123)).status, 403, endpoint);
  assert.equal((await request('/api/telegram/setup-webhook', 9001, { url:'https://attacker.example' })).status, 400);
  assert.equal((await request('/api/telegram/webhook', undefined, { update_id: 1 })).status, 403);
  assert.equal((await request('/api/telegram/webhook', undefined, { update_id: 'fake' }, 'POST', { 'x-telegram-bot-api-secret-token':process.env.TELEGRAM_WEBHOOK_SECRET! })).status, 400);
  assert.equal((await request('/api/create-project', undefined, { telegramId:'123' })).status, 401);
  assert.equal((await request('/api/create-project', 123, { telegramId:'456' })).status, 403);
  const created = await request('/api/create-project', 123, { telegramId:'123', projectName:'Synthetic', paymentIntentId:'pi_fake' });
  assert.equal(created.status, 200); const project = (await created.json()).project;
  assert.equal(project.status, 'Заявка'); assert.equal(project.progress, 0); assert.equal(project.paymentIntentId, undefined);
  assert.equal((await request('/api/user-projects/456', 123)).status, 403);
  assert.equal((await request('/api/init-demo-projects/123', 9001, {})).status, 404);
  assert.equal((await request('/api/webhooks/referral', 9001, { amount:999999999 })).status, 410);
  assert.equal((await request('/api/gamification/stats/456', 123)).status, 403);
  assert.equal((await request('/api/gamification/stats/123abc', 123)).status, 400);
  assert.equal((await request('/api/user-stories/1/reactions')).status, 404);
  const guestReactions = await request('/api/user-stories/2/reactions');
  assert.equal(guestReactions.status, 200); assert.equal((await guestReactions.json()).counts.like, 0);
  assert.equal((await request('/api/user-stories/2/reactions', 123)).status, 200);
  assert.equal((await request('/api/user-stories/2/reactions', undefined, undefined, 'GET', { 'x-telegram-init-data':'invalid' })).status, 401);
  assert.equal((await request('/api/user-stories/2/reactions', undefined, undefined, 'GET', { 'x-telegram-init-data':'' })).status, 401);
  assert.equal((await request('/api/user-stories/2bad/reactions')).status, 400);
  assert.equal((await request('/api/photos/1', 456, undefined, 'DELETE')).status, 404);
  assert.equal(memory.public.one('SELECT count(*) FROM photos').count, 1);
  assert.equal((await request('/api/photos/1', 123, undefined, 'DELETE')).status, 200);
  assert.equal(memory.public.one('SELECT count(*) FROM photos').count, 0);
  const storage = new ObjectStorageService();
  await assert.rejects(storage.trySetObjectEntityAclPolicy('/objects/uploads/456/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { owner:'123', visibility:'public' }), /ownership/);
  await assert.rejects(storage.getObjectEntityUploadURL('../123'), /owner/);
  const originalBucket = objectStorageClient.bucket;
  const originalDir = process.env.PRIVATE_OBJECT_DIR;
  process.env.PRIVATE_OBJECT_DIR = '/synthetic-bucket/private';
  let copyCalls = 0;
  let targetMetadata: any;
  let validMedia = true;
  const png = Buffer.from([137,80,78,71,13,10,26,10]);
  const target: any = { exists:async () => [true], setMetadata:async (metadata:any) => { targetMetadata = metadata; } };
  const source: any = {
    createReadStream:() => Readable.from([validMedia ? png : Buffer.from('<html>bad</html>')]),
    copy:async (destination:any, options:any) => { assert.equal(destination, target); assert.equal(options.preconditionOpts.ifGenerationMatch, 0); assert.equal(options.contentType, 'image/png'); assert.deepEqual(options.metadata, {}); copyCalls++; },
    delete:async (options:any) => { assert.equal(options.ignoreNotFound, true); },
  };
  (storage as any).getObjectEntityFile = async () => ({ name:'private/uploads/123/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', getMetadata:async () => [{contentType:'image/png',size:8,generation:'42'}], bucket:{ file:(_name:string, options:any) => { assert.equal(options.generation,'42'); return source; } } });
  objectStorageClient.bucket = ((name:string) => { assert.equal(name,'synthetic-bucket'); return { file:(name:string) => { assert.match(name,/^private\/published\/123\/[a-f0-9-]{36}$/); return target; } }; }) as any;
  try {
    const finalPath = await storage.trySetObjectEntityAclPolicy('/objects/uploads/123/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { owner:'123',visibility:'public' });
    assert.match(finalPath,/^\/objects\/published\/123\/[a-f0-9-]{36}$/); assert.equal(copyCalls,1); assert.ok(targetMetadata?.metadata);
    validMedia = false;
    await assert.rejects(storage.trySetObjectEntityAclPolicy('/objects/uploads/123/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { owner:'123',visibility:'public' }), /signature/);
    assert.equal(copyCalls,1);
  } finally { objectStorageClient.bucket = originalBucket; if (originalDir === undefined) delete process.env.PRIVATE_OBJECT_DIR; else process.env.PRIVATE_OBJECT_DIR = originalDir; }
  process.env.WEB4TG_AI_PROVIDER_ENABLED = 'true';
  assert.equal((await request('/api/ai/followup', undefined, { telegramId:456 })).status, 401);
  assert.equal((await request('/api/ai/chat', 123, { messages:[{ role:'user', parts:Array.from({length:5}, () => ({text:'test'})) }] })).status, 400);
  assert.equal((await request('/api/analytics/ab-event', undefined, { experiment:'__proto__', variant:'a', eventType:'exposure' })).status, 400);
  assert.equal((await request('/api/vitals', undefined, { name:'LCP', value:'not-a-number' })).status, 400);
  assert.equal((await request('/api/error', undefined, { errorMessage:'x'.repeat(2001) })).status, 400);
  assert.equal((await request('/api/user-action', undefined, { action:'open', metadata:Object.fromEntries(Array.from({length:21}, (_,i) => [String(i), 'x'])) })).status, 400);
  const tracked = await request('/api/analytics/track', undefined, { actionType:'demo_view', userId:456, notifyAdmin:true });
  assert.equal(tracked.status, 200); assert.equal((await tracked.json()).tracked.userId, null);
  const redemptions = await Promise.all([request('/api/coinshop/redeem', 123, {tierId:'tier1'}), request('/api/coinshop/redeem', 123, {tierId:'tier1'})]);
  assert.equal(redemptions.filter(response => response.status === 200).length, 1);
  assert.equal(memory.public.one('SELECT available_coins FROM users WHERE telegram_id=123').available_coins, 0);
  assert.equal(memory.public.one('SELECT spent_coins FROM users WHERE telegram_id=123').spent_coins, 500);
  const polluted = await fetch(`${base}/api/create-project`, { method:'POST', headers:{'content-type':'application/json'}, body:'{"__proto__":{"polluted":true}}' });
  assert.equal(polluted.status, 400); assert.equal(({} as any).polluted, undefined);
  console.log('Backend security regression checks passed: admin, webhook, ownership, rewards, payment state, media and payload boundaries.');
} finally {
  await new Promise<void>((resolve, reject) => server.close((error: Error | undefined) => error ? reject(error) : resolve()));
  await pool.end();
}
