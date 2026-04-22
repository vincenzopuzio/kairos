import uuid
from typing import List, Optional
from enum import Enum
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship

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

class StrategicCategoryEnum(str, Enum):
    learning = "learning"
    networking = "networking"
    wellbeing = "wellbeing"
    architecture = "architecture"

class ProjectTypeEnum(str, Enum):
    deadline_driven = "deadline_driven"
    evergreen = "evergreen"

class ProactivityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class ProductivityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class GradeEnum(str, Enum):
    above = "above"
    peer = "peer"
    below = "below"

class SeniorityEnum(str, Enum):
    junior = "junior"
    expert = "expert"
    manager = "manager"
    executive = "executive"

class InteractionEnum(str, Enum):
    delegate = "delegate"
    cooperate = "cooperate"
    interact_only = "interact_only"

class OrganizationEnum(str, Enum):
    internal = "internal"
    external = "external"

class CircleEnum(str, Enum):
    teammate = "teammate"
    client = "client"
    same_org = "same_org"
    different_org = "different_org"

class SentimentEnum(str, Enum):
    positive = "positive"
    neutral = "neutral"
    tense = "tense"
    hostile = "hostile"

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now)

class StakeholderInteractionLink(SQLModel, table=True):
    interaction_id: uuid.UUID = Field(foreign_key="stakeholderinteraction.id", primary_key=True, ondelete="CASCADE")
    stakeholder_id: uuid.UUID = Field(foreign_key="stakeholder.id", primary_key=True, ondelete="CASCADE")

class StakeholderInteraction(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str = Field() # The journal/diary entry
    sentiment: SentimentEnum = Field(default=SentimentEnum.neutral)
    lesson_learned: Optional[str] = Field(default=None)
    advice_received: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now)
    
    # Relationship
    stakeholders: List["Stakeholder"] = Relationship(back_populates="interactions", link_model=StakeholderInteractionLink)

class ProjectStakeholderLink(SQLModel, table=True):
    project_id: uuid.UUID = Field(foreign_key="project.id", primary_key=True, ondelete="CASCADE")
    stakeholder_id: uuid.UUID = Field(foreign_key="stakeholder.id", primary_key=True, ondelete="CASCADE")

class Organization(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None)
    industry: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now)

    # Relationships
    stakeholders: List["Stakeholder"] = Relationship(back_populates="org")
    projects: List["Project"] = Relationship(back_populates="org")

class Stakeholder(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    role: str
    company: str = Field(default="Avanade") # Legacy/Display field
    
    organization_id: Optional[uuid.UUID] = Field(default=None, foreign_key="organization.id", ondelete="SET NULL")
    
    # AI Teammate Persona Properties
    grade: GradeEnum = Field(default=GradeEnum.peer)
    seniority: SeniorityEnum = Field(default=SeniorityEnum.expert)
    proactivity: ProactivityEnum = Field(default=ProactivityEnum.medium)
    productivity: ProductivityEnum = Field(default=ProductivityEnum.medium)
    organization: OrganizationEnum = Field(default=OrganizationEnum.internal)
    circle: CircleEnum = Field(default=CircleEnum.same_org)
    interaction_type: InteractionEnum = Field(default=InteractionEnum.cooperate)
    
    can_delegate: bool = Field(default=False)
    skills: str = Field(default="") # e.g. "React, Node, Python"
    general_description: str = Field(default="") # Explicit context vector for LLM evaluation
    
    created_at: datetime = Field(default_factory=utc_now)
    
    # Relationships
    interactions: List[StakeholderInteraction] = Relationship(back_populates="stakeholders", link_model=StakeholderInteractionLink)
    org: Optional[Organization] = Relationship(back_populates="stakeholders")
    projects: List["Project"] = Relationship(back_populates="stakeholders", link_model=ProjectStakeholderLink)

class Project(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = Field(default=None)
    health_status: HealthEnum = Field(default=HealthEnum.on_track)
    project_type: ProjectTypeEnum = Field(default=ProjectTypeEnum.deadline_driven)
    start_date: Optional[datetime] = Field(default=None)
    external_deadline: Optional[datetime] = Field(default=None)  # None for evergreen projects
    organization_id: Optional[uuid.UUID] = Field(default=None, foreign_key="organization.id", ondelete="SET NULL")
    created_at: datetime = Field(default_factory=utc_now)

    # Relationships
    stakeholders: List[Stakeholder] = Relationship(back_populates="projects", link_model=ProjectStakeholderLink)
    org: Optional[Organization] = Relationship(back_populates="projects")
    tasks: List["Task"] = Relationship(back_populates="project")
    milestones: List["Milestone"] = Relationship(back_populates="project")

class ProjectTemplate(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: str = Field(default="")
    milestone_titles: str = Field()  # Pipe-separated ordered phases
    system_prompt: str = Field(default="")  # Injected into AI planners when this template's project is in context

class Milestone(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="project.id", ondelete="CASCADE")
    project: "Project" = Relationship(back_populates="milestones")
    title: str
    target_date: Optional[datetime] = Field(default=None)
    is_completed: bool = Field(default=False)
    order: int = Field(default=0)
    created_at: datetime = Field(default_factory=utc_now)

class ProjectDependency(SQLModel, table=True):
    """Directed gate: project_id cannot start until depends_on_id is completed."""
    project_id: uuid.UUID = Field(foreign_key="project.id", ondelete="CASCADE", primary_key=True)
    depends_on_id: uuid.UUID = Field(foreign_key="project.id", ondelete="CASCADE", primary_key=True)

class Task(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    status: StatusEnum = Field(default=StatusEnum.todo)
    priority: int = Field(default=4, ge=1, le=4)
    deadline: Optional[datetime] = Field(default=None)
    project_id: Optional[uuid.UUID] = Field(default=None, foreign_key="project.id", ondelete="CASCADE")
    project: Optional["Project"] = Relationship(back_populates="tasks")
    milestone_id: Optional[uuid.UUID] = Field(default=None, foreign_key="milestone.id", ondelete="SET NULL")
    parent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="task.id", ondelete="CASCADE")
    blocked_by_stakeholder_id: Optional[uuid.UUID] = Field(default=None, foreign_key="stakeholder.id")
    is_deep_work: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

class StrategicGoal(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(unique=True, index=True)
    category: StrategicCategoryEnum
    target_weekly_hours: int = Field(default=5)
    min_days_per_week: int = Field(default=1) # Frequency quota
    slot_duration_minutes: int = Field(default=30) # Planned chunk size
    min_weekly_hours: Optional[int] = Field(default=None)
    max_weekly_hours: Optional[int] = Field(default=None)
    is_active: bool = Field(default=True)

class GuidingPrinciple(SQLModel, table=True):
    id: str = Field(primary_key=True) # e.g. "eat-the-frog"
    title: str
    subtitle: str
    description: str
    actionable_advice: str
    color: str
    created_at: datetime = Field(default_factory=utc_now)

class OsSettings(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    max_weekly_work_hours: int = Field(default=40)
    max_weekly_combined_hours: int = Field(default=48)
    day_template_monday: str = Field(default="Focus & Planning")
    day_template_tuesday: str = Field(default="Deep Work")
    day_template_wednesday: str = Field(default="Meetings & Code Reviews")
    day_template_thursday: str = Field(default="Deep Work")
    day_template_friday: str = Field(default="Wrapping Up & Learning")
    day_template_saturday: str = Field(default="Offline")
    day_template_sunday: str = Field(default="Offline")
    template_definitions: str = Field(default="Provide explicit guidelines for your templates. E.g., 'Deep Work begins after 10 AM in contiguous blocks'. The AI will interpret these flexibly.")
    created_at: datetime = Field(default_factory=utc_now)

class KnowledgeEntry(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    content: str = Field()
    tags: str = Field(default="") # Comma-separated: "python,architecture,fastapi"
    source_url: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)



