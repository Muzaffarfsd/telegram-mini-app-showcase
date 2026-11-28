import { useDrinkCarousel } from './useDrinkCarousel';
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
  {
    id: 'yuzu-lemonade',
    description: [
      'Юдзу, лимонная цедра и прозрачный лёд.',
      'Fragrant yuzu, lemon zest and clear ice.',
    ],
  },
  {
    id: 'orange-bumble',
    description: [
      'Апельсиновый сок под слоем двойного эспрессо.',
      'Orange juice beneath a layer of double espresso.',
    ],
  },
  {
    id: 'raspberry-lime',
    description: [
      'Размятая малина, свежий лайм и пузырьки.',
      'Crushed raspberries, fresh lime and sparkling water.',
    ],
  },
  {
    id: 'pistachio-latte',
    description: [
      'Эспрессо, фисташковая паста и тонкая молочная пена.',
      'Espresso, pistachio paste and silky milk foam.',
    ],
  },
  {
    id: 'passion-mango',
    description: [
      'Пюре манго с мякотью и семенами маракуйи.',
      'Mango purée with passion fruit pulp and seeds.',
    ],
  },
  {
    id: 'espresso-tonic',
    description: [
      'Горьковатый тоник, эспрессо и цедра грейпфрута.',
      'Bittersweet tonic, espresso and grapefruit peel.',
    ],
  },
  {
    id: 'cucumber-elderflower',
    description: [
      'Цветки бузины, лента огурца и минеральная вода.',
      'Elderflower, a cucumber ribbon and mineral water.',
    ],
  },
  {
    id: 'hibiscus-berry',
    description: [
      'Холодный настой гибискуса и чёрная смородина.',
      'Cold hibiscus tea and blackcurrants.',
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
  const pageStart = Math.max(0, Math.min(collection.length - 5, index - 2));
  const { viewport, api, keyboard } = useDrinkCarousel(
    index,
    (i) => select(collection[i].id),
    'hero',
  );
  const name = say(drink.name, lang);
  const customLabel = (ru ? 'Настроить ' : 'Customize ') + name;
  return (
    <section
      className="tk-campaign"
      data-featured={current.id}
      data-long-title={name.length > 16 || undefined}
      aria-labelledby="tk-campaign-name"
    >
      <div className="tk-campaign-copy" aria-live="polite" aria-atomic="true">
        <span className="tk-season-label">
          {ru ? 'Сезонная коллекция' : 'Seasonal collection'}
        </span>
        <h1 key={current.id} id="tk-campaign-name">
          {name}
        </h1>
        <p key={'notes-' + current.id}>{say(current.description, lang)}</p>
      </div>
      <div
        className="tk-campaign-stage coffee-hero-window"
        ref={viewport}
        onKeyDown={keyboard}
        role="region"
        aria-label={
          ru ? 'Карусель сезонных напитков' : 'Seasonal drink carousel'
        }
        data-ready={!!api}
      >
        <div
          className="coffee-hero-track"
          data-layout-transform=""
          aria-hidden="true"
        >
          {collection.map((item, i) => {
            const active = i === index,
              nearby = active || item === previous || item === next;
            const splash = item.id === 'cherry-mocha';
            const small = splash
              ? '/takt-coffee/editorial/cherry-mocha-480.webp'
              : art(item.id);
            const large = splash
              ? '/takt-coffee/editorial/cherry-mocha-900.webp'
              : art(item.id, true);
            return (
              <div
                className="coffee-hero-slide"
                data-layout-transform=""
                key={item.id}
                data-id={item.id}
              >
                <div className="coffee-hero-pose" data-layout-transform="">
                  <img
                    className={
                      'coffee-hero-photo' + (active ? ' tk-hero-cutout' : '')
                    }
                    alt=""
                    src={small}
                    srcSet={
                      nearby
                        ? splash
                          ? `${small} 480w, /takt-coffee/editorial/cherry-mocha-640.webp 640w, ${large} 900w`
                          : `${small} 320w, ${large} 800w`
                        : undefined
                    }
                    sizes="(min-width: 700px) 420px, 72vw"
                    width="430"
                    height="560"
                    draggable={false}
                    fetchPriority={active ? 'high' : 'auto'}
                    loading={nearby ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <button
          className="tk-hero-product"
          onClick={() => build(classic(drink.id))}
          aria-label={customLabel}
        />
        {[previous, next].map((item, i) => (
          <button
            key={i}
            className={'tk-neighbour ' + (i ? 'is-next' : 'is-previous')}
            onClick={() => (i ? api?.scrollNext() : api?.scrollPrev())}
            aria-label={
              (ru ? 'Показать ' : 'Show ') + say(drinkById[item.id].name, lang)
            }
          >
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
          <small aria-hidden="true">
            {String(index + 1).padStart(2, '0')} / {collection.length}
          </small>
          {collection.slice(pageStart, pageStart + 5).map((item) => (
            <button
              key={item.id}
              aria-pressed={item.id === current.id}
              aria-label={say(drinkById[item.id].name, lang)}
              onClick={() => api?.scrollTo(collection.indexOf(item))}
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
