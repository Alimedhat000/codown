import { useEffect, useState } from 'react';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import DashboardMain from '@/features/Dashboard/components/DashBoardMain/dashboard-main';
import { api } from '@/lib/api';
import { Document } from '@/types/api';

export default function Dashboard() {
  const [ownedDocs, setOwnedDocs] = useState<Document[]>([]);
  const [collaboratedDocs, setCollaboratedDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    try {
      const res = await api.get('/document');
      // console.log(res);
      setOwnedDocs(res.data.owned || []);
      setCollaboratedDocs(res.data.collaborated || []);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  return (
    <DashboardLayout title="Dashboard">
      <DashboardMain
        ownedDocs={ownedDocs}
        collaboratedDocs={collaboratedDocs}
        loading={loading}
        setDocuments={setOwnedDocs}
      />
    </DashboardLayout>
  );
}
