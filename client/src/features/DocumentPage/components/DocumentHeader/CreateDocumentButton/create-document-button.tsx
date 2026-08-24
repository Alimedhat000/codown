import React, { useState } from 'react';
import { LuPlus as AddIcon } from 'react-icons/lu';

import NewDocumentFormBody from '@/components/common/NewDocumentFormBody';
import { Button } from '@/components/ui/Button';
import { Modal, ModalOverlay, ModalTrigger } from '@/components/ui/Modal';
import type { CreateDocumentForm } from '@/types/api';

interface CreateDocumentButtonProps {
  onCreateDocument?: (title: string) => Promise<void>;
  className?: string;
}

/**
 * Header button driving the shared create-document flow with pending/error handling.
 */
export const CreateDocumentButton = ({
  onCreateDocument,
  className,
}: CreateDocumentButtonProps) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: CreateDocumentForm) => {
    if (!data.title.trim() || !onCreateDocument) return;

    try {
      await onCreateDocument(data.title);
      setOpen(false);
    } catch (err) {
      console.error('Failed to create document', err);
    }
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger asChild className={className}>
        <Button variant="ghost" size="icon">
          <AddIcon className="h-4 w-4" />
        </Button>
      </ModalTrigger>
      <ModalOverlay />
      <NewDocumentFormBody
        title="Create New Document"
        description="Give your document a title to begin."
        submittingLabel="Create"
        onSubmit={handleSubmit}
      />
    </Modal>
  );
};
