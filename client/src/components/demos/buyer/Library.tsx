import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Heart,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns2,
  FolderOpen,
  ImagePlus,
  Link2,
  PencilLine,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Destination } from './Destination';
import { InkHeading, InkJourney, InkArt } from './InkJourney';
import type { MarketCode } from './markets';
import {
  categories,
  categoryName,
  largeImage,
  local,
  samples,
  type Category,
  type Sample,
} from './samples';

export type CatalogState = {
  category: Category | 'all';
  query: string;
  sort: 'curated' | 'az' | 'za';
  saved: boolean;
};
export const allSamples: CatalogState = {
  category: 'all',
  query: '',
  sort: 'curated',
  saved: false,
};
export type LibraryActions = {
  ru: boolean;
  favorites: string[];
  selection: string[];
  open: (id: string) => void;
  favorite: (id: string) => void;
  select: (id: string) => void;
  compare: () => void;
};

export function SamplePhoto({
  item,
  priority = false,
  sizes = '(max-width: 700px) 46vw, 260px',
  className = '',
  alt = '',
}: {
  item: Sample;
  priority?: boolean;
  sizes?: string;
  className?: string;
  alt?: string;
}) {
  return (
    <img
      className={className}
      src={item.image}
      srcSet={item.image + ' 320w, ' + largeImage(item) + ' 600w'}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  );
}
export function Back({ ru, action }: { ru: boolean; action: () => void }) {
  return (
    <button className="yb-back" type="button" onClick={action}>
      <ArrowLeft size={17} />
      {ru ? 'Назад' : 'Back'}
    </button>
  );
}
export function SectionTitle({
  title,
  action,
  label,
}: {
  title: string;
  action?: () => void;
  label?: string;
}) {
  return (
    <div className="yb-section-title">
      <h2>{title}</h2>
      {action && (
        <button type="button" className="yb-text-button" onClick={action}>
          {label}
          <ArrowUpRight size={17} />
        </button>
      )}
    </div>
  );
}
export function SampleCard({
  item,
  actions,
}: {
  item: Sample;
  actions: LibraryActions;
}) {
  const { ru, open, favorite, favorites, select, selection } = actions;
  const name = local(item.title, ru);
  const saved = favorites.includes(item.id);
  const selected = selection.includes(item.id);
  return (
    <article className="yb-card" data-testid={'buyer-item-' + item.id}>
      <div className="yb-card-frame">
        <button
          type="button"
          className="yb-image-link"
          onClick={() => open(item.id)}
          aria-label={(ru ? 'Открыть ' : 'Open ') + name}
        >
          <SamplePhoto item={item} />
        </button>
        <button
          type="button"
          className="yb-fav"
          aria-label={(ru ? 'Избранное · ' : 'Saved · ') + name}
          aria-pressed={saved}
          onClick={() => favorite(item.id)}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="yb-card-caption">
        <div>
          <small>{categoryName(item.category, ru)}</small>
          <button type="button" onClick={() => open(item.id)}>
            {name}
          </button>
        </div>
        <button
          type="button"
          className="yb-icon yb-compare-icon"
          aria-pressed={selected}
          aria-label={(ru ? 'Сравнить · ' : 'Compare · ') + name}
          onClick={() => select(item.id)}
        >
          {selected ? <Check /> : <Columns2 />}
        </button>
      </div>
    </article>
  );
}
function Feature({ actions }: { actions: LibraryActions }) {
  const { ru, open } = actions;
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const suppress = useRef(false);
  const item = samples[index];
  const subtitle = [
    ru ? 'Кобальтовый рипстоп' : 'Cobalt ripstop',
    ru ? 'Матовый металл' : 'Brushed metal',
    ru ? 'Терракотовая керамика' : 'Terracotta ceramic',
  ][index];
  const next = (step: number) => setIndex((i) => (i + step + 3) % 3);
  return (
    <section
      className={'yb-feature yb-feature--' + item.id}
      aria-label={ru ? 'Выбор бюро' : 'Bureau selection'}
      aria-roledescription={ru ? 'Карусель' : 'Carousel'}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          next(e.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <button
        type="button"
        className="yb-feature-pic"
        onTouchStart={(e) => {
          suppress.current = false;
          touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x,
            dy = e.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            suppress.current = true;
            next(dx < 0 ? 1 : -1);
          }
          touch.current = null;
        }}
        onClick={() => {
          if (suppress.current) {
            suppress.current = false;
            return;
          }
          open(item.id);
        }}
        aria-label={(ru ? 'Открыть ' : 'Open ') + local(item.title, ru)}
      >
        <SamplePhoto item={item} sizes="(max-width: 760px) 95vw, 490px" />
        {index > 0 && (
          <img
            className="yb-feature-detail"
            src={item.gallery?.[0]}
            alt=""
            decoding="async"
          />
        )}
        <span className="yb-picture-label">{ru ? 'Образец' : 'Sample'}</span>
        <span className="yb-picture-open">
          <ArrowUpRight size={21} />
        </span>
      </button>
      <div className="yb-feature-foot">
        <button
          type="button"
          onClick={() => open(item.id)}
          className="yb-feature-caption"
        >
          <strong>{local(item.title, ru)}</strong>
          <span>{subtitle}</span>
        </button>
        <div className="yb-paging">
          <button
            type="button"
            aria-label={ru ? 'Предыдущий образец' : 'Previous sample'}
            onClick={() => next(-1)}
          >
            <ChevronLeft />
          </button>
          <span aria-live="polite">
            {String(index + 1).padStart(2, '0')} / 03
          </span>
          <button
            type="button"
            aria-label={ru ? 'Следующий образец' : 'Next sample'}
            onClick={() => next(1)}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
export function BureauHome({
  actions,
  catalog,
  begin,
  guide,
  market,
  chooseMarket,
  example,
}: {
  actions: LibraryActions;
  catalog: (category?: Category) => void;
  begin: (mode: 'photo' | 'link' | 'any') => void;
  guide: () => void;
  market: MarketCode | '';
  chooseMarket: (value: MarketCode | '') => void;
  example: () => void;
}) {
  const { ru } = actions;
  return (
    <>
      <InkJourney ru={ru}>
        <section
          className="yb-request-entries"
          aria-label={ru ? 'Начать запрос' : 'Start a request'}
        >
          <h2>{ru ? 'Начать запрос' : 'Start a request'}</h2>
          <div className="yb-start-actions">
            <button type="button" onClick={() => begin('photo')}>
              <ImagePlus size={19} />
              {ru ? 'По фото' : 'Use a photo'}
            </button>
            <button type="button" onClick={() => begin('link')}>
              <Link2 size={19} />
              {ru ? 'По ссылке' : 'Use a link'}
            </button>
            <button type="button" onClick={() => begin('any')}>
              <PencilLine size={18} />
              {ru ? 'Описать товар' : 'Describe an item'}
            </button>
          </div>
        </section>
        <Destination compact ru={ru} value={market} onChange={chooseMarket} />
      </InkJourney>
      <button
        type="button"
        className="yb-case"
        onClick={example}
        aria-label={
          ru
            ? 'Открыть пример запроса на 30 рюкзаков'
            : 'Open the 30-backpack example'
        }
      >
        <div className="yb-case-image">
          <img
            src="/china-buyer/sourcing/inspection-480.webp"
            srcSet="/china-buyer/sourcing/inspection-480.webp 480w, /china-buyer/sourcing/inspection-1200.webp 1200w"
            sizes="(max-width: 759px) 100vw, 560px"
            fetchPriority="high"
            alt={
              ru
                ? 'Байер проверяет молнию рюкзака перед отправкой партии'
                : 'A buyer checks the zip on a backpack before dispatch'
            }
          />
          <span>{ru ? 'Пример закупки' : 'Example brief'}</span>
        </div>
        <div className="yb-case-caption">
          <div>
            <strong>
              {ru ? '30 рюкзаков для магазина' : '30 backpacks for a shop'}
            </strong>
            <small>
              {ru
                ? 'Проверка образца и расчёт партии'
                : 'Sample inspection and a batch quote'}
            </small>
          </div>
          <i>
            <ArrowUpRight size={21} />
          </i>
        </div>
      </button>
      <section className="yb-section">
        <SectionTitle
          title={ru ? 'Что хотите закупить?' : 'What would you like to source?'}
          action={() => catalog()}
          label={ru ? 'Все образцы' : 'All samples'}
        />
        <div className="yb-sourcing-shelf">
          <Feature actions={actions} />
          <div className="yb-home-samples">
            {samples
              .filter((item) => item.id === 'sneaker' || item.id === 'home')
              .map((item) => (
                <SampleCard key={item.id} item={item} actions={actions} />
              ))}
          </div>
        </div>
      </section>
      <section className="yb-section yb-index">
        <SectionTitle title={ru ? 'Категории' : 'Categories'} />
        <div>
          {categories
            .filter((c) => c !== 'Другое')
            .map((c) => (
              <button key={c} type="button" onClick={() => catalog(c)}>
                <span>{categoryName(c, ru)}</span>
                <small>{samples.filter((s) => s.category === c).length}</small>
                <ArrowRight size={18} />
              </button>
            ))}
        </div>
      </section>
      <button type="button" className="yb-guide-link" onClick={guide}>
        <InkArt name="river" />
        <span>{ru ? 'Как работает байер' : 'How sourcing works'}</span>
        <ArrowUpRight />
      </button>
    </>
  );
}
export function Library({
  actions,
  filter,
  change,
  focusSearch = false,
}: {
  actions: LibraryActions;
  filter: CatalogState;
  change: (f: CatalogState) => void;
  focusSearch?: boolean;
}) {
  const { ru, favorites, selection, compare } = actions;
  const search = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focusSearch) search.current?.focus({ preventScroll: true });
  }, [focusSearch]);
  const q = filter.query.trim().toLocaleLowerCase(ru ? 'ru' : 'en');
  const items = samples.filter(
    (s) =>
      (filter.category === 'all' || s.category === filter.category) &&
      (!filter.saved || favorites.includes(s.id)) &&
      (!q ||
        [
          ...s.title,
          ...s.shape,
          categoryName(s.category, true),
          categoryName(s.category, false),
          ...(s.finish ?? []),
        ].some((x) => x.toLowerCase().includes(q))),
  );
  if (filter.sort !== 'curated')
    items.sort(
      (a, b) =>
        local(a.title, ru).localeCompare(local(b.title, ru), ru ? 'ru' : 'en') *
        (filter.sort === 'az' ? 1 : -1),
    );
  return (
    <section>
      <InkHeading mark="图鉴" title={ru ? 'Образцы' : 'Sample library'}>
        <span className="yb-count">{samples.length}</span>
      </InkHeading>
      <div className="yb-search">
        <Search size={19} />
        <input
          ref={search}
          type="search"
          value={filter.query}
          onChange={(e) => change({ ...filter, query: e.target.value })}
          placeholder={
            ru ? 'Название, материал, форма' : 'Name, material, shape'
          }
          aria-label={ru ? 'Поиск образца' : 'Search samples'}
        />
        {filter.query && (
          <button
            type="button"
            aria-label={ru ? 'Очистить поиск' : 'Clear search'}
            onClick={() => {
              change({ ...filter, query: '' });
              search.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="yb-pills" aria-label={ru ? 'Категории' : 'Categories'}>
        {(['all', ...categories.filter((c) => c !== 'Другое')] as const).map(
          (c) => (
            <button
              type="button"
              key={c}
              aria-pressed={filter.category === c}
              onClick={() => change({ ...filter, category: c })}
            >
              {c === 'all' ? (ru ? 'Все' : 'All') : categoryName(c, ru)}
            </button>
          ),
        )}
      </div>
      <div className="yb-library-tools">
        <button
          type="button"
          aria-pressed={filter.saved}
          onClick={() => change({ ...filter, saved: !filter.saved })}
        >
          <Heart size={16} />
          {ru ? 'Избранное' : 'Saved'}
        </button>
        <label>
          <ArrowDownUp size={15} />
          <select
            aria-label={ru ? 'Сортировка' : 'Sort order'}
            value={filter.sort}
            onChange={(e) =>
              change({
                ...filter,
                sort: e.target.value as CatalogState['sort'],
              })
            }
          >
            <option value="curated">{ru ? 'Выбор бюро' : 'Bureau edit'}</option>
            <option value="az">{ru ? 'От А до Я' : 'A to Z'}</option>
            <option value="za">{ru ? 'От Я до А' : 'Z to A'}</option>
          </select>
        </label>
      </div>
      {selection.length > 0 && (
        <button type="button" className="yb-compare-link" onClick={compare}>
          <Columns2 size={18} />
          {ru ? 'Сравнить образцы' : 'Compare samples'}
          <b>{selection.length} / 3</b>
          <ArrowRight size={17} />
        </button>
      )}
      <div className="yb-grid">
        {items.map((item) => (
          <SampleCard key={item.id} item={item} actions={actions} />
        ))}
      </div>
      {!items.length && (
        <div className="yb-empty">
          <FolderOpen />
          <h2>{ru ? 'Образцов не найдено' : 'No matching samples'}</h2>
          <button
            type="button"
            className="yb-secondary"
            onClick={() => change({ ...allSamples })}
          >
            {ru ? 'Сбросить фильтры' : 'Reset filters'}
          </button>
        </div>
      )}
    </section>
  );
}
