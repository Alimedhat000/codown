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
  collaborators: Array<{ id: string; name: string; avatarUrl?: string }>;
  onCreateDocument?: (title: string) => Promise<void>;
}

export const DocumentToolbar = ({
  mode,
  setMode,
  username,
  avatarUrl,
  logout,
  documentTitle,
  collaborators,
  onCreateDocument,
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
        <CollaboratorsDropdown collaborators={collaborators} />
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

      <div className="order-4 md:order-5 flex items-center gap-2">
        <ShareButton />
        <MoreOptionsDropdown />
      </div>
    </div>
  );
};
