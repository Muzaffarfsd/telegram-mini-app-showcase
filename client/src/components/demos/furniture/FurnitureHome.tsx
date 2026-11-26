import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Ruler, Search } from 'lucide-react';
import type { FurnitureProduct } from './storeCatalog';
import { homeCollections } from './homeCollections';
import { scenePoster, stories, type RoomKey } from './roomLibrary';
import { studioThumbnail, studioSrcSet } from './studioPhotography';
import './FurnitureHome.css';

type Props = {
  products: readonly FurnitureProduct[];
  ru: boolean;
  plannerAvailable: boolean;
  category: string;
  onCategoryChange: (category: string) => void;
  onOpenProduct: (p: FurnitureProduct, photo?: number) => void;
  onOpenPlanner: (p: FurnitureProduct, scene?: RoomKey) => void;
  onOpenCatalog: (category?: string, query?: string) => void;
  renderCard: (p: FurnitureProduct, language: 'ru' | 'en') => ReactNode;
};

const newPieceIds = [
  'abo-b07b78lzqc',
  'abo-b07mkqt7v4',
  'abo-b07tr659g8',
  'abo-b0825dnrxl',
  'abo-b0857jw1b9',
  'abo-b07jxxr83f',
];

export default function FurnitureHome({
  products,
  ru,
  plannerAvailable,
  category,
  onCategoryChange,
  onOpenProduct,
  onOpenPlanner,
  onOpenCatalog,
  renderCard,
}: Props) {
  const t = (r: string, e: string) => (ru ? r : e);
  const groups = useMemo(() => homeCollections(products), [products]);
  const index = Math.max(
    0,
    groups.findIndex((group) => group.category === category),
  );
  const current = groups[index];
  const start = useRef(index);
  const [viewport, carousel] = useEmblaCarousel({
    align: 'start',
    loop: groups.length > 1,
    startIndex: start.current,
    duration: 24,
    breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } },
  });
  const cover = useRef<HTMLElement>(null);
  const [search, setSearch] = useState('');
  const rail = useRef<HTMLDivElement>(null);
  const [roomEdges, setRoomEdges] = useState({ start: true, end: false });

  useEffect(() => {
    if (!carousel) return;
    const select = () => {
      const selected = groups[carousel.selectedScrollSnap()];
      if (selected) onCategoryChange(selected.category);
    };
    const settle = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        carousel.scrollTo(carousel.selectedScrollSnap(), true);
    };
    carousel.on('select', select).on('pointerUp', settle);
    return () => {
      carousel.off('select', select).off('pointerUp', settle);
    };
  }, [carousel, groups, onCategoryChange]);

  useEffect(() => {
    if (carousel && carousel.selectedScrollSnap() !== index) carousel.scrollTo(index, true);
  }, [index, carousel]);

  useEffect(() => {
    if (!carousel || groups.length < 2) return;
    const node = carousel.rootNode();
    let distance = 0,
      lastEvent = 0,
      hasStepped = false;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
      if (!delta || (!event.shiftKey && Math.abs(delta) <= Math.abs(event.deltaY))) return;
      event.preventDefault();
      if (event.timeStamp - lastEvent > 160) {
        distance = 0;
        hasStepped = false;
      }
      lastEvent = event.timeStamp;
      distance += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientWidth : 1);
      if (!hasStepped && Math.abs(distance) >= 32) {
        hasStepped = true;
        if (distance > 0) carousel.scrollNext();
        else carousel.scrollPrev();
      }
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [carousel, groups.length]);

  useEffect(() => {
    const strip = rail.current;
    if (!strip) return;
    const observer = new ResizeObserver(updateEdges);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [plannerAvailable, products.length]);

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
  function showCategory(next: number) {
    carousel?.scrollTo(next, true);
    onCategoryChange(groups[next].category);
    cover.current?.focus({ preventScroll: true });
    document.getElementById('root')?.scrollTo({ top: 0, behavior: 'instant' });
  }
  if (!current)
    return (
      <section className="fhome">
        <h1>{t('Коллекция готовится', 'Collection coming soon')}</h1>
      </section>
    );

  const newPieces = newPieceIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is FurnitureProduct => !!p);
  const light = products.find((p) => p.id === 'abo-b07374m9zw' && p.images[1]);
  const rooms = [
    ...stories.map((scene) => ({
      key: scene.key as RoomKey,
      title: scene.title,
      room: scene.room,
      poster: scenePoster(scene.key),
      product: products.find((p) => p.id === scene.items[0][0]) || products[0],
    })),
    {
      key: 'fixed' as const,
      title: ['Комната в свете', 'A room in light'],
      room: { width: 7.98, depth: 9.1 },
      poster: '/furniture/scenes/fixed.webp',
      product: products[0],
    },
  ];
  const hero = current.hero;
  const shelf =
    current.pieces.length > 2 ? current.pieces.filter((p) => p.id !== hero.id) : current.pieces;
  return (
    <section className="fhome" aria-label={t('Главная мебельного магазина', 'Furniture store home')}>
      <section
        className="fhome-cover"
        ref={cover}
        tabIndex={-1}
        lang="en"
        aria-label="Furniture collections"
        aria-roledescription="carousel"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            if (event.key === 'ArrowRight') carousel?.scrollNext();
            else carousel?.scrollPrev();
          }
        }}
      >
        <div className="fhome-viewport" ref={viewport}>
          <div className="fhome-track" data-layout-transform="">
            {groups.map((group, i) => {
              const selected = i === index;
              const custom = group.hero.id === 'abo-b07p5lmn2c';
              const Title = selected ? 'h1' : 'span';
              return (
                <div
                  className="fhome-slide"
                  key={group.category}
                  data-shape={group.shape}
                  data-layout-transform=""
                  data-category={group.category}
                  aria-hidden={!selected}
                >
                  <Title className="fhome-title" data-long={group.title.length > 7}>
                    {group.title}
                  </Title>
                  <button
                    type="button"
                    className="fhome-cover-link"
                    tabIndex={selected ? 0 : -1}
                    aria-label={'Open ' + group.hero.name}
                    onClick={() => onOpenProduct(group.hero)}
                  >
                    <img
                      className="fhome-hero-image"
                      alt=""
                      draggable={false}
                      src={custom ? '/furniture/home/sloane-1440.webp' : group.hero.images[0]}
                      srcSet={
                        custom
                          ? '/furniture/home/sloane-640.webp 640w, /furniture/home/sloane-1440.webp 1440w'
                          : studioSrcSet(group.hero.images[0])
                      }
                      sizes="(min-width: 990px) 760px, (min-width: 650px) 76vw, 120vw"
                      loading={selected ? 'eager' : 'lazy'}
                      fetchPriority={selected ? 'high' : 'auto'}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="fhome-caption">
          <button
            className="fhome-caption-link"
            onClick={() => onOpenProduct(hero)}
            aria-label={'Model details for ' + hero.name}
          >
            <strong>
              {hero.name} <ArrowUpRight size={14} aria-hidden="true" />
            </strong>
            <span>
              {hero.brand}
              {hero.dimensionsM && <> · {Math.round(hero.dimensionsM[0] * 100)} cm</>}
            </span>
          </button>
          {groups.length > 1 && (
            <div className="fhome-stepper" role="group" aria-label="Browse categories">
              <button
                type="button"
                onClick={() => carousel?.scrollPrev()}
                aria-label="Previous category"
              >
                <ChevronLeft size={18} />
              </button>
              <span aria-hidden="true">
                {String(index + 1).padStart(2, '0')} <i>/</i> {String(groups.length).padStart(2, '0')}
              </span>
              <button type="button" onClick={() => carousel?.scrollNext()} aria-label="Next category">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          <span className="fs-sr" role="status">
            {current.title} · {index + 1} / {groups.length}
          </span>
        </div>
      </section>
      <section className="fhome-section fhome-picks" lang="en" aria-label={current.selection}>
        <div className="fhome-heading">
          <h2>{current.selection}</h2>
          <button className="fhome-text-link" onClick={() => onOpenCatalog(current.category)}>
            View all <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="fhome-piece-rail" key={current.category}>
          {shelf.map((p) => (
            <div key={p.id}>{renderCard(p, 'en')}</div>
          ))}
        </div>
      </section>
      <section className="fhome-section fhome-discover" aria-labelledby="fhome-discover-title">
        <form
          className="fhome-search"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            onOpenCatalog('Все', search.trim());
          }}
        >
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            enterKeyHint="search"
            aria-label={t('Поиск мебели', 'Search furniture')}
            placeholder={t('Найти мебель', 'Search furniture')}
          />
          <button aria-label={t('Показать результаты поиска', 'Show search results')} type="submit">
            <ArrowRight size={18} />
          </button>
        </form>
        <div className="fhome-heading">
          <h2 id="fhome-discover-title">{t('Категории', 'Explore')}</h2>
          <button className="fhome-text-link" onClick={() => onOpenCatalog()}>
            {t('Все модели', 'All pieces')} <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="fhome-category-strip" lang="en">
          {groups.map((group, i) => (
            <button
              type="button"
              className="fhome-category"
              key={group.category}
              aria-pressed={i === index}
              onClick={() => showCategory(i)}
            >
              <img src={studioThumbnail(group.hero.images[0])} loading="lazy" alt="" />
              <span>{group.title}</span>
            </button>
          ))}
        </div>
      </section>
      {light && (
        <button
          type="button"
          className="fhome-light-story"
          onClick={() => onOpenCatalog(light.category)}
        >
          <img
            src={light.images[1]}
            srcSet={studioSrcSet(light.images[1])}
            sizes="(min-width: 1000px) 720px, 100vw"
            loading="lazy"
            alt=""
          />
          <span className="fhome-light-copy">
            <strong>
              {t('Свет', 'Light')}
              <br />
              {t('над столом', 'over the table')}
            </strong>
            <span>
              {t('Смотреть свет', 'Explore lighting')} <ArrowRight size={16} />
            </span>
          </span>
        </button>
      )}
      {newPieces.length > 0 && (
        <section className="fhome-section fhome-arrivals">
          <div className="fhome-heading">
            <h2>{t('Новинки', 'New arrivals')}</h2>
            <button className="fhome-text-link" onClick={() => onOpenCatalog()}>
              {t('В каталог', 'Browse all')} <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="fhome-piece-rail">
            {newPieces.map((p) => (
              <div key={p.id}>{renderCard(p, ru ? 'ru' : 'en')}</div>
            ))}
          </div>
        </section>
      )}
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
                  'Set the dimensions and arrange your furniture',
                )}
              </small>
            </span>
            <ArrowUpRight size={18} />
          </button>
        </section>
      )}
      <p className="fhome-footer">
        {t(
          'Демонстрационная коллекция. Стоимость и наличие уточняйте у продавца.',
          'Demonstration collection. Contact the seller for pricing and availability.',
        )}
      </p>
    </section>
  );
}
