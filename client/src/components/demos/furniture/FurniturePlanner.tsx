import { lockBackground } from './modalBackground';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Plus, RotateCcw, RotateCw, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { createPlannerScene } from './plannerScene';
import { canSupport, supportFor, supportedPieces, moveWithContents, contain, DEFAULT_ROOM, doorApproachOccupied, footprint, MAX_ITEMS, overlaps, PLANNER_STORAGE_KEY, ROOM_MAX, ROOM_MIN, roomOpenings, validOpenings, validProducts, validateLayout, type PlannerItem, type PlannerLayout, type PlannerProduct, type PlannerRoom, type PlannerView, openingWalls, type WallSide } from './plannerTypes';
import MeasuredPlan from './MeasuredPlan';
import RoomActions from './RoomActions';
import { roomURL, storyByKey, type RoomKey } from './roomLibrary';
import { typeLabel } from './catalogSearch';
import './FurniturePlanner.css';

export type { PlannerProduct } from './plannerTypes';
export type FurniturePlannerProps = { products: readonly PlannerProduct[]; initialProductId?: string; startIn3D?: boolean; initialPlan?:PlannerLayout; sceneKey?:RoomKey; storageKey?:string; initialMessage?:string; onItem?:(id:string)=>void; onKit?:(ids:string[])=>void; onClose: () => void };
type Bounds = Record<string, { widthM: number; depthM: number; heightM: number }>;
const id = () => globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function canPlace(candidate: PlannerItem, layout: PlannerLayout, products: readonly PlannerProduct[]) {
  const product = products.find(p => p.id === candidate.productId); if (!product || (product.placement==='surface'&&!supportFor(candidate,product,layout.items,products))) return false;
  const bounded = contain(candidate, product, layout.room);
  if (!bounded || Math.abs(bounded.x - candidate.x) > 0.0001 || Math.abs(bounded.z - candidate.z) > 0.0001) return false;
  return !layout.items.some(other => other.id !== candidate.id && overlaps(candidate, product, other, products.find(p => p.id === other.productId)!));
}
// A plan saved against older model bounds may already contain collisions. Let
// its owner separate existing overlaps without permitting new ones, and let
// them bring an out-of-bounds item back in rather than silently moving it.
function canAdjust(candidate: PlannerItem, previous: PlannerItem, layout: PlannerLayout, products: readonly PlannerProduct[]) {
  const product = products.find(p => p.id === candidate.productId); if (!product || (product.placement==='surface'&&!supportFor(candidate,product,layout.items,products))) return false;
  const outside = (item: PlannerItem) => {
    const half = footprint(product, item.rotation);
    return Math.max(0, -layout.room.width / 2 - (item.x - half.x)) + Math.max(0, item.x + half.x - layout.room.width / 2)
      + Math.max(0, -layout.room.depth / 2 - (item.z - half.z)) + Math.max(0, item.z + half.z - layout.room.depth / 2);
  };
  if (outside(candidate) > outside(previous) + 0.0001) return false;
  return !layout.items.some(other => {
    if (other.id === candidate.id) return false;
    const otherProduct = products.find(p => p.id === other.productId);
    return otherProduct && overlaps(candidate, product, other, otherProduct) && !overlaps(previous, product, other, otherProduct);
  });
}
function positionForDrag(item: PlannerItem, product: PlannerProduct, room: PlannerRoom) {
  // An item wider than the room cannot be fully contained. Keep its centre on
  // the floor so it can still be selected, rotated, or removed by its owner.
  return contain(item, product, room) ?? { ...item, x: Math.max(-room.width / 2, Math.min(room.width / 2, item.x)), z: Math.max(-room.depth / 2, Math.min(room.depth / 2, item.z)) };
}
function findSpot(product: PlannerProduct, layout: PlannerLayout, products: readonly PlannerProduct[]): PlannerItem | null {
  const item = { id: id(), productId: product.id, x: 0, z: 0, rotation: 0 };
  const preferred = [...(product.placement==='surface'?layout.items.filter(i=>{const p=products.find(v=>v.id===i.productId);return p&&canSupport(p)}).map(i=>[i.x,i.z]):[]),[0, -0.9], [-1.5, 0.6], [0, 1.25], [1.5, 0.5], [0, 0]];
  for (const [x, z] of preferred) { const result = contain({ ...item, x, z }, product, layout.room); if (result && canPlace(result, layout, products)) return result; }
  for (let z = -layout.room.depth / 2; z <= layout.room.depth / 2; z += 0.2) for (let x = -layout.room.width / 2; x <= layout.room.width / 2; x += 0.2) { const result = contain({ ...item, x, z }, product, layout.room); if (result && canPlace(result, layout, products)) return result; }
  return null;
}
function initialLayout(products: readonly PlannerProduct[], initialId?: string): { layout: PlannerLayout; couldNotAdd: boolean } {
  try {
    const text = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (text) {
      const saved = validateLayout(JSON.parse(text), products, true);
      if (saved) {
        const product = products.find(p => p.id === initialId);
        if (!product || saved.items.some(item => item.productId === product.id)) return { layout: saved, couldNotAdd: false };
        const item = saved.items.length < MAX_ITEMS ? findSpot(product, saved, products) : null;
        return item ? { layout: { ...saved, items: [...saved.items, item] }, couldNotAdd: false } : { layout: saved, couldNotAdd: true };
      }
    }
  } catch { /* Start an editable plan when storage is unavailable. */ }
  let layout: PlannerLayout = { version: 1, room: DEFAULT_ROOM, items: [] };
  const first = products.find(p => p.id === initialId) ?? products[0];
  // A sofa, a chair and a table where possible; all pieces remain editable.
  const table=products.find(p=>p.category==='Столы');
  const choices = [...(first?.placement==='surface'?[table,first]:[first]), products.find(p => p.category === 'Кресла'), table].filter((p, i, all): p is PlannerProduct => !!p && all.findIndex(other => other?.id === p.id) === i);
  for (const product of choices) { const item = findSpot(product, layout, products); if (item) layout = { ...layout, items: [...layout.items, item] }; }
  return { layout, couldNotAdd: !!initialId&&!layout.items.some(i=>i.productId===initialId) };
}

export default function FurniturePlanner({ products, initialProductId, startIn3D=false, initialPlan, sceneKey='custom', storageKey=PLANNER_STORAGE_KEY, initialMessage='', onItem, onKit, onClose }: FurniturePlannerProps) {
  const { language } = useLanguage(), ru = language === 'ru';
  const t = (r: string, e: string) => ru ? r : e;
  const pieceLabel=(p:PlannerProduct)=>[typeLabel(p.category,ru),p.name].filter(Boolean).join(' · ');
  const story=storyByKey(sceneKey);
  const title=story?.title[ru?0:1]||t('Своя комната','Your room');
  const sourceProducts = useMemo(() => validProducts(products), [products]);
  const [start] = useState(() => initialPlan?{layout:initialPlan,couldNotAdd:false}:initialLayout(sourceProducts, initialProductId));
  const [savedView]=useState<{selected?:string;view?:PlannerView;evening?:boolean;pose?:number[]}>(()=>{try{const s=JSON.parse(sessionStorage.getItem(storageKey+':view')||'null');return s?.productId===initialProductId?s:{};}catch{return {}}});
  const pendingPose=useRef(savedView.pose);
  const [layout, setLayout] = useState(start.layout);
  const [selected, setSelected] = useState<string | null>(() => start.layout.items.find(item => item.id===savedView.selected)?.id ?? start.layout.items.find(item => item.productId === initialProductId)?.id ?? start.layout.items[0]?.id ?? null);
  const [view, setView] = useState<PlannerView>(startIn3D || savedView.view==='perspective'?'perspective':'top');
  const [insideView, setInsideView] = useState(false);
  const [requested3D,setRequested3D]=useState(false);
  const [sceneReady,setSceneReady]=useState(false);
  const [evening,setEvening]=useState(Boolean(savedView.evening));
  const viewSnapshot=useRef({selected,view,evening,productId:initialProductId});viewSnapshot.current={selected,view,evening,productId:initialProductId};
  const savedPose=useRef<number[]|undefined>(savedView.pose);
  const [comparisonPlan,setComparisonPlan]=useState<PlannerLayout|null>(null);
  const [otherVersion,setOtherVersion]=useState(false);
  const [choice, setChoice] = useState(initialProductId && sourceProducts.some(p => p.id === initialProductId) ? initialProductId : sourceProducts[0]?.id ?? '');
  const [width, setWidth] = useState(String(layout.room.width));
  const [depth, setDepth] = useState(String(layout.room.depth));
  const [openingDraft, setOpeningDraft] = useState(() => {
    const openings = roomOpenings(start.layout.room);
    return { windowWall:openings.window?.wall||'back' as WallSide,doorWall:openings.door?.wall||'back' as WallSide,hinge:openings.door?.hinge||'left' as 'left'|'right',windowEnabled: !!openings.window, windowStart: String(openings.window?.start.toFixed(2) ?? '0.2'), windowWidth: String(openings.window?.width.toFixed(2) ?? '1.2'), doorEnabled: !!openings.door, doorStart: String(openings.door?.start.toFixed(2) ?? '0.15'), doorWidth: String(openings.door?.width.toFixed(2) ?? '0.8') };
  });
  const [openingError, setOpeningError] = useState('');
  const [bounds, setBounds] = useState<Bounds>({});
  const [message, setMessage] = useState(() => initialMessage || (start.couldNotAdd ? t('Выбранный товар не поместился. План сохранён; освободите место и добавьте его.', 'The selected piece did not fit. Your plan is saved; make space to add it.') : ''));
  const [dragMessage, setDragMessage] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [failedModels, setFailedModels] = useState<string[]>([]);
  const [historyCount, setHistoryCount] = useState({ undo: 0, redo: 0 });
  const past = useRef<PlannerLayout[]>([]), future = useRef<PlannerLayout[]>([]), dragStart = useRef<PlannerLayout | null>(null);
  const measuredProducts = useMemo(() => sourceProducts.map(product => bounds[product.id] ? { ...product, ...bounds[product.id] } : product), [sourceProducts, bounds]);
  const layoutRef = useRef(layout), productsRef = useRef(measuredProducts);
  layoutRef.current = layout; productsRef.current = measuredProducts;
  const ruRef = useRef(ru); ruRef.current = ru;
  const canvas = useRef<HTMLCanvasElement>(null);
  const panel = useRef<HTMLElement>(null), closeButton = useRef<HTMLButtonElement>(null);
  const scene = useRef<ReturnType<typeof createPlannerScene> | null>(null);
  const selectedItem = layout.items.find(item => item.id === selected);
  const selectedProduct = selectedItem && measuredProducts.find(product => product.id === selectedItem.productId);
  const handoffLines = sourceProducts.map(product => ({ product, quantity: layout.items.filter(item => item.productId === product.id).length })).filter(row => row.quantity > 0);
  const handoff=[t('План комнаты','Room plan')+' '+layout.room.width+' × '+layout.room.depth+' m',...handoffLines.map(row=>pieceLabel(row.product)+' × '+row.quantity),roomURL(layout,sceneKey)].join('\n');
  const handoffUrl = 'https://t.me/web4tgs?text=' + encodeURIComponent(handoff);
  const loading = view==='perspective' && !unavailable && layout.items.some(item => !bounds[item.productId] && !failedModels.includes(item.productId));
  const loadingRef = useRef(loading); loadingRef.current = loading;
  const updateHistoryCount = () => setHistoryCount({ undo: past.current.length, redo: future.current.length });
  function commit(next: PlannerLayout) {
    past.current = [...past.current.slice(-49), layoutRef.current]; future.current = [];
    layoutRef.current = next; setLayout(next); updateHistoryCount();
  }
  function undo() { const previous = past.current.pop(); if (!previous) return; future.current.push(layoutRef.current); layoutRef.current = previous; setLayout(previous); setDragMessage(''); updateHistoryCount(); }
  function redo() { const next = future.current.pop(); if (!next) return; past.current.push(layoutRef.current); layoutRef.current = next; setLayout(next); setDragMessage(''); updateHistoryCount(); }

  useEffect(() => {
    if (!requested3D || !canvas.current) return;
    let live=true;
    void import('./plannerScene').then(({createPlannerScene})=>{
      if(!live||!canvas.current)return;
      scene.current = createPlannerScene(canvas.current, {
        onSelect: value => { setSelected(value); setDragMessage(''); },
        onMove: (itemId, x, z) => {
          if (loadingRef.current) return;
          const current = layoutRef.current;
          const item = current.items.find(i => i.id === itemId), product = item && productsRef.current.find(p => p.id === item.productId);
          if (!item || !product) return;
          const candidate = positionForDrag({ ...item, x, z }, product, current.room);
          if (!canAdjust(candidate, item, current, productsRef.current)) {
            setDragMessage(ruRef.current ? 'Здесь недостаточно места' : 'Not enough space here');
            return;
          }
          const againstWall = Math.abs(candidate.x - x) > 0.01 || Math.abs(candidate.z - z) > 0.01;
          setDragMessage(againstWall ? (ruRef.current ? 'Граница комнаты' : 'Room boundary') : '');
          const next = { ...current, items: moveWithContents(current.items,item,candidate,productsRef.current) };
          layoutRef.current = next; setLayout(next);
        },
        onRotate: (itemId, rotation) => {
          if (loadingRef.current) return;
          const current = layoutRef.current, item = current.items.find(i => i.id === itemId);
          if (!item) return;
          const candidate = { ...item, rotation };
          if (!canAdjust(candidate, item, current, productsRef.current)) {
            setDragMessage(ruRef.current ? 'Здесь недостаточно места для поворота' : 'Not enough space to rotate here');
            return;
          }
          setDragMessage('');
          const next = { ...current, items: moveWithContents(current.items,item,candidate,productsRef.current) };
          layoutRef.current = next; setLayout(next);
        },
        onDragStart: () => { setDragMessage(''); dragStart.current = layoutRef.current; },
        onDragEnd: () => { if (dragStart.current && JSON.stringify(dragStart.current) !== JSON.stringify(layoutRef.current)) { past.current = [...past.current.slice(-49), dragStart.current]; future.current = []; updateHistoryCount(); } dragStart.current = null; },
        onDragCancel: () => { if (dragStart.current) { layoutRef.current = dragStart.current; setLayout(dragStart.current); } dragStart.current = null; setDragMessage(''); },
        onBounds: (productId, size) => setBounds(current => current[productId] && Math.abs(current[productId].depthM - size.depthM) < 0.0001 ? current : { ...current, [productId]: size }),
        onModelError: (productId, text) => { setFailedModels(current => current.includes(productId) ? current : [...current, productId]); const product = productsRef.current.find(p => p.id === productId); setMessage(ruRef.current ? text : `Could not load the 3D model${product ? `: ${product.name}` : '.'}`); },
        onError: text => { setMessage(ruRef.current ? text : text.includes('контекст') ? '3D is unavailable. Your plan is saved on this device.' : 'Could not load the 3D model.'); if (text.includes('контекст')) setUnavailable(true); },
      }, sceneKey);
      setSceneReady(true);
    }).catch(()=>{if(live)setUnavailable(true)});
    return () => { live=false;if(scene.current)savedPose.current=scene.current.cameraPose();scene.current?.dispose(); scene.current = null; };
  }, [requested3D,sceneKey]);

  useLayoutEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = Array.from(document.body.children).filter((node): node is HTMLElement => node instanceof HTMLElement && node !== panel.current);
    const release=lockBackground(background);
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      release();
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        try { localStorage.setItem(storageKey, JSON.stringify(layoutRef.current)); } catch { /* Keep the current plan until closed. */ }
        onClose();
      }
      if (event.key !== 'Tab' || !panel.current) return;
      const focusable = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Model measurements can reveal an older plan's conflicts. Preserve every
  // saved position and tell the user; never repair or delete their work here.
  const layoutNeedsAttention = !loading && layout.items.some(item => !canPlace(item, layout, measuredProducts));

  useEffect(()=>{if(view==='perspective')setRequested3D(true)},[view]);
  useEffect(()=>{scene.current?.setEvening(evening)},[evening,sceneReady]);
  useEffect(() => { scene.current?.update({ room: layout.room, items: layout.items, products: measuredProducts, selected, view }); if(scene.current&&view==='perspective'&&pendingPose.current){scene.current.restoreCamera(pendingPose.current);pendingPose.current=undefined;} }, [layout, measuredProducts, selected, view,sceneReady]);
  useEffect(() => { setInsideView(false); setDragMessage(''); }, [view]);
  useEffect(() => { setInsideView(false); }, [layout.room.width, layout.room.depth, selected]);
  useEffect(() => { const timer = setTimeout(() => { try { localStorage.setItem(storageKey, JSON.stringify(layout)); setSaveError(false); } catch { setSaveError(true); } }, 300); return () => clearTimeout(timer); }, [layout]);
  // Browser/Telegram Back can unmount the editor before the debounced save.
  useEffect(() => () => { try { sessionStorage.setItem(storageKey+':view',JSON.stringify({...viewSnapshot.current,pose:scene.current?.cameraPose()||savedPose.current}));localStorage.setItem(storageKey, JSON.stringify(layoutRef.current)); } catch { /* A visible warning is shown while the editor is open. */ } }, []);
  useEffect(() => { if (selected && !layout.items.some(item => item.id === selected)) setSelected(null); }, [layout.items, selected]);
  useEffect(() => { setWidth(String(layout.room.width)); setDepth(String(layout.room.depth)); }, [layout.room.width, layout.room.depth]);
  useEffect(() => {
    const openings = roomOpenings(layout.room);
    setOpeningDraft({ windowWall:openings.window?.wall||'back' as WallSide,doorWall:openings.door?.wall||'back' as WallSide,hinge:openings.door?.hinge||'left' as 'left'|'right',windowEnabled: !!openings.window, windowStart: String(openings.window?.start.toFixed(2) ?? '0.2'), windowWidth: String(openings.window?.width.toFixed(2) ?? '1.2'), doorEnabled: !!openings.door, doorStart: String(openings.door?.start.toFixed(2) ?? '0.15'), doorWidth: String(openings.door?.width.toFixed(2) ?? '0.8') });
    setOpeningError('');
  }, [layout.room]);

  function changeItem(change: Partial<PlannerItem>) {
    if (!selectedItem || !selectedProduct || loading) return;
    const next = positionForDrag({ ...selectedItem, ...change }, selectedProduct, layout.room);
    if (!canAdjust(next, selectedItem, layout, measuredProducts)) { setMessage(t('Здесь недостаточно места: проверьте границы и соседние предметы.', 'Not enough space here: check the room edges and other pieces.')); return; }
    setMessage(''); commit({ ...layout, items: moveWithContents(layout.items,selectedItem,next,measuredProducts) });
  }
  function add() {
    const product = measuredProducts.find(p => p.id === choice);
    if (!product || layout.items.length >= MAX_ITEMS) { setMessage(t('Можно разместить до 12 предметов.', 'You can place up to 12 pieces.')); return; }
    const item = findSpot(product, layout, measuredProducts);
    if (!item) { setMessage(product.placement==='surface'?t('Добавьте свободный стол или тумбу для светильника.','Add a free table or cabinet for the lamp.'):t('Не нашлось свободного места.', 'No free floor space found.')); return; }
    setMessage(''); commit({ ...layout, items: [...layout.items, item] }); setSelected(item.id); setView('top');
  }
  function changeRoom() {
    const w = Number(width.replace(',', '.')), d = Number(depth.replace(',', '.'));
    if (![w, d].every(n => Number.isFinite(n) && n >= ROOM_MIN && n <= ROOM_MAX)) { setMessage(t('Размеры комнаты: от 2 до 8 метров.', 'Room dimensions must be between 2 and 8 metres.')); return; }
    const nextRoom: PlannerRoom = { ...layout.room, width: Math.round(w * 100) / 100, depth: Math.round(d * 100) / 100 };
    if (!validOpenings(nextRoom)) { setMessage(t('Проёмы не помещаются на стене. Сначала измените их размеры или положение.', 'The openings do not fit on this wall. Change their size or position first.')); return; }
    // Enlarging cannot create furniture collisions or make an existing wall
    // overflow worse, even when a legacy plan already needs manual repair.
    const valid = validateLayout({ ...layout, room: nextRoom }, measuredProducts)
      ?? (nextRoom.width >= layout.room.width && nextRoom.depth >= layout.room.depth ? { ...layout, room: nextRoom } : null);
    if (!valid) { setMessage(t('Предметы не помещаются. Сначала переместите или удалите их.', 'Pieces do not fit. Move or remove them first.')); return; }
    setMessage(''); commit(valid); setWidth(String(nextRoom.width)); setDepth(String(nextRoom.depth));
  }
  function changeOpenings() {
    const number = (value: string) => value.trim() === '' ? NaN : Math.round(Number(value.replace(',', '.')) * 100) / 100;
    const room: PlannerRoom = { ...layout.room, openings: {
      window: openingDraft.windowEnabled ? { wall:openingDraft.windowWall, start: number(openingDraft.windowStart), width: number(openingDraft.windowWidth) } : null,
      door: openingDraft.doorEnabled ? { wall:openingDraft.doorWall,hinge:openingDraft.hinge, start: number(openingDraft.doorStart), width: number(openingDraft.doorWidth) } : null,
    } };
    if (!validOpenings(room)) { setOpeningError(t('Проверьте размеры и положение: отступ от края и между проёмами — не меньше 10 см; окно от 0,4 м, проход от 0,6 м.', 'Check size and position: allow 10 cm from corners and between openings; window at least 0.4 m, doorway at least 0.6 m.')); return; }
    const valid = { ...layout, room };
    setOpeningError(''); setMessage('');
    if (JSON.stringify(layout.room.openings) !== JSON.stringify(room.openings)) commit(valid);
  }
  function remove() { if (!selected) return; if(supportedPieces(selected,layout.items,measuredProducts).length){setMessage(t('Сначала переставьте светильник на другую поверхность или уберите его.','Move the lamp to another surface or remove it first.'));return;} commit({ ...layout, items: layout.items.filter(item => item.id !== selected) }); setSelected(null); setMessage(''); }
  function duplicate() { if (!selectedProduct || loading) return; if (layout.items.length >= MAX_ITEMS) { setMessage(t('Можно разместить до 12 предметов.', 'You can place up to 12 pieces.')); return; } const item = findSpot(selectedProduct, layout, measuredProducts); if (!item) { setMessage(t('Не нашлось свободного места.', 'No free floor space found.')); return; } commit({ ...layout, items: [...layout.items, item] }); setSelected(item.id); setView('top'); setMessage(''); }

  function movePlan(id:string,x:number,z:number,rotation?:number){
    const current=layoutRef.current,item=current.items.find(i=>i.id===id),p=item&&productsRef.current.find(p=>p.id===item.productId);if(!item||!p)return;
    const next=positionForDrag({...item,x,z,rotation:rotation??item.rotation},p,current.room);
    if(!canAdjust(next,item,current,productsRef.current)){setDragMessage(t('Другой предмет занимает это место','Another piece occupies this space'));return}
    const value={...current,items:moveWithContents(current.items,item,next,productsRef.current)};layoutRef.current=value;setLayout(value);setDragMessage('');
  }
  function replacePiece(){if(!selectedItem||selectedItem.productId===choice)return;const patch={...selectedItem,productId:choice};const nextItems=layout.items.map(i=>i.id===patch.id?patch:i);if(supportedPieces(selectedItem.id,layout.items,measuredProducts).some(i=>!supportFor(i,measuredProducts.find(p=>p.id===i.productId)!,nextItems,measuredProducts))||!canPlace(patch,layout,measuredProducts)){setMessage(t('Для замены здесь недостаточно места.','The replacement does not fit here.'));return}commit({...layout,items:layout.items.map(i=>i.id===patch.id?patch:i)});setMessage('');}
  return createPortal(<section ref={panel} className="fpl" role="dialog" aria-modal="true" aria-labelledby="fpl-title" data-testid="furniture-planner">
    <header className="fpl-header"><div><p>{t('ПЛАНИРОВЩИК / 3D', 'ROOM PLANNER / 3D')}</p><h1 id="fpl-title">{title}</h1></div><button ref={closeButton} type="button" onClick={() => { try { localStorage.setItem(storageKey, JSON.stringify(layoutRef.current)); } catch { /* Other store interactions remain available. */ } onClose(); }} aria-label={t('Закрыть планировщик', 'Close planner')}><X size={22} /></button></header>
    <div className="fpl-room-meta"><span>{t('Комната', 'Room')} · {layout.room.width} × {layout.room.depth} {t('м', 'm')}</span><span>{t('Предметов', 'Pieces')}: {layout.items.length}</span></div>
    <div className="fpl-toolbar"><div className="fpl-views" role="group" aria-label={t('Вид комнаты', 'Room view')}><button type="button" aria-pressed={view === 'top'} onClick={() => setView('top')}>{t('Вид сверху', 'Top view')}</button><button type="button" aria-pressed={view === 'perspective'} onClick={() => setView('perspective')}>{t('Интерьер', 'Room view')}</button></div><div className="fpl-history"><button type="button" onClick={undo} disabled={!historyCount.undo} aria-label={t('Отменить действие', 'Undo')}><RotateCcw size={17}/></button><button type="button" onClick={redo} disabled={!historyCount.redo} aria-label={t('Повторить действие', 'Redo')}><RotateCw size={17}/></button></div></div>
    <div className="fpl-stage">{(view==='top'||unavailable)&&<MeasuredPlan layout={layout} products={measuredProducts} selected={selected} ru={ru} onSelect={setSelected} onMove={movePlan} onStart={()=>{dragStart.current=layoutRef.current}} onEnd={()=>{const old=dragStart.current;dragStart.current=null;if(old&&old!==layoutRef.current){past.current=[...past.current.slice(-49),old];future.current=[];updateHistoryCount()}}} onCancel={()=>{if(dragStart.current){layoutRef.current=dragStart.current;setLayout(dragStart.current)}dragStart.current=null}}/>}{requested3D&&<canvas ref={canvas} tabIndex={view==='perspective'&&!unavailable?0:-1} hidden={view==='top'||unavailable} aria-label={t('Трёхмерный интерьер комнаты','Interactive three-dimensional room')}/>}{view === 'perspective' && !unavailable && <button className="fpl-inside-view" type="button" onClick={() => { if (insideView) { scene.current?.showRoomOverview(); setInsideView(false); setDragMessage(''); return; } const positioned = scene.current?.showInside(); setInsideView(Boolean(positioned)); setDragMessage(positioned ? '' : t('Не удалось найти свободный ракурс', 'No clear viewpoint found')); }}>{insideView ? t('Общий вид', 'Overview') : t('Вид из комнаты', 'View inside')}</button>}{dragMessage && <p className="fpl-drag-feedback" role="status">{dragMessage}</p>}{unavailable && view==='perspective' && <div className="fpl-unavailable" role="status">{t('3D недоступно на этом устройстве. Сохранённый план останется на устройстве.', '3D is unavailable on this device. Your saved plan remains on this device.')}</div>}</div>
    {view==='perspective'&&<div className="room-buttons fpl-camera-presets"><button onClick={()=>{setEvening(v=>!v)}} aria-pressed={evening}>{evening?t('Вечер','Evening'):t('День','Daylight')}</button><button onClick={()=>scene.current?.editorialCamera('entrance')}>{t('От входа','Entrance')}</button><button onClick={()=>scene.current?.editorialCamera('seated')}>{t('С уровня глаз','Seated view')}</button><button onClick={()=>scene.current?.editorialCamera('detail')}>{t('Деталь','Detail')}</button></div>}
    <div className="fpl-items" role="group" aria-label={t('Предметы в комнате', 'Pieces in the room')}>{layout.items.map((item, index) => { const product = measuredProducts.find(p => p.id === item.productId); return product && <button type="button" key={item.id} aria-pressed={selected === item.id} aria-label={`${pieceLabel(product)}, ${t('предмет', 'piece')} ${index + 1}`} onClick={() => { setSelected(item.id); }}>{pieceLabel(product)} · {index + 1}</button>; })}</div>

    {selectedItem&&selectedProduct&&<><div className="measure-strip"><strong>{pieceLabel(selectedProduct)}</strong><span>{Math.round(selectedProduct.widthM*100)} × {Math.round(selectedProduct.depthM*100)} {t('см','cm')}</span><span>{t('До ближайшей стены','Nearest wall')} ≈ {Math.max(0,Math.round(100*Math.min(layout.room.width/2-Math.abs(selectedItem.x)-footprint(selectedProduct,selectedItem.rotation).x,layout.room.depth/2-Math.abs(selectedItem.z)-footprint(selectedProduct,selectedItem.rotation).z)))} {t('см','cm')}</span></div>{onItem&&<button className="fpl-product-link" onClick={()=>onItem(selectedProduct.id)}>{t('О товаре','Product details')}</button>}</>}
    <p className="fpl-hint">{view === 'top' ? <>{t('Двигайте план за пустое место, мебель — за сам предмет.', 'Drag empty space to move the plan; drag a piece to move it.')}<br/>{t('Масштаб: два пальца на пустом месте.', 'Zoom: pinch on empty space.')}<br/><strong>{t('Поворот: коснитесь предмета и поверните двумя пальцами.', 'Rotate: touch a piece and twist with two fingers.')}</strong></> : t('Вращайте комнату пальцем, масштабируйте двумя пальцами. Для прокрутки страницы проведите за пределами комнаты.', 'Drag to orbit the room; pinch to zoom. Scroll the page outside the room.')}</p>
    {layoutNeedsAttention && <p className="fpl-status" role="alert">{t('По размерам загруженных моделей некоторые предметы пересекаются или выходят за границы комнаты. Сохранённая расстановка не изменена автоматически. Переместите или удалите предметы либо увеличьте комнату.', 'The measured models overlap or extend outside the room. Your saved arrangement was not changed automatically. Move or remove pieces, or enlarge the room.')}</p>}
    {doorApproachOccupied(layout.room, layout.items, measuredProducts) && <p className="fpl-status" role="status">{t('Мебель находится у проёма. Проверьте проход вручную: зона 0,8 м показана приблизительно.', 'Furniture is near the doorway. Check the passage yourself: the 0.8 m approach zone is approximate.')}</p>}
    <p className="fpl-disclaimer">{story&&t('Текстиль и декор входят в оформление сцены. ','Textiles and decor style this room. ')}{t('Размеры и посадка 3D приблизительные; проверяйте перед покупкой.', '3D dimensions and fit are approximate; verify before purchasing.')}</p>
    <div className="fpl-section-heading"><h2>{t('Размеры комнаты', 'Room dimensions')}</h2><span>{t('метры', 'metres')}</span></div>
    <div className="fpl-room"><label>{t('Ширина, м', 'Width, m')}<input type="number" min={ROOM_MIN} max={ROOM_MAX} step="0.1" value={width} onChange={event => setWidth(event.target.value)} /></label><label>{t('Глубина, м', 'Depth, m')}<input type="number" min={ROOM_MIN} max={ROOM_MAX} step="0.1" value={depth} onChange={event => setDepth(event.target.value)} /></label><button type="button" onClick={changeRoom} disabled={loading}>{t('Применить', 'Apply')}</button></div>
    <details className="fpl-openings">
      <summary>{t('Окно и дверной проём', 'Window and doorway')}</summary>
      <p>{t('Выберите стену. Отступ измеряется от её первого угла по часовой стрелке на плане.', 'Choose a wall. The offset starts at its first corner clockwise on the plan.')}</p>
      <fieldset><legend>{t('Окно', 'Window')}</legend><label>{t('Стена для окна','Window wall')}<select value={openingDraft.windowWall} onChange={e=>setOpeningDraft(d=>({...d,windowWall:e.target.value as WallSide}))}>{openingWalls.map((w,i)=><option key={w} value={w}>{ru?['Дальняя','Правая','Ближняя','Левая'][i]:w}</option>)}</select></label>
        <label className="fpl-openings-toggle"><input type="checkbox" checked={openingDraft.windowEnabled} onChange={event => setOpeningDraft(draft => ({ ...draft, windowEnabled: event.target.checked }))} />{t('Показать окно', 'Show window')}</label>
        {openingDraft.windowEnabled && <div className="fpl-openings-fields"><label>{t('Окно: отступ слева, м', 'Window: left offset, m')}<input type="number" min="0.1" max="8" step="0.05" value={openingDraft.windowStart} onChange={event => setOpeningDraft(draft => ({ ...draft, windowStart: event.target.value }))} /></label><label>{t('Ширина окна, м', 'Window width, m')}<input type="number" min="0.4" max="3" step="0.05" value={openingDraft.windowWidth} onChange={event => setOpeningDraft(draft => ({ ...draft, windowWidth: event.target.value }))} /></label></div>}
      </fieldset>
      <fieldset><legend>{t('Дверной проём', 'Doorway')}</legend><label>{t('Стена для двери','Door wall')}<select value={openingDraft.doorWall} onChange={e=>setOpeningDraft(d=>({...d,doorWall:e.target.value as WallSide}))}>{openingWalls.map((w,i)=><option key={w} value={w}>{ru?['Дальняя','Правая','Ближняя','Левая'][i]:w}</option>)}</select></label><label>{t('Петли двери','Door hinges')}<select value={openingDraft.hinge} onChange={e=>setOpeningDraft(d=>({...d,hinge:e.target.value as 'left'|'right'}))}><option value="left">{t('Слева','Left')}</option><option value="right">{t('Справа','Right')}</option></select></label>
        <label className="fpl-openings-toggle"><input type="checkbox" checked={openingDraft.doorEnabled} onChange={event => setOpeningDraft(draft => ({ ...draft, doorEnabled: event.target.checked }))} />{t('Показать проём', 'Show doorway')}</label>
        {openingDraft.doorEnabled && <div className="fpl-openings-fields"><label>{t('Проём: отступ слева, м', 'Doorway: left offset, m')}<input type="number" min="0.1" max="8" step="0.05" value={openingDraft.doorStart} onChange={event => setOpeningDraft(draft => ({ ...draft, doorStart: event.target.value }))} /></label><label>{t('Ширина проёма, м', 'Doorway width, m')}<input type="number" min="0.6" max="3" step="0.05" value={openingDraft.doorWidth} onChange={event => setOpeningDraft(draft => ({ ...draft, doorWidth: event.target.value }))} /></label></div>}
      </fieldset>
      <p>{t('На плане окно отмечено синим, проход — коричневым. Подоконник 0,43 м, верх окна 2,22 м, высота проёма 2,1 м. Дуга на плане показывает направление открывания.', 'On the plan, blue marks the window and brown the doorway. Window sill is 0.43 m, top is 2.22 m; doorway height is 2.1 m. The plan shows the door swing.')}</p>
      <button type="button" disabled={loading} onClick={changeOpenings}>{t('Применить проёмы', 'Apply openings')}</button>
      {openingError && <p className="fpl-opening-error" role="alert">{openingError}</p>}
    </details>
    <div className="fpl-section-heading fpl-furniture-heading"><h2>{t('Мебель в комнате', 'Pieces in your room')}</h2><span>{layout.items.length} / {MAX_ITEMS}</span></div>
    <div className="fpl-add"><label htmlFor="fpl-product">{t('Добавить предмет', 'Add a piece')}</label><div><select id="fpl-product" value={choice} onChange={event => setChoice(event.target.value)} disabled={!sourceProducts.length}>{sourceProducts.map(product => <option value={product.id} key={product.id}>{pieceLabel(product)}</option>)}</select><button type="button" onClick={add} disabled={!choice || loading}><Plus size={17} /> {t('Добавить', 'Add')}</button></div></div>
    {selectedItem && <div className="fpl-item-actions"><button type="button" disabled={loading} onClick={duplicate}>{t('Дублировать выбранный предмет', 'Duplicate selected piece')}</button><button type="button" onClick={remove}>{t('Удалить выбранный предмет', 'Remove selected piece')}</button></div>}
    {selectedItem&&<button className="fpl-replace" type="button" disabled={choice===selectedItem.productId} onClick={replacePiece}>{t('Заменить выбранный предмет','Replace selected piece')}</button>}
    <div className="atelier-tools"><button onClick={()=>{if(!comparisonPlan){setComparisonPlan(layout);setOtherVersion(false);return}const current=layout;commit(comparisonPlan);setComparisonPlan(current);setOtherVersion(v=>!v)}}>{!comparisonPlan?t('Запомнить вариант A','Capture option A'):otherVersion?t('Показать вариант B','Show option B'):t('Показать вариант A','Show option A')}</button></div>
    <RoomActions layout={layout} products={sourceProducts} scene={sceneKey} ru={ru} initialName={title} onKit={onKit}/>
    {loading && <p className="fpl-status" role="status">{t('Загружаем и измеряем 3D-модели…', 'Loading and measuring 3D models…')}</p>}
    {message && <p className="fpl-status" role="status">{message}</p>}
    {saveError && <p className="fpl-status" role="alert">{t('Не удалось сохранить план на устройстве.', 'Could not save this plan on your device.')}</p>}
    {handoffLines.length > 0 && <a className="fpl-handoff" href={handoffUrl} target="_blank" rel="noopener noreferrer" onClick={event => { if (window.Telegram?.WebApp?.openTelegramLink) { try { window.Telegram.WebApp.openTelegramLink(handoffUrl); event.preventDefault(); } catch { /* Leave the normal link available. */ } } }}>{t('Обсудить расстановку', 'Discuss this arrangement')} <ArrowRight size={16} /></a>}
    <p className="fpl-save">{t('План сохраняется только на этом устройстве.', 'Your plan is saved only on this device.')}</p>
  </section>, document.body);
}
