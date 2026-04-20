from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException
from models.domain import Project, ProjectDependency
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

# ---- Dependency graph ----

async def get_dependencies(db: AsyncSession, project_id: uuid.UUID) -> List[ProjectDependency]:
    result = await db.exec(select(ProjectDependency).where(ProjectDependency.project_id == project_id))
    return list(result.all())

async def add_dependency(db: AsyncSession, project_id: uuid.UUID, depends_on_id: uuid.UUID) -> ProjectDependency:
    if project_id == depends_on_id:
        raise HTTPException(status_code=400, detail="A project cannot depend on itself")
    existing = await db.get(ProjectDependency, (project_id, depends_on_id))
    if existing:
        return existing
    dep = ProjectDependency(project_id=project_id, depends_on_id=depends_on_id)
    db.add(dep)
    await db.commit()
    return dep

async def remove_dependency(db: AsyncSession, project_id: uuid.UUID, depends_on_id: uuid.UUID) -> None:
    dep = await db.get(ProjectDependency, (project_id, depends_on_id))
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency not found")
    await db.delete(dep)
    await db.commit()

