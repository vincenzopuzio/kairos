# Tech Stack & Standards

## Backend
- **Framework:** FastAPI
- **Architecture Pattern:** Model-Controller-Service (MCS). Routers act securely as Controllers delegating business logic and DB access to isolated Services.
- **Database:** SQLite (dev) / PostgreSQL (prod) via SQLModel.
- **Migrations:** Alembic.
- **AI Framework:** PydanticAI (per la type-safety e l'integrazione nativa con Pydantic).
- **Validation:** Pydantic v2.

## Frontend
- **Framework:** React 18+ (Vite).
- **Styling:** Tailwind CSS + Shadcn UI (componenti accessibili e puliti).
- **State Management:** Zustand (leggero e veloce).

## Coding Standards
- **Spec-First:** Implementare le API partendo sempre dal file `openapi.yaml`.
- **Typing:** Type hinting obbligatorio su tutto il backend Python.
- **Testing:** Pytest per il backend, Vitest per il frontend.
