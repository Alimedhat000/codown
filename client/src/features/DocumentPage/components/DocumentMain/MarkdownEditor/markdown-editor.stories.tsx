import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import * as Y from 'yjs';

import { MarkdownEditor } from './markdown-editor';

const meta: Meta<typeof MarkdownEditor> = {
  title: 'Features/DocumentPage/MarkdownEditor',
  component: MarkdownEditor,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof MarkdownEditor>;

/**
 * The provider stub replaces the live websocket (D6 seam); awareness is
 * left undefined, which the editor tolerates by skipping presence features.
 */
const stubProvider = {
  destroy: () => {},
};

const makeYText = (initial = '') => {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText('content');
  if (initial) ytext.insert(0, initial);
  return ytext;
};

export const Editable: Story = {
  render: () => (
    <div className="h-96">
      <MarkdownEditor
        ytext={makeYText('# Hello\n\nSome markdown **content**.')}
        provider={stubProvider}
        onScroll={() => {}}
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Status bar must reflect the live view (non-zero length) — guards
    // against the toolbar/status receiving a stale null view on mount.
    await canvas.findByText(/3 lines/i);
    await expect(canvas.getByText(/length:/i).textContent).toMatch(
      /length: (?!0\b)\d+/i,
    );
  },
};

export const ReadOnly: Story = {
  render: () => (
    <div className="h-96">
      <MarkdownEditor
        ytext={makeYText('Read-only document body.')}
        provider={stubProvider}
        onScroll={() => {}}
        isReadOnly
      />
    </div>
  ),
};

export const EmptyDocument: Story = {
  render: () => (
    <div className="h-96">
      <MarkdownEditor
        ytext={makeYText()}
        provider={stubProvider}
        onScroll={() => {}}
      />
    </div>
  ),
};
