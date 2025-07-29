import { useEffect, useState } from 'react';
import { Link } from 'react-router';

import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { paths } from '@/config/paths';
import { api } from '@/lib/api';

type Document = {
  id: string;
  title: string;
  createdAt: string;
};

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get('/document');
        setDocuments(res.data);
      } catch (err) {
        console.error('Failed to fetch documents', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setCreating(true);
      const res = await api.post('/document', { title });
      setDocuments((prev) => [res.data, ...prev]);
      setTitle('');
    } catch (err) {
      console.error('Failed to create document', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <h1>Your Documents</h1>

      <form onSubmit={handleCreate} style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={title}
          placeholder="New document title"
          onChange={(e) => setTitle(e.target.value)}
          disabled={creating}
          style={{ marginRight: '0.5rem', padding: '0.5rem' }}
        />
        <button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Create'}
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : documents.length === 0 ? (
        <p>No documents found.</p>
      ) : (
        <ul>
          {documents.map((doc) => (
            <Link
              key={doc.id}
              to={paths.app.document.getHref(doc.id.slice(0, 8))}
            >
              <li>
                <strong>{doc.title}</strong> -{' '}
                {new Date(doc.createdAt).toLocaleString()}
              </li>
            </Link>
          ))}
        </ul>
      )}
    </DashboardLayout>
  );
}
