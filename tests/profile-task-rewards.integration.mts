import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createHmac } from 'node:crypto';
import assert from 'node:assert/strict';

// An isolated, disposable database and a simulated Telegram API. No real rewards or messages are sent.
const root = process.cwd();
const requireProject = createRequire(`${root}/package.json`);
const { newDb, DataType } = requireProject('pg-mem');
const express = requireProject('express');
const pg = requireProject('pg');
const memory = newDb();
memory.public.registerFunction({ name: 'pg_advisory_xact_lock', args: [DataType.bigint], returns: DataType.integer, implementation: () => 0 });
memory.public.none(`CREATE TABLE users (id serial PRIMARY KEY, telegram_id bigint UNIQUE NOT NULL, username varchar(255), first_name varchar(255), last_name varchar(255), referral_code varchar(50) UNIQUE NOT NULL, referred_by_code varchar(50), total_referrals integer NOT NULL DEFAULT 0, active_referrals integer NOT NULL DEFAULT 0, total_earnings numeric NOT NULL DEFAULT 0, pending_rewards numeric NOT NULL DEFAULT 0, tier varchar(50) DEFAULT 'Bronze' NOT NULL, level integer DEFAULT 1 NOT NULL, xp integer DEFAULT 0 NOT NULL, xp_to_next_level integer DEFAULT 100 NOT NULL, total_xp integer DEFAULT 0 NOT NULL, current_streak integer DEFAULT 1 NOT NULL, best_streak integer DEFAULT 1 NOT NULL, last_visit_date date DEFAULT now() NOT NULL, completed_tasks integer DEFAULT 0 NOT NULL, achievements jsonb DEFAULT '[]' NOT NULL, total_coins integer DEFAULT 0 NOT NULL, available_coins integer DEFAULT 0 NOT NULL, spent_coins integer DEFAULT 0 NOT NULL, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);
CREATE TABLE tasks_progress (id serial PRIMARY KEY, telegram_id bigint NOT NULL REFERENCES users(telegram_id), task_id varchar(100) NOT NULL, platform varchar(50) NOT NULL, task_type varchar(50) NOT NULL, coins_reward integer NOT NULL, completed boolean NOT NULL DEFAULT false, verification_status varchar(50) NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0, last_attempt_at timestamp, started_at timestamp, completed_at timestamp, verification_data jsonb, created_at timestamp NOT NULL DEFAULT now(), UNIQUE (telegram_id, task_id));
CREATE TABLE reviews (id serial PRIMARY KEY, name varchar(100) NOT NULL, company varchar(200), logo_url varchar(500), rating integer NOT NULL DEFAULT 5, text text NOT NULL, location varchar(100), telegram_id bigint, is_approved boolean NOT NULL DEFAULT false, is_featured boolean NOT NULL DEFAULT false, created_at timestamp NOT NULL DEFAULT now());
INSERT INTO users (telegram_id, referral_code) VALUES (123, 'TEST123'), (456, 'TEST456');`);
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
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.TELEGRAM_BOT_TOKEN = 'isolated-test-bot';
const realFetch = globalThis.fetch;
let telegramStatus = 'left';
const telegramCalls: any[] = [];
globalThis.fetch = async (input: any, options?: any) => {
  if (String(input).startsWith('https://api.telegram.org/')) {
    telegramCalls.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ ok: true, result: { status: telegramStatus } }), { headers: { 'content-type': 'application/json' } });
  }
  return realFetch(input, options);
};
const { default: tasks } = await import(pathToFileURL(`${root}/server/routes/tasks.ts`).href);
const { default: reviews } = await import(pathToFileURL(`${root}/server/routes/reviews.ts`).href);
const { generateCSRFToken, validateCSRF } = await import(pathToFileURL(`${root}/server/routes/shared.ts`).href);
const { pool } = await import(pathToFileURL(`${root}/server/db.ts`).href);
function initData(id: number) {
  const p = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id, first_name: 'Test' }) });
  const check = [...p].sort(([a], [b]) => a.localeCompare(b)).map(([a, b]) => `${a}=${b}`).join('\n');
  const key = createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  p.set('hash', createHmac('sha256', key).update(check).digest('hex'));
  return p.toString();
}
const app = express(); app.use(express.json()); app.use('/api', validateCSRF); app.use(tasks); app.use(reviews);
const server = await new Promise<any>(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
const base = `http://127.0.0.1:${server.address().port}`;
async function post(id: number, endpoint: string, body: any) {
  const auth = initData(id); const csrf = await generateCSRFToken(auth, true);
  return fetch(`${base}${endpoint}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-init-data': auth, 'x-csrf-token': csrf }, body: JSON.stringify(body) });
}
try {
  let response = await post(123, '/api/tasks/complete', { task_id: 'made_up', platform: 'daily', coins_reward: 1000000 });
  assert.equal(response.status, 400);
  response = await post(123, '/api/tasks/complete', { task_id: '__proto__' });
  assert.equal(response.status, 400);
  response = await post(123, '/api/tasks/complete', { telegramId: 456, task_id: 'daily_visit' });
  assert.equal(response.status, 403);
  response = await post(123, '/api/tasks/complete', { task_id: 'daily_visit', platform: 'telegram', coins_reward: 1000000, channelUsername: 'attacker' });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).coins_awarded, 10);
  assert.equal(memory.public.one('SELECT available_coins FROM users WHERE telegram_id=123').available_coins, 10);
  response = await post(123, '/api/tasks/complete', { task_id: 'daily_visit' });
  assert.equal(response.status, 400);
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  memory.public.none(`UPDATE tasks_progress SET completed_at='${yesterday}' WHERE telegram_id=123 AND task_id='daily_visit'`);
  response = await post(123, '/api/tasks/complete', { task_id: 'daily_visit' });
  assert.equal(response.status, 200);
  assert.equal(memory.public.one('SELECT available_coins FROM users WHERE telegram_id=123').available_coins, 20);
  response = await post(123, '/api/tasks/complete', { task_id: 'telegram_subscribe', channelUsername: 'attacker', coins_reward: 50000 });
  assert.equal(response.status, 400);
  assert.equal(telegramCalls.at(-1).chat_id, '@web4_tg');
  telegramStatus = 'member';
  response = await post(123, '/api/tasks/complete', { task_id: 'telegram_subscribe', channelUsername: 'attacker', coins_reward: 50000 });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).coins_awarded, 100);
  response = await post(123, '/api/tasks/complete', { task_id: 'telegram_subscribe' });
  assert.equal(response.status, 400);
  assert.equal(memory.public.one('SELECT available_coins FROM users WHERE telegram_id=123').available_coins, 120);
  for (const endpoint of ['/api/tasks/start', '/api/tasks/verify']) {
    response = await post(123, endpoint, { task_id: 'made_up', coins_reward: 1000 });
    assert.equal(response.status, 410);
  }
  response = await post(999, '/api/tasks/complete', { task_id: 'daily_visit' });
  assert.equal(response.status, 404);
  response = await post(123, '/api/reviews', { name: 'А', rating: 9, text: 'слишком коротко', telegramId: 456 });
  assert.equal(response.status, 400);
  response = await post(123, '/api/reviews', { name: ' Анна ', rating: 4, text: ' Хорошая работа команды! ', telegramId: 456 });
  assert.equal(response.status, 200);
  const saved = memory.public.one('SELECT * FROM reviews WHERE name=\'Анна\'');
  assert.equal(saved.telegram_id, 123);
  assert.equal(saved.is_approved, false);
  memory.public.none("UPDATE reviews SET is_approved=true; INSERT INTO reviews(name,rating,text,is_approved) VALUES ('Пример',5,'Тестовый отзыв',true)");
  const listed = await (await fetch(`${base}/api/reviews`)).json();
  assert.equal(listed.data.length, 2);
  assert.equal(listed.data.find((item: any) => item.name === 'Анна').hasAuthorAccount, true);
  assert.equal(listed.data.find((item: any) => item.name === 'Пример').hasAuthorAccount, false);
  assert.ok(listed.data.every((item: any) => !('telegramId' in item)));
  const submitted = await (await fetch(`${base}/api/reviews?submitted=1`)).json();
  assert.deepEqual(submitted.data.map((item: any) => item.name), ['Анна']);
  assert.equal(submitted.pagination.total, 1);
  console.log('Reviews: server validation, authenticated author, moderation and privacy of public data passed');
  console.log('Task rewards: real CSRF/auth, server prices, fixed channel, membership, daily reset, duplicate, legacy and missing-user cases passed');
  console.log('pg-mem does not emulate real PostgreSQL advisory-lock concurrency; that requires a separate PostgreSQL test.');
} finally {
  globalThis.fetch = realFetch;
  await new Promise<void>(resolve => server.close(resolve));
  await pool.end();
}
