import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import './RoyalStepShopping.css';

export type RoyalCartLine = { id: string; size: number; quantity: number; name?: string; unitPrice?: number };
export type RoyalOrder = { id: string; items: RoyalCartLine[]; total: number; date: string; delivery: string };
export type RoyalProduct = { id: string; name: string; price: number; image: string; sizes: number[] };

/** Keep both lines unchanged when merging would exceed the per-line limit. */
export function changeRoyalCartSize(cart: RoyalCartLine[], id: string, from: number, to: number, sizes: number[]) {
  if (!sizes.includes(to)) return { cart, error: 'Этот размер недоступен в демо.' };
  if (from === to) return { cart, error: '' };
  const source = cart.find(line => line.id === id && line.size === from);
  if (!source) return { cart, error: 'Товар больше не найден в корзине.' };
  const target = cart.find(line => line.id === id && line.size === to);
  if (target && target.quantity + source.quantity > 10) return { cart, error: 'В одной позиции может быть не более 10 пар. Уменьшите количество и попробуйте снова.' };
  if (!target) return { cart: cart.map(line => line === source ? { ...line, size: to } : line), error: '' };
  return { cart: cart.filter(line => line !== source).map(line => line === target ? { ...line, quantity: target.quantity + source.quantity } : line), error: '' };
}

/** Restore only currently valid lines; never silently drop units above the cap. */
export function repeatRoyalOrder(cart: RoyalCartLine[], order: RoyalOrder, products: RoyalProduct[]) {
  let next = cart.map(line => ({ ...line }));
  let added = 0;
  let skipped = 0;
  for (const line of Array.isArray(order.items) ? order.items : []) {
    const product = products.find(p => p.id === line.id);
    if (!product || !product.sizes.includes(line.size) || !Number.isInteger(line.quantity) || line.quantity < 1) { skipped++; continue; }
    const existing = next.find(item => item.id === line.id && item.size === line.size);
    const space = 10 - (existing?.quantity || 0);
    const quantity = Math.min(space, line.quantity);
    if (quantity > 0) {
      if (existing) existing.quantity += quantity;
      else next.push({ id: line.id, size: line.size, quantity });
      added += quantity;
    }
    if (quantity < line.quantity) skipped++;
  }
  return { cart: next, added, skipped };
}

const sizeKey = 'royal-step-preferred-size-v1';
export function useRoyalPreferredSize() {
  const [preferred, setPreferred] = useState<number | null>(() => {
    try { const value = Number(localStorage.getItem(sizeKey)); return Number.isFinite(value) && value >= 30 && value <= 60 ? value : null; } catch { return null; }
  });
  const savePreferred = (value: number | null) => {
    setPreferred(value);
    try { if (value === null) localStorage.removeItem(sizeKey); else localStorage.setItem(sizeKey, String(value)); return true; } catch { return false; }
  };
  return { preferred, savePreferred };
}

export function RoyalSizeGuide({ preferred, onSave }: { preferred: number | null; onSave: (size: number | null) => boolean | void }) {
  const [draft, setDraft] = useState(preferred?.toString() || '');
  const [chart, setChart] = useState<'men' | 'women'>('men');
  const [saveMessage, setSaveMessage] = useState('');
  useEffect(() => { setDraft(preferred?.toString() || ''); }, [preferred]);
  return <details className="rs-size-guide">
    <summary><span>Как выбрать размер <small>Измерьте стопу и сравните с таблицей Nike</small></span><ChevronDown size={18}/></summary>
    <div className="rs-size-guide__body">
      <div className="rs-size-guide__visual" aria-hidden="true">
        <svg viewBox="0 0 240 105" fill="none"><path d="M54 78c-5-10-6-20-3-31 2-6 5-12 8-19 3-6 8-8 12-7 4-6 9-6 12-4 4-4 9-3 11-1 5-2 9 0 10 4 5 1 8 6 8 12 0 7-3 14-5 21-2 8-2 18-7 25-6 9-37 11-46 0Z" stroke="currentColor" strokeWidth="2"/><path d="M143 21v61m-5-56 5-5 5 5m-10 51 5 5 5-5M128 21h30m-30 61h30" stroke="currentColor" strokeWidth="1.5"/><text x="165" y="55" fill="currentColor" fontSize="11" fontFamily="sans-serif">см</text></svg>
        <span>ДЛИНА СТОПЫ</span>
      </div>
      <ol><li>Поставьте стопу на лист бумаги, пятку — к стене.</li><li>Отметьте самый длинный палец и измерьте расстояние от стены до отметки.</li><li>Измерьте обе стопы и используйте больший результат.</li></ol>
      <p>Сверьте длину стопы с подходящей таблицей Nike. Значение CM на коробке может отличаться от длины стопы; посадка зависит от модели.</p>
      <div className="rs-size-guide__chart-head"><strong>Длина стопы / EU</strong><span>Таблица Nike</span></div>
      <div className="rs-size-guide__tabs" aria-label="Тип размерной таблицы"><button type="button" aria-pressed={chart === 'men'} onClick={() => setChart('men')}>Мужская</button><button type="button" aria-pressed={chart === 'women'} onClick={() => setChart('women')}>Женская</button></div>
      <table className="rs-size-guide__table"><thead><tr><th scope="col">EU</th><th scope="col">Длина стопы, см</th></tr></thead><tbody>{(chart === 'men' ? [[38,23.3],[39,24.1],[40,24.5],[41,25.4],[42,25.8],[43,26.7],[44,27.1],[45,27.9]] : [[38,23.7],[39,24.5],[40,25],[41,25.8],[42,26.2],[43,27.1],[44,27.5],[45,28.3]]).map(([eu, cm]) => <tr key={eu}><td>{eu}</td><td>{cm.toString().replace('.', ',')}</td></tr>)}</tbody></table>
      <p>Показаны размеры из демо-коллекции. В полной таблице Nike есть промежуточные размеры; если измерение между ними, Nike рекомендует выбрать больший. Сверьте таблицу с маркировкой модели.</p>
      <div className="rs-size-guide__links"><a href="https://www.nike.com/size-fit/mens-footwear" target="_blank" rel="noreferrer">Мужская таблица <ArrowUpRight size={15}/></a><a href="https://www.nike.com/size-fit/womens-footwear" target="_blank" rel="noreferrer">Женская таблица <ArrowUpRight size={15}/></a></div>
      <label htmlFor="rs-preferred-size">Запомнить мой размер EU</label>
      <div className="rs-size-guide__save"><select id="rs-preferred-size" value={draft} onChange={event => { setDraft(event.target.value); setSaveMessage(''); }}><option value="">Не выбран</option>{[38,39,40,41,42,43,44,45].map(value => <option key={value} value={value}>{value} EU</option>)}</select><button type="button" onClick={() => { const saved = onSave(draft ? Number(draft) : null); setSaveMessage(saved === false ? 'Хранилище недоступно: размер запомнится только до закрытия страницы.' : draft ? 'Размер сохранён.' : 'Сохранённый размер удалён.'); }}>Сохранить</button></div>
      {saveMessage && <p role="status">{saveMessage}</p>}
      <small>Размер сохраняется на этом устройстве и не гарантирует посадку.</small>
    </div>
  </details>;
}

export function RoyalCartSize({ product, size, onChange }: { product: RoyalProduct; size: number; onChange: (size: number) => void }) {
  return <label className="rs-cart-size">Размер <select aria-label={`Изменить размер ${product.name}`} value={size} onChange={event => onChange(Number(event.target.value))}>{product.sizes.map(value => <option key={value} value={value}>{value} EU</option>)}</select></label>;
}

function money(n: number) { return `${new Intl.NumberFormat('ru-RU').format(n)} ₽`; }
export function RoyalOrderHistory({ orders, products, onRepeat }: { orders: RoyalOrder[]; products: RoyalProduct[]; onRepeat: (order: RoyalOrder) => void }) {
  if (!orders.length) return <div className="rs-account__empty"><p>Когда вы оформите демо-заказ, он появится здесь.</p></div>;
  return <div className="rs-order-history">{orders.map(order => <details key={order.id} className="rs-order-history__order">
    <summary><span><strong>{order.id}</strong><small>{Number.isFinite(Date.parse(order.date)) ? new Date(order.date).toLocaleDateString('ru-RU') : 'Дата не сохранена'} · {order.delivery}</small></span><b>{money(order.total)}</b><ChevronDown size={17}/></summary>
    <div className="rs-order-history__body">{Array.isArray(order.items) && order.items.length ? order.items.map((item, index) => {
      const product = products.find(p => p.id === item.id);
      return <div className="rs-order-history__item" key={`${item.id}-${item.size}-${index}`}>{product && <img src={product.image} alt="" loading="lazy"/>}<div><strong>{item.name || product?.name || 'Модель недоступна'}</strong><span>{item.size} EU · {item.quantity} шт.</span><small>{typeof item.unitPrice === 'number' ? `При заказе: ${money(item.unitPrice)} / пара` : 'Цена при заказе не сохранена'}</small><small>{product ? `Сейчас в демо: ${money(product.price)} / пара` : 'Модель больше не доступна в демо'}</small></div></div>;
    }) : <p>Состав этого заказа не сохранён.</p>}
    <p className="rs-order-history__notice">При повторе будут использованы текущие демо-цены. Проверьте корзину перед оформлением.</p><button type="button" className="rs-button rs-button--outline rs-button--full" disabled={!Array.isArray(order.items) || !order.items.length} onClick={() => onRepeat(order)}>Повторить в корзине</button></div>
  </details>)}</div>;
}
