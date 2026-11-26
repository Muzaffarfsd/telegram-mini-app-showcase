import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  MapPin,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  art,
  classic,
  drinkById,
  money,
  price,
  say,
  specials,
  type DrinkId,
  type Locale,
  type Recipe,
} from './menu';
import { barFor } from './orders';

export function Cup({
  id,
  large = false,
  eager = false,
  className = '',
}: {
  id: string;
  large?: boolean;
  eager?: boolean;
  className?: string;
}) {
  return (
    <img
      className={'tk-cup ' + className}
      data-cup={id}
      src={art(id, large)}
      srcSet={large ? art(id) + ' 320w, ' + art(id, true) + ' 800w' : undefined}
      sizes={large ? '(min-width: 760px) 430px, 86vw' : undefined}
      width="320"
      height="465"
      alt=""
      decoding="async"
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager && large ? 'high' : 'auto'}
      draggable={false}
    />
  );
}
export function Sheet({
  title,
  lang,
  close,
  children,
}: {
  title: string;
  lang: Locale;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
    return () => {
      if (el?.open) el.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="tk-sheet"
      aria-labelledby="tk-sheet-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="tk-sheet-surface">
        <div className="tk-sheet-head">
          <h2 id="tk-sheet-title">{title}</h2>
          <button
            className="tk-icon"
            aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export type Filter = 'all' | 'milk' | 'black' | 'ice';
const filters = [
  { id: 'all', name: ['Все напитки', 'All drinks'] },
  { id: 'milk', name: ['С молоком', 'Milk coffee'] },
  { id: 'black', name: ['Чёрный', 'Black coffee'] },
  { id: 'ice', name: ['Со льдом', 'Iced coffee'] },
] as const;
const menuOrder: DrinkId[] = [
  'americano',
  'iced-latte',
  'latte',
  'mocha',
  'flat-white',
  'espresso',
  'cappuccino',
];
interface MenuProps {
  lang: Locale;
  bar: string;
  openBar: () => void;
  saved: () => void;
  build: (r: Recipe) => void;
  filter: Filter;
  setFilter: (f: Filter) => void;
  filtersOpen: boolean;
  openFilters: () => void;
  close: () => void;
  slide: number;
  setSlide: (n: number) => void;
}
export function MenuView({
  lang,
  bar,
  openBar,
  saved,
  build,
  filter,
  setFilter,
  filtersOpen,
  openFilters,
  close,
  slide,
  setSlide,
}: MenuProps) {
  const ru = lang === 'ru';
  const rail = useRef<HTMLDivElement>(null);
  const initial = useRef(slide);
  useLayoutEffect(() => {
    const el = rail.current;
    const child = el?.children[initial.current] as HTMLElement | undefined;
    if (el && child) el.scrollLeft = child.offsetLeft;
  }, []);
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let frame = 0;
    function update() {
      if (!el) return;
      const first = el.children[0] as HTMLElement,
        second = el.children[1] as HTMLElement;
      if (second && first)
        setSlide(
          Math.min(
            specials.length - 1,
            Math.round(el.scrollLeft / (second.offsetLeft - first.offsetLeft)),
          ),
        );
    }
    function scroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    el.addEventListener('scroll', scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', scroll);
    };
  }, [setSlide]);
  const filtered = menuOrder
    .map((id) => drinkById[id])
    .filter(
      (d) =>
        filter === 'all' ||
        (filter === 'ice' ? d.iced : filter === 'milk' ? d.milk : !d.milk),
    );
  return (
    <>
      <section className="tk-daily">
        <h1>{ru ? 'Кофе на сегодня' : 'Your daily coffee'}</h1>
        <p>
          {ru
            ? 'Выберите чашку и соберите свой рецепт.'
            : 'Pick a cup and make the recipe yours.'}
        </p>
        <div
          className="tk-rail"
          ref={rail}
          data-first={slide}
          tabIndex={0}
          role="region"
          aria-label={ru ? 'Рецепты бариста' : 'Barista picks'}
        >
          {specials.map((s, i) => {
            const d = drinkById[s.recipe.drink];
            return (
              <button
                key={d.id}
                className="tk-pick"
                onClick={() => build(s.recipe)}
                aria-label={
                  (ru ? 'Собрать ' : 'Build ') +
                  say(d.name, lang) +
                  ' · ' +
                  money(price(s.recipe), lang)
                }
              >
                <span className="tk-product-image">
                  <Cup id={d.id} eager={i < 3} />
                  <Flame
                    aria-hidden="true"
                    size={17}
                    className="tk-flame"
                    strokeWidth={1.5}
                    fill="currentColor"
                  />
                </span>
                <span className="tk-product-copy">
                  <strong>{say(d.name, lang)}</strong>
                  <b>{money(price(s.recipe), lang)}</b>
                </span>
              </button>
            );
          })}
        </div>
      </section>
      <section className="tk-catalogue">
        <div className="tk-menu-heading">
          <h2>{ru ? 'Кофейная карта' : 'The coffee menu'}</h2>
          <button
            className="tk-filter-trigger"
            aria-label={ru ? 'Фильтр напитков' : 'Filter drinks'}
            aria-haspopup="dialog"
            onClick={openFilters}
          >
            {filter !== 'all' && (
              <span>
                {say(filters.find((f) => f.id === filter)!.name, lang)}
              </span>
            )}
            <SlidersHorizontal size={17} />
          </button>
        </div>
        <div className="tk-grid">
          {filtered.map((d, i) => (
            <button
              className="tk-card"
              key={d.id}
              data-drink={d.id}
              onClick={() => build(classic(d.id))}
            >
              <span className="tk-product-image">
                <Cup id={d.id} eager={i < 2} />
              </span>
              <span className="tk-product-copy">
                <strong>{say(d.name, lang)}</strong>
                <b>{money(d.price, lang)}</b>
              </span>
            </button>
          ))}
        </div>
      </section>
      <footer className="tk-menu-footer">
        <button onClick={openBar}>
          <MapPin size={17} />
          <span>
            {say(barFor(bar).name, lang)} · {ru ? 'Бишкек' : 'Bishkek'}
          </span>
          <ChevronDown size={15} />
        </button>
        <button onClick={saved}>
          <Bookmark size={17} />
          <span>{ru ? 'Мои рецепты' : 'My recipes'}</span>
          <ChevronRight size={15} />
        </button>
      </footer>
      {filtersOpen && (
        <Sheet
          lang={lang}
          title={ru ? 'Кофейная карта' : 'Coffee menu'}
          close={close}
        >
          <div className="tk-choice-list">
            {filters.map((f) => (
              <button
                key={f.id}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                <span>{say(f.name, lang)}</span>
                {filter === f.id && <Check size={17} />}
              </button>
            ))}
          </div>
          <button className="tk-sheet-done" onClick={close}>
            {ru ? 'Показать напитки' : 'Show drinks'}
          </button>
        </Sheet>
      )}
    </>
  );
}
export function Action({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="tk-action"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      <ArrowRight size={19} />
    </button>
  );
}
