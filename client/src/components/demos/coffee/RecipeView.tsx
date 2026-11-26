import { useRef, useState } from 'react';
import { BrewPreview } from './BrewPreview';
import type { BrewCue } from './brewSurface';
import { ArrowRight, Check, ChevronDown, ChevronRight } from 'lucide-react';
import {
  activeGroups,
  art,
  drinkById,
  groups,
  money,
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
    available = activeGroups(d.id);
  const order: GroupId[] = [
    'milk',
    'ice',
    'sugar',
    'syrup',
    'latteArt',
    'foam',
    'beans',
    'shot',
  ];
  const fields = order.filter((g) => available.includes(g));
  const defaultGroup: GroupId = d.iced ? 'ice' : d.milk ? 'milk' : 'beans';
  const [selected, setSelected] = useState<GroupId>(defaultGroup);
  const group = fields.includes(selected) ? selected : defaultGroup;
  const seq = useRef(0),
    [cue, setCue] = useState<BrewCue>();
  function change(nextRecipe: Recipe, part: BrewCue['group']) {
    setCue({ id: ++seq.current, group: part, before: recipe });
    update(nextRecipe);
  }
  return (
    <div className="tk-builder coffee-builder">
      <div className="coffee-stage">
        <BrewPreview recipe={recipe} cue={cue} lang={lang} />
      </div>
      <div className="coffee-bench">
        <div className="coffee-bench-heading">
          <h2>{ru ? 'Ваш рецепт' : 'Your recipe'}</h2>
          <button
            className="tk-size-trigger"
            aria-haspopup="dialog"
            onClick={() => open('size')}
          >
            {volume(recipe.ml, lang)}
            <ChevronDown size={15} />
          </button>
        </div>
        <div
          className="coffee-ingredients"
          role="group"
          aria-label={ru ? 'Ингредиенты' : 'Ingredients'}
        >
          {fields.map((g) => (
            <button
              key={g}
              type="button"
              data-group={g}
              aria-pressed={group === g}
              onClick={(e) => {
                setSelected(g);
                const btn = e.currentTarget,
                  rail = btn.parentElement!;
                rail.scrollTo({
                  left:
                    btn.offsetLeft -
                    rail.offsetLeft -
                    (rail.clientWidth - btn.offsetWidth) / 2,
                  behavior: 'instant',
                });
              }}
            >
              <img
                src={art(groups[g].image)}
                width="56"
                height="42"
                alt=""
                draggable={false}
              />
              <span>{say(groups[g].name, lang)}</span>
            </button>
          ))}
        </div>
        <div className="coffee-options">
          <Choices
            group={group}
            recipe={recipe}
            lang={lang}
            update={(r) => change(r, group)}
          />
        </div>
        <button className="tk-brew-next" onClick={next}>
          <span>{ru ? 'Моя чашка' : 'See my cup'}</span>
          <b>{money(price(recipe), lang)}</b>
          <ArrowRight size={17} />
        </button>
      </div>
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
                onClick={() => change({ ...recipe, ml: n }, 'size')}
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
        <BrewPreview recipe={recipe} lang={lang} />
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
