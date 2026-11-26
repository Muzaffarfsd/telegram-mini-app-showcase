import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Star } from 'lucide-react';

type Review = { id: string; name: string; text: string; rating: number; date: string };
const stars = [1, 2, 3, 4, 5];

function readReviews(prefix: string): Review[] {
  const reviews: Review[] = [];
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(prefix)) continue;
    try {
      const r = JSON.parse(localStorage.getItem(key) || 'null');
      if (
        r &&
        r.id === key.slice(prefix.length) &&
        typeof r.name === 'string' &&
        r.name.trim().length >= 2 &&
        r.name.length <= 40 &&
        typeof r.text === 'string' &&
        r.text.trim().length >= 10 &&
        r.text.length <= 600 &&
        stars.includes(r.rating) &&
        typeof r.date === 'string' &&
        Number.isFinite(Date.parse(r.date))
      )
        reviews.push(r);
    } catch {
      /* A damaged entry does not hide other reviews. */
    }
  }
  return reviews.sort((a, b) => b.date.localeCompare(a.date));
}

export default function FurnitureReviews({ productId, ru }: { productId: string; ru: boolean }) {
  const t = (r: string, e: string) => (ru ? r : e);
  const prefix = 'web4tg-furniture-review:v1:' + encodeURIComponent(productId) + ':';
  const [reviews, setReviews] = useState<Review[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(0);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const nameField = useRef<HTMLInputElement>(null);
  const formId = useId();
  useEffect(() => {
    function refresh() {
      try {
        setReviews(readReviews(prefix));
        setUnavailable(false);
      } catch {
        setUnavailable(true);
      }
    }
    function onStorage(e: StorageEvent) {
      if (e.key === null || e.key.startsWith(prefix)) refresh();
    }
    refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [prefix]);
  useEffect(() => {
    if (formOpen) nameField.current?.focus({ preventScroll: true });
  }, [formOpen]);

  function close() {
    setFormOpen(false);
    setError('');
    trigger.current?.focus({ preventScroll: true });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2 || body.trim().length < 10 || !stars.includes(rating)) {
      setError(
        t(
          'Укажите имя, выберите оценку и напишите хотя бы 10 символов.',
          'Add a name, choose a rating and write at least 10 characters.'
        )
      );
      return;
    }
    const id =
      globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
    const review: Review = {
      id,
      name: name.trim(),
      text: body.trim(),
      rating,
      date: new Date().toISOString(),
    };
    try {
      localStorage.setItem(prefix + id, JSON.stringify(review));
      setReviews(readReviews(prefix));
      setUnavailable(false);
    } catch {
      setError(
        t(
          'Не удалось сохранить отзыв. Текст остался в форме, можно повторить.',
          'Your review could not be saved. Your text is still here to try again.'
        )
      );
      return;
    }
    close();
    setSaved(true);
    setName('');
    setBody('');
    setRating(0);
  }
  const score = reviews.length
    ? new Intl.NumberFormat(ru ? 'ru' : 'en', { maximumFractionDigits: 1 }).format(
        reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
      )
    : '';
  return (
    <section className="fs-reviews" aria-labelledby="fs-review-title">
      <div className="fs-review-heading">
        <h2 tabIndex={-1} id="fs-review-title">
          {t('Отзывы', 'Reviews')}
        </h2>
        {reviews.length > 0 && (
          <span aria-label={t('Средняя оценка', 'Average rating') + ' ' + score + ' / 5'}>
            <Star size={15} fill="currentColor" />
            {score} <small>({reviews.length})</small>
          </span>
        )}
      </div>
      {!reviews.length && (
        <p className="fs-review-empty">
          {unavailable
            ? t('Не удалось прочитать сохранённые отзывы.', 'Saved reviews could not be read.')
            : t('У этой модели пока нет отзывов.', 'This piece has no reviews yet.')}
        </p>
      )}
      <p className="fs-review-local">
        {t(
          'В демо отзывы видны только на этом устройстве.',
          'In this demo, reviews are visible only on this device.'
        )}
      </p>
      {saved && <p role="status">{t('Ваш отзыв сохранён.', 'Your review has been saved.')}</p>}
      {reviews.length > 0 && (
        <div className="fs-review-list">
          {(showAll ? reviews : reviews.slice(0, 3)).map((r) => (
            <article key={r.id}>
              <div>
                <strong>{r.name}</strong>
                <time dateTime={r.date}>
                  {new Intl.DateTimeFormat(ru ? 'ru' : 'en', { dateStyle: 'medium' }).format(
                    new Date(r.date)
                  )}
                </time>
              </div>
              <div
                className="fs-review-stars"
                role="img"
                aria-label={t('Оценка', 'Rating') + ' ' + r.rating + ' / 5'}
              >
                {stars.map((n) => (
                  <Star
                    key={n}
                    aria-hidden="true"
                    size={13}
                    fill={n <= r.rating ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <p>{r.text}</p>
            </article>
          ))}
        </div>
      )}
      {reviews.length > 3 && (
        <button className="fs-review-link" onClick={() => setShowAll(!showAll)}>
          {showAll
            ? t('Свернуть', 'Show less')
            : t('Все отзывы', 'All reviews') + ' (' + reviews.length + ')'}
        </button>
      )}
      <button
        ref={trigger}
        className="fs-review-link"
        aria-controls={formId}
        aria-expanded={formOpen}
        onClick={() => {
          if (formOpen) close();
          else {
            setFormOpen(true);
            setSaved(false);
          }
        }}
      >
        {t('Написать отзыв', 'Write a review')}
        <ArrowUpRight size={16} />
      </button>
      {formOpen && (
        <form id={formId} className="fs-review-form" onSubmit={submit}>
          <label>
            {t('Имя', 'Name')}
            <input
              ref={nameField}
              aria-label={t('Имя', 'Name')}
              required
              minLength={2}
              maxLength={40}
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <fieldset>
            <legend>{t('Ваша оценка', 'Your rating')}</legend>
            <div className="fs-star-input">
              {stars.map((n) => (
                <label key={n}>
                  <input
                    type="radio"
                    name={formId + '-rating'}
                    aria-label={n + ' / 5'}
                    required
                    checked={rating === n}
                    onChange={() => setRating(n)}
                  />
                  <Star
                    aria-hidden="true"
                    size={23}
                    fill={n <= rating ? 'currentColor' : 'none'}
                    strokeWidth={1.5}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            {t('Ваш отзыв', 'Your review')}
            <textarea
              aria-label={t('Ваш отзыв', 'Your review')}
              required
              minLength={10}
              maxLength={600}
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('Что вы думаете об этой модели?', 'What do you think of this piece?')}
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <div>
            <button className="fs-primary" type="submit">
              {t('Сохранить отзыв', 'Save review')}
            </button>
            <button type="button" className="fs-review-link" onClick={close}>
              {t('Отмена', 'Cancel')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
