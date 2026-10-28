import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

function getPoolConfig(): pg.PoolConfig {
  let connectionString = env.DATABASE_URL.trim();

  // If connection string starts with postgresql+asyncpg://, change to postgresql://
  if (connectionString.startsWith('postgresql+asyncpg://')) {
    connectionString = 'postgresql://' + connectionString.slice('postgresql+asyncpg://'.length);
  } else if (connectionString.startsWith('postgres+asyncpg://')) {
    connectionString = 'postgresql://' + connectionString.slice('postgres+asyncpg://'.length);
  }

  const isNeon = connectionString.includes('neon.tech') || connectionString.includes('sslmode=require');

  return {
    connectionString,
    ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    min: 1, // Keep at least 1 warm connection alive in the pool
    max: 10,
    idleTimeoutMillis: 300000, // 5 minutes (prevent premature connection teardown)
    connectionTimeoutMillis: 15000,
  };
}

export const pool = new Pool(getPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// --- Neon Keep-Alive Heartbeat (Pings every 3.5 minutes to prevent Neon compute sleep) ---
let keepAliveTimer: NodeJS.Timeout | null = null;

export function startPostgresKeepAlive() {
  if (keepAliveTimer) return;
  keepAliveTimer = setInterval(async () => {
    try {
      await pool.query('SELECT 1 as keepalive');
    } catch (err: any) {
      console.warn('⚠️ [Postgres KeepAlive] Heartbeat ping failed:', err?.message);
    }
  }, 210000); // 3.5 minutes (Neon scale-to-zero occurs at 5 min idle)

  if (keepAliveTimer.unref) {
    keepAliveTimer.unref();
  }
}

export function stopPostgresKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

// Start keep-alive immediately
startPostgresKeepAlive();

export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function checkPostgresConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const res = await pool.query('SELECT 1 as val');
    if (res.rows[0]?.val === 1) {
      return { connected: true, message: 'Connected successfully' };
    }
    return { connected: false, message: 'Query did not return expected scalar' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Database connection error' };
  }
}
