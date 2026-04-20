import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.domain import Milestone, ProjectTemplate
from models.schemas import MilestoneCreate, MilestoneUpdate
from services import milestones as ms_service

router = APIRouter(tags=["Milestones"])

@router.get("/projects/{project_id}/milestones", response_model=List[Milestone])
async def list_milestones(project_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    return await ms_service.get_milestones_for_project(db, project_id)

@router.post("/projects/{project_id}/milestones", response_model=Milestone, status_code=201)
async def create_milestone(project_id: uuid.UUID, data: MilestoneCreate, db: AsyncSession = Depends(get_db)):
    return await ms_service.create_milestone(db, project_id, data)

@router.patch("/milestones/{milestone_id}", response_model=Milestone)
async def update_milestone(milestone_id: uuid.UUID, data: MilestoneUpdate, db: AsyncSession = Depends(get_db)):
    return await ms_service.update_milestone(db, milestone_id, data)

@router.delete("/milestones/{milestone_id}", status_code=204)
async def delete_milestone(milestone_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ms_service.delete_milestone(db, milestone_id)

@router.post("/projects/{project_id}/apply-template/{template_id}", response_model=List[Milestone])
async def apply_template(project_id: uuid.UUID, template_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Bulk-replace project milestones from a template."""
    return await ms_service.apply_template_to_project(db, project_id, template_id)

@router.get("/project-templates", response_model=List[ProjectTemplate])
async def list_templates(db: AsyncSession = Depends(get_db)):
    return await ms_service.get_all_templates(db)
