import { useState, useEffect, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Home, Grid, Tag } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";
import greenNikeImage from "@assets/загруженное-_4__1761733573240.jpg";
import blueNikeImage from "@assets/загруженное-_3__1761733577054.jpg";
import whiteJordanImage from "@assets/загруженное-_2__1761733579316.jpg";
import tealJordanImage from "@assets/NIKE-AIR-JORDAN-V2-e-V3-_designer_designergrafico-_design-_nikeair-_airjordan-_socialmedia-_natural-_1761733582395.jpg";

// Video served from public/videos/ to reduce Docker image size
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";

interface SneakerVaultProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  brand: string;
}

interface Order {
  id: number;
  items: CartItem[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

interface Sneaker {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  description: string;
  sizes: string[];
  brand: string;
  category: string;
  gender: 'Men' | 'Woman' | 'Unisex';
  inStock: number;
  rating: number;
  isNew?: boolean;
  isTrending?: boolean;
  colorway: string;
}

const sneakers: Sneaker[] = [
  { 
    id: 1, 
    name: 'Daisy Dream Dunk', 
    price: 18900, 
    oldPrice: 22900,
    image: greenNikeImage, 
    hoverImage: greenNikeImage,
    description: 'Свежие Nike Dunk с природной эстетикой ромашек', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Nike',
    category: 'Лайфстайл', 
    gender: 'Unisex',
    inStock: 8, 
    rating: 5.0, 
    isNew: true,
    isTrending: true,
    colorway: 'Green/Beige'
  },
  { 
    id: 2, 
    name: 'Sky Water Dunk', 
    price: 17900, 
    oldPrice: 21900,
    image: blueNikeImage, 
    hoverImage: blueNikeImage,
    description: 'Голубые Nike Dunk с небесной палитрой', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Nike',
    category: 'Лайфстайл', 
    gender: 'Unisex',
    inStock: 12, 
    rating: 4.9, 
    isNew: true,
    isTrending: true,
    colorway: 'Sky Blue'
  },
  { 
    id: 3, 
    name: 'Forest Air Jordan 1', 
    price: 25900, 
    oldPrice: 29900,
    image: whiteJordanImage, 
    hoverImage: whiteJordanImage,
    description: 'Белые Air Jordan 1 High с мистической атмосферой', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Jordan',
    category: 'Баскетбол', 
    gender: 'Men',
    inStock: 6, 
    rating: 5.0, 
    isNew: true,
    isTrending: true,
    colorway: 'White/Silver'
  },
  { 
    id: 4, 
    name: 'Butterfly Jordan 1', 
    price: 26900, 
    oldPrice: 31900,
    image: tealJordanImage, 
    hoverImage: tealJordanImage,
    description: 'Бирюзовые Air Jordan 1 с природной энергией', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Jordan',
    category: 'Баскетбол', 
    gender: 'Men',
    inStock: 5, 
    rating: 5.0, 
    isNew: true,
    isTrending: true,
    colorway: 'Teal/Black'
  },
  { 
    id: 5, 
    name: 'Air Max 90 Essential', 
    price: 15900, 
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1200&fit=crop&q=90',
    description: 'Классические Air Max 90 с видимой подушкой Air', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Nike',
    category: 'Беговые', 
    gender: 'Unisex',
    inStock: 15, 
    rating: 4.8, 
    isTrending: true,
    colorway: 'White/Red'
  },
  { 
    id: 6, 
    name: 'Yeezy Boost 350 V2', 
    price: 32900, 
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=1200&fit=crop&q=90',
    description: 'Инновационные кроссовки с технологией Boost', 
    sizes: ['7', '8', '9', '10', '11'], 
    brand: 'Adidas',
    category: 'Лайфстайл', 
    gender: 'Unisex',
    inStock: 4, 
    rating: 4.7, 
    isNew: true,
    colorway: 'Zebra'
  },
  { 
    id: 7, 
    name: 'Air Force 1 Low', 
    price: 13900, 
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=1200&fit=crop&q=90',
    description: 'Самые популярные кроссовки Nike всех времен', 
    sizes: ['7', '8', '9', '10', '11', '12'], 
    brand: 'Nike',
    category: 'Баскетбол', 
    gender: 'Unisex',
    inStock: 20, 
    rating: 4.9, 
    colorway: 'All White'
  },
  { 
    id: 8, 
    name: 'Travis Scott x Jordan', 
    price: 89900, 
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&h=1200&fit=crop&q=90',
    description: 'Эксклюзивная коллаборация с Трэвисом Скоттом', 
    sizes: ['8', '9', '10', '11'], 
    brand: 'Jordan',
    category: 'Коллаб', 
    gender: 'Men',
    inStock: 2, 
    rating: 5.0, 
    isNew: true,
    colorway: 'Brown/Black'
  },
];

const categories = ['Все', 'Лайфстайл', 'Баскетбол', 'Беговые', 'Коллаб'];
const genderFilters = ['All', 'Men', 'Woman', 'Unisex'];

function SneakerVault({ activeTab, onTabChange }: SneakerVaultProps) {
  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const sidebar = useDemoSidebar();

  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home' },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog' },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  useEffect(() => {
    scrollToTop();
    if (activeTab !== 'catalog') {
      setSelectedSneaker(null);
    }
    // Reset gender filter when leaving home page
    if (activeTab !== 'home') {
      setSelectedGender('All');
    }
  }, [activeTab]);

  // Filter sneakers based on current tab
  const filteredSneakers = sneakers.filter(s => {
    const categoryMatch = selectedCategory === 'Все' || s.category === selectedCategory;
    
    // Apply gender filter only on home page
    if (activeTab === 'home') {
      const genderMatch = selectedGender === 'All' || s.gender === selectedGender;
      return categoryMatch && genderMatch;
    }
    
    // On catalog page, show all genders
    return categoryMatch;
  });

  const toggleFavorite = (sneakerId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sneakerId)) {
      newFavorites.delete(sneakerId);
    } else {
      newFavorites.add(sneakerId);
    }
    setFavorites(newFavorites);
  };

  const openSneaker = (sneaker: Sneaker) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedSneaker(sneaker);
    setSelectedSize(sneaker.sizes[0]);
  };

  const addToCart = () => {
    if (!selectedSneaker) return;
    
    const cartItem: CartItem = {
      id: Date.now(),
      name: selectedSneaker.name,
      price: selectedSneaker.price,
      size: selectedSize,
      quantity: 1,
      image: selectedSneaker.image,
      brand: selectedSneaker.brand
    };
    
    setCart([...cart, cartItem]);
    setSelectedSneaker(null);
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

  // PRODUCT DETAIL PAGE
  if (activeTab === 'catalog' && selectedSneaker) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedSneaker(null)}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedSneaker.id);
            }}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/20"
            data-testid={`button-favorite-${selectedSneaker.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedSneaker.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh]">
          <img
            src={selectedSneaker.hoverImage}
            alt={selectedSneaker.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="bg-black/90 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32">
          <div className="text-center">
            <p className="text-sm text-white/60 mb-2">{selectedSneaker.brand}</p>
            <h2 className="text-2xl font-bold mb-2">{selectedSneaker.name}</h2>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold">{formatPrice(selectedSneaker.price)}</p>
              {selectedSneaker.oldPrice && (
                <p className="text-xl text-white/50 line-through">{formatPrice(selectedSneaker.oldPrice)}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-white/80 text-center">{selectedSneaker.description}</p>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите размер (US):</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {selectedSneaker.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all ${
                    selectedSize === size
                      ? 'bg-[#CDFF38] text-black'
                      : 'bg-black/40 text-white hover:bg-black/60 border border-white/20'
                  }`}
                  data-testid={`button-size-${size}`}
                >
                  {size}
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
            description={`${selectedSneaker.name} • ${selectedSneaker.brand} • Размер ${selectedSize}`}
            confirmText="Добавить"
            cancelText="Отмена"
            variant="default"
            onConfirm={addToCart}
          />
        </div>
      </div>
    );
  }

  // HOME PAGE - REAL TIME SHOPPING STYLE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page">
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="SNEAKER"
          subtitle="VAULT"
          accentColor="#CDFF38"
          bgColor="#0A0A0A"
        />
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button onClick={sidebar.open} aria-label="Меню" data-testid="button-menu">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" data-testid="button-view-cart" />
              <Heart className="w-6 h-6" data-testid="button-view-favorites" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-6 scroll-fade-in">
            <h1 className="text-4xl font-black mb-1 tracking-tight">
              SNEAKER<br/>
              VAULT
            </h1>
          </div>

          {/* Gender Filters */}
          <div className="flex items-center gap-4 mb-6 scroll-fade-in">
            <button 
              className="p-2 bg-[#CDFF38] rounded-full"
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
                aria-pressed={selectedGender === gender}
                className={`text-sm font-medium transition-all relative ${
                  selectedGender === gender
                    ? 'text-white font-bold'
                    : 'text-white/40'
                }`}
                data-testid={`button-filter-${gender.toLowerCase()}`}
              >
                {gender}
                {selectedGender === gender && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#CDFF38] rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-full px-4 py-3 flex items-center gap-2 border border-white/20">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Поиск кроссовок..."
                className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        {/* Video Hero Banner */}
        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden scroll-fade-in" style={{ height: '500px' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-hero-banner-sneaker"
          >
            <source src={sneakerVideo} type="video/mp4" />
          </video>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-black mb-3 tracking-tight leading-tight">
                LIMITED<br/>
                EDITION
              </h2>
              <p className="text-lg text-white/80 mb-6" style={{ letterSpacing: '0.1em' }}>
                Эксклюзивные релизы 2025
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105"
                style={{
                  background: '#CDFF38',
                  boxShadow: '0 0 30px rgba(205, 255, 56, 0.4)'
                }}
                data-testid="button-hero-shop-sneakers"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        {/* Featured Sneaker Cards */}
        <div className="px-6 space-y-4">
          {filteredSneakers.slice(0, 3).map((sneaker, idx) => (
            <m.div
              key={sneaker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openSneaker(sneaker)}
              className={`relative cursor-pointer group rounded-3xl overflow-hidden ${idx === 0 ? 'scroll-fade-in' : ''}`}
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`featured-sneaker-${sneaker.id}`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={sneaker.image}
                  alt={sneaker.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Badge */}
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-black/60 backdrop-blur-xl rounded-full border border-white/20">
                  <span className="text-xs font-semibold text-white">
                    {sneaker.isNew ? 'New' : sneaker.category}
                  </span>
                </div>
              </div>

              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(sneaker.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center border border-white/20"
                data-testid={`button-favorite-${sneaker.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(sneaker.id) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-white/70 mb-1">{sneaker.brand}</p>
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {sneaker.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">{sneaker.colorway}</p>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openSneaker(sneaker);
                    }}
                    className="w-14 h-14 rounded-full bg-[#CDFF38] flex items-center justify-center hover:bg-[#B8E633] transition-all hover:scale-110"
                    data-testid={`button-add-to-cart-${sneaker.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                {/* Price */}
                <div className="mt-3">
                  <p className="text-lg font-bold">{formatPrice(sneaker.price)}</p>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        {/* Bottom Spacer */}
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

          {/* Categories */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#CDFF38] text-black'
                    : 'bg-black/40 text-white/70 hover:bg-black/60 border border-white/20'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sneakers Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredSneakers.map((sneaker, index) => (
              <m.div
                key={sneaker.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openSneaker(sneaker)}
                className={`relative cursor-pointer ${index < 4 ? '' : `scroll-fade-in-delay-${Math.min((index - 4) % 3 + 1, 3)}`}`}
                data-testid={`sneaker-card-${sneaker.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-black/40 border border-white/10">
                  <img
                    src={sneaker.image}
                    alt={sneaker.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Favorite */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(sneaker.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-xl flex items-center justify-center border border-white/20"
                    data-testid={`button-favorite-${sneaker.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(sneaker.id) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {/* Badge */}
                  {sneaker.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#CDFF38] text-black text-xs font-bold rounded-full">
                      NEW
                    </div>
                  )}
                </div>

                {/* Sneaker Info */}
                <div>
                  <p className="text-xs text-white/60 mb-1">{sneaker.brand}</p>
                  <p className="text-sm font-semibold mb-1 truncate">{sneaker.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold">{formatPrice(sneaker.price)}</p>
                    {sneaker.oldPrice && (
                      <p className="text-xs text-white/40 line-through">{formatPrice(sneaker.oldPrice)}</p>
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
                  className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/10"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-white/60 mb-1">{item.brand}</p>
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-2">
                      Размер: {item.size}
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
                      className="w-full bg-[#CDFF38] text-black font-bold py-4 rounded-full hover:bg-[#B8E633] transition-all"
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
        <div className="p-6 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#CDFF38] to-[#B8E633] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Дмитрий Смирнов</h2>
              <p className="text-sm text-white/70">+7 (999) 555-77-88</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Заказы</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/20">
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
                  <div key={order.id} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/80">Заказ #{order.id.toString().slice(-6)}</span>
                      <span className="text-white/60">{order.date}</span>
                    </div>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/60">{order.items.length} товаров</span>
                      <span className="font-bold text-[#CDFF38]">{formatPrice(order.total)}</span>
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
            <button className="w-full p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-favorites">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-white/70" />
                <span className="font-medium">Избранное</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-payment">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-white/70" />
                <span className="font-medium">Способы оплаты</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-address">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/70" />
                <span className="font-medium">Адреса доставки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-settings">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-white/70" />
                <span className="font-medium">Настройки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 flex items-center justify-between hover-elevate active-elevate-2 mt-4" data-testid="button-logout">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="font-medium text-red-400">Выйти</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(SneakerVault);
