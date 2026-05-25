import { useState, useCallback, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import {
  Search, Heart, Plus, Minus, ChevronRight, ArrowLeft, Check, X, Tag,
  ShoppingBag, Truck, ShieldCheck, RotateCcw, Loader2, Star,
} from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";
import blackHoodieImage from "@assets/c63bf9171394787.646e06bedc2c7_1761732722277.jpg";
import colorfulHoodieImage from "@assets/fb10cc201496475.6675676d24955_1761732737648.jpg";
import olivePufferImage from "@assets/olive_puffer.jpg";
import colorblockHoodieNew from "@assets/colorblock_hoodie_new.jpg";
import orangeOversizedImage from "@assets/orange_oversized.jpg";
import pinkClassicImage from "@assets/pink_classic.jpg";
import blueWinterImage from "@assets/blue_winter.jpg";
import blackBomberImage from "@assets/black_bomber.jpg";
import beigeTrenchImage from "@assets/beige_trench.jpg";
import carbonHoodieImage from "@assets/carbon_hoodie.jpg";

const fashionVideo = "/videos/4e4993d0ac079a607a0bee301af06749_1761775010830.mp4";

/* ===================================================================
   RADIANCE — fashion-бутик (демо)
   Тёплый editorial-люкс · Playfair + Inter · ui-ux-pro-max · 2026
   =================================================================== */

const INK = "#1C1A17";
const PAPER = "#FFFFFF";
const CANVAS = "#EEEAE2";
const SAND = "#E3DCCF";
const TINT = "#E9E3D7";
const MUTED = "#8B8377";
const SUB = "#5A5349";
const ACCENT = "#A65A33";
const ACCENT_DEEP = "#8A4825";
const LINE = "rgba(28,26,23,0.12)";
const HAIR = "rgba(28,26,23,0.06)";

const SERIF = "'Playfair Display', 'Times New Roman', Georgia, serif";
const SANS = "'Inter', system-ui, -apple-system, sans-serif";

const T = { micro: "0.6875rem", cap: "0.75rem", sm: "0.8125rem", body: "0.9375rem", lg: "1.0625rem" };
const S = { s1: "1.5rem", s2: "2rem", s3: "2.6rem", s4: "3.3rem" };
const IC = { sm: 16, md: 20, lg: 24 };
const SW = 1.7;
const FREE_SHIP = 30000;

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
  cat: string;
  gender: string;
  price: number;
  oldPrice?: number;
  img: string;
  tag?: string;
  rating: number;
  reviews: number;
  colors: { name: string; hex: string }[];
  sizes: string[];
  desc: string;
  composition: string;
  fit: string;
}

const CATEGORIES = ["Куртки", "Пальто", "Худи", "Трикотаж", "Брюки", "Аксессуары"];
const GENDERS = ["Все", "Женское", "Мужское", "Унисекс"];

const SZ = ["XS", "S", "M", "L", "XL"];

const PRODUCTS: Product[] = [
  {
    id: "r1", brand: "ATELIER NOIR", name: "Camel Overcoat", cat: "Пальто", gender: "Женское",
    price: 64000, oldPrice: 79000, img: IMG + "hf_20260523_194017_5051e987-dcc2-4fab-b126-f108897c131b_min.webp",
    tag: "Хит", rating: 4.9, reviews: 86,
    colors: [{ name: "Кэмел", hex: "#B68A5B" }, { name: "Чёрный", hex: "#1C1A17" }, { name: "Серый", hex: "#8B8377" }],
    sizes: ["XS", "S", "M", "L"],
    desc: "Двубортное пальто из плотной итальянской шерсти с лёгким ворсом. Чистая линия плеча, мягкая структура и длина миди — вещь, которая определяет силуэт всего образа.",
    composition: "Шерсть 90%, кашемир 10%", fit: "Свободный",
  },
  {
    id: "r2", brand: "MAISON B", name: "Heritage Trench", cat: "Пальто", gender: "Женское",
    price: 57000, img: beigeTrenchImage, tag: "Хит", rating: 5.0, reviews: 142,
    colors: [{ name: "Бежевый", hex: "#CDB48C" }, { name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["S", "M", "L"],
    desc: "Тренч из водоотталкивающего хлопкового габардина. Классический двубортный крой с поясом — британская школа в современном прочтении.",
    composition: "Хлопковый габардин 100%", fit: "Прямой",
  },
  {
    id: "r3", brand: "NORD ATELIER", name: "Olive Puffer", cat: "Куртки", gender: "Унисекс",
    price: 52900, oldPrice: 67000, img: olivePufferImage, tag: "Хит", rating: 5.0, reviews: 210,
    colors: [{ name: "Оливковый", hex: "#7E8262" }, { name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["XS", "S", "M", "L"],
    desc: "Пуховик в милитари-эстетике с наполнителем 800 Fill Power и нейлоном рипстоп. Тепло до −30 °C без лишнего объёма.",
    composition: "Нейлон, гусиный пух", fit: "Прямой",
  },
  {
    id: "r4", brand: "STUDIO X", name: "Amber Oversized", cat: "Куртки", gender: "Женское",
    price: 25500, oldPrice: 35000, img: orangeOversizedImage, tag: "−27%", rating: 4.9, reviews: 98,
    colors: [{ name: "Янтарный", hex: "#D07A2E" }, { name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["S", "M", "L", "XL"],
    desc: "Эффектная оверсайз-куртка из итальянского полиамида с термосварными швами и скрытыми молниями. Лёгкий утеплитель, выразительный цвет.",
    composition: "Полиамид 100%", fit: "Оверсайз",
  },
  {
    id: "r5", brand: "ATELIER NOIR", name: "Leather Biker", cat: "Куртки", gender: "Унисекс",
    price: 48000, img: IMG + "hf_20260523_194045_36ac36f5-d93b-464d-8ac7-61496a4452f4_min.webp",
    tag: "Новинка", rating: 4.9, reviews: 54,
    colors: [{ name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    desc: "Косуха из мягкой ягнячьей кожи с асимметричной молнией. Минимум фурнитуры, выверенная посадка — вещь на десятилетия.",
    composition: "Натуральная кожа 100%", fit: "Приталенный",
  },
  {
    id: "r6", brand: "DENIM CO.", name: "Indigo Denim Jacket", cat: "Куртки", gender: "Унисекс",
    price: 19900, img: IMG + "hf_20260523_194052_f46b341d-b0d0-49c6-909c-0a52c081f750_min.webp",
    rating: 4.8, reviews: 176,
    colors: [{ name: "Индиго", hex: "#3A4A66" }],
    sizes: ["S", "M", "L", "XL"],
    desc: "Джинсовка структурного кроя из плотного денима с лёгкой стиркой. Универсальная вещь среднего слоя на весь год.",
    composition: "Хлопок 100%", fit: "Прямой",
  },
  {
    id: "r7", brand: "ALPINE", name: "Alpine Parka", cat: "Куртки", gender: "Унисекс",
    price: 43000, img: blueWinterImage, rating: 4.8, reviews: 71,
    colors: [{ name: "Синий", hex: "#3C5A7A" }, { name: "Серый", hex: "#8B8377" }],
    sizes: ["S", "M", "L"],
    desc: "Парка экспедиционного класса с утеплителем Thinsulate и проклеенными швами. Создана для города и снежных маршрутов.",
    composition: "Полиэстер, Thinsulate", fit: "Прямой",
  },
  {
    id: "r8", brand: "STUDIO X", name: "Quilted Gilet", cat: "Куртки", gender: "Унисекс",
    price: 22900, img: IMG + "hf_20260523_194056_f755cd03-d872-4e9d-9985-5b4fbff26d87_min.webp",
    tag: "Новинка", rating: 4.7, reviews: 63,
    colors: [{ name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["S", "M", "L", "XL"],
    desc: "Стёганый жилет с матовой поверхностью — идеальный средний слой. Лёгкий, тёплый, легко складывается в дорогу.",
    composition: "Нейлон, синтетический пух", fit: "Прямой",
  },
  {
    id: "r9", brand: "MAISON P", name: "Rose Down Jacket", cat: "Куртки", gender: "Женское",
    price: 35000, img: pinkClassicImage, rating: 5.0, reviews: 124,
    colors: [{ name: "Розовый", hex: "#D8A0A8" }, { name: "Бежевый", hex: "#CDB48C" }],
    sizes: ["XS", "S", "M", "L"],
    desc: "Куртка в нежной палитре с французским утиным пухом и шёлковой подкладкой. Приталенный силуэт, парижская лёгкость.",
    composition: "Утиный пух 90%", fit: "Приталенный",
  },
  {
    id: "r10", brand: "CARBON STUDIO", name: "Carbon Hoodie", cat: "Худи", gender: "Мужское",
    price: 12900, oldPrice: 15900, img: carbonHoodieImage, tag: "Хит", rating: 5.0, reviews: 264,
    colors: [{ name: "Чёрный", hex: "#1C1A17" }, { name: "Серый", hex: "#8B8377" }, { name: "Бежевый", hex: "#CDB48C" }],
    sizes: ["S", "M", "L", "XL"],
    desc: "Худи свободного кроя из японского органического хлопка 320 г/м² с обработкой enzyme wash. Бархатистая мягкость и плотная структура.",
    composition: "Органический хлопок 100%", fit: "Свободный",
  },
  {
    id: "r11", brand: "URBAN ATELIER", name: "Prism Hoodie", cat: "Худи", gender: "Унисекс",
    price: 13900, oldPrice: 17900, img: colorfulHoodieImage, tag: "−22%", rating: 4.9, reviews: 188,
    colors: [{ name: "Колор-блок", hex: "#C56B3A" }, { name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["S", "M", "L", "XL"],
    desc: "Худи из арт-коллаборации с уличным художником: смелые цветовые блоки на бархатистом французском флисе. Лимитированный тираж.",
    composition: "Хлопок 80%, полиэстер 20%", fit: "Свободный",
  },
  {
    id: "r12", brand: "URBAN ATELIER", name: "Colorblock Hoodie", cat: "Худи", gender: "Мужское",
    price: 13900, img: colorblockHoodieNew, rating: 4.8, reviews: 96,
    colors: [{ name: "Колор-блок", hex: "#6B7280" }, { name: "Синий", hex: "#3C5A7A" }],
    sizes: ["S", "M", "L", "XL"],
    desc: "Графичное худи с контрастными панелями на плотном футере. Уверенная вещь для повседневного образа.",
    composition: "Хлопок 80%, полиэстер 20%", fit: "Свободный",
  },
  {
    id: "r13", brand: "CARBON STUDIO", name: "Noir Hoodie", cat: "Худи", gender: "Унисекс",
    price: 11900, img: blackHoodieImage, tag: "Новинка", rating: 4.9, reviews: 142,
    colors: [{ name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    desc: "Базовое чёрное худи идеальной посадки из тяжёлого футера. Та вещь, которую носишь чаще всего.",
    composition: "Органический хлопок 100%", fit: "Прямой",
  },
  {
    id: "r14", brand: "KNIT HOUSE", name: "Cable Knit Sweater", cat: "Трикотаж", gender: "Унисекс",
    price: 14900, img: IMG + "hf_20260523_194022_41f3f2b9-d5a8-40fb-b2c2-97e7c71b7f48_min.webp",
    tag: "Новинка", rating: 4.9, reviews: 117,
    colors: [{ name: "Овсяный", hex: "#D6CBB2" }, { name: "Серый", hex: "#8B8377" }],
    sizes: ["S", "M", "L", "XL"],
    desc: "Объёмный свитер крупной косой вязки из мягкой шерстяной пряжи. Тёплый, уютный, с характером.",
    composition: "Шерсть 70%, акрил 30%", fit: "Оверсайз",
  },
  {
    id: "r15", brand: "ATELIER NOIR", name: "Wide-Leg Trousers", cat: "Брюки", gender: "Женское",
    price: 16900, img: IMG + "hf_20260523_194048_54e42d77-5198-4967-bd43-bfa0f6625efb_min.webp",
    rating: 4.8, reviews: 88,
    colors: [{ name: "Камень", hex: "#9C9384" }, { name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["XS", "S", "M", "L"],
    desc: "Широкие брюки на высокой посадке с защипами и безупречной стрелкой. Архитектурный силуэт, мягкая ткань.",
    composition: "Вискоза, шерсть", fit: "Свободный",
  },
  {
    id: "r16", brand: "ATELIER NOIR", name: "Noir Bomber", cat: "Куртки", gender: "Мужское",
    price: 31000, img: blackBomberImage, rating: 4.9, reviews: 134,
    colors: [{ name: "Чёрный", hex: "#1C1A17" }, { name: "Синий", hex: "#3C5A7A" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    desc: "Бомбер вневременного силуэта из японского сельвидж-денима с винтажной фурнитурой. Аутентичная классика.",
    composition: "Японский деним 100%", fit: "Прямой",
  },
  {
    id: "r17", brand: "MAISON B", name: "Cashmere Scarf", cat: "Аксессуары", gender: "Унисекс",
    price: 9900, img: IMG + "hf_20260523_194214_bdb01f74-6665-478d-96c0-d4c3e6cf851f_min.webp",
    rating: 5.0, reviews: 203,
    colors: [{ name: "Бежевый", hex: "#CDB48C" }, { name: "Серый", hex: "#8B8377" }],
    sizes: ["ONE"],
    desc: "Объёмный шарф из чистого кашемира — невесомое тепло и благородная фактура. Финальный штрих образа.",
    composition: "Кашемир 100%", fit: "—",
  },
  {
    id: "r18", brand: "MAISON B", name: "Structured Tote", cat: "Аксессуары", gender: "Женское",
    price: 38000, img: IMG + "hf_20260523_194217_4a3f86e7-99ef-4b4a-8b26-f848eed36c1d_min.webp",
    tag: "Хит", rating: 4.9, reviews: 167,
    colors: [{ name: "Тан", hex: "#B68A5B" }, { name: "Чёрный", hex: "#1C1A17" }],
    sizes: ["ONE"],
    desc: "Структурная сумка-тоут из гладкой кожи с архитектурной формой. Вместительная, лаконичная, на каждый день.",
    composition: "Натуральная кожа 100%", fit: "—",
  },
];

const ED = {
  campaign: IMG + "hf_20260523_194221_e5f7e0f3-fda6-43d7-80e1-bb63bfc2e0f9_min.webp",
  still: IMG + "hf_20260523_194225_737e4fda-753a-49e9-b210-bcf8410fe7b0_min.webp",
};

const PAY = [
  { id: "card", label: "Банковская карта" },
  { id: "sbp", label: "СБП" },
  { id: "split", label: "Сплит — 4 платежа" },
];
const DELIVERY = [
  { id: "courier", label: "Курьер", sub: "Завтра, бесплатно от " + 30000, price: 0 },
  { id: "express", label: "Экспресс", sub: "Сегодня, 2–3 часа", price: 690 },
  { id: "pickup", label: "Бутик RADIANCE", sub: "Самовывоз, Патриаршие", price: 0 },
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
const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

const serif = (size: string, weight = 600): React.CSSProperties => ({
  fontFamily: SERIF, fontSize: size, fontWeight: weight, color: INK, lineHeight: 1.08, letterSpacing: "0.005em",
});
const kicker: React.CSSProperties = {
  fontFamily: SANS, fontSize: T.micro, fontWeight: 600, letterSpacing: "0.2em",
  textTransform: "uppercase", color: ACCENT_DEEP,
};

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
    <div className="relative w-full h-full overflow-hidden" style={{ background: SAND }}>
      {!loaded && <div className="rd-shim absolute inset-0" aria-hidden="true" />}
      <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async"
        fetchPriority={priority ? "high" : "auto"} onLoad={() => setLoaded(true)}
        className="w-full h-full" style={{
          objectFit: "cover", display: "block",
          opacity: loaded ? 1 : 0, transition: "opacity .5s ease-out",
        }} />
    </div>
  );
}

/* --- карточка товара --- */
const ProductCard = memo(function ProductCard({ p, fav, onFav, onOpen, idx = 0 }: {
  p: Product; fav: boolean; onFav: () => void; onOpen: () => void; idx?: number;
}) {
  const d = pct(p);
  return (
    <div role="button" tabIndex={0} aria-label={`${p.name}, ${rub(p.price)}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="rd-card cursor-pointer"
      style={{ animation: "rdUp .55s cubic-bezier(.22,1,.36,1) both", animationDelay: `${Math.min(idx, 9) * 0.05}s` }}>
      <div className="relative" style={{ aspectRatio: "3 / 4", borderRadius: 18, overflow: "hidden", background: SAND }}>
        <Img src={p.img} alt={p.name} />
        {p.tag && (
          <span className="absolute" style={{
            top: 12, left: 12, background: p.tag.includes("%") ? ACCENT : PAPER, color: p.tag.includes("%") ? "#FFFFFF" : INK,
            fontFamily: SANS, fontSize: T.micro, fontWeight: 700, letterSpacing: "0.04em",
            padding: "5px 10px", borderRadius: 999,
          }}>{p.tag}</span>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label={fav ? "Убрать из избранного" : "В избранное"} aria-pressed={fav}
          className="absolute flex items-center justify-center rd-press" style={{ top: 4, right: 4, width: 44, height: 44 }}>
          <span className="flex items-center justify-center" style={{ width: 33, height: 33, borderRadius: 999, background: "rgba(255,255,255,0.92)" }}>
            <Heart key={fav ? "1" : "0"} size={15} strokeWidth={2.2} fill={fav ? INK : "none"} color={INK}
              style={fav ? { animation: "rdPop .36s ease-out" } : undefined} />
          </span>
        </button>
      </div>
      <div style={{ marginTop: 11 }}>
        <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{p.brand}</div>
        <div style={{ ...serif("1.2rem", 600), marginTop: 4 }}>{p.name}</div>
        <div className="flex items-baseline" style={{ gap: 7, marginTop: 6 }}>
          <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 700, color: INK, ...NUM }}>{rub(p.price)}</span>
          {p.oldPrice && <span style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(p.oldPrice)}</span>}
        </div>
      </div>
    </div>
  );
});

function SectionHead({ kick, title, onAll }: { kick: string; title: string; onAll?: () => void }) {
  return (
    <div className="flex items-end justify-between" style={{ padding: "0 20px", marginBottom: 15 }}>
      <div>
        <div style={kicker}>{kick}</div>
        <h2 style={{ ...serif(S.s2, 600), marginTop: 7 }}>{title}</h2>
      </div>
      {onAll && (
        <button type="button" onClick={onAll} className="flex items-center rd-press flex-shrink-0"
          style={{ fontFamily: SANS, fontSize: T.sm, color: ACCENT_DEEP, fontWeight: 600, gap: 2, padding: "10px 0 10px 14px", minHeight: 44 }}>
          Все <ChevronRight size={15} strokeWidth={SW} />
        </button>
      )}
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
      <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 600, marginTop: 8, letterSpacing: "0.04em" }}>
        Шаг {active} из 3 · {labels[active - 1]}
      </div>
    </div>
  );
}

/* =================== основной компонент =================== */
function PremiumFashionStore({ activeTab, onTabChange, onCartCount }: Props) {
  const haptic = useHaptic();
  const [selected, setSelected] = useState<Product | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set(["r1", "r5"]));
  const [cart, setCart] = useState<{ id: string; size: string; color: string; qty: number }[]>([
    { id: "r2", size: "M", color: "Бежевый", qty: 1 },
    { id: "r10", size: "L", color: "Чёрный", qty: 1 },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const [showFavs, setShowFavs] = useState(false);
  const [catFilter, setCatFilter] = useState("Все");
  const [genderFilter, setGenderFilter] = useState("Все");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2100);
  }, []);
  const toggleFav = useCallback((id: string) => {
    haptic.light();
    setFavs((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, [haptic]);
  const addToCart = useCallback((id: string, size: string, color: string, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === id && i.size === size && i.color === color);
      if (ex) return c.map((i) => (i === ex ? { ...i, qty: i.qty + qty } : i));
      return [...c, { id, size, color, qty }];
    });
    fire("Добавлено в корзину");
    haptic.success();
  }, [fire, haptic]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  useEffect(() => { onCartCount?.(cartCount); }, [cartCount, onCartCount]);
  const favProducts = PRODUCTS.filter((p) => favs.has(p.id));
  const goCat = (c: string) => { setCatFilter(c); setGenderFilter("Все"); onTabChange("catalog"); };

  const tgUser: any = (() => { try { return (window as any).Telegram?.WebApp?.initDataUnsafe?.user || null; } catch { return null; } })();
  const userName = String(tgUser?.first_name || tgUser?.username || "Алиса");

  const fresh = PRODUCTS.filter((p) => p.tag === "Новинка").concat(PRODUCTS.filter((p) => p.tag !== "Новинка")).slice(0, 8);
  const bestsellers = PRODUCTS.filter((p) => p.tag === "Хит" || p.rating >= 4.9).slice(0, 8);

  /* --------------- ГЛАВНАЯ --------------- */
  const Home = (
    <div className="min-h-full" style={{ background: CANVAS, paddingBottom: 34 }}>
      <h1 className="rd-sr">RADIANCE — премиальный fashion-бутик</h1>
      <header className="flex items-center justify-between" style={{ padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px" }}>
        <div style={{ fontFamily: SERIF, fontSize: "1.7rem", fontWeight: 700, color: INK, letterSpacing: "0.02em" }}>Radiance</div>
        <div className="flex items-center" style={{ gap: 2 }}>
          <button type="button" onClick={() => onTabChange("catalog")} aria-label="Поиск"
            className="flex items-center justify-center rd-press" style={{ width: 44, height: 44 }}>
            <Search size={IC.md} color={INK} strokeWidth={SW} />
          </button>
          <button type="button" onClick={() => setShowFavs(true)} aria-label="Избранное"
            className="relative flex items-center justify-center rd-press" style={{ width: 44, height: 44, marginRight: -8 }}>
            <Heart size={IC.md} color={INK} strokeWidth={SW} />
            {favs.size > 0 && <span className="absolute" style={{ top: 9, right: 9, width: 6, height: 6, borderRadius: 999, background: ACCENT }} />}
          </button>
        </div>
      </header>

      {/* видео-герой */}
      <div style={{ padding: "2px 16px 0" }}>
        <div className="relative" style={{ borderRadius: 26, overflow: "hidden", height: 486 }}>
          <video src={fashionVideo} autoPlay muted loop playsInline aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="absolute inset-0" aria-hidden="true"
            style={{ background: "linear-gradient(180deg, rgba(20,18,15,0.36) 0%, rgba(20,18,15,0.04) 32%, rgba(20,18,15,0.84) 100%)" }} />
          <div className="absolute" style={{ left: 22, right: 22, top: 24 }}>
            <span style={{ ...kicker, color: "rgba(255,255,255,0.92)" }}>Коллекция FW26</span>
          </div>
          <div className="absolute" style={{ left: 22, right: 22, bottom: 24 }}>
            <h2 style={{ fontFamily: SERIF, fontSize: S.s4, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.0, letterSpacing: "0.01em" }}>
              Новый сезон.<br />Новый силуэт.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: T.sm, color: "rgba(255,255,255,0.86)", lineHeight: 1.5, marginTop: 12, maxWidth: 290 }}>
              Кураторская коллекция верхней одежды и трикотажа от ателье, которым доверяют.
            </p>
            <button type="button" onClick={() => onTabChange("catalog")}
              className="flex items-center justify-center rd-press"
              style={{ marginTop: 18, height: 50, padding: "0 26px", borderRadius: 999, background: PAPER, gap: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: INK }}>Смотреть коллекцию</span>
              <ChevronRight size={16} color={INK} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      {/* ценности */}
      <div className="flex" style={{ gap: 8, padding: "16px 16px 0" }}>
        {[
          { ic: <Truck size={15} color={ACCENT_DEEP} strokeWidth={SW} />, t: "Доставка завтра" },
          { ic: <RotateCcw size={15} color={ACCENT_DEEP} strokeWidth={SW} />, t: "Возврат 30 дней" },
          { ic: <ShieldCheck size={15} color={ACCENT_DEEP} strokeWidth={SW} />, t: "Только оригинал" },
        ].map((v) => (
          <div key={v.t} className="flex items-center justify-center" style={{ flex: 1, gap: 6, background: PAPER, borderRadius: 13, padding: "11px 6px" }}>
            {v.ic}
            <span style={{ fontFamily: SANS, fontSize: T.micro, fontWeight: 600, color: SUB }}>{v.t}</span>
          </div>
        ))}
      </div>

      {/* новинки */}
      <div style={{ marginTop: 32 }}>
        <SectionHead kick="Только привезли" title="Новые поступления" onAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide rd-strip">
          <div className="flex" style={{ gap: 14, padding: "0 20px 4px", width: "max-content" }}>
            {fresh.map((p, i) => (
              <div key={p.id} style={{ width: 212, flexShrink: 0 }}>
                <ProductCard p={p} idx={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => setSelected(p)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* редакционный баннер */}
      <button type="button" onClick={() => onTabChange("catalog")}
        className="relative block w-full text-left rd-press"
        style={{ margin: "34px 16px 0", width: "calc(100% - 32px)", height: 420, borderRadius: 26, overflow: "hidden" }}>
        <Img src={ED.campaign} alt="Кампания Radiance FW26" />
        <div className="absolute inset-0" aria-hidden="true"
          style={{ background: "linear-gradient(180deg, rgba(20,18,15,0.08) 36%, rgba(20,18,15,0.82) 100%)" }} />
        <div className="absolute" style={{ left: 24, right: 24, bottom: 24 }}>
          <span style={{ ...kicker, color: "rgba(255,255,255,0.92)" }}>Кампания сезона</span>
          <div style={{ fontFamily: SERIF, fontSize: S.s3, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.04, marginTop: 8 }}>
            Тепло, которое<br />хочется носить
          </div>
          <span className="inline-flex items-center" style={{
            marginTop: 14, height: 42, padding: "0 20px", borderRadius: 999, background: PAPER, gap: 7,
            fontFamily: SANS, fontSize: T.sm, fontWeight: 600, color: INK,
          }}>Открыть лукбук <ChevronRight size={14} strokeWidth={2.4} /></span>
        </div>
      </button>

      {/* категории */}
      <div style={{ marginTop: 34 }}>
        <SectionHead kick="Гардероб" title="Категории" onAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide rd-strip">
          <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
            {CATEGORIES.map((c, i) => {
              const n = PRODUCTS.filter((p) => p.cat === c).length;
              const cover = PRODUCTS.find((p) => p.cat === c)!.img;
              return (
                <button type="button" key={c} onClick={() => goCat(c)}
                  className="flex-shrink-0 text-left rd-press"
                  style={{ width: 130, animation: "rdUp .5s cubic-bezier(.22,1,.36,1) both", animationDelay: `${i * 0.05}s` }}>
                  <div className="relative" style={{ width: 130, height: 168, borderRadius: 18, overflow: "hidden" }}>
                    <Img src={cover} alt={c} />
                    <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(180deg, rgba(20,18,15,0) 52%, rgba(20,18,15,0.4) 100%)" }} />
                  </div>
                  <div style={{ ...serif("1.2rem", 600), marginTop: 9 }}>{c}</div>
                  <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, marginTop: 1 }}>{n} {plural(n, ["модель", "модели", "моделей"])}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* бестселлеры */}
      <div style={{ marginTop: 34 }}>
        <SectionHead kick="Выбор сезона" title="Бестселлеры" onAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide rd-strip">
          <div className="flex" style={{ gap: 14, padding: "0 20px 4px", width: "max-content" }}>
            {bestsellers.map((p, i) => (
              <div key={p.id} style={{ width: 212, flexShrink: 0 }}>
                <ProductCard p={p} idx={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => setSelected(p)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* атмосфера */}
      <button type="button" onClick={() => onTabChange("catalog")}
        className="relative block w-full text-left rd-press"
        style={{ margin: "34px 16px 0", width: "calc(100% - 32px)", height: 230, borderRadius: 24, overflow: "hidden" }}>
        <Img src={ED.still} alt="Атмосфера Radiance" />
        <div className="absolute inset-0" aria-hidden="true"
          style={{ background: "linear-gradient(110deg, rgba(20,18,15,0.74) 6%, rgba(20,18,15,0.12) 72%)" }} />
        <div className="absolute" style={{ left: 22, right: 22, top: 22 }}>
          <span style={{ ...kicker, color: "rgba(255,255,255,0.9)" }}>Philosophy</span>
          <div style={{ fontFamily: SERIF, fontSize: S.s2, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.06, marginTop: 8 }}>
            Меньше вещей —<br />больше смысла
          </div>
          <p style={{ fontFamily: SANS, fontSize: T.sm, color: "rgba(255,255,255,0.84)", lineHeight: 1.5, marginTop: 8, maxWidth: 250 }}>
            Каждая вещь Radiance создана служить годами, а не один сезон.
          </p>
        </div>
      </button>

      {/* бренд-футер */}
      <div style={{ padding: "30px 20px 0", textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: "2.4rem", fontWeight: 700, color: INK, letterSpacing: "0.02em" }}>Radiance</div>
        <p style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED, marginTop: 6, lineHeight: 1.55 }}>
          Бутик премиальной одежды · Москва, Большая Никитская 12<br />Ежедневно 10:00 — 22:00
        </p>
      </div>
    </div>
  );

  /* --------------- доп. состояние --------------- */
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"cart" | "checkout" | "done">("cart");
  const [delivery, setDelivery] = useState("courier");
  const [pay, setPay] = useState("card");
  const [promoText, setPromoText] = useState("");
  const [promoOn, setPromoOn] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [lastOrder, setLastOrder] = useState<{ no: string; total: number } | null>(null);

  const cartItems = cart.map((i) => ({ ...i, p: byId(i.id) }));
  const subtotal = cartItems.reduce((s, i) => s + i.p.price * i.qty, 0);
  const oldSum = cartItems.reduce((s, i) => s + (i.p.oldPrice || i.p.price) * i.qty, 0);
  const itemSavings = oldSum - subtotal;
  const promoDisc = promoOn ? Math.round(subtotal * 0.1) : 0;
  const deliveryObj = DELIVERY.find((d) => d.id === delivery)!;
  const freeShip = subtotal >= FREE_SHIP;
  const shipCost = delivery === "courier" ? (freeShip ? 0 : 390) : deliveryObj.price;
  const total = Math.max(0, subtotal - promoDisc) + (cartItems.length ? shipCost : 0);
  const shipLeft = Math.max(0, FREE_SHIP - subtotal);
  const shipProgress = Math.min(1, subtotal / FREE_SHIP);

  const setQty = useCallback((it: { id: string; size: string; color: string }, delta: number) => {
    haptic.light();
    setCart((c) => c.flatMap((i) => {
      if (i.id === it.id && i.size === it.size && i.color === it.color) {
        const q = i.qty + delta;
        return q <= 0 ? [] : [{ ...i, qty: q }];
      }
      return [i];
    }));
  }, [haptic]);
  const removeItem = useCallback((it: { id: string; size: string; color: string }) => {
    haptic.medium();
    setCart((c) => c.filter((i) => !(i.id === it.id && i.size === it.size && i.color === it.color)));
    fire("Удалено из корзины");
  }, [haptic, fire]);
  const applyPromo = useCallback(() => {
    if (promoText.trim().toUpperCase() === "RADIANCE10") {
      setPromoOn(true); haptic.success(); fire("Промокод применён · −10%");
    } else {
      setPromoOn(false); haptic.error(); fire("Промокод не найден");
    }
  }, [promoText, haptic, fire]);
  const placeOrder = useCallback(() => {
    setPlacing(true); haptic.heavy();
    setTimeout(() => {
      setPlacing(false);
      setLastOrder({ no: "RD-" + Math.floor(100000 + Math.random() * 899999), total });
      setStage("done");
      haptic.success();
    }, 1700);
  }, [haptic, total]);

  /* --------------- КАТАЛОГ --------------- */
  const q = query.trim().toLowerCase();
  const catalogAll = PRODUCTS.filter((p) => {
    const gOk = genderFilter === "Все" || p.gender === genderFilter ||
      (genderFilter !== "Унисекс" && p.gender === "Унисекс");
    const cOk = catFilter === "Все" || p.cat === catFilter;
    const sOk = !q || (p.name + " " + p.brand + " " + p.cat).toLowerCase().includes(q);
    return gOk && cOk && sOk;
  });
  const featured = catalogAll[0];
  const restList = catalogAll.slice(1);

  const Pill = ({ on, children, onClick, solid }: { on: boolean; children: React.ReactNode; onClick: () => void; solid?: boolean }) => (
    <button type="button" onClick={onClick} className="rd-press flex-shrink-0" style={{
      height: solid ? 38 : 34, padding: solid ? "0 16px" : "0 14px", borderRadius: 999,
      background: solid ? (on ? INK : PAPER) : "transparent",
      border: solid ? "none" : `1px solid ${on ? INK : LINE}`,
      color: solid ? (on ? PAPER : SUB) : (on ? INK : MUTED),
      fontFamily: SANS, fontSize: solid ? T.sm : T.cap, fontWeight: 600,
      transition: "background .2s, border-color .2s, color .2s",
    }}>{children}</button>
  );

  const Catalog = (
    <div className="min-h-full" style={{ background: CANVAS, paddingBottom: 36 }}>
      <header style={{ padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 4px" }}>
        <div style={kicker}>Бутик Radiance</div>
        <h1 style={{ ...serif(S.s2, 600), marginTop: 7 }}>Каталог</h1>
      </header>

      <div style={{ padding: "12px 16px 0" }}>
        <div className="flex items-center" style={{ gap: 10, background: PAPER, borderRadius: 14, padding: "0 14px", height: 50 }}>
          <Search size={IC.sm} color={MUTED} strokeWidth={SW} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск по бутику"
            aria-label="Поиск по каталогу"
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: SANS, fontSize: T.body, color: INK }} />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск"
              className="rd-press flex items-center justify-center" style={{ width: 30, height: 30 }}>
              <X size={15} color={MUTED} strokeWidth={SW} />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide" style={{ marginTop: 12 }}>
        <div className="flex" style={{ gap: 8, padding: "0 16px", width: "max-content" }}>
          {GENDERS.map((g) => (
            <Pill key={g} solid on={genderFilter === g} onClick={() => { setGenderFilter(g); haptic.light(); }}>{g}</Pill>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide" style={{ marginTop: 9 }}>
        <div className="flex" style={{ gap: 8, padding: "0 16px", width: "max-content" }}>
          {["Все", ...CATEGORIES].map((c) => (
            <Pill key={c} on={catFilter === c} onClick={() => { setCatFilter(c); haptic.light(); }}>{c}</Pill>
          ))}
        </div>
      </div>

      {catalogAll.length === 0 ? (
        <div style={{ padding: "64px 40px", textAlign: "center" }}>
          <div className="flex items-center justify-center" style={{ width: 66, height: 66, borderRadius: 999, background: TINT, margin: "0 auto" }}>
            <Search size={26} color={MUTED} strokeWidth={SW} />
          </div>
          <div style={{ ...serif("1.5rem", 600), marginTop: 16 }}>Ничего не найдено</div>
          <p style={{ fontFamily: SANS, fontSize: T.sm, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
            Попробуйте изменить фильтры<br />или поисковый запрос
          </p>
          <button type="button" onClick={() => { setQuery(""); setCatFilter("Все"); setGenderFilter("Все"); haptic.light(); }}
            className="rd-press" style={{ marginTop: 20, height: 46, padding: "0 24px", borderRadius: 999, background: INK, color: PAPER, fontFamily: SANS, fontSize: T.sm, fontWeight: 600 }}>
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED, padding: "18px 20px 0", fontWeight: 600, letterSpacing: "0.02em" }}>
            {catalogAll.length} {plural(catalogAll.length, ["вещь", "вещи", "вещей"])} в подборке
          </div>

          <button type="button" onClick={() => setSelected(featured)}
            className="relative block text-left rd-press"
            style={{ margin: "12px 16px 0", width: "calc(100% - 32px)", height: 366, borderRadius: 24, overflow: "hidden" }}>
            <Img src={featured.img} alt={featured.name} priority />
            <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(180deg, rgba(20,18,15,0) 38%, rgba(20,18,15,0.82) 100%)" }} />
            <span className="absolute" style={{ top: 16, left: 16, ...kicker, color: "rgba(255,255,255,0.92)" }}>Образ недели</span>
            <div className="absolute" style={{ left: 20, right: 20, bottom: 20 }}>
              <div style={{ fontFamily: SANS, fontSize: T.micro, color: "rgba(255,255,255,0.78)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{featured.brand}</div>
              <div style={{ fontFamily: SERIF, fontSize: S.s2, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.06, marginTop: 5 }}>{featured.name}</div>
              <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
                <span style={{ fontFamily: SANS, fontSize: T.lg, fontWeight: 700, color: "#FFFFFF", ...NUM }}>{rub(featured.price)}</span>
                <span className="inline-flex items-center" style={{ height: 40, padding: "0 18px", borderRadius: 999, background: PAPER, gap: 6, fontFamily: SANS, fontSize: T.sm, fontWeight: 600, color: INK }}>
                  Подробнее <ChevronRight size={14} strokeWidth={2.4} />
                </span>
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2" style={{ gap: 14, padding: "18px 16px 0" }}>
            {restList.map((p, i) => (
              <ProductCard key={p.id} p={p} idx={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)} onOpen={() => setSelected(p)} />
            ))}
          </div>
        </>
      )}
    </div>
  );

  /* --------------- КОРЗИНА --------------- */
  const Cart = (
    <div className="min-h-full" style={{ background: CANVAS, paddingBottom: 200 }}>
      <header style={{ padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 6px" }}>
        <div style={kicker}>{stage === "done" ? "Спасибо за заказ" : "Ваш выбор"}</div>
        <h1 style={{ ...serif(S.s2, 600), marginTop: 7 }}>
          {stage === "cart" ? "Корзина" : stage === "checkout" ? "Оформление" : "Заказ принят"}
        </h1>
      </header>

      {cartItems.length > 0 && stage !== "done" && <Steps active={stage === "cart" ? 1 : 2} />}

      {/* ----- пустая корзина ----- */}
      {cartItems.length === 0 && stage !== "done" && (
        <div style={{ padding: "60px 40px", textAlign: "center" }}>
          <div className="flex items-center justify-center" style={{ width: 76, height: 76, borderRadius: 999, background: TINT, margin: "0 auto" }}>
            <ShoppingBag size={30} color={MUTED} strokeWidth={SW} />
          </div>
          <div style={{ ...serif("1.6rem", 600), marginTop: 18 }}>В корзине пока пусто</div>
          <p style={{ fontFamily: SANS, fontSize: T.sm, color: MUTED, marginTop: 7, lineHeight: 1.55 }}>
            Загляните в каталог — там новая<br />коллекция верхней одежды FW26
          </p>
          <button type="button" onClick={() => onTabChange("catalog")}
            className="rd-press" style={{ marginTop: 22, height: 50, padding: "0 28px", borderRadius: 999, background: INK, color: PAPER, fontFamily: SANS, fontSize: T.body, fontWeight: 600 }}>
            Перейти в каталог
          </button>
        </div>
      )}

      {/* ----- шаг 1: товары ----- */}
      {cartItems.length > 0 && stage === "cart" && (
        <div style={{ padding: "4px 16px 0" }}>
          {/* прогресс бесплатной доставки */}
          <div style={{ background: PAPER, borderRadius: 16, padding: "13px 15px", marginBottom: 12 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <Truck size={15} color={ACCENT_DEEP} strokeWidth={SW} />
              <span style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, fontWeight: 600 }}>
                {freeShip ? "Бесплатная доставка курьером — ваш заказ проходит" : `До бесплатной доставки — ${rub(shipLeft)}`}
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 999, background: TINT, marginTop: 9, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${shipProgress * 100}%`, background: freeShip ? "#5C7A52" : ACCENT, borderRadius: 999, transition: "width .4s ease-out" }} />
            </div>
          </div>

          {cartItems.map((it) => (
            <div key={it.id + it.size + it.color} className="flex" style={{ gap: 12, background: PAPER, borderRadius: 18, padding: 11, marginBottom: 10 }}>
              <button type="button" onClick={() => setSelected(it.p)} aria-label={`Открыть ${it.p.name}`}
                style={{ width: 86, height: 112, borderRadius: 13, overflow: "hidden", flexShrink: 0 }}>
                <Img src={it.p.img} alt={it.p.name} />
              </button>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="flex items-start justify-between" style={{ gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{it.p.brand}</div>
                    <div style={{ ...serif("1.12rem", 600), marginTop: 3 }}>{it.p.name}</div>
                  </div>
                  <button type="button" onClick={() => removeItem(it)} aria-label="Удалить"
                    className="rd-press flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, marginTop: -4, marginRight: -2 }}>
                    <X size={16} color={MUTED} strokeWidth={SW} />
                  </button>
                </div>
                <div style={{ fontFamily: SANS, fontSize: T.micro, color: SUB, marginTop: 4 }}>
                  Размер {it.size} · {it.color}
                </div>
                <div className="flex items-center justify-between" style={{ marginTop: 9 }}>
                  <div className="flex items-center" style={{ gap: 2, background: CANVAS, borderRadius: 999, padding: 3 }}>
                    <button type="button" onClick={() => setQty(it, -1)} aria-label="Меньше"
                      className="rd-press flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 999, background: PAPER }}>
                      <Minus size={13} color={INK} strokeWidth={2.4} />
                    </button>
                    <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 700, color: INK, minWidth: 22, textAlign: "center", ...NUM }}>{it.qty}</span>
                    <button type="button" onClick={() => setQty(it, 1)} aria-label="Больше"
                      className="rd-press flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 999, background: PAPER }}>
                      <Plus size={13} color={INK} strokeWidth={2.4} />
                    </button>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 700, color: INK, ...NUM }}>{rub(it.p.price * it.qty)}</div>
                    {it.p.oldPrice && <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(it.p.oldPrice * it.qty)}</div>}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* промокод */}
          <div style={{ background: PAPER, borderRadius: 16, padding: 12, marginTop: 2 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <Tag size={15} color={ACCENT_DEEP} strokeWidth={SW} />
              <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 600, color: SUB }}>Промокод</span>
              <span style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, marginLeft: "auto" }}>попробуйте RADIANCE10</span>
            </div>
            <div className="flex" style={{ gap: 8, marginTop: 10 }}>
              <input value={promoText} onChange={(e) => setPromoText(e.target.value)} placeholder="Введите код"
                aria-label="Промокод" style={{
                  flex: 1, minWidth: 0, height: 44, borderRadius: 11, border: `1px solid ${LINE}`, background: CANVAS,
                  padding: "0 13px", fontFamily: SANS, fontSize: T.sm, color: INK, outline: "none",
                }} />
              <button type="button" onClick={applyPromo} className="rd-press" style={{
                height: 44, padding: "0 18px", borderRadius: 11, background: INK, color: PAPER,
                fontFamily: SANS, fontSize: T.sm, fontWeight: 600,
              }}>Применить</button>
            </div>
            {promoOn && (
              <div className="flex items-center" style={{ gap: 6, marginTop: 9 }}>
                <Check size={13} color="#5C7A52" strokeWidth={3} />
                <span style={{ fontFamily: SANS, fontSize: T.micro, color: "#5C7A52", fontWeight: 600 }}>RADIANCE10 активен — скидка 10%</span>
              </div>
            )}
          </div>

          {/* итоги */}
          <div style={{ background: PAPER, borderRadius: 16, padding: "15px 16px", marginTop: 12 }}>
            {[
              ["Товары", rub(subtotal)],
              ...(itemSavings > 0 ? [["Ваша выгода", "−" + rub(itemSavings)] as [string, string]] : []),
              ...(promoDisc > 0 ? [["Промокод RADIANCE10", "−" + rub(promoDisc)] as [string, string]] : []),
              ["Доставка", freeShip || shipCost === 0 ? "Бесплатно" : rub(shipCost)],
            ].map(([k, v]) => {
              const good = String(v).startsWith("−") || v === "Бесплатно";
              return (
                <div key={k} className="flex items-center justify-between" style={{ marginBottom: 9 }}>
                  <span style={{ fontFamily: SANS, fontSize: T.sm, color: SUB }}>{k}</span>
                  <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 600, color: good ? "#5C7A52" : INK, ...NUM }}>{v}</span>
                </div>
              );
            })}
            <div style={{ height: 1, background: HAIR, margin: "4px 0 11px" }} />
            <div className="flex items-baseline justify-between">
              <span style={{ ...serif("1.3rem", 600) }}>Итого</span>
              <span style={{ fontFamily: SANS, fontSize: T.lg, fontWeight: 800, color: INK, ...NUM }}>{rub(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ----- шаг 2: оформление ----- */}
      {cartItems.length > 0 && stage === "checkout" && (
        <div style={{ padding: "4px 16px 0" }}>
          <button type="button" onClick={() => { setStage("cart"); haptic.light(); }}
            className="flex items-center rd-press" style={{ gap: 5, fontFamily: SANS, fontSize: T.sm, color: SUB, fontWeight: 600, minHeight: 40 }}>
            <ArrowLeft size={15} strokeWidth={SW} /> Назад к корзине
          </button>

          <div style={{ background: PAPER, borderRadius: 16, padding: "14px 16px", marginTop: 4 }}>
            <div style={kicker}>Получатель</div>
            <div style={{ ...serif("1.18rem", 600), marginTop: 8 }}>{userName}</div>
            <div style={{ fontFamily: SANS, fontSize: T.sm, color: SUB, marginTop: 3 }}>+7 ··· ·· 42 · Москва</div>
          </div>

          <div style={{ marginTop: 14, marginBottom: 9, ...kicker }}>Способ доставки</div>
          {DELIVERY.map((d) => {
            const on = delivery === d.id;
            return (
              <button type="button" key={d.id} onClick={() => { setDelivery(d.id); haptic.light(); }}
                className="flex items-center w-full text-left rd-press" style={{
                  gap: 12, background: PAPER, borderRadius: 14, padding: "13px 14px", marginBottom: 8,
                  border: `1.5px solid ${on ? INK : "transparent"}`, transition: "border-color .2s",
                }}>
                <span className="flex items-center justify-center flex-shrink-0" style={{
                  width: 21, height: 21, borderRadius: 999, border: `2px solid ${on ? INK : LINE}`,
                }}>{on && <span style={{ width: 9, height: 9, borderRadius: 999, background: INK }} />}</span>
                <span className="flex-1" style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: INK }}>{d.label}</span>
                  <span style={{ display: "block", fontFamily: SANS, fontSize: T.micro, color: MUTED, marginTop: 2 }}>{d.sub}</span>
                </span>
                <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 700, color: d.id === "courier" && freeShip ? "#5C7A52" : INK, ...NUM }}>
                  {d.id === "courier" ? (freeShip ? "Бесплатно" : rub(390)) : d.price === 0 ? "Бесплатно" : rub(d.price)}
                </span>
              </button>
            );
          })}

          <div style={{ marginTop: 14, marginBottom: 9, ...kicker }}>Оплата</div>
          {PAY.map((m) => {
            const on = pay === m.id;
            return (
              <button type="button" key={m.id} onClick={() => { setPay(m.id); haptic.light(); }}
                className="flex items-center w-full text-left rd-press" style={{
                  gap: 12, background: PAPER, borderRadius: 14, padding: "13px 14px", marginBottom: 8,
                  border: `1.5px solid ${on ? INK : "transparent"}`, transition: "border-color .2s",
                }}>
                <span className="flex items-center justify-center flex-shrink-0" style={{
                  width: 21, height: 21, borderRadius: 999, border: `2px solid ${on ? INK : LINE}`,
                }}>{on && <span style={{ width: 9, height: 9, borderRadius: 999, background: INK }} />}</span>
                <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: INK }}>{m.label}</span>
              </button>
            );
          })}

          <div style={{ background: PAPER, borderRadius: 16, padding: "15px 16px", marginTop: 14 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
              <span style={{ fontFamily: SANS, fontSize: T.sm, color: SUB }}>Товары · {cartCount} шт.</span>
              <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 600, color: INK, ...NUM }}>{rub(subtotal)}</span>
            </div>
            {promoDisc > 0 && (
              <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
                <span style={{ fontFamily: SANS, fontSize: T.sm, color: SUB }}>Промокод</span>
                <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 600, color: "#5C7A52", ...NUM }}>−{rub(promoDisc)}</span>
              </div>
            )}
            <div className="flex items-center justify-between" style={{ marginBottom: 11 }}>
              <span style={{ fontFamily: SANS, fontSize: T.sm, color: SUB }}>Доставка</span>
              <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 600, color: shipCost === 0 ? "#5C7A52" : INK, ...NUM }}>{shipCost === 0 ? "Бесплатно" : rub(shipCost)}</span>
            </div>
            <div style={{ height: 1, background: HAIR, margin: "0 0 11px" }} />
            <div className="flex items-baseline justify-between">
              <span style={{ ...serif("1.3rem", 600) }}>К оплате</span>
              <span style={{ fontFamily: SANS, fontSize: T.lg, fontWeight: 800, color: INK, ...NUM }}>{rub(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ----- шаг 3: успех ----- */}
      {stage === "done" && (
        <div style={{ padding: "30px 24px 0", textAlign: "center" }}>
          <div className="flex items-center justify-center" style={{ width: 88, height: 88, borderRadius: 999, background: INK, margin: "0 auto", animation: "rdPop .5s cubic-bezier(.22,1,.36,1)" }}>
            <Check size={40} color={PAPER} strokeWidth={2.6} />
          </div>
          <div style={{ ...serif(S.s2, 700), marginTop: 20 }}>Заказ оформлен</div>
          <p style={{ fontFamily: SANS, fontSize: T.body, color: SUB, marginTop: 8, lineHeight: 1.55 }}>
            Спасибо, {userName}. Мы передали заказ<br />в работу — стилист бутика свяжется<br />с вами для подтверждения.
          </p>
          <div style={{ background: PAPER, borderRadius: 18, padding: "18px 20px", marginTop: 22, textAlign: "left" }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: SANS, fontSize: T.sm, color: MUTED }}>Номер заказа</span>
              <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 700, color: INK, ...NUM }}>{lastOrder?.no}</span>
            </div>
            <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
              <span style={{ fontFamily: SANS, fontSize: T.sm, color: MUTED }}>Сумма</span>
              <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 700, color: INK, ...NUM }}>{rub(lastOrder?.total || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontFamily: SANS, fontSize: T.sm, color: MUTED }}>Доставка</span>
              <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 700, color: INK }}>{deliveryObj.label} · завтра</span>
            </div>
          </div>
          <button type="button" onClick={() => { setCart([]); setStage("cart"); setPromoOn(false); setPromoText(""); onTabChange("home"); }}
            className="rd-press" style={{ marginTop: 22, height: 52, width: "100%", borderRadius: 999, background: INK, color: PAPER, fontFamily: SANS, fontSize: T.body, fontWeight: 600 }}>
            Вернуться на главную
          </button>
        </div>
      )}

    </div>
  );

  /* --------------- ПРОФИЛЬ --------------- */
  const photo = tgUser?.photo_url as string | undefined;
  const initials = userName.slice(0, 1).toUpperCase();
  const clubSpent = 64200;
  const clubGoal = 100000;
  const orders = [
    { no: "RD-840271", date: "12 мая", items: "Heritage Trench, Cashmere Scarf", sum: 66900, status: "Доставлен" },
    { no: "RD-815640", date: "28 апр", items: "Carbon Hoodie ×2", sum: 25800, status: "Доставлен" },
  ];
  const menu = [
    { ic: <ShoppingBag size={17} color={INK} strokeWidth={SW} />, t: "Мои заказы", s: "2 завершённых", go: () => onTabChange("cart") },
    { ic: <Heart size={17} color={INK} strokeWidth={SW} />, t: "Избранное", s: `${favs.size} ${plural(favs.size, ["вещь", "вещи", "вещей"])}`, go: () => setShowFavs(true) },
    { ic: <Truck size={17} color={INK} strokeWidth={SW} />, t: "Адреса доставки", s: "Москва, по умолчанию", go: () => fire("Раздел в разработке") },
    { ic: <Tag size={17} color={INK} strokeWidth={SW} />, t: "Способы оплаты", s: "Карта ·· 42", go: () => fire("Раздел в разработке") },
    { ic: <ShieldCheck size={17} color={INK} strokeWidth={SW} />, t: "Помощь и поддержка", s: "Стилист на связи 10–22", go: () => fire("Стилист скоро ответит") },
  ];

  const Profile = (
    <div className="min-h-full" style={{ background: CANVAS, paddingBottom: 36 }}>
      <header style={{ padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 4px" }}>
        <div style={kicker}>Личный кабинет</div>
        <h1 style={{ ...serif(S.s2, 600), marginTop: 7 }}>Профиль</h1>
      </header>

      {/* карточка пользователя */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ background: PAPER, borderRadius: 22, padding: 18 }}>
          <div className="flex items-center" style={{ gap: 14 }}>
            <div className="flex items-center justify-center flex-shrink-0" style={{
              width: 62, height: 62, borderRadius: 999, overflow: "hidden",
              background: INK, color: PAPER, fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 700,
            }}>
              {photo ? <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ ...serif("1.5rem", 600) }}>{userName}</div>
              <div className="flex items-center" style={{ gap: 5, marginTop: 4 }}>
                <Star size={12} color={ACCENT} fill={ACCENT} strokeWidth={0} />
                <span style={{ fontFamily: SANS, fontSize: T.cap, color: ACCENT_DEEP, fontWeight: 700, letterSpacing: "0.04em" }}>КЛУБ RADIANCE · GOLD</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 7 }}>
              <span style={{ fontFamily: SANS, fontSize: T.micro, color: SUB, fontWeight: 600 }}>До статуса Platinum</span>
              <span style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, ...NUM }}>{rub(clubSpent)} / {rub(clubGoal)}</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: TINT, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(clubSpent / clubGoal) * 100}%`, background: ACCENT, borderRadius: 999 }} />
            </div>
          </div>
        </div>
      </div>

      {/* статистика */}
      <div className="flex" style={{ gap: 8, padding: "10px 16px 0" }}>
        {[
          { n: "12", t: "заказов" },
          { n: String(favs.size), t: "в избранном" },
          { n: "4 200", t: "бонусов" },
        ].map((x) => (
          <div key={x.t} style={{ flex: 1, background: PAPER, borderRadius: 15, padding: "14px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: SERIF, fontSize: "1.7rem", fontWeight: 700, color: INK, ...NUM }}>{x.n}</div>
            <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, marginTop: 2 }}>{x.t}</div>
          </div>
        ))}
      </div>

      {/* меню */}
      <div style={{ padding: "18px 16px 0" }}>
        <div style={{ background: PAPER, borderRadius: 18, overflow: "hidden" }}>
          {menu.map((m, i) => (
            <button type="button" key={m.t} onClick={() => { haptic.light(); m.go(); }}
              className="flex items-center w-full text-left rd-press" style={{
                gap: 13, padding: "14px 16px", borderTop: i ? `1px solid ${HAIR}` : "none",
              }}>
              <span className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 11, background: CANVAS }}>{m.ic}</span>
              <span className="flex-1" style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: INK }}>{m.t}</span>
                <span style={{ display: "block", fontFamily: SANS, fontSize: T.micro, color: MUTED, marginTop: 1 }}>{m.s}</span>
              </span>
              <ChevronRight size={17} color={MUTED} strokeWidth={SW} />
            </button>
          ))}
        </div>
      </div>

      {/* история заказов */}
      <div style={{ padding: "22px 0 0" }}>
        <SectionHead kick="История" title="Последние заказы" />
        <div style={{ padding: "0 16px" }}>
          {orders.map((o) => (
            <div key={o.no} style={{ background: PAPER, borderRadius: 16, padding: "13px 15px", marginBottom: 10 }}>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 700, color: INK, ...NUM }}>{o.no}</span>
                <span className="flex items-center" style={{ gap: 5, fontFamily: SANS, fontSize: T.micro, color: "#5C7A52", fontWeight: 600 }}>
                  <Check size={12} strokeWidth={3} /> {o.status}
                </span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: T.sm, color: SUB, marginTop: 6, lineHeight: 1.4 }}>{o.items}</div>
              <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                <span style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED }}>{o.date} · доставлен курьером</span>
                <span style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 700, color: INK, ...NUM }}>{rub(o.sum)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* стилист */}
      <div style={{ padding: "8px 16px 0" }}>
        <div className="relative" style={{ borderRadius: 20, overflow: "hidden", padding: "20px 18px", background: INK }}>
          <div style={{ ...kicker, color: "rgba(255,255,255,0.7)" }}>Персональный сервис</div>
          <div style={{ fontFamily: SERIF, fontSize: S.s1, fontWeight: 700, color: PAPER, lineHeight: 1.1, marginTop: 8 }}>
            Личный стилист<br />Radiance
          </div>
          <p style={{ fontFamily: SANS, fontSize: T.sm, color: "rgba(255,255,255,0.74)", lineHeight: 1.5, marginTop: 8, maxWidth: 250 }}>
            Соберём капсулу под ваш гардероб и образ жизни — бесплатно для участников клуба.
          </p>
          <button type="button" onClick={() => fire("Стилист скоро свяжется с вами")}
            className="rd-press" style={{
              marginTop: 14, height: 44, padding: "0 20px", borderRadius: 999, background: PAPER, color: INK,
              fontFamily: SANS, fontSize: T.sm, fontWeight: 600,
            }}>Записаться на консультацию</button>
        </div>
      </div>

      <div style={{ padding: "22px 20px 0", textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: INK }}>Radiance</div>
        <p style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, marginTop: 4 }}>Версия 4.0 · премиальный fashion-бутик · 2026</p>
      </div>
    </div>
  );

  /* --------------- РЕНДЕР --------------- */
  return (
    <div className="rd-root" style={{ background: CANVAS, minHeight: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        .rd-root *{ box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        .rd-press{ transition:transform .14s cubic-bezier(.22,1,.36,1),opacity .14s; }
        .rd-press:active{ transform:scale(.965); }
        .rd-card{ will-change:transform,opacity; }
        .rd-sr{ position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
        .rd-strip{ -webkit-overflow-scrolling:touch; scroll-snap-type:x proximity; }
        .rd-strip > div > div{ scroll-snap-align:start; }
        .scrollbar-hide::-webkit-scrollbar{ display:none; }
        .scrollbar-hide{ -ms-overflow-style:none; scrollbar-width:none; }
        .rd-shim{ background:linear-gradient(100deg,${SAND} 30%,${TINT} 50%,${SAND} 70%); background-size:220% 100%; animation:rdShim 1.3s ease-in-out infinite; }
        .rd-spin{ animation:rdSpin .9s linear infinite; }
        .rd-root input::placeholder{ color:${MUTED}; }
        .rd-root button:focus-visible,.rd-root input:focus-visible,.rd-root [role=button]:focus-visible{ outline:2px solid ${ACCENT}; outline-offset:2px; }
        @keyframes rdUp{ from{ opacity:0; transform:translateY(16px); } to{ opacity:1; transform:translateY(0); } }
        @keyframes rdPop{ 0%{ transform:scale(.4); } 60%{ transform:scale(1.12); } 100%{ transform:scale(1); } }
        @keyframes rdShim{ from{ background-position:140% 0; } to{ background-position:-140% 0; } }
        @keyframes rdSpin{ to{ transform:rotate(360deg); } }
        @keyframes rdFade{ from{ opacity:0; } to{ opacity:1; } }
        @keyframes rdSheet{ from{ opacity:0; transform:translateY(100%); } to{ opacity:1; transform:translateY(0); } }
        @keyframes rdToast{ 0%{ opacity:0; transform:translateY(20px) scale(.96); } 12%,88%{ opacity:1; transform:translateY(0) scale(1); } 100%{ opacity:0; transform:translateY(20px) scale(.96); } }
        @media (prefers-reduced-motion:reduce){
          .rd-root *,.rd-card{ animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; }
        }
      `}</style>

      {activeTab === "home" && Home}
      {activeTab === "catalog" && Catalog}
      {activeTab === "cart" && Cart}
      {activeTab === "profile" && Profile}

      {selected && createPortal(
        <DetailSheet
          product={selected}
          fav={favs.has(selected.id)}
          onFav={() => toggleFav(selected.id)}
          onClose={() => setSelected(null)}
          onAdd={addToCart}
          onOpen={(p) => setSelected(p)}
        />, document.body)}

      {showFavs && createPortal(
        <FavSheet
          products={favProducts}
          favsSet={favs}
          onToggle={toggleFav}
          onOpen={(p) => { setShowFavs(false); setSelected(p); }}
          onClose={() => setShowFavs(false)}
          onBrowse={() => { setShowFavs(false); onTabChange("catalog"); }}
        />, document.body)}

      {toast && createPortal(
        <div role="status" aria-live="polite" style={{
          position: "fixed", left: "50%", transform: "translateX(-50%)",
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 100px)", zIndex: 100020,
          background: INK, color: PAPER, fontFamily: SANS, fontSize: T.sm, fontWeight: 600,
          padding: "13px 22px", borderRadius: 999, boxShadow: "0 14px 36px rgba(20,18,15,0.34)",
          animation: "rdToast 2.1s ease-in-out forwards", whiteSpace: "nowrap",
        }}>{toast}</div>, document.body)}

      {activeTab === "cart" && cartItems.length > 0 && stage !== "done" && createPortal(
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 70, pointerEvents: "none",
          padding: "22px 16px calc(env(safe-area-inset-bottom, 0px) + 104px)",
          background: `linear-gradient(180deg, rgba(238,234,226,0) 0%, ${CANVAS} 34%)`,
        }}>
          <button type="button"
            onClick={() => { if (placing) return; if (stage === "cart") { setStage("checkout"); haptic.medium(); } else placeOrder(); }}
            disabled={placing}
            className="flex items-center justify-center rd-press" style={{
              width: "100%", height: 56, borderRadius: 999, background: INK, gap: 9,
              opacity: placing ? 0.7 : 1, pointerEvents: "auto",
              boxShadow: "0 14px 32px rgba(20,18,15,0.28)",
            }}>
            {placing ? (
              <><Loader2 size={18} color={PAPER} className="rd-spin" /><span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: PAPER }}>Оформляем заказ…</span></>
            ) : (
              <>
                <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: PAPER }}>
                  {stage === "cart" ? "Перейти к оформлению" : "Подтвердить заказ"}
                </span>
                <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 800, color: PAPER, ...NUM }}>· {rub(total)}</span>
              </>
            )}
          </button>
        </div>, document.body)}
    </div>
  );
}

/* =================== Detail Sheet =================== */
function DetailSheet({ product, fav, onFav, onClose, onAdd, onOpen }: {
  product: Product; fav: boolean; onFav: () => void; onClose: () => void;
  onAdd: (id: string, size: string, color: string, qty?: number) => void;
  onOpen: (p: Product) => void;
}) {
  const haptic = useHaptic();
  const [color, setColor] = useState(product.colors[0].name);
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [tab, setTab] = useState<"desc" | "care" | "ship">("desc");
  const ref = useRef<HTMLDivElement>(null);
  const d = pct(product);
  const related = PRODUCTS.filter((p) => p.cat === product.cat && p.id !== product.id).slice(0, 6);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = ref.current?.querySelector<HTMLElement>("button");
    el?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  const add = () => {
    if (!size) { haptic.error(); return; }
    onAdd(product.id, size, color, 1);
    onClose();
  };

  const tabContent: Record<string, React.ReactNode> = {
    desc: <p style={{ fontFamily: SANS, fontSize: T.sm, color: SUB, lineHeight: 1.62 }}>{product.desc}</p>,
    care: (
      <div>
        {[["Состав", product.composition], ["Посадка", product.fit], ["Уход", "Сухая чистка · не отбеливать"]].map(([k, v]) => (
          <div key={k} className="flex justify-between" style={{ padding: "7px 0", borderBottom: `1px solid ${HAIR}` }}>
            <span style={{ fontFamily: SANS, fontSize: T.sm, color: MUTED }}>{k}</span>
            <span style={{ fontFamily: SANS, fontSize: T.sm, color: INK, fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
          </div>
        ))}
      </div>
    ),
    ship: (
      <div style={{ fontFamily: SANS, fontSize: T.sm, color: SUB, lineHeight: 1.62 }}>
        Курьер по Москве — завтра, бесплатно от {rub(FREE_SHIP)}. Экспресс за 2–3 часа или самовывоз из бутика на Патриарших. Возврат и обмен в течение 30 дней.
      </div>
    ),
  };

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label={product.name}
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); else trapTab(e, ref.current); }}
      style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", flexDirection: "column" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,18,15,0.5)", animation: "rdFade .25s ease-out" }} />
      <div style={{
        position: "relative", marginTop: "auto", maxHeight: "94%", display: "flex", flexDirection: "column",
        background: CANVAS, borderRadius: "26px 26px 0 0", overflow: "hidden", animation: "rdSheet .42s cubic-bezier(.22,1,.36,1)",
      }}>
        <div className="scrollbar-hide" style={{ overflowY: "auto", flex: 1 }}>
          {/* фото */}
          <div className="relative" style={{ width: "100%", aspectRatio: "4 / 5", background: SAND }}>
            <Img src={product.img} alt={product.name} priority />
            {product.tag && (
              <span className="absolute" style={{
                top: 16, left: 16, background: product.tag.includes("%") ? ACCENT : PAPER,
                color: product.tag.includes("%") ? "#FFFFFF" : INK,
                fontFamily: SANS, fontSize: T.micro, fontWeight: 700, letterSpacing: "0.04em", padding: "6px 12px", borderRadius: 999,
              }}>{product.tag}</span>
            )}
            <button type="button" onClick={onClose} aria-label="Закрыть"
              className="absolute flex items-center justify-center rd-press"
              style={{ top: 14, right: 14, width: 40, height: 40, borderRadius: 999, background: "rgba(255,255,255,0.94)" }}>
              <X size={19} color={INK} strokeWidth={SW} />
            </button>
            <button type="button" onClick={onFav} aria-label={fav ? "Убрать из избранного" : "В избранное"} aria-pressed={fav}
              className="absolute flex items-center justify-center rd-press"
              style={{ bottom: 14, right: 14, width: 46, height: 46, borderRadius: 999, background: "rgba(255,255,255,0.94)" }}>
              <Heart size={19} strokeWidth={2.2} fill={fav ? INK : "none"} color={INK} style={fav ? { animation: "rdPop .36s ease-out" } : undefined} />
            </button>
          </div>

          <div style={{ padding: "20px 20px 0" }}>
            <div className="flex items-center justify-between">
              <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>{product.brand}</div>
              <div className="flex items-center" style={{ gap: 4 }}>
                <Star size={13} color={ACCENT} fill={ACCENT} strokeWidth={0} />
                <span style={{ fontFamily: SANS, fontSize: T.cap, fontWeight: 700, color: INK, ...NUM }}>{product.rating.toFixed(1)}</span>
                <span style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED, ...NUM }}>· {product.reviews} {plural(product.reviews, ["отзыв", "отзыва", "отзывов"])}</span>
              </div>
            </div>
            <h2 style={{ ...serif(S.s2, 600), marginTop: 7 }}>{product.name}</h2>
            <div className="flex items-baseline" style={{ gap: 9, marginTop: 9 }}>
              <span style={{ fontFamily: SANS, fontSize: "1.5rem", fontWeight: 800, color: INK, ...NUM }}>{rub(product.price)}</span>
              {product.oldPrice && <span style={{ fontFamily: SANS, fontSize: T.body, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(product.oldPrice)}</span>}
              {d > 0 && <span style={{ fontFamily: SANS, fontSize: T.cap, fontWeight: 700, color: "#FFFFFF", background: ACCENT, padding: "3px 9px", borderRadius: 999 }}>−{d}%</span>}
            </div>

            {/* цвет */}
            <div style={{ marginTop: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <span style={{ ...kicker }}>Цвет</span>
                <span style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, fontWeight: 600 }}>{color}</span>
              </div>
              <div className="flex" style={{ gap: 10 }}>
                {product.colors.map((c) => {
                  const on = color === c.name;
                  return (
                    <button type="button" key={c.name} onClick={() => { setColor(c.name); haptic.light(); }}
                      aria-label={c.name} className="rd-press flex items-center justify-center" style={{
                        width: 38, height: 38, borderRadius: 999,
                        border: `2px solid ${on ? INK : "transparent"}`, padding: 3,
                      }}>
                      <span style={{ width: "100%", height: "100%", borderRadius: 999, background: c.hex, border: `1px solid ${HAIR}` }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* размер */}
            <div style={{ marginTop: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <span style={{ ...kicker }}>Размер</span>
                <span style={{ fontFamily: SANS, fontSize: T.cap, color: ACCENT_DEEP, fontWeight: 600 }}>Таблица размеров</span>
              </div>
              <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map((s) => {
                  const on = size === s;
                  return (
                    <button type="button" key={s} onClick={() => { setSize(s); haptic.light(); }}
                      className="rd-press flex items-center justify-center" style={{
                        minWidth: 50, height: 46, padding: "0 14px", borderRadius: 12,
                        background: on ? INK : PAPER, color: on ? PAPER : INK,
                        fontFamily: SANS, fontSize: T.sm, fontWeight: 600,
                        border: `1.5px solid ${on ? INK : "transparent"}`, transition: "background .18s",
                      }}>{s}</button>
                  );
                })}
              </div>
              {!size && <div style={{ fontFamily: SANS, fontSize: T.micro, color: ACCENT_DEEP, marginTop: 9 }}>Выберите размер, чтобы добавить в корзину</div>}
            </div>

            {/* табы */}
            <div style={{ marginTop: 22 }}>
              <div className="flex" style={{ gap: 4, borderBottom: `1px solid ${HAIR}` }}>
                {([["desc", "Описание"], ["care", "Состав и уход"], ["ship", "Доставка"]] as const).map(([k, l]) => {
                  const on = tab === k;
                  return (
                    <button type="button" key={k} onClick={() => setTab(k)} className="rd-press" style={{
                      padding: "0 4px 10px", marginRight: 14, fontFamily: SANS, fontSize: T.sm,
                      fontWeight: 600, color: on ? INK : MUTED,
                      borderBottom: `2px solid ${on ? INK : "transparent"}`, marginBottom: -1,
                    }}>{l}</button>
                  );
                })}
              </div>
              <div style={{ paddingTop: 14 }}>{tabContent[tab]}</div>
            </div>

            {/* преимущества */}
            <div className="flex" style={{ gap: 8, marginTop: 18 }}>
              {[
                { ic: <Truck size={14} color={ACCENT_DEEP} strokeWidth={SW} />, t: "Доставка завтра" },
                { ic: <RotateCcw size={14} color={ACCENT_DEEP} strokeWidth={SW} />, t: "Возврат 30 дней" },
                { ic: <ShieldCheck size={14} color={ACCENT_DEEP} strokeWidth={SW} />, t: "Оригинал" },
              ].map((v) => (
                <div key={v.t} className="flex items-center justify-center" style={{ flex: 1, gap: 5, background: PAPER, borderRadius: 12, padding: "10px 4px" }}>
                  {v.ic}<span style={{ fontFamily: SANS, fontSize: "0.625rem", fontWeight: 600, color: SUB }}>{v.t}</span>
                </div>
              ))}
            </div>

            {/* похожие */}
            {related.length > 0 && (
              <div style={{ margin: "26px -20px 0" }}>
                <div style={{ ...kicker, padding: "0 20px", marginBottom: 12 }}>Сочетается с этим</div>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex" style={{ gap: 12, padding: "0 20px", width: "max-content" }}>
                    {related.map((rp) => (
                      <button type="button" key={rp.id} onClick={() => onOpen(rp)} className="text-left rd-press" style={{ width: 124, flexShrink: 0 }}>
                        <div style={{ width: 124, height: 156, borderRadius: 14, overflow: "hidden" }}>
                          <Img src={rp.img} alt={rp.name} />
                        </div>
                        <div style={{ ...serif("1rem", 600), marginTop: 8 }}>{rp.name}</div>
                        <div style={{ fontFamily: SANS, fontSize: T.cap, fontWeight: 700, color: INK, marginTop: 2, ...NUM }}>{rub(rp.price)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div style={{ height: 20 }} />
          </div>
        </div>

        {/* действие */}
        <div style={{ padding: "12px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)", background: PAPER, borderTop: `1px solid ${HAIR}` }}>
          <button type="button" onClick={add} disabled={!size}
            className="flex items-center justify-center rd-press" style={{
              width: "100%", height: 56, borderRadius: 999, gap: 9,
              background: size ? INK : SAND, opacity: size ? 1 : 0.9,
            }}>
            <ShoppingBag size={18} color={size ? PAPER : MUTED} strokeWidth={SW} />
            <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: size ? PAPER : MUTED }}>
              {size ? "Добавить в корзину" : "Выберите размер"}
            </span>
            {size && <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 800, color: PAPER, ...NUM }}>· {rub(product.price)}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =================== Favorites Sheet =================== */
function FavSheet({ products, favsSet, onToggle, onOpen, onClose, onBrowse }: {
  products: Product[]; favsSet: Set<string>; onToggle: (id: string) => void;
  onOpen: (p: Product) => void; onClose: () => void; onBrowse: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Избранное"
      onKeyDown={(e) => { if (e.key === "Escape") onClose(); else trapTab(e, ref.current); }}
      style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", flexDirection: "column" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(20,18,15,0.5)", animation: "rdFade .25s ease-out" }} />
      <div style={{
        position: "relative", marginTop: "auto", height: "90%", display: "flex", flexDirection: "column",
        background: CANVAS, borderRadius: "26px 26px 0 0", overflow: "hidden", animation: "rdSheet .42s cubic-bezier(.22,1,.36,1)",
      }}>
        <div className="flex items-center justify-between" style={{ padding: "20px 20px 14px" }}>
          <div>
            <div style={kicker}>Сохранённое</div>
            <h2 style={{ ...serif(S.s2, 600), marginTop: 6 }}>Избранное</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть"
            className="flex items-center justify-center rd-press" style={{ width: 40, height: 40, borderRadius: 999, background: PAPER }}>
            <X size={19} color={INK} strokeWidth={SW} />
          </button>
        </div>

        {products.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 40px", textAlign: "center" }}>
            <div className="flex items-center justify-center" style={{ width: 76, height: 76, borderRadius: 999, background: TINT }}>
              <Heart size={30} color={MUTED} strokeWidth={SW} />
            </div>
            <div style={{ ...serif("1.6rem", 600), marginTop: 18 }}>Здесь пока пусто</div>
            <p style={{ fontFamily: SANS, fontSize: T.sm, color: MUTED, marginTop: 7, lineHeight: 1.55 }}>
              Отмечайте вещи сердечком — соберём<br />вашу персональную подборку
            </p>
            <button type="button" onClick={onBrowse} className="rd-press" style={{
              marginTop: 20, height: 48, padding: "0 26px", borderRadius: 999, background: INK, color: PAPER,
              fontFamily: SANS, fontSize: T.body, fontWeight: 600,
            }}>В каталог</button>
          </div>
        ) : (
          <div className="scrollbar-hide" style={{ overflowY: "auto", flex: 1, padding: "0 16px calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
            <div className="grid grid-cols-2" style={{ gap: 14 }}>
              {products.map((p, i) => (
                <ProductCard key={p.id} p={p} idx={i} fav={favsSet.has(p.id)} onFav={() => onToggle(p.id)} onOpen={() => onOpen(p)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(PremiumFashionStore);
