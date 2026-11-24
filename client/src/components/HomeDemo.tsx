import { backgroundPrefetchWait } from '../lib/interactionBudget';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';
import { preloadDemo } from './demos/DemoRegistry';
import './HomeDemo.css';

interface Props { ru: boolean; onOpenDemo: (id: string) => void }
type View = 'home' | 'product';
type Direction = 'next' | 'previous';
const projects = [
  { id: 'muraka-fashion', title: 'Уличная', titleEn: 'Streetwear', label: 'УЛИЧНАЯ ОДЕЖДА', labelEn: 'STREETWEAR STORE', home: '/home-editorial/fashion-muraka-home-v2.webp', product: '/home-editorial/fashion-muraka-product-v2.webp' },
  { id: 'women-fashion', title: 'Женская', titleEn: 'Women', label: 'ЖЕНСКАЯ ОДЕЖДА', labelEn: 'WOMEN’S FASHION', home: '/home-editorial/fashion-mira-no-header-home-v4.webp', product: '/home-editorial/fashion-mira-no-header-product-v4.webp' },
  { id: 'nike-sneakers', title: 'Кроссовки', titleEn: 'Sneakers', label: 'МАГАЗИН КРОССОВОК', labelEn: 'SNEAKER STORE', home: '/home-editorial/sneaker-no-header-home-v4.webp', product: '/home-editorial/sneaker-no-header-jordan-v4.webp' },
  { id: 'apple-store', title: 'Техника', titleEn: 'Tech', label: 'МАГАЗИН ТЕХНИКИ', labelEn: 'TECH STORE', home: '/home-editorial/apple-home-real-v5.webp', product: '/home-editorial/apple-burgundy-product-real-v6.webp' },
  { id: 'flower-store', title: 'Цветы', titleEn: 'Flowers', label: 'МАГАЗИН ЦВЕТОВ', labelEn: 'FLOWER STORE', home: '/home-editorial/florist-home-no-header-v3.webp', product: '/home-editorial/florist-eustoma-product-v1.webp' },
  { id: 'lumi-studio', title: 'Салон', titleEn: 'Salon', label: 'САЛОН КРАСОТЫ', labelEn: 'BEAUTY SALON', home: '/home-editorial/lumi-home-no-header-v2.webp', product: '/home-editorial/lumi-service-no-header-v2.webp' },
] as const;

/** A stationary touch following a preview swipe can end without a compatibility click. */
function PreviewChoice({ active, choose, children }: { active: boolean; choose: () => void; children: string }) {
  const touch = useRef<{ id: number; x: number; y: number; top: number } | null>(null);
  const release = (event: PointerEvent<HTMLButtonElement>) => {
    const start = touch.current;
    touch.current = null;
    if (!start || start.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) return;
    if (Math.abs((document.getElementById('root')?.scrollTop ?? 0) - start.top) > 1) return;
    choose();
  };
  return <button type="button" aria-pressed={active} onClick={choose}
    onPointerDown={event => {
      touch.current = event.isPrimary && event.pointerType === 'touch'
        ? { id: event.pointerId, x: event.clientX, y: event.clientY, top: document.getElementById('root')?.scrollTop ?? 0 }
        : null;
    }}
    onPointerMove={event => {
      const start = touch.current;
      if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) touch.current = null;
    }}
    onPointerCancel={() => { touch.current = null; }}
    onPointerUp={release}
  >{children}</button>;
}

/** An interactive preview of real demo apps; clicking the artwork opens the selected app. */
export default function HomeDemo({ ru, onOpenDemo }: Props) {
  const [projectIndex, setProjectIndex] = useState(0);
  const [view, setView] = useState<View>('home');
  const [direction, setDirection] = useState<Direction>('next');
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const preview = useRef<HTMLButtonElement>(null);
  const haptic = useHaptic();
  const project = projects[projectIndex];
  const chooseView = (next: View) => {
    if (next === view) return;
    setDirection(next === 'product' ? 'next' : 'previous');
    setView(next);
    haptic.light();
  };
  const chooseProject = (index: number, nextView: View = 'home', movement?: Direction) => {
    if (index === projectIndex) return;
    setDirection(movement ?? (index > projectIndex ? 'next' : 'previous'));
    setProjectIndex(index);
    setView(nextView);
    haptic.light();
  };
  const startSwipe = (event: PointerEvent<HTMLButtonElement>) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    suppressClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const finishSwipe = (event: PointerEvent<HTMLButtonElement>) => {
    const start = gesture.current;
    gesture.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
    suppressClick.current = true;
    if (dx < 0) {
      if (view === 'home') chooseView('product');
      else chooseProject((projectIndex + 1) % projects.length, 'home', 'next');
    } else {
      if (view === 'product') chooseView('home');
      else chooseProject((projectIndex - 1 + projects.length) % projects.length, 'product', 'previous');
    }
  };
  useEffect(() => {
    const target = preview.current;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (!target || !('IntersectionObserver' in window) || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return;
    let visible = false;
    let timer = 0;
    let idle: number | undefined;
    let done = false;
    const cancel = () => {
      clearTimeout(timer);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      idle = undefined;
    };
    const warm = () => {
      if (done || !visible || document.hidden) return;
      const wait = backgroundPrefetchWait();
      if (wait > 0 || target.matches(':active')) {
        schedule(Math.max(100, wait));
        return;
      }
      done = true;
      observer.disconnect();
      preloadDemo(project.id);
      const adjacent = new Image();
      adjacent.src = view === 'home' ? project.product : projects[(projectIndex + 1) % projects.length].home;
    };
    const schedule = (delay: number) => {
      cancel();
      if (done || !visible || document.hidden) return;
      timer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(warm);
        else warm();
      }, delay);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule(350);
    });
    const visibility = () => schedule(350);
    observer.observe(target);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancel();
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [project, projectIndex, view]);

  return <div className="home-demo" data-testid="home-exhibit">
    <div className="home-demo__projects" role="group" aria-label={ru ? 'Выберите пример' : 'Choose an example'}>
      {projects.map((item, index) => <PreviewChoice key={item.id} active={projectIndex === index} choose={() => chooseProject(index)}>{ru ? item.title : item.titleEn}</PreviewChoice>)}
    </div>
    <button type="button" ref={preview} className="home-demo__image" data-testid="home-open-demo" onPointerDown={startSwipe} onPointerUp={finishSwipe} onPointerCancel={() => { gesture.current = null; }} onClick={(event) => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; } onOpenDemo(project.id); }} aria-label={ru ? `Открыть демо: ${project.label.toLowerCase()}` : `Open demo: ${project.labelEn.toLowerCase()}`}>
      <img key={`${project.id}-${view}`} data-view={view} data-direction={direction} src={project[view]} alt="" draggable={false} fetchPriority={projectIndex === 0 && view === 'home' ? 'high' : 'auto'} decoding="async" />
    </button>
    <div className="home-demo__switch" role="group" aria-label={ru ? 'Экран приложения' : 'App screen'}>
      <span>{ru ? project.label : project.labelEn}</span>
      <div><PreviewChoice active={view === 'home'} choose={() => chooseView('home')}>{ru ? 'Главная' : 'Home'}</PreviewChoice><PreviewChoice active={view === 'product'} choose={() => chooseView('product')}>{project.id === 'lumi-studio' ? (ru ? 'Услуга' : 'Service') : (ru ? 'Товар' : 'Product')}</PreviewChoice></div>
    </div>
    <button type="button" className="home-demo__open" onClick={() => onOpenDemo(project.id)}>{ru ? 'Открыть приложение' : 'Open app'} <ArrowUpRight size={17} aria-hidden="true" /></button>
  </div>;
}
