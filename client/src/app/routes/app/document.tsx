import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { DocumentLayout } from '@/components/layouts/DocumentLayout';
import { Spinner } from '@/components/ui/Spinner';
import { DocumentHeader } from '@/features/DocumentPage/components/DocumentHeader';
import { DocumentMain } from '@/features/DocumentPage/components/DocumentMain';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDocument } from '@/hooks/useDocument';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export default function DocumentPage() {
  const { id } = useParams();
  const { doc, editedDoc, setEditedDoc, loading, handleSave } = useDocument(id);

  useAutoSave(handleSave, editedDoc, 5000);

  const [mode, setMode] = useState<EditorMode>('edit');

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isSmallScreen) setMode('edit');
  }, [isSmallScreen]);

  return (
    <>
      <DocumentLayout title={doc?.title || 'Document'}>
        <DocumentHeader
          mode={mode}
          setMode={setMode}
          documentTitle={doc?.title}
          className="fixed top-0 left-0 right-0 z-10"
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
          />
        )}
      </DocumentLayout>
    </>
  );
}
