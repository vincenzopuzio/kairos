import uuid
from typing import Optional
from enum import Enum
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class StatusEnum(str, Enum):
    backlog = "backlog"
    todo = "todo"
    in_progress = "in_progress"
    blocked = "blocked"
    done = "done"

class HealthEnum(str, Enum):
    on_track = "on_track"
    at_risk = "at_risk"
    delayed = "delayed"

class Stakeholder(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    role: str
    created_at: datetime = Field(default_factory=utc_now)

class Project(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    health_status: HealthEnum = Field(default=HealthEnum.on_track)
    external_deadline: datetime
    created_at: datetime = Field(default_factory=utc_now)

class Task(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    status: StatusEnum = Field(default=StatusEnum.todo)
    priority: int = Field(default=4, ge=1, le=4)
    deadline: Optional[datetime] = Field(default=None)
    project_id: Optional[uuid.UUID] = Field(default=None, foreign_key="project.id", ondelete="CASCADE")
    blocked_by_stakeholder_id: Optional[uuid.UUID] = Field(default=None, foreign_key="stakeholder.id")
    is_deep_work: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
