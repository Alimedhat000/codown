import { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';

import { env } from '@/config/env';

export function useCollab(docId: string | undefined) {
  const [text, setText] = useState('');
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);

  useEffect(() => {
    if (!docId) return;

    const ydoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: env.Socket_URL, // Hocuspocus server URL
      name: docId, // Room/document ID
      document: ydoc,
    });

    const ytext = ydoc.getText('content');

    ydocRef.current = ydoc;
    ytextRef.current = ytext;
    providerRef.current = provider;

    const updateHandler = () => setText(ytext.toString());
    ytext.observe(updateHandler);
    setText(ytext.toString());

    return () => {
      ytext.unobserve(updateHandler);
      provider.destroy(); // cleaner than disconnect()
      ydoc.destroy();
      ydocRef.current = null;
      ytextRef.current = null;
      providerRef.current = null;
    };
  }, [docId]);

  return {
    text,
    ydoc: ydocRef.current,
    ytext: ytextRef.current,
    provider: providerRef.current,
  };
}
