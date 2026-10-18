import { Router, Request, Response } from 'express';
import { directoryStore } from '../services/directoryCache.js';

export const wellnessRouter = Router();

wellnessRouter.get('/wellness-centers', async (req: Request, res: Response) => {
  if (req.query.refresh === 'true') {
    await directoryStore.reloadAll();
  } else {
    await directoryStore.ensureLoaded();
  }

  const { city, category, search } = req.query as {
    city?: string;
    category?: string;
    search?: string;
  };

  const results = directoryStore.getWellnessCenters({ city, category, search });
  res.json(results);
});

wellnessRouter.get('/wellness-centers/:slug', async (req: Request, res: Response) => {
  await directoryStore.ensureLoaded();
  const { slug } = req.params;
  const center = directoryStore.getWellnessBySlugOrId(slug);

  if (!center) {
    res.status(404).json({ detail: `Wellness center with slug '${slug}' not found` });
    return;
  }

  res.json(center);
});
