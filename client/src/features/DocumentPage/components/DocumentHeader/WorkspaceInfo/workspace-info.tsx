import React from 'react';
import { LuUndo2 as BackIcon } from 'react-icons/lu';
import { Link } from 'react-router';

import { paths } from '@/config/paths';

export const WorkspaceInfo: React.FC = () => {
  return (
    <Link
      to={paths.app.dashboard.getHref()}
      className="flex items-center gap-2 p-2 text-nowrap rounded-md hover:bg-surface"
    >
      <BackIcon className="h-5 w-5" />
      <span className="font-medium -mb-1 md:block hidden">Dashboard</span>
    </Link>
  );
};
