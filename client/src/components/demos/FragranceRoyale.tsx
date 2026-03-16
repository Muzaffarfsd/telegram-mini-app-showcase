import React, { useState, useRef, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package,
  CreditCard, MapPin, Settings, LogOut, User, Sparkles, Search,
  Menu, Home, Grid, Tag, Plus, Minus, Flame, Wind, Leaf, Gem, Flower2, Eye,
  Truck, RotateCcw, ShieldCheck
} from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { LazyImage, DemoThemeProvider } from "@/components/shared";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";
import tomFordBlackOrchidImage from "@assets/tom_ford_black_orchid.jpg";
import creedAventusImage from "@assets/creed_aventus.jpg";
import chanelNo5Image from "@assets/chanel_no5.jpg";
import lelaboSantal33Image from "@assets/lelabo_santal33.jpg";
import baccaratRouge540Image from "@assets/baccarat_rouge_540.jpg";
import tomfordOudWoodImage from "@assets/tomford_oud_wood.jpg";
import diorSauvageImage from "@assets/dior_sauvage.jpg";
import chanelCocoMademoiselleImage from "@assets/chanel_coco_mademoiselle.jpg";

const STORE_KEY = 'fragranceroyale-store';

interface FragranceRoyaleProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

type SillageLevel = 'intimate' | 'moderate' | 'powerful';

interface Perfume {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  hoverImage: string;
  description: string;
  perfumerNote: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  longevity: string;
  longevityHours: number;
  sillage: SillageLevel;
  volumes: string[];
  concentrations: string[];
  concentrationColors: string[];
  category: string;
  categoryBg: string;
  gender: 'Men' | 'Woman' | 'Unisex';
  inStock: number;
  rating: number;
  brand: string;
  year?: number;
  occasions: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

const perfumes: Perfume[] = [
  {
    id: 1,
    name: 'Black Orchid',
    price: 29500,
    oldPrice: 35000,
    image: tomFordBlackOrchidImage,
    hoverImage: tomFordBlackOrchidImage,
    description: 'Загадочная и провокационная композиция, ставшая культовым ароматом современной парфюмерии. Редкая чёрная орхидея переплетается с терпким трюфелем и чёрной смородиной.',
    perfumerNote: 'Аромат создан как дань уважения тёмной красоте природы. Главная нота — редкая чёрная орхидея с берегов Амазонии — раскрывается медленно, как ночной цветок, впитавший все тайны тропического леса.',
    topNotes: ['Чёрная смородина', 'Трюфель', 'Бергамот'],
    heartNotes: ['Чёрная орхидея', 'Жасмин', 'Иланг-иланг'],
    baseNotes: ['Пачули', 'Ваниль', 'Сандал', 'Тёмный шоколад'],
    longevity: '8–12 ч',
    longevityHours: 10,
    sillage: 'powerful',
    volumes: ['50 мл', '100 мл'],
    concentrations: ['Eau de Parfum', 'Intense'],
    concentrationColors: ['#9333EA', '#7E22CE'],
    category: 'Oriental',
    categoryBg: '#0D0812',
    gender: 'Unisex',
    inStock: 15,
    rating: 5.0,
    brand: 'TOM FORD',
    year: 2006,
    occasions: ['Вечер', 'Ночь', 'Романтик', 'Зима'],
    isNew: true,
    isTrending: true,
  },
  {
    id: 2,
    name: 'Aventus',
    price: 44500,
    oldPrice: 52000,
    image: creedAventusImage,
    hoverImage: creedAventusImage,
    description: 'Легендарный аромат успеха, вдохновлённый историческими победителями — от Наполеона до современных бизнес-лидеров. Взрывное открытие из дымного ананаса и калабрийского бергамота.',
    perfumerNote: 'Каждый флакон Aventus — это история победы. Дымный ананас в сердце композиции — дань уважения силе духа и непоколебимой воле. Аромат, который безошибочно узнают по всему миру.',
    topNotes: ['Ананас', 'Бергамот', 'Яблоко', 'Смородина'],
    heartNotes: ['Берёзовый дёготь', 'Пачули', 'Жасмин', 'Роза'],
    baseNotes: ['Дубовый мох', 'Амбра', 'Ваниль', 'Мускус'],
    longevity: '12+ ч',
    longevityHours: 14,
    sillage: 'powerful',
    volumes: ['50 мл', '100 мл', '250 мл'],
    concentrations: ['Eau de Parfum', 'Cologne'],
    concentrationColors: ['#9333EA', '#C084FC'],
    category: 'Fresh',
    categoryBg: '#070F0D',
    gender: 'Men',
    inStock: 8,
    rating: 4.9,
    brand: 'CREED',
    year: 2010,
    occasions: ['День', 'Деловой', 'Спорт', 'Лето'],
    isNew: true,
    isTrending: true,
  },
  {
    id: 3,
    name: 'No. 5',
    price: 18500,
    oldPrice: 24000,
    image: chanelNo5Image,
    hoverImage: chanelNo5Image,
    description: 'Легендарный аромат, созданный Эрнестом Бо в 1921 году. Букет из 80 ингредиентов — символ вечной женственности и элегантности.',
    perfumerNote: 'Первый в мире аромат, созданный на основе синтетических альдегидов. Ernest Beaux создал революцию в парфюмерии, предложив аромат не цветка, а женщины.',
    topNotes: ['Альдегиды', 'Нероли', 'Иланг-иланг'],
    heartNotes: ['Майская роза', 'Жасмин из Грасса', 'Ландыш', 'Ирис'],
    baseNotes: ['Сандал', 'Ветивер', 'Ваниль', 'Амбра'],
    longevity: '8–12 ч',
    longevityHours: 10,
    sillage: 'moderate',
    volumes: ['50 мл', '100 мл'],
    concentrations: ['Eau de Parfum', 'Parfum'],
    concentrationColors: ['#DB2777', '#BE185D'],
    category: 'Floral',
    categoryBg: '#0D080A',
    gender: 'Woman',
    inStock: 5,
    rating: 5.0,
    brand: 'CHANEL',
    year: 1921,
    occasions: ['Вечер', 'Романтик', 'Праздник', 'Осень'],
    isNew: true,
    isTrending: true,
  },
  {
    id: 4,
    name: 'Santal 33',
    price: 38500,
    oldPrice: 45000,
    image: lelaboSantal33Image,
    hoverImage: lelaboSantal33Image,
    description: 'Культовый аромат нью-йоркской нишевой парфюмерии. Австралийский сандал сплетается с дымными аккордами кедра и обожжённого папируса.',
    perfumerNote: 'Santal 33 — это аромат городского странника, который равно чувствует себя у костра в пустыне и на крыше нью-йоркского небоскрёба. Сандал как архетип спокойствия.',
    topNotes: ['Кардамон', 'Ирис', 'Фиалка'],
    heartNotes: ['Австралийский сандал', 'Папирус', 'Кедр'],
    baseNotes: ['Кожа', 'Амбра', 'Мускус'],
    longevity: '8–12 ч',
    longevityHours: 10,
    sillage: 'moderate',
    volumes: ['50 мл', '100 мл'],
    concentrations: ['Eau de Parfum'],
    concentrationColors: ['#78716C'],
    category: 'Woody',
    categoryBg: '#0A0805',
    gender: 'Unisex',
    inStock: 8,
    rating: 4.9,
    brand: 'LE LABO',
    year: 2011,
    occasions: ['День', 'Деловой', 'Вечер', 'Зима'],
    isNew: true,
    isTrending: true,
  },
  {
    id: 5,
    name: 'Baccarat Rouge 540',
    price: 34000,
    image: baccaratRouge540Image,
    hoverImage: baccaratRouge540Image,
    description: 'Парфюмерная алхимия в сотрудничестве с легендарной хрустальной мануфактурой Baccarat. Шафран и египетский жасмин, кашмеран и амбра.',
    perfumerNote: 'Francis Kurkdjian создал аромат для Baccarat в 2015 году. Молекула кашмеран — секрет этого аромата. Она светится на коже как хрустальные грани фирменного флакона.',
    topNotes: ['Шафран', 'Жасмин'],
    heartNotes: ['Амбровое дерево', 'Кедр'],
    baseNotes: ['Амбра', 'Фир-бальзам', 'Кашмеран'],
    longevity: '12+ ч',
    longevityHours: 16,
    sillage: 'powerful',
    volumes: ['70 мл', '200 мл'],
    concentrations: ['Extrait', 'Eau de Parfum'],
    concentrationColors: ['#DC2626', '#EF4444'],
    category: 'Amber',
    categoryBg: '#0D0A06',
    gender: 'Unisex',
    inStock: 10,
    rating: 5.0,
    brand: 'MAISON FRANCIS',
    year: 2015,
    occasions: ['Вечер', 'Ночь', 'Романтик', 'Зима'],
    isTrending: true,
  },
  {
    id: 6,
    name: 'Oud Wood',
    price: 43000,
    image: tomfordOudWoodImage,
    hoverImage: tomfordOudWoodImage,
    description: 'Роскошная древесно-восточная композиция, воплощающая магию редкого уда из камбоджийских лесов. Экзотические специи и благородный сандал.',
    perfumerNote: 'Уд — самый редкий и дорогой ингредиент в парфюмерии. Камбоджийское агаровое дерево, заражённое грибком на протяжении десятилетий, отдаёт весь свой смолистый аромат этой композиции.',
    topNotes: ['Палисандр', 'Кардамон', 'Сычуаньский перец'],
    heartNotes: ['Агаровый уд', 'Сандал'],
    baseNotes: ['Тонка', 'Ветивер', 'Амбра'],
    longevity: '12+ ч',
    longevityHours: 15,
    sillage: 'powerful',
    volumes: ['50 мл', '100 мл'],
    concentrations: ['Eau de Parfum', 'Intense'],
    concentrationColors: ['#78350F', '#92400E'],
    category: 'Oriental',
    categoryBg: '#0D0812',
    gender: 'Unisex',
    inStock: 6,
    rating: 4.8,
    brand: 'TOM FORD',
    year: 2007,
    occasions: ['Вечер', 'Ночь', 'Деловой', 'Осень'],
  },
  {
    id: 7,
    name: 'Sauvage',
    price: 14500,
    image: diorSauvageImage,
    hoverImage: diorSauvageImage,
    description: 'Аромат первобытной свободы, вдохновлённый бескрайними пустынными ландшафтами. Калабрийский бергамот и революционная молекула амброксан.',
    perfumerNote: 'François Demachy, в доме парфюмера Dior, использовал амброксан — синтетическую молекулу амбры — как главную ноту. Её невозможно не учуять, но невозможно и описать словами.',
    topNotes: ['Калабрийский бергамот', 'Перец'],
    heartNotes: ['Сычуаньский перец', 'Лаванда', 'Герань'],
    baseNotes: ['Амброксан', 'Кедр', 'Лабданум'],
    longevity: '8–12 ч',
    longevityHours: 10,
    sillage: 'powerful',
    volumes: ['60 мл', '100 мл', '200 мл'],
    concentrations: ['Eau de Toilette', 'Parfum'],
    concentrationColors: ['#3B82F6', '#1D4ED8'],
    category: 'Fresh',
    categoryBg: '#070F0D',
    gender: 'Men',
    inStock: 12,
    rating: 4.9,
    brand: 'DIOR',
    year: 2015,
    occasions: ['День', 'Спорт', 'Деловой', 'Лето'],
    isNew: true,
  },
  {
    id: 8,
    name: 'Coco Mademoiselle',
    price: 16500,
    image: chanelCocoMademoiselleImage,
    hoverImage: chanelCocoMademoiselleImage,
    description: 'Дерзкий аромат для современной женщины. Апельсин и бергамот, турецкая роза и пачули с белым мускусом.',
    perfumerNote: 'Jacques Polge создал этот аромат в 2001 году как дань уважения современной женщине — независимой, дерзкой, элегантной. Пачули здесь звучит свежо, а не тяжело.',
    topNotes: ['Сицилийский апельсин', 'Бергамот', 'Грейпфрут'],
    heartNotes: ['Турецкая роза', 'Жасмин', 'Личи'],
    baseNotes: ['Пачули', 'Ветивер', 'Белый мускус', 'Ваниль'],
    longevity: '8–12 ч',
    longevityHours: 10,
    sillage: 'moderate',
    volumes: ['50 мл', '100 мл'],
    concentrations: ['Eau de Parfum', 'Intense'],
    concentrationColors: ['#F472B6', '#EC4899'],
    category: 'Floral',
    categoryBg: '#0D080A',
    gender: 'Woman',
    inStock: 4,
    rating: 5.0,
    brand: 'CHANEL',
    year: 2001,
    occasions: ['День', 'Романтик', 'Весна', 'Лето'],
  },
];

const categories = ['Все', 'Fresh', 'Oriental', 'Floral', 'Woody', 'Amber'];
const genderFilters = ['All', 'Men', 'Woman', 'Unisex'];

const mockPerfumeReviews = [
  {
    author: 'Александра М.',
    initials: 'АМ',
    rating: 5,
    date: '12 февр. 2026',
    text: 'Невероятный аромат — именно то, что я искала годами. Шлейф держится больше 10 часов даже в холодную погоду. На коже раскрывается совершенно иначе, чем на бумажном пробнике — стал более тёплым и обволакивающим. Флакон — отдельное произведение искусства.',
    verified: true,
  },
  {
    author: 'Дмитрий К.',
    initials: 'ДК',
    rating: 5,
    date: '3 янв. 2026',
    text: 'Покупал в подарок, но теперь хочу себе такой же. Аромат получает комплименты каждый раз. Очень стойкий — на одежде держится несколько дней. Это настоящая нишевая парфюмерия: никакой банальности, только глубина и характер.',
    verified: true,
  },
  {
    author: 'Валерия Н.',
    initials: 'ВН',
    rating: 4,
    date: '18 дек. 2025',
    text: 'Ожидала больше шлейфа в тёплое время года, но в осенне-зимний сезон это безусловный шедевр. Базовые ноты раскрываются медленно и очень красиво — примерно через час после нанесения начинается настоящее волшебство. Буду брать ещё.',
    verified: true,
  },
];

const categoryConfig: Record<string, { icon: React.ComponentType<{style?: React.CSSProperties}>, label: string, color: string }> = {
  Fresh:    { icon: Wind,    label: 'Свежие',    color: '#34D399' },
  Oriental: { icon: Flame,   label: 'Восточные', color: '#F97316' },
  Floral:   { icon: Flower2, label: 'Цветочные', color: '#F472B6' },
  Woody:    { icon: Leaf,    label: 'Древесные', color: '#A3845C' },
  Amber:    { icon: Gem,     label: 'Амберные',  color: '#F59E0B' },
};

const sillageLabel: Record<SillageLevel, string> = {
  intimate: 'Камерный',
  moderate: 'Умеренный',
  powerful: 'Мощный',
};
const sillageLevel: Record<SillageLevel, number> = {
  intimate: 1,
  moderate: 2,
  powerful: 3,
};

function FragranceRoyale({ activeTab, onTabChange }: FragranceRoyaleProps) {
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedConcentration, setSelectedConcentration] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productExiting, setProductExiting] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<'fragrance' | 'details' | 'reviews'>('fragrance');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewPerfume, setQuickViewPerfume] = useState<Perfume | null>(null);
  const productScrollRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const sidebar = useDemoSidebar();

  const {
    cartItems: cart,
    addToCart: addToCartHook,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount: cartTotal,
    totalItems: cartCount,
  } = usePersistentCart({ storageKey: `${STORE_KEY}_cart` });

  const {
    toggleFavorite: toggleFavoriteHook,
    isFavorite,
    favoritesCount,
  } = usePersistentFavorites({ storageKey: `${STORE_KEY}_favorites` });

  const {
    orders,
    createOrder,
    ordersCount,
  } = usePersistentOrders({ storageKey: `${STORE_KEY}_orders` });

  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home' },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog' },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: '#C9B037' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  const handleProductBack = () => {
    setProductExiting(true);
    setTimeout(() => {
      setProductExiting(false);
      setSelectedPerfume(null);
    }, 340);
  };

  const productPageVariants = {
    initial: { opacity: 0, y: 28, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit:    { opacity: 0, y: 40, scale: 0.975 },
  };

  const contentStagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.065, delayChildren: 0.2 },
    },
  };

  const contentItem = {
    hidden:   { opacity: 0, y: 18 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as number[] } },
  };

  const handleToggleFavorite = (perfumeId: number) => {
    toggleFavoriteHook(String(perfumeId));
    const isNowFavorite = !isFavorite(String(perfumeId));
    toast({ title: isNowFavorite ? 'Добавлено в избранное' : 'Удалено из избранного', duration: 1500 });
  };

  const openPerfume = (perfume: Perfume) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedPerfume(perfume);
    setSelectedVolume(perfume.volumes[0]);
    setSelectedConcentration(perfume.concentrations[0]);
  };

  const addToCart = () => {
    if (!selectedPerfume) return;
    addToCartHook({
      id: String(selectedPerfume.id),
      name: selectedPerfume.name,
      price: selectedPerfume.price,
      image: selectedPerfume.image,
      size: selectedVolume,
      color: selectedConcentration,
    });
    toast({
      title: 'Добавлено в корзину',
      description: `${selectedPerfume.name} · ${selectedConcentration} · ${selectedVolume}`,
      duration: 2000,
    });
    handleProductBack();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

  const handleCheckout = (orderId: string) => {
    createOrder(
      cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, size: i.size, color: i.color })),
      cartTotal,
      { address: 'Москва', phone: '+7 (999) 888-77-66' }
    );
    clearCart();
    setIsCheckoutOpen(false);
    toast({ title: 'Заказ оформлен!', description: `Номер заказа: ${orderId}`, duration: 3000 });
  };

  /* ────────────────────────────────────────────────────────────
     PRODUCT DETAIL PAGE — Fragrance Royale Signature
  ──────────────────────────────────────────────────────────── */
  if (activeTab === 'catalog' && selectedPerfume) {
    const bgColor = selectedPerfume.categoryBg;
    const accentColor = categoryConfig[selectedPerfume.category]?.color ?? '#C9B037';
    const CategoryIcon = categoryConfig[selectedPerfume.category]?.icon;
    const discountPct = selectedPerfume.oldPrice
      ? Math.round((1 - selectedPerfume.price / selectedPerfume.oldPrice) * 100)
      : 0;

    return (
      <m.div
        className="h-screen text-white overflow-hidden relative flex flex-col"
        style={{ backgroundColor: bgColor }}
        variants={productPageVariants}
        initial="initial"
        animate={productExiting ? 'exit' : 'animate'}
        transition={{
          duration: productExiting ? 0.32 : 0.35,
          ease: productExiting ? [0.32, 0, 0.67, 0] : [0.22, 1, 0.36, 1],
        }}
      >
        {/* ── STICKY GLASS HEADER — appears on scroll ── */}
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
                  background: `linear-gradient(145deg, ${accentColor}30 0%, rgba(20,20,20,0.85) 100%)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `0.5px solid ${accentColor}40`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 ${accentColor}20`,
                }}
              >
                <button
                  onClick={handleProductBack}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  data-testid="button-sticky-back"
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.9)' }} strokeWidth={2.5} />
                </button>
                <div className="flex-1 min-w-0 text-center">
                  <p style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: accentColor,
                    fontFamily: "'Satoshi','Inter',sans-serif",
                    marginBottom: '1px',
                  }}>
                    {selectedPerfume.brand}
                  </p>
                  <p style={{
                    fontSize: '15px', fontWeight: 300, fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.95)', letterSpacing: '0.01em',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {selectedPerfume.name}
                  </p>
                </div>
                <button
                  onClick={() => onTabChange?.('cart')}
                  className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform relative"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                  data-testid="button-sticky-cart"
                >
                  <ShoppingBag className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.9)' }} />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ background: accentColor, color: '#000' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* ── SINGLE SCROLL CONTAINER: hero + content together ── */}
        <div
          ref={productScrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ paddingBottom: '180px' }}
          onScroll={(e) => setShowStickyHeader(e.currentTarget.scrollTop > 300)}
        >

        {/* ── HERO IMAGE 70vh — inside scroll so it scrolls away ── */}
        <div className="relative" style={{ height: '70vh', minHeight: '420px' }}>
          <div className="absolute inset-0 overflow-hidden">
            <m.div
              className="w-full h-full"
              initial={{ scale: 1.06, filter: 'brightness(0.72)' }}
              animate={productExiting
                ? { scale: 1.04, filter: 'brightness(0.55)' }
                : { scale: 1, filter: 'brightness(1)' }}
              transition={{ duration: productExiting ? 0.32 : 0.65, ease: [0.32, 0.72, 0, 1] }}
            >
              <LazyImage
                src={selectedPerfume.hoverImage}
                alt={selectedPerfume.name}
                className="w-full h-full object-cover"
              />
            </m.div>
          </div>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, ${bgColor}F0 100%)`,
            }}
          />

          {/* Floating nav */}
          <div
            className="absolute left-0 right-0 z-50 flex items-center justify-between px-4"
            style={{ top: 'calc(max(12px, env(safe-area-inset-top)) + 6px)' }}
          >
            <button
              onClick={handleProductBack}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '0.5px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              data-testid="button-back"
            >
              <ChevronLeft className="w-6 h-6" style={{ color: 'rgba(0,0,0,0.8)' }} strokeWidth={2.5} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(selectedPerfume.id); }}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{
                background: isFavorite(String(selectedPerfume.id))
                  ? 'linear-gradient(145deg, rgba(255,59,48,0.35) 0%, rgba(255,59,48,0.15) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: isFavorite(String(selectedPerfume.id))
                  ? '0.5px solid rgba(255,59,48,0.5)'
                  : '0.5px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              data-testid={`button-favorite-${selectedPerfume.id}`}
            >
              <Heart
                className="w-5 h-5"
                style={{ color: isFavorite(String(selectedPerfume.id)) ? '#FF3B30' : 'rgba(0,0,0,0.75)' }}
                fill={isFavorite(String(selectedPerfume.id)) ? '#FF3B30' : 'none'}
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Category + Stock + NEW pill at bottom of hero */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2 flex-wrap">
            {selectedPerfume.isNew && (
              <div
                className="flex items-center px-3 py-1.5 rounded-full"
                style={{
                  background: accentColor,
                  boxShadow: `0 4px 12px ${accentColor}55`,
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', color: '#000', textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  НОВИНКА · SS'26
                </span>
              </div>
            )}
            {CategoryIcon && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(10px)',
                  border: `0.5px solid ${accentColor}40`,
                }}
              >
                <CategoryIcon style={{ width: '12px', height: '12px', color: accentColor }} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: accentColor, textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  {categoryConfig[selectedPerfume.category]?.label}
                </span>
              </div>
            )}
            {selectedPerfume.inStock <= 8 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.18)', border: '0.5px solid rgba(239,68,68,0.4)' }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  Осталось {selectedPerfume.inStock} шт.
                </span>
              </div>
            )}
          </div>
        </div>

          {/* ── CONTENT SHEET — slides up over hero ── */}
          <m.div
            className="relative"
            style={{ marginTop: '-28px' }}
            variants={contentStagger}
            initial="hidden"
            animate={productExiting ? 'hidden' : 'visible'}
          >
            <div
              className="relative rounded-t-[28px]"
              style={{
                padding: '28px 20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '22px',
                background: '#0C0C0E',
                borderTop: `0.5px solid ${accentColor}25`,
              }}
            >

              {/* ── BLOCK 1: Brand + Name + Price ── */}
              <m.div variants={contentItem}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em',
                    textTransform: 'uppercase', color: accentColor,
                    fontFamily: "'Satoshi','Inter',sans-serif",
                  }}>
                    {selectedPerfume.brand}
                    {selectedPerfume.year && (
                      <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '8px' }}>· {selectedPerfume.year}</span>
                    )}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} style={{ width: '10px', height: '10px' }}
                        fill={s <= Math.round(selectedPerfume.rating) ? 'rgba(255,255,255,0.85)' : 'transparent'}
                        stroke={s <= Math.round(selectedPerfume.rating) ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
                      />
                    ))}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: '4px' }}>
                      {selectedPerfume.rating}
                    </span>
                  </div>
                </div>

                <h2 style={{
                  fontSize: '34px', fontWeight: 300, fontStyle: 'italic',
                  letterSpacing: '0.01em', lineHeight: 1.1,
                  color: 'rgba(255,255,255,0.97)', marginBottom: '14px',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}>
                  {selectedPerfume.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <p style={{
                    fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums', fontFamily: "'Satoshi','Inter',sans-serif",
                    color: 'rgba(255,255,255,0.97)', lineHeight: 1,
                  }}>
                    {formatPrice(selectedPerfume.price)}
                  </p>
                  {selectedPerfume.oldPrice && (
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      {formatPrice(selectedPerfume.oldPrice)}
                    </p>
                  )}
                  {discountPct > 0 && (
                    <div
                      className="inline-flex items-center px-2.5 py-1 rounded-full"
                      style={{
                        background: `${accentColor}22`,
                        color: accentColor,
                        border: `0.5px solid ${accentColor}50`,
                        fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em',
                        fontFamily: "'Satoshi','Inter',sans-serif",
                      }}
                    >
                      −{discountPct}%
                    </div>
                  )}
                </div>
              </m.div>

              {/* ── DESCRIPTION — editorial excerpt ── */}
              <m.div variants={contentItem}>
                <p style={{
                  fontSize: '13px',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: "'Satoshi','Inter',sans-serif",
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  borderLeft: `2px solid ${accentColor}55`,
                  paddingLeft: '12px',
                }}>
                  {selectedPerfume.description}
                </p>
              </m.div>

              {/* ── CONCENTRATION selector — moved before tabs ── */}
              <m.div variants={contentItem}>
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  marginBottom: '12px', fontFamily: "'Satoshi','Inter',sans-serif",
                }}>
                  Концентрация
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedPerfume.concentrations.map((conc, idx) => {
                    const isSelected = selectedConcentration === conc;
                    const color = selectedPerfume.concentrationColors[idx] ?? accentColor;
                    return (
                      <button
                        key={conc}
                        onClick={() => setSelectedConcentration(conc)}
                        className="active:scale-95 transition-all duration-200"
                        style={{
                          padding: '10px 18px', borderRadius: '12px',
                          fontSize: '12px', fontWeight: 700,
                          letterSpacing: '0.03em', fontFamily: "'Satoshi','Inter',sans-serif",
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.55)',
                          background: isSelected ? `linear-gradient(135deg, ${color}90 0%, ${color}60 100%)` : 'rgba(255,255,255,0.06)',
                          border: isSelected ? `0.5px solid ${color}80` : '0.5px solid rgba(255,255,255,0.1)',
                          boxShadow: isSelected ? `0 4px 16px ${color}30` : 'none',
                        }}
                        aria-pressed={isSelected}
                        data-testid={`button-concentration-${conc}`}
                      >
                        {conc}
                      </button>
                    );
                  })}
                </div>
              </m.div>

              {/* ── VOLUME selector — moved before tabs ── */}
              <m.div variants={contentItem}>
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  marginBottom: '12px', fontFamily: "'Satoshi','Inter',sans-serif",
                }}>
                  Объём
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedPerfume.volumes.map((vol) => {
                    const isSelected = selectedVolume === vol;
                    return (
                      <button
                        key={vol}
                        onClick={() => setSelectedVolume(vol)}
                        className="active:scale-95 transition-all duration-200"
                        style={{
                          flex: 1, padding: '14px 8px', borderRadius: '12px',
                          fontSize: '14px', fontWeight: 700,
                          fontFamily: "'Satoshi','Inter',sans-serif",
                          color: isSelected ? '#000' : 'rgba(255,255,255,0.65)',
                          background: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.07)',
                          border: isSelected ? 'none' : '0.5px solid rgba(255,255,255,0.12)',
                          boxShadow: isSelected ? '0 4px 20px rgba(255,255,255,0.15)' : 'none',
                        }}
                        aria-pressed={isSelected}
                        data-testid={`button-volume-${vol}`}
                      >
                        {vol}
                      </button>
                    );
                  })}
                </div>
              </m.div>

              {/* ── TAB NAVIGATION: Аромат / Детали / Отзывы ── */}
              <m.div variants={contentItem} style={{ borderBottom: `0.5px solid rgba(255,255,255,0.1)` }}>
                <div style={{ display: 'flex' }} role="tablist">
                  {[
                    { key: 'fragrance', label: 'Аромат' },
                    { key: 'details',   label: 'Детали' },
                    { key: 'reviews',   label: `Отзывы (${mockPerfumeReviews.length})` },
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
                        fontFamily: "'Satoshi','Inter',sans-serif",
                        borderBottom: activeProductTab === tab.key
                          ? `1.5px solid ${accentColor}`
                          : '1.5px solid transparent',
                        marginBottom: '-0.5px',
                        background: 'transparent',
                      }}
                      role="tab"
                      aria-selected={activeProductTab === tab.key}
                      data-testid={`tab-${tab.key}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </m.div>

              {/* ── TAB CONTENT PANELS ── */}
              <m.div variants={contentItem} style={{ minHeight: '260px' }}>

                {/* ── TAB: АРОМАТ — Notes Pyramid + Longevity/Sillage + Occasions + Perfumer's Note ── */}
                {activeProductTab === 'fragrance' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                    {/* Notes Pyramid */}
                    <div>
                      <p style={{
                        fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                        marginBottom: '14px', fontFamily: "'Satoshi','Inter',sans-serif",
                      }}>
                        Пирамида аромата
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {/* Top notes */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '58px', flexShrink: 0, fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif", textAlign: 'right' }}>
                            Верхние
                          </div>
                          <div style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: `linear-gradient(135deg, ${accentColor}18 0%, rgba(255,255,255,0.04) 100%)`, border: `0.5px solid ${accentColor}30`, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' as const }}>
                            {selectedPerfume.topNotes.map((note) => (
                              <span key={note} style={{ fontSize: '11px', color: `${accentColor}E0`, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 500 }}>{note}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '58px', flexShrink: 0 }} />
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><div style={{ width: '1px', height: '8px', background: `${accentColor}30` }} /></div>
                        </div>
                        {/* Heart notes */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '58px', flexShrink: 0, fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif", textAlign: 'right' }}>
                            Сердце
                          </div>
                          <div style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: `linear-gradient(135deg, ${accentColor}28 0%, rgba(255,255,255,0.05) 100%)`, border: `0.5px solid ${accentColor}40`, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' as const }}>
                            {selectedPerfume.heartNotes.map((note) => (
                              <span key={note} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.88)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 500 }}>{note}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '58px', flexShrink: 0 }} />
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}><div style={{ width: '1px', height: '8px', background: `${accentColor}30` }} /></div>
                        </div>
                        {/* Base notes */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '58px', flexShrink: 0, fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif", textAlign: 'right' }}>
                            База
                          </div>
                          <div style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' as const }}>
                            {selectedPerfume.baseNotes.map((note) => (
                              <span key={note} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 500 }}>{note}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Longevity & Sillage */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Satoshi','Inter',sans-serif" }}>Стойкость</p>
                        <p style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.92)', fontFamily: "'Satoshi','Inter',sans-serif", lineHeight: 1, marginBottom: '8px' }}>{selectedPerfume.longevity}</p>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          {[...Array(8)].map((_, i) => (
                            <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < Math.round(selectedPerfume.longevityHours / 2) ? accentColor : 'rgba(255,255,255,0.1)' }} />
                          ))}
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: '14px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                        <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Satoshi','Inter',sans-serif" }}>Шлейф</p>
                        <p style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.92)', fontFamily: "'Satoshi','Inter',sans-serif", lineHeight: 1, marginBottom: '8px' }}>{sillageLabel[selectedPerfume.sillage]}</p>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {[1, 2, 3].map((lvl) => (
                            <div key={lvl} style={{ width: '28px', height: '3px', borderRadius: '2px', background: lvl <= sillageLevel[selectedPerfume.sillage] ? accentColor : 'rgba(255,255,255,0.1)' }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Occasions */}
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontFamily: "'Satoshi','Inter',sans-serif" }}>Когда носить</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                        {selectedPerfume.occasions.map((occ) => (
                          <div key={occ} style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', fontFamily: "'Satoshi','Inter',sans-serif", letterSpacing: '0.02em' }}>
                            {occ}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Perfumer's Note */}
                    <div style={{ padding: '18px 20px', borderRadius: '16px', background: `linear-gradient(135deg, ${accentColor}08 0%, rgba(255,255,255,0.02) 100%)`, border: `0.5px solid ${accentColor}20` }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: accentColor, marginBottom: '12px', fontFamily: "'Satoshi','Inter',sans-serif" }}>Слово парфюмера</p>
                      <p style={{ fontSize: '15px', lineHeight: 1.72, color: 'rgba(255,255,255,0.72)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.01em' }}>
                        "{selectedPerfume.perfumerNote}"
                      </p>
                    </div>

                  </div>
                )}

                {/* ── TAB: ДЕТАЛИ — Characteristics table ── */}
                {activeProductTab === 'details' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'Бренд', value: selectedPerfume.brand },
                      { label: 'Год создания', value: selectedPerfume.year ? String(selectedPerfume.year) : '—' },
                      { label: 'Семейство', value: categoryConfig[selectedPerfume.category]?.label ?? selectedPerfume.category },
                      { label: 'Для кого', value: selectedPerfume.gender === 'Men' ? 'Мужской' : selectedPerfume.gender === 'Woman' ? 'Женский' : 'Унисекс' },
                      { label: 'Концентрация', value: selectedPerfume.concentrations.join(', ') },
                      { label: 'Шлейф', value: sillageLabel[selectedPerfume.sillage] },
                      { label: 'Стойкость', value: selectedPerfume.longevity },
                      { label: 'В наличии', value: `${selectedPerfume.inStock} шт.` },
                      { label: 'Объёмы', value: selectedPerfume.volumes.join(', ') },
                      { label: 'Рейтинг', value: '__stars__' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '12px 14px', borderRadius: '12px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '0.5px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: "'Satoshi','Inter',sans-serif" }}>{item.label}</span>
                        {item.value === '__stars__' ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} style={{ width: '11px', height: '11px' }}
                                  fill={s <= Math.round(selectedPerfume.rating) ? accentColor : 'transparent'}
                                  stroke={s <= Math.round(selectedPerfume.rating) ? accentColor : 'rgba(255,255,255,0.2)'}
                                />
                              ))}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: "'Satoshi','Inter',sans-serif" }}>{selectedPerfume.rating}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '12px', fontWeight: 600, fontFamily: "'Satoshi','Inter',sans-serif" }}>{item.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── TAB: ОТЗЫВЫ — Reviews ── */}
                {activeProductTab === 'reviews' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Rating summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex' }}>
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className="w-4 h-4"
                              fill={s <= Math.round(selectedPerfume.rating) ? 'rgba(255,255,255,0.95)' : 'transparent'}
                              stroke={s <= Math.round(selectedPerfume.rating) ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontFamily: "'Satoshi','Inter',sans-serif" }}>{selectedPerfume.rating}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Satoshi','Inter',sans-serif" }}>{mockPerfumeReviews.length} отзывов</span>
                    </div>

                    {mockPerfumeReviews.map((review, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px', borderRadius: '16px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '0.5px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${accentColor}60 0%, ${accentColor}30 100%)`,
                            border: `0.5px solid ${accentColor}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor, fontFamily: "'Satoshi','Inter',sans-serif" }}>{review.initials}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: "'Satoshi','Inter',sans-serif" }}>{review.author}</p>
                              {review.verified && (
                                <span style={{ fontSize: '9px', fontWeight: 700, color: accentColor, letterSpacing: '0.1em', fontFamily: "'Satoshi','Inter',sans-serif" }}>✓ ВЕРИФИЦИРОВАН</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ display: 'flex', gap: '1px' }}>
                                {[1,2,3,4,5].map((s) => (
                                  <Star key={s} style={{ width: '10px', height: '10px' }}
                                    fill={s <= review.rating ? 'rgba(255,255,255,0.8)' : 'transparent'}
                                    stroke={s <= review.rating ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)'}
                                  />
                                ))}
                              </div>
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Satoshi','Inter',sans-serif" }}>{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>{review.text}</p>
                      </div>
                    ))}
                  </div>
                )}

              </m.div>

              {/* ── BLOCK 8: SERVICE STRIP ── */}
              <m.div variants={contentItem}>
                <div style={{
                  display: 'flex', alignItems: 'stretch',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}>
                  {[
                    { icon: <Truck style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Доставка', sub: 'Бесплатно' },
                    { icon: <RotateCcw style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Возврат', sub: '30 дней' },
                    { icon: <ShieldCheck style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Оригинал', sub: 'Сертификат' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      flex: 1,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '14px 8px', gap: '5px',
                      borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.07)' : 'none',
                    }}>
                      {item.icon}
                      <p style={{
                        fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
                        fontFamily: "'Satoshi','Inter',sans-serif", lineHeight: 1,
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '9px', color: 'rgba(255,255,255,0.35)',
                        fontFamily: "'Satoshi','Inter',sans-serif",
                      }}>
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </m.div>

              {/* ── BLOCK 9: RECOMMENDED carousel ── */}
              {(() => {
                const recommended = perfumes
                  .filter(p => p.id !== selectedPerfume.id)
                  .sort((a, b) => {
                    const sameCat = (a.category === selectedPerfume.category ? 1 : 0) - (b.category === selectedPerfume.category ? 1 : 0);
                    return -sameCat;
                  })
                  .slice(0, 6);
                if (recommended.length === 0) return null;
                return (
                  <m.div variants={contentItem}>
                    <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                      <p style={{
                        fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                        fontFamily: "'Satoshi','Inter',sans-serif", whiteSpace: 'nowrap',
                      }}>
                        Вам также понравится
                      </p>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                    </div>

                    <div
                      style={{
                        display: 'flex', gap: '12px',
                        overflowX: 'auto', paddingBottom: '4px',
                      }}
                      className="scrollbar-hide"
                    >
                      {recommended.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPerfume(p);
                            setSelectedVolume(p.volumes[0]);
                            setSelectedConcentration(p.concentrations[0]);
                            setActiveProductTab('fragrance');
                            setTimeout(() => productScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                          }}
                          className="cursor-pointer active:scale-95 transition-all duration-200"
                          style={{ width: '120px', flexShrink: 0 }}
                          data-testid={`recommended-perfume-${p.id}`}
                        >
                          <div style={{
                            width: '120px', height: '140px', borderRadius: '14px',
                            overflow: 'hidden', marginBottom: '8px', position: 'relative',
                            background: 'rgba(255,255,255,0.05)',
                          }}>
                            <LazyImage
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            {p.isNew && (
                              <div style={{
                                position: 'absolute', top: '6px', left: '6px',
                                padding: '2px 7px', borderRadius: '6px',
                                fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                                background: accentColor, color: '#000',
                                fontFamily: "'Satoshi','Inter',sans-serif",
                              }}>
                                NEW
                              </div>
                            )}
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
                              background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
                            }} />
                          </div>
                          <p style={{
                            fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em',
                            color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                            fontFamily: "'Satoshi','Inter',sans-serif",
                            marginBottom: '3px',
                          }}>
                            {p.brand}
                          </p>
                          <p style={{
                            fontSize: '13px', fontWeight: 300, fontStyle: 'italic',
                            color: 'rgba(255,255,255,0.88)', lineHeight: 1.25,
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                            marginBottom: '4px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          } as React.CSSProperties}>
                            {p.name}
                          </p>
                          <p style={{
                            fontSize: '12px', fontWeight: 700,
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: "'Satoshi','Inter',sans-serif",
                          }}>
                            {formatPrice(p.price)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </m.div>
                );
              })()}

            </div>
          </m.div>
        </div>

        {/* ── CTA: Fixed Add to Cart ── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
          padding: `16px 20px calc(16px + env(safe-area-inset-bottom, 0px))`,
          background: `linear-gradient(0deg, ${bgColor} 60%, transparent 100%)`,
        }}>
          <ConfirmDrawer
            trigger={
              <button
                className="w-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-200"
                style={{
                  height: '56px',
                  borderRadius: '18px',
                  background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}BB 100%)`,
                  boxShadow: `0 8px 32px ${accentColor}40`,
                  border: 'none',
                }}
                data-testid="button-buy-now"
              >
                <ShoppingBag style={{ width: '20px', height: '20px', color: '#000' }} strokeWidth={2} />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#000', letterSpacing: '-0.01em', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  В корзину
                </span>
                <div style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.2)', margin: '0 4px' }} />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#000', fontVariantNumeric: 'tabular-nums', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  {formatPrice(selectedPerfume.price)}
                </span>
              </button>
            }
            title="Добавить в корзину?"
            description={`${selectedPerfume.name} · ${selectedConcentration} · ${selectedVolume}`}
            confirmText="Добавить"
            cancelText="Отмена"
            variant="default"
            onConfirm={addToCart}
          />
        </div>
      </m.div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     HOME PAGE — Editorial 2026
  ──────────────────────────────────────────────────────────── */
  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="FRAGRANCE"
          subtitle="ROYALE"
          accentColor="var(--theme-primary)"
          bgColor="var(--theme-background)"
        />

        {/* ─── HEADER ─── */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={sidebar.open}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              aria-label="Меню"
              data-testid="button-menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="text-[19px] font-black tracking-[0.22em] leading-none" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>
                FRAGRANCE
              </div>
              <div className="text-[7px] font-light tracking-[0.42em] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                ROYALE · PARFUMS
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onTabChange?.('cart')}
                className="relative w-10 h-10 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                aria-label="Корзина"
                data-testid="button-view-cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-black"
                    style={{ background: '#C9B037' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
            <input
              type="text"
              placeholder="Поиск ароматов, брендов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder:text-white/35 outline-none flex-1 text-sm"
              style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}
              data-testid="input-search"
            />
          </div>

          {/* Gender filters — animated underline */}
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
                  fontFamily: "'Satoshi','Inter',sans-serif",
                  letterSpacing: selectedGender === gender ? '-0.01em' : '0',
                }}
                aria-pressed={selectedGender === gender}
              >
                {gender === 'All' ? 'Все' : gender === 'Woman' ? 'Женские' : gender === 'Men' ? 'Мужские' : 'Унисекс'}
                {selectedGender === gender && (
                  <m.div
                    layoutId="gender-underline-fragrance"
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ background: '#C9B037' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── MARQUEE STRIP ─── */}
        <div className="overflow-hidden py-2.5 mb-1"
          style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)', borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <m.div
            className="flex gap-0 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
            style={{ width: 'max-content' }}
          >
            {[...Array(2)].map((_, rep) => (
              <span key={rep} className="inline-flex items-center gap-6 pr-6">
                {['FRAGRANCE ROYALE', '✦', "SS'26", '✦', 'PARFUMS EXCLUSIFS', '✦', 'NICHE PERFUMERY', '✦', 'ÉDITION LIMITÉE', '✦', 'MAISON DE PARFUMS', '✦'].map((word, wi) => (
                  <span key={wi} className="text-[10px] font-semibold tracking-[0.25em] uppercase"
                    style={{ color: word === '✦' ? '#C9B037' : 'rgba(255,255,255,0.35)' }}>
                    {word}
                  </span>
                ))}
              </span>
            ))}
          </m.div>
        </div>

        {/* ─── EDITORIAL HERO — video ─── */}
        <div className="relative mx-4 mt-3 rounded-[26px] overflow-hidden" style={{ height: '410px' }}>
          <video
            src="/videos/luxury_fragrance.mp4"
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-hero-banner"
          />
          {/* Layered gradients for depth */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.05) 32%, rgba(0,0,0,0.65) 68%, rgba(0,0,0,0.93) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 55%)' }} />

          {/* Season tag — frosted glass pill top-left */}
          <div className="absolute top-4 left-4">
            <span className="text-[9px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', color: 'rgba(255,255,255,0.75)', border: '0.5px solid rgba(255,255,255,0.18)' }}>
              SS&apos;26
            </span>
          </div>

          {/* Edition number — top right editorial */}
          <div className="absolute top-4 right-4 text-right">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>VOL.I</p>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>№001</p>
          </div>

          {/* Hero text — animated entrance */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ lineHeight: 0.9, marginBottom: '10px' }}>
                <div style={{ fontSize: '50px', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', display: 'block' }}>
                  PARFUMS
                </div>
                <div style={{ fontSize: '50px', fontWeight: 100, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", display: 'block' }}>
                  d&apos;exception
                </div>
              </div>
              <div className="flex items-center gap-4 mt-5">
                <button
                  onClick={() => onTabChange?.('catalog')}
                  className="px-5 py-2.5 rounded-full text-[13px] font-black text-black transition-all active:scale-95"
                  style={{ background: '#C9B037', letterSpacing: '-0.01em', fontFamily: "'Satoshi','Inter',sans-serif" }}
                  data-testid="button-hero-shop-now"
                >
                  Смотреть →
                </button>
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  Весна — Лето 2026
                </p>
              </div>
            </m.div>
          </div>
        </div>

        {/* Scent family chips */}
        <div className="mt-7 px-5">
          <div className="flex items-center justify-between mb-3">
            <p style={{
              fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
              color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
              fontFamily: "'Satoshi','Inter',sans-serif",
            }}>
              Семейство ароматов
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {Object.entries(categoryConfig).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => { setSelectedCategory(key); onTabChange?.('catalog'); }}
                  className="flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition-all duration-200"
                  style={{
                    padding: '8px 14px', borderRadius: '20px',
                    fontSize: '11px', fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    background: 'rgba(255,255,255,0.06)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    fontFamily: "'Satoshi','Inter',sans-serif",
                  }}
                >
                  <Icon style={{ width: '12px', height: '12px', color: cfg.color }} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Editorial section divider ─── */}
        <div className="px-4 mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <p className="text-[8px] font-semibold tracking-[0.35em] uppercase text-center mb-0.5"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                Парфюмер рекомендует
              </p>
              <h2 className="leading-none text-center"
                style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '0.08em', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>
                Parfum du Moment
              </h2>
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Featured perfume — full-width editorial card */}
          {(() => {
            const featured = perfumes.find(p => p.isTrending && p.isNew) ?? perfumes[0];
            const featuredCfg = categoryConfig[featured.category];
            return (
              <m.div
                whileTap={{ scale: 0.985 }}
                onClick={() => openPerfume(featured)}
                className="relative cursor-pointer rounded-[22px] overflow-hidden"
                style={{ height: '300px' }}
                data-testid={`featured-perfume-${featured.id}`}
              >
                <img src={featured.image} alt={featured.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.85) 100%)' }} />

                {/* Category badge */}
                <div className="absolute top-3.5 left-3.5">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.15)', color: featuredCfg?.color ?? '#C9B037', fontFamily: "'Satoshi','Inter',sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    {featured.category}
                  </span>
                </div>

                {/* Quick heart */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }}
                  className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                  style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                  data-testid={`button-favorite-featured-${featured.id}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(String(featured.id)) ? 'fill-white text-white' : 'text-white'}`} />
                </button>

                {/* Info bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: "'Satoshi','Inter',sans-serif", marginBottom: '4px' }}>
                        {featured.brand}
                      </p>
                      <p style={{ fontSize: '26px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: '#fff', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                        {featured.name}
                      </p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                        {featured.topNotes.slice(0, 3).join(' · ')}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Satoshi','Inter',sans-serif", letterSpacing: '-0.03em' }}>
                        {formatPrice(featured.price)}
                      </p>
                      {featured.oldPrice && (
                        <p style={{ fontSize: '12px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                          {formatPrice(featured.oldPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </m.div>
            );
          })()}
        </div>

        {/* Just Arrived section */}
        <div className="mt-10 px-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                fontFamily: "'Satoshi','Inter',sans-serif", marginBottom: '4px',
              }}>
                Новинки
              </p>
              <h3 style={{
                fontSize: '22px', fontWeight: 300, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.92)',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                Just Arrived
              </h3>
            </div>
            <button
              onClick={() => onTabChange?.('catalog')}
              style={{
                fontSize: '11px', color: '#C9B037', fontWeight: 600,
                letterSpacing: '0.05em', fontFamily: "'Satoshi','Inter',sans-serif",
              }}
            >
              Все →
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {perfumes.filter(p => p.isNew && (selectedGender === 'All' || p.gender === selectedGender)).map((perfume) => (
              <div
                key={perfume.id}
                onClick={() => openPerfume(perfume)}
                className="cursor-pointer active:scale-[0.97] transition-all duration-200 flex-shrink-0"
                style={{ width: '148px' }}
                data-testid={`new-perfume-${perfume.id}`}
              >
                <div style={{
                  width: '148px', height: '168px', borderRadius: '16px',
                  overflow: 'hidden', position: 'relative', marginBottom: '10px',
                  background: 'rgba(255,255,255,0.05)',
                }}>
                  <LazyImage src={perfume.image} alt={perfume.name} className="w-full h-full object-cover" />
                  <div style={{
                    position: 'absolute', top: '8px', left: '8px',
                    padding: '3px 8px', borderRadius: '7px',
                    fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                    background: '#C9B037', color: '#000',
                    fontFamily: "'Satoshi','Inter',sans-serif",
                  }}>
                    NEW
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(perfume.id); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                    data-testid={`button-favorite-${perfume.id}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(String(perfume.id)) ? 'fill-white text-white' : 'text-white'}`} />
                  </button>
                </div>
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em',
                  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  fontFamily: "'Satoshi','Inter',sans-serif", marginBottom: '3px',
                }}>
                  {perfume.brand}
                </p>
                <p style={{
                  fontSize: '14px', fontWeight: 300, fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.9)', lineHeight: 1.2,
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  marginBottom: '5px',
                }}>
                  {perfume.name}
                </p>
                <p style={{
                  fontSize: '13px', fontWeight: 700,
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: "'Satoshi','Inter',sans-serif",
                }}>
                  {formatPrice(perfume.price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bestsellers — 2 col grid */}
        <div className="mt-10 px-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                fontFamily: "'Satoshi','Inter',sans-serif", marginBottom: '4px',
              }}>
                Хиты продаж
              </p>
              <h3 style={{
                fontSize: '22px', fontWeight: 300, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.92)',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                Bestsellers
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {perfumes.filter(p => p.isTrending && (selectedGender === 'All' || p.gender === selectedGender)).map((perfume) => (
              <div
                key={perfume.id}
                onClick={() => openPerfume(perfume)}
                className="cursor-pointer active:scale-[0.97] transition-all duration-200"
                data-testid={`trending-perfume-${perfume.id}`}
              >
                <div style={{
                  height: '200px', borderRadius: '16px', overflow: 'hidden',
                  position: 'relative', marginBottom: '10px',
                  background: 'rgba(255,255,255,0.05)',
                }}>
                  <LazyImage src={perfume.image} alt={perfume.name} className="w-full h-full object-cover" />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 60%)',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: '10px', left: '10px', right: '10px',
                  }}>
                    <p style={{
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
                      fontFamily: "'Satoshi','Inter',sans-serif", marginBottom: '2px',
                    }}>
                      {perfume.brand}
                    </p>
                    <p style={{
                      fontSize: '15px', fontWeight: 300, fontStyle: 'italic',
                      color: '#fff', lineHeight: 1.15,
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                    }}>
                      {perfume.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(perfume.id); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
                    data-testid={`button-favorite-${perfume.id}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(String(perfume.id)) ? 'fill-white text-white' : 'text-white'}`} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{
                    fontSize: '14px', fontWeight: 700,
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: "'Satoshi','Inter',sans-serif",
                  }}>
                    {formatPrice(perfume.price)}
                  </p>
                  {perfume.oldPrice && (
                    <p style={{
                      fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                      textDecoration: 'line-through',
                      fontFamily: "'Satoshi','Inter',sans-serif",
                    }}>
                      {formatPrice(perfume.oldPrice)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     CATALOG PAGE
  ──────────────────────────────────────────────────────────── */
  if (activeTab === 'catalog') {
    const filtered = perfumes.filter(p =>
      (selectedCategory === 'Все' || p.category === selectedCategory) &&
      (selectedGender === 'All' || p.gender === selectedGender)
    );
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        {/* ─── Catalog Header ─── */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5"
                style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                FRAGRANCE ROYALE
              </p>
              <h1 className="leading-none" style={{
                fontSize: '30px', fontWeight: 300, letterSpacing: '0.06em',
                fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic',
              }}>
                Каталог
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                aria-label="Поиск" data-testid="button-view-search">
                <Search className="w-4 h-4" />
              </button>
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}
                aria-label="Фильтры" data-testid="button-view-filter">
                <Filter className="w-4 h-4" />
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
                  background: selectedCategory === cat ? '#C9B037' : 'rgba(255,255,255,0.07)',
                  color: selectedCategory === cat ? '#000' : 'rgba(255,255,255,0.6)',
                  border: selectedCategory === cat ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                  fontSize: '11px', fontWeight: selectedCategory === cat ? 700 : 500,
                  letterSpacing: '0.04em', fontFamily: "'Satoshi','Inter',sans-serif",
                }}
                aria-pressed={selectedCategory === cat}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product count */}
          <p className="mt-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
            {filtered.length} {filtered.length === 1 ? 'аромат' : filtered.length < 5 ? 'аромата' : 'ароматов'}
          </p>
        </div>

        {/* ─── Products — Interleaved Asymmetric Grid ─── */}
        <div className="px-4 space-y-3 pb-2">
          {(() => {
            const rows: React.ReactNode[] = [];
            let i = 0;
            let groupIdx = 0;
            while (i < filtered.length) {
              const featured = filtered[i];
              const discountFeatured = featured.oldPrice ? Math.round((1 - featured.price / featured.oldPrice) * 100) : 0;
              // Full-width featured card
              rows.push(
                <m.div
                  key={`featured-${featured.id}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.1 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => openPerfume(featured)}
                  className="relative cursor-pointer rounded-[20px] overflow-hidden"
                  style={{ height: '280px' }}
                  data-testid={`perfume-card-${featured.id}`}
                >
                  <LazyImage src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Badges top-left */}
                  <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                    {featured.isNew && (
                      <span className="px-2 py-1 text-[9px] font-black rounded-full tracking-[0.08em] uppercase text-black"
                        style={{ background: '#C9B037' }}>NEW</span>
                    )}
                    <span className="px-2 py-1 text-[9px] font-medium rounded-full"
                      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', color: categoryConfig[featured.category]?.color ?? '#fff', border: '0.5px solid rgba(255,255,255,0.15)', fontFamily: "'Satoshi','Inter',sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {featured.category}
                    </span>
                  </div>

                  {/* Actions top-right */}
                  <div className="absolute top-3.5 right-3.5 flex gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuickViewPerfume(featured); }}
                      aria-label="Быстрый просмотр"
                      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                      data-testid={`button-quickview-${featured.id}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }}
                      aria-label="Избранное"
                      className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                      data-testid={`button-favorite-catalog-${featured.id}`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(String(featured.id)) ? 'fill-white' : ''} text-white`} />
                    </button>
                  </div>

                  {/* Info bottom-left */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                      <div className="flex-1 mr-3">
                        <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                          {featured.brand}
                        </p>
                        <p style={{ fontSize: '18px', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.02em', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.15 }}>
                          {featured.name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                          {formatPrice(featured.price)}
                        </p>
                        {featured.oldPrice && (
                          <p className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                            {formatPrice(featured.oldPrice)}
                          </p>
                        )}
                        {discountFeatured > 0 && (
                          <span className="inline-block text-[9px] font-black text-black mt-1 px-1.5 py-0.5 rounded-md" style={{ background: '#C9B037', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                            −{discountFeatured}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </m.div>
              );
              i++;

              // 2-col pair
              const pair = filtered.slice(i, i + 2);
              if (pair.length > 0) {
                rows.push(
                  <div key={`pair-${groupIdx}`} className="grid grid-cols-2 gap-3">
                    {pair.map((product, colIdx) => {
                      const discountPair = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
                      return (
                        <m.div
                          key={product.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: groupIdx * 0.1 + 0.04 + colIdx * 0.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => openPerfume(product)}
                          className="cursor-pointer"
                          data-testid={`perfume-card-${product.id}`}
                        >
                          <div className="relative rounded-[18px] overflow-hidden mb-2.5"
                            style={{ height: colIdx === 0 ? '210px' : '178px' }}>
                            <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                            {/* Actions */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                                aria-label="Избранное"
                                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                                style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.18)' }}
                                data-testid={`button-favorite-catalog-${product.id}`}
                              >
                                <Heart className={`w-3 h-3 ${isFavorite(String(product.id)) ? 'fill-white' : ''} text-white`} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setQuickViewPerfume(product); }}
                                aria-label="Быстрый просмотр"
                                className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                                style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.18)' }}
                                data-testid={`button-quickview-${product.id}`}
                              >
                                <Eye className="w-3 h-3 text-white" />
                              </button>
                            </div>

                            {/* Discount badge */}
                            {discountPair > 0 && (
                              <div className="absolute top-2 left-2">
                                <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md text-black"
                                  style={{ background: '#C9B037', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                                  −{discountPair}%
                                </span>
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-[8px] font-semibold tracking-[0.22em] uppercase mb-0.5 truncate"
                              style={{ color: 'rgba(255,255,255,0.38)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                              {product.brand}
                            </p>
                            <p style={{ fontSize: '13px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.2, marginBottom: '4px', fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'rgba(255,255,255,0.9)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                              {product.name}
                            </p>
                            <div className="flex items-baseline gap-1.5 mb-1">
                              <span className="text-[13px] font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                                {formatPrice(product.price)}
                              </span>
                              {product.oldPrice && (
                                <span className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                                  {formatPrice(product.oldPrice)}
                                </span>
                              )}
                            </div>
                            {/* Star rating dots */}
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: star <= Math.round(product.rating) ? '#C9B037' : 'rgba(255,255,255,0.15)' }} />
                              ))}
                            </div>
                          </div>
                        </m.div>
                      );
                    })}
                  </div>
                );
                i += pair.length;
              }
              groupIdx++;
            }
            return rows;
          })()}
        </div>

        {/* ─── QUICK VIEW MODAL ─── */}
        <AnimatePresence>
          {quickViewPerfume && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] flex items-end justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
              onClick={() => setQuickViewPerfume(null)}
            >
              <m.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                className="w-full max-w-lg rounded-t-[32px] overflow-hidden relative"
                style={{
                  background: 'linear-gradient(180deg, rgba(30,22,40,0.97) 0%, rgba(16,12,22,0.99) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 -20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                  maxHeight: '72vh',
                  paddingBottom: 'calc(max(24px, env(safe-area-inset-bottom)) + 80px)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-2">
                  <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.28)' }} />
                </div>

                {/* Close */}
                <button
                  onClick={() => setQuickViewPerfume(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
                  style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)' }}
                  data-testid="button-close-quickview"
                >
                  <X className="w-4 h-4 text-white" />
                </button>

                <div className="px-5 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(72vh - 56px)' }}>
                  {/* Hero row */}
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ width: '100px', flexShrink: 0, borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', aspectRatio: '2/3' }}>
                      <LazyImage src={quickViewPerfume.image} alt={quickViewPerfume.name} className="w-full h-full object-cover" />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '2px', minWidth: 0 }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: '6px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                        {quickViewPerfume.brand}
                      </p>
                      <h3 style={{ fontSize: '20px', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.03em', color: 'rgba(255,255,255,0.95)', lineHeight: 1.15, marginBottom: '8px' }}>
                        {quickViewPerfume.name}
                      </h3>
                      {/* Stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '12px' }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} style={{ width: '11px', height: '11px' }}
                            fill={s <= Math.round(quickViewPerfume.rating) ? '#C9B037' : 'transparent'}
                            stroke={s <= Math.round(quickViewPerfume.rating) ? '#C9B037' : 'rgba(255,255,255,0.2)'}
                          />
                        ))}
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginLeft: '3px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                          {quickViewPerfume.rating}
                        </span>
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' as const }}>
                          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                            {formatPrice(quickViewPerfume.price)}
                          </span>
                          {quickViewPerfume.oldPrice && (
                            <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.28)', fontVariantNumeric: 'tabular-nums' }}>
                              {formatPrice(quickViewPerfume.oldPrice)}
                            </span>
                          )}
                        </div>
                        {quickViewPerfume.oldPrice && (
                          <span style={{ display: 'inline-block', marginTop: '5px', fontSize: '10px', fontWeight: 700, color: '#000', background: '#C9B037', borderRadius: '6px', padding: '2px 8px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                            −{Math.round((1 - quickViewPerfume.price / quickViewPerfume.oldPrice) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', marginBottom: '16px' }} />

                  {/* Top Notes preview */}
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                      Верхние ноты
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const }}>
                      {quickViewPerfume.topNotes.map(note => (
                        <span key={note} style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category + Longevity */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', fontFamily: "'Satoshi','Inter',sans-serif" }}>Семейство</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: categoryConfig[quickViewPerfume.category]?.color ?? '#fff', fontFamily: "'Satoshi','Inter',sans-serif" }}>{quickViewPerfume.category}</p>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px', fontFamily: "'Satoshi','Inter',sans-serif" }}>Стойкость</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontFamily: "'Satoshi','Inter',sans-serif" }}>{quickViewPerfume.longevity}</p>
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => { setQuickViewPerfume(null); openPerfume(quickViewPerfume); }}
                      className="flex-1 py-3.5 rounded-[16px] text-[13px] font-bold transition-all active:scale-[0.98]"
                      style={{ background: 'rgba(255,255,255,0.09)', color: 'rgba(255,255,255,0.85)', border: '0.5px solid rgba(255,255,255,0.15)', fontFamily: "'Satoshi','Inter',sans-serif" }}
                      data-testid="button-quickview-details"
                    >
                      Подробнее
                    </button>
                    <button
                      onClick={() => {
                        addToCartHook({ id: String(quickViewPerfume.id), name: quickViewPerfume.name, price: quickViewPerfume.price, image: quickViewPerfume.image, size: quickViewPerfume.volumes[0], color: quickViewPerfume.concentrations[0] });
                        toast({ title: 'Добавлено в корзину', description: `${quickViewPerfume.name} · ${quickViewPerfume.concentrations[0]}`, duration: 2000 });
                        setQuickViewPerfume(null);
                      }}
                      className="flex-1 py-3.5 rounded-[16px] text-[13px] font-black transition-all active:scale-[0.98]"
                      style={{ background: '#C9B037', color: '#000', fontFamily: "'Satoshi','Inter',sans-serif" }}
                      data-testid="button-quickview-add-to-cart"
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ─── CART ─── */
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-32 smooth-scroll-page">
        <div className="px-5 pt-5 pb-4">
          <h1 style={{
            fontSize: '24px', fontWeight: 300, fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}>
            Корзина
          </h1>
        </div>
        <div className="px-5">
          {cart.length === 0 ? (
            <EmptyState
              type="cart"
              title="Корзина пуста"
              description="Добавьте ароматы из каталога, чтобы оформить заказ"
              actionLabel="Перейти в каталог"
              onAction={() => onTabChange?.('catalog')}
            />
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-4 p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                  data-testid={`cart-item-${item.id}`}
                >
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" loading="lazy" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>{item.name}</h3>
                    <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.color} · {item.size}</p>
                    <p className="text-base font-bold" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }} aria-label="Уменьшить" data-testid={`button-decrease-${item.id}`}><Minus className="w-3.5 h-3.5" /></button>
                      <span className="font-semibold min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }} aria-label="Увеличить" data-testid={`button-increase-${item.id}`}><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.size, item.color)} className="w-9 h-9 flex items-center justify-center self-start" aria-label="Удалить" data-testid={`button-remove-${item.id}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 px-5 py-4" style={{ background: 'linear-gradient(0deg, var(--theme-background) 70%, transparent 100%)' }}>
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontFamily: "'Satoshi','Inter',sans-serif", fontWeight: 600 }}>Итого:</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: "'Satoshi','Inter',sans-serif" }}>{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-4 rounded-[18px] font-bold transition-all active:scale-[0.98]"
                  style={{ background: '#C9B037', color: '#000', fontSize: '15px', fontFamily: "'Satoshi','Inter',sans-serif" }}
                  data-testid="button-checkout"
                >
                  Оформить заказ
                </button>
              </div>
            </div>
          )}
        </div>
        <CheckoutDrawer
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          items={cart.map(item => ({ id: Number(item.id), name: item.name, price: item.price, quantity: item.quantity, size: item.size, color: item.color, image: item.image }))}
          total={cartTotal}
          currency="₽"
          onOrderComplete={handleCheckout}
          storeName="FragranceRoyale"
        />
      </div>
    );
  }

  /* ─── PROFILE ─── */
  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <div className="px-5 pt-8 pb-6" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9B037 0%, #A8922A 100%)' }}>
              <User className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>Анна Смирнова</h2>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>+7 (999) 888-77-66</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Заказы', val: ordersCount }, { label: 'Избранное', val: favoritesCount }].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</p>
                <p className="text-2xl font-bold" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>{item.val}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pt-4 space-y-2">
          {[
            { icon: <Heart className="w-5 h-5" />, label: 'Избранное', testId: 'button-favorites' },
            { icon: <MapPin className="w-5 h-5" />, label: 'Адреса доставки', testId: 'button-addresses' },
            { icon: <Package className="w-5 h-5" />, label: 'Мои заказы', testId: 'button-orders' },
            { icon: <CreditCard className="w-5 h-5" />, label: 'Способы оплаты', testId: 'button-payment' },
            { icon: <Settings className="w-5 h-5" />, label: 'Настройки', testId: 'button-settings' },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}
              aria-label={item.label}
              data-testid={item.testId}
            >
              <div className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {item.icon}
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  {item.label}
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 rotate-180" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </button>
          ))}

          <button
            className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all active:scale-[0.98] mt-2"
            style={{ background: 'rgba(239,68,68,0.07)', border: '0.5px solid rgba(239,68,68,0.18)' }}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-400" style={{ fontFamily: "'Satoshi','Inter',sans-serif" }}>Выйти</span>
          </button>
        </div>
        <div className="h-4" />
      </div>
    );
  }

  return null;
}

function FragranceRoyaleWithTheme(props: FragranceRoyaleProps) {
  return (
    <DemoThemeProvider themeId="fragranceRoyale">
      <FragranceRoyale {...props} />
    </DemoThemeProvider>
  );
}

export default memo(FragranceRoyaleWithTheme);
