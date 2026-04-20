# Client Features

## Overview

The client uses a feature-based architecture where each domain functionality is contained in its own module. This document describes the main features.

## Feature: Dashboard

Location: `src/features/Dashboard/`

### Purpose

Manages the user's document listing, creation, and organization.

### Components

#### DocumentList

Main container for document display.

```typescript
import { DocumentList } from '@/features/Dashboard/components/DashBoardMain/document-list';

<DocumentList view="grid" sortBy="updatedAt" />
```

#### DocumentGridCard

Card view for documents in grid.

```typescript
import { DocumentGridCard } from '@/features/Dashboard/components/DocumentGridCard/document-grid-card';

<DocumentGridCard document={doc} onRename={handleRename} onDelete={handleDelete} />
```

#### DocumentRow

List view for documents.

```typescript
import { DocumentRow } from '@/features/Dashboard/components/DocumentRow/document-row';

<DocumentRow document={doc} />
```

#### NewDocumentModal

Modal for creating new documents.

```typescript
import { NewDocumentModal } from '@/features/Dashboard/components/NewDocumentModal/new-document-modal';

<NewDocumentModal open={open} onOpenChange={setOpen} onSubmit={handleCreate} />
```

#### SortControl

Sorting options for document list.

```typescript
import { SortControl } from '@/features/Dashboard/components/SortControl/sort-control';

<SortControl value={sort} onChange={setSort} />
```

#### DocumentCardDropdown

Dropdown menu for document actions (rename, delete, duplicate).

```typescript
import { DocumentCardDropdown } from '@/features/Dashboard/components/DocumentCardDropdown/document-card-dropdown';

<DocumentCardDropdown document={doc} />
```

### Data Structure

```typescript
interface Document {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  shareId: string;
  allowSelfJoin: boolean;
  versionCount: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}
```

## Feature: DocumentPage

Location: `src/features/DocumentPage/`

### Purpose

Provides the Markdown editor with real-time collaboration and preview.

### Components

#### DocumentHeader

Header with document controls.

```typescript
import { DocumentHeader } from '@/features/DocumentPage/components/DocumentHeader/document-header';

<DocumentHeader document={document} onTitleChange={handleTitleChange} />
```

#### DocumentTitle

Editable document title.

```typescript
import { DocumentTitle } from '@/features/DocumentPage/components/DocumentHeader/DocumentTitle/document-title';

<DocumentTitle title={title} onChange={setTitle} />
```

#### ShareButton

Button to share document.

```typescript
import { ShareButton } from '@/features/DocumentPage/components/DocumentHeader/ShareButton/share-button';

<ShareButton document={document} />
```

#### DocumentToolbar

Toolbar with editing tools.

```typescript
import { DocumentToolbar } from '@/features/DocumentPage/components/DocumentHeader/DocumentToolbar/document-toolbar';

<DocumentToolbar onFormat={handleFormat} />
```

#### WorkspaceInfo

Shows current collaborators.

```typescript
import { WorkspaceInfo } from '@/features/DocumentPage/components/DocumentHeader/WorkspaceInfo/workspace-info';

<WorkspaceInfo collaborators={collaborators} />
```

#### CollaboratorsDropdown

Dropdown to manage collaborators.

```typescript
import { CollaboratorsDropdown } from '@/features/DocumentPage/components/DocumentHeader/CollaboratorsDropdown/collaborators-dropdown';

<CollaboratorsDropdown documentId={id} />
```

#### ViewModeSelector

Toggle between edit/preview/split views.

```typescript
import { ViewModeSelector } from '@/features/DocumentPage/components/DocumentHeader/ViewModeSelector/view-mode-selector';

<ViewModeSelector value={mode} onChange={setMode} />
```

#### DocumentMain

Main editor area.

```typescript
import { DocumentMain } from '@/features/DocumentPage/components/DocumentMain/DocumentMain';

<DocumentMain document={document} mode="edit" />
```

#### MarkdownEditor

CodeMirror-based Markdown editor.

```typescript
import { MarkdownEditor } from '@/features/DocumentPage/components/DocumentMain/MarkdownEditor/MarkdownEditor';

<MarkdownEditor content={content} onChange={setContent} />
```

#### MarkdownToolbar

Formatting toolbar for editor.

```typescript
import { MarkdownToolbar } from '@/features/DocumentPage/components/DocumentMain/MarkdownEditor/MarkdownToolbar/markdown-toolbar';

<MarkdownToolbar onCommand={handleCommand} />
```

#### MarkdownPreview

Rendered Markdown preview.

```typescript
import { MarkdownPreview } from '@/features/DocumentPage/components/DocumentMain/MarkdownPreview/MarkdownPreview';

<MarkdownPreview content={content} />
```

### View Modes

| Mode | Description |
|------|-------------|
| `'edit'` | Editor only |
| `'preview'` | Preview only |
| `'split'` | Side-by-side view |

### Editor Features

- **CodeMirror 6** - Base editor
- **Markdown syntax** - Syntax highlighting
- **Toolbar commands** - Bold, italic, headings, lists, code blocks, links, images
- **Keyboard shortcuts** - Common formatting shortcuts
- **Auto-save** - Debounced content saving
- **Real-time sync** - Yjs document state

## Related Documentation

- [Architecture](architecture.md) - Directory structure
- [Components](components.md) - UI components
- [Collaboration](collaboration.md) - Real-time collaboration
- [Hooks](hooks.md) - Custom hooks