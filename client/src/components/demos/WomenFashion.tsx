import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { warmImage, warmImages } from '@/lib/warmImage';
import { fashionPreview, clearFashionPreview, fallbackFashionPreview } from './womenImagePreviews';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Home, Minus, Package, Plus, Search, ShoppingBag, SlidersHorizontal, Star, Trash2, UserRound, X, ZoomIn, ZoomOut } from 'lucide-react';
import { scrollToTop } from '@/hooks/useScrollToTop';
import { useWomenFashionHistory } from './useWomenFashionHistory';
import './MurakaFashion.css';
import './WomenFashion.css';
import {FashionJournal,FashionProductInfo,fashionPairs} from './WomenFashionExperience';
import {FashionLooksIndex,FashionLookPage,fashionLookPresets,type FashionLookId,type FashionLookDraft,type FashionLookLine} from './WomenFashionLooks';
import {useFashionWardrobe,FashionSaveToCollection,FashionWardrobe,FashionOrders,FashionSizeGuide,type FashionOrder} from './WomenFashionAccount';

type Category = 'Платья' | 'Верхняя одежда' | 'Рубашки и топы' | 'Джинсы и брюки' | 'Трикотаж' | 'Юбки' | 'Костюмы';
type Product = { id: string; name: string; category: Category; price: number; summary: string; description: string; material: string; sizes: string[]; color: string };
type CartItem = { id: string; size: string; quantity: number };
type Order = FashionOrder;
type Review = { id: string; productId: string; name: string; text: string; rating: number; date: string };
type Screen = 'home' | 'catalog' | 'product' | 'account' | 'checkout' | 'success' | 'looks' | 'look';
type Sheet = 'cart' | 'menu' | 'filters' | 'size-guide' | 'photo' | null;
type PriceRange = 'all' | 'under-10000' | '10000-20000' | 'over-20000';
type Filters = { size: string; color: string; price: PriceRange };
type FashionSnapshot = { screen: Screen; previousScreen: Screen; sheet: Sheet; selectedId: string; photoIndex: number; selectedSize: string | null; query: string; category: Category | 'Все'; sort: string; filters: Filters; featureIndex: number; lookId:FashionLookId };

const apparelSizes = ['XS', 'S', 'M', 'L', 'XL'];
const products: Product[] = [
  {id:"black-dress",name:"Чёрное платье миди",category:"Платья",price:12900,color:"Чёрный",summary:"Платье миди без рукавов",description:"Чёрное платье с круглым вырезом и лаконичным силуэтом. Носи самостоятельно или добавь жакет для более собранного образа.",material:"Текстиль",sizes:apparelSizes},
  {id:"beige-trench",name:"Бежевый тренч",category:"Верхняя одежда",price:22900,color:"Бежевый",summary:"Двубортный тренч с поясом",description:"Бежевый тренч с отложным воротником, двумя рядами пуговиц и поясом. Верхний слой, который легко сочетать с платьями и денимом.",material:"Текстиль",sizes:apparelSizes},
  {id:"white-shirt",name:"Белая рубашка",category:"Рубашки и топы",price:6900,color:"Белый",summary:"Рубашка с нагрудным карманом",description:"Белая рубашка с воротником, пуговицами и нагрудным карманом. Лаконичная основа для костюма, джинсов или юбки.",material:"Текстиль",sizes:apparelSizes},
  {id:"brown-blazer",name:"Коричневый жакет",category:"Костюмы",price:14900,color:"Коричневый",summary:"Жакет с лацканами и карманами",description:"Коричневый жакет с двумя пуговицами, лацканами и карманами с клапанами. Подходит для многослойных сочетаний.",material:"Текстиль",sizes:apparelSizes},
  {id:"ivory-knit",name:"Джемпер в крупную резинку",category:"Трикотаж",price:8900,color:"Молочный",summary:"Прямой удлинённый джемпер",description:"Джемпер цвета слоновой кости с круглым вырезом и фактурой крупной резинки. Мягкий слой для повседневного гардероба.",material:"Трикотаж",sizes:apparelSizes},
  {id:"blue-jeans",name:"Прямые голубые джинсы",category:"Джинсы и брюки",price:9900,color:"Голубой",summary:"Высокая посадка и прямой крой",description:"Светло-синие прямые джинсы с высокой посадкой и пятью карманами. Универсальная основа для трикотажа и рубашек.",material:"Деним",sizes:apparelSizes},
  {id:"grey-suit",name:"Графитовый костюм",category:"Костюмы",price:24900,color:"Графитовый",summary:"Жакет и прямые брюки",description:"Комплект из угольного однобортного приталенного жакета с одной пуговицей и прямых брюк. Вещи можно сочетать вместе или отдельно.",material:"Костюмный текстиль",sizes:apparelSizes},
  {id:"cream-skirt",name:"Кремовая юбка миди",category:"Юбки",price:7900,color:"Кремовый",summary:"Юбка миди А-силуэта",description:"Светлая юбка миди с плавно расширяющимся силуэтом. Сочетается с рубашками, жакетами и трикотажем.",material:"Текстиль",sizes:apparelSizes},
  {id:"black-trousers",name:"Чёрные широкие брюки",category:"Джинсы и брюки",price:9900,color:"Чёрный",summary:"Широкие костюмные брюки",description:"Чёрные брюки с широкими штанинами и спокойной линией талии. Подойдут к рубашке, футболке или жакету.",material:"Костюмный текстиль",sizes:apparelSizes},
  {id:"beige-cardigan",name:"Бежевый кардиган",category:"Трикотаж",price:8900,color:"Бежевый",summary:"Кардиган с V-вырезом",description:"Бежевый кардиган с V-образным вырезом и пуговицами. Можно носить самостоятельно или поверх базового слоя.",material:"Трикотаж",sizes:apparelSizes},
  {id:"white-tshirt",name:"Белая футболка",category:"Рубашки и топы",price:3900,color:"Белый",summary:"Базовая хлопковая футболка",description:"Белая футболка с круглым вырезом и короткими рукавами. Простой первый слой для разных образов.",material:"Хлопок",sizes:apparelSizes},
  {id:"burgundy-dress",name:"Бордовое платье миди",category:"Платья",price:13900,color:"Бордовый",summary:"Платье миди с длинным рукавом",description:"Бордовое платье с длинными рукавами, круглым вырезом и мягко расширяющейся юбкой.",material:"Текстиль",sizes:apparelSizes},
  {id:"denim-jacket",name:"Короткая джинсовая куртка",category:"Верхняя одежда",price:12900,color:"Синий",summary:"Короткая куртка из денима",description:"Синяя укороченная джинсовая куртка с воротником, пуговицами и нагрудными карманами.",material:"Деним",sizes:apparelSizes},
  {id:"striped-knit",name:"Джемпер в полоску",category:"Трикотаж",price:8900,color:"Белый / чёрный",summary:"Трикотаж с контрастной полоской",description:"Светлый джемпер с круглым вырезом и чёрными полосами. Выразительный акцент к однотонному дениму или юбке.",material:"Трикотаж",sizes:apparelSizes},
  {id:"black-skirt",name:"Чёрная юбка миди",category:"Юбки",price:7900,color:"Чёрный",summary:"Прямая юбка миди",description:"Чёрная юбка миди с чистой прямой линией. Сочетается с рубашками, жакетами и трикотажем.",material:"Текстиль",sizes:apparelSizes},
  {id:"navy-dress",name:"Тёмно-синее платье миди",category:"Платья",price:11900,color:"Тёмно-синий",summary:"Платье миди на тонких бретелях",description:"Лаконичное платье миди на тонких бретелях с мягкой линией силуэта. Самостоятельный образ или основа для сочетания с жакетом.",material:"Текстиль",sizes:apparelSizes},
  {id:"camel-coat",name:"Пальто цвета кэмел",category:"Верхняя одежда",price:24900,color:"Кэмел",summary:"Однобортное пальто прямого кроя",description:"Пальто тёплого оттенка кэмел с лацканами и однобортной застёжкой. Свободный прямой силуэт для многослойных образов.",material:"Текстиль",sizes:apparelSizes},
  {id:"olive-blouse",name:"Оливковая блуза",category:"Рубашки и топы",price:7900,color:"Оливковый",summary:"Блуза из гладкой ткани",description:"Блуза оливкового оттенка с воротником, длинными рукавами и застёжкой на пуговицы. Сочетается с прямыми джинсами и юбкой миди.",material:"Текстиль",sizes:apparelSizes},
  {id:"ecru-jeans",name:"Молочные прямые джинсы",category:"Джинсы и брюки",price:9900,color:"Молочный",summary:"Прямые джинсы с высокой посадкой",description:"Джинсы молочного оттенка с прямыми штанинами, высокой посадкой и карманами. Светлая основа для повседневных образов.",material:"Деним",sizes:apparelSizes},
  {id:"chocolate-skirt",name:"Шоколадная юбка со складками",category:"Юбки",price:8900,color:"Коричневый",summary:"Юбка миди со складками",description:"Юбка шоколадного оттенка длины миди со складками. Добавь мягкий трикотаж или лаконичную рубашку.",material:"Текстиль",sizes:apparelSizes},
  {id:"grey-cardigan",name:"Серый кардиган",category:"Трикотаж",price:8900,color:"Серый",summary:"Кардиган на пуговицах",description:"Серый кардиган с V-образным вырезом и застёжкой на пуговицы. Удобный слой для спокойных повседневных сочетаний.",material:"Трикотаж",sizes:apparelSizes},
];
const categories: Category[] = ['Платья', 'Верхняя одежда', 'Рубашки и топы', 'Джинсы и брюки', 'Трикотаж', 'Юбки', 'Костюмы'];
const emptyFilters: Filters = {size:'', color:'', price:'all'};
const priceLabels: Record<PriceRange, string> = {'all':'Любая цена', 'under-10000':'До 10 000 ₽', '10000-20000':'10 000–20 000 ₽', 'over-20000':'От 20 000 ₽'};
const colors = Array.from(new Set(products.map(product => product.color).join('/').split('/').map(color => color.trim().toLocaleLowerCase('ru-RU')))).map(color => color.charAt(0).toLocaleUpperCase('ru-RU') + color.slice(1));
const reviewExamples: Record<Category, string> = {
 'Платья':'Лаконичный силуэт для разных случаев.',
 'Верхняя одежда':'Удобно сочетать с другими вещами.',
 'Рубашки и топы':'Универсальная вещь на каждый день.',
 'Джинсы и брюки':'Спокойный силуэт на каждый день.',
 'Трикотаж':'Мягкая фактура для повседневных образов.',
 'Юбки':'Лаконичная линия и удобное сочетание.',
 'Костюмы':'Выразительная форма для собранного образа.'
};
const photoKinds = ['front', 'product', 'back'] as const;
const photoLabels = ['Вид спереди', 'Изделие отдельно', 'Вид сзади'] as const;
type PhotoKind = typeof photoKinds[number];
const image = (id: string, kind: PhotoKind) => `/women-fashion/${id}-${kind}.webp`;
const colorSwatch = (color: string) => ({'Чёрный':'#252525','Белый':'#f8f8f8','Бежевый':'#d8c9b4','Коричневый':'#694e3f','Молочный':'#e9e0cd','Голубой':'#a8bdd1','Графитовый':'#51545a','Кремовый':'#eadfcb','Бордовый':'#6e263b','Синий':'#536d91','Тёмно-синий':'#29354a','Кэмел':'#b9885d','Оливковый':'#777f60','Серый':'#9c9c9c','Белый / чёрный':'linear-gradient(135deg,#f7f7f7 50%,#303030 50%)'} as Record<string,string>)[color] || '#ddd';
const byId = (id: string) => products.find(product => product.id === id);
const formatPrice = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const modelWord = (count: number) => count % 10 === 1 && count % 100 !== 11 ? 'модель' : count % 10 >= 2 && count % 10 <= 4 && !(count % 100 >= 12 && count % 100 <= 14) ? 'модели' : 'моделей';
const storageKey = 'mira-women-fashion-demo-v1';
const lookDraftKey='mira-women-fashion-look-drafts-v1';
function readLookDrafts():Partial<Record<FashionLookId,FashionLookDraft>> {
  try {const data=JSON.parse(localStorage.getItem(lookDraftKey)||'{}');if(!data||typeof data!=='object'||Array.isArray(data))return {};const result:Partial<Record<FashionLookId,FashionLookDraft>>={};for(const look of fashionLookPresets){const raw=data[look.id];if(!raw||typeof raw!=='object'||Array.isArray(raw))continue;const draft:FashionLookDraft={};for(const id of look.ids){const product=byId(id),entry=raw[id];if(!product||!entry||typeof entry!=='object')continue;draft[id]={included:entry.included!==false,size:typeof entry.size==='string'&&product.sizes.includes(entry.size)?entry.size:''};}result[look.id]=draft;}return result;}catch{return {};}
}

function readSaved(): { cart: CartItem[]; favorites: string[]; orders: Order[]; reviews: Review[] } {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const cart = Array.isArray(parsed.cart) ? parsed.cart.filter((item: CartItem) => item && typeof item.id === 'string' && typeof item.size === 'string' && byId(item.id)?.sizes.includes(item.size) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 10) : [];
    const favorites = Array.isArray(parsed.favorites) ? Array.from(new Set<string>(parsed.favorites.filter((id: string) => typeof id === 'string' && byId(id)))) : [];
    const orders = Array.isArray(parsed.orders) ? parsed.orders.filter((order: Order) => order && typeof order.id === 'string' && typeof order.date === 'string' && !Number.isNaN(Date.parse(order.date)) && Number.isFinite(order.total) && order.total >= 0 && Number.isInteger(order.quantity) && order.quantity > 0).slice(0, 10) : [];
    const reviews = Array.isArray(parsed.reviews) ? parsed.reviews.filter((review: Review) => review && typeof review.id === 'string' && typeof review.productId === 'string' && byId(review.productId) && typeof review.name === 'string' && review.name.trim().length >= 2 && review.name.length <= 40 && typeof review.text === 'string' && review.text.trim().length >= 10 && review.text.length <= 600 && typeof review.date === 'string' && !Number.isNaN(Date.parse(review.date)) && Number.isInteger(review.rating) && review.rating >= 1 && review.rating <= 5).slice(0, 100) : [];
    return { cart, favorites, orders, reviews };
  } catch { return { cart: [], favorites: [], orders: [], reviews: [] }; }
}

function ProductCard({ product, favorite, onFavorite, onOpen, priority = false }: { product: Product; favorite: boolean; onFavorite: () => void; onOpen: () => void; priority?: boolean }) {
  return <article className="mf-card" data-testid={`mf-card-${product.id}`}>
    <div className="mf-card-image"><button type="button" className="mf-card-open" onClick={onOpen} onPointerEnter={() => warmImage(image(product.id, photoKinds[0]), 'high')} onTouchStart={() => warmImage(image(product.id, photoKinds[0]), 'high')} aria-label={`Открыть ${product.name}`}><img src={image(product.id, 'product')} alt={product.name} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" style={fashionPreview(image(product.id, 'product'))} onLoad={clearFashionPreview} onError={fallbackFashionPreview} /></button><button type="button" className="mf-card-heart mf-icon" onClick={onFavorite} aria-label={`${favorite ? 'Убрать из избранного' : 'В избранное'}: ${product.name}`} aria-pressed={favorite}><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button></div>
    <div className="mf-card-meta"><button type="button" onClick={onOpen}>{product.name}</button><span>{product.color}</span><strong>{formatPrice(product.price)}</strong></div>
  </article>;
}

export default function WomenFashion({ onClose }: { onClose: () => void }) {
  const wardrobe=useFashionWardrobe(products);
  const [lookId,setLookId]=useState<FashionLookId>('city');
  const [lookDrafts,setLookDrafts]=useState<Partial<Record<FashionLookId,FashionLookDraft>>>(readLookDrafts);
  const [lookDraftError,setLookDraftError]=useState(false);
  const [saved] = useState(readSaved);
  const [cart, setCart] = useState<CartItem[]>(saved.cart);
  const [favorites, setFavorites] = useState<string[]>(saved.favorites);
  const [orders, setOrders] = useState<Order[]>(saved.orders);
  const [reviews, setReviews] = useState<Review[]>(saved.reviews);
  const [screen, setScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [selectedId, setSelectedId] = useState('blue-jeans');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [photoZoomed, setPhotoZoomed] = useState(false);
  const photoViewport = useRef<HTMLDivElement>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'Все'>('Все');
  const [sort, setSort] = useState('featured');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const applyingFilters = useRef<Filters | null>(null);
  const [featureIndex, setFeatureIndex] = useState(0);
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [delivery, setDelivery] = useState<'pickup' | 'courier'>('pickup');
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewError, setReviewError] = useState('');
  const touchStart = useRef<{x:number; y:number} | null>(null);
  const catalogScroll = useRef(0);
  const checkoutOrigin = useRef<Screen>('catalog');
  const customerField = useRef<HTMLInputElement>(null);
  const phoneField = useRef<HTMLInputElement>(null);
  const addressField = useRef<HTMLInputElement>(null);
  const selected = byId(selectedId) || products[0];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (byId(item.id)?.price || 0) * item.quantity, 0);
  const shipping = delivery === 'courier' ? 390 : 0;
  const orderTotal = total + shipping;
  const featureProducts = [products[0], products[4], products[8], products[13]];
  const feature = featureProducts[featureIndex];

  // Checkout and review fields are deliberately excluded from browser history.
  function snapshot(): FashionSnapshot { return { screen, previousScreen, sheet, selectedId, photoIndex, selectedSize, query, category, sort, filters, featureIndex, lookId }; }
  function restoreSnapshot(value: FashionSnapshot) {
    setScreen(value.screen); setPreviousScreen(value.previousScreen); setSheet(value.sheet);
    setSelectedId(value.selectedId); setPhotoIndex(value.photoIndex); setSelectedSize(value.selectedSize);
    setQuery(value.query); setCategory(value.category); setSort(value.sort); setFeatureIndex(value.featureIndex); setLookId(value.lookId||'city');
    setFilters(applyingFilters.current ?? value.filters); applyingFilters.current = null;
    setSizeError(false);
    if (value.screen !== screen || value.selectedId !== selectedId) setReviewOpen(false);
  }
  const fashionHistory = useWomenFashionHistory({ getSnapshot: snapshot, restore: restoreSnapshot });
  useEffect(() => { fashionHistory.replaceCurrent(); }, [screen, previousScreen, sheet, selectedId, photoIndex, selectedSize, query, category, sort, filters, featureIndex, lookId, fashionHistory.replaceCurrent]);
  function transition(patch: Partial<FashionSnapshot>, preserveScroll = false) {
    const current = snapshot();
    const next = {...current, ...patch};
    if (Object.keys(patch).every(key => key === 'filters'
      ? current.filters.size === next.filters.size && current.filters.color === next.filters.color && current.filters.price === next.filters.price
      : current[key as keyof FashionSnapshot] === next[key as keyof FashionSnapshot])) return;
    fashionHistory.push(next, {preserveScroll});
    restoreSnapshot(next);
    if (!preserveScroll) scrollToTop();
  }
  function openSheet(next: Exclude<Sheet, null>) { transition({sheet:next}, true); }
  function closeSheet() { fashionHistory.back(() => setSheet(null)); }

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({cart, favorites, orders, reviews})); } catch { /* The demo remains usable without local storage. */ }
  }, [cart, favorites, orders, reviews]);
  useEffect(()=>{try{localStorage.setItem(lookDraftKey,JSON.stringify(lookDrafts));setLookDraftError(false);}catch{setLookDraftError(true);}},[lookDrafts]);

  useEffect(() => {
    const root = document.getElementById('root');
    const nodes = [document.documentElement, document.body, root].filter((node): node is HTMLElement => !!node);
    const colors = nodes.map(node => node.style.backgroundColor);
    nodes.forEach(node => { node.style.backgroundColor = '#fff'; });
    root?.classList.add('mf-scroll-root');
    const telegram = (window as any).Telegram?.WebApp;
    const old = {background:telegram?.backgroundColor, header:telegram?.headerColor, bottom:telegram?.bottomBarColor};
    try { telegram?.setBackgroundColor?.('#ffffff'); telegram?.setHeaderColor?.('#ffffff'); telegram?.setBottomBarColor?.('#ffffff'); } catch { /* Not available in older clients. */ }
    return () => {
      root?.classList.remove('mf-scroll-root');
      nodes.forEach((node, i) => { node.style.backgroundColor = colors[i]; });
      try { if (old.background) telegram?.setBackgroundColor?.(old.background); if (old.header) telegram?.setHeaderColor?.(old.header); if (old.bottom) telegram?.setBottomBarColor?.(old.bottom); } catch { /* Host controls its own theme. */ }
    };
  }, []);

  useEffect(() => {
    const root = document.getElementById('root');
    const nav = document.querySelector<HTMLElement>('.mf-nav');
    if (!root || !nav) return;
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { root.style.setProperty('--mf-scroll-clearance', `${Math.max(180, Math.ceil(root.getBoundingClientRect().bottom - nav.getBoundingClientRect().top + 24))}px`); }); };
    const observer = new ResizeObserver(update);
    observer.observe(root); observer.observe(nav);
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    const telegram = (window as any).Telegram?.WebApp;
    telegram?.onEvent?.('viewportChanged', update);
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', update); window.visualViewport?.removeEventListener('resize', update); window.visualViewport?.removeEventListener('scroll', update); telegram?.offEvent?.('viewportChanged', update); root.style.removeProperty('--mf-scroll-clearance'); };
  }, []);

  useEffect(() => {
    if (sheet !== 'photo') return;
    const frame = requestAnimationFrame(() => {
      const viewport = photoViewport.current;
      if (viewport) viewport.scrollTo({left: photoZoomed ? (viewport.scrollWidth - viewport.clientWidth) / 2 : 0, top: photoZoomed ? (viewport.scrollHeight - viewport.clientHeight) / 2 : 0});
    });
    return () => cancelAnimationFrame(frame);
  }, [sheet, photoIndex, photoZoomed]);

  useEffect(() => {
    if (!sheet) return;
    const background = document.querySelector<HTMLElement>('[data-testid="women-fashion"]');
    const nav = document.querySelector<HTMLElement>('.mf-nav');
    const headerNodes = Array.from(document.querySelectorAll<HTMLElement>('.w4-topbar, .home-ai-surface'));
    const inertNodes = [document.getElementById('root'), background, nav, ...headerNodes].filter((node): node is HTMLElement => !!node);
    const previouslyInert = inertNodes.map(node => node.hasAttribute('inert'));
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    inertNodes.forEach(node => node.setAttribute('inert', ''));
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('.mf-sheet button')?.focus({preventScroll:true}));
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { closeSheet(); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(document.querySelectorAll<HTMLElement>('.mf-sheet button:not([disabled]), .mf-sheet input, .mf-sheet select, .mf-sheet [href], .mf-sheet [tabindex="0"]'));
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls[controls.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) { event.preventDefault(); controls[0].focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', keydown); inertNodes.forEach((node, index) => { if (!previouslyInert[index]) node.removeAttribute('inert'); }); if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true}); };
  }, [sheet]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('ru-RU');
    const result = products.filter(product => (category === 'Все' || product.category === category)
      && (!term || `${product.name} ${product.category} ${product.color} ${product.summary} ${product.description} ${product.material}`.toLocaleLowerCase('ru-RU').includes(term))
      && (!filters.size || product.sizes.includes(filters.size))
      && (!filters.color || product.color.toLocaleLowerCase('ru-RU').split('/').map(color => color.trim()).includes(filters.color.toLocaleLowerCase('ru-RU')))
      && (filters.price === 'all' || (filters.price === 'under-10000' ? product.price < 10000 : filters.price === '10000-20000' ? product.price >= 10000 && product.price < 20000 : product.price >= 20000)));
    return [...result].sort((a, b) => sort === 'price-up' ? a.price - b.price : sort === 'price-down' ? b.price - a.price : 0);
  }, [category, query, sort, filters]);
  const filterCount = Number(Boolean(filters.size)) + Number(Boolean(filters.color)) + Number(filters.price !== 'all');

  function go(next: Screen) { transition({sheet:null, screen:next}); }
  function showCategory(next: Category | 'Все') { catalogScroll.current = 0; transition({category:next, query:'', sort:'featured', filters:emptyFilters, screen:'catalog', sheet:null}); }
  function openProduct(id: string) { wardrobe.addRecent(id); if (screen === 'catalog') catalogScroll.current = document.getElementById('root')?.scrollTop || 0; setReviewName(''); setReviewText(''); setReviewRating(0); setReviewError(''); transition({previousScreen:screen === 'product' ? previousScreen : screen, selectedId:id, photoIndex:0, selectedSize:null, screen:'product', sheet:null}); }
  function openLook(id:FashionLookId){transition({screen:'look',lookId:id,sheet:null});}
  function addLines(lines:FashionLookLine[]){const valid=lines.filter(line=>byId(line.id)?.sizes.includes(line.size)&&Number.isInteger(line.quantity)&&line.quantity>0);const capped=valid.some(line=>(cart.find(item=>item.id===line.id&&item.size===line.size)?.quantity||0)+line.quantity>10);setCart(old=>{const next=old.map(row=>({...row}));valid.forEach(line=>{const found=next.find(row=>row.id===line.id&&row.size===line.size);if(found)found.quantity=Math.min(10,found.quantity+line.quantity);else next.push({...line,quantity:Math.min(10,line.quantity)});});return next;});setNotice(capped?'Не все вещи добавлены: максимум — 10 штук одного размера.':'Выбранные вещи добавлены в корзину.');openSheet('cart');}
  function changeCartSize(id:string,oldSize:string,newSize:string){const product=byId(id);if(!product?.sizes.includes(newSize)||oldSize===newSize)return;const original=cart.find(row=>row.id===id&&row.size===oldSize);const existing=cart.find(row=>row.id===id&&row.size===newSize);if(!original)return;const capped=!!existing&&existing.quantity+original.quantity>10;if(capped){setNotice('Нельзя объединить размеры: максимум — 10 штук одного размера.');return;}setCart(old=>{const from=old.find(row=>row.id===id&&row.size===oldSize);if(!from)return old;const target=old.find(row=>row.id===id&&row.size===newSize);return target?old.filter(row=>row!==from).map(row=>row===target?{...row,quantity:Math.min(10,row.quantity+from.quantity)}:row):old.map(row=>row===from?{...row,size:newSize}:row);});setNotice('Размер в корзине изменён.');}
  function favorite(id: string) { setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); }
  function setQuantity(id: string, size: string, change: number) { setCart(current => current.map(item => item.id === id && item.size === size ? {...item, quantity:Math.min(10, item.quantity + change)} : item).filter(item => item.quantity > 0)); }
  function addToCart() {
    if (!selectedSize) { setSizeError(true); return; }
    setCart(current => {
      const found = current.find(item => item.id === selected.id && item.size === selectedSize);
      return found ? current.map(item => item === found ? {...item, quantity:Math.min(10, item.quantity + 1)} : item) : [...current, {id:selected.id, size:selectedSize, quantity:1}];
    });
    setNotice(`${selected.name}, размер ${selectedSize}: добавлено в корзину`); openSheet('cart');
  }
  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewRating || reviewName.trim().length < 2 || reviewText.trim().length < 10) { setReviewError('Выбери оценку, укажи имя и напиши не менее 10 символов.'); return; }
    const review = {id:`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, productId:selected.id, name:reviewName.trim().slice(0,40), text:reviewText.trim().slice(0,600), rating:reviewRating, date:new Date().toISOString()};
    setReviews(current => [review, ...current].slice(0, 100)); setReviewName(''); setReviewText(''); setReviewRating(0); setReviewError(''); setReviewOpen(false); setNotice('Спасибо! Отзыв сохранён на этом устройстве.');
  }
  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitted(true);
    if (!customer.trim() || phone.replace(/\D/g, '').length < 10 || (delivery === 'courier' && address.trim().length < 5) || !cart.length) {
      const field = !customer.trim() ? customerField : phone.replace(/\D/g, '').length < 10 ? phoneField : delivery === 'courier' && address.trim().length < 5 ? addressField : null;
      requestAnimationFrame(() => { const input = field?.current; if (input) { input.focus({preventScroll:true}); input.scrollIntoView({block:'center', behavior:'auto'}); } });
      return;
    }
    const order:Order = {id:`DEMO-${Date.now().toString().slice(-6)}`, total:orderTotal, quantity:count, date:new Date().toISOString(), delivery:delivery==='courier'?'Курьером':'Самовывоз', shipping, items:cart.map(row=>({...row,name:byId(row.id)?.name,unitPrice:byId(row.id)?.price}))};
    setOrders(current => [order, ...current].slice(0, 10)); setLastOrder(order); setCart([]); setCustomer(''); setPhone(''); setAddress(''); setDelivery('pickup'); setSubmitted(false); go('success');
  }
  const activeTab = screen === 'product' ? (previousScreen === 'home' || previousScreen === 'account' ? previousScreen : 'catalog') : screen === 'looks' || screen === 'look' ? 'home' : screen;
  const back = () => fashionHistory.back(() => {
    if (screen === 'product' && previousScreen === 'catalog') {
      setScreen('catalog'); setSheet(null); setSizeError(false);
      requestAnimationFrame(() => requestAnimationFrame(() => { const root = document.getElementById('root'); if (root) root.scrollTop = catalogScroll.current; }));
    } else if (screen === 'product') { setSheet(null); setScreen(previousScreen); scrollToTop(); }
    else if (screen === 'checkout') { setScreen(checkoutOrigin.current); setSheet('cart'); }
    else { setSheet(null); setScreen('home'); scrollToTop(); }
  });

  return <div className="mf-store mira-store" data-testid="women-fashion" lang="ru">
    <main className="mf-main" key={screen}>
      {(screen === 'product' || screen === 'checkout' || screen === 'success') && <button type="button" className="mf-page-back" onClick={back}><ArrowLeft size={18}/> Назад</button>}
      {screen === 'home' && <section className="mf-home">
        <div className="mf-hero mira-hero"><div className="mira-hero-kicker"><span>MIRA / НОВАЯ КОЛЛЕКЦИЯ</span><button type="button" onClick={onClose} aria-label="Выйти из демо"><ArrowLeft size={14}/> Выйти</button></div><div className="mf-hero-headline" role="heading" aria-level={1} aria-label="Вещи для твоей жизни"><span>ВЕЩИ ДЛЯ</span><span>ТВОЕЙ ЖИЗНИ.</span></div><button className="mf-hero-photo" type="button" onClick={() => openProduct('black-dress')} aria-label="Открыть чёрное платье миди"><img src="/women-fashion/hero.webp" fetchPriority="high" decoding="async" style={fashionPreview('/women-fashion/hero.webp')} onLoad={event => { clearFashionPreview(event); if (!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) warmImages(products.slice(0, 4).map(product => image(product.id, 'product'))); }} onError={fallbackFashionPreview} alt="Чёрное платье миди на модели" /></button><div className="mf-hero-meta"><p>ЧЁРНОЕ ПЛАТЬЕ МИДИ <strong>{formatPrice(12900)}</strong></p><button className="mf-round-link" type="button" onClick={() => openProduct('black-dress')} aria-label="Смотреть платье"><ArrowRight size={21}/></button></div></div>
        <section className="mf-section"><div className="mf-section-head"><h2>ИССЛЕДУЙ<br/>КОЛЛЕКЦИЮ</h2><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>Все модели <ArrowRight size={15}/></button></div><div className="mf-categories">{categories.map(item => { const featured = item === 'Платья' ? 'black-dress' : item === 'Верхняя одежда' ? 'beige-trench' : item === 'Рубашки и топы' ? 'white-shirt' : item === 'Джинсы и брюки' ? 'blue-jeans' : item === 'Трикотаж' ? 'ivory-knit' : item === 'Юбки' ? 'cream-skirt' : 'grey-suit'; return <button type="button" key={item} className="mf-category" onClick={() => showCategory(item)}><span><img src={image(featured, 'product')} alt="" loading="lazy" decoding="async" style={fashionPreview(image(featured, 'product'))} onLoad={clearFashionPreview} onError={fallbackFashionPreview}/></span><strong>{item}</strong></button>; })}</div></section>
        <section className="mf-section mf-feature-section"><div className="mf-section-head"><h2>СОБРАНО<br/>ДЛЯ ТЕБЯ</h2><span>0{featureIndex + 1} / 04</span></div><div className="mf-feature"><div className="mf-feature-copy"><div><small>{feature.category} / 0{featureIndex + 1}</small><strong>{feature.name}</strong><span>{feature.sizes.slice(0, 3).join('  ·  ')}</span></div><b>{formatPrice(feature.price)}</b></div><button type="button" className="mf-feature-image" onClick={() => openProduct(feature.id)} aria-label={`Открыть ${feature.name}`}><img src={image(feature.id, 'front')} alt={`${feature.name} на модели`} loading="lazy" decoding="async" style={{...fashionPreview(image(feature.id, 'front'),'cover'),backgroundPosition:'center 24%'}} onLoad={clearFashionPreview} onError={fallbackFashionPreview}/></button><div className="mf-feature-arrows"><button className="mf-icon" type="button" aria-label="Предыдущая модель" onClick={() => setFeatureIndex((featureIndex + featureProducts.length - 1) % featureProducts.length)}><ArrowLeft size={19}/></button><button className="mf-icon" type="button" aria-label="Следующая модель" onClick={() => setFeatureIndex((featureIndex + 1) % featureProducts.length)}><ArrowRight size={19}/></button></div><button type="button" className="mf-feature-view" onClick={() => openProduct(feature.id)}>СМОТРЕТЬ МОДЕЛЬ <ArrowRight size={15}/></button></div><div className="mf-marquee" aria-hidden="true">MIRA / НА КАЖДЫЙ ДЕНЬ</div></section>
        <FashionJournal onLooks={()=>go('looks')} onProduct={openProduct}/>
        <section className="mf-section mf-collection"><div className="mf-section-head"><h2>ВЫБРАНО<br/>ДЛЯ ВАС</h2><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>В каталог <ArrowRight size={15}/></button></div><div className="mf-grid">{[products[1], products[4], products[8], products[12]].map(product => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => favorite(product.id)} onOpen={() => openProduct(product.id)}/>)}</div></section>
        <div className="mf-home-footer"><p>ОДЕЖДА ДЛЯ ЖИЗНИ.<br/>В ТВОЁМ РИТМЕ.</p><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>Смотреть коллекцию <ArrowRight size={15}/></button></div><p className="mf-demo-note">Демонстрационный магазин. Изображения и цены представлены для примера.</p>
      </section>}

      {screen === 'looks' && <FashionLooksIndex products={products} onBack={back} onOpenLook={openLook} savedIds={wardrobe.savedLookIds} onToggleSaved={wardrobe.toggleLook}/>}
      {screen === 'look' && <FashionLookPage key={lookId} lookId={lookId} products={products} draft={lookDrafts[lookId]} storageError={lookDraftError||wardrobe.error} onDraftChange={draft=>setLookDrafts(old=>({...old,[lookId]:draft}))} onBack={back} onOpenProduct={openProduct} onAdd={addLines} savedIds={wardrobe.savedLookIds} onToggleSaved={wardrobe.toggleLook}/>}
      {screen === 'catalog' && <section className="mf-section mf-catalog">
        <div className="mf-page-intro"><p className="mf-eyebrow">КОЛЛЕКЦИЯ / 2026</p><h1>НАЙДИ<br/>СВОЙ СТИЛЬ.</h1><p>Вещи для движения, города и тебя.</p></div>
        <div className="mf-search"><Search size={19}/><label className="mf-sr" htmlFor="mf-search-input">Поиск по коллекции</label><input id="mf-search-input" type="search" placeholder="Найти модель" value={query} onChange={event => setQuery(event.target.value)}/>{query && <button type="button" className="mf-icon" onClick={() => setQuery('')} aria-label="Очистить поиск"><X size={18}/></button>}</div>
        <div className="mf-chips" aria-label="Категории">{(['Все',...categories] as const).map(item => <button type="button" key={item} className={`mf-chip ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div>
        <div className="mf-catalog-tools"><button type="button" className="mf-filter-trigger" onClick={() => {setDraftFilters({...filters});openSheet('filters');}} aria-label={`Фильтры${filterCount ? ', выбрано ' + filterCount : ''}`}><SlidersHorizontal size={17}/> Фильтры {filterCount > 0 && <span>{filterCount}</span>}</button><label className="mf-sort">Сортировка <select aria-label="Сортировка" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">По подборке</option><option value="price-up">Сначала дешевле</option><option value="price-down">Сначала дороже</option></select><ChevronDown size={14}/></label></div>
        {filterCount > 0 && <div className="mf-applied-filters" aria-label="Выбранные фильтры">{filters.size && <button type="button" onClick={() => setFilters(current => ({...current,size:''}))} aria-label={`Убрать фильтр размера ${filters.size}`}>Размер: {filters.size} <X size={14}/></button>}{filters.color && <button type="button" onClick={() => setFilters(current => ({...current,color:''}))} aria-label={`Убрать фильтр цвета ${filters.color}`}>Цвет: {filters.color} <X size={14}/></button>}{filters.price !== 'all' && <button type="button" onClick={() => setFilters(current => ({...current,price:'all'}))} aria-label="Убрать фильтр цены">{priceLabels[filters.price]} <X size={14}/></button>}<button type="button" className="mf-filter-clear" onClick={() => setFilters(emptyFilters)}>Сбросить</button></div>}
        <p className="mf-result-count" aria-live="polite">{filtered.length} {modelWord(filtered.length)}</p>
        {filtered.length ? <div className="mf-grid">{filtered.map((product, index) => <ProductCard key={product.id} priority={index < 4} product={product} favorite={favorites.includes(product.id)} onFavorite={() => favorite(product.id)} onOpen={() => openProduct(product.id)}/>)}</div> : <div className="mf-empty"><Search size={26}/><h2>Ничего не найдено</h2><p>Попробуй изменить запрос или фильтры.</p><button type="button" className="mf-secondary" onClick={() => {setQuery('');setCategory('Все');setFilters(emptyFilters);}}>Показать всё</button></div>}
      </section>}

      {screen === 'product' && <section className="mf-product"><div className="mf-gallery" onTouchStart={event => { const point = event.touches[0]; touchStart.current = point ? {x:point.clientX, y:point.clientY} : null; }} onTouchEnd={event => { const point = event.changedTouches[0], start = touchStart.current; touchStart.current = null; if (!point || !start) return; const dx = point.clientX - start.x, dy = point.clientY - start.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) setPhotoIndex(current => Math.max(0, Math.min(photoKinds.length - 1, current + (dx < 0 ? 1 : -1)))); }}><img className={`mf-gallery-main${photoIndex === 2 && false ? ' mf-gallery-main--editorial' : ''}`} key={image(selected.id, photoKinds[photoIndex])} src={image(selected.id, photoKinds[photoIndex])} alt={`${selected.name}: ${photoLabels[photoIndex].toLocaleLowerCase('ru-RU')}, фотография ${photoIndex + 1} из ${photoKinds.length}`} decoding="async" style={fashionPreview(image(selected.id, photoKinds[photoIndex]), 'contain', true)} onLoad={clearFashionPreview} onError={fallbackFashionPreview}/><button type="button" className="mf-gallery-heart mf-icon" onClick={() => favorite(selected.id)} aria-label={`${favorites.includes(selected.id) ? 'Убрать из избранного' : 'В избранное'}: ${selected.name}`} aria-pressed={favorites.includes(selected.id)}><Heart size={20} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'}/></button><div className="mf-gallery-thumbs">{photoKinds.map((kind, index) => index === photoIndex ? null : <button type="button" key={kind} onClick={event => {const keyboard=event.detail===0;setPhotoIndex(index);if(keyboard)requestAnimationFrame(()=>document.querySelector<HTMLButtonElement>('.mf-gallery-zoom')?.focus({preventScroll:true}));}} aria-label={photoLabels[index]}><img src={image(selected.id, kind)} alt="" loading="lazy" decoding="async" style={fashionPreview(image(selected.id, kind))} onLoad={clearFashionPreview} onError={fallbackFashionPreview}/></button>)}</div><button type="button" className="mf-gallery-zoom mf-icon" aria-label="Увеличить фотографию товара" onClick={event => {event.currentTarget.focus({preventScroll:true});setPhotoZoomed(false);openSheet('photo');}}><ZoomIn size={19}/></button><div className="mf-gallery-count" aria-live="polite">0{photoIndex + 1} / 0{photoKinds.length}</div></div><div className="mf-product-info"><div className="mf-product-top"><div><p className="mf-eyebrow">{selected.category} / КОЛЛЕКЦИЯ</p><h1>{selected.name}</h1><p>{selected.summary}</p></div><strong className="mf-product-price">{formatPrice(selected.price)}</strong></div><div className="mf-size-heading"><strong>Выбери размер</strong><button type="button" className="mf-text-link" onClick={() => openSheet('size-guide')}>Как выбрать размер</button></div><div className="mf-sizes" aria-label="Размер">{selected.sizes.map(size => <button type="button" key={size} className={`mf-size ${selectedSize === size ? 'is-active' : ''}`} onClick={() => {setSelectedSize(size);setSizeError(false);}} aria-pressed={selectedSize === size}>{size}</button>)}</div>{sizeError && <p className="mf-error" role="alert">Выбери размер, чтобы добавить вещь в корзину.</p>}<button type="button" className="mf-primary mf-add" onClick={addToCart}><ShoppingBag size={17}/> ДОБАВИТЬ В КОРЗИНУ <span>{formatPrice(selected.price)}</span></button><FashionSaveToCollection productId={selected.id} wardrobe={wardrobe}/><p className="mf-description">{selected.description}</p><div className="mf-product-detail"><span>ЦВЕТ / ДОСТУПЕН В ДЕМО</span><strong className="mira-color-option"><span className="mira-color-dot" style={{background:colorSwatch(selected.color)}} aria-hidden="true"/>{selected.color}</strong></div><div className="mf-product-detail"><span>МАТЕРИАЛ</span><strong>{selected.material}</strong></div><p className="mf-demo-note">Демо: изображения и цены приведены для примера.</p><FashionProductInfo summary={selected.summary} material={selected.material}/><section className="mf-reviews" aria-labelledby="mf-reviews-title"><div className="mf-reviews-heading"><div><p className="mf-eyebrow">ВПЕЧАТЛЕНИЯ</p><h2 id="mf-reviews-title">ОТЗЫВЫ <span>{reviews.filter(review => review.productId === selected.id).length + 1}</span></h2></div><button type="button" className="mf-text-link" onClick={() => {setReviewOpen(value => !value);setReviewError('');}}>{reviewOpen ? 'Отменить' : 'Написать отзыв'} <ArrowRight size={15}/></button></div><p className="mf-demo-note">Пример отзыва показан для демонстрации. Новые отзывы сохраняются только на этом устройстве.</p>{reviewOpen && <form className="mf-review-form" onSubmit={submitReview} noValidate><strong>Твоя оценка</strong><div className="mf-stars" role="group" aria-label="Оценка товара">{[1,2,3,4,5].map(value => <button type="button" key={value} aria-label={`Оценка ${value} из 5`} aria-pressed={reviewRating === value} onClick={() => {setReviewRating(value);setReviewError('');}}><Star size={23} fill={value <= reviewRating ? 'currentColor' : 'none'}/></button>)}</div><label className="mf-field">Имя<input value={reviewName} onChange={event => {setReviewName(event.target.value);setReviewError('');}} maxLength={40} placeholder="Как тебя зовут" /></label><label className="mf-field">Твой отзыв<textarea value={reviewText} onChange={event => {setReviewText(event.target.value);setReviewError('');}} maxLength={600} rows={4} placeholder="Поделись впечатлением о модели" /></label>{reviewError && <p className="mf-error" role="alert">{reviewError}</p>}<button type="submit" className="mf-primary">СОХРАНИТЬ ОТЗЫВ</button></form>}{reviews.filter(review => review.productId === selected.id).map(review => <article className="mf-review" key={review.id}><div><strong>{review.name}</strong><span>Твой отзыв</span></div><div className="mf-review-stars" role="img" aria-label={`Оценка ${review.rating} из 5`}>{[1,2,3,4,5].map(value => <Star key={value} size={13} fill={value <= review.rating ? 'currentColor' : 'none'}/>)}</div><p>{review.text}</p></article>)}<article className="mf-review"><div><strong>Пример отзыва</strong><span>Демонстрация</span></div><div className="mf-review-stars" role="img" aria-label="Пример оценки 5 из 5">{[1,2,3,4,5].map(value => <Star key={value} size={13} fill="currentColor"/>)}</div><p>{reviewExamples[selected.category]}</p></article></section><div className="mf-related"><div className="mf-section-head"><h2>СОЧЕТАЙ<br/>С ЭТИМ</h2><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>Все модели <ArrowRight size={15}/></button></div><p className="mfx-related-note">Примеры сочетаний из демо-коллекции.</p><div className="mf-related-row">{fashionPairs[selected.category].map(id=>products.find(product=>product.id===id)).filter((product):product is Product=>Boolean(product&&product.id!==selected.id)).slice(0,4).map(product => <button type="button" key={product.id} onClick={() => openProduct(product.id)} aria-label={`Открыть ${product.name}`}><img src={image(product.id, 'product')} alt="" loading="lazy" decoding="async" style={fashionPreview(image(product.id, 'product'))} onLoad={clearFashionPreview} onError={fallbackFashionPreview}/><span>{product.name}</span><strong>{formatPrice(product.price)}</strong></button>)}</div></div></div></section>}

      {screen === 'account' && <section className="mf-section mf-account"><p className="mf-eyebrow">ЛИЧНОЕ / ПРОФИЛЬ</p><h1>ТВОЁ<br/>ПРОСТРАНСТВО.</h1><p className="mf-lead">Избранные вещи и история демо-заказов.</p><div className="mf-account-title"><Heart size={19}/><h2>ИЗБРАННОЕ</h2><span>{favorites.length}</span></div>{favorites.length ? <div className="mf-grid">{products.filter(product => favorites.includes(product.id)).map(product => <ProductCard key={product.id} product={product} favorite onFavorite={() => favorite(product.id)} onOpen={() => openProduct(product.id)}/>)}</div> : <div className="mf-empty"><p>Здесь появятся вещи, которые тебе понравились.</p><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>Выбрать модель <ArrowRight size={15}/></button></div>}<FashionWardrobe products={products} wardrobe={wardrobe} openProduct={openProduct} onOpenLook={openLook}/><div className="mf-account-title"><Package size={19}/><h2>ДЕМО-ЗАКАЗЫ</h2><span>{orders.length}</span></div><FashionOrders orders={orders} products={products} onRepeat={addLines}/><p className="mf-demo-note">Данные хранятся только на этом устройстве и не отправляются продавцу.</p></section>}

      {screen === 'checkout' && <section className="mf-section mf-checkout"><p className="mf-eyebrow">ПОСЛЕДНИЙ ШАГ / ДЕМО</p><h1>ОФОРМЛЕНИЕ<br/>ЗАКАЗА.</h1><p className="mf-lead">Заполни данные, чтобы увидеть пример оформления.</p><div className="mf-demo-banner"><Package size={19}/><span>Это демо. Данные не отправляются, оплата не списывается.</span></div><form onSubmit={submitOrder} noValidate><h2>КОНТАКТЫ</h2><label className="mf-field">Имя<input ref={customerField} value={customer} onChange={event => setCustomer(event.target.value)} autoComplete="name" aria-label="Имя" aria-describedby={submitted && !customer.trim() ? "mf-name-error" : undefined} aria-invalid={submitted && !customer.trim()} placeholder="Как тебя зовут"/>{submitted && !customer.trim() && <span id="mf-name-error" className="mf-error">Укажи имя.</span>}</label><label className="mf-field">Телефон<input type="tel" ref={phoneField} value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" aria-label="Телефон" aria-describedby={submitted && phone.replace(/\D/g, '').length < 10 ? "mf-phone-error" : undefined} aria-invalid={submitted && phone.replace(/\D/g, '').length < 10} placeholder="+7 999 000-00-00"/>{submitted && phone.replace(/\D/g,'').length < 10 && <span id="mf-phone-error" className="mf-error">Укажи номер телефона.</span>}</label><h2>СПОСОБ ПОЛУЧЕНИЯ</h2><div className="mf-delivery" role="group" aria-label="Способ получения"><button type="button" className={`mf-delivery-option ${delivery === 'pickup' ? 'is-active' : ''}`} onClick={() => setDelivery('pickup')} aria-pressed={delivery === 'pickup'}><span><strong>Самовывоз</strong><small>Бесплатно</small></span><span>0 ₽</span></button><button type="button" className={`mf-delivery-option ${delivery === 'courier' ? 'is-active' : ''}`} onClick={() => setDelivery('courier')} aria-pressed={delivery === 'courier'}><span><strong>Курьером</strong><small>Демо-доставка</small></span><span>{formatPrice(390)}</span></button></div>{delivery === 'courier' && <label className="mf-field">Адрес доставки<input ref={addressField} value={address} onChange={event => setAddress(event.target.value)} autoComplete="street-address" aria-label="Адрес доставки" aria-describedby={submitted && address.trim().length < 5 ? "mf-address-error" : undefined} aria-invalid={submitted && address.trim().length < 5} placeholder="Город, улица, дом"/>{submitted && address.trim().length < 5 && <span id="mf-address-error" className="mf-error">Укажи адрес доставки.</span>}</label>}<h2>ТВОЙ ЗАКАЗ</h2><div className="mf-order-summary">{cart.map(item => {const product=byId(item.id);return product && <div key={`${item.id}-${item.size}`}><span>{product.name} · {item.size} · {item.quantity} шт.</span><strong>{formatPrice(product.price * item.quantity)}</strong></div>;})}<div><span>Доставка</span><strong>{shipping ? formatPrice(shipping) : 'Бесплатно'}</strong></div><div><span>Итого</span><strong>{formatPrice(orderTotal)}</strong></div></div>{submitted && !cart.length && <p className="mf-error" role="alert">Корзина пуста.</p>}<button type="submit" className="mf-primary">ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ <ArrowRight size={16}/></button></form></section>}

      {screen === 'success' && <section className="mf-section mf-success"><span className="mf-success-icon"><Check size={28}/></span><p className="mf-eyebrow">ГОТОВО / ДЕМО</p><h1>ЗАКАЗ<br/>ОФОРМЛЕН.</h1><p>Это пример покупки: данные не отправлены, оплата не списана.</p>{lastOrder && <div className="mf-order-summary"><div><span>{lastOrder.id}</span><strong>{formatPrice(lastOrder.total)}</strong></div></div>}<button type="button" className="mf-primary" onClick={() => showCategory('Все')}>ПРОДОЛЖИТЬ ВЫБОР <ArrowRight size={16}/></button><button type="button" className="mf-secondary" onClick={() => go('account')}>Посмотреть историю</button></section>}
    </main>

    {createPortal(<div className="mf-portal">
      <nav className="mf-nav" aria-label="Навигация магазина"><button type="button" className={`mf-nav-button ${activeTab === 'home' && !sheet ? 'is-active' : ''}`} onClick={() => go('home')} aria-label="Главная" aria-current={activeTab==='home'&&!sheet?'page':undefined}><Home size={19}/><span>Главная</span></button><button type="button" className={`mf-nav-button ${activeTab === 'catalog' && !sheet ? 'is-active' : ''}`} onClick={() => showCategory('Все')} aria-label="Каталог" aria-current={activeTab==='catalog'&&!sheet?'page':undefined}><SlidersHorizontal size={19}/><span>Каталог</span></button><button type="button" className={`mf-nav-button ${sheet === 'cart' ? 'is-active' : ''}`} onClick={() => openSheet('cart')} aria-label={`Корзина, товаров: ${count}`}><span className="mf-nav-bag"><ShoppingBag size={19}/>{count > 0 && <i>{count}</i>}</span><span>Корзина</span></button><button type="button" className={`mf-nav-button ${activeTab === 'account' && !sheet ? 'is-active' : ''}`} onClick={() => go('account')} aria-label="Профиль" aria-current={activeTab==='account'&&!sheet?'page':undefined}><UserRound size={19}/><span>Профиль</span></button></nav>
      {sheet && <div className="mf-overlay" onClick={closeSheet}><section className={`mf-sheet${sheet === 'photo' ? ' mf-photo-sheet' : ''}`} role="dialog" aria-modal="true" aria-labelledby="mf-sheet-title" onClick={event => event.stopPropagation()}><div className="mf-sheet-handle"><span/></div><div className="mf-sheet-header"><h2 id="mf-sheet-title">{sheet === 'cart' ? 'КОРЗИНА' : sheet === 'menu' ? 'МЕНЮ' : sheet === 'size-guide' ? 'РАЗМЕРЫ' : sheet === 'photo' ? 'ФОТОГРАФИИ' : 'ФИЛЬТРЫ'}</h2><button type="button" className="mf-icon" onClick={closeSheet} aria-label="Закрыть"><X size={20}/></button></div>
        {sheet === 'photo' && <div className="mf-photo-viewer">
          <div ref={photoViewport} className={`mf-photo-viewport${photoZoomed ? ' is-zoomed' : ''}`} tabIndex={0} role="region" aria-label={photoZoomed ? 'Увеличенная фотография, можно прокручивать' : 'Фотография товара'}>
            <img key={image(selected.id, photoKinds[photoIndex])} src={image(selected.id, photoKinds[photoIndex])} alt={`${selected.name}: ${photoLabels[photoIndex].toLocaleLowerCase('ru-RU')}, фотография ${photoIndex + 1} из ${photoKinds.length}`} style={fashionPreview(image(selected.id, photoKinds[photoIndex]), 'contain', true)} onLoad={clearFashionPreview} onError={fallbackFashionPreview} draggable={false}/>
          </div>
          <div className="mf-photo-controls">
            <button type="button" className="mf-icon" aria-label="Предыдущая фотография" disabled={photoIndex === 0} onClick={() => setPhotoIndex(current => Math.max(0, current - 1))}><ArrowLeft size={20}/></button>
            <span aria-live="polite">{photoIndex + 1} / {photoKinds.length}</span>
            <button type="button" className="mf-icon" aria-label="Следующая фотография" disabled={photoIndex === photoKinds.length - 1} onClick={() => setPhotoIndex(current => Math.min(photoKinds.length - 1, current + 1))}><ArrowRight size={20}/></button>
            <button type="button" className="mf-photo-zoom-toggle" aria-label={photoZoomed ? 'Уменьшить фотографию' : 'Увеличить фотографию'} aria-pressed={photoZoomed} onClick={() => setPhotoZoomed(current => !current)}>{photoZoomed ? <ZoomOut size={18}/> : <ZoomIn size={18}/>} <span>{photoZoomed ? 'Уменьшить' : 'Увеличить'}</span></button>
          </div>
          {photoZoomed && <p className="mf-photo-hint">Перемещайте изображение, чтобы рассмотреть детали</p>}
        </div>}
        {sheet === 'cart' && <><div className="mf-sheet-body">{cart.length ? <><p className="mf-sheet-caption">{count} {count === 1 ? 'товар' : count >= 2 && count <= 4 ? 'товара' : 'товаров'}</p>{notice&&<p className="mfx-cart-notice" role="status">{notice}</p>}{cart.map(item => {const product=byId(item.id);return product && <article className="mf-cart-item" key={`${item.id}-${item.size}`}><button type="button" className="mf-cart-image" onClick={() => openProduct(product.id)} aria-label={`Открыть ${product.name}`}><img src={image(product.id,'product')} alt="" decoding="async" style={fashionPreview(image(product.id,'product'))} onLoad={clearFashionPreview} onError={fallbackFashionPreview}/></button><div className="mf-cart-info"><strong>{product.name}</strong><label className="mfx-cart-size">Размер<select aria-label={`Изменить размер ${product.name}, текущий ${item.size}`} value={item.size} onChange={event=>changeCartSize(item.id,item.size,event.target.value)}>{product.sizes.map(size=><option key={size} value={size}>{size}</option>)}</select></label><b>{formatPrice(product.price * item.quantity)}</b><div className="mf-qty"><button type="button" onClick={() => setQuantity(item.id,item.size,-1)} aria-label={`Уменьшить количество ${product.name}, размер ${item.size}`}><Minus size={14}/></button><span>{item.quantity}</span><button type="button" onClick={() => setQuantity(item.id,item.size,1)} aria-label={`Увеличить количество ${product.name}, размер ${item.size}`}><Plus size={14}/></button></div></div><button type="button" className="mf-icon" onClick={() => setCart(current => current.filter(entry => entry.id !== item.id || entry.size !== item.size))} aria-label={`Удалить ${product.name}, размер ${item.size}`}><Trash2 size={17}/></button></article>;})}</> : <div className="mf-empty"><ShoppingBag size={27}/><h3>ПОКА ПУСТО</h3><p>Выбери вещи из коллекции — они появятся здесь.</p><button type="button" className="mf-secondary" onClick={() => showCategory('Все')}>Перейти в каталог</button></div>}</div>{cart.length > 0 && <div className="mf-sheet-footer"><div><span>Итого</span><strong>{formatPrice(total)}</strong></div><button type="button" className="mf-primary" onClick={() => {if (screen !== 'checkout') checkoutOrigin.current = screen; setSubmitted(false);go('checkout');}}>ОФОРМИТЬ ДЕМО-ЗАКАЗ <ArrowRight size={16}/></button><p className="mf-demo-note">Без реальной оплаты и отправки данных.</p></div>}</>}
        {sheet === 'menu' && <div className="mf-sheet-body mf-menu"><button type="button" onClick={() => go('home')}>Главная <ArrowRight size={17}/></button><button type="button" onClick={() => showCategory('Все')}>Коллекция <ArrowRight size={17}/></button><button type="button" onClick={() => go('account')}>Избранное и заказы <ArrowRight size={17}/></button><button type="button" onClick={onClose}>Вернуться в WEB4TG <ArrowRight size={17}/></button></div>}
        {sheet === 'filters' && <><div className="mf-sheet-body mf-filter-body">
          <fieldset><legend>Размер одежды</legend><div className="mf-filter-options">{apparelSizes.map(size => <button type="button" key={size} aria-label={`Размер одежды ${size}`} aria-pressed={draftFilters.size === size} className={draftFilters.size === size ? 'is-selected' : ''} onClick={() => setDraftFilters(current => ({...current,size:current.size === size ? '' : size}))}>{size}</button>)}</div></fieldset>
          <fieldset><legend>Цена</legend><div className="mf-filter-options">{(Object.keys(priceLabels) as PriceRange[]).map(price => <button type="button" key={price} aria-pressed={draftFilters.price === price} className={draftFilters.price === price ? 'is-selected' : ''} onClick={() => setDraftFilters(current => ({...current,price}))}>{priceLabels[price]}</button>)}</div></fieldset>
          <fieldset><legend>Цвет</legend><div className="mf-filter-options">{colors.map(color => <button type="button" key={color} aria-pressed={draftFilters.color === color} className={draftFilters.color === color ? 'is-selected' : ''} onClick={() => setDraftFilters(current => ({...current,color:current.color === color ? '' : color}))}>{color}</button>)}</div></fieldset>
        </div><div className="mf-sheet-footer mf-filter-footer"><button type="button" className="mf-primary" onClick={() => {setFilters({...draftFilters}); applyingFilters.current = {...draftFilters}; fashionHistory.back(() => { applyingFilters.current = null; setSheet(null); });}}>ПОКАЗАТЬ ТОВАРЫ</button><button type="button" className="mf-secondary" onClick={() => setDraftFilters(emptyFilters)}>СБРОСИТЬ ФИЛЬТРЫ</button></div></>}
        {sheet === 'size-guide' && <FashionSizeGuide category={selected.category} onClose={closeSheet}/>}
      </section></div>}
    </div>, document.body)}
    <span className="mf-sr" role="status" aria-live="polite">{notice}</span>
  </div>;
}
