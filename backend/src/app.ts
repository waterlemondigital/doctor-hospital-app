import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { apiCacheMiddleware } from './middleware/cache.js';
import { apiV1Router } from './routes/index.js';

export const app = express();

// 1. CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/testing
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'If-None-Match'],
  })
);

// 2. GZip Compression Middleware (compresses responses > 1 KB)
app.use(compression({ threshold: 1000 }));

// 3. Body Parsers & Cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 4. In-Memory API Cache & ETag Middleware
app.use(apiCacheMiddleware);

// 5. Root Info Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    app: env.PROJECT_NAME,
    version: '1.0.0',
    runtime: 'Node.js & Express.js',
    database: 'PostgreSQL (Neon)',
    cache: '5-minute In-Memory Directory Store + ETag 304 active',
    status: 'online',
    health: '/api/v1/health',
  });
});

// 6. Mount API v1 Router
app.use('/api/v1', apiV1Router);

// 7. 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ detail: `Route ${req.method} ${req.originalUrl} not found` });
});

// 8. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Express Global Error]', err);
  res.status(err.status || 500).json({
    detail: err.message || 'Internal Server Error',
  });
});
