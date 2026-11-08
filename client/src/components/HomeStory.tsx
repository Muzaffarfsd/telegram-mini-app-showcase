import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';
import './HomeStory.css';

interface Props { ru: boolean; onNavigate: (section: string) => void; onOpenDemo: (id: string) => void }

export default function HomeStory({ ru, onNavigate, onOpenDemo }: Props) {
  const [step, setStep] = useState(0);
  const haptic = useHaptic();
  useEffect(() => {
    const warm = () => ['/home-story/journey-product-v2.webp', '/home-story/journey-cart-v2.webp'].forEach(src => { const image = new Image(); image.src = src; });
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(warm, { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(warm, 1000);
    return () => window.clearTimeout(id);
  }, []);
  const path = ru ? [
    { tab: 'Каталог', title: 'Сначала — выбор.', text: 'Покупатель открывает ассортимент, ищет нужное и сравнивает варианты.', image: '/home-story/journey-catalog-v2.webp', alt: 'Композиция с каталогом товаров демонстрационного магазина' },
    { tab: 'Товар', title: 'Затем — детали.', text: 'Фотографии, описание и размеры помогают определиться с покупкой.', image: '/home-story/journey-product-v2.webp', alt: 'Композиция с карточкой товара демонстрационного магазина' },
    { tab: 'Корзина', title: 'И наконец — заказ.', text: 'Выбранные товары собираются в корзину для оформления заказа.', image: '/home-story/journey-cart-v2.webp', alt: 'Композиция с корзиной демонстрационного магазина' },
  ] : [
    { tab: 'Catalog', title: 'First, discover.', text: 'Customers browse the collection, search and compare options.', image: '/home-story/journey-catalog-v2.webp', alt: 'Composition featuring a demonstration store catalog' },
    { tab: 'Product', title: 'Then, the details.', text: 'Photos, descriptions and sizes help customers choose.', image: '/home-story/journey-product-v2.webp', alt: 'Composition featuring a demonstration product page' },
    { tab: 'Cart', title: 'Finally, order.', text: 'Selected items come together in a cart, ready for checkout.', image: '/home-story/journey-cart-v2.webp', alt: 'Composition featuring a demonstration shopping cart' },
  ];
  const stages = ru ? [
    { title: 'Знакомимся', text: 'Обсуждаем бизнес, клиентов и задачу, которую должно решить приложение.' },
    { title: 'Согласуем', text: 'Определяем сценарии, состав функций, стоимость и сроки проекта.' },
    { title: 'Создаём', text: 'Проектируем интерфейс, разрабатываем приложение и проверяем основные сценарии.' },
    { title: 'Запускаем', text: 'Готовим приложение к работе и отдельно обсуждаем дальнейшее сопровождение.' },
  ] : [
    { title: 'Discover', text: 'We discuss your business, customers and what the app needs to do.' },
    { title: 'Agree', text: 'We define the journeys, scope, cost and timeline for your project.' },
    { title: 'Create', text: 'We design the experience, build the app and check its key journeys.' },
    { title: 'Launch', text: 'We prepare the app for use and discuss ongoing support separately.' },
  ];
  const faqs = ru ? [
    { q: 'От чего зависит стоимость?', a: 'Ориентировочную стоимость можно посмотреть в разделе заказа. Итог зависит от функций, сложности и интеграций и согласуется после обсуждения.' },
    { q: 'Что нужно для начала?', a: 'Расскажите о бизнесе, товарах или услугах и о том, что должен делать клиент. Если есть фотографии и примеры, они помогут обсудить детали.' },
    { q: 'Сколько времени займёт разработка?', a: 'Срок зависит от состава проекта. Согласуем его после обсуждения задачи и необходимых функций.' },
    { q: 'Что будет после запуска?', a: 'Обсудим дальнейшее развитие и сопровождение. Его состав и условия согласуются отдельно.' },
  ] : [
    { q: 'What determines the cost?', a: 'You can see a preliminary estimate in the order section. The final cost depends on features, complexity and integrations and is agreed after discussion.' },
    { q: 'What do we need to start?', a: 'Tell us about your business, products or services and what customers should be able to do. Photos and examples help us discuss the details.' },
    { q: 'How long will development take?', a: 'The timeline depends on the scope. We agree on it after discussing your needs and the required features.' },
    { q: 'What happens after launch?', a: 'We can discuss further improvements and support. Its scope and terms are agreed separately.' },
  ];
  const selected = path[step];
  const changeStep = (index: number) => { if (index !== step) { haptic.light(); setStep(index); } };
  const navigate = (section: string) => { haptic.light(); onNavigate(section); };

  return <div className="hs-content" data-testid="home-story-content">
    <section className="hs-journey" aria-labelledby="hs-journey-title">
      <div className="hs-rule"><span>01 / {ru ? 'ПУТЬ КЛИЕНТА' : 'CUSTOMER JOURNEY'}</span><span>{ru ? 'ПРИМЕР' : 'EXAMPLE'}</span></div>
      <h2 id="hs-journey-title">{ru ? 'ПУТЬ К ЗАКАЗУ' : 'FROM VIEW TO ORDER'}</h2>
      <p className="hs-lead">{ru ? 'От первого знакомства с ассортиментом до оформления заказа — в одном приложении.' : 'From discovering the collection to placing an order, in one app.'}</p>

      <div className="hs-demo">
        <div className="hs-demo__top"><span>{ru ? 'НА ПРИМЕРЕ МАГАЗИНА' : 'A STORE EXAMPLE'}</span><span>0{step + 1} / 03</span></div>
        <div className="hs-demo__tabs" role="group" aria-label={ru ? 'Этап пути покупателя' : 'Customer journey step'}>
          {path.map((item, index) => <button type="button" key={item.tab} aria-pressed={index === step} onClick={() => changeStep(index)}>{item.tab}</button>)}
        </div>
        <div className="hs-demo__stage">
          <img className="hs-demo__art" key={selected.image} src={selected.image} alt={selected.alt} decoding="async"/>
        </div>
        <div className="hs-demo__copy" aria-live="polite"><div><h3>{selected.title}</h3><p>{selected.text}</p></div><span>0{step + 1}</span></div>
      </div>
      <button type="button" className="hs-link" onClick={() => onOpenDemo('muraka-fashion')}>{ru ? 'Попробовать магазин' : 'Try the store'} <ArrowUpRight size={17} aria-hidden="true"/></button>
    </section>

    <section className="hs-solution" aria-labelledby="hs-solution-title">
      <div className="hs-rule"><span>02 / {ru ? 'ВОЗМОЖНОСТИ' : 'CAPABILITIES'}</span><span>WEB4TG</span></div>
      <h2 id="hs-solution-title">{ru ? 'ПОД ВАШУ ЗАДАЧУ' : 'BUILT FOR YOU'}</h2>
      <p className="hs-lead">{ru ? 'Магазин, запись или сервис — проектируем приложение вокруг того, что важно вам и вашим клиентам.' : 'A store, booking flow or service — designed around your business and customers.'}</p>
      <div className="hs-solution__feature">
        <div className="hs-solution__feature-copy"><span>{ru ? 'ДЛЯ ВАШИХ КЛИЕНТОВ' : 'FOR YOUR CUSTOMERS'}</span><h3>{ru ? 'Легко выбрать.' : 'Easy to choose.'}</h3><p>{ru ? 'От красивой витрины до понятного следующего шага.' : 'From a clear storefront to the next step.'}</p></div>
        <img src="/flower-store/popular-v5/eustoma.webp" alt="" loading="lazy" decoding="async"/>
      </div>
      <div className="hs-features">
        <article><span>01</span><div><h3>{ru ? 'Каталог' : 'Catalog'}</h3><p>{ru ? 'Покажите ассортимент, фотографии и детали.' : 'Show the collection, photos and details.'}</p></div></article>
        <article><span>02</span><div><h3>{ru ? 'Корзина' : 'Cart'}</h3><p>{ru ? 'Помогите клиенту собрать и оформить заказ.' : 'Help customers put together and place an order.'}</p></div></article>
        <article><span>03</span><div><h3>{ru ? 'Запись' : 'Booking'}</h3><p>{ru ? 'Расскажите об услуге и предложите удобный способ записи.' : 'Introduce your services and offer a convenient way to book.'}</p></div></article>
        <article><span>04</span><div><h3>{ru ? 'Интеграции' : 'Integrations'}</h3><p>{ru ? 'При необходимости обсудим связь с другими системами.' : 'We can discuss connections to other systems as needed.'}</p></div></article>
      </div>
      <p className="hs-note">{ru ? 'Состав приложения подбирается под задачу.' : 'Features are selected for each project.'}</p>
      <button type="button" className="hs-link" onClick={() => navigate('projects')}>{ru ? 'Смотреть все примеры' : 'Explore all examples'} <ArrowUpRight size={17} aria-hidden="true"/></button>
    </section>

    <section className="hs-process" aria-labelledby="hs-process-title">
      <div className="hs-rule"><span>03 / {ru ? 'КАК МЫ РАБОТАЕМ' : 'HOW WE WORK'}</span><span>01—04</span></div>
      <h2 id="hs-process-title">{ru ? 'ОТ ИДЕИ К ЗАПУСКУ' : 'FROM IDEA TO LAUNCH'}</h2>
      <p className="hs-lead">{ru ? 'Начинаем с вашей задачи и вместе определяем, каким будет приложение.' : 'We start with your needs and define the right app together.'}</p>
      <div className="hs-timeline">{stages.map((item, index) => <article key={item.title}><div className="hs-timeline__number">0{index + 1}</div><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
    </section>

    <section className="hs-faq" aria-labelledby="hs-faq-title">
      <div className="hs-rule"><span>04 / FAQ</span><span>{ru ? 'ПЕРЕД СТАРТОМ' : 'BEFORE WE START'}</span></div>
      <h2 id="hs-faq-title">{ru ? 'ЧАСТЫЕ ВОПРОСЫ' : 'COMMON QUESTIONS'}</h2>
      <div className="hs-faq__list">{faqs.map(item => <details key={item.q}><summary>{item.q}<ChevronDown size={19} aria-hidden="true"/></summary><p>{item.a}</p></details>)}</div>
    </section>

    <section className="hs-final" aria-labelledby="hs-final-title">
      <div className="hs-final__eyebrow"><span>WEB4TG | STUDIO</span><span>↗</span></div>
      <h2 id="hs-final-title">{ru ? 'ОБСУДИМ ПРОЕКТ?' : 'LET’S TALK.'}</h2>
      <p>{ru ? 'Расскажите о своём бизнесе — вместе определим, каким может быть ваше приложение.' : 'Tell us about your business and let’s explore what your app could be.'}</p>
      <button type="button" onClick={() => navigate('constructor')}>{ru ? 'Рассчитать проект' : 'Estimate your project'} <ArrowRight size={19} aria-hidden="true"/></button>
      <small>{ru ? 'Предварительный расчёт и подготовка сообщения.' : 'A preliminary estimate and a message draft.'}</small>
      <a href="https://t.me/web4tgs" target="_blank" rel="noopener noreferrer" onClick={event => { if (window.Telegram?.WebApp?.openTelegramLink) { event.preventDefault(); window.Telegram.WebApp.openTelegramLink('https://t.me/web4tgs'); } }}>{ru ? 'Написать в Telegram' : 'Message us on Telegram'} <ArrowUpRight size={16} aria-hidden="true"/></a>
    </section>
    <footer className="hs-footer"><strong>WEB4TG</strong><span>{ru ? 'ПРИЛОЖЕНИЯ В TELEGRAM' : 'APPS IN TELEGRAM'}</span><span>© WEB4TG</span></footer>
  </div>;
}
