import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Shield, Target } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import img1 from '@assets/stock_images/futuristic_fashion_m_331bf630.jpg';
import img2 from '@assets/stock_images/futuristic_fashion_m_b5d87157.jpg';
import img3 from '@assets/stock_images/futuristic_fashion_m_472b5d38.jpg';
import img4 from '@assets/stock_images/futuristic_fashion_m_655a9d67.jpg';
import img5 from '@assets/stock_images/futuristic_fashion_m_4950c20e.jpg';

interface LabSurvivalistProps {
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
  gender: 'Мужское' | 'Женское' | 'Унисекс';
  inStock: number;
  rating: number;
  brand: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'Field Vest', 
    price: 24900, 
    oldPrice: 32000,
    image: img1, 
    hoverImage: img1,
    description: 'Тактический жилет с множеством карманов для выживания в любых условиях', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Серый', 'Белый'], 
    colorHex: ['#000000', '#6B7280', '#FFFFFF'],
    category: 'Верхняя одежда', 
    gender: 'Унисекс',
    inStock: 12, 
    rating: 5.0, 
    brand: 'LAB',
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: 'Tactical Jacket', 
    price: 45900, 
    oldPrice: 58000,
    image: img2, 
    hoverImage: img2,
    description: 'Премиальная тактическая куртка с усиленными швами и водоотталкивающим покрытием', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Графит'], 
    colorHex: ['#000000', '#374151'],
    category: 'Верхняя одежда', 
    gender: 'Мужское',
    inStock: 8, 
    rating: 5.0, 
    brand: 'LAB',
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'Cargo Pants', 
    price: 18500, 
    oldPrice: 25000,
    image: img3, 
    hoverImage: img3,
    description: 'Функциональные брюки карго с усиленными коленями', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Серый'], 
    colorHex: ['#000000', '#6B7280'],
    category: 'Брюки', 
    gender: 'Унисекс',
    inStock: 15, 
    rating: 4.9, 
    brand: 'LAB',
    isNew: true,
    isTrending: true
  },
  { 
    id: 4, 
    name: 'Combat Boots', 
    price: 32000, 
    oldPrice: 42000,
    image: img4, 
    hoverImage: img4,
    description: 'Тактические ботинки с композитным носком и противоскользящей подошвой', 
    sizes: ['39', '40', '41', '42', '43', '44'], 
    colors: ['Черный'], 
    colorHex: ['#000000'],
    category: 'Аксессуары', 
    gender: 'Унисекс',
    inStock: 10, 
    rating: 5.0, 
    brand: 'LAB',
    isTrending: true
  },
  { 
    id: 5, 
    name: 'Utility Backpack', 
    price: 15900, 
    oldPrice: 21000,
    image: img5, 
    hoverImage: img5,
    description: 'Рюкзак повышенной вместимости с модульной системой MOLLE', 
    sizes: ['ONE SIZE'], 
    colors: ['Черный', 'Серый', 'Белый'], 
    colorHex: ['#000000', '#6B7280', '#FFFFFF'],
    category: 'Аксессуары', 
    gender: 'Унисекс',
    inStock: 20, 
    rating: 4.8, 
    brand: 'LAB',
    isNew: true,
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Tech Gloves', 
    price: 8900, 
    image: img1, 
    hoverImage: img1,
    description: 'Тактические перчатки с сенсорными пальцами и усиленной защитой', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Серый'], 
    colorHex: ['#000000', '#6B7280'],
    category: 'Аксессуары', 
    gender: 'Унисекс',
    inStock: 25, 
    rating: 4.7, 
    brand: 'LAB',
    isNew: true
  },
  { 
    id: 7, 
    name: 'Tactical Belt', 
    price: 6900, 
    image: img2, 
    hoverImage: img2,
    description: 'Усиленный тактический ремень с быстрой застежкой', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный'], 
    colorHex: ['#000000'],
    category: 'Аксессуары', 
    gender: 'Унисекс',
    inStock: 18, 
    rating: 4.9, 
    brand: 'LAB'
  },
  { 
    id: 8, 
    name: 'Survival Jacket', 
    price: 52000, 
    oldPrice: 65000,
    image: img3, 
    hoverImage: img3,
    description: 'Куртка для экстремальных условий с встроенными отражателями', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Графит', 'Белый'], 
    colorHex: ['#000000', '#374151', '#FFFFFF'],
    category: 'Верхняя одежда', 
    gender: 'Мужское',
    inStock: 6, 
    rating: 5.0, 
    brand: 'LAB',
    isTrending: true
  },
  { 
    id: 9, 
    name: 'Reinforced Pants', 
    price: 22000, 
    image: img4, 
    hoverImage: img4,
    description: 'Усиленные брюки с защитными вставками', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Серый'], 
    colorHex: ['#000000', '#6B7280'],
    category: 'Брюки', 
    gender: 'Унисекс',
    inStock: 14, 
    rating: 4.8, 
    brand: 'LAB'
  },
  { 
    id: 10, 
    name: 'Base Layer Set', 
    price: 12500, 
    image: img5, 
    hoverImage: img5,
    description: 'Комплект термобелья для базового слоя', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Серый', 'Белый'], 
    colorHex: ['#000000', '#6B7280', '#FFFFFF'],
    category: 'Верхняя одежда', 
    gender: 'Унисекс',
    inStock: 22, 
    rating: 4.6, 
    brand: 'LAB',
    isNew: true
  },
];

const categories = ['Все', 'Верхняя одежда', 'Брюки', 'Аксессуары'];
const genderFilters = ['All', 'Мужское', 'Женское', 'Унисекс'];

function LabSurvivalist({ activeTab }: LabSurvivalistProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
    if (activeTab !== 'home') {
      setSelectedGender('All');
    }
  }, [activeTab]);

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    
    if (activeTab === 'home') {
      const genderMatch = selectedGender === 'All' || p.gender === selectedGender;
      return categoryMatch && genderMatch;
    }
    
    return categoryMatch;
  });

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

  // PRODUCT DETAIL PAGE
  if (activeTab === 'catalog' && selectedProduct) {
    const bgColor = selectedProduct.colorHex[selectedProduct.colors.indexOf(selectedColor)] || '#000000';
    
    return (
      <div className="min-h-screen text-white overflow-auto" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
            data-testid="button-back-to-catalog"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
            data-testid="button-favorite-product"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="bg-gradient-to-b from-black/95 to-black backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32 -mt-20 relative z-10">
          <div className="text-center border-b border-white/10 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-3">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-mono tracking-wider">{selectedProduct.brand}</span>
            </div>
            <h2 className="text-3xl font-black mb-3 tracking-tight uppercase">{selectedProduct.name}</h2>
            <div className="flex items-center justify-center gap-3">
              <p className="text-4xl font-bold">{formatPrice(selectedProduct.price)}</p>
              {selectedProduct.oldPrice && (
                <p className="text-xl text-white/30 line-through">{formatPrice(selectedProduct.oldPrice)}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-white/70 text-center leading-relaxed">{selectedProduct.description}</p>

          <div className="border-t border-white/10 pt-6">
            <p className="text-xs font-mono tracking-wider mb-4 text-white/60 uppercase">Выберите цвет:</p>
            <div className="flex items-center justify-center gap-3">
              {selectedProduct.colors.map((color, idx) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-white scale-110 shadow-lg shadow-white/20'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  style={{ backgroundColor: selectedProduct.colorHex[idx] }}
                  data-testid={`button-color-${color}`}
                >
                  {selectedColor === color && (
                    <div className="absolute inset-0 rounded-full bg-white/20"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <p className="text-xs font-mono tracking-wider mb-4 text-white/60 uppercase">Выберите размер:</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[60px] h-12 px-4 rounded-lg font-mono font-bold transition-all border ${
                    selectedSize === size
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white border-white/20 hover:border-white/40'
                  }`}
                  data-testid={`button-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addToCart}
            className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-white/90 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2"
            data-testid="button-buy-now"
          >
            <ShoppingBag className="w-5 h-5" />
            Добавить в корзину
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-black text-white overflow-auto pb-24">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <Menu className="w-6 h-6" data-testid="button-menu" />
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" data-testid="button-cart" />
              <Heart className="w-6 h-6" data-testid="button-favorites" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-6xl font-black mb-1 tracking-tighter leading-none">
              SURVIVALIST
            </h1>
            <h2 className="text-4xl font-light tracking-[0.3em] text-white/60">
              LAB
            </h2>
          </div>

          {/* Gender Filters */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              className="p-2 bg-white rounded-lg flex-shrink-0"
              data-testid="button-home"
            >
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </button>
            {genderFilters.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`text-sm font-mono uppercase tracking-wider transition-colors flex-shrink-0 ${
                  selectedGender === gender
                    ? 'text-white'
                    : 'text-white/30'
                }`}
                data-testid={`button-gender-${gender}`}
              >
                {gender}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-lg px-4 py-3 flex items-center gap-2 border border-white/10">
              <Search className="w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Поиск снаряжения..."
                className="bg-transparent text-white placeholder:text-white/40 outline-none flex-1 text-sm font-mono"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative mb-6 mx-6 rounded-2xl overflow-hidden border border-white/10" style={{ height: '500px' }}>
          <img
            src={img1}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-4 border border-white/20">
                <Target className="w-4 h-4" />
                <span className="text-xs font-mono tracking-wider">НОВИНКА</span>
              </div>
              <h2 className="text-5xl font-black mb-3 tracking-tighter leading-tight">
                TACTICAL<br/>
                COLLECTION
              </h2>
              <p className="text-base text-white/70 mb-6 font-mono tracking-wider">
                Выживание в стиле 2025
              </p>
              <button 
                className="px-8 py-4 rounded-lg font-bold text-black transition-all hover:scale-105 bg-white uppercase tracking-wider text-sm"
                data-testid="button-hero-shop-now"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        {/* Featured Products */}
        <div className="px-6 space-y-4">
          {filteredProducts.slice(0, 3).map((product, idx) => (
            <m.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openProduct(product)}
              className="relative cursor-pointer group rounded-2xl overflow-hidden border border-white/10"
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`featured-product-${product.id}`}
            >
              <div className="absolute inset-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale"
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20">
                  <span className="text-xs font-mono font-semibold text-white tracking-wider">
                    {product.isNew ? 'NEW' : product.category.toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20"
                data-testid={`button-favorite-home-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-2 leading-tight tracking-tight uppercase">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/60 mb-4 font-mono">{product.gender}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(product);
                    }}
                    className="w-14 h-14 rounded-lg bg-white flex items-center justify-center hover:bg-white/90 transition-all hover:scale-110"
                    data-testid={`button-buy-${product.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-xl font-bold">{formatPrice(product.price)}</p>
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
      <div className="min-h-screen bg-black text-white overflow-auto pb-24">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-black tracking-tight">КАТАЛОГ</h1>
            <div className="flex items-center gap-3">
              <button className="p-2" data-testid="button-search">
                <Search className="w-6 h-6" />
              </button>
              <button className="p-2" data-testid="button-filter">
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
                className={`px-5 py-2.5 rounded-lg text-sm font-mono font-semibold whitespace-nowrap transition-all border uppercase tracking-wider ${
                  selectedCategory === cat
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'
                }`}
                data-testid={`button-category-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <m.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className="relative cursor-pointer"
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-white/5 border border-white/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                    loading="lazy"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-xl flex items-center justify-center border border-white/20"
                    data-testid={`button-favorite-catalog-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-white text-black text-xs font-mono font-bold rounded-lg">
                      NEW
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold mb-1 truncate uppercase tracking-wide">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold">{formatPrice(product.price)}</p>
                    {product.oldPrice && (
                      <p className="text-xs text-white/30 line-through">{formatPrice(product.oldPrice)}</p>
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
      <div className="min-h-screen bg-black text-white overflow-auto pb-32">
        <div className="p-6">
          <h1 className="text-3xl font-black mb-6 tracking-tight">КОРЗИНА</h1>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <ShoppingBag className="w-10 h-10 text-white/20" />
              </div>
              <p className="text-white/40 text-center font-mono">Ваша корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/10"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover grayscale"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold mb-1 uppercase tracking-wide text-sm">{item.name}</h3>
                    <p className="text-sm text-white/50 mb-2 font-mono">
                      {item.color} • {item.size}
                    </p>
                    <p className="text-lg font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-black border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-mono uppercase tracking-wider">Итого:</span>
                  <span className="text-3xl font-bold">{formatPrice(total)}</span>
                </div>
                <button
                  className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-white/90 transition-all uppercase tracking-wider text-sm"
                  data-testid="button-checkout"
                >
                  Оформить заказ
                </button>
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
      <div className="min-h-screen bg-black text-white overflow-auto pb-24">
        <div className="p-6 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-400 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide">Иван Сидоров</h2>
              <p className="text-sm text-white/60 font-mono">+7 (999) 987-65-43</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
              <p className="text-sm text-white/60 mb-1 font-mono uppercase tracking-wider">Заказы</p>
              <p className="text-2xl font-bold">{cart.length}</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
              <p className="text-sm text-white/60 mb-1 font-mono uppercase tracking-wider">Избранное</p>
              <p className="text-2xl font-bold">{favorites.size}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-orders">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Мои заказы</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-favorites">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-payment">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-address">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-settings">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Настройки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 flex items-center justify-between hover:bg-red-500/20 transition-all mt-4" data-testid="button-logout">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="font-mono uppercase tracking-wider text-sm text-red-400">Выйти</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(LabSurvivalist);
