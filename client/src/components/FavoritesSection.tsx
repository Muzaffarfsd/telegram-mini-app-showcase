import { memo, useMemo } from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useFavorites } from '@/hooks/useTelegramStorage';
import { FavoriteButton } from './FavoriteButton';

interface Demo {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
}

const DEMO_DATA: Record<string, Demo> = {
  'clothing-store': { id: 'clothing-store', name: 'Fashion Store', description: 'Каталог одежды', category: 'Fashion', imageUrl: '' },
  'luxury-watches': { id: 'luxury-watches', name: 'Watch Store', description: 'Премиум часы', category: 'Luxury', imageUrl: '' },
  'sneaker-store': { id: 'sneaker-store', name: 'Sneaker Store', description: 'Лимитки, предзаказы', category: 'Fashion', imageUrl: '' },
  'restaurant': { id: 'restaurant', name: 'Restaurant', description: 'Меню и бронирование', category: 'Food', imageUrl: '' },
  'fitness': { id: 'fitness', name: 'Fitness Club', description: 'Тренировки и абонементы', category: 'Health', imageUrl: '' },
  'beauty': { id: 'beauty', name: 'Beauty Salon', description: 'Услуги и запись', category: 'Beauty', imageUrl: '' },
  'electronics': { id: 'electronics', name: 'Electronics', description: 'Гаджеты и техника', category: 'Tech', imageUrl: '' },
  'florist': { id: 'florist', name: 'Florist', description: 'Букеты и доставка', category: 'Gifts', imageUrl: '' },
  'taxi': { id: 'taxi', name: 'Taxi', description: 'Заказ такси', category: 'Transport', imageUrl: '' },
  'banking': { id: 'banking', name: 'Banking', description: 'Финансовые услуги', category: 'Finance', imageUrl: '' },
  'courses': { id: 'courses', name: 'Courses', description: 'Онлайн обучение', category: 'Education', imageUrl: '' },
  'bookstore': { id: 'bookstore', name: 'Bookstore', description: 'Книги и аудиокниги', category: 'Books', imageUrl: '' },
  'carwash': { id: 'carwash', name: 'Car Wash', description: 'Автомойка', category: 'Auto', imageUrl: '' },
  'nft': { id: 'nft', name: 'NFT Gallery', description: 'Коллекции NFT', category: 'Crypto', imageUrl: '' },
  'ai-agent': { id: 'ai-agent', name: 'AI Agent', description: 'AI ассистент', category: 'AI', imageUrl: '' },
  'fragrance': { id: 'fragrance', name: 'Fragrance', description: 'Парфюмерия', category: 'Beauty', imageUrl: '' },
  'lab': { id: 'lab', name: 'Lab Store', description: 'Экипировка', category: 'Outdoor', imageUrl: '' },
  'real-estate': { id: 'real-estate', name: 'Real Estate', description: 'Недвижимость', category: 'Property', imageUrl: '' },
};

interface FavoritesSectionProps {
  onOpenDemo: (demoId: string) => void;
}

export const FavoritesSection = memo(function FavoritesSection({
  onOpenDemo,
}: FavoritesSectionProps) {
  const { favorites, isLoading, count } = useFavorites();

  const favoriteDemos = useMemo(() => {
    return favorites
      .map(id => DEMO_DATA[id])
      .filter(Boolean);
  }, [favorites]);

  if (isLoading || count === 0) {
    return null;
  }

  return (
    <m.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="pb-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4" style={{ color: '#ef4444', fill: '#ef4444' }} />
        <h2 
          className="text-[13px] font-medium tracking-[0.08em] uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Избранное ({count})
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {favoriteDemos.map((demo) => (
            <m.div
              key={demo.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex-shrink-0 w-[140px] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => onOpenDemo(demo.id)}
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              data-testid={`favorite-card-${demo.id}`}
            >
              <div className="p-4">
                <div className="absolute top-2 right-2">
                  <FavoriteButton demoId={demo.id} size="sm" />
                </div>
                
                <div 
                  className="text-[10px] uppercase tracking-wider mb-2 px-2 py-1 rounded-full inline-block"
                  style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                  }}
                >
                  {demo.category}
                </div>
                
                <h3 
                  className="text-[15px] font-semibold mb-1 line-clamp-1"
                  style={{ color: '#FFFFFF' }}
                >
                  {demo.name}
                </h3>
                
                <p 
                  className="text-[12px] line-clamp-2"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                >
                  {demo.description}
                </p>

                <div 
                  className="mt-3 flex items-center justify-center w-full py-2 rounded-lg text-[12px] font-medium gap-1"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                >
                  Открыть <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </div>
    </m.section>
  );
});
