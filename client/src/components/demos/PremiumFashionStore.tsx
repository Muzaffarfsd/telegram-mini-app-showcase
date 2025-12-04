import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { Skeleton } from "../ui/skeleton";
import { useFilter } from "@/hooks/useFilter";
import blackHoodieImage from "@assets/c63bf9171394787.646e06bedc2c7_1761732722277.jpg";
import colorfulHoodieImage from "@assets/fb10cc201496475.6675676d24955_1761732737648.jpg";

// Video served from public/videos/ to reduce Docker image size  
const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";

interface PremiumFashionStoreProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  color: string;
}

interface Order {
  id: number;
  items: CartItem[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  description: string;
  sizes: string[];
  colors: string[];
  colorHex: string[];
  category: string;
  gender: 'Men' | 'Woman' | 'Children';
  inStock: number;
  rating: number;
  brand: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'Carbon Collection Hoodie', 
    price: 12900, 
    oldPrice: 15900,
    image: blackHoodieImage, 
    hoverImage: blackHoodieImage,
    description: 'Премиальный черный худи Carbon Collection с минималистичным дизайном', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Графит'], 
    colorHex: ['#1A1A1A', '#2D2D2D'],
    category: 'Худи', 
    gender: 'Men',
    inStock: 15, 
    rating: 5.0, 
    brand: 'CARBON',
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: 'Colorblock Hoodie', 
    price: 13900, 
    oldPrice: 17900,
    image: colorfulHoodieImage, 
    hoverImage: colorfulHoodieImage,
    description: 'Яркий разноцветный худи с уникальной комбинацией цветов', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Мульти', 'Фиолетовый'], 
    colorHex: ['#9B59B6', '#7E57C2'],
    category: 'Худи', 
    gender: 'Men',
    inStock: 8, 
    rating: 4.9, 
    brand: 'URBAN',
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'Olive Puffer', 
    price: 52900, 
    oldPrice: 67000,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1200&fit=crop&q=90',
    description: 'Роскошный пуховик оливкового цвета премиум класса', 
    sizes: ['XS', 'S', 'M', 'L'], 
    colors: ['Оливковый', 'Черный', 'Бежевый'], 
    colorHex: ['#9CAF88', '#1A1A1A', '#D4A574'],
    category: 'Куртки', 
    gender: 'Men',
    inStock: 5, 
    rating: 5.0, 
    brand: 'PUFF',
    isNew: true,
    isTrending: true
  },
  { 
    id: 4, 
    name: 'Orange Oversized', 
    price: 25500, 
    oldPrice: 35000,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1200&fit=crop&q=90',
    description: 'Яркий оверсайз пуховик для стильного образа', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Оранжевый', 'Желтый'], 
    colorHex: ['#F97316', '#EAB308'],
    category: 'Куртки', 
    gender: 'Woman',
    inStock: 8, 
    rating: 4.9, 
    brand: 'PUFF',
    isNew: true,
    isTrending: true
  },
  { 
    id: 5, 
    name: 'Pink Classic', 
    price: 35000, 
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=1200&fit=crop&q=90',
    description: 'Элегантный розовый пуховик с капюшоном', 
    sizes: ['XS', 'S', 'M', 'L'], 
    colors: ['Розовый', 'Фиолетовый'], 
    colorHex: ['#EC4899', '#A855F7'],
    category: 'Куртки', 
    gender: 'Woman',
    inStock: 10, 
    rating: 5.0, 
    brand: 'PUFF',
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Blue Winter', 
    price: 43000, 
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1200&fit=crop&q=90',
    description: 'Зимняя куртка с утеплителем премиум класса', 
    sizes: ['S', 'M', 'L'], 
    colors: ['Синий', 'Черный'], 
    colorHex: ['#3B82F6', '#1A1A1A'],
    category: 'Куртки', 
    gender: 'Children',
    inStock: 6, 
    rating: 4.8, 
    brand: 'PUFF' 
  },
  { 
    id: 7, 
    name: 'Black Bomber', 
    price: 31000, 
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1200&fit=crop&q=90',
    description: 'Классический черный бомбер на любой случай', 
    sizes: ['XS', 'S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Серый'], 
    colorHex: ['#1A1A1A', '#6B7280'],
    category: 'Куртки', 
    gender: 'Men',
    inStock: 12, 
    rating: 4.9, 
    brand: 'PUFF',
    isNew: true
  },
  { 
    id: 8, 
    name: 'Beige Trench', 
    price: 57000, 
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1200&fit=crop&q=90',
    description: 'Элегантный тренч бежевого цвета', 
    sizes: ['S', 'M', 'L'], 
    colors: ['Бежевый', 'Кэмел'], 
    colorHex: ['#D4A574', '#C19A6B'],
    category: 'Пальто', 
    gender: 'Woman',
    inStock: 4, 
    rating: 5.0, 
    brand: 'PUFF' 
  },
];

const categories = ['Все', 'Худи', 'Куртки', 'Пальто'];
const genderFilters = ['All', 'Men', 'Woman', 'Children'];

function PremiumFashionStore({ activeTab }: PremiumFashionStoreProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: products,
    searchFields: ['name', 'description', 'category', 'brand'] as (keyof Product)[],
  });

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
    if (activeTab !== 'home') {
      setSelectedGender('All');
    }
  }, [activeTab]);

  const filteredProducts = filteredItems.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    
    if (activeTab === 'home') {
      const genderMatch = selectedGender === 'All' || p.gender === selectedGender;
      return categoryMatch && genderMatch;
    }
    
    return categoryMatch;
  });

  const handleImageLoad = (productId: number) => {
    setLoadedImages(prev => new Set(prev).add(productId));
  };

  const toggleFavorite = (productId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const cartItem: CartItem = {
      id: Date.now(),
      name: selectedProduct.name,
      price: selectedProduct.price,
      size: selectedSize,
      quantity: 1,
      image: selectedProduct.image,
      color: selectedColor
    };
    
    setCart([...cart, cartItem]);
    setSelectedProduct(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total: total,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
    setShowCheckoutSuccess(true);
    setTimeout(() => setShowCheckoutSuccess(false), 3000);
  };

  // PRODUCT PAGE
  if (activeTab === 'catalog' && selectedProduct) {
    const bgColor = selectedProduct.colorHex[selectedProduct.colors.indexOf(selectedColor)] || '#1A1A1A';
    
    return (
      <div className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page" data-scroll="demo-premium-fashion" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            data-testid={`button-favorite-${selectedProduct.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedProduct.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh]">
          <img
            src={selectedProduct.hoverImage}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold">{formatPrice(selectedProduct.price)}</p>
              {selectedProduct.oldPrice && (
                <p className="text-xl text-white/50 line-through">{formatPrice(selectedProduct.oldPrice)}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-white/80 text-center">{selectedProduct.description}</p>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите цвет:</p>
            <div className="flex items-center justify-center gap-3">
              {selectedProduct.colors.map((color, idx) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-white scale-110'
                      : 'border-white/30'
                  }`}
                  style={{ backgroundColor: selectedProduct.colorHex[idx] }}
                  data-testid={`button-color-${color}`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите размер:</p>
            <div className="flex items-center justify-center gap-3">
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all ${
                    selectedSize === size
                      ? 'bg-[#CDFF38] text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
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
            description={`${selectedProduct.name} • ${selectedColor} • ${selectedSize}`}
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page" data-scroll="demo-premium-fashion">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button aria-label="Меню" data-testid="button-view-menu">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <button aria-label="Корзина" data-testid="button-view-cart">
                <ShoppingBag className="w-6 h-6" />
              </button>
              <button aria-label="Избранное" data-testid="button-view-favorites">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-4xl font-black mb-1 tracking-tight">
              REAL TIME<br/>
              SHOPPING
            </h1>
          </div>

          {/* Gender Filters */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              className="p-2 bg-white rounded-full"
              aria-label="Главная"
              data-testid="button-view-home"
            >
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </button>
            {genderFilters.map((gender, idx) => (
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

          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-full px-4 py-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        {/* Video Hero Banner */}
        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden" style={{ height: '500px' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-hero-banner"
          >
            <source src={fashionVideo} type="video/mp4" />
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
                НОВАЯ<br/>
                КОЛЛЕКЦИЯ
              </h2>
              <p className="text-lg text-white/80 mb-6" style={{ letterSpacing: '0.1em' }}>
                Эксклюзивные модели 2025
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105"
                style={{
                  background: '#CDFF38',
                  boxShadow: '0 0 30px rgba(205, 255, 56, 0.4)'
                }}
                data-testid="button-view-collection"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        {/* Featured Product Cards */}
        <div className="px-6 space-y-4">
          {filteredProducts.slice(0, 3).map((product, idx) => (
            <m.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openProduct(product)}
              className="relative cursor-pointer group rounded-3xl overflow-hidden"
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`featured-product-${product.id}`}
            >
              {/* Background Image with Skeleton */}
              <div className="absolute inset-0">
                {!loadedImages.has(product.id) && (
                  <Skeleton className="w-full h-full absolute inset-0" />
                )}
                <img
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!loadedImages.has(product.id) ? 'opacity-0' : 'opacity-100'}`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(product.id)}
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              {/* Badge */}
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full">
                  <span className="text-xs font-semibold text-white">
                    {product.isNew ? 'New' : product.category}
                  </span>
                </div>
              </div>

              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                aria-label="Избранное"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
                data-testid={`button-favorite-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {product.name.split(' ').slice(0, 2).join(' ')}<br/>
                      {product.name.split(' ').slice(2).join(' ')}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">{product.gender}'s wear</p>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(product);
                    }}
                    aria-label="Добавить в корзину"
                    className="w-14 h-14 rounded-full bg-[#CDFF38] flex items-center justify-center hover:bg-[#B8E633] transition-all hover:scale-110"
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                {/* Price */}
                <div className="mt-3">
                  <p className="text-lg font-bold">{formatPrice(product.price)}</p>
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page" data-scroll="demo-premium-fashion">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-2xl font-bold">Каталог</h1>
            <div className="flex items-center gap-3">
              <button className="p-2" aria-label="Поиск" data-testid="button-view-search">
                <Search className="w-6 h-6" />
              </button>
              <button className="p-2" aria-label="Фильтр" data-testid="button-view-filter">
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
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, idx) => (
              <m.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className={`relative cursor-pointer scroll-fade-in-delay-${Math.min((idx % 4) + 2, 5)}`}
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-white/5">
                  {!loadedImages.has(product.id) && (
                    <Skeleton className="w-full h-full absolute inset-0" />
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-opacity ${!loadedImages.has(product.id) ? 'opacity-0' : 'opacity-100'}`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(product.id)}
                  />
                  
                  {/* Favorite */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    aria-label="Избранное"
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
                    data-testid={`button-favorite-catalog-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {/* Badge */}
                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#CDFF38] text-black text-xs font-bold rounded-full">
                      NEW
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <p className="text-sm font-semibold mb-1 truncate">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold">{formatPrice(product.price)}</p>
                    {product.oldPrice && (
                      <p className="text-xs text-white/40 line-through">{formatPrice(product.oldPrice)}</p>
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-32 smooth-scroll-page" data-scroll="demo-premium-fashion">
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
                      {item.color} • {item.size}
                    </p>
                    <p className="text-lg font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                    aria-label="Удалить"
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
                  <span className="text-2xl font-bold">{formatPrice(total)}</span>
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
                  description={`${cart.length} товаров на сумму ${formatPrice(total)}`}
                  confirmText="Оформить"
                  cancelText="Отмена"
                  variant="default"
                  onConfirm={handleCheckout}
                />
              </div>
              {showCheckoutSuccess && (
                <div className="fixed top-20 left-4 right-4 bg-[#CDFF38] text-black p-4 rounded-2xl text-center font-bold z-50 animate-pulse">
                  Заказ успешно оформлен!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // PROFILE PAGE
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page" data-scroll="demo-premium-fashion">
        <div className="p-6 bg-card/80 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#CDFF38] to-[#B8E633] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Александр Петров</h2>
              <p className="text-sm text-muted-foreground">+7 (999) 123-45-67</p>
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
                  <div key={order.id} className="bg-white/10 rounded-xl p-4" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/70">Заказ #{order.id.toString().slice(-6)}</span>
                      <span className="text-sm text-white/70">{order.date}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/80">{order.items.length} товаров</span>
                      <span className="font-bold">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-[#CDFF38]/20 text-[#CDFF38] rounded-full">
                        {order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-orders">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-white/70" />
              <span className="font-medium">История заказов</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-favorites">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white/70" />
              <span className="font-medium">Избранное</span>
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

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-address">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-white/70" />
              <span className="font-medium">Адреса доставки</span>
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

export default memo(PremiumFashionStore);
