import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { Collaborator } from '@/types/api';

/**
 * Collaborator management: fetch, add by email and remove, with loading
 * and error state.
 *
 * @param docId - Document id whose collaborators are managed; fetching
 *   is skipped while undefined. Mount gating (owner/editor-only UI) lives
 *   in the caller; the fetch itself is allowed for any mounted docId.
 * @returns Collaborator list, loading/error flags and the add/remove
 *   actions. `addCollaborator` resolves to whether the collaborator was
 *   added.
 */
export const useCollaborators = (docId?: string) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) return;

    const fetchCollaborators = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/document/${docId}/collaborators`);
        setCollaborators(res.data || []);
      } catch (err) {
        console.error('Failed to fetch collaborators:', err);
        setError('Failed to load collaborators');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, [docId]);

  const removeCollaborator = async (userId: string) => {
    if (!docId) return;
    try {
      await api.delete(`/document/${docId}/collaborators/${userId}`);
      setCollaborators((prev) => prev.filter((c) => c.id !== userId));
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
      setError('Failed to remove collaborator');
    }
  };

  const addCollaborator = async (email: string) => {
    if (!docId || !email) return false;
    try {
      await api.post(`/document/${docId}/collaborators`, { email });
      const res = await api.get(`/document/${docId}/collaborators`);
      setCollaborators(res.data || []);
      return true;
    } catch (err) {
      console.error('Failed to add collaborator:', err);
      setError('Failed to add collaborator');
      return false;
    }
  };

  return {
    collaborators,
    loading,
    error,
    removeCollaborator,
    addCollaborator,
  };
};
