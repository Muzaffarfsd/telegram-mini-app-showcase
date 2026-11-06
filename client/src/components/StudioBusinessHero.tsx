import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { preloadDemo } from './demos/DemoRegistry';
import './StudioBusinessHero.css';

interface Props {
  ru: boolean;
  onOpenDemo: (id: string) => void;
  onViewExamples: () => void;
}

const projects = [
  { id: 'muraka-fashion', name: 'MURAKA', category: 'магазина одежды', categoryEn: 'fashion store', screen: '/showcase/real-preview/muraka-fashion.webp', position: 'fashion' },
  { id: 'flower-store', name: 'FLORA', category: 'цветочного магазина', categoryEn: 'flower store', screen: '/showcase/real-preview/flower-store.webp', position: 'flowers' },
  { id: 'nike-sneakers', name: 'NIKE', category: 'магазина кроссовок', categoryEn: 'sneaker store', screen: '/showcase/real-preview/nike-sneakers.webp', position: 'sneakers' },
] as const;

export default function StudioBusinessHero({ ru, onOpenDemo, onViewExamples }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setEntered(true);
      observer.disconnect();
    }, { threshold: .18 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  return <div className="studio-business">
    <div ref={stageRef} className={`studio-business__stage${entered ? ' is-visible' : ''}`} lang={ru ? 'ru' : 'en'} aria-label={ru ? 'Примеры приложений' : 'App examples'}>
      <span className="studio-business__word" aria-hidden="true">{ru ? 'БИЗНЕС' : 'BUSINESS'}</span>
      {projects.map(project => <button
        className={`studio-business__phone studio-business__phone--${project.position}`}
        key={project.id}
        type="button"
        aria-label={ru ? `Открыть демо ${project.name}, ${project.category}` : `Open ${project.name}, ${project.categoryEn} demo`}
        onClick={() => onOpenDemo(project.id)}
        onPointerEnter={() => preloadDemo(project.id)}
        onTouchStart={() => preloadDemo(project.id)}
      >
        <span className="studio-business__device">
          <span className="studio-business__screen"><img src={project.screen} alt="" draggable={false} decoding="async" /></span>
          <span className="studio-business__island" />
        </span>
      </button>)}
    </div>
    <div className="studio-business__caption"><span>{ru ? 'ПРИЛОЖЕНИЯ ДЛЯ ВАШИХ ИДЕЙ' : 'APPS FOR YOUR IDEAS'}</span><span>01 — 03</span></div>
    <button type="button" className="studio-business__action" onClick={onViewExamples}>
      <span>{ru ? 'Смотреть примеры' : 'Explore examples'}</span><ArrowUpRight size={18} aria-hidden="true" />
    </button>
  </div>;
}
