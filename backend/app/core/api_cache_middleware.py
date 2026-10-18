import time
import hashlib
import logging
from typing import Dict, Tuple, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("api-cache")

# Global reference to active cache instance
api_cache_instance: Optional["APICacheMiddleware"] = None

def get_api_cache() -> Optional["APICacheMiddleware"]:
    return api_cache_instance

class APICacheMiddleware(BaseHTTPMiddleware):
    """
    High-Performance In-Memory API Cache & ETag HTTP Middleware.
    Designed according to the Neon Latency Minimization Blueprint:
    - In-Memory Smart Cache with sub-millisecond (<1ms) response times
    - HTTP ETag & 304 Not Modified validation (0 bytes transferred, 0ms)
    - Client cache-control headers (public, max-age=300)
    - Support for on-demand live bypass via '?refresh=true' or 'Cache-Control: no-cache'
    - Instant write-invalidation hook via invalidate() / clear()
    """
    def __init__(self, app, cache_duration_seconds: int = 300):
        super().__init__(app)
        global api_cache_instance
        self.cache_duration = cache_duration_seconds
        # key: str -> (expires_at: float, body: bytes, status_code: int, media_type: str, headers: dict, etag: str)
        self._store: Dict[str, Tuple[float, bytes, int, str, dict, str]] = {}
        api_cache_instance = self

    def clear(self) -> int:
        """Clear the entire in-memory cache immediately."""
        count = len(self._store)
        self._store.clear()
        logger.info(f"⚡ API Cache cleared ({count} entries removed)")
        return count

    def invalidate(self, path_prefix: Optional[str] = None) -> int:
        """Invalidate cache entries matching a path prefix (e.g. /api/v1/hospitals), or all entries."""
        if not path_prefix:
            return self.clear()
        keys_to_del = [k for k in self._store if k.startswith(path_prefix)]
        for k in keys_to_del:
            self._store.pop(k, None)
        logger.info(f"⚡ API Cache invalidated {len(keys_to_del)} entries for prefix '{path_prefix}'")
        return len(keys_to_del)

    def get_cache_size(self) -> int:
        """Return number of currently cached endpoints."""
        return len(self._store)

    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()

        # 1. On write requests (POST, PUT, PATCH, DELETE), execute and automatically invalidate cache
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            response = await call_next(request)
            if response.status_code < 400:
                # Invalidate cache for corresponding endpoint prefix
                self.invalidate(request.url.path)
            return response

        # 2. Only cache GET requests
        if request.method != "GET":
            return await call_next(request)

        path = request.url.path

        # 3. Only cache API routes (/api/v1/...)
        if not path.startswith("/api/v1/"):
            return await call_next(request)

        # 4. Skip caching for health check, docs, OpenAPI schema, or cache management
        if any(ignored in path for ignored in ("/health", "/openapi.json", "/docs", "/redoc", "/cache")):
            return await call_next(request)

        # 5. Check for client bypass: 'Cache-Control: no-cache' or query '?refresh=true'
        is_refresh = (
            request.headers.get("cache-control") == "no-cache" or
            request.query_params.get("refresh") in ("true", "1")
        )

        # Generate cache key from path and query string (stripping 'refresh' parameter from key)
        clean_query = "&".join(
            f"{k}={v}" for k, v in request.query_params.multi_items()
            if k.lower() != "refresh"
        )
        cache_key = f"{path}?{clean_query}" if clean_query else path
        now = time.time()

        # 6. Check cache for valid HIT if not refreshing
        if not is_refresh and cache_key in self._store:
            expires_at, body, status_code, media_type, stored_headers, etag = self._store[cache_key]
            if now < expires_at:
                age = int(now - (expires_at - self.cache_duration))
                remaining = int(expires_at - now)

                # Check HTTP ETag for 304 Not Modified
                client_etag = request.headers.get("if-none-match")
                if client_etag and client_etag.strip() == etag:
                    elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                    return Response(
                        status_code=304,
                        headers={
                            "ETag": etag,
                            "Cache-Control": f"public, max-age={max(0, remaining)}",
                            "X-Cache": "HIT",
                            "X-Response-Time-Ms": str(elapsed_ms),
                        },
                    )

                elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
                response_headers = {
                    **stored_headers,
                    "X-Cache": "HIT",
                    "X-Cache-Duration": f"{self.cache_duration}s",
                    "X-Response-Time-Ms": str(elapsed_ms),
                    "ETag": etag,
                    "Age": str(max(0, age)),
                    "Cache-Control": f"public, max-age={max(0, remaining)}",
                }
                return Response(
                    content=body,
                    status_code=status_code,
                    media_type=media_type,
                    headers=response_headers,
                )
            else:
                # Expired entry
                self._store.pop(cache_key, None)

        # 7. Cache MISS: Execute live endpoint
        response = await call_next(request)

        # 8. Only cache successful 200 responses
        if response.status_code == 200:
            media_type = response.headers.get("content-type", "application/json")

            # Read streaming response body
            chunks = []
            async for chunk in response.body_iterator:
                chunks.append(chunk if isinstance(chunk, bytes) else chunk.encode("utf-8"))
            body = b"".join(chunks)

            # Generate ETag
            etag = f'"{hashlib.md5(body).hexdigest()[:16]}"'

            # Preserve non-transport response headers
            headers_to_store = {
                k: v for k, v in response.headers.items()
                if k.lower() not in ("content-length", "content-encoding", "transfer-encoding", "x-cache", "age", "etag")
            }

            expires_at = now + self.cache_duration
            self._store[cache_key] = (expires_at, body, response.status_code, media_type, headers_to_store, etag)

            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            response_headers = {
                **headers_to_store,
                "X-Cache": "MISS" if not is_refresh else "REFRESH",
                "X-Cache-Duration": f"{self.cache_duration}s",
                "X-Response-Time-Ms": str(elapsed_ms),
                "ETag": etag,
                "Age": "0",
                "Cache-Control": f"public, max-age={self.cache_duration}",
            }

            return Response(
                content=body,
                status_code=response.status_code,
                media_type=media_type,
                headers=response_headers,
            )

        return response
