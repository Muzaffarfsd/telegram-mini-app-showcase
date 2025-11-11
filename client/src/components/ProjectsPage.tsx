import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { demoApps } from "../data/demoApps";
import { 
  ModernClothingIcon,
  ModernElectronicsIcon,
  ModernBeautyIcon,
  ModernRestaurantIcon,
  ModernCoffeeIcon,
  ModernWatchIcon,
  ModernHomeDecorIcon,
  ModernSneakerIcon,
  ModernTeaIcon,
  ModernGadgetIcon,
  ModernFitnessIcon,
  ModernYogaIcon,
  ModernCarServiceIcon,
  ModernEducationIcon,
  ModernPetShopIcon,
  ModernBookstoreIcon,
  ModernFlowerIcon,
  ModernGamingIcon,
  ModernMedicalIcon,
  ModernLuggageIcon,
} from "./ModernAnimatedIcons";
import { getBusinessIcon } from './PremiumBusinessIcons';

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

// Маппинг современных иконок для каждого бизнеса (2025 Phosphor Design)
const getAnimatedIcon = (appId: string) => {
  const iconMap: Record<string, JSX.Element> = {
    'clothing-store': <ModernClothingIcon />,
    'electronics': <ModernElectronicsIcon />,
    'beauty': <ModernBeautyIcon />,
    'restaurant': <ModernRestaurantIcon />,
    'coffee': <ModernCoffeeIcon />,
    'luxury-watches': <ModernWatchIcon />,
    'home-decor': <ModernHomeDecorIcon />,
    'sneaker-store': <ModernSneakerIcon />,
    'premium-tea': <ModernTeaIcon />,
    'tech-gadgets': <ModernGadgetIcon />,
    'fitness-club': <ModernFitnessIcon />,
    'yoga-studio': <ModernYogaIcon />,
    'car-service': <ModernCarServiceIcon />,
    'online-education': <ModernEducationIcon />,
    'pet-shop': <ModernPetShopIcon />,
    'bookstore': <ModernBookstoreIcon />,
    'flower-delivery': <ModernFlowerIcon />,
    'luxury-perfume': <ModernBeautyIcon />,
    'gaming-gear': <ModernGamingIcon />,
    'medical': <ModernMedicalIcon />,
    'car-rental': <ModernLuggageIcon />,
  };
  
  return iconMap[appId] || <ModernClothingIcon />;
};

// Заголовки карточек приложений
const getSellingTitle = (appId: string): { title: string; stat: string; statLabel: string } => {
  const sellingTitles: Record<string, { title: string; stat: string; statLabel: string }> = {
    'clothing-store': { 
      title: 'Магазин одежды', 
      stat: '5K+',
      statLabel: 'клиентов'
    },
    'electronics': { 
      title: 'Магазин электроники', 
      stat: '500+',
      statLabel: 'товаров'
    },
    'beauty': { 
      title: 'Салон красоты', 
      stat: '24/7',
      statLabel: 'онлайн запись'
    },
    'restaurant': { 
      title: 'Ресторан', 
      stat: '30 мин',
      statLabel: 'доставка'
    },
    'coffee': { 
      title: 'Кофейня', 
      stat: '95%',
      statLabel: 'возвратов'
    },
    'luxury-watches': { 
      title: 'Часовой магазин', 
      stat: '50+',
      statLabel: 'брендов'
    },
    'home-decor': { 
      title: 'Магазин декора', 
      stat: 'AR',
      statLabel: 'примерка'
    },
    'sneaker-store': { 
      title: 'Магазин кроссовок', 
      stat: 'NEW',
      statLabel: 'релизы'
    },
    'premium-tea': { 
      title: 'Чайный магазин', 
      stat: '80+',
      statLabel: 'сортов'
    },
    'tech-gadgets': { 
      title: 'Гаджеты', 
      stat: 'NEW',
      statLabel: 'новинки'
    },
    'fitness-club': { 
      title: 'Фитнес-клуб', 
      stat: '24/7',
      statLabel: 'доступ'
    },
    'yoga-studio': { 
      title: 'Йога-студия', 
      stat: 'LIVE',
      statLabel: 'трансляции'
    },
    'car-service': { 
      title: 'Автосервис', 
      stat: '15 мин',
      statLabel: 'диагностика'
    },
    'online-education': { 
      title: 'Онлайн-образование', 
      stat: '3 мес',
      statLabel: 'обучение'
    },
    'pet-shop': { 
      title: 'Зоомагазин', 
      stat: '60 мин',
      statLabel: 'доставка'
    },
    'bookstore': { 
      title: 'Книжный магазин', 
      stat: '5000+',
      statLabel: 'книг'
    },
    'flower-delivery': { 
      title: 'Доставка цветов', 
      stat: '1 час',
      statLabel: 'доставка'
    },
    'luxury-perfume': { 
      title: 'Парфюмерия', 
      stat: '100+',
      statLabel: 'ароматов'
    },
    'gaming-gear': { 
      title: 'Игровое оборудование', 
      stat: 'PRO',
      statLabel: 'качество'
    },
    'medical': { 
      title: 'Медицинские услуги', 
      stat: '2 мин',
      statLabel: 'ответ'
    },
    'car-rental': { 
      title: 'Аренда авто', 
      stat: '0₽',
      statLabel: 'залог'
    },
  };
  
  return sellingTitles[appId] || { title: 'Готовое приложение', stat: '24ч', statLabel: 'до запуска' };
};

// 2025 BOLD VIBRANT GLOWS (усиленная яркость + насыщенность)
const uniqueGlows = [
  { 
    name: 'Emerald Dream',
    borderGlow: '0 0 40px rgba(16, 185, 129, 0.9), 0 0 80px rgba(16, 185, 129, 0.6), 0 0 120px rgba(16, 185, 129, 0.3), inset 0 0 30px rgba(16, 185, 129, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #10B981, #34D399, #10B981, #059669)',
    glowColor: '#10B981'
  },
  { 
    name: 'Purple Haze',
    borderGlow: '0 0 40px rgba(168, 85, 247, 0.9), 0 0 80px rgba(168, 85, 247, 0.6), 0 0 120px rgba(168, 85, 247, 0.3), inset 0 0 30px rgba(168, 85, 247, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #A855F7, #C084FC, #A855F7, #7C3AED)',
    glowColor: '#A855F7'
  },
  { 
    name: 'Cyan Spark',
    borderGlow: '0 0 40px rgba(6, 182, 212, 0.9), 0 0 80px rgba(6, 182, 212, 0.6), 0 0 120px rgba(6, 182, 212, 0.3), inset 0 0 30px rgba(6, 182, 212, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #06B6D4, #22D3EE, #06B6D4, #0891B2)',
    glowColor: '#06B6D4'
  },
  { 
    name: 'Rose Fire',
    borderGlow: '0 0 40px rgba(244, 63, 94, 0.9), 0 0 80px rgba(244, 63, 94, 0.6), 0 0 120px rgba(244, 63, 94, 0.3), inset 0 0 30px rgba(244, 63, 94, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #F43F5E, #FB7185, #F43F5E, #E11D48)',
    glowColor: '#F43F5E'
  },
  { 
    name: 'Blue Ocean',
    borderGlow: '0 0 40px rgba(59, 130, 246, 0.9), 0 0 80px rgba(59, 130, 246, 0.6), 0 0 120px rgba(59, 130, 246, 0.3), inset 0 0 30px rgba(59, 130, 246, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #3B82F6, #60A5FA, #3B82F6, #2563EB)',
    glowColor: '#3B82F6'
  },
  { 
    name: 'Orange Sunset',
    borderGlow: '0 0 40px rgba(249, 115, 22, 0.9), 0 0 80px rgba(249, 115, 22, 0.6), 0 0 120px rgba(249, 115, 22, 0.3), inset 0 0 30px rgba(249, 115, 22, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #F97316, #FB923C, #F97316, #EA580C)',
    glowColor: '#F97316'
  },
  { 
    name: 'Pink Magic',
    borderGlow: '0 0 40px rgba(236, 72, 153, 0.9), 0 0 80px rgba(236, 72, 153, 0.6), 0 0 120px rgba(236, 72, 153, 0.3), inset 0 0 30px rgba(236, 72, 153, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #EC4899, #F472B6, #EC4899, #DB2777)',
    glowColor: '#EC4899'
  },
  { 
    name: 'Indigo Night',
    borderGlow: '0 0 40px rgba(99, 102, 241, 0.9), 0 0 80px rgba(99, 102, 241, 0.6), 0 0 120px rgba(99, 102, 241, 0.3), inset 0 0 30px rgba(99, 102, 241, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #6366F1, #818CF8, #6366F1, #4F46E5)',
    glowColor: '#6366F1'
  },
  { 
    name: 'Teal Wave',
    borderGlow: '0 0 40px rgba(20, 184, 166, 0.9), 0 0 80px rgba(20, 184, 166, 0.6), 0 0 120px rgba(20, 184, 166, 0.3), inset 0 0 30px rgba(20, 184, 166, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #14B8A6, #2DD4BF, #14B8A6, #0D9488)',
    glowColor: '#14B8A6'
  },
  { 
    name: 'Amber Glow',
    borderGlow: '0 0 40px rgba(245, 158, 11, 0.9), 0 0 80px rgba(245, 158, 11, 0.6), 0 0 120px rgba(245, 158, 11, 0.3), inset 0 0 30px rgba(245, 158, 11, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #F59E0B, #FBB03C, #F59E0B, #D97706)',
    glowColor: '#F59E0B'
  },
  { 
    name: 'Lime Energy',
    borderGlow: '0 0 40px rgba(132, 204, 22, 0.9), 0 0 80px rgba(132, 204, 22, 0.6), 0 0 120px rgba(132, 204, 22, 0.3), inset 0 0 30px rgba(132, 204, 22, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #84CC16, #A3E635, #84CC16, #65A30D)',
    glowColor: '#84CC16'
  },
  { 
    name: 'Fuchsia Pulse',
    borderGlow: '0 0 40px rgba(217, 70, 239, 0.9), 0 0 80px rgba(217, 70, 239, 0.6), 0 0 120px rgba(217, 70, 239, 0.3), inset 0 0 30px rgba(217, 70, 239, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #D946EF, #E879F9, #D946EF, #C026D3)',
    glowColor: '#D946EF'
  },
  { 
    name: 'Sky Breeze',
    borderGlow: '0 0 40px rgba(14, 165, 233, 0.9), 0 0 80px rgba(14, 165, 233, 0.6), 0 0 120px rgba(14, 165, 233, 0.3), inset 0 0 30px rgba(14, 165, 233, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #0EA5E9, #38BDF8, #0EA5E9, #0284C7)',
    glowColor: '#0EA5E9'
  },
  { 
    name: 'Violet Storm',
    borderGlow: '0 0 40px rgba(139, 92, 246, 0.9), 0 0 80px rgba(139, 92, 246, 0.6), 0 0 120px rgba(139, 92, 246, 0.3), inset 0 0 30px rgba(139, 92, 246, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #8B5CF6, #A78BFA, #8B5CF6, #7C3AED)',
    glowColor: '#8B5CF6'
  },
  { 
    name: 'Red Inferno',
    borderGlow: '0 0 40px rgba(239, 68, 68, 0.9), 0 0 80px rgba(239, 68, 68, 0.6), 0 0 120px rgba(239, 68, 68, 0.3), inset 0 0 30px rgba(239, 68, 68, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #EF4444, #F87171, #EF4444, #DC2626)',
    glowColor: '#EF4444'
  },
  { 
    name: 'Green Forest',
    borderGlow: '0 0 40px rgba(34, 197, 94, 0.9), 0 0 80px rgba(34, 197, 94, 0.6), 0 0 120px rgba(34, 197, 94, 0.3), inset 0 0 30px rgba(34, 197, 94, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #22C55E, #4ADE80, #22C55E, #16A34A)',
    glowColor: '#22C55E'
  },
  { 
    name: 'Yellow Sun',
    borderGlow: '0 0 40px rgba(234, 179, 8, 0.9), 0 0 80px rgba(234, 179, 8, 0.6), 0 0 120px rgba(234, 179, 8, 0.3), inset 0 0 30px rgba(234, 179, 8, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #EAB308, #FDE047, #EAB308, #CA8A04)',
    glowColor: '#EAB308'
  },
  { 
    name: 'Slate Mystery',
    borderGlow: '0 0 40px rgba(148, 163, 184, 0.9), 0 0 80px rgba(148, 163, 184, 0.6), 0 0 120px rgba(148, 163, 184, 0.3), inset 0 0 30px rgba(148, 163, 184, 0.2)',
    animatedBorder: 'linear-gradient(135deg, #94A3B8, #CBD5E1, #94A3B8, #64748B)',
    glowColor: '#94A3B8'
  },
];

function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Получаем уникальные категории
  const categories = useMemo(() => {
    const cats = new Set(demoApps.map(app => app.category));
    return ["Все", ...Array.from(cats)];
  }, []);

  // Фильтрация приложений
  const filteredApps = useMemo(() => {
    return demoApps.filter(app => {
      const matchesSearch = 
        app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "Все" || app.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden pb-24">
      {/* Mobile Container как на главной странице */}
      <div className="max-w-md mx-auto min-h-screen p-4 relative z-10">
        
        {/* Header - Clean Typography */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 mt-6"
        >
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            Витрина
          </h1>
          <p className="text-white/70 text-base font-medium tracking-wide mb-3">
            10 готовых бизнес-приложений
          </p>
          <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
            Запусти своё дело за 24 часа. Каждое приложение — твой успех.
          </p>
        </motion.div>

        {/* Search Bar - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
              <Search className="w-5 h-5 text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none font-elegant"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Categories - Horizontal Scroll with Glow Effects */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-4 -mx-4 px-4"
        >
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
               style={{
                 scrollbarWidth: 'none',
                 msOverflowStyle: 'none',
                 WebkitOverflowScrolling: 'touch'
               }}>
            {categories.map((category, index) => {
              const isSelected = selectedCategory === category;
              
              // Разные цвета свечения для каждой категории
              const glowColors = [
                { from: 'from-emerald-500/40', to: 'to-cyan-500/40', glow: 'rgba(16, 185, 129, 0.5)' },
                { from: 'from-purple-500/40', to: 'to-pink-500/40', glow: 'rgba(168, 85, 247, 0.5)' },
                { from: 'from-blue-500/40', to: 'to-cyan-500/40', glow: 'rgba(59, 130, 246, 0.5)' },
                { from: 'from-orange-500/40', to: 'to-amber-500/40', glow: 'rgba(249, 115, 22, 0.5)' },
                { from: 'from-rose-500/40', to: 'to-pink-500/40', glow: 'rgba(244, 63, 94, 0.5)' },
                { from: 'from-indigo-500/40', to: 'to-purple-500/40', glow: 'rgba(99, 102, 241, 0.5)' },
              ];
              
              const categoryColor = glowColors[index % glowColors.length];
              
              return (
                <motion.button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative rounded-xl transition-all flex-shrink-0 group overflow-hidden"
                >
                  {/* Glow effect - contained inside button with overflow-hidden */}
                  {isSelected && (
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-r ${categoryColor.from} ${categoryColor.to}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Hover glow effect - contained inside */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${categoryColor.from} ${categoryColor.to} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
                  />
                  
                  {/* Glass background */}
                  <div className={`relative bg-white/10 backdrop-blur-xl border rounded-xl px-4 py-2 ${
                    isSelected
                      ? 'border-white/40'
                      : 'border-white/10 group-hover:border-white/30'
                  }`}>
                    <span className={`text-xs font-medium whitespace-nowrap transition-colors ${
                      isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/90'
                    }`}>
                      {category}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Count - Elegant */}
        <div className="mb-6">
          <p className="text-white/40 text-sm font-elegant tracking-wider">
            {filteredApps.length} из {demoApps.length}
          </p>
        </div>

        {/* Cards - Вертикальный стек как на главной странице */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredApps.map((app, index) => {
              const cardGlow = uniqueGlows[index % uniqueGlows.length];
              const isAlternate = index % 2 === 1;

              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onOpenDemo(app.id)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseLeave={() => setMousePosition(null)}
                  className="cursor-pointer relative"
                >
                  {isAlternate ? (
                    // VERTICAL CARD - Liquid Glass 2025
                    <div className="relative group h-[400px] rounded-3xl overflow-visible transform group-hover:scale-[1.01] transition-transform duration-500">
                      
                      {/* Animated Glow Border */}
                      <motion.div
                        className="absolute inset-0 rounded-3xl"
                        style={{
                          background: cardGlow.animatedBorder,
                          backgroundSize: '200% 200%',
                          boxShadow: cardGlow.borderGlow,
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />

                      {/* Black Liquid Glass Card - ULTRA BLUR */}
                      <div className="absolute inset-[2px] rounded-3xl bg-black/90 backdrop-blur-3xl overflow-hidden">
                        
                        {/* 2025 SPOTLIGHT HOVER EFFECT (Desktop) */}
                        {mousePosition && (
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${cardGlow.glowColor}40, transparent 40%)`,
                            }}
                          />
                        )}
                        
                        {/* MOBILE GLOW EFFECT - Усиленное свечение для мобильных */}
                        <div className="absolute inset-0 opacity-60">
                          <motion.div
                            className="absolute top-0 left-0 w-64 h-64 rounded-full blur-[100px]"
                            style={{ backgroundColor: cardGlow.glowColor }}
                            animate={{
                              x: [0, 50, 0],
                              y: [0, 50, 0],
                              opacity: [0.4, 0.7, 0.4],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-[120px]"
                            style={{ backgroundColor: cardGlow.glowColor }}
                            animate={{
                              x: [0, -60, 0],
                              y: [0, -60, 0],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[140px]"
                            style={{ backgroundColor: cardGlow.glowColor }}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>

                        {/* Content Container with ENHANCED Glassmorphic Inner Card */}
                        <div className="absolute inset-4 flex flex-col justify-between pointer-events-none">
                          <div className="h-full w-full rounded-2xl bg-white/10 backdrop-blur-2xl border-2 border-white/30 group-hover:border-white/50 p-5 flex flex-col justify-between transition-all duration-500 pointer-events-auto"
                            style={{
                              boxShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(255, 255, 255, 0.1), 0 0 40px ${cardGlow.glowColor}40, 0 0 80px ${cardGlow.glowColor}20`,
                            }}
                          >
                          
                          {/* Top - Badge */}
                          <div className="flex items-start justify-between">
                            {app.badge && (
                              <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                <span className="text-[10px] font-semibold text-white tracking-wide uppercase">
                                  {app.badge}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Center - Title + Description + Stat */}
                          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
                            <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">
                              {getSellingTitle(app.id).title}
                            </h3>
                            
                            {/* Продающее описание */}
                            <p className="text-sm font-normal text-white/90 line-clamp-2 px-2">
                              {app.description}
                            </p>
                            
                            {/* Stat Block (как "100+ товаров") */}
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl w-full max-w-[180px]">
                              <div className="text-2xl font-semibold text-white">
                                {getSellingTitle(app.id).stat}
                              </div>
                              <div className="text-xs font-medium text-white/80 mt-0.5">
                                {getSellingTitle(app.id).statLabel}
                              </div>
                            </div>
                          </div>

                          {/* Bottom - CTA */}
                          <div className="flex items-center justify-center">
                            <div className="text-white/60 text-xs font-medium tracking-wide group-hover:text-white transition-colors duration-300">
                              Открыть приложение →
                            </div>
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // HORIZONTAL CARD - Liquid Glass 2025
                    <div className="relative group h-[280px] rounded-3xl overflow-visible transform group-hover:scale-[1.01] transition-transform duration-500">
                      
                      {/* Animated Glow Border */}
                      <motion.div
                        className="absolute inset-0 rounded-3xl"
                        style={{
                          background: cardGlow.animatedBorder,
                          backgroundSize: '200% 200%',
                          boxShadow: cardGlow.borderGlow,
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />

                      {/* Black Liquid Glass Card - ULTRA BLUR */}
                      <div className="absolute inset-[2px] rounded-3xl bg-black/90 backdrop-blur-3xl overflow-hidden">
                        
                        {/* 2025 SPOTLIGHT HOVER EFFECT (Desktop) */}
                        {mousePosition && (
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${cardGlow.glowColor}40, transparent 40%)`,
                            }}
                          />
                        )}
                        
                        {/* MOBILE GLOW EFFECT - Усиленное свечение для мобильных */}
                        <div className="absolute inset-0 opacity-60">
                          <motion.div
                            className="absolute top-0 right-0 w-56 h-56 rounded-full blur-[100px]"
                            style={{ backgroundColor: cardGlow.glowColor }}
                            animate={{
                              x: [0, -40, 0],
                              y: [0, 40, 0],
                              opacity: [0.4, 0.7, 0.4],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[120px]"
                            style={{ backgroundColor: cardGlow.glowColor }}
                            animate={{
                              x: [0, 40, 0],
                              y: [0, -40, 0],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[140px]"
                            style={{ backgroundColor: cardGlow.glowColor }}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.3, 0.6, 0.3],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>

                        {/* ENHANCED Glassmorphic Content Container */}
                        <div className="absolute inset-4 rounded-2xl bg-white/10 backdrop-blur-2xl border-2 border-white/30 group-hover:border-white/50 p-6 flex flex-col justify-between transition-all duration-500"
                          style={{
                            boxShadow: `inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(255, 255, 255, 0.1), 0 0 40px ${cardGlow.glowColor}40, 0 0 80px ${cardGlow.glowColor}20`,
                          }}
                        >
                          
                          {/* Top - Badge */}
                          <div className="flex items-start justify-between">
                            {app.badge && (
                              <div className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                <span className="text-[10px] font-semibold text-white tracking-wide uppercase">
                                  {app.badge}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Center - Title + Description + Stat Block */}
                          <div className="space-y-3">
                            <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">
                              {getSellingTitle(app.id).title}
                            </h3>
                            
                            {/* Продающее описание */}
                            <p className="text-sm font-normal text-white/90 line-clamp-2">
                              {app.description}
                            </p>
                            
                            {/* Stat Block (как "100+ товаров") */}
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl inline-block">
                              <div className="text-2xl font-semibold text-white">
                                {getSellingTitle(app.id).stat}
                              </div>
                              <div className="text-xs font-medium text-white/80 mt-0.5">
                                {getSellingTitle(app.id).statLabel}
                              </div>
                            </div>
                          </div>

                          {/* Bottom - CTA */}
                          <div className="flex items-center justify-center">
                            <div className="text-white/60 text-sm font-medium tracking-wide group-hover:text-white transition-colors duration-300">
                              Открыть приложение →
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover shine effect */}
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State - Elegant */}
        {filteredApps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <h3 className="text-white text-3xl font-bold mb-3 font-luxury">
              Ничего не найдено
            </h3>
            <p className="text-white/40 text-base font-elegant">
              Измените запрос
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ProjectsPage);
