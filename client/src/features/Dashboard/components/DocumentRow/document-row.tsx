import React from 'react';

import { Document } from '@/types/api';
import { dateFormat } from '@/utils/dateformat';

import { DocumentCardDropdown } from '../DocumentCardDropdown';

type DocumentRowProps = {
  document: Document;
  onDocumentUpdated: (updatedDocument: Document) => void;
  onDocumentDeleted: (documentId: string) => void;
};

export function DocumentRow({
  document,
  onDocumentUpdated,
  onDocumentDeleted,
}: DocumentRowProps) {
  return (
    <div className="hover:bg-surface ring ring-surface-border hover:ring-muted-foreground flex items-center justify-between rounded-md px-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{document.title || 'Untitled'}</p>
        <span className="text-muted-foreground text-xs font-medium">
          {dateFormat(new Date(document.updatedAt))}
        </span>
      </div>
      <DocumentCardDropdown
        document={document}
        onDocumentUpdated={onDocumentUpdated}
        onDocumentDeleted={onDocumentDeleted}
      />
    </div>
  );
}
