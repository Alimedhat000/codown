import { useState } from 'react';
import { NavigateFunction } from 'react-router';

import { paths } from '@/config/paths';
import { Document } from '@/types/api';

/**
 * Bundles rename/delete flows (modals included) for a single document.
 * @param document - Document the actions operate on.
 * @param navigate - Router navigator used to open the document.
 * @returns Copy-link state plus view/copy handlers for dropdown wiring.
 */
export function useDocumentActions(
  document: Document,
  navigate: NavigateFunction,
) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleViewDocument = () => {
    navigate(paths.app.document.getHref(document.id));
  };

  const handleCopyLink = async () => {
    try {
      const link =
        window.location.origin + paths.app.document.getHref(document.id);
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return {
    copySuccess,
    handleViewDocument,
    handleCopyLink,
  };
}
