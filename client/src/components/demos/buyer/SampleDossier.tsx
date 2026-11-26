import { useState, type FormEvent } from 'react';
import { ArrowRight, ChevronDown, Expand, Star } from 'lucide-react';
import { local, materialOf, type Sample } from './samples';
import { sampleProfiles } from './sampleProfiles';

export type SampleRequest = { size: string; color: string; quantity: string };

export function SampleOrder({
  item,
  ru,
  begin,
  defaults,
}: {
  item: Sample;
  defaults?: SampleRequest;
  ru: boolean;
  begin: (options: SampleRequest) => void;
}) {
  const profile = sampleProfiles[item.id];
  const shade = local(profile.colour, ru);
  const clothing = item.category === 'Одежда',
    shoes = item.category === 'Обувь';
  const presets = clothing
    ? ['XS', 'S', 'M', 'L', 'XL']
    : shoes
      ? ['36', '37', '38', '39', '40', '41', '42', '43', '44']
      : [];
  const initialSize = defaults?.size ?? '';
  const customShade =
    defaults?.color && !profile.colour.includes(defaults.color)
      ? defaults.color
      : '';
  const [size, setSize] = useState(initialSize),
    [customSize, setCustomSize] = useState(
      Boolean(initialSize && !presets.includes(initialSize)),
    ),
    [colourMode, setColourMode] = useState<'sample' | 'custom'>(
      customShade ? 'custom' : 'sample',
    );
  const [colour, setColour] = useState(customShade),
    [quantity, setQuantity] = useState(defaults?.quantity ?? '1');
  const ownSize = presets.length === 0 || customSize;
  function submit(event: FormEvent) {
    event.preventDefault();
    begin({
      size: size.trim(),
      color: colourMode === 'custom' ? colour.trim() : shade,
      quantity,
    });
  }
  return (
    <form className="yb-sample-order" onSubmit={submit}>
      <div className="yb-price-line">
        <span>{ru ? 'Стоимость образца' : 'Sample price'}</span>
        <strong>{ru ? 'По запросу' : 'On request'}</strong>
      </div>
      <fieldset>
        <legend>{ru ? 'Цвет для поиска' : 'Requested colour'}</legend>
        <div className="yb-colour-choices">
          <button
            type="button"
            aria-pressed={colourMode === 'sample'}
            onClick={() => setColourMode('sample')}
          >
            <i style={{ backgroundColor: profile.swatch }} />
            {shade}
          </button>
          <button
            type="button"
            aria-pressed={colourMode === 'custom'}
            onClick={() => setColourMode('custom')}
          >
            {ru ? 'Свой оттенок' : 'Custom colour'}
          </button>
        </div>
        {colourMode === 'custom' && (
          <input
            aria-label={ru ? 'Желаемый оттенок' : 'Preferred shade'}
            required
            maxLength={80}
            value={colour}
            onChange={(e) => setColour(e.target.value)}
            placeholder={ru ? 'Название или код цвета' : 'Colour name or code'}
            pattern=".*\S.*"
          />
        )}
      </fieldset>
      <fieldset>
        <legend>
          {clothing
            ? ru
              ? 'Желаемый размер'
              : 'Requested size'
            : shoes
              ? ru
                ? 'Желаемый размер EU'
                : 'Requested EU size'
              : ru
                ? 'Желаемые размеры'
                : 'Requested dimensions'}
        </legend>
        {presets.length > 0 && (
          <div className="yb-size-choices">
            {presets.map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={!customSize && size === value}
                onClick={() => {
                  setCustomSize(false);
                  setSize(size === value && !customSize ? '' : value);
                }}
              >
                {value}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={customSize}
              onClick={() => {
                if (!customSize) setSize('');
                setCustomSize(true);
              }}
            >
              {ru ? 'Другой' : 'Other'}
            </button>
          </div>
        )}
        {ownSize && (
          <input
            aria-label={ru ? 'Размер для запроса' : 'Size for the brief'}
            maxLength={80}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder={ru ? 'Можно уточнить позже' : 'Can be confirmed later'}
          />
        )}
      </fieldset>
      <div className="yb-qty-row">
        <label htmlFor="yb-order-qty">
          {ru ? 'Количество, шт.' : 'Quantity, pcs'}
        </label>
        <input
          id="yb-order-qty"
          type="number"
          inputMode="numeric"
          min="1"
          max="99999"
          step="1"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <button type="submit" className="yb-primary yb-wide">
        {ru ? 'Найти похожее' : 'Source something similar'}
        <ArrowRight size={18} />
      </button>
    </form>
  );
}

function care(item: Sample, ru: boolean) {
  if (item.category === 'Одежда' || item.id === 'v2-scarf')
    return ru
      ? 'Попросите фото ярлыка с составом, температурой стирки и допустимым способом сушки.'
      : 'Ask for the fibre label, wash temperature and drying instructions.';
  if (item.category === 'Обувь' || item.category === 'Сумки')
    return ru
      ? 'Уточните материалы верха и подкладки, допустимую чистку и условия хранения.'
      : 'Confirm upper and lining materials, suitable cleaning products and storage instructions.';
  if (item.id === 'arc' || item.id === 'v2-lamp')
    return ru
      ? 'Уточните способ очистки плафона и возможность замены источника света.'
      : 'Ask how to clean the shade and whether the light source can be replaced.';
  if (item.category === 'Для дома')
    return ru
      ? 'Уточните у поставщика назначение изделия, допустимость контакта с пищей и машинной мойки.'
      : 'Confirm the intended use, suitability for food contact and dishwasher care with the supplier.';
  return ru
    ? 'Уточните состав, покрытие и допустимые средства для очистки поверхности.'
    : 'Ask which materials, coatings and surface cleaners the supplier specifies.';
}

export function SampleDossier({
  item,
  ru,
  inspect,
}: {
  item: Sample;
  ru: boolean;
  inspect: () => void;
}) {
  const profile = sampleProfiles[item.id];
  const sections = [
    [
      ru ? 'Описание и конструкция' : 'Design and construction',
      local(profile.story, ru),
    ],
    [
      item.category === 'Одежда' || item.category === 'Обувь'
        ? ru
          ? 'Размер и посадка'
          : 'Size and fit'
        : ru
          ? 'Что измерить'
          : 'Measurements',
      local(profile.measure, ru),
    ],
    [
      ru ? 'Материал и уход' : 'Material and care',
      materialOf(item, ru) + '. ' + care(item, ru),
    ],
    [
      ru ? 'Стоимость и доставка' : 'Pricing and delivery',
      ru
        ? 'Байер уточнит цену за штуку, минимальную партию, свою комиссию и стоимость доставки до вашего города. Эти суммы можно сравнить в сохранённом запросе.'
        : 'Your buyer can quote the unit price, minimum order, service fee and shipping to your city. Compare those amounts in your saved brief.',
    ],
  ];
  return (
    <section
      className="yb-passport"
      aria-label={ru ? 'Подробности об образце' : 'Sample details'}
    >
      <div className="yb-passport-details">
        <h2>{ru ? 'Об образце' : 'About the sample'}</h2>
        {sections.map(([title, text], i) => (
          <details key={i} open={i === 0 ? true : undefined}>
            <summary>
              {title}
              <ChevronDown size={17} />
            </summary>
            <p>{text}</p>
          </details>
        ))}
      </div>
      <div className="yb-detail-study">
        <button
          type="button"
          onClick={inspect}
          aria-label={
            ru ? 'Увеличить деталь образца' : 'Enlarge the sample detail'
          }
        >
          <img
            src={item.gallery[1]}
            loading="lazy"
            alt={
              ru
                ? 'Конструктивная деталь образца'
                : 'Construction detail of the sample'
            }
          />
          <span>
            <Expand size={16} />
          </span>
        </button>
        <div>
          <h3>{ru ? 'Что проверить' : 'What to inspect'}</h3>
          <p>{local(profile.inspect, ru)}</p>
        </div>
      </div>
    </section>
  );
}

type Review = { rating: number; text: string };
function readReview(key: string): Review | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value &&
      Number.isInteger(value.rating) &&
      value.rating >= 1 &&
      value.rating <= 5 &&
      typeof value.text === 'string'
      ? { rating: value.rating, text: value.text.slice(0, 700) }
      : null;
  } catch {
    return null;
  }
}
export function SampleReview({ item, ru }: { item: Sample; ru: boolean }) {
  const key = 'yangben-sample-review-v1:' + item.id;
  const [saved, setSaved] = useState<Review | null>(() => readReview(key)),
    [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(saved?.rating ?? 0),
    [text, setText] = useState(saved?.text ?? ''),
    [error, setError] = useState(false);
  function store(event: FormEvent) {
    event.preventDefault();
    const data = { rating, text: text.trim() };
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setSaved(data);
      setEditing(false);
      setError(false);
    } catch {
      setError(true);
    }
  }
  return (
    <section className="yb-sample-review" aria-labelledby="yb-review-title">
      <h2 id="yb-review-title">
        {ru ? 'Мой отзыв об образце' : 'My sample review'}
      </h2>
      {editing ? (
        <form onSubmit={store}>
          <fieldset>
            <legend>{ru ? 'Оценка' : 'Rating'}</legend>
            <div className="yb-rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n}>
                  <input
                    type="radio"
                    name="yb-rating"
                    value={n}
                    required
                    checked={rating === n}
                    onChange={() => setRating(n)}
                    aria-label={(ru ? 'Оценка ' : 'Rate ') + n + '/5'}
                  />
                  <Star
                    aria-hidden="true"
                    size={23}
                    fill={n <= rating ? 'currentColor' : 'none'}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            {ru ? 'Впечатления об образце' : 'Your impressions'}
            <textarea
              maxLength={700}
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </label>
          {error && (
            <p role="alert">
              {ru
                ? 'Сохранить на устройстве не удалось. Текст остался в форме.'
                : 'Could not save on this device. Your text is still in the form.'}
            </p>
          )}
          <div>
            <button
              className="yb-text-button"
              type="button"
              onClick={() => setEditing(false)}
            >
              {ru ? 'Отмена' : 'Cancel'}
            </button>
            <button className="yb-primary" type="submit">
              {ru ? 'Сохранить отзыв' : 'Save review'}
              <ArrowRight size={17} />
            </button>
          </div>
        </form>
      ) : (
        <>
          {saved ? (
            <div className="yb-saved-review">
              <strong
                aria-label={(ru ? 'Оценка ' : 'Rating ') + saved.rating + '/5'}
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < saved.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </strong>
              {saved.text && <p>{saved.text}</p>}
            </div>
          ) : null}
          <p>
            {ru
              ? 'Личная запись на этом устройстве. Можно отметить посадку, материал или качество после осмотра.'
              : 'A personal note on this device. Record fit, material or quality after inspecting a sample.'}
          </p>
          <button
            type="button"
            className="yb-text-button"
            onClick={() => {
              setRating(saved?.rating ?? 0);
              setText(saved?.text ?? '');
              setError(false);
              setEditing(true);
            }}
          >
            {saved
              ? ru
                ? 'Изменить отзыв'
                : 'Edit review'
              : ru
                ? 'Оценить образец'
                : 'Review this sample'}
            <ArrowRight size={15} />
          </button>
        </>
      )}
    </section>
  );
}
