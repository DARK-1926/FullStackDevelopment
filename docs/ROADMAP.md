# OpportunityOS delivery roadmap

This roadmap consolidates the repository issues into an executable plan. Dates are the current milestone targets; scope should be re-estimated when dependencies or source access change.

## Milestone 1 — Foundation (target: 2026-10-29)

**Outcome:** a repeatable, reviewable application baseline.

- #2/#3: audit the generated structure and verify the app locally
- #4: make CI/CD checks reliable and actionable
- #5: define API contracts and the database schema
- #6: complete the shared layout, navigation, and dashboard shell

**Exit criteria:** local setup works from a clean checkout, CI is green, architecture boundaries are documented, and the shell has loading/error/empty-state extension points.

## Milestone 2 — Core features (target: 2026-10-30)

**Outcome:** users can discover opportunities and manage applications.

- #7: opportunity listing, search, filters, and source attribution
- #8: opportunity and application-tracking API contracts
- #9: source adapter or reliable seed dataset with normalization
- #10: contests, hackathons, and developer-growth page
- #11: application tracking interface

**Exit criteria:** a user can search, inspect, save, and track an opportunity; stale or incomplete source data is clearly labeled.

## Milestone 3 — AI and integrations (target: 2026-11-02)

**Outcome:** protected, explainable assistance improves application preparation.

- #12: resume-to-JD matching and skill-gap analysis
- #13: editable AI-generated outreach drafts
- #14: connect the frontend to backend APIs
- #15: integrate Streak capabilities behind an adapter boundary
- #16: finish custom loading, error, and empty states

**Exit criteria:** secrets remain server-side, AI output is editable and traceable to user-provided evidence, integrations degrade gracefully, and critical paths are covered by tests.

## Milestone 4 — Release (target: 2026-11-04)

**Outcome:** a demo-ready, deployable, and documented product.

- #17: tests for critical application flows
- #18: critical bug and integration-failure fixes
- #19: production deployment and configuration verification
- #20: README, architecture diagram, and setup guide
- #21: demo, screenshots, and submission checklist

**Exit criteria:** CI is green, production configuration is verified, rollback/incident notes exist, the demo follows a rehearsed script, and known limitations are documented.

## Cross-cutting enterprise controls

- **Delivery:** protected `main`, required CI checks, CODEOWNERS review, small PRs, and Dependabot updates.
- **Quality:** lint, type safety, unit/integration tests, production build, dependency review, CodeQL, and explicit acceptance criteria.
- **Security:** private vulnerability reporting, secret hygiene, least privilege, input validation, and no client-side provider keys.
- **Operations:** environment-specific configuration, deployment health checks, source freshness, error monitoring, backups, and rollback instructions.
- **Product governance:** user consent for AI processing, explainable recommendations, accessibility, responsive UX, and privacy-aware data retention.

## Definition of done

A work item is complete only when its success and failure states are implemented, tests cover the risk, documentation is updated, the change is observable in the target environment, and reviewers can verify the acceptance criteria from the PR.
