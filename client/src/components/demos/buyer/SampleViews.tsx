import {
  ArrowRight,
  ArrowUpRight,
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
import { InkArt, InkHeading } from './InkJourney';
import {
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
  shotName,
  samples,
  type Sample,
} from './samples';

export function SampleDetail({
  item,
  actions,
  begin,
}: {
  item: Sample;
  actions: LibraryActions;
  begin: (ids: string[]) => void;
}) {
  const { ru, selection, select, compare } = actions;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const zoomFrame = useRef<HTMLButtonElement>(null);
  const pictures = [largeImage(item), ...(item.gallery ?? [])];
  const name = local(item.title, ru);
  const pan = useGalleryPan(zoom, zoomFrame, 1.8, pictures[index]);
  const seen = selection.includes(item.id);
  const label = (index: number) => shotName(item, index, ru);
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
      <div className="yb-detail">
        <div className="yb-product-intro">
          <small>{categoryName(item.category, ru)}</small>
          <h1>{name}</h1>
          <p className="yb-lead-text">{local(item.shape, ru)}.</p>
        </div>
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
          <button
            type="button"
            className="yb-primary yb-wide"
            onClick={() => begin([item.id])}
          >
            {ru ? 'Найти похожее' : 'Source something similar'}
            <ArrowRight size={18} />
          </button>
          <div className="yb-detail-tools">
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
  library,
  begin,
}: {
  actions: LibraryActions;
  library: () => void;
  begin: (ids: string[]) => void;
}) {
  const { ru, selection, select, open } = actions;
  const items = selection.flatMap((id) => sampleById(id) ?? []);
  return (
    <section>
      <InkHeading mark="图鉴" title={ru ? 'Сравнение' : 'Compare'}>
        <span className="yb-count">{items.length} / 3</span>
      </InkHeading>
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
  begin,
  library,
}: {
  ru: boolean;
  begin: () => void;
  library: () => void;
}) {
  return (
    <section className="yb-guide">
      <InkHeading
        mark="指南"
        title={ru ? 'Что делает байер' : 'What your buyer does'}
      />
      <div className="yb-guide-layout">
        <div className="yb-guide-poster">
          <InkArt
            name="river"
            eager
            alt={
              ru
                ? 'Лодка с посылками у речной пристани'
                : 'A boat carrying parcels near a river wharf'
            }
          />
          <button type="button" onClick={begin}>
            <span>{ru ? 'Начать запрос' : 'Start a brief'}</span>
            <ArrowRight size={19} />
          </button>
        </div>
        <div>
          {(
            [
              [
                ImagePlus,
                ru ? 'Вы показываете товар' : 'You show the product',
                ru
                  ? 'Добавьте фото, ссылку или описание. Укажите количество, страну и город. В приложении получится сообщение, которое можно передать своему байеру.'
                  : 'Add a photo, link or description, then the quantity, country and city. The app prepares a message you can send to your buyer.',
              ],
              [
                Layers2,
                ru ? 'Байер находит поставщика' : 'Your buyer finds suppliers',
                ru
                  ? 'Байер в Китае уточняет цену, минимальную партию, качество образца и сроки. Попросите отдельно показать стоимость товара, услуги и доставку. Полученные предложения можно сравнить в запросе.'
                  : 'Your buyer checks the price, minimum order, sample quality and timing. Ask for itemised goods, fees and shipping, then compare the offers in your brief.',
              ],
              [
                Check,
                ru ? 'Вы согласуете выкуп' : 'You approve the purchase',
                ru
                  ? 'После вашего согласия байер выкупает товар, сверяет партию с образцом и передаёт её согласованному перевозчику. Условия оплаты, проверки и доставки вы обсуждаете с байером в своём чате.'
                  : 'Once you agree the terms, your buyer purchases the goods, checks the batch against the sample and hands it to the agreed carrier. Arrange payment, inspection and delivery directly with your buyer.',
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
        <button className="yb-secondary" type="button" onClick={library}>
          {ru ? 'Посмотреть образцы' : 'Browse samples'}
        </button>
      </div>
    </section>
  );
}
