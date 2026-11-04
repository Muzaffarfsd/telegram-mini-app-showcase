import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import MedicalBooking, { type MedicalDoctor } from './MedicalBooking';
import MedicalHome from './MedicalHome';
import MedicalAbout from './MedicalAbout';
import MedicalDoctorProfile from './MedicalDoctorProfile';
import MedicalNavigation from './MedicalNavigation';
import { MedicalCatalog, MedicalServiceDetail } from './MedicalServices';
import './MedicalCenter.css';

type Doctor = MedicalDoctor & { intro: string; focus: string[]; details: string; };
type Screen = 'home' | 'doctors' | 'doctor' | 'services' | 'service' | 'booking' | 'visits' | 'about';
type Snapshot = {screen: Screen; selected: string; selectedSpecialty: string; previous: Screen; bookingDoctor?: string};
const photo = (name: string) => `/medical/generated/${name}.webp`;
const doctors: Doctor[] = [
  { id: 'anna', name: 'Анна Морозова', specialty: 'Терапевт', price: 3500, duration: 45, image: photo('doctor-1'), intro: 'Врач, к которому можно прийти с любым вопросом о здоровье.', focus: ['Первичная консультация', 'Профилактика', 'План обследования'], details: 'Поможет разобраться в самочувствии, обсудить результаты обследований и составить понятный план дальнейших шагов.' },
  { id: 'cardio', name: 'Дмитрий Орлов', specialty: 'Кардиолог', price: 4200, duration: 45, image: photo('doctor-3'), intro: 'Внимательное отношение к здоровью сердца и сосудов.', focus: ['Консультация кардиолога', 'Оценка факторов риска', 'Разбор обследований'], details: 'Выслушает ваши вопросы, изучит историю здоровья и при необходимости предложит дальнейшее обследование.' },
  { id: 'neuro', name: 'Елена Соколова', specialty: 'Невролог', price: 4000, duration: 45, image: photo('doctor-2'), intro: 'Бережный подход к вопросам нервной системы.', focus: ['Консультация невролога', 'Головная боль', 'Нарушения сна'], details: 'Обсудит симптомы и их влияние на повседневную жизнь, проведёт осмотр и объяснит возможные дальнейшие шаги.' },
  { id: 'maria', name: 'Мария Белова', specialty: 'Эндокринолог', price: 4000, duration: 45, image: photo('doctor-4'), intro: 'Помогает разобраться в вопросах гормонального здоровья.', focus: ['Консультация эндокринолога', 'Обмен веществ', 'Разбор анализов'], details: 'Внимательно изучит историю здоровья, обсудит ваши вопросы и при необходимости предложит план обследования.' },
];
const specialties = [
  { title: 'Терапия', number: '01', description: 'Первый шаг к пониманию своего здоровья', doctor: 'anna', caption: 'Общее здоровье и профилактика' },
  { title: 'Кардиология', number: '02', description: 'Внимание к сердцу и сосудам', doctor: 'cardio', caption: 'Консультация и разбор обследований' },
  { title: 'Неврология', number: '03', description: 'Помощь при вопросах о нервной системе', doctor: 'neuro', caption: 'Головная боль, сон и самочувствие' },
  { title: 'Эндокринология', number: '04', description: 'Забота о гормональном здоровье', doctor: 'maria', caption: 'Обмен веществ и гормональное здоровье' },
];
const rub = (n: number) => `${new Intl.NumberFormat('ru-RU').format(n)} ₽`;

export default function MedicalCenter() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selected, setSelected] = useState('anna');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Терапия');
  const [query, setQuery] = useState('');
  const [bookingDoctor, setBookingDoctor] = useState<string | undefined>();
  const [previous, setPrevious] = useState<Screen>('home');
  const restoreFocus = useRef('');
  const restoreScroll = useRef(0);
  const session = useRef(`medical-${Date.now()}-${Math.random()}`);
  const current = useRef<Snapshot>({screen:'home',selected:'anna',selectedSpecialty:'Терапия',previous:'home'});
  const doctor = doctors.find(d => d.id === selected) || doctors[0];
  const specialty = specialties.find(s => s.title === selectedSpecialty) || specialties[0];
  const filtered = useMemo(() => doctors.filter(d => `${d.name} ${d.specialty}`.toLowerCase().includes(query.trim().toLowerCase())), [query]);
  useEffect(() => { const root = document.getElementById('root'); root?.classList.add('medical-scroll-root'); return () => root?.classList.remove('medical-scroll-root'); }, []);
  useEffect(() => { const button = (window as any).Telegram?.WebApp?.BackButton; if (!button || screen === 'home' || screen === 'booking' || screen === 'visits') return; const back = () => history.back(); button.onClick?.(back); button.show?.(); return () => { button.offClick?.(back); button.hide?.(); }; }, [screen]);
  useEffect(() => {
    const state = history.state && typeof history.state === 'object' ? history.state : {};
    history.replaceState({...state, __medical:{session:session.current,snapshot:current.current}},'',location.href);
    const onPop = (event: PopStateEvent) => { const record = event.state?.__medical; if (record?.session !== session.current || !record.snapshot) return; apply(record.snapshot as Snapshot); };
    window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => { const root = document.getElementById('root'); const shouldRestore = screen !== 'booking' && !!restoreFocus.current; root?.scrollTo({ top: shouldRestore ? restoreScroll.current : 0, behavior: 'instant' }); if (shouldRestore) { const key = restoreFocus.current; restoreFocus.current = ''; requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-med-book="${key}"]`)?.focus({preventScroll:true})); } }, [screen]);
  function apply(snapshot: Snapshot) { current.current = snapshot; setScreen(snapshot.screen); setSelected(snapshot.selected); setSelectedSpecialty(snapshot.selectedSpecialty); setPrevious(snapshot.previous); setBookingDoctor(snapshot.bookingDoctor); }
  function go(next: Screen, changes: Partial<Snapshot> = {}) { const state = {...(history.state && typeof history.state === 'object' ? history.state : {})}; delete state.__medicalFlow; const snapshot = {...current.current, ...changes, screen:next}; history.pushState({...state,__medical:{session:session.current,snapshot}},'',location.href); apply(snapshot); }
  function showDoctor(id: string) { go('doctor', {selected:id,previous:screen}); }
  function showSpecialty(title: string) { go('service', {selectedSpecialty:title,previous:screen === 'service' ? previous : screen}); }
  function book(id?: string, focusKey = '') { restoreFocus.current = focusKey; restoreScroll.current = document.getElementById('root')?.scrollTop || 0; go('booking', {previous:screen,bookingDoctor:id}); }
  function closeFlow() { if (history.state?.__medical?.session === session.current) history.back(); else go('home'); }
  const titleBar = (label: string, back: Screen) => <button className="med-back" onClick={() => go(back)}><ArrowLeft size={18}/><span>{label}</span></button>;
  const renderDoctor = (d: Doctor) => <button className="med-doctor-card" key={d.id} onClick={() => showDoctor(d.id)} aria-label={`Профиль специалиста ${d.name}`}><div className="med-doctor-image"><img src={d.image} alt="" loading="lazy"/><span><ArrowRight size={17}/></span></div><div className="med-doctor-info"><p>{d.specialty}</p><h2>{d.name}</h2><div><span>Приём · {d.duration} мин</span><strong>{rub(d.price)}</strong></div></div></button>;
  return <div className="med" data-testid="medical-center" data-screen={screen}>
    <main className="med-main">
      {screen === 'home' && <MedicalHome doctors={doctors} specialties={specialties} onDoctor={showDoctor} onSpecialty={showSpecialty} onDoctors={() => go('doctors')} onServices={() => go('services')} onAbout={() => go('about')} onBook={key => book(undefined, key)} />}
      {screen === 'doctors' && <div className="med-page">{titleBar('Главная', 'home')}<span className="med-kicker">КОМАНДА / СПЕЦИАЛИСТЫ</span><h1 className="med-page-title">Ваши<br/>специалисты<span className="med-dot">.</span></h1><p className="med-page-lead">Выберите врача и познакомьтесь с его направлением.</p><label className="med-search"><Search size={19}/><span className="med-sr">Поиск врача или специальности</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Врач или специальность"/></label><div className="med-count">СПЕЦИАЛИСТЫ <span>{String(filtered.length).padStart(2,'0')}</span></div>{filtered.length ? <div className="med-doctor-grid">{filtered.map(renderDoctor)}</div> : <div className="med-empty">По вашему запросу специалистов не найдено. Попробуйте другое название.</div>}</div>}
      {screen === 'doctor' && <MedicalDoctorProfile doctor={doctor} onBack={() => go(previous === 'booking' ? 'doctors' : previous)} onBook={key => book(doctor.id, key)} onService={() => showSpecialty(specialties.find(item => item.doctor === doctor.id)?.title || 'Терапия')} />}
      {screen === 'services' && <MedicalCatalog onBack={() => go('home')} onOpen={showSpecialty} />}
      {screen === 'service' && <MedicalServiceDetail title={specialty.title} doctor={doctors.find(d => d.id === specialty.doctor) || doctors[0]} onBack={() => go(previous)} onBook={key => book(specialty.doctor, key)} onDoctor={showDoctor} onOpen={showSpecialty} />}
      {screen === 'about' && <MedicalAbout onBack={() => go('home')} onDoctors={() => go('doctors')} onServices={() => go('services')} onBook={() => book(undefined, 'about')} />}
      {screen === 'booking' && createPortal(<MedicalBooking doctors={doctors} initialDoctorId={bookingDoctor} onClose={closeFlow} />, document.body)}
      {screen === 'visits' && createPortal(<MedicalBooking doctors={doctors} initialMode="appointments" onClose={closeFlow} />, document.body)}
    </main>
    {createPortal(<MedicalNavigation active={screen === 'service' || screen === 'services' ? 'services' : screen === 'doctor' || screen === 'doctors' ? 'doctors' : screen === 'booking' || screen === 'visits' ? 'visits' : 'home'} onNavigate={tab => go(tab)} />, document.body)}
  </div>;
}
