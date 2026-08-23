import { useEffect, useState, useCallback } from 'react';

import { api } from '@/lib/api';
import { DocumentData } from '@/types/api';

export function useDocument(id?: string) {
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [editedDoc, setEditedDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [access, setAccess] = useState<{
    isOwner: boolean;
    isCollaborator: boolean;
    permission: 'view' | 'edit';
  } | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    api
      .get(`/document/${id}`)
      .then((res) => {
        setDoc(res.data);
        setEditedDoc(res.data);
        setAccess(res.data.access);
      })
      .catch((err) => {
        console.error('Failed to fetch document:', err);
        setAccess(null); // ensure we don’t reuse old access
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    try {
      setSaving(true);
      await api.put(`/document/${id}`, editedDoc);
      setDoc(editedDoc);
    } catch (err) {
      console.error('Failed to save document:', err);
    } finally {
      setSaving(false);
    }
  }, [id, editedDoc]);

  return {
    doc,
    editedDoc,
    setEditedDoc,
    loading,
    saving,
    handleSave,
    access,
  };
}
