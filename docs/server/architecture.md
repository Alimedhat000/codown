# Server Architecture

## Overview

The server follows a **MVC-inspired pattern** with clear separation of concerns:

- **Routes** (`/routers/`) - Define API endpoints
- **Controllers** (`/controllers/`) - Handle business logic
- **Models** (via Prisma) - Database interactions
- **Middleware** (`/middlewares/`) - Cross-cutting concerns
- **Exceptions** (`/exceptions/`) - Error handling

## Directory Structure

```
server/src/
├── config/                 # Configuration
│   ├── env.config.ts      # Environment variable validation
│   └── swagger.ts       # Swagger/OpenAPI setup
│
├── controllers/          # Business logic
│   ├── auth.controller.ts      # Auth handlers
│   ├── document.controller.ts # Document handlers
│   └── user.controller.ts     # User handlers
│
├── exceptions/         # Custom error classes
│   ├── AppError.ts         # Base error
│   ├── BadRequestError.ts  # 400 errors
│   ├── ForbiddenError.ts   # 403 errors
│   ├── NotFoundError.ts   # 404 errors
│   └── UnauthorizedError.ts # 401 errors
│
├── lib/              # Core utilities
│   ├── dbPersistence.ts   # Yjs persistence
│   ├── logger.ts        # Winston logger
│   ├── prisma.ts       # Prisma client
│   └── shareToken.ts   # Share token utils
│
├── middlewares/       # Express middleware
│   ├── auth.middleware.ts      # JWT auth
│   ├── error.middleware.ts    # Error handling
│   ├── logging.middleware.ts # Request logging
│   └── validation.middleware.ts # Zod validation
│
├── routers/          # Route definitions
│   ├── auth.router.ts
│   ├── document.router.ts
│   ├── index.ts      # Router aggregation
│   └── user.router.ts
│
├── sockets/         # WebSocket
│   └── ws-server.ts # Hocuspocus server
│
├── validations/     # Zod schemas
│   ├── login.schema.ts
│   └── register.schema.ts
│
├── utils/         # Utilities
│   ├── getClientInfo.ts  # Request info
│   └── slugIDtoFullID.ts
│
└── server.ts     # Express entry
```

## Request Flow

```
┌──────────────┐
│   Request    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Router     │  <- Maps URL to controller
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Middleware  │  <- Validation, Auth, Logging
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Controller  │  <- Business logic
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Prisma     │  <- Database
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Response   │
└──────────────┘
```

## Routes

Routes are defined in individual router files and aggregated in `routers/index.ts`:

```typescript
// routers/auth.router.ts
export const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', authenticate, logoutUser);
authRouter.post('/refresh', validateRefreshToken, refreshToken);
```

```typescript
// routers/index.ts
export const router = Router();

router.use('/auth', authRouter);
router.use('/documents', documentRouter);
router.use('/users', userRouter);
```

## Controllers

Controllers contain the business logic:

```typescript
// controllers/auth.controller.ts
export const loginUser = async (req: Request, res: Response) => {
  // 1. Validate input
  const result = LoginSchema.safeParse(req.body);

  // 2. Find user
  const user = await prisma.user.findUnique({ where: { email } });

  // 3. Verify password
  const valid = await bcrypt.compare(password, user.password);

  // 4. Generate tokens
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '24h' });

  // 5. Set cookie
  res.cookie('refreshToken', refreshToken, { httpOnly: true });

  // 6. Return response
  res.json({ accessToken, user });
};
```

## Custom Exceptions

Custom exceptions for different HTTP error codes:

```typescript
// exceptions/NotFoundError.ts
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, StatusCodes.NOT_FOUND);
  }
}
```

## Middleware

### Authentication Middleware

Protects routes requiring authentication:

```typescript
// middlewares/auth.middleware.ts
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET);
  req.user = decoded;
  next();
};
```

### Error Middleware

Centralized error handling:

```typescript
// middlewares/error.middleware.ts
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  // Handle unexpected errors
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
```

## WebSocket Server

Separate WebSocket server for real-time collaboration:

```typescript
// sockets/ws-server.ts
const server = Server.configure({
  port: 4000,
  async onStoreDocument(data) {
    await db.save(data.documentName, data.document);
  },
});
```

## Logging

Winston logger for application logging:

```typescript
// lib/logger.ts
export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});
```

## Related Documentation

- [README](README.md) - Setup
- [API](api.md) - Endpoints
- [WebSockets](websockets.md) - Real-time
- [Database](database.md) - Schema
- [Middleware](middleware.md) - Middleware details