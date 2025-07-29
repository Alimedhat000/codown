import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuFilePlus2 as NewFileIcon } from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form/Input';
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/Modal';
import { api } from '@/lib/api';
import type { Document } from '@/types/api';

type Props = {
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
};

type CreateDocumentForm = {
  title: string;
};

export default function NewDocumentModal({ setDocuments }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDocumentForm>();

  const onSubmit = async (data: CreateDocumentForm) => {
    if (!data.title.trim()) return;

    try {
      setCreating(true);
      const res = await api.post('/document', { title: data.title });
      setDocuments((prev) => [res.data, ...prev]);
      reset();

      setOpen(false);
    } catch (err) {
      console.error('Failed to create document', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <ModalTrigger>
        <Button size="icon">
          <NewFileIcon />
        </Button>
      </ModalTrigger>
      <ModalOverlay />
      <ModalContent slideFrom="top" animationType="slide" position="top">
        <ModalHeader>
          <div>
            <ModalTitle>Create New Document</ModalTitle>
            <ModalDescription>
              Give your document a title to begin.
            </ModalDescription>
          </div>
          <ModalClose />
        </ModalHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Input
              type="text"
              label="Document Title"
              placeholder="New document title"
              error={errors.title}
              registration={register('title', {
                required: 'Title is required',
              })}
              disabled={creating}
            />
          </ModalBody>

          <ModalFooter>
            <ModalClose asChild>
              <button
                type="button"
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </ModalClose>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
