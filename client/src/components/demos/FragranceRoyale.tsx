import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Flower2, Crown, Droplets } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";

interface FragranceRoyaleProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  volume: string;
  quantity: number;
  image: string;
  concentration: string;
}

interface Order {
  id: number;
  items: CartItem[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

interface Perfume {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  description: string;
  volumes: string[];
  concentrations: string[];
  concentrationColors: string[];
  category: string;
  gender: 'Men' | 'Woman' | 'Unisex';
  inStock: number;
  rating: number;
  brand: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const perfumes: Perfume[] = [
  { 
    id: 1, 
    name: 'Black Orchid', 
    price: 29500, 
    oldPrice: 35000,
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1200&fit=crop&q=90',
    description: 'Роскошный аромат с нотами черной орхидеи и пачули', 
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum', 'Intense'], 
    concentrationColors: ['#9333EA', '#7E22CE'],
    category: 'Oriental', 
    gender: 'Unisex',
    inStock: 15, 
    rating: 5.0, 
    brand: 'TOM FORD',
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: 'Aventus', 
    price: 44500, 
    oldPrice: 52000,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&h=1200&fit=crop&q=90',
    description: 'Легендарный фруктово-мускусный аромат успеха', 
    volumes: ['50ml', '100ml', '250ml'], 
    concentrations: ['Eau de Parfum', 'Cologne'], 
    concentrationColors: ['#9333EA', '#C084FC'],
    category: 'Fresh', 
    gender: 'Men',
    inStock: 8, 
    rating: 4.9, 
    brand: 'CREED',
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'No. 5', 
    price: 18500, 
    oldPrice: 24000,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&h=1200&fit=crop&q=90',
    description: 'Легендарный цветочный аромат абсолютной элегантности', 
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum', 'Parfum'], 
    concentrationColors: ['#DB2777', '#BE185D'],
    category: 'Floral', 
    gender: 'Woman',
    inStock: 5, 
    rating: 5.0, 
    brand: 'CHANEL',
    isNew: true,
    isTrending: true
  },
  { 
    id: 4, 
    name: 'Santal 33', 
    price: 38500, 
    oldPrice: 45000,
    image: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&h=1200&fit=crop&q=90',
    description: 'Культовый древесный унисекс аромат с нотами сандала', 
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum'], 
    concentrationColors: ['#78716C'],
    category: 'Woody', 
    gender: 'Unisex',
    inStock: 8, 
    rating: 4.9, 
    brand: 'LE LABO',
    isNew: true,
    isTrending: true
  },
  { 
    id: 5, 
    name: 'Baccarat Rouge 540', 
    price: 34000, 
    image: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1595425970377-9ab5d25e8f97?w=800&h=1200&fit=crop&q=90',
    description: 'Роскошный амбровый аромат с нотами жасмина', 
    volumes: ['70ml', '200ml'], 
    concentrations: ['Extrait', 'Eau de Parfum'], 
    concentrationColors: ['#DC2626', '#EF4444'],
    category: 'Amber', 
    gender: 'Unisex',
    inStock: 10, 
    rating: 5.0, 
    brand: 'MAISON FRANCIS',
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Oud Wood', 
    price: 43000, 
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1615634282785-30dd924e9ca0?w=800&h=1200&fit=crop&q=90',
    description: 'Роскошный восточный аромат с нотами уда', 
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum', 'Intense'], 
    concentrationColors: ['#78350F', '#92400E'],
    category: 'Oriental', 
    gender: 'Unisex',
    inStock: 6, 
    rating: 4.8, 
    brand: 'TOM FORD' 
  },
  { 
    id: 7, 
    name: 'Sauvage', 
    price: 14500, 
    image: 'https://images.unsplash.com/photo-1565375473883-12c4e0b8dc8c?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1592417817038-d13bb0b0143d?w=800&h=1200&fit=crop&q=90',
    description: 'Свежий пряный аромат дикой природы', 
    volumes: ['60ml', '100ml', '200ml'], 
    concentrations: ['Eau de Toilette', 'Parfum'], 
    concentrationColors: ['#3B82F6', '#1D4ED8'],
    category: 'Fresh', 
    gender: 'Men',
    inStock: 12, 
    rating: 4.9, 
    brand: 'DIOR',
    isNew: true
  },
  { 
    id: 8, 
    name: 'Coco Mademoiselle', 
    price: 16500, 
    image: 'https://images.unsplash.com/photo-1619994122354-102eeb8c9cb8?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1561053720-76cd73ff22c3?w=800&h=1200&fit=crop&q=90',
    description: 'Изысканный цветочно-фруктовый аромат', 
    volumes: ['50ml', '100ml'], 
    concentrations: ['Eau de Parfum', 'Intense'], 
    concentrationColors: ['#F472B6', '#EC4899'],
    category: 'Floral', 
    gender: 'Woman',
    inStock: 4, 
    rating: 5.0, 
    brand: 'CHANEL' 
  },
];

const categories = ['Все', 'Fresh', 'Oriental', 'Floral', 'Woody', 'Amber'];
const genderFilters = ['All', 'Men', 'Woman', 'Unisex'];

function FragranceRoyale({ activeTab }: FragranceRoyaleProps) {
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedConcentration, setSelectedConcentration] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedPerfume(null);
    }
    if (activeTab !== 'home') {
      setSelectedGender('All');
    }
  }, [activeTab]);

  const filteredPerfumes = perfumes.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    
    if (activeTab === 'home') {
      const genderMatch = selectedGender === 'All' || p.gender === selectedGender;
      return categoryMatch && genderMatch;
    }
    
    return categoryMatch;
  });

  const toggleFavorite = (perfumeId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(perfumeId)) {
      newFavorites.delete(perfumeId);
    } else {
      newFavorites.add(perfumeId);
    }
    setFavorites(newFavorites);
  };

  const openPerfume = (perfume: Perfume) => {
    setSelectedPerfume(perfume);
    setSelectedVolume(perfume.volumes[0]);
    setSelectedConcentration(perfume.concentrations[0]);
  };

  const addToCart = () => {
    if (!selectedPerfume) return;
    
    const cartItem: CartItem = {
      id: Date.now(),
      name: selectedPerfume.name,
      price: selectedPerfume.price,
      volume: selectedVolume,
      quantity: 1,
      image: selectedPerfume.image,
      concentration: selectedConcentration
    };
    
    setCart([...cart, cartItem]);
    setSelectedPerfume(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total: cartTotal,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
  };

  // PRODUCT PAGE
  if (activeTab === 'catalog' && selectedPerfume) {
    const bgColor = selectedPerfume.concentrationColors[selectedPerfume.concentrations.indexOf(selectedConcentration)] || '#9333EA';
    
    return (
      <div className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedPerfume(null)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedPerfume.id);
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            data-testid={`button-favorite-${selectedPerfume.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedPerfume.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh]">
          <img
            src={selectedPerfume.hoverImage}
            alt={selectedPerfume.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32">
          <div className="text-center">
            <p className="text-sm text-white/70 mb-2">{selectedPerfume.brand}</p>
            <h2 className="text-2xl font-bold mb-2">{selectedPerfume.name}</h2>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold">{formatPrice(selectedPerfume.price)}</p>
              {selectedPerfume.oldPrice && (
                <p className="text-xl text-white/50 line-through">{formatPrice(selectedPerfume.oldPrice)}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-white/80 text-center">{selectedPerfume.description}</p>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите концентрацию:</p>
            <div className="flex items-center justify-center gap-3">
              {selectedPerfume.concentrations.map((concentration, idx) => (
                <button
                  key={concentration}
                  onClick={() => setSelectedConcentration(concentration)}
                  className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
                    selectedConcentration === concentration
                      ? 'border-white scale-105'
                      : 'border-white/30'
                  }`}
                  data-testid={`button-concentration-${concentration}`}
                >
                  {concentration}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите объем:</p>
            <div className="flex items-center justify-center gap-3">
              {selectedPerfume.volumes.map((volume) => (
                <button
                  key={volume}
                  onClick={() => setSelectedVolume(volume)}
                  className={`w-16 h-12 rounded-full font-semibold transition-all text-sm ${
                    selectedVolume === volume
                      ? 'bg-[#CDFF38] text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  data-testid={`button-volume-${volume}`}
                >
                  {volume}
                </button>
              ))}
            </div>
          </div>

          <ConfirmDrawer
            trigger={
              <button
                className="w-full bg-[#CDFF38] text-black font-bold py-4 rounded-full hover:bg-[#B8E633] transition-all"
                data-testid="button-buy-now"
              >
                Добавить в корзину
              </button>
            }
            title="Добавить в корзину?"
            description={`${selectedPerfume.name} • ${selectedConcentration} • ${selectedVolume}`}
            confirmText="Добавить"
            cancelText="Отмена"
            variant="default"
            onConfirm={addToCart}
          />
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <Menu className="w-6 h-6" data-testid="button-menu" />
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" data-testid="button-view-cart" />
              <Heart className="w-6 h-6" data-testid="button-view-favorites" />
            </div>
          </div>

          <div className="mb-6 scroll-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[#C9B037]" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              LUXURY
            </h1>
            <h1 className="text-4xl font-black tracking-tight text-white">
              FRAGRANCE
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-6 scroll-fade-in">
            <button 
              className="p-2 bg-white rounded-full"
              data-testid="button-view-home"
            >
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </button>
            {genderFilters.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`text-sm font-medium transition-colors ${
                  selectedGender === gender
                    ? 'text-white'
                    : 'text-white/40'
                }`}
                data-testid={`button-filter-${gender.toLowerCase()}`}
              >
                {gender}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white/5 rounded-full px-4 py-3 flex items-center gap-2 border border-white/10">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Поиск ароматов..."
                className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden scroll-fade-in" style={{ height: '500px' }}>
          <img
            src="https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?w=800&h=1000&fit=crop&q=90"
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-7 h-7 text-[#C9B037]" />
              </div>
              <h2 className="text-5xl font-black tracking-tight leading-tight text-white">
                НОВАЯ
              </h2>
              <h2 className="text-5xl font-black mb-3 tracking-tight leading-tight text-white">
                КОЛЛЕКЦИЯ
              </h2>
              <p className="text-base text-white/70 mb-6 flex items-center gap-2" style={{ letterSpacing: '0.05em' }}>
                <Droplets className="w-4 h-4 text-[#C9B037]" />
                Эксклюзивные ароматы 2025
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105 bg-[#C9B037]"
                data-testid="button-hero-shop-now"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {filteredPerfumes.slice(0, 3).map((perfume, idx) => (
            <m.div
              key={perfume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openPerfume(perfume)}
              className={`relative cursor-pointer group rounded-3xl overflow-hidden ${idx === 0 ? 'scroll-fade-in' : ''}`}
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`featured-perfume-${perfume.id}`}
            >
              <div className="absolute inset-0">
                <img
                  src={perfume.image}
                  alt={perfume.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                  <span className="text-xs font-semibold text-white/90">
                    {perfume.brand}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(perfume.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                data-testid={`button-favorite-${perfume.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(perfume.id) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {perfume.name}
                    </h3>
                    <p className="text-sm text-white/70 mb-4 flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-[#C9B037]" />
                      {perfume.category}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPerfume(perfume);
                    }}
                    className="w-14 h-14 rounded-full bg-[#C9B037] flex items-center justify-center transition-all hover:scale-110"
                    data-testid={`button-add-to-cart-${perfume.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-lg font-bold text-white">{formatPrice(perfume.price)}</p>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        <div className="h-8"></div>
      </div>
    );
  }

  // CATALOG PAGE
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-2xl font-bold">Каталог</h1>
            <div className="flex items-center gap-3">
              <button className="p-2" data-testid="button-view-search">
                <Search className="w-6 h-6" />
              </button>
              <button className="p-2" data-testid="button-view-filter">
                <Filter className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#C9B037] text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredPerfumes.map((perfume, index) => (
              <m.div
                key={perfume.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openPerfume(perfume)}
                className={`relative cursor-pointer ${index < 4 ? '' : `scroll-fade-in-delay-${Math.min((index - 4) % 3 + 1, 3)}`}`}
                data-testid={`perfume-card-${perfume.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-white/5">
                  <img
                    src={perfume.image}
                    alt={perfume.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(perfume.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
                    data-testid={`button-favorite-${perfume.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(perfume.id) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {perfume.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#C9B037] text-black text-xs font-bold rounded-full">
                      NEW
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-white/50 mb-1">{perfume.brand}</p>
                  <p className="text-sm font-semibold mb-1 truncate">{perfume.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold">{formatPrice(perfume.price)}</p>
                    {perfume.oldPrice && (
                      <p className="text-xs text-white/40 line-through">{formatPrice(perfume.oldPrice)}</p>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CART PAGE
  if (activeTab === 'cart') {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-32 smooth-scroll-page">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Корзина</h1>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingBag className="w-20 h-20 text-white/20 mb-4" />
              <p className="text-white/50 text-center">Ваша корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-2">
                      {item.concentration} • {item.volume}
                    </p>
                    <p className="text-lg font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                    className="w-8 h-8"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-[#0A0A0A] border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold">{formatPrice(cartTotal)}</span>
                </div>
                <ConfirmDrawer
                  trigger={
                    <button
                      className="w-full bg-[#C9B037] text-black font-bold py-4 rounded-full hover:bg-[#B8A033] transition-all"
                      data-testid="button-checkout"
                    >
                      Оформить заказ
                    </button>
                  }
                  title="Оформить заказ?"
                  description={`${cart.length} товаров на сумму ${formatPrice(cartTotal)}`}
                  confirmText="Подтвердить"
                  cancelText="Отмена"
                  variant="default"
                  onConfirm={handleCheckout}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PROFILE PAGE
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#C9B037] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Анна Смирнова</h2>
              <p className="text-sm text-muted-foreground">+7 (999) 888-77-66</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Заказы</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Избранное</p>
              <p className="text-2xl font-bold">{favorites.size}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="scroll-fade-in">
            <h3 className="text-lg font-bold mb-4">Мои заказы</h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>У вас пока нет заказов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/80">Заказ #{order.id.toString().slice(-6)}</span>
                      <span className="text-white/60">{order.date}</span>
                    </div>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/60">{order.items.length} товаров</span>
                      <span className="font-bold text-[#C9B037]">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        {order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-favorites">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-white/70" />
                <span className="font-medium">Избранное</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-addresses">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/70" />
                <span className="font-medium">Адреса доставки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-payment">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-white/70" />
                <span className="font-medium">Способы оплаты</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-settings">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-white/70" />
                <span className="font-medium">Настройки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-logout">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-white/70" />
                <span className="font-medium">Выход</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(FragranceRoyale);
