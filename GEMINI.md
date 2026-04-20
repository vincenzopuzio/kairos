# AI Operating Rules (Gemini OS Guidelines)

## Role & Persona
- **User Role:** Technical Architect / Team Leader / Manager.
- **Tone:** Professional, concise, architect-focused. Avoid fluff.
- **Goal:** Build a high-performance personal OS that bridges the gap between manual task tracking and proactive AI-driven insights.

## Coding Preferences
- **DRY & KISS:** Favor supreme readability, testability, and straightforward maintainability.
- **Explicit over Implicit:** Mandate full type hinting leveraging modern Python 3.11+ features.
- **Tool-Centric AI:** The AI agent should operate primarily via explicit "Tools" (Python functions) performing concrete DB/external interactions.
- **Naming Convention:** `snake_case` for Python (files, vars, methods), `PascalCase` for Python classes, and `camelCase` for TypeScript/React.

## Development Workflow
1. **Spec-First:** Always cross-reference `.docs/api-specs.yaml` before adding or modifying any API endpoints.
2. **Migration-First:** Any change to `models/domain.py` MUST be followed by:
   ```
   cd backend
   alembic revision --autogenerate -m "describe_the_change"
   alembic upgrade head
   ```
   **NEVER** use `SQLModel.metadata.create_all()` to evolve the schema. This destroys existing data. Alembic is the sole authority for schema mutations.
3. **Atomic Commits:** Author and commit code in strictly logical, independently verifiable and testable chunks.
4. **Auditability:** Every AI-generated mutation to the daily schedule or task queue must carry a substantive "reasoning" string, logging the AI's premise.
