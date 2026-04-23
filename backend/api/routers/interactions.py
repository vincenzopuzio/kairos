from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional
import uuid

from api.dependencies import get_db, get_current_user
from models.domain import StakeholderInteraction, SentimentEnum
from models.schemas import InteractionCreate, InteractionRead
from services import interactions as interaction_service
from services import ai as ai_service

router = APIRouter(prefix="/interactions", tags=["Relationship Journaling"])

@router.post("/", response_model=InteractionRead)
async def record_interaction(
    interaction_in: InteractionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await interaction_service.create_interaction(
        db, 
        interaction_in.content, 
        interaction_in.sentiment, 
        interaction_in.stakeholder_ids, 
        interaction_in.lesson_learned, 
        interaction_in.advice_received
    )

@router.get("/", response_model=List[InteractionRead])
async def get_all_history(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await interaction_service.get_all_interactions(db)

@router.get("/stakeholder/{stakeholder_id}", response_model=List[InteractionRead])
async def get_stakeholder_history(
    stakeholder_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await interaction_service.get_interactions_by_stakeholder(db, stakeholder_id)

@router.get("/lessons-learned", response_model=List[str])
async def get_lessons_learned(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await interaction_service.get_all_lessons_learned(db)

@router.delete("/{interaction_id}")
async def delete_interaction(
    interaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    success = await interaction_service.delete_interaction(db, interaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Interaction not found")
    return {"status": "success"}
