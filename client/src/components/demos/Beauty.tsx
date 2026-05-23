import { useState, useCallback, useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import {
  Heart, Star, ChevronRight, ArrowLeft, Check, Search, Clock, X,
  Calendar, MapPin, Phone, Sparkles, ShieldCheck, Award, Loader2, Plus,
} from "lucide-react";
import glowspaHeroVideo from "@assets/7c2c6d94385a0badd934f87f658b1f46_1774529512637.mp4";
import glowspaHeroImg from "@assets/glowspa_hero.jpg";

/* ===================================================================
   GLOW — салон красоты и SPA (демо)
   Тёплый editorial-люкс · Cormorant + Inter · ui-ux-pro-max · 2026
   =================================================================== */

const INK = "#26211C";
const PAPER = "#FFFFFF";
const CANVAS = "#F4EFE7";
const SAND = "#EBE3D6";
const TINT = "#EFE7DB";
const MUTED = "#8A8076";
const SUB = "#6A6157";
const ACCENT = "#A37A5B";
const ACCENT_DEEP = "#7E5638";
const LINE = "rgba(38,33,28,0.11)";
const HAIR = "rgba(38,33,28,0.06)";

const SERIF = "'Cormorant Garamond', 'Times New Roman', Georgia, serif";
const SANS = "'Inter', system-ui, -apple-system, sans-serif";

const T = { micro: "0.6875rem", cap: "0.75rem", sm: "0.8125rem", body: "0.9375rem", lg: "1.0625rem" };
const S = { s1: "1.5rem", s2: "2rem", s3: "2.6rem", s4: "3.3rem" };
const IC = { sm: 16, md: 20, lg: 24 };
const SW = 1.7;

const IMG = "https://d8j0ntlcm91z4.cloudfront.net/user_39EkWaVwA7CfpRMWZth7HiaC1oQ/";

interface Props {
  activeTab: "home" | "catalog" | "cart" | "profile";
  onTabChange: (tab: string) => void;
  onCartCount?: (n: number) => void;
}

interface Master {
  id: string; name: string; role: string; exp: number; rating: number; img: string;
}
interface Service {
  id: string; cat: string; name: string; price: number; min: number;
  img: string; rating: number; reviews: number; master: string; badge?: string;
  tagline: string; desc: string; includes: string[];
}

const CATEGORIES = ["Волосы", "Ногти", "Лицо", "Тело", "Взгляд"];

const MASTERS: Master[] = [
  { id: "m1", name: "Алиса Верещагина", role: "Колорист", exp: 9, rating: 4.9, img: IMG + "hf_20260523_180013_135a51fb-c12c-4e12-88ad-8b71f1e99211_min.webp" },
  { id: "m2", name: "Дарья Соколова", role: "Мастер маникюра", exp: 7, rating: 5.0, img: IMG + "hf_20260523_180017_bc22854f-1d7b-4ea4-be6b-bf9bd519e62e_min.webp" },
  { id: "m3", name: "Ирина Левина", role: "Косметолог", exp: 14, rating: 5.0, img: IMG + "hf_20260523_180136_15667207-3b9a-438d-9d0e-c8ba93256cb6_min.webp" },
  { id: "m4", name: "Вероника Адлер", role: "SPA-терапевт", exp: 8, rating: 4.9, img: IMG + "hf_20260523_180140_595b83d7-d58a-4e6f-b94e-6649acc6795e_min.webp" },
  { id: "m5", name: "Камилла Орлова", role: "Стилист-парикмахер", exp: 11, rating: 4.9, img: IMG + "hf_20260523_180144_4e4db7ac-9294-419b-8ee9-29541b843732_min.webp" },
  { id: "m6", name: "София Грей", role: "Лэшмейкер", exp: 6, rating: 4.9, img: IMG + "hf_20260523_180147_8f8e4e4f-bed7-4da7-9089-b533bd1464aa_min.webp" },
];

const SERVICES: Service[] = [
  {
    id: "s1", cat: "Волосы", name: "Женская стрижка", price: 3500, min: 60,
    img: IMG + "hf_20260523_175833_8ab1ad88-ee1c-4355-897a-de81af9c5976_min.webp",
    rating: 4.9, reviews: 320, master: "m5", badge: "Хит",
    tagline: "Форма, которая идёт именно вам",
    desc: "Стрижка начинается с консультации: стилист изучает структуру волос, форму лица и ваш образ жизни, чтобы предложить форму, которую легко поддерживать дома.",
    includes: ["Консультация и анализ волос", "Мытьё и уходовый ритуал", "Стрижка авторской техникой", "Укладка и советы по уходу"],
  },
  {
    id: "s2", cat: "Волосы", name: "Окрашивание Airtouch", price: 9800, min: 240,
    img: IMG + "hf_20260523_175837_685d3250-7ea0-448b-9d32-e33ccda55f4a_min.webp",
    rating: 5.0, reviews: 210, master: "m1", badge: "Хит",
    tagline: "Мягкие переходы и натуральное сияние",
    desc: "Airtouch — техника растяжки цвета с выдуванием коротких волос. Результат — плавные блики без чётких границ, которые красиво отрастают и выглядят естественно.",
    includes: ["Подбор палитры под цветотип", "Airtouch-растяжка цвета", "Тонирование и уход", "Стайлинг и финиш"],
  },
  {
    id: "s3", cat: "Волосы", name: "Балаяж", price: 8500, min: 210,
    img: IMG + "hf_20260523_175840_f97f500f-e356-4818-8b77-a84d436ec284_min.webp",
    rating: 4.9, reviews: 184, master: "m1",
    tagline: "Солнечные блики ручной работы",
    desc: "Балаяж — свободная техника окрашивания от руки. Колорист рисует блики там, где их касался бы солнечный свет, создавая мягкий объём и глубину цвета.",
    includes: ["Эскиз окрашивания", "Ручная техника балаяж", "Тонирование", "Уход и укладка"],
  },
  {
    id: "s4", cat: "Волосы", name: "Вечерняя укладка", price: 2800, min: 50,
    img: IMG + "hf_20260523_175844_ca995d96-8edd-45da-a405-bca1066c494b_min.webp",
    rating: 4.8, reviews: 142, master: "m5",
    tagline: "Готовы к особенному вечеру",
    desc: "Объёмная укладка для события, съёмки или свидания. Стилист подберёт форму и стойкость под ваш образ — локоны, волны или гладкий глянец.",
    includes: ["Подготовка и термозащита", "Укладка выбранной формы", "Фиксация и блеск", "Мелкие штрихи под образ"],
  },
  {
    id: "s5", cat: "Ногти", name: "Маникюр с покрытием", price: 2600, min: 90,
    img: IMG + "hf_20260523_180812_c59ea09a-b6f2-422c-9c48-9caac21fb38f_min.webp",
    rating: 4.9, reviews: 410, master: "m2",
    tagline: "Аккуратность в каждой детали",
    desc: "Комбинированный маникюр с бережной обработкой кутикулы и стойким покрытием. Ногти выглядят ухоженно две-три недели без сколов.",
    includes: ["Гигиеническая обработка", "Придание формы", "Уход за кутикулой", "Покрытие и финиш"],
  },
  {
    id: "s6", cat: "Ногти", name: "Французский маникюр", price: 2900, min: 100,
    img: IMG + "hf_20260523_175852_1f1e6004-82d0-4dcb-8c98-39aee9578684_min.webp",
    rating: 4.9, reviews: 268, master: "m2",
    tagline: "Вечная классика на ваших руках",
    desc: "Деликатная белая линия улыбки на естественной базе. Универсальный выбор, который уместен и в офисе, и на торжестве.",
    includes: ["Подготовка ногтевой пластины", "Моделирование формы", "Френч-линия вручную", "Стойкое покрытие"],
  },
  {
    id: "s7", cat: "Ногти", name: "SPA-педикюр", price: 3800, min: 110,
    img: IMG + "hf_20260523_175856_87f6fa1c-376d-4ed7-9cbc-f66d99d4b018_min.webp",
    rating: 4.8, reviews: 196, master: "m2", badge: "Новое",
    tagline: "100 минут заботы о ваших стопах",
    desc: "Ритуал ухода со SPA-ванночкой на эфирных маслах, мягким пилингом, питательной маской и расслабляющим массажем стоп.",
    includes: ["Тёплая SPA-ванночка", "Пилинг и обработка", "Питательная маска", "Массаж и покрытие"],
  },
  {
    id: "s8", cat: "Лицо", name: "Уходовая косметология", price: 6500, min: 80,
    img: IMG + "hf_20260523_175953_7f80b2eb-13f5-4104-afd1-3713267583c9_min.webp",
    rating: 5.0, reviews: 158, master: "m3", badge: "Хит",
    tagline: "Программа сияния под вашу кожу",
    desc: "Косметолог проводит диагностику и составляет индивидуальную программу: очищение, активные сыворотки и маска, подобранные под состояние кожи.",
    includes: ["Диагностика кожи", "Глубокое очищение", "Активный уход и маска", "Рекомендации по домашнему уходу"],
  },
  {
    id: "s9", cat: "Лицо", name: "Глубокое очищение", price: 4900, min: 75,
    img: IMG + "hf_20260523_175958_24c08f7a-4d16-48ce-a2ce-4f51615642b0_min.webp",
    rating: 4.8, reviews: 224, master: "m3",
    tagline: "Чистая кожа без стресса",
    desc: "Бережная комбинированная чистка: распаривание, мягкое отшелушивание и деликатное удаление несовершенств с успокаивающим финишем.",
    includes: ["Демакияж и подготовка", "Размягчение и отшелушивание", "Деликатная чистка", "Успокаивающая маска"],
  },
  {
    id: "s10", cat: "Лицо", name: "Скульптурный массаж лица", price: 3600, min: 60,
    img: IMG + "hf_20260523_180001_c43e6e45-3f3e-4ccd-aa50-245732f18e1e_min.webp",
    rating: 4.9, reviews: 176, master: "m3",
    tagline: "Подтянутый и отдохнувший овал",
    desc: "Глубокий моделирующий массаж, который снимает зажимы, улучшает лимфоток и возвращает лицу свежесть и чёткость контура.",
    includes: ["Очищение и масло для массажа", "Лимфодренажные техники", "Скульптурная проработка", "Финишный уход"],
  },
  {
    id: "s11", cat: "Тело", name: "SPA-массаж тела", price: 5200, min: 90,
    img: IMG + "hf_20260523_180005_39b63309-8ba3-4145-b050-3c1a26863a52_min.webp",
    rating: 5.0, reviews: 312, master: "m4", badge: "Хит",
    tagline: "Перезагрузка для тела и мыслей",
    desc: "Расслабляющий массаж всего тела с тёплым маслом в тишине SPA-кабинета. Снимает усталость, напряжение и возвращает лёгкость.",
    includes: ["Тёплое ароматическое масло", "Расслабляющие техники", "Проработка зон напряжения", "Отдых с травяным чаем"],
  },
  {
    id: "s12", cat: "Взгляд", name: "Ламинирование ресниц", price: 3200, min: 80,
    img: IMG + "hf_20260523_180009_2e17f667-452e-4443-8cb3-26770a6d7935_min.webp",
    rating: 4.9, reviews: 290, master: "m6", badge: "Новое",
    tagline: "Открытый взгляд без туши",
    desc: "Ламинирование придаёт ресницам изгиб, объём и насыщенный цвет. Эффект держится до восьми недель и не требует ежедневного макияжа.",
    includes: ["Подбор изгиба", "Ламинирование и питание", "Окрашивание ресниц", "Уход за зоной роста"],
  },
];

const REVIEWS = [
  { name: "Екатерина", service: "Окрашивание Airtouch", rating: 5, date: "8 мая", text: "Лучший цвет за всю мою жизнь. Алиса — настоящий художник, переходы мягкие и очень натуральные." },
  { name: "Марина", service: "SPA-массаж тела", rating: 5, date: "2 мая", text: "Вышла из салона как новый человек. Атмосфера, аромат, тишина — за час забываешь обо всём." },
  { name: "Полина", service: "Уходовая косметология", rating: 5, date: "27 апреля", text: "Кожа сияет уже после первой процедуры. Ирина всё объясняет и подбирает уход именно под тебя." },
];

const ED = {
  interior: IMG + "hf_20260523_180151_45b1e34b-c389-48ee-bb46-ec716c1766f9_min.webp",
  still: IMG + "hf_20260523_180155_0fbd5e0f-358a-44f4-9b41-e8b2d13c0ddc_min.webp",
};

const SLOTS = ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00", "20:30"];

const rub = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const NUM = { fontVariantNumeric: "tabular-nums" as const };
const durStr = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} ч${m % 60 ? ` ${m % 60} мин` : ""}` : `${m} мин`);
const plural = (n: number, f: [string, string, string]) => {
  const a = n % 10, b = n % 100;
  if (a === 1 && b !== 11) return f[0];
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return f[1];
  return f[2];
};
const masterById = (id: string) => MASTERS.find((m) => m.id === id)!;
const serviceById = (id: string) => SERVICES.find((s) => s.id === id)!;

const serif = (size: string, weight = 600): React.CSSProperties => ({
  fontFamily: SERIF, fontSize: size, fontWeight: weight, color: INK, lineHeight: 1.08, letterSpacing: "0.005em",
});
const kicker: React.CSSProperties = {
  fontFamily: SANS, fontSize: T.micro, fontWeight: 600, letterSpacing: "0.18em",
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
      {!loaded && <div className="gs-shim absolute inset-0" aria-hidden="true" />}
      <img src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async"
        fetchPriority={priority ? "high" : "auto"} onLoad={() => setLoaded(true)}
        className="w-full h-full" style={{
          objectFit: "cover", display: "block",
          opacity: loaded ? 1 : 0, transition: "opacity .5s ease-out",
        }} />
    </div>
  );
}

function Stars({ value, size = 12 }: { value: number; size?: number }) {
  return <Star size={size} fill={ACCENT} color={ACCENT} strokeWidth={0} aria-hidden="true" />;
}

/* --- карточка услуги (вертикальная) --- */
function ServiceCard({ s, fav, onFav, onOpen, w, idx = 0 }: {
  s: Service; fav: boolean; onFav: () => void; onOpen: () => void; w?: number | string; idx?: number;
}) {
  return (
    <div role="button" tabIndex={0} aria-label={`${s.name}, ${rub(s.price)}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="gs-card flex-shrink-0 cursor-pointer"
      style={{ width: w ?? 230, background: PAPER, borderRadius: 22, overflow: "hidden",
        animation: "gsUp .55s cubic-bezier(.22,1,.36,1) both", animationDelay: `${Math.min(idx, 9) * 0.05}s` }}>
      <div className="relative" style={{ aspectRatio: "1 / 1.04" }}>
        <Img src={s.img} alt={s.name} />
        {s.badge && (
          <span className="absolute" style={{ top: 12, left: 12, background: PAPER, color: ACCENT_DEEP,
            fontSize: T.micro, fontWeight: 600, letterSpacing: "0.04em", padding: "5px 11px", borderRadius: 999 }}>{s.badge}</span>
        )}
        <button type="button" onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label={fav ? "Убрать из избранного" : "В избранное"} aria-pressed={fav}
          className="absolute flex items-center justify-center gs-press" style={{ top: 4, right: 4, width: 44, height: 44 }}>
          <span className="flex items-center justify-center" style={{ width: 33, height: 33, borderRadius: 999, background: "rgba(255,255,255,0.9)" }}>
            <Heart key={fav ? "1" : "0"} size={15} strokeWidth={2.2} fill={fav ? ACCENT : "none"} color={fav ? ACCENT_DEEP : INK}
              style={fav ? { animation: "gsPop .36s ease-out" } : undefined} />
          </span>
        </button>
      </div>
      <div style={{ padding: "13px 15px 16px" }}>
        <div style={{ fontFamily: SANS, fontSize: T.micro, color: ACCENT_DEEP, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.cat}</div>
        <div style={{ ...serif(S.s1, 600), marginTop: 5 }}>{s.name}</div>
        <div className="flex items-center justify-between" style={{ marginTop: 9 }}>
          <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 700, color: INK, ...NUM }}>{rub(s.price)}</span>
          <span className="flex items-center" style={{ gap: 4, fontFamily: SANS, fontSize: T.cap, color: SUB }}>
            <Clock size={12} color={MUTED} strokeWidth={2} /> {durStr(s.min)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* --- ряд услуги (горизонтальный, для каталога) --- */
function ServiceRow({ s, onOpen, idx = 0 }: { s: Service; onOpen: () => void; idx?: number }) {
  return (
    <div role="button" tabIndex={0} aria-label={`${s.name}, ${rub(s.price)}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="gs-card cursor-pointer flex"
      style={{ background: PAPER, borderRadius: 20, overflow: "hidden", gap: 14, padding: 10,
        animation: "gsUp .5s cubic-bezier(.22,1,.36,1) both", animationDelay: `${Math.min(idx, 9) * 0.04}s` }}>
      <div className="relative flex-shrink-0" style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden" }}>
        <Img src={s.img} alt={s.name} />
      </div>
      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, paddingRight: 6, paddingTop: 2 }}>
        <div style={{ fontFamily: SANS, fontSize: T.micro, color: ACCENT_DEEP, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase" }}>{s.cat}</div>
        <div style={{ ...serif(S.s1, 600), fontSize: "1.3rem", marginTop: 3 }}>{s.name}</div>
        <div style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.tagline}</div>
        <div className="flex items-center" style={{ gap: 12, marginTop: "auto", paddingTop: 8 }}>
          <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 700, color: INK, ...NUM }}>{rub(s.price)}</span>
          <span className="flex items-center" style={{ gap: 4, fontFamily: SANS, fontSize: T.cap, color: SUB }}>
            <Clock size={12} color={MUTED} strokeWidth={2} /> {durStr(s.min)}
          </span>
          <span className="flex items-center" style={{ gap: 3, fontFamily: SANS, fontSize: T.cap, color: SUB, marginLeft: "auto" }}>
            <Stars value={s.rating} /> <span style={{ fontWeight: 600, color: INK, ...NUM }}>{s.rating.toFixed(1)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* --- карточка мастера --- */
function MasterCard({ m, idx = 0, w }: { m: Master; idx?: number; w?: number }) {
  return (
    <div className="flex-shrink-0" style={{ width: w ?? 156,
      animation: "gsUp .5s cubic-bezier(.22,1,.36,1) both", animationDelay: `${Math.min(idx, 9) * 0.05}s` }}>
      <div style={{ aspectRatio: "3 / 4", borderRadius: 18, overflow: "hidden" }}>
        <Img src={m.img} alt={m.name} />
      </div>
      <div style={{ ...serif("1.2rem", 600), marginTop: 10 }}>{m.name.split(" ")[0]}</div>
      <div style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, marginTop: 1 }}>{m.role}</div>
      <div className="flex items-center" style={{ gap: 4, marginTop: 6 }}>
        <Stars value={m.rating} />
        <span style={{ fontFamily: SANS, fontSize: T.cap, color: INK, fontWeight: 600, ...NUM }}>{m.rating.toFixed(1)}</span>
        <span style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED }}>· {m.exp} {plural(m.exp, ["год", "года", "лет"])}</span>
      </div>
    </div>
  );
}

function SectionHead({ kick, title, onAll }: { kick: string; title: string; onAll?: () => void }) {
  return (
    <div className="flex items-end justify-between" style={{ padding: "0 20px", marginBottom: 14 }}>
      <div>
        <div style={kicker}>{kick}</div>
        <h2 style={{ ...serif(S.s2, 600), marginTop: 6 }}>{title}</h2>
      </div>
      {onAll && (
        <button type="button" onClick={onAll} className="flex items-center gs-press flex-shrink-0"
          style={{ fontFamily: SANS, fontSize: T.sm, color: ACCENT_DEEP, fontWeight: 600, gap: 2, padding: "10px 0 10px 14px", minHeight: 44 }}>
          Все <ChevronRight size={15} strokeWidth={SW} />
        </button>
      )}
    </div>
  );
}

const CAT_DESC: Record<string, string> = {
  "Волосы": "Стрижки, окрашивание и уход для здорового блеска",
  "Ногти": "Маникюр, педикюр и стойкие безупречные покрытия",
  "Лицо": "Косметология, чистки и массаж для сияющей кожи",
  "Тело": "SPA-ритуалы и массаж для глубокого расслабления",
  "Взгляд": "Ресницы и брови для открытого выразительного взгляда",
};
const catImage = (c: string) => SERVICES.find((s) => s.cat === c)!.img;

/* --- крупная editorial-плитка услуги --- */
function ServiceTile({ s, fav, onFav, onOpen, tall, idx = 0 }: {
  s: Service; fav: boolean; onFav: () => void; onOpen: () => void; tall?: boolean; idx?: number;
}) {
  const m = masterById(s.master);
  return (
    <div role="button" tabIndex={0} aria-label={`${s.name}, ${rub(s.price)}`}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className="gs-tile cursor-pointer relative"
      style={{ borderRadius: 26, overflow: "hidden", height: tall ? 366 : 246,
        animation: "gsUp .6s cubic-bezier(.22,1,.36,1) both", animationDelay: `${Math.min(idx, 8) * 0.06}s` }}>
      <div className="absolute inset-0"><Img src={s.img} alt={s.name} priority={tall} /></div>
      <div className="absolute inset-0" aria-hidden="true"
        style={{ background: "linear-gradient(180deg, rgba(28,23,19,0.16) 0%, rgba(28,23,19,0.02) 36%, rgba(28,23,19,0.58) 72%, rgba(28,23,19,0.92) 100%)" }} />
      <div className="absolute flex items-center justify-between" style={{ left: 16, right: 10, top: 14 }}>
        <div className="flex items-center" style={{ gap: 7 }}>
          {s.badge && (
            <span style={{ background: PAPER, color: ACCENT_DEEP, fontFamily: SANS, fontSize: T.micro, fontWeight: 700,
              letterSpacing: "0.05em", textTransform: "uppercase", padding: "5px 11px", borderRadius: 999 }}>{s.badge}</span>
          )}
          <span className="flex items-center" style={{ gap: 4, background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)", padding: "5px 10px", borderRadius: 999 }}>
            <Star size={11} fill="#FFFFFF" color="#FFFFFF" strokeWidth={0} />
            <span style={{ fontFamily: SANS, fontSize: T.micro, fontWeight: 700, color: "#FFFFFF", ...NUM }}>{s.rating.toFixed(1)}</span>
          </span>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label={fav ? "Убрать из избранного" : "В избранное"} aria-pressed={fav}
          className="flex items-center justify-center gs-press" style={{ width: 44, height: 44 }}>
          <span className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 999, background: "rgba(255,255,255,0.94)" }}>
            <Heart key={fav ? "1" : "0"} size={16} strokeWidth={2.2} fill={fav ? ACCENT : "none"} color={fav ? ACCENT_DEEP : INK}
              style={fav ? { animation: "gsPop .36s ease-out" } : undefined} />
          </span>
        </button>
      </div>
      <div className="absolute" style={{ left: 18, right: 18, bottom: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: T.micro, fontWeight: 700, letterSpacing: "0.13em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>{s.cat}</div>
        <div style={{ fontFamily: SERIF, fontSize: tall ? "2.3rem" : "1.85rem", fontWeight: 600, color: "#FFFFFF", lineHeight: 1.03, marginTop: 5 }}>{s.name}</div>
        <div style={{ fontFamily: SANS, fontSize: T.cap, color: "rgba(255,255,255,0.82)", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.tagline}</div>
        <div className="flex items-center" style={{ gap: 9, marginTop: 14 }}>
          <span className="flex items-center justify-center flex-shrink-0" style={{ width: 27, height: 27, borderRadius: 999, overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.55)" }}>
            <Img src={m.img} alt={m.name} />
          </span>
          <span style={{ fontFamily: SANS, fontSize: T.cap, color: "rgba(255,255,255,0.92)", fontWeight: 500 }}>{m.name.split(" ")[0]}</span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.45)" }} aria-hidden="true" />
          <span className="flex items-center" style={{ gap: 4, fontFamily: SANS, fontSize: T.cap, color: "rgba(255,255,255,0.82)" }}>
            <Clock size={12} color="rgba(255,255,255,0.7)" strokeWidth={2} /> {durStr(s.min)}
          </span>
          <span className="flex items-center" style={{ gap: 9, marginLeft: "auto" }}>
            <span style={{ fontFamily: SANS, fontSize: T.lg, fontWeight: 700, color: "#FFFFFF", ...NUM }}>{rub(s.price)}</span>
            <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 999, background: PAPER }}>
              <ChevronRight size={18} color={INK} strokeWidth={2.5} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* =================== основной компонент =================== */
function Beauty({ activeTab, onTabChange, onCartCount }: Props) {
  const [selected, setSelected] = useState<Service | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set(["s2", "s11"]));
  const [cart, setCart] = useState<string[]>(["s8", "s5"]);
  const [toast, setToast] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState("Все");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fire = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2100);
  }, []);
  const toggleFav = useCallback((id: string) => {
    setFavs((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);
  const cartCount = cart.length;
  useEffect(() => { onCartCount?.(cartCount); }, [cartCount, onCartCount]);
  const addBooking = useCallback((id: string) => {
    setCart((c) => (c.includes(id) ? c : [...c, id]));
    fire("Услуга добавлена в запись");
  }, [fire]);
  const removeBooking = (id: string) => setCart((c) => c.filter((x) => x !== id));
  const goCat = (cat: string) => { setCatFilter(cat); onTabChange("catalog"); };

  const tgUser: any = (() => { try { return (window as any).Telegram?.WebApp?.initDataUnsafe?.user || null; } catch { return null; } })();
  const userName = String(tgUser?.first_name || tgUser?.username || "Виктория");

  const featured = SERVICES.filter((s) => s.badge === "Хит");
  const fresh = SERVICES.filter((s) => s.badge === "Новое");

  /* --------------- ГЛАВНАЯ --------------- */
  const Home = (
    <div className="min-h-full" style={{ background: CANVAS, paddingBottom: 32 }}>
      <h1 className="gs-sr">GLOW — салон красоты и SPA</h1>
      <header className="flex items-center justify-between" style={{ padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 12px" }}>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 600, color: INK, letterSpacing: "0.14em" }}>GLOW</div>
          <div className="flex items-center" style={{ gap: 4, marginTop: 1 }}>
            <MapPin size={11} color={MUTED} strokeWidth={2.2} />
            <span style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 500 }}>Москва · Патриаршие</span>
          </div>
        </div>
        <button type="button" onClick={() => onTabChange("profile")} aria-label="Профиль"
          className="flex items-center justify-center gs-press"
          style={{ width: 44, height: 44, borderRadius: 999, background: INK, marginRight: -4 }}>
          <span style={{ fontFamily: SERIF, fontSize: "1.05rem", fontWeight: 600, color: CANVAS }}>{userName.charAt(0).toUpperCase()}</span>
        </button>
      </header>

      {/* видео-герой */}
      <div style={{ padding: "4px 16px 0" }}>
        <div className="relative" style={{ borderRadius: 28, overflow: "hidden", height: 472 }}>
          <video src={glowspaHeroVideo} poster={glowspaHeroImg} autoPlay muted loop playsInline
            aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="absolute inset-0" aria-hidden="true"
            style={{ background: "linear-gradient(180deg, rgba(28,23,19,0.34) 0%, rgba(28,23,19,0.05) 34%, rgba(28,23,19,0.82) 100%)" }} />
          <div className="absolute" style={{ left: 24, right: 24, top: 26 }}>
            <span style={{ ...kicker, color: "rgba(255,255,255,0.9)" }}>Салон красоты · SPA</span>
          </div>
          <div className="absolute" style={{ left: 24, right: 24, bottom: 26 }}>
            <h2 style={{ fontFamily: SERIF, fontSize: S.s4, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.0, letterSpacing: "0.005em" }}>
              Сияйте<br />каждый день
            </h2>
            <p style={{ fontFamily: SANS, fontSize: T.sm, color: "rgba(255,255,255,0.86)", fontWeight: 400, lineHeight: 1.5, marginTop: 12, maxWidth: 280 }}>
              Авторские процедуры, мастера с многолетним опытом и атмосфера, в которой о вас по-настоящему заботятся.
            </p>
            <button type="button" onClick={() => onTabChange("catalog")}
              className="flex items-center justify-center gs-press"
              style={{ marginTop: 18, height: 50, padding: "0 26px", borderRadius: 999, background: PAPER, gap: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: INK }}>Записаться онлайн</span>
              <ChevronRight size={16} color={INK} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>

      {/* статистика */}
      <div className="flex items-center justify-center" style={{ gap: 0, padding: "22px 20px 6px" }}>
        {[["4.9", "рейтинг"], ["12", "лет в деле"], ["60K", "гостей"]].map(([v, l], i) => (
          <div key={l} className="flex items-center" style={{ gap: 0 }}>
            {i > 0 && <span style={{ width: 1, height: 30, background: LINE, margin: "0 18px" }} aria-hidden="true" />}
            <div className="text-center">
              <div style={{ ...serif("1.7rem", 600), color: INK }}>{v}</div>
              <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 500, letterSpacing: "0.04em", marginTop: 1 }}>{l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* категории */}
      <div style={{ marginTop: 26 }}>
        <SectionHead kick="Направления" title="Категории услуг" onAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide gs-strip">
          <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
            {CATEGORIES.map((c, i) => {
              const n = SERVICES.filter((s) => s.cat === c).length;
              return (
                <button type="button" key={c} onClick={() => goCat(c)}
                  className="flex-shrink-0 text-left gs-press"
                  style={{ width: 124, animation: "gsUp .5s cubic-bezier(.22,1,.36,1) both", animationDelay: `${i * 0.05}s` }}>
                  <div className="relative" style={{ width: 124, height: 150, borderRadius: 20, overflow: "hidden" }}>
                    <Img src={catImage(c)} alt={c} />
                    <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(180deg, rgba(28,23,19,0) 50%, rgba(28,23,19,0.42) 100%)" }} />
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: "1.25rem", fontWeight: 600, color: INK, marginTop: 9 }}>{c}</div>
                  <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, marginTop: 1 }}>{n} {plural(n, ["услуга", "услуги", "услуг"])}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* выбор GLOW */}
      <div style={{ marginTop: 30 }}>
        <SectionHead kick="Выбор гостей" title="Хиты салона" onAll={() => onTabChange("catalog")} />
        <div className="overflow-x-auto scrollbar-hide gs-strip">
          <div className="flex" style={{ gap: 14, padding: "0 20px 4px", width: "max-content" }}>
            {featured.map((s, i) => (
              <ServiceCard key={s.id} s={s} idx={i} fav={favs.has(s.id)} onFav={() => toggleFav(s.id)} onOpen={() => setSelected(s)} />
            ))}
          </div>
        </div>
      </div>

      {/* ритуал недели */}
      <div style={{ marginTop: 34, padding: "0 20px" }}>
        <div style={kicker}>Особенное предложение</div>
        <h2 style={{ ...serif(S.s2, 600), marginTop: 6, marginBottom: 14 }}>Ритуал недели</h2>
        <ServiceTile s={serviceById("s11")} tall fav={favs.has("s11")}
          onFav={() => toggleFav("s11")} onOpen={() => setSelected(serviceById("s11"))} />
      </div>

      {/* редакционный блок — интерьер */}
      <button type="button" onClick={() => onTabChange("catalog")}
        className="relative block w-full text-left gs-press"
        style={{ margin: "32px 16px 0", width: "calc(100% - 32px)", height: 300, borderRadius: 26, overflow: "hidden" }}>
        <Img src={ED.interior} alt="Интерьер салона GLOW" />
        <div className="absolute inset-0" aria-hidden="true"
          style={{ background: "linear-gradient(180deg, rgba(28,23,19,0.1) 30%, rgba(28,23,19,0.78) 100%)" }} />
        <div className="absolute" style={{ left: 24, right: 24, bottom: 24 }}>
          <span style={{ ...kicker, color: "rgba(255,255,255,0.9)" }}>О пространстве</span>
          <div style={{ fontFamily: SERIF, fontSize: S.s2, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.06, marginTop: 8 }}>
            Место, где о вас<br />заботятся
          </div>
          <p style={{ fontFamily: SANS, fontSize: T.sm, color: "rgba(255,255,255,0.84)", lineHeight: 1.5, marginTop: 8, maxWidth: 290 }}>
            Тёплый свет, натуральные материалы и тишина — салон создан, чтобы каждый визит был маленьким ретритом.
          </p>
        </div>
      </button>

      {/* мастера */}
      <div style={{ marginTop: 32 }}>
        <SectionHead kick="Команда GLOW" title="Наши мастера" />
        <div className="overflow-x-auto scrollbar-hide gs-strip">
          <div className="flex" style={{ gap: 14, padding: "0 20px 4px", width: "max-content" }}>
            {MASTERS.map((m, i) => <MasterCard key={m.id} m={m} idx={i} />)}
          </div>
        </div>
      </div>

      {/* отзывы */}
      <div style={{ marginTop: 32 }}>
        <SectionHead kick="Впечатления" title="Отзывы гостей" />
        <div className="overflow-x-auto scrollbar-hide gs-strip">
          <div className="flex" style={{ gap: 14, padding: "0 20px 4px", width: "max-content" }}>
            {REVIEWS.map((r, i) => (
              <div key={r.name} className="flex-shrink-0" style={{ width: 280, background: PAPER, borderRadius: 22, padding: "20px 20px 18px",
                animation: "gsUp .5s cubic-bezier(.22,1,.36,1) both", animationDelay: `${i * 0.06}s` }}>
                <div className="flex" style={{ gap: 2 }} aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((n) => <Star key={n} size={13} fill={ACCENT} color={ACCENT} strokeWidth={0} />)}
                </div>
                <p style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 500, color: INK, lineHeight: 1.4, marginTop: 12, fontStyle: "italic" }}>«{r.text}»</p>
                <div style={{ fontFamily: SANS, fontSize: T.sm, fontWeight: 600, color: INK, marginTop: 14 }}>{r.name}</div>
                <div style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED, marginTop: 1 }}>{r.service} · {r.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GLOW Club */}
      <div style={{ padding: "32px 20px 0" }}>
        <div style={{ background: "linear-gradient(158deg, #F2E9DB 0%, #E6D8C3 100%)", borderRadius: 26, padding: "26px 22px", border: `1px solid ${LINE}` }}>
          <span style={kicker}>GLOW Club</span>
          <div style={{ fontFamily: SERIF, fontSize: S.s2, fontWeight: 600, color: INK, lineHeight: 1.08, marginTop: 8 }}>
            Клуб привилегий<br />для постоянных гостей
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
            {["Кэшбэк до 15% бонусами на счёт", "Ранняя запись к топ-мастерам", "Подарок и уход в день рождения"].map((p) => (
              <div key={p} className="flex items-center" style={{ gap: 11 }}>
                <span className="flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24, borderRadius: 999, background: PAPER }}>
                  <Check size={12} color={ACCENT_DEEP} strokeWidth={3} />
                </span>
                <span style={{ fontFamily: SANS, fontSize: T.sm, color: SUB, fontWeight: 400 }}>{p}</span>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => onTabChange("profile")}
            className="flex items-center justify-center gs-press"
            style={{ marginTop: 20, height: 48, width: "100%", borderRadius: 999, background: ACCENT,
              fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: "#FFFFFF" }}>
            Вступить в клуб
          </button>
        </div>
      </div>

      {/* контакты */}
      <div style={{ padding: "26px 20px 0" }}>
        <div style={kicker}>GLOW · Москва</div>
        <h2 style={{ ...serif(S.s2, 600), marginTop: 6 }}>Будем рады видеть вас</h2>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { ic: <MapPin size={IC.sm} color={ACCENT_DEEP} strokeWidth={SW} />, t: "ул. Малая Бронная, 24", s: "5 минут от м. Маяковская" },
            { ic: <Clock size={IC.sm} color={ACCENT_DEEP} strokeWidth={SW} />, t: "Ежедневно 9:00 — 22:00", s: "Без выходных" },
            { ic: <Phone size={IC.sm} color={ACCENT_DEEP} strokeWidth={SW} />, t: "+7 495 000-00-00", s: "Запись и консультации" },
          ].map((r) => (
            <div key={r.t} className="flex items-center" style={{ gap: 13 }}>
              <span className="flex items-center justify-center flex-shrink-0" style={{ width: 42, height: 42, borderRadius: 999, background: TINT }}>{r.ic}</span>
              <div>
                <div style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: INK }}>{r.t}</div>
                <div style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED, marginTop: 1 }}>{r.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  /* --------------- КАТАЛОГ --------------- */
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const catServices = SERVICES.filter(
    (s) => (catFilter === "Все" || s.cat === catFilter) &&
           (q === "" || (s.name + " " + s.cat + " " + s.tagline).toLowerCase().includes(q))
  );
  const Catalog = (
    <div style={{ background: CANVAS, minHeight: "100%", paddingBottom: 36 }}>
      <div style={{ padding: "calc(env(safe-area-inset-top, 0px) + 18px) 20px 2px" }}>
        <div style={kicker}>Прайс-лист GLOW</div>
        <h1 style={{ ...serif(S.s3, 600), marginTop: 6 }}>Каталог услуг</h1>
        <p style={{ fontFamily: SANS, fontSize: T.sm, color: SUB, marginTop: 9, lineHeight: 1.5 }}>
          {SERVICES.length} процедур и {MASTERS.length} мастеров — выберите свой ритуал красоты.
        </p>
      </div>
      <div style={{ padding: "16px 20px 14px" }}>
        <div className="flex items-center" style={{ gap: 10, background: PAPER, borderRadius: 16, padding: "0 15px", height: 50, border: `1px solid ${LINE}` }}>
          <Search size={IC.sm} color={MUTED} strokeWidth={SW} aria-hidden="true" />
          <input type="search" inputMode="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск услуги или ритуала" aria-label="Поиск по услугам"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: SANS, fontSize: "1rem", color: INK, minWidth: 0 }} />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Очистить"
              className="flex items-center justify-center gs-press" style={{ minWidth: 44, height: 44, marginRight: -9, fontFamily: SANS, fontSize: T.sm, color: MUTED, fontWeight: 500 }}>Сброс</button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide" style={{ marginBottom: 4 }}>
        <div className="flex" style={{ gap: 8, padding: "0 20px", width: "max-content" }} role="group" aria-label="Категории">
          {["Все", ...CATEGORIES].map((c) => {
            const on = catFilter === c;
            return (
              <button type="button" key={c} onClick={() => setCatFilter(c)} aria-pressed={on}
                className="flex-shrink-0 gs-press"
                style={{ height: 40, padding: "0 18px", borderRadius: 999, fontFamily: SANS, fontSize: T.sm, fontWeight: 500,
                  background: on ? INK : PAPER, color: on ? CANVAS : INK, border: `1px solid ${on ? INK : LINE}`, transition: "background .2s, color .2s" }}>{c}</button>
            );
          })}
        </div>
      </div>
      {catServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: "64px 32px", color: MUTED }}>
          <Search size={IC.lg} strokeWidth={1.6} aria-hidden="true" />
          <div style={{ ...serif(S.s1, 600), marginTop: 14 }}>Ничего не найдено</div>
          <div style={{ fontFamily: SANS, fontSize: T.sm, marginTop: 4 }}>Измените запрос или категорию</div>
        </div>
      ) : q !== "" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "14px 20px 0" }}>
          {catServices.map((s, i) => (
            <ServiceTile key={s.id} s={s} idx={i} fav={favs.has(s.id)} onFav={() => toggleFav(s.id)} onOpen={() => setSelected(s)} />
          ))}
        </div>
      ) : catFilter !== "Все" ? (
        <>
          <div className="relative" style={{ margin: "12px 20px 0", height: 158, borderRadius: 24, overflow: "hidden" }}>
            <Img src={catImage(catFilter)} alt={catFilter} />
            <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(180deg, rgba(28,23,19,0.12) 30%, rgba(28,23,19,0.78) 100%)" }} />
            <div className="absolute" style={{ left: 20, right: 20, bottom: 16 }}>
              <div style={{ fontFamily: SANS, fontSize: T.micro, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)" }}>
                {catServices.length} {plural(catServices.length, ["услуга", "услуги", "услуг"])}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: S.s2, fontWeight: 600, color: "#FFFFFF", marginTop: 4 }}>{catFilter}</div>
              <div style={{ fontFamily: SANS, fontSize: T.cap, color: "rgba(255,255,255,0.84)", marginTop: 3 }}>{CAT_DESC[catFilter]}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 20px 0" }}>
            {catServices.map((s, i) => (
              <ServiceTile key={s.id} s={s} idx={i} fav={favs.has(s.id)} onFav={() => toggleFav(s.id)} onOpen={() => setSelected(s)} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: "14px 20px 0" }}>
            <div style={{ ...kicker, marginBottom: 10 }}>Ритуал сезона</div>
            <ServiceTile s={serviceById("s2")} tall fav={favs.has("s2")}
              onFav={() => toggleFav("s2")} onOpen={() => setSelected(serviceById("s2"))} />
          </div>
          {CATEGORIES.map((c, ci) => {
            const list = SERVICES.filter((sv) => sv.cat === c);
            return (
              <section key={c} style={{ marginTop: 32 }}>
                <div style={{ padding: "0 20px", marginBottom: 14 }}>
                  <div className="flex items-baseline" style={{ gap: 10 }}>
                    <span style={{ fontFamily: SANS, fontSize: T.cap, fontWeight: 700, color: ACCENT_DEEP, ...NUM }}>{String(ci + 1).padStart(2, "0")}</span>
                    <h2 style={serif(S.s2, 600)}>{c}</h2>
                    <span style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED, marginLeft: "auto" }}>
                      {list.length} {plural(list.length, ["услуга", "услуги", "услуг"])}
                    </span>
                  </div>
                  <p style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, marginTop: 5, lineHeight: 1.45 }}>{CAT_DESC[c]}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "0 20px" }}>
                  {list.map((sv, i) => (
                    <ServiceTile key={sv.id} s={sv} idx={i} fav={favs.has(sv.id)} onFav={() => toggleFav(sv.id)} onOpen={() => setSelected(sv)} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );

  /* --------------- ЗАПИСЬ (booking) --------------- */
  const [stage, setStage] = useState<"cart" | "time" | "done">("cart");
  const [dateIdx, setDateIdx] = useState(1);
  const [slot, setSlot] = useState("");
  const [processing, setProcessing] = useState(false);

  const bookServices = cart.map(serviceById);
  const bookTotal = bookServices.reduce((s, x) => s + x.price, 0);
  const bookMin = bookServices.reduce((s, x) => s + x.min, 0);

  const WD = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const MO = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
  const fmtDate = (d: Date) => `${d.getDate()} ${MO[d.getMonth()]}`;

  const Booking = (
    <div style={{ background: CANVAS, minHeight: "100%", paddingBottom: 130 }}>
      {stage === "cart" && (
        <>
          <div style={{ padding: "calc(env(safe-area-inset-top, 0px) + 18px) 20px 4px" }}>
            <div style={kicker}>Ваша запись</div>
            <h1 style={{ ...serif(S.s3, 600), marginTop: 6 }}>Корзина услуг</h1>
          </div>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: "70px 32px", color: MUTED }}>
              <Calendar size={IC.lg} strokeWidth={1.6} aria-hidden="true" />
              <div style={{ ...serif(S.s1, 600), marginTop: 14 }}>Здесь пока пусто</div>
              <div style={{ fontFamily: SANS, fontSize: T.sm, marginTop: 4 }}>Выберите процедуры из каталога</div>
              <button type="button" onClick={() => onTabChange("catalog")} className="gs-press"
                style={{ marginTop: 22, height: 50, padding: "0 28px", borderRadius: 999, background: INK, color: CANVAS, fontFamily: SANS, fontSize: T.sm, fontWeight: 600 }}>
                Открыть каталог
              </button>
            </div>
          ) : (
            <div style={{ padding: "18px 20px 0" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bookServices.map((s) => {
                  const m = masterById(s.master);
                  return (
                    <div key={s.id} className="flex" style={{ gap: 13, background: PAPER, borderRadius: 20, padding: 12 }}>
                      <button type="button" onClick={() => setSelected(s)} aria-label={`Открыть ${s.name}`}
                        className="flex-shrink-0 gs-press" style={{ width: 84, height: 84, borderRadius: 14, overflow: "hidden" }}>
                        <Img src={s.img} alt={s.name} />
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: SANS, fontSize: T.micro, color: ACCENT_DEEP, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.cat}</div>
                        <div style={{ ...serif("1.3rem", 600), marginTop: 2 }}>{s.name}</div>
                        <div style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, marginTop: 3 }}>{m.name.split(" ")[0]} · {durStr(s.min)}</div>
                        <div style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 700, color: INK, marginTop: 6, ...NUM }}>{rub(s.price)}</div>
                      </div>
                      <button type="button" onClick={() => removeBooking(s.id)} aria-label={`Убрать ${s.name}`}
                        className="flex items-center justify-center gs-press flex-shrink-0" style={{ width: 40, height: 40, margin: "-4px -4px 0 0" }}>
                        <X size={IC.sm} color={MUTED} strokeWidth={SW} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px solid ${LINE}` }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: SANS, fontSize: T.sm, color: SUB }}>Длительность визита</span>
                  <span style={{ fontFamily: SANS, fontSize: T.sm, color: INK, fontWeight: 600 }}>≈ {durStr(bookMin)}</span>
                </div>
                <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
                  <span style={{ ...serif(S.s1, 600) }}>Итого</span>
                  <span style={{ ...serif(S.s1, 600), ...NUM }}>{rub(bookTotal)}</span>
                </div>
              </div>
              <button type="button" onClick={() => setStage("time")} className="gs-press"
                style={{ width: "100%", marginTop: 18, height: 56, borderRadius: 999, background: INK, color: CANVAS, fontFamily: SANS, fontSize: T.body, fontWeight: 600 }}>
                Выбрать дату и время
              </button>
            </div>
          )}
        </>
      )}

      {stage === "time" && (
        <>
          <div className="flex items-center" style={{ gap: 8, padding: "calc(env(safe-area-inset-top, 0px) + 16px) 20px 4px" }}>
            <button type="button" onClick={() => setStage("cart")} aria-label="Назад"
              className="flex items-center justify-center gs-press" style={{ width: 40, height: 40, marginLeft: -8 }}>
              <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
            </button>
            <div>
              <div style={kicker}>Шаг 2 из 3</div>
              <h1 style={{ ...serif(S.s2, 600), marginTop: 4 }}>Дата и время</h1>
            </div>
          </div>
          <div style={{ padding: "16px 20px 0" }}>
            <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Выберите день</div>
          </div>
          <div className="overflow-x-auto scrollbar-hide" style={{ marginBottom: 4 }}>
            <div className="flex" style={{ gap: 9, padding: "0 20px", width: "max-content" }}>
              {days.map((d, i) => {
                const on = dateIdx === i;
                return (
                  <button type="button" key={i} onClick={() => setDateIdx(i)} aria-pressed={on}
                    className="flex flex-col items-center justify-center flex-shrink-0 gs-press"
                    style={{ width: 60, height: 76, borderRadius: 18, background: on ? INK : PAPER, border: `1px solid ${on ? INK : LINE}` }}>
                    <span style={{ fontFamily: SANS, fontSize: T.micro, fontWeight: 600, color: on ? "rgba(244,239,231,0.7)" : MUTED, textTransform: "uppercase" }}>{i === 0 ? "Сегодня" : WD[d.getDay()]}</span>
                    <span style={{ ...serif("1.5rem", 600), color: on ? CANVAS : INK, marginTop: 3 }}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ padding: "20px 20px 0" }}>
            <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 11 }}>Свободное время</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9 }}>
              {SLOTS.map((t) => {
                const on = slot === t;
                return (
                  <button type="button" key={t} onClick={() => setSlot(t)} aria-pressed={on}
                    className="flex items-center justify-center gs-press"
                    style={{ height: 46, borderRadius: 14, background: on ? INK : PAPER, border: `1px solid ${on ? INK : LINE}`,
                      fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: on ? CANVAS : INK, ...NUM }}>{t}</button>
                );
              })}
            </div>
            <div style={{ marginTop: 22, background: PAPER, borderRadius: 20, padding: "16px 18px" }}>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: SANS, fontSize: T.sm, color: SUB }}>{bookServices.length} {plural(bookServices.length, ["услуга", "услуги", "услуг"])} · {durStr(bookMin)}</span>
                <span style={{ ...serif(S.s1, 600), ...NUM }}>{rub(bookTotal)}</span>
              </div>
            </div>
            <button type="button" disabled={!slot || processing}
              onClick={() => { setProcessing(true); setTimeout(() => { setProcessing(false); setStage("done"); }, 950); }}
              className="flex items-center justify-center gs-press"
              style={{ width: "100%", marginTop: 16, height: 56, borderRadius: 999, background: INK, color: CANVAS,
                fontFamily: SANS, fontSize: T.body, fontWeight: 600, gap: 9, opacity: !slot || processing ? 0.45 : 1 }}>
              {processing
                ? <><Loader2 size={IC.sm} color={CANVAS} strokeWidth={2.4} style={{ animation: "gsSpin .8s linear infinite" }} aria-hidden="true" /> Подтверждаем…</>
                : <>Подтвердить запись</>}
            </button>
            {!slot && <div style={{ fontFamily: SANS, fontSize: T.cap, color: MUTED, textAlign: "center", marginTop: 9 }}>Выберите удобное время</div>}
          </div>
        </>
      )}

      {stage === "done" && (
        <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "78vh", padding: "0 32px" }}>
          <div className="flex items-center justify-center" style={{ width: 80, height: 80, borderRadius: 999, background: INK, animation: "gsPop .5s ease-out" }}>
            <Check size={36} color={ACCENT} strokeWidth={2.6} aria-hidden="true" />
          </div>
          <h1 style={{ ...serif(S.s3, 600), marginTop: 22 }}>Вы записаны</h1>
          <p style={{ fontFamily: SANS, fontSize: T.sm, color: SUB, marginTop: 10, lineHeight: 1.55 }}>
            Ждём вас {fmtDate(days[dateIdx])} в {slot}. Напомним о визите за день и пришлём детали в чат.
          </p>
          <div style={{ marginTop: 18, background: PAPER, borderRadius: 18, padding: "14px 20px" }}>
            <span style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 600, color: INK }}>{fmtDate(days[dateIdx])} · {slot}</span>
          </div>
          <button type="button" onClick={() => { setCart([]); setStage("cart"); setSlot(""); onTabChange("home"); }}
            className="gs-press"
            style={{ marginTop: 24, height: 52, padding: "0 42px", borderRadius: 999, background: INK, color: CANVAS, fontFamily: SANS, fontSize: T.sm, fontWeight: 600 }}>
            Готово
          </button>
        </div>
      )}
    </div>
  );

  /* --------------- ПРОФИЛЬ --------------- */
  const Profile = (
    <div style={{ background: CANVAS, minHeight: "100%", paddingBottom: 32 }}>
      <div style={{ padding: "calc(env(safe-area-inset-top, 0px) + 18px) 20px 4px" }}>
        <div style={kicker}>Личный кабинет</div>
        <h1 style={{ ...serif(S.s3, 600), marginTop: 6 }}>Профиль</h1>
      </div>
      <div className="flex items-center" style={{ gap: 15, padding: "18px 20px 18px" }}>
        <div className="flex items-center justify-center flex-shrink-0" aria-hidden="true"
          style={{ width: 66, height: 66, borderRadius: 999, background: INK }}>
          <span style={{ fontFamily: SERIF, fontSize: "1.7rem", fontWeight: 600, color: CANVAS }}>{userName.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <div style={{ ...serif(S.s1, 600) }}>{userName}</div>
          <div className="flex items-center" style={{ gap: 5, marginTop: 3 }}>
            <Award size={13} color={ACCENT_DEEP} strokeWidth={2.2} />
            <span style={{ fontFamily: SANS, fontSize: T.cap, color: ACCENT_DEEP, fontWeight: 600 }}>GLOW Club · Gold</span>
          </div>
        </div>
      </div>

      {/* клубная карта */}
      <div style={{ padding: "0 20px" }}>
        <div style={{ background: "linear-gradient(158deg, #F2E9DB 0%, #E6D8C3 100%)", borderRadius: 24, padding: "22px 22px 20px", border: `1px solid ${LINE}` }}>
          <div className="flex items-center justify-between">
            <span style={kicker}>Баланс бонусов</span>
            <Sparkles size={IC.sm} color={ACCENT_DEEP} strokeWidth={2} aria-hidden="true" />
          </div>
          <div style={{ fontFamily: SERIF, fontSize: S.s3, fontWeight: 600, color: INK, marginTop: 10, ...NUM }}>4 850</div>
          <div style={{ fontFamily: SANS, fontSize: T.cap, color: SUB }}>бонусов · 1 бонус = 1 ₽</div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(38,33,28,0.1)", marginTop: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: "68%", borderRadius: 999, background: ACCENT }} />
          </div>
          <div style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, marginTop: 8 }}>До уровня Platinum — ещё 2 визита</div>
        </div>
      </div>

      {/* ближайшая запись */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontFamily: SANS, fontSize: T.micro, color: MUTED, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>Ближайшая запись</div>
        <div className="flex items-center" style={{ gap: 14, background: PAPER, borderRadius: 20, padding: 14 }}>
          <div className="flex flex-col items-center justify-center flex-shrink-0" style={{ width: 60, height: 60, borderRadius: 16, background: TINT }}>
            <span style={{ ...serif("1.5rem", 600), color: ACCENT_DEEP }}>27</span>
            <span style={{ fontFamily: SANS, fontSize: T.micro, color: ACCENT_DEEP, fontWeight: 600 }}>мая</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...serif("1.25rem", 600) }}>Окрашивание Airtouch</div>
            <div style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, marginTop: 2 }}>16:00 · Алиса Верещагина</div>
          </div>
          <ChevronRight size={IC.md} color={MUTED} strokeWidth={SW} aria-hidden="true" />
        </div>
      </div>

      <nav aria-label="Меню профиля" style={{ marginTop: 20 }}>
        {[
          { r: "История визитов", n: "home" },
          { r: "Избранные услуги", n: "catalog" },
          { r: "Любимые мастера", n: "home" },
          { r: "Подарочные сертификаты", n: "catalog" },
          { r: "Поддержка и помощь", n: "catalog" },
        ].map((row) => (
          <button type="button" key={row.r} onClick={() => onTabChange(row.n)}
            className="flex items-center justify-between w-full gs-press"
            style={{ padding: "0 20px", minHeight: 56, borderBottom: `1px solid ${HAIR}` }}>
            <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 500, color: INK }}>{row.r}</span>
            <ChevronRight size={IC.md} color={MUTED} strokeWidth={SW} aria-hidden="true" />
          </button>
        ))}
      </nav>
    </div>
  );

  /* --------------- ДЕТАЛЬ УСЛУГИ --------------- */
  const detailClose = useRef<HTMLButtonElement>(null);
  const detailDialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) { const t = setTimeout(() => detailClose.current?.focus(), 70); return () => clearTimeout(t); }
  }, [selected]);

  const Detail = selected && (() => {
    const m = masterById(selected.master);
    const similar = SERVICES.filter((x) => x.id !== selected.id && x.cat === selected.cat).slice(0, 4);
    return (
      <div ref={detailDialog} className="fixed inset-0 z-[10000] flex justify-center" style={{ background: CANVAS, fontFamily: SANS }}
        role="dialog" aria-modal="true" aria-label={selected.name}
        onKeyDown={(e) => { if (e.key === "Escape") setSelected(null); trapTab(e, detailDialog.current); }}>
        <div className="w-full flex flex-col" style={{ maxWidth: 448, animation: "gsSheet .4s cubic-bezier(.22,1,.36,1) both" }}>
          <div key={selected.id} className="flex-1 overflow-y-auto scrollbar-hide" style={{ minHeight: 0, paddingBottom: 104 }}>
            {/* фото-герой */}
            <div className="relative" style={{ height: 392, overflow: "hidden" }}>
              <Img src={selected.img} alt={selected.name} priority />
              <div className="absolute inset-0" aria-hidden="true"
                style={{ background: "linear-gradient(180deg, rgba(28,23,19,0.34) 0%, rgba(28,23,19,0) 30%, rgba(28,23,19,0) 70%, rgba(244,239,231,1) 100%)" }} />
              <div className="absolute flex items-center justify-between" style={{ left: 16, right: 16, top: "calc(env(safe-area-inset-top, 0px) + 14px)" }}>
                <button type="button" ref={detailClose} onClick={() => setSelected(null)} aria-label="Назад"
                  className="flex items-center justify-center gs-press"
                  style={{ width: 46, height: 46, borderRadius: 999, background: "rgba(255,255,255,0.92)" }}>
                  <ArrowLeft size={IC.md} color={INK} strokeWidth={SW} />
                </button>
                <button type="button" onClick={() => toggleFav(selected.id)} aria-pressed={favs.has(selected.id)}
                  aria-label={favs.has(selected.id) ? "Убрать из избранного" : "В избранное"}
                  className="flex items-center justify-center gs-press"
                  style={{ width: 46, height: 46, borderRadius: 999, background: "rgba(255,255,255,0.92)" }}>
                  <Heart key={favs.has(selected.id) ? "1" : "0"} size={IC.sm} strokeWidth={2.2}
                    fill={favs.has(selected.id) ? ACCENT : "none"} color={favs.has(selected.id) ? ACCENT_DEEP : INK}
                    style={favs.has(selected.id) ? { animation: "gsPop .36s ease-out" } : undefined} />
                </button>
              </div>
            </div>

            <div style={{ padding: "4px 20px 0", marginTop: -8 }}>
              <div style={kicker}>{selected.cat}</div>
              <h1 style={{ ...serif(S.s3, 600), marginTop: 8 }}>{selected.name}</h1>
              <p style={{ fontFamily: SERIF, fontSize: "1.35rem", fontWeight: 500, fontStyle: "italic", color: ACCENT_DEEP, marginTop: 6, lineHeight: 1.3 }}>{selected.tagline}</p>

              <div className="flex items-center" style={{ gap: 14, marginTop: 16 }}>
                <span className="flex items-baseline" style={{ gap: 4 }}>
                  <span style={{ ...serif(S.s2, 600), ...NUM }}>{rub(selected.price)}</span>
                </span>
                <span style={{ width: 1, height: 26, background: LINE }} aria-hidden="true" />
                <span className="flex items-center" style={{ gap: 5, fontFamily: SANS, fontSize: T.sm, color: SUB }}>
                  <Clock size={14} color={MUTED} strokeWidth={2} /> {durStr(selected.min)}
                </span>
                <span className="flex items-center" style={{ gap: 4, fontFamily: SANS, fontSize: T.sm, color: SUB }}>
                  <Stars value={selected.rating} size={13} />
                  <span style={{ fontWeight: 600, color: INK, ...NUM }}>{selected.rating.toFixed(1)}</span>
                  <span style={{ color: MUTED }}>({selected.reviews})</span>
                </span>
              </div>

              <p style={{ fontFamily: SANS, fontSize: T.body, color: SUB, lineHeight: 1.62, marginTop: 18 }}>{selected.desc}</p>

              <div style={{ ...kicker, marginTop: 26 }}>Что входит</div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 0 }}>
                {selected.includes.map((step, i) => (
                  <div key={step} className="flex items-center" style={{ gap: 13, padding: "12px 0", borderBottom: i < selected.includes.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                    <span className="flex items-center justify-center flex-shrink-0" style={{ width: 28, height: 28, borderRadius: 999, background: TINT,
                      fontFamily: SERIF, fontSize: "0.95rem", fontWeight: 600, color: ACCENT_DEEP }}>{i + 1}</span>
                    <span style={{ fontFamily: SANS, fontSize: T.sm, color: INK, fontWeight: 400 }}>{step}</span>
                  </div>
                ))}
              </div>

              <div style={{ ...kicker, marginTop: 26 }}>Ваш мастер</div>
              <div className="flex items-center" style={{ gap: 14, marginTop: 12, background: PAPER, borderRadius: 20, padding: 14 }}>
                <div className="flex-shrink-0" style={{ width: 64, height: 64, borderRadius: 999, overflow: "hidden" }}>
                  <Img src={m.img} alt={m.name} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...serif("1.3rem", 600) }}>{m.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: T.cap, color: SUB, marginTop: 1 }}>{m.role} · {m.exp} {plural(m.exp, ["год", "года", "лет"])} опыта</div>
                  <div className="flex items-center" style={{ gap: 4, marginTop: 5 }}>
                    <Stars value={m.rating} /><span style={{ fontFamily: SANS, fontSize: T.cap, color: INK, fontWeight: 600, ...NUM }}>{m.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center" style={{ gap: 16, marginTop: 18, background: TINT, borderRadius: 18, padding: "15px 17px" }}>
                <div className="flex items-center" style={{ gap: 9 }}>
                  <ShieldCheck size={IC.sm} color={ACCENT_DEEP} strokeWidth={SW} aria-hidden="true" />
                  <span style={{ fontFamily: SANS, fontSize: T.cap, color: INK, fontWeight: 500 }}>Сертифицированные мастера</span>
                </div>
                <div style={{ width: 1, height: 18, background: LINE }} aria-hidden="true" />
                <div className="flex items-center" style={{ gap: 9 }}>
                  <Sparkles size={IC.sm} color={ACCENT_DEEP} strokeWidth={SW} aria-hidden="true" />
                  <span style={{ fontFamily: SANS, fontSize: T.cap, color: INK, fontWeight: 500 }}>Премиум-косметика</span>
                </div>
              </div>

              {similar.length > 0 && (
                <>
                  <div style={{ ...kicker, marginTop: 28 }}>Похожие услуги</div>
                  <div className="overflow-x-auto scrollbar-hide gs-strip" style={{ marginTop: 12, marginLeft: -20, marginRight: -20 }}>
                    <div className="flex" style={{ gap: 12, padding: "0 20px 4px", width: "max-content" }}>
                      {similar.map((x, i) => (
                        <ServiceCard key={x.id} s={x} idx={i} w={186} fav={favs.has(x.id)} onFav={() => toggleFav(x.id)} onOpen={() => setSelected(x)} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div style={{ height: 16 }} />
          </div>

          {/* нижняя панель */}
          <div style={{ flexShrink: 0, background: CANVAS, borderTop: `1px solid ${LINE}`, padding: "12px 20px max(16px, env(safe-area-inset-bottom))" }}>
            <button type="button" onClick={() => { addBooking(selected.id); setSelected(null); onTabChange("cart"); }}
              className="flex items-center justify-between gs-press"
              style={{ width: "100%", height: 56, borderRadius: 999, background: INK, padding: "0 14px 0 24px" }}>
              <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 600, color: CANVAS }}>Записаться</span>
              <span className="flex items-center" style={{ gap: 12 }}>
                <span style={{ fontFamily: SANS, fontSize: T.body, fontWeight: 700, color: CANVAS, ...NUM }}>{rub(selected.price)}</span>
                <span className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 999, background: ACCENT }}>
                  <Calendar size={15} color="#FFFFFF" strokeWidth={2.4} />
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  })();

  return (
    <div className="gs relative" style={{ minHeight: "100%", background: CANVAS, fontFamily: SANS }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap');
.gs,.gs *{font-family:${SANS}}
.gs *:focus-visible{outline:2px solid ${ACCENT_DEEP};outline-offset:2px;border-radius:8px}
.gs button,.gs [role=button],.gs input{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.gs-press{transition:transform .15s ease,opacity .15s ease}
.gs-press:active{transform:scale(.95);opacity:.9}
.gs-card{transition:transform .17s cubic-bezier(.22,1,.36,1);box-shadow:0 1px 2px rgba(38,33,28,0.04),0 20px 38px -24px rgba(38,33,28,0.30)}
.gs-card:active{transform:scale(.978)}
.gs-tile{transition:transform .2s cubic-bezier(.22,1,.36,1);box-shadow:0 2px 8px rgba(38,33,28,0.10),0 24px 46px -26px rgba(38,33,28,0.46)}
.gs-tile:active{transform:scale(.985)}
.gs-strip{scroll-snap-type:x proximity}
.gs-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.gs-shim{background:linear-gradient(100deg,#e7ddcf 30%,#f1ebe0 50%,#e7ddcf 70%);background-size:220% 100%;animation:gsShim 1.3s linear infinite}
@keyframes gsShim{from{background-position:220% 0}to{background-position:-220% 0}}
@keyframes gsUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes gsSheet{from{opacity:0;transform:translateY(42px)}to{opacity:1;transform:none}}
@keyframes gsFade{from{opacity:0}to{opacity:1}}
@keyframes gsPop{0%{transform:scale(1)}40%{transform:scale(1.32)}100%{transform:scale(1)}}
@keyframes gsSpin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion: reduce){.gs *,.gs *::before,.gs *::after{transition-duration:.01ms!important;animation-duration:.01ms!important}}
`}</style>
      {activeTab === "home" && Home}
      {activeTab === "catalog" && Catalog}
      {activeTab === "cart" && Booking}
      {activeTab === "profile" && Profile}
      {toast && (
        <div className="fixed left-1/2 flex items-center" role="status" aria-live="polite" style={{
          bottom: 128, transform: "translateX(-50%)", gap: 9, zIndex: 10001,
          background: INK, color: CANVAS, padding: "13px 18px", borderRadius: 999, fontFamily: SANS, fontSize: T.sm, fontWeight: 500,
          boxShadow: "0 14px 34px rgba(38,33,28,0.34)", maxWidth: "90vw",
        }}>
          <Check size={IC.sm} color={ACCENT} strokeWidth={2.6} aria-hidden="true" /> {toast}
        </div>
      )}
      {Detail && createPortal(<div className="gs">{Detail}</div>, document.body)}
    </div>
  );
}

export default memo(Beauty);
