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
