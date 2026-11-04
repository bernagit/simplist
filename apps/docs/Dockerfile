# ============================================
# Stage 1: build the static site
# ============================================
# apps/docs is a standalone Yarn project (own yarn.lock), not a root workspace.
ARG NODE_VERSION=24-slim

FROM node:${NODE_VERSION} AS builder

# Same layout as the repository: the build reads ../app/CHANGELOG.md (scripts/sync-changelog.mjs)
WORKDIR /repo/apps/docs

RUN corepack enable

# Root .yarnrc.yml: same nodeLinker as the rest of the repo
COPY .yarnrc.yml ./
COPY apps/docs/package.json apps/docs/yarn.lock ./

RUN yarn install --immutable

COPY apps/docs/ ./
COPY apps/app/CHANGELOG.md ../app/CHANGELOG.md

RUN yarn build

# ============================================
# Stage 2: serve it with nginx
# ============================================
FROM nginx:1.27-alpine

COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/docs/dist /usr/share/nginx/html

EXPOSE 80
