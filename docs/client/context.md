# Client Context

## Overview

React Context providers are used for global state management, primarily for authentication.

## Context: Auth

Location: `src/context/auth/`

### AuthContext

The authentication context providing user state throughout the application.

```typescript
import { AuthContext } from '@/context/auth/AuthContext';

const { user, accessToken, isAuthenticated } = useAuth();
```

**Context Value:**
```typescript
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
```

### AuthProvider

Wraps the application to provide auth state.

```typescript
import { AuthProvider } from '@/context/auth/AuthProvider';

<AuthProvider>
  <App />
</AuthProvider>
```

**Initialization Flow:**

1. **On mount**, `AuthProvider` checks for session
2. **Calls** `/auth/refresh` endpoint
3. **On success**, sets user and token state
4. **On failure**, clears auth state

**Session Persistence:**

- Access token stored in memory + localStorage
- Refresh token in httpOnly cookie (server-set)
- On page refresh, token refreshed automatically

### useAuth Hook

Convenience hook to access auth context.

```typescript
import { useAuth } from '@/context/auth/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

**Usage:**

```typescript
const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <Login />;

  return <h1>Welcome, {user.username}</h1>;
};
```

## User Type

```typescript
interface User {
  id: string;
  email: string;
  username: string;
}
```

## Provider Composition

All providers are composed in `src/app/provider.tsx`:

```typescript
export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider>
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
};
```

## Related Documentation

- [Auth Flow](auth-flow.md) - Full authentication flow
- [API Client](api-client.md) - API client with auth headers
- [Hooks](hooks.md) - useAuth hook