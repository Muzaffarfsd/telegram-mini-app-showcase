import { ArrowRight, ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHaptic } from '../hooks/useHaptic';
import { useViewedDemos } from '../hooks/useTelegramStorage';
import HomeDemo from './HomeDemo';
import './StudioHome.css';

interface Props { onNavigate: (section: string) => void; onOpenDemo: (id: string) => void }

export default function StudioHome({ onNavigate, onOpenDemo }: Props) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const haptic = useHaptic();
  const { markAsViewed } = useViewedDemos();
  const go = (section: string) => { haptic.light(); onNavigate(section); };
  const openDemo = (id: string) => { haptic.light(); markAsViewed(id); onOpenDemo(id); };
  const journey = ru ? [
    ['01', 'Знакомство', 'Покупатель открывает магазин и сразу видит ваш ассортимент.'],
    ['02', 'Выбор', 'Изучает фотографии, детали и выбирает то, что ему подходит.'],
    ['03', 'Заказ', 'Собирает корзину и оформляет заказ в удобном интерфейсе.'],
  ] : [
    ['01', 'Discover', 'Customers open your store and see what you offer.'],
    ['02', 'Choose', 'They explore photos and details to find the right product.'],
    ['03', 'Order', 'They add items to the cart and complete their order.'],
  ];
  const steps = ru ? [
    ['Обсудим задачу', 'Расскажите о бизнесе, клиентах и том, что должно делать приложение.'],
    ['Определим решение', 'Согласуем функции, стоимость и сроки под вашу задачу.'],
    ['Создадим и запустим', 'Спроектируем интерфейс, разработаем приложение и проверим основные сценарии.'],
    ['Останемся на связи', 'После запуска обсудим сопровождение и дальнейшее развитие.'],
  ] : [
    ['Discuss your needs', 'Tell us about your business, customers and what the app should do.'],
    ['Define the solution', 'We agree on the features, cost and timeline for your project.'],
    ['Build and launch', 'We design, develop and check the essential customer journeys.'],
    ['Stay in touch', 'After launch, we can discuss support and future improvements.'],
  ];
  const faqs = ru ? [
    ['Сколько стоит разработка?', 'Стоимость зависит от функций, интеграций и сложности проекта. Сначала обсудим задачу и состав приложения.'],
    ['Что нужно для начала?', 'Достаточно рассказать о вашем бизнесе и о том, что вы хотите предложить клиентам. Остальное обсудим вместе.'],
    ['Что происходит после запуска?', 'Можно отдельно согласовать сопровождение, обновления и дальнейшее развитие приложения.'],
  ] : [
    ['How much does development cost?', 'The cost depends on the features, integrations and complexity. We start by discussing your needs and scope.'],
    ['What do I need to get started?', 'Tell us about your business and what you want to offer customers. We can work through the details together.'],
    ['What happens after launch?', 'Ongoing support, updates and further development can be agreed separately.'],
  ];

  return <main className="studio-home" data-testid="home-page">
    <div className="studio-home__inner">
      <section className="studio-editorial" aria-labelledby="studio-home-title">
        <div className="studio-eyebrow"><span>WEB4TG / STUDIO</span><span>{ru ? 'ПРИЛОЖЕНИЯ В TELEGRAM' : 'TELEGRAM APPS'}</span></div>
        <h1 id="studio-home-title">{ru ? 'ВАШ БИЗНЕС' : 'YOUR BUSINESS'}</h1>
        <p className="studio-intro-copy">{ru ? 'Мы создаём приложения в Telegram, где удобно выбирать и заказывать.' : 'We create Telegram apps that make choosing and ordering easy.'}</p>
        <HomeDemo ru={ru} onOpenDemo={openDemo}/>
        <div className="studio-intro-actions"><button type="button" onClick={() => go('projects')}>{ru ? 'Все примеры' : 'All examples'} <ArrowUpRight size={17} aria-hidden="true"/></button><button type="button" onClick={() => go('constructor')} data-testid="home-start-order">{ru ? 'Обсудить проект' : 'Discuss your project'} <ArrowUpRight size={17} aria-hidden="true"/></button></div>
      </section>

      <section className="home-story" aria-labelledby="journey-title">
        <div className="home-section-label"><span>01 / {ru ? 'ПУТЬ ПОКУПАТЕЛЯ' : 'CUSTOMER JOURNEY'}</span><span>WEB4TG</span></div>
        <h2 id="journey-title">{ru ? 'ОТ ИНТЕРЕСА К ЗАКАЗУ' : 'FROM INTEREST TO ORDER'}</h2>
        <p className="home-section-intro">{ru ? 'Хороший магазин помогает покупателю пройти путь от первого взгляда до заказа — без лишних шагов.' : 'A good store makes the journey from first look to order feel natural.'}</p>
        <div className="home-journey">{journey.map(([number, title, text]) => <article key={number}><span className="home-journey__number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
        <p className="home-caption">{ru ? 'Сценарий и функции подбираются под ваш бизнес.' : 'The journey and features are tailored to your business.'}</p>
      </section>

      <section className="home-value" aria-labelledby="value-title">
        <div className="home-section-label"><span>02 / {ru ? 'ДЛЯ ВАШЕГО БИЗНЕСА' : 'FOR YOUR BUSINESS'}</span><span>↗</span></div>
        <h2 id="value-title">{ru ? 'БЛИЖЕ К КЛИЕНТУ' : 'CLOSER TO CUSTOMERS'}</h2>
        <p className="home-section-intro">{ru ? 'Ваши товары и услуги получают собственное пространство там, где вы уже общаетесь с аудиторией.' : 'Give your products and services a home where you already connect with your audience.'}</p>
        <div className="home-value__panel"><span className="home-value__kicker">{ru ? 'ВАШ МАГАЗИН В TELEGRAM' : 'YOUR STORE IN TELEGRAM'}</span><div className="home-value__symbol" aria-hidden="true">↗</div><p>{ru ? 'Витрина. Товар. Заказ.' : 'Discover. Choose. Order.'}</p><div className="home-value__tags"><span>{ru ? 'Каталог' : 'Catalog'}</span><span>{ru ? 'Товар' : 'Product'}</span><span>{ru ? 'Корзина' : 'Cart'}</span><span>{ru ? 'Заказ' : 'Order'}</span></div></div>
        <div className="home-benefits"><div><Check size={17}/><p>{ru ? 'Интерфейс под ваш бренд и ассортимент' : 'An interface shaped around your brand and products'}</p></div><div><Check size={17}/><p>{ru ? 'Сценарии, продуманные для ваших покупателей' : 'Journeys designed for your customers'}</p></div><div><Check size={17}/><p>{ru ? 'Возможность развивать приложение вместе с бизнесом' : 'Room for your app to grow with your business'}</p></div></div>
      </section>

      <section className="home-process" aria-labelledby="process-title">
        <div className="home-section-label"><span>03 / {ru ? 'КАК МЫ РАБОТАЕМ' : 'HOW WE WORK'}</span><span>01—04</span></div>
        <h2 id="process-title">{ru ? 'ОТ ИДЕИ ДО ЗАПУСКА' : 'FROM IDEA TO LAUNCH'}</h2>
        <p className="home-section-intro">{ru ? 'Прозрачный процесс начинается с понимания вашей задачи.' : 'A clear process starts with understanding your needs.'}</p>
        <div className="home-process__list">{steps.map(([title, text], i) => <article key={title}><span>0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </section>

      <section className="home-faq" aria-labelledby="faq-title">
        <div className="home-section-label"><span>04 / FAQ</span><span>{ru ? 'ПЕРЕД СТАРТОМ' : 'BEFORE WE START'}</span></div>
        <h2 id="faq-title">{ru ? 'ВАЖНО ЗНАТЬ' : 'GOOD TO KNOW'}</h2>
        <div className="home-faq__list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={19} aria-hidden="true"/></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="home-final" aria-labelledby="final-title"><span>{ru ? 'ВАША ИДЕЯ / СЛЕДУЮЩИЙ ШАГ' : 'YOUR IDEA / NEXT STEP'}</span><h2 id="final-title">{ru ? 'ДАВАЙТЕ ОБСУДИМ' : 'LET’S TALK'}</h2><p>{ru ? 'Расскажите о своём бизнесе. Вместе определим, каким может быть ваше приложение.' : 'Tell us about your business. Together we can explore what your app could be.'}</p><button type="button" onClick={() => go('constructor')}>{ru ? 'Обсудить проект' : 'Discuss your project'} <ArrowRight size={19}/></button><a href="https://t.me/web4tgs" target="_blank" rel="noopener noreferrer">{ru ? 'Или написать в Telegram' : 'Or message us on Telegram'} <ArrowUpRight size={16}/></a></section>
      <footer className="studio-footer"><strong>WEB4TG</strong><span>{ru ? 'ПРИЛОЖЕНИЯ В TELEGRAM' : 'APPS IN TELEGRAM'}</span><span>© WEB4TG</span></footer>
    </div>
  </main>;
}
