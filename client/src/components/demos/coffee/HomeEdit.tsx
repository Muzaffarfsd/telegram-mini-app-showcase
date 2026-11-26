import { useState, type CSSProperties } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from 'lucide-react';
import type { EmblaCarouselType } from 'embla-carousel';
import {
  classic,
  drinkById,
  money,
  price,
  recipeKey,
  say,
  volume,
  type DrinkId,
  type Locale,
  type Recipe,
} from './menu';
import { addRecipe, type Line } from './orders';
import { Cup } from './MenuView';
import { useDrinkCarousel } from './useDrinkCarousel';

const signatures = [
  ['caramel-frappe', '#f0e2ce', -6],
  ['raspberry-lime', '#f3dfe0', 6],
  ['pistachio-latte', '#e6e8d7', -4],
  ['cherry-mocha', '#eddbd9', 5],
  ['orange-bumble', '#f5e4c9', -5],
  ['cappuccino', '#eae1d9', 4],
  ['matcha-latte', '#e1e6de', -5],
  ['espresso-tonic', '#efe0d5', 5],
] as const satisfies readonly (readonly [DrinkId, string, number])[];
const arrivals: DrinkId[] = [
  'yuzu-lemonade',
  'espresso-tonic',
  'raspberry-lime',
  'pistachio-latte',
  'cucumber-elderflower',
  'orange-bumble',
  'passion-mango',
  'hibiscus-berry',
];
function arrowsLabel(lang: Locale, direction: 'previous' | 'next') {
  return direction === 'previous'
    ? lang === 'ru'
      ? 'Предыдущий напиток'
      : 'Previous drink'
    : lang === 'ru'
      ? 'Следующий напиток'
      : 'Next drink';
}
function RailArrows({ api, lang }: { api?: EmblaCarouselType; lang: Locale }) {
  return (
    <div className="coffee-rail-arrows">
      <button
        type="button"
        disabled={!api}
        aria-label={arrowsLabel(lang, 'previous')}
        onClick={() => api?.scrollPrev()}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        disabled={!api}
        aria-label={arrowsLabel(lang, 'next')}
        onClick={() => api?.scrollNext()}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
type Props = {
  lang: Locale;
  bag: Line[];
  build: (r: Recipe) => void;
  catalogue: () => void;
  openBag: () => void;
  slide: number;
  setSlide: (index: number) => void;
  arc: number;
  setArc: (index: number) => void;
};
export function HomeEdit({
  lang,
  bag,
  build,
  catalogue,
  openBag,
  slide,
  setSlide,
  arc,
  setArc,
}: Props) {
  const ru = lang === 'ru';
  const shelfIndex = Math.min(Math.max(slide || 0, 0), signatures.length - 1);
  const arcIndex = Math.min(Math.max(arc || 0, 0), arrivals.length - 1);
  const [portions, setPortions] = useState(1);
  const [added, setAdded] = useState<DrinkId | null>(null);
  const [announcement, announce] = useState('');
  const shelf = useDrinkCarousel(shelfIndex, setSlide, 'shelf');
  const orbit = useDrinkCarousel(
    arcIndex,
    (i) => {
      setPortions(1);
      setAdded(null);
      setArc(i);
    },
    'arc',
  );
  const amounts = new Map(
    bag.map((line) => [recipeKey(line.recipe), line.qty]),
  );
  const recipe = classic(arrivals[arcIndex]),
    product = drinkById[recipe.drink];
  const inBag = (r: Recipe) => amounts.get(recipeKey(r)) ?? 0;
  const available = 99 - inBag(recipe),
    count = Math.min(available, portions);
  const review = added === recipe.drink || available === 0;
  function add(r: Recipe, qty: number) {
    if (!addRecipe(r, undefined, qty)) return false;
    const name = say(drinkById[r.drink].name, lang);
    announce(name + ' · ' + (ru ? 'в корзине ' : 'in bag ') + (inBag(r) + qty));
    return true;
  }
  function change(amount: number) {
    setPortions(Math.min(available, Math.max(1, count + amount)));
    setAdded(null);
  }
  return (
    <>
      <section
        className="coffee-signatures"
        aria-labelledby="coffee-signatures-title"
      >
        <div className="coffee-rail-heading">
          <h2 id="coffee-signatures-title">
            {ru ? 'Фирменные напитки' : 'House specials'}
          </h2>
          <RailArrows api={shelf.api} lang={lang} />
        </div>
        <div
          ref={shelf.viewport}
          className="coffee-signature-window"
          data-first={shelfIndex}
          data-ready={!!shelf.api}
          role="region"
          aria-labelledby="coffee-signatures-title"
          tabIndex={shelf.api ? 0 : -1}
          onKeyDown={shelf.keyboard}
        >
          <div className="coffee-signature-track" data-layout-transform="">
            {signatures.map(([id, wash, tilt], i) => {
              const d = drinkById[id],
                r = classic(id),
                qty = inBag(r),
                name = say(d.name, lang);
              return (
                <div
                  className="coffee-signature-slide"
                  data-layout-transform=""
                  key={id}
                  style={
                    {
                      '--card-wash': wash,
                      '--cup-tilt': tilt + 'deg',
                    } as CSSProperties
                  }
                >
                  <article className="coffee-signature-card">
                    <button
                      type="button"
                      className="coffee-signature-product"
                      data-slide-action="recipe"
                      data-drink={id}
                      tabIndex={i === shelfIndex ? 0 : -1}
                      onClick={() => build(r)}
                      aria-label={name + ' · ' + money(d.price, lang)}
                    >
                      <span
                        className="coffee-card-wash"
                        data-layout-transform=""
                        aria-hidden="true"
                      />
                      <span className="coffee-signature-photo">
                        <Cup id={id} eager={i < 3} />
                      </span>
                      <span className="coffee-signature-caption">
                        <strong>{name}</strong>
                        <b>{money(d.price, lang)}</b>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="coffee-signature-add"
                      data-layout-transform=""
                      data-slide-action="add"
                      tabIndex={i === shelfIndex ? 0 : -1}
                      disabled={qty >= 99}
                      aria-label={
                        (ru ? 'Добавить в корзину · ' : 'Add to bag · ') + name
                      }
                      onClick={() => {
                        setAdded(null);
                        add(r, 1);
                      }}
                    >
                      {qty > 0 && <b>{qty}</b>}
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section
        className="coffee-arrivals"
        aria-labelledby="coffee-arrivals-title"
      >
        <div className="coffee-rail-heading">
          <h2 id="coffee-arrivals-title">
            {ru ? 'Новинки' : 'New on the menu'}
          </h2>
          <button className="coffee-all" onClick={catalogue}>
            {ru ? 'Всё меню' : 'Full menu'}
            <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="coffee-arc">
          <div
            ref={orbit.viewport}
            className="coffee-arc-window"
            tabIndex={orbit.api ? 0 : -1}
            data-ready={!!orbit.api}
            role="region"
            aria-labelledby="coffee-arrivals-title"
            onKeyDown={orbit.keyboard}
            data-index={arcIndex}
          >
            <div className="coffee-arc-track" data-layout-transform="">
              {arrivals.map((id, i) => {
                const active = i === arcIndex;
                return (
                  <div
                    className="coffee-arc-slide"
                    data-layout-transform=""
                    key={id}
                  >
                    <div className="coffee-arc-position">
                      <button
                        type="button"
                        className="coffee-arc-drink"
                        data-layout-transform=""
                        data-slide-action="drink"
                        data-id={id}
                        aria-pressed={active}
                        tabIndex={active ? 0 : -1}
                        aria-label={say(drinkById[id].name, lang)}
                        onClick={() =>
                          active ? build(classic(id)) : orbit.api?.scrollTo(i)
                        }
                      >
                        <span className="coffee-arc-seat" aria-hidden="true" />
                        <Cup
                          id={id}
                          eager={active || i === 1 || i === arrivals.length - 1}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <svg
              className="coffee-arc-path"
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M0 0 H100 V9 Q50 12 0 99 Z" fill="var(--arc-sky)" />
              <path
                d="M0 99 Q50 12 100 9"
                fill="none"
                stroke="#fffaf4"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M0 95 Q50 8 100 5"
                fill="none"
                stroke="#ba9696"
                strokeWidth="1"
                strokeDasharray="3 6"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <div className="coffee-arc-info">
            <div className="coffee-arc-row">
              <div
                className="coffee-arc-copy"
                aria-live="polite"
                aria-atomic="true"
              >
                <button
                  className="coffee-arc-title"
                  onClick={() => build(recipe)}
                >
                  {say(product.name, lang)} <ArrowUpRight size={17} />
                </button>
                <p>
                  {volume(recipe.ml, lang)} · {say(product.notes, lang)}
                </p>
              </div>
              <RailArrows api={orbit.api} lang={lang} />
            </div>
            <div className="coffee-arc-order">
              <div
                className="coffee-portions"
                role="group"
                aria-label={ru ? 'Количество порций' : 'Number of drinks'}
              >
                <button
                  aria-label={ru ? 'Уменьшить количество' : 'Decrease quantity'}
                  disabled={count <= 1}
                  onClick={() => change(-1)}
                >
                  <Minus size={16} />
                </button>
                <output aria-live="polite">{count}</output>
                <button
                  aria-label={ru ? 'Увеличить количество' : 'Increase quantity'}
                  disabled={count >= available}
                  onClick={() => change(1)}
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                className="coffee-arc-add"
                onClick={() => {
                  if (review) {
                    openBag();
                    return;
                  }
                  if (add(recipe, count)) setAdded(recipe.drink);
                }}
              >
                {review ? (
                  <>
                    <Check size={15} />
                    {ru ? 'Открыть корзину' : 'View bag'}
                    <ArrowRight size={15} />
                  </>
                ) : (
                  <>
                    {ru ? 'В корзину' : 'Add to bag'}
                    <span>·</span>
                    {money(price(recipe) * count, lang)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
      <span className="coffee-announcement" role="status">
        {announcement}
      </span>
    </>
  );
}
