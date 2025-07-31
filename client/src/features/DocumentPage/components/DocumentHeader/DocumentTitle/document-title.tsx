import React from 'react';

interface DocumentTitleProps {
  title?: string;
}

export const DocumentTitle: React.FC<DocumentTitleProps> = ({ title }) => {
  if (!title) return null;

  return (
    <div className="text-sm font-medium text-foreground max-w-xs truncate">
      {title}
    </div>
  );
};
