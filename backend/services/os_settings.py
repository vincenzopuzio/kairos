from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from fastapi import HTTPException
from models.domain import OsSettings
from models.schemas import OsSettingsUpdate

async def get_os_settings(db: AsyncSession) -> OsSettings:
    result = await db.exec(select(OsSettings))
    settings = result.first()
    if not settings:
        raise HTTPException(status_code=404, detail="OS Settings not initialized. Run seed script.")
    return settings

async def update_os_settings(db: AsyncSession, settings_in: OsSettingsUpdate) -> OsSettings:
    settings = await get_os_settings(db)
    
    update_data = settings_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)
        
    db.add(settings)
    await db.commit()
    await db.refresh(settings)
    return settings
