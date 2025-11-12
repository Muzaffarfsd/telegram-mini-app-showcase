import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  Palette, 
  ShoppingBag, 
  Coffee, 
  Smartphone,
  Heart,
  Star,
  TrendingUp,
  ArrowRight,
  Grid3x3,
  Layers,
  Gem,
  Crown,
  Award
} from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { demoApps } from '@/data/demoApps';

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const categories = [
  { id: 'all', label: 'Все', icon: Grid3x3 },
  { id: 'premium', label: 'Премиум', icon: Crown },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
  { id: 'beauty', label: 'Красота', icon: Sparkles },
  { id: 'food', label: 'Еда', icon: Coffee },
  { id: 'tech', label: 'Технологии', icon: Smartphone },
];

const DynamicIslandHero: React.FC<{ onExpand: () => void }> = ({ onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExpanded(true);
      setTimeout(() => setShowContent(true), 300);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ width: 120, height: 40, borderRadius: 40 }}
      animate={{ 
        width: isExpanded ? '100%' : 120,
        height: isExpanded ? 200 : 40,
        borderRadius: isExpanded ? 40 : 40
      }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
      className="mx-auto mb-8 overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #0A0A0B 0%, #1A1A1E 100%)',
        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3), 0 0 80px rgba(16, 185, 129, 0.1)',
      }}
    >
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 h-full flex flex-col justify-center items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                stiffness: 400,
                damping: 15
              }}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4"
              style={{
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-5xl font-black tracking-tight text-white mb-2">
              Showcase
            </h1>
            
            <p className="text-white/60 text-sm font-semibold tracking-wide">
              ПРЕМИУМ ПРИЛОЖЕНИЯ 2025
            </p>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CategoryPills: React.FC<{ 
  selected: string; 
  onSelect: (id: string) => void;
}> = ({ selected, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-12 -mx-4 px-4 overflow-hidden">
      <div 
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isSelected = selected === category.id;
          
          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(category.id)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all duration-500"
              style={{
                background: isSelected 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: isSelected 
                  ? '2px solid rgba(16, 185, 129, 0.5)'
                  : '2px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected
                  ? '0 8px 32px rgba(16, 185, 129, 0.3)'
                  : '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-white/60'}`} />
              <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                {category.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

const BlobShape: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      fill="currentColor"
      d="M43.3,-76.2C56.8,-68.5,69.2,-58.1,76.9,-44.8C84.6,-31.6,87.5,-15.8,87.1,-0.3C86.7,15.3,83,30.5,75.3,43.7C67.6,56.8,56,67.8,42.7,75.3C29.4,82.8,14.7,86.7,-0.6,87.8C-15.9,88.9,-31.8,87.2,-45.4,79.8C-59,72.4,-70.3,59.3,-77.8,44.4C-85.3,29.5,-89,12.7,-88.6,-3.9C-88.2,-20.5,-83.7,-41,-74.9,-57.2C-66.1,-73.4,-53,-85.3,-38.2,-92.7C-23.4,-100.1,-7,-103,7.8,-104.8C22.6,-106.6,45.2,-107.3,43.3,-76.2Z"
      transform="translate(100 100)"
    />
  </svg>
);

const LargeAppCard: React.FC<{
  app: typeof demoApps[0];
  onOpen: () => void;
  index: number;
}> = ({ app, onOpen, index }) => {
  const { hapticFeedback } = useTelegram();
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [5, -5]), {
    stiffness: 400,
    damping: 30
  });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-5, 5]), {
    stiffness: 400,
    damping: 30
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        hapticFeedback?.medium();
        onOpen();
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="col-span-2 row-span-2 rounded-[40px] overflow-hidden cursor-pointer relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20" />
      
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={app.image} 
          alt={app.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      <motion.div
        className="absolute -top-20 -right-20 w-64 h-64 text-emerald-500/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <BlobShape className="w-full h-full" />
      </motion.div>

      <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
        <div className="flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="px-4 py-2 rounded-full text-xs font-black tracking-wide"
            style={{
              background: 'rgba(16, 185, 129, 0.9)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(16, 185, 129, 0.4)',
            }}
          >
            {app.badge || 'NEW'}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl"
          >
            <Heart className="w-4 h-4 text-white/60" />
            <span className="text-white font-bold text-sm">{app.likes}</span>
          </motion.div>
        </div>

        <div>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="text-6xl font-black text-white mb-2 tracking-tight leading-none"
          >
            {app.title}
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.5 }}
            className="text-white/70 text-lg font-semibold mb-4"
          >
            {app.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.6 }}
            className="flex items-center gap-2 text-emerald-400 group-hover:gap-4 transition-all duration-500"
          >
            <span className="font-black text-sm tracking-wide">ОТКРЫТЬ</span>
            <ArrowRight className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
};

const SmallAppCard: React.FC<{
  app: typeof demoApps[0];
  onOpen: () => void;
  index: number;
}> = ({ app, onOpen, index }) => {
  const { hapticFeedback } = useTelegram();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: index * 0.08,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      whileHover={{ 
        scale: 1.05,
        rotate: 1,
        transition: { type: 'spring', stiffness: 400, damping: 15 }
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        hapticFeedback?.impactOccurred('light');
        onOpen();
      }}
      className="rounded-[32px] overflow-hidden cursor-pointer relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20" />
      
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={app.image} 
          alt={app.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="relative h-48 p-6 flex flex-col justify-between z-10">
        <div className="flex items-center justify-between">
          {app.badge && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 + 0.2 }}
              className="w-2 h-2 rounded-full bg-emerald-400"
              style={{
                boxShadow: '0 0 16px rgba(16, 185, 129, 0.8)'
              }}
            />
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.08 + 0.3 }}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 backdrop-blur-xl ml-auto"
          >
            <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span className="text-white text-xs font-bold">{app.likes}</span>
          </motion.div>
        </div>

        <div>
          <motion.h4 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.4 }}
            className="text-2xl font-black text-white mb-1 tracking-tight"
          >
            {app.title}
          </motion.h4>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 + 0.5 }}
            className="text-white/60 text-xs font-semibold truncate"
          >
            {app.category}
          </motion.p>
        </div>
      </div>

      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 60%)',
        }}
      />
    </motion.div>
  );
};

const BentoGrid: React.FC<{
  apps: typeof demoApps;
  onOpenDemo: (id: string) => void;
}> = ({ apps, onOpenDemo }) => {
  const featuredApps = apps.slice(0, 2);
  const smallApps = apps.slice(2, 6);

  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-5xl font-black text-white mb-2 tracking-tight">
          Избранное
        </h2>
        <p className="text-white/60 font-semibold">
          Лучшие приложения недели
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {featuredApps.map((app, index) => (
          <LargeAppCard
            key={app.id}
            app={app}
            onOpen={() => onOpenDemo(app.id)}
            index={index}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {smallApps.map((app, index) => (
          <SmallAppCard
            key={app.id}
            app={app}
            onOpen={() => onOpenDemo(app.id)}
            index={index + 2}
          />
        ))}
      </div>
    </div>
  );
};

const FeaturedSection: React.FC<{
  apps: typeof demoApps;
  onOpenDemo: (id: string) => void;
}> = ({ apps, onOpenDemo }) => {
  const { hapticFeedback } = useTelegram();
  const remainingApps = apps.slice(6, 10);

  return (
    <div className="mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center"
            style={{
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
            }}
          >
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              Популярное
            </h2>
            <p className="text-white/60 font-semibold text-sm">
              Тренды этого месяца
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6">
        {remainingApps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: 'spring',
              stiffness: 200,
              damping: 25
            }}
            whileHover={{ 
              x: 8,
              transition: { type: 'spring', stiffness: 400, damping: 20 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              hapticFeedback?.impactOccurred('light');
              onOpenDemo(app.id);
            }}
            className="rounded-[32px] overflow-hidden cursor-pointer relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20" />
            
            <div className="relative p-6 flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-[24px] overflow-hidden flex-shrink-0">
                <img 
                  src={app.image} 
                  alt={app.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-2xl font-black text-white mb-1 tracking-tight truncate">
                  {app.title}
                </h4>
                <p className="text-white/60 text-sm font-semibold truncate">
                  {app.description}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xl">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold text-sm">{app.likes}</span>
                </div>
                
                <motion.div
                  className="text-emerald-400"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'easeInOut'
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>
            </div>

            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
              }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const stats = [
    { label: 'Приложений', value: '100+', icon: Grid3x3 },
    { label: 'Скачиваний', value: '1M+', icon: TrendingUp },
    { label: 'Категорий', value: '12', icon: Layers },
    { label: 'Рейтинг', value: '4.9', icon: Star },
  ];

  return (
    <div className="mb-16">
      <div className="grid grid-cols-2 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.05,
                rotate: index % 2 === 0 ? 2 : -2,
                transition: { type: 'spring', stiffness: 400, damping: 15 }
              }}
              className="rounded-[32px] overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-2 border-white/20" />
              
              <motion.div
                className="absolute -bottom-10 -right-10 w-32 h-32 text-emerald-500/5"
                animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              >
                <BlobShape className="w-full h-full" />
              </motion.div>

              <div className="relative p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: index * 0.1 + 0.2,
                    type: 'spring',
                    stiffness: 400,
                    damping: 15
                  }}
                  className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center"
                >
                  <Icon className="w-6 h-6 text-emerald-400" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-4xl font-black text-white mb-1 tracking-tight"
                >
                  {stat.value}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className="text-white/60 text-sm font-semibold"
                >
                  {stat.label}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const CTASection: React.FC<{ onNavigate: (section: string) => void }> = ({ onNavigate }) => {
  const { hapticFeedback } = useTelegram();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-24"
    >
      <div className="rounded-[40px] overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800" />
        
        <motion.div
          className="absolute -top-20 -left-20 w-64 h-64 text-white/10"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
            scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <BlobShape className="w-full h-full" />
        </motion.div>

        <motion.div
          className="absolute -bottom-20 -right-20 w-64 h-64 text-white/10"
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <BlobShape className="w-full h-full" />
        </motion.div>

        <div className="relative p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 20,
              delay: 0.6
            }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center"
            style={{
              boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)'
            }}
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-5xl font-black text-white mb-4 tracking-tight"
          >
            Создай своё
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-white/90 text-lg font-semibold mb-8 max-w-md mx-auto"
          >
            Начни создавать своё приложение с премиум дизайном уже сегодня
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              hapticFeedback?.impactOccurred('heavy');
              onNavigate('constructor');
            }}
            className="px-12 py-5 rounded-full bg-white text-emerald-600 font-black text-lg tracking-wide shadow-2xl shadow-white/30 hover:shadow-white/50 transition-all duration-500"
          >
            НАЧАТЬ СЕЙЧАС
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const filteredApps = selectedCategory === 'all' 
    ? demoApps 
    : demoApps.filter(app => {
        if (selectedCategory === 'premium') return app.badge;
        if (selectedCategory === 'ecommerce') return app.category.includes('коммерц');
        if (selectedCategory === 'beauty') return app.category.includes('Красота');
        if (selectedCategory === 'food') return app.category.includes('рестор') || app.category.includes('Еда');
        if (selectedCategory === 'tech') return app.category.includes('коммерц');
        return true;
      });

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0A0A0B 0%, #1A1A1E 100%)',
      }}
    >
      <motion.div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          y: backgroundY,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
          backgroundSize: '100% 100%',
        }}
      />

      <div className="fixed top-0 left-0 w-full h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <DynamicIslandHero onExpand={() => {}} />
        
        <CategoryPills 
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <BentoGrid apps={filteredApps} onOpenDemo={onOpenDemo} />

        <StatsSection />

        <FeaturedSection apps={filteredApps} onOpenDemo={onOpenDemo} />

        <CTASection onNavigate={onNavigate} />
      </div>

      <div className="fixed bottom-0 left-0 w-full h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
