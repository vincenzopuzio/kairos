# User Stories & Acceptance Criteria

This document maps the core Vision and Domain Language into strict User Stories tailored for the primary persona: a **Technical Architect / Team Leader**. These stories mathematically dictate the backend logistics (FastAPI, SQLModel) and GenAI architectural bounds (PydanticAI).

---

## 1. Core Task Management (CRUD, Deadlines)

### US-1.1: Atomic Task Lifecycle
**As a Technical Architect,** I want to seamlessly create, read, update, and delete (CRUD) my Atomic Tasks, **so that** I maintain a deterministic, reliable single source of truth for all my ongoing engineering vectors.

**Technical Acceptance Criteria:**
- **Given** a valid client payload directed to `POST /tasks`, **the system must** validate the JSON payload using Pydantic V2 schemas and durably persist the entity via asynchronous SQLModel.
- **The database** must automatically provision a primary key UUID (`uuid.uuid4`) and generate standardized `created_at` / `updated_at` server timestamps.
- **The API must** default the `status` strictly to `todo` and gracefully initialize `is_deep_work` to `false` if omitted.
- **The system must** return an HTTP 201 Created header wrapping the fully serialized task object upon success.

### US-1.2: Enforcing Micro-Prioritization & Temporal Boundaries
**As a Technical Architect,** I want to rigorously attribute sequential priority levels (1-4) and explicit, timezone-aware deadlines to tasks, **so that** I can accurately enforce mission-critical SLAs.

**Technical Acceptance Criteria:**
- **The SQLModel Database schema** must explicitly enforce `priority` boundaries strictly allowing integers from `1` to `4`.
- **The `deadline` logical field** must demand standard ISO 8601 DateTime parsing augmented with strict timezone awareness.
- **The API** endpoint (`GET /tasks`) must natively support granular filtering logic (e.g., querying for all tasks possessing Priority 1 with a deadline occurring in the next 24 hours).

### US-1.3: Real-Time Task Property Mutation
**As a Technical Architect,** I want to explicitly edit live attributes of deployed tasks (such as priority shifts, completion status, or reassigning to Epics), **so that** my architecture adapts seamlessly to volatile execution conditions.

**Technical Acceptance Criteria:**
- **Given** a PATCH request to `/tasks/{task_id}`, the UI must pass isolated properties needing adjustment without requiring full object replacement.
- **The specific fields** `title`, `description`, `priority`, `project_id`, and `status` must gracefully accept mutations validated through Pydantic.
- **The React UI** must instantiate a functional Modal and immediately trigger a global TanStack Query cache-invalidation cycle to reflect the new state concurrently.

---

## 2. Managerial Insights (Dependencies, Shadow Tasks, Critical Path)

### US-2.1: Navigating External Blockers & Shadow Tracking Logic
**As a Technical Architect,** I want to formally log "Shadow Tasks" while binding them to targeted Stakeholders, **so that** I can explicitly track blocking external dependencies without inherently inheriting the task ownership.

**Technical Acceptance Criteria:**
- **Given** a task fundamentally requires an external artifact, **the system must** enable transitioning the enum `status` strictly to `blocked`.
- **The API** must permit linking a validated `Stakeholder.id` UUID securely onto the `blocked_by_stakeholder_id` foreign key.
- **The system must** enforce an explicit referential constraint ensuring `Stakeholder.id` resolves genuinely against the `Stakeholder` master table.

### US-2.2: Critical Path Evaluation & Epic Health
**As a Technical Architect,** I want to instantly extrapolate the computed `Health Status` of an interconnected Epic/Project, **so that** I can quickly pinpoint bottleneck tasks jeopardizing the External Deadline.

**Technical Acceptance Criteria:**
- **The `Project` Model** must natively store an immutable `external_deadline`.
- **The System** must automatically orchestrate the `health_status` enum logic (`on_track`, `at_risk`, `delayed`) based upon absolute proximity mapping between remaining critical tasks and the `external_deadline`.
- **When querying** `GET /projects`, the API must rapidly yield this computed `HealthEnum` state alongside the standard payload footprint.

---

## 3. AI Intelligence (Daily Planner, Task Decomposition, KB RAG)

### US-3.1: GenAI Gap Filler Engine (Heuristic Decomposition)
**As a Technical Architect,** I want the AI to autonomously fragment vague Epics or ambiguous objectives into distinct, actionable Atomic Tasks, **so that** I eliminate the cognitive tax mapping execution choreography.

**Technical Acceptance Criteria:**
- **Given** a validated invocation to `POST /ai/decompose`, the backend must spin up a `PydanticAI` reasoning routine isolating the target `task_id`.
- **The LLM Tool** must strictly output its response as an enumerable `list[Task]` constrained seamlessly through Pydantic validators.
- **The Generation Cycle** must supply an internal `reasoning` trace string explaining the structural derivation from the parent Epic.

### US-3.2: AI-Optimized Daily Planner & Deep Work Protection
**As a Technical Architect,** I want the AI to dynamically assemble my Daily Planner by aggressively defending 90-minute "Deep Work Slots", **so that** my deep architecture analysis flow remains fundamentally undisturbed by trivial context switching.

**Technical Acceptance Criteria:**
- **When hitting** `POST /ai/daily-planner`, the backend asynchronously indexes pending tasks holding the `is_deep_work=true` flag.
- **The AI Scheduling Algorithm** must forcefully allocate contiguous blocks lasting a minimum of 90 minutes marked definitively as `activity_type: deep_work`.
- **The algorithm must** intelligently compute and dispense `buffer_time` specifically between exhaustive sessions to absorb cognitive shock.
- **The `insights` response payload MUST** actively identify single points of failure directly threatening the user's computed critical path.

### US-3.3: Ingested Context & Technical RAG Integration
**As a Technical Architect,** I want to query the assistant relying simultaneously on my dynamic task queues and vectorized system documentation, **so that** the AI synthesizes contextual architectural answers grounded against my actual environment.

**Technical Acceptance Criteria:**
- **A background worker process** must seamlessly parse, map, and vector-embed local documentation streams (e.g., Markdown guidelines) securely into the Vector Store mechanism.
- **The AI Prompting Engine** must formally adopt a Retrieval-Augmented Generation (RAG) architecture.
- **Confidence Scoring Validation:** Every technical answer yielded MUST pass an explicit hallucination dampener. Should the AI's internal confidence score dip below `0.70`, the system must aggressively fail open, notifying the human architecture layer of the uncertainty matrix.

---

## 4. Teammate Personas & AI Interoperability

### US-4.1: Architecting Advanced Personas for Contextualization
**As a Technical Architect,** I want to define highly detailed Personas for my teammates and stakeholders (capturing skills, seniority, and organizational constraints), **so that** the AI orchestration layer can dynamically evaluate if, when, and how to delegate technical tasks away from me.

**Technical Acceptance Criteria:**
- **The SQLModel Database schema** must expand the rudimentary `Stakeholder` model into a mathematically constrained `Persona` construct.
- **The Entity must strictly implement Enums** capturing multi-dimensional human behavior:
  - `grade` (`above`, `peer`, `below`) declaring structural hierarchy.
  - `proactivity` and `productivity` (`low`, `medium`, `high`) declaring execution reliability heuristics.
  - `organization` (`internal`, `external`).
  - `interaction_type` (`cooperate`, `interact_only`, `delegate`) defining the rigid limits of my authority over them.
- **A `can_delegate` boolean flag** paired with a robust `skills` array and a freeform `general_description` must be permanently logged to feed the LLM semantic contextual understanding.

### US-4.2: Intelligent AI Delegation Engine
**As a Technical Architect,** I want the AI Task-Decomposition Engine to statically parse these Persona bounds, **so that** it automatically identifies the "Critical Path" for delegation, offloading standard tasks to subordinates while strictly protecting my isolated Deep Work.

**Technical Acceptance Criteria:**
- **When the LLM** is invoked (`POST /ai/decompose` or `POST /ai/daily-planner`), the backend must dynamically query and inject a serialized context block containing all active `Personas`.
- **The AI Logic** must algorithmically cross-reference proposed sub-tasks with the `skills` array of peers.
- **Constraint Enforcement:** The AI must explicitly **never** recommend assigning an action to a persona possessing `interaction_only` or an `above` grade unless the prompt explicitly frames it as an external blocker request.

---

## 5. Strategic Goals & Weekly Programming (Burnout Prevention)

### US-5.1: Defining Core Strategic Macro-Goals
**As a Technical Architect working 60+ hours a week,** I want to define explicit `Strategic Goals` (e.g., Certifications, Architectural Study, Networking, Wellbeing), **so that** the OS natively enforces resource allocations protecting my personal growth and mental bandwidth.

**Technical Acceptance Criteria:**
- **The SQLModel Schema** must introduce a `StrategicGoal` entity featuring explicit constraints: `title`, `target_weekly_hours` (integer), and `category_enum` (`Learning`, `Networking`, `Wellbeing`).
- **The architecture** must classify these goals not as standard backlog tickets, but as immutable baseline capacity blocks permanently reserved on the ledger.

### US-5.2: AI-Powered Weekly Horizon Planning
**As a Technical Architect,** I want to operate over a holistic "Weekly Programming" board rather than solely surviving a Daily Focus, **so that** I can algorithmically distribute my workload predicting when to delegate and when to reserve entire blocks exclusively for Strategic Goals.

**Technical Acceptance Criteria:**
- **The Backend Workflow** must expose a `POST /ai/weekly-planner` routine injecting the full operational backlog alongside the `StrategicGoals`.
- **The Output Payload** must physically distribute days (Monday - Sunday).
- **The AI Execution Protocol:** The PydanticAI model MUST mathematically guarantee the placement of `target_weekly_hours` blocks first. Any ensuing operational deficit MUST strictly trigger the `Teammate Delegation Engine` (US-4.2) to systematically offload remaining assignments to the Personas.

---

## 6. Global Timeline Roadmap (Scadenzario)

### US-6.1: Unified Temporal Aggregation
**As a Technical Architect juggling multiple layers of context,** I need a unified API ledger that aggregates every single deadline across the system, **so that** I never miss an obscure Project or Task boundary.

**Technical Acceptance Criteria:**
- **Backend Extrapolation:** Introduce a dedicated REST controller mapping `/timeline` that selectively fetches all `Projects` with an `external_deadline` and `Tasks` with a `deadline`, merging and sorting them chronologically.
- **Payload Strictness:** Return a unified JSON interface natively parsing entity type (`Task` vs `Project`), explicit UUIDs, and temporal offsets.

### US-6.2: Frontend Roadmap Visualization
**As a Technical Architect,** I want a dedicated visual "Timeline/Roadmap" board, **so that** I can intuitively conceptualize my impending deadlines (scadenzario) at a glance without reading isolated database tables.

**Technical Acceptance Criteria:**
- **UI Component Layer:** Build a `RoadmapView` interface plotting impending deadlines chronologically.
- **Glassmorphism Metrics:** Incorporate visual countdown heuristics (e.g., "Due in 3 Days") dynamically color-coded targeting `at_risk` variables gracefully natively within React.

---

## 7. OS Constraints & Day Templates

### US-7.1: Imposing Hard Capacity Envelopes
**As a Technical Architect,** I need structural limitations placed on my output generation (e.g., maximum 40 hours of work, 48 hours combined with strategic hobbies), **so that** the AI natively forces me to retain unstructured, "empty" time for recovery.

**Technical Acceptance Criteria:**
- Mint an `OsSettings` persistent singleton in the database tracking `max_weekly_work_hours` and `max_weekly_combined_hours`.
- Both `daily_planner` and `weekly_planner` LLM agents must be directly injected with these bounds as explicit context enforcing mathematically blocked time.

### US-7.2: Daily Rhythm Templates
**As a Technical Architect,** I want to define architectural rhythm "Templates" for specific days (e.g., "Deep Work Tuesday", "Managerial Wednesday"), **so that** the execution planner aligns generated timelines explicitly matching my cognitive mapping.

**Technical Acceptance Criteria:**
- Expose a `DayTemplate` capability allowing dynamic mapping of a `day_of_week` to a semantic `template_type`.
- Expose a `SettingsView` interface allowing easy UI toggling of these capacity limits and daily rhythm configurations.

---

## 8. Persona Organizational Scopes

### US-8.1: Naming & Grouping by Company Scope
**As a Technical Architect dealing with multi-vendor environments,** I need to group my Teammate Personas by their physical organization or vendor (e.g., "Avanade", "Microsoft"), **so that** the Delegation Engine can optimize for cross-organizational firewalls visually.

**Technical Acceptance Criteria:**
- Inject a `company: str` property structurally on the `Stakeholder` (Persona) entity, defaulting natively to "Avanade".
- Map the UI `PersonasView` dashboard rendering organizational group headers seamlessly, explicitly grouping Personas under parent Corporate structures.

---

## 9. Execution Context Overrides 

### US-9.1: Overriding Blueprint Defaults for Real-World Volatility
**As a Technical Architect dealing with dynamic real-world schedules,** I need to decouple my "Standard Week Blueprint" from my "Actual Week Execution", **so that** I can dynamically override limits (e.g., PTO, conferences) strictly for an incoming week without poisoning the core database settings.

**Technical Acceptance Criteria:**
- **API Payload Expansion:** Refactor `POST /ai/weekly-planner` to accept an optional JSON Body mimicking `OsSettings` DTO objects.
- **Agent Interception:** The Python Orchestrator must intercept the incoming payload and override the DB fetched singletons locally during execution context resolving.
- **Frontend Override Dashboard:** Upgrade `WeeklyHorizonView` to expose an editing matrix immediately prior to LLM submission, pre-filled natively from the Blueprint defaults.

---

## 10. Mid-Term Quarter Horizons & Day Templates UX

### US-10.1: Native Datalist Dropdowns for Day Templates
**As an Architect,** I need dropdowns for Day Templates that never block me from defining custom strings, **so that** I don't lose the canonical definitions but can scale infinitely without hardcoded Enums.

**Technical Acceptance Criteria:**
- Refactor `SettingsView` and `WeeklyHorizonView` inputs, binding them natively to a `<datalist>` constant array containing standard templates (e.g., "Deep Work", "Offline").

### US-10.2: Medium-Term Quarterly Planner
**As a Technical Architect,** I need a mechanism spanning 1 to 6 months cleanly, **so that** I map broad strategic Projects and OKRs over a Mid-Term temporal boundary separate from my micro Weekly boundaries.

**Technical Acceptance Criteria:**
- **Quarterly Agent (AI):** Construct `POST /ai/quarterly-roadmap` analyzing `Project` entities against their 30-180 days `external_deadline` emitting a sequential risk matrix.
- **Quarterly View (UI):** Build a `MidTermHorizonView` plotting macro-projects on a month-to-month grid visually projecting delivery capabilities safely natively.

---

## 11. Project Lifecycle Management

### US-11.1: Project Matrix View
**As a Technical Architect,** I need a dedicated dashboard listing all tracked Project Epics, **so that** I can see health status and deadlines at a glance without navigating to the Global Roadmap.

**Technical Acceptance Criteria:**
- Build `ProjectsView` React component rendering a card grid of `Project` entities fetched from `GET /projects/`.
- Each card must display the project name, color-coded `health_status` badge (On Track / At Risk / Off Track), and `external_deadline`.

### US-11.2: Inline Project Editing
**As a Technical Architect,** I need to edit an existing project's name, deadline, and health status directly from the Project Matrix, **so that** I can update lifecycle state without deleting and re-creating the entity.

**Technical Acceptance Criteria:**
- Each project card exposes an inline ✏️ edit trigger opening an `EditProjectModal` pre-filled with current values.
- The modal dispatches `PATCH /projects/{id}` and refreshes the cache via TanStack Query invalidation.

---

## 12. Personal Knowledge Base

### US-12.1: Structured Knowledge Capture
**As a Technical Architect,** I want to store personal engineering notes, learnings, and architectural references directly in my AI-OS, **so that** this institutional knowledge is queryable and doesn't get lost across Notion pages or browser bookmarks.

**Technical Acceptance Criteria:**
- Add `KnowledgeEntry` DB entity: title, content, tags (comma-separated), optional source URL.
- Expose full CRUD REST API: `GET/POST/PATCH/DELETE /api/v1/kb/` with optional `?search=` and `?tag=` query filters.
- Build `KnowledgeBaseView` React component: entry cards with inline edit/delete, fulltext search input, tag pill filter bar.

### US-12.2: AI-Powered Semantic Search over KB
**As a Technical Architect,** I need to ask natural-language questions against my Knowledge Base, **so that** the AI synthesizes an answer from my own documented knowledge rather than hallucinating from general training data.

**Technical Acceptance Criteria:**
- Implement `POST /ai/ask-kb` endpoint backed by a PydanticAI `kb_agent` that injects all KB entries as context.
- The agent must ground its answer strictly inside the provided KB content and cite the relevant entry titles as sources.
- The `KnowledgeBaseView` must expose an "Ask AI" panel at the top, rendering the answer and cited sources inline.
- Wire the existing Command Bar shortcut "Search Knowledge Base (RAG)" to navigate directly to the KB view.

---
 
 ## 13. Subtasks & Hierarchical Management
 
 ### US-13.1: Hierarchical Task Decomposition
 **As a Technical Architect,** I want to decompose a complex Atomic Task into smaller Subtasks, **so that** I can track incremental progress towards a larger objective without polluting the top-level Project/Epic context.
 
 **Technical Acceptance Criteria:**
 - **The SQLModel Database schema** must introduce a self-referencing `parent_id` foreign key on the `Task` model.
 - **The API** (`GET /tasks`) must support filtering by `parent_id` to enable granular hierarchical retrieval.
 - **The UI** must allow triggering subtask creation directly from a parent `TaskCard`, automatically inheriting the `project_id` and `milestone_id` and pre-filling the `parent_id`.
 - **Visualization:** Subtasks must be rendered indented or nested within the parent unit in the `ProjectDetailView` to preserve context.
---
 
 ## 14. Strategic AI Chat & Command Interface
 
 ### US-14.1: Data-Grounded Strategic Guidance
 **As a Technical Architect,** I want an interactive chat interface that leverages my entire OS data model as reasoning context, **so that** I can receive high-level strategic guidance and mission-critical planning support.
 
 **Technical Acceptance Criteria:**
 - **The Backend** must implement a `StrategicAdvisorAgent` using `PydanticAI` with functional tools to query projects, tasks, and stakeholders.
 - **The Agent** must support multi-turn history for iterative planning.
 - **Plan Proposing:** The AI must be capable of outputting a structured `proposed_plan` containing specific CRUD actions (Create Task, Create Project).
 - **The UI** must render proposed actions as discrete, interactive cards with **"Execute"** triggers that dispatch mutations directly.
 - **Robustness:** The system must gracefully handle AI provider rate limits (HTTP 429), providing natural-language recovery instructions to the user.
