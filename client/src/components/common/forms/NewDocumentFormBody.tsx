import React from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form/Input';
import {
  ModalBody,
  ModalFooter,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/Modal';
import { CreateDocumentForm } from '@/types/api';

type Props = {
  title?: string;
  description?: string;
  submittingLabel?: string;
  onSubmit: (data: { title: string }) => Promise<void>;
};

export default function NewDocumentFormBody({
  title = 'Create New Item',
  description = 'Provide a title to get started.',
  submittingLabel = 'Create',
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDocumentForm>();

  const submit = async (data: { title: string }) => {
    await onSubmit(data);
    reset();
  };
  return (
    <>
      <ModalContent slideFrom="top" animationType="slide" position="top">
        <ModalHeader>
          <div>
            <ModalTitle>{title}</ModalTitle>
            <ModalDescription>{description}</ModalDescription>
          </div>
          <ModalClose />
        </ModalHeader>

        <form onSubmit={handleSubmit(submit)}>
          <ModalBody>
            <Input
              id="documenttitle"
              type="text"
              label="Document Title"
              placeholder="New document title"
              error={errors.title}
              registration={register('title', {
                required: 'Title is required',
              })}
              disabled={isSubmitting}
            />
          </ModalBody>

          <ModalFooter>
            <ModalClose asChild>
              <button
                type="button"
                name="cancel"
                aria-label="cancel button"
                className="px-4 py-2 text-sm border border-surface-border hover:border-muted-foreground transition-all rounded-md "
              >
                Cancel
              </button>
            </ModalClose>
            <Button type="submit" id="create" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : submittingLabel}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </>
  );
}
