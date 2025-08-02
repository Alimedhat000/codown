import 'highlight.js/styles/github-dark.css';
import { useEffect } from 'react';
import { LuGripVertical } from 'react-icons/lu';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { Spinner } from '@/components/ui/Spinner';
import { useCollab } from '@/hooks/useCollab';
import { cn } from '@/utils/cn';

import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';

export function DocumentMain({
  docId,
  mode,
  doc,
  setDoc,
  className,
}: {
  docId: string | undefined;
  mode: EditorMode;
  doc: DocumentData;
  setDoc: (doc: DocumentData) => void;
  className?: string;
}) {
  const { text, ydoc, ytext, provider } = useCollab(docId);

  useEffect(() => {
    if (text !== doc.content) {
      setDoc({ ...doc, content: text });
    }
  }, [text, doc, setDoc]);

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
      <PanelGroup direction="horizontal" className="h-full w-full">
        {(mode === 'edit' || mode === 'both') && (
          <>
            <Panel defaultSize={50} minSize={35} className="flex h-full">
              <MarkdownEditor ytext={ytext} provider={provider} />
            </Panel>
            {mode === 'both' && (
              <PanelResizeHandle className="w-4 flex items-center justify-center bg-border hover:bg-border-hover active:bg-border-hover cursor-col-resize transition">
                <LuGripVertical className="w-4 h-4 text-foreground" />
              </PanelResizeHandle>
            )}
          </>
        )}

        {mode === 'both' && (
          <Panel defaultSize={50} minSize={15}>
            <MarkdownPreview content={text} />
          </Panel>
        )}

        {mode === 'view' && (
          <Panel
            defaultSize={100}
            minSize={35}
            className="md:max-w-[800px] mx-auto"
          >
            <MarkdownPreview content={text} />
          </Panel>
        )}
      </PanelGroup>
    </div>
  );
}
