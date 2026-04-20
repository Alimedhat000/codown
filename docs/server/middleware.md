# Server Middleware

## Overview

Express middleware handles cross-cutting concerns like authentication, validation, error handling, and logging.

## Middleware Files

Location: `server/src/middlewares/`

| Middleware | Purpose |
|-----------|---------|
| `auth.middleware.ts` | JWT authentication |
| `validation.middleware.ts` | Zod validation |
| `error.middleware.ts` | Error handling |
| `logging.middleware.ts` | Request logging |

---

## Authentication Middleware

Location: `src/middlewares/auth.middleware.ts`

### authenticate

Protects routes requiring authentication.

```typescript
import { authenticate } from '@/middlewares/auth.middleware';

router.get('/documents', authenticate, getDocuments);
```

**Implementation:**

```typescript
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 1. Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  // 2. Verify JWT
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as JwtPayload;
    req.user = { userId: decoded.userId, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

**Request Extension:**

```typescript
// src/@types/AuthenticatedRequest.d.ts
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}
```

---

### validateRefreshToken

Validates refresh token from cookie.

```typescript
import { validateRefreshToken } from '@/middlewares/auth.middleware';

router.post('/auth/refresh', validateRefreshToken, refreshToken);
```

**Implementation:**

```typescript
export const validateRefreshToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as JwtPayload;
    req.user = { userId: decoded.userId, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

---

## Validation Middleware

Location: `src/middlewares/validation.middleware.ts`

### validate

Zod schema validation.

```typescript
import { validate } from '@/middlewares/validation.middleware';
import { LoginSchema } from '@/validations/login.schema';

router.post('/auth/login', validate(LoginSchema), loginUser);
```

**Implementation:**

```typescript
export const validate = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    req.body = result.data;
    next();
  };
};
```

---

## Error Middleware

Location: `src/middlewares/error.middleware.ts`

### errorHandler

Centralized error handling.

```typescript
import { errorHandler } from '@/middlewares/error.middleware';

app.use(errorHandler);
```

**Implementation:**

```typescript
import { AppError } from '@/exceptions/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    logger.error('Prisma error', err);
    return res.status(400).json({ error: 'Database error' });
  }

  // JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Unexpected errors
  logger.error('Unexpected error', err);
  res.status(500).json({ error: 'Internal server error' });
};
```

---

## Logging Middleware

Location: `src/middlewares/logging.middleware.ts`

### requestLogger

Logs incoming requests.

```typescript
import { requestLogger } from '@/middlewares/logging.middleware';

app.use(requestLogger);
```

**Implementation:**

```typescript
import { logger } from '@/lib/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};
```

---

## Middleware Order

Middleware should be applied in this order:

```typescript
const app = express();

// 1. Body parsing
app.use(express.json());
app.use(cookieParser());

// 2. Logging
app.use(requestLogger);

// 3. Routes
app.use('/api', router);

// 4. Error handling
app.use(errorHandler);
```

---

## Custom Exceptions

The server uses custom error classes:

```typescript
// exceptions/AppError.ts
export class AppError extends Error {
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Usage
throw new NotFoundError('Document not found');
// Returns 404
```

| Exception | Status Code |
|-----------|-----------|
| BadRequestError | 400 |
| UnauthorizedError | 401 |
| ForbiddenError | 403 |
| NotFoundError | 404 |
| AppError | Custom |

---

## Related Documentation

- [Architecture](architecture.md) - Server structure
- [API](api.md) - Endpoints
- [Auth Flow](auth-flow.md) - Authentication details