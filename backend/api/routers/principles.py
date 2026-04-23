from typing import List
from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from api.dependencies import get_db
from models.domain import GuidingPrinciple
from models.schemas import GuidingPrincipleCreate, GuidingPrincipleUpdate, PrincipleResearchRequest, PrincipleResearchResponse
from services import principles as principles_service
from services import ai as ai_service

router = APIRouter(prefix="/principles", tags=["Guiding Principles"])

@router.get("/", response_model=List[GuidingPrinciple])
async def get_principles(db: AsyncSession = Depends(get_db)):
    return await principles_service.get_all_principles(db)

@router.post("/", response_model=GuidingPrinciple, status_code=201)
async def create_principle(p_in: GuidingPrincipleCreate, db: AsyncSession = Depends(get_db)):
    return await principles_service.create_principle(db, p_in)

@router.patch("/{principle_id}", response_model=GuidingPrinciple)
async def update_principle(principle_id: str, p_in: GuidingPrincipleUpdate, db: AsyncSession = Depends(get_db)):
    return await principles_service.update_principle(db, principle_id, p_in)

@router.delete("/{principle_id}", status_code=204)
async def delete_principle(principle_id: str, db: AsyncSession = Depends(get_db)):
    await principles_service.delete_principle(db, principle_id)

@router.post("/research", response_model=PrincipleResearchResponse)
async def research_principles(req: PrincipleResearchRequest):
    return await ai_service.research_guiding_principles(req.query, "")
