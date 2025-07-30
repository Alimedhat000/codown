import React from 'react';

import { Document } from '@/types/api';
import { dateFormat } from '@/utils/dateformat';

import { DocumentCardDropdown } from '../DocumentCardDropdown';

type DocumentRowProps = {
  document: Document;
};

export function DocumentRow({ document }: DocumentRowProps) {
  return (
    <div className="hover:bg-surface ring ring-surface-border hover:ring-muted-foreground flex items-center justify-between rounded-md px-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{document.title || 'Untitled'}</p>
        <span className="text-muted-foreground text-xs font-medium">
          {dateFormat(new Date(document.createdAt))}
        </span>
      </div>
      <DocumentCardDropdown />
    </div>
  );
}
