import type { Meta, StoryObj } from '@storybook/react-vite';

import { DocumentTitle } from './document-title';

const meta: Meta = {
  title: 'DocumentPage/DocumentTitle',
  component: DocumentTitle,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj;

/**
 * Default rendering.
 */
export const Default: Story = {
  args: {},
};

/**
 * Standard inline title.
 */
export const DocumentTitleDefault: Story = {
  args: {
    title: 'My Document',
  },
};

/**
 * Long title truncation.
 */
export const LongTitle: Story = {
  args: {
    title:
      'This is a very long document title that should demonstrate text truncation behavior',
  },
};

/**
 * Missing title renders nothing.
 */
export const NoTitle: Story = {
  args: {
    title: undefined,
  },
};

/**
 * Empty-string title renders nothing.
 */
export const EmptyTitle: Story = {
  args: {
    title: '',
  },
};
