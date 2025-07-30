import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { SimpleModal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Document } from '@/types/api';

interface DeleteDocumentModalProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentDeleted?: (documentId: string) => void;
}

export function DeleteDocumentModal({
  document,
  open,
  onOpenChange,
  onDocumentDeleted,
}: DeleteDocumentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/document/${document.id}`);
      if (onDocumentDeleted) {
        onDocumentDeleted(document.id);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete document:', error);
      // TODO: Add error toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SimpleModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Document"
      size="md"
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            Are you sure you want to delete "{document.title}"?
          </p>
          <p className="text-error font-medium">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={() => onOpenChange(false)}
            type="button"
            className="px-4 py-2 text-sm border border-surface-border hover:border-muted-foreground transition-all rounded-md"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            variant="destructive"
            className="bg-error border border-destructive hover:bg-error/80"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </SimpleModal>
  );
}
