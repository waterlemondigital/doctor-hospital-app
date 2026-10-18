import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

interface CacheEntry {
  body: any;
  contentType: string;
  etag: string;
  cachedAt: number;
}

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function clearCache(): void {
  responseCache.clear();
}

export function getCacheStats() {
  return {
    cachedEntries: responseCache.size,
    ttlSeconds: CACHE_TTL_MS / 1000,
  };
}

export function apiCacheMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = performance.now();

  // Invalidate on mutations
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    clearCache();
    return next();
  }

  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Bypass cache if ?refresh=true or ?nocache=true
  if (req.query.refresh === 'true' || req.query.nocache === 'true') {
    return next();
  }

  // Cache key based on original URL
  const cacheKey = req.originalUrl || req.url;
  const now = Date.now();
  const cached = responseCache.get(cacheKey);

  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    const elapsed = (performance.now() - start).toFixed(2);
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('X-Response-Time-Ms', elapsed);
    res.setHeader('ETag', cached.etag);
    res.setHeader('Content-Type', cached.contentType);

    // Check ETag 304 Not Modified
    const clientEtag = req.headers['if-none-match'];
    if (clientEtag && clientEtag === cached.etag) {
      res.status(304).end();
      return;
    }

    res.send(cached.body);
    return;
  }

  // Intercept res.send to capture and cache response
  const originalSend = res.send.bind(res);
  res.send = (body: any): Response => {
    const elapsed = (performance.now() - start).toFixed(2);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Response-Time-Ms', elapsed);

    // Only cache successful 200 responses
    if (res.statusCode === 200) {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      const etag = `"${crypto.createHash('md5').update(bodyStr).digest('hex')}"`;
      res.setHeader('ETag', etag);

      const contentType = res.getHeader('Content-Type') as string || 'application/json';

      responseCache.set(cacheKey, {
        body,
        contentType,
        etag,
        cachedAt: Date.now(),
      });

      // If-None-Match check on fresh responses
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag && clientEtag === etag) {
        res.status(304).end();
        return res;
      }
    }

    return originalSend(body);
  };

  next();
}
