import React, { useState, useRef, useEffect, memo } from "react";
import { m, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  Search, ShoppingBag, User, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft,
  ChevronDown, Heart, Share2, Plus, Minus, X, Check, Star, Snowflake, Package,
  Truck, RotateCcw, ShieldCheck, SlidersHorizontal, Maximize2,
} from "lucide-react";
import { scrollToTop } from "@/hooks/useScrollToTop";
import { usePersistentCart } from "@/hooks/usePersistentCart";
import { usePersistentOrders } from "@/hooks/usePersistentOrders";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/shared/EmptyState";
import { CheckoutDrawer } from "@/components/shared/CheckoutDrawer";
import { DemoThemeProvider } from "@/components/shared";
import { products, banners, categories, reviewPool, type Product, type Cat } from "./StrayStore.data";

const STORE = "stray-store";

/* ============================================================================
   STRAY — минималистичный стритвир-магазин. Монохром (чернила #0A0A0B на тёплом
   #F6F6F4), тонкие линии, чёрные pill-CTA, mono + табличные цифры для цен.
   Awwwards-grade: скелетоны+fade картинок, маркиза, lookbook, shared-element
   вход в PDP, успех добавления с хаптикой, поиск, сортировка.
============================================================================ */
const C = {
  bg: "#F6F6F4", surface: "#FFFFFF", ink: "#0A0A0B", ink2: "#34343A",
  muted: "#6B6B73", faint: "#9A9AA2", line: "#EAEAEA", lineMid: "#DFDFDE",
  wash: "#EEEEEB", onInk: "#FFFFFF", danger: "#D64531",
};
const R = { card: 22, lg: 18, md: 14, sm: 10, pill: 999 };
const F = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
const FM = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";
const EASE: number[] = [0.22, 0.61, 0.36, 1];
const EMPH: number[] = [0.2, 0, 0, 1];
const EXPO: number[] = [0.16, 1, 0.3, 1];
const SPRING = { type: "spring" as const, stiffness: 360, damping: 30, mass: 0.85 };
const POP = { type: "spring" as const, stiffness: 600, damping: 18 };
const elev = {
  card: "0 1px 2px rgba(10,10,11,0.04), 0 8px 24px rgba(10,10,11,0.06)",
  pop: "0 18px 50px rgba(10,10,11,0.18)",
  ink: "0 12px 28px rgba(10,10,11,0.28)",
};

const fmt = (n: number) => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);
const plural = (n: number, a: string, b: string, c: string) => { const m10 = n % 10, m100 = n % 100; if (m10 === 1 && m100 !== 11) return a; if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b; return c; };
const haptic = (ms = 10) => { try { (navigator as any).vibrate?.(ms); } catch { /* noop */ } };
// On-the-fly image optimization. Source CDN serves ~1.8 MB PNGs and ignores resize
// params, so we proxy through wsrv.nl (resize + WebP) — cuts each image ~50× and
// dramatically speeds first paint. No re-hosting required.
const opt = (url: string, w: number, q = 80) =>
  url && /^https?:\/\//.test(url) ? `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${w}&output=webp&q=${q}&we=1` : url;

function StrayStyles() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
.st-tap{ -webkit-tap-highlight-color:transparent; cursor:pointer; transition:transform .14s cubic-bezier(0.2,0,0,1), opacity .14s, background .18s, border-color .18s, color .18s; }
.st-tap:active{ transform:scale(0.96); }
.st-tap:focus-visible{ outline:2.5px solid ${C.ink}; outline-offset:2px; border-radius:12px; }
.st-hide::-webkit-scrollbar{ display:none; } .st-hide{ scrollbar-width:none; -webkit-overflow-scrolling:touch; }
.st-skel{ background:linear-gradient(100deg, ${C.wash} 28%, #F7F7F5 50%, ${C.wash} 72%); background-size:200% 100%; animation:stShimmer 1.25s ease-in-out infinite; }
.st-img{ opacity:0; transition:opacity .55s ease, transform .55s cubic-bezier(0.2,0,0,1); transform:scale(1.03); }
.st-img.is-load{ opacity:1; transform:scale(1); }
@keyframes stShimmer{ 0%{background-position:-180% 0} 100%{background-position:180% 0} }
@keyframes stMarquee{ from{transform:translateX(0)} to{transform:translateX(-50%)} }
.st-marquee{ display:inline-flex; white-space:nowrap; will-change:transform; animation:stMarquee 24s linear infinite; }
@media (prefers-reduced-motion: reduce){ *{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important} .st-tap:active{transform:none} .st-img{opacity:1;transform:none} }
` }} />
  );
}

/* -------------------------------- atoms ----------------------------------- */
function Mono({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <span style={{ fontFamily: FM, fontSize: 10.5, fontWeight: 500, letterSpacing: "0.02em", color: C.muted, ...style }}>{children}</span>;
}
function Price({ value, size = 14, color = C.ink, strike = false }: { value: number; size?: number; color?: string; strike?: boolean }) {
  return <span style={{ fontFamily: FM, fontSize: size, fontWeight: strike ? 500 : 700, color, fontVariantNumeric: "tabular-nums", textDecoration: strike ? "line-through" : "none", opacity: strike ? 0.5 : 1 }}>{fmt(value)}</span>;
}
function Tag({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "light" }) {
  const dark = tone === "ink";
  return <span style={{ fontFamily: FM, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 9px", borderRadius: R.pill, background: dark ? C.ink : "rgba(255,255,255,0.86)", color: dark ? C.onInk : C.ink, backdropFilter: dark ? undefined : "blur(8px)" }}>{children}</span>;
}
function IconBtn({ children, label, onClick, badge, testId, solid }: { children: React.ReactNode; label: string; onClick?: () => void; badge?: number; testId?: string; solid?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} data-testid={testId} className="st-tap" style={{ position: "relative", width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: solid ? C.ink : C.surface, color: solid ? C.onInk : C.ink, border: `1px solid ${solid ? C.ink : C.line}`, flexShrink: 0, boxShadow: elev.card }}>
      {children}
      {badge != null && badge > 0 && <m.span key={badge} initial={{ scale: 0.3 }} animate={{ scale: 1 }} transition={POP} style={{ position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, padding: "0 4px", borderRadius: R.pill, background: C.ink, color: C.onInk, fontFamily: FM, fontSize: 10, fontWeight: 700, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.bg}` }}>{badge}</m.span>}
    </button>
  );
}
function Img({ src, alt, fit = "contain", radius = 0, w = 600, priority = false, style }: { src: string; alt: string; fit?: "contain" | "cover"; radius?: number; w?: number; priority?: boolean; style?: React.CSSProperties }) {
  const [on, setOn] = useState(false);
  const base: React.CSSProperties = fit === "cover"
    ? { width: "100%", height: "100%", objectFit: "cover" }
    : { maxWidth: "88%", maxHeight: "88%", width: "auto", objectFit: "contain" };
  return (
    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: radius }}>
      {!on && <span className="st-skel" style={{ position: "absolute", inset: 0 }} aria-hidden />}
      <img src={opt(src, w)} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" onLoad={() => setOn(true)} className={`st-img${on ? " is-load" : ""}`} style={{ ...base, position: "relative", zIndex: 1, ...style }} />
    </span>
  );
}
function Stars({ n, size = 12 }: { n: number; size?: number }) {
  const full = Math.round(n);
  return <span style={{ display: "inline-flex", gap: 1.5 }} aria-label={`Рейтинг ${n}`}>{[...Array(5)].map((_, i) => <Star key={i} style={{ width: size, height: size }} fill={i < full ? C.ink : "transparent"} color={i < full ? C.ink : C.faint} strokeWidth={1.6} />)}</span>;
}
function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, padding: "10px 0", background: C.ink }}>
      <div className="st-marquee">
        {row.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 14, paddingRight: 14 }}>
            <span style={{ fontFamily: FM, fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.onInk }}>{t}</span>
            <Star style={{ width: 10, height: 10, color: C.onInk }} fill={C.onInk} />
          </span>
        ))}
      </div>
    </div>
  );
}
function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-end justify-between px-5" style={{ marginBottom: 13 }}>
      <h2 style={{ fontFamily: F, fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink, margin: 0 }}>{title}</h2>
      {action && <button onClick={onAction} className="st-tap" style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: 0, fontFamily: F, fontSize: 13, fontWeight: 600, color: C.muted }}>{action}<ChevronRight style={{ width: 15, height: 15 }} /></button>}
    </div>
  );
}
function Card({ p, w, onOpen, isFav, onFav }: { p: Product; w: number; onOpen: () => void; isFav: boolean; onFav: () => void }) {
  return (
    <div style={{ width: w, flexShrink: 0 }}>
      <div style={{ position: "relative", borderRadius: R.lg, background: C.surface, border: `1px solid ${C.line}`, height: w * 1.16, overflow: "hidden", boxShadow: elev.card }}>
        <button onClick={onOpen} className="st-tap" aria-label={p.name} data-testid={`card-${p.id}`} style={{ position: "absolute", inset: 0, background: "none", border: 0, padding: 0 }}>
          <Img src={p.img} alt={p.name} />
        </button>
        {p.tag && <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2 }}><Tag tone={p.tag === "−15%" || p.tag === "Хит" ? "ink" : "light"}>{p.tag}</Tag></div>}
        <button onClick={onFav} className="st-tap" aria-label="В избранное" aria-pressed={isFav} style={{ position: "absolute", top: 8, right: 8, zIndex: 2, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.82)", backdropFilter: "blur(8px)", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Heart style={{ width: 15, height: 15 }} fill={isFav ? C.ink : "transparent"} color={isFav ? C.ink : C.muted} strokeWidth={1.8} /></button>
      </div>
      <button onClick={onOpen} className="st-tap" style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: 0, padding: "10px 2px 0" }}>
        <Mono style={{ fontSize: 9.5, color: C.faint }}>{p.series}</Mono>
        <p style={{ fontFamily: F, fontSize: 13.5, fontWeight: 600, color: C.ink, margin: "3px 0 6px", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
        <div className="flex items-center" style={{ gap: 8 }}>
          <Price value={p.price} />
          {p.oldPrice && <Price value={p.oldPrice} size={11} color={C.faint} strike />}
        </div>
      </button>
    </div>
  );
}

function Lookbook({ product, onOpen }: { product: Product; onOpen: () => void }) {
  return (
    <div className="px-4" style={{ marginTop: 32 }}>
      <div style={{ position: "relative", height: 460, borderRadius: R.card, overflow: "hidden", background: C.wash, boxShadow: elev.card }}>
        <Img src={product.img} alt={product.name} fit="contain" w={920} style={{ maxHeight: "94%", maxWidth: "96%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,11,0.36) 0%, rgba(10,10,11,0) 30%, rgba(10,10,11,0) 55%, rgba(10,10,11,0.62) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 18, left: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: FM, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.16em", color: "rgba(255,255,255,0.92)" }}>LOOKBOOK</span>
          <span style={{ fontFamily: FM, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)" }}>FW26</span>
        </div>
        <div style={{ position: "absolute", left: 20, right: 20, bottom: 20 }}>
          <h2 style={{ fontFamily: F, fontSize: 32, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.98, color: "#fff", margin: "0 0 12px" }}>Образ<br />недели</h2>
          <button onClick={onOpen} className="st-tap" data-testid="lookbook-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: R.pill, background: "#fff", color: C.ink, fontFamily: F, fontSize: 14, fontWeight: 700, border: 0 }}>Смотреть образ<ArrowRight style={{ width: 16, height: 16 }} /></button>
        </div>
      </div>
    </div>
  );
}

function StrayApp({ activeTab, onTabChange, onCartCount }: { activeTab: "home" | "catalog" | "cart" | "profile"; onTabChange?: (t: string) => void; onCartCount?: (n: number) => void }) {
  const { toast } = useToast();
  const { cartItems: cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount: cartTotal, totalItems: cartCount } = usePersistentCart({ storageKey: `${STORE}_cart` });
  const { orders, createOrder, ordersCount } = usePersistentOrders({ storageKey: `${STORE}_orders` });

  const [browse, setBrowse] = useState<Product[]>(products);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [dir, setDir] = useState(1);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [justAdded, setJustAdded] = useState(false);
  const [acc, setAcc] = useState<string | null>("desc");
  const sizeSecRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [fav, setFav] = useState<Set<string>>(new Set());
  const [cat, setCat] = useState<Cat | "Все">("Все");
  const [sort, setSort] = useState<"pop" | "new" | "asc" | "desc">("pop");
  const [heroIdx, setHeroIdx] = useState(0);
  const [checkout, setCheckout] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { onCartCount?.(cartCount); }, [cartCount, onCartCount]);
  useEffect(() => {
    if (openIdx != null || searchOpen) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % banners.length), 4400);
    return () => clearInterval(t);
  }, [openIdx, searchOpen]);
  useEffect(() => { if (openIdx != null || searchOpen) scrollToTop(); }, [openIdx, searchOpen]);

  const pdp = openIdx != null ? browse[openIdx] : null;
  const isFav = (id: string) => fav.has(id);
  const toggleFav = (id: string) => { haptic(8); setFav((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const openPDP = (p: Product, list: Product[] = products) => { setBrowse(list); setDir(1); setOpenIdx(Math.max(0, list.findIndex((x) => x.id === p.id))); setSearchOpen(false); setZoom(false); };
  const pdpGo = (nd: number) => setOpenIdx((i) => { if (i == null) return i; const n = i + nd; return n < 0 || n >= browse.length ? i : (setDir(nd), n); });
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEndPdp = (e: React.TouchEvent) => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) dx < 0 ? pdpGo(1) : pdpGo(-1); touch.current = null; };
  const onTouchEndHero = (e: React.TouchEvent) => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x; if (Math.abs(dx) > 44) setHeroIdx((i) => (i + (dx < 0 ? 1 : banners.length - 1)) % banners.length); touch.current = null; };

  const addItem = (p: Product, size: string, fromPdp = false) => {
    addToCart({ id: `${p.id}-${size}`, name: p.name, price: p.price, image: p.img, size, color: p.colorway });
    haptic(12);
    if (fromPdp) { setJustAdded(true); window.setTimeout(() => setJustAdded(false), 1500); }
    toast({ title: "В корзине", description: `${p.name} · ${size}`, duration: 1800 });
  };
  const addFromPdp = () => { if (!pdp) return; const s = chosen[pdp.id]; if (!s) { sizeSecRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); toast({ title: "Выберите размер", duration: 1600 }); return; } addItem(pdp, s, true); };
  const handleCheckout = (orderId: string) => { createOrder(cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, size: i.size, color: i.color })), cartTotal, { address: "Москва", phone: "+7 (999) 100-20-30" }); clearCart(); setCheckout(false); toast({ title: "Заказ оформлен", description: `Номер: ${orderId}`, duration: 3000 }); };

  const TopBar = () => (
    <div className="flex items-center justify-between px-4" style={{ paddingTop: "max(12px, env(safe-area-inset-top))", paddingBottom: 10 }}>
      <IconBtn label="Профиль" testId="button-profile" onClick={() => onTabChange?.("profile")}><User style={{ width: 19, height: 19 }} /></IconBtn>
      <div style={{ fontFamily: F, fontSize: 19, fontWeight: 900, letterSpacing: "0.26em", color: C.ink, paddingLeft: "0.26em" }}>STRAY</div>
      <div className="flex items-center" style={{ gap: 8 }}>
        <IconBtn label="Поиск" testId="button-search" onClick={() => setSearchOpen(true)}><Search style={{ width: 18, height: 18 }} /></IconBtn>
        <IconBtn label="Корзина" testId="button-cart" onClick={() => onTabChange?.("cart")} badge={cartCount}><ShoppingBag style={{ width: 18, height: 18 }} /></IconBtn>
      </div>
    </div>
  );

  const stagger = { s: { transition: { staggerChildren: 0.05 } }, h: {} };
  const fadeUp = { h: { opacity: 0, y: 16 }, s: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EXPO } } };

  /* ------------------------------- HOME ---------------------------------- */
  const renderHome = () => {
    const b = banners[heroIdx];
    const shoes = products.filter((p) => p.cat === "Обувь");
    const fresh = products.filter((p) => p.tag).slice(0, 6);
    const look = products.find((p) => p.id === "sweater") || products[0];
    return (
      <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 100 }}>
        <TopBar />
        <div className="px-4">
          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEndHero} style={{ position: "relative", borderRadius: R.card, overflow: "hidden", height: 432, boxShadow: elev.card }}>
            <AnimatePresence mode="wait">
              <m.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EMPH }} style={{ position: "absolute", inset: 0, background: b.kind === "dark" ? C.ink : b.kind === "light" ? C.wash : "#C9C6BF" }}>
                {b.kind === "image" ? (
                  <Img src={b.img} alt="" fit="cover" w={920} priority />
                ) : (
                  <span style={{ position: "absolute", right: -14, top: 0, bottom: 0, width: "62%" }}><Img src={b.img} alt="" fit="contain" w={760} priority style={{ maxHeight: "86%" }} /></span>
                )}
                <div style={{ position: "absolute", inset: 0, background: b.kind === "image" ? "linear-gradient(180deg, rgba(10,10,11,0.04) 0%, rgba(10,10,11,0.05) 42%, rgba(10,10,11,0.74) 100%)" : "none", zIndex: 2, pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 14, right: 14, zIndex: 3, display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: R.pill, background: "rgba(255,255,255,0.86)", backdropFilter: "blur(8px)" }}><Snowflake style={{ width: 12, height: 12, color: C.ink }} /><span style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, color: C.ink }}>−15% на новинки</span></div>
                <div style={{ position: "absolute", left: 20, right: 20, bottom: 22, zIndex: 3 }}>
                  <span style={{ fontFamily: FM, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: b.kind === "image" || b.kind === "dark" ? "rgba(255,255,255,0.82)" : C.muted }}>{b.kicker}</span>
                  <h1 style={{ fontFamily: F, fontSize: 38, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.96, margin: "8px 0 8px", whiteSpace: "pre-line", color: b.kind === "image" || b.kind === "dark" ? "#fff" : C.ink }}>{b.title}</h1>
                  <p style={{ fontFamily: F, fontSize: 13, lineHeight: 1.45, maxWidth: 230, marginBottom: 16, color: b.kind === "image" || b.kind === "dark" ? "rgba(255,255,255,0.86)" : C.muted }}>{b.sub}</p>
                  <button onClick={() => onTabChange?.("catalog")} className="st-tap" data-testid="hero-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: R.pill, background: b.kind === "image" || b.kind === "dark" ? "#fff" : C.ink, color: b.kind === "image" || b.kind === "dark" ? C.ink : "#fff", fontFamily: F, fontSize: 14, fontWeight: 700, border: 0 }}>{b.cta}<ArrowRight style={{ width: 16, height: 16 }} /></button>
                </div>
              </m.div>
            </AnimatePresence>
            <div style={{ position: "absolute", left: 20, top: 18, zIndex: 4, display: "flex", gap: 6 }}>
              {banners.map((_, i) => <span key={i} style={{ width: i === heroIdx ? 22 : 7, height: 4, borderRadius: 999, background: i === heroIdx ? "#fff" : "rgba(255,255,255,0.5)", transition: "all .3s" }} />)}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18 }}><Marquee items={["Бесплатная доставка от 10 000 ₽", "Новый дроп FW26", "−15% на новинки", "Оригинал 100%", "Возврат 14 дней"]} /></div>
        <div style={{ marginTop: 26 }}>
          <SectionHead title="Категории" />
          <div className="flex st-hide" style={{ gap: 10, overflowX: "auto", padding: "0 20px" }}>
            {categories.map((c) => (
              <button key={c.key} onClick={() => { setCat(c.key); onTabChange?.("catalog"); }} className="st-tap" data-testid={`cat-${c.key}`} style={{ flexShrink: 0, width: 96, textAlign: "center", background: "none", border: 0 }}>
                <div style={{ position: "relative", height: 96, borderRadius: R.lg, background: C.surface, border: `1px solid ${C.line}`, marginBottom: 8, overflow: "hidden" }}><Img src={c.img} alt={c.label} /></div>
                <span style={{ fontFamily: F, fontSize: 12.5, fontWeight: 600, color: C.ink }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
        {shoes.length > 0 && <div style={{ marginTop: 28 }}>
          <SectionHead title="Кроссовки" action="Все" onAction={() => { setCat("Обувь"); onTabChange?.("catalog"); }} />
          <div className="flex st-hide" style={{ gap: 14, overflowX: "auto", padding: "0 20px 4px" }}>
            {shoes.map((p) => <Card key={p.id} p={p} w={168} onOpen={() => openPDP(p, shoes)} isFav={isFav(p.id)} onFav={() => toggleFav(p.id)} />)}
          </div>
        </div>}
        <Lookbook product={look} onOpen={() => openPDP(look, products)} />
        <div style={{ marginTop: 30 }}>
          <SectionHead title="Новинки и хиты" action="Все" onAction={() => { setCat("Все"); onTabChange?.("catalog"); }} />
          <m.div variants={stagger} initial="h" animate="s" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "0 20px" }}>
            {fresh.map((p) => <m.div key={p.id} variants={fadeUp}><Card p={p} w={(440 - 40 - 14) / 2} onOpen={() => openPDP(p, fresh)} isFav={isFav(p.id)} onFav={() => toggleFav(p.id)} /></m.div>)}
          </m.div>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "26px 20px 0" }}>
          {[{ I: Truck, t: "Доставка", s: "1–3 дня" }, { I: RotateCcw, t: "Возврат", s: "14 дней" }, { I: ShieldCheck, t: "Оригинал", s: "100%" }].map((x) => (
            <div key={x.t} style={{ flex: 1, padding: "14px 10px", borderRadius: R.md, border: `1px solid ${C.line}`, background: C.surface, textAlign: "center" }}>
              <x.I style={{ width: 18, height: 18, color: C.ink, margin: "0 auto 7px" }} strokeWidth={1.7} />
              <p style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: C.ink, margin: 0 }}>{x.t}</p>
              <Mono style={{ fontSize: 9.5, color: C.faint }}>{x.s}</Mono>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ------------------------------ CATALOG -------------------------------- */
  const renderCatalog = () => {
    const base = cat === "Все" ? products : products.filter((p) => p.cat === cat);
    const sorted = [...base].sort((a, b) => sort === "asc" ? a.price - b.price : sort === "desc" ? b.price - a.price : sort === "new" ? (b.tag === "Новинка" ? 1 : 0) - (a.tag === "Новинка" ? 1 : 0) : b.reviews - a.reviews);
    const chips: (Cat | "Все")[] = ["Все", "Одежда", "Обувь", "Шапки", "Сумки"];
    const countOf = (k: Cat | "Все") => k === "Все" ? products.length : products.filter((p) => p.cat === k).length;
    const sorts: { k: typeof sort; l: string }[] = [{ k: "pop", l: "Популярное" }, { k: "new", l: "Новинки" }, { k: "asc", l: "Сначала дешевле" }, { k: "desc", l: "Сначала дороже" }];
    return (
      <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 100 }}>
        <TopBar />
        <div className="px-5" style={{ paddingBottom: 6 }}>
          <h1 style={{ fontFamily: F, fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", color: C.ink, margin: 0 }}>Каталог</h1>
          <Mono style={{ fontSize: 11 }}>{sorted.length} {plural(sorted.length, "товар", "товара", "товаров")}</Mono>
        </div>
        <div className="flex st-hide" style={{ gap: 8, overflowX: "auto", padding: "10px 20px 10px" }}>
          {chips.map((ch) => { const on = cat === ch; return (
            <button key={ch} onClick={() => setCat(ch)} className="st-tap" data-testid={`filter-${ch}`} style={{ flexShrink: 0, height: 38, padding: "0 14px", borderRadius: R.pill, background: on ? C.ink : C.surface, color: on ? C.onInk : C.ink, border: `1px solid ${on ? C.ink : C.line}`, fontFamily: F, fontSize: 13, fontWeight: on ? 700 : 600, display: "inline-flex", alignItems: "center", gap: 6 }}>{ch}<span style={{ fontFamily: FM, fontSize: 10, fontWeight: 600, color: on ? "rgba(255,255,255,0.7)" : C.faint }}>{countOf(ch)}</span></button>
          ); })}
        </div>
        <div className="flex st-hide items-center" style={{ gap: 8, overflowX: "auto", padding: "0 20px 14px" }}>
          <SlidersHorizontal style={{ width: 15, height: 15, color: C.muted, flexShrink: 0 }} />
          {sorts.map((s) => { const on = sort === s.k; return (
            <button key={s.k} onClick={() => setSort(s.k)} className="st-tap" data-testid={`sort-${s.k}`} style={{ flexShrink: 0, height: 32, padding: "0 12px", borderRadius: R.pill, background: on ? C.wash : "transparent", color: on ? C.ink : C.muted, border: `1px solid ${on ? C.lineMid : "transparent"}`, fontFamily: F, fontSize: 12.5, fontWeight: on ? 700 : 500 }}>{s.l}</button>
          ); })}
        </div>
        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 24px" }}><Package style={{ width: 30, height: 30, color: C.faint, margin: "0 auto 14px" }} strokeWidth={1.5} /><p style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.ink, margin: "0 0 6px" }}>Пока пусто</p><p style={{ fontFamily: F, fontSize: 13, color: C.muted, margin: 0 }}>В этой категории скоро появятся товары</p></div>
        ) : (
          <m.div key={cat + sort} variants={stagger} initial="h" animate="s" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "2px 20px 0" }}>
            {sorted.map((p) => <m.div key={p.id} variants={fadeUp}><Card p={p} w={(440 - 40 - 14) / 2} onOpen={() => openPDP(p, sorted)} isFav={isFav(p.id)} onFav={() => toggleFav(p.id)} /></m.div>)}
          </m.div>
        )}
      </div>
    );
  };

  /* -------------------------------- CART --------------------------------- */
  const renderCart = () => (
    <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 210 }}>
      <TopBar />
      <div className="px-5" style={{ paddingBottom: 4 }}>
        <h1 style={{ fontFamily: F, fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", color: C.ink, margin: 0 }}>Корзина</h1>
        <Mono style={{ fontSize: 11 }}>{cartCount} {plural(cartCount, "товар", "товара", "товаров")}</Mono>
      </div>
      <div className="px-4" style={{ paddingTop: 14 }}>
        {cart.length === 0 ? (
          <EmptyState type="cart" title="Корзина пуста" description="Добавьте вещи из каталога" actionLabel="В каталог" onAction={() => onTabChange?.("catalog")} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence>
              {cart.map((it) => (
                <m.div key={it.id} layout exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }} style={{ display: "flex", gap: 13, padding: 12, borderRadius: R.lg, background: C.surface, border: `1px solid ${C.line}`, alignItems: "center" }} data-testid={`cart-${it.id}`}>
                  <div style={{ position: "relative", width: 64, height: 64, borderRadius: R.md, background: C.wash, flexShrink: 0, overflow: "hidden" }}>{it.image ? <Img src={it.image} alt="" w={220} /> : <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><Package style={{ width: 20, height: 20, color: C.faint }} /></span>}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Mono style={{ fontSize: 9, color: C.faint }}>{it.color} · {it.size}</Mono>
                    <p style={{ fontFamily: F, fontSize: 13.5, fontWeight: 600, color: C.ink, margin: "2px 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</p>
                    <div className="flex items-center justify-between">
                      <Price value={it.price * it.quantity} size={14} />
                      <div style={{ display: "flex", alignItems: "center", gap: 2, border: `1px solid ${C.lineMid}`, borderRadius: R.pill, padding: 2 }}>
                        <button onClick={() => { haptic(6); updateQuantity(it.id, it.quantity - 1, it.size, it.color); }} className="st-tap" aria-label="Меньше" style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: 0 }}><Minus style={{ width: 13, height: 13, color: C.ink }} /></button>
                        <span style={{ width: 20, textAlign: "center", fontFamily: FM, fontSize: 13, fontWeight: 700, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{it.quantity}</span>
                        <button onClick={() => { haptic(6); updateQuantity(it.id, it.quantity + 1, it.size, it.color); }} className="st-tap" aria-label="Больше" style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: C.ink, border: 0 }}><Plus style={{ width: 13, height: 13, color: C.onInk }} /></button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(it.id, it.size, it.color)} className="st-tap" aria-label="Удалить" style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-start", border: `1px solid ${C.line}`, background: "none" }}><X style={{ width: 14, height: 14, color: C.muted }} /></button>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      {cart.length > 0 && createPortal(
        <div style={{ position: "fixed", bottom: "calc(64px + max(12px, env(safe-area-inset-bottom, 0px)))", left: 0, right: 0, zIndex: 9992, padding: "14px 20px 16px", borderTop: `1px solid ${C.line}`, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: "0 -10px 30px rgba(10,10,11,0.06)" }}>
          {(() => { const TH = 10000; const left = Math.max(0, TH - cartTotal); const pct = Math.min(100, Math.round((cartTotal / TH) * 100)); return (
            <div style={{ marginBottom: 14 }}>
              <div className="flex items-center" style={{ gap: 7, marginBottom: 8, color: left > 0 ? C.ink2 : "#1B873F" }}>{left > 0 ? <Truck style={{ width: 14, height: 14 }} /> : <Check style={{ width: 14, height: 14 }} strokeWidth={3} />}<span style={{ fontFamily: F, fontSize: 12, fontWeight: 600 }}>{left > 0 ? "До бесплатной доставки " : "Бесплатная доставка применится"}{left > 0 && <span style={{ fontFamily: FM, fontWeight: 700, color: C.ink }}>{fmt(left)}</span>}</span></div>
              <div style={{ height: 6, borderRadius: 999, background: C.wash, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: left > 0 ? C.ink : "#1B873F", transition: "width .45s cubic-bezier(0.2,0,0,1)" }} /></div>
            </div>
          ); })()}
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}><span style={{ fontFamily: F, fontSize: 14, color: C.muted }}>Подытог</span><Price value={cartTotal} size={24} /></div>
          <button onClick={() => setCheckout(true)} className="st-tap" data-testid="button-checkout" style={{ width: "100%", height: 54, borderRadius: R.pill, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: C.ink, color: C.onInk, fontFamily: F, fontSize: 15, fontWeight: 700, border: 0, boxShadow: elev.ink }}>Оформить заказ <ArrowRight style={{ width: 17, height: 17 }} /></button>
        </div>, document.body)}
    </div>
  );

  /* ------------------------------ PROFILE -------------------------------- */
  const renderProfile = () => {
    const spent = orders.reduce((a, o) => a + o.total, 0);
    return (
      <div style={{ minHeight: "100vh", background: C.bg, paddingBottom: 100 }}>
        <TopBar />
        <div className="px-5" style={{ paddingTop: 4 }}>
          <div className="flex items-center" style={{ gap: 16, marginBottom: 24 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: C.onInk }}>С</span></div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: F, fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1, marginBottom: 5 }}>Семён Крайнов</h1>
              <Mono style={{ fontSize: 11, display: "block", marginBottom: 9 }}>+7 999 100-20-30</Mono>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: R.pill, border: `1px solid ${C.lineMid}` }}><Star style={{ width: 11, height: 11, color: C.ink }} fill={C.ink} /><span style={{ fontFamily: FM, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.1em", color: C.ink }}>STRAY MEMBER</span></span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {[{ l: "Заказы", v: String(ordersCount) }, { l: "Избранное", v: String(fav.size) }, { l: "Потрачено", v: spent > 0 ? `${Math.round(spent / 1000)}К` : "0" }].map((s) => (
              <div key={s.l} style={{ padding: "16px 8px", borderRadius: R.md, border: `1px solid ${C.line}`, background: C.surface, textAlign: "center" }}><p style={{ fontFamily: FM, fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1, margin: "0 0 6px", fontVariantNumeric: "tabular-nums" }}>{s.v}</p><span style={{ fontFamily: F, fontSize: 10.5, color: C.muted, fontWeight: 600 }}>{s.l}</span></div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
            {["Мои заказы", "Избранное", "Адреса доставки", "Способы оплаты", "Настройки"].map((l) => (
              <button key={l} className="st-tap" data-testid={`prof-${l}`} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: 15, borderRadius: R.md, border: `1px solid ${C.line}`, background: C.surface }} aria-label={l}>
                <span style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: C.ink }}>{l}</span><ChevronRight style={{ width: 16, height: 16, color: C.faint }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /* -------------------------------- PDP ---------------------------------- */
  const coverV = { enter: (d: number) => ({ opacity: 0, x: d > 0 ? 64 : -64 }), center: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: d > 0 ? -64 : 64 }) };
  const renderPDP = (p: Product) => {
    const prev = openIdx != null && openIdx > 0 ? browse[openIdx - 1] : null;
    const next = openIdx != null && openIdx < browse.length - 1 ? browse[openIdx + 1] : null;
    const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const rel = products.filter((x) => x.id !== p.id && x.cat === p.cat);
    const relList = (rel.length >= 2 ? rel : products.filter((x) => x.id !== p.id)).slice(0, 6);
    const sel = chosen[p.id];
    const myReviews = [0, 1, 2].map((i) => reviewPool[(p.name.length + i) % reviewPool.length]);
    const breakdown = [{ s: 5, pct: 82 }, { s: 4, pct: 12 }, { s: 3, pct: 4 }, { s: 2, pct: 1 }, { s: 1, pct: 1 }];
    const sgFirst = p.sizes[0];
    const sgNum = parseInt(sgFirst, 10);
    const chestMap: Record<string, number> = { S: 96, M: 102, L: 108, XL: 114, XXL: 120 };
    const sg = sgFirst === "ONE SIZE"
      ? { label: "", rows: [] as string[][], note: "Универсальный размер — подходит большинству." }
      : !isNaN(sgNum)
        ? (sgNum >= 40
          ? { label: "Длина стопы, см", rows: p.sizes.map((s) => [s, (24.9 + (parseInt(s, 10) - 40) * 0.65).toFixed(1)]), note: "Размеры EU. Замеряйте стопу вечером, стоя." }
          : { label: "Обхват талии, см", rows: p.sizes.map((s) => [s, String(Math.round(parseInt(s, 10) * 2.54))]), note: "Размер указан в дюймах (W)." })
        : { label: "Обхват груди, см", rows: p.sizes.map((s) => [s, String(chestMap[s] ?? 100)]), note: "Замеры по изделию ±2 см." };
    const accs: { k: string; t: string; body?: string; list?: string[]; sizeGuide?: boolean }[] = [
      { k: "desc", t: "Описание", body: p.desc },
      { k: "care", t: "Состав и уход", list: p.details },
      { k: "ship", t: "Доставка и возврат", body: "Доставка по России 1–3 дня, бесплатно от 10 000 ₽. Возврат в течение 14 дней без объяснения причин." },
      { k: "size", t: "Размерная сетка", sizeGuide: true },
    ];
    return (
      <m.div key={"pdp-" + p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: EMPH }} style={{ minHeight: "100dvh", background: C.bg, paddingBottom: 168 }}>
        <div style={{ position: "sticky", top: 0, zIndex: 30, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "max(12px, env(safe-area-inset-top)) 16px 10px", background: "rgba(246,246,244,0.82)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
          <IconBtn label="Назад" testId="pdp-back" onClick={() => setOpenIdx(null)}><ArrowLeft style={{ width: 19, height: 19 }} /></IconBtn>
          <span style={{ fontFamily: FM, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase" }}>{p.series}</span>
          <div className="flex" style={{ gap: 8 }}>
            <IconBtn label="Поделиться"><Share2 style={{ width: 17, height: 17 }} /></IconBtn>
            <IconBtn label="В избранное" onClick={() => toggleFav(p.id)}><Heart style={{ width: 17, height: 17 }} fill={isFav(p.id) ? C.ink : "transparent"} color={C.ink} /></IconBtn>
          </div>
        </div>
        <div onTouchStart={onTouchStart} onTouchEnd={onTouchEndPdp} style={{ position: "relative", height: 384, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {prev && <img src={opt(prev.img, 420)} alt="" aria-hidden loading="lazy" decoding="async" style={{ position: "absolute", left: -52, height: 208, objectFit: "contain", opacity: 0.3, transform: "scale(0.76)", filter: "grayscale(0.25)" }} />}
          {next && <img src={opt(next.img, 420)} alt="" aria-hidden loading="lazy" decoding="async" style={{ position: "absolute", right: -52, height: 208, objectFit: "contain", opacity: 0.3, transform: "scale(0.76)", filter: "grayscale(0.25)" }} />}
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <m.div key={p.id} custom={dir} variants={coverV} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: EASE }} style={{ position: "relative", zIndex: 2 }}>
              <button onClick={() => { haptic(5); setZoom(true); }} className="st-tap" aria-label="Увеличить фото" data-testid="pdp-zoom" style={{ background: "none", border: 0, padding: 0, cursor: "zoom-in" }}>
                <img src={opt(p.img, 760)} alt={p.name} loading="eager" decoding="async" style={{ height: 348, maxWidth: "84vw", objectFit: "contain", filter: "drop-shadow(0 26px 32px rgba(10,10,11,0.2))" }} />
              </button>
            </m.div>
          </AnimatePresence>
          {p.tag && <div style={{ position: "absolute", top: 4, left: 20, zIndex: 3 }}><Tag>{p.tag}</Tag></div>}
          {prev && <button onClick={() => pdpGo(-1)} className="st-tap" aria-label="Предыдущий" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", background: C.surface, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, boxShadow: elev.card }}><ChevronLeft style={{ width: 19, height: 19, color: C.ink }} /></button>}
          {next && <button onClick={() => pdpGo(1)} className="st-tap" aria-label="Следующий" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 38, height: 38, borderRadius: "50%", background: C.surface, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, boxShadow: elev.card }}><ChevronRight style={{ width: 19, height: 19, color: C.ink }} /></button>}
          <div style={{ position: "absolute", right: 14, bottom: 8, zIndex: 3, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.86)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}><Maximize2 style={{ width: 14, height: 14, color: C.ink }} /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "10px 0 4px" }}>
          {browse.map((_, i) => <button key={i} aria-label={`Товар ${i + 1}`} onClick={() => setOpenIdx(i)} className="st-tap" style={{ width: i === openIdx ? 20 : 6, height: 6, borderRadius: 999, background: i === openIdx ? C.ink : C.lineMid, border: 0, padding: 0, transition: "all .3s" }} />)}
        </div>
        <div style={{ padding: "10px 22px 0" }}>
          <div className="flex items-start justify-between" style={{ gap: 12 }}>
            <h1 style={{ fontFamily: F, fontSize: 25, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink, lineHeight: 1.1, margin: 0 }}>{p.name}</h1>
            <div style={{ textAlign: "right", flexShrink: 0 }}><Price value={p.price} size={21} />{p.oldPrice && <div style={{ marginTop: 2 }}><Price value={p.oldPrice} size={12} color={C.faint} strike /></div>}</div>
          </div>
          <div className="flex items-center" style={{ gap: 10, marginTop: 9 }}>
            <Stars n={p.rating} size={13} /><span style={{ fontFamily: F, fontSize: 12.5, fontWeight: 600, color: C.ink }}>{p.rating}</span><Mono style={{ fontSize: 10 }}>{p.reviews} отзывов</Mono>
            {disc > 0 && <span style={{ marginLeft: "auto", fontFamily: FM, fontSize: 10, fontWeight: 700, color: C.onInk, background: C.danger, borderRadius: R.pill, padding: "3px 8px" }}>−{disc}%</span>}
          </div>
          <div className="flex items-center" style={{ gap: 11, marginTop: 18 }}>
            <span style={{ width: 26, height: 26, borderRadius: "50%", background: C.wash, border: `1px solid ${C.lineMid}`, boxShadow: "inset 0 0 0 3px #fff", flexShrink: 0 }} />
            <div><Mono style={{ fontSize: 9.5, color: C.faint, display: "block" }}>Цвет</Mono><span style={{ fontFamily: F, fontSize: 13.5, fontWeight: 600, color: C.ink }}>{p.colorway}</span></div>
          </div>
          <div ref={sizeSecRef} style={{ marginTop: 20, scrollMarginTop: 80 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 11 }}>
              <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: sel ? C.ink : C.danger }}>{sel ? "Размер" : "Выберите размер"}</span>
              <button onClick={() => setAcc("size")} className="st-tap" aria-label="Таблица размеров" style={{ background: "none", border: 0, display: "inline-flex", alignItems: "center", gap: 4 }}><Mono style={{ fontSize: 10, color: C.faint }}>Таблица размеров</Mono><ChevronRight style={{ width: 12, height: 12, color: C.faint }} /></button>
            </div>
            <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
              {p.sizes.map((s) => { const on = sel === s; return (
                <button key={s} onClick={() => { haptic(6); setChosen((mm) => ({ ...mm, [p.id]: s })); }} className="st-tap" aria-pressed={on} data-testid={`size-${s}`} style={{ minWidth: 50, height: 46, padding: "0 12px", borderRadius: R.md, background: on ? C.ink : C.surface, color: on ? C.onInk : C.ink, border: `1px solid ${on ? C.ink : C.lineMid}`, fontFamily: FM, fontSize: 13, fontWeight: 600 }}>{s}</button>
              ); })}
            </div>
          </div>
          <div style={{ marginTop: 24, borderTop: `1px solid ${C.line}` }}>
            {accs.map((a) => { const open = acc === a.k; return (
              <div key={a.k} style={{ borderBottom: `1px solid ${C.line}` }}>
                <button onClick={() => setAcc(open ? null : a.k)} className="st-tap" aria-expanded={open} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", background: "none", border: 0 }}>
                  <span style={{ fontFamily: F, fontSize: 14.5, fontWeight: 700, color: C.ink }}>{a.t}</span>
                  <Plus style={{ width: 17, height: 17, color: C.muted, transform: open ? "rotate(45deg)" : "none", transition: "transform .25s cubic-bezier(0.2,0,0,1)" }} />
                </button>
                <AnimatePresence initial={false}>{open && (
                  <m.div key="c" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EMPH }} style={{ overflow: "hidden" }}>
                    <div style={{ paddingBottom: 16 }}>
                      {a.list ? a.list.map((d, i) => <div key={i} className="flex items-center" style={{ gap: 9, padding: "4px 0" }}><Check style={{ width: 15, height: 15, color: C.ink, flexShrink: 0 }} strokeWidth={2.5} /><span style={{ fontFamily: F, fontSize: 13.5, color: C.ink2 }}>{d}</span></div>) : a.sizeGuide ? (sg.rows.length ? (<div><div style={{ border: `1px solid ${C.line}`, borderRadius: R.sm, overflow: "hidden" }}><div style={{ display: "flex", background: C.wash }}><span style={{ flex: 1, padding: "9px 12px", fontFamily: F, fontSize: 11.5, fontWeight: 700, color: C.ink }}>Размер</span><span style={{ flex: 1, padding: "9px 12px", fontFamily: F, fontSize: 11.5, fontWeight: 700, color: C.ink, borderLeft: `1px solid ${C.line}` }}>{sg.label}</span></div>{sg.rows.map((row, i) => <div key={i} style={{ display: "flex", borderTop: `1px solid ${C.line}` }}><span style={{ flex: 1, padding: "9px 12px", fontFamily: FM, fontSize: 12.5, color: C.ink }}>{row[0]}</span><span style={{ flex: 1, padding: "9px 12px", fontFamily: FM, fontSize: 12.5, color: C.ink2, borderLeft: `1px solid ${C.line}` }}>{row[1]}</span></div>)}</div><p style={{ fontFamily: F, fontSize: 11.5, lineHeight: 1.5, color: C.faint, margin: "10px 0 0" }}>{sg.note}</p></div>) : <p style={{ fontFamily: F, fontSize: 14, color: C.muted, margin: 0 }}>{sg.note}</p>) : <p style={{ fontFamily: F, fontSize: 14, lineHeight: 1.62, color: C.muted, margin: 0 }}>{a.body}</p>}
                    </div>
                  </m.div>
                )}</AnimatePresence>
              </div>
            ); })}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            {[{ I: Truck, t: "Доставка 1–3 дня" }, { I: RotateCcw, t: "Возврат 14 дней" }, { I: ShieldCheck, t: "Оригинал" }].map((x) => (
              <div key={x.t} style={{ flex: 1, padding: "12px 8px", borderRadius: R.md, border: `1px solid ${C.line}`, background: C.surface, textAlign: "center" }}><x.I style={{ width: 17, height: 17, color: C.ink, margin: "0 auto 6px" }} strokeWidth={1.7} /><span style={{ fontFamily: F, fontSize: 10.5, fontWeight: 600, color: C.ink2, lineHeight: 1.2, display: "block" }}>{x.t}</span></div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 30, padding: "0 22px" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: F, fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", color: C.ink, margin: 0 }}>Отзывы</h2>
            <button className="st-tap" style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "none", border: 0, fontFamily: F, fontSize: 13, fontWeight: 600, color: C.muted }}>Все {p.reviews}<ChevronRight style={{ width: 15, height: 15 }} /></button>
          </div>
          <div className="flex items-center" style={{ gap: 20, marginBottom: 18 }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: F, fontSize: 40, fontWeight: 800, lineHeight: 1, color: C.ink, fontVariantNumeric: "tabular-nums" }}>{p.rating}</div>
              <div style={{ marginTop: 5 }}><Stars n={p.rating} size={12} /></div>
              <Mono style={{ display: "block", marginTop: 5, fontSize: 9.5 }}>{p.reviews} оценок</Mono>
            </div>
            <div style={{ flex: 1 }}>
              {breakdown.map((b) => (
                <div key={b.s} className="flex items-center" style={{ gap: 8, marginBottom: 5 }}>
                  <span style={{ fontFamily: FM, fontSize: 10, color: C.muted, width: 7, textAlign: "right" }}>{b.s}</span>
                  <Star style={{ width: 10, height: 10, color: C.muted }} fill={C.muted} />
                  <div style={{ flex: 1, height: 5, borderRadius: 999, background: C.wash, overflow: "hidden" }}><div style={{ width: `${b.pct}%`, height: "100%", background: C.ink, borderRadius: 999 }} /></div>
                  <span style={{ fontFamily: FM, fontSize: 9.5, color: C.faint, width: 28, textAlign: "right" }}>{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myReviews.map((r, i) => (
              <div key={i} style={{ padding: 14, borderRadius: R.md, border: `1px solid ${C.line}`, background: C.surface }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                  <div className="flex items-center" style={{ gap: 9 }}>
                    <span style={{ width: 30, height: 30, borderRadius: "50%", background: C.ink, color: C.onInk, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{r.name[0]}</span>
                    <div><span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: C.ink, display: "block", lineHeight: 1.1 }}>{r.name}</span><Mono style={{ fontSize: 9 }}>{r.date} · проверенная покупка</Mono></div>
                  </div>
                  <Stars n={r.rating} size={11} />
                </div>
                <p style={{ fontFamily: F, fontSize: 13, lineHeight: 1.55, color: C.ink2, margin: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 30 }}>
          <SectionHead title="С этим носят" />
          <div className="flex st-hide" style={{ gap: 14, overflowX: "auto", padding: "0 20px 4px" }}>
            {relList.map((rp) => <Card key={rp.id} p={rp} w={158} onOpen={() => openPDP(rp, relList)} isFav={isFav(rp.id)} onFav={() => toggleFav(rp.id)} />)}
          </div>
        </div>
        {createPortal(
        <div style={{ position: "fixed", bottom: "calc(64px + max(12px, env(safe-area-inset-bottom, 0px)))", left: 0, right: 0, zIndex: 9992, padding: "0 18px", pointerEvents: "none" }}>
          <div className="flex items-center" style={{ gap: 12, pointerEvents: "auto" }}>
            <button onClick={() => toggleFav(p.id)} className="st-tap" aria-label="В избранное" style={{ width: 52, height: 52, borderRadius: R.pill, flexShrink: 0, border: `1px solid ${C.lineMid}`, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: elev.card }}><Heart style={{ width: 19, height: 19 }} fill={isFav(p.id) ? C.ink : "transparent"} color={C.ink} /></button>
            <button onClick={addFromPdp} className="st-tap" data-testid="pdp-add" aria-label={sel ? "Добавить в корзину" : "Выберите размер"} style={{ flex: 1, height: 52, borderRadius: R.pill, background: justAdded ? "#1B873F" : C.ink, color: C.onInk, fontFamily: F, fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: 0, boxShadow: elev.ink, transition: "background .2s" }}>{justAdded ? <><Check style={{ width: 18, height: 18 }} strokeWidth={3} />Добавлено</> : !sel ? <>Выберите размер<ChevronDown style={{ width: 16, height: 16 }} /></> : <><ShoppingBag style={{ width: 17, height: 17 }} />В корзину · {fmt(p.price)}</>}</button>
          </div>
        </div>, document.body)}
      </m.div>
    );
  };

  const renderZoom = (p: Product) => (
    <m.div key="zoom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} style={{ minHeight: "100dvh", background: "#0B0B0C", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "max(12px, env(safe-area-inset-top)) 16px 8px" }}>
        <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{p.name}</span>
        <button onClick={() => setZoom(false)} className="st-tap" aria-label="Закрыть" data-testid="zoom-close" style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><X style={{ width: 20, height: 20, color: "#fff" }} /></button>
      </div>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEndPdp} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
        <img src={opt(p.img, 1100, 86)} alt={p.name} loading="eager" decoding="async" style={{ maxWidth: "100%", maxHeight: "74vh", objectFit: "contain", filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.5))" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "16px 0 calc(20px + env(safe-area-inset-bottom,0px))" }}>
        {browse.map((_, i) => <button key={i} aria-label={`Фото ${i + 1}`} onClick={() => setOpenIdx(i)} className="st-tap" style={{ width: i === openIdx ? 20 : 6, height: 6, borderRadius: 999, background: i === openIdx ? "#fff" : "rgba(255,255,255,0.3)", border: 0, padding: 0 }} />)}
      </div>
    </m.div>
  );

  /* ------------------------------- SEARCH -------------------------------- */
  const renderSearch = () => {
    const q = query.trim().toLowerCase();
    const res = q ? products.filter((p) => `${p.name} ${p.series} ${p.cat} ${p.colorway}`.toLowerCase().includes(q)) : [];
    const sugg = ["Кроссовки", "Бомбер", "Худи", "Карго", "Пиджак", "Шапка"];
    const popular = products.filter((p) => p.tag === "Хит" || p.tag === "Новинка").slice(0, 4);
    return (
      <m.div key="search" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2, ease: EMPH }} style={{ minHeight: "100dvh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <div className="flex items-center px-4" style={{ position: "sticky", top: 0, zIndex: 10, gap: 10, paddingTop: "max(12px, env(safe-area-inset-top))", paddingBottom: 12, background: C.bg }}>
          <div className="flex items-center" style={{ flex: 1, height: 46, borderRadius: R.pill, background: C.surface, border: `1px solid ${C.lineMid}`, padding: "0 14px", gap: 9 }}>
            <Search style={{ width: 18, height: 18, color: C.muted, flexShrink: 0 }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} autoFocus inputMode="search" aria-label="Поиск товаров" placeholder="Искать вещи, бренды…" data-testid="search-input" style={{ flex: 1, border: 0, outline: "none", background: "transparent", fontFamily: F, fontSize: 15, color: C.ink, minWidth: 0 }} />
            {query && <button onClick={() => setQuery("")} className="st-tap" aria-label="Очистить" style={{ width: 24, height: 24, borderRadius: "50%", background: C.wash, border: 0, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><X style={{ width: 13, height: 13, color: C.muted }} /></button>}
          </div>
          <button onClick={() => { setSearchOpen(false); setQuery(""); }} className="st-tap" data-testid="search-cancel" style={{ background: "none", border: 0, fontFamily: F, fontSize: 14, fontWeight: 600, color: C.ink }}>Отмена</button>
        </div>
        <div className="st-hide" style={{ flex: 1, overflowY: "auto", padding: "4px 20px 24px" }}>
          {q ? (
            res.length ? (
              <>
                <Mono style={{ display: "block", marginBottom: 14 }}>{res.length} {plural(res.length, "результат", "результата", "результатов")}</Mono>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{res.map((p) => <Card key={p.id} p={p} w={(440 - 40 - 14) / 2} onOpen={() => openPDP(p, res)} isFav={isFav(p.id)} onFav={() => toggleFav(p.id)} />)}</div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px" }}><Search style={{ width: 28, height: 28, color: C.faint, margin: "0 auto 14px" }} strokeWidth={1.5} /><p style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: C.ink, margin: "0 0 6px" }}>Ничего не найдено</p><p style={{ fontFamily: F, fontSize: 13, color: C.muted, margin: 0 }}>Попробуйте другой запрос</p></div>
            )
          ) : (
            <>
              <Mono style={{ display: "block", marginBottom: 12 }}>Популярные запросы</Mono>
              <div className="flex" style={{ gap: 8, flexWrap: "wrap", marginBottom: 26 }}>
                {sugg.map((s) => <button key={s} onClick={() => setQuery(s)} className="st-tap" style={{ height: 38, padding: "0 15px", borderRadius: R.pill, background: C.surface, border: `1px solid ${C.line}`, fontFamily: F, fontSize: 13, fontWeight: 600, color: C.ink }}>{s}</button>)}
              </div>
              <Mono style={{ display: "block", marginBottom: 12 }}>Хиты продаж</Mono>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>{popular.map((p) => <Card key={p.id} p={p} w={(440 - 40 - 14) / 2} onOpen={() => openPDP(p, popular)} isFav={isFav(p.id)} onFav={() => toggleFav(p.id)} />)}</div>
            </>
          )}
        </div>
      </m.div>
    );
  };

  return (
    <React.Fragment>
      <link rel="preconnect" href="https://wsrv.nl" crossOrigin="anonymous" />
      <StrayStyles />
      {searchOpen ? renderSearch() : (zoom && pdp) ? renderZoom(pdp) : pdp ? renderPDP(pdp) : (
        <React.Fragment>
          {activeTab === "home" && renderHome()}
          {activeTab === "catalog" && renderCatalog()}
          {activeTab === "cart" && renderCart()}
          {activeTab === "profile" && renderProfile()}
        </React.Fragment>
      )}
      <CheckoutDrawer isOpen={checkout} onClose={() => setCheckout(false)} items={cart.map((it) => ({ id: Number(it.id) || 0, name: it.name, price: it.price, quantity: it.quantity, size: it.size, color: it.color, image: it.image }))} total={cartTotal} currency="₽" onOrderComplete={handleCheckout} storeName="STRAY" />
    </React.Fragment>
  );
}

function StrayStoreWithTheme(props: { activeTab: "home" | "catalog" | "cart" | "profile"; onTabChange?: (t: string) => void; onCartCount?: (n: number) => void }) {
  return (
    <DemoThemeProvider themeId="stray">
      <StrayApp {...props} />
    </DemoThemeProvider>
  );
}

export default memo(StrayStoreWithTheme);