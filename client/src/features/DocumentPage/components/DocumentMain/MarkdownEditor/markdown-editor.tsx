import { indentWithTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { EditorView, basicSetup } from 'codemirror';
import { useEffect, useRef, useState } from 'react';
import { yCollab } from 'y-codemirror.next';
import * as Y from 'yjs';

import { useAuth } from '@/context/auth';
import { cn } from '@/utils/cn';
import { generateUserColor } from '@/utils/generate-user-color';

import { editorExtensions } from './editor-extensions';
import { MyTheme } from './editor-theme';
import { markdownCommands } from './key-map-extension';
import { MarkdownStatusBar } from './MarkdownStatusBar';
import { MarkdownToolbar } from './MarkdownToolbar';
import { createAdvancedSpellcheckExtension } from './spell-check';

const markdownKeymap = keymap.of([
  indentWithTab,
  { key: 'Mod-b', run: markdownCommands.toggleBold },
  { key: 'Mod-i', run: markdownCommands.toggleItalic },
  { key: 'Mod-Shift-x', run: markdownCommands.toggleStrikethrough },
  { key: 'Mod-k', run: markdownCommands.insertLink },
  { key: 'Mod-e', run: markdownCommands.insertCode },
]);

/**
 * CodeMirror 6 editor bound to Yjs collaborative types; routes local edits into ytext and applies remote updates.
 */
export function MarkdownEditor({
  ytext,
  provider,
  editorScrollRef,
  onScroll,
  syncScroll,
  isReadOnly,
}: {
  /** Shared Yjs text bound to the CodeMirror view. */
  ytext: Y.Text | null;
  /** Collaboration provider supplying awareness state. */
  provider: any;
  /** Ref receiving the scrollable editor element for scroll syncing. */
  editorScrollRef?: React.RefObject<HTMLDivElement | null>;
  /** Scroll handler attached while synced scrolling is enabled. */
  onScroll: () => void;
  /** Attaches the parent's scroll handler when true. */
  syncScroll?: boolean;
  /** Disables editing and hides toolbar/status controls when true. */
  isReadOnly?: boolean;
}) {
  const { user } = useAuth(); // Get current user

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

    if (user && provider.awareness) {
      provider.awareness.setLocalStateField('user', {
        name: user.username,
        id: user.id,
        email: user.email,
        avatar: user.avatarUrl,
        // You can add a color for the user's cursor/selection
        color: generateUserColor(user.id),
      });
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
        isReadOnly
          ? EditorView.editable.of(false)
          : EditorView.editable.of(true), // 👈 add this
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    if (editorScrollRef) {
      editorScrollRef.current = editorRef.current;
    }

    return () => {
      view.destroy();
    };
  }, [ytext, provider, useTabs, spellcheck, editorScrollRef, isReadOnly, user]); // Add spellcheck to dependencies

  useEffect(() => {
    if (!editorRef.current) return;

    const el = editorRef.current;

    if (syncScroll) {
      el.addEventListener('scroll', onScroll);
    }

    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [syncScroll, onScroll]);

  return (
    <div className={cn('relative w-full flex-1', { 'py-10': !isReadOnly })}>
      {!isReadOnly && (
        <MarkdownToolbar
          view={viewRef.current}
          className="absolute top-0 left-0 w-full z-9"
        />
      )}

      <div
        className="custom-scrollbar h-full overflow-y-scroll"
        ref={editorRef}
      />
      <MarkdownStatusBar
        view={viewRef.current}
        className="absolute bottom-0 left-0 w-full z-9"
        useTabs={useTabs}
        setUseTabs={setUseTabs}
        spellcheck={spellcheck}
        setSpellcheck={setSpellcheck}
      />
    </div>
  );
}
