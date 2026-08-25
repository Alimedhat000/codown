import React from 'react';

import { cn } from '@/utils/cn';

import { DocumentToolbar } from './DocumentToolbar/document-toolbar';
import { WorkspaceInfo } from './WorkspaceInfo';

export interface DocumentHeaderProps {
  /** Active editor layout: edit-only, split, or view-only. */
  mode: 'edit' | 'both' | 'view';
  /** Called with the selected layout when it changes. */
  setMode: (mode: 'edit' | 'both' | 'view') => void;
  /** Signed-in username shown in the toolbar. */
  username?: string;
  /** Signed-in user's avatar image URL. */
  avatarUrl?: string;
  /** Signs the user out from the account menu. */
  logout?: () => void;
  /** Title of the open document. */
  documentTitle?: string;
  /** Creates a document with the given title from the header actions. */
  onCreateDocument?: (title: string) => Promise<void>;
  /** Extra classes merged onto the header container. */
  className?: string;
  /** ID of the open document; enables document-scoped controls. */
  docId?: string;
  /** Disables editing controls for read-only viewers. */
  isReadOnly?: boolean;
  /** Unlocks collaborator-level controls on shared documents. */
  isCollaborator?: boolean;
}

/**
 * Composes the document top bar: title, collaborators, share, view-mode and options controls.
 */
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
  isReadOnly,
  isCollaborator,
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
        isReadOnly={isReadOnly}
        isCollaborator={isCollaborator}
      />
    </div>
  );
};
