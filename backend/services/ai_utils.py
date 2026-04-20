import os
from typing import Any, Type, TypeVar
from pydantic import BaseModel
from pydantic_ai import Agent

T = TypeVar('T', bound=BaseModel)

PRIMARY_MODEL = 'google-gla:gemini-2.5-flash'
FALLBACK_MODEL = 'google-gla:gemini-2.0-flash'

async def run_with_fallback(agent: Agent, prompt: str, deps: Any = None, history: Any = None) -> Any:
    """Run an agent with automatic fallback from 2.5-flash to 2.0-flash on specific errors."""
    try:
        # Attempt with Primary Model
        result = await agent.run(prompt, deps=deps, message_history=history, model=PRIMARY_MODEL)
        return result.output
    except Exception as e:
        error_msg = str(e)
        # If High Demand (503), Quota (429) or Not Found (404), try Fallback Model
        if any(err in error_msg for err in ["503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED", "404", "NOT_FOUND"]):
            try:
                result = await agent.run(prompt, deps=deps, message_history=history, model=FALLBACK_MODEL)
                # If the result is a BaseModel with a 'message' or 'insights' field, we can inject a note
                output = result.output
                if hasattr(output, 'message') and isinstance(output.message, str):
                    output.message = "🔄 *[Auto-Fallback to 2.0-Flash]*\n\n" + output.message
                elif hasattr(output, 'insights') and isinstance(output.insights, str):
                    output.insights = "🔄 *[Auto-Fallback to 2.0-Flash]*\n\n" + output.insights
                
                return output
            except Exception as fe:
                raise fe
        raise e
