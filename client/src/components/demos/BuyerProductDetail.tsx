import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Heart, Minus, Plus } from 'lucide-react';
import './BuyerProductDetail.css';

export type BuyerDetailItem = { id:string; name:string; category:string; image:string; caption:string; story:string; gallery?:string[] };
export type BuyerDetailPreferences = { size:string; color:string; notes:string };
type Props = { item:BuyerDetailItem; favorite:boolean; related:BuyerDetailItem[]; onFavorite:()=>void; onRequest:(preferences:BuyerDetailPreferences)=>void; onOpen:(id:string)=>void; onCatalog:()=>void };

const cropNames = ['Общий вид','Фрагмент изображения','Крупнее'];
const captionFor = (category:string) => category === 'Обувь' ? 'Размер обуви' : category === 'Для дома' ? 'Размеры предмета' : category === 'Сумки' ? 'Желаемый размер' : category === 'Аксессуары' ? 'Размер или форма' : 'Размер или посадка';
const sizeHint = (category:string) => category === 'Обувь' ? '39 EU' : category === 'Для дома' ? '30 см' : category === 'Сумки' ? '25 × 18 см' : category === 'Аксессуары' ? 'Узкая форма' : 'M';
const buyerNote = (category:string) => category === 'Обувь' ? 'Укажите длину стопы и желаемую посадку.' : category === 'Сумки' ? 'Уточните размер, длину ручки и что должно поместиться внутри.' : category === 'Для дома' ? 'Укажите размеры, оттенок и желаемую фактуру.' : category === 'Аксессуары' ? 'Опишите форму, оттенок и размер аксессуара.' : 'Укажите силуэт, размер и важные детали посадки.';

/** Illustrative items only: prices, availability and supplier services are not confirmed. */
export function BuyerProductDetail({ item, favorite, related, onFavorite, onRequest, onOpen, onCatalog }: Props) {
  const [index,setIndex] = useState(0);
  const [enlarged,setEnlarged] = useState(false);
  const [size,setSize] = useState('');
  const [color,setColor] = useState('');
  const [notes,setNotes] = useState('');
  const imageButton=useRef<HTMLButtonElement>(null);
  const briefRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{setIndex(0);setEnlarged(false);setSize('');setColor('');setNotes('');},[item.id]);
  const alternatives = Array.from(new Set((item.gallery || []).filter(path => typeof path === 'string' && path && path !== item.image))).slice(0,3);
  const hasGallery = alternatives.length === 3;
  const views = hasGallery ? [item.image,...alternatives] : [item.image,item.image,item.image];
  const current=Math.min(index,views.length-1);
  const changeView=(next:number)=>{setIndex(next);setEnlarged(false);requestAnimationFrame(()=>imageButton.current?.focus({preventScroll:true}));};
  const preferences={size:size.trim(),color:color.trim(),notes:notes.trim()};
  return <section className="bpd" data-testid="buyer-product-detail">
    <div className="bpd-topline"><span>КОЛЛЕКЦИЯ / {item.category.toUpperCase()}</span><span>КИТАЙ <i aria-hidden="true"/></span></div>
    <div className="bpd-gallery" aria-label="Изображения идеи товара">
      <div className="bpd-main-photo"><button className="bpd-image-button" type="button" ref={imageButton} onClick={()=>setEnlarged(v=>!v)} aria-label={`${enlarged?'Уменьшить':'Увеличить'} изображение ${item.name}`} aria-pressed={enlarged}><img key={`${item.id}-${current}`} src={views[current]} alt={`Иллюстрация: ${item.name}${hasGallery ? `, фотография ${current+1} из 4` : ` — ${cropNames[current]}`}`} className={`${!hasGallery ? `is-crop-${current}` : ''} ${enlarged?'is-enlarged':''}`}/><span className="bpd-zoom">{enlarged?<Minus size={15}/>:<Plus size={15}/>} <span>{enlarged?'Уменьшить':'Увеличить'}</span></span></button><button className="bpd-heart" type="button" onClick={onFavorite} aria-label={`${favorite?'Убрать из избранного':'В избранное'}: ${item.name}`} aria-pressed={favorite}><Heart size={20} fill={favorite?'currentColor':'none'}/></button><span className="bpd-index">{hasGallery ? `${String(current+1).padStart(2,'0')} / 04` : `${String(current+1).padStart(2,'0')} / 03`}</span></div>
      <div className="bpd-thumbs" aria-label={hasGallery ? 'Другие изображения' : 'Кадрирования изображения'}>{views.map((src,i) => hasGallery && i===current ? null : <button type="button" key={`${src}-${i}`} onClick={()=>changeView(i)} aria-label={hasGallery ? `Показать фото ${i+1} из 4` : `${cropNames[i]}: показать`} aria-pressed={!hasGallery ? current===i : undefined}><span className="bpd-thumb__image"><img src={src} alt="" className={!hasGallery ? `is-crop-${i}` : ''} loading="lazy"/></span><span className="bpd-thumb__label">0{i+1}</span></button>)}</div>
    </div>
    <p className="bpd-gallery-note">{hasGallery ? 'Сгенерированные иллюстрации одной идеи: мелкие детали могут различаться.' : 'Три кадрирования одного изображения — чтобы рассмотреть идею ближе.'}</p>
    <div className="bpd-body">
      <div className="bpd-title-line"><p>{item.category.toUpperCase()} / ИДЕЯ ДЛЯ ПОИСКА</p><span lang="zh-Hans" aria-label="Тщательно отобрано">精选</span></div>
      <h1>{item.name}</h1><p className="bpd-subtitle">{item.caption}</p>
      <div className="bpd-availability"><span className="bpd-dot"/><div><strong>Цена и наличие уточняются</strong><small>Иллюстрация для индивидуального поиска</small></div></div>
      <button className="bpd-primary" type="button" onClick={()=>briefRef.current?.scrollIntoView({behavior:'smooth',block:'start'})}>Обсудить поиск <ArrowRight size={18}/></button>
      <div className="bpd-story-block"><p className="bpd-section-label">ОБ ИДЕЕ <span>01</span></p><h2>Внимание к деталям.</h2><p className="bpd-story">{item.story}</p><div className="bpd-advice"><span>НА ЗАМЕТКУ</span><p>{buyerNote(item.category)}</p></div></div>
      <div className="bpd-brief" ref={briefRef}><div className="bpd-brief__header"><div><p>ЛИЧНЫЙ ЗАПРОС / 02</p><h2>Расскажите,<br/>что важно вам.</h2></div><span className="bpd-stamp" aria-hidden="true">寻</span></div><p>Добавьте детали — они сохранятся в заявке и помогут описать вашу идею.</p><div className="bpd-brief__fields"><label><span>{captionFor(item.category)}</span><input value={size} maxLength={80} onChange={e=>setSize(e.target.value)} placeholder={sizeHint(item.category)} /></label><label><span>Цвет</span><input value={color} maxLength={80} onChange={e=>setColor(e.target.value)} placeholder="Чёрный" /></label></div><label className="bpd-notes"><span>Что ещё важно <small>по желанию</small></span><textarea value={notes} maxLength={300} rows={2} onChange={e=>setNotes(e.target.value)} placeholder="Форма, материал или другая деталь" /></label><button type="button" className="bpd-request" onClick={()=>onRequest(preferences)}>Найти похожее <ArrowRight size={18}/></button><p className="bpd-hint">Это демо: заявка не отправляется, наличие и стоимость не подтверждены.</p></div>
      <div className="bpd-process"><p className="bpd-section-label">КАК ЭТО РАБОТАЕТ <span>03</span></p><h2>От идеи к запросу.</h2><div><b>01</b><p><strong>Вы делитесь идеей</strong><small>Выберите вещь или добавьте свою ссылку.</small></p></div><div><b>02</b><p><strong>Уточняете детали</strong><small>Размер, цвет и бюджет помогут описать поиск.</small></p></div><div><b>03</b><p><strong>Проверяете заявку</strong><small>В этой версии она сохраняется только на устройстве.</small></p></div></div>
      {related.length>0 && <section className="bpd-related" aria-labelledby="bpd-related-title"><div className="bpd-related__head"><div><p>В КОЛЛЕКЦИИ / 04</p><h2 id="bpd-related-title">Посмотрите ещё.</h2></div><button type="button" onClick={onCatalog}>В каталог <ArrowRight size={15}/></button></div><div className="bpd-related__track">{related.map(candidate=><button type="button" key={candidate.id} onClick={()=>onOpen(candidate.id)} aria-label={`Открыть ${candidate.name}`}><span><img src={candidate.image} alt="" loading="lazy"/></span><strong>{candidate.name}</strong><small>{candidate.category} · идея</small></button>)}</div></section>}
    </div>
  </section>;
}
