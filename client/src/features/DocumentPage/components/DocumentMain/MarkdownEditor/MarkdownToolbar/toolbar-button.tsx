import React from 'react';

/**
 * Icon button wrapper for a single toolbar command.
 */
export function ToolbarButton({
  icon: Icon,
  title,
  onClick,
}: {
  /** Icon component rendered inside the button. */
  icon: React.ElementType;
  /** Native tooltip and accessible name of the button. */
  title: string;
  /** Invoked when the button is clicked. */
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="hover:bg-surface/90 p-1.5 text-foreground rounded-sm"
    >
      <Icon strokeWidth={1.5} />
    </button>
  );
}
