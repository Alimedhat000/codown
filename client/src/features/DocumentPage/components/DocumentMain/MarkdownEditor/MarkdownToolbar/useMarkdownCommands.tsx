// hooks/useMarkdownCommands.ts
import { undo, redo } from '@codemirror/commands';
import { EditorSelection } from '@codemirror/state';
import { EditorView } from 'codemirror';

export function useMarkdownCommands(view: EditorView | null) {
  const runCommand = (
    before: string,
    after = before,
    prefixNewline = false,
  ) => {
    if (!view) return;
    const { state } = view;

    const transaction = state.changeByRange((range) => {
      const { from, to } = range;
      const selected = state.doc.slice(from, to).toString();
      const insert = `${prefixNewline ? '\n' : ''}${before}${selected}${after}`;

      const newFrom = from + (prefixNewline ? 1 : 0) + before.length;
      const newTo = to + (prefixNewline ? 1 : 0) + before.length;

      return {
        changes: { from, to, insert },
        range: EditorSelection.range(newFrom, newTo),
      };
    });

    view.dispatch(transaction);
    view.focus();
  };

  const runOrderedListCommand = () => {
    if (!view) return;

    const { state } = view;
    const { from } = state.selection.main;

    // Get the current line
    const line = state.doc.lineAt(from);
    const lineText = line.text;

    // Check if we're at the start of a line or need to create a new line
    const isAtLineStart = from === line.from;
    const needsNewline = !isAtLineStart || lineText.trim() !== '';

    // Find what number this should be by looking at previous lines
    let listNumber = 1;
    let currentLine = state.doc.line(line.number + 1);

    // Look backwards to find the last ordered list item
    while (currentLine.number > 1) {
      const prevLine = state.doc.line(currentLine.number - 1);
      const match = prevLine.text.match(/^\s*(\d+)\.\s/);
      if (match) {
        listNumber = parseInt(match[1]) + 1;
        break;
      }
      // If we hit a non-list line, stop looking
      if (
        prevLine.text.trim() !== '' &&
        !prevLine.text.match(/^\s*(\d+)\.\s/)
      ) {
        break;
      }
      currentLine = prevLine;
    }

    const transaction = state.changeByRange((range) => {
      const { from, to } = range;
      const selected = state.doc.slice(from, to).toString();
      const prefix = needsNewline ? '\n' : '';
      const insert = `${prefix}${listNumber}. ${selected}`;

      const newFrom = from + prefix.length + `${listNumber}. `.length;
      const newTo = newFrom + selected.length;

      return {
        changes: { from, to, insert },
        range: EditorSelection.range(newFrom, newTo),
      };
    });

    view.dispatch(transaction);
    view.focus();
  };

  const handleUndo = () => view && undo(view) && view.focus();
  const handleRedo = () => view && redo(view) && view.focus();

  return { runCommand, runOrderedListCommand, handleUndo, handleRedo };
}
