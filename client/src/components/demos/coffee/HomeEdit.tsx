import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import {
  bakery,
  classic,
  drinkById,
  money,
  price,
  say,
  type Locale,
} from './menu';
import { addPair } from './orders';
const path = '/takt-coffee/editorial/';
const pairs = [
  {
    key: 'dawn',
    title: ['Утренний дуэт', 'Morning duet'],
    drink: 'cappuccino',
    pastry: 'almond-croissant',
  },
  {
    key: 'dusk',
    title: ['После обеда', 'After lunch'],
    drink: 'espresso',
    pastry: 'chocolate-cookie',
  },
] as const;
const flavours = [
  { image: 'cherry', name: ['Ягодный', 'Berry'], query: ['Вишня', 'Cherry'] },
  {
    image: 'chocolate',
    name: ['Шоколадный', 'Chocolate'],
    query: ['Шоколад', 'Chocolate'],
  },
  {
    image: 'hazelnut',
    name: ['Ореховый', 'Nutty'],
    query: ['Фундук', 'Hazelnut'],
  },
] as const;
export function HomeEdit({
  lang,
  browse,
  openBag,
}: {
  lang: Locale;
  browse: (q: string) => void;
  openBag: () => void;
}) {
  const [index, setIndex] = useState(0),
    [full, setFull] = useState(false);
  const ru = lang === 'ru',
    pair = pairs[index],
    recipe = classic(pair.drink),
    pastry = { bakery: pair.pastry };
  if (pair.key === 'dawn') recipe.latteArt = 'rosetta';
  return (
    <div className="coffee-edits">
      <section className="coffee-pair" aria-labelledby="coffee-pair-heading">
        <div className="coffee-edit-heading">
          <h2 id="coffee-pair-heading">
            {ru ? 'Кофе и выпечка' : 'Coffee & bakery'}
          </h2>
          <div
            className="coffee-pair-switch"
            role="group"
            aria-label={ru ? 'Выбрать сочетание' : 'Choose a pairing'}
          >
            {pairs.map((p, i) => (
              <button
                key={p.key}
                aria-pressed={index === i}
                onClick={() => {
                  setIndex(i);
                  setFull(false);
                }}
              >
                {say(p.title, lang)}
              </button>
            ))}
          </div>
        </div>
        <img
          className="coffee-pair-photo"
          src={path + 'pair-' + pair.key + '-480.webp'}
          srcSet={
            path +
            'pair-' +
            pair.key +
            '-480.webp 480w, ' +
            path +
            'pair-' +
            pair.key +
            '-900.webp 900w'
          }
          sizes="(min-width:900px) 865px, 92vw"
          alt={
            say(drinkById[recipe.drink].name, lang) +
            ' · ' +
            say(bakery[pastry.bakery].name, lang)
          }
          width="900"
          height="600"
          loading="lazy"
        />
        <div className="coffee-pair-order">
          <div>
            <h3>
              {say(drinkById[recipe.drink].name, lang)} <span>+</span>{' '}
              {say(bakery[pastry.bakery].name, lang)}
            </h3>
            <b>{money(price(recipe) + price(pastry), lang)}</b>
          </div>
          <button
            aria-label={ru ? 'Добавить пару в корзину' : 'Add pairing to bag'}
            onClick={() => {
              if (addPair(recipe, pastry)) openBag();
              else setFull(true);
            }}
          >
            <Plus size={17} />
            {ru ? 'В корзину' : 'Add pair'}
          </button>
        </div>
        {full && (
          <p role="status">
            {ru
              ? 'В корзине уже 99 порций этой позиции.'
              : 'Your bag already has 99 of this item.'}
          </p>
        )}
      </section>
      <section
        className="coffee-tastes"
        aria-labelledby="coffee-tastes-heading"
      >
        <div className="coffee-edit-heading">
          <h2 id="coffee-tastes-heading">
            {ru ? 'Найти свой вкус' : 'Find your flavour'}
          </h2>
        </div>
        <div className="coffee-taste-grid">
          {flavours.map((f) => (
            <button key={f.image} onClick={() => browse(say(f.query, lang))}>
              <img
                alt=""
                src={path + 'taste-' + f.image + '.webp'}
                width="240"
                height="240"
                loading="lazy"
              />
              <span>
                {say(f.name, lang)}
                <ArrowUpRight size={13} />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
