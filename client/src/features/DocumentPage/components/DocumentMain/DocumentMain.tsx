import 'highlight.js/styles/github-dark.css';
import { useEffect } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { useCollab } from '@/hooks/useCollab';

import { MarkdownEditor } from './MarkdownEditor';
import { MarkdownPreview } from './MarkdownPreview';

export function DocumentMain({
  docId,
  mode,
  doc,
  setDoc,
}: {
  docId: string | undefined;
  mode: EditorMode;
  doc: DocumentData;
  setDoc: (doc: DocumentData) => void;
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
    <div className="flex flex-col h-full w-full bg-surface text-white">
      <div className={`flex flex-1 gap-0 md:gap-4 overflow-auto `}>
        {(mode === 'edit' || mode === 'both') && (
          <div
            className={`flex-1 min-w-0 h-full overflow-hidden  last:border-r-0 p-2 md:p-4 ${
              mode === 'both' ? 'rounded-l-lg' : 'rounded-lg'
            }`}
          >
            <div className="overflow-auto h-full">
              <MarkdownEditor ytext={ytext} provider={provider} />
            </div>
          </div>
        )}

        {(mode === 'view' || mode === 'both') && (
          <div
            className={`flex-1 min-w-0 h-full  bg-neutral-800 p-2 md:p-4 ${
              mode === 'both' ? 'rounded-r-lg' : 'rounded-lg'
            }`}
          >
            <MarkdownPreview content={text} />
          </div>
        )}
      </div>
    </div>
  );
}
