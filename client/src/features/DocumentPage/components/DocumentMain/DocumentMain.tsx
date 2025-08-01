import 'highlight.js/styles/github-dark.css';
import { useEffect } from 'react';

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
      <div className={`flex h-full `}>
        {(mode === 'edit' || mode === 'both') && (
          <MarkdownEditor ytext={ytext} provider={provider} />
        )}

        {(mode === 'view' || mode === 'both') && (
          <MarkdownPreview content={text} />
        )}
      </div>
    </div>
  );
}
