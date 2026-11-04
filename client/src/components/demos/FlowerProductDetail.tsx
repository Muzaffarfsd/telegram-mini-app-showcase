import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Expand, Heart, Share2, X } from 'lucide-react';
import './FlowerProductDetail.css';

export type FlowerDetailItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  description: string;
  composition: string;
};
export type FlowerSelection = { size: 'S' | 'M' | 'L'; date: string; note: string; price: number };
type Props = {
  item: FlowerDetailItem;
  favorite: boolean;
  onFavorite: () => void;
  onBack: () => void;
  onAdd: (selection: FlowerSelection) => void;
  initialSelection?: FlowerSelection;
  onDraftChange?: (selection: FlowerSelection) => void;
  editing?: boolean;
};

const sizes = [
  { id: 'S', name: 'Камерный', detail: 'Меньше по объёму', factor: 0.8 },
  { id: 'M', name: 'Как на фото', detail: 'Базовый вариант', factor: 1 },
  { id: 'L', name: 'Объёмный', detail: 'Больше по объёму', factor: 1.4 },
] as const;
const money = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const calculatePrice = (item: FlowerDetailItem, size: FlowerSelection['size']) => Math.round(item.price * (sizes.find(option => option.id === size)?.factor || 1) / 100) * 100;

export function FlowerProductDetail({ item, favorite, onFavorite, onBack, onAdd, initialSelection, onDraftChange, editing = false }: Props) {
  const [active, setActive] = useState(0);
  const [draft, setDraft] = useState<FlowerSelection>(() => ({ size: initialSelection?.size || 'M', date: initialSelection?.date || '', note: initialSelection?.note || '', price: calculatePrice(item, initialSelection?.size || 'M') }));
  const [expanded, setExpanded] = useState(false);
  const [dateError, setDateError] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const [shareUrl, setShareUrl] = useState('');
  const imageButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const modal = useRef<HTMLDivElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);
  const touchStart = useRef<number | null>(null);
  const images = item.images.filter(Boolean);
  const selected = Math.min(active, Math.max(0, images.length - 1));
  const price = calculatePrice(item, draft.size);
  const move = (direction: number) => setActive(current => images.length ? (current + direction + images.length) % images.length : 0);

  // The parent supplies initialSelection and remounts the component when switching item/edit context.
  const update = (patch: Partial<FlowerSelection>) => {
    const next = { ...draft, ...patch };
    next.price = calculatePrice(item, next.size);
    setDraft(next);
    onDraftChange?.(next);
  };
  const share = async () => {
    const address = window.location.href;
    setShareUrl(address);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(address);
      setShareStatus('copied');
    } catch {
      setShareStatus('manual');
    }
  };
  const submit = () => {
    if (draft.date && draft.date < today()) {
      setDateError('Выберите сегодняшнюю или будущую дату.');
      dateInput.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      dateInput.current?.focus({ preventScroll: true });
      return;
    }
    onAdd({ ...draft, note: draft.note.trim(), price });
  };
  useEffect(() => {
    if (!expanded) return;
    const root = document.getElementById('root');
    const previousOverflow = root?.style.overflow || '';
    if (root) root.style.overflow = 'hidden';
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => closeButton.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setExpanded(false); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      else if (event.key === 'Tab') {
        const buttons = modal.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      if (root) root.style.overflow = previousOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener('keydown', onKey);
      imageButton.current?.focus({ preventScroll: true });
    };
  }, [expanded, images.length]);
  const touchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const difference = event.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(difference) > 48) move(difference < 0 ? 1 : -1);
    touchStart.current = null;
  };
  return <article className="flower-detail" data-testid="flower-detail">
    <div className="flower-detail__top"><button type="button" onClick={onBack}><ArrowLeft size={18}/><span>Назад</span></button><span>FLORA / КОЛЛЕКЦИЯ</span><button type="button" className="flower-detail__share" onClick={share}><Share2 size={17}/><span>Поделиться</span></button></div>
    {shareStatus === 'copied' && <p className="flower-detail__share-status" role="status">Ссылка скопирована.</p>}
    {shareStatus === 'manual' && <div className="flower-detail__share-fallback" role="status"><label htmlFor="flower-share-url">Скопируйте ссылку на букет</label><input id="flower-share-url" type="text" readOnly value={shareUrl} onFocus={event => event.currentTarget.select()} onClick={event => event.currentTarget.select()}/></div>}
    <header className="flower-detail__heading"><p className="flower-detail__eyebrow">{item.category} / ЦВЕТОЧНАЯ КОМПОЗИЦИЯ</p><h1>{item.name}</h1><div className="flower-detail__intro"><p>{item.description}</p><div><strong>{money(price)}</strong><span>примерная цена · демо</span></div></div></header>
    <div className="flower-detail__gallery" aria-label={`Фотографии букета ${item.name}`}>
      <div className="flower-detail__hero">
        {images.length > 0 ? <button ref={imageButton} className="flower-detail__image" type="button" onClick={() => setExpanded(true)} aria-label={`Открыть фотографию ${selected + 1} букета ${item.name} на весь экран`}><img src={images[selected]} alt={`${item.name}, изображение ${selected + 1} из ${images.length}`}/><span className="flower-detail__zoom" aria-hidden="true"><Expand size={18}/></span></button> : <div className="flower-detail__missing">Изображение недоступно</div>}
        <button className="flower-detail__favorite" type="button" aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'} aria-pressed={favorite} onClick={onFavorite}><Heart size={20} fill={favorite ? 'currentColor' : 'none'}/></button>
        {images.length > 0 && <span className="flower-detail__counter">{String(selected + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>}
      </div>
      {images.length > 1 && <div className="flower-detail__thumbs" role="group" aria-label="Выберите фотографию">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => setActive(index)} aria-label={`Показать изображение ${index + 1} из ${images.length}`} aria-pressed={selected === index}><img src={image} alt="" loading="lazy"/></button>)}</div>}
      <div className="flower-detail__gallery-caption"><span>КОМПОЗИЦИЯ В ДЕТАЛЯХ</span><span>{String(selected + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span></div>
      <p className="flower-detail__image-note">Изображения сгенерированы для демо. На фото показан базовый вариант M; детали между кадрами могут отличаться.</p>
    </div>
    <div className="flower-detail__content">
      <section className="flower-detail__options" aria-labelledby="flower-detail-size"><div className="flower-detail__section-title"><div><span>01 / ФОРМА И ОБЪЁМ</span><h2 id="flower-detail-size">Выберите<br/>размер.</h2></div><span>FLORA</span></div><p>От небольшого жеста до более объёмной композиции.</p><div className="flower-detail__sizes" role="group" aria-label="Размер букета">{sizes.map(option => <button key={option.id} type="button" onClick={() => update({ size: option.id })} aria-pressed={draft.size === option.id}><span className="flower-detail__size-drawing" aria-hidden="true"><svg viewBox="0 0 60 46" focusable="false"><circle cx="30" cy="23" r={option.id === 'S' ? 10 : option.id === 'M' ? 15 : 20}/><path d="M8 45h44"/></svg></span><b>{option.id}</b><span>{option.name}</span><small>{option.detail}</small></button>)}</div><small>Схема условно сравнивает объём, а не форму букетов. Точные размеры и состав уточняются у флориста; на фото — вариант M.</small></section>
      <section className="flower-detail__story"><div className="flower-detail__section-title"><div><span>02 / СОСТАВ</span><h2>Внутри<br/>букета.</h2></div><span>FLORA</span></div><p className="flower-detail__composition">{item.composition}</p><p>Фотографии передают идею композиции. Конкретные цветы, упаковку и доступные замены необходимо согласовать с флористом.</p><div className="flower-detail__story-rule"/><div className="flower-detail__care"><h3>Пусть цветы<br/>радуют дольше.</h3><p>Обновите срез, поставьте цветы в чистую воду и держите вдали от прямого солнца и источников тепла. Уход зависит от состава — уточните рекомендации при заказе.</p></div></section>
      <section className="flower-detail__gift" aria-labelledby="flower-detail-gift"><div className="flower-detail__section-title"><div><span>03 / ЛИЧНЫЙ ЖЕСТ</span><h2 id="flower-detail-gift">Для особенного<br/>момента.</h2></div><span>FLORA</span></div><p>Добавьте желаемую дату и несколько слов для открытки.</p><label><span>Желаемая дата <small>необязательно</small></span><input ref={dateInput} type="date" min={today()} value={draft.date} aria-invalid={!!dateError} aria-describedby={dateError ? 'flower-date-error' : undefined} onChange={event => { update({ date: event.target.value }); setDateError(''); }}/></label>{dateError && <p id="flower-date-error" className="flower-detail__error" role="alert">{dateError}</p>}<label><span>Текст открытки <small>необязательно</small></span><textarea rows={3} maxLength={300} placeholder="Слова, которые хочется сказать…" value={draft.note} onChange={event => update({ note: event.target.value })}/></label><div className="flower-detail__note-count">{draft.note.length} / 300</div><small>Дата и возможность доставки требуют подтверждения. В демо заказ не отправляется.</small></section>
      <button className="flower-detail__add" type="button" onClick={submit}><span>{editing ? 'Сохранить изменения' : 'Добавить в корзину'}</span><span>{money(price)} <ArrowRight size={18}/></span></button>
      <p className="flower-detail__disclaimer">Демо-магазин: цены, наличие и доставка показаны для примера. Оформление не создаёт реальный заказ.</p>
    </div>
    {createPortal(<div className="flower-detail__sticky" aria-label="Действие с букетом"><div><span>ВАШ ВЫБОР / {draft.size}</span><strong>{money(price)}</strong></div><button type="button" onClick={submit}>{editing ? 'Сохранить' : 'В корзину'} <ArrowRight size={17}/></button></div>, document.body)}
    {expanded && createPortal(<div ref={modal} className="flower-lightbox" role="dialog" aria-modal="true" aria-label={`Фотографии букета ${item.name}`} onTouchStart={event => { touchStart.current = event.changedTouches[0]?.clientX ?? null; }} onTouchEnd={touchEnd}>
      <div className="flower-lightbox__top"><span>FLORA / {item.name}</span><button ref={closeButton} type="button" aria-label="Закрыть просмотр фотографии" onClick={() => setExpanded(false)}><X size={23}/></button></div>
      <img src={images[selected]} alt={`${item.name}, изображение ${selected + 1} из ${images.length}`}/>
      <div className="flower-lightbox__controls"><button type="button" aria-label="Предыдущая фотография" onClick={() => move(-1)}><ChevronLeft size={23}/></button><span aria-live="polite">{String(selected + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span><button type="button" aria-label="Следующая фотография" onClick={() => move(1)}><ChevronRight size={23}/></button></div>
    </div>, document.body)}
  </article>;
}
