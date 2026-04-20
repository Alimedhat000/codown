# Codown Server Documentation

## Overview

The Codown server is an Express.js application providing REST API endpoints for document management and a Hocuspocus WebSocket server for real-time collaboration.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Express.js |
| WebSocket | Hocuspocus |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod |
| Logging | Winston |
| API Docs | Swagger UI |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database

### Installation
```bash
cd server
pnpm install
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/codown"

# JWT Secrets (generate strong random strings)
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Server
PORT=3000
WS_PORT=4000
NODE_ENV=development
```

### Development
```bash
pnpm dev
```

Runs REST API at `http://localhost:3000`

### WebSocket Server
```bash
pnpm ws:dev
```

Runs WebSocket at `ws://localhost:4000`

### Build
```bash
pnpm build
```

### Prisma Commands

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Open Prisma Studio
pnpm prisma studio

# Reset database
pnpm prisma db push --force-reset
```

## Project Structure

```
server/
├── src/
│   ├── config/              # Configuration
│   │   ├── env.config.ts   # Env validation
│   │   └── swagger.ts      # Swagger setup
│   ├── controllers/        # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── document.controller.ts
│   │   └── user.controller.ts
│   ├── exceptions/         # Custom errors
│   │   ├── AppError.ts
│   │   ├── BadRequestError.ts
│   │   ├── ForbiddenError.ts
│   │   ├── NotFoundError.ts
│   │   └── UnauthorizedError.ts
│   ├── lib/               # Core utilities
│   │   ├── dbPersistence.ts
│   │   ├── logger.ts
│   │   ├── prisma.ts
│   │   └── shareToken.ts
│   ├── middlewares/        # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logging.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routers/           # Route definitions
│   │   ├── auth.router.ts
│   │   ├── document.router.ts
│   │   ├── index.ts
│   │   └── user.router.ts
│   ├── sockets/           # WebSocket server
│   │   └── ws-server.ts
│   ├── validations/       # Zod schemas
│   │   ├── login.schema.ts
│   │   └── register.schema.ts
│   ├── server.ts          # Express entry
│   └── utils/             # Utilities
│       ├── getClientInfo.ts
│       └── slugIDtoFullID.ts
├── prisma/
│   └── schema.prisma      # Database schema
└── package.json
```

## API Documentation

### Swagger UI

Interactive API documentation available at:

```
http://localhost:3000/api-docs
```

### Base URL

```
http://localhost:3000
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/documents` | List documents |
| GET | `/documents/:id` | Get document |
| POST | `/documents` | Create document |
| PUT | `/documents/:id` | Update document |
| DELETE | `/documents/:id` | Delete document |
| GET | `/users/me` | Get current user |

## Related Documentation

- [Architecture](architecture.md)
- [API](api.md)
- [WebSockets](websockets.md)
- [Database](database.md)
- [Middleware](middleware.md)
- [Auth Flow](auth-flow.md)