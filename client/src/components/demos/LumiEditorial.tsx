import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock3, X} from 'lucide-react';
import type {LumiMaster, LumiService} from './lumiData';
import {galleryImagesFor, homeGallery} from './lumiGalleryData';

type Visit = {serviceId:string;masterId:string;date:string;time:string};
type Common = {services:LumiService[];masters:LumiMaster[];openService:(id:string)=>void;openMaster:(id:string)=>void;book:(service?:string,master?:string)=>void};
const image=(name:string)=>`/lumi/generated/${name}`;
const money=(n:number)=>`${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
const dateLabel=(s:string)=>new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'numeric',month:'long'}).format(new Date(`${s}T12:00:00`));
const preparations:Record<string,string>={
 cut:'Покажите мастеру фотографии форм, которые вам нравятся, и расскажите, как вы обычно укладываете волосы.',
 color:'Подготовьте примеры желаемого оттенка и расскажите о предыдущих окрашиваниях. Детали обсудите с мастером.',
 manicure:'Подумайте о комфортной длине и форме. Если на ногтях есть покрытие, заранее обсудите его снятие.',
 coat:'Сохраните понравившиеся оттенки и расскажите мастеру о желаемой длине и форме.',
 brows:'Расскажите мастеру, какой результат вам ближе: мягкая или более выразительная форма.',
 'brow-lift':'Расскажите мастеру о чувствительности кожи и ваших пожеланиях к форме.',
 face:'Расскажите специалисту о чувствительности кожи и привычном уходе. Детали процедуры уточняются индивидуально.'
};

/** Three distinct details accompany the cover; the cover remains accessible after selection. */
function ServiceGallery({item}:{item:LumiService}){
 const gallery=galleryImagesFor(item);
 const photos=[gallery.main,...gallery.details.slice(0,3)];
 const [selected,setSelected]=useState(0);
 const [expanded,setExpanded]=useState(false);
 const origin=useRef<HTMLButtonElement>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const lightbox=useRef<HTMLDivElement>(null);
 const touchStart=useRef<number|null>(null);
 const didSwipe=useRef(false);
 const move=(direction:number)=>setSelected(current=>(current+direction+photos.length)%photos.length);
 useEffect(()=>{if(!expanded)return;requestAnimationFrame(()=>closeButton.current?.focus());const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();setExpanded(false);}else if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}else if(e.key==='ArrowRight'){e.preventDefault();move(1);}else if(e.key==='Tab'){const buttons=lightbox.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');if(!buttons?.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};document.addEventListener('keydown',onKey);return()=>{document.removeEventListener('keydown',onKey);origin.current?.focus({preventScroll:true});};},[expanded]);
 const start=(e:React.TouchEvent)=>{didSwipe.current=false;touchStart.current=e.changedTouches[0]?.clientX??null;};
 const end=(e:React.TouchEvent)=>{if(touchStart.current===null)return;const delta=e.changedTouches[0].clientX-touchStart.current;if(Math.abs(delta)>45){didSwipe.current=true;move(delta<0?1:-1);}touchStart.current=null;};
 return <>
  <div className="lumi-v4-gallery" aria-label={`Фотографии услуги ${item.name}`}>
   <div className="lumi-v4-gallery-rail">{gallery.details.slice(0,3).map((src,i)=><button type="button" key={`${src}-${i}`} className="lumi-v4-gallery-thumb" aria-label={`Показать фотографию ${i+1} услуги ${item.name}`} aria-pressed={selected===i+1} onClick={()=>setSelected(i+1)}><img src={image(src)} alt="" loading="lazy"/></button>)}</div>
   <button ref={origin} type="button" className="lumi-v4-gallery-main" aria-label={`Открыть фотографию услуги ${item.name} полностью`} onClick={()=>{if(didSwipe.current){didSwipe.current=false;return;}setExpanded(true);}} onTouchStart={start} onTouchEnd={end}><img src={image(photos[selected])} alt={`Демонстрационное изображение: ${item.name}`}/><span className="lumi-v4-gallery-counter" aria-hidden="true">{String(selected+1).padStart(2,'0')} / {String(photos.length).padStart(2,'0')}</span></button>
  </div>
  <div className="lumi-v4-gallery-actions"><span aria-live="polite">{selected===0?'ОСНОВНОЙ КАДР':`ФОТОГРАФИЯ ${selected} ИЗ ${photos.length-1}`}</span>{selected!==0&&<button type="button" onClick={()=>setSelected(0)}>Вернуться к основному <ArrowRight size={14}/></button>}</div>
  {expanded&&createPortal(<div ref={lightbox} className="lumi-v4-lightbox" role="dialog" aria-modal="true" aria-label={`Фотография услуги ${item.name}`} onTouchStart={start} onTouchEnd={end}>
   <button ref={closeButton} type="button" className="lumi-v4-lightbox-close" aria-label="Закрыть просмотр фотографии" onClick={()=>setExpanded(false)}><X size={23}/></button>
   <img src={image(photos[selected])} alt={`Демонстрационное изображение: ${item.name}, ${selected+1} из ${photos.length}`}/>
   <div className="lumi-v4-lightbox-controls"><button type="button" aria-label="Предыдущая фотография" onClick={()=>move(-1)}><ChevronLeft size={22}/></button><span aria-live="polite">{selected+1} / {photos.length}</span><button type="button" aria-label="Следующая фотография" onClick={()=>move(1)}><ChevronRight size={22}/></button></div>
  </div>,document.body)}
 </>;
}

export function LumiHome({services,masters,openService,openMaster,book,showServices,showCategory,showMasters,showVisits,nearest,nearestName}:Common&{showServices:()=>void;showCategory:(category:string)=>void;showMasters:()=>void;showVisits:()=>void;nearest?:Visit;nearestName?:string}){
 const picks=['Волосы','Ногти','Брови','Уход'].map(category=>services.filter(s=>s.category===category).sort((a,b)=>a.price-b.price)[0]).filter((s):s is LumiService=>!!s);
 const sideCategories=['Волосы','Ногти','Уход'];
 return <div className="lumi-editorial-home lumi-v4-home">
  <section className="lumi-hero lumi-v4-hero" aria-labelledby="lumi-hero-title">
   <div className="lumi-v4-brand"><strong>LUMI<span>.</span></strong><button type="button" onClick={()=>book()}>Записаться <ArrowRight size={16}/></button></div>
   <h1 id="lumi-hero-title">КРАСОТА<br/>В ДЕТАЛЯХ.<br/>ИСКУССТВО<br/>В ЗАБОТЕ.</h1>
   <div className="lumi-v4-hero-grid"><div className="lumi-v4-hero-rail">{homeGallery.details.slice(0,3).map((src,i)=><button type="button" key={`${src}-${i}`} aria-label={`Открыть направление: ${sideCategories[i]}`} onClick={()=>showCategory(sideCategories[i])}><img src={image(src)} alt=""/></button>)}</div><div className="lumi-v4-hero-portrait"><img src={image(homeGallery.main)} alt="Модель в студии красоты LUMI" fetchPriority="high"/></div></div>
   <div className="lumi-v4-hero-foot"><p>ВОЛОСЫ, НОГТИ, БРОВИ И УХОД.<br/>ВРЕМЯ ДЛЯ СЕБЯ — В ОДНОМ МЕСТЕ.</p><button type="button" aria-label="Все услуги" onClick={showServices}>ВСЕ УСЛУГИ <ArrowRight size={18}/></button></div>
  </section>
  {nearest&&<section className="lumi-v4-visit"><div><span>ВАША БЛИЖАЙШАЯ ЗАПИСЬ / ДЕМО</span><h2>{nearestName||'Ваш визит'}</h2><p>{dateLabel(nearest.date)} · {nearest.time} · {masters.find(m=>m.id===nearest.masterId)?.name}</p></div><button type="button" onClick={showVisits} aria-label="Мои записи"><ArrowRight size={21}/></button></section>}
  <section className="lumi-v4-section" aria-labelledby="lumi-direction-heading"><div className="lumi-v4-section-top"><span>01 / НАПРАВЛЕНИЯ</span><button type="button" onClick={showServices}>ВСЕ УСЛУГИ <ArrowRight size={16}/></button></div><h2 id="lumi-direction-heading">ВАША КРАСОТА.<br/>ВАШ ВЫБОР.</h2><div className="lumi-v4-categories">{picks.map((s,i)=><button type="button" key={s.id} className="lumi-v4-category" onClick={()=>showCategory(s.category)} data-lumi-focus={`featured-${s.id}`} aria-label={`Посмотреть услуги: ${s.category}`}><span className="lumi-v4-category-image"><img src={image(s.image)} alt="" loading="lazy"/><span>{String(i+1).padStart(2,'0')}</span></span><span className="lumi-v4-category-info"><strong>{s.category.toUpperCase()}</strong><small>от {money(s.price)}</small><ArrowRight size={17}/></span></button>)}</div></section>
  <section className="lumi-v4-manifesto"><div className="lumi-v4-rule"><span>02 / ПОДХОД</span><span>LUMI STUDIO</span></div><h2>ВНИМАНИЕ<br/>К КАЖДОЙ<br/>ДЕТАЛИ.</h2><div className="lumi-v4-manifesto-image"><img src={image(picks.find(s=>s.category==='Уход')?.image||homeGallery.main)} alt="Демонстрация ухода в студии" loading="lazy"/></div><div className="lumi-v4-manifesto-copy"><p>Понятные услуги, внимательные специалисты и время, которое принадлежит вам.</p><button type="button" onClick={showMasters}>ПОЗНАКОМИТЬСЯ С МАСТЕРАМИ <ArrowRight size={16}/></button></div></section>
  <section className="lumi-v4-section lumi-v4-people"><div className="lumi-v4-section-top"><span>03 / МАСТЕРА</span><button type="button" onClick={showMasters}>ВСЕ МАСТЕРА <ArrowRight size={16}/></button></div><h2>В ХОРОШИХ<br/>РУКАХ.</h2><div className="lumi-v4-master-track" role="region" aria-label="Мастера: горизонтальная прокрутка" tabIndex={0}>{masters.map(m=><button type="button" key={m.id} onClick={()=>openMaster(m.id)} aria-label={`Открыть профиль: ${m.name}`}><img src={image(m.image)} alt="" loading="lazy"/><strong>{m.name.toUpperCase()}</strong><small>{m.role}</small></button>)}</div></section>
  <section className="lumi-v4-final"><span>ВАШ СЛЕДУЮЩИЙ ВИЗИТ</span><h2>ДО ВСТРЕЧИ<br/>В LUMI.</h2><button type="button" onClick={()=>book()}>ВЫБРАТЬ ВРЕМЯ <ArrowRight size={19}/></button></section>
  <p className="lumi-v4-disclaimer">Это демонстрация: расписание и цены примерные, записи не отправляются и не оплачиваются. Фотографии и персонажи созданы для демо.</p>
 </div>;
}

export function LumiCatalog({services,category,setCategory,openService}:{services:LumiService[];category:string;setCategory:(category:string)=>void;openService:(id:string)=>void}){
 return <section className="lumi-v4-catalog"><div className="lumi-v4-page-heading"><span>LUMI / УСЛУГИ</span><h1>УСЛУГИ<br/>ДЛЯ ВАС.</h1><p>Выберите то, что подходит именно вам.</p></div><div className="lumi-v4-filter" role="group" aria-label="Категории услуг">{['Все','Волосы','Ногти','Брови','Уход'].map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="lumi-v4-list-heading"><h2>{category==='Все'?'ВСЕ УСЛУГИ':category.toUpperCase()}</h2><span>{String(services.length).padStart(2,'0')}</span></div><div className="lumi-v4-service-list">{services.map((s,i)=><article className="lumi-service-card lumi-v4-service" key={s.id}><button type="button" data-lumi-focus={`service-${s.id}`} aria-label={`Открыть услугу: ${s.name}`} onClick={()=>openService(s.id)}><span className="lumi-v4-service-photo"><img src={image(s.image)} alt="" loading={i<2?'eager':'lazy'}/></span><span className="lumi-v4-service-copy"><span className="lumi-v4-service-category">{s.category.toUpperCase()} / {String(i+1).padStart(2,'0')}</span><strong>{s.name}</strong><span className="lumi-v4-service-lead">{s.lead}</span><span className="lumi-v4-service-bottom"><b>{money(s.price)}</b><small>{s.minutes} мин</small></span></span><ArrowRight className="lumi-v4-service-arrow" size={17}/></button></article>)}</div>{!services.length&&<div className="lumi-v4-empty"><p>Пока нет доступных услуг в этой категории.</p><button type="button" onClick={()=>setCategory('Все')}>Посмотреть все услуги <ArrowRight size={16}/></button></div>}<p className="lumi-v4-disclaimer">Демонстрационное меню: услуги и цены показаны для примера.</p></section>;
}

export function LumiServicePage({item,masters,related,available,back,book,openMaster,openService}:{item:LumiService;masters:LumiMaster[];related:LumiService[];available:boolean;back:()=>void;book:()=>void;openMaster:(id:string)=>void;openService:(id:string)=>void}){
 return <article className="lumi-v4-detail lumi-ed-detail"><button type="button" className="lumi-v4-back" onClick={back}><ArrowLeft size={18}/> Назад</button><div className="lumi-v4-detail-head"><span>{item.category.toUpperCase()} / LUMI</span><span><Clock3 size={14}/> {item.minutes} мин</span></div><h1>{item.name.toUpperCase()}</h1><p className="lumi-v4-detail-lead">{item.lead}.</p><div className="lumi-v4-book-row"><div><small>СТОИМОСТЬ / ДЕМО</small><strong>{money(item.price)}</strong></div><button type="button" disabled={!available} onClick={book}>Записаться <ArrowRight size={17}/></button></div>{!available&&<p className="lumi-notice">Эта услуга временно недоступна для записи.</p>}<ServiceGallery key={item.id} item={item}/><div className="lumi-v4-detail-body">
  <section className="lumi-v4-description"><div className="lumi-v4-rule"><span>01 / ПРОЦЕДУРА</span><span>LUMI</span></div><h2>О ПРОЦЕДУРЕ.</h2><p>{item.description}</p></section><section className="lumi-v4-includes"><div className="lumi-v4-rule"><span>02 / ДЕТАЛИ</span><span>{String(item.includes.length).padStart(2,'0')}</span></div><h2>ЧТО ВХОДИТ.</h2><div>{item.includes.map((x,i)=><div key={x}><span>{String(i+1).padStart(2,'0')}</span><p>{x}</p></div>)}</div></section>
  <section className="lumi-v4-preparation"><div className="lumi-v4-rule"><span>03 / ПЕРЕД ВИЗИТОМ</span></div><h2>СТОИТ ЗНАТЬ.</h2><p>{preparations[item.id]}</p><details><summary>Как уточнить детали услуги?<span aria-hidden="true">+</span></summary><p>На первом шаге визита обсудите с мастером пожелания и особенности услуги. В этой демонстрации запись не отправляется в студию.</p></details></section>
  {masters.length>0&&<section className="lumi-v4-detail-masters"><div className="lumi-v4-rule"><span>04 / СПЕЦИАЛИСТ</span></div><h2>ВАШ МАСТЕР.</h2>{masters.map(m=><button key={m.id} type="button" onClick={()=>openMaster(m.id)} aria-label={`Открыть профиль: ${m.name}`}><img src={image(m.image)} alt="" loading="lazy"/><span><strong>{m.name.toUpperCase()}</strong><small>{m.role}</small></span><ArrowRight size={18}/></button>)}</section>}
  {related.length>0&&<section className="lumi-v4-related"><div className="lumi-v4-rule"><span>ОТКРОЙТЕ ДЛЯ СЕБЯ</span></div><h2>ТАКЖЕ В LUMI.</h2><div>{related.slice(0,3).map(s=><button type="button" key={s.id} onClick={()=>openService(s.id)} aria-label={`Открыть услугу: ${s.name}`}><img src={image(s.image)} alt="" loading="lazy"/><strong>{s.name}</strong><small>{s.minutes} мин · {money(s.price)}</small></button>)}</div></section>}
  <div className="lumi-v4-detail-end"><div><span>СТОИМОСТЬ / ДЕМО</span><strong>{money(item.price)} · {item.minutes} мин</strong></div><button type="button" disabled={!available} onClick={book}>Записаться <ArrowRight size={17}/></button></div><p className="lumi-v4-disclaimer">Демонстрационная услуга. Фотографии созданы ИИ; запись не отправляется и не оплачивается.</p></div></article>;
}
