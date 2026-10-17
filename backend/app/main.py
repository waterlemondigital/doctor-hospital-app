from contextlib import asynccontextmanager
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import httpx

from app.config import settings
from app.db.postgres import check_postgres_connection, init_db
from app.api.v1.router import api_v1_router
from app.core.api_cache_middleware import APICacheMiddleware

logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("healthdiscover-backend")

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
    else:
        logger.warning(f"PostgreSQL not connected at startup: {pg_msg}. Please configure DATABASE_URL in .env.")

    # Background task to warm up primary endpoints after server starts
    async def warmup_cache():
        await asyncio.sleep(1)  # Allow server to complete socket binding
        try:
            logger.info("Pre-warming GET endpoints in APICacheMiddleware...")
            async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
                await asyncio.gather(
                    client.get("/api/v1/hospitals"),
                    client.get("/api/v1/doctors"),
                    client.get("/api/v1/laboratories"),
                    client.get("/api/v1/wellness-centers"),
                    return_exceptions=True,
                )
            logger.info("APICacheMiddleware pre-warmed for primary directory endpoints.")
        except Exception as e:
            logger.warning(f"Error during cache pre-warming: {e}")

    warmup_task = asyncio.create_task(warmup_cache())

    yield

    warmup_task.cancel()
    logger.info("Shutting down backend services...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for HealthDiscover — Powered by PostgreSQL with 5-minute APICacheMiddleware for instant sub-millisecond responses.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. API Cache Middleware (5-minute TTL on all GET API responses, equivalent to npm apicache)
app.add_middleware(APICacheMiddleware, cache_duration_seconds=300)

# 2. CORS middleware configuration (Outermost so CORS headers are added to cached responses)
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
        "cache": "5-minute APICacheMiddleware active",
        "status": "online",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
