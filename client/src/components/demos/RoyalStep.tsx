import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { scrollToTop } from '@/hooks/useScrollToTop';
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Grid3X3, Heart, Home,
  Minus, Package, Plus, RotateCcw, Search, ShieldCheck, ShoppingBag,
  SlidersHorizontal, Star, Truck, UserRound, X,
} from 'lucide-react';
import './RoyalStep.css';

type Product = {
  id: string; name: string; price: number; image: string; category: string;
  summary: string; details: string; materials: string; sizes: number[];
};
type CartItem = { id: string; size: number; quantity: number };
type Order = { id: string; items: CartItem[]; total: number; date: string; delivery: string };
type CustomerReview = { id: string; productId: string; name: string; text: string; rating: number; date: string };
type Screen = 'home' | 'catalog' | 'product' | 'checkout' | 'success' | 'account';
type Sheet = 'cart' | 'menu' | 'filters' | null;

const products: Product[] = [
  { id:'airforce', name:"Nike Air Force 1 '07", price:14900, image:'/royal-step/airforce-1.webp', category:'Классика', summary:'Белая классика на каждый день', details:'Знаковый баскетбольный силуэт в чистом белом цвете. Гладкая кожа, узнаваемые линии и амортизация Nike Air.', materials:'Кожаный верх · Амортизация Nike Air', sizes:[38,39,40,41,42,43,44,45] },
  { id:'dunk', name:'Nike Dunk Low Retro', price:13900, image:'/royal-step/dunk-1.webp', category:'Классика', summary:'Контрастная классика Panda', details:'Баскетбольное наследие в чёрно-белом исполнении. Низкий силуэт, кожаные панели и выразительный контраст.', materials:'Кожаный верх · Резиновая подошва', sizes:[38,39,40,41,42,43,44,45] },
  { id:'vomero', name:'Nike Zoom Vomero 5', price:18900, image:'/royal-step/vomero-1.webp', category:'На каждый день', summary:'Ретро-беговой силуэт', details:'Многослойный беговой дизайн, сетчатый верх и детали с металлическим блеском. Амортизация Zoom Air дополняет силуэт.', materials:'Текстиль и синтетические материалы · Zoom Air', sizes:[38,39,40,41,42,43,44,45] },
  { id:'airmax', name:'Nike Air Max 95 OG', price:21900, image:'/royal-step/airmax-1.webp', category:'На каждый день', summary:'Легендарный силуэт Neon', details:'Плавные серые слои, неоновые акценты и видимая амортизация Air. Одна из самых узнаваемых моделей семейства Air Max.', materials:'Текстиль и синтетические материалы · Видимая амортизация Air', sizes:[39,40,41,42,43,44,45] },
  { id:'p6000', name:'Nike P-6000', price:14900, image:'/royal-step/p6000-1.webp', category:'На каждый день', summary:'Ретро-бег в серебре', details:'Сетчатая основа и серебристые накладки вдохновлены беговыми моделями 2000-х. Лёгкий визуальный ритм для города.', materials:'Текстиль и синтетические накладки', sizes:[38,39,40,41,42,43,44,45] },
  { id:'cortez', name:'Nike Cortez', price:12900, image:'/royal-step/cortez-1.webp', category:'Классика', summary:'Лаконичный ретро-силуэт', details:'Узнаваемая низкая форма, контрастный Swoosh и характерная многослойная подошва. Классика, начавшаяся на беговой дорожке.', materials:'Кожаный верх · Резиновая подошва', sizes:[38,39,40,41,42,43,44] },
  { id:'airmax90', name:'Nike Air Max 90', price:16900, image:'/royal-step/airmax90-1.webp', category:'На каждый день', summary:'Air Max для города', details:'Чистые линии, многослойный верх и видимый блок Air в пятке. Классический силуэт в сдержанной палитре.', materials:'Текстиль и накладки · Амортизация Max Air', sizes:[39,40,41,42,43,44,45] },
  { id:'shox', name:'Nike Shox TL', price:22900, image:'/royal-step/shox-1.webp', category:'На каждый день', summary:'Выразительная чёрная пара', details:'Сетчатый верх с объёмным каркасом и узнаваемая подошва Shox. Монохромная модель с характером.', materials:'Текстиль и синтетический каркас · Амортизация Shox', sizes:[39,40,41,42,43,44,45] },
  { id:'v2k', name:'Nike V2K Run', price:15900, image:'/royal-step/v2k-1.webp', category:'Для прогулок', summary:'Комфортный ретро-раннер', details:'Светлая сетка, серебристые детали и многослойная подошва в духе беговых моделей начала 2000-х.', materials:'Текстиль и синтетические накладки', sizes:[38,39,40,41,42,43,44] },
  { id:'airmax97', name:'Nike Air Max 97', price:19900, image:'/royal-step/airmax97-1.webp', category:'На каждый день', summary:'Икона Silver Bullet', details:'Волнообразные серебристые линии и видимая воздушная амортизация по всей длине подошвы.', materials:'Текстиль и синтетические материалы · Амортизация Air', sizes:[39,40,41,42,43,44,45] },
  { id:'airmax1', name:'Nike Air Max 1', price:16900, image:'/royal-step/airmax1-1.webp', category:'Классика', summary:'Оригинальный стиль Air Max', details:'Культовая форма в бело-серой гамме с красными деталями и видимым блоком Air в пятке.', materials:'Текстиль и замшевые накладки · Амортизация Air', sizes:[38,39,40,41,42,43,44,45] },
  { id:'airmaxplus', name:'Nike Air Max Plus', price:21900, image:'/royal-step/airmaxplus-1.webp', category:'На каждый день', summary:'Тёмный силуэт с характером', details:'Чёрный сетчатый верх, волнообразный каркас и видимая амортизация создают узнаваемый силуэт.', materials:'Текстиль и синтетический каркас · Амортизация Air', sizes:[39,40,41,42,43,44,45] },
  { id:'pegasus', name:'Nike Pegasus 42', price:17900, image:'/royal-step/pegasus-1.webp', category:'Для прогулок', summary:'Беговая пара на каждый день', details:'Дышащий верх и амортизирующая подошва для тех, кто любит движение. Лаконичная чёрно-белая расцветка.', materials:'Сетчатый текстиль · Амортизирующая подошва', sizes:[38,39,40,41,42,43,44,45] },
  { id:'killshot', name:'Nike Killshot 2 Leather', price:12900, image:'/royal-step/killshot-1.webp', category:'Классика', summary:'Теннисная классика', details:'Низкий профиль, светлая кожа, тёмный Swoosh и резиновая подошва в винтажном оттенке.', materials:'Кожа и замша · Резиновая подошва', sizes:[38,39,40,41,42,43,44] },
  { id:'v5rnr', name:'Nike V5 RNR', price:13900, image:'/royal-step/v5rnr-1.webp', category:'Для прогулок', summary:'Беговой стиль 2000-х', details:'Воздушная сетка и серебристые накладки объединяют ретро-эстетику с повседневным городским ритмом.', materials:'Текстиль и синтетические накладки', sizes:[38,39,40,41,42,43,44,45] },
  { id:'jordan', name:'Air Jordan 1 Mid', price:21900, image:'/royal-step/jordan-1.webp', category:'Классика', summary:'Цветная классика Jordan', details:'Высокий силуэт, контрастные замшевые панели и узнаваемые линии Jordan 1. Выразительная пара для городских образов.', materials:'Кожа и замшевые детали · Резиновая подошва', sizes:[38,39,40,41,42,43,44,45] },
];
const byId = (id: string) => products.find(product => product.id === id);
const reviewExamples: Record<string, string> = {
  jordan:'Яркие замшевые детали и узнаваемый высокий силуэт делают эту модель выразительной частью образа.',
  airforce:'Чистый белый силуэт легко сочетается с повседневной одеждой. Понравились кожаные детали и лаконичная форма.',
  dunk:'Контрастные панели сразу привлекают внимание. Классная пара для городских образов.',
  vomero:'Интересный многослойный верх и спокойная расцветка. Хорошо смотрятся с расслабленными брюками.',
  airmax:'Узнаваемый силуэт и яркие детали. Модель для тех, кто любит выразительные кроссовки.',
  p6000:'Серебристые детали и сетчатый верх выглядят легко. Понравился ретро-беговой стиль.',
  cortez:'Лаконичная форма и контрастная галочка. Смотрятся аккуратно и подходят к разным образам.',
  airmax90:'Классический силуэт с заметной воздушной вставкой. Спокойная расцветка на каждый день.',
  shox:'Монохромный вариант с необычной подошвой. Выглядят выразительно даже полностью в чёрном.',
  v2k:'Светлая сетка и серебристые детали создают интересный повседневный силуэт.',
  airmax97:'Волнообразные линии и серебристый оттенок делают пару узнаваемой с первого взгляда.',
  airmax1:'Понравилось сочетание белого, серого и красного. Классическая модель с яркой деталью.',
  airmaxplus:'Чёрный силуэт с объёмными линиями. Интересная пара для тех, кто предпочитает тёмные цвета.',
  pegasus:'Спортивная модель с дышащим на вид верхом. Сдержанная чёрно-белая расцветка.',
  killshot:'Аккуратный низкий силуэт и контрастная подошва. Хороший вариант для повседневного гардероба.',
  v5rnr:'Сетчатые панели и металлические детали отсылают к беговому стилю 2000-х.',
};
const price = (n: number) => `${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
const storageKey = 'royal-step-demo-v1';

function readSaved(): { cart: CartItem[]; favorites: string[]; orders: Order[]; reviews: CustomerReview[] } {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const cart = Array.isArray(raw.cart) ? raw.cart.filter((item: CartItem) => byId(item.id)?.sizes.includes(item.size) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 10) : [];
    const favorites = Array.isArray(raw.favorites) ? raw.favorites.filter((id: string) => typeof id === 'string' && byId(id)) : [];
    const orders = Array.isArray(raw.orders) ? raw.orders.filter((order: Order) => order && typeof order.id === 'string' && Number.isFinite(order.total) && Array.isArray(order.items)).slice(0, 10) : [];
    const reviews = Array.isArray(raw.reviews) ? raw.reviews.filter((review: CustomerReview) => review && byId(review.productId) && typeof review.name === 'string' && typeof review.text === 'string' && Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5).slice(0, 100) : [];
    return { cart, favorites, orders, reviews };
  } catch { return { cart: [], favorites: [], orders: [], reviews: [] }; }
}

function scrollTop() { scrollToTop(); }

function ProductCard({ product, favorite, onFavorite, onOpen }: { product: Product; favorite: boolean; onFavorite: () => void; onOpen: () => void }) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  return <article className="rs-card" data-testid={`royal-card-${product.id}`}>
    <div className="rs-card__photo">
      <button type="button" className="rs-card__open" onClick={onOpen} aria-label={`Открыть ${product.name}`}>
        <img src={product.image} alt={`Кроссовки ${product.name}`} loading="lazy" decoding="async" onLoad={() => setImageStatus('loaded')} onError={() => setImageStatus('error')} />
        {imageStatus === 'loading' && <span className="rs-image-loading" aria-hidden="true"/>}
        {imageStatus === 'error' && <span className="rs-image-error">Фото недоступно</span>}
      </button>
      <button type="button" className="rs-card__heart rs-icon" onClick={onFavorite} aria-label={`${favorite ? 'Убрать из избранного' : 'В избранное'}: ${product.name}`} aria-pressed={favorite}>
        <Heart size={20} strokeWidth={1.5} fill={favorite ? 'currentColor' : 'none'} />
      </button>
    </div>
    <div className="rs-card__body">
      <div className="rs-card__row"><button type="button" className="rs-card__title" onClick={onOpen}>{product.name}</button><button type="button" className="rs-card__plus" onClick={onOpen} aria-label={`Выбрать размер ${product.name}`}><Plus size={17} /></button></div>
      <div className="rs-card__price">{price(product.price)}</div>
      <p className="rs-card__subtitle">{product.summary}</p>
    </div>
  </article>;
}

export default function RoyalStep({ onClose }: { onClose: () => void }) {
  const [saved] = useState(readSaved);
  const [cart, setCart] = useState<CartItem[]>(saved.cart);
  const [favorites, setFavorites] = useState<string[]>(saved.favorites);
  const [orders, setOrders] = useState<Order[]>(saved.orders);
  const [reviews, setReviews] = useState<CustomerReview[]>(saved.reviews);
  const [screen, setScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('catalog');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [productId, setProductId] = useState('airforce');
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState<number | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Все');
  const [filterSize, setFilterSize] = useState<number | null>(null);
  const [sort, setSort] = useState('default');
  const [delivery, setDelivery] = useState<'pickup' | 'courier'>('pickup');
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewError, setReviewError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const dragStart = useRef<number | null>(null);
  const photoTouch = useRef<{ x: number; y: number } | null>(null);
  const selected = byId(productId) || products[0];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (byId(item.id)?.price || 0) * item.quantity, 0);
  const shipping = delivery === 'courier' ? 390 : 0;

  useEffect(() => {
    // The host scrolls in #root; all three layers and Telegram's own bars must
    // match the demo surface so the bottom never exposes the dark host theme.
    const nodes = [document.documentElement, document.body, document.getElementById('root')].filter((node): node is HTMLElement => !!node);
    const oldColors = nodes.map(node => node.style.backgroundColor);
    nodes.forEach(node => { node.style.backgroundColor = '#fff'; });
    const root = document.getElementById('root');
    root?.classList.add('royal-step-scroll-root');
    const tg = (window as any).Telegram?.WebApp;
    const previous = { background: tg?.backgroundColor, header: tg?.headerColor, bottom: tg?.bottomBarColor };
    const setWhite = () => { try { tg?.setBackgroundColor?.('#ffffff'); tg?.setHeaderColor?.('#ffffff'); tg?.setBottomBarColor?.('#ffffff'); } catch { /* Older Telegram clients omit these methods. */ } };
    setWhite();
    const timeout = window.setTimeout(setWhite, 180);
    return () => {
      window.clearTimeout(timeout);
      root?.classList.remove('royal-step-scroll-root');
      nodes.forEach((node, index) => { node.style.backgroundColor = oldColors[index]; });
      try { if (previous.background) tg?.setBackgroundColor?.(previous.background); if (previous.header) tg?.setHeaderColor?.(previous.header); if (previous.bottom) tg?.setBottomBarColor?.(previous.bottom); } catch { /* The host controls its own theme. */ }
    };
  }, []);
  useEffect(() => {
    const root = document.getElementById('root');
    const navigation = document.querySelector<HTMLElement>('.rs-nav');
    if (!root || !navigation) return;
    const previousClearance = root.style.getPropertyValue('--rs-scroll-clearance');
    const previousPriority = root.style.getPropertyPriority('--rs-scroll-clearance');
    let frame = 0;
    const updateClearance = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const overlap = root.getBoundingClientRect().bottom - navigation.getBoundingClientRect().top;
        root.style.setProperty('--rs-scroll-clearance', `${Math.max(180, Math.ceil(overlap + 24))}px`);
      });
    };
    const observer = new ResizeObserver(updateClearance);
    observer.observe(root);
    observer.observe(navigation);
    window.addEventListener('resize', updateClearance);
    window.visualViewport?.addEventListener('resize', updateClearance);
    window.visualViewport?.addEventListener('scroll', updateClearance);
    const telegram = (window as any).Telegram?.WebApp;
    telegram?.onEvent?.('viewportChanged', updateClearance);
    updateClearance();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', updateClearance);
      window.visualViewport?.removeEventListener('resize', updateClearance);
      window.visualViewport?.removeEventListener('scroll', updateClearance);
      telegram?.offEvent?.('viewportChanged', updateClearance);
      if (previousClearance) root.style.setProperty('--rs-scroll-clearance', previousClearance, previousPriority);
      else root.style.removeProperty('--rs-scroll-clearance');
    };
  }, []);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify({ cart, favorites, orders, reviews })); } catch { /* The demo remains usable when storage is unavailable. */ } }, [cart, favorites, orders, reviews]);
  useEffect(() => {
    if (!sheet) return;
    const old = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = document.querySelector<HTMLElement>('[data-testid="royal-step"]');
    const navigation = document.querySelector<HTMLElement>('.rs-nav');
    background?.setAttribute('inert', '');
    navigation?.setAttribute('inert', '');
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('.rs-sheet button')?.focus({ preventScroll: true }));
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSheet(null); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(document.querySelectorAll<HTMLElement>('.rs-sheet button:not([disabled]), .rs-sheet input, .rs-sheet select, .rs-sheet [href]'));
      if (!controls.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => { cancelAnimationFrame(frame); document.body.style.overflow = old; background?.removeAttribute('inert'); navigation?.removeAttribute('inert'); document.removeEventListener('keydown', closeOnEscape); if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
  }, [sheet]);

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('ru-RU');
    const filtered = products.filter(p => (!q || `${p.name} ${p.summary} ${p.category}`.toLocaleLowerCase('ru-RU').includes(q)) && (category === 'Все' || p.category === category) && (!filterSize || p.sizes.includes(filterSize)));
    return [...filtered].sort((a, b) => sort === 'price-up' ? a.price - b.price : sort === 'price-down' ? b.price - a.price : 0);
  }, [query, category, filterSize, sort]);

  function go(next: Screen) { setSheet(null); setScreen(next); setSizeError(false); scrollTop(); }
  function openProduct(id: string) { setPreviousScreen(screen === 'product' ? previousScreen : screen); setProductId(id); setImageIndex(0); setSize(null); setSizeError(false); setReviewOpen(false); setReviewName(''); setReviewText(''); setReviewRating(0); setReviewError(''); go('product'); }
  function toggleFavorite(id: string) { setFavorites(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]); }
  function changeQuantity(id: string, selectedSize: number, delta: number) { setCart(items => items.map(item => item.id === id && item.size === selectedSize ? { ...item, quantity: Math.min(10, item.quantity + delta) } : item).filter(item => item.quantity > 0)); }
  function addToCart(openCheckout = false) {
    if (size === null) { setSizeError(true); return; }
    setCart(items => {
      const existing = items.find(item => item.id === selected.id && item.size === size);
      return existing ? items.map(item => item === existing ? { ...item, quantity: Math.min(10, item.quantity + 1) } : item) : [...items, { id: selected.id, size, quantity: 1 }];
    });
    setAnnouncement(`${selected.name}, размер ${size}: добавлено в корзину`);
    if (openCheckout) { setSubmitted(false); go('checkout'); } else setSheet('cart');
  }
  function openSearch() { go('catalog'); window.setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 100); }
  function resetFilters() { setQuery(''); setCategory('Все'); setFilterSize(null); setSort('default'); }
  function openCategory(next: string) { setQuery(''); setFilterSize(null); setSort('default'); setCategory(next); go('catalog'); }
  function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewRating || reviewName.trim().length < 2 || reviewText.trim().length < 10) { setReviewError('Выберите оценку, укажите имя и напишите не менее 10 символов.'); return; }
    const next: CustomerReview = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, productId: selected.id, name: reviewName.trim().slice(0, 40), text: reviewText.trim().slice(0, 600), rating: reviewRating, date: new Date().toISOString() };
    setReviews(current => [next, ...current].slice(0, 100)); setReviewName(''); setReviewText(''); setReviewRating(0); setReviewError(''); setReviewOpen(false); setAnnouncement('Спасибо! Ваш отзыв сохранён на этом устройстве.');
  }
  function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitted(true);
    if (!customer.trim() || phone.replace(/\D/g, '').length < 10 || (delivery === 'courier' && address.trim().length < 5) || !cart.length) return;
    const order: Order = { id: `DEMO-${Date.now().toString().slice(-6)}`, items: cart.map(item => ({ ...item })), total: subtotal + shipping, date: new Date().toISOString(), delivery: delivery === 'courier' ? 'Курьером' : 'Самовывоз' };
    setOrders(current => [order, ...current].slice(0, 10)); setLastOrder(order); setCart([]); setCustomer(''); setPhone(''); setAddress(''); setSubmitted(false); go('success');
  }

  const tab = screen === 'home' ? 'home' : screen === 'account' ? 'account' : 'catalog';
  return <div className="royal-step" lang="ru" data-testid="royal-step">
    <div className="rs-live" aria-live="polite">{announcement}</div>

    <main className="rs-main" key={screen}>
      {(screen === 'product' || screen === 'checkout' || screen === 'success') && <button type="button" className="rs-page-back" onClick={() => screen === 'product' ? go(previousScreen) : screen === 'checkout' ? (setScreen(previousScreen === 'checkout' ? 'catalog' : previousScreen), setSheet('cart')) : go('home')}><ArrowLeft size={18}/> Назад</button>}
      {screen === 'home' && <section className="rs-home">
        <div className="rs-home__title"><div><p className="rs-eyebrow">ПОДБОРКА / 2026</p><h1>Кроссовки<br/><span>Коллекция</span></h1></div><div className="rs-home__actions"><button type="button" className="rs-home__action" aria-label="Поиск моделей" onClick={openSearch}><Search size={19}/></button><button type="button" className="rs-home__action" aria-label="Открыть каталог" onClick={() => go('catalog')}><SlidersHorizontal size={19}/></button></div></div>
        <button type="button" className="rs-feature" onClick={() => openProduct('jordan')} aria-label="Открыть Air Jordan 1 Mid"><div className="rs-feature__image"><img src="/royal-step/jordan-cutout.webp" alt="" /></div><div className="rs-feature__copy"><span>ВЫБОР КОЛЛЕКЦИИ</span><strong>Air Jordan 1</strong><span>Смотреть модель <ArrowRight size={15}/></span></div></button>
        <div className="rs-home__grid">
          <button className="rs-editorial rs-editorial--everyday" type="button" onClick={() => openCategory('На каждый день')}><img src="/royal-step/everyday-editorial-v2.webp" alt=""/><span>НА КАЖДЫЙ ДЕНЬ</span><strong>Классика<br/>в новом ритме.</strong><i><ArrowRight size={17}/></i></button>
          <ProductCard product={products[0]} favorite={favorites.includes(products[0].id)} onFavorite={() => toggleFavorite(products[0].id)} onOpen={() => openProduct(products[0].id)}/>
          <ProductCard product={products[2]} favorite={favorites.includes(products[2].id)} onFavorite={() => toggleFavorite(products[2].id)} onOpen={() => openProduct(products[2].id)}/>
          <button className="rs-editorial rs-editorial--type" type="button" onClick={() => go('catalog')}><span>ВЫБИРАЙТЕ СВОЙ</span><strong>СТИЛЬ.<br/>РИТМ.<br/>ШАГ.</strong><i><ArrowRight size={17}/></i></button>
        </div>
        <section className="rs-home__discover"><div className="rs-section__heading"><div><p className="rs-eyebrow">ВЫБОР ПО НАСТРОЕНИЮ</p><h2>Найдите свой стиль</h2></div><button type="button" className="rs-text-link" onClick={() => openCategory('Все')}>Все модели <ArrowRight size={16}/></button></div><div className="rs-home__categories">{[{name:'Классика', caption:'Вне времени', image:products[5].image},{name:'На каждый день', caption:'Для городского ритма', image:products[4].image},{name:'Для прогулок', caption:'Легко быть в движении', image:products[8].image}].map(item => <button key={item.name} type="button" onClick={() => openCategory(item.name)}><span><strong>{item.name}</strong><small>{item.caption}</small><i>Смотреть <ArrowRight size={14}/></i></span><img src={item.image} alt="" loading="lazy"/></button>)}</div></section>
        <section className="rs-home__picks"><div className="rs-section__heading"><div><p className="rs-eyebrow">В КОЛЛЕКЦИИ</p><h2>Стоит посмотреть</h2></div><button type="button" className="rs-text-link" onClick={() => openCategory('Все')}>В каталог <ArrowRight size={16}/></button></div><div className="rs-home__list">{[products[4],products[5],products[6],products[13]].map(p => <article className="rs-list-card" key={p.id}><button type="button" className="rs-list-card__open" onClick={() => openProduct(p.id)} aria-label={`Открыть ${p.name}`}><span className="rs-list-card__copy"><strong>{p.name}</strong><small>{p.summary}</small><b>{price(p.price)}</b></span><img src={p.image} alt="" loading="lazy"/></button><button type="button" className="rs-list-card__heart rs-icon" onClick={() => toggleFavorite(p.id)} aria-label={`${favorites.includes(p.id) ? 'Убрать из избранного' : 'В избранное'}: ${p.name}`} aria-pressed={favorites.includes(p.id)}><Heart size={19} strokeWidth={1.5} fill={favorites.includes(p.id) ? 'currentColor' : 'none'}/></button></article>)}</div></section>
        <div className="rs-home__collection"><div><p className="rs-eyebrow">{products.length} МОДЕЛЕЙ / NIKE</p><h2>Пара на каждый день</h2><p>От узнаваемой классики до моделей для движения.</p></div><button type="button" className="rs-button rs-button--dark" onClick={() => openCategory('Все')}>Смотреть коллекцию <ArrowRight size={17}/></button><div className="rs-home__benefits"><div><Search size={18}/><span><strong>Рассмотрите детали</strong><small>Четыре фотографии каждой пары</small></span></div><div><Heart size={18}/><span><strong>Сохраните понравившееся</strong><small>Избранное останется на устройстве</small></span></div></div></div>
        <p className="rs-demo-note rs-home__note">Демонстрационный магазин. Изображения сгенерированы; цены и оформление показаны для примера.</p>
      </section>}

      {screen === 'catalog' && <section className="rs-section rs-catalog"><div className="rs-catalog__intro"><div><p className="rs-eyebrow">NIKE / КОЛЛЕКЦИЯ</p><h1>Найдите свою пару</h1><p>Модели, которые хочется носить каждый день.</p></div><button type="button" className="rs-filter-btn" onClick={() => setSheet('filters')} aria-label="Фильтры"><SlidersHorizontal size={18}/><span>Фильтр</span>{(filterSize || category !== 'Все') && <i />}</button></div>
        <label className="rs-search"><Search size={18}/><span className="rs-sr">Поиск моделей</span><input ref={searchRef} type="search" placeholder="Найти модель" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" className="rs-icon" onClick={() => setQuery('')} aria-label="Очистить поиск"><X size={17}/></button>}</label>
        <div className="rs-catalog__bar"><span>{visibleProducts.length} {visibleProducts.length === 1 ? 'модель' : visibleProducts.length >= 2 && visibleProducts.length <= 4 ? 'модели' : 'моделей'}</span><label>Сортировка <select aria-label="Сортировка" value={sort} onChange={event => setSort(event.target.value)}><option value="default">По подборке</option><option value="price-up">Сначала дешевле</option><option value="price-down">Сначала дороже</option></select></label></div>
        {visibleProducts.length ? <div className="rs-grid">{visibleProducts.map(p => <ProductCard key={p.id} product={p} favorite={favorites.includes(p.id)} onFavorite={() => toggleFavorite(p.id)} onOpen={() => openProduct(p.id)}/>)}</div> : <div className="rs-empty"><Search size={26}/><h2>Ничего не найдено</h2><p>Попробуйте изменить запрос или фильтры.</p><button className="rs-button rs-button--outline" type="button" onClick={resetFilters}>Сбросить фильтры</button></div>}
      </section>}

      {screen === 'product' && <section className="rs-product">
        <div className="rs-product__photo"
          onTouchStart={event => { const t = event.touches[0]; if (t) photoTouch.current = { x: t.clientX, y: t.clientY }; }}
          onTouchEnd={event => { const t = event.changedTouches[0], start = photoTouch.current; if (t && start) { const dx = t.clientX - start.x, dy = t.clientY - start.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) setImageIndex(value => Math.min(3, Math.max(0, value + (dx < 0 ? 1 : -1)))); } photoTouch.current = null; }}>
          <img key={`${selected.id}-${imageIndex}`} src={`/royal-step/${selected.id}-${imageIndex + 1}.webp`} alt={`Кроссовки ${selected.name}, фотография ${imageIndex + 1} из 4`} decoding="async" />
          <button type="button" className="rs-product__heart rs-icon" onClick={() => toggleFavorite(selected.id)} aria-label={`${favorites.includes(selected.id) ? 'Убрать из избранного' : 'В избранное'}: ${selected.name}`} aria-pressed={favorites.includes(selected.id)}><Heart size={22} strokeWidth={1.5} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'}/></button>
          <span className="rs-photo-count">{imageIndex + 1} / 4</span>
        </div>
        <div className="rs-photo-thumbs" aria-label="Фотографии товара">{[0,1,2,3].map(index => <button type="button" key={index} aria-label={`Фотография ${index + 1} из 4`} aria-pressed={imageIndex === index} onClick={() => setImageIndex(index)}><img src={`/royal-step/${selected.id}-${index + 1}.webp`} alt="" loading="lazy" decoding="async" /></button>)}</div>
        <div className="rs-product__body">
          <p className="rs-eyebrow">{selected.category} / NIKE</p><div className="rs-product__title"><h1>{selected.name}</h1><span>{price(selected.price)}</span></div>
          <button type="button" className="rs-review-jump" onClick={() => document.getElementById('rs-reviews-title')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start' })}><Star size={15} fill="currentColor"/> Отзывы о модели <span>({reviews.filter(review => review.productId === selected.id).length + 1})</span></button>
          <p className="rs-product__description">{selected.details}</p>
          <div className="rs-size-heading"><strong>Выберите размер</strong><span>EU</span></div><div className="rs-size-grid" aria-label="Размер обуви">{selected.sizes.map(value => <button type="button" key={value} className={size === value ? 'is-selected' : ''} onClick={() => { setSize(value); setSizeError(false); }} aria-pressed={size === value}>{value}</button>)}</div>
          {sizeError && <p className="rs-error" role="alert">Выберите размер, чтобы продолжить.</p>}<p className="rs-material">{selected.materials}</p>
          <button type="button" className="rs-button rs-button--dark rs-button--full" onClick={() => addToCart()}><ShoppingBag size={17}/> Добавить в корзину</button><button type="button" className="rs-button rs-button--outline rs-button--full" onClick={() => addToCart(true)}>Оформить демо-заказ</button>
          <p className="rs-demo-note">Изображения созданы для демонстрации. Цена примерная, оплата не списывается.</p>
          <section className="rs-product-info" aria-labelledby="rs-info-title"><h2 id="rs-info-title">О модели</h2><p>{selected.summary}. {selected.details}</p><dl><div><dt>Модель</dt><dd>{selected.name}</dd></div><div><dt>Категория</dt><dd>{selected.category}</dd></div><div><dt>Материалы и детали</dt><dd>{selected.materials}</dd></div><div><dt>Размерная сетка</dt><dd>EU {selected.sizes[0]}–{selected.sizes[selected.sizes.length - 1]}</dd></div></dl><details><summary>Как выбрать размер <ChevronRight size={17}/></summary><p>Измерьте длину стопы и сравните её с официальной таблицей размеров Nike. Представленные размеры указаны для демонстрации.</p></details><details><summary>Доставка и возврат <ChevronRight size={17}/></summary><p>В этом демо можно выбрать условный способ получения. Реальные условия доставки и возврата здесь не подключены.</p></details></section>
          <section className="rs-reviews" aria-labelledby="rs-reviews-title"><div className="rs-reviews__heading"><div><p className="rs-eyebrow">ВПЕЧАТЛЕНИЯ</p><h2 id="rs-reviews-title">Отзывы <span>{reviews.filter(review => review.productId === selected.id).length + 1}</span></h2></div><button type="button" className="rs-text-link" onClick={() => { setReviewOpen(value => !value); setReviewError(''); }}>{reviewOpen ? 'Отменить' : 'Написать отзыв'} <ArrowRight size={15}/></button></div><p className="rs-reviews__notice">Пример отзыва показан для демонстрации. Новые отзывы сохраняются только на этом устройстве.</p>
            {reviewOpen && <form className="rs-review-form" onSubmit={submitReview} noValidate><strong>Ваша оценка</strong><div className="rs-stars-picker" role="group" aria-label="Оценка товара">{[1,2,3,4,5].map(value => <button type="button" key={value} aria-label={`Оценка ${value} из 5`} aria-pressed={reviewRating === value} onClick={() => setReviewRating(value)}><Star size={23} fill={value <= reviewRating ? 'currentColor' : 'none'}/></button>)}</div><label className="rs-field">Имя<input value={reviewName} onChange={event => setReviewName(event.target.value)} maxLength={40} placeholder="Как вас зовут" /></label><label className="rs-field">Ваш отзыв<textarea value={reviewText} onChange={event => setReviewText(event.target.value)} maxLength={600} rows={4} placeholder="Поделитесь впечатлением о модели" /></label>{reviewError && <p className="rs-error" role="alert">{reviewError}</p>}<button type="submit" className="rs-button rs-button--dark rs-button--full">Сохранить отзыв</button></form>}
            {reviews.filter(review => review.productId === selected.id).map(review => <article key={review.id} className="rs-review"><div><strong>{review.name}</strong><span>Ваш отзыв</span></div><div className="rs-review__stars" aria-label={`Оценка ${review.rating} из 5`}>{[1,2,3,4,5].map(value => <Star key={value} size={13} fill={value <= review.rating ? 'currentColor' : 'none'}/>)}</div><p>{review.text}</p></article>)}
            <article className="rs-review"><div><strong>Пример отзыва</strong><span>Демонстрация</span></div><div className="rs-review__stars" aria-label="Пример оценки 5 из 5">{[1,2,3,4,5].map(value => <Star key={value} size={13} fill="currentColor"/>)}</div><p>{reviewExamples[selected.id]}</p></article>
          </section>
          <div className="rs-related"><div className="rs-section__heading"><h2>Другие модели</h2><button type="button" className="rs-text-link" onClick={() => go('catalog')}>В каталог <ArrowRight size={15}/></button></div><div className="rs-related__row">{products.filter(p => p.id !== selected.id).slice(0, 3).map(p => <button key={p.id} type="button" onClick={() => openProduct(p.id)} aria-label={`Открыть ${p.name}`}><span className="rs-related__image"><img src={p.image} alt="" loading="lazy"/></span><strong>{p.name}</strong><small>{price(p.price)}</small></button>)}</div></div>
        </div>
      </section>}

      {screen === 'checkout' && <section className="rs-section rs-checkout"><p className="rs-eyebrow">ПОСЛЕДНИЙ ШАГ</p><h1>Оформление заказа</h1><p className="rs-lead">Проверьте данные и выберите способ получения.</p><div className="rs-demo-banner"><ShieldCheck size={20}/><span><strong>Это демо</strong><br/>Данные не отправляются, оплата не списывается.</span></div><form onSubmit={submitOrder} noValidate><h2>Контактные данные</h2><label className="rs-field">Имя<input value={customer} onChange={e => setCustomer(e.target.value)} autoComplete="name" placeholder="Как к вам обращаться" />{submitted && !customer.trim() && <span className="rs-error">Укажите имя.</span>}</label><label className="rs-field">Телефон<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" placeholder="+7 999 000-00-00" />{submitted && phone.replace(/\D/g, '').length < 10 && <span className="rs-error">Укажите номер телефона.</span>}</label><button type="button" className="rs-text-link rs-fill-example" onClick={() => { setCustomer('Тестовый покупатель'); setPhone('+7 900 123-45-67'); setAddress('Москва, ул. Примерная, 1'); }}>Подставить пример данных</button><h2>Получение</h2><div className="rs-delivery"><button type="button" onClick={() => setDelivery('pickup')} className={delivery === 'pickup' ? 'is-selected' : ''} aria-pressed={delivery === 'pickup'}><Package size={19}/><span><strong>Самовывоз</strong><small>Бесплатно</small></span><span className="rs-radio" /></button><button type="button" onClick={() => setDelivery('courier')} className={delivery === 'courier' ? 'is-selected' : ''} aria-pressed={delivery === 'courier'}><Truck size={19}/><span><strong>Курьером</strong><small>{price(390)}</small></span><span className="rs-radio" /></button></div>{delivery === 'courier' && <label className="rs-field">Адрес доставки<input value={address} onChange={e => setAddress(e.target.value)} autoComplete="street-address" placeholder="Город, улица, дом" />{submitted && address.trim().length < 5 && <span className="rs-error">Укажите адрес доставки.</span>}</label>}<h2>Ваш заказ</h2><div className="rs-summary">{cart.map(item => { const p = byId(item.id); if (!p) return null; return <div key={`${item.id}-${item.size}`}><span>{p.name} · {item.size} EU · {item.quantity} шт.</span><strong>{price(p.price * item.quantity)}</strong></div>; })}<div><span>Доставка</span><strong>{shipping ? price(shipping) : 'Бесплатно'}</strong></div><div className="rs-summary__total"><span>Итого</span><strong>{price(subtotal + shipping)}</strong></div></div>{submitted && !cart.length && <p className="rs-error" role="alert">Корзина пуста. Добавьте пару перед оформлением.</p>}<button type="submit" className="rs-button rs-button--dark rs-button--full">Подтвердить демо-заказ <ArrowRight size={17}/></button></form></section>}

      {screen === 'success' && <section className="rs-success"><div className="rs-success__icon"><Check size={30}/></div><p className="rs-eyebrow">ГОТОВО</p><h1>Демо-заказ оформлен</h1><p>Вы прошли весь путь покупки. Это пример: данные не отправлены, оплата не списана.</p>{lastOrder && <div className="rs-success__order"><span>{lastOrder.id}</span><strong>{price(lastOrder.total)}</strong></div>}<button type="button" className="rs-button rs-button--dark rs-button--full" onClick={() => go('catalog')}>Продолжить выбор</button><button type="button" className="rs-button rs-button--outline rs-button--full" onClick={() => go('account')}>Посмотреть историю</button></section>}

      {screen === 'account' && <section className="rs-section rs-account"><p className="rs-eyebrow">ВАШЕ ПРОСТРАНСТВО</p><h1>Мой профиль</h1><p className="rs-lead">Сохранённые модели и история демо-заказов.</p><div className="rs-account__heading"><Heart size={19}/><h2>Избранное</h2><span>{favorites.length}</span></div>{favorites.length ? <div className="rs-grid">{products.filter(p => favorites.includes(p.id)).map(p => <ProductCard key={p.id} product={p} favorite onFavorite={() => toggleFavorite(p.id)} onOpen={() => openProduct(p.id)}/>)}</div> : <div className="rs-account__empty"><p>Здесь появятся модели, которые вам понравились.</p><button type="button" className="rs-text-link" onClick={() => go('catalog')}>Выбрать пару <ArrowRight size={15}/></button></div>}<div className="rs-account__heading"><Package size={19}/><h2>Демо-заказы</h2><span>{orders.length}</span></div>{orders.length ? <div className="rs-order-list">{orders.map(order => <div key={order.id}><div><strong>{order.id}</strong><span>{new Date(order.date).toLocaleDateString('ru-RU')} · {order.delivery}</span></div><b>{price(order.total)}</b></div>)}</div> : <div className="rs-account__empty"><p>Когда вы оформите демо-заказ, он появится здесь.</p></div>}<p className="rs-demo-note">Это демонстрация. Заказы сохраняются только на этом устройстве и не отправляются продавцу.</p></section>}
    </main>

    {createPortal(<div className="royal-step rs-portal" lang="ru"><nav className="rs-nav" aria-label="Навигация магазина"><button type="button" onClick={() => go('home')} aria-label="Главная" className={tab === 'home' && !sheet ? 'is-active' : ''} aria-current={tab === 'home' && !sheet ? 'page' : undefined}><Home size={21}/><span className="rs-nav__label">Главная</span></button><button type="button" onClick={() => go('catalog')} aria-label="Каталог" className={tab === 'catalog' && !sheet ? 'is-active' : ''} aria-current={tab === 'catalog' && !sheet ? 'page' : undefined}><Grid3X3 size={21}/><span className="rs-nav__label">Каталог</span></button><button type="button" onClick={() => setSheet('cart')} className={sheet === 'cart' ? 'is-active' : ''} aria-label={`Корзина, товаров: ${cartCount}`}><span className="rs-nav__bag"><ShoppingBag size={21}/>{cartCount > 0 && <i>{cartCount}</i>}</span><span className="rs-nav__label">Корзина</span></button><button type="button" onClick={() => go('account')} aria-label="Профиль" className={tab === 'account' && !sheet ? 'is-active' : ''} aria-current={tab === 'account' && !sheet ? 'page' : undefined}><UserRound size={21}/><span className="rs-nav__label">Профиль</span></button></nav>

    {sheet && <div className="rs-scrim" onClick={() => setSheet(null)}><section className="rs-sheet" role="dialog" aria-modal="true" aria-labelledby="rs-sheet-title" onClick={event => event.stopPropagation()}><div className="rs-sheet__grab" onTouchStart={event => { dragStart.current = event.touches[0]?.clientY ?? null; }} onTouchEnd={event => { if (dragStart.current !== null && (event.changedTouches[0]?.clientY ?? 0) - dragStart.current > 70) setSheet(null); dragStart.current = null; }}><span/></div><div className="rs-sheet__top"><h2 id="rs-sheet-title">{sheet === 'cart' ? 'Ваша корзина' : sheet === 'filters' ? 'Фильтры' : 'Меню'}</h2><button type="button" className="rs-icon" onClick={() => setSheet(null)} aria-label="Закрыть"><X size={22}/></button></div>
      {sheet === 'cart' && <><div className="rs-sheet__scroll">{cart.length ? <><p className="rs-sheet__caption">{cartCount} {cartCount === 1 ? 'товар' : cartCount >= 2 && cartCount <= 4 ? 'товара' : 'товаров'}</p><div className="rs-cart-list">{cart.map(item => { const p = byId(item.id); if (!p) return null; return <article className="rs-cart-item" key={`${item.id}-${item.size}`}><button type="button" className="rs-cart-item__image" onClick={() => openProduct(item.id)} aria-label={`Открыть ${p.name}`}><img src={p.image} alt=""/></button><div className="rs-cart-item__info"><strong>{p.name}</strong><span>Размер {item.size} EU</span><b>{price(p.price * item.quantity)}</b><div className="rs-quantity"><button type="button" aria-label={`Уменьшить количество ${p.name}, размер ${item.size}`} onClick={() => changeQuantity(item.id, item.size, -1)}><Minus size={14}/></button><span>{item.quantity}</span><button type="button" aria-label={`Увеличить количество ${p.name}, размер ${item.size}`} onClick={() => changeQuantity(item.id, item.size, 1)} disabled={item.quantity >= 10}><Plus size={14}/></button></div></div><button type="button" className="rs-icon" aria-label={`Удалить ${p.name}, размер ${item.size}`} onClick={() => setCart(items => items.filter(current => current !== item))}><X size={18}/></button></article>; })}</div></> : <div className="rs-empty rs-empty--cart"><ShoppingBag size={28}/><h3>Пока пусто</h3><p>Добавьте понравившуюся пару, и она появится здесь.</p><button className="rs-button rs-button--outline" type="button" onClick={() => go('catalog')}>Перейти в каталог</button></div>}</div>{!!cart.length && <div className="rs-sheet__footer"><div><span>Итого</span><strong>{price(subtotal)}</strong></div><button type="button" className="rs-button rs-button--dark rs-button--full" onClick={() => { setPreviousScreen(screen); setSubmitted(false); go('checkout'); }}>Оформить демо-заказ <ArrowRight size={17}/></button><p className="rs-demo-note">Без реальной оплаты и отправки данных.</p></div>}</>}
      {sheet === 'filters' && <div className="rs-sheet__scroll rs-filter-sheet"><h3>Коллекция</h3><div className="rs-filter-options">{['Все', 'На каждый день', 'Классика', 'Для прогулок'].map(value => <button key={value} type="button" aria-pressed={category === value} className={category === value ? 'is-selected' : ''} onClick={() => setCategory(value)}>{value}</button>)}</div><h3>Размер EU</h3><div className="rs-filter-options">{[38,39,40,41,42,43,44,45].map(value => <button key={value} type="button" aria-pressed={filterSize === value} className={filterSize === value ? 'is-selected' : ''} onClick={() => setFilterSize(filterSize === value ? null : value)}>{value}</button>)}</div><button className="rs-button rs-button--dark rs-button--full" type="button" onClick={() => setSheet(null)}>Показать модели</button><button className="rs-button rs-button--outline rs-button--full" type="button" onClick={resetFilters}>Сбросить</button></div>}
      {sheet === 'menu' && <div className="rs-menu"><button type="button" onClick={() => go('home')}>Главная <ChevronRight size={18}/></button><button type="button" onClick={() => go('catalog')}>Коллекция <ChevronRight size={18}/></button><button type="button" onClick={() => go('account')}>Избранное и заказы <ChevronRight size={18}/></button><button type="button" onClick={onClose}>Вернуться в WEB4TG <ArrowRight size={18}/></button><p className="rs-demo-note">Демонстрационный магазин от WEB4TG.</p></div>}
    </section></div>}</div>, document.body)}
  </div>;
}
