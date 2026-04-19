# Frontend Specifications

## 1. Design System & UI Library
- **Framework:** React + Vite (TypeScript).
- **Styling:** Tailwind CSS.
- **Components:** Shadcn/UI (per coerenza e accessibilità).
- **Icons:** Lucide-React.
- **Layout:** Dashboard a due colonne (Sidebar per navigazione e progetti, Main Content per task e focus).

## 2. Key Views (Le Viste Principali)
- **Daily Focus View:** Una vista pulita che mostra solo l'agenda generata dall'AI e il task corrente (Deep Work focus).
- **Project Matrix:** Una vista a tabella o Kanban che evidenzia i "Blocking Tasks" e lo stato degli "Shadow Tasks".
- **AI Command Center:** Una barra di comando (stile Spotlight/Raycast) per input rapido via Natural Language.
- **Knowledge Base Explorer:** Interfaccia per gestire i documenti caricati e una chat persistente con l'assistente.

## 3. State Management & Data Fetching
- **Client State:** Zustand (per gestire il tema, lo stato della sidebar e i filtri globali).
- **Server State:** React Query (TanStack Query) per il caching delle API, gestione dei caricamenti (skeleton screens) e refetching automatico quando un task viene aggiornato.

## 4. UX Principles for Managers
- **Density:** Preferire una densità di informazioni medio-alta (stile Linear.app) per avere visione d'insieme.
- **Keyboard First:** Supporto per scorciatoie da tastiera (es. `CMD+K` per cercare, `N` per nuovo task).
- **Feedback Loops:** Ogni azione dell'AI (es. scomposizione di un task) deve mostrare un loader e una conferma chiara.

## 5. UI/UX Guidelines
