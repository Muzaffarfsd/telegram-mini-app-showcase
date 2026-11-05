import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart, Search, X } from 'lucide-react';
import { demoApps, type DemoApp } from '../data/demoApps';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useLanguage } from '@/contexts/LanguageContext';
import { preloadDemo } from './demos/DemoRegistry';
import './ProjectsShowcase.css';

interface ProjectsPageProps { onNavigate: (section: string) => void; onOpenDemo: (demoId: string) => void }
type Filter = 'all' | 'stores' | 'services' | 'business' | 'favorites';
const details: Record<string, { group: Filter; label: string; en: string; name: string; image: string; background: string }> = {
  'flower-store': { group: 'stores', label: 'Цветы и подарки', en: 'Flowers & gifts', name: 'FLORA', image: 'flora-ref', background: '#f6efed' },
  'china-buyer': { group: 'business', label: 'Байер из Китая', en: 'China sourcing', name: 'CHINA BUYER', image: 'china-ref', background: '#f2ede7' },
  'medical-center': { group: 'services', label: 'Медицинский центр', en: 'Healthcare', name: 'MEDICAL', image: 'medical-ref', background: '#edf3f3' },
  'lumi-studio': { group: 'services', label: 'Студия красоты', en: 'Beauty studio', name: 'LUMI', image: 'lumi-ref', background: '#f6eeee' },
  'opt-market': { group: 'business', label: 'Оптовые закупки', en: 'Wholesale', name: 'ПАРТИЯ', image: 'party-ref', background: '#f0f2e9' },
  'apple-store': { group: 'stores', label: 'Магазин техники', en: 'Technology', name: 'APPLE', image: 'apple-ref', background: '#eff1f3' },
  'muraka-fashion': { group: 'stores', label: 'Магазин одежды', en: 'Fashion store', name: 'MURAKA', image: 'fashion-ref', background: '#f1f1ed' },
  'nike-sneakers': { group: 'stores', label: 'Магазин кроссовок', en: 'Sneaker store', name: 'NIKE', image: 'nike-ref', background: '#edf1ed' },
  'skincare-aura': { group: 'stores', label: 'Косметика и уход', en: 'Skincare', name: 'AURA', image: 'aura-ref', background: '#f3f1e9' },
};
const art = (app: DemoApp) => `/showcase/miniatures/${details[app.id]?.image}.webp`;
const byId = (id: string) => demoApps.find(app => app.id === id)!;
const featured = ['flower-store', 'muraka-fashion', 'nike-sneakers', 'lumi-studio'];
const categories: { id: Filter; ru: string; en: string; app: string }[] = [
  { id: 'stores', ru: 'Магазины', en: 'Stores', app: 'muraka-fashion' },
  { id: 'services', ru: 'Услуги', en: 'Services', app: 'lumi-studio' },
  { id: 'business', ru: 'Для бизнеса', en: 'For business', app: 'china-buyer' },
];

function ProjectCard({ app, favorite, onFavorite, onOpen, ru }: { app: DemoApp; favorite: boolean; onFavorite: (id: string) => void; onOpen: (id: string) => void; ru: boolean }) {
  const d = details[app.id];
  return <article className="ps-product" data-testid={`card-app-${app.id}`}>
    <div className="ps-product-image" style={{ backgroundColor: d.background }}>
      <button className="ps-product-link" type="button" onClick={() => onOpen(app.id)} onPointerEnter={() => preloadDemo(app.id)} aria-label={`${ru ? 'Открыть' : 'Open'} ${app.title}`} data-testid={`button-open-${app.id}`}>
        <img src={art(app)} alt="" loading="lazy" decoding="async" />
      </button>
      <button className="ps-heart" type="button" aria-pressed={favorite} aria-label={`${favorite ? (ru ? 'Убрать из избранного' : 'Remove from favorites') : (ru ? 'Добавить в избранное' : 'Add to favorites')}: ${app.title}`} onClick={() => onFavorite(app.id)} data-testid={`button-favorite-${app.id}`}><Heart size={18} fill={favorite ? 'currentColor' : 'none'}/></button>
    </div>
    <button className="ps-product-copy" type="button" onClick={() => onOpen(app.id)}><strong>{d.name}</strong><span>{ru ? d.label : d.en}</span><span className="ps-product-action">{ru ? 'Открыть демо' : 'Open demo'} <ArrowUpRight size={14}/></span></button>
  </article>;
}

export default memo(function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const { language } = useLanguage(); const ru = language === 'ru';
  const { favorites, toggle, initialize, isInitialized } = useFavoritesStore();
  const [filter, setFilter] = useState<Filter>('all'); const [query, setQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0); const [storyIndex, setStoryIndex] = useState(0);
  const touchX = useRef<number | null>(null); const catalogRef = useRef<HTMLElement>(null);
  useEffect(() => { if (!isInitialized) void initialize(); }, [initialize, isInitialized]);
  const hero = byId(featured[heroIndex]); const story = byId(featured[storyIndex]);
  const shown = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return demoApps.filter(app => {
      const d = details[app.id];
      return (filter === 'all' || (filter === 'favorites' ? favorites.includes(app.id) : d.group === filter)) &&
        (!term || [app.title, app.description, app.category, d.name, d.label, d.en].join(' ').toLocaleLowerCase().includes(term));
    });
  }, [filter, query, favorites]);
  const open = (id: string) => { try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'); } catch {} onOpenDemo(id); };
  const favorite = (id: string) => { try { window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light'); } catch {} void toggle(id); };
  const jump = (next: Filter = 'all') => { setFilter(next); setQuery(''); requestAnimationFrame(() => catalogRef.current?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })); };
  const moveHero = (delta: number) => setHeroIndex(i => (i + delta + featured.length) % featured.length);
  const moveStory = (delta: number) => setStoryIndex(i => (i + delta + featured.length) % featured.length);
  const filters: { id: Filter; ru: string; en: string }[] = [
    { id: 'all', ru: 'Все', en: 'All' }, { id: 'stores', ru: 'Магазины', en: 'Stores' },
    { id: 'services', ru: 'Услуги', en: 'Services' }, { id: 'business', ru: 'Для бизнеса', en: 'Business' },
    { id: 'favorites', ru: 'Избранное', en: 'Favorites' },
  ];
  return <main className="projects-showcase" data-testid="projects-showcase"><div className="ps-inner">
    <section className="ps-hero" aria-label={ru ? 'Избранные проекты' : 'Featured projects'} onTouchStart={e => { touchX.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touchX.current !== null) { const d = e.changedTouches[0].clientX - touchX.current; if (Math.abs(d) > 55) moveHero(d < 0 ? 1 : -1); touchX.current = null; } }}>
      <h1 className="ps-hero-type"><span>{ru ? 'НОВЫЕ ИДЕИ' : 'NEW IDEAS'}</span><span aria-hidden="true">{ru ? 'НОВЫЕ ИДЕИ' : 'NEW IDEAS'}</span><span aria-hidden="true">{ru ? 'НОВЫЕ ИДЕИ' : 'NEW IDEAS'}</span></h1>
      <button className="ps-hero-object" type="button" onClick={() => open(hero.id)} onPointerEnter={() => preloadDemo(hero.id)} aria-label={`${ru ? 'Открыть' : 'Open'} ${hero.title}`}><img src={art(hero)} alt="" /></button>
      <div className="ps-hero-bottom"><div className="ps-hero-pagination"><button type="button" onClick={() => moveHero(-1)} aria-label={ru ? 'Предыдущий проект' : 'Previous project'}><ArrowLeft size={16}/></button><span>{String(heroIndex + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}</span><button type="button" onClick={() => moveHero(1)} aria-label={ru ? 'Следующий проект' : 'Next project'}><ArrowRight size={16}/></button></div><div className="ps-hero-caption"><small>{ru ? 'ПРОЕКТ В ДЕТАЛЯХ' : 'FEATURED PROJECT'}</small><strong>{details[hero.id].name}</strong></div><button className="ps-circle ps-hero-open" type="button" onClick={() => open(hero.id)} aria-label={`${ru ? 'Открыть' : 'Open'} ${hero.title}`}><ArrowUpRight size={23}/></button></div>
    </section>

    <section className="ps-categories" aria-labelledby="ps-categories-title"><div className="ps-section-heading"><h2 id="ps-categories-title">{ru ? <>ИССЛЕДУЙ<br/>КОЛЛЕКЦИЮ</> : <>EXPLORE THE<br/>COLLECTION</>}</h2><button type="button" onClick={() => jump()}>{ru ? 'Все проекты' : 'All projects'} <ArrowRight size={16}/></button></div><div className="ps-category-scroll">{categories.map(category => { const app = byId(category.app); return <button className="ps-category" key={category.id} type="button" onClick={() => jump(category.id)}><span className="ps-category-art" style={{ backgroundColor: details[app.id].background }}><img src={art(app)} alt="" loading="lazy"/></span><strong>{ru ? category.ru : category.en}</strong></button>; })}</div></section>

    <section className="ps-editorial" aria-labelledby="ps-editorial-title"><div className="ps-section-heading"><h2 id="ps-editorial-title">{ru ? <>ПРОЕКТЫ<br/>В ДЕТАЛЯХ</> : <>PROJECTS<br/>UP CLOSE</>}</h2><span className="ps-counter">{String(storyIndex + 1).padStart(2, '0')} / {String(featured.length).padStart(2, '0')}</span></div>
      <div className="ps-story" style={{ backgroundColor: details[story.id].background }}><div className="ps-story-meta"><span>WEB4TG / {String(storyIndex + 1).padStart(2, '0')}</span><span>{ru ? 'ИНТЕРАКТИВНОЕ ДЕМО' : 'INTERACTIVE DEMO'}</span></div><div className="ps-story-name" aria-hidden="true">{details[story.id].name}</div><button className="ps-story-object" type="button" onClick={() => open(story.id)} aria-label={`${ru ? 'Открыть' : 'Open'} ${story.title}`}><img src={art(story)} alt="" loading="lazy"/></button><div className="ps-story-nav"><button type="button" onClick={() => moveStory(-1)} aria-label={ru ? 'Предыдущий проект' : 'Previous project'}><ArrowLeft size={19}/></button><button type="button" onClick={() => moveStory(1)} aria-label={ru ? 'Следующий проект' : 'Next project'}><ArrowRight size={19}/></button></div></div>
      <div className="ps-story-bottom"><div><strong>{details[story.id].name}</strong><span>{ru ? details[story.id].label : details[story.id].en}</span></div><button type="button" onClick={() => open(story.id)}>{ru ? 'Смотреть проект' : 'View project'} <ArrowUpRight size={18}/></button></div>
    </section>
    <div className="ps-manifesto" aria-label={ru ? 'Ваш бизнес в Telegram' : 'Your business in Telegram'}><span>{ru ? 'ВАШ БИЗНЕС' : 'YOUR BUSINESS'}</span><span>{ru ? 'В TELEGRAM.' : 'IN TELEGRAM.'}</span></div>

    <section className="ps-catalog" ref={catalogRef} aria-labelledby="ps-catalog-title"><div className="ps-section-heading"><h2 id="ps-catalog-title">{ru ? <>ВЫБРАНО<br/>ДЛЯ ВАС</> : <>SELECTED<br/>FOR YOU</>}</h2><span className="ps-counter">{String(shown.length).padStart(2, '0')} / {String(demoApps.length).padStart(2, '0')}</span></div>
      <label className="ps-search"><Search size={18}/><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={ru ? 'Найти проект' : 'Find a project'} aria-label={ru ? 'Поиск проектов' : 'Search projects'}/>{query && <button type="button" onClick={() => setQuery('')} aria-label={ru ? 'Очистить поиск' : 'Clear search'}><X size={16}/></button>}</label>
      <div className="ps-filters" role="group" aria-label={ru ? 'Категории проектов' : 'Project categories'}>{filters.map(item => <button key={item.id} type="button" className={filter === item.id ? 'is-active' : ''} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.id === 'favorites' && <Heart size={13} fill={filter === item.id ? 'currentColor' : 'none'}/>} {ru ? item.ru : item.en}</button>)}</div>
      {shown.length ? <div className="ps-grid">{shown.map(app => <ProjectCard key={app.id} app={app} favorite={favorites.includes(app.id)} onFavorite={favorite} onOpen={open} ru={ru}/>)}</div> : <div className="ps-empty"><h3>{ru ? 'Здесь пока ничего нет' : 'Nothing here yet'}</h3><p>{filter === 'favorites' && !query ? (ru ? 'Сохраняйте понравившиеся проекты сердечком.' : 'Save projects you like with the heart.') : (ru ? 'Попробуйте другой запрос или категорию.' : 'Try another search or category.')}</p><button type="button" onClick={() => { setFilter('all'); setQuery(''); }}>{ru ? 'Все проекты' : 'All projects'} <ArrowRight size={16}/></button></div>}
    </section>
    <section className="ps-next"><span className="ps-next-label">WEB4TG / TELEGRAM MINI APPS</span><h2>{ru ? <>ВАШ БИЗНЕС.<br/><span>ВАШ ПРОЕКТ.</span></> : <>YOUR BUSINESS.<br/><span>YOUR PROJECT.</span></>}</h2><p>{ru ? 'Расскажите нам о своей идее — создадим приложение для вашего бизнеса.' : 'Tell us your idea and create an app for your business.'}</p><button type="button" onClick={() => onNavigate('constructor')} data-testid="button-order-cta">{ru ? 'Обсудить проект' : 'Discuss a project'} <ArrowUpRight size={18}/></button></section>
    <footer className="ps-footer"><strong>WEB4TG</strong><span>{ru ? 'ПРОДУКТЫ ДЛЯ TELEGRAM' : 'PRODUCTS FOR TELEGRAM'}</span></footer>
  </div></main>;
});
