from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from models.domain import StatusEnum, HealthEnum

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: StatusEnum = StatusEnum.todo
    priority: int = 4
    deadline: Optional[datetime] = None
    project_id: Optional[uuid.UUID] = None
    blocked_by_stakeholder_id: Optional[uuid.UUID] = None
    is_deep_work: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    priority: Optional[int] = None
    deadline: Optional[datetime] = None
    project_id: Optional[uuid.UUID] = None
    blocked_by_stakeholder_id: Optional[uuid.UUID] = None
    is_deep_work: Optional[bool] = None

class ProjectCreate(BaseModel):
    name: str
    health_status: HealthEnum = HealthEnum.on_track
    external_deadline: datetime

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    health_status: Optional[HealthEnum] = None
    external_deadline: Optional[datetime] = None

class StakeholderCreate(BaseModel):
    name: str
    role: str

class StakeholderUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
