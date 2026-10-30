import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AIConsultantSkeleton } from './AIConsultantSkeleton';
import orb from '../assets/consultant/consultant-orb.webp';
import appArtwork from '../assets/consultant/channel-app-latest.webp';
import chatArtwork from '../assets/consultant/channel-chat-latest.webp';
import sneakerPhoto from '../assets/consultant/example-nike.webp';
import humanSupport from '../assets/consultant/human-support.webp';
import './AIConsultantPage.css';

type Channel = 'app' | 'chat';
type Example = 'choice' | 'booking' | 'question';

const examples: Record<Example, { ru: { label: string; question: string; answer: string; reply: string; next: string }; en: { label: string; question: string; answer: string; reply: string; next: string } }> = {
  choice: {
    ru: { label: 'Выбор', question: 'Хочу такие кроссовки. Есть 42 размер?', answer: 'Да, эта пара есть в 42-м размере!', reply: 'Отлично! Как их заказать?', next: 'Помогу оформить заказ. Подобрать ещё средство для ухода за парой?' },
    en: { label: 'Choosing', question: 'I like these sneakers. Is size 42 available?', answer: 'Yes, this pair is available in size 42!', reply: 'Great! How can I order them?', next: 'I can help you order. Would you also like a care product for them?' },
  },
  booking: {
    ru: { label: 'Запись', question: 'Хочу записаться. С чего начать?', answer: 'Помогу с записью. Какая услуга вас интересует?', reply: 'Маникюр в субботу.', next: 'Уточню доступное время и помогу с записью.' },
    en: { label: 'Booking', question: 'I’d like to book. Where do I start?', answer: 'I can help. What service are you interested in?', reply: 'A manicure on Saturday.', next: 'I’ll help find a suitable time and arrange it.' },
  },
  question: {
    ru: { label: 'Вопросы', question: 'Как узнать условия доставки?', answer: 'Подскажу условия. В какой город нужен заказ?', reply: 'В Казань.', next: 'Расскажу о вариантах и сроках доставки.' },
    en: { label: 'Questions', question: 'How can I learn about delivery?', answer: 'I can help with that. Which city is the order for?', reply: 'Manchester.', next: 'I’ll explain the available delivery options.' },
  },
};

type ExampleCopy = typeof examples[Example]['ru'];
type DemoMessage = { role: 'customer' | 'assistant'; text: string; photo?: boolean };

function ConversationPreview({ content, showPhoto, ru }: { content: ExampleCopy; showPhoto: boolean; ru: boolean }) {
  const conversationRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [replay, setReplay] = useState(0);
  const [productSelected, setProductSelected] = useState(false);

  useEffect(() => {
    const target = conversationRef.current;
    if (!target) return;
    if (!('IntersectionObserver' in window)) { setStarted(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setStarted(true); observer.disconnect(); }
    }, { root: document.getElementById('root'), threshold: 0.1 });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const full: DemoMessage[] = [
      { role: 'customer', text: content.question, photo: showPhoto },
      { role: 'assistant', text: content.answer },
      { role: 'customer', text: content.reply },
      { role: 'assistant', text: content.next },
    ];
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setMessages(full); setProductSelected(false); setTyping(false); setDone(true); return;
    }
    let cancelled = false;
    let timer = 0;
    const schedule = (callback: () => void, delay: number) => {
      timer = window.setTimeout(() => { if (!cancelled) callback(); }, delay);
    };
    const typeMessage = (text: string, after: () => void) => {
      setTyping(false);
      setMessages((current) => [...current, { role: 'assistant', text: '' }]);
      const letters = Array.from(text);
      let position = 0;
      const typeNext = () => {
        position += 1;
        setMessages((current) => current.map((message, index) => index === current.length - 1 ? { ...message, text: letters.slice(0, position).join('') } : message));
        if (position < letters.length) schedule(typeNext, 18);
        else schedule(after, 450);
      };
      schedule(typeNext, 35);
    };
    const showFinal = () => { setTyping(true); schedule(() => typeMessage(content.next, () => setDone(true)), 600); };
    const showReply = () => { setMessages((current) => [...current, full[2]]); schedule(showFinal, 550); };
    setDone(false); setProductSelected(false); setTyping(false); setMessages([full[0]]);
    schedule(() => { setTyping(true); schedule(() => typeMessage(content.answer, showReply), 650); }, 500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [content, replay, showPhoto, started]);

  return <>
    <div ref={conversationRef} className="consultant-conversation" data-testid="consultant-example-conversation" aria-label={ru ? 'Пример диалога' : 'Example conversation'}>
      {messages.map((message, index) => <Fragment key={index}><div className={`consultant-message ${message.role === 'customer' ? 'is-customer' : 'is-assistant'}`}>
        <span className="profile-visually-hidden">{message.role === 'customer' ? (ru ? 'Клиент: ' : 'Customer: ') : (ru ? 'Консультант: ' : 'Consultant: ')}</span>
        {message.photo && <img className="consultant-message-photo" src={sneakerPhoto} alt={ru ? 'Пример фотографии кроссовок Nike' : 'Example photograph of Nike sneakers'} width="480" height="480" />}
        <span>{message.text}</span>
      </div>{showPhoto && index === 1 && message.text === content.answer && <div className="consultant-product-preview" data-testid="consultant-example-product"><img src={sneakerPhoto} alt="" width="480" height="480" /><div><strong>Nike Air Force 1</strong><small>{ru ? 'Размер 42 · пример' : 'Size 42 · example'}</small><button type="button" aria-pressed={productSelected} onClick={() => setProductSelected(!productSelected)}>{productSelected ? (ru ? 'Выбрано в примере' : 'Selected in example') : (ru ? 'Выбрать' : 'Select')}</button></div></div>}</Fragment>)}
      {typing && <div className="consultant-typing" aria-hidden="true"><i /><i /><i /></div>}
    </div>
    <span className="profile-visually-hidden" role="status">{typing ? (ru ? 'Консультант печатает' : 'The consultant is typing') : done ? (ru ? 'Пример диалога показан' : 'Example conversation complete') : ''}</span>
    <div className="consultant-demo-footer"><p className="consultant-demo-note">{ru ? 'Пример диалога. Ответы настраиваются под ваш бизнес.' : 'An example conversation. Responses are tailored to your business.'}</p><button type="button" onClick={() => setReplay((value) => value + 1)} aria-label={ru ? 'Повторить пример диалога' : 'Replay example conversation'}>{ru ? 'Повторить' : 'Replay'}</button></div>
  </>;
}

export default function AIConsultantPage(_props: { onNavigate: (path: string) => void }) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [channel, setChannel] = useState<Channel>('app');
  const [comparison, setComparison] = useState<'ai' | 'human'>('ai');
  const [bothChannels, setBothChannels] = useState(false);
  const [example, setExample] = useState<Example>('choice');
  const [artReady, setArtReady] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLElement>(null);
  const comparisonRef = useRef<HTMLElement>(null);
  const currentExample = examples[example][language];

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => { if (active) setArtReady(true); }, 6000);
    Promise.all([orb, appArtwork, chatArtwork, humanSupport].map((src) => new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = src;
    }))).then(() => { if (active) { clearTimeout(timer); setArtReady(true); } });
    return () => { active = false; clearTimeout(timer); };
  }, []);

  const openRequest = useCallback(() => {
    if (!artReady || !rootRef.current?.getClientRects().length) return;
    const selectedChannel = bothChannels ? (ru ? 'В Mini App и Telegram-чате' : 'In the Mini App and Telegram chat') : channel === 'app' ? (ru ? 'Внутри Mini App' : 'Inside a Mini App') : (ru ? 'В Telegram-чате' : 'In a Telegram chat');
    const message = ru
      ? `Здравствуйте! Хочу обсудить ИИ-консультанта для моего бизнеса.\n\n📍 Где будет работать: ${selectedChannel}\n💬 Интересующий сценарий: ${currentExample.label}\n\nРасскажите, пожалуйста, как можно настроить консультанта, и сориентируйте по стоимости и срокам.`
      : `Hello! I’d like to discuss an AI consultant for my business.\n\n📍 Channel: ${selectedChannel}\n💬 Use case: ${currentExample.label}\n\nPlease tell me how the consultant can be set up and provide an estimate for cost and timeline.`;
    const url = `https://t.me/web4tgs?text=${encodeURIComponent(message)}`;
    try {
      if (window.Telegram?.WebApp?.openTelegramLink) window.Telegram.WebApp.openTelegramLink(url);
      else window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [artReady, bothChannels, channel, currentExample.label, ru]);

  useEffect(() => {
    window.addEventListener('web4tg:consultant-contact', openRequest);
    return () => window.removeEventListener('web4tg:consultant-contact', openRequest);
  }, [openRequest]);

  const scrollTo = (element: HTMLElement | null) => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    element?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  if (!artReady) return <AIConsultantSkeleton label={ru ? 'Загрузка страницы консультанта' : 'Loading consultant page'} />;

  return <main ref={rootRef} className="consultant-page" data-testid="consultant-page">
    <div className="consultant-shell">
      <section className="consultant-hero" aria-labelledby="consultant-title">
        <h1 id="consultant-title">{ru ? <>Ваш <em>ИИ-консультант</em> для бизнеса</> : <>Your <em>AI consultant</em> for business</>}</h1>
        <div className="consultant-hero-art">
          <span className="consultant-greeting">{ru ? 'Привет!' : 'Hello!'}</span>
          <img src={orb} width="640" height="640" alt="" draggable={false} />
        </div>
        <p>{ru ? 'Поможет клиентам с выбором и ответит на вопросы — в приложении и в чате.' : 'Helps customers find what they need and answers questions in your app and chat.'}</p>
        <button type="button" className="consultant-primary" onClick={() => scrollTo(comparisonRef.current)} data-testid="consultant-show-demo"><span>{ru ? 'Посмотреть, как это работает' : 'See how it works'}</span><ArrowRight size={18} /></button>
      </section>

      <section className="consultant-comparison" ref={comparisonRef} aria-labelledby="consultant-comparison-title">
        <div className="consultant-section-label">{ru ? 'КОГДА КЛИЕНТУ НУЖНА ПОМОЩЬ' : 'WHEN CUSTOMERS NEED HELP'}</div>
        <h2 id="consultant-comparison-title">{ru ? 'Кто поможет вашему клиенту?' : 'Who helps your customer?'}</h2>
        <p className="consultant-section-intro">{ru ? 'Выберите вариант и посмотрите, как он работает.' : 'Choose an option to see how it works.'}</p>
        <div className="consultant-compare-switch" role="group" aria-label={ru ? 'Сравнить консультантов' : 'Compare consultants'}>
          <button type="button" aria-pressed={comparison === 'ai'} onClick={() => setComparison('ai')} data-testid="consultant-compare-ai">{ru ? 'ИИ-консультант' : 'AI consultant'}</button>
          <button type="button" aria-pressed={comparison === 'human'} onClick={() => setComparison('human')} data-testid="consultant-compare-human">{ru ? 'Специалист' : 'Specialist'}</button>
        </div>
        <div key={comparison} className={`consultant-compare-stage is-${comparison}`} aria-live="polite" data-testid="consultant-comparison-card">
          <div className="consultant-compare-stage-copy"><span className="consultant-compare-chip"><i />{comparison === 'ai' ? (ru ? 'ВАШ ИИ-КОНСУЛЬТАНТ' : 'YOUR AI CONSULTANT') : (ru ? 'СПЕЦИАЛИСТ КОМАНДЫ' : 'YOUR TEAM SPECIALIST')}</span><h3>{comparison === 'ai' ? (ru ? 'Рядом, даже когда вы заняты' : 'There even when you’re busy') : (ru ? 'Личный опыт в нужный момент' : 'Personal expertise when it matters')}</h3><p>{comparison === 'ai' ? (ru ? 'Поможет с вопросами и подбором даже вне рабочего графика.' : 'Helps with questions and choices, even outside working hours.') : (ru ? 'Подключается к сложным вопросам и помогает принять решение.' : 'Steps in for complex questions and helps make decisions.')}</p></div>
          <img className="consultant-compare-art" src={comparison === 'ai' ? orb : humanSupport} alt="" />
          <div className="consultant-compare-detail"><span>{comparison === 'ai' ? (ru ? 'НЕСКОЛЬКО ДИАЛОГОВ' : 'MULTIPLE CONVERSATIONS') : (ru ? 'ВНИМАНИЕ К ДЕТАЛЯМ' : 'ATTENTION TO DETAIL')}</span><strong>{comparison === 'ai' ? (ru ? 'Может отвечать параллельно' : 'Can respond in parallel') : (ru ? 'Разбирает нестандартные ситуации' : 'Handles unusual situations')}</strong></div>
        </div>
        <p className="consultant-compare-note">{ru ? 'Возможности зависят от настройки и доступности сервиса.' : 'Capabilities depend on setup and service availability.'}</p>
        <div className="consultant-sales-card"><div><span>{ru ? 'НАСТРАИВАЕТСЯ ПОД ВАШ БИЗНЕС' : 'TAILORED TO YOUR BUSINESS'}</span><h3>{ru ? 'Думает о клиенте и о продаже' : 'Thoughtful for customers and sales'}</h3><p>{ru ? 'В сценариях можно учесть техники продаж, маркетинг и психологию общения — с вашим продуктом и аудиторией в центре.' : 'Your scenarios can reflect sales, marketing and communication principles, with your products and customers at the centre.'}</p></div><div className="consultant-sales-extra"><strong>{ru ? 'Помогает увеличить средний чек' : 'Supports a higher order value'}</strong><span>{ru ? 'Когда уместно, предложит подходящее дополнение к покупке.' : 'Suggests a relevant addition to a purchase when appropriate.'}</span></div></div>
        <button type="button" className="consultant-see-example" onClick={() => scrollTo(demoRef.current)} data-testid="consultant-to-example"><span>{ru ? 'Посмотреть пример диалога' : 'See an example conversation'}</span><ArrowRight size={17} /></button>
      </section>

      <section className="consultant-channels" ref={demoRef} aria-labelledby="consultant-channels-title">
        <div className="consultant-section-label">{ru ? 'ОДИН ПОМОЩНИК · ДВА КАНАЛА' : 'ONE ASSISTANT · TWO CHANNELS'}</div>
        <h2 id="consultant-channels-title">{ru ? 'Рядом с клиентом, где бы он ни был' : 'There for your customers, wherever they are'}</h2>
        <p className="consultant-section-intro">{ru ? 'Выберите, где хотите общаться с клиентами.' : 'Choose where you want to connect with your customers.'}</p>
        <div className="consultant-channel-grid" role="group" aria-label={ru ? 'Канал общения' : 'Communication channel'}>
          <button type="button" className={`consultant-channel consultant-channel-app ${channel === 'app' ? 'is-selected' : ''}`} aria-pressed={channel === 'app'} onClick={() => { setChannel('app'); setBothChannels(false); }} data-testid="consultant-channel-app">
            <span className="consultant-channel-copy"><strong>{ru ? 'В приложении' : 'In the app'}</strong><small>{ru ? 'Помощь рядом с товарами и услугами' : 'Help alongside your products and services'}</small></span>
            <img src={appArtwork} alt="" width="340" height="340" draggable={false} />
            <span className="consultant-channel-check" aria-hidden="true">{channel === 'app' && <Check size={12} strokeWidth={3} />}</span>
          </button>
          <button type="button" className={`consultant-channel consultant-channel-chat ${channel === 'chat' ? 'is-selected' : ''}`} aria-pressed={channel === 'chat'} onClick={() => { setChannel('chat'); setBothChannels(false); }} data-testid="consultant-channel-chat">
            <span className="consultant-channel-copy"><strong>{ru ? 'В Telegram-чате' : 'In Telegram chat'}</strong><small>{ru ? 'Разговор прямо в чате вашего бота' : 'A conversation in your bot’s chat'}</small></span>
            <img src={chatArtwork} alt="" width="340" height="340" draggable={false} />
            <span className="consultant-channel-check" aria-hidden="true">{channel === 'chat' && <Check size={12} strokeWidth={3} />}</span>
          </button>
        </div>
        <button type="button" className={`consultant-both ${bothChannels ? 'is-selected' : ''}`} aria-pressed={bothChannels} onClick={() => setBothChannels(!bothChannels)} data-testid="consultant-both"><span className="consultant-both-check" aria-hidden="true">{bothChannels && <Check size={12} strokeWidth={3} />}</span><span>{ru ? 'Мне интересны оба канала' : 'I’m interested in both channels'}</span></button>
        <div className="consultant-demo" aria-label={ru ? 'Пример диалога' : 'Example conversation'}>
          <div className="consultant-example-heading"><span>{ru ? 'ПОСМОТРИТЕ В ДЕЙСТВИИ' : 'SEE IT IN ACTION'}</span><h3>{ru ? 'Один вопрос — и диалог начинается' : 'One question starts a conversation'}</h3><p>{channel === 'app' ? (ru ? 'Покупатель задаёт вопрос прямо в приложении.' : 'A customer asks a question directly in your app.') : (ru ? 'Покупатель пишет вашему боту в Telegram.' : 'A customer messages your bot in Telegram.')}</p></div>
          <div className="consultant-scenarios" role="group" aria-label={ru ? 'Пример задачи' : 'Example use case'}>
            {(Object.keys(examples) as Example[]).map((id) => <button type="button" key={id} className={example === id ? 'is-selected' : ''} aria-pressed={example === id} onClick={() => setExample(id)} data-testid={`consultant-example-${id}`}>{examples[id][language].label}</button>)}
          </div>
          <div className="consultant-chat-window"><div className="consultant-demo-header"><span className="consultant-demo-avatar"><img src={orb} alt="" /></span><span><strong>{ru ? 'ИИ-консультант' : 'AI consultant'}</strong><small>{channel === 'app' ? 'Mini App' : 'Telegram'}</small></span><span className="consultant-demo-tag">{ru ? 'ПРИМЕР' : 'EXAMPLE'}</span></div><div className="consultant-chat-canvas"><ConversationPreview key={`${example}-${channel}-${language}`} content={currentExample} showPhoto={example === 'choice'} ru={ru} /></div></div>
        </div>
      </section>

      <section className="consultant-benefits" aria-labelledby="consultant-benefits-title">
        <div className="consultant-section-label">{ru ? 'ЧЕМ ПОМОЖЕТ' : 'WHAT IT CAN DO'}</div>
        <h2 id="consultant-benefits-title">{ru ? 'Больше внимания каждому клиенту' : 'More attention for every customer'}</h2>
        <div className="consultant-benefit-list">
          <div><span>01</span><p><strong>{ru ? 'Ответы на вопросы' : 'Answer questions'}</strong><small>{ru ? 'Расскажет об услугах, товарах и условиях на основе ваших материалов.' : 'Explain your services, products and policies using your materials.'}</small></p></div>
          <div><span>02</span><p><strong>{ru ? 'Помощь с выбором' : 'Help customers choose'}</strong><small>{ru ? 'Уточнит пожелания и поможет найти подходящий вариант.' : 'Ask what matters and help find a suitable option.'}</small></p></div>
          <div><span>03</span><p><strong>{ru ? 'Связь с командой' : 'Connect to your team'}</strong><small>{ru ? 'При необходимости можно настроить передачу вопроса специалисту.' : 'A handoff to your team can be set up when needed.'}</small></p></div>
        </div>
      </section>

      <section className="consultant-faq" aria-labelledby="consultant-faq-title">
        <div className="consultant-section-label">{ru ? 'ПОЛЕЗНО ЗНАТЬ' : 'GOOD TO KNOW'}</div>
        <h2 id="consultant-faq-title">{ru ? 'Частые вопросы' : 'Frequently asked questions'}</h2>
        <div className="consultant-faq-list">
          <details><summary>{ru ? 'Что нужно подготовить?' : 'What do I need to prepare?'}<ChevronDown size={18} aria-hidden="true" /></summary><p>{ru ? 'Расскажите о бизнесе и соберите материалы, на которые консультант сможет опираться: описание услуг, каталог и ответы на частые вопросы.' : 'Tell us about your business and gather material the consultant can use, such as service descriptions, a catalogue and common answers.'}</p></details>
          <details><summary>{ru ? 'Можно использовать оба канала?' : 'Can I use both channels?'}<ChevronDown size={18} aria-hidden="true" /></summary><p>{ru ? 'Да, можно обсудить работу консультанта в Mini App и в чате бота. Состав функций и подключение определим для вашего проекта.' : 'We can discuss a consultant for your Mini App and bot chat. The features and connection will be tailored to your project.'}</p></details>
          <details><summary>{ru ? 'Как узнать стоимость?' : 'How do I get an estimate?'}<ChevronDown size={18} aria-hidden="true" /></summary><p>{ru ? 'Стоимость зависит от задач, данных и выбранных каналов. Напишите нам — уточним детали и подготовим предложение.' : 'The cost depends on your goals, information and chosen channels. Contact us to discuss the details and receive an estimate.'}</p></details>
        </div>
      </section>

      <section className="consultant-process" aria-labelledby="consultant-process-title">
        <div className="consultant-section-label">{ru ? 'КАК МЫ НАСТРОИМ' : 'HOW WE SET IT UP'}</div>
        <h2 id="consultant-process-title">{ru ? 'С учётом вашего бизнеса' : 'Built around your business'}</h2>
        <div className="consultant-process-list"><div><span>1</span><p><strong>{ru ? 'Познакомимся с задачей' : 'Understand your needs'}</strong><small>{ru ? 'Обсудим клиентов, продукты и вопросы, с которыми нужна помощь.' : 'Discuss your customers, products and the questions they ask.'}</small></p></div><div><span>2</span><p><strong>{ru ? 'Подготовим материалы' : 'Prepare your information'}</strong><small>{ru ? 'Согласуем знания, ответы и случаи, когда нужен специалист.' : 'Agree on the information, responses and when to involve your team.'}</small></p></div><div><span>3</span><p><strong>{ru ? 'Выберем канал' : 'Choose a channel'}</strong><small>{ru ? 'Продумайте с нами подключение в приложении, чате или обоих местах.' : 'Plan a connection in your app, chat, or both.'}</small></p></div></div>
      </section>

      <section className="consultant-contact" aria-labelledby="consultant-contact-title">
        <div><span>{ru ? 'ВАШ БИЗНЕС · ВАШ КОНСУЛЬТАНТ' : 'YOUR BUSINESS · YOUR CONSULTANT'}</span><h2 id="consultant-contact-title">{ru ? 'Обсудим вашу идею?' : 'Shall we discuss your idea?'}</h2><p>{ru ? 'Расскажите о своей задаче — вместе подберём подходящий сценарий.' : 'Tell us what you need and we’ll find the right approach together.'}</p></div>
        <img src={orb} alt="" />
        <button type="button" className="consultant-primary" onClick={openRequest} data-testid="consultant-contact"><span>{ru ? 'Обсудить консультанта' : 'Discuss your consultant'}</span><ArrowRight size={18} /></button>
        <small>{ru ? 'Откроется подготовленное сообщение в Telegram.' : 'A prepared Telegram message will open.'}</small>
      </section>
    </div>
  </main>;
}
