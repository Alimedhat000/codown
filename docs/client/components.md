# Client Components

## Overview

The client includes a UI component library built on Radix UI primitives, plus layout components for common page structures.

## UI Component Library

Location: `src/components/ui/`

### Button

Button component with multiple variants and sizes.

```typescript
import { Button } from '@/components/ui/Button/button';

<Button variant="primary" size="md">
  Save
</Button>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual style |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| children | `ReactNode` | required | Button content |
| disabled | `boolean` | `false` | Disabled state |
| loading | `boolean` | `false` | Loading state |

### Alert

Contextual feedback messages.

```typescript
import { Alert } from '@/components/ui/Alert/alert';

<Alert variant="info" title="Note">
  This is an informational alert.
</Alert>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'success' \| 'warning' \| 'error' \| 'info'` | `'info'` | Alert type |
| title | `string` | - | Optional title |

### Avatar

User avatar with fallback.

```typescript
import { Avatar } from '@/components/ui/Avatar/avatar';

<Avatar src={user.avatarUrl} alt={user.username} />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | `string` | - | Image source |
| alt | `string` | required | Alt text |
| fallback | `string` | first letter of alt | Fallback text |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Avatar size |

### Modal

Dialog overlay.

```typescript
import { Modal } from '@/components/ui/Modal/modal';

<Modal open={isOpen} onOpenChange={setOpen}>
  <ModalContent>
    <ModalHeader>Title</ModalHeader>
    <ModalBody>Content</ModalBody>
    <ModalFooter>Actions</ModalFooter>
  </ModalContent>
</Modal>
```

### Dropdown

Dropdown menu using Radix DropdownMenu.

```typescript
import { Dropdown } from '@/components/ui/Dropdown/dropdown';

<Dropdown>
  <DropdownTrigger>Open menu</DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Action 1</DropdownItem>
    <DropdownItem>Action 2</DropdownItem>
  </DropdownContent>
</Dropdown>
```

### Form Components

```typescript
import { InputField } from '@/components/ui/Form/Input/input-field';
import { Label } from '@/components/ui/Form/label';
import { Error } from '@/components/ui/Form/error';

<InputField
  label="Email"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
/>
```

### Toast

Notification toasts.

```typescript
import { toast } from '@/components/ui/Toast/toast';

toast.success('Document saved');
toast.error('Failed to save');
```

### ToggleGroup

Single/multiple selection group.

```typescript
import { ToggleGroup } from '@/components/ui/ToggleGroup/toggle-group';

<ToggleGroup>
  <ToggleGroupItem value="edit">Edit</ToggleGroupItem>
  <ToggleGroupItem value="view">View</ToggleGroupItem>
</ToggleGroup>
```

### Skeleton

Loading placeholder.

```typescript
import { Skeleton } from '@/components/ui/Skeleton/skeleton';

<Skeleton className="h-4 w-32" />
```

### Spinner

Loading spinner.

```typescript
import { Spinner } from '@/components/ui/Spinner/spinner';

<Spinner size="md" />
```

## Layout Components

Location: `src/components/layouts/`

### AuthLayout

Layout for authentication pages (login/register).

```typescript
import { AuthLayout } from '@/components/layouts/AuthLayout';

<AuthLayout>
  <LoginForm />
</AuthLayout>
```

### ContentLayout

Generic content wrapper with header slot.

```typescript
import { ContentLayout } from '@/components/layouts/ContentLayout';

<ContentLayout title="Page Title">
  <Content />
</ContentLayout>
```

### DashboardLayout

Layout with sidebar for dashboard pages.

```typescript
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

<DashboardLayout>
  <DashboardMain />
</DashboardLayout>
```

### DocumentLayout

Layout for document editor page.

```typescript
import { DocumentLayout } from '@/components/layouts/DocumentLayout';

<DocumentLayout>
  <DocumentHeader />
  <DocumentMain />
</DocumentLayout>
```

## Common Components

Location: `src/components/common/`

### Forms

- `NewDocumentFormBody` - Form for creating documents

## Related Documentation

- [Architecture](architecture.md) - Directory structure
- [Features](features.md) - Feature components
- [Hooks](hooks.md) - Custom hooks