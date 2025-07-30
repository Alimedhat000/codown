import React, { useState } from 'react';
import {
  LuEllipsis as MoreIcon,
  LuTrash2 as DeleteIcon,
  LuPencil as EditIcon,
  LuPin as PinIcon,
  LuEye as EyeIcon,
  LuLink as LinkIcon,
} from 'react-icons/lu';
import { useNavigate } from 'react-router';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/Dropdown';
import { Document } from '@/types/api';
import { cn } from '@/utils/cn';

import { DeleteDocumentModal } from './delete-modal';
import { useDocumentActions } from './document-actions';
import { RenameDocumentModal } from './rename-modal';

const DropdownMenuItemClassname = 'space-x-2 focus:bg-popover-border';

interface DocumentCardDropdownProps {
  triggerClassname?: string;
  document: Document;
  onDocumentUpdated?: (updatedDocument: Document) => void;
  onDocumentDeleted?: (documentId: string) => void;
}

export function DocumentCardDropdown({
  triggerClassname,
  document,
  onDocumentUpdated,
  onDocumentDeleted,
}: DocumentCardDropdownProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // <-- added state

  const navigate = useNavigate();

  const { copySuccess, handleViewDocument, handleCopyLink } =
    useDocumentActions(document, navigate);

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger
          className={cn('hover:bg-muted rounded-sm p-1', triggerClassname)}
        >
          <MoreIcon className="text-muted-foreground h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="mx-2"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <DropdownMenuItem
            className={DropdownMenuItemClassname}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleViewDocument();
            }}
          >
            <EyeIcon />
            <span>Open in View mode</span>
          </DropdownMenuItem>

          <DropdownMenuItem disabled className={DropdownMenuItemClassname}>
            <PinIcon />
            <span>Pin</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className={DropdownMenuItemClassname}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setDropdownOpen(false);
              setShowRenameModal(true);
            }}
          >
            <EditIcon />
            <span>Rename</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className={DropdownMenuItemClassname}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleCopyLink();
            }}
          >
            <LinkIcon />
            <span>{copySuccess ? 'Link copied!' : 'Copy link'}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className={cn(
              DropdownMenuItemClassname,
              'text-destructive focus:text-destructive',
            )}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setDropdownOpen(false);
              setShowDeleteModal(true);
            }}
          >
            <DeleteIcon />
            <span>Delete this note</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDocumentModal
        document={document}
        open={showRenameModal}
        onOpenChange={setShowRenameModal}
        onDocumentUpdated={onDocumentUpdated}
      />

      <DeleteDocumentModal
        document={document}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onDocumentDeleted={onDocumentDeleted}
      />
    </>
  );
}
