import { api } from '@/lib/api';

/**
 * Fetches all pending collaboration requests for a document.
 * @param docId — id of the document whose requests to fetch.
 * @returns list of pending collaboration requests.
 */
export const getJoinRequests = async (docId: string) => {
  const res = await api.get(`/document/${docId}/requests`);
  return res.data;
};

/**
 * Approves a pending collaboration request, granting the requester access.
 * @param docId — id of the document the request targets.
 * @param requestId — id of the request to approve.
 */
export const approveJoinRequest = async (docId: string, requestId: string) => {
  const res = await api.post(
    `/document/${docId}/requests/${requestId}/approve`,
  );
  return res.data;
};

/**
 * Rejects a pending collaboration request.
 * @param docId — id of the document the request targets.
 * @param requestId — id of the request to reject.
 */
export const rejectJoinRequest = async (docId: string, requestId: string) => {
  const res = await api.delete(
    `/document/${docId}/requests/${requestId}/reject`,
  );
  return res.data;
};
