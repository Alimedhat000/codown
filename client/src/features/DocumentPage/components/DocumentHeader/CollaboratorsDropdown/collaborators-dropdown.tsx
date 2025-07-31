import React, { useState } from 'react';
import {
  LuUsers as GroupIcon,
  LuChevronDown as ChevronIcon,
} from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';
import { cn } from '@/utils/cn';

interface CollaboratorsDropdownProps {
  collaborators: Array<{ id: string; name: string; avatarUrl?: string }>;
  className?: string;
}

export const CollaboratorsDropdown = ({
  collaborators,
  className,
}: CollaboratorsDropdownProps) => {
  const [open, setopen] = useState(false);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={() => {
        setopen(!open);
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
        {collaborators.length > 0 ? (
          collaborators.map((collaborator, index) => (
            <React.Fragment key={collaborator.id}>
              <DropdownMenuItem>{collaborator.name}</DropdownMenuItem>
              {index < collaborators.length - 1 && <DropdownMenuSeparator />}
            </React.Fragment>
          ))
        ) : (
          <DropdownMenuItem disabled>No collaborators</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
