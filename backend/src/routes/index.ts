import { Router } from 'express';
import { healthRouter } from './health.js';
import { hospitalsRouter } from './hospitals.js';
import { doctorsRouter } from './doctors.js';
import { laboratoriesRouter } from './laboratories.js';
import { wellnessRouter } from './wellness.js';
import { directoryRouter } from './directory.js';
import { cacheRouter } from './cache.js';
import { authRouter } from './auth.js';

export const apiV1Router = Router();

apiV1Router.use(healthRouter);
apiV1Router.use(authRouter);
apiV1Router.use(hospitalsRouter);
apiV1Router.use(doctorsRouter);
apiV1Router.use(laboratoriesRouter);
apiV1Router.use(wellnessRouter);
apiV1Router.use(directoryRouter);
apiV1Router.use(cacheRouter);
