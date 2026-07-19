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
4. Start Postgres (or point `.env` at your own instance)
   ```bash
   docker compose up -d db
   ```
5. Run migrations
   ```bash
   yarn workspace api db:migrate
   ```
6. Start the dev servers
   ```bash
   yarn workspace api dev
   yarn workspace app dev
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

## Reporting bugs / requesting features

Please open a GitHub issue with:
- A clear description of the problem or request
- Steps to reproduce (for bugs)
- Screenshots, if relevant

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).