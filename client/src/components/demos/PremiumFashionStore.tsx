import React, { useState, useEffect, memo, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Home, Grid, Tag, Plus, Minus, Eye } from "lucide-react";
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
    brand: 'CARBON STUDIO',
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
    brand: 'URBAN ATELIER',
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
    brand: 'NORD ATELIER',
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
    brand: 'STUDIO X',
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
    brand: 'MAISON P',
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
    brand: 'ALPINE',
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
    brand: 'ATELIER NOIR',
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
    brand: 'MAISON B',
    composition: '100% хлопковый габардин',
    fit: 'slim',
    sizeChart: { S: 'грудь 96, длина 105', M: 'грудь 102, длина 108', L: 'грудь 108, длина 111' }
  },
];

const categories = ['Все', 'Худи', 'Куртки', 'Пальто'];
const genderFilters = ['Все', 'Мужское', 'Женское', 'Детское'];
const genderMap: Record<string, string> = { 'Мужское': 'Men', 'Женское': 'Woman', 'Детское': 'Children' };

function PremiumFashionStore({ activeTab, onTabChange }: PremiumFashionStoreProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('Все');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeProductTab, setActiveProductTab] = useState<'description' | 'characteristics' | 'reviews'>('description');
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewSize, setQuickViewSize] = useState<string>('');
  const [quickViewColor, setQuickViewColor] = useState<string>('');
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoApplied, setPromoApplied] = useState<boolean>(false);
  const [promoDiscountPct, setPromoDiscountPct] = useState<number>(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
    { icon: <Tag className="w-5 h-5" />, label: 'Акции' },
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
      setSelectedGender('Все');
    }
  }, [activeTab]);

  const filteredProducts = filteredItems.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    
    if (activeTab === 'home') {
      const genderMatch = selectedGender === 'Все' || p.gender === (genderMap[selectedGender] ?? selectedGender);
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

  const PROMO_CODES: Record<string, number> = { 'RADIANCE10': 10, 'STYLE20': 20, 'SS26': 15 };

  const handleApplyPromo = () => {
    const discount = PROMO_CODES[promoCode.trim().toUpperCase()];
    if (discount) {
      setPromoDiscountPct(discount);
      setPromoApplied(true);
      toast({ title: `Промокод применён — скидка ${discount}%`, duration: 2000 });
    } else {
      toast({ title: 'Неверный промокод', description: 'Попробуйте: RADIANCE10 или STYLE20', duration: 2500 });
    }
  };

  const promoSaving = promoApplied ? Math.round(cartTotal * promoDiscountPct / 100) : 0;
  const oldPriceSaving = cart.reduce((acc, item) => {
    const product = products.find(p => p.id === parseInt(item.id));
    return acc + (product?.oldPrice ? (product.oldPrice - product.price) * item.quantity : 0);
  }, 0);
  const totalSaving = promoSaving + oldPriceSaving;
  const finalTotal = cartTotal - promoSaving;

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
    const productImages = [...new Set([selectedProduct.image, selectedProduct.hoverImage])];
    
    return (
      <div className="h-screen text-white overflow-hidden relative flex flex-col" style={{ backgroundColor: bgColor }}>
        
        {/* ===== STICKY GLASS HEADER: Shows on scroll past hero ===== */}
        <AnimatePresence>
          {showStickyHeader && (
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 right-0 z-[100]"
              style={{
                paddingTop: 'max(12px, env(safe-area-inset-top))',
                paddingBottom: '12px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              <div 
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-[20px]"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '0.5px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
                }}
              >
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{ 
                    background: 'rgba(255,255,255,0.15)',
                  }}
                  data-testid="button-sticky-back"
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.9)' }} strokeWidth={2.5} />
                </button>
                
                <div className="flex-1 min-w-0 text-center">
                  <p 
                    className="text-[15px] font-semibold truncate"
                    style={{ 
                      color: 'rgba(255,255,255,0.95)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {selectedProduct.name}
                  </p>
                  <p 
                    className="text-[13px] font-medium"
                    style={{ 
                      color: 'rgba(255,255,255,0.6)',
                      fontFeatureSettings: "'tnum'",
                    }}
                  >
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
                
                <button 
                  onClick={() => {
                    onTabChange?.('cart');
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform relative"
                  style={{ 
                    background: 'rgba(255,255,255,0.15)',
                  }}
                  data-testid="button-sticky-cart"
                >
                  <ShoppingBag className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.9)' }} />
                  {cartCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: 'var(--theme-primary)',
                        color: '#000',
                      }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        
        {/* SCROLLABLE CONTENT CONTAINER */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{ paddingBottom: '180px' }}
          onScroll={(e) => setShowStickyHeader(e.currentTarget.scrollTop > 300)}
        >
        
        {/* ===== HERO SECTION: Full-bleed image with floating controls ===== */}
        <div className="relative flex-shrink-0" style={{ height: '70vh', minHeight: '420px' }}>
          
          {/* Full-bleed Image Gallery - iOS-style snap scroll */}
          <div 
            className="absolute inset-0 overflow-x-auto overflow-y-hidden scrollbar-hide"
            style={{ 
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
            }}
            onScroll={(e) => {
              const container = e.currentTarget;
              const scrollLeft = container.scrollLeft;
              const width = container.offsetWidth;
              const newIndex = Math.round(scrollLeft / width);
              if (newIndex !== currentImageIndex && newIndex >= 0 && newIndex < productImages.length) {
                setCurrentImageIndex(newIndex);
              }
            }}
          >
            <div className="flex h-full w-full">
              {productImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="min-w-full h-full flex-shrink-0 relative"
                  style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
                >
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
          
          {/* ===== FLOATING NAV: Back & Favorite buttons lower ===== */}
          <div 
            className="absolute left-0 right-0 z-50 flex items-center justify-between px-4"
            style={{ 
              top: 'calc(max(12px, env(safe-area-inset-top)) + 48px)',
            }}
          >
            {/* Back Button - Liquid Glass */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{ 
                background: 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.25) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '0.5px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)'
              }}
              data-testid="button-back"
            >
              <ChevronLeft className="w-6 h-6" style={{ color: 'rgba(0,0,0,0.8)' }} strokeWidth={2.5} />
            </button>
            
            {/* Center spacer (counter removed) */}
            <div style={{ width: '44px' }} />
            
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
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
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
          
          {/* Editorial badge — NEW / TRENDING, bottom-left of hero */}
          {(selectedProduct.isNew || selectedProduct.isTrending) && (
            <div className="absolute z-40" style={{ bottom: '52px', left: '16px' }}>
              <span style={{
                fontSize: '9px', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase',
                background: 'var(--theme-primary)', color: '#000',
                padding: '5px 11px', borderRadius: '99px',
                fontFamily: "'Satoshi', 'Inter', sans-serif",
                display: 'inline-block',
              }}>
                {selectedProduct.isNew ? 'Новинка' : 'В тренде'} · SS'26
              </span>
            </div>
          )}

          {/* Dots Indicator — hidden when only 1 image */}
          {productImages.length > 1 && <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2 px-3 py-2 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '0.5px solid rgba(255,255,255,0.15)',
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
                    ? 'rgba(255,255,255,0.95)' 
                    : 'rgba(255,255,255,0.35)',
                }}
                data-testid={`gallery-dot-${idx}`}
              />
            ))}
          </div>}
        </div>

        {/* ===== CONTENT SHEET: Slides up over hero ===== */}
        <div className="relative" style={{ paddingBottom: '176px', marginTop: '-32px' }}>
          <div 
            className="relative rounded-t-[28px]"
            style={{
              padding: '28px 24px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              background: '#0D0D0D',
              borderTop: '0.5px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Product Title & Price — editorial 2026 */}
            <div>
              {/* Brand + Rating row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    fontFamily: "'Satoshi', 'Inter', sans-serif",
                  }}
                >
                  {selectedProduct.brand}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} style={{ width: '10px', height: '10px' }}
                        fill={s <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.85)' : 'transparent'}
                        stroke={s <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em' }}>
                    {selectedProduct.rating}
                  </span>
                </div>
              </div>

              {/* Name — Cormorant Garamond editorial */}
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 300,
                  fontStyle: 'italic',
                  letterSpacing: '0.01em',
                  lineHeight: 1.1,
                  color: 'rgba(255,255,255,0.97)',
                  marginBottom: '16px',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
              >
                {selectedProduct.name}
              </h2>

              {/* Price row — hero price */}
              <div className="flex items-baseline gap-3" style={{ marginBottom: '10px' }}>
                <p
                  style={{
                    fontSize: '30px',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums',
                    fontFamily: "'Satoshi', 'Inter', sans-serif",
                    color: 'rgba(255,255,255,0.97)',
                    lineHeight: 1,
                  }}
                >
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>
              {/* Secondary row: old price + discount badge + stock pill */}
              {(selectedProduct.oldPrice || selectedProduct.inStock <= 5) && (
                <div className="flex items-center flex-wrap gap-2" style={{ marginBottom: '4px' }}>
                  {selectedProduct.oldPrice && (
                    <p
                      style={{
                        fontSize: '15px',
                        textDecoration: 'line-through',
                        color: 'rgba(255,255,255,0.28)',
                        fontVariantNumeric: 'tabular-nums',
                        fontFamily: "'Satoshi', 'Inter', sans-serif",
                      }}
                    >
                      {formatPrice(selectedProduct.oldPrice)}
                    </p>
                  )}
                  {selectedProduct.oldPrice && (
                    <div
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black"
                      style={{
                        background: 'rgba(var(--theme-primary-rgb, 205,255,56), 0.15)',
                        color: 'var(--theme-primary)',
                        border: '0.5px solid rgba(var(--theme-primary-rgb, 205,255,56), 0.35)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontFamily: "'Satoshi', 'Inter', sans-serif",
                      }}
                    >
                      −{Math.round((1 - selectedProduct.price / selectedProduct.oldPrice) * 100)}%
                    </div>
                  )}
                  {selectedProduct.inStock <= 5 && (
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(239,68,68,0.12)',
                        border: '0.5px solid rgba(239,68,68,0.3)',
                      }}
                    >
                      <span
                        style={{
                          width: '5px', height: '5px', borderRadius: '50%',
                          background: '#EF4444', display: 'inline-block',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                        Осталось {selectedProduct.inStock} шт.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Color Selection — left-aligned editorial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  fontFamily: "'Satoshi', 'Inter', sans-serif",
                }}>
                  Цвет
                </p>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>
                  {selectedColor}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedProduct.colors.map((color, idx) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className="relative transition-all duration-200 active:scale-95"
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      backgroundColor: selectedProduct.colorHex[idx],
                      border: selectedColor === color
                        ? '2px solid rgba(255,255,255,0.95)'
                        : '1.5px solid rgba(255,255,255,0.2)',
                      boxShadow: selectedColor === color
                        ? '0 0 0 2.5px rgba(255,255,255,0.15)'
                        : 'none',
                      transform: selectedColor === color ? 'scale(1.12)' : 'scale(1)',
                    }}
                    data-testid={`button-color-${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection — full-width editorial grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <p style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                    fontFamily: "'Satoshi', 'Inter', sans-serif",
                  }}>
                    Размер
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>
                    {selectedSize}
                  </p>
                </div>
                <button
                  style={{
                    fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.02em', fontFamily: "'Satoshi', 'Inter', sans-serif",
                    borderBottom: '0.5px solid rgba(255,255,255,0.25)', lineHeight: 1.2,
                    background: 'none', padding: 0,
                  }}
                >
                  Гид по размерам →
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className="transition-all duration-200 active:scale-95"
                    style={{
                      flex: 1,
                      padding: '13px 8px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                      fontFamily: "'Satoshi', 'Inter', sans-serif",
                      background: selectedSize === size
                        ? 'var(--theme-primary)'
                        : 'rgba(255,255,255,0.06)',
                      color: selectedSize === size ? '#000' : 'rgba(255,255,255,0.65)',
                      border: selectedSize === size
                        ? 'none'
                        : '0.5px solid rgba(255,255,255,0.12)',
                    }}
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Services strip — Net-a-Porter style */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              {[
                { icon: '🚚', label: 'Доставка', sub: 'Бесплатно' },
                { icon: '↩', label: 'Возврат', sub: '30 дней' },
                { icon: '✦', label: 'Оригинал', sub: 'Гарантия' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: '16px', marginBottom: '3px' }}>{item.icon}</p>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', fontFamily: "'Satoshi', 'Inter', sans-serif" }}>{item.label}</p>
                  <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', fontFamily: "'Satoshi', 'Inter', sans-serif" }}>{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Editorial underline tabs */}
            <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
              <div className="flex" role="tablist">
                {[
                  { key: 'description', label: 'Описание' },
                  { key: 'characteristics', label: 'Детали' },
                  { key: 'reviews', label: `Отзывы (${mockReviews.length})` }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveProductTab(tab.key as typeof activeProductTab)}
                    className="flex-1 transition-all duration-200"
                    style={{
                      padding: '12px 4px 13px',
                      fontSize: '11px',
                      fontWeight: activeProductTab === tab.key ? 700 : 500,
                      color: activeProductTab === tab.key ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.4)',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: "'Satoshi', 'Inter', sans-serif",
                      borderBottom: activeProductTab === tab.key
                        ? '1.5px solid var(--theme-primary)'
                        : '1.5px solid transparent',
                      marginBottom: '-0.5px',
                      background: 'transparent',
                    }}
                    data-testid={`tab-${tab.key}`}
                    role="tab"
                    aria-selected={activeProductTab === tab.key}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Panels */}
            <div style={{ minHeight: '200px' }}>
              {/* Description Tab */}
              {activeProductTab === 'description' && (
                <div id="panel-description" style={{ paddingTop: '4px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <p style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.75)',
                    lineHeight: 1.7,
                    letterSpacing: '0em',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 400,
                  }}>
                    {selectedProduct.description}
                  </p>
                  {/* Inline material pill row */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { label: selectedProduct.composition },
                      { label: fitTranslations[selectedProduct.fit] },
                      { label: selectedProduct.category },
                    ].map((tag, i) => (
                      <span key={i} style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.55)',
                        background: 'rgba(255,255,255,0.06)',
                        border: '0.5px solid rgba(255,255,255,0.1)',
                        padding: '6px 12px',
                        borderRadius: '99px',
                        fontFamily: "'Satoshi', 'Inter', sans-serif",
                      }}>
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Characteristics Tab */}
              {activeProductTab === 'characteristics' && (
                <div id="panel-characteristics" style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 1, transition: 'opacity 300ms' }}>
                  {[
                    { label: 'Бренд', value: selectedProduct.brand },
                    { label: 'Категория', value: selectedProduct.category },
                    { label: 'Состав', value: selectedProduct.composition },
                    { label: 'Посадка', value: fitTranslations[selectedProduct.fit] },
                    { label: 'Рейтинг', value: '__stars__' },
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '0.5px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', letterSpacing: '0.02em', fontFamily: "'Satoshi','Inter',sans-serif" }}>{item.label}</span>
                      {item.value === '__stars__' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} style={{ width: '13px', height: '13px' }}
                                fill={s <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.9)' : 'transparent'}
                                stroke={s <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'}
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '-0.01em' }}>
                            {selectedProduct.rating}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 500, letterSpacing: '-0.01em' }}>
                          {item.value}
                        </span>
                      )}
                    </div>
                  ))}
                  
                  {/* Size Chart */}
                  <div 
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '0.5px solid rgba(255,255,255,0.1)',
                      marginTop: '16px'
                    }}
                  >
                    <p style={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      fontWeight: 500,
                      marginBottom: '12px',
                      letterSpacing: '0.05em'
                    }}>
                      Размерная сетка (см)
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(selectedProduct.sizeChart).map(([size, measurements]) => (
                        <div key={size} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span 
                            style={{ 
                              fontSize: '14px',
                              fontWeight: 600,
                              padding: '8px 8px',
                              borderRadius: '8px',
                              background: 'rgba(255,255,255,0.15)',
                              color: 'rgba(255,255,255,0.9)',
                              letterSpacing: '-0.01em'
                            }}
                          >
                            {size}
                          </span>
                          <span style={{ 
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '12px',
                            letterSpacing: '-0.01em'
                          }}>
                            {measurements}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeProductTab === 'reviews' && (
                <div id="panel-reviews" style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: 1, transition: 'opacity 300ms' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className="w-4 h-4" 
                            fill={star <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.95)' : 'transparent'}
                            stroke={star <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)'}
                          />
                        ))}
                      </div>
                      <span style={{ 
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '14px',
                        fontWeight: 600,
                        letterSpacing: '-0.01em'
                      }}>
                        {selectedProduct.rating}
                      </span>
                    </div>
                    <span style={{ 
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '12px',
                      letterSpacing: '-0.01em'
                    }}>
                      {mockReviews.length} отзывов
                    </span>
                  </div>
                  
                  {mockReviews.map((review, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '0.5px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Reviewer header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        {/* Avatar */}
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)',
                          border: '0.5px solid rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{
                            fontSize: '13px', fontWeight: 700,
                            color: 'rgba(255,255,255,0.75)',
                            fontFamily: "'Satoshi', 'Inter', sans-serif",
                          }}>
                            {review.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.01em' }}>
                            {review.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  style={{ width: '10px', height: '10px' }}
                                  fill={star <= review.rating ? 'rgba(255,255,255,0.85)' : 'transparent'}
                                  stroke={star <= review.rating ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
                                />
                              ))}
                            </div>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>
                              {review.date}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p style={{
                        color: 'rgba(255,255,255,0.65)',
                        fontSize: '14px',
                        lineHeight: 1.65,
                        letterSpacing: '-0.01em',
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontWeight: 400,
                      }}>
                        {review.text}
                      </p>
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
                <div style={{ paddingTop: '24px' }}>
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', flex: 1 }} />
                    <p
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.4)',
                        fontFamily: "'Satoshi', 'Inter', sans-serif",
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Вам также понравится
                    </p>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.12)', flex: 1 }} />
                  </div>
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
                        style={{ width: '140px' }}
                        data-testid={`recommended-product-${product.id}`}
                      >
                        {/* Card image with bottom gradient */}
                        <div 
                          className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2.5"
                          style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                          <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Bottom fade for legibility */}
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)',
                            pointerEvents: 'none',
                          }} />
                          {/* Small NEW badge inside image */}
                          {product.isNew && (
                            <span style={{
                              position: 'absolute', top: '8px', left: '8px',
                              fontSize: '7px', fontWeight: 800, letterSpacing: '0.2em',
                              textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif",
                              background: 'var(--theme-primary)', color: '#000',
                              padding: '3px 7px', borderRadius: '99px',
                            }}>NEW</span>
                          )}
                        </div>
                        
                        {/* Brand */}
                        <p 
                          style={{ 
                            fontSize: '8px', fontWeight: 700, letterSpacing: '0.22em',
                            textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                            fontFamily: "'Satoshi','Inter',sans-serif",
                            marginBottom: '3px',
                          }}
                        >
                          {product.brand}
                        </p>
                        {/* Product name — Cormorant */}
                        <p 
                          style={{ 
                            fontSize: '13px', fontWeight: 300, fontStyle: 'italic',
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            color: 'rgba(255,255,255,0.85)',
                            marginBottom: '4px',
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          } as React.CSSProperties}
                        >
                          {product.name}
                        </p>
                        {/* Price */}
                        <p 
                          style={{ 
                            fontSize: '13px', fontWeight: 700, letterSpacing: '-0.02em',
                            color: 'rgba(255,255,255,0.95)',
                            fontFeatureSettings: "'tnum'",
                            fontFamily: "'Satoshi','Inter',sans-serif",
                          }}
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
        </div>
        {/* END SCROLLABLE CONTENT CONTAINER */}

        {/* FIXED Bottom CTA — premium 2026 */}
        <div
          className="fixed left-0 right-0 z-[90]"
          style={{
            bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
            padding: '12px 16px',
            background: 'linear-gradient(to top, #0A0A0A 70%, transparent)',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Favorite button */}
            <button
              onClick={() => handleToggleFavorite(selectedProduct.id)}
              aria-label={isFavorite(selectedProduct.id) ? 'Убрать из избранного' : 'В избранное'}
              className="flex-shrink-0 transition-all active:scale-95"
              style={{
                width: '52px', height: '52px', borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isFavorite(selectedProduct.id)
                  ? 'rgba(255,59,48,0.15)'
                  : 'rgba(255,255,255,0.08)',
                border: isFavorite(selectedProduct.id)
                  ? '0.5px solid rgba(255,59,48,0.4)'
                  : '0.5px solid rgba(255,255,255,0.12)',
              }}
            >
              <Heart
                style={{ width: '20px', height: '20px' }}
                fill={isFavorite(selectedProduct.id) ? '#FF3B30' : 'none'}
                stroke={isFavorite(selectedProduct.id) ? '#FF3B30' : 'rgba(255,255,255,0.7)'}
                strokeWidth={2}
              />
            </button>

            {/* Add to cart — price inside */}
            <ConfirmDrawer
              trigger={
                <button
                  className="flex-1 transition-all duration-200 active:scale-[0.98]"
                  style={{
                    height: '52px',
                    borderRadius: '14px',
                    background: 'var(--theme-primary)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(var(--theme-primary-rgb, 99,102,241),0.4)',
                  }}
                  data-testid="button-buy-now"
                >
                  <span style={{
                    fontSize: '13px', fontWeight: 900, letterSpacing: '0.06em',
                    textTransform: 'uppercase', fontFamily: "'Satoshi', 'Inter', sans-serif",
                  }}>
                    В КОРЗИНУ
                  </span>
                  <span style={{
                    width: '1px', height: '16px', background: 'rgba(0,0,0,0.2)',
                  }} />
                  <span style={{
                    fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums', fontFamily: "'Satoshi', 'Inter', sans-serif",
                  }}>
                    {formatPrice(selectedProduct.price)}
                  </span>
                </button>
              }
              title="Добавить в корзину?"
              description={`${selectedProduct.name} · ${selectedColor} · ${selectedSize}`}
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

  // HOME PAGE — 2026 EDITORIAL FASHION DESIGN
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="RADIANCE"
          subtitle="FASHION STUDIO"
          accentColor="var(--theme-primary)"
          bgColor="var(--theme-background)"
        />

        {/* ─── HEADER ─── */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={sidebar.open}
              aria-label="Меню"
              data-testid="button-view-menu"
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Center wordmark */}
            <div className="text-center">
              <div
                className="text-[20px] font-black tracking-[0.2em] leading-none"
                style={{ fontFamily: "'Satoshi', 'Inter', sans-serif" }}
              >
                RADIANCE
              </div>
              <div
                className="text-[7.5px] font-light tracking-[0.38em] mt-0.5"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Satoshi', 'Inter', sans-serif" }}
              >
                FASHION STUDIO
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Избранное"
                data-testid="button-view-favorites"
                className="w-10 h-10 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <Heart className="w-5 h-5" />
              </button>
              <button
                aria-label="Корзина"
                data-testid="button-view-cart"
                onClick={() => onTabChange?.('cart')}
                className="relative w-10 h-10 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-black text-[9px] font-black flex items-center justify-center"
                    style={{ background: 'var(--theme-primary)' }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div
            className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}
          >
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <input
              type="text"
              placeholder="Поиск товаров, брендов..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent text-white placeholder:text-white/35 outline-none flex-1 text-sm"
              data-testid="input-search"
            />
          </div>

          {/* Gender filter — underline style */}
          <div className="flex items-center gap-1 mt-4">
            {genderFilters.map((gender) => (
              <button
                key={gender}
                onClick={() => setSelectedGender(gender)}
                className="relative px-3 py-1.5 text-sm transition-all"
                data-testid={`button-filter-${gender.toLowerCase()}`}
                style={{
                  color: selectedGender === gender ? '#fff' : 'rgba(255,255,255,0.32)',
                  fontWeight: selectedGender === gender ? 700 : 400,
                  letterSpacing: selectedGender === gender ? '-0.01em' : '0',
                }}
              >
                {gender}
                {selectedGender === gender && (
                  <m.div
                    layoutId="gender-underline"
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ background: 'var(--theme-primary)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── MARQUEE STRIP ─── */}
        <div
          className="overflow-hidden py-2.5 mb-1"
          style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}
        >
          <m.div
            className="flex gap-0 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            style={{ width: 'max-content' }}
          >
            {[...Array(2)].map((_, rep) => (
              <span key={rep} className="inline-flex items-center gap-6 pr-6">
                {['RADIANCE', '✦', 'SS\'26', '✦', 'НОВАЯ КОЛЛЕКЦИЯ', '✦', 'FASHION STUDIO', '✦', 'ВЕСНА / ЛЕТО', '✦', 'PREMIUM EDIT', '✦', 'ЭКСКЛЮЗИВ', '✦'].map((word, wi) => (
                  <span
                    key={wi}
                    className="text-[10px] font-semibold tracking-[0.25em] uppercase"
                    style={{
                      color: word === '✦' ? 'var(--theme-primary)' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            ))}
          </m.div>
        </div>

        {/* ─── VIDEO HERO ─── */}
        <div className="relative mx-4 mt-3 rounded-[26px] overflow-hidden" style={{ height: '400px' }}>
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
          {/* Layered gradient for depth */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0.92) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.2) 0%, transparent 50%)' }} />

          {/* Season tag — top left */}
          <div className="absolute top-4 left-4">
            <span
              className="text-[9px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(16px)',
                color: 'rgba(255,255,255,0.7)',
                border: '0.5px solid rgba(255,255,255,0.18)',
              }}
            >
              SS&apos;26
            </span>
          </div>

          {/* Issue number — top right (editorial magazine feel) */}
          <div className="absolute top-4 right-4 text-right">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
              VOL.I
            </p>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
              №001
            </p>
          </div>

          {/* Hero text — left-aligned editorial */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Super large display text */}
              <div style={{ lineHeight: 0.9, marginBottom: '10px' }}>
                <div
                  className="block"
                  style={{ fontSize: '52px', fontWeight: 900, letterSpacing: '-0.05em', color: '#fff' }}
                >
                  НОВАЯ
                </div>
                <div
                  className="block"
                  style={{ fontSize: '52px', fontWeight: 100, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}
                >
                  коллекция
                </div>
              </div>

              <div className="flex items-center gap-4 mt-5">
                <button
                  className="px-5 py-2.5 rounded-full text-[13px] font-black text-black transition-all active:scale-95"
                  style={{ background: 'var(--theme-primary)', letterSpacing: '-0.01em' }}
                  onClick={() => onTabChange?.('catalog')}
                  data-testid="button-view-collection"
                >
                  Смотреть →
                </button>
                <p
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  Весна — Лето 2026
                </p>
              </div>
            </m.div>
          </div>
        </div>

        {/* ─── THE EDIT — Featured product ─── */}
        <div className="px-4 mt-7">
          {/* Editorial section divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex items-end gap-3">
              <div>
                <p
                  className="text-[8px] font-semibold tracking-[0.35em] uppercase text-center mb-0.5"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Editorial
                </p>
                <h2
                  className="leading-none text-center"
                  style={{
                    fontSize: '34px',
                    fontWeight: 300,
                    letterSpacing: '0.08em',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                  }}
                >
                  The Edit
                </h2>
              </div>
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {filteredProducts[0] && (
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => openProduct(filteredProducts[0])}
              className="relative cursor-pointer rounded-[22px] overflow-hidden"
              style={{ height: '430px' }}
              data-testid={`featured-product-${filteredProducts[0].id}`}
            >
              <div className="absolute inset-0">
                <LazyImage
                  src={filteredProducts[0].image}
                  alt={filteredProducts[0].name}
                  className="w-full h-full object-cover"
                  onLoadComplete={() => handleImageLoad(filteredProducts[0].id)}
                  priority
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {filteredProducts[0].isNew && (
                  <span
                    className="px-2.5 py-1 text-[9px] font-black rounded-full tracking-[0.1em] uppercase text-black"
                    style={{ background: 'var(--theme-primary)' }}
                  >
                    NEW
                  </span>
                )}
                <span
                  className="px-2.5 py-1 text-[9px] font-semibold rounded-full tracking-wide uppercase"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(10px)',
                    color: 'rgba(255,255,255,0.8)',
                    border: '0.5px solid rgba(255,255,255,0.18)',
                  }}
                >
                  {filteredProducts[0].category}
                </span>
              </div>

              {/* Quick view + heart */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickViewProduct(filteredProducts[0]);
                    setQuickViewSize(filteredProducts[0].sizes[0]);
                    setQuickViewColor(filteredProducts[0].colors[0]);
                  }}
                  aria-label="Быстрый просмотр"
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(16px)',
                    border: '0.5px solid rgba(255,255,255,0.2)',
                  }}
                  data-testid={`button-quickview-home-${filteredProducts[0].id}`}
                >
                  <Eye className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(filteredProducts[0].id); }}
                  aria-label={isFavorite(filteredProducts[0].id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(16px)',
                    border: '0.5px solid rgba(255,255,255,0.2)',
                  }}
                  data-testid={`button-favorite-${filteredProducts[0].id}`}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite(filteredProducts[0].id) ? 'fill-white' : ''} text-white`}
                  />
                </button>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p
                  className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-1"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {filteredProducts[0].brand}
                </p>
                <h3
                  className="mb-4 leading-tight"
                  style={{
                    fontSize: '26px',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    letterSpacing: '0.04em',
                    lineHeight: 1.15,
                  }}
                >
                  {filteredProducts[0].name}
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-xl font-bold"
                      style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                    >
                      {formatPrice(filteredProducts[0].price)}
                    </span>
                    {filteredProducts[0].oldPrice && (
                      <span
                        className="text-sm line-through"
                        style={{ color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatPrice(filteredProducts[0].oldPrice)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openProduct(filteredProducts[0]); }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[12px] font-black text-black active:scale-95 transition-all"
                    style={{ background: 'var(--theme-primary)', letterSpacing: '0.03em' }}
                    data-testid={`button-add-to-cart-${filteredProducts[0].id}`}
                  >
                    Открыть →
                  </button>
                </div>
              </div>
            </m.div>
          )}
        </div>

        {/* ─── JUST DROPPED — Horizontal scroll ─── */}
        <div className="mt-8">
          <div className="px-4 mb-4">
            <div className="flex items-center gap-3 mb-0.5">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--theme-primary)' }}
              />
              <p
                className="text-[9px] font-bold tracking-[0.35em] uppercase"
                style={{ color: 'var(--theme-primary)' }}
              >
                Новые поступления
              </p>
            </div>
            <h2
              className="leading-none"
              style={{
                fontSize: '34px',
                fontWeight: 300,
                letterSpacing: '0.06em',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              Just Dropped
            </h2>
          </div>

          <div
            className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {filteredProducts.slice(1, 6).map((product, idx) => (
              <m.div
                key={product.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.07 }}
                onClick={() => openProduct(product)}
                className="flex-shrink-0 snap-start cursor-pointer active:scale-[0.97] transition-transform"
                style={{ width: '155px' }}
                data-testid={`featured-product-${product.id}`}
              >
                <div
                  className="relative rounded-[18px] overflow-hidden mb-2.5"
                  style={{ height: '196px' }}
                >
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onLoadComplete={() => handleImageLoad(product.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

                  {/* Heart */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                    aria-label={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.38)',
                      backdropFilter: 'blur(12px)',
                      border: '0.5px solid rgba(255,255,255,0.18)',
                    }}
                    data-testid={`button-favorite-${product.id}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite(product.id) ? 'fill-white' : ''} text-white`} />
                  </button>

                  {/* Quick view */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickViewProduct(product);
                      setQuickViewSize(product.sizes[0]);
                      setQuickViewColor(product.colors[0]);
                    }}
                    aria-label="Быстрый просмотр"
                    className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.38)',
                      backdropFilter: 'blur(12px)',
                      border: '0.5px solid rgba(255,255,255,0.18)',
                    }}
                    data-testid={`button-quickview-home-${product.id}`}
                  >
                    <Eye className="w-3.5 h-3.5 text-white" />
                  </button>

                  {/* Price */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className="text-sm font-bold"
                      style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}
                    >
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>

                <p
                  className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-0.5 truncate"
                  style={{ color: 'rgba(255,255,255,0.38)' }}
                >
                  {product.brand}
                </p>
                <p
                  className="text-sm font-semibold leading-tight truncate"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {product.name}
                </p>
              </m.div>
            ))}
          </div>
        </div>

        {/* ─── LOOKBOOK — Staggered 2-col grid ─── */}
        {filteredProducts.length > 4 && (
          <div className="px-4 mt-8">
            {/* Section with editorial divider lines */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="text-center">
                <p
                  className="text-[8px] font-semibold tracking-[0.35em] uppercase mb-0.5"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  Актуальные образы
                </p>
                <h2
                  className="leading-none text-center"
                  style={{
                    fontSize: '34px',
                    fontWeight: 300,
                    letterSpacing: '0.08em',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                  }}
                >
                  Lookbook
                </h2>
              </div>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.slice(4, 8).map((product, idx) => (
                <m.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + idx * 0.07 }}
                  onClick={() => openProduct(product)}
                  className="cursor-pointer active:scale-[0.97] transition-transform"
                  data-testid={`featured-product-${product.id}`}
                >
                  <div
                    className="relative rounded-[18px] overflow-hidden mb-2"
                    style={{ height: idx % 2 === 0 ? '215px' : '175px' }}
                  >
                    <LazyImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onLoadComplete={() => handleImageLoad(product.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                    {/* Quick view + Heart row */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                        aria-label={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                        className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-all"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.15)' }}
                        data-testid={`button-favorite-${product.id}`}
                      >
                        <Heart className={`w-3 h-3 ${isFavorite(product.id) ? 'fill-white' : ''} text-white`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                          setQuickViewSize(product.sizes[0]);
                          setQuickViewColor(product.colors[0]);
                        }}
                        aria-label="Быстрый просмотр"
                        className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-all"
                        style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.12)' }}
                        data-testid={`button-quickview-home-${product.id}`}
                      >
                        <Eye className="w-3 h-3 text-white" />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p
                        className="text-[11px] font-bold leading-tight truncate"
                        style={{ letterSpacing: '-0.01em' }}
                      >
                        {product.name}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: 'rgba(255,255,255,0.55)', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div className="h-6" />
        
        {/* ===== QUICK VIEW MODAL for HOME PAGE ===== */}
        <AnimatePresence>
          {quickViewProduct && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] flex items-end justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onClick={() => setQuickViewProduct(null)}
            >
              <m.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="w-full max-w-lg rounded-t-[32px] overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(40,40,40,0.95) 0%, rgba(25,25,25,0.98) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  maxHeight: '70vh',
                  paddingBottom: 'calc(max(24px, env(safe-area-inset-bottom)) + 140px)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div 
                    className="w-10 h-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.3)' }}
                  />
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                  data-testid="button-close-quickview-home"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
                  {/* Hero row: image + info side-by-side */}
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                    {/* Product image — compact portrait */}
                    <div style={{ width: '110px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', aspectRatio: '2/3' }}>
                      <LazyImage src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Info column */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '2px', minWidth: 0 }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: '7px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                        {quickViewProduct.brand}
                      </p>
                      <h3 style={{ fontSize: '21px', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.03em', color: 'rgba(255,255,255,0.95)', lineHeight: 1.15, marginBottom: '10px' }}>
                        {quickViewProduct.name}
                      </h3>
                      {/* Stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '14px' }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} style={{ width: '11px', height: '11px' }}
                            fill={s <= Math.round(quickViewProduct.rating) ? 'rgba(255,255,255,0.85)' : 'transparent'}
                            stroke={s <= Math.round(quickViewProduct.rating) ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
                          />
                        ))}
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginLeft: '3px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                          {quickViewProduct.rating}
                        </span>
                      </div>
                      {/* Price */}
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                            {formatPrice(quickViewProduct.price)}
                          </span>
                          {quickViewProduct.oldPrice && (
                            <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.28)', fontVariantNumeric: 'tabular-nums' }}>
                              {formatPrice(quickViewProduct.oldPrice)}
                            </span>
                          )}
                        </div>
                        {quickViewProduct.oldPrice && (
                          <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', color: '#000', background: 'var(--theme-primary)', borderRadius: '6px', padding: '2px 8px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                            −{Math.round((1 - quickViewProduct.price / quickViewProduct.oldPrice) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', marginBottom: '18px' }} />

                  {/* Color */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      Цвет <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— {quickViewColor}</span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {quickViewProduct.colors.map((color, idx) => (
                        <button
                          key={color}
                          onClick={() => setQuickViewColor(color)}
                          className="active:scale-90 transition-all"
                          style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: quickViewProduct.colorHex[idx],
                            border: quickViewColor === color ? '2.5px solid var(--theme-primary)' : '2px solid rgba(255,255,255,0.15)',
                            boxShadow: quickViewColor === color ? '0 0 10px rgba(var(--theme-primary-rgb,205,255,56),0.35)' : 'none',
                          }}
                          data-testid={`quickview-home-color-${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div style={{ marginBottom: '22px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      Размер
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {quickViewProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setQuickViewSize(size)}
                          className="active:scale-95 transition-all"
                          style={{
                            padding: '9px 4px', borderRadius: '10px',
                            fontSize: '12px', fontWeight: quickViewSize === size ? 700 : 500,
                            fontFamily: "'Satoshi','Inter',sans-serif",
                            background: quickViewSize === size ? 'var(--theme-primary)' : 'rgba(255,255,255,0.07)',
                            color: quickViewSize === size ? '#000' : 'rgba(255,255,255,0.7)',
                            border: quickViewSize === size ? 'none' : '0.5px solid rgba(255,255,255,0.12)',
                          }}
                          data-testid={`quickview-home-size-${size}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA — matches product detail style */}
                  <button
                    onClick={() => {
                      addToCartPersistent({
                        id: String(quickViewProduct.id),
                        name: quickViewProduct.name,
                        price: quickViewProduct.price,
                        size: quickViewSize,
                        image: quickViewProduct.image,
                        color: quickViewColor,
                      });
                      toast({ title: 'Добавлено в корзину', description: `${quickViewProduct.name} • ${quickViewColor} • ${quickViewSize}`, duration: 2000 });
                      setQuickViewProduct(null);
                    }}
                    className="w-full active:scale-[0.98] transition-all"
                    style={{
                      height: '52px', borderRadius: '14px', background: 'var(--theme-primary)', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 20px rgba(var(--theme-primary-rgb,205,255,56),0.25)',
                      marginBottom: '10px',
                    }}
                    data-testid="button-quickview-home-add-to-cart"
                  >
                    <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      В КОРЗИНУ
                    </span>
                    <span style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.2)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      {formatPrice(quickViewProduct.price)}
                    </span>
                  </button>

                  <button
                    onClick={() => { openProduct(quickViewProduct); setQuickViewProduct(null); }}
                    className="w-full py-3 transition-all active:opacity-70"
                    style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: "'Satoshi','Inter',sans-serif", letterSpacing: '0.02em' }}
                    data-testid="button-quickview-home-details"
                  >
                    Смотреть полностью →
                  </button>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // CATALOG PAGE — 2026 ASYMMETRIC GRID
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        {/* ─── Catalog Header ─── */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                RADIANCE
              </p>
              <h1
                className="leading-none"
                style={{
                  fontSize: '30px',
                  fontWeight: 300,
                  letterSpacing: '0.06em',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: 'italic',
                }}
              >
                Каталог
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                aria-label="Поиск"
                data-testid="button-view-search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                aria-label="Фильтр"
                data-testid="button-view-filter"
              >
                <Filter className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all active:scale-95"
                style={{
                  background:
                    selectedCategory === cat ? 'var(--theme-primary)' : 'rgba(255,255,255,0.07)',
                  color: selectedCategory === cat ? '#000' : 'rgba(255,255,255,0.6)',
                  border: selectedCategory === cat ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                  fontSize: '11px',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  letterSpacing: '0.04em',
                  fontFamily: "'Satoshi', 'Inter', sans-serif",
                }}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Products — Interleaved Asymmetric Grid ─── */}
        <div className="px-4 space-y-3 pb-2">
          {(() => {
            const rows: React.ReactNode[] = [];
            let i = 0;
            let groupIdx = 0;
            while (i < filteredProducts.length) {
              const featured = filteredProducts[i];
              // Full-width featured card
              rows.push(
                <m.div
                  key={`featured-${featured.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.1 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => openProduct(featured)}
                  className="relative cursor-pointer rounded-[20px] overflow-hidden"
                  style={{ height: '280px' }}
                  data-testid={`product-card-${featured.id}`}
                >
                  <LazyImage
                    src={featured.image}
                    alt={featured.name}
                    className="w-full h-full object-cover"
                    onLoadComplete={() => handleImageLoad(featured.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                    {featured.isNew && (
                      <span
                        className="px-2 py-1 text-[9px] font-black rounded-full tracking-[0.08em] uppercase text-black"
                        style={{ background: 'var(--theme-primary)' }}
                      >
                        NEW
                      </span>
                    )}
                    <span
                      className="px-2 py-1 text-[9px] font-medium rounded-full"
                      style={{
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(8px)',
                        color: 'rgba(255,255,255,0.75)',
                        border: '0.5px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {featured.category}
                    </span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(featured);
                        setQuickViewSize(featured.sizes[0]);
                        setQuickViewColor(featured.colors[0]);
                      }}
                      aria-label="Быстрый просмотр"
                      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                      data-testid={`button-quickview-${featured.id}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }}
                      aria-label={isFavorite(featured.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                      data-testid={`button-favorite-catalog-${featured.id}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(featured.id) ? 'fill-white' : ''} text-white`} />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                      <div className="flex-1 mr-3">
                        <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {featured.brand}
                        </p>
                        <p className="text-[16px] font-black leading-tight" style={{ letterSpacing: '-0.02em' }}>
                          {featured.name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                          {formatPrice(featured.price)}
                        </p>
                        {featured.oldPrice && (
                          <p className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                            {formatPrice(featured.oldPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </m.div>
              );
              i++;

              // 2-col pair
              const pair = filteredProducts.slice(i, i + 2);
              if (pair.length > 0) {
                rows.push(
                  <div key={`pair-${groupIdx}`} className="grid grid-cols-2 gap-3">
                    {pair.map((product, colIdx) => (
                      <m.div
                        key={product.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIdx * 0.1 + 0.04 + colIdx * 0.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => openProduct(product)}
                        className="cursor-pointer"
                        data-testid={`product-card-${product.id}`}
                      >
                        <div
                          className="relative rounded-[18px] overflow-hidden mb-2.5"
                          style={{ height: colIdx === 0 ? '205px' : '175px' }}
                        >
                          <LazyImage
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onLoadComplete={() => handleImageLoad(product.id)}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                              aria-label={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                              style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.18)' }}
                              data-testid={`button-favorite-catalog-${product.id}`}
                            >
                              <Heart className={`w-3 h-3 ${isFavorite(product.id) ? 'fill-white' : ''} text-white`} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickViewProduct(product);
                                setQuickViewSize(product.sizes[0]);
                                setQuickViewColor(product.colors[0]);
                              }}
                              aria-label="Быстрый просмотр"
                              className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                              style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.18)' }}
                              data-testid={`button-quickview-${product.id}`}
                            >
                              <Eye className="w-3 h-3 text-white" />
                            </button>
                          </div>

                          {product.oldPrice && (
                            <div className="absolute top-2 left-2">
                              <span
                                className="px-1.5 py-0.5 text-[9px] font-black rounded-md text-black"
                                style={{ background: 'var(--theme-primary)' }}
                              >
                                −{Math.round((1 - product.price / product.oldPrice) * 100)}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="text-[8px] font-semibold tracking-[0.22em] uppercase mb-0.5 truncate" style={{ color: 'rgba(255,255,255,0.38)' }}>
                            {product.brand}
                          </p>
                          <p className="text-[12px] font-semibold leading-tight mb-1 truncate" style={{ letterSpacing: '-0.01em' }}>
                            {product.name}
                          </p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[13px] font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
                              {formatPrice(product.price)}
                            </span>
                            {product.oldPrice && (
                              <span className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}>
                                {formatPrice(product.oldPrice)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ background: star <= Math.round(product.rating) ? 'var(--theme-primary)' : 'rgba(255,255,255,0.15)' }}
                              />
                            ))}
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </div>
                );
                i += pair.length;
              }
              groupIdx++;
            }
            return rows;
          })()}
        </div>
        
        {/* ===== QUICK VIEW MODAL ===== */}
        <AnimatePresence>
          {quickViewProduct && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] flex items-end justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
              onClick={() => setQuickViewProduct(null)}
            >
              <m.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="w-full max-w-lg rounded-t-[32px] overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, rgba(40,40,40,0.95) 0%, rgba(25,25,25,0.98) 100%)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  maxHeight: '70vh',
                  paddingBottom: 'calc(max(24px, env(safe-area-inset-bottom)) + 140px)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag Handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div 
                    className="w-10 h-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.3)' }}
                  />
                </div>
                
                {/* Close Button */}
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                  data-testid="button-close-quickview"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
                  {/* Hero row: image + info side-by-side */}
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ width: '110px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', aspectRatio: '2/3' }}>
                      <LazyImage src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-full object-cover" />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '2px', minWidth: 0 }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: '7px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                        {quickViewProduct.brand}
                      </p>
                      <h3 style={{ fontSize: '21px', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.03em', color: 'rgba(255,255,255,0.95)', lineHeight: 1.15, marginBottom: '10px' }}>
                        {quickViewProduct.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '14px' }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} style={{ width: '11px', height: '11px' }}
                            fill={s <= Math.round(quickViewProduct.rating) ? 'rgba(255,255,255,0.85)' : 'transparent'}
                            stroke={s <= Math.round(quickViewProduct.rating) ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
                          />
                        ))}
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginLeft: '3px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                          {quickViewProduct.rating}
                        </span>
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                            {formatPrice(quickViewProduct.price)}
                          </span>
                          {quickViewProduct.oldPrice && (
                            <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.28)', fontVariantNumeric: 'tabular-nums' }}>
                              {formatPrice(quickViewProduct.oldPrice)}
                            </span>
                          )}
                        </div>
                        {quickViewProduct.oldPrice && (
                          <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '10px', fontWeight: 700, color: '#000', background: 'var(--theme-primary)', borderRadius: '6px', padding: '2px 8px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                            −{Math.round((1 - quickViewProduct.price / quickViewProduct.oldPrice) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', marginBottom: '18px' }} />

                  {/* Color */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      Цвет <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>— {quickViewColor}</span>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {quickViewProduct.colors.map((color, idx) => (
                        <button key={color} onClick={() => setQuickViewColor(color)}
                          className="active:scale-90 transition-all"
                          style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: quickViewProduct.colorHex[idx],
                            border: quickViewColor === color ? '2.5px solid var(--theme-primary)' : '2px solid rgba(255,255,255,0.15)',
                            boxShadow: quickViewColor === color ? '0 0 10px rgba(var(--theme-primary-rgb,205,255,56),0.35)' : 'none',
                          }}
                          data-testid={`quickview-color-${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div style={{ marginBottom: '22px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      Размер
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {quickViewProduct.sizes.map((size) => (
                        <button key={size} onClick={() => setQuickViewSize(size)}
                          className="active:scale-95 transition-all"
                          style={{
                            padding: '9px 4px', borderRadius: '10px',
                            fontSize: '12px', fontWeight: quickViewSize === size ? 700 : 500,
                            fontFamily: "'Satoshi','Inter',sans-serif",
                            background: quickViewSize === size ? 'var(--theme-primary)' : 'rgba(255,255,255,0.07)',
                            color: quickViewSize === size ? '#000' : 'rgba(255,255,255,0.7)',
                            border: quickViewSize === size ? 'none' : '0.5px solid rgba(255,255,255,0.12)',
                          }}
                          data-testid={`quickview-size-${size}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      addToCartPersistent({
                        id: String(quickViewProduct.id),
                        name: quickViewProduct.name,
                        price: quickViewProduct.price,
                        size: quickViewSize,
                        image: quickViewProduct.image,
                        color: quickViewColor,
                      });
                      toast({ title: 'Добавлено в корзину', description: `${quickViewProduct.name} • ${quickViewColor} • ${quickViewSize}`, duration: 2000 });
                      setQuickViewProduct(null);
                    }}
                    className="w-full active:scale-[0.98] transition-all"
                    style={{
                      height: '52px', borderRadius: '14px', background: 'var(--theme-primary)', color: '#000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 20px rgba(var(--theme-primary-rgb,205,255,56),0.25)',
                      marginBottom: '10px',
                    }}
                    data-testid="button-quickview-add-to-cart"
                  >
                    <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif" }}>В КОРЗИНУ</span>
                    <span style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.2)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      {formatPrice(quickViewProduct.price)}
                    </span>
                  </button>

                  <button
                    onClick={() => { openProduct(quickViewProduct); setQuickViewProduct(null); }}
                    className="w-full py-3 transition-all active:opacity-70"
                    style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: "'Satoshi','Inter',sans-serif", letterSpacing: '0.02em' }}
                    data-testid="button-quickview-details"
                  >
                    Смотреть полностью →
                  </button>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // CART PAGE — 2026 CLEAN REDESIGN
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-40 smooth-scroll-page">
        {/* ─── Cart Header ─── */}
        <div className="px-5 pt-5 pb-5">
          <p
            className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            RADIANCE
          </p>
          <div className="flex items-center justify-between">
            <h1
              className="leading-none"
              style={{
                fontSize: '30px',
                fontWeight: 300,
                letterSpacing: '0.06em',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
              }}
            >
              Корзина
            </h1>
            {cart.length > 0 && (
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                }}
              >
                {cart.length} {cart.length === 1 ? 'товар' : cart.length < 5 ? 'товара' : 'товаров'}
              </span>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <EmptyState
            type="cart"
            actionLabel="В каталог"
            onAction={() => onTabChange?.('catalog')}
            className="py-20"
          />
        ) : (
          <>
            {/* Cart items */}
            <div className="px-4 space-y-3">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="rounded-[18px] overflow-hidden flex gap-0"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '0.5px solid rgba(255,255,255,0.09)',
                  }}
                  data-testid={`cart-item-${item.id}`}
                >
                  {/* Image */}
                  <div className="flex-shrink-0 w-[88px] h-[108px] overflow-hidden rounded-l-[18px]">
                    <LazyImage
                      src={item.image || ''}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 px-4 py-3 flex flex-col justify-between">
                    <div>
                      <h3
                        className="text-[13px] font-bold leading-tight mb-0.5"
                        style={{ letterSpacing: '-0.01em' }}
                      >
                        {item.name}
                      </h3>
                      <p
                        className="text-[11px]"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                      >
                        {item.color} · {item.size}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className="text-[15px] font-bold"
                        style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                      >
                        {formatPrice(item.price * item.quantity)}
                      </p>

                      {/* Quantity control */}
                      <div
                        className="flex items-center rounded-full overflow-hidden"
                        style={{
                          background: 'rgba(255,255,255,0.09)',
                          border: '0.5px solid rgba(255,255,255,0.12)',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center transition-all active:scale-90"
                          aria-label="Уменьшить количество"
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span
                          className="text-[13px] font-bold px-1"
                          style={{ minWidth: '20px', textAlign: 'center' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center transition-all active:scale-90"
                          aria-label="Увеличить количество"
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    aria-label="Удалить из корзины"
                    className="flex-shrink-0 px-3 flex items-center justify-center transition-all active:scale-90"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="px-4 mt-4">
              {promoApplied ? (
                <div
                  className="rounded-[14px] px-4 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(var(--theme-primary-rgb,205,255,56),0.1)', border: '0.5px solid rgba(var(--theme-primary-rgb,205,255,56),0.25)' }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                    <span className="text-[13px] font-semibold" style={{ color: 'var(--theme-primary)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      {promoCode.toUpperCase()} — скидка {promoDiscountPct}%
                    </span>
                  </div>
                  <button
                    onClick={() => { setPromoApplied(false); setPromoDiscountPct(0); setPromoCode(''); }}
                    className="w-6 h-6 flex items-center justify-center rounded-full active:scale-90 transition-all"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <X className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                </div>
              ) : (
                <div
                  className="rounded-[14px] overflow-hidden flex"
                  style={{ border: '0.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
                >
                  <input
                    type="text"
                    placeholder="Промокод"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                    className="flex-1 bg-transparent px-4 py-3 text-[13px] outline-none placeholder:text-white/25 text-white"
                    style={{ fontFamily: "'Satoshi','Inter',sans-serif", letterSpacing: '0.06em' }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-4 py-3 text-[12px] font-bold active:scale-95 transition-all"
                    style={{
                      color: promoCode.length > 0 ? 'var(--theme-primary)' : 'rgba(255,255,255,0.25)',
                      letterSpacing: '0.06em', fontFamily: "'Satoshi','Inter',sans-serif",
                      borderLeft: '0.5px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    ПРИМЕНИТЬ
                  </button>
                </div>
              )}
            </div>

            {/* Summary card */}
            <div className="px-4 mt-3">
              <div
                className="rounded-[18px] p-4 space-y-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.09)',
                }}
              >
                <div className="flex items-center justify-between text-[13px]">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Товары ({cartCount})</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatPrice(cartTotal)}</span>
                </div>
                {promoApplied && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Промокод ({promoDiscountPct}%)</span>
                    <span className="font-semibold" style={{ color: 'var(--theme-primary)', fontVariantNumeric: 'tabular-nums' }}>−{formatPrice(promoSaving)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[13px]">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Доставка</span>
                  <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>Бесплатно</span>
                </div>
                {totalSaving > 0 && (
                  <div
                    className="rounded-[10px] px-3 py-2 flex items-center justify-between text-[12px]"
                    style={{ background: 'rgba(var(--theme-primary-rgb,205,255,56),0.07)', border: '0.5px solid rgba(var(--theme-primary-rgb,205,255,56),0.15)' }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.55)' }}>Ваша экономия</span>
                    <span className="font-bold" style={{ color: 'var(--theme-primary)', fontVariantNumeric: 'tabular-nums' }}>−{formatPrice(totalSaving)}</span>
                  </div>
                )}
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold" style={{ letterSpacing: '-0.01em' }}>Итого</span>
                  <span className="text-[18px] font-black" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="px-4 mt-3">
              <TrustBadges variant="compact" />
            </div>

            {/* Fixed checkout button */}
            <div
              className="fixed bottom-[88px] left-0 right-0 px-4 py-3"
              style={{
                background:
                  'linear-gradient(to top, var(--theme-background) 60%, transparent)',
              }}
            >
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 rounded-full font-black text-black text-[15px] transition-all active:scale-[0.98]"
                style={{
                  background: 'var(--theme-primary)',
                  letterSpacing: '-0.01em',
                }}
                data-testid="button-checkout"
              >
                Оформить заказ · {formatPrice(finalTotal)}
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
              total={finalTotal}
              currency="₽"
              onOrderComplete={handleCheckout}
              storeName="RADIANCE"
            />
          </>
        )}
      </div>
    );
  }

  // PROFILE PAGE — 2026 MEMBERSHIP TIER REDESIGN
  if (activeTab === 'profile') {
    const membershipTier = ordersCount >= 5 ? 'Gold' : ordersCount >= 2 ? 'Silver' : 'Bronze';
    const membershipTierRu = ordersCount >= 5 ? 'Золотой' : ordersCount >= 2 ? 'Серебряный' : 'Бронзовый';
    const tierGradient =
      membershipTier === 'Gold'
        ? 'linear-gradient(135deg, #B8860B 0%, #FFD700 40%, #DAA520 70%, #B8860B 100%)'
        : membershipTier === 'Silver'
        ? 'linear-gradient(135deg, #606060 0%, #C0C0C0 40%, #A8A8A8 70%, #707070 100%)'
        : 'linear-gradient(135deg, #7C4A1E 0%, #CD7F32 40%, #A0602A 70%, #7C4A1E 100%)';

    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        {/* ─── Profile Header ─── */}
        <div className="px-5 pt-5 pb-4">
          <p
            className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            RADIANCE
          </p>
          <h1
            className="leading-none"
            style={{
              fontSize: '30px',
              fontWeight: 300,
              letterSpacing: '0.06em',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
            }}
          >
            Профиль
          </h1>
        </div>

        {/* ─── Membership Card ─── */}
        <div className="px-4 mb-5">
          <div
            className="relative rounded-[22px] overflow-hidden p-5"
            style={{
              background: tierGradient,
              minHeight: '140px',
            }}
          >
            {/* Shine sweep animation */}
            <m.div
              className="absolute inset-0 pointer-events-none"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)',
                zIndex: 1,
              }}
            />
            {/* Decorative circles */}
            <div
              className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-20"
              style={{ background: 'rgba(255,255,255,0.4)' }}
            />
            <div
              className="absolute -right-2 top-12 w-20 h-20 rounded-full opacity-15"
              style={{ background: 'rgba(255,255,255,0.4)' }}
            />

            {/* User row */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
              {/* Initials avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 select-none"
                style={{ background: 'rgba(0,0,0,0.28)', border: '1.5px solid rgba(255,255,255,0.3)' }}
              >
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  АП
                </span>
              </div>
              <div>
                <p className="text-[15px] font-black text-white leading-tight" style={{ letterSpacing: '-0.02em' }}>
                  Александр Петров
                </p>
                <p className="text-[11px] text-white/70">+7 (999) 123-45-67</p>
              </div>
            </div>

            {/* Membership tier + stats */}
            <div className="relative z-10">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-white/60 mb-0.5">
                    Статус участника
                  </p>
                  <p className="text-[20px] font-black text-white leading-none" style={{ letterSpacing: '-0.03em' }}>
                    {membershipTierRu} Участник
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-white/60 mb-0.5">
                    Бонусы
                  </p>
                  <p className="text-[20px] font-black text-white leading-none" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                    {(ordersCount * 450).toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
              {/* Tier progress bar */}
              {membershipTier !== 'Gold' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] text-white/50" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      {membershipTier === 'Bronze'
                        ? `${ordersCount} из 2 заказов до Серебряного`
                        : `${ordersCount} из 5 заказов до Золотого`}
                    </p>
                    <p className="text-[9px] font-bold text-white/70" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      {membershipTier === 'Bronze'
                        ? `${Math.min(100, Math.round(ordersCount / 2 * 100))}%`
                        : `${Math.min(100, Math.round(ordersCount / 5 * 100))}%`}
                    </p>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: '4px', background: 'rgba(0,0,0,0.25)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: membershipTier === 'Bronze'
                          ? `${Math.min(100, ordersCount / 2 * 100)}%`
                          : `${Math.min(100, ordersCount / 5 * 100)}%`,
                        background: 'rgba(255,255,255,0.85)',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              )}
              {membershipTier === 'Gold' && (
                <p className="text-[10px] font-semibold text-white/70 tracking-[0.1em] uppercase" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  ✦ Максимальный статус достигнут
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ─── Quick Stats ─── */}
        <div className="px-4 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-[18px] p-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.09)',
              }}
            >
              <p
                className="text-[9px] font-semibold tracking-[0.2em] uppercase mb-1"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Заказы
              </p>
              <p
                className="text-[32px] font-black leading-none"
                style={{ letterSpacing: '-0.04em' }}
              >
                {ordersCount}
              </p>
            </div>
            <div
              className="rounded-[18px] p-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.09)',
              }}
            >
              <p
                className="text-[9px] font-semibold tracking-[0.2em] uppercase mb-1"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                Избранное
              </p>
              <p
                className="text-[32px] font-black leading-none"
                style={{ letterSpacing: '-0.04em' }}
              >
                {favoritesCount}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Recent Orders ─── */}
        <div className="px-4 mb-5">
          <p
            className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-3"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Последние заказы
          </p>

          {orders.length === 0 ? (
            <div
              className="rounded-[18px] p-6 text-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              <Package
                className="w-10 h-10 mx-auto mb-2"
                style={{ color: 'rgba(255,255,255,0.2)' }}
              />
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                У вас пока нет заказов
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="rounded-[16px] px-4 py-3.5 flex items-center justify-between"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                  }}
                  data-testid={`order-${order.id}`}
                >
                  <div>
                    <p className="text-[12px] font-bold" style={{ letterSpacing: '-0.01em' }}>
                      Заказ #{order.id.slice(-6)}
                    </p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'} · {formatPrice(order.total)}
                    </p>
                  </div>
                  <span
                    className="text-[9px] font-bold px-2.5 py-1 rounded-full tracking-[0.08em] uppercase"
                    style={{
                      background: 'rgba(var(--theme-primary-rgb, 16,185,129),0.15)',
                      color: 'var(--theme-primary)',
                      border: '0.5px solid rgba(var(--theme-primary-rgb, 16,185,129),0.25)',
                    }}
                  >
                    {order.status === 'pending'
                      ? 'Ожидает'
                      : order.status === 'confirmed'
                      ? 'Подтверждён'
                      : order.status === 'processing'
                      ? 'В обработке'
                      : order.status === 'shipped'
                      ? 'Отправлен'
                      : 'Доставлен'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Menu ─── */}
        <div className="px-4 space-y-2">
          {[
            { icon: Package, label: 'История заказов', testId: 'button-orders' },
            { icon: Heart, label: 'Избранное', testId: 'button-favorites' },
            { icon: CreditCard, label: 'Способы оплаты', testId: 'button-payment' },
            { icon: MapPin, label: 'Адреса доставки', testId: 'button-address' },
            { icon: Settings, label: 'Настройки', testId: 'button-settings' },
          ].map(({ icon: Icon, label, testId }) => (
            <button
              key={testId}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] transition-all active:scale-[0.98]"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
              data-testid={testId}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.6)' }} />
                </div>
                <span className="text-[14px] font-medium" style={{ letterSpacing: '-0.01em' }}>
                  {label}
                </span>
              </div>
              <ChevronLeft
                className="w-4 h-4 rotate-180"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              />
            </button>
          ))}

          {/* Logout */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] transition-all active:scale-[0.98] mt-2"
            style={{
              background: 'rgba(239,68,68,0.07)',
              border: '0.5px solid rgba(239,68,68,0.18)',
            }}
            data-testid="button-logout"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)' }}
            >
              <LogOut className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-[14px] font-medium text-red-400" style={{ letterSpacing: '-0.01em' }}>
              Выйти
            </span>
          </button>
        </div>

        <div className="h-4" />
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
