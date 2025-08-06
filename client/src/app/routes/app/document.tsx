import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { DocumentLayout } from '@/components/layouts/DocumentLayout';
import { Spinner } from '@/components/ui/Spinner';
import { paths } from '@/config/paths';
import { DocumentHeader } from '@/features/DocumentPage/components/DocumentHeader';
import { DocumentMain } from '@/features/DocumentPage/components/DocumentMain';
import { useDocument } from '@/hooks/useDocument';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function DocumentPage() {
  const { id } = useParams();
  const { doc, editedDoc, setEditedDoc, loading, /*handleSave,*/ access } =
    useDocument(id);
  const navigate = useNavigate();

  const isReadOnly = access?.permission === 'view';
  const isCollaborator = access?.isCollaborator;

  const [mode, setMode] = useState<EditorMode>('edit');

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (loading) return;

    if (!access || (!access.isOwner && !access.isCollaborator)) {
      navigate(paths.app.dashboard.getHref());
    }
  }, [access, loading, navigate]);

  useEffect(() => {
    if (isSmallScreen) setMode('edit');
  }, [isSmallScreen]);

  if (loading) return;

  return (
    <>
      <DocumentLayout title={doc?.title || 'Document'}>
        <DocumentHeader
          mode={mode}
          setMode={setMode}
          documentTitle={doc?.title}
          docId={id}
          className="fixed top-0 left-0 right-0 z-10"
          isReadOnly={isReadOnly}
          isCollaborator={isCollaborator}
        />
        {loading ? (
          <Spinner />
        ) : (
          <DocumentMain
            mode={mode}
            doc={editedDoc}
            setDoc={setEditedDoc}
            docId={id}
            className=" mt-[2.86rem] md:mt-[3.375rem]"
            isReadOnly={isReadOnly}
          />
        )}
      </DocumentLayout>
    </>
  );
}
