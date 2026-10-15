from fastapi import APIRouter
from app.config import settings
from app.db.postgres import check_postgres_connection
from app.schemas.health import HealthResponse, ServiceHealth

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Probe system health and PostgreSQL database connectivity."""
    pg_ok, pg_msg = await check_postgres_connection()

    overall_status = "ok" if pg_ok else "degraded"

    return HealthResponse(
        status=overall_status,
        app_name=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        database=ServiceHealth(connected=pg_ok, message=pg_msg),
    )
