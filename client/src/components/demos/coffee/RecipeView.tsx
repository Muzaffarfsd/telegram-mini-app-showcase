import type { CSSProperties } from 'react';
import { ArrowRight, Check, ChevronDown, ChevronRight } from 'lucide-react';
import {
  activeGroups,
  classic,
  art,
  drinkById,
  groups,
  money,
  optionFor,
  price,
  recipeParts,
  say,
  selection,
  volume,
  type GroupId,
  type Locale,
  type Recipe,
} from './menu';
import { Cup, Sheet } from './MenuView';

export type RecipePanel = GroupId | 'size' | 'details' | 'drink';
type Specimen = readonly [GroupId, number, number, number];
type Diagram = { items: Specimen[]; lines: string[] };
const hot: Diagram = {
  items: [
    ['latteArt', 22, 18, -9],
    ['sugar', 71, 13, 8],
    ['foam', 32, 52, 5],
    ['syrup', 84, 46, -8],
    ['beans', 20, 84, -8],
    ['milk', 78, 81, -5],
  ],
  lines: [
    'M 13 26 C 4 39, 21 44, 24 49',
    'M 60 17 C 50 22, 59 50, 44 52',
    'M 79 11 C 92 8, 91 33, 88 39',
    'M 89 53 C 94 61, 90 70, 82 73',
    'M 66 82 C 51 95, 42 78, 32 84',
  ],
};
const iced: Diagram = {
  items: [
    ['beans', 21, 22, -8],
    ['sugar', 73, 13, 7],
    ['ice', 31, 60, 4],
    ['syrup', 84, 48, -8],
    ['milk', 67, 83, -5],
  ],
  lines: [
    'M 12 29 C 5 42, 18 48, 22 53',
    'M 33 18 C 46 5, 54 13, 61 13',
    'M 80 21 C 87 24, 88 32, 87 39',
    'M 82 56 C 85 69, 82 73, 76 77',
    'M 39 64 C 45 76, 51 71, 57 78',
  ],
};
const black: Diagram = {
  items: [
    ['beans', 22, 19, -8],
    ['sugar', 76, 26, 6],
    ['shot', 27, 72, 4],
    ['syrup', 74, 75, -7],
  ],
  lines: [
    'M 34 17 C 46 10, 53 23, 64 24',
    'M 12 29 C 2 43, 18 61, 23 64',
    'M 81 34 C 94 44, 87 62, 80 66',
    'M 39 75 C 49 85, 54 67, 64 74',
  ],
};
const short: Diagram = {
  items: [
    ['beans', 25, 26, -9],
    ['sugar', 77, 25, 7],
    ['syrup', 54, 73, -6],
  ],
  lines: [
    'M 36 22 C 50 11, 57 24, 65 25',
    'M 19 35 C 11 53, 32 62, 43 69',
    'M 81 35 C 91 52, 73 59, 63 68',
  ],
};
const milkOnly: Diagram = {
  items: [
    ['latteArt', 21, 20, -8],
    ['sugar', 74, 16, 7],
    ['foam', 30, 54, 5],
    ['syrup', 81, 53, -7],
    ['milk', 58, 84, 4],
  ],
  lines: [
    'M 14 29 C 3 43, 18 46, 23 49',
    'M 32 18 C 48 7, 60 11, 64 14',
    'M 82 24 C 91 32, 90 41, 85 45',
    'M 78 64 C 75 71, 68 76, 64 78',
  ],
};
const cold: Diagram = {
  ...short,
  items: [
    ['ice', 25, 26, -9],
    ['sugar', 77, 25, 7],
    ['syrup', 54, 73, -6],
  ],
};
function diagramFor(recipe: Recipe) {
  const d = drinkById[recipe.drink];
  if (d.iced && !d.milk) return cold;
  if (d.withoutCoffee) return milkOnly;
  return d.foam ? hot : d.iced ? iced : d.id === 'espresso' ? short : black;
}
function Choices({
  group,
  recipe,
  lang,
  update,
}: {
  group: GroupId;
  recipe: Recipe;
  lang: Locale;
  update: (r: Recipe) => void;
}) {
  const field = groups[group];
  return (
    <div
      className="tk-options tk-choice-list"
      role="group"
      aria-label={say(field.name, lang)}
    >
      {field.options.map((o) => (
        <button
          key={o.id}
          data-value={o.id}
          aria-pressed={selection(group, recipe) === o.id}
          onClick={() => update({ ...recipe, [group]: o.id })}
        >
          <span>{say(o.name, lang)}</span>
          {o.add > 0 && <small>+{money(o.add, lang)}</small>}
          {selection(group, recipe) === o.id && <Check size={17} />}
        </button>
      ))}
    </div>
  );
}
export function Builder({
  lang,
  recipe,
  panel,
  open,
  close,
  update,
  next,
}: {
  lang: Locale;
  recipe: Recipe;
  panel?: RecipePanel;
  open: (panel: RecipePanel) => void;
  close: () => void;
  update: (r: Recipe) => void;
  next: () => void;
}) {
  const ru = lang === 'ru',
    d = drinkById[recipe.drink],
    diagram = diagramFor(recipe);
  const group =
    panel &&
    panel !== 'size' &&
    panel !== 'details' &&
    panel !== 'drink' &&
    activeGroups(d.id).includes(panel)
      ? panel
      : undefined;
  return (
    <div className="tk-builder">
      <div
        className="tk-recipe-map"
        role="group"
        aria-label={ru ? 'Настроить ингредиенты' : 'Choose ingredients'}
      >
        <svg
          className="tk-thread"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id="takt-tip"
              viewBox="0 0 5 5"
              refX="4"
              refY="2.5"
              markerWidth="4.5"
              markerHeight="4.5"
              orient="auto"
            >
              <path d="M0 0 5 2.5 0 5 1.2 2.5Z" fill="currentColor" />
            </marker>
          </defs>
          {diagram.lines.map((path) => (
            <path
              key={path}
              d={path}
              fill="none"
              stroke="currentColor"
              strokeWidth=".27"
              strokeDasharray=".7 .43"
              strokeLinecap="round"
              markerEnd="url(#takt-tip)"
            />
          ))}
        </svg>
        {diagram.items.map(([g, x, y, angle]) => (
          <button
            className="tk-ingredient"
            key={g}
            data-group={g}
            onClick={() => open(g)}
            aria-haspopup="dialog"
            aria-label={
              say(groups[g].name, lang) +
              ' · ' +
              say(optionFor(g, recipe).name, lang)
            }
            style={
              {
                '--x': x + '%',
                '--y': y + '%',
                '--tilt': angle + 'deg',
              } as CSSProperties
            }
          >
            <img
              src={art(groups[g].image)}
              width="108"
              height="82"
              alt=""
              draggable={false}
            />
            <span>{say(groups[g].name, lang)}</span>
            {selection(g, recipe) !== selection(g, classic(d.id)) && (
              <small className="tk-changed-ingredient">
                {say(optionFor(g, recipe).name, lang)}
              </small>
            )}
          </button>
        ))}
      </div>
      <div className="tk-brew-base">
        <Cup id={d.iced ? d.id : 'studio-cup'} large eager />
        <div className="tk-brew-actions">
          <button
            className="tk-size-trigger"
            aria-haspopup="dialog"
            onClick={() => open('size')}
          >
            {volume(recipe.ml, lang)}
            <ChevronDown size={14} />
          </button>
          <button className="tk-brew-next" onClick={next}>
            {ru ? 'Моя чашка' : 'See my cup'}
            <b>{money(price(recipe), lang)}</b>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
      {group && (
        <Sheet lang={lang} title={say(groups[group].name, lang)} close={close}>
          <Choices group={group} recipe={recipe} lang={lang} update={update} />
          {group === 'beans' &&
            !diagram.items.some((i) => i[0] === 'shot') &&
            activeGroups(d.id).includes('shot') && (
              <>
                <h3>{ru ? 'Крепость' : 'Strength'}</h3>
                <Choices
                  group="shot"
                  recipe={recipe}
                  lang={lang}
                  update={update}
                />
              </>
            )}
          <button className="tk-sheet-done" onClick={close}>
            {ru ? 'Готово' : 'Done'}
          </button>
        </Sheet>
      )}
      {panel === 'drink' && (
        <Sheet lang={lang} title={say(d.name, lang)} close={close}>
          <div className="tk-drink-intro">
            <Cup id={d.id} />
            <div>
              <b>{say(d.notes, lang)}</b>
              <p>{say(d.detail, lang)}</p>
            </div>
          </div>
          <div className="tk-current-recipe">
            <b>{ru ? 'Ваш рецепт' : 'Your recipe'}</b>
            <p>{recipeParts(recipe, lang).join(' · ')}</p>
            <strong>{money(price(recipe), lang)}</strong>
          </div>
          <button className="tk-sheet-done" onClick={close}>
            {ru ? 'К настройкам' : 'Back to recipe'}
          </button>
        </Sheet>
      )}
      {panel === 'size' && (
        <Sheet
          lang={lang}
          title={ru ? 'Объём стакана' : 'Cup size'}
          close={close}
        >
          <div
            className="tk-choice-list tk-size"
            role="group"
            aria-label={ru ? 'Объём' : 'Volume'}
          >
            {d.sizes.map((n, i) => (
              <button
                key={n}
                aria-pressed={recipe.ml === n}
                onClick={() => update({ ...recipe, ml: n })}
              >
                <span>{volume(n, lang)}</span>
                {d.sizePrices[i] > 0 && (
                  <small>+{money(d.sizePrices[i], lang)}</small>
                )}
                {recipe.ml === n && <Check size={17} />}
              </button>
            ))}
          </div>
          <button className="tk-sheet-done" onClick={close}>
            {ru ? 'Готово' : 'Done'}
          </button>
        </Sheet>
      )}
    </div>
  );
}
function cupLine(r: Recipe, lang: Locale) {
  const d = drinkById[r.drink];
  const flavours = {
    cinnamon: ['С корицей', 'With cinnamon'],
    vanilla: ['С ванилью', 'With vanilla'],
    caramel: ['С карамелью', 'With caramel'],
    chocolate: ['С шоколадом', 'With chocolate'],
  } as const;
  if (Object.hasOwn(flavours, r.syrup))
    return say(flavours[r.syrup as keyof typeof flavours], lang);
  if (d.iced) {
    if (selection('ice', r) === 'no-ice')
      return lang === 'ru' ? 'Без льда' : 'Without ice';
    if (selection('ice', r) === 'less')
      return lang === 'ru' ? 'Меньше льда' : 'Light ice';
    return lang === 'ru' ? 'Со льдом' : 'Over ice';
  }
  if (d.milk) {
    if (r.milk === 'oat')
      return lang === 'ru' ? 'На овсяном молоке' : 'With oat milk';
    if (r.milk === 'lactose-free')
      return lang === 'ru' ? 'На молоке без лактозы' : 'With lactose-free milk';
    return lang === 'ru' ? 'С молочной пеной' : 'With steamed milk';
  }
  if (r.beans === 'decaf')
    return lang === 'ru' ? 'Без кофеина' : 'Decaffeinated';
  return r.beans === 'fruit'
    ? lang === 'ru'
      ? 'Зерно из Эфиопии'
      : 'Ethiopian beans'
    : lang === 'ru'
      ? 'Зерно из Бразилии'
      : 'Brazilian beans';
}
export function FinishCup({
  lang,
  recipe,
  editing,
  add,
  another,
  edit,
  details,
  openDetails,
  close,
}: {
  lang: Locale;
  recipe: Recipe;
  editing: boolean;
  add: () => void;
  another: () => void;
  edit: () => void;
  details: boolean;
  openDetails: () => void;
  close: () => void;
}) {
  const ru = lang === 'ru',
    d = drinkById[recipe.drink];
  return (
    <div className="tk-finish">
      <h1 className="tk-poster-title">
        <span>{say(d.name, lang)}</span>
        <span>{cupLine(recipe, lang)}</span>
      </h1>
      <button
        className="tk-poster-cup"
        aria-label={
          ru ? 'Состав и объём напитка' : 'Drink ingredients and size'
        }
        aria-haspopup="dialog"
        onClick={openDetails}
      >
        <Cup id={d.id} large eager />
      </button>
      <div className="tk-finish-actions">
        <button className="tk-buy" onClick={add}>
          <span>
            {editing
              ? ru
                ? 'Обновить в корзине'
                : 'Update in bag'
              : ru
                ? 'В корзину'
                : 'Add to bag'}
          </span>
          <i aria-hidden="true">·</i>
          <b>{money(price(recipe), lang)}</b>
        </button>
        <button className="tk-another" onClick={another}>
          {ru ? 'Собрать ещё одну чашку' : 'Build another cup'}
          <ChevronRight size={15} />
        </button>
        <button className="tk-finish-detail" onClick={openDetails}>
          {ru ? 'Состав и объём' : 'Ingredients & size'}
          <ChevronDown size={13} />
        </button>
      </div>
      {details && (
        <Sheet lang={lang} title={say(d.name, lang)} close={close}>
          <p>{say(d.detail, lang)}</p>
          <ul className="tk-recipe-list">
            {recipeParts(recipe, lang).map((part) => (
              <li key={part}>{part}</li>
            ))}
          </ul>
          <button className="tk-sheet-done" onClick={edit}>
            {ru ? 'Изменить рецепт' : 'Edit recipe'}
            <ArrowRight size={16} />
          </button>
        </Sheet>
      )}
    </div>
  );
}
