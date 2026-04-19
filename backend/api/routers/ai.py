from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlmodel.ext.asyncio.session import AsyncSession
import uuid

from api.dependencies import get_db
from services import ai as ai_service

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])

class DailyPlannerRequest(BaseModel):
    available_hours: int = Field(default=8, ge=1, le=24)
    focus_slots_preferred: bool = True

class DecomposeRequest(BaseModel):
    task_id: uuid.UUID

@router.post("/daily-planner")
async def daily_planner(request: DailyPlannerRequest, db: AsyncSession = Depends(get_db)):
    """Generate the daily schedule invoking the Gemini PydanticAI Service."""
    return await ai_service.generate_daily_planner(
        db=db,
        available_hours=request.available_hours,
        focus_slots_preferred=request.focus_slots_preferred
    )

@router.post("/decompose")
async def decompose_task(request: DecomposeRequest, db: AsyncSession = Depends(get_db)):
    """Decompose Epic triggering AI heuristic Gap Filler via Service."""
    return await ai_service.decompose_to_atomic_tasks(db=db, task_id=request.task_id)
