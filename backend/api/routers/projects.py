import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.domain import Project
from models.schemas import ProjectCreate, ProjectUpdate
from services import projects as projects_service

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("/", response_model=List[Project])
async def get_projects(db: AsyncSession = Depends(get_db)):
    """Fetch tracked projects through the Project Service layer."""
    return await projects_service.get_all_projects(db)

@router.get("/{project_id}", response_model=Project)
async def get_project_by_id(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    project = await projects_service.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/", response_model=Project, status_code=201)
async def create_project(project_in: ProjectCreate, db: AsyncSession = Depends(get_db)):
    return await projects_service.create_new_project(db, project_in)

@router.patch("/{project_id}", response_model=Project)
async def update_project(project_id: uuid.UUID, project_in: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    return await projects_service.update_project(db, project_id, project_in)

@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await projects_service.delete_project(db, project_id)
