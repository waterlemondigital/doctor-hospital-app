from fastapi import APIRouter
from app.core.api_cache_middleware import get_api_cache

router = APIRouter(prefix="/cache", tags=["Cache"])

@router.get("/status")
async def get_cache_status():
    """Check current status and size of the 5-minute API cache."""
    cache = get_api_cache()
    if not cache:
        return {"status": "inactive", "cached_endpoints": 0, "ttl_seconds": 300}
    return {
        "status": "active",
        "cached_endpoints": cache.get_cache_size(),
        "ttl_seconds": cache.cache_duration,
        "ttl_readable": "5 minutes",
    }

@router.post("/clear")
async def clear_cache():
    """Clear all cached GET API responses (equivalent to apicache.clear())."""
    cache = get_api_cache()
    if not cache:
        return {"message": "Cache not active", "cleared_count": 0}
    cleared = cache.clear()
    return {"message": "Cache cleared successfully", "cleared_count": cleared}
