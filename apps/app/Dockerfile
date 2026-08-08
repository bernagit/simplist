# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================

ARG NODE_VERSION=24-slim

FROM node:${NODE_VERSION} AS deps

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./

COPY apps/api/package.json ./apps/api/package.json
COPY apps/app/package.json ./apps/app/package.json

RUN yarn install --immutable

# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================

FROM deps AS builder

# Set working directory
WORKDIR /app

# Copy project dependencies from dependencies stage
COPY --from=deps /app/node_modules ./node_modules

COPY tsconfig.base.json ./
COPY apps ./apps

ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn workspace app build
# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM node:${NODE_VERSION} AS runner

# Set working directory
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the run time.
ENV NEXT_TELEMETRY_DISABLED=1

# Copy production assets
COPY --from=builder --chown=node:node /app/apps/app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/apps/app/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/app/.next/static ./.next/static
COPY apps/app/CHANGELOG.md /app/CHANGELOG.md


RUN cp -a apps/app/. ./ \
 && rm -rf apps
# If you want to persist the fetch cache generated during the build so that
# cached responses are available immediately on startup, uncomment this line:
# COPY --from=builder --chown=node:node /app/apps/app/.next/cache ./.next/cache

# Switch to non-root user for security best practices
USER node

# Expose port 3000 to allow HTTP traffic
EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]