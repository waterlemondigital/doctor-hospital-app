import time
from fastapi import APIRouter
from app.config import settings
from app.db.postgres import check_postgres_connection
from app.schemas.health import HealthResponse, ServiceHealth

router = APIRouter(tags=["Health"])

_health_cache = {"last_check": 0.0, "connected": True, "message": "Connected successfully"}

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Probe system health and PostgreSQL database connectivity (<1ms cached)."""
    now = time.time()
    if now - _health_cache["last_check"] > 30:
        pg_ok, pg_msg = await check_postgres_connection()
        _health_cache["last_check"] = now
        _health_cache["connected"] = pg_ok
        _health_cache["message"] = pg_msg

    pg_ok = _health_cache["connected"]
    pg_msg = _health_cache["message"]
    overall_status = "ok" if pg_ok else "degraded"

    return HealthResponse(
        status=overall_status,
        app_name=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        database=ServiceHealth(connected=pg_ok, message=pg_msg),
    )
