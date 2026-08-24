import { history } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditorView } from 'codemirror';
import { expect, userEvent, within } from 'storybook/test';

import { MarkdownToolbar } from './markdown-toolbar';

const meta: Meta<typeof MarkdownToolbar> = {
  title: 'Features/DocumentPage/MarkdownToolbar',
  component: MarkdownToolbar,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof MarkdownToolbar>;

let currentView: EditorView | null = null;
const makeView = (doc: string) => {
  currentView = new EditorView({
    // history() is part of basicSetup in the real editor; required for undo
    state: EditorState.create({ doc, extensions: [history()] }),
  });
  return currentView;
};

export const Default: Story = {
  render: () => <MarkdownToolbar view={makeView('word')} />,
};

/** Clicking Bold wraps the selection with ** markers. */
export const AppliesBold: Story = {
  render: () => <MarkdownToolbar view={makeView('word')} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // select all text so the command has a target
    const view = currentView!;
    view.dispatch({
      selection: { anchor: 0, head: view.state.doc.length },
    });
    await userEvent.click(await canvas.findByTitle('Bold'));
    await expect(view.state.doc.toString()).toBe('**word**');
  },
};

export const UndoRestores: Story = {
  render: () => <MarkdownToolbar view={makeView('plain')} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const view = currentView!;
    view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
    await userEvent.click(await canvas.findByTitle('Bold'));
    await expect(view.state.doc.toString()).toBe('**plain**');
    await userEvent.click(await canvas.findByTitle('Undo'));
    await expect(view.state.doc.toString()).toBe('plain');
  },
};

export const NullViewRendersInert: Story = {
  render: () => <MarkdownToolbar view={null} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Buttons exist but clicking them must not throw without a view
    await userEvent.click(canvas.getByTitle('Bold'));
  },
};
