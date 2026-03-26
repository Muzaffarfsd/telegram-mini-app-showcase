import { useState, useRef, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart, Star, ChevronLeft, Sparkles, Calendar, Clock, User,
  Gift, MapPin, Search, ShoppingBag, Settings,
  Home, Grid, Tag, Scissors, Droplets, Flower2, Hand,
  Truck, ShieldCheck, RotateCcw, X, Check
} from "lucide-react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { LazyImage, DemoThemeProvider } from "@/components/shared";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";
import glowspaHeroImg from "@assets/glowspa_hero.jpg";
import glowspaHaircutImg from "@assets/glowspa_haircut.jpg";
import glowspaAirtouchImg from "@assets/glowspa_airtouch.jpg";
import glowspaBalayageImg from "@assets/glowspa_balayage.jpg";
import glowspaManicureImg from "@assets/glowspa_manicure.jpg";
import glowspaFrenchImg from "@assets/glowspa_french.jpg";
import glowspaPedicureImg from "@assets/glowspa_pedicure.jpg";
import glowspaBotoxImg from "@assets/glowspa_botox.jpg";
import glowspaFacialImg from "@assets/glowspa_facial.jpg";
import glowspaMassageFaceImg from "@assets/glowspa_massage_face.jpg";
import glowspaLashesImg from "@assets/glowspa_lashes.jpg";
import glowspaMassageBodyImg from "@assets/glowspa_massage_body.jpg";
import glowspaStylingImg from "@assets/glowspa_styling.jpg";

const STORE_KEY = 'glowspa-store';

const CORMORANT = '"Cormorant Garamond", Georgia, serif';
const INTER = '"Inter", system-ui, sans-serif';
const ACCENT = '#C9A89B';
const BG = '#0C0A09';

interface BeautyProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

interface Service {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
  editorialNote: string;
  category: string;
  categoryIcon: 'scissors' | 'hand' | 'droplets' | 'flower';
  duration: string;
  specialist: string;
  rating: number;
  isPopular?: boolean;
  isNew?: boolean;
  benefits: string[];
  process: string[];
  aftercare: string;
}

const services: Service[] = [
  {
    id: 1,
    name: 'Авторская стрижка',
    price: 4500,
    oldPrice: 5500,
    image: glowspaHaircutImg,
    description: 'Индивидуальный подбор формы с учётом типа лица, текстуры волос и образа жизни. Премиальная косметика Davines.',
    editorialNote: 'Каждая стрижка начинается с диалога. Мастер изучает структуру волос, овал лица, привычки укладки — и только потом берёт ножницы. Результат — форма, которая живёт и работает на вас.',
    category: 'Волосы',
    categoryIcon: 'scissors',
    duration: '60 мин',
    specialist: 'Анна Смирнова',
    rating: 4.9,
    isPopular: true,
    benefits: ['Консультация стилиста', 'Анализ типа волос', 'Укладка включена'],
    process: ['Консультация и диагностика', 'Мытьё с уходом', 'Стрижка', 'Укладка и стайлинг'],
    aftercare: 'Рекомендуем стайлинг средства для фиксации формы между визитами'
  },
  {
    id: 2,
    name: 'Окрашивание Airtouch',
    price: 12500,
    oldPrice: 15000,
    image: glowspaAirtouchImg,
    description: 'Техника нового поколения. Воздушное осветление без резких границ. Естественные переливы и глубина цвета.',
    editorialNote: 'Airtouch — это искусство работы с воздухом. Мастер выдувает короткие волосы, оставляя только длинные для осветления. Результат — максимально натуральный, словно вы только вернулись из отпуска на побережье.',
    category: 'Волосы',
    categoryIcon: 'scissors',
    duration: '240 мин',
    specialist: 'Елена Козлова',
    rating: 4.8,
    isPopular: true,
    isNew: true,
    benefits: ['Щадящие формулы без аммиака', 'Естественный результат', 'До 6 месяцев без коррекции'],
    process: ['Диагностика и подбор оттенка', 'Разделение прядей', 'Airtouch осветление', 'Тонирование', 'Уход и укладка'],
    aftercare: 'Бессульфатный шампунь и тонирующая маска раз в неделю'
  },
  {
    id: 3,
    name: 'Балаяж',
    price: 9800,
    image: glowspaBalayageImg,
    description: 'Солнечные блики, созданные вручную. Авторская техника свободной руки для абсолютно натурального эффекта.',
    editorialNote: 'Балаяж в нашем салоне — это ручная живопись по волосам. Мастер наносит осветлитель широкими мазками, как художник — краску на холст. Каждая прядь уникальна.',
    category: 'Волосы',
    categoryIcon: 'scissors',
    duration: '210 мин',
    specialist: 'Мария Петрова',
    rating: 4.9,
    isNew: true,
    isPopular: true,
    benefits: ['Авторская техника', 'Натуральный эффект', 'Мягкое отрастание'],
    process: ['Консультация', 'Подготовка волос', 'Ручное осветление', 'Тонирование', 'Восстанавливающий уход'],
    aftercare: 'Оттеночные маски каждую неделю для поддержания тона'
  },
  {
    id: 4,
    name: 'Люкс маникюр',
    price: 3200,
    oldPrice: 3800,
    image: glowspaManicureImg,
    description: 'Комбинированная техника с покрытием премиум гель-лаком. Стойкость до 4 недель. Бережный уход за кутикулой.',
    editorialNote: 'Мы не просто красим ногти — мы создаём завершённый образ. Каждый этап выполняется с хирургической точностью: от формирования архитектуры ногтя до финального слоя топа.',
    category: 'Ногти',
    categoryIcon: 'hand',
    duration: '90 мин',
    specialist: 'Ольга Иванова',
    rating: 4.8,
    isPopular: true,
    benefits: ['Премиум гель-лаки Luxio', 'Стойкость до 4 недель', 'SPA-уход для рук'],
    process: ['Снятие старого покрытия', 'Аппаратная обработка', 'SPA-уход', 'Покрытие и сушка'],
    aftercare: 'Масло для кутикулы ежедневно, крем для рук'
  },
  {
    id: 5,
    name: 'Френч ручной работы',
    price: 3800,
    image: glowspaFrenchImg,
    description: 'Безупречная линия улыбки, нарисованная вручную тонкой кистью. Классика, доведённая до совершенства.',
    editorialNote: 'Настоящий французский маникюр — это идеальная симметрия и белоснежная линия улыбки, которую можно нарисовать только рукой мастера. Никаких трафаретов, только опыт и точность.',
    category: 'Ногти',
    categoryIcon: 'hand',
    duration: '100 мин',
    specialist: 'Наталья Волкова',
    rating: 4.9,
    benefits: ['Ручная прорисовка', 'Укрепление ногтевой пластины', 'Идеальная геометрия'],
    process: ['Подготовка', 'Формирование архитектуры', 'Френч прорисовка', 'Топовое покрытие'],
    aftercare: 'Перчатки при контакте с бытовой химией'
  },
  {
    id: 6,
    name: 'SPA педикюр',
    price: 4200,
    image: glowspaPedicureImg,
    description: 'Полная программа ухода за стопами. Ароматерапия, пилинг, маска, массаж. Абсолютный комфорт.',
    editorialNote: 'SPA педикюр в GlowSpa — это 100 минут полного расслабления. Ванночка с эфирными маслами, пилинг с вулканической пемзой, питательная маска и массаж стоп.',
    category: 'Ногти',
    categoryIcon: 'hand',
    duration: '100 мин',
    specialist: 'Светлана Белова',
    rating: 4.9,
    isPopular: true,
    benefits: ['Ароматерапия', 'Массаж стоп', 'Питательные маски'],
    process: ['Ванночка с маслами', 'Пилинг', 'Аппаратная обработка', 'Маска и массаж', 'Покрытие'],
    aftercare: 'Увлажняющий крем для стоп каждый вечер'
  },
  {
    id: 7,
    name: 'Ботокс для волос',
    price: 8500,
    oldPrice: 10000,
    image: glowspaBotoxImg,
    description: 'Интенсивная реконструкция повреждённых волос. Зеркальный блеск и шелковистость с первой процедуры.',
    editorialNote: 'Ботокс для волос — это не инъекции, а глубокое насыщение кератином и коллагеном. Состав проникает в структуру каждого волоса, заполняя пустоты и запечатывая кутикулу.',
    category: 'Волосы',
    categoryIcon: 'scissors',
    duration: '120 мин',
    specialist: 'Анна Смирнова',
    rating: 4.9,
    isNew: true,
    benefits: ['Глубокое восстановление', 'Устранение пушистости', 'Термозащита'],
    process: ['Глубокое очищение', 'Нанесение состава', 'Выдержка под теплом', 'Запечатывание утюжком', 'Укладка'],
    aftercare: 'Безсульфатный уход для продления эффекта до 3 месяцев'
  },
  {
    id: 8,
    name: 'Чистка лица HydraFacial',
    price: 6500,
    oldPrice: 7500,
    image: glowspaFacialImg,
    description: 'Аппаратная чистка нового поколения. Глубокое очищение, увлажнение и защита за одну процедуру.',
    editorialNote: 'HydraFacial объединяет очищение, эксфолиацию, экстракцию и увлажнение в одном аппарате. Никакого покраснения, никакого восстановительного периода — только сияющая кожа сразу после процедуры.',
    category: 'Лицо',
    categoryIcon: 'droplets',
    duration: '75 мин',
    specialist: 'Юлия Титова',
    rating: 4.8,
    isPopular: true,
    benefits: ['Без восстановительного периода', 'Видимый результат сразу', 'Глубокое увлажнение'],
    process: ['Демакияж', 'Аппаратная эксфолиация', 'Вакуумная экстракция', 'Насыщение сыворотками', 'Защитный финиш'],
    aftercare: 'SPF 30+ обязателен, минимум декоративной косметики 24 часа'
  },
  {
    id: 9,
    name: 'Буккальный массаж',
    price: 5500,
    image: glowspaMassageFaceImg,
    description: 'Скульптурный массаж лица через ротовую полость. Мгновенный лифтинг без инъекций.',
    editorialNote: 'Буккальный массаж — это работа не только снаружи, но и изнутри. Мастер прорабатывает мышцы через щёки, снимая глубокие спазмы и возвращая овалу лица чёткость. Эффект виден после первого сеанса.',
    category: 'Лицо',
    categoryIcon: 'droplets',
    duration: '60 мин',
    specialist: 'Валентина Крылова',
    rating: 4.7,
    isNew: true,
    benefits: ['Лифтинг без инъекций', 'Улучшение овала лица', 'Моментальный результат'],
    process: ['Очищение кожи', 'Наружный массаж', 'Буккальная техника', 'Сыворотка и маска'],
    aftercare: 'Пейте больше воды, избегайте соли 24 часа'
  },
  {
    id: 10,
    name: 'Наращивание ресниц',
    price: 5900,
    image: glowspaLashesImg,
    description: 'Объём 2D–5D. Гипоаллергенные материалы. Естественный или драматический эффект на выбор.',
    editorialNote: 'Мы используем только шёлковые и норковые волокна премиум-класса. Каждая ресничка крепится индивидуально, повторяя направление роста натуральных ресниц.',
    category: 'Лицо',
    categoryIcon: 'flower',
    duration: '150 мин',
    specialist: 'Ирина Павлова',
    rating: 4.8,
    benefits: ['Гипоаллергенный клей', 'Объём 2D-5D', 'Носка до 4 недель'],
    process: ['Подбор эффекта и длины', 'Подготовка ресниц', 'Поштучное наращивание', 'Закрепление и расчёсывание'],
    aftercare: 'Не мочить 24 часа, избегать масляных средств'
  },
  {
    id: 11,
    name: 'Массаж всего тела',
    price: 7500,
    oldPrice: 9000,
    image: glowspaMassageBodyImg,
    description: 'Классический расслабляющий массаж с натуральными маслами. Снятие мышечного напряжения и стресса.',
    editorialNote: 'Массаж в GlowSpa — это ритуал. Приглушённый свет, аромат эфирных масел, тёплые камни и руки мастера с 15-летним опытом. Вы забудете, где находитесь — и это лучший комплимент.',
    category: 'Тело',
    categoryIcon: 'flower',
    duration: '90 мин',
    specialist: 'Ольга Смирнова',
    rating: 4.9,
    isPopular: true,
    benefits: ['Натуральные масла', 'Индивидуальная техника', 'Полная релаксация'],
    process: ['Подготовка и ароматерапия', 'Разогрев', 'Основной массаж', 'Завершающие поглаживания'],
    aftercare: 'Больше воды, отдых от физических нагрузок до вечера'
  },
  {
    id: 12,
    name: 'Вечерняя укладка',
    price: 4500,
    image: glowspaStylingImg,
    description: 'Роскошный образ для особого случая. Стойкая фиксация. Консультация по стилю.',
    editorialNote: 'Свадьба, выпускной, гала-вечер — каждое событие заслуживает идеальной укладки. Мастер подберёт форму под наряд, украшения и формат мероприятия.',
    category: 'Волосы',
    categoryIcon: 'scissors',
    duration: '90 мин',
    specialist: 'Мария Петрова',
    rating: 4.7,
    benefits: ['Консультация по образу', 'Премиум стайлинг', 'Фиксация на весь вечер'],
    process: ['Мытьё и подготовка', 'Сушка и текстурирование', 'Создание формы', 'Фиксация и декор'],
    aftercare: 'Сухой шампунь для освежения на следующий день'
  },
];

const categories = ['Все', 'Волосы', 'Ногти', 'Лицо', 'Тело'];

const categoryConfig: Record<string, { icon: typeof Scissors; label: string; color: string }> = {
  'Волосы': { icon: Scissors, label: 'Волосы', color: '#C9A89B' },
  'Ногти':  { icon: Hand, label: 'Ногти', color: '#D4A0A0' },
  'Лицо':   { icon: Droplets, label: 'Лицо', color: '#A8C9B8' },
  'Тело':   { icon: Flower2, label: 'Тело', color: '#B8A8C9' },
};

const mockReviews = [
  {
    author: 'Анастасия К.',
    initials: 'АК',
    rating: 5,
    date: '15 марта 2026',
    text: 'Невероятный уровень сервиса. Мастер Анна подобрала идеальную форму стрижки — я получаю комплименты каждый день. Укладка держится даже под дождём. Вернусь обязательно.',
    verified: true,
  },
  {
    author: 'Марина Л.',
    initials: 'МЛ',
    rating: 5,
    date: '2 марта 2026',
    text: 'Делала балаяж у Марии — это произведение искусства. Цвет играет на солнце как натуральный. За 4 месяца ни разу не пожалела. Салон чистый, атмосфера расслабляющая, чай вкусный.',
    verified: true,
  },
  {
    author: 'Дарья В.',
    initials: 'ДВ',
    rating: 5,
    date: '18 февр. 2026',
    text: 'HydraFacial — это love forever. Кожа сияет, поры сузились, тон выровнялся. Делаю раз в месяц и забыла, что такое тональный крем. Юлия — профессионал высшего класса.',
    verified: true,
  },
];

const productPageVariants = {
  initial: { opacity: 0, y: 28, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 40, scale: 0.975 },
};

const contentStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
};

const contentItem = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as number[] } },
};

function Beauty({ activeTab, onTabChange }: BeautyProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [productExiting, setProductExiting] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<'about' | 'process' | 'reviews'>('about');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Записи', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: ACCENT },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price);

  const handleProductBack = () => {
    setProductExiting(true);
    setTimeout(() => {
      setProductExiting(false);
      setSelectedService(null);
    }, 340);
  };

  const handleToggleFavorite = (id: number) => {
    toggleFavoriteHook(String(id));
    const isNow = !isFavorite(String(id));
    toast({ title: isNow ? 'Добавлено в избранное' : 'Удалено из избранного', duration: 1500 });
  };

  const openService = (service: Service) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedService(service);
    setActiveProductTab('about');
    if (heroImageRef.current) heroImageRef.current.style.transform = '';
    if (productScrollRef.current) productScrollRef.current.scrollTop = 0;
  };

  const bookService = () => {
    if (!selectedService) return;
    addToCartHook({
      id: String(selectedService.id),
      name: selectedService.name,
      price: selectedService.price,
      image: selectedService.image,
      size: selectedService.duration,
      color: selectedService.specialist,
    });
    toast({
      title: 'Записано',
      description: `${selectedService.name} · ${selectedService.specialist}`,
      duration: 2000,
    });
    handleProductBack();
  };

  const handleCheckout = (orderId: string) => {
    createOrder(
      cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, size: i.size, color: i.color })),
      cartTotal,
      { phone: '+7 (999) 888-77-66' }
    );
    clearCart();
    setIsCheckoutOpen(false);
    toast({ title: 'Запись подтверждена!', description: `Номер: ${orderId}`, duration: 3000 });
  };

  const filteredServices = services.filter(s => {
    const matchCat = selectedCategory === 'Все' || s.category === selectedCategory;
    const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.specialist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (activeTab === 'catalog' && selectedService) {
    const catCfg = categoryConfig[selectedService.category];
    const accentColor = catCfg?.color ?? ACCENT;
    const discountPct = selectedService.oldPrice
      ? Math.round((1 - selectedService.price / selectedService.oldPrice) * 100)
      : 0;

    return (
      <m.div
        className="h-screen text-white overflow-hidden relative flex flex-col"
        style={{ backgroundColor: BG }}
        variants={productPageVariants}
        initial="initial"
        animate={productExiting ? 'exit' : 'animate'}
        transition={{ duration: productExiting ? 0.32 : 0.35, ease: productExiting ? [0.32, 0, 0.67, 0] : [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence>
          {showStickyHeader && (
            <m.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 demo-nav-safe"
              style={{ background: 'rgba(12,10,9,0.85)', backdropFilter: 'blur(20px) saturate(1.2)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
            >
              <button onClick={handleProductBack} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <ChevronLeft className="w-5 h-5 text-white/80" />
              </button>
              <span style={{ fontFamily: CORMORANT, fontSize: '1.1rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{selectedService.name}</span>
              <button onClick={() => handleToggleFavorite(selectedService.id)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Heart className="w-4.5 h-4.5" style={isFavorite(String(selectedService.id)) ? { fill: accentColor, color: accentColor } : { color: 'rgba(255,255,255,0.6)' }} />
              </button>
            </m.div>
          )}
        </AnimatePresence>

        <div
          ref={productScrollRef}
          className="flex-1 overflow-y-auto overscroll-y-contain"
          onScroll={(e) => {
            const scrollTop = (e.target as HTMLDivElement).scrollTop;
            setShowStickyHeader(scrollTop > 280);
            if (heroImageRef.current) {
              heroImageRef.current.style.transform = `scale(${1 + scrollTop * 0.0005}) translateY(${scrollTop * 0.25}px)`;
            }
          }}
        >
          <div className="relative" style={{ height: '65vh', minHeight: 380 }}>
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 demo-nav-safe">
              <button onClick={handleProductBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button onClick={() => handleToggleFavorite(selectedService.id)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
                <Heart className="w-5 h-5" style={isFavorite(String(selectedService.id)) ? { fill: accentColor, color: accentColor } : { color: 'white' }} />
              </button>
            </div>

            <div ref={heroImageRef} className="absolute inset-0 will-change-transform">
              <LazyImage src={selectedService.image} alt={selectedService.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A09] via-[#0C0A09]/40 to-transparent" />

            <div className="absolute bottom-6 left-5 right-5 z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider" style={{ background: `${accentColor}20`, color: accentColor, border: `0.5px solid ${accentColor}30` }}>
                  {selectedService.category}
                </span>
                {selectedService.isNew && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ background: ACCENT, color: BG }}>
                    <Sparkles className="w-3 h-3" /> NEW
                  </span>
                )}
                {discountPct > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                    −{discountPct}%
                  </span>
                )}
              </div>
              <h1 style={{ fontFamily: CORMORANT, fontSize: 'clamp(1.8rem, 6vw, 2.4rem)', fontWeight: 500, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                {selectedService.name}
              </h1>
            </div>
          </div>

          <m.div
            className="relative z-10 px-5 pb-32"
            style={{ marginTop: -1 }}
            variants={contentStagger}
            initial="hidden"
            animate="visible"
          >
            <m.div variants={contentItem} className="flex items-end justify-between mb-5 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: CORMORANT, fontSize: '1.8rem', fontWeight: 600, color: ACCENT }}>{formatPrice(selectedService.price)}</span>
                  {selectedService.oldPrice && (
                    <span style={{ fontFamily: INTER, fontSize: '0.85rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>{formatPrice(selectedService.oldPrice)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5" style={{ fill: i < Math.floor(selectedService.rating) ? '#F59E0B' : 'rgba(255,255,255,0.1)', color: i < Math.floor(selectedService.rating) ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                  <span style={{ fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>{selectedService.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Мастер</span>
                  <p style={{ fontFamily: CORMORANT, fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>{selectedService.specialist}</p>
                </div>
              </div>
            </m.div>

            <m.div variants={contentItem} className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <Clock className="w-4.5 h-4.5 mb-2" style={{ color: accentColor }} />
                <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Длительность</p>
                <p style={{ fontFamily: CORMORANT, fontSize: '1.05rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{selectedService.duration}</p>
              </div>
              <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <User className="w-4.5 h-4.5 mb-2" style={{ color: accentColor }} />
                <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Специалист</p>
                <p style={{ fontFamily: CORMORANT, fontSize: '1.05rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{selectedService.specialist}</p>
              </div>
            </m.div>

            <m.div variants={contentItem} className="flex gap-0 mb-5 rounded-xl overflow-hidden" style={{ border: '0.5px solid rgba(255,255,255,0.06)' }}>
              {(['about', 'process', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveProductTab(tab)}
                  className="flex-1 py-3 relative transition-colors duration-200"
                  style={{
                    fontFamily: INTER,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: activeProductTab === tab ? '#fff' : 'rgba(255,255,255,0.35)',
                    background: activeProductTab === tab ? 'rgba(255,255,255,0.06)' : 'transparent',
                  }}
                >
                  {tab === 'about' ? 'О процедуре' : tab === 'process' ? 'Этапы' : 'Отзывы'}
                  {activeProductTab === tab && (
                    <m.div layoutId="beauty-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: accentColor }} />
                  )}
                </button>
              ))}
            </m.div>

            {activeProductTab === 'about' && (
              <m.div variants={contentStagger} initial="hidden" animate="visible">
                <m.p variants={contentItem} style={{ fontFamily: INTER, fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', marginBottom: 20 }}>
                  {selectedService.description}
                </m.p>

                <m.div variants={contentItem} className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${accentColor}40` }}>
                  <p style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Заметка мастера</p>
                  <p style={{ fontFamily: CORMORANT, fontSize: '1.05rem', fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                    «{selectedService.editorialNote}»
                  </p>
                </m.div>

                <m.div variants={contentItem}>
                  <p style={{ fontFamily: INTER, fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Что включено</p>
                  <div className="space-y-2.5">
                    {selectedService.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${accentColor}15`, border: `0.5px solid ${accentColor}25` }}>
                          <Check className="w-3 h-3" style={{ color: accentColor }} />
                        </div>
                        <span style={{ fontFamily: INTER, fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </m.div>
              </m.div>
            )}

            {activeProductTab === 'process' && (
              <m.div variants={contentStagger} initial="hidden" animate="visible">
                <m.div variants={contentItem} className="space-y-0 mb-6">
                  {selectedService.process.map((step, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10" style={{ background: `${accentColor}15`, border: `0.5px solid ${accentColor}30` }}>
                          <span style={{ fontFamily: INTER, fontSize: '0.7rem', fontWeight: 700, color: accentColor }}>{i + 1}</span>
                        </div>
                        {i < selectedService.process.length - 1 && (
                          <div className="w-px flex-1 my-1" style={{ background: `${accentColor}15` }} />
                        )}
                      </div>
                      <div className="pb-5 pt-1">
                        <p style={{ fontFamily: INTER, fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{step}</p>
                      </div>
                    </div>
                  ))}
                </m.div>
                <m.div variants={contentItem} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontFamily: INTER, fontSize: '0.65rem', fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Уход после процедуры</p>
                  <p style={{ fontFamily: INTER, fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>{selectedService.aftercare}</p>
                </m.div>
              </m.div>
            )}

            {activeProductTab === 'reviews' && (
              <m.div variants={contentStagger} initial="hidden" animate="visible" className="space-y-4">
                {mockReviews.map((review, i) => (
                  <m.div key={i} variants={contentItem} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${accentColor}15`, border: `0.5px solid ${accentColor}25` }}>
                        <span style={{ fontFamily: INTER, fontSize: '0.7rem', fontWeight: 700, color: accentColor }}>{review.initials}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{review.author}</span>
                          {review.verified && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: `${accentColor}15`, color: accentColor }}>Verified</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} className="w-3 h-3" style={{ fill: j < review.rating ? '#F59E0B' : 'rgba(255,255,255,0.1)', color: j < review.rating ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />
                          ))}
                          <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginLeft: 4 }}>{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontFamily: INTER, fontSize: '0.825rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.65)' }}>{review.text}</p>
                  </m.div>
                ))}
              </m.div>
            )}

            <m.div variants={contentItem} className="mt-6 mb-4">
              <p style={{ fontFamily: INTER, fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Рекомендуем также</p>
              <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-hide">
                {services.filter(s => s.category === selectedService.category && s.id !== selectedService.id).slice(0, 4).map(s => (
                  <div key={s.id} className="flex-shrink-0 cursor-pointer active:scale-[0.97]" style={{ width: 140, transition: 'transform 0.15s ease' }} onClick={() => openService(s)}>
                    <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: '3/4' }}>
                      <LazyImage src={s.image} alt={s.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <p style={{ fontFamily: CORMORANT, fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }} className="truncate">{s.name}</p>
                    <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: accentColor }}>{formatPrice(s.price)}</p>
                  </div>
                ))}
              </div>
            </m.div>

            <m.div variants={contentItem} className="flex items-center justify-between py-4 mb-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
              {[
                { icon: Truck, label: 'Без ожидания' },
                { icon: ShieldCheck, label: 'Стерильность' },
                { icon: RotateCcw, label: 'Гарантия' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 flex-1 justify-center">
                  <item.icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.02em' }}>{item.label}</span>
                </div>
              ))}
            </m.div>
          </m.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 px-5 pb-6 pt-3" style={{ background: 'linear-gradient(to top, #0C0A09 60%, transparent)' }}>
          <button
            onClick={bookService}
            className="w-full py-4 rounded-2xl font-semibold active:scale-[0.97]"
            style={{
              fontFamily: INTER, fontSize: '0.9rem', letterSpacing: '0.04em',
              background: `linear-gradient(135deg, ${ACCENT}, ${categoryConfig[selectedService.category]?.color ?? ACCENT})`,
              color: BG, transition: 'transform 0.15s ease',
            }}
          >
            Записаться · {formatPrice(selectedService.price)}
          </button>
        </div>
      </m.div>
    );
  }

  if (activeTab === 'home') {
    const featured = services.filter(s => s.isNew).slice(0, 2);
    const popular = services.filter(s => s.isPopular).slice(0, 6);

    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: BG }}>
        <DemoSidebar menuItems={sidebarMenuItems} isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open} accentColor={ACCENT} title="GLOW SPA" subtitle="Салон красоты" />

        <div className="relative overflow-hidden" style={{ height: '70vh', minHeight: 420 }}>
          <div className="absolute inset-0">
            <LazyImage
              src={glowspaHeroImg}
              alt="GlowSpa Salon"
              className="w-full h-full"
              priority
            />
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(12,10,9,0.3) 0%, rgba(12,10,9,0.1) 30%, rgba(12,10,9,0.6) 70%, #0C0A09 100%)' }} />

          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 demo-nav-safe">
            <button onClick={sidebar.open} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(12px)' }}>
              <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect width="18" height="1.5" rx="0.75" fill="white" /><rect y="5" width="12" height="1.5" rx="0.75" fill="white" /><rect y="10" width="15" height="1.5" rx="0.75" fill="white" /></svg>
            </button>
          </div>

          <div className="absolute bottom-8 left-5 right-5 z-10">
            <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}>
              <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}>
                Салон красоты
              </span>
              <h1 className="mt-2" style={{ fontFamily: CORMORANT, fontSize: 'clamp(2.5rem, 10vw, 3.5rem)', fontWeight: 400, color: '#fff', lineHeight: 0.95, letterSpacing: '-0.02em' }}>
                Glow<br /><span style={{ fontStyle: 'italic', fontWeight: 300 }}>Spa</span>
              </h1>
              <p className="mt-3 max-w-xs" style={{ fontFamily: INTER, fontSize: '0.8rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
                Пространство, где красота встречается с заботой. Премиальные процедуры от лучших мастеров города.
              </p>
            </m.div>
          </div>
        </div>

        <div className="py-3 overflow-hidden" style={{ borderTop: '0.5px solid rgba(255,255,255,0.04)', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between px-5">
            {[
              { icon: ShieldCheck, label: 'Стерильность' },
              { icon: Sparkles, label: 'Премиум косметика' },
              { icon: Star, label: '12 мастеров' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 500, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pt-8 pb-4">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Коллекция</span>
              <h2 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Новые <span style={{ fontStyle: 'italic' }}>процедуры</span></h2>
            </div>
          </div>

          <div className="space-y-4">
            {featured.map((service, idx) => (
              <m.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98]"
                style={{ height: idx === 0 ? 320 : 240, transition: 'transform 0.15s ease' }}
                onClick={() => openService(service)}
              >
                <div className="absolute inset-0"><LazyImage src={service.image} alt={service.name} className="w-full h-full" /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-3.5 left-3.5 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ background: ACCENT, color: BG }}>
                    <Sparkles className="w-3 h-3" /> NEW
                  </span>
                </div>

                <div className="absolute top-3.5 right-3.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleToggleFavorite(service.id)} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' }}>
                    <Heart className="w-4 h-4" style={isFavorite(String(service.id)) ? { fill: ACCENT, color: ACCENT } : { color: 'white' }} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <p style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>{service.category}</p>
                  <h3 style={{ fontFamily: CORMORANT, fontSize: '1.4rem', fontWeight: 500, color: '#fff', marginBottom: 4 }}>{service.name}</h3>
                  <div className="flex items-center gap-3">
                    <span style={{ fontFamily: INTER, fontSize: '0.85rem', fontWeight: 600, color: ACCENT }}>{formatPrice(service.price)}</span>
                    {service.oldPrice && (
                      <span style={{ fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>{formatPrice(service.oldPrice)}</span>
                    )}
                    <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>· {service.duration}</span>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        <div className="px-5 py-8">
          <div className="flex items-end justify-between mb-5">
            <div>
              <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Выбор клиентов</span>
              <h2 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Популярные <span style={{ fontStyle: 'italic' }}>процедуры</span></h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {popular.map((service, idx) => (
              <m.div
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="cursor-pointer active:scale-[0.97]"
                style={{ transition: 'transform 0.15s ease' }}
                onClick={() => openService(service)}
              >
                <div className="relative rounded-2xl overflow-hidden mb-2" style={{ aspectRatio: '3/4' }}>
                  <LazyImage src={service.image} alt={service.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute top-2.5 right-2.5" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleToggleFavorite(service.id)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
                      <Heart className="w-3.5 h-3.5" style={isFavorite(String(service.id)) ? { fill: ACCENT, color: ACCENT } : { color: 'white' }} />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                      <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)' }}>{service.rating}</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: ACCENT, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>{service.category}</p>
                <p style={{ fontFamily: CORMORANT, fontSize: '0.95rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }} className="truncate">{service.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 600, color: ACCENT }}>{formatPrice(service.price)}</span>
                  <span style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{service.duration}</span>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-6">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}15` }}>
                <span style={{ fontFamily: INTER, fontSize: '0.7rem', fontWeight: 700, color: ACCENT }}>АК</span>
              </div>
              <div>
                <p style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Анастасия К.</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontFamily: CORMORANT, fontSize: '1rem', fontStyle: 'italic', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)' }}>
              «Невероятный уровень сервиса. Мастер подобрала идеальную форму — я получаю комплименты каждый день. Вернусь обязательно.»
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: BG }}>
        <DemoSidebar menuItems={sidebarMenuItems} isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open} accentColor={ACCENT} title="GLOW SPA" subtitle="Салон красоты" />

        <div className="px-5 pt-4 pb-3 demo-nav-safe">
          <div className="flex items-center justify-between mb-4">
            <h1 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff' }}>Каталог <span style={{ fontStyle: 'italic' }}>услуг</span></h1>
            <button onClick={sidebar.open} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><rect width="16" height="1.2" rx="0.6" fill="white" fillOpacity="0.5" /><rect y="4" width="10" height="1.2" rx="0.6" fill="white" fillOpacity="0.5" /><rect y="8" width="13" height="1.2" rx="0.6" fill="white" fillOpacity="0.5" /></svg>
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Поиск по услугам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white placeholder:text-white/30 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)', fontFamily: INTER, fontSize: '0.8rem' }}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 -mx-5 px-5 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3.5 py-2 rounded-full whitespace-nowrap transition-all duration-200"
                style={{
                  fontFamily: INTER, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em',
                  background: selectedCategory === cat ? ACCENT : 'rgba(255,255,255,0.04)',
                  color: selectedCategory === cat ? BG : 'rgba(255,255,255,0.5)',
                  border: selectedCategory === cat ? 'none' : '0.5px solid rgba(255,255,255,0.06)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 grid grid-cols-2 gap-3">
          {filteredServices.map((service, idx) => (
            <m.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              className="cursor-pointer active:scale-[0.97]"
              style={{ transition: 'transform 0.15s ease' }}
              onClick={() => openService(service)}
            >
              <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: idx % 3 === 0 ? '3/4.5' : '3/4' }}>
                <LazyImage src={service.image} alt={service.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                <div className="absolute top-2 left-2 flex gap-1.5">
                  {service.isNew && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background: ACCENT, color: BG }}>New</span>
                  )}
                  {service.isPopular && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>Top</span>
                  )}
                </div>

                <div className="absolute top-2 right-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleToggleFavorite(service.id)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}>
                    <Heart className="w-3.5 h-3.5" style={isFavorite(String(service.id)) ? { fill: ACCENT, color: ACCENT } : { color: 'white' }} />
                  </button>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <p style={{ fontFamily: CORMORANT, fontSize: '0.9rem', fontWeight: 500, color: '#fff' }} className="truncate">{service.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span style={{ fontFamily: INTER, fontSize: '0.75rem', fontWeight: 600, color: ACCENT }}>{formatPrice(service.price)}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                      <span style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>{service.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: BG }}>
        <div className="px-5 pt-4 demo-nav-safe">
          <h1 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff' }}>Мои <span style={{ fontStyle: 'italic' }}>записи</span></h1>
        </div>

        <div className="px-5 pt-4 space-y-4">
          {cart.length === 0 ? (
            <EmptyState type="cart" title="Нет активных записей" description="Выберите процедуру из каталога" />
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id + (item.size || '')} className="rounded-2xl p-4 flex gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <LazyImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: CORMORANT, fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }} className="truncate">{item.name}</p>
                    <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{item.color} · {item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span style={{ fontFamily: INTER, fontSize: '0.85rem', fontWeight: 600, color: ACCENT }}>{formatPrice(item.price)}</span>
                      <button onClick={() => removeFromCart(item.id, item.size, item.color)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <X className="w-3.5 h-3.5 text-white/50" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: INTER, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Итого:</span>
                  <span style={{ fontFamily: CORMORANT, fontSize: '1.5rem', fontWeight: 600, color: ACCENT }}>{formatPrice(cartTotal)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-2xl font-semibold active:scale-[0.97]"
                  style={{ fontFamily: INTER, fontSize: '0.85rem', background: ACCENT, color: BG, transition: 'transform 0.15s ease' }}
                >
                  Подтвердить запись
                </button>
              </div>
            </>
          )}
        </div>

        <CheckoutDrawer isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} items={cart} total={cartTotal} onOrderComplete={handleCheckout} storeName="GLOW SPA" />
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: BG }}>
        <div className="px-5 pt-6 demo-nav-safe">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}, #B8A8C9)` }}>
              <User className="w-10 h-10" style={{ color: BG }} />
            </div>
            <h2 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff' }}>Анастасия</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: `${ACCENT}20`, color: ACCENT, border: `0.5px solid ${ACCENT}30` }}>
                Gold клиент
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: String(ordersCount), label: 'Визитов' },
              { value: '15%', label: 'Скидка' },
              { value: String(favoritesCount), label: 'Избранное' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-3.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: CORMORANT, fontSize: '1.4rem', fontWeight: 600, color: ACCENT }}>{stat.value}</p>
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {[
              { icon: Gift, label: 'Бонусная программа', badge: '2 400 баллов' },
              { icon: Calendar, label: 'История записей', badge: ordersCount > 0 ? `${ordersCount}` : undefined },
              { icon: Heart, label: 'Избранные процедуры' },
              { icon: MapPin, label: 'Наш адрес' },
              { icon: Settings, label: 'Настройки' },
            ].map((item, i) => (
              <button key={i} className="w-full p-4 rounded-xl flex items-center gap-3 active:scale-[0.98]" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', transition: 'transform 0.15s ease' }}>
                <item.icon className="w-5 h-5" style={{ color: ACCENT }} />
                <span className="flex-1 text-left" style={{ fontFamily: INTER, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `${ACCENT}15`, color: ACCENT }}>{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function BeautyWithTheme(props: BeautyProps) {
  return (
    <DemoThemeProvider themeId="beauty">
      <Beauty {...props} />
    </DemoThemeProvider>
  );
}

export default memo(BeautyWithTheme);
