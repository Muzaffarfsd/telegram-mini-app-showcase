import { useState, useEffect, useRef, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Watch, TrendingUp, Award, Search, Menu, Home, Grid, Tag, Plus, Minus, Clock, Droplets, Gem, Gauge, Sparkles, Truck, ShieldCheck } from "lucide-react";
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
    description: 'Легендарные дайверские часы с безупречным мануфактурным калибром 3235. Корпус Oyster из коррозионностойкой стали 904L отполирован вручную до зеркального блеска. Однонаправленный вращающийся безель Cerachrom с 60-минутной шкалой, устойчивой к царапинам и УФ-излучению. Циферблат с люминесцентным покрытием Chromalight обеспечивает читаемость на глубине до 300 метров.',
    category: 'Rolex', 
    inStock: 3, 
    rating: 4.9, 
    movement: 'Автоматический', 
    waterResistance: '300м', 
    material: 'Сталь 904L', 
    diameter: '40мм',
    heritage: 'Икона подводных исследований с 1953 года. Покорял глубины Марианской впадины с Жаком Пикаром. Каждый экземпляр проходит 15-этапный контроль качества на мануфактуре в Биле. Запас хода 70 часов.',
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
    description: 'Квинтэссенция женевского часового искусства. Мануфактурный калибр 240 толщиной всего 2.53мм — шедевр миниатюризации. Корпус из 18-каратного белого золота с ручной полировкой Côtes de Genève. Циферблат из эмали grand feu с позолоченными стрелками-дофинами. Задняя крышка из сапфирового стекла открывает вид на 161 деталь механизма.',
    category: 'Patek', 
    inStock: 2, 
    rating: 4.95, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Белое золото', 
    diameter: '39мм',
    heritage: 'Воплощение философии «Вы никогда не владеете Patek Philippe, вы лишь храните его для следующего поколения». Мануфактура в Женеве с 1839 года. Знак качества Patek Philippe Seal превышает стандарты Женевского клейма.',
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
    description: 'Moonwatch — единственные часы, побывавшие на Луне. Новый мануфактурный калибр Co-Axial Master Chronometer 3861 с антимагнитной защитой до 15,000 гаусс. Асимметричный корпус Hesalite защищает механизм. Тахиметрическая шкала Dot Over Ninety — точная реплика модели 1969 года. Сертификация METAS подтверждает хронометрическую точность.',
    category: 'Omega', 
    inStock: 5, 
    rating: 4.8, 
    movement: 'Механический', 
    waterResistance: '50м', 
    material: 'Сталь', 
    diameter: '42мм',
    heritage: 'Лунная одиссея с 1969 года. Единственные часы, прошедшие все испытания NASA для космических миссий. Были на запястье Базза Олдрина во время высадки на Луну. Производятся в Биле, Швейцария с использованием оригинальных спецификаций.',
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
    description: 'Первые в мире наручные часы, созданные для авиатора. Запатентованная система QuickSwitch позволяет менять браслет без инструментов за секунды. Калибр 1847 MC с автоподзаводом и запасом хода 42 часа. Безель с 8 винтами — визитная карточка модели с 1904 года. Заводная головка с синим сапфиром-кабошоном.',
    category: 'Cartier', 
    inStock: 4, 
    rating: 4.7, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь', 
    diameter: '39.8мм',
    heritage: 'Революция в мире часов с 1904 года. Луи Картье создал эту модель специально для своего друга — бразильского авиатора Альберто Сантос-Дюмона, чтобы тот мог следить за временем, не отрывая рук от штурвала аэроплана.',
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
    description: 'Шедевр Джеральда Дженты — часы, изменившие индустрию. Интегрированный браслет с полированными центральными звеньями и сатинированными боковыми. Циферблат Grande Tapisserie с 380 гранями, вырезанными вручную. Мануфактурный калибр 4302 с 70-часовым запасом хода. Восьмиугольный безель с 8 шестигранными белыми золотыми винтами.',
    category: 'Люкс', 
    inStock: 2, 
    rating: 4.92, 
    movement: 'Автоматический', 
    waterResistance: '50м', 
    material: 'Сталь', 
    diameter: '41мм',
    heritage: 'Le Brassus, Швейцария с 1875 года. Royal Oak представлен в 1972 году — первые стальные часы класса люкс. Корпус толщиной 9.8мм требует 40 часов ручной обработки. Каждый экземпляр собирает один мастер-часовщик.',
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
    description: 'Архетип классических часов с мгновенным переключением даты в полночь. Рифленый безель из 18-каратного белого золота — 68 желобков ручной работы. Юбилейный браслет с пятью звеньями и скрытой застежкой Crownclasp. Калибр 3235 с синей спиралью Parachrom и запасом хода 70 часов.',
    category: 'Rolex', 
    inStock: 6, 
    rating: 4.85, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь и золото', 
    diameter: '41мм',
    heritage: 'Первые часы с автоматическим индикатором даты в окошке, 1945 год. Увеличительная линза Cyclops с 2.5-кратным увеличением — изобретение Rolex. Выбор президентов, актёров и лидеров бизнеса на протяжении 80 лет.',
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
    description: 'Арт-деко икона с уникальным переворачивающимся корпусом. Калибр 822/2 с ручным заводом и 45-часовым запасом хода. Корпус из 18-каратного розового золота с ручной полировкой всех граней. Оборотная сторона — чистое поле для персональной гравировки или второй циферблат с мировым временем.',
    category: 'Люкс', 
    inStock: 3, 
    rating: 4.85, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Розовое золото', 
    diameter: '26мм x 42мм',
    heritage: 'Создан в 1931 году для игроков в поло — корпус переворачивался для защиты стекла во время матча. Мануфактура в Валле-де-Жу производит более 1000 различных калибров. Мастера тратят 8 месяцев на обучение искусству ручной полировки.',
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
    description: 'Эталон минималистской элегантности. Ультратонкий калибр 1120 толщиной 2.45мм — один из тончайших автоматических механизмов в мире. Корпус из 18-каратного розового золота толщиной всего 8.1мм. Циферблат с гильоше и позолоченными часовыми метками. Женевское клеймо Hallmark of Geneva гарантирует высочайшее качество отделки.',
    category: 'Люкс', 
    inStock: 1, 
    rating: 4.9, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Розовое золото', 
    diameter: '40мм',
    heritage: 'Старейшая часовая мануфактура мира, работающая без перерыва с 1755 года. Эмблема Мальтийского креста символизирует механизм с барабаном. Каждый хронометр собирается одним мастером на протяжении нескольких месяцев.',
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
    description: 'Профессиональный инструмент для глубоководных погружений. Калибр Co-Axial Master Chronometer 8800 с антимагнитной защитой до 15,000 гаусс. Керамический безель с эмалевой шкалой на жидком металле. Гелиевый клапан для декомпрессии при глубоководных работах. Волнообразный лазерный узор на циферблате.',
    category: 'Omega', 
    inStock: 7, 
    rating: 4.75, 
    movement: 'Автоматический', 
    waterResistance: '300м', 
    material: 'Сталь', 
    diameter: '42мм',
    heritage: 'Официальные часы Джеймса Бонда с 1995 года, появившиеся в 12 фильмах об агенте 007. Линейка Seamaster существует с 1948 года. Используются Королевским военно-морским флотом Великобритании и профессиональными дайверами по всему миру.',
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
    description: 'Геометрический шедевр Луи Картье, вдохновлённый силуэтом танка Renault. Корпус из 18-каратного жёлтого золота с характерными вертикальными «бранкардами» — боковыми стержнями, образующими ушки для ремешка. Заводная головка украшена синим сапфиром-кабошоном. Римские цифры и стрелки в стиле Breguet.',
    category: 'Cartier', 
    inStock: 5, 
    rating: 4.8, 
    movement: 'Кварцевый', 
    waterResistance: '30м', 
    material: 'Желтое золото', 
    diameter: '29.5 x 22мм',
    heritage: 'Созданы в 1917 году, когда Луи Картье увидел танки на параде в честь победы в Первой мировой войне. Любимые часы принцессы Дианы, Энди Уорхола, Жаклин Кеннеди, Мухаммеда Али. Более 30 вариаций дизайна за 100+ лет.',
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
    description: 'Легендарный инструмент для путешественников с отображением трёх часовых поясов одновременно. Двунаправленный поворотный безель Cerachrom с 24-часовой шкалой. Калибр 3285 с запасом хода 70 часов и инновационной спиралью Chronergy. Стрелка GMT красного цвета для второго часового пояса.',
    category: 'Rolex', 
    inStock: 4, 
    rating: 4.88, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь и золото', 
    diameter: '40мм',
    heritage: 'Разработаны в 1955 году совместно с авиакомпанией Pan Am для пилотов трансконтинентальных рейсов. Культовый двухцветный безель «Pepsi» — сине-красный, «Batman» — сине-чёрный, «Root Beer» — коричнево-золотой. Символ золотой эры авиации.',
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
    description: 'Святой Грааль современного коллекционирования. Калибр 26-330 S C с микроротором из 22-каратного золота и 45-часовым запасом хода. Циферблат с горизонтальным рельефом — каждая линия гравируется отдельно. Корпус с «ушами» в форме иллюминатора. Интегрированный браслет с закруглёнными звеньями.',
    category: 'Patek', 
    inStock: 1, 
    rating: 4.98, 
    movement: 'Автоматический', 
    waterResistance: '120м', 
    material: 'Сталь', 
    diameter: '40мм',
    heritage: 'Шедевр Джеральда Дженты, нарисованный на салфетке в 1976 году. Листы ожидания превышают 10 лет. Цена на вторичном рынке в 3-5 раз выше розничной. Производство ограничено несколькими тысячами экземпляров в год.',
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
    description: 'Вершина саксонского часового искусства. Калибр L121.1 с ручным заводом, трёхчетвертной платиной из нейзильбера и мостами с ручной гравировкой. Большая дата из двух дисков с мгновенным переключением — 2.5-кратно крупнее стандартной. Эксцентричный циферблат с асимметричной компоновкой.',
    category: 'Люкс', 
    inStock: 2, 
    rating: 4.95, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Розовое золото', 
    diameter: '38.5мм',
    heritage: 'Гласхютте, Саксония — возрождение легенды в 1994 году Вальтером Ланге. Каждый механизм дважды собирается: первый раз — для регулировки, затем разбирается, полируется и собирается заново. Традиция двойной сборки уникальна для бренда.',
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
    description: 'Символ хронометрической точности с культовыми «когтями» на корпусе. Калибр Co-Axial 8900 Master Chronometer с антимагнитной защитой. Циферблат «pie-pan» с куполообразной центральной частью. Задняя крышка с медальоном обсерватории Женевы и восемью звёздами — символ рекордов точности.',
    category: 'Omega', 
    inStock: 8, 
    rating: 4.65, 
    movement: 'Автоматический', 
    waterResistance: '50м', 
    material: 'Сталь и золото', 
    diameter: '38мм',
    heritage: 'С 1952 года — синоним точности. Восемь звёзд на задней крышке символизируют рекорды точности, установленные на обсерватории Кью-Теддингтон. Четыре «когтя» — функциональный элемент, прижимающий сапфировое стекло к корпусу.',
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
    description: 'Скульптурный дизайн, вдохновлённый воздушными шарами. Калибр 1847 MC с автоподзаводом и 42-часовым запасом хода. Заводная головка с синим сапфиром-кабошоном, интегрированная в изгиб корпуса. Выпуклое сапфировое стекло без искажений. Римские цифры и стрелки в стиле «меч».',
    category: 'Cartier', 
    inStock: 6, 
    rating: 4.72, 
    movement: 'Автоматический', 
    waterResistance: '30м', 
    material: 'Сталь', 
    diameter: '42мм',
    heritage: 'Современная классика Maison Cartier с 2007 года. Название «Синий шар» отсылает к первому воздушному шару братьев Монгольфье 1783 года. Заводная головка защищена выпуклым элементом корпуса — инновационное решение бренда.',
    complications: ['Дата', 'Защищенная заводная головка'],
    colorHex: '#C0C0C0',
    isNew: true
  },
  { 
    id: 16, 
    name: 'Rolex Daytona', 
    brand: 'Rolex', 
    price: 1665000, 
    oldPrice: 1920000,
    image: 'https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&h=1200&fit=crop&q=90', 
    description: 'Хронограф для гонщиков, ставший иконой стиля. Мануфактурный калибр 4130 с вертикальной муфтой сцепления — всего 290 деталей вместо стандартных 400+. Тахиметрическая шкала на монолитном безеле Cerachrom чёрного цвета. Три счётчика: 30 минут, 12 часов и малые секунды.',
    category: 'Rolex', 
    inStock: 2, 
    rating: 4.93, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь', 
    diameter: '40мм',
    heritage: 'Названы в честь гоночной трассы Daytona International Speedway. Пол Ньюман носил Daytona ежедневно 35 лет — его экземпляр продан за $17.8 млн в 2017 году, став самыми дорогими наручными часами в мире. Лист ожидания — до 7 лет.',
    complications: ['Хронограф', 'Тахиметр', 'Три субциферблата'],
    colorHex: '#1A1A1A',
    isTrending: true,
    strapTypes: ['Браслет', 'Каучук']
  },
  { 
    id: 17, 
    name: 'Breguet Tradition', 
    brand: 'Breguet', 
    price: 2340000, 
    image: 'https://images.unsplash.com/photo-1614946389545-cda9c9a48c9a?w=800&h=1200&fit=crop&q=90', 
    description: 'Открытый механизм в традициях Абрахама-Луи Бреге. Калибр 505 SR1 с кремниевой спиралью и анкерным спуском. Ручная гильоширование каждого циферблата требует 45 часов работы. Мосты и колонки расположены на лицевой стороне, демонстрируя красоту механизма.',
    category: 'Люкс', 
    inStock: 2, 
    rating: 4.88, 
    movement: 'Механический', 
    waterResistance: '30м', 
    material: 'Белое золото', 
    diameter: '40мм',
    heritage: 'Абрахам-Луи Бреге (1747-1823) — отец современного часового дела. Изобретатель турбийона, стрелок Breguet, гильоше-гравировки. Клиенты: Мария-Антуанетта, Наполеон, Черчилль. Мануфактура в Валле-де-Жу с 1775 года.',
    complications: ['Открытый баланс', 'Силиконовая спираль', 'Ручное гильоше'],
    colorHex: '#2D2D2D',
    isNew: true
  },
  { 
    id: 18, 
    name: 'Zenith El Primero', 
    brand: 'Zenith', 
    price: 756000, 
    oldPrice: 890000,
    image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&h=1200&fit=crop&q=90', 
    description: 'Первый автоматический хронограф в истории часового дела. Калибр El Primero с частотой 36,000 вибраций в час — точность до 1/10 секунды. Трёхцветные субциферблаты — визитная карточка модели. Открытый баланс на 10 часах.',
    category: 'Спорт', 
    inStock: 5, 
    rating: 4.8, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь', 
    diameter: '42мм',
    heritage: 'Легендарный калибр 1969 года спасён часовщиком Шарлем Вермо, спрятавшим чертежи и инструменты от уничтожения во время кварцевого кризиса. Использовался в часах Rolex Daytona ref. 16520 в 1988-2000 годах.',
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
    description: 'Наследие Rolex в более доступном формате. Мануфактурный калибр MT5602 с 70-часовым запасом хода, сертифицированный COSC. Куполообразное сапфировое стекло в стиле 1950-х. Заклёпочный браслет — точная реплика винтажных моделей. Фирменные стрелки «snowflake» с люминесцентным покрытием.',
    category: 'Спорт', 
    inStock: 10, 
    rating: 4.6, 
    movement: 'Автоматический', 
    waterResistance: '200м', 
    material: 'Сталь', 
    diameter: '41мм',
    heritage: 'Tudor основан Гансом Вильсдорфом, создателем Rolex, в 1946 году. Black Bay возрождает дизайн-коды винтажных дайверов 1950-х. Официальные часы Военно-морского флота Франции. Лучшее соотношение цена/качество в сегменте люкс.',
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
    description: 'Профессиональный навигационный инструмент для пилотов. Калибр 32110 с автоподзаводом и 72-часовым запасом хода. Корпус из мягкого железа образует клетку Фарадея для защиты от магнитных полей. Коническая заводная головка для управления в перчатках. Циферблат с максимальной читаемостью.',
    category: 'Авиация', 
    inStock: 6, 
    rating: 4.6, 
    movement: 'Автоматический', 
    waterResistance: '60м', 
    material: 'Сталь', 
    diameter: '43мм',
    heritage: 'Шаффхаузен, Швейцария с 1868 года. Пилотские часы IWC использовались Люфтваффе с 1936 года. Большая заводная головка и лаконичный циферблат — наследие B-Uhr (Beobachtungsuhr), навигационных часов военных пилотов.',
    complications: ['Дата', 'Антимагнитная защита', 'Треугольная метка 12ч'],
    colorHex: '#1A1A1A'
  }
];

const categories = ['Все', 'Rolex', 'Omega', 'Cartier', 'Patek', 'Люкс', 'Спорт'];
const brandFilters = ['All', 'Rolex', 'Omega', 'Cartier', 'Patek'];

const mockWatchReviews = [
  {
    author: 'Михаил Р.',
    initials: 'МР',
    rating: 5,
    date: '15 янв. 2026',
    text: 'Невероятное качество исполнения — каждая деталь продумана до мелочей. Механизм работает безупречно, ход точнейший. На руке сидят идеально, вес ощущается премиально. Браслет регулируется без люфтов. Это не просто часы, это произведение искусства.',
    verified: true,
  },
  {
    author: 'Андрей В.',
    initials: 'АВ',
    rating: 5,
    date: '28 дек. 2025',
    text: 'Долго выбирал между несколькими моделями — и не пожалел о выборе ни на секунду. Циферблат играет на свету совершенно по-разному. Заводная головка ходит мягко и чётко. Водозащита проверена лично — часы выдержали погружение без проблем.',
    verified: true,
  },
  {
    author: 'Елена С.',
    initials: 'ЕС',
    rating: 4,
    date: '5 дек. 2025',
    text: 'Покупала мужу в подарок — эмоции были невероятные. Упаковка безупречная, часы потрясающе выглядят на руке. Единственное — пришлось подождать несколько недель, но ожидание того стоило. Обязательно вернусь за новой моделью.',
    verified: true,
  },
];

function TimeElite({ activeTab, onTabChange }: TimeEliteProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedStrap, setSelectedStrap] = useState<string>('');
  const [productExiting, setProductExiting] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [activeProductTab, setActiveProductTab] = useState<'specs' | 'heritage' | 'reviews'>('specs');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const productScrollRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  
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

  const productPageVariants = {
    initial: { opacity: 0, y: 28, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 40, scale: 0.975 },
  };

  const contentStagger = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.055, delayChildren: 0.15 },
    },
  };

  const contentItem = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as number[] } },
  };

  const { filteredItems, handleSearch } = useFilter({
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

  const handleProductBack = () => {
    setProductExiting(true);
    setTimeout(() => {
      setProductExiting(false);
      setSelectedProduct(null);
    }, 340);
  };

  const openProduct = (product: Product) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedProduct(product);
    setSelectedStrap(product.strapTypes?.[0] || 'Браслет');
    setActiveProductTab('specs');
    setShowStickyHeader(false);
    if (heroImageRef.current) heroImageRef.current.style.transform = '';
    if (productScrollRef.current) productScrollRef.current.scrollTop = 0;
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
    handleProductBack();
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

  /* ────────────────────────────────────────────────────────────
     PRODUCT DETAIL PAGE — Time Elite Signature
  ──────────────────────────────────────────────────────────── */
  if (activeTab === 'catalog' && selectedProduct) {
    const bgColor = selectedProduct.colorHex || '#1A1A1A';
    const accentColor = '#D4AF37';
    const discountPct = selectedProduct.oldPrice
      ? Math.round((1 - selectedProduct.price / selectedProduct.oldPrice) * 100)
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
                    fontFamily: "'Inter', system-ui, sans-serif",
                    marginBottom: '1px',
                  }}>
                    {selectedProduct.brand}
                  </p>
                  <p style={{
                    fontSize: '15px', fontWeight: 300, fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.95)', letterSpacing: '0.01em',
                    fontFamily: "'Playfair Display', Georgia, serif",
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {selectedProduct.name}
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

        <div
          ref={productScrollRef}
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ paddingBottom: '220px' }}
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
              initial={{ scale: 1.06, filter: 'brightness(0.72)' }}
              animate={productExiting
                ? { scale: 1.04, filter: 'brightness(0.55)' }
                : { scale: 1, filter: 'brightness(1)' }}
              transition={{ duration: productExiting ? 0.32 : 0.65, ease: [0.32, 0.72, 0, 1] }}
            >
              <LazyImage
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </m.div>
          </div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 40%, ${bgColor}F0 100%)`,
            }}
          />

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
              onClick={(e) => { e.stopPropagation(); handleToggleFavorite(selectedProduct.id); }}
              className="w-11 h-11 rounded-[14px] flex items-center justify-center active:scale-95 transition-all duration-200"
              style={{
                background: isFavorite(selectedProduct.id)
                  ? 'linear-gradient(145deg, rgba(212,175,55,0.35) 0%, rgba(212,175,55,0.15) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.2) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: isFavorite(selectedProduct.id)
                  ? `0.5px solid ${accentColor}80`
                  : '0.5px solid rgba(255,255,255,0.5)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              }}
              data-testid={`button-favorite-${selectedProduct.id}`}
            >
              <Heart
                className="w-5 h-5"
                style={{ color: isFavorite(selectedProduct.id) ? accentColor : 'rgba(0,0,0,0.75)' }}
                fill={isFavorite(selectedProduct.id) ? accentColor : 'none'}
                strokeWidth={2}
              />
            </button>
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-2 flex-wrap">
            {selectedProduct.isNew && (
              <div
                className="flex items-center px-3 py-1.5 rounded-full"
                style={{
                  background: accentColor,
                  boxShadow: `0 4px 12px ${accentColor}55`,
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', color: '#000', textTransform: 'uppercase', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  НОВИНКА · SS'26
                </span>
              </div>
            )}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(10px)',
                border: `0.5px solid ${accentColor}40`,
              }}
            >
              <Watch style={{ width: '12px', height: '12px', color: accentColor }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: accentColor, textTransform: 'uppercase', fontFamily: "'Inter', system-ui, sans-serif" }}>
                {selectedProduct.category}
              </span>
            </div>
            {selectedProduct.inStock <= 5 && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.18)', border: '0.5px solid rgba(239,68,68,0.4)' }}
              >
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Осталось {selectedProduct.inStock} шт.
                </span>
              </div>
            )}
          </div>
        </div>

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
                padding: '28px 20px 32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '26px',
                background: `linear-gradient(180deg, ${bgColor}EE 0%, #0A0A0A 110px, #0A0A0A 100%)`,
                borderTop: `0.5px solid ${accentColor}30`,
              }}
            >

              <m.div variants={contentItem}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <p style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.32em',
                    textTransform: 'uppercase', color: accentColor,
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}>
                    {selectedProduct.brand}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} style={{ width: '10px', height: '10px' }}
                        fill={s <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.85)' : 'transparent'}
                        stroke={s <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
                      />
                    ))}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginLeft: '4px' }}>
                      {selectedProduct.rating}
                    </span>
                  </div>
                </div>

                <h2 style={{
                  fontSize: '34px', fontWeight: 300, fontStyle: 'italic',
                  letterSpacing: '0.01em', lineHeight: 1.1,
                  color: 'rgba(255,255,255,0.97)', marginBottom: '14px',
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}>
                  {selectedProduct.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <p style={{
                    fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', system-ui, sans-serif",
                    color: 'rgba(255,255,255,0.97)', lineHeight: 1,
                  }}>
                    {formatPrice(selectedProduct.price)}
                  </p>
                  {selectedProduct.oldPrice && (
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through', fontFamily: "'Inter', system-ui, sans-serif" }}>
                      {formatPrice(selectedProduct.oldPrice)}
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
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      −{discountPct}%
                    </div>
                  )}
                </div>
              </m.div>

              <m.div variants={contentItem}>
                <p style={{
                  fontSize: '13px',
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.55)',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 400,
                  letterSpacing: '0.01em',
                  borderLeft: `2px solid ${accentColor}55`,
                  paddingLeft: '12px',
                }}>
                  {selectedProduct.description}
                </p>
              </m.div>

              {selectedProduct.strapTypes && selectedProduct.strapTypes.length > 0 && (
                <m.div variants={contentItem}>
                  <p style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                    marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif",
                  }}>
                    Тип ремешка
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedProduct.strapTypes.map((strap) => {
                      const isSelected = selectedStrap === strap;
                      return (
                        <button
                          key={strap}
                          onClick={() => setSelectedStrap(strap)}
                          className="active:scale-95 transition-all duration-200"
                          style={{
                            padding: '10px 18px', borderRadius: '12px',
                            fontSize: '12px', fontWeight: 700,
                            letterSpacing: '0.03em', fontFamily: "'Inter', system-ui, sans-serif",
                            color: isSelected ? '#000' : 'rgba(255,255,255,0.55)',
                            background: isSelected ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}BB 100%)` : 'rgba(255,255,255,0.06)',
                            border: isSelected ? `0.5px solid ${accentColor}80` : '0.5px solid rgba(255,255,255,0.1)',
                            boxShadow: isSelected ? `0 4px 16px ${accentColor}30` : 'none',
                          }}
                          aria-pressed={isSelected}
                          data-testid={`button-strap-${strap.toLowerCase()}`}
                        >
                          {strap}
                        </button>
                      );
                    })}
                  </div>
                </m.div>
              )}

              <m.div variants={contentItem} style={{ borderBottom: `0.5px solid rgba(255,255,255,0.1)` }}>
                <div style={{ display: 'flex', position: 'relative' }} role="tablist">
                  {[
                    { key: 'specs', label: 'Характеристики' },
                    { key: 'heritage', label: 'Наследие' },
                    { key: 'reviews', label: `Отзывы (${mockWatchReviews.length})` },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveProductTab(tab.key as typeof activeProductTab)}
                      className="flex-1 transition-all duration-200 relative"
                      style={{
                        padding: '12px 4px 13px',
                        fontSize: '11px',
                        fontWeight: activeProductTab === tab.key ? 700 : 500,
                        color: activeProductTab === tab.key ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.4)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontFamily: "'Inter', system-ui, sans-serif",
                        background: 'transparent',
                      }}
                      role="tab"
                      aria-selected={activeProductTab === tab.key}
                      data-testid={`tab-${tab.key}`}
                    >
                      {tab.label}
                      {activeProductTab === tab.key && (
                        <m.div
                          layoutId="tab-underline-timeelite"
                          className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                          style={{ background: accentColor }}
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </m.div>

              <div>
                <AnimatePresence mode="wait">
                {activeProductTab === 'specs' && (
                <m.div key="specs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[
                        { icon: <Clock style={{ width: '18px', height: '18px', color: accentColor }} />, label: 'Механизм', value: selectedProduct.movement },
                        { icon: <Droplets style={{ width: '18px', height: '18px', color: accentColor }} />, label: 'Водозащита', value: selectedProduct.waterResistance },
                        { icon: <Gem style={{ width: '18px', height: '18px', color: accentColor }} />, label: 'Материал', value: selectedProduct.material },
                        { icon: <Gauge style={{ width: '18px', height: '18px', color: accentColor }} />, label: 'Диаметр', value: selectedProduct.diameter },
                      ].map((spec, idx) => (
                        <div key={idx} style={{
                          padding: '16px', borderRadius: '16px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '0.5px solid rgba(255,255,255,0.08)',
                          textAlign: 'center',
                        }}>
                          <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                            {spec.icon}
                          </div>
                          <p style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '6px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {spec.label}
                          </p>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: 'rgba(255,255,255,0.92)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {spec.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        Усложнения
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedProduct.complications.map((comp, idx) => (
                          <div key={idx} style={{
                            padding: '7px 14px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: 600,
                            color: accentColor,
                            background: `${accentColor}15`,
                            border: `0.5px solid ${accentColor}35`,
                            fontFamily: "'Inter', system-ui, sans-serif",
                            letterSpacing: '0.02em',
                          }}>
                            {comp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </m.div>
                )}

                {activeProductTab === 'heritage' && (
                <m.div key="heritage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '18px 20px', borderRadius: '16px', background: `linear-gradient(135deg, ${accentColor}08 0%, rgba(255,255,255,0.02) 100%)`, border: `0.5px solid ${accentColor}20` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <Award style={{ width: '16px', height: '16px', color: accentColor }} />
                        <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: accentColor, fontFamily: "'Inter', system-ui, sans-serif" }}>
                          Наследие бренда
                        </p>
                      </div>
                      <p style={{ fontSize: '15px', lineHeight: 1.72, color: 'rgba(255,255,255,0.72)', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400, letterSpacing: '0.01em' }}>
                        "{selectedProduct.heritage}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { label: 'Бренд', value: selectedProduct.brand },
                        { label: 'Категория', value: selectedProduct.category },
                        { label: 'Механизм', value: selectedProduct.movement },
                        { label: 'Водозащита', value: selectedProduct.waterResistance },
                        { label: 'Материал', value: selectedProduct.material },
                        { label: 'Диаметр', value: selectedProduct.diameter },
                        { label: 'В наличии', value: `${selectedProduct.inStock} шт.` },
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
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>{item.label}</span>
                          {item.value === '__stars__' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1,2,3,4,5].map(s => (
                                  <Star key={s} style={{ width: '11px', height: '11px' }}
                                    fill={s <= Math.round(selectedProduct.rating) ? accentColor : 'transparent'}
                                    stroke={s <= Math.round(selectedProduct.rating) ? accentColor : 'rgba(255,255,255,0.2)'}
                                  />
                                ))}
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', fontFamily: "'Inter', system-ui, sans-serif" }}>{selectedProduct.rating}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.88)', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif" }}>{item.value}</span>
                          )}
                        </div>
                      ))}
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
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className="w-4 h-4"
                              fill={s <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.95)' : 'transparent'}
                              stroke={s <= Math.round(selectedProduct.rating) ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)'}
                            />
                          ))}
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontFamily: "'Inter', system-ui, sans-serif" }}>{selectedProduct.rating}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif" }}>{mockWatchReviews.length} отзывов</span>
                    </div>

                    {mockWatchReviews.map((review, idx) => (
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
                            <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor, fontFamily: "'Inter', system-ui, sans-serif" }}>{review.initials}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontFamily: "'Inter', system-ui, sans-serif" }}>{review.author}</p>
                              {review.verified && (
                                <span style={{ fontSize: '9px', fontWeight: 700, color: accentColor, letterSpacing: '0.1em', fontFamily: "'Inter', system-ui, sans-serif" }}>✓ ВЕРИФИЦИРОВАН</span>
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
                              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>{review.text}</p>
                      </div>
                    ))}
                  </div>
                </m.div>
                )}
                </AnimatePresence>
              </div>

              <m.div variants={contentItem} style={{ marginTop: '6px' }}>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '20px' }} />
                <div style={{
                  display: 'flex', alignItems: 'stretch',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '0.5px solid rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}>
                  {[
                    { icon: <Truck style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Доставка', sub: '1-3 дня' },
                    { icon: <ShieldCheck style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Гарантия', sub: '2 года' },
                    { icon: <Award style={{ width: '15px', height: '15px', color: accentColor }} strokeWidth={1.5} />, label: 'Подлинность', sub: 'Сертификат' },
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
                        fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1,
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: '9px', color: 'rgba(255,255,255,0.35)',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}>
                        {item.sub}
                      </p>
                    </div>
                  ))}
                </div>
              </m.div>

              {(() => {
                const recommended = products
                  .filter(p => p.id !== selectedProduct.id)
                  .sort((a, b) => {
                    const sameCat = (a.category === selectedProduct.category ? 1 : 0) - (b.category === selectedProduct.category ? 1 : 0);
                    const sameBrand = (a.brand === selectedProduct.brand ? 1 : 0) - (b.brand === selectedProduct.brand ? 1 : 0);
                    return -(sameCat + sameBrand);
                  })
                  .slice(0, 6);
                if (recommended.length === 0) return null;
                return (
                  <m.div variants={contentItem} style={{ marginTop: '6px' }}>
                    <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
                      <p style={{
                        fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em',
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                        fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap',
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
                            setSelectedProduct(p);
                            setSelectedStrap(p.strapTypes?.[0] || 'Браслет');
                            setActiveProductTab('specs');
                            setTimeout(() => productScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
                          }}
                          className="cursor-pointer active:scale-95 transition-all duration-200"
                          style={{ width: '120px', flexShrink: 0 }}
                          data-testid={`recommended-product-${p.id}`}
                        >
                          <div style={{
                            width: '120px', height: '140px', borderRadius: '14px',
                            overflow: 'hidden', marginBottom: '8px', position: 'relative',
                            background: 'rgba(255,255,255,0.05)',
                          }}>
                            <LazyImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            {p.isNew && (
                              <div style={{
                                position: 'absolute', top: '6px', left: '6px',
                                padding: '2px 7px', borderRadius: '6px',
                                fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                                background: accentColor, color: '#000',
                                fontFamily: "'Inter', system-ui, sans-serif",
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
                            fontFamily: "'Inter', system-ui, sans-serif",
                            marginBottom: '3px',
                          }}>
                            {p.brand}
                          </p>
                          <p style={{
                            fontSize: '13px', fontWeight: 300, fontStyle: 'italic',
                            color: 'rgba(255,255,255,0.88)', lineHeight: 1.25,
                            fontFamily: "'Playfair Display', Georgia, serif",
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
                            fontFamily: "'Inter', system-ui, sans-serif",
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
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#000', letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  В корзину
                </span>
                <div style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.2)', margin: '0 4px' }} />
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#000', fontVariantNumeric: 'tabular-nums', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  {formatPrice(selectedProduct.price)}
                </span>
              </button>
            }
            title="Добавить в корзину?"
            description={`${selectedProduct.name} • ${selectedProduct.material}${selectedProduct.strapTypes?.length ? ` • ${selectedStrap}` : ''}`}
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
            title="TIME"
            subtitle="ELITE"
            accentColor="var(--theme-primary)"
            bgColor="var(--theme-background)"
          />

          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center justify-between">
              <button
                onClick={sidebar.open}
                className="w-10 h-10 flex items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
                aria-label="Меню"
                data-testid="button-view-menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="text-[19px] font-black tracking-[0.22em] leading-none" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
                  TIME
                </div>
                <div className="text-[13px] font-medium tracking-[0.35em] leading-none mt-0.5" style={{ color: '#D4AF37', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  ELITE · COLLECTION
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
                      style={{ background: '#D4AF37' }}>
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <input
                type="text"
                placeholder="Поиск часов, брендов..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
                className="bg-transparent text-white placeholder:text-white/35 outline-none flex-1 text-sm"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                data-testid="input-search"
              />
            </div>

            <div className="flex items-center gap-1 mt-4">
              {brandFilters.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className="relative px-3 py-1.5 text-sm transition-all"
                  data-testid={`button-filter-${brand.toLowerCase()}`}
                  style={{
                    color: selectedBrand === brand ? '#fff' : 'rgba(255,255,255,0.32)',
                    fontWeight: selectedBrand === brand ? 700 : 400,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    letterSpacing: selectedBrand === brand ? '-0.01em' : '0',
                  }}
                  aria-pressed={selectedBrand === brand}
                >
                  {brand === 'All' ? 'Все' : brand}
                  {selectedBrand === brand && (
                    <m.div
                      layoutId="brand-underline-timeelite"
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ background: '#D4AF37' }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

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
                  {['TIME ELITE', '✦', 'SWISS MADE', '✦', 'HAUTE HORLOGERIE', '✦', 'LUXURY TIMEPIECES', '✦', 'MANUFACTURES SUISSES', '✦', 'ÉDITION LIMITÉE', '✦'].map((word, wi) => (
                    <span key={wi} className="text-[10px] font-semibold tracking-[0.25em] uppercase"
                      style={{ color: word === '✦' ? '#D4AF37' : 'rgba(255,255,255,0.35)' }}>
                      {word}
                    </span>
                  ))}
                </span>
              ))}
            </m.div>
          </div>

          <div className="relative mx-4 mt-3 rounded-[26px] overflow-hidden" style={{ height: '410px' }}>
            <div className="absolute inset-0">
              <LazyImage
                src={filteredProducts[0]?.image || products[0].image}
                alt="Featured Watch"
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.05) 32%, rgba(0,0,0,0.65) 68%, rgba(0,0,0,0.93) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 55%)' }} />

            <div className="absolute top-4 left-4">
              <span className="text-[9px] font-bold tracking-[0.35em] uppercase px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)', color: 'rgba(255,255,255,0.75)', border: '0.5px solid rgba(255,255,255,0.18)' }}>
                SS&apos;26
              </span>
            </div>

            <div className="absolute top-4 right-4 text-right">
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>VOL.I</p>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>№001</p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <m.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ lineHeight: 0.9, marginBottom: '10px' }}>
                  <div style={{ fontSize: '50px', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', display: 'block' }}>
                    SWISS
                  </div>
                  <div style={{ fontSize: '50px', fontWeight: 100, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic', fontFamily: "'Playfair Display', Georgia, serif", display: 'block' }}>
                    excellence
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-5">
                  <button
                    onClick={() => onTabChange?.('catalog')}
                    className="px-5 py-2.5 rounded-full text-[13px] font-black text-black transition-all active:scale-95"
                    style={{ background: '#D4AF37', letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif" }}
                    data-testid="button-view-featured"
                  >
                    Смотреть →
                  </button>
                  <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    Весна — Лето 2026
                  </p>
                </div>
              </m.div>
            </div>
          </div>

          <div className="px-4 mt-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div>
                <p className="text-[8px] font-semibold tracking-[0.35em] uppercase text-center mb-0.5"
                  style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Коллекция сезона
                </p>
                <h2 className="leading-none text-center"
                  style={{ fontSize: '32px', fontWeight: 300, letterSpacing: '0.08em', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>
                  Collection du Moment
                </h2>
              </div>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {(() => {
              const featured = filteredProducts.find(p => p.isTrending && p.isNew) ?? filteredProducts[0] ?? products[0];
              return (
                <m.div
                  whileTap={{ scale: 0.985 }}
                  onClick={() => openProduct(featured)}
                  className="relative cursor-pointer rounded-[22px] overflow-hidden"
                  style={{ height: '300px' }}
                  data-testid={`featured-product-${featured.id}`}
                >
                  <img src={featured.image} alt={featured.name} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.85) 100%)' }} />

                  <div className="absolute top-3.5 left-3.5">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold"
                      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.15)', color: '#D4AF37', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      {featured.category}
                    </span>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }}
                    className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                    data-testid={`button-favorite-featured-${featured.id}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(featured.id) ? 'fill-white text-white' : 'text-white'}`} />
                  </button>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '4px' }}>
                          {featured.brand}
                        </p>
                        <p style={{ fontSize: '26px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: '#fff', fontFamily: "'Playfair Display', Georgia, serif" }}>
                          {featured.name}
                        </p>
                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                          {featured.movement} · {featured.diameter}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.03em' }}>
                          {formatPrice(featured.price)}
                        </p>
                        {featured.oldPrice && (
                          <p style={{ fontSize: '12px', textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
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

          <div className="mt-10 px-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '4px',
                }}>
                  Новинки
                </p>
                <h3 style={{
                  fontSize: '22px', fontWeight: 300, fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.92)',
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}>
                  Just Arrived
                </h3>
              </div>
              <button
                onClick={() => onTabChange?.('catalog')}
                style={{
                  fontSize: '11px', color: '#D4AF37', fontWeight: 600,
                  letterSpacing: '0.05em', fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                Все →
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {filteredProducts.filter(p => p.isNew).slice(0, 8).map((product) => (
                <div
                  key={product.id}
                  onClick={() => openProduct(product)}
                  className="cursor-pointer active:scale-[0.97] transition-all duration-200 flex-shrink-0"
                  style={{ width: '148px' }}
                  data-testid={`new-product-${product.id}`}
                >
                  <div style={{
                    width: '148px', height: '168px', borderRadius: '16px',
                    overflow: 'hidden', position: 'relative', marginBottom: '10px',
                    background: 'rgba(255,255,255,0.05)',
                  }}>
                    <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      padding: '3px 8px', borderRadius: '7px',
                      fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                      background: '#D4AF37', color: '#000',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      NEW
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                      data-testid={`button-favorite-${product.id}`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-white text-white' : 'text-white'}`} />
                    </button>
                  </div>
                  <p style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em',
                    color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                    fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '3px',
                  }}>
                    {product.brand}
                  </p>
                  <p style={{
                    fontSize: '14px', fontWeight: 300, fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.9)', lineHeight: 1.2,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    marginBottom: '5px',
                  }}>
                    {product.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{
                      fontSize: '13px', fontWeight: 800, letterSpacing: '-0.02em',
                      color: 'rgba(255,255,255,0.88)',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      {formatPrice(product.price)}
                    </p>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1,2,3,4,5].map(s => (
                        <div key={s} style={{ width: '5px', height: '5px', borderRadius: '50%', background: s <= Math.round(product.rating) ? '#D4AF37' : 'rgba(255,255,255,0.15)' }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 px-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '4px',
                }}>
                  Хиты продаж
                </p>
                <h3 style={{
                  fontSize: '22px', fontWeight: 300, fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.92)',
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}>
                  Bestsellers
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.filter(p => p.isTrending).slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  onClick={() => openProduct(product)}
                  className="cursor-pointer active:scale-[0.97] transition-all duration-200"
                  data-testid={`trending-product-${product.id}`}
                >
                  <div style={{
                    height: '200px', borderRadius: '16px', overflow: 'hidden',
                    position: 'relative', marginBottom: '10px',
                    background: 'rgba(255,255,255,0.05)',
                  }}>
                    <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
                        fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '2px',
                      }}>
                        {product.brand}
                      </p>
                      <p style={{
                        fontSize: '15px', fontWeight: 300, fontStyle: 'italic',
                        color: '#fff', lineHeight: 1.15,
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}>
                        {product.name}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
                      data-testid={`button-favorite-${product.id}`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-white text-white' : 'text-white'}`} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <p style={{
                      fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em',
                      color: 'rgba(255,255,255,0.92)',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}>
                      {formatPrice(product.price)}
                    </p>
                    {product.oldPrice && (
                      <p style={{
                        fontSize: '11px', color: 'rgba(255,255,255,0.3)',
                        textDecoration: 'line-through',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}>
                        {formatPrice(product.oldPrice)}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '1.5px' }}>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} style={{ width: '9px', height: '9px' }}
                          fill={s <= Math.round(product.rating) ? '#D4AF37' : 'transparent'}
                          stroke={s <= Math.round(product.rating) ? '#D4AF37' : 'rgba(255,255,255,0.2)'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 600 }}>
                      {product.rating}
                    </span>
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
    return (
        <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5"
                  style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                  Time Elite
                </p>
                <h1 style={{ fontSize: '26px', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.02em' }}>
                  Каталог
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  aria-label="Поиск" data-testid="button-view-search">
                  <Search className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-full"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                  aria-label="Фильтр" data-testid="button-view-filter">
                  <Filter className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="flex-shrink-0 rounded-full whitespace-nowrap transition-all active:scale-95"
                    style={{
                      padding: '7px 13px',
                      background: active ? '#D4AF37' : 'rgba(212,175,55,0.1)',
                      color: active ? '#000' : 'rgba(255,255,255,0.75)',
                      border: active ? 'none' : '0.5px solid rgba(212,175,55,0.2)',
                      fontSize: '11px', fontWeight: active ? 700 : 600,
                      letterSpacing: '0.04em', fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    aria-pressed={active}
                    data-testid={`button-filter-${cat.toLowerCase()}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <p className="mt-3 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'модель' : filteredProducts.length < 5 ? 'модели' : 'моделей'}
            </p>
          </div>

          <div className="px-4 space-y-3 pb-2">
            {(() => {
              const rows: React.ReactNode[] = [];
              let i = 0;
              let groupIdx = 0;
              while (i < filteredProducts.length) {
                const featured = filteredProducts[i];
                const discountFeatured = featured.oldPrice ? Math.round((1 - featured.price / featured.oldPrice) * 100) : 0;
                rows.push(
                  <m.div
                    key={`featured-${featured.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIdx * 0.1 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => openProduct(featured)}
                    className="relative cursor-pointer rounded-[20px] overflow-hidden"
                    style={{ height: '280px' }}
                    data-testid={`product-card-${featured.id}`}
                  >
                    <LazyImage src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                      {featured.isNew && (
                        <span className="px-2 py-1 text-[9px] font-black rounded-full tracking-[0.08em] uppercase text-black"
                          style={{ background: '#D4AF37' }}>NEW</span>
                      )}
                    </div>

                    <div className="absolute top-3.5 right-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFavorite(featured.id); }}
                        aria-label="Избранное"
                        className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                        data-testid={`button-favorite-catalog-${featured.id}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite(featured.id) ? 'fill-white' : ''} text-white`} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-end justify-between">
                        <div className="flex-1 mr-3">
                          <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {featured.brand}
                          </p>
                          <p style={{ fontSize: '18px', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.02em', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.15 }}>
                            {featured.name}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                            {formatPrice(featured.price)}
                          </p>
                          {featured.oldPrice && (
                            <p className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                              {formatPrice(featured.oldPrice)}
                            </p>
                          )}
                          {discountFeatured > 0 && (
                            <span className="inline-block text-[9px] font-black text-black mt-1 px-1.5 py-0.5 rounded-md" style={{ background: '#D4AF37', fontFamily: "'Inter', system-ui, sans-serif" }}>
                              −{discountFeatured}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </m.div>
                );
                i++;

                const pair = filteredProducts.slice(i, i + 2);
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
                            onClick={() => openProduct(product)}
                            className="cursor-pointer"
                            data-testid={`product-card-${product.id}`}
                          >
                            <div className="relative rounded-[18px] overflow-hidden mb-2.5"
                              style={{ height: colIdx === 0 ? '210px' : '178px' }}>
                              <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                              <div className="absolute top-2 right-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(product.id); }}
                                  aria-label="Избранное"
                                  className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                                  style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.18)' }}
                                  data-testid={`button-favorite-catalog-${product.id}`}
                                >
                                  <Heart className={`w-3 h-3 ${isFavorite(product.id) ? 'fill-white' : ''} text-white`} />
                                </button>
                              </div>

                              {discountPair > 0 && (
                                <div className="absolute top-2 left-2">
                                  <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md text-black"
                                    style={{ background: '#D4AF37', fontFamily: "'Inter', system-ui, sans-serif" }}>
                                    −{discountPair}%
                                  </span>
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-[8px] font-semibold tracking-[0.22em] uppercase mb-0.5 truncate"
                                style={{ color: 'rgba(255,255,255,0.38)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                                {product.brand}
                              </p>
                              <p style={{ fontSize: '13px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.2, marginBottom: '4px', fontFamily: "'Playfair Display', Georgia, serif", color: 'rgba(255,255,255,0.9)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                                {product.name}
                              </p>
                              <div className="flex items-baseline gap-1.5 mb-1">
                                <span className="text-[13px] font-bold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                                  {formatPrice(product.price)}
                                </span>
                                {product.oldPrice && (
                                  <span className="text-[10px] line-through" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                                    {formatPrice(product.oldPrice)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <div key={star} className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: star <= Math.round(product.rating) ? '#D4AF37' : 'rgba(255,255,255,0.15)' }} />
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

          {filteredProducts.length === 0 && (
            <m.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center py-20 px-8 text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(212,175,55,0.1)', border: '0.5px solid rgba(212,175,55,0.25)' }}>
                <Search className="w-6 h-6" style={{ color: '#D4AF37' }} />
              </div>
              <p style={{ fontSize: '20px', fontWeight: 300, fontStyle: 'italic', letterSpacing: '0.02em', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: '8px', color: 'rgba(255,255,255,0.85)' }}>
                Ничего не найдено
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.6, marginBottom: '20px' }}>
                Попробуйте изменить фильтры
              </p>
              <button
                onClick={() => { setSelectedCategory('Все'); }}
                className="px-6 py-2.5 rounded-full text-[12px] font-bold tracking-[0.05em] transition-all active:scale-95"
                style={{ background: '#D4AF37', color: '#000', fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                Сбросить фильтры
              </button>
            </m.div>
          )}
        </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     CART PAGE — Editorial
  ──────────────────────────────────────────────────────────── */
  if (activeTab === 'cart') {
    return (
        <div className="min-h-screen bg-[var(--theme-background)] text-white pb-32 smooth-scroll-page">
          <div className="px-5 pt-5 pb-3">
            <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5"
              style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
              Time Elite
            </p>
            <h1 style={{ fontSize: '26px', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.02em' }}>
              Корзина
            </h1>
          </div>

          <div className="px-5">
            {cart.length === 0 ? (
              <EmptyState
                type="cart"
                actionLabel="В каталог"
                onAction={() => onTabChange?.('catalog')}
                className="py-20"
              />
            ) : (
              <>
                <AnimatePresence>
                  {cart.map((item) => {
                    const productRef = products.find(p => String(p.id) === item.id);
                    return (
                      <m.div
                        key={`${item.id}-${item.size}-${item.color}`}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -60, transition: { duration: 0.25 } }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-3"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '14px', display: 'flex', gap: '14px' }}
                        data-testid={`cart-item-${item.id}`}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: '76px', height: '76px', borderRadius: '14px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {productRef && (
                            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', marginBottom: '2px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                              {productRef.brand}
                            </p>
                          )}
                          <p style={{ fontSize: '16px', fontWeight: 300, fontStyle: 'italic', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.2, marginBottom: '3px', color: 'rgba(255,255,255,0.95)' }}>
                            {item.name}
                          </p>
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '10px' }}>
                            {item.color}{item.size ? ` · ${item.size}` : ''}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <p style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.025em', fontFamily: "'Inter', system-ui, sans-serif", color: 'rgba(255,255,255,0.97)' }}>
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', borderRadius: '22px', overflow: 'hidden', border: '0.5px solid rgba(255,255,255,0.12)' }}>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}
                                aria-label="Уменьшить количество" data-testid={`button-decrease-${item.id}`}
                              >
                                <Minus style={{ width: '12px', height: '12px' }} />
                              </button>
                              <span style={{ minWidth: '26px', textAlign: 'center', fontSize: '14px', fontWeight: 700, fontFamily: "'Inter', system-ui, sans-serif", color: 'rgba(255,255,255,0.9)' }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}
                                aria-label="Увеличить количество" data-testid={`button-increase-${item.id}`}
                              >
                                <Plus style={{ width: '12px', height: '12px' }} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          style={{ width: '30px', height: '30px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', alignSelf: 'flex-start' }}
                          aria-label="Удалить из корзины" data-testid={`button-remove-${item.id}`}
                        >
                          <X style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.4)' }} />
                        </button>
                      </m.div>
                    );
                  })}
                </AnimatePresence>

                <div style={{ marginTop: '16px', padding: '20px', borderRadius: '20px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '16px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    Состав заказа
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        Товары ({cartCount})
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: "'Inter', system-ui, sans-serif" }}>Доставка</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#34D399', fontFamily: "'Inter', system-ui, sans-serif" }}>Бесплатно</span>
                    </div>
                    <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em', fontFamily: "'Inter', system-ui, sans-serif" }}>Итого</span>
                      <span style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: "'Inter', system-ui, sans-serif" }}>
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 40px', background: 'linear-gradient(0deg, var(--theme-background) 55%, transparent 100%)' }}>
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full rounded-[18px] font-black transition-all active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(135deg, #D4BC3E 0%, #D4AF37 50%, #B8A02E 100%)',
                  color: '#000', fontSize: '15px', fontFamily: "'Inter', system-ui, sans-serif",
                  letterSpacing: '-0.01em', padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  boxShadow: '0 8px 32px rgba(212,175,55,0.25)',
                }}
                data-testid="button-checkout"
              >
                <span>Оформить заказ</span>
                <span style={{ opacity: 0.55 }}>·</span>
                <span>{formatPrice(cartTotal)}</span>
              </button>
            </div>
          )}

          <CheckoutDrawer
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            items={cart.map(item => ({ id: Number(item.id), name: item.name, price: item.price, quantity: item.quantity, size: item.size, color: item.color, image: item.image }))}
            total={cartTotal}
            currency="₽"
            onOrderComplete={handleCheckout}
            storeName="TIME ELITE"
          />
        </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     PROFILE PAGE — Editorial
  ──────────────────────────────────────────────────────────── */
  if (activeTab === 'profile') {
    const totalSpent = orders.reduce((acc, o) => acc + o.total, 0);
    const tier = totalSpent >= 500000 ? 'ELITE PLATINUM' : totalSpent >= 100000 ? 'ELITE GOLD' : 'ELITE MEMBER';
    const tierColor = totalSpent >= 500000 ? '#E8E8E8' : '#D4AF37';
    const statusLabel: Record<string, string> = { pending: 'Обработка', confirmed: 'Подтверждён', processing: 'В пути', shipped: 'Доставляется', delivered: 'Доставлен' };
    const statusColor: Record<string, string> = { pending: 'rgba(255,255,255,0.35)', confirmed: '#60A5FA', processing: '#F97316', shipped: '#F59E0B', delivered: '#34D399' };

    return (
        <div className="min-h-screen bg-[var(--theme-background)] text-white pb-24 smooth-scroll-page">

          <div style={{ position: 'relative', overflow: 'hidden', padding: '36px 20px 28px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(212,175,55,0.07) 0%, transparent 55%), linear-gradient(225deg, rgba(212,175,55,0.04) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '0.5px', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />

            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #8A7420 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 0 3px rgba(212,175,55,0.2), 0 0 0 6px rgba(212,175,55,0.07)',
                }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: '#000', fontFamily: "'Inter', system-ui, sans-serif", letterSpacing: '-0.03em' }}>АП</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '2px' }}>
                  Александр Петров
                </h2>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '10px' }}>
                  +7 (999) 123-45-67
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: `${tierColor}15`, border: `0.5px solid ${tierColor}35` }}>
                  <Sparkles style={{ width: '9px', height: '9px', color: tierColor }} />
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.22em', color: tierColor, fontFamily: "'Inter', system-ui, sans-serif", textTransform: 'uppercase' }}>
                    {tier}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Заказы', value: String(ordersCount) },
                { label: 'Избранное', value: String(favoritesCount) },
                { label: 'Потрачено', value: totalSpent > 0 ? `${Math.round(totalSpent / 1000)}К` : '0' },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: '14px 10px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: "'Inter', system-ui, sans-serif", color: '#D4AF37', lineHeight: 1, marginBottom: '5px' }}>
                    {stat.value}
                  </p>
                  <p style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '0 20px' }} />

          {orders.length > 0 && (
            <div style={{ padding: '20px 20px 4px' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                Последние заказы
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {orders.slice(0, 3).map((order) => {
                  const st = order.status ?? 'delivered';
                  return (
                    <div key={order.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }} data-testid={`order-${order.id}`}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', border: '0.5px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package style={{ width: '18px', height: '18px', color: '#D4AF37' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', system-ui, sans-serif", color: 'rgba(255,255,255,0.9)', marginBottom: '2px' }}>
                          № {order.id.slice(-6).toUpperCase()}
                        </p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                          {order.items.length} {order.items.length === 1 ? 'товар' : order.items.length < 5 ? 'товара' : 'товаров'} · {formatPrice(order.total)}
                        </p>
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 9px', borderRadius: '20px', background: `${statusColor[st]}18`, color: statusColor[st], fontFamily: "'Inter', system-ui, sans-serif", flexShrink: 0 }}>
                        {statusLabel[st] ?? 'Доставлен'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ padding: orders.length > 0 ? '12px 20px 0' : '20px 20px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { icon: <Heart style={{ width: '18px', height: '18px' }} />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined, testId: 'button-favorites' },
              { icon: <MapPin style={{ width: '18px', height: '18px' }} />, label: 'Адреса доставки', testId: 'button-address' },
              { icon: <Package style={{ width: '18px', height: '18px' }} />, label: 'Мои заказы', badge: ordersCount > 0 ? String(ordersCount) : undefined, testId: 'button-orders' },
              { icon: <CreditCard style={{ width: '18px', height: '18px' }} />, label: 'Способы оплаты', testId: 'button-payment' },
              { icon: <Settings style={{ width: '18px', height: '18px' }} />, label: 'Настройки', testId: 'button-settings' },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full transition-all active:scale-[0.98]"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)' }}
                aria-label={item.label}
                data-testid={item.testId}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.88)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                    {item.label}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.badge && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: 'rgba(212,175,55,0.15)', color: '#D4AF37', fontFamily: "'Inter', system-ui, sans-serif" }}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronLeft style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.2)', transform: 'rotate(180deg)' }} />
                </div>
              </button>
            ))}

            <button
              className="w-full transition-all active:scale-[0.98]"
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', borderRadius: '18px', background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.15)' }}
              data-testid="button-logout"
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut style={{ width: '18px', height: '18px', color: 'rgba(239,68,68,0.8)' }} />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(239,68,68,0.85)', fontFamily: "'Inter', system-ui, sans-serif" }}>
                Выйти из аккаунта
              </span>
            </button>
          </div>

          <div style={{ height: '20px' }} />
        </div>
    );
  }

  return null;
}

function TimeEliteWithTheme(props: TimeEliteProps) {
  return (
    <DemoThemeProvider themeId="timeElite">
      <TimeElite {...props} />
    </DemoThemeProvider>
  );
}

export default memo(TimeEliteWithTheme);
