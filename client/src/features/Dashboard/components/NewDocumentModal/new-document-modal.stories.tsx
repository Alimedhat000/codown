import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import NewDocumentModal from './new-document-modal';

const meta: Meta<typeof NewDocumentModal> = {
  title: 'Features/Dashboard/NewDocumentModal',
  component: NewDocumentModal,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof NewDocumentModal>;

const setDocumentsFn = fn();

export const Default: Story = {
  args: { setDocuments: setDocumentsFn },
};

export const OpensAndClosesViaCancel: Story = {
  args: { setDocuments: setDocumentsFn },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'new document' }));
    // Existence-based assertions retry through the open animation
    await canvas.findByText('Create New Document');
    await userEvent.click(canvas.getByRole('button', { name: /cancel/i }));
    await waitFor(
      () => expect(canvas.queryByText('Create New Document')).toBeNull(),
      { timeout: 3000 },
    );
  },
};
