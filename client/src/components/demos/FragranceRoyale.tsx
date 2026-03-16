import React, { useState, useRef, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package,
  CreditCard, MapPin, Settings, LogOut, User, Sparkles, Search,
  Menu, Home, Grid, Tag, Plus, Minus, Flame, Wind, Leaf, Gem, Flower2
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
        {/* ── HERO IMAGE 70vh ── */}
        <div className="relative flex-shrink-0" style={{ height: '70vh', minHeight: '420px' }}>
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

          {/* Category + Stock pill at bottom of hero */}
          <div className="absolute bottom-6 left-6 flex items-center gap-2">
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
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em', fontFamily: "'Satoshi','Inter',sans-serif" }}>
                  Осталось {selectedPerfume.inStock} шт.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div
          className="flex-1 overflow-y-auto scrollbar-hide"
          onScroll={(e) => setShowStickyHeader(e.currentTarget.scrollTop > 60)}
        >
          {/* Content sheet */}
          <m.div
            className="relative"
            style={{ marginTop: '-28px', paddingBottom: '140px' }}
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

              {/* ── BLOCK 2: FRAGRANCE NOTES PYRAMID ── */}
              <m.div variants={contentItem}>
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
                    <div style={{
                      width: '58px', flexShrink: 0,
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                      fontFamily: "'Satoshi','Inter',sans-serif", textAlign: 'right',
                    }}>
                      Верхние
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${accentColor}18 0%, rgba(255,255,255,0.04) 100%)`,
                      border: `0.5px solid ${accentColor}30`,
                      display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
                    }}>
                      {selectedPerfume.topNotes.map((note) => (
                        <span key={note} style={{
                          fontSize: '11px', color: `${accentColor}E0`,
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontStyle: 'italic', fontWeight: 500,
                        }}>
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pyramid connector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '58px', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: '1px', height: '8px', background: `${accentColor}30` }} />
                    </div>
                  </div>

                  {/* Heart notes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '58px', flexShrink: 0,
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                      fontFamily: "'Satoshi','Inter',sans-serif", textAlign: 'right',
                    }}>
                      Сердце
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${accentColor}28 0%, rgba(255,255,255,0.05) 100%)`,
                      border: `0.5px solid ${accentColor}40`,
                      display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
                    }}>
                      {selectedPerfume.heartNotes.map((note) => (
                        <span key={note} style={{
                          fontSize: '11px', color: 'rgba(255,255,255,0.88)',
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontStyle: 'italic', fontWeight: 500,
                        }}>
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pyramid connector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '58px', flexShrink: 0 }} />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: '1px', height: '8px', background: `${accentColor}30` }} />
                    </div>
                  </div>

                  {/* Base notes */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '58px', flexShrink: 0,
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                      fontFamily: "'Satoshi','Inter',sans-serif", textAlign: 'right',
                    }}>
                      База
                    </div>
                    <div style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '0.5px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap',
                    }}>
                      {selectedPerfume.baseNotes.map((note) => (
                        <span key={note} style={{
                          fontSize: '11px', color: 'rgba(255,255,255,0.65)',
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontStyle: 'italic', fontWeight: 500,
                        }}>
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </m.div>

              {/* ── BLOCK 3: LONGEVITY & SILLAGE ── */}
              <m.div variants={contentItem}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Longevity */}
                  <div style={{
                    flex: 1, padding: '14px 16px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                  }}>
                    <p style={{
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em',
                      color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                      marginBottom: '8px', fontFamily: "'Satoshi','Inter',sans-serif",
                    }}>
                      Стойкость
                    </p>
                    <p style={{
                      fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em',
                      color: 'rgba(255,255,255,0.92)', fontFamily: "'Satoshi','Inter',sans-serif",
                      lineHeight: 1, marginBottom: '8px',
                    }}>
                      {selectedPerfume.longevity}
                    </p>
                    {/* Time bar */}
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[...Array(8)].map((_, i) => (
                        <div key={i} style={{
                          flex: 1, height: '3px', borderRadius: '2px',
                          background: i < Math.round(selectedPerfume.longevityHours / 2)
                            ? accentColor
                            : 'rgba(255,255,255,0.1)',
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Sillage */}
                  <div style={{
                    flex: 1, padding: '14px 16px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '0.5px solid rgba(255,255,255,0.08)',
                  }}>
                    <p style={{
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em',
                      color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase',
                      marginBottom: '8px', fontFamily: "'Satoshi','Inter',sans-serif",
                    }}>
                      Шлейф
                    </p>
                    <p style={{
                      fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em',
                      color: 'rgba(255,255,255,0.92)', fontFamily: "'Satoshi','Inter',sans-serif",
                      lineHeight: 1, marginBottom: '8px',
                    }}>
                      {sillageLabel[selectedPerfume.sillage]}
                    </p>
                    {/* Sillage dots */}
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[1, 2, 3].map((lvl) => (
                        <div key={lvl} style={{
                          width: '28px', height: '3px', borderRadius: '2px',
                          background: lvl <= sillageLevel[selectedPerfume.sillage]
                            ? accentColor
                            : 'rgba(255,255,255,0.1)',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </m.div>

              {/* ── BLOCK 4: OCCASIONS — когда носить ── */}
              <m.div variants={contentItem}>
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                  marginBottom: '12px', fontFamily: "'Satoshi','Inter',sans-serif",
                }}>
                  Когда носить
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedPerfume.occasions.map((occ) => (
                    <div
                      key={occ}
                      style={{
                        padding: '7px 14px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: 600,
                        color: 'rgba(255,255,255,0.7)',
                        background: 'rgba(255,255,255,0.07)',
                        border: '0.5px solid rgba(255,255,255,0.12)',
                        fontFamily: "'Satoshi','Inter',sans-serif",
                        letterSpacing: '0.02em',
                      }}
                    >
                      {occ}
                    </div>
                  ))}
                </div>
              </m.div>

              {/* ── BLOCK 5: CONCENTRATION selector ── */}
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
                          background: isSelected
                            ? `linear-gradient(135deg, ${color}90 0%, ${color}60 100%)`
                            : 'rgba(255,255,255,0.06)',
                          border: isSelected
                            ? `0.5px solid ${color}80`
                            : '0.5px solid rgba(255,255,255,0.1)',
                          boxShadow: isSelected
                            ? `0 4px 16px ${color}30`
                            : 'none',
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

              {/* ── BLOCK 6: VOLUME selector ── */}
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

              {/* ── BLOCK 7: PERFUMER'S NOTE — editorial description ── */}
              <m.div variants={contentItem}>
                <div style={{
                  padding: '18px 20px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${accentColor}08 0%, rgba(255,255,255,0.02) 100%)`,
                  border: `0.5px solid ${accentColor}20`,
                }}>
                  <p style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                    textTransform: 'uppercase', color: accentColor,
                    marginBottom: '12px', fontFamily: "'Satoshi','Inter',sans-serif",
                  }}>
                    Слово парфюмера
                  </p>
                  <p style={{
                    fontSize: '15px', lineHeight: 1.72,
                    color: 'rgba(255,255,255,0.72)',
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic', fontWeight: 400,
                    letterSpacing: '0.01em',
                  }}>
                    "{selectedPerfume.perfumerNote}"
                  </p>
                </div>
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
                    { icon: '🚚', label: 'Доставка', sub: 'Бесплатно' },
                    { icon: '↩', label: 'Возврат', sub: '30 дней' },
                    { icon: '✦', label: 'Оригинал', sub: 'Сертификат' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      flex: 1,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '14px 8px', gap: '5px',
                      borderRight: i < 2 ? '0.5px solid rgba(255,255,255,0.07)' : 'none',
                    }}>
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
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

        {/* Header */}
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
        </div>

        {/* Editorial hero — video */}
        <div className="relative mx-4 mt-2 rounded-[24px] overflow-hidden" style={{ height: '420px' }}>
          <video
            src="/videos/luxury_fragrance.mp4"
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.85) 100%)',
          }} />
          <div className="absolute bottom-0 left-0 right-0 p-7">
            <div className="flex items-center gap-2 mb-3">
              <div style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                color: '#C9B037', fontFamily: "'Satoshi','Inter',sans-serif",
                textTransform: 'uppercase',
              }}>
                SS'26 Exclusive
              </div>
            </div>
            <h2 style={{
              fontSize: '42px', fontWeight: 300, fontStyle: 'italic',
              lineHeight: 1.0, color: '#fff', letterSpacing: '0.01em',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              marginBottom: '14px',
            }}>
              Новая<br />Коллекция
            </h2>
            <button
              onClick={() => onTabChange?.('catalog')}
              className="active:scale-95 transition-all duration-200"
              style={{
                padding: '12px 24px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em',
                color: '#000', background: '#C9B037',
                fontFamily: "'Satoshi','Inter',sans-serif",
                textTransform: 'uppercase',
              }}
              data-testid="button-hero-shop-now"
            >
              Смотреть
            </button>
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

        {/* Gender filters */}
        <div className="mt-5 px-5 flex gap-5">
          {genderFilters.map((gender) => (
            <button
              key={gender}
              onClick={() => setSelectedGender(gender)}
              className="text-sm font-medium transition-colors min-h-[44px]"
              style={{
                color: selectedGender === gender ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                fontFamily: "'Satoshi','Inter',sans-serif",
                fontWeight: selectedGender === gender ? 700 : 500,
                letterSpacing: '0.05em',
                borderBottom: selectedGender === gender ? '1px solid rgba(255,255,255,0.5)' : '1px solid transparent',
              }}
              aria-pressed={selectedGender === gender}
              data-testid={`button-filter-${gender.toLowerCase()}`}
            >
              {gender === 'All' ? 'Все' : gender === 'Woman' ? 'Женские' : gender === 'Men' ? 'Мужские' : 'Унисекс'}
            </button>
          ))}
        </div>

        {/* Just Arrived section */}
        <div className="mt-8 px-5">
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
            {perfumes.filter(p => p.isNew).map((perfume) => (
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
            {perfumes.filter(p => p.isTrending).map((perfume) => (
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
      selectedCategory === 'Все' || p.category === selectedCategory
    );
    return (
      <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <h1 style={{
            fontSize: '24px', fontWeight: 300, fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: 'rgba(255,255,255,0.92)',
          }}>
            Каталог
          </h1>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center" aria-label="Поиск" data-testid="button-view-search">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center" aria-label="Фильтры" data-testid="button-view-filter">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 px-5 mb-5 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="flex-shrink-0 active:scale-95 transition-all duration-200"
              style={{
                padding: '8px 16px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em',
                fontFamily: "'Satoshi','Inter',sans-serif",
                color: selectedCategory === cat ? '#000' : 'rgba(255,255,255,0.6)',
                background: selectedCategory === cat ? '#C9B037' : 'rgba(255,255,255,0.07)',
                border: selectedCategory === cat ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
              }}
              aria-pressed={selectedCategory === cat}
              data-testid={`button-filter-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 px-4">
          {filtered.map((perfume, index) => (
            <m.div
              key={perfume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openPerfume(perfume)}
              className="cursor-pointer"
              data-testid={`perfume-card-${perfume.id}`}
            >
              <div style={{ position: 'relative', height: '220px', borderRadius: '18px', overflow: 'hidden', marginBottom: '10px', background: 'rgba(255,255,255,0.05)' }}>
                <LazyImage src={perfume.image} alt={perfume.name} className="w-full h-full object-cover" />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />

                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(perfume.id); }}
                  className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
                  data-testid={`button-favorite-${perfume.id}`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(String(perfume.id)) ? 'fill-white text-white' : 'text-white'}`} />
                </button>

                {perfume.isNew && (
                  <div style={{
                    position: 'absolute', top: '10px', left: '10px',
                    padding: '3px 8px', borderRadius: '7px',
                    fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                    background: '#C9B037', color: '#000',
                    fontFamily: "'Satoshi','Inter',sans-serif",
                  }}>
                    NEW
                  </div>
                )}

                <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 8px', borderRadius: '8px', marginBottom: '4px',
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                  }}>
                    <span style={{
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.15em',
                      color: categoryConfig[perfume.category]?.color ?? '#fff',
                      textTransform: 'uppercase', fontFamily: "'Satoshi','Inter',sans-serif",
                    }}>
                      {perfume.category}
                    </span>
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em',
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                fontFamily: "'Satoshi','Inter',sans-serif", marginBottom: '3px',
              }}>
                {perfume.brand}
              </p>
              <p style={{
                fontSize: '15px', fontWeight: 300, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.9)', lineHeight: 1.2, marginBottom: '5px',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                {perfume.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <p style={{
                  fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.82)',
                  fontFamily: "'Satoshi','Inter',sans-serif",
                }}>
                  {formatPrice(perfume.price)}
                </p>
                {perfume.oldPrice && (
                  <p style={{
                    fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                    textDecoration: 'line-through', fontFamily: "'Satoshi','Inter',sans-serif",
                  }}>
                    {formatPrice(perfume.oldPrice)}
                  </p>
                )}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    );
  }

  /* ─── CART ─── */
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white pb-32 smooth-scroll-page">
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

              <div className="fixed bottom-24 left-0 right-0 px-5 py-4" style={{ background: 'linear-gradient(0deg, #0A0A0A 70%, transparent 100%)' }}>
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
      <div className="min-h-screen bg-[#0A0A0A] text-white pb-24 smooth-scroll-page">
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
