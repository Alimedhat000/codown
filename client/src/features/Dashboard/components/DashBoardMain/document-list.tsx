import { Link } from 'react-router';

import { paths } from '@/config/paths';
import { Document } from '@/types/api';

import { DocumentGridCard } from '../DocumentGridCard';
import { DocumentRow } from '../DocumentRow';

type Props = {
  documents: Document[];
  view: 'grid' | 'row';
};

export function DocumentList({ documents, view }: Props) {
  const gridClass =
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2';
  const containerClass = view === 'grid' ? gridClass : 'space-y-2';

  return (
    <div className={containerClass}>
      {documents.map((doc) => {
        const Component = view === 'grid' ? DocumentGridCard : DocumentRow;

        return (
          <Link
            key={doc.id}
            to={paths.app.document.getHref(doc.id.slice(0, 8))}
            className="block"
          >
            <Component document={doc} />
          </Link>
        );
      })}
    </div>
  );
}
