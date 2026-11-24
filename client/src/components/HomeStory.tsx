import { useState } from 'react';
import { StudioContactLink } from './StudioContactLink';
import { HomeArtwork } from './HomeArtwork';
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useHaptic } from '../hooks/useHaptic';
import flowerCover from '../assets/showcase-art/flower-store.webp';
import salonCover from '../assets/showcase-art/lumi-studio.webp';
import flowerMini from '../assets/showcase-art/flower-store.preview.webp?inline';
import salonMini from '../assets/showcase-art/lumi-studio.preview.webp?inline';
import './HomeStory.css';

const journeyPreviews = import.meta.glob<string>('../assets/journey-preview/*.webp', { eager: true, import: 'default', query: '?inline' });

interface Props { ru: boolean; onNavigate: (section: string) => void; onOpenDemo: (id: string) => void }

export default function HomeStory({ ru, onNavigate, onOpenDemo }: Props) {
  const [step, setStep] = useState(0);
  const haptic = useHaptic();
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
      <h2 id="hs-journey-title">{ru ? 'Как покупает клиент' : 'How customers shop'}</h2>
      <div className="hs-demo">
        <div className="hs-demo__tabs" role="group" aria-label={ru ? 'Этап покупки' : 'Shopping step'}>
          {path.map((item, index) => <button type="button" key={item.tab} aria-pressed={index === step} onClick={() => changeStep(index)}>{item.tab}</button>)}
        </div>
        <div className="hs-demo__stage">
          <div className="hs-demo__copy" aria-live="polite"><h3>{selected.title}</h3><p>{selected.text}</p></div>
          <HomeArtwork className="hs-demo__art" src={selected.image} alt={selected.alt} loading="lazy"
            placeholder={journeyPreviews[selected.image.replace('/home-story/', '../assets/journey-preview/')]} />
        </div>
      </div>
      <button type="button" className="hs-link" onClick={() => onOpenDemo('muraka-fashion')}>{ru ? 'Попробовать магазин' : 'Try the store'} <ArrowUpRight size={16} aria-hidden="true"/></button>
    </section>
    <section className="hs-solutions" aria-labelledby="hs-solutions-title">
      <h2 id="hs-solutions-title">{ru ? 'Что нужно вашему бизнесу?' : 'What does your business need?'}</h2>
      <div className="hs-solutions__grid">
        <button type="button" onClick={() => onOpenDemo('flower-store')}>
          <HomeArtwork className="hs-solutions__art" src={flowerCover} placeholder={flowerMini} loading="lazy" alt="" />
          <span><strong>{ru ? 'Продавать товары' : 'Sell products'}</strong><small>{ru ? 'Каталог, выбор варианта и корзина. Посмотрите на примере магазина цветов.' : 'A catalog, product options and cart. Explore a flower shop.'}</small></span><ArrowUpRight aria-hidden="true" size={20}/>
        </button>
        <button type="button" onClick={() => onOpenDemo('lumi-studio')}>
          <HomeArtwork className="hs-solutions__art" src={salonCover} placeholder={salonMini} loading="lazy" alt="" />
          <span><strong>{ru ? 'Принимать записи' : 'Take bookings'}</strong><small>{ru ? 'Услуга, специалист и свободное время. Попробуйте запись в салон.' : 'Choose a service, a specialist and a time. Try a salon booking.'}</small></span><ArrowUpRight aria-hidden="true" size={20}/>
        </button>
      </div>
    </section>
    <section className="hs-process" aria-labelledby="hs-process-title">
      <h2 id="hs-process-title">{ru ? 'От идеи до запуска' : 'From idea to launch'}</h2>
      <ol className="hs-timeline">{stages.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.text}</p></li>)}</ol>
    </section>
    <section className="hs-faq" aria-labelledby="hs-faq-title">
      <h2 id="hs-faq-title">{ru ? 'Перед стартом' : 'Before you start'}</h2>
      <div className="hs-faq__list">{faqs.map(item => <details key={item.q}><summary>{item.q}<ChevronDown size={18} aria-hidden="true"/></summary><p>{item.a}</p></details>)}</div>
    </section>
    <section className="hs-final" aria-labelledby="hs-final-title">
      <div><h2 id="hs-final-title">{ru ? 'Сколько будет стоить ваше приложение?' : 'What would your app cost?'}</h2>
      <p>{ru ? 'Выберите направление и нужные функции. Мы покажем предварительный расчёт.' : 'Choose your business type and features for a preliminary estimate.'}</p></div>
      <div className="hs-final__actions"><button type="button" onClick={() => navigate('constructor')}>{ru ? 'Рассчитать проект' : 'Get an estimate'} <ArrowRight size={18} aria-hidden="true"/></button>
      <StudioContactLink ru={ru} /></div>
    </section>
  </div>;
}
