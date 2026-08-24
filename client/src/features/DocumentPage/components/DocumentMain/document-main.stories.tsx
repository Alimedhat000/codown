import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import type { DocumentData } from '@/types/api';

import { DocumentMain } from './document-main';

const meta: Meta<typeof DocumentMain> = {
  title: 'Features/DocumentPage/DocumentMain',
  component: DocumentMain,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DocumentMain>;

// useCollab connects to the dev collaboration server in the background;
// connection failures are non-fatal — the editor renders with an empty doc.
const mockDoc: DocumentData = {
  id: 'story-doc',
  title: 'Storybook Document',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const EditMode: Story = {
  args: {
    docId: 'story-doc',
    mode: 'edit',
    doc: mockDoc,
    setDoc: fn(),
  },
};

export const ViewMode: Story = {
  args: {
    docId: 'story-doc',
    mode: 'view',
    doc: mockDoc,
    setDoc: fn(),
  },
};

export const ReadOnly: Story = {
  args: {
    docId: 'story-doc',
    mode: 'edit',
    doc: mockDoc,
    setDoc: fn(),
    isReadOnly: true,
  },
};
