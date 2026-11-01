import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AIConsultantSkeleton } from './AIConsultantSkeleton';
import { AIConsultantDemo } from './AIConsultantDemo';
import {
  industryNames,
  industryScenes,
  taskNames,
  type ConsultantChannel,
  type ConsultantIndustry,
  type ConsultantTask,
  type ConsultantTone,
} from './consultantJourneyData';
import orb from '../assets/consultant/consultant-orb.webp';
import appArtwork from '../assets/consultant/channel-app-latest.webp';
import chatArtwork from '../assets/consultant/channel-chat-latest.webp';
import humanSupport from '../assets/consultant/human-support.webp';
import knowledgeArt from '../assets/consultant/knowledge-v1.webp';
import benefitAnswersArt from '../assets/consultant/benefit-answers-v2.webp';
import benefitChoiceArt from '../assets/consultant/benefit-choice-v2.webp';
import benefitHandoffArt from '../assets/consultant/benefit-handoff-v2.webp';
import tuningArt from '../assets/consultant/tuning-v1.webp';
import shopArt from '../assets/order/shop-v5.webp';
import servicesArt from '../assets/order/services-v4.webp';
import restaurantArt from '../assets/order/restaurant-v2.webp';
import './AIConsultantPage.css';
import './AIConsultantExperience.css';

const AIConsultantOrb3D = lazy(() => import('./AIConsultantOrb3D').catch(() => ({ default: () => <></> })));

type Screen = 'home' | 'industries' | 'demo' | 'inside' | 'configure' | 'review';
type Props = { onNavigate: (path: string) => void };
const industries: ConsultantIndustry[] = ['shop', 'services', 'restaurant', 'other'];
const previewIndustries = ['shop', 'services', 'restaurant'] as const;
const previewBranchIds = { shop: 'size', services: 'time', restaurant: 'delivery' } as const;
const tasks: ConsultantTask[] = ['questions', 'selection', 'booking', 'orders', 'handoff'];
const industryArt: Record<ConsultantIndustry, string> = {
  shop: shopArt,
  services: servicesArt,
  restaurant: restaurantArt,
  other: appArtwork,
};
const channelNames: Record<ConsultantChannel, { ru: string; en: string }> = {
  app: { ru: 'В Mini App', en: 'In the Mini App' },
  chat: { ru: 'В Telegram-чате', en: 'In Telegram chat' },
  both: { ru: 'В Mini App и Telegram-чате', en: 'In the Mini App and Telegram chat' },
};

export default function AIConsultantPage({ onNavigate }: Props) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [screen, setScreen] = useState<Screen>('home');
  const [industry, setIndustry] = useState<ConsultantIndustry>('shop');
  const [industryChosen, setIndustryChosen] = useState(false);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [view, setView] = useState<'customer' | 'business'>('customer');
  const [demoChannel, setDemoChannel] = useState<'app' | 'chat'>('app');
  const [channel, setChannel] = useState<ConsultantChannel | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<ConsultantTask[]>([]);
  const [tone, setTone] = useState<ConsultantTone | null>(null);
  const [projectName, setProjectName] = useState('');
  const [comparison, setComparison] = useState<'ai' | 'human'>('ai');
  const [previewIndustry, setPreviewIndustry] = useState<(typeof previewIndustries)[number]>('shop');
  const [previewChannel, setPreviewChannel] = useState<'app' | 'chat'>('app');
  const [artReady, setArtReady] = useState(false);
  const [orb3DEnabled, setOrb3DEnabled] = useState(false);
  const [orb3DReady, setOrb3DReady] = useState(false);
  const [orbReaction, setOrbReaction] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const screenRef = useRef<Screen>('home');
  const historyRef = useRef<Screen[]>([]);
  const scrollRef = useRef<Partial<Record<Screen, number>>>({});
  const restoreScrollRef = useRef(0);
  const industryDestination = useRef<Screen>('demo');

  useEffect(() => {
    let active = true;
    const image = new Image();
    const finish = () => {
      if (active) setArtReady(true);
    };
    const timer = window.setTimeout(finish, 5000);
    image.onload = () => {
      const decoded = typeof image.decode === 'function' ? image.decode().catch(() => {}) : Promise.resolve();
      void decoded.then(() => {
        window.clearTimeout(timer);
        finish();
      });
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      finish();
    };
    image.src = orb;
    return () => {
      active = false;
      window.clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!artReady) return;
    const timer = window.setTimeout(() => {
      [shopArt, servicesArt, restaurantArt, appArtwork].forEach((src) => {
        const image = new Image();
        image.src = src;
        if (typeof image.decode === 'function') void image.decode().catch(() => {});
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [artReady]);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (
      navigator as Navigator & {
        connection?: {
          addEventListener?: (type: string, cb: () => void) => void;
          removeEventListener?: (type: string, cb: () => void) => void;
        };
      }
    ).connection;
    const check = () => {
      let lowPower = false;
      try {
        lowPower = localStorage.getItem('tma-low-performance') === 'true';
      } catch {}
      const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      const limitedDevice =
        (device.deviceMemory != null && device.deviceMemory <= 2) ||
        (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2) ||
        Boolean(device.connection?.saveData);
      setOrb3DEnabled(
        !motion.matches && !lowPower && !limitedDevice && Boolean(window.WebGL2RenderingContext),
      );
    };
    check();
    if (typeof motion.addEventListener === 'function') motion.addEventListener('change', check);
    else motion.addListener(check);
    connection?.addEventListener?.('change', check);
    window.addEventListener('performance-mode-change', check);
    return () => {
      if (typeof motion.removeEventListener === 'function') motion.removeEventListener('change', check);
      else motion.removeListener(check);
      connection?.removeEventListener?.('change', check);
      window.removeEventListener('performance-mode-change', check);
    };
  }, []);

  useEffect(() => {
    if (screen !== 'home' || !orb3DEnabled) setOrb3DReady(false);
  }, [screen, orb3DEnabled]);

  const moveTo = useCallback((next: Screen, back = false) => {
    const previous = screenRef.current;
    if (previous === next) return;
    const scroll = document.getElementById('root');
    scrollRef.current[previous] = scroll?.scrollTop || 0;
    if (!back) historyRef.current.push(previous);
    restoreScrollRef.current = back ? scrollRef.current[next] || 0 : 0;
    screenRef.current = next;
    setScreen(next);
  }, []);

  const goBack = useCallback(() => {
    const previous = historyRef.current.pop() || 'home';
    moveTo(previous, true);
  }, [moveTo]);

  useLayoutEffect(() => {
    document.getElementById('root')?.scrollTo({ top: restoreScrollRef.current, behavior: 'auto' });
  }, [screen, artReady]);

  const openRequest = useCallback(() => {
    if (!artReady || !rootRef.current?.getClientRects().length) return;
    const chosenIndustry = industryChosen
      ? industryNames[industry][language]
      : ru
        ? 'Обсудим'
        : 'To be discussed';
    const chosenChannel = channel ? channelNames[channel][language] : ru ? 'Обсудим' : 'To be discussed';
    const chosenTasks = selectedTasks.length
      ? selectedTasks.map((item) => `• ${taskNames[item][language]}`).join('\n')
      : ru
        ? '• Обсудим подходящие задачи'
        : '• Discuss suitable tasks';
    const chosenTone =
      tone === 'warm'
        ? ru
          ? 'Дружелюбный'
          : 'Friendly'
        : tone === 'business'
          ? ru
            ? 'Деловой'
            : 'Professional'
          : ru
            ? 'Обсудим'
            : 'To be discussed';
    const name = projectName.trim().replace(/\s+/g, ' ') || (ru ? 'Обсудим позже' : 'To be discussed');
    const message = ru
      ? `Здравствуйте! Хочу обсудить ИИ-консультанта для моего бизнеса.\n\n📍 ПРОЕКТ\nНазвание: ${name}\nНаправление: ${chosenIndustry}\nКанал: ${chosenChannel}\n\n💬 ЗАДАЧИ КОНСУЛЬТАНТА\n${chosenTasks}\n\n✨ ОБЩЕНИЕ\nТон: ${chosenTone}\n\nРасскажите, пожалуйста, как можно настроить консультанта, и сориентируйте по стоимости и срокам.`
      : `Hello! I’d like to discuss an AI consultant for my business.\n\n📍 PROJECT\nName: ${name}\nBusiness: ${chosenIndustry}\nChannel: ${chosenChannel}\n\n💬 CONSULTANT TASKS\n${chosenTasks}\n\n✨ COMMUNICATION\nTone: ${chosenTone}\n\nPlease tell me how the consultant can be set up and provide an estimate for cost and timeline.`;
    const url = `https://t.me/web4tgs?text=${encodeURIComponent(message)}`;
    try {
      if (window.Telegram?.WebApp?.openTelegramLink) window.Telegram.WebApp.openTelegramLink(url);
      else window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [artReady, channel, industry, industryChosen, language, projectName, ru, selectedTasks, tone]);

  useEffect(() => {
    window.addEventListener('web4tg:consultant-contact', openRequest);
    return () => window.removeEventListener('web4tg:consultant-contact', openRequest);
  }, [openRequest]);

  useEffect(() => {
    const back = window.Telegram?.WebApp?.BackButton;
    if (!back) return;
    const onConsultantRoute = () =>
      ['#/ai-process', '#/ai-agent'].includes(window.location.hash.split('?')[0]);
    const active = () => onConsultantRoute() && Boolean(rootRef.current?.getClientRects().length);
    let frame = 0;
    const sync = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (active()) back.show();
        else if (!onConsultantRoute()) back.hide();
      });
    };
    const handle = () => {
      if (!active()) return;
      if (screenRef.current === 'home') onNavigate('/');
      else goBack();
    };
    back.onClick(handle);
    window.addEventListener('hashchange', sync);
    sync();
    return () => {
      window.cancelAnimationFrame(frame);
      back.offClick(handle);
      window.removeEventListener('hashchange', sync);
      if (active()) back.hide();
    };
  }, [artReady, goBack, onNavigate]);

  const openIndustries = (destination: Screen) => {
    industryDestination.current = destination;
    moveTo('industries');
  };
  const selectIndustry = (item: ConsultantIndustry) => {
    if (item !== industry) {
      setBranchId(null);
      setView('customer');
    }
    setIndustry(item);
    setIndustryChosen(true);
    moveTo(industryDestination.current);
  };
  const selectDemoChannel = (item: 'app' | 'chat') => {
    setDemoChannel(item);
  };
  const toggleTask = (item: ConsultantTask) =>
    setSelectedTasks((current) =>
      current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
    );
  const toneLabel =
    tone === 'warm'
      ? ru
        ? 'Дружелюбный'
        : 'Friendly'
      : tone === 'business'
        ? ru
          ? 'Деловой'
          : 'Professional'
        : ru
          ? 'Обсудим'
          : 'To be discussed';
  const goHome = useCallback(() => {
    historyRef.current = [];
    scrollRef.current.home = 0;
    if (screenRef.current === 'home') {
      document.getElementById('root')?.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      moveTo('home', true);
    }
  }, [moveTo]);
  useEffect(() => {
    window.addEventListener('web4tg:consultant-home', goHome);
    return () => window.removeEventListener('web4tg:consultant-home', goHome);
  }, [goHome]);
  const previewScene = industryScenes[previewIndustry][language];
  const previewBranch =
    previewScene.branches.find((branch) => branch.id === previewBranchIds[previewIndustry]) ??
    previewScene.branches[0];
  const openPreview = () => {
    setIndustry(previewIndustry);
    setIndustryChosen(true);
    setBranchId(previewBranch.id);
    setView('customer');
    setDemoChannel(previewChannel);
    moveTo('demo');
  };
  const screenLabels: Record<Screen, string> = {
    home: '',
    industries: ru ? 'Сценарий' : 'Scenario',
    demo: ru ? 'Пример диалога' : 'Example conversation',
    inside: ru ? 'Как это работает' : 'How it works',
    configure: ru ? 'Ваш консультант' : 'Your consultant',
    review: ru ? 'Обсуждение' : 'Your request',
  };

  if (!artReady)
    return <AIConsultantSkeleton label={ru ? 'Загрузка страницы консультанта' : 'Loading consultant page'} />;

  return (
    <main
      ref={rootRef}
      className="consultant-page consultant-v2"
      data-testid="consultant-page"
      data-consultant-screen={screen}
    >
      <div className="consultant-shell ai2-shell">
        {screen !== 'home' && (
          <nav
            className="ai2-screen-nav"
            aria-label={ru ? 'Навигация по консультанту' : 'Consultant navigation'}
          >
            <button
              type="button"
              onClick={goBack}
              aria-label={ru ? 'Назад' : 'Back'}
              data-testid="consultant-back"
            >
              <ArrowLeft size={20} />
            </button>
            <span>{screenLabels[screen]}</span>
            <button
              type="button"
              onClick={goHome}
              aria-label={ru ? 'На главную консультанта' : 'Consultant home'}
              data-testid="consultant-home-link"
            >
              <span className="ai2-nav-dot" />
              <span>{ru ? 'Обзор' : 'Overview'}</span>
            </button>
          </nav>
        )}

        {screen === 'home' && (
          <section className="ai2-home" aria-labelledby="consultant-title">
            <h1 id="consultant-title">
              {ru ? (
                <>
                  ИИ-консультант
                  <br />
                  для бизнеса
                </>
              ) : (
                <>
                  AI consultant
                  <br />
                  for your business
                </>
              )}
            </h1>
            <div className="ai2-hero-art" data-orb3d={orb3DReady ? 'ready' : 'fallback'}>
              <span className="ai3-hero-greeting">
                {ru ? 'Привет! Я ваш личный ИИ-консультант.' : 'Hello! I’m your personal AI consultant.'}
              </span>
              <img src={orb} alt="" width="640" height="640" fetchPriority="high" />
              {orb3DEnabled && (
                <Suspense fallback={null}>
                  <AIConsultantOrb3D reaction={orbReaction} onReady={setOrb3DReady} />
                </Suspense>
              )}
              {orb3DReady && (
                <button
                  type="button"
                  className="ai6-orb-touch"
                  aria-label={ru ? 'Поздороваться с консультантом' : 'Greet the consultant'}
                  onClick={() => setOrbReaction((value) => value + 1)}
                  data-testid="consultant-orb-greet"
                />
              )}
            </div>
            <p className="ai2-hero-copy">
              {ru
                ? 'Ответы и помощь с выбором — в Telegram и приложении.'
                : 'Answers and help with choosing — in Telegram and your app.'}
            </p>
            <button
              className="ai2-primary"
              type="button"
              onClick={() => openIndustries('demo')}
              data-testid="consultant-show-demo"
            >
              <span>{ru ? 'Посмотреть пример' : 'See an example'}</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="ai2-hero-contact"
              type="button"
              onClick={openRequest}
              data-testid="consultant-contact"
            >
              {ru ? 'Сразу обсудить проект' : 'Discuss your project'}
            </button>
            <div className="ai2-home-intro ai5-benefit-intro">
              <span className="ai2-kicker">{ru ? 'ЧТО УМЕЕТ' : 'WHAT IT CAN DO'}</span>
              <h2>{ru ? 'Чем он поможет' : 'What it can do'}</h2>
              <p>
                {ru
                  ? 'Настроим помощника по вашим товарам, услугам и правилам работы.'
                  : 'We can tailor the assistant to your products, services and policies.'}
              </p>
            </div>
            <div className="ai5-benefit-list">
              <article>
                <img src={benefitAnswersArt} alt="" loading="lazy" />
                <div>
                  <h3>{ru ? 'Ответит на вопросы' : 'Answer questions'}</h3>
                  <p>
                    {ru
                      ? 'Расскажет об условиях, товарах и услугах по вашим материалам.'
                      : 'Explain your terms, products and services using your information.'}
                  </p>
                </div>
              </article>
              <article>
                <img src={benefitChoiceArt} alt="" loading="lazy" />
                <div>
                  <h3>{ru ? 'Поможет с выбором' : 'Help customers choose'}</h3>
                  <p>
                    {ru
                      ? 'Уточнит пожелания клиента и предложит подходящий следующий шаг.'
                      : 'Clarify what the customer needs and suggest a suitable next step.'}
                  </p>
                </div>
              </article>
              <article>
                <img src={benefitHandoffArt} alt="" loading="lazy" />
                <div>
                  <h3>{ru ? 'Передаст специалисту' : 'Bring in your team'}</h3>
                  <p>
                    {ru
                      ? 'Подключит человека по сценарию, который мы согласуем с вами.'
                      : 'Involve a person using a handoff agreed with you.'}
                  </p>
                </div>
              </article>
            </div>
            <div className="ai2-home-intro ai3-story-intro">
              <div>
                <span className="ai2-kicker">{ru ? 'КАК ЭТО ВЫГЛЯДИТ' : 'SEE HOW IT WORKS'}</span>
                <h2>{ru ? 'Попробуйте пример' : 'Try an example'}</h2>
              </div>
              <p>
                {ru
                  ? 'Выберите бизнес и канал, чтобы посмотреть разговор глазами клиента.'
                  : 'Choose a business and channel to see a customer conversation.'}
              </p>
            </div>
            <div
              className="ai3-story-tabs"
              role="group"
              aria-label={ru ? 'Ситуация клиента' : 'Customer situation'}
            >
              {previewIndustries.map((item) => (
                <button
                  type="button"
                  key={item}
                  aria-pressed={previewIndustry === item}
                  onClick={() => setPreviewIndustry(item)}
                  data-testid={`consultant-preview-${item}`}
                >
                  {item === 'shop'
                    ? ru
                      ? 'Магазин'
                      : 'Store'
                    : item === 'services'
                      ? ru
                        ? 'Услуги'
                        : 'Services'
                      : ru
                        ? 'Ресторан'
                        : 'Restaurant'}
                </button>
              ))}
            </div>
            <div className="ai5-preview-channel">
              <span>{ru ? 'Где показать пример?' : 'Where should the example appear?'}</span>
              <div role="group" aria-label={ru ? 'Канал примера' : 'Example channel'}>
                <button
                  type="button"
                  aria-pressed={previewChannel === 'app'}
                  onClick={() => setPreviewChannel('app')}
                  data-testid="consultant-preview-channel-app"
                >
                  {ru ? 'В приложении' : 'In the app'}
                </button>
                <button
                  type="button"
                  aria-pressed={previewChannel === 'chat'}
                  onClick={() => setPreviewChannel('chat')}
                  data-testid="consultant-preview-channel-chat"
                >
                  {ru ? 'В Telegram' : 'In Telegram'}
                </button>
              </div>
            </div>
            <div className="ai3-story-card" data-testid="consultant-story-preview" aria-live="polite">
              <div className="ai3-story-topline">
                <span>{ru ? 'ПРИМЕР ДИАЛОГА' : 'EXAMPLE CONVERSATION'}</span>
                <span>{String(previewIndustries.indexOf(previewIndustry) + 1).padStart(2, '0')} / 03</span>
              </div>
              <div className="ai3-story-question" key={previewIndustry}>
                <div>
                  <small>{ru ? 'Клиент спрашивает' : 'The customer asks'}</small>
                  <strong>«{previewBranch.customer}»</strong>
                </div>
                <img src={industryArt[previewIndustry]} alt="" loading="lazy" />
              </div>
              <div className="ai3-story-answer" key={`${previewIndustry}-answer`}>
                <span className="ai3-story-avatar">
                  <img src={orb} alt="" />
                </span>
                <div>
                  <small>{ru ? 'Консультант может ответить' : 'The consultant could reply'}</small>
                  <p>{previewBranch.answer}</p>
                </div>
              </div>
              <button
                type="button"
                className="ai3-story-open"
                onClick={openPreview}
                data-testid="consultant-preview-open"
              >
                <span>{ru ? 'Открыть этот диалог' : 'Open this conversation'}</span>
                <ArrowRight size={18} />
              </button>
              <p className="ai3-story-disclaimer">
                {ru ? 'Пример, а не настоящая переписка.' : 'An example, not a real conversation.'}
              </p>
            </div>
            <div className="ai3-more-heading">
              <span>{ru ? 'ДАЛЬШЕ' : 'EXPLORE'}</span>
              <h2>{ru ? 'Настройка и условия' : 'Setup and terms'}</h2>
            </div>
            <div className="ai2-home-links">
              <button
                type="button"
                className="ai2-home-link"
                onClick={() => moveTo('inside')}
                data-testid="consultant-open-inside"
              >
                <span>
                  <strong>{ru ? 'Как это работает' : 'How it works'}</strong>
                  <small>{ru ? 'Взгляд бизнеса' : 'The business view'}</small>
                </span>
                <img src={knowledgeArt} alt="" loading="lazy" />
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="ai2-home-link"
                onClick={() => moveTo('configure')}
                data-testid="consultant-open-configure"
              >
                <span>
                  <strong>{ru ? 'Подобрать для себя' : 'Make it yours'}</strong>
                  <small>{ru ? 'Каналы и задачи' : 'Channels and tasks'}</small>
                </span>
                <img src={tuningArt} alt="" loading="lazy" />
                <ArrowRight size={17} />
              </button>
            </div>
            <button
              className="ai2-home-terms"
              type="button"
              onClick={() => moveTo('review')}
              data-testid="consultant-open-review"
            >
              <span>{ru ? 'Условия и стоимость' : 'Terms and pricing'}</span>
              <ChevronRight size={18} />
            </button>
          </section>
        )}

        {screen === 'industries' && (
          <section className="ai2-industries" aria-labelledby="ai2-industries-title">
            <div className="ai2-page-heading">
              <span className="ai2-kicker">{ru ? 'НАЧНЁМ С ПРИМЕРА' : 'START WITH AN EXAMPLE'}</span>
              <h1 id="ai2-industries-title">
                {ru ? 'Какой у вас бизнес?' : 'What kind of business do you have?'}
              </h1>
              <p>
                {ru
                  ? 'Выберите направление — покажем подходящую историю общения с клиентом.'
                  : 'Choose a direction to see a relevant customer conversation.'}
              </p>
            </div>
            <div className="ai2-industry-list">
              {industries.map((item) => (
                <button
                  type="button"
                  className={`ai2-industry is-${item}`}
                  key={item}
                  onClick={() => selectIndustry(item)}
                  data-testid={`consultant-industry-${item}`}
                >
                  <span>
                    <strong>{industryNames[item][language]}</strong>
                    <small>
                      {item === 'shop'
                        ? ru
                          ? 'Товары и помощь с выбором'
                          : 'Products and recommendations'
                        : item === 'services'
                          ? ru
                            ? 'Запись и вопросы клиентов'
                            : 'Bookings and customer questions'
                          : item === 'restaurant'
                            ? ru
                              ? 'Меню и условия доставки'
                              : 'Menu and delivery details'
                            : ru
                              ? 'Подберём сценарий вместе'
                              : 'Find a suitable scenario together'}
                    </small>
                    <i>
                      {ru ? 'Посмотреть пример' : 'See an example'} <ArrowRight size={14} />
                    </i>
                  </span>
                  <img src={industryArt[item]} alt="" loading="lazy" />
                  <span className="ai2-industry-arrow">
                    <ArrowRight size={17} />
                  </span>
                </button>
              ))}
            </div>
            <p className="ai2-industry-note">
              {ru
                ? 'Направление можно изменить в любой момент.'
                : 'You can change the direction at any time.'}
            </p>
          </section>
        )}

        {screen === 'demo' && (
          <AIConsultantDemo
            key={industry}
            industry={industry}
            language={language}
            branchId={branchId}
            onBranch={setBranchId}
            view={view}
            onView={setView}
            channel={demoChannel}
            onChannel={selectDemoChannel}
            onChangeIndustry={() => openIndustries('demo')}
            onContinue={() => moveTo('inside')}
          />
        )}

        {screen === 'inside' && (
          <section className="ai2-inside" aria-labelledby="ai2-inside-title">
            <div className="ai2-page-heading">
              <span className="ai2-kicker">{ru ? 'ВЗГЛЯД ИЗНУТРИ' : 'A LOOK INSIDE'}</span>
              <h1 id="ai2-inside-title">{ru ? 'Ваш бизнес — его основа' : 'Built around your business'}</h1>
              <p>
                {ru
                  ? 'Согласуем, что консультант знает, как отвечает и когда подключает команду.'
                  : 'Agree what the consultant knows, how it responds and when your team steps in.'}
              </p>
            </div>
            <div className="ai2-knowledge-card">
              <div>
                <span className="ai2-kicker">{ru ? 'ЗНАНИЯ БИЗНЕСА' : 'YOUR BUSINESS KNOWLEDGE'}</span>
                <h2>{ru ? 'Ответы из ваших материалов' : 'Answers from your information'}</h2>
                <p>
                  {ru
                    ? 'Каталог, услуги, частые вопросы и условия — всё, на что вы хотите опираться.'
                    : 'Your catalogue, services, common questions and policies can form the basis.'}
                </p>
              </div>
              <img src={knowledgeArt} alt="" loading="lazy" />
            </div>
            <div className="ai2-capabilities">
              <div>
                <span>01</span>
                <p>
                  <strong>{ru ? 'Сначала понимает задачу' : 'Starts with the customer’s need'}</strong>
                  <small>
                    {ru
                      ? 'Уточняет пожелания, чтобы предложить подходящий следующий шаг.'
                      : 'Asks what matters to offer a relevant next step.'}
                  </small>
                </p>
              </div>
              <div>
                <span>02</span>
                <p>
                  <strong>{ru ? 'Помогает с выбором' : 'Helps with a choice'}</strong>
                  <small>
                    {ru
                      ? 'Может рассказать о товаре и уместно предложить дополнение.'
                      : 'Can explain a product and suggest a relevant addition.'}
                  </small>
                </p>
              </div>
              <div>
                <span>03</span>
                <p>
                  <strong>{ru ? 'Подключает команду' : 'Involves your team'}</strong>
                  <small>
                    {ru
                      ? 'Сценарий передачи специалисту можно согласовать при настройке.'
                      : 'A handoff to a specialist can be agreed during setup.'}
                  </small>
                </p>
              </div>
            </div>
            <div className="ai2-comparison">
              <div className="ai2-section-heading">
                <span className="ai2-kicker">{ru ? 'ОДНА КОМАНДА' : 'ONE TEAM'}</span>
                <h2>{ru ? 'Помощник и специалист' : 'Assistant and specialist'}</h2>
                <p>{ru ? 'Выберите, чтобы увидеть их роли.' : 'Choose a view to see their roles.'}</p>
              </div>
              <div className="ai2-segment" role="group" aria-label={ru ? 'Сравнить роли' : 'Compare roles'}>
                <button
                  type="button"
                  aria-pressed={comparison === 'ai'}
                  onClick={() => setComparison('ai')}
                  data-testid="consultant-compare-ai"
                >
                  {ru ? 'ИИ-консультант' : 'AI consultant'}
                </button>
                <button
                  type="button"
                  aria-pressed={comparison === 'human'}
                  onClick={() => setComparison('human')}
                  data-testid="consultant-compare-human"
                >
                  {ru ? 'Специалист' : 'Specialist'}
                </button>
              </div>
              <div className={`ai2-compare-card is-${comparison}`} data-testid="consultant-comparison-card">
                <div>
                  <strong>
                    {comparison === 'ai'
                      ? ru
                        ? 'Рядом, когда клиенту нужна помощь'
                        : 'There when customers need help'
                      : ru
                        ? 'Личный опыт в сложный момент'
                        : 'Personal expertise when it matters'}
                  </strong>
                  <p>
                    {comparison === 'ai'
                      ? ru
                        ? 'Может отвечать на типовые вопросы и помогать с выбором.'
                        : 'Can answer common questions and help with choices.'
                      : ru
                        ? 'Разбирает нестандартные ситуации и принимает важные решения.'
                        : 'Handles unusual situations and makes important decisions.'}
                  </p>
                </div>
                <img src={comparison === 'ai' ? orb : humanSupport} alt="" loading="lazy" />
              </div>
              <p className="ai2-disclaimer">
                {ru
                  ? 'Возможности зависят от настройки и доступности сервиса.'
                  : 'Capabilities depend on setup and service availability.'}
              </p>
            </div>
            <div className="ai2-sales-note">
              <Sparkles size={19} />
              <div>
                <strong>{ru ? 'Внимание к клиенту и продаже' : 'Thoughtful for customers and sales'}</strong>
                <p>
                  {ru
                    ? 'В сценариях можно учесть принципы продаж, маркетинга и общения с вашей аудиторией.'
                    : 'Scenarios can reflect sales, marketing and communication principles for your audience.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="ai2-primary"
              onClick={() => moveTo('configure')}
              data-testid="consultant-inside-continue"
            >
              <span>{ru ? 'Подобрать для своего бизнеса' : 'Make it fit your business'}</span>
              <ArrowRight size={18} />
            </button>
          </section>
        )}

        {screen === 'configure' && (
          <section className="ai2-configure" aria-labelledby="ai2-configure-title">
            <div className="ai2-page-heading">
              <span className="ai2-kicker">{ru ? 'СОБЕРЁМ ВМЕСТЕ' : 'LET’S BUILD IT TOGETHER'}</span>
              <h1 id="ai2-configure-title">
                {ru ? 'Каким будет ваш консультант?' : 'What will your consultant be like?'}
              </h1>
              <p>
                {ru
                  ? 'Выберите то, что вам интересно. Детали можно обсудить позже.'
                  : 'Choose what interests you. We can discuss the details later.'}
              </p>
            </div>
            <button
              type="button"
              className="ai2-choice-context"
              onClick={() => openIndustries('configure')}
              data-testid="consultant-config-industry"
            >
              <img src={industryChosen ? industryArt[industry] : appArtwork} alt="" />
              <span>
                <small>{ru ? 'НАПРАВЛЕНИЕ' : 'BUSINESS'}</small>
                <strong>
                  {industryChosen
                    ? industryNames[industry][language]
                    : ru
                      ? 'Выбрать направление'
                      : 'Choose a business type'}
                </strong>
              </span>
              <ChevronRight size={18} />
            </button>
            <div className="ai2-form-section">
              <div className="ai2-section-heading">
                <h2>{ru ? 'Где он будет общаться?' : 'Where will it talk to customers?'}</h2>
                <p>{ru ? 'Выберите один или оба канала.' : 'Choose one or both channels.'}</p>
              </div>
              <div className="ai2-channel-cards">
                <button
                  type="button"
                  className="ai2-channel-card is-app"
                  aria-pressed={channel === 'app'}
                  onClick={() => setChannel('app')}
                  data-testid="consultant-channel-app"
                >
                  <strong>{ru ? 'В приложении' : 'In the app'}</strong>
                  <small>{ru ? 'Рядом с товарами и услугами' : 'Alongside products and services'}</small>
                  <img src={appArtwork} alt="" loading="lazy" />
                  <span>{channel === 'app' && <Check size={13} />}</span>
                </button>
                <button
                  type="button"
                  className="ai2-channel-card is-chat"
                  aria-pressed={channel === 'chat'}
                  onClick={() => setChannel('chat')}
                  data-testid="consultant-channel-chat"
                >
                  <strong>{ru ? 'В Telegram-чате' : 'In Telegram chat'}</strong>
                  <small>{ru ? 'В диалоге с вашим ботом' : 'In your bot’s conversation'}</small>
                  <img src={chatArtwork} alt="" loading="lazy" />
                  <span>{channel === 'chat' && <Check size={13} />}</span>
                </button>
              </div>
              <button
                type="button"
                className="ai2-both-channel"
                aria-pressed={channel === 'both'}
                onClick={() => setChannel((current) => (current === 'both' ? null : 'both'))}
                data-testid="consultant-both"
              >
                <span>{channel === 'both' && <Check size={13} />}</span>
                {ru ? 'Мне интересны оба канала' : 'I’m interested in both channels'}
              </button>
            </div>
            <div className="ai2-form-section">
              <div className="ai2-section-heading">
                <h2>{ru ? 'С чем он поможет?' : 'What should it help with?'}</h2>
                <p>{ru ? 'Можно выбрать несколько задач.' : 'Choose as many tasks as you need.'}</p>
              </div>
              <div
                className="ai2-task-list"
                role="group"
                aria-label={ru ? 'Задачи консультанта' : 'Consultant tasks'}
              >
                {tasks.map((item) => (
                  <button
                    type="button"
                    key={item}
                    aria-pressed={selectedTasks.includes(item)}
                    onClick={() => toggleTask(item)}
                    data-testid={`consultant-task-${item}`}
                  >
                    <span>{selectedTasks.includes(item) && <Check size={13} />}</span>
                    <strong>{taskNames[item][language]}</strong>
                  </button>
                ))}
              </div>
            </div>
            <div className="ai2-form-section">
              <div className="ai2-tone-heading">
                <div className="ai2-section-heading">
                  <h2>{ru ? 'Как он будет говорить?' : 'How should it sound?'}</h2>
                  <p>{ru ? 'Выберите настроение ответа.' : 'Choose a response style.'}</p>
                </div>
                <img src={tuningArt} alt="" loading="lazy" />
              </div>
              <div
                className="ai2-segment"
                role="group"
                aria-label={ru ? 'Тон общения' : 'Communication style'}
              >
                <button
                  type="button"
                  aria-pressed={tone === 'warm'}
                  onClick={() => setTone('warm')}
                  data-testid="consultant-tone-warm"
                >
                  {ru ? 'Дружелюбно' : 'Friendly'}
                </button>
                <button
                  type="button"
                  aria-pressed={tone === 'business'}
                  onClick={() => setTone('business')}
                  data-testid="consultant-tone-business"
                >
                  {ru ? 'По-деловому' : 'Professional'}
                </button>
              </div>
              <div className="ai2-tone-preview" aria-live="polite">
                <span className="ai2-tone-avatar">
                  <img src={orb} alt="" />
                </span>
                <p>
                  {tone === null
                    ? ru
                      ? 'Выберите стиль — здесь появится пример ответа.'
                      : 'Choose a style to see an example response.'
                    : tone === 'warm'
                      ? ru
                        ? 'Здравствуйте! С удовольствием помогу вам выбрать подходящий вариант.'
                        : 'Hello! I’d be happy to help you find the right option.'
                      : ru
                        ? 'Здравствуйте. Помогу подобрать подходящее решение и уточнить детали.'
                        : 'Hello. I can help you choose a suitable solution and clarify the details.'}
                </p>
              </div>
              <small className="ai2-form-note">
                {ru
                  ? 'Пример тона — окончательные ответы согласуем с вами.'
                  : 'Example tone; final responses are agreed with you.'}
              </small>
            </div>
            <div className="ai2-form-section">
              <label className="ai2-input-label" htmlFor="consultant-project-name">
                {ru ? 'Название проекта' : 'Project name'} <span>{ru ? 'необязательно' : 'optional'}</span>
              </label>
              <input
                id="consultant-project-name"
                className="ai2-input"
                maxLength={80}
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder={ru ? 'Например, название вашего бизнеса' : 'For example, your business name'}
              />
            </div>
            <button
              type="button"
              className="ai2-primary"
              onClick={() => moveTo('review')}
              data-testid="consultant-config-continue"
            >
              <span>{ru ? 'Посмотреть заявку' : 'Review your request'}</span>
              <ArrowRight size={18} />
            </button>
          </section>
        )}

        {screen === 'review' && (
          <section className="ai2-review" aria-labelledby="ai2-review-title">
            <div className="ai2-page-heading">
              <span className="ai2-kicker">{ru ? 'ВАШ КОНСУЛЬТАНТ' : 'YOUR CONSULTANT'}</span>
              <h1 id="ai2-review-title">{ru ? 'Обсудим вашу идею?' : 'Shall we discuss your idea?'}</h1>
              <p>
                {ru
                  ? 'Проверьте пожелания — они появятся в сообщении для нашей команды.'
                  : 'Review your preferences; they will appear in your message to our team.'}
              </p>
            </div>
            <div className="ai2-review-hero">
              <div>
                <small>{ru ? 'ВАШ ПРОЕКТ' : 'YOUR PROJECT'}</small>
                <h2>{projectName.trim() || (ru ? 'ИИ-консультант' : 'AI consultant')}</h2>
                <p>
                  {industryChosen
                    ? industryNames[industry][language]
                    : ru
                      ? 'Направление обсудим вместе'
                      : 'We can discuss your business'}
                </p>
              </div>
              <img src={orb} alt="" />
            </div>
            <div className="ai2-summary">
              <div>
                <span>{ru ? 'Канал' : 'Channel'}</span>
                <strong>
                  {channel ? channelNames[channel][language] : ru ? 'Обсудим' : 'To be discussed'}
                </strong>
              </div>
              <div>
                <span>{ru ? 'Задачи' : 'Tasks'}</span>
                <strong>
                  {selectedTasks.length
                    ? selectedTasks.map((item) => taskNames[item][language]).join(' · ')
                    : ru
                      ? 'Обсудим вместе'
                      : 'To be discussed'}
                </strong>
              </div>
              <div>
                <span>{ru ? 'Тон общения' : 'Tone'}</span>
                <strong>{toneLabel}</strong>
              </div>
            </div>
            <button
              type="button"
              className="ai2-edit"
              onClick={() => moveTo('configure')}
              data-testid="consultant-review-edit"
            >
              {ru ? 'Изменить пожелания' : 'Edit preferences'} <ArrowRight size={16} />
            </button>
            <div className="ai2-cost">
              <div>
                <span className="ai2-kicker">{ru ? 'УСЛОВИЯ' : 'TERMS'}</span>
                <h2>{ru ? 'Из чего складывается стоимость' : 'What affects the cost'}</h2>
                <p>
                  {ru
                    ? 'Состав зависит от задач, каналов и подключений. Сначала обсудим проект, затем подготовим предложение.'
                    : 'The scope depends on tasks, channels and integrations. We’ll discuss your project before preparing an estimate.'}
                </p>
              </div>
              <ul>
                <li>
                  <span>{ru ? 'Разработка и настройка' : 'Development and setup'}</span>
                  <strong>{ru ? 'По составу проекта' : 'Based on project scope'}</strong>
                </li>
                <li>
                  <span>{ru ? 'ИИ-сервис и сопровождение' : 'AI service and ongoing support'}</span>
                  <strong>{ru ? 'Согласуем отдельно' : 'Agreed separately'}</strong>
                </li>
              </ul>
            </div>
            <div className="ai2-faq">
              <h2>{ru ? 'Полезно знать' : 'Good to know'}</h2>
              <details>
                <summary>
                  {ru ? 'Что потребуется для настройки?' : 'What is needed for setup?'}
                  <ChevronDown size={18} />
                </summary>
                <p>
                  {ru
                    ? 'Расскажите о бизнесе и подготовьте материалы: описание услуг, каталог и ответы на частые вопросы.'
                    : 'Tell us about your business and gather service descriptions, your catalogue and common answers.'}
                </p>
              </details>
              <details>
                <summary>
                  {ru ? 'Можно использовать оба канала?' : 'Can I use both channels?'}
                  <ChevronDown size={18} />
                </summary>
                <p>
                  {ru
                    ? 'Да, можно обсудить подключение в Mini App и Telegram-чате. Состав и возможности определим для проекта.'
                    : 'We can discuss both Mini App and Telegram chat. The scope is tailored to your project.'}
                </p>
              </details>
              <details>
                <summary>
                  {ru ? 'Что происходит после заявки?' : 'What happens after I contact you?'}
                  <ChevronDown size={18} />
                </summary>
                <p>
                  {ru
                    ? 'Обсудим задачи, материалы и каналы, затем предложим подходящий состав и условия.'
                    : 'We’ll discuss your goals, information and channels, then propose a suitable scope and terms.'}
                </p>
              </details>
            </div>
            <button
              type="button"
              className="ai2-primary"
              onClick={openRequest}
              data-testid="consultant-review-contact"
            >
              <span>{ru ? 'Открыть заявку в Telegram' : 'Open request in Telegram'}</span>
              <ArrowRight size={18} />
            </button>
            <p className="ai2-contact-note">
              {ru
                ? 'Откроется подготовленное сообщение — проверьте и отправьте его сами.'
                : 'A prepared message will open for you to review and send.'}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
