import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { Collaborator } from '@/types/api';

export const /**
   *
   */
  useCollaborators = (docId?: string, isCollaborator?: boolean) => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (isCollaborator || !docId) return;

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
    }, [docId, isCollaborator]);

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
      if (!docId || !email) return;
      try {
        await api.post(`/document/${docId}/collaborators`, { email });
        const res = await api.get(`/document/${docId}/collaborators`);
        setCollaborators(res.data || []);
      } catch (err) {
        console.error('Failed to add collaborator:', err);
        setError('Failed to add collaborator');
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
