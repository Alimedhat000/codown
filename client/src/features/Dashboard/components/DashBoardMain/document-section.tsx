import { ReactNode } from 'react';

type Props = {
  title: string;
  icon: ReactNode;
  count: number;
  children: ReactNode;
};

export function DocumentSection({ title, icon, count, children }: Props) {
  return (
    <div className="mb-8">
      <div className="mb-4 ml-1 flex items-center gap-1">
        {icon}
        <h2>{title}</h2>
        <span className="text-sm text-muted-foreground">{count}</span>
      </div>
      {children}
    </div>
  );
}
