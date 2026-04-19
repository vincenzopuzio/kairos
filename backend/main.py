from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from asgi_correlation_id import CorrelationIdMiddleware
import structlog

from core.config import settings
from core.database import engine
from models.domain import SQLModel
from api.routers import tasks, projects, ai, stakeholders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Base local app: Synchronize / migrate SQLModel metadata onto DB at boot
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
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

# Expose API Resource Layers
app.include_router(tasks.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(stakeholders.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": settings.VERSION}
