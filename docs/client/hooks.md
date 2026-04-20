# Client Hooks

## Overview

Custom React hooks provide reusable stateful logic throughout the client application.

## Authentication Hooks

### useAuth

Accesses authentication context state.

```typescript
import { useAuth } from '@/context/auth/useAuth';

const { user, accessToken, login, logout, isAuthenticated, loading } = useAuth();
```

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| user | `User \| null` | Current user |
| accessToken | `string \| null` | JWT access token |
| login | `(token, user) => void` | Login function |
| logout | `() => Promise<void>` | Logout function |
| isAuthenticated | `boolean` | Auth status |
| loading | `boolean` | Initial load status |

## Document Hooks

### useDocument

Fetches document data from the API.

```typescript
import { useDocument } from '@/hooks/useDocument';

const { document, loading, error, refetch } = useDocument(documentId);
```

**Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| documentId | `string` | yes |

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| document | `Document \| null` | Document data |
| loading | `boolean` | Loading state |
| error | `Error \| null` | Error state |
| refetch | `() => Promise<void>` | Refetch function |

### useAutoSave

Debounced auto-save for document content.

```typescript
import { useAutoSave } from '@/hooks/useAutoSave';

const { save, isSaving } = useAutoSave({
  documentId,
  content,
  delay: 500,
});
```

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| documentId | `string` | required | Document ID |
| content | `string` | required | Content to save |
| delay | `number` | `500` | Debounce delay (ms) |

## Collaboration Hooks

### useCollab

Real-time collaboration with Yjs.

```typescript
import { useCollab } from '@/hooks/useCollab';

const { provider, ydoc, isConnected, users } = useCollab({
  documentId,
  accessToken,
});
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| documentId | `string` | yes | Document ID |
| accessToken | `string` | yes | User's access token |
| wsUrl | `string` | no | WebSocket URL |

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| provider | `HocuspocusProvider` | WebSocket provider |
| ydoc | `Y.Doc` | Yjs document |
| isConnected | `boolean` | WebSocket status |
| users | `User[]` | Active collaborators |

### useCollaborators

Fetches and manages document collaborators.

```typescript
import { useCollaborators } from '@/hooks/useCollaborators';

const { collaborators, loading, add, remove } = useCollaborators(documentId);
```

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| collaborators | `Collaborator[]` | List of collaborators |
| loading | `boolean` | Loading state |
| add | `(userId, permission) => Promise` | Add collaborator |
| remove | `(userId) => Promise` | Remove collaborator |

### useJoinRequests

Handles join requests for documents.

```typescript
import { useJoinRequests } from '@/hooks/useJoinRequests';

const { requests, accept, reject } = useJoinRequests(documentId);
```

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| requests | `CollaborationRequest[]` | Pending requests |
| loading | `boolean` | Loading state |
| accept | `(requestId) => Promise` | Accept request |
| reject | `(requestId) => Promise` | Reject request |

### useShareLink

Generates and manages share links.

```typescript
import { useShareLink } from '@/hooks/useShareLink';

const { shareLink, generate, revoke } = useShareLink(documentId);
```

**Returns:**
| Property | Type | Description |
|----------|------|-------------|
| shareLink | `string \| null` | Generated share URL |
| generate | `(permission) => Promise` | Create share link |
| revoke | `() => Promise` | Revoke share link |

## Utility Hooks

### useMediaQuery

Responsive breakpoint detection.

```typescript
import { useMediaQuery } from '@/hooks/useMediaQuery';

const isMobile = useMediaQuery('(max-width: 768px)');
```

**Parameters:**
| Parameter | Type | Required |
|-----------|------|----------|
| query | `string` | yes |

**Returns:** `boolean` - Whether the query matches

## Related Documentation

- [Auth Flow](auth-flow.md) - Authentication flow
- [Collaboration](collaboration.md) - Real-time collaboration
- [Features](features.md) - Feature components using hooks