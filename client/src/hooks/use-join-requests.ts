import { useCallback, useEffect, useState } from 'react';

import {
  approveJoinRequest,
  getJoinRequests,
  rejectJoinRequest,
} from '@/lib/join-requests-api';
import { CollaborationRequest } from '@/types/api';

/**
 * Manages collaboration requests for a document.
 * Fetches pending requests when the user is not yet a collaborator and
 * exposes approve/reject actions that update the local list optimistically.
 *
 * @param docId — id of the document whose requests to manage.
 * @param isCollaborator — when true, request polling is skipped.
 * @returns requests list, loading flag, approve/reject actions and a refetch.
 */
export function useJoinRequests(
  docId?: string | null,
  isCollaborator?: boolean,
) {
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getJoinRequests(docId!);
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch join requests:', err);
      setError('Failed to load join requests');
    } finally {
      setLoading(false);
    }
  }, [docId]);

  /**
   * Approves a request by id and removes it from the local list.
   */
  const approve = async (requestId: string) => {
    await approveJoinRequest(docId!, requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  /**
   * Rejects a request by id and removes it from the local list.
   */
  const reject = async (requestId: string) => {
    await rejectJoinRequest(docId!, requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  useEffect(() => {
    if (isCollaborator) return;
    if (docId) fetchRequests();
  }, [docId, isCollaborator, fetchRequests]);

  return {
    requests,
    loading,
    error,
    approve,
    reject,
    refetch: fetchRequests,
  };
}
