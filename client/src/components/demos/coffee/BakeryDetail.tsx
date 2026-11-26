import { ArrowRight } from 'lucide-react';
import {
  bakery,
  money,
  say,
  serving,
  type BakeryId,
  type Locale,
} from './menu';
import { Cup } from './MenuView';

export function BakeryDetail({
  id,
  lang,
  fromBag,
  done,
}: {
  id: BakeryId;
  lang: Locale;
  fromBag: boolean;
  done: () => void;
}) {
  const item = bakery[id],
    ru = lang === 'ru';
  return (
    <article className="tk-bakery-detail">
      <div className="tk-bakery-photo">
        <Cup id={id} large eager />
      </div>
      <div className="tk-bakery-info">
        <span className="tk-season-label">
          {ru ? 'Пекарня TAKT' : 'TAKT Bakery'}
        </span>
        <h1>{say(item.name, lang)}</h1>
        <p>{say(item.detail, lang)}</p>
        <div className="tk-bakery-serving">
          <span>{serving({ bakery: id }, lang)}</span>
          <b>{money(item.price, lang)}</b>
        </div>
        <button className="tk-campaign-link" onClick={done}>
          {fromBag
            ? ru
              ? 'В корзину'
              : 'Back to bag'
            : ru
              ? 'Добавить в корзину'
              : 'Add to bag'}
          <ArrowRight size={19} />
        </button>
        <dl>
          {[
            [ru ? 'Состав' : 'Ingredients', say(item.ingredients, lang)],
            [ru ? 'Аллергены' : 'Allergens', say(item.allergens, lang)],
          ].map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
