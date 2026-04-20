import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.domain import KnowledgeEntry
from models.schemas import KnowledgeEntryCreate, KnowledgeEntryUpdate
from services import knowledge as kb_service

router = APIRouter(prefix="/kb", tags=["Knowledge Base"])

@router.get("/", response_model=List[KnowledgeEntry])
async def list_entries(
    search: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    """List all KB entries, optionally filtering by fulltext search or tag."""
    return await kb_service.get_all_entries(db, search=search, tag=tag)

@router.get("/{entry_id}", response_model=KnowledgeEntry)
async def get_entry(entry_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    entry = await kb_service.get_entry_by_id(db, entry_id)
    if not entry:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@router.post("/", response_model=KnowledgeEntry, status_code=201)
async def create_entry(entry_in: KnowledgeEntryCreate, db: AsyncSession = Depends(get_db)):
    return await kb_service.create_entry(db, entry_in)

@router.patch("/{entry_id}", response_model=KnowledgeEntry)
async def update_entry(entry_id: uuid.UUID, entry_in: KnowledgeEntryUpdate, db: AsyncSession = Depends(get_db)):
    return await kb_service.update_entry(db, entry_id, entry_in)

@router.delete("/{entry_id}", status_code=204)
async def delete_entry(entry_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await kb_service.delete_entry(db, entry_id)
