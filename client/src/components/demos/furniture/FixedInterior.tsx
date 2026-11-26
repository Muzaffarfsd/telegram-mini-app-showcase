import { lockBackground } from './modalBackground';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, X } from 'lucide-react';
import { FIXED_ITEM_LIMIT, FIXED_STORAGE_KEY, findFixedPosition, fixedCanPlace, validateFixedLayout, type FixedLayout } from './fixedInteriorModel';
import type { createFixedInteriorScene, FixedSceneState } from './fixedInteriorScene';
import { moveWithContents, supportedPieces } from './plannerTypes';
import type { PlannerItem, PlannerProduct, PlannerView } from './plannerTypes';
import MeasuredPlan from './MeasuredPlan';
import { typeLabel } from './catalogSearch';
import './FixedInterior.css';

export type FixedInteriorProps = { products: readonly PlannerProduct[]; initialProductId?: string; ru: boolean; onClose: () => void; onCustomRoom?: (items:PlannerItem[]) => void; onItem?:(id:string)=>void };
type Controller = Awaited<ReturnType<typeof createFixedInteriorScene>>;

function selectOrAdd(layout:FixedLayout,products:readonly PlannerProduct[],initial?:string):FixedLayout {
  const present=layout.items.find(i=>i.productId===initial);if(present)return {...layout,selected:present.id};
  const product=products.find(p=>p.id===initial);if(!product||layout.items.length>=FIXED_ITEM_LIMIT)return layout;
  const item=findFixedPosition(product,layout.items,products);return item?{...layout,items:[...layout.items,item],selected:item.id}:layout;
}
function seed(products: readonly PlannerProduct[], initial?: string): FixedLayout {
  const items: PlannerItem[] = [];
  for (const id of ['rivet-revolve-sofa', 'rivet-revolve-chair', 'hallowood-waverly-table']) {
    const product = products.find(p => p.id === id); if (!product) continue;
    const item = findFixedPosition(product, items, products); if (item) items.push(item);
  }
  return selectOrAdd({version:1,items,selected:items[0]?.id||null},products,initial);
}

export default function FixedInterior({ products, initialProductId, ru, onClose, onCustomRoom, onItem }: FixedInteriorProps) {
  const t = (a: string, b: string) => ru ? a : b;
  const [init] = useState(() => {
    try {
      const raw = localStorage.getItem(FIXED_STORAGE_KEY);
      if (!raw) return { layout: seed(products, initialProductId), error: false, protected: false };
      let decoded: unknown;
      try { decoded = JSON.parse(raw); } catch { return { layout: seed(products, initialProductId), error: true, protected: true }; }
      const saved = validateFixedLayout(decoded, products);
      if (!saved) return { layout: seed(products, initialProductId), error: true, protected: true };
      return {layout:selectOrAdd(saved,products,initialProductId),error:false,protected:false};
    } catch { return { layout: seed(products, initialProductId), error: true, protected: false }; }
  });
  const [layout, setLayout] = useState(init.layout), layoutRef = useRef(layout); layoutRef.current = layout;
  const [view, setView] = useState<PlannerView>('perspective'), [choice, setChoice] = useState(initialProductId ?? products[0]?.id ?? '');
  const [ready, setReady] = useState(false), [unavailable, setUnavailable] = useState(false), [adding, setAdding] = useState(false), [attempt, setAttempt] = useState(0);
  const [message, setMessage] = useState(()=>initialProductId&&!init.layout.items.some(i=>i.productId===initialProductId)?t('Выбранный предмет не поместился в этот интерьер.','The selected piece does not fit in this room.'):'');
  const [bounds, setBounds] = useState<Record<string, { widthM: number; depthM: number; heightM: number }>>({});
  const boundsRef = useRef(bounds); boundsRef.current = bounds;
  const [storageError, setStorageError] = useState(init.error), protectedStorage = useRef(init.protected), [protectedFlag, setProtectedFlag] = useState(init.protected);
  const [past, setPast] = useState<FixedLayout[]>([]), [future, setFuture] = useState<FixedLayout[]>([]);
  const gesture = useRef<FixedLayout | null>(null), scene = useRef<Controller | null>(null), canvas = useRef<HTMLCanvasElement>(null);
  const dialog = useRef<HTMLElement>(null), close = useRef<HTMLButtonElement>(null), closeRef = useRef(onClose); closeRef.current = onClose;
  const [host] = useState(() => document.createElement('div'));
  const selectedItem = layout.items.find(item => item.id === layout.selected), selectedProduct = products.find(p => p.id === selectedItem?.productId);
  const effectiveProducts = products.map(product => { const b = bounds[product.id]; return b ? { ...product, widthM: Math.max(product.widthM, b.widthM), depthM: Math.max(product.depthM, b.depthM), heightM: Math.max(product.heightM, b.heightM) } : product; });
  const effectiveRef = useRef(effectiveProducts); effectiveRef.current = effectiveProducts;
  const measured = layout.items.every(item => Boolean(bounds[item.productId]));
  const stateRef = useRef<FixedSceneState>({ items: layout.items, products: effectiveProducts, selected: layout.selected ?? null, view });
  stateRef.current = { items: layout.items, products: effectiveProducts, selected: layout.selected ?? null, view };

  function save(value: FixedLayout) { if (protectedStorage.current) return; try { localStorage.setItem(FIXED_STORAGE_KEY, JSON.stringify(value)); setStorageError(false); } catch { setStorageError(true); } }
  function change(value: FixedLayout, record = false) {
    if (record) { setPast(prev => [...prev.slice(-29), layoutRef.current]); setFuture([]); }
    layoutRef.current = value; setLayout(value);
  }
  function move(id: string, patch: Partial<Pick<PlannerItem, 'x' | 'z' | 'rotation'>>) {
    const current = layoutRef.current, item = current.items.find(i => i.id === id), product = item && effectiveRef.current.find(p => p.id === item.productId); if (!item || !product) return;
    const next = { ...item, ...patch }; if (!fixedCanPlace(next, product, current.items, effectiveRef.current)) { setMessage(t('Здесь нет свободного места.', 'There is not enough free space here.')); return; }
    setMessage(''); change({ ...current, items: moveWithContents(current.items,item,next,effectiveRef.current) });
  }
  const actions = useRef({ select: (_id: string) => {}, move: (_id: string, _x: number, _z: number) => {}, rotate: (_id: string, _r: number) => {}, start: () => {}, end: () => {}, cancel: () => {}, error: (_s: string) => {}, bounds: (_id: string, _b: { widthM: number; depthM: number; heightM: number }) => {} });
  actions.current = {
    select: id => change({ ...layoutRef.current, selected: id }),
    move: (id, x, z) => move(id, { x, z }), rotate: (id, rotation) => move(id, { rotation }),
    start: () => { gesture.current = { ...layoutRef.current, items: layoutRef.current.items.map(i => ({ ...i })) }; },
    end: () => { const before = gesture.current; gesture.current = null; if (before && JSON.stringify(before.items) !== JSON.stringify(layoutRef.current.items)) { setPast(prev => [...prev.slice(-29), before]); setFuture([]); } },
    cancel: () => { if (gesture.current) change(gesture.current); gesture.current = null; setMessage(''); },
    error: value => { setUnavailable(true); if (value !== 'webgl') setMessage(t(`Не удалось загрузить модель: ${value}`, `Unable to load model: ${value}`)); },
    bounds: (id, b) => setBounds(prev => { const old = prev[id]; return old && old.widthM === b.widthM && old.depthM === b.depthM && old.heightM === b.heightM ? prev : { ...prev, [id]: b }; }),
  };

  useLayoutEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.appendChild(host); const background = Array.from(document.body.children).filter(node => node !== host);
    const release=lockBackground(background);
    close.current?.focus({ preventScroll: true });
    const key = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); return; }
      if (event.key !== 'Tab' || !dialog.current) return;
      const nodes = Array.from(dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled),select:not(:disabled),[tabindex="0"]')).filter(n => n.getClientRects().length);
      if (!nodes.length) return; const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); release(); host.remove(); if (previous?.isConnected && !previous.closest('[inert]')) previous.focus({ preventScroll: true }); };
  }, [host]);
  useEffect(() => { let cancelled = false; if (!canvas.current) return;
    const element=canvas.current;
    void import('./fixedInteriorScene').then(({createFixedInteriorScene})=>cancelled?null:createFixedInteriorScene(element, {
      onSelect: id => actions.current.select(id), onMove: (id, x, z) => actions.current.move(id, x, z), onRotate: (id, r) => actions.current.rotate(id, r),
      onGestureStart: () => actions.current.start(), onGestureEnd: () => actions.current.end(), onGestureCancel: () => actions.current.cancel(), onError: value => actions.current.error(value), onBounds: (id, b) => actions.current.bounds(id, b),
    })).then(controller => { if(!controller)return;if (cancelled) { controller.dispose(); return; } scene.current = controller; controller.update(stateRef.current); setReady(true); }).catch(() => { if (!cancelled) setUnavailable(true); });
    return () => { cancelled = true; scene.current?.dispose(); scene.current = null; };
  }, [attempt]);
  useEffect(() => { scene.current?.update({ items: layout.items, products: effectiveProducts, selected: layout.selected ?? null, view }); }, [layout, products, view, bounds]);
  useEffect(() => {
    if (!ready || !measured) return;
    if (layout.items.some(item => { const product = effectiveProducts.find(p => p.id === item.productId); return !product || !fixedCanPlace(item, product, layout.items, effectiveProducts); }))
      setMessage(t('Сохранённые предметы пересекаются с учётом фактической 3D-модели. Переместите или уберите их.', 'Saved items overlap using their actual 3D bounds. Move or remove them.'));
  }, [ready, measured, bounds, layout.items]);
  useEffect(() => { const timer = window.setTimeout(() => save(layout), 180); return () => window.clearTimeout(timer); }, [layout]);
  useEffect(() => () => { if (!protectedStorage.current) { try { localStorage.setItem(FIXED_STORAGE_KEY, JSON.stringify(layoutRef.current)); } catch { /* The on-screen warning covers failed writes while open. */ } } }, []);
  async function add() { const product = products.find(p => p.id === choice); if (!product) return; if (layoutRef.current.items.length >= FIXED_ITEM_LIMIT) { setMessage(t('Можно разместить до восьми предметов.', 'You can place up to eight items.')); return; }
    setAdding(true);
    try { const b = scene.current && ready ? await scene.current.measureProduct(product) : product; const current = layoutRef.current;
      const effective = products.map(p => { const size = p.id === product.id ? b : boundsRef.current[p.id]; return size ? { ...p, widthM: Math.max(p.widthM, size.widthM), depthM: Math.max(p.depthM, size.depthM), heightM: Math.max(p.heightM, size.heightM) } : p; });
      const real = effective.find(p => p.id === product.id)!; const item = findFixedPosition(real, current.items, effective);
      if (!item) { setMessage(t('Для этого предмета нет свободного места.', 'There is no free space for this item.')); return; }
      setMessage(''); change({ ...current, items: [...current.items, item], selected: item.id }, true); setView('top');
    } catch { setMessage(t('Не удалось загрузить модель выбранного товара.', 'Unable to load the selected product model.')); }
    finally { setAdding(false); } }
  function retryStorage() {
    if (!protectedStorage.current) { save(layoutRef.current); return; }
    try {
      const raw = localStorage.getItem(FIXED_STORAGE_KEY), restored = raw ? validateFixedLayout(JSON.parse(raw), products) : null;
      if (!restored) { setStorageError(true); return; }
      protectedStorage.current = false; setProtectedFlag(false); layoutRef.current = restored; setLayout(restored); setStorageError(false);
    } catch { setStorageError(true); }
  }
  function undo() { const previous = past[past.length - 1]; if (!previous) return; setPast(past.slice(0, -1)); setFuture(prev => [...prev, layoutRef.current]); change(previous); setMessage(''); }
  function redo() { const next = future[future.length - 1]; if (!next) return; setFuture(future.slice(0, -1)); setPast(prev => [...prev, layoutRef.current]); change(next); setMessage(''); }
  function keyboard(event: KeyboardEvent<HTMLCanvasElement>) { if (view !== 'top' || !selectedItem) return;
    if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); move(selectedItem.id, { rotation: selectedItem.rotation + (event.key === 'ArrowLeft' ? -1 : 1) * Math.PI / 12 }); }
    else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) { event.preventDefault(); move(selectedItem.id, { x: selectedItem.x + (event.key === 'ArrowRight' ? .05 : event.key === 'ArrowLeft' ? -.05 : 0), z: selectedItem.z + (event.key === 'ArrowDown' ? .05 : event.key === 'ArrowUp' ? -.05 : 0) }); }
  }
  return createPortal(<section className="fint" role="dialog" aria-modal="true" aria-labelledby="fint-title" ref={dialog} data-testid="fixed-interior">
    <header className="fint-header"><div><span>{t('ГОТОВЫЙ ИНТЕРЬЕР', 'READY-MADE ROOM')}</span><h1 id="fint-title">{t('Комната в свете', 'A room in light')}</h1><p>{t('Фиксированная комната · примерно 8,0 × 9,1 м', 'Fixed room · approximately 8.0 × 9.1 m')}</p></div><button ref={close} className="fint-close" onClick={onClose} aria-label={t('Закрыть интерьер', 'Close room')}><X size={22}/></button></header>
    <div className="fint-views" aria-label={t('Вид комнаты', 'Room view')}><button className={view === 'perspective' ? 'active' : ''} aria-pressed={view === 'perspective'} onClick={() => setView('perspective')}>{t('Интерьер', 'Room')}</button><button className={view === 'top' ? 'active' : ''} aria-pressed={view === 'top'} onClick={() => setView('top')}>{t('Вид сверху', 'Plan')}</button>{onCustomRoom && <button className="fint-own" onClick={()=>onCustomRoom(layoutRef.current.items)} aria-label={t('Своя комната', 'My room')}>{t('Своя комната', 'My room')} ↗</button>}</div>
    <div className="fint-stage"><canvas ref={canvas} tabIndex={0} onKeyDown={keyboard} aria-label={t('3D-комната. На плане перемещайте мебель пальцем; для клавиатуры используйте стрелки и Shift со стрелками.', '3D room. Drag furniture on the plan; use arrow keys and Shift with arrows on a keyboard.')} />{(view==='top'||!ready||!measured||unavailable)&&<MeasuredPlan layout={{version:1,room:{width:7.98,depth:9.1,openings:{window:null,door:null}},items:layout.items.map(i=>({...i,x:i.x-.81,z:i.z-1.85}))}} products={effectiveProducts} selected={layout.selected??null} ru={ru} onSelect={id=>actions.current.select(id)} onMove={(id,x,z,r)=>move(id,{x:x+.81,z:z+1.85,...(r===undefined?{}:{rotation:r})})} onStart={()=>actions.current.start()} onEnd={()=>actions.current.end()} onCancel={()=>actions.current.cancel()}/>}
      {view==='perspective'&&(!ready||!measured)&&!unavailable&&<small className="fint-loading" role="status">{t('Загружается интерьер · план доступен','Loading interior · floor plan ready')}</small>}{unavailable && view==='perspective' && <div className="fint-status" role="status">{t('3D-комната недоступна. Расстановка сохранена.', 'The 3D room is unavailable. Your layout remains saved.')}<br/><button onClick={() => { setReady(false); setUnavailable(false); setBounds({}); setMessage(''); setAttempt(n => n + 1); }}>{t('Повторить', 'Retry')}</button></div>}{message && <p className="fint-message" role="status">{message}</p>}</div>
    <div className="fint-content"><p className="fint-hint">{view === 'top' ? t('Перетащите мебель. Пустое место двигает план, два пальца увеличивают его. Для поворота коснитесь предмета и поверните двумя пальцами.', 'Drag furniture. Drag empty space to pan; pinch to zoom. Touch a piece and twist with two fingers to rotate it.') : t('Проведите пальцем, чтобы осмотреть комнату. Два пальца — приблизить.', 'Drag to explore the room; pinch to zoom.')}</p>
      <div className="fint-selection"><span>{selectedProduct ? `${typeLabel(selectedProduct.category,ru)} · ${selectedProduct.name}` : t('Выберите предмет на плане', 'Select an item on the plan')}</span><div><button onClick={undo} disabled={!past.length}>{t('Отменить', 'Undo')}</button><button onClick={redo} disabled={!future.length}>{t('Повторить', 'Redo')}</button>{selectedItem && <button onClick={() => {if(supportedPieces(selectedItem.id,layout.items,effectiveProducts).length){setMessage(t('Сначала переставьте светильник или уберите его.','Move or remove the lamp first.'));return;}change({ ...layout, items: layout.items.filter(i => i.id !== selectedItem.id), selected: null }, true)}}>{t('Убрать', 'Remove')}</button>}</div></div>
      {selectedProduct&&onItem&&<button type="button" className="fint-product-info" onClick={()=>onItem(selectedProduct.id)}>{t('О товаре','Product details')} ↗</button>}
      <div className="fint-add"><label htmlFor="fint-product">{t('Добавить мебель', 'Add furniture')}</label><div><select id="fint-product" value={choice} onChange={event => setChoice(event.target.value)}>{products.map(product => <option key={product.id} value={product.id}>{product.category ? `${typeLabel(product.category,ru)} · ` : ''}{product.name}</option>)}</select><button onClick={() => { void add(); }} disabled={!products.length || adding}>{adding ? t('Загрузка…', 'Loading…') : t('Добавить', 'Add')}</button></div></div>
      {storageError && <p className="fint-storage" role="alert">{protectedFlag ? t('Сохранённая расстановка повреждена. Текущие изменения пока временные; старая запись сохранена.', 'The saved layout is damaged. Changes are temporary; the original data is preserved.') : t('Не удалось восстановить или сохранить расстановку на устройстве.', 'The layout could not be restored or saved on this device.')} <button onClick={retryStorage}>{t('Повторить', 'Retry')}</button>{protectedFlag && <button onClick={() => { protectedStorage.current = false; setProtectedFlag(false); save(layoutRef.current); }}>{t('Заменить сохранение', 'Replace saved layout')}</button>}</p>}
      <p className="fint-note">{t('Это заранее спроектированная комната. Её стены и свет фиксированы; размеры и посадка мебели приблизительны.', 'This is a pre-designed room. Its walls and lighting are fixed; furniture dimensions and fit are approximate.')}</p>
    </div>
  </section>, host);
}
