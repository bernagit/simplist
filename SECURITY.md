# Security Policy

## Supported Versions

Simplist is under active development. Security fixes are applied to the
latest release on `main`; there is currently no long-term support for older
versions.

| Version | Supported          |
| ------- | ------------------ |
| latest (`main`) | :white_check_mark: |
| older releases  | :x:                 |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue in Simplist (e.g. authentication bypass,
JWT/session handling flaws, SQL injection via Drizzle queries, XSS, exposed
secrets, or anything that could compromise user data), please report it
privately at **simplist@bernitec.it** with the following details:
  - Clear description of the vulnerability.
  - Steps or proof-of-concept to reproduce the vulnerability.
  - Potential impact or implications of the vulnerability.
  - The affected component (`apps/api` or `apps/app`) and version/commit

## What to Expect

- **Acknowledgement**: within 3 business days
- **Initial assessment**: within 7 business days, including severity and
  whether it's accepted
- **Fix & disclosure**: we aim to ship a fix as soon as reasonably possible;
  timing depends on severity and complexity. We'll coordinate with you on
  public disclosure timing and, if you'd like, credit you in the release notes

## Scope

In scope:
- `apps/api` — authentication, session/JWT handling, database access,
  input validation, mail sending
- `apps/app` — client-side handling of auth tokens, XSS, CSRF, PWA/service
  worker behavior

Out of scope:
- Vulnerabilities requiring physical access to a user's device
- Issues in third-party dependencies without a demonstrated exploit path
  specific to Simplist (please report these upstream as well)
- Denial-of-service via brute-force volume alone

## Self-Hosted Deployments

Since Simplist is self-hosted, deployment-specific issues (e.g. a
misconfigured reverse proxy, exposed database ports, or default/weak
`JWT_SECRET` values left unchanged from `.env.example`) are the operator's
responsibility. We'll still gladly take reports if you believe the defaults
or documentation lead operators into an insecure setup.

Thank you for helping keep Simplist and its users safe.