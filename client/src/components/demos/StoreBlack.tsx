import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Grid, Minus, Plus } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import img1 from '@assets/stock_images/cyberpunk_fashion_ho_8df162c4.jpg';
import img2 from '@assets/stock_images/cyberpunk_fashion_ho_663ed3c4.jpg';
import img3 from '@assets/stock_images/cyberpunk_fashion_ho_055adfe8.jpg';
import img4 from '@assets/stock_images/cyberpunk_fashion_ho_1b677abd.jpg';
import img5 from '@assets/stock_images/cyberpunk_fashion_ho_1d2ca716.jpg';
import img6 from '@assets/stock_images/cyberpunk_fashion_ho_3e5fffe1.jpg';
import img7 from '@assets/stock_images/cyberpunk_fashion_ho_4d6ffbfd.jpg';
import img8 from '@assets/stock_images/cyberpunk_fashion_ho_51de6edd.jpg';

interface StoreBlackProps {
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
  gender: 'Tech' | 'Premium' | 'Urban';
  inStock: number;
  rating: number;
  brand: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'Ludens M1 Helmet', 
    price: 37449, 
    oldPrice: 45900,
    image: img1, 
    hoverImage: img2,
    description: 'Футуристический шлем Ludens M1 с LED подсветкой и защитой премиум класса', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Графит'], 
    colorHex: ['#1A1A1A', '#2D2D2D'],
    category: 'Шлемы', 
    gender: 'Tech',
    inStock: 15, 
    rating: 5.0, 
    brand: 'LUDENS',
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: 'Ludens M2 Helmet', 
    price: 42999, 
    oldPrice: 52900,
    image: img2, 
    hoverImage: img1,
    description: 'Улучшенная версия M2 с расширенными возможностями и голографическим дисплеем', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Карбон'], 
    colorHex: ['#000000', '#1A1A1A'],
    category: 'Шлемы', 
    gender: 'Tech',
    inStock: 8, 
    rating: 5.0, 
    brand: 'LUDENS',
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'Tech Watch Pro', 
    price: 29900, 
    oldPrice: 37900,
    image: img3, 
    hoverImage: img4,
    description: 'Умные часы с AI ассистентом и расширенными биометрическими датчиками', 
    sizes: ['38mm', '42mm', '45mm'], 
    colors: ['Черный', 'Титан', 'Золото'], 
    colorHex: ['#000000', '#4A5568', '#FFD700'],
    category: 'Аксессуары', 
    gender: 'Tech',
    inStock: 25, 
    rating: 4.9, 
    brand: 'TECH',
    isNew: true,
    isTrending: true
  },
  { 
    id: 4, 
    name: 'Carbon Carabiner', 
    price: 8999, 
    oldPrice: 12900,
    image: img4, 
    hoverImage: img3,
    description: 'Карабин из углеродного волокна с нано-покрытием и защитой от взлома', 
    sizes: ['One Size'], 
    colors: ['Карбон', 'Матовый Черный'], 
    colorHex: ['#1A1A1A', '#000000'],
    category: 'Аксессуары', 
    gender: 'Urban',
    inStock: 50, 
    rating: 4.8, 
    brand: 'CARBON',
    isNew: true
  },
  { 
    id: 5, 
    name: 'Urban Jacket', 
    price: 54900, 
    oldPrice: 67000,
    image: img5, 
    hoverImage: img6,
    description: 'Урбан куртка с умной тканью, водоотталкивающим покрытием и встроенным подогревом', 
    sizes: ['XS', 'S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Графит', 'Midnight'], 
    colorHex: ['#000000', '#2D2D2D', '#1A1A2E'],
    category: 'Одежда', 
    gender: 'Urban',
    inStock: 12, 
    rating: 5.0, 
    brand: 'URBAN',
    isNew: true,
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Tech Pants', 
    price: 34900, 
    oldPrice: 42900,
    image: img6, 
    hoverImage: img5,
    description: 'Технологичные штаны с карманами для гаджетов и антистатическим покрытием', 
    sizes: ['XS', 'S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Карго'], 
    colorHex: ['#000000', '#2C3E50'],
    category: 'Одежда', 
    gender: 'Urban',
    inStock: 18, 
    rating: 4.9, 
    brand: 'URBAN',
    isNew: true
  },
  { 
    id: 7, 
    name: 'Cyber Gloves Pro', 
    price: 15900, 
    oldPrice: 19900,
    image: img7, 
    hoverImage: img8,
    description: 'Перчатки с тактильной обратной связью для VR и сенсорными панелями', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Графит'], 
    colorHex: ['#000000', '#1A1A1A'],
    category: 'Аксессуары', 
    gender: 'Tech',
    inStock: 30, 
    rating: 4.9, 
    brand: 'CYBER',
    isTrending: true
  },
  { 
    id: 8, 
    name: 'Tactical Backpack X1', 
    price: 27900, 
    oldPrice: 35900,
    image: img8, 
    hoverImage: img7,
    description: 'Тактический рюкзак с защитой от воды, RFID блокировкой и USB зарядкой', 
    sizes: ['One Size'], 
    colors: ['Черный', 'Midnight'], 
    colorHex: ['#000000', '#1A1A2E'],
    category: 'Аксессуары', 
    gender: 'Urban',
    inStock: 20, 
    rating: 5.0, 
    brand: 'TACTICAL',
    isNew: true
  },
  { 
    id: 9, 
    name: 'Smart Shoes V2', 
    price: 45900, 
    oldPrice: 59900,
    image: img3, 
    hoverImage: img4,
    description: 'Умные кроссовки с автошнуровкой, счетчиком шагов и LED индикаторами', 
    sizes: ['39', '40', '41', '42', '43', '44', '45'], 
    colors: ['Черный', 'Карбон', 'Неон'], 
    colorHex: ['#000000', '#1A1A1A', '#FFD700'],
    category: 'Одежда', 
    gender: 'Tech',
    inStock: 15, 
    rating: 4.8, 
    brand: 'SMART',
    isTrending: true
  },
  { 
    id: 10, 
    name: 'Nano Sunglasses', 
    price: 18900, 
    oldPrice: 24900,
    image: img1, 
    hoverImage: img2,
    description: 'Очки с нано-покрытием, защитой от UV и встроенным HUD дисплеем', 
    sizes: ['One Size'], 
    colors: ['Черный', 'Матовый'], 
    colorHex: ['#000000', '#1A1A1A'],
    category: 'Аксессуары', 
    gender: 'Premium',
    inStock: 40, 
    rating: 4.9, 
    brand: 'NANO',
    isNew: true
  },
];

const categories = ['Все', 'Шлемы', 'Аксессуары', 'Одежда'];
const genderFilters = ['All', 'Tech', 'Premium', 'Urban'];

function StoreBlack({ activeTab }: StoreBlackProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [quantity, setQuantity] = useState(1);

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
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const cartItem: CartItem = {
      id: Date.now(),
      name: selectedProduct.name,
      price: selectedProduct.price,
      size: selectedSize,
      quantity: quantity,
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
        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
            data-testid="button-back-to-catalog"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-t-3xl border-t border-white/10 p-6 space-y-6 pb-32">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{selectedProduct.name}</h2>
            <p className="text-sm text-white/60 mb-3">{selectedProduct.brand}</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-4xl font-bold" style={{ color: '#FFD700' }}>
                {formatPrice(selectedProduct.price)}
              </p>
              {selectedProduct.oldPrice && (
                <p className="text-xl text-white/40 line-through">{formatPrice(selectedProduct.oldPrice)}</p>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-sm text-white/80 text-center">{selectedProduct.description}</p>
          </div>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Выберите цвет:</p>
            <div className="flex items-center justify-center gap-3">
              {selectedProduct.colors.map((color, idx) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-[#FFD700] scale-110 shadow-lg shadow-[#FFD700]/50'
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
                  className={`px-4 py-2.5 rounded-full font-semibold transition-all ${
                    selectedSize === size
                      ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/30'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                  data-testid={`button-size-${size}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm mb-3 text-white/80 text-center">Количество:</p>
            <div className="flex items-center justify-center gap-4 bg-white/5 rounded-full px-6 py-3 border border-white/10 w-fit mx-auto">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-white/60 hover:text-white transition-colors"
                data-testid="button-decrease-quantity"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="text-2xl font-bold w-16 text-center" style={{ color: '#FFD700' }}>
                {quantity.toString().padStart(2, '0')}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="text-white/60 hover:text-white transition-colors"
                data-testid="button-increase-quantity"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            onClick={addToCart}
            className="w-full font-bold py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#FFD700]/30"
            style={{ backgroundColor: '#FFD700', color: '#000000' }}
            data-testid="button-buy-now"
          >
            Добавить в корзину • {formatPrice(selectedProduct.price * quantity)}
          </button>

          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <Star className="w-5 h-5 mx-auto mb-1" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60">Рейтинг</p>
              <p className="text-sm font-bold">{selectedProduct.rating}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <Package className="w-5 h-5 mx-auto mb-1" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60">В наличии</p>
              <p className="text-sm font-bold">{selectedProduct.inStock}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <Zap className="w-5 h-5 mx-auto mb-1" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60">Доставка</p>
              <p className="text-sm font-bold">1-2 дня</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-black text-white overflow-auto pb-24">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Grid className="w-8 h-8" style={{ color: '#FFD700' }} />
              <h1 className="text-5xl font-black tracking-tighter">STORE</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative" data-testid="button-cart-header">
                <ShoppingBag className="w-6 h-6" style={{ color: '#FFD700' }} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#FFD700] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button data-testid="button-favorites-header">
                <Heart className="w-6 h-6" style={{ color: favorites.size > 0 ? '#FFD700' : 'white' }} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: '#FFD700' }}
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
                className={`text-sm font-medium transition-colors ${
                  selectedGender === gender
                    ? 'text-white'
                    : 'text-white/40'
                }`}
                style={selectedGender === gender ? { color: '#FFD700' } : {}}
                data-testid={`button-gender-${gender}`}
              >
                {gender}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-full px-4 py-3 flex items-center gap-2 border border-white/10">
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

        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden bg-white/5 border border-white/10" style={{ height: '500px' }}>
          <img
            src={img1}
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" style={{ color: '#FFD700' }} />
                <span className="text-sm font-bold" style={{ color: '#FFD700' }}>NEW COLLECTION</span>
              </div>
              <h2 className="text-6xl font-black mb-3 tracking-tight leading-tight">
                TECH<br/>
                FUTURE
              </h2>
              <p className="text-lg text-white/80 mb-6" style={{ letterSpacing: '0.1em' }}>
                Эксклюзивная коллекция 2025
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold transition-all hover:scale-105 shadow-lg shadow-[#FFD700]/50"
                style={{ backgroundColor: '#FFD700', color: '#000000' }}
                data-testid="button-hero-shop-now"
              >
                Смотреть коллекцию
              </button>
            </motion.div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {filteredProducts.slice(0, 3).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openProduct(product)}
              className="relative cursor-pointer group rounded-3xl overflow-hidden bg-white/5 border border-white/10"
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`featured-product-${product.id}`}
            >
              <div className="absolute inset-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                  <span className="text-xs font-semibold" style={{ color: product.isNew ? '#FFD700' : 'white' }}>
                    {product.isNew ? 'New' : product.category}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                data-testid={`button-favorite-home-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-[#FFD700] text-[#FFD700]' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">{product.gender} Collection</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(product);
                    }}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-[#FFD700]/30"
                    style={{ backgroundColor: '#FFD700' }}
                    data-testid={`button-buy-${product.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-2xl font-bold" style={{ color: '#FFD700' }}>
                    {formatPrice(product.price)}
                  </p>
                  {product.oldPrice && (
                    <p className="text-sm text-white/40 line-through">{formatPrice(product.oldPrice)}</p>
                  )}
                </div>
              </div>
            </motion.div>
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
            <div className="flex items-center gap-3">
              <Grid className="w-6 h-6" style={{ color: '#FFD700' }} />
              <h1 className="text-3xl font-bold">Каталог</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2" data-testid="button-search">
                <Search className="w-6 h-6" />
              </button>
              <button className="p-2" data-testid="button-filter">
                <Filter className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'text-black border-[#FFD700]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
                }`}
                style={selectedCategory === cat ? { backgroundColor: '#FFD700' } : {}}
                data-testid={`button-category-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className="relative cursor-pointer"
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-white/5 border border-white/10 group">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/20"
                    data-testid={`button-favorite-catalog-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-[#FFD700] text-[#FFD700]' : 'text-white'}`}
                    />
                  </button>

                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 text-black text-xs font-bold rounded-full" style={{ backgroundColor: '#FFD700' }}>
                      NEW
                    </div>
                  )}

                  {product.isTrending && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-white/10 backdrop-blur-xl text-white text-xs font-bold rounded-full border border-white/20 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1 truncate">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold" style={{ color: '#FFD700' }}>
                      {formatPrice(product.price)}
                    </p>
                    {product.oldPrice && (
                      <p className="text-xs text-white/40 line-through">{formatPrice(product.oldPrice)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-[#FFD700]" style={{ color: '#FFD700' }} />
                    <span className="text-xs text-white/60">{product.rating}</span>
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
      <div className="min-h-screen bg-black text-white overflow-auto pb-32">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" style={{ color: '#FFD700' }} />
              <h1 className="text-3xl font-bold">Корзина</h1>
            </div>
            {cart.length > 0 && (
              <button 
                onClick={() => setCart([])}
                className="text-sm text-white/60 hover:text-white transition-colors"
                data-testid="button-clear-cart"
              >
                Очистить все
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <ShoppingBag className="w-16 h-16 text-white/20" />
              </div>
              <p className="text-white/50 text-center text-lg mb-2">Ваша корзина пуста</p>
              <p className="text-white/30 text-center text-sm">Добавьте товары из каталога</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/10"
                  data-testid={`cart-item-${item.id}`}
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-white/60 mb-2">
                      {item.color} • {item.size} • Кол-во: {item.quantity}
                    </p>
                    <p className="text-lg font-bold" style={{ color: '#FFD700' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                    className="w-8 h-8 hover:bg-white/10 rounded-lg transition-all"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-black border-t border-white/10">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60">Товары ({cart.length})</span>
                    <span className="font-semibold">{formatPrice(total)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60">Доставка</span>
                    <span className="font-semibold" style={{ color: '#FFD700' }}>Бесплатно</span>
                  </div>
                  <div className="h-px bg-white/10 my-3"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold">Итого:</span>
                    <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>{formatPrice(total)}</span>
                  </div>
                </div>
                <button
                  className="w-full font-bold py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#FFD700]/30"
                  style={{ backgroundColor: '#FFD700', color: '#000000' }}
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
        <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br rounded-full flex items-center justify-center border-2" 
                 style={{ borderColor: '#FFD700', background: 'linear-gradient(135deg, #FFD700 0%, #000000 100%)' }}>
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tech User</h2>
              <p className="text-sm text-white/60">tech@store.black</p>
              <p className="text-sm text-white/60">+7 (999) 123-45-67</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
              <Package className="w-5 h-5 mb-2" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60 mb-1">Заказы</p>
              <p className="text-2xl font-bold">{cart.length}</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
              <Heart className="w-5 h-5 mb-2" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60 mb-1">Избранное</p>
              <p className="text-2xl font-bold">{favorites.size}</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
              <Star className="w-5 h-5 mb-2" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60 mb-1">Бонусы</p>
              <p className="text-2xl font-bold">1250</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-orders">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Package className="w-5 h-5" style={{ color: '#FFD700' }} />
              </div>
              <div className="text-left">
                <span className="font-medium block">Мои заказы</span>
                <span className="text-xs text-white/50">История покупок</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-favorites">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Heart className="w-5 h-5" style={{ color: '#FFD700' }} />
              </div>
              <div className="text-left">
                <span className="font-medium block">Избранное</span>
                <span className="text-xs text-white/50">{favorites.size} товаров</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-payment">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <CreditCard className="w-5 h-5" style={{ color: '#FFD700' }} />
              </div>
              <div className="text-left">
                <span className="font-medium block">Способы оплаты</span>
                <span className="text-xs text-white/50">Карты и кошельки</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-address">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <MapPin className="w-5 h-5" style={{ color: '#FFD700' }} />
              </div>
              <div className="text-left">
                <span className="font-medium block">Адреса доставки</span>
                <span className="text-xs text-white/50">Мои адреса</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-settings">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <Settings className="w-5 h-5" style={{ color: '#FFD700' }} />
              </div>
              <div className="text-left">
                <span className="font-medium block">Настройки</span>
                <span className="text-xs text-white/50">Профиль и безопасность</span>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <div className="h-4"></div>

          <button className="w-full p-4 bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 flex items-center justify-between hover:bg-red-500/20 transition-all" data-testid="button-logout">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-left">
                <span className="font-medium text-red-400 block">Выйти</span>
                <span className="text-xs text-red-400/60">Выход из аккаунта</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default memo(StoreBlack);
