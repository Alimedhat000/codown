import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';

import type { CollabProviderFactory } from '@/hooks/use-collab';
import type { DocumentData } from '@/types/api';

import { DocumentMain } from './document-main';

const meta: Meta<typeof DocumentMain> = {
  title: 'Features/DocumentPage/DocumentMain',
  component: DocumentMain,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof DocumentMain>;

const mockDoc: DocumentData = {
  id: 'story-doc',
  title: 'Storybook Document',
  content: '',
  authorId: 'story-author',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

/**
 * Offline provider stub: seeds the shared Y.Doc so the editor/preview render
 * real content without a websocket (D6 seam via the createProvider prop).
 * Module-level so the factory identity stays stable across renders.
 */
const seededProviderFactory: CollabProviderFactory = (options) => {
  const ytext = options.document.getText('content');
  if (!ytext.length) {
    ytext.insert(0, '# Storybook Document\n\nSynced without a websocket.');
  }
  return { destroy: () => {} };
};

const renderWith = (
  mode: 'edit' | 'view',
  isReadOnly?: boolean,
): Story['render'] =>
  function RenderedStory() {
    return (
      <div className="h-96">
        <DocumentMain
          docId="story-doc"
          mode={mode}
          doc={mockDoc}
          setDoc={fn()}
          isReadOnly={isReadOnly}
          createProvider={seededProviderFactory}
        />
      </div>
    );
  };

export const EditMode: Story = {
  render: renderWith('edit'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The seeded ytext must reach the editor — proves the provider stub
    // actually feeds collaboration state instead of an empty doc.
    await canvas.findByText(/Synced without a websocket/i);
  },
};

export const ViewMode: Story = {
  render: renderWith('view'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Preview renders the seeded markdown as a heading + paragraph.
    await canvas.findByRole('heading', { name: /storybook document/i });
    await canvas.findByText(/synced without a websocket/i);
  },
};

export const ReadOnly: Story = {
  render: renderWith('edit', true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(/synced without a websocket/i);
    // Read-only: toolbar must not mount.
    await expect(canvas.queryByTitle('Bold')).toBeNull();
  },
};
