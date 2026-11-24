import { firstHomePreview, homePreviewSizes, homePreviewSrcSet } from '../data/homePreview';
import { showcaseActions } from '../data/showcaseActions';
import { backgroundPrefetchWait, canSpeculate } from '../lib/interactionBudget';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';
import { hintRoute } from '../lib/routeModules';
import './HomeDemo.css';
import './CategorySegments.css';

interface Props { ru: boolean; onOpenDemo: (id: string) => void }
type View = 'home' | 'product';
const projects = [
  { id: 'muraka-fashion', title: 'Одежда', titleEn: 'Clothing', label: 'Магазин одежды', labelEn: 'Clothing store', detail: 'От новой коллекции до выбора размера.', detailEn: 'From the latest collection to the right size.', home: firstHomePreview, product: '/home-editorial/fashion-muraka-product-v2.webp' },
  { id: 'women-fashion', title: 'Женская одежда', titleEn: 'Womenswear', label: 'Женская одежда', labelEn: 'Womenswear', detail: 'Готовый образ и вещи, из которых он собран.', detailEn: 'Explore a look and shop each piece.', home: '/home-editorial/fashion-mira-no-header-home-v4.webp', product: '/home-editorial/fashion-mira-no-header-product-v4.webp' },
  { id: 'nike-sneakers', title: 'Кроссовки', titleEn: 'Sneakers', label: 'Магазин кроссовок', labelEn: 'Sneaker store', detail: 'Пара, расцветка и нужный размер.', detailEn: 'Find a pair, a colour and your size.', home: '/home-editorial/sneaker-no-header-home-v4.webp', product: '/home-editorial/sneaker-no-header-jordan-v4.webp' },
  { id: 'apple-store', title: 'Техника', titleEn: 'Tech', label: 'Магазин техники', labelEn: 'Tech store', detail: 'Модель, цвет и объём памяти в одном заказе.', detailEn: 'Pick a model, finish and storage size.', home: '/home-editorial/apple-home-real-v5.webp', product: '/home-editorial/apple-burgundy-product-real-v6.webp' },
  { id: 'flower-store', title: 'Цветы', titleEn: 'Flowers', label: 'Магазин цветов', labelEn: 'Flower shop', detail: 'Выбор букета, размера и оформления.', detailEn: 'Choose a bouquet, size and arrangement.', home: '/home-editorial/florist-home-no-header-v3.webp', product: '/home-editorial/florist-eustoma-product-v1.webp' },
  { id: 'lumi-studio', title: 'Салон', titleEn: 'Salon', label: 'Салон красоты', labelEn: 'Beauty salon', detail: 'От выбора услуги до записи к мастеру.', detailEn: 'From a treatment to a booking with a stylist.', home: '/home-editorial/lumi-home-no-header-v2.webp', product: '/home-editorial/lumi-service-no-header-v2.webp' },
] as const;

const miniatures = import.meta.glob<string>('../assets/home-preview/*.webp', { eager: true, import: 'default', query: '?inline' });
function DemoArtwork({ src, view, first }: { src: string; view: View; first: boolean }) {
  const [ready, setReady] = useState(false);
  const miniature = miniatures[src.replace('/home-editorial/', '../assets/home-preview/')];
  return <span className="home-demo__art" style={ready ? undefined : { backgroundImage: `url("${miniature}")` }}>
    <img src={src} srcSet={homePreviewSrcSet(src)} sizes={homePreviewSizes} data-view={view} data-ready={ready}
      width={1024} height={1536} alt="" draggable={false} fetchPriority={first ? 'high' : 'auto'} decoding="async"
      onLoad={event => { void event.currentTarget.decode().then(() => setReady(true), () => {}); }} />
  </span>;
}

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
  const categories = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const preview = useRef<HTMLButtonElement>(null);
  const haptic = useHaptic();
  const project = projects[projectIndex];
  const action = showcaseActions[project.id][ru ? 0 : 1];
  const chooseView = (next: View) => {
    if (next === view) return;
    setView(next);
    haptic.light();
  };
  const chooseProject = (index: number, nextView: View = 'home') => {
    if (index === projectIndex) return;
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
      else chooseProject((projectIndex + 1) % projects.length, 'home');
    } else {
      if (view === 'product') chooseView('home');
      else chooseProject((projectIndex - 1 + projects.length) % projects.length, 'product');
    }
  };
  useEffect(() => {
    const row = categories.current;
    const active = row?.children[projectIndex];
    if (!row || !active) return;
    const bounds = row.getBoundingClientRect();
    const tab = active.getBoundingClientRect();
    if (tab.left < bounds.left) row.scrollLeft += tab.left - bounds.left;
    else if (tab.right > bounds.right) row.scrollLeft += tab.right - bounds.right;
  }, [projectIndex]);
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
      if (done || !visible || !canSpeculate()) return;
      const wait = backgroundPrefetchWait();
      if (wait > 0 || target.matches(':active')) {
        schedule(Math.max(100, wait));
        return;
      }
      done = true;
      observer.disconnect();
      const adjacent = new Image();
      adjacent.fetchPriority = 'low';
      const src = view === 'home' ? project.product : projects[(projectIndex + 1) % projects.length].home;
      adjacent.sizes = homePreviewSizes;
      adjacent.srcset = homePreviewSrcSet(src);
      adjacent.src = src;
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

  return <div className="home-demo" data-testid="home-exhibit" data-project={project.id}>
    <h2>{ru ? 'Что увидит ваш клиент?' : 'What will your customers see?'}</h2>
    <div className="home-demo__projects category-segments" ref={categories} role="group" aria-label={ru ? 'Выберите пример' : 'Choose an example'}>
      {projects.map((item, index) => <PreviewChoice key={item.id} active={projectIndex === index} choose={() => chooseProject(index)}>{ru ? item.title : item.titleEn}</PreviewChoice>)}
    </div>
    <div className="home-demo__card">
    <button type="button" ref={preview} className="home-demo__image" data-testid="home-open-demo" onPointerEnter={event => { if (event.pointerType === 'mouse') hintRoute(`/demos/${project.id}/app`); }} onFocus={event => { if (event.currentTarget.matches(':focus-visible')) hintRoute(`/demos/${project.id}/app`); }} onPointerDown={startSwipe} onPointerUp={finishSwipe} onPointerCancel={() => { gesture.current = null; }} onClick={(event) => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; } onOpenDemo(project.id); }} aria-label={`${action} · ${ru ? project.label : project.labelEn}`}>
      <DemoArtwork key={project[view]} src={project[view]} view={view} first={projectIndex === 0 && view === 'home'} />
      <span className="home-demo__copy"><strong>{ru ? project.label : project.labelEn}</strong><span>{ru ? project.detail : project.detailEn}</span>
        <span className="home-demo__open">{action} <ArrowUpRight size={15} aria-hidden="true"/></span>
      </span>
    </button>
    <div className="home-demo__switch" role="group" aria-label={ru ? 'Экран приложения' : 'App screen'}>
      <span>{ru ? 'Экран приложения' : 'App screen'}</span>
      <div data-screen={view}><PreviewChoice active={view === 'home'} choose={() => chooseView('home')}>{ru ? 'Главная' : 'Home'}</PreviewChoice><PreviewChoice active={view === 'product'} choose={() => chooseView('product')}>{project.id === 'lumi-studio' ? (ru ? 'Услуга' : 'Service') : (ru ? 'Товар' : 'Product')}</PreviewChoice></div>
    </div>
    </div>
  </div>;
}
