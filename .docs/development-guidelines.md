# Development Guidelines & Best Practices

## 1. Backend (FastAPI + SQLModel)
- **Dependency Injection:** Strictly utilize FastAPI `Depends` for managing decoupled database sessions (injecting `AsyncSession`) and instantiating AI context services cleanly. 
- **Async Everywhere:** All routing handlers, long-running filesystem operations, and database query executions must be radically asynchronous (`async def`, `await`).
- **Pydantic V2:** Heavily enforce native Pydantic V2 schemas logic to dictate rigid serialization, payload validation, and type coercion.
- **Robust Middlewares & Error Handling:** 
  - Centralize error trapping via a global exception handler. Conform all operational errors to standardize JSON envelopes (e.g., `{"error": "StringCode", "detail": "Human-readable payload"}`).
  - Add highly defensive `CORSMiddleware`.
  - Prefer request ID tracing (`asgi-correlation-id`) combined with structured JSON logging (`structlog`) for deep audibility of AI processes.

## 2. AI Implementation (PydanticAI)
- **Structured Output:** Every programmatic invocation directed at the LLM must consistently and verifiably yield a strongly-typed Pydantic object. Never depend on raw chunked strings internally (unless directly rendering a chat completion).
- **Tool Selection:** Expose Tools selectively implementing the Principle of Least Privilege. Only permit tools the model requires for an immediate specific objective.
- **System Prompts Architecture:** Vigorously isolate System Prompts from core business logic loops. Manage them centrally entirely within a `prompts.py` registry or fetch them dynamically from a datastore.

## 3. Frontend (React + Zustand)
- **Component Strategy:** Integrate `shadcn/ui` foundationally. Force React components to be small, functionally pure, and narrowly scoped (Single Responsibility Principle).
- **Type Safety:** TypeScript is universally mandatory. Ensure strict type declarations frame all API response interfaces and state bindings.
- **State Management Ecosystem:** 
  - Isolate client-side state transitions (session logic, interface toggle rendering) cleanly using `Zustand`.
  - Offload all server-side data synchronization, request caching, and optimistic mutations to `React Query` (`@tanstack/react-query`).

## 4. Testing & Documentation
- **TDD Approach:** As Antigravity handles net-new feature generation logic, it must conceptually map and generate corresponding `pytest` cases mapping edge conditions prior to actual backend realization.
- **Self-Documenting Code:** All functions and primary object boundaries must declare exhaustive docstrings specifying payload structures, operational impacts, and explicit business logic definitions.

## 5. AI Prompting Strategy (Anti-Hallucination)
- **Chain of Thought (CoT):** Mandatory across consequential AI decisions. The AI must vocalize its intrinsic logic internally (mapped to a `reasoning` payload string) before executing conclusive side effects.
- **Input Grounding:** Before finalizing its answer scope, the underlying AI must accurately cite the precise dataset fragment anchoring its conclusion (e.g., "Relying on Task X parameters coupled with Calendar state Y...").
- **Confidence Score Thresholds:** The AI must explicitly rank its certainty regarding state mutations. If its confidence metric drops below 70%, it must halt mutation workflows and forcefully issue a review alert to the human user.
