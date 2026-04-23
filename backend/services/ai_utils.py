import os
from typing import Any, Type, TypeVar
from pydantic import BaseModel
from pydantic_ai import Agent

from core.config import settings

T = TypeVar('T', bound=BaseModel)

PRIMARY_MODEL = 'google-gla:gemini-2.5-flash'
FALLBACK_MODEL = 'google-gla:gemini-2.0-flash'

async def _get_active_key(db_session: Any) -> str:
    """Helper to determine which API key to use from OsSettings and env."""
    from services.os_settings import get_os_settings
    
    os_settings = await get_os_settings(db_session)
    primary = settings.GEMINI_API_KEY
    secondary = settings.GEMINI_API_KEY_SECOND
    
    # If the user explicitly toggled "use target key 2"
    if os_settings.use_second_api_key and secondary:
        return secondary
    
    return primary or "dummy-test-key"

async def run_with_fallback(agent: Agent, prompt: str, deps: Any = None, history: Any = None, db: Any = None) -> Any:
    """Run an agent with automatic fallback from 2.5-flash to 2.0-flash AND API key swapping on quota."""
    
    # Pre-select primary key
    if db:
        new_key = await _get_active_key(db)
        os.environ["GOOGLE_API_KEY"] = new_key.strip()
        print(f"🔑 [AI_UTILS] Active Key Set: ...{os.environ['GOOGLE_API_KEY'][-4:]}")

    try:
        # Attempt with Selected Key and Primary Model
        result = await agent.run(prompt, deps=deps, message_history=history, model=PRIMARY_MODEL)
        return result.output
    except Exception as e:
        error_msg = str(e).upper()
        print(f"⚠️ [AI_UTILS] Primary Attempt Failed: {error_msg[:100]}...")
        
        # If High Demand (503), Quota (429), or Resource Exhausted
        is_quota_error = any(err in error_msg for err in ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED"])
        is_not_found = any(err in error_msg for err in ["404", "NOT_FOUND"])
        
        if is_quota_error or is_not_found:
            active_key_suffix = os.environ.get("GOOGLE_API_KEY", "")[-4:]
            
            # TRY SWAPPING KEY if it's a quota error
            if is_quota_error and settings.GEMINI_API_KEY_SECOND:
                current_key = os.environ.get("GOOGLE_API_KEY", "").strip()
                primary_key = (settings.GEMINI_API_KEY or "").strip()
                secondary_key = (settings.GEMINI_API_KEY_SECOND or "").strip()

                if current_key == primary_key and secondary_key:
                    print(f"🔄 [AI_UTILS] Quota Hit on Primary. Swapping to Secondary: ...{secondary_key[-4:]}")
                    os.environ["GOOGLE_API_KEY"] = secondary_key
                elif primary_key:
                    print(f"🔄 [AI_UTILS] Quota Hit on Secondary. Swapping back to Primary: ...{primary_key[-4:]}")
                    os.environ["GOOGLE_API_KEY"] = primary_key

            try:
                # Fallback to 2.0-flash (cheaper/higher quota usually)
                print(f"📡 [AI_UTILS] Attempting Fallback Mode with {FALLBACK_MODEL}...")
                result = await agent.run(prompt, deps=deps, message_history=history, model=FALLBACK_MODEL)
                
                output = result.output
                new_key_suffix = os.environ.get("GOOGLE_API_KEY", "")[-4:]
                
                note = f"🔄 *[Auto-Fallback applied (Key: ...{new_key_suffix})]*"
                if is_quota_error:
                    note = f"🔄 *[Quota Limit Hit: Swapped API Key (...{new_key_suffix}) & Fallback to 2.0-Flash]*"

                if hasattr(output, 'message') and isinstance(output.message, str):
                    output.message = note + "\n\n" + output.message
                elif hasattr(output, 'insights') and isinstance(output.insights, str):
                    output.insights = note + "\n\n" + output.insights
                
                return output
            except Exception as fe:
                print(f"❌ [AI_UTILS] Fallback Attempt also failed: {str(fe)[:100]}")
                raise fe
        raise e
