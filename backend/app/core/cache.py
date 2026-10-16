import time
import logging
from typing import Any, Optional, Dict, Tuple

logger = logging.getLogger(__name__)

class SimpleTtlCache:
    """
    Lightweight, thread-safe in-memory TTL cache for FastAPI endpoints.
    Eliminates cross-continental database latency for read-heavy public directory requests.
    """
    def __init__(self, default_ttl_seconds: int = 300):
        self._store: Dict[str, Tuple[float, Any]] = {}
        self.default_ttl = default_ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, val = entry
        if time.time() < expires_at:
            return val
        # Expired
        try:
            del self._store[key]
        except KeyError:
            pass
        return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        expiry = time.time() + (ttl if ttl is not None else self.default_ttl)
        self._store[key] = (expiry, value)

    def invalidate_prefix(self, prefix: str) -> None:
        keys_to_del = [k for k in self._store if k.startswith(prefix)]
        for k in keys_to_del:
            self._store.pop(k, None)

    def clear(self) -> None:
        self._store.clear()

api_cache = SimpleTtlCache(default_ttl_seconds=300)  # 5-minute cache
