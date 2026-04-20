# Server API

## Overview

The server provides REST API endpoints for authentication, document management, and user operations.

## Base URL

```
http://localhost:3000
```

## Swagger Documentation

Interactive API docs available at:
```
http://localhost:3000/api-docs
```

## Authentication Endpoints

### Register User

Register a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User Created"
}
```

**Error (409):**
```json
{
  "error": "Username or email already exists"
}
```

---

### Login

Authenticate user and receive tokens.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
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

Sets `refreshToken` as httpOnly cookie.

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Logout

Logout user and clear session.

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

Clears `refreshToken` cookie.

---

### Refresh Token

Refresh access token using refresh cookie.

```http
POST /auth/refresh
```

**Response (200):**
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

Sets new `accessToken` cookie.

---

## Document Endpoints

### List Documents

Get all documents for the authenticated user.

```http
GET /documents
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "doc-123",
    "title": "My Document",
    "content": "# Hello",
    "isPublic": false,
    "shareId": "abc123",
    "allowSelfJoin": false,
    "versionCount": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### Get Document

Get a specific document.

```http
GET /documents/:id
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "doc-123",
  "title": "My Document",
  "content": "# Hello",
  "isPublic": false,
  "shareId": "abc123",
  "allowSelfJoin": false,
  "versionCount": 1,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**Error (404):**
```json
{
  "error": "Document not found"
}
```

---

### Create Document

Create a new document.

```http
POST /documents
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "New Document",
  "content": "# Hello World",
  "isPublic": false
}
```

**Response (201):**
```json
{
  "id": "doc-456",
  "title": "New Document",
  "content": "# Hello World",
  "isPublic": false,
  "shareId": "def456",
  ...
}
```

---

### Update Document

Update an existing document.

```http
PUT /documents/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "# Updated Content"
}
```

**Response (200):**
```json
{
  "id": "doc-123",
  "title": "Updated Title",
  "content": "# Updated Content",
  ...
}
```

---

### Delete Document

Delete a document.

```http
DELETE /documents/:id
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Document deleted"
}
```

---

### Get Document Collaborators

List collaborators for a document.

```http
GET /documents/:id/collaborators
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "userId": "user-123",
    "username": "johndoe",
    "permission": "edit"
  }
]
```

---

### Add Collaborator

Add a user as collaborator.

```http
POST /documents/:id/collaborators
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "userId": "user-456",
  "permission": "view"
}
```

**Response (201):**
```json
{
  "message": "Collaborator added"
}
```

---

### Remove Collaborator

Remove a collaborator.

```http
DELETE /documents/:id/collaborators/:userId
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Collaborator removed"
}
```

---

## User Endpoints

### Get Current User

Get the authenticated user's profile.

```http
GET /users/me
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "username": "johndoe",
  "fullName": "John Doe"
}
```

---

### Update Current User

Update user's own profile.

```http
PUT /users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "fullName": "John Smith"
}
```

**Response (200):**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "username": "johndoe",
  "fullName": "John Smith"
}
```

---

## Shared Document Access

### Access Shared Document

Access a document via share link.

```http
GET /shared/:shareId/:token?
```

**Response (200):**
```json
{
  "id": "doc-123",
  "title": "Shared Document",
  "content": "# Hello",
  "permission": "view"
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "error": {
    "issues": [
      { "code": "invalid_type", "path": ["email"], "message": "Expected string, received number" }
    ]
  }
}
```

### Unauthorized (401)

```json
{
  "error": "Invalid or expired token"
}
```

### Forbidden (403)

```json
{
  "error": "You don't have permission to access this resource"
}
```

### Not Found (404)

```json
{
  "error": "Document not found"
}
```

### Conflict (409)

```json
{
  "error": "Username or email already exists"
}
```

---

## Related Documentation

- [Architecture](architecture.md) - Server structure
- [WebSockets](websockets.md) - WebSocket API
- [Database](database.md) - Schema
- [Auth Flow](auth-flow.md) - Authentication details