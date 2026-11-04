import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Heart, Minus, Plus } from 'lucide-react';
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
};

const sizes = [
  { id: 'S', name: 'Небольшой', factor: 0.8 },
  { id: 'M', name: 'Как на фото', factor: 1 },
  { id: 'L', name: 'Объёмный', factor: 1.4 },
] as const;
const money = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function FlowerProductDetail({ item, favorite, onFavorite, onBack, onAdd }: Props) {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState<FlowerSelection['size']>('M');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [zoom, setZoom] = useState(false);
  const [dateError, setDateError] = useState('');
  useEffect(() => { setActive(0); setSize('M'); setDate(''); setNote(''); setZoom(false); setDateError(''); }, [item.id]);
  const price = Math.round(item.price * (sizes.find(option => option.id === size)?.factor || 1) / 100) * 100;
  const images = item.images.filter(Boolean);
  const selected = Math.min(active, Math.max(0, images.length - 1));
  return <article className="flower-detail" data-testid="flower-detail">
    <div className="flower-detail__top"><button type="button" onClick={onBack}><ArrowLeft size={18}/><span>Назад</span></button><span>ЦВЕТОЧНАЯ КОЛЛЕКЦИЯ</span></div>
    <div className="flower-detail__gallery">
      <div className="flower-detail__hero">
        {images.length > 0 ? <button className="flower-detail__image" type="button" onClick={() => setZoom(!zoom)} aria-label={`${zoom ? 'Уменьшить' : 'Увеличить'} фото букета ${item.name}`} aria-pressed={zoom}><img src={images[selected]} alt={`${item.name}, изображение ${selected + 1} из ${images.length}`} className={zoom ? 'is-zoomed' : ''}/><span className="flower-detail__zoom">{zoom ? <Minus size={14}/> : <Plus size={14}/>}</span></button> : <div className="flower-detail__missing">Изображение недоступно</div>}
        <button className="flower-detail__favorite" type="button" aria-label={favorite ? 'Убрать из избранного' : 'Добавить в избранное'} aria-pressed={favorite} onClick={onFavorite}><Heart size={21} fill={favorite ? 'currentColor' : 'none'}/></button>
        {images.length > 0 && <span className="flower-detail__counter">{String(selected + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>}
      </div>
      {images.length > 1 && <div className="flower-detail__thumbs" aria-label="Фотографии букета">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => { setActive(index); setZoom(false); }} aria-label={`Показать изображение ${index + 1} из ${images.length}`} aria-pressed={selected === index}><img src={image} alt="" loading="lazy"/></button>)}</div>}
    </div>
    <div className="flower-detail__content">
      <div className="flower-detail__heading"><div><p className="flower-detail__eyebrow">{item.category} / ЦВЕТОЧНАЯ КОЛЛЕКЦИЯ</p><h1>{item.name}</h1></div><span>FLORA / ЦВЕТЫ</span></div>
      <p className="flower-detail__description">{item.description}</p>
      <div className="flower-detail__price"><strong>{money(price)}</strong><span>примерная цена · демо</span></div>

      <section className="flower-detail__options" aria-labelledby="flower-detail-size"><div className="flower-detail__section-title"><h2 id="flower-detail-size">Выберите размер</h2><span>01</span></div><p>Выберите настроение букета — от камерного до пышного.</p><div className="flower-detail__sizes" role="group" aria-label="Размер букета">{sizes.map(option => <button key={option.id} type="button" onClick={() => setSize(option.id)} aria-pressed={size === option.id}><b>{option.id}</b><span>{option.name}</span></button>)}</div><small>Размеры и стоимость показаны для примера.</small></section>

      <section className="flower-detail__story"><div className="flower-detail__section-title"><h2>Состав букета</h2><span>02</span></div><p>{item.composition}</p><p>Каждая композиция — живая и немного неповторимая. Изображения показывают творческую идею; фактический состав необходимо уточнить у флориста.</p></section>

      <section className="flower-detail__gift" aria-labelledby="flower-detail-gift"><div className="flower-detail__section-title"><h2 id="flower-detail-gift">Для особенного<br/>момента.</h2><span>03</span></div><p>Добавьте пожелания к заказу — дату и несколько слов для открытки.</p><label><span>Желаемая дата <small>необязательно</small></span><input type="date" min={today()} value={date} aria-invalid={!!dateError} aria-describedby={dateError ? 'flower-date-error' : undefined} onChange={event => { setDate(event.target.value); setDateError(''); }}/></label>{dateError && <p id="flower-date-error" className="flower-detail__error" role="alert">{dateError}</p>}<label><span>Текст открытки <small>необязательно</small></span><textarea rows={3} maxLength={300} placeholder="Слова, которые хочется сказать…" value={note} onChange={event => setNote(event.target.value)}/></label><small>Дату и возможность доставки нужно подтвердить отдельно.</small></section>
      <button className="flower-detail__add" type="button" onClick={() => { if (date && date < today()) { setDateError('Выберите сегодняшнюю или будущую дату.'); return; } onAdd({ size, date, note: note.trim(), price }); }}><span>Добавить в корзину</span><span>{money(price)} <ArrowRight size={18}/></span></button>
      <p className="flower-detail__disclaimer">Демо-магазин: цены, наличие и доставка показаны для примера. Оформление не создаёт реальный заказ.</p>
    </div>
  </article>;
}
