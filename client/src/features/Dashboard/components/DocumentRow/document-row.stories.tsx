import type { Meta, StoryObj } from '@storybook/react-vite';

import { DocumentRow } from './document-row';

const meta: Meta<typeof DocumentRow> = {
  title: 'Dashboard/DocumentRow',
  component: DocumentRow,
  //   tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DocumentRow>;

/**
 * Row rendering with title, timestamps and actions.
 */
export const Default: Story = {
  render: () => (
    <DocumentRow
      document={{
        id: 'doc1abcdefgh',
        title: 'Project Plan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pinned: true,
      }}
      onDocumentDeleted={() => {}}
      onDocumentUpdated={() => {}}
    />
  ),
};
