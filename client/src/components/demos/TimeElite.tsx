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
import { LazyImage, UrgencyIndicator, TrustBadges } from "@/components/shared";
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
    image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=800&h=1200&fit=crop&q=90', 
    description: 'Легендарный хронограф для автоспорта. Калибр 4130 — полностью мануфактурный хронографный механизм с вертикальным сцеплением и колонным колесом. Тахиметрический безель Cerachrom с чёрной керамической вставкой. Три контрастных субциферблата для измерения интервалов до 12 часов.',
    category: 'Rolex', 
    inStock: 2, 
    rating: 4.93, 
    movement: 'Автоматический', 
    waterResistance: '100м', 
    material: 'Сталь', 
    diameter: '40мм',
    heritage: 'Названы в честь гонок Daytona 500 во Флориде. Модель Paul Newman с экзотическим циферблатом продана на аукционе за $17.8 млн — рекорд для наручных часов. Листы ожидания в официальных бутиках превышают 5 лет.',
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
    description: 'Спортивный люкс для нового поколения коллекционеров. Калибр 324 S C с золотым микроротором и 45-часовым запасом хода. Рельефный циферблат с узором «embossed» в виде неправильных квадратов. Ремешок «Tropical» из композитного материала — устойчив к солёной воде, UV-излучению и разрыву.',
    category: 'Patek', 
    inStock: 3, 
    rating: 4.87, 
    movement: 'Автоматический', 
    waterResistance: '120м', 
    material: 'Сталь', 
    diameter: '40мм',
    heritage: 'Запущен в 1997 году как более доступная альтернатива Nautilus. Сегодня столь же желанен, как старший брат. Форма корпуса напоминает очертания гранаты — символ взрывного успеха модели. Производится в ограниченных количествах.',
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
    description: 'Первый в мире автоматический хронограф с высокой частотой. Калибр El Primero 400 работает на частоте 36,000 полуколебаний в час — точность до 1/10 секунды. Открытый баланс на циферблате демонстрирует биение сердца механизма. Трёхцветные субциферблаты — визитная карточка модели.',
    category: 'Хронографы', 
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

          <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
            <div className="max-w-md mx-auto">
              <div 
                className="rounded-2xl border border-[#D4AF37]/30 p-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(212,175,55,0.15) 0%, rgba(10,10,10,0.95) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <ConfirmDrawer
                  trigger={
                    <button
                      className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C4A030] text-black font-bold py-4 rounded-full hover:opacity-90 transition-all"
                      style={{ boxShadow: '0 4px 20px rgba(212,175,55,0.4)' }}
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
              </div>
            </div>
          </div>
        </div>
    );
  }

  if (activeTab === 'home') {
    return (
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
    );
  }

  if (activeTab === 'catalog') {
    return (
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
    );
  }

  if (activeTab === 'cart') {
    return (
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
    );
  }

  if (activeTab === 'profile') {
    return (
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
    );
  }

  return null;
}

export default TimeElite;
