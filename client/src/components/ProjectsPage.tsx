import { memo, useCallback, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { preloadDemo } from './demos/DemoRegistry';
import './ProjectsShowcase.css';

interface ProjectsPageProps { onNavigate: (section: string) => void; onOpenDemo: (demoId: string) => void }
const projects = [
  { id: 'flower-store', name: 'FLORA', ru: 'Цветы и подарки', en: 'Flowers & gifts', tone: 'rose' },
  { id: 'apple-store', name: 'APPLE', ru: 'Магазин техники', en: 'Technology store', tone: 'blue' },
  { id: 'muraka-fashion', name: 'MURAKA', ru: 'Магазин одежды', en: 'Fashion store', tone: 'violet' },
  { id: 'nike-sneakers', name: 'NIKE', ru: 'Магазин кроссовок', en: 'Sneaker store', tone: 'blue' },
  { id: 'lumi-studio', name: 'LUMI', ru: 'Студия красоты', en: 'Beauty studio', tone: 'rose' },
  { id: 'china-buyer', name: 'CHINA BUYER', ru: 'Байер из Китая', en: 'China sourcing', tone: 'violet' },
  { id: 'medical-center', name: 'MEDICAL', ru: 'Медицинский центр', en: 'Medical center', tone: 'blue' },
  { id: 'opt-market', name: 'ПАРТИЯ', ru: 'Оптовые закупки', en: 'Wholesale', tone: 'violet' },
  { id: 'women-fashion', name: 'MIRA', ru: 'Женская одежда', en: 'Women’s fashion', tone: 'rose' },
  { id: 'skincare-aura', name: 'AURA', ru: 'Косметика и уход', en: 'Skincare', tone: 'blue' },
] as const;

export default memo(function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    const bounded = Math.max(0, Math.min(projects.length - 1, index));
    const slide = track.current?.children[bounded] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
    setActive(bounded);
  }, []);

  const updateActive = () => {
    const el = track.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.max(0, Math.min(projects.length - 1, index)));
  };

  return <main className="projects-showcase" data-testid="projects-showcase">
    <div className="ps-inner">
      <div className="ps-topline"><span>WEB4TG.</span><h1>{ru ? 'ВИТРИНА ПРИЛОЖЕНИЙ' : 'APP SHOWCASE'}</h1></div>
      <section className="ps-gallery" aria-label={ru ? 'Примеры приложений' : 'App examples'} aria-roledescription={ru ? 'карусель' : 'carousel'}>
        <div className="ps-track" ref={track} onScroll={updateActive}>
          {projects.map((project, index) => {
            const description = ru ? project.ru : project.en;
            return <article key={project.id} className={`ps-slide ps-slide--${project.tone}`} aria-label={`${index + 1} / ${projects.length}`}>
              <div className="ps-slide__header"><span>WEB4TG</span><span>{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span></div>
              <div className="ps-slide__progress" aria-hidden="true"><i /><i /><i /></div>
              <div className="ps-slide__art"><img src={`/showcase/soft-icons/${project.id}.webp`} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" /></div>
              <div className="ps-slide__content">
                <h2>{project.name}</h2>
                <p>{description}</p>
              </div>
              <button className="ps-slide__action" type="button" data-testid={`card-app-${project.id}`} aria-label={`${ru ? 'Открыть демо' : 'Open demo'} ${project.name}: ${description}`} onClick={() => onOpenDemo(project.id)} onPointerEnter={() => preloadDemo(project.id)} onTouchStart={() => preloadDemo(project.id)}>
                <span>{ru ? 'Открыть демо' : 'Open demo'}</span><ArrowRight size={18} aria-hidden="true" />
              </button>
            </article>;
          })}
        </div>
        <nav className="ps-controls" aria-label={ru ? 'Навигация по приложениям' : 'Navigate apps'}>
          <button type="button" disabled={active === 0} onClick={() => goTo(active - 1)} aria-label={ru ? 'Предыдущее приложение' : 'Previous app'}><ArrowLeft size={19} aria-hidden="true" /></button>
          <span aria-live="polite">{String(active + 1).padStart(2, '0')} <span>/</span> {String(projects.length).padStart(2, '0')}</span>
          <button type="button" disabled={active === projects.length - 1} onClick={() => goTo(active + 1)} aria-label={ru ? 'Следующее приложение' : 'Next app'}><ArrowRight size={19} aria-hidden="true" /></button>
        </nav>
      </section>
    </div>
  </main>;
});
