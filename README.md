<p align="center">
  <picture>
    <img src="./.github/assets/favicon.svg" alt="Simplist logo" width="96">
  </picture>
</p>
<h1 align="center">
Simplist - Keep your lists together
</h1>
<p align="center">
  A minimal, self-hostable list & task manager that works just as well on your phone as on your desktop.
</p>
<p align="center">
  <a href="https://github.com/bernagit/simplist/stargazers"><img src="https://img.shields.io/github/stars/bernagit/simplist?style=flat-square" alt="Stars"></a>
  <a href="https://github.com/bernagit/simplist/issues"><img src="https://img.shields.io/github/issues/bernagit/simplist?style=flat-square" alt="Issues"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/bernagit/simplist?style=flat-square" alt="License"></a>
  <a href="https://github.com/bernagit/simplist/releases"><img src="https://img.shields.io/github/v/tag/bernagit/simplist?style=flat-square&label=version" alt="Version"></a>
</p>
<p align="center">
  <a href="https://docs.simplist.app.bernitec.it"><b>Documentation</b></a> ·
  <a href="https://docs.simplist.app.bernitec.it/en/self-hosting/docker/">Self-hosting guide</a> ·
  <a href="https://docs.simplist.app.bernitec.it/en/changelog/">Changelog</a>
</p>

## Introduction

**Simplist** is a lightweight, no-nonsense list and task manager. Your lists, sections and tasks stay organized without getting in your way: no project-management overhead, just lists you can share, plan and check off.

It's a full-stack TypeScript monorepo (Next.js frontend, Express + Drizzle API, PostgreSQL), shipped as Docker images so you can run it on your own server.

## Features

- 📋 **Lists & sections**: group tasks into sections, reorder them with drag and drop, archive lists you're done with
- ✅ **Tasks**: due date and time, duration, priority, and undo when you delete or complete one by mistake
- 🔁 **Repeating tasks**: every weekday, every N weeks, on chosen days, until a date or for a number of times
- 🔔 **Reminders**: push notifications before a task is due, on every device you turn them on
- 📅 **Calendar**: everything due at a glance, repeating tasks included
- 🔍 **Search**: find lists and tasks, also in lists shared with you
- 👥 **Sharing**: share a list as editor or viewer, by link or email invite, and leave lists shared with you
- 📱 **Installable app (PWA)**: designed for phones too, with full-screen windows, the back gesture and large touch targets
- ⌨️ **Keyboard-first**: hotkeys and a command spotlight on desktop
- 🌍 **English and Italian**, light and dark theme, and a guided tour for new users
- 🐳 **Self-hosted**: Docker images for the app, API and docs, behind a single nginx entry point

## Self-hosting

You need a server with Docker Compose and a domain with HTTPS. In short:

```bash
git clone --depth 1 https://github.com/bernagit/simplist.git
cd simplist

# Configuration: set at least VERSION, APP_URL, CORS_ORIGIN and POSTGRES_PASSWORD
cp docker/.env.example docker/.env

docker compose --env-file docker/.env \
  -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d
```

Simplist then answers on port `3000`: nginx routes `/api` to the API, the `docs.` subdomain to the documentation and everything else to the app. On first start the API creates the database tables and its secrets (session and push notification keys) in `keys/`: keep that folder in your backups. Put a reverse proxy with HTTPS in front of it, then open the registration link the API prints in its logs to create the first user.

The [self-hosting guide](https://docs.simplist.app.bernitec.it/en/self-hosting/docker/) covers every step in detail: email, closing the database port, Caddy/nginx examples, [configuration](https://docs.simplist.app.bernitec.it/en/self-hosting/configuration/), [updates and backups](https://docs.simplist.app.bernitec.it/en/self-hosting/maintenance/).

## Development

Requirements: Node.js 24, Yarn 4 (`corepack enable`) and Docker for the database.

```bash
yarn install

# Environment (session and push keys are created in keys/ on first start)
cp apps/api/.env.example apps/api/.env
cp apps/app/.env.example apps/app/.env

# PostgreSQL
docker compose --env-file apps/api/.env -f docker/docker-compose.yml up -d db

# API (http://localhost:2000) + app (http://localhost:3000)
yarn dev
```

The API applies the database migrations when it starts. Other useful scripts:

| Command | What it does |
|---|---|
| `yarn dev:https` | App over HTTPS on your LAN, to test the PWA and notifications on a phone (run `yarn dev:certs` once, needs [mkcert](https://github.com/FiloSottile/mkcert)) |
| `yarn dev:docs` | Documentation site (Astro Starlight) |
| `yarn lint` / `yarn format` | ESLint / Prettier |
| `yarn changeset` / `yarn release` | Describe a change / bump versions and changelogs |
| `yarn docker:build` | Build and run the whole stack from source |

### Project structure

```
apps/
  api/    Express + Drizzle ORM API (PostgreSQL)
  app/    Next.js + Mantine web app (PWA)
  docs/   Astro Starlight documentation (standalone project)
docker/   Compose files and the nginx entry point
scripts/  Dev certificates and Docker image release
```

## Contributing

Contributions are welcome! Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the dev setup, coding conventions, how releases and changelogs work, and how to open a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).

## Credits

Built and maintained by [bernagit](https://github.com/bernagit).

Thanks to the open-source projects that make Simplist possible, in particular [Next.js](https://nextjs.org/), [Mantine](https://mantine.dev/), [TanStack Query](https://tanstack.com/query), [Express](https://expressjs.com/), [Drizzle ORM](https://orm.drizzle.team/), [PostgreSQL](https://www.postgresql.org/), [Astro Starlight](https://starlight.astro.build/) and [Changesets](https://github.com/changesets/changesets).
