# Contributing to OpportunityOS

## Development flow

1. Select or create an issue with a milestone, owner, and acceptance criteria.
2. Create a focused branch from `main`: `feat/<issue>-short-name`, `fix/<issue>-short-name`, or `chore/<issue>-short-name`.
3. Keep changes small, typed, tested, and documented at the boundary they change.
4. Open a pull request using the repository template and link the issue.
5. Address review feedback and merge only after required checks pass.

## Local quality gate

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Do not commit `node_modules`, build artifacts, credentials, or `.env` files. API keys must stay in server-side environments and GitHub Actions secrets.

## Review standard

Reviewers should verify behavior, failure states, accessibility, data-source attribution, security boundaries, tests, and operational impact. A feature is not complete when only the happy path works.
