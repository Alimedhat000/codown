// import { DropdownMenuContent } from '@radix-ui/react-dropdown-menu';

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
  user: {
    name: string;
    avatarUrl?: string;
  };
  logout: () => void;
};

export function UserMenu({ user, logout }: UserMenuProps) {
  return (
    <DropdownMenu>
      {/* Avatar Image */}
      <DropdownMenuTrigger asChild>
        <button className={cn('ml-auto focus:outline-none')}>
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuPortal>
        <DropdownMenuContent className="mx-2">
          <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
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
