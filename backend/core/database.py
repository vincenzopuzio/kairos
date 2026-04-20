from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession as _AsyncSession
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from contextlib import asynccontextmanager
from core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

_SessionFactory = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

@asynccontextmanager
async def async_session_factory():
    async with _SessionFactory() as session:
        yield session

async def get_db_session():
    async with AsyncSession(engine) as session:
        yield session

