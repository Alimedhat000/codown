import { Link } from 'react-router';

import { paths } from '@/config/paths';
import { Document } from '@/types/api';

import { DocumentGridCard } from '../DocumentGridCard';
import { DocumentRow } from '../DocumentRow';

type Props = {
  documents: Document[];
  view: 'grid' | 'row';
  onDocumentUpdated?: (updatedDocument: Document) => void;
  onDocumentDeleted?: (documentId: string) => void;
  isOwned?: boolean;
};

export function DocumentList({
  documents,
  view,
  onDocumentUpdated,
  onDocumentDeleted,
  isOwned,
}: Props) {
  const gridClass = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2';
  const containerClass = view === 'grid' ? gridClass : 'space-y-2';

  return (
    <div className={containerClass}>
      {documents.map((doc) => {
        const Component = view === 'grid' ? DocumentGridCard : DocumentRow;

        return (
          <Link
            key={doc.id}
            to={paths.app.document.getHref(doc.id)}
            className="block"
          >
            <Component
              document={doc}
              isOwned={isOwned}
              onDocumentUpdated={onDocumentUpdated!}
              onDocumentDeleted={onDocumentDeleted!}
            />
          </Link>
        );
      })}
    </div>
  );
}
