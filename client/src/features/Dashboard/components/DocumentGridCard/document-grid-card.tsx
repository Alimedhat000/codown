import { DocumentCardDropdown } from '../DocumentCardDropdown';

type DocumentGridCardProps = {
  title: string;
  updatedAt: string;
};

export function DocumentGridCard({ title, updatedAt }: DocumentGridCardProps) {
  return (
    <div className="bg-surface hover:ring-surface-border group relative rounded-xl p-4 shadow hover:ring">
      {/* Dropdown Menu */}
      <DocumentCardDropdown triggerClassname="absolute top-2 right-2 p-1 hover:bg-muted rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="flex flex-col gap-2">
        <div className="truncate text-base font-medium">{title}</div>
        <div className="text-muted-foreground text-xs">{updatedAt}</div>
      </div>
    </div>
  );
}
