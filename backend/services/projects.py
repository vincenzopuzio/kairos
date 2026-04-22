from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from models.domain import Project, ProjectDependency, Stakeholder, Task, Milestone
from models.schemas import ProjectCreate, ProjectUpdate, ProjectRead, ProjectTaskStats, ProjectMilestoneStats
import uuid

async def get_all_projects(db: AsyncSession) -> List[ProjectRead]:
    result = await db.exec(select(Project).options(
        selectinload(Project.stakeholders),
        selectinload(Project.org),
        selectinload(Project.tasks),
        selectinload(Project.milestones)
    ))
    projects = result.all()
    read_projects = []
    for p in projects:
        task_stats = ProjectTaskStats(
            todo=len([t for t in p.tasks if t.status == "todo"]),
            in_progress=len([t for t in p.tasks if t.status == "in_progress"]),
            blocked=len([t for t in p.tasks if t.status == "blocked"]),
            done=len([t for t in p.tasks if t.status == "done"]),
            total=len(p.tasks)
        )
        milestone_stats = ProjectMilestoneStats(
            total=len(p.milestones),
            completed=len([m for m in p.milestones if m.is_completed])
        )
        
        # Convert to ProjectRead schema
        project_data = p.model_dump()
        # Add nested data not in model_dump or needing specific format
        project_data["task_stats"] = task_stats
        project_data["milestone_stats"] = milestone_stats
        project_data["org"] = p.org.model_dump() if p.org else None
        project_data["stakeholders"] = [s.model_dump() for s in p.stakeholders]
        
        read_projects.append(ProjectRead(**project_data))
    return read_projects

async def get_project_by_id(db: AsyncSession, project_id: uuid.UUID) -> Optional[ProjectRead]:
    result = await db.exec(select(Project).where(Project.id == project_id).options(
        selectinload(Project.stakeholders),
        selectinload(Project.org),
        selectinload(Project.tasks),
        selectinload(Project.milestones)
    ))
    p = result.first()
    if not p:
        return None
        
    task_stats = ProjectTaskStats(
        todo=len([t for t in p.tasks if t.status == "todo"]),
        in_progress=len([t for t in p.tasks if t.status == "in_progress"]),
        blocked=len([t for t in p.tasks if t.status == "blocked"]),
        done=len([t for t in p.tasks if t.status == "done"]),
        total=len(p.tasks)
    )
    milestone_stats = ProjectMilestoneStats(
        total=len(p.milestones),
        completed=len([m for m in p.milestones if m.is_completed])
    )
    
    project_data = p.model_dump()
    project_data["task_stats"] = task_stats
    project_data["milestone_stats"] = milestone_stats
    project_data["org"] = p.org.model_dump() if p.org else None
    project_data["stakeholders"] = [s.model_dump() for s in p.stakeholders]
    
    return ProjectRead(**project_data)

async def create_new_project(db: AsyncSession, project_in: ProjectCreate) -> ProjectRead:
    data = project_in.model_dump(exclude={"stakeholder_ids"})
    db_project = Project(**data)
    
    if project_in.stakeholder_ids:
        for s_id in project_in.stakeholder_ids:
            st = await db.get(Stakeholder, s_id)
            if st:
                db_project.stakeholders.append(st)
                
    db.add(db_project)
    await db.commit()
    return await get_project_by_id(db, db_project.id)

async def update_project(db: AsyncSession, project_id: uuid.UUID, project_in: ProjectUpdate) -> ProjectRead:
    # Use select with selectinload to ensure stakeholders are loaded for update,
    # preventing MissingGreenlet error on async session.
    result = await db.exec(
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.stakeholders))
    )
    db_project = result.first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    update_data = project_in.model_dump(exclude_unset=True, exclude={"stakeholder_ids"})
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    if project_in.stakeholder_ids is not None:
        # Explicitly clear and rebuild to ensure SQLModel/SQLAlchemy tracks changes correctly in async
        db_project.stakeholders = []
        await db.flush() # Sync the clear
        
        for s_id in project_in.stakeholder_ids:
            st = await db.get(Stakeholder, s_id)
            if st:
                db_project.stakeholders.append(st)
        
        print(f"Updated project {project_id} stakeholders to count: {len(db_project.stakeholders)}")

    db.add(db_project)
    await db.commit()
    
    # Re-fetch using existing helper to ensure stakeholders and org are loaded for the response
    fixed_project = await get_project_by_id(db, project_id)
    return fixed_project

async def delete_project(db: AsyncSession, project_id: uuid.UUID) -> None:
    db_project = await db.get(Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(db_project)
    await db.commit()

# ---- Dependency graph ----

async def get_dependencies(db: AsyncSession, project_id: uuid.UUID) -> List[ProjectDependency]:
    result = await db.exec(select(ProjectDependency).where(ProjectDependency.project_id == project_id))
    return list(result.all())

async def add_dependency(db: AsyncSession, project_id: uuid.UUID, depends_on_id: uuid.UUID) -> ProjectDependency:
    if project_id == depends_on_id:
        raise HTTPException(status_code=400, detail="A project cannot depend on itself")
    existing = await db.get(ProjectDependency, (project_id, depends_on_id))
    if existing:
        return existing
    dep = ProjectDependency(project_id=project_id, depends_on_id=depends_on_id)
    db.add(dep)
    await db.commit()
    return dep

async def remove_dependency(db: AsyncSession, project_id: uuid.UUID, depends_on_id: uuid.UUID) -> None:
    dep = await db.get(ProjectDependency, (project_id, depends_on_id))
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency not found")
    await db.delete(dep)
    await db.commit()

