import type { Meta, StoryObj } from '@storybook/react-vite';

import { Collaborator } from '@/types/api';

import { CollaboratorsDropdown } from './collaborators-dropdown';

const mockCollaborators: Collaborator[] = [
  {
    id: 'c1',
    documentId: 'doc1',
    userId: 'u1',
    permission: 'edit',
    user: {
      id: 'u1',
      username: 'alice',
      email: 'alice@example.com',
      fullName: 'Alice Johnson',
    },
  },
  {
    id: 'c2',
    documentId: 'doc1',
    userId: 'u2',
    permission: 'view',
    user: {
      id: 'u2',
      username: 'bob',
      email: 'bob@example.com',
      fullName: 'Bob Wilson',
    },
  },
  {
    id: 'c3',
    documentId: 'doc1',
    userId: 'u3',
    permission: 'edit',
    user: {
      id: 'u3',
      username: 'carol',
      email: 'carol@example.com',
      fullName: 'Carol Davis',
    },
  },
];

const longNameCollaborators: Collaborator[] = [
  {
    id: 'c1',
    documentId: 'doc1',
    userId: 'u1',
    permission: 'edit',
    user: {
      id: 'u1',
      username: 'dr.alexander.maximilian.richardson.the.third',
      email: 'alex.richardson@example.com',
      fullName: 'Dr. Alexander Maximilian Richardson III',
    },
  },
  {
    id: 'c2',
    documentId: 'doc1',
    userId: 'u2',
    permission: 'view',
    user: {
      id: 'u2',
      username: 'professor.elizabeth.worthington.smith',
      email: 'liz.worthington@example.com',
      fullName: 'Professor Elizabeth Catherine Worthington-Smith',
    },
  },
];

const meta: Meta = {
  title: 'DocumentPage/CollaboratorsDropdown',
  component: CollaboratorsDropdown,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

type Story = StoryObj;

// Without injected collaborators the component fetches via useCollaborators(docId),
// which requires a running API — stories inject data through the `collaborators` prop.
export const Default: Story = {
  args: {},
};

export const OwnerWithCollaborators: Story = {
  args: {
    isOwner: true,
    collaborators: mockCollaborators,
  },
};

export const ViewOnlyCollaborators: Story = {
  args: {
    isOwner: false,
    collaborators: mockCollaborators,
  },
};

export const LongNames: Story = {
  args: {
    isOwner: true,
    collaborators: longNameCollaborators,
  },
};
