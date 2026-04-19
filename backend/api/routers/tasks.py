import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.domain import Task
from models.schemas import TaskCreate, TaskUpdate
from services import tasks as tasks_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/", response_model=List[Task])
async def get_tasks(
    include_blocked: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve tasks gracefully routing through the Task Service layer."""
    return await tasks_service.get_all_tasks(db, include_blocked)

@router.get("/{task_id}", response_model=Task)
async def get_task_by_id(task_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    task = await tasks_service.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/", response_model=Task, status_code=201)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new task delegating persistence to the Task Service layer."""
    return await tasks_service.create_new_task(db, task_in)

@router.patch("/{task_id}", response_model=Task)
async def update_task(task_id: uuid.UUID, task_in: TaskUpdate, db: AsyncSession = Depends(get_db)):
    """Update a task via the Task Service."""
    return await tasks_service.update_task(db, task_id, task_in)

@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Delete a task."""
    await tasks_service.delete_task(db, task_id)
