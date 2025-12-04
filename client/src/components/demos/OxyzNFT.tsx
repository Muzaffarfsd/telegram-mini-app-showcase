import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  Heart, ShoppingBag, X, ChevronLeft, ChevronRight, Star, Clock, 
  Sparkles, Menu, Search, User, Package, ArrowRight, Minus, Plus,
  History, Ruler, Settings, Crown, Zap, Eye, TrendingUp, MessageCircle,
  Home, Grid, Tag
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { ConfirmDrawer } from "../ui/modern-drawer";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";

interface OxyzNFTProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'Jackets' | 'Pants' | 'Accessories';
  description: string;
  sizes: string[];
  colors: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface Story {
  id: number;
  title: string;
  subtitle: string;
  image: string;
}

const COLORS = {
  primary: '#050505',
  primaryGradient: 'linear-gradient(180deg, #050505 0%, #0f0f13 100%)',
  accent1: '#ff2e63',
  accent2: '#4de5ff',
  textPrimary: '#e5e1db',
  textSecondary: '#8a8a8a',
  cardBg: 'linear-gradient(160deg, #111113 0%, #0a0a0c 100%)',
  cardBorder: 'rgba(255, 255, 255, 0.04)',
  glowCrimson: '0 0 60px rgba(255, 46, 99, 0.4)',
  glowCyan: '0 0 40px rgba(77, 229, 255, 0.3)',
};

const products: Product[] = [
  {
    id: 1,
    name: "Phantom Jacket",
    brand: "OXYZ",
    price: 890,
    originalPrice: 1190,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop&q=90",
    category: "Jackets",
    description: "Premium technical fabric with magnetic closures",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Obsidian", "Graphite"],
    isNew: true,
    isTrending: true
  },
  {
    id: 2,
    name: "Stealth Cargo Pants",
    brand: "OXYZ",
    price: 420,
    originalPrice: 520,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop&q=90",
    category: "Pants",
    description: "Utility-focused design with hidden pockets",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Shadow", "Slate"],
    isTrending: true
  },
  {
    id: 3,
    name: "Void Hoodie",
    brand: "OXYZ",
    price: 350,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop&q=90",
    category: "Jackets",
    description: "Zero-gravity comfort with thermal core",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Void Black", "Carbon"],
    isNew: true
  },
  {
    id: 4,
    name: "Neon Edge Sneakers",
    brand: "OXYZ",
    price: 580,
    originalPrice: 720,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop&q=90",
    category: "Accessories",
    description: "Reactive soles with luminescent threading",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["Neon Core", "Phantom"],
    isNew: true,
    isTrending: true
  },
  {
    id: 5,
    name: "Shadow Tee",
    brand: "OXYZ",
    price: 180,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop&q=90",
    category: "Jackets",
    description: "Seamless construction, anti-microbial fabric",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pure Black", "Midnight"]
  },
  {
    id: 6,
    name: "Chrome Belt",
    brand: "OXYZ",
    price: 220,
    originalPrice: 280,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop&q=90",
    category: "Accessories",
    description: "Aerospace-grade titanium buckle",
    sizes: ["One Size"],
    colors: ["Chrome", "Matte Black"],
    isTrending: true
  },
  {
    id: 7,
    name: "Obsidian Cap",
    brand: "OXYZ",
    price: 120,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=1000&fit=crop&q=90",
    category: "Accessories",
    description: "Water-resistant with UV protection",
    sizes: ["One Size"],
    colors: ["Obsidian", "Storm Grey"]
  },
  {
    id: 8,
    name: "Tech Gloves",
    brand: "OXYZ",
    price: 280,
    originalPrice: 350,
    image: "https://images.unsplash.com/photo-1491553895911-0055uj42d9a?w=800&h=1000&fit=crop&q=90",
    category: "Accessories",
    description: "Touch-compatible with thermal regulation",
    sizes: ["S", "M", "L"],
    colors: ["Tech Black", "Carbon Fiber"],
    isNew: true
  }
];

const stories: Story[] = [
  {
    id: 1,
    title: "THE DROP",
    subtitle: "Winter 2025",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop&q=90"
  },
  {
    id: 2,
    title: "BEHIND",
    subtitle: "The Design",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=90"
  },
  {
    id: 3,
    title: "EDITORIAL",
    subtitle: "Tokyo Nights",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop&q=90"
  }
];

const springConfig = { type: "spring" as const, stiffness: 300, damping: 30 };
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

function OxyzNFT({ activeTab }: OxyzNFTProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 55, seconds: 16 });
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [tierProgress] = useState(72);
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
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  }, []);

  const addToCart = useCallback((product: Product, size?: string, color?: string) => {
    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      selectedSize: size || product.sizes[0],
      selectedColor: color || product.colors[0]
    };
    setCart(prev => [...prev, cartItem]);
    setSelectedProduct(null);
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, Math.min(10, item.quantity + delta));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

  const cartSubtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0), 
    [cart]
  );
  
  const vipDiscount = useMemo(() => cartSubtotal * 0.15, [cartSubtotal]);
  const cartTotal = useMemo(() => cartSubtotal - vipDiscount, [cartSubtotal, vipDiscount]);

  const handleImageLoad = useCallback((id: number) => {
    setLoadedImages(prev => new Set(prev).add(id));
  }, []);

  const formatPrice = (price: number) => `$${price.toLocaleString()}`;

  const filteredProducts = useMemo(() => 
    selectedCategory === 'All' 
      ? products 
      : products.filter(p => p.category === selectedCategory),
    [selectedCategory]
  );

  const categories = ['All', 'Jackets', 'Pants', 'Accessories'];

  if (activeTab === 'catalog' && selectedProduct) {
    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page"
       
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="relative">
          <div className="relative h-[65vh]">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
            
            <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
              <m.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center"
                style={{ background: 'rgba(5, 5, 5, 0.6)', border: `1px solid ${COLORS.cardBorder}` }}
                data-testid="button-back-detail"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: COLORS.textPrimary }} />
              </m.button>
              <m.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => toggleFavorite(selectedProduct.id)}
                className="w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center"
                style={{ background: 'rgba(5, 5, 5, 0.6)', border: `1px solid ${COLORS.cardBorder}` }}
                data-testid={`button-favorite-detail-${selectedProduct.id}`}
              >
                <Heart 
                  className="w-5 h-5"
                  style={{ 
                    color: favorites.has(selectedProduct.id) ? COLORS.accent1 : COLORS.textPrimary,
                    fill: favorites.has(selectedProduct.id) ? COLORS.accent1 : 'transparent'
                  }}
                />
              </m.button>
            </div>

            {selectedProduct.isNew && (
              <m.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-28 right-5 z-10"
              >
                <span 
                  className="px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase"
                  style={{ 
                    background: COLORS.accent2, 
                    color: '#050505',
                    boxShadow: COLORS.glowCyan
                  }}
                >
                  NEW DROP
                </span>
              </m.div>
            )}
          </div>

          <m.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative -mt-12 rounded-t-[32px] p-6 pb-32"
            style={{ background: COLORS.primary }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p 
                  className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-1"
                  style={{ color: COLORS.accent2 }}
                >
                  {selectedProduct.brand}
                </p>
                <h2 
                  className="text-[26px] font-bold tracking-tight uppercase"
                  style={{ color: COLORS.textPrimary, letterSpacing: '-0.02em' }}
                >
                  {selectedProduct.name}
                </h2>
              </div>
              <div className="text-right">
                <p 
                  className="text-[28px] font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {formatPrice(selectedProduct.price)}
                </p>
                {selectedProduct.originalPrice && (
                  <p 
                    className="text-[14px] line-through"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {formatPrice(selectedProduct.originalPrice)}
                  </p>
                )}
              </div>
            </div>

            <p 
              className="text-[14px] leading-relaxed mb-8"
              style={{ color: COLORS.textSecondary }}
            >
              {selectedProduct.description}
            </p>

            <div className="mb-6">
              <p 
                className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3"
                style={{ color: COLORS.textSecondary }}
              >
                SIZE
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.sizes.map((size, idx) => (
                  <button
                    key={size}
                    className="px-5 py-3 rounded-lg text-[13px] font-medium transition-all"
                    style={{
                      background: idx === 0 ? COLORS.accent1 : 'transparent',
                      border: `1px solid ${idx === 0 ? COLORS.accent1 : 'rgba(255,255,255,0.1)'}`,
                      color: COLORS.textPrimary
                    }}
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p 
                className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3"
                style={{ color: COLORS.textSecondary }}
              >
                COLOR
              </p>
              <div className="flex gap-3">
                {selectedProduct.colors.map((color, idx) => (
                  <button
                    key={color}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-medium"
                    style={{
                      background: idx === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: `1px solid ${idx === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                      color: COLORS.textPrimary
                    }}
                    data-testid={`button-color-${color.toLowerCase().replace(' ', '-')}`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ background: idx === 0 ? '#1a1a1a' : '#2a2a2a' }}
                    />
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div 
              className="flex items-center gap-3 p-4 rounded-xl mb-6"
              style={{ 
                background: 'rgba(77, 229, 255, 0.08)', 
                border: '1px solid rgba(77, 229, 255, 0.15)' 
              }}
            >
              <Eye className="w-5 h-5" style={{ color: COLORS.accent2 }} />
              <span className="text-[13px] font-medium" style={{ color: COLORS.accent2 }}>
                AR TRY-ON AVAILABLE
              </span>
            </div>

            <ConfirmDrawer
              trigger={
                <button 
                  className="w-full py-4.5 rounded-full font-bold text-[15px] tracking-wide uppercase transition-all flex items-center justify-center gap-3"
                  style={{ 
                    background: COLORS.accent1,
                    boxShadow: COLORS.glowCrimson,
                    color: '#ffffff'
                  }}
                  data-testid="button-add-to-bag"
                >
                  <ShoppingBag className="w-5 h-5" />
                  ADD TO BAG
                </button>
              }
              title="Added to Bag"
              description={`${selectedProduct.name} - ${formatPrice(selectedProduct.price)}`}
              confirmText="View Bag"
              cancelText="Continue Shopping"
              variant="default"
              onConfirm={() => addToCart(selectedProduct)}
            />
          </m.div>
        </div>
      </div>
    );
  }

  if (activeTab === 'home') {
    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page"
       
        style={{ background: COLORS.primaryGradient }}
      >
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="OXYZ"
          subtitle="NFT"
          accentColor="#8B5CF6"
          bgColor="#0A0A0A"
        />
        <div className="demo-nav-safe px-5">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <button 
              onClick={sidebar.open}
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.cardBorder}` }}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
            </button>
            
            <div className="flex items-center gap-2">
              <span 
                className="text-[22px] font-black tracking-[0.02em]"
                style={{ color: COLORS.textPrimary }}
              >
                OXYZ
              </span>
              <span 
                className="text-[22px] font-light"
                style={{ color: COLORS.accent1 }}
              >
                .
              </span>
            </div>

            <button 
              className="w-12 h-12 rounded-xl flex items-center justify-center relative"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.cardBorder}` }}
              data-testid="button-cart-home"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
              {cart.length > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: COLORS.accent1, color: '#fff' }}
                >
                  {cart.length}
                </span>
              )}
            </button>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p 
              className="text-[13px] font-medium tracking-[0.15em] uppercase mb-4"
              style={{ color: COLORS.textSecondary }}
            >
              IT'S NOT JUST
            </p>
            <h1 
              className="text-[56px] font-black leading-[0.9] tracking-[-0.03em] uppercase mb-3"
              style={{ color: COLORS.textPrimary }}
            >
              FASHION
            </h1>
            <p 
              className="text-[28px] font-bold tracking-[-0.02em] uppercase"
              style={{ color: COLORS.accent1 }}
            >
              IT'S A STATEMENT
            </p>
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-4 py-4 mb-6 border-y"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}
          >
            {[
              { value: '9.5K', label: 'Active' },
              { value: '847', label: 'Drops' },
              { value: '12', label: 'New' }
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span 
                  className="text-[15px] font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {stat.value}
                </span>
                <span 
                  className="text-[12px]"
                  style={{ color: COLORS.textSecondary }}
                >
                  {stat.label}
                </span>
                {idx < 2 && (
                  <span 
                    className="ml-4 w-px h-4"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  />
                )}
              </div>
            ))}
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 mb-6"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255,46,99,0.12) 0%, rgba(255,46,99,0.04) 100%)',
              border: '1px solid rgba(255,46,99,0.2)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: COLORS.accent1 }} />
                <span 
                  className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                  style={{ color: COLORS.accent1 }}
                >
                  NEXT DROP
                </span>
              </div>
              <span 
                className="text-[11px] font-medium"
                style={{ color: COLORS.textSecondary }}
              >
                EXCLUSIVE
              </span>
            </div>
            <div 
              className="text-[36px] font-bold tracking-tight font-mono"
              style={{ color: COLORS.textPrimary }}
            >
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </div>
          </m.div>

          <m.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-full font-bold text-[14px] tracking-wide uppercase flex items-center justify-center gap-3 mb-8"
            style={{ 
              background: `linear-gradient(135deg, ${COLORS.accent1} 0%, #cc2450 100%)`,
              boxShadow: COLORS.glowCrimson,
              color: '#ffffff'
            }}
            data-testid="button-ai-stylist"
          >
            <Sparkles className="w-5 h-5" />
            AI STYLIST - GET YOUR LOOK
          </m.button>

          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-[13px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: COLORS.textSecondary }}
              >
                EDITORIAL
              </h3>
              <button 
                className="text-[12px] font-medium flex items-center gap-1"
                style={{ color: COLORS.accent2 }}
                data-testid="button-view-all-stories"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5">
              {stories.map((story, idx) => (
                <m.div
                  key={story.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.08 }}
                  className="relative flex-shrink-0 w-[140px] h-[200px] rounded-2xl overflow-hidden cursor-pointer"
                  style={{ border: `1px solid ${COLORS.cardBorder}` }}
                  data-testid={`story-card-${story.id}`}
                >
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p 
                      className="text-[13px] font-bold tracking-tight"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {story.title}
                    </p>
                    <p 
                      className="text-[11px]"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {story.subtitle}
                    </p>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-[13px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: COLORS.textSecondary }}
              >
                FEATURED COLLECTION
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {products.slice(0, 4).map((product, idx) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedProduct(product)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{ 
                    background: COLORS.cardBg,
                    border: `1px solid ${COLORS.cardBorder}`,
                    aspectRatio: '3/4'
                  }}
                  data-testid={`featured-product-${product.id}`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {product.isNew && (
                    <span 
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.1em] uppercase"
                      style={{ background: COLORS.accent2, color: '#050505' }}
                    >
                      NEW
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p 
                      className="text-[12px] font-bold truncate"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {product.name}
                    </p>
                    <p 
                      className="text-[11px] font-medium"
                      style={{ color: COLORS.accent1 }}
                    >
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>
        </div>
      </div>
    );
  }

  if (activeTab === 'catalog') {
    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page"
       
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="demo-nav-safe px-5">
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 
              className="text-[24px] font-bold tracking-tight uppercase"
              style={{ color: COLORS.textPrimary, letterSpacing: '-0.02em' }}
            >
              CATALOG
            </h1>
            <div className="flex items-center gap-3">
              <button 
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.cardBorder}` }}
                data-testid="button-search-catalog"
              >
                <Search className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
              </button>
            </div>
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-5 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all"
                style={selectedCategory === cat 
                  ? { background: COLORS.accent1, color: '#fff' } 
                  : { background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: COLORS.textSecondary }
                }
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </m.div>

          <m.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, ...springConfig }}
                  layout
                  onClick={() => setSelectedProduct(product)}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  style={{ 
                    background: COLORS.cardBg,
                    border: `1px solid ${COLORS.cardBorder}`,
                  }}
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="relative aspect-[3/4]">
                    {!loadedImages.has(product.id) && (
                      <Skeleton className="absolute inset-0" />
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        !loadedImages.has(product.id) ? 'opacity-0' : 'opacity-100'
                      } ${hoveredProduct === product.id ? 'scale-105' : 'scale-100'}`}
                      onLoad={() => handleImageLoad(product.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {product.isNew && (
                      <span 
                        className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold tracking-[0.1em] uppercase"
                        style={{ background: COLORS.accent2, color: '#050505' }}
                      >
                        NEW
                      </span>
                    )}
                    
                    {product.isTrending && (
                      <span 
                        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
                        style={{ background: 'rgba(255,46,99,0.2)', color: COLORS.accent1 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                      </span>
                    )}

                    <m.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ 
                        opacity: hoveredProduct === product.id ? 1 : 0, 
                        y: hoveredProduct === product.id ? 0 : 10 
                      }}
                      className="absolute bottom-16 left-3 right-3"
                    >
                      <span 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold"
                        style={{ background: 'rgba(77,229,255,0.15)', color: COLORS.accent2 }}
                      >
                        <Eye className="w-3 h-3" />
                        AR TRY-ON
                      </span>
                    </m.div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(product.id);
                      }}
                      className="absolute w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{ 
                        background: favorites.has(product.id) ? 'rgba(255,46,99,0.2)' : 'rgba(0,0,0,0.4)',
                        top: product.isTrending ? '2.5rem' : '0.75rem',
                        right: '0.75rem'
                      }}
                      data-testid={`button-wishlist-${product.id}`}
                    >
                      <Heart 
                        className="w-4 h-4"
                        style={{ 
                          color: favorites.has(product.id) ? COLORS.accent1 : COLORS.textPrimary,
                          fill: favorites.has(product.id) ? COLORS.accent1 : 'transparent'
                        }}
                      />
                    </button>
                  </div>

                  <div className="p-3">
                    <p 
                      className="text-[10px] font-semibold tracking-[0.12em] uppercase mb-0.5"
                      style={{ color: COLORS.accent2 }}
                    >
                      {product.brand}
                    </p>
                    <p 
                      className="text-[13px] font-bold truncate mb-1.5"
                      style={{ color: COLORS.textPrimary }}
                    >
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-[14px] font-bold"
                        style={{ color: COLORS.accent1 }}
                      >
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span 
                          className="text-[11px] line-through"
                          style={{ color: COLORS.textSecondary }}
                        >
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </m.div>
        </div>
      </div>
    );
  }

  if (activeTab === 'cart') {
    const recommendations = products.filter(p => !cart.some(c => c.id === p.id)).slice(0, 3);
    
    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page"
       
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="demo-nav-safe px-5">
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 
              className="text-[24px] font-bold tracking-tight uppercase"
              style={{ color: COLORS.textPrimary, letterSpacing: '-0.02em' }}
            >
              YOUR BAG
            </h1>
            {cart.length > 0 && (
              <span 
                className="px-3 py-1.5 rounded-full text-[12px] font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: COLORS.textSecondary }}
              >
                {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            )}
          </m.div>

          {cart.length === 0 ? (
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${COLORS.cardBorder}` }}
              >
                <ShoppingBag className="w-10 h-10" style={{ color: COLORS.textSecondary }} />
              </div>
              <p 
                className="font-bold text-[17px] mb-2"
                style={{ color: COLORS.textPrimary }}
              >
                Your bag is empty
              </p>
              <p 
                className="text-[14px] mb-6"
                style={{ color: COLORS.textSecondary }}
              >
                Start adding pieces to your collection
              </p>
              <button 
                className="px-8 py-3.5 rounded-full font-bold text-[14px] uppercase"
                style={{ background: COLORS.accent1, color: '#fff' }}
                data-testid="button-explore-catalog"
              >
                Explore Catalog
              </button>
            </m.div>
          ) : (
            <m.div initial="hidden" animate="visible" variants={containerVariants}>
              <div className="space-y-3 mb-6">
                <AnimatePresence>
                  {cart.map((item, idx) => (
                    <m.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="rounded-2xl p-4"
                      style={{ 
                        background: COLORS.cardBg,
                        border: `1px solid ${COLORS.cardBorder}`
                      }}
                    >
                      <div className="flex gap-4">
                        <div className="relative w-[80px] h-[100px] rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p 
                                className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-0.5"
                                style={{ color: COLORS.accent2 }}
                              >
                                {item.brand}
                              </p>
                              <p 
                                className="text-[14px] font-bold truncate"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {item.name}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(255,46,99,0.1)' }}
                              data-testid={`button-remove-${item.id}`}
                            >
                              <X className="w-3.5 h-3.5" style={{ color: COLORS.accent1 }} />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3 mt-1.5 mb-3">
                            <span 
                              className="text-[11px]"
                              style={{ color: COLORS.textSecondary }}
                            >
                              Size: {item.selectedSize}
                            </span>
                            <span 
                              className="w-px h-3"
                              style={{ background: 'rgba(255,255,255,0.1)' }}
                            />
                            <span 
                              className="text-[11px]"
                              style={{ color: COLORS.textSecondary }}
                            >
                              {item.selectedColor}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div 
                              className="flex items-center gap-1 rounded-lg"
                              style={{ background: 'rgba(255,255,255,0.04)' }}
                            >
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center"
                                data-testid={`button-decrease-${item.id}`}
                              >
                                <Minus className="w-3.5 h-3.5" style={{ color: COLORS.textSecondary }} />
                              </button>
                              <span 
                                className="w-8 text-center text-[13px] font-bold"
                                style={{ color: COLORS.textPrimary }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 flex items-center justify-center"
                                data-testid={`button-increase-${item.id}`}
                              >
                                <Plus className="w-3.5 h-3.5" style={{ color: COLORS.textSecondary }} />
                              </button>
                            </div>
                            <span 
                              className="text-[16px] font-bold"
                              style={{ color: COLORS.textPrimary }}
                            >
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </m.div>
                  ))}
                </AnimatePresence>
              </div>

              {recommendations.length > 0 && (
                <m.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <p 
                    className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-3"
                    style={{ color: COLORS.textSecondary }}
                  >
                    YOU MIGHT ALSO LIKE
                  </p>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
                    {recommendations.map(product => (
                      <div 
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className="flex-shrink-0 w-[120px] rounded-xl overflow-hidden cursor-pointer"
                        style={{ border: `1px solid ${COLORS.cardBorder}` }}
                        data-testid={`recommendation-${product.id}`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-[100px] object-cover"
                        />
                        <div className="p-2" style={{ background: COLORS.cardBg }}>
                          <p 
                            className="text-[11px] font-medium truncate"
                            style={{ color: COLORS.textPrimary }}
                          >
                            {product.name}
                          </p>
                          <p 
                            className="text-[11px] font-bold"
                            style={{ color: COLORS.accent1 }}
                          >
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </m.div>
              )}

              <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl p-5 mb-4"
                style={{ 
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`
                }}
              >
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.textSecondary }} className="text-[14px]">Subtotal</span>
                    <span style={{ color: COLORS.textPrimary }} className="text-[14px] font-medium">
                      {formatPrice(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.accent1 }} className="text-[14px] font-medium">
                      VIP DISCOUNT -15%
                    </span>
                    <span style={{ color: COLORS.accent1 }} className="text-[14px] font-medium">
                      -{formatPrice(vipDiscount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.textSecondary }} className="text-[14px]">Shipping</span>
                    <span style={{ color: COLORS.accent2 }} className="text-[14px] font-medium">
                      FREE VIP
                    </span>
                  </div>
                </div>
                <div 
                  className="flex items-center justify-between pt-4 border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <span style={{ color: COLORS.textPrimary }} className="text-[16px] font-bold uppercase">
                    Total
                  </span>
                  <span style={{ color: COLORS.textPrimary }} className="text-[22px] font-bold">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </m.div>

              <m.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(229, 225, 219, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4.5 rounded-full font-bold text-[15px] tracking-wide uppercase flex items-center justify-center gap-3 mb-4"
                style={{ 
                  background: COLORS.textPrimary,
                  color: '#050505',
                  boxShadow: '0 0 20px rgba(229, 225, 219, 0.25)'
                }}
                data-testid="button-checkout"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M17.0009 21.7502C17.1906 21.7502 17.3751 21.6872 17.5249 21.5712C17.6746 21.4552 17.7812 21.2927 17.8283 21.1086L21.4535 6.97422C21.5036 6.78114 21.4882 6.57716 21.4099 6.39426C21.3315 6.21137 21.1946 6.06024 21.0204 5.96434C20.8462 5.86844 20.6448 5.83329 20.4488 5.86435C20.2528 5.89541 20.0731 5.99084 19.9382 6.13553L13.0009 13.0728V2.25024C13.0009 2.05132 12.9219 1.86056 12.7812 1.71991C12.6406 1.57926 12.4498 1.50024 12.2509 1.50024H4.75086C4.55195 1.50024 4.36118 1.57926 4.22053 1.71991C4.07988 1.86056 4.00086 2.05132 4.00086 2.25024V21.0002C4.00086 21.1991 4.07988 21.3899 4.22053 21.5306C4.36118 21.6712 4.55195 21.7502 4.75086 21.7502H17.0009Z"/>
                </svg>
                PAY WITH APPLE PAY
              </m.button>

              <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center justify-center gap-2 py-3"
                data-testid="concierge-message"
              >
                <MessageCircle className="w-4 h-4" style={{ color: COLORS.accent2 }} />
                <span 
                  className="text-[12px] font-medium"
                  style={{ color: COLORS.textSecondary }}
                >
                  Personal shopper available 24/7
                </span>
              </m.div>
            </m.div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    const menuItems = [
      { icon: History, label: 'Order History', count: 23 },
      { icon: Heart, label: 'Wishlist', count: favorites.size || 47 },
      { icon: Sparkles, label: 'Personal Stylist' },
      { icon: Ruler, label: 'Measurements' },
      { icon: Settings, label: 'Settings' }
    ];

    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page"
       
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="demo-nav-safe px-5">
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="relative w-[100px] h-[100px] mx-auto mb-4">
              <m.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.accent1}, ${COLORS.accent2}, ${COLORS.accent1})`,
                  padding: '3px'
                }}
              />
              <div 
                className="absolute inset-[3px] rounded-full overflow-hidden"
                style={{ background: COLORS.primary }}
              >
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=90"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: COLORS.accent1, boxShadow: COLORS.glowCrimson }}
              >
                <Crown className="w-4 h-4 text-white" />
              </div>
            </div>
            <h2 
              className="text-[22px] font-bold tracking-tight"
              style={{ color: COLORS.textPrimary }}
            >
              ALEXANDER VOSS
            </h2>
            <p 
              className="text-[13px]"
              style={{ color: COLORS.textSecondary }}
            >
              @alexvoss
            </p>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-5 mb-6"
            style={{ 
              background: `linear-gradient(135deg, rgba(255,46,99,0.15) 0%, rgba(77,229,255,0.08) 100%)`,
              border: '1px solid rgba(255,46,99,0.2)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p 
                  className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-1"
                  style={{ color: COLORS.textSecondary }}
                >
                  VIP STATUS
                </p>
                <p 
                  className="text-[18px] font-bold tracking-tight uppercase"
                  style={{ color: COLORS.textPrimary }}
                >
                  OBSIDIAN ELITE
                </p>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <m.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={COLORS.accent1}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - tierProgress / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span 
                    className="text-[14px] font-bold"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {tierProgress}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: COLORS.accent2 }} />
              <span 
                className="text-[14px] font-bold"
                style={{ color: COLORS.accent2 }}
              >
                12,450 XP
              </span>
              <span 
                className="text-[12px]"
                style={{ color: COLORS.textSecondary }}
              >
                to next tier
              </span>
            </div>
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            {[
              { value: 23, label: 'Orders' },
              { value: favorites.size || 47, label: 'Wishlist' },
              { value: 12, label: 'Reviews' }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="rounded-xl p-4 text-center"
                style={{ 
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`
                }}
              >
                <p 
                  className="text-[24px] font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {stat.value}
                </p>
                <p 
                  className="text-[11px] font-medium tracking-wide uppercase"
                  style={{ color: COLORS.textSecondary }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </m.div>

          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-2 mb-6"
          >
            {menuItems.map((item, idx) => (
              <m.button
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                whileHover={{ x: 4 }}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all"
                style={{ 
                  background: COLORS.cardBg,
                  border: `1px solid ${COLORS.cardBorder}`
                }}
                data-testid={`button-menu-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  <item.icon className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
                </div>
                <span 
                  className="flex-1 text-left font-medium text-[15px]"
                  style={{ color: COLORS.textPrimary }}
                >
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span 
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: COLORS.textSecondary }}
                  >
                    {item.count}
                  </span>
                )}
                <ChevronRight className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
              </m.button>
            ))}
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl p-5 text-center"
            style={{ 
              background: `linear-gradient(135deg, rgba(77,229,255,0.12) 0%, rgba(77,229,255,0.04) 100%)`,
              border: '1px solid rgba(77,229,255,0.2)'
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-4 h-4" style={{ color: COLORS.accent2 }} />
              <span 
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
                style={{ color: COLORS.accent2 }}
              >
                EXCLUSIVE ACCESS
              </span>
              <Star className="w-4 h-4" style={{ color: COLORS.accent2 }} />
            </div>
            <p 
              className="text-[13px]"
              style={{ color: COLORS.textSecondary }}
            >
              Early access to drops and private sales
            </p>
          </m.div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(OxyzNFT);
