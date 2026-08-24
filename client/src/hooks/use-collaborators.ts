import { useEffect, useState } from 'react';

import { api } from '@/lib/api';
import { Collaborator } from '@/types/api';

export const useCollaborators = (docId?: string, isCollaborator?: boolean) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isCollaborator || !docId) return;

    const fetchCollaborators = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/document/${docId}/collaborators`);
        setCollaborators(res.data || []);
      } catch (err) {
        console.error('Failed to fetch collaborators:', err);
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
    }
  };

  return {
    collaborators,
    loading,
    removeCollaborator,
    addCollaborator,
  };
};
