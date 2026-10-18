import { Router, Request, Response } from 'express';
import { directoryStore } from '../services/directoryCache.js';

export const laboratoriesRouter = Router();

laboratoriesRouter.get('/laboratories', async (req: Request, res: Response) => {
  if (req.query.refresh === 'true') {
    await directoryStore.reloadAll();
  } else {
    await directoryStore.ensureLoaded();
  }

  const { city, search } = req.query as {
    city?: string;
    search?: string;
  };

  const results = directoryStore.getLaboratories({ city, search });
  res.json(results);
});

laboratoriesRouter.get('/laboratories/:slug', async (req: Request, res: Response) => {
  await directoryStore.ensureLoaded();
  const { slug } = req.params;
  const lab = directoryStore.getLaboratoryBySlugOrId(slug);

  if (!lab) {
    res.status(404).json({ detail: `Laboratory with slug '${slug}' not found` });
    return;
  }

  res.json(lab);
});
