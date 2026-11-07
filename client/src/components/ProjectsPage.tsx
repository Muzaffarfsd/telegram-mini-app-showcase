import { memo, useState, type ReactNode } from 'react';
import { Grid2X2, List } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { preloadDemo } from './demos/DemoRegistry';
import { StoreStickers } from './StoreStickers';
import './ProjectsShowcase.css';

interface ProjectsPageProps { onNavigate: (section: string) => void; onOpenDemo: (demoId: string) => void }
type Category = 'all' | 'shops' | 'services';
const stores = [
  { id: 'flower-store', ru: 'Магазин цветов', en: 'Flower shop', category: 'shops', paper: 'rose' },
  { id: 'apple-store', ru: 'Магазин Apple', en: 'Apple store', category: 'shops', paper: 'blue' },
  { id: 'muraka-fashion', ru: 'Магазин одежды', en: 'Clothing store', category: 'shops', paper: 'sand' },
  { id: 'nike-sneakers', ru: 'Магазин обуви', en: 'Shoe store', category: 'shops', paper: 'lime' },
  { id: 'lumi-studio', ru: 'Студия красоты', en: 'Beauty studio', category: 'services', paper: 'rose' },
  { id: 'china-buyer', ru: 'Байер из Китая', en: 'China sourcing', category: 'services', paper: 'sand' },
  { id: 'medical-center', ru: 'Медицинский центр', en: 'Medical center', category: 'services', paper: 'blue' },
  { id: 'opt-market', ru: 'Оптовый магазин', en: 'Wholesale store', category: 'shops', paper: 'sand' },
  { id: 'women-fashion', ru: 'Женская одежда', en: 'Women’s clothing', category: 'shops', paper: 'rose' },
  { id: 'skincare-aura', ru: 'Магазин косметики', en: 'Skincare store', category: 'shops', paper: 'lime' },
] as const;

// Tiny editorial marks on the exposed document, specific to each direction.
const fileMarks: Record<string, ReactNode> = {
  'flower-store': <><path d="M13 17V9m0 5c-3 0-5-2-5-5 3 0 5 2 5 5Zm0-2c0-3 2-5 5-5 0 3-2 5-5 5Z"/><circle cx="13" cy="7" r="2" fill="currentColor" stroke="none"/></>,
  'apple-store': <><rect x="8" y="5" width="10" height="13" rx="2"/><path d="M11 15h4M12 7h2"/></>,
  'muraka-fashion': <><path d="m8 9 3-3 3 2 3-2 3 3-2 2-1-1v8h-6v-8l-1 1Z"/><path d="M11 15h6"/></>,
  'nike-sneakers': <><path d="M7 15c4 0 5-2 6-6l3 3 4 2v3H7Z"/><path d="M12 17h8"/></>,
  'lumi-studio': <><path d="M14 5c0 4-1 6-5 7 4 1 5 3 5 7 0-4 1-6 5-7-4-1-5-3-5-7Z"/><path d="M19 6v3m-1.5-1.5h3"/></>,
  'china-buyer': <><path d="M8 8h11v9H8zM8 11h11M13.5 8v9"/><path d="m17 5 3 2-3 2"/></>,
  'medical-center': <><path d="M14 5v13M7.5 11.5h13"/><path d="M8 16h2l2-3 2 4 2-3h3"/></>,
  'opt-market': <><path d="m7 9 7-4 7 4-7 4-7-4Zm0 0v6l7 4 7-4V9M14 13v6"/></>,
  'women-fashion': <><path d="m14 7-2-2-4 4 3 2-2 7h10l-2-7 3-2-4-4-2 2Z"/><path d="M11 13h6"/></>,
  'skincare-aura': <><path d="M14 5c-2 3-5 6-5 9a5 5 0 0 0 10 0c0-3-3-6-5-9Z"/><path d="M11.5 14a2.5 2.5 0 0 0 2.5 2.5"/></>,
};

function Folder({ id, paper }: { id: string; paper: string }) {
  return <span className={`folder folder--${paper} folder--${id}`} aria-hidden="true">
    <span className="folder__paper folder__paper--back"><i /><b /></span>
    <span className="folder__paper folder__paper--front"><svg viewBox="0 0 90 50" aria-hidden="true"><g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{fileMarks[id]}</g><path d="M29 8h20M29 12h28M29 16h14" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.7" strokeLinecap="round" /></svg></span>
    <svg className="folder__body" viewBox="0 0 180 162" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={`folder-gradient-${id}`} x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="var(--glass-hi)" stopOpacity=".91"/><stop offset=".55" stopColor="var(--glass-mid)" stopOpacity=".91"/><stop offset="1" stopColor="var(--glass-low)" stopOpacity=".94"/></linearGradient></defs>
      <path d="M1 42C1 30 9 23 21 23H60C69 23 75 25 83 30L96 37H159C171 37 179 45 179 57V142C179 154 171 161 159 161H21C9 161 1 154 1 142Z" fill={`url(#folder-gradient-${id})`} stroke="#d1d2d0" strokeOpacity=".85" strokeWidth="1"/>
      <path d="M2 43C2 31 9 24 21 24H60C69 24 75 26 83 31L96 38H159" fill="none" stroke="#fff" strokeOpacity=".82"/>
      <path d="M7 48C7 35 12 29 23 29H39" fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    <span className="folder__mark">WEB4TG</span>
    <StoreStickers id={id} className="folder__sticker" />
  </span>;
}

export default memo(function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [category, setCategory] = useState<Category>('all');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const filtered = stores.filter(store => category === 'all' || store.category === category);
  const filters: { id: Category; label: string }[] = [
    { id: 'all', label: ru ? 'Все' : 'All' },
    { id: 'shops', label: ru ? 'Магазины' : 'Stores' },
    { id: 'services', label: ru ? 'Услуги' : 'Services' },
  ];
  return <main className="projects-showcase" data-testid="projects-showcase"><div className="ps-inner">
    <header className="ps-header">
      <div><p className="ps-kicker">WEB4TG / {ru ? 'КОЛЛЕКЦИЯ' : 'COLLECTION'}</p><h1>{ru ? 'Витрина' : 'Showcase'}<span className="ps-count">{stores.length}</span></h1></div>
      <div className="ps-layout" aria-label={ru ? 'Вид витрины' : 'Showcase layout'}>
        <button type="button" aria-label={ru ? 'Сетка' : 'Grid'} aria-pressed={layout === 'grid'} onClick={() => setLayout('grid')}><Grid2X2 size={17}/></button>
        <button type="button" aria-label={ru ? 'Список' : 'List'} aria-pressed={layout === 'list'} onClick={() => setLayout('list')}><List size={18}/></button>
      </div>
    </header>
    <div className="ps-filters" aria-label={ru ? 'Направления' : 'Categories'}>{filters.map(filter => <button key={filter.id} type="button" aria-pressed={category === filter.id} onClick={() => setCategory(filter.id)}>{filter.label}</button>)}</div>
    <section className={`ps-grid${layout === 'list' ? ' ps-grid--list' : ''}`} aria-label={ru ? 'Примеры приложений' : 'App examples'}>
      {filtered.map(store => <button key={store.id} type="button" className="ps-store" data-testid={`card-app-${store.id}`} aria-label={`${ru ? 'Открыть демо' : 'Open demo'}: ${ru ? store.ru : store.en}`} onClick={() => onOpenDemo(store.id)} onPointerEnter={() => preloadDemo(store.id)} onTouchStart={() => preloadDemo(store.id)}>
        <Folder id={store.id} paper={store.paper}/><span className="ps-store__copy"><strong>{ru ? store.ru : store.en}</strong></span>
      </button>)}
    </section>
  </div></main>;
});





