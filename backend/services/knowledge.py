from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException
from models.domain import KnowledgeEntry
from models.schemas import KnowledgeEntryCreate, KnowledgeEntryUpdate
import uuid
from datetime import datetime, timezone

async def get_all_entries(db: AsyncSession, search: Optional[str] = None, tag: Optional[str] = None) -> List[KnowledgeEntry]:
    result = await db.exec(select(KnowledgeEntry))
    entries = result.all()
    if search:
        q = search.lower()
        entries = [e for e in entries if q in e.title.lower() or q in e.content.lower()]
    if tag:
        entries = [e for e in entries if tag.lower() in [t.strip().lower() for t in e.tags.split(",")]]
    return entries

async def get_entry_by_id(db: AsyncSession, entry_id: uuid.UUID) -> Optional[KnowledgeEntry]:
    return await db.get(KnowledgeEntry, entry_id)

async def create_entry(db: AsyncSession, entry_in: KnowledgeEntryCreate) -> KnowledgeEntry:
    db_entry = KnowledgeEntry(**entry_in.model_dump())
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    return db_entry

async def update_entry(db: AsyncSession, entry_id: uuid.UUID, entry_in: KnowledgeEntryUpdate) -> KnowledgeEntry:
    db_entry = await db.get(KnowledgeEntry, entry_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    update_data = entry_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_entry, key, value)
    db_entry.updated_at = datetime.now(timezone.utc)
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    return db_entry

async def delete_entry(db: AsyncSession, entry_id: uuid.UUID) -> None:
    db_entry = await db.get(KnowledgeEntry, entry_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    await db.delete(db_entry)
    await db.commit()
