import React from 'react';

import { cn } from '@/utils/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Shimmering placeholder block for loading states; shaped entirely via className.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-muted-foreground rounded-md', className)}
      {...props}
    />
  );
}
