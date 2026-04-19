# Testing Strategy & QA Standards

## 1. Testing Pyramid
- **Unit Tests (80%):** Test di logica pura (es. calcolo priorità, parsing dei task).
- **Integration Tests (15%):** Test dei contract API e delle interazioni con il database (SQLite).
- **E2E Tests (5%):** Test dei flussi critici (es. "L'utente crea un task tramite AI e lo vede in agenda").

## 2. Backend Testing (Pytest)
- **Framework:** `pytest` con `pytest-asyncio`.
- **Database:** Usa una sessione SQLite in-memory per ogni test case per garantire l'isolamento.
- **Mocking Strategy:** - Mock obbligatorio per le chiamate esterne agli LLM (Gemini API).
    - Utilizzare `pytest-mock` per simulare i tool della GenAI.
- **Coverage Goal:** Minimo 90% di copertura sui servizi di core logic.

## 3. AI Testing (The "Eval" Pattern)
Dato che l'output della GenAI è non-deterministico:
- **Golden Sets:** Mantieni un set di prompt di input e output attesi per validare l'agente (es. "Decompose Task" deve sempre restituire almeno 3 sotto-task validi).
- **Assertion on Structure:** I test devono verificare che l'output dell'AI rispetti lo schema Pydantic definito, non solo il testo.

## 4. Frontend Testing (Vitest & Testing Library)
- **Component Tests:** Testare lo stato dei componenti React isolati.
- **Hook Testing:** Testare la logica di Zustand e i custom hooks di React Query.
- **User Flow Mocking:** Usa MSW (Mock Service Worker) per simulare le risposte delle API nel frontend.
