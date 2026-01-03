import { useState, useEffect, memo } from "react";
import { m } from "framer-motion";
import { 
  Heart, 
  Star, 
  X,
  Clock,
  Utensils,
  ChevronLeft,
  ShoppingCart,
  User,
  MapPin,
  Phone,
  Package,
  Search,
  Wine,
  Flame
} from "lucide-react";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { useFilter } from "@/hooks/useFilter";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { DemoThemeProvider } from "@/components/shared";
import { useLanguage } from '../../contexts/LanguageContext';

interface RestaurantProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: number;
  items: OrderItem[];
  total: number;
  date: string;
  status: 'processing' | 'shipped' | 'delivered';
}

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
}

const luxuryColors = {
  bg: '#0A0A0A',
  bgSecondary: '#111111',
  gold: '#C9A96E',
  bronze: '#8B7355',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.10)',
};

const dishes: Dish[] = [
  {
    id: 1,
    name: 'Стейк Рибай',
    price: 3200,
    image: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=800&h=1000&fit=crop&q=95',
    description: 'Премиальный стейк из мраморной говядины Black Angus сухой выдержки 28 дней с идеальным мраморным рисунком. Готовится на гриле Josper при температуре 800°C для карамелизированной корочки и сочной серединки medium-rare. Подается с трюфельным демиглас и микс-салатом из руколы с пармезаном. Мясо поставляется с семейной фермы в Аргентине.',
    category: 'Основные блюда',
    cookTime: '25 мин',
    rating: 4.9,
    ingredients: ['Black Angus 28-дневной выдержки', 'Трюфельное масло', 'Флёр де сель', 'Розмарин свежий'],
    origin: 'Классический американский стейкхаус, адаптация шефа',
    chef: 'Шеф-повар Алексей Романов, мишленовский опыт',
    pairing: ['Красное вино Malbec', 'Каберне Совиньон', 'Виски Hibiki'],
    cookingMethod: 'Гриль Josper, 800°C, medium-rare',
    isChefSpecial: true
  },
  {
    id: 2,
    name: 'Лосось на пару',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=1000&fit=crop&q=95',
    description: 'Изысканное филе дикого норвежского лосося, приготовленное на пару с сохранением всех полезных свойств и нежнейшей текстуры. Подается на подушке из сезонных овощей гриль с шелковистым соусом терияки домашнего приготовления. Рыба доставляется самолетом дважды в неделю прямо с фьордов Норвегии. Гармоничное сочетание омега-3 жирных кислот и безупречного вкуса.',
    category: 'Основные блюда',
    cookTime: '20 мин',
    rating: 4.8,
    ingredients: ['Дикий норвежский лосось', 'Овощи гриль сезонные', 'Соус терияки домашний', 'Микрозелень'],
    origin: 'Скандинавская кухня с японским акцентом',
    chef: 'Шеф-повар Алексей Романов',
    pairing: ['Белое вино Шабли', 'Пино Гриджо', 'Саке премиум'],
    cookingMethod: 'Приготовление на пару, 85°C, 12 минут',
    isChefSpecial: true
  },
  {
    id: 3,
    name: 'Ризотто с белыми грибами',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1633337474564-1d9478ca4e2e?w=800&h=1000&fit=crop&q=95',
    description: 'Кремовое ризотто аль-онда из риса карнароли, приготовленное по классической итальянской технологии с постепенным добавлением грибного бульона. Ароматные белые грибы порчини, собранные в горах Пьемонта, придают блюду глубокий землистый вкус. Завершается щедрой порцией выдержанного пармезана Реджано 36 месяцев и каплей трюфельного масла. Каждая порция готовится индивидуально в течение 18 минут.',
    category: 'Основные блюда',
    cookTime: '30 мин',
    rating: 4.7,
    ingredients: ['Рис карнароли', 'Белые грибы порчини', 'Пармезан Реджано 36 месяцев', 'Трюфельное масло'],
    origin: 'Ломбардия, Северная Италия',
    chef: 'Су-шеф Марко Бернини',
    pairing: ['Бароло', 'Барбареско', 'Просекко брют'],
    cookingMethod: 'Классическая техника мантекатура',
    isNew: true
  },
  {
    id: 4,
    name: 'Утиная грудка',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=800&h=1000&fit=crop&q=95',
    description: 'Нежнейшая грудка утки породы Мулар с хрустящей карамелизированной кожицей и розовой серединкой, тающей во рту. Подается с изысканным апельсиновым соусом биграрад на основе утиного жю и ликера Grand Marnier. Картофельное пюре робюшон с добавлением сливочного масла из Нормандии создает идеальную гармонию вкусов. Утка выращивается на фермах Гаскони по традиционным методам.',
    category: 'Основные блюда',
    cookTime: '35 мин',
    rating: 4.9,
    ingredients: ['Утка Мулар из Гаскони', 'Апельсины сицилийские', 'Grand Marnier', 'Масло нормандское'],
    origin: 'Классика французской haute cuisine',
    chef: 'Шеф-повар Алексей Романов',
    pairing: ['Пино Нуар бургундский', 'Шампанское розе', 'Арманьяк'],
    cookingMethod: 'Конфи кожи, затем обжарка на сковороде, отдых 8 минут',
    isChefSpecial: true
  },
  {
    id: 5,
    name: 'Паста Карбонара',
    price: 1800,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=1000&fit=crop&q=95',
    description: 'Аутентичная римская карбонара, приготовленная строго по канонам итальянской кулинарной традиции без использования сливок. Шелковистый соус из свежайших фермерских желтков и выдержанного пекорино романо обволакивает каждую спагеттину. Хрустящие кусочки гуанчале, вяленного в подвалах Умбрии, придают блюду неповторимый солоноватый аромат. Свежемолотый черный перец телличерри завершает композицию.',
    category: 'Паста',
    cookTime: '15 мин',
    rating: 4.8,
    ingredients: ['Спагетти де Чекко', 'Гуанчале выдержанный', 'Пекорино Романо DOP', 'Желтки фермерские'],
    origin: 'Рим, Лацио, Италия',
    chef: 'Су-шеф Марко Бернини',
    pairing: ['Фраскати', 'Верментино', 'Просекко'],
    cookingMethod: 'Эмульгирование при 65°C без прямого нагрева'
  },
  {
    id: 6,
    name: 'Тальятелле с трюфелем',
    price: 2400,
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&h=1000&fit=crop&q=95',
    description: 'Домашняя паста тальятелле, раскатанная вручную до толщины 0.8 мм по старинному болонскому рецепту. Щедро украшена стружкой свежего черного трюфеля сорта Tuber Melanosporum из лесов Перигора. Нежный сливочный соус с добавлением трюфельного масла первого холодного отжима подчеркивает аромат редкого гриба. Это блюдо — настоящее признание в любви к итальянской гастрономии.',
    category: 'Паста',
    cookTime: '18 мин',
    rating: 4.9,
    ingredients: ['Паста домашняя', 'Черный трюфель Перигор', 'Трюфельное масло', 'Пармезан 24 месяца'],
    origin: 'Эмилия-Романья с французским акцентом',
    chef: 'Шеф-повар Алексей Романов',
    pairing: ['Бароло Ризерва', 'Брунелло ди Монтальчино', 'Шампанское блан де блан'],
    cookingMethod: 'Ручная раскатка, варка аль денте 3 минуты',
    isChefSpecial: true
  },
  {
    id: 7,
    name: 'Лобстер Фра Дьяволо',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=1000&fit=crop&q=95',
    description: 'Целый атлантический лобстер весом 800 грамм, выловленный в холодных водах Мэна и доставленный живым специально для вашего стола. Готовится в пикантном томатном соусе «Дьявольский огонь» с калабрийским перчиком и свежим чили. Подается на ложе из лингвини с ароматом моря и чеснока, обжаренного в оливковом масле экстра вирджин из Лигурии. Истинное произведение итало-американской кулинарной школы.',
    category: 'Паста',
    cookTime: '22 мин',
    rating: 4.8,
    ingredients: ['Лобстер атлантический 800г', 'Томаты Сан-Марцано', 'Перчик калабрийский', 'Лингвини'],
    origin: 'Итало-американская кухня, Нью-Йорк',
    chef: 'Шеф-повар Алексей Романов',
    pairing: ['Вермениторо ди Галлура', 'Соаве Классико', 'Апероль Шприц'],
    cookingMethod: 'Фламбирование в коньяке, томление в соусе 8 минут',
    isNew: true,
    isChefSpecial: true
  },
  {
    id: 8,
    name: 'Боскайола',
    price: 1900,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=1000&fit=crop&q=95',
    description: 'Паста в стиле «лесничего» — традиционное блюдо тосканских охотников с ароматом осеннего леса и дымных нот. Смесь лесных грибов — белые, лисички и шампиньоны — обжаривается с хрустящей панчеттой на медленном огне. Сливочный соус с добавлением белого вина и тимьяна объединяет все компоненты в гармоничную симфонию вкусов. Посыпается свежей петрушкой и тертым грана падано.',
    category: 'Паста',
    cookTime: '16 мин',
    rating: 4.6,
    ingredients: ['Пенне ригате', 'Микс лесных грибов', 'Панчетта тосканская', 'Сливки 33%'],
    origin: 'Тоскана, центральная Италия',
    chef: 'Су-шеф Марко Бернини',
    pairing: ['Кьянти Классико', 'Россо ди Монтальчино', 'Вино Нобиле'],
    cookingMethod: 'Обжарка на сильном огне, томление в сливках'
  },
  {
    id: 9,
    name: 'Устрицы свежие',
    price: 3800,
    image: 'https://images.unsplash.com/photo-1606850780554-b55ea4dd0b70?w=800&h=1000&fit=crop&q=95',
    description: 'Отборные устрицы сорта Fine de Claire из легендарных устричных ферм бассейна Марен-Олерон на атлантическом побережье Франции. Каждая раковина открывается непосредственно перед подачей, сохраняя кристальную свежесть океана. Подаются на ледяной подушке с классической мигнонеттой из красного винного уксуса с луком-шалотом и дольками лимона из Сорренто. Шесть совершенных образцов морского деликатеса высшей категории.',
    category: 'Закуски',
    cookTime: '5 мин',
    rating: 4.9,
    ingredients: ['Устрицы Fine de Claire №2', 'Мигнонетта домашняя', 'Лимон Сорренто', 'Лёд колотый'],
    origin: 'Марен-Олерон, Атлантическое побережье Франции',
    chef: 'Шеф-повар Алексей Романов',
    pairing: ['Шампанское Брют', 'Мюскаде-Севр-э-Мэн', 'Сансер'],
    cookingMethod: 'Подаются сырыми, открываются за 30 секунд до подачи',
    isChefSpecial: true
  },
  {
    id: 10,
    name: 'Фуа-гра',
    price: 4200,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=1000&fit=crop&q=95',
    description: 'Нежнейшая фуа-гра из гусиной печени категории Extra от легендарного поставщика Rougié, обжаренная до золотистой корочки снаружи и кремовой текстуры внутри. Подается с карамелизованными яблоками сорта Гренни Смит в соусе из сотерна и теплой бриошью с флёр де сель. Контраст между маслянистой печенью и кислинкой яблок создает идеальный баланс вкусов. Деликатес, достойный королевского стола.',
    category: 'Закуски',
    cookTime: '10 мин',
    rating: 4.8,
    ingredients: ['Фуа-гра гусиная Extra', 'Яблоки Гренни Смит', 'Сотерн', 'Бриошь домашняя'],
    origin: 'Перигор, Юго-Западная Франция',
    chef: 'Шеф-повар Алексей Романов',
    pairing: ['Сотерн', 'Гевюрцтраминер', 'Токай Асу'],
    cookingMethod: 'Обжарка на сухой сковороде 45 секунд с каждой стороны',
    isChefSpecial: true
  },
  {
    id: 11,
    name: 'Тар-тар из тунца',
    price: 2600,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=1000&fit=crop&q=95',
    description: 'Нежнейший тартар из свежего желтоперого тунца сашими-грейд, выловленного в водах Индийского океана у берегов Шри-Ланки. Маринуется в деликатном соусе из соевого соуса с цитрусом юзу и кунжутным маслом холодного отжима из Японии. Подается с воздушным муссом из спелого авокадо Хасс, хрустящими чипсами из тапиоки и икрой тобико. Каждая порция нарезается вручную непосредственно перед подачей шеф-поваром.',
    category: 'Закуски',
    cookTime: '8 мин',
    rating: 4.7,
    ingredients: ['Тунец желтоперый сашими', 'Авокадо Хасс', 'Соус юзу понзу', 'Икра тобико'],
    origin: 'Фьюжн японской и французской кухни',
    chef: 'Су-шеф Марко Бернини',
    pairing: ['Шабли Премье Крю', 'Саке Дайгинджо', 'Грюнер Вельтлинер'],
    cookingMethod: 'Ручная нарезка, маринование 3 минуты'
  },
  {
    id: 12,
    name: 'Буррата с томатами',
    price: 1600,
    image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&h=1000&fit=crop&q=95',
    description: 'Свежайшая буррата из Апулии с кремовой сердцевиной страчателла, которая буквально растекается при разрезании. Подается с ароматными томатами черри из вулканической почвы Везувия, обладающими уникальной сладостью. Украшается листьями базилика дженовезе и приправляется оливковым маслом первого холодного отжима из тысячелетних оливковых рощ Тосканы. Простота, возведенная в абсолют гастрономического совершенства.',
    category: 'Закуски',
    cookTime: '5 мин',
    rating: 4.8,
    ingredients: ['Буррата Апулия 150г', 'Томаты Везувий', 'Базилик дженовезе', 'Оливковое масло Тоскана'],
    origin: 'Апулия, Южная Италия',
    chef: 'Су-шеф Марко Бернини',
    pairing: ['Верментино ди Сардиньия', 'Фалангина', 'Просекко'],
    cookingMethod: 'Сервировка при комнатной температуре'
  },
  {
    id: 13,
    name: 'Тирамису',
    price: 900,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=1000&fit=crop&q=95',
    description: 'Легендарный итальянский десерт, приготовленный по секретному рецепту из Тревизо — родины тирамису. Слои воздушного крема из маскарпоне чередуются с печеньем савоярди, пропитанным крепким эспрессо с добавлением марсалы. Нежнейшая текстура, баланс горечи кофе и сладости крема, завершающий штрих какао-порошка Valrhona. Готовится ежедневно и выдерживается минимум 12 часов для идеального вкуса.',
    category: 'Десерты',
    cookTime: '5 мин',
    rating: 4.9,
    ingredients: ['Маскарпоне фермерский', 'Эспрессо арабика', 'Савоярди домашние', 'Какао Valrhona'],
    origin: 'Тревизо, Венето, Италия',
    chef: 'Шеф-кондитер Анна Морозова',
    pairing: ['Москато д\'Асти', 'Речото делла Вальполичелла', 'Эспрессо'],
    cookingMethod: 'Холодное приготовление, выдержка 12 часов'
  },
  {
    id: 14,
    name: 'Крем-брюле',
    price: 850,
    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=1000&fit=crop&q=95',
    description: 'Классический французский десерт с бархатистым заварным кремом на основе сливок нормандских коров и стручковой ванили с острова Мадагаскар. Хрустящая карамельная корочка образуется при помощи газовой горелки за несколько секунд до подачи, создавая контраст температур и текстур. Ледяной крем под раскаленной карамелью — это симфония ощущений. Рецепт датируется XVII веком и хранится в секрете французскими кондитерами.',
    category: 'Десерты',
    cookTime: '7 мин',
    rating: 4.8,
    ingredients: ['Сливки нормандские', 'Ваниль Мадагаскар', 'Желтки фермерские', 'Сахар демерара'],
    origin: 'Бургундия, Франция, XVII век',
    chef: 'Шеф-кондитер Анна Морозова',
    pairing: ['Сотерн', 'Мускат Бом-де-Вениз', 'Эспрессо ристретто'],
    cookingMethod: 'Запекание на водяной бане 90°C, карамелизация горелкой'
  },
  {
    id: 15,
    name: 'Шоколадный фондан',
    price: 950,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=1000&fit=crop&q=95',
    description: 'Теплый шоколадный кекс с тающей жидкой сердцевиной из бельгийского шоколада Callebaut 70% какао — произведение кондитерского искусства. При разрезании из хрустящей корочки вытекает горячий шоколадный поток, создающий эффект вулканического извержения. Подается с шариком ванильного мороженого из мадагаскарской ванили и свежей малиной. Время запекания рассчитано до секунды для идеальной консистенции.',
    category: 'Десерты',
    cookTime: '12 мин',
    rating: 4.9,
    ingredients: ['Шоколад Callebaut 70%', 'Масло нормандское', 'Яйца фермерские', 'Мороженое ванильное'],
    origin: 'Авторский рецепт Мишеля Браса, 1981',
    chef: 'Шеф-кондитер Анна Морозова',
    pairing: ['Баньюльс', 'Порто Руби', 'Капучино'],
    cookingMethod: 'Запекание 11 минут при 200°C, подача немедленно',
    isNew: true
  },
  {
    id: 16,
    name: 'Панна котта с ягодами',
    price: 800,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=1000&fit=crop&q=95',
    description: 'Нежнейшая пьемонтская панна котта с идеальной желеобразной консистенцией, буквально дрожащей на тарелке при подаче. Сливочный десерт из свежих сливок с ароматом стручковой ванили Таити подается с кули из лесных ягод — ежевики, малины и голубики из экологически чистых хозяйств Карелии. Минимум желатина для максимально нежной текстуры — секрет итальянских мастеров. Легкий и элегантный финал вашей трапезы.',
    category: 'Десерты',
    cookTime: '5 мин',
    rating: 4.7,
    ingredients: ['Сливки пьемонтские', 'Ваниль Таити', 'Ягоды карельские', 'Желатин листовой'],
    origin: 'Пьемонт, Северная Италия',
    chef: 'Шеф-кондитер Анна Морозова',
    pairing: ['Москато Розе', 'Бракетто д\'Акви', 'Чай белый'],
    cookingMethod: 'Холодное приготовление, застывание 6 часов'
  },
];

const categories = ['Все', 'Закуски', 'Основные блюда', 'Паста', 'Десерты'];

const collections = [
  {
    id: 1,
    title: 'Выбор шеф-повара',
    subtitle: 'Авторские блюда',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop&q=95',
    dishes: [1, 4, 6]
  },
  {
    id: 2,
    title: 'Морские деликатесы',
    subtitle: 'Свежие морепродукты',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=800&fit=crop&q=95',
    dishes: [9, 10, 11]
  },
  {
    id: 3,
    title: 'Сладкие удовольствия',
    subtitle: 'Десерты',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&h=800&fit=crop&q=95',
    dishes: [13, 15]
  },
];

const Restaurant = memo(function Restaurant({ activeTab }: RestaurantProps) {
  const { t } = useLanguage();
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  const { filteredItems, searchQuery, handleSearch } = useFilter({
    items: dishes,
    searchFields: ['name', 'description', 'category', 'ingredients'] as (keyof Dish)[],
  });

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const filteredDishes = filteredItems.filter(d => 
    selectedCategory === 'Все' || d.category === selectedCategory
  );

  const toggleFavorite = (dishId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(dishId)) {
      newFavorites.delete(dishId);
    } else {
      newFavorites.add(dishId);
    }
    setFavorites(newFavorites);
  };

  const openDish = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const addToOrder = () => {
    if (!selectedDish) return;
    
    const existing = orderItems.find(item => item.id === selectedDish.id);
    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.id === selectedDish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        id: selectedDish.id,
        name: selectedDish.name,
        price: selectedDish.price,
        quantity: 1,
        image: selectedDish.image
      }]);
    }
    setSelectedDish(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = () => {
    if (orderItems.length === 0) return;
    
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Date.now(),
      items: [...orderItems],
      total: total,
      date: new Date().toLocaleDateString('ru-RU'),
      status: 'processing'
    };
    
    setOrders([newOrder, ...orders]);
    setOrderItems([]);
    setShowCheckoutSuccess(true);
    setTimeout(() => setShowCheckoutSuccess(false), 3000);
  };

  if (selectedDish) {
    return (
      <div 
        className="min-h-screen text-white pb-24 smooth-scroll-page"
        style={{ background: luxuryColors.bg }}
      >
        <div className="absolute top-0 left-0 right-0 z-20 demo-nav-safe flex items-center justify-between">
          <m.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedDish(null)}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{ 
              background: luxuryColors.glass,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${luxuryColors.glassBorder}`
            }}
            data-testid="button-back"
            aria-label="Назад"
          >
            <ChevronLeft className="w-6 h-6" />
          </m.button>
          <m.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(selectedDish.id);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{ 
              background: luxuryColors.glass,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${luxuryColors.glassBorder}`
            }}
            data-testid={`button-favorite-${selectedDish.id}`}
            aria-label="Добавить в избранное"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${favorites.has(selectedDish.id) ? 'text-[#C9A96E]' : 'text-white'}`}
              style={{ fill: favorites.has(selectedDish.id) ? luxuryColors.gold : 'none' }}
            />
          </m.button>
        </div>

        <m.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-[70vh] overflow-hidden"
        >
          <img
            src={selectedDish.image}
            alt={selectedDish.name}
            className="w-full h-full object-cover"
            style={{ minHeight: '300px' }}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(to top, ${luxuryColors.bg} 0%, ${luxuryColors.bg}80 50%, transparent 100%)`
            }}
          />
        </m.div>

        <m.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-t-[2rem] -mt-16 relative z-10 p-6 space-y-6 pb-32"
          style={{ 
            background: luxuryColors.glass,
            backdropFilter: 'blur(40px)',
            borderTop: `1px solid ${luxuryColors.glassBorder}`
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span 
                className="text-xs font-medium uppercase tracking-widest"
                style={{ color: luxuryColors.gold }}
              >
                {selectedDish.category}
              </span>
              {selectedDish.isNew && (
                <span 
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                  style={{ 
                    background: `${luxuryColors.gold}20`,
                    color: luxuryColors.gold,
                    border: `1px solid ${luxuryColors.gold}30`
                  }}
                >
                  New
                </span>
              )}
              {selectedDish.isChefSpecial && (
                <span 
                  className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1"
                  style={{ 
                    background: `${luxuryColors.gold}20`,
                    color: luxuryColors.gold,
                    border: `1px solid ${luxuryColors.gold}30`
                  }}
                >
                  <Flame className="w-3 h-3" />
                  Chef's Pick
                </span>
              )}
            </div>
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '-0.02em',
                lineHeight: 1.3
              }}
            >
              {selectedDish.name}
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <p 
                className="text-3xl font-bold"
                style={{ color: luxuryColors.gold }}
              >
                {formatPrice(selectedDish.price)}
              </p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-4 h-4"
                    style={{ 
                      color: i < Math.floor(selectedDish.rating) ? luxuryColors.gold : 'rgba(255,255,255,0.2)',
                      fill: i < Math.floor(selectedDish.rating) ? luxuryColors.gold : 'none'
                    }}
                  />
                ))}
                <span className="text-sm ml-1" style={{ color: luxuryColors.textSecondary }}>
                  {selectedDish.rating}
                </span>
              </div>
            </div>
          </div>

          <p 
            className="text-sm leading-relaxed"
            style={{ 
              color: luxuryColors.textSecondary,
              lineHeight: 1.6
            }}
          >
            {selectedDish.description}
          </p>

          <div className="space-y-5">
            <div>
              <h3 
                className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: luxuryColors.gold }}
              >
                Ключевые ингредиенты
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedDish.ingredients.map((ingredient, idx) => (
                  <m.span 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="px-3 py-1.5 text-xs rounded-full"
                    style={{ 
                      background: luxuryColors.glass,
                      color: luxuryColors.textSecondary,
                      border: `1px solid ${luxuryColors.glassBorder}`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {ingredient}
                  </m.span>
                ))}
              </div>
            </div>

            <div 
              className="p-4 rounded-2xl"
              style={{ 
                background: luxuryColors.glass,
                border: `1px solid ${luxuryColors.glassBorder}`
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Wine className="w-4 h-4" style={{ color: luxuryColors.gold }} />
                <h3 
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: luxuryColors.gold }}
                >
                  Винная карта
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDish.pairing.map((pair, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1.5 text-xs rounded-full"
                    style={{ 
                      background: `${luxuryColors.gold}15`,
                      color: luxuryColors.gold,
                      border: `1px solid ${luxuryColors.gold}30`
                    }}
                  >
                    {pair}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  background: luxuryColors.glass,
                  border: `1px solid ${luxuryColors.glassBorder}`
                }}
              >
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: luxuryColors.gold }}>
                  Шеф-повар
                </p>
                <p className="text-xs" style={{ color: luxuryColors.textSecondary }}>
                  {selectedDish.chef}
                </p>
              </div>
              <div 
                className="p-3 rounded-xl"
                style={{ 
                  background: luxuryColors.glass,
                  border: `1px solid ${luxuryColors.glassBorder}`
                }}
              >
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: luxuryColors.gold }}>
                  Время подачи
                </p>
                <p className="text-xs flex items-center gap-1" style={{ color: luxuryColors.textSecondary }}>
                  <Clock className="w-3 h-3" />
                  {selectedDish.cookTime}
                </p>
              </div>
            </div>
          </div>

          <m.button
            whileTap={{ scale: 0.97 }}
            onClick={addToOrder}
            className="w-full font-semibold py-4 rounded-xl transition-all"
            style={{ 
              background: `linear-gradient(135deg, ${luxuryColors.gold} 0%, ${luxuryColors.bronze} 100%)`,
              color: '#0A0A0A'
            }}
            data-testid="button-add-to-order"
          >
            Добавить в заказ
          </m.button>
        </m.div>
      </div>
    );
  }

  if (activeTab === 'home') {
    return (
      <div 
        className="min-h-screen text-white pb-24 smooth-scroll-page"
        style={{ background: luxuryColors.bg }}
      >
        <m.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative h-[55vh] overflow-hidden"
        >
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop&q=95"
            alt="DeluxeDine"
            className="w-full h-full object-cover"
            style={{ backgroundColor: '#333' }}
            onError={(e) => console.log('Hero image failed to load', e)}
          />
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(to bottom, ${luxuryColors.bg}4d 0%, ${luxuryColors.bg}99 60%, ${luxuryColors.bg} 100%)`
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 pb-10">
            <m.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl font-bold mb-2"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}
            >
              DeluxeDine
            </m.h1>
            <m.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg font-light tracking-wide"
              style={{ color: luxuryColors.gold }}
            >
              Гастрономические шедевры
            </m.p>
          </div>
        </m.div>

        <div className="p-6 space-y-8">
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { icon: Star, label: 'Michelin', value: '2 stars' },
              { icon: Clock, label: 'Время работы', value: '12:00-23:00' },
              { icon: MapPin, label: 'Москва', value: 'Центр' }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl text-center"
                style={{ 
                  background: luxuryColors.glass,
                  border: `1px solid ${luxuryColors.glassBorder}`,
                  backdropFilter: 'blur(20px)'
                }}
              >
                <item.icon className="w-5 h-5 mx-auto mb-2" style={{ color: luxuryColors.gold }} />
                <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: luxuryColors.textSecondary }}>
                  {item.label}
                </p>
                <p className="text-xs font-medium">{item.value}</p>
              </div>
            ))}
          </m.div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5" style={{ color: luxuryColors.gold }} />
                <h3 
                  className="text-xl font-bold"
                  style={{ 
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: '-0.02em'
                  }}
                >
                  Выбор шефа
                </h3>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
              {dishes.filter(d => d.isChefSpecial).slice(0, 6).map((dish, idx) => (
                <m.div
                  key={dish.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * idx }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openDish(dish)}
                  className="relative flex-shrink-0 w-44 cursor-pointer group"
                  data-testid={`chef-special-${dish.id}`}
                >
                  <div 
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3"
                    style={{ 
                      border: `1px solid ${luxuryColors.glassBorder}`
                    }}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ 
                        background: `linear-gradient(to top, ${luxuryColors.bg}cc 0%, transparent 60%)`
                      }}
                    />
                    {dish.isNew && (
                      <div 
                        className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                        style={{ 
                          background: luxuryColors.gold,
                          color: luxuryColors.bg
                        }}
                      >
                        New
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(dish.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{ 
                        background: luxuryColors.glass,
                        backdropFilter: 'blur(10px)'
                      }}
                      data-testid={`button-favorite-${dish.id}`}
                      aria-label="Добавить в избранное"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors`}
                        style={{ 
                          color: favorites.has(dish.id) ? luxuryColors.gold : 'white',
                          fill: favorites.has(dish.id) ? luxuryColors.gold : 'none'
                        }}
                      />
                    </button>
                  </div>
                  <p 
                    className="text-[10px] uppercase tracking-widest mb-1"
                    style={{ color: luxuryColors.gold }}
                  >
                    {dish.category}
                  </p>
                  <p className="text-sm font-medium truncate mb-1">{dish.name}</p>
                  <p className="text-sm font-bold" style={{ color: luxuryColors.gold }}>
                    {formatPrice(dish.price)}
                  </p>
                </m.div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 
              className="text-xl font-bold"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '-0.02em'
              }}
            >
              Коллекции
            </h3>
            {collections.map((collection, idx) => (
              <m.div
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                className="relative group cursor-pointer overflow-hidden rounded-2xl"
                style={{ 
                  height: idx === 0 ? '200px' : '140px',
                  border: `1px solid ${luxuryColors.glassBorder}`
                }}
                data-testid={`collection-${collection.id}`}
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: `linear-gradient(to top, ${luxuryColors.bg}e6 0%, ${luxuryColors.bg}4d 100%)`
                  }}
                />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <h4 
                    className="text-xl font-bold mb-1"
                    style={{ 
                      fontFamily: "'Playfair Display', serif",
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {collection.title}
                  </h4>
                  <p className="text-xs" style={{ color: luxuryColors.textSecondary }}>
                    {collection.subtitle}
                  </p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'catalog') {
    return (
      <div 
        className="min-h-screen text-white pb-24 smooth-scroll-page"
        style={{ background: luxuryColors.bg }}
      >
        <div className="p-6 pb-4">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '-0.02em'
              }}
            >
              Наше меню
            </h1>
            <Utensils className="w-6 h-6" style={{ color: luxuryColors.gold }} />
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative mb-5"
          >
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" 
              style={{ color: luxuryColors.textSecondary }}
            />
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder:text-white/40 focus:outline-none transition-all"
              style={{ 
                background: luxuryColors.glass,
                border: `1px solid ${luxuryColors.glassBorder}`,
                backdropFilter: 'blur(20px)'
              }}
              data-testid="input-search"
              aria-label="Поиск блюд"
            />
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={{ 
                  background: selectedCategory === cat 
                    ? `linear-gradient(135deg, ${luxuryColors.gold} 0%, ${luxuryColors.bronze} 100%)`
                    : luxuryColors.glass,
                  color: selectedCategory === cat ? luxuryColors.bg : luxuryColors.textSecondary,
                  border: `1px solid ${selectedCategory === cat ? 'transparent' : luxuryColors.glassBorder}`
                }}
                data-testid={`button-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </m.div>

          <div className="grid grid-cols-2 gap-4">
            {filteredDishes.map((dish, idx) => (
              <m.div
                key={dish.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * idx }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openDish(dish)}
                className="relative cursor-pointer group"
                data-testid={`dish-card-${dish.id}`}
              >
                <div 
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3"
                  style={{ 
                    border: `1px solid ${luxuryColors.glassBorder}`
                  }}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ 
                      background: luxuryColors.glass,
                      backdropFilter: 'blur(4px)'
                    }}
                  />
                  {dish.isNew && (
                    <div 
                      className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                      style={{ 
                        background: luxuryColors.gold,
                        color: luxuryColors.bg
                      }}
                    >
                      New
                    </div>
                  )}
                  {dish.isChefSpecial && (
                    <div 
                      className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1"
                      style={{ 
                        background: luxuryColors.gold,
                        color: luxuryColors.bg
                      }}
                    >
                      <Flame className="w-3 h-3" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(dish.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                    style={{ 
                      background: luxuryColors.glass,
                      backdropFilter: 'blur(10px)'
                    }}
                    data-testid={`button-favorite-${dish.id}`}
                    aria-label="Добавить в избранное"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors`}
                      style={{ 
                        color: favorites.has(dish.id) ? luxuryColors.gold : 'white',
                        fill: favorites.has(dish.id) ? luxuryColors.gold : 'none'
                      }}
                    />
                  </button>
                </div>

                <div>
                  <p 
                    className="text-[10px] uppercase tracking-widest mb-1"
                    style={{ color: luxuryColors.gold }}
                  >
                    {dish.category}
                  </p>
                  <p className="text-sm font-medium truncate mb-1">{dish.name}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold" style={{ color: luxuryColors.gold }}>
                      {formatPrice(dish.price)}
                    </p>
                    <p className="text-xs" style={{ color: luxuryColors.textSecondary }}>
                      {dish.cookTime}
                    </p>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'cart') {
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div 
        className="min-h-screen text-white pb-32 smooth-scroll-page"
        style={{ background: luxuryColors.bg }}
      >
        <div className="p-6">
          <m.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-bold mb-6"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              letterSpacing: '-0.02em'
            }}
          >
            Корзина
          </m.h1>

          {orderItems.length === 0 ? (
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-20"
            >
              <ShoppingCart className="w-16 h-16 mx-auto mb-4" style={{ color: luxuryColors.glassBorder }} />
              <p style={{ color: luxuryColors.textSecondary }}>Ваша корзина пуста</p>
            </m.div>
          ) : (
            <>
              <div className="space-y-4 mb-24">
                {orderItems.map((item, idx) => (
                  <m.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="flex gap-4 p-4 rounded-2xl"
                    style={{ 
                      background: luxuryColors.glass,
                      border: `1px solid ${luxuryColors.glassBorder}`,
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div 
                      className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                      style={{ border: `1px solid ${luxuryColors.glassBorder}` }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1 truncate">{item.name}</h3>
                      <p className="text-sm mb-2" style={{ color: luxuryColors.textSecondary }}>
                        Количество: {item.quantity}
                      </p>
                      <p className="font-bold" style={{ color: luxuryColors.gold }}>
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => setOrderItems(orderItems.filter(i => i.id !== item.id))}
                      className="p-2 h-fit rounded-lg transition-colors hover:bg-white/5"
                      data-testid={`button-remove-${item.id}`}
                      aria-label="Удалить из корзины"
                    >
                      <X className="w-5 h-5" style={{ color: luxuryColors.textSecondary }} />
                    </button>
                  </m.div>
                ))}
              </div>

              <div 
                className="fixed bottom-24 left-0 right-0 p-6"
                style={{ 
                  background: `${luxuryColors.bgSecondary}f0`,
                  backdropFilter: 'blur(20px)',
                  borderTop: `1px solid ${luxuryColors.glassBorder}`
                }}
              >
                <div className="max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg" style={{ color: luxuryColors.textSecondary }}>
                      Итого:
                    </span>
                    <span className="text-2xl font-bold" style={{ color: luxuryColors.gold }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                  <ConfirmDrawer
                    trigger={
                      <m.button
                        whileTap={{ scale: 0.97 }}
                        className="w-full font-semibold py-4 rounded-xl transition-all"
                        style={{ 
                          background: `linear-gradient(135deg, ${luxuryColors.gold} 0%, ${luxuryColors.bronze} 100%)`,
                          color: luxuryColors.bg
                        }}
                        data-testid="button-checkout"
                      >
                        Оформить заказ
                      </m.button>
                    }
                    title="Оформить заказ?"
                    description={`${orderItems.length} блюд на сумму ${formatPrice(total)}`}
                    confirmText="Оформить"
                    cancelText="Отмена"
                    variant="default"
                    onConfirm={handleCheckout}
                  />
                </div>
              </div>
              {showCheckoutSuccess && (
                <m.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-20 left-4 right-4 p-4 rounded-2xl text-center font-semibold z-50"
                  style={{ 
                    background: `linear-gradient(135deg, ${luxuryColors.gold} 0%, ${luxuryColors.bronze} 100%)`,
                    color: luxuryColors.bg
                  }}
                >
                  Заказ успешно оформлен!
                </m.div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div 
        className="min-h-screen text-white pb-24 smooth-scroll-page"
        style={{ background: luxuryColors.bg }}
      >
        <div className="p-6">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-8"
          >
            <h1 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                letterSpacing: '-0.02em'
              }}
            >
              Профиль
            </h1>
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-center mb-8"
          >
            <div 
              className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center p-1"
              style={{ 
                background: `linear-gradient(135deg, ${luxuryColors.gold} 0%, ${luxuryColors.bronze} 100%)`
              }}
            >
              <div 
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ background: luxuryColors.bg }}
              >
                <User className="w-12 h-12" style={{ color: luxuryColors.gold }} />
              </div>
            </div>
            <h2 
              className="text-xl font-bold mb-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Дмитрий Соколов
            </h2>
            <p className="text-sm" style={{ color: luxuryColors.textSecondary }}>
              dmitry.sokolov@example.com
            </p>
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-3 gap-3 mb-8"
          >
            {[
              { icon: ShoppingCart, value: orders.length, label: 'Заказов' },
              { icon: Heart, value: favorites.size, label: 'Избранное' },
              { icon: Star, value: '250', label: 'Баллов' }
            ].map((stat, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-2xl text-center"
                style={{ 
                  background: luxuryColors.glass,
                  border: `1px solid ${luxuryColors.glassBorder}`,
                  backdropFilter: 'blur(20px)'
                }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2" style={{ color: luxuryColors.gold }} />
                <p className="text-xl font-bold mb-1">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: luxuryColors.textSecondary }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </m.div>

          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-6"
          >
            <h3 
              className="text-lg font-bold mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Мои заказы
            </h3>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 mx-auto mb-3" style={{ color: luxuryColors.glassBorder }} />
                <p style={{ color: luxuryColors.textSecondary }}>У вас пока нет заказов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order, idx) => (
                  <m.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + idx * 0.05 }}
                    className="p-4 rounded-xl"
                    style={{ 
                      background: luxuryColors.glass,
                      border: `1px solid ${luxuryColors.glassBorder}`
                    }}
                    data-testid={`order-${order.id}`}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm" style={{ color: luxuryColors.textSecondary }}>
                        Заказ #{order.id.toString().slice(-6)}
                      </span>
                      <span className="text-sm" style={{ color: luxuryColors.textSecondary }}>
                        {order.date}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span style={{ color: luxuryColors.textSecondary }}>
                        {order.items.length} блюд
                      </span>
                      <span className="font-bold" style={{ color: luxuryColors.gold }}>
                        {formatPrice(order.total)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span 
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ 
                          background: `${luxuryColors.gold}20`,
                          color: luxuryColors.gold
                        }}
                      >
                        {order.status === 'processing' ? 'Готовится' : order.status === 'shipped' ? 'В пути' : 'Доставлен'}
                      </span>
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
              { icon: Phone, label: 'Контакты' }
            ].map((item, idx) => (
              <button 
                key={idx}
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/5"
                style={{ 
                  background: luxuryColors.glass,
                  border: `1px solid ${luxuryColors.glassBorder}`
                }}
                data-testid={`button-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <item.icon className="w-5 h-5" style={{ color: luxuryColors.gold }} />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                <ChevronLeft className="w-5 h-5 rotate-180" style={{ color: luxuryColors.textSecondary }} />
              </button>
            ))}
          </m.div>
        </div>
      </div>
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
