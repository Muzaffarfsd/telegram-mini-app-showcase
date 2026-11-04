import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import MedicalBooking, { type MedicalDoctor } from './MedicalBooking';
import MedicalHome from './MedicalHome';
import MedicalAbout from './MedicalAbout';
import MedicalDoctorProfile from './MedicalDoctorProfile';
import MedicalDoctorCatalog from './MedicalDoctorCatalog';
import MedicalNavigation from './MedicalNavigation';
import { MedicalCatalog, MedicalServiceDetail } from './MedicalServices';
import { medicalServices, medicalServiceFor } from './MedicalServiceData';
import './MedicalCenter.css';

type Doctor = MedicalDoctor & { intro: string; focus: string[]; details: string; };
type Screen = 'home' | 'doctors' | 'doctor' | 'services' | 'service' | 'booking' | 'visits' | 'about';
type Snapshot = {screen: Screen; selected: string; selectedSpecialty: string; previous: Screen; bookingDoctor?: string; bookingService?: string};
const photo = (name: string) => `/medical/generated/${name}.webp`;
const doctors: Doctor[] = [
  { id: 'anna', name: 'Анна Морозова', specialty: 'Терапевт', price: 3500, duration: 45, image: photo('doctor-1'), intro: 'Врач, к которому можно прийти с любым вопросом о здоровье.', focus: ['Первичная консультация', 'Профилактика', 'План обследования'], details: 'Поможет разобраться в самочувствии, обсудить результаты обследований и составить понятный план дальнейших шагов.' },
  { id: 'cardio', name: 'Дмитрий Орлов', specialty: 'Кардиолог', price: 4200, duration: 45, image: photo('doctor-3'), intro: 'Внимательное отношение к здоровью сердца и сосудов.', focus: ['Консультация кардиолога', 'Оценка факторов риска', 'Разбор обследований'], details: 'Выслушает ваши вопросы, изучит историю здоровья и при необходимости предложит дальнейшее обследование.' },
  { id: 'neuro', name: 'Елена Соколова', specialty: 'Невролог', price: 4000, duration: 45, image: photo('doctor-2'), intro: 'Бережный подход к вопросам нервной системы.', focus: ['Консультация невролога', 'Головная боль', 'Нарушения сна'], details: 'Обсудит симптомы и их влияние на повседневную жизнь, проведёт осмотр и объяснит возможные дальнейшие шаги.' },
  { id: 'maria', name: 'Мария Белова', specialty: 'Эндокринолог', price: 4000, duration: 45, image: photo('doctor-4'), intro: 'Помогает разобраться в вопросах гормонального здоровья.', focus: ['Консультация эндокринолога', 'Обмен веществ', 'Разбор анализов'], details: 'Внимательно изучит историю здоровья, обсудит ваши вопросы и при необходимости предложит план обследования.' },
  { id: 'ultrasound', name: 'Ольга Власова', specialty: 'Врач УЗД', price: 2800, duration: 30, image: photo('med-v3-doctor-ultrasound'), intro: 'Внимательное отношение к каждому этапу исследования.', focus: ['УЗИ щитовидной железы', 'Обсуждение цели исследования', 'Описание исследования'], details: 'Объяснит, как проходит исследование, ответит на вопросы и подготовит описание для обсуждения с лечащим врачом.' },
];
const specialties = [
  { title: 'Терапия', number: '01', description: 'Первый шаг к пониманию своего здоровья', doctor: 'anna', caption: 'Общее здоровье и профилактика' },
  { title: 'Кардиология', number: '02', description: 'Внимание к сердцу и сосудам', doctor: 'cardio', caption: 'Консультация и разбор обследований' },
  { title: 'Неврология', number: '03', description: 'Помощь при вопросах о нервной системе', doctor: 'neuro', caption: 'Головная боль, сон и самочувствие' },
  { title: 'Эндокринология', number: '04', description: 'Забота о гормональном здоровье', doctor: 'maria', caption: 'Обмен веществ и гормональное здоровье' },
];
export default function MedicalCenter() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selected, setSelected] = useState('anna');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Терапия');
  const [bookingDoctor, setBookingDoctor] = useState<string | undefined>();
  const [bookingService, setBookingService] = useState<string | undefined>();
  const [previous, setPrevious] = useState<Screen>('home');
  const restoreFocus = useRef('');
  const restoreScroll = useRef(0);
  const session = useRef(`medical-${Date.now()}-${Math.random()}`);
  const current = useRef<Snapshot>({screen:'home',selected:'anna',selectedSpecialty:'Терапия',previous:'home'});
  const doctor = doctors.find(d => d.id === selected) || doctors[0];
  const specialty = medicalServiceFor(selectedSpecialty) || medicalServices[0];
  useEffect(() => { const root = document.getElementById('root'); root?.classList.add('medical-scroll-root'); return () => root?.classList.remove('medical-scroll-root'); }, []);
  useEffect(() => { const button = (window as any).Telegram?.WebApp?.BackButton; if (!button || screen === 'home' || screen === 'booking' || screen === 'visits') return; const back = () => history.back(); button.onClick?.(back); button.show?.(); return () => { button.offClick?.(back); button.hide?.(); }; }, [screen]);
  useEffect(() => {
    const state = history.state && typeof history.state === 'object' ? history.state : {};
    history.replaceState({...state, __medical:{session:session.current,snapshot:current.current}},'',location.href);
    const onPop = (event: PopStateEvent) => { const record = event.state?.__medical; if (record?.session !== session.current || !record.snapshot) return; apply(record.snapshot as Snapshot); };
    window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => { const root = document.getElementById('root'); const shouldRestore = screen !== 'booking' && !!restoreFocus.current; root?.scrollTo({ top: shouldRestore ? restoreScroll.current : 0, behavior: 'instant' }); if (shouldRestore) { const key = restoreFocus.current; restoreFocus.current = ''; requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-med-book="${key}"]`)?.focus({preventScroll:true})); } }, [screen]);
  function apply(snapshot: Snapshot) { current.current = snapshot; setScreen(snapshot.screen); setSelected(snapshot.selected); setSelectedSpecialty(snapshot.selectedSpecialty); setPrevious(snapshot.previous); setBookingDoctor(snapshot.bookingDoctor); setBookingService(snapshot.bookingService); }
  function go(next: Screen, changes: Partial<Snapshot> = {}) { const state = {...(history.state && typeof history.state === 'object' ? history.state : {})}; delete state.__medicalFlow; const snapshot = {...current.current, ...changes, screen:next}; history.pushState({...state,__medical:{session:session.current,snapshot}},'',location.href); apply(snapshot); }
  function showDoctor(id: string) { go('doctor', {selected:id,previous:screen}); }
  function showSpecialty(title: string) { go('service', {selectedSpecialty:title,previous:screen === 'service' ? previous : screen}); }
  function book(id?: string, focusKey = '', serviceId?: string) { restoreFocus.current = focusKey; restoreScroll.current = document.getElementById('root')?.scrollTop || 0; go('booking', {previous:screen,bookingDoctor:id,bookingService:serviceId}); }
  function closeFlow() { if (history.state?.__medical?.session === session.current) history.back(); else go('home'); }
  return <div className="med" data-testid="medical-center" data-screen={screen}>
    <main className="med-main">
      {screen === 'home' && <MedicalHome doctors={doctors} specialties={specialties} onDoctor={showDoctor} onSpecialty={showSpecialty} onDoctors={() => go('doctors')} onServices={() => go('services')} onAbout={() => go('about')} onBook={key => book(undefined, key)} />}
      {screen === 'doctors' && <MedicalDoctorCatalog doctors={doctors} onBack={() => go('home')} onDoctor={showDoctor} onServices={() => go('services')} />}
      {screen === 'doctor' && <MedicalDoctorProfile doctor={doctor} onBack={() => go(previous === 'booking' ? 'doctors' : previous)} onBook={key => book(doctor.id, key)} onService={() => showSpecialty(medicalServices.find(item => item.doctorIds.includes(doctor.id))?.id || 'therapy')} />}
      {screen === 'services' && <MedicalCatalog onBack={() => go('home')} onOpen={showSpecialty} />}
      {screen === 'service' && <MedicalServiceDetail title={specialty.id} doctor={doctors.find(d => specialty.doctorIds.includes(d.id)) || doctors[0]} onBack={() => go(previous)} onBook={key => book(specialty.doctorIds[0], key, specialty.id)} onDoctor={showDoctor} onOpen={showSpecialty} />}
      {screen === 'about' && <MedicalAbout onBack={() => go('home')} onDoctors={() => go('doctors')} onServices={() => go('services')} onBook={() => book(undefined, 'about')} />}
      {screen === 'booking' && createPortal(<MedicalBooking doctors={doctors} initialDoctorId={bookingDoctor} initialServiceId={bookingService} onClose={closeFlow} />, document.body)}
      {screen === 'visits' && createPortal(<MedicalBooking doctors={doctors} initialMode="appointments" onClose={closeFlow} />, document.body)}
    </main>
    {createPortal(<MedicalNavigation active={screen === 'service' || screen === 'services' ? 'services' : screen === 'doctor' || screen === 'doctors' ? 'doctors' : screen === 'booking' || screen === 'visits' ? 'visits' : 'home'} onNavigate={tab => go(tab)} />, document.body)}
  </div>;
}
