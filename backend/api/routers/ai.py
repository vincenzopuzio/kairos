from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional, List, Any
import uuid

from api.dependencies import get_db
from models.schemas import WeeklyPlannerRequest
from services import ai as ai_service

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

class DailyPlannerRequest(BaseModel):
    available_hours: int = Field(default=8, ge=1, le=24)
    focus_slots_preferred: bool = True

class DecomposeRequest(BaseModel):
    task_id: uuid.UUID

@router.post("/daily-planner")
async def daily_planner(
    available_hours: int = 8,
    focus_slots_preferred: bool = True,
    db: AsyncSession = Depends(get_db)
):
    return await ai_service.generate_daily_planner(
        db, available_hours, focus_slots_preferred
    )

@router.post("/weekly-planner")
async def weekly_planner(
    request_data: Optional[WeeklyPlannerRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    return await ai_service.generate_weekly_planner(db, request_data)

@router.post("/decompose")
async def decompose_task(request: DecomposeRequest, db: AsyncSession = Depends(get_db)):
    """Decompose Epic triggering AI heuristic Gap Filler via Service."""
    return await ai_service.decompose_to_atomic_tasks(db=db, task_id=request.task_id)

@router.post("/quarterly-roadmap")
async def quarterly_roadmap(db: AsyncSession = Depends(get_db)):
    """Generate 1-6 months Mid-Term Risk Assessment based on active Project deadlines."""
    return await ai_service.generate_quarterly_roadmap(db)

class KbQueryRequest(BaseModel):
    query: str

@router.post("/ask-kb")
async def ask_kb(request: KbQueryRequest, db: AsyncSession = Depends(get_db)):
    """Semantic search over the Knowledge Base using Gemini as the reasoning engine."""
    return await ai_service.ask_knowledge_base(db, request.query)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Any]] = None

@router.post("/chat")
async def strategic_chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Interactive multi-turn chat with the Strategic Advisor."""
    from services.ai_chat import run_strategic_chat
    return await run_strategic_chat(db, request.message, request.history)

