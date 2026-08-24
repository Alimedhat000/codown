import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { CreateDocumentButton } from './create-document-button';

const meta: Meta = {
  title: 'DocumentPage/CreateDocumentButton',
  component: CreateDocumentButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onCreateDocument: fn(),
  },
};
export default meta;

type Story = StoryObj;

/**
 * Button opening the create-document modal.
 */
export const Default: Story = {
  args: {},
};

/**
 * Pending state while creation resolves.
 */
export const WithSlowCreation: Story = {
  args: {
    onCreateDocument: fn().mockImplementation(
      (_title: string) =>
        new Promise((resolve) => setTimeout(() => resolve(undefined), 2000)),
    ),
  },
};

/**
 * Error surfaced when creation fails.
 */
export const WithError: Story = {
  args: {
    onCreateDocument: fn().mockRejectedValue(
      new Error('Failed to create document'),
    ),
  },
};
