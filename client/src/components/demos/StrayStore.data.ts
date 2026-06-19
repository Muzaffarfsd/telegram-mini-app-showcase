export type Cat = "Одежда" | "Обувь" | "Шапки" | "Сумки";
export type Product = {
  id: string; name: string; series: string; cat: Cat;
  price: number; oldPrice?: number; img: string; colorway: string;
  tag?: string; sizes: string[]; desc: string; details: string[];
  rating: number; reviews: number;
};
export type Banner = { id: string; kind: "image" | "dark" | "light"; img: string; kicker: string; title: string; sub: string; cta: string };

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3F02JzQ7VwcjzsSuotlPzYO9aEk";
const IMG = {
  hero: `${CDN}/hf_20260619_122532_b28cb4c9-8ff7-4a54-b736-b1c89f1b22b7.jpeg`,
  sweater: `${CDN}/hf_20260619_122856_881e9caa-0e8a-4909-ac47-42241a78945f.png`,
  dad: `${CDN}/hf_20260619_122859_e43f77c4-1fe9-4721-af8f-3b996be1c4bb.png`,
  low: `${CDN}/hf_20260619_122909_5fea548d-c183-47de-82c3-66f4514ae2d5.png`,
  hoodie: `${CDN}/hf_20260619_122911_f78bac1a-e5ff-473b-8b78-bba2d7b8df52.png`,
  denim: `${CDN}/hf_20260619_122921_703d644e-5683-4d2f-adec-ad87807dec7a.png`,
  stripe: `${CDN}/hf_20260619_122923_cca21f21-15b7-496e-9fd4-7df1b34b77e7.png`,
  bag: `${CDN}/hf_20260619_122925_6ed60cd2-8ec8-4a57-bd07-d88280f7b138.png`,
  beanie: `${CDN}/hf_20260619_123830_c30c3319-fe76-490c-9b9a-a8fdb9d394bc.png`,
  cargo: `${CDN}/hf_20260619_123832_f4b93f46-c8cd-403b-bca8-256afcb2239a.png`,
  boots: `${CDN}/hf_20260619_124249_b24b9af9-2999-496f-bc69-8110c79d2717.png`,
  runner: `${CDN}/hf_20260619_124251_437487f9-6a48-43d3-aac2-d732099e561f.png`,
  bomber: `${CDN}/hf_20260619_124304_30ca47c9-1d63-4330-a54a-ef7c5775f13c.png`,
  gilet: `${CDN}/hf_20260619_124307_2479b0ff-6d41-4111-8e75-2b130ee43316.png`,
  blazer: `${CDN}/hf_20260619_124310_d2e9c90a-b805-428f-b4f8-b0d2653c7f3f.png`,
  polo: `${CDN}/hf_20260619_124312_50c83f67-8565-43c8-9aa7-faec19e24926.png`,
  jeans: `${CDN}/hf_20260619_124324_193bcd9a-d4f8-4f2c-8866-838ce2d54337.png`,
  cap: `${CDN}/hf_20260619_124326_b8ea76d3-5ae2-4030-a355-60285a70e88b.png`,
  tote: `${CDN}/hf_20260619_124329_9ed39fd8-d2c2-4801-9658-98c9438f1c52.png`,
  heroDuo: `${CDN}/hf_20260619_134020_7a50bf82-dd9b-416b-9c38-6f28b3474c50.jpeg`,
  heroMoody: `${CDN}/hf_20260619_134021_d7241288-cb3a-44ce-ad77-f9e1cd94f464.jpeg`,
  heroFlat: `${CDN}/hf_20260619_134023_41b21865-79df-4962-8fdc-b18a4a91920a.png`,
};

export const products: Product[] = [
  { id: "sweater", name: "Свитер Heavyweight", series: "STRAY Knit", cat: "Одежда", price: 12900, img: IMG.sweater, colorway: "Молочный", tag: "Новинка", sizes: ["S", "M", "L", "XL"], rating: 4.8, reviews: 124,
    desc: "Плотный oversize-трикотаж свободной посадки. Создан для повседневного комфорта и минималистичного образа.",
    details: ["Хлопок 80% / шерсть 20%", "Oversize-посадка, дроп-шолдер", "Плотность 480 г/м²", "Рибана на манжетах и горловине"] },
  { id: "dad", name: "Кроссовки Trail 90", series: "STRAY Footwear", cat: "Обувь", price: 9900, img: IMG.dad, colorway: "Серый / крем", tag: "Хит", sizes: ["40", "41", "42", "43", "44", "45"], rating: 4.7, reviews: 212,
    desc: "Массивная ретро-подошва и замшевые панели. Универсальная пара на каждый день.",
    details: ["Замша и сетчатый текстиль", "Литая EVA-подошва", "Съёмная стелька", "Высота подошвы 4 см"] },
  { id: "hoodie", name: "Худи Heavyweight", series: "STRAY Basics", cat: "Одежда", price: 7900, oldPrice: 9300, img: IMG.hoodie, colorway: "Чёрный", tag: "−15%", sizes: ["S", "M", "L", "XL"], rating: 4.9, reviews: 301,
    desc: "Тяжёлое худи-oversize из чёсаного хлопка. Дроп-шолдер крой и карман-кенгуру.",
    details: ["Хлопок 100%, 450 г/м²", "Дроп-шолдер", "Карман-кенгуру", "Двойной капюшон"] },
  { id: "denim", name: "Джинсовка Washed", series: "STRAY Denim", cat: "Одежда", price: 14500, img: IMG.denim, colorway: "Индиго", sizes: ["S", "M", "L", "XL"], rating: 4.7, reviews: 76,
    desc: "Классический trucker из плотного денима с лёгким эффектом стирки.",
    details: ["Деним 100% хлопок, 13.5 oz", "Прямой крой", "Металлические пуговицы", "Нагрудные карманы"] },
  { id: "low", name: "Кроссовки Court Low", series: "STRAY Footwear", cat: "Обувь", price: 8500, img: IMG.low, colorway: "Молочный", sizes: ["40", "41", "42", "43", "44", "45"], rating: 4.6, reviews: 98,
    desc: "Низкий силуэт из мягкой замши. Чистая минималистичная классика без логотипов.",
    details: ["Натуральная замша", "Резиновая подошва", "Мягкий внутренний кант"] },
  { id: "cargo", name: "Карго Baggy", series: "STRAY Pants", cat: "Одежда", price: 8900, img: IMG.cargo, colorway: "Бежевый", tag: "Новинка", sizes: ["28", "30", "32", "34", "36"], rating: 4.6, reviews: 63,
    desc: "Объёмные карго свободного кроя с накладными карманами и кулиской по низу.",
    details: ["Рип-стоп хлопок", "Baggy-посадка", "6 карманов", "Кулиса по низу"] },
  { id: "stripe", name: "Рубашка Striped", series: "STRAY Shirts", cat: "Одежда", price: 6500, img: IMG.stripe, colorway: "Синий / белый", sizes: ["S", "M", "L", "XL"], rating: 4.5, reviews: 54,
    desc: "Свободная рубашка в полоску с коротким рукавом и мягким воротником.",
    details: ["Хлопок-поплин", "Boxy-крой", "Перламутровые пуговицы"] },
  { id: "beanie", name: "Шапка Ribbed", series: "STRAY Knit", cat: "Шапки", price: 3200, img: IMG.beanie, colorway: "Молочный", sizes: ["ONE SIZE"], rating: 4.8, reviews: 41,
    desc: "Шапка крупной вязки с отворотом из мягкой шерстяной пряжи.",
    details: ["Шерсть / акрил", "Двойной отворот", "One size"] },
  { id: "sling", name: "Сумка Sling", series: "STRAY Gear", cat: "Сумки", price: 5400, img: IMG.bag, colorway: "Чёрный", tag: "Новинка", sizes: ["ONE SIZE"], rating: 4.7, reviews: 88,
    desc: "Лёгкая нагрудная сумка из технического нейлона с регулируемым ремнём.",
    details: ["Технический нейлон", "Водоотталкивающая", "Регулируемый ремень", "3 отделения"] },
  { id: "boots", name: "Ботинки Moto", series: "STRAY Footwear", cat: "Обувь", price: 16900, img: IMG.boots, colorway: "Чёрный", tag: "Premium", sizes: ["40", "41", "42", "43", "44", "45"], rating: 4.8, reviews: 67,
    desc: "Брутальные ботинки на протекторной подошве из гладкой кожи.",
    details: ["Натуральная кожа", "Протекторная подошва", "Боковая молния", "Усиленный носок"] },
  { id: "runner", name: "Кроссовки Retro Runner", series: "STRAY Footwear", cat: "Обувь", price: 10900, img: IMG.runner, colorway: "Синий / крем", tag: "Новинка", sizes: ["40", "41", "42", "43", "44", "45"], rating: 4.7, reviews: 143,
    desc: "Беговой силуэт из замши и сетки с карамельной подошвой.",
    details: ["Замша и сетка", "Подошва-карамель", "Винтажный силуэт"] },
  { id: "bomber", name: "Бомбер Leather", series: "STRAY Outerwear", cat: "Одежда", price: 24900, img: IMG.bomber, colorway: "Чёрный", tag: "Premium", sizes: ["S", "M", "L", "XL"], rating: 4.9, reviews: 52,
    desc: "Кожаный бомбер с рибаной на манжетах. Главная вещь сезона.",
    details: ["Натуральная кожа", "Подкладка-сатин", "Рибана на манжетах и поясе"] },
  { id: "gilet", name: "Жилет Puffer", series: "STRAY Outerwear", cat: "Одежда", price: 11900, img: IMG.gilet, colorway: "Чёрный", sizes: ["S", "M", "L", "XL"], rating: 4.6, reviews: 71,
    desc: "Стёганый утеплённый жилет для слоистых образов.",
    details: ["Эко-утеплитель", "Влагозащита", "Карманы на молнии"] },
  { id: "blazer", name: "Пиджак Oversized", series: "STRAY Tailoring", cat: "Одежда", price: 18900, img: IMG.blazer, colorway: "Тауп", tag: "Новинка", sizes: ["S", "M", "L", "XL"], rating: 4.8, reviews: 39,
    desc: "Объёмный двубортный пиджак из мягкой шерсти. Тихая роскошь.",
    details: ["Шерсть 100%", "Двубортный крой", "Объёмные плечи", "Подкладка-вискоза"] },
  { id: "polo", name: "Поло Knit", series: "STRAY Knit", cat: "Одежда", price: 6900, img: IMG.polo, colorway: "Шоколад", sizes: ["S", "M", "L", "XL"], rating: 4.6, reviews: 58,
    desc: "Трикотажное поло с коротким рукавом и мягкой фактурой.",
    details: ["Хлопок-меринос", "Рубчатая вязка", "Классический воротник"] },
  { id: "jeans", name: "Джинсы Baggy", series: "STRAY Denim", cat: "Одежда", price: 9900, img: IMG.jeans, colorway: "Светлый деним", tag: "Хит", sizes: ["28", "30", "32", "34", "36"], rating: 4.7, reviews: 167,
    desc: "Объёмные джинсы свободного кроя с лёгкой стиркой.",
    details: ["Деним 100% хлопок", "Baggy-посадка", "Средняя посадка"] },
  { id: "cap", name: "Кепка 6-Panel", series: "STRAY Gear", cat: "Шапки", price: 2900, img: IMG.cap, colorway: "Чёрный", sizes: ["ONE SIZE"], rating: 4.5, reviews: 44,
    desc: "Мягкая шестипанельная кепка из стираного хлопка.",
    details: ["Стираный хлопок", "Регулируемый ремешок", "Изогнутый козырёк"] },
  { id: "tote", name: "Сумка Tote", series: "STRAY Gear", cat: "Сумки", price: 4900, img: IMG.tote, colorway: "Экрю", tag: "Новинка", sizes: ["ONE SIZE"], rating: 4.7, reviews: 95,
    desc: "Вместительный шоппер из плотного канваса с кожаными ручками.",
    details: ["Канвас 16 oz", "Кожаные ручки", "Внутренний карман"] },
];

export const banners: Banner[] = [
  { id: "sale", kind: "image", img: IMG.heroDuo, kicker: "Зимний дроп", title: "Зимняя\nраспродажа", sub: "Новый дроп. Чистые силуэты. Только сейчас.", cta: "В каталог" },
  { id: "fw", kind: "image", img: IMG.heroMoody, kicker: "FW26 · Lookbook", title: "Новая\nколлекция", sub: "Спокойный oversize и тёплые тона.", cta: "Открыть" },
  { id: "drop", kind: "image", img: IMG.heroFlat, kicker: "Дроп недели", title: "−15%\nна новинки", sub: "Самые свежие вещи сезона.", cta: "Смотреть" },
];

export const categories: { key: Cat; label: string; img: string }[] = [
  { key: "Одежда", label: "Одежда", img: IMG.sweater },
  { key: "Обувь", label: "Обувь", img: IMG.dad },
  { key: "Шапки", label: "Шапки", img: IMG.beanie },
  { key: "Сумки", label: "Сумки", img: IMG.bag },
];

export const reviewPool = [
  { name: "Артём", rating: 5, text: "Качество на высоте, посадка точно по размеру. Беру не первый раз.", date: "12 июня" },
  { name: "Дарья", rating: 5, text: "Плотная ткань, выглядит дороже своей цены. Доставка за 2 дня.", date: "9 июня" },
  { name: "Кирилл", rating: 4, text: "Отличная вещь, но чуть большемерит — советую брать на размер меньше.", date: "3 июня" },
  { name: "Лена", rating: 5, text: "Цвет как на фото, швы аккуратные. Очень довольна покупкой.", date: "28 мая" },
  { name: "Максим", rating: 5, text: "Минимализм во всём — от упаковки до посадки. Рекомендую.", date: "21 мая" },
];
