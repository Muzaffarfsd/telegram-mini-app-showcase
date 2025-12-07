import { useState, useEffect, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Home, Grid, Tag, Plus, Minus } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { DemoThemeProvider } from "@/components/shared";

const STORE_KEY = 'rascal-store';
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
  onTabChange?: (tab: string) => void;
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

function RascalStore({ activeTab, onTabChange }: RascalStoreProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const sidebar = useDemoSidebar();
  const { toast } = useToast();

  const {
    cartItems,
    addToCart: addToCartHook,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems
  } = usePersistentCart({ storageKey: STORE_KEY });

  const {
    isFavorite,
    toggleFavorite: toggleFavoriteHook,
    favoritesCount
  } = usePersistentFavorites({ storageKey: STORE_KEY });

  const {
    orders,
    createOrder,
    ordersCount
  } = usePersistentOrders({ storageKey: STORE_KEY });

  const handleToggleFavorite = (productId: number) => {
    toggleFavoriteHook(String(productId));
    const isNowFavorite = !isFavorite(String(productId));
    toast({
      title: isNowFavorite ? 'Добавлено в избранное' : 'Удалено из избранного',
      duration: 1500,
    });
  };

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
    scrollToTop();
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
    if (activeTab !== 'home') {
      setSelectedGender('All');
    }
    if (activeTab !== 'cart') {
      setIsCheckoutOpen(false);
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

  const openProduct = (product: Product) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    addToCartHook({
      id: String(selectedProduct.id),
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1,
      image: selectedProduct.image,
      size: selectedSize,
      color: selectedColor
    });
    
    toast({
      title: 'Добавлено в корзину',
      duration: 1500,
    });
    
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
    
    createOrder(
      cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image
      })),
      totalAmount
    );
    
    clearCart();
    setIsCheckoutOpen(false);
    
    toast({
      title: 'Заказ оформлен!',
      description: 'Ваш заказ успешно создан',
      duration: 3000,
    });
  };

  if (activeTab === 'catalog' && selectedProduct) {
    const bgColor = selectedProduct.colorHex[selectedProduct.colors.indexOf(selectedColor)] || '#1a2e2a';
    
    return (
      <div className="min-h-screen text-white overflow-auto smooth-scroll-page" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            data-testid="button-back"
            aria-label="Назад"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(selectedProduct.id);
            }}
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            data-testid={`button-favorite-${selectedProduct.id}`}
            aria-label={isFavorite(String(selectedProduct.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite(String(selectedProduct.id)) ? 'fill-white text-white' : 'text-white'}`}
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
      <div className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page" style={{ backgroundColor: '#1a2e2a' }}>
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="RASCAL"
          subtitle="STORE"
          accentColor="#10B981"
          bgColor="#0A0A0A"
        />
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button onClick={sidebar.open} aria-label="Меню" data-testid="button-menu">
              <Menu className="w-6 h-6" />
            </button>
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
                  handleToggleFavorite(product.id);
                }}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
                data-testid={`button-favorite-${product.id}`}
                aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-white text-white' : 'text-white'}`}
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
      <div className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page" style={{ backgroundColor: '#1a2e2a' }}>
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
                      handleToggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
                    data-testid={`button-favorite-${product.id}`}
                    aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite(String(product.id)) ? 'fill-white text-white' : 'text-white'}`}
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
    return (
      <div className="min-h-screen text-white overflow-auto pb-32 smooth-scroll-page" style={{ backgroundColor: '#1a2e2a' }}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Корзина</h1>

          {cartItems.length === 0 ? (
            <EmptyState
              type="cart"
              actionLabel="В каталог"
              onAction={() => onTabChange?.('catalog')}
              className="py-20"
            />
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
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
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold">{formatPrice(item.price * item.quantity)}</p>
                      <div className="flex items-center gap-2 bg-white/10 rounded-full px-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          className="w-10 h-10 flex items-center justify-center"
                          aria-label="Уменьшить количество"
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="w-10 h-10 flex items-center justify-center"
                          aria-label="Увеличить количество"
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    aria-label="Удалить из корзины"
                    className="w-10 h-10 flex items-center justify-center"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 border-t border-white/10" style={{ backgroundColor: '#1a2e2a' }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold">{formatPrice(totalAmount)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full text-black font-bold py-4 rounded-full transition-all hover:opacity-90 min-h-[48px]"
                  style={{ backgroundColor: '#7FB069' }}
                  data-testid="button-checkout"
                >
                  Оформить заказ
                </button>
              </div>
              
              <CheckoutDrawer
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={cartItems.map(item => ({
                  id: parseInt(item.id) || 0,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  size: item.size,
                  color: item.color,
                  image: item.image
                }))}
                total={totalAmount}
                currency="₽"
                onOrderComplete={handleCheckout}
                storeName="NIKE Rascal"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen text-white overflow-auto pb-24 smooth-scroll-page" style={{ backgroundColor: '#1a2e2a' }}>
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
              <p className="text-2xl font-bold">{ordersCount}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
              <p className="text-sm text-white/70 mb-1">Избранное</p>
              <p className="text-2xl font-bold">{favoritesCount}</p>
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
                      <span className="text-white/80">Заказ #{order.id.slice(-6)}</span>
                      <span className="text-white/60">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between gap-2 mb-2">
                      <span className="text-white/60">{order.items.length} товаров</span>
                      <span className="font-bold" style={{ color: '#7FB069' }}>{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                        {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтверждён' : order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
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

function RascalStoreWithTheme(props: RascalStoreProps) {
  return (
    <DemoThemeProvider themeId="rascalStore">
      <RascalStore {...props} />
    </DemoThemeProvider>
  );
}

export default memo(RascalStoreWithTheme);
