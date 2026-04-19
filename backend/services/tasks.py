from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException
from models.domain import Task, StatusEnum, utc_now
from models.schemas import TaskCreate, TaskUpdate
import uuid

async def get_all_tasks(db: AsyncSession, include_blocked: bool) -> List[Task]:
    query = select(Task)
    if not include_blocked:
        query = query.where(Task.status != StatusEnum.blocked)
    
    result = await db.exec(query)
    return result.all()

async def get_task_by_id(db: AsyncSession, task_id: uuid.UUID) -> Optional[Task]:
    return await db.get(Task, task_id)

async def create_new_task(db: AsyncSession, task_in: TaskCreate) -> Task:
    db_task = Task(**task_in.model_dump())
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

async def update_task(db: AsyncSession, task_id: uuid.UUID, task_in: TaskUpdate) -> Task:
    db_task = await db.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
    
    db_task.updated_at = utc_now()
    db.add(db_task)
    await db.commit()
    await db.refresh(db_task)
    return db_task

async def delete_task(db: AsyncSession, task_id: uuid.UUID) -> None:
    db_task = await db.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.delete(db_task)
    await db.commit()
