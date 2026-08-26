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

/**
 * Provider stub seeding enough content that both split panes overflow and
 * can actually scroll (the short default seed cannot).
 */
const longProviderFactory: CollabProviderFactory = (options) => {
  const ytext = options.document.getText('content');
  if (!ytext.length) {
    const paragraphs = Array.from(
      { length: 120 },
      (_, i) =>
        `\n\nParagraph ${i + 1}: lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    ).join('');
    ytext.insert(0, `# Long Document${paragraphs}`);
  }
  return { destroy: () => {} };
};

/**
 * Resolves after n animation frames so effects and rAF callbacks have run.
 */
const rafFrames = (n: number) =>
  new Promise<void>((resolve) => {
    const step = () => (--n <= 0 ? resolve() : requestAnimationFrame(step));
    requestAnimationFrame(step);
  });

/**
 * Resolves on the element's next scroll event; rejects after timeoutMs so a
 * swallowed mirror update fails fast instead of hanging the run.
 */
const nextScrollEvent = (el: HTMLElement, timeoutMs = 1000) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      el.removeEventListener('scroll', onScroll);
      reject(new Error(`no scroll event within ${timeoutMs}ms`));
    }, timeoutMs);
    const onScroll = () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', onScroll);
      resolve();
    };
    el.addEventListener('scroll', onScroll);
  });

const renderSplitWithLongDoc: Story['render'] = function RenderedStory() {
  return (
    <div className="h-96">
      <DocumentMain
        docId="story-doc-long"
        mode="both"
        doc={mockDoc}
        setDoc={fn()}
        createProvider={longProviderFactory}
      />
    </div>
  );
};

/** Enables synced scrolling via the handle overlay button. */
async function enableSyncScroll(canvasElement: HTMLElement) {
  const toggle = canvasElement.querySelector(
    '[data-panel-resize-handle-id] div.absolute',
  ) as HTMLElement | null;
  if (!toggle) throw new Error('scroll-sync toggle not found');
  toggle.click();
  await rafFrames(3);
}

export const SplitSyncMirrorsScroll: Story = {
  render: renderSplitWithLongDoc,
  play: async ({ canvasElement }) => {
    await enableSyncScroll(canvasElement);
    const editor = canvasElement
      .querySelector('.cm-editor')
      ?.closest('div.custom-scrollbar.overflow-y-scroll') as HTMLElement;
    const preview = canvasElement.querySelector(
      '.markdown-previewer',
    ) as HTMLElement;

    // Editor -> preview. Expectations are computed against live geometry:
    // CodeMirror's scrollHeight can still grow during deep scrolls.
    const edMax = editor.scrollHeight - editor.clientHeight;
    const pvMax = preview.scrollHeight - preview.clientHeight;

    editor.scrollTop = edMax * 0.4;
    await nextScrollEvent(preview);
    await rafFrames(2);
    expect(
      Math.abs(
        preview.scrollTop -
          (editor.scrollTop / (editor.scrollHeight - editor.clientHeight)) *
            (preview.scrollHeight - preview.clientHeight),
      ),
    ).toBeLessThan(pvMax * 0.05);

    // Preview -> editor
    const pvMax2 = preview.scrollHeight - preview.clientHeight;
    preview.scrollTop = pvMax2 * 0.8;
    await nextScrollEvent(editor);
    await rafFrames(2);
    expect(
      Math.abs(
        editor.scrollTop -
          (preview.scrollTop / (preview.scrollHeight - preview.clientHeight)) *
            (editor.scrollHeight - editor.clientHeight),
      ),
    ).toBeLessThan(edMax * 0.05);
  },
};

export const SplitSyncSurvivesLateEcho: Story = {
  render: renderSplitWithLongDoc,
  play: async ({ canvasElement }) => {
    await enableSyncScroll(canvasElement);
    const editor = canvasElement
      .querySelector('.cm-editor')
      ?.closest('div.custom-scrollbar.overflow-y-scroll') as HTMLElement;
    const preview = canvasElement.querySelector(
      '.markdown-previewer',
    ) as HTMLElement;

    const edMax = editor.scrollHeight - editor.clientHeight;
    const pvMax = preview.scrollHeight - preview.clientHeight;

    // A normal mirrored scroll leaves both panes aligned...
    editor.scrollTop = edMax * 0.5;
    await nextScrollEvent(preview);
    await rafFrames(2);

    // ...then the mirrored pane's own scroll event arrives one frame LATE
    // (Firefox delivers it after the syncing flag was already reset). It must
    // be recognized as an echo, not consume the suppression state.
    preview.dispatchEvent(new Event('scroll'));

    // And a genuine editor scroll in the SAME task must still be mirrored.
    editor.scrollTop = edMax * 0.75;
    await rafFrames(5);
    expect(
      Math.abs(
        preview.scrollTop -
          (editor.scrollTop / (editor.scrollHeight - editor.clientHeight)) *
            (preview.scrollHeight - preview.clientHeight),
      ),
    ).toBeLessThan(pvMax * 0.05);
  },
};
