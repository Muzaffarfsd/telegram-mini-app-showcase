import { useState, useCallback, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import {
  Search, Heart, Plus, Minus, ChevronRight, ArrowLeft, Check,
  ShoppingBag, Truck, ShieldCheck, X, Tag, MoveHorizontal, Loader2, Ruler,
} from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";

/* ===================================================================
   VANTA — streetwear e-commerce (демо)
   Монохром · бруталистичный минимализм · editorial · ui-ux-pro-max
   =================================================================== */

const INK = "#0B0B0B";
const PAPER = "#FFFFFF";
const SOFT = "#F2F2F0";
const MUTED = "#6B6B6F";
const SUB = "#3A3A3C";
const LINE = "rgba(0,0,0,0.13)";
const DARK = "#101010";

const T = { micro: "0.6875rem", cap: "0.75rem", sm: "0.8125rem", body: "0.875rem", input: "1rem", h3: "1.125rem", h2: "1.5rem", h1: "2rem", disp: "2.6rem" };
const IC = { sm: 16, md: 20, lg: 24 };
const SW = 1.8;
const FREE_SHIP = 20000;

const IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/";

interface Props {
  activeTab: "home" | "catalog" | "cart" | "profile";
  onTabChange: (tab: string) => void;
  onCartCount?: (n: number) => void;
  onTheme?: (dark: boolean) => void;
}

interface Product {
  id: string;
  type: string;
  model: string;
  price: number;
  oldPrice?: number;
  cat: string;
  kind: "shoes" | "wear";
  img: string;
  gallery?: string[];
  badge?: string;
  swatches: string[];
  desc: string;
  material: string;
  soldOut?: string[];
}

const CATS = ["Обувь", "Куртки", "Худи", "Футболки", "Брюки"];
const SIZES_SHOES = ["40", "41", "42", "43", "44", "45"];
const SIZES_WEAR = ["S", "M", "L", "XL"];

const PRODUCTS: Product[] = [
  {
    id: "v1", type: "Кроссовки", model: "TERRIER BLACK", price: 24900, cat: "Обувь", kind: "shoes",
    img: IMG + "hf_20260523_154716_2e4e0b4b-8a52-4ea2-87e0-4101e890a238_min.webp",
    gallery: [
      IMG + "hf_20260523_154716_2e4e0b4b-8a52-4ea2-87e0-4101e890a238_min.webp",
      IMG + "hf_20260523_155756_9764293b-868c-46a7-856b-d98548123cee_min.webp",
      IMG + "hf_20260523_155759_f01eed1e-a6ae-4f39-966e-5705a0043906_min.webp",
      IMG + "hf_20260523_155803_2eb85ad4-272a-48ef-858d-f4b8296b0695_min.webp",
    ],
    badge: "ХИТ", swatches: ["#0B0B0B", "#3C3C3C"], soldOut: ["40", "45"],
    desc: "Массивный высокий силуэт сезона. Скульптурная техничная подошва, премиальная кожа и сетчатые вставки. Форма, которая не идёт на компромисс.",
    material: "Натуральная кожа, сетка, резина",
  },
  {
    id: "v2", type: "Кроссовки", model: "ALPHA LOW", price: 18900, cat: "Обувь", kind: "shoes",
    img: IMG + "hf_20260523_154720_ffe9bc82-7290-4757-8d8f-18737a387188_min.webp",
    swatches: ["#ECECEC", "#0B0B0B"],
    desc: "Минималистичный лоутоп на каждый день. Чистый кожаный верх, тонкая подошва, выверенные пропорции.",
    material: "Натуральная кожа, резина",
  },
  {
    id: "v3", type: "Кроссовки", model: "TERRIER CRIMSON", price: 26900, oldPrice: 31900, cat: "Обувь", kind: "shoes",
    img: IMG + "hf_20260523_154724_0b8cf0ee-ea59-4b85-97e4-bb0b9292211c_min.webp",
    badge: "−16%", swatches: ["#0B0B0B", "#7E1326"],
    desc: "Тот же агрессивный силуэт TERRIER в новой расцветке с глубокими багровыми акцентами. Лимитированный дроп сезона.",
    material: "Натуральная кожа, сетка, резина",
  },
  {
    id: "v4", type: "Куртка-бомбер", model: "SHELL BLACK", price: 32900, cat: "Куртки", kind: "wear",
    img: IMG + "hf_20260523_154727_e59240d7-2696-4fad-93ba-66f013b6ea56_min.webp",
    swatches: ["#0B0B0B"],
    desc: "Бомбер из плотного матового нейлона. Лаконичный крой, рифлёные манжеты и низ. База технологичного гардероба.",
    material: "Нейлон 100%, подкладка",
  },
  {
    id: "v5", type: "Бомбер", model: "CAMO SPLIT", price: 29900, cat: "Куртки", kind: "wear",
    img: IMG + "hf_20260523_154731_46f8facd-1f38-4588-a2f0-8b33b61b3216_min.webp",
    badge: "НОВОЕ", swatches: ["#2E2E2E", "#0B0B0B"],
    desc: "Оверсайз-бомбер с абстрактным камуфляжным принтом. Графика, собранная из тонов городского бетона.",
    material: "Хлопок, нейлон",
  },
  {
    id: "v6", type: "Худи", model: "HEAVY BLACK", price: 12900, cat: "Худи", kind: "wear",
    img: IMG + "hf_20260523_154735_6e3f3b49-a68c-49b4-a06d-c7b8a8ca83fe_min.webp",
    swatches: ["#0B0B0B", "#3C3C3C"], soldOut: ["S"],
    desc: "Худи из тяжёлого футера с эффектом стирки. Оверсайз-крой, приспущенное плечо — главная посадка сезона.",
    material: "Хлопок 100%, футер 420 г/м²",
  },
  {
    id: "v7", type: "Худи", model: "GRAPHIC GREY", price: 13900, cat: "Худи", kind: "wear",
    img: IMG + "hf_20260523_154739_51ce2a05-6b00-4b28-a405-da13c92ce26a_min.webp",
    badge: "НОВОЕ", swatches: ["#9A9A9A", "#0B0B0B"],
    desc: "Серое оверсайз-худи с тональной графикой на груди. Сдержанный принт тон-в-тон для тех, кто без лишнего шума.",
    material: "Хлопок 100%, футер 380 г/м²",
  },
  {
    id: "v8", type: "Футболка", model: "WASHED BLACK", price: 6900, cat: "Футболки", kind: "wear",
    img: IMG + "hf_20260523_154743_c6ad025f-c38b-4b40-a80d-91553620e8a5_min.webp",
    swatches: ["#1A1A1A", "#ECECEC"],
    desc: "Тяжёлая футболка с эффектом многократной стирки. Прямоугольный boxy-крой, плотный хлопок, выцветший чёрный.",
    material: "Хлопок 100%, 240 г/м²",
  },
  {
    id: "v9", type: "Карго-брюки", model: "TACTICAL", price: 14900, cat: "Брюки", kind: "wear",
    img: IMG + "hf_20260523_154746_fa4db21a-caa6-409d-b781-9921ed99e00b_min.webp",
    swatches: ["#0B0B0B"],
    desc: "Технологичные карго с объёмными карманами и зауженным низом. Функциональная геометрия городского гардероба.",
    material: "Хлопок, эластан",
  },
  {
    id: "v10", type: "Джинсы", model: "RELAXED GREY", price: 11900, oldPrice: 14900, cat: "Брюки", kind: "wear",
    img: IMG + "hf_20260523_154750_72f9a65b-0a16-4867-a8b1-3f2d89cca803_min.webp",
    badge: "−20%", swatches: ["#8A8A8A", "#0B0B0B"],
    desc: "Свободные джинсы из выбеленного денима средне-серого тона. Расслабленная посадка, прямой силуэт.",
    material: "Деним, хлопок 100%",
  },
];

const ED = {
  hero: IMG + "hf_20260523_154818_841a737c-4757-44b5-8270-5568fbd44f29_min.webp",
  lacing: IMG + "hf_20260523_154822_ab7ebb7a-ee78-4ab0-98cd-5f71530c3b7c_min.webp",
  walking: IMG + "hf_20260523_154825_f414cd2c-d707-40fd-b9b3-41410141f556_min.webp",
  cover: IMG + "hf_20260523_154829_2fbfd789-76fb-419f-9591-cb69d3d85f4f_min.webp",
};

const LOOKS = [
  { img: ED.walking, tag: "Лукбук", title: "Город в движении" },
  { img: ED.lacing, tag: "Деталь", title: "Собрано на улице" },
  { img: ED.cover, tag: "Кампания", title: "FW25 — форма улицы" },
];

const PAY = [
  { id: "card", label: "Банковская карта" },
  { id: "sbp", label: "СБП" },
  { id: "apple", label: "Apple Pay" },
];
const DELIVERY = [
  { id: "courier", label: "Курьер", sub: "1–2 дня", price: 0 },
  { id: "pickup", label: "Пункт выдачи", sub: "2–3 дня", price: 0 },
  { id: "post", label: "Почта России", sub: "5–8 дней", price: 390 },
];

const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const NUM = { fontVariantNumeric: "tabular-nums" as const };
const pct = (p: Product) => p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
const plural = (n: number, f: [string, string, string]) => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return f[0];
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return f[1];
  return f[2];
};

/* italic display heading style */
const disp = (size: string): React.CSSProperties => ({
  fontSize: size, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase",
  letterSpacing: "-0.02em", lineHeight: 1.0, color: INK,
});

const FOCUSABLE = 'button,[href],input,[role="slider"],[tabindex]:not([tabindex="-1"])';
function trapTab(e: React.KeyboardEvent, root: HTMLElement | null) {
  if (e.key !== "Tab" || !root) return;
  const els = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true" && el.offsetParent !== null);
  if (!els.length) return;
  const first = els[0], last = els[els.length - 1];
  const a = document.activeElement;
  if (e.shiftKey && (a === first || a === root)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
}

const COLOR_NAMES: Record<string, string> = {
  "#0B0B0B": "Чёрный", "#1A1A1A": "Чёрный", "#3C3C3C": "Графит", "#2E2E2E": "Тёмно-серый",
  "#7E1326": "Багровый", "#8A8A8A": "Серый", "#9A9A9A": "Серый", "#ECECEC": "Белый",
};
const SIZE_GUIDE_SHOES: [string, string][] = [
  ["RU / EU", "Длина стопы"], ["40", "25.0 см"], ["41", "25.7 см"], ["42", "26.5 см"],
  ["43", "27.3 см"], ["44", "28.0 см"], ["45", "28.8 см"],
];
const SIZE_GUIDE_WEAR: [string, string][] = [
  ["Размер", "Обхват груди"], ["S", "92–96 см"], ["M", "98–102 см"], ["L", "104–110 см"], ["XL", "112–118 см"],
];

/* --- image with skeleton --- */
function Img({ src, alt, r = 0, fade, priority }: { src: string; alt: string; r?: number; fade?: boolean; priority?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: r, background: SOFT }}>
      {!loaded && <div className="vt-shim absolute inset-0" style={{ borderRadius: r }} aria-hidden="true" />}
      <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" fetchPriority={priority ? "high" : "auto"} onLoad={() => setLoaded(true)}
        className="w-full h-full" style={{
          objectFit: "cover", display: "block", borderRadius: r,
          opacity: loaded ? 1 : 0, transition: `opacity ${fade ? ".5s" : ".35s"} ease-out`,
        }} />
    </div>
  );
}

/* --- product card --- */
const ProductCard = memo(function ProductCard({ p, fav, onFav, onOpen, onAdd, w, idx = 0 }: {
  p: Product; fav: boolean; onFav: () => void; onOpen: () => void; onAdd: () => void; w?: number | string; idx?: number;
}) {
  const d = pct(p);
  return (
    <div
      role="button" tabIndex={0}
      aria-label={`${p.type} ${p.model}, ${rub(p.price)}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="flex-shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ width: w ?? 176, scrollSnapAlign: "start", animation: "vtUp .45s ease-out both", animationDelay: `${Math.min(idx, 9) * 0.045}s` }}
    >
      <div className="relative" style={{ aspectRatio: "1 / 1.16", background: SOFT, overflow: "hidden" }}>
        <Img src={p.img} alt={`${p.type} ${p.model}`} />
        {p.badge && (
          <span className="absolute" style={{
            top: 0, left: 0, background: INK, color: PAPER, fontSize: T.micro, fontWeight: 800,
            letterSpacing: "0.06em", padding: "5px 9px",
          }}>{p.badge}</span>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label={fav ? "Убрать из избранного" : "В избранное"} aria-pressed={fav}
          className="absolute flex items-center justify-center active:scale-90 transition-transform"
          style={{ top: 0, right: 0, width: 44, height: 44 }}>
          <Heart key={fav ? "1" : "0"} size={IC.sm} strokeWidth={2}
            fill={fav ? INK : "none"} color={INK}
            style={fav ? { animation: "vtPop .34s ease-out" } : undefined} />
        </button>
      </div>
      <div style={{ marginTop: 9 }}>
        <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.type}</div>
        <div style={{ fontSize: T.sm, color: INK, fontWeight: 800, fontStyle: "italic", letterSpacing: "-0.01em", marginTop: 2 }}>{p.model}</div>
        <div className="flex items-center" style={{ gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: T.sm, fontWeight: 700, color: INK, ...NUM }}>{rub(p.price)}</span>
          {p.oldPrice && <span style={{ fontSize: T.cap, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(p.oldPrice)}</span>}
        </div>
      </div>
    </div>
  );
});

function SectionHead({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-end justify-between" style={{ padding: "0 20px", marginBottom: 14 }}>
      <h2 style={disp(T.h2)}>{title}</h2>
      {onSeeAll && (
        <button type="button" onClick={onSeeAll} className="flex items-center active:opacity-60"
          style={{ fontSize: T.micro, color: INK, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", gap: 3, padding: "10px 0 10px 12px", minHeight: 44 }}>
          Всё <ChevronRight size={14} strokeWidth={SW} />
        </button>
      )}
    </div>
  );
}

function Steps({ active }: { active: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center" style={{ gap: 8, padding: "2px 20px 10px" }}>
      {["Корзина", "Оформление", "Готово"].map((l, i) => (
        <div key={l} className="flex items-center" style={{ gap: 8, flex: i < 2 ? 1 : "none" }}>
          <span style={{ fontSize: T.micro, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: i + 1 <= active ? INK : MUTED }}>
            {String(i + 1).padStart(2, "0")} {l}
          </span>
          {i < 2 && <span style={{ flex: 1, height: 1.5, background: i + 1 < active ? INK : LINE }} />}
        </div>
      ))}
    </div>
  );
}

/* =================== main component =================== */
function StreetwearStore({ activeTab, onTabChange, onCartCount }: Props) {
  const haptic = useHaptic();
  const [selected, setSelected] = useState<Product | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set(["v1", "v5"]));
  const [cart, setCart] = useState<{ id: string; qty: number; size: string }[]>([
    { id: "v6", qty: 1, size: "L" },
    { id: "v2", qty: 1, size: "43" },
  ]);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const [showFavs, setShowFavs] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback((msg: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), undo ? 4800 : 1900);
  }, []);

  const toggleFav = useCallback((id: string) => {
    haptic.light();
    setFavs((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, [haptic]);

  const addToCart = useCallback((id: string, size: string, qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === id && i.size === size);
      if (ex) return c.map((i) => (i === ex ? { ...i, qty: i.qty + qty } : i));
      return [...c, { id, qty, size }];
    });
    fire("Добавлено в корзину");
    haptic.success();
  }, [fire, haptic]);

  const subtotal = cart.reduce((s, i) => {
    const p = PRODUCTS.find((x) => x.id === i.id); return s + (p ? p.price * i.qty : 0);
  }, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  useEffect(() => { onCartCount?.(cartCount); }, [cartCount, onCartCount]);

  const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;
  const favProducts = PRODUCTS.filter((p) => favs.has(p.id));
  const defaultSize = (p: Product) => (p.kind === "shoes" ? "43" : "L");

  /* --------------- HOME --------------- */
  const Home = (
    <div className="min-h-full" style={{ background: PAPER, paddingBottom: 24 }}>
      <h1 className="vt-sr">VANTA — стритвир-бутик</h1>
      <header className="flex items-center justify-between" style={{ padding: "15px 20px" }}>
        <button type="button" onClick={() => setShowFavs(true)}
          className="relative flex items-center justify-center active:scale-90 transition-transform"
          style={{ width: 44, height: 44, marginLeft: -10 }} aria-label="Избранное">
          <Heart size={IC.md} color={INK} strokeWidth={SW} />
          {favs.size > 0 && (
            <span className="absolute" style={{ top: 7, right: 6, width: 6, height: 6, borderRadius: 999, background: INK }} />
          )}
        </button>
        <div style={{ fontSize: T.h3, fontWeight: 900, fontStyle: "italic", letterSpacing: "0.04em", color: INK }}>VANTA</div>
        <button type="button" onClick={() => onTabChange("catalog")}
          className="flex items-center justify-center active:scale-90 transition-transform"
          style={{ width: 44, height: 44, marginRight: -10 }} aria-label="Поиск">
          <Search size={IC.md} color={INK} strokeWidth={SW} />
        </button>
      </header>

      {/* editorial hero */}
      <button type="button" onClick={() => onTabChange("catalog")} className="relative block w-full text-left active:opacity-95 vt-ondark"
        style={{ height: 466, overflow: "hidden" }}>
        <Img src={ED.hero} alt="Кампания VANTA FW25" fade priority />
        <div className="absolute inset-0" aria-hidden="true"
          style={{ background: "linear-gradient(180deg, rgba(8,8,8,0.45) 0%, rgba(8,8,8,0.05) 38%, rgba(8,8,8,0.78) 100%)" }} />
        <div className="absolute" style={{ top: 22, left: 20 }}>
          <div style={{ fontSize: T.micro, fontWeight: 800, letterSpacing: "0.14em", color: PAPER }}>КОЛЛЕКЦИЯ FW25</div>
        </div>
        <div className="absolute" style={{ left: 20, right: 20, bottom: 24 }}>
          <div style={{ ...disp(T.disp), color: PAPER }}>Новая<br />форма улицы</div>
          <div className="flex items-center" style={{
            marginTop: 18, height: 50, background: PAPER, color: INK, paddingLeft: 20, paddingRight: 16,
            width: "max-content", gap: 14,
          }}>
            <span style={{ fontSize: T.sm, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.04em" }}>Смотреть коллекцию</span>
            <ChevronRight size={IC.sm} strokeWidth={2.4} />
          </div>
        </div>
      </button>

      {/* collection strip */}
      <div style={{ marginTop: 30 }}>
        <SectionHead title="Коллекция FW25" onSeeAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide vt-strip">
          <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
            {PRODUCTS.slice(0, 6).map((p, i) => (
              <ProductCard key={p.id} p={p} idx={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
                onOpen={() => setSelected(p)} onAdd={() => addToCart(p.id, defaultSize(p))} />
            ))}
          </div>
        </div>
      </div>

      {/* editorial banner */}
      <button type="button" onClick={() => onTabChange("catalog")} className="relative block w-full text-left active:opacity-95 vt-ondark"
        style={{ marginTop: 30, height: 320, overflow: "hidden" }}>
        <Img src={ED.walking} alt="Лукбук VANTA" />
        <div className="absolute inset-0" aria-hidden="true"
          style={{ background: "linear-gradient(110deg, rgba(8,8,8,0.72) 5%, rgba(8,8,8,0.12) 70%)" }} />
        <div className="absolute" style={{ left: 20, top: 24, right: 20 }}>
          <div style={{ fontSize: T.micro, fontWeight: 800, letterSpacing: "0.12em", color: PAPER, opacity: 0.8 }}>ЛУКБУК</div>
          <div style={{ ...disp(T.h1), color: PAPER, marginTop: 8 }}>Город<br />в движении</div>
        </div>
        <span className="absolute flex items-center" style={{
          left: 20, bottom: 22, fontSize: T.micro, fontWeight: 800, letterSpacing: "0.06em",
          textTransform: "uppercase", color: PAPER, gap: 6, borderBottom: `1.5px solid ${PAPER}`, paddingBottom: 4,
        }}>Открыть лукбук <ChevronRight size={13} strokeWidth={2.4} /></span>
      </button>

      {/* new */}
      <div style={{ marginTop: 30 }}>
        <SectionHead title="Новое" onSeeAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide vt-strip">
          <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
            {PRODUCTS.slice(4).concat(PRODUCTS.slice(0, 2)).map((p, i) => (
              <ProductCard key={p.id + i} p={p} idx={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
                onOpen={() => setSelected(p)} onAdd={() => addToCart(p.id, defaultSize(p))} />
            ))}
          </div>
        </div>
      </div>

      {/* lookbook */}
      <div style={{ marginTop: 30 }}>
        <SectionHead title="Образы" />
        <div className="overflow-x-auto scrollbar-hide vt-strip">
          <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
            {LOOKS.map((l, i) => (
              <article key={i} className="flex-shrink-0 active:scale-[0.98] transition-transform" style={{ width: 230, scrollSnapAlign: "start" }}>
                <div style={{ height: 290, overflow: "hidden" }}>
                  <Img src={l.img} alt={l.title} />
                </div>
                <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 9 }}>{l.tag}</div>
                <h3 style={{ fontSize: T.body, fontWeight: 800, fontStyle: "italic", color: INK, marginTop: 2 }}>{l.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------- CATALOG --------------- */
  const [catFilter, setCatFilter] = useState("Всё");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const catProducts = PRODUCTS.filter(
    (p) => (catFilter === "Всё" || p.cat === catFilter) &&
           (q === "" || (p.type + " " + p.model).toLowerCase().includes(q))
  );
  const Catalog = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 24 }}>
      <h1 style={{ ...disp(T.h1), padding: "16px 20px 12px" }}>Каталог</h1>
      <div style={{ padding: "0 20px 12px" }}>
        <div className="flex items-center" style={{ gap: 10, background: SOFT, padding: "0 14px", height: 48 }}>
          <Search size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
          <input type="search" inputMode="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по каталогу" aria-label="Поиск по каталогу"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: T.input, color: INK, minWidth: 0 }} />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Очистить"
              className="flex items-center justify-center" style={{ minWidth: 44, height: 44, marginRight: -8, fontSize: T.micro, fontWeight: 800, letterSpacing: "0.05em", color: MUTED }}>СБРОС</button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide" style={{ marginBottom: 16 }}>
        <div className="flex" style={{ gap: 8, padding: "0 20px", width: "max-content" }} role="group" aria-label="Категории">
          {["Всё", ...CATS].map((c) => {
            const on = catFilter === c;
            return (
              <button type="button" key={c} onClick={() => setCatFilter(c)} aria-pressed={on}
                className="flex-shrink-0 flex items-center active:scale-95 transition-colors"
                style={{
                  height: 44, padding: "0 17px", fontSize: T.micro, fontWeight: 800, letterSpacing: "0.06em",
                  textTransform: "uppercase", background: on ? INK : PAPER, color: on ? PAPER : INK,
                  border: `1.5px solid ${on ? INK : LINE}`,
                }}>{c}</button>
            );
          })}
        </div>
      </div>
      {catProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: "64px 32px", color: MUTED }}>
          <Search size={IC.lg} strokeWidth={1.5} aria-hidden="true" />
          <div style={{ marginTop: 14, fontSize: T.body, fontWeight: 800, fontStyle: "italic", color: INK }}>Ничего не найдено</div>
          <div style={{ marginTop: 4, fontSize: T.sm }}>Измените запрос или категорию</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 12px", padding: "0 20px" }}>
          {catProducts.map((p, i) => (
            <ProductCard key={p.id} p={p} idx={i} w="100%" fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
              onOpen={() => setSelected(p)} onAdd={() => addToCart(p.id, defaultSize(p))} />
          ))}
        </div>
      )}
    </div>
  );

  /* --------------- CART --------------- */
  const [stage, setStage] = useState<"cart" | "checkout" | "done">("cart");
  const [processing, setProcessing] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoOK, setPromoOK] = useState(false);
  const [promoErr, setPromoErr] = useState("");
  const [payId, setPayId] = useState("card");
  const [delivId, setDelivId] = useState("courier");
  const discount = promoOK ? Math.round(subtotal * 0.1) : 0;
  const toFree = Math.max(0, FREE_SHIP - (subtotal - discount));
  const shipPct = Math.min(100, Math.round(((subtotal - discount) / FREE_SHIP) * 100));
  const delivBase = DELIVERY.find((d) => d.id === delivId)!.price;
  const delivPrice = subtotal - discount >= FREE_SHIP ? 0 : delivBase;
  const orderTotal = subtotal - discount + delivPrice;

  const setQty = (idx: number, d: number) =>
    setCart((c) => c.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty + d) } : it)));
  const removeItem = (idx: number) => {
    const removed = cart[idx];
    setCart((c) => c.filter((_, i) => i !== idx));
    fire("Товар удалён", () => setCart((c) => { const n = [...c]; n.splice(Math.min(idx, n.length), 0, removed); return n; }));
  };
  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "VANTA10") { setPromoOK(true); setPromoErr(""); fire("Промокод применён · −10%"); }
    else setPromoErr("Промокод не найден. Попробуйте VANTA10");
  };
  const SumRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <div className="flex items-center justify-between" style={{ marginTop: 9 }}>
      <span style={{ fontSize: T.sm, color: MUTED }}>{label}</span>
      <span style={{ fontSize: T.sm, color: INK, fontWeight: 700, ...NUM }}>{value}</span>
    </div>
  );

  const Cart = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 120 }}>
      {stage === "cart" && (
        <>
          <h1 style={{ ...disp(T.h1), padding: "16px 20px 10px" }}>Корзина</h1>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: "72px 32px", color: MUTED }}>
              <ShoppingBag size={IC.lg} strokeWidth={1.5} aria-hidden="true" />
              <div style={{ marginTop: 14, fontSize: T.body, fontWeight: 800, fontStyle: "italic", color: INK }}>Корзина пуста</div>
              <button type="button" onClick={() => onTabChange("catalog")} className="active:scale-[0.98] transition-transform"
                style={{ marginTop: 18, height: 50, padding: "0 26px", background: INK, color: PAPER, fontSize: T.sm, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.04em" }}>
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
                    <div key={idx} className="flex" style={{ gap: 14, padding: "14px 0", borderBottom: `1px solid ${LINE}` }}>
                      <button type="button" onClick={() => setSelected(p)} aria-label={`Открыть ${p.model}`}
                        style={{ width: 86, height: 100, background: SOFT, flexShrink: 0 }}>
                        <Img src={p.img} alt={p.model} />
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{p.type}</div>
                        <div style={{ fontSize: T.sm, fontWeight: 800, fontStyle: "italic", color: INK }}>{p.model}</div>
                        <div style={{ fontSize: T.cap, color: MUTED, marginTop: 3 }}>Размер · {it.size}</div>
                        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
                          <div className="flex items-center" style={{ border: `1.5px solid ${LINE}` }}>
                            <button type="button" onClick={() => setQty(idx, -1)} aria-label="Меньше"
                              className="flex items-center justify-center active:bg-black/5" style={{ width: 44, height: 44 }}>
                              <Minus size={14} color={it.qty <= 1 ? MUTED : INK} strokeWidth={2.4} />
                            </button>
                            <span style={{ fontSize: T.sm, fontWeight: 800, color: INK, minWidth: 26, textAlign: "center", ...NUM }} aria-live="polite">{it.qty}</span>
                            <button type="button" onClick={() => setQty(idx, 1)} aria-label="Больше"
                              className="flex items-center justify-center active:bg-black/5" style={{ width: 44, height: 44 }}>
                              <Plus size={14} color={INK} strokeWidth={2.4} />
                            </button>
                          </div>
                          <span style={{ fontSize: T.body, fontWeight: 800, color: INK, ...NUM }}>{rub(p.price * it.qty)}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} aria-label={`Удалить ${p.model}`}
                        className="flex items-center justify-center" style={{ width: 44, height: 44, margin: "-9px -12px 0 0", flexShrink: 0 }}>
                        <X size={IC.sm} color={MUTED} strokeWidth={SW} />
                      </button>
                    </div>
                  );
                })}
                <div style={{ marginTop: 16 }}>
                  {promoOK ? (
                    <div className="flex items-center justify-between" style={{ background: SOFT, padding: "12px 14px" }}>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <Tag size={IC.sm} color={INK} strokeWidth={SW} />
                        <span style={{ fontSize: T.sm, fontWeight: 800, color: INK }}>VANTA10 · −10%</span>
                      </div>
                      <button type="button" onClick={() => { setPromoOK(false); setPromo(""); }} aria-label="Убрать промокод"
                        className="flex items-center justify-center" style={{ width: 44, height: 44, marginRight: -10 }}>
                        <X size={IC.sm} color={INK} strokeWidth={SW} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <div className="flex items-center" style={{ flex: 1, background: SOFT, padding: "0 14px", height: 48 }}>
                          <Tag size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
                          <input value={promo} onChange={(e) => { setPromo(e.target.value); setPromoErr(""); }}
                            onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
                            placeholder="Промокод" aria-label="Промокод"
                            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: T.input, color: INK, marginLeft: 9, minWidth: 0 }} />
                        </div>
                        <button type="button" onClick={applyPromo} className="active:scale-95 transition-transform"
                          style={{ height: 48, padding: "0 18px", background: INK, color: PAPER, fontSize: T.micro, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                          ОК
                        </button>
                      </div>
                      {promoErr && <div role="alert" style={{ fontSize: T.cap, color: "#B23B3B", marginTop: 7, fontWeight: 600 }}>{promoErr}</div>}
                    </>
                  )}
                </div>
                <div style={{ marginTop: 16, background: SOFT, padding: "12px 14px" }}>
                  {toFree > 0 ? (
                    <>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <Truck size={IC.sm} color={INK} strokeWidth={SW} aria-hidden="true" />
                        <span style={{ fontSize: T.cap, color: INK, fontWeight: 700 }}>
                          До бесплатной доставки · ещё <span style={NUM}>{rub(toFree)}</span>
                        </span>
                      </div>
                      <div className="relative" style={{ height: 4, background: "rgba(0,0,0,0.1)", marginTop: 9 }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={shipPct} aria-label="Прогресс до бесплатной доставки">
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: INK, width: `${shipPct}%`, transition: "width .45s cubic-bezier(.22,1,.36,1)" }} />
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center" style={{ gap: 8 }}>
                      <Check size={IC.sm} color={INK} strokeWidth={2.6} aria-hidden="true" />
                      <span style={{ fontSize: T.cap, color: INK, fontWeight: 800 }}>Бесплатная доставка подключена</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1.5px solid ${INK}` }}>
                  <SumRow label={`Товары · ${cartCount}`} value={rub(subtotal)} />
                  {discount > 0 && <SumRow label="Скидка" value={`−${rub(discount)}`} />}
                  <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
                    <span style={{ ...disp(T.h3) }}>Итого</span>
                    <span aria-live="polite" style={{ fontSize: T.h2, fontWeight: 800, color: INK, ...NUM }}>{rub(subtotal - discount)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setStage("checkout")} className="active:scale-[0.98] transition-transform"
                  style={{ width: "100%", marginTop: 16, height: 56, background: INK, color: PAPER, fontSize: T.body, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Оформить заказ
                </button>
              </div>
            </>
          )}
        </>
      )}

      {stage === "checkout" && (
        <>
          <div className="flex items-center" style={{ gap: 6, padding: "16px 20px 6px" }}>
            <button type="button" onClick={() => setStage("cart")} aria-label="Назад"
              className="flex items-center justify-center active:scale-90 transition-transform" style={{ width: 40, height: 40, marginLeft: -8 }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={disp(T.h2)}>Оформление</h1>
          </div>
          <Steps active={2} />
          <div style={{ padding: "4px 20px 0" }}>
            <div className="flex items-center justify-between" style={{ background: SOFT, padding: "14px 16px" }}>
              <div>
                <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase" }}>Адрес доставки</div>
                <div style={{ fontSize: T.sm, color: INK, fontWeight: 700, marginTop: 5 }}>Максим М.</div>
                <div style={{ fontSize: T.sm, color: MUTED, marginTop: 2 }}>ул. Тверская 12, Москва</div>
              </div>
              <ChevronRight size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
            </div>
            <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 22, marginBottom: 9 }}>Доставка</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Способ доставки">
              {DELIVERY.map((d) => {
                const on = delivId === d.id; const free = subtotal - discount >= FREE_SHIP || d.price === 0;
                return (
                  <button type="button" key={d.id} role="radio" aria-checked={on} onClick={() => setDelivId(d.id)}
                    className="flex items-center justify-between active:scale-[0.99] transition-transform"
                    style={{ padding: "13px 15px", border: `1.5px solid ${on ? INK : LINE}`, background: PAPER }}>
                    <div className="flex items-center" style={{ gap: 11 }}>
                      <span className="flex items-center justify-center" style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px solid ${on ? INK : LINE}` }}>
                        {on && <span style={{ width: 9, height: 9, borderRadius: 999, background: INK }} />}
                      </span>
                      <div className="text-left">
                        <div style={{ fontSize: T.sm, fontWeight: 700, color: INK }}>{d.label}</div>
                        <div style={{ fontSize: T.cap, color: MUTED, marginTop: 1 }}>{d.sub}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: T.sm, fontWeight: 800, color: INK, ...NUM }}>{free ? "0 ₽" : rub(d.price)}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 22, marginBottom: 9 }}>Оплата</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Способ оплаты">
              {PAY.map((m) => {
                const on = payId === m.id;
                return (
                  <button type="button" key={m.id} role="radio" aria-checked={on} onClick={() => setPayId(m.id)}
                    className="flex items-center active:scale-[0.99] transition-transform"
                    style={{ gap: 11, padding: "13px 15px", border: `1.5px solid ${on ? INK : LINE}`, background: PAPER }}>
                    <span className="flex items-center justify-center" style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px solid ${on ? INK : LINE}` }}>
                      {on && <span style={{ width: 9, height: 9, borderRadius: 999, background: INK }} />}
                    </span>
                    <span style={{ fontSize: T.sm, fontWeight: 700, color: INK }}>{m.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1.5px solid ${INK}` }}>
              <SumRow label={`Товары · ${cartCount}`} value={rub(subtotal)} />
              {discount > 0 && <SumRow label="Скидка" value={`−${rub(discount)}`} />}
              <SumRow label="Доставка" value={delivPrice === 0 ? "0 ₽" : rub(delivPrice)} />
              <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
                <span style={disp(T.h3)}>К оплате</span>
                <span style={{ fontSize: T.h2, fontWeight: 800, color: INK, ...NUM }}>{rub(orderTotal)}</span>
              </div>
            </div>
            <button type="button" disabled={processing}
              onClick={() => { setProcessing(true); haptic.medium(); setTimeout(() => { setProcessing(false); setStage("done"); haptic.success(); }, 950); }}
              className="flex items-center justify-center active:scale-[0.98] transition-transform"
              style={{ width: "100%", marginTop: 16, height: 56, background: INK, color: PAPER, fontSize: T.body, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.04em", gap: 10, opacity: processing ? 0.72 : 1 }}>
              {processing
                ? <><Loader2 size={IC.sm} color={PAPER} strokeWidth={2.4} style={{ animation: "vtSpin .8s linear infinite" }} aria-hidden="true" /> Обработка…</>
                : <>Подтвердить · {rub(orderTotal)}</>}
            </button>
          </div>
        </>
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "72vh", padding: "0 32px" }}>
          <div className="flex items-center justify-center" style={{ width: 80, height: 80, background: INK, animation: "vtPop .5s ease-out" }}>
            <Check size={34} color={PAPER} strokeWidth={2.6} aria-hidden="true" />
          </div>
          <h1 style={{ ...disp(T.h1), marginTop: 22 }}>Заказ принят</h1>
          <p style={{ fontSize: T.sm, color: MUTED, marginTop: 8, lineHeight: 1.55 }}>
            Мы отправили детали на вашу почту и пришлём трек-номер, как только заказ соберут.
          </p>
          <button type="button" onClick={() => { setCart([]); setStage("cart"); setPromoOK(false); setPromo(""); onTabChange("home"); }}
            className="active:scale-[0.98] transition-transform"
            style={{ marginTop: 24, height: 52, padding: "0 40px", background: INK, color: PAPER, fontSize: T.sm, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Готово
          </button>
        </div>
      )}
    </div>
  );

  /* --------------- PROFILE --------------- */
  const Profile = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 24 }}>
      <h1 style={{ ...disp(T.h1), padding: "16px 20px 16px" }}>Профиль</h1>
      <div className="flex items-center" style={{ gap: 14, padding: "0 20px 20px" }}>
        <div className="flex items-center justify-center" aria-hidden="true" style={{ width: 60, height: 60, background: INK }}>
          <span style={{ fontSize: T.h3, fontWeight: 900, fontStyle: "italic", color: PAPER }}>М</span>
        </div>
        <div>
          <div style={{ fontSize: T.h3, fontWeight: 800, fontStyle: "italic", color: INK }}>Максим М.</div>
          <div style={{ fontSize: T.sm, color: MUTED }}>VANTA Member · с 2024</div>
        </div>
      </div>
      <nav aria-label="Меню профиля">
        {[
          { r: "Мои заказы", n: "home" },
          { r: "Избранное", n: "fav" },
          { r: "Адреса доставки", n: "catalog" },
          { r: "Способы оплаты", n: "catalog" },
          { r: "Поддержка", n: "catalog" },
        ].map((row) => (
          <button type="button" key={row.r}
            onClick={() => { if (row.n === "fav") setShowFavs(true); else onTabChange(row.n); }}
            className="flex items-center justify-between w-full active:bg-black/[0.03]"
            style={{ padding: "0 20px", minHeight: 56, borderBottom: `1px solid ${LINE}` }}>
            <span style={{ fontSize: T.body, fontWeight: 700, color: INK }}>{row.r}</span>
            <div className="flex items-center" style={{ gap: 8 }}>
              {row.r === "Избранное" && favs.size > 0 && (
                <span style={{ fontSize: T.cap, color: MUTED, fontWeight: 700, ...NUM }}>{favs.size}</span>
              )}
              <ChevronRight size={IC.md} color={MUTED} strokeWidth={SW} aria-hidden="true" />
            </div>
          </button>
        ))}
      </nav>
    </div>
  );

  /* --------------- PRODUCT DETAIL --------------- */
  const [size, setSize] = useState("");
  const [colorIdx, setColorIdx] = useState(0);
  const [angle, setAngle] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [detScroll, setDetScroll] = useState(false);
  const detailClose = useRef<HTMLButtonElement>(null);
  const detailDialog = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) {
      setAngle(0); setColorIdx(0); setShowGuide(false); setDetScroll(false);
      const all = selected.kind === "shoes" ? SIZES_SHOES : SIZES_WEAR;
      const avail = all.filter((sz) => !selected.soldOut?.includes(sz));
      const pref = defaultSize(selected);
      setSize(avail.includes(pref) ? pref : (avail[0] ?? pref));
      const t = setTimeout(() => detailClose.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [selected]);

  const views = selected ? (selected.gallery && selected.gallery.length > 1 ? selected.gallery : [selected.img]) : [];
  const scrub = (clientX: number) => {
    const el = trackRef.current; if (!el || views.length < 2) return;
    const r = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    setAngle(Math.round(f * (views.length - 1)));
  };
  const similar = selected ? PRODUCTS.filter((p) => p.id !== selected.id && p.cat === selected.cat).concat(PRODUCTS.filter((p) => p.id !== selected.id && p.cat !== selected.cat)).slice(0, 4) : [];
  const sizes = selected ? (selected.kind === "shoes" ? SIZES_SHOES : SIZES_WEAR) : [];

  const Detail = selected && (
    <div className="vanta">
      <div ref={detailDialog} className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER }}
        role="dialog" aria-modal="true" aria-label={`${selected.type} ${selected.model}`}
        onKeyDown={(e) => { if (e.key === "Escape") setSelected(null); trapTab(e, detailDialog.current); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "vtSheet .34s cubic-bezier(.22,1,.36,1) both" }}>
          <div key={selected.id} onScroll={(e) => setDetScroll((e.currentTarget as HTMLElement).scrollTop > 320)} className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0 }}>
            {/* sticky header */}
            <div className="sticky top-0 flex items-center justify-between" style={{ padding: "12px 20px", background: PAPER, zIndex: 3, borderBottom: `1px solid ${detScroll ? LINE : "transparent"}`, transition: "border-color .2s ease" }}>
              <button type="button" ref={detailClose} onClick={() => setSelected(null)} aria-label="Закрыть"
                className="flex items-center justify-center active:scale-90 transition-transform" style={{ width: 44, height: 44, marginLeft: -10 }}>
                <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
              </button>
              <div style={{ fontSize: T.micro, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: detScroll ? INK : MUTED, transition: "color .2s ease", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 190, textAlign: "center" }}>{detScroll ? selected.model : selected.cat}</div>
              <button type="button" onClick={() => toggleFav(selected.id)} aria-pressed={favs.has(selected.id)}
                aria-label={favs.has(selected.id) ? "Убрать из избранного" : "В избранное"}
                className="flex items-center justify-center active:scale-90 transition-transform" style={{ width: 44, height: 44, marginRight: -10 }}>
                <Heart key={favs.has(selected.id) ? "1" : "0"} size={IC.md} strokeWidth={SW}
                  fill={favs.has(selected.id) ? INK : "none"} color={INK}
                  style={favs.has(selected.id) ? { animation: "vtPop .34s ease-out" } : undefined} />
              </button>
            </div>

            {/* product image / gallery */}
            <div className="relative" style={{ background: SOFT, padding: "8px 20px 0" }}>
              <div style={{ aspectRatio: "1 / 1", animation: "vtFloat 6s ease-in-out infinite" }}>
                <img key={angle} src={views[angle]} alt={`${selected.model} — вид ${angle + 1}`}
                  className="w-full h-full" style={{ objectFit: "cover", display: "block", animation: "vtFade .4s ease-out" }} />
              </div>
              {pct(selected) > 0 && (
                <span className="absolute" style={{ top: 8, left: 20, background: INK, color: PAPER, fontSize: T.cap, fontWeight: 800, padding: "6px 11px" }}>−{pct(selected)}%</span>
              )}
              {views.length > 1 && (
                <div style={{ padding: "10px 0 16px" }}>
                  <div className="flex items-center" style={{ gap: 8 }}>
                    <MoveHorizontal size={14} color={MUTED} strokeWidth={SW} aria-hidden="true" />
                    <span style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Потяните — поверните модель</span>
                    <span style={{ marginLeft: "auto", fontSize: T.micro, color: INK, fontWeight: 800, ...NUM }}>{angle + 1} / {views.length}</span>
                  </div>
                  <div ref={trackRef}
                    role="slider" aria-label="Поворот модели" aria-valuemin={1} aria-valuemax={views.length} aria-valuenow={angle + 1} tabIndex={0}
                    onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); scrub(e.clientX); }}
                    onPointerMove={(e) => { if (e.buttons === 1) scrub(e.clientX); }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight") setAngle((a) => Math.min(views.length - 1, a + 1));
                      if (e.key === "ArrowLeft") setAngle((a) => Math.max(0, a - 1));
                    }}
                    className="relative" style={{ height: 44, marginTop: 6, cursor: "ew-resize", touchAction: "none" }}>
                    <div className="absolute" style={{ left: 0, right: 0, top: 21, height: 2, background: LINE }} />
                    <div className="absolute" style={{ left: 0, top: 21, height: 2, background: INK, width: `${(angle / (views.length - 1)) * 100}%`, transition: "width .15s ease-out" }} />
                    <div className="absolute flex items-center justify-center" style={{
                      top: 6, left: `calc(${(angle / (views.length - 1)) * 100}% - 16px)`, width: 32, height: 32,
                      borderRadius: 999, background: INK, transition: "left .15s ease-out",
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: 999, background: PAPER }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "20px 20px 0" }}>
              <div style={{ fontSize: T.cap, color: MUTED, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{selected.type} · VANTA</div>
              <h1 style={{ ...disp(T.h1), marginTop: 6 }}>{selected.model}</h1>
              <div className="flex items-center" style={{ gap: 10, marginTop: 12 }}>
                <span style={{ fontSize: T.h2, fontWeight: 800, color: INK, ...NUM }}>{rub(selected.price)}</span>
                {selected.oldPrice && <span style={{ fontSize: T.body, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(selected.oldPrice)}</span>}
              </div>

              {(selected.soldOut?.length || selected.badge === "ХИТ") ? (
                <div className="flex items-center" style={{ gap: 7, marginTop: 13 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: INK, flexShrink: 0 }} aria-hidden="true" />
                  <span style={{ fontSize: T.cap, color: SUB, fontWeight: 700 }}>
                    {selected.soldOut?.length ? "Ходовые размеры заканчиваются" : "Хит сезона · быстро разбирают"}
                  </span>
                </div>
              ) : null}
              <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 22 }}>Цвет</div>
              <div className="flex" style={{ gap: 10, marginTop: 10 }} role="group" aria-label="Выбор цвета">
                {selected.swatches.map((c, i) => (
                  <button type="button" key={i} onClick={() => { setColorIdx(i); haptic.selection(); }}
                    aria-label={COLOR_NAMES[c] || `Цвет ${i + 1}`} aria-pressed={colorIdx === i}
                    className="flex items-center justify-center active:scale-90 transition-transform"
                    style={{ width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${colorIdx === i ? INK : LINE}` }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999, background: c, border: c === "#ECECEC" ? `1px solid ${LINE}` : "none" }} />
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between" style={{ marginTop: 22 }}>
                <span style={{ fontSize: T.micro, color: MUTED, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>Размер</span>
                <button type="button" onClick={() => setShowGuide((v) => !v)} aria-expanded={showGuide}
                  className="flex items-center active:opacity-60"
                  style={{ fontSize: T.micro, color: INK, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", gap: 5, minHeight: 44, paddingLeft: 12 }}>
                  <Ruler size={13} strokeWidth={SW} aria-hidden="true" /> Таблица размеров
                </button>
              </div>
              <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }} role="group" aria-label="Выбор размера">
                {sizes.map((s) => {
                  const on = size === s;
                  const out = selected.soldOut?.includes(s);
                  return (
                    <button type="button" key={s} disabled={out} onClick={() => { setSize(s); haptic.selection(); }}
                      aria-pressed={on} aria-label={out ? `Размер ${s} — нет в наличии` : `Размер ${s}`}
                      className="relative flex items-center justify-center active:scale-95 transition-transform"
                      style={{ minWidth: 52, height: 46, padding: "0 12px", fontSize: T.sm, fontWeight: 800, ...NUM,
                        background: on ? INK : PAPER, color: out ? MUTED : on ? PAPER : INK,
                        border: `1.5px solid ${on ? INK : LINE}`, cursor: out ? "not-allowed" : "pointer", opacity: out ? 0.5 : 1 }}>
                      {s}
                      {out && <span aria-hidden="true" style={{ position: "absolute", left: 7, right: 7, top: "50%", height: 1.5, background: MUTED }} />}
                    </button>
                  );
                })}
              </div>

              {showGuide && (
                <div style={{ marginTop: 10, border: `1px solid ${LINE}`, animation: "vtUp .25s ease-out both" }}>
                  {(selected.kind === "shoes" ? SIZE_GUIDE_SHOES : SIZE_GUIDE_WEAR).map((row, i) => (
                    <div key={row[0]} className="flex" style={{ borderTop: i ? `1px solid ${LINE}` : "none", background: i === 0 ? SOFT : PAPER }}>
                      <div style={{ flex: 1, padding: "9px 13px", fontSize: T.cap, fontWeight: i === 0 ? 800 : 700, color: INK, ...NUM }}>{row[0]}</div>
                      <div style={{ flex: 1.4, padding: "9px 13px", fontSize: T.cap, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? INK : MUTED, borderLeft: `1px solid ${LINE}` }}>{row[1]}</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 24 }}>Описание</div>
              <p style={{ fontSize: T.sm, color: SUB, lineHeight: 1.65, marginTop: 8 }}>{selected.desc}</p>
              <div className="flex" style={{ gap: 8, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
                <span style={{ fontSize: T.cap, color: MUTED, fontWeight: 700, minWidth: 86 }}>Состав</span>
                <span style={{ fontSize: T.cap, color: INK, fontWeight: 600 }}>{selected.material}</span>
              </div>

              {/* trust */}
              <div style={{ marginTop: 16, background: SOFT, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 11 }}>
                <div className="flex items-center" style={{ gap: 11 }}>
                  <ShieldCheck size={IC.md} color={INK} strokeWidth={SW} aria-hidden="true" />
                  <span style={{ fontSize: T.sm, color: INK, fontWeight: 600 }}>Оригинал · гарантия бренда</span>
                </div>
                <div className="flex items-center" style={{ gap: 11 }}>
                  <Truck size={IC.md} color={INK} strokeWidth={SW} aria-hidden="true" />
                  <span style={{ fontSize: T.sm, color: INK, fontWeight: 600 }}>Бесплатная доставка от {rub(FREE_SHIP)}</span>
                </div>
              </div>
            </div>

            {/* styled with */}
            <div style={{ marginTop: 30 }}>
              <h2 style={{ ...disp(T.h2), padding: "0 20px", marginBottom: 14 }}>Носят с этим</h2>
              <div className="overflow-x-auto scrollbar-hide vt-strip">
                <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
                  {similar.map((p, i) => (
                    <ProductCard key={p.id} p={p} idx={i} w={150} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
                      onOpen={() => setSelected(p)} onAdd={() => addToCart(p.id, defaultSize(p))} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ height: 20 }} />
          </div>

          {/* sticky add bar */}
          <div style={{ flexShrink: 0, background: PAPER, borderTop: `1px solid ${LINE}`, padding: "12px 20px max(16px, env(safe-area-inset-bottom))" }}>
            <button type="button" onClick={() => { addToCart(selected.id, size); setSelected(null); }}
              className="flex items-center justify-between active:scale-[0.98] transition-transform"
              style={{ width: "100%", height: 56, background: INK, color: PAPER, padding: "0 22px" }}>
              <span style={{ fontSize: T.body, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.04em" }}>В корзину · {size}</span>
              <span style={{ fontSize: T.body, fontWeight: 800, ...NUM }}>{rub(selected.price)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------- FAVORITES --------------- */
  const favClose = useRef<HTMLButtonElement>(null);
  const favDialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showFavs) { const t = setTimeout(() => favClose.current?.focus(), 60); return () => clearTimeout(t); }
  }, [showFavs]);

  const Favorites = showFavs && (
    <div className="vanta">
      <div ref={favDialog} className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER }}
        role="dialog" aria-modal="true" aria-label="Избранное"
        onKeyDown={(e) => { if (e.key === "Escape") setShowFavs(false); trapTab(e, favDialog.current); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "vtSheet .34s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="sticky top-0 flex items-center" style={{ gap: 8, padding: "12px 20px", background: PAPER }}>
            <button type="button" ref={favClose} onClick={() => setShowFavs(false)} aria-label="Закрыть"
              className="flex items-center justify-center active:scale-90 transition-transform" style={{ width: 44, height: 44, marginLeft: -10 }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={disp(T.h2)}>Избранное</h1>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, paddingBottom: 24 }}>
            {favProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: "80px 32px", color: MUTED }}>
                <Heart size={IC.lg} strokeWidth={1.5} aria-hidden="true" />
                <div style={{ marginTop: 14, fontSize: T.body, fontWeight: 800, fontStyle: "italic", color: INK }}>Пусто</div>
                <div style={{ marginTop: 4, fontSize: T.sm }}>Отмечайте вещи сердечком</div>
                <button type="button" onClick={() => { setShowFavs(false); onTabChange("catalog"); }}
                  className="active:scale-[0.98] transition-transform"
                  style={{ marginTop: 18, height: 50, padding: "0 26px", background: INK, color: PAPER, fontSize: T.sm, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  В каталог
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 12px", padding: "12px 20px 0" }}>
                {favProducts.map((p, i) => (
                  <ProductCard key={p.id} p={p} idx={i} w="100%" fav onFav={() => toggleFav(p.id)}
                    onOpen={() => { setShowFavs(false); setSelected(p); }} onAdd={() => addToCart(p.id, defaultSize(p))} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="vanta relative" style={{ minHeight: "100%", background: PAPER }}>
      <style>{`
.vanta *:focus-visible{outline:2px solid ${INK};outline-offset:2px}
.vanta .vt-ondark:focus-visible{outline-color:${PAPER}}
.vt-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.vt-strip{scroll-snap-type:x proximity}
@keyframes vtSpin{to{transform:rotate(360deg)}}
.vanta button,.vanta [role=button],.vanta input,.vanta [role=slider]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.vt-shim{background:linear-gradient(100deg,#ececea 28%,#f6f6f4 48%,#ececea 68%);background-size:220% 100%;animation:vtShim 1.2s linear infinite}
@keyframes vtShim{from{background-position:220% 0}to{background-position:-220% 0}}
@keyframes vtUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes vtSheet{from{opacity:0;transform:translateY(42px)}to{opacity:1;transform:none}}
@keyframes vtFade{from{opacity:0}to{opacity:1}}
@keyframes vtPop{0%{transform:scale(1)}40%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes vtFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@media (prefers-reduced-motion: reduce){.vanta *,.vanta *::before,.vanta *::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
`}</style>
      {activeTab === "home" && Home}
      {activeTab === "catalog" && Catalog}
      {activeTab === "cart" && Cart}
      {activeTab === "profile" && Profile}
      {toast && (
        <div className="fixed left-1/2 flex items-center" role="status" aria-live="polite" style={{
          bottom: 128, transform: "translateX(-50%)", gap: 12, zIndex: 10001,
          background: INK, color: PAPER, padding: "13px 16px 13px 18px", fontSize: T.sm, fontWeight: 700, maxWidth: "90vw",
          boxShadow: "0 8px 28px rgba(0,0,0,0.32)",
        }}>
          <span className="flex items-center" style={{ gap: 8 }}>
            <Check size={IC.sm} color={PAPER} strokeWidth={2.6} aria-hidden="true" /> {toast.msg}
          </span>
          {toast.undo && (
            <button type="button" className="vt-ondark" onClick={() => { toast.undo!(); setToast(null); }}
              style={{ color: PAPER, fontWeight: 800, fontStyle: "italic", textTransform: "uppercase", fontSize: T.micro, letterSpacing: "0.05em", padding: "2px 4px", textDecoration: "underline" }}>
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

export default memo(StreetwearStore);
