import { memo, useState } from 'react';
import { Grid2X2, List } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { preloadDemo } from './demos/DemoRegistry';
import { StoreStickers } from './StoreStickers';
import './ProjectsShowcase.css';

interface ProjectsPageProps { onNavigate: (section: string) => void; onOpenDemo: (demoId: string) => void }
type Category = 'all' | 'shops' | 'services';
const stores = [
  { id: 'flower-store', name: 'FLORA', ru: 'Цветы и подарки', en: 'Flowers & gifts', category: 'shops', paper: 'rose' },
  { id: 'apple-store', name: 'APPLE', ru: 'Магазин техники', en: 'Technology store', category: 'shops', paper: 'blue' },
  { id: 'muraka-fashion', name: 'MURAKA', ru: 'Магазин одежды', en: 'Fashion store', category: 'shops', paper: 'sand' },
  { id: 'nike-sneakers', name: 'NIKE', ru: 'Магазин кроссовок', en: 'Sneaker store', category: 'shops', paper: 'lime' },
  { id: 'lumi-studio', name: 'LUMI', ru: 'Студия красоты', en: 'Beauty studio', category: 'services', paper: 'rose' },
  { id: 'china-buyer', name: 'CHINA BUYER', ru: 'Байер из Китая', en: 'China sourcing', category: 'services', paper: 'sand' },
  { id: 'medical-center', name: 'MEDICAL', ru: 'Медицинский центр', en: 'Medical center', category: 'services', paper: 'blue' },
  { id: 'opt-market', name: 'ПАРТИЯ', ru: 'Оптовые закупки', en: 'Wholesale', category: 'shops', paper: 'sand' },
  { id: 'women-fashion', name: 'MIRA', ru: 'Женская одежда', en: 'Women’s fashion', category: 'shops', paper: 'rose' },
  { id: 'skincare-aura', name: 'AURA', ru: 'Косметика и уход', en: 'Skincare', category: 'shops', paper: 'lime' },
] as const;

function Folder({ id, paper }: { id: string; paper: string }) {
  return <span className={`folder folder--${paper}`} aria-hidden="true">
    <span className="folder__paper folder__paper--back"><i /></span>
    <span className="folder__paper folder__paper--front"><i /><i /><i /></span>
    <svg className="folder__body" viewBox="0 0 180 162" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id={`folder-gradient-${id}`} x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#f0f0ef"/><stop offset="1" stopColor="#dededd"/></linearGradient></defs>
      <path d="M1 42C1 30 9 23 21 23H60C69 23 75 25 83 30L96 37H159C171 37 179 45 179 57V142C179 154 171 161 159 161H21C9 161 1 154 1 142Z" fill={`url(#folder-gradient-${id})`} stroke="#dededc" strokeWidth="1"/>
      <path d="M2 43C2 31 9 24 21 24H60C69 24 75 26 83 31L96 38H159" fill="none" stroke="#fff" strokeOpacity=".58"/>
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
      {filtered.map(store => <button key={store.id} type="button" className="ps-store" data-testid={`card-app-${store.id}`} aria-label={`${ru ? 'Открыть демо' : 'Open demo'} ${store.name}: ${ru ? store.ru : store.en}`} onClick={() => onOpenDemo(store.id)} onPointerEnter={() => preloadDemo(store.id)} onTouchStart={() => preloadDemo(store.id)}>
        <Folder id={store.id} paper={store.paper}/><span className="ps-store__copy"><strong>{store.name}</strong><small>{ru ? store.ru : store.en}</small></span>
      </button>)}
    </section>
  </div></main>;
});

