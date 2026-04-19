# Glossary & Domain Language

This document establishes the ubiquitous language of the domain to ensure absolute consistency across GenAI prompts, business logic implementations, and the database schema.

## 1. Work Entities
- **Atomic Task:** The minimal, indivisible unit of work completable by a single individual (e.g., "Write the unit test for endpoint X").
- **Shadow Task:** An activity where the user is not the material executor, but operates as the responsible party, reviewer, or supervisor (e.g., "The Team must finish the refactoring"). The user strictly tracks and monitors its status.
- **Gap Filler:** The heuristic process by which the GenAI autonomously deconstructs a vague, high-level, or complex objective into a concrete, executable list of Atomic Tasks.
- **Epic/Project:** A logical bounding container grouping correlated tasks, possessing a macroscopic deadline and a well-defined deliverable business objective.

## 2. Scheduling Concepts (Time Management)
- **Deep Work Slot:** Dedicated, uninterrupted time blocks (minimum duration: 90 minutes) entirely devoid of meetings, fiercely reserved for activities demanding high cognitive intensity (technical design, architecture analysis).
- **Buffer Time:** Built-in temporal margins acting as shock absorbers between tasks or meetings to manage the unexpected and mitigate context-switching fatigue.
- **Critical Path:** The specific sequence of dependent tasks (whether user-assigned or team-assigned) which, if delayed, will directly shift and jeopardize the final delivery date of the entire project.

## 3. Workflow States & Dependencies
- **Blocked:** The state of a task that physically cannot progress until an active external event or prerequisite task resolves.
- **Waiting For:** A specific sub-state of `Blocked` strictly tied to a pending human output (e.g., "Waiting for architecture approval from Stakeholder X"). In the database, this is realized when `status` is `blocked` and `blocked_by_stakeholder_id` is conditionally populated.
- **Project Health:** A dynamically calculated scalar indicator (`on_track`, `at_risk`, `delayed`) derived geometrically from the proximity to external deadlines heavily weighted by the absolute volume of blocking constraints.

## 4. Knowledge Base & AI
- **Context Ingestion:** The infrastructural pipeline orchestrating the semantic parsing and loading of raw documents, emails, or markdown notes into the vector database to embed contextual intelligence.
- **RAG (Retrieval-Augmented Generation):** The precise architecture employed to enrich LLM response streams by jointly querying the deterministic relational task dataset and the vectorized technical documentation corpus.
- **Daily Briefing:** The synthesized AI-generated morning executive summary proactively illuminating team operational risks, mapping the critical path, and aggressively proposing an optimized daily agenda.
