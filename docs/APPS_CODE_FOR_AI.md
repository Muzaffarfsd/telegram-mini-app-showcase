# WEB4TG - Архив кода бизнес-приложений для анализа ИИ

## Список приложений
11. **OXYZ** (oxyz-nft) - NFT платформа → OxyzNFT.tsx
12. **Emily Carter AI** (emily-carter-ai) - AI ассистент → EmilyCarterAI.tsx

---

## Демо-приложения

### OxyzNFT.tsx
```tsx
import { useState, useEffect, memo, useMemo, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  Heart, ShoppingBag, X, ChevronLeft, ChevronRight, Star, Clock, 
  Sparkles, Menu, Search, User, Package, ArrowRight, Minus, Plus,
  History, Ruler, Settings, Crown, Zap, Eye, TrendingUp, MessageCircle
} from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { ConfirmDrawer } from "../ui/modern-drawer";

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
        className="min-h-screen text-white overflow-auto pb-24"
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
        className="min-h-screen text-white overflow-auto pb-24"
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="demo-nav-safe px-5">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <button 
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
        className="min-h-screen text-white overflow-auto pb-24"
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
        className="min-h-screen text-white overflow-auto pb-24"
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
        className="min-h-screen text-white overflow-auto pb-24"
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
```

### EmilyCarterAI.tsx
```tsx
import { useState, memo } from "react";
import { m } from "framer-motion";
import { Heart, MessageCircle, ChevronLeft, ChevronRight, Check, Lock, Star, Sparkles, X, Send, Image as ImageIcon, Settings, Grid } from "lucide-react";

interface EmilyCarterAIProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Post {
  id: number;
  text: string;
  price: number;
  image?: string;
  locked: boolean;
  likes: number;
}

const posts: Post[] = [
  {
    id: 1,
    text: "Hi! Set for those who want to see awesome gameplay! Spoiler alert - i win!",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=90",
    locked: true,
    likes: 847
  },
  {
    id: 2,
    text: "New cosplay photos are ready! Check out my latest Zodiac collection",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=90",
    locked: true,
    likes: 1234
  },
  {
    id: 3,
    text: "Behind the scenes of my latest photoshoot. Exclusive access!",
    price: 14.99,
    locked: true,
    likes: 2156
  }
];

function EmilyCarterAI({ activeTab }: EmilyCarterAIProps) {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'weekly'>('yearly');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // ========================================
  // HOME PAGE - Subscription screen (Light mode)
  // ========================================
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#F5F4F0] text-[#1A1A1A] overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          {/* Hero Image */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[32px] overflow-hidden mb-6"
            style={{ height: '420px' }}
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop&q=95"
              alt="Emily Carter"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* AI Creator Badge */}
            <div className="absolute bottom-6 left-6">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#A78BFA' }} />
                <span className="text-white text-[12px] font-medium">AI Creator</span>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-white text-[28px] font-bold">Emily Carter</h2>
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </m.div>

          {/* Subscription Section */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm">
            <h3 className="text-[18px] font-semibold text-center mb-6">Select your plan</h3>
            
            {/* Yearly Plan */}
            <m.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan('yearly')}
              className={`w-full p-4 rounded-2xl mb-3 flex items-center justify-between transition-all ${
                selectedPlan === 'yearly' 
                  ? 'bg-[#F5F4F0] border-2 border-[#1A1A1A]' 
                  : 'bg-[#F5F4F0] border-2 border-transparent'
              }`}
              data-testid="button-plan-yearly"
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'yearly' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'yearly' && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Yearly</span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                      style={{ background: '#22C55E' }}
                    >
                      Save 90%
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">$0.77 <span className="font-normal text-gray-500">/ week</span></div>
                <div className="text-[12px] text-gray-400">just $39.99 year</div>
              </div>
            </m.button>

            {/* Weekly Plan */}
            <m.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPlan('weekly')}
              className={`w-full p-4 rounded-2xl mb-6 flex items-center justify-between transition-all ${
                selectedPlan === 'weekly' 
                  ? 'bg-[#F5F4F0] border-2 border-[#1A1A1A]' 
                  : 'bg-[#F5F4F0] border-2 border-transparent'
              }`}
              data-testid="button-plan-weekly"
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === 'weekly' ? 'border-[#1A1A1A] bg-[#1A1A1A]' : 'border-gray-300'
                  }`}
                >
                  {selectedPlan === 'weekly' && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="font-semibold">Weekly</span>
              </div>
              <div className="font-bold">$6.99 <span className="font-normal text-gray-500">/ week</span></div>
            </m.button>

            {/* Subscribe Button */}
            <button 
              onClick={() => setIsSubscribed(true)}
              className="w-full py-4 rounded-full bg-[#1A1A1A] text-white font-semibold text-[15px]"
              data-testid="button-subscribe"
            >
              Subscribe
            </button>

            <p className="text-center text-gray-400 text-[13px] mt-4">Cancel anytime</p>
            
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-[12px] text-gray-400 underline">Terms of use</span>
              <span className="text-gray-300">|</span>
              <span className="text-[12px] text-gray-400 underline">Privacy policy</span>
              <span className="text-gray-300">|</span>
              <span className="text-[12px] text-gray-400 underline">Purchases</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CATALOG/PROFILE PAGE - Dark mode profile
  // ========================================
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          {/* Back button */}
          <button 
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-6"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Profile Section */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-center flex-1">
              <span className="text-[24px] font-bold">34.9 K</span>
              <p className="text-white/50 text-[12px]">followers</p>
            </div>
            
            {/* Avatar */}
            <div className="relative">
              <div 
                className="w-[100px] h-[100px] rounded-full overflow-hidden"
                style={{ border: '3px solid rgba(255,255,255,0.1)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=90"
                  alt="Emily Carter"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="text-center flex-1">
              <span className="text-[24px] font-bold">2245</span>
              <p className="text-white/50 text-[12px]">following</p>
            </div>
          </div>

          {/* Name and Bio */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[20px] font-bold">Emily Carter</span>
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
            <p className="text-white/50 text-[13px]">E-gamer | Kawaii lover | Zodiac girl</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-8">
            <button 
              onClick={() => setFollowing(!following)}
              className={`flex-1 py-3 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 ${
                following 
                  ? 'bg-white/10 text-white' 
                  : 'bg-white text-black'
              }`}
              data-testid="button-follow"
            >
              <Heart className={`w-4 h-4 ${following ? 'fill-red-500 text-red-500' : ''}`} />
              {following ? 'Following' : 'Follow'}
            </button>
            <button 
              onClick={() => setShowMessages(true)}
              className="flex-1 py-3 rounded-full bg-white/10 font-semibold text-[14px] flex items-center justify-center gap-2"
              data-testid="button-messages"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </button>
          </div>

          {/* Posts */}
          <div className="space-y-4">
            {posts.slice(0, 1).map(post => (
              <div 
                key={post.id}
                className="rounded-[24px] p-4"
                style={{ background: 'linear-gradient(160deg, #2A2A2C 0%, #1C1C1E 100%)' }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&q=90"
                    alt="Emily"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[14px]">Emily Carter</span>
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <p className="text-white/60 text-[13px]">{post.text}</p>
                  </div>
                </div>
                
                {post.image && (
                  <div className="relative rounded-2xl overflow-hidden mb-4">
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-[120px] object-cover"
                      style={{ filter: post.locked ? 'blur(20px)' : 'none' }}
                    />
                    {post.locked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white/80" />
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 text-[11px]">
                      21:24
                    </div>
                  </div>
                )}
                
                <button 
                  className="w-full py-3 rounded-full text-[14px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  data-testid={`button-buy-${post.id}`}
                >
                  Buy ${post.price}
                </button>
              </div>
            ))}
          </div>

          {/* Upgrade Card */}
          <div 
            className="rounded-[24px] p-5 mt-4"
            style={{ background: 'linear-gradient(160deg, #F5F4F0 0%, #E8E7E3 100%)' }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  <span className="text-[12px] text-gray-500">The best price</span>
                </div>
                <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-1">Unlock all exclusive content</h3>
                <p className="text-gray-500 text-[13px]">Upgrade to Silver</p>
              </div>
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #E5E7EB 0%, #9CA3AF 100%)' }}
              >
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[Star, Heart, MessageCircle, Grid].map((Icon, idx) => (
              <button
                key={idx}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: idx === 0 ? '#1A1A1A' : 'rgba(255,255,255,0.1)' }}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CART PAGE - Content purchases
  // ========================================
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          <h1 className="text-[24px] font-bold mb-6">My Purchases</h1>

          {isSubscribed ? (
            <div className="space-y-4">
              {posts.map(post => (
                <div 
                  key={post.id}
                  className="rounded-[20px] p-4"
                  style={{ background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)' }}
                >
                  <div className="flex gap-4">
                    <div className="relative w-[80px] h-[80px] rounded-xl overflow-hidden">
                      <img
                        src={post.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=90"}
                        alt="Content"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] mb-2 line-clamp-2">{post.text}</p>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 text-[12px]">Unlocked</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Lock className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/60 font-medium text-[15px]">No purchases yet</p>
              <p className="text-white/30 text-[13px] mt-2">Subscribe to unlock exclusive content</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // PROFILE PAGE - Settings
  // ========================================
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="demo-nav-safe px-5">
          <div className="text-center mb-8">
            <div className="relative w-[88px] h-[88px] mx-auto mb-4">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                style={{ border: '3px solid #A78BFA' }}
              />
            </div>
            <h2 className="text-[22px] font-bold">My Account</h2>
            <p className="text-white/40 text-[13px]">@viewer</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Heart, label: 'Favorites', value: '12 creators' },
              { icon: Lock, label: 'Subscriptions', value: isSubscribed ? 'Active' : 'None' },
              { icon: ImageIcon, label: 'Purchases', value: isSubscribed ? '3 items' : '0 items' },
              { icon: Settings, label: 'Settings', value: '' }
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-4 p-4 rounded-[18px]"
                style={{ background: 'linear-gradient(160deg, #1C1C1E 0%, #0D0D0D 100%)' }}
              >
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-[15px] flex-1 text-left">{item.label}</span>
                {item.value && <span className="text-white/40 text-[13px]">{item.value}</span>}
                <ChevronRight className="w-5 h-5 text-white/30" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(EmilyCarterAI);
```

## Ключевые компоненты

### DemoAppShell.tsx (оболочка демо)
```tsx
import { useState, Suspense, memo, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
import { demoApps } from "../data/demoApps";
import { useTelegram } from "../hooks/useTelegram";
import { getDemoComponent, isDemoAvailable } from "./demos/DemoRegistry";
import { LiquidHomeButton } from "./ui/liquid-home-button";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { useLanguage } from "../contexts/LanguageContext";

interface DemoAppShellProps {
  demoId: string;
  onClose: () => void;
}

type TabType = 'home' | 'catalog' | 'cart' | 'profile';

interface DemoTheme {
  background: string;
  isDark: boolean;
  activeIconColor: string;
  inactiveIconColor: string;
  navOverlay: string;
  accent: string;
  onAccent: string;
}

const darkTheme: DemoTheme = {
  background: '#101114',
  isDark: true,
  activeIconColor: '#fff',
  inactiveIconColor: 'rgba(255,255,255,0.45)',
  navOverlay: 'rgba(20, 20, 22, 0.65)',
  accent: '#FFFFFF',
  onAccent: '#161616',
};

const lightTheme: DemoTheme = {
  background: '#F5F3F0',
  isDark: false,
  activeIconColor: 'rgba(0,0,0,0.85)',
  inactiveIconColor: 'rgba(0,0,0,0.35)',
  navOverlay: 'rgba(255, 255, 255, 0.65)',
  accent: '#1C1C1E',
  onAccent: '#FFFFFF',
};

const demoThemes: Record<string, Partial<DemoTheme>> = {
  'stray-store': { background: '#F6F6F4', isDark: false, accent: '#0A0A0B', onAccent: '#FFFFFF' },
  'tea-house': { background: '#FAF6F1', isDark: false },
  'interior-lux': { background: '#F5F3F0', isDark: false },
  'skincare-aura': { background: '#FFFFFF', isDark: false, accent: '#A3E635', onAccent: '#1A2E05' },
  'streetwear-vanta': { background: '#FFFFFF', isDark: false, accent: '#0B0B0B', onAccent: '#FFFFFF' },
};

const getTheme = (demoId: string): DemoTheme => {
  const custom = demoThemes[demoId] || {};
  const base = custom.isDark === false ? lightTheme : darkTheme;
  return { ...base, ...custom };
};

// Theme-aware demos (skincare-aura) follow the system colour scheme.
// Pre-match it so the shell never flashes a mismatched colour on entry.
const initialDemoDark = (id: string): boolean => {
  if (!id.startsWith('skincare-aura')) return false;
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && tg.colorScheme) return tg.colorScheme === 'dark';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch { return false; }
};

const DemoLiquidGlassFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
    <filter id="demo-glass-distortion" x="-5%" y="-5%" width="110%" height="110%" filterUnits="objectBoundingBox">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.015" numOctaves="2" seed="23" result="turbulence" />
      <feGaussianBlur in="turbulence" stdDeviation="4" result="softMap" />
      <feDisplacementMap in="SourceGraphic" in2="softMap" scale="6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

interface DemoNavTabProps {
  onClick: () => void;
  isActive: boolean;
  ariaLabel: string;
  testId: string;
  label: string;
  activeColor: string;
  inactiveColor: string;
  badge?: number;
  badgeBg?: string;
  badgeFg?: string;
  children: React.ReactNode;
}

const DemoNavTab = ({ onClick, isActive, ariaLabel, testId, label, activeColor, inactiveColor, badge, badgeBg = '#1C1C1E', badgeFg = '#FFFFFF', children }: DemoNavTabProps) => (
  <button
    type="button"
    className="relative z-30 flex items-center justify-center rounded-[14px] gpu-layer"
    style={{
      height: '44px',
      minWidth: '44px',
      appearance: 'none',
      border: 'none',
      background: isActive ? (activeColor === '#fff' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)') : 'transparent',
      padding: isActive ? '0 14px' : '0 12px',
      outline: 'none',
      cursor: 'pointer',
      gap: isActive ? '7px' : '0',
      transition: 'background 0.22s ease-out, padding 0.28s ease-out, gap 0.28s ease-out',
      WebkitTapHighlightColor: 'transparent',
    }}
    onClick={onClick}
    aria-label={ariaLabel}
    data-testid={testId}
  >
    <div className="relative z-10 flex-shrink-0 nav-tab-icon">
      {children}
      {badge ? (
        <span style={{
          position: 'absolute', top: '-6px', right: '-9px', minWidth: '16px', height: '16px',
          padding: '0 4px', borderRadius: '999px', background: badgeBg, color: badgeFg,
          fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
        }}>{badge > 99 ? '99+' : badge}</span>
      ) : null}
    </div>
    <span
      className="relative z-10 leading-none overflow-hidden whitespace-nowrap"
      style={{
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.01em',
        color: activeColor,
        maxWidth: isActive ? '80px' : '0',
        opacity: isActive ? 1 : 0,
        transition: 'max-width 0.28s ease-out, opacity 0.18s ease-out',
      }}
    >
      {label}
    </span>
  </button>
);

const DemoAppShell = memo(function DemoAppShell({ demoId, onClose }: DemoAppShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [cartCount, setCartCount] = useState(0);
  const [demoDark, setDemoDark] = useState(() => initialDemoDark(demoId));
  const { hapticFeedback } = useTelegram();
  const { t } = useLanguage();
  
  // Scroll to top when demo opens
  useEffect(() => {
    scrollToTop();
    setCartCount(0);
    setDemoDark(initialDemoDark(demoId));
  }, [demoId]);
  
  const getBaseAppType = useCallback((id: string): string => {
    return id.replace(/-\d+$/, '');
  }, []);

  const demoApp = useMemo(() => 
    demoApps.find(app => app.id === (demoId === 'royal-step' ? 'nike-sneakers' : demoId)) ||
    demoApps.find(app => app.id === getBaseAppType(demoId)),
    [demoId, getBaseAppType]
  );
  
  if (!demoApp) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mx-4 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">{t('demo.notFound')}</h3>
          <p className="text-sm text-white/50">
            {t('demo.appUnavailable')}
          </p>
          <button type="button" onClick={onClose} className="mt-5 px-5 py-3 rounded-full bg-white text-black font-semibold">{t('demo.back')}</button>
        </div>
      </div>
    );
  }

  const contentRef = useRef<HTMLDivElement>(null);

  const handleTabSwitch = useCallback((tab: TabType) => {
    setActiveTab(tab);
    scrollToTop();
    const el = contentRef.current;
    if (el) {
      el.classList.remove('demo-tab-enter');
      void el.offsetWidth;
      el.classList.add('demo-tab-enter');
    }
    if (hapticFeedback?.selection) {
      queueMicrotask(() => hapticFeedback.selection());
    }
  }, [hapticFeedback]);

  const handleStringNavigation = useCallback((tab: string) => {
    handleTabSwitch(tab as TabType);
  }, [handleTabSwitch]);

  const handleNavigateHome = useCallback(() => {
    window.location.hash = '#/';
    if (hapticFeedback?.medium) {
      queueMicrotask(() => hapticFeedback.medium());
    }
  }, [hapticFeedback]);

  // No loading screen - instant load
  const DemoLoader = () => null;

  const renderDemoContent = () => {
    // First try exact ID match, then fallback to base type
    const exactMatch = isDemoAvailable(demoId);
    const baseAppType = exactMatch ? demoId : getBaseAppType(demoId);
    
    // Check if demo is available in registry
    if (!isDemoAvailable(baseAppType)) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mx-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">{t('demo.unavailable')}</h3>
            <p className="text-sm text-white/50">
              {t('demo.appTypeUnavailable').replace('{type}', baseAppType)}
            </p>
          </div>
        </div>
      );
    }

    // Get dynamic component from registry
    const DemoComponent = getDemoComponent(baseAppType);
    
    if (!DemoComponent) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mx-4 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">{t('demo.loadError')}</h3>
            <p className="text-sm text-white/50">
              {t('demo.loadErrorDesc')}
            </p>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={null}>
        <DemoComponent activeTab={activeTab} onTabChange={handleStringNavigation} onCartCount={setCartCount} onTheme={setDemoDark} />
      </Suspense>
    );
    
  };

  // Get theme for current demo
  const baseAppType = getBaseAppType(demoId);
  const theme = demoDark ? darkTheme : getTheme(baseAppType);

  // The flower store supplies its own navigation inside the shared WEB4TG header.
  if (demoId === 'flower-store') {
    const FlowerStore = getDemoComponent(demoId);
    return <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Suspense fallback={<div aria-label="Загрузка цветочного магазина" style={{ minHeight: '100vh', background: '#fff' }} />}>
        {FlowerStore && <FlowerStore onClose={onClose} />}
      </Suspense>
    </div>;
  }

  // The buyer demo supplies its own navigation inside the shared WEB4TG header.
  if (demoId === 'china-buyer') {
    const ChinaBuyer = getDemoComponent(demoId);
    return <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Suspense fallback={<div aria-label="Загрузка бюро поиска" style={{ minHeight: '100vh', background: '#fff' }} />}>
        {ChinaBuyer && <ChinaBuyer onClose={onClose} />}
      </Suspense>
    </div>;
  }

  // The medical center supplies its own appointment navigation inside the WEB4TG header.
  if (demoId === 'medical-center') {
    const MedicalCenter = getDemoComponent(demoId);
    return <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Suspense fallback={<div aria-label="Загрузка медицинского центра" style={{ minHeight: '100vh', background: '#fff' }} />}>
        {MedicalCenter && <MedicalCenter onClose={onClose} />}
      </Suspense>
    </div>;
  }

  // LUMI supplies its own appointment navigation inside the WEB4TG header.
  if (demoId === 'lumi-studio') {
    const LumiStudio = getDemoComponent(demoId);
    return <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Suspense fallback={<div aria-label="Загрузка студии" style={{ minHeight: '100vh', background: '#fff' }} />}>
        {LumiStudio && <LumiStudio onClose={onClose} />}
      </Suspense>
    </div>;
  }

  // The wholesale demo supplies its own navigation inside the WEB4TG header.
  if (demoId === 'opt-market') {
    const OptMarket = getDemoComponent(demoId);
    return <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Suspense fallback={<div aria-label="Загрузка магазина" style={{ minHeight: '100vh', background: '#fff' }} />}>
        {OptMarket && <OptMarket onClose={onClose} />}
      </Suspense>
    </div>;
  }

  // Apple store supplies its own storefront navigation, inside the WEB4TG header.
  if (demoId === 'apple-store') {
    const AppleStore = getDemoComponent(demoId);
    return <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Suspense fallback={<div aria-label="Загрузка магазина" style={{ minHeight: '100vh', background: '#fff' }} />}>
        {AppleStore && <AppleStore onClose={onClose} />}
      </Suspense>
    </div>;
  }

  // MURAKA supplies its own storefront header and navigation.
  if (demoId === 'muraka-fashion') {
    const MurakaFashion = getDemoComponent(demoId);
    return <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Suspense fallback={<div aria-label="Загрузка магазина" style={{ minHeight: '100vh', background: '#fff' }} />}>
        {MurakaFashion && <MurakaFashion onClose={onClose} />}
      </Suspense>
    </div>;
  }

  // This standalone store uses its own navigation so it can reproduce the
  // requested shop experience, including a full-screen basket sheet.
  if (demoId === 'royal-step' || demoId === 'nike-sneakers') {
    const RoyalStep = getDemoComponent(demoId);
    return <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Suspense fallback={<div aria-label="Загрузка магазина" style={{ minHeight: '100vh', background: '#fff' }} />}>
        {RoyalStep && <RoyalStep onClose={onClose} />}
      </Suspense>
    </div>;
  }

  return (
    <>
      {/* Fixed background layer - covers entire viewport including bottom edge */}
      <div className="fixed inset-0 -z-10" style={{ backgroundColor: theme.background }} />
      
      {/* ALWAYS add 'dark' class to force dark CSS variables for ALL demos, regardless of main app theme */}
      <div className="demo-app-shell dark min-h-screen flex flex-col" style={{ backgroundColor: theme.background }}>
        {/* Mobile Container - Max width for desktop view */}
        <div className="w-full max-w-md mx-auto min-h-screen flex flex-col relative shadow-2xl" style={{ backgroundColor: theme.background }}>
          
          {/* Demo Content Area - Telegram safe area bottom with GPU optimization */}
          <div 
            ref={contentRef}
            className="flex-1 tg-content-safe-bottom" 
            style={{ paddingBottom: 'max(6rem, var(--csab, 0px))' }} 
            data-testid="demo-content"
            data-scroll-container="true"
          >
            {renderDemoContent()}
          </div>

          </div>
      </div>

      {/* Fixed UI via Portal - bypasses all transform/contain ancestors */}
      {createPortal(
        <>
          <DemoLiquidGlassFilter />

          {/* Solid bottom backing — keeps the floating nav on the app background colour
              so content never shows through dark behind it */}
          <div
            className="fixed left-0 right-0 z-[9990] pointer-events-none"
            style={{ bottom: 0, height: 'calc(106px + env(safe-area-inset-bottom, 0px))', background: theme.background }}
          />

          {/* Fixed Home Button */}
          <div 
            className="fixed z-[9999] pointer-events-none flex justify-end"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(100%, 448px)',
              paddingRight: '16px',
              bottom: 'calc(100px + max(0px, env(safe-area-inset-bottom, 0px)))',
            }}
          >
            <div className="pointer-events-auto">
              <LiquidHomeButton onNavigateHome={handleNavigateHome} />
            </div>
          </div>

          {/* Bottom Navigation — Liquid Glass */}
          <div 
            className="fixed bottom-0 left-0 right-0 flex justify-center z-[9999]"
            style={{ 
              isolation: 'isolate',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '8px',
            }}
          >
            <nav 
              className="relative flex items-center rounded-[22px] gpu-layer"
              style={{
                padding: '5px 6px',
                gap: '2px',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.16)',
                background: theme.navOverlay,
              }}
              role="navigation" 
              aria-label={t('nav.navigation')}
            >
              <div 
                className="absolute inset-0 z-0 rounded-[22px] pointer-events-none"
                style={{
                  backdropFilter: 'blur(40px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
                  filter: 'url(#demo-glass-distortion)',
                }}
              />
              <div 
                className="absolute inset-0 z-10 rounded-[22px] pointer-events-none"
                style={{
                  border: theme.isDark ? '0.5px solid rgba(255,255,255,0.10)' : '0.5px solid rgba(0,0,0,0.07)',
                }}
              />

              <DemoNavTab
                onClick={() => handleTabSwitch('home')}
                isActive={activeTab === 'home'}
                ariaLabel={t('nav.home')}
                testId="nav-home"
                label={t('nav.home')}
                activeColor={theme.activeIconColor}
                inactiveColor={theme.inactiveIconColor}
              >
                <Home
                  className="w-[21px] h-[21px]"
                  style={{
                    color: activeTab === 'home' ? theme.activeIconColor : theme.inactiveIconColor,
                    transition: 'color 0.2s ease-out',
                  }}
                  strokeWidth={activeTab === 'home' ? 2 : 1.5}
                />
              </DemoNavTab>

              <DemoNavTab
                onClick={() => handleTabSwitch('catalog')}
                isActive={activeTab === 'catalog'}
                ariaLabel={t('nav.catalog')}
                testId="nav-catalog"
                label={t('nav.catalog')}
                activeColor={theme.activeIconColor}
                inactiveColor={theme.inactiveIconColor}
              >
                <Grid3X3
                  className="w-[21px] h-[21px]"
                  style={{
                    color: activeTab === 'catalog' ? theme.activeIconColor : theme.inactiveIconColor,
                    transition: 'color 0.2s ease-out',
                  }}
                  strokeWidth={activeTab === 'catalog' ? 2 : 1.5}
                />
              </DemoNavTab>

              <DemoNavTab
                onClick={() => handleTabSwitch('cart')}
                isActive={activeTab === 'cart'}
                ariaLabel={t('nav.cart')}
                testId="nav-cart"
                label={t('nav.cart')}
                activeColor={theme.activeIconColor}
                inactiveColor={theme.inactiveIconColor}
                badge={cartCount}
                badgeBg={theme.accent}
                badgeFg={theme.onAccent}
              >
                <ShoppingCart
                  className="w-[21px] h-[21px]"
                  style={{
                    color: activeTab === 'cart' ? theme.activeIconColor : theme.inactiveIconColor,
                    transition: 'color 0.2s ease-out',
                  }}
                  strokeWidth={activeTab === 'cart' ? 2 : 1.5}
                />
              </DemoNavTab>

              <DemoNavTab
                onClick={() => handleTabSwitch('profile')}
                isActive={activeTab === 'profile'}
                ariaLabel={t('nav.profile')}
                testId="nav-profile"
                label={t('nav.profile')}
                activeColor={theme.activeIconColor}
                inactiveColor={theme.inactiveIconColor}
              >
                <User
                  className="w-[21px] h-[21px]"
                  style={{
                    color: activeTab === 'profile' ? theme.activeIconColor : theme.inactiveIconColor,
                    transition: 'color 0.2s ease-out',
                  }}
                  strokeWidth={activeTab === 'profile' ? 2 : 1.5}
                />
              </DemoNavTab>
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
});

export default DemoAppShell;
```

### DemoRegistry.ts (реестр демо)
```ts
// Dynamic demo registry for lazy loading
import { lazy, ComponentType } from 'react';

// Type for demo components
export interface DemoComponent {
  component: ComponentType<any>;
  preload?: () => Promise<{ default: ComponentType<any> }>;
}

// Demo registry with lazy loading
export const demoRegistry: Record<string, DemoComponent> = {
  'flower-store': {
    component: lazy(() => import('./FlowerStore')),
    preload: () => import('./FlowerStore')
  },
  'china-buyer': {
    component: lazy(() => import('./ChinaBuyer')),
    preload: () => import('./ChinaBuyer')
  },
  'medical-center': {
    component: lazy(() => import('./MedicalCenter')),
    preload: () => import('./MedicalCenter')
  },
  'lumi-studio': {
    component: lazy(() => import('./LumiStudio')),
    preload: () => import('./LumiStudio')
  },
  'opt-market': {
    component: lazy(() => import('./OptMarket')),
    preload: () => import('./OptMarket')
  },
  'apple-store': {
    component: lazy(() => import('./AppleStore')),
    preload: () => import('./AppleStore')
  },
  'muraka-fashion': {
    component: lazy(() => import('./MurakaFashion')),
    preload: () => import('./MurakaFashion')
  },
  'nike-sneakers': {
    component: lazy(() => import('./RoyalStep')),
    preload: () => import('./RoyalStep')
  },
  'royal-step': {
    component: lazy(() => import('./RoyalStep')),
    preload: () => import('./RoyalStep')
  },
  'fitness': {
    component: lazy(() => import('./Fitness')),
    preload: () => import('./Fitness')
  },
  'banking': {
    component: lazy(() => import('./Banking')),
    preload: () => import('./Banking')
  },
  'bookstore': {
    component: lazy(() => import('./Bookstore')),
    preload: () => import('./Bookstore')
  },
  'car-rental': {
    component: lazy(() => import('./CarRental')),
    preload: () => import('./CarRental')
  },
  'taxi': {
    component: lazy(() => import('./Taxi')),
    preload: () => import('./Taxi')
  },
  'medical': {
    component: lazy(() => import('./Medical')),
    preload: () => import('./Medical')
  },
  'courses': {
    component: lazy(() => import('./Courses')),
    preload: () => import('./Courses')
  },
  'car-wash': {
    component: lazy(() => import('./CarWash')),
    preload: () => import('./CarWash')
  },
  'stray-store': {
    component: lazy(() => import('./StrayStore')),
    preload: () => import('./StrayStore')
  },
  
  // Aliases for compatibility with demoApps.ts IDs
  
  // Futuristic Fashion Collection (4 premium full stores)
  
  // Premium Design Collection - New Apps
  'oxyz-nft': {
    component: lazy(() => import('./OxyzNFT')),
    preload: () => import('./OxyzNFT')
  },
  'skincare-aura': {
    component: lazy(() => import('./SkincareStore')),
    preload: () => import('./SkincareStore')
  },
  'emily-carter-ai': {
    component: lazy(() => import('./EmilyCarterAI')),
    preload: () => import('./EmilyCarterAI')
  },
  'streetwear-vanta': {
    component: lazy(() => import('./StreetwearStore')),
    preload: () => import('./StreetwearStore')
  },
};

const preloadedSet = new Set<string>();

export const preloadCriticalDemos = () => {
  const criticalDemos = ['flower-store', 'lumi-studio', 'apple-store'];
  
  criticalDemos.forEach((demoId, index) => {
    const demo = demoRegistry[demoId];
    if (demo?.preload && !preloadedSet.has(demoId)) {
      const itemDelay = index * 300;
      const doPreload = () => {
        setTimeout(() => {
          if (!preloadedSet.has(demoId)) {
            preloadedSet.add(demoId);
            demo.preload!().catch(() => {});
          }
        }, itemDelay);
      };
      if ('requestIdleCallback' in window) {
        requestIdleCallback(doPreload, { timeout: 5000 });
      } else {
        setTimeout(doPreload, 1000 + itemDelay);
      }
    }
  });
};

// Get demo component
export const getDemoComponent = (demoId: string): ComponentType<any> | null => {
  const demo = demoRegistry[demoId];
  return demo?.component || null;
};

// Check if demo exists
export const isDemoAvailable = (demoId: string): boolean => {
  return demoId in demoRegistry;
};

export const preloadDemo = (demoId: string): void => {
  if (preloadedSet.has(demoId)) return;
  const demo = demoRegistry[demoId];
  if (demo?.preload) {
    preloadedSet.add(demoId);
    demo.preload().catch(() => {
      preloadedSet.delete(demoId);
    });
  }
};
```

### demoApps.ts (данные приложений)
```ts
export interface Banner {
  title: string;
  subtitle?: string;
  image?: string;
  bgClass?: string;
}

export interface Service {
  id: string;
  title: string;
  priceText?: string;
  iconName?: string;
  image?: string;
}

export interface DemoAppHome {
  hero: {
    title?: string;
    subtitle?: string;
    image?: string;
    bgClass?: string;
  };
  banners?: Banner[];
  services?: Service[];
}

export interface DemoApp {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  creator: string;
  likes: string;
  badge?: string;
  badgeColor?: string;
  home?: DemoAppHome;
}

// Топ-10 самых популярных приложений по лайкам
export const demoApps: DemoApp[] = [
  {
    id: 'flower-store',
    title: 'Цветочный магазин',
    description: 'Букеты и цветочные композиции для любого повода',
    category: 'Электронная коммерция',
    image: '/flower-store/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'china-buyer',
    title: 'Бюро поиска — байер из Китая',
    description: 'Поиск товаров, выкуп и сопровождение заказа из Китая',
    category: 'Электронная коммерция',
    image: '/china-buyer/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'medical-center',
    title: 'Частный медицинский центр',
    description: 'Специалисты, услуги и удобная запись на приём',
    category: 'Здоровье',
    image: '/medical-center/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'lumi-studio',
    title: 'LUMI — студия красоты',
    description: 'Услуги, мастера и удобная запись в студию красоты',
    category: 'Красота и услуги',
    image: '/lumi/generated/lumi-v4-hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'opt-market',
    title: 'ПАРТИЯ — оптовые закупки',
    description: 'Каталог поставщика, персональные цены и быстрые заказы для бизнеса',
    category: 'Электронная коммерция',
    image: '/b2b/generated/hero-real-v1.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'apple-store',
    title: 'Техника Apple',
    description: 'Демо магазина техники Apple с каталогом и корзиной',
    category: 'Электронная коммерция',
    image: '/apple-store/hero.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'muraka-fashion',
    title: 'Магазин одежды',
    description: 'Демо магазина одежды и кроссовок',
    category: 'Электронная коммерция',
    image: '/muraka-fashion/jacket-patchwork-product.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'nike-sneakers',
    title: 'КРОССОВКИ NIKE',
    description: 'Демо магазина Nike с каталогом и корзиной',
    category: 'Электронная коммерция',
    image: '/royal-step/jordan-banner.webp',
    creator: 'WEB4TG',
    likes: '0',
    badge: 'Демо',
    badgeColor: 'bg-black',
  },
  {
    id: 'stray-store',
    title: 'STRAY',
    description: 'Минималистичный стритвир-магазин: одежда, обувь, аксессуары',
    category: 'Электронная коммерция',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_3F02JzQ7VwcjzsSuotlPzYO9aEk/hf_20260619_122532_b28cb4c9-8ff7-4a54-b736-b1c89f1b22b7.jpeg',
    creator: 'WEB4TG',
    likes: '15.1k',
    badge: 'Новинка',
    badgeColor: 'bg-black',
  },
  {
    id: 'streetwear-vanta',
    title: 'VANTA',
    description: 'Премиальный стритвир-бутик: кроссовки, куртки, худи',
    category: 'Электронная коммерция',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/hf_20260523_154829_2fbfd789-76fb-419f-9591-cb69d3d85f4f_min.webp',
    creator: 'WEB4TG',
    likes: '11.4k',
    badge: 'Новинка',
    badgeColor: 'bg-black',
  },
  {
    id: 'skincare-aura',
    title: 'Aura',
    description: 'Премиальный магазин косметики и ухода за кожей',
    category: 'Электронная коммерция',
    image: 'https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/hf_20260523_125334_678cadf8-6a6e-4f16-941b-ce41570fee6b_min.webp',
    creator: 'WEB4TG',
    likes: '9.8k',
    badge: 'Новинка',
    badgeColor: 'bg-black',
  },
  // НОВЫЕ E-COMMERCE ПРИЛОЖЕНИЯ
  
  // Futuristic Fashion Collection - 4 Premium Designs
  
  // Premium Lifestyle Collection
];
```

## Главные страницы

### ShowcasePage.tsx
```tsx
import { Smartphone, ShoppingCart, Code, Star, Users, ArrowRight, Zap, TrendingUp } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { m } from 'framer-motion';
import { MotionStagger, MotionBox, HoverScale } from './MotionWrapper';
import { useTelegram } from '../hooks/useTelegram';
import { useHaptic } from '../hooks/useHaptic';
import { useTrackInteraction } from '@/hooks/useAIRecommendations';
import { LazyVideo } from './LazyVideo';
import { useVideoLazyLoad } from '../hooks/useVideoLazyLoad';
import { useVideoPreload } from '../hooks/useVideoPreload';
import { preloadDemo } from './demos/DemoRegistry';
import nikeDestinyImage from "@assets/1a589b27fba1af47b8e9957accf246dd_1763654490139.jpg";
import nikeGreenImage from "@assets/f4f7105a6604aa1ca214f4fb48a515ac_1763654563855.jpg";
import nikeAcgImage from "@assets/acc835fff3bb452f0c3b534056fbe1ea_1763719574494.jpg";
import rascalImage from "@assets/e81eb2add9c19398a4711b33670141ec_1763720062375.jpg";

const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";
const watchesVideo = "/videos/ac56ea9bc8429fb2f0ffacfac0abe74d_1762353025450.mp4";
const heroVideo = "/videos/1341996d8f73172cbc77930dc818d88e_t4_1763643600785.mp4";

interface ShowcasePageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

function ShowcasePage({ onNavigate, onOpenDemo }: ShowcasePageProps) {
  const { hapticFeedback, isDark, colorScheme, devicePerformance } = useTelegram();
  const haptic = useHaptic();
  const trackInteraction = useTrackInteraction();
  
  const videoRef2 = useVideoPreload();
  const videoRef3 = useVideoLazyLoad();
  
  const handleOpenDemo = useCallback((demoId: string) => {
    haptic.light();
    onOpenDemo(demoId);
  }, [haptic, onOpenDemo]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden relative">
      <div className="max-w-md mx-auto min-h-screen px-3 pb-4 relative z-10" style={{ paddingTop: '120px' }}>
        
        <div className="relative rounded-2xl overflow-hidden mb-6"
          style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }}
        >
          <div className="relative rounded-2xl overflow-hidden" style={{ background: '#000000' }}>
            <LazyVideo
              src={heroVideo}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
            />
            
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)' }}
            />
          
            <div className="relative px-4 py-10 text-center flex items-center justify-center min-h-[38vh]">
              <div 
                className="relative rounded-2xl px-5 py-5 mx-auto w-full max-w-[260px]"
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div 
                  className="inline-block px-3 py-1 rounded-full mb-3 text-[10px] font-bold tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  +300% К ПРОДАЖАМ
                </div>
                
                <h1 className="text-xl font-black mb-1.5" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  ВАШИ КЛИЕНТЫ
                </h1>
                
                <div 
                  className="text-base font-bold tracking-wide mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  УЖЕ В TELEGRAM
                </div>
                
                <p className="text-[11px] font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Получайте заказы 24/7 без сайта
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          
          {/* Main Hero Card - White/Light style like T-P67 */}
          <div 
            className="relative rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-300 active:scale-[0.98]"
            onClick={() => handleOpenDemo('clothing-store')}
            onMouseEnter={() => preloadDemo('clothing-store')}
            onTouchStart={() => preloadDemo('clothing-store')}
            data-testid="demo-card-clothing"
            style={{ 
              background: 'linear-gradient(180deg, #F5F5F7 0%, #E8E8ED 100%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div className="p-5 pb-4">
              {/* Header with logo */}
              <div className="flex items-start justify-between mb-4">
                <div className="text-2xl font-black tracking-tight" style={{ color: '#1D1D1F' }}>
                  ALURE
                </div>
                {/* Decorative tribal-style icon */}
                <svg width="40" height="32" viewBox="0 0 40 32" fill="none" className="opacity-80">
                  <path d="M20 4C20 4 12 8 8 16C4 24 8 28 8 28M20 4C20 4 28 8 32 16C36 24 32 28 32 28M20 4V12M14 20C14 20 17 24 20 24C23 24 26 20 26 20" stroke="#1D1D1F" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="20" cy="16" r="2" fill="#1D1D1F"/>
                </svg>
              </div>
              
              {/* Warning section */}
              <div className="text-center mb-4">
                <div className="text-[10px] font-bold tracking-[0.2em] mb-2" style={{ color: '#1D1D1F' }}>
                  МАГАЗИН В TELEGRAM
                </div>
                <p className="text-[9px] leading-relaxed px-2" style={{ color: 'rgba(29, 29, 31, 0.6)' }}>
                  АВТОМАТИЧЕСКИЕ ПРОДАЖИ. КАТАЛОГ ТОВАРОВ. КОРЗИНА И ОПЛАТА. 
                  ИНТЕГРАЦИЯ С CRM. УВЕДОМЛЕНИЯ О ЗАКАЗАХ. БЕЗ САЙТА И ПРИЛОЖЕНИЯ.
                </p>
              </div>
              
              {/* Price and CTA */}
              <div 
                className="flex items-center justify-between rounded-full px-4 py-2.5 mt-3"
                style={{ background: 'rgba(29, 29, 31, 0.08)' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>от 9 990 ₽</span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: '#1D1D1F' }}>
                  <span>ОТКРЫТЬ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 2x2 Grid - Dark cards with images */}
          <div className="grid grid-cols-2 gap-3">
            {/* ART STORE style card */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-300 active:scale-[0.98]"
              onClick={() => handleOpenDemo('sneaker-store')}
              onMouseEnter={() => preloadDemo('sneaker-store')}
              onTouchStart={() => preloadDemo('sneaker-store')}
              data-testid="demo-card-sneaker"
              style={{ background: '#1C1C1E' }}
            >
              <video
                ref={videoRef2}
                src={sneakerVideo}
                loop muted playsInline preload="none"
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  SNEAKER STORE
                </div>
              </div>
            </div>

            {/* SOUND SHOP style card - Blue tinted */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-300 active:scale-[0.98]"
              onClick={() => handleOpenDemo('luxury-watches')}
              onMouseEnter={() => preloadDemo('luxury-watches')}
              onTouchStart={() => preloadDemo('luxury-watches')}
              data-testid="demo-card-watches"
              style={{ background: '#4A5568' }}
            >
              <video
                ref={videoRef3}
                src={watchesVideo}
                loop muted playsInline preload="none"
                className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'saturate(0.8) brightness(0.9)' }}
              />
              <div className="absolute inset-0" style={{ background: 'rgba(59, 130, 246, 0.15)' }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  LUXURY WATCHES
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row - Colored cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Olive/Khaki card like T-P67 DISCOVER */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-300 active:scale-[0.98]"
              onClick={() => handleOpenDemo('futuristic-fashion-1')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-1')}
              onTouchStart={() => preloadDemo('futuristic-fashion-1')}
              data-testid="demo-card-outdoor"
              style={{ background: 'linear-gradient(180deg, #6B7B5C 0%, #5A6A4D 100%)' }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="text-xl font-black tracking-tight mb-2 text-white">
                  RASCAL
                </div>
                {/* Star icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-4 opacity-80">
                  <path d="M12 2L14 10H22L16 14L18 22L12 18L6 22L8 14L2 10H10L12 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                </svg>
                
                {/* DISCOVER button */}
                <div 
                  className="px-6 py-2 rounded-full text-[10px] font-bold tracking-wider transition-all duration-200 active:scale-95"
                  style={{ 
                    background: 'rgba(0, 0, 0, 0.25)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  ОТКРЫТЬ
                </div>
              </div>
            </div>

            {/* Dark gray card like MUSIC CLUB */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-300 active:scale-[0.98]"
              onClick={() => handleOpenDemo('futuristic-fashion-2')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-2')}
              onTouchStart={() => preloadDemo('futuristic-fashion-2')}
              data-testid="demo-card-minimal"
              style={{ background: 'linear-gradient(180deg, #3A3A3C 0%, #2C2C2E 100%)' }}
            >
              {/* Arrow icon in top right */}
              <div 
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              >
                <ArrowRight className="w-3.5 h-3.5 text-white -rotate-45" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-sm font-bold text-white mb-0.5">FASHION STORE</div>
                <div className="text-sm font-bold text-white mb-0.5">CATALOG</div>
                <div className="text-[10px] font-medium tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  MOSCOW/DUBAI
                </div>
              </div>
            </div>
          </div>

          {/* Additional row - More cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Brand card */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-300 active:scale-[0.98]"
              onClick={() => handleOpenDemo('futuristic-fashion-3')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-3')}
              onTouchStart={() => preloadDemo('futuristic-fashion-3')}
              data-testid="demo-card-brand"
              style={{ background: '#1C1C1E' }}
            >
              <img
                src={nikeGreenImage}
                alt="Brand"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  BRAND STORE
                </div>
              </div>
            </div>

            {/* Catalog card */}
            <div 
              className="relative h-[180px] rounded-3xl overflow-hidden group cursor-pointer transition-transform duration-300 active:scale-[0.98]"
              onClick={() => handleOpenDemo('futuristic-fashion-4')}
              onMouseEnter={() => preloadDemo('futuristic-fashion-4')}
              onTouchStart={() => preloadDemo('futuristic-fashion-4')}
              data-testid="demo-card-catalog"
              style={{ background: '#1C1C1E' }}
            >
              <img
                src={nikeAcgImage}
                alt="Catalog"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  OUTDOOR GEAR
                </div>
              </div>
            </div>
          </div>

        </div>

        <MotionStagger className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 px-1">
          
          <MotionBox variant="fadeInScale">
            <HoverScale scale={1.02}>
              <div 
                className="sm:col-span-2 relative rounded-2xl p-4 sm:p-6 cursor-pointer overflow-hidden group tg-interactive"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                }}
                onClick={() => onNavigate('projects')}
                data-testid="card-main-services"
              >
                <div className="absolute inset-0 opacity-20"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 70%)' }}
                />
                
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10">
                  <div className="w-7 sm:w-9 h-7 sm:h-9 text-black" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))' }}>
                    <Star className="w-full h-full" fill="currentColor" />
                  </div>
                </div>
                
                <div className="relative text-black text-[72px] sm:text-[96px] font-black leading-none mb-1 sm:mb-2 tracking-tighter"
                  style={{ textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)' }}
                >
                  24ч
                </div>
                
                <div className="relative text-black font-black text-xl sm:text-2xl mb-0.5 sm:mb-1 tracking-tight">
                  ДО ЗАПУСКА
                </div>
                
                <div className="relative text-black/70 text-xs sm:text-sm font-medium">
                  Пока конкуренты думают - вы продаете
                </div>
                
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full"
                  style={{ background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="text-white text-[10px] sm:text-xs font-bold tracking-wide whitespace-nowrap">WEB4TG.AGENCY</span>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp">
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-3xl p-4 cursor-pointer overflow-hidden group tg-interactive"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
                }}
                onClick={() => handleOpenDemo('clothing-store')}
                data-testid="card-telegram-apps"
              >
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full"
                  style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)' }}
                >
                  <span className="text-white text-[10px] font-bold tracking-wide">УДАЛЕННО</span>
                </div>
                
                <div className="text-black text-3xl font-thin mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '3px' }}>1/4</div>
                
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Smartphone className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-black text-lg font-bold leading-tight">Магазин в Telegram</h3>
                  <p className="text-black/70 text-xs leading-tight mb-2">Клиенты покупают прямо в чате. Без сайта, без приложения</p>
                  <p className="text-black/60 text-sm font-medium">ОТ 49 000 Р</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.1}>
            <HoverScale scale={1.05}>
              <div 
                className="relative bg-white/15 border border-white/20 rounded-3xl p-4 cursor-pointer tg-interactive"
                style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}
                onClick={() => handleOpenDemo('electronics')}
              >
                <div className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                  ХИТ
                </div>
                
                <div className="text-white text-2xl font-black mb-2">x3</div>
                
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold leading-tight">Рост продаж</h3>
                  <p className="text-white/70 text-xs leading-tight mb-2">Автоматические продажи пока вы спите</p>
                  <p className="text-white/60 text-sm font-medium">ГАРАНТИЯ</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.15}>
            <HoverScale scale={1.05}>
              <div 
                className="relative bg-white/15 border border-white/20 rounded-3xl p-4 cursor-pointer tg-interactive"
                style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}
                onClick={() => handleOpenDemo('beauty')}
              >
                <div className="absolute top-3 right-3 bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                  AI
                </div>
                
                <div className="text-white text-2xl font-black mb-2">24/7</div>
                
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                  <Code className="w-5 h-5 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white text-lg font-bold leading-tight">AI-Ассистент</h3>
                  <p className="text-white/70 text-xs leading-tight mb-2">Отвечает клиентам, принимает заказы за вас</p>
                  <p className="text-white/60 text-sm font-medium">ВКЛЮЧЕНО</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

          <MotionBox variant="fadeInUp" delay={0.2}>
            <HoverScale scale={1.05}>
              <div 
                className="relative rounded-3xl p-4 cursor-pointer tg-interactive"
                style={{ backgroundColor: '#10B981' }}
                onClick={() => onNavigate('projects')}
              >
                <div className="absolute top-3 right-3 bg-black/20 text-black text-xs px-2 py-1 rounded-full font-medium">
                  КЕЙСЫ
                </div>
                
                <div className="text-black text-3xl font-thin mb-2" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '3px' }}>127+</div>
                
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" style={{ color: '#10B981' }} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-black text-lg font-bold leading-tight">Довольных клиентов</h3>
                  <p className="text-black/70 text-xs leading-tight mb-2">Реальные результаты. Смотрите сами</p>
                  <p className="text-black/60 text-sm font-medium">ОТЗЫВЫ</p>
                </div>
              </div>
            </HoverScale>
          </MotionBox>

        </MotionStagger>
        
      </div>
    </div>
  );
}

export default React.memo(ShowcasePage);
```

### ProjectsPage.tsx
```tsx
import { demoApps } from "../data/demoApps";
import { ArrowRight } from "lucide-react";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

export default function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const topApps = demoApps; // All 13 apps

  return (
    <div 
      className="min-h-screen pb-32"
      style={{ 
        background: '#09090B',
        color: '#E4E4E7',
        paddingTop: '140px'
      }}
    >
      <div className="max-w-md mx-auto">
        
        {/* ═══════════════════════════════════════════════════════
            TIER 1: HERO — Authority-Led, Understated
        ═══════════════════════════════════════════════════════ */}
        <header className="px-7 pt-8 pb-16">
          {/* Eyebrow */}
          <p 
            className="scroll-fade-in"
            style={{
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.18em',
              color: '#71717A',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}
          >
            Web4TG Studio
          </p>
          
          {/* Headline */}
          <h1 
            className="scroll-fade-in-delay-1"
            style={{
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              fontSize: '28px',
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: '1.3',
              color: '#FAFAFA'
            }}
          >
            Ваш следующий клиент
            <br />
            напишет через 4 минуты.
            <br />
            <span style={{ color: '#FFFFFF' }}>
              Кто ему ответит?
            </span>
          </h1>
          
          {/* Subtext */}
          <p 
            className="scroll-fade-in-delay-2"
            style={{
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.6',
              color: '#71717A',
              marginTop: '20px',
              maxWidth: '320px'
            }}
          >
            Telegram Mini App отвечает мгновенно, консультирует и закрывает сделки — пока вы занимаетесь чем угодно. 50+ бизнесов уже продают на автомате.
          </p>
          
          {/* Competitive FOMO Statement */}
          <div 
            className="scroll-fade-in-delay-3"
            style={{
              marginTop: '36px',
              padding: '24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(59,130,246,0.04) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}
          >
            <p style={{
              fontSize: '15px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: '#E4E4E7',
              lineHeight: '1.6'
            }}>
              Через 14 дней у вас будет
              <br />
              <span style={{ 
                color: '#A78BFA',
                fontWeight: 600
              }}>
                своё приложение.
              </span>
              <br />
              <span style={{ color: '#71717A' }}>
                Или у вашего конкурента.
              </span>
            </p>
          </div>
          
          {/* Exclusivity Block */}
          <div 
            className="scroll-fade-in-delay-4"
            style={{
              marginTop: '12px',
              display: 'flex',
              gap: '12px'
            }}
          >
            {/* Left: What you get */}
            <div style={{
              flex: 1,
              padding: '20px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#52525B',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                Не шаблон
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#FAFAFA',
                lineHeight: '1.4'
              }}>
                Ваш бренд.
                <br />
                Ваш стиль.
                <br />
                Ваши правила.
              </p>
            </div>
            
            {/* Right: Availability */}
            <div style={{
              flex: 1,
              padding: '20px 16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.04)'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#52525B',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                Декабрь
              </p>
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#FAFAFA',
                letterSpacing: '-0.03em'
              }}>
                3
              </p>
              <p style={{
                fontSize: '12px',
                color: '#71717A',
                marginTop: '4px'
              }}>
                слота осталось
              </p>
            </div>
          </div>
        </header>

        {/* Hairline */}
        <div 
          className="mx-7"
          style={{ height: '1px', background: '#27272A' }}
        />

        {/* ═══════════════════════════════════════════════════════
            TIER 2: CURATED SHOWCASE INTRO
        ═══════════════════════════════════════════════════════ */}
        <section className="px-7 py-10">
          <div className="flex items-baseline justify-between">
            <p 
              style={{
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                color: '#52525B',
                textTransform: 'uppercase'
              }}
            >
              Коллекция приложений
            </p>
            <p 
              style={{
                fontSize: '13px',
                color: '#52525B'
              }}
            >
              {topApps.length} проектов
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            APP CARDS — ОРИГИНАЛЬНЫЕ, БЕЗ ИЗМЕНЕНИЙ
        ═══════════════════════════════════════════════════════ */}
        <div className="px-5 space-y-3">
          {topApps.map((app, index) => (
            <div
              key={app.id}
              onClick={() => onOpenDemo(app.id)}
              className={`premium-card group scroll-fade-in-delay-${Math.min(index + 1, 4)}`}
              data-testid={`card-app-${app.id}`}
              style={{
                position: 'relative',
                cursor: 'pointer',
                borderRadius: '16px',
                padding: '20px 20px 20px 24px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(40px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                opacity: 0,
                animationDelay: `${0.05 + index * 0.04}s`,
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 
                    data-testid={`text-title-${app.id}`}
                    style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: '#FFFFFF',
                      marginBottom: '4px'
                    }}
                  >
                    {app.title}
                  </h3>
                  <p 
                    data-testid={`text-description-${app.id}`}
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.4',
                      color: 'rgba(255, 255, 255, 0.45)',
                      letterSpacing: '-0.005em',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {app.description}
                  </p>
                </div>
                
                <button
                  className="open-button flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    flexShrink: 0
                  }}
                  data-testid={`button-open-${app.id}`}
                >
                  <span>Открыть</span>
                  <ArrowRight 
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" 
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            TIER 3: INSIGHT BAND — Discreet Metrics
        ═══════════════════════════════════════════════════════ */}
        <section className="px-7 mt-12">
          <div 
            style={{ 
              height: '1px', 
              background: '#27272A',
              marginBottom: '32px'
            }}
          />
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#FAFAFA',
                  letterSpacing: '-0.02em'
                }}
              >
                50+
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: '#52525B',
                  marginTop: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                проектов
              </p>
            </div>
            <div>
              <p 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#FAFAFA',
                  letterSpacing: '-0.02em'
                }}
              >
                6
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: '#52525B',
                  marginTop: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                отраслей
              </p>
            </div>
            <div>
              <p 
                style={{
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#FAFAFA',
                  letterSpacing: '-0.02em'
                }}
              >
                14
              </p>
              <p 
                style={{
                  fontSize: '11px',
                  color: '#52525B',
                  marginTop: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                дней запуск
              </p>
            </div>
          </div>

          <div 
            style={{ 
              height: '1px', 
              background: '#27272A',
              marginTop: '32px'
            }}
          />
        </section>

        {/* ═══════════════════════════════════════════════════════
            TIER 4: EXECUTIVE CTA — Refined & Confident
        ═══════════════════════════════════════════════════════ */}
        <section className="px-7 mt-12">
          <div className="text-center">
            {/* Pull Quote */}
            <p 
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '18px',
                fontStyle: 'italic',
                fontWeight: 400,
                color: '#A1A1AA',
                lineHeight: '1.5',
                marginBottom: '24px'
              }}
            >
              "Обсудим, как Telegram станет
              <br />
              вашим каналом продаж"
            </p>

            {/* CTA Button */}
            <a
              href="https://t.me/web4tgs"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button inline-flex items-center justify-center gap-2.5 w-full py-4 rounded-xl font-medium transition-all duration-300"
              style={{
                background: '#FAFAFA',
                color: '#09090B',
                fontSize: '15px',
                letterSpacing: '-0.01em',
                textDecoration: 'none'
              }}
              data-testid="button-order-cta"
            >
              Запросить консультацию
              <ArrowRight className="w-4 h-4" />
            </a>
            
            {/* Micro-copy */}
            <p 
              style={{
                fontSize: '12px',
                color: '#52525B',
                marginTop: '16px',
                letterSpacing: '0.01em'
              }}
            >
              Бесплатно · Ответим в течение часа
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FOOTER — Minimal Signature
        ═══════════════════════════════════════════════════════ */}
        <footer className="px-7 mt-16 text-center">
          <div 
            style={{ 
              height: '1px', 
              background: '#18181B',
              marginBottom: '24px'
            }}
          />
          <p 
            style={{
              fontSize: '10px',
              letterSpacing: '0.25em',
              color: '#3F3F46',
              textTransform: 'uppercase'
            }}
          >
            Web4TG · Telegram Mini Apps · 2025
          </p>
        </footer>

      </div>

      <style>{`
        .premium-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }

        .premium-card:hover .open-button {
          background: rgba(255, 255, 255, 0.18);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .premium-card:active {
          transform: translateX(2px);
          opacity: 0.9;
        }

        .cta-button:hover {
          background: #FFFFFF;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(250, 250, 250, 0.1);
        }

        .cta-button:active {
          transform: translateY(0);
          box-shadow: none;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scroll-fade-in,
        .scroll-fade-in-delay-1,
        .scroll-fade-in-delay-2,
        .scroll-fade-in-delay-3,
        .scroll-fade-in-delay-4 {
          animation: fadeSlideIn 0.6s ease-out forwards;
        }

        .scroll-fade-in { animation-delay: 0.05s; }
        .scroll-fade-in-delay-1 { animation-delay: 0.1s; }
        .scroll-fade-in-delay-2 { animation-delay: 0.18s; }
        .scroll-fade-in-delay-3 { animation-delay: 0.26s; }
        .scroll-fade-in-delay-4 { animation-delay: 0.34s; }
      `}</style>
    </div>
  );
}
```

### ProfilePage.tsx
```tsx
import { useState, useEffect, useCallback, useMemo, memo, startTransition, useRef } from "react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  User, 
  Settings, 
  MessageCircle, 
  FileText, 
  CreditCard, 
  Home, 
  Calculator, 
  Wrench, 
  Edit, 
  Crown, 
  Star, 
  Smartphone, 
  CheckCircle,
  ChevronRight,
  Phone,
  Mail,
  Building,
  Bell,
  Shield,
  HelpCircle,
  ExternalLink,
  Package,
  Clock,
  TrendingUp,
  Send,
  Instagram,
  Music,
  Sparkles,
  Rocket,
  UserCircle2,
  Plus,
  Users,
  Gift,
  Coins
} from "lucide-react";
import { useTelegram } from "../hooks/useTelegram";
import { useToast } from "@/hooks/use-toast";

interface ProfilePageProps {
  onNavigate: (section: string) => void;
}

// Memoized Status Icon Component
const StatusIcon = memo(({ status }: { status: string }) => {
  switch (status) {
    case 'Готово':
    case 'Завершен':
      return <CheckCircle className="w-4 h-4 text-system-green" />;
    case 'В разработке':
    case 'Разработка':
      return <Clock className="w-4 h-4 text-system-orange" />;
    case 'Планирование':
    case 'Оплачено':
      return <Package className="w-4 h-4 text-system-blue" />;
    default:
      return <Clock className="w-4 h-4 text-secondary-label" />;
  }
});
StatusIcon.displayName = 'StatusIcon';

// Helper function to get user initials
const getUserInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return '?';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Helper function to generate gradient color based on user ID
const getGradientForUser = (userId: number | null): string => {
  if (!userId) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Cyan-Purple
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', // Orange-Pink
  ];
  
  return gradients[userId % gradients.length];
};

// Memoized User Card Component
const UserCard = memo(({ profileData, isAvailable, telegramUser }: { profileData: any, isAvailable: boolean, telegramUser: any }) => {
  const hasValidUser = !!telegramUser && !!telegramUser.first_name;
  const initials = getUserInitials(profileData.name);
  const gradient = getGradientForUser(profileData.telegramId);
  
  return (
    <section className="liquid-glass-card-elevated rounded-2xl p-6 text-center liquid-glass-shimmer">
      {/* User Avatar with Initials */}
      <div className="relative w-24 h-24 mx-auto mb-4" data-testid="user-avatar">
        {hasValidUser ? (
          <div 
            className="w-full h-full rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
            style={{ background: gradient }}
            data-testid="avatar-initials"
          >
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
        ) : (
          <div className="w-full h-full bg-system-blue/10 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-system-blue" />
          </div>
        )}
        
        {/* Telegram Status Badge */}
        {isAvailable && hasValidUser && (
          <div 
            className="absolute bottom-0 right-0 w-7 h-7 bg-system-green rounded-full border-2 border-background flex items-center justify-center"
            data-testid="telegram-status-badge"
          >
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <h2 className="ios-title2 mb-2 text-white" data-testid="user-name">
        {profileData.name}
      </h2>
      
      {profileData.username && (
        <div className="ios-footnote text-system-blue mb-3" data-testid="user-username">
          {profileData.username}
        </div>
      )}
      
      <div className="flex items-center justify-center space-x-2 mb-4" data-testid="connection-status">
        {isAvailable && hasValidUser ? (
          <>
            <CheckCircle className="w-4 h-4 text-system-green" />
            <span className="ios-footnote text-system-green">Подключен к Telegram</span>
          </>
        ) : (
          <>
            <Smartphone className="w-4 h-4 text-system-blue" />
            <span className="ios-footnote text-system-blue">WEB4TG Client</span>
          </>
        )}
      </div>

      {profileData.telegramId && (
        <div className="bg-system-blue/10 backdrop-blur-xl rounded-xl border border-system-blue/30 p-3" data-testid="user-telegram-id">
          <div className="ios-caption1 text-white/70 mb-1 font-medium">ID пользователя</div>
          <div className="ios-footnote font-mono text-system-blue font-semibold">#{profileData.telegramId}</div>
        </div>
      )}
    </section>
  );
});
UserCard.displayName = 'UserCard';

// Memoized Stats Card Component
const StatsCard = memo(({ stats }: { stats: { total: number, completed: number, inProgress: number } }) => (
  <div className="liquid-glass-card rounded-2xl p-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-system-blue/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Package className="w-6 h-6 text-system-blue" />
        </div>
        <div className="ios-title3 font-bold text-system-blue">{stats.total}</div>
        <div className="ios-caption2 text-white/70">Проектов</div>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-system-green/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle className="w-6 h-6 text-system-green" />
        </div>
        <div className="ios-title3 font-bold text-system-green">{stats.completed}</div>
        <div className="ios-caption2 text-white/70">Завершено</div>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 bg-system-orange/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Clock className="w-6 h-6 text-system-orange" />
        </div>
        <div className="ios-title3 font-bold text-system-orange">{stats.inProgress}</div>
        <div className="ios-caption2 text-white/70">В работе</div>
      </div>
    </div>
  </div>
));
StatsCard.displayName = 'StatsCard';

// Memoized Project Item Component
const ProjectItem = memo(({ project, isLast }: { project: any, isLast: boolean }) => (
  <div className={`p-4 ${!isLast ? 'border-b border-white/10' : ''}`}>
    <div className="flex items-center space-x-3">
      <StatusIcon status={project.status} />
      <div className="flex-1">
        <div className="ios-body font-bold text-white">{project.name}</div>
        <div className="flex items-center space-x-2">
          <span className={`ios-caption2 font-semibold ${
            project.status === 'Готово' || project.status === 'Завершен' ? 'text-system-green' :
            project.status === 'В разработке' || project.status === 'Разработка' ? 'text-system-orange' :
            'text-system-blue'
          }`}>
            {project.status}
          </span>
          <span className="ios-caption2 text-white/40">•</span>
          <span className="ios-caption2 text-white/70 font-medium">{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              project.status === 'Готово' || project.status === 'Завершен' ? 'bg-system-green' : 
              project.status === 'В разработке' || project.status === 'Разработка' ? 'bg-system-orange' : 
              'bg-system-blue'
            }`}
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-white/40" />
    </div>
  </div>
));
ProjectItem.displayName = 'ProjectItem';

// Virtualized Projects List Component
const ProjectsVirtualList = memo(({ projects, onNavigateConstructor }: { 
  projects: any[], 
  onNavigateConstructor: () => void 
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: projects.length + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 3,
  });

  return (
    <section>
      <div className="space-y-3">
        <div className="ios-list-header text-white/70 font-medium px-2">Мои проекты</div>
        
        <div 
          ref={parentRef}
          className="liquid-glass-card rounded-2xl overflow-auto"
          style={{ maxHeight: '400px' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLast = virtualRow.index === projects.length;
              
              if (isLast) {
                return (
                  <div
                    key="add-project"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="p-4 border-t border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={onNavigateConstructor}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-system-blue" />
                        </div>
                        <div className="flex-1">
                          <div className="ios-body font-bold text-system-blue">Создать новый проект</div>
                          <div className="ios-footnote text-white/70">Запустите еще одно приложение</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      </div>
                    </div>
                  </div>
                );
              }
              
              const project = projects[virtualRow.index];
              return (
                <div
                  key={project.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <ProjectItem project={project} isLast={virtualRow.index === projects.length - 1} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
});
ProjectsVirtualList.displayName = 'ProjectsVirtualList';

// Profile Page Component
function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, isAvailable, homeScreen } = useTelegram();
  const { toast } = useToast();
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Memoized profile data
  const profileData = useMemo(() => ({
    name: user ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 'Пользователь',
    username: user?.username ? `@${user.username}` : null,
    telegramId: user?.id || null,
    language: user?.language_code || 'ru',
    joinedAt: user ? 'Активен в Telegram' : 'Не подключен'
  }), [user]);

  // Fetch projects with transition for smooth UI
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!profileData.telegramId) {
        setIsLoadingProjects(false);
        return;
      }

      try {
        const response = await fetch(`/api/user-projects/${profileData.telegramId}`);
        if (response.ok) {
          const projects = await response.json();
          startTransition(() => {
            setUserProjects(projects);
          });
        } else {
          setUserProjects([]);
        }
      } catch (error) {
        console.log('Проекты не найдены, пользователь новый');
        setUserProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchUserProjects();
  }, [profileData.telegramId]);

  // Memoized stats
  const stats = useMemo(() => ({
    total: userProjects.length,
    completed: userProjects.filter(p => p.status === 'Готово' || p.status === 'Завершен' || p.progress === 100).length,
    inProgress: userProjects.filter(p => p.status !== 'Готово' && p.status !== 'Завершен' && p.progress !== 100).length
  }), [userProjects]);

  // Memoized language display
  const languageDisplay = useMemo(() => {
    switch (profileData.language) {
      case 'ru': return 'Русский';
      case 'en': return 'English';
      default: return profileData.language || 'Русский';
    }
  }, [profileData.language]);

  // Memoized navigation callbacks
  const handleNavigateConstructor = useCallback(() => onNavigate('constructor'), [onNavigate]);
  const handleNavigatePricing = useCallback(() => onNavigate('constructor'), [onNavigate]);
  const handleNavigateHelp = useCallback(() => onNavigate('help'), [onNavigate]);
  const handleNavigateReview = useCallback(() => onNavigate('review'), [onNavigate]);
  const handleNavigateReferral = useCallback(() => onNavigate('referral'), [onNavigate]);
  const handleNavigateRewards = useCallback(() => onNavigate('rewards'), [onNavigate]);
  const handleNavigateEarning = useCallback(() => onNavigate('earning'), [onNavigate]);

  // Memoized external link handlers
  const handleTelegramClick = useCallback(() => window.open('https://t.me/web4tgs', '_blank'), []);
  const handleInstagramClick = useCallback(() => window.open('https://instagram.com/web4tg', '_blank'), []);
  const handleTikTokClick = useCallback(() => window.open('https://tiktok.com/@web4tg', '_blank'), []);
  
  // Toggle handlers
  const toggleAutoSave = useCallback(() => setAutoSave(prev => !prev), []);
  const toggleBackup = useCallback(() => setBackupEnabled(prev => !prev), []);
  const toggleNotifications = useCallback(() => setNotificationsEnabled(prev => !prev), []);

  return (
    <div className="min-h-screen bg-black text-white pb-24" style={{ paddingTop: '140px' }}>
      <div className="max-w-md mx-auto px-4 pt-4 pb-6 space-y-6">
        
        {/* User Profile Card */}
        <div className="scroll-fade-in">
          <UserCard profileData={profileData} isAvailable={isAvailable} telegramUser={user} />
        </div>

        {/* Statistics */}
        <section className="scroll-fade-in-delay-1">
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Статистика активности</div>
            
            {isLoadingProjects ? (
              <div className="liquid-glass-card rounded-2xl p-6 text-center">
                <div className="w-8 h-8 border-2 border-system-blue/30 border-t-system-blue rounded-full animate-spin mx-auto mb-3"></div>
                <div className="ios-footnote text-white/70">Загружаем ваши проекты...</div>
              </div>
            ) : userProjects.length > 0 ? (
              <StatsCard stats={stats} />
            ) : (
              <div className="liquid-glass-card rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-system-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-system-blue" />
                </div>
                <h3 className="ios-body font-bold mb-2 text-white">Пора создать первое приложение!</h3>
                <p className="ios-footnote text-white/70 mb-4 leading-relaxed">
                  У вас пока нет проектов. Создайте свое первое Telegram приложение и начните зарабатывать уже сегодня!
                </p>
                <button 
                  className="ios-button-filled w-full mb-3"
                  onClick={handleNavigateConstructor}
                >
                  Создать приложение
                </button>
                <button 
                  className="ios-button-plain w-full"
                  onClick={handleNavigatePricing}
                >
                  Выбрать шаблон
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Telegram Integration */}
        <section className="scroll-fade-in-delay-2">
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Интеграция с Telegram</div>
            
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5 text-system-blue" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Язык интерфейса</div>
                  <div className="ios-footnote text-white/70">{languageDisplay}</div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-system-green" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Статус подключения</div>
                  <div className="ios-footnote text-white/70">{profileData.joinedAt}</div>
                </div>
                {isAvailable && <CheckCircle className="w-5 h-5 text-system-green" />}
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Bonuses & Rewards Section */}
        <section className="scroll-fade-in-delay-3">
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Бонусы и награды</div>
            
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateReferral}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios-body text-white font-semibold">Реферальная программа</div>
                    <div className="ios-footnote text-white/70">Приглашайте друзей и зарабатывайте</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>

              <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateRewards}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios-body text-white font-semibold">Цифровые награды</div>
                    <div className="ios-footnote text-white/70">Достижения, уровни и бонусы</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>

              <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateEarning}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="ios-body text-white font-semibold">Заработок монет</div>
                    <div className="ios-footnote text-white/70">Выполняйте задания и зарабатывайте</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* My Projects */}
        {!isLoadingProjects && userProjects.length > 0 && (
          <ProjectsVirtualList 
            projects={userProjects} 
            onNavigateConstructor={handleNavigateConstructor}
          />
        )}

        {/* Smart Features */}
        <section className="scroll-fade-in-delay-4">
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Умные функции</div>
            
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-system-green" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Автосохранение</div>
                  <div className="ios-footnote text-white/70">Проекты сохраняются каждые 30 секунд</div>
                </div>
                <div 
                  className={`ios-switch ${autoSave ? 'ios-switch-active' : ''} cursor-pointer`}
                  onClick={toggleAutoSave}
                >
                  <div className="ios-switch-thumb"></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-system-blue" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Резервные копии</div>
                  <div className="ios-footnote text-white/70">Автоматическое резервирование в облако</div>
                </div>
                <div 
                  className={`ios-switch ${backupEnabled ? 'ios-switch-active' : ''} cursor-pointer`}
                  onClick={toggleBackup}
                >
                  <div className="ios-switch-thumb"></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-purple/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-system-purple" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Уведомления о статусе</div>
                  <div className="ios-footnote text-white/70">Получать обновления о ходе разработки</div>
                </div>
                <div 
                  className={`ios-switch ${notificationsEnabled ? 'ios-switch-active' : ''} cursor-pointer`}
                  onClick={toggleNotifications}
                >
                  <div className="ios-switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-orange/20 rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-system-orange" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Тема оформления</div>
                  <div className="ios-footnote text-white/70">Темная тема (автоматически)</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>

            <div 
              className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => {
                if (homeScreen) {
                  try {
                    homeScreen.add();
                    toast({
                      title: "Добавление на главный экран",
                      description: "Следуйте инструкциям браузера для добавления ярлыка приложения",
                    });
                  } catch (error) {
                    toast({
                      title: "Функция недоступна",
                      description: "Ваша версия Telegram не поддерживает эту функцию",
                      variant: "destructive",
                    });
                  }
                } else {
                  toast({
                    title: "Функция недоступна",
                    description: "Ваш браузер не поддерживает добавление на главный экран",
                    variant: "destructive",
                  });
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Добавить на главный экран</div>
                  <div className="ios-footnote text-white/70">Быстрый доступ к приложению</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <div className="space-y-3">
            <div className="ios-list-header text-white/70 font-medium px-2">Поддержка</div>
            
            <div className="liquid-glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleTelegramClick}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-system-blue" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Связаться с нами</div>
                  <div className="ios-footnote text-white/70">Техподдержка 24/7</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleTelegramClick}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-blue/20 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5 text-system-blue" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Telegram</div>
                  <div className="ios-footnote text-white/70">@web4tgs</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleInstagramClick}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white/90" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Instagram</div>
                  <div className="ios-footnote text-white/70">@web4tg</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleTikTokClick}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/20">
                  <Music className="w-5 h-5 text-white/90" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">TikTok</div>
                  <div className="ios-footnote text-white/70">@web4tg</div>
                </div>
                <ExternalLink className="w-4 h-4 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateHelp}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-green/20 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-system-green" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Справка</div>
                  <div className="ios-footnote text-white/70">FAQ и инструкции</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
            
            <div className="p-4 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleNavigateReview}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-system-orange/20 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-system-orange" />
                </div>
                <div className="flex-1">
                  <div className="ios-body text-white font-semibold">Оставить отзыв</div>
                  <div className="ios-footnote text-white/70">Оцените наш сервис</div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" />
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* App Info */}
        <section className="text-center space-y-2 pb-4">
          <div className="ios-footnote text-white/40 font-medium">WEB4TG Platform</div>
          <div className="ios-footnote text-white/40">Версия 1.0.0</div>
        </section>
      </div>
    </div>
  );
}

export default memo(ProfilePage);
```

### GlobalSidebar.tsx
```tsx
import { useState, useCallback } from "react";
import { Menu, X, Sparkles, MessageCircle, Bot, Users, Home, Send, ChevronRight } from "lucide-react";
import { SiInstagram, SiTelegram } from "react-icons/si";
import UserAvatar from "./UserAvatar";

interface GlobalSidebarProps {
  currentRoute: string;
  onNavigate: (section: string) => void;
  user?: {
    photo_url?: string;
    first_name?: string;
  };
}

export default function GlobalSidebar({ currentRoute, onNavigate, user }: GlobalSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pressedItem, setPressedItem] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    { 
      icon: Home, 
      label: 'Главная', 
      section: '', 
      routes: ['showcase'],
      description: 'Все возможности'
    },
    { 
      icon: Sparkles, 
      label: 'Бизнес приложения', 
      section: 'projects', 
      routes: ['projects'],
      description: 'Готовые решения'
    },
    { 
      icon: Bot, 
      label: 'ИИ агент для бизнеса', 
      section: 'ai-process', 
      routes: ['aiProcess', 'aiAgent'],
      description: 'Автоматизация 24/7'
    },
    { 
      icon: Users, 
      label: 'О студии', 
      section: 'about', 
      routes: ['about'],
      description: 'Наша команда'
    },
    { 
      icon: MessageCircle, 
      label: 'Заказать проект', 
      section: 'constructor', 
      routes: ['constructor', 'checkout'],
      description: 'Индивидуальное решение'
    },
  ];

  const isActive = (routes: string[]) => routes.includes(currentRoute);

  const handleNavClick = useCallback((section: string) => {
    setPressedItem(section);
    setTimeout(() => {
      onNavigate(section);
      setSidebarOpen(false);
      setPressedItem(null);
    }, 180);
  }, [onNavigate]);

  const socialLinks = [
    { 
      icon: SiInstagram, 
      label: 'Instagram', 
      url: 'https://instagram.com/web4tg',
      color: '#E4405F',
      hoverBg: 'rgba(228, 64, 95, 0.15)'
    },
    { 
      icon: SiTelegram, 
      label: 'Telegram канал', 
      url: 'https://t.me/web4_tg',
      color: '#26A5E4',
      hoverBg: 'rgba(38, 165, 228, 0.15)'
    },
    { 
      icon: Send, 
      label: 'Консультация', 
      url: 'https://t.me/web4tgs',
      color: '#A78BFA',
      hoverBg: 'rgba(167, 139, 250, 0.15)'
    },
  ];

  const isProfileActive = ['profile', 'referral', 'rewards', 'earning'].includes(currentRoute);
  const isProfilePressed = pressedItem === 'profile';
  const isProfileHovered = hoveredItem === 'profile';

  return (
    <>
      {/* SIDEBAR OVERLAY */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ 
          background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)'
        }}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* SIDEBAR PANEL - Glassmorphism */}
      <div 
        className={`fixed top-0 left-0 h-full z-[100] transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          width: '320px',
          background: 'rgba(12,12,14,0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          boxShadow: sidebarOpen ? '20px 0 80px rgba(0,0,0,0.6), inset 0 0 60px rgba(139,92,246,0.03)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Decorative gradient line at top */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.5) 50%, transparent 100%)'
        }} />

        {/* Sidebar Header with User */}
        <div style={{ 
          padding: '60px 24px 28px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div style={{
                position: 'relative'
              }}>
                <UserAvatar
                  photoUrl={user?.photo_url}
                  firstName={user?.first_name}
                  size="md"
                  className="ring-2 ring-white/10"
                />
                {/* Online indicator */}
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#22C55E',
                  border: '2px solid #0C0C0E'
                }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#FAFAFA'
                }}>
                  {user?.first_name || 'Гость'}
                </p>
                
                {/* Level Progress Bar */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.15) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.25)'
                      }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#A78BFA',
                          letterSpacing: '0.02em'
                        }}>
                          LVL 1
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        color: '#52525B'
                      }}>
                        Новичок
                      </span>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#71717A'
                    }}>
                      0/100 XP
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    overflow: 'hidden'
                  }}>
                    {/* Progress Fill */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '5%',
                      borderRadius: '4px',
                      background: 'linear-gradient(90deg, #8B5CF6 0%, #A78BFA 50%, #C4B5FD 100%)',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)',
                      transition: 'width 0.5s ease'
                    }} />
                    {/* Shimmer Effect */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                      animation: 'shimmer 2s infinite'
                    }} />
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
              aria-label="Закрыть меню"
              data-testid="button-close-sidebar"
            >
              <X size={18} color="#A1A1AA" />
            </button>
          </div>
          
          {/* Minimalist App Progress */}
          <div style={{ marginTop: '24px' }}>
            {/* Section Label */}
            <p style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: '#52525B',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}>
              Статус вашего проекта
            </p>
            
            {/* Progress Card */}
            <div style={{
              padding: '16px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              {/* Title Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FAFAFA',
                  letterSpacing: '-0.01em'
                }}>
                  Разработка приложения
                </span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#71717A'
                }}>
                  0%
                </span>
              </div>
              
              {/* Minimal Progress Bar */}
              <div style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.08)',
                marginBottom: '16px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: '2%',
                  borderRadius: '2px',
                  background: '#A78BFA',
                  transition: 'width 0.4s ease'
                }} />
              </div>
              
              {/* Stages Row */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                {[
                  { name: 'Бриф', num: 1, active: true },
                  { name: 'Дизайн', num: 2, active: false },
                  { name: 'Код', num: 3, active: false },
                  { name: 'Запуск', num: 4, active: false }
                ].map((stage) => (
                  <div key={stage.name} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {/* Number Circle */}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: stage.active 
                        ? 'rgba(167, 139, 250, 0.15)'
                        : 'rgba(255,255,255,0.04)',
                      border: stage.active 
                        ? '1.5px solid rgba(167, 139, 250, 0.4)'
                        : '1.5px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: stage.active ? '#A78BFA' : '#52525B'
                      }}>
                        {stage.num}
                      </span>
                    </div>
                    {/* Label */}
                    <span style={{
                      fontSize: '10px',
                      fontWeight: stage.active ? 600 : 500,
                      color: stage.active ? '#A1A1AA' : '#52525B',
                      textAlign: 'center'
                    }}>
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar Navigation */}
        <nav style={{ padding: '24px 16px', flex: 1 }}>
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#52525B',
            textTransform: 'uppercase',
            padding: '0 16px',
            marginBottom: '12px'
          }}>
            Навигация
          </p>
          
          {/* Nav Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const active = isActive(item.routes);
              const isPressed = pressedItem === item.section;
              const isHovered = hoveredItem === item.section;
              
              return (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section)}
                  onMouseEnter={() => setHoveredItem(item.section)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="w-full group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    background: isPressed 
                      ? 'rgba(139, 92, 246, 0.2)' 
                      : active 
                        ? 'rgba(255,255,255,0.06)' 
                        : isHovered
                          ? 'rgba(255,255,255,0.04)'
                          : 'transparent',
                    border: isPressed 
                      ? '1px solid rgba(139, 92, 246, 0.35)'
                      : active 
                        ? '1px solid rgba(255,255,255,0.08)' 
                        : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  data-testid={`button-nav-${item.section || 'home'}`}
                >
                  {/* Glow effect for active */}
                  {active && (
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '24px',
                      borderRadius: '0 4px 4px 0',
                      background: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)'
                    }} />
                  )}
                  
                  <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    background: isPressed 
                      ? 'rgba(139, 92, 246, 0.3)'
                      : active 
                        ? 'rgba(139, 92, 246, 0.15)' 
                        : 'rgba(255,255,255,0.04)',
                    border: active ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0
                  }}>
                    <item.icon 
                      size={20} 
                      color={isPressed || active ? '#A78BFA' : isHovered ? '#E4E4E7' : '#71717A'} 
                      style={{ transition: 'color 0.2s ease' }}
                    />
                  </div>
                  
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: isPressed || active ? 600 : 500,
                      color: isPressed || active ? '#FAFAFA' : isHovered ? '#E4E4E7' : '#A1A1AA',
                      transition: 'all 0.2s ease',
                      display: 'block'
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#52525B',
                      marginTop: '2px',
                      display: 'block',
                      opacity: active || isHovered ? 1 : 0.7,
                      transition: 'opacity 0.2s ease'
                    }}>
                      {item.description}
                    </span>
                  </div>
                  
                  <ChevronRight 
                    size={16} 
                    color={active ? '#A78BFA' : '#3F3F46'}
                    style={{
                      opacity: active || isHovered ? 1 : 0,
                      transform: isHovered && !active ? 'translateX(2px)' : 'translateX(0)',
                      transition: 'all 0.2s ease'
                    }}
                  />
                </button>
              );
            })}
          </div>
          
          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
            margin: '16px 0'
          }} />
          
          {/* Profile Button with Avatar */}
          <button
            onClick={() => handleNavClick('profile')}
            onMouseEnter={() => setHoveredItem('profile')}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-full group"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '14px',
              background: isProfilePressed
                ? 'rgba(139, 92, 246, 0.2)'
                : isProfileActive 
                  ? 'rgba(255,255,255,0.06)' 
                  : isProfileHovered
                    ? 'rgba(255,255,255,0.04)'
                    : 'transparent',
              border: isProfilePressed
                ? '1px solid rgba(139, 92, 246, 0.35)'
                : isProfileActive 
                  ? '1px solid rgba(255,255,255,0.08)' 
                  : '1px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isProfilePressed ? 'scale(0.98)' : 'scale(1)',
              position: 'relative'
            }}
            data-testid="button-nav-profile"
          >
            {/* Glow effect for active */}
            {isProfileActive && (
              <div style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '3px',
                height: '24px',
                borderRadius: '0 4px 4px 0',
                background: 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)',
                boxShadow: '0 0 12px rgba(139, 92, 246, 0.5)'
              }} />
            )}
            
            <div style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserAvatar
                photoUrl={user?.photo_url}
                firstName={user?.first_name}
                size="sm"
                className={isProfilePressed || isProfileActive ? 'ring-2 ring-violet-400/40' : ''}
              />
            </div>
            
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span style={{
                fontSize: '15px',
                fontWeight: isProfilePressed || isProfileActive ? 600 : 500,
                color: isProfilePressed || isProfileActive ? '#FAFAFA' : isProfileHovered ? '#E4E4E7' : '#A1A1AA',
                transition: 'all 0.2s ease',
                display: 'block'
              }}>
                Мой профиль
              </span>
              <span style={{
                fontSize: '11px',
                color: '#52525B',
                marginTop: '2px',
                display: 'block',
                opacity: isProfileActive || isProfileHovered ? 1 : 0.7,
                transition: 'opacity 0.2s ease'
              }}>
                Награды и достижения
              </span>
            </div>
            
            <ChevronRight 
              size={16} 
              color={isProfileActive ? '#A78BFA' : '#3F3F46'}
              style={{
                opacity: isProfileActive || isProfileHovered ? 1 : 0,
                transform: isProfileHovered && !isProfileActive ? 'translateX(2px)' : 'translateX(0)',
                transition: 'all 0.2s ease'
              }}
            />
          </button>
        </nav>
        
        {/* Quick Stats Card */}
        <div style={{
          margin: '0 16px 16px',
          padding: '20px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.06) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative gradient orb */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }} />
          
          <div style={{ position: 'relative' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: '#A78BFA',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              Декабрь 2025
            </p>
            <p style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FAFAFA',
              letterSpacing: '-0.03em',
              lineHeight: 1
            }}>
              3 слота
            </p>
            <p style={{
              fontSize: '13px',
              color: '#71717A',
              marginTop: '6px'
            }}>
              осталось на этот месяц
            </p>
          </div>
        </div>
        
        {/* Boost with AI Card - Like in reference */}
        <div style={{ 
          padding: '16px 20px',
          marginTop: 'auto'
        }}>
          <div style={{
            padding: '20px',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px'
            }}>
              <Sparkles size={18} color="#A78BFA" />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#FAFAFA'
              }}>
                Boost with <span style={{ color: '#A78BFA' }}>AI</span>
              </span>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#71717A',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              ИИ-ассистент для бизнеса: ответы 24/7, рост продаж на 300%
            </p>
            
            {/* Glow Button */}
            <button
              onClick={() => handleNavClick('ai-process')}
              style={{
                position: 'relative',
                width: '100%',
                padding: '14px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'visible'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1)';
              }}
              data-testid="button-upgrade-pro"
            >
              {/* Glow effect underneath */}
              <div style={{
                position: 'absolute',
                bottom: '-8px',
                left: '20%',
                right: '20%',
                height: '20px',
                background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
                filter: 'blur(12px)',
                pointerEvents: 'none'
              }} />
              <span style={{
                position: 'relative',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                letterSpacing: '0.02em'
              }}>
                Узнать больше
              </span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer with Social Links */}
        <div style={{
          padding: '20px 24px 28px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)'
        }}>
          {/* Social Links Label */}
          <p style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: '#52525B',
            textTransform: 'uppercase',
            marginBottom: '12px'
          }}>
            Связаться с нами
          </p>
          
          {/* Social Links */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label={social.label}
                data-testid={`link-social-${social.label.toLowerCase().replace(' ', '-')}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = social.hoverBg;
                  e.currentTarget.style.borderColor = `${social.color}40`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 24px ${social.color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <social.icon size={22} color={social.color} />
              </a>
            ))}
          </div>
          
          {/* Copyright */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#71717A'
              }}>
                Web4TG Studio
              </p>
              <p style={{
                fontSize: '11px',
                color: '#3F3F46',
                marginTop: '2px'
              }}>
                2025
              </p>
            </div>
            <div style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#22C55E',
                letterSpacing: '0.02em'
              }}>
                ONLINE
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TOP BAR WITH MENU BUTTON - Glassmorphism Style */}
      <div 
        className="fixed top-0 left-0 right-0 z-[90]"
        style={{
          background: 'rgba(15,15,20,0.65)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)',
          boxShadow: '0 4px 30px rgba(0,0,0,0.3)'
        }}
      >
        <div className="max-w-md mx-auto px-5 py-6 flex items-center justify-between">
          {/* Glass Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="glass-menu-btn"
            style={{
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.25), inset 0 1px 0 rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            aria-label="Открыть меню"
            data-testid="button-open-sidebar"
          >
            <Menu size={20} color="#FAFAFA" />
          </button>
          
          {/* Logo */}
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: '#FAFAFA',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            textShadow: '0 0 20px rgba(255,255,255,0.1)'
          }}>
            WEB4TG STUDIO
          </p>
          
          {/* Empty space for balance */}
          <div style={{ width: '44px' }} />
        </div>
      </div>
    </>
  );
}
```


---

## Структура каждого демо-приложения

Все демо используют единую структуру:
- **Props**: `{ activeTab: 'home' | 'catalog' | 'cart' | 'profile' }`
- **State**: products, cart, favorites, filters, orders
- **Tabs**: renderHomeTab(), renderCatalogTab(), renderCartTab(), renderProfileTab()
- **Theme**: Черный фон (#0A0A0A), glassmorphism эффекты

## Общие паттерны кода
1. Фильтрация товаров по категориям
2. Добавление в корзину/избранное
3. Модальные окна товаров
4. Оформление заказов
5. Поиск по товарам

