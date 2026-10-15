from fastapi import APIRouter
from app.config import settings
from app.db.postgres import check_postgres_connection
from app.db.neo4j import neo4j_client
from app.schemas.health import HealthResponse, ServiceHealth

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Probe system health and database connectivity (PostgreSQL and Neo4j)."""
    pg_ok, pg_msg = await check_postgres_connection()
    neo_ok, neo_msg = await neo4j_client.check_connection()

    overall_status = "ok" if (pg_ok and neo_ok) else "degraded"

    return HealthResponse(
        status=overall_status,
        app_name=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        postgres=ServiceHealth(connected=pg_ok, message=pg_msg),
        neo4j=ServiceHealth(connected=neo_ok, message=neo_msg),
    )
