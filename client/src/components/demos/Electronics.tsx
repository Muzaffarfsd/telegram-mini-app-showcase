import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
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
  Menu,
  Home,
  Grid,
  Tag,
  ShoppingBag,
  Plus,
  Minus,
  Shield,
  Check,
  Box,
  Eye,
  Bluetooth,
  Usb,
  Nfc,
  BarChart3,
  ChevronDown,
  ChevronUp
} from "lucide-react";
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
import iphone15ProMaxImage from "@assets/iphone_15_pro_max.jpg";
import samsungS24UltraImage from "@assets/samsung_s24_ultra.jpg";
import macbookPro16Image from "@assets/macbook_pro_16.jpg";
import dellXps15Image from "@assets/dell_xps_15.jpg";
import ipadPro12Image from "@assets/ipad_pro_12.jpg";
import sonyWh1000xm5Image from "@assets/sony_wh1000xm5.jpg";
import airpodsPro2Image from "@assets/airpods_pro_2.jpg";
import sonyAlphaA7ivImage from "@assets/sony_alpha_a7iv.jpg";

const techStoreVideo = "/videos/techstore_2025.mp4";

interface ElectronicsProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

const STORE_KEY = 'electronics-store';

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
  warranty: string;
  connectivity: string[];
  boxContents: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'iPhone 15 Pro Max', 
    price: 109900, 
    oldPrice: 129900, 
    image: iphone15ProMaxImage, 
    hoverImage: iphone15ProMaxImage,
    description: 'Флагманский смартфон с революционным процессором A17 Pro, открывающим эру мобильных игр AAA-класса с консольной графикой и рейтрейсингом. Дисплей Super Retina XDR 6.7 дюйма с технологией ProMotion обеспечивает плавность 120Hz и невероятную цветопередачу HDR с пиковой яркостью 2000 нит. Титановый корпус aerospace-класса на 19% легче стали при максимальной прочности, защищён керамическим покрытием Ceramic Shield. Профессиональная камера 48MP с сенсором нового поколения снимает в ProRAW и ProRes для кинематографического качества контента.', 
    category: 'Смартфоны', 
    brand: 'Apple', 
    inStock: 15, 
    rating: 4.9, 
    specs: ['6.7" Super Retina XDR', 'A17 Pro чип', '256GB накопитель', '48MP камера', 'Титановый корпус'],
    warranty: '2 года официальной гарантии Apple',
    connectivity: ['5G', 'Wi-Fi 6E', 'Bluetooth 5.3', 'USB-C', 'NFC'],
    boxContents: ['iPhone 15 Pro Max', 'Кабель USB-C', 'Документация'],
    isNew: true, 
    isTrending: true 
  },
  { 
    id: 2, 
    name: 'Samsung Galaxy S24 Ultra', 
    price: 99900, 
    oldPrice: 119900, 
    image: samsungS24UltraImage, 
    hoverImage: samsungS24UltraImage,
    description: 'Премиальный смартфон с интегрированным Galaxy AI, который мгновенно переводит разговоры в реальном времени и генерирует профессиональный контент по запросу. Дисплей Dynamic AMOLED 2X диагональю 6.8 дюйма с разрешением QHD+ и яркостью 2600 нит идеален для работы даже под прямыми солнечными лучами. Титановая рамка Grade 5 обеспечивает премиальную эстетику и исключительную долговечность при интенсивном ежедневном использовании. Камера 200MP с 100-кратным Space Zoom и продвинутой OIS снимает детализированные фото даже в условиях экстремально слабого освещения.', 
    category: 'Смартфоны', 
    brand: 'Samsung', 
    inStock: 12, 
    rating: 4.8, 
    specs: ['6.8" Dynamic AMOLED', 'Snapdragon 8 Gen 3', '512GB памяти', '200MP камера', 'S Pen в комплекте'],
    warranty: '2 года официальной гарантии Samsung',
    connectivity: ['5G', 'Wi-Fi 7', 'Bluetooth 5.3', 'USB-C 3.2', 'UWB'],
    boxContents: ['Galaxy S24 Ultra', 'S Pen', 'Кабель USB-C', 'Документация'],
    isNew: true, 
    isTrending: true 
  },
  { 
    id: 3, 
    name: 'MacBook Pro 16"', 
    price: 249900, 
    image: macbookPro16Image, 
    hoverImage: macbookPro16Image,
    description: 'Профессиональный ноутбук с чипом M3 Max, обеспечивающим производительность настольной рабочей станции в ультрапортативном корпусе весом 2.14 кг. Дисплей Liquid Retina XDR 16.2 дюйма с технологией ProMotion и яркостью 1600 нит HDR передаёт миллиард оттенков для профессиональной цветокоррекции. Унифицированная память 32GB и сверхбыстрый SSD 1TB позволяют работать с проектами 8K, нейросетями и 3D-рендерингом абсолютно без задержек. До 22 часов автономной работы — полный рабочий день без подзарядки даже при самых интенсивных вычислительных нагрузках.', 
    category: 'Ноутбуки', 
    brand: 'Apple', 
    inStock: 8, 
    rating: 4.9, 
    specs: ['16.2" Liquid Retina XDR', 'M3 Max чип', '32GB unified memory', '1TB SSD', '22 часа работы'],
    warranty: '1 год официальной гарантии Apple',
    connectivity: ['Thunderbolt 4', 'HDMI 2.1', 'Wi-Fi 6E', 'Bluetooth 5.3', 'MagSafe 3'],
    boxContents: ['MacBook Pro 16"', 'Адаптер питания 140W', 'Кабель USB-C', 'Документация'],
    isTrending: true 
  },
  { 
    id: 4, 
    name: 'Dell XPS 15', 
    price: 129900, 
    image: dellXps15Image, 
    hoverImage: dellXps15Image,
    description: 'Ультрабук премиум-класса с OLED-дисплеем 3.5K, отображающим миллиард оттенков с бесконечной контрастностью и абсолютно чёрным цветом. Процессор Intel Core i7-13700H 13-го поколения с 14 ядрами обеспечивает молниеносную многозадачность и профессиональную производительность. Дискретная графика NVIDIA GeForce RTX 4050 справляется с видеомонтажом 4K, 3D-моделированием и современными играми в высоком разрешении. Цельноалюминиевый корпус с безрамочным дизайном InfinityEdge весит всего 1.86 кг, превращая полноценную рабочую станцию в мобильный офис.', 
    category: 'Ноутбуки', 
    brand: 'Dell', 
    inStock: 10, 
    rating: 4.7, 
    specs: ['15.6" OLED 3.5K', 'Intel Core i7-13700H', '16GB DDR5', '512GB NVMe SSD', 'NVIDIA RTX 4050'],
    warranty: '2 года официальной гарантии Dell',
    connectivity: ['Thunderbolt 4', 'USB-C 3.2', 'Wi-Fi 6E', 'Bluetooth 5.3', 'SD-картридер'],
    boxContents: ['Dell XPS 15', 'Адаптер питания 130W', 'USB-C кабель', 'Документация'] 
  },
  { 
    id: 5, 
    name: 'iPad Pro 12.9"', 
    price: 109900, 
    image: ipadPro12Image, 
    hoverImage: ipadPro12Image,
    description: 'Профессиональный планшет с чипом M2, превосходящим по мощности большинство ноутбуков и открывающим безграничные возможности для творчества. Дисплей Liquid Retina XDR 12.9 дюйма с mini-LED подсветкой обеспечивает яркость 1600 нит HDR и контрастность 1000000:1 для профессиональной работы с цветом и HDR-контентом. Поддержка Apple Pencil 2-го поколения с минимальной задержкой и распознаванием наклона превращает планшет в идеальный цифровой холст для художников и дизайнеров. Thunderbolt-порт USB-C позволяет подключать внешние мониторы 6K, профессиональные аудиоинтерфейсы и скоростные накопители со скоростью до 40 Гбит/с.', 
    category: 'Планшеты', 
    brand: 'Apple', 
    inStock: 14, 
    rating: 4.8, 
    specs: ['12.9" Liquid Retina XDR', 'M2 чип', '128GB памяти', 'Apple Pencil (2-го поколения)', 'Face ID'],
    warranty: '1 год официальной гарантии Apple',
    connectivity: ['5G', 'Wi-Fi 6E', 'Bluetooth 5.3', 'USB-C Thunderbolt'],
    boxContents: ['iPad Pro 12.9"', 'Кабель USB-C', 'Адаптер питания 20W', 'Документация'],
    isNew: true 
  },
  { 
    id: 6, 
    name: 'Sony WH-1000XM5', 
    price: 35900, 
    image: sonyWh1000xm5Image, 
    hoverImage: sonyWh1000xm5Image,
    description: 'Беспроводные наушники с активным шумоподавлением нового поколения на базе двух процессоров и восьми микрофонов для создания идеального кокона тишины. Кастомные 30-миллиметровые драйверы с диафрагмой из углеродного волокна воспроизводят частоты от 4Hz до 40kHz с кристальной чистотой и глубокими басами. Амбушюры из сверхмягкой синтетической кожи с эффектом памяти обеспечивают исключительный комфорт при многочасовых сессиях прослушивания без усталости. До 30 часов автономной работы с включенным ANC, а 3 минуты быстрой зарядки дают 3 часа воспроизведения для экстренных ситуаций.', 
    category: 'Наушники', 
    brand: 'Sony', 
    inStock: 25, 
    rating: 4.8, 
    specs: ['30 часов работы', 'Bluetooth 5.2', 'HD шумоподавление', '8 микрофонов', 'Быстрая зарядка'],
    warranty: '2 года официальной гарантии Sony',
    connectivity: ['Bluetooth 5.2', 'LDAC', 'Multipoint', 'NFC', '3.5mm аудио'],
    boxContents: ['WH-1000XM5', 'Чехол', 'Кабель USB-C', 'Аудиокабель 3.5mm', 'Адаптер для самолёта'],
    isTrending: true 
  },
  { 
    id: 7, 
    name: 'AirPods Pro 2', 
    price: 24900, 
    image: airpodsPro2Image, 
    hoverImage: airpodsPro2Image,
    description: 'Компактные TWS-наушники с чипом H2, обеспечивающим адаптивное шумоподавление, которое в реальном времени анализирует и подстраивается под окружающую звуковую среду. Пространственное аудио с динамическим отслеживанием движений головы создаёт эффект полного погружения в звук кинотеатра Dolby Atmos прямо в ваших ушах. Кастомный низкочастотный драйвер и высокодинамичный усилитель воспроизводят глубокие насыщенные басы и кристально чистые высокие частоты без искажений. До 6 часов активного прослушивания на одном заряде, а компактный MagSafe-кейс увеличивает автономность до 30 часов с функцией точного поиска через Find My.', 
    category: 'Наушники', 
    brand: 'Apple', 
    inStock: 30, 
    rating: 4.7, 
    specs: ['H2 чип', '6 часов работы', 'Пространственный звук', 'Адаптивное шумоподавление', 'MagSafe зарядка'],
    warranty: '1 год официальной гарантии Apple',
    connectivity: ['Bluetooth 5.3', 'Apple H2', 'Spatial Audio', 'MagSafe'],
    boxContents: ['AirPods Pro', 'MagSafe кейс', '4 пары амбушюр', 'Кабель USB-C', 'Документация'] 
  },
  { 
    id: 8, 
    name: 'Sony Alpha A7 IV', 
    price: 249900, 
    image: sonyAlphaA7ivImage, 
    hoverImage: sonyAlphaA7ivImage,
    description: 'Полнокадровая беззеркальная камера с матрицей 33 мегапикселя и процессором BIONZ XR для безупречной детализации и динамического диапазона в любых условиях съёмки. Гибридная система автофокуса с 759 точками фазовой детекции мгновенно отслеживает глаза людей, животных и птиц с невероятной точностью даже при движении. Запись видео 4K 60fps с 10-битной глубиной цвета 4:2:2 и профилями S-Log3/S-Cinetone открывает возможности для профессиональной кинематографической цветокоррекции. Пятиосевая оптическая стабилизация IBIS компенсирует до 5.5 ступеней экспозиции, позволяя снимать резкие кадры с рук даже в условиях слабого освещения.', 
    category: 'Камеры', 
    brand: 'Sony', 
    inStock: 6, 
    rating: 4.9, 
    specs: ['33MP полнокадровая матрица', '4K 60p видео', '5-осевая стабилизация', '693 точки AF', '10fps серийная съёмка'],
    warranty: '2 года официальной гарантии Sony',
    connectivity: ['USB-C 3.2', 'HDMI Type-A', 'Wi-Fi 5', 'Bluetooth 4.2', 'Multi Interface Shoe'],
    boxContents: ['Alpha A7 IV', 'Аккумулятор NP-FZ100', 'Зарядное устройство', 'Плечевой ремень', 'Документация'] 
  },
];

const categories = ['Все', 'Смартфоны', 'Ноутбуки', 'Планшеты', 'Наушники', 'Камеры'];
const genderFilters = ['All', 'Popular', 'New', 'Sale'];

const Electronics = memo(function Electronics({ activeTab, onTabChange }: ElectronicsProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const sidebar = useDemoSidebar();
  const { toast } = useToast();
  
  // Persistent hooks
  const { 
    cartItems, 
    addToCart: addToCartHook, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    totalAmount 
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

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home' },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog' },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное' },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

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

  const handleToggleFavorite = (productId: number) => {
    const wasInFavorites = isFavorite(String(productId));
    toggleFavoriteHook(String(productId));
    toast({
      title: !wasInFavorites ? 'Добавлено в избранное' : 'Удалено из избранного',
      duration: 1500
    });
  };

  const openProduct = (product: Product) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    addToCartHook({
      id: String(selectedProduct.id),
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1,
      image: selectedProduct.image,
      size: 'Standard',
      color: 'Default'
    });
    
    toast({
      title: 'Товар добавлен в корзину',
      description: selectedProduct.name,
      duration: 2000
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
      cartItems.map((item: typeof cartItems[0]) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        size: item.size,
        color: item.color
      })),
      totalAmount
    );
    
    clearCart();
    setIsCheckoutOpen(false);
    
    toast({
      title: 'Заказ успешно оформлен!',
      description: `На сумму ${formatPrice(totalAmount)}`,
      duration: 3000
    });
  };

  // PRODUCT PAGE - iOS 2026 Premium Modular Design
  if (activeTab === 'catalog' && selectedProduct) {
    const bgColor = '#000000';
    const recommendedProducts = products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0, 8);
    const productImages = [selectedProduct.image, selectedProduct.hoverImage];
    
    const glassCard = {
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '0.5px solid rgba(255,255,255,0.1)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
    };
    
    const getConnectivityIcon = (conn: string) => {
      const lower = conn.toLowerCase();
      if (lower.includes('wifi') || lower.includes('wi-fi')) return <Wifi className="w-3.5 h-3.5" />;
      if (lower.includes('bluetooth')) return <Bluetooth className="w-3.5 h-3.5" />;
      if (lower.includes('usb') || lower.includes('thunderbolt')) return <Usb className="w-3.5 h-3.5" />;
      if (lower.includes('nfc')) return <Nfc className="w-3.5 h-3.5" />;
      if (lower.includes('5g') || lower.includes('lte') || lower.includes('uwb')) return <Smartphone className="w-3.5 h-3.5" />;
      if (lower.includes('hdmi') || lower.includes('magsafe')) return <Monitor className="w-3.5 h-3.5" />;
      if (lower.includes('ldac') || lower.includes('spatial') || lower.includes('multipoint')) return <Headphones className="w-3.5 h-3.5" />;
      return <Zap className="w-3.5 h-3.5" />;
    };

    const getHighlightIcon = (spec: string) => {
      const lower = spec.toLowerCase();
      if (lower.includes('дисплей') || lower.includes('retina') || lower.includes('amoled') || lower.includes('oled')) return <Monitor className="w-5 h-5" />;
      if (lower.includes('чип') || lower.includes('процессор') || lower.includes('snapdragon') || lower.includes('intel') || lower.includes('m2') || lower.includes('m3')) return <Cpu className="w-5 h-5" />;
      if (lower.includes('камер') || lower.includes('mp')) return <Camera className="w-5 h-5" />;
      if (lower.includes('час') || lower.includes('батар') || lower.includes('работы') || lower.includes('ssd') || lower.includes('gb') || lower.includes('tb')) return <Battery className="w-5 h-5" />;
      if (lower.includes('стабилиз') || lower.includes('af') || lower.includes('матриц')) return <Camera className="w-5 h-5" />;
      return <Zap className="w-5 h-5" />;
    };

    const getHighlightLabel = (spec: string) => {
      const lower = spec.toLowerCase();
      if (lower.includes('дисплей') || lower.includes('retina') || lower.includes('amoled') || lower.includes('oled')) return 'Дисплей';
      if (lower.includes('чип') || lower.includes('процессор') || lower.includes('snapdragon') || lower.includes('intel') || lower.includes('m2') || lower.includes('m3')) return 'Процессор';
      if (lower.includes('камер') || lower.includes('mp')) return 'Камера';
      if (lower.includes('час') || lower.includes('работы')) return 'Батарея';
      if (lower.includes('ssd') || lower.includes('gb') || lower.includes('tb') || lower.includes('памят') || lower.includes('memory')) return 'Память';
      if (lower.includes('стабилиз')) return 'Стабилизация';
      if (lower.includes('af') || lower.includes('точ')) return 'Автофокус';
      return 'Технология';
    };
    
    const reviewCount = Math.floor(selectedProduct.rating * 50 + selectedProduct.id * 17);
    
    return (
      <div className="h-screen text-white overflow-hidden relative flex flex-col" style={{ backgroundColor: bgColor }}>
        
        {/* FLOATING STICKY HEADER */}
        <AnimatePresence>
          {showStickyHeader && (
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 right-0 z-[100]"
              style={{
                paddingTop: 'max(12px, env(safe-area-inset-top))',
                paddingBottom: '12px',
                paddingLeft: '16px',
                paddingRight: '16px',
              }}
            >
              <div 
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-[24px]"
                style={{
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(30px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  data-testid="button-sticky-back"
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.9)' }} strokeWidth={2.5} />
                </button>
                
                <div className="flex-1 min-w-0 text-center">
                  <p 
                    className="text-[15px] font-semibold truncate"
                    style={{ color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em' }}
                  >
                    {selectedProduct.name}
                  </p>
                  <p 
                    className="text-[13px] font-medium"
                    style={{ color: 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(selectedProduct.id);
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all duration-300"
                  style={{ 
                    background: isFavorite(String(selectedProduct.id)) 
                      ? 'rgba(255,59,48,0.2)' 
                      : 'rgba(255,255,255,0.1)' 
                  }}
                  data-testid="button-sticky-favorite"
                >
                  <Heart 
                    className="w-5 h-5" 
                    style={{ color: isFavorite(String(selectedProduct.id)) ? '#FF3B30' : 'rgba(255,255,255,0.9)' }}
                    fill={isFavorite(String(selectedProduct.id)) ? '#FF3B30' : 'none'}
                  />
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
        
        {/* HERO SECTION - 70vh */}
        <div className="relative" style={{ height: '70vh', minHeight: '480px' }}>
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
                    priority={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Top Gradient */}
          <div 
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{
              height: '140px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
            }}
          />
          
          {/* Bottom Gradient for readability */}
          <div 
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{
              height: '200px',
              background: `linear-gradient(0deg, ${bgColor} 0%, ${bgColor}cc 40%, transparent 100%)`
            }}
          />

          {/* iOS-style Page Dots in glass container */}
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
          
          {/* Floating Glass Navigation Bar - Radiance style */}
          <div 
            className="absolute left-4 right-4 z-50 flex items-center justify-between"
            style={{ top: 'calc(max(16px, env(safe-area-inset-top)) + 8px)' }}
          >
            {/* Back Button */}
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
            
            {/* Image Counter Pill */}
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
            
            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(selectedProduct.id);
              }}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{ 
                background: isFavorite(String(selectedProduct.id)) 
                  ? 'linear-gradient(145deg, rgba(255,59,48,0.35) 0%, rgba(255,59,48,0.15) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.25) 100%)',
                backdropFilter: 'blur(25px) saturate(180%)',
                WebkitBackdropFilter: 'blur(25px) saturate(180%)',
                border: isFavorite(String(selectedProduct.id)) 
                  ? '0.5px solid rgba(255,59,48,0.5)'
                  : '0.5px solid rgba(255,255,255,0.6)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)'
              }}
              aria-label={isFavorite(String(selectedProduct.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
              data-testid={`button-favorite-${selectedProduct.id}`}
            >
              <Heart 
                className="w-5 h-5"
                style={{ color: isFavorite(String(selectedProduct.id)) ? '#FF3B30' : 'rgba(0,0,0,0.75)' }}
                fill={isFavorite(String(selectedProduct.id)) ? '#FF3B30' : 'none'}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {/* CONTENT SHEET */}
        <div className="relative" style={{ paddingBottom: '200px', marginTop: '-40px' }}>
          <div 
            className="relative rounded-t-[36px]"
            style={{
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              borderTop: '0.5px solid rgba(255,255,255,0.2)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {/* Handle indicator */}
            <div className="flex justify-center -mt-2 mb-2">
              <div 
                className="w-10 h-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              />
            </div>
            
            {/* a) HEADER CAPSULE */}
            <div className="text-center">
              <h1 
                className="text-2xl font-bold mb-3"
                style={{ 
                  color: 'rgba(255,255,255,0.98)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15
                }}
              >
                {selectedProduct.name}
              </h1>
              
              <div className="flex items-center justify-center gap-3 mb-3">
                <span 
                  className="text-3xl font-bold"
                  style={{ 
                    color: 'rgba(255,255,255,0.98)', 
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em'
                  }}
                >
                  {formatPrice(selectedProduct.price)}
                </span>
                {selectedProduct.oldPrice && (
                  <span 
                    className="text-lg line-through"
                    style={{ color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatPrice(selectedProduct.oldPrice)}
                  </span>
                )}
              </div>
              
              {selectedProduct.oldPrice && (
                <div 
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(52,199,89,0.25) 0%, rgba(52,199,89,0.1) 100%)',
                    color: '#34C759',
                    border: '0.5px solid rgba(52,199,89,0.3)',
                    letterSpacing: '0.03em'
                  }}
                >
                  -{Math.round((1 - selectedProduct.price / selectedProduct.oldPrice) * 100)}% скидка
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className="w-4 h-4" 
                      style={{ 
                        color: i < Math.floor(selectedProduct.rating) ? '#FFD60A' : 'rgba(255,255,255,0.15)',
                        fill: i < Math.floor(selectedProduct.rating) ? '#FFD60A' : 'transparent'
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {selectedProduct.rating}
                </span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>•</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {reviewCount} отзывов
                </span>
              </div>
            </div>

            {/* b) HIGHLIGHTS SECTION */}
            <div 
              className="rounded-2xl p-4"
              style={glassCard}
            >
              <h3 
                className="text-sm font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}
              >
                <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                Ключевые особенности
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {selectedProduct.specs.slice(0, 4).map((spec, idx) => (
                  <div 
                    key={idx}
                    className="rounded-xl p-3"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '0.5px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb, 99,102,241),0.2) 0%, rgba(var(--theme-primary-rgb, 99,102,241),0.1) 100%)'
                      }}
                    >
                      {getHighlightIcon(spec)}
                    </div>
                    <p className="text-[10px] font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {getHighlightLabel(spec)}
                    </p>
                    <p 
                      className="text-xs font-semibold line-clamp-2"
                      style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.3 }}
                    >
                      {spec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* c) ОПИСАНИЕ (expandable) */}
            <div 
              className="rounded-2xl p-4"
              style={glassCard}
            >
              <p 
                className="text-[14px] leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {isDescriptionExpanded 
                  ? selectedProduct.description 
                  : selectedProduct.description.slice(0, 200) + (selectedProduct.description.length > 200 ? '...' : '')
                }
              </p>
              {selectedProduct.description.length > 200 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="flex items-center gap-1 mt-3 text-[13px] font-semibold transition-all duration-300"
                  style={{ color: 'var(--theme-primary)' }}
                  data-testid="button-expand-description"
                >
                  {isDescriptionExpanded ? 'Свернуть' : 'Читать далее'}
                  {isDescriptionExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* d) ТЕХНИЧЕСКИЕ ХАРАКТЕРИСТИКИ */}
            <div 
              className="rounded-2xl p-4"
              style={glassCard}
            >
              <h3 
                className="text-sm font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}
              >
                <Cpu className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                Технологии
              </h3>
              <div className="space-y-3">
                {selectedProduct.specs.map((spec, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 text-sm"
                  >
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(var(--theme-primary-rgb, 99,102,241),0.15)' }}
                    >
                      <Zap className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* e) ПОДКЛЮЧЕНИЯ (Connectivity) */}
            <div>
              <h3 
                className="text-sm font-semibold mb-3 px-1 flex items-center gap-2"
                style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}
              >
                <Wifi className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                Connectivity
              </h3>
              <div 
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
                style={{ scrollSnapType: 'x mandatory', scrollBehavior: 'smooth' }}
              >
                {selectedProduct.connectivity.map((conn, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb, 99,102,241),0.15) 0%, rgba(var(--theme-primary-rgb, 99,102,241),0.08) 100%)',
                      border: '0.5px solid rgba(var(--theme-primary-rgb, 99,102,241),0.25)',
                      scrollSnapAlign: 'start'
                    }}
                  >
                    <span style={{ color: 'var(--theme-primary)' }}>{getConnectivityIcon(conn)}</span>
                    <span 
                      className="text-xs font-medium whitespace-nowrap"
                      style={{ color: 'rgba(255,255,255,0.85)' }}
                    >
                      {conn}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* f) ГАРАНТИЯ И СЕРВИС */}
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="rounded-2xl p-4"
                style={glassCard}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(52,199,89,0.15)' }}
                >
                  <Shield className="w-5 h-5" style={{ color: '#34C759' }} />
                </div>
                <h4 className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Гарантия
                </h4>
                <p className="text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {selectedProduct.warranty}
                </p>
              </div>
              
              <div 
                className="rounded-2xl p-4"
                style={glassCard}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(var(--theme-primary-rgb, 99,102,241),0.15)' }}
                >
                  <Package className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                </div>
                <h4 className="text-xs font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Доставка
                </h4>
                <p className="text-[11px] leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Бесплатная доставка от 5000₽
                </p>
              </div>
            </div>

            {/* g) В КОМПЛЕКТЕ */}
            <div 
              className="rounded-2xl p-4"
              style={glassCard}
            >
              <h3 
                className="text-sm font-semibold mb-4 flex items-center gap-2"
                style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}
              >
                <Box className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
                Что в коробке
              </h3>
              <div className="space-y-2.5">
                {selectedProduct.boxContents.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div 
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(52,199,89,0.15)' }}
                    >
                      <Check className="w-3 h-3" style={{ color: '#34C759' }} />
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.75)' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* h) РЕКОМЕНДУЕМЫЕ ТОВАРЫ */}
            {recommendedProducts.length > 0 && (
              <div>
                <h3 
                  className="text-sm font-semibold mb-4 px-1"
                  style={{ color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em' }}
                >
                  Вам также понравится
                </h3>
                <div 
                  className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide"
                  style={{ 
                    scrollSnapType: 'x mandatory', 
                    scrollBehavior: 'smooth',
                    marginLeft: '-4px', 
                    paddingLeft: '4px',
                    marginRight: '-4px',
                    paddingRight: '4px'
                  }}
                >
                  {recommendedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 active:scale-98"
                      style={{
                        width: '160px',
                        ...glassCard,
                        scrollSnapAlign: 'start'
                      }}
                      onClick={() => {
                        setIsDescriptionExpanded(false);
                        scrollToTop();
                        setSelectedProduct(product);
                      }}
                      data-testid={`recommended-product-${product.id}`}
                    >
                      <div className="relative" style={{ height: '130px' }}>
                        <LazyImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full"
                          style={{ objectFit: 'cover' }}
                        />
                        {/* Quick View button overlay */}
                        <button
                          className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '0.5px solid rgba(255,255,255,0.2)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(product);
                          }}
                          data-testid={`quick-view-${product.id}`}
                        >
                          <Eye className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.9)' }} />
                        </button>
                      </div>
                      <div className="p-3">
                        <p 
                          className="text-xs font-medium mb-2 line-clamp-2"
                          style={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.35, letterSpacing: '-0.01em' }}
                        >
                          {product.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <p 
                            className="text-sm font-bold"
                            style={{ color: 'var(--theme-primary)', fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatPrice(product.price)}
                          </p>
                          {product.oldPrice && (
                            <p 
                              className="text-[10px] line-through"
                              style={{ color: 'rgba(255,255,255,0.35)', fontVariantNumeric: 'tabular-nums' }}
                            >
                              {formatPrice(product.oldPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        </div>
        {/* END SCROLLABLE CONTENT CONTAINER */}

        {/* FIXED BOTTOM PANEL - выше нижней панели навигации */}
        <div 
          className="absolute left-0 right-0 z-[90]"
          style={{
            bottom: '90px',
            padding: '12px 16px',
          }}
        >
          <div 
            className="rounded-2xl p-3 flex items-center gap-4"
            style={{
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex flex-col">
              <span 
                className="text-[10px] font-medium"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Итого
              </span>
              <span 
                className="text-lg font-bold"
                style={{ color: 'rgba(255,255,255,0.98)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
              >
                {formatPrice(selectedProduct.price)}
              </span>
            </div>
            
            <button
              onClick={addToCart}
              className="flex-1 py-4 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 active:scale-98"
              style={{
                background: 'var(--theme-primary)',
                color: '#000',
                letterSpacing: '-0.01em',
                boxShadow: '0 4px 16px rgba(var(--theme-primary-rgb, 99,102,241),0.4)'
              }}
              data-testid="button-buy-now"
            >
              <ShoppingCart className="w-5 h-5" />
              Добавить в корзину
            </button>
          </div>
        </div>
        
        {/* Quick View Modal */}
        {quickViewProduct && (
          <div 
            className="fixed inset-0 z-[200] flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setQuickViewProduct(null)}
          >
            <m.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-t-3xl overflow-hidden"
              style={{
                background: 'rgba(20,20,20,0.95)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                maxHeight: '70vh'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
              </div>
              <div className="p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <LazyImage
                      src={quickViewProduct.image}
                      alt={quickViewProduct.name}
                      className="w-full h-full"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1 line-clamp-2" style={{ color: 'rgba(255,255,255,0.95)' }}>
                      {quickViewProduct.name}
                    </p>
                    <p className="text-lg font-bold mb-2" style={{ color: 'var(--theme-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatPrice(quickViewProduct.price)}
                    </p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3 h-3" 
                          style={{ 
                            color: i < Math.floor(quickViewProduct.rating) ? '#FFD60A' : 'rgba(255,255,255,0.15)',
                            fill: i < Math.floor(quickViewProduct.rating) ? '#FFD60A' : 'transparent'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setQuickViewProduct(null);
                    setIsDescriptionExpanded(false);
                    scrollToTop();
                    setSelectedProduct(quickViewProduct);
                  }}
                  className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-98"
                  style={{
                    background: 'var(--theme-primary)',
                    color: '#000'
                  }}
                  data-testid="button-view-details"
                >
                  Подробнее
                </button>
              </div>
            </m.div>
          </div>
        )}
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
          title="TECH"
          subtitle="MART"
          accentColor="var(--theme-primary)"
          bgColor="var(--theme-background)"
        />
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button onClick={sidebar.open} aria-label="Меню" data-testid="button-menu">
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
              <Zap className="w-6 h-6 text-[var(--theme-primary)]" />
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
          <video
            src={techStoreVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-7 h-7 text-[var(--theme-primary)]" />
              </div>
              <h2 className="text-5xl font-black tracking-tight leading-tight text-white">
                НОВИНКИ
              </h2>
              <h2 className="text-5xl font-black mb-3 tracking-tight leading-tight text-white">
                2025
              </h2>
              <p className="text-base text-white/70 mb-6 flex items-center gap-2" style={{ letterSpacing: '0.05em' }}>
                <Wifi className="w-4 h-4 text-[var(--theme-primary)]" />
                Передовые технологии
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105 bg-[var(--theme-primary)]"
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
                <LazyImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onLoadComplete={() => handleImageLoad(product.id)}
                  priority={idx < 2}
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

              {/* Quick Actions - Quick View & Favorite */}
              <div className="absolute top-4 right-4 flex gap-2">
                {/* Quick View Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuickViewProduct(product);
                  }}
                  aria-label="Быстрый просмотр"
                  className="w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-all"
                  style={{
                    background: 'linear-gradient(145deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                  data-testid={`button-quickview-home-${product.id}`}
                >
                  <Eye className="w-5 h-5 text-white" />
                </button>

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(product.id);
                  }}
                  aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                  className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                  data-testid={`button-favorite-${product.id}`}
                >
                  <Heart 
                    className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-white text-white' : 'text-white'}`}
                  />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/70 mb-4 flex items-center gap-1">
                      <Cpu className="w-4 h-4 text-[var(--theme-primary)]" />
                      {product.category}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(product);
                    }}
                    aria-label="Добавить в корзину"
                    className="w-14 h-14 rounded-full bg-[var(--theme-primary)] flex items-center justify-center transition-all hover:scale-110"
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
                  backdropFilter: 'blur(30px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  maxHeight: '75vh',
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
                
                <div className="px-6 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(75vh - 60px)' }}>
                  {/* Product Image */}
                  <div 
                    className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-5"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <LazyImage
                      src={quickViewProduct.image}
                      alt={quickViewProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="text-center mb-5">
                    <p className="text-xs font-medium uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                      {quickViewProduct.brand}
                    </p>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em' }}>
                      {quickViewProduct.name}
                    </h3>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)', fontFeatureSettings: "'tnum'" }}>
                        {formatPrice(quickViewProduct.price)}
                      </p>
                      {quickViewProduct.oldPrice && (
                        <p className="text-base line-through" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {formatPrice(quickViewProduct.oldPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Specs - First 3 */}
                  <div className="mb-6">
                    <p className="text-xs font-medium uppercase mb-3 text-center" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                      Характеристики
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {quickViewProduct.specs.slice(0, 3).map((spec, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-xl text-xs font-medium"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.8)',
                            border: '0.5px solid rgba(255,255,255,0.15)',
                          }}
                        >
                          {spec}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCartHook({
                        id: String(quickViewProduct.id),
                        name: quickViewProduct.name,
                        price: quickViewProduct.price,
                        quantity: 1,
                        image: quickViewProduct.image,
                        size: 'Standard',
                        color: 'Default'
                      });
                      toast({
                        title: 'Добавлено в корзину',
                        description: quickViewProduct.name,
                        duration: 2000,
                      });
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] mb-3"
                    style={{
                      background: 'var(--theme-primary)',
                      color: '#000',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 30px rgba(var(--theme-primary-rgb, 0,212,255), 0.2)',
                    }}
                    data-testid="button-quickview-home-add-to-cart"
                  >
                    Добавить в корзину
                  </button>
                  
                  {/* View Full Details */}
                  <button
                    onClick={() => {
                      openProduct(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.9)',
                      border: '0.5px solid rgba(255,255,255,0.2)',
                    }}
                    data-testid="button-quickview-home-details"
                  >
                    Подробнее о товаре
                  </button>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
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

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[var(--theme-primary)] text-black'
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
                className={`relative cursor-pointer rounded-3xl overflow-hidden scroll-fade-in-delay-${Math.min((idx % 4) + 2, 5)}`}
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-3">
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onLoadComplete={() => handleImageLoad(product.id)}
                  />
                  
                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      aria-label="Быстрый просмотр"
                      className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all"
                      style={{
                        background: 'linear-gradient(145deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255,255,255,0.3)',
                      }}
                      data-testid={`button-quickview-catalog-${product.id}`}
                    >
                      <Eye className="w-4 h-4 text-white" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(product.id);
                      }}
                      aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
                      data-testid={`button-favorite-catalog-${product.id}`}
                    >
                      <Heart 
                        className={`w-4 h-4 ${isFavorite(String(product.id)) ? 'fill-white text-white' : 'text-white'}`}
                      />
                    </button>
                  </div>

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
        
        {/* ===== QUICK VIEW MODAL for CATALOG PAGE ===== */}
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
                  backdropFilter: 'blur(30px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(30px) saturate(180%)',
                  border: '0.5px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                  maxHeight: '75vh',
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
                  data-testid="button-close-quickview-catalog"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                <div className="px-6 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(75vh - 60px)' }}>
                  {/* Product Image */}
                  <div 
                    className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-5"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <LazyImage
                      src={quickViewProduct.image}
                      alt={quickViewProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="text-center mb-5">
                    <p className="text-xs font-medium uppercase mb-2" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                      {quickViewProduct.brand}
                    </p>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em' }}>
                      {quickViewProduct.name}
                    </h3>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-2xl font-bold" style={{ color: 'rgba(255,255,255,0.95)', fontFeatureSettings: "'tnum'" }}>
                        {formatPrice(quickViewProduct.price)}
                      </p>
                      {quickViewProduct.oldPrice && (
                        <p className="text-base line-through" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {formatPrice(quickViewProduct.oldPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Specs - First 3 */}
                  <div className="mb-6">
                    <p className="text-xs font-medium uppercase mb-3 text-center" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>
                      Характеристики
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {quickViewProduct.specs.slice(0, 3).map((spec, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 rounded-xl text-xs font-medium"
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.8)',
                            border: '0.5px solid rgba(255,255,255,0.15)',
                          }}
                        >
                          {spec}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCartHook({
                        id: String(quickViewProduct.id),
                        name: quickViewProduct.name,
                        price: quickViewProduct.price,
                        quantity: 1,
                        image: quickViewProduct.image,
                        size: 'Standard',
                        color: 'Default'
                      });
                      toast({
                        title: 'Добавлено в корзину',
                        description: quickViewProduct.name,
                        duration: 2000,
                      });
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98] mb-3"
                    style={{
                      background: 'var(--theme-primary)',
                      color: '#000',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 30px rgba(var(--theme-primary-rgb, 0,212,255), 0.2)',
                    }}
                    data-testid="button-quickview-catalog-add-to-cart"
                  >
                    Добавить в корзину
                  </button>
                  
                  {/* View Full Details */}
                  <button
                    onClick={() => {
                      openProduct(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.9)',
                      border: '0.5px solid rgba(255,255,255,0.2)',
                    }}
                    data-testid="button-quickview-catalog-details"
                  >
                    Подробнее о товаре
                  </button>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // CART PAGE
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-32 smooth-scroll-page">
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
              {cartItems.map((item: typeof cartItems[0]) => (
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

              <TrustBadges />
              <div className="fixed bottom-24 left-0 right-0 p-6 bg-[var(--theme-background)] border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold">{formatPrice(totalAmount)}</span>
                </div>
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
                items={cartItems.map((item: typeof cartItems[0]) => ({
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
                storeName="TECHHUB"
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
        <div className="p-6 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[var(--theme-primary)] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Иван Петров</h2>
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

function ElectronicsWithTheme(props: ElectronicsProps) {
  return (
    <DemoThemeProvider themeId="electronics">
      <Electronics {...props} />
    </DemoThemeProvider>
  );
}

export default memo(ElectronicsWithTheme);
