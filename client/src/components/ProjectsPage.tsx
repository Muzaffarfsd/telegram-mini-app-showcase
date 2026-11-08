import { memo, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronRight, Grid2X2, List } from 'lucide-react';
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

// Each exposed file has a small category symbol and its own graphic pattern.
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

const filePatterns: Record<string, ReactNode> = {
  'flower-store': <><path d="M37 12c7-10 14 4 3 6 10 5 0 14-5 5-3 10-14 3-6-3-11-2-5-14 3-8"/><path d="M35 23v9m0-3 6-3"/></>,
  'apple-store': <><rect x="24" y="6" width="23" height="28" rx="6"/><circle cx="31" cy="13" r="2"/><circle cx="39" cy="13" r="2"/><path d="M31 28h9"/></>,
  'muraka-fashion': <><path d="m24 14 9-7 6 2 9 8-5 6-5-4v14H28V19l-5 4-5-6Z"/><path d="M29 29h12M33 10l3 4 3-4" strokeDasharray="2 3"/></>,
  'nike-sneakers': <><path d="M19 26c14-1 15-6 19-17l8 11 9 5v7H19Z"/><path d="M34 18h7m-9 5h12M20 30h35"/><path d="m23 10 4-2m-7 9 6-2"/></>,
  'lumi-studio': <><path d="M35 5c0 10-3 14-13 16 10 2 13 6 13 16 0-10 3-14 13-16-10-2-13-6-13-16Z"/><path d="m49 5 1 4 4 1-4 1-1 4-1-4-4-1 4-1Z"/></>,
  'china-buyer': <><path d="M20 29h11c11 0 0-17 12-17h12" strokeDasharray="3 3"/><circle cx="19" cy="29" r="4"/><path d="m49 7 6 5-6 5M23 7h9v9h-9Z"/></>,
  'medical-center': <><path d="M17 22h9l5-12 7 23 5-14 4 3h9"/><path d="M34 4v5m-2.5-2.5h5"/></>,
  'opt-market': <><path d="m24 13 12-7 12 7-12 7-12-7Zm0 0v14l12 7 12-7V13M36 20v14M30 10l12 7"/></>,
  'women-fashion': <><path d="m31 7 5 4 5-4 8 8-7 5 7 14H23l7-14-7-5 8-8ZM30 23h12"/><path d="M34 14h4"/></>,
  'skincare-aura': <><path d="M36 5c-5 8-11 13-11 20a11 11 0 0 0 22 0c0-7-6-12-11-20Z"/><path d="M30 25a6 6 0 0 0 6 6M51 8v6m-3-3h6"/></>,
};

const filePoses: Record<string, [number, number, number]> = {
  'flower-store': [-10, 6, 0], 'apple-store': [-7, 8, -2],
  'muraka-fashion': [-11, 4, 1], 'nike-sneakers': [-6, 9, -1],
  'lumi-studio': [-9, 5, -2], 'china-buyer': [-12, 7, 1],
  'medical-center': [-6, 6, 0], 'opt-market': [-9, 9, -1],
  'women-fashion': [-11, 5, 1], 'skincare-aura': [-7, 7, -2],
};
const folderOutline = 'M1 42C1 30 9 23 21 23H60C69 23 75 25 83 30L96 37H159C171 37 179 45 179 57V142C179 154 171 161 159 161H21C9 161 1 154 1 142Z';

function FileArtwork({ id }: { id: string }) {
  const [backAngle, frontAngle, lift] = filePoses[id] ?? [-9, 7, 0];
  return <g style={{ '--file-back-angle': `${backAngle}deg`, '--file-front-angle': `${frontAngle}deg`, '--file-lift': `${lift}px` } as CSSProperties}>
    <g className="folder__file-back">
      <rect x="36" y="16" width="96" height="88" rx="9" fill="var(--paper)" stroke="var(--file-ink)" strokeOpacity=".12"/>
      <rect x="48" y="26" width="26" height="6" rx="3" fill="var(--file-ink)" opacity=".28"/>
      <path d="M49 42h47M49 48h32" stroke="var(--file-ink)" strokeOpacity=".18" strokeWidth="2" strokeLinecap="round"/>
    </g>
    <g className="folder__file-front">
      <rect x="55" y="23" width="99" height="88" rx="9" fill="#fdfdfb" stroke="#d4dad5" strokeOpacity=".8"/>
      <g className="folder__file-graphics" color="var(--file-ink)">
        <rect width="22" height="22" rx="7" fill="var(--paper)" opacity=".6"/>
        <g className="folder__file-symbol" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{fileMarks[id]}</g>
        <g className="folder__file-pattern" fill="none" stroke="currentColor" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{filePatterns[id]}</g>
        <path d="M1 35h32M1 41h21" stroke="currentColor" strokeOpacity=".18" strokeWidth="2" strokeLinecap="round"/>
      </g>
    </g>
  </g>;
}

const Folder = memo(function Folder({ id, paper }: { id: string; paper: string }) {
  return <span className={`folder folder--${paper} folder--${id}`} aria-hidden="true">
    <span className="folder__contact" />
    <svg className="folder__files" viewBox="0 0 180 187" aria-hidden="true">
      <defs>
        <mask id={`file-exposed-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="187"><rect width="180" height="187" fill="#fff"/><path className="folder__file-mask" d={folderOutline} fill="#000"/></mask>
        <clipPath id={`file-transmitted-${id}`}><path className="folder__file-mask" d={folderOutline}/></clipPath>
        <filter id={`file-frost-${id}`} x="-8%" y="-8%" width="116%" height="116%"><feGaussianBlur stdDeviation="1.15"/></filter>
      </defs>
      <g mask={`url(#file-exposed-${id})`}><FileArtwork id={id}/></g>
      <g clipPath={`url(#file-transmitted-${id})`}><g filter={`url(#file-frost-${id})`} opacity=".72"><FileArtwork id={id}/></g></g>
    </svg>
    <svg className="folder__body" viewBox="0 0 180 162" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`folder-gradient-${id}`} x1="0" y1="0" x2=".8" y2="1"><stop stopColor="var(--glass-hi)" stopOpacity=".68"/><stop offset=".5" stopColor="var(--glass-mid)" stopOpacity=".78"/><stop offset="1" stopColor="var(--glass-low)" stopOpacity=".92"/></linearGradient>
        <radialGradient id={`folder-sheen-${id}`} cx=".12" cy=".1" r=".9"><stop stopColor="#fff" stopOpacity=".34"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient>
      </defs>
      <path d={folderOutline} fill={`url(#folder-gradient-${id})`} stroke="#9ca79f" strokeOpacity=".28" strokeWidth="1"/>
      <path d={folderOutline} fill={`url(#folder-sheen-${id})`}/>
      <path d="M2 43C2 31 9 24 21 24H60C69 24 75 26 83 31L96 38H159C170 38 178 45 178 57" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.3"/>
      <path d="M7 50C7 37 12 29 24 29H40" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 142c0 9 5 13 14 13h130" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1" strokeLinecap="round"/>
    </svg>
    <span className="folder__mark">WEB4TG</span>
    <StoreStickers id={id} className="folder__sticker" />
  </span>;
});

type Store = (typeof stores)[number];
const StoreCard = memo(function StoreCard({ store, ru, onOpenDemo }: { store: Store; ru: boolean; onOpenDemo: (id: string) => void }) {
  return <button type="button" className="ps-store" data-testid={`card-app-${store.id}`} aria-label={`${ru ? 'Открыть демо' : 'Open demo'}: ${ru ? store.ru : store.en}`} onClick={() => onOpenDemo(store.id)} onPointerEnter={() => preloadDemo(store.id)} onTouchStart={() => preloadDemo(store.id)} onFocus={() => preloadDemo(store.id)}>
    <Folder id={store.id} paper={store.paper}/><span className="ps-store__copy"><strong>{ru ? store.ru : store.en}</strong></span><ChevronRight className="ps-store__arrow" size={17} aria-hidden="true"/>
  </button>;
});

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
      {filtered.map(store => <StoreCard key={store.id} store={store} ru={ru} onOpenDemo={onOpenDemo} />)}
    </section>
  </div></main>;
});











