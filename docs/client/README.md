# Codown Client Documentation

## Overview

The Codown client is a React 19 application built with Vite 7. It provides the frontend interface for a real-time collaborative Markdown editor.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + Vite 7 |
| Routing | React Router 7 |
| Editor | CodeMirror 6 |
| Real-time Sync | Yjs + y-codemirror.next + Hocuspocus |
| UI Components | Radix UI |
| Styling | Tailwind CSS 4 |
| Forms | React Hook Form + Zod |
| State Management | React Context |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation
```bash
cd client
pnpm install
```

### Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:4000
```

### Development
```bash
pnpm dev
```

Runs at `http://localhost:5173`

### Build
```bash
pnpm build
```

### Lint
```bash
pnpm lint
```

## Project Structure

```
client/
├── src/
│   ├── app/                    # App setup
│   │   ├── index.tsx            # Root component
│   │   ├── provider.tsx        # Context providers
│   │   ├── router.tsx          # Routes configuration
│   │   └── routes/             # Route components
│   ├── components/             # Reusable components
│   │   ├── common/             # Common components
│   │   ├── layouts/            # Layout components
│   │   └── ui/                 # UI component library
│   ├── config/                # Configuration
│   ├── context/                # React context
│   ├── features/              # Feature-based modules
│   │   ├── Dashboard/         # Dashboard feature
│   │   └── DocumentPage/      # Document editor feature
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities
│   ├── types/                  # TypeScript types
│   └── utils/                  # Utility functions
├── public/                    # Static assets
├── generators/                # Plop component generators
├── .storybook/                 # Storybook configuration
├── index.html                 # HTML entry
├── vite.config.ts              # Vite configuration
└── package.json               # Dependencies
```

## Core Concepts

### Feature-Based Organization

Code is organized by feature rather than type. Each feature contains its own components, hooks, and utilities:

- `src/features/Dashboard/` - Document listing, creation, management
- `src/features/DocumentPage/` - Markdown editing, preview, collaboration

### Component Library

UI components in `src/components/ui/` are built on Radix UI primitives:

- Button, Alert, Avatar
- Modal, Dropdown, Toast
- Form components (Input, Label, Error)
- ToggleGroup, Skeleton, Spinner

### Layouts

Layout components in `src/components/layouts/`:
- `AuthLayout` - Login/register pages
- `ContentLayout` - Generic content wrapper
- `DashboardLayout` - Dashboard with sidebar
- `DocumentLayout` - Document editor layout

## Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | Application entry point |
| `src/app/router.tsx` | Route definitions |
| `src/context/auth/AuthProvider.tsx` | Authentication state |
| `src/lib/api.ts` | Axios API client |
| `src/features/DocumentPage/components/DocumentMain/` | Editor components |
| `src/hooks/useCollab.ts` | Real-time collaboration hook |

## Related Documentation

- [Architecture](architecture.md)
- [Components](components.md)
- [Features](features.md)
- [Collaboration](collaboration.md)
- [Context](context.md)
- [Hooks](hooks.md)
- [API Client](api-client.md)
- [Auth Flow](auth-flow.md)