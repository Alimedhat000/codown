# WebSockets (Real-Time Collaboration)

## Overview

The server uses Hocuspocus (built on Yjs) for real-time collaborative editing via WebSockets. This handles document synchronization between clients.

## Architecture

```
┌──────────────┐     WebSocket      ┌──────────────┐
│   Client     │ ◄─────────────────► │   Server     │
│  (Browser)   │                     │ (Hocuspocus) │
└──────────────┘                     └──────┬───────┘
                                              │
                                    ┌────────▼────────┐
                                    │   Yjs State    │
                                    │  Persistence  │
                                    └───────────────┘
```

## Server Setup

Location: `server/src/sockets/ws-server.ts`

```typescript
import { Server } from '@hocuspocus/server';
import { Database } from '@hocuspocus/extension-database';

const server = Server.configure({
  port: 4000,
  name: 'codown',
  extensions: [
    new Database({
      // Load Yjs state from database
      fetch: async ({ documentName }) => {
        return await prisma.yjsDocumentState.findUnique({
          where: { documentId: documentName },
        });
      },
      // Store Yjs state to database
      store: async ({ documentName, state }) => {
        await prisma.yjsDocumentState.upsert({
          where: { documentId: documentName },
          update: { state, version: { increment: 1 } },
          create: { documentId: documentName, state },
        });
      },
    }),
  ],
});
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| port | `number` | WebSocket server port (default: 4000) |
| name | `string` | Server name for debugging |
| timeout | `number` | Connection timeout (default: 30000) |
| maxAuthentications | `number` | Max auth attempts |

## Authentication

Clients authenticate via access token:

```typescript
// Client connection
const provider = new HocuspocusProvider({
  url: 'ws://localhost:4000',
  name: 'document-id',
  token: 'user-access-token',
});
```

Server validates token:

```typescript
// In Hocuspocus server
const server = Server.configure({
  async onAuthenticate(data) {
    const token = data.token;
    const user = jwt.verify(token, JWT_SECRET);

    if (!user) {
      throw new Error('Invalid token');
    }

    return user;
  },
});
```

## Document Lifecycle

### 1. Client Connects

```
Client ──► Connect(documentId, token)
          ──────────────────────────►
          
Server validates token
Server loads document state from DB
Server sends initial state to client
```

### 2. Real-Time Sync

```
Client A edits ──► Yjs update ──► WebSocket ──► Server
                                              │
                                    ┌─────────▼─────────┐
                                    │ Broadcast to     │
                                    │ other clients     │
                                    └───────────────────┘
```

### 3. Auto-Save

```
Server accumulates changes
Every 500ms (configurable):
  Server ──► Serialize Yjs state ──► Store in DB
                                         │
                                         ▼
                                  yjsDocumentState table
```

## Extension: Database

The database extension persists Yjs state:

```typescript
import { Database } from '@hocuspocus/extension-database';

const extension = new Database({
  // Called when loading document
  fetch: async ({ documentName }) => {
    return prisma.yjsDocumentState.findUnique({
      where: { documentId: documentName },
    });
  },

  // Called when storing document
  store: async ({ documentName, state }) => {
    await prisma.yjsDocumentState.upsert({
      where: { documentId: documentName },
      update: { state, version: { increment: 1 } },
      create: { documentId: documentName, state },
    });
  },
});
```

## Extension: Authentication

Custom authentication logic:

```typescript
import { Authentication } from '@hocuspocus/extension-authentication';

const extension = new Authentication({
  // Validate token
  async authenticate({ token }) {
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    return user;
  },

  // Check document permissions
  async authorize({ token, documentName }) {
    const doc = await prisma.document.findUnique({
      where: { id: documentName },
    });

    // Check if user is owner, collaborator, or doc is public
    return canAccess(doc, user);
  },
});
```

## Hooks

Hocuspocus provides lifecycle hooks:

```typescript
Server.configure({
  async onConnect(data) {
    logger.info('Client connected', { document: data.documentName });
  },

  async onChange(data) {
    logger.info('Document changed', {
      document: data.documentName,
      change: data.changes.length,
    });
  },

  async onStoreDocument(data) {
    logger.info('Document stored', { document: data.documentName });
  },

  async onDisconnect(data) {
    logger.info('Client disconnected', { document: data.documentName });
  },
});
```

| Hook | Description |
|------|-------------|
| onConnect | Client connected |
| onChange | Document changed |
| onStoreDocument | Document saved to DB |
| onLoadDocument | Document loaded from DB |
| onDisconnect | Client disconnected |
| onAuthenticate | Token validation |
| onAuthFailed | Auth failure |

## Client Connection

```typescript
import { HocuspocusProvider } from '@hocuspocus/provider';

const provider = new HocuspocusProvider({
  url: 'ws://localhost:4000',
  name: 'document-id', // Document ID
  token: 'access-token',
});

// Access Yjs document
const ydoc = provider.document;
```

## Awareness Protocol

Presence information (cursors, selections):

```typescript
// Set local awareness
provider.awareness.setLocalStateField('user', {
  name: user.username,
  color: user.color,
});

// Listen to awareness changes
provider.awareness.on('change', () => {
  const states = provider.awareness.getStates();
  // Array of all user states
});
```

## Events

| Event | Description |
|-------|-------------|
| connect | Connected to server |
| disconnect | Disconnected from server |
| status | Connection status changed |
| sync | Initial sync complete |
| update | Document updated |
| awareness | Awareness changed |

## Running the WebSocket Server

```bash
cd server
pnpm ws:dev
```

Runs at `ws://localhost:4000`

## Related Documentation

- [Collaboration](/docs/client/collaboration.md) - Client-side collaboration
- [Database](database.md) - Yjs state storage
- [API](api.md) - REST endpoints