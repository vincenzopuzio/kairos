from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException
from models.domain import Project
from models.schemas import ProjectCreate, ProjectUpdate
import uuid

async def get_all_projects(db: AsyncSession) -> List[Project]:
    result = await db.exec(select(Project))
    return result.all()

async def get_project_by_id(db: AsyncSession, project_id: uuid.UUID) -> Optional[Project]:
    return await db.get(Project, project_id)

async def create_new_project(db: AsyncSession, project_in: ProjectCreate) -> Project:
    db_project = Project(**project_in.model_dump())
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

async def update_project(db: AsyncSession, project_id: uuid.UUID, project_in: ProjectUpdate) -> Project:
    db_project = await db.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

async def delete_project(db: AsyncSession, project_id: uuid.UUID) -> None:
    db_project = await db.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(db_project)
    await db.commit()
