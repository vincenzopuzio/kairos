from typing import AsyncGenerator
from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import get_db_session

async def get_db(session: AsyncSession = Depends(get_db_session)) -> AsyncSession:
    """Dependency injecting AsyncSession mapped into the database setup."""
    return session
