# API Client

## Overview

The client uses Axios for HTTP requests. The API client is configured with base URL, interceptors for auth headers, and error handling.

## Setup

Location: `src/lib/api.ts`

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Include cookies
});
```

## Configuration

### Base URL

```env
# .env
VITE_API_URL=http://localhost:3000
```

### Headers

Default headers applied to all requests:

```typescript
api.defaults.headers.common['Content-Type'] = 'application/json';
```

## Request Interceptors

### Auth Token

The access token is automatically added to requests:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Response Interceptors

### Error Handling

Global error handling:

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

## Usage

### GET

```typescript
const response = await api.get('/documents');
const documents = response.data;
```

### POST

```typescript
const response = await api.post('/documents', {
  title: 'New Document',
  content: '# Hello',
});
```

### PUT

```typescript
await api.put('/documents/123', {
  title: 'Updated Title',
});
```

### DELETE

```typescript
await api.delete('/documents/123');
```

## Authentication Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/refresh` | Refresh access token |

## Document Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/documents` | List user's documents |
| GET | `/documents/:id` | Get document |
| POST | `/documents` | Create document |
| PUT | `/documents/:id` | Update document |
| DELETE | `/documents/:id` | Delete document |
| GET | `/documents/:id/collaborators` | List collaborators |
| POST | `/documents/:id/collaborators` | Add collaborator |
| DELETE | `/documents/:id/collaborators/:userId` | Remove collaborator |

## User Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/users/me` | Get current user |
| PUT | `/users/me` | Update current user |

## Error Responses

```typescript
// Validation error
{
  "error": {
    "issues": [
      { "code": "invalid_type", "path": ["email"] }
    ]
  }
}

// Auth error
{
  "error": "Invalid credentials"
}
```

## TypeScript Types

API response types are defined in `src/types/api.d.ts`:

```typescript
interface User {
  id: string;
  email: string;
  username: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  shareId: string;
  // ...
}
```

## Related Documentation

- [Auth Flow](auth-flow.md) - Authentication flow
- [API Documentation](/docs/server/api.md) - Server API endpoints