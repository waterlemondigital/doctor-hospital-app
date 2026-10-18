import { Router, Request, Response } from 'express';
import { clearCache, getCacheStats } from '../middleware/cache.js';
import { directoryStore } from '../services/directoryCache.js';

export const cacheRouter = Router();

cacheRouter.get('/cache/status', (_req: Request, res: Response) => {
  const stats = getCacheStats();
  res.json({
    status: 'ok',
    response_cache: stats,
    directory_store: {
      is_loaded: directoryStore.isLoaded,
      last_loaded_at: directoryStore.lastLoadedAt,
      hospitals_count: directoryStore.hospitals.length,
      doctors_count: directoryStore.doctors.length,
      laboratories_count: directoryStore.laboratories.length,
      wellness_count: directoryStore.wellnessCenters.length,
      cities_count: directoryStore.cities.length,
    },
  });
});

cacheRouter.post('/cache/clear', async (_req: Request, res: Response) => {
  clearCache();
  await directoryStore.reloadAll();
  res.json({ status: 'ok', message: 'All response caches and directory store reloaded' });
});
