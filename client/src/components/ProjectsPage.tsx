import { memo, useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Bookmark } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { hintRoute } from '../lib/routeModules';
import { ShowcaseArtwork } from './ShowcaseArtwork';
import { showcaseActions } from '../data/showcaseActions';
import { navigate } from '../hooks/useRouting';
import { ProjectStory } from './ProjectStory';
import { useFavoritesStore } from '../stores/favoritesStore';
import './ProjectsShowcase.css';
import './CategorySegments.css';

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
  id: keyof typeof showcaseActions;
  category: Exclude<Category, 'all'>;
  title: [string, string];
  description: [string, string];
}

const projects: Project[] = [
  { id: 'muraka-fashion', category: 'shops', title: ['Магазин одежды', 'Clothing store'],
    description: ['Покупатель выбирает вещь и размер. Вы получаете готовый заказ.', 'Customers choose a piece and size. You receive the order.'] },
  { id: 'takt-coffee', category: 'shops', title: ['Кофейня', 'Coffee bar'],
    description: ['Выберите кофе или лимонад, настройте рецепт и закажите самовывоз.', 'Choose a coffee or lemonade, customize the recipe and order for pickup.'] },
  { id: 'women-fashion', category: 'shops', title: ['Женская одежда', 'Womenswear'],
    description: ['От готового образа — к вещам из одной коллекции.', 'Shop a complete look, then explore matching pieces.'] },
  { id: 'nike-sneakers', category: 'shops', title: ['Магазин кроссовок', 'Sneaker store'],
    description: ['Модель и размер пары сразу попадают в заказ.', 'Every order includes the exact pair and size.'] },
  { id: 'apple-store', category: 'shops', title: ['Магазин техники Apple', 'Apple device store'],
    description: ['Покупатель подбирает iPhone по цвету и объёму памяти.', 'Choose an iPhone, then pick a finish and storage size.'] },
  { id: 'furniture-studio', category: 'shops', title: ['Мебельный салон', 'Furniture showroom'],
    description: ['Покупатель выбирает мебель и рассматривает её в интерьере.', 'Customers browse furniture and view it in a room.'] },
  { id: 'flower-store', category: 'shops', title: ['Магазин цветов', 'Flower shop'],
    description: ['Клиент выбирает букет. Флорист видит композицию и размер.', 'Choose a bouquet and size. The florist sees both.'] },
  { id: 'lumi-studio', category: 'services', title: ['Студия красоты', 'Beauty studio'],
    description: ['Услуга, мастер и свободное время в одной записи.', 'Choose a treatment, stylist and time in one booking.'] },
  { id: 'opt-market', category: 'b2b', title: ['Оптовый магазин', 'Wholesale store'],
    description: ['Партнёр заказывает коробками и видит сумму закупки.', 'Order by the case and see the wholesale total.'] },
  { id: 'jewelry-store', category: 'shops', title: ['Магазин украшений', 'Jewelry store'],
    description: ['Рассмотреть детали украшения и заказать его из каталога.', 'Explore the details of a piece and order it from the catalog.'] },
  { id: 'medical-center', category: 'services', title: ['Медицинский центр', 'Medical center'],
    description: ['Пациент выбирает врача и время приёма.', 'Find a specialist and choose an appointment time.'] },
  { id: 'china-buyer', category: 'b2b', title: ['Байер из Китая', 'China sourcing'],
    description: ['Клиент передаёт байеру запрос и сравнивает стоимость закупки с доставкой в свой город.', 'Send a sourcing brief to your buyer and compare offers including delivery to your city.'] },
  { id: 'skincare-aura', category: 'shops', title: ['Магазин косметики', 'Skincare store'],
    description: ['Короткий тест ведёт к подходящим средствам ухода.', 'A short quiz leads shoppers to suitable skincare.'] },
];

const ProjectCard = memo(function ProjectCard({ project, ru, index, saved, onSave, onOpenDemo, onOpenStory }: {
  project: Project; ru: boolean; index: number; onOpenDemo: ProjectsPageProps['onOpenDemo'];
  saved: boolean; onSave: (id: string) => void; onOpenStory: (id: string) => void;
}) {
  const languageIndex = ru ? 0 : 1;
  const title = project.title[languageIndex];
  const hint = () => hintRoute(`/demos/${project.id}/app`);
  const action = showcaseActions[project.id][languageIndex];
  return <li className="ps-item"><button type="button" className="ps-card" data-project={project.id}
    data-testid={`card-app-${project.id}`} aria-label={`${action}: ${title}`}
    onClick={() => onOpenDemo(project.id)}
    onPointerEnter={event => { if (event.pointerType === 'mouse') hint(); }}
    onFocus={event => { if (event.currentTarget.matches(':focus-visible')) hint(); }}>
    <span className="ps-copy">
      <strong className="ps-title">{title}</strong>
      <span className="ps-description">{project.description[languageIndex]}</span>
    </span>
    <span className="ps-artwork-layer" aria-hidden="true">
      <ShowcaseArtwork id={project.id} index={index} ru={ru} />
    </span>
    <span className="ps-card-footer" aria-hidden="true"><span className="ps-open">{action}<ArrowUpRight size={16}/></span></span>
  </button>
    <button type="button" className="ps-story-link" data-testid={`story-${project.id}`}
      aria-label={`${ru ? 'О проекте' : 'About project'} · ${title}`}
      onClick={() => onOpenStory(project.id)}>{ru ? 'О проекте' : 'About'} <ArrowRight size={14}/></button>
    <button type="button" className="ps-save" data-testid={`save-${project.id}`}
      aria-label={`${ru ? 'Сохранить' : 'Save'} · ${title}`} aria-pressed={saved}
      onClick={() => onSave(project.id)}><Bookmark size={19} fill={saved ? 'currentColor' : 'none'}/></button>
  </li>;
});

export default memo(function ProjectsPage({ onNavigate, onOpenDemo }: ProjectsPageProps) {
  const { language } = useLanguage();
  const ru = language === 'ru';
  const [category, setCategory] = useState<Category>('all');
  const [savedOnly, setSavedOnly] = useState(false);
  const favorites = useFavoritesStore(state => state.favorites);
  const initialize = useFavoritesStore(state => state.initialize);
  const toggle = useFavoritesStore(state => state.toggle);
  useEffect(() => { void initialize(); }, [initialize]);
  const savedProjects = projects.filter(project => favorites.includes(project.id));
  const visible = savedOnly ? savedProjects : category === 'all' ? projects : projects.filter(project => project.category === category);
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  const pendingTap = useRef(0);
  const listScroll = useRef(0);
  const openedFromList = useRef(false);
  const getStoryId = () => {
    const [path, query = ''] = window.location.hash.slice(1).split('?');
    const id = path === '/projects' ? new URLSearchParams(query).get('project') : null;
    return projects.some(project => project.id === id) ? id : null;
  };
  const [storyId, setStoryId] = useState<string | null>(getStoryId);
  useEffect(() => {
    const updateStory = (event: HashChangeEvent) => {
      const old = new URL(event.oldURL).hash;
      const next = getStoryId();
      setStoryId(next);
      if (old.startsWith('#/projects?') && old.includes('project=') && window.location.hash === '#/projects') {
        requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById('root')?.scrollTo({ top: listScroll.current, behavior: 'instant' })));
        openedFromList.current = false;
      }
    };
    window.addEventListener('hashchange', updateStory);
    return () => window.removeEventListener('hashchange', updateStory);
  }, []);
  useEffect(() => () => cancelAnimationFrame(pendingTap.current), []);
  if (storyId) return <ProjectStory id={storyId} ru={ru}
    onBack={() => openedFromList.current ? window.history.back() : navigate('/projects')}
    onOpenProject={() => { openedFromList.current = false; onOpenDemo(storyId); }}
    onOrder={() => onNavigate(`constructor?project=${encodeURIComponent(storyId)}`)} />;
  return <main className="projects-showcase" data-testid="projects-showcase">
    <div className="ps-inner projects-page-frame">
      <header className="ps-header">
        <h1>{ru ? 'Витрина' : 'Showcase'}</h1>
        <button type="button" className="ps-library" data-testid="showcase-saved" aria-pressed={savedOnly} onClick={() => setSavedOnly(value => !value)}>
          <Bookmark size={16} fill={savedOnly ? 'currentColor' : 'none'}/>{ru ? 'Подборка' : 'Saved'}<span>{savedProjects.length}</span>
        </button>
      </header>
      <p className="ps-intro projects-intro-slot">{ru ? 'Выберите проект и пройдите путь своего клиента.' : 'Choose a project and try it as a customer.'}</p>
      <div className="ps-filters category-segments" role="group" aria-label={ru ? 'Направления' : 'Categories'}>
        {filters.map(filter => <button key={filter.id} type="button" aria-pressed={!savedOnly && category === filter.id} onClick={() => { setSavedOnly(false); setCategory(filter.id); }}>{ru ? filter.ru : filter.en}{filter.id === 'all' && <span>{projects.length}</span>}</button>)}
      </div>
      {savedOnly && <h2 className="ps-section-title">{ru ? 'Ваша подборка' : 'Your shortlist'}</h2>}
      <ul className="ps-collection" aria-label={ru ? 'Проекты' : 'Projects'}>
        {visible.map((project, index) => <ProjectCard key={project.id} project={project} ru={ru} index={index}
          saved={favorites.includes(project.id)} onSave={toggle} onOpenDemo={onOpenDemo} onOpenStory={id => {
            listScroll.current = document.getElementById('root')?.scrollTop ?? 0;
            openedFromList.current = true;
            navigate(`/projects?project=${encodeURIComponent(id)}`);
          }} />)}
      </ul>
      {savedOnly && !visible.length && <div className="ps-empty">
        <Bookmark size={24}/><p>{ru ? 'Нажмите на закладку у понравившегося проекта. Здесь можно будет вернуться к нему позже.' : 'Tap the bookmark on a project to keep it here for later.'}</p>
        <button type="button" onClick={() => { setSavedOnly(false); setCategory('all'); }}>{ru ? 'Ко всем проектам' : 'Browse all projects'} <ArrowRight size={16}/></button>
      </div>}
      <div className="ps-brief">
      <h2>{ru ? 'Соберите своё приложение' : 'Build your own app'}</h2>
      <p>{ru ? 'Выберите направление и функции, чтобы узнать стоимость проекта.' : 'Choose your business type and features to get a project estimate.'}</p>
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
    </div>
  </main>;
});
