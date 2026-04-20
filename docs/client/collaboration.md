# Real-Time Collaboration

## Overview

Codown uses **Yjs** for real-time collaborative editing. Yjs is a high-performance CRDT (Conflict-free Replicated Data Type) library that enables multiple users to simultaneously edit documents without conflicts.

## Architecture

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Client    │ ◄─────────────────► │   Server    │
│  (Yjs Doc)  │                     │ (Hocuspocus)│
└─────────────┘                     └─────────────┘
       │                                   │
       │ Yjs Update                       │ Store/Load
       │                                 │
       ▼                                 ▼
┌─────────────┐                  ┌─────────────┐
│ y-codemirror│                  │  PostgreSQL │
│  .next     │                  │  (Yjs State)│
└─────────────┘                  └─────────────┘
```

## Client Implementation

### Dependencies

```json
{
  "yjs": "^13.6.0",
  "y-codemirror.next": "^0.3.5",
  "@hocuspocus/provider": "^2.11.0"
}
```

### useCollab Hook

The primary hook for real-time collaboration.

```typescript
import { useCollab } from '@/hooks/useCollab';

const { provider, ydoc, isConnected, users } = useCollab({
  documentId: 'doc-123',
  accessToken: 'user-token',
});
```

**Parameters:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| documentId | `string` | yes | Document ID |
| accessToken | `string` | yes | User's access token |
| wsUrl | `string` | no | WebSocket URL (default: env) |

**Returns:**
| Prop | Type | Description |
|------|------|-------------|
| provider | `HocuspocusProvider` | WebSocket provider |
| ydoc | `Y.Doc` | Yjs document |
| isConnected | `boolean` | Connection status |
| users | `User[]` | Active collaborators |

### Editor Integration

```typescript
import { EditorView } from '@codemirror/view';
import { yCollab } from 'y-codemirror.next';
import { MarkdownEditor } from '@/features/DocumentPage/...';

const extensions = [
  EditorView.lineWrapping,
  yCollab(ydoc, provider.awareness),
];

<CodeMirror extensions={extensions} />
```

### Awareness (Presence)

Users see each other's cursors and selections.

```typescript
import { useCollaborators } from '@/hooks/useCollaborators';

const { collaborators } = useCollaborators(documentId);
```

## Server Implementation

### Hocuspocus Server

Location: `server/src/sockets/ws-server.ts`

```typescript
import { Server } from '@hocuspocus/server';

const server = Server.configure({
  port: 4000,
  name: 'codown',
  async onStoreDocument(data) {
    await db.save(data.documentName, data.document);
  },
  async onLoadDocument(data) {
    return await db.load(data.documentName);
  },
});
```

### Database Persistence

Yjs document state is stored in PostgreSQL.

```typescript
// Prisma model
model YjsDocumentState {
  id         String   @id @default(uuid())
  documentId String   @unique
  state      Bytes    // Binary Yjs state
  version    Int      @default(0)
  // ...
}
```

## Collaboration Flow

### 1. User Opens Document

```
1. User navigates to /app/document/:id
2. useCollab hook initializes
3. WebSocket connection to Hocuspocus
4. Yjs document synced from server
5. Editor binds to Yjs
```

### 2. Real-Time Editing

```
1. User types in editor
2. Yjs document updated locally
3. Change broadcasted via WebSocket
4. Other users receive update
5. Their editors re-render
```

### 3. Presence Awareness

```
1. User joins => awareness added
2. Cursor position shared
3. Selection range shared
4. Name/avatar shown
5. User leaves => awareness removed
```

### 4. Document Save

```
1. Debounced auto-save (500ms)
2. Yjs state serialized
3. Stored via WebSocket message
4. Server saves to PostgreSQL
5. Version incremented
```

## Handling Conflicts

Yjs CRDT automatically resolves conflicts:

- **Concurrent edits** - Both changes preserved
- **Concurrent deletes** - One deletion wins
- **Reordering** - Operational transformation handled

No manual conflict resolution needed.

## User Cursor Display

Each collaborator's cursor shows:

- User's name (tooltip)
- Color (unique per user)
- Selection highlighting

```typescript
// Awareness protocol
const awareness = provider.awareness;

awareness.setLocalStateField('user', {
  name: user.username,
  color: '#' + user.color,
});
```

## Connection Status

```typescript
if (!isConnected) {
  return <ConnectionStatus variant="disconnected" />;
}

return <ConnectionStatus variant="connected" users={users.length} />;
```

## Related Documentation

- [Features](features.md) - DocumentPage feature
- [Hooks](hooks.md) - useCollab, useCollaborators
- [Server WebSockets](/docs/server/websockets.md) - Server implementation
- [Database Schema](/docs/server/database.md) - Yjs state storage