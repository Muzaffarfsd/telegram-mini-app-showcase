import { memo, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, CalendarDays, Droplets, Flower2, Footprints, Gem, HardDrive,
  PackageOpen, PackageSearch, Ruler, Shirt, Stethoscope, type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { preloadDemo } from './demos/DemoRegistry';
import './ProjectsShowcase.css';

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

const filters = [
  { id: 'all', ru: 'Все', en: 'All' },
  { id: 'shops', ru: 'Магазины', en: 'Shops' },
  { id: 'services', ru: 'Услуги', en: 'Services' },
  { id: 'b2b', ru: 'B2B', en: 'B2B' },
] as const;

type Category = typeof filters[number]['id'];
interface Project {
  id: string;
  category: Exclude<Category, 'all'>;
  title: [string, string];
  description: [string, string];
  detail: [string, string];
  icon: LucideIcon;
}

const projects: Project[] = [
  { id: 'flower-store', category: 'shops', title: ['Магазин цветов', 'Flower shop'], description: ['Выберите букет для своего повода.', 'Pick a bouquet for the occasion.'],
    detail: ['Розы и гортензии', 'Roses & hydrangeas'], icon: Flower2 },
  { id: 'muraka-fashion', category: 'shops', title: ['Магазин одежды', 'Clothing store'], description: ['Рассмотрите куртку и подберите размер.', 'Explore the jacket and find your size.'],
    detail: ['S · M · L · XL', 'S · M · L · XL'], icon: Ruler },
  { id: 'lumi-studio', category: 'services', title: ['Студия красоты', 'Beauty studio'], description: ['Выберите услугу, мастера и время.', 'Choose a treatment, stylist and time.'],
    detail: ['Запись к мастеру', 'Book a stylist'], icon: CalendarDays },
  { id: 'opt-market', category: 'b2b', title: ['Оптовый магазин', 'Wholesale store'], description: ['Соберите заказ для своего магазина.', 'Put together an order for your shop.'],
    detail: ['Заказ коробками', 'Order by the case'], icon: PackageOpen },
  { id: 'nike-sneakers', category: 'shops', title: ['Магазин кроссовок', 'Sneaker store'], description: ['Найдите свою пару и размер.', 'Find your pair and size.'],
    detail: ['EU 38–45', 'EU 38–45'], icon: Footprints },
  { id: 'jewelry-store', category: 'shops', title: ['Магазин украшений', 'Jewelry store'], description: ['Рассмотрите детали и сохраните любимое.', 'See the details and save your favorites.'],
    detail: ['Кольца и серьги', 'Rings & earrings'], icon: Gem },
  { id: 'apple-store', category: 'shops', title: ['Магазин техники', 'Electronics store'], description: ['Подберите iPhone и его конфигурацию.', 'Pick an iPhone and its configuration.'],
    detail: ['256 ГБ · 512 ГБ · 1 ТБ', '256 GB · 512 GB · 1 TB'], icon: HardDrive },
  { id: 'medical-center', category: 'services', title: ['Медицинский центр', 'Medical center'], description: ['Найдите специалиста и время приёма.', 'Find a specialist and an appointment.'],
    detail: ['Каталог врачей', 'Doctor directory'], icon: Stethoscope },
  { id: 'women-fashion', category: 'shops', title: ['Женская одежда', 'Womenswear'], description: ['Соберите образ из коллекции.', 'Put together a look from the collection.'],
    detail: ['Платья и жакеты', 'Dresses & jackets'], icon: Shirt },
  { id: 'china-buyer', category: 'b2b', title: ['Байер из Китая', 'China sourcing'], description: ['Оставьте заявку на поиск товара.', 'Send a request to source a product.'],
    detail: ['Поиск по заявке', 'Sourcing requests'], icon: PackageSearch },
  { id: 'skincare-aura', category: 'shops', title: ['Магазин косметики', 'Skincare store'], description: ['Подберите средства для своего ухода.', 'Find products for your skincare routine.'],
    detail: ['Тест по уходу', 'Skincare quiz'], icon: Droplets },
];

const ProjectCard = memo(function ProjectCard({ project, ru, first, onOpenDemo }: {
  project: Project; ru: boolean; first: boolean; onOpenDemo: ProjectsPageProps['onOpenDemo'];
}) {
  const index = ru ? 0 : 1;
  const title = project.title[index];
  const DetailIcon = project.icon;
  const action = ru ? 'Открыть демо' : 'Open demo';
  return <button type="button" className="ps-card" data-project={project.id}
    data-testid={`card-app-${project.id}`} aria-label={`${action}: ${title}`}
    onClick={() => onOpenDemo(project.id)}
    onPointerEnter={event => { if (event.pointerType === 'mouse') preloadDemo(project.id); }}
    onFocus={event => { if (event.currentTarget.matches(':focus-visible')) preloadDemo(project.id); }}>
    <span className="ps-copy">
      <strong className="ps-title">{title}</strong>
      <span className="ps-description">{project.description[index]}</span>
      <span className="ps-detail"><DetailIcon size={14} strokeWidth={1.6} aria-hidden="true" />{project.detail[index]}</span>
    </span>
    <span className="ps-art" aria-hidden="true">
      <img alt="" src={`/showcase/covers/${project.id}.webp?v=2`} decoding="async" loading={first ? 'eager' : 'lazy'} draggable={false} />
    </span>
    <span className="ps-open" aria-hidden="true"><span>{action}</span><ArrowUpRight size={16} /></span>
  </button>;
});

export default memo(function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [category, setCategory] = useState<Category>('all');
  const visible = category === 'all' ? projects : projects.filter(project => project.category === category);
  return <main className="projects-showcase" data-testid="projects-showcase">
    <div className="ps-inner">
      <header className="ps-header">
        <h1>{ru ? 'Витрина' : 'Showcase'} <span className="ps-count" aria-live="polite">{visible.length}</span></h1>
      </header>
      <div className="ps-filters" role="group" aria-label={ru ? 'Направления' : 'Categories'}>
        {filters.map(filter => <button key={filter.id} type="button" aria-pressed={category === filter.id} onClick={() => setCategory(filter.id)}>{ru ? filter.ru : filter.en}</button>)}
      </div>
      <div className="ps-collection" role="group" aria-label={ru ? 'Примеры приложений' : 'Demo apps'}>
        {visible.map((project, index) => <ProjectCard key={project.id} project={project} ru={ru} first={index === 0} onOpenDemo={onOpenDemo} />)}
      </div>
      <button type="button" className="ps-order" onClick={() => onNavigate('constructor')}>{ru ? 'Заказать приложение' : 'Order an app'} <ArrowRight size={18}/></button>
    </div>
  </main>;
});
