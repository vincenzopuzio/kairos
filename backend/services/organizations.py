from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException
from models.domain import Organization
from models.schemas import OrganizationCreate, OrganizationUpdate
import uuid

async def get_all_organizations(db: AsyncSession) -> List[Organization]:
    result = await db.exec(select(Organization))
    return result.all()

async def get_organization_by_id(db: AsyncSession, org_id: uuid.UUID) -> Optional[Organization]:
    return await db.get(Organization, org_id)

async def create_new_organization(db: AsyncSession, org_in: OrganizationCreate) -> Organization:
    db_org = Organization(**org_in.model_dump())
    db.add(db_org)
    await db.commit()
    await db.refresh(db_org)
    return db_org

async def update_organization(db: AsyncSession, org_id: uuid.UUID, org_in: OrganizationUpdate) -> Organization:
    db_org = await db.get(Organization, org_id)
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    update_data = org_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_org, key, value)
        
    db.add(db_org)
    await db.commit()
    await db.refresh(db_org)
    return db_org

async def delete_organization(db: AsyncSession, org_id: uuid.UUID) -> None:
    db_org = await db.get(Organization, org_id)
    if not db_org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    await db.delete(db_org)
    await db.commit()
