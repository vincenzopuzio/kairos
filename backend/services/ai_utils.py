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
        os.environ["GOOGLE_API_KEY"] = await _get_active_key(db)

    try:
        # Attempt with Selected Key and Primary Model
        result = await agent.run(prompt, deps=deps, message_history=history, model=PRIMARY_MODEL)
        return result.output
    except Exception as e:
        error_msg = str(e).upper()
        
        # If High Demand (503), Quota (429), or Resource Exhausted
        is_quota_error = any(err in error_msg for err in ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED"])
        is_not_found = any(err in error_msg for err in ["404", "NOT_FOUND"])
        
        if is_quota_error or is_not_found:
            # TRY SWAPPING KEY if it's a quota error
            if is_quota_error and settings.GEMINI_API_KEY_SECOND:
                current_key = os.environ.get("GOOGLE_API_KEY")
                # If we were using the first, try the second
                if current_key == settings.GEMINI_API_KEY:
                    os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY_SECOND
                # If we were using the second, try the first (though unlikely to help)
                else:
                    os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY or ""

            try:
                # Fallback to 2.0-flash (cheaper/higher quota usually)
                result = await agent.run(prompt, deps=deps, message_history=history, model=FALLBACK_MODEL)
                
                output = result.output
                note = "🔄 *[Auto-Fallback applied]*"
                if is_quota_error:
                    note = "🔄 *[Quota Limit Hit: Swapped API Key & Fallback to 2.0-Flash]*"

                if hasattr(output, 'message') and isinstance(output.message, str):
                    output.message = note + "\n\n" + output.message
                elif hasattr(output, 'insights') and isinstance(output.insights, str):
                    output.insights = note + "\n\n" + output.insights
                
                return output
            except Exception as fe:
                raise fe
        raise e
