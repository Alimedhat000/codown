import React from 'react';

import { cn } from '@/utils/cn';

interface DocumentTitleProps {
  /** Title text; when absent the component renders nothing. */
  title?: string;
  /** Extra classes merged onto the title element. */
  className?: string;
}

/**
 * Inline document title in the header; renders nothing when title is absent.
 */
export const DocumentTitle = ({ title, className }: DocumentTitleProps) => {
  if (!title) return null;

  return (
    <div
      className={cn(
        'text-sm font-medium text-foreground max-w-xs truncate',
        className,
      )}
    >
      {title}
    </div>
  );
};
