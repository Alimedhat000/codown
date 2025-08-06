import React from 'react';

import { cn } from '@/utils/cn';

import { DocumentToolbar } from './DocumentToolbar/document-toolbar';
import { WorkspaceInfo } from './WorkspaceInfo';

export interface DocumentHeaderProps {
  mode: 'edit' | 'both' | 'view';
  setMode: (mode: 'edit' | 'both' | 'view') => void;
  username?: string;
  avatarUrl?: string;
  logout?: () => void;
  documentTitle?: string;
  onCreateDocument?: (title: string) => Promise<void>;
  className?: string;
  docId?: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  mode,
  setMode,
  username,
  avatarUrl,
  logout,
  docId,
  documentTitle,
  onCreateDocument,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4 bg-surface w-full md:px-4 md:py-2 px-2 py-1 border-b border-border',
        className,
      )}
    >
      <WorkspaceInfo />
      <DocumentToolbar
        mode={mode}
        setMode={setMode}
        username={username}
        avatarUrl={avatarUrl}
        logout={logout}
        docId={docId}
        documentTitle={documentTitle}
        onCreateDocument={onCreateDocument}
      />
    </div>
  );
};
