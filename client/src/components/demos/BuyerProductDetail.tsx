import chinaPreviews from './imagePreview-china.json';
import { previewProps } from './imagePreview';
import { useGalleryPan } from './useGalleryPan';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Heart, Minus, Plus, X } from 'lucide-react';
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
  const closeZoom=useRef<HTMLButtonElement>(null);
  useEffect(()=>{setIndex(0);setEnlarged(false);setSize('');setColor('');setNotes('');},[item.id]);
  const alternatives = Array.from(new Set((item.gallery || []).filter(path => typeof path === 'string' && path && path !== item.image))).slice(0,3);
  const hasGallery = alternatives.length === 3;
  const views = hasGallery ? [item.image,...alternatives] : [item.image,item.image,item.image];
  const current=Math.min(index,views.length-1);
  const zoomScale=!hasGallery&&current===1?2.05:!hasGallery&&current===2?2.4:1.65;
  const pan=useGalleryPan(enlarged,imageButton,zoomScale,views[current]);
  useEffect(()=>{if(!enlarged)return;closeZoom.current?.focus({preventScroll:true});const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();setEnlarged(false);imageButton.current?.focus({preventScroll:true});}else if((document.activeElement===closeZoom.current||document.activeElement===imageButton.current)&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();pan.onArrow(event.key)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[enlarged]);
  const changeView=(next:number)=>{setIndex(next);setEnlarged(false);requestAnimationFrame(()=>imageButton.current?.focus({preventScroll:true}));};
  const preferences={size:size.trim(),color:color.trim(),notes:notes.trim()};
  const suggestions = item.category === 'Обувь' ? ['36 EU','37 EU','38 EU','39 EU','40 EU'] : item.category === 'Одежда' ? ['XS','S','M','L','XL'] : [];
  return <section className="bpd" data-testid="buyer-product-detail">
    <div className="bpd-topline"><span>ЛИЧНАЯ ПОДБОРКА / {item.category.toUpperCase()}</span><span lang="zh-Hans" aria-hidden="true">精选</span></div>
    <div className="bpd-gallery" aria-label="Изображения идеи товара">
      <div className="bpd-main-photo">
        <button className="bpd-image-button" type="button" ref={imageButton} onClick={()=>{if(!pan.consumeClick())setEnlarged(v=>!v)}} onPointerDown={pan.onPointerDown} onPointerMove={pan.onPointerMove} onPointerUp={pan.onPointerUp} onPointerCancel={pan.onPointerCancel} aria-label={`${enlarged?'Уменьшить':'Увеличить'} изображение ${item.name}`} aria-pressed={enlarged}>
          <img key={`${item.id}-${current}`} src={views[current]} {...previewProps(views[current],chinaPreviews,views[current]===item.image && item.id==='v5-feature'?'contain':'cover')} style={{...previewProps(views[current],chinaPreviews,views[current]===item.image && item.id==='v5-feature'?'contain':'cover').style,...(enlarged?{transform:`translate(${pan.offset.x}px, ${pan.offset.y}px) scale(${zoomScale})`}:{})}} alt={`Иллюстрация: ${item.name}${hasGallery ? `, изображение ${current+1} из 4` : ` — ${cropNames[current]}`}`} className={`${!hasGallery ? `is-crop-${current}` : ''} ${enlarged?'is-enlarged':''}`}/>
          <span className="bpd-zoom">{enlarged?<Minus size={15}/>:<Plus size={15}/>} <span>{enlarged?'Уменьшить':'Увеличить'}</span></span>
        </button>
        {enlarged?<button ref={closeZoom} className="bpd-inline-close" type="button" aria-label="Закрыть увеличение фотографии. Для перемещения используйте стрелки" onClick={()=>{setEnlarged(false);imageButton.current?.focus({preventScroll:true});}}><X size={22}/></button>:<button className="bpd-heart" type="button" onClick={onFavorite} aria-label={`${favorite?'Убрать из избранного':'В избранное'}: ${item.name}`} aria-pressed={favorite}><Heart size={20} fill={favorite?'currentColor':'none'}/></button>}

        <span className="bpd-index">{hasGallery ? `${String(current+1).padStart(2,'0')} / 04` : `${String(current+1).padStart(2,'0')} / 03`}</span>
      </div>
      <div className="bpd-thumbs" aria-label={hasGallery ? 'Другие изображения' : 'Кадрирования изображения'}>{views.map((src,i) => hasGallery && i===current ? null : <button type="button" key={`${src}-${i}`} onClick={()=>changeView(i)} aria-label={hasGallery ? `Показать фото ${i+1} из 4` : `${cropNames[i]}: показать`} aria-pressed={!hasGallery ? current===i : undefined}><span className="bpd-thumb__image"><img src={src} {...previewProps(src,chinaPreviews,src===item.image && item.id==='v5-feature'?'contain':'cover')} alt="" className={!hasGallery ? `is-crop-${i}` : ''} loading="lazy"/></span><span className="bpd-thumb__label">0{i+1}</span></button>)}</div>
    </div>
    <p className="bpd-gallery-note">{hasGallery ? 'Сгенерированные иллюстрации одной идеи: мелкие детали могут различаться.' : 'Три кадрирования одного изображения — чтобы рассмотреть идею ближе.'}</p>
    <div className="bpd-body">
      <div className="bpd-title-line"><p>{item.category.toUpperCase()} / ИДЕЯ ДЛЯ ПОИСКА</p></div>
      <h1>{item.name}</h1><p className="bpd-subtitle">{item.caption}</p>
      <div className="bpd-availability"><span className="bpd-dot"/><div><strong>Цена и наличие уточняются</strong><small>Индивидуальный поиск похожей вещи</small></div></div>
      <div className="bpd-brief" ref={briefRef}>
        <div className="bpd-brief__header"><div><p>ВАШИ ПРЕДПОЧТЕНИЯ</p><h2>Какая вещь нужна вам?</h2></div><span className="bpd-stamp" aria-hidden="true">寻</span></div>
        <p>Укажите важные детали или оставьте поля пустыми — их можно дополнить в заявке.</p>
        <div className="bpd-brief__fields"><label><span>{captionFor(item.category)}</span><input value={size} maxLength={80} onChange={e=>setSize(e.target.value)} placeholder={sizeHint(item.category)} /></label><label><span>Цвет</span><input value={color} maxLength={80} onChange={e=>setColor(e.target.value)} placeholder="Чёрный" /></label></div>
        {suggestions.length>0 && <div className="bpd-suggestions" role="group" aria-label="Подсказки для размера">{suggestions.map(value=><button type="button" key={value} aria-pressed={size===value} onClick={()=>setSize(value)}>{value}</button>)}</div>}
        <label className="bpd-notes"><span>Что ещё важно <small>по желанию</small></span><textarea value={notes} maxLength={300} rows={2} onChange={e=>setNotes(e.target.value)} placeholder="Форма, фактура или другая деталь" /></label>
        <button type="button" className="bpd-request" onClick={()=>onRequest(preferences)}><span>Найти похожее</span><ArrowRight size={18}/></button>
        <p className="bpd-hint">Демо: запрос сохраняется на устройстве и не отправляется байеру.</p>
      </div>
      <div className="bpd-story-block"><p className="bpd-section-label">ИСТОРИЯ НАХОДКИ <span>01 / 03</span></p><h2>У каждой детали<br/><em>своё значение.</em></h2><p className="bpd-story">{item.story}</p><div className="bpd-advice"><span>ВАЖНО ДЛЯ ПОИСКА</span><p>{buyerNote(item.category)}</p></div></div>
      <div className="bpd-process"><p className="bpd-section-label">ВАШ ПУТЬ <span>02 / 03</span></p><h2>От идеи<br/><em>к личному запросу.</em></h2><div><b>01</b><p><strong>Вы выбираете идею</strong><small>Сохраните понравившуюся вещь или добавьте свою ссылку.</small></p></div><div><b>02</b><p><strong>Описываете детали</strong><small>Размер, цвет и бюджет помогут составить запрос.</small></p></div><div><b>03</b><p><strong>Проверяете заявку</strong><small>В этой версии она сохраняется только на устройстве.</small></p></div></div>
      {related.length>0 && <section className="bpd-related" aria-labelledby="bpd-related-title"><div className="bpd-related__head"><div><p>ПРОДОЛЖИТЬ ВЫБОР / 03</p><h2 id="bpd-related-title">Вам может<br/><em>понравиться.</em></h2></div><button type="button" onClick={onCatalog}>В каталог <ArrowRight size={15}/></button></div><div className="bpd-related__track">{related.map(candidate=><button type="button" key={candidate.id} onClick={()=>onOpen(candidate.id)} aria-label={`Открыть ${candidate.name}`}><span><img src={candidate.image} {...previewProps(candidate.image,chinaPreviews,candidate.id==='v5-feature'?'contain':'cover')} alt="" loading="lazy"/></span><strong>{candidate.name}</strong><small>{candidate.category} · идея для поиска</small></button>)}</div></section>}
    </div>
  </section>;
}
