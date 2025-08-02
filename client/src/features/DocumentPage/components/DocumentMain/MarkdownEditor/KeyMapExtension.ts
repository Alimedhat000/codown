import { EditorView } from 'codemirror';

export const markdownCommands = {
  toggleBold: (view: EditorView) => {
    const { state } = view;
    const { from, to } = state.selection.main;
    const selectedText = state.doc.sliceString(from, to);

    if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
      // Remove bold formatting
      const newText = selectedText.slice(2, -2);
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from, head: from + newText.length },
      });
    } else {
      // Add bold formatting
      const newText = `**${selectedText}**`;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + 2, head: from + 2 + selectedText.length },
      });
    }
    return true;
  },

  toggleItalic: (view: EditorView) => {
    const { state } = view;
    const { from, to } = state.selection.main;
    const selectedText = state.doc.sliceString(from, to);

    if (
      selectedText.startsWith('*') &&
      selectedText.endsWith('*') &&
      !selectedText.startsWith('**')
    ) {
      // Remove italic formatting
      const newText = selectedText.slice(1, -1);
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from, head: from + newText.length },
      });
    } else {
      // Add italic formatting
      const newText = `*${selectedText}*`;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + 1, head: from + 1 + selectedText.length },
      });
    }
    return true;
  },

  toggleStrikethrough: (view: EditorView) => {
    const { state } = view;
    const { from, to } = state.selection.main;
    const selectedText = state.doc.sliceString(from, to);

    if (selectedText.startsWith('~~') && selectedText.endsWith('~~')) {
      // Remove strikethrough formatting
      const newText = selectedText.slice(2, -2);
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from, head: from + newText.length },
      });
    } else {
      // Add strikethrough formatting
      const newText = `~~${selectedText}~~`;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + 2, head: from + 2 + selectedText.length },
      });
    }
    return true;
  },

  insertLink: (view: EditorView) => {
    const { state } = view;
    const { from, to } = state.selection.main;
    const selectedText = state.doc.sliceString(from, to);
    const linkText = selectedText || 'link text';
    const newText = `[${linkText}](url)`;

    view.dispatch({
      changes: { from, to, insert: newText },
      selection: {
        anchor: from + linkText.length + 3,
        head: from + linkText.length + 6,
      },
    });
    return true;
  },

  insertCode: (view: EditorView) => {
    const { state } = view;
    const { from, to } = state.selection.main;
    const selectedText = state.doc.sliceString(from, to);

    if (selectedText.includes('\n')) {
      // Multi-line: use code block
      const newText = `\`\`\`\n${selectedText}\n\`\`\``;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + 4, head: from + 4 + selectedText.length },
      });
    } else {
      // Single line: use inline code
      const newText = `\`${selectedText}\``;
      view.dispatch({
        changes: { from, to, insert: newText },
        selection: { anchor: from + 1, head: from + 1 + selectedText.length },
      });
    }
    return true;
  },
};
