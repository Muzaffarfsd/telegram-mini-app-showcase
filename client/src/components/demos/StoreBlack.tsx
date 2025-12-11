import { useState, useEffect, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Grid, Minus, Plus, Shirt, Check } from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { ConfirmDrawer, SelectDrawer } from "../ui/modern-drawer";
import { HapticButton } from "../ui/haptic-button";
import { useFilter } from "@/hooks/useFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "../shared/EmptyState";
import { CheckoutDrawer } from "../shared/CheckoutDrawer";
import { DemoThemeProvider } from "@/components/shared";

const STORE_KEY = 'storeblack-store';

const helmetImg1 = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1200&fit=crop&q=90';
const helmetImg2 = 'https://images.unsplash.com/photo-1544892463-e285fcf6d06d?w=800&h=1200&fit=crop&q=90';
const watchImg1 = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1200&fit=crop&q=90';
const watchImg2 = 'https://images.unsplash.com/photo-1434493789847-2a75b0dd0c82?w=800&h=1200&fit=crop&q=90';
const carabinerImg1 = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1200&fit=crop&q=90';
const carabinerImg2 = 'https://images.unsplash.com/photo-1522163723043-478ef89a5f47?w=800&h=1200&fit=crop&q=90';
const jacketImg1 = 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1200&fit=crop&q=90';
const jacketImg2 = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1200&fit=crop&q=90';
const pantsImg1 = 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1200&fit=crop&q=90';
const pantsImg2 = 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1200&fit=crop&q=90';
const glovesImg1 = 'https://images.unsplash.com/photo-1520013236909-d2d3c0de0879?w=800&h=1200&fit=crop&q=90';
const glovesImg2 = 'https://images.unsplash.com/photo-1598440567091-1f737a3b5a8a?w=800&h=1200&fit=crop&q=90';
const bootsImg1 = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1200&fit=crop&q=90';
const bootsImg2 = 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=1200&fit=crop&q=90';
const backpackImg1 = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1200&fit=crop&q=90';
const backpackImg2 = 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&h=1200&fit=crop&q=90';
const sunglassesImg1 = 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=1200&fit=crop&q=90';
const sunglassesImg2 = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1200&fit=crop&q=90';

interface StoreBlackProps {
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
  materials: string[];
  functionality: string[];
  technology: string;
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
    description: 'Кибернетический шлем нового поколения с интегрированной LED-визорной системой. Углеродный каркас обеспечивает максимальную защиту при минимальном весе. Титановые крепления гарантируют надежную фиксацию. Встроенная вентиляция с антибактериальным покрытием.',
    materials: ['Углеродное волокно T700', 'Титановые крепления Grade 5', 'LED-панели OLED', 'Антибактериальная подкладка'],
    functionality: ['LED подсветка 7 режимов', 'Активная вентиляция', 'Быстросъемный визор', 'Bluetooth 5.0'],
    technology: 'AeroShield Pro — интегрированная система защиты с LED-визором и активной аэродинамикой',
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
    description: 'Флагманская модель с голографическим HUD-дисплеем и нейроинтерфейсом следующего поколения. Адаптивное затемнение визора реагирует на освещение за 0.01 секунды. Аэродинамический профиль снижает сопротивление на 40% по сравнению с предыдущими моделями. Система шумоподавления создает идеальную акустическую среду.',
    materials: ['Карбон-кевларовый композит', 'Голографические линзы AR', 'Титановый каркас', 'Memory Foam подкладка'],
    functionality: ['Голографический HUD', 'Нейроинтерфейс', 'Активное шумоподавление', 'Адаптивное затемнение'],
    technology: 'NeuroLink 2.0 — система прямого нейроинтерфейса с голографическим дисплеем дополненной реальности',
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
    description: 'Умные часы с AI-ассистентом и расширенными биометрическими датчиками нового поколения. Титановый корпус с сапфировым стеклом защищает от любых воздействий. Мониторинг здоровья 24/7 включает ЭКГ, SpO2 и анализ сна. Автономность до 14 дней в режиме экономии.',
    materials: ['Титан Grade 5', 'Сапфировое стекло', 'Ceramic bezel', 'Силиконовый ремешок медицинского класса'],
    functionality: ['AI-ассистент', 'ЭКГ мониторинг', 'GPS/GLONASS', 'NFC оплата'],
    technology: 'BioSync AI — адаптивная система мониторинга здоровья с машинным обучением',
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
    description: 'Ультралегкий карабин из авиационного углеродного волокна с нанокерамическим покрытием. Выдерживает нагрузку до 2500 кг при весе всего 28 грамм. Интегрированный RFID-чип для защиты от подделок и отслеживания. Эргономичный механизм открывания работает одной рукой даже в перчатках.',
    materials: ['Углеродное волокно T1000', 'Нанокерамическое покрытие', 'Титановая пружина', 'RFID-микрочип'],
    functionality: ['Нагрузка до 2500 кг', 'Открытие одной рукой', 'RFID защита', 'Антикоррозийное покрытие'],
    technology: 'NanoGuard — нанокерамическое покрытие с защитой от царапин и коррозии класса IP69K',
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
    description: 'Премиальная городская куртка с интеллектуальной терморегуляцией и графеновым подогревом. Водонепроницаемая мембрана Gore-Tex Pro выдерживает давление до 28000 мм водяного столба. Скрытые магнитные застежки и 12 функциональных карманов с RFID-блокировкой. Светоотражающие элементы активируются автоматически в темноте.',
    materials: ['Gore-Tex Pro мембрана', 'Графеновые нагревательные элементы', 'Рипстоп нейлон 500D', 'Магнитные неодимовые застежки'],
    functionality: ['Графеновый подогрев 3 режима', 'RFID-защита карманов', 'Автоматическая светоотражение', 'Терморегуляция AI'],
    technology: 'ThermoAdapt — система интеллектуальной терморегуляции с графеновым подогревом и AI-управлением',
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
    description: 'Технологичные брюки карго с антистатической обработкой и EMI-защитой для гаджетов. Эластичная ткань Schoeller с 4-сторонним стрейчем обеспечивает полную свободу движений. 8 специализированных карманов с магнитными клапанами для безопасного хранения техники. Усиленные колени с D3O-протекторами съемного типа.',
    materials: ['Schoeller 4-way stretch', 'D3O протекторы', 'EMI-экранирующая ткань', 'YKK Aquaguard молнии'],
    functionality: ['EMI-защита карманов', 'D3O протекторы', '8 функциональных карманов', '4-way stretch'],
    technology: 'EMI Shield — электромагнитная защита карманов для безопасного хранения электроники',
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
    description: 'Тактические перчатки с хаптической обратной связью и сенсорными панелями для управления устройствами. Кевларовые вставки на костяшках обеспечивают защиту уровня EN 388. Проводящие нити на всех пальцах позволяют работать с любыми сенсорными экранами. Встроенные NFC-чипы в ладонях для бесконтактной авторизации.',
    materials: ['Кевлар EN 388', 'Проводящие серебряные нити', 'Неопрен 3мм', 'NFC-чипы'],
    functionality: ['Хаптическая обратная связь', 'Сенсорное управление', 'NFC авторизация', 'Защита EN 388'],
    technology: 'HapticTouch — система тактильной обратной связи с интегрированными сенсорными панелями',
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
    description: 'Модульный тактический рюкзак с интегрированной солнечной панелью и системой быстрого доступа. Водонепроницаемый корпус IPX7 с термоизолированным отсеком для электроники. MOLLE-совместимая система крепления позволяет добавлять любые модули. Встроенный powerbank на 20000mAh с беспроводной зарядкой.',
    materials: ['Cordura 1000D', 'Солнечные панели 10W', 'Термоизоляция Thinsulate', 'Водонепроницаемые молнии'],
    functionality: ['Солнечная зарядка 10W', 'Powerbank 20000mAh', 'MOLLE система', 'IPX7 защита'],
    technology: 'SolarCharge Pro — интегрированная система солнечной зарядки с умным распределением энергии',
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
    description: 'Боевые ботинки нового поколения с экзоскелетной поддержкой голеностопа и активной амортизацией. Подошва Vibram Megagrip с самоочищающимся протектором обеспечивает сцепление на любой поверхности. Углеродные пластины в стельке возвращают 85% энергии при каждом шаге. Водонепроницаемая мембрана eVent позволяет ногам дышать при любых нагрузках.',
    materials: ['Vibram Megagrip подошва', 'Углеродные пластины', 'eVent мембрана', 'Экзоскелетный каркас'],
    functionality: ['Экзоскелетная поддержка', 'Возврат энергии 85%', 'Самоочищающийся протектор', 'Дышащая мембрана'],
    technology: 'ExoFrame — экзоскелетная система поддержки голеностопа с активной амортизацией',
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
    description: 'Премиальные очки с электрохромными линзами и встроенным AR-дисплеем для навигации. Титановая оправа весом всего 18 грамм с памятью формы не ломается при изгибе. Защита от UV400 и синего света с автоматической адаптацией к освещению. Костная проводимость звука позволяет слушать музыку без наушников.',
    materials: ['Титан с памятью формы', 'Электрохромные линзы', 'AR-дисплей MicroLED', 'Костные динамики'],
    functionality: ['Электрохромное затемнение', 'AR навигация', 'Костная проводимость звука', 'UV400 защита'],
    technology: 'ChromaVision — электрохромные линзы с AR-дисплеем и автоматической адаптацией к освещению',
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

function StoreBlack({ activeTab, onTabChange }: StoreBlackProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const {
    cartItems,
    addToCart: addToCartHook,
    removeFromCart,
    updateQuantity: updateCartQuantity,
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
    if (activeTab !== 'cart') {
      setIsCheckoutOpen(false);
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

  const openProduct = (product: Product) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    addToCartHook({
      id: String(selectedProduct.id),
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: quantity,
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
      <div className="min-h-screen text-white overflow-auto smooth-scroll-page" style={{ backgroundColor: bgColor }}>
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
          <button 
            onClick={() => setSelectedProduct(null)}
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
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
            className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
            data-testid={`button-favorite-${selectedProduct.id}`}
            aria-label={isFavorite(String(selectedProduct.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite(String(selectedProduct.id)) ? 'fill-white text-white' : 'text-white'}`}
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
      <div className="min-h-screen bg-black text-white overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-8 scroll-fade-in">
            <div className="flex items-center gap-3">
              <Grid className="w-8 h-8" style={{ color: '#FFD700' }} />
              <h1 className="text-5xl font-black tracking-tighter">STORE</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative" data-testid="button-view-cart" aria-label="Корзина">
                <ShoppingBag className="w-6 h-6" style={{ color: '#FFD700' }} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#FFD700] text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button data-testid="button-view-favorites" aria-label="Избранное">
                <Heart className="w-6 h-6" style={{ color: favoritesCount > 0 ? '#FFD700' : 'white' }} />
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
                  handleToggleFavorite(product.id);
                }}
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all"
                data-testid={`button-favorite-${product.id}`}
                aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-[#FFD700] text-[#FFD700]' : 'text-white'}`}
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
      <div className="min-h-screen bg-black text-white overflow-auto pb-24 smooth-scroll-page">
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
                      handleToggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/20"
                    data-testid={`button-favorite-${product.id}`}
                    aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite(String(product.id)) ? 'fill-[#FFD700] text-[#FFD700]' : 'text-white'}`}
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
    return (
      <div className="min-h-screen bg-black text-white overflow-auto pb-32 smooth-scroll-page">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" style={{ color: '#FFD700' }} />
              <h1 className="text-3xl font-bold">Корзина</h1>
            </div>
            {cartItems.length > 0 && (
              <button 
                onClick={() => clearCart()}
                className="text-sm text-white/60 hover:text-white transition-colors"
                data-testid="button-clear-cart"
              >
                Очистить все
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <EmptyState
              type="cart"
              actionLabel="В каталог"
              onAction={() => onTabChange?.('catalog')}
              className="py-20"
            />
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
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
                      {item.color} • {item.size}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold" style={{ color: '#FFD700' }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <div className="flex items-center gap-2 bg-white/10 rounded-full px-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          className="w-10 h-10 flex items-center justify-center"
                          aria-label="Уменьшить количество"
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1, item.size, item.color)}
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
                    className="w-10 h-10 hover:bg-white/10 rounded-lg transition-all flex items-center justify-center"
                    data-testid={`button-remove-${item.id}`}
                    aria-label="Удалить из корзины"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-black border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold" style={{ color: '#FFD700' }}>{formatPrice(totalAmount)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full font-bold py-4 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#FFD700]/30 min-h-[48px]"
                  style={{ backgroundColor: '#FFD700', color: '#000000' }}
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
                storeName="Store Black"
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
      <div className="min-h-screen bg-black text-white overflow-auto pb-24 smooth-scroll-page">
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
              <p className="text-2xl font-bold">{ordersCount}</p>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 scroll-fade-in">
              <Heart className="w-5 h-5 mb-2" style={{ color: '#FFD700' }} />
              <p className="text-xs text-white/60 mb-1">Избранное</p>
              <p className="text-2xl font-bold">{favoritesCount}</p>
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
                    <span className="text-sm">Заказ #{order.id.slice(-6)}</span>
                    <span className="text-white/60 text-sm">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-white/70">{order.items.length} товаров</span>
                    <span className="font-bold" style={{ color: '#FFD700' }}>{formatPrice(order.total)}</span>
                  </div>
                  <div>
                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">
                      {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтверждён' : order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Отправлен' : 'Доставлен'}
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
                <span className="text-xs text-white/50">{favoritesCount} товаров</span>
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

function StoreBlackWithTheme(props: StoreBlackProps) {
  return (
    <DemoThemeProvider themeId="storeBlack">
      <StoreBlack {...props} />
    </DemoThemeProvider>
  );
}

export default memo(StoreBlackWithTheme);
