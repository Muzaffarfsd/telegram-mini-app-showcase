import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  ShoppingBag,
  LayoutGrid,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  art,
  classic,
  drinkById,
  money,
  price,
  recipeKey,
  serving,
  productFor,
  isBakery,
  type MenuSelection,
  say,
  specials,
  type Locale,
  type Recipe,
} from './menu';
import { createPortal } from 'react-dom';
import { addRecipe, toggleSaved, type Line } from './orders';

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
export function DailyShelf({
  lang,
  build,
  slide,
  setSlide,
  catalogue,
}: {
  lang: Locale;
  build: (r: Recipe) => void;
  slide: number;
  setSlide: (n: number) => void;
  catalogue: () => void;
}) {
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
  return (
    <section className="tk-daily">
      <div className="tk-section-title">
        <h2>{ru ? 'Выбор бариста' : 'Barista picks'}</h2>
        <button onClick={catalogue}>
          {ru ? 'В каталог' : 'Full menu'} <ChevronRight size={16} />
        </button>
      </div>
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
  );
}

export type Filter =
  | 'all'
  | 'lemonade'
  | 'milk'
  | 'bakery'
  | 'ice'
  | 'tea'
  | 'black'
  | 'other';
export type Sort = 'house' | 'price-low' | 'price-high';
const filters = [
  { id: 'all', name: ['Все', 'All'], image: null },
  { id: 'milk', name: ['С молоком', 'Milk coffee'], image: 'cappuccino' },
  { id: 'lemonade', name: ['Лимонады', 'Lemonades'], image: 'yuzu-lemonade' },
  { id: 'bakery', name: ['Выпечка', 'Bakery'], image: 'almond-croissant' },
  { id: 'ice', name: ['Со льдом', 'Iced'], image: 'cherry-mocha' },
  { id: 'tea', name: ['Чай', 'Tea'], image: 'peach-tea' },
  { id: 'black', name: ['Чёрный', 'Black coffee'], image: 'americano' },
  { id: 'other', name: ['Без кофе', 'Coffee-free'], image: 'matcha-latte' },
] as const;
const sorts = [
  { id: 'house', name: ['Выбор кофейни', 'House order'] },
  { id: 'price-low', name: ['Сначала дешевле', 'Lowest price first'] },
  { id: 'price-high', name: ['Сначала дороже', 'Highest price first'] },
] as const;
const menuOrder: MenuSelection[] = [
  classic('cherry-mocha'),
  classic('yuzu-lemonade'),
  classic('caramel-frappe'),
  { bakery: 'almond-croissant' },
  classic('peach-tea'),
  classic('cappuccino'),
  classic('raspberry-lime'),
  classic('orange-bumble'),
  classic('iced-latte'),
  classic('flat-white'),
  classic('pistachio-latte'),
  classic('passion-mango'),
  { bakery: 'chocolate-cookie' },
  classic('matcha-latte'),
  classic('americano'),
  classic('mocha'),
  classic('cold-brew'),
  classic('cucumber-elderflower'),
  classic('espresso-tonic'),
  classic('hibiscus-berry'),
  classic('latte'),
  classic('cocoa'),
  classic('espresso'),
];
function inCategory(item: MenuSelection, filter: Filter) {
  if (filter === 'all') return true;
  if (isBakery(item)) return filter === 'bakery';
  const d = drinkById[item.drink];
  switch (filter) {
    case 'milk':
      return d.milk && !d.withoutCoffee;
    case 'ice':
      return !!d.iced;
    case 'tea':
      return d.family === 'tea';
    case 'lemonade':
      return d.family === 'lemonade';
    case 'black':
      return !d.milk && !d.withoutCoffee;
    case 'other':
      return !!d.withoutCoffee;
    default:
      return false;
  }
}
const normal = (str: string) =>
  str
    .toLocaleLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[-‐‑–]/g, ' ')
    .trim();

export function MenuView({
  lang,
  openProduct,
  openBag,
  bag,
  filter,
  setFilter,
  query,
  setQuery,
  sort,
  setSort,
  filtersOpen,
  openFilters,
  close,
  saved,
}: {
  lang: Locale;
  openProduct: (item: MenuSelection) => void;
  openBag: () => void;
  bag: Line[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  query: string;
  setQuery: (q: string) => void;
  sort: Sort;
  setSort: (s: Sort) => void;
  filtersOpen: boolean;
  openFilters: () => void;
  close: () => void;
  saved: Recipe[];
}) {
  const ru = lang === 'ru';
  const words = normal(query).split(/\s+/).filter(Boolean);
  const categoryBar = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const bar = categoryBar.current;
    const active = bar?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!bar || !active) return;
    const row = bar.getBoundingClientRect(),
      button = active.getBoundingClientRect();
    if (button.left < row.left || button.right > row.right)
      bar.scrollLeft +=
        button.left - row.left - (bar.clientWidth - active.offsetWidth) / 2;
  }, [filter]);
  const [added, setAdded] = useState<{ id: string; name: string } | null>(null);
  useEffect(() => {
    if (!added) return;
    const id = window.setTimeout(() => setAdded(null), 3600);
    return () => window.clearTimeout(id);
  }, [added]);
  const filtered = menuOrder.filter((item) => {
    const d = productFor(item);
    const haystack = normal(
      [d.id, ...d.name, ...d.notes, ...d.detail].join(' '),
    );
    return (
      inCategory(item, filter) && words.every((word) => haystack.includes(word))
    );
  });
  if (sort !== 'house')
    filtered.sort((a, b) =>
      sort === 'price-low' ? price(a) - price(b) : price(b) - price(a),
    );
  const savedKeys = new Set(saved.map(recipeKey));
  const fullLines = new Set(
    bag.filter((line) => line.qty >= 99).map((line) => recipeKey(line.recipe)),
  );
  return (
    <section
      className="tk-catalogue"
      onMouseDown={(e) => {
        // WebKit can refocus main and move a result before the release click.
        const field = document.activeElement;
        if (
          e.button === 0 &&
          field instanceof HTMLInputElement &&
          e.currentTarget.contains(field) &&
          e.target instanceof Element &&
          e.target.closest('button')
        )
          e.preventDefault();
      }}
    >
      <h1 className="tk-page-title">{ru ? 'Каталог' : 'Menu'}</h1>
      <div className="tk-search-row">
        <label className="tk-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label={ru ? 'Поиск по меню' : 'Search the menu'}
            placeholder={
              ru
                ? 'Найти напиток, выпечку или вкус'
                : 'Search drinks, bakery or flavours'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={80}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={ru ? 'Очистить поиск' : 'Clear search'}
            >
              <X size={16} />
            </button>
          )}
        </label>
      </div>
      <div
        className="tk-category-tabs"
        ref={categoryBar}
        role="group"
        aria-label={ru ? 'Категории меню' : 'Menu categories'}
      >
        {filters.map((f) => (
          <button
            key={f.id}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            <span className="tk-category-photo" aria-hidden="true">
              {f.image ? <Cup id={f.image} eager /> : <LayoutGrid size={21} />}
            </span>
            {say(f.name, lang)}
          </button>
        ))}
      </div>
      <div className="tk-section-title tk-result-title">
        <h2>
          {say(
            filters.find((f) => f.id === filter && filter !== 'all')?.name ?? [
              'Всё меню',
              'Full menu',
            ],
            lang,
          )}
        </h2>
        <span
          className="tk-result-count"
          role="status"
          aria-live="polite"
          aria-label={
            (ru ? 'Найдено позиций · ' : 'Results · ') + filtered.length
          }
        >
          {filtered.length}
        </span>
        <button
          className="tk-filter-trigger"
          onClick={openFilters}
          aria-haspopup="dialog"
          aria-label={ru ? 'Сортировка' : 'Sort menu'}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>
      {filtered.length ? (
        <div className="tk-grid">
          {filtered.map((item, i) => {
            const d = productFor(item),
              name = say(d.name, lang),
              drink = !isBakery(item);
            const isSaved = drink && savedKeys.has(recipeKey(item));
            return (
              <article className="tk-menu-product" key={d.id}>
                <button
                  className="tk-card"
                  data-drink={d.id}
                  onClick={() => openProduct(item)}
                  aria-label={name + ' · ' + money(d.price, lang)}
                >
                  <span className="tk-product-image">
                    <Cup id={d.id} eager={i < 4} />
                  </span>
                  <span className="tk-product-copy">
                    <span className="tk-card-serving">
                      {serving(item, lang)}
                    </span>
                    <strong>{name}</strong>
                    <small>{say(d.notes, lang)}</small>
                    <b className="tk-card-price">{money(d.price, lang)}</b>
                  </span>
                </button>
                {drink && (
                  <button
                    className="tk-product-save"
                    aria-label={
                      (ru ? 'Сохранить рецепт · ' : 'Save recipe · ') + name
                    }
                    aria-pressed={isSaved}
                    onClick={() => toggleSaved(item)}
                  >
                    <Bookmark
                      size={16}
                      fill={isSaved ? 'currentColor' : 'none'}
                    />
                  </button>
                )}
                <button
                  className="tk-quick-add"
                  disabled={fullLines.has(recipeKey(item))}
                  aria-label={
                    (ru ? 'Добавить в корзину · ' : 'Add to bag · ') + name
                  }
                  onClick={() => {
                    addRecipe(item);
                    setAdded({ id: d.id, name });
                  }}
                >
                  {added?.id === d.id ? (
                    <Check size={17} />
                  ) : (
                    <Plus size={18} />
                  )}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="tk-search-empty">
          <Search size={29} />
          <h2>{ru ? 'Ничего не найдено' : 'No matches'}</h2>
          <p>
            {ru
              ? 'Попробуйте «какао» или выберите другую категорию.'
              : 'Try “cocoa” or choose another category.'}
          </p>
          <button
            className="tk-text-button"
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
          >
            {ru ? 'Показать всё меню' : 'Show full menu'}{' '}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
      {createPortal(
        <div
          lang={lang}
          role="status"
          aria-live="polite"
          className="tk-added-status"
        >
          {added && (
            <button onClick={openBag}>
              <ShoppingBag size={17} />
              <span>
                {added.name} · {ru ? 'в корзине' : 'in your bag'}
              </span>
              <ArrowRight size={17} />
            </button>
          )}
        </div>,
        document.body,
      )}
      {filtersOpen && (
        <Sheet
          lang={lang}
          title={ru ? 'Сортировка' : 'Sort menu'}
          close={close}
        >
          <div className="tk-choice-list">
            {sorts.map((s) => (
              <button
                key={s.id}
                aria-pressed={sort === s.id}
                onClick={() => setSort(s.id)}
              >
                <span>{say(s.name, lang)}</span>
                {s.id === sort && <Check size={17} />}
              </button>
            ))}
          </div>
          <button className="tk-sheet-done" onClick={close}>
            {ru ? 'Показать меню' : 'Show menu'}
          </button>
        </Sheet>
      )}
    </section>
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
