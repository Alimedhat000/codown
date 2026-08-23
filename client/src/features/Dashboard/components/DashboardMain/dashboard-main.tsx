import { useEffect, useMemo, useState } from 'react';
import {
  LuFileText as FileIcon,
  LuPin as PinIcon,
  LuShare as ShareIcon,
} from 'react-icons/lu';

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
  ownedDocs: Document[];
  collaboratedDocs: Document[];
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
  ownedDocs,
  collaboratedDocs,
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

  const sortedOwned = useMemo(
    () => sortDocuments(ownedDocs, sort),
    [ownedDocs, sort],
  );
  const sortedCollaborated = useMemo(
    () => sortDocuments(collaboratedDocs, sort),
    [collaboratedDocs, sort],
  );

  const ownedPinned = sortedOwned.filter((doc) => doc.pinned);
  const ownedOthers = sortedOwned.filter((doc) => !doc.pinned);

  const collaboratedPinned = sortedCollaborated.filter((doc) => doc.pinned);
  const collaboratedOthers = sortedCollaborated.filter((doc) => !doc.pinned);

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
          {ownedDocs.length === 0 && collaboratedDocs.length === 0 && (
            <h1 className="text-xl font-semibold text-muted-foreground">
              It's empty in here — start by creating a new document!
            </h1>
          )}

          {ownedPinned.length > 0 && (
            <DocumentSection
              title="Your Pinned Notes"
              icon={<PinIcon size={20} />}
              count={ownedPinned.length}
            >
              <DocumentList
                documents={ownedPinned}
                view={view}
                onDocumentUpdated={handleDocumentUpdated}
                onDocumentDeleted={handleDocumentDeleted}
                isOwned={true}
              />
            </DocumentSection>
          )}
          {ownedOthers.length > 0 && (
            <DocumentSection
              title="Your Notes"
              icon={<FileIcon size={20} />}
              count={ownedOthers.length}
            >
              <DocumentList
                documents={ownedOthers}
                view={view}
                onDocumentUpdated={handleDocumentUpdated}
                onDocumentDeleted={handleDocumentDeleted}
                isOwned={true}
              />
            </DocumentSection>
          )}
          {collaboratedPinned.length > 0 && (
            <DocumentSection
              title="Shared Pinned Notes"
              icon={<ShareIcon size={20} />}
              count={collaboratedPinned.length}
            >
              <DocumentList
                documents={collaboratedPinned}
                view={view}
                isOwned={false}
              />
            </DocumentSection>
          )}
          {collaboratedOthers.length > 0 && (
            <DocumentSection
              title="Shared Notes"
              icon={<ShareIcon size={20} />}
              count={collaboratedOthers.length}
            >
              <DocumentList
                documents={collaboratedOthers}
                view={view}
                isOwned={false}
              />
            </DocumentSection>
          )}
        </>
      )}
    </>
  );
}
