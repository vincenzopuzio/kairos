import os
import uuid
from typing import List, Dict, Any
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel, Field

# Safely extract or inject dummy Gemini API key to avoid crash on import during tests
if "GOOGLE_API_KEY" not in os.environ and "GEMINI_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = "dummy-test-key"

from pydantic_ai import Agent

from models.domain import Task, StatusEnum
from services.tasks import get_task_by_id, get_all_tasks

# --- GAP FILLER AGENT (Task Decomposition) ---

class AtomicSubTask(BaseModel):
    title: str = Field(description="Distinct, strictly scoped action item")
    description: str = Field(description="Clear explanation of the work required to complete this modular task")
    priority: int = Field(description="Computed priority scale 1-4 based on inferred bottlenecks", ge=1, le=4)
    is_deep_work: bool = Field(description="True ONLY IF it requires >90 mins of uninterrupted architectural/coding focus")

class DecomposeResult(BaseModel):
    reasoning: str = Field(description="Chain of Thought explaining why this Epic was split into these specific sub-tasks")
    confidence_score: float = Field(description="Float 0-1 representing confidence in this structural heuristic map.")
    sub_tasks: List[AtomicSubTask]

gap_filler_agent = Agent(
    model='google-gla:gemini-1.5-pro',
    output_type=DecomposeResult,
    system_prompt=(
        "You are an elite Technical Architect managing a codebase queue. "
        "Your job is the 'Gap Filler': break down large vague tasks into concrete, technical 'Atomic Tasks'. "
        "Prioritize DRY/KISS principles. Maintain high architectural standards."
    )
)

async def decompose_to_atomic_tasks(db: AsyncSession, task_id: uuid.UUID) -> DecomposeResult:
    parent_task = await get_task_by_id(db, task_id)
    if not parent_task:
        raise ValueError(f"Task {task_id} not found in DB")
        
    prompt = f"Break down this vague epic into atomic tasks.\nTitle: {parent_task.title}\nDescription: {parent_task.description or 'No desc'}"
    
    # Fire Pydantic AI Execution
    result = await gap_filler_agent.run(prompt)
    return result.data

# --- DAILY PLANNER AGENT (Deep Work Strategy) ---

class ScheduleBlock(BaseModel):
    time_start: str = Field(description="Start Time of day, e.g. 09:00")
    time_end: str = Field(description="End Time of day, e.g. 10:30")
    activity_type: str = Field(description="One of: deep_work, shallow_work, meeting, buffer_time")
    task_ids: List[str] = Field(default_factory=list, description="Array of associated Task UUIDs scheduled here")
    reasoning: str = Field(description="Chain of Thought: Why this specific block was strategically placed here.")

class PlannerResult(BaseModel):
    insights: str = Field(description="Daily Briefing outlining active team risks, Shadow Tasks causing bottlenecks, and Critical Path alerts.")
    confidence_score: float = Field(description="Float 0-1 representing confidence that this schedule avoids collisions.")
    schedule: List[ScheduleBlock]

planner_agent = Agent(
    model='google-gla:gemini-1.5-pro',
    output_type=PlannerResult,
    system_prompt=(
        "You are a hyper-efficient Personal AI-OS orchestrating the day for a Technical Lead. "
        "STRICT RULES:\n"
        "1. Protect >90min 'Deep Work Slots' meticulously. Never fragment them with meetings.\n"
        "2. Interleave 'buffer_time' to absorb context switching shock.\n"
        "3. Elevate tasks linked to 'Critical path' or 'Delayed' projects.\n"
        "Synthesize a robust, highly prioritized daily agenda."
    )
)

async def generate_daily_planner(db: AsyncSession, available_hours: int, focus_slots_preferred: bool) -> PlannerResult:
    pending_tasks = await get_all_tasks(db, include_blocked=True)
    
    # Rehydrate Tasks payload for Gemini context map
    task_catalog = "\n".join([
        f"- ID: {t.id} | {t.title} | Priority: {t.priority} | Deep Work: {t.is_deep_work} | Status: {t.status} | Blocked By: {t.blocked_by_stakeholder_id}"
        for t in pending_tasks if t.status != StatusEnum.done
    ])
    
    prompt = (f"Please orchestrate my strict daily schedule. I have exactly {available_hours} hours available today. "
              f"{'I strongly prefer contiguous Deep Work Slots heavily weighted towards the morning.' if focus_slots_preferred else ''}\n\n"
              f"Current Deterministic Task Backlog:\n{task_catalog}")
              
    result = await planner_agent.run(prompt)
    return result.data
