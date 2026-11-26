import { useRef } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  art,
  classic,
  drinkById,
  money,
  say,
  volume,
  type Locale,
  type Recipe,
} from './menu';

const collection = [
  {
    id: 'cherry-mocha',
    description: [
      'Спелая вишня, тёмный шоколад и двойной эспрессо.',
      'Ripe cherry, dark chocolate and a double espresso.',
    ],
  },
  {
    id: 'caramel-frappe',
    description: [
      'Холодный эспрессо со сливками и мягкой карамелью.',
      'Iced espresso, whipped cream and a ribbon of caramel.',
    ],
  },
  {
    id: 'peach-tea',
    description: [
      'Чёрный чай со льдом, дольками персика и свежей мятой.',
      'Iced black tea with sliced peach and fresh mint.',
    ],
  },
] as const;
export type FeaturedDrink = (typeof collection)[number]['id'];
export function Campaign({
  lang,
  selected,
  select,
  build,
  menu,
}: {
  lang: Locale;
  selected?: FeaturedDrink;
  select: (id: FeaturedDrink) => void;
  build: (r: Recipe) => void;
  menu: () => void;
}) {
  const ru = lang === 'ru';
  const index = Math.max(
    0,
    collection.findIndex((item) => item.id === selected),
  );
  const current = collection[index],
    drink = drinkById[current.id];
  const previous =
    collection[(index + collection.length - 1) % collection.length];
  const next = collection[(index + 1) % collection.length];
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const name = say(drink.name, lang);
  const customLabel = (ru ? 'Настроить ' : 'Customize ') + name;
  return (
    <section
      className="tk-campaign"
      data-featured={current.id}
      aria-labelledby="tk-campaign-name"
    >
      <div className="tk-campaign-copy" aria-live="polite" aria-atomic="true">
        <span className="tk-season-label">
          {ru ? 'Сезонная коллекция' : 'Seasonal collection'}
        </span>
        <h1 id="tk-campaign-name">{name}</h1>
        <p>{say(current.description, lang)}</p>
      </div>
      <div
        className="tk-campaign-stage"
        onTouchStart={(event) => {
          const p = event.touches[0];
          touch.current = { x: p.clientX, y: p.clientY };
          swiped.current = false;
        }}
        onPointerDown={() => {
          swiped.current = false;
        }}
        onTouchCancel={() => {
          touch.current = null;
        }}
        onTouchEnd={(event) => {
          const origin = touch.current;
          touch.current = null;
          if (!origin) return;
          const end = event.changedTouches[0],
            dx = end.clientX - origin.x,
            dy = end.clientY - origin.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.35) {
            swiped.current = true;
            select(dx < 0 ? next.id : previous.id);
          }
        }}
        onClickCapture={(event) => {
          if (swiped.current) {
            event.stopPropagation();
            swiped.current = false;
          }
        }}
      >
        <button
          className="tk-hero-product"
          onClick={() => build(classic(drink.id))}
          aria-label={customLabel}
        >
          {current.id === 'cherry-mocha' ? (
            <img
              alt=""
              className="tk-hero-cutout with-splash"
              src="/takt-coffee/editorial/cherry-mocha-480.webp"
              srcSet="/takt-coffee/editorial/cherry-mocha-480.webp 480w, /takt-coffee/editorial/cherry-mocha-900.webp 900w"
              sizes="(min-width: 700px) 470px, 90vw"
              width="480"
              height="600"
              fetchPriority="high"
              draggable={false}
            />
          ) : (
            <img
              className="tk-hero-cutout"
              alt=""
              src={art(current.id, true)}
              width="430"
              height="560"
              draggable={false}
            />
          )}
        </button>
        {[previous, next].map((item, i) => (
          <button
            key={i}
            className={'tk-neighbour ' + (i ? 'is-next' : 'is-previous')}
            onClick={() => select(item.id)}
            aria-label={
              (ru ? 'Показать ' : 'Show ') + say(drinkById[item.id].name, lang)
            }
          >
            <img
              alt=""
              src={art(item.id)}
              width="56"
              height="75"
              draggable={false}
            />
            <span>
              {i ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </span>
          </button>
        ))}
      </div>
      <div className="tk-campaign-buy">
        <button
          className="tk-feature-detail"
          aria-label={customLabel + ' · ' + money(drink.price, lang)}
          onClick={() => build(classic(drink.id))}
        >
          <span>{volume(drink.sizes[0], lang)}</span>
          <i aria-hidden="true" />
          <b>
            {(ru ? 'Собрать за ' : 'Customize · ') + money(drink.price, lang)}
          </b>
          <ArrowUpRight size={15} />
        </button>
        <div
          className="tk-edition-pages"
          role="group"
          aria-label={ru ? 'Сезонные напитки' : 'Seasonal drinks'}
        >
          {collection.map((item) => (
            <button
              key={item.id}
              aria-pressed={item.id === current.id}
              aria-label={say(drinkById[item.id].name, lang)}
              onClick={() => select(item.id)}
            >
              <span />
            </button>
          ))}
        </div>
        <button className="tk-campaign-link" onClick={menu}>
          <span>{ru ? 'Открыть каталог' : 'Explore the menu'}</span>
          <ArrowRight size={21} />
        </button>
      </div>
    </section>
  );
}
