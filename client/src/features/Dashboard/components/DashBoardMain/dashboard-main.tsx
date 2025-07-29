import { useEffect, useState } from 'react';
import {
  LuAlignJustify as RowsIcon,
  LuGrid2X2 as GridIcon,
  LuFileText as FileIcon,
  LuPin as PinIcon,
} from 'react-icons/lu';
import { Link } from 'react-router';

import { Skeleton } from '@/components/ui/Skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup';
import { paths } from '@/config/paths';
import { Document } from '@/types/api';

import { DocumentGridCard } from '../DocumentGridCard';
import { DocumentRow } from '../DocumentRow';
import NewDocumentModal from '../NewDocumentModal/new-document-modal';

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
      // Delay hiding the loader for at least 1 second
      timeout = setTimeout(() => setDelayedLoading(false), 1000);
    } else {
      // Immediately show the loader
      setDelayedLoading(true);
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  const gridClass =
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2';

  const renderCard = (doc: Document) => {
    const updatedAt = new Date(doc.createdAt).toLocaleDateString();
    const Component = view === 'grid' ? DocumentGridCard : DocumentRow;

    return (
      <Link
        key={doc.id}
        to={paths.app.document.getHref(doc.id.slice(0, 8))}
        className="block"
        onClick={() =>
          console.log(
            'navigate to',
            paths.app.document.getHref(doc.id.slice(0, 8)),
          )
        }
      >
        <Component
          title={doc.title || 'Untitled'}
          updatedAt={updatedAt}
          isPinned={view === 'grid' ? doc.pinned : undefined}
        />
      </Link>
    );
  };

  const pinned = documents.filter((doc) => doc.pinned);
  const others = documents.filter((doc) => !doc.pinned);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            defaultValue="grid"
            onValueChange={(val: any) => val && setView(val as 'grid' | 'row')}
            aria-label="View toggle"
            className="bg-surface border-surface-border inline-flex gap-1 rounded-md border p-1"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <GridIcon size={18} />
            </ToggleGroupItem>
            <ToggleGroupItem value="row" aria-label="Row view">
              <RowsIcon size={18} />
            </ToggleGroupItem>
          </ToggleGroup>
          <NewDocumentModal setDocuments={setDocuments} />
        </div>
      </div>
      {delayedLoading ? (
        <>
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-1">
              <Skeleton className="h-8 w-1/3" />
            </div>
            <div className={view === 'grid' ? gridClass : 'space-y-2'}>
              {Array.from({ length: 1 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className={`${view === 'grid' ? 'h-30' : 'h-20'} w-full`}
                />
              ))}
            </div>
          </div>
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-1">
              <Skeleton className="h-8 w-1/3" />
            </div>
            <div className={view === 'grid' ? gridClass : 'space-y-2'}>
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className={`${view === 'grid' ? 'h-30' : 'h-20'} w-full`}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="mb-8">
              <div className="mb-2 flex items-center gap-1">
                <PinIcon size={20} />
                <h2>Pinned</h2>
                <span className="text-sm text-muted-foreground">
                  {pinned.length}
                </span>
              </div>
              <div className={view === 'grid' ? gridClass : 'space-y-2'}>
                {pinned.map(renderCard)}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-center gap-1">
              <FileIcon size={20} />
              <h2>Documents</h2>
              <span className="text-sm text-muted-foreground">
                {others.length}
              </span>
            </div>
            <div className={view === 'grid' ? gridClass : 'space-y-2'}>
              {others.map(renderCard)}
            </div>
          </div>
        </>
      )}
    </>
  );
}
