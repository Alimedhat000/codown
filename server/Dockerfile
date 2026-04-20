# ──────────────────────────────────────────────
# Stage 1: builder — full install + compile
# ──────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY server/ ./server/

RUN pnpm --filter server db:generate
RUN pnpm --filter server build

# ──────────────────────────────────────────────
# Stage 2: prod-deps — server-only production install
# ──────────────────────────────────────────────
FROM node:22-alpine AS prod-deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts --filter server

# Copy schema and use npx to run prisma generate without touching pnpm's
# module state (npx downloads prisma into a temp cache, separate from node_modules)
COPY server/prisma ./server/prisma
RUN npx --yes prisma@6.3.1 generate --schema=./server/prisma/schema.prisma

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

