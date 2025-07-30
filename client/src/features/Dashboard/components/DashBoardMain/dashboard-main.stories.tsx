import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router';

import type { Document } from '@/types/api';

import DashboardMain from './dashboard-main';

const mockDocuments: Document[] = [
  {
    id: 'doc1',
    title: 'Zebra Project',
    createdAt: new Date('2025-07-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-05T12:00:00Z').toISOString(),
    pinned: true,
  },
  {
    id: 'doc2',
    title: 'Alpha Notes',
    createdAt: new Date('2025-07-02T09:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-04T13:00:00Z').toISOString(),
    pinned: false,
  },
  {
    id: 'doc3',
    title: 'Meeting Notes 3',
    createdAt: new Date('2025-07-03T08:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-06T14:00:00Z').toISOString(),
    pinned: false,
  },
  {
    id: 'doc4',
    title: '',
    createdAt: new Date('2025-07-04T07:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-07T15:00:00Z').toISOString(),
    pinned: false,
  },
  {
    id: 'doc5',
    title: 'Beta Plan',
    createdAt: new Date('2025-07-05T06:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-08T16:00:00Z').toISOString(),
    pinned: true,
  },
  {
    id: 'doc6',
    title: 'Gamma Report',
    createdAt: new Date('2025-07-06T05:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-09T17:00:00Z').toISOString(),
    pinned: false,
  },
  {
    id: 'doc7',
    title: '',
    createdAt: new Date('2025-07-07T04:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-10T18:00:00Z').toISOString(),
    pinned: false,
  },
  {
    id: 'doc8',
    title: 'Omega Design',
    createdAt: new Date('2025-07-08T03:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-11T19:00:00Z').toISOString(),
    pinned: true,
  },
  {
    id: 'doc9',
    title: 'Delta Memo',
    createdAt: new Date('2025-07-09T02:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-12T20:00:00Z').toISOString(),
    pinned: false,
  },
  {
    id: 'doc10',
    title: 'Epsilon Tasks',
    createdAt: new Date('2025-07-10T01:00:00Z').toISOString(),
    updatedAt: new Date('2025-07-13T21:00:00Z').toISOString(),
    pinned: false,
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
