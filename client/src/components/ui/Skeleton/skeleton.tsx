import React from 'react';

import { cn } from '@/utils/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-muted-foreground rounded-md', className)}
      {...props}
    />
  );
}
