import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import ContentLayout from '@/components/layouts/ContentLayout';
import { DocumentHeader } from '@/features/DocumentPage/components/DocumentHeader';
import { DocumentMain } from '@/features/DocumentPage/components/DocumentMain';
// import NavBarHeader from '@/features/DocumentPage/NavBarHeader';
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

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <ContentLayout title={doc?.title || 'Document'}>
        <div className="bg-surface text-text-primary h-screen">
          <DocumentHeader
            mode={mode}
            setMode={setMode}
            documentTitle={doc?.title}
          />
          <div className=" flex-1 overflow-hidden">
            <DocumentMain
              mode={mode}
              doc={editedDoc}
              setDoc={setEditedDoc}
              docId={id}
            />
          </div>
        </div>
      </ContentLayout>
    </>
  );
}
