import type { Meta, StoryObj } from '@storybook/react-vite';

import { DocumentRow } from './document-row';

const meta: Meta<typeof DocumentRow> = {
  title: 'Components/DocumentRow',
  component: DocumentRow,
  //   tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DocumentRow>;

export const Default: Story = {
  render: () => (
    <DocumentRow title={'A Great Row Document'} updatedAt="A day ago" />
  ),
};
