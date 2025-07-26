import { useEffect } from 'react';

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
