# Database Schema

## Overview

Codown uses PostgreSQL with Prisma ORM. The schema defines users, documents, collaboration, and Yjs document state.

## Schema Location

```
server/prisma/schema.prisma
```

## Models

### User

Represents an authenticated user.

```prisma
model User {
  id                   String     @id @default(uuid())
  email                String     @unique
  username             String     @unique
  password             String
  fullName             String?
  refreshToken         String?
  isActive             Boolean    @default(true)
  createdAt            DateTime   @default(now())
  updatedAt            DateTime   @updatedAt

  Document             Document[]
  Collaborator         Collaborator[]
  CollaborationRequest CollaborationRequest[]

  @@map("users")
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| email | String | User's email (unique) |
| username | String | Username (unique) |
| password | String | Bcrypt-hashed password |
| fullName | String? | Optional display name |
| refreshToken | String? | Current refresh token |
| isActive | Boolean | Account active status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Document

Represents a Markdown document.

```prisma
model Document {
  id            String   @id @default(uuid())
  title         String
  content       String
  isPublic      Boolean  @default(false)
  shareId       String   @unique @default(cuid())
  allowSelfJoin Boolean  @default(false)
  versionCount  Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  author               User                   @relation(fields: [authorId], references: [id])
  authorId             String
  YjsDocumentState     YjsDocumentState?
  Collaborator         Collaborator[]
  CollaborationRequest CollaborationRequest[]

  @@map("documents")
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| title | String | Document title |
| content | String | Markdown content |
| isPublic | Boolean | Publicly accessible |
| shareId | String | Shareable ID (unique) |
| allowSelfJoin | Boolean | Allow users to request access |
| versionCount | Int | Auto-incremented version |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| authorId | UUID | Owner's user ID |

---

### Collaborator

Represents a user with access to a document.

```prisma
model Collaborator {
  id         String   @id @default(uuid())
  document   Document @relation(fields: [documentId], references: [id])
  documentId String
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  permission String   @default("edit") // "edit" or "view"

  @@unique([documentId, userId])
  @@map("collaborators")
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| documentId | UUID | Document ID |
| userId | UUID | User ID |
| permission | String | "edit" or "view" |

**Permission Levels:**

- `"view"` - Read-only access
- `"edit"` - Full editing access

---

### CollaborationRequest

Represents a request to join a document.

```prisma
model CollaborationRequest {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  document   Document @relation(fields: [documentId], references: [id])
  documentId String
  status     String   @default("pending") // pending | accepted | rejected
  permission String   @default("edit") // "edit" or "view"
  createdAt  DateTime @default(now())

  @@unique([documentId, userId])
  @@map("collaboration_requests")
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| documentId | UUID | Document ID |
| userId | UUID | Requesting user ID |
| status | String | pending/accepted/rejected |
| permission | String | Requested permission |
| createdAt | DateTime | Request timestamp |

---

### YjsDocumentState

Stores the binary Yjs document state for real-time collaboration.

```prisma
model YjsDocumentState {
  id         String   @id @default(uuid())
  documentId String   @unique
  state      Bytes    // Binary Yjs document state
  version    Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@map("yjs_document_states")
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| documentId | String | Document ID (unique) |
| state | Bytes | Binary Yjs document state |
| version | Int | Document version |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**State Format:**
- Binary blob containing Yjs encoded document
- Used for real-time sync across clients

---

## Relationships

```
┌─────────┐     ┌────────────┐     ┌─────────┐
│  User   │────│ Document  │────│  User  │
└─────────┘     └────────────┘     └─────────┘
     │               │               │
     │               │               │
     ▼               ▼               ▼
┌─────────────┐   ┌────────────┐   ┌────────────┐
│Collaborator│   │Collaborator│   │Request   │
└─────────────┘   └────────────┘   └────────────┘
     │
     ▼
┌────────────────┐
│YjsDocumentState│
└────────────────┘
```

## Prisma Commands

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm prisma db push

# Open Prisma Studio
pnpm prisma studio

# Reset database
pnpm prisma db push --force-reset

# Create migration
pnpm prisma migrate dev --name init
```

## Database URL Format

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

## Related Documentation

- [API](api.md) - REST endpoints
- [WebSockets](websockets.md) - Yjs persistence
- [Auth Flow](auth-flow.md) - Authentication