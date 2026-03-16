import React, { useState, useRef, memo } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package,
  CreditCard, MapPin, Settings, LogOut, User, Sparkles, Search,
  Menu, Home, Grid, Tag, Plus, Minus, Flower2, Leaf, Clock, Truck,
  RotateCcw, ShieldCheck, Eye, Droplets, Sun, Snowflake, TreePine
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

const flowerVideo = "/attached_assets/5d2ab0bb92c8c7530a889b407ef3d457_1765617456150.mp4";
const STORE_KEY = 'floralart-store';
const ACCENT = '#D4789C';
const BG = '#FDF8F5';
const TEXT = '#1A1A1A';
const MUTED = '#6B5C52';
const CARD = '#FFFFFF';

interface FloristProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

type SeasonType = 'spring' | 'summer' | 'autumn' | 'year-round';

interface FlowerProduct {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
  floristNote: string;
  category: string;
  categoryBg: string;
  occasion: string[];
  sizes: string[];
  sizePrices: Record<string, number>;
  colors: string[];
  colorHex: string[];
  freshnessDays: number;
  freshness: string;
  rating: number;
  inStock: number;
  season: SeasonType;
  vaseLife: string;
  careInstructions: string;
  flowerOrigin: string;
  composition: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

const flowers: FlowerProduct[] = [
  {
    id: 1,
    name: 'Букет из красных роз',
    price: 4500,
    oldPrice: 5500,
    image: '/attached_assets/red_roses_bouquet.jpg',
    description: 'Роскошная симфония из 15 эквадорских роз сорта Freedom с бархатными лепестками глубокого рубинового оттенка. Каждый бутон отобран вручную на плантациях высокогорья Эквадора.',
    floristNote: 'Этот букет — моё признание в любви к совершенству. Каждая роза Freedom проходит тройной отбор на высокогорных плантациях, где чистейший воздух на высоте 2800м наполняет лепестки особой силой. Аромат — ноты спелой малины и сандалового дерева.',
    category: 'Розы',
    categoryBg: '#FDF5F3',
    occasion: ['Признание в любви', 'Юбилей', 'Предложение'],
    sizes: ['Маленький', 'Средний', 'Большой'],
    sizePrices: { 'Маленький': 4500, 'Средний': 6800, 'Большой': 9500 },
    colors: ['Красный', 'Бордо'],
    colorHex: ['#DC2626', '#7C2D12'],
    freshnessDays: 7,
    freshness: '7 дней',
    rating: 4.9,
    inStock: 12,
    season: 'year-round',
    vaseLife: '10–14 дней',
    careInstructions: 'Подрезать стебли под углом 45°, менять воду каждые 2 дня, добавлять подкормку',
    flowerOrigin: 'Высокогорные плантации Эквадора',
    composition: ['Розы Freedom 15 шт.', 'Эвкалипт', 'Рускус', 'Атласная лента'],
    isNew: true,
    isTrending: true,
  },
  {
    id: 2,
    name: 'Белые пионы',
    price: 3800,
    oldPrice: 4800,
    image: '/attached_assets/white_peonies.jpg',
    description: 'Облако нежнейших белоснежных пионов сорта Duchess de Nemours с роскошными многослойными лепестками цвета первого снега.',
    floristNote: 'Пионы — это поэзия природы. Duchess de Nemours раскрывается словно балерина на сцене, обнажая шелковистую текстуру каждого лепестка. Пьянящий аромат жасмина и едва уловимой сладости мёда заполняет всё пространство.',
    category: 'Пионы',
    categoryBg: '#FFF5F7',
    occasion: ['Свадьба', 'Помолвка', 'Рождение'],
    sizes: ['Маленький', 'Средний', 'Большой'],
    sizePrices: { 'Маленький': 3800, 'Средний': 5600, 'Большой': 8200 },
    colors: ['Белый', 'Кремовый'],
    colorHex: ['#FAFAFA', '#FEF3C7'],
    freshnessDays: 5,
    freshness: '5 дней',
    rating: 4.8,
    inStock: 8,
    season: 'spring',
    vaseLife: '5–7 дней',
    careInstructions: 'Держать вдали от солнца, менять воду ежедневно, подрезать стебли каждые 2 дня',
    flowerOrigin: 'Частные сады Голландии',
    composition: ['Пионы Duchess de Nemours 9 шт.', 'Питтоспорум', 'Берграсс'],
    isNew: true,
    isTrending: true,
  },
  {
    id: 3,
    name: 'Микс из тюльпанов',
    price: 3200,
    image: '/attached_assets/tulips_mix.jpg',
    description: 'Радужная палитра голландских тюльпанов премиум класса — настоящий праздник весны в каждом лепестке.',
    floristNote: 'Тюльпаны — вестники весны. Я подбираю каждый бутон по оттенку, создавая плавный переход от розового заката через золото к небесной лазури. Это не просто букет — это палитра художника.',
    category: 'Тюльпаны',
    categoryBg: '#FFF8F0',
    occasion: ['8 Марта', 'Весенний праздник', 'Поздравление'],
    sizes: ['Маленький', 'Средний', 'Большой'],
    sizePrices: { 'Маленький': 3200, 'Средний': 4800, 'Большой': 7200 },
    colors: ['Микс', 'Розовый', 'Жёлтый'],
    colorHex: ['#EC4899', '#F472B6', '#FACC15'],
    freshnessDays: 4,
    freshness: '4 дня',
    rating: 4.7,
    inStock: 15,
    season: 'spring',
    vaseLife: '5–7 дней',
    careInstructions: 'Холодная вода, капля лимонного сока, держать вдали от фруктов',
    flowerOrigin: 'Королевские поля Голландии, Лиссе',
    composition: ['Тюльпаны 25 шт.', 'Зелень сезонная'],
    isTrending: true,
  },
  {
    id: 4,
    name: 'Орхидея фаленопсис',
    price: 5500,
    image: '/attached_assets/orchid_pot.jpg',
    description: 'Величественная орхидея с каскадом изысканных цветков, напоминающих крылья экзотических бабочек.',
    floristNote: 'Фаленопсис — королева тропиков. Её восковые лепестки с перламутровым отливом хранят тайны лесов Юго-Восточной Азии. Тонкий аромат ванили создаёт атмосферу утончённой роскоши.',
    category: 'Горшечные',
    categoryBg: '#F5F0FF',
    occasion: ['Новоселье', 'День рождения', 'Благодарность'],
    sizes: ['Маленький', 'Средний'],
    sizePrices: { 'Маленький': 5500, 'Средний': 8500 },
    colors: ['Белый', 'Фиолетовый', 'Розовый'],
    colorHex: ['#FAFAFA', '#A855F7', '#F9A8D4'],
    freshnessDays: 30,
    freshness: '30 дней',
    rating: 4.8,
    inStock: 6,
    season: 'year-round',
    vaseLife: 'До 3 месяцев цветения',
    careInstructions: 'Поливать раз в неделю методом погружения, опрыскивать листья',
    flowerOrigin: 'Тепличные хозяйства Тайваня',
    composition: ['Фаленопсис 2 ветки', 'Декоративный горшок', 'Кора орхидейная'],
    isNew: true,
  },
  {
    id: 5,
    name: 'Букет невесты',
    price: 8500,
    image: '/attached_assets/wedding_bouquet.jpg',
    description: 'Изысканная свадебная композиция из белоснежных роз David Austin с атласными лепестками и эустомы оттенка шампанского.',
    floristNote: 'Свадебный букет — это не просто цветы, это символ начала новой жизни. Каждый элемент подобран с ювелирной точностью. Розы David Austin с их многослойными лепестками символизируют глубину чувств, а воздушная гипсофила — чистоту намерений.',
    category: 'Свадебные',
    categoryBg: '#FFFEF5',
    occasion: ['Свадьба', 'Венчание', 'Помолвка'],
    sizes: ['Стандарт', 'Премиум'],
    sizePrices: { 'Стандарт': 8500, 'Премиум': 14500 },
    colors: ['Белый', 'Шампань'],
    colorHex: ['#FFFFFF', '#FEF3C7'],
    freshnessDays: 8,
    freshness: '8 дней',
    rating: 4.9,
    inStock: 4,
    season: 'year-round',
    vaseLife: '8–12 дней',
    careInstructions: 'Беречь от жары, обновлять срез каждый день, держать в растворе',
    flowerOrigin: 'Розарии Девона, Англия',
    composition: ['Розы David Austin 11 шт.', 'Эустома', 'Гипсофила', 'Фрезия', 'Атласная лента'],
    isTrending: true,
  },
  {
    id: 6,
    name: 'Хризантемы осенние',
    price: 2800,
    image: '/attached_assets/chrysanthemum.jpg',
    description: 'Пышные кустовые хризантемы в палитре золотой осени — от медового янтаря до глубокого бордо.',
    floristNote: 'Хризантемы — это живопись осени. Каждый цветок с сотнями миниатюрных лепестков создаёт объёмную текстуру невероятной красоты. Терпкий аромат полыни и мёда — запах тёплых осенних вечеров.',
    category: 'Хризантемы',
    categoryBg: '#FFF8F0',
    occasion: ['День учителя', 'Осенний праздник', 'Благодарность'],
    sizes: ['Маленький', 'Средний', 'Большой'],
    sizePrices: { 'Маленький': 2800, 'Средний': 4200, 'Большой': 6000 },
    colors: ['Жёлтый', 'Оранжевый', 'Бордо'],
    colorHex: ['#FACC15', '#F97316', '#9F1239'],
    freshnessDays: 10,
    freshness: '10 дней',
    rating: 4.5,
    inStock: 20,
    season: 'autumn',
    vaseLife: '14–21 день',
    careInstructions: 'Удалять нижние листья, менять воду каждые 3 дня, добавлять аспирин',
    flowerOrigin: 'Фермерские хозяйства Краснодара',
    composition: ['Хризантемы кустовые 7 шт.', 'Аспидистра', 'Солидаго'],
  },
  {
    id: 7,
    name: 'Лилии Касабланка',
    price: 4200,
    image: '/attached_assets/white_lilies.jpg',
    description: 'Царственные восточные лилии с крупными бутонами цвета слоновой кости и головокружительным ароматом.',
    floristNote: 'Лилия Касабланка — это аристократизм во плоти. Её аромат — густой, с нотами гардении и жасмина — способен наполнить магией целую комнату. Бархатистые лепестки с капельками нектара притягивают взгляд неодолимо.',
    category: 'Лилии',
    categoryBg: '#F5FFF5',
    occasion: ['Траурная церемония', 'Память', 'Духовный праздник'],
    sizes: ['Маленький', 'Средний', 'Большой'],
    sizePrices: { 'Маленький': 4200, 'Средний': 6300, 'Большой': 9000 },
    colors: ['Белый', 'Кремовый'],
    colorHex: ['#FAFAFA', '#FFFBEB'],
    freshnessDays: 6,
    freshness: '6 дней',
    rating: 4.6,
    inStock: 10,
    season: 'summer',
    vaseLife: '7–10 дней',
    careInstructions: 'Удалять пыльники, менять воду часто, подрезать стебли',
    flowerOrigin: 'Лилейные поля Нидерландов',
    composition: ['Лилии Касабланка 5 шт.', 'Салал', 'Берграсс', 'Декоративная зелень'],
  },
  {
    id: 8,
    name: 'Полевые цветы',
    price: 2500,
    image: '/attached_assets/wildflowers.jpg',
    description: 'Романтичная россыпь полевых цветов — ромашки, васильки и пушистые колоски злаков.',
    floristNote: 'Этот букет — дыхание июльского луга. Каждый стебелёк собран с любовью и хранит тепло настоящего солнца. Свежий аромат с медовыми нотами переносит в беззаботное детство.',
    category: 'Полевые',
    categoryBg: '#F0FFF4',
    occasion: ['Свидание', 'Признание', 'Просто так'],
    sizes: ['Маленький', 'Средний'],
    sizePrices: { 'Маленький': 2500, 'Средний': 3800 },
    colors: ['Микс', 'Синий'],
    colorHex: ['#86EFAC', '#3B82F6'],
    freshnessDays: 3,
    freshness: '3 дня',
    rating: 4.4,
    inStock: 25,
    season: 'summer',
    vaseLife: '3–5 дней',
    careInstructions: 'Прохладное место, менять воду ежедневно, подрезать под водой',
    flowerOrigin: 'Экологичные луга Подмосковья',
    composition: ['Ромашки', 'Васильки', 'Колоски', 'Лаванда', 'Полевая зелень'],
  },
  {
    id: 9,
    name: 'Гортензия синяя',
    price: 4800,
    oldPrice: 5800,
    image: '/attached_assets/blue_hydrangea.jpg',
    description: 'Волшебные соцветия гортензии в оттенках индиго и лазури — словно кусочек летнего неба в лепестках.',
    floristNote: 'Гортензия — это архитектура природы. Каждая шапка из сотен миниатюрных цветков создаёт невероятный объём. Оттенок зависит от кислотности почвы — настоящая алхимия!',
    category: 'Гортензии',
    categoryBg: '#F0F5FF',
    occasion: ['День рождения', 'Подарок маме', 'Восхищение'],
    sizes: ['Маленький', 'Средний', 'Большой'],
    sizePrices: { 'Маленький': 4800, 'Средний': 7200, 'Большой': 10500 },
    colors: ['Синий', 'Голубой', 'Фиолетовый'],
    colorHex: ['#3B82F6', '#60A5FA', '#8B5CF6'],
    freshnessDays: 8,
    freshness: '8 дней',
    rating: 4.7,
    inStock: 7,
    season: 'summer',
    vaseLife: '7–10 дней',
    careInstructions: 'Погружать соцветия в воду на 30 мин ежедневно, много воды',
    flowerOrigin: 'Садовые питомники Бретани, Франция',
    composition: ['Гортензия 3 шт.', 'Эвкалипт Бейби Блю', 'Лента из органзы'],
    isNew: true,
  },
  {
    id: 10,
    name: 'Подсолнухи',
    price: 3500,
    image: '/attached_assets/sunflowers.jpg',
    description: 'Солнечные гиганты с бархатистыми лепестками цвета спелого мёда.',
    floristNote: 'Подсолнухи — это маленькие солнца. Каждый цветок несёт тепло и радость в самый пасмурный день. Их ореховый аромат с нотами летнего поля создаёт атмосферу бесконечного лета.',
    category: 'Подсолнухи',
    categoryBg: '#FFFDF0',
    occasion: ['Настроение', 'Выздоровление', 'Новоселье'],
    sizes: ['Маленький', 'Средний', 'Большой'],
    sizePrices: { 'Маленький': 3500, 'Средний': 5200, 'Большой': 7800 },
    colors: ['Жёлтый', 'Оранжевый'],
    colorHex: ['#FACC15', '#FB923C'],
    freshnessDays: 5,
    freshness: '5 дней',
    rating: 4.6,
    inStock: 18,
    season: 'summer',
    vaseLife: '5–8 дней',
    careInstructions: 'Просторная ваза, много воды, подрезать толстые стебли ножом',
    flowerOrigin: 'Солнечные поля Краснодара',
    composition: ['Подсолнухи 7 шт.', 'Гиперикум', 'Рускус'],
  },
  {
    id: 11,
    name: 'Композиция в коробке',
    price: 6500,
    oldPrice: 7500,
    image: '/attached_assets/box_composition.jpg',
    description: 'Роскошная композиция в бархатистой шляпной коробке — розы пудры, эвкалипт и бруния.',
    floristNote: 'Шляпная коробка — это подарок, который не требует вазы. Каждый элемент уложен на флористическую губку с ювелирной точностью. Это не букет — это произведение искусства, готовое к вручению.',
    category: 'Композиции',
    categoryBg: '#FFF5F8',
    occasion: ['VIP подарок', 'Юбилей компании', 'Благодарность'],
    sizes: ['Средний', 'Большой'],
    sizePrices: { 'Средний': 6500, 'Большой': 11000 },
    colors: ['Пудра', 'Розовый'],
    colorHex: ['#FECDD3', '#F9A8D4'],
    freshnessDays: 7,
    freshness: '7 дней',
    rating: 4.8,
    inStock: 9,
    season: 'year-round',
    vaseLife: '7–10 дней без пересадки',
    careInstructions: 'Поливать губку каждые 2 дня, не допускать пересыхания',
    flowerOrigin: 'Авторская работа, материалы из Голландии',
    composition: ['Розы пудровые 15 шт.', 'Эвкалипт', 'Бруния', 'Хлопок', 'Бархатная коробка'],
    isNew: true,
    isTrending: true,
  },
  {
    id: 12,
    name: 'Эустома пастельная',
    price: 4000,
    image: '/attached_assets/eustoma.jpg',
    description: 'Нежнейшая эустома в переливах пастельных оттенков — от сливочного крема до лавандового тумана.',
    floristNote: 'Эустома — это аристократка мира цветов. Её многослойные лепестки с атласной текстурой напоминают юбку балерины. Каждый бутон раскрывается по-своему, даря новые оттенки каждый день.',
    category: 'Эустома',
    categoryBg: '#F8F0FF',
    occasion: ['Признание', 'День матери', 'Нежный сюрприз'],
    sizes: ['Маленький', 'Средний', 'Большой'],
    sizePrices: { 'Маленький': 4000, 'Средний': 6000, 'Большой': 8800 },
    colors: ['Лавандовый', 'Персиковый', 'Кремовый'],
    colorHex: ['#C4B5FD', '#FDBA74', '#FEF3C7'],
    freshnessDays: 6,
    freshness: '6 дней',
    rating: 4.5,
    inStock: 14,
    season: 'year-round',
    vaseLife: '10–14 дней',
    careInstructions: 'Подрезать стебли каждые 2 дня, чистая вода комнатной температуры',
    flowerOrigin: 'Японские сорта, выращенные в Нидерландах',
    composition: ['Эустома 11 шт.', 'Маттиола', 'Питтоспорум'],
  },
];

const categories = ['Все', 'Розы', 'Пионы', 'Тюльпаны', 'Горшечные', 'Свадебные', 'Хризантемы', 'Лилии', 'Полевые', 'Гортензии', 'Подсолнухи', 'Композиции', 'Эустома'];
const seasonFilters = ['All', 'spring', 'summer', 'autumn', 'year-round'] as const;

const seasonConfig: Record<SeasonType, { icon: React.ComponentType<{style?: React.CSSProperties; className?: string}>, label: string, color: string }> = {
  'spring': { icon: Flower2, label: 'Весна', color: '#EC4899' },
  'summer': { icon: Sun, label: 'Лето', color: '#F59E0B' },
  'autumn': { icon: Leaf, label: 'Осень', color: '#F97316' },
  'year-round': { icon: TreePine, label: 'Круглый год', color: '#10B981' },
};

const mockReviews = [
  { author: 'Екатерина М.', initials: 'ЕМ', rating: 5, date: '8 мар. 2026', text: 'Невероятной красоты букет! Цветы были свежайшие, простояли 12 дней. Доставка точно в срок, курьер очень аккуратный. Буду заказывать только здесь!', verified: true },
  { author: 'Дмитрий К.', initials: 'ДК', rating: 5, date: '1 мар. 2026', text: 'Заказывал на 8 марта — жена была в восторге. Букет выглядел даже лучше, чем на фото. Упаковка премиальная, запах потрясающий.', verified: true },
  { author: 'Анна В.', initials: 'АВ', rating: 4, date: '22 фев. 2026', text: 'Очень красивая композиция. Единственное — хотелось бы больше зелени в букете. Но качество цветов на высшем уровне, раскрылись на третий день полностью.', verified: true },
];

function Florist({ activeTab, onTabChange }: FloristProps) {
  const [selectedFlower, setSelectedFlower] = useState<FlowerProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedSeason, setSelectedSeason] = useState<string>('All');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productExiting, setProductExiting] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<'bouquet' | 'details' | 'reviews'>('bouquet');
  const [quickViewFlower, setQuickViewFlower] = useState<FlowerProduct | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showCatalogSearch, setShowCatalogSearch] = useState(false);
  const productScrollRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

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
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: ACCENT },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  const handleProductBack = () => {
    setProductExiting(true);
    setTimeout(() => {
      setProductExiting(false);
      setSelectedFlower(null);
    }, 340);
  };

  const productPageVariants = {
    initial: { opacity: 0, y: 28, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 40, scale: 0.975 },
  };

  const contentStagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.065, delayChildren: 0.2 } },
  };

  const contentItem = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as number[] } },
  };

  const handleToggleFavorite = (flowerId: number) => {
    toggleFavoriteHook(String(flowerId));
    const isNowFavorite = !isFavorite(String(flowerId));
    toast({ title: isNowFavorite ? 'Добавлено в избранное' : 'Удалено из избранного', duration: 1500 });
  };

  const openFlower = (flower: FlowerProduct) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedFlower(flower);
    setSelectedSize(flower.sizes[0]);
    setSelectedColor(flower.colors[0]);
    setActiveProductTab('bouquet');
    if (heroImageRef.current) heroImageRef.current.style.transform = '';
    if (productScrollRef.current) productScrollRef.current.scrollTop = 0;
  };

  const addToCart = () => {
    if (!selectedFlower) return;
    const cartPrice = selectedFlower.sizePrices?.[selectedSize] ?? selectedFlower.price;
    addToCartHook({
      id: String(selectedFlower.id),
      name: selectedFlower.name,
      price: cartPrice,
      image: selectedFlower.image,
      size: selectedSize,
      color: selectedColor,
    });
    toast({
      title: 'Добавлено в корзину',
      description: `${selectedFlower.name} · ${selectedColor} · ${selectedSize}`,
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
      { address: 'Москва', phone: '+7 (999) 123-45-67' }
    );
    clearCart();
    setIsCheckoutOpen(false);
    toast({ title: 'Заказ оформлен!', description: `Номер заказа: ${orderId}`, duration: 3000 });
  };

  if (activeTab === 'catalog' && selectedFlower) {
    const bgColor = selectedFlower.categoryBg;
    const seasonCfg = seasonConfig[selectedFlower.season];
    const SeasonIcon = seasonCfg?.icon;
    const displayPrice = selectedFlower.sizePrices?.[selectedSize] ?? selectedFlower.price;
    const discountPct = selectedFlower.oldPrice
      ? Math.round((1 - displayPrice / selectedFlower.oldPrice) * 100)
      : 0;

    return (
      <m.div
        className="h-screen overflow-hidden relative flex flex-col"
        style={{ backgroundColor: bgColor }}
        variants={productPageVariants}
        initial="initial"
        animate={productExiting ? 'exit' : 'animate'}
        transition={{
          duration: productExiting ? 0.32 : 0.35,
          ease: productExiting ? [0.32, 0, 0.67, 0] : [0.22, 1, 0.36, 1],
        }}
      >
        <AnimatePresence>
          {showStickyHeader && (
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 left-0 right-0 z-[100]"
              style={{ paddingTop: 'max(12px, env(safe-area-inset-top))', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px' }}
            >
              <div
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-[20px]"
                style={{
                  background: `linear-gradient(145deg, ${ACCENT}20 0%, rgba(255,255,255,0.92) 100%)`,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: `0.5px solid ${ACCENT}30`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)`,
                }}
              >
                <button onClick={handleProductBack} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform" style={{ background: 'rgba(0,0,0,0.05)' }} data-testid="button-sticky-back">
                  <ChevronLeft className="w-5 h-5" style={{ color: TEXT }} strokeWidth={2.5} />
                </button>
                <div className="flex-1 min-w-0 text-center">
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, fontFamily: "'Inter',sans-serif", marginBottom: '1px' }}>
                    {selectedFlower.category}
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 400, fontStyle: 'italic', color: TEXT, letterSpacing: '0.01em', fontFamily: "'Cormorant Garamond', Georgia, serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFlower.name}
                  </p>
                </div>
                <button onClick={() => onTabChange?.('cart')} className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform relative" style={{ background: 'rgba(0,0,0,0.05)' }} data-testid="button-sticky-cart">
                  <ShoppingBag className="w-5 h-5" style={{ color: TEXT }} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: ACCENT, color: '#fff' }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div
          ref={productScrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ paddingBottom: '180px' }}
          onScroll={(e) => {
            const st = e.currentTarget.scrollTop;
            setShowStickyHeader(st > 300);
            if (heroImageRef.current) {
              heroImageRef.current.style.transform = `translateY(${st * 0.32}px)`;
            }
          }}
        >
          <div className="relative" style={{ height: '70vh', minHeight: '420px' }}>
            <div className="absolute inset-0 overflow-hidden">
              <m.div
                ref={heroImageRef}
                className="w-full h-full"
                style={{ willChange: 'transform' }}
                initial={{ scale: 1.06, filter: 'brightness(0.85)' }}
                animate={productExiting
                  ? { scale: 1.04, filter: 'brightness(0.7)' }
                  : { scale: 1, filter: 'brightness(1)' }}
                transition={{ duration: productExiting ? 0.32 : 0.65, ease: [0.32, 0.72, 0, 1] }}
              >
                <LazyImage src={selectedFlower.image} alt={selectedFlower.name} className="w-full h-full object-cover" />
              </m.div>
            </div>

            <div className="absolute inset-0 pointer-events-none" style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 40%, ${bgColor}F0 100%)`,
            }} />

            <div className="absolute left-0 right-0 z-50 flex items-center justify-between px-4" style={{ top: 'calc(max(12px, env(safe-area-inset-top)) + 6px)' }}>
              <button onClick={handleProductBack} className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200" style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} data-testid="button-back">
                <ChevronLeft className="w-6 h-6" style={{ color: TEXT }} strokeWidth={2.5} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(selectedFlower.id); }} className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200" style={{ background: isFavorite(String(selectedFlower.id)) ? `linear-gradient(145deg, ${ACCENT}50 0%, ${ACCENT}25 100%)` : 'linear-gradient(145deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)', backdropFilter: 'blur(12px)', border: isFavorite(String(selectedFlower.id)) ? `0.5px solid ${ACCENT}60` : '0.5px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} data-testid={`button-favorite-${selectedFlower.id}`}>
                <Heart className="w-5 h-5" style={{ color: isFavorite(String(selectedFlower.id)) ? ACCENT : TEXT }} fill={isFavorite(String(selectedFlower.id)) ? ACCENT : 'none'} strokeWidth={2} />
              </button>
            </div>

            <div className="absolute bottom-6 left-6 flex items-center gap-2 flex-wrap">
              {selectedFlower.isNew && (
                <div className="flex items-center px-3 py-1.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 4px 12px ${ACCENT}55` }}>
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', color: '#fff', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>НОВИНКА · SS'26</span>
                </div>
              )}
              {SeasonIcon && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)', border: `0.5px solid ${seasonCfg.color}40` }}>
                  <SeasonIcon style={{ width: '12px', height: '12px', color: seasonCfg.color }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: seasonCfg.color, textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>{seasonCfg.label}</span>
                </div>
              )}
              {selectedFlower.inStock <= 8 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', border: '0.5px solid rgba(239,68,68,0.3)' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em', fontFamily: "'Inter',sans-serif" }}>Осталось {selectedFlower.inStock} шт.</span>
                </div>
              )}
            </div>
          </div>

          <m.div className="relative" style={{ marginTop: '-28px' }} variants={contentStagger} initial="hidden" animate={productExiting ? 'hidden' : 'visible'}>
            <div className="relative rounded-t-[28px]" style={{ padding: '28px 20px 24px', display: 'flex', flexDirection: 'column', gap: '22px', background: `linear-gradient(180deg, ${bgColor}EE 0%, ${BG} 110px, ${BG} 100%)`, borderTop: `0.5px solid ${ACCENT}25` }}>

              <m.div variants={contentItem}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em', textTransform: 'uppercase', color: ACCENT, fontFamily: "'Inter',sans-serif" }}>
                    {selectedFlower.category}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} style={{ width: '10px', height: '10px' }} fill={s <= Math.round(selectedFlower.rating) ? ACCENT : 'transparent'} stroke={s <= Math.round(selectedFlower.rating) ? ACCENT : '#D1D5DB'} />
                    ))}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: MUTED, marginLeft: '4px' }}>{selectedFlower.rating}</span>
                  </div>
                </div>
                <h2 style={{ fontSize: '34px', fontWeight: 400, fontStyle: 'italic', letterSpacing: '0.01em', lineHeight: 1.1, color: TEXT, marginBottom: '14px', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                  {selectedFlower.name}
                </h2>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <p style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter',sans-serif", color: TEXT, lineHeight: 1 }}>{formatPrice(displayPrice)}</p>
                  {selectedFlower.oldPrice && (
                    <p style={{ fontSize: '16px', color: '#9CA3AF', textDecoration: 'line-through', fontFamily: "'Inter',sans-serif" }}>{formatPrice(selectedFlower.oldPrice)}</p>
                  )}
                  {discountPct > 0 && (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full" style={{ background: `${ACCENT}15`, color: ACCENT, border: `0.5px solid ${ACCENT}40`, fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em', fontFamily: "'Inter',sans-serif" }}>
                      −{discountPct}%
                    </div>
                  )}
                </div>
              </m.div>

              <m.div variants={contentItem}>
                <p style={{ fontSize: '13px', lineHeight: 1.65, color: MUTED, fontFamily: "'Inter',sans-serif", fontWeight: 400, letterSpacing: '0.01em', borderLeft: `2px solid ${ACCENT}55`, paddingLeft: '12px' }}>
                  {selectedFlower.description}
                </p>
              </m.div>

              <m.div variants={contentItem}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '12px', fontFamily: "'Inter',sans-serif" }}>Оттенок</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {selectedFlower.colors.map((color, idx) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button key={color} onClick={() => setSelectedColor(color)} className="active:scale-95 transition-all duration-200 flex items-center gap-2" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter',sans-serif", color: isSelected ? TEXT : MUTED, background: isSelected ? `${ACCENT}15` : 'rgba(0,0,0,0.03)', border: isSelected ? `1px solid ${ACCENT}50` : '1px solid rgba(0,0,0,0.06)', boxShadow: isSelected ? `0 4px 12px ${ACCENT}15` : 'none' }} aria-pressed={isSelected} data-testid={`button-color-${color}`}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: selectedFlower.colorHex[idx], border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                        {color}
                      </button>
                    );
                  })}
                </div>
              </m.div>

              <m.div variants={contentItem}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '12px', fontFamily: "'Inter',sans-serif" }}>Размер</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedFlower.sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    const sizePrice = selectedFlower.sizePrices?.[size];
                    const isSmallest = size === selectedFlower.sizes[0];
                    const savingsVsSmallest = sizePrice && selectedFlower.sizePrices
                      ? (() => {
                          const basePerUnit = (selectedFlower.sizePrices[selectedFlower.sizes[0]] ?? selectedFlower.price);
                          const savePct = Math.round((1 - sizePrice / (basePerUnit * (selectedFlower.sizes.indexOf(size) + 1))) * 100);
                          return !isSmallest && savePct > 0 ? savePct : null;
                        })()
                      : null;
                    return (
                      <button key={size} onClick={() => setSelectedSize(size)} className="active:scale-[0.97] transition-all duration-200" style={{ flex: 1, padding: '12px 8px 11px', borderRadius: '14px', textAlign: 'center', position: 'relative', color: isSelected ? '#fff' : TEXT, background: isSelected ? ACCENT : CARD, border: isSelected ? `0.5px solid ${ACCENT}` : '0.5px solid rgba(0,0,0,0.08)', boxShadow: isSelected ? `0 6px 24px ${ACCENT}30` : '0 1px 3px rgba(0,0,0,0.04)' }} aria-pressed={isSelected} data-testid={`button-size-${size}`}>
                        {savingsVsSmallest && (
                          <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#10B981', color: '#fff', fontSize: '7px', fontWeight: 800, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: '6px', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>ВЫГОДНО</div>
                        )}
                        <p style={{ fontSize: '14px', fontWeight: 700, fontFamily: "'Inter',sans-serif", lineHeight: 1, marginBottom: '5px', color: isSelected ? '#fff' : TEXT }}>{size}</p>
                        {sizePrice && (
                          <p style={{ fontSize: '11px', fontWeight: 600, fontFamily: "'Inter',sans-serif", lineHeight: 1, color: isSelected ? 'rgba(255,255,255,0.8)' : ACCENT }}>{formatPrice(sizePrice)}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </m.div>

              <m.div variants={contentItem} style={{ borderBottom: `0.5px solid rgba(0,0,0,0.08)` }}>
                <div style={{ display: 'flex' }} role="tablist">
                  {[
                    { key: 'bouquet', label: 'Букет' },
                    { key: 'details', label: 'Детали' },
                    { key: 'reviews', label: `Отзывы (${mockReviews.length})` },
                  ].map((tab) => (
                    <button key={tab.key} onClick={() => setActiveProductTab(tab.key as typeof activeProductTab)} className="flex-1 transition-all duration-200" style={{ padding: '12px 4px 13px', fontSize: '11px', fontWeight: activeProductTab === tab.key ? 700 : 500, color: activeProductTab === tab.key ? TEXT : '#9CA3AF', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", borderBottom: activeProductTab === tab.key ? `1.5px solid ${ACCENT}` : '1.5px solid transparent', marginBottom: '-0.5px', background: 'transparent' }} role="tab" aria-selected={activeProductTab === tab.key} data-testid={`tab-${tab.key}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </m.div>

              <m.div variants={contentItem} style={{ minHeight: '260px' }}>
                <AnimatePresence mode="wait">
                  {activeProductTab === 'bouquet' && (
                    <m.div key="bouquet" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                        <div>
                          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '14px', fontFamily: "'Inter',sans-serif" }}>Состав букета</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {selectedFlower.composition.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: idx === 0 ? `${ACCENT}08` : 'rgba(0,0,0,0.02)', border: idx === 0 ? `0.5px solid ${ACCENT}20` : '0.5px solid rgba(0,0,0,0.05)' }}>
                                <Flower2 style={{ width: '14px', height: '14px', color: idx === 0 ? ACCENT : '#9CA3AF', flexShrink: 0 }} />
                                <span style={{ fontSize: '13px', color: idx === 0 ? TEXT : MUTED, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: idx === 0 ? 600 : 400 }}>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ flex: 1, padding: '14px 16px', borderRadius: '14px', background: CARD, border: '0.5px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Inter',sans-serif" }}>Свежесть</p>
                            <p style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT, fontFamily: "'Inter',sans-serif", lineHeight: 1, marginBottom: '8px' }}>{selectedFlower.vaseLife}</p>
                            <div style={{ display: 'flex', gap: '3px' }}>
                              {[...Array(7)].map((_, i) => (
                                <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < Math.min(selectedFlower.freshnessDays, 7) ? ACCENT : 'rgba(0,0,0,0.06)' }} />
                              ))}
                            </div>
                          </div>
                          <div style={{ flex: 1, padding: '14px 16px', borderRadius: '14px', background: CARD, border: '0.5px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', fontFamily: "'Inter',sans-serif" }}>Сезон</p>
                            <p style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT, fontFamily: "'Inter',sans-serif", lineHeight: 1, marginBottom: '8px' }}>{seasonCfg.label}</p>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              {['spring', 'summer', 'autumn', 'year-round'].map((s) => (
                                <div key={s} style={{ width: '20px', height: '3px', borderRadius: '2px', background: s === selectedFlower.season || selectedFlower.season === 'year-round' ? seasonCfg.color : 'rgba(0,0,0,0.06)' }} />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div>
                          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '12px', fontFamily: "'Inter',sans-serif" }}>Повод</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
                            {selectedFlower.occasion.map((occ) => (
                              <div key={occ} style={{ padding: '7px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: MUTED, background: 'rgba(0,0,0,0.03)', border: '0.5px solid rgba(0,0,0,0.06)', fontFamily: "'Inter',sans-serif", letterSpacing: '0.02em' }}>{occ}</div>
                            ))}
                          </div>
                        </div>

                        <div style={{ padding: '18px 20px', borderRadius: '16px', background: `${ACCENT}06`, border: `0.5px solid ${ACCENT}18` }}>
                          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: ACCENT, marginBottom: '12px', fontFamily: "'Inter',sans-serif" }}>Слово флориста</p>
                          <p style={{ fontSize: '15px', lineHeight: 1.72, color: MUTED, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.01em' }}>
                            "{selectedFlower.floristNote}"
                          </p>
                        </div>
                      </div>
                    </m.div>
                  )}

                  {activeProductTab === 'details' && (
                    <m.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                          { label: 'Категория', value: selectedFlower.category },
                          { label: 'Происхождение', value: selectedFlower.flowerOrigin },
                          { label: 'Сезон', value: seasonCfg.label },
                          { label: 'Свежесть в вазе', value: selectedFlower.vaseLife },
                          { label: 'Размеры', value: selectedFlower.sizes.join(', ') },
                          { label: 'Оттенки', value: selectedFlower.colors.join(', ') },
                          { label: 'В наличии', value: `${selectedFlower.inStock} шт.` },
                          { label: 'Рейтинг', value: '__stars__' },
                        ].map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: CARD, border: '0.5px solid rgba(0,0,0,0.05)' }}>
                            <span style={{ color: '#9CA3AF', fontSize: '12px', fontFamily: "'Inter',sans-serif" }}>{item.label}</span>
                            {item.value === '__stars__' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} style={{ width: '11px', height: '11px' }} fill={s <= Math.round(selectedFlower.rating) ? ACCENT : 'transparent'} stroke={s <= Math.round(selectedFlower.rating) ? ACCENT : '#D1D5DB'} />
                                  ))}
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: MUTED, fontFamily: "'Inter',sans-serif" }}>{selectedFlower.rating}</span>
                              </div>
                            ) : (
                              <span style={{ color: TEXT, fontSize: '12px', fontWeight: 600, fontFamily: "'Inter',sans-serif", textAlign: 'right', maxWidth: '55%' }}>{item.value}</span>
                            )}
                          </div>
                        ))}

                        <div style={{ marginTop: '8px', padding: '14px', borderRadius: '14px', background: `${ACCENT}06`, border: `0.5px solid ${ACCENT}18` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Leaf style={{ width: '14px', height: '14px', color: ACCENT }} />
                            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT, fontFamily: "'Inter',sans-serif" }}>Уход за букетом</p>
                          </div>
                          <p style={{ fontSize: '13px', lineHeight: 1.6, color: MUTED, fontFamily: "'Inter',sans-serif" }}>{selectedFlower.careInstructions}</p>
                        </div>
                      </div>
                    </m.div>
                  )}

                  {activeProductTab === 'reviews' && (
                    <m.div key="reviews" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex' }}>
                              {[1,2,3,4,5].map(s => (<Star key={s} className="w-4 h-4" fill={s <= Math.round(selectedFlower.rating) ? ACCENT : 'transparent'} stroke={s <= Math.round(selectedFlower.rating) ? ACCENT : '#D1D5DB'} />))}
                            </div>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: TEXT, fontFamily: "'Inter',sans-serif" }}>{selectedFlower.rating}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>{mockReviews.length} отзывов</span>
                        </div>
                        {mockReviews.map((review, idx) => (
                          <div key={idx} style={{ padding: '16px', borderRadius: '16px', background: CARD, border: '0.5px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${ACCENT}40 0%, ${ACCENT}20 100%)`, border: `0.5px solid ${ACCENT}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: ACCENT, fontFamily: "'Inter',sans-serif" }}>{review.initials}</span>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                  <p style={{ fontSize: '13px', fontWeight: 600, color: TEXT, fontFamily: "'Inter',sans-serif" }}>{review.author}</p>
                                  {review.verified && (<span style={{ fontSize: '9px', fontWeight: 700, color: '#10B981', letterSpacing: '0.1em', fontFamily: "'Inter',sans-serif" }}>✓ ПОДТВЕРЖДЁН</span>)}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={{ display: 'flex', gap: '1px' }}>{[1,2,3,4,5].map(s => (<Star key={s} style={{ width: '10px', height: '10px' }} fill={s <= review.rating ? ACCENT : 'transparent'} stroke={s <= review.rating ? ACCENT : '#D1D5DB'} />))}</div>
                                  <span style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>{review.date}</span>
                                </div>
                              </div>
                            </div>
                            <p style={{ fontSize: '14px', lineHeight: 1.65, color: MUTED, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>

              <m.div variants={contentItem}>
                <div style={{ display: 'flex', alignItems: 'stretch', borderRadius: '16px', background: CARD, border: '0.5px solid rgba(0,0,0,0.06)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  {[
                    { icon: <Truck style={{ width: '15px', height: '15px', color: ACCENT }} strokeWidth={1.5} />, label: 'Доставка', sub: 'Бесплатно' },
                    { icon: <RotateCcw style={{ width: '15px', height: '15px', color: ACCENT }} strokeWidth={1.5} />, label: 'Гарантия', sub: 'Свежесть' },
                    { icon: <ShieldCheck style={{ width: '15px', height: '15px', color: ACCENT }} strokeWidth={1.5} />, label: 'Фото', sub: 'До отправки' },
                  ].map((item, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', gap: '5px', borderRight: i < 2 ? '0.5px solid rgba(0,0,0,0.06)' : 'none' }}>
                      {item.icon}
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: TEXT, textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", lineHeight: 1 }}>{item.label}</p>
                      <p style={{ fontSize: '9px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
              </m.div>

              {(() => {
                const recommended = flowers.filter(p => p.id !== selectedFlower.id).sort((a, b) => { const sameCat = (a.category === selectedFlower.category ? 1 : 0) - (b.category === selectedFlower.category ? 1 : 0); return -sameCat; }).slice(0, 6);
                if (recommended.length === 0) return null;
                return (
                  <m.div variants={contentItem}>
                    <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', flex: 1 }} />
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: "'Inter',sans-serif", whiteSpace: 'nowrap' }}>Вам также понравится</p>
                      <div style={{ height: '1px', background: 'rgba(0,0,0,0.06)', flex: 1 }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }} className="scrollbar-hide">
                      {recommended.map((p) => (
                        <div key={p.id} onClick={() => { setSelectedFlower(p); setSelectedSize(p.sizes[0]); setSelectedColor(p.colors[0]); setActiveProductTab('bouquet'); setTimeout(() => productScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50); }} className="cursor-pointer active:scale-95 transition-all duration-200" style={{ width: '120px', flexShrink: 0 }} data-testid={`recommended-flower-${p.id}`}>
                          <div style={{ width: '120px', height: '140px', borderRadius: '14px', overflow: 'hidden', marginBottom: '8px', position: 'relative', background: 'rgba(0,0,0,0.03)' }}>
                            <LazyImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            {p.isNew && (<div style={{ position: 'absolute', top: '6px', left: '6px', padding: '2px 7px', borderRadius: '6px', fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em', background: ACCENT, color: '#fff', fontFamily: "'Inter',sans-serif" }}>NEW</div>)}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%)' }} />
                          </div>
                          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', color: '#9CA3AF', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: '3px' }}>{p.category}</p>
                          <p style={{ fontSize: '13px', fontWeight: 400, fontStyle: 'italic', color: TEXT, lineHeight: 1.25, fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{p.name}</p>
                          <p style={{ fontSize: '12px', fontWeight: 700, color: MUTED, fontFamily: "'Inter',sans-serif" }}>{formatPrice(p.price)}</p>
                        </div>
                      ))}
                    </div>
                  </m.div>
                );
              })()}
            </div>
          </m.div>
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60, padding: `16px 20px calc(16px + env(safe-area-inset-bottom, 0px))`, background: `linear-gradient(0deg, ${BG} 60%, transparent 100%)` }}>
          <ConfirmDrawer
            trigger={
              <button className="w-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-200" style={{ height: '56px', borderRadius: '18px', background: `linear-gradient(135deg, ${ACCENT} 0%, #C25882 100%)`, boxShadow: `0 8px 32px ${ACCENT}40`, border: 'none' }} data-testid="button-buy-now">
                <ShoppingBag style={{ width: '20px', height: '20px', color: '#fff' }} strokeWidth={2} />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em', fontFamily: "'Inter',sans-serif" }}>В корзину</span>
                <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.3)', margin: '0 4px' }} />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter',sans-serif" }}>{formatPrice(displayPrice)}</span>
              </button>
            }
            title="Добавить в корзину?"
            description={`${selectedFlower.name} · ${selectedColor} · ${selectedSize}`}
            confirmText="Добавить"
            cancelText="Отмена"
            variant="default"
            onConfirm={addToCart}
          />
        </div>
      </m.div>
    );
  }

  if (activeTab === 'home') {
    return (
      <div className="min-h-screen pb-24 smooth-scroll-page" style={{ background: BG }}>
        <DemoSidebar isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open} menuItems={sidebarMenuItems} title="FLORAL" subtitle="ART" accentColor={ACCENT} bgColor={BG} />

        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <button onClick={sidebar.open} className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }} aria-label="Меню" data-testid="button-menu">
              <Menu className="w-5 h-5" style={{ color: TEXT }} />
            </button>
            <div className="text-center">
              <div style={{ fontSize: '19px', fontWeight: 900, letterSpacing: '0.22em', lineHeight: 1, color: TEXT, fontFamily: "'Inter',sans-serif" }}>FLORAL</div>
              <div style={{ fontSize: '14px', fontWeight: 300, letterSpacing: '0.35em', fontStyle: 'italic', lineHeight: 1, color: ACCENT, fontFamily: "'Cormorant Garamond', Georgia, serif", marginTop: '2px' }}>art studio</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => onTabChange?.('cart')} className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ background: 'rgba(0,0,0,0.04)' }} data-testid="button-cart">
                <ShoppingBag className="w-5 h-5" style={{ color: TEXT }} />
                {cartCount > 0 && (<span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: ACCENT, color: '#fff' }}>{cartCount}</span>)}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 mb-3">
          <m.div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            {seasonFilters.map((s) => {
              const labels: Record<string, string> = { All: 'Все', spring: 'Весна', summer: 'Лето', autumn: 'Осень', 'year-round': 'Круглый год' };
              const active = selectedSeason === s;
              return (
                <button key={s} onClick={() => setSelectedSeason(s)} className="flex-shrink-0 px-3.5 py-1.5 rounded-full transition-all active:scale-95" style={{ fontSize: '11px', fontWeight: active ? 700 : 500, letterSpacing: '0.06em', fontFamily: "'Inter',sans-serif", background: active ? ACCENT : CARD, color: active ? '#fff' : MUTED, border: active ? 'none' : '0.5px solid rgba(0,0,0,0.06)', boxShadow: active ? `0 4px 12px ${ACCENT}30` : '0 1px 3px rgba(0,0,0,0.04)' }}>
                  {labels[s]}
                </button>
              );
            })}
          </m.div>
        </div>

        <div className="relative mx-4 mt-3 rounded-[26px] overflow-hidden" style={{ height: '410px' }}>
          <video src={flowerVideo} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" data-testid="video-hero-banner" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 32%, rgba(0,0,0,0.55) 68%, rgba(0,0,0,0.88) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, transparent 55%)' }} />

          <div className="absolute top-4 left-4">
            <span className="text-[9px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', color: 'rgba(255,255,255,0.8)', border: '0.5px solid rgba(255,255,255,0.2)' }}>ВЕСНА&apos;26</span>
          </div>
          <div className="absolute top-4 right-4 text-right">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>COLLECTION</p>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>SS&apos;26</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{ lineHeight: 0.9, marginBottom: '10px' }}>
                <div style={{ fontSize: '48px', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', display: 'block' }}>ВЕСЕННЯЯ</div>
                <div style={{ fontSize: '48px', fontWeight: 100, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", display: 'block' }}>коллекция</div>
              </div>
              <div className="flex items-center gap-4 mt-5">
                <button onClick={() => onTabChange?.('catalog')} className="px-5 py-2.5 rounded-full text-[13px] font-black text-white transition-all active:scale-95" style={{ background: ACCENT, letterSpacing: '-0.01em', fontFamily: "'Inter',sans-serif" }} data-testid="button-hero-shop-now">Смотреть →</button>
                <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter',sans-serif" }}>Свежие цветы каждый день</p>
              </div>
            </m.div>
          </div>
        </div>

        <div className="px-4 mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
            <div>
              <p className="text-[8px] font-semibold tracking-[0.35em] uppercase text-center mb-0.5" style={{ color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>Флорист рекомендует</p>
              <h2 className="leading-none text-center" style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '0.08em', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic', color: TEXT }}>Bouquet du Jour</h2>
            </div>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
          </div>

          {(() => {
            const featured = flowers.find(p => p.isTrending && p.isNew) ?? flowers[0];
            return (
              <m.div whileTap={{ scale: 0.985 }} onClick={() => openFlower(featured)} className="relative cursor-pointer rounded-[22px] overflow-hidden" style={{ height: '300px' }} data-testid={`featured-flower-${featured.id}`}>
                <img src={featured.image} alt={featured.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.8) 100%)' }} />
                <div className="absolute top-3.5 left-3.5">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(0,0,0,0.08)', color: ACCENT, fontFamily: "'Inter',sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>{featured.category}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }} className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(0,0,0,0.08)' }} data-testid={`button-favorite-featured-${featured.id}`}>
                  <Heart className={`w-4 h-4 ${isFavorite(String(featured.id)) ? 'fill-current' : ''}`} style={{ color: isFavorite(String(featured.id)) ? ACCENT : TEXT }} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter',sans-serif", marginBottom: '4px' }}>{featured.category}</p>
                      <p style={{ fontSize: '26px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: '#fff', fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{featured.name}</p>
                      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', fontFamily: "'Inter',sans-serif" }}>{featured.composition.slice(0, 2).join(' · ')}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Inter',sans-serif", letterSpacing: '-0.03em', color: '#fff' }}>{formatPrice(featured.price)}</p>
                      {featured.oldPrice && (<p style={{ fontSize: '12px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>{formatPrice(featured.oldPrice)}</p>)}
                    </div>
                  </div>
                </div>
              </m.div>
            );
          })()}
        </div>

        <div className="mt-10 px-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', color: '#9CA3AF', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: '4px' }}>Новинки</p>
              <h3 style={{ fontSize: '22px', fontWeight: 300, fontStyle: 'italic', color: TEXT, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Just Arrived</h3>
            </div>
            <button onClick={() => onTabChange?.('catalog')} style={{ fontSize: '11px', color: ACCENT, fontWeight: 600, letterSpacing: '0.05em', fontFamily: "'Inter',sans-serif" }}>Все →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {flowers.filter(p => p.isNew && (selectedSeason === 'All' || p.season === selectedSeason)).map((flower) => (
              <div key={flower.id} onClick={() => openFlower(flower)} className="cursor-pointer active:scale-[0.97] transition-all duration-200 flex-shrink-0" style={{ width: '148px' }} data-testid={`new-flower-${flower.id}`}>
                <div style={{ width: '148px', height: '168px', borderRadius: '16px', overflow: 'hidden', position: 'relative', marginBottom: '10px', background: 'rgba(0,0,0,0.03)' }}>
                  <LazyImage src={flower.image} alt={flower.name} className="w-full h-full object-cover" />
                  <div style={{ position: 'absolute', top: '8px', left: '8px', padding: '3px 8px', borderRadius: '7px', fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em', background: ACCENT, color: '#fff', fontFamily: "'Inter',sans-serif" }}>NEW</div>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(flower.id); }} className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }} data-testid={`button-favorite-${flower.id}`}>
                    <Heart className={`w-4 h-4 ${isFavorite(String(flower.id)) ? 'fill-current' : ''}`} style={{ color: isFavorite(String(flower.id)) ? ACCENT : MUTED }} />
                  </button>
                </div>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', color: '#9CA3AF', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: '3px' }}>{flower.category}</p>
                <p style={{ fontSize: '14px', fontWeight: 400, fontStyle: 'italic', color: TEXT, lineHeight: 1.2, fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '5px' }}>{flower.name}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT, fontFamily: "'Inter',sans-serif" }}>{formatPrice(flower.price)}</p>
                  <div style={{ display: 'flex', gap: '1px' }}>
                    {[1,2,3,4,5].map(s => (<div key={s} style={{ width: '5px', height: '5px', borderRadius: '50%', background: s <= Math.round(flower.rating) ? ACCENT : 'rgba(0,0,0,0.08)' }} />))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 px-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', color: '#9CA3AF', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: '4px' }}>Хиты продаж</p>
              <h3 style={{ fontSize: '22px', fontWeight: 300, fontStyle: 'italic', color: TEXT, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Bestsellers</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {flowers.filter(p => p.isTrending && (selectedSeason === 'All' || p.season === selectedSeason)).map((flower) => (
              <div key={flower.id} onClick={() => openFlower(flower)} className="cursor-pointer active:scale-[0.97] transition-all duration-200" data-testid={`trending-flower-${flower.id}`}>
                <div style={{ height: '200px', borderRadius: '16px', overflow: 'hidden', position: 'relative', marginBottom: '10px', background: 'rgba(0,0,0,0.03)' }}>
                  <LazyImage src={flower.image} alt={flower.name} className="w-full h-full object-cover" />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', right: '10px' }}>
                    <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif", marginBottom: '2px' }}>{flower.category}</p>
                    <p style={{ fontSize: '15px', fontWeight: 300, fontStyle: 'italic', color: '#fff', lineHeight: 1.15, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{flower.name}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(flower.id); }} className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)' }} data-testid={`button-favorite-${flower.id}`}>
                    <Heart className={`w-4 h-4 ${isFavorite(String(flower.id)) ? 'fill-current' : ''}`} style={{ color: isFavorite(String(flower.id)) ? ACCENT : MUTED }} />
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', color: TEXT, fontFamily: "'Inter',sans-serif" }}>{formatPrice(flower.price)}</p>
                  {flower.oldPrice && (<p style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through', fontFamily: "'Inter',sans-serif" }}>{formatPrice(flower.oldPrice)}</p>)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', gap: '1.5px' }}>{[1,2,3,4,5].map(s => (<Star key={s} style={{ width: '9px', height: '9px' }} fill={s <= Math.round(flower.rating) ? ACCENT : 'transparent'} stroke={s <= Math.round(flower.rating) ? ACCENT : '#D1D5DB'} />))}</div>
                  <span style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{flower.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="h-8" />
      </div>
    );
  }

  if (activeTab === 'catalog') {
    const catalogQ = catalogSearch.trim().toLowerCase();
    const filtered = flowers.filter(p =>
      (selectedCategory === 'Все' || p.category === selectedCategory) &&
      (selectedSeason === 'All' || p.season === selectedSeason) &&
      (catalogQ === '' || p.name.toLowerCase().includes(catalogQ) || p.category.toLowerCase().includes(catalogQ))
    );
    return (
      <div className="min-h-screen pb-24 smooth-scroll-page" style={{ background: BG, color: TEXT }}>
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5" style={{ color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>FLORAL ART</p>
              <h1 className="leading-none" style={{ fontSize: '30px', fontWeight: 300, letterSpacing: '0.06em', fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: 'italic' }}>Каталог</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowCatalogSearch(s => !s); if (showCatalogSearch) setCatalogSearch(''); }} className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95" style={{ background: showCatalogSearch ? ACCENT : 'rgba(0,0,0,0.04)', border: showCatalogSearch ? 'none' : '0.5px solid rgba(0,0,0,0.06)' }} aria-label="Поиск" data-testid="button-view-search">
                <Search className="w-4 h-4" style={{ color: showCatalogSearch ? '#fff' : MUTED }} />
              </button>
              <button onClick={() => setSelectedSeason(g => g === 'All' ? 'spring' : g === 'spring' ? 'summer' : g === 'summer' ? 'autumn' : g === 'autumn' ? 'year-round' : 'All')} className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95" style={{ background: selectedSeason !== 'All' ? ACCENT : 'rgba(0,0,0,0.04)', border: selectedSeason !== 'All' ? 'none' : '0.5px solid rgba(0,0,0,0.06)' }} aria-label="Фильтры" data-testid="button-view-filter">
                <Filter className="w-4 h-4" style={{ color: selectedSeason !== 'All' ? '#fff' : MUTED }} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showCatalogSearch && (
              <m.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 44, marginBottom: 12 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                  <input autoFocus value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)} placeholder="Поиск по названию…" className="w-full h-11 rounded-2xl pl-10 pr-4 text-[13px] outline-none" style={{ background: CARD, border: '0.5px solid rgba(0,0,0,0.08)', color: TEXT, fontFamily: "'Inter',sans-serif", boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} />
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.slice(0, 8).map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className="flex-shrink-0 px-3.5 py-1.5 rounded-full transition-all active:scale-95" style={{ fontSize: '11px', fontWeight: active ? 700 : 500, letterSpacing: '0.04em', fontFamily: "'Inter',sans-serif", background: active ? ACCENT : CARD, color: active ? '#fff' : MUTED, border: active ? 'none' : '0.5px solid rgba(0,0,0,0.06)', boxShadow: active ? `0 4px 12px ${ACCENT}30` : '0 1px 3px rgba(0,0,0,0.04)' }} data-testid={`button-cat-${cat}`}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 pt-3" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(() => {
            const rows: React.ReactNode[] = [];
            let i = 0;
            let groupIdx = 0;
            while (i < filtered.length) {
              const featured = filtered[i];
              const discountFeatured = featured.oldPrice ? Math.round((1 - featured.price / featured.oldPrice) * 100) : 0;
              rows.push(
                <m.div key={`featured-${featured.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIdx * 0.1 }} whileTap={{ scale: 0.985 }} onClick={() => openFlower(featured)} className="relative cursor-pointer rounded-[20px] overflow-hidden" style={{ height: '280px' }} data-testid={`flower-card-${featured.id}`}>
                  <LazyImage src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                    {featured.isNew && (<span className="px-2 py-1 text-[9px] font-black rounded-full tracking-[0.08em] uppercase text-white" style={{ background: ACCENT }}>NEW</span>)}
                    <span className="px-2 py-1 text-[9px] font-medium rounded-full" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)', color: ACCENT, border: '0.5px solid rgba(0,0,0,0.06)', fontFamily: "'Inter',sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>{featured.category}</span>
                  </div>
                  <div className="absolute top-3.5 right-3.5 flex gap-1.5">
                    <button onClick={(e) => { e.stopPropagation(); setQuickViewFlower(featured); }} aria-label="Быстрый просмотр" className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(0,0,0,0.08)' }} data-testid={`button-quickview-${featured.id}`}>
                      <Eye className="w-3.5 h-3.5" style={{ color: TEXT }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }} aria-label="Избранное" className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(0,0,0,0.08)' }} data-testid={`button-favorite-catalog-${featured.id}`}>
                      <Heart className={`w-3.5 h-3.5 ${isFavorite(String(featured.id)) ? 'fill-current' : ''}`} style={{ color: isFavorite(String(featured.id)) ? ACCENT : TEXT }} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end justify-between">
                      <div className="flex-1 mr-3">
                        <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Inter',sans-serif" }}>{featured.category}</p>
                        <p style={{ fontSize: '18px', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.02em', fontFamily: "'Cormorant Garamond', Georgia, serif", lineHeight: 1.15, color: '#fff' }}>{featured.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base font-bold text-white" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', fontFamily: "'Inter',sans-serif" }}>{formatPrice(featured.price)}</p>
                        {featured.oldPrice && (<p className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter',sans-serif" }}>{formatPrice(featured.oldPrice)}</p>)}
                        {discountFeatured > 0 && (<span className="inline-block text-[9px] font-black text-white mt-1 px-1.5 py-0.5 rounded-md" style={{ background: ACCENT, fontFamily: "'Inter',sans-serif" }}>−{discountFeatured}%</span>)}
                      </div>
                    </div>
                  </div>
                </m.div>
              );
              i++;
              const pair = filtered.slice(i, i + 2);
              if (pair.length > 0) {
                rows.push(
                  <div key={`pair-${groupIdx}`} className="grid grid-cols-2 gap-3">
                    {pair.map((product, colIdx) => (
                      <m.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIdx * 0.1 + 0.04 + colIdx * 0.03 }} whileTap={{ scale: 0.97 }} onClick={() => openFlower(product)} className="cursor-pointer" data-testid={`flower-card-${product.id}`}>
                        <div className="relative rounded-[18px] overflow-hidden mb-2.5" style={{ height: colIdx === 0 ? '210px' : '178px' }}>
                          <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                            <button onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }} aria-label="Избранное" className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all" style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(0,0,0,0.06)' }} data-testid={`button-favorite-catalog-${product.id}`}>
                              <Heart className={`w-3 h-3 ${isFavorite(String(product.id)) ? 'fill-current' : ''}`} style={{ color: isFavorite(String(product.id)) ? ACCENT : TEXT }} />
                            </button>
                          </div>
                          {product.oldPrice && (
                            <div className="absolute top-2 left-2">
                              <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md text-white" style={{ background: ACCENT, fontFamily: "'Inter',sans-serif" }}>−{Math.round((1 - product.price / product.oldPrice) * 100)}%</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[8px] font-semibold tracking-[0.22em] uppercase mb-0.5 truncate" style={{ color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>{product.category}</p>
                          <p style={{ fontSize: '13px', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.2, marginBottom: '4px', fontFamily: "'Cormorant Garamond', Georgia, serif", color: TEXT, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>{product.name}</p>
                          <div className="flex items-baseline gap-1.5 mb-1">
                            <span className="text-[13px] font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', fontFamily: "'Inter',sans-serif" }}>{formatPrice(product.price)}</span>
                            {product.oldPrice && (<span className="text-[10px] line-through" style={{ color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>{formatPrice(product.oldPrice)}</span>)}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(star => (<div key={star} className="w-1.5 h-1.5 rounded-full" style={{ background: star <= Math.round(product.rating) ? ACCENT : 'rgba(0,0,0,0.08)' }} />))}
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

        {filtered.length === 0 && (
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: `${ACCENT}12`, border: `0.5px solid ${ACCENT}25` }}>
              <Search className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <p style={{ fontSize: '20px', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: '8px', color: TEXT }}>Ничего не найдено</p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif", lineHeight: 1.6, marginBottom: '20px' }}>
              {catalogSearch ? `По запросу «${catalogSearch}» букетов не найдено` : 'Попробуйте изменить фильтры'}
            </p>
            <button onClick={() => { setSelectedCategory('Все'); setSelectedSeason('All'); setCatalogSearch(''); setShowCatalogSearch(false); }} className="px-6 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] transition-all active:scale-95" style={{ background: ACCENT, color: '#fff', fontFamily: "'Inter',sans-serif" }}>Сбросить фильтры</button>
          </m.div>
        )}

        <AnimatePresence>
          {quickViewFlower && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[100] flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setQuickViewFlower(null)}>
              <m.div initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }} transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }} className="w-full max-w-lg rounded-t-[32px] overflow-hidden relative" style={{ background: BG, backdropFilter: 'blur(20px)', border: '0.5px solid rgba(0,0,0,0.06)', boxShadow: '0 -20px 60px rgba(0,0,0,0.15)', maxHeight: '72vh', paddingBottom: 'calc(max(24px, env(safe-area-inset-bottom)) + 80px)' }} onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-center pt-3 pb-2"><div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} /></div>
                <button onClick={() => setQuickViewFlower(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10" style={{ background: 'rgba(0,0,0,0.05)' }} data-testid="button-close-quickview"><X className="w-4 h-4" style={{ color: TEXT }} /></button>
                <div className="px-5 pb-4 overflow-y-auto" style={{ maxHeight: 'calc(72vh - 56px)' }}>
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '18px' }}>
                    <div style={{ width: '100px', flexShrink: 0, borderRadius: '14px', overflow: 'hidden', background: 'rgba(0,0,0,0.03)', aspectRatio: '2/3' }}>
                      <LazyImage src={quickViewFlower.image} alt={quickViewFlower.name} className="w-full h-full object-cover" />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '2px', minWidth: 0 }}>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '6px', fontFamily: "'Inter',sans-serif" }}>{quickViewFlower.category}</p>
                      <h3 style={{ fontSize: '20px', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: '0.03em', color: TEXT, lineHeight: 1.15, marginBottom: '8px' }}>{quickViewFlower.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '12px' }}>
                        {[1,2,3,4,5].map(s => (<Star key={s} style={{ width: '11px', height: '11px' }} fill={s <= Math.round(quickViewFlower.rating) ? ACCENT : 'transparent'} stroke={s <= Math.round(quickViewFlower.rating) ? ACCENT : '#D1D5DB'} />))}
                        <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '3px', fontFamily: "'Inter',sans-serif" }}>{quickViewFlower.rating}</span>
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' as const }}>
                          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter',sans-serif", color: TEXT }}>{formatPrice(quickViewFlower.price)}</span>
                          {quickViewFlower.oldPrice && (<span style={{ fontSize: '13px', textDecoration: 'line-through', color: '#9CA3AF' }}>{formatPrice(quickViewFlower.oldPrice)}</span>)}
                        </div>
                        {quickViewFlower.oldPrice && (<span style={{ display: 'inline-block', marginTop: '5px', fontSize: '10px', fontWeight: 700, color: '#fff', background: ACCENT, borderRadius: '6px', padding: '2px 8px', fontFamily: "'Inter',sans-serif" }}>−{Math.round((1 - quickViewFlower.price / quickViewFlower.oldPrice) * 100)}%</span>)}
                      </div>
                    </div>
                  </div>
                  <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.06)', marginBottom: '16px' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: CARD, border: '0.5px solid rgba(0,0,0,0.05)' }}>
                      <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '4px', fontFamily: "'Inter',sans-serif" }}>Свежесть</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: TEXT, fontFamily: "'Inter',sans-serif" }}>{quickViewFlower.vaseLife}</p>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '12px', background: CARD, border: '0.5px solid rgba(0,0,0,0.05)' }}>
                      <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '4px', fontFamily: "'Inter',sans-serif" }}>Сезон</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: seasonConfig[quickViewFlower.season]?.color ?? TEXT, fontFamily: "'Inter',sans-serif" }}>{seasonConfig[quickViewFlower.season]?.label}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setQuickViewFlower(null); openFlower(quickViewFlower); }} className="flex-1 py-3.5 rounded-[16px] text-[13px] font-bold transition-all active:scale-[0.98]" style={{ background: 'rgba(0,0,0,0.04)', color: TEXT, border: '0.5px solid rgba(0,0,0,0.08)', fontFamily: "'Inter',sans-serif" }} data-testid="button-quickview-details">Подробнее</button>
                    <button onClick={() => { addToCartHook({ id: String(quickViewFlower.id), name: quickViewFlower.name, price: quickViewFlower.price, image: quickViewFlower.image, size: quickViewFlower.sizes[0], color: quickViewFlower.colors[0] }); toast({ title: 'Добавлено в корзину', description: `${quickViewFlower.name} · ${quickViewFlower.colors[0]}`, duration: 2000 }); setQuickViewFlower(null); }} className="flex-1 py-3.5 rounded-[16px] text-[13px] font-black transition-all active:scale-[0.98]" style={{ background: ACCENT, color: '#fff', fontFamily: "'Inter',sans-serif" }} data-testid="button-quickview-add-to-cart">В корзину</button>
                  </div>
                </div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen pb-52 smooth-scroll-page" style={{ background: BG, color: TEXT }}>
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.32em', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px', fontFamily: "'Inter',sans-serif" }}>FLORAL ART</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Корзина</h1>
            {cartCount > 0 && (<span style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif", fontWeight: 400 }}>— {cartCount} {cartCount === 1 ? 'букет' : cartCount < 5 ? 'букета' : 'букетов'}</span>)}
          </div>
        </div>
        <div className="px-5 pt-4">
          {cart.length === 0 ? (
            <EmptyState type="cart" title="Корзина пуста" description="Добавьте букеты из каталога, чтобы оформить заказ" actionLabel="Перейти в каталог" onAction={() => onTabChange?.('catalog')} />
          ) : (
            <>
              <div className="space-y-3">
                <AnimatePresence>
                  {cart.map((item) => {
                    const flowerRef = flowers.find(p => String(p.id) === item.id);
                    return (
                      <m.div key={`${item.id}-${item.size}-${item.color}`} layout exit={{ opacity: 0, x: -80, transition: { duration: 0.25 } }} style={{ display: 'flex', gap: '14px', padding: '14px', borderRadius: '18px', background: CARD, border: '0.5px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', alignItems: 'center' }} data-testid={`cart-item-${item.id}`}>
                        <div style={{ width: '72px', height: '72px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.03)' }}>
                          <LazyImage src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: "'Inter',sans-serif", marginBottom: '2px' }}>{flowerRef?.category ?? ''}</p>
                          <p style={{ fontSize: '15px', fontWeight: 500, fontStyle: 'italic', fontFamily: "'Cormorant Garamond', Georgia, serif", color: TEXT, marginBottom: '4px', lineHeight: 1.2 }}>{item.name}</p>
                          <p style={{ fontSize: '10px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif", marginBottom: '8px' }}>{item.color} · {item.size}</p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: '16px', fontWeight: 800, fontFamily: "'Inter',sans-serif", letterSpacing: '-0.02em' }}>{formatPrice(item.price * item.quantity)}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', padding: '2px' }}>
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)} className="w-8 h-8 rounded-[10px] flex items-center justify-center active:scale-95 transition-all" style={{ background: CARD }} aria-label="Уменьшить" data-testid={`button-decrease-${item.id}`}>
                                <Minus className="w-3.5 h-3.5" style={{ color: MUTED }} />
                              </button>
                              <span style={{ width: '28px', textAlign: 'center', fontSize: '13px', fontWeight: 700, fontFamily: "'Inter',sans-serif" }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)} className="w-8 h-8 rounded-[10px] flex items-center justify-center active:scale-95 transition-all" style={{ background: CARD }} aria-label="Увеличить" data-testid={`button-increase-${item.id}`}>
                                <Plus className="w-3.5 h-3.5" style={{ color: MUTED }} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.id, item.size, item.color)} className="w-8 h-8 rounded-full flex items-center justify-center self-start active:scale-95" style={{ background: 'rgba(239,68,68,0.06)' }} aria-label="Удалить" data-testid={`button-remove-${item.id}`}>
                          <X className="w-3.5 h-3.5" style={{ color: '#EF4444' }} />
                        </button>
                      </m.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60, padding: `16px 20px calc(16px + env(safe-area-inset-bottom, 0px))`, background: `linear-gradient(0deg, ${BG} 70%, transparent 100%)` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>Итого</span>
              <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: "'Inter',sans-serif" }}>{formatPrice(cartTotal)}</span>
            </div>
            <button onClick={() => setIsCheckoutOpen(true)} className="w-full rounded-[18px] font-black transition-all active:scale-[0.97]" style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #C25882 100%)`, color: '#fff', fontSize: '15px', fontFamily: "'Inter',sans-serif", letterSpacing: '-0.01em', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: `0 8px 32px ${ACCENT}30` }} data-testid="button-checkout">
              <span>Оформить заказ</span>
              <span style={{ opacity: 0.55 }}>·</span>
              <span>{formatPrice(cartTotal)}</span>
            </button>
          </div>
        )}

        <CheckoutDrawer isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={cart.map(item => ({ id: Number(item.id), name: item.name, price: item.price, quantity: item.quantity, size: item.size, color: item.color, image: item.image }))} total={cartTotal} currency="₽" onOrderComplete={handleCheckout} storeName="FloralArt" />
      </div>
    );
  }

  if (activeTab === 'profile') {
    const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
    const tier = totalSpent >= 50000 ? 'FLORAL PLATINUM' : totalSpent >= 15000 ? 'FLORAL GOLD' : 'FLORAL MEMBER';
    const tierColor = totalSpent >= 50000 ? '#8B5CF6' : ACCENT;
    const statusLabel: Record<string, string> = { pending: 'Обработка', confirmed: 'Подтверждён', processing: 'Собирается', shipped: 'Доставляется', delivered: 'Доставлен' };
    const statusColor: Record<string, string> = { pending: '#9CA3AF', confirmed: '#60A5FA', processing: '#F97316', shipped: '#F59E0B', delivered: '#10B981' };

    return (
      <div className="min-h-screen pb-24 smooth-scroll-page" style={{ background: BG, color: TEXT }}>
        <div style={{ position: 'relative', overflow: 'hidden', padding: '36px 20px 28px' }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${ACCENT}08 0%, transparent 55%), linear-gradient(225deg, ${ACCENT}04 0%, transparent 50%)` }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '0.5px', background: `linear-gradient(90deg, transparent, ${ACCENT}30, transparent)` }} />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: `linear-gradient(135deg, ${ACCENT} 0%, #C25882 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 3px ${ACCENT}20, 0 0 0 6px ${ACCENT}08` }}>
                <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: "'Inter',sans-serif", letterSpacing: '-0.03em' }}>АЦ</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: "'Inter',sans-serif", marginBottom: '2px' }}>Анна Цветкова</h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif", marginBottom: '10px' }}>+7 (999) 123-45-67</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: `${tierColor}10`, border: `0.5px solid ${tierColor}25` }}>
                <Sparkles style={{ width: '9px', height: '9px', color: tierColor }} />
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.22em', color: tierColor, fontFamily: "'Inter',sans-serif", textTransform: 'uppercase' }}>{tier}</span>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Заказы', value: String(ordersCount) },
              { label: 'Избранное', value: String(favoritesCount) },
              { label: 'Потрачено', value: totalSpent > 0 ? `${Math.round(totalSpent / 1000)}К` : '0' },
            ].map((stat) => (
              <div key={stat.label} style={{ padding: '14px 10px', borderRadius: '16px', background: CARD, border: '0.5px solid rgba(0,0,0,0.05)', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: "'Inter',sans-serif", color: ACCENT, lineHeight: 1, marginBottom: '5px' }}>{stat.value}</p>
                <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.06)', margin: '0 20px' }} />

        {orders.length > 0 && (
          <div style={{ padding: '20px 20px 4px' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '12px', fontFamily: "'Inter',sans-serif" }}>Последние заказы</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orders.slice(0, 3).map((order) => {
                const st = order.status ?? 'delivered';
                return (
                  <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', background: CARD, border: '0.5px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${ACCENT}08`, border: `0.5px solid ${ACCENT}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Package style={{ width: '18px', height: '18px', color: ACCENT }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Inter',sans-serif", color: TEXT, marginBottom: '2px' }}>№ {order.id.slice(-6).toUpperCase()}</p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: "'Inter',sans-serif" }}>{order.items.length} {order.items.length === 1 ? 'букет' : order.items.length < 5 ? 'букета' : 'букетов'} · {formatPrice(order.total)}</p>
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: '20px', background: `${statusColor[st]}12`, color: statusColor[st], fontFamily: "'Inter',sans-serif", flexShrink: 0 }}>{statusLabel[st] ?? 'Доставлен'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ padding: orders.length > 0 ? '12px 20px 0' : '20px 20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { icon: <Heart style={{ width: '18px', height: '18px' }} />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined, testId: 'button-favorites' },
            { icon: <MapPin style={{ width: '18px', height: '18px' }} />, label: 'Адреса доставки', testId: 'button-addresses' },
            { icon: <Package style={{ width: '18px', height: '18px' }} />, label: 'Мои заказы', badge: ordersCount > 0 ? String(ordersCount) : undefined, testId: 'button-orders' },
            { icon: <CreditCard style={{ width: '18px', height: '18px' }} />, label: 'Способы оплаты', testId: 'button-payment' },
            { icon: <Settings style={{ width: '18px', height: '18px' }} />, label: 'Настройки', testId: 'button-settings' },
          ].map((item) => (
            <button key={item.label} className="w-full transition-all active:scale-[0.98]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '18px', background: CARD, border: '0.5px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} aria-label={item.label} data-testid={item.testId}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED }}>{item.icon}</div>
                <span style={{ fontSize: '15px', fontWeight: 500, color: TEXT, fontFamily: "'Inter',sans-serif" }}>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.badge && (<span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: `${ACCENT}10`, color: ACCENT, fontFamily: "'Inter',sans-serif" }}>{item.badge}</span>)}
                <ChevronLeft style={{ width: '16px', height: '16px', color: '#D1D5DB', transform: 'rotate(180deg)' }} />
              </div>
            </button>
          ))}

          <button className="w-full transition-all active:scale-[0.98]" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '18px', background: 'rgba(239,68,68,0.04)', border: '0.5px solid rgba(239,68,68,0.1)' }} data-testid="button-logout">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut style={{ width: '18px', height: '18px', color: 'rgba(239,68,68,0.7)' }} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(239,68,68,0.8)', fontFamily: "'Inter',sans-serif" }}>Выйти из аккаунта</span>
          </button>
        </div>
        <div style={{ height: '20px' }} />
      </div>
    );
  }

  return null;
}

function FloristWithTheme(props: FloristProps) {
  return (
    <DemoThemeProvider themeId="floralArt">
      <Florist {...props} />
    </DemoThemeProvider>
  );
}

export default memo(FloristWithTheme);
