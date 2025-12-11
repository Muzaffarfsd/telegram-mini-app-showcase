import { useState, useEffect } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
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
  Search,
  Plus,
  Minus
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { useFilter } from "@/hooks/useFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { DemoThemeProvider } from "@/components/shared";

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
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'Rolex Submariner', 
    brand: 'Rolex', 
    price: 1125000, 
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
    complications: ['Дата', 'Вращающийся безель', 'Люминесцентные метки']
  },
  { 
    id: 2, 
    name: 'Patek Philippe Calatrava', 
    brand: 'Patek Philippe', 
    price: 2565000, 
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
    complications: ['Малая секундная стрелка', 'Сапфировая задняя крышка']
  },
  { 
    id: 3, 
    name: 'Omega Speedmaster', 
    brand: 'Omega', 
    price: 585000, 
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
    complications: ['Хронограф', 'Тахиметр', 'Малые секунды']
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
    complications: ['Дата', 'Быстросменный браслет']
  },
  { 
    id: 5, 
    name: 'Audemars Piguet Royal Oak', 
    brand: 'Audemars Piguet', 
    price: 3150000, 
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
    complications: ['Дата', 'Индикатор запаса хода']
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
    complications: ['Дата с циклопом', 'Рифленый безель']
  },
  { 
    id: 7, 
    name: 'Jaeger-LeCoultre Reverso', 
    brand: 'Jaeger-LeCoultre', 
    price: 1620000, 
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
    complications: ['Поворотный корпус', 'Малые секунды', 'Двойной циферблат']
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
    complications: ['Ультратонкий механизм', 'Женевское клеймо']
  },
  { 
    id: 9, 
    name: 'Omega Seamaster', 
    brand: 'Omega', 
    price: 468000, 
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
    complications: ['Дата', 'Гелиевый клапан', 'Вращающийся безель']
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
    complications: ['Секретная застежка', 'Кабошон сапфира']
  },
  { 
    id: 11, 
    name: 'Rolex GMT-Master II', 
    brand: 'Rolex', 
    price: 1278000, 
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
    complications: ['Два часовых пояса', 'Дата', 'Вращающийся безель 24ч']
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
    complications: ['Дата', 'Индикатор запаса хода', 'Секундомер']
  },
  { 
    id: 13, 
    name: 'A. Lange & Söhne Lange 1', 
    brand: 'A. Lange & Söhne', 
    price: 3420000, 
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
    complications: ['Большая дата', 'Индикатор запаса хода', 'Малые секунды']
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
    complications: ['Дата', 'Хронометр COSC']
  },
  { 
    id: 15, 
    name: 'Cartier Ballon Bleu', 
    brand: 'Cartier', 
    price: 855000, 
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
    complications: ['Дата', 'Защищенная заводная головка']
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
    complications: ['Хронограф', 'Тахиметр', 'Три субциферблата']
  },
  { 
    id: 17, 
    name: 'Patek Philippe Aquanaut', 
    brand: 'Patek Philippe', 
    price: 2250000, 
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
    complications: ['Дата', 'Секундомер', 'Композитный каучук']
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
    complications: ['Хронограф', 'Тахиметр', 'Дата', 'Открытый баланс']
  },
  { 
    id: 19, 
    name: 'Tudor Black Bay', 
    brand: 'Tudor', 
    price: 315000, 
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
    complications: ['Дата', 'Вращающийся безель', 'Snowflake-стрелки']
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
    complications: ['Дата', 'Антимагнитная защита', 'Треугольная метка 12ч']
  }
];

const categories = ['Все', 'Rolex', 'Omega', 'Cartier', 'Patek', 'Люкс', 'Спорт'];

function TimeElite({ activeTab, onTabChange }: TimeEliteProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { toast } = useToast();

  const { 
    cartItems: cart, 
    addToCart: addToCartHook, 
    removeFromCart, 
    updateQuantity,
    clearCart, 
    totalAmount: cartTotal 
  } = usePersistentCart({ storageKey: STORE_KEY });

  const { 
    toggleFavorite: toggleFavoriteHook, 
    isFavorite,
    favoritesCount 
  } = usePersistentFavorites({ storageKey: STORE_KEY });

  const { 
    orders, 
    createOrder,
    ordersCount 
  } = usePersistentOrders({ storageKey: STORE_KEY });

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

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const openProductModal = (product: typeof products[0]) => {
    scrollToTop();
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleToggleFavorite = (productId: number) => {
    toggleFavoriteHook(String(productId));
    const isNowFavorite = !isFavorite(String(productId));
    toast({
      title: isNowFavorite ? 'Добавлено в избранное' : 'Удалено из избранного',
      duration: 1500,
    });
  };

  const addToCart = (product: typeof products[0]) => {
    addToCartHook({
      id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: 'Standard',
      color: 'Default'
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: product.name,
      duration: 2000,
    });
    
    closeProductModal();
  };

  const handleCheckout = (orderId: string) => {
    if (cart.length === 0) return;
    
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
              className="bg-transparent text-gray-900 placeholder:text-gray-400 outline-none flex-1 text-sm min-h-[44px]"
              data-testid="input-search"
              aria-label="Поиск часов"
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
              className="px-6 py-3 bg-white text-amber-700 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 min-h-[44px]"
              data-testid="button-view-collection"
              aria-label="Смотреть коллекцию Rolex"
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
                    className="absolute top-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(product.id);
                    }}
                    aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    data-testid={`button-favorite-${product.id}`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
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
                className="bg-transparent text-gray-900 placeholder:text-gray-400 outline-none flex-1 text-sm min-h-[44px]"
                data-testid="input-search-catalog"
                aria-label="Поиск часов в каталоге"
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm min-h-[44px] ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-700 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
                aria-label={`Фильтр по категории ${cat}`}
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
                  className="absolute top-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(product.id);
                  }}
                  aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                  data-testid={`button-favorite-${product.id}`}
                >
                  <Heart 
                    className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
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
    <div className="min-h-screen bg-gray-50 font-montserrat pb-32">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 scroll-fade-in">Корзина</h1>
        
        {cart.length === 0 ? (
          <EmptyState
            type="cart"
            actionLabel="В каталог"
            onAction={() => onTabChange?.('catalog')}
            className="py-20"
          />
        ) : (
          <>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div 
                  key={`${item.id}-${item.size}-${item.color}`}
                  className={`bg-white rounded-2xl p-4 flex gap-4 shadow-sm scroll-fade-in-delay-${Math.min(index + 1, 5)}`}
                  data-testid={`cart-item-${item.id}`}
                >
                  <img 
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-lg font-bold text-gray-900 mb-2">{formatPrice(item.price * item.quantity)}</p>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 w-fit">
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
                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    className="w-10 h-10 flex items-center justify-center"
                    aria-label="Удалить из корзины"
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
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 min-h-[48px]"
                  data-testid="button-checkout"
                  aria-label="Оформить заказ"
                >
                  Оформить заказ
                </button>
              </div>
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
              storeName="TimeElite"
            />
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
              <p className="text-2xl font-bold text-gray-900">{ordersCount}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">Избранное</p>
              <p className="text-2xl font-bold text-gray-900">{favoritesCount}</p>
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
                    <span className="text-gray-900 font-medium">Заказ #{order.id.slice(-6)}</span>
                    <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{order.items.length} товаров</span>
                    <span className="font-bold text-amber-600">{formatPrice(order.total)}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full">
                      {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтверждён' : order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 scroll-fade-in-delay-2">
          <button 
            className="w-full p-4 bg-white rounded-2xl flex items-center justify-between min-h-[56px]" 
            aria-label="Избранное" 
            data-testid="button-favorites"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button 
            className="w-full p-4 bg-white rounded-2xl flex items-center justify-between min-h-[56px]" 
            aria-label="Способы оплаты" 
            data-testid="button-payment"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button 
            className="w-full p-4 bg-white rounded-2xl flex items-center justify-between min-h-[56px]" 
            aria-label="Адреса доставки" 
            data-testid="button-address"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button 
            className="w-full p-4 bg-white rounded-2xl flex items-center justify-between min-h-[56px]" 
            aria-label="Настройки" 
            data-testid="button-settings"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Настройки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
          </button>

          <button 
            className="w-full p-4 bg-red-50 rounded-2xl flex items-center justify-between mt-4 min-h-[56px]" 
            aria-label="Выйти" 
            data-testid="button-logout"
          >
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
        className={`fixed inset-0 z-50 bg-white transition-all duration-300 smooth-scroll-page ${
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
                  className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-700 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 min-h-[48px]"
                  data-testid={`button-add-to-cart-${selectedProduct.id}`}
                  aria-label={`Добавить ${selectedProduct.name} в корзину`}
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

function TimeEliteWithTheme(props: TimeEliteProps) {
  return (
    <DemoThemeProvider themeId="timeElite">
      <TimeElite {...props} />
    </DemoThemeProvider>
  );
}

export default TimeEliteWithTheme;
