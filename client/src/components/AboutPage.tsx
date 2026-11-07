import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './AboutPage.css';

interface AboutPageProps { onNavigate: (section: string) => void }

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const copy = ru ? {
    eyebrow: 'СТУДИЯ WEB4TG', title: 'Приложения в Telegram',
    intro: 'Онлайн-магазины, запись на услуги и другие сервисы для вашего бизнеса.',
    heroAlt: 'Улыбающийся компьютер для создания приложений',
    order: 'Обсудить проект', explore: 'Узнать о студии',
    sectionLabel: 'ОТ ИДЕИ ДО ЗАПУСКА', sectionTitle: 'Продумано для людей',
    sectionText: 'Соединяем задачи бизнеса и удобство клиентов в одном приложении.',
    designLabel: '01 / ПРОЕКТИРОВАНИЕ', designTitle: 'Сначала — смысл',
    designText: 'Изучаем задачу и продумываем, как человек будет пользоваться приложением.',
    designAlt: 'Папка с макетами интерфейса',
    launchLabel: '02 / РАЗРАБОТКА', launchTitle: 'Затем — в жизнь',
    launchText: 'Создаём интерфейс, собираем приложение и проверяем основные сценарии.',
    launchAlt: 'Устройство с экраном приложения и квитанцией',
    resultLabel: 'ДЛЯ ВАШЕГО БИЗНЕСА', resultTitle: 'Начнём с идеи',
    resultText: 'Магазин, запись или сервис — вместе найдём формат под вашу задачу.',
    examples: 'Посмотреть витрину', contact: 'Написать в Telegram',
  } : {
    eyebrow: 'WEB4TG STUDIO', title: 'Apps in Telegram',
    intro: 'Online stores, appointment booking and other services for your business.',
    heroAlt: 'A smiling computer for creating apps',
    order: 'Discuss a project', explore: 'Discover the studio',
    sectionLabel: 'FROM IDEA TO LAUNCH', sectionTitle: 'Designed for people',
    sectionText: 'We bring business needs and customer experience together in one app.',
    designLabel: '01 / DESIGN', designTitle: 'Start with purpose',
    designText: 'We explore your needs and design how people will use the app.',
    designAlt: 'A folder of interface designs',
    launchLabel: '02 / DEVELOPMENT', launchTitle: 'Bring it to life',
    launchText: 'We build the interface and the app, then check the essential journeys.',
    launchAlt: 'A device with an app screen and receipt',
    resultLabel: 'FOR YOUR BUSINESS', resultTitle: 'Start with an idea',
    resultText: 'A store, booking or service — together we will find the right format.',
    examples: 'Explore the showcase', contact: 'Message us on Telegram',
  };

  const explore = () => document.getElementById('about-story')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  });

  return <main className="studio-about" data-testid="about-page">
    <div className="studio-about__inner">
      <header className="studio-about__hero">
        <span className="studio-about__eyebrow">{copy.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <div className="studio-about__hero-art">
          <img src="/about-studio/hero.webp?v=retro-1" alt={copy.heroAlt} fetchPriority="high" decoding="async" onError={event => { event.currentTarget.hidden = true; }}/>
        </div>
        <button className="studio-about__primary" type="button" onClick={() => onNavigate('constructor')} data-testid="button-cta-constructor">{copy.order}<ArrowRight size={19} aria-hidden="true"/></button>
        <button className="studio-about__more" type="button" onClick={explore}>{copy.explore}<ArrowDown size={16} aria-hidden="true"/></button>
      </header>

      <section className="studio-about__story" id="about-story" aria-labelledby="about-story-title">
        <span className="studio-about__eyebrow">{copy.sectionLabel}</span>
        <h2 id="about-story-title">{copy.sectionTitle}</h2>
        <p className="studio-about__section-intro">{copy.sectionText}</p>
        <div className="studio-about__features">
          <article className="studio-about__feature">
            <div className="studio-about__feature-copy"><span className="studio-about__eyebrow">{copy.designLabel}</span><h3>{copy.designTitle}</h3><p>{copy.designText}</p></div>
            <img src="/about-studio/design.webp?v=objects-2" alt={copy.designAlt} loading="lazy" decoding="async" onError={event => { event.currentTarget.hidden = true; }}/>
          </article>
          <article className="studio-about__feature">
            <div className="studio-about__feature-copy"><span className="studio-about__eyebrow">{copy.launchLabel}</span><h3>{copy.launchTitle}</h3><p>{copy.launchText}</p></div>
            <img src="/about-studio/launch.webp?v=objects-2" alt={copy.launchAlt} loading="lazy" decoding="async" onError={event => { event.currentTarget.hidden = true; }}/>
          </article>
        </div>
      </section>

      <section className="studio-about__finish" aria-labelledby="about-finish-title">
        <span className="studio-about__eyebrow">{copy.resultLabel}</span>
        <h2 id="about-finish-title">{copy.resultTitle}</h2>
        <p>{copy.resultText}</p>
        <button className="studio-about__primary" type="button" onClick={() => onNavigate('projects')} data-testid="about-open-projects">{copy.examples}<ArrowRight size={19} aria-hidden="true"/></button>
        <a className="studio-about__contact" href="https://t.me/web4tgs" target="_blank" rel="noopener noreferrer">{copy.contact}<ArrowUpRight size={16} aria-hidden="true"/></a>
      </section>
    </div>
  </main>;
}
