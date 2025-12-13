import { useState, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, X, ChevronLeft, Filter, Star, Package, CreditCard, MapPin, Settings, LogOut, User, Sparkles, TrendingUp, Zap, Search, Menu, Home, Grid, Tag, Plus, Minus, Flower2, Leaf, Clock, Truck } from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
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

const flowerVideo = "/attached_assets/5d2ab0bb92c8c7530a889b407ef3d457_1765617456150.mp4";

interface FloristProps {
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

interface FlowerProduct {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
  category: string;
  occasion: string[];
  sizes: string[];
  colors: string[];
  colorHex: string[];
  freshness: string;
  rating: number;
  inStock: number;
  seasonality: string;
  vaseLife: string;
  careInstructions: string;
  flowerOrigin: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const flowers: FlowerProduct[] = [
  { 
    id: 1, 
    name: 'Букет из красных роз', 
    price: 4500, 
    oldPrice: 5500,
    image: '/attached_assets/загруженное_(11)_1765617663840.jfif', 
    description: 'Роскошная симфония из 15 эквадорских роз сорта Freedom с бархатными лепестками глубокого рубинового оттенка. Каждый бутон отобран вручную на плантациях высокогорья Эквадора, где чистейший горный воздух наполняет цветы особой силой. Аромат сочетает ноты спелой малины, утренней росы и легкий шлейф сандалового дерева.', 
    category: 'Розы', 
    occasion: ['Признание в любви', 'Юбилей', 'Предложение руки и сердца'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Красный', 'Бордо'],
    colorHex: ['#DC2626', '#7C2D12'],
    freshness: '7 дней', 
    rating: 4.9, 
    inStock: 12,
    seasonality: 'Круглый год',
    vaseLife: '10-14 дней при правильном уходе',
    careInstructions: 'Подрезать стебли под углом 45°, менять воду каждые 2 дня, добавлять специальную подкормку',
    flowerOrigin: 'Высокогорные плантации Эквадора, 2800м над уровнем моря',
    isNew: true,
    isTrending: true
  },
  { 
    id: 2, 
    name: 'Белые пионы', 
    price: 3800, 
    oldPrice: 4800,
    image: '/attached_assets/загруженное_(12)_1765617739993.jfif', 
    description: 'Облако нежнейших белоснежных пионов сорта Duchess de Nemours с роскошными многослойными лепестками цвета первого снега. Их пьянящий аромат наполняет пространство нотами жасмина, свежести и едва уловимой сладости мёда. Каждый бутон раскрывается словно балерина на сцене, обнажая шелковистую текстуру лепестков.', 
    category: 'Пионы', 
    occasion: ['Свадьба', 'Помолвка', 'Рождение ребёнка'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Белый', 'Кремовый'],
    colorHex: ['#FAFAFA', '#FEF3C7'],
    freshness: '5 дней', 
    rating: 4.8, 
    inStock: 8,
    seasonality: 'Май — Июль',
    vaseLife: '5-7 дней при прохладной температуре',
    careInstructions: 'Держать вдали от прямых солнечных лучей, менять воду ежедневно, подрезать стебли каждые 2 дня',
    flowerOrigin: 'Частные сады Голландии, провинция Северный Брабант',
    isNew: true,
    isTrending: true
  },
  { 
    id: 3, 
    name: 'Микс из тюльпанов', 
    price: 3200, 
    image: '/attached_assets/101_тюльпан_1765617785350.jfif', 
    description: 'Радужная палитра голландских тюльпанов премиум класса — настоящий праздник весны в каждом лепестке. Бархатистые бутоны в оттенках розового заката, солнечного золота и небесной лазури сплетаются в единую гармонию цвета. Нежный, едва уловимый аромат свежести напоминает о первых тёплых днях и пробуждении природы.', 
    category: 'Тюльпаны', 
    occasion: ['8 Марта', 'Весенний праздник', 'Поздравление'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Микс', 'Розовый', 'Жёлтый'],
    colorHex: ['#EC4899', '#F472B6', '#FACC15'],
    freshness: '4 дня', 
    rating: 4.7, 
    inStock: 15,
    seasonality: 'Февраль — Май',
    vaseLife: '5-7 дней в прохладном месте',
    careInstructions: 'Использовать холодную воду, добавить каплю лимонного сока, держать вдали от фруктов',
    flowerOrigin: 'Королевские поля Голландии, регион Лиссе',
    isTrending: true
  },
  { 
    id: 4, 
    name: 'Орхидея в горшке', 
    price: 5500, 
    image: '/attached_assets/загруженное_(13)_1765617859249.jfif', 
    description: 'Величественная орхидея фаленопсис с каскадом изысканных цветков, напоминающих крылья экзотических бабочек. Её восковые лепестки с перламутровым отливом хранят тайны тропических лесов Юго-Восточной Азии. Тонкий аромат ванили и орхидеи создаёт атмосферу роскоши и утончённости.', 
    category: 'Горшечные', 
    occasion: ['Подарок на новоселье', 'День рождения', 'Благодарность'], 
    sizes: ['Маленький', 'Средний'],
    colors: ['Белый', 'Фиолетовый', 'Розовый'],
    colorHex: ['#FAFAFA', '#A855F7', '#F9A8D4'],
    freshness: '30 дней', 
    rating: 4.8, 
    inStock: 6,
    seasonality: 'Круглый год',
    vaseLife: 'До 3 месяцев цветения при правильном уходе',
    careInstructions: 'Поливать раз в неделю методом погружения, опрыскивать листья, избегать прямых солнечных лучей',
    flowerOrigin: 'Тепличные хозяйства Тайваня, остров орхидей',
    isNew: true
  },
  { 
    id: 5, 
    name: 'Букет невесты', 
    price: 8500, 
    image: 'https://images.unsplash.com/photo-1594736797933-d0d4bce9b91a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Изысканная свадебная композиция из белоснежных роз David Austin с атласными лепестками и нежнейшей эустомы оттенка шампанского. Лёгкие веточки гипсофилы создают воздушное облако, словно фата невесты. Аромат сочетает ноты розы, фрезии и свежей зелени — запах счастья и начала новой жизни.', 
    category: 'Свадебные', 
    occasion: ['Свадьба', 'Венчание', 'Помолвка'], 
    sizes: ['Стандарт', 'Премиум'],
    colors: ['Белый', 'Шампань'],
    colorHex: ['#FFFFFF', '#FEF3C7'],
    freshness: '8 дней', 
    rating: 4.9, 
    inStock: 4,
    seasonality: 'Круглый год',
    vaseLife: '8-12 дней с флористическим питанием',
    careInstructions: 'Беречь от жары, обновлять срез каждый день, держать в специальном растворе',
    flowerOrigin: 'Английские розарии Девона и голландские теплицы',
    isTrending: true
  },
  { 
    id: 6, 
    name: 'Хризантемы осенние', 
    price: 2800, 
    image: 'https://images.unsplash.com/photo-1571043733612-39d1e4d57447?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Пышные кустовые хризантемы в палитре золотой осени — от медового янтаря до глубокого бордо, словно листья в октябрьском парке. Каждый цветок с сотнями миниатюрных лепестков создаёт объёмную текстуру невероятной красоты. Терпкий травянистый аромат с нотами полыни и мёда напоминает о тёплых осенних вечерах.', 
    category: 'Хризантемы', 
    occasion: ['День учителя', 'Осенний праздник', 'Благодарность'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Жёлтый', 'Оранжевый', 'Бордо'],
    colorHex: ['#FACC15', '#F97316', '#9F1239'],
    freshness: '10 дней', 
    rating: 4.5, 
    inStock: 20,
    seasonality: 'Сентябрь — Ноябрь',
    vaseLife: '14-21 день при правильном уходе',
    careInstructions: 'Удалять нижние листья, менять воду каждые 3 дня, добавлять аспирин',
    flowerOrigin: 'Фермерские хозяйства Краснодарского края'
  },
  { 
    id: 7, 
    name: 'Лилии белые', 
    price: 4200, 
    image: 'https://images.unsplash.com/photo-1574159103905-55b657e045cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Царственные восточные лилии сорта Касабланка с крупными бутонами цвета слоновой кости и изящно загнутыми лепестками. Их головокружительный аромат — густой, сладковатый, с нотами гардении и жасмина — наполняет всё пространство магией. Бархатистая текстура лепестков с мельчайшими капельками нектара притягивает взгляд.', 
    category: 'Лилии', 
    occasion: ['Траурная церемония', 'Память', 'Духовный праздник'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Белый', 'Кремовый'],
    colorHex: ['#FAFAFA', '#FFFBEB'],
    freshness: '6 дней', 
    rating: 4.6, 
    inStock: 10,
    seasonality: 'Июнь — Сентябрь',
    vaseLife: '7-10 дней, бутоны раскрываются постепенно',
    careInstructions: 'Удалять пыльники для продления свежести, менять воду часто, подрезать стебли',
    flowerOrigin: 'Лилейные поля Нидерландов, регион Вестланд'
  },
  { 
    id: 8, 
    name: 'Полевые цветы', 
    price: 2500, 
    image: 'https://images.unsplash.com/photo-1586136867486-b9da8c85c8c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Романтичная россыпь полевых цветов — ромашки с золотыми сердцевинками, нежные васильки цвета летнего неба и пушистые колоски злаков. Этот букет хранит дыхание июльского луга, согретого солнцем и овеянного тёплым ветром. Свежий травянистый аромат с медовыми нотами переносит в беззаботное детство.', 
    category: 'Полевые', 
    occasion: ['Романтическое свидание', 'Признание', 'Просто так'], 
    sizes: ['Маленький', 'Средний'],
    colors: ['Микс', 'Синий'],
    colorHex: ['#86EFAC', '#3B82F6'],
    freshness: '3 дня', 
    rating: 4.4, 
    inStock: 25,
    seasonality: 'Июнь — Август',
    vaseLife: '3-5 дней в прохладе',
    careInstructions: 'Держать в прохладном месте, менять воду ежедневно, подрезать стебли под водой',
    flowerOrigin: 'Экологически чистые луга Подмосковья'
  },
  { 
    id: 9, 
    name: 'Гортензия синяя', 
    price: 4800, 
    oldPrice: 5800,
    image: 'https://images.unsplash.com/photo-1463320898994-e8e8ac0e3534?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Волшебные соцветия гортензии в оттенках индиго и небесной лазури — словно кусочек летнего неба, заключённый в лепестки. Каждая шапка состоит из сотен миниатюрных цветков, создающих невероятный объём и воздушность. Лёгкий, едва уловимый аромат свежести и чистоты.', 
    category: 'Гортензии', 
    occasion: ['День рождения', 'Подарок маме', 'Выражение восхищения'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Синий', 'Голубой', 'Фиолетовый'],
    colorHex: ['#3B82F6', '#60A5FA', '#8B5CF6'],
    freshness: '8 дней', 
    rating: 4.7, 
    inStock: 7,
    seasonality: 'Июнь — Октябрь',
    vaseLife: '7-10 дней при обильном поливе',
    careInstructions: 'Погружать соцветия в воду на 30 минут ежедневно, использовать много воды, прохладное место',
    flowerOrigin: 'Садовые питомники Бретани, Франция',
    isNew: true
  },
  { 
    id: 10, 
    name: 'Подсолнухи', 
    price: 3500, 
    image: 'https://images.unsplash.com/photo-1597848212624-e6bf2c8b4d8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Солнечные гиганты с бархатистыми лепестками цвета спелого мёда и выразительными тёмными сердцевинами, усыпанными семенами. Каждый цветок — маленькое солнце, несущее тепло и радость в самый пасмурный день. Лёгкий ореховый аромат с нотами подсолнечного масла и летнего поля.', 
    category: 'Подсолнухи', 
    occasion: ['Поднять настроение', 'Выздоровление', 'Новоселье'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Жёлтый', 'Оранжевый'],
    colorHex: ['#FACC15', '#FB923C'],
    freshness: '5 дней', 
    rating: 4.6, 
    inStock: 18,
    seasonality: 'Июль — Сентябрь',
    vaseLife: '5-8 дней в чистой воде',
    careInstructions: 'Использовать просторную вазу, много воды, подрезать толстые стебли острым ножом',
    flowerOrigin: 'Солнечные поля Краснодара и Ростовской области'
  },
  { 
    id: 11, 
    name: 'Композиция в коробке', 
    price: 6500, 
    oldPrice: 7500,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Роскошная флористическая композиция в бархатистой шляпной коробке — розы оттенка пудры, ароматный эвкалипт с серебристыми листьями и изящные веточки брунии. Каждый элемент подобран с ювелирной точностью и уложен на флористическую губку для максимальной свежести.', 
    category: 'Композиции', 
    occasion: ['VIP подарок', 'Юбилей компании', 'Благодарность партнёру'], 
    sizes: ['Средний', 'Большой'],
    colors: ['Пудра', 'Розовый'],
    colorHex: ['#FECDD3', '#F9A8D4'],
    freshness: '7 дней', 
    rating: 4.8, 
    inStock: 9,
    seasonality: 'Круглый год',
    vaseLife: '7-10 дней без пересадки',
    careInstructions: 'Поливать губку каждые 2 дня, не допускать пересыхания, беречь от солнца',
    flowerOrigin: 'Авторская работа флористов салона, премиум материалы из Голландии',
    isNew: true,
    isTrending: true
  },
  { 
    id: 12, 
    name: 'Эустома разноцветная', 
    price: 4000, 
    image: 'https://images.unsplash.com/photo-1492552264149-86a37d023ceb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Нежнейшая эустома в переливах пастельных оттенков — от сливочного крема до лавандового тумана и персикового рассвета. Её многослойные лепестки с атласной текстурой напоминают юбку балерины в грациозном па-де-де.', 
    category: 'Эустома', 
    occasion: ['Признание в чувствах', 'День матери', 'Нежный сюрприз'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Лавандовый', 'Персиковый', 'Кремовый'],
    colorHex: ['#C4B5FD', '#FDBA74', '#FEF3C7'],
    freshness: '6 дней', 
    rating: 4.5, 
    inStock: 14,
    seasonality: 'Круглый год',
    vaseLife: '10-14 дней при правильном уходе',
    careInstructions: 'Подрезать стебли каждые 2 дня, использовать чистую воду комнатной температуры',
    flowerOrigin: 'Японские селекционные сорта, выращенные в Нидерландах'
  },
  { 
    id: 13, 
    name: 'Каллы элегантные', 
    price: 5200, 
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2ac1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Изысканные каллы с безупречными линиями воронковидных цветков — воплощение архитектурной красоты в мире флоры. Их гладкие, словно отполированные, белоснежные покрывала с кремовым початком внутри напоминают скульптуры ар-деко.', 
    category: 'Каллы', 
    occasion: ['Торжественное событие', 'Свадьба', 'Открытие выставки'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Белый', 'Кремовый'],
    colorHex: ['#FAFAFA', '#FEF9C3'],
    freshness: '7 дней', 
    rating: 4.7, 
    inStock: 6,
    seasonality: 'Круглый год',
    vaseLife: '7-10 дней в высокой вазе',
    careInstructions: 'Использовать высокую вазу с небольшим количеством воды, менять воду каждые 2 дня',
    flowerOrigin: 'Калифорнийские фермы и южноафриканские плантации'
  },
  { 
    id: 14, 
    name: 'Герберы яркие', 
    price: 3000, 
    image: 'https://images.unsplash.com/photo-1516205651411-aef33a44f7c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Радостный фейерверк гербер в самых сочных оттенках лета — алом, как спелая вишня, оранжевом, как апельсиновая роща, и жёлтом, как полуденное солнце. Их идеально круглые лепестки с бархатистой текстурой и контрастные тёмные сердцевины создают графичный эффект.', 
    category: 'Герберы', 
    occasion: ['День рождения', 'Выздоровление', 'Просто порадовать'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Красный', 'Оранжевый', 'Жёлтый'],
    colorHex: ['#EF4444', '#F97316', '#FACC15'],
    freshness: '5 дней', 
    rating: 4.4, 
    inStock: 22,
    seasonality: 'Круглый год',
    vaseLife: '7-10 дней с подпоркой для стеблей',
    careInstructions: 'Подвязывать стебли, использовать неглубокую воду, добавлять сахар',
    flowerOrigin: 'Солнечные теплицы Кении и Нидерландов'
  },
  { 
    id: 15, 
    name: 'Фрезии ароматные', 
    price: 3600, 
    image: 'https://images.unsplash.com/photo-1511713847398-1b5e9c03035e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000', 
    description: 'Изящные фрезии с каскадом миниатюрных воронковидных цветков, источающих один из самых чарующих ароматов в цветочном мире. Их нежные лепестки в оттенках от чистого белого до розового зефира и солнечного жёлтого.', 
    category: 'Фрезии', 
    occasion: ['Романтический вечер', '8 Марта', 'Признание в любви'], 
    sizes: ['Маленький', 'Средний'],
    colors: ['Белый', 'Розовый', 'Жёлтый'],
    colorHex: ['#FAFAFA', '#FBCFE8', '#FDE047'],
    freshness: '4 дня', 
    rating: 4.6, 
    inStock: 16,
    seasonality: 'Февраль — Май',
    vaseLife: '5-7 дней при прохладной температуре',
    careInstructions: 'Держать в прохладе, подрезать стебли, бутоны раскрываются постепенно',
    flowerOrigin: 'Капская провинция ЮАР, культивированы в Голландии'
  },
  { 
    id: 16, 
    name: 'Антуриум красный', 
    price: 5800, 
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&h=1200&fit=crop&q=90', 
    description: 'Экзотический антуриум с глянцевыми сердцевидными покрывалами насыщенного алого цвета и изящными кремовыми початками. Его восковые листья отражают свет, создавая эффект лакированной поверхности.', 
    category: 'Экзотические', 
    occasion: ['VIP подарок', 'Корпоративное событие', 'Юбилей'], 
    sizes: ['Маленький', 'Средний'],
    colors: ['Красный', 'Бордо'],
    colorHex: ['#DC2626', '#991B1B'],
    freshness: '10 дней', 
    rating: 4.8, 
    inStock: 5,
    seasonality: 'Круглый год',
    vaseLife: '2-3 недели при правильном уходе',
    careInstructions: 'Опрыскивать покрывала, использовать тёплую воду, беречь от сквозняков',
    flowerOrigin: 'Тропические плантации Колумбии и Коста-Рики',
    isNew: true
  },
  { 
    id: 17, 
    name: 'Букет "Весенний бриз"', 
    price: 4400, 
    image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&h=1200&fit=crop&q=90', 
    description: 'Нежная весенняя композиция из пастельных ранункулюсов, душистого горошка и веточек эвкалипта. Букет создаёт атмосферу пробуждения природы и первых тёплых дней. Идеальный подарок для тех, кто скучает по весне.', 
    category: 'Композиции', 
    occasion: ['Весенний праздник', 'День матери', 'Поздравление'], 
    sizes: ['Маленький', 'Средний', 'Большой'],
    colors: ['Пастельный микс', 'Розовый'],
    colorHex: ['#FDF2F8', '#FBCFE8'],
    freshness: '5 дней', 
    rating: 4.7, 
    inStock: 11,
    seasonality: 'Март — Май',
    vaseLife: '5-8 дней при правильном уходе',
    careInstructions: 'Подрезать стебли, использовать прохладную воду, держать вдали от фруктов',
    flowerOrigin: 'Итальянские и голландские теплицы',
    isTrending: true
  }
];

const categories = ['Все', 'Розы', 'Пионы', 'Тюльпаны', 'Гортензии', 'Композиции', 'Экзотические'];

function Florist({ activeTab, onTabChange }: FloristProps) {
  const [selectedProduct, setSelectedProduct] = useState<FlowerProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
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
  } = usePersistentCart({ storageKey: 'florist_cart' });
  
  const { 
    favorites, 
    toggleFavorite, 
    isFavorite,
    favoritesCount 
  } = usePersistentFavorites({ storageKey: 'florist_favorites' });
  
  const { 
    orders, 
    createOrder,
    ordersCount 
  } = usePersistentOrders({ storageKey: 'florist_orders' });
  
  const sidebarMenuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Главная', active: activeTab === 'home' },
    { icon: <Grid className="w-5 h-5" />, label: 'Каталог', active: activeTab === 'catalog' },
    { icon: <Heart className="w-5 h-5" />, label: 'Избранное', badge: favoritesCount > 0 ? String(favoritesCount) : undefined },
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'Корзина', badge: cartCount > 0 ? String(cartCount) : undefined, badgeColor: 'var(--theme-primary)' },
    { icon: <Tag className="w-5 h-5" />, label: 'Акции', badge: 'NEW', badgeColor: '#EF4444' },
    { icon: <User className="w-5 h-5" />, label: 'Профиль', active: activeTab === 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Настройки' },
  ];

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: flowers,
    searchFields: ['name', 'description', 'category'] as (keyof FlowerProduct)[],
  });

  useEffect(() => {
    scrollToTop();
    if (activeTab !== 'catalog') {
      setSelectedProduct(null);
    }
  }, [activeTab]);

  const filteredProducts = filteredItems.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
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

  const openProduct = (product: FlowerProduct) => {
    scrollToTop();
    onTabChange?.('catalog');
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
    setSelectedColor(product.colors[0]);
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    addToCartPersistent({
      id: String(selectedProduct.id),
      name: selectedProduct.name,
      price: selectedProduct.price,
      size: selectedSize,
      image: selectedProduct.image,
      color: selectedColor
    });
    
    toast({
      title: 'Добавлено в корзину',
      description: `${selectedProduct.name} • ${selectedColor} • ${selectedSize}`,
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
    const bgGradient = 'linear-gradient(180deg, #2D1B2E 0%, #1A1A1A 100%)';
    
    return (
      <div className="min-h-screen text-white overflow-auto smooth-scroll-page" style={{ background: bgGradient }}>
        <div className="absolute top-0 left-0 right-0 z-10 demo-nav-safe flex items-center justify-between">
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
              className={`w-5 h-5 ${isFavorite(selectedProduct.id) ? 'fill-white text-white' : 'text-white'}`}
            />
          </button>
        </div>

        <div className="relative h-[60vh]">
          <LazyImage
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative pb-56">
          <div className="bg-white/10 backdrop-blur-xl rounded-t-3xl p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
              <div className="flex items-center justify-center gap-3">
                <p className="text-3xl font-bold">{formatPrice(selectedProduct.price)}</p>
                {selectedProduct.oldPrice && (
                  <p className="text-xl text-white/50 line-through">{formatPrice(selectedProduct.oldPrice)}</p>
                )}
              </div>
            </div>

            <p className="text-sm text-white/80 text-center">{selectedProduct.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Свежесть в вазе</span>
                </div>
                <p className="font-medium">{selectedProduct.vaseLife}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 text-white/60 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Происхождение</span>
                </div>
                <p className="font-medium text-xs">{selectedProduct.flowerOrigin.split(',')[0]}</p>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 text-white/60 mb-2">
                <Leaf className="w-4 h-4" />
                <span className="text-sm">Уход за букетом</span>
              </div>
              <p className="text-sm">{selectedProduct.careInstructions}</p>
            </div>

            <div>
              <p className="text-sm mb-3 text-white/80 text-center">Выберите цвет:</p>
              <div className="flex items-center justify-center gap-3">
                {selectedProduct.colors.map((color, idx) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-white scale-110'
                        : 'border-white/30'
                    }`}
                    style={{ backgroundColor: selectedProduct.colorHex[idx] }}
                    data-testid={`button-color-${color}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm mb-3 text-white/80 text-center">Выберите размер:</p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {selectedProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all text-sm ${
                      selectedSize === size
                        ? 'bg-[var(--theme-primary)] text-black'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                    data-testid={`button-size-${size}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div 
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{ perspective: '1000px' }}
        >
          <div 
            className="absolute -top-8 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)',
              transform: 'rotateX(45deg)',
              transformOrigin: 'bottom center',
            }}
          />
          
          <div 
            className="relative rounded-t-3xl border-t border-white/20 p-6 pb-8"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <div 
              className="absolute inset-0 rounded-t-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)',
              }}
            />
            
            <ConfirmDrawer
              trigger={
                <button
                  className="relative w-full bg-[var(--theme-primary)] text-black font-bold py-4 rounded-full hover:bg-[var(--theme-accent)] transition-all shadow-lg"
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 40px rgba(var(--theme-primary-rgb, 255,255,255), 0.15)',
                  }}
                  data-testid="button-buy-now"
                >
                  Добавить в корзину
                </button>
              }
              title="Добавить в корзину?"
              description={`${selectedProduct.name} • ${selectedColor} • ${selectedSize}`}
              confirmText="Добавить"
              cancelText="Отмена"
              variant="default"
              onConfirm={addToCart}
            />
            
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'home') {
    return (
      <div className="min-h-screen bg-[#FDF8F5] text-[#1A1A1A] overflow-auto pb-24 smooth-scroll-page">
        <DemoSidebar
          isOpen={sidebar.isOpen}
          onClose={sidebar.close}
          onOpen={sidebar.open}
          menuItems={sidebarMenuItems}
          title="BLOOM"
          subtitle="STUDIO"
          accentColor="#F472B6"
          bgColor="#FDF8F5"
        />
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <button 
              onClick={sidebar.open}
              aria-label="Меню" 
              data-testid="button-view-menu"
            >
              <Menu className="w-6 h-6 text-[#1A1A1A]" />
            </button>
            <div className="flex items-center gap-3">
              <button aria-label="Корзина" data-testid="button-view-cart">
                <ShoppingBag className="w-6 h-6 text-[#1A1A1A]" />
              </button>
              <button aria-label="Избранное" data-testid="button-view-favorites">
                <Heart className="w-6 h-6 text-[#1A1A1A]" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-4xl font-black mb-1 tracking-tight text-[#1A1A1A]">
              BLOOM<br/>
              STUDIO
            </h1>
            <p className="text-[#6B7280] text-sm">Премиальная флористика</p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#F472B6] text-white'
                    : 'bg-white text-[#6B7280] shadow-sm hover:bg-gray-50'
                }`}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 bg-white shadow-sm border border-[#E5E7EB] rounded-full px-4 py-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Поиск букетов..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent text-[#1A1A1A] placeholder:text-[#9CA3AF] outline-none flex-1 text-sm"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="relative mb-6 mx-6 rounded-3xl overflow-hidden" style={{ height: '500px' }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            data-testid="video-hero-banner"
          >
            <source src={flowerVideo} type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-5xl font-black mb-3 tracking-tight leading-tight text-white">
                ВЕСЕННЯЯ<br/>
                КОЛЛЕКЦИЯ
              </h2>
              <p className="text-lg text-white/80 mb-6" style={{ letterSpacing: '0.1em' }}>
                Свежие цветы каждый день
              </p>
              <button 
                className="px-8 py-4 rounded-full font-bold text-black transition-all hover:scale-105"
                style={{
                  background: 'var(--theme-primary)',
                  boxShadow: '0 0 30px var(--theme-primary-glow, rgba(205, 255, 56, 0.4))'
                }}
                data-testid="button-view-collection"
              >
                Смотреть букеты
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

              <div className="absolute top-4 left-4">
                <div className="px-3 py-1 bg-white/20 backdrop-blur-xl rounded-full">
                  <span className="text-xs font-semibold text-white">
                    {product.isNew ? 'Новинка' : product.category}
                  </span>
                </div>
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
                  className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-white text-white' : 'text-white'}`}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2 leading-tight text-white">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/80 mb-4">{product.freshness} свежести</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openProduct(product);
                    }}
                    aria-label="Добавить в корзину"
                    className="w-14 h-14 rounded-full bg-[var(--theme-primary)] flex items-center justify-center hover:bg-[var(--theme-accent)] transition-all hover:scale-110"
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    <ShoppingBag className="w-6 h-6 text-black" />
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-lg font-bold text-white">{formatPrice(product.price)}</p>
                  {product.inStock < 10 && (
                    <UrgencyIndicator 
                      type="stock"
                      value={product.inStock}
                      variant="badge"
                      className="mt-2"
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
      <div className="min-h-screen bg-[#FDF8F5] text-[#1A1A1A] overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 scroll-fade-in">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Каталог букетов</h1>
            <div className="flex items-center gap-3">
              <button className="p-2" aria-label="Поиск" data-testid="button-view-search">
                <Search className="w-6 h-6 text-[#1A1A1A]" />
              </button>
              <button className="p-2" aria-label="Фильтр" data-testid="button-view-filter">
                <Filter className="w-6 h-6 text-[#1A1A1A]" />
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
                    ? 'bg-[#F472B6] text-white'
                    : 'bg-white text-[#6B7280] shadow-sm hover:bg-gray-50'
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
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-3 bg-white shadow-sm">
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
                    className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-xl flex items-center justify-center shadow-sm"
                    data-testid={`button-favorite-catalog-${product.id}`}
                  >
                    <Heart 
                      className={`w-4 h-4 ${isFavorite(product.id) ? 'fill-[#F472B6] text-[#F472B6]' : 'text-[#6B7280]'}`}
                    />
                  </button>

                  {product.isNew && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#F472B6] text-white text-xs font-bold rounded-full">
                      NEW
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1 truncate text-[#1A1A1A]">{product.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-base font-bold text-[#1A1A1A]">{formatPrice(product.price)}</p>
                    {product.oldPrice && (
                      <p className="text-xs text-[#9CA3AF] line-through">{formatPrice(product.oldPrice)}</p>
                    )}
                  </div>
                  {product.inStock < 10 && (
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
      <div className="min-h-screen bg-[#FDF8F5] text-[#1A1A1A] overflow-auto pb-32 smooth-scroll-page">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-[#1A1A1A]">Корзина</h1>

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
                  className="bg-white shadow-sm rounded-2xl p-4 flex gap-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <LazyImage
                    src={item.image || ''}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-[#1A1A1A]">{item.name}</h3>
                    <p className="text-sm text-[#6B7280] mb-2">
                      {item.color} • {item.size}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-[#1A1A1A]">{formatPrice(item.price * item.quantity)}</p>
                      <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-full px-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-[#1A1A1A]"
                          aria-label="Уменьшить количество"
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-semibold text-[#1A1A1A]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          className="w-8 h-8 flex items-center justify-center text-[#1A1A1A]"
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
                    className="w-10 h-10 flex items-center justify-center text-[#6B7280]"
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}

              <div className="fixed bottom-24 left-0 right-0 p-6 bg-[#FDF8F5] border-t border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-[#1A1A1A]">Итого:</span>
                  <span className="text-2xl font-bold text-[#1A1A1A]">{formatPrice(cartTotal)}</span>
                </div>
                <TrustBadges variant="compact" className="mb-4" />
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[#F472B6] text-white font-bold py-4 rounded-full hover:bg-[#EC4899] transition-all min-h-[48px]"
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
                storeName="BLOOM STUDIO"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="min-h-screen bg-[#FDF8F5] text-[#1A1A1A] overflow-auto pb-24 smooth-scroll-page">
        <div className="p-6 bg-white shadow-sm border-b border-[#E5E7EB]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F472B6] to-[#EC4899] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A]">Анна Цветкова</h2>
              <p className="text-sm text-[#6B7280]">+7 (999) 123-45-67</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-white shadow-sm rounded-xl border border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-1">Заказы</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{ordersCount}</p>
            </div>
            <div className="p-4 bg-white shadow-sm rounded-xl border border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-1">Избранное</p>
              <p className="text-2xl font-bold text-[#1A1A1A]">{favoritesCount}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="scroll-fade-in">
            <h3 className="text-lg font-bold mb-4 text-[#1A1A1A]">Мои заказы</h3>
            {orders.length === 0 ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>У вас пока нет заказов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white shadow-sm rounded-xl p-4 border border-[#E5E7EB]" data-testid={`order-${order.id}`}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-[#6B7280]">Заказ #{order.id.slice(-6)}</span>
                      <span className="text-sm text-[#6B7280]">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-[#4B5563]">{order.items.length} букетов</span>
                      <span className="font-bold text-[#1A1A1A]">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-[#FDF2F8] text-[#F472B6] rounded-full">
                        {order.status === 'pending' ? 'Ожидает' : order.status === 'confirmed' ? 'Подтверждён' : order.status === 'processing' ? 'В обработке' : order.status === 'shipped' ? 'Доставляется' : 'Доставлен'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
          <button className="w-full p-4 bg-white shadow-sm rounded-xl border border-[#E5E7EB] flex items-center justify-between hover:bg-gray-50 transition-colors" data-testid="button-orders">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-[#6B7280]" />
              <span className="font-medium text-[#1A1A1A]">История заказов</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-[#9CA3AF]" />
          </button>

          <button className="w-full p-4 bg-white shadow-sm rounded-xl border border-[#E5E7EB] flex items-center justify-between hover:bg-gray-50 transition-colors" data-testid="button-favorites">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#6B7280]" />
              <span className="font-medium text-[#1A1A1A]">Избранное</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-[#9CA3AF]" />
          </button>

          <button className="w-full p-4 bg-white shadow-sm rounded-xl border border-[#E5E7EB] flex items-center justify-between hover:bg-gray-50 transition-colors" data-testid="button-delivery">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#6B7280]" />
              <span className="font-medium text-[#1A1A1A]">Адреса доставки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-[#9CA3AF]" />
          </button>

          <button className="w-full p-4 bg-white shadow-sm rounded-xl border border-[#E5E7EB] flex items-center justify-between hover:bg-gray-50 transition-colors" data-testid="button-payment">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-[#6B7280]" />
              <span className="font-medium text-[#1A1A1A]">Способы оплаты</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-[#9CA3AF]" />
          </button>

          <button className="w-full p-4 bg-white shadow-sm rounded-xl border border-[#E5E7EB] flex items-center justify-between hover:bg-gray-50 transition-colors" data-testid="button-settings">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#6B7280]" />
              <span className="font-medium text-[#1A1A1A]">Настройки</span>
            </div>
            <ChevronLeft className="w-5 h-5 rotate-180 text-[#9CA3AF]" />
          </button>

          <button className="w-full p-4 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between hover:bg-red-100 transition-colors mt-4" data-testid="button-logout">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-500">Выйти</span>
            </div>
          </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function FloristWithTheme(props: FloristProps) {
  return (
    <div style={{
      '--theme-primary': '#F472B6',
      '--theme-accent': '#EC4899',
      '--theme-background': '#FDF8F5',
      '--theme-primary-glow': 'rgba(244, 114, 182, 0.4)'
    } as React.CSSProperties}>
      <Florist {...props} />
    </div>
  );
}

export default memo(FloristWithTheme);
