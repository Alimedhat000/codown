# Codown

Real-time collaborative Markdown editor. pnpm workspace monorepo: `client/` (React 19 + Vite 7, Tailwind 4, CodeMirror 6 + y-codemirror.next) and `server/` (Express + Hocuspocus WebSocket + Prisma/Postgres). Deeper docs live in `docs/client/` and `docs/server/` (some are stale on ports/env names).

## Commands

- `pnpm install` then `pnpm dev` — client (Vite, port 5173) + server in parallel. Per-package: `pnpm --filter client|server <script>`.
- `pnpm --filter server dev` runs nodemon on `dist/server.js` — it does **not** build first. Run `pnpm --filter server build` first; there is no local watch build (only the dev Docker compose uses esbuild `--watch`).
- `pnpm build` / `lint` / `typecheck` / `test` at root run both packages in parallel (npm-run-all). CI order is lint → typecheck → build → test.
- Root `format` only runs `server lint:fix` — it does not touch the client.
- `pnpm --filter client generate` = plop, scaffolds components under `client/generators/`.
- Client build is `tsc -b && vite build`; server build is a single esbuild ESM bundle → `dist/server.js`.

## Environment variables (biggest gotcha area)

- Server validates env at startup via zod (`server/src/config/env.config.ts`) and throws if any of `PORT`, `NODE_ENV`, `POSTGRES_USER/PASSWORD/DB/PORT`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` is missing. It loads `server/.env` relative to cwd (pnpm runs scripts from the package dir, so that works).
- Client env is read by Vite from `VITE_APP_*` vars (see `client/src/config/env.ts`, zod-validated). Required: `VITE_APP_API_URL` (no `/api` suffix — `lib/api.ts` appends it) and `VITE_APP_SOCKET_URL` (`ws://host:port/collaboration`).
- Root `.env.example` uses `VITE_API_URL`/`VITE_WS_URL` — those are **only** consumed by docker-compose, which remaps them into `VITE_APP_*`. Do not copy root `.env.example` into `client/`.
- Each package keeps its own `.env` (`server/.env`, `client/.env`); CI copies `.env.example` into each. `client/.env` currently uses the misspelled `VITE_APP_Socket_URL` — it works only via a fallback rename in `env.ts`.

## Tests

- Only the server has a real test suite: `pnpm --filter server test` (vitest, serial, `fileParallelism: false`).
- Server tests **require a running Postgres**. `test/setup.ts` runs `prisma db push --force-reset` against `TEST_DATABASE_URL` (falls back to `DATABASE_URL`) on every run and truncates all tables after each test — destructive to the configured DB.
- Client vitest is wired only to Storybook browser tests (`@storybook/addon-vitest`, headless chromium via Playwright). There is no client `test` script; `client/src/lib/__tests__/api.test.tsx` is not attached to any runner.
- Pre-commit: husky + lint-staged run eslint `--fix` on staged files; `lint:ci` uses `--max-warnings 0`.

## Architecture & conventions

- Client layering is enforced by ESLint `import/no-restricted-paths`: `app/` → `features/` → shared. Features cannot import `app/` or sibling features; shared dirs (`components`, `hooks`, `lib`, `types`, `utils`) cannot import `features/` or `app/`.
- Import ordering: client uses `import/order` (alphabetized, blank line between groups); server uses `simple-import-sort`. `@/` aliases `src/` in both packages.
- Server is MVC-ish: `routers/` → `controllers/` → Prisma; errors come from `server/src/exceptions/`; Zod schemas in `validations/`; Swagger UI at `/api-docs`.
- Hocuspocus WS is mounted at `/collaboration` on the same Express app and port (`server.ts` calls `app.ws('/collaboration', ...)`) — no separate WS port. Yjs state persistence is `server/src/lib/dbPersistence.ts` (`@hocuspocus/extension-database`).
- Schema lives in `server/prisma/schema.prisma` (Prisma 6). Use `db:migrate` (dev, creates migrations) / `db:migrate:prod` (deploy); CI runs `db:migrate:prod`.

## Docker

- `docker-compose.dev.yml`: full dev stack with hot reload (server: esbuild watch + nodemon; client: Vite HMR with src mounted). Prisma Studio is opt-in via `docker compose --profile tools up` (port 5555).
- `docker-compose.yml`: production multi-stage build; client served by nginx (port 80, override with `CLIENT_PORT`); server healthcheck on `/health`; fails fast if `POSTGRES_PASSWORD` or JWT secrets are unset.
