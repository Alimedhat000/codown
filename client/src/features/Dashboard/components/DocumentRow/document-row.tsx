import React from 'react';

import { DocumentCardDropdown } from '../DocumentCardDropdown';

type DocumentRowProps = {
  title: string;
  updatedAt: string;
};

export function DocumentRow({ title, updatedAt }: DocumentRowProps) {
  return (
    <div className="hover:bg-surface flex items-center justify-between rounded-md px-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        <span className="text-muted-foreground text-xs font-medium">
          {updatedAt}
        </span>
      </div>
      <DocumentCardDropdown />
    </div>
  );
}
