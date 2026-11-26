import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import type { FurnitureProduct } from './storeCatalog';
import { categoriesEn, typeLabel } from './catalogSearch';
import { scenePoster, stories, type RoomKey } from './roomLibrary';
import './FurnitureHome.css';
import { studioThumbnail, studioSrcSet } from './studioPhotography';

type Props = {
  products: readonly FurnitureProduct[];
  ru: boolean;
  plannerAvailable: boolean;
  onOpenProduct: (p: FurnitureProduct, photo?: number) => void;
  onOpenPlanner: (p: FurnitureProduct, scene?: RoomKey) => void;
  onOpenCatalog: (category?: string) => void;
  renderCard: (p: FurnitureProduct) => ReactNode;
};

export default function FurnitureHome({
  products,
  ru,
  plannerAvailable,
  onOpenProduct,
  onOpenPlanner,
  onOpenCatalog,
  renderCard,
}: Props) {
  const t = (r: string, e: string) => (ru ? r : e);
  const [allCategories, setAllCategories] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const [roomEdges, setRoomEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const strip = rail.current;
    if (!strip) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [plannerAvailable, products.length]);
  const feature = products.find((p) => p.id === 'rivet-adrienne-chair') || products[0];
  if (!feature)
    return (
      <section className="fhome">
        <h1>{t('Коллекция готовится', 'Collection coming soon')}</h1>
      </section>
    );
  const adrienne = feature.id === 'rivet-adrienne-chair';
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const previews = [
    'Диваны',
    'Кресла',
    'Свет',
    'Столы',
    ...categories.filter((c) => !['Диваны', 'Кресла', 'Свет', 'Столы'].includes(c)),
  ].filter((c) => categories.includes(c));
  const coverModels: Record<string, string> = {
    Диваны: 'Frankie',
    Кресла: 'Scutari',
    Свет: 'Copper Dome',
    Столы: 'Bristol',
    Стулья: 'Scarlett',
  };
  const rooms = [
    ...stories.map((scene) => ({
      key: scene.key as RoomKey,
      title: scene.title,
      room: scene.room,
      poster: scenePoster(scene.key),
      product: products.find((p) => p.id === scene.items[0][0]) || feature,
    })),
    {
      key: 'fixed' as const,
      title: ['Комната в свете', 'A room in light'],
      room: { width: 7.98, depth: 9.1 },
      poster: '/furniture/scenes/fixed.webp',
      product: products[0],
    },
  ];
  const selections = ['Ribe', 'Scarlett', 'Martin', 'Haraden']
    .map((name) => products.find((p) => p.name === name))
    .filter((p): p is FurnitureProduct => !!p);
  function updateEdges() {
    const el = rail.current;
    if (el)
      setRoomEdges({
        start: el.scrollLeft <= 2,
        end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
      });
  }
  function scrollRoom(direction: number) {
    const el = rail.current;
    const tile = el?.firstElementChild;
    if (el && tile)
      el.scrollBy({
        left: direction * (tile.getBoundingClientRect().width + 14),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
  }
  return (
    <section className="fhome" aria-label={t('Главная мебельного магазина', 'Furniture store home')}>
      <div className="fhome-cover">
        <img
          className="fhome-hero-image"
          src={(adrienne && feature.images[1]) || feature.images[0]}
          srcSet={studioSrcSet((adrienne && feature.images[1]) || feature.images[0])}
          sizes="(min-width: 680px) 740px, 100vw"
          alt={
            adrienne
              ? t(
                  'Кресло Adrienne в галерее с изогнутой стеной',
                  'Adrienne armchair in a curved plaster gallery'
                )
              : feature.name
          }
          fetchPriority="high"
        />
        <div className="fhome-cover-copy">
          <p>
            {feature.brand}
            <span aria-hidden="true">/</span>
            {adrienne ? t('Поворотное кресло', 'Swivel armchair') : typeLabel(feature.category, ru)}
          </p>
          <h1>{feature.name}</h1>
          <button className="fhome-cover-link" onClick={() => onOpenProduct(feature)}>
            {adrienne ? t('Смотреть кресло', 'View armchair') : t('Смотреть модель', 'View piece')}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <section className="fhome-section fhome-categories">
        <div className="fhome-heading">
          <h2>{t('Каталог', 'Catalogue')}</h2>
          <button onClick={() => onOpenCatalog()}>
            {t('Все модели', 'All pieces')}
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="fhome-category-grid" id="fh-categories">
          {(allCategories ? previews : previews.slice(0, 4)).map((category) => {
            const product =
              products.find((p) => p.category === category && p.name === coverModels[category]) ||
              products.find((p) => p.category === category)!;
            return (
              <button key={category} className="fhome-category" onClick={() => onOpenCatalog(category)}>
                <div>
                  <img
                    src={studioThumbnail(product.images[1] || product.images[0])}
                    alt=""
                    loading="lazy"
                  />
                </div>
                <span>
                  {ru ? category : categoriesEn[category] || category}
                  <ChevronRight size={16} />
                </span>
              </button>
            );
          })}
        </div>
        {previews.length > 4 && (
          <button
            className="fhome-more"
            onClick={() => setAllCategories(!allCategories)}
            aria-expanded={allCategories}
            aria-controls="fh-categories"
          >
            {allCategories
              ? t('Свернуть категории', 'Fewer categories')
              : t('Все категории', 'All categories')}
            <ChevronDown size={16} />
          </button>
        )}
      </section>
      {plannerAvailable && (
        <section className="fhome-section fhome-interiors">
          <div className="fhome-heading">
            <h2>{t('Интерьеры', 'Interiors')}</h2>
            <div className="fhome-rail-nav">
              <button
                aria-label={t('Предыдущий интерьер', 'Previous interior')}
                disabled={roomEdges.start}
                onClick={() => scrollRoom(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label={t('Следующий интерьер', 'Next interior')}
                disabled={roomEdges.end}
                onClick={() => scrollRoom(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="fhome-room-rail" ref={rail} onScroll={updateEdges}>
            {rooms.map((s) => (
              <button className="fhome-room" key={s.key} onClick={() => onOpenPlanner(s.product, s.key)}>
                <img src={s.poster} alt="" loading="lazy" />
                <span>
                  <strong>{s.title[ru ? 0 : 1]}</strong>
                  <small>
                    {[s.room.width, s.room.depth]
                      .map((n) => n.toLocaleString(ru ? 'ru' : 'en'))
                      .join(' × ')}{' '}
                    {t('м', 'm')}
                  </small>
                </span>
              </button>
            ))}
          </div>
          <button
            className="fhome-planner"
            aria-label={t('Открыть планировщик', 'Open room planner')}
            onClick={() => onOpenPlanner(products[0], 'custom')}
          >
            <Ruler size={23} strokeWidth={1.45} />
            <span>
              <strong>{t('Открыть планировщик', 'Open room planner')}</strong>
              <small>
                {t(
                  'Задайте размеры и расставьте мебель',
                  'Set the dimensions and arrange your furniture'
                )}
              </small>
            </span>
            <ArrowUpRight size={18} />
          </button>
        </section>
      )}
      {selections.length > 0 && (
        <section className="fhome-section">
          <div className="fhome-heading">
            <h2>{t('Из коллекции', 'Selected pieces')}</h2>
            <button onClick={() => onOpenCatalog()}>
              {t('В каталог', 'Explore pieces')}
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="fhome-product-grid">
            {selections.map((p) => (
              <div key={p.id}>{renderCard(p)}</div>
            ))}
          </div>
        </section>
      )}
      <p className="fhome-footer">
        {t(
          'Демонстрационная коллекция. Стоимость и наличие уточняйте у продавца.',
          'Demonstration collection. Contact the seller for pricing and availability.'
        )}
      </p>
    </section>
  );
}
