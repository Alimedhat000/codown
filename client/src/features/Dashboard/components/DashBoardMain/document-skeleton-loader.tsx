import { Skeleton } from '@/components/ui/Skeleton';

export function DocumentSkeletonLoader({
  view,
  count,
}: {
  view: 'grid' | 'row';
  count: number;
}) {
  const gridClass =
    'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2';
  const containerClass = view === 'grid' ? gridClass : 'space-y-2';

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center gap-1">
        <Skeleton className="h-8 w-1/4" />
      </div>
      <div className={containerClass}>
        {Array.from({ length: count }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={`${view === 'grid' ? 'h-30' : 'h-15'} w-full`}
          />
        ))}
      </div>
    </div>
  );
}
