import { memo, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { hintRoute } from '../lib/routeModules';
import { ShowcaseArtwork } from './ShowcaseArtwork';
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
}

const projects: Project[] = [
  { id: 'muraka-fashion', category: 'shops', title: ['Магазин одежды', 'Clothing store'],
    description: ['Каталог ваших коллекций с выбором размера и заказом в Telegram.', 'A catalog for your collections with size selection and ordering in Telegram.'] },
  { id: 'women-fashion', category: 'shops', title: ['Женская одежда', 'Womenswear'],
    description: ['Показывайте готовые образы и продавайте вещи из одной коллекции вместе.', 'Show complete looks and sell matching pieces from the same collection.'] },
  { id: 'nike-sneakers', category: 'shops', title: ['Магазин кроссовок', 'Sneaker store'],
    description: ['Принимайте заказы на конкретную пару и размер без уточнений в чате.', 'Get the exact model and size in each order, without a follow-up message.'] },
  { id: 'apple-store', category: 'shops', title: ['Магазин техники Apple', 'Apple device store'],
    description: ['Заказы на iPhone сразу с нужным цветом и объёмом памяти.', 'Take iPhone orders with the customer’s choice of color and storage.'] },
  { id: 'flower-store', category: 'shops', title: ['Магазин цветов', 'Flower shop'],
    description: ['В заказе для флориста уже указаны композиция и размер букета.', 'Each order tells your florist which arrangement and bouquet size to prepare.'] },
  { id: 'lumi-studio', category: 'services', title: ['Студия красоты', 'Beauty studio'],
    description: ['Онлайн-запись в студию. Клиенты сами выбирают услугу, мастера и время.', 'Let clients book a treatment, pick their stylist and choose a time.'] },
  { id: 'opt-market', category: 'b2b', title: ['Оптовый магазин', 'Wholesale store'],
    description: ['Партнёры заказывают товар коробками и сразу видят сумму закупки.', 'Wholesale buyers order by the case and see the purchase total.'] },
  { id: 'jewelry-store', category: 'shops', title: ['Магазин украшений', 'Jewelry store'],
    description: ['Показывайте украшения крупным планом и принимайте заказы из каталога.', 'Show each piece in detail and take orders directly from your catalog.'] },
  { id: 'medical-center', category: 'services', title: ['Медицинский центр', 'Medical center'],
    description: ['Запись в клинику через Telegram. Пациент выбирает специалиста и время.', 'Let patients find a specialist and book a visit through Telegram.'] },
  { id: 'china-buyer', category: 'b2b', title: ['Байер из Китая', 'China sourcing'],
    description: ['Собирайте заявки на поиск и выкуп товара в одном приложении.', 'Collect product sourcing and purchasing requests in one app.'] },
  { id: 'skincare-aura', category: 'shops', title: ['Магазин косметики', 'Skincare store'],
    description: ['Помогите клиентам подобрать уход. Из теста они переходят к средствам в каталоге.', 'Guide customers from a skincare quiz to relevant products in your catalog.'] },
];

const ProjectCard = memo(function ProjectCard({ project, ru, first, onOpenDemo }: {
  project: Project; ru: boolean; first: boolean; onOpenDemo: ProjectsPageProps['onOpenDemo'];
}) {
  const index = ru ? 0 : 1;
  const title = project.title[index];
  const hint = () => hintRoute(`/demos/${project.id}/app`);
  const action = ru ? 'Открыть демо' : 'Open demo';
  return <button type="button" className="ps-card" data-project={project.id}
    data-testid={`card-app-${project.id}`} aria-label={`${action}: ${title}`}
    onClick={() => onOpenDemo(project.id)}
    onPointerEnter={event => { if (event.pointerType === 'mouse') hint(); }}
    onFocus={event => { if (event.currentTarget.matches(':focus-visible')) hint(); }}>
    <span className="ps-copy">
      <strong className="ps-title">{title}</strong>
      <span className="ps-description">{project.description[index]}</span>
    </span>
    <span className="ps-artwork-layer" aria-hidden="true">
      <ShowcaseArtwork id={project.id} first={first} />
    </span>
    <span className="ps-open" aria-hidden="true"><span>{action}</span><ArrowUpRight size={16} /></span>
  </button>;
});

export default memo(function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [category, setCategory] = useState<Category>('all');
  const visible = category === 'all' ? projects : projects.filter(project => project.category === category);
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  const pendingTap = useRef(0);
  useEffect(() => () => cancelAnimationFrame(pendingTap.current), []);
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
      <button type="button" className="ps-order"
        onPointerDown={event => {
          touch.current = event.pointerType === 'touch' && event.isPrimary
            ? { id: event.pointerId, x: event.clientX, y: event.clientY } : null;
        }}
        onPointerCancel={() => { touch.current = null; }}
        onPointerUp={event => {
          const start = touch.current;
          touch.current = null;
          if (!start || start.id !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) return;
          const button = event.currentTarget;
          if (!button.contains(document.elementFromPoint(event.clientX, event.clientY))) return;
          // Some WebViews deliver the tap's pointerup but swallow click after a fling.
          // Give the native click first chance. Drags send pointercancel.
          pendingTap.current = requestAnimationFrame(() => { if (button.getClientRects().length) button.click(); });
        }}
        onClick={() => {
          cancelAnimationFrame(pendingTap.current);
          onNavigate('constructor');
        }}
      >{ru ? 'Заказать приложение' : 'Order an app'} <ArrowRight size={18}/></button>
    </div>
  </main>;
});
