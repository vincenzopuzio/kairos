import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException
from models.domain import Milestone, ProjectTemplate
from models.schemas import MilestoneCreate, MilestoneUpdate

# ---- Milestones ----

async def get_milestones_for_project(db: AsyncSession, project_id: uuid.UUID) -> List[Milestone]:
    result = await db.exec(
        select(Milestone).where(Milestone.project_id == project_id).order_by(Milestone.order)
    )
    return list(result.all())

async def create_milestone(db: AsyncSession, project_id: uuid.UUID, data: MilestoneCreate) -> Milestone:
    m = Milestone(project_id=project_id, **data.model_dump())
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return m

async def update_milestone(db: AsyncSession, milestone_id: uuid.UUID, data: MilestoneUpdate) -> Milestone:
    m = await db.get(Milestone, milestone_id)
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(m, k, v)
    db.add(m)
    await db.commit()
    await db.refresh(m)
    return m

async def delete_milestone(db: AsyncSession, milestone_id: uuid.UUID) -> None:
    m = await db.get(Milestone, milestone_id)
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")
    await db.delete(m)
    await db.commit()

async def apply_template_to_project(db: AsyncSession, project_id: uuid.UUID, template_id: uuid.UUID) -> List[Milestone]:
    """Delete existing milestones for a project and bulk-create from a template."""
    # Delete existing milestones
    existing = await get_milestones_for_project(db, project_id)
    for m in existing:
        await db.delete(m)
    await db.flush()

    template = await db.get(ProjectTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    titles = [t.strip() for t in template.milestone_titles.split("|") if t.strip()]
    milestones = []
    for idx, title in enumerate(titles):
        m = Milestone(project_id=project_id, title=title, order=idx)
        db.add(m)
        milestones.append(m)

    await db.commit()
    for m in milestones:
        await db.refresh(m)
    return milestones

# ---- Project Templates ----

async def get_all_templates(db: AsyncSession) -> List[ProjectTemplate]:
    result = await db.exec(select(ProjectTemplate))
    return list(result.all())

async def seed_default_templates(db: AsyncSession) -> None:
    """Idempotently seed built-in templates at startup."""
    result = await db.exec(select(ProjectTemplate))
    existing_names = {t.name for t in result.all()}

    defaults = [
        ProjectTemplate(
            name="Software Delivery",
            description="Standard phased delivery lifecycle for software projects.",
            milestone_titles="Analysis|Design|Implementation|UAT|Go-Live|Hypercare",
            system_prompt=(
                "You are planning tasks for a SOFTWARE DELIVERY project. "
                "Strictly respect the phase sequence: Analysis → Design → Implementation → UAT → Go-Live → Hypercare. "
                "Never schedule implementation tasks before design is complete. "
                "UAT requires client access—flag any tasks that depend on external stakeholders. "
                "Hypercare tasks should be lightweight reactive items (monitoring, hotfixes). "
                "Prefer deep-work blocks for Implementation phase tasks."
            )
        ),
        ProjectTemplate(
            name="Personal Growth",
            description="Ongoing self-development arc with quarterly review checkpoints.",
            milestone_titles="Baseline Assessment|Month 1 Focus|Month 3 Review|Month 6 Mastery Check",
            system_prompt=(
                "You are planning tasks for a PERSONAL GROWTH / EVERGREEN project. "
                "There is no hard deadline. Prioritize consistency over intensity. "
                "Schedule tasks in short, regular sessions (pomodoro-style) rather than marathon blocks. "
                "Include reflection/review tasks at milestone boundaries. "
                "Protect this time from operational override — treat it as non-negotiable strategic investment."
            )
        ),
        ProjectTemplate(
            name="Research & Spike",
            description="Time-boxed technical investigation with a defined output artifact.",
            milestone_titles="Problem Framing|Literature Review|Prototype|Results & Recommendations",
            system_prompt=(
                "You are planning tasks for a RESEARCH / SPIKE project. "
                "This is time-boxed: the goal is a concrete output artifact, not perfection. "
                "Problem Framing must produce a crisp one-paragraph problem statement before any other work begins. "
                "Literature Review should surface 3-5 authoritative references, not exhaustive coverage. "
                "Prototype should be throwaway code — do not over-engineer. "
                "Results & Recommendations must include a clear go/no-go decision or architectural recommendation."
            )
        ),
    ]
    for tpl in defaults:
        if tpl.name not in existing_names:
            db.add(tpl)
    await db.commit()

