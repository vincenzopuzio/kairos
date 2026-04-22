import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.domain import Organization
from models.schemas import OrganizationCreate, OrganizationUpdate
from services import organizations as org_service

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.get("/", response_model=List[Organization])
async def get_organizations(db: AsyncSession = Depends(get_db)):
    return await org_service.get_all_organizations(db)

@router.get("/{org_id}", response_model=Organization)
async def get_organization(org_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    org = await org_service.get_organization_by_id(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org

@router.post("/", response_model=Organization, status_code=201)
async def create_organization(org_in: OrganizationCreate, db: AsyncSession = Depends(get_db)):
    return await org_service.create_new_organization(db, org_in)

@router.patch("/{org_id}", response_model=Organization)
async def update_organization(org_id: uuid.UUID, org_in: OrganizationUpdate, db: AsyncSession = Depends(get_db)):
    return await org_service.update_organization(db, org_id, org_in)

@router.delete("/{org_id}", status_code=204)
async def delete_organization(org_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await org_service.delete_organization(db, org_id)
