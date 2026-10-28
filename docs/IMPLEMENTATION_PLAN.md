# OpportunityOS implementation plan

## Product direction

Build a focused workspace for discovering opportunities, preparing applications, and measuring developer growth. Every integration should preserve source links, retrieval timestamps, and a clear boundary between verified facts and AI suggestions.

## Delivery phases

### Phase 1 — Foundation (current)

- Establish the Vite + React + JavaScript application shell.
- Define feature boundaries for dashboard, opportunities, growth, calendar, and settings.
- Add shared data modules, responsive styling, and navigation.
- Enforce linting, tests, and production builds in CI.

### Phase 2 — Core opportunity workflow

- Add authentication and persistent profiles with Supabase.
- Model opportunities, saved items, applications, skills, and activity history.
- Add source adapters behind a server-side API boundary.
- Implement normalization, deduplication, freshness, and source attribution.

### Phase 3 — Application intelligence

- Add protected LLM endpoints for description parsing and resume matching.
- Store prompts, model output metadata, and user feedback without exposing secrets.
- Make every recommendation editable and explainable; never invent qualifications.

### Phase 4 — Growth and events

- Integrate the Streak project through a documented adapter boundary.
- Add coding activity, contests, hackathons, reminders, and calendar views.
- Add scheduled jobs for refreshes and streak-risk notifications.

### Phase 5 — Quality and release

- Add unit tests for data processing and integration tests for critical flows.
- Add accessibility checks, error monitoring, rate limits, and security review.
- Deploy the frontend from `dev` (beta verification) and `main` (production validation); deploy protected API and scheduled jobs separately.
- Use preview deployments for pull requests and require CI before merge.

## Engineering guardrails

- Keep API keys and service credentials server-side only.
- Prefer small feature modules over cross-cutting component imports.
- Treat external data as untrusted and validate it at the boundary.
- Record uncertainty instead of presenting missing data as fact.
- Keep pull requests small, reviewed, and linked to an issue.

## Definition of done

A feature is ready when its happy path and failure path are tested, types and lint pass, loading/empty/error states are visible, source attribution is preserved where applicable, and the feature is documented at its boundary.
