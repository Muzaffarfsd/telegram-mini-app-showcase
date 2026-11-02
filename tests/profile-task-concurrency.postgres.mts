import { createRequire } from 'node:module';
import { createHmac, randomBytes } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

// This test only runs when explicitly given a disposable PostgreSQL database.
// It creates and removes its own randomly named schema; it never touches application tables.
const databaseUrl = process.env.PROFILE_TEST_DATABASE_URL;
if (!databaseUrl) {
  console.log('SKIPPED: set PROFILE_TEST_DATABASE_URL to a disposable PostgreSQL database to test real concurrent transactions');
  process.exit(0);
}
const root = process.cwd();
const requireProject = createRequire(`${root}/package.json`);
const pg = requireProject('pg');
const express = requireProject('express');
const schema = `profile_test_${randomBytes(10).toString('hex')}`;
if (!/^profile_test_[a-f0-9]{20}$/.test(schema)) throw new Error('Invalid test schema name');
const admin = new pg.Pool({ connectionString: databaseUrl });
let server: any;
let appPool: any;
let created = false;
const realFetch = globalThis.fetch;
try {
  await admin.query(`CREATE SCHEMA "${schema}"`);
  created = true;
  const scoped = new URL(databaseUrl);
  scoped.searchParams.set('options', `-c search_path=${schema}`);
  const setup = new pg.Pool({ connectionString: scoped.toString() });
  try {
    await setup.query(`CREATE TABLE users (id serial PRIMARY KEY, telegram_id bigint UNIQUE NOT NULL, username varchar(255), first_name varchar(255), last_name varchar(255), referral_code varchar(50) UNIQUE NOT NULL, referred_by_code varchar(50), total_referrals integer NOT NULL DEFAULT 0, active_referrals integer NOT NULL DEFAULT 0, total_earnings numeric NOT NULL DEFAULT 0, pending_rewards numeric NOT NULL DEFAULT 0, tier varchar(50) DEFAULT 'Bronze' NOT NULL, level integer DEFAULT 1 NOT NULL, xp integer DEFAULT 0 NOT NULL, xp_to_next_level integer DEFAULT 100 NOT NULL, total_xp integer DEFAULT 0 NOT NULL, current_streak integer DEFAULT 1 NOT NULL, best_streak integer DEFAULT 1 NOT NULL, last_visit_date date DEFAULT now() NOT NULL, completed_tasks integer DEFAULT 0 NOT NULL, achievements jsonb DEFAULT '[]' NOT NULL, total_coins integer DEFAULT 0 NOT NULL, available_coins integer DEFAULT 0 NOT NULL, spent_coins integer DEFAULT 0 NOT NULL, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);
    CREATE TABLE tasks_progress (id serial PRIMARY KEY, telegram_id bigint NOT NULL REFERENCES users(telegram_id), task_id varchar(100) NOT NULL, platform varchar(50) NOT NULL, task_type varchar(50) NOT NULL, coins_reward integer NOT NULL, completed boolean NOT NULL DEFAULT false, verification_status varchar(50) NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0, last_attempt_at timestamp, started_at timestamp, completed_at timestamp, verification_data jsonb, created_at timestamp NOT NULL DEFAULT now(), UNIQUE (telegram_id, task_id));
    INSERT INTO users (telegram_id, referral_code) VALUES (123, 'TEST123'), (456, 'TEST456');`);
  } finally { await setup.end(); }
  process.env.DATABASE_URL = scoped.toString();
  process.env.TELEGRAM_BOT_TOKEN = 'isolated-test-bot';
  globalThis.fetch = async (input: any, options?: any) => String(input).startsWith('https://api.telegram.org/')
    ? new Response(JSON.stringify({ ok: true, result: { status: 'member' } }), { headers: { 'content-type': 'application/json' } })
    : realFetch(input, options);
  const { default: tasks } = await import(pathToFileURL(`${root}/server/routes/tasks.ts`).href);
  const { generateCSRFToken, validateCSRF } = await import(pathToFileURL(`${root}/server/routes/shared.ts`).href);
  appPool = (await import(pathToFileURL(`${root}/server/db.ts`).href)).pool;
  const app = express(); app.use(express.json()); app.use('/api', validateCSRF); app.use(tasks);
  server = await new Promise<any>(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const url = `http://127.0.0.1:${server.address().port}/api/tasks/complete`;
  function initData(id: number) {
    const p = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id, first_name: 'Test' }) });
    const check = [...p].sort(([a], [b]) => a.localeCompare(b)).map(([a, b]) => `${a}=${b}`).join('\n');
    const key = createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
    p.set('hash', createHmac('sha256', key).update(check).digest('hex'));
    return p.toString();
  }
  async function race(id: number, taskIds: string[]) {
    const auth = initData(id); const csrf = await generateCSRFToken(auth, true);
    const requests = taskIds.map(task_id => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-init-data': auth, 'x-csrf-token': csrf }, body: JSON.stringify({ task_id, coins_reward: 50000 }) }));
    return (await Promise.all(requests)).map(response => response.status);
  }
  const repeated = await race(123, Array(20).fill('daily_visit'));
  assert.equal(repeated.filter(status => status === 200).length, 1);
  assert.equal(repeated.filter(status => status === 400).length, 19);
  const twoTasks = await race(456, [...Array(10).fill('daily_visit'), ...Array(10).fill('telegram_subscribe')]);
  assert.equal(twoTasks.filter(status => status === 200).length, 2);
  assert.equal(twoTasks.filter(status => status === 400).length, 18);
  const balances = await appPool.query('SELECT telegram_id, available_coins, completed_tasks FROM users ORDER BY telegram_id');
  assert.deepEqual(balances.rows.map((row: any) => [Number(row.telegram_id), row.available_coins, row.completed_tasks]), [[123, 10, 1], [456, 110, 2]]);
  console.log('Real PostgreSQL concurrency: duplicate and mixed-task races award each verified reward exactly once');
} finally {
  globalThis.fetch = realFetch;
  if (server) await new Promise<void>(resolve => server.close(resolve));
  if (appPool) await appPool.end();
  if (created) await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
  await admin.end();
}
