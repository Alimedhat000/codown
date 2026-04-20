# Client Authentication Flow

## Overview

The client implements a complete authentication system with JWT tokens (access + refresh tokens), session persistence, and protected routes.

## Authentication Strategy

### Token Types

| Token | Storage | Expiry | Purpose |
|-------|---------|-------|---------|
| Access Token | Memory + localStorage | 15 minutes | API authorization |
| Refresh Token | httpOnly Cookie | 24 hours | Session persistence |

### Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────►│  Server  │────►│ Database │
└──────────┘     └──────────┘     └──────────┘
     │                                        │
     │ POST /auth/login                        │
     │─────────────────────────►              │
     │                                        │
     │        accessToken (response)           │
     │        refreshToken (httpOnly cookie)    │
     │◄─────────────────────────              │
     │                                        │
     │    API requests + Authorization:        │
     │◄────────────────────────►              │
     │                                        │
     │    On token expiry:                     │
     │        POST /auth/refresh               │
     │◄────────────────────────►              │
```

## Registration

### Client-Side

```typescript
import { RegisterSchema } from '@/lib/auth';

// Validate form data
const result = RegisterSchema.safeParse(formData);
if (!result.success) {
  return showValidationErrors(result.error);
}

// Submit registration
await api.post('/auth/register', result.data);

// Redirect to login
navigate('/login');
```

**Validation Schema:**

```typescript
const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
  fullName: z.string().optional(),
});
```

### Server-Side (See `/docs/server/auth-flow.md`)

## Login

### Client-Side

```typescript
import { LoginUser } from '@/lib/auth';

const handleLogin = async (data: LoginFormData) => {
  try {
    const response = await LoginUser(data);
    const { accessToken, user } = response;

    // Update auth context
    login(accessToken, user);

    // Redirect to dashboard
    navigate('/app/dashboard');
  } catch (error) {
    showError('Invalid credentials');
  }
};
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

### Setting Token

```typescript
// In AuthProvider
const login = (token: string, user: User) => {
  // 1. Store in state
  setAccessToken(token);
  setUser(user);

  // 2. Add to API headers
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  // 3. Persist to localStorage for refresh
  setAccessToken(token);
};
```

## Session Persistence

### On App Load

When the app loads, `AuthProvider` attempts to restore the session:

```typescript
useEffect(() => {
  const initializeAuth = async () => {
    // Skip if explicitly logged out
    if (localStorage.getItem('wasLoggedOut') === 'true') {
      setLoading(false);
      return;
    }

    try {
      // Call refresh endpoint with cookie
      const response = await api.post('/auth/refresh');
      const { accessToken, user } = response.data;

      // Restore session
      login(accessToken, user);
    } catch {
      // Clear invalid session
      logout();
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
}, []);
```

### On Token Expiry

If an API request returns 401, the token may be expired:

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        const response = await api.post('/auth/refresh');
        const { accessToken, user } = response.data;
        login(accessToken, user);

        // Retry original request
        return api.request(error.config);
      } catch {
        // Redirect to login
        navigate('/login');
      }
    }
    return Promise.reject(error);
  }
);
```

## Protected Routes

### ProtectedRoute Component

Wraps routes that require authentication:

```typescript
import { ProtectedRoute } from '@/lib/auth';

<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

**Implementation:**

```typescript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirectTo=${location.pathname}`, {
        replace: true,
      });
    }
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) {
    return null; // Or loading spinner
  }

  return children;
};
```

**Route Definition:**

```typescript
// router.tsx
<Route path="/app/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Logout

### Client-Side

```typescript
const handleLogout = async () => {
  // 1. Call logout endpoint
  await api.post('/auth/logout');

  // 2. Clear state
  setAccessToken(null);
  setUser(null);

  // 3. Clear headers
  delete api.defaults.headers.common['Authorization'];

  // 4. Clear localStorage
  clearAccessToken();

  // 5. Mark as logged out (prevent refresh on reload)
  localStorage.setItem('wasLoggedOut', 'true');

  // 6. Redirect to login
  navigate('/login');
};
```

### Server-Side Effects

The server:
1. Clears the refresh token from the database
2. Clears the refreshToken cookie

## Token Storage Security

| Storage | Pros | Cons |
|---------|------|------|
| Memory (React state) | Not accessible to JS | Lost on page refresh |
| localStorage | Persists across tabs | XSS vulnerable |
| httpOnly cookie | Immune to XSS | Requires CSRF protection |

### Implementation

```typescript
// Store token
const setAccessToken = (token: string) => {
  localStorage.setItem('accessToken', token);
};

// Retrieve token
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

// Clear token
const clearAccessToken = () => {
  localStorage.removeItem('accessToken');
};
```

## Complete Flow Diagram

```
                                    ┌─────────────────────┐
                                    │   Page Load         │
                                    └──────────┬──────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │ wasLoggedOut=true?   │
                                    └──────────┬──────────���
                                         Yes/    \No
                                         ▼         ▼
                              ┌──────────────┐  ┌──────────────┐
                              │ Set loading  │  │ Call /refresh│
                              │ to false     │  │ (with cookie)│
                              └──────────────┘  └──────┬───────┘
                                                        │
                                    ┌──────────────────▼──────────────────┐
                                    │         Response                      │
                                    ├─────────────────┬────────────────────┤
                                    │ Success         │ Error               │
                                    ▼                 ▼                    ▼
                              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                              │ login()      │  │ logout()     │  │ Clear state  │
                              │ - set token │  │ - clear all │  │ Set loading │
                              │ - set user  │  │ - redirect │  │ to false    │
                              └──────────────┘  └──────────────┘  └──────────────┘
```

## Related Documentation

- [Server Auth Flow](/docs/server/auth-flow.md) - Server-side implementation
- [Context](context.md) - AuthContext
- [API Client](api-client.md) - API client