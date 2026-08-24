import { useEffect } from 'react';

import { DocumentData } from '@/types/api';

/**
 * Interval autosave hook: calls saveFn on a fixed interval.
 *
 * @param saveFn - Persist callback invoked on every tick.
 * @param doc - Document draft watched by the effect; any identity change
 *   resets the timer, so a save fires intervalMs after the last change
 *   rather than on a fixed global schedule.
 * @param intervalMs - Delay between ticks in ms. Defaults to 5000.
 */
export function useAutoSave(
  saveFn: () => void,
  doc: DocumentData,
  intervalMs = 5000,
) {
  useEffect(() => {
    const interval = setInterval(() => {
      saveFn();
    }, intervalMs);
    return () => clearInterval(interval);
  }, [saveFn, doc, intervalMs]);
}
