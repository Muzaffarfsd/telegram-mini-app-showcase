import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ClipboardCopy,
  FileText,
  FolderOpen,
  ImagePlus,
  Link2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from 'react';
import { Back, SampleCard, SectionTitle, type LibraryActions } from './Library';
import {
  categories,
  categoryName,
  local,
  sampleById,
  type Category,
  type Copy,
} from './samples';
import { preparePhoto, validate, type Brief, type SavedBrief } from './records';

export const briefTitle = (b: Brief, ru: boolean) =>
  b.sampleIds
    .map(sampleById)
    .filter((i) => !!i)
    .map((i) => local(i.title, ru))
    .join(' + ') ||
  b.description.trim().slice(0, 90) ||
  (b.url ? new URL(b.url).hostname : ru ? 'Запрос по фото' : 'Photo brief');
const number = (s: string, ru: boolean) =>
  new Intl.NumberFormat(ru ? 'ru-RU' : 'en-GB').format(Number(s));
function ReferenceStrip({
  ids,
  ru,
  open,
  remove,
}: {
  ids: string[];
  ru: boolean;
  open?: (id: string) => void;
  remove?: (id: string) => void;
}) {
  if (!ids.length) return null;
  return (
    <ul
      className="yb-references"
      aria-label={ru ? 'Образцы в запросе' : 'Samples in this brief'}
    >
      {ids.flatMap((id) => {
        const s = sampleById(id);
        if (!s) return [];
        const name = local(s.title, ru);
        return (
          <li key={id}>
            <img src={s.image} alt="" />
            {open ? (
              <button
                type="button"
                className="yb-ref-open"
                onClick={() => open(id)}
              >
                {name}
                <ArrowUpRight size={15} />
              </button>
            ) : (
              <strong>{name}</strong>
            )}
            {remove && (
              <button
                type="button"
                aria-label={(ru ? 'Убрать ' : 'Remove ') + name}
                onClick={() => remove(id)}
              >
                <X size={16} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
export function BriefEditor({
  ru,
  initial,
  mode,
  fileInput,
  onUpdate,
  onReview,
  back,
}: {
  ru: boolean;
  initial: Brief;
  mode: 'photo' | 'link' | 'any';
  fileInput: RefObject<HTMLInputElement | null>;
  onUpdate: (b: Brief) => void;
  onReview: (b: Brief) => void;
  back: () => void;
}) {
  const [fields, setFields] = useState(initial);
  const current = useRef(fields);
  const [error, setError] = useState<Copy>();
  const [fileError, setFileError] = useState(false);
  const [busy, setBusy] = useState(false);
  const url = useRef<HTMLInputElement>(null);
  const serial = useRef(0);
  const errorRef = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  useEffect(() => {
    if (mode === 'link') url.current?.focus({ preventScroll: true });
    return () => {
      serial.current++;
    };
  }, [mode]);
  function update(patch: Partial<Brief>) {
    const next = { ...current.current, ...patch };
    current.current = next;
    setFields(next);
    onUpdate(next);
    setError(undefined);
  }
  async function upload(file?: File) {
    if (!file) return;
    const ticket = ++serial.current;
    setBusy(true);
    setFileError(false);
    try {
      const photo = await preparePhoto(file);
      if (ticket === serial.current) update({ photo });
    } catch {
      if (ticket === serial.current) setFileError(true);
    } finally {
      if (ticket === serial.current) setBusy(false);
    }
  }
  function review(e: FormEvent) {
    e.preventDefault();
    const issue = validate(current.current);
    if (issue) {
      setError(issue);
      return;
    }
    onReview(current.current);
  }
  return (
    <section className="yb-form-page">
      <Back ru={ru} action={back} />
      <h1>{ru ? 'Запрос байеру' : 'Sourcing brief'}</h1>
      <form className="yb-form" onSubmit={review} noValidate>
        <div className="yb-form-col">
          <h2>{ru ? 'Что нужно найти?' : 'What should we find?'}</h2>
          <ReferenceStrip
            ids={fields.sampleIds}
            ru={ru}
            remove={(id) =>
              update({ sampleIds: fields.sampleIds.filter((x) => x !== id) })
            }
          />
          <div className={'yb-upload' + (fields.photo ? ' has-photo' : '')}>
            {fields.photo && (
              <img
                src={fields.photo}
                alt={ru ? 'Прикреплённое фото' : 'Attached photo'}
              />
            )}
            <button
              type="button"
              className="yb-upload-action"
              onClick={() => fileInput.current?.click()}
            >
              <ImagePlus size={23} />
              <span>
                <b>
                  {busy
                    ? ru
                      ? 'Обрабатываем фото…'
                      : 'Preparing photo…'
                    : fields.photo
                      ? ru
                        ? 'Заменить фото'
                        : 'Replace photo'
                      : ru
                        ? 'Добавить фото'
                        : 'Add a photo'}
                </b>
                <small>
                  JPG, PNG, WebP · {ru ? 'до 10 МБ' : 'up to 10 MB'}
                </small>
              </span>
            </button>
            {fields.photo && (
              <button
                aria-label={ru ? 'Удалить фото' : 'Remove photo'}
                className="yb-icon"
                type="button"
                onClick={() => {
                  serial.current++;
                  setBusy(false);
                  setFileError(false);
                  update({ photo: '' });
                }}
              >
                <X size={18} />
              </button>
            )}
            <input
              ref={fileInput}
              data-testid="buyer-photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                void upload(file);
              }}
            />
          </div>
          {fileError && (
            <p role="alert" className="yb-error">
              {ru
                ? 'Не удалось открыть файл. Выберите JPG, PNG или WebP до 10 МБ.'
                : 'Could not open this file. Choose a JPG, PNG or WebP up to 10 MB.'}
            </p>
          )}
          <label className="yb-field">
            <span>
              <Link2 size={16} />
              {ru ? 'Ссылка на вещь' : 'Product link'}
            </span>
            <input
              id="cbw-url"
              ref={url}
              type="url"
              dir="ltr"
              maxLength={500}
              value={fields.url}
              placeholder="https://"
              onChange={(e) => update({ url: e.target.value })}
            />
          </label>
          <label className="yb-field">
            <span>
              {ru ? 'Описание и пожелания' : 'Description and preferences'}
            </span>
            <textarea
              id="cbw-description"
              rows={3}
              maxLength={800}
              value={fields.description}
              placeholder={
                ru
                  ? 'Какие детали, материал или форма вам важны?'
                  : 'Which details, materials or shapes matter to you?'
              }
              onChange={(e) => update({ description: e.target.value })}
            />
          </label>
        </div>
        <div className="yb-form-col">
          <h2>{ru ? 'Параметры поиска' : 'Search details'}</h2>
          <label className="yb-field">
            <span>{ru ? 'Категория' : 'Category'}</span>
            <select
              value={fields.category}
              onChange={(e) => update({ category: e.target.value as Category })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryName(c, ru)}
                </option>
              ))}
            </select>
          </label>
          <div className="yb-field-pair">
            <label className="yb-field">
              <span>{ru ? 'Размер' : 'Size'}</span>
              <input
                id="cbw-size"
                maxLength={80}
                value={fields.size}
                onChange={(e) => update({ size: e.target.value })}
              />
            </label>
            <label className="yb-field">
              <span>{ru ? 'Цвет' : 'Colour'}</span>
              <input
                id="cbw-color"
                maxLength={80}
                value={fields.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </label>
          </div>
          <div className="yb-field-pair">
            <label className="yb-field">
              <span>{ru ? 'Количество' : 'Quantity'}</span>
              <input
                id="cbw-quantity"
                inputMode="numeric"
                maxLength={3}
                value={fields.quantity}
                onChange={(e) => update({ quantity: e.target.value })}
              />
            </label>
            <label className="yb-field">
              <span>{ru ? 'Бюджет, ₽' : 'Budget, ₽'}</span>
              <input
                id="cbw-budget"
                inputMode="numeric"
                maxLength={9}
                value={fields.budget}
                placeholder={ru ? 'По желанию' : 'Optional'}
                onChange={(e) => update({ budget: e.target.value })}
              />
            </label>
          </div>
          {error && (
            <p ref={errorRef} tabIndex={-1} role="alert" className="yb-error">
              {local(error, ru)}
            </p>
          )}
          <button type="submit" className="yb-primary yb-wide" disabled={busy}>
            {ru ? 'Проверить запрос' : 'Review brief'}
            <ArrowRight size={18} />
          </button>
          <p className="yb-note">
            {ru
              ? 'Запрос и фото сохраняются на вашем устройстве.'
              : 'Your brief and photo are stored on this device.'}
          </p>
        </div>
      </form>
    </section>
  );
}
function BriefFacts({
  b,
  ru,
  open,
}: {
  b: Brief;
  ru: boolean;
  open: (id: string) => void;
}) {
  const rows = [
    [ru ? 'Категория' : 'Category', categoryName(b.category, ru)],
    [ru ? 'Размер' : 'Size', b.size],
    [ru ? 'Цвет' : 'Colour', b.color],
    [ru ? 'Количество' : 'Quantity', b.quantity],
    [ru ? 'Бюджет' : 'Budget', b.budget ? number(b.budget, ru) + ' ₽' : ''],
  ];
  return (
    <div className="yb-brief-facts">
      <ReferenceStrip ids={b.sampleIds} ru={ru} open={open} />
      {b.photo && (
        <img
          className="yb-attachment"
          src={b.photo}
          alt={ru ? 'Фото к запросу' : 'Brief attachment'}
        />
      )}
      {b.description && <p className="yb-description">{b.description}</p>}
      {b.url && (
        <a
          className="yb-source"
          href={b.url.trim()}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Link2 size={16} />
          {new URL(b.url.trim()).hostname}
          <ArrowUpRight size={15} />
        </a>
      )}
      <dl className="yb-dl">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
    </div>
  );
}
export function Review({
  b,
  ru,
  open,
  edit,
  save,
  error,
}: {
  b: Brief;
  ru: boolean;
  open: (id: string) => void;
  edit: () => void;
  save: () => void;
  error?: Copy;
}) {
  return (
    <section className="yb-narrow">
      <Back ru={ru} action={edit} />
      <h1>{ru ? 'Проверка запроса' : 'Review your brief'}</h1>
      <BriefFacts b={b} ru={ru} open={open} />
      {error && (
        <p role="alert" className="yb-error">
          {local(error, ru)}
        </p>
      )}
      <div className="yb-flow-actions">
        <button type="button" className="yb-primary" onClick={save}>
          {ru ? 'Сохранить запрос' : 'Save brief'}
          <Check size={18} />
        </button>
        <button type="button" className="yb-secondary" onClick={edit}>
          <Pencil size={16} />
          {ru ? 'Редактировать' : 'Edit'}
        </button>
      </div>
      <p className="yb-note">
        {ru
          ? 'После сохранения запрос можно открыть в разделе «Моё».'
          : 'After saving, find this brief in My desk.'}
      </p>
    </section>
  );
}
export function SavedView({
  b,
  ru,
  open,
  back,
  edit,
  remove,
  temporary,
}: {
  b: SavedBrief;
  ru: boolean;
  open: (id: string) => void;
  back: () => void;
  edit: () => void;
  remove: () => void;
  temporary: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  const [copied, setCopied] = useState<'none' | 'yes' | 'manual'>('none');
  const text = [
    briefTitle(b, ru),
    categoryName(b.category, ru),
    b.description,
    b.url,
    b.size && (ru ? 'Размер ' : 'Size ') + b.size,
    b.color && (ru ? 'Цвет ' : 'Colour ') + b.color,
    (ru ? 'Количество ' : 'Quantity ') + b.quantity,
    b.budget && (ru ? 'Бюджет ' : 'Budget ') + number(b.budget, ru) + ' ₽',
  ].filter(Boolean);
  const copy = Array.from(new Set(text)).join('\n');
  async function copyText() {
    try {
      await navigator.clipboard.writeText(copy);
      setCopied('yes');
    } catch {
      setCopied('manual');
    }
  }
  return (
    <section className="yb-narrow">
      <Back ru={ru} action={back} />
      <div className="yb-saved-label">
        <Check size={15} />
        {temporary
          ? ru
            ? 'В этой сессии'
            : 'This session'
          : ru
            ? 'Сохранено на устройстве'
            : 'Saved on this device'}
      </div>
      <h1>{briefTitle(b, ru)}</h1>
      <BriefFacts b={b} ru={ru} open={open} />
      <div className="yb-flow-actions">
        <button type="button" className="yb-primary" onClick={edit}>
          <Pencil size={17} />
          {ru ? 'Редактировать' : 'Edit brief'}
        </button>
        <button type="button" className="yb-secondary" onClick={copyText}>
          <ClipboardCopy size={17} />
          {copied === 'yes'
            ? ru
              ? 'Текст скопирован'
              : 'Text copied'
            : ru
              ? 'Скопировать текст'
              : 'Copy brief text'}
        </button>
      </div>
      {copied === 'manual' && (
        <label className="yb-field">
          <span>
            {ru ? 'Выделите и скопируйте текст' : 'Select and copy the text'}
          </span>
          <textarea
            readOnly
            value={copy}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
      )}
      {confirm ? (
        <div
          className="yb-confirm"
          role="group"
          aria-label={ru ? 'Удаление запроса' : 'Delete brief'}
        >
          <strong>{ru ? 'Удалить этот запрос?' : 'Delete this brief?'}</strong>
          <div>
            <button
              type="button"
              className="yb-secondary"
              onClick={() => setConfirm(false)}
            >
              {ru ? 'Отмена' : 'Cancel'}
            </button>
            <button type="button" className="yb-dark" onClick={remove}>
              {ru ? 'Удалить' : 'Delete'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="yb-delete"
          onClick={() => setConfirm(true)}
        >
          <Trash2 size={16} />
          {ru ? 'Удалить запрос' : 'Delete brief'}
        </button>
      )}
    </section>
  );
}
export function Desk({
  actions,
  records,
  view,
  tab,
  change,
  begin,
  library,
  compare,
}: {
  actions: LibraryActions;
  records: SavedBrief[];
  view: (id: string) => void;
  tab: 'briefs' | 'saved';
  change: (t: 'briefs' | 'saved') => void;
  begin: () => void;
  library: () => void;
  compare: () => void;
}) {
  const { ru, favorites, selection } = actions;
  return (
    <section>
      <div className="yb-page-title">
        <h1>{ru ? 'Моё бюро' : 'My desk'}</h1>
        <button
          type="button"
          className="yb-round"
          aria-label={ru ? 'Новый запрос' : 'New brief'}
          onClick={begin}
        >
          <Plus />
        </button>
      </div>
      <div className="yb-desk-tabs">
        {(['briefs', 'saved'] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => change(t)}
          >
            {t === 'briefs' ? <FileText size={17} /> : <Bookmark size={17} />}{' '}
            {t === 'briefs'
              ? ru
                ? 'Запросы'
                : 'Briefs'
              : ru
                ? 'Избранное'
                : 'Saved'}{' '}
            <span>{t === 'briefs' ? records.length : favorites.length}</span>
          </button>
        ))}
      </div>
      {tab === 'briefs' ? (
        records.length ? (
          <ul className="yb-records">
            {records.map((b) => (
              <li key={b.id}>
                <button type="button" onClick={() => view(b.id)}>
                  {b.photo || b.sampleIds.length ? (
                    <img
                      src={b.photo || sampleById(b.sampleIds[0])?.image}
                      alt=""
                    />
                  ) : (
                    <span className="yb-file-icon">
                      <FileText size={23} />
                    </span>
                  )}
                  <span>
                    <small>
                      {new Date(b.updatedAt).toLocaleDateString(
                        ru ? 'ru-RU' : 'en-GB',
                        { day: 'numeric', month: 'short', year: 'numeric' },
                      )}
                    </small>
                    <b>{briefTitle(b, ru)}</b>
                  </span>
                  <ArrowUpRight size={20} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="yb-empty">
            <FolderOpen />
            <h2>{ru ? 'Здесь будут ваши запросы' : 'Your briefs live here'}</h2>
            <p>
              {ru
                ? 'Начните с фотографии, ссылки или образца из библиотеки.'
                : 'Start with a photo, a link or a library sample.'}
            </p>
            <button type="button" className="yb-primary" onClick={begin}>
              {ru ? 'Новый запрос' : 'New brief'}
              <Plus size={17} />
            </button>
          </div>
        )
      ) : favorites.length ? (
        <div className="yb-grid">
          {favorites.flatMap((id) => {
            const item = sampleById(id);
            return item ? (
              <SampleCard key={id} item={item} actions={actions} />
            ) : (
              []
            );
          })}
        </div>
      ) : (
        <div className="yb-empty">
          <Bookmark />
          <h2>{ru ? 'Сохраните первый образец' : 'Save your first sample'}</h2>
          <button type="button" className="yb-secondary" onClick={library}>
            {ru ? 'Открыть библиотеку' : 'Browse library'}
            <ArrowRight size={17} />
          </button>
        </div>
      )}
      {selection.length > 0 && (
        <div className="yb-section">
          <SectionTitle
            title={ru ? 'На сравнении' : 'Comparison tray'}
            action={compare}
            label={ru ? 'Открыть' : 'Open'}
          />
          <ReferenceStrip ids={selection} ru={ru} open={actions.open} />
        </div>
      )}
    </section>
  );
}
