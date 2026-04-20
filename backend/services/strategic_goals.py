import uuid
from typing import List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException

from models.domain import StrategicGoal
from models.schemas import StrategicGoalCreate, StrategicGoalUpdate

async def get_all_strategic_goals(db: AsyncSession) -> List[StrategicGoal]:
    result = await db.exec(select(StrategicGoal))
    return list(result.all())

async def create_strategic_goal(db: AsyncSession, sg_in: StrategicGoalCreate) -> StrategicGoal:
    db_sg = StrategicGoal.model_validate(sg_in)
    db.add(db_sg)
    await db.commit()
    await db.refresh(db_sg)
    return db_sg

async def update_strategic_goal(db: AsyncSession, sg_id: uuid.UUID, sg_in: StrategicGoalUpdate) -> StrategicGoal:
    db_sg = await db.get(StrategicGoal, sg_id)
    if not db_sg:
        raise HTTPException(status_code=404, detail="Strategic Goal not found")
    
    sg_data = sg_in.model_dump(exclude_unset=True)
    for key, value in sg_data.items():
        setattr(db_sg, key, value)
        
    db.add(db_sg)
    await db.commit()
    await db.refresh(db_sg)
    return db_sg

async def delete_strategic_goal(db: AsyncSession, sg_id: uuid.UUID):
    db_sg = await db.get(StrategicGoal, sg_id)
    if not db_sg:
        raise HTTPException(status_code=404, detail="Strategic Goal not found")
    await db.delete(db_sg)
    await db.commit()
