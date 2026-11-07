import { memo } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { preloadDemo } from './demos/DemoRegistry';
import './ProjectsShowcase.css';

interface ProjectsPageProps { onNavigate: (section: string) => void; onOpenDemo: (demoId: string) => void }
const details: Record<string, { name: string; ru: string; en: string }> = {
  'flower-store': { name: 'FLORA', ru: 'Цветы и подарки', en: 'Flowers & gifts' },
  'china-buyer': { name: 'CHINA BUYER', ru: 'Байер из Китая', en: 'China sourcing' },
  'medical-center': { name: 'MEDICAL', ru: 'Медицинский центр', en: 'Medical center' },
  'lumi-studio': { name: 'LUMI', ru: 'Студия красоты', en: 'Beauty studio' },
  'opt-market': { name: 'ПАРТИЯ', ru: 'Оптовые закупки', en: 'Wholesale' },
  'apple-store': { name: 'APPLE', ru: 'Магазин техники', en: 'Technology store' },
  'muraka-fashion': { name: 'MURAKA', ru: 'Магазин одежды', en: 'Fashion store' },
  'women-fashion': { name: 'MIRA', ru: 'Женская одежда', en: 'Women’s fashion' },
  'nike-sneakers': { name: 'NIKE', ru: 'Магазин кроссовок', en: 'Sneaker store' },
  'skincare-aura': { name: 'AURA', ru: 'Косметика и уход', en: 'Skincare' },
};
function AppImage({ id, eager = false }: { id: string; eager?: boolean }) {
  return <img src={`/showcase/reference-icons/${id}.webp`} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}
function label(id: string, ru: boolean) { const item = details[id]; return `${ru ? 'Открыть демо' : 'Open demo'} ${item.name}: ${ru ? item.ru : item.en}`; }
function copy(id: string, ru: boolean) { return ru ? details[id].ru : details[id].en; }

export default memo(function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const { language } = useLanguage(); const ru = language === 'ru';
  const cardProps = (id: string) => ({ type: 'button' as const, 'data-testid': `card-app-${id}`, 'aria-label': label(id, ru), onClick: () => onOpenDemo(id), onPointerEnter: () => preloadDemo(id), onTouchStart: () => preloadDemo(id) });
  const tile = (id: string, editorial = false) => <button key={id} className={`ps-tile${editorial ? ' ps-tile--editorial' : ''}`} {...cardProps(id)}><span className="ps-tile__image"><AppImage id={id}/></span><span className="ps-tile__copy">{editorial && <span className="ps-tile__eyebrow">{ru ? 'ПОДБОРКА / WEB4TG' : 'COLLECTION / WEB4TG'}</span>}<strong>{details[id].name}</strong><small>{copy(id, ru)}</small><b>{ru ? 'Открыть демо' : 'Open demo'} <ArrowRight size={14} aria-hidden="true"/></b></span></button>;
  const row = (id: string) => <button key={id} className="ps-row" {...cardProps(id)}><span className="ps-row__copy"><strong>{details[id].name}</strong><small>{copy(id, ru)}</small></span><AppImage id={id}/><span className="ps-row__action">{ru ? 'Открыть демо' : 'Open demo'} <ArrowUpRight size={17} aria-hidden="true"/></span></button>;
  return <main className="projects-showcase" data-testid="projects-showcase"><div className="ps-inner">
    <header className="ps-intro" aria-labelledby="ps-title"><div className="ps-brand">WEB4TG<span>.</span></div><h1 id="ps-title">{ru ? <>ВАШ БИЗНЕС.<br/>ВАШЕ<br/>ПРИЛОЖЕНИЕ.<br/>В TELEGRAM.</> : <>YOUR BUSINESS.<br/>YOUR<br/>APP.<br/>IN TELEGRAM.</>}</h1></header>
    <section className="ps-showcase" aria-label={ru ? 'Примеры приложений' : 'App examples'}>
      <button className="ps-feature" {...cardProps('flower-store')}><span className="ps-feature__art"><AppImage id="flower-store" eager/></span><span className="ps-feature__copy"><small>{ru ? 'ВЫБОР ВИТРИНЫ / 01' : 'SHOWCASE PICK / 01'}</small><strong>{details['flower-store'].name}</strong><em>{copy('flower-store',ru)}</em><b>{ru ? 'Открыть демо' : 'Open demo'} <ArrowRight size={15} aria-hidden="true"/></b></span></button>
      <div className="ps-grid">{tile('apple-store',true)}{tile('muraka-fashion')}{tile('nike-sneakers')}{tile('lumi-studio',true)}</div>
      <section className="ps-section" aria-labelledby="ps-discover-title"><div className="ps-section__heading"><p>{ru ? 'ВЫБОР ПО НАПРАВЛЕНИЮ' : 'FIND YOUR DIRECTION'}</p><h2 id="ps-discover-title">{ru ? 'Найдите своё' : 'Find your fit'}</h2></div><div className="ps-list">{['china-buyer','medical-center','opt-market'].map(row)}</div></section>
      <section className="ps-section" aria-labelledby="ps-picks-title"><div className="ps-section__heading"><p>{ru ? 'В КОЛЛЕКЦИИ' : 'IN THE COLLECTION'}</p><h2 id="ps-picks-title">{ru ? 'Стоит посмотреть' : 'Worth exploring'}</h2></div><div className="ps-list">{['women-fashion','skincare-aura'].map(row)}</div></section>
    </section>
  </div></main>;
});
