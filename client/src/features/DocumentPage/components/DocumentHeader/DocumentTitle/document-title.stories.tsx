import type { Meta, StoryObj } from '@storybook/react-vite';

import { DocumentTitle } from './document-title';

const meta: Meta = {
  title: 'DocumentPage/DocumentTitle',
  component: DocumentTitle,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};

export const DocumentTitleDefault: Story = {
  args: {
    title: 'My Document',
  },
};

export const LongTitle: Story = {
  args: {
    title:
      'This is a very long document title that should demonstrate text truncation behavior',
  },
};

export const NoTitle: Story = {
  args: {
    title: undefined,
  },
};

export const EmptyTitle: Story = {
  args: {
    title: '',
  },
};
