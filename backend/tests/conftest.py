import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine

from main import app
from core.database import get_db_session

# Utilize in-memory SQLite specifically for testing instances
# Per testing-strategy.md guidelines to secure test isolation
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    future=True
)

@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncSession: # type: ignore
    """Erects a fresh in-memory database schema for exclusively this test function."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    async with AsyncSession(engine) as session:
        yield session
    
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncClient: # type: ignore
    """Constructs a test AsyncClient hitting the FastAPI router implicitly overriding the DB injector."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db
    
    # ASGITransport bypasses network entirely to query via ASGI layer
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client
        
    app.dependency_overrides.clear()
