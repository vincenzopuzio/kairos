import os
import uuid
from typing import List, Dict, Any, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel, Field
from models.domain import Task, Stakeholder, StrategicGoal, Project, StatusEnum, HealthEnum
from models.schemas import WeeklyPlannerRequest

from core.config import settings

# Safely proxy the config API key down into os environments for the PydanticAI google wrapper natively
if settings.GEMINI_API_KEY:
    os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY
elif "GOOGLE_API_KEY" not in os.environ and "GEMINI_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = "dummy-test-key"

from pydantic_ai import Agent

from models.domain import Task, StatusEnum
from services.tasks import get_task_by_id, get_all_tasks
from services.ai_utils import run_with_fallback

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
    model='google-gla:gemini-2.5-flash',
    output_type=DecomposeResult,
    system_prompt=(
        "You are an elite Technical Architect. "
        "Your job is the 'Gap Filler': break down epic tasks into atomic actions. "
        "Adhere to the following Guiding Principles:\n{principles_context}\n\n"
        "Maintain high architectural standards."
    )
)

async def decompose_to_atomic_tasks(db: AsyncSession, task_id: uuid.UUID) -> DecomposeResult:
    from services.principles import get_all_principles
    principles = await get_all_principles(db)
    principles_context = "\n".join([f"- {p.title}: {p.actionable_advice}" for p in principles])

    parent_task = await get_task_by_id(db, task_id)
    if not parent_task:
        raise ValueError(f"Task {task_id} not found in DB")
        
    prompt = f"Break down this vague epic into atomic tasks.\nTitle: {parent_task.title}\nDescription: {parent_task.description or 'No desc'}"
    
    return await run_with_fallback(gap_filler_agent, prompt, deps=principles_context)

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
    model='google-gla:gemini-2.5-flash',
    output_type=PlannerResult,
    system_prompt=(
        "You are a hyper-efficient Personal AI-OS orchestrating a Technical Lead's day. "
        "STRICT RULES:\n"
        "1. Follow Guiding Principles:\n{principles_context}\n"
        "2. Protect >90min 'Deep Work Slots'.\n"
        "3. Interleave 'buffer_time'.\n"
        "4. Elevate Critical Path tasks."
    )
)

async def generate_daily_planner(db: AsyncSession, available_hours: int, focus_slots_preferred: bool) -> PlannerResult:
    from services.principles import get_all_principles
    principles = await get_all_principles(db)
    principles_context = "\n".join([f"- {p.title}: {p.actionable_advice}" for p in principles])
    
    pending_tasks = await get_all_tasks(db, include_blocked=True)
    
    # Rehydrate Tasks payload for Gemini context map
    task_catalog = "\n".join([
        f"- ID: {t.id} | {t.title} | Priority: {t.priority} | Deep Work: {t.is_deep_work} | Status: {t.status} | Blocked By: {t.blocked_by_stakeholder_id}"
        for t in pending_tasks if t.status != StatusEnum.done
    ])
    
    prompt = (f"Please orchestrate my strict daily schedule. I have exactly {available_hours} hours available today. "
              f"{'I strongly prefer contiguous Deep Work Slots heavily weighted towards the morning.' if focus_slots_preferred else ''}\n\n"
              f"Current Deterministic Task Backlog:\n{task_catalog}")
              
    return await run_with_fallback(planner_agent, prompt, deps=principles_context)

# --- WEEKLY HORIZON AGENT (Burnout Prevention & Delegation) ---

class WeeklyDayPlan(BaseModel):
    day_name: str = Field(description="Monday through Sunday")
    strategic_hours_allocated: int = Field(description="Number of hours allocated specifically to strategic goals today")
    operational_hours_allocated: int = Field(description="Number of hours allocated to backlog tasks")
    strategic_focus: List[str] = Field(description="List of Strategic Goal Titles focused on today")
    delegated_tasks: List[str] = Field(description="List of Task IDs that must be delegated today")
    reasoning: str = Field(description="Why this specific blend of strategic vs operational was chosen for this day.")

class WeeklyPlannerResult(BaseModel):
    strategic_protection_summary: str = Field(description="Explanation of how burnout is prevented and strategic goals are met this week.")
    delegation_strategy: str = Field(description="Summary of how excess operational tasks were pushed to Personas.")
    days: List[WeeklyDayPlan]

weekly_planner_agent = Agent(
    model='google-gla:gemini-2.5-flash',
    output_type=WeeklyPlannerResult,
    system_prompt=(
        "You are an elite Technical Operating System managing burnout and capacity. "
        "STRICT RULES: "
        "1. Follow Guiding Principles:\n{principles_context}\n"
        "2. QUOTA ENFORCEMENT: You MUST fulfill 'Target' hours AND respect 'Min Days'. If a goal has Min Days: 5, you MUST allocate at least one slot of 'Duration' minutes across 5 distinct days.\n"
        "3. Strategic Goals are IMMUTABLE. Schedule them first. "
        "4. Excess tasks must be delegated to 'Personas'. "
        "Balance the week for peak performance."
    )
)

async def generate_weekly_planner(db: AsyncSession, overrides: Optional[WeeklyPlannerRequest] = None) -> WeeklyPlannerResult:
    from services.strategic_goals import get_all_strategic_goals
    from services.stakeholders import get_all_stakeholders
    from services.os_settings import get_os_settings
    from services.principles import get_all_principles
    
    pending_tasks = await get_all_tasks(db, include_blocked=False)
    strategic_goals = await get_all_strategic_goals(db)
    personas = await get_all_stakeholders(db)
    os_settings = await get_os_settings(db)
    principles = await get_all_principles(db)
    
    principles_context = "\n".join([f"- {p.title}: {p.actionable_advice}" for p in principles])
    
    goals_str = "\n".join([
        f"- {g.title} | Target: {g.target_weekly_hours}h | Min Days: {g.min_days_per_week} | Duration: {g.slot_duration_minutes}m slots" 
        for g in strategic_goals if g.is_active
    ])
    tasks_str = "\n".join([f"- ID: {t.id} | {t.title} | Priority: {t.priority}" for t in pending_tasks if t.status != StatusEnum.done])
    personas_str = "\n".join([f"- {p.name} | Role: {p.role} | Seniority: {p.seniority} | Can Delegate: {p.can_delegate} | Skills: {p.skills}" for p in personas])
    
    # Execution Context Fallback Resolutions
    max_combined = overrides.max_weekly_combined_hours if (overrides and overrides.max_weekly_combined_hours is not None) else os_settings.max_weekly_combined_hours
    t_mon = overrides.day_template_monday if (overrides and overrides.day_template_monday) else os_settings.day_template_monday
    t_tue = overrides.day_template_tuesday if (overrides and overrides.day_template_tuesday) else os_settings.day_template_tuesday
    t_wed = overrides.day_template_wednesday if (overrides and overrides.day_template_wednesday) else os_settings.day_template_wednesday
    t_thu = overrides.day_template_thursday if (overrides and overrides.day_template_thursday) else os_settings.day_template_thursday
    t_fri = overrides.day_template_friday if (overrides and overrides.day_template_friday) else os_settings.day_template_friday
    t_sat = overrides.day_template_saturday if (overrides and overrides.day_template_saturday) else os_settings.day_template_saturday
    t_sun = overrides.day_template_sunday if (overrides and overrides.day_template_sunday) else os_settings.day_template_sunday
    heuristics = overrides.template_definitions if (overrides and overrides.template_definitions) else os_settings.template_definitions

    day_templates = (
        f"- Monday: {t_mon}\n"
        f"- Tuesday: {t_tue}\n"
        f"- Wednesday: {t_wed}\n"
        f"- Thursday: {t_thu}\n"
        f"- Friday: {t_fri}\n"
        f"- Saturday: {t_sat}\n"
        f"- Sunday: {t_sun}\n"
    )
    
    prompt = (
        f"Generate the Weekly Schedule restricting to MAX {max_combined} hours total combined across the 7 days.\n"
        f"You MUST align allocations aggressively obeying these exact Day Templates:\n{day_templates}\n\n"
        f"ARCHITECTURAL GUIDELINES (SEMANTIC HEURISTICS FOR TEMPLATES):\n"
        f"{heuristics}\n\n"
        f"STRATEGIC QUOTAS (MANDATORY):\n{goals_str}\n\n"
        f"BACKLOG TASKS:\n{tasks_str}\n\n"
        f"DELEGATION PERSONAS:\n{personas_str}"
    )
    
    return await run_with_fallback(weekly_planner_agent, prompt, deps=principles_context)

# --- QUARTERLY HORIZON AGENT (Mid-Term Project Roadmapping) ---

class QuarterlyMonthBlock(BaseModel):
    month_name: str = Field(description="e.g. 'April', 'May'")
    focal_projects: List[str] = Field(description="Names of major projects delivering this month")
    milestone_summary: str = Field(description="Summary of the core achievements targeted this month")

class QuarterlyRoadmapResult(BaseModel):
    overall_risk_assessment: str = Field(description="Evaluation of capacity limits vs the external deadlines across the 6-month scale")
    months: List[QuarterlyMonthBlock]

quarterly_planner_agent = Agent(
    model='google-gla:gemini-2.5-flash',
    output_type=QuarterlyRoadmapResult,
    system_prompt=(
        "You are a Strategic Architect managing a 1-6 month OKR roadmap. "
        "Review the active Projects and their firm external deadlines. "
        "Group milestones temporally mapping a realistic Month-by-Month progression towards those deadlines. "
        "Highlight overlapping deadlines as structural risks."
    )
)

async def generate_quarterly_roadmap(db: AsyncSession) -> QuarterlyRoadmapResult:
    from services.projects import get_all_projects
    from sqlmodel import select
    from models.domain import ProjectDependency
    
    projects = await get_all_projects(db)
    # Fetch all dependencies to build a sequence map
    res = await db.exec(select(ProjectDependency))
    deps = res.all()
    
    deps_map = {} # project_id -> list of depends_on_id
    for d in deps:
        deps_map.setdefault(d.project_id, []).append(d.depends_on_id)
    
    projects_data = []
    for p in projects:
        blocked_by = [next((px.name for px in projects if px.id == did), "Unknown") for did in deps_map.get(p.id, [])]
        projects_data.append(
            f"- {p.name} | Status: {p.health_status} | "
            f"Start: {p.start_date.isoformat() if p.start_date else 'Flexible'} | "
            f"Deadline: {p.external_deadline.isoformat() if p.external_deadline else 'Evergreen'} | "
            f"Gated By: {', '.join(blocked_by) if blocked_by else 'None'}"
        )
    
    projects_str = "\n".join(projects_data)
    
    prompt = (
        f"Generate a strategic 6-month OKR Roadmap.\n"
        f"STRICT SEQUENCING RULE: Projects marked as 'Gated By' CANNOT start until those gate projects are completed.\n"
        f"Respect 'Start' dates if provided as manual overrides, otherwise derive the optimal sequence to satisfy all gates.\n\n"
        f"PROJECT BACKLOG:\n{projects_str}"
    )
    
    return await run_with_fallback(quarterly_planner_agent, prompt)


# --- KNOWLEDGE BASE AGENT (Semantic RAG over personal KB) ---

class KbSearchResult(BaseModel):
    answer: str = Field(description="Natural-language synthesized answer to the user query, grounded strictly in the provided Knowledge Base entries.")
    cited_entry_titles: List[str] = Field(description="Titles of the Knowledge Base entries that were most relevant to the answer.")

kb_agent = Agent(
    model='google-gla:gemini-2.5-flash',
    output_type=KbSearchResult,
    system_prompt=(
        "You are a personal Knowledge Management AI. "
        "You receive a curated Knowledge Base (KB) of entries written by the user and a question. "
        "Your task: synthesize a precise, grounded answer using ONLY the content of the provided KB entries. "
        "If the answer is not present in the KB, say so honestly. Cite which entry titles informed your answer."
    )
)

async def ask_knowledge_base(db: AsyncSession, query: str) -> KbSearchResult:
    from services.knowledge import get_all_entries
    entries = await get_all_entries(db)
    
    if not entries:
        return KbSearchResult(answer="The Knowledge Base is empty. Add some entries first!", cited_entry_titles=[])
    
    kb_dump = "\n\n".join([
        f"### {e.title}\nTags: {e.tags}\n{e.content}" + (f"\nSource: {e.source_url}" if e.source_url else "")
        for e in entries
    ])
    
    prompt = f"KNOWLEDGE BASE:\n{kb_dump}\n\nUSER QUESTION:\n{query}"
    return await run_with_fallback(kb_agent, prompt)

