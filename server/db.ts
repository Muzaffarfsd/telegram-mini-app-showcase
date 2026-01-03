import * as schema from "../shared/schema";
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import ws from 'ws';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if running on Railway
const isRailway = !!(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);

// Connection pool configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === 'production' ? 20 : 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

let db: ReturnType<typeof neonDrizzle> | ReturnType<typeof pgDrizzle>;
let pool: NeonPool | pg.Pool;

if (isRailway) {
  // Railway: use standard postgres driver (no WebSocket issues)
  pool = new pg.Pool({
    ...poolConfig,
    ssl: { rejectUnauthorized: false },
  });
  db = pgDrizzle(pool, { schema });
  
  console.log('[DB] Using node-postgres driver for Railway');
} else {
  // Replit/Local: use neon-serverless with WebSocket
  neonConfig.webSocketConstructor = ws;
  
  pool = new NeonPool(poolConfig);
  db = neonDrizzle({ client: pool, schema });
  
  console.log('[DB] Using neon-serverless driver');
}

export { db, pool };

// Graceful shutdown - close pool on process exit
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});
