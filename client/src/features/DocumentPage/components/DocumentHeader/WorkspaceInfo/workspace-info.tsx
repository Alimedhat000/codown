import React from 'react';
import { Link } from 'react-router';

import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { paths } from '@/config/paths';

export const WorkspaceInfo: React.FC = () => {
  return (
    <Link
      to={paths.app.dashboard.getHref()}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-surface"
    >
      <Avatar className="h-8 w-8 border border-muted-foreground ">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <span className="font-medium">My WorkSpace</span>
    </Link>
  );
};
