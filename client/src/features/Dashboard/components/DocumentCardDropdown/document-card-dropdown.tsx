import React from 'react';
import {
  LuEllipsis as MoreIcon,
  LuTrash2 as DeleteIcon,
  LuPencil as EditIcon,
  LuPin as PinIcon,
  LuEye as EyeIcon,
  LuLink as LinkIcon,
} from 'react-icons/lu';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/Dropdown';
import { cn } from '@/utils/cn';

const DropdownMenuItemClassname = 'space-x-2 focus:bg-popover-border';

export function DocumentCardDropdown({
  triggerClassname,
}: {
  triggerClassname?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={(cn('hover:bg-muted rounded-sm p-1'), triggerClassname)}
      >
        <MoreIcon className="text-muted-foreground h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mx-2">
        <DropdownMenuItem className={DropdownMenuItemClassname}>
          <EyeIcon />
          <span>Open in View mode</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={DropdownMenuItemClassname}>
          <PinIcon />
          <span>Pin</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={DropdownMenuItemClassname}>
          <EditIcon />
          <span>Rename</span>
        </DropdownMenuItem>

        <DropdownMenuItem className={DropdownMenuItemClassname}>
          <LinkIcon />
          <span>Copy link</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className={cn(
            DropdownMenuItemClassname,
            'text-destructive focus:text-destructive',
          )}
        >
          <DeleteIcon />
          <span>Delete this note</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
