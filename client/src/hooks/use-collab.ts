import { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';

import { env } from '@/config/env';
import { getAccessToken } from '@/utils/token';

/**
 * Factory contract for creating the collaboration provider.
 * The default builds a live HocuspocusProvider; tests/stories may supply
 * an offline or stubbed adapter instead.
 */
export type CollabProviderFactory = (
  options: ConstructorParameters<typeof HocuspocusProvider>[0] & {
    url: string;
    name: string;
    document: Y.Doc;
  },
) => { destroy: () => void };

const defaultProviderFactory: CollabProviderFactory = (options) =>
  new HocuspocusProvider(options);

/**
 * Yjs collaboration session for a document id: creates a Y.Doc plus a provider
 * (live websocket by default), mirrors ytext into React text state, and
 * destroys everything on docId change/unmount.
 *
 * @param docId — room/document id to join.
 * @param createProvider — optional provider factory override for tests/stories.
 */
export function useCollab(
  docId: string | undefined,
  createProvider: CollabProviderFactory = defaultProviderFactory,
) {
  const [text, setText] = useState('');
  const [isReady, setIsReady] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const providerRef = useRef<ReturnType<CollabProviderFactory> | null>(null);

  useEffect(() => {
    if (!docId) return;

    const ydoc = new Y.Doc();
    const provider = createProvider({
      url: env.Socket_URL, // Hocuspocus server URL
      name: docId, // Room/document ID
      document: ydoc,
      token: getAccessToken(), // Required by the server's onAuthenticate hook
    });

    const ytext = ydoc.getText('content');

    ydocRef.current = ydoc;
    ytextRef.current = ytext;
    providerRef.current = provider;

    const updateHandler = () => setText(ytext.toString());
    ytext.observe(updateHandler);
    setText(ytext.toString());
    // Refs don't trigger renders; for a fresh (empty) document the initial
    // setText('') is a no-op and no ytext update ever fires, so without this
    // transition the editor never mounts and the spinner shows forever.
    setIsReady(true);

    return () => {
      ytext.unobserve(updateHandler);
      provider.destroy(); // cleaner than disconnect()
      ydoc.destroy();
      ydocRef.current = null;
      ytextRef.current = null;
      providerRef.current = null;
      setIsReady(false);
    };
  }, [docId, createProvider]);

  return {
    text,
    isReady,
    ydoc: ydocRef.current,
    ytext: ytextRef.current,
    provider: providerRef.current,
  };
}
