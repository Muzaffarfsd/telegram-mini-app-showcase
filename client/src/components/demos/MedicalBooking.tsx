import medicalPreviews from './imagePreview-medical.json';
import { previewProps } from './imagePreview';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, Clock, X } from 'lucide-react';
import { medicalServices } from './MedicalServiceData';
import './MedicalBooking.css';

/** The booking flow is deliberately local: no patient information is stored or transmitted. */
export type MedicalDoctor = {
  id: string;
  name: string;
  specialty: string;
  price: number;
  duration: number;
  image: string;
};

type Appointment = { id: string; doctorId: string; serviceId?: string; date: string; time: string; duration: number; price: number };
type Step = 'services' | 'doctors' | 'time' | 'contact' | 'success' | 'appointments';
type Props = { doctors: MedicalDoctor[]; initialDoctorId?: string; initialServiceId?: string; initialMode?: 'booking' | 'appointments'; onClose: () => void };
type FlowSnapshot = { step: Step; serviceId: string; doctorId: string; date: string; time: string; editingId: string; success: Appointment | null; cancelId: string };
type FlowSession = { id: string; mode: 'booking' | 'appointments'; next: number; states: Map<number, FlowSnapshot> };
type FlowMarker = { id: string; mode: 'booking' | 'appointments'; token: number; depth: number };
// Only appointment choices are kept transiently in memory; contacts never enter browser history or localStorage.
const flowSessions = new Map<string, FlowSession>();

const STORAGE_KEY = 'medical-demo-appointments-v1';
const SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const isoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const toDate = (date: string) => new Date(`${date}T12:00:00`);
const validDate = (date: unknown): date is string => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(toDate(date).getTime()) && isoDate(toDate(date)) === date;
const fullDate = (date: string) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' }).format(toDate(date));
const dayOfWeek = (date: string) => new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(toDate(date)).replace('.', '');
const dayOfMonth = (date: string) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(toDate(date)).replace('.', '');
const formatPrice = (price: number) => `${new Intl.NumberFormat('ru-RU').format(price)} ₽`;
const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const createDates = () => Array.from({ length: 14 }, (_, index) => { const day = new Date(); day.setHours(12, 0, 0, 0); day.setDate(day.getDate() + index); return isoDate(day); });

function readAppointments(): Appointment[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is Appointment => item && typeof item.id === 'string' && typeof item.doctorId === 'string' && validDate(item.date) && SLOTS.includes(item.time) && Number.isInteger(item.duration) && item.duration >= 1 && item.duration <= 600 && Number.isInteger(item.price) && item.price >= 0 && item.price <= 1000000).map(item => ({id:item.id,doctorId:item.doctorId,...(typeof item.serviceId === 'string' ? {serviceId:item.serviceId} : {}),date:item.date,time:item.time,duration:item.duration,price:item.price}));
  } catch { return []; }
}

function slotIsPast(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime() <= Date.now();
}

function hasConflict(rows: Appointment[], doctor: MedicalDoctor, duration: number, date: string, time: string, editingId: string) {
  return rows.some(row => row.id !== editingId && row.doctorId === doctor.id && row.date === date && minutes(time) < minutes(row.time) + row.duration && minutes(row.time) < minutes(time) + duration);
}
const legacyServiceIds:Record<string,string> = {anna:'therapy',cardio:'cardiology',neuro:'neurology',maria:'endocrinology'};
function appointmentService(row:Appointment){return medicalServices.find(item=>item.id===(row.serviceId || legacyServiceIds[row.doctorId]));}
function isPast(row:Appointment){return new Date(`${row.date}T${row.time}:00`).getTime()+row.duration*60000<=Date.now();}
function downloadCalendar(row:Appointment){
  const start=new Date(`${row.date}T${row.time}:00`),end=new Date(start.getTime()+row.duration*60000);
  const stamp=(date:Date)=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const fold=(line:string)=>{const encoder=new TextEncoder();let part='',bytes=0;const lines:string[]=[];for(const char of line){const size=encoder.encode(char).length;if(bytes+size>75){lines.push(part);part=' ';bytes=1;}part+=char;bytes+=size;}lines.push(part);return lines.join('\r\n');};
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//WEB4TG//Medical Demo//RU','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:demo-${row.id.replace(/[^a-zA-Z0-9-]/g,'')}@web4tg.local`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,'SUMMARY:Демонстрационная запись','DESCRIPTION:Это пример записи. Настоящий приём не забронирован.','BEGIN:VALARM','TRIGGER:-PT24H','ACTION:DISPLAY','DESCRIPTION:Напоминание о демонстрационной записи','END:VALARM','END:VEVENT','END:VCALENDAR',''].map(fold).join('\r\n');
  const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='demo-visit.ics';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
function VisitCard({row,doctors,cancelId,onCancel,onCancelId,onReschedule}:{row:Appointment;doctors:MedicalDoctor[];cancelId:string;onCancel:(id:string)=>void;onCancelId:(id:string)=>void;onReschedule:(row:Appointment)=>void}){
  const [calendarError,setCalendarError]=useState(false);
  const doctor=doctors.find(item=>item.id===row.doctorId),service=appointmentService(row),past=isPast(row);
  return <article className="medical-booking__appointment"><div className="medical-booking__appointment-top"><span>{past?'ПРОШЛАЯ ДЕМО-ЗАПИСЬ':'ПРЕДСТОЯЩАЯ ДЕМО-ЗАПИСЬ'}</span><span>{formatPrice(row.price)}</span></div><h2>{service?.heading || 'Демо-консультация'}</h2><p>{doctor?.name || 'Специалист'} · {row.duration} мин</p><div className="medical-booking__appointment-date"><CalendarDays size={17}/>{fullDate(row.date)}, {row.time}</div>{service && <details className="medical-booking__preparation"><summary>Перед визитом <span aria-hidden="true">+</span></summary><p>{service.preparation}</p>{service.id==='checkup-basic' && <p>Время в записи относится к первой встрече. Анализы и обсуждение результатов проходят отдельно.</p>}<small>Условия приведены для примера. Подготовку к настоящему приёму уточняют в клинике.</small></details>}{!past && <button type="button" className="medical-booking__calendar" onClick={()=>{try{downloadCalendar(row);setCalendarError(false);}catch{setCalendarError(true);}}}><CalendarDays size={17}/> Добавить в календарь</button>}{calendarError && <p className="medical-booking__error" role="alert">Не удалось подготовить файл календаря в этом браузере.</p>}{!past && <p className="medical-booking__calendar-note">Файл без имени и названия услуги содержит напоминание за день; уведомления зависят от вашего календаря.</p>}{!past && <details className="medical-booking__telegram-preview"><summary>Напоминание в Telegram <span aria-hidden="true">+</span></summary><div><small>БЛИЖЕ · ПРИМЕР</small><p>Завтра у вас запланирован визит. Откройте приложение, чтобы проверить детали.</p></div><p>В этом демо сообщения не отправляются.</p></details>}<div className="medical-booking__actions">{!past && <button type="button" onClick={()=>onReschedule(row)}>Перенести</button>}<button type="button" onClick={()=>onCancelId(row.id)}>Удалить</button></div>{cancelId===row.id && <div className="medical-booking__cancel"><p>Удалить эту демо-запись?</p><button type="button" onClick={()=>onCancel(row.id)}>Да, удалить</button><button type="button" onClick={()=>onCancelId('')}>Оставить</button></div>}</article>
}

/** initialMode="appointments" opens the saved demo visits; initialDoctorId preselects a doctor. */
export default function MedicalBooking({ doctors, initialDoctorId, initialServiceId, initialMode = 'booking', onClose }: Props) {
  const initialDoctor = doctors.find(doctor => doctor.id === initialDoctorId);
  const initialService = medicalServices.find(item => item.id === initialServiceId);
  const entry = (typeof history !== 'undefined' ? history.state?.__medicalFlow : null) as FlowMarker | null;
  const reusable = entry?.mode === initialMode ? flowSessions.get(entry.id) : undefined;
  const validEntry = !!(entry && reusable && reusable.states.has(entry.token));
  const flowRef = useRef<FlowSession>(validEntry ? reusable! : {id:`medical-flow-${Date.now()}-${Math.random()}`,mode:initialMode,next:0,states:new Map()});
  const restored = validEntry ? flowRef.current.states.get(entry!.token) : undefined;
  const tokenRef = useRef(validEntry ? entry!.token : 0);
  const depthRef = useRef(validEntry ? entry!.depth : 0);
  const [step, setStep] = useState<Step>(restored?.step || (initialMode === 'appointments' ? 'appointments' : initialService && initialDoctor && initialService.doctorIds.includes(initialDoctor.id) ? 'time' : initialService ? 'doctors' : 'services'));
  const [serviceId, setServiceId] = useState(restored?.serviceId || initialService?.id || '');
  const [doctorId, setDoctorId] = useState(restored?.doctorId || initialDoctor?.id || '');
  const [rows, setRows] = useState<Appointment[]>(readAppointments);
  const [date, setDate] = useState(restored?.date || '');
  const [time, setTime] = useState(restored?.time || '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState(restored?.editingId || '');
  const [success, setSuccess] = useState<Appointment | null>(restored?.success || null);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState(restored?.cancelId || '');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const backRef = useRef<() => void>(() => {});
  const exitRef = useRef<() => void>(() => {});
  closeRef.current = onClose;
  const doctor = doctors.find(item => item.id === doctorId);
  const service = medicalServices.find(item => item.id === serviceId);
  const editing = rows.find(item=>item.id===editingId);
  const duration = editing?.duration ?? service?.duration ?? 0;
  const price = editing?.price ?? service?.price ?? 0;
  const compatibleDoctors = doctors.filter(item => !service || service.doctorIds.includes(item.id));
  const serviceDoctor = initialDoctor && doctorId === initialDoctor.id ? initialDoctor : undefined;
  const visibleServices = medicalServices.filter(item => !serviceDoctor || item.doctorIds.includes(serviceDoctor.id));
  const dates = useMemo(createDates, []);

  useEffect(() => {
    flowRef.current.states.set(tokenRef.current, {step,serviceId,doctorId,date,time,editingId,success,cancelId});
  }, [step,serviceId,doctorId,date,time,editingId,success,cancelId]);
  useEffect(() => {
    const flow = flowRef.current;
    flowSessions.set(flow.id, flow);
    while (flowSessions.size > 12) { const oldest = flowSessions.keys().next().value; if (!oldest) break; flowSessions.delete(oldest); }
    const currentEntry = history.state?.__medicalFlow as FlowMarker | undefined;
    if (!currentEntry || currentEntry.id !== flow.id || currentEntry.mode !== initialMode || !flow.states.has(currentEntry.token)) {
      history.replaceState({...history.state, __medicalFlow:{id:flow.id,mode:flow.mode,token:0,depth:0}},'',location.href);
    }
    const onPop = (event: PopStateEvent) => {
      const marker = event.state?.__medicalFlow as FlowMarker | undefined;
      if (!marker || marker.id !== flow.id || marker.mode !== flow.mode) return;
      const saved = flow.states.get(marker.token);
      if (!saved) return;
      tokenRef.current = marker.token; depthRef.current = marker.depth;
      setStep(saved.step); setServiceId(saved.serviceId || ''); setDoctorId(saved.doctorId); setDate(saved.date); setTime(saved.time);
      setEditingId(saved.editingId); setSuccess(saved.success); setCancelId(saved.cancelId); setError('');
      requestAnimationFrame(() => document.querySelector('.medical-booking__scroll')?.scrollTo({top:0,behavior:'auto'}));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus({ preventScroll: true });
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && dialogRef.current?.contains(document.activeElement)) { exitRef.current(); }
    };
    window.addEventListener('keydown', listener);
    return () => { window.removeEventListener('keydown', listener); if (previous?.isConnected) previous.focus({preventScroll:true}); };
  }, []);
  useEffect(() => { const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY) setRows(readAppointments()); }; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync); }, []);
  useEffect(() => {
    const button = (window as any).Telegram?.WebApp?.BackButton;
    if (!button) return;
    const handler = () => backRef.current();
    button.onClick?.(handler); button.show?.();
    return () => { button.offClick?.(handler); button.hide?.(); };
  }, []);

  function changeStep(next: Step) {
    setError('');
    const flow = flowRef.current;
    const token = ++flow.next; const depth = depthRef.current + 1;
    tokenRef.current = token; depthRef.current = depth;
    history.pushState({...history.state,__medicalFlow:{id:flow.id,mode:flow.mode,token,depth}},'',location.href);
    setStep(next);
    requestAnimationFrame(() => document.querySelector('.medical-booking__scroll')?.scrollTo({ top: 0, behavior: 'auto' }));
  }
  function exitFlow() {
    const marker = history.state?.__medicalFlow as FlowMarker | undefined;
    if (marker?.id === flowRef.current.id && marker.depth > 0) history.go(-marker.depth - 1);
    else closeRef.current();
  }
  function chooseService(id: string) { const item=medicalServices.find(entry=>entry.id===id); if(!item)return; setServiceId(id);setDate('');setTime(''); if (doctor && item.doctorIds.includes(doctor.id)) changeStep('time'); else {setDoctorId('');changeStep('doctors');} }
  function chooseDoctor(id: string) { if(!service?.doctorIds.includes(id)) return; setDoctorId(id); setDate(''); setTime(''); changeStep('time'); }
  function back() {
    if (step === 'success' || step === 'appointments') return exitFlow();
    if (depthRef.current > 0) { history.back(); return; }
    if (step === 'services') return exitFlow();
    if (step === 'doctors' && initialService && initialMode === 'booking') return exitFlow();
    if (step === 'time' && initialService && initialDoctor && initialMode === 'booking') return exitFlow();
    if (step === 'contact') return changeStep('time');
    if (editingId) { setEditingId(''); return changeStep('appointments'); }
    return changeStep(step === 'doctors' ? 'services' : 'doctors');
  }
  backRef.current = back; exitRef.current = exitFlow;
  function persist(next: Appointment[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setRows(next); return true; }
    catch { setError('Не удалось сохранить демо-запись в этом браузере. Проверьте настройки хранения данных.'); return false; }
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!doctor || !service || !service.doctorIds.includes(doctor.id) || !date || !time || !dates.includes(date) || !SLOTS.includes(time)) { setError('Выберите услугу, специалиста, дату и время.'); return; }
    if (name.trim().length < 2 || phone.replace(/\D/g, '').length < 10) { setError('Укажите имя и телефон: не менее 10 цифр.'); return; }
    const fresh = readAppointments();
    if (editingId && !fresh.some(row => row.id === editingId)) { setRows(fresh); setError('Эта демо-запись уже удалена. Выберите другую.'); return; }
    const stored = editingId ? fresh.find(row=>row.id===editingId) : undefined;
    const bookingDuration=stored?.duration ?? service.duration, bookingPrice=stored?.price ?? service.price;
    if (slotIsPast(date, time) || hasConflict(fresh, doctor, bookingDuration, date, time, editingId)) { setRows(fresh); setTime(''); changeStep('time'); setError('Время больше недоступно в этом демо. Выберите другое.'); return; }
    const appointment: Appointment = { id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, doctorId: doctor.id, serviceId:service.id, date, time, duration: bookingDuration, price: bookingPrice };
    const next = editingId ? fresh.map(row => row.id === editingId ? appointment : row) : [appointment, ...fresh];
    if (persist(next)) { setSuccess(appointment); setName(''); setPhone(''); setEditingId(''); changeStep('success'); }
  }
  function cancel(id: string) {
    const fresh = readAppointments();
    if (persist(fresh.filter(row => row.id !== id))) setCancelId('');
  }
  function reschedule(row: Appointment) {
    const item=appointmentService(row);
    if (!item || !item.doctorIds.includes(row.doctorId) || !doctors.some(entry => entry.id === row.doctorId)) { setError('Услуга или специалист больше не доступны в демо. Создайте новую запись.'); return; }
    setEditingId(row.id);setServiceId(item.id);setDoctorId(row.doctorId);setDate('');setTime('');setName('');setPhone('');changeStep('time');
  }

  return <div ref={dialogRef} tabIndex={-1} className="medical-booking" role="dialog" aria-modal="false" aria-label={step === 'appointments' ? 'Мои демо-записи' : 'Запись к специалисту'}>
    <div className="medical-booking__shell">
      <header className="medical-booking__header">
        <button className="medical-booking__icon" type="button" onClick={back} aria-label="Назад"><ArrowLeft size={21} strokeWidth={1.6} /></button>
        <span>{step === 'appointments' ? 'МОИ ЗАПИСИ' : step === 'success' ? 'ГОТОВО' : 'ЗАПИСЬ НА ПРИЁМ'}</span>
        <button className="medical-booking__icon" type="button" onClick={exitFlow} aria-label="Закрыть"><X size={21} strokeWidth={1.6} /></button>
      </header>
      <main className="medical-booking__scroll">
        {step !== 'appointments' && step !== 'success' && <div className="medical-booking__progress" aria-label={`Шаг ${step === 'services' ? 1 : step === 'doctors' ? 2 : step === 'time' ? 3 : 4} из 4`}>{[0,1,2,3].map(index=><span key={index} className={index<=({services:0,doctors:1,time:2,contact:3}[step] ?? 0) ? 'is-active' : ''}/>)}</div>}
        {step === 'services' && <section>
          <p className="medical-booking__eyebrow">01 / УСЛУГА</p><h1>Что вы хотите<br/>выбрать?</h1>
          <p className="medical-booking__intro">{serviceDoctor ? `Услуги специалиста ${serviceDoctor.name}. Стоимость и расписание — примеры.` : 'Выберите консультацию, исследование или программу. Стоимость и расписание — примеры.'}</p>
          {serviceDoctor && <button className="medical-booking__all-services" type="button" onClick={()=>setDoctorId('')}>Посмотреть все услуги <ArrowRight size={16}/></button>}
          <div className="medical-booking__doctor-list">{visibleServices.map(item=><button type="button" className="medical-booking__doctor-row medical-booking__service-row" key={item.id} onClick={()=>chooseService(item.id)}><img src={`/medical/generated/${item.photos[0]}.webp`} {...previewProps(`/medical/generated/${item.photos[0]}.webp`,medicalPreviews)} alt=""/><span><small>{item.category}</small><strong>{item.heading}</strong><b>{formatPrice(item.price)} · {item.duration} мин</b></span><ChevronRight size={18}/></button>)}</div>
          {!visibleServices.length && <p className="medical-booking__hint">Для этого специалиста пока нет услуг в демо.</p>}
        </section>}
        {step === 'doctors' && <section>
          <p className="medical-booking__eyebrow">02 / СПЕЦИАЛИСТ</p><h1>К кому вы<br/>хотите записаться?</h1>
          <p className="medical-booking__intro">{service ? `Услуга: ${service.heading}. Выберите специалиста.` : 'Сначала выберите услугу.'}</p>
          <div className="medical-booking__doctor-list">{compatibleDoctors.map(item => <button type="button" className="medical-booking__doctor-row" key={item.id} onClick={() => chooseDoctor(item.id)}>
            <img src={item.image} {...previewProps(item.image,medicalPreviews)} alt=""/><span><strong>{item.name}</strong><small>{item.specialty}</small><b>{service ? `${formatPrice(service.price)} · ${service.duration} мин` : ''}</b></span><ChevronRight size={18}/>
          </button>)}</div>
          {!compatibleDoctors.length && <p className="medical-booking__hint">Для этой услуги нет специалиста в демо. Попробуйте другое направление.</p>}
        </section>}
        {step === 'time' && doctor && service && <section>
          <p className="medical-booking__eyebrow">03 / ДАТА И ВРЕМЯ</p><h1>Выберите удобное<br/>время</h1>
          <div className="medical-booking__selected"><img src={doctor.image} {...previewProps(doctor.image,medicalPreviews)} alt=""/><div><small>{service.heading}</small><strong>{doctor.name}</strong><span>{duration} мин · {formatPrice(price)}</span></div>{!editingId && <button type="button" onClick={() => changeStep('doctors')} aria-label="Изменить специалиста"><ChevronRight size={19}/></button>}</div>
          {service.id==='checkup-basic' && <p className="medical-booking__hint">Длительность относится к первой встрече. Анализы и обсуждение результатов в демо проходят отдельно.</p>}
          <p className="medical-booking__section-label">Дата приёма</p>
          <div className="medical-booking__dates" aria-label="Дата приёма">{dates.map(day => <button key={day} type="button" className={date === day ? 'is-selected' : ''} aria-pressed={date === day} onClick={() => { setDate(day); setTime(''); setError(''); }}><span>{dayOfWeek(day)}</span><strong>{dayOfMonth(day)}</strong></button>)}</div>
          <p className="medical-booking__section-label">Время приёма</p>
          {date ? <div className="medical-booking__times">{SLOTS.map(slot => { const unavailable = slotIsPast(date, slot) || hasConflict(rows, doctor, duration, date, slot, editingId); return <button type="button" key={slot} disabled={unavailable} className={time === slot ? 'is-selected' : ''} aria-pressed={time === slot} onClick={() => { setTime(slot); setError(''); }}>{slot}</button>; })}</div> : <p className="medical-booking__hint">Сначала выберите дату, чтобы увидеть время.</p>}
          <p className="medical-booking__demo-note">Время демонстрационное и не отражает реальное расписание клиники.</p>
          {error && <p className="medical-booking__error" role="alert">{error}</p>}
        </section>}
        {step === 'contact' && doctor && service && <section>
          <p className="medical-booking__eyebrow">04 / КОНТАКТЫ</p><h1>Почти готово</h1><p className="medical-booking__intro">Проверьте детали и заполните контактные данные.</p>
          <div className="medical-booking__summary"><span>{service.heading}</span><strong>{doctor.name}</strong><p><CalendarDays size={16}/> {fullDate(date)}, {time}</p><p><Clock size={16}/> {duration} мин · {formatPrice(price)}</p>{service.id==='checkup-basic' && <p>Длительность — первая встреча; анализы и обсуждение результатов отдельно.</p>}</div>
          <form id="medical-booking-contact" onSubmit={submit} noValidate>
            <label className="medical-booking__field">Ваше имя<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" placeholder="Как к вам обращаться" maxLength={80} required /></label>
            <label className="medical-booking__field">Телефон<input value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="+7 (___) ___-__-__" maxLength={30} required /></label>
            <p className="medical-booking__demo-note">Это демо: имя и телефон никуда не отправляются и не сохраняются. Выбранная услуга, специалист и время остаются только в этом браузере.</p>
            {error && <p className="medical-booking__error" role="alert">{error}</p>}
          </form>
        </section>}
        {step === 'success' && success && <section className="medical-booking__success">
          <div className="medical-booking__check"><Check size={26} strokeWidth={1.6}/></div><p className="medical-booking__eyebrow">ДЕМОНСТРАЦИОННАЯ ЗАПИСЬ</p><h1>Готово</h1><p className="medical-booking__intro">Вы сохранили пример записи в этом браузере. Настоящий приём не забронирован.</p>
          <div className="medical-booking__summary"><span>{appointmentService(success)?.heading || 'Демо-консультация'}</span><strong>{doctors.find(item => item.id === success.doctorId)?.name}</strong><p><CalendarDays size={16}/> {fullDate(success.date)}, {success.time}</p><p><Clock size={16}/> {success.duration} мин · {formatPrice(success.price)}</p></div>
          {appointmentService(success) && <div className="medical-booking__success-prep"><span>ПЕРЕД ВИЗИТОМ</span><p>{appointmentService(success)?.preparation}</p>{success.serviceId==='checkup-basic' && <p>Длительность относится к первой встрече; анализы и обсуждение результатов — отдельно.</p>}<small>Условия демонстрационные: подготовку к настоящему приёму уточняют в клинике.</small></div>}
          <button className="medical-booking__primary" type="button" onClick={() => changeStep('appointments')}>Мои записи <ArrowRight size={18}/></button><button className="medical-booking__text-button" type="button" onClick={exitFlow}>Закрыть</button>
        </section>}
        {step === 'appointments' && <section><p className="medical-booking__eyebrow">ЛИЧНЫЙ КАБИНЕТ</p><h1>Мои записи</h1><p className="medical-booking__intro">Демо-записи сохраняются только в этом браузере и не являются бронированием. Имя и телефон не сохраняются.</p>
          {rows.length === 0 ? <div className="medical-booking__empty"><CalendarDays size={25} strokeWidth={1.4}/><h2>Пока нет записей</h2><p>Выберите услугу, специалиста и удобное время.</p><button type="button" onClick={() => { setEditingId('');setServiceId('');setDoctorId('');changeStep('services'); }}>Выбрать услугу <ArrowRight size={16}/></button></div> : <div className="medical-booking__appointments">{[false,true].map(past=>{const list=rows.filter(row=>isPast(row)===past).sort((a,b)=>past?`${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`):`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));return list.length>0?<section className="medical-booking__visit-group" key={String(past)}><h2>{past?'История визитов':'Предстоящие визиты'}</h2>{list.map(row=><VisitCard key={row.id} row={row} doctors={doctors} cancelId={cancelId} onCancel={cancel} onCancelId={setCancelId} onReschedule={reschedule}/>)}</section>:null})}</div>}
          {error && <p className="medical-booking__error" role="alert">{error}</p>}
          {rows.length > 0 && <button type="button" className="medical-booking__secondary" onClick={() => { setEditingId('');setServiceId('');setDoctorId('');changeStep('services'); }}>Новая демо-запись <ArrowRight size={18}/></button>}
        </section>}
      </main>
      {step === 'time' && <div className="medical-booking__footer"><button type="button" className="medical-booking__primary" disabled={!date || !time} onClick={() => changeStep('contact')}>Продолжить <ArrowRight size={18}/></button></div>}
      {step === 'contact' && <div className="medical-booking__footer"><button type="submit" form="medical-booking-contact" className="medical-booking__primary" onMouseDown={event => { if (document.activeElement instanceof HTMLInputElement) event.preventDefault(); }}>Сохранить демо-запись <ArrowRight size={18}/></button></div>}
    </div>
  </div>;
}
