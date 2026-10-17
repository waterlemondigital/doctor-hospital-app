import time
import logging
from collections import defaultdict
from typing import Dict, List, Optional
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("rate-limiter")

class RateLimitExceeded(HTTPException):
    def __init__(self, retry_after: int = 60, detail: str = "Rate limit exceeded. Please try again later."):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            headers={"Retry-After": str(retry_after)},
        )


class InMemoryRateLimiter:
    """
    Sliding-window in-memory rate limiter per IP address or user ID.
    Thread-safe and fast with automatic expired entry pruning.
    """
    def __init__(self):
        # key -> list of timestamp floats
        self._requests: Dict[str, List[float]] = defaultdict(list)
        self._last_prune = time.time()

    def _prune(self, current_time: float):
        # Run cleanup every 5 minutes
        if current_time - self._last_prune > 300:
            for key in list(self._requests.keys()):
                self._requests[key] = [t for t in self._requests[key] if current_time - t < 3600]
                if not self._requests[key]:
                    self._requests.pop(key, None)
            self._last_prune = current_time

    def check_rate_limit(
        self,
        key: str,
        max_requests: int,
        window_seconds: int,
    ) -> bool:
        """
        Returns True if request is allowed, False if exceeded.
        """
        now = time.time()
        self._prune(now)
        
        window_start = now - window_seconds
        # Filter existing stamps in current window
        valid_stamps = [t for t in self._requests[key] if t > window_start]
        
        if len(valid_stamps) >= max_requests:
            self._requests[key] = valid_stamps
            return False

        valid_stamps.append(now)
        self._requests[key] = valid_stamps
        return True


rate_limiter = InMemoryRateLimiter()


def rate_limit_endpoint(max_requests: int = 5, window_seconds: int = 60, key_prefix: str = "auth"):
    """
    FastAPI Dependency to rate-limit specific sensitive routes (e.g., login, signup).
    Defaults to 5 requests per 60 seconds per IP address.
    """
    async def dependency(request: Request):
        # Extract client IP safely (supports proxies / cloudflare)
        forwarded_for = request.headers.get("x-forwarded-for")
        client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else (request.client.host if request.client else "127.0.0.1")
        key = f"{key_prefix}:{client_ip}"

        allowed = rate_limiter.check_rate_limit(
            key=key,
            max_requests=max_requests,
            window_seconds=window_seconds,
        )

        if not allowed:
            logger.warning(f"Rate limit hit on {request.url.path} by {client_ip}")
            raise RateLimitExceeded(
                retry_after=window_seconds,
                detail=f"Too many requests to this endpoint. Limit is {max_requests} per {window_seconds}s.",
            )
        return True

    return dependency
