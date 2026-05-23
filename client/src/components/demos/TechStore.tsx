import { useState, useCallback, useEffect, useLayoutEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import {
  Search, Heart, Plus, Minus, ChevronRight, ArrowLeft, Check,
  ShoppingBag, Truck, ShieldCheck, X, Tag, Loader2, MoreHorizontal,
} from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

/* ===================================================================
   NOVA — премиальный магазин гаджетов (демо)
   Editorial-минимализм · масонри · shared-element morph · ui-ux-pro-max
   =================================================================== */

const INK = "#161618";
const PAPER = "#FFFFFF";
const CARD = "#F1F0EE";
const SOFT = "#F6F6F5";
const MUTED = "#9A9A9E";
const SUB = "#5B5B5F";
const LINE = "rgba(0,0,0,0.07)";
const HAIR = "rgba(0,0,0,0.05)";

const T = { micro: "0.6875rem", cap: "0.75rem", sm: "0.8125rem", body: "0.9375rem", lg: "1.0625rem", h3: "1.1875rem", h2: "1.5rem", h1: "1.95rem", disp: "2.45rem" };
const IC = { sm: 16, md: 20, lg: 24 };
const SW = 1.8;
const FREE_SHIP = 50000;
const FONT = '-apple-system, "SF Pro Display", "SF Pro Text", system-ui, "Inter", "Helvetica Neue", Arial, sans-serif';

const IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/";

interface Props {
  activeTab: "home" | "catalog" | "cart" | "profile";
  onTabChange: (tab: string) => void;
  onCartCount?: (n: number) => void;
}

interface Product {
  id: string;
  brand: string;
  name: string;
  tagline: string;
  price: number;
  oldPrice?: number;
  cat: string;
  img: string;
  badge?: string;
  rating: number;
  reviews: number;
  colors: { name: string; hex: string }[];
  highlights: string[];
  specs: [string, string][];
  desc: string;
}

const CATEGORIES = ["Смартфоны", "Ноутбуки", "Планшеты", "Часы", "Аудио", "Аксессуары"];

const PRODUCTS: Product[] = [
  {
    id: "n1", brand: "NOVA", name: "Phone 16 Pro", tagline: "Титан. Скорость. Камера.",
    price: 124900, cat: "Смартфоны", img: IMG + "hf_20260523_171203_1370866f-c7a5-4bae-8251-fb5cdcb89b9a_min.webp",
    badge: "Хит", rating: 4.9, reviews: 2140,
    colors: [{ name: "Чёрный титан", hex: "#3A3A3C" }, { name: "Натуральный титан", hex: "#B8AFA3" }, { name: "Белый титан", hex: "#EDEBE6" }],
    highlights: ["Корпус из титана Grade 5", "Чип NOVA A18 Pro", "Камера 48 Мп с 5× зумом"],
    specs: [["Дисплей", "6.3″ OLED · 120 Гц"], ["Чип", "NOVA A18 Pro"], ["Камера", "48 Мп · тройная"], ["Память", "256 ГБ"], ["Батарея", "до 27 ч видео"]],
    desc: "Флагман в титановом корпусе: самый быстрый чип NOVA, профессиональная камера и дисплей с частотой 120 Гц. Создан для тех, кому нужен максимум.",
  },
  {
    id: "n2", brand: "NOVA", name: "Phone 16 Pro Max", tagline: "Большой во всём.",
    price: 149900, cat: "Смартфоны", img: IMG + "hf_20260523_171612_403d52d6-63e7-494f-beaa-f3194f22eda8_min.webp",
    rating: 4.9, reviews: 1680,
    colors: [{ name: "Синий титан", hex: "#2E3A4A" }, { name: "Чёрный титан", hex: "#3A3A3C" }],
    highlights: ["Огромный экран 6.9″", "Рекордная автономность", "Зум-камера 5×"],
    specs: [["Дисплей", "6.9″ OLED · 120 Гц"], ["Чип", "NOVA A18 Pro"], ["Камера", "48 Мп · тройная"], ["Память", "512 ГБ"], ["Батарея", "до 33 ч видео"]],
    desc: "Самый большой и автономный смартфон NOVA. Гигантский дисплей, профессиональная камера и батарея, которой хватает на два дня.",
  },
  {
    id: "n3", brand: "NOVA", name: "Phone 16", tagline: "Всё, что нужно.",
    price: 89900, oldPrice: 99900, cat: "Смартфоны", img: IMG + "hf_20260523_171206_e08d9bab-093b-4d06-b416-0b9a39d589c7_min.webp",
    rating: 4.8, reviews: 3120,
    colors: [{ name: "Серебристый", hex: "#E6E6E8" }, { name: "Чёрный", hex: "#2A2A2C" }],
    highlights: ["Чип NOVA A18", "Двойная камера 48 Мп", "Дисплей OLED"],
    specs: [["Дисплей", "6.1″ OLED"], ["Чип", "NOVA A18"], ["Камера", "48 Мп · двойная"], ["Память", "128 ГБ"], ["Батарея", "до 22 ч видео"]],
    desc: "Идеальный баланс мощности и цены. Современный чип, отличная камера и яркий OLED-дисплей в лёгком корпусе.",
  },
  {
    id: "n4", brand: "NOVA", name: "Phone Air", tagline: "Невозможно тонкий.",
    price: 109900, cat: "Смартфоны", img: IMG + "hf_20260523_171210_62fee929-c224-4a38-bc60-c64f818348a3_min.webp",
    badge: "Новинка", rating: 4.7, reviews: 540,
    colors: [{ name: "Небесно-голубой", hex: "#AFC6D6" }, { name: "Серебристый", hex: "#E6E6E8" }],
    highlights: ["Толщина всего 5.6 мм", "Самый лёгкий корпус", "Чип NOVA A18"],
    specs: [["Дисплей", "6.5″ OLED · 120 Гц"], ["Чип", "NOVA A18"], ["Камера", "48 Мп"], ["Память", "256 ГБ"], ["Толщина", "5.6 мм"]],
    desc: "Рекордно тонкий и лёгкий смартфон. Технологии флагмана в корпусе, который почти не чувствуется в руке.",
  },
  {
    id: "n5", brand: "NOVA", name: "Phone SE", tagline: "Компактная мощь.",
    price: 54900, cat: "Смартфоны", img: IMG + "hf_20260523_171616_40ed4985-7e07-41bc-a19e-723b2ac71ec0_min.webp",
    rating: 4.6, reviews: 1890,
    colors: [{ name: "Тёмная ночь", hex: "#27272A" }],
    highlights: ["Удобный компактный размер", "Чип NOVA A17", "Целый день автономности"],
    specs: [["Дисплей", "5.9″ OLED"], ["Чип", "NOVA A17"], ["Камера", "48 Мп"], ["Память", "128 ГБ"], ["Батарея", "до 18 ч видео"]],
    desc: "Компактный смартфон для тех, кто ценит размер. Мощный чип и надёжная камера в самом доступном корпусе линейки.",
  },
  {
    id: "n6", brand: "NOVA", name: "Book Pro 16", tagline: "Студия в рюкзаке.",
    price: 329900, cat: "Ноутбуки", img: IMG + "hf_20260523_171213_63b087c2-9d82-4517-83fc-0018cfc7fc38_min.webp",
    badge: "Хит", rating: 5.0, reviews: 870,
    colors: [{ name: "Космос чёрный", hex: "#2B2B2D" }, { name: "Серебристый", hex: "#DBDBDD" }],
    highlights: ["Чип NOVA M4 Pro", "Экран Liquid Retina XDR", "До 22 часов работы"],
    specs: [["Экран", "16″ Liquid Retina XDR"], ["Чип", "NOVA M4 Pro"], ["ОЗУ", "32 ГБ"], ["Накопитель", "1 ТБ SSD"], ["Батарея", "до 22 ч"]],
    desc: "Профессиональный ноутбук для самых тяжёлых задач: монтаж 8K, 3D и код. Чип M4 Pro и легендарный экран XDR.",
  },
  {
    id: "n7", brand: "NOVA", name: "Book Pro 14", tagline: "Мощность без компромиссов.",
    price: 249900, cat: "Ноутбуки", img: IMG + "hf_20260523_171619_898dd92f-652b-4ab5-a4e9-02b5178e5e5a_min.webp",
    rating: 4.9, reviews: 1120,
    colors: [{ name: "Серебристый", hex: "#DBDBDD" }, { name: "Космос чёрный", hex: "#2B2B2D" }],
    highlights: ["Чип NOVA M4", "Компактный 14″ корпус", "Экран Liquid Retina XDR"],
    specs: [["Экран", "14″ Liquid Retina XDR"], ["Чип", "NOVA M4"], ["ОЗУ", "16 ГБ"], ["Накопитель", "512 ГБ SSD"], ["Батарея", "до 20 ч"]],
    desc: "Профессиональная мощность в компактном корпусе. Идеальный ноутбук для работы где угодно — без проводов и компромиссов.",
  },
  {
    id: "n8", brand: "NOVA", name: "Book Air 13", tagline: "Лёгкость каждый день.",
    price: 134900, oldPrice: 149900, cat: "Ноутбуки", img: IMG + "hf_20260523_171217_66a22a68-b660-44aa-be24-bb14e8f2e07c_min.webp",
    rating: 4.8, reviews: 2640,
    colors: [{ name: "Серебристый", hex: "#DBDBDD" }, { name: "Сияющая звезда", hex: "#E5DFD2" }],
    highlights: ["Вес всего 1.24 кг", "Чип NOVA M3", "Бесшумный — без вентилятора"],
    specs: [["Экран", "13.6″ Liquid Retina"], ["Чип", "NOVA M3"], ["ОЗУ", "16 ГБ"], ["Накопитель", "512 ГБ SSD"], ["Вес", "1.24 кг"]],
    desc: "Самый популярный ноутбук NOVA. Тонкий, лёгкий и абсолютно бесшумный — идеальный спутник на каждый день.",
  },
  {
    id: "n9", brand: "NOVA", name: "Pad Pro 13", tagline: "Компьютер нового вида.",
    price: 119900, cat: "Планшеты", img: IMG + "hf_20260523_171539_b28c1835-3712-44d6-af23-ead7a0de6f3c_min.webp",
    rating: 4.9, reviews: 760,
    colors: [{ name: "Графитовый", hex: "#3C3C3E" }, { name: "Серебристый", hex: "#DBDBDD" }],
    highlights: ["Чип NOVA M4", "Экран Ultra Retina XDR", "Поддержка пера Pencil Pro"],
    specs: [["Экран", "13″ Ultra Retina XDR"], ["Чип", "NOVA M4"], ["Память", "256 ГБ"], ["Связь", "Wi-Fi 6E"], ["Перо", "Pencil Pro"]],
    desc: "Самый мощный планшет NOVA с экраном Ultra Retina XDR. Заменяет ноутбук для творчества и работы.",
  },
  {
    id: "n10", brand: "NOVA", name: "Pad Air 11", tagline: "Сила и лёгкость.",
    price: 74900, cat: "Планшеты", img: IMG + "hf_20260523_171237_d78912ce-7e78-47be-ad47-06bcbb0dd8ed_min.webp",
    badge: "Новинка", rating: 4.8, reviews: 980,
    colors: [{ name: "Голубой", hex: "#AFC6D6" }, { name: "Графитовый", hex: "#3C3C3E" }],
    highlights: ["Чип NOVA M3", "Лёгкий корпус 11″", "Поддержка Pencil"],
    specs: [["Экран", "11″ Liquid Retina"], ["Чип", "NOVA M3"], ["Память", "128 ГБ"], ["Связь", "Wi-Fi 6"], ["Вес", "460 г"]],
    desc: "Универсальный планшет для учёбы, заметок и развлечений. Мощный чип M3 в лёгком и тонком корпусе.",
  },
  {
    id: "n11", brand: "NOVA", name: "Pad Mini", tagline: "Большое в малом.",
    price: 52900, cat: "Планшеты", img: IMG + "hf_20260523_171623_5f6bf186-2bd9-4f3e-9ff3-aec0e9f6f3d8_min.webp",
    rating: 4.7, reviews: 1340,
    colors: [{ name: "Графитовый", hex: "#3C3C3E" }],
    highlights: ["Компактный 8″ экран", "Чип NOVA A17 Pro", "Помещается в карман"],
    specs: [["Экран", "8.3″ Liquid Retina"], ["Чип", "NOVA A17 Pro"], ["Память", "128 ГБ"], ["Связь", "Wi-Fi 6"], ["Вес", "293 г"]],
    desc: "Самый компактный планшет линейки. Полноценная мощность в формате, который всегда с собой.",
  },
  {
    id: "n12", brand: "NOVA", name: "Watch Ultra", tagline: "Создан для приключений.",
    price: 89900, cat: "Часы", img: IMG + "hf_20260523_171240_3aaf83c0-a2eb-4aa4-93ef-d5e6153409eb_min.webp",
    badge: "Хит", rating: 4.9, reviews: 1450,
    colors: [{ name: "Оранжевый", hex: "#E8722C" }, { name: "Океан синий", hex: "#2E5A8A" }],
    highlights: ["Прочный титановый корпус", "Точный двухдиапазонный GPS", "До 36 часов работы"],
    specs: [["Корпус", "49 мм · титан"], ["Экран", "Always-On Retina"], ["Защита", "100 м · WR"], ["GPS", "Двухдиапазонный"], ["Батарея", "до 36 ч"]],
    desc: "Самые прочные и автономные часы NOVA. Титановый корпус, защита от воды и точная навигация для любых маршрутов.",
  },
  {
    id: "n13", brand: "NOVA", name: "Watch Series 10", tagline: "Здоровье на руке.",
    price: 42900, oldPrice: 49900, cat: "Часы", img: IMG + "hf_20260523_171244_da255331-ad9c-430c-8bbe-8eb74c0955c0_min.webp",
    rating: 4.8, reviews: 3210,
    colors: [{ name: "Тёмная ночь", hex: "#2A2A2C" }, { name: "Серебристый", hex: "#DBDBDD" }],
    highlights: ["Тонкий лёгкий корпус", "Датчики здоровья нового поколения", "Экран Always-On"],
    specs: [["Корпус", "46 мм · алюминий"], ["Экран", "Always-On Retina"], ["Защита", "50 м · WR"], ["Датчики", "ЭКГ · SpO₂ · пульс"], ["Батарея", "до 18 ч"]],
    desc: "Умные часы, которые следят за вашим здоровьем каждый день. Тонкий корпус, яркий экран и точные датчики.",
  },
  {
    id: "n14", brand: "NOVA", name: "Watch Edition", tagline: "Часы как украшение.",
    price: 64900, cat: "Часы", img: IMG + "hf_20260523_171627_fb38c2d6-34ee-4dae-8cf1-eb73acf3303a_min.webp",
    rating: 4.9, reviews: 620,
    colors: [{ name: "Золотой", hex: "#C9A86A" }, { name: "Песочный", hex: "#D9CDB8" }],
    highlights: ["Корпус в цвете шампань", "Премиальный ремешок", "Все датчики здоровья"],
    specs: [["Корпус", "46 мм · алюминий"], ["Экран", "Always-On Retina"], ["Защита", "50 м · WR"], ["Датчики", "ЭКГ · SpO₂ · пульс"], ["Батарея", "до 18 ч"]],
    desc: "Особая версия часов с тёплым оттенком шампань и премиальным ремешком. Технологии и стиль в одном корпусе.",
  },
  {
    id: "n15", brand: "NOVA", name: "Buds Pro 3", tagline: "Тишина по запросу.",
    price: 24900, cat: "Аудио", img: IMG + "hf_20260523_171254_789e89d3-8fa0-426b-b010-776b09ee1d15_min.webp",
    badge: "Новинка", rating: 4.8, reviews: 2870,
    colors: [{ name: "Белый", hex: "#F0F0F2" }],
    highlights: ["Активное шумоподавление", "Пространственное аудио", "До 30 часов с кейсом"],
    specs: [["Тип", "TWS · вкладыши"], ["Шумоподавление", "Активное · адаптивное"], ["Аудио", "Пространственное"], ["Защита", "IP54"], ["Батарея", "до 30 ч с кейсом"]],
    desc: "Беспроводные наушники с лучшим шумоподавлением NOVA. Кристальный звук и пространственное аудио в любой обстановке.",
  },
  {
    id: "n16", brand: "NOVA", name: "Sound", tagline: "Комната оживает.",
    price: 34900, oldPrice: 39900, cat: "Аудио", img: IMG + "hf_20260523_171630_d43f7f05-aab3-4715-a497-a44d22c62a80_min.webp",
    rating: 4.7, reviews: 940,
    colors: [{ name: "Угольный", hex: "#3A3A3C" }],
    highlights: ["Объёмный звук 360°", "Голосовой ассистент", "Умный дом из коробки"],
    specs: [["Тип", "Умная колонка"], ["Звук", "360° · вычисляемый"], ["Связь", "Wi-Fi · Bluetooth"], ["Управление", "Голос · касание"], ["Хаб", "Умный дом"]],
    desc: "Компактная умная колонка с насыщенным объёмным звуком. Управляет музыкой и всем умным домом одной фразой.",
  },
  {
    id: "n17", brand: "NOVA", name: "Charge Pad", tagline: "Заряд без проводов.",
    price: 5900, cat: "Аксессуары", img: IMG + "hf_20260523_171634_cd3dd2de-ecba-455d-9331-7d123bf88b95_min.webp",
    rating: 4.6, reviews: 4120,
    colors: [{ name: "Белый", hex: "#F0F0F2" }],
    highlights: ["Быстрая зарядка 15 Вт", "Магнитное выравнивание", "Тонкий корпус"],
    specs: [["Мощность", "15 Вт"], ["Тип", "Магнитная Qi2"], ["Кабель", "Плетёный USB-C"], ["Совместимость", "Phone · Buds"]],
    desc: "Магнитная беспроводная зарядка, которая точно выравнивает устройство и заряжает его на полной скорости.",
  },
  {
    id: "n18", brand: "NOVA", name: "Studio Display", tagline: "Картинка, в которую веришь.",
    price: 179900, cat: "Аксессуары", img: IMG + "hf_20260523_171638_ad6b9f4e-d047-4ef8-bc3e-4ddd3d434f84_min.webp",
    rating: 4.9, reviews: 510,
    colors: [{ name: "Серебристый", hex: "#DBDBDD" }],
    highlights: ["Экран 27″ 5K Retina", "1 млрд цветов", "Камера и динамики студийного класса"],
    specs: [["Экран", "27″ · 5K Retina"], ["Яркость", "600 нит"], ["Цвет", "P3 · 1 млрд оттенков"], ["Камера", "12 Мп Center Stage"], ["Порты", "Thunderbolt · USB-C"]],
    desc: "Профессиональный 5K-монитор с потрясающей детализацией и точной цветопередачей. Камера и динамики студийного уровня.",
  },
];

const ED = {
  hero: IMG + "hf_20260523_171258_791a20a6-9c96-4e85-bec2-e4813052ec93_min.webp",
  cover: IMG + "hf_20260523_171302_4bae5c5b-fad2-4838-a680-87016bad1067_min.webp",
};

const PAY = [
  { id: "card", label: "Банковская карта" },
  { id: "sbp", label: "СБП" },
  { id: "split", label: "Рассрочка 0%" },
];
const DELIVERY = [
  { id: "express", label: "Экспресс-доставка", sub: "Сегодня, 2–4 часа", price: 590 },
  { id: "courier", label: "Курьер", sub: "Завтра, весь день", price: 0 },
  { id: "pickup", label: "Пункт выдачи NOVA", sub: "2–3 дня", price: 0 },
];

const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const NUM = { fontVariantNumeric: "tabular-nums" as const };
const pct = (p: Product) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
const plural = (n: number, f: [string, string, string]) => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return f[0];
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return f[1];
  return f[2];
};
/* портретные категории выше — органичный масонри-ритм */
const TALL = new Set(["Смартфоны", "Планшеты"]);
const ratioFor = (cat: string) => (TALL.has(cat) ? "1 / 1.26" : "1 / 1.02");

const head = (size: string, tight = "-0.035em"): React.CSSProperties => ({
  fontSize: size, fontWeight: 700, letterSpacing: tight, color: INK, lineHeight: 1.04,
});

const FOCUSABLE = 'button,[href],input,[tabindex]:not([tabindex="-1"])';
function trapTab(e: React.KeyboardEvent, root: HTMLElement | null) {
  if (e.key !== "Tab" || !root) return;
  const els = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
  if (!els.length) return;
  const first = els[0], last = els[els.length - 1];
  const a = document.activeElement;
  if (e.shiftKey && (a === first || a === root)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
}

/* --- изображение со скелетоном --- */
function Img({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full overflow-hidden">
      {!loaded && <div className="nv-shim absolute inset-0" aria-hidden="true" />}
      <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async"
        fetchPriority={priority ? "high" : "auto"} onLoad={() => setLoaded(true)}
        className="w-full h-full" style={{
          objectFit: "contain", display: "block",
          opacity: loaded ? 1 : 0, transition: "opacity .45s ease-out",
        }} />
    </div>
  );
}

/* --- карточка товара — editorial-минимализм --- */
const ProductCard = memo(function ProductCard({ p, fav, onFav, onOpen, idx = 0 }: {
  p: Product; fav: boolean; onFav: () => void; onOpen: (imgEl: HTMLElement | null) => void; idx?: number;
}) {
  const imgRef = useRef<HTMLDivElement>(null);
  const d = pct(p);
  return (
    <div
      role="button" tabIndex={0}
      aria-label={`${p.name}, ${rub(p.price)}`}
      onClick={() => onOpen(imgRef.current)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(imgRef.current); } }}
      className="nv-card cursor-pointer"
      style={{
        width: "100%", background: CARD, borderRadius: 26, overflow: "hidden",
        animation: "nvUp .55s cubic-bezier(.22,1,.36,1) both", animationDelay: `${Math.min(idx, 9) * 0.05}s`,
      }}
    >
      <div ref={imgRef} className="relative" style={{ aspectRatio: ratioFor(p.cat), padding: "12px 12px 4px" }}>
        <Img src={p.img} alt={p.name} />
        {d > 0 && (
          <span className="absolute" style={{
            top: 14, left: 14, background: INK, color: PAPER, fontSize: T.micro, fontWeight: 600,
            padding: "4px 9px", borderRadius: 999,
          }}>−{d}%</span>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label={fav ? `Убрать ${p.name} из избранного` : `В избранное ${p.name}`} aria-pressed={fav}
          className="absolute flex items-center justify-center nv-press"
          style={{ right: 6, bottom: 0, width: 44, height: 44 }}>
          <span className="flex items-center justify-center" style={{
            width: 33, height: 33, borderRadius: 999, background: PAPER, boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
          }}>
            <Heart key={fav ? "1" : "0"} size={15} strokeWidth={2.3}
              fill={fav ? INK : "none"} color={INK} style={fav ? { animation: "nvPop .36s ease-out" } : undefined} />
          </span>
        </button>
      </div>
      <div style={{ padding: "8px 16px 16px" }}>
        <div style={{ fontSize: T.sm, color: INK, fontWeight: 600, letterSpacing: "-0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
        <div className="flex items-baseline" style={{ gap: 7, marginTop: 4 }}>
          <span style={{ fontSize: T.body, fontWeight: 700, color: INK, letterSpacing: "-0.02em", ...NUM }}>{rub(p.price)}</span>
          {p.oldPrice && <span style={{ fontSize: T.cap, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(p.oldPrice)}</span>}
        </div>
      </div>
    </div>
  );
});

/* масонри в две колонки со смещением */
function Masonry({ items, favs, onFav, onOpen }: {
  items: Product[]; favs: Set<string>;
  onFav: (id: string) => void; onOpen: (p: Product, el: HTMLElement | null) => void;
}) {
  const colA = items.filter((_, i) => i % 2 === 0);
  const colB = items.filter((_, i) => i % 2 === 1);
  const col = (list: Product[], offset: number) => (
    <div className="flex flex-col" style={{ flex: 1, gap: 16, marginTop: offset }}>
      {list.map((p, i) => (
        <ProductCard key={p.id} p={p} idx={i * 2 + offset / 34} fav={favs.has(p.id)}
          onFav={() => onFav(p.id)} onOpen={(el) => onOpen(p, el)} />
      ))}
    </div>
  );
  return (
    <div className="flex" style={{ gap: 16, padding: "0 20px", alignItems: "flex-start" }}>
      {col(colA, 0)}
      {col(colB, 34)}
    </div>
  );
}

function Steps({ active }: { active: 1 | 2 | 3 }) {
  const labels = ["Корзина", "Оформление", "Готово"];
  return (
    <div style={{ padding: "2px 20px 12px" }}>
      <div className="flex" style={{ gap: 6 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ flex: 1, height: 3, borderRadius: 999, background: n <= active ? INK : LINE, transition: "background .3s" }} />
        ))}
      </div>
      <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 600, marginTop: 8, letterSpacing: "0.02em" }}>
        Шаг {active} из 3 · {labels[active - 1]}
      </div>
    </div>
  );
}

/* =================== основной компонент =================== */
function TechStore({ activeTab, onTabChange, onCartCount }: Props) {
  const haptic = useHaptic();
  const [selected, setSelected] = useState<Product | null>(null);
  const flyFrom = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set(["n2", "n12"]));
  const [cart, setCart] = useState<{ id: string; qty: number; color: string }[]>([
    { id: "n1", qty: 1, color: "Чёрный титан" },
    { id: "n15", qty: 1, color: "Белый" },
  ]);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const [showFavs, setShowFavs] = useState(false);
  const [homeCat, setHomeCat] = useState("Хиты");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroImg = useRef<HTMLDivElement>(null);

  const fire = useCallback((msg: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), undo ? 4800 : 1900);
  }, []);

  const toggleFav = useCallback((id: string) => {
    haptic.light();
    setFavs((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, [haptic]);

  const addToCart = useCallback((id: string, color: string, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === id && i.color === color);
      if (ex) return c.map((i) => (i === ex ? { ...i, qty: i.qty + qty } : i));
      return [...c, { id, qty, color }];
    });
    fire("Добавлено в корзину");
    haptic.success();
  }, [fire, haptic]);

  const openProduct = useCallback((p: Product, el: HTMLElement | null) => {
    if (el) { const r = el.getBoundingClientRect(); flyFrom.current = { x: r.left, y: r.top, w: r.width, h: r.height }; }
    else flyFrom.current = null;
    haptic.light();
    setSelected(p);
  }, [haptic]);

  const subtotal = cart.reduce((s, i) => {
    const p = PRODUCTS.find((x) => x.id === i.id); return s + (p ? p.price * i.qty : 0);
  }, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  useEffect(() => { onCartCount?.(cartCount); }, [cartCount, onCartCount]);

  const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;
  const favProducts = PRODUCTS.filter((p) => favs.has(p.id));
  const tgUser: any = (() => { try { return (window as any).Telegram?.WebApp?.initDataUnsafe?.user || null; } catch { return null; } })();
  const userName = String(tgUser?.first_name || tgUser?.username || "Алекс");

  const featured = PRODUCTS[0];
  const homeProducts = homeCat === "Хиты"
    ? PRODUCTS.filter((p) => p.badge === "Хит" || p.rating >= 4.8).slice(0, 10)
    : PRODUCTS.filter((p) => p.cat === homeCat);

  /* --------------- ГЛАВНАЯ --------------- */
  const Home = (
    <div className="min-h-full" style={{ background: PAPER, paddingBottom: 30 }}>
      <h1 className="nv-sr">NOVA — магазин премиальных гаджетов</h1>
      <header className="flex items-center justify-between" style={{ padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 14px" }}>
        <div style={{ fontSize: T.lg, fontWeight: 800, letterSpacing: "-0.03em", color: INK }}>NOVA</div>
        <div className="flex items-center" style={{ gap: 2 }}>
          <button type="button" onClick={() => onTabChange("catalog")}
            className="flex items-center justify-center nv-press" style={{ width: 44, height: 44 }} aria-label="Поиск">
            <Search size={IC.md} color={INK} strokeWidth={SW} />
          </button>
          <button type="button" onClick={() => setShowFavs(true)}
            className="relative flex items-center justify-center nv-press" style={{ width: 44, height: 44, marginRight: -8 }} aria-label="Избранное">
            <Heart size={IC.md} color={INK} strokeWidth={SW} />
            {favs.size > 0 && <span className="absolute" style={{ top: 9, right: 9, width: 6, height: 6, borderRadius: 999, background: INK }} />}
          </button>
        </div>
      </header>

      {/* герой */}
      <div style={{ padding: "2px 20px 0" }}>
        <button type="button" onClick={() => openProduct(featured, heroImg.current)}
          className="nv-press relative w-full text-left"
          style={{ display: "block", background: CARD, borderRadius: 32, overflow: "hidden", height: 300 }}>
          <div className="absolute" style={{ left: 24, top: 26, right: 150, zIndex: 2 }}>
            <div style={{ fontSize: T.micro, fontWeight: 700, letterSpacing: "0.08em", color: MUTED, textTransform: "uppercase" }}>Рекомендуем</div>
            <div style={{ ...head(T.h1), marginTop: 12 }}>{featured.name}</div>
            <div style={{ fontSize: T.body, color: MUTED, fontWeight: 500, marginTop: 10, ...NUM }}>{rub(featured.price)}</div>
            <div style={{ fontSize: T.sm, color: SUB, fontWeight: 500, marginTop: 14, lineHeight: 1.45 }}>{featured.tagline}</div>
          </div>
          <span className="absolute flex items-center justify-center" aria-hidden="true"
            style={{ left: 24, bottom: 22, width: 44, height: 44, borderRadius: 999, background: INK }}>
            <ChevronRight size={IC.sm} color={PAPER} strokeWidth={2.6} />
          </span>
          <div ref={heroImg} className="absolute" aria-hidden="true" style={{ right: -22, top: 4, bottom: 4, width: 224 }}>
            <div style={{ width: "100%", height: "100%", animation: "nvFloat 7s ease-in-out infinite" }}>
              <Img src={featured.img} alt={featured.name} priority />
            </div>
          </div>
        </button>
      </div>

      {/* вкладки */}
      <div className="overflow-x-auto scrollbar-hide nv-strip" style={{ marginTop: 24 }}>
        <div className="flex items-center" style={{ gap: 20, padding: "0 20px", width: "max-content" }} role="tablist" aria-label="Категории">
          {["Хиты", ...CATEGORIES].map((c) => {
            const on = homeCat === c;
            return (
              <button type="button" key={c} role="tab" aria-selected={on}
                onClick={() => { setHomeCat(c); haptic.selection(); }}
                className="relative nv-press" style={{ padding: "6px 0", minHeight: 40 }}>
                <span style={{ fontSize: T.lg, fontWeight: on ? 700 : 500, letterSpacing: "-0.03em", color: on ? INK : MUTED, transition: "color .2s" }}>{c}</span>
                {on && <span className="absolute" style={{ left: "50%", bottom: -1, transform: "translateX(-50%)", width: 5, height: 5, borderRadius: 999, background: INK }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* масонри */}
      <div key={homeCat} style={{ marginTop: 20 }}>
        <Masonry items={homeProducts} favs={favs} onFav={toggleFav} onOpen={openProduct} />
      </div>

      {/* редакционный баннер */}
      <button type="button" onClick={() => onTabChange("catalog")}
        className="nv-press relative block text-left"
        style={{ margin: "30px 20px 0", width: "calc(100% - 40px)", height: 188, borderRadius: 28, overflow: "hidden", background: CARD }}>
        <div className="absolute inset-0" aria-hidden="true">
          <Img src={ED.cover} alt="" />
        </div>
        <div className="absolute inset-0" aria-hidden="true"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.94) 100%)" }} />
        <div className="absolute" style={{ left: 22, right: 22, bottom: 20 }}>
          <div style={head(T.h2)}>Одна экосистема</div>
          <div style={{ fontSize: T.sm, color: SUB, fontWeight: 500, marginTop: 5 }}>Устройства NOVA, созданные работать вместе</div>
        </div>
      </button>
    </div>
  );

  /* --------------- КАТАЛОГ --------------- */
  const [catFilter, setCatFilter] = useState("Все");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const catProducts = PRODUCTS.filter(
    (p) => (catFilter === "Все" || p.cat === catFilter) &&
           (q === "" || (p.name + " " + p.cat + " " + p.tagline).toLowerCase().includes(q))
  );
  const Catalog = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 30 }}>
      <h1 style={{ ...head(T.h1), padding: "calc(env(safe-area-inset-top, 0px) + 18px) 20px 16px" }}>Каталог</h1>
      <div style={{ padding: "0 20px 14px" }}>
        <div className="flex items-center" style={{ gap: 9, background: SOFT, borderRadius: 16, padding: "0 15px", height: 48 }}>
          <Search size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
          <input type="search" inputMode="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск устройств" aria-label="Поиск по каталогу"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "1rem", color: INK, minWidth: 0 }} />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Очистить"
              className="flex items-center justify-center nv-press" style={{ minWidth: 44, height: 44, marginRight: -9, fontSize: T.sm, color: MUTED, fontWeight: 500 }}>Сброс</button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide" style={{ marginBottom: 16 }}>
        <div className="flex" style={{ gap: 8, padding: "0 20px", width: "max-content" }} role="group" aria-label="Категории">
          {["Все", ...CATEGORIES].map((c) => {
            const on = catFilter === c;
            return (
              <button type="button" key={c} onClick={() => { setCatFilter(c); haptic.selection(); }} aria-pressed={on}
                className="flex-shrink-0 flex items-center nv-press"
                style={{
                  height: 38, padding: "0 16px", borderRadius: 999, fontSize: T.sm, fontWeight: 600,
                  background: on ? INK : SOFT, color: on ? PAPER : INK, transition: "background .2s, color .2s",
                }}>{c}</button>
            );
          })}
        </div>
      </div>
      {catProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: "64px 32px", color: MUTED }}>
          <Search size={IC.lg} strokeWidth={1.6} aria-hidden="true" />
          <div style={{ marginTop: 13, fontSize: T.body, fontWeight: 600, color: INK }}>Ничего не найдено</div>
          <div style={{ marginTop: 4, fontSize: T.sm }}>Измените запрос или категорию</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: T.cap, color: MUTED, fontWeight: 500, padding: "0 20px 14px" }}>
            {catProducts.length} {plural(catProducts.length, ["устройство", "устройства", "устройств"])}
          </div>
          <Masonry items={catProducts} favs={favs} onFav={toggleFav} onOpen={openProduct} />
        </>
      )}
    </div>
  );

  /* --------------- КОРЗИНА --------------- */
  const [stage, setStage] = useState<"cart" | "checkout" | "done">("cart");
  const [promo, setPromo] = useState("");
  const [promoOK, setPromoOK] = useState(false);
  const [promoErr, setPromoErr] = useState("");
  const [payId, setPayId] = useState("card");
  const [delivId, setDelivId] = useState("courier");
  const [processing, setProcessing] = useState(false);

  const discount = promoOK ? Math.round(subtotal * 0.05) : 0;
  const delivBase = DELIVERY.find((d) => d.id === delivId)!.price;
  const delivPrice = subtotal - discount >= FREE_SHIP ? 0 : delivBase;
  const orderTotal = subtotal - discount + delivPrice;
  const toFree = Math.max(0, FREE_SHIP - (subtotal - discount));
  const shipPct = Math.min(100, Math.round(((subtotal - discount) / FREE_SHIP) * 100));

  const setQty = (idx: number, d: number) =>
    setCart((c) => c.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty + d) } : it)));
  const removeItem = (idx: number) => {
    const removed = cart[idx];
    setCart((c) => c.filter((_, i) => i !== idx));
    fire("Товар удалён", () => setCart((c) => { const n = [...c]; n.splice(Math.min(idx, n.length), 0, removed); return n; }));
  };
  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "NOVA10") { setPromoOK(true); setPromoErr(""); fire("Промокод применён · −5%"); }
    else setPromoErr("Промокод не найден. Попробуйте NOVA10");
  };
  const SumRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
      <span style={{ fontSize: T.sm, color: MUTED, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: T.sm, color: accent ? "#1F7A3D" : INK, fontWeight: 600, ...NUM }}>{value}</span>
    </div>
  );

  const Cart = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 130 }}>
      {stage === "cart" && (
        <>
          <h1 style={{ ...head(T.h1), padding: "calc(env(safe-area-inset-top, 0px) + 18px) 20px 12px" }}>Корзина</h1>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: "76px 32px", color: MUTED }}>
              <ShoppingBag size={IC.lg} strokeWidth={1.6} aria-hidden="true" />
              <div style={{ marginTop: 13, fontSize: T.body, fontWeight: 600, color: INK }}>Корзина пуста</div>
              <div style={{ marginTop: 4, fontSize: T.sm }}>Добавьте устройства из каталога</div>
              <button type="button" onClick={() => onTabChange("catalog")} className="nv-press"
                style={{ marginTop: 22, height: 50, padding: "0 28px", borderRadius: 999, background: INK, color: PAPER, fontSize: T.sm, fontWeight: 600 }}>
                В каталог
              </button>
            </div>
          ) : (
            <>
              <Steps active={1} />
              <div style={{ padding: "4px 20px 0" }}>
                {cart.map((it, idx) => {
                  const p = byId(it.id);
                  return (
                    <div key={idx} className="flex" style={{ gap: 14, padding: "16px 0", borderBottom: `1px solid ${HAIR}` }}>
                      <button type="button" onClick={() => openProduct(p, null)} aria-label={`Открыть ${p.name}`}
                        className="nv-press" style={{ width: 88, height: 88, borderRadius: 18, background: CARD, flexShrink: 0, overflow: "hidden", padding: 8 }}>
                        <Img src={p.img} alt={p.name} />
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: T.body, fontWeight: 600, color: INK, letterSpacing: "-0.02em" }}>{p.name}</div>
                        <div style={{ fontSize: T.cap, color: MUTED, marginTop: 2 }}>{it.color}</div>
                        <div className="flex items-center justify-between" style={{ marginTop: 13 }}>
                          <div className="flex items-center" style={{ gap: 2, background: SOFT, borderRadius: 999, padding: 3 }}>
                            <button type="button" onClick={() => setQty(idx, -1)} aria-label="Меньше"
                              className="flex items-center justify-center nv-press" style={{ width: 32, height: 32, borderRadius: 999, background: PAPER }}>
                              <Minus size={14} color={it.qty <= 1 ? MUTED : INK} strokeWidth={2.4} />
                            </button>
                            <span style={{ fontSize: T.sm, fontWeight: 700, color: INK, minWidth: 26, textAlign: "center", ...NUM }} aria-live="polite">{it.qty}</span>
                            <button type="button" onClick={() => setQty(idx, 1)} aria-label="Больше"
                              className="flex items-center justify-center nv-press" style={{ width: 32, height: 32, borderRadius: 999, background: PAPER }}>
                              <Plus size={14} color={INK} strokeWidth={2.4} />
                            </button>
                          </div>
                          <span style={{ fontSize: T.body, fontWeight: 700, color: INK, ...NUM }}>{rub(p.price * it.qty)}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} aria-label={`Удалить ${p.name}`}
                        className="flex items-center justify-center nv-press" style={{ width: 44, height: 44, margin: "-10px -12px 0 0", flexShrink: 0 }}>
                        <X size={IC.sm} color={MUTED} strokeWidth={SW} />
                      </button>
                    </div>
                  );
                })}

                <div style={{ marginTop: 16 }}>
                  {promoOK ? (
                    <div className="flex items-center justify-between" style={{ background: SOFT, borderRadius: 16, padding: "13px 15px" }}>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <Tag size={IC.sm} color={INK} strokeWidth={SW} />
                        <span style={{ fontSize: T.sm, fontWeight: 600, color: INK }}>NOVA10 · −5%</span>
                      </div>
                      <button type="button" onClick={() => { setPromoOK(false); setPromo(""); }} aria-label="Убрать промокод"
                        className="flex items-center justify-center nv-press" style={{ width: 44, height: 44, marginRight: -8 }}>
                        <X size={IC.sm} color={INK} strokeWidth={SW} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <div className="flex items-center" style={{ flex: 1, background: SOFT, borderRadius: 16, padding: "0 15px", height: 48 }}>
                          <Tag size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
                          <input value={promo} onChange={(e) => { setPromo(e.target.value); setPromoErr(""); }}
                            onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
                            placeholder="Промокод" aria-label="Промокод"
                            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "1rem", color: INK, marginLeft: 9, minWidth: 0 }} />
                        </div>
                        <button type="button" onClick={applyPromo} className="nv-press"
                          style={{ height: 48, padding: "0 19px", borderRadius: 16, background: INK, color: PAPER, fontSize: T.sm, fontWeight: 600 }}>
                          ОК
                        </button>
                      </div>
                      {promoErr && <div role="alert" style={{ fontSize: T.cap, color: "#C0392B", marginTop: 7, fontWeight: 500 }}>{promoErr}</div>}
                    </>
                  )}
                </div>

                <div style={{ marginTop: 16, background: SOFT, borderRadius: 16, padding: "14px 15px" }}>
                  {toFree > 0 ? (
                    <>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <Truck size={IC.sm} color={INK} strokeWidth={SW} aria-hidden="true" />
                        <span style={{ fontSize: T.cap, color: INK, fontWeight: 600 }}>
                          До бесплатной доставки · ещё <span style={NUM}>{rub(toFree)}</span>
                        </span>
                      </div>
                      <div className="relative" style={{ height: 5, background: "rgba(0,0,0,0.08)", borderRadius: 999, marginTop: 10 }}
                        role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={shipPct}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999, background: INK, width: `${shipPct}%`, transition: "width .45s cubic-bezier(.22,1,.36,1)" }} />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <Check size={IC.sm} color="#1F7A3D" strokeWidth={2.6} aria-hidden="true" />
                      <span style={{ fontSize: T.cap, color: "#1F7A3D", fontWeight: 600 }}>Бесплатная доставка подключена</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
                  <SumRow label={`Товары · ${cartCount}`} value={rub(subtotal)} />
                  {discount > 0 && <SumRow label="Скидка по промокоду" value={`−${rub(discount)}`} accent />}
                  <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
                    <span style={{ fontSize: T.body, color: INK, fontWeight: 600 }}>Итого</span>
                    <span style={{ ...head(T.h2), ...NUM }} aria-live="polite">{rub(subtotal - discount)}</span>
                  </div>
                </div>

                <button type="button" onClick={() => { setStage("checkout"); haptic.light(); }} className="nv-press"
                  style={{ width: "100%", marginTop: 18, height: 56, borderRadius: 999, background: INK, color: PAPER, fontSize: T.body, fontWeight: 600 }}>
                  Оформить заказ
                </button>
              </div>
            </>
          )}
        </>
      )}

      {stage === "checkout" && (
        <>
          <div className="flex items-center" style={{ gap: 6, padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 4px" }}>
            <button type="button" onClick={() => setStage("cart")} aria-label="Назад"
              className="flex items-center justify-center nv-press" style={{ width: 40, height: 40, marginLeft: -8 }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={head(T.h1)}>Оформление</h1>
          </div>
          <Steps active={2} />
          <div style={{ padding: "4px 20px 0" }}>
            <div className="flex items-center justify-between" style={{ background: SOFT, borderRadius: 18, padding: "15px 16px" }}>
              <div>
                <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>Адрес доставки</div>
                <div style={{ fontSize: T.sm, color: INK, fontWeight: 600, marginTop: 5 }}>{userName}</div>
                <div style={{ fontSize: T.sm, color: MUTED, marginTop: 2 }}>ул. Тверская 12, Москва</div>
              </div>
              <ChevronRight size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
            </div>

            <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 24, marginBottom: 9 }}>Доставка</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Способ доставки">
              {DELIVERY.map((d) => {
                const on = delivId === d.id; const free = (subtotal - discount >= FREE_SHIP && d.id !== "express") || d.price === 0;
                return (
                  <button type="button" key={d.id} role="radio" aria-checked={on} onClick={() => setDelivId(d.id)}
                    className="flex items-center justify-between nv-press"
                    style={{ padding: "14px 16px", borderRadius: 18, border: `1.5px solid ${on ? INK : LINE}`, background: PAPER }}>
                    <div className="flex items-center" style={{ gap: 12 }}>
                      <span className="flex items-center justify-center" style={{ width: 19, height: 19, borderRadius: 999, border: `1.5px solid ${on ? INK : LINE}` }}>
                        {on && <span style={{ width: 10, height: 10, borderRadius: 999, background: INK }} />}
                      </span>
                      <div className="text-left">
                        <div style={{ fontSize: T.sm, fontWeight: 600, color: INK }}>{d.label}</div>
                        <div style={{ fontSize: T.cap, color: MUTED, marginTop: 1 }}>{d.sub}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: T.sm, fontWeight: 600, color: free ? "#1F7A3D" : INK, ...NUM }}>{free ? "Бесплатно" : rub(d.price)}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 24, marginBottom: 9 }}>Оплата</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Способ оплаты">
              {PAY.map((m) => {
                const on = payId === m.id;
                return (
                  <button type="button" key={m.id} role="radio" aria-checked={on} onClick={() => setPayId(m.id)}
                    className="flex items-center nv-press"
                    style={{ gap: 12, padding: "14px 16px", borderRadius: 18, border: `1.5px solid ${on ? INK : LINE}`, background: PAPER }}>
                    <span className="flex items-center justify-center" style={{ width: 19, height: 19, borderRadius: 999, border: `1.5px solid ${on ? INK : LINE}` }}>
                      {on && <span style={{ width: 10, height: 10, borderRadius: 999, background: INK }} />}
                    </span>
                    <span style={{ fontSize: T.sm, fontWeight: 600, color: INK }}>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
              <SumRow label={`Товары · ${cartCount}`} value={rub(subtotal)} />
              {discount > 0 && <SumRow label="Скидка по промокоду" value={`−${rub(discount)}`} accent />}
              <SumRow label="Доставка" value={delivPrice === 0 ? "Бесплатно" : rub(delivPrice)} accent={delivPrice === 0} />
              <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
                <span style={{ fontSize: T.body, color: INK, fontWeight: 600 }}>К оплате</span>
                <span style={{ ...head(T.h2), ...NUM }}>{rub(orderTotal)}</span>
              </div>
            </div>

            <button type="button" disabled={processing}
              onClick={() => { setProcessing(true); haptic.medium(); setTimeout(() => { setProcessing(false); setStage("done"); haptic.success(); }, 1000); }}
              className="flex items-center justify-center nv-press"
              style={{ width: "100%", marginTop: 18, height: 56, borderRadius: 999, background: INK, color: PAPER, fontSize: T.body, fontWeight: 600, gap: 9, opacity: processing ? 0.72 : 1 }}>
              {processing
                ? <><Loader2 size={IC.sm} color={PAPER} strokeWidth={2.4} style={{ animation: "nvSpin .8s linear infinite" }} aria-hidden="true" /> Обработка…</>
                : <>Оплатить · {rub(orderTotal)}</>}
            </button>
          </div>
        </>
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "74vh", padding: "0 32px" }}>
          <div className="flex items-center justify-center" style={{ width: 80, height: 80, borderRadius: 999, background: INK, animation: "nvPop .5s ease-out" }}>
            <Check size={36} color={PAPER} strokeWidth={2.6} aria-hidden="true" />
          </div>
          <h1 style={{ ...head(T.h1), marginTop: 24 }}>Заказ оформлен</h1>
          <p style={{ fontSize: T.sm, color: MUTED, marginTop: 9, lineHeight: 1.55 }}>
            Подтверждение и трек-номер отправлены вам на почту. Курьер свяжется перед доставкой.
          </p>
          <button type="button" onClick={() => { setCart([]); setStage("cart"); setPromoOK(false); setPromo(""); onTabChange("home"); }}
            className="nv-press"
            style={{ marginTop: 26, height: 52, padding: "0 42px", borderRadius: 999, background: INK, color: PAPER, fontSize: T.sm, fontWeight: 600 }}>
            Готово
          </button>
        </div>
      )}
    </div>
  );

  /* --------------- ПРОФИЛЬ --------------- */
  const Profile = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 30 }}>
      <h1 style={{ ...head(T.h1), padding: "calc(env(safe-area-inset-top, 0px) + 18px) 20px 18px" }}>Профиль</h1>
      <div className="flex items-center" style={{ gap: 15, padding: "0 20px 22px" }}>
        <div className="flex items-center justify-center" aria-hidden="true"
          style={{ width: 64, height: 64, borderRadius: 999, background: INK }}>
          <span style={{ fontSize: T.h2, fontWeight: 700, color: PAPER }}>{userName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <div style={{ fontSize: T.h3, fontWeight: 700, color: INK, letterSpacing: "-0.03em" }}>{userName}</div>
          <div style={{ fontSize: T.sm, color: MUTED, marginTop: 2 }}>NOVA ID · Premium</div>
        </div>
      </div>
      <div className="flex" style={{ gap: 10, padding: "0 20px 10px" }}>
        {[["Заказы", "12"], ["Бонусы", "8 400"], ["Гарантии", "5"]].map(([k, v]) => (
          <div key={k} style={{ flex: 1, background: CARD, borderRadius: 20, padding: "15px 13px" }}>
            <div style={{ fontSize: T.h3, fontWeight: 700, color: INK, letterSpacing: "-0.02em", ...NUM }}>{v}</div>
            <div style={{ fontSize: T.cap, color: MUTED, marginTop: 3 }}>{k}</div>
          </div>
        ))}
      </div>
      <nav aria-label="Меню профиля" style={{ marginTop: 14 }}>
        {[
          { r: "Мои заказы", n: "home" },
          { r: "Избранное", n: "fav" },
          { r: "Адреса доставки", n: "catalog" },
          { r: "Способы оплаты", n: "catalog" },
          { r: "Поддержка NOVA", n: "catalog" },
        ].map((row) => (
          <button type="button" key={row.r}
            onClick={() => { if (row.n === "fav") setShowFavs(true); else onTabChange(row.n); }}
            className="flex items-center justify-between w-full nv-press"
            style={{ padding: "0 20px", minHeight: 56, borderBottom: `1px solid ${HAIR}` }}>
            <span style={{ fontSize: T.body, fontWeight: 500, color: INK }}>{row.r}</span>
            <div className="flex items-center" style={{ gap: 8 }}>
              {row.r === "Избранное" && favs.size > 0 && (
                <span style={{ fontSize: T.cap, color: MUTED, fontWeight: 600, ...NUM }}>{favs.size}</span>
              )}
              <ChevronRight size={IC.md} color={MUTED} strokeWidth={SW} aria-hidden="true" />
            </div>
          </button>
        ))}
      </nav>
    </div>
  );

  /* --------------- КАРТОЧКА ТОВАРА + shared-element morph --------------- */
  const [colorIdx, setColorIdx] = useState(0);
  const detailImg = useRef<HTMLDivElement>(null);
  const detailDialog = useRef<HTMLDivElement>(null);
  const detailClose = useRef<HTMLButtonElement>(null);
  const cameWithMorph = useRef(false);
  cameWithMorph.current = !!flyFrom.current;

  useEffect(() => {
    if (selected) {
      setColorIdx(0);
      const t = setTimeout(() => detailClose.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [selected]);

  /* FLIP: товар «прилетает» из карточки в детальный экран */
  useLayoutEffect(() => {
    if (!selected) return;
    const from = flyFrom.current;
    flyFrom.current = null;
    const target = detailImg.current;
    if (!from || !target) return;
    const to = target.getBoundingClientRect();
    if (to.width < 4 || to.height < 4) return;
    const fly = document.createElement("div");
    fly.style.cssText =
      `position:fixed;z-index:100000;left:0;top:0;pointer-events:none;` +
      `width:${to.width}px;height:${to.height}px;transform-origin:0 0;` +
      `transform:translate(${from.x}px,${from.y}px) scale(${from.w / to.width},${from.h / to.height});`;
    const im = document.createElement("img");
    im.src = selected.img;
    im.style.cssText = "width:100%;height:100%;object-fit:contain;display:block;";
    fly.appendChild(im);
    document.body.appendChild(fly);
    target.style.opacity = "0";
    let finished = false;
    const done = () => {
      if (finished) return; finished = true;
      fly.remove();
      if (detailImg.current) detailImg.current.style.opacity = "1";
    };
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fly.style.transition = "transform .54s cubic-bezier(.4,.68,.2,1)";
      fly.style.transform = `translate(${to.x}px,${to.y}px) scale(1,1)`;
    }));
    fly.addEventListener("transitionend", done, { once: true });
    const tid = setTimeout(done, 720);
    return () => { clearTimeout(tid); done(); };
  }, [selected]);

  const similar = selected
    ? PRODUCTS.filter((p) => p.id !== selected.id && p.cat === selected.cat)
        .concat(PRODUCTS.filter((p) => p.id !== selected.id && p.cat !== selected.cat)).slice(0, 6)
    : [];

  const Detail = selected && (
    <div className="nv">
      <div ref={detailDialog} className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER, fontFamily: FONT }}
        role="dialog" aria-modal="true" aria-label={selected.name}
        onKeyDown={(e) => { if (e.key === "Escape") setSelected(null); trapTab(e, detailDialog.current); }}>
        <div className="w-full flex flex-col relative" style={{
          maxWidth: 448,
          animation: cameWithMorph.current ? "nvFade .34s ease-out both" : "nvSheet .42s cubic-bezier(.22,1,.36,1) both",
        }}>
          <div key={selected.id} className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, paddingBottom: 110 }}>
            {/* заголовок */}
            <div className="flex items-start justify-between" style={{ padding: "calc(env(safe-area-inset-top, 0px) + 22px) 20px 0", gap: 14 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: T.micro, fontWeight: 700, letterSpacing: "0.08em", color: MUTED, textTransform: "uppercase" }}>{selected.brand} · {selected.cat}</div>
                <h1 style={{ ...head(T.disp), marginTop: 9 }}>{selected.name}</h1>
                <div className="flex items-baseline" style={{ gap: 9, marginTop: 9 }}>
                  <span style={{ fontSize: T.h3, color: MUTED, fontWeight: 600, ...NUM }}>{rub(selected.price)}</span>
                  {selected.oldPrice && <span style={{ fontSize: T.body, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(selected.oldPrice)}</span>}
                </div>
              </div>
              <button type="button" onClick={() => { addToCart(selected.id, selected.colors[colorIdx].name); }}
                aria-label="Быстро добавить в корзину"
                className="flex items-center justify-center nv-press flex-shrink-0"
                style={{ width: 46, height: 46, borderRadius: 999, background: INK }}>
                <Plus size={IC.md} color={PAPER} strokeWidth={2.6} />
              </button>
            </div>

            {/* изображение — shared element */}
            <div ref={detailImg} style={{ margin: "8px 16px 0", aspectRatio: "1 / 1" }}>
              <div style={{ width: "100%", height: "100%", animation: "nvFloat 7s ease-in-out infinite" }}>
                <Img src={selected.img} alt={selected.name} priority />
              </div>
            </div>

            <div style={{ padding: "10px 20px 0" }}>
              {/* цвет */}
              <div className="flex items-center justify-between">
                <span style={{ fontSize: T.sm, color: SUB, fontWeight: 600 }}>{selected.colors[colorIdx].name}</span>
                <div className="flex" style={{ gap: 9 }} role="group" aria-label="Выбор цвета">
                  {selected.colors.map((c, i) => (
                    <button type="button" key={c.name} onClick={() => { setColorIdx(i); haptic.selection(); }}
                      aria-label={c.name} aria-pressed={colorIdx === i}
                      className="flex items-center justify-center nv-press"
                      style={{ width: 30, height: 30, borderRadius: 999, border: `2px solid ${colorIdx === i ? INK : "transparent"}` }}>
                      <span style={{ width: 20, height: 20, borderRadius: 999, background: c.hex, border: `1px solid ${LINE}` }} />
                    </button>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: T.body, color: SUB, lineHeight: 1.6, marginTop: 20 }}>{selected.desc}</p>

              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 11 }}>
                {selected.highlights.map((h) => (
                  <div key={h} className="flex items-center" style={{ gap: 11 }}>
                    <span className="flex items-center justify-center flex-shrink-0" aria-hidden="true"
                      style={{ width: 22, height: 22, borderRadius: 999, background: CARD }}>
                      <Check size={13} color={INK} strokeWidth={2.8} />
                    </span>
                    <span style={{ fontSize: T.sm, color: INK, fontWeight: 500 }}>{h}</span>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: 28, marginBottom: 2 }}>Характеристики</div>
              <div>
                {selected.specs.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between" style={{ padding: "12px 0", borderBottom: `1px solid ${HAIR}` }}>
                    <span style={{ fontSize: T.sm, color: MUTED, fontWeight: 500 }}>{k}</span>
                    <span style={{ fontSize: T.sm, color: INK, fontWeight: 600, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center" style={{ gap: 18, marginTop: 18, background: CARD, borderRadius: 20, padding: "15px 17px" }}>
                <div className="flex items-center" style={{ gap: 9 }}>
                  <ShieldCheck size={IC.sm} color={INK} strokeWidth={SW} aria-hidden="true" />
                  <span style={{ fontSize: T.cap, color: INK, fontWeight: 500 }}>Гарантия 1 год</span>
                </div>
                <div style={{ width: 1, height: 18, background: LINE }} aria-hidden="true" />
                <div className="flex items-center" style={{ gap: 9 }}>
                  <Truck size={IC.sm} color={INK} strokeWidth={SW} aria-hidden="true" />
                  <span style={{ fontSize: T.cap, color: INK, fontWeight: 500 }}>Доставка завтра</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <h2 style={{ ...head(T.h2), padding: "0 20px", marginBottom: 14 }}>Похожие</h2>
              <div className="overflow-x-auto scrollbar-hide nv-strip">
                <div className="flex" style={{ gap: 14, padding: "0 20px 6px", width: "max-content" }}>
                  {similar.map((p, i) => (
                    <div key={p.id} style={{ width: 168, flexShrink: 0 }}>
                      <ProductCard p={p} idx={i} fav={favs.has(p.id)}
                        onFav={() => toggleFav(p.id)} onOpen={(el) => openProduct(p, el)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* плавающая нижняя панель */}
          <div className="absolute flex items-center" style={{
            left: 16, right: 16, bottom: "max(16px, env(safe-area-inset-bottom))", gap: 10, zIndex: 4,
          }}>
            <button type="button" ref={detailClose} onClick={() => setSelected(null)} aria-label="Закрыть"
              className="flex items-center justify-center nv-press flex-shrink-0"
              style={{ width: 54, height: 54, borderRadius: 999, background: PAPER, boxShadow: "0 6px 22px rgba(0,0,0,0.16)" }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <button type="button" onClick={() => { addToCart(selected.id, selected.colors[colorIdx].name); setSelected(null); }}
              className="flex items-center justify-between nv-press"
              style={{ flex: 1, height: 54, borderRadius: 999, background: INK, color: PAPER, padding: "0 12px 0 22px", boxShadow: "0 6px 22px rgba(0,0,0,0.22)" }}>
              <span style={{ fontSize: T.body, fontWeight: 600 }}>В корзину</span>
              <span className="flex items-center" style={{ gap: 10 }}>
                <span style={{ fontSize: T.body, fontWeight: 700, ...NUM }}>{rub(selected.price)}</span>
                <span className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 999, background: "rgba(255,255,255,0.16)" }}>
                  <ShoppingBag size={15} color={PAPER} strokeWidth={2.4} />
                </span>
              </span>
            </button>
            <button type="button" onClick={() => toggleFav(selected.id)} aria-pressed={favs.has(selected.id)}
              aria-label={favs.has(selected.id) ? "Убрать из избранного" : "В избранное"}
              className="flex items-center justify-center nv-press flex-shrink-0"
              style={{ width: 54, height: 54, borderRadius: 999, background: PAPER, boxShadow: "0 6px 22px rgba(0,0,0,0.16)" }}>
              <Heart key={favs.has(selected.id) ? "1" : "0"} size={IC.md} strokeWidth={2.2}
                fill={favs.has(selected.id) ? INK : "none"} color={INK}
                style={favs.has(selected.id) ? { animation: "nvPop .36s ease-out" } : undefined} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------- ИЗБРАННОЕ --------------- */
  const favClose = useRef<HTMLButtonElement>(null);
  const favDialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showFavs) { const t = setTimeout(() => favClose.current?.focus(), 80); return () => clearTimeout(t); }
  }, [showFavs]);

  const Favorites = showFavs && (
    <div className="nv">
      <div ref={favDialog} className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER, fontFamily: FONT }}
        role="dialog" aria-modal="true" aria-label="Избранное"
        onKeyDown={(e) => { if (e.key === "Escape") setShowFavs(false); trapTab(e, favDialog.current); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "nvSheet .42s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="sticky top-0 flex items-center" style={{ gap: 12, padding: "calc(env(safe-area-inset-top, 0px) + 14px) 20px 14px", background: PAPER }}>
            <button type="button" ref={favClose} onClick={() => setShowFavs(false)} aria-label="Закрыть"
              className="flex items-center justify-center nv-press" style={{ width: 44, height: 44, borderRadius: 999, background: SOFT, marginLeft: -4 }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={head(T.h1)}>Избранное</h1>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, paddingBottom: 28, paddingTop: 6 }}>
            {favProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: "84px 32px", color: MUTED }}>
                <Heart size={IC.lg} strokeWidth={1.6} aria-hidden="true" />
                <div style={{ marginTop: 13, fontSize: T.body, fontWeight: 600, color: INK }}>Пока пусто</div>
                <div style={{ marginTop: 4, fontSize: T.sm }}>Отмечайте товары сердечком</div>
                <button type="button" onClick={() => { setShowFavs(false); onTabChange("catalog"); }}
                  className="nv-press"
                  style={{ marginTop: 22, height: 50, padding: "0 28px", borderRadius: 999, background: INK, color: PAPER, fontSize: T.sm, fontWeight: 600 }}>
                  В каталог
                </button>
              </div>
            ) : (
              <Masonry items={favProducts} favs={favs} onFav={toggleFav}
                onOpen={(p, el) => { setShowFavs(false); openProduct(p, el); }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="nv relative" style={{ minHeight: "100%", background: PAPER, fontFamily: FONT }}>
      <style>{`
.nv,.nv *{font-family:${FONT}}
.nv *:focus-visible{outline:2px solid ${INK};outline-offset:2px;border-radius:10px}
.nv button,.nv [role=button],.nv input{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.nv-press{transition:transform .15s ease,opacity .15s ease}
.nv-press:active{transform:scale(.95);opacity:.92}
.nv-card{transition:transform .18s cubic-bezier(.22,1,.36,1);box-shadow:0 1px 3px rgba(0,0,0,0.04),0 16px 32px -20px rgba(0,0,0,0.20)}
.nv-card:active{transform:scale(.972)}
.nv-strip{scroll-snap-type:x proximity}
.nv-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.nv-shim{background:linear-gradient(100deg,#ececeb 30%,#f6f6f5 50%,#ececeb 70%);background-size:220% 100%;animation:nvShim 1.3s linear infinite}
@keyframes nvShim{from{background-position:220% 0}to{background-position:-220% 0}}
@keyframes nvUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes nvSheet{from{opacity:0;transform:translateY(44px)}to{opacity:1;transform:none}}
@keyframes nvFade{from{opacity:0}to{opacity:1}}
@keyframes nvPop{0%{transform:scale(1)}40%{transform:scale(1.34)}100%{transform:scale(1)}}
@keyframes nvFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes nvSpin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){.nv *,.nv *::before,.nv *::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
`}</style>
      {activeTab === "home" && Home}
      {activeTab === "catalog" && Catalog}
      {activeTab === "cart" && Cart}
      {activeTab === "profile" && Profile}
      {toast && (
        <div className="fixed left-1/2 flex items-center" role="status" aria-live="polite" style={{
          bottom: 128, transform: "translateX(-50%)", gap: 12, zIndex: 10001,
          background: INK, color: PAPER, padding: "13px 17px 13px 19px", borderRadius: 999, fontSize: T.sm, fontWeight: 500,
          boxShadow: "0 12px 32px rgba(0,0,0,0.32)", maxWidth: "90vw",
        }}>
          <span className="flex items-center" style={{ gap: 8 }}>
            <Check size={IC.sm} color={PAPER} strokeWidth={2.6} aria-hidden="true" /> {toast.msg}
          </span>
          {toast.undo && (
            <button type="button" onClick={() => { toast.undo!(); setToast(null); }}
              style={{ color: PAPER, fontWeight: 700, fontSize: T.sm, padding: "2px 4px", textDecoration: "underline" }}>
              Вернуть
            </button>
          )}
        </div>
      )}
      {Detail && createPortal(Detail, document.body)}
      {Favorites && createPortal(Favorites, document.body)}
    </div>
  );
}

export default memo(TechStore);
