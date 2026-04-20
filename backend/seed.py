import asyncio
import uuid
import datetime
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import SQLModel, select
from core.database import engine
from models.domain import (
    Task, Project, StatusEnum, Stakeholder, GradeEnum, SeniorityEnum,
    ProactivityEnum, ProductivityEnum, OrganizationEnum, InteractionEnum,
    StrategicGoal, StrategicCategoryEnum, OsSettings,
    ProjectTypeEnum, HealthEnum, Milestone
)

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async with AsyncSession(engine) as session:
        # ---- Projects ----
        project_dev = Project(
            id=uuid.uuid4(),
            name="Personal AI OS V1.0",
            description="Full-stack AI personal operating system",
            health_status=HealthEnum.on_track,
            project_type=ProjectTypeEnum.deadline_driven,
            external_deadline=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=90)
        )
        project_learning = Project(
            id=uuid.uuid4(),
            name="AWS Solutions Architect Prep",
            description="Ongoing technical certification path",
            health_status=HealthEnum.on_track,
            project_type=ProjectTypeEnum.evergreen,
            external_deadline=None
        )
        session.add(project_dev)
        session.add(project_learning)
        await session.flush()

        # ---- Milestones for AI OS project ----
        milestones = [
            Milestone(project_id=project_dev.id, title="Analysis", order=0, is_completed=True),
            Milestone(project_id=project_dev.id, title="Design", order=1, is_completed=True),
            Milestone(project_id=project_dev.id, title="Implementation", order=2, is_completed=False),
            Milestone(project_id=project_dev.id, title="UAT", order=3, is_completed=False),
            Milestone(project_id=project_dev.id, title="Go-Live", order=4, is_completed=False),
            Milestone(project_id=project_dev.id, title="Hypercare", order=5, is_completed=False),
        ]
        for m in milestones:
            session.add(m)
        await session.flush()

        # ---- Tasks ----
        tasks = [
            Task(
                id=uuid.uuid4(),
                title="Design Database Schema Replication",
                description="Crucial architectural block",
                status=StatusEnum.in_progress,
                priority=1,
                is_deep_work=True,
                project_id=project_dev.id,
                milestone_id=milestones[2].id,  # Implementation
            ),
            Task(
                id=uuid.uuid4(),
                title="Integrate API Gateway",
                description="Wait for external dev",
                status=StatusEnum.blocked,
                priority=2,
                is_deep_work=False,
                project_id=project_dev.id,
                milestone_id=milestones[2].id,
            ),
            Task(
                id=uuid.uuid4(),
                title="Refactor Frontend layout styles",
                description="Migrate class components",
                status=StatusEnum.todo,
                priority=3,
                is_deep_work=False,
                project_id=project_dev.id,
                milestone_id=milestones[2].id,
            ),
        ]
        for t in tasks:
            session.add(t)

        # ---- Personas ----
        personas = [
            Stakeholder(
                id=uuid.uuid4(), name="Bob Architect", role="Cloud Solutions Architect", company="Avanade",
                grade=GradeEnum.peer, seniority=SeniorityEnum.expert,
                proactivity=ProactivityEnum.high, productivity=ProductivityEnum.high,
                organization=OrganizationEnum.internal, interaction_type=InteractionEnum.cooperate,
                can_delegate=False, skills="AWS, Kubernetes, Terraform",
                general_description="Highly autonomous cloud engineer. Do not assign trivial web tasks."
            ),
            Stakeholder(
                id=uuid.uuid4(), name="Sarah Engineer", role="Frontend Developer", company="Microsoft",
                grade=GradeEnum.below, seniority=SeniorityEnum.junior,
                proactivity=ProactivityEnum.medium, productivity=ProductivityEnum.medium,
                organization=OrganizationEnum.internal, interaction_type=InteractionEnum.delegate,
                can_delegate=True, skills="React, Typescript, CSS",
                general_description="Junior dev eager to learn. Good for delegating UI component standardizations."
            ),
            Stakeholder(
                id=uuid.uuid4(), name="John Manager", role="Product Owner", company="Avanade",
                grade=GradeEnum.above, seniority=SeniorityEnum.manager,
                proactivity=ProactivityEnum.high, productivity=ProductivityEnum.medium,
                organization=OrganizationEnum.internal, interaction_type=InteractionEnum.interact_only,
                can_delegate=False, skills="Scrum, Agile, JIRA",
                general_description="Stakeholder focusing on business logic. Use for blocked external requirements only."
            ),
        ]
        for p in personas:
            session.add(p)

        # ---- Strategic Goals ----
        goals = [
            StrategicGoal(id=uuid.uuid4(), title="AWS Solutions Architect Certification", category=StrategicCategoryEnum.learning, target_weekly_hours=5),
            StrategicGoal(id=uuid.uuid4(), title="Meditation & Gym Recovery", category=StrategicCategoryEnum.wellbeing, target_weekly_hours=8),
            StrategicGoal(id=uuid.uuid4(), title="Senior Engineering Peer Reviews", category=StrategicCategoryEnum.networking, target_weekly_hours=3),
        ]
        for g in goals:
            session.add(g)

        # ---- OS Settings (singleton check) ----
        existing = await session.exec(select(OsSettings))
        if not existing.first():
            session.add(OsSettings(
                max_weekly_work_hours=40,
                max_weekly_combined_hours=48,
                day_template_monday="Focus & Planning",
                day_template_tuesday="Deep Work",
                day_template_wednesday="Meetings & Code Reviews",
                day_template_thursday="Deep Work",
                day_template_friday="Wrapping Up & Learning",
                day_template_saturday="Offline",
                day_template_sunday="Offline",
                template_definitions="Deep Work implies uninterrupted contiguous blocks of at least 2 hours. Meetings should always be forced into the afternoon to protect cognitive flow."
            ))

        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
