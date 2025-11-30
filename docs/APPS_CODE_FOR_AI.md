# WEB4TG - Код 13 бизнес-приложений для анализа ИИ

## Список приложений (13 штук)
1. **Radiance** (clothing-store) - Магазин одежды → StoreBlack.tsx
2. **TechMart** (electronics) - Электроника → Electronics.tsx
3. **GlowSpa** (beauty) - Салон красоты → Beauty.tsx
4. **DeluxeDine** (restaurant) - Ресторан → Restaurant.tsx
5. **TimeElite** (luxury-watches) - Элитные часы → TimeElite.tsx
6. **SneakerVault** (sneaker-store) - Кроссовки → SneakerVault.tsx
7. **FragranceRoyale** (luxury-perfume) - Парфюмерия → FragranceRoyale.tsx
8. **Rascal®** (futuristic-fashion-1) - Футуристика → RascalStore.tsx
9. **lab. SURVIVALIST** (futuristic-fashion-3) - Минимализм → LabSurvivalist.tsx
10. **Nike ACG** (futuristic-fashion-4) - 3D карточки → NikeACG.tsx
11. **OXYZ** (oxyz-nft) - NFT платформа → OxyzNFT.tsx
12. **Emily Carter AI** (emily-carter-ai) - AI ассистент → EmilyCarterAI.tsx
13. **STORE** (futuristic-fashion-2) - Черный магазин → StoreBlack.tsx

---

## Демо-приложения (13 штук)

### StoreBlack.tsx
```tsx
import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Grid, Minus, Plus, Shirt, Check } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer, SelectDrawer } from "../ui/modern-drawer";
import { HapticButton } from "../ui/haptic-button";
import { useFilter } from "@/hooks/useFilter";
import { Skeleton } from "@/components/ui/skeleton";
// Helmet images
import helmetImg1 from '@assets/stock_images/futuristic_motorcycl_4e16eb33.jpg';
import helmetImg2 from '@assets/stock_images/futuristic_motorcycl_37d2a4c0.jpg';
// Watch images
import watchImg1 from '@assets/stock_images/smart_watch_black_pr_82d34457.jpg';
import watchImg2 from '@assets/stock_images/smart_watch_black_pr_9d517dfd.jpg';
// Carabiner images
import carabinerImg1 from '@assets/stock_images/black_carbon_carabin_e6ec5904.jpg';
import carabinerImg2 from '@assets/stock_images/black_carbon_carabin_564cdb4b.jpg';
// Jacket images
import jacketImg1 from '@assets/stock_images/black_urban_tech_jac_a96116f5.jpg';
import jacketImg2 from '@assets/stock_images/black_urban_tech_jac_db5781c2.jpg';
// Pants images
import pantsImg1 from '@assets/stock_images/black_cargo_pants_te_bc6fefb4.jpg';
import pantsImg2 from '@assets/stock_images/black_cargo_pants_te_1bf4e873.jpg';
// Gloves images
import glovesImg1 from '@assets/stock_images/black_tactical_glove_965b310c.jpg';
import glovesImg2 from '@assets/stock_images/black_tactical_glove_18ec3d8b.jpg';
// Boots images
import bootsImg1 from '@assets/stock_images/black_tactical_boots_8ba948bd.jpg';
import bootsImg2 from '@assets/stock_images/black_tactical_boots_fe0be5c1.jpg';
// Backpack images
import backpackImg1 from '@assets/stock_images/black_backpack_tech__ec98b9d5.jpg';
import backpackImg2 from '@assets/stock_images/black_backpack_tech__e021311c.jpg';
// Sunglasses images
import sunglassesImg1 from '@assets/stock_images/black_sunglasses_pre_3ef9a455.jpg';
import sunglassesImg2 from '@assets/stock_images/black_sunglasses_pre_9e5b9b98.jpg';

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
    image: helmetImg1, 
    hoverImage: helmetImg2,
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
    image: helmetImg2, 
    hoverImage: helmetImg1,
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
    image: watchImg1, 
    hoverImage: watchImg2,
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
    image: carabinerImg1, 
    hoverImage: carabinerImg2,
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
    image: jacketImg1, 
    hoverImage: jacketImg2,
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
    image: pantsImg1, 
    hoverImage: pantsImg2,
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
    image: glovesImg1, 
    hoverImage: glovesImg2,
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
    image: backpackImg1, 
    hoverImage: backpackImg2,
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
    name: 'Tactical Boots V2', 
    price: 45900, 
    oldPrice: 59900,
    image: bootsImg1, 
    hoverImage: bootsImg2,
    description: 'Тактические ботинки с усиленной защитой и антискользящей подошвой', 
    sizes: ['39', '40', '41', '42', '43', '44', '45'], 
    colors: ['Черный', 'Карбон', 'Неон'], 
    colorHex: ['#000000', '#1A1A1A', '#FFD700'],
    category: 'Одежда', 
    gender: 'Tech',
    inStock: 15, 
    rating: 4.8, 
    brand: 'TACTICAL',
    isTrending: true
  },
  { 
    id: 10, 
    name: 'Nano Sunglasses', 
    price: 18900, 
    oldPrice: 24900,
    image: sunglassesImg1, 
    hoverImage: sunglassesImg2,
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

const getDelayClass = (index: number) => {
  const delays = ['scroll-fade-in', 'scroll-fade-in-delay-1', 'scroll-fade-in-delay-2', 'scroll-fade-in-delay-3', 'scroll-fade-in-delay-4', 'scroll-fade-in-delay-5'];
  return delays[index % delays.length];
};

function StoreBlack({ activeTab }: StoreBlackProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [quantity, setQuantity] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: products,
    searchFields: ['name', 'description', 'category', 'brand'] as (keyof Product)[],
  });

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), id]));
  };

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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
    setShowOrderSuccess(true);
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
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
            data-testid="button-back"
            aria-label="Назад"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
            data-testid={`button-favorite-${selectedProduct.id}`}
            aria-label="Избранное"
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedProduct.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] scroll-fade-in">
          <img
            src={selectedProduct.hoverImage}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-t-3xl border-t border-white/10 p-6 space-y-6 pb-32 scroll-fade-in-delay-1">
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

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 scroll-fade-in-delay-2">
            <p className="text-sm text-white/80 text-center">{selectedProduct.description}</p>
          </div>

          <div className="scroll-fade-in-delay-3">
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

          <div className="scroll-fade-in-delay-4">
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

          <div className="scroll-fade-in-delay-5">
            <p className="text-sm mb-3 text-white/80 text-center">Количество:</p>
            <div className="flex items-center justify-center gap-4 bg-white/5 rounded-full px-6 py-3 border border-white/10 w-fit mx-auto">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="text-white/60 hover:text-white transition-colors"
                data-testid="button-decrease-quantity"
                aria-label="Уменьшить количество"
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
                aria-label="Увеличить количество"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <ConfirmDrawer
            trigger={
              <button
                className="w-full font-bold py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#FFD700]/30"
                style={{ backgroundColor: '#FFD700', color: '#000000' }}
                data-testid={`button-add-to-cart-${selectedProduct.id}`}
              >
                Добавить в корзину • {formatPrice(selectedProduct.price * quantity)}
              </button>
            }
            title="Добавить в корзину?"
            description={`${selectedProduct.name} • ${selectedColor} • ${selectedSize} • ${quantity} шт.`}
            confirmText="Добавить"
            cancelText="Отмена"
            variant="default"
            onConfirm={addToCart}
          />

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
          <div className="flex items-center justify-between mb-8 scroll-fade-in">
            <div className="flex items-center gap-3">
              <Grid className="w-8 h-8" style={{ color: '#FFD700' }} />
              <h1 className="text-5xl font-black tracking-tighter">STORE</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative" data-testid="button-view-cart" aria-label="Корзина">
                <ShoppingBag className="w-6 h-6" style={{ color: '#FFD700' }} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#FFD700] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
              <button data-testid="button-view-favorites" aria-label="Избранное">
                <Heart className="w-6 h-6" style={{ color: favorites.size > 0 ? '#FFD700' : 'white' }} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 scroll-fade-in">
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: '#FFD700' }}
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
                style={selectedGender === gender ? { color: '#FFD700' } : {}}
                data-testid={`button-filter-${gender.toLowerCase()}`}
              >
                {gender}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6 scroll-fade-in">
            <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-full px-4 py-3 flex items-center gap-2 border border-white/10">
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

        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden bg-white/5 border border-white/10 scroll-fade-in" style={{ height: '500px' }}>
          <img
            src={helmetImg1}
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
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
                data-testid="button-view-collection"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {filteredProducts.slice(0, 3).map((product, idx) => (
            <m.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openProduct(product)}
              className="relative cursor-pointer group rounded-3xl overflow-hidden bg-white/5 border border-white/10 scroll-fade-in"
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`card-product-${product.id}`}
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
                data-testid={`button-favorite-${product.id}`}
                aria-label="Избранное"
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
                    data-testid={`button-add-to-cart-${product.id}`}
                    aria-label="Добавить в корзину"
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
            </m.div>
          ))}
        </div>
      </div>
    );
  }

  // CATALOG PAGE
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-black text-white overflow-auto pb-24">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <div className="flex items-center gap-3">
              <Grid className="w-6 h-6" style={{ color: '#FFD700' }} />
              <h1 className="text-3xl font-bold">Каталог</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2" data-testid="button-view-search" aria-label="Поиск">
                <Search className="w-6 h-6" />
              </button>
              <button className="p-2" data-testid="button-view-filter" aria-label="Фильтр">
                <Filter className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide scroll-fade-in">
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
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, idx) => (
              <m.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className={`relative cursor-pointer ${idx < 4 ? 'scroll-fade-in' : getDelayClass(idx)}`}
                data-testid={`card-product-${product.id}`}
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
                    data-testid={`button-favorite-${product.id}`}
                    aria-label="Избранное"
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
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
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
            <div className="flex flex-col items-center justify-center py-20 scroll-fade-in-delay-1">
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <ShoppingBag className="w-16 h-16 text-white/20" />
              </div>
              <p className="text-white/50 text-center text-lg mb-2">Ваша корзина пуста</p>
              <p className="text-white/30 text-center text-sm">Добавьте товары из каталога</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/10 ${idx < 2 ? 'scroll-fade-in' : getDelayClass(idx)}`}
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
                    aria-label="Удалить"
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
                <ConfirmDrawer
                  trigger={
                    <button
                      className="w-full font-bold py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#FFD700]/30"
                      style={{ backgroundColor: '#FFD700', color: '#000000' }}
                      data-testid="button-checkout"
                    >
                      Оформить заказ
                    </button>
                  }
                  title="Оформить заказ?"
                  description={`${cart.length} товаров на сумму ${formatPrice(total)}`}
                  confirmText="Подтвердить"
                  cancelText="Отмена"
                  variant="default"
                  onConfirm={handleCheckout}
                />
              </div>

              <ConfirmDrawer
                open={showOrderSuccess}
                onOpenChange={setShowOrderSuccess}
                trigger={<span />}
                title="Заказ оформлен!"
                description="Ваш заказ успешно создан и передан в обработку. Вы можете отслеживать статус в разделе 'Мои заказы'"
                confirmText="Отлично"
                cancelText=""
                variant="default"
                onConfirm={() => setShowOrderSuccess(false)}
                icon={<Check className="w-8 h-8 text-emerald-400" />}
              />
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
        <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/10 scroll-fade-in">
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
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 scroll-fade-in">
              <Package className="w-5 h-5 mb-2" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60 mb-1">Заказы</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 scroll-fade-in">
              <Heart className="w-5 h-5 mb-2" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60 mb-1">Избранное</p>
              <p className="text-2xl font-bold">{favorites.size}</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 scroll-fade-in">
              <Star className="w-5 h-5 mb-2" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60 mb-1">Бонусы</p>
              <p className="text-2xl font-bold">1250</p>
            </div>
          </div>
        </div>

        <div className="p-4 scroll-fade-in">
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
                    <span className="text-sm">Заказ #{order.id.toString().slice(-6)}</span>
                    <span className="text-white/60 text-sm">{order.date}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-white/70">{order.items.length} товаров</span>
                    <span className="font-bold" style={{ color: '#FFD700' }}>{formatPrice(order.total)}</span>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      {order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-1" data-testid="button-view-orders">
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

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-2" data-testid="button-view-favorites">
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

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-3" data-testid="button-view-payment">
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

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-4" data-testid="button-view-address">
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

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-5" data-testid="button-view-settings">
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
```

### Electronics.tsx
```tsx
import { useState, useEffect, memo } from "react";
import { m } from "framer-motion";
import { 
  Smartphone, 
  Heart, 
  Star, 
  ShoppingCart, 
  X,
  Zap,
  TrendingUp,
  Monitor,
  Headphones,
  Camera,
  Sparkles,
  Package,
  User,
  Settings,
  LogOut,
  CreditCard,
  MapPin,
  ChevronLeft,
  Cpu,
  Battery,
  Wifi,
  Search,
  Filter,
  Menu
} from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { Skeleton } from "../ui/skeleton";
import { useFilter } from "@/hooks/useFilter";

interface ElectronicsProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
  category: string;
  brand: string;
  inStock: number;
  rating: number;
  specs: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'iPhone 15 Pro Max', 
    price: 109900, 
    oldPrice: 129900, 
    image: 'https://images.unsplash.com/photo-1678652197950-37846b632180?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=1200&fit=crop&q=90',
    description: 'Флагманский смартфон Apple с чипом A17 Pro и титановым корпусом', 
    category: 'Смартфоны', 
    brand: 'Apple', 
    inStock: 15, 
    rating: 4.9, 
    specs: ['6.7" Super Retina XDR', 'A17 Pro чип', '256GB накопитель', '48MP камера', 'Титановый корпус'], 
    isNew: true, 
    isTrending: true 
  },
  { 
    id: 2, 
    name: 'Samsung Galaxy S24 Ultra', 
    price: 99900, 
    oldPrice: 119900, 
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&h=1200&fit=crop&q=90',
    description: 'Премиальный Android-смартфон с S Pen и AI-функциями', 
    category: 'Смартфоны', 
    brand: 'Samsung', 
    inStock: 12, 
    rating: 4.8, 
    specs: ['6.8" Dynamic AMOLED', 'Snapdragon 8 Gen 3', '512GB памяти', '200MP камера', 'S Pen в комплекте'], 
    isNew: true, 
    isTrending: true 
  },
  { 
    id: 3, 
    name: 'MacBook Pro 16"', 
    price: 249900, 
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&h=1200&fit=crop&q=90',
    description: 'Мощный ноутбук для профессионалов с чипом M3 Max', 
    category: 'Ноутбуки', 
    brand: 'Apple', 
    inStock: 8, 
    rating: 4.9, 
    specs: ['16.2" Liquid Retina XDR', 'M3 Max чип', '32GB unified memory', '1TB SSD', '22 часа работы'], 
    isTrending: true 
  },
  { 
    id: 4, 
    name: 'Dell XPS 15', 
    price: 129900, 
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=1200&fit=crop&q=90',
    description: 'Компактный и производительный ультрабук для работы', 
    category: 'Ноутбуки', 
    brand: 'Dell', 
    inStock: 10, 
    rating: 4.7, 
    specs: ['15.6" OLED 3.5K', 'Intel Core i7-13700H', '16GB DDR5', '512GB NVMe SSD', 'NVIDIA RTX 4050'] 
  },
  { 
    id: 5, 
    name: 'iPad Pro 12.9"', 
    price: 109900, 
    image: 'https://images.unsplash.com/photo-1585790050230-5dd28404f120?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=1200&fit=crop&q=90',
    description: 'Профессиональный планшет с M2 чипом и поддержкой Apple Pencil', 
    category: 'Планшеты', 
    brand: 'Apple', 
    inStock: 14, 
    rating: 4.8, 
    specs: ['12.9" Liquid Retina XDR', 'M2 чип', '128GB памяти', 'Apple Pencil (2-го поколения)', 'Face ID'], 
    isNew: true 
  },
  { 
    id: 6, 
    name: 'Sony WH-1000XM5', 
    price: 35900, 
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=1200&fit=crop&q=90',
    description: 'Беспроводные наушники с лучшим шумоподавлением', 
    category: 'Наушники', 
    brand: 'Sony', 
    inStock: 25, 
    rating: 4.8, 
    specs: ['30 часов работы', 'Bluetooth 5.2', 'HD шумоподавление', '8 микрофонов', 'Быстрая зарядка'], 
    isTrending: true 
  },
  { 
    id: 7, 
    name: 'AirPods Pro 2', 
    price: 24900, 
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&h=1200&fit=crop&q=90',
    description: 'Беспроводные наушники Apple с адаптивным шумоподавлением', 
    category: 'Наушники', 
    brand: 'Apple', 
    inStock: 30, 
    rating: 4.7, 
    specs: ['H2 чип', '6 часов работы', 'Пространственный звук', 'Адаптивное шумоподавление', 'MagSafe зарядка'] 
  },
  { 
    id: 8, 
    name: 'Sony Alpha A7 IV', 
    price: 249900, 
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=1200&fit=crop&q=90', 
    hoverImage: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=1200&fit=crop&q=90',
    description: 'Профессиональная беззеркальная камера для фото и видео', 
    category: 'Камеры', 
    brand: 'Sony', 
    inStock: 6, 
    rating: 4.9, 
    specs: ['33MP полнокадровая матрица', '4K 60p видео', '5-осевая стабилизация', '693 точки AF', '10fps серийная съёмка'] 
  },
];

const categories = ['Все', 'Смартфоны', 'Ноутбуки', 'Планшеты', 'Наушники', 'Камеры'];
const genderFilters = ['All', 'Popular', 'New', 'Sale'];

export default memo(function Electronics({ activeTab }: ElectronicsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
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
      setSelectedFilter('All');
    }
  }, [activeTab]);

  const filteredProducts = filteredItems.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    
    if (activeTab === 'home') {
      const filterMatch = selectedFilter === 'All' || 
                         (selectedFilter === 'New' && p.isNew) ||
                         (selectedFilter === 'Popular' && p.isTrending) ||
                         (selectedFilter === 'Sale' && p.oldPrice);
      return categoryMatch && filterMatch;
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
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const cartItem: CartItem = {
      id: Date.now(),
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1,
      image: selectedProduct.image
    };
    
    setCartItems([...cartItems, cartItem]);
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
    if (cartItems.length === 0) return;
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now(),
      items: [...cartItems],
      total: total,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setCartItems([]);
    setShowCheckoutSuccess(true);
    setTimeout(() => setShowCheckoutSuccess(false), 3000);
  };

  // PRODUCT PAGE - УЛУЧШЕННАЯ
  if (activeTab === 'catalog' && selectedProduct) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
            data-testid={`button-favorite-${selectedProduct.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedProduct.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] bg-gradient-to-br from-white/5 to-transparent">
          <img
            src={selectedProduct.hoverImage}
            alt={selectedProduct.name}
            className="w-full h-full object-contain p-8"
            loading="lazy"
          />
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-[#00D4FF] font-semibold">{selectedProduct.brand}</span>
              {selectedProduct.isNew && (
                <span className="px-2 py-1 bg-[#00D4FF] text-black text-xs font-bold rounded-full">
                  NEW
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-3">{selectedProduct.name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold">{formatPrice(selectedProduct.price)}</p>
              {selectedProduct.oldPrice && (
                <p className="text-xl text-white/50 line-through">{formatPrice(selectedProduct.oldPrice)}</p>
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'fill-[#00D4FF] text-[#00D4FF]' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-white/70">{selectedProduct.rating}</span>
            </div>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">{selectedProduct.description}</p>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00D4FF]" />
              Характеристики
            </h3>
            <div className="space-y-3">
              {selectedProduct.specs.map((spec, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <Zap className="w-4 h-4 text-[#00D4FF] mt-0.5 flex-shrink-0" />
                  <span className="text-white/80">{spec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>В наличии: {selectedProduct.inStock} шт</span>
            </div>
            <div className="flex items-center gap-1">
              <Battery className="w-4 h-4" />
              <span>Гарантия 1 год</span>
            </div>
          </div>

          <ConfirmDrawer
            trigger={
              <button
                className="w-full bg-[#00D4FF] text-black font-bold py-4 rounded-full hover:bg-[#00BFEB] transition-all flex items-center justify-center gap-2"
                data-testid="button-buy-now"
              >
                <ShoppingCart className="w-5 h-5" />
                Добавить в корзину
              </button>
            }
            title="Добавить в корзину?"
            description={`${selectedProduct.name} — ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(selectedProduct.price)}`}
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button aria-label="Меню" data-testid="button-view-menu">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <button aria-label="Корзина" data-testid="button-view-cart">
                <ShoppingCart className="w-6 h-6" />
              </button>
              <button aria-label="Избранное" data-testid="button-view-favorites">
                <Heart className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-[#00D4FF]" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">
              TECH
            </h1>
            <h1 className="text-4xl font-black tracking-tight text-white">
              STORE
            </h1>
          </div>

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
            {genderFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`text-sm font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'text-white'
                    : 'text-white/40'
                }`}
                data-testid={`button-filter-${filter.toLowerCase()}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white/5 rounded-full px-4 py-3 flex items-center gap-2 border border-white/10">
              <Search className="w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Поиск гаджетов..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden" style={{ height: '500px' }}>
          <img
            src="https://images.unsplash.com/photo-1678652197950-37846b632180?w=800&h=1000&fit=crop&q=90"
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
                <Cpu className="w-7 h-7 text-[#00D4FF]" />
              </div>
              <h2 className="text-5xl font-black tracking-tight leading-tight text-white">
                НОВИНКИ
              </h2>
              <h2 className="text-5xl font-black mb-3 tracking-tight leading-tight text-white">
                2025
              </h2>
              <p className="text-base text-white/70 mb-6 flex items-center gap-2" style={{ letterSpacing: '0.05em' }}>
                <Wifi className="w-4 h-4 text-[#00D4FF]" />
                Передовые технологии
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105 bg-[#00D4FF]"
                data-testid="button-view-new"
              >
                Смотреть новинки
              </button>
            </m.div>
          </div>
        </div>

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
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent">
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

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                  <span className="text-xs font-semibold text-white/90">
                    {product.brand}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                aria-label="Избранное"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                data-testid={`button-favorite-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/70 mb-4 flex items-center gap-1">
                      <Cpu className="w-4 h-4 text-[#00D4FF]" />
                      {product.category}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(product);
                    }}
                    aria-label="Добавить в корзину"
                    className="w-14 h-14 rounded-full bg-[#00D4FF] flex items-center justify-center transition-all hover:scale-110"
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-6 h-6 text-black" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-lg font-bold text-white">{formatPrice(product.price)}</p>
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
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

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#00D4FF] text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

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

                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#00D4FF] text-black text-xs font-bold rounded-full">
                      NEW
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-xs text-white/50 mb-1">{product.brand}</p>
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
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-32">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Корзина</h1>

          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ShoppingCart className="w-20 h-20 text-white/20 mb-4" />
              <p className="text-white/50 text-center">Ваша корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
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
                    <p className="text-lg font-bold">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => setCartItems(cartItems.filter(i => i.id !== item.id))}
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
                      className="w-full bg-[#00D4FF] text-black font-bold py-4 rounded-full hover:bg-[#00BFEB] transition-all"
                      data-testid="button-checkout"
                    >
                      Оформить заказ
                    </button>
                  }
                  title="Оформить заказ?"
                  description={`${cartItems.length} товаров на сумму ${formatPrice(total)}`}
                  confirmText="Оформить"
                  cancelText="Отмена"
                  variant="default"
                  onConfirm={handleCheckout}
                />
              </div>
              {showCheckoutSuccess && (
                <div className="fixed top-20 left-4 right-4 bg-[#00D4FF] text-black p-4 rounded-2xl text-center font-bold z-50 animate-pulse">
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="p-6 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#00D4FF] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Иван Петров</h2>
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
                      <span className="text-xs px-2 py-1 bg-[#00D4FF]/20 text-[#00D4FF] rounded-full">
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
});
```

### Beauty.tsx
```tsx
import { useState, useEffect, memo } from "react";
import { m } from "framer-motion";
import { 
  Heart, 
  Star, 
  X,
  Sparkles,
  Calendar,
  Clock,
  User,
  Gift,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  Check,
  Package,
  Search,
  Filter,
  Menu
} from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { Skeleton } from "../ui/skeleton";
import { useFilter } from "@/hooks/useFilter";

interface BeautyProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface Booking {
  id: number;
  serviceName: string;
  specialist: string;
  date: string;
  time: string;
  price: number;
  image: string;
}

interface Order {
  id: number;
  items: Booking[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

interface Service {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  duration: string;
  specialist: string;
  rating: number;
  isPopular?: boolean;
  isNew?: boolean;
}

const services: Service[] = [
  { id: 1, name: 'Классическая стрижка', price: 2500, image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=1200&fit=crop&q=90', description: 'Профессиональная стрижка с мытьем головы и укладкой от мастера салона', category: 'Парикмахерские', duration: '60 мин', specialist: 'Анна Смирнова', rating: 4.9, isPopular: true },
  { id: 2, name: 'Окрашивание волос', price: 6500, image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=1200&fit=crop&q=90', description: 'Профессиональное окрашивание премиум красками Wella с уходом', category: 'Парикмахерские', duration: '180 мин', specialist: 'Елена Козлова', rating: 4.8, isPopular: true },
  { id: 3, name: 'Балаяж', price: 8900, image: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=800&h=1200&fit=crop&q=90', description: 'Модное окрашивание балаяж с плавными переходами', category: 'Парикмахерские', duration: '240 мин', specialist: 'Мария Петрова', rating: 4.9, isNew: true, isPopular: true },
  { id: 4, name: 'Маникюр + гель-лак', price: 1900, image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&h=1200&fit=crop&q=90', description: 'Маникюр с покрытием гель-лак и дизайном на выбор', category: 'Маникюр', duration: '90 мин', specialist: 'Ольга Иванова', rating: 4.8, isPopular: true },
  { id: 5, name: 'Френч маникюр', price: 2200, image: 'https://images.unsplash.com/photo-1610992015732-2449b2604950?w=800&h=1200&fit=crop&q=90', description: 'Элегантный французский маникюр с укреплением ногтевой пластины', category: 'Маникюр', duration: '75 мин', specialist: 'Наталья Волкова', rating: 4.9 },
  { id: 6, name: 'Дизайн ногтей', price: 3500, image: 'https://images.unsplash.com/photo-1604654894610-df63bc138bb9?w=800&h=1200&fit=crop&q=90', description: 'Художественный дизайн ногтей любой сложности', category: 'Маникюр', duration: '120 мин', specialist: 'Дарья Кузнецова', rating: 4.7 },
  { id: 7, name: 'СПА педикюр', price: 3200, image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&h=1200&fit=crop&q=90', description: 'Расслабляющий СПА педикюр с массажем стоп и уходом', category: 'Педикюр', duration: '100 мин', specialist: 'Светлана Белова', rating: 4.9, isPopular: true },
  { id: 8, name: 'Аппаратный педикюр', price: 2800, image: 'https://images.unsplash.com/photo-1587662784763-0021b5f0b1b7?w=800&h=1200&fit=crop&q=90', description: 'Профессиональный аппаратный педикюр с покрытием', category: 'Педикюр', duration: '80 мин', specialist: 'Татьяна Морозова', rating: 4.8 },
  { id: 9, name: 'Чистка лица', price: 4500, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=1200&fit=crop&q=90', description: 'Глубокая чистка лица с увлажняющей маской и массажем', category: 'Косметология', duration: '90 мин', specialist: 'Юлия Титова', rating: 4.8, isPopular: true },
  { id: 10, name: 'Химический пилинг', price: 5500, image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&h=1200&fit=crop&q=90', description: 'Профессиональный химический пилинг для обновления кожи', category: 'Косметология', duration: '60 мин', specialist: 'Анна Соколова', rating: 4.7 },
  { id: 11, name: 'Массаж лица', price: 3200, image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800&h=1200&fit=crop&q=90', description: 'Антивозрастной массаж лица с серумами премиум класса', category: 'Косметология', duration: '45 мин', specialist: 'Валентина Крылова', rating: 4.6, isNew: true },
  { id: 12, name: 'Ботокс для волос', price: 7500, image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=1200&fit=crop&q=90', description: 'Восстанавливающая процедура для гладкости и блеска волос', category: 'Парикмахерские', duration: '120 мин', specialist: 'Анна Смирнова', rating: 4.9, isNew: true },
  { id: 13, name: 'Наращивание ресниц', price: 4900, image: 'https://images.unsplash.com/photo-1583001931096-959e90c3d930?w=800&h=1200&fit=crop&q=90', description: 'Классическое наращивание ресниц 2D-3D эффект', category: 'Косметология', duration: '150 мин', specialist: 'Ирина Павлова', rating: 4.8 },
  { id: 14, name: 'Вечерняя укладка', price: 3800, image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&h=1200&fit=crop&q=90', description: 'Роскошная вечерняя укладка на любой случай', category: 'Парикмахерские', duration: '90 мин', specialist: 'Мария Петрова', rating: 4.7 },
  { id: 15, name: 'Массаж тела', price: 6500, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=1200&fit=crop&q=90', description: 'Расслабляющий массаж всего тела с ароматическими маслами', category: 'Массаж', duration: '60 мин', specialist: 'Ольга Смирнова', rating: 4.9, isPopular: true },
  { id: 16, name: 'Антицеллюлитный массаж', price: 7200, image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=1200&fit=crop&q=90', description: 'Эффективный массаж против целлюлита с разогревом', category: 'Массаж', duration: '75 мин', specialist: 'Марина Белова', rating: 4.6 },
];

const categories = ['Все', 'Парикмахерские', 'Маникюр', 'Педикюр', 'Косметология', 'Массаж'];

// Featured collections for homepage
const collections = [
  {
    id: 1,
    title: 'Уход за волосами',
    subtitle: 'Стрижка + окрашивание',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-pink-500/30 to-rose-500/30',
    accentColor: '#EC4899',
    services: [1, 2, 3]
  },
  {
    id: 2,
    title: 'Маникюр & Педикюр',
    subtitle: 'Идеальные ногти',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-purple-500/30 to-pink-500/30',
    accentColor: '#A855F7',
    services: [4, 5, 6]
  },
  {
    id: 3,
    title: 'SPA & Релакс',
    subtitle: 'Массаж и уход',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-violet-500/30 to-purple-500/30',
    accentColor: '#8B5CF6',
    services: [15, 16]
  },
];

export default memo(function Beauty({ activeTab }: BeautyProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: services,
    searchFields: ['name', 'description', 'category', 'specialist'] as (keyof Service)[],
  });

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedService(null);
    }
  }, [activeTab]);

  const filteredServices = filteredItems.filter(s => 
    selectedCategory === 'Все' || s.category === selectedCategory
  );

  const handleImageLoad = (serviceId: number) => {
    setLoadedImages(prev => new Set(prev).add(serviceId));
  };

  const toggleFavorite = (serviceId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(serviceId)) {
      newFavorites.delete(serviceId);
    } else {
      newFavorites.add(serviceId);
    }
    setFavorites(newFavorites);
  };

  const openService = (service: Service) => {
    setSelectedService(service);
  };

  const bookService = () => {
    if (!selectedService) return;
    
    const booking: Booking = {
      id: Date.now(),
      serviceName: selectedService.name,
      specialist: selectedService.specialist,
      date: 'Уточняется',
      time: 'Согласуем',
      price: selectedService.price,
      image: selectedService.image
    };
    
    setBookings([...bookings, booking]);
    setSelectedService(null);
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
    if (bookings.length === 0) return;
    
    const total = bookings.reduce((sum, booking) => sum + booking.price, 0);
    const newOrder: Order = {
      id: Date.now(),
      items: [...bookings],
      total: total,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setBookings([]);
    setShowCheckoutSuccess(true);
    setTimeout(() => setShowCheckoutSuccess(false), 3000);
  };

  // SERVICE DETAIL PAGE
  if (activeTab === 'catalog' && selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-24">
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedService(null)}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid="button-back"
            aria-label="Назад"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedService.id);
            }}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid={`button-favorite-${selectedService.id}`}
            aria-label="Добавить в избранное"
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedService.id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={selectedService.image}
            alt={selectedService.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-t-3xl -mt-8 relative z-10 p-6 space-y-6 pb-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-pink-300 font-semibold">{selectedService.category}</span>
              {selectedService.isNew && (
                <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs font-bold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </span>
              )}
              {selectedService.isPopular && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full">
                  Популярно
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-3">{selectedService.name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold text-pink-400">{formatPrice(selectedService.price)}</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedService.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-white/70">{selectedService.rating}</span>
            </div>
          </div>

          <p className="text-sm text-white/80 leading-relaxed">{selectedService.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
              <Clock className="w-5 h-5 text-pink-400 mb-2" />
              <p className="text-xs text-white/60">Длительность</p>
              <p className="text-sm font-semibold">{selectedService.duration}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-3 border border-white/10">
              <User className="w-5 h-5 text-pink-400 mb-2" />
              <p className="text-xs text-white/60">Мастер</p>
              <p className="text-sm font-semibold">{selectedService.specialist}</p>
            </div>
          </div>

          <button
            onClick={bookService}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all"
            data-testid="button-book-now"
          >
            Записаться на процедуру
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE - Liquid Glass 2025
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-24">
        <div className="p-6 space-y-6">
          
          {/* Collections Grid - Liquid Glass Cards */}
          <div className="space-y-4 pt-4">
            {collections.map((collection, idx) => (
              <m.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group cursor-pointer overflow-hidden rounded-3xl"
                style={{ height: idx === 0 ? '280px' : '180px' }}
                data-testid={`collection-${collection.id}`}
              >
                {/* Background Image */}
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-70`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                
                {/* Liquid Glass Effect */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Glow on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl"
                  style={{ backgroundColor: collection.accentColor }}
                ></div>
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="space-y-2">
                    {idx === 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5" style={{ color: collection.accentColor }} />
                        <span 
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: collection.accentColor }}
                        >
                          Популярные услуги
                        </span>
                      </div>
                    )}
                    <h3 className="text-3xl font-bold leading-tight">{collection.title}</h3>
                    <p className="text-sm text-white/80">{collection.subtitle}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>

          {/* Popular Services */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                <h3 className="text-xl font-bold">Популярное</h3>
              </div>
              <button className="text-sm text-white/60 hover:text-white transition-colors" data-testid="button-view-all-popular">
                Все
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {services.filter(s => s.isPopular).slice(0, 4).map((service, idx) => (
                <m.div
                  key={service.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openService(service)}
                  className="relative cursor-pointer group"
                  data-testid={`popular-service-${service.id}`}
                >
                  {/* Glass Card */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {service.isNew && (
                        <div className="px-2 py-1 bg-pink-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-xl">
                          <Sparkles className="w-3 h-3" />
                          NEW
                        </div>
                      )}
                    </div>
                    
                    {/* Favorite */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(service.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                      data-testid={`button-favorite-${service.id}`}
                      aria-label="Добавить в избранное"
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.has(service.id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`}
                      />
                    </button>
                  </div>

                  {/* Service Info */}
                  <div className="mt-2">
                    <p className="text-xs text-pink-300 mb-1">{service.category}</p>
                    <p className="text-sm font-medium text-white/90 truncate">{service.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-bold text-pink-400">{formatPrice(service.price)}</p>
                      <p className="text-xs text-white/40">{service.duration}</p>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>

          <div className="h-4"></div>
        </div>
      </div>
    );
  }

  // CATALOG PAGE
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-24">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-xl font-bold">Услуги</h1>
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Поиск услуг..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              data-testid="input-search"
              aria-label="Поиск услуг"
            />
          </div>

          {/* Hero Banner */}
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80"
              alt="Banner"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-3xl font-bold tracking-tight text-pink-300 mb-1">
                Весенние<br/>Спецпредложения
              </h2>
              <p className="text-sm text-white/80">Скидки до 30%</p>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-xl'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredServices.map((service, idx) => (
              <m.div
                key={service.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openService(service)}
                className="relative cursor-pointer"
                data-testid={`service-card-${service.id}`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2 bg-white/5 backdrop-blur-xl border border-white/10">
                  {!loadedImages.has(service.id) && (
                    <Skeleton className="absolute inset-0 rounded-2xl bg-white/10" />
                  )}
                  <img
                    src={service.image}
                    alt={service.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages.has(service.id) ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(service.id)}
                  />
                  
                  {service.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-pink-500/90 text-white text-xs font-bold rounded-full backdrop-blur-xl">
                      NEW
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(service.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                    data-testid={`button-favorite-${service.id}`}
                    aria-label="Добавить в избранное"
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(service.id) ? 'fill-pink-400 text-pink-400' : 'text-white'}`}
                    />
                  </button>
                </div>

                <div>
                  <p className="text-xs text-pink-300 mb-1">{service.category}</p>
                  <p className="text-sm font-medium text-white/90 truncate mb-1">{service.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-pink-400">{formatPrice(service.price)}</p>
                    <p className="text-xs text-white/40">{service.duration}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // CART (BOOKINGS) PAGE
  if (activeTab === 'cart') {
    const total = bookings.reduce((sum, booking) => sum + booking.price, 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-32">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Мои записи</h1>

          {bookings.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 mb-4">У вас пока нет записей</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-24">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={booking.image}
                        alt={booking.serviceName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{booking.serviceName}</h3>
                      <p className="text-sm text-white/60 mb-1">{booking.specialist}</p>
                      <p className="text-xs text-white/50 mb-2">{booking.date} • {booking.time}</p>
                      <p className="font-bold text-pink-400">{formatPrice(booking.price)}</p>
                    </div>
                    <button
                      onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}
                      className="p-2 h-fit hover:bg-white/10 rounded-lg transition-colors"
                      data-testid={`button-cancel-${booking.id}`}
                      aria-label="Отменить запись"
                    >
                      <X className="w-5 h-5 text-white/40" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="fixed bottom-24 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 p-6">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg">Итого:</span>
                    <span className="text-2xl font-bold text-pink-400">{formatPrice(total)}</span>
                  </div>
                  <ConfirmDrawer
                    trigger={
                      <button
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all"
                        data-testid="button-checkout"
                      >
                        Подтвердить записи
                      </button>
                    }
                    title="Подтвердить записи?"
                    description={`${bookings.length} услуг на сумму ${formatPrice(total)}`}
                    confirmText="Подтвердить"
                    cancelText="Отмена"
                    variant="default"
                    onConfirm={handleCheckout}
                  />
                </div>
              </div>
              {showCheckoutSuccess && (
                <div className="fixed top-20 left-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-2xl text-center font-bold z-50 animate-pulse">
                  Записи успешно подтверждены!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // PROFILE PAGE
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-950 text-white overflow-auto pb-24">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Профиль</h1>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Анна Иванова</h2>
            <p className="text-sm text-white/60">anna.ivanova@example.com</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <p className="text-2xl font-bold mb-1">{orders.length}</p>
              <p className="text-xs text-white/60">Заказов</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Heart className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <p className="text-2xl font-bold mb-1">{favorites.size}</p>
              <p className="text-xs text-white/60">Избранное</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Gift className="w-6 h-6 mx-auto mb-2 text-pink-400" />
              <p className="text-2xl font-bold mb-1">350</p>
              <p className="text-xs text-white/60">Бонусов</p>
            </div>
          </div>

          <div className="scroll-fade-in mb-6">
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
                      <span className="text-white/80">{order.items.length} услуг</span>
                      <span className="font-bold text-pink-400">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full">
                        {order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Выполняется' : 'Завершено'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-my-bookings">
              <Package className="w-5 h-5 text-pink-400" />
              <span className="flex-1 text-left font-medium">История заказов</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-loyalty">
              <Gift className="w-5 h-5 text-pink-400" />
              <span className="flex-1 text-left font-medium">Программа лояльности</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-contacts">
              <Phone className="w-5 h-5 text-pink-400" />
              <span className="flex-1 text-left font-medium">Контакты</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});
```

### Restaurant.tsx
```tsx
import { useState, useEffect, memo } from "react";
import { m } from "framer-motion";
import { 
  Heart, 
  Star, 
  X,
  Clock,
  Utensils,
  ChevronLeft,
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Package,
  Search,
  Filter,
  Menu
} from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { Skeleton } from "../ui/skeleton";
import { useFilter } from "@/hooks/useFilter";

interface RestaurantProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

interface Dish {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  cookTime: string;
  rating: number;
  ingredients: string;
  isChefSpecial?: boolean;
  isNew?: boolean;
}

const dishes: Dish[] = [
  { id: 1, name: 'Стейк Рибай', price: 3200, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=1200&fit=crop&q=90', description: 'Премиум стейк из мраморной говядины с трюфельным маслом', category: 'Основные блюда', cookTime: '25 мин', rating: 4.9, ingredients: 'Говядина, трюфель, розмарин', isChefSpecial: true },
  { id: 2, name: 'Лосось на пару', price: 2800, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=1200&fit=crop&q=90', description: 'Филе лосося на пару с овощами гриль и соусом терияки', category: 'Основные блюда', cookTime: '20 мин', rating: 4.8, ingredients: 'Лосось, овощи, терияки', isChefSpecial: true },
  { id: 3, name: 'Ризотто с белыми грибами', price: 2200, image: 'https://images.unsplash.com/photo-1476124369491-b79e6d6c0f16?w=800&h=1200&fit=crop&q=90', description: 'Кремовое ризотто с белыми грибами и пармезаном', category: 'Основные блюда', cookTime: '30 мин', rating: 4.7, ingredients: 'Рис арборио, белые грибы, пармезан', isNew: true },
  { id: 4, name: 'Утиная грудка', price: 3500, image: 'https://images.unsplash.com/photo-1587863568021-6e3bff40e288?w=800&h=1200&fit=crop&q=90', description: 'Утиная грудка с апельсиновым соусом и картофельным пюре', category: 'Основные блюда', cookTime: '35 мин', rating: 4.9, ingredients: 'Утка, апельсины, картофель', isChefSpecial: true },
  { id: 5, name: 'Паста Карбонара', price: 1800, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=1200&fit=crop&q=90', description: 'Классическая римская паста с беконом гуанчале и сыром пекорино', category: 'Паста', cookTime: '15 мин', rating: 4.8, ingredients: 'Паста, гуанчале, яйцо, пекорино' },
  { id: 6, name: 'Тальятелле с трюфелем', price: 2400, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=1200&fit=crop&q=90', description: 'Домашняя паста с черным трюфелем и сливочным соусом', category: 'Паста', cookTime: '18 мин', rating: 4.9, ingredients: 'Паста, трюфель, сливки, пармезан', isChefSpecial: true },
  { id: 7, name: 'Лобстер Фра Дьяволо', price: 4500, image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&h=1200&fit=crop&q=90', description: 'Паста с омаром в остром томатном соусе', category: 'Паста', cookTime: '22 мин', rating: 4.8, ingredients: 'Омар, томаты, чили, паста', isNew: true, isChefSpecial: true },
  { id: 8, name: 'Боскайола', price: 1900, image: 'https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=800&h=1200&fit=crop&q=90', description: 'Паста с белыми грибами, беконом и сливками', category: 'Паста', cookTime: '16 мин', rating: 4.6, ingredients: 'Паста, грибы, бекон, сливки' },
  { id: 9, name: 'Устрицы свежие', price: 3800, image: 'https://images.unsplash.com/photo-1567608198472-8d8b4c86545f?w=800&h=1200&fit=crop&q=90', description: 'Свежие устрицы с лимоном и мигнонеттой (6 шт)', category: 'Закуски', cookTime: '5 мин', rating: 4.9, ingredients: 'Устрицы, лимон, мигнонетта', isChefSpecial: true },
  { id: 10, name: 'Фуа-гра', price: 4200, image: 'https://images.unsplash.com/photo-1535745318714-da922ca9cc81?w=800&h=1200&fit=crop&q=90', description: 'Фуа-гра с карамелизованными яблоками и бриошью', category: 'Закуски', cookTime: '10 мин', rating: 4.8, ingredients: 'Фуа-гра, яблоки, бриошь', isChefSpecial: true },
  { id: 11, name: 'Тар-тар из тунца', price: 2600, image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=800&h=1200&fit=crop&q=90', description: 'Свежий тар-тар из желтоперого тунца с авокадо', category: 'Закуски', cookTime: '8 мин', rating: 4.7, ingredients: 'Тунец, авокадо, кунжут' },
  { id: 12, name: 'Буррата с томатами', price: 1600, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=1200&fit=crop&q=90', description: 'Сыр буррата с томатами черри и базиликом', category: 'Закуски', cookTime: '5 мин', rating: 4.8, ingredients: 'Буррата, томаты, базилик, масло' },
  { id: 13, name: 'Тирамису', price: 900, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=1200&fit=crop&q=90', description: 'Классический итальянский десерт с маскарпоне и эспрессо', category: 'Десерты', cookTime: '5 мин', rating: 4.9, ingredients: 'Маскарпоне, кофе, савоярди, какао' },
  { id: 14, name: 'Крем-брюле', price: 850, image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=1200&fit=crop&q=90', description: 'Классический французский десерт с карамелизованной корочкой', category: 'Десерты', cookTime: '7 мин', rating: 4.8, ingredients: 'Сливки, яйца, ваниль, сахар' },
  { id: 15, name: 'Шоколадный фондан', price: 950, image: 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=800&h=1200&fit=crop&q=90', description: 'Теплый шоколадный кекс с жидкой начинкой', category: 'Десерты', cookTime: '12 мин', rating: 4.9, ingredients: 'Шоколад, масло, яйца, мука', isNew: true },
  { id: 16, name: 'Панна котта с ягодами', price: 800, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=1200&fit=crop&q=90', description: 'Нежный сливочный десерт с лесными ягодами', category: 'Десерты', cookTime: '5 мин', rating: 4.7, ingredients: 'Сливки, ваниль, ягоды, сахар' },
];

const categories = ['Все', 'Закуски', 'Основные блюда', 'Паста', 'Десерты'];

// Featured collections
const collections = [
  {
    id: 1,
    title: 'Выбор шеф-повара',
    subtitle: 'Авторские блюда',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-amber-600/30 to-yellow-600/30',
    accentColor: '#D97706',
    dishes: [1, 4, 6]
  },
  {
    id: 2,
    title: 'Морские деликатесы',
    subtitle: 'Свежие морепродукты',
    image: 'https://images.unsplash.com/photo-1567608198472-8d8b4c86545f?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-blue-600/30 to-cyan-600/30',
    accentColor: '#0EA5E9',
    dishes: [9, 10, 11]
  },
  {
    id: 3,
    title: 'Сладкие удовольствия',
    subtitle: 'Десерты',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=1200&h=800&fit=crop&q=90',
    gradient: 'from-rose-600/30 to-pink-600/30',
    accentColor: '#E11D48',
    dishes: [13, 15]
  },
];

export default memo(function Restaurant({ activeTab }: RestaurantProps) {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: dishes,
    searchFields: ['name', 'description', 'category', 'ingredients'] as (keyof Dish)[],
  });

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedDish(null);
    }
  }, [activeTab]);

  const filteredDishes = filteredItems.filter(d => 
    selectedCategory === 'Все' || d.category === selectedCategory
  );

  const handleImageLoad = (dishId: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), dishId]));
  };

  const toggleFavorite = (dishId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(dishId)) {
      newFavorites.delete(dishId);
    } else {
      newFavorites.add(dishId);
    }
    setFavorites(newFavorites);
  };

  const openDish = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const addToOrder = () => {
    if (!selectedDish) return;
    
    const existing = orderItems.find(item => item.id === selectedDish.id);
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.id === selectedDish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        id: selectedDish.id,
        name: selectedDish.name,
        price: selectedDish.price,
        quantity: 1,
        image: selectedDish.image
      }]);
    }
    setSelectedDish(null);
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
    if (orderItems.length === 0) return;
    
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now(),
      items: [...orderItems],
      total: total,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setOrderItems([]);
    setShowCheckoutSuccess(true);
    setTimeout(() => setShowCheckoutSuccess(false), 3000);
  };

  // DISH DETAIL PAGE
  if (activeTab === 'catalog' && selectedDish) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-24">
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedDish(null)}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid="button-back"
            aria-label="Назад"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedDish.id);
            }}
            className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
            data-testid={`button-favorite-${selectedDish.id}`}
            aria-label="Добавить в избранное"
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedDish.id) ? 'fill-amber-400 text-amber-400' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] overflow-hidden">
          <img
            src={selectedDish.image}
            alt={selectedDish.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-t-3xl -mt-8 relative z-10 p-6 space-y-6 pb-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-amber-300 font-semibold">{selectedDish.category}</span>
              {selectedDish.isNew && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full">
                  NEW
                </span>
              )}
              {selectedDish.isChefSpecial && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" />
                  Chef's Special
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-3">{selectedDish.name}</h2>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-3xl font-bold text-amber-400">{formatPrice(selectedDish.price)}</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedDish.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-white/70">{selectedDish.rating}</span>
            </div>
          </div>

          <p className="text-sm text-white/80 leading-relaxed">{selectedDish.description}</p>

          <div>
            <h3 className="text-sm font-semibold mb-2 text-white/80">Состав:</h3>
            <p className="text-sm text-white/60">{selectedDish.ingredients}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-white/70">Время приготовления: {selectedDish.cookTime}</span>
          </div>

          <button
            onClick={addToOrder}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
            data-testid="button-add-to-order"
          >
            Добавить в заказ
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE - Premium Dark Theme
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-24">
        <div className="p-6 space-y-6">
          
          {/* Collections Grid */}
          <div className="space-y-4 pt-4">
            {collections.map((collection, idx) => (
              <m.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative group cursor-pointer overflow-hidden rounded-3xl"
                style={{ height: idx === 0 ? '280px' : '180px' }}
                data-testid={`collection-${collection.id}`}
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-70`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl"
                  style={{ backgroundColor: collection.accentColor }}
                ></div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="space-y-2">
                    {idx === 0 && (
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                          Рекомендации шефа
                        </span>
                      </div>
                    )}
                    <h3 className="text-3xl font-bold leading-tight">{collection.title}</h3>
                    <p className="text-sm text-white/80">{collection.subtitle}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>

          {/* Chef's Specials */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <h3 className="text-xl font-bold">Выбор шефа</h3>
              </div>
              <button className="text-sm text-white/60 hover:text-white transition-colors" data-testid="button-view-all-chef">
                Все
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {dishes.filter(d => d.isChefSpecial).slice(0, 4).map((dish, idx) => (
                <m.div
                  key={dish.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openDish(dish)}
                  className="relative cursor-pointer group"
                  data-testid={`chef-special-${dish.id}`}
                >
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-2 left-2 flex gap-2">
                      {dish.isNew && (
                        <div className="px-2 py-1 bg-amber-500/90 text-white text-xs font-bold rounded-full backdrop-blur-xl">
                          NEW
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(dish.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                      data-testid={`button-favorite-${dish.id}`}
                      aria-label="Добавить в избранное"
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.has(dish.id) ? 'fill-amber-400 text-amber-400' : 'text-white'}`}
                      />
                    </button>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-amber-300 mb-1">{dish.category}</p>
                    <p className="text-sm font-medium text-white/90 truncate">{dish.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-bold text-amber-400">{formatPrice(dish.price)}</p>
                      <p className="text-xs text-white/40">{dish.cookTime}</p>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>

          <div className="h-4"></div>
        </div>
      </div>
    );
  }

  // CATALOG PAGE
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-24">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-xl font-bold">Меню</h1>
            <Utensils className="w-6 h-6 text-amber-400" />
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              data-testid="input-search"
              aria-label="Поиск блюд"
            />
          </div>

          {/* Hero Banner */}
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img
              src="https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80"
              alt="Banner"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <h2 className="text-3xl font-bold tracking-tight text-amber-300 mb-1">
                Сезонное<br/>Меню
              </h2>
              <p className="text-sm text-white/80">Новые блюда от шефа</p>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-xl'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredDishes.map((dish, idx) => (
              <m.div
                key={dish.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openDish(dish)}
                className="relative cursor-pointer"
                data-testid={`dish-card-${dish.id}`}
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2 bg-white/5 backdrop-blur-xl border border-white/10">
                  {!loadedImages.has(dish.id) && (
                    <Skeleton className="absolute inset-0 rounded-2xl bg-white/10" />
                  )}
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages.has(dish.id) ? 'opacity-100' : 'opacity-0'}`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(dish.id)}
                  />
                  
                  {dish.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 text-white text-xs font-bold rounded-full backdrop-blur-xl">
                      NEW
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(dish.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center hover:bg-white/10 transition-all"
                    data-testid={`button-favorite-${dish.id}`}
                    aria-label="Добавить в избранное"
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(dish.id) ? 'fill-amber-400 text-amber-400' : 'text-white'}`}
                    />
                  </button>
                </div>

                <div>
                  <p className="text-xs text-amber-300 mb-1">{dish.category}</p>
                  <p className="text-sm font-medium text-white/90 truncate mb-1">{dish.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-amber-400">{formatPrice(dish.price)}</p>
                    <p className="text-xs text-white/40">{dish.cookTime}</p>
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
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-32">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Корзина</h1>

          {orderItems.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/60 mb-4">Ваша корзина пуста</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-24">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.name}</h3>
                      <p className="text-sm text-white/60 mb-2">Количество: {item.quantity}</p>
                      <p className="font-bold text-amber-400">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <button
                      onClick={() => setOrderItems(orderItems.filter(i => i.id !== item.id))}
                      className="p-2 h-fit hover:bg-white/10 rounded-lg transition-colors"
                      data-testid={`button-remove-${item.id}`}
                      aria-label="Удалить из корзины"
                    >
                      <X className="w-5 h-5 text-white/40" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="fixed bottom-24 left-0 right-0 bg-black/60 backdrop-blur-xl border-t border-white/10 p-6">
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg">Итого:</span>
                    <span className="text-2xl font-bold text-amber-400">{formatPrice(total)}</span>
                  </div>
                  <ConfirmDrawer
                    trigger={
                      <button
                        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                        data-testid="button-checkout"
                      >
                        Оформить заказ
                      </button>
                    }
                    title="Оформить заказ?"
                    description={`${orderItems.length} блюд на сумму ${formatPrice(total)}`}
                    confirmText="Оформить"
                    cancelText="Отмена"
                    variant="default"
                    onConfirm={handleCheckout}
                  />
                </div>
              </div>
              {showCheckoutSuccess && (
                <div className="fixed top-20 left-4 right-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-black p-4 rounded-2xl text-center font-bold z-50 animate-pulse">
                  Заказ успешно оформлен!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // PROFILE PAGE
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-950 to-black text-white overflow-auto pb-24">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Профиль</h1>
          </div>

          <div className="text-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-yellow-600 mx-auto mb-4 flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Дмитрий Соколов</h2>
            <p className="text-sm text-white/60">dmitry.sokolov@example.com</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold mb-1">{orders.length}</p>
              <p className="text-xs text-white/60">Заказов</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Heart className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold mb-1">{favorites.size}</p>
              <p className="text-xs text-white/60">Избранное</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 text-center border border-white/10">
              <Star className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <p className="text-2xl font-bold mb-1">250</p>
              <p className="text-xs text-white/60">Баллов</p>
            </div>
          </div>

          <div className="scroll-fade-in mb-6">
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
                      <span className="text-white/80">{order.items.length} блюд</span>
                      <span className="font-bold text-amber-400">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                        {order.status === 'processing' ? 'Готовится' : order.status === 'shipped' ? 'В пути' : 'Доставлен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-my-orders">
              <Package className="w-5 h-5 text-amber-400" />
              <span className="flex-1 text-left font-medium">История заказов</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-reservation">
              <Utensils className="w-5 h-5 text-amber-400" />
              <span className="flex-1 text-left font-medium">Забронировать стол</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>

            <button className="w-full flex items-center gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/10 transition-all border border-white/10" data-testid="button-contacts">
              <Phone className="w-5 h-5 text-amber-400" />
              <span className="flex-1 text-left font-medium">Контакты</span>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
});
```

### TimeElite.tsx
```tsx
import { useState } from "react";
import { 
  Heart, 
  Star, 
  X, 
  Watch,
  Award,
  TrendingUp,
  Package,
  User,
  CreditCard,
  MapPin,
  Settings,
  LogOut,
  ChevronLeft,
  Search
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { useFilter } from "@/hooks/useFilter";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeEliteProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

interface Order {
  id: number;
  items: CartItem[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

const products = [
  { id: 1, name: 'Rolex Submariner', brand: 'Rolex', price: 1125000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Легендарные дайверские часы с водонепроницаемостью 300м', category: 'Rolex', inStock: 3, rating: 4.9, movement: 'Автоматический', waterResistance: '300м', material: 'Сталь 904L', diameter: '40мм' },
  { id: 2, name: 'Patek Philippe Calatrava', brand: 'Patek Philippe', price: 2565000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Элегантные часы с вечным дизайном и филигранной отделкой', category: 'Patek', inStock: 2, rating: 4.95, movement: 'Механический', waterResistance: '30м', material: 'Белое золото', diameter: '39мм' },
  { id: 3, name: 'Omega Speedmaster', brand: 'Omega', price: 585000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Легендарные часы астронавтов, первые на Луне', category: 'Omega', inStock: 5, rating: 4.8, movement: 'Механический', waterResistance: '50м', material: 'Сталь', diameter: '42мм' },
  { id: 4, name: 'Cartier Santos', brand: 'Cartier', price: 765000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Первые наручные часы в истории с квадратным корпусом', category: 'Cartier', inStock: 4, rating: 4.7, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '39.8мм' },
  { id: 5, name: 'Audemars Piguet Royal Oak', brand: 'Audemars Piguet', price: 3150000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Икона часового дизайна с восьмиугольным безелем', category: 'Люкс', inStock: 2, rating: 4.92, movement: 'Автоматический', waterResistance: '50м', material: 'Сталь', diameter: '41мм' },
  { id: 6, name: 'Rolex Datejust', brand: 'Rolex', price: 882000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Классические часы с датой и циклопом', category: 'Rolex', inStock: 6, rating: 4.85, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь и золото', diameter: '41мм' },
  { id: 7, name: 'Jaeger-LeCoultre Reverso', brand: 'Jaeger-LeCoultre', price: 1620000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Уникальный переворачивающийся корпус Art Deco', category: 'Люкс', inStock: 3, rating: 4.85, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '26мм x 42мм' },
  { id: 8, name: 'Vacheron Constantin Patrimony', brand: 'Vacheron Constantin', price: 2880000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Воплощение утонченности и классического стиля', category: 'Люкс', inStock: 1, rating: 4.9, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '40мм' },
  { id: 9, name: 'Omega Seamaster', brand: 'Omega', price: 468000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Дайверские часы Джеймса Бонда', category: 'Omega', inStock: 7, rating: 4.75, movement: 'Автоматический', waterResistance: '300м', material: 'Сталь', diameter: '42мм' },
  { id: 10, name: 'Cartier Tank', brand: 'Cartier', price: 648000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Прямоугольные часы, вдохновленные танком', category: 'Cartier', inStock: 5, rating: 4.8, movement: 'Кварцевый', waterResistance: '30м', material: 'Желтое золото', diameter: '29.5 x 22мм' },
  { id: 11, name: 'Rolex GMT-Master II', brand: 'Rolex', price: 1278000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Часы для путешественников с двумя часовыми поясами', category: 'Rolex', inStock: 4, rating: 4.88, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь и золото', diameter: '40мм' },
  { id: 12, name: 'Patek Philippe Nautilus', brand: 'Patek Philippe', price: 3780000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Спортивно-элегантные часы с иллюминаторным дизайном', category: 'Patek', inStock: 1, rating: 4.98, movement: 'Автоматический', waterResistance: '120м', material: 'Сталь', diameter: '40мм' },
  { id: 13, name: 'A. Lange & Söhne Lange 1', brand: 'A. Lange & Söhne', price: 3420000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Немецкое часовое совершенство с большой датой', category: 'Люкс', inStock: 2, rating: 4.95, movement: 'Механический', waterResistance: '30м', material: 'Розовое золото', diameter: '38.5мм' },
  { id: 14, name: 'Omega Constellation', brand: 'Omega', price: 432000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Элегантные часы со звездным символом', category: 'Omega', inStock: 8, rating: 4.65, movement: 'Автоматический', waterResistance: '50м', material: 'Сталь и золото', diameter: '38мм' },
  { id: 15, name: 'Cartier Ballon Bleu', brand: 'Cartier', price: 855000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Часы с сапфировой короной и выпуклым стеклом', category: 'Cartier', inStock: 6, rating: 4.72, movement: 'Автоматический', waterResistance: '30м', material: 'Сталь', diameter: '42мм' },
  { id: 16, name: 'Rolex Daytona', brand: 'Rolex', price: 1665000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Хронограф для гоночных трасс', category: 'Rolex', inStock: 2, rating: 4.93, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '40мм' },
  { id: 17, name: 'Patek Philippe Aquanaut', brand: 'Patek Philippe', price: 2250000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Спортивно-шикарные часы с каучуковым ремешком', category: 'Patek', inStock: 3, rating: 4.87, movement: 'Автоматический', waterResistance: '120м', material: 'Сталь', diameter: '40мм' },
  { id: 18, name: 'Zenith El Primero', brand: 'Zenith', price: 648000, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format,compress&fm=webp&q=75&w=400', description: 'Первый автоматический хронограф высокой частоты', category: 'Хронографы', inStock: 5, rating: 4.8, movement: 'Автоматический', waterResistance: '100м', material: 'Сталь', diameter: '42мм' },
  { id: 19, name: 'Tudor Black Bay', brand: 'Tudor', price: 315000, image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format,compress&fm=webp&q=75&w=400', description: 'Винтажно-вдохновленные дайверские часы', category: 'Спорт', inStock: 10, rating: 4.6, movement: 'Автоматический', waterResistance: '200м', material: 'Сталь', diameter: '41мм' },
  { id: 20, name: 'IWC Pilot\'s Watch', brand: 'IWC', price: 378000, image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?auto=format,compress&fm=webp&q=75&w=400', description: 'Классические часы пилотов с большой заводной головкой', category: 'Авиация', inStock: 6, rating: 4.6, movement: 'Автоматический', waterResistance: '60м', material: 'Сталь', diameter: '43мм' }
];

const categories = ['Все', 'Rolex', 'Omega', 'Cartier', 'Patek', 'Люкс', 'Спорт'];

export default function TimeElite({ activeTab }: TimeEliteProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<number[]>([1, 4, 11]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: products,
    searchFields: ['name', 'description', 'category', 'brand'],
  });

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), id]));
  };

  useImagePreloader({
    images: products.slice(0, 6).map(p => p.image),
    priority: true
  });

  const openProductModal = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: typeof products[0]) => {
    const cartItem: CartItem = {
      id: Date.now(),
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      quantity: 1
    };
    setCart([...cart, cartItem]);
    closeProductModal();
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const filteredProducts = selectedCategory === 'Все' 
    ? (searchQuery ? filteredItems : products)
    : (searchQuery ? filteredItems : products).filter(p => p.category === selectedCategory);

  const renderHomeTab = () => (
    <div className="min-h-screen bg-white font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4 scroll-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-600 to-amber-700 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
            <Watch className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TimeElite</h1>
            <p className="text-sm text-gray-500">Коллекция премиум часов</p>
          </div>
        </div>

        <div className="flex items-center gap-3 scroll-fade-in">
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Поиск часов..."
              className="bg-transparent text-gray-900 placeholder:text-gray-400 outline-none flex-1 text-sm"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-yellow-600 to-amber-700 rounded-3xl p-8 text-white overflow-hidden scroll-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3">Swiss Luxury 2025</h2>
            <p className="text-white/90 mb-4">Эксклюзивные модели от ведущих мануфактур</p>
            <button 
              onClick={() => setSelectedCategory('Rolex')}
              className="px-6 py-3 bg-white text-amber-700 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              data-testid="button-view-collection"
            >
              Смотреть коллекцию
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between scroll-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Бренды</h2>
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer scroll-fade-in"
              onClick={() => setSelectedCategory('Rolex')}
              data-testid="button-filter-rolex"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Rolex</h3>
              <p className="text-center text-sm text-gray-500">18 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer scroll-fade-in"
              onClick={() => setSelectedCategory('Omega')}
              data-testid="button-filter-omega"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Omega</h3>
              <p className="text-center text-sm text-gray-500">12 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer scroll-fade-in"
              onClick={() => setSelectedCategory('Cartier')}
              data-testid="button-filter-cartier"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Cartier</h3>
              <p className="text-center text-sm text-gray-500">8 моделей</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer scroll-fade-in"
              onClick={() => setSelectedCategory('Patek')}
              data-testid="button-filter-patek"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Watch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Patek Philippe</h3>
              <p className="text-center text-sm text-gray-500">6 моделей</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 scroll-fade-in">Популярное</h2>
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.slice(0, 6).map((product, index) => (
              <div 
                key={product.id}
                className={`group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 ${index < 4 ? 'scroll-fade-in' : `scroll-fade-in-delay-${Math.min(index - 3, 2)}`}`}
                onClick={() => openProductModal(product)}
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {!loadedImages.has(product.id) && (
                    <Skeleton className="absolute inset-0 rounded-lg" />
                  )}
                  <OptimizedImage 
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                      loadedImages.has(product.id) ? 'opacity-100' : 'opacity-0'
                    }`}
                    priority={product.id <= 4}
                    onLoad={() => handleImageLoad(product.id)}
                  />
                  <button 
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(product.id);
                    }}
                    aria-label="Избранное"
                    data-testid={`button-favorite-${product.id}`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      strokeWidth={2}
                    />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-xs font-medium text-amber-600 mb-1">{product.brand}</div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCatalogTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-5 px-4">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full px-4 py-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Поиск часов..."
                className="bg-transparent text-gray-900 placeholder:text-gray-400 outline-none flex-1 text-sm"
                data-testid="input-search-catalog"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Найдено {filteredProducts.length} часов</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id}
              className={`group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer ${index < 4 ? '' : `scroll-fade-in-delay-${Math.min((index - 4) % 4 + 1, 3)}`}`}
              onClick={() => openProductModal(product)}
              data-testid={`product-${product.id}`}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {!loadedImages.has(product.id) && (
                  <Skeleton className="absolute inset-0 rounded-lg" />
                )}
                <OptimizedImage 
                  src={product.image}
                  alt={product.name}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                    loadedImages.has(product.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={product.id <= 4}
                  onLoad={() => handleImageLoad(product.id)}
                />
                <button 
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(product.id);
                  }}
                  aria-label="Избранное"
                  data-testid={`button-favorite-${product.id}`}
                >
                  <Heart 
                    className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    strokeWidth={2}
                  />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-xs font-medium text-amber-600 mb-1">{product.brand}</div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCartTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 scroll-fade-in">Корзина</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-16">
            <Watch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Корзина пуста</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-2xl p-4 flex gap-4 shadow-sm scroll-fade-in-delay-${Math.min(index + 1, 5)}`}
                  data-testid={`cart-item-${item.id}`}
                >
                  <OptimizedImage 
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-amber-600 font-medium mb-1">{item.brand}</p>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</p>
                  </div>
                  <button
                    onClick={() => setCart(cart.filter(i => i.id !== item.id))}
                    className="w-8 h-8 flex items-center justify-center"
                    aria-label="Удалить"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>

            <div className="fixed bottom-24 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-900">Итого:</span>
                  <span className="text-2xl font-bold text-amber-600">{formatPrice(cartTotal)}</span>
                </div>
                <ConfirmDrawer
                  trigger={
                    <button
                      className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
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
          </>
        )}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-6 scroll-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-amber-700 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Александр Иванов</h2>
              <p className="text-sm text-gray-500">+7 (999) 123-45-67</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Заказы</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Избранное</p>
              <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
            </div>
          </div>
        </div>

        <div className="scroll-fade-in-delay-1">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Мои заказы</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">У вас пока нет заказов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl p-4" data-testid={`order-${order.id}`}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 font-medium">Заказ #{order.id.toString().slice(-6)}</span>
                    <span className="text-gray-500">{order.date}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{order.items.length} товаров</span>
                    <span className="font-bold text-amber-600">{formatPrice(order.total)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      {order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 scroll-fade-in-delay-2">
          <button className="w-full p-4 bg-white rounded-2xl flex items-center justify-between" aria-label="Избранное" data-testid="button-favorites">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button className="w-full p-4 bg-white rounded-2xl flex items-center justify-between" aria-label="Способы оплаты" data-testid="button-payment">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button className="w-full p-4 bg-white rounded-2xl flex items-center justify-between" aria-label="Адреса доставки" data-testid="button-address">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button className="w-full p-4 bg-white rounded-2xl flex items-center justify-between" aria-label="Настройки" data-testid="button-settings">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Настройки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button className="w-full p-4 bg-red-50 rounded-2xl flex items-center justify-between mt-4" aria-label="Выйти" data-testid="button-logout">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-500">Выйти</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div 
        className={`fixed inset-0 z-50 bg-white transition-all duration-300 ${
          isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ overflowY: 'auto' }}
      >
        <div className="max-w-md mx-auto">
          <button 
            onClick={closeProductModal}
            className="fixed top-4 right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            aria-label="Закрыть"
            data-testid="button-back"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>

          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {!loadedImages.has(selectedProduct.id + 100) && (
              <Skeleton className="absolute inset-0" />
            )}
            <OptimizedImage 
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loadedImages.has(selectedProduct.id + 100) ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(selectedProduct.id + 100)}
            />
          </div>

          <div className="p-6 space-y-6">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-full text-sm font-semibold">
              {selectedProduct.brand}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-amber-600">{formatPrice(selectedProduct.price)}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900">{selectedProduct.rating}</span>
                  <span className="text-gray-500">(128)</span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Характеристики</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Механизм</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.movement}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Водонепроницаемость</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.waterResistance}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Материал</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.material}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Диаметр</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.diameter}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">В наличии {selectedProduct.inStock} шт</span>
            </div>

            <ConfirmDrawer
              trigger={
                <button 
                  className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
                  data-testid={`button-add-to-cart-${selectedProduct.id}`}
                >
                  Добавить в корзину
                </button>
              }
              title="Добавить в корзину?"
              description={`${selectedProduct.name} — ${formatPrice(selectedProduct.price)}`}
              confirmText="Добавить"
              cancelText="Отмена"
              variant="default"
              onConfirm={() => addToCart(selectedProduct)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'catalog' && renderCatalogTab()}
      {activeTab === 'cart' && renderCartTab()}
      {activeTab === 'profile' && renderProfileTab()}
      {renderProductModal()}
    </>
  );
}
```

### SneakerVault.tsx
```tsx
import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import greenNikeImage from "@assets/загруженное-_4__1761733573240.jpg";
import blueNikeImage from "@assets/загруженное-_3__1761733577054.jpg";
import whiteJordanImage from "@assets/загруженное-_2__1761733579316.jpg";
import tealJordanImage from "@assets/NIKE-AIR-JORDAN-V2-e-V3-_designer_designergrafico-_design-_nikeair-_airjordan-_socialmedia-_natural-_1761733582395.jpg";

// Video served from public/videos/ to reduce Docker image size
const sneakerVideo = "/videos/ae01958370d099047455d799eba60389_1762352751328.mp4";

interface SneakerVaultProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
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

function SneakerVault({ activeTab }: SneakerVaultProps) {
  const [selectedSneaker, setSelectedSneaker] = useState<Sneaker | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');

  useEffect(() => {
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
    setSelectedSneaker(sneaker);
    setSelectedSize(sneaker.sizes[0]);
    // Note: User can manually navigate to catalog tab via bottom navigation
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <Menu className="w-6 h-6" data-testid="button-menu" />
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-32">
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
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
```

### FragranceRoyale.tsx
```tsx
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
      <div className="min-h-screen text-white overflow-auto pb-24" style={{ backgroundColor: bgColor }}>
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-32">
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
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24">
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
```

### RascalStore.tsx
```tsx
import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import fashionImg1 from '@assets/stock_images/futuristic_techwear__e958e42c.jpg';
import fashionImg2 from '@assets/stock_images/futuristic_techwear__737df842.jpg';
import fashionImg3 from '@assets/stock_images/futuristic_fashion_m_4203db1e.jpg';
import fashionImg4 from '@assets/stock_images/futuristic_techwear__a22f6015.jpg';
import fashionImg5 from '@assets/stock_images/futuristic_techwear__046f6538.jpg';
import fashionImg6 from '@assets/stock_images/futuristic_fashion_m_331bf630.jpg';
import fashionImg7 from '@assets/stock_images/futuristic_fashion_m_518587e3.jpg';
import fashionImg8 from '@assets/stock_images/futuristic_techwear__95b77175.jpg';

interface RascalStoreProps {
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
  gender: 'Men' | 'Woman';
  inStock: number;
  rating: number;
  brand: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'Waterproof Jacket', 
    price: 12900, 
    oldPrice: 15900,
    image: fashionImg1, 
    hoverImage: fashionImg1,
    description: 'Водонепроницаемая куртка Nike ACG с технологией Gore-Tex', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Зеленый', 'Черный'], 
    colorHex: ['#7FB069', '#1a2e2a'],
    category: 'Куртки', 
    gender: 'Men',
    inStock: 15, 
    rating: 5.0, 
    brand: 'NIKE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: 'Nike ACG Jacket', 
    price: 25900, 
    oldPrice: 32000,
    image: fashionImg2, 
    hoverImage: fashionImg2,
    description: 'Премиальная куртка Nike ACG для экстремальных условий', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Темно-зеленый'], 
    colorHex: ['#1a2e2a', '#5A8C4A'],
    category: 'Куртки', 
    gender: 'Men',
    inStock: 8, 
    rating: 5.0, 
    brand: 'NIKE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'Futuristic Sneakers', 
    price: 18900, 
    oldPrice: 23000,
    image: fashionImg3, 
    hoverImage: fashionImg3,
    description: 'Футуристические кроссовки Nike с технологией React', 
    sizes: ['39', '40', '41', '42', '43'], 
    colors: ['Зеленый', 'Белый', 'Черный'], 
    colorHex: ['#7FB069', '#FFFFFF', '#1a2e2a'],
    category: 'Кроссовки', 
    gender: 'Men',
    inStock: 12, 
    rating: 4.9, 
    brand: 'NIKE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 4, 
    name: 'Tech Runner', 
    price: 22000, 
    oldPrice: 28000,
    image: fashionImg4, 
    hoverImage: fashionImg4,
    description: 'Беговые кроссовки Nike с инновационной подошвой', 
    sizes: ['38', '39', '40', '41', '42'], 
    colors: ['Черный', 'Зеленый'], 
    colorHex: ['#1a2e2a', '#7FB069'],
    category: 'Кроссовки', 
    gender: 'Woman',
    inStock: 10, 
    rating: 5.0, 
    brand: 'NIKE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 5, 
    name: 'Trail Shoes', 
    price: 16500, 
    oldPrice: 20000,
    image: fashionImg5, 
    hoverImage: fashionImg5,
    description: 'Трейловые кроссовки Nike для бега по пересеченной местности', 
    sizes: ['39', '40', '41', '42', '43', '44'], 
    colors: ['Серый', 'Зеленый'], 
    colorHex: ['#6B7280', '#7FB069'],
    category: 'Кроссовки', 
    gender: 'Men',
    inStock: 15, 
    rating: 4.8, 
    brand: 'NIKE',
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Carbon Hoodie', 
    price: 8900, 
    oldPrice: 11500,
    image: fashionImg6, 
    hoverImage: fashionImg6,
    description: 'Премиум худи Nike из высокотехнологичных материалов', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Зеленый'], 
    colorHex: ['#1a2e2a', '#7FB069'],
    category: 'Худи', 
    gender: 'Men',
    inStock: 20, 
    rating: 4.9, 
    brand: 'NIKE',
    isNew: true
  },
  { 
    id: 7, 
    name: 'Urban Tech Jacket', 
    price: 19900, 
    oldPrice: 25000,
    image: fashionImg7, 
    hoverImage: fashionImg7,
    description: 'Городская куртка Nike с защитой от непогоды', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Зеленый', 'Графит'], 
    colorHex: ['#7FB069', '#2D2D2D'],
    category: 'Куртки', 
    gender: 'Woman',
    inStock: 7, 
    rating: 5.0, 
    brand: 'NIKE',
    isNew: true
  },
  { 
    id: 8, 
    name: 'Elite Training Hoodie', 
    price: 11900, 
    oldPrice: 15000,
    image: fashionImg8, 
    hoverImage: fashionImg8,
    description: 'Тренировочный худи Nike для профессиональных спортсменов', 
    sizes: ['S', 'M', 'L', 'XL', 'XXL'], 
    colors: ['Черный', 'Темно-зеленый'], 
    colorHex: ['#1a2e2a', '#5A8C4A'],
    category: 'Худи', 
    gender: 'Men',
    inStock: 18, 
    rating: 4.9, 
    brand: 'NIKE',
    isTrending: true
  },
  { 
    id: 9, 
    name: 'Storm Runner Pro', 
    price: 24500, 
    oldPrice: 30000,
    image: fashionImg3, 
    hoverImage: fashionImg3,
    description: 'Профессиональные беговые кроссовки Nike для любой погоды', 
    sizes: ['39', '40', '41', '42', '43'], 
    colors: ['Зеленый', 'Черный'], 
    colorHex: ['#7FB069', '#1a2e2a'],
    category: 'Кроссовки', 
    gender: 'Men',
    inStock: 9, 
    rating: 5.0, 
    brand: 'NIKE',
    isNew: true,
    isTrending: true
  },
  { 
    id: 10, 
    name: 'Winter Tech Parka', 
    price: 32900, 
    oldPrice: 42000,
    image: fashionImg2, 
    hoverImage: fashionImg2,
    description: 'Зимняя парка Nike ACG с утеплителем премиум класса', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Хаки'], 
    colorHex: ['#1a2e2a', '#9CAF88'],
    category: 'Куртки', 
    gender: 'Woman',
    inStock: 6, 
    rating: 5.0, 
    brand: 'NIKE',
    isNew: true
  },
];

const categories = ['Все', 'Куртки', 'Кроссовки', 'Худи'];
const genderFilters = ['All', 'Men', 'Woman'];

function RascalStore({ activeTab }: RascalStoreProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [showCheckout, setShowCheckout] = useState<boolean>(false);

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
    if (activeTab !== 'home') {
      setSelectedGender('All');
    }
    if (activeTab !== 'cart') {
      setShowCheckout(false);
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
    setShowCheckout(false);
  };

  if (activeTab === 'catalog' && selectedProduct) {
    const bgColor = selectedProduct.colorHex[selectedProduct.colors.indexOf(selectedColor)] || '#1a2e2a';
    
    return (
      <div className="min-h-screen text-white overflow-auto" style={{ backgroundColor: bgColor }}>
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
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full mb-3">
              <span className="text-xs font-bold tracking-wider">NIKE • Rascal®</span>
            </div>
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
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {selectedProduct.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all ${
                    selectedSize === size
                      ? 'text-black'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  style={selectedSize === size ? { backgroundColor: '#7FB069' } : {}}
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
                className="w-full text-black font-bold py-4 rounded-full transition-all hover:opacity-90"
                style={{ backgroundColor: '#7FB069' }}
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

  if (activeTab === 'home') {
    return (
      <div className="min-h-screen text-white overflow-auto pb-24" style={{ backgroundColor: '#1a2e2a' }}>
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <Menu className="w-6 h-6" data-testid="button-menu" />
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" data-testid="button-view-cart" />
              <Heart className="w-6 h-6" data-testid="button-view-favorites" />
            </div>
          </div>

          <div className="mb-6 scroll-fade-in">
            <h1 className="text-4xl font-black mb-1 tracking-tight">
              Hello Pixie<br/>
              <span style={{ color: '#7FB069' }}>Rascal Collection</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 mb-6 scroll-fade-in">
            <button 
              className="p-2 rounded-full"
              style={{ backgroundColor: '#7FB069' }}
              data-testid="button-view-home"
            >
              <svg className="w-5 h-5" fill="#1a2e2a" viewBox="0 0 20 20">
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
            <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-full px-4 py-3 flex items-center gap-2">
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

        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden scroll-fade-in" style={{ height: '500px' }}>
          <img
            src={fashionImg1}
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1a2e2a">
                    <path d="M12.4,2.2c-5.6,0-10.2,4.6-10.2,10.2s4.6,10.2,10.2,10.2c5.6,0,10.2-4.6,10.2-10.2S18,2.2,12.4,2.2z M12.4,20.3c-4.4,0-8-3.6-8-8c0-4.4,3.6-8,8-8s8,3.6,8,8C20.4,16.7,16.8,20.3,12.4,20.3z"/>
                  </svg>
                </div>
                <span className="text-lg font-bold">NIKE • Rascal®</span>
              </div>
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
                  backgroundColor: '#7FB069',
                  boxShadow: '0 0 30px rgba(127, 176, 105, 0.4)'
                }}
                data-testid="button-hero-shop-now"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {filteredProducts.slice(0, 3).map((product, idx) => (
            <m.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openProduct(product)}
              className={`relative cursor-pointer group rounded-3xl overflow-hidden ${idx === 0 ? 'scroll-fade-in' : ''}`}
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

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full">
                  <span className="text-xs font-semibold text-white">
                    {product.isNew ? 'New' : product.category}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(product.id);
                }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
                data-testid={`button-favorite-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {product.name.split(' ').slice(0, 2).join(' ')}<br/>
                      {product.name.split(' ').slice(2).join(' ')}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">{product.gender}'s wear</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(product);
                    }}
                    className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ backgroundColor: '#7FB069' }}
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-lg font-bold">{formatPrice(product.price)}</p>
                </div>
              </div>
            </m.div>
          ))}
        </div>

        <div className="h-8"></div>
      </div>
    );
  }

  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen text-white overflow-auto pb-24" style={{ backgroundColor: '#1a2e2a' }}>
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
                    ? 'text-black'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                style={selectedCategory === cat ? { backgroundColor: '#7FB069' } : {}}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, index) => (
              <m.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className={`relative cursor-pointer ${index < 4 ? '' : `scroll-fade-in-delay-${Math.min((index - 4) % 3 + 1, 3)}`}`}
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-white/5">
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
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
                    data-testid={`button-favorite-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 text-black text-xs font-bold rounded-full" style={{ backgroundColor: '#7FB069' }}>
                      NEW
                    </div>
                  )}
                </div>

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

  if (activeTab === 'cart') {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (showCheckout) {
      return (
        <div className="min-h-screen text-white overflow-auto pb-32" style={{ backgroundColor: '#1a2e2a' }}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setShowCheckout(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                data-testid="button-back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold">Оформление заказа</h1>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" style={{ color: '#7FB069' }} />
                  Контактная информация
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Имя Фамилия"
                    className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                    data-testid="input-name"
                  />
                  <input
                    type="tel"
                    placeholder="+7 (999) 123-45-67"
                    className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                    data-testid="input-phone"
                  />
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: '#7FB069' }} />
                  Адрес доставки
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Город"
                    className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                    data-testid="input-city"
                  />
                  <input
                    type="text"
                    placeholder="Улица, дом, квартира"
                    className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                    data-testid="input-address"
                  />
                  <input
                    type="text"
                    placeholder="Индекс"
                    className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                    data-testid="input-zip"
                  />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" style={{ color: '#7FB069' }} />
                  Оплата
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Номер карты"
                    className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                    data-testid="input-card-number"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="ММ/ГГ"
                      className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                      data-testid="input-card-expiry"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="w-full bg-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/50 outline-none"
                      data-testid="input-card-cvv"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Товары ({cart.length})</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Доставка</span>
                  <span className="font-semibold">Бесплатно</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">Итого:</span>
                    <span className="text-2xl font-bold">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <ConfirmDrawer
                trigger={
                  <button
                    className="w-full text-black font-bold py-4 rounded-full transition-all hover:opacity-90"
                    style={{ backgroundColor: '#7FB069' }}
                    data-testid="button-confirm-order"
                  >
                    Подтвердить заказ
                  </button>
                }
                title="Подтвердить заказ?"
                description={`${cart.length} товаров на сумму ${formatPrice(cartTotal)}`}
                confirmText="Подтвердить"
                cancelText="Отмена"
                variant="default"
                onConfirm={handleCheckout}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen text-white overflow-auto pb-32" style={{ backgroundColor: '#1a2e2a' }}>
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
                    className="w-8 h-8"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 border-t border-white/10" style={{ backgroundColor: '#1a2e2a' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full text-black font-bold py-4 rounded-full transition-all hover:opacity-90"
                  style={{ backgroundColor: '#7FB069' }}
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

  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen text-white overflow-auto pb-24" style={{ backgroundColor: '#1a2e2a' }}>
        <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, #7FB069 0%, #5A8C4A 100%)'
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
                      <span className="font-bold" style={{ color: '#7FB069' }}>{formatPrice(order.total)}</span>
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
            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-favorites">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-white/70" />
                <span className="font-medium">Избранное</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-payment">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-white/70" />
                <span className="font-medium">Способы оплаты</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-address">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/70" />
                <span className="font-medium">Адреса доставки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all" data-testid="button-settings">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-white/70" />
                <span className="font-medium">Настройки</span>
              </div>
              <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
            </button>

            <div className="pt-4">
              <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-red-500/20 transition-all" data-testid="button-logout">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Выйти из аккаунта</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1a2e2a">
                  <path d="M12.4,2.2c-5.6,0-10.2,4.6-10.2,10.2s4.6,10.2,10.2,10.2c5.6,0,10.2-4.6,10.2-10.2S18,2.2,12.4,2.2z M12.4,20.3c-4.4,0-8-3.6-8-8c0-4.4,3.6-8,8-8s8,3.6,8,8C20.4,16.7,16.8,20.3,12.4,20.3z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">NIKE • Rascal®</p>
                <p className="text-sm text-white/60">Premium Collection</p>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-4">
              Присоединяйтесь к программе лояльности Nike и получайте эксклюзивные предложения!
            </p>
            <button
              className="w-full text-black font-bold py-3 rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: '#7FB069' }}
              data-testid="button-join-loyalty"
            >
              Узнать больше
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default RascalStore;
```

### LabSurvivalist.tsx
```tsx
import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Shield, Target, Check } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { useFilter } from "@/hooks/useFilter";
import { Skeleton } from "@/components/ui/skeleton";
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

const getDelayClass = (index: number) => {
  const delays = ['scroll-fade-in', 'scroll-fade-in-delay-1', 'scroll-fade-in-delay-2', 'scroll-fade-in-delay-3', 'scroll-fade-in-delay-4', 'scroll-fade-in-delay-5'];
  return delays[index % delays.length];
};

function LabSurvivalist({ activeTab }: LabSurvivalistProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: products,
    searchFields: ['name', 'description', 'category', 'brand'] as (keyof Product)[],
  });

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), id]));
  };

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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
    setShowOrderSuccess(true);
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
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
            data-testid={`button-favorite-${selectedProduct.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedProduct.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] scroll-fade-in">
          <img
            src={selectedProduct.hoverImage}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="bg-gradient-to-b from-black/95 to-black backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32 -mt-20 relative z-10 scroll-fade-in-delay-1">
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

          <p className="text-sm text-white/70 text-center leading-relaxed scroll-fade-in-delay-2">{selectedProduct.description}</p>

          <div className="border-t border-white/10 pt-6 scroll-fade-in-delay-3">
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

          <div className="border-t border-white/10 pt-6 scroll-fade-in-delay-4">
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

          <ConfirmDrawer
            trigger={
              <button
                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-white/90 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2 scroll-fade-in-delay-5"
                data-testid={`button-add-to-cart-${selectedProduct.id}`}
              >
                <ShoppingBag className="w-5 h-5" />
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

  // HOME PAGE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-black text-white overflow-auto pb-24">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <Menu className="w-6 h-6" data-testid="button-view-menu" />
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" data-testid="button-view-cart" />
              <Heart className="w-6 h-6" data-testid="button-view-favorites" />
            </div>
          </div>

          <div className="mb-8 scroll-fade-in">
            <h1 className="text-6xl font-black mb-1 tracking-tighter leading-none">
              SURVIVALIST
            </h1>
            <h2 className="text-4xl font-light tracking-[0.3em] text-white/60">
              LAB
            </h2>
          </div>

          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide scroll-fade-in">
            <button 
              className="p-2 bg-white rounded-lg flex-shrink-0"
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
                className={`text-sm font-mono uppercase tracking-wider transition-colors flex-shrink-0 ${
                  selectedGender === gender
                    ? 'text-white'
                    : 'text-white/30'
                }`}
                data-testid={`button-filter-${gender.toLowerCase()}`}
              >
                {gender}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6 scroll-fade-in">
            <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-lg px-4 py-3 flex items-center gap-2 border border-white/10">
              <Search className="w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Поиск снаряжения..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent text-white placeholder:text-white/40 outline-none flex-1 text-sm font-mono"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="relative mb-6 mx-6 rounded-2xl overflow-hidden border border-white/10 scroll-fade-in" style={{ height: '500px' }}>
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
                data-testid="button-view-collection"
              >
                Смотреть коллекцию
              </button>
            </m.div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {filteredProducts.slice(0, 3).map((product, idx) => (
            <m.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => openProduct(product)}
              className="relative cursor-pointer group rounded-2xl overflow-hidden border border-white/10 scroll-fade-in"
              style={{ height: idx === 0 ? '400px' : '320px' }}
              data-testid={`card-product-${product.id}`}
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
                data-testid={`button-favorite-${product.id}`}
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
                    data-testid={`button-add-to-cart-${product.id}`}
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
      </div>
    );
  }

  // CATALOG PAGE
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-black text-white overflow-auto pb-24">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-3xl font-black tracking-tight">КАТАЛОГ</h1>
            <div className="flex items-center gap-3">
              <button className="p-2" data-testid="button-view-search">
                <Search className="w-6 h-6" />
              </button>
              <button className="p-2" data-testid="button-view-filter">
                <Filter className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide scroll-fade-in">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-lg text-sm font-mono font-semibold whitespace-nowrap transition-all border uppercase tracking-wider ${
                  selectedCategory === cat
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'
                }`}
                data-testid={`button-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product, idx) => (
              <m.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className={`relative cursor-pointer ${idx < 4 ? 'scroll-fade-in' : getDelayClass(idx)}`}
                data-testid={`card-product-${product.id}`}
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
                    data-testid={`button-favorite-${product.id}`}
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
          <h1 className="text-3xl font-black mb-6 tracking-tight scroll-fade-in">КОРЗИНА</h1>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 scroll-fade-in-delay-1">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <ShoppingBag className="w-10 h-10 text-white/20" />
              </div>
              <p className="text-white/40 text-center font-mono">Ваша корзина пуста</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/10 ${idx < 2 ? 'scroll-fade-in' : getDelayClass(idx)}`}
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
                <ConfirmDrawer
                  trigger={
                    <button
                      className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-white/90 transition-all uppercase tracking-wider text-sm"
                      data-testid="button-checkout"
                    >
                      Оформить заказ
                    </button>
                  }
                  title="Оформить заказ?"
                  description={`${cart.length} товаров на сумму ${formatPrice(total)}`}
                  confirmText="Подтвердить"
                  cancelText="Отмена"
                  variant="default"
                  onConfirm={handleCheckout}
                />
              </div>

              <ConfirmDrawer
                open={showOrderSuccess}
                onOpenChange={setShowOrderSuccess}
                trigger={<span />}
                title="Заказ оформлен!"
                description="Ваш заказ успешно создан и передан в обработку. Вы можете отслеживать статус в разделе 'Мои заказы'"
                confirmText="Отлично"
                cancelText=""
                variant="default"
                onConfirm={() => setShowOrderSuccess(false)}
                icon={<Check className="w-8 h-8 text-emerald-400" />}
              />
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
        <div className="p-6 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border-b border-white/10 scroll-fade-in">
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
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 scroll-fade-in">
              <p className="text-sm text-white/60 mb-1 font-mono uppercase tracking-wider">Заказы</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 scroll-fade-in">
              <p className="text-sm text-white/60 mb-1 font-mono uppercase tracking-wider">Избранное</p>
              <p className="text-2xl font-bold">{favorites.size}</p>
            </div>
          </div>
        </div>

        <div className="p-4 scroll-fade-in">
          <h3 className="text-lg font-bold mb-4 font-mono uppercase tracking-wider">Мои заказы</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-mono">У вас пока нет заказов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10" data-testid={`order-${order.id}`}>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-sm font-mono">Заказ #{order.id.toString().slice(-6)}</span>
                    <span className="text-white/60 text-sm font-mono">{order.date}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-white/70 font-mono">{order.items.length} товаров</span>
                    <span className="font-bold">{formatPrice(order.total)}</span>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-mono">
                      {order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-1" data-testid="button-view-orders">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Мои заказы</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-2" data-testid="button-view-favorites">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-3" data-testid="button-view-payment">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-4" data-testid="button-view-address">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-5" data-testid="button-view-settings">
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
```

### NikeACG.tsx
```tsx
import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Search, Menu, ChevronUp, ChevronDown, Check } from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { useFilter } from "@/hooks/useFilter";
import { Skeleton } from "@/components/ui/skeleton";
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
  onTabChange?: (tab: 'home' | 'catalog' | 'cart' | 'profile') => void;
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

const getDelayClass = (index: number) => {
  const delays = ['scroll-fade-in', 'scroll-fade-in-delay-1', 'scroll-fade-in-delay-2', 'scroll-fade-in-delay-3', 'scroll-fade-in-delay-4', 'scroll-fade-in-delay-5'];
  return delays[index % delays.length];
};

function NikeACG({ activeTab, onTabChange }: NikeACGProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: products,
    searchFields: ['name', 'description', 'category'] as (keyof Product)[],
  });

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), id]));
  };

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
  }, [activeTab]);

  const filteredProducts = filteredItems.filter(p => {
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

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setCart([]);
    setShowOrderSuccess(true);
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
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
            data-testid={`button-favorite-${selectedProduct.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${favorites.has(selectedProduct.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] scroll-fade-in">
          <img
            src={selectedProduct.hoverImage}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        <div className="bg-[#2D3748] rounded-t-3xl p-6 space-y-6 pb-32 -mt-8 relative z-10 scroll-fade-in-delay-1">
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

          <p className="text-sm text-white/80 text-center leading-relaxed scroll-fade-in-delay-2">{selectedProduct.description}</p>

          <div className="scroll-fade-in-delay-3">
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

          <div className="scroll-fade-in-delay-4">
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

          <ConfirmDrawer
            trigger={
              <button
                className="w-full bg-white text-black font-black py-5 rounded-full hover:bg-white/90 transition-all text-lg tracking-wider shadow-xl scroll-fade-in-delay-5"
                data-testid={`button-add-to-cart-${selectedProduct.id}`}
              >
                ДОБАВИТЬ В КОРЗИНУ
              </button>
            }
            title={`${selectedProduct.name} добавлен`}
            description={`Размер: ${selectedSize} • Цвет: ${selectedColor} • ${formatPrice(selectedProduct.price)}`}
            confirmText="Перейти в корзину"
            cancelText="Продолжить покупки"
            onConfirm={() => {
              addToCart();
              onTabChange?.('cart');
            }}
            onCancel={addToCart}
          />
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#2D3748] text-white overflow-auto pb-24">
        <div className="relative h-screen scroll-fade-in">
          <div className="absolute inset-0">
            <img
              src={img1}
              alt="ACG Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#2D3748]"></div>
          </div>

          <div className="relative h-full flex flex-col items-center justify-center p-8">
            <m.div
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
              <button 
                className="px-10 py-5 bg-white text-black font-black rounded-full text-lg hover:bg-white/90 transition-all shadow-2xl tracking-wider"
                data-testid="button-view-explore"
              >
                ИССЛЕДОВАТЬ
              </button>
            </m.div>
          </div>

          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-white/50" />
          </div>
        </div>

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
            <m.div
              key={item.product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              onClick={() => openProduct(item.product)}
              className="relative cursor-pointer rounded-3xl overflow-hidden shadow-2xl scroll-fade-in"
              style={{ 
                backgroundColor: item.bg,
                minHeight: '500px'
              }}
              data-testid={`card-product-${item.product.id}`}
            >
              <div className="grid grid-cols-2 h-full">
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
                    data-testid={`button-add-to-cart-${item.product.id}`}
                  >
                    КУПИТЬ
                  </button>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item.product.id);
                }}
                className="absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{ 
                  backgroundColor: item.bg === '#FFFFFF' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' 
                }}
                data-testid={`button-favorite-${item.product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${favorites.has(item.product.id) ? 'fill-current' : ''}`}
                  style={{ color: item.text }}
                />
              </button>
            </m.div>
          ))}
        </div>

        <div className="px-6 pb-12">
          <h2 className="text-3xl font-black mb-8 tracking-tight scroll-fade-in">ВСЕ ПРОДУКТЫ</h2>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(3).map((product, idx) => (
              <m.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className={`relative cursor-pointer ${getDelayClass(idx)}`}
                data-testid={`card-product-${product.id}`}
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
                    data-testid={`button-favorite-${product.id}`}
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
              </m.div>
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
          <div className="flex items-center justify-between mb-8 scroll-fade-in">
            <div>
              <div className="text-xs font-bold tracking-[0.3em] text-white/60 mb-1">NIKE</div>
              <h1 className="text-3xl font-black tracking-tight">ACG カタログ</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all" data-testid="button-view-search">
                <Search className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all" data-testid="button-view-filter">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-8 scroll-fade-in">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full py-4 px-6 rounded-full text-left font-bold text-sm transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
                }`}
                data-testid={`button-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
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

          <div className="grid grid-cols-2 gap-5">
            {filteredProducts.map((product, idx) => (
              <m.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className={`relative cursor-pointer ${idx < 4 ? 'scroll-fade-in' : getDelayClass(idx)}`}
                data-testid={`card-product-${product.id}`}
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
                    data-testid={`button-favorite-${product.id}`}
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
      <div className="min-h-screen bg-[#2D3748] text-white overflow-auto pb-32">
        <div className="p-6">
          <div className="mb-8 scroll-fade-in">
            <div className="text-xs font-bold tracking-[0.3em] text-white/60 mb-1">NIKE ACG</div>
            <h1 className="text-3xl font-black tracking-tight">カート</h1>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 scroll-fade-in-delay-1">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
                <ShoppingBag className="w-12 h-12 text-white/30" />
              </div>
              <p className="text-white/50 text-center font-medium">Ваша корзина пуста</p>
              <p className="text-white/30 text-sm text-center mt-2">Добавьте товары для оформления заказа</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-black/20 backdrop-blur-xl rounded-2xl p-5 flex gap-4 border border-white/10 ${idx < 2 ? 'scroll-fade-in' : getDelayClass(idx)}`}
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
                <ConfirmDrawer
                  trigger={
                    <button
                      className="w-full bg-white text-black font-black py-5 rounded-full hover:bg-white/90 transition-all text-lg tracking-widest shadow-xl"
                      data-testid="button-checkout"
                    >
                      ОФОРМИТЬ ЗАКАЗ
                    </button>
                  }
                  title="Оформить заказ?"
                  description={`${cart.length} товаров на сумму ${formatPrice(total)}`}
                  confirmText="Подтвердить"
                  cancelText="Отмена"
                  variant="default"
                  onConfirm={handleCheckout}
                />
              </div>

              <ConfirmDrawer
                open={showOrderSuccess}
                onOpenChange={setShowOrderSuccess}
                trigger={<span />}
                title="Заказ оформлен!"
                description="Ваш заказ успешно создан и передан в обработку. Вы можете отслеживать статус в разделе 'Мои заказы'"
                confirmText="Отлично"
                cancelText=""
                variant="default"
                onConfirm={() => setShowOrderSuccess(false)}
                icon={<Check className="w-8 h-8 text-emerald-400" />}
              />
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
        <div className="p-6 bg-black/20 backdrop-blur-xl border-b border-white/10 scroll-fade-in">
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
            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 scroll-fade-in">
              <p className="text-xs text-white/60 mb-2 font-bold tracking-widest">ЗАКАЗЫ</p>
              <p className="text-3xl font-black">{orders.length}</p>
            </div>
            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 scroll-fade-in">
              <p className="text-xs text-white/60 mb-2 font-bold tracking-widest">ИЗБРАННОЕ</p>
              <p className="text-3xl font-black">{favorites.size}</p>
            </div>
          </div>
        </div>

        <div className="p-6 scroll-fade-in">
          <h3 className="text-lg font-black mb-4 tracking-wide">МОИ ЗАКАЗЫ</h3>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>У вас пока нет заказов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20" data-testid={`order-${order.id}`}>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-sm font-bold">Заказ #{order.id.toString().slice(-6)}</span>
                    <span className="text-white/60 text-sm">{order.date}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-3">
                    <span className="text-white/70">{order.items.length} товаров</span>
                    <span className="font-black text-lg">{formatPrice(order.total)}</span>
                  </div>
                  <div>
                    <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                      {order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 space-y-3">
          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all scroll-fade-in-delay-1" data-testid="button-view-orders">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Мои заказы</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all scroll-fade-in-delay-2" data-testid="button-view-favorites">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all scroll-fade-in-delay-3" data-testid="button-view-payment">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all scroll-fade-in-delay-4" data-testid="button-view-address">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/50" />
          </button>

          <button className="w-full p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center justify-between hover:bg-white/20 transition-all scroll-fade-in-delay-5" data-testid="button-view-settings">
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
```

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
import { useState, Suspense, memo, useEffect } from "react";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";
import { demoApps } from "../data/demoApps";
import { useTelegram } from "../hooks/useTelegram";
import { getDemoComponent, isDemoAvailable } from "./demos/DemoRegistry";
import { LiquidHomeButton } from "./ui/liquid-home-button";

interface DemoAppShellProps {
  demoId: string;
  onClose: () => void;
}

type TabType = 'home' | 'catalog' | 'cart' | 'profile';

const navItems: { id: TabType; icon: any; label: string }[] = [
  { id: 'home', icon: Home, label: 'Главная' },
  { id: 'catalog', icon: Grid3X3, label: 'Каталог' },
  { id: 'cart', icon: ShoppingCart, label: 'Корзина' },
  { id: 'profile', icon: User, label: 'Профиль' },
];

const DemoAppShell = memo(function DemoAppShell({ demoId, onClose }: DemoAppShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { hapticFeedback } = useTelegram();
  
  // Scroll to top when demo opens - single optimized call
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, [demoId]);
  
  // Extract base app type from ID to support variants (e.g., 'clothing-store-2' → 'clothing-store')
  const getBaseAppType = (id: string): string => {
    // Remove variant suffixes (-2, -3, etc.) to get base type
    return id.replace(/-\d+$/, '');
  };

  // Find demo app - first try exact match, then base type fallback
  const demoApp = demoApps.find(app => app.id === demoId) || 
                  demoApps.find(app => app.id === getBaseAppType(demoId));
  
  if (!demoApp) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mx-4 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Демо не найдено</h3>
          <p className="text-sm text-white/50">
            Приложение временно недоступно
          </p>
        </div>
      </div>
    );
  }

  const handleTabSwitch = (tab: TabType) => {
    setActiveTab(tab);
    if (hapticFeedback?.selection) {
      hapticFeedback.selection();
    }
  };

  const handleStringNavigation = (tab: string) => {
    const tabType = tab as TabType;
    handleTabSwitch(tabType);
  };

  // Navigate to main app (showcase page) using hash-based routing
  const handleNavigateHome = () => {
    window.location.hash = '#/';
    if (hapticFeedback?.medium) {
      hapticFeedback.medium();
    }
  };

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
            <h3 className="text-lg font-semibold text-white mb-2">Демо недоступно</h3>
            <p className="text-sm text-white/50">
              Приложение {baseAppType} временно недоступно
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
            <h3 className="text-lg font-semibold text-white mb-2">Ошибка загрузки</h3>
            <p className="text-sm text-white/50">
              Не удалось загрузить приложение
            </p>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={null}>
        <DemoComponent activeTab={activeTab} onTabChange={handleStringNavigation} />
      </Suspense>
    );
    
  };

  // All apps use dark theme by default for premium look
  const isDarkTheme = true;
  
  // Theme colors for each app
  const getThemeColors = () => {
    if (demoId.includes('clothing-store')) {
      return {
        accentColor: '#C5E1A5',
        glowColor: 'rgba(197, 225, 165, 0.6)',
      };
    } else if (demoId.includes('electronics')) {
      return {
        accentColor: '#00D4FF',
        glowColor: 'rgba(0, 212, 255, 0.6)',
      };
    } else if (demoId.includes('beauty')) {
      return {
        accentColor: '#EC4899',
        glowColor: 'rgba(236, 72, 153, 0.6)',
      };
    } else if (demoId.includes('restaurant')) {
      return {
        accentColor: '#D97706',
        glowColor: 'rgba(217, 119, 6, 0.6)',
      };
    }
    return {
      accentColor: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.6)',
    };
  };
  
  const theme = getThemeColors();
  
  // Get background gradient based on app - all dark by default
  const getBackgroundGradient = () => {
    // All demos use pure black background for consistent dark premium look
    return 'bg-[#0A0A0A]';
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkTheme ? 'bg-[#0A0A0A]' : 'bg-gray-100'}`}>
      {/* Mobile Container - Max width for desktop view */}
      <div className={`w-full max-w-md mx-auto ${isDarkTheme ? getBackgroundGradient() : 'bg-white'} min-h-screen flex flex-col relative shadow-2xl`}>
        
        {/* Demo Content Area - Telegram safe area bottom */}
        <div className="flex-1 tg-content-safe-bottom" style={{ paddingBottom: 'max(6rem, var(--csab, 0px))' }} data-testid="demo-content">
          {renderDemoContent()}
        </div>

        {/* Sticky Home Button */}
        <div 
          className="sticky right-5 z-50 pointer-events-none"
          style={{
            bottom: 'calc(100px + max(0px, env(safe-area-inset-bottom, 0px)))',
            marginLeft: 'auto',
            width: 'fit-content'
          }}
        >
          <div className="pointer-events-auto">
            <LiquidHomeButton onNavigateHome={handleNavigateHome} />
          </div>
        </div>
      </div>

      {/* Liquid Glass Bottom Navigation - Same style as main page */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-auto">
        <div className="relative">
          {/* Animated Background Glow */}
          <div 
            className="absolute -inset-2 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${theme.glowColor} 0%, ${theme.glowColor.replace('0.6', '0.2')} 50%, transparent 70%)`,
              filter: 'blur(20px)',
              animation: 'pulse 3s ease-in-out infinite',
            }}
          />
          
          {/* Liquid Glass Container */}
          <div 
            className={`relative backdrop-blur-xl rounded-full border px-4 py-3 shadow-2xl ${
              isDarkTheme 
                ? 'border-white/20' 
                : 'border-white/30'
            }`}
            style={{
              background: isDarkTheme 
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)',
              boxShadow: isDarkTheme 
                ? `0 8px 32px rgba(0, 0, 0, 0.6),
                   inset 0 1px 0 rgba(255, 255, 255, 0.2),
                   inset 0 -1px 0 rgba(0, 0, 0, 0.3),
                   0 0 60px ${theme.glowColor.replace('0.6', '0.15')}`
                : `0 8px 32px rgba(0, 0, 0, 0.4),
                   inset 0 1px 0 rgba(255, 255, 255, 0.3),
                   inset 0 -1px 0 rgba(0, 0, 0, 0.2),
                   0 0 60px ${theme.glowColor.replace('0.6', '0.2')}`,
            }}
          >
            {/* Inner Highlight */}
            <div 
              className="absolute top-1 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
            />
            
            <nav className="relative flex items-center justify-center gap-2" role="navigation" aria-label="Навигация демо">
              {/* Liquid Glass Blob - анимированная капля под активной иконкой */}
              <div 
                className="absolute transition-all duration-500 ease-out pointer-events-none"
                style={{
                  left: activeTab === 'home' ? '-2px' :
                        activeTab === 'catalog' ? '54px' :
                        activeTab === 'cart' ? '110px' :
                        activeTab === 'profile' ? '166px' : '-2px',
                  top: '-2px',
                  width: '52px',
                  height: '52px',
                  zIndex: 1,
                }}
              >
                {/* Основной слой капли */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse 100% 90% at 50% 45%, ${theme.glowColor.replace('0.6', '0.35')} 0%, ${theme.glowColor.replace('0.6', '0.22')} 40%, transparent 70%)`,
                    borderRadius: '45% 55% 50% 50% / 50% 50% 45% 55%',
                    filter: 'blur(12px)',
                    animation: 'liquid-morph 4s ease-in-out infinite',
                  }}
                />
                {/* Второй слой капли */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at center, ${theme.glowColor.replace('0.6', '0.28')} 0%, ${theme.glowColor.replace('0.6', '0.15')} 50%, transparent 70%)`,
                    borderRadius: '50% 45% 55% 50% / 55% 50% 50% 45%',
                    filter: 'blur(16px)',
                    animation: 'liquid-morph-reverse 5s ease-in-out infinite',
                  }}
                />
                {/* Внутреннее свечение */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at center, ${theme.glowColor.replace('0.6', '0.4')} 0%, ${theme.glowColor.replace('0.6', '0.18')} 30%, transparent 60%)`,
                    borderRadius: '50%',
                    filter: 'blur(8px)',
                  }}
                />
              </div>
              
              {/* Главная */}
              <button
                onClick={() => handleTabSwitch('home')}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-white/10'
                }`}
                style={{ zIndex: 10 }}
                aria-label="Главная"
                aria-current={activeTab === 'home' ? 'page' : undefined}
                data-testid="nav-home"
              >
                <Home
                  className={`transition-all duration-300 ${
                    activeTab === 'home' 
                      ? 'w-6 h-6' 
                      : 'w-5 h-5'
                  } ${
                    isDarkTheme 
                      ? (activeTab === 'home' ? 'text-white' : 'text-white/70 hover:text-white')
                      : (activeTab === 'home' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }`}
                  strokeWidth={2}
                />
              </button>
              
              {/* Каталог */}
              <button
                onClick={() => handleTabSwitch('catalog')}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-white/10'
                }`}
                style={{ zIndex: 10 }}
                aria-label="Каталог"
                aria-current={activeTab === 'catalog' ? 'page' : undefined}
                data-testid="nav-catalog"
              >
                <Grid3X3
                  className={`transition-all duration-300 ${
                    activeTab === 'catalog' 
                      ? 'w-6 h-6' 
                      : 'w-5 h-5'
                  } ${
                    isDarkTheme 
                      ? (activeTab === 'catalog' ? 'text-white' : 'text-white/70 hover:text-white')
                      : (activeTab === 'catalog' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }`}
                  strokeWidth={2}
                />
              </button>
              
              {/* Корзина */}
              <button
                onClick={() => handleTabSwitch('cart')}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-white/10'
                }`}
                style={{ zIndex: 10 }}
                aria-label="Корзина"
                aria-current={activeTab === 'cart' ? 'page' : undefined}
                data-testid="nav-cart"
              >
                <ShoppingCart
                  className={`transition-all duration-300 ${
                    activeTab === 'cart' 
                      ? 'w-6 h-6' 
                      : 'w-5 h-5'
                  } ${
                    isDarkTheme 
                      ? (activeTab === 'cart' ? 'text-white' : 'text-white/70 hover:text-white')
                      : (activeTab === 'cart' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }`}
                  strokeWidth={2}
                />
              </button>
              
              {/* Профиль */}
              <button
                onClick={() => handleTabSwitch('profile')}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-white/10'
                }`}
                style={{ zIndex: 10 }}
                aria-label="Профиль"
                aria-current={activeTab === 'profile' ? 'page' : undefined}
                data-testid="nav-profile"
              >
                <User
                  className={`transition-all duration-300 ${
                    activeTab === 'profile' 
                      ? 'w-6 h-6' 
                      : 'w-5 h-5'
                  } ${
                    isDarkTheme 
                      ? (activeTab === 'profile' ? 'text-white' : 'text-white/70 hover:text-white')
                      : (activeTab === 'profile' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900')
                  }`}
                  strokeWidth={2}
                />
              </button>
              
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DemoAppShell;
```

### DemoRegistry.ts (реестр демо)
```tsx
// Dynamic demo registry for lazy loading
import { lazy, ComponentType } from 'react';

// Type for demo components
export interface DemoComponent {
  component: ComponentType<any>;
  preload?: () => Promise<{ default: ComponentType<any> }>;
}

// Demo registry with lazy loading
export const demoRegistry: Record<string, DemoComponent> = {
  'clothing-store': {
    component: lazy(() => import('./PremiumFashionStore')),
    preload: () => import('./PremiumFashionStore')
  },
  'premium-fashion': {
    component: lazy(() => import('./PremiumFashionStore')),
    preload: () => import('./PremiumFashionStore')
  },
  'electronics': {
    component: lazy(() => import('./Electronics')),
    preload: () => import('./Electronics')
  },
  'beauty': {
    component: lazy(() => import('./Beauty')),
    preload: () => import('./Beauty')
  },
  'restaurant': {
    component: lazy(() => import('./Restaurant')),
    preload: () => import('./Restaurant')
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
  'florist': {
    component: lazy(() => import('./Florist')),
    preload: () => import('./Florist')
  },
  'tea-house': {
    component: lazy(() => import('./TeaHouse')),
    preload: () => import('./TeaHouse')
  },
  'sneaker-vault': {
    component: lazy(() => import('./SneakerVault')),
    preload: () => import('./SneakerVault')
  },
  'fragrance-royale': {
    component: lazy(() => import('./FragranceRoyale')),
    preload: () => import('./FragranceRoyale')
  },
  'time-elite': {
    component: lazy(() => import('./TimeElite')),
    preload: () => import('./TimeElite')
  },
  'interior-lux': {
    component: lazy(() => import('./InteriorLux')),
    preload: () => import('./InteriorLux')
  },
  
  // Aliases for compatibility with demoApps.ts IDs
  'luxury-watches': {
    component: lazy(() => import('./TimeElite')),
    preload: () => import('./TimeElite')
  },
  'home-decor': {
    component: lazy(() => import('./InteriorLux')),
    preload: () => import('./InteriorLux')
  },
  'sneaker-store': {
    component: lazy(() => import('./SneakerVault')),
    preload: () => import('./SneakerVault')
  },
  'premium-tea': {
    component: lazy(() => import('./TeaHouse')),
    preload: () => import('./TeaHouse')
  },
  'luxury-perfume': {
    component: lazy(() => import('./FragranceRoyale')),
    preload: () => import('./FragranceRoyale')
  },
  
  // Futuristic Fashion Collection (4 premium full stores)
  'futuristic-fashion-1': {
    component: lazy(() => import('./RascalStore')),
    preload: () => import('./RascalStore')
  },
  'futuristic-fashion-2': {
    component: lazy(() => import('./StoreBlack')),
    preload: () => import('./StoreBlack')
  },
  'futuristic-fashion-3': {
    component: lazy(() => import('./LabSurvivalist')),
    preload: () => import('./LabSurvivalist')
  },
  'futuristic-fashion-4': {
    component: lazy(() => import('./NikeACG')),
    preload: () => import('./NikeACG')
  },
  
  // Premium Design Collection - New Apps
  'oxyz-nft': {
    component: lazy(() => import('./OxyzNFT')),
    preload: () => import('./OxyzNFT')
  },
  'emily-carter-ai': {
    component: lazy(() => import('./EmilyCarterAI')),
    preload: () => import('./EmilyCarterAI')
  }
};

// Preload critical demos (reduced to essential only for performance)
export const preloadCriticalDemos = () => {
  const criticalDemos = ['clothing-store', 'electronics']; // Reduced from 4 to 2 most critical
  
  criticalDemos.forEach(demoId => {
    const demo = demoRegistry[demoId];
    if (demo?.preload) {
      // Preload on requestIdleCallback with delay to not block initial render
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          setTimeout(() => demo.preload!(), 200); // Additional delay
        });
      } else {
        // Fallback with longer delay
        setTimeout(() => demo.preload!(), 500);
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

// Preload a specific demo component on hover
export const preloadDemo = (demoId: string): void => {
  const demo = demoRegistry[demoId];
  if (demo?.preload) {
    demo.preload().catch(() => {
      // Silently fail if preload fails
    });
  }
};```

### demoApps.ts (данные приложений)
```tsx
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
    id: 'clothing-store',
    title: 'Radiance',
    description: 'Магазин модной одежды и аксессуаров',
    category: 'Электронная коммерция',
    image: '/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg',
    creator: 'WEB4TG',
    likes: '12.3k',
    badge: 'Premium',
    badgeColor: 'bg-black',
    home: {
      hero: {
        title: 'Digital Fashion',
        subtitle: 'Sharp design. Strong brands. Clear meaning.',
        image: '/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg',
        bgClass: 'bg-black'
      },
      banners: [
        {
          title: 'Digital Collection',
          subtitle: 'Radiance.Family',
          image: '/attached_assets/4659a0f48988f601b98b2cec6406c739_1762127566273.jpg',
          bgClass: 'bg-black'
        },
        {
          title: 'Premium Design',
          subtitle: 'Beautiful & meaningful',
          bgClass: 'bg-gradient-to-r from-gray-900 to-black'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Просмотр товаров', iconName: 'grid' },
        { id: 'favorites', title: 'Избранное', priceText: 'Сохраненные товары', iconName: 'heart' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'electronics',
    title: 'TechMart',
    description: 'Магазин электроники и техники',
    category: 'Электронная коммерция',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '11.8k',
    badge: 'Хит продаж',
    badgeColor: 'bg-blue-500',
    home: {
      hero: {
        title: 'Добро пожаловать в TechMart',
        subtitle: 'Лучшие технологии по доступным ценам',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-blue-500 to-cyan-600'
      },
      banners: [
        {
          title: 'iPhone 16 Pro',
          subtitle: 'Новинка уже в продаже',
          image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-gray-800 to-gray-900'
        },
        {
          title: 'Черная пятница',
          subtitle: 'Скидки до 70% на всё',
          bgClass: 'bg-gradient-to-r from-red-500 to-orange-600'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Все товары', iconName: 'smartphone' },
        { id: 'compare', title: 'Сравнение', priceText: 'Сравнить товары', iconName: 'bar-chart' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'beauty',
    title: 'GlowSpa',
    description: 'Салон красоты и SPA-услуги',
    category: 'Красота и здоровье',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '9.7k',
    badge: 'Премиум',
    badgeColor: 'bg-pink-500',
    home: {
      hero: {
        title: 'Добро пожаловать в GlowSpa',
        subtitle: 'Откройте секрет вашей красоты',
        image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-pink-500 to-rose-600'
      },
      banners: [
        {
          title: 'Новые процедуры',
          subtitle: 'Anti-age терапия',
          image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-purple-500 to-indigo-600'
        },
        {
          title: 'Акция месяца',
          subtitle: 'Скидка 30% на все услуги',
          bgClass: 'bg-gradient-to-r from-emerald-500 to-teal-600'
        }
      ],
      services: [
        { id: 'services', title: 'Услуги', priceText: 'Все процедуры', iconName: 'sparkles' },
        { id: 'booking', title: 'Запись', priceText: 'Онлайн бронирование', iconName: 'calendar' },
        { id: 'loyalty', title: 'Программа лояльности', priceText: 'Накопительные скидки', iconName: 'gift' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'restaurant',
    title: 'DeluxeDine',
    description: 'Ресторан с доставкой',
    category: 'Еда и рестораны',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '8.9k',
    badge: 'Мишлен',
    badgeColor: 'bg-yellow-500',
    home: {
      hero: {
        title: 'Добро пожаловать в DeluxeDine',
        subtitle: 'Незабываемые вкусы высокой кухни',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-yellow-500 to-orange-600'
      },
      banners: [
        {
          title: 'Сезонное меню',
          subtitle: 'Блюда от шеф-повара',
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-emerald-500 to-teal-600'
        },
        {
          title: 'Бесплатная доставка',
          subtitle: 'При заказе от 2000₽',
          bgClass: 'bg-gradient-to-r from-blue-500 to-indigo-600'
        }
      ],
      services: [
        { id: 'menu', title: 'Меню', priceText: 'Наши блюда', iconName: 'utensils' },
        { id: 'reservations', title: 'Бронирование', priceText: 'Забронировать стол', iconName: 'calendar' },
        { id: 'delivery', title: 'Доставка', priceText: 'Заказать на дом', iconName: 'truck' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  // НОВЫЕ E-COMMERCE ПРИЛОЖЕНИЯ
  {
    id: 'luxury-watches',
    title: 'TimeElite',
    description: 'Магазин элитных часов',
    category: 'Электронная коммерция',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '15.2k',
    badge: 'Люкс',
    badgeColor: 'bg-yellow-600',
    home: {
      hero: {
        title: 'Добро пожаловать в TimeElite',
        subtitle: 'Эксклюзивные часы для истинных ценителей',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-yellow-600 to-amber-700'
      },
      banners: [
        {
          title: 'Новинка',
          subtitle: 'Коллекция Rolex 2025',
          image: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-blue-500 to-indigo-600'
        },
        {
          title: 'Эксклюзив',
          subtitle: 'Лимитированные серии',
          bgClass: 'bg-gradient-to-r from-purple-500 to-pink-600'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Все часы', iconName: 'watch' },
        { id: 'brands', title: 'Бренды', priceText: 'Rolex, Omega, Cartier', iconName: 'star' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'sneaker-store',
    title: 'SneakerVault',
    description: 'Магазин кроссовок',
    category: 'Электронная коммерция',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '18.9k',
    badge: 'Streetwear',
    badgeColor: 'bg-red-500',
    home: {
      hero: {
        title: 'Добро пожаловать в SneakerVault',
        subtitle: 'Редкие дропы и эксклюзивные коллаборации',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-red-500 to-orange-600'
      },
      banners: [
        {
          title: 'Jordan Retro',
          subtitle: 'Новый релиз уже в продаже',
          image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&auto=format,compress&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-black to-gray-800'
        },
        {
          title: 'Предзаказ',
          subtitle: 'Yeezy Boost 350 V3',
          bgClass: 'bg-gradient-to-r from-purple-500 to-pink-600'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Все кроссовки', iconName: 'zap' },
        { id: 'drops', title: 'Дропы', priceText: 'Новые релизы', iconName: 'lightning' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  {
    id: 'luxury-perfume',
    title: 'FragranceRoyale',
    description: 'Магазин премиальной парфюмерии',
    category: 'Электронная коммерция',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
    creator: 'WEB4TG',
    likes: '11.7k',
    badge: 'Премиум',
    badgeColor: 'bg-purple-500',
    home: {
      hero: {
        title: 'Добро пожаловать в FragranceRoyale',
        subtitle: 'Откройте для себя последние ароматы премиум класса',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?ixlib=rb-4.0.3&auto=format,compress&fit=crop&w=400&h=300&q=80&dpr=2',
        bgClass: 'bg-gradient-to-r from-purple-500 to-pink-600'
      },
      banners: [
        {
          title: 'Новая коллекция',
          subtitle: 'Весна-Лето 2025',
          image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&auto=format,compress&fit=crop&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-pink-500 to-rose-600'
        },
        {
          title: 'Скидки до 50%',
          subtitle: 'На избранные ароматы',
          image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&auto=format,compress&fit=crop&q=80&dpr=2',
          bgClass: 'bg-gradient-to-r from-orange-500 to-red-600'
        }
      ],
      services: [
        { id: 'catalog', title: 'Каталог', priceText: 'Просмотр ароматов', iconName: 'grid' },
        { id: 'favorites', title: 'Избранное', priceText: 'Сохраненные ароматы', iconName: 'heart' },
        { id: 'cart', title: 'Корзина', priceText: 'Мои покупки', iconName: 'shopping-cart' },
        { id: 'profile', title: 'Профиль', priceText: 'Личный кабинет', iconName: 'user' }
      ]
    }
  },
  
  // Futuristic Fashion Collection - 4 Premium Designs
  {
    id: 'futuristic-fashion-1',
    title: 'Rascal®',
    description: 'Футуристический магазин waterproof jacket',
    category: 'Электронная коммерция',
    image: '/attached_assets/stock_images/futuristic_techwear__e958e42c.jpg',
    creator: 'WEB4TG',
    likes: '24.1k',
    badge: 'Футуристика',
    badgeColor: 'bg-gradient-to-r from-green-600 to-emerald-700'
  },
  {
    id: 'futuristic-fashion-2',
    title: 'STORE',
    description: 'Минималистичный черный магазин',
    category: 'Электронная коммерция',
    image: '/attached_assets/stock_images/cyberpunk_fashion_ho_8df162c4.jpg',
    creator: 'WEB4TG',
    likes: '22.8k',
    badge: 'Минимализм',
    badgeColor: 'bg-black'
  },
  {
    id: 'futuristic-fashion-3',
    title: 'lab. SURVIVALIST',
    description: 'Черно-белый минималистичный магазин',
    category: 'Электронная коммерция',
    image: '/attached_assets/stock_images/futuristic_fashion_m_331bf630.jpg',
    creator: 'WEB4TG',
    likes: '26.5k',
    badge: 'Премиум',
    badgeColor: 'bg-gray-900'
  },
  {
    id: 'futuristic-fashion-4',
    title: 'Nike ACG',
    description: 'Карточный дизайн с 3D эффектами',
    category: 'Электронная коммерция',
    image: '/attached_assets/stock_images/futuristic_fashion_m_4203db1e.jpg',
    creator: 'WEB4TG',
    likes: '28.3k',
    badge: 'Интерактив',
    badgeColor: 'bg-gradient-to-r from-gray-800 to-black'
  },
  
  // Premium Design Collection - New Apps
  {
    id: 'oxyz-nft',
    title: 'OXYZ',
    description: 'Футуристическая NFT платформа с красными акцентами',
    category: 'NFT & Крипто',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=300&fit=crop&q=80',
    creator: 'WEB4TG',
    likes: '45.2k',
    badge: 'NFT',
    badgeColor: 'bg-red-600',
    home: {
      hero: {
        title: 'OXYZ NFT',
        subtitle: 'The Future of Digital Art',
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=600&fit=crop&q=90',
        bgClass: 'bg-black'
      },
      services: [
        { id: 'catalog', title: 'Explore', priceText: 'NFT Collection', iconName: 'grid' },
        { id: 'cart', title: 'Wallet', priceText: 'Your Assets', iconName: 'wallet' },
        { id: 'profile', title: 'Settings', priceText: 'Account', iconName: 'settings' }
      ]
    }
  },
  {
    id: 'emily-carter-ai',
    title: 'Emily Carter AI',
    description: 'AI-ассистент с минималистичным современным дизайном',
    category: 'AI & Технологии',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop&q=80',
    creator: 'WEB4TG',
    likes: '67.8k',
    badge: 'AI',
    badgeColor: 'bg-emerald-600',
    home: {
      hero: {
        title: 'Emily Carter',
        subtitle: 'Your AI Assistant',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&q=90',
        bgClass: 'bg-white'
      },
      services: [
        { id: 'catalog', title: 'Chat', priceText: 'Start talking', iconName: 'message-square' },
        { id: 'cart', title: 'History', priceText: 'Past chats', iconName: 'clock' },
        { id: 'profile', title: 'Profile', priceText: 'Settings', iconName: 'user' }
      ]
    }
  },
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

