import { useEffect, useMemo, useState } from 'react';
import { LuFileText as FileIcon, LuPin as PinIcon } from 'react-icons/lu';

import { Document } from '@/types/api';

import NewDocumentModal from '../NewDocumentModal/new-document-modal';
import { SortControl } from '../SortControl';

import DashboardViewToggle from './dashboard-view-toggle';
import { DocumentList } from './document-list';
import { DocumentSection } from './document-section';
import { DocumentSkeletonLoader } from './document-skeleton-loader';

const sortOptions = [
  { label: 'New To Old', value: 'newest' },
  { label: 'Old To New', value: 'oldest' },
  { label: 'A to Z', value: 'az' },
  { label: 'Z to A', value: 'za' },
];

type SortValue = (typeof sortOptions)[number]['value'];

type DashboardMainProps = {
  documents: Document[];
  loading: boolean;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
};

function sortDocuments(documents: Document[], sort: SortValue) {
  return [...documents].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case 'oldest':
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      case 'az':
        return a.title.localeCompare(b.title);
      case 'za':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
}

export default function DashboardMain({
  documents,
  loading,
  setDocuments,
}: DashboardMainProps) {
  const [view, setView] = useState<'grid' | 'row'>('grid');
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [sort, setSort] = useState<SortValue>('newest');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!loading) {
      timeout = setTimeout(() => setShowSkeletons(false), 1000);
    } else {
      setShowSkeletons(true);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const sortedDocs = useMemo(
    () => sortDocuments(documents, sort),
    [documents, sort],
  );

  const pinned = sortedDocs.filter((doc) => doc.pinned);
  const others = sortedDocs.filter((doc) => !doc.pinned);

  const handleDocumentUpdated = (updated: Document) => {
    setDocuments((docs) =>
      docs.map((doc) => (doc.id === updated.id ? updated : doc)),
    );
  };

  const handleDocumentDeleted = (id: string) => {
    setDocuments((docs) => docs.filter((doc) => doc.id !== id));
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <DashboardViewToggle setView={setView} />
          <SortControl
            value={sort}
            onChange={(val: SortValue) => setSort(val)}
            options={sortOptions}
          />
          <NewDocumentModal setDocuments={setDocuments} />
        </div>
      </div>

      {showSkeletons ? (
        <>
          <DocumentSkeletonLoader view={view} count={1} />
          <DocumentSkeletonLoader view={view} count={3} />
        </>
      ) : (
        <>
          {pinned.length > 0 && (
            <DocumentSection
              title="Pinned"
              icon={<PinIcon size={20} />}
              count={pinned.length}
            >
              <DocumentList
                documents={pinned}
                view={view}
                onDocumentUpdated={handleDocumentUpdated}
                onDocumentDeleted={handleDocumentDeleted}
              />
            </DocumentSection>
          )}
          <DocumentSection
            title="Notes"
            icon={<FileIcon size={20} />}
            count={others.length}
          >
            <DocumentList
              documents={others}
              view={view}
              onDocumentUpdated={handleDocumentUpdated}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </DocumentSection>
        </>
      )}
    </>
  );
}
