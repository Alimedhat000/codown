# Client Architecture

## Overview

The client follows a **feature-based organization** pattern where code is grouped by domain functionality rather than technical type. This approach keeps related code together and makes it easier to understand, test, and maintain feature-specific logic.

## Directory Structure

```
client/src/
├── app/                    # Application setup
│   ├── index.tsx           # Root App component
│   ├── provider.tsx       # Combined context providers
│   ├── router.tsx         # React Router configuration
│   └── routes/           # Page-level route components
│
├── components/            # Shared components
│   ├── common/           # Generic components
│   ├── layouts/         # Layout wrappers
│   │   ├── AuthLayout.tsx
│   │   ├── ContentLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── DocumentLayout.tsx
│   └── ui/               # UI component library
│       ├── Alert/
│       ├── Avatar/
│       ├── Button/
│       ├── Dropdown/
│       ├── Form/
│       ├── Header/
│       ├── Modal/
│       ├── Skeleton/
│       ├── Spinner/
│       ├── Toast/
│       └── ToggleGroup/
│
├── config/               # Configuration
│   ├── env.ts           # Environment validation (Zod)
│   └── paths.ts         # Route path constants
│
├── context/             # React Context
│   └── auth/           # Authentication context
│       ├── AuthContext.tsx
│       ├── AuthProvider.tsx
│       └── useAuth.tsx
│
├── features/            # Feature modules (organized by domain)
│   ├── Dashboard/     # Dashboard feature
│   │   ├── components/
│   │   │   ├── DashBoardMain/
│   │   │   ├── DocumentCardDropdown/
│   │   │   ├── DocumentGridCard/
│   │   │   ├── DocumentRow/
│   │   │   ├── NewDocumentModal/
│   │   │   └── SortControl/
│   │   └── index.ts
│   │
│   └── DocumentPage/ # Document editor feature
│       ├── components/
│       │   ├── DocumentHeader/
│       │   │   ├── CollaboratorsDropdown/
│       │   │   ├── CreateDocumentButton/
│       │   │   ├── DocumentTitle/
│       │   │   ├── DocumentToolbar/
│       │   │   ├── OptionsDropdown/
│       │   │   ├── ShareButton/
│       │   │   ├── ViewModeSelector/
│       │   │   └── WorkspaceInfo/
│       │   └── DocumentMain/
│       │       ├── MarkdownEditor/
│       │       ├── MarkdownPreview/
│       │       └── DocumentMain.tsx
│       └── index.ts
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts           # Wraps auth context
│   ├── useAutoSave.ts       # Auto-save document changes
│   ├── useCollaborators.ts # Fetch/manage collaborators
│   ├── useCollab.ts        # Yjs real-time collaboration
│   ├── useDocument.ts      # Fetch/document data
│   ├── useJoinRequests.ts  # Handle join requests
│   ├── useMediaQuery.ts    # Responsive utilities
│   └── useShareLink.ts    # Share link generation
│
├── lib/               # Core utilities
│   ├── api.ts               # Axios instance with interceptors
│   ├── auth.ts             # Auth functions & schemas
│   └─��� rehypeCopyButton.ts  # Custom rehype plugin
│
├── types/             # TypeScript types
│   └── api.d.ts           # API response types
│
├── utils/            # Utility functions
│   ├── cn.ts          # Class name merging (clsx wrapper)
│   ├── token.ts      # Token storage utilities
│   └── truncate.ts  # Text truncation
│
├── index.css         # Global styles (Tailwind)
└── main.tsx        # Entry point
```

## Routing (React Router 7)

Routes are defined in `src/app/router.tsx`:

```typescript
// Main routes
'/': Landing page
'/login': Login page
'/register': Registration page
'/app/dashboard': User's documents
'/app/document/:id': Document editor
'/app/document/:id/shared/:token': Shared document view
```

## Component Patterns

### Feature Components

Feature components follow this structure:
- Own their own state and logic
- Use custom hooks for shared behavior
- Are composed of smaller reusable components
- Export an index.ts for clean imports

```typescript
// Example: Feature component structure
import { useDocument } from '@/hooks/useDocument';
import { DocumentHeader } from './DocumentHeader';
import { DocumentMain } from './DocumentMain';

export const DocumentPage = () => {
  const { document, loading } = useDocument();

  if (loading) return <Skeleton />;

  return (
    <DocumentLayout>
      <DocumentHeader />
      <DocumentMain />
    </DocumentLayout>
  );
};
```

### UI Components

UI components in `components/ui/`:
- Built on Radix UI primitives
- Accept variant props for styling
- Use Zod for prop validation (in stories)
- Export type definitions

```typescript
// Example: UI component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', ... }: ButtonProps) => {
  return <RadixButton className={variants[variant]} {...} />;
};
```

## State Management

### Local State
- React `useState` for component-level state
- `useReducer` for complex state logic

### Shared State
- React Context for global state (auth, theme)
- Custom hooks to access context

### Server State
- React Query pattern via custom hooks
- Direct API calls with loading/error handling

## Data Fetching

Data is fetched using custom hooks that:
- Return data, loading, and error states
- Handle server state
- Provide revalidation logic

```typescript
// Example: Data fetching hook
const useDocument = (id: string) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/documents/${id}`)
      .then(res => setDocument(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  return { document, loading };
};
```

## Related Documentation

- [README](README.md) - Setup and configuration
- [Components](components.md) - UI component library
- [Features](features.md) - Feature documentation
- [Hooks](hooks.md) - Custom hooks reference