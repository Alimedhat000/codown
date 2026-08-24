import { EditorState } from '@codemirror/state';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditorView } from 'codemirror';
import { expect, fn, userEvent, within } from 'storybook/test';

import { MarkdownStatusBar } from './markdown-status-bar';

const meta: Meta<typeof MarkdownStatusBar> = {
  title: 'Features/DocumentPage/MarkdownStatusBar',
  component: MarkdownStatusBar,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof MarkdownStatusBar>;

const setUseTabsFn = fn();
const setSpellcheckFn = fn();

// NOTE: never pass an EditorView through `args` — its circular internals
// send Storybook's JSON arg serialization into an infinite loop.

export const WithoutView: Story = {
  args: {
    view: null,
    useTabs: true,
    setUseTabs: setUseTabsFn,
    spellcheck: false,
    setSpellcheck: setSpellcheckFn,
  },
};

/** Clicking "Tab: 4" flips indentation mode even without a live view. */
export const TogglesIndentationMode: Story = {
  args: {
    view: null,
    useTabs: true,
    setUseTabs: setUseTabsFn,
    spellcheck: false,
    setSpellcheck: setSpellcheckFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText(/^tab: 4$/i));
    await expect(setUseTabsFn).toHaveBeenCalledWith(false);
  },
};

/** The first toggle control flips spellchecking. */
export const TogglesSpellcheck: Story = {
  args: {
    view: null,
    useTabs: true,
    setUseTabs: setUseTabsFn,
    spellcheck: false,
    setSpellcheck: setSpellcheckFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getAllByRole('button')[0]);
    await expect(setSpellcheckFn).toHaveBeenCalledWith(true);
  },
};

/** Smoke: renders live status against a real (unattached) editor view. */
export const WithLiveView: Story = {
  render: () => (
    <MarkdownStatusBar
      view={
        new EditorView({
          state: EditorState.create({ doc: 'hello world' }),
        })
      }
      useTabs
      setUseTabs={() => {}}
      spellcheck={false}
      setSpellcheck={() => {}}
    />
  ),
};
