import { memo, useMemo } from 'react';
import { Heart, ArrowUpRight, X } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useFavorites } from '@/hooks/useTelegramStorage';
import { useHaptic } from '@/hooks/useHaptic';
import { demoApps } from '@/data/demoApps';

interface FavoritesSectionProps {
  onOpenDemo: (demoId: string) => void;
}

export const FavoritesSection = memo(function FavoritesSection({
  onOpenDemo,
}: FavoritesSectionProps) {
  const { favorites, isLoading, count, toggle } = useFavorites();
  const haptic = useHaptic();

  const favoriteDemos = useMemo(() => {
    return favorites
      .map(id => demoApps.find(app => app.id === id))
      .filter(Boolean);
  }, [favorites]);

  const handleRemove = async (e: React.MouseEvent, demoId: string) => {
    e.stopPropagation();
    haptic.medium();
    await toggle(demoId);
  };

  if (isLoading || count === 0) {
    return null;
  }

  return (
    <m.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-5 mb-6"
    >
      <div 
        className="relative overflow-hidden rounded-[20px]"
        style={{
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(139, 92, 246, 0.04) 50%, rgba(59, 130, 246, 0.06) 100%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(167, 139, 250, 0.15)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-[1px]" 
          style={{ 
            background: 'linear-gradient(90deg, transparent 0%, rgba(167, 139, 250, 0.4) 50%, transparent 100%)' 
          }} 
        />
        
        <div 
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />

        <div className="relative p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <div 
              className="flex items-center justify-center w-7 h-7 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              <Heart className="w-3.5 h-3.5" style={{ color: '#ef4444', fill: '#ef4444' }} />
            </div>
            <div>
              <h2 
                className="text-[15px] font-semibold"
                style={{ color: '#FAFAFA', letterSpacing: '-0.01em' }}
              >
                Избранное
              </h2>
              <p 
                className="text-[12px]"
                style={{ color: 'rgba(167, 139, 250, 0.8)' }}
              >
                {count} {count === 1 ? 'приложение' : count < 5 ? 'приложения' : 'приложений'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {favoriteDemos.map((demo) => (
                <m.div
                  key={demo!.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 10 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-3 p-3 rounded-xl cursor-pointer group"
                  onClick={() => onOpenDemo(demo!.id)}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                  data-testid={`favorite-card-${demo!.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-[14px] font-medium truncate"
                      style={{ color: '#FFFFFF' }}
                    >
                      {demo!.title}
                    </h3>
                    <p 
                      className="text-[12px] truncate"
                      style={{ color: 'rgba(255, 255, 255, 0.45)' }}
                    >
                      {demo!.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <m.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleRemove(e, demo!.id)}
                      className="flex items-center justify-center w-7 h-7 rounded-full transition-colors"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.15)',
                      }}
                      data-testid={`button-remove-favorite-${demo!.id}`}
                    >
                      <X className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                    </m.button>
                    
                    <div 
                      className="flex items-center justify-center w-7 h-7 rounded-full"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </div>
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </m.section>
  );
});
