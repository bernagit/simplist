<p align="center">
  <picture>
    <img src="./.github/assets/favicon.svg" alt="Header banner" width="96">
  </picture>
</p>
<h1 align="center">
Simplist - Keep your lists together
</h1>
<p align="center">
  A minimal, self-hostable list & task manager built as a Yarn monorepo with Next.js and Express.
</p>
<p align="center">
  <a href="https://github.com/bernagit/simplist/stargazers"><img src="https://img.shields.io/github/stars/bernagit/simplist?style=flat-square" alt="Stars"></a>
  <a href="https://github.com/bernagit/simplist/issues"><img src="https://img.shields.io/github/issues/bernagit/simplist?style=flat-square" alt="Issues"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/bernagit/simplist?style=flat-square" alt="License"></a>
  <a href="https://github.com/bernagit/simplist/actions"><img src="https://img.shields.io/github/actions/workflow/status/bernagit/simplist/ci.yml?style=flat-square" alt="Build status"></a>
</p>

## Introduction

**Simplist** is a lightweight, no-nonsense list and task manager. It's built around a simple idea: your lists, sections, and tasks should stay organized without getting in your way. No bloated project-management overhead — just lists you can share, plan, and check off.

Simplist is a full-stack TypeScript monorepo: a Next.js frontend, an Express + Drizzle ORM API, and a PostgreSQL database, all shipped as Docker images so you can run it on your own infrastructure.

## Features

- 📋 **Lists & Sections** — organize tasks into lists, grouped into sections
- ✅ **Tasks** — priorities, due dates, and quick inline add
- 📅 **Calendar view** — see everything due, at a glance
- 🔗 **Shareable lists** — share a list with others users
- ⌨️ **Keyboard-first** — a full set of hotkeys and a command spotlight for fast navigation
- 🎨 **Appearance settings** — theme and general preferences per user
- 🔐 **Authentication** — email/password auth with JWT sessions
- 📱 **PWA support** — installable on every device
- 🐳 **Docker-first** — ships with `Dockerfile`s and a `docker-compose.yaml` for easy self-hosting

## Self Hosting

Simplist is designed to be self-hosted with Docker.

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- A PostgreSQL database (or use the one provided in `docker-compose.yaml`)

### Quick start

```bash
git clone https://github.com/bernagit/simplist.git
cd simplist
cp apps/api/.env.example apps/api/.env
cp apps/app/.env.example apps/app/.env
docker compose up -d
```

The app will be available at `http://localhost:3000` (frontend) and the API at `http://localhost:4000` (adjust ports as configured in `docker-compose.yaml`).

### Manual / local development

```bash
yarn install
yarn workspace api dev
yarn workspace app dev
```

> See [`apps/api`](./apps/api) and [`apps/app`](./apps/app) for service-specific configuration and environment variables.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on setting up your dev environment, coding conventions, and how to submit a pull request.

## License

This project is licensed under the [MIT License](./LICENSE).

## Credits

Built and maintained by [bernagit](https://github.com/bernagit).

## Acknowledgements

Thanks to the open-source projects that make Simplist possible — see the stack below.

### Stack

- **Frontend**
  - **[Next.js](https://nextjs.org/)**
  - **[Mantine](https://mantine.dev/)**

- **Backend**
  - **[Express](https://expressjs.com/)**
  - **[Drizzle ORM](https://orm.drizzle.team/)**

- **Documentation**
  - **TODO**

- **Project**
  - **Yarn monorepo**