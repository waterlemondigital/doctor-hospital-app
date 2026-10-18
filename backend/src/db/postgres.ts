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
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  };
}

export const pool = new Pool(getPoolConfig());

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

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
