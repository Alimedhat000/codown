import { LuFileText as FileIcon, LuPin as PinIcon } from 'react-icons/lu';

import { Document } from '@/types/api';
import { dateFormat } from '@/utils/dateformat';

import { DocumentCardDropdown } from '../DocumentCardDropdown';

type DocumentGridCardProps = {
  document: Document;
  onDocumentUpdated: (updatedDocument: Document) => void;
  onDocumentDeleted: (documentId: string) => void;
};

export function DocumentGridCard({
  document,
  onDocumentUpdated,
  onDocumentDeleted,
}: DocumentGridCardProps) {
  return (
    <div className="bg-surface ring ring-surface-border hover:ring-muted-foreground group relative rounded-xl p-4 shadow hover:ring">
      {/* Dropdown Menu */}
      <DocumentCardDropdown
        document={document}
        triggerClassname="absolute top-2 right-2 p-1 hover:bg-muted rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
        onDocumentUpdated={onDocumentUpdated}
        onDocumentDeleted={onDocumentDeleted}
      />

      {/* Content */}
      <div className="flex flex-col gap-2">
        <div className="relative mb-5">
          <FileIcon className="absolute group-hover:opacity-0 transition-opacity" />
          <PinIcon
            className="absolute z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto text-muted-foreground hover:text-foreground transition-all"
            fill={document.pinned ? '#71717a' : 'none'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log(`im ${document.pinned ? 'not ' : ''}pinned now yay`);
            }}
          />
        </div>

        <div className="text-base font-medium line-clamp-2 mb-4">
          {document.title || 'Untitled'}
        </div>
        <div className="text-muted-foreground text-xs">
          {dateFormat(new Date(document.updatedAt))}
        </div>
      </div>
    </div>
  );
}
