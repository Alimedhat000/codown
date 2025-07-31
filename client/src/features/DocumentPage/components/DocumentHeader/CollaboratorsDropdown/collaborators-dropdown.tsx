import React from 'react';
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

interface CollaboratorsDropdownProps {
  collaborators: Array<{ id: string; name: string; avatarUrl?: string }>;
}

export const CollaboratorsDropdown: React.FC<CollaboratorsDropdownProps> = ({
  collaborators,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <GroupIcon className="h-4 w-4" />
          {collaborators.length > 0 && (
            <span className="text-xs">{collaborators.length}</span>
          )}
          <ChevronIcon className="h-3 w-3" />
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
