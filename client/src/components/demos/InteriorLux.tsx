import { useState, useEffect } from "react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { 
  Heart, 
  Star, 
  X, 
  Home,
  Sofa,
  TrendingUp,
  Plus,
  Minus,
  ShoppingBag,
  Package,
  Settings,
  ChevronRight
} from "lucide-react";
import { OptimizedImage } from "../OptimizedImage";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { ConfirmDrawer } from "../ui/modern-drawer";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentFavorites } from "@/hooks/usePersistentFavorites";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { LazyImage, UrgencyIndicator, TrustBadges, DemoThemeProvider } from "@/components/shared";

const STORE_KEY = 'interiorlux-store';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: number;
  rating: number;
  brand: string;
  material: string;
  dimensions: string;
  materials: string[];
  craftsman: string;
  style: string;
  careInstructions: string;
}

interface InteriorLuxProps {
  activeTab: 'home' | 'catalog' | 'cart' | 'profile';
  onTabChange?: (tab: 'home' | 'catalog' | 'cart' | 'profile') => void;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'Диван Scandi', 
    price: 2500, 
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=1200&fit=crop&q=90', 
    description: 'Монументальный диван ручной сборки, воплощающий философию датского хюгге в каждом изгибе силуэта. Каркас выполнен из отборной скандинавской сосны, выдержанной в естественных условиях не менее пяти лет. Обивка из премиальной итальянской ткани Kvadrat создает непревзойденный тактильный комфорт и сохраняет первозданный вид десятилетиями. Мастера копенгагенской мануфактуры вручную простегивают каждую подушку, гарантируя безупречную посадку.',
    category: 'Гостиная', 
    inStock: 5, 
    rating: 4.8, 
    brand: 'Nordic Home', 
    material: 'Ткань Kvadrat, скандинавская сосна',
    dimensions: 'Ш 220 × Г 90 × В 80 см, глубина сиденья 55 см',
    materials: ['Ткань Kvadrat', 'Скандинавская сосна', 'Пенополиуретан высокой плотности', 'Пружинный блок Bonnell'],
    craftsman: 'Мануфактура Nordic Craft, Копенгаген, с 1948',
    style: 'Скандинавский минимализм',
    careInstructions: 'Сухая чистка, пылесосить мягкой насадкой раз в неделю, беречь от прямых солнечных лучей'
  },
  { 
    id: 2, 
    name: 'Стол Oak Dining', 
    price: 1800, 
    image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&h=1200&fit=crop&q=90', 
    description: 'Величественный обеденный стол из цельного массива европейского дуба, каждый экземпляр которого уникален благодаря неповторимому рисунку годовых колец. Древесина заготавливается в управляемых лесах Баварии и проходит двухлетний цикл естественной сушки. Столешница толщиной 45 мм обработана датским маслом Rubio Monocoat, подчеркивающим глубину текстуры. Массивные прямоугольные ножки соединены с царгой традиционным шиповым соединением без единого гвоздя.',
    category: 'Кухня', 
    inStock: 8, 
    rating: 4.9, 
    brand: 'WoodCraft', 
    material: 'Массив европейского дуба',
    dimensions: 'Ш 180 × Г 90 × В 75 см, толщина столешницы 45 мм',
    materials: ['Массив европейского дуба', 'Масло Rubio Monocoat', 'Латунные стяжки скрытого монтажа'],
    craftsman: 'Столярная мастерская WoodCraft, Мюнхен, с 1967',
    style: 'Рустик модерн',
    careInstructions: 'Протирать влажной тканью, обновлять масляное покрытие раз в год, использовать подставки под горячее'
  },
  { 
    id: 3, 
    name: 'Кресло Vintage', 
    price: 850, 
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=1200&fit=crop&q=90', 
    description: 'Скульптурное кресло в духе золотой эры mid-century, созданное по мотивам легендарных датских прототипов 1950-х годов. Резной каркас из американского ореха отполирован вручную до благородного шелковистого блеска. Глубокая обивка из бельгийского бархата Pierre Frey с плотностью 450 г/м² создает непревзойденное ощущение роскоши. Каждое кресло проходит 47 этапов ручной сборки в мастерской потомственных краснодеревщиков.',
    category: 'Гостиная', 
    inStock: 12, 
    rating: 4.7, 
    brand: 'Retro Style', 
    material: 'Бельгийский бархат, американский орех',
    dimensions: 'Ш 80 × Г 75 × В 85 см, высота сиденья 42 см',
    materials: ['Американский черный орех', 'Бархат Pierre Frey', 'Латунные накладки', 'Конский волос'],
    craftsman: 'Ателье Retro Style, Милан, с 1962',
    style: 'Mid-century modern',
    careInstructions: 'Бархат чистить мягкой щеткой по направлению ворса, дерево полировать воском раз в 3 месяца'
  },
  { 
    id: 4, 
    name: 'Кровать King Size', 
    price: 2800, 
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=1200&fit=crop&q=90', 
    description: 'Императорская кровать с монументальным мягким изголовьем, созданная для тех, кто ценит безупречный сон и эстетическое совершенство. Изголовье высотой 120 см выполнено в технике глубокой каретной стяжки из анилиновой кожи тосканской выделки. Ортопедическое основание на 68 березовых ламелях обеспечивает идеальную поддержку позвоночника. Каркас из массива ясеня с матовой лакировкой сочетает визуальную легкость с исключительной прочностью.',
    category: 'Спальня', 
    inStock: 6, 
    rating: 4.9, 
    brand: 'DreamBeds', 
    material: 'Анилиновая кожа, массив ясеня',
    dimensions: 'Ш 200 × Г 200 × В 120 см, высота ложа 45 см',
    materials: ['Анилиновая кожа Toscana', 'Массив ясеня', 'Березовые ламели', 'Пенополиуретан Memory Foam'],
    craftsman: 'Мануфактура DreamBeds, Флоренция, с 1955',
    style: 'Современная классика',
    careInstructions: 'Кожу обрабатывать кондиционером раз в 6 месяцев, ламели проверять ежегодно, избегать прямых солнечных лучей'
  },
  { 
    id: 5, 
    name: 'Комод Chester', 
    price: 950, 
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=1200&fit=crop&q=90', 
    description: 'Респектабельный комод в традициях английского кабинетного мастерства XVIII века, адаптированный для современного интерьера. Корпус из отборного массива ясеня с характерным медовым оттенком облагорожен патинированными латунными ручками ручного литья. Пять выдвижных ящиков на дубовых направляющих типа «ласточкин хвост» работают с музейной плавностью. Финишное покрытие шеллаком по старинной технологии French Polish требует 12 слоев нанесения.',
    category: 'Спальня', 
    inStock: 10, 
    rating: 4.7, 
    brand: 'ClassicFurniture', 
    material: 'Массив ясеня, патинированная латунь',
    dimensions: 'Ш 120 × Г 45 × В 85 см, глубина ящиков 38 см',
    materials: ['Массив ясеня', 'Дубовые направляющие', 'Латунь ручного литья', 'Шеллак натуральный'],
    craftsman: 'Мастерская ClassicFurniture, Честер, с 1892',
    style: 'Английская классика',
    careInstructions: 'Полировать мягкой тканью с воском раз в месяц, латунь очищать специальным составом, не использовать абразивы'
  },
  { 
    id: 6, 
    name: 'Ковер Persian', 
    price: 680, 
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&h=1200&fit=crop&q=90', 
    description: 'Подлинный персидский ковер ручной работы, сотканный мастерами провинции Исфахан по канонам, передающимся из поколения в поколение более четырехсот лет. Каждый квадратный метр содержит свыше 360 000 узелков, завязанных вручную из чистой горной шерсти. Растительные красители на основе граната, индиго и шафрана создают глубокие, не выцветающие оттенки. Создание одного ковра занимает до двух лет кропотливого труда.',
    category: 'Декор', 
    inStock: 15, 
    rating: 4.5, 
    brand: 'Orient Rugs', 
    material: 'Горная шерсть, шелковые нити',
    dimensions: '200 × 300 см, плотность 360 000 узлов/м²',
    materials: ['Горная шерсть Курдистана', 'Шелк натуральный', 'Растительные красители', 'Хлопковая основа'],
    craftsman: 'Ткацкая мануфактура Исфахан, Иран, традиция с 1598',
    style: 'Персидская классика',
    careInstructions: 'Профессиональная чистка раз в 2-3 года, пылесосить по направлению ворса, переворачивать для равномерного износа'
  },
  { 
    id: 7, 
    name: 'Люстра Crystal', 
    price: 1500, 
    image: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=1200&fit=crop&q=90', 
    description: 'Грандиозная люстра из богемского хрусталя, каждый подвес которой огранен вручную мастерами чешской стекольной школы. 156 хрустальных элементов преломляют свет в спектральные радуги, создавая магическую игру бликов. Литой бронзовый каркас с позолотой 24 карата сохранит благородный блеск на века. Электрика сертифицирована по европейским стандартам с возможностью диммирования для создания интимной атмосферы.',
    category: 'Декор', 
    inStock: 4, 
    rating: 4.8, 
    brand: 'CrystalLight', 
    material: 'Богемский хрусталь, позолоченная бронза',
    dimensions: 'Диаметр 80 см × В 100 см, вес 28 кг',
    materials: ['Богемский хрусталь 24% PbO', 'Литая бронза', 'Позолота 24 карата', 'Шелковые подвесы'],
    craftsman: 'Хрустальная мануфактура Moser, Карловы Вары, с 1857',
    style: 'Барокко ревивал',
    careInstructions: 'Очищать специальным спреем для хрусталя, протирать замшевой салфеткой, проверять крепления ежегодно'
  },
  { 
    id: 8, 
    name: 'Столик Coffee', 
    price: 650, 
    image: 'https://images.unsplash.com/photo-1551298370-9d3d53740c72?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Архитектурный журнальный столик, где брутальность индустриального металла встречается с изяществом муранского стекла. Столешница из закаленного стекла толщиной 15 мм вручную тонирована в дымчатый оттенок венецианскими стеклодувами. Геометрический каркас из вороненой стали с эффектом ручной ковки придает предмету характер музейного экспоната. Каждое сварное соединение зашлифовано до идеальной гладкости.',
    category: 'Гостиная', 
    inStock: 9, 
    rating: 4.6, 
    brand: 'GlassWorks', 
    material: 'Муранское стекло, вороненая сталь',
    dimensions: 'Ш 120 × Г 60 × В 45 см, толщина стекла 15 мм',
    materials: ['Закаленное муранское стекло', 'Вороненая сталь', 'Фетровые накладки', 'Регулируемые опоры'],
    craftsman: 'Студия GlassWorks, Венеция-Милан, с 1978',
    style: 'Индустриальный шик',
    careInstructions: 'Стекло протирать безворсовой тканью со специальным средством, металл обрабатывать антикоррозийным воском'
  },
  { 
    id: 9, 
    name: 'Шкаф Wardrobe Pro', 
    price: 3200, 
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Монументальная гардеробная система с зеркальными фасадами, визуально расширяющими пространство спальни. Корпус из влагостойкой ЛДСП премиум-класса с текстурой натурального дуба оснащен бесшумными доводчиками Blum последнего поколения. Внутреннее наполнение включает выдвижные ящики с бархатным покрытием, пантограф для верхней одежды и LED-подсветку с датчиком движения. Зеркала с антибликовым покрытием и подогревом предотвращают запотевание.',
    category: 'Спальня', 
    inStock: 3, 
    rating: 4.8, 
    brand: 'StoragePlus', 
    material: 'ЛДСП премиум, зеркало с подогревом',
    dimensions: 'Ш 200 × Г 60 × В 240 см, полезный объем 2400 л',
    materials: ['ЛДСП Egger премиум', 'Зеркало с подогревом', 'Фурнитура Blum', 'LED-подсветка'],
    craftsman: 'Фабрика StoragePlus, Австрия, с 1985',
    style: 'Современный функционализм',
    careInstructions: 'Фасады протирать мягкой тканью, смазывать петли раз в год, проверять регулировку дверей'
  },
  { 
    id: 10, 
    name: 'Картина Abstract', 
    price: 350, 
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Экспрессивное полотно современного берлинского художника, исследующего взаимодействие цвета и формы в традициях абстрактного экспрессионизма. Работа выполнена маслом и акрилом на бельгийском льняном холсте музейного качества с двойным грунтом. Многослойная текстура создана мастихином и широкими кистями из натуральной щетины. Картина поставляется с сертификатом подлинности и готова к развеске в профессиональном подрамнике.',
    category: 'Декор', 
    inStock: 20, 
    rating: 4.2, 
    brand: 'ArtGallery', 
    material: 'Масло, акрил, бельгийский лен',
    dimensions: '60 × 80 см, глубина подрамника 4 см',
    materials: ['Бельгийский льняной холст', 'Масляные краски Old Holland', 'Акрил Golden', 'Дубовый подрамник'],
    craftsman: 'Галерея ArtGallery Berlin, современные художники',
    style: 'Абстрактный экспрессионизм',
    careInstructions: 'Беречь от прямых солнечных лучей и влаги, протирать пыль мягкой кистью, не использовать химические средства'
  },
  { 
    id: 11, 
    name: 'Стеллаж Industrial', 
    price: 1200, 
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Архитектурный стеллаж в индустриальной эстетике нью-йоркских лофтов, где грубая сталь встречается с теплом натурального дерева. Металлический каркас из профильной трубы сварен вручную и покрыт порошковой эмалью с текстурой старой бронзы. Пять полок из состаренного вяза сохраняют следы времени — сучки, трещины и благородную патину. Конструкция выдерживает нагрузку до 150 кг на полку благодаря скрытым стальным усилителям.',
    category: 'Гостиная', 
    inStock: 7, 
    rating: 4.6, 
    brand: 'MetalWorks', 
    material: 'Состаренный вяз, порошковая сталь',
    dimensions: 'Ш 180 × Г 40 × В 200 см, толщина полок 35 мм',
    materials: ['Состаренный вяз', 'Профильная сталь', 'Порошковое покрытие', 'Регулируемые опоры'],
    craftsman: 'Кузнечная мастерская MetalWorks, Бруклин, с 1994',
    style: 'Индустриальный лофт',
    careInstructions: 'Дерево обрабатывать маслом раз в 6 месяцев, металл протирать сухой тканью, проверять устойчивость'
  },
  { 
    id: 12, 
    name: 'Барный стул Loft', 
    price: 280, 
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Эргономичный барный стул с индустриальным характером, соединяющий комфорт современного дизайна с брутальной эстетикой фабричных интерьеров. Сиденье из итальянской экокожи премиум-класса с перфорацией обеспечивает комфорт при длительном сидении. Газлифт немецкого производства позволяет плавно регулировать высоту от 65 до 85 см. Хромированная подножка с резиновыми накладками предотвращает скольжение и царапины на полу.',
    category: 'Кухня', 
    inStock: 18, 
    rating: 4.4, 
    brand: 'UrbanStyle', 
    material: 'Итальянская экокожа, хромированная сталь',
    dimensions: 'Ш 45 × Г 45 × В 65-85 см (регулируемая)',
    materials: ['Экокожа Ecopelle Italy', 'Хромированная сталь', 'Газлифт STABILUS', 'Пенополиуретан HR'],
    craftsman: 'Фабрика UrbanStyle, Милан, с 2001',
    style: 'Индустриальный модерн',
    careInstructions: 'Экокожу протирать влажной тканью, хром полировать, проверять газлифт ежегодно'
  },
  { 
    id: 13, 
    name: 'Тумба TV Stand', 
    price: 750, 
    image: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Элегантная медиа-консоль с лаконичным скандинавским дизайном, созданная для организации современной гостиной. Корпус из МДФ с покрытием натуральным шпоном дуба дополнен фасадами из тонированного стекла, скрывающими технику от пыли. Интегрированная система кабель-менеджмента и вентиляционные отверстия обеспечивают порядок и охлаждение электроники. Два вместительных ящика на направляющих с функцией soft-close работают абсолютно бесшумно.',
    category: 'Гостиная', 
    inStock: 11, 
    rating: 4.5, 
    brand: 'MediaFurniture', 
    material: 'Шпон дуба, тонированное стекло',
    dimensions: 'Ш 160 × Г 40 × В 50 см, выдерживает ТВ до 65"',
    materials: ['МДФ со шпоном дуба', 'Закаленное тонированное стекло', 'Направляющие Hettich', 'Алюминиевые опоры'],
    craftsman: 'Фабрика MediaFurniture, Стокгольм, с 1998',
    style: 'Скандинавский модерн',
    careInstructions: 'Шпон протирать влажной тканью по направлению волокон, стекло чистить без абразивов'
  },
  { 
    id: 14, 
    name: 'Зеркало Gold Frame', 
    price: 320, 
    image: 'https://images.unsplash.com/photo-1618220924273-338d82d6a886?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Парадное зеркало в роскошной раме, вдохновленное убранством версальских дворцов эпохи Людовика XV. Рама из массива липы украшена резным орнаментом рокайль, каждый завиток которого вырезан вручную и покрыт сусальным золотом. Зеркальное полотно с фацетной кромкой 25 мм создает благородную игру света и визуально расширяет пространство. Патинирование под античную бронзу придает изделию музейную ценность.',
    category: 'Декор', 
    inStock: 14, 
    rating: 4.4, 
    brand: 'DecorArt', 
    material: 'Массив липы, сусальное золото',
    dimensions: '80 × 120 см, глубина рамы 8 см, фацет 25 мм',
    materials: ['Массив липы', 'Сусальное золото 22 карата', 'Зеркало с фацетом', 'Патина под античную бронзу'],
    craftsman: 'Позолотная мастерская DecorArt, Версаль, с 1924',
    style: 'Барокко / Рококо',
    careInstructions: 'Протирать позолоту мягкой сухой кистью, зеркало чистить без спирта, беречь от влаги'
  },
  { 
    id: 15, 
    name: 'Пуф Ottoman', 
    price: 280, 
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Многофункциональный пуф-банкетка с потайным отделением для хранения, сочетающий практичность с изысканным дизайном. Обивка из бархата Designers Guild с высотой ворса 5 мм создает роскошную тактильную поверхность насыщенного изумрудного оттенка. Съемная крышка на петлях открывает вместительный отсек объемом 45 литров для пледов и подушек. Точеные ножки из массива бука с латунными наконечниками завершают образ.',
    category: 'Гостиная', 
    inStock: 16, 
    rating: 4.3, 
    brand: 'ComfortSeating', 
    material: 'Бархат Designers Guild, массив бука',
    dimensions: 'Диаметр 60 см × В 45 см, объем хранения 45 л',
    materials: ['Бархат Designers Guild', 'Массив бука', 'Латунные наконечники', 'Пенополиуретан высокой плотности'],
    craftsman: 'Ателье ComfortSeating, Лондон, с 1976',
    style: 'Современная классика',
    careInstructions: 'Бархат чистить пылесосом с мягкой насадкой, пятна удалять сухой пеной, ножки полировать воском'
  },
  { 
    id: 16, 
    name: 'Обеденный стул Nordic', 
    price: 180, 
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Классический скандинавский стул, переосмысленный для современных интерьеров с безупречным вниманием к эргономике и экологичности. Каркас из массива бука, выращенного в сертифицированных лесах FSC, обработан экологичным водным лаком. Анатомически изогнутая спинка и сиденье с мягкой подушкой обеспечивают комфорт многочасовых застолий. Обивка из переработанного хлопка доступна в 12 природных оттенках.',
    category: 'Кухня', 
    inStock: 24, 
    rating: 4.6, 
    brand: 'Nordic Home', 
    material: 'Массив бука FSC, эко-хлопок',
    dimensions: 'Ш 48 × Г 52 × В 82 см, высота сиденья 46 см',
    materials: ['Массив бука FSC', 'Переработанный хлопок', 'Водный эко-лак', 'Войлочные накладки'],
    craftsman: 'Мануфактура Nordic Home, Орхус, с 1952',
    style: 'Скандинавский функционализм',
    careInstructions: 'Дерево протирать влажной тканью, подушку стирать при 30°C, проверять соединения ежегодно'
  },
  { 
    id: 17, 
    name: 'Подушки Velvet Set', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Коллекция из четырех декоративных подушек, созданных для преображения гостиной в уютное пространство отдыха. Чехлы из итальянского бархата с двусторонней текстурой переливаются глубокими оттенками бургунди и изумруда. Наполнитель из гипоаллергенного силиконизированного волокна сохраняет форму после многократных использований. Декоративный кант из витого шнура ручной работы и потайная молния обеспечивают безупречный внешний вид.',
    category: 'Декор', 
    inStock: 30, 
    rating: 4.5, 
    brand: 'SoftDecor', 
    material: 'Итальянский бархат, силиконовое волокно',
    dimensions: '45 × 45 см (набор из 4 шт)',
    materials: ['Итальянский бархат', 'Силиконизированное волокно', 'Витой шнур ручной работы', 'Потайная молния YKK'],
    craftsman: 'Текстильная мастерская SoftDecor, Комо, с 1968',
    style: 'Современный гламур',
    careInstructions: 'Чехлы стирать при 30°C на деликатном режиме, наполнитель взбивать, беречь от прямых солнечных лучей'
  },
  { 
    id: 18, 
    name: 'Торшер Modern Arc', 
    price: 450, 
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Скульптурный торшер с изящной дугой, вдохновленный иконическими светильниками итальянского дизайна 1960-х годов. Массивное основание из каррарского мрамора с характерными серыми прожилками обеспечивает устойчивость конструкции высотой 180 см. Хромированная дуга с регулируемым углом наклона позволяет направлять световой поток. Абажур из выдувного опалового стекла создает мягкий рассеянный свет, идеальный для чтения.',
    category: 'Декор', 
    inStock: 8, 
    rating: 4.6, 
    brand: 'LightDesign', 
    material: 'Каррарский мрамор, опаловое стекло',
    dimensions: 'Основание 40 × 40 см, высота 180 см, вылет дуги 120 см',
    materials: ['Каррарский мрамор', 'Хромированная сталь', 'Выдувное опаловое стекло', 'Текстильный кабель'],
    craftsman: 'Студия LightDesign, Милан, с 1965',
    style: 'Итальянский модернизм',
    careInstructions: 'Мрамор обрабатывать защитной пропиткой раз в год, хром полировать, стекло протирать мягкой тканью'
  },
  { 
    id: 19, 
    name: 'Кухонный остров', 
    price: 2200, 
    image: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Монументальный кухонный остров с мраморной столешницей, превращающий приготовление пищи в кулинарный перформанс. Столешница из калакаттского мрамора толщиной 30 мм с уникальным рисунком золотистых прожилок обработана гидрофобной пропиткой. Основание из массива ясеня с открытыми полками и выдвижными ящиками на бесшумных направляющих. Встроенная электрическая разводка для подключения техники и USB-портами для зарядки устройств.',
    category: 'Кухня', 
    inStock: 4, 
    rating: 4.9, 
    brand: 'KitchenPro', 
    material: 'Калакаттский мрамор, массив ясеня',
    dimensions: 'Ш 180 × Г 90 × В 92 см, толщина столешницы 30 мм',
    materials: ['Калакаттский мрамор', 'Массив ясеня', 'Направляющие Blum', 'Встроенная электрика'],
    craftsman: 'Мануфактура KitchenPro, Парма, с 1972',
    style: 'Неоклассика',
    careInstructions: 'Мрамор обрабатывать пропиткой раз в 6 месяцев, немедленно удалять кислотные продукты, использовать разделочные доски'
  },
  { 
    id: 20, 
    name: 'Прикроватная тумба', 
    price: 380, 
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format,compress&fm=webp&q=75&w=400', 
    description: 'Изящная прикроватная тумба с лаконичным силуэтом, созданная для безупречной организации спального пространства. Корпус из МДФ с матовым лакокрасочным покрытием дополнен столешницей из натурального мрамора эмператор с характерными белыми прожилками. Два бесшумных ящика на австрийских направляющих Blum с функцией Push-to-Open открываются легким нажатием. Интегрированный порт беспроводной зарядки Qi для смартфона скрыт под мраморной крышкой.',
    category: 'Спальня', 
    inStock: 13, 
    rating: 4.5, 
    brand: 'DreamBeds', 
    material: 'Мрамор эмператор, МДФ матовый лак',
    dimensions: 'Ш 50 × Г 40 × В 55 см, беспроводная зарядка Qi',
    materials: ['МДФ с матовым лаком', 'Мрамор эмператор', 'Направляющие Blum', 'Модуль Qi-зарядки'],
    craftsman: 'Мануфактура DreamBeds, Флоренция, с 1955',
    style: 'Современный минимализм',
    careInstructions: 'Мрамор обрабатывать пропиткой раз в 6 месяцев, лаковое покрытие протирать мягкой тканью без абразивов'
  }
];

const categories = ['Все', 'Гостиная', 'Спальня', 'Кухня', 'Декор'];

function InteriorLux({ activeTab, onTabChange }: InteriorLuxProps) {
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const { toast } = useToast();
  
  const { 
    cart, 
    addToCart: addToCartHook, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    cartTotal,
    cartCount
  } = usePersistentCart(STORE_KEY);
  
  const { 
    isFavorite, 
    toggleFavorite: toggleFavoriteHook, 
    favoritesCount 
  } = usePersistentFavorites(STORE_KEY);
  
  const { 
    addOrder, 
    ordersCount 
  } = usePersistentOrders(STORE_KEY);

  // Preload first 6 product images for instant visibility
  useImagePreloader({
    images: products.slice(0, 6).map(p => p.image),
    priority: true
  });

  useEffect(() => {
    scrollToTop();
  }, [activeTab]);

  const openProductModal = (product: typeof products[0]) => {
    scrollToTop();
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const handleToggleFavorite = (productId: number) => {
    const wasFavorite = isFavorite(String(productId));
    toggleFavoriteHook(String(productId));
    toast({
      title: wasFavorite ? 'Удалено из избранного' : 'Добавлено в избранное',
      duration: 2000
    });
  };
  
  const handleAddToCart = (product: typeof products[0]) => {
    addToCartHook({
      id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      size: product.dimensions,
      color: product.material
    });
    toast({
      title: 'Добавлено в корзину',
      description: product.name,
      duration: 2000
    });
  };
  
  const handleCheckout = () => {
    const orderItems = cart.map(item => ({
      id: parseInt(item.id) || 0,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      image: item.image
    }));
    
    addOrder({
      items: orderItems,
      total: cartTotal,
      status: 'processing'
    });
    
    clearCart();
    setIsCheckoutOpen(false);
    
    toast({
      title: 'Заказ оформлен!',
      description: 'Спасибо за покупку',
      duration: 3000
    });
  };

  const filteredProducts = selectedCategory === 'Все' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // HOME TAB - Ultra Minimalist 2025
  const renderHomeTab = () => (
    <div className="min-h-screen bg-white font-montserrat pb-24 smooth-scroll-page">
      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        {/* Minimalist Header */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
            <Home className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">InteriorLux</h1>
            <p className="text-sm text-gray-500">Дизайнерская мебель и декор</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3">Коллекция 2025</h2>
            <p className="text-white/90 mb-4">Создайте дом своей мечты с нашей мебелью</p>
            <button 
              onClick={() => setSelectedCategory('Гостиная')}
              className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              data-testid="button-view-collection"
            >
              Смотреть каталог
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Категории</h2>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Гостиная')}
              data-testid="category-living"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sofa className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Гостиная</h3>
              <p className="text-center text-sm text-gray-500">42 товара</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Спальня')}
              data-testid="category-bedroom"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Спальня</h3>
              <p className="text-center text-sm text-gray-500">28 товаров</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Кухня')}
              data-testid="category-kitchen"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Кухня</h3>
              <p className="text-center text-sm text-gray-500">18 товаров</p>
            </div>

            <div 
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedCategory('Декор')}
              data-testid="category-decor"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-center font-semibold text-gray-900 mb-1">Декор</h3>
              <p className="text-center text-sm text-gray-500">34 товара</p>
            </div>
          </div>
        </div>

        {/* Popular Items */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Популярное</h2>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 6).map(product => (
              <div 
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100"
                onClick={() => openProductModal(product)}
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <OptimizedImage 
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={product.id <= 4}
                  />
                  <button 
                    className="absolute top-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(product.id);
                    }}
                    aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                    data-testid={`button-favorite-${product.id}`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      strokeWidth={2}
                    />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <div className="text-xs font-medium text-emerald-600 mb-1">{product.category}</div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">${product.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // CATALOG TAB - Modern Grid with Sticky Pills
  const renderCatalogTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24 smooth-scroll-page">
      {/* Sticky Category Pills */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 py-5 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm ${
                  selectedCategory === cat 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                data-testid={`filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600">Найдено {filteredProducts.length} товаров</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => openProductModal(product)}
              data-testid={`product-${product.id}`}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <OptimizedImage 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  priority={product.id <= 4}
                />
                <button 
                  className="absolute top-3 right-3 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(product.id);
                  }}
                  aria-label={isFavorite(String(product.id)) ? 'Удалить из избранного' : 'Добавить в избранное'}
                  data-testid={`favorite-${product.id}`}
                >
                  <Heart 
                    className={`w-5 h-5 ${isFavorite(String(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    strokeWidth={2}
                  />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-xs font-medium text-emerald-600 mb-1">{product.category}</div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">{product.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">${product.price.toLocaleString()}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // CART TAB
  const renderCartTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24 smooth-scroll-page">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Корзина</h1>
        
        {cart.length > 0 ? (
          <>
            <div className="space-y-4">
              {cart.map(item => (
                <div 
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="bg-white rounded-2xl p-4 flex gap-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <LazyImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.size}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        aria-label={`Удалить ${item.name} из корзины`}
                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}
                          aria-label="Уменьшить количество"
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          data-testid={`button-minus-${item.id}`}
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="font-semibold text-gray-900 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                          aria-label="Увеличить количество"
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          data-testid={`button-plus-${item.id}`}
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <span className="font-bold text-emerald-600">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Подытог</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка</span>
                <span className="text-emerald-600">Бесплатно</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-bold text-gray-900">Итого</span>
                <span className="font-bold text-xl text-emerald-600">${cartTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <TrustBadges />
            
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg min-h-[48px]"
              data-testid="button-checkout"
            >
              Оформить заказ
            </button>
            
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
              currency="$"
              onOrderComplete={handleCheckout}
              storeName="InteriorLux"
            />
          </>
        ) : (
          <EmptyState
            type="cart"
            actionLabel="Смотреть каталог"
            onAction={() => onTabChange?.('catalog')}
            className="py-16"
          />
        )}
      </div>
    </div>
  );

  // PROFILE TAB
  const renderProfileTab = () => (
    <div className="min-h-screen bg-gray-50 font-montserrat pb-24 smooth-scroll-page">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
        
        <div className="bg-white rounded-2xl p-6 text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
            <Home className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Добро пожаловать</h2>
            <p className="text-gray-500 text-sm">Войдите для доступа к аккаунту</p>
          </div>
        </div>
        
        <div className="space-y-3">
          {[
            { icon: Heart, label: 'Избранное', value: `${favoritesCount} товаров` },
            { icon: Package, label: 'Заказы', value: `${ordersCount} заказов` },
            { icon: ShoppingBag, label: 'Корзина', value: `${cartCount} товаров` },
            { icon: Settings, label: 'Настройки', value: '' }
          ].map((item, idx) => (
            <button
              key={idx}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 min-h-[56px]"
              data-testid={`button-profile-${item.label.toLowerCase()}`}
            >
              <div className="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                <item.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-gray-900">{item.label}</p>
                {item.value && <p className="text-sm text-gray-500">{item.value}</p>}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // PRODUCT DETAIL MODAL
  const renderProductModal = () => {
    if (!selectedProduct) return null;

    return (
      <div 
        className={`fixed inset-0 z-50 bg-white transition-all duration-300 smooth-scroll-page ${
          isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ overflowY: 'auto' }}
      >
        <div className="max-w-md mx-auto">
          {/* Close Button */}
          <button 
            onClick={closeProductModal}
            className="fixed top-4 right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            data-testid="button-close-modal"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>

          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <OptimizedImage 
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="p-6 space-y-6">
            {/* Category Badge */}
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-sm font-semibold">
              {selectedProduct.category}
            </div>

            {/* Title & Price */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{selectedProduct.name}</h1>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-emerald-600">${selectedProduct.price.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold text-gray-900">{selectedProduct.rating}</span>
                  <span className="text-gray-500">(87)</span>
                </div>
              </div>
            </div>

            {/* Brand */}
            <div className="text-sm text-gray-600">
              от <span className="font-semibold text-gray-900">{selectedProduct.brand}</span>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>

            {/* Style Badge */}
            <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {selectedProduct.style}
            </div>

            {/* Materials */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Материалы</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.materials.map((mat, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                    {mat}
                  </span>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Характеристики</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Размеры</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.dimensions}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Производитель</p>
                  <p className="font-semibold text-gray-900">{selectedProduct.craftsman}</p>
                </div>
              </div>
            </div>

            {/* Care Instructions */}
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-700 font-medium mb-1">Рекомендации по уходу</p>
              <p className="text-amber-900 text-sm">{selectedProduct.careInstructions}</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">В наличии {selectedProduct.inStock} шт</span>
            </div>

            {/* Add to Cart Button */}
            <ConfirmDrawer
              trigger={
                <button 
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-lg min-h-[48px]"
                  data-testid="button-add-to-cart"
                >
                  Добавить в корзину
                </button>
              }
              title="Добавить в корзину?"
              description={`${selectedProduct.name} — ${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(selectedProduct.price)}`}
              confirmText="Добавить"
              cancelText="Отмена"
              variant="default"
              onConfirm={() => {
                handleAddToCart(selectedProduct);
                closeProductModal();
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {activeTab === 'home' && renderHomeTab()}
      {activeTab === 'catalog' && renderCatalogTab()}
      {activeTab === 'cart' && renderCartTab()}
      {activeTab === 'profile' && renderProfileTab()}
      {renderProductModal()}
    </>
  );
}

function InteriorLuxWithTheme(props: InteriorLuxProps) {
  return (
    <DemoThemeProvider themeId="premiumFashion">
      <InteriorLux {...props} />
    </DemoThemeProvider>
  );
}

export default InteriorLuxWithTheme;
