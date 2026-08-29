import { useCallback, useEffect, useState } from 'react';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import DashboardMain from '@/features/Dashboard/components/DashboardMain/dashboard-main';
import { api } from '@/lib/api';
import { Document } from '@/types/api';

const DEFAULT_LIMIT = 20;

/**
 * Dashboard page listing owned documents alongside shared ones with view-mode controls.
 */
export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState<Document[]>([]);
  const [collaboratedDocs, setCollaboratedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [limit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState<{
    totalOwned: number;
    totalCollaborated: number;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setOffset(0);
  }, [debouncedSearch]);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/document', {
        params: {
          q: debouncedSearch || undefined,
          limit,
          offset,
        },
      });
      setOwnedDocs(res.data.owned || []);
      setCollaboratedDocs(res.data.collaborated || []);
      if (res.data.pagination) {
        setPagination({
          totalOwned: res.data.pagination.totalOwned,
          totalCollaborated: res.data.pagination.totalCollaborated,
        });
      }
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, limit, offset]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return (
    <DashboardLayout title="Dashboard">
      <DashboardMain
        ownedDocs={ownedDocs}
        collaboratedDocs={collaboratedDocs}
        loading={loading}
        setDocuments={setOwnedDocs}
        search={search}
        onSearchChange={setSearch}
        limit={limit}
        offset={offset}
        onOffsetChange={setOffset}
        pagination={pagination}
      />
    </DashboardLayout>
  );
}
