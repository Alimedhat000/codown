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
  collaborators?: Array<{ id: string; name: string; avatarUrl?: string }>;
  onCreateDocument?: (title: string) => Promise<void>;
  className?: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  mode,
  setMode,
  username,
  avatarUrl,
  logout,
  documentTitle,
  collaborators = [],
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
        documentTitle={documentTitle}
        collaborators={collaborators}
        onCreateDocument={onCreateDocument}
      />
    </div>
  );
};
