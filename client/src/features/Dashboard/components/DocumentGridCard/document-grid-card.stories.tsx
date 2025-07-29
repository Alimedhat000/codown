import type { Meta, StoryObj } from '@storybook/react-vite';

import { DocumentGridCard } from './document-grid-card';

const meta: Meta<typeof DocumentGridCard> = {
  title: 'Components/DocumentGridCard',
  component: DocumentGridCard,
  //   tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof DocumentGridCard>;

export const Default: Story = {
  render: () => (
    <DocumentGridCard title={'A Great Row Document'} updatedAt="A day ago" />
  ),
};
