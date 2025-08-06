import { useEffect, useState } from 'react';

import { api } from '@/lib/api';

export const getJoinRequests = async (docId: string) => {
  const res = await api.get(`/document/${docId}/requests`);
  return res.data;
};

export const approveJoinRequest = async (docId: string, requestId: string) => {
  const res = await api.post(
    `/document/${docId}/requests/${requestId}/approve`,
  );
  return res.data;
};

export const rejectJoinRequest = async (docId: string, requestId: string) => {
  const res = await api.delete(
    `/document/${docId}/requests/${requestId}/reject`,
  );
  return res.data;
};

export function useJoinRequests(docId: string) {
  const [requests, setRequests] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getJoinRequests(docId);
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch join requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (requestId: string) => {
    await approveJoinRequest(docId, requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const reject = async (requestId: string) => {
    await rejectJoinRequest(docId, requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  useEffect(() => {
    if (docId) fetchRequests();
  }, [docId]);

  return {
    requests,
    loading,
    approve,
    reject,
    refetch: fetchRequests,
  };
}
