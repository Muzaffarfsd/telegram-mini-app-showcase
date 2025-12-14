import { useState, useEffect, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Shield, Target, Check, Home, Grid, Tag, Plus, Minus } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { useFilter } from "@/hooks/useFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { LazyImage, UrgencyIndicator, TrustBadges, DemoThemeProvider } from "@/components/shared";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";

const STORE_KEY = 'labsurvivalist-store';

const PRODUCT_IMAGES = {
  fieldVest: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=800&h=1200&fit=crop&q=90',
  tacticalJacket: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=1200&fit=crop&q=90',
  cargoPants: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1200&fit=crop&q=90',
  combatBoots: 'https://images.unsplash.com/photo-1542840843-3349799cded6?w=800&h=1200&fit=crop&q=90',
  utilityBackpack: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1200&fit=crop&q=90',
  techGloves: 'https://images.unsplash.com/photo-1585488763765-33cd7b9b8c26?w=800&h=1200&fit=crop&q=90',
  tacticalBelt: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&h=1200&fit=crop&q=90',
  survivalJacket: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=1200&fit=crop&q=90',
  reinforcedPants: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1200&fit=crop&q=90',
  baseLayerSet: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&h=1200&fit=crop&q=90',
};

interface LabSurvivalistProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  description: string;
  materials: string[];
  features: string[];
  durability: string;
  environment: string;
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
    image: PRODUCT_IMAGES.fieldVest, 
    hoverImage: PRODUCT_IMAGES.fieldVest,
    description: 'Тактический разгрузочный жилет военного класса с 12 независимыми карманами и системой быстрого сброса Cobra Buckle. Изготовлен из баллистического нейлона 500D с антиабразивным покрытием DuPont Teflon для максимальной износостойкости. Модульная платформа MOLLE позволяет крепить дополнительное снаряжение весом до 15 кг. Используется тактическими группами в зонах повышенного риска.',
    materials: ['Баллистический нейлон 500D', 'DuPont Teflon покрытие', 'Cobra Buckle фурнитура', 'YKK молнии'],
    features: ['MOLLE платформа', '12 независимых карманов', 'Система быстрого сброса', 'Регулируемые лямки'],
    durability: '15,000 циклов износа, нагрузка до 15 кг, устойчивость к истиранию класс 4',
    environment: 'Городские операции, полевые условия, охрана, страйкбол',
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
    image: PRODUCT_IMAGES.tacticalJacket, 
    hoverImage: PRODUCT_IMAGES.tacticalJacket,
    description: 'Премиальная тактическая куртка для экстремальных условий с трехслойной мембраной eVent DValpine и усиленными швами Cordura 1000D. Выдерживает температурный диапазон от -35°C до +45°C благодаря съемной системе утепления Primaloft Gold. Интегрированный капюшон с баллистической защитой и скрытые карманы для оперативного снаряжения. Стандарт экипировки спецподразделений в арктических и пустынных миссиях.',
    materials: ['Cordura 1000D', 'Мембрана eVent DValpine', 'Primaloft Gold утеплитель', 'YKK Aquaguard молнии'],
    features: ['MOLLE система', 'Скрытые карманы для снаряжения', 'Вентиляция подмышек', 'Съемный капюшон с защитой'],
    durability: '12,000 циклов износа, водонепроницаемость 20,000 мм, устойчивость к разрывам 180N',
    environment: 'Арктика, пустыня, горы, городские операции',
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
    image: PRODUCT_IMAGES.cargoPants, 
    hoverImage: PRODUCT_IMAGES.cargoPants,
    description: 'Тактические брюки карго с усиленными зонами коленей из материала Schoeller Keprotec и эргономичным кроем для максимальной подвижности. Ткань Ripstop 330 GSM с водоотталкивающей пропиткой DWR обеспечивает защиту в любых погодных условиях. 8 функциональных карманов включая скрытые отсеки для документов и ножа. Применяются оперативниками и инструкторами по выживанию.',
    materials: ['Ripstop 330 GSM', 'Schoeller Keprotec вставки', 'DWR пропитка', 'Prym фурнитура'],
    features: ['8 функциональных карманов', 'Усиленные колени', 'Скрытые отсеки', 'Эргономичный крой'],
    durability: '8,000 циклов износа, водоотталкивание 5,000 мм, устойчивость к разрывам 120N',
    environment: 'Лес, горы, городская среда, полевые учения',
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
    image: PRODUCT_IMAGES.combatBoots, 
    hoverImage: PRODUCT_IMAGES.combatBoots,
    description: 'Тактические ботинки специального назначения с композитным носком и подошвой Vibram Megagrip для экстремального сцепления на любых поверхностях. Мембрана Gore-Tex Extended Comfort обеспечивает полную водонепроницаемость при сохранении воздухопроницаемости. Анатомическая стелька Ortholite с антибактериальной пропиткой и усиленная защита голеностопа. Сертифицированы для применения в спецоперациях NATO.',
    materials: ['Кожа 2.2 мм full-grain', 'Gore-Tex Extended Comfort', 'Vibram Megagrip подошва', 'Композитный носок'],
    features: ['Композитная защита носка', 'Антипрокольная стелька', 'Быстрая шнуровка', 'Защита голеностопа'],
    durability: '500 км активной эксплуатации, водонепроницаемость класс 4, термостойкость -30°C/+50°C',
    environment: 'Горы, болота, городские развалины, арктические условия',
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
    image: PRODUCT_IMAGES.utilityBackpack, 
    hoverImage: PRODUCT_IMAGES.utilityBackpack,
    description: 'Штурмовой рюкзак объемом 45 литров с полной MOLLE-совместимостью и интегрированной системой гидратации на 3 литра. Каркас из алюминиевого сплава 7075-T6 распределяет нагрузку до 25 кг на поясной ремень. Материал Cordura 1100D с полиуретановым покрытием обеспечивает абсолютную водонепроницаемость. Стандартное снаряжение горных егерей и поисково-спасательных групп.',
    materials: ['Cordura 1100D', 'Алюминий 7075-T6 каркас', 'Полиуретановое покрытие', 'Duraflex фурнитура'],
    features: ['MOLLE система 360°', 'Гидратор 3л', 'Каркасная система', 'Быстрый доступ к снаряжению'],
    durability: '20,000 циклов износа, нагрузка до 25 кг, водонепроницаемость IPX6',
    environment: 'Горы, арктика, джунгли, длительные экспедиции',
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
    image: PRODUCT_IMAGES.techGloves, 
    hoverImage: PRODUCT_IMAGES.techGloves,
    description: 'Тактические перчатки операторского класса с сенсорными кончиками пальцев из серебряного волокна для работы с электроникой при любой температуре. Ладонная часть из козьей кожи Pittards с кевларовым армированием обеспечивает защиту от порезов уровня А3. Интегрированные карбоновые протекторы костяшек и технология регулировки влажности Outlast. Применяются снайперами и операторами беспилотников.',
    materials: ['Козья кожа Pittards', 'Кевларовое армирование', 'Карбоновые протекторы', 'Серебряное волокно'],
    features: ['Сенсорные пальцы', 'Защита костяшек', 'Терморегуляция Outlast', 'Усиленная ладонь'],
    durability: '3,000 циклов износа, защита от порезов А3, термостойкость -20°C/+40°C',
    environment: 'Городские операции, стрельбище, работа с техникой',
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
    image: PRODUCT_IMAGES.tacticalBelt, 
    hoverImage: PRODUCT_IMAGES.tacticalBelt,
    description: 'Двухслойный тактический ремень с внутренним Velcro-креплением и быстросъемной пряжкой AustriAlpin Cobra для мгновенного сброса снаряжения. Жесткий полимерный сердечник обеспечивает стабильную платформу для кобуры и подсумков весом до 8 кг. Нейлоновая стропа MIL-SPEC с усиленными краями не деформируется при длительных нагрузках. Выбор инструкторов по стрелковой подготовке.',
    materials: ['Нейлон MIL-SPEC 1.75"', 'AustriAlpin Cobra пряжка', 'Полимерный сердечник', 'Velcro 3M'],
    features: ['Быстрый сброс', 'Velcro крепление', 'Жесткая платформа', 'Совместимость с кобурами'],
    durability: '10,000 циклов застегивания, нагрузка до 8 кг, разрывная прочность 2,000 кг',
    environment: 'Стрельбище, городские операции, повседневное ношение',
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
    image: PRODUCT_IMAGES.survivalJacket, 
    hoverImage: PRODUCT_IMAGES.survivalJacket,
    description: 'Экспедиционная куртка для автономного выживания с интегрированными светоотражающими элементами 3M Scotchlite и аварийным свистком. Четырехслойная конструкция с мембраной Gore-Tex Pro и утеплителем Climashield Apex выдерживает температуры до -50°C. Встроенный аварийный капюшон-бивуак и 14 специализированных карманов для выживания. Официальная экипировка арктических экспедиций и горноспасательных служб.',
    materials: ['Gore-Tex Pro мембрана', 'Climashield Apex утеплитель', '3M Scotchlite отражатели', 'Cordura 500D'],
    features: ['Капюшон-бивуак', '14 карманов выживания', 'Аварийный свисток', 'Отражающие элементы'],
    durability: '15,000 циклов износа, водонепроницаемость 28,000 мм, термозащита до -50°C',
    environment: 'Арктика, высокогорье, зимние экспедиции, спасательные операции',
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
    image: PRODUCT_IMAGES.reinforcedPants, 
    hoverImage: PRODUCT_IMAGES.reinforcedPants,
    description: 'Боевые брюки с интегрированными D3O протекторами коленей и бедер для максимальной защиты при падениях и ударах. Ткань Schoeller Dryskin с четырехсторонним стрейчем обеспечивает неограниченную подвижность при выполнении тактических маневров. Усиленная зона сидения из Cordura 1000D и вентиляционные панели в паховой области. Стандарт экипировки мотоциклетных спецподразделений и тактических инструкторов.',
    materials: ['Schoeller Dryskin', 'D3O протекторы', 'Cordura 1000D усиление', 'YKK молнии'],
    features: ['D3O защита коленей', 'Усиленная зона сидения', 'Вентиляция', '4-сторонний стрейч'],
    durability: '10,000 циклов износа, защита от ударов CE Level 2, устойчивость к разрывам 150N',
    environment: 'Мотоциклетные операции, CQB, тактические тренировки',
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
    image: PRODUCT_IMAGES.baseLayerSet, 
    hoverImage: PRODUCT_IMAGES.baseLayerSet,
    description: 'Комплект термобелья первого слоя из мериносовой шерсти 18.5 микрон с технологией Polartec Power Dry для агрессивного отвода влаги. Бесшовная конструкция Flatlock устраняет натирания при многодневном ношении в полевых условиях. Антибактериальная обработка Polygiene сохраняет свежесть до 7 дней автономной эксплуатации. Базовый слой для арктических экспедиций и высокогорного альпинизма.',
    materials: ['Меринос 18.5 микрон', 'Polartec Power Dry', 'Flatlock швы', 'Polygiene обработка'],
    features: ['Бесшовная конструкция', 'Антибактериальная защита', 'Терморегуляция', 'Быстрое высыхание'],
    durability: '5,000 циклов стирки, терморегуляция -40°C/+30°C, время высыхания 2 часа',
    environment: 'Арктика, высокогорье, длительные экспедиции, зимние виды спорта',
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

function LabSurvivalist({ activeTab, onTabChange }: LabSurvivalistProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const { toast } = useToast();
  const sidebar = useDemoSidebar();

  const { 
    cartItems: cart, 
    addToCart: addToCartHook, 
    removeFromCart, 
    updateQuantity,
    clearCart, 
    totalAmount: cartTotal,
    totalItems: cartCount 
  } = usePersistentCart({ storageKey: `${STORE_KEY}_cart` });
  
  const { 
    toggleFavorite: toggleFavoriteHook, 
    isFavorite,
    favoritesCount 
  } = usePersistentFavorites({ storageKey: `${STORE_KEY}_favorites` });
  
  const { 
    orders, 
    createOrder,
    ordersCount 
  } = usePersistentOrders({ storageKey: `${STORE_KEY}_orders` });

  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home' },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog' },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: '#22C55E' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: products,
    searchFields: ['name', 'description', 'category', 'brand'] as (keyof Product)[],
  });

  const handleImageLoad = (id: number) => {
    setLoadedImages(prev => new Set([...Array.from(prev), id]));
  };

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

  const handleToggleFavorite = (productId: number) => {
    toggleFavoriteHook(String(productId));
    const isNowFavorite = !isFavorite(String(productId));
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
      description: `${selectedProduct.name} • ${selectedColor} • ${selectedSize}`,
      duration: 2000,
    });
    
    setSelectedProduct(null);
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
      <div className="min-h-screen text-white smooth-scroll-page" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
            aria-label="Назад"
            data-testid="button-back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(selectedProduct.id);
            }}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"
            aria-label={isFavorite(String(selectedProduct.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
            data-testid={`button-favorite-${selectedProduct.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite(String(selectedProduct.id)) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] scroll-fade-in">
          <LazyImage
            src={selectedProduct.hoverImage}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
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
                  aria-label={`Цвет ${color}`}
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
                  aria-label={`Размер ${size}`}
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
                className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-white/90 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2 scroll-fade-in-delay-5 min-h-[48px]"
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
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="LAB"
          subtitle="SURVIVALIST"
          accentColor="var(--theme-primary)"
          bgColor="var(--theme-background)"
        />
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button 
              onClick={sidebar.open} 
              aria-label="Меню" 
              className="w-11 h-11 flex items-center justify-center"
              data-testid="button-menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <button 
                className="w-11 h-11 flex items-center justify-center"
                aria-label="Корзина"
                data-testid="button-view-cart"
              >
                <ShoppingBag className="w-6 h-6" />
              </button>
              <button 
                className="w-11 h-11 flex items-center justify-center"
                aria-label="Избранное"
                data-testid="button-view-favorites"
              >
                <Heart className="w-6 h-6" />
              </button>
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
              className="p-2 bg-white rounded-lg flex-shrink-0 w-11 h-11 flex items-center justify-center"
              aria-label="Главная"
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
                className={`text-sm font-mono uppercase tracking-wider transition-colors flex-shrink-0 min-h-[44px] px-3 ${
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
            <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-lg px-4 py-3 flex items-center gap-2 border border-white/10 min-h-[48px]">
              <Search className="w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Поиск снаряжения..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent text-white placeholder:text-white/40 outline-none flex-1 text-sm font-mono"
                aria-label="Поиск"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="relative mb-6 mx-6 rounded-2xl overflow-hidden border border-white/10 scroll-fade-in" style={{ height: '500px' }}>
          <LazyImage
            src={PRODUCT_IMAGES.fieldVest}
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
                className="px-8 py-4 rounded-lg font-bold text-black transition-all hover:scale-105 bg-white uppercase tracking-wider text-sm min-h-[48px]"
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
                <LazyImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>

              <div className="absolute top-4 left-4">
                {product.isNew && (
                  <div className="px-3 py-1 bg-white text-black text-xs font-mono font-bold rounded-lg">
                    NEW
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(product.id);
                }}
                className="absolute top-4 right-4 w-11 h-11 rounded-lg bg-black/60 backdrop-blur-xl flex items-center justify-center border border-white/20"
                aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                data-testid={`button-favorite-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/10 backdrop-blur-md rounded-lg mb-3">
                  <Shield className="w-3 h-3" />
                  <span className="text-xs font-mono tracking-wider">{product.brand}</span>
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{product.name}</h3>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-bold">{formatPrice(product.price)}</p>
                  {product.oldPrice && (
                    <p className="text-sm text-white/30 line-through">{formatPrice(product.oldPrice)}</p>
                  )}
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
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-2xl font-bold uppercase tracking-wider font-mono">Каталог</h1>
            <div className="flex items-center gap-2">
              <button 
                className="w-11 h-11 flex items-center justify-center" 
                aria-label="Поиск"
                data-testid="button-view-search"
              >
                <Search className="w-6 h-6" />
              </button>
              <button 
                className="w-11 h-11 flex items-center justify-center" 
                aria-label="Фильтр"
                data-testid="button-view-filter"
              >
                <Filter className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide scroll-fade-in">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-lg text-sm font-mono font-semibold whitespace-nowrap transition-all border uppercase tracking-wider min-h-[44px] ${
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
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 rounded-lg bg-black/60 backdrop-blur-xl flex items-center justify-center border border-white/20"
                    aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    data-testid={`button-favorite-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite(String(product.id)) ? 'fill-white text-white' : 'text-white'}`}
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
    return (
      <div className="min-h-screen bg-black text-white pb-32 smooth-scroll-page">
        <div className="p-6">
          <h1 className="text-3xl font-black mb-6 tracking-tight scroll-fade-in uppercase">КОРЗИНА</h1>

          {cart.length === 0 ? (
            <EmptyState
              type="cart"
              actionLabel="В каталог"
              onAction={() => onTabChange?.('catalog')}
              className="py-20"
            />
          ) : (
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
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
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                    aria-label="Удалить из корзины"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-black border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-mono uppercase tracking-wider">Итого:</span>
                  <span className="text-3xl font-bold">{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-white text-black font-bold py-4 rounded-lg hover:bg-white/90 transition-all uppercase tracking-wider text-sm min-h-[48px]"
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
                storeName="LAB SURVIVALIST"
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
      <div className="min-h-screen bg-black text-white pb-24 smooth-scroll-page">
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
              <p className="text-2xl font-bold">{ordersCount}</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 scroll-fade-in">
              <p className="text-sm text-white/60 mb-1 font-mono uppercase tracking-wider">Избранное</p>
              <p className="text-2xl font-bold">{favoritesCount}</p>
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
                    <span className="text-sm font-mono">Заказ #{order.id.slice(-6)}</span>
                    <span className="text-white/60 text-sm font-mono">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-white/70 font-mono">{order.items.length} товаров</span>
                    <span className="font-bold">{formatPrice(order.total)}</span>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-mono">
                      {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтверждён' : order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-1 min-h-[56px]" data-testid="button-view-orders">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Мои заказы</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-2 min-h-[56px]" data-testid="button-view-favorites">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-3 min-h-[56px]" data-testid="button-view-payment">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-4 min-h-[56px]" data-testid="button-view-address">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all scroll-fade-in-delay-5 min-h-[56px]" data-testid="button-view-settings">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-white/60" />
              <span className="font-mono uppercase tracking-wider text-sm">Настройки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
          </button>

          <button className="w-full p-4 bg-red-500/10 backdrop-blur-xl rounded-xl border border-red-500/20 flex items-center justify-between hover:bg-red-500/20 transition-all mt-4 min-h-[56px]" data-testid="button-logout">
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

function LabSurvivalistWithTheme(props: LabSurvivalistProps) {
  return (
    <DemoThemeProvider themeId="labSurvivalist">
      <LabSurvivalist {...props} />
    </DemoThemeProvider>
  );
}

export default memo(LabSurvivalistWithTheme);
