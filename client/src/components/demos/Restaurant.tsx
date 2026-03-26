import React, { useState, useMemo, memo } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import {
  Heart, Star, ChevronRight, Clock, User,
  MapPin, Search, ShoppingBag, Settings,
  Home, Grid, Utensils, Wine, Flame,
  X, Phone, Award, Crown, Eye, Package
} from "lucide-react";

import { LazyImage, DemoThemeProvider } from "@/components/shared";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import DemoSidebar, { useDemoSidebar } from "./DemoSidebar";

import deluxeHeroImg from "@assets/deluxe_hero.jpg";
import deluxeInteriorImg from "@assets/deluxe_interior.jpg";
import deluxeRibeyeImg from "@assets/deluxe_ribeye.jpg";
import deluxeSalmonImg from "@assets/deluxe_salmon.jpg";
import deluxeRisottoImg from "@assets/deluxe_risotto.jpg";
import deluxeDuckImg from "@assets/deluxe_duck.jpg";
import deluxeCarbonaraImg from "@assets/deluxe_carbonara.jpg";
import deluxeTruffleImg from "@assets/deluxe_truffle.jpg";
import deluxeLobsterImg from "@assets/deluxe_lobster.jpg";
import deluxeBoscaiolaImg from "@assets/deluxe_boscaiola.jpg";
import deluxeOystersImg from "@assets/deluxe_oysters.jpg";
import deluxeFoiegrasImg from "@assets/deluxe_foiegras.jpg";
import deluxeTunaImg from "@assets/deluxe_tuna.jpg";
import deluxeBurrataImg from "@assets/deluxe_burrata.jpg";
import deluxeTiramisuImg from "@assets/deluxe_tiramisu.jpg";
import deluxeCremeBruleeImg from "@assets/deluxe_cremebrulee.jpg";
import deluxeFondantImg from "@assets/deluxe_fondant.jpg";
import deluxePannaCottaImg from "@assets/deluxe_pannacotta.jpg";
import deluxeChefImg from "@assets/deluxe_chef.jpg";
import deluxeSousChefImg from "@assets/deluxe_sous_chef.jpg";
import deluxePastryChefImg from "@assets/deluxe_pastry_chef.jpg";
import deluxeSommelierImg from "@assets/deluxe_sommelier.jpg";

interface RestaurantProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: string) => void;
}

const PLAYFAIR = "'Playfair Display', serif";
const INTER = "'Inter', sans-serif";
const ACCENT = '#C9A96E';
const ACCENT_DARK = '#8B7355';
const BG = '#0A0A0A';
const BG_SEC = '#111111';
const GLASS = 'rgba(255,255,255,0.06)';
const GLASS_BORDER = 'rgba(255,255,255,0.10)';
const TEXT_SEC = 'rgba(255,255,255,0.55)';

interface Dish {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  cookTime: string;
  rating: number;
  ingredients: string[];
  origin: string;
  chef: string;
  pairing: string[];
  cookingMethod: string;
  isChefSpecial?: boolean;
  isNew?: boolean;
  calories?: string;
  weight?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Закуски': '🍽',
  'Основные блюда': '🔥',
  'Паста': '🍝',
  'Десерты': '🍰',
};

const dishes: Dish[] = [
  {
    id: 1, name: 'Стейк Рибай', price: 3200, image: deluxeRibeyeImg,
    description: 'Премиальный стейк из мраморной говядины Black Angus сухой выдержки 28 дней. Готовится на гриле Josper при 800°C для карамелизированной корочки и сочной серединки medium-rare. Подается с трюфельным демиглас и микс-салатом из руколы с пармезаном.',
    category: 'Основные блюда', cookTime: '25 мин', rating: 4.9, calories: '680 ккал', weight: '350 г',
    ingredients: ['Black Angus 28-дней', 'Трюфельное масло', 'Флёр де сель', 'Розмарин'],
    origin: 'Классический стейкхаус', chef: 'Алексей Романов',
    pairing: ['Malbec', 'Каберне Совиньон'], cookingMethod: 'Гриль Josper, 800°C, medium-rare', isChefSpecial: true
  },
  {
    id: 2, name: 'Лосось на пару', price: 2800, image: deluxeSalmonImg,
    description: 'Филе дикого норвежского лосося на пару с сохранением нежнейшей текстуры. На подушке из сезонных овощей гриль с шелковистым соусом терияки домашнего приготовления. Рыба доставляется дважды в неделю прямо с фьордов Норвегии.',
    category: 'Основные блюда', cookTime: '20 мин', rating: 4.8, calories: '420 ккал', weight: '280 г',
    ingredients: ['Дикий лосось', 'Овощи гриль', 'Соус терияки', 'Микрозелень'],
    origin: 'Скандинавская кухня', chef: 'Алексей Романов',
    pairing: ['Шабли', 'Пино Гриджо'], cookingMethod: 'На пару, 85°C, 12 минут', isChefSpecial: true
  },
  {
    id: 3, name: 'Ризотто с белыми грибами', price: 2200, image: deluxeRisottoImg,
    description: 'Кремовое ризотто аль-онда из риса карнароли с белыми грибами порчини из гор Пьемонта. Завершается выдержанным пармезаном Реджано 36 месяцев и каплей трюфельного масла. Каждая порция готовится 18 минут.',
    category: 'Основные блюда', cookTime: '30 мин', rating: 4.7, calories: '520 ккал', weight: '320 г',
    ingredients: ['Рис карнароли', 'Белые грибы порчини', 'Пармезан 36 мес.', 'Трюфельное масло'],
    origin: 'Ломбардия, Италия', chef: 'Марко Бернини',
    pairing: ['Бароло', 'Просекко брют'], cookingMethod: 'Техника мантекатура', isNew: true
  },
  {
    id: 4, name: 'Утиная грудка', price: 3500, image: deluxeDuckImg,
    description: 'Грудка утки Мулар с хрустящей карамелизированной кожицей и розовой серединкой. Апельсиновый соус бигарад на основе утиного жю и Grand Marnier. Картофельное пюре робюшон с нормандским маслом.',
    category: 'Основные блюда', cookTime: '35 мин', rating: 4.9, calories: '590 ккал', weight: '300 г',
    ingredients: ['Утка Мулар', 'Апельсины Сицилии', 'Grand Marnier', 'Масло нормандское'],
    origin: 'Французская haute cuisine', chef: 'Алексей Романов',
    pairing: ['Пино Нуар', 'Шампанское розе'], cookingMethod: 'Конфи кожи, обжарка, отдых 8 мин', isChefSpecial: true
  },
  {
    id: 5, name: 'Паста Карбонара', price: 1800, image: deluxeCarbonaraImg,
    description: 'Аутентичная римская карбонара без сливок. Шелковистый соус из фермерских желтков и выдержанного пекорино романо. Хрустящие кусочки гуанчале из Умбрии, свежемолотый перец телличерри.',
    category: 'Паста', cookTime: '15 мин', rating: 4.8, calories: '480 ккал', weight: '290 г',
    ingredients: ['Спагетти де Чекко', 'Гуанчале', 'Пекорино Романо DOP', 'Желтки фермерские'],
    origin: 'Рим, Лацио', chef: 'Марко Бернини',
    pairing: ['Фраскати', 'Верментино'], cookingMethod: 'Эмульгирование при 65°C'
  },
  {
    id: 6, name: 'Тальятелле с трюфелем', price: 2400, image: deluxeTruffleImg,
    description: 'Домашняя паста, раскатанная вручную до 0.8 мм по болонскому рецепту. Стружка свежего черного трюфеля Tuber Melanosporum из Перигора. Нежный сливочный соус с трюфельным маслом первого отжима.',
    category: 'Паста', cookTime: '18 мин', rating: 4.9, calories: '510 ккал', weight: '270 г',
    ingredients: ['Паста домашняя', 'Черный трюфель', 'Трюфельное масло', 'Пармезан 24 мес.'],
    origin: 'Эмилия-Романья', chef: 'Алексей Романов',
    pairing: ['Бароло Ризерва', 'Брунелло'], cookingMethod: 'Ручная раскатка, варка 3 мин', isChefSpecial: true
  },
  {
    id: 7, name: 'Лобстер Фра Дьяволо', price: 4500, image: deluxeLobsterImg,
    description: 'Атлантический лобстер 800 г из Мэна в пикантном томатном соусе с калабрийским перчиком и чили. На ложе из лингвини с ароматом моря и чеснока в лигурийском оливковом масле.',
    category: 'Паста', cookTime: '22 мин', rating: 4.8, calories: '620 ккал', weight: '800 г',
    ingredients: ['Лобстер 800 г', 'Томаты Сан-Марцано', 'Перчик калабрийский', 'Лингвини'],
    origin: 'Итало-американская кухня', chef: 'Алексей Романов',
    pairing: ['Соаве Классико', 'Апероль Шприц'], cookingMethod: 'Фламбирование, томление 8 мин', isNew: true, isChefSpecial: true
  },
  {
    id: 8, name: 'Боскайола', price: 1900, image: deluxeBoscaiolaImg,
    description: 'Паста «лесничего» — тосканское блюдо с ароматом осеннего леса. Смесь лесных грибов с хрустящей панчеттой. Сливочный соус с белым вином и тимьяном, тертый грана падано.',
    category: 'Паста', cookTime: '16 мин', rating: 4.6, calories: '460 ккал', weight: '310 г',
    ingredients: ['Пенне ригате', 'Лесные грибы', 'Панчетта', 'Сливки 33%'],
    origin: 'Тоскана, Италия', chef: 'Марко Бернини',
    pairing: ['Кьянти Классико', 'Россо ди Монтальчино'], cookingMethod: 'Обжарка, томление в сливках'
  },
  {
    id: 9, name: 'Устрицы Fine de Claire', price: 3800, image: deluxeOystersImg,
    description: 'Отборные устрицы из устричных ферм Марен-Олерон на атлантическом побережье Франции. Каждая раковина открывается перед подачей. На ледяной подушке с мигнонеттой и лимоном Сорренто. 6 штук.',
    category: 'Закуски', cookTime: '5 мин', rating: 4.9, calories: '120 ккал', weight: '600 г',
    ingredients: ['Устрицы Fine de Claire №2', 'Мигнонетта', 'Лимон Сорренто', 'Лёд колотый'],
    origin: 'Атлантическое побережье Франции', chef: 'Алексей Романов',
    pairing: ['Шампанское Брют', 'Мюскаде'], cookingMethod: 'Подаются сырыми', isChefSpecial: true
  },
  {
    id: 10, name: 'Фуа-гра', price: 4200, image: deluxeFoiegrasImg,
    description: 'Фуа-гра из гусиной печени Extra от Rougié, обжаренная до золотистой корочки и кремовой текстуры. С карамелизованными яблоками Гренни Смит в соусе из сотерна и теплой бриошью.',
    category: 'Закуски', cookTime: '10 мин', rating: 4.8, calories: '380 ккал', weight: '150 г',
    ingredients: ['Фуа-гра Extra', 'Яблоки Гренни Смит', 'Сотерн', 'Бриошь'],
    origin: 'Перигор, Франция', chef: 'Алексей Романов',
    pairing: ['Сотерн', 'Гевюрцтраминер'], cookingMethod: 'Обжарка 45 сек с каждой стороны', isChefSpecial: true
  },
  {
    id: 11, name: 'Тартар из тунца', price: 2600, image: deluxeTunaImg,
    description: 'Тартар из желтоперого тунца сашими-грейд с Шри-Ланки. Маринуется в соусе юзу с кунжутным маслом. С муссом из авокадо Хасс, чипсами тапиоки и икрой тобико.',
    category: 'Закуски', cookTime: '8 мин', rating: 4.7, calories: '290 ккал', weight: '200 г',
    ingredients: ['Тунец сашими', 'Авокадо Хасс', 'Соус юзу', 'Икра тобико'],
    origin: 'Японско-французский фьюжн', chef: 'Марко Бернини',
    pairing: ['Шабли Премье Крю', 'Саке Дайгинджо'], cookingMethod: 'Ручная нарезка, маринование 3 мин'
  },
  {
    id: 12, name: 'Буррата с томатами', price: 1600, image: deluxeBurrataImg,
    description: 'Свежайшая буррата из Апулии с кремовой страчателлой. С томатами черри Везувия, базиликом дженовезе и оливковым маслом из тысячелетних рощ Тосканы.',
    category: 'Закуски', cookTime: '5 мин', rating: 4.8, calories: '320 ккал', weight: '250 г',
    ingredients: ['Буррата 150 г', 'Томаты Везувий', 'Базилик', 'Оливковое масло'],
    origin: 'Апулия, Италия', chef: 'Марко Бернини',
    pairing: ['Верментино', 'Просекко'], cookingMethod: 'Сервировка при комнатной t°'
  },
  {
    id: 13, name: 'Тирамису', price: 900, image: deluxeTiramisuImg,
    description: 'Легендарный десерт по секретному рецепту из Тревизо. Воздушный крем из маскарпоне, савоярди с эспрессо и марсалой. Выдерживается 12 часов для идеального вкуса. Какао Valrhona.',
    category: 'Десерты', cookTime: '5 мин', rating: 4.9, calories: '380 ккал', weight: '180 г',
    ingredients: ['Маскарпоне', 'Эспрессо арабика', 'Савоярди', 'Какао Valrhona'],
    origin: 'Тревизо, Венето', chef: 'Анна Морозова',
    pairing: ['Москато д\'Асти', 'Эспрессо'], cookingMethod: 'Холодное, выдержка 12 ч'
  },
  {
    id: 14, name: 'Крем-брюле', price: 850, image: deluxeCremeBruleeImg,
    description: 'Бархатистый заварной крем на сливках нормандских коров со стручковой ванилью Мадагаскара. Хрустящая карамельная корочка образуется горелкой за секунды до подачи.',
    category: 'Десерты', cookTime: '7 мин', rating: 4.8, calories: '340 ккал', weight: '160 г',
    ingredients: ['Сливки нормандские', 'Ваниль Мадагаскар', 'Желтки', 'Сахар демерара'],
    origin: 'Бургундия, XVII век', chef: 'Анна Морозова',
    pairing: ['Сотерн', 'Эспрессо ристретто'], cookingMethod: 'Водяная баня 90°C, карамелизация'
  },
  {
    id: 15, name: 'Шоколадный фондан', price: 950, image: deluxeFondantImg,
    description: 'Теплый кекс с жидкой сердцевиной из бельгийского шоколада Callebaut 70%. При разрезании вытекает горячий шоколадный поток. С ванильным мороженым и свежей малиной.',
    category: 'Десерты', cookTime: '12 мин', rating: 4.9, calories: '420 ккал', weight: '200 г',
    ingredients: ['Шоколад Callebaut 70%', 'Масло нормандское', 'Яйца фермерские', 'Мороженое'],
    origin: 'Рецепт Мишеля Браса, 1981', chef: 'Анна Морозова',
    pairing: ['Баньюльс', 'Порто Руби'], cookingMethod: '11 мин при 200°C', isNew: true
  },
  {
    id: 16, name: 'Панна котта с ягодами', price: 800, image: deluxePannaCottaImg,
    description: 'Нежнейшая пьемонтская панна котта с идеальной желеобразной консистенцией. Сливочный десерт с ванилью Таити и кули из карельских ягод — ежевики, малины и голубики.',
    category: 'Десерты', cookTime: '5 мин', rating: 4.7, calories: '280 ккал', weight: '170 г',
    ingredients: ['Сливки пьемонтские', 'Ваниль Таити', 'Ягоды карельские', 'Желатин'],
    origin: 'Пьемонт, Италия', chef: 'Анна Морозова',
    pairing: ['Москато Розе', 'Белый чай'], cookingMethod: 'Холодное, застывание 6 ч'
  },
];

const categories = ['Все', 'Закуски', 'Основные блюда', 'Паста', 'Десерты'];

const chefs = [
  { name: 'Алексей Романов', role: 'Шеф-повар', image: deluxeChefImg, exp: '18 лет', stars: '2 Michelin' },
  { name: 'Марко Бернини', role: 'Су-шеф', image: deluxeSousChefImg, exp: '12 лет', stars: 'Италия' },
  { name: 'Анна Морозова', role: 'Шеф-кондитер', image: deluxePastryChefImg, exp: '10 лет', stars: 'Pastry arts' },
  { name: 'Даниил Орлов', role: 'Сомелье', image: deluxeSommelierImg, exp: '15 лет', stars: 'WSET Level 4' },
];

const reviews = [
  { name: 'Екатерина В.', text: 'Атмосфера невероятная. Стейк Рибай — лучший в Москве, без преувеличения. Обязательно вернусь.', rating: 5 },
  { name: 'Андрей М.', text: 'Устрицы и фуа-гра — просто шедевр. Сомелье подобрал идеальное вино. Высочайший уровень.', rating: 5 },
  { name: 'Мария К.', text: 'Тирамису здесь — это произведение искусства. Весь вечер прошел безупречно. Спасибо команде!', rating: 5 },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
};

const DishQuickView = memo(function DishQuickView({ dish, onClose, onAddToCart, isFav, onToggleFav }: {
  dish: Dish; onClose: () => void; onAddToCart: (d: Dish) => void; isFav: boolean; onToggleFav: () => void;
}) {
  return createPortal(
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-end justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <m.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-md rounded-t-[28px] overflow-hidden"
          style={{ background: BG_SEC, maxHeight: '92vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-1" />
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 20px)' }}>
            <div className="relative" style={{ height: 280 }}>
              <LazyImage src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={onToggleFav}
                className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
              >
                <Heart className="w-4 h-4" style={{ color: isFav ? ACCENT : 'white', fill: isFav ? ACCENT : 'none' }} />
              </button>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                  style={{ background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}40` }}
                >
                  {dish.category}
                </span>
                {dish.isChefSpecial && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                    style={{ background: 'rgba(201,169,110,0.2)', color: ACCENT, border: `1px solid ${ACCENT}30` }}>
                    <Flame className="w-3 h-3" /> Chef
                  </span>
                )}
                {dish.isNew && (
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: ACCENT, color: BG }}>
                    New
                  </span>
                )}
              </div>
            </div>

            <div className="px-5 pt-4 pb-2">
              <h3 style={{ fontFamily: PLAYFAIR, fontSize: '1.5rem', fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
                {dish.name}
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: i < Math.floor(dish.rating) ? ACCENT : 'rgba(255,255,255,0.15)' }} />
                  ))}
                  <span style={{ fontFamily: INTER, fontSize: '0.7rem', color: TEXT_SEC, marginLeft: 4 }}>{dish.rating}</span>
                </div>
                <span style={{ fontFamily: INTER, fontSize: '0.65rem', color: TEXT_SEC }}>·</span>
                <span className="flex items-center gap-1" style={{ fontFamily: INTER, fontSize: '0.65rem', color: TEXT_SEC }}>
                  <Clock className="w-3 h-3" /> {dish.cookTime}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Калории', value: dish.calories || '—' },
                  { label: 'Порция', value: dish.weight || '—' },
                  { label: 'Подача', value: dish.cookTime },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl text-center" style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}>
                    <p style={{ fontFamily: INTER, fontSize: '0.55rem', color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{item.label}</p>
                    <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: '#fff', fontWeight: 500 }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <p style={{ fontFamily: INTER, fontSize: '0.75rem', color: TEXT_SEC, lineHeight: 1.7, marginBottom: 16 }}>
                {dish.description}
              </p>

              <div className="mb-4">
                <p style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>Ингредиенты</p>
                <div className="flex flex-wrap gap-1.5">
                  {dish.ingredients.map((ing, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full" style={{ fontFamily: INTER, fontSize: '0.65rem', color: TEXT_SEC, background: GLASS, border: `1px solid ${GLASS_BORDER}` }}>
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl mb-4" style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Wine className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                  <p style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT }}>Винная карта</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dish.pairing.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full" style={{ fontFamily: INTER, fontSize: '0.65rem', color: ACCENT, background: `${ACCENT}12`, border: `1px solid ${ACCENT}25` }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-8">
              <button
                onClick={() => onAddToCart(dish)}
                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-3 active:scale-[0.97]"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, color: BG, fontFamily: INTER, fontSize: '0.85rem', fontWeight: 600, transition: 'transform 0.15s ease' }}
              >
                <span>Добавить в заказ</span>
                <span style={{ opacity: 0.7 }}>·</span>
                <span>{formatPrice(dish.price)}</span>
              </button>
            </div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>,
    document.body
  );
});

const Restaurant = memo(function Restaurant({ activeTab, onTabChange }: RestaurantProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewDish, setQuickViewDish] = useState<Dish | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { toast } = useToast();

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems } = usePersistentCart({ storageKey: 'deluxedine-cart' });
  const { favorites, toggleFavorite, isFavorite } = usePersistentFavorites({ storageKey: 'deluxedine-favorites' });
  const { orders, createOrder } = usePersistentOrders({ storageKey: 'deluxedine-orders' });
  const sidebar = useDemoSidebar();

  const filteredDishes = useMemo(() => {
    let result = dishes;
    if (selectedCategory !== 'Все') {
      result = result.filter(d => d.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.ingredients.some(i => i.toLowerCase().includes(q))
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (dish: Dish) => {
    addToCart({ id: String(dish.id), name: dish.name, price: dish.price, image: dish.image });
    setQuickViewDish(null);
    toast({ title: 'Добавлено', description: `${dish.name} в корзине` });
  };

  const handleCheckoutComplete = (orderId: string) => {
    createOrder(
      cartItems.map(ci => ({ id: ci.id, name: ci.name, price: ci.price, quantity: ci.quantity, image: ci.image })),
      totalAmount,
      { phone: '+7 (495) 123-45-67' }
    );
    clearCart();
    setIsCheckoutOpen(false);
    toast({ title: 'Заказ оформлен!', description: `Номер: ${orderId}`, duration: 3000 });
  };

  const sidebarMenuItems = useMemo(() => [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home', onClick: () => { onTabChange?.('home'); sidebar.close(); } },
    { icon: <Grid className="w-5 h-5" />, label: 'Меню', active: activeTab === 'catalog', onClick: () => { onTabChange?.('catalog'); sidebar.close(); } },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', active: activeTab === 'cart', badge: totalItems > 0 ? String(totalItems) : undefined, onClick: () => { onTabChange?.('cart'); sidebar.close(); } },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile', onClick: () => { onTabChange?.('profile'); sidebar.close(); } },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favorites.size > 0 ? String(favorites.size) : undefined, onClick: () => { onTabChange?.('catalog'); sidebar.close(); } },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки', onClick: () => sidebar.close() },
  ], [activeTab, onTabChange, totalItems, favorites.size, sidebar]);

  const renderCatalogGrid = () => {
    const cards: React.ReactElement[] = [];
    let i = 0;
    while (i < filteredDishes.length) {
      const featured = filteredDishes[i];
      cards.push(
        <m.div
          key={`feat-${featured.id}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 * cards.length }}
          className="relative rounded-[20px] overflow-hidden cursor-pointer active:scale-[0.98]"
          style={{ height: 280, transition: 'transform 0.15s ease' }}
          onClick={() => setQuickViewDish(featured)}
        >
          <div className="absolute inset-0">
            <LazyImage src={featured.image} alt={featured.name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {featured.isChefSpecial && (
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: `${ACCENT}30`, backdropFilter: 'blur(8px)', border: `1px solid ${ACCENT}40` }}>
              <Flame className="w-3 h-3" style={{ color: ACCENT }} />
              <span style={{ fontFamily: INTER, fontSize: '0.55rem', fontWeight: 700, color: ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Chef's pick</span>
            </div>
          )}
          {featured.isNew && !featured.isChefSpecial && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full"
              style={{ background: ACCENT, color: BG, fontFamily: INTER, fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              New
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); setQuickViewDish(featured); }}
              className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
              <Eye className="w-3.5 h-3.5 text-white/80" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(featured.id); }}
              className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
              <Heart className="w-3.5 h-3.5" style={{ color: isFavorite(featured.id) ? ACCENT : 'rgba(255,255,255,0.8)', fill: isFavorite(featured.id) ? ACCENT : 'none' }} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p style={{ fontFamily: INTER, fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>
              {featured.category}
            </p>
            <h3 style={{ fontFamily: PLAYFAIR, fontSize: '1.15rem', fontWeight: 500, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
              {featured.name}
            </h3>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: INTER, fontSize: '0.85rem', fontWeight: 700, color: ACCENT }}>{formatPrice(featured.price)}</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="w-1 h-1 rounded-full" style={{ background: j < Math.floor(featured.rating) ? ACCENT : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
            </div>
          </div>
        </m.div>
      );
      i++;
      if (i < filteredDishes.length) {
        const pair: Dish[] = [];
        if (i < filteredDishes.length) { pair.push(filteredDishes[i]); i++; }
        if (i < filteredDishes.length) { pair.push(filteredDishes[i]); i++; }
        if (pair.length > 0) {
          cards.push(
            <div key={`pair-${pair[0].id}`} className="grid grid-cols-2 gap-3">
              {pair.map((d, pairIdx) => {
                const h = pairIdx === 0 ? 205 : 175;
                return (
                  <m.div
                    key={d.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 * cards.length + pairIdx * 0.05 }}
                    className="relative rounded-[20px] overflow-hidden cursor-pointer active:scale-[0.98]"
                    style={{ height: h, transition: 'transform 0.15s ease' }}
                    onClick={() => setQuickViewDish(d)}
                  >
                    <div className="absolute inset-0">
                      <LazyImage src={d.image} alt={d.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    {d.isNew && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
                        style={{ background: ACCENT, color: BG, fontFamily: INTER, fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        New
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(d.id); }}
                      className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                      <Heart className="w-3 h-3" style={{ color: isFavorite(d.id) ? ACCENT : 'rgba(255,255,255,0.8)', fill: isFavorite(d.id) ? ACCENT : 'none' }} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p style={{ fontFamily: INTER, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT, marginBottom: 2 }}>
                        {d.category}
                      </p>
                      <h4 style={{ fontFamily: PLAYFAIR, fontSize: '0.85rem', fontWeight: 500, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
                        {d.name}
                      </h4>
                      <span style={{ fontFamily: INTER, fontSize: '0.75rem', fontWeight: 700, color: ACCENT }}>{formatPrice(d.price)}</span>
                    </div>
                  </m.div>
                );
              })}
            </div>
          );
        }
      }
    }
    return cards;
  };

  if (activeTab === 'home') {
    const chefSpecials = dishes.filter(d => d.isChefSpecial).slice(0, 6);
    const newDishes = dishes.filter(d => d.isNew);
    return (
      <>
        <DemoSidebar
          isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open}
          menuItems={sidebarMenuItems} accentColor={ACCENT} bgColor={BG}
          title="DeluxeDine" subtitle="Fine dining experience"
        />
        <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ background: BG }}>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden"
            style={{ height: '58vh' }}
          >
            <div className="absolute inset-0">
              <LazyImage src={deluxeInteriorImg} alt="DeluxeDine interior" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}40 0%, ${BG}99 60%, ${BG} 100%)` }} />
            <div className="absolute inset-0 flex flex-col justify-end p-6 pb-8">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span style={{ fontFamily: INTER, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: ACCENT }}>
                  Гастрономический ресторан
                </span>
                <h1 style={{ fontFamily: PLAYFAIR, fontSize: '2.8rem', fontWeight: 700, color: '#fff', lineHeight: 1, marginTop: 6, letterSpacing: '-0.02em' }}>
                  Deluxe<span style={{ fontStyle: 'italic', color: ACCENT }}>Dine</span>
                </h1>
                <p style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 300, color: 'rgba(255,255,255,0.6)', marginTop: 8, letterSpacing: '0.02em' }}>
                  Шедевры высокой кухни в центре Москвы
                </p>
              </m.div>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-2.5 px-5 -mt-5 relative z-10 mb-8"
          >
            {[
              { icon: Star, label: 'Michelin', value: '2 stars' },
              { icon: Clock, label: 'Работаем', value: '12 — 23' },
              { icon: MapPin, label: 'Москва', value: 'Центр' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-2xl text-center" style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}`, backdropFilter: 'blur(20px)' }}>
                <item.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: ACCENT }} />
                <p style={{ fontFamily: INTER, fontSize: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: TEXT_SEC, marginBottom: 2 }}>{item.label}</p>
                <p style={{ fontFamily: INTER, fontSize: '0.7rem', fontWeight: 600, color: '#fff' }}>{item.value}</p>
              </div>
            ))}
          </m.div>

          <div className="px-5 mb-8">
            <m.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98]"
              style={{ height: 100, background: `linear-gradient(135deg, ${ACCENT}15 0%, ${ACCENT}08 100%)`, border: `1px solid ${ACCENT}20`, transition: 'transform 0.15s ease' }}
              onClick={() => onTabChange?.('catalog')}
            >
              <div className="absolute inset-0 p-4 flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: INTER, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 4 }}>Сезонное меню</p>
                  <h3 style={{ fontFamily: PLAYFAIR, fontSize: '1.1rem', fontWeight: 500, color: '#fff', lineHeight: 1.2 }}>Весенние блюда от шефа</h3>
                  <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: TEXT_SEC, marginTop: 4 }}>Новая коллекция Март 2026</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${ACCENT}20` }}>
                  <ChevronRight className="w-5 h-5" style={{ color: ACCENT }} />
                </div>
              </div>
            </m.div>
          </div>

          <div className="px-5 mb-8">
            <div className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Рекомендуем</span>
                <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Выбор <span style={{ fontStyle: 'italic' }}>шефа</span></h2>
              </div>
              <button onClick={() => onTabChange?.('catalog')} style={{ fontFamily: INTER, fontSize: '0.7rem', color: ACCENT, fontWeight: 500 }}>Все →</button>
            </div>
            <div className="flex gap-3.5 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
              {chefSpecials.map((dish, idx) => (
                <m.div
                  key={dish.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  className="relative flex-shrink-0 cursor-pointer active:scale-[0.97]"
                  style={{ width: 150, transition: 'transform 0.15s ease' }}
                  onClick={() => setQuickViewDish(dish)}
                >
                  <div className="relative rounded-[18px] overflow-hidden mb-2.5" style={{ height: 200, border: `1px solid ${GLASS_BORDER}` }}>
                    <LazyImage src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(dish.id); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
                    >
                      <Heart className="w-3.5 h-3.5" style={{ color: isFavorite(dish.id) ? ACCENT : 'white', fill: isFavorite(dish.id) ? ACCENT : 'none' }} />
                    </button>
                  </div>
                  <p style={{ fontFamily: INTER, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT, marginBottom: 2 }}>{dish.category}</p>
                  <p className="truncate" style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 500, color: '#fff', marginBottom: 2 }}>{dish.name}</p>
                  <span style={{ fontFamily: INTER, fontSize: '0.75rem', fontWeight: 700, color: ACCENT }}>{formatPrice(dish.price)}</span>
                </m.div>
              ))}
            </div>
          </div>

          <div className="px-5 mb-8">
            <div className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Свежее</span>
                <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Новые <span style={{ fontStyle: 'italic' }}>блюда</span></h2>
              </div>
              <button onClick={() => onTabChange?.('catalog')} style={{ fontFamily: INTER, fontSize: '0.7rem', color: ACCENT, fontWeight: 500 }}>Все →</button>
            </div>
            <div className="space-y-3">
              {newDishes.slice(0, 3).map((dish, idx) => (
                <m.div
                  key={dish.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  className="flex gap-3.5 p-3 rounded-2xl cursor-pointer active:scale-[0.98]"
                  style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}`, transition: 'transform 0.15s ease' }}
                  onClick={() => setQuickViewDish(dish)}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${GLASS_BORDER}` }}>
                    <LazyImage src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontFamily: INTER, fontSize: '0.5rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT }}>{dish.category}</span>
                      <span className="px-1.5 py-0.5 rounded-full" style={{ background: ACCENT, color: BG, fontFamily: INTER, fontSize: '0.45rem', fontWeight: 700, textTransform: 'uppercase' }}>New</span>
                    </div>
                    <p className="truncate" style={{ fontFamily: INTER, fontSize: '0.85rem', fontWeight: 500, color: '#fff', marginBottom: 4 }}>{dish.name}</p>
                    <div className="flex items-center justify-between">
                      <span style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 700, color: ACCENT }}>{formatPrice(dish.price)}</span>
                      <span className="flex items-center gap-1" style={{ fontFamily: INTER, fontSize: '0.65rem', color: TEXT_SEC }}>
                        <Clock className="w-3 h-3" /> {dish.cookTime}
                      </span>
                    </div>
                  </div>
                </m.div>
              ))}
            </div>
          </div>

          <div className="px-5 pt-2 pb-6">
            <div className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Интерьер</span>
                <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Наша <span style={{ fontStyle: 'italic' }}>атмосфера</span></h2>
              </div>
            </div>
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-[20px] overflow-hidden"
              style={{ height: 200 }}
            >
              <div className="absolute inset-0">
                <LazyImage src={deluxeHeroImg} alt="DeluxeDine atmosphere" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 style={{ fontFamily: PLAYFAIR, fontSize: '1.2rem', fontWeight: 500, color: '#fff', lineHeight: 1.2 }}>Изысканная обстановка</h3>
                <p style={{ fontFamily: INTER, fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Утонченный дизайн, живая музыка, приватные кабинеты</p>
              </div>
            </m.div>
          </div>

          <div className="px-5 mb-8">
            <div className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Команда</span>
                <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Наши <span style={{ fontStyle: 'italic' }}>мастера</span></h2>
              </div>
            </div>
            <div className="flex gap-3.5 overflow-x-auto pb-4 -mx-5 px-5 scrollbar-hide">
              {chefs.map((chef, idx) => (
                <m.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  className="flex-shrink-0 text-center"
                  style={{ width: 110 }}
                >
                  <div className="w-20 h-20 mx-auto mb-2.5 rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK})` }}>
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <LazyImage src={chef.image} alt={chef.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <p style={{ fontFamily: INTER, fontSize: '0.75rem', fontWeight: 600, color: '#fff', marginBottom: 2 }}>{chef.name}</p>
                  <p style={{ fontFamily: INTER, fontSize: '0.6rem', color: ACCENT, marginBottom: 1 }}>{chef.role}</p>
                  <p style={{ fontFamily: INTER, fontSize: '0.55rem', color: TEXT_SEC }}>{chef.stars}</p>
                </m.div>
              ))}
            </div>
          </div>

          <div className="px-5 mb-8">
            <div className="flex items-end justify-between mb-5">
              <div>
                <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Отзывы</span>
                <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.6rem', fontWeight: 400, color: '#fff', marginTop: 4 }}>Гости о <span style={{ fontStyle: 'italic' }}>нас</span></h2>
              </div>
            </div>
            <div className="space-y-3">
              {reviews.map((review, idx) => (
                <m.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  className="p-4 rounded-2xl"
                  style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: ACCENT }} />
                      ))}
                    </div>
                    <span style={{ fontFamily: INTER, fontSize: '0.65rem', fontWeight: 600, color: '#fff' }}>{review.name}</span>
                  </div>
                  <p style={{ fontFamily: INTER, fontSize: '0.75rem', color: TEXT_SEC, lineHeight: 1.6 }}>{review.text}</p>
                </m.div>
              ))}
            </div>
          </div>

          <div className="px-5 pb-4">
            <div className="p-5 rounded-2xl text-center" style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}>
              <p style={{ fontFamily: INTER, fontSize: '0.55rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>Контакты</p>
              <h3 style={{ fontFamily: PLAYFAIR, fontSize: '1.2rem', fontWeight: 500, color: '#fff', marginBottom: 8 }}>Забронировать стол</h3>
              <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: TEXT_SEC, marginBottom: 4 }}>ул. Большая Никитская, 24/1, Москва</p>
              <p style={{ fontFamily: INTER, fontSize: '0.7rem', color: TEXT_SEC, marginBottom: 12 }}>+7 (495) 123-45-67</p>
              <button
                className="w-full py-3 rounded-xl active:scale-[0.97]"
                style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, color: BG, fontFamily: INTER, fontSize: '0.8rem', fontWeight: 600, transition: 'transform 0.15s ease' }}
              >
                Забронировать
              </button>
            </div>
          </div>
        </div>

        {quickViewDish && (
          <DishQuickView
            dish={quickViewDish}
            onClose={() => setQuickViewDish(null)}
            onAddToCart={handleAddToCart}
            isFav={isFavorite(quickViewDish.id)}
            onToggleFav={() => toggleFavorite(quickViewDish.id)}
          />
        )}
      </>
    );
  }

  if (activeTab === 'catalog') {
    return (
      <>
        <DemoSidebar
          isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open}
          menuItems={sidebarMenuItems} accentColor={ACCENT} bgColor={BG}
          title="DeluxeDine" subtitle="Fine dining experience"
        />
        <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ background: BG }}>
          <div className="px-5 pt-5 pb-3">
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between mb-5"
            >
              <div>
                <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Каталог</span>
                <h1 style={{ fontFamily: PLAYFAIR, fontSize: '1.8rem', fontWeight: 400, color: '#fff', marginTop: 2 }}>Наше <span style={{ fontStyle: 'italic' }}>меню</span></h1>
              </div>
              <Utensils className="w-5 h-5" style={{ color: ACCENT }} />
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative mb-4"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: TEXT_SEC }} />
              <input
                type="text"
                placeholder="Поиск блюд..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-white/30 focus:outline-none text-sm"
                style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}`, backdropFilter: 'blur(20px)', fontFamily: INTER }}
              />
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide"
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3.5 py-2 rounded-full whitespace-nowrap transition-all"
                  style={{
                    background: selectedCategory === cat ? `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)` : GLASS,
                    color: selectedCategory === cat ? BG : TEXT_SEC,
                    border: `1px solid ${selectedCategory === cat ? 'transparent' : GLASS_BORDER}`,
                    fontFamily: INTER, fontSize: '0.75rem', fontWeight: selectedCategory === cat ? 600 : 400
                  }}
                >
                  {cat !== 'Все' && CATEGORY_ICONS[cat] ? `${CATEGORY_ICONS[cat]} ` : ''}{cat}
                </button>
              ))}
            </m.div>
          </div>

          <div className="px-4 space-y-3 pb-4">
            {filteredDishes.length === 0 ? (
              <EmptyState type="search" title="Ничего не найдено" description="Попробуйте изменить параметры поиска" />
            ) : (
              renderCatalogGrid()
            )}
          </div>
        </div>

        {quickViewDish && (
          <DishQuickView
            dish={quickViewDish}
            onClose={() => setQuickViewDish(null)}
            onAddToCart={handleAddToCart}
            isFav={isFavorite(quickViewDish.id)}
            onToggleFav={() => toggleFavorite(quickViewDish.id)}
          />
        )}
      </>
    );
  }

  if (activeTab === 'cart') {
    return (
      <>
        <DemoSidebar
          isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open}
          menuItems={sidebarMenuItems} accentColor={ACCENT} bgColor={BG}
          title="DeluxeDine" subtitle="Fine dining experience"
        />
        <div className="min-h-screen text-white pb-32 smooth-scroll-page" style={{ background: BG }}>
          <div className="px-5 pt-5">
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Заказ</span>
              <h1 style={{ fontFamily: PLAYFAIR, fontSize: '1.8rem', fontWeight: 400, color: '#fff', marginTop: 2 }}>Ваша <span style={{ fontStyle: 'italic' }}>корзина</span></h1>
            </m.div>

            {cartItems.length === 0 ? (
              <EmptyState
                type="cart"
                title="Корзина пуста"
                description="Добавьте блюда из нашего меню"
                actionLabel="Перейти в меню"
                onAction={() => onTabChange?.('catalog')}
              />
            ) : (
              <div className="space-y-3 mb-40">
                {cartItems.map((item, idx) => (
                  <m.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex gap-3.5 p-3 rounded-2xl"
                    style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${GLASS_BORDER}` }}>
                      <LazyImage src={item.image || ''} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <p className="truncate" style={{ fontFamily: INTER, fontSize: '0.85rem', fontWeight: 500, color: '#fff', marginBottom: 2 }}>{item.name}</p>
                        <p style={{ fontFamily: INTER, fontSize: '0.8rem', fontWeight: 700, color: ACCENT }}>{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white/60"
                          style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                        >
                          {item.quantity > 1 ? '−' : <X className="w-3 h-3" />}
                        </button>
                        <span style={{ fontFamily: INTER, fontSize: '0.85rem', fontWeight: 600, color: '#fff', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white/60"
                          style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </m.div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="fixed bottom-24 left-0 right-0 px-5 py-4 z-30" style={{ background: `${BG}f0`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${GLASS_BORDER}` }}>
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontFamily: INTER, fontSize: '0.85rem', color: TEXT_SEC }}>Итого</span>
                  <span style={{ fontFamily: PLAYFAIR, fontSize: '1.4rem', fontWeight: 600, color: ACCENT }}>{formatPrice(totalAmount)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 rounded-xl active:scale-[0.97]"
                  style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, color: BG, fontFamily: INTER, fontSize: '0.85rem', fontWeight: 600, transition: 'transform 0.15s ease' }}
                >
                  Оформить заказ
                </button>
              </div>
            </div>
          )}

          <CheckoutDrawer
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            items={cartItems}
            total={totalAmount}
            currency="₽"
            storeName="DeluxeDine"
            onOrderComplete={handleCheckoutComplete}
          />
        </div>
      </>
    );
  }

  if (activeTab === 'profile') {
    return (
      <>
        <DemoSidebar
          isOpen={sidebar.isOpen} onClose={sidebar.close} onOpen={sidebar.open}
          menuItems={sidebarMenuItems} accentColor={ACCENT} bgColor={BG}
          title="DeluxeDine" subtitle="Fine dining experience"
        />
        <div className="min-h-screen text-white pb-24 smooth-scroll-page" style={{ background: BG }}>
          <div className="px-5 pt-5">
            <m.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <span style={{ fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT }}>Аккаунт</span>
              <h1 style={{ fontFamily: PLAYFAIR, fontSize: '1.8rem', fontWeight: 400, color: '#fff', marginTop: 2 }}>Ваш <span style={{ fontStyle: 'italic' }}>профиль</span></h1>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center mb-8"
            >
              <div className="w-24 h-24 rounded-full mx-auto mb-4 p-[2px]" style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)` }}>
                <div className="w-full h-full rounded-full flex items-center justify-center" style={{ background: BG }}>
                  <User className="w-10 h-10" style={{ color: ACCENT }} />
                </div>
              </div>
              <h2 style={{ fontFamily: PLAYFAIR, fontSize: '1.3rem', fontWeight: 600, color: '#fff', marginBottom: 4 }}>Дмитрий Соколов</h2>
              <p style={{ fontFamily: INTER, fontSize: '0.75rem', color: TEXT_SEC }}>dmitry.sokolov@example.com</p>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-3 gap-2.5 mb-8"
            >
              {[
                { icon: ShoppingBag, value: orders.length, label: 'Заказов' },
                { icon: Heart, value: favorites.size, label: 'Избранное' },
                { icon: Award, value: '250', label: 'Баллов' }
              ].map((stat, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl text-center" style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}>
                  <stat.icon className="w-4 h-4 mx-auto mb-2" style={{ color: ACCENT }} />
                  <p style={{ fontFamily: INTER, fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{stat.value}</p>
                  <p style={{ fontFamily: INTER, fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: TEXT_SEC }}>{stat.label}</p>
                </div>
              ))}
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mb-6"
            >
              <h3 style={{ fontFamily: PLAYFAIR, fontSize: '1.2rem', fontWeight: 500, color: '#fff', marginBottom: 12 }}>Мои заказы</h3>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-3" style={{ color: GLASS_BORDER }} />
                  <p style={{ fontFamily: INTER, fontSize: '0.8rem', color: TEXT_SEC }}>У вас пока нет заказов</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order, idx) => (
                    <m.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + idx * 0.05 }}
                      className="p-4 rounded-xl"
                      style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}` }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span style={{ fontFamily: INTER, fontSize: '0.7rem', color: TEXT_SEC }}>#{order.id.slice(-8)}</span>
                        <span className="px-2 py-0.5 rounded-full" style={{ background: `${ACCENT}20`, color: ACCENT, fontFamily: INTER, fontSize: '0.6rem', fontWeight: 600 }}>
                          {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтвержден' : order.status === 'processing' ? 'Готовится' : order.status === 'shipped' ? 'В пути' : 'Доставлен'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span style={{ fontFamily: INTER, fontSize: '0.75rem', color: TEXT_SEC }}>{order.items.length} блюд</span>
                        <span style={{ fontFamily: INTER, fontSize: '0.9rem', fontWeight: 700, color: ACCENT }}>{formatPrice(order.total)}</span>
                      </div>
                    </m.div>
                  ))}
                </div>
              )}
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="space-y-2"
            >
              {[
                { icon: Package, label: 'История заказов' },
                { icon: Utensils, label: 'Забронировать стол' },
                { icon: Phone, label: 'Контакты' },
                { icon: Crown, label: 'Программа лояльности' }
              ].map((item, idx) => (
                <button
                  key={idx}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[0.98]"
                  style={{ background: GLASS, border: `1px solid ${GLASS_BORDER}`, transition: 'transform 0.15s ease' }}
                >
                  <item.icon className="w-5 h-5" style={{ color: ACCENT }} />
                  <span className="flex-1 text-left" style={{ fontFamily: INTER, fontSize: '0.85rem', fontWeight: 500, color: '#fff' }}>{item.label}</span>
                  <ChevronRight className="w-4 h-4" style={{ color: TEXT_SEC }} />
                </button>
              ))}
            </m.div>
          </div>
        </div>
      </>
    );
  }

  return null;
});

function RestaurantWithTheme(props: RestaurantProps) {
  return (
    <DemoThemeProvider themeId="restaurant">
      <Restaurant {...props} />
    </DemoThemeProvider>
  );
}

export default memo(RestaurantWithTheme);
