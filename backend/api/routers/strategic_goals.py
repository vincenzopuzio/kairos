import uuid
from typing import List
from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.domain import StrategicGoal
from models.schemas import StrategicGoalCreate, StrategicGoalUpdate
from services import strategic_goals as sg_service

router = APIRouter(prefix="/strategic-goals", tags=["Strategic Goals"])

@router.get("/", response_model=List[StrategicGoal])
async def get_strategic_goals(db: AsyncSession = Depends(get_db)):
    return await sg_service.get_all_strategic_goals(db)

@router.post("/", response_model=StrategicGoal, status_code=201)
async def create_strategic_goal(sg_in: StrategicGoalCreate, db: AsyncSession = Depends(get_db)):
    return await sg_service.create_strategic_goal(db, sg_in)

@router.patch("/{sg_id}", response_model=StrategicGoal)
async def update_strategic_goal(sg_id: uuid.UUID, sg_in: StrategicGoalUpdate, db: AsyncSession = Depends(get_db)):
    return await sg_service.update_strategic_goal(db, sg_id, sg_in)

@router.delete("/{sg_id}", status_code=204)
async def delete_strategic_goal(sg_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await sg_service.delete_strategic_goal(db, sg_id)
