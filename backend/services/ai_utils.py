import os
from typing import Any, Type, TypeVar, Optional
from pydantic import BaseModel
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.models.gemini import GeminiModel

from core.config import settings

T = TypeVar('T', bound=BaseModel)

def get_model(fallback: bool = False, force_provider: Optional[str] = None) -> Any:
    """Factory to return the appropriate model based on config."""
    provider = force_provider or settings.AI_PROVIDER
    
    if provider == "azure":
        # Azure OpenAI requires specific endpoint and deployment mapping
        return OpenAIModel(
            model_name=settings.AZURE_OPENAI_DEPLOYMENT or "gpt-4",
            base_url=f"{settings.AZURE_OPENAI_ENDPOINT}/openai/deployments/{settings.AZURE_OPENAI_DEPLOYMENT}",
            api_key=settings.AZURE_OPENAI_API_KEY,
        )
    else:
        # Default Google Gemini logic
        model_name = "gemini-2.0-flash" if fallback else "gemini-2.0-flash" 
        return model_name

async def _get_active_key(db_session: Any) -> str:
    from services.os_settings import get_os_settings
    os_settings = await get_os_settings(db_session)
    primary = settings.GEMINI_API_KEY
    secondary = settings.GEMINI_API_KEY_SECOND
    if os_settings.use_second_api_key and secondary:
        return secondary
    return primary or "dummy-test-key"

async def run_with_fallback(agent: Agent, prompt: Any, deps: Any = None, history: Any = None, db: Any = None) -> Any:
    """Run an agent with automatic fallback across providers and models."""
    
    if settings.AI_PROVIDER == "google" and db:
        new_key = await _get_active_key(db)
        os.environ["GOOGLE_API_KEY"] = new_key.strip()

    try:
        # TIER 1: Primary Model (Gemini 2.0 or Azure)
        model = get_model()
        result = await agent.run(prompt, deps=deps, message_history=history, model=model)
        return result.output
        
    except Exception as e:
        error_msg = str(e).upper()
        print(f"⚠️ [AI_UTILS] Primary Attempt Failed: {error_msg[:100]}...")
        
        # If it's a quota error, try fallback
        is_quota_error = any(err in error_msg for err in ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED"])
        
        if is_quota_error:
            # TRY SWAPPING KEY (Gemini only)
            if settings.AI_PROVIDER == "google" and settings.GEMINI_API_KEY_SECOND:
                current_key = os.environ.get("GOOGLE_API_KEY", "").strip()
                if current_key == (settings.GEMINI_API_KEY or "").strip():
                    os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY_SECOND
                else:
                    os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY or ""

            try:
                # TIER 2: Fallback (Azure is its own fallback, Google stays 2.0-flash)
                print(f"📡 [AI_UTILS] Attempting Fallback Mode...")
                fallback_model = get_model(fallback=True)
                result = await agent.run(prompt, deps=deps, message_history=history, model=fallback_model)
                return _apply_fallback_note(result.output, "🔄 *[Auto-Fallback applied]*")
                
            except Exception as fe:
                # TIER 3: CLAUDE
                if settings.CLAUDE_API_KEY:
                    print(f"🦉 [AI_UTILS] Exhausted. Final Attempt with Claude...")
                    os.environ["ANTHROPIC_API_KEY"] = settings.CLAUDE_API_KEY
                    try:
                        result = await agent.run(prompt, deps=deps, message_history=history, model='anthropic:claude-3-5-sonnet-latest')
                        return _apply_fallback_note(result.output, "🦉 *[CRITICAL FALLBACK: Claude]*")
                    except Exception as ce:
                        raise ce
                raise fe
        raise e

def _apply_fallback_note(output: Any, note: str) -> Any:
    for attr in ['message', 'insights', 'strategic_insight', 'reasoning', 'summary']:
        if hasattr(output, attr) and isinstance(getattr(output, attr), str):
            setattr(output, attr, note + "\n\n" + getattr(output, attr))
    return output
