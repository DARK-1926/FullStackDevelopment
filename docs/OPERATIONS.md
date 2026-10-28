# Operations handbook

## Environments

- **Local:** `.env.local`, mock or development services, no production data.
- **Preview:** pull-request deployment with isolated configuration and safe test data.
- **Production:** protected environment, least-privilege secrets, monitoring, and an approved release.

## Release path

1. Open feature pull requests into `dev`.
2. Let `dev` CI and CodeQL validate the integration branch.
3. Open a reviewed promotion pull request from `dev` into `main`.
4. After the promotion merges, CI and CodeQL validate `main`.
5. The deployment workflow publishes the `main` artifact to GitHub Pages.
6. Verify the deployed URL, primary navigation, API/configuration health, and error boundaries.
7. Record release notes and any known limitations.

## Incident response

1. Confirm impact and protect users first; disable a failing integration if needed.
2. Capture the deployment SHA, affected route, error, time window, and relevant logs without secrets.
3. Roll back to the last known-good deployment or revert the change.
4. Open a follow-up issue with root cause, customer impact, and prevention work.

## Required production readiness

Before backend integrations ship, add health endpoints, structured logs, error tracking, rate limits, database backup/restore verification, data-retention rules, and documented secret rotation.
