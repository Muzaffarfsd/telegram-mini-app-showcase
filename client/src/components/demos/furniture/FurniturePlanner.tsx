import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus, RotateCcw, RotateCw, Trash2, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { createPlannerScene } from './plannerScene';
import { contain, DEFAULT_ROOM, doorApproachOccupied, MAX_ITEMS, overlaps, PLANNER_STORAGE_KEY, ROOM_MAX, ROOM_MIN, roomOpenings, validOpenings, validProducts, validateLayout, type PlannerItem, type PlannerLayout, type PlannerProduct, type PlannerRoom, type PlannerView } from './plannerTypes';
import './FurniturePlanner.css';

export type { PlannerProduct } from './plannerTypes';
export type FurniturePlannerProps = { products: readonly PlannerProduct[]; initialProductId?: string; onClose: () => void };
type Bounds = Record<string, { widthM: number; depthM: number; heightM: number }>;
const id = () => globalThis.crypto?.randomUUID?.() ?? `item-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function canPlace(candidate: PlannerItem, layout: PlannerLayout, products: readonly PlannerProduct[]) {
  const product = products.find(p => p.id === candidate.productId); if (!product) return false;
  const bounded = contain(candidate, product, layout.room);
  if (!bounded || Math.abs(bounded.x - candidate.x) > 0.0001 || Math.abs(bounded.z - candidate.z) > 0.0001) return false;
  return !layout.items.some(other => other.id !== candidate.id && overlaps(candidate, product, other, products.find(p => p.id === other.productId)!));
}
function findSpot(product: PlannerProduct, layout: PlannerLayout, products: readonly PlannerProduct[]): PlannerItem | null {
  const item = { id: id(), productId: product.id, x: 0, z: 0, rotation: 0 };
  const preferred = [[0, -0.9], [-1.5, 0.6], [0, 1.25], [1.5, 0.5], [0, 0]];
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
  const choices = [first, products[1], products[products.length - 1]].filter((p, i, all): p is PlannerProduct => !!p && all.findIndex(other => other?.id === p.id) === i);
  for (const product of choices) { const item = findSpot(product, layout, products); if (item) layout = { ...layout, items: [...layout.items, item] }; }
  return { layout, couldNotAdd: false };
}

export default function FurniturePlanner({ products, initialProductId, onClose }: FurniturePlannerProps) {
  const { language } = useLanguage(), ru = language === 'ru';
  const t = (r: string, e: string) => ru ? r : e;
  const pieceLabel = (product: PlannerProduct) => {
    const category = product.category && ({ 'Диваны': t('Диван', 'Sofa'), 'Кресла': t('Кресло', 'Armchair'), 'Столы': t('Стол', 'Table') } as Record<string, string>)[product.category];
    return category ? `${category} · ${product.name}` : product.name;
  };
  const sourceProducts = useMemo(() => validProducts(products), [products]);
  const [start] = useState(() => initialLayout(sourceProducts, initialProductId));
  const [layout, setLayout] = useState(start.layout);
  const [selected, setSelected] = useState<string | null>(() => start.layout.items.find(item => item.productId === initialProductId)?.id ?? start.layout.items[0]?.id ?? null);
  const [view, setView] = useState<PlannerView>('top');
  const [insideView, setInsideView] = useState(false);
  const [choice, setChoice] = useState(initialProductId && sourceProducts.some(p => p.id === initialProductId) ? initialProductId : sourceProducts[0]?.id ?? '');
  const [width, setWidth] = useState(String(layout.room.width));
  const [depth, setDepth] = useState(String(layout.room.depth));
  const [openingDraft, setOpeningDraft] = useState(() => {
    const openings = roomOpenings(start.layout.room);
    return { windowEnabled: !!openings.window, windowStart: String(openings.window?.start.toFixed(2) ?? '0.2'), windowWidth: String(openings.window?.width.toFixed(2) ?? '1.2'), doorEnabled: !!openings.door, doorStart: String(openings.door?.start.toFixed(2) ?? '0.15'), doorWidth: String(openings.door?.width.toFixed(2) ?? '0.8') };
  });
  const [openingError, setOpeningError] = useState('');
  const [bounds, setBounds] = useState<Bounds>({});
  const [message, setMessage] = useState(() => start.couldNotAdd ? t('Выбранный товар не поместился. План сохранён; освободите место и добавьте его.', 'The selected piece did not fit. Your plan is saved; make space to add it.') : '');
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
  const handoff = ru
    ? `Здравствуйте! Хочу обсудить расстановку мебели в комнате ${layout.room.width} × ${layout.room.depth} м. Предметы: ${handoffLines.map(row => `${row.product.name} — ${row.quantity} шт.`).join('; ')}.`
    : `Hello! I'd like to discuss a furniture arrangement for a ${layout.room.width} × ${layout.room.depth} m room. Pieces: ${handoffLines.map(row => `${row.product.name} × ${row.quantity}`).join('; ')}.`;
  const handoffUrl = 'https://t.me/web4tgs?text=' + encodeURIComponent(handoff);
  const loading = layout.items.some(item => !bounds[item.productId] && !failedModels.includes(item.productId));
  const loadingRef = useRef(loading); loadingRef.current = loading;
  const updateHistoryCount = () => setHistoryCount({ undo: past.current.length, redo: future.current.length });
  function commit(next: PlannerLayout) {
    past.current = [...past.current.slice(-49), layoutRef.current]; future.current = [];
    layoutRef.current = next; setLayout(next); updateHistoryCount();
  }
  function undo() { const previous = past.current.pop(); if (!previous) return; future.current.push(layoutRef.current); layoutRef.current = previous; setLayout(previous); setDragMessage(''); updateHistoryCount(); }
  function redo() { const next = future.current.pop(); if (!next) return; past.current.push(layoutRef.current); layoutRef.current = next; setLayout(next); setDragMessage(''); updateHistoryCount(); }

  useEffect(() => {
    if (!canvas.current) return;
    try {
      scene.current = createPlannerScene(canvas.current, {
        onSelect: value => { setSelected(value); setDragMessage(''); },
        onMove: (itemId, x, z) => {
          if (loadingRef.current) return;
          const current = layoutRef.current;
          const item = current.items.find(i => i.id === itemId), product = item && productsRef.current.find(p => p.id === item.productId);
          if (!item || !product) return;
          const candidate = contain({ ...item, x, z }, product, current.room);
          if (!candidate || !canPlace(candidate, current, productsRef.current)) {
            setDragMessage(ruRef.current ? 'Здесь недостаточно места' : 'Not enough space here');
            return;
          }
          const againstWall = Math.abs(candidate.x - x) > 0.01 || Math.abs(candidate.z - z) > 0.01;
          setDragMessage(againstWall ? (ruRef.current ? 'Граница комнаты' : 'Room boundary') : '');
          const next = { ...current, items: current.items.map(i => i.id === itemId ? candidate : i) };
          layoutRef.current = next; setLayout(next);
        },
        onDragStart: () => { setDragMessage(''); dragStart.current = layoutRef.current; },
        onDragEnd: () => { if (dragStart.current && JSON.stringify(dragStart.current) !== JSON.stringify(layoutRef.current)) { past.current = [...past.current.slice(-49), dragStart.current]; future.current = []; updateHistoryCount(); } dragStart.current = null; },
        onBounds: (productId, size) => setBounds(current => current[productId] && Math.abs(current[productId].depthM - size.depthM) < 0.0001 ? current : { ...current, [productId]: size }),
        onModelError: (productId, text) => { setFailedModels(current => current.includes(productId) ? current : [...current, productId]); const product = productsRef.current.find(p => p.id === productId); setMessage(ruRef.current ? text : `Could not load the 3D model${product ? `: ${product.name}` : '.'}`); },
        onError: text => { setMessage(ruRef.current ? text : text.includes('контекст') ? '3D is unavailable. Your plan is saved on this device.' : 'Could not load the 3D model.'); if (text.includes('контекст')) setUnavailable(true); },
      });
    } catch { setUnavailable(true); }
    return () => { scene.current?.dispose(); scene.current = null; };
  }, []);

  useLayoutEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const background = Array.from(document.body.children).filter((node): node is HTMLElement => node instanceof HTMLElement && node !== panel.current);
    const inertBefore = background.map(node => node.inert);
    background.forEach(node => { node.inert = true; });
    closeButton.current?.focus({ preventScroll: true });
    return () => {
      background.forEach((node, index) => { node.inert = inertBefore[index]; });
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        try { localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(layoutRef.current)); } catch { /* Keep the current plan until closed. */ }
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

  // Once measured GLB bounds arrive, keep the floor plan within those actual bounds.
  useEffect(() => {
    if (!Object.keys(bounds).length || layoutRef.current.items.some(item => !bounds[item.productId] && !failedModels.includes(item.productId))) return;
    setLayout(current => {
      let result: PlannerLayout = { ...current, items: [] }, changed = false;
      for (const item of current.items) {
        const product = measuredProducts.find(p => p.id === item.productId); if (!product) { changed = true; continue; }
        const adjusted = contain(item, product, current.room);
        const next = adjusted && canPlace(adjusted, result, measuredProducts) ? adjusted : findSpot(product, result, measuredProducts);
        if (!next) { changed = true; continue; }
        const retained = { ...next, id: item.id };
        if (retained.x !== item.x || retained.z !== item.z) changed = true;
        result = { ...result, items: [...result.items, retained] };
      }
      if (changed) { setMessage(t('Некоторые предметы перемещены или убраны по фактическим размерам 3D-моделей.', 'Some pieces were moved or removed to fit their 3D dimensions.')); return result; }
      return current;
    });
  }, [bounds, measuredProducts, failedModels]);

  useEffect(() => { scene.current?.update({ room: layout.room, items: layout.items, products: measuredProducts, selected, view }); }, [layout, measuredProducts, selected, view]);
  useEffect(() => { setInsideView(false); setDragMessage(''); }, [view]);
  useEffect(() => { setInsideView(false); }, [layout.room.width, layout.room.depth, selected]);
  useEffect(() => { const timer = setTimeout(() => { try { localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(layout)); setSaveError(false); } catch { setSaveError(true); } }, 300); return () => clearTimeout(timer); }, [layout]);
  // Browser/Telegram Back can unmount the editor before the debounced save.
  useEffect(() => () => { try { localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(layoutRef.current)); } catch { /* A visible warning is shown while the editor is open. */ } }, []);
  useEffect(() => { if (selected && !layout.items.some(item => item.id === selected)) setSelected(null); }, [layout.items, selected]);
  useEffect(() => { setWidth(String(layout.room.width)); setDepth(String(layout.room.depth)); }, [layout.room.width, layout.room.depth]);
  useEffect(() => {
    const openings = roomOpenings(layout.room);
    setOpeningDraft({ windowEnabled: !!openings.window, windowStart: String(openings.window?.start.toFixed(2) ?? '0.2'), windowWidth: String(openings.window?.width.toFixed(2) ?? '1.2'), doorEnabled: !!openings.door, doorStart: String(openings.door?.start.toFixed(2) ?? '0.15'), doorWidth: String(openings.door?.width.toFixed(2) ?? '0.8') });
    setOpeningError('');
  }, [layout.room]);

  function changeItem(change: Partial<PlannerItem>) {
    if (!selectedItem || !selectedProduct || loading) return;
    const next = contain({ ...selectedItem, ...change }, selectedProduct, layout.room);
    if (!next || !canPlace(next, layout, measuredProducts)) { setMessage(t('Здесь недостаточно места: проверьте границы и соседние предметы.', 'Not enough space here: check the room edges and other pieces.')); return; }
    setMessage(''); commit({ ...layout, items: layout.items.map(item => item.id === selected ? next : item) });
  }
  function add() {
    const product = measuredProducts.find(p => p.id === choice);
    if (!product || layout.items.length >= MAX_ITEMS) { setMessage(t('Можно разместить до 12 предметов.', 'You can place up to 12 pieces.')); return; }
    const item = findSpot(product, layout, measuredProducts);
    if (!item) { setMessage(t('Не нашлось свободного места.', 'No free floor space found.')); return; }
    setMessage(''); commit({ ...layout, items: [...layout.items, item] }); setSelected(item.id); setView('top');
  }
  function changeRoom() {
    const w = Number(width.replace(',', '.')), d = Number(depth.replace(',', '.'));
    if (![w, d].every(n => Number.isFinite(n) && n >= ROOM_MIN && n <= ROOM_MAX)) { setMessage(t('Размеры комнаты: от 2 до 8 метров.', 'Room dimensions must be between 2 and 8 metres.')); return; }
    const nextRoom: PlannerRoom = { ...layout.room, width: Math.round(w * 100) / 100, depth: Math.round(d * 100) / 100 };
    if (!validOpenings(nextRoom)) { setMessage(t('Проёмы не помещаются на стене. Сначала измените их размеры или положение.', 'The openings do not fit on this wall. Change their size or position first.')); return; }
    const valid = validateLayout({ ...layout, room: nextRoom }, measuredProducts);
    if (!valid) { setMessage(t('Предметы не помещаются. Сначала переместите или удалите их.', 'Pieces do not fit. Move or remove them first.')); return; }
    setMessage(''); commit(valid); setWidth(String(nextRoom.width)); setDepth(String(nextRoom.depth));
  }
  function changeOpenings() {
    const number = (value: string) => value.trim() === '' ? NaN : Math.round(Number(value.replace(',', '.')) * 100) / 100;
    const room: PlannerRoom = { ...layout.room, openings: {
      window: openingDraft.windowEnabled ? { start: number(openingDraft.windowStart), width: number(openingDraft.windowWidth) } : null,
      door: openingDraft.doorEnabled ? { start: number(openingDraft.doorStart), width: number(openingDraft.doorWidth) } : null,
    } };
    if (!validOpenings(room)) { setOpeningError(t('Проверьте размеры и положение: отступ от края и между проёмами — не меньше 10 см; окно от 0,4 м, проход от 0,6 м.', 'Check size and position: allow 10 cm from corners and between openings; window at least 0.4 m, doorway at least 0.6 m.')); return; }
    const valid = validateLayout({ ...layout, room }, measuredProducts);
    if (!valid) { setOpeningError(t('Не удалось применить проёмы: проверьте размещение мебели.', 'Could not apply openings: check furniture placement.')); return; }
    setOpeningError(''); setMessage('');
    if (JSON.stringify(layout.room.openings) !== JSON.stringify(room.openings)) commit(valid);
  }
  function remove() { if (!selected) return; commit({ ...layout, items: layout.items.filter(item => item.id !== selected) }); setSelected(null); setMessage(''); }
  function duplicate() { if (!selectedProduct || loading) return; if (layout.items.length >= MAX_ITEMS) { setMessage(t('Можно разместить до 12 предметов.', 'You can place up to 12 pieces.')); return; } const item = findSpot(selectedProduct, layout, measuredProducts); if (!item) { setMessage(t('Не нашлось свободного места.', 'No free floor space found.')); return; } commit({ ...layout, items: [...layout.items, item] }); setSelected(item.id); setView('top'); setMessage(''); }

  return createPortal(<section ref={panel} className="fpl" role="dialog" aria-modal="true" aria-labelledby="fpl-title" data-testid="furniture-planner">
    <header className="fpl-header"><div><p>{t('ПЛАНИРОВЩИК / 3D', 'ROOM PLANNER / 3D')}</p><h1 id="fpl-title">{t('ВАША КОМНАТА', 'YOUR ROOM')}</h1></div><button ref={closeButton} type="button" onClick={() => { try { localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(layoutRef.current)); } catch { /* Other store interactions remain available. */ } onClose(); }} aria-label={t('Закрыть планировщик', 'Close planner')}><X size={22} /></button></header>
    <div className="fpl-room-meta"><span>{t('Комната', 'Room')} · {layout.room.width} × {layout.room.depth} {t('м', 'm')}</span><span>{t('Предметов', 'Pieces')}: {layout.items.length}</span></div>
    <div className="fpl-toolbar"><div className="fpl-views" role="group" aria-label={t('Вид комнаты', 'Room view')}><button type="button" aria-pressed={view === 'top'} onClick={() => setView('top')}>{t('Вид сверху', 'Top view')}</button><button type="button" aria-pressed={view === 'perspective'} onClick={() => setView('perspective')}>{t('Интерьер', 'Room view')}</button></div><div className="fpl-history"><button type="button" onClick={undo} disabled={!historyCount.undo} aria-label={t('Отменить действие', 'Undo')}><RotateCcw size={17}/></button><button type="button" onClick={redo} disabled={!historyCount.redo} aria-label={t('Повторить действие', 'Redo')}><RotateCw size={17}/></button></div></div>
    <div className="fpl-stage"><canvas ref={canvas} aria-label={t('Трёхмерная комната. В виде сверху выберите и перетащите предмет.', 'Three-dimensional room. In top view, select and drag a piece.')} />{view === 'top' && !unavailable && <button className="fpl-reset-view" type="button" onClick={() => scene.current?.resetPlanView()} aria-label={t('Сбросить вид плана', 'Reset plan view')} title={t('Сбросить вид плана', 'Reset plan view')}><RotateCcw size={18}/></button>}{view === 'perspective' && !unavailable && <button className="fpl-inside-view" type="button" onClick={() => { if (insideView) { scene.current?.showRoomOverview(); setInsideView(false); setDragMessage(''); return; } const positioned = scene.current?.showInside(); setInsideView(Boolean(positioned)); setDragMessage(positioned ? '' : t('Не удалось найти свободный ракурс', 'No clear viewpoint found')); }}>{insideView ? t('Общий вид', 'Overview') : t('Вид из комнаты', 'View inside')}</button>}{dragMessage && <p className="fpl-drag-feedback" role="status">{dragMessage}</p>}{unavailable && <div className="fpl-unavailable" role="status">{t('3D недоступно на этом устройстве. Сохранённый план останется на устройстве.', '3D is unavailable on this device. Your saved plan remains on this device.')}</div>}</div>
    <div className="fpl-items" role="group" aria-label={t('Предметы в комнате', 'Pieces in the room')}>{layout.items.map((item, index) => { const product = measuredProducts.find(p => p.id === item.productId); return product && <button type="button" key={item.id} aria-pressed={selected === item.id} aria-label={`${pieceLabel(product)}, ${t('предмет', 'piece')} ${index + 1}`} onClick={() => { setSelected(item.id); setView('top'); }}>{pieceLabel(product)} · {index + 1}</button>; })}</div>
    {selectedItem && selectedProduct && <div className="fpl-edit"><div className="fpl-edit-controls" role="group" aria-label={t('Переместить и повернуть', 'Move and rotate')}><button type="button" disabled={loading} onClick={() => changeItem({ x: selectedItem.x - 0.1 })} aria-label={t('Сдвинуть влево на 10 см', 'Move left 10 cm')}><ArrowLeft size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ z: selectedItem.z - 0.1 })} aria-label={t('Сдвинуть вверх на 10 см', 'Move up 10 cm')}><ArrowUp size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ z: selectedItem.z + 0.1 })} aria-label={t('Сдвинуть вниз на 10 см', 'Move down 10 cm')}><ArrowDown size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ x: selectedItem.x + 0.1 })} aria-label={t('Сдвинуть вправо на 10 см', 'Move right 10 cm')}><ArrowRight size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ rotation: selectedItem.rotation - Math.PI / 12 })} aria-label={t('Повернуть влево на 15 градусов', 'Rotate left 15 degrees')}><RotateCcw size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ rotation: selectedItem.rotation + Math.PI / 12 })} aria-label={t('Повернуть вправо на 15 градусов', 'Rotate right 15 degrees')}><RotateCw size={17} /></button><button type="button" disabled={loading} onClick={duplicate} aria-label={t('Дублировать выбранный предмет', 'Duplicate selected piece')}><Plus size={17} /></button><button type="button" onClick={remove} aria-label={t('Удалить выбранный предмет', 'Remove selected piece')}><Trash2 size={17} /></button></div></div>}
    <p className="fpl-hint">{view === 'top' ? t('Перетащите предмет. Чтобы приблизить план, разведите два пальца.', 'Drag a piece. Pinch with two fingers to zoom the plan.') : t('Вращайте комнату пальцем, масштабируйте двумя пальцами. Для прокрутки страницы проведите за пределами комнаты.', 'Drag to orbit the room; pinch to zoom. Scroll the page outside the room.')}</p>
    {doorApproachOccupied(layout.room, layout.items, measuredProducts) && <p className="fpl-status" role="status">{t('Мебель находится у проёма. Проверьте проход вручную: зона 0,8 м показана приблизительно.', 'Furniture is near the doorway. Check the passage yourself: the 0.8 m approach zone is approximate.')}</p>}
    <p className="fpl-disclaimer">{t('Размеры и посадка 3D приблизительные; проверяйте перед покупкой.', '3D dimensions and fit are approximate; verify before purchasing.')}</p>
    <div className="fpl-section-heading"><h2>{t('Размеры комнаты', 'Room dimensions')}</h2><span>{t('метры', 'metres')}</span></div>
    <div className="fpl-room"><label>{t('Ширина, м', 'Width, m')}<input type="number" min={ROOM_MIN} max={ROOM_MAX} step="0.1" value={width} onChange={event => setWidth(event.target.value)} /></label><label>{t('Глубина, м', 'Depth, m')}<input type="number" min={ROOM_MIN} max={ROOM_MAX} step="0.1" value={depth} onChange={event => setDepth(event.target.value)} /></label><button type="button" onClick={changeRoom} disabled={loading}>{t('Применить', 'Apply')}</button></div>
    <details className="fpl-openings">
      <summary>{t('Окно и дверной проём', 'Window and doorway')}</summary>
      <p>{t('Дальняя стена на плане. Положение измеряется от левого угла стены.', 'Back wall in the plan. Position is measured from the left corner.')}</p>
      <fieldset><legend>{t('Окно', 'Window')}</legend>
        <label className="fpl-openings-toggle"><input type="checkbox" checked={openingDraft.windowEnabled} onChange={event => setOpeningDraft(draft => ({ ...draft, windowEnabled: event.target.checked }))} />{t('Показать окно', 'Show window')}</label>
        {openingDraft.windowEnabled && <div className="fpl-openings-fields"><label>{t('Окно: отступ слева, м', 'Window: left offset, m')}<input type="number" min="0.1" max="8" step="0.05" value={openingDraft.windowStart} onChange={event => setOpeningDraft(draft => ({ ...draft, windowStart: event.target.value }))} /></label><label>{t('Ширина окна, м', 'Window width, m')}<input type="number" min="0.4" max="3" step="0.05" value={openingDraft.windowWidth} onChange={event => setOpeningDraft(draft => ({ ...draft, windowWidth: event.target.value }))} /></label></div>}
      </fieldset>
      <fieldset><legend>{t('Дверной проём', 'Doorway')}</legend>
        <label className="fpl-openings-toggle"><input type="checkbox" checked={openingDraft.doorEnabled} onChange={event => setOpeningDraft(draft => ({ ...draft, doorEnabled: event.target.checked }))} />{t('Показать проём', 'Show doorway')}</label>
        {openingDraft.doorEnabled && <div className="fpl-openings-fields"><label>{t('Проём: отступ слева, м', 'Doorway: left offset, m')}<input type="number" min="0.1" max="8" step="0.05" value={openingDraft.doorStart} onChange={event => setOpeningDraft(draft => ({ ...draft, doorStart: event.target.value }))} /></label><label>{t('Ширина проёма, м', 'Doorway width, m')}<input type="number" min="0.6" max="3" step="0.05" value={openingDraft.doorWidth} onChange={event => setOpeningDraft(draft => ({ ...draft, doorWidth: event.target.value }))} /></label></div>}
      </fieldset>
      <p>{t('На плане окно отмечено синим, проход — коричневым. Подоконник 0,43 м, верх окна 2,22 м, высота проёма 2,1 м. Дверное полотно и его открывание не моделируются.', 'On the plan, blue marks the window and brown the doorway. Window sill is 0.43 m, top is 2.22 m; doorway height is 2.1 m. The door leaf and swing are not modelled.')}</p>
      <button type="button" disabled={loading} onClick={changeOpenings}>{t('Применить проёмы', 'Apply openings')}</button>
      {openingError && <p className="fpl-opening-error" role="alert">{openingError}</p>}
    </details>
    <div className="fpl-section-heading fpl-furniture-heading"><h2>{t('Мебель в комнате', 'Pieces in your room')}</h2><span>{layout.items.length} / {MAX_ITEMS}</span></div>
    <div className="fpl-add"><label htmlFor="fpl-product">{t('Добавить предмет', 'Add a piece')}</label><div><select id="fpl-product" value={choice} onChange={event => setChoice(event.target.value)} disabled={!sourceProducts.length}>{sourceProducts.map(product => <option value={product.id} key={product.id}>{pieceLabel(product)}</option>)}</select><button type="button" onClick={add} disabled={!choice || loading}><Plus size={17} /> {t('Добавить', 'Add')}</button></div></div>
    {loading && <p className="fpl-status" role="status">{t('Загружаем и измеряем 3D-модели…', 'Loading and measuring 3D models…')}</p>}
    {message && <p className="fpl-status" role="status">{message}</p>}
    {saveError && <p className="fpl-status" role="alert">{t('Не удалось сохранить план на устройстве.', 'Could not save this plan on your device.')}</p>}
    {handoffLines.length > 0 && <a className="fpl-handoff" href={handoffUrl} target="_blank" rel="noopener noreferrer" onClick={event => { if (window.Telegram?.WebApp?.openTelegramLink) { try { window.Telegram.WebApp.openTelegramLink(handoffUrl); event.preventDefault(); } catch { /* Leave the normal link available. */ } } }}>{t('Обсудить расстановку', 'Discuss this arrangement')} <ArrowRight size={16} /></a>}
    <p className="fpl-save">{t('План сохраняется только на этом устройстве.', 'Your plan is saved only on this device.')}</p>
  </section>, document.body);
}
