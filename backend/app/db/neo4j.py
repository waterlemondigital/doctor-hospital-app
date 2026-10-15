from typing import AsyncGenerator, Optional, Tuple
from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class Neo4jClient:
    def __init__(self) -> None:
        self._driver: Optional[AsyncDriver] = None

    def get_driver(self) -> AsyncDriver:
        if self._driver is None:
            self._driver = AsyncGraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            )
        return self._driver

    async def close(self) -> None:
        if self._driver is not None:
            await self._driver.close()
            self._driver = None
            logger.info("Neo4j driver connection closed.")

    async def check_connection(self) -> Tuple[bool, str]:
        """Verify connectivity to Neo4j graph database."""
        try:
            driver = self.get_driver()
            await driver.verify_connectivity()
            async with driver.session(database=settings.NEO4J_DATABASE) as session:
                result = await session.run("RETURN 1 AS ping")
                record = await result.single()
                if record and record["ping"] == 1:
                    return True, "Connected successfully"
            return False, "Query verification failed"
        except Exception as exc:
            logger.warning(f"Neo4j connection probe failed: {exc}")
            return False, str(exc)

neo4j_client = Neo4jClient()

async def get_neo4j_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for providing a Neo4j async session."""
    driver = neo4j_client.get_driver()
    async with driver.session(database=settings.NEO4J_DATABASE) as session:
        yield session
