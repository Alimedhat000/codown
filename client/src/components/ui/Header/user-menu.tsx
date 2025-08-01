// import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';

import { useState } from 'react';
import { LuChevronDown as ChevronIcon } from 'react-icons/lu';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuPortal,
  DropdownMenuContent,
} from '@/components/ui/Dropdown'; // adjust path if needed
import { cn } from '@/utils/cn';

export type UserMenuProps = {
  username: string;
  avatarUrl?: string;
  logout: () => void;
  showChevron?: boolean;
  className?: string;
};

export function UserMenu({
  username,
  avatarUrl,
  logout,
  showChevron = true,
  className,
}: UserMenuProps) {
  const [IsOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      {/* Avatar Image */}
      <DropdownMenuTrigger asChild className={className}>
        <button
          className={cn(
            'ml-auto focus:outline-none flex items-center space-x-2 hover:bg-surface rounded-md px-2 py-1 ',
          )}
        >
          <Avatar className="h-8 w-8 border border-muted-foreground">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {showChevron && (
            <ChevronIcon className={IsOpen ? ' rotate-180' : ''} />
          )}
        </button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuPortal>
        <DropdownMenuContent className="mx-2">
          <DropdownMenuLabel>{username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled
            className="px-2 py-1 rounded-sm hover:bg-accent cursor-pointer"
          >
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled
            className="px-2 py-1 rounded-sm hover:bg-accent cursor-pointer"
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              logout();
            }}
            className="px-2 py-1 rounded-sm hover:bg-accent cursor-pointer"
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
