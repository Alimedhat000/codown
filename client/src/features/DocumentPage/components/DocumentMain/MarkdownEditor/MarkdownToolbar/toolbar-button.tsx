import React from 'react';

export function ToolbarButton({
  icon: Icon,
  title,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="hover:bg-surface/90 p-1 rounded-sm"
    >
      <Icon />
    </button>
  );
}
