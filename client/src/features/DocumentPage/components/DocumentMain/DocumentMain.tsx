import 'highlight.js/styles/github-dark.css';
import { useEffect, useRef, useState } from 'react';
import { LuLink, LuUnlink } from 'react-icons/lu';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { Spinner } from '@/components/ui/Spinner';
import { useCollab } from '@/hooks/useCollab';
import { DocumentData } from '@/types/api';
import { cn } from '@/utils/cn';

import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';

export function DocumentMain({
  docId,
  mode,
  doc,
  setDoc,
  className,
  isReadOnly,
}: {
  docId: string | undefined;
  mode: EditorMode;
  doc: DocumentData | null;
  setDoc: (doc: DocumentData) => void;
  className?: string;
  isReadOnly?: boolean;
}) {
  const { text, ydoc, ytext, provider } = useCollab(docId);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);
  const [syncScroll, setSyncScroll] = useState(false);

  useEffect(() => {
    if (doc && text !== doc.content) {
      setDoc({ ...doc, content: text });
    }
  }, [text, doc, setDoc]);

  useEffect(() => {
    if (!syncScroll) return;

    const editorEl = editorScrollRef?.current;
    const previewEl = previewScrollRef?.current;

    if (!editorEl || !previewEl) return;

    // Get scroll percentage from editor
    const percent =
      editorEl.scrollTop / (editorEl.scrollHeight - editorEl.clientHeight);

    // Apply it to preview
    previewEl.scrollTop =
      percent * (previewEl.scrollHeight - previewEl.clientHeight);
  }, [syncScroll]);

  const handleEditorScroll = () => {
    if (!syncScroll) return;
    if (
      !syncScroll ||
      isSyncingRef.current ||
      !editorScrollRef.current ||
      !previewScrollRef.current
    ) {
      return;
    }

    isSyncingRef.current = true;

    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;

    const scrollRatio =
      editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
    preview.scrollTop =
      scrollRatio * (preview.scrollHeight - preview.clientHeight);

    // Use a shorter timeout and requestAnimationFrame
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  const handlePreviewScroll = () => {
    if (!syncScroll) return;

    if (
      !syncScroll ||
      isSyncingRef.current ||
      !editorScrollRef.current ||
      !previewScrollRef.current
    ) {
      return;
    }

    isSyncingRef.current = true;

    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;

    const scrollRatio =
      preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
    editor.scrollTop =
      scrollRatio * (editor.scrollHeight - editor.clientHeight);

    // Use a shorter timeout and requestAnimationFrame
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };
  if (!docId || !ydoc || !ytext || !provider) {
    return (
      <div className="flex items-center justify-center h-screen w-full text-muted">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full h-full bg-surface overflow-y-hidden text-white',
        className,
      )}
    >
      <PanelGroup
        direction="horizontal"
        className="h-full w-full overflow-y-hidden"
        autoSaveId="persistence"
      >
        {(mode === 'edit' || mode === 'both') && (
          <>
            <Panel defaultSize={50} minSize={35} className="flex h-full">
              <MarkdownEditor
                ytext={ytext}
                provider={provider}
                editorScrollRef={editorScrollRef}
                onScroll={handleEditorScroll}
                syncScroll={syncScroll}
                isReadOnly={isReadOnly}
              />
            </Panel>
            {mode === 'both' && (
              <PanelResizeHandle className="group relative w-2 flex items-center justify-center bg-border hover:bg-border-hover active:bg-border-hover cursor-col-resize transition">
                {/* Overlay Button */}
                <div
                  className="absolute z-8 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-header hover:bg-border p-4 rounded-full transition border border-border
               opacity-0 group-hover:opacity-100 cursor-pointer pointer-events-auto"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // Prevents the resize handle from being triggered
                    setSyncScroll(!syncScroll);
                    // console.log('changed the thing to ', !syncScroll);
                  }}
                  style={{ cursor: 'default' }} // <- force non-resize cursor
                >
                  {syncScroll ? (
                    <LuLink className="w-5 h-5" />
                  ) : (
                    <LuUnlink className="w-5 h-5" />
                  )}
                </div>
              </PanelResizeHandle>
            )}
          </>
        )}

        {mode === 'both' && (
          <Panel defaultSize={50} minSize={15} className="overflow-y-hidden">
            <MarkdownPreview
              content={text}
              previewScrollRef={previewScrollRef}
              onScroll={handlePreviewScroll}
              syncScroll={syncScroll}
              lastUpdated={doc?.updatedAt}
            />
          </Panel>
        )}

        {mode === 'view' && (
          <Panel
            defaultSize={100}
            minSize={35}
            className="md:max-w-[800px] mx-auto overflow-y-hidden"
          >
            <MarkdownPreview content={text} lastUpdated={doc?.updatedAt} />
          </Panel>
        )}
      </PanelGroup>
    </div>
  );
}
