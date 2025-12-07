import { useState, useEffect, memo } from "react";
import { m } from "framer-motion";
import { 
  Wallet, 
  Heart, 
  Star, 
  X,
  ChevronLeft,
  CreditCard,
  User,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Bitcoin,
  Zap,
  Shield,
  PiggyBank,
  History,
  Settings
} from "lucide-react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { LazyImage, UrgencyIndicator, TrustBadges, DemoThemeProvider } from "@/components/shared";

interface BankingProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Asset {
  id: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  image: string;
  description: string;
  category: 'Криптовалюта' | 'Акции' | 'ETF' | 'Облигации';
  rating: number;
  risk: 'Низкий' | 'Средний' | 'Высокий';
  isNew?: boolean;
  isPopular?: boolean;
}

const assets: Asset[] = [
  { id: 1, name: 'Bitcoin', symbol: 'BTC', price: 5280000, change24h: 5.2, image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=1200&fit=crop&q=90', description: 'Первая криптовалюта', category: 'Криптовалюта', rating: 4.9, risk: 'Высокий', isPopular: true },
  { id: 2, name: 'Ethereum', symbol: 'ETH', price: 175000, change24h: 3.8, image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800&h=1200&fit=crop&q=90', description: 'Платформа смарт-контрактов', category: 'Криптовалюта', rating: 4.8, risk: 'Высокий', isPopular: true },
  { id: 3, name: 'Сбербанк', symbol: 'SBER', price: 28000, change24h: 1.2, image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=1200&fit=crop&q=90', description: 'Акции Сбербанка', category: 'Акции', rating: 4.7, risk: 'Средний', isNew: true },
  { id: 4, name: 'Газпром', symbol: 'GAZP', price: 18500, change24h: -0.5, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1200&fit=crop&q=90', description: 'Акции Газпрома', category: 'Акции', rating: 4.6, risk: 'Средний', isPopular: true },
  { id: 5, name: 'S&P 500 ETF', symbol: 'SPY', price: 550000, change24h: 0.8, image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=1200&fit=crop&q=90', description: 'Фонд S&P 500', category: 'ETF', rating: 5.0, risk: 'Средний', isNew: true, isPopular: true },
  { id: 6, name: 'ОФЗ 2030', symbol: 'OFZ', price: 98000, change24h: 0.1, image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=1200&fit=crop&q=90', description: 'Облигации федерального займа', category: 'Облигации', rating: 4.9, risk: 'Низкий' },
];

const categories = ['Все', 'Криптовалюта', 'Акции', 'ETF', 'Облигации'];

const portfolios = [
  {
    id: 1,
    title: 'Агрессивный рост',
    subtitle: 'Высокая доходность',
    gradient: 'from-[var(--theme-primary)]/30 to-[var(--theme-accent)]/30',
    assets: [1, 2, 3],
    returns: '+18.5%'
  },
  {
    id: 2,
    title: 'Сбалансированный',
    subtitle: 'Оптимальный баланс',
    gradient: 'from-green-600/30 to-emerald-600/30',
    assets: [3, 4, 5],
    returns: '+12.3%'
  },
  {
    id: 3,
    title: 'Консервативный',
    subtitle: 'Низкий риск',
    gradient: 'from-purple-600/30 to-indigo-600/30',
    assets: [5, 6],
    returns: '+6.8%'
  },
];

const Banking = memo(function Banking({ activeTab }: BankingProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 2]));
  
  const [balance, setBalance] = useState(2450000);
  const [totalGain, setTotalGain] = useState(385000);
  const [gainPercent, setGainPercent] = useState(18.6);

  useEffect(() => {
    scrollToTop();
    if (activeTab !== 'catalog') {
      setSelectedAsset(null);
    }
  }, [activeTab]);

  const filteredAssets = assets.filter(a => 
    selectedCategory === 'Все' || a.category === selectedCategory
  );

  const toggleFavorite = (assetId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(assetId)) {
      newFavorites.delete(assetId);
    } else {
      newFavorites.add(assetId);
    }
    setFavorites(newFavorites);
  };

  const buyAsset = (asset: Asset, amount: number) => {
    setBalance(prev => prev - amount);
    setTotalGain(prev => prev + (amount * 0.1));
    setGainPercent(prev => prev + 0.5);
    setSelectedAsset(null);
  };

  if (activeTab === 'home') {
    return (
      <div className="h-full overflow-y-auto smooth-scroll-page">
        <div className="relative h-[280px] bg-gradient-to-br from-[var(--theme-primary)]/20 via-[var(--theme-accent)]/20 to-indigo-600/20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=800&fit=crop&q=90')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-end p-6 pb-8">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[var(--theme-primary)]/20 backdrop-blur-xl rounded-xl border border-[var(--theme-primary)]/30">
                  <Wallet className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
                </div>
                <h1 className="text-3xl font-bold text-white">MoneyHub</h1>
              </div>
              <p className="text-white/80">Умные инвестиции и крипто</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="px-3 py-2 bg-[var(--theme-primary)]/20 backdrop-blur-xl rounded-xl border border-[var(--theme-primary)]/30">
                  <p className="text-xs" style={{ color: 'var(--theme-primary)' }}>Баланс</p>
                  <p className="text-white text-lg font-bold">{balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</p>
                </div>
                <div className="px-3 py-2 bg-green-500/20 backdrop-blur-xl rounded-xl border border-green-400/30">
                  <p className="text-green-200 text-xs">Доход</p>
                  <p className="text-white text-lg font-bold">+{gainPercent}%</p>
                </div>
              </div>
            </m.div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl border border-green-400/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-500" />
                <div>
                  <h3 className="font-bold text-lg">Прибыль</h3>
                  <p className="text-sm text-green-700 dark:text-green-300">За все время</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">+{totalGain.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</p>
                <p className="text-xs text-green-700 dark:text-green-300">+{gainPercent}%</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Портфели</h2>
              <PiggyBank className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="grid gap-3">
              {portfolios.map((portfolio) => (
                <m.div
                  key={portfolio.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-32 rounded-2xl overflow-hidden hover-elevate active-elevate-2 cursor-pointer bg-card/50 backdrop-blur-xl border border-border/50"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${portfolio.gradient}`} />
                  
                  <div className="relative h-full p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{portfolio.title}</h3>
                      <p className="text-muted-foreground text-sm">{portfolio.subtitle}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">{portfolio.returns}</span>
                      <div className="flex gap-2">
                        {assets.filter(a => portfolio.assets.includes(a.id)).slice(0, 3).map(asset => (
                          <div key={asset.id} className="w-8 h-8 rounded-lg bg-card/50 backdrop-blur-xl border border-border/50 flex items-center justify-center">
                            <span className="text-xs font-bold">{asset.symbol.substring(0, 2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Популярное</h2>
              <Star className="w-5 h-5" style={{ fill: 'var(--theme-primary)', color: 'var(--theme-primary)' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {assets.filter(a => a.isPopular).map((asset) => (
                <m.div
                  key={asset.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAsset(asset)}
                  className="bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-border/50 hover-elevate active-elevate-2 cursor-pointer"
                  data-testid={`card-asset-${asset.id}`}
                >
                  <div className="relative aspect-[3/4]">
                    <LazyImage src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(asset.id);
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                      data-testid={`button-favorite-${asset.id}`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(asset.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <div className={`absolute bottom-2 left-2 px-2 py-1 ${asset.change24h >= 0 ? 'bg-green-500/90' : 'bg-red-500/90'} backdrop-blur-xl rounded-full border ${asset.change24h >= 0 ? 'border-green-400/50' : 'border-red-400/50'}`}>
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        {asset.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                        {Math.abs(asset.change24h)}%
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium mb-1 line-clamp-1">{asset.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{asset.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                      <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'catalog') {
    if (selectedAsset) {
      return (
        <div className="h-full flex flex-col bg-background smooth-scroll-page">
          <div className="relative">
            <div className="aspect-[3/4] relative">
              <LazyImage src={selectedAsset.image} alt={selectedAsset.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedAsset(null)}
                className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                data-testid="button-back"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => toggleFavorite(selectedAsset.id)}
                className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                data-testid={`button-favorite-detail-${selectedAsset.id}`}
              >
                <Heart className={`w-6 h-6 ${favorites.has(selectedAsset.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold">{selectedAsset.name}</h1>
                  <p className="text-muted-foreground">{selectedAsset.symbol}</p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${selectedAsset.change24h >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {selectedAsset.change24h >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownLeft className="w-4 h-4 text-red-600" />}
                  <span className={`font-bold ${selectedAsset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>{Math.abs(selectedAsset.change24h)}%</span>
                </div>
              </div>
              <p className="text-muted-foreground">{selectedAsset.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Категория</p>
                <p className="text-sm font-bold">{selectedAsset.category}</p>
              </div>
              <div className="p-3 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 text-center">
                <Shield className="w-5 h-5 mx-auto mb-1" style={{ color: 'var(--theme-primary)' }} />
                <p className="text-xs font-bold">{selectedAsset.risk}</p>
              </div>
              <div className="p-3 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 text-center">
                <Star className="w-5 h-5 mx-auto mb-1" style={{ fill: 'var(--theme-primary)', color: 'var(--theme-primary)' }} />
                <p className="text-xs font-bold">{selectedAsset.rating}</p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[var(--theme-primary)]/10 to-[var(--theme-accent)]/10 backdrop-blur-xl rounded-xl border border-[var(--theme-primary)]/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                <p className="font-semibold">Быстрая инвестиция</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Начните инвестировать с любой суммы • Комиссия 0%
              </p>
            </div>

            <TrustBadges />

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Цена</p>
                <p className="text-3xl font-bold">{selectedAsset.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</p>
              </div>
              <button
                onClick={() => buyAsset(selectedAsset, selectedAsset.price)}
                className="px-8 py-4 text-white font-semibold rounded-2xl hover-elevate active-elevate-2"
                style={{ background: 'linear-gradient(to right, var(--theme-primary), var(--theme-accent))' }}
                data-testid="button-buy"
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto smooth-scroll-page">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-5">
          <h1 className="text-2xl font-bold mb-4">Активы</h1>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'bg-card/50 backdrop-blur-xl border border-border/50 hover-elevate'
                }`}
                style={selectedCategory === category ? { backgroundColor: 'var(--theme-primary)' } : {}}
                data-testid={`button-category-${category}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {filteredAssets.map((asset) => (
            <m.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAsset(asset)}
              className="bg-card/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-border/50 hover-elevate active-elevate-2 cursor-pointer"
              data-testid={`card-catalog-asset-${asset.id}`}
            >
              <div className="relative aspect-[3/4]">
                <LazyImage src={asset.image} alt={asset.name} className="w-full h-full object-cover" />
                {asset.isNew && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 backdrop-blur-xl rounded-full border border-green-400/50">
                    <span className="text-xs font-bold text-white">Новинка</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(asset.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/20"
                  data-testid={`button-favorite-catalog-${asset.id}`}
                >
                  <Heart className={`w-4 h-4 ${favorites.has(asset.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
                <div className={`absolute bottom-2 left-2 px-2 py-1 ${asset.change24h >= 0 ? 'bg-green-500/90' : 'bg-red-500/90'} backdrop-blur-xl rounded-full border ${asset.change24h >= 0 ? 'border-green-400/50' : 'border-red-400/50'}`}>
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    {asset.change24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                    {Math.abs(asset.change24h)}%
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium mb-1 line-clamp-1">{asset.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{asset.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{asset.price.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</span>
                  <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="h-full overflow-y-auto smooth-scroll-page">
        <div className="p-6 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--theme-primary), var(--theme-accent))' }}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Александр Иванов</h2>
              <p className="text-sm text-muted-foreground">+7 (999) 777-66-55</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[var(--theme-primary)]/10 backdrop-blur-xl rounded-xl border border-[var(--theme-primary)]/30">
              <p className="text-sm text-muted-foreground mb-1">Баланс</p>
              <p className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>{balance.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}</p>
            </div>
            <div className="p-4 bg-green-500/10 backdrop-blur-xl rounded-xl border border-green-400/30">
              <p className="text-sm text-muted-foreground mb-1">Доходность</p>
              <p className="text-2xl font-bold text-green-600">+{gainPercent}%</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-history">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">История операций</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
          </button>

          <button className="w-full p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-cards">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Мои карты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
          </button>

          <button className="w-full p-4 bg-card/50 backdrop-blur-xl rounded-xl border border-border/50 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-settings">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Настройки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  return null;
});
