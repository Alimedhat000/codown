# Codown

**Codown** is a real-time collaborative Markdown editor inspired by HackMD and Notion.  
It’s a personal project to explore real-time synchronization using WebSockets and rich-text editing in the browser.

---

## Features

- Real-time collaborative editing (Yjs + Hocuspocus)
- Markdown syntax highlighting and preview
- React-based frontend with clean architecture
- PostgreSQL + Prisma for structured persistence

---

## Tech Stack

| Layer      | Technology                                                   |
|------------|--------------------------------------------------------------|
| Frontend   | [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) |
| Editor     | [CodeMirror](https://codemirror.net/) + [React Markdown](https://github.com/remarkjs/react-markdown) |
| Backend    | [Express](https://expressjs.com/)                            |
| Database   | [PostgreSQL](https://www.postgresql.org/) + [Prisma](https://www.prisma.io/) |
| Realtime   | [Yjs](https://yjs.dev/) + [Hocuspocus](https://docs.hocuspocus.dev/) |
| Package Manager | [pnpm](https://pnpm.io/)                                |

---

## Getting Started

### Option A — Docker dev stack (recommended)

Full stack with hot reload: Postgres + API (esbuild watch + nodemon) + Vite HMR, kept in sync by [compose watch](https://docs.docker.com/compose/file-watch/) — source edits sync into the containers live.

```bash
# first run (builds images)
pnpm docker:dev

# later runs (skip --build)
docker compose -f docker-compose.dev.yml up --watch

# stop
pnpm docker:down
```

- Client → http://localhost:5173
- API → http://localhost:5000 (`/health`, `/api/docs`)
- Prisma Studio (opt-in): `docker compose -f docker-compose.dev.yml --profile tools up studio` → http://localhost:5555

Dependency/lockfile/config changes trigger an automatic rebuild+restart via watch. After editing `server/prisma/schema.prisma`, run:

```bash
docker compose -f docker-compose.dev.yml exec server pnpm exec prisma migrate dev
```

### Option B — Local (hybrid)

Postgres in Docker, app on the host:

```bash
docker compose -f docker-compose.dev.yml up -d db    # DB only
cp server/.env.example server/.env                   # point DATABASE_URL creds at root .env values
cp client/.env.example client/.env
pnpm install
pnpm dev                                             # client + server (esbuild watch + nodemon) in parallel
```

### Production

```bash
docker compose up --build   # requires POSTGRES_PASSWORD + JWT secrets (see .env.example)
```

Env vars: per-package `.env.example` files for local dev; root `.env.example` feeds docker-compose.
## Roadmap
- ~~Polish The UI~~ (Done ＼(＾▽＾)／)
- ~~Document Sharing with User authorization~~ ヽ(*≧ω≦)ﾉ
- Export documents to PDF
- Version history and timeline
- Testing and Improving CI setup
- ~~Maybe Deployment~~ d=(´▽｀)=b

## Screenshots
To be added cuz im lazy (* ^ ω ^)



