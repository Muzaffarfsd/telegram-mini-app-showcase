import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSkeletonProps {
  variant?: 'card' | 'detail' | 'list';
  count?: number;
  className?: string;
}

const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Загрузка товара">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
      </div>
    </div>
  );
});

const DetailSkeleton = memo(function DetailSkeleton() {
  return (
    <div className="space-y-4 p-4" role="status" aria-label="Загрузка товара">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-md" />
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-12 w-full mt-6 rounded-lg" />
      </div>
    </div>
  );
});

const ListSkeleton = memo(function ListSkeleton() {
  return (
    <div className="flex gap-4 p-4" role="status" aria-label="Загрузка товара">
      <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/4" />
      </div>
    </div>
  );
});

export const ProductSkeleton = memo(function ProductSkeleton({
  variant = 'card',
  count = 1,
  className = '',
}: ProductSkeletonProps) {
  const SkeletonComponent = {
    card: CardSkeleton,
    detail: DetailSkeleton,
    list: ListSkeleton,
  }[variant];

  if (variant === 'card' && count > 1) {
    return (
      <div className={`grid grid-cols-2 gap-4 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  if (variant === 'list' && count > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
});

export const ProductGridSkeleton = memo(function ProductGridSkeleton({ 
  count = 4,
  className = '' 
}: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-4 p-4 ${className}`} role="status" aria-label="Загрузка товаров">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
});

export const CartSkeleton = memo(function CartSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-4 p-4" role="status" aria-label="Загрузка корзины">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 rounded-lg border">
          <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center mt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      ))}
      <div className="border-t pt-4 mt-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
});

export default ProductSkeleton;
