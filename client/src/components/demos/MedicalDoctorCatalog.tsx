import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Search, SlidersHorizontal } from 'lucide-react';
import type { MedicalDoctor } from './MedicalBooking';
import './MedicalDoctorCatalog.css';

type Props={doctors:MedicalDoctor[];onBack:()=>void;onDoctor:(id:string)=>void;onServices:()=>void};
type Period='all'|'morning'|'day'|'evening';
type LocalVisit={doctorId?:unknown;date?:unknown;time?:unknown;duration?:unknown};
const slots=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'];
const key=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const min=(t:string)=>Number(t.slice(0,2))*60+Number(t.slice(3,5));
const inPeriod=(t:string,p:Period)=>p==='all'||(p==='morning'&&min(t)<12*60)||(p==='day'&&min(t)>=12*60&&min(t)<16*60)||(p==='evening'&&min(t)>=16*60);
const money=(n:number)=>`${new Intl.NumberFormat('ru-RU').format(n)} ₽`;
function readVisits():LocalVisit[]{try{const x=JSON.parse(localStorage.getItem('medical-demo-appointments-v1')||'[]');return Array.isArray(x)?x:[]}catch{return []}}
function nextTime(doctor:MedicalDoctor,period:Period,rows:LocalVisit[]){
 const now=new Date();
 for(let i=0;i<14;i++){const date=new Date(now);date.setHours(12,0,0,0);date.setDate(date.getDate()+i);const day=key(date);
  for(const time of slots){if(!inPeriod(time,period)||new Date(`${day}T${time}:00`).getTime()<=now.getTime())continue;const start=min(time),end=start+doctor.duration;
   const busy=rows.some(row=>row.doctorId===doctor.id&&row.date===day&&typeof row.time==='string'&&/^\d{2}:\d{2}$/.test(row.time)&&Number.isFinite(row.duration)&&start<min(row.time)+Number(row.duration)&&min(row.time)<end);
   if(!busy)return {day,time};
  }
 }
 return null;
}
function labelDate(day:string){return new Intl.DateTimeFormat('ru-RU',{weekday:'short',day:'numeric',month:'short'}).format(new Date(`${day}T12:00:00`)).replace('.','');}

export default function MedicalDoctorCatalog({doctors,onBack,onDoctor,onServices}:Props){
 const [query,setQuery]=useState('');const [specialty,setSpecialty]=useState('all');const [price,setPrice]=useState('all');const [period,setPeriod]=useState<Period>('all');const [guide,setGuide]=useState(false);const [help,setHelp]=useState('');
 const [rows,setRows]=useState(readVisits);
 useEffect(()=>{const sync=(event:StorageEvent)=>{if(event.key==='medical-demo-appointments-v1'||event.key===null)setRows(readVisits())};window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync)},[]);
 const results=useMemo(()=>doctors.map(doctor=>({doctor,next:nextTime(doctor,period,rows)})).filter(({doctor,next})=>`${doctor.name} ${doctor.specialty}`.toLowerCase().includes(query.trim().toLowerCase())&&(specialty==='all'||doctor.specialty===specialty)&&(price==='all'||(price==='under'&&doctor.price<=4000)||(price==='over'&&doctor.price>4000))&&!!next),[doctors,query,specialty,price,period,rows]);
 const filterCount=[specialty!=='all',price!=='all',period!=='all'].filter(Boolean).length;
 function reset(){setQuery('');setSpecialty('all');setPrice('all');setPeriod('all')}
 return <div className="meddoccat"><button className="meddoccat-back" onClick={onBack}><ArrowLeft size={18}/> Главная</button><div className="meddoccat-top"><span>КОМАНДА / СПЕЦИАЛИСТЫ</span><span>БЛИЖЕ</span></div><h1>ВАШИ<br/>СПЕЦИАЛИСТЫ<span>.</span></h1><p className="meddoccat-lead">Найдите врача, узнайте о приёме и выберите удобное время.</p><label className="meddoccat-search"><Search size={19}/><span className="meddoccat-sr">Поиск врача или специальности</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Врач или специальность"/></label>
 <details className="meddoccat-filters"><summary><span><SlidersHorizontal size={17}/> Фильтры {filterCount>0&&<b>{filterCount}</b>}</span><span>Настроить +</span></summary><div className="meddoccat-filter-grid"><label>Направление<select value={specialty} onChange={e=>setSpecialty(e.target.value)}><option value="all">Все направления</option>{doctors.map(d=><option key={d.id} value={d.specialty}>{d.specialty}</option>)}</select></label><label>Стоимость приёма<select value={price} onChange={e=>setPrice(e.target.value)}><option value="all">Любая стоимость</option><option value="under">До 4 000 ₽ включительно</option><option value="over">Более 4 000 ₽</option></select></label><label>Время приёма<select value={period} onChange={e=>setPeriod(e.target.value as Period)}><option value="all">Любое время</option><option value="morning">Утро · 09:00–11:00</option><option value="day">День · 12:00–15:00</option><option value="evening">Вечер · 16:00–18:00</option></select></label></div><button className="meddoccat-reset" onClick={reset}>Сбросить фильтры</button><p>Время и цены демонстрационные. Доступность показана для примера.</p></details>
 <section className="meddoccat-guide"><div><span>ЕСЛИ ВЫ НЕ УВЕРЕНЫ</span><h2>Поможем<br/>начать.</h2><p>Выберите, что вы ищете, — покажем подходящий раздел приложения.</p><button onClick={()=>setGuide(v=>!v)} aria-expanded={guide}>{guide?'Свернуть':'Подобрать направление'} <ArrowRight size={16}/></button></div><div className="meddoccat-guide-mark" aria-hidden="true">✳</div>{guide&&<div className="meddoccat-guide-options"><button onClick={()=>setHelp('general')}>Хочу обсудить самочувствие <ArrowUpRight size={16}/></button><button onClick={()=>setHelp('exam')}>Ищу обследование <ArrowUpRight size={16}/></button><button onClick={()=>setHelp('unsure')}>Не знаю, с чего начать <ArrowUpRight size={16}/></button>{help&&<div className="meddoccat-guide-result">{help==='exam'?<><p>Посмотрите список консультаций и исследований, чтобы узнать подробности.</p><button onClick={onServices}>Все услуги <ArrowRight size={16}/></button></>:<><p>{help==='unsure'?'В качестве первого шага в демо можно познакомиться с терапевтом.':'С вопросами об общем самочувствии в демо можно обратиться к терапевту.'} Это не медицинская консультация.</p><button onClick={()=>onDoctor('anna')}>Профиль терапевта <ArrowRight size={16}/></button></>}</div>}</div>}</section>
 <div className="meddoccat-count"><span>СПЕЦИАЛИСТЫ / ДЕМО</span><span>{String(results.length).padStart(2,'0')}</span></div>{results.length?<div className="meddoccat-grid">{results.map(({doctor,next})=><button className="med-doctor-card meddoccat-card" key={doctor.id} onClick={()=>onDoctor(doctor.id)} aria-label={`Профиль специалиста ${doctor.name}`}><div className="meddoccat-image"><img src={doctor.image} alt="" loading="lazy"/><span><ArrowUpRight size={17}/></span></div><div className="meddoccat-card-copy"><small>{doctor.specialty}</small><h2>{doctor.name}</h2><p>{doctor.duration} мин <b>{money(doctor.price)}</b></p>{next&&<div className="meddoccat-next"><span>ПРИМЕР ВРЕМЕНИ</span><strong>{labelDate(next.day)} · {next.time}</strong></div>}</div></button>)}</div>:<div className="meddoccat-empty"><p>По выбранным условиям специалистов не найдено.</p><button onClick={reset}>Сбросить фильтры <ArrowRight size={16}/></button></div>}<p className="meddoccat-note">Все специалисты, цены и расписание вымышлены для демонстрации.</p></div>
}
