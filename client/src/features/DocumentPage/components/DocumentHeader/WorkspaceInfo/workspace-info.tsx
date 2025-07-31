import React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/Avatar';

export const WorkspaceInfo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-8 w-8 border border-muted-foreground">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <span className="font-medium">My WorkSpace</span>
    </div>
  );
};
