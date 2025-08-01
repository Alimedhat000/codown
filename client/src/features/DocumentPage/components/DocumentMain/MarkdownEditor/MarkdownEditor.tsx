import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { EditorView, basicSetup } from 'codemirror';
import { useEffect, useRef, useState } from 'react';
import { yCollab } from 'y-codemirror.next';
import * as Y from 'yjs';

import { editorExtensions } from './EditorExtensions';
import { MyTheme } from './EditorTheme';
import { markdownCommands } from './KeyMapExtension';
import { MarkdownStatusBar } from './MarkdownStatusBar';
import { MarkdownToolbar } from './MarkdownToolbar';
import { createAdvancedSpellcheckExtension } from './spellCheck';

const markdownKeymap = keymap.of([
  indentWithTab,
  { key: 'Mod-b', run: markdownCommands.toggleBold },
  { key: 'Mod-i', run: markdownCommands.toggleItalic },
  { key: 'Mod-Shift-x', run: markdownCommands.toggleStrikethrough },
  { key: 'Mod-k', run: markdownCommands.insertLink },
  { key: 'Mod-e', run: markdownCommands.insertCode },
]);

export function MarkdownEditor({
  ytext,
  provider,
}: {
  ytext: Y.Text | null;
  provider: any;
}) {
  const [spellcheck, setSpellcheck] = useState(false);
  const [useTabs, setUseTabs] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current || !ytext || !provider) return;

    // Clean up previous editor if remounting
    if (viewRef.current) {
      viewRef.current.destroy();
    }

    // Create the collaboration extension
    const yCollabExtension = yCollab(ytext, provider.awareness);
    const indentation = indentUnit.of(useTabs ? '\t' : ' '.repeat(4));

    const spellcheckExtensions = spellcheck
      ? [createAdvancedSpellcheckExtension()]
      : [];

    const state = EditorState.create({
      doc: ytext.toString() ? ytext.toString() : '',
      extensions: [
        basicSetup,
        ...editorExtensions,
        yCollabExtension,
        MyTheme,
        indentation,
        markdownKeymap, // Add the markdown shortcuts
        ...spellcheckExtensions,
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [ytext, provider, useTabs, spellcheck]); // Add spellcheck to dependencies

  return (
    <div className="relative w-full flex-1 py-10 ">
      <MarkdownToolbar
        view={viewRef.current}
        className="absolute top-0 left-0 w-full z-10"
      />

      <div
        className="custom-scrollbar h-full overflow-y-scroll"
        ref={editorRef}
      />
      <MarkdownStatusBar
        view={viewRef.current}
        className="absolute bottom-0 left-0 w-full z-11"
        useTabs={useTabs}
        setUseTabs={setUseTabs}
        spellcheck={spellcheck}
        setSpellcheck={setSpellcheck}
      />
    </div>
  );
}
