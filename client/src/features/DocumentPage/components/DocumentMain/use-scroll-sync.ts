import { useCallback, useEffect, useRef } from 'react';

type PaneKey = 'editor' | 'preview';

/**
 * Race-free bidirectional scroll syncing between two panes.
 *
 * Mirrors scroll positions once per animation frame (latest wins) and
 * recognizes its own mirrored writes by position: an event whose target is
 * already at the last-written offset is an echo and is ignored. This replaces
 * timing-flag suppression, which browsers deliver in different orders
 * (Firefox dispatches the mirrored pane's scroll event after the reset frame,
 * swallowing every other genuine update).
 *
 * @param args - Hook arguments.
 * @param args.enabled - Mirrors only run while true.
 * @param args.editorRef - Scrollable editor container.
 * @param args.previewRef - Scrollable preview container.
 * @returns Stable scroll handlers to attach to each pane's container.
 */
export function useScrollSync(args: {
  /** Mirrors only run while true. */
  enabled: boolean;
  /** Scrollable editor container. */
  editorRef: React.RefObject<HTMLElement | null>;
  /** Scrollable preview container. */
  previewRef: React.RefObject<HTMLElement | null>;
}) {
  const { enabled, editorRef, previewRef } = args;
  const enabledRef = useRef(enabled);
  const lastWritten = useRef<Record<PaneKey, number>>({
    editor: Number.NaN,
    preview: Number.NaN,
  });
  const frameRef = useRef<number | null>(null);
  const pendingSource = useRef<PaneKey | null>(null);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      pendingSource.current = null;
      lastWritten.current = { editor: Number.NaN, preview: Number.NaN };
    }
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [enabled]);

  const applyMirror = useCallback(() => {
    frameRef.current = null;
    const source = pendingSource.current;
    pendingSource.current = null;
    if (!source || !enabledRef.current) return;

    const from = source === 'editor' ? editorRef.current : previewRef.current;
    const to = source === 'editor' ? previewRef.current : editorRef.current;
    if (!from || !to) return;

    const fromRange = from.scrollHeight - from.clientHeight;
    if (fromRange <= 0) return;

    const top =
      (from.scrollTop / fromRange) * (to.scrollHeight - to.clientHeight);
    lastWritten.current[source === 'editor' ? 'preview' : 'editor'] = top;
    to.scrollTop = top;
  }, [editorRef, previewRef]);

  const queueMirror = useCallback(
    (which: PaneKey) => {
      if (!enabledRef.current) return;
      const el = which === 'editor' ? editorRef.current : previewRef.current;
      if (!el) return;

      const written = lastWritten.current[which];
      if (!Number.isNaN(written) && Math.abs(el.scrollTop - written) < 1) {
        return;
      }

      pendingSource.current = which;
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(applyMirror);
      }
    },
    [editorRef, previewRef, applyMirror],
  );

  const handleEditorScroll = useCallback(
    () => queueMirror('editor'),
    [queueMirror],
  );
  const handlePreviewScroll = useCallback(
    () => queueMirror('preview'),
    [queueMirror],
  );

  return { handleEditorScroll, handlePreviewScroll };
}
