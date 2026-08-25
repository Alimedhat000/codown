import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import type { Document } from '@/types/api';

import { DocumentCardDropdown } from './document-card-dropdown';

const meta: Meta<typeof DocumentCardDropdown> = {
  title: 'Features/Dashboard/DocumentCardDropdown',
  component: DocumentCardDropdown,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DocumentCardDropdown>;

const mockDocument: Document = {
  id: 'doc-1',
  title: 'Quarterly Report',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pinned: false,
};

const onDocumentDeletedFn = fn();
const onDocumentUpdatedFn = fn();

export const Default: Story = {
  args: {
    document: mockDocument,
    onDocumentDeleted: onDocumentDeletedFn,
    onDocumentUpdated: onDocumentUpdatedFn,
  },
};

export const OpensMenuWithActions: Story = {
  args: {
    document: mockDocument,
    onDocumentDeleted: onDocumentDeletedFn,
    onDocumentUpdated: onDocumentUpdatedFn,
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'options' }));
    // Radix portals menu content to document.body, outside the story canvas
    const body = within(document.body);
    await expect(body.findByText(/open in view mode/i)).resolves.toBeDefined();
    await expect(body.findByText(/^pin$/i)).resolves.toBeDefined();
    await expect(body.findByText(/rename/i)).resolves.toBeDefined();
    await expect(body.findByText(/delete/i)).resolves.toBeDefined();
  },
};
