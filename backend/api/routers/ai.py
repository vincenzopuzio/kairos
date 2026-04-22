from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Optional, List, Any
import uuid

from api.dependencies import get_db
from models.schemas import WeeklyPlannerRequest
from services import ai as ai_service
from services.ai import PersonaParseResult

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

class CoachingRequest(BaseModel):
    stakeholder_id: uuid.UUID

@router.post("/workplace-coaching")
async def workplace_coaching(request: CoachingRequest, db: AsyncSession = Depends(get_db)):
    """Analyze stakeholder dynamics and provide targeted relationship coaching."""
    return await ai_service.generate_workplace_coaching(db, request.stakeholder_id)

class PersonaParseRequest(BaseModel):
    text: str

@router.post("/parse-persona", response_model=PersonaParseResult)
async def parse_persona_route(request: PersonaParseRequest):
    return await ai_service.parse_persona_from_text(request.text)

class PersonaFetchRequest(BaseModel):
    url: str

@router.post("/fetch-persona", response_model=PersonaParseResult)
async def fetch_persona_route(request: PersonaFetchRequest):
    return await ai_service.fetch_persona_from_url(request.url)

