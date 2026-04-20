import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker
from services.ai import generate_weekly_planner
from models.domain import StrategicGoal, GuidingPrinciple

DATABASE_URL = "sqlite+aiosqlite:///./sql_app.db"

async def test_weekly_planner():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            print("Running generate_weekly_planner...")
            result = await generate_weekly_planner(session)
            print("SUCCESS!")
            print(f"Summary: {result.strategic_protection_summary}")
        except Exception as e:
            print(f"FAILED with error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_weekly_planner())
