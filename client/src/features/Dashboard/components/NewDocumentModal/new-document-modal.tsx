import React, { useState } from 'react';
import { LuFilePlus2 as NewFileIcon } from 'react-icons/lu';

import NewDocumentFormBody from '@/components/common/NewDocumentFormBody';
import { Button } from '@/components/ui/Button';
import { Modal, ModalOverlay, ModalTrigger } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import type { CreateDocumentForm, Document } from '@/types/api';

type Props = {
  /** State setter that receives the newly created document. */
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
};

/**
 * Modal hosting the shared NewDocumentFormBody; creates the document via API and prepends it to the list.
 */
export default function NewDocumentModal({ setDocuments }: Props) {
  const [open, setOpen] = useState(false);

  const onSubmit = async (data: CreateDocumentForm) => {
    if (!data.title.trim()) return;

    try {
      const res = await api.post('/document', { title: data.title });
      setDocuments((prev) => [res.data, ...prev]);

      setOpen(false);
    } catch (err) {
      console.error('Failed to create document', err);
    }
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger aria-label="new document">
        <Button size="icon">
          <NewFileIcon />
        </Button>
      </ModalTrigger>
      <ModalOverlay />
      <NewDocumentFormBody
        title="Create New Document"
        description="Give your document a title to begin."
        submittingLabel="Create"
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
