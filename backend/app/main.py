from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.config import settings
from app.db.neo4j import neo4j_client
from app.db.postgres import check_postgres_connection, init_db
from app.api.v1.router import api_v1_router

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
        logger.info("PostgreSQL is connected. Ensuring tables exist...")
        try:
            await init_db()
            logger.info("PostgreSQL tables verified.")
        except Exception as e:
            logger.error(f"Error initializing database tables: {e}")
    else:
        logger.warning(f"PostgreSQL not connected at startup: {pg_msg}. Please configure .env credentials.")

    # Check Neo4j
    neo_ok, neo_msg = await neo4j_client.check_connection()
    if neo_ok:
        logger.info("Neo4j graph database is connected.")
    else:
        logger.warning(f"Neo4j not connected at startup: {neo_msg}. Please configure .env credentials.")

    yield

    # Shutdown
    logger.info("Shutting down backend services...")
    await neo4j_client.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for HealthDiscover — PostgreSQL for User data & Auth, Neo4j for Doctors & Hospitals knowledge graph.",
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
        "status": "online",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
