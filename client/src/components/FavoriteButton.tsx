import { memo, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { m } from 'framer-motion';
import { useFavorites } from '@/hooks/useTelegramStorage';
import { useHaptic } from '@/hooks/useHaptic';

interface FavoriteButtonProps {
  demoId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FavoriteButton = memo(function FavoriteButton({
  demoId,
  className = '',
  size = 'md',
}: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const haptic = useHaptic();
  const isActive = isFavorite(demoId);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    haptic.medium();
    await toggle(demoId);
  }, [demoId, toggle, haptic]);

  return (
    <m.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full transition-colors ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: isActive ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.15)',
      }}
      data-testid={`button-favorite-${demoId}`}
      aria-label={isActive ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <m.div
        animate={{
          scale: isActive ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`${iconSizes[size]} transition-colors`}
          style={{
            color: isActive ? '#ef4444' : 'rgba(255, 255, 255, 0.7)',
            fill: isActive ? '#ef4444' : 'transparent',
          }}
        />
      </m.div>
    </m.button>
  );
});
