import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.domain import Stakeholder
from models.schemas import StakeholderCreate, StakeholderUpdate
from services import stakeholders as st_service

router = APIRouter(prefix="/stakeholders", tags=["Stakeholders"])

@router.get("/", response_model=List[Stakeholder])
async def get_stakeholders(db: AsyncSession = Depends(get_db)):
    return await st_service.get_all_stakeholders(db)

@router.post("/", response_model=Stakeholder, status_code=201)
async def create_stakeholder(st_in: StakeholderCreate, db: AsyncSession = Depends(get_db)):
    return await st_service.create_new_stakeholder(db, st_in)

@router.patch("/{st_id}", response_model=Stakeholder)
async def update_stakeholder(st_id: uuid.UUID, st_in: StakeholderUpdate, db: AsyncSession = Depends(get_db)):
    return await st_service.update_stakeholder(db, st_id, st_in)

@router.delete("/{st_id}", status_code=204)
async def delete_stakeholder(st_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await st_service.delete_stakeholder(db, st_id)
