# Codown - Collaborative Markdown Editor

## Project Overview

Codown is a real-time collaborative Markdown editor inspired by HackMD and Notion. It enables multiple users to edit documents simultaneously with live synchronization, Markdown preview, and document sharing capabilities.

## Tech Stack

### Frontend (Client)
- **Framework:** React 19 + Vite 7
- **Routing:** React Router 7
- **Editor:** CodeMirror 6 with y-codemirror.next
- **Real-time Sync:** Yjs + Hocuspocus Provider
- **UI Components:** Radix UI + Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **State:** React Context

### Backend (Server)
- **Framework:** Express + Hocuspocus (WebSocket)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (access + refresh tokens) + Bcrypt
- **Validation:** Zod
- **Logging:** Winston
- **API Docs:** Swagger UI

## Monorepo Structure

```
codown/
├── client/                 # React frontend
├── server/                 # Express backend
├── docs/                  # Documentation
├── package.json           # pnpm workspace root
└── pnpm-workspace.yaml   # Workspace config
```

## Key Files

### Client
- `client/src/main.tsx` - Entry point
- `client/src/app/router.tsx` - Routes configuration
- `client/src/context/auth/AuthProvider.tsx` - Authentication provider
- `client/src/features/DocumentPage/` - Document editor feature
- `client/src/lib/api.ts` - Axios API client

### Server
- `server/src/server.ts` - Express server entry
- `server/src/sockets/ws-server.ts` - WebSocket server (Hocuspocus)
- `server/src/controllers/` - Route controllers
- `server/src/routers/` - Express routers
- `server/src/middlewares/auth.middleware.ts` - JWT authentication
- `server/prisma/schema.prisma` - Database schema

## Running the Application

### Development
```bash
# All services (client + server)
pnpm dev

# Client only
cd client && pnpm dev

# Server only
cd server && pnpm dev
```

### Build
```bash
pnpm build
```

### Database
```bash
# Generate Prisma client
cd server && pnpm prisma generate

# Push schema to database
cd server && pnpm prisma db push

# Open Prisma Studio
cd server && pnpm prisma studio
```

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:4000
```

### Server (.env)
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
PORT=3000
WS_PORT=4000
```

## Important Patterns

1. **Feature-based organization** - Client code is organized by feature (DocumentPage, Dashboard)
2. **MVC on server** - Controllers handle logic, routers define routes, models via Prisma
3. **Real-time collaboration** - Yjs document state synced via Hocuspocus WebSocket
4. **Token-based auth** - Access token (15min) + refresh token (24h) with httpOnly cookies

## API Documentation

- Swagger UI: `http://localhost:3000/api-docs`
- Client API: See `/docs/client/api-client.md`
- Server API: See `/docs/server/api.md`