import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Home, Menu, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, UserRound, X, ZoomIn, ZoomOut } from 'lucide-react';
import { scrollToTop } from '@/hooks/useScrollToTop';
import './AppleStore.css';
import './AppleProductRefresh.css';
import './AppleCatalogRefresh.css';
import { appleCatalog2026, type AppleCatalogItem, type AppleCategory } from './appleCatalog2026';
import { appleProductDetails2026 } from './appleProductDetails2026';
import { generatedProductPhotos } from './appleGeneratedProductImages';
import { appleImageProps, type AppleImageContext } from './appleImageDelivery';

type Category = AppleCategory;
type Item = Omit<AppleCatalogItem, 'image' | 'source' | 'availability'> & Partial<Pick<AppleCatalogItem, 'image' | 'source' | 'availability'>> & { lifestyleImage?:string };
type Screen = 'home' | 'catalog' | 'product' | 'profile' | 'checkout' | 'success';
type Sheet = 'cart' | 'filters' | 'photo' | null;
type PriceRange = 'all' | 'under50' | '50to100' | 'over100';
type CartItem = { id:string; color:string; capacity:string; quantity:number };
type DemoOrder = { id:string; total:number; items?:CartItem[] };
type Snapshot = { screen:Screen; sheet:Sheet; selectedId:string; category:Category | 'Все'; query:string; sort:string; priceRange:PriceRange; photo:number; color:string; capacity:string; previous:Screen; lastOrderId?:string|null };
const legacyList:Item[] = [
  {id:'iphone-pro-max',family:'iphone-pro',name:'iPhone Pro Max',category:'iPhone',price:149900,summary:'Большой дисплей. Выразительная камера.',colors:['Тёмный','Серебристый'],capacities:['256 ГБ','512 ГБ','1 ТБ']},
  {id:'iphone-pro',family:'iphone-pro',name:'iPhone Pro',category:'iPhone',price:129900,summary:'Мощность в каждой детали.',colors:['Тёмный','Серебристый'],capacities:['256 ГБ','512 ГБ','1 ТБ']},
  {id:'iphone',family:'iphone',name:'iPhone',category:'iPhone',price:89900,summary:'Всё, что любишь. Каждый день.',colors:['Светлый','Тёмный'],capacities:['128 ГБ','256 ГБ','512 ГБ']},
  {id:'iphone-plus',family:'iphone',name:'iPhone Plus',category:'iPhone',price:104900,summary:'Больше пространства для твоих идей.',colors:['Светлый','Тёмный'],capacities:['128 ГБ','256 ГБ','512 ГБ']},
  {id:'ipad-pro',family:'ipad',name:'iPad Pro',category:'iPad',price:119900,summary:'Творчество без границ.',colors:['Серебристый','Тёмный'],capacities:['256 ГБ','512 ГБ','1 ТБ']},
  {id:'ipad-air',family:'ipad',name:'iPad Air',category:'iPad',price:74900,summary:'Лёгкий. Яркий. Для всего.',colors:['Светлый','Тёмный'],capacities:['128 ГБ','256 ГБ','512 ГБ']},
  {id:'ipad-mini',family:'ipad',name:'iPad mini',category:'iPad',price:59900,summary:'Большие идеи в компактном формате.',colors:['Светлый','Тёмный'],capacities:['128 ГБ','256 ГБ','512 ГБ']},
  {id:'watch-ultra',family:'watch',name:'Apple Watch Ultra',category:'Watch',price:89900,summary:'Для движения и новых маршрутов.',colors:['Тёмный','Светлый'],capacities:['Один размер']},
  {id:'watch',family:'watch',name:'Apple Watch',category:'Watch',price:44900,summary:'Каждый день в своём ритме.',colors:['Тёмный','Светлый'],capacities:['Один размер']},
  {id:'watch-se',family:'watch',name:'Apple Watch SE',category:'Watch',price:29900,summary:'Всё важное на твоём запястье.',colors:['Тёмный','Светлый'],capacities:['Один размер']},
  {id:'airpods-pro',family:'airpods',name:'AirPods Pro',category:'AirPods',price:29900,summary:'Погрузись в любимый звук.',colors:['Белый'],capacities:['Один размер']},
  {id:'airpods',family:'airpods',name:'AirPods',category:'AirPods',price:19900,summary:'Музыка всегда рядом.',colors:['Белый'],capacities:['Один размер']},
  {id:'airpods-max',family:'airpods',name:'AirPods Max',category:'AirPods',price:64900,summary:'Звук, который ощущается.',colors:['Тёмный','Светлый'],capacities:['Один размер']},
  {id:'macbook-pro',family:'mac',name:'MacBook Pro',category:'Mac',price:199900,summary:'Создан для больших идей.',colors:['Тёмный','Серебристый'],capacities:['512 ГБ','1 ТБ']},
  {id:'macbook-air',family:'mac',name:'MacBook Air',category:'Mac',price:119900,summary:'Лёгкость, которая вдохновляет.',colors:['Серебристый','Тёмный'],capacities:['256 ГБ','512 ГБ']},
  {id:'imac',family:'mac',name:'iMac',category:'Mac',price:159900,summary:'Целый мир на твоём столе.',colors:['Светлый','Тёмный'],capacities:['256 ГБ','512 ГБ']},
  {id:'mac-mini',family:'mac',name:'Mac mini',category:'Mac',price:74900,summary:'Большие возможности в малой форме.',colors:['Серебристый'],capacities:['256 ГБ','512 ГБ']},
];
// Keep older saved favorites and baskets readable without presenting legacy models as current.
const creativeGallery:Record<string,string[]> = {
  'iphone-18-pro-max':['/apple-store/creative/iphone-18-pro-max-three-quarter.webp','/apple-store/creative/iphone-18-pro-max-camera-detail.webp'],
  'ipad-air-11-m4':['/apple-store/creative/ipad-air-blue-perspective.webp'],
  'airpods-pro-3':['/apple-store/creative/airpods-pro-3-floating.webp'],
  'watch-ultra-4':['/apple-store/creative/watch-ultra-4-perspective.webp'],
  'macbook-air-2026':['/apple-store/creative/macbook-air-perspective.webp'],
  'homeview':['/apple-store/creative/homeview-rose-perspective.webp'],
  'homepod-mini-2':['/apple-store/creative/homepod-mini-2-top.webp'],
  'ipad-pro-11-m5':['/apple-store/creative/ipad-pro-11-m5-rear.webp'],
  'watch-series-12':['/apple-store/creative/watch-series-12-perspective.webp'],
  'ipad-pro-13-m5':['/apple-store/creative/ipad-pro-13-m5-perspective.webp'],
  'ipad-mini-a20':['/apple-store/creative/ipad-mini-a20-rear.webp'],
  'watch-se-3':['/apple-store/creative/watch-se-3-perspective.webp'],
  'macbook-neo':['/apple-store/creative/macbook-neo-perspective.webp'],
  'macbook-pro-proled':['/apple-store/creative/macbook-pro-proled-perspective.webp'],
  'mac-studio-2026':['/apple-store/creative/mac-studio-perspective.webp'],
  'homepod':['/apple-store/creative/homepod-perspective.webp'],
  'vision-pro-m5':['/apple-store/creative/vision-pro-perspective.webp'],
  'apple-tv-4k-4':['/apple-store/creative/apple-tv-4k-perspective.webp'],
  'ipad-a16':['/apple-store/creative/ipad-a16-perspective.webp'],
  'macbook-pro-2026':['/apple-store/creative/macbook-pro-perspective.webp'],
  'imac-2026':['/apple-store/creative/imac-perspective.webp'],
  'homeview-wall':['/apple-store/creative/homeview-wall-perspective.webp'],
  'airtag-2026':['/apple-store/creative/airtag-perspective.webp'],
  'studio-display':['/apple-store/creative/studio-display-perspective.webp'],
  'studio-display-xdr':['/apple-store/creative/studio-display-xdr-perspective.webp'],
  'watch-hermes-series-12':['/apple-store/creative/watch-hermes-series-12-black-screen.webp'],
  'watch-hermes-ultra-4':['/apple-store/creative/watch-hermes-ultra-4-black-screen.webp'],
};
// Additional generated angles are shown only for the matching finish.
const creativeFinish:Record<string,string> = {
  'iphone-18-pro-max':'Чёрный', 'ipad-mini-a20':'Тёмная ночь',
  'macbook-neo':'Румянец', 'macbook-air-2026':'Небесно-голубой',
  'macbook-pro-proled':'Чёрный космос', 'homeview':'Розовый',
  'homeview-wall':'Серый космос',
};
const list:Item[] = appleCatalog2026.map(item => ({...item, ...appleProductDetails2026[item.id], image:generatedProductPhotos(item.id,item.colors[0])[0], gallery:creativeGallery[item.id] || []}));
const allList:Item[] = [...list, ...legacyList.filter(old => !list.some(item => item.id === old.id))];
const cats:Category[]=['iPhone','iPad','Watch','AirPods','Mac','Home','Vision','Аксессуары'];
const priceNames:Record<PriceRange,string>={all:'Любая цена',under50:'До 50 000 ₽','50to100':'50 000–100 000 ₽',over100:'От 100 000 ₽'};
const visual:Record<Category,string>={iPhone:'iphone-18-pro-max',iPad:'ipad-air-11-m4',Watch:'watch-ultra-4',AirPods:'airpods-pro-3',Mac:'macbook-air-2026',Home:'homepod-mini-2',Vision:'vision-pro-m5','Аксессуары':'airtag-2026'};
const byId=(id:string)=>allList.find(item=>item.id===id)||list[0];
const price=(n:number)=>`${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
const variantLabel=(item:Item, row:CartItem)=>[item.colors.length>1 || row.color!=='Стандартный' ? row.color : '', !['Один размер','Один вариант'].includes(row.capacity) ? row.capacity : ''].filter(Boolean).join(' · ');
const storageKey='web4tg-apple-demo-v1';
function Photo({item,kind,alt,className,loading='lazy',color,context='catalog',priority=false}:{item:Item;kind:'product'|'lifestyle';alt:string;className?:string;loading?:'eager'|'lazy';color?:string;context?:AppleImageContext;priority?:boolean}) {
  const [failed,setFailed]=useState<string|null>(null);
  const src=kind==='product' ? generatedProductPhotos(item.id,color || item.colors[0])[0] : undefined;
  useEffect(()=>setFailed(null),[src]);
  if (!src || failed===src) return <span className="as-image-unavailable">Иллюстрация недоступна</span>;
  return <img {...appleImageProps(src,context)} className={className} alt={alt} loading={loading} fetchPriority={priority?'high':'low'} decoding="async" onError={()=>setFailed(src)}/>;
}
function saved(){try {
  const parsed=JSON.parse(localStorage.getItem(storageKey)||'{}');
  const validItem=(row:CartItem)=>row && allList.some(item=>item.id===row.id) && typeof row.color==='string' && typeof row.capacity==='string' && Number.isInteger(row.quantity) && row.quantity>0 && row.quantity<=10;
  const orders:DemoOrder[]=Array.isArray(parsed.orders)?parsed.orders.filter((order:DemoOrder)=>order && typeof order.id==='string' && Number.isFinite(order.total) && order.total>=0).slice(0,10).map((order:DemoOrder)=>({id:order.id,total:order.total,...(Array.isArray(order.items)?{items:order.items.filter(validItem)}:{})})):[];
  return {favorites:Array.isArray(parsed.favorites)?parsed.favorites.filter((id:string)=>allList.some(item=>item.id===id)):[],cart:Array.isArray(parsed.cart)?parsed.cart.filter(validItem):[],orders};
}catch{return {favorites:[],cart:[],orders:[]};}}
function ProductCard({item,favorite,onFavorite,onOpen}:{item:Item;favorite:boolean;onFavorite:()=>void;onOpen:()=>void}){return <article className="as-card" data-testid={`as-card-${item.id}`}><div className="as-card-media">{item.availability==='preorder'?<span className="as-card-preorder">Предзаказ</span>:!item.image&&<span className="as-card-archive">Архив</span>}<button type="button" className="as-card-picture" onClick={onOpen} aria-label={`Открыть ${item.name}`}><Photo item={item} kind="product" alt={item.name}/></button><button type="button" className="as-heart as-icon" onClick={onFavorite} aria-label={`${favorite?'Убрать из избранного':'В избранное'}: ${item.name}`} aria-pressed={favorite}><Heart size={19} fill={favorite?'currentColor':'none'}/></button></div><button type="button" className="as-card-name" onClick={onOpen}>{item.name}</button><p>{item.summary}</p><strong>Демо · от {price(item.price)}</strong></article>;}


/** Store only non-sensitive view state here (never checkout contact details). */
interface AppleHistoryEntry<T> {
  version: 1;
  session: string;
  index: number;
  hash: string;
  snapshot: T;
  scrollTop: number;
}

interface AppleHistoryOptions<T extends object> {
  /** Return the currently rendered, structured-cloneable view state. */
  getSnapshot: () => T;
  /** Restore view state without creating another history entry or resetting scroll. */
  restore: (snapshot: T) => void;
  canSave?: () => boolean;
}

const key = '__web4tgAppleHistoryV1';

function stateObject(): Record<string, unknown> | null {
  const state = window.history.state;
  // Refuse to overwrite a host's non-object state.
  return state == null ? {} : typeof state === 'object' && !Array.isArray(state) ? state : null;
}

function readEntry<T>(state: Record<string, unknown> | null, hash: string): AppleHistoryEntry<T> | null {
  const value = state?.[key] as Partial<AppleHistoryEntry<T>> | undefined;
  return value?.version === 1 && value.hash === hash && typeof value.session === 'string' &&
    Number.isInteger(value.index) && (value.index as number) >= 0 && typeof value.scrollTop === 'number' &&
    Number.isFinite(value.scrollTop) && value.scrollTop >= 0 && value.snapshot != null && typeof value.snapshot === 'object'
    ? value as AppleHistoryEntry<T> : null;
}

function freshSession() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Internal store history uses the existing hash, leaving WEB4TG's hash router in
 * charge of navigation outside the demo. A snapshot should contain screen,
 * product, filters and sheet state, but not private form contents.
 *
 * Call push(next) immediately BEFORE changing React state. For a sheet on the
 * same screen pass preserveScroll:true. Use back(fallback) for the visible back
 * control; fallback should perform the old local back behaviour when the hook
 * cannot safely own the current browser entry. Call replaceCurrent() after
 * filter changes that should survive forward navigation without a new entry.
 */
function useAppleHistory<T extends object>({ getSnapshot, restore, canSave }: AppleHistoryOptions<T>) {
  const canSaveRef = useRef(canSave);
  canSaveRef.current = canSave;
  const getSnapshotRef = useRef(getSnapshot);
  const restoreRef = useRef(restore);
  getSnapshotRef.current = getSnapshot;
  restoreRef.current = restore;
  const hashRef = useRef('');
  const sessionRef = useRef('');
  const enabledRef = useRef(false);
  const restoringRef = useRef(false);
  const pendingBackRef = useRef(false);
  const restoreFramesRef = useRef<number[]>([]);

  const replaceCurrent = useCallback(() => {
    if (!enabledRef.current || restoringRef.current || window.location.hash !== hashRef.current || (canSaveRef.current && !canSaveRef.current())) return false;
    const state = stateObject();
    const entry = readEntry<T>(state, hashRef.current);
    if (!state || !entry || entry.session !== sessionRef.current) return false;
    const root = document.getElementById('root');
    try {
      window.history.replaceState({ ...state, [key]: { ...entry, snapshot: getSnapshotRef.current(), scrollTop: root?.scrollTop ?? 0 } }, '', window.location.href);
      return true;
    } catch { return false; }
  }, []);

  const push = useCallback((next: T, options?: { preserveScroll?: boolean }) => {
    if (!enabledRef.current || window.location.hash !== hashRef.current) return false;
    // A user can navigate again while the two-frame scroll restoration is pending.
    // Finish that restoration before saving the current entry and pushing the next one.
    if (restoringRef.current) {
      restoreFramesRef.current.forEach(cancelAnimationFrame);
      restoreFramesRef.current = [];
      const current = readEntry<T>(stateObject(), hashRef.current);
      const root = document.getElementById('root');
      if (root && current?.session === sessionRef.current) root.scrollTop = current.scrollTop;
      restoringRef.current = false;
    }
    if (!replaceCurrent()) return false;
    const state = stateObject();
    const entry = readEntry<T>(state, hashRef.current);
    if (!state || !entry || entry.session !== sessionRef.current) return false;
    const scrollTop = options?.preserveScroll ? (document.getElementById('root')?.scrollTop ?? 0) : 0;
    try {
      window.history.pushState({ ...state, [key]: { ...entry, index: entry.index + 1, snapshot: next, scrollTop } }, '', window.location.href);
      return true;
    } catch { return false; }
  }, [replaceCurrent]);

  const back = useCallback((fallback: () => void) => {
    if (pendingBackRef.current) return;
    const entry = enabledRef.current && window.location.hash === hashRef.current
      ? readEntry<T>(stateObject(), hashRef.current) : null;
    if (!entry || entry.session !== sessionRef.current || entry.index === 0) { fallback(); return; }
    replaceCurrent();
    pendingBackRef.current = true;
    window.history.back();
  }, [replaceCurrent]);

  useEffect(() => {
    const hash = window.location.hash;
    if (!/^#\/demos\/apple-store\/app(?:\?.*)?$/.test(hash)) return;
    hashRef.current = hash;
    const state = stateObject();
    if (!state) return;
    const existing = readEntry<T>(state, hash);
    const session = existing?.session ?? freshSession();
    sessionRef.current = session;
    try {
      if (!existing) window.history.replaceState({ ...state, [key]: { version:1, session, index:0, hash, snapshot:getSnapshotRef.current(), scrollTop:document.getElementById('root')?.scrollTop ?? 0 } }, '', window.location.href);
      enabledRef.current = true;
    } catch { return; }

    const cancelRestore = () => { restoreFramesRef.current.forEach(cancelAnimationFrame); restoreFramesRef.current = []; };
    const applyEntry = (entry: AppleHistoryEntry<T>) => {
      cancelRestore();
      restoringRef.current = true;
      restoreRef.current(entry.snapshot);
      const first = requestAnimationFrame(() => {
        const second = requestAnimationFrame(() => {
          // A fast subsequent transition must not restore scroll into another route/entry.
          const current = readEntry<T>(stateObject(), hashRef.current);
          if (window.location.hash === hashRef.current && current?.session === entry.session && current.index === entry.index) {
            const root = document.getElementById('root');
            if (root) root.scrollTop = entry.scrollTop;
          }
          restoringRef.current = false;
          restoreFramesRef.current = [];
          replaceCurrent();
        });
        restoreFramesRef.current.push(second);
      });
      restoreFramesRef.current = [first];
    };
    if (existing) applyEntry(existing);

    const onPop = () => {
      pendingBackRef.current = false;
      if (window.location.hash !== hashRef.current) return;
      const entry = readEntry<T>(stateObject(), hashRef.current);
      if (entry && entry.session === sessionRef.current) applyEntry(entry);
    };
    let scrollTimer = 0;
    const root = document.getElementById('root');
    const onScroll = () => {
      if (restoringRef.current || scrollTimer) return;
      scrollTimer = window.setTimeout(() => { scrollTimer = 0; replaceCurrent(); }, 250);
    };
    root?.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('popstate', onPop);
    return () => {
      enabledRef.current = false;
      pendingBackRef.current = false;
      restoringRef.current = false;
      cancelRestore();
      clearTimeout(scrollTimer);
      root?.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onPop);
    };
  }, [replaceCurrent]);

  return { push, back, replaceCurrent };
}

export default function AppleStore({onClose}:{onClose:()=>void}) {
  const [initial]=useState(saved); const [favorites,setFavorites]=useState<string[]>(initial.favorites); const [cart,setCart]=useState<CartItem[]>(initial.cart); const [orders,setOrders]=useState<DemoOrder[]>(initial.orders);
  const [screen,setScreen]=useState<Screen>('home'); const [sheet,setSheet]=useState<Sheet>(null); const [selectedId,setSelectedId]=useState(list[0].id); const [previous,setPrevious]=useState<Screen>('home'); const [category,setCategory]=useState<Category|'Все'>('Все'); const [query,setQuery]=useState(''); const [sort,setSort]=useState('featured'); const [priceRange,setPriceRange]=useState<PriceRange>('all'); const [photo,setPhoto]=useState(0); const [photoZoom,setPhotoZoom]=useState(false); const [color,setColor]=useState(list[0].colors[0]); const [capacity,setCapacity]=useState(list[0].capacities[0]);
  const [name,setName]=useState(''); const [phone,setPhone]=useState(''); const [submitted,setSubmitted]=useState(false); const [filterDraft,setFilterDraft]=useState<Category|'Все'>('Все'); const [priceDraft,setPriceDraft]=useState<PriceRange>('all');
  const catalogScroll=useRef(0); const checkoutOrigin=useRef<Screen>('catalog'); const touchStart=useRef<{x:number;y:number}|null>(null); const nameRef=useRef<HTMLInputElement>(null); const phoneRef=useRef<HTMLInputElement>(null); const focusBefore=useRef<HTMLElement|null>(null); const [lastOrderId,setLastOrderId]=useState<string|null>(null);
  const keyboardNavigation=useRef(false); const focusNextScreen=useRef(false);
  const lastOrder=orders.find(order=>order.id===lastOrderId) ?? (!lastOrderId && screen==='success' ? orders[0] : undefined);
  const activeScreen=screen==='product'?previous:screen;
  const current=byId(selectedId);
  const details=current as Item & { gallery?:string[]; features?:string[]; specs?:{label:string;value:string}[] };
  const displayedSpecs=details.specs?.map(spec=>current.id==='macbook-pro-2026' && spec.label==='Чип' ? {...spec,value:capacity==='16″'?'M5 Pro или M5 Max':'M6, M5 Pro или M5 Max'} : spec);
  const photos=[...generatedProductPhotos(current.id,color), ...((current.colors.length===1 || creativeFinish[current.id]===color) ? (details.gallery || []).filter(Boolean) : [])];
  const [failedPhoto,setFailedPhoto]=useState<string|null>(null);
  useEffect(()=>setFailedPhoto(null),[selectedId,color]);
  const currentPhoto=Math.min(Math.max(0,photo),Math.max(0,photos.length-1));
  const count=cart.reduce((sum,row)=>sum+row.quantity,0); const total=cart.reduce((sum,row)=>sum+byId(row.id).price*row.quantity,0);
  const selectedAtLimit=(cart.find(row=>row.id===current.id&&row.color===color&&row.capacity===capacity)?.quantity ?? 0)>=10;
  const filtered=useMemo(()=>list.filter(item=>(category==='Все'||item.category===category)&&(`${item.name} ${item.category} ${item.summary}`.toLocaleLowerCase('ru-RU').includes(query.trim().toLocaleLowerCase('ru-RU'))) && (priceRange==='all'||(priceRange==='under50'?item.price<50000:priceRange==='50to100'?item.price>=50000&&item.price<100000:item.price>=100000))).sort((a,b)=>sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:0),[category,query,sort,priceRange]);
  useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify({favorites,cart,orders}));}catch{}},[favorites,cart,orders]);
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(['Tab','Enter',' '].includes(event.key))keyboardNavigation.current=true;};const onPointer=()=>{keyboardNavigation.current=false;};document.addEventListener('keydown',onKey);document.addEventListener('pointerdown',onPointer);return()=>{document.removeEventListener('keydown',onKey);document.removeEventListener('pointerdown',onPointer);};},[]);
  useEffect(()=>{if(!focusNextScreen.current)return;focusNextScreen.current=false;const frame=requestAnimationFrame(()=>{const heading=document.querySelector<HTMLElement>('.as-main h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}});return()=>cancelAnimationFrame(frame);},[screen]);
  useEffect(()=>{const root=document.getElementById('root');root?.classList.add('as-scroll-root');return()=>root?.classList.remove('as-scroll-root');},[]);
  useEffect(()=>{const root=document.getElementById('root'),nav=document.querySelector<HTMLElement>('.as-nav');if(!root||!nav)return;let frame=0;const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>root.style.setProperty('--as-clearance',`${Math.max(180,Math.ceil(root.getBoundingClientRect().bottom-nav.getBoundingClientRect().top+24))}px`));};const observer=new ResizeObserver(update);observer.observe(root);observer.observe(nav);window.addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);const tg=(window as any).Telegram?.WebApp;tg?.onEvent?.('viewportChanged',update);update();return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',update);window.visualViewport?.removeEventListener('resize',update);tg?.offEvent?.('viewportChanged',update);root.style.removeProperty('--as-clearance');};},[]);
  useEffect(()=>{if(!sheet)return;const elements=Array.from(document.querySelectorAll<HTMLElement>('#root, [data-testid="apple-store"], .as-nav, .w4-topbar, .home-ai-surface'));const old=elements.map(el=>el.hasAttribute('inert'));elements.forEach(el=>el.setAttribute('inert',''));const frame=requestAnimationFrame(()=>document.querySelector<HTMLElement>('.as-sheet button')?.focus({preventScroll:true}));const handle=(event:KeyboardEvent)=>{if(event.key==='Escape')closeSheet();if(event.key!=='Tab')return;const controls=Array.from(document.querySelectorAll<HTMLElement>('.as-sheet button:not([disabled]), .as-sheet input, .as-sheet select, .as-sheet [tabindex="0"]'));if(!controls.length)return;if(event.shiftKey&&document.activeElement===controls[0]){event.preventDefault();controls[controls.length-1].focus();}else if(!event.shiftKey&&document.activeElement===controls[controls.length-1]){event.preventDefault();controls[0].focus();}};document.addEventListener('keydown',handle);return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',handle);elements.forEach((el,i)=>{if(!old[i])el.removeAttribute('inert');});if(focusBefore.current?.isConnected)focusBefore.current.focus({preventScroll:true});};},[sheet]);
  // Browser history contains only navigation state, never checkout contact details.
  const applyingFilters = useRef<{category:Category|'Все';priceRange:PriceRange}|null>(null);
  function snapshot():Snapshot { return {screen,sheet,selectedId,category,query,sort,priceRange,photo,color,capacity,previous,lastOrderId}; }
  function apply(value:Snapshot) { setScreen(value.screen);setSheet(value.sheet);setSelectedId(value.selectedId);setCategory(applyingFilters.current?.category ?? value.category);setPriceRange(applyingFilters.current?.priceRange ?? value.priceRange ?? 'all');applyingFilters.current=null;setQuery(value.query);setSort(value.sort);setPhoto(value.photo);setColor(value.color);setCapacity(value.capacity);setPrevious(value.previous);setLastOrderId(value.lastOrderId??null); }
  // WebKit can reject rapid history writes. Keep an internal stack so visible back remains correct.
  const localStack=useRef<{snapshot:Snapshot;scrollTop:number}[]>([]);
  const localRestoring=useRef(false);
  const appleHistory = useAppleHistory({getSnapshot:snapshot,restore:value=>{localStack.current=[];localRestoring.current=false;apply(value);},canSave:()=>localStack.current.length===0&&!localRestoring.current});
  useEffect(()=>{appleHistory.replaceCurrent();},[screen,sheet,selectedId,category,query,sort,priceRange,photo,color,capacity,previous,lastOrderId,appleHistory.replaceCurrent]);
  function navigate(patch:Partial<Snapshot>,preserve=false){if(localRestoring.current)return;const current=snapshot();const next={...current,...patch};if(Object.keys(patch).every(k=>current[k as keyof Snapshot]===next[k as keyof Snapshot]))return;if(patch.screen&&patch.screen!==screen&&keyboardNavigation.current)focusNextScreen.current=true;const root=document.getElementById('root');if(localStack.current.length||localRestoring.current||!appleHistory.push(next,{preserveScroll:preserve}))localStack.current.push({snapshot:current,scrollTop:root?.scrollTop??0});apply(next);if(!preserve)scrollToTop();}
  function backOrLocal(fallback:()=>void){if(localRestoring.current)return;const entry=localStack.current.pop();if(!entry){appleHistory.back(fallback);return;}localRestoring.current=true;apply(entry.snapshot);requestAnimationFrame(()=>requestAnimationFrame(()=>{const root=document.getElementById('root');if(root)root.scrollTop=entry.scrollTop;localRestoring.current=false;if(!localStack.current.length)appleHistory.replaceCurrent();}));}
  function closeSheet(){backOrLocal(()=>setSheet(null));}
  function goHome(){navigate({screen:'home',sheet:null});}
  function browse(cat:Category|'Все'='Все'){catalogScroll.current=0;navigate({screen:'catalog',sheet:null,category:cat,query:'',sort:'featured',priceRange:'all'});}
  function openProduct(id:string,selectedColor?:string,selectedCapacity?:string){if(screen==='catalog')catalogScroll.current=document.getElementById('root')?.scrollTop||0;const item=byId(id);navigate({screen:'product',sheet:null,selectedId:id,previous:screen==='product'?previous:screen,photo:0,color:selectedColor && item.colors.includes(selectedColor)?selectedColor:item.colors[0],capacity:selectedCapacity && item.capacities.includes(selectedCapacity)?selectedCapacity:item.capacities[0]});}
  function back(){backOrLocal(()=>{if(screen==='product'&&previous==='catalog'){setScreen('catalog');setSheet(null);requestAnimationFrame(()=>requestAnimationFrame(()=>{const root=document.getElementById('root');if(root)root.scrollTop=catalogScroll.current;}));}else if(screen==='product')navigate({screen:previous,sheet:null});else if(screen==='checkout'){setScreen(checkoutOrigin.current);setSheet('cart');}else goHome();});}
  function openSheet(value:Exclude<Sheet,null>){focusBefore.current=document.activeElement instanceof HTMLElement?document.activeElement:null;navigate({sheet:value},true);}
  function favorite(id:string){setFavorites(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);}
  function add(){setCart(old=>{const found=old.find(row=>row.id===current.id&&row.color===color&&row.capacity===capacity);return found?old.map(row=>row===found?{...row,quantity:Math.min(10,row.quantity+1)}:row):[...old,{id:current.id,color,capacity,quantity:1}];});openSheet('cart');}
  function quantity(row:CartItem,delta:number){setCart(old=>old.map(item=>item===row?{...item,quantity:Math.min(10,item.quantity+delta)}:item).filter(item=>item.quantity>0));}
  function submit(event:FormEvent){event.preventDefault();setSubmitted(true);if(!name.trim()||phone.replace(/\D/g,'').length<10||!cart.length){requestAnimationFrame(()=>{const field=!name.trim()?nameRef.current:phone.replace(/\D/g,'').length<10?phoneRef.current:null;field?.focus({preventScroll:true});field?.scrollIntoView({block:'center'});});return;}const order={id:`DEMO-${Date.now().toString().slice(-6)}`,total,items:cart.map(row=>({...row}))};setOrders(old=>[order,...old].slice(0,10));setCart([]);setName('');setPhone('');setSubmitted(false);navigate({screen:'success',sheet:null,lastOrderId:order.id});}
  const screenAnnouncement=screen==='home'?'Главная магазина':screen==='catalog'?'Каталог':screen==='product'?`Товар: ${current.name}`:screen==='profile'?'Избранное и демо-заказы':screen==='checkout'?'Оформление демо-заказа':'Демо-заказ оформлен';
  return <div className="as-store" data-testid="apple-store" lang="ru"><p className="as-sr" role="status" aria-live="polite" aria-atomic="true">{screenAnnouncement}</p><main className="as-main" key={screen}>
    {(screen==='product'||screen==='checkout'||screen==='success')&&<button type="button" className="as-back" onClick={back}><ArrowLeft size={18}/> Назад</button>}
    {screen==='home'&&<section className="as-home"><div className="as-hero"><div className="as-hero-copy"><span>ТЕХНОЛОГИИ ДЛЯ ТЕБЯ</span><h1>Открой<br/>новое.</h1><p>Знакомые вещи.<br/>Новые возможности.</p><button type="button" onClick={()=>browse()}>Смотреть всё <ArrowRight size={15}/></button></div><div className="as-hero-art" aria-hidden="true"><Photo item={byId('iphone-18-pro-max')} kind="product" alt="" loading="eager" context="hero" priority/><Photo item={byId('airpods-pro-3')} kind="product" alt="" loading="eager" context="hero"/></div></div><div className="as-section-heading"><div><span>ВЫБИРАЙ СВОЁ</span><h2>Всё, что любишь.</h2></div><button type="button" onClick={()=>browse()}>В каталог <ArrowRight size={16}/></button></div><div className="as-category-grid">{cats.map(cat=><button type="button" key={cat} className="as-category-card" onClick={()=>browse(cat)}><div><h3>{cat==='Watch'?'Apple Watch':cat==='Mac'?'Mac':cat}</h3><span>Смотреть <ArrowRight size={13}/></span></div><Photo item={byId(visual[cat])} kind="product" alt="" context="category"/></button>)}</div><div className="as-editorial"><img {...appleImageProps('/apple-store/creative/airpods-pro-3-floating.webp','detail')} alt="Сгенерированная иллюстрация наушников" loading="lazy" fetchPriority="low" decoding="async"/><div><span>НА СВОЕЙ ВОЛНЕ</span><h2>Музыка<br/>всегда рядом.</h2><button type="button" onClick={()=>browse('AirPods')}>Открыть AirPods <ArrowRight size={16}/></button></div></div><div className="as-section-heading"><div><span>ВЫБРАНО ДЛЯ ТЕБЯ</span><h2>Ближе к любимому.</h2></div><button type="button" onClick={()=>browse()}>Все модели <ArrowRight size={16}/></button></div><div className="as-grid">{[list[0],list[5],list[10],list[14]].map(item=><ProductCard key={item.id} item={item} favorite={favorites.includes(item.id)} onFavorite={()=>favorite(item.id)} onOpen={()=>openProduct(item.id)}/>)}</div><p className="as-demo-note">Демонстрационный магазин. Не является официальным магазином Apple. Цены и изображения приведены для примера.</p></section>}
    {screen==='catalog'&&<section className="as-content as-catalog"><span className="as-eyebrow">APPLE / КОЛЛЕКЦИЯ</span><h1>Найди своё.</h1><p className="as-lead">Технологии, которые хочется взять с собой.</p><label className="as-search"><Search size={19}/><span className="as-sr">Поиск по каталогу</span><input type="search" placeholder="Поиск по каталогу" value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button type="button" onClick={()=>setQuery('')} aria-label="Очистить поиск"><X size={17}/></button>}</label><div className="as-chips">{(['Все',...cats] as const).map(cat=><button type="button" key={cat} className={category===cat?'is-active':''} aria-pressed={category===cat} onClick={()=>setCategory(cat)}>{cat}</button>)}</div><div className="as-catalog-tools"><button type="button" onClick={()=>{setFilterDraft(category);setPriceDraft(priceRange);openSheet('filters');}}><SlidersHorizontal size={17}/> Фильтр{priceRange!=='all'&&<span className="as-filter-badge">1</span>}</button><label>Сортировка <select aria-label="Сортировка" value={sort} onChange={event=>setSort(event.target.value)}><option value="featured">По подборке</option><option value="low">Сначала дешевле</option><option value="high">Сначала дороже</option></select><ChevronDown size={14}/></label></div><div className="as-active-filters">{priceRange!=='all'&&<button type="button" onClick={()=>setPriceRange('all')} aria-label="Убрать фильтр цены">{priceNames[priceRange]} <X size={14}/></button>}</div><p className="as-count" aria-live="polite">Найдено: {filtered.length}</p>{filtered.length?<div className="as-grid">{filtered.map(item=><ProductCard key={item.id} item={item} favorite={favorites.includes(item.id)} onFavorite={()=>favorite(item.id)} onOpen={()=>openProduct(item.id)}/>)}</div>:<div className="as-empty"><p>По этому запросу ничего не нашли.</p><button type="button" onClick={()=>{setQuery('');setCategory('Все');setPriceRange('all');}}>Показать все модели</button></div>}<p className="as-demo-note">Демо-каталог: цены и изображения условные.</p></section>}
    {screen==='product'&&<section className="as-product">
      <div className="as-product-intro">
        <span className="as-eyebrow">{current.category} / {current.availability === 'preorder' ? 'ПРЕДЗАКАЗ' : current.image ? 'КОЛЛЕКЦИЯ' : 'АРХИВ ДЕМО'}</span>
        <h1>{current.name}</h1><p>{current.summary}</p><div className="as-intro-price"><span>Демо-цена</span><strong>{price(current.price)}</strong></div>
      </div>
      <div className="as-product-gallery" onTouchStart={event=>{const t=event.touches[0];touchStart.current=t?{x:t.clientX,y:t.clientY}:null;}} onTouchEnd={event=>{const t=event.changedTouches[0],start=touchStart.current;touchStart.current=null;if(!t||!start)return;const dx=t.clientX-start.x,dy=t.clientY-start.y;if(photos.length>1&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))setPhoto(Math.min(photos.length-1,Math.max(0,currentPhoto+(dx<0?1:-1))));}}>
        {photos[currentPhoto] && failedPhoto!==photos[currentPhoto] ? <img {...appleImageProps(photos[currentPhoto],'gallery')} alt={`${current.name}, ${color}, иллюстрация ${currentPhoto+1}`} loading="eager" fetchPriority="high" decoding="async" onError={()=>setFailedPhoto(photos[currentPhoto])}/> : <div className="as-image-unavailable" role="status"><span>{photos[currentPhoto] ? 'Не удалось загрузить изображение.' : 'Архивная модель: иллюстрация недоступна.'}</span>{photos[currentPhoto]&&<button type="button" onClick={()=>setFailedPhoto(null)}>Попробовать снова</button>}</div>}
        <button className="as-icon as-product-heart" type="button" aria-label={`${favorites.includes(current.id)?'Убрать из избранного':'В избранное'}: ${current.name}`} aria-pressed={favorites.includes(current.id)} onClick={()=>favorite(current.id)}><Heart size={20} fill={favorites.includes(current.id)?'currentColor':'none'}/></button>
        {photos[currentPhoto] && failedPhoto!==photos[currentPhoto] && <button type="button" className="as-icon as-photo-open" aria-label="Увеличить фотографию товара" onClick={event=>{event.currentTarget.focus({preventScroll:true});setPhotoZoom(false);openSheet('photo');}}><ZoomIn size={19}/></button>}
        {photos.length>1&&<span className="as-photo-number" aria-live="polite">{String(currentPhoto+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span>}
      </div>
      {photos[currentPhoto]&&<p className="as-gallery-note">Иллюстрация создана с помощью ИИ</p>}
      {['macbook-air-2026','macbook-pro-proled'].includes(current.id)&&<p className="as-gallery-note">Фото показывает выбранный цвет; размер ноутбука на изображении может отличаться от выбранного.</p>}
      {photos.length>1&&<div className="as-gallery-strip" role="group" aria-label="Фотографии модели">{photos.map((src,index)=><button type="button" key={src+'-'+index} aria-label={`Фото ${index+1} из ${photos.length}`} aria-pressed={currentPhoto===index} onClick={()=>setPhoto(index)}><img {...appleImageProps(src,'thumbnail')} alt="" loading="lazy" decoding="async"/></button>)}</div>}
      <div className="as-product-info">
        <div className="as-product-price"><div><span>ДЕМО-ЦЕНА</span><strong className="as-price">{price(current.price)}</strong><p className="as-price-note">Цена приведена для примера</p></div></div>
        <div className="as-product-configuration"><h2>Собери свой вариант.</h2><p>Выбери подходящую конфигурацию</p><div className="as-choice"><div><b>Цвет</b><span>{color}</span></div><div className="as-choice-buttons">{current.colors.map(c=><button type="button" key={c} className={color===c?'is-active':''} aria-pressed={color===c} onClick={()=>{setColor(c);setPhoto(0);setPhotoZoom(false);}}>{c}</button>)}</div></div>{current.capacities.length > 1&&<div className="as-choice"><div><b>{current.optionLabel || 'Память'}</b><span>{capacity}</span></div><div className="as-choice-buttons">{current.capacities.map(c=><button type="button" key={c} className={capacity===c?'is-active':''} aria-pressed={capacity===c} onClick={()=>setCapacity(c)}>{c}</button>)}</div></div>}</div>
        <button type="button" className="as-primary" onClick={add}><ShoppingBag size={18}/> {selectedAtLimit?'ОТКРЫТЬ КОРЗИНУ':'В КОРЗИНУ'} <span>{price(current.price)}</span></button>
        {selectedAtLimit&&<p className="as-limit-note" role="status">В корзине максимум — 10 шт. выбранного варианта.</p>}
        <p className="as-demo-note">Демо: цены условны. Изображения созданы с помощью ИИ и могут отличаться от реальных изделий.</p>
        {(details.features?.length || details.specs?.length) ? <section className="as-product-details" aria-labelledby="as-detail-title">
          <div className="as-details-intro"><span className="as-eyebrow">ЗНАКОМЬСЯ БЛИЖЕ</span><h2 id="as-detail-title">Всё в деталях.</h2><p>{current.summary}</p></div>
          {Boolean(details.features?.length)&&<div className="as-feature-grid">{details.features!.map((feature,index)=><div className="as-feature" key={feature}><span>{String(index+1).padStart(2,'0')}</span><p>{feature}</p></div>)}</div>}
          {photos.length>1&&<div className="as-detail-visual"><div><span className="as-eyebrow">РАССМОТРИ БЛИЖЕ</span><h3>{current.name}</h3></div><img {...appleImageProps(photos[Math.min(2,photos.length-1)],'detail')} alt={current.name + ', дополнительный ракурс'} loading="lazy" decoding="async"/>{photos[Math.min(2,photos.length-1)]&&<p className="as-detail-note">Иллюстрация создана с помощью ИИ</p>}</div>}
          {Boolean(displayedSpecs?.length)&&<div className="as-specs"><h3>Характеристики</h3><dl>{displayedSpecs!.map(spec=><div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>{current.source&&<a href={current.source} target="_blank" rel="noreferrer">Характеристики на сайте Apple <ArrowRight size={14}/></a>}</div>}
        </section>:null}
        <div className="as-section-heading"><div><span>СМОТРИ ТАКЖЕ</span><h2>Ещё больше идей.</h2></div><button type="button" onClick={()=>browse()}>В каталог <ArrowRight size={16}/></button></div>
        <div className="as-grid">{[...list.filter(item=>item.id!==current.id&&item.category===current.category),...list.filter(item=>item.id!==current.id&&item.category!==current.category)].slice(0,4).map(item=><ProductCard key={item.id} item={item} favorite={favorites.includes(item.id)} onFavorite={()=>favorite(item.id)} onOpen={()=>openProduct(item.id)}/>)}</div>
      </div>
    </section>}
    {screen==='profile'&&<section className="as-content as-profile"><span className="as-eyebrow">ЛИЧНОЕ ПРОСТРАНСТВО</span><h1>Твоё<br/>избранное.</h1><p className="as-lead">Вещи, к которым хочется вернуться.</p>{favorites.length?<div className="as-grid as-profile-grid">{allList.filter(item=>favorites.includes(item.id)).map(item=><ProductCard key={item.id} item={item} favorite onFavorite={()=>favorite(item.id)} onOpen={()=>openProduct(item.id)}/>)}</div>:<div className="as-empty"><Heart size={25}/><p>Добавляй понравившиеся модели в избранное.</p><button type="button" onClick={()=>browse()}>Открыть каталог <ArrowRight size={15}/></button></div>}<div className="as-order-heading"><h2>Демо-заказы</h2><span>{orders.length}</span></div>{orders.length?orders.map(order=><div className="as-order-record" key={order.id}><div className="as-order"><span>{order.id}</span><b>{price(order.total)}</b></div>{Boolean(order.items?.length)&&<ul className="as-order-items">{order.items!.map(row=>{const item=byId(row.id);const variant=variantLabel(item,row);return <li key={`${row.id}-${row.color}-${row.capacity}`}><span>{item.name}</span><small>{[variant, `${row.quantity} шт.`].filter(Boolean).join(' · ')}</small></li>;})}</ul>}</div>):<p className="as-small">История демо-заказов появится здесь.</p>}<p className="as-demo-note">Данные хранятся только на этом устройстве.</p></section>}
    {screen==='checkout'&&<section className="as-content as-checkout"><span className="as-eyebrow">ПОСЛЕДНИЙ ШАГ / ДЕМО</span><h1>Оформление.</h1><p className="as-lead">Посмотри, как будет выглядеть покупка.</p><div className="as-demo-banner">Это демо: данные не отправляются, оплата не списывается.</div><form onSubmit={submit} noValidate><h2>Контакты</h2><label className="as-field">Имя<input ref={nameRef} aria-label="Имя" autoComplete="name" value={name} onChange={e=>setName(e.target.value)} aria-invalid={submitted&&!name.trim()} aria-describedby={submitted&&!name.trim()?'as-name-error':undefined} placeholder="Как тебя зовут"/>{submitted&&!name.trim()&&<span id="as-name-error">Укажи имя.</span>}</label><label className="as-field">Телефон<input ref={phoneRef} aria-label="Телефон" type="tel" autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} aria-invalid={submitted&&phone.replace(/\D/g,'').length<10} aria-describedby={submitted&&phone.replace(/\D/g,'').length<10?'as-phone-error':undefined} placeholder="+7 999 000-00-00"/>{submitted&&phone.replace(/\D/g,'').length<10&&<span id="as-phone-error">Укажи номер телефона.</span>}</label><h2>Твой заказ</h2>{cart.map(row=>{const item=byId(row.id);const variant=variantLabel(item,row);return <div className="as-order as-order-item" key={`${row.id}-${row.color}-${row.capacity}`}><div><span>{item.name}</span>{variant&&<small>{variant}</small>}<small>{row.quantity} шт.</small></div><b>{price(item.price*row.quantity)}</b></div>;})}<div className="as-order as-order-total"><span>Итого</span><b>{price(total)}</b></div>{submitted&&!cart.length&&<p className="as-error">Корзина пуста.</p>}<button type="submit" className="as-primary">ПОДТВЕРДИТЬ ДЕМО-ЗАКАЗ <ArrowRight size={16}/></button></form></section>}
    {screen==='success'&&<section className="as-content as-success"><span className="as-success-icon"><Check size={24}/></span><span className="as-eyebrow">ГОТОВО / ДЕМО</span><h1>Заказ<br/>оформлен.</h1><p className="as-lead">Это пример покупки: данные не отправлены, оплата не списана.</p>{lastOrder&&<div className="as-order"><span>{lastOrder.id}</span><b>{price(lastOrder.total)}</b></div>}<button type="button" className="as-primary" onClick={()=>browse()}>ПРОДОЛЖИТЬ ВЫБОР <ArrowRight size={16}/></button></section>}
  </main>{createPortal(<div className="as-portal"><nav className="as-nav" aria-label="Навигация магазина"><button type="button" aria-label="Главная" aria-current={activeScreen==='home'&&!sheet?'page':undefined} className={activeScreen==='home'&&!sheet?'is-active':''} onClick={goHome}><Home size={19}/><span>Главная</span></button><button type="button" aria-label="Каталог" aria-current={activeScreen==='catalog'&&!sheet?'page':undefined} className={activeScreen==='catalog'&&!sheet?'is-active':''} onClick={()=>browse()}><Menu size={19}/><span>Каталог</span></button><button type="button" aria-label={`Корзина, товаров: ${count}`} className={sheet==='cart'?'is-active':''} onClick={()=>openSheet('cart')}><span className="as-bag"><ShoppingBag size={19}/>{count>0&&<i>{count}</i>}</span><span>Корзина</span></button><button type="button" aria-label="Профиль" aria-current={activeScreen==='profile'&&!sheet?'page':undefined} className={activeScreen==='profile'&&!sheet?'is-active':''} onClick={()=>navigate({screen:'profile',sheet:null})}><UserRound size={19}/><span>Профиль</span></button></nav>
    {sheet&&<div className="as-overlay" onClick={closeSheet}><section className="as-sheet" role="dialog" aria-modal="true" aria-labelledby="as-sheet-title" onClick={event=>event.stopPropagation()}><div className="as-sheet-handle"><span/></div><div className="as-sheet-head"><h2 id="as-sheet-title">{sheet==='cart'?'Корзина':sheet==='filters'?'Фильтр':'Фотографии'}</h2><button type="button" className="as-icon" aria-label="Закрыть" onClick={closeSheet}><X size={20}/></button></div>{sheet==='cart'?<><div className="as-sheet-body">{cart.length?cart.map(row=>{const item=byId(row.id);return <article className="as-cart-row" key={`${row.id}-${row.color}-${row.capacity}`}><button type="button" className="as-cart-image" onClick={()=>openProduct(item.id,row.color,row.capacity)} aria-label={`Открыть ${item.name}`}><Photo item={item} kind="product" color={row.color} alt={item.name + ", " + row.color} context="thumbnail"/></button><div><strong>{item.name}</strong><p>{variantLabel(item,row) || 'Стандартная комплектация'}</p><b>{price(item.price*row.quantity)}</b><div className="as-qty"><button type="button" aria-label={`Уменьшить количество ${item.name}`} onClick={()=>quantity(row,-1)}><Minus size={15}/></button><span>{row.quantity}</span><button type="button" aria-label={`Увеличить количество ${item.name}`} disabled={row.quantity>=10} title={row.quantity>=10?'Максимум 10 штук':undefined} onClick={()=>quantity(row,1)}><Plus size={15}/></button></div>{row.quantity>=10&&<p className="as-limit-note" role="status">Максимум 10 шт.</p>}</div><button type="button" className="as-icon" onClick={()=>setCart(old=>old.filter(entry=>entry!==row))} aria-label={`Удалить ${item.name}`}><X size={18}/></button></article>; }):<div className="as-empty"><ShoppingBag size={28}/><h3>Пока пусто.</h3><p>Выбери то, что тебе нравится.</p><button type="button" onClick={()=>browse()}>Перейти в каталог <ArrowRight size={16}/></button></div>}</div>{cart.length>0&&<div className="as-sheet-footer"><div><span>Итого</span><strong>{price(total)}</strong></div><button type="button" className="as-primary" onClick={()=>{checkoutOrigin.current=screen;setSubmitted(false);navigate({screen:'checkout',sheet:null});}}>ОФОРМИТЬ ДЕМО-ЗАКАЗ <ArrowRight size={16}/></button><p>Без реальной оплаты и отправки данных.</p></div>}</>:sheet==='filters'?<><div className="as-sheet-body"><p className="as-filter-title">Категория</p><div className="as-filter-options">{(['Все',...cats] as const).map(cat=><button key={cat} type="button" aria-pressed={filterDraft===cat} className={filterDraft===cat?'is-active':''} onClick={()=>setFilterDraft(cat)}>{cat}</button>)}</div><p className="as-filter-title">Цена</p><div className="as-filter-options">{(Object.keys(priceNames) as PriceRange[]).map(range=><button key={range} type="button" aria-pressed={priceDraft===range} className={priceDraft===range?'is-active':''} onClick={()=>setPriceDraft(range)}>{priceNames[range]}</button>)}</div></div><div className="as-sheet-footer as-filter-footer"><button type="button" className="as-primary" onClick={()=>{applyingFilters.current={category:filterDraft,priceRange:priceDraft};backOrLocal(()=>{setCategory(filterDraft);setPriceRange(priceDraft);applyingFilters.current=null;setSheet(null);});}}>ПОКАЗАТЬ МОДЕЛИ</button><button type="button" className="as-filter-reset" aria-label="Сбросить фильтры" onClick={()=>{setFilterDraft('Все');setPriceDraft('all');}}>Сбросить</button></div></>:<div className="as-sheet-body as-photo-viewer"><div className={`as-photo-viewport${photoZoom?' is-zoomed':''}`} tabIndex={0} role="region" aria-label={photoZoom?'Увеличенная фотография, можно прокручивать':'Фотография товара'}><img {...appleImageProps(photos[currentPhoto],'zoom')} alt={current.name + ', иллюстрация ' + (currentPhoto+1)} decoding="async"/></div>{photos[currentPhoto]&&<p className="as-viewer-note">Иллюстрация создана с помощью ИИ</p>}<div className="as-photo-controls">{photos.length>1&&<><button type="button" className="as-icon" aria-label="Предыдущая фотография" disabled={currentPhoto===0} onClick={()=>{setPhoto(currentPhoto-1);setPhotoZoom(false);}}><ArrowLeft size={19}/></button><span aria-live="polite">{String(currentPhoto+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span><button type="button" className="as-icon" aria-label="Следующая фотография" disabled={currentPhoto===photos.length-1} onClick={()=>{setPhoto(currentPhoto+1);setPhotoZoom(false);}}><ArrowRight size={19}/></button></>}<button type="button" className="as-photo-toggle" aria-pressed={photoZoom} onClick={()=>setPhotoZoom(value=>!value)}>{photoZoom?<ZoomOut size={18}/>:<ZoomIn size={18}/>} {photoZoom?'Уменьшить':'Увеличить'}</button></div>{photoZoom&&<p className="as-small">Перемещай изображение, чтобы рассмотреть детали.</p>}</div>}</section></div>}
  </div>,document.body)}</div>;
}
