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

export const DocumentToolbar: React.FC<DocumentToolbarProps> = ({
  mode,
  setMode,
  username,
  avatarUrl,
  logout,
  documentTitle,
  collaborators,
  onCreateDocument,
}) => {
  return (
    <div className="flex items-center gap-3">
      <ViewModeSelector mode={mode} setMode={setMode} />
      <CreateDocumentButton onCreateDocument={onCreateDocument} />
      <DocumentTitle title={documentTitle} />
      <CollaboratorsDropdown collaborators={collaborators} />
      <ShareButton />
      <MoreOptionsDropdown />
      {username && logout && (
        <UserMenu username={username} avatarUrl={avatarUrl} logout={logout} />
      )}
    </div>
  );
};
