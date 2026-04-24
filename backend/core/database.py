from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession as _AsyncSession
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
from core.config import settings

engine_args = {
    "echo": False,
    "future": True
}

if settings.async_database_url.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(
    settings.async_database_url,
    **engine_args
)

_SessionFactory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@asynccontextmanager
async def async_session_factory():
    async with _SessionFactory() as session:
        yield session

async def get_db_session():
    async with AsyncSession(engine) as session:
        yield session

# Alias for consistent router dependency injection
get_db = get_db_session

