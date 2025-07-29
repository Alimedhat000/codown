import { LuFileText as FileIcon, LuPin as PinIcon } from 'react-icons/lu';

import { DocumentCardDropdown } from '../DocumentCardDropdown';

type DocumentGridCardProps = {
  title: string;
  updatedAt: string;
  isPinned?: boolean;
};

export function DocumentGridCard({
  title,
  updatedAt,
  isPinned,
}: DocumentGridCardProps) {
  return (
    <div className="bg-surface ring ring-surface-border hover:ring-muted-foreground group relative rounded-xl p-4 shadow hover:ring">
      {/* Dropdown Menu */}
      <DocumentCardDropdown triggerClassname="absolute top-2 right-2 p-1 hover:bg-muted rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="flex flex-col gap-2">
        <div className="relative mb-5">
          <FileIcon className="absolute group-hover:opacity-0 transition-opacity" />
          <PinIcon
            className="absolute z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto text-muted-foreground hover:text-foreground transition-all"
            fill={isPinned ? '#71717a' : 'none'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log(`im ${isPinned ? 'not ' : ''}pinned now yay`);
            }}
          />
        </div>

        <div className="text-base font-medium line-clamp-2 mb-4">{title}</div>
        <div className="text-muted-foreground text-xs">{updatedAt}</div>
      </div>
    </div>
  );
}
