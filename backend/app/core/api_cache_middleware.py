import time
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
    FastAPI / Starlette equivalent of the npm 'apicache' package.
    Automatically caches GET API responses in memory for a configurable duration (default: 5 minutes).

    Features:
    - Caches HTTP 200 GET requests by endpoint path and query parameters
    - Returns 'X-Cache: HIT' with 'Age' and 'Cache-Control' headers
    - Allows cache bypass with 'Cache-Control: no-cache' header
    - Thread-safe in-memory cache store with instant sub-millisecond lookups
    """
    def __init__(self, app, cache_duration_seconds: int = 300):
        super().__init__(app)
        global api_cache_instance
        self.cache_duration = cache_duration_seconds
        # key: str -> (expires_at: float, body: bytes, status_code: int, media_type: str, headers: dict)
        self._store: Dict[str, Tuple[float, bytes, int, str, dict]] = {}
        api_cache_instance = self

    def clear(self) -> int:
        """Clear the entire cache."""
        count = len(self._store)
        self._store.clear()
        logger.info(f"API Cache cleared ({count} entries removed)")
        return count

    def get_cache_size(self) -> int:
        """Return number of currently cached endpoints."""
        return len(self._store)

    async def dispatch(self, request: Request, call_next):
        # 1. Only cache GET requests
        if request.method != "GET":
            return await call_next(request)

        path = request.url.path

        # 2. Only cache API routes (/api/v1/...)
        if not path.startswith("/api/v1/"):
            return await call_next(request)

        # 3. Skip caching for health check, docs, OpenAPI schema, or auth endpoints
        if any(ignored in path for ignored in ("/health", "/auth", "/openapi.json", "/cache")):
            return await call_next(request)

        # 4. Check for client cache bypass header
        if request.headers.get("cache-control") == "no-cache":
            return await call_next(request)

        # 5. Generate cache key from path and query string
        query = str(request.url.query)
        cache_key = f"{path}?{query}" if query else path
        now = time.time()

        # 6. Check cache for valid HIT
        if cache_key in self._store:
            expires_at, body, status_code, media_type, stored_headers = self._store[cache_key]
            if now < expires_at:
                age = int(now - (expires_at - self.cache_duration))
                remaining = int(expires_at - now)
                
                response_headers = {
                    **stored_headers,
                    "X-Cache": "HIT",
                    "X-Cache-Duration": f"{self.cache_duration}s",
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

        # 7. Cache MISS: Proceed to execute endpoint
        response = await call_next(request)

        # 8. Only cache successful 200 responses
        if response.status_code == 200:
            media_type = response.headers.get("content-type", "application/json")
            
            # Read streaming response body
            chunks = []
            async for chunk in response.body_iterator:
                chunks.append(chunk if isinstance(chunk, bytes) else chunk.encode("utf-8"))
            body = b"".join(chunks)

            # Preserve non-transport response headers
            headers_to_store = {
                k: v for k, v in response.headers.items() 
                if k.lower() not in ("content-length", "content-encoding", "transfer-encoding", "x-cache", "age")
            }

            expires_at = now + self.cache_duration
            self._store[cache_key] = (expires_at, body, response.status_code, media_type, headers_to_store)

            response_headers = {
                **headers_to_store,
                "X-Cache": "MISS",
                "X-Cache-Duration": f"{self.cache_duration}s",
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
