import { useEffect, useState, type CSSProperties } from 'react';
import { ArrowUpRight, Box, Check, ChevronsLeftRight, Plus } from 'lucide-react';
import type { FurnitureProduct } from './storeCatalog';
import { studioSrcSet, studioThumbnail } from './studioPhotography';
import './FurnitureHomeEdits.css';

export type HomeEditSelection = { roomProduct?: string; sampleProduct?: string; reveal?: number };

interface EditProps {
  products: readonly FurnitureProduct[];
  ru: boolean;
  selection: HomeEditSelection;
  onSelect: (patch: HomeEditSelection) => void;
  onOpenProduct: (product: FurnitureProduct, photo?: number) => void;
}

const readingPieces = [
  { id: 'rivet-adrienne-chair', name: ['Кресло', 'Armchair'], left: 44.5, top: 64 },
  { id: 'abo-b072zlcb3m', name: ['Столик', 'Side table'], left: 78.6, top: 53.9 },
  { id: 'abo-b07b4yxr7d', name: ['Торшер', 'Floor lamp'], left: 21.1, top: 20.1 },
] as const;

export function ReadingCornerEdit({
  products,
  ru,
  selection,
  onSelect,
  onOpenProduct,
  onOpenRoom,
}: EditProps & {
  onOpenRoom?: (product: FurnitureProduct) => void;
}) {
  const lang = ru ? 0 : 1;
  const parts = readingPieces.flatMap((part) => {
    const product = products.find((p) => p.id === part.id);
    return product ? [{ ...part, product }] : [];
  });
  const active = parts.find((p) => p.id === selection.roomProduct) || parts[0];
  if (!active) return null;
  const { product } = active;
  const select = (id: string) => onSelect({ roomProduct: id });
  return (
    <section className="fhome-section fedit-room" aria-labelledby="fedit-room-title">
      <div className="fhome-heading">
        <h2 id="fedit-room-title">{ru ? 'Уголок для чтения' : 'The reading corner'}</h2>
        {onOpenRoom && (
          <button
            type="button"
            className="fhome-text-link"
            onClick={() => onOpenRoom(product)}
            aria-label={ru ? 'Открыть уголок для чтения в 3D' : 'Open the reading corner in 3D'}
          >
            <Box size={16} aria-hidden="true" /> {ru ? 'В 3D' : 'View in 3D'}
          </button>
        )}
      </div>
      <div className="fedit-room-body">
        <div
          className="fedit-room-picture"
          role="group"
          aria-label={ru ? 'Выбрать предмет на фотографии' : 'Choose a piece in the photograph'}
        >
          <img
            src="/furniture/home/reading-corner-640.webp"
            srcSet="/furniture/home/reading-corner-640.webp 640w, /furniture/home/reading-corner-1440.webp 1440w"
            sizes="(min-width:1040px) 670px, (min-width:700px) 64vw, 100vw"
            width={1440}
            height={1080}
            loading="lazy"
            decoding="async"
            alt={
              ru
                ? 'Кресло Adrienne между торшером Brass Floor и ореховым столиком Bristol'
                : 'Adrienne armchair between the Brass Floor lamp and the walnut Bristol side table'
            }
          />
          {parts.map((part) => (
            <button
              type="button"
              key={part.id}
              className="fedit-pin"
              style={{ left: part.left + '%', top: part.top + '%' }}
              aria-pressed={active.id === part.id}
              aria-label={(ru ? 'Выбрать' : 'Select') + ' ' + part.product.name}
              onClick={() => select(part.id)}
            >
              <span>{active.id === part.id ? <Check size={15} /> : <Plus size={16} />}</span>
            </button>
          ))}
        </div>
        <div className="fedit-room-details">
          <div className="fedit-room-list">
            <h3>{ru ? 'На фотографии' : 'In the photograph'}</h3>
            {parts.map((part) => (
              <button
                type="button"
                key={part.id}
                aria-pressed={active.id === part.id}
                onClick={() => select(part.id)}
              >
                <span>{part.name[lang]}</span>
                <strong>{part.product.name}</strong>
              </button>
            ))}
          </div>
          <div aria-live="polite" aria-atomic="true">
            <button
              type="button"
              className="fedit-item-link"
              onClick={() => onOpenProduct(product)}
              aria-label={(ru ? 'Открыть модель' : 'Open model') + ' ' + product.name}
            >
              <img src={studioThumbnail(product.images[0])} alt="" loading="lazy" />
              <span>
                <small>
                  {active.name[lang]}
                  {product.dimensionsM && (
                    <>
                      {' '}
                      · {Math.round(product.dimensionsM[0] * 100)} {ru ? 'см' : 'cm'}
                    </>
                  )}
                </small>
                <strong>{product.name}</strong>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const samples = [
  {
    id: 'hallowood-waverly-table',
    material: ['Дерево', 'Wood'],
    focus: '65% 17%',
    finish: ['Массив дуба', 'Solid oak'],
  },
  {
    id: 'rivet-revolve-sofa',
    material: ['Ткань', 'Fabric'],
    focus: '59% 42%',
    finish: ['Обивка Grey Weave', 'Grey Weave upholstery'],
  },
  {
    id: 'abo-b07374m9zw',
    material: ['Металл', 'Metal'],
    focus: '32% 68%',
    finish: ['Металл с медным оттенком', 'Copper-toned metal'],
  },
] as const;
const initialReveal = 48;

export function MaterialEdit({ products, ru, selection, onSelect, onOpenProduct }: EditProps) {
  const lang = ru ? 0 : 1;
  const options = samples.flatMap((sample) => {
    const product = products.find((p) => p.id === sample.id && p.images[0] && p.images[2]);
    return product ? [{ ...sample, product }] : [];
  });
  const sample = options.find((s) => s.id === selection.sampleProduct) || options[0];
  const savedReveal = selection.reveal ?? initialReveal;
  const [reveal, setReveal] = useState(savedReveal);
  useEffect(() => setReveal(savedReveal), [savedReveal]);
  if (!sample) return null;
  const { product } = sample;
  function remember(value: number) {
    if (savedReveal !== value) onSelect({ reveal: value });
  }
  function endpoint(value: number) {
    setReveal(value);
    remember(value);
  }
  return (
    <section className="fhome-section fedit-material" aria-labelledby="fedit-material-title">
      <div className="fhome-heading">
        <h2 id="fedit-material-title">{ru ? 'Материалы вблизи' : 'Materials up close'}</h2>
      </div>
      <div className="fedit-material-body">
        <div
          className="fedit-samples"
          role="group"
          aria-label={ru ? 'Выбрать материал' : 'Choose a material'}
        >
          {options.map((s) => (
            <button
              type="button"
              key={s.id}
              aria-pressed={s.id === sample.id}
              onClick={() => onSelect({ sampleProduct: s.id })}
            >
              <span aria-hidden="true">
                <img
                  style={{ transformOrigin: s.focus }}
                  src={studioThumbnail(s.product.images[2])}
                  loading="lazy"
                  alt=""
                />
              </span>
              {s.material[lang]}
            </button>
          ))}
        </div>
        <div className="fedit-compare">
          <div
            className="fedit-material-view"
            style={{ '--material-reveal': reveal + '%' } as CSSProperties}
          >
            <img
              className="fedit-detail-photo"
              style={{ transformOrigin: sample.focus }}
              src={studioThumbnail(product.images[2])}
              srcSet={studioSrcSet(product.images[2])}
              sizes="(min-width:1040px) 640px, (min-width:700px) 64vw, 100vw"
              alt=""
              loading="lazy"
            />
            <div className="fedit-object-view">
              <img
                src={studioThumbnail(product.images[0])}
                srcSet={studioSrcSet(product.images[0])}
                sizes="(min-width:1040px) 590px, (min-width:700px) 58vw, 88vw"
                alt=""
                loading="lazy"
              />
            </div>
            <div className="fedit-handle" aria-hidden="true">
              <span>
                <ChevronsLeftRight size={19} />
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={reveal}
              aria-label={ru ? 'Сравнить предмет и фактуру' : 'Compare the piece and its texture'}
              aria-valuetext={
                ru
                  ? 'Предмет ' + reveal + '%, фактура ' + (100 - reveal) + '%'
                  : reveal + '% object, ' + (100 - reveal) + '% texture'
              }
              onChange={(e) => setReveal(e.currentTarget.valueAsNumber)}
              onPointerUp={(e) => remember(e.currentTarget.valueAsNumber)}
              onKeyUp={(e) => remember(e.currentTarget.valueAsNumber)}
              onBlur={(e) => remember(e.currentTarget.valueAsNumber)}
            />
          </div>
          <div className="fedit-view-labels">
            <button type="button" aria-pressed={reveal === 100} onClick={() => endpoint(100)}>
              {ru ? 'Предмет целиком' : 'Full piece'}
            </button>
            <button type="button" aria-pressed={reveal === 0} onClick={() => endpoint(0)}>
              {ru ? 'Фактура' : 'Texture'}
            </button>
          </div>
        </div>
        <div className="fedit-sample-link" aria-live="polite" aria-atomic="true">
          <button
            type="button"
            className="fedit-item-link"
            onClick={() => onOpenProduct(product, 2)}
            aria-label={(ru ? 'Рассмотреть деталь' : 'View detail of') + ' ' + product.name}
          >
            <span>
              <small>{sample.finish[lang]}</small>
              <strong>{product.name}</strong>
            </span>
            <ArrowUpRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
