import { ChevronDown } from 'lucide-react';
import type { FurnitureProduct } from './storeCatalog';

const factLabels: Record<string, string> = { Размер: 'Dimensions', Цвет: 'Colour', Модель: 'Model' };
const factValues: Record<string, string> = {
  'Светло-серый': 'Light grey',
  Песочный: 'Sand',
  Орех: 'Walnut',
};

export default function FurnitureDetails({ product, ru }: { product: FurnitureProduct; ru: boolean }) {
  const t = (r: string, e: string) => (ru ? r : e);
  const lang = ru ? 'ru' : 'en';
  const facts =
    product.facts?.filter(
      (f) =>
        !(f.label === 'Размер' && product.dimensionsM) &&
        !product.details?.some((d) => d.label.ru === f.label && d.value.ru === f.value)
    ) || [];
  return (
    <section className="fs-item-details" aria-labelledby="fs-details-title">
      <h2 tabIndex={-1} id="fs-details-title">
        {t('О модели', 'About the piece')}
      </h2>
      {product.description && <p className="fs-item-description">{product.description[lang]}</p>}
      {product.dimensionsM && (
        <div className="product-measures">
          {[t('Ширина', 'Width'), t('Глубина', 'Depth'), t('Высота', 'Height')].map((label, i) => (
            <span key={label}>
              {label}
              <b>
                {Math.round(product.dimensionsM![i] * 100)} <small>{t('см', 'cm')}</small>
              </b>
            </span>
          ))}
        </div>
      )}
      {product.details?.length || facts.length ? (
        <details className="fs-disclosure" open>
          <summary>
            {t('Характеристики и материалы', 'Specifications & materials')}
            <ChevronDown size={17} />
          </summary>
          <dl className="fs-specs">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{ru ? f.label : factLabels[f.label] || f.label}</dt>
                <dd>{ru ? f.value : factValues[f.value] || f.value.replace(/см/g, 'cm')}</dd>
              </div>
            ))}
            {product.details?.map((d) => (
              <div key={d.label.en}>
                <dt>{d.label[lang]}</dt>
                <dd>{d.value[lang]}</dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}
      {product.dimensionsM && (
        <details className="fs-disclosure product-drawing">
          <summary>
            {t('Размеры на плане', 'Footprint drawing')}
            <ChevronDown size={17} />
          </summary>
          <figure>
            <img
              loading="lazy"
              src={'/furniture/plans/' + product.id + '.webp'}
              alt={t('Вид предмета сверху', 'Top-down view of this piece')}
            />
            <figcaption>
              {t('Ширина × глубина', 'Width × depth')} ·{' '}
              {product.dimensionsM
                .slice(0, 2)
                .map((n) => Math.round(n * 100))
                .join(' × ')}{' '}
              {t('см', 'cm')}
            </figcaption>
          </figure>
          {product.sourceNote && <p>{product.sourceNote[lang]}</p>}
        </details>
      )}
      {product.care && (
        <details className="fs-disclosure">
          <summary>
            {t('Уход', 'Care')}
            <ChevronDown size={17} />
          </summary>
          <p>{product.care[lang]}</p>
        </details>
      )}
    </section>
  );
}
