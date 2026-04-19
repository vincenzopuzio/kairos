import asyncio
import uuid
import datetime
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel
from core.database import engine
from models.domain import Task, Project, StatusEnum

async def seed():
    # Force metadata creation just in case
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:
        # Create a Project
        project = Project(
            id=uuid.uuid4(),
            name="Personal AI OS V1.0",
            description="The most advanced AI system",
            external_deadline=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30)
        )
        session.add(project)
        
        # Deep Work Task
        task1 = Task(
            id=uuid.uuid4(),
            title="Design Database Schema Replication",
            description="Crucial architectural block",
            status=StatusEnum.in_progress,
            priority=1,
            is_deep_work=True,
            project_id=project.id,
            due_date=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=2)
        )
        session.add(task1)
        
        # Blocked Task
        task2 = Task(
            id=uuid.uuid4(),
            title="Integrate API Gateway",
            description="Wait for external dev",
            status=StatusEnum.blocked,
            priority=2,
            is_deep_work=False,
            project_id=project.id
        )
        session.add(task2)
        
        # Normal task
        task3 = Task(
            id=uuid.uuid4(),
            title="Refactor Frontend layout styles",
            description="Migrate class components",
            status=StatusEnum.todo,
            priority=3,
            is_deep_work=False,
            project_id=project.id
        )
        session.add(task3)
        
        await session.commit()
        print("Database Seeded Successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
