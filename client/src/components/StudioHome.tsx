import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHaptic } from '../hooks/useHaptic';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { preloadDemo } from './demos/DemoRegistry';
import consultantOrb from '../assets/consultant/consultant-orb.webp';
import './StudioHome.css';

interface Props { onNavigate: (section: string) => void; onOpenDemo: (id: string) => void }

const fashionProjects = {
  muraka: { id: 'muraka-fashion', name: 'MURAKA', home: '/home-editorial/fashion-muraka-home-v2.webp', product: '/home-editorial/fashion-muraka-product-v2.webp' },
  mira: { id: 'women-fashion', name: 'MIRA', home: '/home-editorial/fashion-mira-home.webp', product: '/home-editorial/fashion-mira-product.webp' },
} as const;
const fashionProject = fashionProjects.muraka;
const examples = [
  { id: 'flower-store', name: 'FLORA', kind: 'Цветочный магазин', kindEn: 'Flower store', image: '/home-editorial/florist-home.webp' },
  { id: 'nike-sneakers', name: 'NIKE', kind: 'Магазин кроссовок', kindEn: 'Sneaker store', image: '/home-editorial/sneaker-product-v2.webp' },
] as const;
type FashionView = 'home' | 'product';

export default function StudioHome({ onNavigate, onOpenDemo }: Props) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const haptic = useHaptic();
  const { markAsViewed } = useViewedDemos();
  const [view, setView] = useState<FashionView>('home');
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const go = useCallback((section: string) => { haptic.light(); onNavigate(section); }, [haptic, onNavigate]);
  const openDemo = useCallback((id: string) => { haptic.light(); markAsViewed(id); onOpenDemo(id); }, [haptic, markAsViewed, onOpenDemo]);
  const choose = (next: FashionView) => {
    if (next === view) return;
    setView(next);
    preloadDemo(fashionProject.id);
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
    choose(dx < 0 ? 'product' : 'home');
  };

  useEffect(() => {
    const load = () => { const image = new Image(); image.src = fashionProject.product; };
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(load, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(load, 800);
    return () => clearTimeout(id);
  }, []);

  return <main className="studio-home" data-testid="home-page">
    <div className="studio-home__inner">
      <section className="studio-editorial" aria-labelledby="studio-home-title">
        <div className="studio-eyebrow"><span>WEB4TG / STUDIO</span></div>
        <h1 id="studio-home-title">{ru ? 'ОТ ИНТЕРЕСА К ЗАКАЗУ' : 'FROM VIEW TO ORDER'}</h1>
        <p className="studio-intro-copy">{ru ? 'Магазин, запись и сервис — прямо в Telegram.' : 'Store, bookings and services in Telegram.'}</p>
        <div className="studio-fashion" data-testid="home-exhibit">
          <button type="button" className="studio-fashion__image" data-testid="home-open-demo" onPointerDown={startSwipe} onPointerUp={finishSwipe} onPointerCancel={() => { gesture.current = null; }} onClick={(event) => { if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; } openDemo(fashionProject.id); }} onTouchStart={() => preloadDemo(fashionProject.id)} aria-label={ru ? `Открыть демо магазина одежды ${fashionProject.name}` : `Open the ${fashionProject.name} fashion store demo`}>
            <img key={view} data-view={view} src={fashionProject[view]} alt="" draggable={false} fetchPriority={view === 'home' ? 'high' : 'auto'} decoding="async" />
          </button>
          <div className="studio-fashion__switch" role="group" aria-label={ru ? 'Вид магазина одежды' : 'Fashion store view'}>
            <span>{ru ? 'МАГАЗИН ОДЕЖДЫ' : 'FASHION STORE'}</span>
            <div><button type="button" aria-pressed={view === 'home'} onClick={() => choose('home')}>{ru ? 'Главная' : 'Home'}</button><button type="button" aria-pressed={view === 'product'} onClick={() => choose('product')}>{ru ? 'Товар' : 'Product'}</button></div>
          </div>
        </div>
        <div className="studio-intro-actions"><button type="button" onClick={() => openDemo(fashionProject.id)}>{ru ? 'Открыть демо' : 'Open demo'} <ArrowUpRight size={17} aria-hidden="true"/></button><button type="button" onClick={() => go('constructor')} data-testid="home-start-order">{ru ? 'Создать приложение' : 'Create an app'} <ArrowUpRight size={17} aria-hidden="true"/></button></div>
      </section>

      <section className="studio-examples" aria-labelledby="studio-examples-title">
        <div className="studio-rule"><span>01 / {ru ? 'ПРИМЕРЫ' : 'EXAMPLES'}</span><button type="button" onClick={() => go('projects')}>{ru ? 'Все примеры' : 'All examples'} <ArrowUpRight size={15} aria-hidden="true"/></button></div>
        <h2 id="studio-examples-title">{ru ? 'ДЛЯ РАЗНЫХ ИДЕЙ' : 'FOR EVERY IDEA'}</h2>
        <div className="studio-examples__grid">{examples.map(example => <button className="studio-examples__card" key={example.id} type="button" onClick={() => openDemo(example.id)} onTouchStart={() => preloadDemo(example.id)} aria-label={ru ? `Открыть демо ${example.name}: ${example.kind}` : `Open ${example.name} demo: ${example.kindEn}`}><span className="studio-examples__art"><img src={example.image} alt="" loading="lazy" decoding="async"/></span><span className="studio-examples__meta"><span><strong>{example.name}</strong><small>{ru ? example.kind : example.kindEn}</small></span><ArrowUpRight size={17} aria-hidden="true"/></span></button>)}</div>
      </section>

      <section className="studio-approach" aria-labelledby="studio-approach-title">
        <div className="studio-rule"><span>02 / {ru ? 'О СТУДИИ' : 'ABOUT THE STUDIO'}</span><span>WEB4TG</span></div>
        <h2 id="studio-approach-title">{ru ? 'ВАШ БИЗНЕС' : 'YOUR BUSINESS'}</h2>
        <p className="studio-lead">{ru ? 'От идеи до приложения, которое работает внутри Telegram.' : 'From an idea to an app that works inside Telegram.'}</p>
        <div className="studio-steps">
          <div><span>01</span><div><h3>{ru ? 'Задача' : 'The brief'}</h3><p>{ru ? 'Изучаем бизнес, клиентов и их потребности.' : 'We learn about your business and customers.'}</p></div></div>
          <div><span>02</span><div><h3>{ru ? 'Дизайн' : 'Design'}</h3><p>{ru ? 'Продумываем сценарии, интерфейс и движение.' : 'We shape the experience, interface and motion.'}</p></div></div>
          <div><span>03</span><div><h3>{ru ? 'Запуск' : 'Launch'}</h3><p>{ru ? 'Разрабатываем, проверяем и готовим к запуску.' : 'We build, test and prepare your app to launch.'}</p></div></div>
        </div>
      </section>

      <section className="studio-assistant" aria-labelledby="studio-assistant-title">
        <div className="studio-rule"><span>03 / {ru ? 'ДЛЯ ВАШИХ КЛИЕНТОВ' : 'FOR YOUR CUSTOMERS'}</span><span>AI</span></div>
        <h2 id="studio-assistant-title">{ru ? 'ИИ-КОНСУЛЬТАНТ' : 'AI CONSULTANT'}</h2>
        <div className="studio-assistant__body"><div><p>{ru ? 'Отвечает на вопросы и помогает с выбором прямо в приложении.' : 'Answers questions and helps customers choose inside your app.'}</p><button type="button" onClick={() => go('ai-process')}>{ru ? 'Узнать больше' : 'Discover more'} <ArrowUpRight size={17} aria-hidden="true"/></button></div><img src={consultantOrb} alt="" loading="lazy" decoding="async" /></div>
      </section>

      <section className="studio-finish" aria-labelledby="studio-finish-title">
        <div className="studio-rule"><span>04 / {ru ? 'СОЗДАДИМ ВМЕСТЕ' : 'LET’S CREATE'}</span><span>↗</span></div>
        <h2 id="studio-finish-title">{ru ? 'ЕСТЬ ИДЕЯ?' : 'HAVE AN IDEA?'}</h2>
        <p>{ru ? 'Расскажите о задаче — начнём с самого важного.' : 'Tell us what you need — we’ll start with what matters.'}</p>
        <button type="button" onClick={() => go('constructor')}>{ru ? 'Начать проект' : 'Start a project'} <ArrowRight size={19} aria-hidden="true"/></button>
      </section>
      <footer className="studio-footer"><strong>WEB4TG</strong><button type="button" onClick={() => go('projects')}>{ru ? 'Все примеры' : 'All examples'} <ArrowUpRight size={15} aria-hidden="true"/></button><span>© WEB4TG</span></footer>
    </div>
  </main>;
}
