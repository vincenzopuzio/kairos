from typing import List, Optional
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from fastapi import HTTPException
from models.domain import KnowledgeEntry
from models.schemas import KnowledgeEntryCreate, KnowledgeEntryUpdate
import uuid
from datetime import datetime, timezone

from .kb_providers import get_storage_provider

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
    entry = await db.get(KnowledgeEntry, entry_id)
    if entry and entry.storage_path:
        storage = get_storage_provider()
        entry.content = await storage.load(entry.storage_path)
    return entry

async def create_entry(db: AsyncSession, entry_in: KnowledgeEntryCreate) -> KnowledgeEntry:
    # 1. Create DB entry first
    db_entry = KnowledgeEntry(**entry_in.model_dump())
    
    # 2. Save content to storage provider
    storage = get_storage_provider()
    storage_path = await storage.save(str(db_entry.id), entry_in.content)
    db_entry.storage_path = storage_path
    
    # 3. Placeholder for Embedding generation
    # db_entry.embedding = await generate_embedding(entry_in.content)
    
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    return db_entry

async def update_entry(db: AsyncSession, entry_id: uuid.UUID, entry_in: KnowledgeEntryUpdate) -> KnowledgeEntry:
    db_entry = await db.get(KnowledgeEntry, entry_id)
    if not db_entry:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
        
    update_data = entry_in.model_dump(exclude_unset=True)
    
    # Update content in storage if provided
    if "content" in update_data:
        storage = get_storage_provider()
        await storage.save(str(db_entry.id), update_data["content"])
        # Update preview in DB as well
        db_entry.content = update_data["content"][:500] # Keep a snippet
        
    for key, value in update_data.items():
        if key != "content":
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
        
    if db_entry.storage_path:
        storage = get_storage_provider()
        await storage.delete(db_entry.storage_path)
        
    await db.delete(db_entry)
    await db.commit()
