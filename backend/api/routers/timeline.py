from typing import List
from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.schemas import TimelineItem
from services import timeline as timeline_service

router = APIRouter(prefix="/timeline", tags=["Timeline"])

@router.get("/", response_model=List[TimelineItem])
async def get_timeline(db: AsyncSession = Depends(get_db)):
    return await timeline_service.get_unified_timeline(db)
