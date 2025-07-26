import { useEffect, useState, useCallback } from 'react';

import { api } from '@/lib/api';

type DocumentData = { title: string; content: string };

export function useDocument(id?: string) {
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [editedDoc, setEditedDoc] = useState<DocumentData>({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/document/${id}`).then((res) => {
      setDoc(res.data);
      setEditedDoc(res.data);
      setLoading(false);
    });
  }, [id]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    try {
      setSaving(true);
      await api.put(`/document/${id}`, editedDoc);
      console.log(editedDoc);
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
  };
}
