import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Star, TrendingUp, Sparkles } from "lucide-react";
import { useTelegram } from '../hooks/useTelegram';
import { demoApps } from '@/data/demoApps';

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

// Простая карточка приложения
const AppCard: React.FC<{
  app: typeof demoApps[0];
  onOpen: () => void;
  index: number;
}> = ({ app, onOpen, index }) => {
  const { hapticFeedback } = useTelegram();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => {
        hapticFeedback?.light();
        onOpen();
      }}
      className="bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden cursor-pointer hover:bg-white/10 transition-all duration-300 border border-white/10"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={app.image} 
          alt={app.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {app.badge && (
          <div 
            className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${app.badgeColor || 'bg-emerald-500'} text-white`}
          >
            {app.badge}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2">{app.title}</h3>
        <p className="text-white/60 text-sm mb-4">{app.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-white/50 text-sm">
              <Heart className="w-4 h-4" />
              <span>{app.likes}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-white/50 text-sm">{app.category}</span>
          </div>
          
          <Star className="w-5 h-5 text-yellow-400" />
        </div>
      </div>
    </motion.div>
  );
};

export default function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Все', icon: '📱' },
    { id: 'ecommerce', label: 'Магазины', icon: '🛍️' },
    { id: 'services', label: 'Услуги', icon: '⚡' },
    { id: 'premium', label: 'Премиум', icon: '💎' },
  ];

  const filteredApps = selectedCategory === 'all' 
    ? demoApps 
    : demoApps.filter(app => {
        if (selectedCategory === 'premium') return app.badge;
        if (selectedCategory === 'ecommerce') return app.category.includes('коммерц');
        if (selectedCategory === 'services') return app.category.includes('Услуг') || app.category.includes('Сервис');
        return true;
      });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0B] to-[#1A1A1E] tg-content-safe-bottom">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-white/10">
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Витрина</h1>
              <p className="text-white/50 text-sm">15 готовых приложений</p>
            </div>
          </motion.div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all
                  ${selectedCategory === category.id 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }
                `}
              >
                {category.icon} {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">
            {selectedCategory === 'all' ? 'Все приложения' : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>{filteredApps.length} шт</span>
          </div>
        </div>

        {filteredApps.map((app, index) => (
          <AppCard
            key={app.id}
            app={app}
            onOpen={() => onOpenDemo(app.id)}
            index={index}
          />
        ))}

        {filteredApps.length === 0 && (
          <div className="text-center py-20">
            <div className="text-white/30 text-sm">Приложений не найдено</div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-8 text-center"
        >
          <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
          <h3 className="text-2xl font-black text-white mb-2">Создай своё приложение</h3>
          <p className="text-white/90 mb-6">Начни с готового шаблона уже сегодня</p>
          <button
            onClick={() => onNavigate('constructor')}
            className="px-8 py-4 bg-white text-emerald-600 rounded-full font-bold hover:shadow-xl transition-all"
          >
            Начать сейчас
          </button>
        </motion.div>
      </div>
    </div>
  );
}
