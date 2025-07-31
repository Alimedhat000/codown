import type { Meta, StoryObj } from '@storybook/react-vite';

import { CollaboratorsDropdown } from './collaborators-dropdown';

const meta: Meta = {
  title: 'DocumentPage/CollaboratorsDropdown',
  component: CollaboratorsDropdown,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    collaborators: [],
  },
};

export const FewCollaborators: Story = {
  args: {
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

export const ManyCollaborators: Story = {
  args: {
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
      { id: '6', name: 'Frank Miller' },
      {
        id: '7',
        name: 'Grace Lee',
        avatarUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
      },
    ],
  },
};

export const LongNames: Story = {
  args: {
    collaborators: [
      { id: '1', name: 'Dr. Alexander Maximilian Richardson III' },
      { id: '2', name: 'Professor Elizabeth Catherine Worthington-Smith' },
    ],
  },
};
