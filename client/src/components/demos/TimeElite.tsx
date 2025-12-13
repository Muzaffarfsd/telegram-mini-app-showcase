import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Watch, TrendingUp, Award, Search, Menu, Home, Grid, Tag, Plus, Minus, Clock, Droplets, Gem, Gauge } from "lucide-react";
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

interface TimeEliteProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

const STORE_KEY = 'timeelite-store';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
  category: string;
  inStock: number;
  rating: number;
  movement: string;
  waterResistance: string;
  material: string;
  diameter: string;
  heritage: string;
  complications: string[];
  colorHex: string;
  isNew?: boolean;
  isTrending?: boolean;
  strapTypes?: string[];
}

const STRAP_OPTIONS = ['Браслет', 'Кожа', 'Каучук'] as const;

const products: Product[] = [
  { 
    id: 1, 
    name: 'Rolex Submariner', 
    brand: 'Rolex', 
    price: 1125000, 
    oldPrice: 1350000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1200&fit=crop&q=90', 
    description: 'Воплощение подводной элегантности. Безупречный автоподзавод. Oyster-корпус из стали 904L. Водозащита 300 метров.',
    category: 'Rolex', 
    inStock: 3, 
    rating: 4.9, 
    movement: 'Автоматический', 
    waterResistance: '300м', 
    material: 'Сталь 904L', 
    diameter: '40мм',
    heritage: 'С 1953 года — символ глубоководных исследований. Выбор профессиональных дайверов и коллекционеров со всего мира.',
    complications: ['Дата', 'Вращающийся безель', 'Люминесцентные метки'],
    colorHex: '#1A365D',
    isNew: true,
    isTrending: true,
    strapTypes: ['Браслет', 'Каучук']
  },
  { 
    id: 2, 
    name: 'Patek Philippe Calatrava', 
    brand: 'Patek Philippe', 
    price: 2565000, 
    oldPrice: 2890000,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=1200&fit=crop&q=90', 
    description: 'Эссенция женевского мастерства. Ручная гравировка механизма. Сапфировое стекло с антибликом. Вечная классика.',
    category: 'Patek', 
    inStock: 2, 
    rating: 4.95, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Белое золото', 
    diameter: '39мм',
    heritage: 'Женева, с 1839 года. Каждый экземпляр — инвестиция в наследие. Передается из поколения в поколение.',
    complications: ['Малая секундная стрелка', 'Сапфировая задняя крышка'],
    colorHex: '#2D2D2D',
    isNew: true,
    isTrending: true,
    strapTypes: ['Кожа']
  },
  { 
    id: 3, 
    name: 'Omega Speedmaster', 
    brand: 'Omega', 
    price: 585000, 
    oldPrice: 720000,
    image: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=800&h=1200&fit=crop&q=90', 
    description: 'Лунное наследие NASA. Мануфактурный калибр 3861. Hesalite-стекло оригинальной спецификации. История на запястье.',
    category: 'Omega', 
    inStock: 5, 
    rating: 4.8, 
    movement: 'Механический', 
    waterResistance: '50м', 
    material: 'Сталь', 
    diameter: '42мм',
    heritage: 'Единственные часы, сертифицированные NASA для космических миссий. На Луне с 1969 года.',
    complications: ['Хронограф', 'Тахиметр', 'Малые секунды'],
    colorHex: '#1A1A1A',
    isNew: true,
    isTrending: true,
    strapTypes: ['Браслет', 'Кожа']
  },
  { 
    id: 4, 
    name: 'Cartier Santos', 
    brand: 'Cartier', 
    price: 765000, 
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&h=1200&fit=crop&q=90', 
    description: 'Рождение авиационной легенды. Квадратный корпус безупречных пропорций. Система QuickSwitch. Парижский шарм.',
    category: 'Cartier', 
    inStock: 4, 
    rating: 4.7, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь', 
    diameter: '39.8мм',
    heritage: 'Созданы в 1904 году для пионера авиации Альберто Сантос-Дюмона. Первые наручные часы для мужчин.',
    complications: ['Дата', 'Быстросменный браслет'],
    colorHex: '#C0C0C0',
    isTrending: true,
    strapTypes: ['Браслет', 'Кожа', 'Каучук']
  },
  { 
    id: 5, 
    name: 'Audemars Piguet Royal Oak', 
    brand: 'Audemars Piguet', 
    price: 3150000, 
    oldPrice: 3600000,
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&h=1200&fit=crop&q=90', 
    description: 'Революция Джеральда Дженты. Восьмиугольный безель с винтами. Интегрированный браслет. Petite Tapisserie циферблат.',
    category: 'Люкс', 
    inStock: 2, 
    rating: 4.92, 
    movement: 'Автоматический', 
    waterResistance: '50м', 
    material: 'Сталь', 
    diameter: '41мм',
    heritage: 'Le Brassus, с 1875 года. Royal Oak 1972 года изменил представление о спортивных часах класса люкс.',
    complications: ['Дата', 'Индикатор запаса хода'],
    colorHex: '#1E3A5F',
    isNew: true,
    isTrending: true,
    strapTypes: ['Браслет']
  },
  { 
    id: 6, 
    name: 'Rolex Datejust', 
    brand: 'Rolex', 
    price: 882000, 
    image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&h=1200&fit=crop&q=90', 
    description: 'Архетип элегантности. Циклоп-линза над датой. Юбилейный браслет. Рифленый безель белого золота.',
    category: 'Rolex', 
    inStock: 6, 
    rating: 4.85, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь и золото', 
    diameter: '41мм',
    heritage: 'С 1945 года — первые часы с автоматически меняющейся датой. Выбор лидеров и визионеров.',
    complications: ['Дата с циклопом', 'Рифленый безель'],
    colorHex: '#D4AF37',
    strapTypes: ['Браслет', 'Кожа']
  },
  { 
    id: 7, 
    name: 'Jaeger-LeCoultre Reverso', 
    brand: 'Jaeger-LeCoultre', 
    price: 1620000, 
    oldPrice: 1890000,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&h=1200&fit=crop&q=90', 
    description: 'Арт-Деко совершенство. Переворачивающийся корпус для персонализации. Ручная полировка граней. Два лица времени.',
    category: 'Люкс', 
    inStock: 3, 
    rating: 4.85, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Розовое золото', 
    diameter: '26мм x 42мм',
    heritage: 'Валле-де-Жу, с 1931 года. Создан для игроков в поло. Более 1000 калибров в истории мануфактуры.',
    complications: ['Поворотный корпус', 'Малые секунды', 'Двойной циферблат'],
    colorHex: '#B76E79',
    isNew: true
  },
  { 
    id: 8, 
    name: 'Vacheron Constantin Patrimony', 
    brand: 'Vacheron Constantin', 
    price: 2880000, 
    image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&h=1200&fit=crop&q=90', 
    description: 'Старейший дом без перерыва. Ультратонкий профиль 8.1мм. Женевское клеймо качества. Минималистичная чистота.',
    category: 'Люкс', 
    inStock: 1, 
    rating: 4.9, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Розовое золото', 
    diameter: '40мм',
    heritage: 'Женева, непрерывно с 1755 года. Старейшая часовая мануфактура мира. Хранитель традиций.',
    complications: ['Ультратонкий механизм', 'Женевское клеймо'],
    colorHex: '#B76E79',
    isTrending: true
  },
  { 
    id: 9, 
    name: 'Omega Seamaster', 
    brand: 'Omega', 
    price: 468000, 
    oldPrice: 540000,
    image: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800&h=1200&fit=crop&q=90', 
    description: 'Инструмент агента 007. Керамический безель. Гелиевый клапан. Master Chronometer сертификация METAS.',
    category: 'Omega', 
    inStock: 7, 
    rating: 4.75, 
    movement: 'Автоматический', 
    waterResistance: '300м', 
    material: 'Сталь', 
    diameter: '42мм',
    heritage: 'С 1948 года. Официальные часы Джеймса Бонда. Выбор профессиональных дайверов и Королевского флота.',
    complications: ['Дата', 'Гелиевый клапан', 'Вращающийся безель'],
    colorHex: '#1E3A5F',
    isNew: true
  },
  { 
    id: 10, 
    name: 'Cartier Tank', 
    brand: 'Cartier', 
    price: 648000, 
    image: 'https://images.unsplash.com/photo-1619946794135-5bc917a27793?w=800&h=1200&fit=crop&q=90', 
    description: 'Геометрия времени. Вертикальные бранкарды корпуса. Римские цифры. Сапфировая кабошон-заводная головка.',
    category: 'Cartier', 
    inStock: 5, 
    rating: 4.8, 
    movement: 'Кварцевый', 
    waterResistance: '30м', 
    material: 'Желтое золото', 
    diameter: '29.5 x 22мм',
    heritage: 'С 1917 года. Вдохновлены силуэтом танка Рено. Любимые часы Энди Уорхола и Жаклин Кеннеди.',
    complications: ['Секретная застежка', 'Кабошон сапфира'],
    colorHex: '#D4AF37'
  },
  { 
    id: 11, 
    name: 'Rolex GMT-Master II', 
    brand: 'Rolex', 
    price: 1278000, 
    oldPrice: 1490000,
    image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=800&h=1200&fit=crop&q=90', 
    description: 'Компаньон путешественника. Двухцветный Cerachrom-безель. Стрелка GMT. Три часовых пояса одновременно.',
    category: 'Rolex', 
    inStock: 4, 
    rating: 4.88, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь и золото', 
    diameter: '40мм',
    heritage: 'Созданы в 1955 году для пилотов Pan Am. Легендарный Pepsi-безель. Икона трансатлантических перелетов.',
    complications: ['Два часовых пояса', 'Дата', 'Вращающийся безель 24ч'],
    colorHex: '#1A365D',
    isNew: true,
    isTrending: true
  },
  { 
    id: 12, 
    name: 'Patek Philippe Nautilus', 
    brand: 'Patek Philippe', 
    price: 3780000, 
    image: 'https://images.unsplash.com/photo-1585129819477-2f3f6f2d457d?w=800&h=1200&fit=crop&q=90', 
    description: 'Святой Грааль коллекционеров. Иллюминаторный дизайн Дженты. Горизонтальный рельеф циферблата. Листы ожидания.',
    category: 'Patek', 
    inStock: 1, 
    rating: 4.98, 
    movement: 'Автоматический', 
    waterResistance: '120м', 
    material: 'Сталь', 
    diameter: '40мм',
    heritage: 'С 1976 года. Дизайн Джеральда Дженты за один вечер на салфетке. Самые желанные часы десятилетия.',
    complications: ['Дата', 'Индикатор запаса хода', 'Секундомер'],
    colorHex: '#1E3A5F',
    isTrending: true
  },
  { 
    id: 13, 
    name: 'A. Lange & Söhne Lange 1', 
    brand: 'A. Lange & Söhne', 
    price: 3420000, 
    oldPrice: 3800000,
    image: 'https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=800&h=1200&fit=crop&q=90', 
    description: 'Саксонское превосходство. Большая дата с мгновенным переключением. Эксцентричный циферблат. Ручная гравировка.',
    category: 'Люкс', 
    inStock: 2, 
    rating: 4.95, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Розовое золото', 
    diameter: '38.5мм',
    heritage: 'Гласхютте, возрождение с 1994 года. Немецкая точность и мастерство. Трехчетвертная платина.',
    complications: ['Большая дата', 'Индикатор запаса хода', 'Малые секунды'],
    colorHex: '#B76E79',
    isNew: true
  },
  { 
    id: 14, 
    name: 'Omega Constellation', 
    brand: 'Omega', 
    price: 432000, 
    image: 'https://images.unsplash.com/photo-1509941943102-10c232fc06c4?w=800&h=1200&fit=crop&q=90', 
    description: 'Звездная точность хронометра. Когти на корпусе. Pie-pan циферблат. Обсерватория на задней крышке.',
    category: 'Omega', 
    inStock: 8, 
    rating: 4.65, 
    movement: 'Автоматический', 
    waterResistance: '50м', 
    material: 'Сталь и золото', 
    diameter: '38мм',
    heritage: 'С 1952 года. Рекордсмен точности обсерваторий. Символ — восемь звезд за точность.',
    complications: ['Дата', 'Хронометр COSC'],
    colorHex: '#D4AF37'
  },
  { 
    id: 15, 
    name: 'Cartier Ballon Bleu', 
    brand: 'Cartier', 
    price: 855000, 
    oldPrice: 990000,
    image: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800&h=1200&fit=crop&q=90', 
    description: 'Скульптурная элегантность. Сапфировый кабошон в заводной головке. Выпуклый корпус. Римская классика.',
    category: 'Cartier', 
    inStock: 6, 
    rating: 4.72, 
    movement: 'Автоматический', 
    waterResistance: '30м', 
    material: 'Сталь', 
    diameter: '42мм',
    heritage: 'С 2007 года. Вдохновлен воздушным шаром братьев Монгольфье. Новая классика Maison Cartier.',
    complications: ['Дата', 'Защищенная заводная головка'],
    colorHex: '#C0C0C0',
    isNew: true
  },
  { 
    id: 16, 
    name: 'Rolex Daytona', 
    brand: 'Rolex', 
    price: 1665000, 
    image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=800&h=1200&fit=crop&q=90', 
    description: 'Гоночное наследие. Тахиметрическая шкала Cerachrom. Хронограф с тремя счетчиками. Пол Ньюман легенда.',
    category: 'Rolex', 
    inStock: 2, 
    rating: 4.93, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь', 
    diameter: '40мм',
    heritage: 'С 1963 года. Названы в честь гонок Daytona 500. Часы Paul Newman — рекорд аукционов.',
    complications: ['Хронограф', 'Тахиметр', 'Три субциферблата'],
    colorHex: '#1A1A1A',
    isTrending: true
  },
  { 
    id: 17, 
    name: 'Patek Philippe Aquanaut', 
    brand: 'Patek Philippe', 
    price: 2250000, 
    oldPrice: 2500000,
    image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&h=1200&fit=crop&q=90', 
    description: 'Современный спортивный люкс. Тропический каучуковый ремешок. Рельефный циферблат. Молодость Patek.',
    category: 'Patek', 
    inStock: 3, 
    rating: 4.87, 
    movement: 'Автоматический', 
    waterResistance: '120м', 
    material: 'Сталь', 
    diameter: '40мм',
    heritage: 'С 1997 года. Создан для нового поколения коллекционеров. Наследник духа Nautilus.',
    complications: ['Дата', 'Секундомер', 'Композитный каучук'],
    colorHex: '#2D5A3D',
    isNew: true
  },
  { 
    id: 18, 
    name: 'Zenith El Primero', 
    brand: 'Zenith', 
    price: 648000, 
    image: 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&h=1200&fit=crop&q=90', 
    description: 'Первый высокочастотный хронограф. 36000 пк/час. Открытый баланс. Точность до десятой секунды.',
    category: 'Хронографы', 
    inStock: 5, 
    rating: 4.8, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь', 
    diameter: '42мм',
    heritage: 'Ле-Локль, с 1969 года. Калибр спасен от уничтожения. Механизм в часах Rolex Daytona 16520.',
    complications: ['Хронограф', 'Тахиметр', 'Дата', 'Открытый баланс'],
    colorHex: '#1A1A1A'
  },
  { 
    id: 19, 
    name: 'Tudor Black Bay', 
    brand: 'Tudor', 
    price: 315000, 
    oldPrice: 380000,
    image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&h=1200&fit=crop&q=90', 
    description: 'Винтажное вдохновение. Куполообразное сапфировое стекло. Заклепочный браслет. Розовая метка на безеле.',
    category: 'Спорт', 
    inStock: 10, 
    rating: 4.6, 
    movement: 'Автоматический', 
    waterResistance: '200м', 
    material: 'Сталь', 
    diameter: '41мм',
    heritage: 'Линейка с 2012 года. Наследие Rolex по доступной цене. Мануфактурный калибр MT5602.',
    complications: ['Дата', 'Вращающийся безель', 'Snowflake-стрелки'],
    colorHex: '#8B0000',
    isNew: true,
    isTrending: true
  },
  { 
    id: 20, 
    name: 'IWC Pilot\'s Watch', 
    brand: 'IWC', 
    price: 378000, 
    image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&h=1200&fit=crop&q=90', 
    description: 'Авиационное наследие Шаффхаузена. Коническая заводная головка. Мягкое железо против магнитных полей.',
    category: 'Авиация', 
    inStock: 6, 
    rating: 4.6, 
    movement: 'Автоматический', 
    waterResistance: '60м', 
    material: 'Сталь', 
    diameter: '43мм',
    heritage: 'Шаффхаузен, с 1936 года. Часы пилотов Люфтваффе. Большая заводная головка для перчаток.',
    complications: ['Дата', 'Антимагнитная защита', 'Треугольная метка 12ч'],
    colorHex: '#1A1A1A'
  }
];

const categories = ['Все', 'Rolex', 'Omega', 'Cartier', 'Patek', 'Люкс', 'Спорт'];
const brandFilters = ['All', 'Rolex', 'Omega', 'Cartier', 'Patek'];

function TimeElite({ activeTab, onTabChange }: TimeEliteProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedStrap, setSelectedStrap] = useState<string>('');
  
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
  } = usePersistentCart({ storageKey: STORE_KEY });
  
  const { 
    favorites, 
    toggleFavorite, 
    isFavorite,
    favoritesCount 
  } = usePersistentFavorites({ storageKey: STORE_KEY });
  
  const { 
    orders, 
    createOrder,
    ordersCount 
  } = usePersistentOrders({ storageKey: STORE_KEY });
  
  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home', onClick: () => onTabChange?.('home') },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog', onClick: () => onTabChange?.('catalog') },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: '#D4AF37', onClick: () => onTabChange?.('cart') },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile', onClick: () => onTabChange?.('profile') },
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
      setSelectedBrand('All');
    }
  }, [activeTab]);

  const filteredProducts = filteredItems.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    
    if (activeTab === 'home') {
      const brandMatch = selectedBrand === 'All' || p.brand === selectedBrand;
      return categoryMatch && brandMatch;
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
    setSelectedStrap(product.strapTypes?.[0] || 'Браслет');
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const strapInfo = selectedProduct.strapTypes?.length ? ` • ${selectedStrap}` : '';
    
    addToCartPersistent({
      id: String(selectedProduct.id),
      name: selectedProduct.name,
      price: selectedProduct.price,
      size: selectedProduct.diameter,
      image: selectedProduct.image,
      color: selectedProduct.strapTypes?.length ? `${selectedProduct.material} / ${selectedStrap}` : selectedProduct.material
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: `${selectedProduct.name} • ${selectedProduct.material}${strapInfo}`,
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

  if (activeTab === 'catalog' && selectedProduct) {
    const bgColor = selectedProduct.colorHex || '#1A1A1A';
    
    return (
      <DemoThemeProvider theme={{ primary: '#D4AF37', background: '#0A0A0A', accent: '#C4A030' }}>
        <div className="min-h-screen text-white overflow-auto smooth-scroll-page" style={{ backgroundColor: bgColor }}>
          <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between p-4">
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
                handleToggleFavorite(selectedProduct.id);
              }}
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
              aria-label={isFavorite(selectedProduct.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
              data-testid={`button-favorite-${selectedProduct.id}`}
            >
              <Heart 
                className={`w-5 h-5 ${isFavorite(selectedProduct.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'}`}
              />
            </button>
          </div>

          <div className="relative h-[55vh]">
            <LazyImage
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          <div className="relative pb-56">
            <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 -mt-8">
              <div className="text-center">
                <p className="text-[#D4AF37] text-sm font-semibold mb-2 tracking-widest">{selectedProduct.brand}</p>
                <h2 className="text-2xl font-bold mb-3">{selectedProduct.name}</h2>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-3xl font-bold text-[#D4AF37]">{formatPrice(selectedProduct.price)}</p>
                  {selectedProduct.oldPrice && (
                    <p className="text-xl text-white/50 line-through">{formatPrice(selectedProduct.oldPrice)}</p>
                  )}
                </div>
              </div>

              <p className="text-sm text-white/80 text-center leading-relaxed">{selectedProduct.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-[#D4AF37]" />
                  <p className="text-xs text-white/60 mb-1">Механизм</p>
                  <p className="text-sm font-semibold">{selectedProduct.movement}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <Droplets className="w-5 h-5 mx-auto mb-2 text-[#D4AF37]" />
                  <p className="text-xs text-white/60 mb-1">Водозащита</p>
                  <p className="text-sm font-semibold">{selectedProduct.waterResistance}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <Gem className="w-5 h-5 mx-auto mb-2 text-[#D4AF37]" />
                  <p className="text-xs text-white/60 mb-1">Материал</p>
                  <p className="text-sm font-semibold">{selectedProduct.material}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <Gauge className="w-5 h-5 mx-auto mb-2 text-[#D4AF37]" />
                  <p className="text-xs text-white/60 mb-1">Диаметр</p>
                  <p className="text-sm font-semibold">{selectedProduct.diameter}</p>
                </div>
              </div>

              {selectedProduct.strapTypes && selectedProduct.strapTypes.length > 0 && (
                <div>
                  <h3 className="text-white/80 font-semibold mb-3 flex items-center gap-2">
                    <Watch className="w-4 h-4 text-[#D4AF37]" />
                    Тип ремешка
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.strapTypes.map((strap) => (
                      <button
                        key={strap}
                        onClick={() => setSelectedStrap(strap)}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                          selectedStrap === strap
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#C4A030] text-black'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                        }`}
                        data-testid={`button-strap-${strap.toLowerCase()}`}
                      >
                        {strap}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5">
                <h3 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Наследие
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">{selectedProduct.heritage}</p>
              </div>

              <div>
                <h3 className="text-white/80 font-semibold mb-3">Усложнения</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.complications.map((comp, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full text-xs text-[#D4AF37]"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div 
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ perspective: '1000px' }}
          >
            <div 
              className="absolute -top-8 left-0 right-0 h-16 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
                transform: 'rotateX(45deg)',
                transformOrigin: 'bottom center',
              }}
            />
            
            <div 
              className="relative rounded-t-3xl border-t border-[#D4AF37]/30 p-6 pb-8"
              style={{
                background: 'linear-gradient(180deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.08) 100%)',
                backdropFilter: 'blur(40px) saturate(180%)',
                WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)',
              }}
            >
              <div 
                className="absolute inset-0 rounded-t-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 60%)',
                }}
              />
              
              <ConfirmDrawer
                trigger={
                  <button
                    className="relative w-full bg-gradient-to-r from-[#D4AF37] to-[#C4A030] text-black font-bold py-4 rounded-full hover:opacity-90 transition-all shadow-lg"
                    style={{
                      boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
                    }}
                    data-testid="button-buy-now"
                  >
                    Добавить в корзину
                  </button>
                }
                title="Добавить в корзину?"
                description={`${selectedProduct.name} • ${selectedProduct.material}${selectedProduct.strapTypes?.length ? ` • ${selectedStrap}` : ''}`}
                confirmText="Добавить"
                cancelText="Отмена"
                variant="default"
                onConfirm={addToCart}
              />
              
              <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
          </div>
        </div>
      </DemoThemeProvider>
    );
  }

  if (activeTab === 'home') {
    return (
      <DemoThemeProvider theme={{ primary: '#D4AF37', background: '#0A0A0A', accent: '#C4A030' }}>
        <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page">
          <DemoSidebar
            isOpen={sidebar.isOpen}
            onClose={sidebar.close}
            onOpen={sidebar.open}
            menuItems={sidebarMenuItems}
            title="TIME ELITE"
            subtitle="COLLECTION"
            accentColor="#D4AF37"
            bgColor="#0A0A0A"
          />
          
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
                <button onClick={() => onTabChange?.('cart')} aria-label="Корзина" data-testid="button-view-cart">
                  <ShoppingBag className="w-6 h-6" />
                </button>
                <button aria-label="Избранное" data-testid="button-view-favorites">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-4xl font-black mb-1 tracking-tight">
                TIME<br/>
                <span className="text-[#D4AF37]">ELITE</span>
              </h1>
              <p className="text-white/50 text-sm mt-2 tracking-widest">LUXURY TIMEPIECES</p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <button 
                className="p-2 bg-[#D4AF37] rounded-full"
                aria-label="Главная"
                data-testid="button-view-home"
              >
                <Watch className="w-5 h-5 text-black" />
              </button>
              {brandFilters.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`text-sm font-medium transition-colors ${
                    selectedBrand === brand
                      ? 'text-[#D4AF37]'
                      : 'text-white/40'
                  }`}
                  data-testid={`button-filter-${brand.toLowerCase()}`}
                >
                  {brand}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 bg-white/10 backdrop-blur-xl rounded-full px-4 py-3 flex items-center gap-2 border border-white/10">
                <Search className="w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Поиск часов..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent text-white placeholder:text-white/50 outline-none flex-1 text-sm"
                  data-testid="input-search"
                />
              </div>
            </div>
          </div>

          <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden" style={{ height: '480px' }}>
            <div className="absolute inset-0">
              <LazyImage
                src={filteredProducts[0]?.image || products[0].image}
                alt="Featured Watch"
                className="w-full h-full object-cover"
                priority
              />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>
            
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="px-4 py-1.5 bg-[#D4AF37]/20 backdrop-blur-xl rounded-full border border-[#D4AF37]/40">
                <span className="text-xs font-semibold text-[#D4AF37] tracking-wider">
                  SWISS LUXURY 2025
                </span>
              </div>
            </div>
            
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (filteredProducts[0]) handleToggleFavorite(filteredProducts[0].id);
                }}
                className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center"
                aria-label="Добавить в избранное"
              >
                <Heart 
                  className={`w-5 h-5 ${filteredProducts[0] && isFavorite(filteredProducts[0].id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'}`}
                />
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-[#D4AF37] text-sm font-semibold mb-2 tracking-widest">
                  {filteredProducts[0]?.brand || 'ROLEX'}
                </p>
                <h2 className="text-3xl font-black mb-2 tracking-tight leading-tight">
                  {filteredProducts[0]?.name || 'Rolex Submariner'}
                </h2>
                <p className="text-lg text-white/70 mb-4">
                  {filteredProducts[0]?.movement || 'Автоматический'} • {filteredProducts[0]?.diameter || '40мм'}
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <p className="text-2xl font-bold text-[#D4AF37]">
                    {formatPrice(filteredProducts[0]?.price || products[0].price)}
                  </p>
                  {filteredProducts[0]?.oldPrice && (
                    <p className="text-lg text-white/40 line-through">
                      {formatPrice(filteredProducts[0].oldPrice)}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      if (filteredProducts[0]) openProduct(filteredProducts[0]);
                    }}
                    className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #D4AF37 0%, #C4A030 100%)',
                      boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)'
                    }}
                    data-testid="button-view-featured"
                  >
                    Подробнее
                  </button>
                  <button 
                    onClick={() => onTabChange?.('catalog')}
                    className="px-6 py-4 rounded-full font-semibold text-white/90 bg-white/10 backdrop-blur-xl border border-white/20 transition-all hover:bg-white/20"
                    data-testid="button-view-collection"
                  >
                    Каталог
                  </button>
                </div>
              </m.div>
            </div>
          </div>

          <div className="px-6 space-y-4">
            {filteredProducts.slice(0, 4).map((product, idx) => (
              <m.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => openProduct(product)}
                className="relative cursor-pointer group rounded-3xl overflow-hidden"
                style={{ height: idx === 0 ? '380px' : '300px' }}
                data-testid={`featured-product-${product.id}`}
              >
                <div className="absolute inset-0">
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onLoadComplete={() => handleImageLoad(product.id)}
                    priority={idx < 2}
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                <div className="absolute top-4 left-4 flex gap-2">
                  {product.isNew && (
                    <div className="px-3 py-1 bg-[#D4AF37] rounded-full">
                      <span className="text-xs font-bold text-black">NEW</span>
                    </div>
                  )}
                  {product.isTrending && !product.isNew && (
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full">
                      <span className="text-xs font-semibold text-white">TRENDING</span>
                    </div>
                  )}
                </div>

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
                    className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'}`}
                  />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <p className="text-[#D4AF37] text-xs font-semibold mb-1 tracking-widest">{product.brand}</p>
                      <h3 className="text-xl font-bold mb-1 leading-tight">
                        {product.name}
                      </h3>
                      <p className="text-sm text-white/60">{product.movement} • {product.diameter}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openProduct(product);
                      }}
                      aria-label="Подробнее"
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C4A030] flex items-center justify-center hover:opacity-90 transition-all hover:scale-110"
                      data-testid={`button-add-to-cart-${product.id}`}
                    >
                      <ShoppingBag className="w-6 h-6 text-black" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-[#D4AF37]">{formatPrice(product.price)}</p>
                      {product.oldPrice && (
                        <p className="text-sm text-white/40 line-through">{formatPrice(product.oldPrice)}</p>
                      )}
                    </div>
                    {product.inStock < 5 && (
                      <UrgencyIndicator 
                        type="stock"
                        value={product.inStock}
                        variant="badge"
                      />
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </div>

          <div className="h-8"></div>
        </div>
      </DemoThemeProvider>
    );
  }

  if (activeTab === 'catalog') {
    return (
      <DemoThemeProvider theme={{ primary: '#D4AF37', background: '#0A0A0A', accent: '#C4A030' }}>
        <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page">
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
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C4A030] text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
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
                    <LazyImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onLoadComplete={() => handleImageLoad(product.id)}
                    />
                    
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
                        className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white'}`}
                      />
                    </button>

                    {product.isNew && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full">
                        NEW
                      </div>
                    )}
                    {product.isTrending && !product.isNew && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-white/20 backdrop-blur-xl text-white text-xs font-bold rounded-full">
                        HOT
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[#D4AF37] text-xs font-semibold mb-0.5 tracking-wider">{product.brand}</p>
                    <p className="text-sm font-semibold mb-1 truncate">{product.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-[#D4AF37]">{formatPrice(product.price)}</p>
                      {product.oldPrice && (
                        <p className="text-xs text-white/40 line-through">{formatPrice(product.oldPrice)}</p>
                      )}
                    </div>
                    {product.inStock < 5 && (
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
      </DemoThemeProvider>
    );
  }

  if (activeTab === 'cart') {
    return (
      <DemoThemeProvider theme={{ primary: '#D4AF37', background: '#0A0A0A', accent: '#C4A030' }}>
        <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-32 smooth-scroll-page">
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
                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 flex gap-4 border border-white/10"
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
                        <p className="text-lg font-bold text-[#D4AF37]">{formatPrice(item.price * item.quantity)}</p>
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

                <div className="fixed bottom-24 left-0 right-0 p-6 bg-[#0A0A0A] border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Итого:</span>
                    <span className="text-2xl font-bold text-[#D4AF37]">{formatPrice(cartTotal)}</span>
                  </div>
                  <TrustBadges variant="compact" className="mb-4" />
                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C4A030] text-black font-bold py-4 rounded-full hover:opacity-90 transition-all min-h-[48px]"
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
                  storeName="TIME ELITE"
                />
              </div>
            )}
          </div>
        </div>
      </DemoThemeProvider>
    );
  }

  if (activeTab === 'profile') {
    return (
      <DemoThemeProvider theme={{ primary: '#D4AF37', background: '#0A0A0A', accent: '#C4A030' }}>
        <div className="min-h-screen bg-[#0A0A0A] text-white overflow-auto pb-24 smooth-scroll-page">
          <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#C4A030] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Александр Петров</h2>
                <p className="text-sm text-white/60">+7 (999) 123-45-67</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                <p className="text-sm text-white/60 mb-1">Заказы</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{ordersCount}</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                <p className="text-sm text-white/60 mb-1">Избранное</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{favoritesCount}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Мои заказы</h3>
              {orders.length === 0 ? (
                <div className="text-center py-8 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                  <Package className="w-12 h-12 mx-auto mb-3 text-white/30" />
                  <p className="text-white/60">У вас пока нет заказов</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10" data-testid={`order-${order.id}`}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Заказ #{order.id.slice(-6)}</span>
                        <span className="text-white/60">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-white/60">{order.items.length} товаров</span>
                        <span className="font-bold text-[#D4AF37]">{formatPrice(order.total)}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs px-3 py-1 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full border border-[#D4AF37]/40">
                          {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтверждён' : order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button 
                className="w-full p-4 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-between min-h-[56px] border border-white/10" 
                aria-label="Избранное" 
                data-testid="button-favorites"
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-medium">Избранное</span>
                </div>
                <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
              </button>

              <button 
                className="w-full p-4 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-between min-h-[56px] border border-white/10" 
                aria-label="Способы оплаты" 
                data-testid="button-payment"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-medium">Способы оплаты</span>
                </div>
                <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
              </button>

              <button 
                className="w-full p-4 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-between min-h-[56px] border border-white/10" 
                aria-label="Адреса доставки" 
                data-testid="button-address"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-medium">Адреса доставки</span>
                </div>
                <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
              </button>

              <button 
                className="w-full p-4 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-between min-h-[56px] border border-white/10" 
                aria-label="Настройки" 
                data-testid="button-settings"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-[#D4AF37]" />
                  <span className="font-medium">Настройки</span>
                </div>
                <ChevronLeft className="w-5 h-5 rotate-180 text-white/40" />
              </button>

              <button 
                className="w-full p-4 bg-red-500/10 rounded-2xl flex items-center justify-between min-h-[56px] border border-red-500/20" 
                aria-label="Выйти" 
                data-testid="button-logout"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="font-medium text-red-400">Выйти</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </DemoThemeProvider>
    );
  }

  return null;
}

export default TimeElite;
