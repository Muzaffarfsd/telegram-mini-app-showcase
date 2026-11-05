import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHaptic } from '../hooks/useHaptic';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import { preloadDemo } from './demos/DemoRegistry';
import auraScreen from '../assets/home-v2/demo-skincare-aura.webp';
import sneakerScreen from '../assets/home-v2/demo-nike-sneakers.webp';
import storeObject from '../assets/home-v2/store-object.webp';
import './StudioHome.css';

interface Props { onNavigate: (section: string) => void; onOpenDemo: (id: string) => void }

const examples = [
  { id: 'skincare-aura', name: 'AURA', kind: 'Магазин', kindEn: 'Store', title: 'Магазин ухода.', titleEn: 'Skincare store.', label: 'AURA / ДЕМО', labelEn: 'AURA / DEMO', screen: auraScreen, object: storeObject },
  { id: 'nike-sneakers', name: 'NIKE', kind: 'Кроссовки', kindEn: 'Sneakers', title: 'Магазин кроссовок.', titleEn: 'Sneaker store.', label: 'NIKE / ДЕМО', labelEn: 'NIKE / DEMO', screen: sneakerScreen, object: '/royal-step/jordan-1.webp' },
] as const;

function useVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current || !('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export default function StudioHome({ onNavigate, onOpenDemo }: Props) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const haptic = useHaptic();
  const { markAsViewed } = useViewedDemos();
  const [selected, setSelected] = useState(0);
  const startTouch = useRef<{ x: number; y: number } | null>(null);
  const { ref: exhibitRef, visible: exhibitVisible } = useVisible<HTMLDivElement>();
  const { ref: conversationRef, visible: conversationVisible } = useVisible<HTMLDivElement>();
  const current = examples[selected];

  const go = useCallback((section: string) => { haptic.light(); onNavigate(section); }, [haptic, onNavigate]);
  const openDemo = useCallback((id: string) => { haptic.light(); markAsViewed(id); onOpenDemo(id); }, [haptic, markAsViewed, onOpenDemo]);
  const choose = (next: number) => {
    const index = (next + examples.length) % examples.length;
    if (index === selected) return;
    setSelected(index);
    preloadDemo(examples[index].id);
    haptic.light();
  };
  const endSwipe = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = startTouch.current;
    startTouch.current = null;
    if (!start || !event.changedTouches.length) return;
    const x = event.changedTouches[0].clientX - start.x;
    const y = event.changedTouches[0].clientY - start.y;
    if (Math.abs(x) > 55 && Math.abs(x) > Math.abs(y) * 1.4) choose(selected + (x < 0 ? 1 : -1));
  };

  useEffect(() => {
    const load = () => examples.forEach(example => { const image = new Image(); image.src = example.screen; });
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(load, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(load, 800);
    return () => clearTimeout(id);
  }, []);

  return <main className="studio-home" data-testid="home-page">
    <div className="studio-home__inner">
      <section className="studio-intro" aria-labelledby="studio-home-title">
        <div className="studio-intro__eyebrow"><span /> WEB4TG <i /> TELEGRAM MINI APPS</div>
        <h1 id="studio-home-title">{ru ? <>Ваш бизнес.<br /><span>Внутри Telegram.</span></> : <>Your business.<br /><span>Inside Telegram.</span></>}</h1>
        <p>{ru ? 'Создаём приложения, которыми удобно пользоваться — от идеи до запуска.' : 'We create apps people enjoy using, from first idea to launch.'}</p>
      </section>

      <section className="studio-gallery" aria-labelledby="studio-gallery-title">
        <div className="studio-gallery__heading"><div><span>01 / {ru ? 'ПОПРОБУЙТЕ САМИ' : 'TRY IT YOURSELF'}</span><h2 id="studio-gallery-title">{ru ? 'Посмотрите в действии' : 'See it in action'}</h2></div><span className="studio-gallery__count" aria-live="polite">0{selected + 1} <i>/</i> 0{examples.length}</span></div>
        <div className="studio-gallery__tabs" role="group" aria-label={ru ? 'Выбор примера' : 'Choose an example'}>{examples.map((example, index) => <button type="button" key={example.id} aria-pressed={selected === index} onClick={() => choose(index)}>{ru ? example.kind : example.kindEn}</button>)}</div>
        <div ref={exhibitRef} className="studio-exhibit" data-visible={exhibitVisible} data-testid="home-exhibit" onTouchStart={event => { startTouch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={endSwipe}>
          <div className="studio-exhibit__arc" aria-hidden="true" />
          <div key={`front-${current.id}`} className="studio-exhibit__front" aria-hidden="true"><div className="studio-exhibit__screen"><img src={current.screen} alt="" width="390" height="844" /></div></div>
          <div key={`object-${current.id}`} className="studio-exhibit__object" aria-hidden="true"><img src={current.object} alt="" width="720" height="720" /></div>
          <div key={`copy-${current.id}`} className="studio-exhibit__copy"><span>{ru ? current.label : current.labelEn}</span><strong>{ru ? current.title : current.titleEn}</strong></div>
          <button type="button" className="studio-exhibit__open" onClick={() => openDemo(current.id)} onTouchStart={() => preloadDemo(current.id)} data-testid="home-open-demo" aria-label={ru ? `Открыть демо ${current.name}` : `Open ${current.name} demo`}>{ru ? 'Открыть демо' : 'Open demo'} <ArrowUpRight size={16} aria-hidden="true" /></button>
        </div>
        <div className="studio-gallery__bottom"><span>{ru ? 'Это реальные интерактивные демо' : 'These are interactive app demos'}</span><div><button type="button" aria-label={ru ? 'Предыдущий пример' : 'Previous example'} onClick={() => choose(selected - 1)}><ChevronLeft size={19} aria-hidden="true" /></button><button type="button" aria-label={ru ? 'Следующий пример' : 'Next example'} onClick={() => choose(selected + 1)}><ChevronRight size={19} aria-hidden="true" /></button></div></div>
        <button type="button" className="studio-primary studio-primary--wide" onClick={() => go('constructor')} data-testid="home-start-order">{ru ? 'Создать своё приложение' : 'Create your app'} <ArrowUpRight size={19} aria-hidden="true" /></button>
      </section>

      <section className="studio-approach" aria-labelledby="studio-approach-title">
        <div className="studio-label"><span>02 / {ru ? 'КАК МЫ РАБОТАЕМ' : 'HOW WE WORK'}</span><span>↘</span></div>
        <h2 id="studio-approach-title">{ru ? <>От идеи<br /><span>до готового продукта.</span></> : <>From an idea<br /><span>to a finished product.</span></>}</h2>
        <p className="studio-approach__intro">{ru ? 'Проектируем каждый шаг вокруг ваших клиентов и задач бизнеса.' : 'We shape every step around your customers and business.'}</p>
        <div className="studio-steps">
          <div><span>01</span><section><h3>{ru ? 'Разбираемся в задаче' : 'Understand the brief'}</h3><p>{ru ? 'Обсудим бизнес, аудиторию и то, что должно делать приложение.' : 'We discuss your business, audience and what the app needs to do.'}</p></section></div>
          <div><span>02</span><section><h3>{ru ? 'Создаём опыт' : 'Design the experience'}</h3><p>{ru ? 'Продумаем сценарии, интерфейс и движение каждого элемента.' : 'We shape the flows, interface and motion.'}</p></section></div>
          <div><span>03</span><section><h3>{ru ? 'Разрабатываем и запускаем' : 'Build and launch'}</h3><p>{ru ? 'Соберём приложение, проверим работу и подготовим к запуску.' : 'We build, test and prepare your app for launch.'}</p></section></div>
        </div>
      </section>

      <section className="studio-assistant" aria-labelledby="studio-assistant-title">
        <div className="studio-label"><span>03 / {ru ? 'ЕЩЁ БЛИЖЕ К КЛИЕНТАМ' : 'CLOSER TO CUSTOMERS'}</span><span>↘</span></div>
        <div className="studio-assistant__card"><div className="studio-assistant__copy"><span>{ru ? 'ИИ-КОНСУЛЬТАНТ' : 'AI CONSULTANT'}</span><h2 id="studio-assistant-title">{ru ? <>Помогает,<br />пока вы заняты.</> : <>A helping hand,<br />while you are busy.</>}</h2><p>{ru ? 'Отвечает на вопросы и помогает с выбором. Посмотрите пример общения.' : 'Answers questions and helps customers choose. See an example conversation.'}</p><button type="button" onClick={() => go('ai-process')}>{ru ? 'Узнать о консультанте' : 'Explore the consultant'} <ArrowUpRight size={17} aria-hidden="true" /></button></div>
          <div className="studio-assistant__chat" ref={conversationRef} data-visible={conversationVisible} aria-label={ru ? 'Пример диалога' : 'Example conversation'} role="group"><span>{ru ? 'ПРИМЕР ДИАЛОГА' : 'EXAMPLE CONVERSATION'}</span><div className="studio-assistant__message studio-assistant__message--user">{ru ? 'Поможете выбрать?' : 'Can you help me choose?'}</div><div className="studio-assistant__message studio-assistant__message--reply">{ru ? 'Конечно! Расскажите, что вы ищете.' : 'Of course! Tell me what you need.'}</div></div>
        </div>
      </section>

      <section className="studio-finish" aria-labelledby="studio-finish-title"><span>{ru ? 'ВАША ИДЕЯ / НАША РАБОТА' : 'YOUR IDEA / OUR WORK'}</span><h2 id="studio-finish-title">{ru ? <>Пора рассказать<br />о вашей идее.</> : <>Let’s talk<br />about your idea.</>}</h2><p>{ru ? 'Выберите направление приложения — детали обсудим вместе.' : 'Choose your app direction and we will discuss the details.'}</p><button type="button" className="studio-primary" onClick={() => go('constructor')}>{ru ? 'Начать проект' : 'Start a project'}<ArrowRight size={19} aria-hidden="true" /></button></section>
      <footer className="studio-footer"><strong>WEB4TG</strong><button type="button" onClick={() => go('projects')}>{ru ? 'Все примеры' : 'All examples'} <ArrowUpRight size={15} aria-hidden="true" /></button><span>© WEB4TG</span></footer>
    </div>
  </main>;
}
