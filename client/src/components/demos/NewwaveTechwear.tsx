import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import img1 from '@assets/stock_images/cyberpunk_fashion_ho_b350f945.jpg';
import img2 from '@assets/stock_images/cyberpunk_fashion_ho_51de6edd.jpg';
import img3 from '@assets/stock_images/cyberpunk_fashion_ho_055adfe8.jpg';
import img4 from '@assets/stock_images/cyberpunk_fashion_ho_1b677abd.jpg';
import img5 from '@assets/stock_images/cyberpunk_fashion_ho_1d2ca716.jpg';
import img6 from '@assets/stock_images/cyberpunk_fashion_ho_3e5fffe1.jpg';
import img7 from '@assets/stock_images/cyberpunk_fashion_ho_4d6ffbfd.jpg';
import img8 from '@assets/stock_images/cyberpunk_fashion_ho_58c75d49.jpg';
import img9 from '@assets/stock_images/cyberpunk_fashion_ho_663ed3c4.jpg';
import img10 from '@assets/stock_images/cyberpunk_fashion_ho_8df162c4.jpg';

interface NewwaveTechwearProps {
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
    name: 'Cutting Edge Poncho', 
    price: 50000, 
    oldPrice: 65000,
    image: img1, 
    hoverImage: img2,
    description: 'Футуристичное пончо с передовыми технологиями терморегуляции', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Фиолетовый'], 
    colorHex: ['#1A1A1A', '#9333EA'],
    category: 'Верхняя одежда', 
    gender: 'Men',
    inStock: 12, 
    rating: 5.0, 
    brand: 'NEWWAVE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: 'Winter Puffer', 
    price: 39900, 
    oldPrice: 52000,
    image: img3, 
    hoverImage: img4,
    description: 'Зимний пуховик с умной изоляцией и LED-подсветкой', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Серый', 'Розовый'], 
    colorHex: ['#6B7280', '#EC4899'],
    category: 'Верхняя одежда', 
    gender: 'Men',
    inStock: 8, 
    rating: 4.9, 
    brand: 'NEWWAVE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'Tech Hoodie Pro', 
    price: 24900, 
    oldPrice: 32000,
    image: img5, 
    hoverImage: img6,
    description: 'Технологичное худи с интегрированной системой вентиляции', 
    sizes: ['XS', 'S', 'M', 'L'], 
    colors: ['Черный', 'Фиолетовый', 'Розовый'], 
    colorHex: ['#1A1A1A', '#9333EA', '#EC4899'],
    category: 'Верхняя одежда', 
    gender: 'Men',
    inStock: 15, 
    rating: 5.0, 
    brand: 'NEWWAVE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 4, 
    name: 'Cyber Pants X1', 
    price: 29900, 
    oldPrice: 38000,
    image: img7, 
    hoverImage: img8,
    description: 'Кибер-брюки с карманами для гаджетов и водоотталкивающей тканью', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Графит'], 
    colorHex: ['#1A1A1A', '#2D2D2D'],
    category: 'Брюки', 
    gender: 'Men',
    inStock: 10, 
    rating: 4.9, 
    brand: 'NEWWAVE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 5, 
    name: 'Neural Jacket', 
    price: 54900, 
    oldPrice: 70000,
    image: img9, 
    hoverImage: img10,
    description: 'Нейро-куртка с подогревом и умной системой контроля температуры', 
    sizes: ['XS', 'S', 'M', 'L'], 
    colors: ['Фиолетовый', 'Черный'], 
    colorHex: ['#9333EA', '#1A1A1A'],
    category: 'Верхняя одежда', 
    gender: 'Woman',
    inStock: 6, 
    rating: 5.0, 
    brand: 'NEWWAVE',
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Quantum Shoes', 
    price: 32900, 
    oldPrice: 42000,
    image: img1, 
    hoverImage: img2,
    description: 'Квантовая обувь с адаптивной подошвой и LED-индикацией', 
    sizes: ['39', '40', '41', '42', '43'], 
    colors: ['Черный', 'Розовый'], 
    colorHex: ['#1A1A1A', '#EC4899'],
    category: 'Обувь', 
    gender: 'Men',
    inStock: 12, 
    rating: 5.0, 
    brand: 'NEWWAVE',
    isTrending: true
  },
  { 
    id: 7, 
    name: 'Cyber Cargo Pro', 
    price: 27900, 
    oldPrice: 36000,
    image: img3, 
    hoverImage: img4,
    description: 'Карго-брюки с увеличенными карманами и усиленными коленями', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Серый'], 
    colorHex: ['#1A1A1A', '#6B7280'],
    category: 'Брюки', 
    gender: 'Men',
    inStock: 14, 
    rating: 4.8, 
    brand: 'NEWWAVE',
    isNew: true
  },
  { 
    id: 8, 
    name: 'Tactical Vest', 
    price: 36900, 
    oldPrice: 48000,
    image: img5, 
    hoverImage: img6,
    description: 'Тактический жилет с модульной системой крепления', 
    sizes: ['S', 'M', 'L'], 
    colors: ['Черный', 'Фиолетовый'], 
    colorHex: ['#1A1A1A', '#9333EA'],
    category: 'Верхняя одежда', 
    gender: 'Woman',
    inStock: 7, 
    rating: 4.9, 
    brand: 'NEWWAVE',
    isNew: true
  },
  { 
    id: 9, 
    name: 'Stealth Joggers', 
    price: 22900, 
    oldPrice: 29000,
    image: img7, 
    hoverImage: img8,
    description: 'Стелс-джоггеры с эластичной тканью и светоотражающими вставками', 
    sizes: ['XS', 'S', 'M', 'L'], 
    colors: ['Черный', 'Розовый'], 
    colorHex: ['#1A1A1A', '#EC4899'],
    category: 'Брюки', 
    gender: 'Woman',
    inStock: 18, 
    rating: 4.7, 
    brand: 'NEWWAVE' 
  },
  { 
    id: 10, 
    name: 'Urban Boots', 
    price: 38900, 
    oldPrice: 49000,
    image: img9, 
    hoverImage: img10,
    description: 'Урбанистические ботинки с усиленной подошвой и водонепроницаемостью', 
    sizes: ['39', '40', '41', '42', '43', '44'], 
    colors: ['Черный', 'Фиолетовый'], 
    colorHex: ['#1A1A1A', '#9333EA'],
    category: 'Обувь', 
    gender: 'Men',
    inStock: 9, 
    rating: 5.0, 
    brand: 'NEWWAVE',
    isTrending: true
  },
];

const categories = ['Все', 'Верхняя одежда', 'Брюки', 'Обувь'];
const genderFilters = ['All', 'Men', 'Woman', 'Children'];

function NewwaveTechwear({ activeTab }: NewwaveTechwearProps) {
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
    const bgColor = selectedProduct.colorHex[selectedProduct.colors.indexOf(selectedColor)] || '#9333EA';
    
    return (
      <div className="min-h-screen text-white overflow-auto" style={{ 
        background: `linear-gradient(180deg, ${bgColor} 0%, #3D2952 100%)` 
      }}>
        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            data-testid="button-back-to-catalog"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32 border-t border-white/20">
          <div className="text-center">
            <div className="inline-block px-4 py-2 rounded-full mb-3" style={{
              background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
            }}>
              <span className="text-white font-bold text-xs">{selectedProduct.brand}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl font-bold text-[#EC4899]">{formatPrice(selectedProduct.price)}</p>
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
                      ? 'border-[#EC4899] scale-110 shadow-lg shadow-[#EC4899]/50'
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
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all ${
                    selectedSize === size
                      ? 'text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  style={selectedSize === size ? {
                    background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
                  } : {}}
                  data-testid={`button-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addToCart}
            className="w-full text-white font-bold py-4 rounded-full transition-all hover:scale-105 shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
            }}
            data-testid="button-buy-now"
          >
            Добавить в корзину
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen text-white overflow-auto pb-24" style={{
        background: 'linear-gradient(180deg, #3D2952 0%, #1A1A1A 100%)'
      }}>
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
          <div className="mb-6">
            <h1 className="text-5xl font-black mb-1 tracking-tight" style={{
              background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              NEWW(AI)VE
            </h1>
            <h2 className="text-3xl font-black text-white">
              TECHWEAR
            </h2>
          </div>

          {/* Gender Filters */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              className="p-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
              }}
              data-testid="button-home"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </button>
            {genderFilters.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className={`text-sm font-medium transition-colors ${
                  selectedGender === gender
                    ? 'text-[#EC4899]'
                    : 'text-white/40'
                }`}
                data-testid={`button-gender-${gender}`}
              >
                {gender}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-full px-4 py-3 flex items-center gap-2 border border-white/20">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden border border-white/20" style={{ height: '500px' }}>
          <img
            src={img1}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(147, 51, 234, 0.8) 100%)'
          }}></div>
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-black mb-3 tracking-tight leading-tight text-white">
                CYBER<br/>
                КОЛЛЕКЦИЯ
              </h2>
              <p className="text-lg text-white/90 mb-6" style={{ letterSpacing: '0.1em' }}>
                Будущее уже здесь
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
                  boxShadow: '0 0 30px rgba(236, 72, 153, 0.5)'
                }}
                data-testid="button-hero-shop-now"
              >
                Смотреть коллекцию
              </button>
            </motion.div>
          </div>
        </div>

        {/* Featured Product Cards */}
        <div className="px-6 space-y-4">
          {filteredProducts.slice(0, 4).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openProduct(product)}
              className="relative cursor-pointer group rounded-3xl overflow-hidden border border-white/20"
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`featured-product-${product.id}`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(147, 51, 234, 0.9) 100%)'
              }}></div>

              {/* Badge */}
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 rounded-full" style={{
                  background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
                }}>
                  <span className="text-xs font-semibold text-white">
                    {product.isNew ? 'NEW' : product.category}
                  </span>
                </div>
              </div>

              {/* Favorite */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30"
                data-testid={`button-favorite-home-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-[#EC4899] text-[#EC4899]' : 'text-white'}`}
                />
              </button>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">{product.gender}'s techwear</p>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(product);
                    }}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                    style={{
                      background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
                    }}
                    data-testid={`button-buy-${product.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Price */}
                <div className="mt-3">
                  <p className="text-lg font-bold text-[#EC4899]">{formatPrice(product.price)}</p>
                </div>
              </div>
            </motion.div>
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
      <div className="min-h-screen text-white overflow-auto pb-24" style={{
        background: 'linear-gradient(180deg, #3D2952 0%, #1A1A1A 100%)'
      }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Каталог</h1>
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
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'text-white border-[#EC4899]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border-white/20'
                }`}
                style={selectedCategory === cat ? {
                  background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
                } : {}}
                data-testid={`button-category-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className="relative cursor-pointer"
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-white/5 border border-white/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Favorite */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/20"
                    data-testid={`button-favorite-catalog-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-[#EC4899] text-[#EC4899]' : 'text-white'}`}
                    />
                  </button>

                  {/* Badge */}
                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 text-white text-xs font-bold rounded-full" style={{
                      background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
                    }}>
                      NEW
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <p className="text-sm font-semibold mb-1 truncate">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-[#EC4899]">{formatPrice(product.price)}</p>
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
      <div className="min-h-screen text-white overflow-auto pb-32" style={{
        background: 'linear-gradient(180deg, #3D2952 0%, #1A1A1A 100%)'
      }}>
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
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/10"
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
                    <p className="text-lg font-bold text-[#EC4899]">{formatPrice(item.price)}</p>
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

              <div className="fixed bottom-24 left-0 right-0 p-6 border-t border-white/10" style={{
                background: 'linear-gradient(180deg, #3D2952 0%, #1A1A1A 100%)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold text-[#EC4899]">{formatPrice(total)}</span>
                </div>
                <button
                  className="w-full text-white font-bold py-4 rounded-full transition-all hover:scale-105 shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
                  }}
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
      <div className="min-h-screen text-white overflow-auto pb-24" style={{
        background: 'linear-gradient(180deg, #3D2952 0%, #1A1A1A 100%)'
      }}>
        <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)'
            }}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Александр Петров</h2>
              <p className="text-sm text-white/60">+7 (999) 123-45-67</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Заказы</p>
              <p className="text-2xl font-bold text-[#EC4899]">{cart.length}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Избранное</p>
              <p className="text-2xl font-bold text-[#EC4899]">{favorites.size}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-orders">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-[#EC4899]" />
              <span className="font-medium">Мои заказы</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-favorites">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#EC4899]" />
              <span className="font-medium">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-payment">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#EC4899]" />
              <span className="font-medium">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-address">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#EC4899]" />
              <span className="font-medium">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-settings">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#EC4899]" />
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
    );
  }

  return null;
}

export default memo(NewwaveTechwear);
