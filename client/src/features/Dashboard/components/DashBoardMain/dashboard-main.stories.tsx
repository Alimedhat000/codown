import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';

import type { Document } from '@/types/api';

import DashboardMain from './dashboard-main';

const mockDocuments: Document[] = [
  {
    id: 'doc1abcdefgh',
    title: 'Project Plan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'doc2ijklmnop',
    title: 'Meeting Notes 3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
  {
    id: 'doc3qrstuvwx',
    title: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
  {
    id: 'doc1abcdefgh',
    title: 'Project Plan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'doc2ijklmnop',
    title: 'Meeting Notes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
  {
    id: 'doc3qrstuvwx',
    title: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
  {
    id: 'doc1abcdefgh',
    title: 'Project Plan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: true,
  },
  {
    id: 'doc2ijklmnop',
    title: 'Meeting Notes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
  {
    id: 'doc3qrstuvwx',
    title: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
  },
  {
    id: 'doc1abcdefgh',
    title: 'Project Plan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: true,
  },
];

const meta: Meta<typeof DashboardMain> = {
  title: 'Dashboard/DashboardMain',
  component: DashboardMain,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DashboardMain>;

export const Default: Story = {
  args: {
    documents: mockDocuments,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    documents: [],
    loading: true,
  },
};

export const OnlyPinned: Story = {
  args: {
    documents: mockDocuments.filter((d) => d.pinned),
    loading: false,
  },
};

export const NoDocuments: Story = {
  args: {
    documents: [],
    loading: false,
  },
};
