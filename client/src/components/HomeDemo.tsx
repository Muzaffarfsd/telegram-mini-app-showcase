import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';
import { preloadDemo } from './demos/DemoRegistry';
import './HomeDemo.css';

interface Props { ru: boolean; onOpenDemo: (id: string) => void }
type View = 'home' | 'product';
const projects = [
  { id: 'muraka-fashion', title: 'Уличная', titleEn: 'Streetwear', label: 'УЛИЧНАЯ ОДЕЖДА', labelEn: 'STREETWEAR STORE', home: '/home-editorial/fashion-muraka-home-v2.webp', product: '/home-editorial/fashion-muraka-product-v2.webp' },
  { id: 'women-fashion', title: 'Женская', titleEn: 'Women', label: 'ЖЕНСКАЯ ОДЕЖДА', labelEn: 'WOMEN’S FASHION', home: '/home-editorial/fashion-mira-no-header-home-v4.webp', product: '/home-editorial/fashion-mira-no-header-product-v4.webp' },
  { id: 'nike-sneakers', title: 'Кроссовки', titleEn: 'Sneakers', label: 'МАГАЗИН КРОССОВОК', labelEn: 'SNEAKER STORE', home: '/home-editorial/sneaker-no-header-home-v4.webp', product: '/home-editorial/sneaker-no-header-jordan-v4.webp' },
  { id: 'apple-store', title: 'Техника', titleEn: 'Tech', label: 'МАГАЗИН ТЕХНИКИ', labelEn: 'TECH STORE', home: '/home-editorial/apple-home-real-v5.webp', product: '/home-editorial/apple-burgundy-product-real-v6.webp' },
  { id: 'flower-store', title: 'Цветы', titleEn: 'Flowers', label: 'МАГАЗИН ЦВЕТОВ', labelEn: 'FLOWER STORE', home: '/home-editorial/florist-home-no-header-v3.webp', product: '/home-editorial/florist-eustoma-product-v1.webp' },
  { id: 'lumi-studio', title: 'Салон', titleEn: 'Salon', label: 'САЛОН КРАСОТЫ', labelEn: 'BEAUTY SALON', home: '/home-editorial/lumi-home-no-header-v2.webp', product: '/home-editorial/lumi-service-no-header-v2.webp' },
] as const;

/** An interactive preview of real demo apps; clicking the artwork opens the selected app. */
export default function HomeDemo({ ru, onOpenDemo }: Props) {
  const [projectIndex, setProjectIndex] = useState(0);
  const [view, setView] = useState<View>('home');
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const haptic = useHaptic();
  const project = projects[projectIndex];
  const chooseView = (next: View) => {
    if (next === view) return;
    setView(next);
    preloadDemo(project.id);
    haptic.light();
  };
  const chooseProject = (index: number) => {
    if (index === projectIndex) return;
    setProjectIndex(index);
    setView('home');
    preloadDemo(projects[index].id);
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
    chooseView(dx < 0 ? 'product' : 'home');
  };
  useEffect(() => {
    const image = new Image();
    image.src = project.product;
  }, [project]);

  return <div className="home-demo" data-testid="home-exhibit">
    <div className="home-demo__projects" role="group" aria-label={ru ? 'Выберите пример' : 'Choose an example'}>
      {projects.map((item, index) => <button key={item.id} type="button" aria-pressed={projectIndex === index} onClick={() => chooseProject(index)}>{ru ? item.title : item.titleEn}</button>)}
    </div>
    <button type="button" className="home-demo__image" data-testid="home-open-demo" onPointerDown={startSwipe} onPointerUp={finishSwipe} onPointerCancel={() => { gesture.current = null; }} onClick={(event) => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; } onOpenDemo(project.id); }} onTouchStart={() => preloadDemo(project.id)} aria-label={ru ? `Открыть демо: ${project.label.toLowerCase()}` : `Open demo: ${project.labelEn.toLowerCase()}`}>
      <img key={`${project.id}-${view}`} data-view={view} src={project[view]} alt="" draggable={false} fetchPriority={projectIndex === 0 && view === 'home' ? 'high' : 'auto'} decoding="async" />
    </button>
    <div className="home-demo__switch" role="group" aria-label={ru ? 'Экран приложения' : 'App screen'}>
      <span>{ru ? project.label : project.labelEn}</span>
      <div><button type="button" aria-pressed={view === 'home'} onClick={() => chooseView('home')}>{ru ? 'Главная' : 'Home'}</button><button type="button" aria-pressed={view === 'product'} onClick={() => chooseView('product')}>{project.id === 'lumi-studio' ? (ru ? 'Услуга' : 'Service') : (ru ? 'Товар' : 'Product')}</button></div>
    </div>
    <button type="button" className="home-demo__open" onClick={() => onOpenDemo(project.id)}>{ru ? 'Открыть приложение' : 'Open app'} <ArrowUpRight size={17} aria-hidden="true" /></button>
  </div>;
}
