import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Expand,
  ImagePlus,
  Layers2,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGalleryPan } from '../useGalleryPan';
import {
  Back,
  SampleCard,
  SamplePhoto,
  SectionTitle,
  type LibraryActions,
} from './Library';
import {
  askOf,
  categoryName,
  largeImage,
  local,
  materialOf,
  sampleById,
  samples,
  type Sample,
} from './samples';

export function SampleDetail({
  item,
  actions,
  begin,
  back,
}: {
  item: Sample;
  actions: LibraryActions;
  begin: (ids: string[]) => void;
  back: () => void;
}) {
  const { ru, selection, select, favorites, favorite, compare } = actions;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const zoomFrame = useRef<HTMLButtonElement>(null);
  const pictures = [largeImage(item), ...(item.gallery ?? [])];
  const name = local(item.title, ru);
  const pan = useGalleryPan(zoom, zoomFrame, 1.8, pictures[index]);
  const seen = selection.includes(item.id),
    saved = favorites.includes(item.id);
  const label = (i: number) =>
    i === 0
      ? ru
        ? 'Общий вид'
        : 'Full view'
      : item.feature
        ? ru
          ? 'Фактура'
          : 'Texture'
        : ru
          ? 'Фото ' + (i + 1)
          : 'View ' + (i + 1);
  function enlarge() {
    setZoom(false);
    dialog.current?.showModal();
  }
  function step(delta: number) {
    setZoom(false);
    setIndex((i) => (i + delta + pictures.length) % pictures.length);
  }
  useEffect(() => {
    const el = dialog.current;
    return () => el?.close();
  }, []);
  return (
    <section>
      <Back ru={ru} action={back} />
      <div className="yb-detail">
        <div className="yb-gallery">
          <button
            ref={zoomButton}
            type="button"
            className="yb-detail-picture"
            aria-label={ru ? 'Рассмотреть фото' : 'Inspect photo'}
            onClick={enlarge}
          >
            <img
              src={pictures[index]}
              alt={name + ' · ' + label(index)}
              fetchPriority="high"
            />
            <span>
              <Expand size={19} />
            </span>
          </button>
          {pictures.length > 1 && (
            <div
              className="yb-thumbs"
              aria-label={ru ? 'Фотографии' : 'Photographs'}
            >
              {pictures.map((url, i) => (
                <button
                  key={url}
                  aria-label={label(i)}
                  aria-pressed={i === index}
                  type="button"
                  onClick={() => setIndex(i)}
                >
                  <img src={i === 0 ? item.image : url} alt="" />
                </button>
              ))}
              <span>{label(index)}</span>
            </div>
          )}
        </div>
        <div className="yb-detail-copy">
          <small>{categoryName(item.category, ru)}</small>
          <h1>{name}</h1>
          <p className="yb-lead-text">{local(item.shape, ru)}.</p>
          <button
            type="button"
            className="yb-primary yb-wide"
            onClick={() => begin([item.id])}
          >
            {ru ? 'Найти похожее' : 'Source something similar'}
            <ArrowRight size={18} />
          </button>
          <div className="yb-duo">
            <button
              className="yb-secondary"
              type="button"
              aria-pressed={saved}
              onClick={() => favorite(item.id)}
            >
              <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
              {ru ? 'Избранное' : 'Saved'}
            </button>
            <button
              className="yb-secondary"
              type="button"
              aria-pressed={seen}
              onClick={() => select(item.id)}
            >
              {seen ? <Check size={17} /> : <Columns2 size={17} />}{' '}
              {ru ? 'Сравнить' : 'Compare'}
            </button>
          </div>
          {selection.length > 0 && (
            <button className="yb-text-button" type="button" onClick={compare}>
              {ru ? 'Открыть сравнение' : 'Open comparison'} ({selection.length}
              )<ArrowUpRight size={16} />
            </button>
          )}
          <dl className="yb-dl">
            <div>
              <dt>{ru ? 'Фактура' : 'Surface'}</dt>
              <dd>{materialOf(item, ru)}</dd>
            </div>
            <div>
              <dt>{ru ? 'Уточнить у байера' : 'Ask the buyer'}</dt>
              <dd>{askOf(item, ru)}</dd>
            </div>
          </dl>
          <p className="yb-note">
            {ru
              ? 'Образец задаёт направление поиска. Наличие, состав и цену уточняет байер.'
              : 'A visual reference for sourcing. Your buyer can confirm availability, composition and price.'}
          </p>
        </div>
      </div>
      <section className="yb-section">
        <SectionTitle
          title={ru ? 'Из той же категории' : 'In the same category'}
        />
        <div className="yb-related">
          {samples
            .filter((s) => s.category === item.category && s.id !== item.id)
            .slice(0, 3)
            .map((s) => (
              <SampleCard key={s.id} item={s} actions={actions} />
            ))}
        </div>
      </section>
      <dialog
        className="yb-lightbox"
        ref={dialog}
        aria-label={ru ? 'Просмотр фотографии' : 'Photo viewer'}
        onClose={() => {
          setZoom(false);
          zoomButton.current?.focus({ preventScroll: true });
        }}
        onKeyDown={(e) => {
          if (
            !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
          )
            return;
          e.preventDefault();
          if (zoom) pan.onArrow(e.key);
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
            step(e.key === 'ArrowRight' ? 1 : -1);
        }}
      >
        <div className="yb-modal-top">
          <strong>{name}</strong>
          <button
            type="button"
            autoFocus
            aria-label={ru ? 'Закрыть фото' : 'Close photo'}
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
        </div>
        <button
          type="button"
          ref={zoomFrame}
          className="yb-zoom-frame"
          data-zoom={zoom}
          aria-label={
            zoom
              ? ru
                ? 'Уменьшить'
                : 'Zoom out'
              : ru
                ? 'Увеличить'
                : 'Zoom in'
          }
          onClick={() => {
            if (!pan.consumeClick()) setZoom(!zoom);
          }}
          onPointerDown={pan.onPointerDown}
          onPointerMove={pan.onPointerMove}
          onPointerUp={pan.onPointerUp}
          onPointerCancel={pan.onPointerCancel}
        >
          <img
            src={pictures[index]}
            alt={name}
            draggable={false}
            style={{
              scale: zoom ? '1.8' : '1',
              translate: zoom
                ? pan.offset.x + 'px ' + pan.offset.y + 'px'
                : '0 0',
            }}
          />
        </button>
        <div className="yb-modal-foot">
          <button
            type="button"
            disabled={pictures.length < 2}
            onClick={() => step(-1)}
            aria-label={ru ? 'Предыдущее фото' : 'Previous photo'}
          >
            <ChevronLeft />
          </button>
          <span>
            {label(index)} · {index + 1} / {pictures.length}
          </span>
          <button
            type="button"
            disabled={pictures.length < 2}
            onClick={() => step(1)}
            aria-label={ru ? 'Следующее фото' : 'Next photo'}
          >
            <ChevronRight />
          </button>
          <button
            type="button"
            aria-label={ru ? 'Масштаб' : 'Magnification'}
            aria-pressed={zoom}
            onClick={() => setZoom(!zoom)}
          >
            {zoom ? <Minus /> : <Plus />}
          </button>
        </div>
      </dialog>
    </section>
  );
}
export function Compare({
  actions,
  back,
  library,
  begin,
}: {
  actions: LibraryActions;
  back: () => void;
  library: () => void;
  begin: (ids: string[]) => void;
}) {
  const { ru, selection, select, open } = actions;
  const items = selection.flatMap((id) => sampleById(id) ?? []);
  return (
    <section>
      <Back ru={ru} action={back} />
      <div className="yb-page-title">
        <h1>{ru ? 'Сравнение' : 'Compare'}</h1>
        <span className="yb-count">{items.length} / 3</span>
      </div>
      {!items.length ? (
        <div className="yb-empty">
          <Columns2 />
          <h2>
            {ru
              ? 'Какие вещи сравним?'
              : 'Which samples would you like to compare?'}
          </h2>
          <p>
            {ru
              ? 'Выберите до трёх образцов в библиотеке.'
              : 'Pick up to three samples from the library.'}
          </p>
          <button type="button" className="yb-primary" onClick={library}>
            {ru ? 'Выбрать образцы' : 'Choose samples'}
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <>
          <div
            className="yb-comparison"
            tabIndex={items.length === 3 ? 0 : undefined}
            role="region"
            aria-label={ru ? 'Таблица сравнения' : 'Sample comparison'}
          >
            <table>
              <thead>
                <tr>
                  {items.map((s) => (
                    <th key={s.id} scope="col">
                      <div>
                        <button
                          type="button"
                          className="yb-image-link"
                          onClick={() => open(s.id)}
                        >
                          <SamplePhoto
                            item={s}
                            alt={local(s.title, ru)}
                            priority
                          />
                        </button>
                        <button
                          type="button"
                          className="yb-remove"
                          onClick={() => select(s.id)}
                          aria-label={
                            (ru ? 'Убрать ' : 'Remove ') + local(s.title, ru)
                          }
                        >
                          <X size={15} />
                        </button>
                      </div>
                      {local(s.title, ru)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    [
                      ru ? 'Категория' : 'Category',
                      (s: Sample) => categoryName(s.category, ru),
                    ],
                    [ru ? 'Форма' : 'Form', (s: Sample) => local(s.shape, ru)],
                    [
                      ru ? 'Фактура' : 'Surface',
                      (s: Sample) => materialOf(s, ru),
                    ],
                    [
                      ru ? 'Что уточнить' : 'What to ask',
                      (s: Sample) => askOf(s, ru),
                    ],
                  ] as const
                ).map(([title, value]) => (
                  <tr key={title}>
                    {items.map((s) => (
                      <td key={s.id}>
                        <small>{title}</small>
                        {value(s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="yb-flow-actions">
            <button
              type="button"
              className="yb-primary"
              onClick={() => begin(selection)}
            >
              {ru ? 'Собрать один запрос' : 'Create one brief'}
              <ArrowRight size={17} />
            </button>
            {items.length < 3 && (
              <button type="button" className="yb-secondary" onClick={library}>
                <Plus size={16} />
                {ru ? 'Добавить образец' : 'Add a sample'}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
export function Guide({
  ru,
  back,
  begin,
  library,
}: {
  ru: boolean;
  back: () => void;
  begin: () => void;
  library: () => void;
}) {
  return (
    <section className="yb-guide">
      <Back ru={ru} action={back} />
      <h1>{ru ? 'Как собрать запрос' : 'Preparing a brief'}</h1>
      <div className="yb-guide-layout">
        <SamplePhoto
          item={samples[2]}
          priority
          alt={ru ? 'Чайник и пиала из терракоты' : 'Terracotta teapot and cup'}
        />
        <div>
          {(
            [
              [
                ImagePlus,
                ru ? 'Покажите предмет' : 'Show the object',
                ru
                  ? 'Подойдёт снимок с телефона, скриншот или ссылка на конкретную вещь. Для поиска по форме лучше всего вид сбоку.'
                  : 'Use a phone photo, a screenshot or a link to the item. A side view helps communicate its shape.',
              ],
              [
                Layers2,
                ru ? 'Отметьте важные детали' : 'Pick the details that matter',
                ru
                  ? 'У одной сумки вам может нравиться ремень, у другой — фактура. Добавьте обе в сравнение и запишите пожелания в одном запросе.'
                  : 'You might like the strap of one bag and the surface of another. Compare both, then put those details in a single brief.',
              ],
              [
                Check,
                ru ? 'Проверьте условия' : 'Check the requirements',
                ru
                  ? 'Укажите размер, количество и бюджет. Сохранённый запрос можно открыть и изменить в разделе «Моё».'
                  : 'Add your size, quantity and budget. Open and edit your saved brief in My desk.',
              ],
            ] as const
          ).map(([Mark, title, copy]) => (
            <article key={title}>
              <Mark size={21} />
              <div>
                <h2>{title}</h2>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="yb-flow-actions">
        <button className="yb-primary" type="button" onClick={begin}>
          {ru ? 'Начать запрос' : 'Start a brief'}
          <ArrowRight size={17} />
        </button>
        <button className="yb-secondary" type="button" onClick={library}>
          {ru ? 'Посмотреть образцы' : 'Browse samples'}
        </button>
      </div>
    </section>
  );
}
