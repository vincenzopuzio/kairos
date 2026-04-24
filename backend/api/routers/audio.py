from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from core.database import get_db
from services.ai import transcribe_audio_to_tasks
from models.schemas import TaskIngestResponse

router = APIRouter()

@router.post("/transcribe", response_model=TaskIngestResponse)
async def transcribe_audio(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Receives an audio file from mobile, transcribes it via Gemini Multimodal,
    and returns a set of actionable tasks.
    """
    # Accept common mobile audio formats
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be audio")
    
    try:
        content = await file.read()
        result = await transcribe_audio_to_tasks(content, file.content_type)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio transcription failed: {str(e)}")
