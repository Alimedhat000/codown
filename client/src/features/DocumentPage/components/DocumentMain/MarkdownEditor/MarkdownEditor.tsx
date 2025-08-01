import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { useEffect, useRef } from 'react';
import { yCollab } from 'y-codemirror.next';
import * as Y from 'yjs';

import { editorExtensions } from './EditorExtensions';
import { MyTheme } from './EditorTheme';
import { MarkdownToolbar } from './MarkdownToolbar';

export function MarkdownEditor({
  ytext,
  provider,
}: {
  ytext: Y.Text | null;
  provider: any;
}) {
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

    const state = EditorState.create({
      doc: ytext.toString() ? ytext.toString() : '',
      extensions: [basicSetup, ...editorExtensions, yCollabExtension, MyTheme],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [ytext, provider]);
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
      {/* TODO: This is a Place hodlder for the StatusBar */}
      {/* <MarkdownToolbar
        view={viewRef.current}
        className="absolute bottom-0 left-0 w-full z-11"
      /> */}
    </div>
  );
}
