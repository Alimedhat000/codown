import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';
import { fn } from 'storybook/test';

import { DocumentHeader } from './document-header';

const meta: Meta<typeof DocumentHeader> = {
  title: 'DocumentPage/DocumentHeader',
  component: DocumentHeader,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="min-h-screen bg-background">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {
    setMode: fn(),
    logout: fn(),
    onCreateDocument: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mode: 'both',
  },
};

export const WithUser: Story = {
  args: {
    mode: 'edit',
    username: 'john.doe@example.com',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
  },
};

export const WithDocument: Story = {
  args: {
    mode: 'view',
    documentTitle: 'My Amazing Project Documentation',
    username: 'jane.smith@example.com',
    collaborators: [
      {
        id: '1',
        name: 'Alice Johnson',
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108755-2616b612b48c?w=32&h=32&fit=crop&crop=face',
      },
      { id: '2', name: 'Bob Wilson' },
    ],
  },
};

export const WithManyCollaborators: Story = {
  args: {
    mode: 'both',
    documentTitle: 'Team Collaboration Document',
    username: 'admin@example.com',
    collaborators: [
      {
        id: '1',
        name: 'Alice Johnson',
        avatarUrl:
          'https://images.unsplash.com/photo-1494790108755-2616b612b48c?w=32&h=32&fit=crop&crop=face',
      },
      {
        id: '2',
        name: 'Bob Wilson',
        avatarUrl:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      },
      { id: '3', name: 'Carol Davis' },
      {
        id: '4',
        name: 'David Brown',
        avatarUrl:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
      },
      { id: '5', name: 'Emma Thompson' },
    ],
  },
};

export const LongDocumentTitle: Story = {
  args: {
    mode: 'edit',
    documentTitle:
      'This is a very long document title that should demonstrate how the component handles text truncation and overflow',
    username: 'user@example.com',
    collaborators: [{ id: '1', name: 'Collaborator One' }],
  },
};

export const NoCollaborators: Story = {
  args: {
    mode: 'both',
    documentTitle: 'Solo Document',
    username: 'solo.user@example.com',
    collaborators: [],
  },
};

export const EditMode: Story = {
  args: {
    mode: 'edit',
    documentTitle: 'Draft Document',
    username: 'writer@example.com',
  },
};

export const ViewMode: Story = {
  args: {
    mode: 'view',
    documentTitle: 'Published Article',
    username: 'reader@example.com',
    collaborators: [
      {
        id: '1',
        name: 'Original Author',
        avatarUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      },
    ],
  },
};
