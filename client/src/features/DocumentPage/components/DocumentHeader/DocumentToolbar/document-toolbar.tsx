import React from 'react';
import { LuEye } from 'react-icons/lu';

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
  isReadOnly?: boolean;
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
  isReadOnly,
  isCollaborator,
}: DocumentToolbarProps) => {
  const isOwner = !isCollaborator;
  const canViewRoster = !isCollaborator || !isReadOnly;
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
        {canViewRoster ? (
          <CollaboratorsDropdown docId={docId} isOwner={isOwner} />
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            title="You have view access — ask the document owner to share editing rights"
          >
            <LuEye className="h-3.5 w-3.5" />
            View only
          </span>
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
