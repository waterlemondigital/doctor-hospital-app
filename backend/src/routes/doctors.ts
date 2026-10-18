import { Router, Request, Response } from 'express';
import { directoryStore } from '../services/directoryCache.js';

export const doctorsRouter = Router();

doctorsRouter.get('/doctors', async (req: Request, res: Response) => {
  if (req.query.refresh === 'true') {
    await directoryStore.reloadAll();
  } else {
    await directoryStore.ensureLoaded();
  }

  const { city, speciality, hospital_id, search } = req.query as {
    city?: string;
    speciality?: string;
    hospital_id?: string;
    search?: string;
  };

  const results = directoryStore.getDoctors({
    city,
    speciality,
    hospital_id,
    search,
  });

  res.json(results);
});

doctorsRouter.get('/doctors/:slug', async (req: Request, res: Response) => {
  await directoryStore.ensureLoaded();
  const { slug } = req.params;
  const doctor = directoryStore.getDoctorBySlug(slug);

  if (!doctor) {
    res.status(404).json({ detail: `Doctor with slug '${slug}' not found` });
    return;
  }

  res.json(doctor);
});
