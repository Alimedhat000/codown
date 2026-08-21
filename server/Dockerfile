# ──────────────────────────────────────────────
# Stage 1: builder — full install + compile
# ──────────────────────────────────────────────
FROM node:22-alpine AS builder

# Pin pnpm to match the repo's packageManager field (layer-cached, no corepack indirection)
ARG PNPM_VERSION=11.1.1
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Cache mount: repeat builds reuse the store instead of re-downloading 1200+ packages
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

COPY server/ ./server/

RUN pnpm --filter server db:generate
RUN pnpm --filter server build

# ──────────────────────────────────────────────
# Stage 2: prod-deps — server-only production install
# ──────────────────────────────────────────────
FROM node:22-alpine AS prod-deps

ARG PNPM_VERSION=11.1.1
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --ignore-scripts --filter server

# Copy schema and use npx to run prisma generate without touching pnpm's
# module state (prisma CLI is a devDependency, absent from this prod install;
# npx downloads it into a temp cache, separate from node_modules).
# Pinned to the lockfile's prisma version.
COPY server/prisma ./server/prisma
RUN --mount=type=cache,id=npm-npx,target=/root/.npm \
    npx --yes prisma@6.12.0 generate --schema=./server/prisma/schema.prisma

# ──────────────────────────────────────────────
# Stage 3: runner — final lean image
# ──────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

COPY package.json pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/server/node_modules ./server/node_modules

COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/prisma ./server/prisma

COPY server/swagger.yaml ./server/swagger.yaml
COPY server/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

WORKDIR /app/server

EXPOSE 5000

ENTRYPOINT ["/app/docker-entrypoint.sh"]

