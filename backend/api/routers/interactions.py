from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional
import uuid

from api.dependencies import get_db, get_current_user
from models.domain import StakeholderInteraction, SentimentEnum
from services import interactions as interaction_service

router = APIRouter(prefix="/interactions", tags=["Relationship Journaling"])

@router.post("/", response_model=StakeholderInteraction)
async def record_interaction(
    content: str,
    stakeholder_ids: List[uuid.UUID] = [],
    sentiment: SentimentEnum = SentimentEnum.neutral,
    lesson_learned: Optional[str] = None,
    advice_received: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await interaction_service.create_interaction(
        db, content, sentiment, stakeholder_ids, lesson_learned, advice_received
    )

@router.get("/", response_model=List[StakeholderInteraction])
async def get_all_history(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return await interaction_service.get_all_interactions(db)

@router.get("/stakeholder/{stakeholder_id}", response_model=List[StakeholderInteraction])
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
