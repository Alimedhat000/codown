import React from 'react';

import { UserMenu } from '@/components/ui/Header/user-menu';

import { CollaboratorsDropdown } from '../CollaboratorsDropdown';
import { CreateDocumentButton } from '../CreateDocumentButton';
import { DocumentTitle } from '../DocumentTitle';
import { MoreOptionsDropdown } from '../OptionsDropdown';
import { ShareButton } from '../ShareButton/share-button';
import { ViewModeSelector } from '../ViewModeSelector';

interface DocumentToolbarProps {
  mode: 'edit' | 'both' | 'view';
  setMode: (mode: 'edit' | 'both' | 'view') => void;
  username?: string;
  avatarUrl?: string;
  logout?: () => void;
  documentTitle?: string;
  onCreateDocument?: (title: string) => Promise<void>;
  docId?: string;
  isCollaborator?: boolean;
}

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
        {!isCollaborator && <CollaboratorsDropdown docId={docId} />}
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
          <ShareButton docId={docId} />
          <MoreOptionsDropdown />
        </div>
      ) : null}
    </div>
  );
};
