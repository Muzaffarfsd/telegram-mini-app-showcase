import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { initializeEmptyDatabase } from '../server/initializeDatabase';

const root = process.env.PROFILE_PGLITE_ROOT;
if (!root) {
  console.log('SKIPPED: set PROFILE_PGLITE_ROOT to a directory containing @electric-sql/pglite');
  process.exit(0);
}
const { PGlite } = createRequire(`${root}/package.json`)('@electric-sql/pglite');
function poolFor(database: any, failOnReviews = false): any {
  return { connect: async () => ({
    query: async (sql: string) => {
      if (failOnReviews && /^CREATE TABLE "reviews"/.test(sql)) throw new Error('simulated migration failure');
      return database.query(sql);
    },
    release: () => {},
  }) };
}
async function publicTables(database: any): Promise<string[]> {
  const result = await database.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
  return result.rows.map((row: any) => row.table_name);
}
const empty = await PGlite.create();
try {
  assert.equal(await initializeEmptyDatabase(poolFor(empty)), 'created');
  assert.deepEqual(await publicTables(empty), ['analytics_events', 'daily_tasks', 'gamification_stats', 'photos', 'referrals', 'reviews', 'story_reactions', 'tasks_progress', 'user_coins_balance', 'user_stories', 'users']);
  await empty.query("INSERT INTO users (telegram_id, referral_code) VALUES (123, 'TEST123')");
  await empty.query("INSERT INTO reviews (name, rating, text, telegram_id) VALUES ('Test', 5, 'Test review text', 123)");
  assert.equal(await initializeEmptyDatabase(poolFor(empty)), 'already_initialized');
  assert.equal((await empty.query('SELECT count(*) AS count FROM reviews')).rows[0].count, 1);
  assert.equal((await empty.query('SELECT count(*) AS count FROM users')).rows[0].count, 1);
} finally { await empty.close(); }
const partial = await PGlite.create();
try {
  await partial.query('CREATE TABLE existing_data (id integer PRIMARY KEY)');
  await partial.query('INSERT INTO existing_data VALUES (7)');
  assert.equal(await initializeEmptyDatabase(poolFor(partial)), 'nonempty_database');
  assert.deepEqual(await publicTables(partial), ['existing_data']);
  assert.equal((await partial.query('SELECT id FROM existing_data')).rows[0].id, 7);
} finally { await partial.close(); }
const failing = await PGlite.create();
try {
  await assert.rejects(initializeEmptyDatabase(poolFor(failing, true)), /simulated migration failure/);
  assert.deepEqual(await publicTables(failing), []);
} finally { await failing.close(); }
const wrongSchema = await PGlite.create();
try {
  await wrongSchema.query('CREATE SCHEMA other_schema');
  await wrongSchema.query('SET search_path TO other_schema');
  assert.equal(await initializeEmptyDatabase(poolFor(wrongSchema)), 'unexpected_schema');
  assert.deepEqual(await publicTables(wrongSchema), []);
} finally { await wrongSchema.close(); }
console.log('PostgreSQL (PGlite): empty schema initialization, restart preservation, nonempty refusal, rollback and unexpected schema passed');
