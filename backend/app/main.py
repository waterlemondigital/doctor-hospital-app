from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.db.postgres import check_postgres_connection, init_db
from app.api.v1.router import api_v1_router

logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("healthdiscover-backend")

from app.core.directory_store import directory_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Check database readiness
    logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode...")
    
    # Check PostgreSQL
    pg_ok, pg_msg = await check_postgres_connection()
    if pg_ok:
        logger.info("PostgreSQL is connected. Ensuring all relational tables exist...")
        try:
            await init_db()
            logger.info("PostgreSQL relational schema verified.")
        except Exception as e:
            logger.error(f"Error initializing database tables: {e}")

        # Pre-warm in-memory directory store for instant sub-millisecond responses
        try:
            await directory_store.warm()
        except Exception as e:
            logger.error(f"Error warming directory store: {e}")
    else:
        logger.warning(f"PostgreSQL not connected at startup: {pg_msg}. Please configure DATABASE_URL in .env.")

    # Background periodic refresh task
    async def periodic_refresh():
        while True:
            await asyncio.sleep(300)
            try:
                await directory_store.warm(force=True)
            except Exception as exc:
                logger.warning(f"Background directory refresh failed: {exc}")

    refresh_task = asyncio.create_task(periodic_refresh())

    yield

    # Shutdown
    refresh_task.cancel()
    logger.info("Shutting down backend services...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for HealthDiscover — Completely powered by PostgreSQL for Users, Doctors, Hospitals, and Relational Affiliations.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/", tags=["Root"])
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": "1.0.0",
        "database": "PostgreSQL",
        "status": "online",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
