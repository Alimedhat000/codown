import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '@/lib/api';

/**
 * Fetches (and can refresh) a share link for a permission level;
 * surfaces shareLink, loading and error. Concurrent fetches resolve
 * last-request-wins, so a stale response never overwrites a newer one.
 *
 * @param docId - Document id whose share link is fetched; fetching is
 *   skipped while undefined.
 * @param permission - Permission level used for the automatic fetch;
 *   falls back to 'view' while undefined.
 * @param isCollaborator - When true, the automatic fetch effect is
 *   skipped.
 * @returns Share link URL, loading/error flags and a manual refresh
 *   requiring the permission to fetch.
 */
export const useShareLink = (
  docId?: string,
  permission?: 'view' | 'edit',
  isCollaborator?: boolean,
) => {
  const [shareLink, setShareLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const fetchShareLink = useCallback(
    async (permission: 'view' | 'edit') => {
      if (!docId) return;
      const requestId = ++requestRef.current;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/document/${docId}/share-link`, {
          params: { permission },
        });
        if (requestId !== requestRef.current) return;
        setShareLink(res.data?.url ?? '');
      } catch (err: any) {
        if (requestId !== requestRef.current) return;
        setError('Failed to fetch share link');
        console.error(err);
      } finally {
        if (requestId === requestRef.current) setLoading(false);
      }
    },
    [docId],
  );

  useEffect(() => {
    // Fetch on mount and whenever the selected permission changes
    if (!isCollaborator && docId) {
      fetchShareLink(permission ?? 'view');
    }
  }, [docId, permission, isCollaborator, fetchShareLink]);

  return { shareLink, loading, error, refresh: fetchShareLink };
};
