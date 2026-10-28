# Security policy

## Reporting a vulnerability

Please use [GitHub private vulnerability reporting](https://github.com/DARK-1926/FullStackDevelopment/security/advisories/new). Do not open a public issue for credentials, personal data, exploit details, or other sensitive material.

Include affected versions or commits, reproduction steps, impact, and a suggested mitigation when safe to do so.

## Engineering controls

- Keep secrets server-side and use least-privilege tokens.
- Validate all external data at integration boundaries.
- Do not send resumes or personal information to an AI provider without explicit user consent.
- Preserve source attribution and avoid presenting generated content as verified fact.
- Dependency review, CodeQL, linting, type checking, tests, and production builds run in CI.
