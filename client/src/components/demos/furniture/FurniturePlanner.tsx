import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus, RotateCcw, RotateCw, Trash2, X } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { createPlannerScene } from './plannerScene';
import { contain, DEFAULT_ROOM, MAX_ITEMS, overlaps, PLANNER_STORAGE_KEY, ROOM_MAX, ROOM_MIN, validProducts, validateLayout, type PlannerItem, type PlannerLayout, type PlannerProduct, type PlannerRoom, type PlannerView } from './plannerTypes';
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
  const sourceProducts = useMemo(() => validProducts(products), [products]);
  const [start] = useState(() => initialLayout(sourceProducts, initialProductId));
  const [layout, setLayout] = useState(start.layout);
  const [selected, setSelected] = useState<string | null>(() => start.layout.items.find(item => item.productId === initialProductId)?.id ?? start.layout.items[0]?.id ?? null);
  const [view, setView] = useState<PlannerView>('top');
  const [choice, setChoice] = useState(initialProductId && sourceProducts.some(p => p.id === initialProductId) ? initialProductId : sourceProducts[0]?.id ?? '');
  const [width, setWidth] = useState(String(layout.room.width));
  const [depth, setDepth] = useState(String(layout.room.depth));
  const [bounds, setBounds] = useState<Bounds>({});
  const [message, setMessage] = useState(() => start.couldNotAdd ? t('Выбранный товар не поместился. План сохранён; освободите место и добавьте его.', 'The selected piece did not fit. Your plan is saved; make space to add it.') : '');
  const [unavailable, setUnavailable] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [failedModels, setFailedModels] = useState<string[]>([]);
  const [historyCount, setHistoryCount] = useState({ undo: 0, redo: 0 });
  const past = useRef<PlannerLayout[]>([]), future = useRef<PlannerLayout[]>([]), dragStart = useRef<PlannerLayout | null>(null);
  const measuredProducts = useMemo(() => sourceProducts.map(product => bounds[product.id] ? { ...product, ...bounds[product.id] } : product), [sourceProducts, bounds]);
  const layoutRef = useRef(layout), productsRef = useRef(measuredProducts);
  layoutRef.current = layout; productsRef.current = measuredProducts;
  const canvas = useRef<HTMLCanvasElement>(null);
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
  function undo() { const previous = past.current.pop(); if (!previous) return; future.current.push(layoutRef.current); layoutRef.current = previous; setLayout(previous); updateHistoryCount(); }
  function redo() { const next = future.current.pop(); if (!next) return; past.current.push(layoutRef.current); layoutRef.current = next; setLayout(next); updateHistoryCount(); }

  useEffect(() => {
    if (!canvas.current) return;
    try {
      scene.current = createPlannerScene(canvas.current, {
        onSelect: setSelected,
        onMove: (itemId, x, z) => { if (loadingRef.current) return; setLayout(current => {
          const item = current.items.find(i => i.id === itemId), product = item && productsRef.current.find(p => p.id === item.productId);
          if (!item || !product) return current;
          const candidate = contain({ ...item, x, z }, product, current.room);
          if (!candidate || !canPlace(candidate, current, productsRef.current)) return current;
          const next = { ...current, items: current.items.map(i => i.id === itemId ? candidate : i) }; layoutRef.current = next; return next;
        }); },
        onDragStart: () => { dragStart.current = layoutRef.current; },
        onDragEnd: () => { if (dragStart.current && JSON.stringify(dragStart.current) !== JSON.stringify(layoutRef.current)) { past.current = [...past.current.slice(-49), dragStart.current]; future.current = []; updateHistoryCount(); } dragStart.current = null; },
        onBounds: (productId, size) => setBounds(current => current[productId] && Math.abs(current[productId].depthM - size.depthM) < 0.0001 ? current : { ...current, [productId]: size }),
        onModelError: (productId, text) => { setFailedModels(current => current.includes(productId) ? current : [...current, productId]); setMessage(text); },
        onError: text => { setMessage(text); if (text.includes('контекст')) setUnavailable(true); },
      });
    } catch { setUnavailable(true); }
    return () => { scene.current?.dispose(); scene.current = null; };
  }, []);

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
  useEffect(() => { const timer = setTimeout(() => { try { localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(layout)); setSaveError(false); } catch { setSaveError(true); } }, 300); return () => clearTimeout(timer); }, [layout]);
  useEffect(() => { if (selected && !layout.items.some(item => item.id === selected)) setSelected(null); }, [layout.items, selected]);
  useEffect(() => { setWidth(String(layout.room.width)); setDepth(String(layout.room.depth)); }, [layout.room.width, layout.room.depth]);

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
    const nextRoom: PlannerRoom = { width: Math.round(w * 100) / 100, depth: Math.round(d * 100) / 100 };
    const valid = validateLayout({ ...layout, room: nextRoom }, measuredProducts);
    if (!valid) { setMessage(t('Предметы не помещаются. Сначала переместите или удалите их.', 'Pieces do not fit. Move or remove them first.')); return; }
    setMessage(''); commit(valid); setWidth(String(nextRoom.width)); setDepth(String(nextRoom.depth));
  }
  function remove() { if (!selected) return; commit({ ...layout, items: layout.items.filter(item => item.id !== selected) }); setSelected(null); setMessage(''); }
  function duplicate() { if (!selectedProduct || loading) return; if (layout.items.length >= MAX_ITEMS) { setMessage(t('Можно разместить до 12 предметов.', 'You can place up to 12 pieces.')); return; } const item = findSpot(selectedProduct, layout, measuredProducts); if (!item) { setMessage(t('Не нашлось свободного места.', 'No free floor space found.')); return; } commit({ ...layout, items: [...layout.items, item] }); setSelected(item.id); setView('top'); setMessage(''); }

  return <section className="fpl" aria-label={t('Планировщик комнаты', 'Room planner')} data-testid="furniture-planner">
    <header className="fpl-header"><div><p>{t('ПЛАНИРОВЩИК / 3D', 'ROOM PLANNER / 3D')}</p><h1>{t('ВАША КОМНАТА', 'YOUR ROOM')}</h1></div><button type="button" onClick={() => { try { localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(layoutRef.current)); } catch { /* Other store interactions remain available. */ } onClose(); }} aria-label={t('Закрыть планировщик', 'Close planner')}><X size={22} /></button></header>
    <div className="fpl-room-meta"><span>{t('Комната', 'Room')} · {layout.room.width} × {layout.room.depth} {t('м', 'm')}</span><span>{t('Предметов', 'Pieces')}: {layout.items.length}</span></div>
    <div className="fpl-toolbar"><div className="fpl-views" role="group" aria-label={t('Вид комнаты', 'Room view')}><button type="button" aria-pressed={view === 'top'} onClick={() => setView('top')}>{t('Вид сверху', 'Top view')}</button><button type="button" aria-pressed={view === 'perspective'} onClick={() => setView('perspective')}>{t('Интерьер', 'Room view')}</button></div><div className="fpl-history"><button type="button" onClick={undo} disabled={!historyCount.undo} aria-label={t('Отменить действие', 'Undo')}><RotateCcw size={17}/></button><button type="button" onClick={redo} disabled={!historyCount.redo} aria-label={t('Повторить действие', 'Redo')}><RotateCw size={17}/></button></div></div>
    <div className="fpl-stage"><canvas ref={canvas} aria-label={t('Трёхмерная комната. В виде сверху выберите и перетащите предмет.', 'Three-dimensional room. In top view, select and drag a piece.')} />{unavailable && <div className="fpl-unavailable" role="status">{t('3D недоступно на этом устройстве. Сохранённый план останется на устройстве.', '3D is unavailable on this device. Your saved plan remains on this device.')}</div>}</div>
    <p className="fpl-hint">{view === 'top' ? t('Выберите предмет и переместите его по полу. Для прокрутки страницы проведите за пределами комнаты.', 'Select a piece and drag it across the floor. Scroll the page outside the room.') : t('Вращайте комнату пальцем, масштабируйте двумя пальцами. Для прокрутки страницы проведите за пределами комнаты.', 'Drag to orbit the room; pinch to zoom. Scroll the page outside the room.')}</p>
    <p className="fpl-disclaimer">{t('Размеры и посадка 3D приблизительные; проверяйте перед покупкой.', '3D dimensions and fit are approximate; verify before purchasing.')}</p>
    <div className="fpl-section-heading"><h2>{t('Размеры комнаты', 'Room dimensions')}</h2><span>{t('метры', 'metres')}</span></div>
    <div className="fpl-room"><label>{t('Ширина, м', 'Width, m')}<input type="number" min={ROOM_MIN} max={ROOM_MAX} step="0.1" value={width} onChange={event => setWidth(event.target.value)} /></label><label>{t('Глубина, м', 'Depth, m')}<input type="number" min={ROOM_MIN} max={ROOM_MAX} step="0.1" value={depth} onChange={event => setDepth(event.target.value)} /></label><button type="button" onClick={changeRoom} disabled={loading}>{t('Применить', 'Apply')}</button></div>
    <div className="fpl-section-heading fpl-furniture-heading"><h2>{t('Мебель в комнате', 'Pieces in your room')}</h2><span>{layout.items.length} / {MAX_ITEMS}</span></div>
    <div className="fpl-add"><label htmlFor="fpl-product">{t('Добавить предмет', 'Add a piece')}</label><div><select id="fpl-product" value={choice} onChange={event => setChoice(event.target.value)} disabled={!sourceProducts.length}>{sourceProducts.map(product => <option value={product.id} key={product.id}>{product.name}</option>)}</select><button type="button" onClick={add} disabled={!choice || loading}><Plus size={17} /> {t('Добавить', 'Add')}</button></div></div>
    <div className="fpl-items" role="group" aria-label={t('Предметы в комнате', 'Pieces in the room')}>{layout.items.map((item, index) => { const product = measuredProducts.find(p => p.id === item.productId); return product && <button type="button" key={item.id} aria-pressed={selected === item.id} aria-label={`${product.name}, ${t('предмет', 'piece')} ${index + 1}`} onClick={() => { setSelected(item.id); setView('top'); }}>{product.name} · {index + 1}</button>; })}</div>
    {selectedItem && selectedProduct && <div className="fpl-edit"><div className="fpl-edit-title"><div><span>{t('ВЫБРАННЫЙ ПРЕДМЕТ', 'SELECTED PIECE')}</span><strong>{selectedProduct.name}</strong></div><button type="button" onClick={remove} aria-label={t('Удалить выбранный предмет', 'Remove selected piece')}><Trash2 size={18} /></button></div><p className="fpl-edit-caption">{t('Перемещение · поворот · копия', 'Move · rotate · duplicate')}</p><div className="fpl-edit-controls" role="group" aria-label={t('Переместить и повернуть', 'Move and rotate')}><button type="button" disabled={loading} onClick={() => changeItem({ x: selectedItem.x - 0.1 })} aria-label={t('Сдвинуть влево на 10 см', 'Move left 10 cm')}><ArrowLeft size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ z: selectedItem.z - 0.1 })} aria-label={t('Сдвинуть вверх на 10 см', 'Move up 10 cm')}><ArrowUp size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ z: selectedItem.z + 0.1 })} aria-label={t('Сдвинуть вниз на 10 см', 'Move down 10 cm')}><ArrowDown size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ x: selectedItem.x + 0.1 })} aria-label={t('Сдвинуть вправо на 10 см', 'Move right 10 cm')}><ArrowRight size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ rotation: selectedItem.rotation - Math.PI / 12 })} aria-label={t('Повернуть влево на 15 градусов', 'Rotate left 15 degrees')}><RotateCcw size={17} /></button><button type="button" disabled={loading} onClick={() => changeItem({ rotation: selectedItem.rotation + Math.PI / 12 })} aria-label={t('Повернуть вправо на 15 градусов', 'Rotate right 15 degrees')}><RotateCw size={17} /></button><button type="button" disabled={loading} onClick={duplicate} aria-label={t('Дублировать выбранный предмет', 'Duplicate selected piece')}><Plus size={17} /></button></div></div>}
    {loading && <p className="fpl-status" role="status">{t('Загружаем и измеряем 3D-модели…', 'Loading and measuring 3D models…')}</p>}
    {message && <p className="fpl-status" role="status">{message}</p>}
    {saveError && <p className="fpl-status" role="alert">{t('Не удалось сохранить план на устройстве.', 'Could not save this plan on your device.')}</p>}
    {handoffLines.length > 0 && <a className="fpl-handoff" href={handoffUrl} target="_blank" rel="noopener noreferrer" onClick={event => { if (window.Telegram?.WebApp?.openTelegramLink) { try { window.Telegram.WebApp.openTelegramLink(handoffUrl); event.preventDefault(); } catch { /* Leave the normal link available. */ } } }}>{t('Обсудить расстановку', 'Discuss this arrangement')} <ArrowRight size={16} /></a>}
    <p className="fpl-save">{t('План сохраняется только на этом устройстве.', 'Your plan is saved only on this device.')}</p>
  </section>;
}
