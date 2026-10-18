from typing import AsyncGenerator, Tuple, Dict, Any
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
import urllib.parse
import logging
from app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def get_normalized_database_url_and_args(raw_url: str) -> Tuple[str, Dict[str, Any]]:
    """
    Ensure the connection string uses the asyncpg driver and properly
    configures SSL parameters for services like Neon, Supabase, or AWS RDS.
    """
    url_str = raw_url.strip()

    # Convert standard postgresql:// or postgres:// to postgresql+asyncpg://
    if url_str.startswith("postgresql://"):
        url_str = "postgresql+asyncpg://" + url_str[len("postgresql://"):]
    elif url_str.startswith("postgres://"):
        url_str = "postgresql+asyncpg://" + url_str[len("postgres://"):]

    parsed = urllib.parse.urlsplit(url_str)
    query_params = urllib.parse.parse_qs(parsed.query)
    connect_args: Dict[str, Any] = {}

    # If SSL is requested in query params, pass ssl=True to asyncpg
    ssl_requested = (
        "sslmode" in query_params or
        "ssl" in query_params or
        "neon.tech" in parsed.netloc
    )
    if ssl_requested:
        connect_args["ssl"] = True

    # Disable statement caching for PgBouncer / Neon connection pooler compatibility
    connect_args["statement_cache_size"] = 0

    # Turn off JIT to prevent compilation overhead on small queries
    connect_args["server_settings"] = {"jit": "off"}

    # Strip parameters that asyncpg doesn't accept directly in query string
    ignored_params = {"sslmode", "channel_binding"}
    clean_params = {k: v[0] for k, v in query_params.items() if k not in ignored_params}
    clean_query = urllib.parse.urlencode(clean_params)

    clean_url = urllib.parse.urlunsplit((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        clean_query,
        parsed.fragment
    ))

    return clean_url, connect_args

normalized_url, engine_connect_args = get_normalized_database_url_and_args(settings.DATABASE_URL)

# Optimized Async Engine for Neon PostgreSQL with lean connection pooling
engine = create_async_engine(
    normalized_url,
    connect_args=engine_connect_args,
    echo=False,
    future=True,
    pool_size=5,
    max_overflow=5,
    pool_timeout=15,
    pool_recycle=300,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def check_postgres_connection() -> Tuple[bool, str]:
    """Check connectivity to PostgreSQL database."""
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            row = result.scalar()
            if row == 1:
                return True, "Connected successfully"
        return False, "Query did not return expected result"
    except Exception as exc:
        logger.warning(f"PostgreSQL connection probe failed: {exc}")
        return False, str(exc)

async def init_db() -> None:
    """Initialize database tables."""
    # Ensure all models are imported so their tables are in Base.metadata
    from app import models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
