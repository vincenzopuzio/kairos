import uuid
from typing import List, Optional
from datetime import datetime
from sqlmodel import select, func
from sqlalchemy.orm import selectinload
from sqlmodel.ext.asyncio.session import AsyncSession
from models.domain import PersonalTrait, ReflectionAudit, Project, ProjectTypeEnum
from models.schemas import TraitCreate, TraitUpdate, AuditCreate

async def get_all_traits(db: AsyncSession) -> List[PersonalTrait]:
    res = await db.exec(
        select(PersonalTrait)
        .options(selectinload(PersonalTrait.projects))
        .order_by(PersonalTrait.impact.desc())
    )
    return res.all()

async def get_trait_by_id(db: AsyncSession, trait_id: uuid.UUID) -> Optional[PersonalTrait]:
    res = await db.exec(
        select(PersonalTrait)
        .where(PersonalTrait.id == trait_id)
        .options(selectinload(PersonalTrait.projects))
    )
    return res.first()

async def create_trait(db: AsyncSession, trait_in: TraitCreate) -> PersonalTrait:
    db_trait = PersonalTrait.model_validate(trait_in)
    db.add(db_trait)
    await db.commit()
    await db.refresh(db_trait)
    return db_trait

async def update_trait(db: AsyncSession, trait_id: uuid.UUID, trait_in: TraitUpdate) -> Optional[PersonalTrait]:
    db_trait = await get_trait_by_id(db, trait_id)
    if not db_trait:
        return None
    
    update_data = trait_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_trait, key, value)
    
    db.add(db_trait)
    await db.commit()
    await db.refresh(db_trait)
    return db_trait

async def delete_trait(db: AsyncSession, trait_id: uuid.UUID) -> bool:
    db_trait = await get_trait_by_id(db, trait_id)
    if not db_trait:
        return False
    await db.delete(db_trait)
    await db.commit()
    return True

async def create_audit(db: AsyncSession, audit_in: AuditCreate) -> ReflectionAudit:
    db_audit = ReflectionAudit.model_validate(audit_in)
    db.add(db_audit)
    await db.commit()
    await db.refresh(db_audit)
    return db_audit

async def get_trait_history(db: AsyncSession, trait_id: uuid.UUID) -> List[ReflectionAudit]:
    res = await db.exec(
        select(ReflectionAudit)
        .where(ReflectionAudit.trait_id == trait_id)
        .order_by(ReflectionAudit.created_at.desc())
    )
    return res.all()

async def get_growth_epic(db: AsyncSession) -> Project:
    """Finds or creates the 'Personal Growth' epic."""
    res = await db.exec(select(Project).where(Project.name == "Personal Growth"))
    project = res.first()
    if not project:
        project = Project(
            name="Personal Growth",
            description="Automated Epic for tracking personal improvement and self-mirror actions.",
            project_type=ProjectTypeEnum.evergreen
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
    return project
