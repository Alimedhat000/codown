import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { fn } from 'storybook/test';

import { DocumentToolbar } from './document-toolbar';

const meta: Meta = {
  title: 'DocumentPage/DocumentToolbar',
  component: DocumentToolbar,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-full max-w-4xl">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {
    setMode: fn(),
    logout: fn(),
    onCreateDocument: fn(),
    collaborators: [],
  },
};
export default meta;

type Story = StoryObj;

export const ToolbarMinimal: Story = {
  args: {
    mode: 'both',
  },
};

export const ToolbarWithUser: Story = {
  args: {
    mode: 'edit',
    username: 'user@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
  },
};

export const ToolbarComplete: Story = {
  args: {
    mode: 'both',
    username: 'john.doe@example.com',
    documentTitle: 'Project Documentation',
    collaborators: [
      {
        id: '1',
        name: 'Alice Johnson',
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108755-2616b612b48c?w=32&h=32&fit=crop&crop=face',
      },
      { id: '2', name: 'Bob Wilson' },
      { id: '3', name: 'Carol Davis' },
    ],
  },
};
