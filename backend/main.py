from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from asgi_correlation_id import CorrelationIdMiddleware
import structlog

from core.config import settings
from core.database import engine
from models.domain import SQLModel
from api.routers import tasks, projects, ai, stakeholders, strategic_goals, timeline, os_settings, knowledge, milestones, principles, interactions, organizations, self_mirror, vision, audio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Schema is managed exclusively by Alembic migrations — run `alembic upgrade head` before starting.
    # Seed built-in project templates (idempotent)
    from core.database import async_session_factory
    from services.milestones import seed_default_templates
    from services.principles import seed_default_principles
    async with async_session_factory() as session:
        await seed_default_templates(session)
        await seed_default_principles(session)
    yield
    # Shutdown hook

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Robust Middlewares Injection
app.add_middleware(CorrelationIdMiddleware)

# Strict CORS Policies explicitly declared
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if not settings.BACKEND_CORS_ORIGINS else [str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from api.dependencies import get_current_user
from fastapi import Depends
from api.routers import auth, tasks, projects, ai, stakeholders, strategic_goals, timeline, os_settings, knowledge, milestones, principles, interactions, organizations

# ... (rest of middlewares)

# Expose API Resource Layers
app.include_router(auth.router, prefix=settings.API_V1_STR)

# Protected Routes
protected_deps = [Depends(get_current_user)]
app.include_router(tasks.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(projects.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(stakeholders.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(strategic_goals.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(timeline.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(os_settings.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(ai.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(knowledge.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(milestones.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(principles.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(interactions.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(organizations.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(self_mirror.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(vision.router, prefix=settings.API_V1_STR, dependencies=protected_deps)
app.include_router(audio.router, prefix=settings.API_V1_STR, dependencies=protected_deps)

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}
