import uuid
from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import selectinload
from models.domain import StakeholderInteraction, StakeholderInteractionLink, SentimentEnum

async def create_interaction(
    db: AsyncSession, 
    content: str, 
    sentiment: SentimentEnum,
    stakeholder_ids: List[uuid.UUID] = [],
    lesson_learned: Optional[str] = None,
    advice_received: Optional[str] = None
) -> StakeholderInteraction:
    interaction = StakeholderInteraction(
        content=content,
        sentiment=sentiment,
        lesson_learned=lesson_learned,
        advice_received=advice_received
    )
    db.add(interaction)
    await db.flush() # Get the ID
    
    for st_id in stakeholder_ids:
        link = StakeholderInteractionLink(interaction_id=interaction.id, stakeholder_id=st_id)
        db.add(link)
        
    await db.commit()
    await db.refresh(interaction)
    return interaction

async def get_interactions_by_stakeholder(db: AsyncSession, stakeholder_id: uuid.UUID) -> List[StakeholderInteraction]:
    statement = select(StakeholderInteraction).join(StakeholderInteractionLink).where(StakeholderInteractionLink.stakeholder_id == stakeholder_id).options(selectinload(StakeholderInteraction.stakeholders)).order_by(StakeholderInteraction.created_at.desc())
    results = await db.exec(statement)
    return results.all()

async def get_all_interactions(db: AsyncSession) -> List[StakeholderInteraction]:
    statement = select(StakeholderInteraction).options(selectinload(StakeholderInteraction.stakeholders)).order_by(StakeholderInteraction.created_at.desc())
    results = await db.exec(statement)
    return results.all()

async def get_all_lessons_learned(db: AsyncSession) -> List[str]:
    statement = select(StakeholderInteraction.lesson_learned).where(StakeholderInteraction.lesson_learned != None)
    results = await db.exec(statement)
    return results.all()
