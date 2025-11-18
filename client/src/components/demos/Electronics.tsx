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
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
    if (activeTab !== 'home') {
      setSelectedFilter('All');
    }
  }, [activeTab]);

  const filteredProducts = products.filter(p => {
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

  // PRODUCT PAGE - УЛУЧШЕННАЯ
  if (activeTab === 'catalog' && selectedProduct) {
    return (
      <div className="h-full bg-[#0A0A0A] text-white overflow-auto">
        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
            data-testid="button-back-to-catalog"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedProduct.id);
            }}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
            data-testid="button-favorite-product"
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

          <button
            onClick={addToCart}
            className="w-full bg-[#00D4FF] text-black font-bold py-4 rounded-full hover:bg-[#00BFEB] transition-all flex items-center justify-center gap-2"
            data-testid="button-buy-now"
          >
            <ShoppingCart className="w-5 h-5" />
            Добавить в корзину
          </button>
        </div>
      </div>
    );
  }

  // HOME PAGE
  if (activeTab === 'home') {
    return (
      <div className="h-full bg-[#0A0A0A] text-white overflow-auto pb-24">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <Menu className="w-6 h-6" data-testid="button-menu" />
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6" data-testid="button-cart" />
              <Heart className="w-6 h-6" data-testid="button-favorites" />
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
              data-testid="button-home"
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
                data-testid={`button-filter-${filter}`}
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
                data-testid="button-hero-shop-now"
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
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
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
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                data-testid={`button-favorite-home-${product.id}`}
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
                    className="w-14 h-14 rounded-full bg-[#00D4FF] flex items-center justify-center transition-all hover:scale-110"
                    data-testid={`button-buy-${product.id}`}
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
      <div className="h-full bg-[#0A0A0A] text-white overflow-auto pb-24">
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
                data-testid={`button-category-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <m.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => openProduct(product)}
                className="relative cursor-pointer"
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
      <div className="h-full bg-[#0A0A0A] text-white overflow-auto pb-32">
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
                <button
                  className="w-full bg-[#00D4FF] text-black font-bold py-4 rounded-full hover:bg-[#00BFEB] transition-all"
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
      <div className="h-full bg-[#0A0A0A] text-white overflow-auto pb-24">
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
              <p className="text-2xl font-bold">{cartItems.length}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Избранное</p>
              <p className="text-2xl font-bold">{favorites.size}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover-elevate active-elevate-2" data-testid="button-orders">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-white/70" />
              <span className="font-medium">Мои заказы</span>
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
    );
  }

  return null;
});
