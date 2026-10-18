import { Router, Request, Response } from 'express';
import { directoryStore } from '../services/directoryCache.js';

export const directoryRouter = Router();

directoryRouter.get('/cities', async (req: Request, res: Response) => {
  if (req.query.refresh === 'true') {
    await directoryStore.reloadAll();
  } else {
    await directoryStore.ensureLoaded();
  }
  res.json(directoryStore.getCities());
});

directoryRouter.get('/specialities', async (req: Request, res: Response) => {
  if (req.query.refresh === 'true') {
    await directoryStore.reloadAll();
  } else {
    await directoryStore.ensureLoaded();
  }
  res.json(directoryStore.getSpecialities());
});
