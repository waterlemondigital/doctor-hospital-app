/**
 * Standard API client for MedVexa Express / PostgreSQL backend.
 * Includes in-memory caching and in-flight promise deduplication for ultra-fast navigation.
 */

const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/+$/, '')}/api/v1` : '/api/v1';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const DEFAULT_CACHE_TTL_MS = 30 * 1000; // 30 seconds: balanced freshness and instant 0ms client navigation

export interface ApiFetchOptions extends RequestInit {
  cacheTtlMs?: number;
  skipCache?: boolean;
}

export async function apiFetch<T>(endpoint: string, options?: ApiFetchOptions): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${normalizedEndpoint}`;
  const isGet = !options?.method || options.method.toUpperCase() === 'GET';

  // 1. Check in-memory cache for GET requests
  if (isGet && !options?.skipCache) {
    const cached = memoryCache.get(url);
    const ttl = options?.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as T;
    }

    // 2. In-flight promise deduplication (share simultaneous calls to the same endpoint)
    if (inFlightRequests.has(url)) {
      return inFlightRequests.get(url) as Promise<T>;
    }
  }

  const executeFetch = async (): Promise<T> => {
    try {
      const response = await fetch(url, {
        credentials: options?.credentials ?? 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new ApiError(response.status, `API request failed with status ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as T;

      // Cache successful GET responses
      if (isGet) {
        memoryCache.set(url, { data, timestamp: Date.now() });
      }

      return data;
    } finally {
      inFlightRequests.delete(url);
    }
  };

  if (isGet && !options?.skipCache) {
    const promise = executeFetch();
    inFlightRequests.set(url, promise);
    return promise;
  }

  return executeFetch();
}

/** Clear all client memory cache */
export function clearApiCache(): void {
  memoryCache.clear();
}
