import { useState, useCallback, useMemo, memo } from "react";
import { m } from "framer-motion";
import { 
  Heart, ShoppingBag, ChevronLeft, ChevronRight, Star, Clock, 
  Sparkles, Menu, Search, User, Package, Minus, Plus, X,
  Crown, Leaf, Droplets, Sun
} from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";

interface EmilyCarterAIProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: 'Skincare' | 'Makeup' | 'Fragrance' | 'Haircare';
  description: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

const COLORS = {
  primary: '#0A0A0A',
  primaryGradient: 'linear-gradient(180deg, #0A0A0A 0%, #121214 100%)',
  accent1: '#D4A574',
  accent2: '#E8D5C4',
  textPrimary: '#FAFAF9',
  textSecondary: '#A1A1AA',
  cardBg: 'linear-gradient(160deg, #18181B 0%, #0F0F12 100%)',
  cardBorder: 'rgba(255, 255, 255, 0.06)',
  glowGold: '0 0 40px rgba(212, 165, 116, 0.3)',
};

const products: Product[] = [
  {
    id: 1,
    name: "Midnight Rose Serum",
    brand: "EMILY CARTER",
    price: 128,
    originalPrice: 168,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=1000&fit=crop&q=90",
    category: "Skincare",
    description: "Luxurious anti-aging serum with rose extract and retinol",
    rating: 4.9,
    reviews: 2847,
    isNew: true,
    isBestseller: true
  },
  {
    id: 2,
    name: "Velvet Glow Foundation",
    brand: "EMILY CARTER",
    price: 68,
    originalPrice: 85,
    image: "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&h=1000&fit=crop&q=90",
    category: "Makeup",
    description: "Buildable coverage with natural satin finish",
    rating: 4.8,
    reviews: 1923,
    isBestseller: true
  },
  {
    id: 3,
    name: "Hydra Cloud Cream",
    brand: "EMILY CARTER",
    price: 95,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=800&h=1000&fit=crop&q=90",
    category: "Skincare",
    description: "72-hour hydration with hyaluronic acid complex",
    rating: 4.7,
    reviews: 1456,
    isNew: true
  },
  {
    id: 4,
    name: "Golden Hour Palette",
    brand: "EMILY CARTER",
    price: 78,
    originalPrice: 98,
    image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&h=1000&fit=crop&q=90",
    category: "Makeup",
    description: "12 warm-toned eyeshadows for endless looks",
    rating: 4.9,
    reviews: 3241,
    isBestseller: true
  },
  {
    id: 5,
    name: "Essence de Lune",
    brand: "EMILY CARTER",
    price: 185,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop&q=90",
    category: "Fragrance",
    description: "Enchanting blend of jasmine, sandalwood and vanilla",
    rating: 4.8,
    reviews: 892,
    isNew: true
  },
  {
    id: 6,
    name: "Silk Repair Hair Mask",
    brand: "EMILY CARTER",
    price: 52,
    originalPrice: 65,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=1000&fit=crop&q=90",
    category: "Haircare",
    description: "Intensive treatment for damaged hair",
    rating: 4.6,
    reviews: 745
  },
  {
    id: 7,
    name: "Lip Velvet Collection",
    brand: "EMILY CARTER",
    price: 42,
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=1000&fit=crop&q=90",
    category: "Makeup",
    description: "Long-lasting matte lipstick set of 4 shades",
    rating: 4.7,
    reviews: 1834,
    isBestseller: true
  },
  {
    id: 8,
    name: "Crystal Eye Cream",
    brand: "EMILY CARTER",
    price: 88,
    originalPrice: 110,
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=1000&fit=crop&q=90",
    category: "Skincare",
    description: "De-puffing and brightening eye treatment",
    rating: 4.8,
    reviews: 1127,
    isNew: true
  }
];

const categories = ['All', 'Skincare', 'Makeup', 'Fragrance', 'Haircare'];

function EmilyCarterAI({ activeTab }: EmilyCarterAIProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set([1, 4]));
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
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

  const cartTotal = useMemo(() => 
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0), 
    [cart]
  );

  const filteredProducts = useMemo(() => 
    selectedCategory === 'All' 
      ? products 
      : products.filter(p => p.category === selectedCategory),
    [selectedCategory]
  );

  const formatPrice = (price: number) => `$${price}`;

  // ========================================
  // PRODUCT DETAIL VIEW
  // ========================================
  if (activeTab === 'catalog' && selectedProduct) {
    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24"
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="relative">
          <div className="relative h-[55vh]">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />
            
            <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe px-5 flex items-center justify-between">
              <m.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center"
                style={{ background: 'rgba(10, 10, 10, 0.6)', border: `1px solid ${COLORS.cardBorder}` }}
                data-testid="button-back-detail"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: COLORS.textPrimary }} />
              </m.button>
              <m.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => toggleFavorite(selectedProduct.id)}
                className="w-11 h-11 rounded-full backdrop-blur-xl flex items-center justify-center"
                style={{ background: 'rgba(10, 10, 10, 0.6)', border: `1px solid ${COLORS.cardBorder}` }}
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
                  className="px-4 py-2 rounded-full text-[11px] font-bold tracking-[0.1em] uppercase"
                  style={{ 
                    background: COLORS.accent1, 
                    color: '#0A0A0A',
                    boxShadow: COLORS.glowGold
                  }}
                >
                  NEW
                </span>
              </m.div>
            )}
          </div>

          <m.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative -mt-16 rounded-t-[32px] px-6 pt-8 pb-32"
            style={{ background: COLORS.primary }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-[14px] font-semibold" style={{ color: COLORS.textPrimary }}>
                  {selectedProduct.rating}
                </span>
              </div>
              <span className="text-[13px]" style={{ color: COLORS.textSecondary }}>
                ({selectedProduct.reviews.toLocaleString()} reviews)
              </span>
              {selectedProduct.isBestseller && (
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold ml-auto"
                  style={{ background: 'rgba(212, 165, 116, 0.15)', color: COLORS.accent1 }}
                >
                  BESTSELLER
                </span>
              )}
            </div>

            <p 
              className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-1"
              style={{ color: COLORS.accent1 }}
            >
              {selectedProduct.brand}
            </p>
            <h2 
              className="text-[24px] font-bold tracking-tight mb-2"
              style={{ color: COLORS.textPrimary, letterSpacing: '-0.02em' }}
            >
              {selectedProduct.name}
            </h2>

            <p 
              className="text-[14px] leading-relaxed mb-6"
              style={{ color: COLORS.textSecondary }}
            >
              {selectedProduct.description}
            </p>

            <div className="flex items-center gap-4 mb-6">
              {[
                { icon: Leaf, label: 'Vegan' },
                { icon: Droplets, label: 'Hydrating' },
                { icon: Sun, label: 'SPF 30' }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <feature.icon className="w-4 h-4" style={{ color: COLORS.accent1 }} />
                  <span className="text-[12px]" style={{ color: COLORS.textSecondary }}>
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between mb-8">
              <div>
                <p 
                  className="text-[32px] font-bold"
                  style={{ color: COLORS.textPrimary }}
                >
                  {formatPrice(selectedProduct.price)}
                </p>
                {selectedProduct.originalPrice && (
                  <p 
                    className="text-[16px] line-through"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {formatPrice(selectedProduct.originalPrice)}
                  </p>
                )}
              </div>
              <div 
                className="px-3 py-1.5 rounded-full text-[12px] font-medium"
                style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' }}
              >
                In Stock
              </div>
            </div>

            <ConfirmDrawer
              trigger={
                <button 
                  className="w-full py-4 rounded-full font-bold text-[15px] tracking-wide uppercase transition-all flex items-center justify-center gap-3"
                  style={{ 
                    background: COLORS.accent1,
                    boxShadow: COLORS.glowGold,
                    color: '#0A0A0A'
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

  // ========================================
  // HOME PAGE
  // ========================================
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
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.cardBorder}` }}
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
            </button>
            
            <div className="flex items-center gap-1">
              <Crown className="w-5 h-5" style={{ color: COLORS.accent1 }} />
              <span 
                className="text-[18px] font-bold tracking-wide"
                style={{ color: COLORS.textPrimary }}
              >
                EMILY CARTER
              </span>
            </div>

            <button 
              className="w-11 h-11 rounded-xl flex items-center justify-center relative"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.cardBorder}` }}
              data-testid="button-cart-home"
            >
              <ShoppingBag className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
              {cart.length > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: COLORS.accent1, color: '#0A0A0A' }}
                >
                  {cart.length}
                </span>
              )}
            </button>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-[28px] overflow-hidden mb-8"
            style={{ height: '220px' }}
          >
            <img
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop&q=90"
              alt="Beauty collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6">
              <span 
                className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-2"
                style={{ color: COLORS.accent1 }}
              >
                NEW COLLECTION
              </span>
              <h2 
                className="text-[28px] font-bold leading-tight mb-3"
                style={{ color: COLORS.textPrimary }}
              >
                Winter Glow<br/>Essentials
              </h2>
              <button 
                className="self-start px-5 py-2.5 rounded-full text-[13px] font-semibold"
                style={{ background: COLORS.accent1, color: '#0A0A0A' }}
                data-testid="button-shop-collection"
              >
                Shop Now
              </button>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3 py-4 mb-6 border-y"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {[
              { value: '50K+', label: 'Customers' },
              { value: '4.9', label: 'Rating' },
              { value: '100%', label: 'Natural' }
            ].map((stat, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-1 justify-center">
                <span 
                  className="text-[16px] font-bold"
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
              </div>
            ))}
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-[18px] font-bold"
                style={{ color: COLORS.textPrimary }}
              >
                Bestsellers
              </h3>
              <button 
                className="text-[13px] font-medium flex items-center gap-1"
                style={{ color: COLORS.accent1 }}
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
              {products.filter(p => p.isBestseller).map((product) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-shrink-0 w-[160px] cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div 
                    className="relative rounded-2xl overflow-hidden mb-3"
                    style={{ height: '200px' }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-xl flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.4)' }}
                    >
                      <Heart 
                        className="w-4 h-4"
                        style={{ 
                          color: favorites.has(product.id) ? COLORS.accent1 : '#fff',
                          fill: favorites.has(product.id) ? COLORS.accent1 : 'transparent'
                        }}
                      />
                    </button>
                  </div>
                  <p 
                    className="text-[13px] font-medium mb-1 truncate"
                    style={{ color: COLORS.textPrimary }}
                  >
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-[15px] font-bold"
                      style={{ color: COLORS.accent1 }}
                    >
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span 
                        className="text-[12px] line-through"
                        style={{ color: COLORS.textSecondary }}
                      >
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl p-5"
            style={{ 
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(212, 165, 116, 0.05) 100%)',
              border: '1px solid rgba(212, 165, 116, 0.2)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: COLORS.accent1 }} />
              <span 
                className="text-[11px] font-semibold tracking-[0.15em] uppercase"
                style={{ color: COLORS.accent1 }}
              >
                LOYALTY REWARDS
              </span>
            </div>
            <h4 
              className="text-[16px] font-bold mb-1"
              style={{ color: COLORS.textPrimary }}
            >
              Earn 3x points today
            </h4>
            <p 
              className="text-[13px]"
              style={{ color: COLORS.textSecondary }}
            >
              Shop now and unlock exclusive member rewards
            </p>
          </m.div>
        </div>
      </div>
    );
  }

  // ========================================
  // CATALOG PAGE
  // ========================================
  if (activeTab === 'catalog') {
    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24"
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="demo-nav-safe px-5">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 
              className="text-[24px] font-bold"
              style={{ color: COLORS.textPrimary }}
            >
              Shop
            </h1>
            <button 
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${COLORS.cardBorder}` }}
              data-testid="button-search"
            >
              <Search className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
            </button>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide mb-6"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all"
                style={{
                  background: selectedCategory === cat ? COLORS.accent1 : 'rgba(255,255,255,0.05)',
                  color: selectedCategory === cat ? '#0A0A0A' : COLORS.textSecondary,
                  border: `1px solid ${selectedCategory === cat ? COLORS.accent1 : COLORS.cardBorder}`
                }}
                data-testid={`button-category-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </m.div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, idx) => (
              <m.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div 
                  className="relative rounded-2xl overflow-hidden mb-3"
                  style={{ aspectRatio: '3/4' }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.4)' }}
                  >
                    <Heart 
                      className="w-4 h-4"
                      style={{ 
                        color: favorites.has(product.id) ? COLORS.accent1 : '#fff',
                        fill: favorites.has(product.id) ? COLORS.accent1 : 'transparent'
                      }}
                    />
                  </button>
                  {product.isNew && (
                    <div 
                      className="absolute top-3 left-3 px-2 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: COLORS.accent1, color: '#0A0A0A' }}
                    >
                      NEW
                    </div>
                  )}
                </div>
                <p 
                  className="text-[13px] font-medium mb-1 truncate"
                  style={{ color: COLORS.textPrimary }}
                >
                  {product.name}
                </p>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[11px]" style={{ color: COLORS.textSecondary }}>
                    {product.rating}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[15px] font-bold"
                    style={{ color: COLORS.accent1 }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span 
                      className="text-[12px] line-through"
                      style={{ color: COLORS.textSecondary }}
                    >
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // CART PAGE
  // ========================================
  if (activeTab === 'cart') {
    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24"
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="demo-nav-safe px-5">
          <h1 
            className="text-[24px] font-bold mb-6"
            style={{ color: COLORS.textPrimary }}
          >
            Shopping Bag
          </h1>

          {cart.length > 0 ? (
            <>
              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 p-4 rounded-2xl"
                    style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}` }}
                  >
                    <div className="w-[80px] h-[100px] rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p 
                            className="text-[14px] font-medium truncate"
                            style={{ color: COLORS.textPrimary }}
                          >
                            {item.name}
                          </p>
                          <p 
                            className="text-[12px]"
                            style={{ color: COLORS.textSecondary }}
                          >
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                          <X className="w-4 h-4" style={{ color: COLORS.textSecondary }} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center gap-3 px-2 py-1 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.05)' }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            data-testid={`button-minus-${item.id}`}
                          >
                            <Minus className="w-3 h-3" style={{ color: COLORS.textSecondary }} />
                          </button>
                          <span 
                            className="text-[13px] font-medium min-w-[20px] text-center"
                            style={{ color: COLORS.textPrimary }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            data-testid={`button-plus-${item.id}`}
                          >
                            <Plus className="w-3 h-3" style={{ color: COLORS.textSecondary }} />
                          </button>
                        </div>
                        <span 
                          className="text-[16px] font-bold"
                          style={{ color: COLORS.accent1 }}
                        >
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </m.div>
                ))}
              </div>

              <div 
                className="rounded-2xl p-5 mb-6"
                style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span style={{ color: COLORS.textSecondary }}>Subtotal</span>
                  <span style={{ color: COLORS.textPrimary }}>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span style={{ color: COLORS.textSecondary }}>Shipping</span>
                  <span style={{ color: '#22C55E' }}>Free</span>
                </div>
                <div 
                  className="h-px my-4"
                  style={{ background: COLORS.cardBorder }}
                />
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[16px] font-bold"
                    style={{ color: COLORS.textPrimary }}
                  >
                    Total
                  </span>
                  <span 
                    className="text-[20px] font-bold"
                    style={{ color: COLORS.accent1 }}
                  >
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              <button 
                className="w-full py-4 rounded-full font-bold text-[15px] uppercase"
                style={{ 
                  background: COLORS.accent1, 
                  color: '#0A0A0A',
                  boxShadow: COLORS.glowGold
                }}
                data-testid="button-checkout"
              >
                Checkout
              </button>
            </>
          ) : (
            <div className="text-center py-20">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <ShoppingBag className="w-8 h-8" style={{ color: COLORS.textSecondary }} />
              </div>
              <p 
                className="font-medium text-[16px] mb-2"
                style={{ color: COLORS.textPrimary }}
              >
                Your bag is empty
              </p>
              <p 
                className="text-[13px]"
                style={{ color: COLORS.textSecondary }}
              >
                Start shopping to add items
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================
  // PROFILE PAGE
  // ========================================
  if (activeTab === 'profile') {
    return (
      <div 
        className="min-h-screen text-white overflow-auto pb-24"
        style={{ background: COLORS.primaryGradient }}
      >
        <div className="demo-nav-safe px-5">
          <div className="text-center mb-8">
            <div 
              className="w-[88px] h-[88px] rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.3) 0%, rgba(212, 165, 116, 0.1) 100%)',
                border: '2px solid rgba(212, 165, 116, 0.3)'
              }}
            >
              <User className="w-10 h-10" style={{ color: COLORS.accent1 }} />
            </div>
            <h2 
              className="text-[22px] font-bold mb-1"
              style={{ color: COLORS.textPrimary }}
            >
              Welcome
            </h2>
            <p 
              className="text-[13px]"
              style={{ color: COLORS.textSecondary }}
            >
              Sign in to access your account
            </p>
          </div>

          <div 
            className="rounded-2xl p-5 mb-6"
            style={{ 
              background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(212, 165, 116, 0.05) 100%)',
              border: '1px solid rgba(212, 165, 116, 0.2)'
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <Crown className="w-5 h-5" style={{ color: COLORS.accent1 }} />
              <span 
                className="text-[15px] font-semibold"
                style={{ color: COLORS.textPrimary }}
              >
                Join Beauty Rewards
              </span>
            </div>
            <p 
              className="text-[13px] mb-4"
              style={{ color: COLORS.textSecondary }}
            >
              Earn points on every purchase and unlock exclusive perks
            </p>
            <button 
              className="w-full py-3 rounded-full text-[14px] font-semibold"
              style={{ background: COLORS.accent1, color: '#0A0A0A' }}
              data-testid="button-join-rewards"
            >
              Join Now
            </button>
          </div>

          <div className="space-y-3">
            {[
              { icon: Heart, label: 'Wishlist', value: `${favorites.size} items` },
              { icon: Package, label: 'Orders', value: '0 orders' },
              { icon: Star, label: 'Reviews', value: '0 reviews' },
              { icon: Clock, label: 'Recently Viewed', value: '' }
            ].map((item, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}` }}
              >
                <div 
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <item.icon className="w-5 h-5" style={{ color: COLORS.accent1 }} />
                </div>
                <span 
                  className="font-medium text-[15px] flex-1 text-left"
                  style={{ color: COLORS.textPrimary }}
                >
                  {item.label}
                </span>
                {item.value && (
                  <span 
                    className="text-[13px]"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {item.value}
                  </span>
                )}
                <ChevronRight className="w-5 h-5" style={{ color: COLORS.textSecondary }} />
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
