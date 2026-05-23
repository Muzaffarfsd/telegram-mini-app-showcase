import { useState, useCallback, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import {
  Search, Heart, Plus, Minus, ChevronRight, Star, ArrowLeft, Check,
  ShoppingBag, Truck, ShieldCheck, X, Tag, Info, Sparkles, Layers, Droplet, Gift,
} from "lucide-react";

/* ===================================================================
   Aura — магазин косметики (демо)
   Raleway · UI/UX по ui-ux-pro-max · премиум-уровень 2026
   =================================================================== */

const INK = "var(--ink,#0E0E0E)";
const PAPER = "var(--paper,#FFFFFF)";
const MUTED = "var(--muted,#5E5E63)";
const SUB = "var(--sub,#3A3A3E)";
const LINE = "var(--line,rgba(0,0,0,0.08))";
const SOFT = "var(--soft,#F4F4F2)";
const LIME = "#A3E635";
const LIME_DEEP = "var(--lime-deep,#3C5A0E)";
const ON_LIME = "#1A2E05";
const LIME_TINT = "var(--lime-tint,#EBF7D6)";
const HAIR = "var(--hair,rgba(0,0,0,0.12))";
const WHITE = "#FFFFFF";

/* типошкала в rem — поддержка системного масштабирования текста */
const T = { micro: "0.6875rem", cap: "0.75rem", sm: "0.8125rem", body: "0.875rem", input: "1rem", h3: "1.125rem", h2: "1.375rem", price: "1.625rem" };
const IC = { sm: 16, md: 20, lg: 24 };
const SW = 2;
const FREE_SHIP = 5000;

const IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/";

interface Props {
  activeTab: "home" | "catalog" | "cart" | "profile";
  onTabChange: (tab: string) => void;
  onCartCount?: (n: number) => void;
  onTheme?: (dark: boolean) => void;
}

interface Product {
  id: string;
  brand: string;
  name: string;
  price: number;
  oldPrice?: number;
  stock: number;
  img: string;
  badge?: string;
  cat: string;
  step: string;
  tags: string[];
  rating: number;
  reviews: number;
  desc: string;
  actives: string[];
  benefits: string[];
  howto: string;
}

const CATEGORIES = ["Парфюмерия", "Макияж", "Волосы", "Уход", "Тело", "Аксессуары"];
const ROUTINE = ["Очищение", "Тонизирование", "Сыворотка", "Увлажнение"];

const PRODUCTS: Product[] = [
  {
    id: "p1", brand: "The Ordinary", name: "Тонизирующий раствор с гликолевой кислотой 7%",
    price: 1450, oldPrice: 1990, stock: 5, img: IMG + "hf_20260523_125229_737e9c16-78ab-4814-b8a2-0f6136e2a601_min.webp",
    badge: "ЭКСКЛЮЗИВ", cat: "Уход", step: "Тонизирование", tags: ["normal", "oily", "combo", "tone", "pores", "glow"],
    rating: 4.8, reviews: 214,
    desc: "Отшелушивающий тоник с 7% гликолевой кислоты мягко обновляет кожу, выравнивает тон и возвращает сияние. Идеален для вечернего ухода — убирает тусклость и заметно сглаживает рельеф уже через пару недель.",
    actives: ["Гликолевая кислота 7%", "Экстракт женьшеня", "Алоэ вера"],
    benefits: ["Выравнивает тон и рельеф кожи", "Сужает и очищает поры", "Возвращает здоровое сияние"],
    howto: "Нанесите вечером на очищенную сухую кожу ватным диском, не смывайте. Днём обязательно используйте SPF.",
  },
  {
    id: "p2", brand: "The Ordinary", name: "Сыворотка Ниацинамид 10% + Цинк 1%",
    price: 1450, stock: 40, img: IMG + "hf_20260523_125233_9a9ba915-50a3-43d2-9144-19a9ad5dbb8f_min.webp",
    cat: "Уход", step: "Сыворотка", tags: ["oily", "combo", "sensitive", "pores", "tone"],
    rating: 4.7, reviews: 188,
    desc: "Концентрированная сыворотка с ниацинамидом и цинком регулирует выработку себума и сокращает видимость пор. Успокаивает кожу, склонную к высыпаниям, и укрепляет защитный барьер.",
    actives: ["Ниацинамид 10%", "Цинк PCA 1%"],
    benefits: ["Контролирует жирный блеск", "Сокращает поры", "Снимает покраснения"],
    howto: "Нанесите несколько капель на очищенную кожу утром и вечером до нанесения крема.",
  },
  {
    id: "p3", brand: "COSRX", name: "Лёгкий крем-ампула с прополисом",
    price: 2890, stock: 23, img: IMG + "hf_20260523_125236_dbefbbc6-4941-4fae-9c64-f4c2f63f8f51_min.webp",
    cat: "Уход", step: "Увлажнение", tags: ["dry", "normal", "sensitive", "hydration", "glow"],
    rating: 4.9, reviews: 327,
    desc: "Лёгкий питательный крем на основе экстракта прополиса глубоко увлажняет и восстанавливает уставшую кожу. Тает при нанесении, не оставляя липкости, и дарит мягкое здоровое сияние.",
    actives: ["Экстракт прополиса 72,6%", "Маточное молочко", "Бетаин"],
    benefits: ["Интенсивно питает кожу", "Восстанавливает барьер", "Придаёт сияние"],
    howto: "Нанесите на завершающем этапе ухода утром и вечером лёгкими массирующими движениями.",
  },
  {
    id: "p4", brand: "Murad", name: "Ночной крем с ретинолом",
    price: 7900, oldPrice: 9900, stock: 12, img: IMG + "hf_20260523_125240_9909cda6-c7df-4efa-80d6-832726cbf0d3_min.webp",
    badge: "ХИТ ПРОДАЖ", cat: "Уход", step: "Увлажнение", tags: ["normal", "combo", "dry", "aging", "tone"],
    rating: 4.9, reviews: 461,
    desc: "Антивозрастной ночной крем с тремя формами ретинола работает, пока вы спите: разглаживает морщины, повышает упругость и обновляет кожу к утру. Видимый результат — уже через две недели.",
    actives: ["Ретинол (3 формы)", "Пептиды", "Гиалуроновая кислота"],
    benefits: ["Разглаживает морщины", "Повышает упругость", "Обновляет кожу за ночь"],
    howto: "Нанесите вечером на очищенную кожу. Средство только для ночного ухода — днём используйте SPF.",
  },
  {
    id: "p5", brand: "CeraVe", name: "Увлажняющий гель для умывания",
    price: 1290, stock: 60, img: IMG + "hf_20260523_125251_58f65cbe-dda7-4e2f-8b23-b72f7350fcbb_min.webp",
    cat: "Тело", step: "Очищение", tags: ["dry", "normal", "oily", "combo", "sensitive", "sensitivity"],
    rating: 4.6, reviews: 132,
    desc: "Мягкий очищающий гель деликатно удаляет загрязнения и излишки себума, не нарушая защитный барьер. Три незаменимых керамида сохраняют кожу увлажнённой и комфортной после умывания.",
    actives: ["3 керамида", "Гиалуроновая кислота", "Ниацинамид"],
    benefits: ["Бережно очищает кожу", "Не сушит и не стягивает", "Сохраняет защитный барьер"],
    howto: "Вспеньте небольшое количество с тёплой водой, помассируйте кожу и смойте. Утром и вечером.",
  },
  {
    id: "p6", brand: "Beauty of Joseon", name: "Сыворотка-сияние с прополисом и ниацинамидом",
    price: 1690, oldPrice: 1990, stock: 8, img: IMG + "hf_20260523_125254_510f8dd7-de7e-4e87-8cfc-720976d10be2_min.webp",
    badge: "НОВИНКА", cat: "Уход", step: "Сыворотка", tags: ["dry", "normal", "oily", "combo", "sensitive", "glow", "tone", "hydration"],
    rating: 4.8, reviews: 256,
    desc: "Сыворотка с прополисом и ниацинамидом возвращает коже свежесть и ровный тон. Питает, увлажняет и придаёт здоровое сияние без ощущения плёнки — идеальный финал утреннего ухода.",
    actives: ["Экстракт прополиса 60%", "Ниацинамид 2%"],
    benefits: ["Дарит естественное сияние", "Выравнивает тон кожи", "Лёгкое увлажнение"],
    howto: "Нанесите на очищенную кожу утром и вечером перед кремом, распределите похлопывающими движениями.",
  },
  {
    id: "p7", brand: "iUNIK", name: "Ампульная маска с зелёным прополисом",
    price: 3990, stock: 3, img: IMG + "hf_20260523_125258_8e7fd126-363b-4fd2-9013-fdf360649c08_min.webp",
    cat: "Уход", step: "Увлажнение", tags: ["dry", "sensitive", "sensitivity", "hydration", "glow"],
    rating: 4.7, reviews: 96,
    desc: "Насыщенная ампульная маска с зелёным прополисом интенсивно успокаивает и восстанавливает кожу после стресса. Снимает раздражение и возвращает ощущение комфорта за один сеанс.",
    actives: ["Зелёный прополис", "Масло чайного дерева", "Бета-глюкан"],
    benefits: ["Успокаивает раздражение", "Глубоко питает кожу", "Восстанавливает за ночь"],
    howto: "Нанесите плотным слоем на 15–20 минут, остатки вбейте в кожу. Используйте 2–3 раза в неделю.",
  },
  {
    id: "p8", brand: "Vichy", name: "Гиалуроновый минеральный бустер 89",
    price: 2690, stock: 31, img: IMG + "hf_20260523_125932_4384bfc2-0802-49a4-a059-a96c5e7f9c72_min.webp",
    cat: "Уход", step: "Сыворотка", tags: ["dry", "normal", "sensitive", "hydration", "dryness"],
    rating: 4.8, reviews: 174,
    desc: "Ежедневный гиалуроновый бустер с термальной водой Vichy укрепляет кожу и наполняет её влагой. Усиливает естественную защиту и делает кожу более плотной, упругой и сияющей.",
    actives: ["Гиалуроновая кислота", "Термальная вода Vichy 89%"],
    benefits: ["Глубокое увлажнение", "Укрепляет кожу", "Повышает упругость"],
    howto: "Нанесите на очищенную кожу утром и вечером перед остальными средствами ухода.",
  },
  {
    id: "p9", brand: "Laneige", name: "Ночная увлажняющая маска для сна",
    price: 3290, oldPrice: 3990, stock: 17, img: IMG + "hf_20260523_125315_d05185c0-4d0c-4679-99da-c84e4577531c_min.webp",
    badge: "НОВИНКА", cat: "Уход", step: "Увлажнение", tags: ["dry", "normal", "hydration", "dryness", "glow"],
    rating: 4.9, reviews: 388,
    desc: "Увлажняющая ночная маска обволакивает кожу тонкой вуалью и работает до самого утра. Восстанавливает уровень влаги, и кожа просыпается отдохнувшей, мягкой и сияющей.",
    actives: ["Минеральная вода Hydro Ionized", "Экстракт черники", "Бета-глюкан"],
    benefits: ["Увлажняет всю ночь", "Освежает уставшую кожу", "Дарит утреннее сияние"],
    howto: "Нанесите тонким слоем как финальный шаг вечернего ухода. Утром смойте тёплой водой.",
  },
  {
    id: "p10", brand: "Aura Lab", name: "Термальный восстанавливающий гель",
    price: 2190, stock: 44, img: IMG + "hf_20260523_125319_47b72e40-bf4e-4fc1-bc2c-b3b811e4bdfa_min.webp",
    cat: "Тело", step: "Увлажнение", tags: ["sensitive", "normal", "sensitivity", "hydration", "dryness"],
    rating: 4.6, reviews: 71,
    desc: "Лёгкий гель с термальным комплексом мгновенно охлаждает, успокаивает и насыщает кожу влагой. Идеален после солнца и косметологических процедур — снимает стянутость и возвращает комфорт.",
    actives: ["Термальный минеральный комплекс", "Алоэ вера", "Пантенол"],
    benefits: ["Мгновенно успокаивает", "Глубоко увлажняет", "Снимает стянутость"],
    howto: "Нанесите на чистую кожу по мере необходимости. Подходит для лица и тела.",
  },
];

const BANNERS = [
  { kicker: "Обновление кожи", title: "Скидки до 40% на хиты ухода", cta: "К покупкам",
    img: IMG + "hf_20260523_125330_45da8ca2-6d28-4d24-a5f3-8e072c82a44c_min.webp" },
  { kicker: "Murad", title: "Ночной крем с ретинолом — −20%", cta: "Купить",
    img: IMG + "hf_20260523_125326_9a724972-fa7c-4a6c-bc40-f006ba82206b_min.webp" },
  { kicker: "Новинки недели", title: "Свежая корейская косметика", cta: "Смотреть",
    img: IMG + "hf_20260523_125334_678cadf8-6a6e-4f16-941b-ce41570fee6b_min.webp" },
];

const BLOG = [
  { tag: "В тренде", title: "Этот аромат пробуждает воспоминания — так говорят в TikTok", img: IMG + "hf_20260523_125323_bea83fbe-a87e-4f80-856e-63acbd621188_min.webp" },
  { tag: "Эксперт", title: "Как небольшой крем восстанавливает барьер кожи", img: IMG + "hf_20260523_125326_9a724972-fa7c-4a6c-bc40-f006ba82206b_min.webp" },
  { tag: "Гайд", title: "Вечерний уход из 5 шагов, который действительно работает", img: IMG + "hf_20260523_125330_45da8ca2-6d28-4d24-a5f3-8e072c82a44c_min.webp" },
];

const REVIEWS = [
  { name: "Анна К.", rating: 5, date: "12 мая", text: "Кожа стала заметно ровнее уже через две недели. Текстура лёгкая, не липнет — теперь это мой постоянный уход." },
  { name: "Марина Д.", rating: 5, date: "6 мая", text: "Очень довольна! Запах приятный, расход экономичный. Заказываю уже второй раз." },
  { name: "Ольга В.", rating: 4, date: "28 апреля", text: "Хороший результат, коже комфортно. Сняла звезду только за упаковку — хотелось бы дозатор поудобнее." },
];

const POPULAR = ["Сыворотка", "Крем", "Ретинол", "Прополис", "Очищение", "Увлажнение"];

const PAY = [
  { id: "apple", label: "Apple Pay" },
  { id: "card", label: "Банковская карта" },
  { id: "sbp", label: "СБП" },
];
const DELIVERY = [
  { id: "courier", label: "Курьер", sub: "1–2 дня", price: 0 },
  { id: "pickup", label: "Пункт выдачи", sub: "2–3 дня", price: 0 },
  { id: "post", label: "Почта России", sub: "5–7 дней", price: 300 },
];

/* квиз подбора ухода */
const QUIZ: { q: string; key: "skin" | "concern" | "budget"; opts: { label: string; v: string }[] }[] = [
  {
    q: "Какой у вас тип кожи?", key: "skin", opts: [
      { label: "Сухая", v: "dry" }, { label: "Нормальная", v: "normal" },
      { label: "Жирная", v: "oily" }, { label: "Комбинированная", v: "combo" },
      { label: "Чувствительная", v: "sensitive" },
    ],
  },
  {
    q: "Что хотите улучшить в первую очередь?", key: "concern", opts: [
      { label: "Тон и сияние", v: "tone glow" },
      { label: "Поры и жирный блеск", v: "pores" },
      { label: "Морщины и упругость", v: "aging" },
      { label: "Сухость и увлажнение", v: "dryness hydration" },
      { label: "Чувствительность и раздражение", v: "sensitivity" },
    ],
  },
  {
    q: "Какой бюджет на средство?", key: "budget", opts: [
      { label: "До 2000 ₽", v: "2000" },
      { label: "2000–4000 ₽", v: "4000" },
      { label: "Без ограничений", v: "999999" },
    ],
  },
];

/* объяснения активных компонентов */
const INGREDIENTS: [string, string][] = [
  ["гликолев", "AHA-кислота, которая мягко отшелушивает верхний слой кожи, выравнивает тон и стимулирует обновление клеток."],
  ["ниацинамид", "Витамин B3: сужает поры, выравнивает тон, снимает покраснения и укрепляет защитный барьер кожи."],
  ["цинк", "Регулирует выработку себума и помогает коже, склонной к высыпаниям, оставаться чистой."],
  ["прополис", "Природный компонент корейского ухода: питает, успокаивает и обладает антибактериальным действием."],
  ["ретинол", "Витамин A — золотой стандарт антивозрастного ухода: разглаживает морщины и ускоряет обновление кожи."],
  ["пептид", "Короткие цепочки аминокислот, которые стимулируют выработку коллагена и повышают упругость кожи."],
  ["гиалурон", "Удерживает влагу в коже, делая её плотной, упругой и заметно более увлажнённой."],
  ["керамид", "Липиды, которые восстанавливают и укрепляют естественный защитный барьер кожи."],
  ["пантенол", "Провитамин B5: глубоко увлажняет, успокаивает раздражение и ускоряет восстановление."],
  ["алоэ", "Увлажняет, охлаждает и снимает раздражение — мягкий уход для чувствительной кожи."],
  ["женьшен", "Тонизирует кожу, улучшает микроциркуляцию и придаёт здоровое сияние."],
  ["термальн", "Минеральная вода насыщает кожу микроэлементами и усиливает её естественную защиту."],
  ["бета-глюкан", "Глубоко увлажняет, успокаивает и поддерживает восстановление кожи."],
  ["чайн", "Масло чайного дерева — антибактериальный компонент для кожи, склонной к воспалениям."],
  ["бетаин", "Мягкий увлажняющий компонент, который смягчает кожу и снижает раздражение."],
  ["молочк", "Маточное молочко богато питательными веществами, восстанавливает и оживляет уставшую кожу."],
  ["черник", "Антиоксидант, защищающий кожу от свободных радикалов и внешних воздействий."],
];
const explain = (a: string) => {
  const low = a.toLowerCase();
  const hit = INGREDIENTS.find(([k]) => low.includes(k));
  return hit ? hit[1] : "Активный компонент формулы, подобранный для эффективности и безопасности ухода.";
};

const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const NUM = { fontVariantNumeric: "tabular-nums" as const };
const pct = (p: Product) => p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

const plural = (n: number, forms: [string, string, string]) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return forms[1];
  return forms[2];
};
const distFor = (r: number): number[] => {
  if (r >= 4.85) return [88, 9, 2, 1, 0];
  if (r >= 4.75) return [80, 14, 4, 1, 1];
  if (r >= 4.65) return [72, 19, 6, 2, 1];
  return [64, 24, 8, 3, 1];
};

/* алгоритм подбора по ответам квиза */
const recommend = (ans: { skin?: string; concern?: string; budget?: string }): Product[] => {
  const cap = Number(ans.budget || 999999);
  const concernTags = (ans.concern || "").split(" ").filter(Boolean);
  return PRODUCTS
    .filter((p) => p.price <= cap)
    .map((p) => {
      let s = 0;
      if (ans.skin && p.tags.includes(ans.skin)) s += 1;
      concernTags.forEach((t) => { if (p.tags.includes(t)) s += 2; });
      s += p.rating - 4.5;
      return { p, s };
    })
    .sort((a, b) => b.s - a.s)
    .slice(0, 4)
    .map((x) => x.p);
};

/* --- изображение со скелетон-загрузкой --- */
function Img({ src, alt, r = 0, cover = true }: { src: string; alt: string; r?: number; cover?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: r, background: SOFT }}>
      {!loaded && <div className="aura-shim absolute inset-0" style={{ borderRadius: r }} aria-hidden="true" />}
      <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={() => setLoaded(true)}
        className="w-full h-full"
        style={{ objectFit: cover ? "cover" : "contain", display: "block", borderRadius: r, opacity: loaded ? 1 : 0, transition: "opacity .35s ease-out" }} />
    </div>
  );
}

function Rating({ value, reviews, compact }: { value: number; reviews: number; compact?: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: 4 }}>
      <Star size={compact ? 13 : 15} fill={LIME} color={LIME} strokeWidth={0} aria-hidden="true" />
      <span style={{ fontSize: compact ? T.cap : T.sm, fontWeight: 700, color: INK, ...NUM }}>{value.toFixed(1)}</span>
      <span style={{ fontSize: compact ? T.cap : T.sm, color: MUTED }}>
        {compact ? `(${reviews})` : `· ${reviews} ${plural(reviews, ["отзыв", "отзыва", "отзывов"])}`}
      </span>
    </div>
  );
}

function Label({ children, mt = 22 }: { children: React.ReactNode; mt?: number }) {
  return (
    <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, marginTop: mt, letterSpacing: "0.04em" }}>
      {children}
    </div>
  );
}

/* --- карточка товара --- */
const ProductCard = memo(function ProductCard({ p, fav, onFav, onOpen, onAdd, w, idx = 0 }: {
  p: Product; fav: boolean; onFav: () => void; onOpen: () => void; onAdd: () => void; w?: number | string; idx?: number;
}) {
  const d = pct(p);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${p.brand} ${p.name}, ${rub(p.price)}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="flex-shrink-0 cursor-pointer active:scale-[0.98] transition-transform"
      style={{ width: w ?? 168, animation: "auraUp .42s ease-out both", animationDelay: `${Math.min(idx, 9) * 0.04}s` }}
    >
      <div className="relative" style={{ aspectRatio: "1 / 1.04", borderRadius: 20, background: SOFT, padding: 8 }}>
        <Img src={p.img} alt={p.name} r={13} />
        {p.badge && (
          <span className="absolute" style={{
            top: 10, left: 10, background: INK, color: PAPER, fontSize: T.micro, fontWeight: 700,
            letterSpacing: "0.04em", padding: "5px 9px", borderRadius: 999,
          }}>{p.badge}</span>
        )}
        {d > 0 && (
          <span className="absolute flex items-center" style={{
            bottom: 10, left: 10, background: LIME, color: ON_LIME, fontSize: T.micro, fontWeight: 800,
            padding: "5px 9px", borderRadius: 999,
          }}>−{d}%</span>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label={fav ? `Убрать ${p.name} из избранного` : `Добавить ${p.name} в избранное`}
          aria-pressed={fav}
          className="absolute flex items-center justify-center active:scale-90 transition-transform"
          style={{ top: 0, right: 0, width: 44, height: 44, borderRadius: 999, background: "transparent" }}>
          <span className="flex items-center justify-center" style={{
            width: 36, height: 36, borderRadius: 999, background: PAPER, boxShadow: "0 2px 8px rgba(0,0,0,0.14)",
          }}>
            <Heart key={fav ? "on" : "off"} size={IC.sm} strokeWidth={2.2}
              fill={fav ? LIME : "none"} color={fav ? LIME_DEEP : INK}
              style={fav ? { animation: "auraPop .36s ease-out" } : undefined} />
          </span>
        </button>
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 600, letterSpacing: "0.01em" }}>{p.brand}</div>
        <div style={{
          fontSize: T.sm, color: INK, fontWeight: 600, lineHeight: 1.34, marginTop: 3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.3em",
        }}>{p.name}</div>
        <div style={{ marginTop: 6 }}>
          <Rating value={p.rating} reviews={p.reviews} compact />
        </div>
        <div className="flex items-center justify-between" style={{ marginTop: 10 }}>
          <div className="flex items-center" style={{ gap: 7 }}>
            <span style={{ background: LIME, color: ON_LIME, fontSize: T.sm, fontWeight: 700, padding: "8px 12px", borderRadius: 999, ...NUM }}>
              {rub(p.price)}
            </span>
            {p.oldPrice && (
              <span style={{ fontSize: T.cap, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(p.oldPrice)}</span>
            )}
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onAdd(); }}
            aria-label={`Добавить ${p.name} в корзину`}
            className="flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            style={{ width: 44, height: 44, borderRadius: 999, background: INK }}>
            <Plus size={IC.md} strokeWidth={2.4} color={PAPER} />
          </button>
        </div>
      </div>
    </div>
  );
});

function SectionHead({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "0 20px", marginBottom: 12 }}>
      <h2 style={{ fontSize: T.h3, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>{title}</h2>
      {onSeeAll && (
        <button type="button" onClick={onSeeAll} className="flex items-center active:opacity-60"
          style={{ fontSize: T.sm, color: MUTED, fontWeight: 600, gap: 2, padding: "11px 0 11px 12px", minHeight: 44 }}>
          Все <ChevronRight size={IC.sm} strokeWidth={SW} />
        </button>
      )}
    </div>
  );
}

function Steps({ active }: { active: 1 | 2 | 3 }) {
  const labels = ["Корзина", "Оформление", "Готово"];
  return (
    <div style={{ padding: "4px 20px 8px" }}>
      <div className="flex" style={{ gap: 6 }}>
        {[1, 2, 3].map((n) => (
          <div key={n} style={{ flex: 1, height: 4, borderRadius: 999, background: n <= active ? INK : LINE, transition: "background .25s" }} />
        ))}
      </div>
      <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 600, marginTop: 7, letterSpacing: "0.03em" }}>
        Шаг {active} из 3 · {labels[active - 1]}
      </div>
    </div>
  );
}

/* =================== основной компонент =================== */
function SkincareStore({ activeTab, onTabChange, onCartCount, onTheme }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set(["p4", "p6"]));
  const [cart, setCart] = useState<{ id: string; qty: number; size: string }[]>([
    { id: "p7", qty: 1, size: "50 мл" },
    { id: "p3", qty: 1, size: "100 мл" },
  ]);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [showFavs, setShowFavs] = useState(false);
  const [ingredient, setIngredient] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* квиз */
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAns, setQuizAns] = useState<{ skin?: string; concern?: string; budget?: string }>({});
  /* конструктор рутины */
  const [routineOpen, setRoutineOpen] = useState(false);
  const [routineStep, setRoutineStep] = useState(0);
  const [routinePicks, setRoutinePicks] = useState<Record<string, string>>({});
  const [diaryOpen, setDiaryOpen] = useState(false);
  const [diaryMood, setDiaryMood] = useState<string | null>(null);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [dark, setDark] = useState<boolean>(() => { try { const tg = (window as any).Telegram?.WebApp; if (tg && tg.colorScheme) return tg.colorScheme === "dark"; return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; } catch { return false; } });
  useEffect(() => { onTheme?.(dark); }, [dark, onTheme]);

  const fire = useCallback((msg: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), undo ? 4800 : 1900);
  }, []);

  const toggleFav = useCallback((id: string) => {
    setFavs((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const addToCart = useCallback((id: string, size = "50 мл", qty = 1) => {
    setCart((c) => {
      const ex = c.find((i) => i.id === id && i.size === size);
      if (ex) return c.map((i) => (i === ex ? { ...i, qty: i.qty + qty } : i));
      return [...c, { id, qty, size }];
    });
    fire("Добавлено в корзину");
  }, [fire]);

  const addMany = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setCart((c) => {
      let n = [...c];
      ids.forEach((id) => {
        const idx = n.findIndex((i) => i.id === id && i.size === "50 мл");
        if (idx >= 0) n = n.map((it, i) => (i === idx ? { ...it, qty: it.qty + 1 } : it));
        else n = [...n, { id, qty: 1, size: "50 мл" }];
      });
      return n;
    });
  }, []);

  const subtotal = cart.reduce((s, i) => {
    const p = PRODUCTS.find((x) => x.id === i.id); return s + (p ? p.price * i.qty : 0);
  }, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  useEffect(() => { onCartCount?.(cartCount); }, [cartCount, onCartCount]);
  const tgUser: any = (() => { try { return (window as any).Telegram?.WebApp?.initDataUnsafe?.user || null; } catch { return null; } })();
  const userName = String(tgUser?.first_name || tgUser?.username || "Оливия");
  const userHandle = tgUser?.username ? "@" + String(tgUser.username) : "Премиум-аккаунт";

  const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;
  const favProducts = PRODUCTS.filter((p) => favs.has(p.id));

  /* --------------- ГЛАВНАЯ --------------- */
  const Home = (
    <div className="min-h-full" style={{ background: PAPER, paddingBottom: 24 }}>
      <header className="flex items-center justify-between" style={{ padding: "16px 20px" }}>
        <div>
          <div style={{ fontSize: T.sm, color: MUTED, fontWeight: 500 }}>С возвращением,</div>
          <div style={{ fontSize: T.h2, color: INK, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 2 }}>{userName}</div>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          <button type="button" onClick={() => setShowFavs(true)}
            className="relative flex items-center justify-center active:scale-90 transition-transform"
            style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }} aria-label="Избранное">
            <Heart size={IC.md} color={INK} strokeWidth={SW} />
            {favs.size > 0 && (
              <span className="absolute flex items-center justify-center" style={{
                top: 4, right: 4, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 999,
                background: LIME, color: ON_LIME, fontSize: "0.59rem", fontWeight: 800,
              }}>{favs.size}</span>
            )}
          </button>
          <button type="button" onClick={() => onTabChange("catalog")}
            className="flex items-center justify-center active:scale-90 transition-transform"
            style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }} aria-label="Открыть поиск">
            <Search size={IC.md} color={INK} strokeWidth={SW} />
          </button>
        </div>
      </header>

      {/* баннеры с фотографией */}
      <div className="overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}
        onScroll={(e) => {
          const el = e.currentTarget; setBannerIdx(Math.round(el.scrollLeft / (el.clientWidth * 0.84)));
        }}>
        <div className="flex" style={{ gap: 12, padding: "0 20px", width: "max-content" }}>
          {BANNERS.map((b, i) => (
            <div key={i} className="flex-shrink-0 relative overflow-hidden" style={{ width: 300, height: 188, borderRadius: 24 }}>
              <Img src={b.img} alt="" r={24} />
              <div className="absolute inset-0" aria-hidden="true"
                style={{ background: "linear-gradient(120deg, rgba(8,10,6,0.74) 8%, rgba(8,10,6,0.30) 55%, rgba(8,10,6,0.05) 100%)" }} />
              <div className="absolute" style={{ left: 20, top: 20, right: 20 }}>
                <div style={{ fontSize: T.cap, fontWeight: 700, color: "rgba(255,255,255,0.82)", letterSpacing: "0.04em" }}>{b.kicker}</div>
                <div style={{ fontSize: T.h2, fontWeight: 700, color: WHITE, letterSpacing: "-0.03em", lineHeight: 1.16, marginTop: 8, maxWidth: 210 }}>{b.title}</div>
              </div>
              <button type="button" className="absolute flex items-center active:scale-95 transition-transform" style={{
                left: 20, bottom: 18, background: LIME, color: ON_LIME, fontSize: T.sm, fontWeight: 700,
                padding: "0 18px", height: 44, borderRadius: 999,
              }}>{b.cta}</button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center" style={{ gap: 5, marginTop: 12 }} aria-hidden="true">
        {BANNERS.map((_, i) => (
          <div key={i} style={{
            width: i === bannerIdx ? 18 : 5, height: 5, borderRadius: 999,
            background: i === bannerIdx ? INK : HAIR, transition: "width 0.25s ease-out",
          }} />
        ))}
      </div>

      {/* сервисы Aura */}
      <div style={{ padding: "0 20px", marginTop: 26 }}>
        <h2 style={{ fontSize: T.h3, fontWeight: 700, color: INK, letterSpacing: "-0.02em", marginBottom: 12 }}>Сервисы Aura</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { icon: Sparkles, chip: LIME, ink: ON_LIME, bg: LIME_TINT, title: "Подбор ухода", sub: "Тест за 30 секунд",
              fn: () => { setQuizStep(0); setQuizAns({}); setQuizOpen(true); } },
            { icon: Layers, chip: INK, ink: PAPER, bg: SOFT, title: "Соберите рутину", sub: "Шаг за шагом",
              fn: () => { setRoutineStep(0); setRoutinePicks({}); setRoutineOpen(true); } },
            { icon: Droplet, chip: INK, ink: PAPER, bg: SOFT, title: "Дневник кожи", sub: "Уход на сегодня",
              fn: () => { setDiaryMood(null); setDiaryOpen(true); } },
            { icon: Gift, chip: INK, ink: PAPER, bg: LIME_TINT, title: "Бонусы Aura", sub: "2 450 баллов",
              fn: () => setBonusOpen(true) },
          ].map((sv) => {
            const Ic = sv.icon;
            return (
              <button type="button" key={sv.title} onClick={sv.fn}
                className="text-left active:scale-[0.98] transition-transform"
                style={{ background: sv.bg, borderRadius: 20, padding: 16 }}>
                <span className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 999, background: sv.chip }}>
                  <Ic size={IC.md} color={sv.ink} strokeWidth={2.2} />
                </span>
                <div style={{ fontSize: T.body, fontWeight: 700, color: INK, marginTop: 12 }}>{sv.title}</div>
                <div style={{ fontSize: T.cap, color: MUTED, marginTop: 2 }}>{sv.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionHead title="Категории" onSeeAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex" style={{ gap: 8, padding: "0 20px", width: "max-content" }}>
            {CATEGORIES.map((c) => (
              <button type="button" key={c} onClick={() => onTabChange("catalog")}
                className="flex-shrink-0 flex items-center active:scale-95 transition-transform"
                style={{ height: 44, padding: "0 18px", borderRadius: 999, border: `1px solid ${LINE}`, fontSize: T.sm, fontWeight: 600, color: INK, background: PAPER }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionHead title="Новинки" onSeeAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
            {PRODUCTS.slice(0, 6).map((p, i) => (
              <ProductCard key={p.id} p={p} idx={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
                onOpen={() => setSelected(p)} onAdd={() => addToCart(p.id)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionHead title="Рекомендуем вам" onSeeAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
            {PRODUCTS.slice(4).concat(PRODUCTS.slice(0, 2)).map((p, i) => (
              <ProductCard key={p.id + i} p={p} idx={i} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
                onOpen={() => setSelected(p)} onAdd={() => addToCart(p.id)} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <SectionHead title="Блог" />
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
            {BLOG.map((b, i) => (
              <article key={i} className="flex-shrink-0 active:scale-[0.98] transition-transform" style={{ width: 264 }}>
                <div style={{ height: 160, borderRadius: 18, overflow: "hidden" }}>
                  <Img src={b.img} alt={b.title} r={18} />
                </div>
                <div style={{ fontSize: T.micro, color: LIME_DEEP, fontWeight: 700, marginTop: 10, letterSpacing: "0.03em" }}>{b.tag}</div>
                <h3 style={{ fontSize: T.body, fontWeight: 700, color: INK, lineHeight: 1.34, marginTop: 4, letterSpacing: "-0.01em" }}>{b.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------- КАТАЛОГ --------------- */
  const [catFilter, setCatFilter] = useState("Все");
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const q = query.trim().toLowerCase();
  const catProducts = PRODUCTS.filter(
    (p) => (catFilter === "Все" || p.cat === catFilter) &&
           (q === "" || (p.name + " " + p.brand).toLowerCase().includes(q))
  );
  const pickQuery = (term: string) => {
    setQuery(term);
    setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 5));
  };
  const Catalog = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 24 }}>
      <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.03em", padding: "16px 20px 12px" }}>Каталог</h1>
      <div style={{ padding: "0 20px 12px" }}>
        <div className="flex items-center" style={{ gap: 10, background: SOFT, borderRadius: 14, padding: "0 14px", height: 48 }}>
          <Search size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
          <input type="search" inputMode="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти товар или бренд" aria-label="Поиск по каталогу"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: T.input, color: INK, minWidth: 0 }} />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск"
              className="flex items-center justify-center" style={{ fontSize: T.sm, color: MUTED, fontWeight: 600, minWidth: 44, height: 44, marginRight: -8 }}>
              Сброс
            </button>
          )}
        </div>
      </div>

      {query === "" && (
        <div style={{ padding: "0 20px 14px" }}>
          {recent.length > 0 && (
            <>
              <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 8 }}>НЕДАВНИЕ ЗАПРОСЫ</div>
              <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 14 }}>
                {recent.map((t) => (
                  <button type="button" key={t} onClick={() => pickQuery(t)}
                    className="flex items-center active:scale-95"
                    style={{ gap: 6, height: 36, padding: "0 13px", borderRadius: 999, background: SOFT, fontSize: T.cap, fontWeight: 600, color: INK }}>
                    <Search size={12} color={MUTED} strokeWidth={SW} /> {t}
                  </button>
                ))}
              </div>
            </>
          )}
          <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em", marginBottom: 8 }}>ПОПУЛЯРНОЕ</div>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {POPULAR.map((t) => (
              <button type="button" key={t} onClick={() => pickQuery(t)}
                className="flex items-center active:scale-95"
                style={{ height: 36, padding: "0 14px", borderRadius: 999, border: `1px solid ${LINE}`, background: PAPER, fontSize: T.cap, fontWeight: 600, color: INK }}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-hide" style={{ marginBottom: 16 }}>
        <div className="flex" style={{ gap: 8, padding: "0 20px", width: "max-content" }} role="group" aria-label="Фильтр по категориям">
          {["Все", ...CATEGORIES].map((c) => {
            const on = catFilter === c;
            return (
              <button type="button" key={c} onClick={() => setCatFilter(c)} aria-pressed={on}
                className="flex-shrink-0 flex items-center transition-colors active:scale-95"
                style={{
                  height: 44, padding: "0 18px", borderRadius: 999, fontSize: T.sm, fontWeight: 600,
                  background: on ? INK : PAPER, color: on ? PAPER : INK, border: `1px solid ${on ? INK : LINE}`,
                }}>{c}</button>
            );
          })}
        </div>
      </div>

      {catProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: "64px 32px", color: MUTED }}>
          <Search size={IC.lg} strokeWidth={1.6} aria-hidden="true" />
          <div style={{ marginTop: 14, fontSize: T.body, fontWeight: 700, color: INK }}>Ничего не найдено</div>
          <div style={{ marginTop: 4, fontSize: T.sm }}>Попробуйте изменить запрос или категорию</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "0 20px" }}>
          {catProducts.map((p, i) => (
            <ProductCard key={p.id} p={p} idx={i} w="100%" fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
              onOpen={() => setSelected(p)} onAdd={() => addToCart(p.id)} />
          ))}
        </div>
      )}
    </div>
  );

  /* --------------- КОРЗИНА --------------- */
  const [stage, setStage] = useState<"cart" | "checkout" | "done">("cart");
  const [promo, setPromo] = useState("");
  const [promoOK, setPromoOK] = useState(false);
  const [promoErr, setPromoErr] = useState("");
  const [payId, setPayId] = useState("apple");
  const [delivId, setDelivId] = useState("courier");

  const discount = promoOK ? Math.round(subtotal * 0.1) : 0;
  const delivBase = DELIVERY.find((d) => d.id === delivId)!.price;
  const delivPrice = subtotal >= FREE_SHIP ? 0 : delivBase;
  const orderTotal = subtotal - discount + delivPrice;

  const setQty = (idx: number, d: number) =>
    setCart((c) => c.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty + d) } : it)));
  const removeItem = (idx: number) => {
    const removed = cart[idx];
    setCart((c) => c.filter((_, i) => i !== idx));
    fire("Товар удалён из корзины", () => setCart((c) => {
      const n = [...c]; n.splice(Math.min(idx, n.length), 0, removed); return n;
    }));
  };
  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "AURA10") { setPromoOK(true); setPromoErr(""); fire("Промокод применён · −10%"); }
    else { setPromoErr("Промокод не найден. Попробуйте AURA10"); }
  };

  const SummaryRow = ({ label, value, accent }: { label: string; value: string; accent?: string }) => (
    <div className="flex items-center justify-between" style={{ marginTop: 9 }}>
      <span style={{ fontSize: T.sm, color: MUTED, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: T.sm, color: accent || INK, fontWeight: 600, ...NUM }}>{value}</span>
    </div>
  );

  const Cart = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 120 }}>
      {stage === "cart" && (
        <>
          <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.03em", padding: "16px 20px 8px" }}>Корзина</h1>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: "72px 32px", color: MUTED }}>
              <ShoppingBag size={IC.lg} strokeWidth={1.6} aria-hidden="true" />
              <div style={{ marginTop: 14, fontSize: T.body, fontWeight: 700, color: INK }}>Корзина пуста</div>
              <div style={{ marginTop: 4, fontSize: T.sm }}>Добавьте товары из каталога</div>
              <button type="button" onClick={() => onTabChange("catalog")} className="active:scale-[0.98] transition-transform"
                style={{ marginTop: 20, height: 48, padding: "0 28px", borderRadius: 999, background: INK, color: PAPER, fontSize: T.body, fontWeight: 700 }}>
                Перейти в каталог
              </button>
            </div>
          ) : (
            <>
              <Steps active={1} />
              <div style={{ padding: "6px 20px 0" }}>
                <div style={{ background: SOFT, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
                  {subtotal >= FREE_SHIP ? (
                    <div className="flex items-center" style={{ gap: 8, fontSize: T.sm, fontWeight: 600, color: LIME_DEEP }}>
                      <Truck size={IC.sm} strokeWidth={SW} /> Бесплатная доставка подключена
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between" style={{ fontSize: T.sm, marginBottom: 8 }}>
                        <span style={{ color: INK, fontWeight: 600 }}>До бесплатной доставки</span>
                        <span style={{ color: LIME_DEEP, fontWeight: 700, ...NUM }}>{rub(FREE_SHIP - subtotal)}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: HAIR, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, background: LIME, width: `${Math.min(100, (subtotal / FREE_SHIP) * 100)}%`, transition: "width .35s ease-out" }} />
                      </div>
                    </>
                  )}
                </div>

                {cart.map((it, idx) => {
                  const p = productById(it.id);
                  return (
                    <div key={idx} className="flex items-center" style={{ gap: 14, padding: "14px 0", borderBottom: `1px solid ${LINE}` }}>
                      <button type="button" onClick={() => setSelected(p)} aria-label={`Открыть ${p.name}`}
                        style={{ width: 76, height: 76, borderRadius: 14, background: SOFT, padding: 7, flexShrink: 0 }}>
                        <Img src={p.img} alt={p.name} r={9} />
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 600 }}>{p.brand}</div>
                        <div style={{ fontSize: T.sm, fontWeight: 600, color: INK, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</div>
                        <div style={{ fontSize: T.cap, color: MUTED, marginTop: 3 }}>{it.size}</div>
                        <div style={{ fontSize: T.body, fontWeight: 700, color: INK, marginTop: 6, ...NUM }}>{rub(p.price * it.qty)}</div>
                      </div>
                      <div className="flex flex-col items-end" style={{ gap: 8 }}>
                        <button type="button" onClick={() => removeItem(idx)} aria-label={`Удалить ${p.name} из корзины`}
                          className="flex items-center justify-center" style={{ color: MUTED, fontSize: T.cap, fontWeight: 600, height: 32, padding: "0 4px" }}>Удалить</button>
                        <div className="flex items-center" style={{ background: SOFT, borderRadius: 999 }} role="group" aria-label={`Количество: ${p.name}`}>
                          <button type="button" onClick={() => setQty(idx, -1)} aria-label="Уменьшить количество"
                            className="flex items-center justify-center active:scale-90 transition-transform" style={{ width: 44, height: 44, borderRadius: 999 }}>
                            <Minus size={IC.sm} color={it.qty <= 1 ? MUTED : INK} strokeWidth={2.4} />
                          </button>
                          <span style={{ fontSize: T.body, fontWeight: 700, color: INK, minWidth: 22, textAlign: "center", ...NUM }} aria-live="polite">{it.qty}</span>
                          <button type="button" onClick={() => setQty(idx, 1)} aria-label="Увеличить количество"
                            className="flex items-center justify-center active:scale-90 transition-transform" style={{ width: 44, height: 44, borderRadius: 999 }}>
                            <Plus size={IC.sm} color={INK} strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: 16 }}>
                  {promoOK ? (
                    <div className="flex items-center justify-between" style={{ background: LIME_TINT, borderRadius: 12, padding: "12px 14px" }}>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <Tag size={IC.sm} color={LIME_DEEP} strokeWidth={SW} />
                        <span style={{ fontSize: T.sm, fontWeight: 700, color: LIME_DEEP }}>AURA10 · скидка 10%</span>
                      </div>
                      <button type="button" onClick={() => { setPromoOK(false); setPromo(""); }} aria-label="Убрать промокод"
                        className="flex items-center justify-center" style={{ width: 32, height: 32 }}>
                        <X size={IC.sm} color={LIME_DEEP} strokeWidth={SW} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center" style={{ gap: 8 }}>
                        <div className="flex items-center" style={{ flex: 1, background: SOFT, borderRadius: 12, padding: "0 14px", height: 48 }}>
                          <Tag size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
                          <input value={promo} onChange={(e) => { setPromo(e.target.value); setPromoErr(""); }}
                            placeholder="Промокод" aria-label="Промокод"
                            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: T.input, color: INK, marginLeft: 9, minWidth: 0 }} />
                        </div>
                        <button type="button" onClick={applyPromo} className="active:scale-95 transition-transform"
                          style={{ height: 48, padding: "0 18px", borderRadius: 12, background: INK, color: PAPER, fontSize: T.sm, fontWeight: 700 }}>
                          Применить
                        </button>
                      </div>
                      {promoErr && <div role="alert" style={{ fontSize: T.cap, color: "#C0392B", marginTop: 7, fontWeight: 600 }}>{promoErr}</div>}
                    </>
                  )}
                </div>

                <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
                  <SummaryRow label={`Товары · ${cartCount} ${plural(cartCount, ["шт", "шт", "шт"])}`} value={rub(subtotal)} />
                  {discount > 0 && <SummaryRow label="Скидка по промокоду" value={`−${rub(discount)}`} accent={LIME_DEEP} />}
                  <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
                    <span style={{ fontSize: T.body, color: INK, fontWeight: 600 }}>Итого</span>
                    <span style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em", ...NUM }}>{rub(subtotal - discount)}</span>
                  </div>
                </div>

                <button type="button" onClick={() => setStage("checkout")} className="active:scale-[0.98] transition-transform"
                  style={{ width: "100%", marginTop: 16, height: 56, borderRadius: 999, background: INK, color: PAPER, fontSize: T.body, fontWeight: 700 }}>
                  Перейти к оформлению
                </button>
              </div>
            </>
          )}
        </>
      )}

      {stage === "checkout" && (
        <>
          <div className="flex items-center" style={{ gap: 8, padding: "16px 20px 4px" }}>
            <button type="button" onClick={() => setStage("cart")} aria-label="Назад в корзину"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT, marginLeft: -6 }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>Оформление</h1>
          </div>
          <Steps active={2} />
          <div style={{ padding: "6px 20px 0" }}>
            <div className="flex items-center justify-between" style={{ background: SOFT, borderRadius: 14, padding: "14px 16px" }}>
              <div>
                <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em" }}>АДРЕС ДОСТАВКИ</div>
                <div style={{ fontSize: T.sm, color: INK, fontWeight: 600, marginTop: 5 }}>Оливия Беннетт</div>
                <div style={{ fontSize: T.sm, color: MUTED, marginTop: 2 }}>ул. Тверская 12, Москва</div>
              </div>
              <ChevronRight size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
            </div>

            <Label>СПОСОБ ДОСТАВКИ</Label>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Способ доставки">
              {DELIVERY.map((d) => {
                const on = delivId === d.id;
                const free = subtotal >= FREE_SHIP || d.price === 0;
                return (
                  <button type="button" key={d.id} role="radio" aria-checked={on} onClick={() => setDelivId(d.id)}
                    className="flex items-center justify-between active:scale-[0.99] transition-transform"
                    style={{ padding: "13px 15px", borderRadius: 14, border: `1.5px solid ${on ? INK : LINE}`, background: PAPER }}>
                    <div className="flex items-center" style={{ gap: 11 }}>
                      <span className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 999, border: `1.5px solid ${on ? INK : LINE}` }}>
                        {on && <span style={{ width: 10, height: 10, borderRadius: 999, background: INK }} />}
                      </span>
                      <div className="text-left">
                        <div style={{ fontSize: T.sm, fontWeight: 600, color: INK }}>{d.label}</div>
                        <div style={{ fontSize: T.cap, color: MUTED, marginTop: 1 }}>{d.sub}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: T.sm, fontWeight: 700, color: free ? LIME_DEEP : INK, ...NUM }}>{free ? "бесплатно" : rub(d.price)}</span>
                  </button>
                );
              })}
            </div>

            <Label>СПОСОБ ОПЛАТЫ</Label>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }} role="radiogroup" aria-label="Способ оплаты">
              {PAY.map((m) => {
                const on = payId === m.id;
                return (
                  <button type="button" key={m.id} role="radio" aria-checked={on} onClick={() => setPayId(m.id)}
                    className="flex items-center active:scale-[0.99] transition-transform"
                    style={{ gap: 11, padding: "13px 15px", borderRadius: 14, border: `1.5px solid ${on ? INK : LINE}`, background: PAPER }}>
                    <span className="flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: 999, border: `1.5px solid ${on ? INK : LINE}` }}>
                      {on && <span style={{ width: 10, height: 10, borderRadius: 999, background: INK }} />}
                    </span>
                    <span style={{ fontSize: T.sm, fontWeight: 600, color: INK }}>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${LINE}` }}>
              <SummaryRow label={`Товары · ${cartCount} ${plural(cartCount, ["шт", "шт", "шт"])}`} value={rub(subtotal)} />
              {discount > 0 && <SummaryRow label="Скидка по промокоду" value={`−${rub(discount)}`} accent={LIME_DEEP} />}
              <SummaryRow label="Доставка" value={delivPrice === 0 ? "бесплатно" : rub(delivPrice)} accent={delivPrice === 0 ? LIME_DEEP : undefined} />
              <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
                <span style={{ fontSize: T.body, color: INK, fontWeight: 600 }}>Итого к оплате</span>
                <span style={{ fontSize: T.h2, fontWeight: 700, color: INK, ...NUM }}>{rub(orderTotal)}</span>
              </div>
            </div>

            <button type="button" onClick={() => setStage("done")} className="active:scale-[0.98] transition-transform"
              style={{ width: "100%", marginTop: 16, height: 56, borderRadius: 999, background: LIME, color: ON_LIME, fontSize: T.body, fontWeight: 700 }}>
              Подтвердить заказ · {rub(orderTotal)}
            </button>
          </div>
        </>
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "70vh", padding: "0 32px" }}>
          <div className="flex items-center justify-center" style={{ width: 84, height: 84, borderRadius: 999, background: LIME, animation: "auraPop .5s ease-out" }}>
            <Check size={36} color={ON_LIME} strokeWidth={2.6} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, marginTop: 22, letterSpacing: "-0.02em" }}>Спасибо за покупку!</h1>
          <p style={{ fontSize: T.sm, color: MUTED, marginTop: 8, lineHeight: 1.55 }}>
            Заказ оформлен. Трек-номер для отслеживания придёт вам на почту.
          </p>
          <button type="button" onClick={() => { setCart([]); setStage("cart"); setPromoOK(false); setPromo(""); onTabChange("home"); }}
            className="active:scale-[0.98] transition-transform"
            style={{ marginTop: 24, height: 52, padding: "0 40px", borderRadius: 999, background: INK, color: PAPER, fontSize: T.body, fontWeight: 700 }}>
            Готово
          </button>
        </div>
      )}
    </div>
  );

  /* --------------- ПРОФИЛЬ --------------- */
  const Profile = (
    <div style={{ background: PAPER, minHeight: "100%", paddingBottom: 24 }}>
      <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.03em", padding: "16px 20px 16px" }}>Профиль</h1>
      <div className="flex items-center" style={{ gap: 14, padding: "0 20px 20px" }}>
        <div className="flex items-center justify-center" aria-hidden="true"
          style={{ width: 64, height: 64, borderRadius: 999, background: `linear-gradient(135deg, ${LIME}, #6FBF1E)` }}>
          <span style={{ fontSize: T.h2, fontWeight: 700, color: ON_LIME }}>{userName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <div style={{ fontSize: T.h3, fontWeight: 700, color: INK }}>{userName}</div>
          <div style={{ fontSize: T.sm, color: MUTED }}>{userHandle}</div>
        </div>
      </div>
      <div className="flex items-center justify-between" style={{ padding: "0 20px", minHeight: 56, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <span style={{ fontSize: T.body, fontWeight: 600, color: INK }}>Тёмная тема</span>
        <button type="button" role="switch" aria-checked={dark} aria-label="Переключить тёмную тему"
          onClick={() => setDark((d) => !d)}
          className="active:scale-95 transition-transform"
          style={{ position: "relative", width: 48, height: 28, borderRadius: 999, background: dark ? LIME : SOFT, transition: "background .2s", flexShrink: 0 }}>
          <span style={{ position: "absolute", top: 3, left: dark ? 23 : 3, width: 22, height: 22, borderRadius: 999, background: dark ? "#16170F" : "#FFFFFF", boxShadow: "0 1px 4px rgba(0,0,0,0.3)", transition: "left .2s" }} />
        </button>
      </div>
      <nav aria-label="Меню профиля">
        {[
          { r: "Мои заказы", fn: () => onTabChange("home") },
          { r: "Подбор ухода", fn: () => { setQuizStep(0); setQuizAns({}); setQuizOpen(true); } },
          { r: "Избранное", fn: () => setShowFavs(true) },
          { r: "Адреса", fn: () => onTabChange("catalog") },
          { r: "Способы оплаты", fn: () => onTabChange("catalog") },
          { r: "Помощь и поддержка", fn: () => onTabChange("catalog") },
        ].map((row) => (
          <button type="button" key={row.r} onClick={row.fn}
            className="flex items-center justify-between w-full active:bg-black/[0.03]"
            style={{ padding: "0 20px", minHeight: 56, borderBottom: `1px solid ${LINE}` }}>
            <span style={{ fontSize: T.body, fontWeight: 600, color: INK }}>{row.r}</span>
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

  /* --------------- КАРТОЧКА ТОВАРА --------------- */
  const [size, setSize] = useState("50 мл");
  const detailCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selected) { const t = setTimeout(() => detailCloseRef.current?.focus(), 60); return () => clearTimeout(t); }
  }, [selected]);
  const similar = selected ? PRODUCTS.filter((p) => p.id !== selected.id).slice(0, 6) : [];
  const dist = selected ? distFor(selected.rating) : [];

  const Detail = selected && (
    <div className={"aura" + (dark ? " dark" : "")}>
      <div className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER }}
        role="dialog" aria-modal="true" aria-label={selected.name}
        onKeyDown={(e) => { if (e.key === "Escape") setSelected(null); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "auraSheet .34s cubic-bezier(.22,1,.36,1) both" }}>
          <div key={selected.id} className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0 }}>
            <div className="sticky top-0 flex items-center justify-between" style={{ padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px", background: PAPER, zIndex: 3 }}>
              <button type="button" ref={detailCloseRef} onClick={() => setSelected(null)} aria-label="Закрыть карточку товара"
                className="flex items-center justify-center active:scale-90 transition-transform"
                style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }}>
                <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
              </button>
              <button type="button" onClick={() => toggleFav(selected.id)} aria-pressed={favs.has(selected.id)}
                className="flex items-center justify-center active:scale-90 transition-transform"
                style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }}
                aria-label={favs.has(selected.id) ? "Убрать из избранного" : "Добавить в избранное"}>
                <Heart key={favs.has(selected.id) ? "on" : "off"} size={IC.sm}
                  fill={favs.has(selected.id) ? LIME : "none"} color={favs.has(selected.id) ? LIME_DEEP : INK} strokeWidth={2.2}
                  style={favs.has(selected.id) ? { animation: "auraPop .36s ease-out" } : undefined} />
              </button>
            </div>

            <div className="relative" style={{ margin: "4px 20px 0", height: 316, borderRadius: 24, background: SOFT, padding: 20 }}>
              <Img src={selected.img} alt={selected.name} r={16} />
              {pct(selected) > 0 && (
                <span className="absolute flex items-center" style={{
                  top: 14, left: 14, background: LIME, color: ON_LIME, fontSize: T.cap, fontWeight: 800,
                  padding: "6px 11px", borderRadius: 999,
                }}>−{pct(selected)}%</span>
              )}
            </div>

            <div style={{ padding: "20px 20px 0" }}>
              <div style={{ fontSize: T.cap, color: MUTED, fontWeight: 600, letterSpacing: "0.02em" }}>{selected.brand}</div>
              <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em", lineHeight: 1.24, marginTop: 4 }}>{selected.name}</h1>
              <div style={{ marginTop: 10 }}>
                <Rating value={selected.rating} reviews={selected.reviews} />
              </div>
              <div className="flex items-center" style={{ gap: 10, marginTop: 14 }}>
                <span style={{ fontSize: T.price, fontWeight: 700, color: INK, ...NUM }}>{rub(selected.price)}</span>
                {selected.oldPrice && (
                  <span style={{ fontSize: T.body, color: MUTED, textDecoration: "line-through", ...NUM }}>{rub(selected.oldPrice)}</span>
                )}
                {selected.oldPrice && (
                  <span style={{ fontSize: T.cap, fontWeight: 800, color: LIME_DEEP, ...NUM }}>выгода {rub(selected.oldPrice - selected.price)}</span>
                )}
              </div>
              <div className="flex items-center" style={{ gap: 6, marginTop: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: selected.stock <= 6 ? "#E0883A" : "#5AA33C" }} />
                <span style={{ fontSize: T.cap, color: MUTED, fontWeight: 600 }}>
                  {selected.stock <= 6 ? `Осталось ${selected.stock} ${plural(selected.stock, ["штука", "штуки", "штук"])}` : "В наличии"}
                  {" · доставим завтра"}
                </span>
              </div>

              <Label>ОБЪЁМ</Label>
              <div className="flex" style={{ gap: 8, marginTop: 8 }} role="group" aria-label="Выбор объёма">
                {["30 мл", "50 мл", "100 мл"].map((s) => {
                  const on = size === s;
                  return (
                    <button type="button" key={s} onClick={() => setSize(s)} aria-pressed={on}
                      className="flex items-center active:scale-95 transition-transform" style={{
                        height: 44, padding: "0 18px", borderRadius: 999, fontSize: T.sm, fontWeight: 600,
                        background: on ? INK : PAPER, color: on ? PAPER : INK, border: `1px solid ${on ? INK : LINE}`,
                      }}>{s}</button>
                  );
                })}
              </div>

              <Label>ОПИСАНИЕ</Label>
              <p style={{ fontSize: T.sm, color: SUB, lineHeight: 1.62, marginTop: 7 }}>{selected.desc}</p>

              <Label>ПРЕИМУЩЕСТВА</Label>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 11 }}>
                {selected.benefits.map((b) => (
                  <div key={b} className="flex items-center" style={{ gap: 10 }}>
                    <span className="flex items-center justify-center flex-shrink-0" aria-hidden="true"
                      style={{ width: 22, height: 22, borderRadius: 999, background: LIME }}>
                      <Check size={13} color={ON_LIME} strokeWidth={3} />
                    </span>
                    <span style={{ fontSize: T.sm, color: INK, fontWeight: 500 }}>{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center" style={{ gap: 6, marginTop: 22 }}>
                <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em" }}>АКТИВНЫЕ КОМПОНЕНТЫ</div>
                <Info size={13} color={MUTED} strokeWidth={SW} aria-hidden="true" />
              </div>
              <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
                {selected.actives.map((a) => (
                  <button type="button" key={a} onClick={() => setIngredient(a)}
                    className="flex items-center active:scale-95 transition-transform"
                    style={{ gap: 5, background: SOFT, color: INK, fontSize: T.cap, fontWeight: 600, padding: "8px 13px", borderRadius: 999 }}>
                    {a} <Info size={12} color={MUTED} strokeWidth={SW} />
                  </button>
                ))}
              </div>

              <Label>ПРИМЕНЕНИЕ</Label>
              <p style={{ fontSize: T.sm, color: SUB, lineHeight: 1.62, marginTop: 7 }}>{selected.howto}</p>

              <div className="flex items-center justify-between" style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: T.h3, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>Отзывы</h2>
                <span style={{ fontSize: T.sm, color: MUTED, fontWeight: 600 }}>{selected.reviews} {plural(selected.reviews, ["отзыв", "отзыва", "отзывов"])}</span>
              </div>
              <div className="flex items-center" style={{ gap: 16, marginTop: 12, background: SOFT, borderRadius: 16, padding: "14px 16px" }}>
                <div className="flex flex-col items-center" style={{ minWidth: 64 }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: INK, lineHeight: 1, ...NUM }}>{selected.rating.toFixed(1)}</div>
                  <div className="flex" style={{ gap: 2, marginTop: 5 }}>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <Star key={n} size={11} strokeWidth={0}
                        fill={n < Math.round(selected.rating) ? LIME : HAIR}
                        color={n < Math.round(selected.rating) ? LIME : HAIR} />
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                  {dist.map((v, n) => (
                    <div key={n} className="flex items-center" style={{ gap: 8 }}>
                      <span style={{ fontSize: T.micro, color: MUTED, width: 8, ...NUM }}>{5 - n}</span>
                      <div style={{ flex: 1, height: 5, borderRadius: 999, background: HAIR, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, background: LIME, width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {REVIEWS.slice(0, 3).map((rv) => (
                  <div key={rv.name} style={{ border: `1px solid ${LINE}`, borderRadius: 16, padding: "13px 15px" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center" style={{ gap: 9 }}>
                        <span className="flex items-center justify-center" aria-hidden="true"
                          style={{ width: 30, height: 30, borderRadius: 999, background: SOFT, fontSize: T.cap, fontWeight: 700, color: INK }}>
                          {rv.name.charAt(0)}
                        </span>
                        <div>
                          <div style={{ fontSize: T.sm, fontWeight: 700, color: INK }}>{rv.name}</div>
                          <div className="flex" style={{ gap: 1, marginTop: 2 }}>
                            {[0, 1, 2, 3, 4].map((n) => (
                              <Star key={n} size={10} strokeWidth={0}
                                fill={n < rv.rating ? LIME : HAIR}
                                color={n < rv.rating ? LIME : HAIR} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: T.micro, color: MUTED }}>{rv.date}</span>
                    </div>
                    <p style={{ fontSize: T.sm, color: SUB, lineHeight: 1.55, marginTop: 9 }}>{rv.text}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, background: SOFT, borderRadius: 16, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="flex items-center" style={{ gap: 11 }}>
                  <ShieldCheck size={IC.md} color={LIME_DEEP} strokeWidth={SW} aria-hidden="true" />
                  <span style={{ fontSize: T.sm, color: INK, fontWeight: 600 }}>Только оригинальная продукция</span>
                </div>
                <div className="flex items-center" style={{ gap: 11 }}>
                  <Truck size={IC.md} color={LIME_DEEP} strokeWidth={SW} aria-hidden="true" />
                  <span style={{ fontSize: T.sm, color: INK, fontWeight: 600 }}>Доставка 1–2 дня · бесплатно от {rub(FREE_SHIP)}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: T.h3, fontWeight: 700, color: INK, letterSpacing: "-0.02em", padding: "0 20px", marginBottom: 12 }}>
                Похожие товары
              </h2>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
                  {similar.map((p, i) => (
                    <ProductCard key={p.id} p={p} idx={i} w={156} fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
                      onOpen={() => setSelected(p)} onAdd={() => addToCart(p.id)} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ height: 24 }} />
          </div>

          <div style={{ flexShrink: 0, background: PAPER, borderTop: `1px solid ${LINE}`, padding: "12px 20px max(20px, env(safe-area-inset-bottom))" }}>
            <button type="button" onClick={() => { addToCart(selected.id, size); setSelected(null); }}
              className="flex items-center justify-center active:scale-[0.98] transition-transform"
              style={{ width: "100%", height: 56, borderRadius: 999, background: LIME, color: ON_LIME, fontSize: T.body, fontWeight: 700, gap: 6 }}>
              В корзину · <span style={NUM}>{rub(selected.price)}</span>
            </button>
          </div>

          {ingredient && (
            <div className="absolute inset-0 flex flex-col justify-end" style={{ zIndex: 5 }}
              role="dialog" aria-modal="true" aria-label={ingredient}
              onClick={() => setIngredient(null)}
              onKeyDown={(e) => { if (e.key === "Escape") setIngredient(null); }}>
              <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.5)", animation: "auraFade .2s ease-out" }} />
              <div className="relative" onClick={(e) => e.stopPropagation()}
                style={{ background: PAPER, borderRadius: "24px 24px 0 0", padding: "20px 20px max(22px, env(safe-area-inset-bottom))", animation: "auraSheet .3s cubic-bezier(.22,1,.36,1) both" }}>
                <div className="flex items-start justify-between" style={{ gap: 12 }}>
                  <div className="flex items-center" style={{ gap: 9 }}>
                    <span className="flex items-center justify-center flex-shrink-0" style={{ width: 34, height: 34, borderRadius: 999, background: LIME }}>
                      <Info size={IC.sm} color={ON_LIME} strokeWidth={2.4} />
                    </span>
                    <div style={{ fontSize: T.h3, fontWeight: 700, color: INK, lineHeight: 1.25 }}>{ingredient}</div>
                  </div>
                  <button type="button" onClick={() => setIngredient(null)} aria-label="Закрыть"
                    className="flex items-center justify-center flex-shrink-0 active:scale-90" style={{ width: 36, height: 36, borderRadius: 999, background: SOFT }}>
                    <X size={IC.sm} color={INK} strokeWidth={SW} />
                  </button>
                </div>
                <p style={{ fontSize: T.body, color: SUB, lineHeight: 1.6, marginTop: 14 }}>{explain(ingredient)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* --------------- ИЗБРАННОЕ --------------- */
  const favCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (showFavs) { const t = setTimeout(() => favCloseRef.current?.focus(), 60); return () => clearTimeout(t); }
  }, [showFavs]);

  const Favorites = showFavs && (
    <div className={"aura" + (dark ? " dark" : "")}>
      <div className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER }}
        role="dialog" aria-modal="true" aria-label="Избранное"
        onKeyDown={(e) => { if (e.key === "Escape") setShowFavs(false); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "auraSheet .34s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="sticky top-0 flex items-center" style={{ gap: 10, padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px", background: PAPER }}>
            <button type="button" ref={favCloseRef} onClick={() => setShowFavs(false)} aria-label="Закрыть избранное"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>Избранное</h1>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, paddingBottom: 24 }}>
            {favProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: "80px 32px", color: MUTED }}>
                <Heart size={IC.lg} strokeWidth={1.6} aria-hidden="true" />
                <div style={{ marginTop: 14, fontSize: T.body, fontWeight: 700, color: INK }}>В избранном пусто</div>
                <div style={{ marginTop: 4, fontSize: T.sm }}>Нажмите на сердечко у товара, чтобы сохранить его</div>
                <button type="button" onClick={() => { setShowFavs(false); onTabChange("catalog"); }}
                  className="active:scale-[0.98] transition-transform"
                  style={{ marginTop: 20, height: 48, padding: "0 28px", borderRadius: 999, background: INK, color: PAPER, fontSize: T.body, fontWeight: 700 }}>
                  В каталог
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "12px 20px 0" }}>
                {favProducts.map((p, i) => (
                  <ProductCard key={p.id} p={p} idx={i} w="100%" fav onFav={() => toggleFav(p.id)}
                    onOpen={() => { setShowFavs(false); setSelected(p); }} onAdd={() => addToCart(p.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------- ПОДБОР УХОДА (квиз) --------------- */
  const quizResult = quizStep >= QUIZ.length ? recommend(quizAns) : [];
  const Quiz = quizOpen && (
    <div className={"aura" + (dark ? " dark" : "")}>
      <div className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER }}
        role="dialog" aria-modal="true" aria-label="Подбор ухода"
        onKeyDown={(e) => { if (e.key === "Escape") setQuizOpen(false); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "auraSheet .34s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="flex items-center" style={{ gap: 10, padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px" }}>
            <button type="button"
              onClick={() => { if (quizStep > 0) setQuizStep((s) => s - 1); else setQuizOpen(false); }}
              aria-label="Назад"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>Подбор ухода</h1>
            <button type="button" onClick={() => setQuizOpen(false)} aria-label="Закрыть"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT, marginLeft: "auto" }}>
              <X size={IC.md} color={INK} strokeWidth={SW} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, padding: "4px 20px 28px" }}>
            {quizStep < QUIZ.length ? (
              <>
                <div className="flex" style={{ gap: 6, marginBottom: 4 }}>
                  {QUIZ.map((_, n) => (
                    <div key={n} style={{ flex: 1, height: 4, borderRadius: 999, background: n <= quizStep ? INK : LINE, transition: "background .25s" }} />
                  ))}
                </div>
                <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 600, letterSpacing: "0.03em", marginTop: 8 }}>
                  Вопрос {quizStep + 1} из {QUIZ.length}
                </div>
                <h2 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em", lineHeight: 1.25, marginTop: 8 }}>
                  {QUIZ[quizStep].q}
                </h2>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 9 }}>
                  {QUIZ[quizStep].opts.map((o) => {
                    const on = quizAns[QUIZ[quizStep].key] === o.v;
                    return (
                      <button type="button" key={o.v}
                        onClick={() => {
                          setQuizAns((a) => ({ ...a, [QUIZ[quizStep].key]: o.v }));
                          setQuizStep((s) => s + 1);
                        }}
                        className="flex items-center justify-between active:scale-[0.99] transition-transform"
                        style={{ padding: "16px 18px", borderRadius: 16, border: `1.5px solid ${on ? INK : LINE}`, background: on ? SOFT : PAPER }}>
                        <span style={{ fontSize: T.body, fontWeight: 600, color: INK }}>{o.label}</span>
                        <ChevronRight size={IC.sm} color={MUTED} strokeWidth={SW} />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <span className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 999, background: LIME, animation: "auraPop .5s ease-out" }}>
                  <Sparkles size={IC.lg} color={ON_LIME} strokeWidth={2.2} />
                </span>
                <h2 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em", marginTop: 14 }}>Ваш персональный уход</h2>
                <p style={{ fontSize: T.sm, color: MUTED, lineHeight: 1.55, marginTop: 6 }}>
                  Подобрали {quizResult.length} {plural(quizResult.length, ["средство", "средства", "средств"])} под ваш тип кожи и задачи.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
                  {quizResult.map((p, i) => (
                    <ProductCard key={p.id} p={p} idx={i} w="100%" fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
                      onOpen={() => { setQuizOpen(false); setSelected(p); }} onAdd={() => addToCart(p.id)} />
                  ))}
                </div>
                <button type="button"
                  onClick={() => { addMany(quizResult.map((p) => p.id)); setQuizOpen(false); fire("Подборка добавлена в корзину"); }}
                  className="active:scale-[0.98] transition-transform"
                  style={{ width: "100%", marginTop: 20, height: 54, borderRadius: 999, background: LIME, color: ON_LIME, fontSize: T.body, fontWeight: 700 }}>
                  Добавить всё в корзину
                </button>
                <button type="button" onClick={() => { setQuizStep(0); setQuizAns({}); }}
                  className="active:scale-[0.98] transition-transform"
                  style={{ width: "100%", marginTop: 10, height: 50, borderRadius: 999, background: PAPER, color: INK, border: `1px solid ${LINE}`, fontSize: T.body, fontWeight: 700 }}>
                  Пройти заново
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------- КОНСТРУКТОР РУТИНЫ --------------- */
  const routinePicked = ROUTINE.map((st) => routinePicks[st]).filter(Boolean) as string[];
  const routineSum = routinePicked.reduce((s, id) => s + productById(id).price, 0);
  const Routine = routineOpen && (
    <div className={"aura" + (dark ? " dark" : "")}>
      <div className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER }}
        role="dialog" aria-modal="true" aria-label="Конструктор ухода"
        onKeyDown={(e) => { if (e.key === "Escape") setRoutineOpen(false); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "auraSheet .34s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="flex items-center" style={{ gap: 10, padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px" }}>
            <button type="button"
              onClick={() => { if (routineStep > 0) setRoutineStep((s) => s - 1); else setRoutineOpen(false); }}
              aria-label="Назад"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>Соберите уход</h1>
            <button type="button" onClick={() => setRoutineOpen(false)} aria-label="Закрыть"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT, marginLeft: "auto" }}>
              <X size={IC.md} color={INK} strokeWidth={SW} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, padding: "4px 20px 28px" }}>
            <div className="flex" style={{ gap: 6, marginBottom: 4 }}>
              {ROUTINE.concat(["Итог"]).map((_, n) => (
                <div key={n} style={{ flex: 1, height: 4, borderRadius: 999, background: n <= routineStep ? INK : LINE, transition: "background .25s" }} />
              ))}
            </div>

            {routineStep < ROUTINE.length ? (
              <>
                <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 600, letterSpacing: "0.03em", marginTop: 8 }}>
                  Шаг {routineStep + 1} из {ROUTINE.length}
                </div>
                <h2 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em", marginTop: 8 }}>
                  {ROUTINE[routineStep]}
                </h2>
                <p style={{ fontSize: T.sm, color: MUTED, marginTop: 4 }}>Выберите средство для этого шага или пропустите.</p>
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  {PRODUCTS.filter((p) => p.step === ROUTINE[routineStep]).map((p) => {
                    const on = routinePicks[ROUTINE[routineStep]] === p.id;
                    return (
                      <button type="button" key={p.id}
                        onClick={() => {
                          setRoutinePicks((r) => ({ ...r, [ROUTINE[routineStep]]: p.id }));
                          setRoutineStep((s) => s + 1);
                        }}
                        className="flex items-center active:scale-[0.99] transition-transform"
                        style={{ gap: 12, padding: 12, borderRadius: 16, border: `1.5px solid ${on ? INK : LINE}`, background: PAPER, textAlign: "left" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 12, background: SOFT, padding: 6, flexShrink: 0 }}>
                          <Img src={p.img} alt={p.name} r={8} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 600 }}>{p.brand}</div>
                          <div style={{ fontSize: T.sm, fontWeight: 600, color: INK, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</div>
                          <div style={{ fontSize: T.sm, fontWeight: 700, color: INK, marginTop: 4, ...NUM }}>{rub(p.price)}</div>
                        </div>
                        <ChevronRight size={IC.sm} color={MUTED} strokeWidth={SW} />
                      </button>
                    );
                  })}
                  <button type="button"
                    onClick={() => {
                      setRoutinePicks((r) => { const n = { ...r }; delete n[ROUTINE[routineStep]]; return n; });
                      setRoutineStep((s) => s + 1);
                    }}
                    className="flex items-center justify-center active:scale-[0.99] transition-transform"
                    style={{ height: 48, borderRadius: 14, background: SOFT, color: MUTED, fontSize: T.sm, fontWeight: 600 }}>
                    Пропустить этот шаг
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 999, background: LIME, animation: "auraPop .5s ease-out" }}>
                  <Layers size={IC.lg} color={ON_LIME} strokeWidth={2.2} />
                </span>
                <h2 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em", marginTop: 14 }}>Ваш уход готов</h2>
                {routinePicked.length === 0 ? (
                  <p style={{ fontSize: T.sm, color: MUTED, marginTop: 6 }}>Вы не выбрали ни одного средства. Соберите рутину заново.</p>
                ) : (
                  <>
                    <p style={{ fontSize: T.sm, color: MUTED, lineHeight: 1.55, marginTop: 6 }}>
                      {routinePicked.length} {plural(routinePicked.length, ["средство", "средства", "средств"])} в вашей рутине.
                    </p>
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                      {ROUTINE.filter((st) => routinePicks[st]).map((st) => {
                        const p = productById(routinePicks[st]);
                        return (
                          <div key={st} className="flex items-center" style={{ gap: 12 }}>
                            <div style={{ width: 56, height: 56, borderRadius: 12, background: SOFT, padding: 5, flexShrink: 0 }}>
                              <Img src={p.img} alt={p.name} r={8} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: T.micro, color: LIME_DEEP, fontWeight: 700 }}>{st}</div>
                              <div style={{ fontSize: T.sm, fontWeight: 600, color: INK, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</div>
                            </div>
                            <span style={{ fontSize: T.sm, fontWeight: 700, color: INK, ...NUM }}>{rub(p.price)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${LINE}` }}>
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: T.sm, color: MUTED, fontWeight: 500 }}>Сумма набора</span>
                        <span style={{ fontSize: T.sm, color: INK, fontWeight: 600, ...NUM }}>{rub(routineSum)}</span>
                      </div>
                      <div className="flex items-center justify-between" style={{ marginTop: 9 }}>
                        <span style={{ fontSize: T.sm, color: MUTED, fontWeight: 500 }}>Промокод на набор</span>
                        <span style={{ fontSize: T.sm, color: LIME_DEEP, fontWeight: 700 }}>AURA10 · −10%</span>
                      </div>
                    </div>
                    <button type="button"
                      onClick={() => {
                        addMany(routinePicked); setPromoOK(true); setRoutineOpen(false);
                        fire("Набор добавлен · промокод AURA10 применён");
                      }}
                      className="active:scale-[0.98] transition-transform"
                      style={{ width: "100%", marginTop: 18, height: 54, borderRadius: 999, background: LIME, color: ON_LIME, fontSize: T.body, fontWeight: 700 }}>
                      Добавить набор в корзину
                    </button>
                  </>
                )}
                <button type="button" onClick={() => { setRoutineStep(0); setRoutinePicks({}); }}
                  className="active:scale-[0.98] transition-transform"
                  style={{ width: "100%", marginTop: 10, height: 50, borderRadius: 999, background: PAPER, color: INK, border: `1px solid ${LINE}`, fontSize: T.body, fontWeight: 700 }}>
                  Собрать заново
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------- ДНЕВНИК КОЖИ --------------- */
  const DIARY_MOODS = [
    { k: "glow", label: "Сияет", v: "tone glow", note: "Прекрасно! Поддержим сияние лёгким уходом и защитой SPF." },
    { k: "normal", label: "В норме", v: "", note: "Кожа в балансе — закрепим результат бережным ежедневным уходом." },
    { k: "dry", label: "Сухость", v: "dryness hydration", note: "Коже не хватает влаги. Усилим увлажнение и питание барьера." },
    { k: "dull", label: "Тусклость", v: "tone glow", note: "Вернём свежесть — сделаем акцент на сияние и ровный тон." },
    { k: "irritated", label: "Раздражение", v: "sensitivity", note: "Коже нужен покой. Подберём мягкие успокаивающие средства." },
    { k: "oily", label: "Жирный блеск", v: "pores", note: "Поработаем над порами и матовостью в течение дня." },
  ];
  const diaryHit = DIARY_MOODS.find((m) => m.k === diaryMood) || null;
  const diaryRecs = diaryHit ? recommend({ concern: diaryHit.v }) : [];
  const diaryCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (diaryOpen) { const t = setTimeout(() => diaryCloseRef.current?.focus(), 60); return () => clearTimeout(t); }
  }, [diaryOpen]);

  const Diary = diaryOpen && (
    <div className={"aura" + (dark ? " dark" : "")}>
      <div className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER }}
        role="dialog" aria-modal="true" aria-label="Дневник кожи"
        onKeyDown={(e) => { if (e.key === "Escape") setDiaryOpen(false); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "auraSheet .34s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="flex items-center" style={{ gap: 10, padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px" }}>
            <button type="button" ref={diaryCloseRef}
              onClick={() => { if (diaryMood) setDiaryMood(null); else setDiaryOpen(false); }}
              aria-label="Назад"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>Дневник кожи</h1>
            <button type="button" onClick={() => setDiaryOpen(false)} aria-label="Закрыть"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT, marginLeft: "auto" }}>
              <X size={IC.md} color={INK} strokeWidth={SW} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, padding: "4px 20px 28px" }}>
            {!diaryHit ? (
              <>
                <h2 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                  Как ваша кожа сегодня?
                </h2>
                <p style={{ fontSize: T.sm, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>
                  Отметьте состояние — подберём уход именно под него.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
                  {DIARY_MOODS.map((m) => (
                    <button type="button" key={m.k} onClick={() => setDiaryMood(m.k)}
                      className="text-left active:scale-[0.98] transition-transform"
                      style={{ padding: 16, borderRadius: 16, border: `1.5px solid ${LINE}`, background: PAPER }}>
                      <span className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 999, background: SOFT }}>
                        <Droplet size={IC.sm} color={LIME_DEEP} strokeWidth={2.2} />
                      </span>
                      <div style={{ fontSize: T.body, fontWeight: 700, color: INK, marginTop: 10 }}>{m.label}</div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <span className="flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 999, background: LIME, animation: "auraPop .5s ease-out" }}>
                  <Droplet size={IC.lg} color={ON_LIME} strokeWidth={2.2} />
                </span>
                <h2 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em", marginTop: 14 }}>
                  Кожа: {diaryHit.label.toLowerCase()}
                </h2>
                <p style={{ fontSize: T.sm, color: MUTED, lineHeight: 1.55, marginTop: 6 }}>{diaryHit.note}</p>
                <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em", marginTop: 20 }}>УХОД НА СЕГОДНЯ</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 10 }}>
                  {diaryRecs.map((p, i) => (
                    <ProductCard key={p.id} p={p} idx={i} w="100%" fav={favs.has(p.id)} onFav={() => toggleFav(p.id)}
                      onOpen={() => { setDiaryOpen(false); setSelected(p); }} onAdd={() => addToCart(p.id)} />
                  ))}
                </div>
                <button type="button"
                  onClick={() => { addMany(diaryRecs.map((p) => p.id)); setDiaryOpen(false); fire("Уход дня добавлен в корзину"); }}
                  className="active:scale-[0.98] transition-transform"
                  style={{ width: "100%", marginTop: 20, height: 54, borderRadius: 999, background: LIME, color: ON_LIME, fontSize: T.body, fontWeight: 700 }}>
                  Добавить уход дня
                </button>
                <button type="button" onClick={() => setDiaryMood(null)}
                  className="active:scale-[0.98] transition-transform"
                  style={{ width: "100%", marginTop: 10, height: 50, borderRadius: 999, background: PAPER, color: INK, border: `1px solid ${LINE}`, fontSize: T.body, fontWeight: 700 }}>
                  Выбрать другое состояние
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* --------------- БОНУСЫ AURA --------------- */
  const BONUS_PERKS = [
    { icon: Truck, t: "Бесплатная доставка", s: "На все заказы без минимальной суммы" },
    { icon: Sparkles, t: "Ранний доступ к новинкам", s: "За 48 часов до старта продаж" },
    { icon: Gift, t: "Подарок в день рождения", s: "Сюрприз-набор от Aura" },
    { icon: Tag, t: "−15% на любимые бренды", s: "Каждый месяц новая подборка" },
  ];
  const bonusCloseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (bonusOpen) { const t = setTimeout(() => bonusCloseRef.current?.focus(), 60); return () => clearTimeout(t); }
  }, [bonusOpen]);

  const Bonus = bonusOpen && (
    <div className={"aura" + (dark ? " dark" : "")}>
      <div className="fixed inset-0 z-[10000] flex justify-center" style={{ background: PAPER }}
        role="dialog" aria-modal="true" aria-label="Бонусы Aura"
        onKeyDown={(e) => { if (e.key === "Escape") setBonusOpen(false); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "auraSheet .34s cubic-bezier(.22,1,.36,1) both" }}>
          <div className="flex items-center" style={{ gap: 10, padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px" }}>
            <button type="button" ref={bonusCloseRef} onClick={() => setBonusOpen(false)} aria-label="Закрыть"
              className="flex items-center justify-center active:scale-90 transition-transform"
              style={{ width: 44, height: 44, borderRadius: 999, background: SOFT }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <h1 style={{ fontSize: T.h2, fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>Бонусы Aura</h1>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, padding: "8px 20px 28px" }}>
            <div style={{ borderRadius: 24, padding: 20, background: `linear-gradient(135deg, ${LIME}, #6FBF1E)`, color: ON_LIME }}>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: T.sm, fontWeight: 700, letterSpacing: "0.02em" }}>Aura Club · Gold</span>
                <Gift size={IC.md} color={ON_LIME} strokeWidth={2.2} aria-hidden="true" />
              </div>
              <div style={{ fontSize: "2.25rem", fontWeight: 800, marginTop: 18, letterSpacing: "-0.03em", ...NUM }}>2 450</div>
              <div style={{ fontSize: T.cap, fontWeight: 600, opacity: 0.82 }}>бонусных баллов</div>
            </div>
            <div style={{ marginTop: 16, background: SOFT, borderRadius: 16, padding: "14px 16px" }}>
              <div className="flex items-center justify-between" style={{ fontSize: T.sm }}>
                <span style={{ color: INK, fontWeight: 600 }}>До уровня Platinum</span>
                <span style={{ color: LIME_DEEP, fontWeight: 700, ...NUM }}>осталось 550</span>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: HAIR, overflow: "hidden", marginTop: 9 }}>
                <div style={{ height: "100%", borderRadius: 999, background: LIME, width: "82%" }} />
              </div>
            </div>
            <div style={{ fontSize: T.micro, color: MUTED, fontWeight: 700, letterSpacing: "0.04em", marginTop: 22 }}>ВАШИ ПРИВИЛЕГИИ</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {BONUS_PERKS.map((perk) => {
                const Ic = perk.icon;
                return (
                  <div key={perk.t} className="flex items-center" style={{ gap: 12, padding: "13px 14px", borderRadius: 14, border: `1px solid ${LINE}` }}>
                    <span className="flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, borderRadius: 999, background: LIME_TINT }}>
                      <Ic size={IC.sm} color={LIME_DEEP} strokeWidth={2.2} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: T.sm, fontWeight: 700, color: INK }}>{perk.t}</div>
                      <div style={{ fontSize: T.cap, color: MUTED, marginTop: 1 }}>{perk.s}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={() => { setBonusOpen(false); onTabChange("catalog"); }}
              className="active:scale-[0.98] transition-transform"
              style={{ width: "100%", marginTop: 20, height: 54, borderRadius: 999, background: INK, color: PAPER, fontSize: T.body, fontWeight: 700 }}>
              Потратить баллы в каталоге
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={"aura relative" + (dark ? " dark" : "")} style={{ minHeight: "100%", background: PAPER }}>
      <style>{`
.aura{--ink:#0E0E0E;--paper:#FFFFFF;--muted:#5E5E63;--sub:#3A3A3E;--soft:#F4F4F2;--line:rgba(0,0,0,0.08);--lime-deep:#3C5A0E;--lime-tint:#EBF7D6;--hair:rgba(0,0,0,0.12)}
.aura.dark{--ink:#F2F2F0;--paper:#101114;--muted:#9D9DA5;--sub:#C6C6CB;--soft:#1D1E22;--line:rgba(255,255,255,0.12);--lime-deep:#B4E867;--lime-tint:#28341B;--hair:rgba(255,255,255,0.18)}
.aura.dark .aura-shim{background:linear-gradient(100deg,#212329 28%,#2b2d34 48%,#212329 68%);background-size:220% 100%}
.aura *:focus-visible{outline:2px solid ${INK};outline-offset:2px;border-radius:6px}
.aura button,.aura [role=button],.aura input{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.aura-shim{background:linear-gradient(100deg,#ededeb 28%,#f6f6f4 48%,#ededeb 68%);background-size:220% 100%;animation:auraShim 1.25s linear infinite}
@keyframes auraShim{from{background-position:220% 0}to{background-position:-220% 0}}
@keyframes auraUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes auraSheet{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:none}}
@keyframes auraFade{from{opacity:0}to{opacity:1}}
@keyframes auraPop{0%{transform:scale(1)}40%{transform:scale(1.32)}100%{transform:scale(1)}}
@media (prefers-reduced-motion: reduce){.aura *,.aura *::before,.aura *::after{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
`}</style>
      {activeTab === "home" && Home}
      {activeTab === "catalog" && Catalog}
      {activeTab === "cart" && Cart}
      {activeTab === "profile" && Profile}
      {toast && (
        <div className="fixed left-1/2 flex items-center" role="status" aria-live="polite" style={{
          bottom: 128, transform: "translateX(-50%)", gap: 12, zIndex: 10001,
          background: INK, color: PAPER, padding: "12px 16px 12px 18px", borderRadius: 999, fontSize: T.sm, fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.28)", maxWidth: "90vw",
        }}>
          <span className="flex items-center" style={{ gap: 8 }}>
            <Check size={IC.sm} color={LIME} strokeWidth={2.6} aria-hidden="true" /> {toast.msg}
          </span>
          {toast.undo && (
            <button type="button" onClick={() => { toast.undo!(); setToast(null); }}
              style={{ color: LIME, fontWeight: 800, fontSize: T.sm, padding: "2px 4px" }}>
              Вернуть
            </button>
          )}
        </div>
      )}
      {Detail && createPortal(Detail, document.body)}
      {Favorites && createPortal(Favorites, document.body)}
      {Quiz && createPortal(Quiz, document.body)}
      {Routine && createPortal(Routine, document.body)}
      {Diary && createPortal(Diary, document.body)}
      {Bonus && createPortal(Bonus, document.body)}
    </div>
  );
}

export default memo(SkincareStore);
