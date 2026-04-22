from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException
from models.domain import Stakeholder
from models.schemas import StakeholderCreate, StakeholderUpdate
import uuid

async def get_all_stakeholders(db: AsyncSession) -> List[Stakeholder]:
    result = await db.exec(select(Stakeholder))
    return result.all()

async def get_stakeholder_by_id(db: AsyncSession, stakeholder_id: uuid.UUID) -> Optional[Stakeholder]:
    return await db.get(Stakeholder, stakeholder_id)

async def create_new_stakeholder(db: AsyncSession, st_in: StakeholderCreate) -> Stakeholder:
    db_st = Stakeholder(**st_in.model_dump())
    db.add(db_st)
    await db.commit()
    await db.refresh(db_st)
    return db_st

async def update_stakeholder(db: AsyncSession, st_id: uuid.UUID, st_in: StakeholderUpdate) -> Stakeholder:
    db_st = await db.get(Stakeholder, st_id)
    if not db_st:
        raise HTTPException(status_code=404, detail="Stakeholder not found")
    
    update_data = st_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_st, key, value)
        
    db.add(db_st)
    await db.commit()
    await db.refresh(db_st)
    return db_st

async def delete_stakeholder(db: AsyncSession, st_id: uuid.UUID) -> None:
    db_st = await db.get(Stakeholder, st_id)
    if not db_st:
        raise HTTPException(status_code=404, detail="Stakeholder not found")
    
    await db.delete(db_st)
    await db.commit()
