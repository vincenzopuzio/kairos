from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from api.dependencies import get_db
from models.domain import OsSettings
from models.schemas import OsSettingsUpdate
from services import os_settings as settings_service

router = APIRouter(prefix="/settings", tags=["OS Settings"])

@router.get("/", response_model=OsSettings)
async def get_settings(db: AsyncSession = Depends(get_db)):
    return await settings_service.get_os_settings(db)

@router.patch("/", response_model=OsSettings)
async def update_settings(settings_in: OsSettingsUpdate, db: AsyncSession = Depends(get_db)):
    return await settings_service.update_os_settings(db, settings_in)
