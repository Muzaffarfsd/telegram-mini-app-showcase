import { lockBackground } from './modalBackground';
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ArrowRight,
  Box,
  Check,
  Heart,
  Home,
  LayoutGrid,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Columns2,
  Trash2,
  UserRound,
  X,
  ZoomIn,
} from 'lucide-react';
import { DemoHomeButton } from '../../DemoHomeButton';
import { useLanguage } from '../../../contexts/LanguageContext';
import { restoreTelegramChrome } from '../../../lib/telegramChrome';
import { scrollToTop } from '../../../hooks/useScrollToTop';
import { furnitureCatalog, type FurnitureProduct } from './storeCatalog';
import FurnitureHome from './FurnitureHome';
import type { HomeEditSelection } from './FurnitureHomeEdits';
import FurnitureReviews from './FurnitureReviews';
import { studioAngleLabel, studioSrcSet, studioThumbnail } from './studioPhotography';
import FurnitureDetails from './FurnitureDetails';
import CatalogProductRow from './CatalogProductRow';
import { categoriesEn, materials, materialText, matchesSearch, typeLabel } from './catalogSearch';
import SavedRooms from './SavedRooms';
import { stories, readProjects, sharedRoom, type RoomKey, type RoomProject } from './roomLibrary';
import { roomProducts } from './roomProducts';
import FurniturePhotoSurface from './FurniturePhotoSurface';
import { useFurnitureHistory } from './useFurnitureHistory';
import './FurnitureStore.css';
import './atelier.css';

type Screen = 'home' | 'catalog' | 'product' | 'planner' | 'compare' | 'account' | 'checkout' | 'success';
type Sheet = 'cart' | null;
type SortOrder = 'featured' | 'name' | 'width';
type MaterialFilter = string;
type CartLine = { id: string; quantity: number };
type OrderLine = CartLine & { name: string; brand: string };
type DemoOrder = { id: string; date: string; items: OrderLine[]; delivery?: 'pickup' | 'courier' };
type Snapshot = {
  screen: Screen;
  previous: Screen;
  sheet: Sheet;
  selectedId: string;
  category: string;
  homeCategory?: string;
  homeEdits?: HomeEditSelection;
  query: string;
  sort: SortOrder;
  maxWidth: string;
  material: MaterialFilter;
  photo: number;
  zoomed: boolean;
  roomKey: RoomKey;
  projectId: string;
  viewing3D: boolean;
};
type StoreProps = {
  onClose: () => void;
  /** Populate only with real, sourced products and supplied photographs. */
  products?: readonly FurnitureProduct[];
  /** Optional real 3D viewer, mounted only when the visitor chooses it. */
  render3D?: (product: FurnitureProduct, onClose: () => void, onPlaceInRoom?: () => void) => ReactNode;
  /** Optional spatial planner, mounted on its own screen with a history-aware close action. */
  renderPlanner?: (product: FurnitureProduct, onClose: () => void, scene: RoomKey, project: RoomProject | undefined, openItem:(id:string)=>void, addKit:(ids:string[])=>void, transfer:()=>void, startIn3D?: boolean) => ReactNode;
};

const featuredOrder: Record<string, number> = {
  'rivet-revolve-sofa': 0,
  'abo-b0857jw1b9': 1,
  'rivet-round-coffee-table': 2,
};
const storageKey = 'web4tg-furniture-store-v1';
const englishCategory = categoriesEn;
const englishFact: Record<string, string> = {
  Размер: 'Dimensions',
  Цвет: 'Colour',
  Модель: 'Model',
};
const englishFactValue: Record<string, string> = { 'Светло-серый': 'Light grey', 'Песочный': 'Sand', 'Орех': 'Walnut' };
function modelCount(count: number, ru: boolean) {
  if (!ru) return `${count} ${count === 1 ? 'piece' : 'pieces'}`;
  const remainder = count % 100;
  const last = count % 10;
  const word =
    remainder >= 11 && remainder <= 14
      ? 'моделей'
      : last === 1
        ? 'модель'
        : last >= 2 && last <= 4
          ? 'модели'
          : 'моделей';
  return `${count} ${word}`;
}
function savedState(products: readonly FurnitureProduct[]): {
  favorites: string[];
  cart: CartLine[];
  orders: number;
  orderHistory: DemoOrder[];
  recent: string[];
  comparison: string[];
} {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const exists = (id: unknown) =>
      typeof id === 'string' && products.some((product) => product.id === id);
    return {
      favorites: Array.isArray(saved.favorites)
        ? Array.from(new Set<string>(saved.favorites.filter(exists)))
        : [],
      cart: Array.isArray(saved.cart)
        ? saved.cart
            .filter(
              (line: CartLine) =>
                exists(line?.id) &&
                Number.isInteger(line.quantity) &&
                line.quantity > 0 &&
                line.quantity <= 10
            )
            .filter(
              (line: CartLine, index: number, lines: CartLine[]) =>
                lines.findIndex((item) => item.id === line.id) === index
            )
            .map((line: CartLine) => ({ id: line.id, quantity: line.quantity }))
        : [],
      orders:
        Number.isInteger(saved.orders) && saved.orders >= 0 ? Math.min(saved.orders, 10000) : 0,
      recent: Array.isArray(saved.recent)
        ? Array.from(new Set<string>(saved.recent.filter(exists))).slice(0, 8)
        : [],
      comparison: Array.isArray(saved.comparison)
        ? Array.from(new Set<string>(saved.comparison.filter(exists))).slice(0, 3)
        : [],
      orderHistory: Array.isArray(saved.orderHistory)
        ? saved.orderHistory
            .filter(
              (order: DemoOrder) =>
                order &&
                typeof order.id === 'string' &&
                order.id.length <= 80 &&
                typeof order.date === 'string' &&
                !Number.isNaN(Date.parse(order.date)) &&
                Array.isArray(order.items) &&
                order.items.length > 0 &&
                order.items.length <= 30 &&
                order.items.every(
                  (line) =>
                    line &&
                    typeof line.id === 'string' &&
                    line.id.length <= 100 &&
                    typeof line.name === 'string' &&
                    line.name.length <= 150 &&
                    typeof line.brand === 'string' &&
                    line.brand.length <= 100 &&
                    Number.isInteger(line.quantity) &&
                    line.quantity > 0 &&
                    line.quantity <= 10
                )
            )
            .slice(0, 20)
            .map((order: DemoOrder) => ({
              id: order.id,
              date: order.date,
              ...(order.delivery === 'pickup' || order.delivery === 'courier' ? { delivery: order.delivery } : {}),
              items: order.items.map((line) => ({
                id: line.id,
                name: line.name,
                brand: line.brand,
                quantity: line.quantity,
              })),
            }))
        : [],
    };
  } catch {
    return { favorites: [], cart: [], orders: 0, orderHistory: [], recent: [], comparison: [] };
  }
}

function ProductImage({
  product,
  className = '',
  preferredPhoto = 0,
}: {
  product: FurnitureProduct;
  className?: string;
  preferredPhoto?: number;
}) {
  const { language } = useLanguage();
  const t = (r: string, e: string) => (language === 'ru' ? r : e);
  const [failed, setFailed] = useState<string[]>([]);
  const preferred = product.images[preferredPhoto] || product.images[0];
  const src = preferred && !failed.includes(preferred) ? preferred : product.images.find(image => !failed.includes(image));
  return src ? (
    <img
      className={className}
      src={src}
      srcSet={studioSrcSet(src)}
      sizes="(max-width: 679px) 46vw, (max-width: 1039px) 29vw, 250px"
      alt={product.name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(current => current.includes(src) ? current : [...current,src])}
    />
  ) : (
    <span className="fs-image-empty fs-image-fallback" role="img" aria-label={t('Фотография недоступна', 'Photo unavailable')}>
      {t('Фото недоступно', 'Photo unavailable')}
    </span>
  );
}

function ProductCard({
  product,
  favorite,
  onOpen,
  onFavorite,
  compact = false,
  displayLanguage,
}: {
  product: FurnitureProduct;
  favorite: boolean;
  onOpen: () => void;
  onFavorite: () => void;
  compact?: boolean;
  displayLanguage?: 'ru' | 'en';
}) {
  const { language: storeLanguage } = useLanguage();
  const language = displayLanguage ?? storeLanguage;
  const t = (r: string, e: string) => (language === 'ru' ? r : e);
  if (compact) {
    const size = product.dimensionsM && Math.round(product.dimensionsM[0] * 100) + t(' см', ' cm');
    const kind = typeLabel(product.category, language === 'ru');
    return (
      <article className="fhome-piece">
        <button type="button" className="fhome-piece-open" onClick={onOpen}
          aria-label={t('Открыть', 'Open') + ' ' + product.name + ', ' + kind}>
          <span className="fhome-piece-photo"><ProductImage product={product} /></span>
          <strong>{product.name}</strong>
          <small>{product.priceLabel || (size ? kind + ' · ' + size : product.brand)}</small>
        </button>
        <button type="button" className="fhome-piece-save" onClick={onFavorite} aria-pressed={favorite}
          aria-label={t(favorite ? 'Убрать из избранного' : 'В избранное', favorite ? 'Remove from favourites' : 'Add to favourites') + ': ' + product.name}>
          <Heart size={16} strokeWidth={1.5} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </article>
    );
  }
  return (
    <article className="fs-card">
      <div className="fs-card-image">
        <button
          type="button"
          className="fs-card-open"
          onClick={onOpen}
          aria-label={`${t('Открыть', 'Open')} ${product.name}${product.name==='Rivet Revolve'?', '+typeLabel(product.category,language==='ru'):''}`}
        >
          <ProductImage product={product} />
        </button>
        <button
          type="button"
          className="fs-card-heart fs-icon"
          onClick={onFavorite}
          aria-pressed={favorite}
          aria-label={`${favorite ? t('Убрать из избранного', 'Remove from favourites') : t('В избранное', 'Add to favourites')}: ${product.name}`}
        >
          <Heart size={19} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="fs-card-meta">
        <button type="button" onClick={onOpen}>
          {product.name==='Rivet Revolve'?typeLabel(product.category,language==='ru')+' · ':''}{product.name}
        </button>
        <span>{product.brand} · {language === 'ru' ? product.category : englishCategory[product.category] || product.category}</span>
        {product.dimensionsM && <span>{product.dimensionsM.map(value => Math.round(value * 100)).join(' × ')} {language === 'ru' ? 'см' : 'cm'}</span>}
        {product.priceLabel && <strong>{product.priceLabel}</strong>}
      </div>
    </article>
  );
}

export default function FurnitureStore({
  onClose,
  products = furnitureCatalog,
  render3D,
  renderPlanner,
}: StoreProps) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const t = (r: string, e: string) => (ru ? r : e);
  const [catalogPhoto, setCatalogPhoto] = useState<0 | 1>(0);
  const [initial] = useState(() => savedState(products));
  const [favorites, setFavorites] = useState(initial.favorites);
  const [cart, setCart] = useState(initial.cart);
  const [orders, setOrders] = useState(initial.orders);
  const [orderHistory, setOrderHistory] = useState(initial.orderHistory);
  const [recent, setRecent] = useState(initial.recent);
  const [comparison, setComparison] = useState(initial.comparison);
  const [shared] = useState(() => sharedRoom(roomProducts));
  const [projects,setProjects]=useState(()=>readProjects(roomProducts));
  const [roomKey,setRoomKey]=useState<RoomKey>(shared?'shared':'fixed');
  const [projectId,setProjectId]=useState('');
  const [onlyDifferences,setOnlyDifferences]=useState(false);
  const [screen, setScreen] = useState<Screen>(shared?'planner':'home');
  const [previous, setPrevious] = useState<Screen>('home');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [selectedId, setSelectedId] = useState(shared?(shared.layout.items[0]?.productId||products[0]?.id||''):'');
  const [category, setCategory] = useState('Все');
  const [homeCategory, setHomeCategory] = useState('Диваны');
  const [homeEdits, setHomeEdits] = useState<HomeEditSelection>({});
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOrder>('featured');
  const [maxWidth, setMaxWidth] = useState('');
  const [material, setMaterial] = useState<MaterialFilter>('all');
  const [photo, setPhoto] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const zoomClose = useRef<HTMLButtonElement>(null);
  const [viewing3D, setViewing3D] = useState(false);
  const [notice, setNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [storageRetry, setStorageRetry] = useState(0);
  const [galleryError, setGalleryError] = useState(false);
  const [delivery, setDelivery] = useState<'pickup' | 'courier'>('pickup');
  const [completedDelivery, setCompletedDelivery] = useState<'pickup' | 'courier' | null>(null);
  const checkoutOrigin = useRef<Screen>('home');
  const plannerOrigin = useRef<Screen>('home');
  const compareHeading = useRef<HTMLHeadingElement>(null);
  const lastScreen = useRef<Screen>(screen);
  const selected = products.find((product) => product.id === selectedId);
  const comparedProducts = comparison.map(id => products.find(product => product.id === id)).filter((product): product is FurnitureProduct => !!product);
  const categories = useMemo(
    () => Array.from(new Set(products.map((product) => product.category))),
    [products]
  );
  const filtered = useMemo(() => {
    const matches=products.filter(product=>{
      if(category!=='Все'&&product.category!==category)return false;
      if(Number(maxWidth)>0&&(!product.dimensionsM||Math.round(product.dimensionsM[0]*100)>Number(maxWidth)))return false;
      const filter=materials.find(m=>m.id===material);
      return (!filter||filter.pattern.test(materialText(product)))&&matchesSearch(product,query);
    });
    if (sort === 'featured') matches.sort((a, b) => (featuredOrder[a.id] ?? 3) - (featuredOrder[b.id] ?? 3));
    if(sort==='width') matches.sort((a,b)=>(a.dimensionsM?.[0]??Infinity)-(b.dimensionsM?.[0]??Infinity));
    if (sort === 'name') {
      const collator = new Intl.Collator(language === 'ru' ? 'ru' : 'en', { sensitivity: 'base' });
      matches.sort(
        (a, b) => collator.compare(a.name, b.name) || collator.compare(a.brand, b.brand)
      );
    }
    return matches;
  }, [products, category, query, sort, language, maxWidth, material]);
  useEffect(()=>{if(screen==='account')setProjects(readProjects(roomProducts));},[screen]);
  const cartProducts = cart
    .map((line) => ({ line, product: products.find((product) => product.id === line.id) }))
    .filter((row): row is { line: CartLine; product: FurnitureProduct } => !!row.product);
  const count = cartProducts.reduce((sum, row) => sum + row.line.quantity, 0);
  const managerMessage = [
    t(
      'Здравствуйте! Запрос по демо мебельного магазина:',
      'Hello! Request about the furniture store demo:'
    ),
    ...cartProducts.map(({ line, product }) => {
      const categoryName = ru
        ? product.category
        : englishCategory[product.category] || product.category;
      return `• ${categoryName}: ${product.name} (${product.brand}) × ${line.quantity}`;
    }),
  ].join('\n');
  const managerUrl = `https://t.me/web4tgs?${new URLSearchParams({ text: managerMessage })}`;

  const snapshot = (): Snapshot => ({
    screen,
    previous,
    sheet,
    selectedId,
    category,
    homeCategory,
    homeEdits,
    query,
    sort,
    maxWidth,
    material,
    photo,
    zoomed, roomKey, projectId,
    viewing3D,
  });
  const restore = (next: Snapshot) => {
    setScreen(next.screen);
    setPrevious(next.previous);
    setSheet(next.sheet);
    setSelectedId(next.selectedId);
    setCategory(next.category);
    setHomeCategory(next.homeCategory ?? 'Диваны');
    setHomeEdits(next.homeEdits ?? {});
    setQuery(next.query);
    setSort(next.sort ?? 'featured');
    setMaxWidth(next.maxWidth ?? '');
    setMaterial(next.material ?? 'all');
    setPhoto(next.photo);
    setViewing3D(next.viewing3D);
    setZoomed(!!next.zoomed);setRoomKey(next.roomKey||'fixed');setProjectId(next.projectId||'');
  };
  const history = useFurnitureHistory<Snapshot>({ getSnapshot: snapshot, restore });
  useEffect(() => {
    history.replaceCurrent();
  }, [
    screen,
    previous,
    sheet,
    selectedId,
    category,
    homeCategory,
    homeEdits,
    query,
    sort,
    maxWidth,
    material,
    photo,
    viewing3D,
    zoomed,roomKey,projectId,
    history.replaceCurrent,
  ]);
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ favorites, cart, orders, orderHistory, recent, comparison })
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [favorites, cart, orders, orderHistory, recent, comparison, storageRetry]);
  useEffect(() => {
    const before = lastScreen.current;
    lastScreen.current = screen;
    const frame = requestAnimationFrame(() => {
      if (screen === 'compare') compareHeading.current?.focus({ preventScroll: true });
      else if (before === 'compare' && screen === 'catalog') document.querySelector<HTMLButtonElement>('.fs-open-comparison')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [screen]);
  useEffect(() => {
    if (
      screen !== 'product' ||
      !selectedId ||
      !products.some((product) => product.id === selectedId)
    )
      return;
    setRecent((current) =>
      current[0] === selectedId
        ? current
        : [selectedId, ...current.filter((id) => id !== selectedId)].slice(0, 8)
    );
  }, [screen, selectedId, products]);
  useEffect(() => {
    if (screen !== 'product' || viewing3D) setZoomed(false);
  }, [screen, selectedId, viewing3D]);
  useEffect(() => setGalleryError(false), [selectedId, photo]);
  useEffect(() => {
    if (screen !== 'checkout') {
      setDelivery('pickup');
    }
  }, [screen]);
  useEffect(() => {
    if (!zoomed) return;
    const nodes = [
      document.getElementById('root'),
      document.querySelector<HTMLElement>('.fs-nav'),
      ...Array.from(document.querySelectorAll<HTMLElement>('.w4-topbar, .home-ai-surface')),
    ].filter((node): node is HTMLElement => !!node);
    const release = lockBackground(nodes);
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => zoomClose.current?.focus({ preventScroll: true }));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        history.back(()=>setZoomed(false));
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(
        document.querySelectorAll<HTMLElement>(
          '.fs-zoom-dialog button:not([disabled]), .fs-zoom-dialog [tabindex="0"]'
        )
      );
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault();
        controls[controls.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
        event.preventDefault();
        controls[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      release();
      if (focus?.isConnected) focus.focus({ preventScroll: true });
    };
  }, [zoomed]);
  useEffect(() => {
    const root = document.getElementById('root');
    const nodes = [document.documentElement, document.body, root].filter(
      (node): node is HTMLElement => !!node
    );
    const colors = nodes.map((node) => node.style.backgroundColor);
    nodes.forEach((node) => {
      node.style.backgroundColor = '#fff';
    });
    root?.classList.add('fs-scroll-root');
    const telegram = (window as any).Telegram?.WebApp;
    const old = {
      header: telegram?.headerColor,
      background: telegram?.backgroundColor,
      bottom: telegram?.bottomBarColor,
    };
    try {
      telegram?.setHeaderColor?.('#ffffff');
      telegram?.setBackgroundColor?.('#ffffff');
      telegram?.setBottomBarColor?.('#ffffff');
    } catch {
      /* Host may not support these calls. */
    }
    return () => {
      root?.classList.remove('fs-scroll-root');
      nodes.forEach((node, i) => {
        node.style.backgroundColor = colors[i];
      });
      restoreTelegramChrome(telegram, old);
    };
  }, []);
  useEffect(() => {
    const root = document.getElementById('root'),
      nav = document.querySelector<HTMLElement>('.fs-nav');
    if (!root || !nav) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        root.style.setProperty(
          '--fs-scroll-clearance',
          `${nav.hidden?24:Math.max(96, Math.ceil(root.getBoundingClientRect().bottom - nav.getBoundingClientRect().top + 24))}px`
        )
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(nav);
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    const telegram = (window as any).Telegram?.WebApp;
    telegram?.onEvent?.('viewportChanged', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      telegram?.offEvent?.('viewportChanged', update);
      root.style.removeProperty('--fs-scroll-clearance');
    };
  }, []);
  useEffect(() => {
    if (!sheet) return;
    const nodes = [
      document.getElementById('root'),
      document.querySelector<HTMLElement>('.fs-nav'),
      ...Array.from(document.querySelectorAll<HTMLElement>('.w4-topbar, .home-ai-surface')),
    ].filter((node): node is HTMLElement => !!node);
    const release = lockBackground(nodes);
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('.fs-sheet button')?.focus({ preventScroll: true })
    );
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        history.back(() => setSheet(null));
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = Array.from(
        document.querySelectorAll<HTMLElement>(
          '.fs-sheet button:not([disabled]), .fs-sheet a[href], .fs-sheet input, .fs-sheet select'
        )
      );
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault();
        controls[controls.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
        event.preventDefault();
        controls[0].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      release();
      if (focus?.isConnected) focus.focus({ preventScroll: true });
    };
  }, [sheet, history.back]);

  function transition(patch: Partial<Snapshot>, preserveScroll = false) {
    history.push({ ...snapshot(), ...patch }, { preserveScroll });
    if (patch.screen !== undefined) setScreen(patch.screen);
    if (patch.previous !== undefined) setPrevious(patch.previous);
    if (patch.sheet !== undefined) setSheet(patch.sheet);
    if (patch.selectedId !== undefined) setSelectedId(patch.selectedId);
    if (patch.category !== undefined) setCategory(patch.category);
    if (patch.query !== undefined) setQuery(patch.query);
    if (patch.sort !== undefined) setSort(patch.sort);
    if (patch.maxWidth !== undefined) setMaxWidth(patch.maxWidth);
    if (patch.material !== undefined) setMaterial(patch.material);
    if (patch.photo !== undefined) setPhoto(patch.photo);
    if(patch.zoomed!==undefined)setZoomed(patch.zoomed);
    if(patch.roomKey!==undefined)setRoomKey(patch.roomKey);
    if(patch.projectId!==undefined)setProjectId(patch.projectId);
    if (patch.viewing3D !== undefined) setViewing3D(patch.viewing3D);
    if (!preserveScroll) scrollToTop();
  }
  const go = (next: Screen) => transition({ screen: next, sheet: null, viewing3D: false });
  const openCatalog = (next = 'Все', search = '') =>
    transition({ screen: 'catalog', sheet: null, category: next, query: search, maxWidth: '', material: 'all', viewing3D: false });
  const openComparison = () => transition({ screen: 'compare', previous: screen, sheet: null, viewing3D: false });
  const openProduct = (product: FurnitureProduct, initialPhoto=0) =>
    transition({
      screen: 'product',
      previous: screen === 'product' ? previous : screen,
      sheet: null,
      selectedId: product.id,
      photo: initialPhoto,
      zoomed: false,
      viewing3D: false,
    });
  const openPlanner = (product: FurnitureProduct, scene:RoomKey='fixed', pid='', startIn3D=false) => {
    plannerOrigin.current = screen;
    transition({ screen: 'planner', roomKey:scene, projectId:pid, sheet: null, selectedId: product.id, viewing3D: startIn3D, zoomed:false });
  };
  const back = () =>
    history.back(() => {
      if (screen === 'planner') {
        setScreen(plannerOrigin.current);
        setSheet(null);
      } else if (screen === 'checkout') {
        setScreen(checkoutOrigin.current);
        setSheet('cart');
      } else {
        setScreen(screen === 'product' || screen === 'compare' ? previous : 'home');
        setSheet(null);
        scrollToTop();
      }
    });
  const toggleFavorite = (id: string) =>
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  const toggleComparison = (id: string) => setComparison(current =>
    current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current
  );
  const quantity = (id: string, change: number) =>
    setCart((current) =>
      current
        .map((line) =>
          line.id === id ? { ...line, quantity: Math.min(10, line.quantity + change) } : line
        )
        .filter((line) => line.quantity > 0)
    );
  const add = (product: FurnitureProduct, openBag = true) => {
    const atLimit = (cart.find((line) => line.id === product.id)?.quantity || 0) >= 10;
    setCart((current) =>
      current.some((line) => line.id === product.id)
        ? current.map((line) =>
            line.id === product.id ? { ...line, quantity: Math.min(10, line.quantity + 1) } : line
          )
        : [...current, { id: product.id, quantity: 1 }]
    );
    setNotice(atLimit ? t('В демо-корзине максимум 10 штук одной модели.', 'The demo bag is limited to 10 pieces per model.') : t('Добавлено в демо-корзину.', 'Added to your demo bag.'));
    if (openBag) transition({ sheet: 'cart' }, true);
  };
  const repeat = (order: DemoOrder) => {
    const eligible = order.items.filter((line) =>
      products.some((product) => product.id === line.id)
    );
    if (!eligible.length) return;
    const limited = eligible.some(
      (line) => (cart.find((item) => item.id === line.id)?.quantity || 0) + line.quantity > 10
    );
    setCart((current) => {
      const next = current.map((line) => ({ ...line }));
      for (const line of eligible) {
        const found = next.find((item) => item.id === line.id);
        if (found) {
          found.quantity = Math.min(10, found.quantity + line.quantity);
        } else next.push({ id: line.id, quantity: Math.min(10, line.quantity) });
      }
      return next;
    });
    const notes = [
      eligible.length !== order.items.length
        ? t(
            'В корзину добавлены только модели из текущего демо-каталога.',
            'Only pieces in the current demo catalogue were added.'
          )
        : '',
      limited
        ? t(
            'Не все товары добавлены: максимум 10 штук одной модели.',
            'Some pieces were not added: the limit is 10 per model.'
          )
        : '',
    ].filter(Boolean);
    setNotice(
      notes.length
        ? notes.join(' ')
        : t('Состав демо-заказа добавлен в корзину.', 'The demo order was added to your bag.')
    );
    transition({ sheet: 'cart' }, true);
  };
  const closeSheet = () => history.back(() => setSheet(null));
  const submitDemoOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartProducts.length) return;
    const order: DemoOrder = {
      id:
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: new Date().toISOString(),
      delivery,
      items: cartProducts.map(({ line, product }) => ({
        id: line.id,
        name: product.name,
        brand: product.brand,
        quantity: line.quantity,
      })),
    };
    setOrderHistory((current) => [order, ...current].slice(0, 20));
    setOrders((value) => value + 1);
    setCart([]);
    setCompletedDelivery(delivery);
    go('success');
  };
  const active =
    screen === 'compare' ? 'catalog' : screen === 'product' || screen === 'planner'
      ? previous === 'home' || previous === 'account'
        ? previous
        : 'catalog'
      : screen;

  return (
    <div className="fs-store" data-testid="furniture-store" data-screen={screen} lang={ru ? 'ru' : 'en'}>
      {storageError && !sheet && (
        <div className="fs-storage-warning" role="alert">
          <span>{t('Не удалось сохранить подборку. После закрытия она может пропасть.', 'Your selection could not be saved and may be lost when you close the app.')}</span>
          <button type="button" onClick={() => setStorageRetry(value => value + 1)}>{t('Повторить', 'Retry')}</button>
        </div>
      )}
      <main className="fs-main" key={screen}>
        {(screen === 'product' || screen === 'compare' ||
          screen === 'planner' ||
          screen === 'checkout' ||
          screen === 'success') && (
          <button type="button" className="fs-back" onClick={back}>
            <ArrowLeft size={18} /> {t('Назад', 'Back')}
          </button>
        )}
        {screen === 'home' && (
          <FurnitureHome
            products={products}
            ru={ru}
            category={homeCategory}
            onCategoryChange={setHomeCategory}
            edits={homeEdits}
            onEdit={patch => setHomeEdits(current => ({ ...current, ...patch }))}
            plannerAvailable={!!renderPlanner}
            onOpenProduct={openProduct}
            onOpenPlanner={(product, scene, startIn3D) => openPlanner(product, scene, undefined, startIn3D)}
            onOpenCatalog={openCatalog}
            renderCard={(product, displayLanguage) => (
              <ProductCard
                compact
                displayLanguage={displayLanguage}
                product={product}
                favorite={favorites.includes(product.id)}
                onFavorite={() => toggleFavorite(product.id)}
                onOpen={() => openProduct(product)}
              />
            )}
          />
        )}
        {screen === 'catalog' && (
          <section className="fs-section fs-catalog">
            <div className="fs-page-intro">
              <h1>{t('Каталог', 'Catalogue')}</h1>
              <button type="button" className="fs-open-comparison" onClick={openComparison} aria-label={t('Сравнение', 'Compare') + ' ' + comparison.length + ' / 3'}><Columns2 size={17}/><span>{t('Сравнение','Compare')}</span><small>{comparison.length} / 3</small></button>
            </div>
            <div className="fs-catalog-searchbar">
            <div className="fs-search">
              <Search size={19} />
              <label className="fs-sr" htmlFor="fs-search">
                {t('Поиск по коллекции', 'Search the collection')}
              </label>
              <input
                id="fs-search"
                type="search"
                placeholder={t('Найти модель', 'Find a piece')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="fs-icon"
                  onClick={() => setQuery('')}
                  aria-label={t('Очистить поиск', 'Clear search')}
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <details className="fs-filters">
              <summary><SlidersHorizontal size={18}/><span className="fs-sr">{t('Фильтры', 'Filters')}</span>{(maxWidth || material !== 'all') && <span aria-label={t('Фильтры включены', 'Filters active')}>●</span>}</summary>
              <div className="fs-filter-fields">
                <label htmlFor="fs-width">{t('Ширина до, см', 'Maximum width, cm')}</label>
                <input id="fs-width" type="number" inputMode="numeric" min="1" max="1000" value={maxWidth} onChange={event => setMaxWidth(event.target.value)} placeholder={t('Например, 200', 'For example, 200')} aria-invalid={!!maxWidth && Number(maxWidth) <= 0} />
                {maxWidth && Number(maxWidth) <= 0 && <span className="fs-filter-error">{t('Укажите ширину больше нуля.', 'Enter a width greater than zero.')}</span>}
                <label htmlFor="fs-material">{t('Основной материал', 'Main material')}</label>
                <select id="fs-material" value={material} onChange={event => setMaterial(event.target.value as MaterialFilter)}>
                  <option value="all">{t('Любой', 'Any')}</option>
                  {materials.filter(m=>products.some(p=>m.pattern.test(materialText(p)))).map(m=><option key={m.id} value={m.id}>{ru?m.ru:m.en}</option>)}
                </select>
                {(maxWidth || material !== 'all') && <button type="button" onClick={() => { setMaxWidth(''); setMaterial('all'); }}>{t('Сбросить фильтры', 'Clear filters')}</button>}
              </div>
            {filtered.length > 0 && <div className="fs-photo-mode" role="group" aria-label={t('Вид каталога','Catalogue view')}>
              <button type="button" aria-pressed={catalogPhoto === 0} onClick={() => setCatalogPhoto(0)}>{t('В студии','In the studio')}</button>
              <button type="button" aria-pressed={catalogPhoto === 1} onClick={() => setCatalogPhoto(1)}>{t('В интерьере','In an interior')}</button>
            </div>}
            </details>
            </div>
            <div className="fs-chips" role="group" aria-label={t('Категории', 'Categories')}>
              {['Все', ...categories].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`fs-chip ${category === item ? 'is-active' : ''}`}
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                >
                  {item === 'Все' ? t('Все', 'All') : ru ? item : englishCategory[item] || item}
                </button>
              ))}
            </div>
            <div className="fs-catalog-list-tools">
            <p className="fs-result" aria-live="polite" aria-atomic="true">{modelCount(filtered.length,ru)}</p>
              <label className="fs-sort">
                <span className="fs-sr">{t('Сортировка', 'Sort by')}</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
                  <option value="featured">{t('По подборке', 'Featured')}</option>
                  <option value="name">{t('По названию', 'Name')}</option>
                  <option value="width">{t('По ширине','Width, smallest first')}</option>
                </select>
              </label>
            </div>
            {filtered.length ? (
              <div className="fs-grid fs-catalog-list">
                {filtered.map(product => <CatalogProductRow key={product.id} product={product} ru={ru} interior={catalogPhoto===1}
                  image={<ProductImage product={product} preferredPhoto={catalogPhoto}/>}
                  favorite={favorites.includes(product.id)} compared={comparison.includes(product.id)} comparisonFull={comparison.length>=3}
                  quantity={cart.find(line=>line.id===product.id)?.quantity || 0}
                  onOpen={()=>openProduct(product, product.images[catalogPhoto] ? catalogPhoto : 0)} onAdd={()=>add(product,false)}
                  onFavorite={()=>toggleFavorite(product.id)} onCompare={()=>toggleComparison(product.id)}/>)}
              </div>
            ) : (
              <div className="fs-empty">
                <Search size={26} />
                <h2>
                  {products.length
                    ? t('НИЧЕГО НЕ НАЙДЕНО', 'NO RESULTS')
                    : t('КАТАЛОГ ГОТОВИТСЯ', 'CATALOGUE COMING SOON')}
                </h2>
                <p>
                  {products.length
                    ? t(
                        'Попробуйте изменить запрос или категорию.',
                        'Try a different search or category.'
                      )
                    : t(
                        'Здесь появятся подтверждённые модели мебели.',
                        'Verified furniture will appear here.'
                      )}
                </p>
                {products.length > 0 && (
                  <button
                    type="button"
                    className="fs-secondary"
                    onClick={() => {
                      setQuery('');
                      setCategory('Все');
                      setMaxWidth('');
                      setMaterial('all');
                    }}
                  >
                    {t('Показать всё', 'Show all')}
                  </button>
                )}
              </div>
            )}
          </section>
        )}
        {screen === 'compare' && (
          <section className="fs-section fs-compare" aria-labelledby="fs-compare-title">
            <p className="fs-eyebrow">{t('КОЛЛЕКЦИЯ / ВАШ ВЫБОР', 'COLLECTION / YOUR SELECTION')}</p>
            <h1 id="fs-compare-title" ref={compareHeading} tabIndex={-1}>{t('Сравнение.', 'Compare.')}</h1>
            <p className="fs-compare-intro">{t('Сравните до трёх моделей по характеристикам из каталога.', 'Compare up to three pieces using the catalogue specifications.')}</p>
            {comparedProducts.length === 0 ? (
              <div className="fs-compare-empty">
                <h2>{t('Пока ничего не выбрано', 'No pieces selected yet')}</h2>
                <p>{t('Добавьте модели из каталога, чтобы сравнить их рядом.', 'Add pieces from the catalogue to compare them side by side.')}</p>
                <button type="button" className="fs-secondary" onClick={() => openCatalog()}>{t('В каталог', 'Browse catalogue')}</button>
              </div>
            ) : (
              <>
                <p className="fs-compare-hint" aria-live="polite">{comparedProducts.length === 1 ? t('Добавьте ещё модель для сравнения.', 'Add another piece to compare.') : comparedProducts.length === 3 ? t('Проведите по таблице, чтобы увидеть все модели.', 'Swipe the table to see all pieces.') : t('Выбрано 2 из 3 моделей.', '2 of 3 pieces selected.')}</p>
                <label><input type="checkbox" checked={onlyDifferences} onChange={e=>setOnlyDifferences(e.target.checked)}/> {t('Только различия','Only differences')}</label>
                <div className="fs-compare-scroll" role="region" tabIndex={0} aria-label={t('Таблица сравнения моделей', 'Comparison table')}>
                  <table className="fs-compare-table" data-count={comparedProducts.length}>
                    <caption className="fs-sr">{t('Характеристики выбранных моделей', 'Specifications of selected pieces')}</caption>
                    <thead><tr><th scope="col">{t('Параметр', 'Feature')}</th>{comparedProducts.map(product => (
                      <th scope="col" key={product.id}>
                        <button type="button" className="fs-compare-model" onClick={() => openProduct(product)} aria-label={`${t('Открыть', 'Open')} ${product.name}, ${ru ? product.category : englishCategory[product.category] || product.category}`}>
                          <span className="fs-compare-photo"><ProductImage product={product} /></span>
                          <strong>{product.name}</strong><span>{ru ? product.category : englishCategory[product.category] || product.category}</span>
                        </button>
                        <button type="button" className="fs-compare-remove" onClick={() => { toggleComparison(product.id); requestAnimationFrame(() => (document.querySelector<HTMLElement>('.fs-compare-scroll') || compareHeading.current)?.focus({ preventScroll: true })); }} aria-label={`${t('Убрать из сравнения', 'Remove from comparison')}: ${product.name}, ${ru ? product.category : englishCategory[product.category] || product.category}`}><X size={15} aria-hidden="true" /> {t('Убрать', 'Remove')}</button>
                      </th>
                    ))}</tr></thead>
                    <tbody>
                      <tr><th scope="row">{t('Вид сверху в одном масштабе','Footprints at the same scale')}</th>{comparedProducts.map(p=><td key={p.id}><div className="compare-footprint" aria-label={p.name}><img src={'/furniture/plans/'+p.id+'.webp'} alt="" style={{width: (p.dimensionsM?.[0]||0)*100/Math.max(...comparedProducts.flatMap(q=>q.dimensionsM?.slice(0,2)||[1]))+'%',height:(p.dimensionsM?.[1]||0)*100/Math.max(...comparedProducts.flatMap(q=>q.dimensionsM?.slice(0,2)||[1]))+'%'}}/></div></td>)}</tr>
                      {[
                        { label: t('Тип', 'Type'), value: (product: FurnitureProduct) => ru ? product.category : englishCategory[product.category] || product.category },
                        { label: t('Бренд', 'Brand'), value: (product: FurnitureProduct) => product.brand },
                        ...[t('Ширина','Width'),t('Глубина','Depth'),t('Высота','Height')].map((label,index)=>({label,value:(p:FurnitureProduct)=>p.dimensionsM?Math.round(p.dimensionsM[index]*100)+' '+t('см','cm'):'—'})),
                        { label: t('Материал', 'Material'), value: (product: FurnitureProduct) => product.details?.find(detail => ['Обивка', 'Материал', 'Материалы'].includes(detail.label.ru))?.value[ru ? 'ru' : 'en'] || '—' },
                      ].filter(row=>!onlyDifferences||new Set(comparedProducts.map(row.value)).size>1).map(row => <tr key={row.label}><th scope="row">{row.label}</th>{comparedProducts.map(product => <td key={product.id}>{row.value(product)}</td>)}</tr>)}
                    </tbody>
                  </table>
                </div>
                {comparedProducts.length < 3 && <button type="button" className="fs-compare-add" onClick={() => openCatalog()}><Plus size={16} aria-hidden="true" /> {t('Добавить модель', 'Add a piece')}</button>}
              </>
            )}
          </section>
        )}
        {screen === 'product' && selected && (
          <section className="fs-product">
            <div className="fs-gallery">
              {selected.images[photo] && !galleryError ? (
                <div
                  className="fs-gallery-photo"
                  role="group"
                  tabIndex={0}
                  aria-label={t(
                    'Фотография товара. Переключайте стрелками влево и вправо.',
                    'Product photo. Use the left and right arrows to change photos.'
                  )}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                      event.preventDefault();
                      setPhoto((current) =>
                        Math.max(
                          0,
                          Math.min(
                            selected.images.length - 1,
                            current + (event.key === 'ArrowRight' ? 1 : -1)
                          )
                        )
                      );
                    }
                  }}
                  onTouchStart={(event) => {
                    const point = event.touches.length === 1 ? event.touches[0] : null;
                    touchStart.current = point ? { x: point.clientX, y: point.clientY } : null;
                  }}
                  onTouchEnd={(event) => {
                    const start = touchStart.current,
                      point = event.changedTouches[0];
                    touchStart.current = null;
                    if (!start || !point || event.touches.length) return;
                    const dx = point.clientX - start.x,
                      dy = point.clientY - start.y;
                    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2)
                      setPhoto((current) =>
                        Math.max(
                          0,
                          Math.min(selected.images.length - 1, current + (dx < 0 ? 1 : -1))
                        )
                      );
                  }}
                  onTouchCancel={() => {
                    touchStart.current = null;
                  }}
                >
                  <img
                    className="fs-gallery-main"
                    src={selected.images[photo]}
                    srcSet={studioSrcSet(selected.images[photo])}
                    sizes="(min-width: 680px) 510px, 100vw"
                    alt={`${selected.name} · ${studioAngleLabel(photo, ru)}`}
                    decoding="async"
                    draggable={false}
                    onError={() => setGalleryError(true)}
                  />
                </div>
              ) : (
                <div className="fs-gallery-fallback" role="status">
                  <span>{t('Не удалось загрузить фотографию.', 'The photo could not be loaded.')}</span>
                  <button type="button" onClick={() => setGalleryError(false)}>{t('Попробовать снова', 'Try again')}</button>
                </div>
              )}
              <button
                type="button"
                className="fs-gallery-heart fs-icon"
                onClick={() => toggleFavorite(selected.id)}
                aria-pressed={favorites.includes(selected.id)}
                aria-label={`${favorites.includes(selected.id) ? t('Убрать из избранного', 'Remove from favourites') : t('В избранное', 'Add to favourites')}: ${selected.name}`}
              >
                <Heart size={20} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} />
              </button>
              {!galleryError && selected.images[photo] && (
                <button
                  type="button"
                  className="fs-gallery-zoom fs-icon"
                  onClick={() => transition({zoomed:true},true)}
                  aria-label={t('Увеличить фотографию', 'Enlarge photo')}
                >
                  <ZoomIn size={19} />
                </button>
              )}
              {selected.images.length > 1 && (
                <>
                  <div className="fs-gallery-thumbs" role="group" aria-label={t('Ракурсы', 'Photo angles')}>
                    {selected.images.map((src, i) => (
                      <button
                        type="button"
                        key={`${src}-${i}`}
                        aria-label={`${t('Фотография', 'Photo')} ${i + 1}`}
                        aria-pressed={photo === i}
                        onClick={() => setPhoto(i)}
                      >
                        <img src={studioThumbnail(src)} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                  <span className="fs-gallery-count">
                    <span className="fs-gallery-angle" aria-live="polite">{studioAngleLabel(photo,ru)}</span>
                    {String(photo + 1).padStart(2, '0')} /{' '}
                    {String(selected.images.length).padStart(2, '0')}
                  </span>
                </>
              )}
              {render3D && selected.modelUrl && (
                <button
                  type="button"
                  className="fs-view-toggle"
                  onClick={() => transition({ viewing3D: true }, true)}
                  aria-pressed={viewing3D}
                >
                  <Box size={15} aria-hidden="true"/>{t('3D-обзор', '3D view')}
                </button>
              )}
            </div>
            {viewing3D && render3D && render3D(selected, () => history.back(() => setViewing3D(false)), renderPlanner ? () => openPlanner(selected) : undefined)}
            <div className="fs-product-info">
              <p className="fs-item-brand">{selected.brand}<span aria-hidden="true">/</span>{typeLabel(selected.category, ru)}</p>
              <div className="fs-product-top"><h1>{selected.name}</h1>{selected.priceLabel && <strong>{selected.priceLabel}</strong>}</div>
              {selected.dimensionsM && <p className="fs-item-size">{selected.dimensionsM.map(n => Math.round(n * 100)).join(' × ')} {t('см', 'cm')}</p>}
              <div className="fs-detail-links">{[['fs-details-title', t('О модели', 'About the piece')], ['fs-review-title', t('Отзывы', 'Reviews')]].map(([id, label]) => <button key={id} type="button" onClick={() => { const el = document.getElementById(id); el?.focus({ preventScroll: true }); el?.scrollIntoView({ block: 'start' }); }}>{label}<ChevronDown size={13}/></button>)}</div>
              <button type="button" className="fs-primary fs-add-piece" onClick={() => add(selected)}><ShoppingBag size={17}/>{t('Добавить в подборку','Add to selection')}<ArrowRight size={16}/></button>
              {renderPlanner && selected.modelUrl && <div className="fs-spatial-actions">
                <button type="button" className="fs-product-planner" onClick={() => openPlanner(selected)}><Box size={17}/>{t('Посмотреть в комнате', 'View in a room')}</button>
                <button type="button" className="fs-personal-piece" onClick={() => openPlanner(selected, 'custom')}><Plus size={17}/>{t('Добавить в мою комнату','Add to my room')}</button>
              </div>}
              <FurnitureDetails key={selected.id} product={selected} ru={ru}/>
              <FurnitureReviews key={'reviews-' + selected.id} productId={selected.id} ru={ru}/>
              {renderPlanner && stories.some(s => s.items.some(([id]) => id === selected.id)) && <div className="product-in-rooms"><h2>{t('В готовых комнатах','Styled in these rooms')}</h2>{stories.filter(s => s.items.some(([id]) => id === selected.id)).map(s => <button key={s.key} onClick={() => openPlanner(selected,s.key)}><img loading="lazy" src={'/furniture/scenes/'+s.key+'.webp'} alt=""/><span>{s.title[ru?0:1]}</span><ArrowUpRight size={16}/></button>)}</div>}
              <div className="fs-product-comparison">
                <button type="button" aria-pressed={comparison.includes(selected.id)} disabled={comparison.length >= 3 && !comparison.includes(selected.id)} onClick={() => toggleComparison(selected.id)}>{comparison.includes(selected.id) ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{comparison.includes(selected.id) ? t('В сравнении', 'Comparing') : t('Сравнить', 'Compare')}</button>
                {comparison.length>0&&<button type="button" onClick={openComparison}>{t('К сравнению', 'View comparison')} · {comparison.length} / 3 <ArrowRight size={15} aria-hidden="true" /></button>}
              </div>
              {comparison.length >= 3 && !comparison.includes(selected.id) && <p className="fs-compare-limit">{t('В сравнении уже три модели. Уберите одну, чтобы добавить эту.', 'Three pieces are selected. Remove one to add this piece.')}</p>}
              <p className="fs-demo-note">
                {t(
                  'Демонстрационный каталог. Наличие и стоимость уточняйте.',
                  'Demo catalogue. Check availability and pricing.'
                )}{' '}
                {t(
                  'Не официальный магазин. Демо-корзина хранится на этом устройстве.',
                  'Not an official store. Your demo bag is saved on this device.'
                )}
              </p>
              <details className="atelier-sources fs-disclosure"><summary>{t('Происхождение данных','Sources and attribution')}<ChevronDown size={17}/></summary>
              {selected.sourceDescription && <p>{selected.sourceDescription[ru ? 'ru' : 'en']}</p>}
              {selected.sourceUrl && (
                <a
                  className="fs-source"
                  href={selected.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('Источник товара', 'Product source')} <ArrowRight size={14} />
                </a>
              )}
              {selected.attribution && (
                <p className="fs-attribution">
                  {ru
                    ? selected.attribution.credit
                    : selected.attribution.creditEn || selected.attribution.credit}{' '}
                  ·{' '}
                  <a
                    href={selected.attribution.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('Источник 3D', '3D source')}
                  </a>{' '}
                  ·{' '}
                  <a
                    href={selected.attribution.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    CC BY 4.0
                  </a>
                </p>
              )}</details>
            </div>
          </section>
        )}
        {screen === 'planner' && selected && renderPlanner && (
          <section className="fs-planner" aria-label={t('Планировщик комнаты', 'Room planner')}>
            {renderPlanner(selected,back,roomKey,roomKey==='shared'&&shared?{id:'shared',name:t('Полученная комната','Shared room'),date:'',scene:shared.scene,layout:shared.layout}:projects.find(p=>p.id===projectId),id=>{const p=products.find(p=>p.id===id);if(p)openProduct(p)},ids=>{setCart(lines=>{const next=lines.map(l=>({...l}));for(const id of ids){const found=next.find(l=>l.id===id);if(found)found.quantity=Math.min(10,found.quantity+1);else next.push({id,quantity:1})}return next});transition({screen:'catalog',sheet:'cart',viewing3D:false})},()=>{setRoomKey('transferred');setProjectId('')},viewing3D)}
          </section>
        )}
        {screen === 'account' && (
          <section className="fs-section fs-account">
            <h1>{t('Профиль', 'Profile')}</h1>
            <p className="fs-lead">
              {t('Избранные модели и демо-заказы.', 'Saved pieces and demo orders.')}
            </p>
            <SavedRooms ru={ru} projects={projects} onChange={()=>setProjects(readProjects(roomProducts))} onError={()=>setStorageError(true)} onOpen={p=>openPlanner(products.find(q=>q.id===p.layout.items[0]?.productId)||products[0],p.scene,p.id)} onContinue={()=>openPlanner(products[0],'custom')}/>
            <div className="fs-account-title">
              <Heart size={19} />
              <h2>{t('ИЗБРАННОЕ', 'FAVOURITES')}</h2>
              <span>{favorites.length}</span>
            </div>
            {favorites.length ? (
              <div className="fs-grid">
                {products
                  .filter((product) => favorites.includes(product.id))
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      favorite
                      onFavorite={() => toggleFavorite(product.id)}
                      onOpen={() => openProduct(product)}
                    />
                  ))}
              </div>
            ) : (
              <div className="fs-empty">
                <p>
                  {t(
                    'Здесь появятся понравившиеся модели.',
                    'Your favourite pieces will appear here.'
                  )}
                </p>
                <button type="button" className="fs-text-link" onClick={() => openCatalog()}>
                  {t('Выбрать модель', 'Explore the collection')} <ArrowRight size={15} />
                </button>
              </div>
            )}
            {recent.length > 0 && (
              <>
                <div className="fs-account-title">
                  <Search size={19} />
                  <h2>{t('НЕДАВНО ПРОСМОТРЕНЫ', 'RECENTLY VIEWED')}</h2>
                  <span>{recent.length}</span>
                </div>
                <div className="fs-grid">
                  {recent
                    .map((id) => products.find((product) => product.id === id))
                    .filter((product): product is FurnitureProduct => !!product)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        favorite={favorites.includes(product.id)}
                        onFavorite={() => toggleFavorite(product.id)}
                        onOpen={() => openProduct(product)}
                      />
                    ))}
                </div>
              </>
            )}
            <div className="fs-account-title">
              <ShoppingBag size={19} />
              <h2>{t('ДЕМО-ЗАКАЗЫ', 'DEMO ORDERS')}</h2>
              <span>{orders}</span>
            </div>
            {orderHistory.length > 0 ? (
              <div className="fs-history">
                {orderHistory.map((order) => {
                  const count = order.items.reduce((total, line) => total + line.quantity, 0);
                  const eligible = order.items.filter((line) =>
                    products.some((product) => product.id === line.id)
                  );
                  return (
                    <article key={order.id} className="fs-history-order">
                      <div className="fs-history-head">
                        <strong>{t('Демо-заказ', 'Demo order')}</strong>
                        <span>
                          {new Intl.DateTimeFormat(ru ? 'ru-RU' : 'en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(order.date))}{' '}
                          · {count} {t('шт.', count === 1 ? 'item' : 'items')}
                        </span>
                      </div>
                      <details>
                        <summary>
                          {t('Состав заказа', 'Order contents')} <span>+</span>
                        </summary>
                        <ul>
                          {order.items.map((line, i) => (
                            <li key={`${line.id}-${i}`}>
                              <span>
                                <strong>{line.name}</strong>
                                <small>{line.brand}</small>
                              </span>
                              <span>
                                × {line.quantity}
                                {!products.some((product) => product.id === line.id) && (
                                  <small>
                                    {t(
                                      'Нет в текущем демо-каталоге',
                                      'Not in the current demo catalogue'
                                    )}
                                  </small>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {order.delivery && <p className="fs-history-note">{t('Способ получения (демо)', 'Delivery preference (demo)')}: {order.delivery === 'pickup' ? t('самовывоз', 'pickup') : t('курьер', 'courier')}</p>}
                        <button
                          type="button"
                          className="fs-secondary"
                          disabled={!eligible.length}
                          onClick={() => repeat(order)}
                        >
                          {t('ПОВТОРИТЬ ДЕМО-ЗАКАЗ', 'REPEAT DEMO ORDER')} <ArrowRight size={15} />
                        </button>
                      </details>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="fs-muted">
                {t('Здесь появятся ваши демо-заказы.', 'Your demo orders will appear here.')}
              </p>
            )}
            {orders > orderHistory.length && (
              <p className="fs-history-note">
                {t(
                  'Состав более ранних демо-заказов не сохранён.',
                  'Contents of earlier demo orders were not saved.'
                )}
              </p>
            )}
            <p className="fs-muted">
              {t('Данные хранятся только на этом устройстве.', 'Saved only on this device.')}
            </p>
          </section>
        )}
        {screen === 'checkout' && (
          <section className="fs-section fs-checkout">
            <p className="fs-eyebrow">{t('ПОСЛЕДНИЙ ШАГ / ДЕМО', 'FINAL STEP / DEMO')}</p>
            <h1>
              {t('ОФОРМЛЕНИЕ', 'CHECKOUT')}
              <br />
              {t('ЗАКАЗА.', 'DEMO.')}
            </h1>
            <p className="fs-lead">
              {t(
                'Это пример оформления: оплата не списывается. Вы можете отдельно обсудить выбор в Telegram.',
                'This is a demo: no payment is taken. You can also discuss your selection in Telegram.'
              )}
            </p>
            <form
              className="fs-checkout-form"
              onSubmit={submitDemoOrder}
              noValidate
              autoComplete="off"
            >
              <h2>{t('ВАША ПОДБОРКА', 'YOUR SELECTION')}</h2>
              <p className="fs-checkout-note">
                {t('Это демонстрация: контактные данные не нужны и заказ не отправляется.', 'This is a demo: no contact details are needed and no order is sent.')}
              </p>
              <fieldset className="fs-delivery">
                <legend>{t('СПОСОБ ПОЛУЧЕНИЯ · ДЕМО', 'DELIVERY PREFERENCE · DEMO')}</legend>
                <label>
                  <input
                    type="radio"
                    name="furniture-delivery"
                    value="pickup"
                    checked={delivery === 'pickup'}
                    onChange={() => setDelivery('pickup')}
                  />
                  <span>{t('Самовывоз', 'Pickup')}</span>
                </label>
                <label>
                  <input
                    type="radio"
                    name="furniture-delivery"
                    value="courier"
                    checked={delivery === 'courier'}
                    onChange={() => setDelivery('courier')}
                  />
                  <span>{t('Курьер', 'Courier')}</span>
                </label>
              </fieldset>
              <div className="fs-order-list">
                {cartProducts.map(({ line, product }) => (
                  <div key={product.id}>
                    <span>
                      {product.name} × {line.quantity}
                    </span>
                    {product.priceLabel && <strong>{product.priceLabel}</strong>}
                  </div>
                ))}
              </div>
              {cartProducts.length > 0 && (
                <>
                  <a
                    className="fs-chat-link"
                    href={managerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('ОБСУДИТЬ В TELEGRAM', 'DISCUSS IN TELEGRAM')} <ArrowRight size={16} />
                  </a>
                  <p className="fs-chat-note">
                    {t(
                      'Telegram откроется с перечнем товаров. Сообщение отправляется только вами.',
                      'Telegram opens with the item list. Only you can send the message.'
                    )}
                  </p>
                </>
              )}
              <button type="submit" className="fs-primary" disabled={!cartProducts.length}>
                {t('ЗАВЕРШИТЬ ДЕМО-ЗАКАЗ', 'COMPLETE DEMO ORDER')} <ArrowRight size={16} />
              </button>
            </form>
          </section>
        )}
        {screen === 'success' && (
          <section className="fs-section fs-success">
            <Check size={28} />
            <p className="fs-eyebrow">{t('ГОТОВО / ДЕМО', 'DONE / DEMO')}</p>
            <h1>
              {t('ДЕМО-ЗАКАЗ', 'DEMO ORDER')}
              <br />
              {t('ОФОРМЛЕН.', 'COMPLETE.')}
            </h1>
            <p className="fs-lead">
              {t(
                'Это пример: данные не отправлены, оплата не списана.',
                'This is a demo: no data was sent and no payment was taken.'
              )}
            </p>
            {completedDelivery && (
              <p className="fs-lead">
                {t('Выбранный способ получения (демо)', 'Selected delivery preference (demo)')}:{' '}
                {completedDelivery === 'pickup' ? t('самовывоз', 'pickup') : t('курьер', 'courier')}
                .
              </p>
            )}
            <button type="button" className="fs-primary" onClick={() => openCatalog()}>
              {t('ПРОДОЛЖИТЬ ВЫБОР', 'CONTINUE EXPLORING')} <ArrowRight size={16} />
            </button>
          </section>
        )}
      </main>
      {createPortal(
        <div className="fs-portal">
          <nav className="fs-nav" hidden={screen==='product'||screen==='checkout'||screen==='planner'} aria-label={t('Навигация магазина', 'Store navigation')}>
            <button
              type="button"
              className={`fs-nav-button ${active === 'home' && !sheet ? 'is-active' : ''}`}
              onClick={() => go('home')}
              aria-label={t('Главная', 'Home')}
              aria-current={active === 'home' && !sheet ? 'page' : undefined}
            >
              <Home size={19} />
              <span>{t('Главная', 'Home')}</span>
            </button>
            <button
              type="button"
              className={`fs-nav-button ${active === 'catalog' && !sheet ? 'is-active' : ''}`}
              onClick={() => openCatalog()}
              aria-label={t('Каталог', 'Catalogue')}
              aria-current={active === 'catalog' && !sheet ? 'page' : undefined}
            >
              <LayoutGrid size={19} />
              <span>{t('Каталог', 'Catalogue')}</span>
            </button>
            <button
              type="button"
              className={`fs-nav-button ${sheet === 'cart' ? 'is-active' : ''}`}
              onClick={() => transition({ sheet: 'cart' }, true)}
              aria-label={`${t('Корзина, товаров', 'Bag, items')}: ${count}`}
            >
              <span className="fs-nav-bag">
                <ShoppingBag size={19} />
                {count > 0 && <i>{count}</i>}
              </span>
              <span>{t('Корзина', 'Bag')}</span>
            </button>
            <button
              type="button"
              className={`fs-nav-button ${active === 'account' && !sheet ? 'is-active' : ''}`}
              onClick={() => go('account')}
              aria-label={t('Профиль', 'Profile')}
              aria-current={active === 'account' && !sheet ? 'page' : undefined}
            >
              <UserRound size={19} />
              <span>{t('Профиль', 'Profile')}</span>
            </button>
            <DemoHomeButton onReturn={onClose} />
          </nav>
          {zoomed && selected && !viewing3D && selected.images[photo] && (
            <div className="fs-zoom-overlay">
              <section
                className="fs-zoom-dialog"
                role="dialog"
                aria-modal="true"
                aria-label={t('Увеличенная фотография товара', 'Enlarged product photo')}
              >
                <div className="fs-zoom-header">
                  <strong>{selected.name}</strong>
                  <button
                    ref={zoomClose}
                    type="button"
                    className="fs-icon"
                    onClick={() => history.back(()=>setZoomed(false))}
                    aria-label={t('Закрыть увеличение', 'Close enlarged photo')}
                  >
                    <X size={21} />
                  </button>
                </div>
                <FurniturePhotoSurface
                  src={selected.images[photo]}
                  alt={`${selected.name} · ${studioAngleLabel(photo, ru)}`}
                  ru={ru}
                  onPrevious={() => setPhoto(current => Math.max(0, current - 1))}
                  onNext={() => setPhoto(current => Math.min(selected.images.length - 1, current + 1))}
                />
                <p className="fs-zoom-hint">{t('Листайте одним пальцем · увеличивайте двумя', 'Swipe to browse · pinch to zoom')}</p>
                <div className="fs-zoom-actions">
                  <button
                    type="button"
                    disabled={photo <= 0}
                    onClick={() => setPhoto((current) => Math.max(0, current - 1))}
                    aria-label={t('Предыдущая фотография', 'Previous photo')}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <span aria-live="polite">
                    {photo + 1} / {selected.images.length}
                  </span>
                  <button
                    type="button"
                    disabled={photo >= selected.images.length - 1}
                    onClick={() =>
                      setPhoto((current) => Math.min(selected.images.length - 1, current + 1))
                    }
                    aria-label={t('Следующая фотография', 'Next photo')}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </section>
            </div>
          )}
          {sheet && (
            <div className="fs-overlay" onClick={closeSheet}>
              <section
                className="fs-sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="fs-sheet-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="fs-sheet-handle">
                  <span />
                </div>
                <div className="fs-sheet-header">
                  <h2 id="fs-sheet-title">{t('КОРЗИНА', 'BAG')}</h2>
                  <button
                    type="button"
                    className="fs-icon"
                    onClick={closeSheet}
                    aria-label={t('Закрыть', 'Close')}
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="fs-sheet-body">
                  {storageError && <div className="fs-storage-warning" role="alert">
                    <span>{t('Не удалось сохранить подборку. После закрытия она может пропасть.', 'Your selection could not be saved and may be lost when you close the app.')}</span>
                    <button type="button" onClick={() => setStorageRetry(value => value + 1)}>{t('Повторить', 'Retry')}</button>
                  </div>}
                  {cartProducts.length ? (
                    <>
                      <p className="fs-muted">
                        {t('Товаров', 'Items')}: {count}
                      </p>
                      {notice && (
                        <p className="fs-cart-notice" role="status">
                          {notice}
                        </p>
                      )}
                      {cartProducts.map(({ line, product }) => (
                        <article className="fs-cart-item" key={product.id}>
                          <button
                            type="button"
                            className="fs-cart-image"
                            onClick={() => openProduct(product)}
                            aria-label={`${t('Открыть', 'Open')} ${product.name}`}
                          >
                            <ProductImage product={product} />
                          </button>
                          <div className="fs-cart-info">
                            <strong>{product.name}</strong>
                            <span>{product.brand}</span>
                            {product.priceLabel && <b>{product.priceLabel}</b>}
                            <div className="fs-qty">
                              <button
                                type="button"
                                onClick={() => quantity(product.id, -1)}
                                aria-label={`${t('Уменьшить количество', 'Decrease quantity')}: ${product.name}`}
                              >
                                <Minus size={14} />
                              </button>
                              <span>{line.quantity}</span>
                              <button
                                type="button"
                                onClick={() => quantity(product.id, 1)}
                                disabled={line.quantity >= 10}
                                aria-label={`${t('Увеличить количество', 'Increase quantity')}: ${product.name}`}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="fs-icon"
                            onClick={() =>
                              setCart((current) => current.filter((item) => item.id !== product.id))
                            }
                            aria-label={`${t('Удалить', 'Remove')}: ${product.name}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </article>
                      ))}
                    </>
                  ) : (
                    <div className="fs-empty">
                      <ShoppingBag size={27} />
                      <h3>{t('ПОКА ПУСТО', 'YOUR BAG IS EMPTY')}</h3>
                      <p>
                        {t(
                          'Выберите модели из коллекции — они появятся здесь.',
                          'Choose pieces from the collection and they will appear here.'
                        )}
                      </p>
                      <button type="button" className="fs-secondary" onClick={() => openCatalog()}>
                        {t('Перейти в каталог', 'Explore catalogue')}
                      </button>
                    </div>
                  )}
                </div>
                {cartProducts.length > 0 && (
                  <div className="fs-sheet-footer">
                    <button
                      type="button"
                      className="fs-primary"
                      onClick={() => {
                        checkoutOrigin.current = screen;
                        go('checkout');
                      }}
                    >
                      {t('ОФОРМИТЬ ДЕМО-ЗАКАЗ', 'DEMO CHECKOUT')} <ArrowRight size={16} />
                    </button>
                    <p className="fs-demo-note">
                      {t(
                        'Без реальной оплаты и отправки данных.',
                        'No payment or data submission.'
                      )}
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>,
        document.body
      )}
      <span className="fs-sr" role="status" aria-live="polite">
        {notice}
      </span>
    </div>
  );
}
