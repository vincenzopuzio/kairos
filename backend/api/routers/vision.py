from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import get_db
from services.ai import analyze_vision_image, VisionParseResult

router = APIRouter()

@router.post("/analyze", response_model=VisionParseResult)
async def analyze_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives an image (e.g. from mobile camera), performs OCR via Gemini Multimodal,
    and returns a summary + suggested tasks.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        content = await file.read()
        result = await analyze_vision_image(content, file.content_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vision analysis failed: {str(e)}")
