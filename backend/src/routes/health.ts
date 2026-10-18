import { Router, Request, Response } from 'express';
import { checkPostgresConnection } from '../db/postgres.js';
import { env } from '../config/env.js';

export const healthRouter = Router();

let cachedHealth: { result: any; timestamp: number } | null = null;
const HEALTH_CACHE_TTL_MS = 30000; // 30 seconds

healthRouter.get('/health', async (_req: Request, res: Response) => {
  const now = Date.now();
  if (cachedHealth && now - cachedHealth.timestamp < HEALTH_CACHE_TTL_MS) {
    res.json(cachedHealth.result);
    return;
  }

  const dbStatus = await checkPostgresConnection();
  const result = {
    status: dbStatus.connected ? 'ok' : 'degraded',
    app_name: env.PROJECT_NAME,
    environment: env.ENVIRONMENT,
    database: dbStatus,
  };

  cachedHealth = { result, timestamp: now };
  res.status(dbStatus.connected ? 200 : 503).json(result);
});
