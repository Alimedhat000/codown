import React, { useState } from 'react';
import {
  LuUsers as GroupIcon,
  LuChevronDown as ChevronIcon,
  LuPlus as PlusIcon,
  LuTrash2 as TrashIcon,
} from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';
import { useCollaborators } from '@/hooks/use-collaborators';
import { Collaborator } from '@/types/api';
import { cn } from '@/utils/cn';

interface CollaboratorsDropdownProps {
  /** ID of the document whose collaborators are listed. */
  docId?: string;
  /** Extra classes merged onto the trigger button. */
  className?: string;
  /** Renders per-collaborator remove buttons; owners only. */
  isOwner?: boolean;
  /** Overrides fetched collaborators (Storybook/tests). */
  collaborators?: Collaborator[];
}

/**
 * Avatar stack opening a dropdown listing collaborators with add/remove actions.
 */
export const CollaboratorsDropdown = ({
  docId,
  className,
  isOwner,
  collaborators,
}: CollaboratorsDropdownProps) => {
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const {
    collaborators: fetchedCollaborators,
    loading,
    error,
    addCollaborator,
    removeCollaborator,
  } = useCollaborators(docId);
  const list = collaborators ?? fetchedCollaborators;

  /** Adds the typed email as a collaborator and clears the input on success. */
  const handleAdd = async () => {
    const added = await addCollaborator(email);
    if (added) setEmail('');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className={className}>
        <Button
          variant="ghost"
          aria-label="Collaborators"
          className="gap-1 flex px-2 "
        >
          <GroupIcon className="h-4 w-4" />
          {list.length > 0 && <span className="text-xs">{list.length}</span>}
          <ChevronIcon
            className={cn('h-3 w-3 transition-transform', {
              'rotate-180': open,
            })}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="space-y-2">
          {loading ? (
            <DropdownMenuItem disabled>Loading…</DropdownMenuItem>
          ) : list.length > 0 ? (
            list.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted gap-3"
              >
                <span className="text-sm truncate">
                  {collaborator.user.username}
                </span>
                {isOwner && (
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => removeCollaborator(collaborator.id)}
                  >
                    <TrashIcon className="w-4 h-4 " />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <DropdownMenuItem disabled>No collaborators</DropdownMenuItem>
          )}
        </div>

        {isOwner && (
          <>
            <DropdownMenuSeparator />
            <form
              className="flex items-center gap-1 px-1 py-1"
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={254}
                aria-label="Collaborator email"
                className="h-8 min-w-0 flex-1 rounded border border-surface-border bg-transparent px-2 text-xs outline-none focus-visible:border-ring"
              />
              <Button
                size="icon"
                type="submit"
                aria-label="Add collaborator"
                disabled={!email.trim()}
                className="h-8 w-8 shrink-0"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </form>
            {error && (
              <p role="alert" className="px-2 pb-1 text-xs text-error">
                {error}
              </p>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
