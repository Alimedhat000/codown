import { useEffect, useState, useCallback } from 'react';

import { api } from '@/lib/api';
import { DocumentData } from '@/types/api';

/**
 * Fetches a document into doc plus an editedDoc draft, exposes save
 * (handleSave), permission flags (access) and loading/saving/error state.
 *
 * @param id - Document id to load; refetches whenever it changes and
 *   skips loading entirely when undefined.
 * @returns Server doc, editable draft with setter, save action, access
 *   flags and loading/saving/error state.
 */
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api
      .get(`/document/${id}`)
      .then((res) => {
        setDoc(res.data);
        setEditedDoc(res.data);
        setAccess(res.data.access);
      })
      .catch((err) => {
        console.error('Failed to fetch document:', err);
        setError('Failed to load document');
        setAccess(null); // ensure we don’t reuse old access
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleSave = useCallback(async () => {
    if (!id || !editedDoc) return;
    try {
      setSaving(true);
      setError(null);
      // Content is owned by Yjs sync; REST persists metadata only (issue #47).
      await api.put(`/document/${id}`, {
        title: editedDoc.title,
        isPublic: editedDoc.isPublic,
      });
      setDoc(editedDoc);
    } catch (err) {
      console.error('Failed to save document:', err);
      setError('Failed to save document');
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
    error,
  };
}
