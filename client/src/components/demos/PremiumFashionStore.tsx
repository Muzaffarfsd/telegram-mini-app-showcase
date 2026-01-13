import React, { useState, useEffect, memo, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Home, Grid, Tag, Plus, Minus } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { Skeleton } from "../ui/skeleton";
import { useFilter } from "@/hooks/useFilter";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { LazyImage, UrgencyIndicator, TrustBadges, DemoThemeProvider } from "@/components/shared";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";
import blackHoodieImage from "@assets/c63bf9171394787.646e06bedc2c7_1761732722277.jpg";
import colorfulHoodieImage from "@assets/fb10cc201496475.6675676d24955_1761732737648.jpg";
import olivePufferImage from "@assets/olive_puffer.jpg";
import colorblockHoodieNew from "@assets/colorblock_hoodie_new.jpg";
import orangeOversizedImage from "@assets/orange_oversized.jpg";
import pinkClassicImage from "@assets/pink_classic.jpg";
import blueWinterImage from "@assets/blue_winter.jpg";
import blackBomberImage from "@assets/black_bomber.jpg";
import beigeTrenchImage from "@assets/beige_trench.jpg";
import carbonHoodieImage from "@assets/carbon_hoodie.jpg";

// Video served from public/videos/ to reduce Docker image size  
const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";

interface PremiumFashionStoreProps {
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
  gender: 'Men' | 'Woman' | 'Children';
  inStock: number;
  rating: number;
  brand: string;
  isNew?: boolean;
  isTrending?: boolean;
  composition: string;
  fit: 'regular' | 'relaxed' | 'slim';
  sizeChart: Record<string, string>;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'Carbon Collection Hoodie', 
    price: 12900, 
    oldPrice: 15900,
    image: carbonHoodieImage, 
    hoverImage: carbonHoodieImage,
    description: 'Культовое худи свободного кроя из премиального японского хлопка плотностью 320 г/м², выращенного на органических плантациях префектуры Окаяма. Каждое изделие проходит специальную обработку enzyme wash для достижения бархатистой мягкости без потери структуры ткани. Матовая фурнитура ручной работы из состаренной латуни создает утонченный контраст с глубоким черным оттенком. Двойные усиленные швы и рибана премиум-класса гарантируют безупречную посадку даже после многократных стирок.', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Белый', 'Серый', 'Бежевый'], 
    colorHex: ['#1A1A1A', '#FAFAFA', '#6B7280', '#D4A574'],
    category: 'Худи', 
    gender: 'Men',
    inStock: 15, 
    rating: 5.0, 
    brand: 'CARBON',
    isNew: true,
    isTrending: true,
    composition: '100% органический хлопок',
    fit: 'relaxed',
    sizeChart: { S: 'грудь 104, длина 68', M: 'грудь 110, длина 70', L: 'грудь 116, длина 72', XL: 'грудь 122, длина 74' }
  },
  { 
    id: 2, 
    name: 'Colorblock Hoodie', 
    price: 13900, 
    oldPrice: 17900,
    image: colorblockHoodieNew, 
    hoverImage: colorblockHoodieNew,
    description: 'Лимитированное худи из эксклюзивной арт-коллаборации с парижским уличным художником, сочетающее смелые цветовые блоки в единую гармоничную композицию. Основа выполнена из бархатистого французского флиса плотностью 400 г/м² с добавлением органического хлопка из долины Луары. Уникальная технология окрашивания garment dye обеспечивает глубину цвета и благородное старение ткани со временем. Каждый экземпляр пронумерован и сопровождается сертификатом подлинности с подписью дизайнера.', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Белый', 'Серый', 'Синий'], 
    colorHex: ['#1A1A1A', '#FAFAFA', '#6B7280', '#3B82F6'],
    category: 'Худи', 
    gender: 'Men',
    inStock: 8, 
    rating: 4.9, 
    brand: 'URBAN',
    isNew: true,
    isTrending: true,
    composition: '80% хлопок, 20% полиэстер',
    fit: 'relaxed',
    sizeChart: { S: 'грудь 106, длина 69', M: 'грудь 112, длина 71', L: 'грудь 118, длина 73', XL: 'грудь 124, длина 75' }
  },
  { 
    id: 3, 
    name: 'Olive Puffer', 
    price: 52900, 
    oldPrice: 67000,
    image: olivePufferImage, 
    hoverImage: olivePufferImage,
    description: 'Премиальный пуховик в милитари-эстетике с наполнителем из отборного канадского гусиного пуха 800 Fill Power, собранного на сертифицированных фермах провинции Альберта. Внешняя ткань из японского рипстоп-нейлона Toray с водоотталкивающей пропиткой C6 DWR обеспечивает защиту от осадков без потери воздухопроницаемости. Анатомический крой разработан совместно с альпинистами для максимальной свободы движений при экстремальных температурах до -30°C. Фирменные застежки YKK Aquaguard и внутренние карманы с флисовой подкладкой для защиты электроники.', 
    sizes: ['XS', 'S', 'M', 'L'], 
    colors: ['Черный', 'Белый', 'Оливковый', 'Бежевый'], 
    colorHex: ['#1A1A1A', '#FAFAFA', '#9CAF88', '#D4A574'],
    category: 'Куртки', 
    gender: 'Men',
    inStock: 5, 
    rating: 5.0, 
    brand: 'PUFF',
    isNew: true,
    isTrending: true,
    composition: '100% нейлон, наполнитель: гусиный пух',
    fit: 'regular',
    sizeChart: { XS: 'грудь 100, длина 65', S: 'грудь 106, длина 67', M: 'грудь 112, длина 69', L: 'грудь 118, длина 71' }
  },
  { 
    id: 4, 
    name: 'Orange Oversized', 
    price: 25500, 
    oldPrice: 35000,
    image: orangeOversizedImage, 
    hoverImage: orangeOversizedImage,
    description: 'Эффектная оверсайз-куртка яркого оранжевого оттенка из эксклюзивного итальянского полиамида, окрашенного вручную мастерами красильни Tintoria di Quaregna с полуторавековой историей. Инновационная технология термосварных швов создает абсолютно герметичную конструкцию без единого видимого стежка. Скрытые молнии YKK Excella с позолоченными зубцами и магнитные клапаны карманов обеспечивают элегантный минималистичный силуэт. Легкий утеплитель Primaloft Gold обеспечивает тепло при весе всего 380 граммов.', 
    sizes: ['S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Белый', 'Серый', 'Розовый'], 
    colorHex: ['#1A1A1A', '#FAFAFA', '#6B7280', '#EC4899'],
    category: 'Куртки', 
    gender: 'Woman',
    inStock: 8, 
    rating: 4.9, 
    brand: 'PUFF',
    isNew: true,
    isTrending: true,
    composition: '100% итальянский полиамид',
    fit: 'relaxed',
    sizeChart: { S: 'грудь 114, длина 70', M: 'грудь 120, длина 72', L: 'грудь 126, длина 74', XL: 'грудь 132, длина 76' }
  },
  { 
    id: 5, 
    name: 'Pink Classic', 
    price: 35000, 
    image: pinkClassicImage, 
    hoverImage: pinkClassicImage,
    description: 'Изысканная куртка в нежной розовой палитре, вдохновленная коллекциями haute couture парижских домов моды и созданная для современных ценительниц утонченного стиля. Наполнитель из отборного французского утиного пуха 90/10 с показателем упругости 750 Fill Power обеспечивает исключительное тепло при минимальном объеме. Роскошная подкладка из натурального шелка-сатина с фирменным жаккардовым узором создает ощущение невесомости при надевании. Приталенный силуэт с регулируемой кулиской подчеркивает женственность, а перламутровые кнопки Riri добавляют нотку парижского шика.', 
    sizes: ['XS', 'S', 'M', 'L'], 
    colors: ['Черный', 'Белый', 'Розовый', 'Бежевый'], 
    colorHex: ['#1A1A1A', '#FAFAFA', '#EC4899', '#D4A574'],
    category: 'Куртки', 
    gender: 'Woman',
    inStock: 10, 
    rating: 5.0, 
    brand: 'PUFF',
    isTrending: true,
    composition: '90% утиный пух, 10% перо',
    fit: 'slim',
    sizeChart: { XS: 'грудь 92, длина 62', S: 'грудь 98, длина 64', M: 'грудь 104, длина 66', L: 'грудь 110, длина 68' }
  },
  { 
    id: 6, 
    name: 'Blue Winter', 
    price: 43000, 
    image: blueWinterImage, 
    hoverImage: blueWinterImage,
    description: 'Детская куртка экспедиционного класса, разработанная в сотрудничестве со скандинавскими исследователями Арктики и адаптированная для активных игр в самые суровые морозы до -30°C. Инновационный утеплитель 3M Thinsulate Featherless сохраняет тепло даже во влажном состоянии, обеспечивая надежную защиту во время зимних приключений. Все швы проклеены специальной термолентой для полной герметичности, а светоотражающие элементы 3M Scotchlite гарантируют видимость ребенка в темное время суток. Съемный капюшон с мягкой флисовой подкладкой и эластичные манжеты с отверстиями для большого пальца не дадут холоду проникнуть внутрь.', 
    sizes: ['S', 'M', 'L'], 
    colors: ['Черный', 'Белый', 'Синий', 'Серый'], 
    colorHex: ['#1A1A1A', '#FAFAFA', '#3B82F6', '#6B7280'],
    category: 'Куртки', 
    gender: 'Children',
    inStock: 6, 
    rating: 4.8, 
    brand: 'PUFF',
    composition: '100% полиэстер, утеплитель Thinsulate',
    fit: 'regular',
    sizeChart: { S: 'грудь 86, длина 52', M: 'грудь 92, длина 56', L: 'грудь 98, длина 60' }
  },
  { 
    id: 7, 
    name: 'Black Bomber', 
    price: 31000, 
    image: blackBomberImage, 
    hoverImage: blackBomberImage,
    description: 'Классический бомбер вневременного силуэта из легендарного японского денима Kurabo плотностью 14 унций, сотканного на челночных станках 1950-х годов в Окаяме. Каждый метр ткани производится со скоростью всего 3 метра в час, что придает полотну уникальную текстуру selvedge edge с характерной красной кромкой. Винтажная латунная фурнитура с патинированной отделкой и оригинальные клепки создают аутентичный образ в духе американской классики 1960-х. Подкладка из стеганого хлопка с традиционным ромбовидным узором обеспечивает комфорт в межсезонье.', 
    sizes: ['XS', 'S', 'M', 'L', 'XL'], 
    colors: ['Черный', 'Белый', 'Серый', 'Синий'], 
    colorHex: ['#1A1A1A', '#FAFAFA', '#6B7280', '#3B82F6'],
    category: 'Куртки', 
    gender: 'Men',
    inStock: 12, 
    rating: 4.9, 
    brand: 'PUFF',
    isNew: true,
    composition: '100% японский деним',
    fit: 'regular',
    sizeChart: { XS: 'грудь 100, длина 62', S: 'грудь 106, длина 64', M: 'грудь 112, длина 66', L: 'грудь 118, длина 68', XL: 'грудь 124, длина 70' }
  },
  { 
    id: 8, 
    name: 'Beige Trench', 
    price: 57000, 
    image: beigeTrenchImage, 
    hoverImage: beigeTrenchImage,
    description: 'Элегантный тренчкот в традициях британского портновского искусства из водоотталкивающего габардина Thomas Mason, который производится на одноименной мануфактуре в Ланкашире с 1796 года. Плотное плетение cotton gabardine с показателем водонепроницаемости 10000 мм надежно защищает от английской непогоды без дополнительной мембраны. Натуральные роговые пуговицы индивидуально подобраны по оттенку и вручную отполированы мастерами из Коринальдо, Италия. Классический двубортный крой с погонами и поясом D-образными кольцами отдает дань уважения оригинальным офицерским пальто Первой мировой войны.', 
    sizes: ['S', 'M', 'L'], 
    colors: ['Черный', 'Белый', 'Бежевый', 'Серый'], 
    colorHex: ['#1A1A1A', '#FAFAFA', '#D4A574', '#6B7280'],
    category: 'Пальто', 
    gender: 'Woman',
    inStock: 4, 
    rating: 5.0, 
    brand: 'PUFF',
    composition: '100% хлопковый габардин',
    fit: 'slim',
    sizeChart: { S: 'грудь 96, длина 105', M: 'грудь 102, длина 108', L: 'грудь 108, длина 111' }
  },
];

const categories = ['Все', 'Худи', 'Куртки', 'Пальто'];
const genderFilters = ['All', 'Men', 'Woman', 'Children'];

function PremiumFashionStore({ activeTab, onTabChange }: PremiumFashionStoreProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState<'description' | 'characteristics' | 'reviews'>('description');
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  const mockReviews = [
    { name: 'Анна М.', rating: 5, text: 'Отличное качество! Ткань очень приятная, размер подошёл идеально.', date: '2 дня назад' },
    { name: 'Дмитрий К.', rating: 4, text: 'Хорошая вещь за свои деньги. Доставка быстрая.', date: '5 дней назад' },
    { name: 'Елена В.', rating: 5, text: 'Покупаю уже второй раз. Качество на высоте!', date: '1 неделю назад' },
    { name: 'Михаил С.', rating: 5, text: 'Супер! Рекомендую всем.', date: '2 недели назад' },
  ];
  
  const fitTranslations: Record<string, string> = {
    regular: 'Обычная',
    relaxed: 'Свободная',
    slim: 'Приталенная'
  };
  
  const { toast } = useToast();
  const sidebar = useDemoSidebar();
  
  const { 
    cartItems: cart, 
    addToCart: addToCartPersistent, 
    removeFromCart, 
    updateQuantity,
    clearCart, 
    totalAmount: cartTotal,
    totalItems: cartCount 
  } = usePersistentCart({ storageKey: 'radiance_cart' });
  
  const { 
    favorites, 
    toggleFavorite, 
    isFavorite,
    favoritesCount 
  } = usePersistentFavorites({ storageKey: 'radiance_favorites' });
  
  const { 
    orders, 
    createOrder,
    ordersCount 
  } = usePersistentOrders({ storageKey: 'radiance_orders' });
  
  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home' },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog' },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: 'var(--theme-primary)' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: products,
    searchFields: ['name', 'description', 'category', 'brand'] as (keyof Product)[],
  });

  useEffect(() => {
    scrollToTop();
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

  const handleToggleFavorite = (productId: number) => {
    toggleFavorite(productId);
    const isNowFavorite = !isFavorite(productId);
    toast({
      title: isNowFavorite ? 'Добавлено в избранное' : 'Удалено из избранного',
      duration: 1500,
    });
  };

  const openProduct = (product: Product) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
    setCurrentImageIndex(0);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    addToCartPersistent({
      id: String(selectedProduct.id),
      name: selectedProduct.name,
      price: selectedProduct.price,
      size: selectedSize,
      image: selectedProduct.image,
      color: selectedColor
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: `${selectedProduct.name} • ${selectedColor} • ${selectedSize}`,
      duration: 2000,
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

  const handleCheckout = (orderId: string) => {
    const orderItems = cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      size: item.size,
      color: item.color
    }));
    
    createOrder(orderItems, cartTotal, {
      address: 'Москва',
      phone: '+7 (999) 123-45-67'
    });
    
    clearCart();
    setIsCheckoutOpen(false);
    
    toast({
      title: 'Заказ оформлен!',
      description: `Номер заказа: ${orderId}`,
      duration: 3000,
    });
  };

  // PRODUCT PAGE - iOS 2026 Liquid Glass Design (Full-bleed Hero)
  if (activeTab === 'catalog' && selectedProduct) {
    // Static premium dark background (like Carbon Collection) - doesn't change with color selection
    const bgColor = '#0A0A0A';
    const productImages = [selectedProduct.image, selectedProduct.hoverImage];
    
    return (
      <div className="min-h-screen text-white overflow-x-hidden" style={{ backgroundColor: bgColor }}>
        
        {/* ===== HERO SECTION: Full-bleed image with floating controls ===== */}
        <div className="relative" style={{ height: '58vh', minHeight: '400px' }}>
          
          {/* Full-bleed Image Gallery */}
          <div className="absolute inset-0 overflow-hidden">
            <div 
              className="flex h-full w-full"
              style={{ 
                transform: `translateX(-${currentImageIndex * 100}%)`,
                transition: 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)'
              }}
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
              }}
              onTouchMove={(e) => {
                touchEndX.current = e.touches[0].clientX;
              }}
              onTouchEnd={() => {
                const diff = touchStartX.current - touchEndX.current;
                if (Math.abs(diff) > 50) {
                  if (diff > 0 && currentImageIndex < productImages.length - 1) {
                    setCurrentImageIndex(prev => prev + 1);
                  } else if (diff < 0 && currentImageIndex > 0) {
                    setCurrentImageIndex(prev => prev - 1);
                  }
                }
              }}
            >
              {productImages.map((img, idx) => (
                <div key={idx} className="min-w-full h-full flex-shrink-0 relative">
                  <LazyImage
                    src={img}
                    alt={`${selectedProduct.name} - фото ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            
            {/* Top gradient for button visibility */}
            <div 
              className="absolute top-0 left-0 right-0 pointer-events-none"
              style={{
                height: '120px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)'
              }}
            />
            
            {/* Bottom gradient for content card transition */}
            <div 
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: '100px',
                background: `linear-gradient(0deg, ${bgColor} 0%, transparent 100%)`
              }}
            />
          </div>
          
          {/* ===== FLOATING NAV: Positioned ON TOP of image ===== */}
          <div 
            className="absolute left-0 right-0 z-50 flex items-center justify-between px-4"
            style={{ 
              top: 'max(12px, env(safe-area-inset-top))',
            }}
          >
            {/* Back Button - Liquid Glass */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{ 
                background: 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(180%)',
                WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)'
              }}
              data-testid="button-back"
            >
              <ChevronLeft className="w-6 h-6" style={{ color: 'rgba(0,0,0,0.8)' }} strokeWidth={2.5} />
            </button>
            
            {/* Photo Counter Badge */}
            <div 
              className="px-4 py-1.5 rounded-full"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
                backdropFilter: 'blur(25px) saturate(180%)',
                WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                border: '0.5px solid rgba(255,255,255,0.5)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
              }}
            >
              <span className="text-xs font-semibold" style={{ color: 'rgba(0,0,0,0.7)' }}>
                {currentImageIndex + 1} / {productImages.length}
              </span>
            </div>
            
            {/* Favorite Button - Liquid Glass */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(selectedProduct.id);
              }}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{ 
                background: isFavorite(selectedProduct.id) 
                  ? 'linear-gradient(145deg, rgba(255,59,48,0.35) 0%, rgba(255,59,48,0.15) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(180%)',
                WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                border: isFavorite(selectedProduct.id) 
                  ? '0.5px solid rgba(255,59,48,0.5)'
                  : '0.5px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)'
              }}
              aria-label={isFavorite(selectedProduct.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
              data-testid={`button-favorite-${selectedProduct.id}`}
            >
              <Heart 
                className="w-5 h-5"
                style={{ color: isFavorite(selectedProduct.id) ? '#FF3B30' : 'rgba(0,0,0,0.75)' }}
                fill={isFavorite(selectedProduct.id) ? '#FF3B30' : 'none'}
                strokeWidth={2}
              />
            </button>
          </div>
          
          {/* Dots Indicator - Bottom of hero */}
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 px-3 py-2 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '0.5px solid rgba(255,255,255,0.5)',
            }}
          >
            {productImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className="transition-all duration-300"
                style={{
                  width: currentImageIndex === idx ? '20px' : '7px',
                  height: '7px',
                  borderRadius: '4px',
                  background: currentImageIndex === idx 
                    ? 'rgba(0,0,0,0.8)' 
                    : 'rgba(0,0,0,0.3)',
                }}
                data-testid={`gallery-dot-${idx}`}
              />
            ))}
          </div>
        </div>

        {/* ===== CONTENT SHEET: Slides up over hero ===== */}
        <div className="relative pb-44" style={{ marginTop: '-28px' }}>
          <div 
            className="relative rounded-t-[32px] p-6 space-y-5"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              borderTop: '0.5px solid rgba(255,255,255,0.4)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
          >
            {/* Product Title & Price */}
            <div className="text-center pt-2">
              <h2 
                className="text-[22px] font-semibold mb-3 tracking-tight"
                style={{ 
                  color: 'rgba(255,255,255,0.95)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                {selectedProduct.name}
              </h2>
              <div className="flex items-center justify-center gap-3">
                <p 
                  className="text-[28px] font-bold tracking-tight"
                  style={{ color: 'rgba(255,255,255,0.98)' }}
                >
                  {formatPrice(selectedProduct.price)}
                </p>
                {selectedProduct.oldPrice && (
                  <p 
                    className="text-lg line-through"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {formatPrice(selectedProduct.oldPrice)}
                  </p>
                )}
              </div>
              {selectedProduct.oldPrice && (
                <div 
                  className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'linear-gradient(135deg, rgba(52,199,89,0.3) 0%, rgba(52,199,89,0.15) 100%)',
                    color: '#34C759',
                    border: '0.5px solid rgba(52,199,89,0.4)'
                  }}
                >
                  Скидка {Math.round((1 - selectedProduct.price / selectedProduct.oldPrice) * 100)}%
                </div>
              )}
            </div>

            {/* Color Selection - iOS Style */}
            <div className="space-y-3">
              <p 
                className="text-[13px] font-medium text-center uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Цвет: {selectedColor}
              </p>
              <div className="flex items-center justify-center gap-3">
                {selectedProduct.colors.map((color, idx) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="relative transition-all duration-200 active:scale-95"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: selectedProduct.colorHex[idx],
                      border: selectedColor === color 
                        ? '2.5px solid rgba(255,255,255,0.9)'
                        : '1.5px solid rgba(255,255,255,0.25)',
                      boxShadow: selectedColor === color 
                        ? '0 0 0 3px rgba(255,255,255,0.2), inset 0 2px 4px rgba(255,255,255,0.3)'
                        : 'inset 0 2px 4px rgba(255,255,255,0.2)',
                      transform: selectedColor === color ? 'scale(1.15)' : 'scale(1)'
                    }}
                    data-testid={`button-color-${color}`}
                  >
                    {selectedColor === color && (
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)'
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection - iOS Segmented Control Style */}
            <div className="space-y-3">
              <p 
                className="text-[13px] font-medium text-center uppercase tracking-wider"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Размер: {selectedSize}
              </p>
              <div 
                className="flex items-center justify-center gap-2 p-1.5 rounded-2xl mx-auto"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  maxWidth: 'fit-content'
                }}
              >
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
                    style={{
                      background: selectedSize === size 
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)'
                        : 'transparent',
                      color: selectedSize === size ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.7)',
                      boxShadow: selectedSize === size 
                        ? '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)'
                        : 'none'
                    }}
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* iOS Segmented Control for Content Tabs */}
            <div className="pt-4">
              <div 
                className="flex items-center p-1 rounded-2xl mx-auto"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  maxWidth: '100%'
                }}
                role="tablist"
              >
                {[
                  { key: 'description', label: 'Описание' },
                  { key: 'characteristics', label: 'Характеристики' },
                  { key: 'reviews', label: 'Отзывы' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveProductTab(tab.key as typeof activeProductTab)}
                    className="flex-1 py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-300"
                    style={{
                      background: activeProductTab === tab.key 
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)'
                        : 'transparent',
                      color: activeProductTab === tab.key ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.6)',
                      boxShadow: activeProductTab === tab.key 
                        ? '0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)'
                        : 'none'
                    }}
                    data-testid={`tab-${tab.key}`}
                    role="tab"
                    aria-selected={activeProductTab === tab.key}
                    aria-controls={`panel-${tab.key}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Panels */}
            <div className="min-h-[200px]">
              {/* Description Tab */}
              {activeProductTab === 'description' && (
                <div id="panel-description" className="space-y-4 transition-opacity duration-300">
                  <p 
                    className="text-[15px] leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.8)' }}
                  >
                    {selectedProduct.description}
                  </p>
                  
                  <div 
                    className="p-4 rounded-2xl space-y-3"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '0.5px solid rgba(255,255,255,0.15)'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">Состав</span>
                      <span style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm font-medium">{selectedProduct.composition}</span>
                    </div>
                    <div className="h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">Посадка</span>
                      <span style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm font-medium">{fitTranslations[selectedProduct.fit]}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Characteristics Tab */}
              {activeProductTab === 'characteristics' && (
                <div id="panel-characteristics" className="space-y-3 transition-opacity duration-300">
                  {[
                    { label: 'Бренд', value: selectedProduct.brand },
                    { label: 'Категория', value: selectedProduct.category },
                    { label: 'Состав', value: selectedProduct.composition },
                    { label: 'Посадка', value: fitTranslations[selectedProduct.fit] },
                    { label: 'Рейтинг', value: `${selectedProduct.rating}/5` },
                    { label: 'В наличии', value: `${selectedProduct.inStock} шт` },
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex justify-between items-center p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '0.5px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">{item.label}</span>
                      <span style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                  
                  {/* Size Chart */}
                  <div 
                    className="p-4 rounded-xl mt-4"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '0.5px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-sm font-medium mb-3">Размерная сетка (см)</p>
                    <div className="space-y-2">
                      {Object.entries(selectedProduct.sizeChart).map(([size, measurements]) => (
                        <div key={size} className="flex justify-between items-center">
                          <span 
                            className="text-sm font-semibold px-2 py-1 rounded-lg"
                            style={{ 
                              background: 'rgba(255,255,255,0.15)',
                              color: 'rgba(255,255,255,0.9)'
                            }}
                          >
                            {size}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }} className="text-xs">{measurements}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeProductTab === 'reviews' && (
                <div id="panel-reviews" className="space-y-4 transition-opacity duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className="w-4 h-4" 
                            fill={star <= Math.round(selectedProduct.rating) ? '#FFD700' : 'transparent'}
                            stroke={star <= Math.round(selectedProduct.rating) ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                          />
                        ))}
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm font-semibold">{selectedProduct.rating}</span>
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }} className="text-xs">{mockReviews.length} отзывов</span>
                  </div>
                  
                  {mockReviews.map((review, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '0.5px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm font-semibold">{review.name}</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)' }} className="text-xs">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className="w-3 h-3" 
                            fill={star <= review.rating ? '#FFD700' : 'transparent'}
                            stroke={star <= review.rating ? '#FFD700' : 'rgba(255,255,255,0.3)'}
                          />
                        ))}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.7)' }} className="text-sm leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Products Carousel */}
            {(() => {
              // Get products from same category first
              const sameCategoryProducts = products.filter(
                p => p.category === selectedProduct.category && p.id !== selectedProduct.id
              );
              // Add products from other categories to fill up to 8 items
              const otherProducts = products.filter(
                p => p.category !== selectedProduct.category && p.id !== selectedProduct.id
              );
              const recommendedProducts = [...sameCategoryProducts, ...otherProducts].slice(0, 8);
              
              if (recommendedProducts.length === 0) return null;
              
              return (
                <div className="pt-6">
                  <h3 
                    className="text-lg font-semibold mb-4"
                    style={{ color: 'rgba(255,255,255,0.9)' }}
                  >
                    Рекомендуемые товары
                  </h3>
                  <div 
                    className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {recommendedProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setSelectedProduct(product);
                          setSelectedSize(product.sizes[0]);
                          setSelectedColor(product.colors[0]);
                          setCurrentImageIndex(0);
                          setActiveProductTab('description');
                          scrollToTop();
                        }}
                        className="flex-shrink-0 snap-start cursor-pointer active:scale-[0.98] transition-transform duration-150"
                        style={{ width: '120px' }}
                        data-testid={`recommended-product-${product.id}`}
                      >
                        {/* iOS Minimalist Card */}
                        <div 
                          className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2"
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                          }}
                        >
                          <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Minimal Info */}
                        <p 
                          className="text-[11px] font-medium truncate mb-1"
                          style={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          {product.name}
                        </p>
                        <p 
                          className="text-[13px] font-semibold"
                          style={{ color: 'rgba(255,255,255,0.95)' }}
                        >
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Fixed Glass Bottom Panel with 3D effect */}
        <div 
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{ perspective: '1000px' }}
        >
          {/* 3D Shadow layer - creates depth illusion */}
          <div 
            className="absolute -top-8 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
              transform: 'rotateX(45deg)',
              transformOrigin: 'bottom center',
            }}
          />
          
          {/* Glass panel */}
          <div 
            className="relative rounded-t-3xl border-t border-white/20 p-6"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
          >
            {/* Subtle inner glow */}
            <div 
              className="absolute inset-0 rounded-t-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)',
              }}
            />
            
            <ConfirmDrawer
              trigger={
                <button
                  className="relative w-full bg-[var(--theme-primary)] text-black font-bold py-4 rounded-full hover:bg-[var(--theme-accent)] transition-all shadow-lg"
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(var(--theme-primary-rgb, 255,255,255), 0.15)',
                  }}
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
      </div>
    );
  }

  // HOME PAGE - REAL TIME SHOPPING STYLE
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="REAL TIME"
          subtitle="SHOPPING"
          accentColor="var(--theme-primary)"
          bgColor="var(--theme-background)"
        />
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button 
              onClick={sidebar.open}
              aria-label="Меню" 
              data-testid="button-view-menu"
            >
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
                  background: 'var(--theme-primary)',
                  boxShadow: '0 0 30px var(--theme-primary-glow, rgba(205, 255, 56, 0.4))'
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
                <LazyImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onLoadComplete={() => handleImageLoad(product.id)}
                  priority={idx < 2}
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
                  handleToggleFavorite(product.id);
                }}
                aria-label={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
                data-testid={`button-favorite-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-white text-white' : 'text-white'}`}
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
                    className="w-14 h-14 rounded-full bg-[var(--theme-primary)] flex items-center justify-center hover:bg-[var(--theme-accent)] transition-all hover:scale-110"
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                {/* Price */}
                <div className="mt-3">
                  <p className="text-lg font-bold">{formatPrice(product.price)}</p>
                  {product.inStock < 10 && (
                    <UrgencyIndicator 
                      type="stock"
                      value={product.inStock}
                      variant="badge"
                      className="mt-2"
                    />
                  )}
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
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
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
                    ? 'bg-[var(--theme-primary)] text-black'
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
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onLoadComplete={() => handleImageLoad(product.id)}
                  />
                  
                  {/* Favorite */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(product.id);
                    }}
                    aria-label={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
                    data-testid={`button-favorite-catalog-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {/* Badge */}
                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[var(--theme-primary)] text-black text-xs font-bold rounded-full">
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
                  {product.inStock < 10 && (
                    <UrgencyIndicator 
                      type="stock"
                      value={product.inStock}
                      variant="badge"
                      className="mt-1"
                    />
                  )}
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
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-32 smooth-scroll-page">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Корзина</h1>

          {cart.length === 0 ? (
            <EmptyState
              type="cart"
              actionLabel="В каталог"
              onAction={() => onTabChange?.('catalog')}
              className="py-20"
            />
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <LazyImage
                    src={item.image || ''}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
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
                          className="w-8 h-8 flex items-center justify-center"
                          aria-label="Уменьшить количество"
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center"
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

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-[var(--theme-background)] border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold">{formatPrice(cartTotal)}</span>
                </div>
                <TrustBadges variant="compact" className="mb-4" />
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[var(--theme-primary)] text-black font-bold py-4 rounded-full hover:bg-[var(--theme-accent)] transition-all min-h-[48px]"
                  data-testid="button-checkout"
                >
                  Оформить заказ
                </button>
              </div>
              
              <CheckoutDrawer
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={cart.map(item => ({
                  id: parseInt(item.id) || 0,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  size: item.size,
                  color: item.color,
                  image: item.image
                }))}
                total={cartTotal}
                currency="₽"
                onOrderComplete={handleCheckout}
                storeName="RADIANCE"
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
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <div className="p-6 bg-white/10 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
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
                  <div key={order.id} className="bg-white/10 rounded-xl p-4" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white/70">Заказ #{order.id.slice(-6)}</span>
                      <span className="text-sm text-white/70">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-white/80">{order.items.length} товаров</span>
                      <span className="font-bold">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] rounded-full">
                        {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтверждён' : order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
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

function PremiumFashionStoreWithTheme(props: PremiumFashionStoreProps) {
  return (
    <DemoThemeProvider themeId="premiumFashion">
      <PremiumFashionStore {...props} />
    </DemoThemeProvider>
  );
}

export default memo(PremiumFashionStoreWithTheme);
