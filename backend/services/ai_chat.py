import os
import uuid
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from pydantic_ai import Agent, RunContext

from models.domain import Task, Project, Stakeholder, StrategicGoal, StatusEnum
from services.tasks import get_all_tasks
from services.projects import get_all_projects
from services.stakeholders import get_all_stakeholders
from services.strategic_goals import get_all_strategic_goals

# --- MODELS FOR CHAT INTERACTION ---

class Action(BaseModel):
    action_type: str = Field(description="Type of action: CREATE_TASK, UPDATE_TASK, CREATE_PROJECT")
    payload: Dict[str, Any] = Field(description="Data for the action")
    reasoning: str = Field(description="Why this specific action is being proposed")

class ChatResponse(BaseModel):
    message: str = Field(description="Main textual response from the Strategic Advisor")
    proposed_plan: List[Action] = Field(default_factory=list, description="Optional list of actions for the user to approve")

# --- TOOLS FOR THE AGENT ---

advisor_agent = Agent(
    model='google-gla:gemini-2.0-flash',
    output_type=ChatResponse,
    system_prompt=(
        "You are the Strategic Advisor for the AI-Operating System. "
        "Your goal is to guide the user (a Technical Lead) by providing data-driven insights and actionable plans. "
        "You have access to the entire data model via tools. "
        "When recommending changes, provide a `proposed_plan` containing specific `Action` objects. "
        "Always be concise, architect-focused, and professional."
    )
)

@advisor_agent.tool
async def get_os_context(ctx: RunContext[AsyncSession]) -> Dict[str, Any]:
    """Retrieve the high-level context of all active projects and strategic goals."""
    db = ctx.deps
    projects = await get_all_projects(db)
    goals = await get_all_strategic_goals(db)
    
    return {
        "projects": [{"id": str(p.id), "name": p.name, "health": p.health_status} for p in projects],
        "strategic_goals": [{"id": str(g.id), "title": g.title, "target_hours": g.target_weekly_hours} for g in goals if g.is_active]
    }

@advisor_agent.tool
async def get_project_backlog(ctx: RunContext[AsyncSession], project_id: str) -> List[Dict[str, Any]]:
    """Get all tasks for a specific project to analyze current progress."""
    db = ctx.deps
    tasks = await get_all_tasks(db, include_blocked=True, project_id=uuid.UUID(project_id))
    return [{"id": str(t.id), "title": t.title, "status": t.status, "priority": t.priority} for t in tasks]

@advisor_agent.tool
async def get_stakeholders(ctx: RunContext[AsyncSession]) -> List[Dict[str, Any]]:
    """List all team personas (stakeholders) available for delegation."""
    db = ctx.deps
    stakeholders = await get_all_stakeholders(db)
    return [{"id": str(s.id), "name": s.name, "role": s.role, "can_delegate": s.can_delegate} for s in stakeholders]

# --- SERVICE EXECUTION ---

async def run_strategic_chat(db: AsyncSession, user_message: str, history: List[Any] = None) -> ChatResponse:
    """Execute a chat turn with the advisor agent."""
    try:
        result = await advisor_agent.run(user_message, deps=db, message_history=history)
        return result.data
    except Exception as e:
        # Handle Rate Limits / Quota Exhaustion specifically for better UX
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return ChatResponse(
                message="⚠️ **AI-OS Quota Exhausted**: The Gemini API free-tier quota has been reached. Please wait a few moments (usually ~60s) or check your API billing limits at ai.google.dev.",
                proposed_plan=[]
            )
        # Fallback for other issues
        return ChatResponse(
            message=f"⚔️ **Strategic Link Error**: {error_msg}",
            proposed_plan=[]
        )
