# Server Authentication Flow

## Overview

The server implements a complete JWT-based authentication system with access tokens (short-lived) and refresh tokens (long-lived). This document covers server-side implementation.

## Token Strategy

| Token | Expiry | Storage | Purpose |
|-------|-------|--------|---------|
| Access | 15 minutes | Response body | API authorization |
| Refresh | 24 hours | httpOnly cookie | Session persistence |

```
┌─────────────────────────────────────────────────────────────┐
│                    Token Flow                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐    POST /login     ┌─────────┐                │
│  │ Client │ ───────────────► │ Server │                 │
│  └─────────┘                 └─────────┘                │
│       │                         │                          │
│       │              ┌─────────▼─────────┐                 │
│       │              │ 1. Validate    │                 │
│       │              │ 2. Check DB   │                 │
│       │              │ 3. Generate  │                 │
│       │              │    tokens     │                 │
│       │              └─────────┬─────┘                 │
│       │                        │                        │
│       │    accessToken       │  httpOnly cookie           │
│       │    (response)      │  (refreshToken)          │
│       ◄───────────────────┴─────────────────►              │
│                                                             │
│         API Requests + Bearer token                         │
│       ◄──────────────────────────────────►                │
│                                                             │
│         On 401 (token expired):                          │
│            POST /auth/refresh                          │
│       ◄──────────────────────────────────►                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Registration

### Validation Schema

Location: `src/validations/register.schema.ts`

```typescript
import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  fullName: z.string().optional(),
});
```

### Registration Controller

Location: `src/controllers/auth.controller.ts`

```typescript
export const registerUser = async (req: Request, res: Response) => {
  // 1. Validate request body
  const result = RegisterUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const { email, username, password, fullName } = result.data;

  // 2. Check if user exists
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  // 3. Hash password
  const hashed = await bcrypt.hash(password, 10);

  // 4. Create user
  const user = await prisma.user.create({
    data: { email, username, password: hashed, fullName },
  });

  // 5. Return response
  res.status(201).json({ message: 'User Created' });
};
```

## Login

### Validation Schema

Location: `src/validations/login.schema.ts`

```typescript
import { z } from 'zod';

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

### Login Controller

```typescript
export const loginUser = async (req: Request, res: Response) => {
  // 1. Validate input
  const result = LoginUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  const { email, password } = result.data;

  // 2. Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 3. Verify password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 4. Generate access token (15 min)
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  // 5. Generate refresh token (24h)
  const refreshToken = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '24h' }
  );

  // 6. Store refresh token in DB
  await prisma.user.update({
    where: { email },
    data: { refreshToken },
  });

  // 7. Set refresh token cookie (httpOnly)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none',
    secure: true,
  });

  // 8. Return response
  res.json({
    accessToken,
    user: { id: user.id, email: user.email, username: user.username },
  });
};
```

## Logout

```typescript
export const logoutUser = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 1. Clear refresh token from DB
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  // 2. Clear cookie
  res.clearCookie('refreshToken');

  res.json({ message: 'Logged out successfully' });
};
```

## Token Refresh

```typescript
export const refreshToken = async (req: AuthenticatedRequest, res: Response) => {
  // 1. Validate refresh token cookie (via middleware)
  const refreshToken = req.cookies.refreshToken;

  // 2. Verify token
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  // 3. Check DB matches
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  // 4. Generate new access token
  const newAccessToken = jwt.sign(
    { userId: user.id, username: user.username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  // 5. Set new access token cookie
  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000,
    sameSite: 'none',
    secure: true,
  });

  // 6. Return response
  res.json({
    accessToken: newAccessToken,
    user: { id: user.id, email: user.email, username: user.username },
  });
};
```

## JWT Secrets

```env
# .env
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
```

## Password Security

- **Bcrypt** with cost factor 10
- Never store plain text passwords
- Passwords validated on login

## Cookie Security

```typescript
res.cookie('refreshToken', token, {
  httpOnly: true,    // No JS access
  maxAge: 86400000, // 24 hours
  sameSite: 'none',  // Cross-site
  secure: true,      // HTTPS only
});
```

## Complete Flow Diagram

```
                                       ┌─────────────────────┐
                                       │   POST /login      │
                                       └────────┬──────────┘
                                                │
                               ┌────────────────────▼────────────────────┐
                               │         Steps                      │
                               ├───────────────────────────────────┤
                               │ 1. Validate LoginSchema           │
                               │ 2. Find user in DB              │
                               │ 3. bcrypt.compare             │
                               │ 4. jwt.sign (access)         │
                               │ 5. jwt.sign (refresh)        │
                               │ 6. Update DB with refresh     │
                               │ 7. Set httpOnly cookie       │
                               │ 8. Return accessToken       │
                               └─────────────┬───────────────────┘
                                                 │
                    ┌──────────────────────────────┬┴──────────┐
                    │                              │          │
                    ▼                              ▼          ▼
            ┌──────────────┐           ┌──────────────┐ ┌──────────┐
            │   Success  │           │    Error   │ │ Error   │
            │ 200 +     │           │ 401 +     │ │ 400 +   │
            │ accessToken│           │ "Invalid  │ │ validation│
            │ httpOnly  │           │ credentials││ error   │
            │ cookie   │           └───────────┘ └─────────┘
            └──────────┘
```

## Protected Routes

Routes requiring authentication:

```typescript
router.get('/documents', authenticate, getDocuments);
router.post('/documents', authenticate, createDocument);
router.put('/documents/:id', authenticate, updateDocument);
router.delete('/documents/:id', authenticate, deleteDocument);
```

## Related Documentation

- [Client Auth Flow](/docs/client/auth-flow.md) - Client-side implementation
- [Middleware](middleware.md) - Auth middleware
- [API](api.md) - Endpoints