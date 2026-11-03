import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Home, Menu, Minus, Package, Plus, Search, ShoppingBag, SlidersHorizontal, Star, Trash2, UserRound, X } from 'lucide-react';
import { scrollToTop } from '@/hooks/useScrollToTop';
import './MurakaFashion.css';

type Category = 'Футболки' | 'Джинсы' | 'Куртки' | 'Худи' | 'Кроссовки';
type Product = { id: string; name: string; category: Category; price: number; summary: string; description: string; material: string; sizes: string[]; color: string };
type CartItem = { id: string; size: string; quantity: number };
type Order = { id: string; total: number; date: string; quantity: number };
type Review = { id: string; productId: string; name: string; text: string; rating: number; date: string };
type Screen = 'home' | 'catalog' | 'product' | 'account' | 'checkout' | 'success';
type Sheet = 'cart' | 'menu' | 'filters' | 'size-guide' | null;

const apparelSizes = ['S', 'M', 'L', 'XL', '2XL'];
const shoeSizes = ['38', '39', '40', '41', '42', '43', '44', '45'];
const products: Product[] = [
  {id:'tee-black',name:'Футболка свободного кроя',category:'Футболки',price:5900,color:'Чёрный',summary:'Свободный силуэт на каждый день',description:'Футболка свободного кроя с мягкой линией плеч и плотным трикотажем. Легко сочетать с денимом и многослойными образами.',material:'Плотный хлопковый трикотаж',sizes:apparelSizes},
  {id:'tee-white',name:'Белая футболка Essential',category:'Футболки',price:4900,color:'Белый',summary:'Чистая база с расслабленной посадкой',description:'Лаконичная футболка из плотного трикотажа. Свободная посадка и спокойный белый оттенок делают её основой повседневного гардероба.',material:'Хлопковый трикотаж',sizes:apparelSizes},
  {id:'tee-red',name:'Футболка Varsity',category:'Футболки',price:6900,color:'Бордовый',summary:'Выразительный спортивный акцент',description:'Футболка свободного силуэта с графикой в спортивном стиле. Яркий акцент для образов с джинсами и кроссовками.',material:'Хлопковый трикотаж',sizes:apparelSizes},
  {id:'tee-graphic',name:'Футболка Graphic Studio',category:'Футболки',price:6500,color:'Серый',summary:'Графика для городского ритма',description:'Свободная футболка с графическим акцентом, мягкими рукавами и комфортной посадкой на каждый день.',material:'Хлопковый трикотаж',sizes:apparelSizes},
  {id:'jeans-blue',name:'Джинсы Wide Denim',category:'Джинсы',price:12900,color:'Голубой',summary:'Широкий силуэт в светлом дениме',description:'Широкие джинсы из светлого денима с прямой линией от бедра. Свободная посадка создаёт современный силуэт.',material:'Деним',sizes:apparelSizes},
  {id:'jeans-black',name:'Джинсы Black Loose',category:'Джинсы',price:13900,color:'Чёрный',summary:'Свободная посадка в тёмном цвете',description:'Чёрные джинсы свободного силуэта с выразительной линией штанины. Подходят для лаконичных повседневных образов.',material:'Деним',sizes:apparelSizes},
  {id:'jeans-wide',name:'Джинсы Relaxed Blue',category:'Джинсы',price:13900,color:'Голубой',summary:'Расслабленный силуэт и светлый деним',description:'Расслабленные джинсы с широкой штаниной и светло-синим оттенком. Комфортная база для многослойных сочетаний.',material:'Деним',sizes:apparelSizes},
  {id:'jeans-grey',name:'Джинсы Stone Grey',category:'Джинсы',price:12900,color:'Серый',summary:'Серый деним и прямой крой',description:'Джинсы из серого денима с мягким выцветанием и прямой формой. Универсальный вариант для города.',material:'Деним',sizes:apparelSizes},
  {id:'jacket-varsity',name:'Куртка Varsity Club',category:'Куртки',price:21900,color:'Зелёный',summary:'Спортивная классика в новом прочтении',description:'Куртка varsity с контрастными рукавами и спортивными деталями. Выразительный слой для прохладных дней.',material:'Текстиль и контрастные детали',sizes:apparelSizes},
  {id:'jacket-patchwork',name:'Куртка Patchwork Studio',category:'Куртки',price:24900,color:'Белый',summary:'Коллекционная куртка с принтом',description:'Объёмная куртка с контрастными художественными вставками и практичными карманами. Центральная вещь нового сезона.',material:'Плотный текстиль, комбинированные вставки',sizes:apparelSizes},
  {id:'jacket-bomber',name:'Бомбер City Flight',category:'Куртки',price:19900,color:'Чёрный',summary:'Городской бомбер свободной формы',description:'Бомбер с объёмной посадкой и аккуратными деталями. Лаконичная модель для многослойных образов.',material:'Текстиль',sizes:apparelSizes},
  {id:'jacket-denim',name:'Джинсовая куртка Archive',category:'Куртки',price:17900,color:'Синий',summary:'Деним в современном силуэте',description:'Свободная джинсовая куртка с классическими карманами и выразительной фактурой денима.',material:'Деним',sizes:apparelSizes},
  {id:'hoodie-grey',name:'Худи Studio Heavyweight',category:'Худи',price:10900,color:'Серый',summary:'Плотное худи с мягким объёмом',description:'Плотное худи свободного кроя с капюшоном и карманом. Мягкий объём для прохладных дней.',material:'Плотный трикотаж',sizes:apparelSizes},
  {id:'hoodie-black',name:'Худи Everyday Black',category:'Худи',price:10900,color:'Чёрный',summary:'Тёмная база с расслабленной посадкой',description:'Худи в глубоком чёрном оттенке, с комфортной свободной формой и минимальными деталями.',material:'Плотный трикотаж',sizes:apparelSizes},
  {id:'sneaker-brown',name:'Кроссовки Heritage Low',category:'Кроссовки',price:14900,color:'Коричневый / белый',summary:'Низкий силуэт с контрастными панелями',description:'Низкие кроссовки с контрастными панелями и классическим силуэтом. Легко сочетать с широким денимом.',material:'Комбинированные материалы',sizes:shoeSizes},
  {id:'sneaker-white',name:'Кроссовки Studio Low',category:'Кроссовки',price:13900,color:'Белый / серый',summary:'Чистая форма на каждый день',description:'Светлые низкие кроссовки с лаконичной формой и спокойными деталями.',material:'Комбинированные материалы',sizes:shoeSizes},
];
const categories: Category[] = ['Кроссовки', 'Футболки', 'Куртки', 'Джинсы', 'Худи'];
const reviewExamples: Record<Category, string> = {
  'Футболки':'Понравилась свободная посадка и то, как вещь сочетается с джинсами.',
  'Джинсы':'Хороший расслабленный силуэт и спокойный оттенок денима для повседневных образов.',
  'Куртки':'Интересный объём и аккуратные детали. Куртка легко становится главным акцентом образа.',
  'Худи':'Мягкий объём и свободная форма — удобный вариант для прохладных дней.',
  'Кроссовки':'Лаконичная форма и сочетание цветов хорошо смотрятся с широкими джинсами.',
};
const image = (id: string, kind: 'model' | 'product') => `/muraka-fashion/${id}-${kind}${kind === 'model' && ['sneaker-brown', 'tee-graphic'].includes(id) ? '-v2' : ''}.webp`;
const byId = (id: string) => products.find(product => product.id === id);
const formatPrice = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const storageKey = 'muraka-fashion-demo-v1';

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

function ProductCard({ product, favorite, onFavorite, onOpen }: { product: Product; favorite: boolean; onFavorite: () => void; onOpen: () => void }) {
  return <article className="mf-card" data-testid={`mf-card-${product.id}`}>
    <div className="mf-card-image"><button type="button" className="mf-card-open" onClick={onOpen} aria-label={`Открыть ${product.name}`}><img src={image(product.id, 'product')} alt={product.name} loading="lazy" decoding="async" /></button><button type="button" className="mf-card-heart mf-icon" onClick={onFavorite} aria-label={`${favorite ? 'Убрать из избранного' : 'В избранное'}: ${product.name}`} aria-pressed={favorite}><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button></div>
    <div className="mf-card-meta"><button type="button" onClick={onOpen}>{product.name}</button><span>{product.color}</span><strong>{formatPrice(product.price)}</strong></div>
  </article>;
}

export default function MurakaFashion({ onClose }: { onClose: () => void }) {
  const [saved] = useState(readSaved);
  const [cart, setCart] = useState<CartItem[]>(saved.cart);
  const [favorites, setFavorites] = useState<string[]>(saved.favorites);
  const [orders, setOrders] = useState<Order[]>(saved.orders);
  const [reviews, setReviews] = useState<Review[]>(saved.reviews);
  const [screen, setScreen] = useState<Screen>('home');
  const [previousScreen, setPreviousScreen] = useState<Screen>('home');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [selectedId, setSelectedId] = useState('jeans-blue');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'Все'>('Все');
  const [sort, setSort] = useState('featured');
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
  const searchRef = useRef<HTMLInputElement>(null);
  const touchStart = useRef<number | null>(null);
  const selected = byId(selectedId) || products[0];
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + (byId(item.id)?.price || 0) * item.quantity, 0);
  const shipping = delivery === 'courier' ? 390 : 0;
  const orderTotal = total + shipping;
  const featureProducts = [products[0], products[4], products[8], products[13]];
  const feature = featureProducts[featureIndex];

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({cart, favorites, orders, reviews})); } catch { /* The demo remains usable without local storage. */ }
  }, [cart, favorites, orders, reviews]);

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
    if (!sheet) return;
    const background = document.querySelector<HTMLElement>('[data-testid="muraka-fashion"]');
    const nav = document.querySelector<HTMLElement>('.mf-nav');
    const header = document.querySelector<HTMLElement>('.mf-header');
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    background?.setAttribute('inert', ''); nav?.setAttribute('inert', ''); header?.setAttribute('inert', '');
    const frame = requestAnimationFrame(() => document.querySelector<HTMLElement>('.mf-sheet button')?.focus({preventScroll:true}));
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setSheet(null); return; }
      if (event.key !== 'Tab') return;
      const controls = Array.from(document.querySelectorAll<HTMLElement>('.mf-sheet button:not([disabled]), .mf-sheet input, .mf-sheet select, .mf-sheet [href]'));
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls[controls.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) { event.preventDefault(); controls[0].focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { cancelAnimationFrame(frame); document.removeEventListener('keydown', keydown); background?.removeAttribute('inert'); nav?.removeAttribute('inert'); header?.removeAttribute('inert'); if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true}); };
  }, [sheet]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('ru-RU');
    const result = products.filter(product => (category === 'Все' || product.category === category) && (!term || `${product.name} ${product.category} ${product.color}`.toLocaleLowerCase('ru-RU').includes(term)));
    return [...result].sort((a, b) => sort === 'price-up' ? a.price - b.price : sort === 'price-down' ? b.price - a.price : 0);
  }, [category, query, sort]);

  function go(next: Screen) { setSheet(null); setScreen(next); setSizeError(false); scrollToTop(); }
  function showCategory(next: Category | 'Все') { setCategory(next); setQuery(''); setSort('featured'); go('catalog'); }
  function openProduct(id: string) { setPreviousScreen(screen === 'product' ? previousScreen : screen); setSelectedId(id); setPhotoIndex(0); setSelectedSize(null); setSizeError(false); setReviewOpen(false); setReviewName(''); setReviewText(''); setReviewRating(0); setReviewError(''); go('product'); }
  function favorite(id: string) { setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); }
  function setQuantity(id: string, size: string, change: number) { setCart(current => current.map(item => item.id === id && item.size === size ? {...item, quantity:Math.min(10, item.quantity + change)} : item).filter(item => item.quantity > 0)); }
  function addToCart() {
    if (!selectedSize) { setSizeError(true); return; }
    setCart(current => {
      const found = current.find(item => item.id === selected.id && item.size === selectedSize);
      return found ? current.map(item => item === found ? {...item, quantity:Math.min(10, item.quantity + 1)} : item) : [...current, {id:selected.id, size:selectedSize, quantity:1}];
    });
    setNotice(`${selected.name}, размер ${selectedSize}: добавлено в корзину`); setSheet('cart');
  }
  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reviewRating || reviewName.trim().length < 2 || reviewText.trim().length < 10) { setReviewError('Выбери оценку, укажи имя и напиши не менее 10 символов.'); return; }
    const review = {id:`${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, productId:selected.id, name:reviewName.trim().slice(0,40), text:reviewText.trim().slice(0,600), rating:reviewRating, date:new Date().toISOString()};
    setReviews(current => [review, ...current].slice(0, 100)); setReviewName(''); setReviewText(''); setReviewRating(0); setReviewError(''); setReviewOpen(false); setNotice('Спасибо! Отзыв сохранён на этом устройстве.');
  }
  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitted(true);
    if (!customer.trim() || phone.replace(/\D/g, '').length < 10 || (delivery === 'courier' && address.trim().length < 5) || !cart.length) return;
    const order = {id:`DEMO-${Date.now().toString().slice(-6)}`, total:orderTotal, quantity:count, date:new Date().toISOString()};
    setOrders(current => [order, ...current].slice(0, 10)); setLastOrder(order); setCart([]); setCustomer(''); setPhone(''); setAddress(''); setDelivery('pickup'); setSubmitted(false); go('success');
  }
  const activeTab = screen === 'product' ? (previousScreen === 'home' ? 'home' : 'catalog') : screen;
  const back = () => screen === 'product' ? go(previousScreen) : screen === 'checkout' ? (setScreen('catalog'), setSheet('cart')) : go('home');

  return <div className="mf-store" data-testid="muraka-fashion" lang="ru">
    <main className="mf-main" key={screen}>
      {screen === 'home' && <section className="mf-home">
        <div className="mf-hero"><div className="mf-hero-headline" role="heading" aria-level={1} aria-label="Новый сезон"><span>НОВЫЙ СЕЗОН</span><span aria-hidden="true">НОВЫЙ СЕЗОН</span><span aria-hidden="true">НОВЫЙ СЕЗОН</span></div><button className="mf-hero-photo" type="button" onClick={() => openProduct('jacket-patchwork')} aria-label="Открыть куртку Patchwork Studio"><img src="/muraka-fashion/hero-jacket.webp" alt="Куртка Patchwork Studio" /></button><div className="mf-hero-meta"><p>НОВАЯ КОЛЛЕКЦИЯ <strong>{formatPrice(24900)}</strong></p><button className="mf-round-link" type="button" onClick={() => openProduct('jacket-patchwork')} aria-label="Смотреть куртку"><ArrowRight size={21}/></button></div></div>
        <section className="mf-section"><div className="mf-section-head"><h2>ИССЛЕДУЙ<br/>MURAKA</h2><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>Все модели <ArrowRight size={15}/></button></div><div className="mf-categories">{categories.map(item => { const featured = item === 'Кроссовки' ? 'sneaker-brown' : item === 'Футболки' ? 'tee-red' : item === 'Куртки' ? 'jacket-varsity' : item === 'Джинсы' ? 'jeans-blue' : 'hoodie-grey'; return <button type="button" key={item} className="mf-category" onClick={() => showCategory(item)}><span><img src={image(featured, 'product')} alt="" loading="lazy"/></span><strong>{item}</strong></button>; })}</div></section>
        <section className="mf-section mf-feature-section"><div className="mf-section-head"><h2>ГОРОДСКОЙ<br/>ГАРДЕРОБ</h2><span>0{featureIndex + 1} / 04</span></div><div className="mf-feature"><div className="mf-feature-copy"><div><small>{feature.category} / 0{featureIndex + 1}</small><strong>{feature.name}</strong><span>{feature.sizes.slice(0, 3).join('  ·  ')}</span></div><b>{formatPrice(feature.price)}</b></div><button type="button" className="mf-feature-image" onClick={() => openProduct(feature.id)} aria-label={`Открыть ${feature.name}`}><img src={image(feature.id, 'model')} alt={`${feature.name} на модели`} loading="lazy"/></button><div className="mf-feature-arrows"><button className="mf-icon" type="button" aria-label="Предыдущая модель" onClick={() => setFeatureIndex((featureIndex + featureProducts.length - 1) % featureProducts.length)}><ArrowLeft size={19}/></button><button className="mf-icon" type="button" aria-label="Следующая модель" onClick={() => setFeatureIndex((featureIndex + 1) % featureProducts.length)}><ArrowRight size={19}/></button></div><button type="button" className="mf-feature-view" onClick={() => openProduct(feature.id)}>СМОТРЕТЬ МОДЕЛЬ <ArrowRight size={15}/></button></div><div className="mf-marquee" aria-hidden="true">EXPLORE / MURAKA</div></section>
        <section className="mf-section mf-collection"><div className="mf-section-head"><h2>ВЫБРАНО<br/>ДЛЯ ВАС</h2><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>В каталог <ArrowRight size={15}/></button></div><div className="mf-grid">{[products[1], products[4], products[8], products[12]].map(product => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => favorite(product.id)} onOpen={() => openProduct(product.id)}/>)}</div></section>
        <div className="mf-home-footer"><p>НОВЫЙ ВЗГЛЯД<br/>НА ПОВСЕДНЕВНОЕ.</p><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>Смотреть коллекцию <ArrowRight size={15}/></button></div><p className="mf-demo-note">Демонстрационный магазин. Изображения и цены представлены для примера.</p>
      </section>}

      {screen === 'catalog' && <section className="mf-section mf-catalog"><div className="mf-page-intro"><p className="mf-eyebrow">КОЛЛЕКЦИЯ / 2026</p><h1>НАЙДИ<br/>СВОЙ СТИЛЬ.</h1><p>Вещи для движения, города и тебя.</p></div><label className="mf-search"><Search size={19}/><span className="mf-sr">Поиск по коллекции</span><input ref={searchRef} type="search" placeholder="Найти модель" value={query} onChange={event => setQuery(event.target.value)}/>{query && <button type="button" className="mf-icon" onClick={() => setQuery('')} aria-label="Очистить поиск"><X size={18}/></button>}</label><div className="mf-chips">{(['Все',...categories] as const).map(item => <button type="button" key={item} className={`mf-chip ${category === item ? 'is-active' : ''}`} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>)}</div><div className="mf-catalog-bar"><span>{filtered.length} {filtered.length === 1 ? 'модель' : filtered.length >= 2 && filtered.length <= 4 ? 'модели' : 'моделей'}</span><label className="mf-sort">Сортировка <select aria-label="Сортировка" value={sort} onChange={event => setSort(event.target.value)}><option value="featured">По подборке</option><option value="price-up">Сначала дешевле</option><option value="price-down">Сначала дороже</option></select><ChevronDown size={14}/></label></div>{filtered.length ? <div className="mf-grid">{filtered.map(product => <ProductCard key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => favorite(product.id)} onOpen={() => openProduct(product.id)}/>)}</div> : <div className="mf-empty"><Search size={26}/><h2>Ничего не найдено</h2><p>Попробуй другой запрос или категорию.</p><button type="button" className="mf-secondary" onClick={() => {setQuery('');setCategory('Все');}}>Показать всё</button></div>}</section>}

      {screen === 'product' && <section className="mf-product"><div className="mf-gallery" onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={event => { if (touchStart.current === null) return; const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current; if (Math.abs(delta) > 50) setPhotoIndex(delta < 0 ? 1 : 0); touchStart.current = null; }}><img className="mf-gallery-main" src={image(selected.id, photoIndex === 0 ? 'model' : 'product')} alt={`${selected.name}${photoIndex === 0 ? ' на модели' : ', вид изделия'}`}/><div className="mf-gallery-thumbs">{(['model','product'] as const).map((kind, index) => <button type="button" key={kind} onClick={() => setPhotoIndex(index)} aria-label={index === 0 ? 'На модели' : 'Изделие отдельно'} aria-pressed={photoIndex === index}><img src={image(selected.id, kind)} alt=""/></button>)}</div><div className="mf-gallery-count">0{photoIndex + 1} / 02</div></div><div className="mf-product-info"><div className="mf-product-top"><div><p className="mf-eyebrow">{selected.category} / MURAKA</p><h1>{selected.name}</h1><p>{selected.summary}</p></div><strong className="mf-product-price">{formatPrice(selected.price)}</strong></div><div className="mf-size-heading"><strong>Выбери размер</strong><button type="button" className="mf-text-link" onClick={() => setSheet('size-guide')}>Таблица размеров</button></div><div className="mf-sizes" aria-label="Размер">{selected.sizes.map(size => <button type="button" key={size} className={`mf-size ${selectedSize === size ? 'is-active' : ''}`} onClick={() => {setSelectedSize(size);setSizeError(false);}} aria-pressed={selectedSize === size}>{size}</button>)}</div>{sizeError && <p className="mf-error" role="alert">Выбери размер, чтобы добавить вещь в корзину.</p>}<p className="mf-description">{selected.description}</p><div className="mf-product-detail"><span>ЦВЕТ</span><strong>{selected.color}</strong></div><div className="mf-product-detail"><span>МАТЕРИАЛ</span><strong>{selected.material}</strong></div><button type="button" className="mf-primary mf-add" onClick={addToCart}><ShoppingBag size={17}/> ДОБАВИТЬ В КОРЗИНУ <span>{formatPrice(selected.price)}</span></button><p className="mf-demo-note">Демо: изображения и цены приведены для примера.</p><section className="mf-reviews" aria-labelledby="mf-reviews-title"><div className="mf-reviews-heading"><div><p className="mf-eyebrow">ВПЕЧАТЛЕНИЯ</p><h2 id="mf-reviews-title">ОТЗЫВЫ <span>{reviews.filter(review => review.productId === selected.id).length + 1}</span></h2></div><button type="button" className="mf-text-link" onClick={() => {setReviewOpen(value => !value);setReviewError('');}}>{reviewOpen ? 'Отменить' : 'Написать отзыв'} <ArrowRight size={15}/></button></div><p className="mf-demo-note">Пример отзыва показан для демонстрации. Новые отзывы сохраняются только на этом устройстве.</p>{reviewOpen && <form className="mf-review-form" onSubmit={submitReview} noValidate><strong>Твоя оценка</strong><div className="mf-stars" role="group" aria-label="Оценка товара">{[1,2,3,4,5].map(value => <button type="button" key={value} aria-label={`Оценка ${value} из 5`} aria-pressed={reviewRating === value} onClick={() => {setReviewRating(value);setReviewError('');}}><Star size={23} fill={value <= reviewRating ? 'currentColor' : 'none'}/></button>)}</div><label className="mf-field">Имя<input value={reviewName} onChange={event => {setReviewName(event.target.value);setReviewError('');}} maxLength={40} placeholder="Как тебя зовут" /></label><label className="mf-field">Твой отзыв<textarea value={reviewText} onChange={event => {setReviewText(event.target.value);setReviewError('');}} maxLength={600} rows={4} placeholder="Поделись впечатлением о модели" /></label>{reviewError && <p className="mf-error" role="alert">{reviewError}</p>}<button type="submit" className="mf-primary">СОХРАНИТЬ ОТЗЫВ</button></form>}{reviews.filter(review => review.productId === selected.id).map(review => <article className="mf-review" key={review.id}><div><strong>{review.name}</strong><span>Твой отзыв</span></div><div className="mf-review-stars" role="img" aria-label={`Оценка ${review.rating} из 5`}>{[1,2,3,4,5].map(value => <Star key={value} size={13} fill={value <= review.rating ? 'currentColor' : 'none'}/>)}</div><p>{review.text}</p></article>)}<article className="mf-review"><div><strong>Пример отзыва</strong><span>Демонстрация</span></div><div className="mf-review-stars" role="img" aria-label="Пример оценки 5 из 5">{[1,2,3,4,5].map(value => <Star key={value} size={13} fill="currentColor"/>)}</div><p>{reviewExamples[selected.category]}</p></article></section><div className="mf-related"><div className="mf-section-head"><h2>СОЧЕТАЙ<br/>С ЭТИМ</h2><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>Все модели <ArrowRight size={15}/></button></div><div className="mf-related-row">{products.filter(product => product.id !== selected.id && product.category !== selected.category).slice(0, 4).map(product => <button type="button" key={product.id} onClick={() => openProduct(product.id)} aria-label={`Открыть ${product.name}`}><img src={image(product.id, 'product')} alt="" loading="lazy"/><span>{product.name}</span><strong>{formatPrice(product.price)}</strong></button>)}</div></div></div></section>}

      {screen === 'account' && <section className="mf-section mf-account"><p className="mf-eyebrow">ЛИЧНОЕ / MURAKA</p><h1>ТВОЁ<br/>ПРОСТРАНСТВО.</h1><p className="mf-lead">Избранные вещи и история демо-заказов.</p><div className="mf-account-title"><Heart size={19}/><h2>ИЗБРАННОЕ</h2><span>{favorites.length}</span></div>{favorites.length ? <div className="mf-grid">{products.filter(product => favorites.includes(product.id)).map(product => <ProductCard key={product.id} product={product} favorite onFavorite={() => favorite(product.id)} onOpen={() => openProduct(product.id)}/>)}</div> : <div className="mf-empty"><p>Здесь появятся вещи, которые тебе понравились.</p><button type="button" className="mf-text-link" onClick={() => showCategory('Все')}>Выбрать модель <ArrowRight size={15}/></button></div>}<div className="mf-account-title"><Package size={19}/><h2>ДЕМО-ЗАКАЗЫ</h2><span>{orders.length}</span></div>{orders.length ? <div className="mf-order-list">{orders.map(order => <div key={order.id}><div><strong>{order.id}</strong><span>{new Date(order.date).toLocaleDateString('ru-RU')} · {order.quantity} шт.</span></div><b>{formatPrice(order.total)}</b></div>)}</div> : <div className="mf-empty"><p>Твои демо-заказы появятся здесь.</p></div>}<p className="mf-demo-note">Данные хранятся только на этом устройстве и не отправляются продавцу.</p></section>}

      {screen === 'checkout' && <section className="mf-section mf-checkout"><p className="mf-eyebrow">ПОСЛЕДНИЙ ШАГ / ДЕМО</p><h1>ОФОРМЛЕНИЕ<br/>ЗАКАЗА.</h1><p className="mf-lead">Заполни данные, чтобы увидеть пример оформления.</p><div className="mf-demo-banner"><Package size={19}/><span>Это демо. Данные не отправляются, оплата не списывается.</span></div><form onSubmit={submitOrder} noValidate><h2>КОНТАКТЫ</h2><label className="mf-field">Имя<input value={customer} onChange={event => setCustomer(event.target.value)} autoComplete="name" aria-label="Имя" aria-invalid={submitted && !customer.trim()} placeholder="Как тебя зовут"/>{submitted && !customer.trim() && <span className="mf-error">Укажи имя.</span>}</label><label className="mf-field">Телефон<input type="tel" value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" aria-label="Телефон" aria-invalid={submitted && phone.replace(/\D/g, '').length < 10} placeholder="+7 999 000-00-00"/>{submitted && phone.replace(/\D/g,'').length < 10 && <span className="mf-error">Укажи номер телефона.</span>}</label><h2>СПОСОБ ПОЛУЧЕНИЯ</h2><div className="mf-delivery" role="group" aria-label="Способ получения"><button type="button" className={`mf-delivery-option ${delivery === 'pickup' ? 'is-active' : ''}`} onClick={() => setDelivery('pickup')} aria-pressed={delivery === 'pickup'}><span><strong>Самовывоз</strong><small>Бесплатно</small></span><span>0 ₽</span></button><button type="button" className={`mf-delivery-option ${delivery === 'courier' ? 'is-active' : ''}`} onClick={() => setDelivery('courier')} aria-pressed={delivery === 'courier'}><span><strong>Курьером</strong><small>Демо-доставка</small></span><span>{formatPrice(390)}</span></button></div>{delivery === 'courier' && <label className="mf-field">Адрес доставки<input value={address} onChange={event => setAddress(event.target.value)} autoComplete="street-address" aria-label="Адрес доставки" aria-invalid={submitted && address.trim().length < 5} placeholder="Город, улица, дом"/>{submitted && address.trim().length < 5 && <span className="mf-error">Укажи адрес доставки.</span>}</label>}<h2>ТВОЙ ЗАКАЗ</h2><div className="mf-order-summary">{cart.map(item => {const product=byId(item.id);return product && <div key={`${item.id}-${item.size}`}><span>{product.name} · {item.size} · {item.quantity} шт.</span><strong>{formatPrice(product.price * item.quantity)}</strong></div>;})}<div><span>Доставка</span><strong>{shipping ? formatPrice(shipping) : 'Бесплатно'}</strong></div><div><span>Итого</span><strong>{formatPrice(orderTotal)}</strong></div></div>{submitted && !cart.length && <p className="mf-error" role="alert">Корзина пуста.</p>}<button type="submit" className="mf-primary">ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ <ArrowRight size={16}/></button></form></section>}

      {screen === 'success' && <section className="mf-section mf-success"><span className="mf-success-icon"><Check size={28}/></span><p className="mf-eyebrow">ГОТОВО / ДЕМО</p><h1>ЗАКАЗ<br/>ОФОРМЛЕН.</h1><p>Это пример покупки: данные не отправлены, оплата не списана.</p>{lastOrder && <div className="mf-order-summary"><div><span>{lastOrder.id}</span><strong>{formatPrice(lastOrder.total)}</strong></div></div>}<button type="button" className="mf-primary" onClick={() => showCategory('Все')}>ПРОДОЛЖИТЬ ВЫБОР <ArrowRight size={16}/></button><button type="button" className="mf-secondary" onClick={() => go('account')}>Посмотреть историю</button></section>}
    </main>

    {createPortal(<div className="mf-portal"><header className="mf-header">{screen === 'product' || screen === 'checkout' || screen === 'success' ? <><button type="button" className="mf-icon" onClick={back} aria-label="Назад"><ArrowLeft size={21}/></button><span className="mf-header-center">MURAKA</span>{screen === 'product' ? <button type="button" className="mf-icon" onClick={() => favorite(selected.id)} aria-label={`${favorites.includes(selected.id) ? 'Убрать из избранного' : 'В избранное'}: ${selected.name}`} aria-pressed={favorites.includes(selected.id)}><Heart size={20} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'}/></button> : <span className="mf-header-spacer"/>}</> : <><button type="button" className="mf-brand" onClick={() => go('home')} aria-label="MURAKA — главная">MURAKA</button><div className="mf-header-actions"><button type="button" className="mf-icon" onClick={() => {showCategory('Все'); window.setTimeout(() => searchRef.current?.focus({preventScroll:true}), 100);}} aria-label="Поиск"><Search size={20}/></button><button type="button" className="mf-icon" onClick={() => setSheet('menu')} aria-label="Меню"><Menu size={21}/></button></div></>}</header>
      <nav className="mf-nav" aria-label="Навигация магазина"><button type="button" className={`mf-nav-button ${activeTab === 'home' && !sheet ? 'is-active' : ''}`} onClick={() => go('home')} aria-label="Главная"><Home size={19}/><span>Главная</span></button><button type="button" className={`mf-nav-button ${activeTab === 'catalog' && !sheet ? 'is-active' : ''}`} onClick={() => showCategory('Все')} aria-label="Каталог"><SlidersHorizontal size={19}/><span>Каталог</span></button><button type="button" className={`mf-nav-button ${sheet === 'cart' ? 'is-active' : ''}`} onClick={() => setSheet('cart')} aria-label={`Корзина, товаров: ${count}`}><span className="mf-nav-bag"><ShoppingBag size={19}/>{count > 0 && <i>{count}</i>}</span><span>Корзина</span></button><button type="button" className={`mf-nav-button ${activeTab === 'account' && !sheet ? 'is-active' : ''}`} onClick={() => go('account')} aria-label="Профиль"><UserRound size={19}/><span>Профиль</span></button></nav>
      {sheet && <div className="mf-overlay" onClick={() => setSheet(null)}><section className="mf-sheet" role="dialog" aria-modal="true" aria-labelledby="mf-sheet-title" onClick={event => event.stopPropagation()}><div className="mf-sheet-handle"><span/></div><div className="mf-sheet-header"><h2 id="mf-sheet-title">{sheet === 'cart' ? 'КОРЗИНА' : sheet === 'menu' ? 'МЕНЮ' : sheet === 'size-guide' ? 'РАЗМЕРЫ' : 'ФИЛЬТРЫ'}</h2><button type="button" className="mf-icon" onClick={() => setSheet(null)} aria-label="Закрыть"><X size={20}/></button></div>
        {sheet === 'cart' && <><div className="mf-sheet-body">{cart.length ? <><p className="mf-sheet-caption">{count} {count === 1 ? 'товар' : count >= 2 && count <= 4 ? 'товара' : 'товаров'}</p>{cart.map(item => {const product=byId(item.id);return product && <article className="mf-cart-item" key={`${item.id}-${item.size}`}><button type="button" className="mf-cart-image" onClick={() => openProduct(product.id)} aria-label={`Открыть ${product.name}`}><img src={image(product.id,'product')} alt=""/></button><div className="mf-cart-info"><strong>{product.name}</strong><span>Размер {item.size}</span><b>{formatPrice(product.price * item.quantity)}</b><div className="mf-qty"><button type="button" onClick={() => setQuantity(item.id,item.size,-1)} aria-label={`Уменьшить количество ${product.name}, размер ${item.size}`}><Minus size={14}/></button><span>{item.quantity}</span><button type="button" onClick={() => setQuantity(item.id,item.size,1)} aria-label={`Увеличить количество ${product.name}, размер ${item.size}`}><Plus size={14}/></button></div></div><button type="button" className="mf-icon" onClick={() => setCart(current => current.filter(entry => entry.id !== item.id || entry.size !== item.size))} aria-label={`Удалить ${product.name}, размер ${item.size}`}><Trash2 size={17}/></button></article>;})}</> : <div className="mf-empty"><ShoppingBag size={27}/><h3>ПОКА ПУСТО</h3><p>Выбери вещи из коллекции — они появятся здесь.</p><button type="button" className="mf-secondary" onClick={() => showCategory('Все')}>Перейти в каталог</button></div>}</div>{cart.length > 0 && <div className="mf-sheet-footer"><div><span>Итого</span><strong>{formatPrice(total)}</strong></div><button type="button" className="mf-primary" onClick={() => {setSubmitted(false);go('checkout');}}>ОФОРМИТЬ ДЕМО-ЗАКАЗ <ArrowRight size={16}/></button><p className="mf-demo-note">Без реальной оплаты и отправки данных.</p></div>}</>}
        {sheet === 'menu' && <div className="mf-sheet-body mf-menu"><button type="button" onClick={() => go('home')}>Главная <ArrowRight size={17}/></button><button type="button" onClick={() => showCategory('Все')}>Коллекция <ArrowRight size={17}/></button><button type="button" onClick={() => go('account')}>Избранное и заказы <ArrowRight size={17}/></button><button type="button" onClick={onClose}>Вернуться в WEB4TG <ArrowRight size={17}/></button></div>}
        {sheet === 'size-guide' && <div className="mf-sheet-body mf-size-guide"><p>Выбери размер по привычной посадке. Это демонстрационная таблица; перед покупкой ориентируйся на размерную сетку конкретного бренда.</p><div className="mf-size-guide-row"><span>Одежда</span><strong>S · M · L · XL · 2XL</strong></div><div className="mf-size-guide-row"><span>Обувь</span><strong>EU 38–45</strong></div><button type="button" className="mf-secondary" onClick={() => setSheet(null)}>Понятно</button></div>}
      </section></div>}
    </div>, document.body)}
    <span className="mf-sr" role="status" aria-live="polite">{notice}</span>
  </div>;
}
