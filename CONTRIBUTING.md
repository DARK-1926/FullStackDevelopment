# Contributing to OpportunityOS

## Development flow

1. Select or create an issue with a milestone, owner, and acceptance criteria.
2. Create a focused branch from `dev`: `feat/<issue>-short-name`, `fix/<issue>-short-name`, or `chore/<issue>-short-name`.
3. Open a pull request into `dev` for integration testing.
4. Keep changes small, tested, and documented at the boundary they change.
5. Promote a tested `dev` release to `main` through a reviewed release pull request.
6. Address review feedback and merge only after required checks pass.

## Branch environments

- `dev` is the integration/testing branch. Pushes run the full CI and CodeQL checks, but never deploy production.
- `main` is the production branch. Only reviewed changes promoted from `dev` should land here; pushes run CI, CodeQL, and production deployment.
- `dev` also runs the deploy workflow for beta branch verification before promotion to `main`.
- Feature branches should target `dev`, not `main`.

## Local quality gate

```bash
npm ci
npm run lint
npm test
npm run build
```

Do not commit `node_modules`, build artifacts, credentials, or `.env` files. API keys must stay in server-side environments and GitHub Actions secrets.

## Review standard

Reviewers should verify behavior, failure states, accessibility, data-source attribution, security boundaries, tests, and operational impact. A feature is not complete when only the happy path works.
