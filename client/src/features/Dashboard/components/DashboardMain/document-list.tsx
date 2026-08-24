import { Link } from 'react-router';

import { paths } from '@/config/paths';
import { Document } from '@/types/api';

import { DocumentGridCard } from '../DocumentGridCard';
import { DocumentRow } from '../DocumentRow';

type Props = {
  /** Documents to render in the current section. */
  documents: Document[];
  /** Layout preset; each document renders as a card or a row. */
  view: 'grid' | 'row';
  /** Called after a card-level edit so the list can reflect it. */
  onDocumentUpdated?: (updatedDocument: Document) => void;
  /** Called after deletion so the document is removed from the list. */
  onDocumentDeleted?: (documentId: string) => void;
  /** Enables owner-only actions (pin/rename/delete) for owned documents. */
  isOwned?: boolean;
};

/**
 * Render documents as grid cards or table rows according to the active view.
 */
export function DocumentList({
  documents,
  view,
  onDocumentUpdated,
  onDocumentDeleted,
  isOwned,
}: Props) {
  const gridClass =
    'document-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2';
  const containerClass =
    view === 'grid' ? gridClass : 'document-list space-y-2';

  return (
    <div className={containerClass} data-testid="document-list">
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
