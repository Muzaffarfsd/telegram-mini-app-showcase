import { memo } from 'react';

interface SkeletonShimmerProps {
  className?: string;
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'button' | 'image';
  width?: string;
  height?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const SkeletonShimmer = memo(function SkeletonShimmer({
  className = '',
  variant = 'text',
  width,
  height,
  rounded = 'md',
}: SkeletonShimmerProps) {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-7 w-3/4',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-40 w-full',
    button: 'h-10 w-24',
    image: 'h-48 w-full',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const baseStyle = variant === 'avatar' ? '' : roundedClasses[rounded];

  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/5
        ${variants[variant]}
        ${baseStyle}
        ${className}
      `}
      style={{ width, height }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 skeleton-shimmer" />
    </div>
  );
});

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  hasImage?: boolean;
  hasAvatar?: boolean;
}

export const SkeletonCard = memo(function SkeletonCard({
  className = '',
  lines = 3,
  hasImage = true,
  hasAvatar = false,
}: SkeletonCardProps) {
  return (
    <div
      className={`
        p-4 rounded-2xl
        bg-white/5 border border-white/10
        ${className}
      `}
      aria-hidden="true"
    >
      {hasImage && (
        <SkeletonShimmer variant="image" className="mb-4" rounded="lg" />
      )}
      
      {hasAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <SkeletonShimmer variant="avatar" />
          <div className="flex-1 space-y-2">
            <SkeletonShimmer variant="text" width="60%" />
            <SkeletonShimmer variant="text" width="40%" height="12px" />
          </div>
        </div>
      )}
      
      <SkeletonShimmer variant="title" className="mb-3" />
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonShimmer 
            key={i} 
            variant="text" 
            width={i === lines - 1 ? '70%' : '100%'} 
          />
        ))}
      </div>
    </div>
  );
});

interface SkeletonListProps {
  count?: number;
  variant?: 'card' | 'row';
  className?: string;
}

export const SkeletonList = memo(function SkeletonList({
  count = 3,
  variant = 'card',
  className = '',
}: SkeletonListProps) {
  if (variant === 'row') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <SkeletonShimmer variant="avatar" />
            <div className="flex-1 space-y-2">
              <SkeletonShimmer variant="text" width="50%" />
              <SkeletonShimmer variant="text" width="30%" height="12px" />
            </div>
            <SkeletonShimmer variant="button" width="60px" height="32px" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
});
