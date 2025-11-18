import { GlassCard } from "@/components/ui/GlassCard";
import { Wallet, Settings, Zap, Gift, ChevronRight, Sparkles, TrendingUp, ShoppingBag } from "lucide-react";

interface HomeProps {
  onNavigate?: (section: string) => void;
}

export default function HomePage({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen p-5 pt-8 pb-24 space-y-8">
      
      {/* 1. Header с приветствием */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            TELEGRAM
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">
            Mini Applications
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 border-2 border-black shadow-lg shadow-blue-500/20" />
      </div>

      {/* 2. Блок Showcase Stats (Большая карточка) */}
      <GlassCard className="flex flex-col gap-6 py-6 relative group">
        {/* Фоновый градиент внутри карточки */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-2 text-gray-400 text-sm font-medium uppercase tracking-wider">
          <Sparkles size={16} />
          <span>Premium Showcase</span>
        </div>
        <div>
          <span className="text-5xl font-bold tracking-tighter drop-shadow-sm">11</span>
          <span className="text-2xl text-gray-500 font-semibold ml-2">Apps</span>
        </div>
        <div className="flex gap-3 mt-2">
             <button 
               onClick={() => onNavigate?.('showcase')}
               className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
               data-testid="button-explore-apps"
             >
                Explore Apps
             </button>
             <button 
               className="flex-1 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-semibold backdrop-blur-md transition-all active:scale-95"
               data-testid="button-learn-more"
             >
                Learn More
             </button>
        </div>
      </GlassCard>

      {/* 3. Bento Grid (Сетка меню) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Карточка "E-commerce" */}
        <GlassCard 
          onClick={() => onNavigate?.('showcase')}
          className="aspect-square flex flex-col justify-between hover:border-emerald-500/30 transition-colors cursor-pointer"
          data-testid="card-ecommerce"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">E-commerce</h3>
            <p className="text-xs text-gray-500">7 premium stores</p>
          </div>
        </GlassCard>

        {/* Карточка "Services" */}
        <GlassCard 
          onClick={() => onNavigate?.('showcase')}
          className="aspect-square flex flex-col justify-between hover:border-purple-500/30 transition-colors cursor-pointer"
          data-testid="card-services"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Services</h3>
            <p className="text-xs text-gray-500">4 business apps</p>
          </div>
        </GlassCard>

        {/* Карточка "Premium" */}
        <GlassCard 
          onClick={() => onNavigate?.('showcase')}
          className="aspect-square flex flex-col justify-between hover:border-yellow-500/30 transition-colors cursor-pointer"
          data-testid="card-premium"
        >
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Premium</h3>
            <p className="text-xs text-gray-500">Luxury brands</p>
          </div>
        </GlassCard>

        {/* Карточка "Community" */}
        <GlassCard 
          onClick={() => onNavigate?.('showcase')}
          className="aspect-square flex flex-col justify-between hover:border-pink-500/30 transition-colors cursor-pointer"
          data-testid="card-community"
        >
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400">
            <Gift size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Community</h3>
            <p className="text-xs text-gray-500">Join & Connect</p>
          </div>
        </GlassCard>

        {/* Длинная карточка настроек */}
        <GlassCard 
          className="col-span-2 flex items-center justify-between py-4 cursor-pointer hover:border-gray-500/30 transition-colors"
          data-testid="card-settings"
        >
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-700/50 flex items-center justify-center text-gray-300">
                <Settings size={20} />
              </div>
              <span className="font-semibold">Settings & Preferences</span>
           </div>
           <ChevronRight className="text-gray-600" />
        </GlassCard>
      </div>

      {/* Footer Info */}
      <div className="text-center space-y-2 pt-4">
        <p className="text-gray-500 text-xs uppercase tracking-widest">
          Premium Business Applications
        </p>
        <p className="text-gray-600 text-xs">
          Запуск за 24 часа • Без кода • Премиум качество
        </p>
      </div>
    </div>
  );
}
