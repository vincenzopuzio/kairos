import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
from api.dependencies import get_db, get_current_user
from models.schemas import TraitCreate, TraitUpdate, TraitRead, TraitDetailRead, AuditCreate, AuditRead, TaskCreate
from services import self_mirror as sm_service
from services import ai as ai_service

router = APIRouter(prefix="/self-mirror", tags=["self-mirror"])

@router.get("/traits", response_model=List[TraitRead])
async def list_traits(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await sm_service.get_all_traits(db)

@router.post("/traits", response_model=TraitRead)
async def create_trait(trait_in: TraitCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await sm_service.create_trait(db, trait_in)

@router.get("/traits/{trait_id}", response_model=TraitDetailRead)
async def get_trait(trait_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    trait = await sm_service.get_trait_by_id(db, trait_id)
    if not trait:
        raise HTTPException(status_code=404, detail="Trait not found")
    
    audits = await sm_service.get_trait_history(db, trait_id)
    
    # Calculate current rating based on last audit
    current_rating = audits[0].rating if audits else None
    last_audit_at = audits[0].created_at if audits else None
    
    return TraitDetailRead(
        **trait.model_dump(),
        audits=audits,
        current_rating=current_rating,
        last_audit_at=last_audit_at
    )

@router.patch("/traits/{trait_id}", response_model=TraitRead)
async def update_trait(trait_id: uuid.UUID, trait_in: TraitUpdate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    trait = await sm_service.update_trait(db, trait_id, trait_in)
    if not trait:
        raise HTTPException(status_code=404, detail="Trait not found")
    return trait

@router.delete("/traits/{trait_id}")
async def delete_trait(trait_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    success = await sm_service.delete_trait(db, trait_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trait not found")
    return {"status": "success"}

@router.post("/audits", response_model=AuditRead)
async def create_audit(audit_in: AuditCreate, db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    return await sm_service.create_audit(db, audit_in)

@router.post("/advisory", response_model=dict)
async def generate_advisory(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    traits = await sm_service.get_all_traits(db)
    
    traits_with_audits = []
    for t in traits:
        audits = await sm_service.get_trait_history(db, t.id)
        current_rating = audits[0].rating if audits else None
        traits_with_audits.append({
            **t.model_dump(),
            "audits": [a.model_dump() for a in audits[:1]], # Latest only
            "current_rating": current_rating
        })
        
    advisory = await ai_service.generate_growth_advisory(traits_with_audits)
    
    # Get the Growth Epic to link the suggested tasks
    growth_epic = await sm_service.get_growth_epic(db)
    
    return {
        "insight": advisory.strategic_insight,
        "suggested_tasks": [t.model_dump() for t in advisory.suggested_tasks],
        "growth_epic_id": str(growth_epic.id)
    }
