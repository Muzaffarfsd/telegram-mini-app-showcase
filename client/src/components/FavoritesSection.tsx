import { memo, useMemo, useEffect } from 'react';
import { Heart, ArrowUpRight, X } from 'lucide-react';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useHaptic } from '@/hooks/useHaptic';
import { demoApps } from '@/data/demoApps';
import { useLanguage } from '../contexts/LanguageContext';

interface FavoritesSectionProps {
  onOpenDemo: (demoId: string) => void;
}

export const FavoritesSection = memo(function FavoritesSection({
  onOpenDemo,
}: FavoritesSectionProps) {
  const { favorites, isLoading, toggle, initialize, isInitialized } = useFavoritesStore();
  const haptic = useHaptic();
  const { t } = useLanguage();
  
  const getPluralApps = (count: number) => {
    if (count === 1) return t('favorites.app');
    if (count >= 2 && count <= 4) return t('favorites.apps2to4');
    return t('favorites.apps5plus');
  };

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

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

  if (isLoading || favorites.length === 0) {
    return null;
  }

  return (
    <section
      className="favorites-section mx-5 mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div 
        className="relative overflow-hidden rounded-[20px]"
        style={{
          background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.08) 0%, rgba(139, 92, 246, 0.04) 50%, rgba(59, 130, 246, 0.06) 100%)',
          backdropFilter: 'blur(16px) saturate(150%)',
          WebkitBackdropFilter: 'blur(16px) saturate(150%)',
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
                {t('favorites.title')}
              </h2>
              <p 
                className="text-[12px]"
                style={{ color: 'rgba(167, 139, 250, 0.8)' }}
              >
                {favorites.length} {getPluralApps(favorites.length)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {favoriteDemos.map((demo, index) => (
              <div
                key={demo!.id}
                className="relative flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all duration-200 active:scale-[0.98] animate-in fade-in slide-in-from-left-2"
                onClick={() => onOpenDemo(demo!.id)}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  animationDelay: `${index * 50}ms`,
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
                  <button
                    onClick={(e) => handleRemove(e, demo!.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 active:scale-[0.9]"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                    }}
                    data-testid={`button-remove-favorite-${demo!.id}`}
                  >
                    <X className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
                  </button>
                  
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
