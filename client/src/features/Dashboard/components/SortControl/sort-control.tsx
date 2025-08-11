import React from 'react';
import {
  LuArrowUpDown as SortIcon,
  LuCheck as CheckIcon,
} from 'react-icons/lu';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/Dropdown';

export interface SortControlProps {
  value: string;
  onChange: (val: string) => void;
  options: {
    label: string;
    value: string;
  }[];
  className?: string;
}

export function SortControl({
  value,
  onChange,
  options,
  className,
}: SortControlProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="sort"
        className={`px-4 flex items-center gap-2 py-2 bg-surface  text-sm border border-surface-border hover:border-muted-foreground transition-all rounded-md ${className}`}
      >
        <SortIcon />
        Sort
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Notes Sorted by
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((opt) => (
            <DropdownMenuRadioItem
              key={opt.value}
              value={opt.value}
              customIndicator={<CheckIcon className="size-4" />}
              className="text-xs"
            >
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
