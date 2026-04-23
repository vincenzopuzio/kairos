from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from models.domain import StatusEnum, HealthEnum, GradeEnum, SeniorityEnum, ProactivityEnum, ProductivityEnum, OrganizationEnum, InteractionEnum, StrategicCategoryEnum, ProjectTypeEnum, ProjectAreaEnum, CircleEnum, TraitCategory, TraitType, SentimentEnum
from typing import List
import uuid

class OrganizationCreate(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None

class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: StatusEnum = StatusEnum.todo
    priority: int = 4
    importance: int = 2
    urgency: int = 2
    is_frog: bool = False
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
    importance: Optional[int] = None
    urgency: Optional[int] = None
    is_frog: Optional[bool] = None
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
    stakeholder_ids: Optional[List[uuid.UUID]] = None
    trait_ids: Optional[List[uuid.UUID]] = None
    organization_id: Optional[uuid.UUID] = None
    category: ProjectAreaEnum = ProjectAreaEnum.personal

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    health_status: Optional[HealthEnum] = None
    project_type: Optional[ProjectTypeEnum] = None
    start_date: Optional[datetime] = None
    external_deadline: Optional[datetime] = None
    stakeholder_ids: Optional[List[uuid.UUID]] = None
    trait_ids: Optional[List[uuid.UUID]] = None
    organization_id: Optional[uuid.UUID] = None
    category: Optional[ProjectAreaEnum] = None

class ProjectTaskStats(BaseModel):
    todo: int = 0
    in_progress: int = 0
    blocked: int = 0
    done: int = 0
    total: int = 0

class ProjectMilestoneStats(BaseModel):
    total: int = 0
    completed: int = 0

class ProjectRead(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str] = None
    health_status: HealthEnum
    project_type: ProjectTypeEnum
    start_date: Optional[datetime] = None
    external_deadline: Optional[datetime] = None
    organization_id: Optional[uuid.UUID] = None
    category: ProjectAreaEnum
    created_at: datetime
    task_stats: Optional[ProjectTaskStats] = None
    milestone_stats: Optional[ProjectMilestoneStats] = None
    # We'll use basic dicts or any for nested models to avoid circular imports if any, 
    # but usually schemas are fine.
    org: Optional[dict] = None
    stakeholders: List[dict] = []
    traits: List[dict] = []

    class Config:
        from_attributes = True

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
    circle: CircleEnum = CircleEnum.same_org
    interaction_type: InteractionEnum = InteractionEnum.cooperate
    can_delegate: bool = False
    skills: str = ""
    general_description: str = ""
    organization_id: Optional[uuid.UUID] = None

class StakeholderRead(BaseModel):
    id: uuid.UUID
    name: str
    role: str
    company: str
    seniority: SeniorityEnum
    interaction_type: InteractionEnum
    can_delegate: bool
    
    class Config:
        from_attributes = True

class StakeholderUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    grade: Optional[GradeEnum] = None
    seniority: Optional[SeniorityEnum] = None
    proactivity: Optional[ProactivityEnum] = None
    productivity: Optional[ProductivityEnum] = None
    organization: Optional[OrganizationEnum] = None
    circle: Optional[CircleEnum] = None
    interaction_type: Optional[InteractionEnum] = None
    can_delegate: Optional[bool] = None
    skills: Optional[str] = None
    general_description: Optional[str] = None
    organization_id: Optional[uuid.UUID] = None

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
    id: Optional[str] = None
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
    use_second_api_key: Optional[bool] = None

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

class UserCreate(BaseModel):
    email: str
    password: str

class UserRead(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- SELF-MIRROR (Personal Growth) ---
class TraitBase(BaseModel):
    name: str
    category: TraitCategory
    trait_type: TraitType
    impact: int
    description: Optional[str] = None

class TraitCreate(TraitBase):
    pass

class TraitUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[TraitCategory] = None
    trait_type: Optional[TraitType] = None
    impact: Optional[int] = None
    description: Optional[str] = None

class TraitRead(TraitBase):
    id: uuid.UUID
    created_at: datetime
    projects: List[dict] = []

class AuditBase(BaseModel):
    trait_id: uuid.UUID
    rating: int
    summary: str

class AuditCreate(AuditBase):
    pass

class AuditRead(AuditBase):
    id: uuid.UUID
    created_at: datetime

class TraitDetailRead(TraitRead):
    audits: List[AuditRead] = []
    current_rating: Optional[int] = None
    last_audit_at: Optional[datetime] = None

class AssessmentCreate(BaseModel):
    project_id: uuid.UUID
    summary: str
    lessons_learned: str
    rating: int

class AssessmentRead(AssessmentCreate):
    id: uuid.UUID
    created_at: datetime

class ProjectDetailRead(ProjectRead):
    assessments: List[AssessmentRead] = []

# --- RELATIONSHIP JOURNALING ---
class InteractionCreate(BaseModel):
    content: str
    stakeholder_ids: List[uuid.UUID] = []
    sentiment: SentimentEnum = SentimentEnum.neutral
    lesson_learned: Optional[str] = None
    advice_received: Optional[str] = None

    class Config:
        from_attributes = True

class InteractionRead(BaseModel):
    id: uuid.UUID
    content: str
    sentiment: SentimentEnum
    lesson_learned: Optional[str] = None
    advice_received: Optional[str] = None
    created_at: datetime
    stakeholders: List[StakeholderRead] = []

    class Config:
        from_attributes = True

# --- RESEARCH ---
class PrincipleResearchRequest(BaseModel):
    query: str

class ProposedPrinciple(BaseModel):
    title: str
    subtitle: str
    description: str
    actionable_advice: str
    color: str

class PrincipleResearchResponse(BaseModel):
    top_principles: List[ProposedPrinciple]
    strategic_context: str

# --- TASK INGESTION ---
class IngestedTask(BaseModel):
    title: str = Field(description="Distinct action item")
    description: Optional[str] = Field(description="Explanation of work")
    priority: int = Field(default=4, ge=1, le=4)
    importance: int = Field(default=2, ge=1, le=3)
    urgency: int = Field(default=2, ge=1, le=3)
    is_frog: bool = Field(default=False)
    suggested_project_id: Optional[uuid.UUID] = Field(default=None, description="Matching Project UUID if clear")
    reasoning: str = Field(description="Why this task was extracted and mapped this way")

class TaskIngestRequest(BaseModel):
    text: str

class TaskIngestResponse(BaseModel):
    tasks: List[IngestedTask]
    summary: str

