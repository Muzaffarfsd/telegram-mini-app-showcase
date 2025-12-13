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
  Menu,
  Home,
  Grid,
  Tag,
  ShoppingBag,
  Plus,
  Minus
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

  // PRODUCT PAGE - УЛУЧШЕННАЯ
  if (activeTab === 'catalog' && selectedProduct) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
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
              handleToggleFavorite(selectedProduct.id);
            }}
            aria-label={isFavorite(String(selectedProduct.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
            className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
            data-testid={`button-favorite-${selectedProduct.id}`}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite(String(selectedProduct.id)) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh] bg-gradient-to-br from-white/5 to-transparent">
          <LazyImage
            src={selectedProduct.hoverImage}
            alt={selectedProduct.name}
            className="w-full h-full p-8"
            priority
          />
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-t-3xl p-6 space-y-6 pb-32">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-[var(--theme-primary)] font-semibold">{selectedProduct.brand}</span>
              {selectedProduct.isNew && (
                <span className="px-2 py-1 bg-[var(--theme-primary)] text-black text-xs font-bold rounded-full">
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
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? 'fill-[var(--theme-primary)] text-[var(--theme-primary)]' : 'text-gray-600'}`} />
                ))}
              </div>
              <span className="text-sm text-white/70">{selectedProduct.rating}</span>
            </div>
          </div>

          <p className="text-sm text-white/70 leading-relaxed">{selectedProduct.description}</p>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--theme-primary)]" />
              Характеристики
            </h3>
            <div className="space-y-3">
              {selectedProduct.specs.map((spec, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <Zap className="w-4 h-4 text-[var(--theme-primary)] mt-0.5 flex-shrink-0" />
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
                className="w-full bg-[var(--theme-primary)] text-black font-bold py-4 rounded-full hover:bg-[var(--theme-accent)] transition-all flex items-center justify-center gap-2"
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
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
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
                  className="w-full h-full transition-transform duration-700 group-hover:scale-110"
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(product.id);
                }}
                aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10"
                data-testid={`button-favorite-${product.id}`}
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

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
      </div>
    );
  }

  // CATALOG PAGE
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
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
                className={`relative cursor-pointer scroll-fade-in-delay-${Math.min((idx % 4) + 2, 5)}`}
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-white/5">
                  <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full"
                    onLoadComplete={() => handleImageLoad(product.id)}
                  />
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(product.id);
                    }}
                    aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center"
                    data-testid={`button-favorite-catalog-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite(String(product.id)) ? 'fill-white text-white' : 'text-white'}`}
                    />
                  </button>

                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[var(--theme-primary)] text-black text-xs font-bold rounded-full">
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
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-32 smooth-scroll-page">
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
      <div className="min-h-screen bg-[var(--theme-background)] text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[var(--theme-primary)] rounded-full flex items-center justify-center">
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
