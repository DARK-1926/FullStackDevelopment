# Architecture and repository map

## Current starter

The frontend is a Vite + React + TypeScript application. `src/app` composes the application, `src/features` owns product workflows, `src/shared` contains reusable UI and domain types, and `src/styles` owns global presentation. Temporary fixtures live in `src/shared/data` until API adapters are introduced.

```text
src/
  app/                 composition, navigation, providers
  features/            dashboard, opportunities, growth, calendar, settings
  shared/
    components/        reusable UI and application shell
    data/               fixtures and source adapters
    types/              domain and API contract types
  styles/              global tokens and responsive styles
docs/                  roadmap, architecture, operations
.github/               workflows, templates, ownership, dependency automation
```

## Target boundaries

```text
Browser UI
  -> typed API client
    -> server-side application API
      -> database/authentication
      -> source adapters
      -> AI provider gateway
      -> scheduled jobs and notifications
```

The browser must never hold provider secrets. External source data is untrusted until validated, normalized, deduplicated, timestamped, and attributed. AI output is a recommendation, not a source-backed fact.

## Change rules

- Keep feature-specific behavior inside its feature module.
- Promote code to `shared` only after a second real use case.
- Define API and database changes before implementing UI assumptions.
- Model loading, empty, error, stale, and permission states explicitly.
- Add telemetry and a rollback path before shipping scheduled jobs or external integrations.
