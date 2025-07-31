import React from 'react';
import {
  LuPencil as PenIcon,
  LuColumns2 as SplitIcon,
  LuEye as EyeIcon,
} from 'react-icons/lu';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup';

interface ViewModeSelectorProps {
  mode: 'edit' | 'both' | 'view';
  setMode: (mode: 'edit' | 'both' | 'view') => void;
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  mode,
  setMode,
}) => {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => value && setMode(value as typeof mode)}
      aria-label="View toggle"
      className="bg-surface border-surface-border inline-flex gap-1 rounded-md border p-1"
    >
      <ToggleGroupItem value="edit" aria-label="Edit only view">
        <PenIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="both" aria-label="Split view (edit and preview)">
        <SplitIcon className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="view" aria-label="Preview only view">
        <EyeIcon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
