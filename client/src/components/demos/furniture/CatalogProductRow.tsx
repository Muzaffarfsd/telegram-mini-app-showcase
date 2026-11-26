import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Columns2, Heart, MoreHorizontal, Plus } from 'lucide-react';
import { typeLabel } from './catalogSearch';
import type { FurnitureProduct } from './storeCatalog';

type Props = {
  product: FurnitureProduct;
  ru: boolean;
  interior: boolean;
  image: ReactNode;
  favorite: boolean;
  compared: boolean;
  comparisonFull: boolean;
  quantity: number;
  onOpen: () => void;
  onAdd: () => void;
  onFavorite: () => void;
  onCompare: () => void;
};

export default function CatalogProductRow({
  product,
  ru,
  interior,
  image,
  favorite,
  compared,
  comparisonFull,
  quantity,
  onOpen,
  onAdd,
  onFavorite,
  onCompare,
}: Props) {
  const menu = useRef<HTMLDetailsElement>(null);
  const [added, setAdded] = useState(0);
  const t = (r: string, e: string) => (ru ? r : e);
  const kind = typeLabel(product.category, ru);
  const identity = product.name + (product.name === 'Rivet Revolve' ? ', ' + kind : '');
  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(0), 1500);
    return () => window.clearTimeout(timer);
  }, [added]);
  function closeMenu() {
    const el = menu.current;
    if (el?.open) {
      el.open = false;
      el.querySelector('summary')?.focus({ preventScroll: true });
    }
  }
  return (
    <article className="fs-card fs-catalog-row" data-photo={interior ? 'interior' : 'studio'}>
      <div className="fs-card-meta fs-row-copy">
        <span className="fs-row-brand">{product.priceLabel || product.brand}</span>
        <button type="button" className="fs-row-name" onClick={onOpen}>
          {product.name}
        </button>
        <span className="fs-row-kind">{kind}</span>
        {product.dimensionsM && (
          <span className="fs-row-width">
            {t('Ширина', 'Width')} {Math.round(product.dimensionsM[0] * 100)} {t('см', 'cm')}
          </span>
        )}
      </div>
      <button
        type="button"
        className="fs-card-open fs-row-photo"
        onClick={onOpen}
        aria-label={t('Открыть ', 'Open ') + identity}
      >
        {image}
      </button>
      <details
        className="fs-row-options"
        ref={menu}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && menu.current?.open) {
            e.preventDefault();
            closeMenu();
          }
        }}
        onBlur={(e) => {
          if (e.relatedTarget && !e.currentTarget.contains(e.relatedTarget as Node))
            e.currentTarget.open = false;
        }}
      >
        <summary aria-label={t('Действия с моделью ', 'Actions for ') + identity}>
          <MoreHorizontal size={17} aria-hidden="true" />
        </summary>
        <div>
          <button
            type="button"
            className="fs-card-heart"
            aria-pressed={favorite}
            onClick={() => {
              onFavorite();
              closeMenu();
            }}
          >
            <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
            {favorite
              ? t('Убрать из избранного', 'Remove from favourites')
              : t('В избранное', 'Add to favourites')}
          </button>
          <button
            type="button"
            className="fs-card-compare"
            aria-pressed={compared}
            disabled={!compared && comparisonFull}
            onClick={() => {
              onCompare();
              closeMenu();
            }}
          >
            <Columns2 size={16} />
            {compared ? t('Убрать из сравнения', 'Remove from comparison') : t('Сравнить', 'Compare')}
          </button>
        </div>
      </details>
      <button
        type="button"
        className="fs-row-add"
        aria-label={t('Добавить в подборку: ', 'Add to selection: ') + identity}
        disabled={quantity >= 10}
        onClick={() => {
          onAdd();
          setAdded((n) => n + 1);
        }}
      >
        <span>
          {added ? <Check size={17} strokeWidth={2.3} /> : <Plus size={18} strokeWidth={2.2} />}
        </span>
      </button>
      <span className="fs-sr" role="status">
        {added > 0 ? t('Добавлено в подборку', 'Added to your selection') + ' · ' + quantity : ''}
      </span>
    </article>
  );
}
