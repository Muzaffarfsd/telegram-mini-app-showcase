import { useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Plus, Ruler } from 'lucide-react';
import type { FurnitureProduct } from './storeCatalog';
import { categoriesEn } from './catalogSearch';
import { scenePoster, stories, type RoomKey } from './roomLibrary';
import './FurnitureHome.css';
import './atelier.css';
type Props = {
  products: readonly FurnitureProduct[];
  ru: boolean;
  plannerAvailable: boolean;
  onOpenProduct: (p: FurnitureProduct, photo?: number) => void;
  onOpenPlanner: (p: FurnitureProduct, scene?: RoomKey) => void;
  onOpenCatalog: (cat?: string) => void;
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
  const t = (ruText: string, en: string) => (ru ? ruText : en);
  const [page, setPage] = useState(0);
  const featured = products.find((p) => p.id === 'abo-b07b78lzqc') || products[0],
    sofa = products[0],
    wood = products.find((p) => p.id === 'abo-b0857jw1b9') || sofa;
  if (!featured)
    return (
      <section className="fhome">
        <h1>{t('Коллекция готовится', 'Collection coming soon')}</h1>
      </section>
    );
  const sections = Array.from(new Set(products.map((p) => p.category)));
  const selections = [
    featured,
    products.find((p) => p.name === 'Sloane'),
    products.find((p) => p.name === 'Martin'),
    products.find((p) => p.name === 'Haraden'),
    products.find((p) => p.name === 'Frankie'),
    products.find((p) => p.name === 'Copper Dome'),
  ].filter((p): p is FurnitureProduct => !!p);
  const cards = [
    ...stories,
    {
      key: 'fixed' as const,
      title: ['Комната в свете', 'A room in light'],
      intention: ['Расставить мебель в большой гостиной', 'Furnish a spacious living room'],
      room: { width: 7.98, depth: 9.1 },
      items: [[sofa.id]],
    },
  ];
  const story = cards[page];
  return (
    <section
      className="fhome atelier-home"
      aria-label={t('Главная мебельного магазина', 'Furniture store home')}
    >
      <header className="atelier-heading">
        <div>
          <span>{t('МЕБЕЛЬ И ИНТЕРЬЕРЫ', 'FURNITURE & INTERIORS')}</span>
          <h1>{t('Вокруг стола', 'Around the table')}</h1>
        </div>
        <button onClick={() => onOpenCatalog()} aria-label={t('Все модели', 'All pieces')}>
          <ArrowUpRight />
        </button>
      </header>
      <div className="atelier-hero">
        <img
          className="fhome-hero-image"
          src={featured.images[2] || featured.images[0]}
          alt={t('Обеденный стол Rivet Ian в интерьере', 'Rivet Ian dining table in an interior')}
          fetchPriority="high"
        />
        <button
          className="atelier-pin"
          aria-label={t('Открыть товар Rivet Ian', 'Open product Rivet Ian')}
          onClick={() => onOpenProduct(featured)}
        >
          <Plus size={18} />
        </button>
        <div className="atelier-credit">
          <b>{featured.name}</b>
          <span>
            {featured.brand} · Ø 107 {t('см', 'cm')}
          </span>
        </div>
      </div>
      <div className="atelier-actions">
        <button onClick={() => onOpenCatalog()}>
          {t('В каталог', 'Explore pieces')} <ArrowRight size={17} />
        </button>
        {plannerAvailable && (
          <button onClick={() => onOpenPlanner(featured, 'dining')}>
            {t('В комнату', 'In your room')} <ArrowUpRight size={17} />
          </button>
        )}
      </div>
      {plannerAvailable && (
        <section className="atelier-section">
          <div className="atelier-section-head">
            <h2>{t('Комнаты', 'Rooms')}</h2>
            <span>
              {page + 1} / {cards.length}
            </span>
          </div>
          <div className="atelier-tabs" role="group" aria-label={t('Выбор комнаты', 'Choose a room')}>
            {cards.map((s, i) => (
              <button key={s.key} aria-pressed={page === i} onClick={() => setPage(i)}>
                {s.title[ru ? 0 : 1]}
              </button>
            ))}
          </div>
          <button
            className="atelier-roomcard"
            onClick={() => onOpenPlanner(products.find((p) => p.id === story.items[0][0]) || sofa, story.key)}
          >
            <img
              loading="lazy"
              src={story.key === 'fixed' ? '/furniture/scenes/fixed.webp' : scenePoster(story.key)}
              alt=""
            />
            <div>
              <span>
                {story.room.width.toLocaleString(ru ? 'ru' : 'en')} ×{' '}
                {story.room.depth.toLocaleString(ru ? 'ru' : 'en')} {t('м', 'm')}
              </span>
              <strong>{story.intention[ru ? 0 : 1]}</strong>
            </div>
            <ArrowUpRight size={23} />
          </button>
        </section>
      )}
      <section className="atelier-section">
        <div className="atelier-section-head">
          <h2>{t('По предметам', 'Shop by piece')}</h2>
          <button onClick={() => onOpenCatalog()}>
            {t('Все модели', 'All pieces')} <ArrowRight size={16} />
          </button>
        </div>
        <div className="atelier-categories">
          {sections.map((c) => {
            const p = products.find((x) => x.category === c)!;
            return (
              <button key={c} onClick={() => onOpenCatalog(c)}>
                <img src={p.images[0]} loading="lazy" alt="" />
                <span>
                  {ru ? c : categoriesEn[c]} <ArrowRight size={14} />
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="atelier-material">
        <button onClick={() => onOpenProduct(wood, Math.min(2, wood.images.length - 1))}>
          <img
            loading="lazy"
            src={wood.images[2] || wood.images[0]}
            alt={t('Плетение сиденья Scarlett крупным планом', 'Scarlett woven seat detail')}
          />
          <div>
            <span>
              {wood.name} · {wood.brand}
            </span>
            <h2>{t('Плетение вблизи', 'The weave, up close')}</h2>
            <ArrowUpRight />
          </div>
        </button>
      </section>
      {plannerAvailable && (
        <section className="atelier-personal">
          <Ruler />
          <h2>{t('Своя комната', 'Your own room')}</h2>
          <p>
            {t(
              'Введите длину стен и проверьте, сколько места останется для прохода.',
              'Enter your wall dimensions and measure the space left to walk through.'
            )}
          </p>
          <button onClick={() => onOpenPlanner(sofa, 'custom')}>
            {t('Открыть планировщик', 'Open room planner')} <ArrowRight size={17} />
          </button>
        </section>
      )}
      <section className="atelier-section">
        <div className="atelier-section-head">
          <h2>{t('В коллекции', 'In the collection')}</h2>
          <span>
            {products.length} {t('предметов', 'pieces')}
          </span>
        </div>
        <div className="fhome-product-grid">
          {selections.map((p) => (
            <div key={p.id}>{renderCard(p)}</div>
          ))}
        </div>
        <button className="fhome-collection-link" onClick={() => onOpenCatalog()}>
          {t('Смотреть все модели', 'Explore all pieces')} <ArrowRight size={18} />
        </button>
      </section>
      <footer className="fhome-footer">
        <span>
          {t(
            'Демонстрационная коллекция. Наличие и стоимость уточняйте у продавца.',
            'Demonstration collection. Ask the seller about availability and pricing.'
          )}
        </span>
      </footer>
    </section>
  );
}
