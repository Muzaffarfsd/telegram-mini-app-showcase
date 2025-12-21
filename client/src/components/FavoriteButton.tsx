import { memo, useCallback, useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { m } from 'framer-motion';
import { useFavoritesStore } from '@/stores/favoritesStore';
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
  const { isFavorite, toggle, initialize, isInitialized } = useFavoritesStore();
  const haptic = useHaptic();
  const isActive = isFavorite(demoId);
  const [isLightTheme, setIsLightTheme] = useState(() => 
    document.documentElement.classList.contains('light')
  );
  
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightTheme(document.documentElement.classList.contains('light'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

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

  const inactiveColor = isLightTheme ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.7)';
  const inactiveBg = isLightTheme ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)';

  return (
    <m.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      className={`flex items-center justify-center rounded-full transition-colors ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: isActive ? 'rgba(239, 68, 68, 0.2)' : inactiveBg,
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
            color: isActive ? '#ef4444' : inactiveColor,
            fill: isActive ? '#ef4444' : 'transparent',
          }}
        />
      </m.div>
    </m.button>
  );
});
