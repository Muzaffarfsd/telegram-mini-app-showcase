import { useRef, useCallback, ReactNode } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  className?: string;
  renderItem: (item: T, index: number, virtualItem: VirtualItem) => ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  isLoading?: boolean;
}

export function VirtualList<T>({
  items,
  estimateSize = 60,
  overscan = 5,
  className = 'h-96',
  renderItem,
  getItemKey,
  onEndReached,
  endReachedThreshold = 0.8,
  emptyState,
  loadingState,
  isLoading = false,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const hasCalledEndReached = useRef(false);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: getItemKey 
      ? (index) => getItemKey(items[index], index)
      : undefined,
  });

  const handleScroll = useCallback(() => {
    if (!onEndReached || hasCalledEndReached.current) return;

    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage >= endReachedThreshold) {
      hasCalledEndReached.current = true;
      onEndReached();
      setTimeout(() => {
        hasCalledEndReached.current = false;
      }, 1000);
    }
  }, [onEndReached, endReachedThreshold]);

  if (isLoading && items.length === 0) {
    return <>{loadingState}</>;
  }

  if (items.length === 0) {
    return <>{emptyState}</>;
  }

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      onScroll={handleScroll}
      data-testid="virtual-list-container"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
            data-testid={`virtual-list-item-${virtualItem.index}`}
          >
            {renderItem(items[virtualItem.index], virtualItem.index, virtualItem)}
          </div>
        ))}
      </div>
    </div>
  );
}

interface VirtualGridProps<T> {
  items: T[];
  columns: number;
  rowHeight?: number;
  gap?: number;
  overscan?: number;
  className?: string;
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualGrid<T>({
  items,
  columns,
  rowHeight = 200,
  gap = 16,
  overscan = 2,
  className = 'h-[600px]',
  renderItem,
  getItemKey,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight + gap,
    overscan,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      data-testid="virtual-grid-container"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
                paddingBottom: `${gap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const itemIndex = startIndex + colIndex;
                const key = getItemKey ? getItemKey(item, itemIndex) : itemIndex;
                
                return (
                  <div key={key} data-testid={`virtual-grid-item-${itemIndex}`}>
                    {renderItem(item, itemIndex)}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VirtualList;
