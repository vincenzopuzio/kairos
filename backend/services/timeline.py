from typing import List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from models.domain import Task, Project
from models.schemas import TimelineItem

async def get_unified_timeline(db: AsyncSession) -> List[TimelineItem]:
    tasks_with_deadline = await db.exec(select(Task).where(Task.deadline != None))
    projects_with_deadline = await db.exec(select(Project).where(Project.external_deadline != None))

    items = []
    
    for t in tasks_with_deadline.all():
        items.append(TimelineItem(
            id=t.id,
            entity_type="task",
            title=t.title,
            deadline=t.deadline,
            priority=t.priority,
            status=t.status
        ))
        
    for p in projects_with_deadline.all():
        items.append(TimelineItem(
            id=p.id,
            entity_type="project",
            title=p.name,
            deadline=p.external_deadline,
            priority=None,
            status=None
        ))
        
    items.sort(key=lambda x: x.deadline)
    return items
