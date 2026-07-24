# ---------- Dependencies ----------
FROM node:24-alpine AS deps

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

COPY apps/api/package.json ./apps/api/package.json
COPY apps/app/package.json ./apps/app/package.json

RUN yarn install --immutable


# ---------- Build ----------
FROM deps AS builder

WORKDIR /app

COPY tsconfig.base.json ./
COPY apps ./apps

RUN yarn workspace api build


# ---------- Production dependencies ----------
FROM deps AS prod-deps

WORKDIR /app

RUN yarn workspaces focus api --production


# ---------- Runtime ----------
FROM node:24-alpine AS runtime

WORKDIR /app/apps/api

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules /app/node_modules

COPY --from=builder /app/apps/api/dist ./dist

COPY package.json /app/package.json
COPY apps/api/package.json ./package.json

# COPY migrations folder to the container
COPY apps/api/drizzle ./drizzle

COPY apps/api/scripts/healthcheck.mjs ./healthcheck.mjs

EXPOSE 2000

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
  CMD ["node", "healthcheck.mjs"]

CMD ["node", "dist/src/server.js"]