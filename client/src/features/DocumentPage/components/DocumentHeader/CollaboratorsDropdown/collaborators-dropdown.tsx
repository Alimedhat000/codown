import React, { useState } from 'react';
import {
  LuUsers as GroupIcon,
  LuChevronDown as ChevronIcon,
  LuTrash2 as TrashIcon,
} from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';
import { useCollaborators } from '@/hooks/useCollaborators';
import { cn } from '@/utils/cn';

interface CollaboratorsDropdownProps {
  docId?: string;
  className?: string;
}

export const CollaboratorsDropdown = ({
  docId,
  className,
}: CollaboratorsDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { collaborators, loading, addCollaborator, removeCollaborator } =
    useCollaborators(docId, open);

  const _handleAdd = async () => {
    await addCollaborator(email);
    setEmail('');
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={() => {
        setOpen(!open);
      }}
    >
      <DropdownMenuTrigger asChild className={className}>
        <Button variant="ghost" className="gap-1 flex px-2 ">
          <GroupIcon className="h-4 w-4" />
          {collaborators.length > 0 && (
            <span className="text-xs">{collaborators.length}</span>
          )}
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
          ) : collaborators.length > 0 ? (
            collaborators.map((collaborator, _index) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted gap-3"
              >
                <span className="text-sm truncate">{collaborator.email}</span>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => removeCollaborator(collaborator.id)}
                >
                  <TrashIcon className="w-4 h-4 " />
                </Button>
              </div>
            ))
          ) : (
            <DropdownMenuItem disabled>No collaborators</DropdownMenuItem>
          )}
        </div>

        {/* <div className="flex items-center gap-1">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-8 text-xs"
          />
          <Button
            size="icon"
            onClick={handleAdd}
            disabled={!email.trim()}
            className="h-8 w-8"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
