import { Router, Request, Response } from 'express';
import { directoryStore } from '../services/directoryCache.js';

export const hospitalsRouter = Router();

hospitalsRouter.get('/hospitals', async (req: Request, res: Response) => {
  if (req.query.refresh === 'true') {
    await directoryStore.reloadAll();
  } else {
    await directoryStore.ensureLoaded();
  }

  const { city, state, search } = req.query as {
    city?: string;
    state?: string;
    search?: string;
  };

  const results = directoryStore.getHospitals({ city, state, search });
  res.json(results);
});

hospitalsRouter.get('/hospitals/:slug', async (req: Request, res: Response) => {
  await directoryStore.ensureLoaded();
  const { slug } = req.params;
  const hospital = directoryStore.getHospitalBySlug(slug);

  if (!hospital) {
    res.status(404).json({ detail: `Hospital with slug '${slug}' not found` });
    return;
  }

  res.json(hospital);
});
