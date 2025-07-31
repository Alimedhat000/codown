import React from 'react';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';

export const ShareButton: React.FC = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">Share</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Copy Link</DropdownMenuItem>
        <DropdownMenuItem>Email Invite</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Manage Permissions</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
