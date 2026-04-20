from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException

from models.domain import GuidingPrinciple
from models.schemas import GuidingPrincipleCreate, GuidingPrincipleUpdate

async def get_all_principles(db: AsyncSession) -> List[GuidingPrinciple]:
    result = await db.exec(select(GuidingPrinciple))
    return list(result.all())

async def get_principle_by_id(db: AsyncSession, principle_id: str) -> Optional[GuidingPrinciple]:
    return await db.get(GuidingPrinciple, principle_id)

async def create_principle(db: AsyncSession, p_in: GuidingPrincipleCreate) -> GuidingPrinciple:
    db_p = GuidingPrinciple.model_validate(p_in)
    db.add(db_p)
    await db.commit()
    await db.refresh(db_p)
    return db_p

async def update_principle(db: AsyncSession, principle_id: str, p_in: GuidingPrincipleUpdate) -> GuidingPrinciple:
    db_p = await db.get(GuidingPrinciple, principle_id)
    if not db_p:
        raise HTTPException(status_code=404, detail="Guiding Principle not found")
    
    p_data = p_in.model_dump(exclude_unset=True)
    for key, value in p_data.items():
        setattr(db_p, key, value)
        
    db.add(db_p)
    await db.commit()
    await db.refresh(db_p)
    return db_p

async def delete_principle(db: AsyncSession, principle_id: str):
    db_p = await db.get(GuidingPrinciple, principle_id)
    if not db_p:
        raise HTTPException(status_code=404, detail="Guiding Principle not found")
    await db.delete(db_p)
    await db.commit()

async def seed_default_principles(db: AsyncSession):
    """Idempotent seed of hardcoded principles from the original design."""
    defaults = [
        {
            "id": "eat-the-frog",
            "title": "Eat the Frog",
            "subtitle": "Tackle your worst task first",
            "description": "If the first thing you do each morning is to eat a live frog, you can go through the day with the satisfaction of knowing that it is probably the worst thing that is going to happen to you all day. In systems, your 'frog' is your hardest, most critical node.",
            "actionable_advice": "Identify your AP1 Epic constraint. Deploy it exclusively inside the very first Deep Work computation slot.",
            "color": "emerald"
        },
        {
            "id": "eisenhower-matrix",
            "title": "Eisenhower Matrix",
            "subtitle": "Urgent vs. Important",
            "description": "Prioritize objects by urgency and importance: Do, Schedule, Delegate, or Drop.",
            "actionable_advice": "Filter 'Urgent but Not Important' objects directly to Stakeholders to defend your Deep Work pipeline.",
            "color": "blue"
        },
        {
            "id": "pareto-principle",
            "title": "Pareto Principle (80/20 Rule)",
            "subtitle": "Vital Few vs. Trivial Many",
            "description": "80% of aggregate outcomes originate from merely 20% of variables. Focus on the core value nodes.",
            "actionable_advice": "Isolate the exact 20% of tasks that yield 80% of system stability. Suppress the noise.",
            "color": "amber"
        },
        {
            "id": "parkinsons-law",
            "title": "Parkinson's Law",
            "subtitle": "Work expands to fill time",
            "description": "Work expands proportionally to fill the temporal space allocated. Tight bounds force efficiency.",
            "actionable_advice": "Impose artificially stringent deadlines. Let the AI orchestrator enforce hyper-efficient resolutions.",
            "color": "rose"
        }
    ]
    
    for d in defaults:
        existing = await db.get(GuidingPrinciple, d["id"])
        if not existing:
            db.add(GuidingPrinciple(**d))
    await db.commit()

