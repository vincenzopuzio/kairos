from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from models.domain import StatusEnum, HealthEnum, GradeEnum, SeniorityEnum, ProactivityEnum, ProductivityEnum, OrganizationEnum, InteractionEnum, StrategicCategoryEnum, ProjectTypeEnum

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: StatusEnum = StatusEnum.todo
    priority: int = 4
    deadline: Optional[datetime] = None
    project_id: Optional[uuid.UUID] = None
    milestone_id: Optional[uuid.UUID] = None
    parent_id: Optional[uuid.UUID] = None
    blocked_by_stakeholder_id: Optional[uuid.UUID] = None
    is_deep_work: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StatusEnum] = None
    priority: Optional[int] = None
    deadline: Optional[datetime] = None
    project_id: Optional[uuid.UUID] = None
    milestone_id: Optional[uuid.UUID] = None
    parent_id: Optional[uuid.UUID] = None
    blocked_by_stakeholder_id: Optional[uuid.UUID] = None
    is_deep_work: Optional[bool] = None

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    health_status: HealthEnum = HealthEnum.on_track
    project_type: ProjectTypeEnum = ProjectTypeEnum.deadline_driven
    start_date: Optional[datetime] = None
    external_deadline: Optional[datetime] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    health_status: Optional[HealthEnum] = None
    project_type: Optional[ProjectTypeEnum] = None
    start_date: Optional[datetime] = None
    external_deadline: Optional[datetime] = None

class MilestoneCreate(BaseModel):
    title: str
    target_date: Optional[datetime] = None
    order: int = 0

class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    target_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    order: Optional[int] = None

class StakeholderCreate(BaseModel):
    name: str
    role: str
    company: Optional[str] = "Avanade"
    grade: GradeEnum = GradeEnum.peer
    seniority: SeniorityEnum = SeniorityEnum.expert
    proactivity: ProactivityEnum = ProactivityEnum.medium
    productivity: ProductivityEnum = ProductivityEnum.medium
    organization: OrganizationEnum = OrganizationEnum.internal
    interaction_type: InteractionEnum = InteractionEnum.cooperate
    can_delegate: bool = False
    skills: str = ""
    general_description: str = ""

class StakeholderUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    grade: Optional[GradeEnum] = None
    seniority: Optional[SeniorityEnum] = None
    proactivity: Optional[ProactivityEnum] = None
    productivity: Optional[ProductivityEnum] = None
    organization: Optional[OrganizationEnum] = None
    interaction_type: Optional[InteractionEnum] = None
    can_delegate: Optional[bool] = None
    skills: Optional[str] = None
    general_description: Optional[str] = None

class StrategicGoalCreate(BaseModel):
    title: str
    category: StrategicCategoryEnum
    target_weekly_hours: int = 5
    min_days_per_week: int = 1
    slot_duration_minutes: int = 30
    min_weekly_hours: Optional[int] = None
    max_weekly_hours: Optional[int] = None
    is_active: bool = True

class StrategicGoalUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[StrategicCategoryEnum] = None
    target_weekly_hours: Optional[int] = None
    min_days_per_week: Optional[int] = None
    slot_duration_minutes: Optional[int] = None
    min_weekly_hours: Optional[int] = None
    max_weekly_hours: Optional[int] = None
    is_active: Optional[bool] = None

class GuidingPrincipleCreate(BaseModel):
    id: str
    title: str
    subtitle: str
    description: str
    actionable_advice: str
    color: str

class GuidingPrincipleUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    actionable_advice: Optional[str] = None
    color: Optional[str] = None

class TimelineItem(BaseModel):
    id: uuid.UUID
    entity_type: str # "task" or "project"
    title: str
    deadline: datetime
    priority: Optional[int] = None
    status: Optional[str] = None

class OsSettingsUpdate(BaseModel):
    max_weekly_work_hours: Optional[int] = None
    max_weekly_combined_hours: Optional[int] = None
    day_template_monday: Optional[str] = None
    day_template_tuesday: Optional[str] = None
    day_template_wednesday: Optional[str] = None
    day_template_thursday: Optional[str] = None
    day_template_friday: Optional[str] = None
    day_template_saturday: Optional[str] = None
    day_template_sunday: Optional[str] = None
    template_definitions: Optional[str] = None

class WeeklyPlannerRequest(BaseModel):
    max_weekly_combined_hours: Optional[int] = None
    day_template_monday: Optional[str] = None
    day_template_tuesday: Optional[str] = None
    day_template_wednesday: Optional[str] = None
    day_template_thursday: Optional[str] = None
    day_template_friday: Optional[str] = None
    day_template_saturday: Optional[str] = None
    day_template_sunday: Optional[str] = None
    template_definitions: Optional[str] = None

class KnowledgeEntryCreate(BaseModel):
    title: str
    content: str
    tags: str = ""
    source_url: Optional[str] = None

class KnowledgeEntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None
    source_url: Optional[str] = None

class KnowledgeSearchRequest(BaseModel):
    query: str

