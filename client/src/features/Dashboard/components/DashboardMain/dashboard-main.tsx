import { useEffect, useMemo, useState } from 'react';
import {
  LuChevronLeft as ChevronLeftIcon,
  LuChevronRight as ChevronRightIcon,
  LuFileText as FileIcon,
  LuPin as PinIcon,
  LuSearch as SearchIcon,
  LuShare as ShareIcon,
} from 'react-icons/lu';

import { Button } from '@/components/ui/Button';
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
  /** Documents owned by the current user, shown in "Your Notes". */
  ownedDocs: Document[];
  /** Documents shared with the current user, shown as "Shared Notes". */
  collaboratedDocs: Document[];
  /** Renders skeleton loaders instead of sections while fetching. */
  loading: boolean;
  /** State setter used to apply card-level updates and deletions. */
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  /** Current search query. */
  search: string;
  /** Called when search query changes. */
  onSearchChange: (value: string) => void;
  /** Page size. */
  limit: number;
  /** Current offset. */
  offset: number;
  /** Called when offset changes. */
  onOffsetChange: (offset: number) => void;
  /** Total counts returned by the server. */
  pagination: { totalOwned: number; totalCollaborated: number } | null;
};

/**
 * Return a sorted copy of the documents for the selected sort value.
 */
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

/**
 * Dashboard body: owned/shared sections, sorting, view toggle and card/list rendering.
 */
export default function DashboardMain({
  ownedDocs,
  collaboratedDocs,
  loading,
  setDocuments,
  search,
  onSearchChange,
  limit,
  offset,
  onOffsetChange,
  pagination,
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

  const totalOwned = pagination?.totalOwned ?? ownedDocs.length;
  const totalCollaborated =
    pagination?.totalCollaborated ?? collaboratedDocs.length;
  const maxTotal = Math.max(totalOwned, totalCollaborated);
  const canPrev = offset > 0;
  const canNext = offset + limit < maxTotal;
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(maxTotal / limit));

  return (
    <>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
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
        <div className="relative max-w-sm">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title..."
            aria-label="Search documents"
            className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
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
          {!showSkeletons &&
            (ownedDocs.length > 0 || collaboratedDocs.length > 0) && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} · {totalOwned} owned ·{' '}
                  {totalCollaborated} shared
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canPrev}
                    onClick={() => onOffsetChange(Math.max(0, offset - limit))}
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon size={16} /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canNext}
                    onClick={() => onOffsetChange(offset + limit)}
                    aria-label="Next page"
                  >
                    Next <ChevronRightIcon size={16} />
                  </Button>
                </div>
              </div>
            )}
        </>
      )}
    </>
  );
}
