import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Pool } from 'pg';

type InitializerPool = Pick<Pool, 'connect'>;
export type InitializationResult = 'created' | 'already_initialized' | 'nonempty_database' | 'unexpected_schema';

// This is a one-time bootstrap, not an automatic schema synchronizer.
// It never alters an existing table and refuses to initialize a nonempty database.
export async function initializeEmptyDatabase(pool: InitializerPool): Promise<InitializationResult> {
  const client = await pool.connect();
  let inTransaction = false;
  try {
    await client.query('BEGIN');
    inTransaction = true;
    // Separate two-int lock namespace, held until the transaction ends.
    // Multiple Railway instances cannot initialize an empty database concurrently.
    await client.query('SELECT pg_advisory_xact_lock(1464104004, 1)');
    const schema = await client.query<{ name: string | null }>('SELECT current_schema() AS name');
    if (schema.rows[0]?.name !== 'public') {
      await client.query('COMMIT');
      inTransaction = false;
      return 'unexpected_schema';
    }
    const existing = await client.query<{ table_schema: string; table_name: string }>(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_schema NOT LIKE 'pg_toast%'
        AND table_schema NOT LIKE 'pg_temp_%'
    `);
    if (existing.rows.length > 0) {
      const publicTables = new Set(existing.rows.filter(row => row.table_schema === 'public').map(row => row.table_name));
      const required = ['users', 'referrals', 'daily_tasks', 'tasks_progress', 'reviews', 'analytics_events', 'user_stories', 'story_reactions', 'photos'];
      const result: InitializationResult = required.every(name => publicTables.has(name)) ? 'already_initialized' : 'nonempty_database';
      await client.query('COMMIT');
      inTransaction = false;
      return result;
    }
    const migrationPath = path.resolve(import.meta.dirname, 'sql', 'initial-schema.sql');
    const migration = await readFile(migrationPath, 'utf8');
    const statements = migration.split('--> statement-breakpoint').map(statement => statement.trim()).filter(Boolean);
    if (!statements.length) throw new Error('Initial migration is empty');
    for (const statement of statements) await client.query(statement);
    await client.query('COMMIT');
    inTransaction = false;
    return 'created';
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
