import { useEffect } from 'react';

import { DocumentData } from '@/types/api';

/**
 * Interval autosave hook. NOTE: the effect re-runs on every doc/saveFn identity change, resetting the timer — saves fire intervalMs after the last change.
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
