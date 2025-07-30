import { useEffect, useState } from 'react';
import { LuFileText as FileIcon, LuPin as PinIcon } from 'react-icons/lu';

import { Document } from '@/types/api';

import NewDocumentModal from '../NewDocumentModal/new-document-modal';

import DashboardViewToggle from './dashboard-view-toggle';
import { DocumentList } from './document-list';
import { DocumentSection } from './document-section';
import { DocumentSkeletonLoader } from './document-skeleton-loader';

type DashboardMainProps = {
  documents: Document[];
  loading: boolean;
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
};

export default function DashboardMain({
  documents,
  loading,
  setDocuments,
}: DashboardMainProps) {
  const [view, setView] = useState<'grid' | 'row'>('grid');
  const [delayedLoading, setDelayedLoading] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!loading) {
      timeout = setTimeout(() => setDelayedLoading(false), 1000);
    } else {
      setDelayedLoading(true);
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const pinned = documents.filter((doc) => doc.pinned);
  const others = documents.filter((doc) => !doc.pinned);

  const handleDocumentUpdated = (updatedDocument: Document) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === updatedDocument.id ? updatedDocument : doc,
      ),
    );
  };

  const handleDocumentDeleted = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <DashboardViewToggle setView={setView} />

          <NewDocumentModal setDocuments={setDocuments} />
        </div>
      </div>

      {delayedLoading ? (
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
            title="Documents"
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
