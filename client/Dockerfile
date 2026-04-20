# ──────────────────────────────────────────────
# Stage 1: deps — install all workspace deps
# ──────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/
COPY server/package.json ./server/

# --ignore-scripts prevents husky from running and failing
RUN pnpm install --frozen-lockfile --ignore-scripts

# ──────────────────────────────────────────────
# Stage 2: builder — vite build
# ──────────────────────────────────────────────
FROM deps AS builder

WORKDIR /app

COPY client/ ./client/

# Build args injected at build time → baked into the JS bundle as VITE_ env vars
ARG VITE_APP_API_URL
ARG VITE_APP_SOCKET_URL
ENV VITE_APP_API_URL=$VITE_APP_API_URL
ENV VITE_APP_SOCKET_URL=$VITE_APP_SOCKET_URL

# NODE_ENV=production tells Storybook's Vite plugin to skip its dev-only setup
ENV NODE_ENV=production

RUN pnpm --filter client build

# ──────────────────────────────────────────────
# Stage 3: Nginx static server
# ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf

COPY client/nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

