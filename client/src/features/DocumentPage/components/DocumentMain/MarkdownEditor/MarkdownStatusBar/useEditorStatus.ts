import { StateEffect } from '@codemirror/state';
import { EditorView } from 'codemirror';
import { useEffect, useState } from 'react';

export function useEditorStatus(view: EditorView | null) {
  const [status, setStatus] = useState({
    line: 1,
    column: 1,
    totalLines: 1,
    length: 0,
  });

  useEffect(() => {
    if (!view) return;

    const updateStatus = () => {
      const state = view.state;
      const pos = state.selection.main.head;
      const line = state.doc.lineAt(pos);

      setStatus({
        line: line.number,
        column: pos - line.from + 1,
        totalLines: state.doc.lines,
        length: state.doc.length,
      });
    };

    updateStatus();

    const listener = EditorView.updateListener.of((v) => {
      if (v.docChanged || v.selectionSet) updateStatus();
    });

    view.dispatch({
      effects: StateEffect.appendConfig.of(listener),
    });
  }, [view]);

  return status;
}
