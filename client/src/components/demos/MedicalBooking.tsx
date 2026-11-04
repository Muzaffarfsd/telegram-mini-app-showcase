import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, ChevronRight, Clock, X } from 'lucide-react';
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

type Appointment = { id: string; doctorId: string; date: string; time: string; duration: number; price: number };
type Step = 'doctors' | 'time' | 'contact' | 'success' | 'appointments';
type Props = { doctors: MedicalDoctor[]; initialDoctorId?: string; initialMode?: 'booking' | 'appointments'; onClose: () => void };

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
    return value.filter((item): item is Appointment => item && typeof item.id === 'string' && typeof item.doctorId === 'string' && validDate(item.date) && SLOTS.includes(item.time) && Number.isInteger(item.duration) && item.duration >= 1 && item.duration <= 600 && Number.isInteger(item.price) && item.price >= 0 && item.price <= 1000000);
  } catch { return []; }
}

function slotIsPast(date: string, time: string) {
  return new Date(`${date}T${time}:00`).getTime() <= Date.now();
}

function hasConflict(rows: Appointment[], doctor: MedicalDoctor, date: string, time: string, editingId: string) {
  return rows.some(row => row.id !== editingId && row.doctorId === doctor.id && row.date === date && minutes(time) < minutes(row.time) + row.duration && minutes(row.time) < minutes(time) + doctor.duration);
}

/** initialMode="appointments" opens the saved demo visits; initialDoctorId preselects a doctor. */
export default function MedicalBooking({ doctors, initialDoctorId, initialMode = 'booking', onClose }: Props) {
  const initialDoctor = doctors.find(doctor => doctor.id === initialDoctorId);
  const [step, setStep] = useState<Step>(initialMode === 'appointments' ? 'appointments' : initialDoctor ? 'time' : 'doctors');
  const [doctorId, setDoctorId] = useState(initialDoctor?.id || '');
  const [rows, setRows] = useState<Appointment[]>(readAppointments);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState('');
  const [success, setSuccess] = useState<Appointment | null>(null);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const doctor = doctors.find(item => item.id === doctorId);
  const dates = useMemo(createDates, []);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus({ preventScroll: true });
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { closeRef.current(); return; }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', listener);
    return () => { window.removeEventListener('keydown', listener); previous?.focus(); };
  }, []);
  useEffect(() => { const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY) setRows(readAppointments()); }; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync); }, []);

  function changeStep(next: Step) {
    setError('');
    setStep(next);
    requestAnimationFrame(() => document.querySelector('.medical-booking__scroll')?.scrollTo({ top: 0, behavior: 'auto' }));
  }
  function chooseDoctor(id: string) { setDoctorId(id); setDate(''); setTime(''); changeStep('time'); }
  function back() {
    if (step === 'doctors' || step === 'appointments' || step === 'success') return onClose();
    if (step === 'contact') return changeStep('time');
    if (editingId) { setEditingId(''); return changeStep('appointments'); }
    return changeStep('doctors');
  }
  function persist(next: Appointment[]) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setRows(next); return true; }
    catch { setError('Не удалось сохранить демо-запись в этом браузере. Проверьте настройки хранения данных.'); return false; }
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!doctor || !date || !time) { setError('Выберите специалиста, дату и время.'); return; }
    if (name.trim().length < 2 || phone.replace(/\D/g, '').length < 10) { setError('Укажите имя и телефон: не менее 10 цифр.'); return; }
    const fresh = readAppointments();
    if (editingId && !fresh.some(row => row.id === editingId)) { setRows(fresh); setError('Эта демо-запись уже удалена. Выберите другую.'); return; }
    if (slotIsPast(date, time) || hasConflict(fresh, doctor, date, time, editingId)) { setRows(fresh); setTime(''); changeStep('time'); setError('Время больше недоступно в этом демо. Выберите другое.'); return; }
    const appointment: Appointment = { id: editingId || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, doctorId: doctor.id, date, time, duration: doctor.duration, price: doctor.price };
    const next = editingId ? fresh.map(row => row.id === editingId ? appointment : row) : [appointment, ...fresh];
    if (persist(next)) { setSuccess(appointment); setName(''); setPhone(''); setEditingId(''); changeStep('success'); }
  }
  function cancel(id: string) {
    const fresh = readAppointments();
    if (persist(fresh.filter(row => row.id !== id))) setCancelId('');
  }
  function reschedule(row: Appointment) {
    if (!doctors.some(item => item.id === row.doctorId)) { setError('Специалист больше не доступен в демо.'); return; }
    setEditingId(row.id); setDoctorId(row.doctorId); setDate(''); setTime(''); setName(''); setPhone(''); changeStep('time');
  }

  return <div ref={dialogRef} tabIndex={-1} className="medical-booking" role="dialog" aria-modal="true" aria-label={step === 'appointments' ? 'Мои демо-записи' : 'Запись к специалисту'}>
    <div className="medical-booking__shell">
      <header className="medical-booking__header">
        <button className="medical-booking__icon" type="button" onClick={back} aria-label="Назад"><ArrowLeft size={21} strokeWidth={1.6} /></button>
        <span>{step === 'appointments' ? 'МОИ ЗАПИСИ' : step === 'success' ? 'ГОТОВО' : 'ЗАПИСЬ НА ПРИЁМ'}</span>
        <button className="medical-booking__icon" type="button" onClick={onClose} aria-label="Закрыть"><X size={21} strokeWidth={1.6} /></button>
      </header>
      <main className="medical-booking__scroll">
        {step !== 'appointments' && step !== 'success' && <div className="medical-booking__progress" aria-label={`Шаг ${step === 'doctors' ? 1 : step === 'time' ? 2 : 3} из 3`}><span className="is-active"/><span className={step !== 'doctors' ? 'is-active' : ''}/><span className={step === 'contact' ? 'is-active' : ''}/></div>}
        {step === 'doctors' && <section>
          <p className="medical-booking__eyebrow">01 / СПЕЦИАЛИСТ</p><h1>К кому вы<br/>хотите записаться?</h1>
          <p className="medical-booking__intro">Выберите врача, чтобы посмотреть доступное время.</p>
          <div className="medical-booking__doctor-list">{doctors.map(item => <button type="button" className="medical-booking__doctor-row" key={item.id} onClick={() => chooseDoctor(item.id)}>
            <img src={item.image} alt=""/><span><strong>{item.name}</strong><small>{item.specialty}</small><b>{formatPrice(item.price)} · {item.duration} мин</b></span><ChevronRight size={18}/>
          </button>)}</div>
        </section>}
        {step === 'time' && doctor && <section>
          <p className="medical-booking__eyebrow">02 / ДАТА И ВРЕМЯ</p><h1>Выберите удобное<br/>время</h1>
          <div className="medical-booking__selected"><img src={doctor.image} alt=""/><div><small>{doctor.specialty}</small><strong>{doctor.name}</strong><span>{doctor.duration} мин · {formatPrice(doctor.price)}</span></div>{!editingId && <button type="button" onClick={() => changeStep('doctors')} aria-label="Изменить специалиста"><ChevronRight size={19}/></button>}</div>
          <p className="medical-booking__section-label">Дата приёма</p>
          <div className="medical-booking__dates" aria-label="Дата приёма">{dates.map(day => <button key={day} type="button" className={date === day ? 'is-selected' : ''} aria-pressed={date === day} onClick={() => { setDate(day); setTime(''); setError(''); }}><span>{dayOfWeek(day)}</span><strong>{dayOfMonth(day)}</strong></button>)}</div>
          <p className="medical-booking__section-label">Время приёма</p>
          {date ? <div className="medical-booking__times">{SLOTS.map(slot => { const unavailable = slotIsPast(date, slot) || hasConflict(rows, doctor, date, slot, editingId); return <button type="button" key={slot} disabled={unavailable} className={time === slot ? 'is-selected' : ''} aria-pressed={time === slot} onClick={() => { setTime(slot); setError(''); }}>{slot}</button>; })}</div> : <p className="medical-booking__hint">Сначала выберите дату, чтобы увидеть время.</p>}
          <p className="medical-booking__demo-note">Время демонстрационное и не отражает реальное расписание клиники.</p>
          {error && <p className="medical-booking__error" role="alert">{error}</p>}
          <button type="button" className="medical-booking__primary" disabled={!date || !time} onClick={() => changeStep('contact')}>Продолжить <ArrowRight size={18}/></button>
        </section>}
        {step === 'contact' && doctor && <section>
          <p className="medical-booking__eyebrow">03 / КОНТАКТЫ</p><h1>Почти готово</h1><p className="medical-booking__intro">Проверьте детали и заполните контактные данные.</p>
          <div className="medical-booking__summary"><span>{doctor.specialty}</span><strong>{doctor.name}</strong><p><CalendarDays size={16}/> {fullDate(date)}, {time}</p><p><Clock size={16}/> {doctor.duration} мин · {formatPrice(doctor.price)}</p></div>
          <form onSubmit={submit} noValidate>
            <label className="medical-booking__field">Ваше имя<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" placeholder="Как к вам обращаться" maxLength={80} required /></label>
            <label className="medical-booking__field">Телефон<input value={phone} onChange={event => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="+7 (___) ___-__-__" maxLength={30} required /></label>
            <p className="medical-booking__demo-note">Это демо: данные формы никуда не отправляются и не сохраняются. Запись остаётся только в этом браузере.</p>
            {error && <p className="medical-booking__error" role="alert">{error}</p>}
            <button type="submit" className="medical-booking__primary">Сохранить демо-запись <ArrowRight size={18}/></button>
          </form>
        </section>}
        {step === 'success' && success && <section className="medical-booking__success">
          <div className="medical-booking__check"><Check size={26} strokeWidth={1.6}/></div><p className="medical-booking__eyebrow">ДЕМОНСТРАЦИОННАЯ ЗАПИСЬ</p><h1>Готово</h1><p className="medical-booking__intro">Вы сохранили пример записи в этом браузере. Настоящий приём не забронирован.</p>
          <div className="medical-booking__summary"><span>{doctors.find(item => item.id === success.doctorId)?.specialty}</span><strong>{doctors.find(item => item.id === success.doctorId)?.name}</strong><p><CalendarDays size={16}/> {fullDate(success.date)}, {success.time}</p><p><Clock size={16}/> {success.duration} мин · {formatPrice(success.price)}</p></div>
          <button className="medical-booking__primary" type="button" onClick={() => changeStep('appointments')}>Мои записи <ArrowRight size={18}/></button><button className="medical-booking__text-button" type="button" onClick={onClose}>Закрыть</button>
        </section>}
        {step === 'appointments' && <section><p className="medical-booking__eyebrow">ЛИЧНЫЙ КАБИНЕТ</p><h1>Мои записи</h1><p className="medical-booking__intro">Демо-записи сохраняются только в этом браузере и не являются бронированием.</p>
          {rows.length === 0 ? <div className="medical-booking__empty"><CalendarDays size={25} strokeWidth={1.4}/><h2>Пока нет записей</h2><p>Выберите специалиста и удобное время.</p><button type="button" onClick={() => { setEditingId(''); changeStep('doctors'); }}>Выбрать специалиста <ArrowRight size={16}/></button></div> : <div className="medical-booking__appointments">{rows.map(row => { const item = doctors.find(entry => entry.id === row.doctorId); return <article className="medical-booking__appointment" key={row.id}><div className="medical-booking__appointment-top"><span>ДЕМО-ЗАПИСЬ</span><span>{formatPrice(row.price)}</span></div><h2>{item?.name || 'Специалист'}</h2><p>{item?.specialty || 'Приём'} · {row.duration} мин</p><div className="medical-booking__appointment-date"><CalendarDays size={17}/>{fullDate(row.date)}, {row.time}</div><div className="medical-booking__actions"><button type="button" onClick={() => reschedule(row)}>Перенести</button><button type="button" onClick={() => setCancelId(row.id)}>Удалить</button></div>{cancelId === row.id && <div className="medical-booking__cancel"><p>Удалить эту демо-запись?</p><button type="button" onClick={() => cancel(row.id)}>Да, удалить</button><button type="button" onClick={() => setCancelId('')}>Оставить</button></div>}</article>; })}</div>}
          {error && <p className="medical-booking__error" role="alert">{error}</p>}
          {rows.length > 0 && <button type="button" className="medical-booking__secondary" onClick={() => { setEditingId(''); changeStep('doctors'); }}>Новая демо-запись <ArrowRight size={18}/></button>}
        </section>}
      </main>
    </div>
  </div>;
}
