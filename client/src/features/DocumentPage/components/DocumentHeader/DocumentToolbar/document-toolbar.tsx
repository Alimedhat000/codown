import React from 'react';

import { UserMenu } from '@/components/ui/Header/user-menu';

import { CollaboratorsDropdown } from '../CollaboratorsDropdown';
import { CreateDocumentButton } from '../CreateDocumentButton';
import { DocumentTitle } from '../DocumentTitle';
import { MoreOptionsDropdown } from '../OptionsDropdown';
import { ShareButton } from '../ShareButton/share-button';
import { ViewModeSelector } from '../ViewModeSelector';

interface DocumentToolbarProps {
  /** Active editor layout: edit-only, split, or view-only. */
  mode: 'edit' | 'both' | 'view';
  /** Called with the selected layout when it changes. */
  setMode: (mode: 'edit' | 'both' | 'view') => void;
  /** Signed-in username shown in the user menu. */
  username?: string;
  /** Signed-in user's avatar image URL. */
  avatarUrl?: string;
  /** Signs the user out from the account menu. */
  logout?: () => void;
  /** Title of the open document. */
  documentTitle?: string;
  /** Creates a document with the given title from the header actions. */
  onCreateDocument?: (title: string) => Promise<void>;
  /** ID of the open document; enables document-scoped controls. */
  docId?: string;
  /** Hides owner-only controls (share/options) for collaborators. */
  isCollaborator?: boolean;
}

/**
 * Header toolbar switching contents between edit and view modes.
 */
export const DocumentToolbar = ({
  mode,
  setMode,
  username,
  avatarUrl,
  logout,
  docId,
  documentTitle,
  onCreateDocument,
  isCollaborator,
}: DocumentToolbarProps) => {
  return (
    <div className="w-full flex flex-wrap md:flex-nowrap items-center gap-3">
      <div className="order-2 md:order-1 flex items-center">
        <ViewModeSelector mode={mode} setMode={setMode} />
      </div>
      <div className="hidden md:flex order-2 items-center">
        <CreateDocumentButton onCreateDocument={onCreateDocument} />
      </div>
      <div className="order-1 md:order-3 flex md:justify-center flex-grow">
        <DocumentTitle
          title={documentTitle}
          className="text-left md:text-center"
        />
      </div>

      <div className="order-3 md:order-4 flex items-center gap-2">
        {!isCollaborator && (
          <CollaboratorsDropdown
            docId={docId}
            isCollaborator={isCollaborator}
          />
        )}
        {username && logout && (
          <UserMenu
            username={username}
            avatarUrl={avatarUrl}
            logout={logout}
            showChevron={false}
            className="hidden md:block"
          />
        )}
      </div>
      {!isCollaborator ? (
        <div className="order-4 md:order-5 flex items-center gap-2">
          <ShareButton docId={docId} isCollaborator={isCollaborator} />
          <MoreOptionsDropdown />
        </div>
      ) : null}
    </div>
  );
};
