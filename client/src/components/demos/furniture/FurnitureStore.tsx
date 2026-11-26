import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
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
import FurniturePhotoSurface from './FurniturePhotoSurface';
import { useFurnitureHistory } from './useFurnitureHistory';
import './FurnitureStore.css';

type Screen = 'home' | 'catalog' | 'product' | 'planner' | 'compare' | 'account' | 'checkout' | 'success';
type Sheet = 'cart' | null;
type SortOrder = 'featured' | 'name';
type MaterialFilter = 'all' | 'polyester' | 'oak';
type CartLine = { id: string; quantity: number };
type OrderLine = CartLine & { name: string; brand: string };
type DemoOrder = { id: string; date: string; items: OrderLine[]; delivery?: 'pickup' | 'courier' };
type Snapshot = {
  screen: Screen;
  previous: Screen;
  sheet: Sheet;
  selectedId: string;
  category: string;
  query: string;
  sort: SortOrder;
  maxWidth: string;
  material: MaterialFilter;
  photo: number;
  viewing3D: boolean;
};
type StoreProps = {
  onClose: () => void;
  /** Populate only with real, sourced products and supplied photographs. */
  products?: readonly FurnitureProduct[];
  /** Optional real 3D viewer, mounted only when the visitor chooses it. */
  render3D?: (product: FurnitureProduct, onClose: () => void, onPlaceInRoom?: () => void) => ReactNode;
  /** Optional spatial planner, mounted on its own screen with a history-aware close action. */
  renderPlanner?: (product: FurnitureProduct, onClose: () => void) => ReactNode;
};

const storageKey = 'web4tg-furniture-store-v1';
const englishCategory: Record<string, string> = {
  Диваны: 'Sofas',
  Кресла: 'Armchairs',
  Столы: 'Tables',
};
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
}: {
  product: FurnitureProduct;
  className?: string;
}) {
  const { language } = useLanguage();
  const t = (r: string, e: string) => (language === 'ru' ? r : e);
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => setImageIndex(0), [product.id]);
  return product.images[imageIndex] ? (
    <img
      className={className}
      src={product.images[imageIndex]}
      alt={product.name}
      loading="lazy"
      decoding="async"
      onError={() => setImageIndex((index) => index + 1)}
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
  compared = false,
  compareFull = false,
  onCompare,
}: {
  product: FurnitureProduct;
  favorite: boolean;
  onOpen: () => void;
  onFavorite: () => void;
  compared?: boolean;
  compareFull?: boolean;
  onCompare?: () => void;
}) {
  const { language } = useLanguage();
  const t = (r: string, e: string) => (language === 'ru' ? r : e);
  return (
    <article className="fs-card">
      <div className="fs-card-image">
        <button
          type="button"
          className="fs-card-open"
          onClick={onOpen}
          aria-label={`${t('Открыть', 'Open')} ${product.name}`}
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
          {product.name}
        </button>
        <span>{product.brand} · {language === 'ru' ? product.category : englishCategory[product.category] || product.category}</span>
        {product.dimensionsM && <span>{product.dimensionsM.map(value => Math.round(value * 100)).join(' × ')} {language === 'ru' ? 'см' : 'cm'}</span>}
        {product.priceLabel && <strong>{product.priceLabel}</strong>}
        {onCompare && <button
          type="button"
          className="fs-card-compare"
          onClick={onCompare}
          aria-pressed={compared}
          aria-label={`${compared ? t('Убрать из сравнения', 'Remove from comparison') : t('Добавить в сравнение', 'Add to comparison')}: ${product.name}, ${language === 'ru' ? product.category : englishCategory[product.category] || product.category}`}
          disabled={compareFull && !compared}
        >{compared ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}{compared ? t('В сравнении', 'Comparing') : t('Сравнить', 'Compare')}</button>}
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
  const [initial] = useState(() => savedState(products));
  const [favorites, setFavorites] = useState(initial.favorites);
  const [cart, setCart] = useState(initial.cart);
  const [orders, setOrders] = useState(initial.orders);
  const [orderHistory, setOrderHistory] = useState(initial.orderHistory);
  const [recent, setRecent] = useState(initial.recent);
  const [comparison, setComparison] = useState(initial.comparison);
  const [screen, setScreen] = useState<Screen>('home');
  const [previous, setPrevious] = useState<Screen>('home');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [selectedId, setSelectedId] = useState('');
  const [category, setCategory] = useState('Все');
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
    const normalize = (value: string) => value.toLocaleLowerCase().replace(/[×х]/g, 'x').replace(/(\d)\s*x\s*(?=\d)/g, '$1x').replace(/\s+/g, ' ').trim();
    const needle = normalize(query);
    const matches = products.filter((product) => {
      if (category !== 'Все' && product.category !== category) return false;
      const widthLimit = Number(maxWidth);
      if (maxWidth && Number.isFinite(widthLimit) && widthLimit > 0 && (!product.dimensionsM || product.dimensionsM[0] * 100 > widthLimit)) return false;
      const mainMaterial = product.details?.find(detail => ['Обивка', 'Материал', 'Материалы'].includes(detail.label.ru));
      const materialText = normalize(`${mainMaterial?.value.ru || ''} ${mainMaterial?.value.en || ''}`);
      if (material === 'polyester' && !/полиэстер|polyester/.test(materialText)) return false;
      if (material === 'oak' && !/дуб|oak/.test(materialText)) return false;
      const terms = [product.name, product.brand, product.category, englishCategory[product.category] || '',
        product.description?.ru || '', product.description?.en || '',
        ...(product.facts || []).flatMap(fact => [fact.label, fact.value]),
        ...(product.details || []).flatMap(detail => [detail.label.ru, detail.label.en, detail.value.ru, detail.value.en]),
        ...(product.dimensionsM ? [product.dimensionsM.map(value => Math.round(value * 100)).join(' x ')] : [])];
      return normalize(terms.join(' ')).includes(needle);
    });
    if (sort === 'name') {
      const collator = new Intl.Collator(language === 'ru' ? 'ru' : 'en', { sensitivity: 'base' });
      matches.sort(
        (a, b) => collator.compare(a.name, b.name) || collator.compare(a.brand, b.brand)
      );
    }
    return matches;
  }, [products, category, query, sort, language, maxWidth, material]);
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
    query,
    sort,
    maxWidth,
    material,
    photo,
    viewing3D,
  });
  const restore = (next: Snapshot) => {
    setScreen(next.screen);
    setPrevious(next.previous);
    setSheet(next.sheet);
    setSelectedId(next.selectedId);
    setCategory(next.category);
    setQuery(next.query);
    setSort(next.sort ?? 'featured');
    setMaxWidth(next.maxWidth ?? '');
    setMaterial(next.material ?? 'all');
    setPhoto(next.photo);
    setViewing3D(next.viewing3D);
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
    query,
    sort,
    maxWidth,
    material,
    photo,
    viewing3D,
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
    const old = nodes.map((node) => node.hasAttribute('inert'));
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    nodes.forEach((node) => node.setAttribute('inert', ''));
    const frame = requestAnimationFrame(() => zoomClose.current?.focus({ preventScroll: true }));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setZoomed(false);
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
      nodes.forEach((node, i) => {
        if (!old[i]) node.removeAttribute('inert');
      });
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
          `${Math.max(180, Math.ceil(root.getBoundingClientRect().bottom - nav.getBoundingClientRect().top + 24))}px`
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
    const old = nodes.map((node) => node.hasAttribute('inert'));
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    nodes.forEach((node) => node.setAttribute('inert', ''));
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
      nodes.forEach((node, i) => {
        if (!old[i]) node.removeAttribute('inert');
      });
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
    if (patch.viewing3D !== undefined) setViewing3D(patch.viewing3D);
    if (!preserveScroll) scrollToTop();
  }
  const go = (next: Screen) => transition({ screen: next, sheet: null, viewing3D: false });
  const openCatalog = (next = 'Все') =>
    transition({ screen: 'catalog', sheet: null, category: next, query: '', maxWidth: '', material: 'all', viewing3D: false });
  const openComparison = () => transition({ screen: 'compare', previous: screen, sheet: null, viewing3D: false });
  const openProduct = (product: FurnitureProduct) =>
    transition({
      screen: 'product',
      previous: screen === 'product' ? previous : screen,
      sheet: null,
      selectedId: product.id,
      photo: 0,
      viewing3D: false,
    });
  const openPlanner = (product: FurnitureProduct) => {
    plannerOrigin.current = screen;
    transition({ screen: 'planner', sheet: null, selectedId: product.id, viewing3D: false });
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
  const add = (product: FurnitureProduct) => {
    const atLimit = (cart.find((line) => line.id === product.id)?.quantity || 0) >= 10;
    setCart((current) =>
      current.some((line) => line.id === product.id)
        ? current.map((line) =>
            line.id === product.id ? { ...line, quantity: Math.min(10, line.quantity + 1) } : line
          )
        : [...current, { id: product.id, quantity: 1 }]
    );
    setNotice(atLimit ? t('В демо-корзине максимум 10 штук одной модели.', 'The demo bag is limited to 10 pieces per model.') : t('Добавлено в демо-корзину.', 'Added to your demo bag.'));
    transition({ sheet: 'cart' }, true);
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
            plannerAvailable={!!renderPlanner}
            onOpenProduct={openProduct}
            onOpenPlanner={openPlanner}
            onOpenCatalog={openCatalog}
            renderCard={(product) => (
              <ProductCard
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
              <p className="fs-eyebrow">{t('КОЛЛЕКЦИЯ / МЕБЕЛЬ', 'COLLECTION / FURNITURE')}</p>
              <h1>{t('Коллекция.', 'The collection.')}</h1>
              <p>{t('Мебель для вашего пространства.', 'Furniture for your space.')}</p>
            </div>
            <div className="fs-comparison-entry">
              <button type="button" className="fs-open-comparison" onClick={openComparison}>{t('Сравнение', 'Compare')} <span>{comparison.length} / 3</span><ArrowRight size={16} aria-hidden="true" /></button>
              <p>{t('Выберите до трёх моделей', 'Choose up to three pieces')}</p>
            </div>
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
            <details className="fs-filters">
              <summary>{t('Фильтры', 'Filters')}{(maxWidth || material !== 'all') && <span aria-label={t('Фильтры включены', 'Filters active')}>●</span>}</summary>
              <div className="fs-filter-fields">
                <label htmlFor="fs-width">{t('Ширина до, см', 'Maximum width, cm')}</label>
                <input id="fs-width" type="number" inputMode="numeric" min="1" max="1000" value={maxWidth} onChange={event => setMaxWidth(event.target.value)} placeholder={t('Например, 200', 'For example, 200')} aria-invalid={!!maxWidth && Number(maxWidth) <= 0} />
                {maxWidth && Number(maxWidth) <= 0 && <span className="fs-filter-error">{t('Укажите ширину больше нуля.', 'Enter a width greater than zero.')}</span>}
                <label htmlFor="fs-material">{t('Основной материал', 'Main material')}</label>
                <select id="fs-material" value={material} onChange={event => setMaterial(event.target.value as MaterialFilter)}>
                  <option value="all">{t('Любой', 'Any')}</option>
                  <option value="polyester">{t('Полиэстер', 'Polyester')}</option>
                  <option value="oak">{t('Дуб', 'Oak')}</option>
                </select>
                {(maxWidth || material !== 'all') && <button type="button" onClick={() => { setMaxWidth(''); setMaterial('all'); }}>{t('Сбросить фильтры', 'Clear filters')}</button>}
              </div>
            </details>
            <div className="fs-catalog-tools">
              <p className="fs-result" aria-live="polite" aria-atomic="true">
                {modelCount(filtered.length, ru)}
              </p>
              <label className="fs-sort">
                <span className="fs-sr">{t('Сортировка', 'Sort by')}</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
                  <option value="featured">{t('По подборке', 'Featured')}</option>
                  <option value="name">{t('По названию', 'Name')}</option>
                </select>
              </label>
            </div>
            {filtered.length ? (
              <div className="fs-grid">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorite={favorites.includes(product.id)}
                    onFavorite={() => toggleFavorite(product.id)}
                    onOpen={() => openProduct(product)}
                    compared={comparison.includes(product.id)}
                    compareFull={comparison.length >= 3}
                    onCompare={() => toggleComparison(product.id)}
                  />
                ))}
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
                      {[
                        { label: t('Тип', 'Type'), value: (product: FurnitureProduct) => ru ? product.category : englishCategory[product.category] || product.category },
                        { label: t('Бренд', 'Brand'), value: (product: FurnitureProduct) => product.brand },
                        { label: t('Размеры, Ш × Г × В', 'Size, W × D × H'), value: (product: FurnitureProduct) => { const fact = product.facts?.find(item => item.label === 'Размер')?.value; return fact ? (ru ? fact : fact.replace('см', 'cm')) : product.dimensionsM ? `≈ ${product.dimensionsM.map(value => Math.round(value * 100)).join(' × ')} ${ru ? 'см' : 'cm'}` : '—'; } },
                        { label: t('Материал', 'Material'), value: (product: FurnitureProduct) => product.details?.find(detail => ['Обивка', 'Материал', 'Материалы'].includes(detail.label.ru))?.value[ru ? 'ru' : 'en'] || '—' },
                      ].map(row => <tr key={row.label}><th scope="row">{row.label}</th>{comparedProducts.map(product => <td key={product.id}>{row.value(product)}</td>)}</tr>)}
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
                    alt={`${selected.name}, ${t('фотография', 'photo')} ${photo + 1} / ${selected.images.length}`}
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
                  onClick={() => setZoomed(true)}
                  aria-label={t('Увеличить фотографию', 'Enlarge photo')}
                >
                  <ZoomIn size={19} />
                </button>
              )}
              {selected.images.length > 1 && (
                <>
                  <div className="fs-gallery-thumbs">
                    {selected.images.map((src, i) => (
                      <button
                        type="button"
                        key={`${src}-${i}`}
                        aria-label={`${t('Фотография', 'Photo')} ${i + 1}`}
                        aria-pressed={photo === i}
                        onClick={() => setPhoto(i)}
                      >
                        <img src={src} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                  <span className="fs-gallery-count">
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
                  {t('3D-обзор', '3D view')}
                </button>
              )}
            </div>
            {viewing3D && render3D && render3D(selected, () => history.back(() => setViewing3D(false)), renderPlanner ? () => openPlanner(selected) : undefined)}
            <div className="fs-product-info">
              <p className="fs-eyebrow">
                {ru ? selected.category : englishCategory[selected.category] || selected.category} /{' '}
                {selected.brand}
              </p>
              <div className="fs-product-top">
                <h1>{selected.name}</h1>
                {selected.priceLabel && <strong>{selected.priceLabel}</strong>}
              </div>
              {selected.description && (
                <p className="fs-product-summary">{selected.description[ru ? 'ru' : 'en']}</p>
              )}
              {selected.facts?.map((fact) => (
                <div className="fs-product-detail" key={fact.label}>
                  <span>{ru ? fact.label : englishFact[fact.label] || fact.label}</span>
                  <strong>
                    {ru ? fact.value : englishFactValue[fact.value] || fact.value.replace(/(^|\s)см(?=\s|$)/g, '$1cm')}
                  </strong>
                </div>
              ))}
              {renderPlanner && selected.modelUrl && (
                <button
                  type="button"
                  className="fs-product-planner"
                  onClick={() => openPlanner(selected)}
                >
                  <Box size={18} aria-hidden="true" />
                  <span>
                    <strong>{t('Посмотреть в комнате', 'View in a room')}</strong>
                    <small>
                      {t('Разместите предмет в пространстве', 'Place this piece in a space')}
                    </small>
                  </span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              )}
              <div className="fs-product-comparison">
                <button type="button" aria-pressed={comparison.includes(selected.id)} disabled={comparison.length >= 3 && !comparison.includes(selected.id)} onClick={() => toggleComparison(selected.id)}>{comparison.includes(selected.id) ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{comparison.includes(selected.id) ? t('В сравнении', 'Comparing') : t('Сравнить', 'Compare')}</button>
                <button type="button" onClick={openComparison}>{t('К сравнению', 'View comparison')} · {comparison.length} / 3 <ArrowRight size={15} aria-hidden="true" /></button>
              </div>
              {comparison.length >= 3 && !comparison.includes(selected.id) && <p className="fs-compare-limit">{t('В сравнении уже три модели. Уберите одну, чтобы добавить эту.', 'Three pieces are selected. Remove one to add this piece.')}</p>}
              <button type="button" className="fs-primary" onClick={() => add(selected)}>
                <ShoppingBag size={17} /> {t('ДОБАВИТЬ В КОРЗИНУ', 'ADD TO BAG')}{' '}
                <ArrowRight size={16} />
              </button>
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
              {selected.details && (
                <section
                  className="fs-product-story"
                  aria-label={t('Описание и характеристики', 'Description and specifications')}
                >
                  <div className="fs-story-rule">
                    <span>{t('О ПРЕДМЕТЕ', 'ABOUT THE PIECE')}</span>
                    <span>{t('ДЕТАЛИ', 'DETAILS')}</span>
                  </div>
                  <h2>
                    {t('ДЕТАЛИ', 'THE DETAILS')}
                    <br />
                    {t('МОДЕЛИ.', 'OF THE PIECE.')}
                  </h2>
                  <p className="fs-story-note">
                    {t(
                      'Габариты указаны: ширина × глубина × высота.',
                      'Dimensions are shown as width × depth × height.'
                    )}
                  </p>
                  <dl className="fs-specs">
                    {selected.details.map((detail) => (
                      <div key={detail.label.en}>
                        <dt>{detail.label[ru ? 'ru' : 'en']}</dt>
                        <dd>{detail.value[ru ? 'ru' : 'en']}</dd>
                      </div>
                    ))}
                  </dl>
                  {selected.care && (
                    <div className="fs-care">
                      <strong>{t('Уход', 'Care')}</strong>
                      <p>{selected.care[ru ? 'ru' : 'en']}</p>
                    </div>
                  )}
                  <p className="fs-story-note">
                    {selected.sourceDescription?.[ru ? 'ru' : 'en'] || t(
                      'Сведения — из архивного описания Amazon Berkeley Objects. Актуальные характеристики и комплектацию уточняйте у продавца.',
                      'Details are from the archived Amazon Berkeley Objects listing. Check current specifications and contents with the seller.'
                    )}
                  </p>
                  {selected.sourceNote && (
                    <p className="fs-story-note">{selected.sourceNote[ru ? 'ru' : 'en']}</p>
                  )}
                </section>
              )}
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
              )}
            </div>
          </section>
        )}
        {screen === 'planner' && selected && renderPlanner && (
          <section className="fs-planner" aria-label={t('Планировщик комнаты', 'Room planner')}>
            {renderPlanner(selected, back)}
          </section>
        )}
        {screen === 'account' && (
          <section className="fs-section fs-account">
            <p className="fs-eyebrow">{t('ЛИЧНОЕ / ПРОФИЛЬ', 'PERSONAL / PROFILE')}</p>
            <h1>
              {t('ВАШЕ', 'YOUR')}
              <br />
              {t('ПРОСТРАНСТВО.', 'SPACE.')}
            </h1>
            <p className="fs-lead">
              {t('Избранные модели и демо-заказы.', 'Saved pieces and demo orders.')}
            </p>
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
          <nav className="fs-nav" aria-label={t('Навигация магазина', 'Store navigation')}>
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
                    onClick={() => setZoomed(false)}
                    aria-label={t('Закрыть увеличение', 'Close enlarged photo')}
                  >
                    <X size={21} />
                  </button>
                </div>
                <FurniturePhotoSurface
                  src={selected.images[photo]}
                  alt={`${selected.name}, ${t('фотография', 'photo')} ${photo + 1} / ${selected.images.length}`}
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
