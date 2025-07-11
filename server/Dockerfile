ARG NODE_VERSION=22.6.0
ARG PNPM_VERSION=9.7.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

EXPOSE ${PORT}

RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

################################################################################
FROM base AS prod-deps


RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --ignore-scripts --frozen-lockfile

################################################################################
FROM prod-deps AS all-deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

################################################################################
FROM base AS development

COPY . .

COPY --from=all-deps /usr/src/app/node_modules ./node_modules
RUN mkdir -p dist && touch dist/server.js

RUN pnpm prisma generate

CMD pnpm dev

################################################################################
FROM base AS build

COPY . .

COPY --from=all-deps /usr/src/app/node_modules ./node_modules

RUN pnpm build

################################################################################
FROM base AS production

COPY package.json .
COPY prisma .

COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

RUN pnpx prisma generate

RUN rm -rf prisma

USER node

CMD pnpm start
