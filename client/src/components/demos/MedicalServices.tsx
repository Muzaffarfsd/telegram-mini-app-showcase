import medicalPreviews from './imagePreview-medical.json';
import { previewProps } from './imagePreview';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock3, Search } from 'lucide-react';
import { GalleryInlineZoom } from './GalleryInlineZoom';
import type { MedicalDoctor } from './MedicalBooking';
import './MedicalServices.css';

import { medicalServices, medicalServiceFor, type MedicalService } from './MedicalServiceData';
const services = medicalServices;

const asset=(name:string)=>`/medical/generated/${name}.webp`;
const money=(price:number)=>`${new Intl.NumberFormat('ru-RU').format(price)} ₽`;

function ServiceGallery({item,doctor}:{item:MedicalService;doctor:MedicalDoctor}){
 const images=[...item.photos.slice(0,3).map(asset),doctor.image];
 const descriptions=[`Иллюстрация услуги: ${item.heading}`,`Иллюстрация медицинского пространства: ${item.heading}`,`Иллюстрация заботы: ${item.heading}`,`Демонстрационный портрет специалиста ${doctor.name}`];
 const [selected,setSelected]=useState(0);
 useEffect(()=>{setSelected(0)},[item.slug]);
 return <><div className="medsvc-gallery" aria-label={`Фотографии: ${item.heading}`}><div className="medsvc-gallery-rail">{images.slice(1).map((src,index)=><button type="button" key={src} aria-label={`Показать фотографию ${index+2}: ${item.heading}`} aria-pressed={selected===index+1} onClick={event=>{setSelected(index+1);event.currentTarget.focus({preventScroll:true})}}><img src={src} {...previewProps(src,medicalPreviews)} alt="" loading="lazy"/></button>)}</div><GalleryInlineZoom className="medsvc-gallery-main" src={images[selected]} preview={previewProps(images[selected],medicalPreviews)} alt={descriptions[selected]} label={item.heading} counter={`${String(selected+1).padStart(2,'0')} / 04`}/></div><div className="medsvc-gallery-caption"><span aria-live="polite">{selected===0?'ОСНОВНОЙ КАДР':`ФОТОГРАФИЯ ${selected+1} / 04`}</span>{selected!==0&&<button type="button" onClick={()=>setSelected(0)}>Основной кадр <ArrowRight size={14}/></button>}</div></>;
}

export function MedicalCatalog({onBack,onOpen}:{onBack:()=>void;onOpen:(id:string)=>void}){
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState('Все');
 const categories=['Все','Консультации','Диагностика','Программы'];
 const visible=useMemo(()=>services.filter(item=>(category==='Все'||item.category===category)&&`${item.title} ${item.heading} ${item.label} ${item.topics.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())),[query,category]);
 return <div className="medsvc-page medsvc-catalog">
  <button type="button" className="medsvc-back" onClick={onBack}><ArrowLeft size={18}/> Главная</button>
  <div className="medsvc-page-kicker"><span>БЛИЖЕ / УСЛУГИ</span><span>01 — {String(services.length).padStart(2,'0')}</span></div>
  <h1>ЗАБОТА<br/>НАЧИНАЕТСЯ<br/><span>С ВНИМАНИЯ.</span></h1>
  <div className="medsvc-catalog-intro"><p>Консультации, исследования и программы заботы о здоровье.</p><ArrowRight size={19}/></div>
  <div className="medsvc-catalog-banner"><img src={asset('med-v2-center-room')} {...previewProps(asset('med-v2-center-room'),medicalPreviews)} alt="Демонстрационное пространство медицинского центра"/><span>ПРОСТРАНСТВО ДЛЯ ВАШЕГО ЗДОРОВЬЯ</span></div>
  <label className="medsvc-search"><Search size={18}/><span className="medsvc-sr">Поиск услуги</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Найти услугу или направление"/></label>
  <div className="medsvc-categories" aria-label="Категории услуг">{categories.map(item=><button key={item} type="button" aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div>
  <div className="medsvc-rule"><span>УСЛУГИ / ДЕМО</span><span>{String(visible.length).padStart(2,'0')}</span></div>
  <div className="medsvc-list">{visible.map((item,index)=><button type="button" key={item.id} className="medsvc-list-item" onClick={()=>onOpen(item.id)} aria-label={`Открыть услугу: ${item.heading}`}><div className="medsvc-list-img"><img src={asset(item.photos[0])} {...previewProps(asset(item.photos[0]),medicalPreviews)} alt="" loading={index<2?'eager':'lazy'}/><span>{String(services.indexOf(item)+1).padStart(2,'0')}</span></div><div className="medsvc-list-copy"><span>{item.label.toUpperCase()}</span><strong>{item.heading}</strong><p>{item.lead}</p><div className="medsvc-list-meta">{money(item.price)} <span>·</span> {item.duration} мин</div><div>ПОДРОБНЕЕ <ArrowRight size={17}/></div></div></button>)}</div>
  {!visible.length&&<div className="medsvc-empty"><p>По вашему запросу ничего не найдено.</p><button type="button" onClick={()=>{setQuery('');setCategory('Все')}}>Показать все услуги <ArrowRight size={16}/></button></div>}
  <p className="medsvc-disclaimer">Демонстрационный медицинский центр: специалисты, стоимость, состав и расписание приведены для примера.</p>
 </div>;
}

export function MedicalServiceDetail({title,doctor,onBack,onBook,onDoctor,onOpen}:{title:string;doctor:MedicalDoctor;onBack:()=>void;onBook:(focusKey:'service'|'service-end')=>void;onDoctor:(id:string)=>void;onOpen:(title:string)=>void}){
 const item=medicalServiceFor(title);
 if (!item) return <div className="medsvc-page"><button type="button" className="medsvc-back" onClick={onBack}><ArrowLeft size={18}/> Назад</button><h1>Услуга не найдена</h1><p className="medsvc-lead">Вернитесь к каталогу и выберите услугу.</p></div>;
 return <article className="medsvc-page medsvc-detail"><button type="button" className="medsvc-back" onClick={onBack}><ArrowLeft size={18}/> Назад</button><div className="medsvc-page-kicker"><span>НАПРАВЛЕНИЕ / {item.title.toUpperCase()}</span><span><Clock3 size={14}/> {item.duration} МИН</span></div><h1>{item.heading.toUpperCase()}<span>.</span></h1><p className="medsvc-lead">{item.lead}</p><div className="medsvc-book-row"><div><span>УСЛУГА / ДЕМО</span><strong>{money(item.price)}</strong></div><button type="button" data-med-book="service" onClick={()=>onBook('service')}>Записаться <ArrowRight size={18}/></button></div>{item.id==='checkup-basic'&&<p className="medsvc-duration-note">60 минут — первая встреча. Анализы и обсуждение результатов проходят отдельно.</p>}<ServiceGallery key={item.slug} item={item} doctor={doctor}/><section className="medsvc-section"><div className="medsvc-rule"><span>01 / ОБ УСЛУГЕ</span><span>БЛИЖЕ</span></div><h2>ВНИМАНИЕ<br/>К ДЕТАЛЯМ.</h2><p>{item.description}</p></section><section className="medsvc-section"><div className="medsvc-rule"><span>02 / ПОВОДЫ ОБРАТИТЬСЯ</span><span>03</span></div><h2>ЧТО МОЖНО<br/>ОБСУДИТЬ.</h2><div className="medsvc-rows">{item.topics.map((topic,index)=><div key={topic}><span>{String(index+1).padStart(2,'0')}</span><p>{topic}</p><ArrowRight size={16}/></div>)}</div></section><section className="medsvc-visit"><div className="medsvc-rule"><span>03 / КАК ВСЁ ПРОХОДИТ</span><span>{item.duration} МИН</span></div><h2>ШАГ ЗА ШАГОМ.</h2><p>Специалист объяснит каждый этап и ответит на ваши вопросы.</p><div>{item.visit.map((step,index)=><div key={step}><strong>0{index+1}</strong><p>{step}</p></div>)}</div></section><section className="medsvc-section"><div className="medsvc-rule"><span>04 / ПЕРЕД ВИЗИТОМ</span><span>ВАЖНЫЕ ДЕТАЛИ</span></div><h2>ПОДГОТОВКА<br/>К ВСТРЕЧЕ.</h2><p>{item.preparation}</p><div className="medsvc-faq">{item.faq.map(f=><details key={f.question}><summary>{f.question}<span aria-hidden="true">+</span></summary><p>{f.answer}</p></details>)}</div></section><section className="medsvc-section"><div className="medsvc-rule"><span>05 / СПЕЦИАЛИСТ</span><span>КОМАНДА БЛИЖЕ</span></div><h2>ЧЕЛОВЕК,<br/>КОТОРЫЙ РЯДОМ.</h2><button type="button" className="medsvc-doctor" onClick={()=>onDoctor(doctor.id)} aria-label={`Открыть профиль специалиста ${doctor.name}`}><img src={doctor.image} {...previewProps(doctor.image,medicalPreviews)} alt="" loading="lazy"/><span><small>{doctor.specialty.toUpperCase()}</small><strong>{doctor.name}</strong><em>Профиль специалиста <ArrowRight size={16}/></em></span></button></section><section className="medsvc-section"><div className="medsvc-rule"><span>ТАКЖЕ В БЛИЖЕ</span><span>НАПРАВЛЕНИЯ</span></div><h2>ПОЗАБОТИТЬСЯ<br/>О СЕБЕ.</h2><div className="medsvc-related">{services.filter(s=>s.slug!==item.slug).map(s=><button type="button" key={s.slug} onClick={()=>onOpen(s.id)} aria-label={`Открыть услугу: ${s.heading}`}><img src={asset(s.photos[0])} {...previewProps(asset(s.photos[0]),medicalPreviews)} alt="" loading="lazy"/><span>{s.label.toUpperCase()}</span><strong>{s.heading}</strong><ArrowRight size={16}/></button>)}</div></section><div className="medsvc-end"><span>ВАШ СЛЕДУЮЩИЙ ШАГ</span><h2>ВРЕМЯ<br/>ДЛЯ СЕБЯ.</h2><p>{item.duration} мин · {money(item.price)} / демо</p><button type="button" data-med-book="service-end" onClick={()=>onBook('service-end')}>Выбрать время <ArrowRight size={19}/></button></div><p className="medsvc-disclaimer">Центр, специалисты, цены, состав и расписание вымышлены. Запись не отправляется и не оплачивается. Уточняйте подготовку для настоящего посещения.</p></article>;
}
