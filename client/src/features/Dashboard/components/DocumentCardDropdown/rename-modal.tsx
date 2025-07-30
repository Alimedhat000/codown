import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { SimpleModal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Document } from '@/types/api';

interface RenameDocumentModalProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentUpdated?: (updatedDocument: Document) => void;
}

export function RenameDocumentModal({
  document,
  open,
  onOpenChange,
  onDocumentUpdated,
}: RenameDocumentModalProps) {
  const [newTitle, setNewTitle] = useState(document.title);
  const [isRenaming, setIsRenaming] = useState(false);

  // Reset title when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setNewTitle(document.title);
    }
  }, [open, document.title]);

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle === document.title) {
      onOpenChange(false);
      return;
    }

    setIsRenaming(true);
    try {
      const response = await api.put(`/document/${document.id}`, {
        title: newTitle.trim(),
      });

      if (onDocumentUpdated) {
        onDocumentUpdated(response.data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to rename document:', error);
      // TODO: Add error toast
    } finally {
      setIsRenaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    }
    if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  return (
    <SimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title="Rename Document"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Document Title
          </label>
          <input
            id="title"
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter document title"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            type="button"
            className="px-4 py-2 text-sm border border-surface-border hover:border-muted-foreground transition-all rounded-md"
            disabled={isRenaming}
          >
            Cancel
          </button>
          <Button
            onClick={handleRename}
            disabled={isRenaming || !newTitle.trim()}
          >
            {isRenaming ? 'Renaming...' : 'Rename'}
          </Button>
        </div>
      </div>
    </SimpleModal>
  );
}
