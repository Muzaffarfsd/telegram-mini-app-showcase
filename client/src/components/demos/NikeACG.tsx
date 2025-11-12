import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Search, Menu, ChevronUp, ChevronDown } from "lucide-react";

import img1 from '@assets/stock_images/futuristic_fashion_m_4203db1e.jpg';
import img2 from '@assets/stock_images/futuristic_techwear__737df842.jpg';
import img3 from '@assets/stock_images/futuristic_fashion_m_331bf630.jpg';
import img4 from '@assets/stock_images/futuristic_techwear__046f6538.jpg';
import img5 from '@assets/stock_images/futuristic_fashion_m_472b5d38.jpg';
import img6 from '@assets/stock_images/futuristic_techwear__832ae961.jpg';
import img7 from '@assets/stock_images/futuristic_fashion_m_4950c20e.jpg';
import img8 from '@assets/stock_images/futuristic_techwear__95b77175.jpg';
import img9 from '@assets/stock_images/futuristic_fashion_m_518587e3.jpg';
import img10 from '@assets/stock_images/futuristic_techwear__a1b10a04.jpg';

interface NikeACGProps {
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
  inStock: number;
  rating: number;
  isNew?: boolean;
  isTrending?: boolean;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'ACG Trail Pants', 
    price: 19900,
    image: img1, 
    hoverImage: img2,
    description: 'Технологичные брюки для горных троп. Водонепроницаемая ткань, множество карманов.', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Оливковый'], 
    colorHex: ['#1A1A1A', '#4A5D23'],
    category: 'Верхняя одежда',
    inStock: 15, 
    rating: 5.0,
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: '075 Jacket', 
    price: 37900,
    oldPrice: 45900,
    image: img3, 
    hoverImage: img4,
    description: 'Премиальная куртка ACG с мембраной Gore-Tex. Защита от экстремальных условий.', 
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], 
    colors: ['Черный', 'Синий'], 
    colorHex: ['#1A1A1A', '#1E3A5F'],
    category: 'Верхняя одежда',
    inStock: 8, 
    rating: 5.0,
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'ACG Full System', 
    price: 79900,
    oldPrice: 95000,
    image: img5, 
    hoverImage: img6,
    description: 'Полная экипировка для outdoor приключений. Куртка + штаны + жилет в одном комплекте.', 
    sizes: ['M', 'L', 'XL'], 
    colors: ['Черный', 'Камуфляж'], 
    colorHex: ['#1A1A1A', '#3D4F35'],
    category: 'Верхняя одежда',
    inStock: 5, 
    rating: 5.0,
    isNew: true,
    isTrending: true
  },
  { 
    id: 4, 
    name: '005 Gloves', 
    price: 12900,
    image: img7, 
    hoverImage: img8,
    description: 'Утепленные перчатки с touch-screen совместимостью для экстремальных условий.', 
    sizes: ['S', 'M', 'L'], 
    colors: ['Черный', 'Серый'], 
    colorHex: ['#1A1A1A', '#4A4A4A'],
    category: 'Аксессуары',
    inStock: 20, 
    rating: 4.9,
    isNew: true
  },
  { 
    id: 5, 
    name: 'Terrain Shoes', 
    price: 24900,
    oldPrice: 29900,
    image: img9, 
    hoverImage: img10,
    description: 'Треккинговые кроссовки ACG с технологией React foam и противоскользящей подошвой.', 
    sizes: ['40', '41', '42', '43', '44', '45'], 
    colors: ['Черный', 'Коричневый'], 
    colorHex: ['#1A1A1A', '#5C4033'],
    category: 'Обувь',
    inStock: 12, 
    rating: 5.0,
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Mountain Vest', 
    price: 28900,
    image: img1, 
    hoverImage: img2,
    description: 'Легкий утепленный жилет с системой вентиляции для горных восхождений.', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Оранжевый', 'Черный'], 
    colorHex: ['#FF6B35', '#1A1A1A'],
    category: 'Верхняя одежда',
    inStock: 10, 
    rating: 4.8,
    isTrending: true
  },
  { 
    id: 7, 
    name: 'ACG Storm Jacket', 
    price: 42900,
    image: img3, 
    hoverImage: img4,
    description: 'Штормовая куртка с усиленной защитой от ветра и дождя.', 
    sizes: ['M', 'L', 'XL', 'XXL'], 
    colors: ['Серый', 'Зеленый'], 
    colorHex: ['#6B7280', '#2D5016'],
    category: 'Верхняя одежда',
    inStock: 7, 
    rating: 5.0,
    isNew: true
  },
  { 
    id: 8, 
    name: 'ACG Tech Pack', 
    price: 16900,
    image: img5, 
    hoverImage: img6,
    description: 'Компактный рюкзак с водонепроницаемым покрытием для urban exploration.', 
    sizes: ['ONE SIZE'], 
    colors: ['Черный', 'Хаки'], 
    colorHex: ['#1A1A1A', '#77815C'],
    category: 'Аксессуары',
    inStock: 15, 
    rating: 4.9
  },
  { 
    id: 9, 
    name: 'ACG Fleece Layer', 
    price: 21900,
    image: img7, 
    hoverImage: img8,
    description: 'Флисовый промежуточный слой для максимального комфорта в холодную погоду.', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Бордовый'], 
    colorHex: ['#1A1A1A', '#800020'],
    category: 'Верхняя одежда',
    inStock: 18, 
    rating: 4.8,
    isNew: true
  },
  { 
    id: 10, 
    name: 'ACG Cargo Shorts', 
    price: 14900,
    image: img9, 
    hoverImage: img10,
    description: 'Летние карго шорты с множеством карманов для летних походов.', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Хаки', 'Черный'], 
    colorHex: ['#77815C', '#1A1A1A'],
    category: 'Верхняя одежда',
    inStock: 14, 
    rating: 4.7
  },
];

const categories = ['Все', 'Верхняя одежда', 'Обувь', 'Аксессуары'];

function NikeACG({ activeTab }: NikeACGProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
  }, [activeTab]);

  const filteredProducts = products.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
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
    const bgColor = selectedProduct.colorHex[selectedProduct.colors.indexOf(selectedColor)] || '#2D3748';
    
    return (
      <div className="min-h-screen text-white overflow-auto" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
            data-testid="button-back-to-catalog"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="bg-[#2D3748] rounded-t-3xl p-6 space-y-6 pb-32 -mt-8 relative z-10">
          <div className="text-center">
            <div className="text-xs font-bold tracking-[0.2em] text-white/60 mb-2">NIKE ACG</div>
            <h2 className="text-3xl font-black mb-3 tracking-tight">{selectedProduct.name}</h2>
            <div className="flex items-center justify-center gap-4 mb-2">
              <p className="text-4xl font-black">{formatPrice(selectedProduct.price)}</p>
              {selectedProduct.oldPrice && (
                <p className="text-xl text-white/40 line-through">{formatPrice(selectedProduct.oldPrice)}</p>
              )}
            </div>
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-white/60 ml-2">({selectedProduct.rating})</span>
            </div>
          </div>

          <p className="text-sm text-white/80 text-center leading-relaxed">{selectedProduct.description}</p>

          <div>
            <p className="text-xs font-bold mb-3 text-white/70 text-center tracking-widest">ЦВЕТ:</p>
            <div className="flex items-center justify-center gap-3">
              {selectedProduct.colors.map((color, idx) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-white/30 hover:border-white/50'
                  }`}
                  style={{ backgroundColor: selectedProduct.colorHex[idx] }}
                  data-testid={`button-color-${color}`}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold mb-3 text-white/70 text-center tracking-widest">РАЗМЕР:</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
                    selectedSize === size
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
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
            className="w-full bg-white text-black font-black py-5 rounded-full hover:bg-white/90 transition-all text-lg tracking-wider shadow-xl"
            data-testid="button-buy-now"
          >
            ДОБАВИТЬ В КОРЗИНУ
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#2D3748] text-white overflow-auto pb-24">
        {/* Hero Section */}
        <div className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={img1}
              alt="ACG Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#2D3748]"></div>
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="text-xs font-bold tracking-[0.3em] mb-6 text-white/80">NIKE</div>
              <h1 className="text-[100px] md:text-[140px] font-black leading-none mb-6 tracking-tighter">
                ACG
              </h1>
              <p className="text-4xl md:text-5xl font-light tracking-[0.2em] mb-12 text-white/90">
                システム
              </p>
              <p className="text-lg text-white/70 mb-12 max-w-md mx-auto tracking-wide">
                All Conditions Gear для экстремальных приключений
              </p>
              <button className="px-10 py-5 bg-white text-black font-black rounded-full text-lg hover:bg-white/90 transition-all shadow-2xl tracking-wider">
                ИССЛЕДОВАТЬ
              </button>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/50" />
          </div>
        </div>

        {/* Featured Collections - Black/White Alternating Cards */}
        <div className="px-6 py-12 space-y-6">
          {[
            { 
              product: products[0], 
              bg: '#000000', 
              text: '#FFFFFF',
              label: 'TRAIL SYSTEM'
            },
            { 
              product: products[1], 
              bg: '#FFFFFF', 
              text: '#000000',
              label: 'WEATHER PROTECTION'
            },
            { 
              product: products[2], 
              bg: '#000000', 
              text: '#FFFFFF',
              label: 'FULL SYSTEM'
            },
          ].map((item, idx) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              onClick={() => openProduct(item.product)}
              className="relative cursor-pointer rounded-3xl overflow-hidden shadow-2xl"
              style={{ 
                backgroundColor: item.bg,
                minHeight: '500px'
              }}
              data-testid={`featured-card-${item.product.id}`}
            >
              <div className="grid grid-cols-2 h-full">
                {/* Image Side */}
                <div className="relative h-[500px]">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: item.bg === '#FFFFFF' 
                        ? 'linear-gradient(to right, transparent, #FFFFFF)' 
                        : 'linear-gradient(to right, transparent, #000000)'
                    }}
                  ></div>
                </div>

                {/* Content Side */}
                <div className="flex flex-col justify-center p-8" style={{ color: item.text }}>
                  <div className="text-xs font-bold tracking-[0.3em] mb-4 opacity-60">
                    {item.label}
                  </div>
                  <h3 className="text-5xl font-black mb-4 leading-tight tracking-tight">
                    {item.product.name}
                  </h3>
                  <p className="text-sm mb-6 opacity-70 leading-relaxed">
                    {item.product.description}
                  </p>
                  <p className="text-3xl font-black mb-8">
                    {formatPrice(item.product.price)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(item.product);
                    }}
                    className="px-8 py-4 rounded-full font-black text-sm tracking-widest transition-all hover:scale-105 w-fit"
                    style={{
                      backgroundColor: item.text,
                      color: item.bg
                    }}
                  >
                    КУПИТЬ
                  </button>
                </div>
              </div>

              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.product.id);
                }}
                className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{ 
                  backgroundColor: item.bg === '#FFFFFF' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' 
                }}
                data-testid={`button-favorite-home-${item.product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(item.product.id) ? 'fill-current' : ''}`}
                  style={{ color: item.text }}
                />
              </button>
            </motion.div>
          ))}
        </div>

        {/* All Products Grid */}
        <div className="px-6 pb-12">
          <h2 className="text-3xl font-black mb-8 tracking-tight">ВСЕ ПРОДУКТЫ</h2>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(3).map((product) => (
              <motion.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className="relative cursor-pointer"
                data-testid={`product-mini-${product.id}`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-black/20">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center"
                    data-testid={`button-favorite-grid-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-3 py-1 bg-white text-black text-xs font-black rounded-full">
                      NEW
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-white/50 mb-1">ACG</p>
                  <p className="text-sm font-bold mb-2 truncate">{product.name}</p>
                  <p className="text-lg font-black">{formatPrice(product.price)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CATALOG PAGE
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[#2D3748] text-white overflow-auto pb-24">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="text-xs font-bold tracking-[0.3em] text-white/60 mb-1">NIKE</div>
              <h1 className="text-3xl font-black tracking-tight">ACG カタログ</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all" data-testid="button-search">
                <Search className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all" data-testid="button-filter">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Vertical Navigation with Round Buttons */}
          <div className="flex flex-col gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full py-4 px-6 rounded-full text-left font-bold text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                }`}
                data-testid={`button-category-${cat}`}
              >
                <div className="flex items-center justify-between">
                  <span className="tracking-wider">{cat}</span>
                  {selectedCategory === cat && (
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-5">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className="relative cursor-pointer"
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 bg-black/20">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    loading="lazy"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:bg-black/70 transition-all"
                    data-testid={`button-favorite-catalog-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {product.isNew && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white text-black text-xs font-black rounded-full tracking-wider">
                      NEW
                    </div>
                  )}

                  {product.oldPrice && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-black rounded-full">
                      SALE
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold text-white/50 mb-1 tracking-widest">ACG</p>
                  <p className="text-sm font-bold mb-2 truncate tracking-wide">{product.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black">{formatPrice(product.price)}</p>
                    {product.oldPrice && (
                      <p className="text-xs text-white/40 line-through">{formatPrice(product.oldPrice)}</p>
                    )}
                  </div>
                </div>
              </motion.div>
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
      <div className="min-h-screen bg-[#2D3748] text-white overflow-auto pb-32">
        <div className="p-6">
          <div className="mb-8">
            <div className="text-xs font-bold tracking-[0.3em] text-white/60 mb-1">NIKE ACG</div>
            <h1 className="text-3xl font-black tracking-tight">カート</h1>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-white/30" />
              </div>
              <p className="text-white/50 text-center font-medium">Ваша корзина пуста</p>
              <p className="text-white/30 text-sm text-center mt-2">Добавьте товары для оформления заказа</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-black/20 backdrop-blur-xl rounded-2xl p-5 flex gap-4 border border-white/10"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white/50 mb-1 tracking-widest">ACG</p>
                    <h3 className="font-bold mb-2 tracking-wide">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-3">
                      {item.color} • {item.size}
                    </p>
                    <p className="text-xl font-black">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-[#2D3748] border-t border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-bold tracking-wider">ИТОГО:</span>
                  <span className="text-3xl font-black">{formatPrice(total)}</span>
                </div>
                <button
                  className="w-full bg-white text-black font-black py-5 rounded-full hover:bg-white/90 transition-all text-lg tracking-widest shadow-xl"
                  data-testid="button-checkout"
                >
                  ОФОРМИТЬ ЗАКАЗ
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
      <div className="min-h-screen bg-[#2D3748] text-white overflow-auto pb-24">
        <div className="p-6 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-black" />
            </div>
            <div>
              <div className="text-xs font-bold tracking-[0.3em] text-white/60 mb-1">NIKE ACG</div>
              <h2 className="text-2xl font-black tracking-tight">Иван Петров</h2>
              <p className="text-sm text-white/60 mt-1">+7 (999) 123-45-67</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <p className="text-xs text-white/60 mb-2 font-bold tracking-widest">ЗАКАЗЫ</p>
              <p className="text-3xl font-black">{cart.length}</p>
            </div>
            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
              <p className="text-xs text-white/60 mb-2 font-bold tracking-widest">ИЗБРАННОЕ</p>
              <p className="text-3xl font-black">{favorites.size}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all" data-testid="button-orders">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Мои заказы</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all" data-testid="button-favorites">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all" data-testid="button-payment">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all" data-testid="button-address">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all" data-testid="button-settings">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Настройки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-500/30 flex items-center justify-between hover:bg-red-500/30 transition-all mt-6" data-testid="button-logout">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <span className="font-bold text-red-400 tracking-wide">Выйти</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(NikeACG);
