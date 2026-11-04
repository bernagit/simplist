# Contributing to Simplist

Thanks for your interest in contributing! This document covers how the repo is organized and how to get a change merged.

## Project structure

Simplist is a Yarn workspace monorepo:

```
apps/
  api/   Express + Drizzle ORM backend
  app/   Next.js + Mantine frontend
```

## Getting started

1. Fork and clone the repo
   ```bash
   git clone https://github.com/<your-username>/simplist.git
   cd simplist
   ```
2. Install dependencies
   ```bash
   yarn install
   ```
3. Set up environment variables
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/app/.env.example apps/app/.env
   ```
4. Start Postgres on `localhost:5432` (or point `apps/api/.env` at your own instance)
   ```bash
   yarn dev:db
   ```
5. Start the dev servers (API on :2000, app on :3000). The API applies the migrations and
   creates its session and push keys in `keys/` on first start.
   ```bash
   yarn dev
   ```

## Branching & commits

- Branch off `main` using a descriptive name, e.g. `feat/list-sharing`, `fix/task-due-date`
- Keep commits focused; prefer [Conventional Commits](https://www.conventionalcommits.org/) style (`feat:`, `fix:`, `chore:`, `docs:`)

## Pull requests

- Keep PRs scoped to a single change
- Describe what changed and why in the PR description
- Link any related issue
- Make sure `yarn lint` and `yarn build` pass before requesting review

## Code style

- TypeScript everywhere; avoid `any` where possible
- Run `yarn lint` before committing
- Follow existing module structure in `apps/api/src/modules` (controller / repository / route / schema / service) when adding backend features

## Releases and changelogs

There are two changelogs, for two audiences:

- **`apps/app/CHANGELOG.md`** (and the identical `apps/api/CHANGELOG.md`): the complete, technical history, written by [changesets](https://github.com/changesets/changesets). Add a changeset with `yarn changeset` in every PR that changes behaviour; `yarn release` bumps the versions and writes the entries. The documentation publishes it as the **Changelog** page (`apps/docs/scripts/sync-changelog.mjs` copies it at build time).
- **`apps/app/release-notes.json`**: the short notes the app shows after an update and in Settings → Info, in Italian and English. Add an entry for the new version only when there is something users notice: a few lines, plain language, no technical details. A version without an entry shows nothing in the app.

```json
{
  "version": "0.7.3",
  "date": "2026-11-04",
  "notes": [{ "type": "new", "it": "…", "en": "…" }]
}
```

`type` is `new`, `improved` or `fixed`. Entries are newest first.

## Reporting bugs / requesting features

Please open a GitHub issue with:
- A clear description of the problem or request
- Steps to reproduce (for bugs)
- Screenshots, if relevant

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).