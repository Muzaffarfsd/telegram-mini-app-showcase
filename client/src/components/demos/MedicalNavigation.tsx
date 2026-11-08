import { DemoHomeButton } from '../DemoHomeButton';
import React from 'react';
import { CalendarDays, Grid3X3, Home, Users } from 'lucide-react';
import './MedicalNavigation.css';

export type MedicalTab = 'home' | 'services' | 'doctors' | 'visits';
type Props = { active: MedicalTab; onNavigate: (tab: MedicalTab) => void };

/** Compact navigation shared visually with the other WEB4TG demonstrations. */
export default function MedicalNavigation({ active, onNavigate }: Props) {
  const items = [
    { id: 'home' as const, title: 'Главная', icon: Home },
    { id: 'services' as const, title: 'Услуги', icon: Grid3X3 },
    { id: 'doctors' as const, title: 'Врачи', icon: Users },
    { id: 'visits' as const, title: 'Записи', icon: CalendarDays },
  ];
  return <div className="medical-navigation-portal">
    <nav className="medical-navigation" aria-label="Разделы медицинского центра">
      {items.map(({ id, title, icon: Icon }) => <button
        type="button" key={id} aria-label={title}
        aria-current={active === id ? 'page' : undefined}
        className={active === id ? 'is-active' : undefined}
        onClick={event => { event.currentTarget.focus({ preventScroll: true }); onNavigate(id); }}
      ><Icon size={21}/><span>{title}</span></button>)}
    <DemoHomeButton /></nav>
  </div>;
}
