import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/api';

export const useShareLink = (
  docId?: string,
  permission?: 'view' | 'edit',
  isCollaborator?: boolean,
) => {
  const [shareLink, setShareLink] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShareLink = useCallback(
    async (permission: 'view' | 'edit' = 'view') => {
      if (!docId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/document/${docId}/share-link`, {
          params: { permission },
        });
        setShareLink(res.data?.url ?? '');
      } catch (err: any) {
        setError('Failed to fetch share link');
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [docId],
  );

  useEffect(() => {
    if (!isCollaborator) {
      fetchShareLink(permission);
    } // Fetch on mount with default permission
  }, [docId, permission, isCollaborator, fetchShareLink]);

  return { shareLink, loading, error, refresh: fetchShareLink };
};
