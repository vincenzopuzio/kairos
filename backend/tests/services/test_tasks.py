import pytest
from sqlmodel.ext.asyncio.session import AsyncSession
from models.domain import StatusEnum
from models.schemas import TaskCreate
from services.tasks import create_new_task, get_all_tasks

@pytest.mark.asyncio
async def test_task_lifecycle_service(db_session: AsyncSession):
    # 1. Arrange 
    new_task = TaskCreate(title="Test Task Priority", priority=1)
    
    # 2. Act (Creation)
    created = await create_new_task(db_session, new_task)
    
    # 3. Assert properties
    assert created.id is not None
    assert created.title == "Test Task Priority"
    assert created.status == StatusEnum.todo
    assert created.is_deep_work is False
    
    # 4. Act (Retrieval)
    tasks = await get_all_tasks(db_session, include_blocked=True)
    assert len(tasks) == 1
    assert tasks[0].id == created.id
