import React from 'react';

import { cn } from '@/utils/cn';

interface DocumentTitleProps {
  title?: string;
  className?: string;
}

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
