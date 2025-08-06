import * as RadixSelect from '@radix-ui/react-select';
import {
  LuChevronDown as ChevronIcon,
  LuCheck as CheckIcon,
} from 'react-icons/lu';

import { cn } from '@/utils/cn'; // optional utility to merge class names

const options = [
  { label: 'View mode', value: 'view' },
  { label: 'Edit mode', value: 'edit' },
];

export function ShareModeSelect({
  onChange,
  value,
}: {
  onChange: (permission: 'view' | 'edit') => void;
  value: 'view' | 'edit';
}) {
  return (
    <RadixSelect.Root value={value} onValueChange={onChange}>
      <RadixSelect.Trigger className="flex w-full items-center justify-between rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-border">
        <RadixSelect.Value placeholder="Select mode" />
        <RadixSelect.Icon className="ml-2 text-muted-foreground">
          <ChevronIcon size={16} />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          side="bottom"
          align="start"
          className="z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={cn(
                  'flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-colors',
                  'focus:bg-muted focus:text-foreground',
                )}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator className="ml-auto text-primary-foreground">
                  <CheckIcon size={16} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
