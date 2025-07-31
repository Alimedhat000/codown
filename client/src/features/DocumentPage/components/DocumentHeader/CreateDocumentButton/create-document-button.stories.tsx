import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { CreateDocumentButton } from './create-document-button';

const meta: Meta = {
  title: 'DocumentPage/CreateDocumentButton',
  component: CreateDocumentButton,
  parameters: {
    layout: 'centered',
  },
  args: {
    onCreateDocument: fn(),
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {},
};

export const WithSlowCreation: Story = {
  args: {
    onCreateDocument: fn().mockImplementation(
      (_title: string) =>
        new Promise((resolve) => setTimeout(() => resolve(undefined), 2000)),
    ),
  },
};

export const WithError: Story = {
  args: {
    onCreateDocument: fn().mockRejectedValue(
      new Error('Failed to create document'),
    ),
  },
};
