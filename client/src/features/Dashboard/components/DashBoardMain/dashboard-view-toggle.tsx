import React, { useEffect } from 'react';
import {
  LuAlignJustify as RowsIcon,
  LuGrid2X2 as GridIcon,
} from 'react-icons/lu';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/ToggleGroup';

export default function DashboardViewToggle({
  setView,
}: {
  setView: React.Dispatch<React.SetStateAction<'grid' | 'row'>>;
}) {
  useEffect(() => {
    const stored = localStorage.getItem('preferred-document-view') as
      | 'grid'
      | 'row'
      | null;
    setView(stored || 'grid');
  }, [setView]);

  return (
    <ToggleGroup
      type="single"
      defaultValue={
        (localStorage.getItem('preferred-document-view') as
          | 'grid'
          | 'row'
          | null) || 'grid'
      }
      onValueChange={(val) => {
        if (val) {
          localStorage.setItem(
            'preferred-document-view',
            val as 'grid' | 'row',
          );
          setView(val as 'grid' | 'row');
        }
      }}
      aria-label="View toggle"
      className="bg-surface border-surface-border inline-flex gap-1 rounded-md border p-1"
    >
      <ToggleGroupItem value="grid" aria-label="Grid view">
        <GridIcon size={18} />
      </ToggleGroupItem>
      <ToggleGroupItem value="row" aria-label="Row view">
        <RowsIcon size={18} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
