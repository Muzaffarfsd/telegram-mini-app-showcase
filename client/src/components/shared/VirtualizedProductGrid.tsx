import { memo, useRef, useMemo, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualizedProductGridProps<T> {
  items: T[] | undefined;
  renderItem: (item: T, index: number) => ReactNode;
  columns?: number;
  itemHeight?: number;
  gap?: number;
  overscan?: number;
  className?: string;
  loadingCount?: number;
  'data-testid'?: string;
}

const LoadingPlaceholder = memo(function LoadingPlaceholder({
  columns,
  count,
  gap,
  itemHeight,
}: {
  columns: number;
  count: number;
  gap: number;
  itemHeight: number;
}) {
  const rows = Math.ceil(count / columns);
  
  return (
    <div 
      className="w-full"
      style={{ 
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
      role="status"
      aria-label="Loading products"
      data-testid="virtualized-grid-loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton 
            className="w-full rounded-lg" 
            style={{ height: `${itemHeight - 80}px` }}
          />
          <div className="space-y-2 px-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
});

function VirtualizedProductGridInner<T>({
  items,
  renderItem,
  columns = 2,
  itemHeight = 320,
  gap = 16,
  overscan = 3,
  className,
  loadingCount = 6,
  'data-testid': dataTestId = 'virtualized-product-grid',
}: VirtualizedProductGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = useMemo(() => {
    if (!items) return 0;
    return Math.ceil(items.length / columns);
  }, [items, columns]);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  if (!items) {
    return (
      <div className={cn('w-full p-4', className)}>
        <LoadingPlaceholder 
          columns={columns} 
          count={loadingCount} 
          gap={gap}
          itemHeight={itemHeight}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={parentRef}
      className={cn('w-full overflow-auto', className)}
      data-testid={dataTestId}
      role="grid"
      aria-label="Product grid"
    >
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualItems.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              className="absolute left-0 w-full"
              style={{
                top: 0,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                padding: `0 ${gap / 2}px`,
              }}
              role="row"
              data-testid={`grid-row-${virtualRow.index}`}
            >
              {rowItems.map((item, colIndex) => (
                <div
                  key={startIndex + colIndex}
                  role="gridcell"
                  data-testid={`grid-cell-${startIndex + colIndex}`}
                >
                  {renderItem(item, startIndex + colIndex)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const VirtualizedProductGrid = memo(VirtualizedProductGridInner) as typeof VirtualizedProductGridInner;

export default VirtualizedProductGrid;
