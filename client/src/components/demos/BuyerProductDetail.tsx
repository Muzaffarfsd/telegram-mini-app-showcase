import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Heart, Minus, Plus, Sparkles } from 'lucide-react';
import { BuyerEditorialDetails } from './BuyerEditorialDetails';
import './BuyerProductDetail.css';

export type BuyerDetailItem = { id:string; name:string; category:string; image:string; caption:string; story:string; gallery?:string[] };
export type BuyerDetailPreferences = { size:string; color:string; notes:string };
type Props = { item:BuyerDetailItem; favorite:boolean; related:BuyerDetailItem[]; onFavorite:()=>void; onRequest:(preferences:BuyerDetailPreferences)=>void; onOpen:(id:string)=>void; onCatalog:()=>void };

const cropNames = ['Общий вид','Фрагмент изображения','Крупнее'];
const captionFor = (category:string) => category === 'Обувь' ? 'Размер обуви' : category === 'Для дома' ? 'Размеры предмета' : category === 'Сумки' ? 'Желаемый размер' : category === 'Аксессуары' ? 'Размер или форма' : 'Размер или посадка';
const sizeHint = (category:string) => category === 'Обувь' ? 'Например, 39 EU' : category === 'Для дома' ? 'Например, высота 30 см' : category === 'Сумки' ? 'Например, 25 × 18 см' : category === 'Аксессуары' ? 'Например, узкая форма' : 'Например, M';
const buyerNote = (category:string) => category === 'Обувь' ? 'Укажите длину стопы и предпочтительную посадку — это поможет точнее описать запрос.' : category === 'Сумки' ? 'Можно указать желаемые габариты, длину ручки и то, что важно помещать внутрь.' : category === 'Для дома' ? 'Добавьте размеры пространства, желаемый цвет и фактуру предмета.' : category === 'Аксессуары' ? 'Опишите форму, оттенок и желаемый размер аксессуара.' : 'Укажите желаемый силуэт, размер и важные детали посадки.';

/** Images are illustrative demo assets. No unverified availability or product attributes. */
export function BuyerProductDetail({ item, favorite, related, onFavorite, onRequest, onOpen, onCatalog }: Props) {
  const [index,setIndex] = useState(0);
  const [enlarged,setEnlarged] = useState(false);
  const [size,setSize] = useState('');
  const [color,setColor] = useState('');
  const [notes,setNotes] = useState('');
  const imageButton=useRef<HTMLButtonElement>(null);
  useEffect(()=>{setIndex(0);setEnlarged(false);setSize('');setColor('');setNotes('');},[item.id]);
  const alternatives = Array.from(new Set((item.gallery || []).filter(path => typeof path === 'string' && path && path !== item.image))).slice(0,3);
  const hasGallery = alternatives.length === 3;
  const views = hasGallery ? [item.image,...alternatives] : [item.image,item.image,item.image];
  const current=Math.min(index,views.length-1);
  const changeView=(next:number)=>{setIndex(next);setEnlarged(false);requestAnimationFrame(()=>imageButton.current?.focus({preventScroll:true}));};
  const preferences={size:size.trim(),color:color.trim(),notes:notes.trim()};
  return <section className="bpd" data-testid="buyer-product-detail">
    <div className="bpd-topline"><span>КИТАЙ / ВЫБОР БАЙЕРА</span><span>ПРЕДМЕТ ИЗ ПОДБОРКИ</span></div>
    <div className="bpd-gallery" aria-label="Изображения идеи товара">
      <div className="bpd-thumbs">{views.map((src,i) => hasGallery && i===current ? null : <button type="button" key={`${src}-${i}`} onClick={()=>changeView(i)} aria-label={hasGallery ? `Показать фото ${i+1} из 4` : `${cropNames[i]}: показать`} aria-pressed={!hasGallery ? current===i : undefined}><span className="bpd-thumb__image"><img src={src} alt="" className={!hasGallery ? `is-crop-${i}` : ''} loading="lazy"/></span><span className="bpd-thumb__label"><b>0{i+1}</b>{!hasGallery && <small>{i===0?'ВИД':i===1?'ФРАГМЕНТ':'КРУПНЕЕ'}</small>}</span></button>)}</div>
      <div className="bpd-main-photo"><button className="bpd-image-button" type="button" ref={imageButton} onClick={()=>setEnlarged(v=>!v)} aria-label={`${enlarged?'Уменьшить':'Увеличить'} изображение ${item.name}`} aria-pressed={enlarged}><img key={`${item.id}-${current}`} src={views[current]} alt={`Иллюстрация: ${item.name}${hasGallery ? `, фотография ${current+1} из 4` : ` — ${cropNames[current]}`}`} className={`${!hasGallery ? `is-crop-${current}` : ''} ${enlarged?'is-enlarged':''}`}/><span className="bpd-zoom">{enlarged?<Minus size={14}/>:<Plus size={14}/>} {enlarged?'Уменьшить':'Увеличить'}</span></button><button className="bpd-heart" type="button" onClick={onFavorite} aria-label={`${favorite?'Убрать из избранного':'В избранное'}: ${item.name}`} aria-pressed={favorite}><Heart size={20} fill={favorite?'currentColor':'none'}/></button><span className="bpd-index">{hasGallery ? `${String(current+1).padStart(2,'0')} / 04` : 'ИЗОБРАЖЕНИЕ / ДЕМО'}</span></div>
    </div>
    <p className="bpd-gallery-note">{hasGallery ? 'Сгенерированные иллюстрации одной идеи: мелкие детали могут различаться.' : 'Три кадрирования одного изображения — чтобы рассмотреть идею ближе.'}</p>
    <div className="bpd-body">
      <div className="bpd-title-line"><p>{item.category.toUpperCase()} / КОЛЛЕКЦИЯ</p><span>ДЕМО / 01 <i className="bpd-title-seal cb-ink-font" lang="zh-Hans" aria-hidden="true">选</i></span></div>
      <h1>{item.name}</h1><p className="bpd-subtitle">{item.caption}</p>
      <div className="bpd-availability"><span className="bpd-dot"/><div><strong>Цена и наличие уточняются</strong><small>Визуальная идея для индивидуального поиска</small></div></div>
      <p className="bpd-story">{item.story}</p>
      <div className="bpd-advice"><span>ЗАМЕТКА БАЙЕРА / ↗</span><p>{buyerNote(item.category)}</p></div>
      <div className="bpd-brief"><div className="bpd-brief__header"><div><p>ВАШ ПОИСК / 01</p><h2>Начнём с деталей.</h2></div><Sparkles size={20}/></div><p>Выберите ориентиры — они добавятся в заявку и помогут описать вашу идею.</p><div className="bpd-brief__fields"><label><span>{captionFor(item.category)}</span><input value={size} maxLength={80} onChange={e=>setSize(e.target.value)} placeholder={sizeHint(item.category)} /></label><label><span>Цвет</span><input value={color} maxLength={80} onChange={e=>setColor(e.target.value)} placeholder="Например, чёрный" /></label></div><label className="bpd-notes"><span>Что ещё важно <small>по желанию</small></span><textarea value={notes} maxLength={300} rows={2} onChange={e=>setNotes(e.target.value)} placeholder="Форма, материал или любая деталь" /></label><button type="button" className="bpd-request" onClick={()=>onRequest(preferences)}>Найти похожее <ArrowRight size={18}/></button><p className="bpd-hint">Пожелания не означают подтверждённое наличие. Заявка в этом демо не отправляется.</p></div>
      <div className="bpd-facts"><div><span>01</span><p><strong>Вы рассказываете</strong><small>Идея, ссылка и важные вам детали.</small></p></div><div><span>02</span><p><strong>Условия обсуждаются</strong><small>Стоимость, проверка и получение зависят от запроса.</small></p></div></div>
      <BuyerEditorialDetails category={item.category} onRequest={()=>onRequest(preferences)}/>
      {related.length>0 && <section className="bpd-related" aria-labelledby="bpd-related-title"><div className="bpd-related__head"><div><p>ПРОДОЛЖИТЬ ПОИСК / 02</p><h2 id="bpd-related-title">В том же направлении.</h2></div><button type="button" onClick={onCatalog}>Все идеи <ArrowRight size={15}/></button></div><p>Иллюстрации для вдохновения</p><div className="bpd-related__track">{related.map(candidate=><button type="button" key={candidate.id} onClick={()=>onOpen(candidate.id)} aria-label={`Открыть ${candidate.name}`}><span><img src={candidate.image} alt="" loading="lazy"/></span><strong>{candidate.name}</strong><small>{candidate.category}</small></button>)}</div></section>}
    </div>
  </section>;
}
