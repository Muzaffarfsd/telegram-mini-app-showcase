import { useState, useRef, useMemo, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart, Star, ChevronLeft, ChevronRight, Sparkles, Calendar, Clock, User,
  Gift, MapPin, Search, ShoppingBag, Settings,
  Home, Grid, Tag, Scissors, Droplets, Flower2, Hand,
  Truck, ShieldCheck, RotateCcw, X, Check, Phone, ArrowUpDown,
  Award, Crown, ChevronDown, Filter, Eye
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
import glowspaHeroVideo from "@assets/7c2c6d94385a0badd934f87f658b1f46_1774529512637.mp4";
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
import masterAnnaImg from "@assets/glowspa_master_anna.jpg";
import masterMariaImg from "@assets/glowspa_master_maria.jpg";
import masterElenaImg from "@assets/glowspa_master_elena.jpg";
import masterOlgaImg from "@assets/glowspa_master_olga.jpg";
import masterYuliaImg from "@assets/glowspa_master_yulia.jpg";
import masterOlga2Img from "@assets/glowspa_master_olga2.jpg";

const STORE_KEY = 'glowspa-store';

const CORMORANT = '"Cormorant Garamond", Georgia, serif';
const INTER = '"Inter", system-ui, sans-serif';
const ACCENT = '#C9A89B';
const BG = '#0C0A09';

interface BeautyProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

interface ProcessStep {
  title: string;
  detail: string;
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
  durationMin: number;
  specialist: string;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  benefits: string[];
  process: ProcessStep[];
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
    durationMin: 60,
    specialist: 'Анна Смирнова',
    rating: 4.9,
    reviewCount: 127,
    isPopular: true,
    benefits: ['Консультация стилиста', 'Анализ типа волос', 'Укладка включена'],
    process: [
      { title: 'Консультация и диагностика', detail: 'Мастер изучает структуру волос, овал лица и обсуждает ваши пожелания' },
      { title: 'Мытьё с уходом', detail: 'Очищение профессиональным шампунем Davines и питательная маска' },
      { title: 'Стрижка', detail: 'Создание формы с учётом текстуры и направления роста волос' },
      { title: 'Укладка и стайлинг', detail: 'Финальная укладка с рекомендациями по домашнему уходу' },
    ],
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
    durationMin: 240,
    specialist: 'Елена Козлова',
    rating: 4.8,
    reviewCount: 89,
    isPopular: true,
    isNew: true,
    benefits: ['Щадящие формулы без аммиака', 'Естественный результат', 'До 6 месяцев без коррекции'],
    process: [
      { title: 'Диагностика и подбор оттенка', detail: 'Определение исходной базы и желаемого результата по палитре' },
      { title: 'Разделение прядей', detail: 'Точное секционирование для равномерного результата' },
      { title: 'Airtouch осветление', detail: 'Выдувание коротких волос феном, нанесение состава на длинные пряди' },
      { title: 'Тонирование', detail: 'Придание желаемого оттенка безаммиачным красителем' },
      { title: 'Уход и укладка', detail: 'Восстанавливающая маска и финальная укладка' },
    ],
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
    durationMin: 210,
    specialist: 'Мария Петрова',
    rating: 4.9,
    reviewCount: 94,
    isNew: true,
    isPopular: true,
    benefits: ['Авторская техника', 'Натуральный эффект', 'Мягкое отрастание'],
    process: [
      { title: 'Консультация', detail: 'Подбор оттенка и обсуждение желаемого образа' },
      { title: 'Подготовка волос', detail: 'Разделение на секции, защита корней' },
      { title: 'Ручное осветление', detail: 'Нанесение состава свободной техникой мазками кисти' },
      { title: 'Тонирование', detail: 'Создание глубины и многогранности цвета' },
      { title: 'Восстанавливающий уход', detail: 'Молекулярное восстановление и укладка' },
    ],
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
    durationMin: 90,
    specialist: 'Ольга Иванова',
    rating: 4.8,
    reviewCount: 156,
    isPopular: true,
    benefits: ['Премиум гель-лаки Luxio', 'Стойкость до 4 недель', 'SPA-уход для рук'],
    process: [
      { title: 'Снятие старого покрытия', detail: 'Бережное удаление без повреждения ногтевой пластины' },
      { title: 'Аппаратная обработка', detail: 'Формирование архитектуры ногтя и обработка кутикулы' },
      { title: 'SPA-уход', detail: 'Питательная маска и массаж кистей рук' },
      { title: 'Покрытие и сушка', detail: 'Нанесение гель-лака в 3 слоя с LED-сушкой' },
    ],
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
    durationMin: 100,
    specialist: 'Наталья Волкова',
    rating: 4.9,
    reviewCount: 72,
    benefits: ['Ручная прорисовка', 'Укрепление ногтевой пластины', 'Идеальная геометрия'],
    process: [
      { title: 'Подготовка', detail: 'Снятие покрытия и формирование идеальной формы ногтя' },
      { title: 'Формирование архитектуры', detail: 'Выравнивание и укрепление базой' },
      { title: 'Френч прорисовка', detail: 'Ручная прорисовка линии улыбки тонкой кистью №00' },
      { title: 'Топовое покрытие', detail: 'Финишный слой для зеркального блеска и стойкости' },
    ],
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
    durationMin: 100,
    specialist: 'Светлана Белова',
    rating: 4.9,
    reviewCount: 103,
    isPopular: true,
    benefits: ['Ароматерапия', 'Массаж стоп', 'Питательные маски'],
    process: [
      { title: 'Ванночка с маслами', detail: 'Расслабляющая ванна с эфирными маслами лаванды и эвкалипта' },
      { title: 'Пилинг', detail: 'Деликатный пилинг с вулканической пемзой и фруктовыми кислотами' },
      { title: 'Аппаратная обработка', detail: 'Профессиональная обработка стоп и ногтей' },
      { title: 'Маска и массаж', detail: 'Питательная маска с парафином и расслабляющий массаж стоп' },
      { title: 'Покрытие', detail: 'Нанесение гель-лака с долговременной фиксацией' },
    ],
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
    durationMin: 120,
    specialist: 'Анна Смирнова',
    rating: 4.9,
    reviewCount: 68,
    isNew: true,
    benefits: ['Глубокое восстановление', 'Устранение пушистости', 'Термозащита'],
    process: [
      { title: 'Глубокое очищение', detail: 'Шампунь глубокой очистки для раскрытия кутикулы' },
      { title: 'Нанесение состава', detail: 'Распределение кератиново-коллагенового комплекса по длине' },
      { title: 'Выдержка под теплом', detail: 'Активация состава инфракрасным климазоном 20–30 минут' },
      { title: 'Запечатывание утюжком', detail: 'Фиксация результата при температуре 230°C' },
      { title: 'Укладка', detail: 'Финальная укладка и демонстрация результата' },
    ],
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
    durationMin: 75,
    specialist: 'Юлия Титова',
    rating: 4.8,
    reviewCount: 142,
    isPopular: true,
    benefits: ['Без восстановительного периода', 'Видимый результат сразу', 'Глубокое увлажнение'],
    process: [
      { title: 'Демакияж', detail: 'Деликатное снятие макияжа и поверхностных загрязнений' },
      { title: 'Аппаратная эксфолиация', detail: 'Мягкое отшелушивание с одновременным увлажнением' },
      { title: 'Вакуумная экстракция', detail: 'Безболезненное очищение пор без травматизации кожи' },
      { title: 'Насыщение сыворотками', detail: 'Введение антиоксидантов и пептидов через вортекс-технологию' },
      { title: 'Защитный финиш', detail: 'Нанесение SPF-крема и увлажняющей сыворотки' },
    ],
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
    durationMin: 60,
    specialist: 'Валентина Крылова',
    rating: 4.7,
    reviewCount: 53,
    isNew: true,
    benefits: ['Лифтинг без инъекций', 'Улучшение овала лица', 'Моментальный результат'],
    process: [
      { title: 'Очищение кожи', detail: 'Подготовка кожи лица тоником и сывороткой' },
      { title: 'Наружный массаж', detail: 'Проработка поверхностных мышц и лимфодренаж' },
      { title: 'Буккальная техника', detail: 'Глубокая проработка мышц через ротовую полость' },
      { title: 'Сыворотка и маска', detail: 'Коллагеновая маска и лифтинг-сыворотка для закрепления результата' },
    ],
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
    durationMin: 150,
    specialist: 'Ирина Павлова',
    rating: 4.8,
    reviewCount: 87,
    benefits: ['Гипоаллергенный клей', 'Объём 2D-5D', 'Носка до 4 недель'],
    process: [
      { title: 'Подбор эффекта и длины', detail: 'Консультация и выбор объёма, изгиба и длины ресниц' },
      { title: 'Подготовка ресниц', detail: 'Обезжиривание и разделение нижних ресниц патчами' },
      { title: 'Поштучное наращивание', detail: 'Крепление каждой реснички на расстоянии 0.5мм от века' },
      { title: 'Закрепление и расчёсывание', detail: 'Фиксация клея-активатором и придание идеальной формы' },
    ],
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
    durationMin: 90,
    specialist: 'Ольга Смирнова',
    rating: 4.9,
    reviewCount: 201,
    isPopular: true,
    benefits: ['Натуральные масла', 'Индивидуальная техника', 'Полная релаксация'],
    process: [
      { title: 'Подготовка и ароматерапия', detail: 'Выбор эфирного масла и подготовка помещения' },
      { title: 'Разогрев', detail: 'Плавные поглаживания для расслабления и разогрева мышц' },
      { title: 'Основной массаж', detail: 'Глубокая проработка всех мышечных групп авторской техникой' },
      { title: 'Завершающие поглаживания', detail: 'Мягкое завершение для полного расслабления и гармонии' },
    ],
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
    durationMin: 90,
    specialist: 'Мария Петрова',
    rating: 4.7,
    reviewCount: 45,
    benefits: ['Консультация по образу', 'Премиум стайлинг', 'Фиксация на весь вечер'],
    process: [
      { title: 'Мытьё и подготовка', detail: 'Очищение и нанесение текстурирующего спрея' },
      { title: 'Сушка и текстурирование', detail: 'Создание объёма и текстуры брашингом' },
      { title: 'Создание формы', detail: 'Формирование укладки с учётом наряда и образа' },
      { title: 'Фиксация и декор', detail: 'Закрепление формы и добавление аксессуаров' },
    ],
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

const masters = [
  { name: 'Анна Смирнова', role: 'Стилист-колорист', exp: '12 лет', photo: masterAnnaImg, color: '#C9A89B' },
  { name: 'Мария Петрова', role: 'Стилист', exp: '8 лет', photo: masterMariaImg, color: '#D4A0A0' },
  { name: 'Елена Козлова', role: 'Колорист', exp: '10 лет', photo: masterElenaImg, color: '#A8C9B8' },
  { name: 'Ольга Иванова', role: 'Мастер маникюра', exp: '6 лет', photo: masterOlgaImg, color: '#B8A8C9' },
  { name: 'Юлия Титова', role: 'Косметолог', exp: '9 лет', photo: masterYuliaImg, color: '#C9B8A8' },
  { name: 'Ольга Смирнова', role: 'Массажист', exp: '15 лет', photo: masterOlga2Img, color: '#A8B8C9' },
];

const allReviews = [
  { author: 'Анастасия К.', initials: 'АК', rating: 5, date: '15 марта 2026', text: 'Невероятный уровень сервиса. Мастер Анна подобрала идеальную форму стрижки — я получаю комплименты каждый день. Укладка держится даже под дождём. Вернусь обязательно.', verified: true, category: 'Волосы' },
  { author: 'Марина Л.', initials: 'МЛ', rating: 5, date: '2 марта 2026', text: 'Делала балаяж у Марии — это произведение искусства. Цвет играет на солнце как натуральный. За 4 месяца ни разу не пожалела. Салон чистый, атмосфера расслабляющая, чай вкусный.', verified: true, category: 'Волосы' },
  { author: 'Дарья В.', initials: 'ДВ', rating: 5, date: '18 февр. 2026', text: 'HydraFacial — это love forever. Кожа сияет, поры сузились, тон выровнялся. Делаю раз в месяц и забыла, что такое тональный крем. Юлия — профессионал высшего класса.', verified: true, category: 'Лицо' },
  { author: 'Екатерина Р.', initials: 'ЕР', rating: 5, date: '10 марта 2026', text: 'Маникюр у Ольги — это отдельный вид искусства. Френч идеальный, держится 4 недели без единого скола. SPA-уход для рук — потрясающий бонус.', verified: true, category: 'Ногти' },
  { author: 'Алина М.', initials: 'АМ', rating: 5, date: '22 февр. 2026', text: 'Массаж у Ольги Смирновой — лучший в городе. 15 лет опыта чувствуются в каждом движении. Вышла как новый человек. Записалась на абонемент.', verified: true, category: 'Тело' },
  { author: 'Виктория С.', initials: 'ВС', rating: 4, date: '5 марта 2026', text: 'Буккальный массаж — непривычно, но результат поразил! Овал лица подтянулся, носогубки стали менее заметны. Курс из 5 процедур — и подруги спрашивают, что я сделала.', verified: true, category: 'Лицо' },
  { author: 'Ольга Н.', initials: 'ОН', rating: 5, date: '12 марта 2026', text: 'Ботокс для волос — спасение! Волосы были как солома после осветления, а теперь шёлк. Эффект держится уже 2 месяца. Анна — волшебница!', verified: true, category: 'Волосы' },
  { author: 'Наталья Д.', initials: 'НД', rating: 5, date: '20 марта 2026', text: 'SPA педикюр — 100 минут блаженства. Ванночка с эфирными маслами, массаж стоп, идеальное покрытие. После рабочей недели — именно то, что нужно.', verified: true, category: 'Ногти' },
];

type SortMode = 'popular' | 'price_asc' | 'price_desc' | 'rating';
const sortLabels: Record<SortMode, string> = {
  popular: 'Популярные',
  price_asc: 'Цена ↑',
  price_desc: 'Цена ↓',
  rating: 'Рейтинг',
};

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
  const [sortMode, setSortMode] = useState<SortMode>('popular');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [quickViewService, setQuickViewService] = useState<typeof services[0] | null>(null);
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

  const filteredServices = useMemo(() => {
    let result = services.filter(s => {
      const matchCat = selectedCategory === 'Все' || s.category === selectedCategory;
      const matchSearch = !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.specialist.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
    switch (sortMode) {
      case 'price_asc': result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price_desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'rating': result = [...result].sort((a, b) => b.rating - a.rating); break;
      default: result = [...result].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0)); break;
    }
    return result;
  }, [selectedCategory, searchQuery, sortMode]);

  const getServiceReviews = (service: Service) => {
    const categoryReviews = allReviews.filter(r => r.category === service.category);
    return categoryReviews.length > 0 ? categoryReviews : allReviews.slice(0, 3);
  };

  // ───────── SERVICE DETAIL ─────────
  if (activeTab === 'catalog' && selectedService) {
    const catCfg = categoryConfig[selectedService.category];
    const accentColor = catCfg?.color ?? ACCENT;
    const serviceReviews = getServiceReviews(selectedService);

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
                <Heart className="w-4 h-4" style={isFavorite(String(selectedService.id)) ? { fill: accentColor, color: accentColor } : { color: 'rgba(255,255,255,0.6)' }} />
              </button>
            </m.div>
          )}
        </AnimatePresence>

        <div
          ref={productScrollRef}
          className="flex-1 overflow-y-auto overscroll-y-contain"
          onScroll={(e) => {
            const scrollTop = (e.target as HTMLDivElement).scrollTop;
            setShowStickyHeader(scrollTop > 240);
          }}
        >
          <div className="relative" style={{ height: '48vh', minHeight: 320 }}>
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

            <div className="absolute bottom-5 left-5 right-5 z-10">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider" style={{ background: `${accentColor}20`, color: accentColor, border: `0.5px solid ${accentColor}30` }}>
                  {selectedService.category}
                </span>
                {selectedService.isNew && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ background: ACCENT, color: BG }}>
                    <Sparkles className="w-3 h-3" /> NEW
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
            <m.div variants={contentItem} className="flex items-end justify-between mb-4 pt-2">
              <div>
                <span style={{ fontFamily: CORMORANT, fontSize: '1.8rem', fontWeight: 600, color: ACCENT }}>{formatPrice(selectedService.price)}</span>
                <div className="flex items-center gap-1.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5" style={{ fill: i < Math.floor(selectedService.rating) ? '#F59E0B' : 'rgba(255,255,255,0.1)', color: i < Math.floor(selectedService.rating) ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />
                  ))}
                  <span style={{ fontFamily: INTER, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>{selectedService.rating}</span>
                  <span style={{ fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>({selectedService.reviewCount})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Мастер</span>
                  <p style={{ fontFamily: CORMORANT, fontSize: '0.95rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.8)' }}>{selectedService.specialist}</p>
                </div>
              </div>
            </m.div>

            <m.div variants={contentItem} className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <Clock className="w-4 h-4 mb-1.5" style={{ color: accentColor }} />
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Время</p>
                <p style={{ fontFamily: CORMORANT, fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{selectedService.duration}</p>
              </div>
              <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <Star className="w-4 h-4 mb-1.5" style={{ color: accentColor }} />
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Рейтинг</p>
                <p style={{ fontFamily: CORMORANT, fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{selectedService.rating}</p>
              </div>
              <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <User className="w-4 h-4 mb-1.5" style={{ color: accentColor }} />
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Отзывов</p>
                <p style={{ fontFamily: CORMORANT, fontSize: '1rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{selectedService.reviewCount}</p>
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
                  {tab === 'about' ? 'О процедуре' : tab === 'process' ? 'Этапы' : `Отзывы (${serviceReviews.length})`}
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
                      <div className="pb-5 pt-0.5 flex-1">
                        <p style={{ fontFamily: INTER, fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{step.title}</p>
                        <p style={{ fontFamily: INTER, fontSize: '0.78rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{step.detail}</p>
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
                <m.div variants={contentItem} className="flex items-center gap-4 mb-2 p-4 rounded-2xl" style={{ background: `${accentColor}08`, border: `0.5px solid ${accentColor}15` }}>
                  <div className="text-center">
                    <p style={{ fontFamily: CORMORANT, fontSize: '2.2rem', fontWeight: 600, color: ACCENT, lineHeight: 1 }}>{selectedService.rating}</p>
                    <div className="flex items-center gap-0.5 mt-1 justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3" style={{ fill: i < Math.floor(selectedService.rating) ? '#F59E0B' : 'rgba(255,255,255,0.1)', color: i < Math.floor(selectedService.rating) ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                    <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{selectedService.reviewCount} отзывов</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map(stars => {
                      const count = serviceReviews.filter(r => r.rating === stars).length;
                      const pct = serviceReviews.length > 0 ? (count / serviceReviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', width: 8 }}>{stars}</span>
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#F59E0B' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </m.div>

                {serviceReviews.map((review, i) => (
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
              <div className="flex gap-3.5 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-hide">
                {services.filter(s => s.category === selectedService.category && s.id !== selectedService.id).slice(0, 4).map(s => (
                  <div key={s.id} className="flex-shrink-0 cursor-pointer active:scale-[0.97]" style={{ width: 155, transition: 'transform 0.15s ease' }} onClick={() => openService(s)}>
                    <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: '3/4' }}>
                      <LazyImage src={s.image} alt={s.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5" style={{ fill: '#F59E0B', color: '#F59E0B' }} />
                          <span style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)' }}>{s.rating}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontFamily: CORMORANT, fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }} className="truncate">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontFamily: INTER, fontSize: '0.75rem', fontWeight: 600, color: accentColor }}>{formatPrice(s.price)}</span>
                      <span style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>{s.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </m.div>

            <m.div variants={contentItem} className="grid grid-cols-3 gap-3 py-5 mb-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
              {[
                { icon: Truck, label: 'Без ожидания', sublabel: 'Точно по записи' },
                { icon: ShieldCheck, label: 'Стерильность', sublabel: '100% безопасно' },
                { icon: RotateCcw, label: 'Гарантия', sublabel: 'Бесплатная коррекция' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${accentColor}10` }}>
                    <item.icon className="w-4 h-4" style={{ color: accentColor }} />
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                  <span style={{ fontFamily: INTER, fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>{item.sublabel}</span>
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

  // ───────── HOME PAGE ─────────
  if (activeTab === 'home') {
    const featured = services.filter(s => s.isNew).slice(0, 2);
    const popular = services.filter(s => s.isPopular).slice(0, 6);

    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: BG }}>
        <DemoSidebar menuItems={sidebarMenuItems} isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open} accentColor={ACCENT} title="GLOW SPA" subtitle="Салон красоты" />

        <div className="relative overflow-hidden" style={{ height: '70vh', minHeight: 420 }}>
          <div className="absolute inset-0">
            <video
              src={glowspaHeroVideo}
              poster={glowspaHeroImg}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
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
              <button
                onClick={() => onTabChange?.('catalog')}
                className="mt-4 px-6 py-3 rounded-xl font-semibold active:scale-[0.97]"
                style={{ fontFamily: INTER, fontSize: '0.8rem', letterSpacing: '0.04em', background: ACCENT, color: BG, transition: 'transform 0.15s ease' }}
              >
                Смотреть каталог
              </button>
            </m.div>
          </div>
        </div>

        <div className="py-3.5 overflow-hidden" style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between px-5">
            {[
              { icon: ShieldCheck, label: 'Стерильность 100%' },
              { icon: Sparkles, label: 'Премиум косметика' },
              { icon: Star, label: '4.9 ★ рейтинг' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pt-6 pb-2">
          <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${ACCENT}08)`, border: `0.5px solid ${ACCENT}20` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}20` }}>
              <Gift className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: INTER, fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>Первый визит —20%</p>
              <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>На любую процедуру по промокоду GLOW2026</p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>

        <div className="px-5 pt-6 pb-4">
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

                <div className="absolute top-3.5 left-3.5">
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
            <button onClick={() => onTabChange?.('catalog')} style={{ fontFamily: INTER, fontSize: '0.7rem', color: ACCENT, fontWeight: 500 }}>Все →</button>
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
                      <span style={{ fontFamily: INTER, fontSize: '0.55rem', color: 'rgba(255,255,255,0.35)' }}>({service.reviewCount})</span>
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
          <div className="flex items-end justify-between mb-4">
            <div>
              <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Команда</span>
              <h2 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Наши <span style={{ fontStyle: 'italic' }}>мастера</span></h2>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto -mx-5 px-5 pb-2 scrollbar-hide">
            {masters.map((master, i) => (
              <div key={i} className="flex-shrink-0 text-center" style={{ width: 100 }}>
                <div className="w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden" style={{ border: `2px solid ${master.color}40` }}>
                  <img src={master.photo} alt={master.name} className="w-full h-full object-cover" />
                </div>
                <p style={{ fontFamily: INTER, fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{master.name.split(' ')[0]}</p>
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{master.role}</p>
                <p style={{ fontFamily: INTER, fontSize: '0.55rem', color: ACCENT, marginTop: 2 }}>{master.exp}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-6">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Отзывы</span>
              <h2 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Говорят <span style={{ fontStyle: 'italic' }}>клиенты</span></h2>
            </div>
            <span style={{ fontFamily: INTER, fontSize: '0.7rem', color: ACCENT, fontWeight: 500 }}>{allReviews.length} отзывов</span>
          </div>
          <div className="space-y-3">
            {allReviews.slice(0, 3).map((review, i) => (
              <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}15` }}>
                    <span style={{ fontFamily: INTER, fontSize: '0.65rem', fontWeight: 700, color: ACCENT }}>{review.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: INTER, fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{review.author}</span>
                      {review.verified && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: `${ACCENT}15`, color: ACCENT }}>✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-2.5 h-2.5" style={{ fill: j < review.rating ? '#F59E0B' : 'rgba(255,255,255,0.1)', color: j < review.rating ? '#F59E0B' : 'rgba(255,255,255,0.1)' }} />
                      ))}
                      <span style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>{review.date}</span>
                    </div>
                  </div>
                </div>
                <p style={{ fontFamily: CORMORANT, fontSize: '0.95rem', fontStyle: 'italic', lineHeight: 1.55, color: 'rgba(255,255,255,0.6)' }}>
                  «{review.text}»
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 pb-8">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5" style={{ color: ACCENT }} />
              <div>
                <p style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>GlowSpa Studio</p>
                <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>ул. Тверская, 15, Москва</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-5 h-5" style={{ color: ACCENT }} />
              <div>
                <p style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Пн—Сб 9:00 — 21:00</p>
                <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>Вс 10:00 — 20:00</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" style={{ color: ACCENT }} />
              <p style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>+7 (495) 123-45-67</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ───────── CATALOG PAGE ─────────
  if (activeTab === 'catalog') {
    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: BG }}>
        <DemoSidebar menuItems={sidebarMenuItems} isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open} accentColor={ACCENT} title="GLOW SPA" subtitle="Салон красоты" />

        <div className="px-5 pt-5 pb-3 demo-nav-safe">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>GLOW SPA</p>
              <h1 style={{ fontFamily: CORMORANT, fontSize: '30px', fontWeight: 300, letterSpacing: '0.06em', fontStyle: 'italic' }}>Каталог</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchQuery(searchQuery ? '' : ' ')}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={sidebar.open}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.1)' }}
              >
                <Filter className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {searchQuery && (
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                type="text"
                placeholder="Поиск по услугам..."
                value={searchQuery === ' ' ? '' : searchQuery}
                onChange={(e) => setSearchQuery(e.target.value || ' ')}
                autoFocus
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:ring-1"
                style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.06)', fontFamily: INTER, fontSize: '0.8rem', '--tw-ring-color': `${ACCENT}40` } as any}
              />
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all active:scale-95"
                style={{
                  background: selectedCategory === cat ? ACCENT : 'rgba(255,255,255,0.07)',
                  color: selectedCategory === cat ? BG : 'rgba(255,255,255,0.6)',
                  border: selectedCategory === cat ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
                  fontSize: '11px',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  letterSpacing: '0.04em',
                  fontFamily: INTER,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="px-5 pt-12">
            <EmptyState type="search" title="Ничего не найдено" description="Попробуйте изменить запрос или выбрать другую категорию" actionLabel="Сбросить фильтры" onAction={() => { setSearchQuery(''); setSelectedCategory('Все'); }} />
          </div>
        ) : (
          <div className="px-4 space-y-3 pb-2">
            {(() => {
              const rows: React.ReactNode[] = [];
              let i = 0;
              let groupIdx = 0;
              while (i < filteredServices.length) {
                const featured = filteredServices[i];
                const catCfg = categoryConfig[featured.category];
                rows.push(
                  <m.div
                    key={`featured-${featured.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIdx * 0.1 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => openService(featured)}
                    className="relative cursor-pointer rounded-[20px] overflow-hidden"
                    style={{ height: '280px' }}
                  >
                    <LazyImage src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    <div className="absolute top-3.5 left-3.5 flex gap-1.5">
                      {featured.isNew && (
                        <span className="px-2 py-1 text-[9px] font-black rounded-full tracking-[0.08em] uppercase" style={{ background: ACCENT, color: BG }}>NEW</span>
                      )}
                      <span className="px-2 py-1 text-[9px] font-medium rounded-full" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.75)', border: '0.5px solid rgba(255,255,255,0.15)' }}>
                        {featured.category}
                      </span>
                    </div>

                    <div className="absolute top-3.5 right-3.5 flex gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setQuickViewService(featured)}
                        className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                      >
                        <Eye className="w-3.5 h-3.5 text-white" />
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(featured.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all"
                        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)', border: '0.5px solid rgba(255,255,255,0.2)' }}
                      >
                        <Heart className="w-3.5 h-3.5" style={isFavorite(String(featured.id)) ? { fill: ACCENT, color: ACCENT } : { color: 'white' }} />
                      </button>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-end justify-between">
                        <div className="flex-1 mr-3">
                          <p className="text-[9px] font-semibold tracking-[0.25em] uppercase mb-1" style={{ color: catCfg?.color ?? ACCENT }}>{featured.category}</p>
                          <p style={{ fontFamily: CORMORANT, fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.15, color: '#fff' }}>{featured.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: INTER }}>{featured.duration}</span>
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <div key={s} className="w-1.5 h-1.5 rounded-full" style={{ background: s <= Math.round(featured.rating) ? ACCENT : 'rgba(255,255,255,0.15)' }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-bold" style={{ fontFamily: INTER, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', color: '#fff' }}>
                            {formatPrice(featured.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </m.div>
                );
                i++;

                const pair = filteredServices.slice(i, i + 2);
                if (pair.length > 0) {
                  rows.push(
                    <div key={`pair-${groupIdx}`} className="grid grid-cols-2 gap-3">
                      {pair.map((service, colIdx) => {
                        const sCatCfg = categoryConfig[service.category];
                        return (
                          <m.div
                            key={service.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: groupIdx * 0.1 + 0.04 + colIdx * 0.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => openService(service)}
                            className="cursor-pointer"
                          >
                            <div className="relative rounded-[18px] overflow-hidden mb-2.5" style={{ height: colIdx === 0 ? '205px' : '175px' }}>
                              <LazyImage src={service.image} alt={service.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                              <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(service.id); }}
                                  className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                                  style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.18)' }}
                                >
                                  <Heart className="w-3 h-3" style={isFavorite(String(service.id)) ? { fill: ACCENT, color: ACCENT } : { color: 'white' }} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setQuickViewService(service); }}
                                  className="w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all"
                                  style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', border: '0.5px solid rgba(255,255,255,0.18)' }}
                                >
                                  <Eye className="w-3 h-3 text-white" />
                                </button>
                              </div>

                              {service.isNew && (
                                <div className="absolute top-2 left-2">
                                  <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md" style={{ background: ACCENT, color: BG }}>NEW</span>
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="text-[8px] font-semibold tracking-[0.22em] uppercase mb-0.5 truncate" style={{ color: sCatCfg?.color ?? 'rgba(255,255,255,0.38)' }}>
                                {service.category}
                              </p>
                              <p className="text-[12px] font-semibold leading-tight mb-1 truncate" style={{ fontFamily: CORMORANT, fontSize: '0.85rem', fontWeight: 500, letterSpacing: '-0.01em' }}>
                                {service.name}
                              </p>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-[13px] font-bold" style={{ fontFamily: INTER, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', color: ACCENT }}>
                                  {formatPrice(service.price)}
                                </span>
                                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: INTER }}>{service.duration}</span>
                              </div>
                              <div className="flex items-center gap-0.5 mt-1">
                                {[1,2,3,4,5].map(s => (
                                  <div key={s} className="w-1.5 h-1.5 rounded-full" style={{ background: s <= Math.round(service.rating) ? ACCENT : 'rgba(255,255,255,0.15)' }} />
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
        )}

        <AnimatePresence>
          {quickViewService && (() => {
            const qvCatCfg = categoryConfig[quickViewService.category];
            const qvAccent = qvCatCfg?.color ?? ACCENT;
            return (
              <m.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[100] flex items-end justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                onClick={() => setQuickViewService(null)}
              >
                <m.div
                  initial={{ opacity: 0, y: 100, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 100, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] as number[] }}
                  className="w-full max-w-lg rounded-t-[32px] overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, rgba(40,40,40,0.95) 0%, rgba(25,25,25,0.98) 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '0.5px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 -20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                    maxHeight: '70vh',
                    paddingBottom: 'calc(max(24px, env(safe-area-inset-bottom)) + 140px)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
                  </div>

                  <button
                    onClick={() => setQuickViewService(null)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>

                  <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
                    <div style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                      <div style={{ width: '110px', flexShrink: 0, borderRadius: '16px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', aspectRatio: '2/3' }}>
                        <LazyImage src={quickViewService.image} alt={quickViewService.name} className="w-full h-full object-cover" />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '2px', minWidth: 0 }}>
                        <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: qvAccent, marginBottom: '7px', fontFamily: INTER }}>
                          {quickViewService.category}
                        </p>
                        <h3 style={{ fontSize: '21px', fontWeight: 300, fontStyle: 'italic', fontFamily: CORMORANT, letterSpacing: '0.03em', color: 'rgba(255,255,255,0.95)', lineHeight: 1.15, marginBottom: '10px' }}>
                          {quickViewService.name}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '14px' }}>
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} style={{ width: '11px', height: '11px' }}
                              fill={s <= Math.round(quickViewService.rating) ? 'rgba(255,255,255,0.85)' : 'transparent'}
                              stroke={s <= Math.round(quickViewService.rating) ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)'}
                            />
                          ))}
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginLeft: '3px', fontFamily: INTER }}>
                            {quickViewService.rating}
                          </span>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', fontFamily: INTER, color: '#fff' }}>
                            {formatPrice(quickViewService.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', marginBottom: '18px' }} />

                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px', fontFamily: INTER }}>
                        Детали
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                          <Clock className="w-4 h-4 mx-auto mb-1.5" style={{ color: qvAccent }} />
                          <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: INTER }}>{quickViewService.duration}</p>
                          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: INTER, marginTop: 2 }}>Время</p>
                        </div>
                        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                          <Star className="w-4 h-4 mx-auto mb-1.5" style={{ color: '#F59E0B' }} />
                          <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: INTER }}>{quickViewService.rating}</p>
                          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: INTER, marginTop: 2 }}>Рейтинг</p>
                        </div>
                        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                          <Heart className="w-4 h-4 mx-auto mb-1.5" style={{ color: '#EF4444' }} />
                          <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontFamily: INTER }}>{quickViewService.reviewCount}</p>
                          <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: INTER, marginTop: 2 }}>Отзывы</p>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '22px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '10px', fontFamily: INTER }}>
                        Описание
                      </p>
                      <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', fontFamily: INTER }}>
                        {quickViewService.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        addToCartPersistent({
                          id: String(quickViewService.id),
                          name: quickViewService.name,
                          price: quickViewService.price,
                          image: quickViewService.image,
                          color: quickViewService.category,
                        });
                        toast({ title: 'Добавлено в записи', description: `${quickViewService.name} • ${quickViewService.duration}`, duration: 2000 });
                        setQuickViewService(null);
                      }}
                      className="w-full active:scale-[0.98] transition-all"
                      style={{
                        height: '52px', borderRadius: '14px', background: ACCENT, color: BG,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: `0 4px 20px ${ACCENT}40`,
                        marginBottom: '10px',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: INTER }}>ЗАПИСАТЬСЯ</span>
                      <span style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.2)' }} />
                      <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', fontFamily: INTER }}>
                        {formatPrice(quickViewService.price)}
                      </span>
                    </button>

                    <button
                      onClick={() => { openService(quickViewService); setQuickViewService(null); }}
                      className="w-full py-3 transition-all active:opacity-70"
                      style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: INTER, letterSpacing: '0.02em' }}
                    >
                      Смотреть полностью →
                    </button>
                  </div>
                </m.div>
              </m.div>
            );
          })()}
        </AnimatePresence>
      </div>
    );
  }

  // ───────── CART PAGE ─────────
  if (activeTab === 'cart') {
    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: BG }}>
        <div className="px-5 pt-4 demo-nav-safe">
          <div className="flex items-center justify-between">
            <h1 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff' }}>Мои <span style={{ fontStyle: 'italic' }}>записи</span></h1>
            {cart.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: `${ACCENT}20`, color: ACCENT }}>
                {cart.length} {cart.length === 1 ? 'запись' : cart.length < 5 ? 'записи' : 'записей'}
              </span>
            )}
          </div>
        </div>

        <div className="px-5 pt-4 space-y-4">
          {cart.length === 0 ? (
            <EmptyState type="cart" title="Нет активных записей" description="Выберите процедуру из каталога и запишитесь к мастеру" actionLabel="Открыть каталог" onAction={() => onTabChange?.('catalog')} />
          ) : (
            <>
              {cart.map((item) => (
                <m.div
                  key={item.id + (item.size || '')}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4 flex gap-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <LazyImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: CORMORANT, fontSize: '1.05rem', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }} className="truncate">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <User className="w-3 h-3" style={{ color: ACCENT }} />
                      <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{item.color}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.3)' }} />
                      <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{item.size}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span style={{ fontFamily: INTER, fontSize: '0.9rem', fontWeight: 600, color: ACCENT }}>{formatPrice(item.price)}</span>
                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90"
                        style={{ background: 'rgba(239,68,68,0.08)', border: '0.5px solid rgba(239,68,68,0.15)', transition: 'transform 0.15s ease' }}
                      >
                        <X className="w-4 h-4" style={{ color: 'rgba(239,68,68,0.7)' }} />
                      </button>
                    </div>
                  </div>
                </m.div>
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

  // ───────── PROFILE PAGE ─────────
  if (activeTab === 'profile') {
    const loyaltyLevel = ordersCount >= 10 ? 'Platinum' : ordersCount >= 5 ? 'Gold' : ordersCount >= 2 ? 'Silver' : 'Welcome';
    const nextLevel = loyaltyLevel === 'Platinum' ? null : loyaltyLevel === 'Gold' ? 'Platinum' : loyaltyLevel === 'Silver' ? 'Gold' : 'Silver';
    const progressToNext = loyaltyLevel === 'Platinum' ? 100 :
      loyaltyLevel === 'Gold' ? ((ordersCount - 5) / 5) * 100 :
      loyaltyLevel === 'Silver' ? ((ordersCount - 2) / 3) * 100 :
      (ordersCount / 2) * 100;
    const visitsToNext = loyaltyLevel === 'Platinum' ? 0 :
      loyaltyLevel === 'Gold' ? 10 - ordersCount :
      loyaltyLevel === 'Silver' ? 5 - ordersCount :
      2 - ordersCount;
    const discount = loyaltyLevel === 'Platinum' ? 25 : loyaltyLevel === 'Gold' ? 15 : loyaltyLevel === 'Silver' ? 10 : 5;

    const levelConfig: Record<string, { icon: typeof Crown; color: string }> = {
      Welcome: { icon: Star, color: '#6B7280' },
      Silver: { icon: Award, color: '#9CA3AF' },
      Gold: { icon: Crown, color: '#F59E0B' },
      Platinum: { icon: Crown, color: '#C9A89B' },
    };
    const lvl = levelConfig[loyaltyLevel];

    return (
      <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ backgroundColor: BG }}>
        <div className="px-5 pt-6 demo-nav-safe">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT}, #B8A8C9)` }}>
              <User className="w-10 h-10" style={{ color: BG }} />
            </div>
            <h2 style={{ fontFamily: CORMORANT, fontSize: '1.6rem', fontWeight: 400, color: '#fff' }}>Анастасия</h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ background: `${lvl.color}20`, color: lvl.color, border: `0.5px solid ${lvl.color}30` }}>
                <lvl.icon className="w-3 h-3" /> {loyaltyLevel}
              </span>
            </div>
          </div>

          <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: INTER, fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Уровень лояльности</span>
              <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: ACCENT }}>{discount}% скидка</span>
            </div>
            <div className="w-full h-2 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(progressToNext, 100)}%`, background: `linear-gradient(90deg, ${ACCENT}, ${lvl.color})` }} />
            </div>
            {nextLevel && (
              <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>
                До {nextLevel} — ещё {visitsToNext} {visitsToNext === 1 ? 'визит' : visitsToNext < 5 ? 'визита' : 'визитов'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { value: String(ordersCount), label: 'Визитов' },
              { value: `${discount}%`, label: 'Скидка' },
              { value: String(favoritesCount), label: 'Избранное' },
            ].map((stat, i) => (
              <div key={i} className="rounded-2xl p-3.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: CORMORANT, fontSize: '1.4rem', fontWeight: 600, color: ACCENT }}>{stat.value}</p>
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="mb-5">
              <p style={{ fontFamily: INTER, fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Ближайшие записи</p>
              {cart.slice(0, 2).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <LazyImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: INTER, fontSize: '0.78rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }} className="truncate">{item.name}</p>
                    <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{item.color} · {item.size}</p>
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: '0.7rem', fontWeight: 600, color: ACCENT }}>{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          )}

          {orders.length > 0 && (
            <div className="mb-5">
              <p style={{ fontFamily: INTER, fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Последние визиты</p>
              {orders.slice(0, 3).map((order, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${ACCENT}15` }}>
                    <Check className="w-4 h-4" style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: INTER, fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }} className="truncate">
                      {order.items.map(i => i.name).join(', ')}
                    </p>
                    <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>Заказ #{order.id.slice(-6)}</p>
                  </div>
                  <span style={{ fontFamily: INTER, fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{formatPrice(order.total)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {[
              { icon: Gift, label: 'Бонусная программа', badge: `${ordersCount * 400} баллов` },
              { icon: Calendar, label: 'История записей', badge: ordersCount > 0 ? `${ordersCount}` : undefined },
              { icon: Heart, label: 'Избранные процедуры', badge: favoritesCount > 0 ? `${favoritesCount}` : undefined },
              { icon: MapPin, label: 'Наш адрес' },
              { icon: Settings, label: 'Настройки' },
            ].map((item, i) => (
              <button key={i} className="w-full p-4 rounded-xl flex items-center gap-3 active:scale-[0.98]" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', transition: 'transform 0.15s ease' }}>
                <item.icon className="w-5 h-5" style={{ color: ACCENT }} />
                <span className="flex-1 text-left" style={{ fontFamily: INTER, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `${ACCENT}15`, color: ACCENT }}>{item.badge}</span>
                )}
                <ChevronRight className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
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
